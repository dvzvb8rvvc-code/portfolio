import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber'
import { Environment, Lightformer, Grid } from '@react-three/drei'
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2.js'
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'

/* PROCESS FILM — one persistent canvas, five vignettes morphing on scroll (p = 0..5).
   01 ink lines draw a terraced massing · 02 solid + zoning envelope + stamp, windows light up
   03 exploded construction layers fly in and assemble · 04 depth-photo interior, camera dolly
   05 depth-photo building site, dissolve-morph + orbit.                                          */

const { clamp, damp, lerp } = THREE.MathUtils
const seg = (p, a, b) => clamp((p - a) / (b - a), 0, 1)
const ease = x => x * x * (3 - 2 * x)
const eOut = x => 1 - Math.pow(1 - x, 3)

const FLOORS = [0, 1, 2, 3].map(i => ({ w: 5.2 - i * 0.55, d: 3.5 - i * 0.42, h: 0.9, y: i * 1.0, z: -i * 0.34, x: i * 0.14 }))
const TOP = FLOORS[3].y + FLOORS[3].h

/* ---------- 01: drawn ink lines (fat lines, progressive "dash" reveal) ---------- */
function boxEdges(cx, cy, cz, w, h, d, ext, out) {
  const x0 = cx - w / 2, x1 = cx + w / 2, y0 = cy, y1 = cy + h, z0 = cz - d / 2, z1 = cz + d / 2
  const E = [
    [[x0, y0, z1], [x0, y1, z1]], [[x1, y0, z1], [x1, y1, z1]], [[x0, y0, z0], [x0, y1, z0]], [[x1, y0, z0], [x1, y1, z0]],
    [[x0, y1, z1], [x1, y1, z1]], [[x1, y1, z1], [x1, y1, z0]], [[x1, y1, z0], [x0, y1, z0]], [[x0, y1, z0], [x0, y1, z1]],
    [[x0, y0, z1], [x1, y0, z1]], [[x1, y0, z1], [x1, y0, z0]], [[x0, y0, z0], [x0, y0, z1]], [[x1, y0, z0], [x0, y0, z0]],
  ]
  const a = new THREE.Vector3(), b = new THREE.Vector3(), dir = new THREE.Vector3()
  E.forEach(([p, q]) => {
    a.set(...p); b.set(...q); dir.subVectors(b, a).normalize().multiplyScalar(ext)
    a.sub(dir); b.add(dir); out.push(a.x, a.y, a.z, b.x, b.y, b.z)
  })
}
function useInk(color) {
  return useMemo(() => {
    const pos = []
    // guide lines first (the architect's construction lines)
    pos.push(-7, 0, 1.75, 7, 0, 1.75, -2.6, 0, -6, -2.6, 0, 5, 3.4, 0, -6, 3.4, 0, 4.4)
    FLOORS.forEach(f => boxEdges(f.x, f.y, f.z, f.w, f.h, f.d, 0.22, pos))
    boxEdges(FLOORS[3].x, TOP, FLOORS[3].z + 0.2, FLOORS[3].w + 0.9, 0.06, FLOORS[3].d + 0.8, 0.3, pos)
    // a few hatch strokes on the terraces
    FLOORS.slice(1).forEach(f => { for (let k = 0; k < 6; k++) { const x = f.x - f.w / 2 + 0.3 + k * (f.w - 0.6) / 5; pos.push(x, f.y + 0.003, f.z + f.d / 2 + 0.05, x + 0.25, f.y + 0.003, f.z + f.d / 2 + 0.3) } })
    let total = 0
    for (let i = 0; i < pos.length; i += 6) total += Math.hypot(pos[i + 3] - pos[i], pos[i + 4] - pos[i + 1], pos[i + 5] - pos[i + 2])
    const geo = new LineSegmentsGeometry().setPositions(pos)
    const mat = new LineMaterial({ color, linewidth: 1.7, dashed: true, dashSize: 0, gapSize: 1e5, dashScale: 1, transparent: true, depthWrite: false, toneMapped: false })
    const line = new LineSegments2(geo, mat)
    line.computeLineDistances()
    return { line, mat, total }
  }, [color])
}

