import React, { useMemo, useRef, useLayoutEffect } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, Html, Line } from '@react-three/drei'

/* ───────────── procedural Lake Como: east shore (Perledo / Varenna) in front, Bellagio peninsula, west shore across ───────────── */
const hash = (x, y) => { const h = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return h - Math.floor(h) }
function vnoise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf)
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1)
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
}
const fbm = (x, y, o = 4) => { let s = 0, a = .5, f = 1; for (let i = 0; i < o; i++) { s += a * vnoise(x * f, y * f); f *= 2.03; a *= .5 } return s }
const ridge = (x, y, o = 4) => { let s = 0, a = .5, f = 1; for (let i = 0; i < o; i++) { s += a * (1 - Math.abs(vnoise(x * f, y * f) * 2 - 1)) ** 2; f *= 2.1; a *= .5 } return s }
const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }

const F = 2.2 // terrain scale vs. the homes — keeps the mountains monumental
function h0(x, z) {
  // near (east) shore — our hillside, rising into the Grigne behind
  const zn = z - 3 - (fbm(x * .02, 9) - .5) * 5
  const near = zn > 0 ? (zn < 30 ? zn * .5 : 15 + (zn - 30) * .18) + ss(30, 88, zn) * (6 + 24 * ridge(x * .03, z * .03)) + (fbm(x * .05 + 3, z * .05) - .5) * 3.2 * ss(0, 8, zn) : zn * 1.3
  // far (west) shore — Menaggio / Cadenabbia under the mountains
  const zf = -62 - z + (fbm(x * .025, 4) - .5) * 12
  const far = zf > 0 ? zf * .7 + ss(4, 46, zf) * (16 + 34 * ridge(x * .025 + 7, z * .025)) : zf * 1.3
  // Bellagio peninsula (from the south, tip near x=-22)
  const px = Math.min(-22, x), d = Math.hypot(x - px, z + 30 + (fbm(x * .04, 2) - .5) * 6)
  const pk = 3 + 24 * ss(-24, -85, x)
  const pen = pk * (1 - d / (5 + .3 * pk)) - 1.2 + (ridge(x * .06, z * .06) - .4) * 3 * ss(-26, -50, x)
  let h = Math.max(near, far, pen, -7)
  if (h > .3) h += (fbm(x * .18, z * .18, 2) - .5) * .5
  return h
}
export function height(x, z) {
  let h = F * h0(x / F, z / F)
  h += 3.4 * Math.exp(-((x - 24) ** 2 + (z - 15) ** 2) / 22) // Vezio knoll
  return h
}

const SUN = new THREE.Vector3(-.5, .15, -.85).normalize()
const lerpC = (a, b, t) => a.clone().lerp(b, t)
const C = c => new THREE.Color(c)
// palettes: looking east (sun behind) → looking west into the sunset
const PAL = {
  top: [C('#56738a'), C('#5f7d90')], hor: [C('#e2b8a6'), C('#f2c992')], fog: [C('#d8b4a4'), C('#eac499')],
}

function useTerrainGeo(seg) {
  return useMemo(() => {
    const W = 360 * F, D = 300 * F
    const g = new THREE.PlaneGeometry(W, D, seg, Math.round(seg * D / W))
    g.rotateX(-Math.PI / 2); g.translate(0, 0, -40 * F)
    const p = g.attributes.position
    for (let i = 0; i < p.count; i++) p.setY(i, height(p.getX(i), p.getZ(i)))
    g.computeVertexNormals()
    const n = g.attributes.normal, col = new Float32Array(p.count * 3)
    const forest = C('#3f5a2c'), forest2 = C('#5d7337'), meadow = C('#7f8f45'), rock = C('#857a6c'), rock2 = C('#b2a593'), shore = C('#a89a80')
    const sunC = C('#ffcf9a'), sky = C('#8ea6b6'), tmp = new THREE.Color(), lit = new THREE.Color()
    const nv = new THREE.Vector3()
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i)
      nv.set(n.getX(i), n.getY(i), n.getZ(i))
      const steep = 1 - nv.y, k = fbm(x * .05, z * .05, 2)
      tmp.copy(forest).lerp(forest2, k).lerp(meadow, ss(.62, .8, k) * .6)
      tmp.lerp(rock, ss(.3, .55, steep + (y > 66 ? .15 : 0)))
      tmp.lerp(rock2, ss(80, 130, y + k * 18))
      tmp.lerp(shore, 1 - ss(.15, .7, y))
      tmp.multiplyScalar(.82 + .3 * ss(-.2, .9, k + (y < 20 ? .1 : 0)))
      // baked golden-hour light: sky dome + low western sun
      const dif = Math.max(0, nv.dot(SUN)), amb = .34 + .28 * nv.y
      lit.copy(sky).multiplyScalar(amb).add(sunC.clone().multiplyScalar(dif * 1.75))
      tmp.multiply(lit)
      col[i * 3] = tmp.r; col[i * 3 + 1] = tmp.g; col[i * 3 + 2] = tmp.b
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3))
    return g
  }, [seg])
}

