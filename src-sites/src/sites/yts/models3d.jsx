import React, { useMemo } from 'react'
import * as THREE from 'three'
import { mergeGeometries, toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

/* ───────────────────────────────────────────────────────────────────────────
   YTS — architectural study maquettes (model-shop style).
   Each model: origin at base centre, sits on y=0, fits ~1.6³, own basswood plate.
   Geometry is built once (module cache) and merged per material → ≤4 draw calls
   per model. Materials are shared singletons.

   API
     <MaquetteTerraces {...groupProps} />  <MaquetteTower/>  <MaquetteCurve/>  <MaquettePalazzo/>
     MAQUETTES            — [Terraces, Tower, Curve, Palazzo]
     MAQUETTE_META        — [{ key, size:[w,h,d] }]
     useMaquetteMaterials() / getMaquetteMaterials() — { plaster, wood, glass, metal }
     getMaquetteParts(i)  — { plaster, wood, glass, metal } merged BufferGeometries
     preloadMaquettes()   — build all geometry ahead of time (e.g. idle callback)
     maquetteStats()      — [{ key, draws, tris }]
   ─────────────────────────────────────────────────────────────────────────── */

const PL = 0.035 // basswood plate thickness
const PI = Math.PI

/* ── materials ───────────────────────────────────────────────────────────── */
const NOISE = /* glsl */`
float mqH(vec3 p){ p = fract(p * .3183099 + .1); p *= 17.; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float mqN(vec3 x){ vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3. - 2. * f);
  return mix(mix(mix(mqH(i), mqH(i + vec3(1,0,0)), f.x), mix(mqH(i + vec3(0,1,0)), mqH(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(mqH(i + vec3(0,0,1)), mqH(i + vec3(1,0,1)), f.x), mix(mqH(i + vec3(0,1,1)), mqH(i + vec3(1,1,1)), f.x), f.y), f.z); }
`
const FRAG_PLASTER = /* glsl */`
  float mqV = mqN(vMqP * 64.) * .55 + mqN(vMqP * 230.) * .45;
  diffuseColor.rgb *= .968 + .05 * mqV + .02 * (mqN(vMqP * 7.) - .5);
`
const FRAG_WOOD = /* glsl */`
  vec3 mqA = abs(normalize(vMqN));
  vec2 mqUV = mqA.y > .55 ? vMqP.xz : (mqA.x > mqA.z ? vMqP.zy : vMqP.xy);
  float mqG = texture2D(mqGrain, mqUV * vec2(.9, 1.6) + vec2(0., floor(vMqP.y * 22.) * .37)).r;
  float mqV = mqG;
  diffuseColor.rgb *= (.83 + .22 * mqG) * (.95 + .1 * mqN(vMqP * 4.5));
`
function patch(sh, kind) {
  sh.vertexShader = sh.vertexShader
    .replace('#include <common>', '#include <common>\nvarying vec3 vMqP;\nvarying vec3 vMqN;')
    .replace('#include <begin_vertex>', '#include <begin_vertex>\nvMqP = position; vMqN = normal;')
  sh.fragmentShader = sh.fragmentShader
    .replace('#include <common>', '#include <common>\nvarying vec3 vMqP;\nvarying vec3 vMqN;\n' + NOISE + (kind === 'wood' ? 'uniform sampler2D mqGrain;\n' : ''))
    .replace('#include <color_fragment>', '#include <color_fragment>\n' + (kind === 'wood' ? FRAG_WOOD : FRAG_PLASTER))
    .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\n  roughnessFactor = clamp(roughnessFactor + (mqV - .5) * .12, 0., 1.);')
}
function grainTexture() {
  const S = 512, c = document.createElement('canvas'); c.width = c.height = S
  const ctx = c.getContext('2d'), img = ctx.createImageData(S, S), d = img.data
  const T = 2 * PI / S, lines = 64
  let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
  const lineTone = Array.from({ length: lines }, () => .6 + .4 * rnd())
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const wob = 5 * Math.sin(x * T * 2 + 1.3) + 2.2 * Math.sin(x * T * 5 + y * T * 3) + .8 * Math.sin(x * T * 13 + 2)
    const ph = (y + wob) * lines / S
    const li = ((Math.floor(ph) % lines) + lines) % lines
    const line = Math.pow(.5 + .5 * Math.cos(ph * 2 * PI), 14) * lineTone[li]
    const band = .06 * Math.sin((y + wob * 2) * T * 6)
    let g = .93 - .5 * line + band - .07 * rnd()
    g = Math.max(0, Math.min(1, g)) * 255
    const i = (y * S + x) * 4; d[i] = d[i + 1] = d[i + 2] = g; d[i + 3] = 255
  }
  ctx.putImageData(img, 0, 0)
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4
  return t
}
let _mats = null
export function getMaquetteMaterials() {
  if (_mats) return _mats
  const plaster = new THREE.MeshStandardMaterial({ color: '#ece8e0', roughness: .85, metalness: 0, envMapIntensity: 1 })
  plaster.onBeforeCompile = sh => patch(sh, 'plaster'); plaster.customProgramCacheKey = () => 'mq-plaster'
  const grain = typeof document !== 'undefined' ? grainTexture() : null
  const wood = new THREE.MeshStandardMaterial({ color: '#d8c3a0', roughness: .72, metalness: 0, envMapIntensity: .9 })
  wood.onBeforeCompile = sh => { sh.uniforms.mqGrain = { value: grain }; patch(sh, 'wood') }; wood.customProgramCacheKey = () => 'mq-wood'
  const glass = new THREE.MeshStandardMaterial({ color: '#1b1f22', roughness: .08, metalness: 0, envMapIntensity: 2.6 })
  const metal = new THREE.MeshStandardMaterial({ color: '#9a9a96', roughness: .35, metalness: .9, envMapIntensity: 1.3 })
  _mats = { plaster, wood, glass, metal }
  return _mats
}
export const useMaquetteMaterials = () => useMemo(getMaquetteMaterials, [])

