import * as THREE from 'three'
import React, { useMemo, useRef, useEffect, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, useTexture, ContactShadows, Text3D, Center } from '@react-three/drei'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { EffectComposer, Bloom, DepthOfField, Noise, Vignette, ToneMapping } from '@react-three/postprocessing'
import { BlendFunction, ToneMappingMode } from 'postprocessing'
import font from '../../assets/helvetiker_bold.typeface.json'
import { TL, clamp, smooth, explodeOf } from './palazzoTL'
import { Journey, INT } from './palazzoRooms'

/* ============================================================
   Palazzo Campani — PBR exploded palazzo → fly through a window
   → walk through the piano-nobile rooms (depth photos) → look up.
   One canvas, one director, scroll progress read per frame.
   ============================================================ */
export const W = 4.2, D = 2.6, T = 0.1
export const PLAN = [
  { id: 'cellar', h: 0.62, rooms: [{ a: 0, b: 0.44, l: { en: 'SPA SUITES', it: 'SUITE SPA' } }, { a: 0.44, b: 0.56, core: 1 }, { a: 0.56, b: 1, l: { en: 'WINE CELLARS', it: 'CANTINE' } }] },
  { id: 'ground', h: 1.0, rooms: [{ a: 0, b: 0.4, u: 1, m2: 83 }, { a: 0.4, b: 0.6, core: 1, l: { en: 'SALON', it: 'SALONE' } }, { a: 0.6, b: 1, u: 2, m2: 84 }] },
  { id: 'nobile', h: 1.22, rooms: [{ a: 0, b: 0.33, u: 3, m2: 68 }, { a: 0.33, b: 0.45, core: 1 }, { a: 0.45, b: 0.7, u: 4, m2: 58 }, { a: 0.7, b: 1, u: 5, m2: 79 }] },
  { id: 'attic', h: 0.72, rooms: [{ a: 0, b: 0.82, u: 6, m2: 102 }, { a: 0.82, b: 1, core: 1 }] },
]
const BASES = (() => { let y = 0; return PLAN.map(f => { const b = y; y += f.h; return b }) })()
const H0 = PLAN.reduce((a, f) => a + f.h, 0)
// the central arched window of the piano nobile — where the camera flies in
const WIN = { y0: 0.24, y1: 1.0, w: 0.3 }
const OPEN = {
  cellar: { w: 0.26, y0: 0.2, y1: 0.42, arch: false },
  ground: { w: 0.32, y0: 0.17, y1: 0.8, arch: true },
  nobile: { w: WIN.w, y0: WIN.y0, y1: WIN.y1, arch: true },
  attic: { w: 0.24, y0: 0.2, y1: 0.44, arch: false },
}
function rng(seed) { return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 } }

/* ---------- geometry helpers ---------- */
function outline(P, x, o, grow = 0, lift = 0) {
  const r = o.w / 2 + grow, y0 = o.y0 - grow * 0.3, y1 = o.y1 + lift
  P.moveTo(x - r, y0); P.lineTo(x + r, y0)
  if (o.arch) { P.lineTo(x + r, y1 - r); P.absarc(x, y1 - r, r, 0, Math.PI, false) } else { P.lineTo(x + r, y1); P.lineTo(x - r, y1) }
  P.lineTo(x - r, y0)
  return P
}
const bayX = (len, n, i) => -len / 2 + ((i + 0.5) * len) / n
// world matrix for each of the 4 walls (local XY plane, extruded +Z outward)
function wallMatrix(side) {
  const m = new THREE.Matrix4()
  if (side === 0) m.makeTranslation(0, 0, D / 2 - T)
  if (side === 1) m.makeRotationY(Math.PI).premultiply(new THREE.Matrix4().makeTranslation(0, 0, -D / 2 + T))
  if (side === 2) m.makeRotationY(Math.PI / 2).premultiply(new THREE.Matrix4().makeTranslation(W / 2 - T, 0, 0))
  if (side === 3) m.makeRotationY(-Math.PI / 2).premultiply(new THREE.Matrix4().makeTranslation(-W / 2 + T, 0, 0))
  return m
}
const ni = g => (g.index ? g.toNonIndexed() : g)
function boxAt(w, h, d, x, y, z, ry = 0) { const g = new THREE.BoxGeometry(w, h, d); if (ry) g.rotateY(ry); g.translate(x, y, z); return ni(g) }

