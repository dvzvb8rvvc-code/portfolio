import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, ContactShadows } from '@react-three/drei'

/* Exploded premium sedan. progress 0..1 drives: assemble -> explode -> focus engine/gearbox/suspension/electronics -> reassemble */
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const sm = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t) }
const bump = (a, b, c, d, x) => sm(a, b, x) * (1 - sm(c, d, x))
const ACC = '#0066ff'
export const CH = [[0.15, 0.2, 0.33, 0.37], [0.35, 0.4, 0.51, 0.55], [0.53, 0.58, 0.69, 0.73], [0.71, 0.76, 0.85, 0.89]]
const explodeOf = p => sm(0.07, 0.2, p) * (1 - sm(0.87, 0.97, p))

function bodyShape() {
  const s = new THREE.Shape()
  s.moveTo(-2.4, 0.36)
  s.lineTo(-1.9, 0.3)
  s.absarc(-1.45, 0.34, 0.44, Math.PI, 0, true)
  s.lineTo(1.06, 0.3)
  s.absarc(1.5, 0.34, 0.44, Math.PI, 0, true)
  s.lineTo(2.3, 0.32)
  s.quadraticCurveTo(2.46, 0.36, 2.45, 0.58)
  s.quadraticCurveTo(2.43, 0.78, 2.18, 0.83)
  s.lineTo(0.98, 0.93)
  s.quadraticCurveTo(0.48, 1.3, 0.02, 1.4)
  s.lineTo(-0.86, 1.39)
  s.quadraticCurveTo(-1.42, 1.34, -1.8, 0.99)
  s.lineTo(-2.28, 0.95)
  s.quadraticCurveTo(-2.43, 0.9, -2.43, 0.7)
  s.lineTo(-2.4, 0.36)
  return s
}
function glassShape() {
  const s = new THREE.Shape()
  s.moveTo(0.86, 0.97)
  s.quadraticCurveTo(0.42, 1.28, 0.02, 1.33)
  s.lineTo(-0.84, 1.32)
  s.quadraticCurveTo(-1.32, 1.28, -1.63, 1.0)
  s.lineTo(0.86, 0.97)
  return s
}
/* narrow the greenhouse like a real sedan */
function taper(geo, depth) {
  const p = geo.attributes.position
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i), k = THREE.MathUtils.lerp(1, 0.8, clamp((y - 0.9) / 0.5))
    p.setZ(i, p.getZ(i) * k)
  }
  geo.computeVertexNormals()
  return geo
}

function Wheel({ pos, side, e }) {
  const g = useRef()
  useFrame(() => { g.current.position.z = pos[2] + side * 0.55 * e.current })
  return (
    <group ref={g} position={pos}>
      <mesh rotation-x={Math.PI / 2}><cylinderGeometry args={[0.37, 0.37, 0.26, 40]} /><meshStandardMaterial color="#1b1c1f" roughness={0.8} /></mesh>
      <mesh rotation-x={Math.PI / 2} position-z={side * 0.132}><cylinderGeometry args={[0.25, 0.25, 0.012, 40]} /><meshStandardMaterial color="#d6d9de" metalness={1} roughness={0.18} /></mesh>
      {[0, 1, 2, 3, 4].map(k => (
        <mesh key={k} position-z={side * 0.14} rotation-z={(k / 5) * Math.PI * 2}>
          <boxGeometry args={[0.05, 0.42, 0.012]} /><meshStandardMaterial color="#9ea3aa" metalness={1} roughness={0.25} />
        </mesh>
      ))}
    </group>
  )
}

/* shared helper: blend a material between "ghost" and its own colour depending on focus */
function useFocusMat(base, opts = {}) {
  return useMemo(() => {
    const m = new THREE.MeshStandardMaterial({ color: base, metalness: opts.metalness ?? 0.6, roughness: opts.roughness ?? 0.35, emissive: opts.emissive || '#000000', emissiveIntensity: opts.ei ?? 0 })
    m.userData.base = new THREE.Color(base)
    return m
  }, [])
}
const GHOST = new THREE.Color('#dfe1e6')
function applyFocus(m, f, any) {
  // when some chapter is focused, other parts fade to ghost grey
  const k = any ? (0.25 + 0.75 * f) : 1
  m.color.copy(GHOST).lerp(m.userData.base, k)
}

