import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js'

/* Procedural terraced hillside residence (after the Lake Como scheme, render id 5):
   3 stepped levels — stone plinths & side walls, plaster slabs, cedar fascia bands, glazing with lit interiors,
   green roof edges with hanging planting, cypresses on the slope. Pure data: geometry + sample points. */

export const STEP_Y = 1.35, STEP_Z = 2.0
export const LEVELS = [0, 1, 2].map(i => ({ y: i * STEP_Y, z: -i * STEP_Z, w: 8.4 - i * .7, x: [0, .3, -.15][i] }))
export const CENTER = new THREE.Vector3(0, 1.45, -2.0)
export const TOP = 4.9 // highest point (for the scan)
export const BOTTOM = -2.2

export function rng(seed) { let s = seed; return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646 }

// cheap value noise for terrain/greenery
function hash(x, y) { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s) }
function vnoise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf)
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1)
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
}
const fbm = (x, y) => vnoise(x, y) * .55 + vnoise(x * 2.1, y * 2.1) * .3 + vnoise(x * 4.3, y * 4.3) * .15

/* box with world-scaled UVs (so textures keep their real size on every face) */
function box(w, h, d, x, y, z, s = 1) {
  const g = new THREE.BoxGeometry(w, h, d)
  const uv = g.attributes.uv
  const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]]
  for (let f = 0; f < 6; f++) for (let k = 0; k < 4; k++) { const i = f * 4 + k; uv.setXY(i, uv.getX(i) * dims[f][0] / s, uv.getY(i) * dims[f][1] / s) }
  g.translate(x, y, z)
  return g
}

/* terrain height: the slope rises to the back; carved where the building sits */
export function hillY(x, z) {
  let h = -z * .66 - 1.75 + (fbm(x * .35 + 3, z * .35) - .5) * 1.3 + Math.max(0, Math.abs(x) - 6) * .12
  // the building platform: terrain stays below the plinths
  const ax = Math.abs(x)
  const zone = THREE.MathUtils.smoothstep(z, -9, -6.9) * (1 - THREE.MathUtils.smoothstep(z, 2.2, 4.4))
  if (zone > 0) {
    const i = Math.min(2, Math.max(0, Math.round(-z / STEP_Z)))
    const L = LEVELS[i]
    const fz = THREE.MathUtils.smoothstep(z, 1.2, 3.2) // in front of the plinth the shelf falls away
    const side = L.y - .4 - fz * 1.6 + (vnoise(x * 1.3, z * 1.3) - .5) * .25
    const inner = ax < L.w / 2 + .15 && z < 2.1 && z > -6.6 ? L.y - 1.9 : side
    const k = THREE.MathUtils.smoothstep(ax, 6.2, 8.6) // embrace near, natural far
    h = THREE.MathUtils.lerp(h, THREE.MathUtils.lerp(inner, h, k), zone)
  }
  return h
}

function lumpy(detail = 1, amp = .22, seed = 1) {
  const g = new THREE.IcosahedronGeometry(1, detail)
  const p = g.attributes.position, v = new THREE.Vector3()
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i)
    const n = vnoise(v.x * 2.3 + seed, v.y * 2.3 + v.z * 1.7) - .5
    v.multiplyScalar(1 + n * amp * 2)
    p.setXYZ(i, v.x, v.y, v.z)
  }
  g.computeVertexNormals()
  return g
}

const GREENS = ['#56703a', '#6b8444', '#47602f', '#7f9450', '#5d7a3c', '#3f5629', '#8ea35c']
const FLOWER = '#ece8da'