/* build every mesh of one floor: walls (4), trims, glass (3 light groups), shutters */
function buildFloor(fl, fi) {
  const h = fl.h, o0 = OPEN[fl.id], R = rng(17 + fi * 13)
  const walls = [], trims = [], glass = [[], [], []], shutters = []
  for (let side = 0; side < 4; side++) {
    const len = side < 2 ? W : D, n = side < 2 ? 7 : 3, M = wallMatrix(side)
    const shape = new THREE.Shape(); shape.moveTo(-len / 2, 0); shape.lineTo(len / 2, 0); shape.lineTo(len / 2, h); shape.lineTo(-len / 2, h); shape.lineTo(-len / 2, 0)
    const tr = [], gl = [[], [], []], sh = []
    for (let i = 0; i < n; i++) {
      const x = bayX(len, n, i)
      const door = fl.id === 'ground' && side === 0 && i === 3
      // opening heights are fractions of the floor height
      const o = door ? { w: 0.46, y0: 0.03, y1: 0.86, arch: true } : o0
      const oo = { ...o, y0: o.y0 * h, y1: o.y1 * h }
      shape.holes.push(outline(new THREE.Path(), x, oo))
      // glass (doors get dark wood)
      const gs = new THREE.ShapeGeometry(outline(new THREE.Shape(), x, oo), 10); gs.translate(0, 0, T * 0.4)
      const center = fl.id === 'nobile' && side === 0 && i === 3
      const grp = center ? 0 : door ? -1 : Math.floor(R() * 3)
      if (grp >= 0) gl[grp].push(ni(gs)); else tr.push(ni(gs))
      // stone surround
      if (fl.id === 'ground' || fl.id === 'nobile') {
        const s = outline(new THREE.Shape(), x, oo, 0.045, 0.05); s.holes.push(outline(new THREE.Path(), x, oo))
        const g = new THREE.ExtrudeGeometry(s, { depth: 0.035, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 1, curveSegments: 10 }); g.translate(0, 0, T)
        tr.push(g)
        tr.push(boxAt(oo.w + 0.16, 0.035, 0.08, x, oo.y0 - 0.02, T + 0.04)) // sill
        if (fl.id === 'ground') tr.push(boxAt(0.05, 0.08, 0.06, x, oo.y1 + 0.03, T + 0.03)) // keystone
        if (fl.id === 'nobile') {
          if (i % 2 === 0) { // triangular pediment
            const p = new THREE.Shape(); p.moveTo(x - oo.w * 0.82, 0); p.lineTo(x + oo.w * 0.82, 0); p.lineTo(x, 0.13); p.lineTo(x - oo.w * 0.82, 0)
            const g2 = new THREE.ExtrudeGeometry(p, { depth: 0.05, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 1 }); g2.translate(0, oo.y1 + 0.075, T)
            tr.push(g2)
          }
          tr.push(boxAt(oo.w * 1.75, 0.03, 0.09, x, oo.y1 + 0.07, T + 0.045))
          // open louvred shutters, hinged at the jambs
          if (!center) {
            const sw = oo.w * 0.52, sh0 = oo.y1 - oo.y0 - 0.04, a = 0.35 + R() * 0.5
            for (const s2 of [-1, 1]) {
              const g3 = new THREE.BoxGeometry(sw, sh0, 0.018); g3.translate(s2 * sw / 2, 0, 0); g3.rotateY(-s2 * a); g3.translate(x + s2 * (oo.w / 2 + 0.05), oo.y0 + 0.02 + sh0 / 2, T + 0.05)
              sh.push(ni(g3))
            }
          }
        }
      } else {
        tr.push(boxAt(oo.w + 0.08, 0.03, 0.06, x, oo.y0 - 0.015, T + 0.03))
      }
      // iron grilles on the cellar windows
      if (fl.id === 'cellar') for (let k = 1; k < 4; k++) tr.push(boxAt(0.012, oo.y1 - oo.y0, 0.012, x - oo.w / 2 + (oo.w * k) / 4, (oo.y0 + oo.y1) / 2, T * 0.7))
    }
    // quoins on the corners
    if (fl.id === 'ground' || fl.id === 'nobile') {
      for (let y = 0.06, k = 0; y < h - 0.05; y += 0.12, k++) {
        const qw = k % 2 ? 0.16 : 0.24
        tr.push(boxAt(qw, 0.105, 0.03, -len / 2 + qw / 2 - 0.005, y, T + 0.012))
        tr.push(boxAt(qw, 0.105, 0.03, len / 2 - qw / 2 + 0.005, y, T + 0.012))
      }
    }
    const wg = new THREE.ExtrudeGeometry(shape, { depth: T, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 1, curveSegments: 10 })
    wg.applyMatrix4(M); walls.push(wg)
    tr.forEach(g => { g.applyMatrix4(M); trims.push(ni(g)) })
    gl.forEach((a, k) => a.forEach(g => { g.applyMatrix4(M); glass[k].push(g) }))
    sh.forEach(g => { g.applyMatrix4(M); shutters.push(g) })
  }
  // string course (hollow frame so the plan below stays visible)
  trims.push(ringGeo(0.045, 0.05, h - 0.03))
  if (fl.id === 'cellar') { trims.push(ringGeo(0.06, 0.1, 0)) }
  if (fl.id === 'attic') { trims.push(ringGeo(0.07, 0.04, h - 0.01)); trims.push(ringGeo(0.12, 0.05, h + 0.03)); trims.push(ringGeo(0.18, 0.06, h + 0.08)) }
  // modillions under the main cornice
  if (fl.id === 'attic') for (let x = -W / 2 + 0.12; x < W / 2; x += 0.22) { trims.push(boxAt(0.05, 0.06, 0.14, x, h + 0.01, D / 2 + 0.06)); trims.push(boxAt(0.05, 0.06, 0.14, x, h + 0.01, -D / 2 - 0.06)) }
  const merge = a => (a.length ? mergeGeometries(a, false) : null)
  return { walls, trims: merge(trims), glass: glass.map(merge), shutters: merge(shutters) }
}
function ringGeo(o, t, y) {
  const s = new THREE.Shape(); s.moveTo(-W / 2 - o, -D / 2 - o); s.lineTo(W / 2 + o, -D / 2 - o); s.lineTo(W / 2 + o, D / 2 + o); s.lineTo(-W / 2 - o, D / 2 + o); s.lineTo(-W / 2 - o, -D / 2 - o)
  const hI = new THREE.Path(), a = W / 2 - T * 0.6, b = D / 2 - T * 0.6
  hI.moveTo(-a, -b); hI.lineTo(-a, b); hI.lineTo(a, b); hI.lineTo(a, -b); hI.lineTo(-a, -b); s.holes.push(hI)
  const g = new THREE.ExtrudeGeometry(s, { depth: t, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 2 })
  g.rotateX(-Math.PI / 2); g.translate(0, y, 0)
  return ni(g)
}