function Engine({ st }) {
  const g = useRef()
  const block = useFocusMat('#3b3e44', { metalness: 0.7, roughness: 0.4 })
  const alu = useFocusMat('#c3c8cf', { metalness: 1, roughness: 0.22 })
  const acc = useFocusMat(ACC, { metalness: 0.2, roughness: 0.4, emissive: ACC, ei: 0 })
  useFrame(() => {
    const { e, f, any } = st.current
    g.current.position.set(1.42 + 0.35 * e, 0.62 + 0.18 * e + 0.55 * f[0], 0)
    g.current.rotation.y = f[0] * 0.5
    ;[block, alu].forEach(m => applyFocus(m, f[0], any))
    applyFocus(acc, f[0], any); acc.emissiveIntensity = f[0] * 0.8
  })
  return (
    <group ref={g}>
      <mesh material={block}><boxGeometry args={[0.78, 0.42, 0.62]} /></mesh>
      <mesh material={alu} position={[0, 0.3, 0]}><boxGeometry args={[0.74, 0.16, 0.5]} /></mesh>
      {[-0.27, -0.09, 0.09, 0.27].map(x => <mesh key={x} material={alu} position={[x, 0.43, 0]}><cylinderGeometry args={[0.055, 0.055, 0.14, 20]} /></mesh>)}
      <mesh material={acc} position={[0, 0.46, 0.18]} rotation-z={Math.PI / 2}><cylinderGeometry args={[0.035, 0.035, 0.7, 12]} /></mesh>
      <mesh material={alu} position={[0.42, -0.02, 0]} rotation-z={Math.PI / 2}><cylinderGeometry args={[0.15, 0.15, 0.06, 32]} /></mesh>
      <mesh material={block} position={[0.42, 0.12, 0.2]} rotation-z={Math.PI / 2}><cylinderGeometry args={[0.07, 0.07, 0.06, 24]} /></mesh>
    </group>
  )
}

function Gearbox({ st }) {
  const g = useRef(), shaft = useRef()
  const alu = useFocusMat('#b9bec6', { metalness: 1, roughness: 0.28 })
  const dark = useFocusMat('#2c2f34', { metalness: 0.6, roughness: 0.4 })
  const acc = useFocusMat(ACC, { metalness: 0.2, roughness: 0.4, emissive: ACC })
  const lathe = useMemo(() => {
    const pts = [[0, 0], [0.3, 0], [0.31, 0.12], [0.24, 0.3], [0.2, 0.6], [0.17, 0.85], [0.1, 0.95], [0, 0.95]].map(([x, y]) => new THREE.Vector2(x, y))
    return new THREE.LatheGeometry(pts, 40)
  }, [])
  useFrame(() => {
    const { e, f, any } = st.current
    g.current.position.set(0.9 + 0.1 * e, 0.55 - 0.05 * e + 0.5 * f[1], 0)
    g.current.rotation.x = f[1] * Math.PI * 0.6
    shaft.current.position.y = 0.42 - 0.12 * e
    ;[alu, dark].forEach(m => applyFocus(m, f[1], any))
    applyFocus(acc, f[1], any); acc.emissiveIntensity = f[1] * 0.8
  })
  return (
    <>
      <group ref={g}>
        <mesh geometry={lathe} material={alu} rotation-z={Math.PI / 2} />
        {[0.2, 0.45, 0.7].map(x => <mesh key={x} material={acc} position={[-x, 0, 0]} rotation-y={Math.PI / 2}><torusGeometry args={[0.24 - x * 0.08, 0.012, 8, 40]} /></mesh>)}
      </group>
      <group ref={shaft} position={[0, 0.42, 0]}>
        <mesh material={dark} position={[-0.6, 0, 0]} rotation-z={Math.PI / 2}><cylinderGeometry args={[0.04, 0.04, 1.7, 12]} /></mesh>
        <mesh material={dark} position={[-1.45, 0, 0]}><sphereGeometry args={[0.17, 32, 24]} /></mesh>
      </group>
    </>
  )
}