export function buildModel() {
  const rnd = rng(11)
  const levels = LEVELS.map((L, i) => {
    const { x, y, z, w } = L
    const G = { plaster: [], stone: [], wood: [], glass: [], frame: [], interior: [] }
    const add = (k, g) => G[k].push(g)
    const front = z + 1.6 // deck front edge
    // deck slab + timber deck finish
    add('plaster', box(w, .18, 1.75, x, y - .09, z + .8, 2))
    add('wood', box(w - .7, .035, 1.25, x - .1, y + .017, z + .72, 1.6))
    if (i === 0) {
      add('stone', box(w + .5, .36, .34, x, y + .18, front - .1, 1.6)) // front planter
      add('stone', box(w + .9, 1.9, .5, x, y - 1.13, front + .05, 1.6)) // plinth / retaining wall
    }
    // facade bays: cedar piers + glazing with lit interiors
    const nb = Math.max(4, Math.round(w / 1.2)), bw = w / nb
    for (let b = 0; b < nb; b++) {
      const cx = x - w / 2 + bw * (b + .5)
      const solid = (b + i) % 3 === 0
      if (solid) add('wood', box(bw, 1.03, .34, cx, y + .515, z - .1, 1.6))
      else {
        add('glass', box(bw - .06, 1.0, .03, cx, y + .5, z))
        add('frame', box(.045, 1.03, .06, cx - bw / 2 + .02, y + .515, z))
        add('frame', box(bw, .04, .06, cx, y + .02, z))
        add('interior', box(bw - .02, .98, .03, cx, y + .5, z - .95))
      }
    }
    add('plaster', box(w, .04, 1.0, x, y + .02, z - .5, 2)) // interior floor
    add('plaster', box(w, .05, 1.0, x, y + 1.0, z - .5, 2)) // interior ceiling
    // cedar fascia band + roof slab (= front of the next terrace)
    add('wood', box(w + .06, .32, .14, x, y + 1.19, z + .02, 1.6))
    add('plaster', box(w + .08, .14, .62, x, y + 1.28, z - .24, 2))
    add('stone', box(w + .02, .26, .3, x, y + 1.48, z - .2, 1.6)) // green-roof planter
    // stone side walls (retaining)
    const sb = i === 0 ? -2.1 : y - .7, st = y + 1.36
    for (const s of [-1, 1]) add('stone', box(.4, st - sb, 3.9, x + s * (w / 2 + .2), (st + sb) / 2, z - .1, 1.6))
    if (i === 2) {
      add('plaster', box(w, .14, 2.0, x, y + 1.28, z - 1.4, 2)) // top roof
      add('stone', box(w + .8, 1.8, .45, x, y + .45, z - 2.5, 1.6)) // back retaining wall
    }
    const fills = {}
    for (const k in G) if (G[k].length) fills[k] = mergeGeometries(G[k])

    // planting: hanging greenery along the planters, a few deck shrubs, small olive trees
    const bushes = []
    const row = (y0, z0, n, big) => {
      for (let b = 0; b < n; b++) {
        const r = (big ? .2 : .13) + rnd() * (big ? .16 : .12)
        const bx = x - w / 2 + .1 + (b + rnd() * .6) * ((w - .2) / n)
        bushes.push({ p: [bx, y0 + r * .35, z0 + (rnd() - .5) * .14], s: [r * 1.25, r * .8, r], c: rnd() < .14 ? FLOWER : GREENS[(rnd() * GREENS.length) | 0] })
        if (rnd() < .45) bushes.push({ p: [bx + (rnd() - .5) * .2, y0 - r * .6, z0 + .16], s: [r * .8, r * 1.2, r * .55], c: GREENS[(rnd() * GREENS.length) | 0] }) // hanging
      }
    }
    if (i === 0) row(y + .36, front - .1, Math.round(w * 3.2), true)
    row(y + 1.6, z - .2, Math.round(w * 3.4), true)
    for (let b = 0; b < 4; b++) bushes.push({ p: [x - w / 2 + .7 + rnd() * (w - 1.4), y + .2, z + 1.2 + rnd() * .2], s: [.22, .22, .22], c: GREENS[(rnd() * GREENS.length) | 0] })
    if (i === 2) for (let b = 0; b < 22; b++) { const r = .15 + rnd() * .2; bushes.push({ p: [x - w / 2 + .3 + rnd() * (w - .6), y + 1.4 + r * .3, z - .7 - rnd() * 1.4], s: [r, r * .8, r], c: GREENS[(rnd() * GREENS.length) | 0] }) }
    return { L, fills, bushes }
  })

  // hillside terrain with a soft stippled edge (vertex alpha → alphaHash)
  const SX = 34, SZ = 26, hill = new THREE.PlaneGeometry(SX, SZ, 110, 84)
  hill.rotateX(-Math.PI / 2)
  hill.translate(0, 0, -3)
  const hp = hill.attributes.position, cols = new Float32Array(hp.count * 4), cA = new THREE.Color(), cB = new THREE.Color()
  for (let i = 0; i < hp.count; i++) {
    const hx = hp.getX(i), hz = hp.getZ(i)
    hp.setY(i, hillY(hx, hz))
    const n = fbm(hx * .6, hz * .6), m = fbm(hx * 2.2 + 9, hz * 2.2)
    cA.set('#4f6534').lerp(cB.set('#8a8a55'), n * .9).lerp(cB.set('#6e5a3e'), Math.max(0, m - .62) * 1.6)
    const dx = hx / (SX * .5), dz = (hz + 3) / (SZ * .5), r = Math.sqrt(dx * dx * .9 + dz * dz)
    const a = 1 - THREE.MathUtils.smoothstep(r + (n - .5) * .25, .5, .92)
    cols.set([cA.r, cA.g, cA.b, a], i * 4)
  }
  hill.setAttribute('color', new THREE.BufferAttribute(cols, 4))
  hill.computeVertexNormals()

  // trees on the slope: cypresses + round crowns, placed off the building footprint
  const cypress = [], crowns = []
  let guard = 0
  while ((cypress.length < 46 || crowns.length < 120) && guard++ < 4000) {
    const tx = (rnd() - .5) * 26, tz = -3 + (rnd() - .5) * 19
    const dx = tx / 13, dz = (tz + 3) / 9.5
    if (dx * dx + dz * dz > .78) continue
    if (Math.abs(tx) < 5.4 && tz < 2.9 && tz > -7.6) continue
    const ty = hillY(tx, tz)
    if (rnd() < .3 && cypress.length < 46) { const h = 1.1 + rnd() * 1.4; cypress.push({ p: [tx, ty + h * .9, tz], s: [.26 + rnd() * .08, h, .26 + rnd() * .08], c: rnd() < .5 ? '#2f4527' : '#3a5230' }) }
    else if (crowns.length < 120) { const r = .35 + rnd() * .55; crowns.push({ p: [tx, ty + r * .7, tz], s: [r * 1.15, r * .9, r * 1.1], c: GREENS[(rnd() * GREENS.length) | 0] }) }
  }
  // a cypress line framing the building, like his sketch
  for (let k = 0; k < 7; k++) { const tx = -5.9 - (k % 2) * .5, tz = 1.5 - k * 1.3, h = 1.3 + rnd() * 1.1; cypress.push({ p: [tx, hillY(tx, tz) + h * .9, tz], s: [.25, h, .25], c: '#2c4125' }) }
  for (let k = 0; k < 5; k++) { const tx = 5.7 + (k % 2) * .5, tz = -.5 - k * 1.5, h = 1.2 + rnd() * 1.3; cypress.push({ p: [tx, hillY(tx, tz) + h * .9, tz], s: [.24, h, .24], c: '#34492c' }) }

  return { levels, hill, cypress, crowns, geoms: { bush: lumpy(1, .2, 1), crown: lumpy(2, .16, 4), cypress: cypressGeo() } }
}