/* the floor-plan "cap" for each band (schematic, not to scale) */
function planTex(fl, lang, lite) {
  const s = lite ? 150 : 250
  const cw = Math.round(W * s), ch = Math.round(D * s)
  const c = document.createElement('canvas'); c.width = cw; c.height = ch
  const g = c.getContext('2d')
  g.fillStyle = '#ebe0cc'; g.fillRect(0, 0, cw, ch)
  g.strokeStyle = 'rgba(150,100,60,.14)'; g.lineWidth = 1
  for (let x = 0; x < cw; x += s * 0.1) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, ch); g.stroke() }
  for (let y = 0; y < ch; y += s * 0.1) { g.beginPath(); g.moveTo(0, y); g.lineTo(cw, y); g.stroke() }
  const pad = s * 0.07
  fl.rooms.forEach((r, k) => {
    const x0 = pad + r.a * (cw - 2 * pad), x1 = pad + r.b * (cw - 2 * pad)
    if (r.core) {
      g.save(); g.beginPath(); g.rect(x0, pad, x1 - x0, ch - 2 * pad); g.clip()
      g.strokeStyle = 'rgba(21,20,18,.3)'; g.lineWidth = s * 0.006
      for (let t = -ch; t < cw; t += s * 0.06) { g.beginPath(); g.moveTo(x0 + t, pad); g.lineTo(x0 + t + ch, ch); g.stroke() }
      g.restore()
      g.fillStyle = '#f2ebde'; g.fillRect(x0 + (x1 - x0) * 0.18, ch * 0.32, (x1 - x0) * 0.64, ch * 0.36)
      g.strokeStyle = '#151412'; g.lineWidth = s * 0.006
      for (let y = ch * 0.32; y <= ch * 0.68; y += ch * 0.045) { g.beginPath(); g.moveTo(x0 + (x1 - x0) * 0.18, y); g.lineTo(x0 + (x1 - x0) * 0.82, y); g.stroke() }
    } else {
      g.fillStyle = r.u ? (k % 2 ? 'rgba(176,106,53,.42)' : 'rgba(195,161,94,.5)') : 'rgba(39,65,79,.3)'
      g.fillRect(x0, pad, x1 - x0, ch - 2 * pad)
      g.strokeStyle = 'rgba(21,20,18,.55)'; g.lineWidth = s * 0.008
      g.beginPath(); g.moveTo(x0, ch * 0.58); g.lineTo(x0 + (x1 - x0) * 0.55, ch * 0.58); g.moveTo(x0 + (x1 - x0) * 0.55, ch * 0.58); g.lineTo(x0 + (x1 - x0) * 0.55, ch - pad); g.stroke()
    }
    g.fillStyle = '#151412'; g.textAlign = 'center'
    const cx = (x0 + x1) / 2
    if (r.u) {
      g.font = `800 ${s * 0.34}px "Inter Tight", Arial, sans-serif`; g.fillText('AP.' + r.u, cx, ch * 0.42)
      g.font = `600 ${s * 0.18}px "Inter Tight", Arial, sans-serif`; g.fillStyle = '#7a4520'; g.fillText(r.m2 + ' m²', cx, ch * 0.42 + s * 0.25)
    } else if (r.l) {
      g.font = `800 ${s * (r.core ? 0.1 : 0.16)}px "Inter Tight", Arial, sans-serif`; g.fillText(r.l[lang] || r.l.en, cx, r.core ? ch * 0.25 : ch * 0.4)
    }
    if (k > 0) { g.strokeStyle = '#151412'; g.lineWidth = s * 0.018; g.beginPath(); g.moveTo(x0, pad); g.lineTo(x0, ch - pad); g.stroke() }
  })
  g.strokeStyle = '#151412'; g.lineWidth = s * 0.035; g.strokeRect(pad, pad, cw - 2 * pad, ch - 2 * pad)
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8
  return t
}