/* ---------- window band texture: mullions + warm panes ---------- */
function windowTexture() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 64; const g = c.getContext('2d')
  g.fillStyle = '#ffffff'; g.fillRect(0, 0, 512, 64)
  for (let i = 0; i < 16; i++) { const lit = (i * 7) % 5 !== 0; g.fillStyle = lit ? '#ffffff' : '#3a2a1c'; g.fillRect(i * 32 + 3, 4, 26, 56) }
  g.fillStyle = '#101010'; for (let i = 0; i <= 16; i++) g.fillRect(i * 32 - 2, 0, 5, 64); g.fillRect(0, 0, 512, 5); g.fillRect(0, 59, 512, 5)
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t
}

/* ---------- stamp & giant word textures ---------- */
function stampTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 512
  const g = c.getContext('2d'); g.strokeStyle = '#d58a4c'; g.fillStyle = '#d58a4c'
  g.lineWidth = 14; g.beginPath(); g.arc(256, 256, 236, 0, Math.PI * 2); g.stroke()
  g.lineWidth = 5; g.beginPath(); g.arc(256, 256, 200, 0, Math.PI * 2); g.stroke()
  for (let i = 0; i < 48; i++) { const a = (i / 48) * Math.PI * 2; g.beginPath(); g.moveTo(256 + Math.cos(a) * 208, 256 + Math.sin(a) * 208); g.lineTo(256 + Math.cos(a) * 224, 256 + Math.sin(a) * 224); g.lineWidth = 4; g.stroke() }
  g.font = '900 150px "Inter Tight", Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('YTS', 256, 236)
  g.lineWidth = 10; g.beginPath(); g.moveTo(170, 330); g.lineTo(232, 380); g.lineTo(350, 300); g.stroke()
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t
}
function useWordTexture() {
  return useMemo(() => {
    const c = document.createElement('canvas'); c.width = 2048; c.height = 400
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace
    const draw = w => {
      const g = c.getContext('2d'); g.clearRect(0, 0, c.width, c.height)
      g.font = '900 330px "Inter Tight", Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'
      const m = g.measureText(w).width; const k = Math.min(1, 1960 / m)
      g.save(); g.translate(1024, 210); g.scale(k, 1); g.lineWidth = 3.5; g.strokeStyle = 'rgba(236,231,223,1)'; g.strokeText(w, 0, 0); g.restore()
      t.needsUpdate = true
    }
    return { t, draw }
  }, [])
}

/* ---------- depth photo with dissolve + light sweep (own copy of the shared idea) ---------- */
const dVert = /* glsl */`
uniform sampler2D uDepth; uniform float uAmount, uReveal;
varying vec2 vUv; varying float vD;
void main(){ vUv = uv; float d = texture2D(uDepth, uv).r; vD = d;
  vec3 p = position; p.z += d * uAmount * uReveal;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }`
const dFrag = /* glsl */`
uniform sampler2D uMap; uniform float uOpacity, uSweep, uTime;
varying vec2 vUv; varying float vD;
float h(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }
float n2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
  return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
void main(){
  vec4 c = texture2D(uMap, vUv);
  vec2 e = smoothstep(vec2(0.), vec2(.05), vUv) * smoothstep(vec2(0.), vec2(.05), 1. - vUv);
  float nz = n2(vUv * vec2(26., 14.)) * .7 + n2(vUv * 90.) * .3;
  float th = uOpacity * 1.25 - .12;            // dissolve front, near pixels resolve first
  float k = nz - vD * .25;
  if (k > th) discard;
  float edge = 1. - smoothstep(0., .06, th - k);
  vec3 col = c.rgb * (.82 + .3 * vD);
  float sw = exp(-pow((vUv.x + vD * .25 - uSweep) * 7., 2.)) * vD;
  col += vec3(1., .78, .5) * sw * .35;
  col += vec3(1., .72, .38) * edge * 2.2 * step(.02, uOpacity) * (1. - step(.995, uOpacity));
  gl_FragColor = vec4(col, e.x * e.y);
  #include <colorspace_fragment>
}`
function DPhoto({ id, width, segs, u, ...props }) {
  const [map, dmap] = useLoader(THREE.TextureLoader, [`/portfolio/yts/img/${id}.webp`, `/portfolio/yts/depth/${id}.webp`])
  map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = 4
  const aspect = map.image ? map.image.height / map.image.width : 0.6
  const geo = useMemo(() => new THREE.PlaneGeometry(width, width * aspect, segs, Math.round(segs * aspect)), [width, aspect, segs])
  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: dVert, fragmentShader: dFrag, transparent: true, depthWrite: true,
    uniforms: { uMap: { value: map }, uDepth: { value: dmap }, uAmount: { value: 1.6 }, uReveal: { value: 0 }, uOpacity: { value: 0 }, uSweep: { value: -1 }, uTime: { value: 0 } },
  }), [map, dmap])
  useLayoutEffect(() => { u.current = mat.uniforms }, [mat, u])
  return <mesh geometry={geo} material={mat} {...props} />
}

