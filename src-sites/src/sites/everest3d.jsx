import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, ContactShadows } from '@react-three/drei'

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const sm = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t) }
const W = 0.6

/* ---------- procedural textures ---------- */
function grainTex(base, line, figure = 1, seed = 1) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 512
  const g = c.getContext('2d')
  g.fillStyle = base; g.fillRect(0, 0, 512, 512)
  let s = seed
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280 }
  for (let i = 0; i < 150; i++) {
    const x0 = rnd() * 512, a = 2 + rnd() * 8 * figure, f = 0.004 + rnd() * 0.01
    g.strokeStyle = line; g.globalAlpha = 0.05 + rnd() * 0.16; g.lineWidth = 0.6 + rnd() * 2.2
    g.beginPath()
    for (let y = 0; y <= 512; y += 8) { const x = x0 + Math.sin(y * f + i) * a + Math.sin(y * 0.03 + i * 3) * figure * 2; y ? g.lineTo(x, y) : g.moveTo(x, y) }
    g.stroke()
  }
  g.globalAlpha = 1
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4
  return t
}
function useMats() {
  return useMemo(() => {
    const oak = grainTex('#c49a6c', '#6e4a2a', 1, 3), walnut = grainTex('#6a4a35', '#2c1b10', 2.2, 7)
    return {
      carcass: new THREE.MeshStandardMaterial({ color: '#ece7de', roughness: 0.7 }),
      plinth: new THREE.MeshStandardMaterial({ color: '#3a3733', roughness: 0.6 }),
      top: new THREE.MeshStandardMaterial({ color: '#d9d4cb', roughness: 0.42, metalness: 0.05 }),
      alu: new THREE.MeshStandardMaterial({ color: '#c8c8c4', metalness: 1, roughness: 0.28 }),
      light: new THREE.MeshBasicMaterial({ color: '#ffd9a0', toneMapped: false }),
      back: new THREE.MeshStandardMaterial({ color: '#e3ddd2', roughness: 0.8 }),
      f1: new THREE.MeshStandardMaterial({ color: '#8b8579', roughness: 0.9 }),
      f2: new THREE.MeshStandardMaterial({ color: '#2f3a42', roughness: 0.9 }),
      f3: new THREE.MeshStandardMaterial({ color: '#d8cbb6', roughness: 0.9 }),
      oak: new THREE.MeshStandardMaterial({ map: oak, roughness: 0.62 }),
      veneer: new THREE.MeshStandardMaterial({ map: walnut, roughness: 0.48 }),
      enamel: new THREE.MeshPhysicalMaterial({ color: '#efe9de', roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.08 }),
      glass: new THREE.MeshStandardMaterial({ color: '#a9b8b5', roughness: 0.05, metalness: 0.3, transparent: true, opacity: 0.42, depthWrite: false }),
    }
  }, [])
}