/* water: sky reflection + fresnel + sun glitter, transparent over a mirrored terrain */
const waterVS = `varying vec3 vW; void main(){ vec4 w = modelMatrix*vec4(position,1.); vW = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }`
const waterFS = `
uniform float uTime; uniform vec3 uDeep, uSun, uSunCol, uFog, uHor; uniform float uFogNear, uFogFar;
varying vec3 vW;
void main(){
  vec3 V = normalize(cameraPosition - vW);
  float t = uTime;
  vec2 p = vW.xz;
  vec3 n = normalize(vec3(
    sin(p.x*.9+t*1.1)*.5 + sin(p.x*2.3 - p.y*1.7 + t*1.7)*.3 + sin(p.y*3.1+t*.6)*.2,
    14.,
    sin(p.y*1.3 + t*.9)*.6 + sin(p.x*1.9 + p.y*2.7 - t*1.3)*.3));
  float fr = .03 + .97*pow(1. - max(dot(n, V), 0.), 5.);
  vec3 R = reflect(-V, n);
  float s = max(dot(R, uSun), 0.);
  float spec = pow(s, 420.)*5. + pow(s, 40.)*.35;
  float streak = .85 + .15*sin(vW.z*.9 + sin(vW.x*.15 + t*.4)*2.);
  float a = clamp((1. - fr)*.42*streak + spec, 0., 1.);
  vec3 col = mix(uDeep, uSunCol*1.6, clamp(spec/max(a,.001), 0., 1.));
  float dist = length(cameraPosition - vW);
  float f = smoothstep(uFogNear, uFogFar, dist);
  col = mix(col, uFog, f*.85); a = mix(a, .55, f);
  gl_FragColor = vec4(col, a);
}`
/* lower-hemisphere sky so the reflection never sees the page behind */
const domeVS = `varying vec3 vW; void main(){ vec4 w = modelMatrix*vec4(position,1.); vW = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }`
const domeFS = `
uniform vec3 uTop, uHor, uSun, uSunCol; varying vec3 vW;
void main(){
  vec3 d = normalize(vW - cameraPosition);
  if (d.y > .002) discard;
  vec3 r = vec3(d.x, -d.y, d.z);
  vec3 c = mix(uHor, uTop, pow(clamp(r.y*2.6, 0., 1.), .7));
  float g = max(dot(r, uSun), 0.);
  c += uSunCol*(pow(g, 9.)*.45 + pow(g, 120.)*.8);
  gl_FragColor = vec4(c*.9, 1.);
}`

function Terrain({ seg }) {
  const geo = useTerrainGeo(seg)
  const above = useMemo(() => [new THREE.Plane(new THREE.Vector3(0, 1, 0), .25)], [])
  const below = useMemo(() => [new THREE.Plane(new THREE.Vector3(0, -1, 0), 0)], [])
  return (
    <>
      <mesh geometry={geo}><meshBasicMaterial vertexColors clippingPlanes={above} /></mesh>
      <mesh geometry={geo} scale={[1, -1, 1]}><meshBasicMaterial vertexColors color="#9db0b6" clippingPlanes={below} /></mesh>
    </>
  )
}