function Strut({ x, z, side, st }) {
  const g = useRef(), bell = useRef([])
  const chrome = useFocusMat('#d9dce1', { metalness: 1, roughness: 0.15 })
  const rubber = useFocusMat('#232427', { metalness: 0.1, roughness: 0.7 })
  const acc = useFocusMat(ACC, { metalness: 0.2, roughness: 0.4, emissive: ACC })
  useFrame(s => {
    const { e, f, any } = st.current
    g.current.position.set(x, 0.62 - 0.1 * e - 0.2 * f[2], z + side * (0.3 * e))
    const breathe = 1 + Math.sin(s.clock.elapsedTime * 2.2 + x) * 0.07 * f[2]
    bell.current.forEach(b => b && b.scale.setScalar(breathe))
    ;[chrome, rubber].forEach(m => applyFocus(m, f[2], any))
    applyFocus(acc, f[2], any); acc.emissiveIntensity = f[2] * 0.9
  })
  return (
    <group ref={g} position={[x, 0.62, z]}>
      <mesh material={chrome} position={[0, -0.12, 0]}><cylinderGeometry args={[0.035, 0.035, 0.5, 14]} /></mesh>
      {[0.1, 0.2, 0.3].map((y, k) => <mesh key={y} ref={el => (bell.current[k] = el)} material={rubber} position={[0, y, 0]} rotation-x={Math.PI / 2}><torusGeometry args={[0.1, 0.055, 12, 28]} /></mesh>)}
      <mesh material={acc} position={[0, 0.4, 0]}><cylinderGeometry args={[0.13, 0.13, 0.03, 28]} /></mesh>
    </group>
  )
}

function Electronics({ st }) {
  const g = useRef(), wires = useRef()
  const box = useFocusMat('#2a2c31', { metalness: 0.4, roughness: 0.45 })
  const acc = useFocusMat(ACC, { metalness: 0.1, roughness: 0.4, emissive: ACC })
  const tubes = useMemo(() => {
    const paths = [
      [[1.2, 0.95, 0.25], [0.6, 1.05, 0.4], [-0.2, 0.9, 0.45], [-1.2, 0.95, 0.35], [-1.9, 0.8, 0.2]],
      [[1.2, 0.95, -0.25], [0.4, 1.0, -0.42], [-0.6, 0.95, -0.4], [-1.6, 0.85, -0.3]],
      [[0.2, 0.75, 0], [0.1, 1.05, 0.2], [-0.4, 1.15, 0.1], [-0.9, 1.0, -0.2]],
    ]
    return paths.map(p => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(p.map(v => new THREE.Vector3(...v))), 60, 0.018, 6, false))
  }, [])
  useFrame(s => {
    const { e, f, any } = st.current
    g.current.position.y = 0.05 * e + 0.7 * f[3]
    applyFocus(box, f[3], any); applyFocus(acc, f[3], any)
    acc.emissiveIntensity = f[3] * (0.8 + 0.6 * Math.sin(s.clock.elapsedTime * 5))
  })
  return (
    <group ref={g}>
      {tubes.map((t, i) => <mesh key={i} geometry={t} material={acc} />)}
      {[[1.15, 0.98, 0.25], [-0.15, 0.95, 0.5], [-0.95, 1.05, -0.22], [-1.85, 0.82, 0.2]].map((p, i) => (
        <group key={i} position={p}>
          <mesh material={box}><boxGeometry args={[0.22, 0.08, 0.16]} /></mesh>
          <mesh material={acc} position={[0, 0.045, 0]}><boxGeometry args={[0.08, 0.01, 0.08]} /></mesh>
        </group>
      ))}
    </group>
  )
}

function Body({ st }) {
  const g = useRef(), paint = useRef(), glassM = useRef()
  const body = useMemo(() => { const e = new THREE.ExtrudeGeometry(bodyShape(), { depth: 1.66, bevelEnabled: true, bevelSize: 0.08, bevelThickness: 0.1, bevelSegments: 5, curveSegments: 24, steps: 1 }); e.translate(0, 0, -0.83); return taper(e) }, [])
  const glass = useMemo(() => { const e = new THREE.ExtrudeGeometry(glassShape(), { depth: 1.72, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04, bevelSegments: 2, curveSegments: 16 }); e.translate(0, 0, -0.86); return taper(e) }, [])
  useFrame(() => {
    const { e } = st.current
    g.current.position.y = 1.75 * e
    const o = 1 - 0.86 * e
    paint.current.opacity = o; glassM.current.opacity = o
    paint.current.transparent = glassM.current.transparent = o < 0.99
    paint.current.depthWrite = glassM.current.depthWrite = o > 0.6
  })
  return (
    <group ref={g}>
      <mesh geometry={body}><meshPhysicalMaterial ref={paint} color="#c9cdd3" metalness={0.75} roughness={0.26} clearcoat={1} clearcoatRoughness={0.06} envMapIntensity={1.3} /></mesh>
      <mesh geometry={glass}><meshPhysicalMaterial ref={glassM} color="#14161a" metalness={0.3} roughness={0.06} clearcoat={1} envMapIntensity={1.5} /></mesh>
      <mesh position={[2.44, 0.66, 0.6]}><boxGeometry args={[0.04, 0.06, 0.34]} /><meshBasicMaterial color="#ffffff" toneMapped={false} /></mesh>
      <mesh position={[2.44, 0.66, -0.6]}><boxGeometry args={[0.04, 0.06, 0.34]} /><meshBasicMaterial color="#ffffff" toneMapped={false} /></mesh>
      <mesh position={[-2.44, 0.8, 0]}><boxGeometry args={[0.03, 0.04, 1.5]} /><meshBasicMaterial color="#c4161c" toneMapped={false} /></mesh>
    </group>
  )
}

