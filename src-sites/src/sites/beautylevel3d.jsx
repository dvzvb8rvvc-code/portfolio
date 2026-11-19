import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, RoundedBox } from '@react-three/drei'

/* cut-away tower of five "levels"; a glass-and-brass lift cabin rides to the level you are reading */
const H = 1.5
const BRASS = '#c9a46a'
const WALLS = ['#5a2a3d', '#6b3247', '#4e2536', '#6a3a4a', '#7a3f2e']

function Hair() {
  const geo = useMemo(() => {
    const pts = []
    for (let i = 0; i <= 60; i++) { const t = i / 60; pts.push(new THREE.Vector3((t - 0.5) * 1.5, Math.sin(t * Math.PI * 3) * 0.16, Math.cos(t * Math.PI * 2) * 0.12)) }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 120, 0.035, 8, false)
  }, [])
  return <group>{[0, 1, 2, 3].map(i => <mesh key={i} geometry={geo} position={[0, i * 0.09 - 0.12, i * 0.03]} rotation-z={i * 0.06}><meshStandardMaterial color={i % 2 ? '#e3b98a' : BRASS} metalness={0.6} roughness={0.28} /></mesh>)}</group>
}
function Nails() {
  return <group>{[-2, -1, 0, 1, 2].map(i => <mesh key={i} position={[i * 0.27, -Math.abs(i) * 0.06, 0]} rotation-z={-i * 0.12}><capsuleGeometry args={[0.085, 0.22, 6, 18]} /><meshStandardMaterial color={['#e9a6a6', '#d9777f', '#f1c7bd', '#c45c6a', '#eab3a0'][i + 2]} roughness={0.15} metalness={0.1} /></mesh>)}</group>
}
function Lashes() {
  return (
    <group>
      {Array.from({ length: 15 }, (_, i) => { const a = Math.PI * (0.15 + (i / 14) * 0.7); return <mesh key={i} position={[Math.cos(a) * 0.5, Math.sin(a) * 0.5 - 0.35, 0]} rotation-z={a - Math.PI / 2}><cylinderGeometry args={[0.008, 0.018, 0.34, 6]} /><meshStandardMaterial color="#1b0d12" roughness={0.4} /></mesh> })}
      <mesh position={[0, -0.35, 0]} rotation-x={Math.PI / 2}><torusGeometry args={[0.36, 0.025, 8, 40, Math.PI]} /><meshStandardMaterial color={BRASS} metalness={1} roughness={0.25} /></mesh>
    </group>
  )
}
function Drop() {
  return (
    <group position-y={-0.08}>
      <mesh><sphereGeometry args={[0.3, 40, 40]} /><meshStandardMaterial color="#f3d9cf" roughness={0.08} metalness={0.05} /></mesh>
      <mesh position-y={0.36}><coneGeometry args={[0.212, 0.42, 40, 1, true]} /><meshStandardMaterial color="#f3d9cf" roughness={0.08} metalness={0.05} side={THREE.DoubleSide} /></mesh>
    </group>
  )
}
function SunDisc() {
  return (
    <group>
      <mesh><sphereGeometry args={[0.26, 40, 40]} /><meshBasicMaterial color="#ffc46b" toneMapped={false} /></mesh>
      {Array.from({ length: 16 }, (_, i) => { const a = (i / 16) * Math.PI * 2; return <mesh key={i} position={[Math.cos(a) * 0.48, Math.sin(a) * 0.48, 0]} rotation-z={a}><boxGeometry args={[0.2, 0.025, 0.025]} /><meshBasicMaterial color="#ffb347" toneMapped={false} /></mesh> })}
      <pointLight color="#ffb347" intensity={3} distance={2.4} />
    </group>
  )
}
const OBJ = [Hair, Nails, Lashes, Drop, SunDisc]

function Floor({ i }) {
  const o = useRef()
  const O = OBJ[i]
  useFrame(st => { o.current.rotation.y = Math.sin(st.clock.elapsedTime * 0.5 + i) * 0.5 })
  return (
    <group position-y={i * H}>
      <mesh position={[0.35, -0.04, 0]}><boxGeometry args={[3.3, 0.08, 1.8]} /><meshStandardMaterial color="#f1e4d3" roughness={0.6} /></mesh>
      <mesh position={[0.35, H / 2, -0.9]}><planeGeometry args={[3.3, H]} /><meshStandardMaterial color={WALLS[i]} roughness={0.85} /></mesh>
      <mesh position={[0.35, 0.02, 0.9]}><boxGeometry args={[3.3, 0.04, 0.04]} /><meshStandardMaterial color={BRASS} metalness={1} roughness={0.3} /></mesh>
      <group ref={o} position={[0.75, H / 2, -0.1]}><O /></group>
    </group>
  )
}