function Ridges() {
  // far silhouettes for atmospheric depth (west for the sunset view, east behind the Grigne)
  const geos = useMemo(() => [[-620, 40, 150, '#8f8796', 1], [-800, 70, 200, '#a99a9a', 2], [520, 120, 150, '#9b93a0', 3]].map(([z, base, amp, c, s]) => {
    const pts = [], N = 160, X = 1400
    for (let i = 0; i <= N; i++) { const x = -X + i * 2 * X / N; pts.push(x, base + amp * ridge(x * .0028 + s * 10, s, 4)) }
    const sh = new THREE.Shape(); sh.moveTo(-X, -60)
    for (let i = 0; i < pts.length; i += 2) sh.lineTo(pts[i], pts[i + 1])
    sh.lineTo(X, -60)
    const g = new THREE.ShapeGeometry(sh); g.translate(0, 0, z)
    return [g, c]
  }), [])
  return geos.map(([g, c], i) => <mesh key={i} geometry={g}><meshBasicMaterial color={c} fog={false} side={THREE.DoubleSide} /></mesh>)
}

/* ───────────── the terraced homes ───────────── */
const ROWS = [{ z: 16, n: 5 }, { z: 18.7, n: 5 }, { z: 21.4, n: 4 }, { z: 24.1, n: 4 }, { z: 26.8, n: 3 }]
const UNITS = (() => {
  const u = [], W = [1.7, 2.3, 2.0, 2.8, 1.9, 2.5]
  ROWS.forEach((r, ri) => {
    const ws = Array.from({ length: r.n }, (_, k) => W[(k + ri * 2) % W.length])
    const total = ws.reduce((a, b) => a + b, 0) + (r.n - 1) * .45
    let x = -total / 2 + (ri % 2 ? .7 : -.4)
    ws.forEach((w, k) => { const xc = x + w / 2; u.push({ x: xc, z: r.z, w, y: height(xc, r.z), tub: (k + ri) % 2 === 0 }); x += w + .45 })
  })
  return u
})()
export const TOP_ROW = ROWS[ROWS.length - 1]

const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(), _p = new THREE.Vector3(), _e = new THREE.Euler()
function setI(mesh, i, x, y, z, sx, sy, sz, ry = 0) { _e.set(0, ry, 0); _q.setFromEuler(_e); _m.compose(_p.set(x, y, z), _q, _s.set(sx, sy, sz)); mesh.setMatrixAt(i, _m) }
const done = refs => refs.forEach(r => { r.current.instanceMatrix.needsUpdate = true; if (r.current.instanceColor) r.current.instanceColor.needsUpdate = true; r.current.computeBoundingSphere() })