function Chassis({ st }) {
  const floor = useFocusMat('#9a9ea6', { metalness: 0.8, roughness: 0.4 })
  useFrame(() => { const { any } = st.current; applyFocus(floor, 0, any) })
  return <mesh material={floor} position={[0, 0.36, 0]}><boxGeometry args={[4.3, 0.04, 1.3]} /></mesh>
}

function Rig({ progress, st }) {
  const { camera, size } = useThree()
  const look = useMemo(() => new THREE.Vector3(), [])
  React.useEffect(() => { camera.fov = size.width < 768 ? 46 : 30; camera.updateProjectionMatrix() }, [size.width])
  useFrame(s => {
    const p = progress.get()
    const e = explodeOf(p)
    const f = CH.map(c => bump(...c, p))
    st.current = { e, f, any: Math.max(...f) }
    const mob = size.width < 768
    const th = THREE.MathUtils.lerp(-0.85, 0.95, p) + s.pointer.x * 0.08
    const r = (mob ? 12.4 : 10.4) + e * 1.2
    const ty = 2.2 + e * 1.4 + s.pointer.y * 0.25
    camera.position.x += (r * Math.sin(th) - camera.position.x) * 0.1
    camera.position.y += (ty - camera.position.y) * 0.1
    camera.position.z += (r * Math.cos(th) - camera.position.z) * 0.1
    const h = 1 - sm(0, 0.07, p)
    look.set(0, (mob ? -0.9 : -0.25) + 0.9 * e + h * (mob ? 2.1 : 1.45), 0)
    camera.lookAt(look)
  })
  return null
}

export default function SedanFilm({ progress, active }) {
  const st = useRef({ e: 0, f: [0, 0, 0, 0], any: 0 })
  return (
    <Canvas dpr={[1, 1.6]} frameloop={active ? 'always' : 'never'} camera={{ position: [0, 2.4, 10], fov: 30 }} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 8, 5]} intensity={1.1} />
      <Rig progress={progress} st={st} />
      <group>
        <Body st={st} />
        <Chassis st={st} />
        <Engine st={st} />
        <Gearbox st={st} />
        {[[1.5, 0.62, 1], [1.5, -0.62, -1], [-1.45, 0.62, 1], [-1.45, -0.62, -1]].map(([x, z, s], i) => <Strut key={i} x={x} z={z} side={s} st={st} />)}
        <Electronics st={st} />
        {[[1.5, 0.37, 0.82, 1], [1.5, 0.37, -0.82, -1], [-1.45, 0.37, 0.82, 1], [-1.45, 0.37, -0.82, -1]].map(([x, y, z, s], i) => <WheelBind key={i} pos={[x, y, z]} side={s} st={st} />)}
      </group>
      <ContactShadows position={[0, 0, 0]} scale={[9, 5]} resolution={256} blur={2.4} far={3} opacity={0.42} color="#20242c" />
      <Environment resolution={256}>
        <color attach="background" args={['#f4f5f7']} />
        <Lightformer form="rect" intensity={4} position={[0, 7, 0]} rotation-x={Math.PI / 2} scale={[12, 3, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={2} position={[-7, 2, 0]} rotation-y={Math.PI / 2} scale={[10, 1, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={1.6} position={[7, 3, 2]} rotation-y={-Math.PI / 2} scale={[10, 2, 1]} color="#eef3ff" />
        <Lightformer form="rect" intensity={0.6} position={[0, -2, 0]} rotation-x={-Math.PI / 2} scale={[10, 10, 1]} color="#9aa3b2" />
      </Environment>
    </Canvas>
  )
}

function WheelBind({ pos, side, st }) {
  const e = useRef(0)
  useFrame(() => { e.current = st.current.e + 0.5 * st.current.f[2] })
  return <Wheel pos={pos} side={side} e={e} />
}