/* ── geometry kit ────────────────────────────────────────────────────────── */
const V3 = (x, y, z) => new THREE.Vector3(x, y, z)
function M(x = 0, y = 0, z = 0, ry = 0, rx = 0, rz = 0) {
  return new THREE.Matrix4().compose(V3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ')), V3(1, 1, 1))
}
function polysToGeo(polys, center = [0, 0, 0]) {
  const pos = [], nor = [], C = V3(...center), a = V3(), b = V3(), c = V3(), n = V3(), m = V3()
  for (let poly of polys) {
    a.set(...poly[0]); b.set(...poly[1]); c.set(...poly[2])
    n.subVectors(b, a).cross(m.subVectors(c, a)).normalize()
    const cen = V3(0, 0, 0); poly.forEach(p => cen.add(V3(...p))); cen.multiplyScalar(1 / poly.length)
    if (n.dot(cen.sub(C)) < 0) { poly = [...poly].reverse(); n.negate() }
    for (let i = 1; i < poly.length - 1; i++) for (const p of [poly[0], poly[i], poly[i + 1]]) { pos.push(...p); nor.push(n.x, n.y, n.z) }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3))
  return g
}
// chamfered box (all 12 edges + 8 corners cut) — 44 triangles, flat normals so light catches every edge
const _cb = new Map()
function cboxGeo(w, h, d, c) {
  c = Math.max(0, Math.min(c, w * .45, h * .45, d * .45))
  const key = `${w.toFixed(5)}|${h.toFixed(5)}|${d.toFixed(5)}|${c.toFixed(5)}`
  let g = _cb.get(key); if (g) return g
  if (c < 2e-4) { g = new THREE.BoxGeometry(w, h, d).toNonIndexed(); g.deleteAttribute('uv') }
  else {
    const W = w / 2, H = h / 2, D = d / 2, S = [-1, 1], polys = []
    const P = (sx, sy, sz, a) => a === 0 ? [sx * W, sy * (H - c), sz * (D - c)] : a === 1 ? [sx * (W - c), sy * H, sz * (D - c)] : [sx * (W - c), sy * (H - c), sz * D]
    for (const s of S) {
      polys.push([P(s, -1, -1, 0), P(s, 1, -1, 0), P(s, 1, 1, 0), P(s, -1, 1, 0)])
      polys.push([P(-1, s, -1, 1), P(1, s, -1, 1), P(1, s, 1, 1), P(-1, s, 1, 1)])
      polys.push([P(-1, -1, s, 2), P(1, -1, s, 2), P(1, 1, s, 2), P(-1, 1, s, 2)])
    }
    for (const p of S) for (const q of S) {
      polys.push([P(p, q, -1, 0), P(p, q, 1, 0), P(p, q, 1, 1), P(p, q, -1, 1)])
      polys.push([P(-1, p, q, 1), P(1, p, q, 1), P(1, p, q, 2), P(-1, p, q, 2)])
      polys.push([P(p, -1, q, 0), P(p, 1, q, 0), P(p, 1, q, 2), P(p, -1, q, 2)])
    }
    for (const sx of S) for (const sy of S) for (const sz of S) polys.push([P(sx, sy, sz, 0), P(sx, sy, sz, 1), P(sx, sy, sz, 2)])
    g = polysToGeo(polys)
  }
  _cb.set(key, g); return g
}
const _cyl = new Map()
function cylGeo(r, h, seg = 14) {
  const k = `${r}|${h}|${seg}`; let g = _cyl.get(k)
  if (!g) { g = new THREE.CylinderGeometry(r, r, h, seg, 1).toNonIndexed(); g.deleteAttribute('uv'); g.translate(0, h / 2, 0); _cyl.set(k, g) }
  return g
}
// extrude a 2D shape along +z (0..depth). bevel keeps the true outline (bevelOffset = -bev)
function ext(shape, depth, bev = 0, segs = 1, curveSegs = 8, crease = .7) {
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: Math.max(1e-4, depth - 2 * bev), bevelEnabled: bev > 0, bevelThickness: bev, bevelSize: bev,
    bevelOffset: -bev, bevelSegments: segs, curveSegments: curveSegs,
  })
  g.translate(0, 0, bev)
  g.deleteAttribute('uv')
  return toCreasedNormals(g, crease)
}
// horizontal plate from a shape drawn in (x, -z): occupies y∈[0,h]
function hext(shape, h, bev = 0, segs = 1, curveSegs = 8, crease = .7) {
  const g = ext(shape, h, bev, segs, curveSegs, crease); g.rotateX(-PI / 2); return g
}
const shapeXZ = pts => new THREE.Shape(pts.map(p => new THREE.Vector2(p[0], -p[1])))
const pathXZ = pts => new THREE.Path(pts.map(p => new THREE.Vector2(p[0], -p[1])))
function rrectShape(w, d, r, cx = 0, cy = 0) {
  const s = new THREE.Shape(), x = w / 2, y = d / 2; r = Math.min(r, x - .001, y - .001)
  s.moveTo(cx - x + r, cy - y); s.lineTo(cx + x - r, cy - y); s.absarc(cx + x - r, cy - y + r, r, -PI / 2, 0)
  s.lineTo(cx + x, cy + y - r); s.absarc(cx + x - r, cy + y - r, r, 0, PI / 2)
  s.lineTo(cx - x + r, cy + y); s.absarc(cx - x + r, cy + y - r, r, PI / 2, PI)
  s.lineTo(cx - x, cy - y + r); s.absarc(cx - x + r, cy - y + r, r, PI, 1.5 * PI)
  return s
}
const rrectPts = (w, d, r, n = 6) => rrectShape(w, d, r).getPoints(n).map(v => [v.x, -v.y])
function archShape(w, h) { // rectangle w × (h - w/2) topped by a semicircle, base at y=0
  const s = new THREE.Shape(), r = w / 2, ys = h - r
  s.moveTo(-r, 0); s.lineTo(r, 0); s.lineTo(r, ys); s.absarc(0, ys, r, 0, PI, false); s.lineTo(-r, 0)
  return s
}
function archFrameShape(w, h, f) { // U-frame around an arched opening (open at the bottom)
  const s = new THREE.Shape(), r = w / 2, R = r + f, ys = h - r
  s.moveTo(-R, 0); s.lineTo(-r, 0); s.lineTo(-r, ys); s.absarc(0, ys, r, PI, 0, true); s.lineTo(r, 0)
  s.lineTo(R, 0); s.lineTo(R, ys); s.absarc(0, ys, R, 0, PI, false); s.lineTo(-R, 0)
  return s
}
function ringShape(R, r) {
  const s = new THREE.Shape(); s.absarc(0, 0, R, 0, 2 * PI, false)
  const h = new THREE.Path(); h.absarc(0, 0, r, 0, 2 * PI, true); s.holes.push(h); return s
}
function sectorShape(r, R, a0, a1) {
  const s = new THREE.Shape()
  s.moveTo(r * Math.cos(a0), r * Math.sin(a0)); s.lineTo(R * Math.cos(a0), R * Math.sin(a0))
  s.absarc(0, 0, R, a0, a1, false); s.lineTo(r * Math.cos(a1), r * Math.sin(a1)); s.absarc(0, 0, r, a1, a0, true)
  return s
}
function centroid(pts) { let x = 0, z = 0; pts.forEach(p => { x += p[0]; z += p[1] }); return [x / pts.length, z / pts.length] }
function offsetPts(pts, d) { // + d = inward (towards centroid)
  const n = pts.length, [cx, cz] = centroid(pts)
  return pts.map((p, i) => {
    const a = pts[(i - 1 + n) % n], c = pts[(i + 1) % n]
    let tx = c[0] - a[0], tz = c[1] - a[1]; const l = Math.hypot(tx, tz) || 1; tx /= l; tz /= l
    let nx = -tz, nz = tx; if (nx * (cx - p[0]) + nz * (cz - p[1]) < 0) { nx = -nx; nz = -nz }
    return [p[0] + nx * d, p[1] + nz * d]
  })
}
function samplePerimeter(pts, spacing, phase = 0) { // → [{x,z,tx,tz,nx,nz}] (n = outward)
  const n = pts.length, [cx, cz] = centroid(pts), seg = []; let L = 0
  for (let i = 0; i < n; i++) { const a = pts[i], b = pts[(i + 1) % n], l = Math.hypot(b[0] - a[0], b[1] - a[1]); if (l > 1e-6) { seg.push([a, b, l, L]); L += l } }
  const count = Math.max(4, Math.round(L / spacing)), out = []
  let si = 0
  for (let k = 0; k < count; k++) {
    const s = ((k + phase) / count) * L
    while (si < seg.length - 1 && seg[si][3] + seg[si][2] < s) si++
    const [a, b, l, s0] = seg[si], t = Math.min(1, Math.max(0, (s - s0) / l))
    const x = a[0] + (b[0] - a[0]) * t, z = a[1] + (b[1] - a[1]) * t, tx = (b[0] - a[0]) / l, tz = (b[1] - a[1]) / l
    let nx = tz, nz = -tx; if (nx * (x - cx) + nz * (z - cz) < 0) { nx = -nx; nz = -nz }
    out.push({ x, z, tx, tz, nx, nz })
  }
  return out
}
function prep(g) {
  if (g.index) g = g.toNonIndexed()
  for (const k of Object.keys(g.attributes)) if (k !== 'position' && k !== 'normal') g.deleteAttribute(k)
  if (!g.attributes.normal) g.computeVertexNormals()
  g.clearGroups(); return g
}
class Kit {
  constructor() { this.p = { plaster: [], wood: [], glass: [], metal: [] }; this.m = new THREE.Matrix4() }
  at(x, y, z, ry, fn) { const prev = this.m; this.m = prev.clone().multiply(M(x, y, z, ry)); fn(); this.m = prev }
  add(mat, geo, m) { const g = geo.clone(); g.applyMatrix4(m ? this.m.clone().multiply(m) : this.m); this.p[mat].push(g) }
  box(mat, w, h, d, x, y, z, c = .003, ry = 0) { this.add(mat, cboxGeo(w, h, d, c), M(x, y, z, ry)) }
  bx(mat, x0, x1, y0, y1, z0, z1, c = .003) { this.box(mat, Math.abs(x1 - x0), Math.abs(y1 - y0), Math.abs(z1 - z0), (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, c) }
  rod(mat, a, b, t = .004, t2 = t) {
    const A = V3(...a), B = V3(...b), d = B.clone().sub(A), len = d.length()
    const q = new THREE.Quaternion().setFromUnitVectors(V3(1, 0, 0), d.normalize())
    this.add(mat, cboxGeo(len, t, t2, 0), new THREE.Matrix4().compose(A.add(B).multiplyScalar(.5), q, V3(1, 1, 1)))
  }
  cyl(mat, r, h, x, y, z, seg) { this.add(mat, cylGeo(r, h, seg), M(x, y, z)) }
  trough(mat, x0, x1, y, z0, z1, h, t = .006) { // hollow planter box
    this.bx(mat, x0, x1, y, y + h, z0, z0 + t, .0015); this.bx(mat, x0, x1, y, y + h, z1 - t, z1, .0015)
    this.bx(mat, x0, x0 + t, y, y + h, z0 + t, z1 - t, .0015); this.bx(mat, x1 - t, x1, y, y + h, z0 + t, z1 - t, .0015)
    this.bx(mat, x0 + t, x1 - t, y, y + h * .62, z0 + t, z1 - t, 0)
  }
  // vertical mullions along a closed (x,z) outline
  mullions(mat, pts, y, h, spacing, w = .005, d = .007, off = .002, phase = .5) {
    for (const s of samplePerimeter(pts, spacing, phase))
      this.add(mat, cboxGeo(w, h, d, 0), M(s.x + s.nx * off, y + h / 2, s.z + s.nz * off, Math.atan2(-s.tz, s.tx)))
  }
  done() {
    const out = {}
    for (const k in this.p) if (this.p[k].length) {
      const g = mergeGeometries(this.p[k].map(prep), false); g.computeBoundingBox(); g.computeBoundingSphere(); out[k] = g
    }
    return out
  }
}
const plate = (k, w, d) => k.box('wood', w, PL, d, 0, PL / 2, 0, .004)

/* ── 1 · TERRACES — Lake Como hillside (render 5 / sketch 30) ────────────── */
function buildTerraces() {
  const k = new Kit(), PW = 1.56, PD = 1.26
  plate(k, PW, PD)
  const XB = .5, XS = .62, Zb = -.6, H = .15, D = .17, y0 = .1, ZF = .22, N = 5, r = .034, st = .022, ZP = .5
  const Y = i => y0 + H * i, Z = i => ZF - D * i, front = i => i === 0 ? ZP : Z(i - 1) + .012
  const units = [[.36, .3, .34], [.3, .38, .32], [.34, .32, .34], [.55, .45], [.46, .54]]
  // podium with a sunk pool on the lowest terrace
  const pool = { x0: -.43, x1: -.07, z0: .285, z1: .43 }
  k.bx('plaster', -XS, XS, PL, y0 - .03, Zb, ZP, .004)
  k.bx('plaster', -XS, XS, y0 - .03, y0, Zb, pool.z0, .002)
  k.bx('plaster', -XS, XS, y0 - .03, y0, pool.z1, ZP, .002)
  k.bx('plaster', -XS, pool.x0, y0 - .03, y0, pool.z0, pool.z1, .002)
  k.bx('plaster', pool.x1, XS, y0 - .03, y0, pool.z0, pool.z1, .002)
  k.bx('glass', pool.x0, pool.x1, y0 - .03, y0 - .008, pool.z0, pool.z1, 0)
  const cp = .012 // coping
  k.bx('plaster', pool.x0 - cp, pool.x1 + cp, y0, y0 + .011, pool.z0 - cp, pool.z0, .002)
  k.bx('plaster', pool.x0 - cp, pool.x1 + cp, y0, y0 + .011, pool.z1, pool.z1 + cp, .002)
  k.bx('plaster', pool.x0 - cp, pool.x0, y0, y0 + .011, pool.z0, pool.z1, .002)
  k.bx('plaster', pool.x1, pool.x1 + cp, y0, y0 + .011, pool.z0, pool.z1, .002)
  // engraved retaining-wall courses on the podium front
  for (let j = 1; j < 3; j++) k.bx('plaster', -XS - .002, XS + .002, PL + j * .021 - .0015, PL + j * .021 + .0015, ZP - .004, ZP + .002, 0)

  for (let i = 0; i < N; i++) {
    const yb = Y(i), yt = Y(i + 1), zf = Z(i), zfr = front(i)
    // basswood deck planks (running along x)
    const dz0 = zf - r, dz1 = zfr - .004, np = Math.max(2, Math.round((dz1 - dz0) / .03)), pd = (dz1 - dz0) / np
    for (let p = 0; p < np; p++) {
      const a = dz0 + p * pd + .0012, b = a + pd - .0024
      if (i === 0 && b > pool.z0 - cp && a < pool.z1 + cp) {
        k.bx('wood', -XB + .004, pool.x0 - cp, yb, yb + .008, a, b, .001); k.bx('wood', pool.x1 + cp, XB - .004, yb, yb + .008, a, b, .001)
      } else k.bx('wood', -XB + .004, XB - .004, yb, yb + .008, a, b, .001)
    }
    // volume + cantilevered roof slab
    k.bx('plaster', -XB, XB, yb, yt - st, Zb, zf - r, .003)
    k.bx('plaster', -XB - .012, XB + .006, yt - st, yt, Zb, zf + .012, .004)
    const uws = units[i].map(f => f * 2 * XB), ux = [-XB]; uws.forEach(w => ux.push(ux[ux.length - 1] + w))
    const n = uws.length, gy0 = yb + .008, gy1 = yt - st
    for (let u = 0; u < n; u++) {
      const x0 = ux[u], x1 = ux[u + 1], cw = (x1 - x0) * .3, left = (u + i) % 2 === 0
      // basswood-clad solid bay with vertical battens, the rest glazed
      const cx0 = left ? x0 + .006 : x1 - .006 - cw, cx1 = cx0 + cw
      k.bx('wood', cx0, cx1, gy0, gy1, zf - r - .004, zf - r + .006, .001)
      for (let q = 1; q < Math.round(cw / .014); q++) { const x = cx0 + q * cw / Math.round(cw / .014); k.bx('wood', x - .0015, x + .0015, gy0, gy1, zf - r + .006, zf - r + .009, 0) }
      const gx0 = left ? cx1 + .004 : x0 + .014, gx1 = left ? x1 - .014 : cx0 - .004
      k.bx('glass', gx0, gx1, gy0, gy1, zf - r - .002, zf - r + .004, 0)
      k.bx('plaster', gx0, gx1, gy1 - .007, gy1, zf - r, zf - r + .009, .001) // head
      k.bx('plaster', gx0, gx1, gy0, gy0 + .005, zf - r, zf - r + .009, .001) // threshold
      const th = gy0 + (gy1 - gy0) * .8
      k.bx('plaster', gx0, gx1, th - .0025, th + .0025, zf - r, zf - r + .008, 0) // transom
      const m = Math.max(2, Math.round((gx1 - gx0) / .07))
      for (let q = 0; q <= m; q++) { const x = gx0 + (gx1 - gx0) * q / m; k.bx('plaster', x - .003, x + .003, gy0, gy1, zf - r, zf - r + .009, 0) }
      // planter trough on the terrace edge
      const tz1 = zfr - .006, tz0 = tz1 - .032
      if (!(i === 0 && x1 > pool.x0 && x0 < pool.x1)) k.trough('plaster', left ? x0 + .03 : x0 + (x1 - x0) * .42, left ? x1 - (x1 - x0) * .42 : x1 - .03, yb + .008, tz0, tz1, .028, .005)
    }
    // privacy fins between units
    for (let u = 0; u <= n; u++) {
      const x = Math.min(XB - .007, Math.max(-XB + .007, ux[u]))
      k.bx('plaster', x - .006, x + .006, gy0, gy1, zf - r, zf + .045, .002)
      let zEnd = zfr - .056
      if (i === 0 && x > pool.x0 - .03 && x < pool.x1 + .03) zEnd = pool.z0 - cp - .006
      k.bx('plaster', x - .005, x + .005, gy0, yb + .05, zf + .045, zEnd, .002)
    }
    // stair flight in the side strip: terrace i → i+1
    if (i < N - 1) {
      const XR0 = XB + .008, XR1 = XS, za = zf, zb = Z(i + 1), ns = 7, sh = H / ns, sd = D / ns
      if (yb > y0) k.bx('plaster', XR0, XR1, y0, yb, zb, za, .002)
      for (let s = 0; s < ns; s++) k.bx('plaster', XR0, XR1, yb + s * sh, yb + (s + 1) * sh, zb, za - s * sd, .0015)
      const rx = XR1 - .008
      k.rod('metal', [rx, yb + sh + .05, za - sd * .5], [rx, yt + .05, zb + sd * .2], .0042)
      for (const t of [.06, .5, .94]) { const z = za - (za - zb) * t, s = Math.min(ns - 1, Math.floor(t * ns)); k.rod('metal', [rx, yb + (s + 1) * sh, z], [rx, yb + (s + 1) * sh + .05 + (yt - yb) * (t - (s + 1) / ns), z], .003) }
    }
  }
  // strip behind the last flight, entry steps from the plate
  k.bx('plaster', XB + .008, XS, y0, Y(N - 1), Zb, Z(N - 1), .002)
  for (let s = 1; s <= 3; s++) k.bx('plaster', XB + .008, XS, PL, PL + (y0 - PL) * s / 4, ZP, ZP + (4 - s) * .024, .0015)
  // roof: planters + skylights
  const yR = Y(N), zR = Z(N - 1)
  for (const [a, b] of [[-XB + .03, -.03], [.03, XB - .03]]) k.trough('plaster', a, b, yR, zR - .045, zR + .004, .036)
  for (const x of [-.25, .25]) { k.bx('plaster', x - .12, x + .12, yR, yR + .016, Zb + .03, Zb + .1, .002); k.bx('glass', x - .108, x + .108, yR + .016, yR + .021, Zb + .042, Zb + .088, 0) }
  // laser-cut basswood contour layers of the hillside on both flanks
  const t = .045, nL = Math.ceil((Y(N) - PL) / t)
  for (const side of [-1, 1]) for (let l = 0; l < nL; l++) {
    const yb = PL + l * t, ytop = yb + t, inner = side < 0 ? -XB - .012 : XS, outer = side * (PW / 2 - .005)
    const zE = x => Math.min(PD / 2 - .012, Math.max(Zb + .03, ZF - D * (ytop - y0) / H + .07 + .028 * Math.sin(x * 11 + l * 1.7) + .013 * Math.sin(x * 29 + l * .6)))
    const pts = []
    for (let s = 0; s <= 10; s++) { const x = inner + (outer - inner) * s / 10; pts.push([x, zE(x)]) }
    pts.push([outer, Zb], [inner, Zb])
    k.add('wood', hext(shapeXZ(pts), t - .001, 0), M(0, yb, 0))
  }
  return k.done()
}

/* ── 2 · TOWER — stacked capsule volumes (render 40) ─────────────────────── */
function buildTower() {
  const k = new Kit()
  plate(k, 1.5, 1.08)
  k.add('plaster', hext(rrectShape(1.32, .9, .05), .012, .003, 1, 6), M(0, PL, 0))
  // street-level grid lines engraved into the plaza
  for (let i = -5; i <= 5; i++) k.bx('wood', i * .12 - .0012, i * .12 + .0012, PL + .012, PL + .0135, -.44, .44, 0)
  const y0 = PL + .012, lob = .085, ph = .118, gap = .006, sl = .016, gh = ph - 2 * sl
  // lobby: recessed glass drum + core
  const lp = rrectPts(.62, .24, .07)
  k.add('glass', hext(shapeXZ(lp), lob, 0), M(0, y0, 0))
  k.mullions('plaster', lp, y0, lob, .05)
  const pods = [
    [1.0, .32, 0, 0, 0], [.8, .3, 0, .12, .04], [.95, .3, 0, -.1, -.02], [.72, .3, 1, 0, .05],
    [1.05, .32, 0, .08, 0], [.75, .28, 0, -.15, .05], [.9, .3, 0, .15, -.04], [.66, .28, 1, .05, 0],
    [.95, .3, 0, -.08, .03], [.72, .3, 0, .12, -.02], [.8, .28, 0, -.05, .03],
  ].map(([L, Dp, rot, sx, sz], i) => {
    const ry = rot ? PI / 2 : 0
    return { L, Dp, ry, x: sx * Math.cos(ry) + sz * Math.sin(ry), z: -sx * Math.sin(ry) + sz * Math.cos(ry), y: y0 + lob + i * (ph + gap) }
  })
  const top = pods[pods.length - 1].y + ph
  k.box('plaster', .17, top + .055 - y0, .17, 0, (top + .055 + y0) / 2, 0, .004) // core
  k.box('plaster', .19, .008, .19, 0, top + .059, 0, .003)
  const toWorld = (p, lx, lz) => [p.x + lx * Math.cos(p.ry) + lz * Math.sin(p.ry), p.z - lx * Math.sin(p.ry) + lz * Math.cos(p.ry)]
  const covered = (p, wx, wz, m = .006) => {
    if (!p) return false
    const dx = wx - p.x, dz = wz - p.z, lx = dx * Math.cos(p.ry) - dz * Math.sin(p.ry), lz = dx * Math.sin(p.ry) + dz * Math.cos(p.ry)
    return Math.abs(lx) < p.L / 2 + m && Math.abs(lz) < p.Dp / 2 + m
  }
  pods.forEach((p, i) => {
    const next = pods[i + 1], R = Math.min(.1, p.Dp * .36)
    k.at(p.x, p.y, p.z, p.ry, () => {
      const slab = hext(rrectShape(p.L, p.Dp, R), sl, .0035, 1, 7)
      k.add('plaster', slab, M(0, 0, 0)); k.add('plaster', slab, M(0, sl + gh, 0))
      const gp = rrectPts(p.L - .026, p.Dp - .026, R - .013, 7)
      k.add('glass', hext(shapeXZ(gp), gh, 0, 1, 7), M(0, sl, 0))
      k.mullions('plaster', gp, sl, gh, .042, .0045, .006, .002)
      // inner floor line seen through the glass
      k.add('plaster', hext(shapeXZ(offsetPts(gp, .004)), .004, 0), M(0, sl + gh * .5, 0))
      // balcony rails + planters wherever the roof is exposed
      const yr = ph, rp = samplePerimeter(rrectPts(p.L - .018, p.Dp - .018, R - .009, 7), .034)
      const keep = rp.map(s => { const [wx, wz] = toWorld(p, s.x, s.z); return !covered(next, wx, wz) })
      rp.forEach((s, j) => {
        if (!keep[j]) return
        k.rod('metal', [s.x, yr, s.z], [s.x, yr + .034, s.z], .0032)
        const j2 = (j + 1) % rp.length
        if (keep[j2]) k.rod('metal', [s.x, yr + .034, s.z], [rp[j2].x, yr + .034, rp[j2].z], .0036)
      })
      for (const e of [-1, 1]) {
        const lx = e * (p.L / 2 - .075), [wx, wz] = toWorld(p, lx, 0)
        if (!covered(next, wx, wz, .04)) k.trough('plaster', lx - .03, lx + .03, yr, -p.Dp / 2 + .04, p.Dp / 2 - .04, .026, .005)
      }
    })
  })
  return k.done()
}

/* ── 3 · CURVE — flowing horizontal bands (render 78) ────────────────────── */
function blob(a, b, cx = 0, n = 84, pw = 2.5, bulge = .26) {
  const pts = []
  for (let i = 0; i < n; i++) {
    const th = 2 * PI * i / n, c = Math.cos(th), s = Math.sin(th)
    pts.push([cx + a * Math.sign(c) * Math.pow(Math.abs(c), 2 / pw), b * Math.sign(s) * Math.pow(Math.abs(s), 2 / pw) * (1 + bulge * c)])
  }
  return pts
}
function buildCurve() {
  const k = new Kit()
  plate(k, 1.56, .98)
  const y0 = PL + .012
  k.add('plaster', hext(rrectShape(1.46, .84, .2), .012, .003, 1, 8), M(0, PL, 0))
  const gh = .15, fh = .118, NF = 8, sl = .016, up = .044
  const core = blob(.54, .19, 0, 72)
  // ground floor: pilotis + recessed lobby glass
  const lob = blob(.42, .14, .02)
  k.add('glass', hext(shapeXZ(lob), gh, 0), M(0, y0, 0)); k.mullions('plaster', lob, y0, gh, .055)
  for (const s of samplePerimeter(blob(.6, .245, 0, 84), .135, .3)) k.cyl('plaster', .015, gh, s.x, y0, s.z, 16)
  for (let i = 0; i <= NF; i++) {
    const a = .65 * (1 + .06 * Math.sin(i * 1.05 + .2)), b = .29 * (1 + .13 * Math.sin(i * .78 + 1.2)), cx = .07 * Math.sin(i * .62 + .4)
    const out = blob(a, b, cx, 72, 2.5, .24 + .16 * Math.sin(i * .9 + .5)), y = y0 + gh + i * fh
    k.add('plaster', hext(shapeXZ(out), sl, .0045, 2, 8, .75), M(0, y, 0)) // slab with rounded nose
    const ring = shapeXZ(out); ring.holes.push(pathXZ(offsetPts(out, .02).reverse()))
    k.add('plaster', hext(ring, i === NF ? up * .8 : up, .006, 2, 8, .75), M(0, y + sl - .004, 0)) // rounded upstand band
    if (i < NF) {
      const gy = y + sl, h = fh - sl
      k.add('glass', hext(shapeXZ(core), h, 0), M(0, gy, 0))
      k.mullions('plaster', core, gy, h, .05, .005, .007, .002, (i % 2) * .5)
    }
  }
  // rooftop plant room
  const yR = y0 + gh + NF * fh + sl
  k.add('plaster', hext(rrectShape(.36, .16, .07, .08, 0), .07, .004, 1, 6), M(0, yR, 0))
  k.add('plaster', hext(rrectShape(.38, .18, .075, .08, 0), .008, .002, 1, 6), M(0, yR + .07, 0))
  return k.done()
}

/* ── 4 · PALAZZO — Tuscan palazzo (Volterra) ─────────────────────────────── */
function buildPalazzo() {
  const k = new Kit()
  plate(k, 1.5, 1.08)
  const W = 1.14, Dd = .74, yb = PL + .018, GH = .29, ch = GH / 7
  k.box('plaster', W + .036, .018, Dd + .036, 0, PL + .009, 0, .004) // plinth
  const y1 = yb + GH, sc1 = .02, yP = y1 + sc1, PH = .28, y2 = yP + PH, sc2 = .016, yS = y2 + sc2, SH = .24, y3 = yS + SH, AH = .085, y4 = y3 + AH
  k.box('plaster', W, y4 - yb, Dd, 0, (y4 + yb) / 2, 0, .003) // body
  // string courses (solid bands proud of the body)
  k.box('plaster', W + .062, sc1, Dd + .062, 0, y1 + sc1 / 2, 0, .006)
  k.box('plaster', W + .034, sc2, Dd + .034, 0, y2 + sc2 / 2, 0, .005)
  const sillY = yP + .05
  k.box('plaster', W + .022, .011, Dd + .022, 0, sillY - .0055, 0, .003) // continuous sill course
  k.box('plaster', W + .014, .01, Dd + .014, 0, y3 + .005, 0, .003) // attic band
  // cornice: frieze, modillions, corona, cymatium
  k.box('plaster', W + .012, .016, Dd + .012, 0, y4 + .008, 0, .003)
  k.box('plaster', W + .1, .024, Dd + .1, 0, y4 + .046, 0, .006)
  k.box('plaster', W + .112, .01, Dd + .112, 0, y4 + .063, 0, .004)
  const sides = [[0, W, Dd / 2], [PI / 2, Dd, W / 2], [PI, W, Dd / 2], [-PI / 2, Dd, W / 2]]
  const bif = { w: .088, h: .175, f: .014 }, sec = { w: .074, h: .145, f: .011 }
  const gwin = { w: .062, y0: yb + .128, y1: yb + .206 }
  const portal = { r: .068, ys: yb + 4 * ch, Ro: .113 }
  const bifFrame = ext(archFrameShape(bif.w, bif.h, bif.f), .012, .002, 1, 8)
  const bifGlass = ext(archShape(bif.w, bif.h), .003, 0, 1, 8)
  const subW = (bif.w - .01) / 2, subH = bif.h - bif.w / 2 - .016 + subW / 2
  const subFrame = ext(archFrameShape(subW - .006, subH - .003, .0035), .006, 0, 1, 6)
  const oculus = ext(ringShape(.0105, .006), .006, 0, 1, 14)
  const secFrame = ext(archFrameShape(sec.w, sec.h, sec.f), .011, .002, 1, 8)
  const secGlass = ext(archShape(sec.w, sec.h), .003, 0, 1, 8)
  const afs = rrectShape(.064, .052, .003); afs.holes.push(new THREE.Path().copy(rrectShape(.044, .032, .001)))
  const atticFrame = ext(afs, .008, .0015, 1, 2)
  sides.forEach(([ry, len, off], si) => {
    const nb = si % 2 ? 4 : 7, mg = .07, wts = si % 2 ? [1, 1, 1, 1] : [1, 1, 1, 1.5, 1, 1, 1], tw = wts.reduce((a, b) => a + b, 0)
    const bx = i => { let a = 0; for (let j = 0; j < i; j++) a += wts[j]; return -len / 2 + mg + (len - 2 * mg) * (a + wts[i] / 2) / tw }
    const hasPortal = si === 0, hasDoor = si === 2, mid = (nb - 1) / 2
    k.at(Math.sin(ry) * off, 0, Math.cos(ry) * off, ry, () => {
      /* ground floor: banded rustication with clean cuts at every opening */
      const ext0 = si % 2 ? 0 : .019
      for (let c = 0; c < 7; c++) {
        const cy0 = yb + c * ch, cy1 = cy0 + ch, cuts = []
        for (let i = 0; i < nb; i++) {
          const x = bx(i)
          if (hasPortal && i === mid) {
            if (cy1 <= portal.ys + 1e-6) cuts.push([x - portal.r, x + portal.r])
            else { const dy = (cy0 + cy1) / 2 - portal.ys; if (dy < portal.Ro) { const hw = Math.sqrt(portal.Ro ** 2 - dy * dy); cuts.push([x - hw, x + hw]) } }
          } else if (hasDoor && i === mid) { if (cy0 < yb + .2) cuts.push([x - .05, x + .05]) }
          else if (cy1 > gwin.y0 - .012 && cy0 < gwin.y1 + .012) cuts.push([x - gwin.w / 2 - .012, x + gwin.w / 2 + .012])
        }
        cuts.sort((a, b) => a[0] - b[0])
        let a0 = -len / 2 - ext0; const free = []
        for (const [c0, c1] of cuts) { if (c0 > a0) free.push([a0, c0]); a0 = Math.max(a0, c1) }
        free.push([a0, len / 2 + ext0])
        for (const [f0, f1] of free) {
          const L = f1 - f0; if (L < .012) continue
          const n = Math.max(1, Math.round(L / .13)), s = L / n, joints = [f0]
          if (c % 2 && n > 1) { joints.push(f0 + s * .5); for (let j = 1; j < n; j++) joints.push(f0 + s * (j + .5)) } else for (let j = 1; j < n; j++) joints.push(f0 + s * j)
          joints.push(f1)
          for (let j = 0; j < joints.length - 1; j++) {
            const u0 = joints[j], u1 = joints[j + 1]; if (u1 - u0 < .01) continue
            k.box('plaster', u1 - u0 - .003, ch - .003, .024, (u0 + u1) / 2, (cy0 + cy1) / 2, .006, .0062)
          }
        }
      }
      for (let i = 0; i < nb; i++) {
        const x = bx(i)
        /* ground: portal / door / barred window */
        if (hasPortal && i === mid) {
          const { r, ys, Ro } = portal, nv = 9
          for (let v = 0; v < nv; v++) {
            const a0 = PI * v / nv + .012, a1 = PI * (v + 1) / nv - .012, R = v % 2 ? Ro - .016 : Ro
            k.add('plaster', ext(sectorShape(r, R, a0, a1), .028, .005, 1, 4), M(x, ys, -.004))
          }
          k.add('wood', ext(archShape(2 * r - .004, ys - yb + r - .002), .008, .0015, 1, 12), M(x, yb, .001))
          for (const sx of [-1, 1]) for (const yy of [.03, .095]) k.box('wood', r * .62, .052, .006, x + sx * r * .47, yb + yy + .026, .011, .0018)
          k.box('metal', .004, .014, .004, x - .008, yb + .1, .016, 0); k.box('metal', .004, .014, .004, x + .008, yb + .1, .016, 0)
        } else if (hasDoor && i === mid) {
          k.box('wood', .096, .196, .01, x, yb + .098, .004, .002)
          k.box('plaster', .12, .014, .03, x, yb + .203, .015, .003)
        } else {
          const { w, y0: wy0, y1: wy1 } = gwin, wh = wy1 - wy0, f = .011
          k.box('glass', w, wh, .003, x, (wy0 + wy1) / 2, .0015, 0)
          k.box('plaster', w + 2 * f, f, .028, x, wy1 + f / 2, .014, .003)
          k.box('plaster', w + 2 * f + .012, f, .036, x, wy0 - f / 2, .018, .003)
          for (const sx of [-1, 1]) k.box('plaster', f, wh, .028, x + sx * (w + f) / 2, (wy0 + wy1) / 2, .014, .003)
          for (let g = 1; g <= 4; g++) k.box('metal', .0028, wh, .0028, x - w / 2 + w * g / 5, (wy0 + wy1) / 2, .01, 0)
          k.box('metal', w, .0028, .0028, x, wy0 + wh * .5, .01, 0)
        }
        /* piano nobile: bifora with oculus, keystone */
        k.add('glass', bifGlass, M(x, sillY, .0005)); k.add('plaster', bifFrame, M(x, sillY, 0))
        const spring = sillY + bif.h - bif.w / 2
        k.cyl('plaster', .0042, spring - .016 - sillY, x, sillY, .005, 10)
        for (const sx of [-1, 1]) k.add('plaster', subFrame, M(x + sx * (subW / 2 + .0015), sillY, .002))
        k.add('plaster', oculus, M(x, spring + .006, .002))
        k.box('plaster', .02, .034, .022, x, sillY + bif.h + bif.f - .01, .009, .003)
        /* second floor: single arched windows with sills */
        const sy = yS + .045
        k.add('glass', secGlass, M(x, sy, .0005)); k.add('plaster', secFrame, M(x, sy, 0))
        k.box('plaster', sec.w + 2 * sec.f + .016, .01, .024, x, sy - .005, .012, .003)
        k.rod('plaster', [x, sy, .003], [x, sy + sec.h - sec.w / 2, .003], .004)
        /* attic: small square lights */
        const ay = y3 + .028
        k.box('glass', .044, .032, .003, x, ay + .016, .0015, 0)
        k.add('plaster', atticFrame, M(x, ay + .016, -.002))
      }
      // modillions under the corona
      const nm = Math.round((len + .02) / .056)
      for (let m = 0; m <= nm; m++) k.box('plaster', .016, .022, .046, -len / 2 - .01 + (len + .02) * m / nm, y4 + .016 + .011, .023, 0)
    })
  })
  // quoins on the upper corners
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    let y = yP, j = 0
    while (y + .04 < y4 - .004) {
      const la = j % 2 ? .045 : .075, lb = j % 2 ? .075 : .045, X = sx * W / 2, Zc = sz * Dd / 2, p = .007
      k.bx('plaster', X - sx * la, X + sx * p, y + .002, y + .042, Zc - sz * .002, Zc + sz * p, .003)
      k.bx('plaster', X - sx * .002, X + sx * p, y + .002, y + .042, Zc - sz * lb, Zc + sz * p, .003)
      y += .044; j++
    }
  }
  // hip roof — a separate plaster piece
  const yr = y4 + .068 + .003, RX = (W + .08) / 2, RZ = (Dd + .08) / 2, hr = RZ * Math.tan(24 * PI / 180), rx = RX - RZ
  k.box('plaster', RX * 2 + .006, .01, RZ * 2 + .006, 0, yr + .005, 0, .003)
  const yb2 = yr + .01, A = [-RX, yb2, -RZ], B = [RX, yb2, -RZ], C = [RX, yb2, RZ], Dp = [-RX, yb2, RZ], R1 = [-rx, yb2 + hr, 0], R2 = [rx, yb2 + hr, 0]
  k.add('plaster', polysToGeo([[Dp, C, R2, R1], [B, A, R1, R2], [A, Dp, R1], [C, B, R2], [A, B, C, Dp]], [0, yb2 + hr * .3, 0]))
  k.rod('plaster', [R1[0] - .004, R1[1] + .002, 0], [R2[0] + .004, R2[1] + .002, 0], .009, .009)
  for (const [c, rr] of [[A, R1], [Dp, R1], [B, R2], [C, R2]]) k.rod('plaster', [c[0], c[1] + .004, c[2]], [rr[0], rr[1] + .003, rr[2]], .007, .007)
  for (const [cx, cz] of [[-.33, -.12], [.3, .14]]) {
    const hgt = yb2 + hr + .03 - yr
    k.box('plaster', .05, hgt, .05, cx, yr + hgt / 2, cz, .003)
    k.box('plaster', .066, .012, .066, cx, yr + hgt + .006, cz, .003)
    k.box('plaster', .03, .018, .03, cx, yr + hgt + .021, cz, .002)
  }
  return k.done()
}