function Homes() {
  const body = useRef(), glass = useRef(), fascia = useRef(), roof = useRef(), garden = useRef(), tub = useRef(), fins = useRef(), olive = useRef()
  const box = useMemo(() => new THREE.BoxGeometry(1, 1, 1), [])
  const ico = useMemo(() => new THREE.IcosahedronGeometry(.5, 0), [])
  const stone = useMemo(() => new THREE.MeshStandardMaterial({ color: '#d6c8b0', roughness: .95 }), [])
  const lawn = useMemo(() => new THREE.MeshStandardMaterial({ color: '#86a050', roughness: 1 }), [])
  const gardenMats = useMemo(() => [stone, stone, lawn, stone, stone, stone], [stone, lawn])
  const tubs = UNITS.filter(u => u.tub)
  const FIN = 3
  useLayoutEffect(() => {
    UNITS.forEach((u, i) => {
      setI(body.current, i, u.x, u.y - 1.1, u.z, u.w, 3.8, 1.3)
      setI(glass.current, i, u.x, u.y + .4, u.z - .655, u.w * .94, .7, .03)
      setI(fascia.current, i, u.x, u.y + .82, u.z - .12, u.w + .2, .1, 1.62)
      setI(roof.current, i, u.x, u.y + .885, u.z - .1, u.w + .08, .04, 1.5)
      setI(garden.current, i, u.x, u.y - 1.4, u.z - 1.45, u.w + .45, 2.85, 1.35)
      for (let k = 0; k < FIN; k++) setI(fins.current, i * FIN + k, u.x - u.w / 2 + .12 + (k === 2 ? u.w - .24 : k * .22), u.y + .4, u.z - .72, .05, .74, .1)
      setI(olive.current, i, u.x + (u.tub ? -u.w * .32 : u.w * .3), u.y + .32, u.z - 1.75, .7, .65, .7, i)
    })
    tubs.forEach((u, i) => setI(tub.current, i, u.x + u.w * .26, u.y + .06, u.z - 1.6, .4, .06, .4))
    done([body, glass, fascia, roof, garden, tub, fins, olive])
  }, [])
  const pool = UNITS[0]
  return (
    <group>
      <instancedMesh ref={body} args={[box, stone, UNITS.length]} />
      <instancedMesh ref={garden} args={[box, gardenMats, UNITS.length]} />
      <instancedMesh ref={glass} args={[box, null, UNITS.length]}><meshStandardMaterial color="#26333a" metalness={1} roughness={.06} emissive="#ffb066" emissiveIntensity={.1} envMapIntensity={1.3} /></instancedMesh>
      <instancedMesh ref={fascia} args={[box, null, UNITS.length]}><meshStandardMaterial color="#f1ece2" roughness={.7} /></instancedMesh>
      <instancedMesh ref={roof} args={[box, null, UNITS.length]}><meshStandardMaterial color="#5f7d3b" roughness={1} /></instancedMesh>
      <instancedMesh ref={fins} args={[box, null, UNITS.length * FIN]}><meshStandardMaterial color="#7a5a3e" roughness={.8} /></instancedMesh>
      <instancedMesh ref={olive} args={[ico, null, UNITS.length]}><meshStandardMaterial color="#7d8b5e" roughness={1} flatShading /></instancedMesh>
      <instancedMesh ref={tub} args={[box, null, tubs.length]}><meshStandardMaterial color="#86d6de" emissive="#3aa7b5" emissiveIntensity={.3} roughness={.15} /></instancedMesh>
      {/* shared pool + deck at the west end of the lowest terrace */}
      <mesh position={[pool.x - pool.w / 2 - 2.3, pool.y - 1, pool.z - .5]} scale={[3.6, 2.1, 2.7]} geometry={box} material={stone} />
      <mesh position={[pool.x - pool.w / 2 - 2.3, pool.y + .065, pool.z - .65]} scale={[2.7, .04, 1.4]} geometry={box}><meshStandardMaterial color="#5cc6d6" emissive="#2a93a4" emissiveIntensity={.35} roughness={.08} metalness={.3} /></mesh>
    </group>
  )
}

/* trees, villages, castle — all instanced */
function rng(seed) { let s = seed; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646 } }
const inHomes = (x, z) => x > -12 && x < 11 && z > 13.5 && z < 28.5