/* ---------- PBR materials (Poly Haven CC0, 1k) ---------- */
const TEX = '/portfolio/yts/tex/'
function useSet(name, rep) {
  const [map, normalMap, arm] = useTexture([`${TEX}${name}_diff.webp`, `${TEX}${name}_nor.webp`, `${TEX}${name}_arm.webp`])
  const out = useMemo(() => {
    const o = {}
    ;[['map', map], ['normalMap', normalMap], ['arm', arm]].forEach(([k, t0]) => {
      const t = t0.clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep); t.anisotropy = 8
      if (k === 'map') t.colorSpace = THREE.SRGBColorSpace
      t.needsUpdate = true; o[k] = t
    })
    return o
  }, [map, normalMap, arm, rep])
  useEffect(() => () => Object.values(out).forEach(t => t.dispose()), [out])
  return out
}
function pbr(set, color, extra = {}) {
  return new THREE.MeshStandardMaterial({ map: set.map, normalMap: set.normalMap, aoMap: set.arm, roughnessMap: set.arm, metalnessMap: set.arm, color, roughness: 1, metalness: 1, normalScale: new THREE.Vector2(1, 1), ...extra })
}

function useMaterials() {
  const stone = useSet('stone', 0.9), plaster = useSet('plaster', 1.1), trim = useSet('plaster', 2.2), roof = useSet('roof', 1), shutter = useSet('shutter', 1)
  return useMemo(() => {
    // metalness from ARM's blue channel is 0 for these sets; metalness:1 just multiplies the map
    const m = {
      stone: pbr(stone, '#e6d2ae'),
      stoneDark: pbr(stone, '#bca784'),
      plaster: pbr(plaster, '#e3b07c'),
      plasterAttic: pbr(plaster, '#dcab78'),
      trim: pbr(trim, '#f3e9d8'),
      roof: pbr(roof, '#f0c3a6', { side: THREE.DoubleSide }),
      shutter: new THREE.MeshStandardMaterial({ color: '#4f6247', normalMap: shutter.normalMap, roughness: 0.62, metalness: 0 }),
      inner: new THREE.MeshStandardMaterial({ color: '#cdb89a', roughness: 0.95 }),
      door: new THREE.MeshStandardMaterial({ color: '#3a2618', roughness: 0.6 }),
      glass: [0, 1, 2].map(() => new THREE.MeshStandardMaterial({ color: '#3a4652', roughness: 0.12, metalness: 0.7, emissive: new THREE.Color('#ffb15a'), emissiveIntensity: 0 })),
    }
    return m
  }, [stone, plaster, trim, roof, shutter])
}