function Shaft() {
  return (
    <group position={[-1.75, 0, 0]}>
      {[[-0.48, -0.48], [0.48, -0.48], [-0.48, 0.48], [0.48, 0.48]].map(([x, z], k) => (
        <mesh key={k} position={[x, (H * 5) / 2 - 0.05, z]}><boxGeometry args={[0.04, H * 5 + 0.1, 0.04]} /><meshStandardMaterial color={BRASS} metalness={1} roughness={0.3} /></mesh>
      ))}
      <mesh position={[0, (H * 5) / 2, -0.48]}><planeGeometry args={[0.96, H * 5]} /><meshStandardMaterial color="#1c0c15" roughness={0.9} /></mesh>
    </group>
  )
}

function Cabin({ cab }) {
  return (
    <group ref={cab} position={[-1.75, 0, 0]}>
      <RoundedBox args={[0.86, 1.15, 0.86]} radius={0.04} smoothness={2} position-y={0.6}>
        <meshStandardMaterial color="#ffe3b3" emissive="#ffc77a" emissiveIntensity={0.55} transparent opacity={0.42} roughness={0.1} depthWrite={false} />
      </RoundedBox>
      {[0.02, 1.18].map(y => <mesh key={y} position-y={y}><boxGeometry args={[0.92, 0.05, 0.92]} /><meshStandardMaterial color={BRASS} metalness={1} roughness={0.22} /></mesh>)}
      {[[-0.44, 0.44], [0.44, 0.44]].map(([x, z]) => <mesh key={x} position={[x, 0.6, z]}><boxGeometry args={[0.035, 1.15, 0.035]} /><meshStandardMaterial color={BRASS} metalness={1} roughness={0.22} /></mesh>)}
      <pointLight position={[0, 0.7, 0.2]} color="#ffcf8a" intensity={2.2} distance={2.6} />
    </group>
  )
}

function Rig({ level }) {
  const g = useRef(), cab = useRef()
  const { size, camera } = useThree()
  useFrame((st, dt) => {
    const l = level.get(), mob = size.width < 700
    const y = THREE.MathUtils.clamp(l, 0, 4) * H
    cab.current.position.y = THREE.MathUtils.damp(cab.current.position.y, y + 0.06, 6, dt)
    const cy = cab.current.position.y + 0.7
    camera.position.y = THREE.MathUtils.damp(camera.position.y, cy + 0.6, 4, dt)
    camera.position.x = THREE.MathUtils.damp(camera.position.x, (mob ? 0.2 : 0.6) + st.pointer.x * 0.5, 4, dt)
    camera.position.z = mob ? 7.6 : 6.6
    camera.lookAt(-0.1, cy, 0)
    g.current.rotation.y = THREE.MathUtils.damp(g.current.rotation.y, 0.42 + st.pointer.x * 0.12, 3, dt)
  })
  return (
    <group ref={g}>
      {[0, 1, 2, 3, 4].map(i => <Floor key={i} i={i} />)}
      <mesh position={[0.35, H * 5 - 0.04, 0]}><boxGeometry args={[3.3, 0.08, 1.8]} /><meshStandardMaterial color="#f1e4d3" roughness={0.6} /></mesh>
      <Shaft />
      <Cabin cab={cab} />
    </group>
  )
}

export default function LiftScene({ level, active }) {
  return (
    <Canvas frameloop={active ? 'always' : 'never'} dpr={[1, 1.6]} camera={{ position: [0.6, 1.5, 6.6], fov: 34 }} gl={{ antialias: true, alpha: true }} style={{ pointerEvents: 'none' }}
      eventSource={typeof document !== 'undefined' ? document.getElementById('root') : undefined} eventPrefix="client">
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 6, 5]} intensity={1.2} color="#ffe9d0" />
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={3} position={[0, 4, 4]} scale={[8, 1.5, 1]} />
        <Lightformer form="rect" intensity={1.8} color="#ffcf9a" position={[-5, 1, 2]} rotation-y={Math.PI / 2} scale={[8, 1, 1]} />
        <Lightformer form="ring" intensity={1.4} color="#f4b6c2" position={[5, 2, 1]} rotation-y={-Math.PI / 2} scale={3} />
      </Environment>
      <Rig level={level} />
    </Canvas>
  )
}