function cypressGeo() {
  const g = lumpy(2, .12, 7)
  const p = g.attributes.position
  for (let i = 0; i < p.count; i++) { const yy = p.getY(i); const k = yy > 0 ? 1 - yy * .55 : 1 + yy * .1; p.setX(i, p.getX(i) * k); p.setZ(i, p.getZ(i) * k) }
  g.computeVertexNormals()
  return g
}

/* instanced transforms */
export function fillInstances(mesh, list) {
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), c = new THREE.Color(), e = new THREE.Euler()
  list.forEach((b, i) => {
    e.set(0, (i * 2.399) % 6.28, 0); q.setFromEuler(e)
    m.compose(new THREE.Vector3(...b.p), q, new THREE.Vector3(...b.s))
    mesh.setMatrixAt(i, m); mesh.setColorAt(i, c.set(b.c))
  })
  mesh.instanceMatrix.needsUpdate = true
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
}

/* point cloud of the solid building (un-exploded), for the particle system. */
export function samplePoints(model, N) {
  const out = new Float32Array(N * 3)
  const rnd = rng(3)
  const tmp = new THREE.Vector3()
  // 1) building surfaces (60%)
  const geos = []
  model.levels.forEach(l => { for (const k in l.fills) if (k !== 'interior') geos.push(l.fills[k].index ? l.fills[k].toNonIndexed() : l.fills[k]) })
  const bmesh = new THREE.Mesh(mergeGeometries(geos.map(g => { const c = g.clone(); c.deleteAttribute('uv'); return c })))
  const sampler = new MeshSurfaceSampler(bmesh).setRandomGenerator(rnd).build()
  const nB = Math.floor(N * .58), nG = Math.floor(N * .2)
  let o = 0
  for (let i = 0; i < nB; i++, o++) { sampler.sample(tmp); out.set([tmp.x, tmp.y, tmp.z], o * 3) }
  // 2) planting + trees (ellipsoid surfaces)
  const greens = [...model.levels.flatMap(l => l.bushes), ...model.cypress, ...model.crowns]
  for (let i = 0; i < nG; i++, o++) {
    const b = greens[(rnd() * greens.length) | 0]
    const u = rnd() * 2 - 1, th = rnd() * 6.283, r = Math.sqrt(1 - u * u)
    out.set([b.p[0] + r * Math.cos(th) * b.s[0], b.p[1] + u * b.s[1], b.p[2] + r * Math.sin(th) * b.s[2]], o * 3)
  }
  // 3) the slope around it
  while (o < N) {
    const hx = (rnd() - .5) * 22, hz = -3 + (rnd() - .5) * 16
    const dx = hx / 11, dz = (hz + 3) / 8
    if (dx * dx + dz * dz > 1 || rnd() > 1 - Math.sqrt(dx * dx + dz * dz) * .7) continue
    out.set([hx, hillY(hx, hz) + .02, hz], o * 3); o++
  }
  return out
}