function Floor({ fl, i, lang, lite, fref, M }) {
  const geo = useMemo(() => buildFloor(fl, i), [fl, i])
  const plan = useMemo(() => planTex(fl, lang, lite), [fl, lang, lite])
  useEffect(() => () => plan.dispose(), [plan])
  const wallMat = fl.id === 'cellar' ? M.stoneDark : fl.id === 'ground' ? M.stone : fl.id === 'attic' ? M.plasterAttic : M.plaster
  const mats = [wallMat, M.trim]
  const h = fl.h
  return (
    <group ref={fref}>
      {geo.walls.map((g, k) => <mesh key={k} geometry={g} material={mats} />)}
      {geo.trims && <mesh geometry={geo.trims} material={M.trim} />}
      {geo.shutters && <mesh geometry={geo.shutters} material={M.shutter} />}
      {geo.glass.map((g, k) => g && <mesh key={'g' + k} geometry={g} material={M.glass[k]} />)}
      <mesh position={[0, -0.03, 0]} material={M.trim}><boxGeometry args={[W + 0.03, 0.06, D + 0.03]} /></mesh>
      <mesh position={[0, h - 0.006, 0]} rotation-x={-Math.PI / 2}><planeGeometry args={[W - 0.12, D - 0.12]} /><meshStandardMaterial map={plan} roughness={0.95} /></mesh>
      {fl.rooms.slice(1).map((r, k) => (
        <mesh key={k} position={[-W / 2 + 0.07 + r.a * (W - 0.14), h + 0.025, 0]} material={M.inner}><boxGeometry args={[0.035, 0.05, D - 0.16]} /></mesh>
      ))}
    </group>
  )
}

function hipGeometry(w, d, h) {
  const A = [-w, 0, d], B = [w, 0, d], C = [w, 0, -d], Dd = [-w, 0, -d], R1 = [-w + d, h, 0], R2 = [w - d, h, 0]
  const faces = [[A, B, R2, 'z'], [A, R2, R1, 'z'], [B, C, R2, 'x'], [C, Dd, R1, 'z'], [C, R1, R2, 'z'], [Dd, A, R1, 'x']]
  const sl = Math.hypot(h, d), pos = [], uv = []
  faces.forEach(([a, b, c, ax]) => [a, b, c].forEach(p => { pos.push(...p); uv.push((ax === 'z' ? p[0] : p[2]) * 1.6, (p[1] / h) * sl * 1.6) }))
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
  geo.computeVertexNormals(); return geo
}
function Roof({ rref, M }) {
  const geo = useMemo(() => hipGeometry(W / 2 + 0.22, D / 2 + 0.22, 0.85), [])
  return (
    <group ref={rref}>
      <mesh geometry={geo} material={M.roof} />
      <mesh position={[0, 0.85, 0]} rotation-z={Math.PI / 2} material={M.roof}><cylinderGeometry args={[0.035, 0.035, W - D + 0.02, 10]} /></mesh>
      {[[-1.15, 0.28], [1.3, -0.32]].map(([x, z], k) => (
        <group key={k} position={[x, 0.72, z]}>
          <mesh material={M.plaster}><boxGeometry args={[0.18, 0.55, 0.18]} /></mesh>
          <mesh position-y={0.3} material={M.trim}><boxGeometry args={[0.24, 0.05, 0.24]} /></mesh>
        </group>
      ))}
    </group>
  )
}

/* ---------- sky dome: day → golden hour → dusk ---------- */
const skyVert = `varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`
const skyFrag = `uniform float uDusk; uniform vec3 uSun; varying vec3 vP;
void main(){
  float y = clamp(vP.y, -0.2, 1.0);
  vec3 zD = vec3(.24,.40,.60), hD = vec3(.92,.72,.50);
  vec3 zG = vec3(.20,.27,.42), hG = vec3(1.0,.58,.28);
  vec3 zN = vec3(.025,.04,.09), hN = vec3(.42,.17,.12);
  float a = smoothstep(0.0, .5, uDusk), b = smoothstep(.45, 1.0, uDusk);
  vec3 z = mix(mix(zD, zG, a), zN, b), h = mix(mix(hD, hG, a), hN, b);
  vec3 col = mix(h, z, pow(smoothstep(-0.05, .75, y), .7));
  float s = max(dot(vP, normalize(uSun)), 0.0);
  col += mix(vec3(1.0,.8,.55), vec3(1.0,.45,.2), a) * (pow(s, 64.0) * 1.6 + pow(s, 6.0) * .35) * (1.0 - b * .85);
  col = mix(col, h * .55, smoothstep(.02, -.2, vP.y));
  gl_FragColor = vec4(col, 1.0);
}`
function Sky({ S }) {
  const ref = useRef()
  const mat = useMemo(() => new THREE.ShaderMaterial({ uniforms: { uDusk: { value: 0 }, uSun: { value: new THREE.Vector3(-0.6, 0.18, -1) } }, vertexShader: skyVert, fragmentShader: skyFrag, side: THREE.BackSide, depthWrite: false, fog: false }), [])
  useFrame(({ camera }) => {
    mat.uniforms.uDusk.value = S.dusk
    mat.uniforms.uSun.value.set(-0.7, 0.2 - S.dusk * 0.26, -1)
    if (ref.current) { ref.current.position.copy(camera.position); ref.current.visible = !S.interior }
  })
  return <mesh ref={ref} material={mat} renderOrder={-1}><sphereGeometry args={[60, 32, 16]} /></mesh>
}