/* ---------- the building (all vignettes 01–03) ---------- */
function Building({ pd, words, mobile }) {
  const { size } = useThree()
  const ink = useInk('#efe2c4')
  const stampTex = useMemo(stampTexture, [])
  const word = useWordTexture()
  const lastWord = useRef('')
  const solidMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#e7dfd2', roughness: 0.82, metalness: 0, transparent: true }), [])
  const winTex = useMemo(windowTexture, [])
  const winMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#2b3236', roughness: 0.12, metalness: 0.7, emissive: '#ffb066', emissiveMap: winTex, emissiveIntensity: 0, transparent: true }), [winTex])
  const concrete = useMemo(() => new THREE.MeshStandardMaterial({ color: '#ebe6dd', roughness: 0.9, transparent: true }), [])
  const colMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#b9b2a6', roughness: 0.6, metalness: 0.1, transparent: true }), [])
  const finMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#2c221c', roughness: 0.5, metalness: 0.05, transparent: true }), [])
  const glassMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#2a3a44', roughness: 0.08, metalness: 0.9, emissive: '#ffb469', emissiveIntensity: 0, transparent: true }), [])
  const envMat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#d58a4c', transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }), [])
  const envLine = useMemo(() => {
    const g = new THREE.EdgesGeometry(new THREE.BoxGeometry(7, 5.4, 5.2)); const l = new THREE.LineSegments(g, new THREE.LineDashedMaterial({ color: '#e0965a', dashSize: 0.22, gapSize: 0.14, transparent: true, opacity: 0 }))
    l.computeLineDistances(); return l
  }, [])
  const plot = useMemo(() => {
    const g = new THREE.EdgesGeometry(new THREE.PlaneGeometry(10, 7.6)); const l = new THREE.LineSegments(g, new THREE.LineDashedMaterial({ color: '#e0965a', dashSize: 0.3, gapSize: 0.18, transparent: true, opacity: 0 }))
    l.rotation.x = -Math.PI / 2; l.computeLineDistances(); return l
  }, [])
  const shadowTex = useMemo(() => {
    const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d')
    const r = g.createRadialGradient(64, 64, 6, 64, 64, 64); r.addColorStop(0, 'rgba(0,0,0,.75)'); r.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = r; g.fillRect(0, 0, 128, 128)
    return new THREE.CanvasTexture(c)
  }, [])
  const root = useRef(), solid = useRef(), env = useRef(), stamp = useRef(), con = useRef(), floorsRef = useRef([]), wordM = useRef(), shadow = useRef()

  // construction parts per floor
  const parts = useMemo(() => FLOORS.map((f, i) => {
    const cols = []; const nx = 3, nz = 2
    for (let a = 0; a < nx; a++) for (let b = 0; b < nz; b++) cols.push([f.x - f.w / 2 + 0.35 + a * (f.w - 0.7) / (nx - 1), f.z - f.d / 2 + 0.4 + b * (f.d - 0.8) / (nz - 1)])
    const nf = Math.round(f.w / 0.36); const fins = []
    for (let k = 0; k <= nf; k++) fins.push(f.x - f.w / 2 + 0.06 + k * (f.w - 0.12) / nf)
    return { f, cols, fins, i }
  }), [])
  const colGeo = useMemo(() => new THREE.CylinderGeometry(0.07, 0.07, 0.76, 12), [])
  const finGeo = useMemo(() => new THREE.BoxGeometry(0.045, 0.76, 0.2), [])
  const instRefs = useRef([])
  useLayoutEffect(() => {
    const m = new THREE.Matrix4()
    instRefs.current.forEach((r, i) => {
      if (!r) return; const P = parts[Math.floor(i / 2)]
      if (i % 2 === 0) P.cols.forEach(([x, z], k) => r.setMatrixAt(k, m.makeTranslation(x, P.f.y + 0.16 + 0.38, z)))
      else P.fins.forEach((x, k) => r.setMatrixAt(k, m.makeTranslation(x, P.f.y + 0.16 + 0.38, P.f.z + P.f.d / 2 + 0.12)))
      r.instanceMatrix.needsUpdate = true
    })
  }, [parts])

  useFrame((st, dt) => {
    const p = pd.current, t = st.clock.elapsedTime
    // 01 — ink
    const draw = seg(p, 0.08, 0.8)
    ink.mat.dashSize = ink.total * ease(draw) + 0.001
    ink.mat.opacity = (0.25 + 0.75 * (1 - seg(p, 1.2, 1.7) * 0.55)) * (1 - seg(p, 2.0, 2.3))
    ink.mat.resolution.set(size.width, size.height)
    ink.line.visible = ink.mat.opacity > 0.01
    // 02 — solid + envelope + stamp
    const so = seg(p, 0.85, 1.3) * (1 - seg(p, 2.02, 2.3))
    solidMat.opacity = so; winMat.opacity = so
    winMat.emissiveIntensity = seg(p, 1.35, 1.8) * 4.5
    solid.current.visible = so > 0.01
    const ev = seg(p, 1.0, 1.4) * (1 - seg(p, 1.9, 2.15))
    env.current.position.y = 2.7 + (1 - eOut(seg(p, 1.0, 1.45))) * 3.5
    envMat.opacity = ev * 0.03; envLine.material.opacity = ev * 0.9; plot.material.opacity = ev * 0.8
    env.current.visible = plot.visible = ev > 0.01
    const sp = seg(p, 1.42, 1.62), sOut = 1 - seg(p, 1.95, 2.1)
    stamp.current.position.y = TOP + 0.08 + (1 - eOut(sp)) * 2.2
    stamp.current.scale.setScalar(lerp(2.2, 1, eOut(sp)) * (1 + Math.max(0, Math.sin(seg(p, 1.6, 1.72) * Math.PI)) * 0.12))
    stamp.current.material.opacity = sp * sOut
    stamp.current.visible = sp * sOut > 0.01
    // 03 — construction assembles from an exploded axonometric
    const cv = seg(p, 1.95, 2.2) * (1 - seg(p, 3.0, 3.3))
    con.current.visible = cv > 0.01
    ;[concrete, colMat, finMat, glassMat].forEach(m => { m.opacity = cv })
    glassMat.emissiveIntensity = seg(p, 2.55, 2.95) * 1.4 + seg(p, 2.95, 3.0) * 0.4
    floorsRef.current.forEach((g, i) => {
      if (!g) return
      const e = 2.2 * (1 - eOut(seg(p, 2.0 + i * 0.07, 2.72 + i * 0.05))) + (0.18 + i * 0.06) * Math.sin(seg(p, 2.72, 3.0) * Math.PI) * 0
      g.position.y = i * e * 1.15
      g.children[1].position.y = e * 0.5        // columns
      g.children[2].position.z = e * 1.5        // facade fins
      g.children[3].position.z = e * 0.9        // glazing
      g.children[2].position.x = e * 0.25 * (i % 2 ? 1 : -1)
    })
    // giant word behind
    const sIdx = Math.min(4, Math.max(0, Math.floor(p + 0.0001)))
    const w = words[sIdx]
    if (w !== lastWord.current) { lastWord.current = w; word.draw(w) }
    const f = p - sIdx
    wordM.current.position.x = (0.5 - f) * 3.2
    wordM.current.material.opacity = 0.16 * Math.sin(clamp(f, 0, 1) * Math.PI) ** 0.35 * (1 - seg(p, 2.9, 3.05))
    shadow.current.material.opacity = Math.max(so, cv) * 0.8
    root.current.rotation.y = Math.sin(t * 0.15) * 0.04 + (p < 3 ? p * 0.12 : 0.36)
    root.current.scale.setScalar(mobile ? 0.8 : 1)
  })
  useEffect(() => { document.fonts?.ready?.then(() => { lastWord.current = '' }) }, [])

  return (
    <group>
      <mesh ref={wordM} position={[0, 3.4, -9]} renderOrder={-1}>
        <planeGeometry args={[24, 24 * 400 / 2048]} />
        <meshBasicMaterial map={word.t} transparent depthWrite={false} fog={false} opacity={0} toneMapped={false} />
      </mesh>
      <group ref={root}>
        <mesh ref={shadow} rotation-x={-Math.PI / 2} position={[0.2, 0.004, -0.4]}>
          <planeGeometry args={[9, 7]} />
          <meshBasicMaterial map={shadowTex} transparent depthWrite={false} opacity={0} />
        </mesh>
        <primitive object={ink.line} />
        <group ref={solid}>
          {FLOORS.map((f, i) => (
            <group key={i} position={[f.x, f.y + f.h / 2, f.z]}>
              <mesh material={solidMat}><boxGeometry args={[f.w, f.h, f.d]} /></mesh>
              <mesh material={winMat} position={[0, -0.02, f.d / 2 + 0.006]}><boxGeometry args={[f.w * 0.84, f.h * 0.52, 0.02]} /></mesh>
            </group>
          ))}
          <mesh material={solidMat} position={[FLOORS[3].x, TOP + 0.03, FLOORS[3].z + 0.2]}><boxGeometry args={[FLOORS[3].w + 0.9, 0.06, FLOORS[3].d + 0.8]} /></mesh>
        </group>
        <group ref={env} position={[0.2, 2.7, -0.4]}>
          <primitive object={envLine} />
          <mesh material={envMat}><boxGeometry args={[7, 5.4, 5.2]} /></mesh>
        </group>
        <primitive object={plot} position={[0.2, 0.01, -0.4]} />
        <mesh ref={stamp} rotation-x={-Math.PI / 2} position={[FLOORS[3].x, TOP + 0.1, FLOORS[3].z + 0.2]}>
          <planeGeometry args={[1.5, 1.5]} />
          <meshBasicMaterial map={stampTex} transparent depthWrite={false} toneMapped={false} opacity={0} />
        </mesh>
        <group ref={con}>
          {parts.map(P => (
            <group key={P.i} ref={el => (floorsRef.current[P.i] = el)}>
              <mesh material={concrete} position={[P.f.x, P.f.y + 0.08, P.f.z]}><boxGeometry args={[P.f.w, 0.16, P.f.d]} /></mesh>
              <group><instancedMesh ref={el => (instRefs.current[P.i * 2] = el)} args={[colGeo, colMat, P.cols.length]} /></group>
              <group><instancedMesh ref={el => (instRefs.current[P.i * 2 + 1] = el)} args={[finGeo, finMat, P.fins.length]} /></group>
              <group><mesh material={glassMat} position={[P.f.x, P.f.y + 0.54, P.f.z + P.f.d / 2 - 0.05]}><boxGeometry args={[P.f.w - 0.2, 0.74, 0.04]} /></mesh></group>
            </group>
          ))}
          <mesh material={concrete} position={[FLOORS[3].x, TOP + 0.08, FLOORS[3].z + 0.2]}><boxGeometry args={[FLOORS[3].w + 0.9, 0.14, FLOORS[3].d + 0.8]} /></mesh>
        </group>
      </group>
    </group>
  )
}