/* ── registry / components ───────────────────────────────────────────────── */
const BUILDERS = [buildTerraces, buildTower, buildCurve, buildPalazzo]
const KEYS = ['terraces', 'tower', 'curve', 'palazzo']
export const MAQUETTE_META = [
  { key: 'terraces', size: [1.56, .9, 1.26] }, { key: 'tower', size: [1.5, 1.54, 1.08] },
  { key: 'curve', size: [1.56, 1.24, .98] }, { key: 'palazzo', size: [1.5, 1.32, 1.08] },
]
const _parts = []
export function getMaquetteParts(i) { return _parts[i] || (_parts[i] = BUILDERS[i]()) }
export function preloadMaquettes() { BUILDERS.forEach((_, i) => getMaquetteParts(i)) }
export function maquetteStats() {
  return KEYS.map((key, i) => {
    const p = getMaquetteParts(i), v = Object.values(p)
    return { key, draws: v.length, tris: v.reduce((s, g) => s + g.attributes.position.count / 3, 0) }
  })
}
const ORDER = ['plaster', 'wood', 'glass', 'metal']
function Maquette({ index, castShadow = true, receiveShadow = true, ...props }) {
  const parts = useMemo(() => getMaquetteParts(index), [index])
  const mats = useMaquetteMaterials()
  return (
    <group {...props}>
      {ORDER.map(m => parts[m] && <mesh key={m} geometry={parts[m]} material={mats[m]} castShadow={castShadow} receiveShadow={receiveShadow} />)}
    </group>
  )
}
export const MaquetteTerraces = p => <Maquette index={0} {...p} />
export const MaquetteTower = p => <Maquette index={1} {...p} />
export const MaquetteCurve = p => <Maquette index={2} {...p} />
export const MaquettePalazzo = p => <Maquette index={3} {...p} />
export const MAQUETTES = [MaquetteTerraces, MaquetteTower, MaquetteCurve, MaquettePalazzo]