const C1 = new THREE.Color(), C2 = new THREE.Color()
function Lights({ S }) {
  const sun = useRef(), hemi = useRef(), fill = useRef()
  const { scene } = useThree()
  useFrame(() => {
    const d = S.dusk
    if (sun.current) {
      sun.current.intensity = 3.2 * (1 - smooth(0.35, 0.95, d)) + 0.15
      sun.current.color.copy(C1.set('#fff1dc')).lerp(C2.set('#ff9a4d'), smooth(0.1, 0.6, d))
      sun.current.position.set(-7, 6.5 - d * 4.5, 5)
    }
    if (hemi.current) { hemi.current.intensity = 0.9 - d * 0.55; hemi.current.color.copy(C1.set('#cfe0f2')).lerp(C2.set('#344466'), smooth(0.4, 1, d)) }
    if (fill.current) fill.current.intensity = 0.2 + smooth(0.5, 1, d) * 1.2
    scene.environmentIntensity = 1 - smooth(0.2, 0.95, d) * 0.72
    if (scene.fog) scene.fog.color.copy(C1.set('#e9cfa8')).lerp(C2.set('#d98c55'), smooth(0, 0.5, d)).lerp(C2.set('#1d1a26'), smooth(0.45, 1, d))
  })
  return (
    <>
      <hemisphereLight ref={hemi} args={['#cfe0f2', '#6b5640', 0.9]} />
      <directionalLight ref={sun} position={[-7, 6.5, 5]} intensity={3} color="#fff1dc" />
      {/* warm bounce from the lit windows at dusk */}
      <pointLight ref={fill} position={[0, 2.2, 3.4]} intensity={0.2} distance={9} color="#ffb46a" />
    </>
  )
}

const V = new THREE.Vector3(), V2 = new THREE.Vector3()
function Building({ S, hud, lang, lite, M }) {
  const root = useRef(), floors = [useRef(), useRef(), useRef(), useRef()], roof = useRef(), word = useRef()
  const { size, camera } = useThree()
  useFrame(() => {
    const p = S.p, e = S.e, mob = size.width < 768, GAP = mob ? 1.15 : 0.95
    if (root.current) root.current.visible = !S.interior
    floors.forEach((f, i) => {
      if (!f.current) return
      f.current.position.y = BASES[i] + i * GAP * e
      f.current.rotation.y = (i - 1.5) * 0.14 * e
    })
    if (roof.current) { roof.current.position.y = H0 + 0.14 + (4 * GAP + 0.3) * e; roof.current.rotation.y = 2.5 * 0.14 * e }
    root.current.rotation.y = S.rot
    // glass: three groups of rooms switch on one after another as dusk falls
    M.glass.forEach((m, k) => { m.emissiveIntensity = S.glow[k] })
    // HUD leader lines + labels from the projected corner of each band
    if (hud.current && !S.interior) {
      const lx0 = size.width * (mob ? 0.5 : 0.63)
      floors.forEach((f, i) => {
        const L = hud.current.labels[i], Ln = hud.current.lines[i]
        if (!f.current || !L || !Ln) return
        f.current.localToWorld(V.set(W / 2, PLAN[i].h * 0.55, D / 2))
        V.project(camera)
        const ax = (V.x + 1) / 2 * size.width, ay = (1 - V.y) / 2 * size.height
        const lx = Math.min(Math.max(lx0, ax + (mob ? 14 : 30)), size.width - (L.offsetWidth || 0) - 12)
        L.style.transform = `translate3d(${lx}px,${ay}px,0) translateY(-50%)`
        const o = clamp((e - 0.5 - (3 - i) * 0.08) / 0.16)
        Ln.style.transform = `translate3d(${ax}px,${ay}px,0) scaleX(${o})`
        Ln.style.width = Math.max(0, lx - ax - 10) + 'px'
      })
    }
    if (hud.current?.update) hud.current.update(e, p, S.focusIdx)
    // DOF target: the floor being labelled, or the window we fly into
    const fi = Math.max(0, Math.min(3, S.focusIdx))
    const a = Math.floor(fi), b = Math.min(3, a + 1), t = fi - a
    if (floors[a].current && floors[b].current) {
      floors[a].current.localToWorld(V.set(W / 2 - 0.4, PLAN[a].h * 0.5, D / 2))
      floors[b].current.localToWorld(V2.set(W / 2 - 0.4, PLAN[b].h * 0.5, D / 2))
      V.lerp(V2, t)
      S.floorFocus.copy(V)
    }
  })
  return (
    <group ref={root}>
      {PLAN.map((fl, i) => <Floor key={fl.id} fl={fl} i={i} lang={lang} lite={lite} fref={floors[i]} M={M} />)}
      <Roof rref={roof} M={M} />
    </group>
  )
}