/* ---------- photos for 04 / 05 ---------- */
function Photos({ pd, mobile }) {
  const a = useRef(), b = useRef()
  useFrame((st, dt) => {
    const p = pd.current, t = st.clock.elapsedTime
    if (a.current) {
      const o = seg(p, 3.0, 3.4) * (1 - seg(p, 3.88, 4.18))
      a.current.uOpacity.value = o; a.current.uReveal.value = damp(a.current.uReveal.value, o, 3, dt)
      a.current.uSweep.value = -0.3 + seg(p, 3.2, 3.95) * 1.6
    }
    if (b.current) {
      const o = seg(p, 3.92, 4.3)
      b.current.uOpacity.value = o; b.current.uReveal.value = damp(b.current.uReveal.value, o, 3, dt)
      b.current.uSweep.value = -0.3 + seg(p, 4.2, 4.95) * 1.6
    }
  })
  const segs = mobile ? 130 : 240
  return (
    <group position={[0, 2.3, -13]}>
      <DPhoto id={98} width={13} segs={segs} u={a} position={[0, 0, 0]} />
      <DPhoto id={130} width={16} segs={segs} u={b} position={[0, 0, -0.6]} />
    </group>
  )
}

/* ---------- camera: keyframed path, damped ---------- */
const KEYS = [
  { p: [10.5, 6.6, 13.5], t: [0.2, 1.8, 0], o: 0.35 },
  { p: [-9.2, 9.6, 12.2], t: [0.2, 1.9, 0], o: -0.25 },
  { p: [13.4, 6.2, 12.6], t: [0.2, 3.3, 0], o: 0.3 },
  { p: [0, 2.3, -2.0], t: [0, 2.3, -13], o: 0, dolly: 2.6 },
  { p: [-0.6, 2.5, -1.6], t: [0, 2.2, -13], o: 0, swing: 2.0 },
]
function Rig({ progress, pd, mobile }) {
  const { camera, size } = useThree()
  const cur = useRef({ p: new THREE.Vector3(...KEYS[0].p), t: new THREE.Vector3(...KEYS[0].t) })
  const A = useMemo(() => ({ p: new THREE.Vector3(), t: new THREE.Vector3(), q: new THREE.Vector3(), r: new THREE.Vector3() }), [])
  useEffect(() => { camera.fov = mobile ? 52 : 38; camera.updateProjectionMatrix() }, [camera, mobile])
  const off = useRef(-1)
  const keyAt = (i, f, outP, outT) => {
    const k = KEYS[i]
    outP.set(...k.p); outT.set(...k.t)
    const orbit = (f - 0.5) * k.o
    if (k.o) { const dx = outP.x - outT.x, dz = outP.z - outT.z; const c = Math.cos(orbit), s = Math.sin(orbit); outP.x = outT.x + dx * c - dz * s; outP.z = outT.z + dx * s + dz * c }
    if (k.dolly) outP.z -= ease(f) * k.dolly
    if (k.swing) { outP.x += (f - 0.5) * k.swing; outP.z -= f * 0.8 }
  }
  useFrame((st, dt) => {
    const d = Math.min(dt, 0.05)
    const target = clamp(progress.get() * 5, 0, 5)
    pd.current = damp(pd.current, target, 5, d)
    const p = pd.current
    const x = clamp(p - 0.5, 0, 3.999), i = Math.floor(x), f = x - i
    const m = ease(seg(f, 0.3, 0.75))
    keyAt(i, clamp(p - i, 0, 1), A.p, A.t)
    keyAt(Math.min(4, i + 1), clamp(p - i - 1, 0, 1), A.q, A.r)
    if (p < 0.5) { keyAt(0, p, A.p, A.t); A.q.copy(A.p); A.r.copy(A.t) }
    A.p.lerp(A.q, p < 0.5 ? 0 : m); A.t.lerp(A.r, p < 0.5 ? 0 : m)
    // when the camera travels from the building to the photos, lift it in an arc
    const arc = i === 2 ? Math.sin(m * Math.PI) * 3.2 : 0
    A.p.y += arc
    A.p.x += st.pointer.x * 0.35; A.p.y += st.pointer.y * 0.22
    cur.current.p.x = damp(cur.current.p.x, A.p.x, 3.2, d); cur.current.p.y = damp(cur.current.p.y, A.p.y, 3.2, d); cur.current.p.z = damp(cur.current.p.z, A.p.z, 3.2, d)
    cur.current.t.x = damp(cur.current.t.x, A.t.x, 3.2, d); cur.current.t.y = damp(cur.current.t.y, A.t.y, 3.2, d); cur.current.t.z = damp(cur.current.t.z, A.t.z, 3.2, d)
    camera.position.copy(cur.current.p); camera.lookAt(cur.current.t)
    const o = 1 - seg(p, 2.85, 3.3) * 0.75
    if (Math.abs(o - off.current) > 0.002 || camera.view?.fullWidth !== size.width || camera.view?.fullHeight !== size.height) {
      off.current = o; const W = size.width, H = size.height
      if (mobile) camera.setViewOffset(W, H, 0, H * 0.13 * o, W, H)
      else camera.setViewOffset(W, H, -W * 0.16 * o, 0, W, H)
    }
  })
  return null
}