function Trees({ count }) {
  const crowns = useRef(), cyp = useRef()
  const geoC = useMemo(() => new THREE.IcosahedronGeometry(.6, 0), [])
  const geoY = useMemo(() => { const g = new THREE.ConeGeometry(.2, 1.7, 6); g.translate(0, .85, 0); return g }, [])
  const data = useMemo(() => {
    const r = rng(7), a = [], cy = []
    let guard = 0
    while (a.length < count && guard++ < count * 40) {
      const x = -110 + r() * 220, z = 6 + r() * 110, h = height(x, z)
      if (h < .5 || h > 60 || inHomes(x, z) || (Math.abs(x + 8) < 11 && z < 13)) continue
      const dd = Math.hypot(x, z - 20)
      if (fbm(x * .06, z * .06, 2) < .38 + dd * .0018) continue
      a.push([x, h, z, (.55 + r() * .6) * (1 + dd * .012)])
    }
    // cypresses lining the terraces and the road
    for (let i = 0; i < 44; i++) { const side = i % 2 ? 1 : -1, x = side * (11 + r() * 7), z = 12 + r() * 18; cy.push([x, height(x, z), z, .8 + r() * .6]) }
    for (let i = 0; i < 12; i++) { const x = -10 + r() * 20, z = 29.5 + r() * 3; cy.push([x, height(x, z), z, .9 + r() * .5]) }
    for (let i = 0; i < 14; i++) { const x = 19 + r() * 10, z = 9 + r() * 10; cy.push([x, height(x, z), z, .9 + r() * .5]) }
    return { a, cy }
  }, [count])
  useLayoutEffect(() => {
    const c = new THREE.Color(), base = [C('#3b5528'), C('#4f6a2c'), C('#62763a'), C('#466238'), C('#55703a')]
    data.a.forEach(([x, h, z, s], i) => { setI(crowns.current, i, x, h + s * .12, z, s, s * (.75 + (i % 5) * .07), s, i); c.copy(base[i % 5]); crowns.current.setColorAt(i, c) })
    data.cy.forEach(([x, h, z, s], i) => setI(cyp.current, i, x, h - .15, z, s, s * 1.25, s))
    done([crowns, cyp])
  }, [data])
  return (
    <>
      <instancedMesh ref={crowns} args={[geoC, null, data.a.length]}><meshStandardMaterial flatShading roughness={1} color="#fff" /></instancedMesh>
      <instancedMesh ref={cyp} args={[geoY, null, data.cy.length]}><meshStandardMaterial flatShading roughness={1} color="#2c4524" /></instancedMesh>
    </>
  )
}

// [cx, cz, rx, rz, count, scale]
const TOWNS = [[-8, 9.5, 11, 4.5, 60, 1], [-52, -66, 10, 6, 46, 1.5], [40, -141, 16, 5, 44, 2], [-12, -140, 12, 4, 26, 2]]
function Towns() {
  const walls = useRef(), roofs = useRef()
  const box = useMemo(() => new THREE.BoxGeometry(1, 1, 1), [])
  const roofG = useMemo(() => { const g = new THREE.ConeGeometry(.75, .4, 4, 1); g.rotateY(Math.PI / 4); g.translate(0, .2, 0); return g }, [])
  const data = useMemo(() => {
    const r = rng(3), out = []
    TOWNS.forEach(([cx, cz, rx, rz, n, sc]) => {
      let k = 0, g = 0
      while (k < n && g++ < n * 60) {
        const a = r() * Math.PI * 2, rr = Math.sqrt(r()), x = cx + Math.cos(a) * rx * rr, z = cz + Math.sin(a) * rz * rr, h = height(x, z)
        if (h < .25 || h > 9) continue
        const w = (.8 + r() * .6) * sc, hh = (.9 + r() * 1.1) * sc
        out.push([x, h, z, w, hh, r() * .5 - .25]); k++
      }
    })
    return out
  }, [])
  useLayoutEffect(() => {
    const pal = ['#e8c79a', '#e3a983', '#f0dcb8', '#d9927a', '#efe2c8', '#e7b46a', '#d8b48e'].map(C)
    data.forEach(([x, h, z, w, hh, ry], i) => {
      setI(walls.current, i, x, h + hh / 2 - .4, z, w, hh + .8, w * .85, ry); walls.current.setColorAt(i, pal[i % pal.length])
      setI(roofs.current, i, x, h + hh - .02, z, w * 1.02, w * .7, w * .9, ry)
    })
    done([walls, roofs])
  }, [data])
  const vy = height(24, 15)
  return (
    <>
      <instancedMesh ref={walls} args={[box, null, data.length]}><meshStandardMaterial roughness={.9} color="#fff" /></instancedMesh>
      <instancedMesh ref={roofs} args={[roofG, null, data.length]}><meshStandardMaterial roughness={.9} color="#b4583a" flatShading /></instancedMesh>
      {/* Castello di Vezio — keep + curtain wall */}
      <group position={[24, vy - .2, 15]}>
        <mesh position={[0, 1.6, 0]} scale={[1.1, 3.6, 1.1]} geometry={box}><meshStandardMaterial color="#c2b49c" roughness={1} /></mesh>
        {[[0, -1.8, 3.4, .3], [1.7, 0, .3, 3.6], [-1.7, 0, .3, 3.6], [0, 1.8, 3.4, .3]].map(([x, z, sx, sz], i) => <mesh key={i} position={[x, .5, z]} scale={[sx, 1.2, sz]} geometry={box}><meshStandardMaterial color="#b1a28a" roughness={1} /></mesh>)}
      </group>
    </>
  )
}