function Ground({ S, M }) {
  const ref = useRef()
  const mat = useMemo(() => {
    const m = M.stoneDark.clone(); const set = ['map', 'normalMap', 'aoMap', 'roughnessMap', 'metalnessMap']
    set.forEach(k => { if (m[k]) { m[k] = m[k].clone(); m[k].repeat.set(4, 4); m[k].needsUpdate = true } })
    m.color = new THREE.Color('#8f7f68'); return m
  }, [M])
  useFrame(() => { if (ref.current) ref.current.visible = !S.interior })
  return (
    <group ref={ref}>
      <mesh rotation-x={-Math.PI / 2} position-y={-0.065} material={mat}><circleGeometry args={[70, 48]} /></mesh>
      <ContactShadows position={[0, -0.06, 0]} scale={11} blur={2.4} far={3.5} opacity={0.65} resolution={512} frames={1} color="#2a1c10" />
    </group>
  )
}

function Word({ S }) {
  const ref = useRef()
  useFrame(({ camera }) => {
    if (!ref.current) return
    ref.current.visible = !S.interior && S.p < 0.5
    // always stands behind the palazzo, turned to the lens
    FWD.set(camera.position.x, 0, camera.position.z).normalize()
    ref.current.position.set(-FWD.x * 7.5, -0.06 + S.e * 1.6, -FWD.z * 7.5)
    ref.current.rotation.y = Math.atan2(FWD.x, FWD.z)
  })
  return (
    <group ref={ref}>
      <Center top>
        <Text3D font={font} size={2.3} height={0.4} bevelEnabled bevelSize={0.025} bevelThickness={0.03} bevelSegments={2} curveSegments={6} letterSpacing={-0.04}>
          CAMPANI
          <meshStandardMaterial color="#d5ae6e" metalness={0.9} roughness={0.28} />
        </Text3D>
      </Center>
    </group>
  )
}

/* ---------- director: progress → camera, light, phases ---------- */
const P0 = new THREE.Vector3(), P1 = new THREE.Vector3(), T0 = new THREE.Vector3(), T1 = new THREE.Vector3(), RIGHT = new THREE.Vector3(), FWD = new THREE.Vector3()
function Director({ progress, S, drag }) {
  const { size } = useThree()
  useFrame((st, dt) => {
    dt = Math.min(dt, 0.05)
    const target = progress.get()
    // snap on big jumps (skip button / anchor links), damp otherwise
    S.p = Math.abs(target - S.p) > 0.2 || window.__palSnap ? target : THREE.MathUtils.damp(S.p, target, 4.2, dt)
    const p = S.p, mob = size.width < 768, cam = st.camera
    S.e = explodeOf(p)
    S.dusk = smooth(TL.dusk[0], TL.dusk[1], p)
    S.interior = p >= TL.enter
    const fly1 = smooth(TL.close[0], 0.47, p), fly2 = smooth(0.465, TL.enter, p)
    S.glow[0] = (smooth(0.16, 0.26, p) * 4.2) * (1 + fly1 * 1.4 + fly2 * 3)
    S.glow[1] = smooth(0.24, 0.34, p) * 3.4 * (1 + fly1)
    S.glow[2] = smooth(0.32, 0.42, p) * 3.0 * (1 + fly1)
    S.focusIdx = 3 - 3 * smooth(TL.focus[0], TL.focus[1], p)
    if (!S.interior) {
      const intro = smooth(TL.intro[0], TL.intro[1], p), ex = smooth(TL.explode[0], TL.explode[1], p)
      S.rot = (-0.62 + 0.28 * intro + 0.24 * smooth(0.06, 0.4, p) + st.pointer.x * 0.05) * (1 - fly1)
      const k = mob ? 1.75 : 1.22
      P0.set(6.6, 1.3, 9.6).multiplyScalar(k); T0.set(0, 1.7, 0)
      P1.set(8.6, 5.4 + (mob ? 2.2 : 0), 13).multiplyScalar(k); T1.set(0, 3.9 + (mob ? 0.9 : 0), 0)
      P0.lerp(P1, ex); T0.lerp(T1, ex)
      P0.y += (1 - intro) * -0.4
      // push the building off-centre to leave room for the copy / labels
      FWD.subVectors(T0, P0).normalize(); RIGHT.crossVectors(FWD, cam.up).normalize()
      const off = mob ? 0.5 + 0.9 * ex : -0.2 - 0.25 * ex
      P0.addScaledVector(RIGHT, off); T0.addScaledVector(RIGHT, off)
      // fly to the central window of the piano nobile, then through it
      const wy = BASES[2] + (WIN.y0 + (WIN.y1 - WIN.y0) * 0.42) * PLAN[2].h
      P1.set(0, wy + 0.05, mob ? 6.5 : 4.6); T1.set(0, wy, 0)
      P0.lerp(P1, fly1); T0.lerp(T1, fly1)
      const f2 = fly2 * fly2
      P0.lerp(V.set(0, wy, D / 2 - T * 0.2), f2); T0.lerp(V.set(0, wy, -2), f2)
      cam.position.copy(P0); cam.lookAt(T0)
      setFov(cam, mob ? 46 - fly2 * 10 : 34 - fly2 * 8)
      S.focus.copy(S.floorFocus).lerp(V.set(0, wy, D / 2), fly1)
      S.bokeh = (mob ? 0 : 3.2) * (0.35 + 0.65 * smooth(0.18, 0.3, p)) * (1 - fly2)
    }
  })
  return null
}
function setFov(cam, f) { if (Math.abs(cam.fov - f) > 0.01) { cam.fov = f; cam.updateProjectionMatrix() } }