/* ---------- parametric furniture ---------- */
function runsFor(layout) {
  const nA = layout === 'straight' ? 5 : 4, x0 = -nA * W / 2, x1 = x0 + nA * W
  const R = [{ px: x0, pz: 0, rot: 0, n: nA, wall: true }]
  if (layout !== 'straight') R.push({ px: x0 + 0.3, pz: 0.3 + 3 * W, rot: Math.PI / 2, n: 3, wall: layout === 'l' })
  if (layout === 'u') R.push({ px: x1 - 0.3, pz: 0.3, rot: -Math.PI / 2, n: 3, wall: false })
  return R
}
function moduleParts(type, i, n, wall, glassFront) {
  const P = [], lx = i * W + W / 2
  const add = (k, kind, mat, pos, size, shape = 'box') => P.push({ k, kind, mat, pos: [lx + pos[0], pos[1], pos[2]], size, shape })
  if (type === 'kitchen') {
    add('c', 'carcass', 'carcass', [0, 0.46, -0.02], [W - 0.004, 0.72, 0.56])
    add('p', 'carcass', 'plinth', [0, 0.05, -0.04], [W, 0.1, 0.5])
    if (i % 3 === 1) [0, 1, 2].forEach(d => add('d' + d, 'front', 'front', [0, 0.2 + d * 0.236, 0.27], [W - 0.006, 0.228, 0.02]))
    else add('f', 'front', 'front', [0, 0.46, 0.27], [W - 0.006, 0.7, 0.02])
    add('h', 'front', 'alu', [0, 0.8, 0.285], [W - 0.08, 0.012, 0.02])
    if (wall) {
      add('wc', 'wall', 'carcass', [0, 1.85, -0.14], [W - 0.004, 0.7, 0.32])
      add('wf', glassFront(i) ? 'glass' : 'front', glassFront(i) ? 'glass' : 'front', [0, 1.85, 0.03], [W - 0.006, 0.7, 0.018])
    }
  } else if (type === 'wardrobe') {
    add('c', 'carcass', 'carcass', [0, 1.2, -0.02], [W - 0.004, 2.3, 0.56])
    add('p', 'carcass', 'plinth', [0, 0.03, -0.04], [W, 0.06, 0.5])
    add('f', 'front', 'front', [0, 1.2, 0.27], [W - 0.006, 2.26, 0.02])
    add('h', 'front', 'alu', [(i % 2 ? -1 : 1) * (W / 2 - 0.05), 1.1, 0.29], [0.014, 0.6, 0.02])
  } else {
    add('b', 'carcass', 'back', [0, 1.15, -0.26], [W, 2.3, 0.012])
    add('sl', 'carcass', 'carcass', [-W / 2 + 0.009, 1.15, 0], [0.018, 2.3, 0.52])
    if (i === n - 1) add('sr', 'carcass', 'carcass', [W / 2 - 0.009, 1.15, 0], [0.018, 2.3, 0.52])
    add('s0', 'carcass', 'carcass', [0, 0.04, 0], [W, 0.018, 0.5]); add('s9', 'carcass', 'carcass', [0, 2.0, 0], [W, 0.018, 0.5])
    add('d0', 'front', 'front', [0, 0.16, 0.25], [W - 0.012, 0.2, 0.02]); add('d1', 'front', 'front', [0, 0.38, 0.25], [W - 0.012, 0.2, 0.02])
    if (i % 2 === 0) {
      add('rod', 'top', 'alu', [0, 1.85, 0], [0.012, W - 0.04, 0.012], 'rod')
      ;[-0.18, -0.1, -0.03, 0.06, 0.16].forEach((x, k) => add('cl' + k, 'top', 'f' + (1 + (k + i) % 3), [x, 1.42, 0], [0.04, 0.78, 0.4]))
    } else {
      ;[0.6, 0.95, 1.3, 1.65].forEach((y, k) => add('s' + (k + 1), 'carcass', 'carcass', [0, y, 0], [W - 0.02, 0.018, 0.5]))
      ;[0.6, 0.95, 1.3].forEach((y, k) => add('fold' + k, 'top', 'f' + (1 + (k + i) % 3), [-0.05, y + 0.08, 0.02], [0.32, 0.14, 0.3]))
    }
  }
  return P
}
export function build(type, layout, opts = {}) {
  const out = []
  runsFor(layout).forEach((r, ri) => {
    const c = Math.cos(r.rot), s = Math.sin(r.rot)
    const T = ([x, y, z]) => [r.px + x * c + z * s, y, r.pz - x * s + z * c]
    const parts = []
    for (let i = 0; i < r.n; i++) parts.push(...moduleParts(type, i, r.n, r.wall && type === 'kitchen', opts.glassFront || (k => k % 2 === 1)).map(p => ({ ...p, k: `${ri}-${i}-${p.k}` })))
    if (type === 'kitchen') {
      parts.push({ k: `${ri}-top`, kind: 'top', mat: 'top', pos: [r.n * W / 2, 0.84, 0.01], size: [r.n * W + 0.02, 0.04, 0.62] })
      if (r.wall) parts.push({ k: `${ri}-led`, kind: 'light', mat: 'light', pos: [r.n * W / 2, 1.497, 0.0], size: [r.n * W - 0.04, 0.008, 0.02] })
    }
    if (type === 'wardrobe') parts.push({ k: `${ri}-top`, kind: 'top', mat: 'carcass', pos: [r.n * W / 2, 2.37, -0.01], size: [r.n * W + 0.01, 0.04, 0.6] })
    parts.forEach(p => out.push({ ...p, pos: T(p.pos), rot: r.rot }))
  })
  // centre on origin (x/z)
  let mnx = 1e9, mxx = -1e9, mnz = 1e9, mxz = -1e9
  out.forEach(p => { mnx = Math.min(mnx, p.pos[0]); mxx = Math.max(mxx, p.pos[0]); mnz = Math.min(mnz, p.pos[2]); mxz = Math.max(mxz, p.pos[2]) })
  const cx = (mnx + mxx) / 2, cz = (mnz + mxz) / 2
  out.forEach(p => { p.pos = [p.pos[0] - cx, p.pos[1], p.pos[2] - cz] })
  return { parts: out, span: Math.max(mxx - mnx, mxz - mnz) + 0.6 }
}
const OFF = { carcass: [0, 1.6, -1.4], wall: [0, 1.4, -1.2], front: [0, 0.1, 1.6], glass: [0, 0.3, 1.4], top: [0, 1.3, 0.2], light: [0, 0, 0] }