function Lights({ pd }) {
  const key = useRef(), amb = useRef()
  const day = useMemo(() => new THREE.Color('#fff1dc'), []), dusk = useMemo(() => new THREE.Color('#ffc08a'), [])
  useFrame(() => {
    const k = seg(pd.current, 1.2, 3.0)
    key.current.color.copy(day).lerp(dusk, k)
    key.current.intensity = lerp(2.8, 2.2, k)
    amb.current.intensity = lerp(0.4, 0.22, k)
  })
  return (
    <>
      <ambientLight ref={amb} intensity={0.35} color="#b9c4cc" />
      <directionalLight ref={key} position={[6, 9, 5]} intensity={2.6} />
      <directionalLight position={[-7, 4, -3]} intensity={0.6} color="#7f9bb0" />
    </>
  )
}

/* full-bleed colour chapters: ink → lake → ochre → ink (photos) */
export const CHAPTER = ['#100f0e', '#1f3a47', '#a35d2c', '#121110', '#121110']
function Fog({ pd }) {
  const { scene } = useThree()
  const cols = useMemo(() => CHAPTER.map(c => new THREE.Color(c)), [])
  useLayoutEffect(() => {
    scene.fog = new THREE.Fog('#100f0e', 16, 44); scene.background = new THREE.Color('#100f0e')
    return () => { scene.fog = null; scene.background = null }
  }, [scene])
  useFrame(() => {
    const p = pd.current, x = clamp(p - 0.5, 0, 3.999), i = Math.floor(x), m = ease(seg(x - i, 0.3, 0.75))
    scene.background.copy(cols[i]).lerp(cols[Math.min(4, i + 1)], p < 0.5 ? 0 : m)
    scene.fog.color.copy(scene.background)
  })
  return null
}