function Effects({ S, mob }) {
  const dof = useRef(), tm = useRef(), last = useRef(null)
  useFrame(() => {
    if (dof.current) {
      dof.current.target.copy(S.focus)
      dof.current.bokehScale = S.bokeh
    }
    // ACES for the PBR palazzo; the photographs pass through untouched
    const want = S.interior ? ToneMappingMode.LINEAR : ToneMappingMode.ACES_FILMIC
    if (tm.current && last.current !== want) { tm.current.mode = want; last.current = want }
  })
  if (mob) return (
    <EffectComposer multisampling={0}>
      <Bloom mipmapBlur luminanceThreshold={0.95} luminanceSmoothing={0.2} intensity={0.9} radius={0.7} />
      <ToneMapping ref={tm} mode={ToneMappingMode.ACES_FILMIC} />
      <Vignette offset={0.3} darkness={0.55} />
    </EffectComposer>
  )
  return (
    <EffectComposer multisampling={4}>
      <DepthOfField ref={dof} target={[0, 2, 0]} worldFocusRange={2.6} bokehScale={2} />
      <Bloom mipmapBlur luminanceThreshold={0.92} luminanceSmoothing={0.25} intensity={1.2} radius={0.78} />
      <ToneMapping ref={tm} mode={ToneMappingMode.ACES_FILMIC} />
      <Vignette offset={0.28} darkness={0.62} />
      <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.35} />
    </EffectComposer>
  )
}

function Scene({ progress, hud, lang, lite, drag }) {
  const M = useMaterials()
  const S = useMemo(() => ({ p: progress.get(), e: 0, dusk: 0, interior: false, glow: [0, 0, 0], rot: 0, focus: new THREE.Vector3(0, 2, 0), floorFocus: new THREE.Vector3(0, 2, 0), focusIdx: 3, bokeh: 2, t: 0, look: 0, camZ: 0 }), [])
  const { scene } = useThree()
  useEffect(() => { scene.fog = new THREE.Fog('#e9cfa8', 30, 75); return () => { scene.fog = null } }, [scene])
  return (
    <>
      <Director progress={progress} S={S} drag={drag} />
      <Sky S={S} />
      <Lights S={S} />
      <Building S={S} hud={hud} lang={lang} lite={lite} M={M} />
      <Ground S={S} M={M} />
      <Word S={S} />
      <Journey S={S} progress={progress} drag={drag} mob={lite} />
      <Effects S={S} mob={lite} />
    </>
  )
}

export default function PalazzoFilm({ progress, hud, lang, active, lite, drag }) {
  return (
    <Canvas frameloop={active ? 'always' : 'never'} dpr={[1, lite ? 1.3 : 1.5]} camera={{ position: [6, 1.6, 10], fov: 34, near: 0.03, far: 120 }} gl={{ antialias: false, powerPreference: 'high-performance' }} style={{ pointerEvents: 'none' }}>
      <color attach="background" args={['#0b0a09']} />
      <Suspense fallback={null}>
        <Environment files="/portfolio/yts/hdr/venice_sunset.hdr" resolution={256} />
        <Scene progress={progress} hud={hud} lang={lang} lite={lite} drag={drag} />
      </Suspense>
    </Canvas>
  )
}