const rodGeo = new THREE.CylinderGeometry(0.5, 0.5, 1, 12)
const boxGeo = new THREE.BoxGeometry(1, 1, 1)
function Part({ p, mat, getT }) {
  const m = useRef(), born = useRef(null)
  const off = OFF[p.kind] || [0, 0, 0]
  const c = Math.cos(p.rot), s = Math.sin(p.rot)
  const o = [off[0] * c + off[2] * s, off[1], -off[0] * s + off[2] * c]
  useFrame(st => {
    if (born.current === null) born.current = st.clock.elapsedTime
    const t = getT(p, st.clock.elapsedTime - born.current)
    const u = 1 - t
    m.current.visible = t > 0.002
    m.current.position.set(p.pos[0] + o[0] * u, p.pos[1] + o[1] * u, p.pos[2] + o[2] * u)
    if (p.kind === 'light') m.current.scale.set(p.size[0] * Math.max(t, 0.001), p.size[1], p.size[2])
    else if (p.shape === 'rod') m.current.scale.set(p.size[0], p.size[1], p.size[2])
    m.current.rotation.set(p.shape === 'rod' ? 0 : (p.kind === 'front' || p.kind === 'glass' ? -0.7 * u : 0), p.rot + (p.shape === 'rod' ? 0 : 0.4 * u * (p.kind === 'carcass' ? 1 : 0)), p.shape === 'rod' ? Math.PI / 2 : 0)
  })
  return <mesh ref={m} geometry={p.shape === 'rod' ? rodGeo : boxGeo} material={mat} scale={p.shape === 'rod' ? undefined : p.size} />
}

