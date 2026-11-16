import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, ContactShadows } from '@react-three/drei'

const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }
const C0 = new THREE.Color('#e4e2df'), C1 = new THREE.Color('#efe2d6'), C2 = new THREE.Color('#f7e7dc')
const tmpC = new THREE.Color()

/* abstract porcelain sculpture: a twisted two-lobed ovoid; fine ripples smooth out as you scroll */
function Sculpture({ progress }) {
  const mesh = useRef(), mat = useRef(), grp = useRef()
  const { size } = useThree()
  const geo = useMemo(() => new THREE.SphereGeometry(1, 48, 48), [])
  const base = useMemo(() => Float32Array.from(geo.attributes.position.array), [geo])
  const last = useRef(-1)
  useFrame((st, dt) => {
    const p = progress.get(), t = st.clock.elapsedTime
    const rough = 0.022 * (1 - ss(0.12, 0.42, p))
    const twist = 0.55 + p * 0.5
    const key = Math.round(rough * 2000) + Math.round(twist * 500) * 100 + Math.round(t * 20) * 1e6
    if (key !== last.current) {
      last.current = key
      const pos = geo.attributes.position.array
      for (let i = 0; i < pos.length; i += 3) {
        const nx = base[i], ny = base[i + 1], nz = base[i + 2]
        const th = Math.atan2(nz, nx) + ny * twist * 2.2
        const pole = 1 - ny * ny
        let R = 1 + 0.13 * Math.sin(2 * th + 0.4) * pole + 0.05 * Math.sin(3 * ny + t * 0.4)
        R += rough * pole * (Math.sin(nx * 9 + t * 0.6) * Math.sin(ny * 10) + Math.sin(nz * 8 - t * 0.5) * 0.6)
        pos[i] = nx * R * 0.95; pos[i + 1] = ny * R * 1.32; pos[i + 2] = nz * R * 0.95
      }
      geo.attributes.position.needsUpdate = true
      geo.computeVertexNormals()
    }
    // material: matte -> cared -> glowing
    const a = ss(0.4, 0.62, p), g = ss(0.68, 0.9, p)
    tmpC.copy(C0).lerp(C1, a).lerp(C2, g)
    mat.current.color.copy(tmpC)
    mat.current.roughness = 0.6 - a * 0.25 - g * 0.22
    mat.current.clearcoat = a * 0.4 + g * 0.6
    mat.current.sheen = g * 0.8
    mat.current.emissiveIntensity = 0.03 + g * 0.14
    const mob = size.width < 768
    grp.current.rotation.y = p * Math.PI * 1.5 + t * 0.06 + st.pointer.x * 0.15
    grp.current.rotation.x = 0.12 + st.pointer.y * -0.06
    grp.current.position.set(mob ? 0 : 1.35, 0.1 + Math.sin(t * 0.7) * 0.04, 0)
    grp.current.scale.setScalar(mob ? 0.78 : 0.86)
  })
  return (
    <group ref={grp}>
      <mesh ref={mesh} geometry={geo}>
        <meshPhysicalMaterial ref={mat} color="#e4e2df" roughness={0.6} clearcoat={0} clearcoatRoughness={0.12} sheen={0} sheenColor="#ffd8bf" sheenRoughness={0.4} emissive="#ffcfb0" emissiveIntensity={0} envMapIntensity={1.15} />
      </mesh>
    </group>
  )
}

function Plinth() {
  const { size } = useThree()
  const mob = size.width < 768
  return (
    <mesh position={[mob ? 0 : 1.35, mob ? -1.5 : -1.62, 0]} scale={mob ? 0.8 : 0.9}>
      <cylinderGeometry args={[0.9, 0.9, 0.16, 48]} />
      <meshStandardMaterial color="#e2dbd2" roughness={0.75} />
    </mesh>
  )
}

/* the moving studio light: a strip softbox that sweeps around the sculpture with scroll */
function Sweep({ progress }) {
  const lf = useRef(), dl = useRef()
  useFrame(st => {
    const p = progress.get()
    const a = -1.05 + p * 2.3 + Math.sin(st.clock.elapsedTime * 0.25) * 0.08
    if (lf.current) { lf.current.position.set(Math.sin(a) * 5, 1.5, Math.cos(a) * 5); lf.current.lookAt(0, 0, 0) }
    if (dl.current) dl.current.position.set(Math.sin(a) * 6, 3, Math.cos(a) * 6)
  })
  return (
    <>
      <directionalLight ref={dl} intensity={1.6} color="#fff6ee" />
      <Environment resolution={128} frames={Infinity}>
        <Lightformer ref={lf} form="rect" intensity={7} scale={[1.2, 9, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={1.2} position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[8, 8, 1]} color="#fff3e8" />
        <Lightformer form="rect" intensity={0.7} position={[-5, 0, -3]} rotation-y={Math.PI / 3} scale={[6, 6, 1]} color="#e7ecf2" />
        <Lightformer form="rect" intensity={0.9} position={[5, -1, -4]} rotation-y={-Math.PI / 3} scale={[6, 6, 1]} color="#ffd9c0" />
      </Environment>
    </>
  )
}

function ShadowAt() {
  const { size } = useThree()
  const mob = size.width < 768
  return <ContactShadows position={[mob ? 0 : 1.35, mob ? -1.43 : -1.54, 0]} scale={5} blur={2.8} far={2} opacity={0.35} color="#6d5b4c" resolution={256} />
}

export default function SculptureScene({ progress, active }) {
  return (
    <Canvas frameloop={active ? 'always' : 'never'} dpr={[1, 1.6]} camera={{ position: [0, 0.1, 7.6], fov: 35 }} gl={{ antialias: true, alpha: true }} style={{ pointerEvents: 'none' }}
      eventSource={typeof document !== 'undefined' ? document.getElementById('root') : undefined} eventPrefix="client">
      <ambientLight intensity={0.55} />
      <Sculpture progress={progress} />
      <Plinth />
      <ShadowAt />
      <Sweep progress={progress} />
    </Canvas>
  )
}