/* ───────────── labels + Golden Triangle ───────────── */
const P = { varenna: [-8, 8.5], bellagio: [-50, -64], menaggio: [40, -140], cadenabbia: [-12, -139], vezio: [24, 15], home: [-.5, 21] }
// id, lift above ground, visibility windows (film progress)
const LBL = [
  ['varenna', 4, [[.04, .6]]], ['vezio', 6.5, [[.04, .66]]], ['bellagio', 9, [[.13, .52], [.88, 1.01]]], ['menaggio', 14, [[.14, .5], [.9, 1.01]]], ['cadenabbia', 14, [[.15, .5], [.9, 1.01]]], ['home', 9, [[.03, .14], [.52, .8]]],
]
function Label({ id, lift, win, text, sub, progress, gold }) {
  const el = useRef()
  const pos = useMemo(() => { const [x, z] = P[id]; return [x, Math.max(0, height(x, z)) + lift, z] }, [id, lift])
  useFrame(() => {
    if (!el.current) return
    const p = progress.get()
    let o = 0
    for (const [a, b] of win) o = Math.max(o, ss(a, a + .04, p) * (1 - ss(b - .04, b, p)))
    el.current.style.opacity = o
    el.current.style.transform = `translate(-50%,-100%) translateY(${(1 - o) * 10}px)`
  })
  return (
    <Html position={pos} zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
      <div ref={el} style={{ opacity: 0, position: 'absolute', left: 0, top: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', whiteSpace: 'nowrap', fontFamily: "'Inter Tight',sans-serif" }}>
        <div style={{ background: gold ? '#c3a15e' : 'rgba(21,20,18,.55)', color: gold ? '#151412' : '#ece7df', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', padding: '6px 11px', borderRadius: 999, fontSize: 11, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', display: 'flex', gap: 8, alignItems: 'baseline' }}>
          <span>{text}</span>{sub && <span style={{ opacity: .7, fontWeight: 500, letterSpacing: '.04em', textTransform: 'none' }}>{sub}</span>}
        </div>
        <div style={{ width: 1, height: 28, background: gold ? '#c3a15e' : 'rgba(236,231,223,.85)' }} />
        <div style={{ width: 5, height: 5, borderRadius: 9, background: gold ? '#c3a15e' : '#ece7df', marginTop: -2 }} />
      </div>
    </Html>
  )
}

function Triangle({ progress, label }) {
  const line = useRef(), lab = useRef()
  const pts = useMemo(() => {
    const k = [P.varenna, P.bellagio, P.menaggio, P.varenna].map(([x, z]) => new THREE.Vector3(x, .3, z)), out = []
    for (let s = 0; s < 3; s++) for (let i = 0; i < 40; i++) out.push(k[s].clone().lerp(k[s + 1], i / 40))
    out.push(k[3]); return out
  }, [])
  useFrame(() => {
    const p = progress.get(), d = ss(.13, .34, p), fade = 1 - ss(.54, .62, p)
    if (line.current) { line.current.geometry.instanceCount = Math.max(1, Math.round(d * (pts.length - 1))); line.current.material.opacity = fade; line.current.visible = d > 0 && fade > 0 }
    if (lab.current) lab.current.style.opacity = ss(.28, .34, p) * fade
  })
  return (
    <>
      <Line ref={line} points={pts} color="#f3d28a" lineWidth={2.4} transparent dashed dashSize={3} gapSize={1.6} depthTest={false} renderOrder={5} />
      <Html position={[-8, 3, -68]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
        <div ref={lab} style={{ opacity: 0, whiteSpace: 'nowrap', color: '#fff7e6', fontFamily: "'Instrument Serif',serif", fontStyle: 'italic', fontSize: 34, textShadow: '0 2px 18px rgba(0,0,0,.35)' }}>{label}</div>
      </Html>
    </>
  )
}

/* ───────────── camera film ───────────── */
function buildPath(mobile) {
  const hTop = height(1, TOP_ROW.z) // camera rests on the top garden at the end
  const pos = [[-15, 52, -112], [-78, 96, 6], [-12, 9, -26], [16, 20, 2], [-5, hTop + 3.2, 13], [1, hTop + 1.3, TOP_ROW.z - 1.1]]
  const tgt = [[5, 46, 60], [-5, 0, -64], [0, 7, 22], [0, 8, 21], [0, 8, 23], [-34, 12, -140]]
  const fov = mobile ? [66, 60, 56, 54, 54, 58] : [50, 42, 40, 36, 38, 42]
  if (mobile) { pos[1] = [-80, 120, 30]; pos[3] = [18, 24, -2]; pos[4] = [-6, hTop + 4.5, 9] }
  const v = a => a.map(p => new THREE.Vector3(...p))
  return { pos: new THREE.CatmullRomCurve3(v(pos), false, 'centripetal'), tgt: new THREE.CatmullRomCurve3(v(tgt), false, 'centripetal'), fov }
}

function Rig({ progress, skyRef, mobile, water, dome }) {
  const { camera, scene } = useThree()
  const path = useMemo(() => buildPath(mobile), [mobile])
  const s = useRef({ p: progress.get(), pt: new THREE.Vector3(), mx: 0, my: 0 })
  const tmp = useMemo(() => ({ v: new THREE.Vector3(), f: new THREE.Vector3(), top: new THREE.Color(), hor: new THREE.Color(), fog: new THREE.Color() }), [])
  useLayoutEffect(() => { scene.fog = new THREE.Fog('#d8b4a4', 70, 560) }, [scene])
  useFrame((st, dt) => {
    const S = s.current
    S.p = window.__comoSnap ? progress.get() : THREE.MathUtils.damp(S.p, progress.get(), 3.2, Math.min(dt, .05))
    S.mx = THREE.MathUtils.damp(S.mx, st.pointer.x, 2, dt); S.my = THREE.MathUtils.damp(S.my, st.pointer.y, 2, dt)
    const p = S.p
    path.pos.getPoint(p, camera.position)
    path.tgt.getPoint(p, S.pt)
    camera.position.x += S.mx * .8; camera.position.y += S.my * .4
    camera.lookAt(S.pt)
    const fi = Math.min(4.999, p * 5), i0 = Math.floor(fi), fv = THREE.MathUtils.lerp(path.fov[i0], path.fov[i0 + 1], ss(0, 1, fi - i0))
    if (Math.abs(camera.fov - fv) > .01) { camera.fov = fv; camera.updateProjectionMatrix() }
    // palette: east → west as the camera turns into the sunset
    const k = ss(.7, .98, p)
    tmp.top.copy(PAL.top[0]).lerp(PAL.top[1], k); tmp.hor.copy(PAL.hor[0]).lerp(PAL.hor[1], k); tmp.fog.copy(PAL.fog[0]).lerp(PAL.fog[1], k)
    scene.fog.color.copy(tmp.fog)
    if (water.current) { const u = water.current.uniforms; u.uTime.value += dt; u.uFog.value.copy(tmp.fog) }
    if (dome.current) { const u = dome.current.uniforms; u.uTop.value.copy(tmp.top); u.uHor.value.copy(tmp.hor) }
    // sky lives in the DOM behind the canvas, so the giant type sits behind the mountains
    const el = skyRef.current
    if (el) {
      camera.getWorldDirection(tmp.f); tmp.f.y = 0; tmp.f.normalize()
      tmp.v.copy(camera.position).addScaledVector(tmp.f, 1500); tmp.v.y = 0
      const hz = tmp.v.project(camera).y
      tmp.v.copy(camera.position).addScaledVector(SUN, 900).project(camera)
      const vis = tmp.v.z < 1
      el.style.setProperty('--sx', vis ? ((tmp.v.x * .5 + .5) * 100).toFixed(2) + '%' : '-50%')
      el.style.setProperty('--sy', vis ? ((-tmp.v.y * .5 + .5) * 100).toFixed(2) + '%' : '-50%')
      el.style.setProperty('--hy', Math.min(100, Math.max(0, (-hz * .5 + .5) * 100)).toFixed(2) + '%')
      el.style.setProperty('--top', '#' + tmp.top.getHexString())
      el.style.setProperty('--hor', '#' + tmp.hor.getHexString())
      el.style.setProperty('--glow', (k * .95 + .05).toFixed(3))
    }
  })
  return null
}

function Water({ water }) {
  const uniforms = useMemo(() => ({
    uTime: { value: 0 }, uDeep: { value: C('#2f5563') }, uSun: { value: SUN }, uSunCol: { value: C('#ffd59a') }, uFog: { value: C('#d8b4a4') }, uHor: { value: C('#e2b8a6') }, uFogNear: { value: 90 }, uFogFar: { value: 700 },
  }), [])
  return (
    <mesh rotation-x={-Math.PI / 2} renderOrder={2}>
      <planeGeometry args={[3000, 3000]} />
      <shaderMaterial ref={water} vertexShader={waterVS} fragmentShader={waterFS} uniforms={uniforms} transparent depthWrite={false} />
    </mesh>
  )
}
function Dome({ dome }) {
  const m = useRef()
  const uniforms = useMemo(() => ({ uTop: { value: C('#56738a') }, uHor: { value: C('#e2b8a6') }, uSun: { value: SUN }, uSunCol: { value: C('#ffcf8a') } }), [])
  useFrame(({ camera }) => m.current && m.current.position.copy(camera.position))
  return (
    <mesh ref={m} renderOrder={-10} frustumCulled={false}>
      <sphereGeometry args={[1500, 32, 16]} />
      <shaderMaterial ref={dome} vertexShader={domeVS} fragmentShader={domeFS} uniforms={uniforms} side={THREE.BackSide} depthWrite={false} fog={false} />
    </mesh>
  )
}

export default function ComoScene({ progress, skyRef, active, mobile, labels }) {
  const water = useRef(), dome = useRef()
  return (
    <Canvas
      frameloop={active ? 'always' : 'never'}
      dpr={[1, mobile ? 1.3 : 1.6]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ fov: mobile ? 66 : 50, near: .3, far: 3200, position: [-15, 52, -112] }}
      onCreated={({ gl }) => { gl.localClippingEnabled = true; gl.setClearColor(0x000000, 0) }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <hemisphereLight args={['#c4d3dc', '#4d4632', .9]} />
      <directionalLight position={SUN.clone().multiplyScalar(100).toArray()} color="#ffc488" intensity={2.4} />
      <Environment resolution={64} frames={1}>
        <Lightformer form="rect" intensity={2.4} color="#ffcf9a" position={[-3, 1, -8]} scale={[12, 3, 1]} />
        <Lightformer form="rect" intensity={1} color="#9fb7c6" position={[0, 8, 0]} rotation-x={Math.PI / 2} scale={[20, 20, 1]} />
        <Lightformer form="rect" intensity={.5} color="#e2b8a6" position={[0, 1, 8]} scale={[16, 3, 1]} />
      </Environment>
      <Dome dome={dome} />
      <Terrain seg={mobile ? 190 : 300} />
      <Ridges />
      <Water water={water} />
      <Homes />
      <Trees count={mobile ? 1400 : 3200} />
      <Towns />
      <Triangle progress={progress} label={labels.triangle} />
      {LBL.map(([id, lift, win]) => <Label key={id} id={id} lift={lift} win={win} text={labels[id][0]} sub={labels[id][1]} progress={progress} gold={id === 'home'} />)}
      <Rig progress={progress} skyRef={skyRef} mobile={mobile} water={water} dome={dome} />
    </Canvas>
  )
}