/* ---------- pinned assembly film ---------- */
const RANGES = { carcass: [0.06, 0.3], wall: [0.18, 0.32], front: [0.3, 0.5], top: [0.5, 0.62], glass: [0.62, 0.74], light: [0.72, 0.8] }
function FilmScene({ progress }) {
  const mats = useMats()
  const { parts } = useMemo(() => {
    const r = build('kitchen', 'straight', { glassFront: k => k === 1 || k === 3 })
    const counts = {}, idx = {}
    r.parts.forEach(p => { counts[p.kind] = (counts[p.kind] || 0) + 1 })
    r.parts.forEach(p => { idx[p.kind] = (idx[p.kind] || 0); p.frac = counts[p.kind] > 1 ? idx[p.kind]++ / (counts[p.kind] - 1) : 0 })
    return r
  }, [])
  const getT = p => { const [a, b] = RANGES[p.kind]; const st = a + p.frac * (b - a - 0.05); return sm(st, st + 0.05, progress.get()) }
  const g = useRef()
  const { camera, size } = useThree()
  React.useEffect(() => { camera.fov = size.width < 768 ? 48 : 32; camera.updateProjectionMatrix() }, [size.width])
  const look = useMemo(() => new THREE.Vector3(), [])
  useFrame(st => {
    const p = progress.get(), mob = size.width < 768
    const th = THREE.MathUtils.lerp(0.75, -0.35, p) + st.pointer.x * 0.05
    const r = mob ? 9.4 : 7.6
    camera.position.x += (r * Math.sin(th) + (mob ? 0 : -0.9) - camera.position.x) * 0.08
    camera.position.y += (2.1 + 0.6 * (1 - p) - camera.position.y) * 0.08
    camera.position.z += (r * Math.cos(th) - camera.position.z) * 0.08
    look.set(mob ? 0 : -1.1, mob ? 0.7 : 1.25, 0); camera.lookAt(look)
  })
  return (
    <group ref={g}>
      {parts.map(p => <Part key={p.k} p={p} mat={p.mat === 'front' ? mats.oak : mats[p.mat]} getT={getT} />)}
    </group>
  )
}
function Lights({ warm = '#fff3e2' }) {
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 6, 4]} intensity={1.1} color={warm} />
      <Environment resolution={256}>
        <color attach="background" args={['#efe9df']} />
        <Lightformer form="rect" intensity={3} position={[0, 6, 2]} rotation-x={Math.PI / 2} scale={[10, 4, 1]} color="#fff8ee" />
        <Lightformer form="rect" intensity={1.5} position={[-6, 2, 2]} rotation-y={Math.PI / 2} scale={[6, 3, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={1.2} position={[6, 2, 4]} rotation-y={-Math.PI / 2} scale={[6, 3, 1]} color="#ffe9cc" />
      </Environment>
    </>
  )
}
export function AssemblyFilm({ progress, active }) {
  return (
    <Canvas dpr={[1, 1.6]} frameloop={active ? 'always' : 'never'} camera={{ position: [4, 2.6, 5], fov: 32 }} gl={{ antialias: true, alpha: true }}>
      <Lights />
      <FilmScene progress={progress} />
      <ContactShadows position={[0, 0, 0]} scale={[8, 6]} resolution={256} blur={2.6} far={2.6} opacity={0.38} color="#3b2f22" />
    </Canvas>
  )
}

/* ---------- configurator ---------- */
function ConfigScene({ type, facade, layout }) {
  const mats = useMats()
  const { parts, span } = useMemo(() => build(type, layout), [type, layout])
  const getT = (p, age) => { const d = (OFF[p.kind] ? ['carcass', 'wall', 'top', 'front', 'glass', 'light'].indexOf(p.kind) : 0) * 0.12 + (p.pos[0] + 2) * 0.05; return sm(d, d + 0.55, age) }
  const g = useRef()
  const { camera, size } = useThree()
  React.useEffect(() => { camera.fov = size.width < 768 ? 44 : 34; camera.updateProjectionMatrix() }, [size.width])
  const look = useMemo(() => new THREE.Vector3(0, 0.95, 0), [])
  useFrame(st => {
    const t = st.clock.elapsedTime
    g.current.rotation.y += ((Math.sin(t * 0.25) * 0.35 + st.pointer.x * 0.35) - g.current.rotation.y) * 0.05
    const r = 1.7 + span * 1.05 + (size.width < 768 ? 1.4 : 0)
    camera.position.set(r * 0.55, 0.9 + r * 0.28, r * 0.85)
    camera.lookAt(look)
  })
  const front = mats[facade]
  return (
    <group ref={g}>
      {parts.map(p => <Part key={type + layout + p.k} p={p} mat={p.mat === 'front' ? front : mats[p.mat]} getT={getT} />)}
    </group>
  )
}
export function Configurator({ type, facade, layout, active }) {
  return (
    <Canvas dpr={[1, 1.6]} frameloop={active ? 'always' : 'never'} camera={{ position: [3, 2.3, 5], fov: 34 }} gl={{ antialias: true, alpha: true }}>
      <Lights />
      <ConfigScene type={type} facade={facade} layout={layout} />
      <ContactShadows position={[0, 0, 0]} scale={[9, 9]} resolution={256} blur={2.6} far={2.6} opacity={0.38} color="#3b2f22" />
    </Canvas>
  )
}
export default AssemblyFilm