export default function StudioFilm({ progress, active, mobile, words }) {
  const pd = useRef(0)
  return (
    <Canvas frameloop={active ? 'always' : 'never'} dpr={[1, mobile ? 1.5 : 1.6]} gl={{ antialias: !mobile ? false : true, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping }}
      camera={{ position: [7.5, 5.2, 9.5], fov: 38, near: 0.1, far: 80 }} style={{ position: 'absolute', inset: 0 }}>
      <Fog pd={pd} />
      <Rig progress={progress} pd={pd} mobile={mobile} />
      <Lights pd={pd} />
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={3} color="#ffe2bf" position={[5, 6, 6]} scale={[8, 4, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#9fb6c8" position={[-6, 3, -4]} scale={[6, 6, 1]} />
        <Lightformer form="ring" intensity={2} color="#ffffff" position={[0, 8, 0]} scale={4} />
      </Environment>
      <Grid position={[0, 0, 0]} args={[40, 40]} infiniteGrid cellSize={0.5} cellThickness={0.6} cellColor="#2b2824" sectionSize={2.5} sectionThickness={1} sectionColor="#4d4234" fadeDistance={34} fadeStrength={1.6} />
      <Building pd={pd} words={words} mobile={mobile} />
      <React.Suspense fallback={null}><Photos pd={pd} mobile={mobile} /></React.Suspense>
      {!mobile && (
        <EffectComposer multisampling={4} disableNormalPass>
          <Bloom mipmapBlur intensity={0.85} luminanceThreshold={0.78} luminanceSmoothing={0.2} />
          <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.35} />
          <Vignette offset={0.28} darkness={0.72} />
        </EffectComposer>
      )}
    </Canvas>
  )
}
