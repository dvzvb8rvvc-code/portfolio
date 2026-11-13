import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Lightformer, RoundedBox, ContactShadows, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

function Paint({ target, cham }) {
  const ref = useRef()
  const c = useMemo(() => new THREE.Color(), [])
  useFrame((s) => {
    if (!ref.current) return
    if (cham) { c.setHSL((s.clock.elapsedTime * 0.08) % 1, 0.75, 0.5) } else c.set(target)
    ref.current.color.lerp(c, 0.08)
  })
  return <meshPhysicalMaterial ref={ref} color={target === 'cham' ? '#a855f7' : target} metalness={0.55} roughness={0.22} clearcoat={1} clearcoatRoughness={0.06} iridescence={cham ? 1 : 0.35} iridescenceIOR={1.6} />
}

function Car({ color }) {
  const g = useRef()
  const cham = color === 'cham'
  useFrame((s, dt) => { g.current.position.y = Math.sin(s.clock.elapsedTime * 1.2) * 0.04 })
  const wheel = (x, z) => (
    <group key={x + '' + z} position={[x, -0.42, z]} rotation={[Math.PI / 2, 0, 0]}>
      <mesh><cylinderGeometry args={[0.36, 0.36, 0.26, 40]} /><meshStandardMaterial color="#0b0b10" roughness={0.8} /></mesh>
      <mesh position={[0, z > 0 ? 0.135 : -0.135, 0]}><cylinderGeometry args={[0.22, 0.22, 0.02, 32]} /><meshStandardMaterial color="#c9ccd6" metalness={1} roughness={0.2} /></mesh>
    </group>
  )
  return (
    <group ref={g} position={[0, 0.2, 0]}>
      <RoundedBox args={[3.2, 0.62, 1.4]} radius={0.28} smoothness={6} position={[0, -0.05, 0]}><Paint target={color} cham={cham} /></RoundedBox>
      <RoundedBox args={[1.75, 0.55, 1.22]} radius={0.26} smoothness={6} position={[-0.15, 0.48, 0]}><Paint target={color} cham={cham} /></RoundedBox>
      <RoundedBox args={[1.55, 0.42, 1.26]} radius={0.2} smoothness={4} position={[-0.15, 0.5, 0]}><meshPhysicalMaterial color="#0d1018" metalness={0.2} roughness={0.05} clearcoat={1} /></RoundedBox>
      <mesh position={[1.61, 0.02, 0.45]}><boxGeometry args={[0.02, 0.1, 0.3]} /><meshStandardMaterial color="#fff6d8" emissive="#fff6d8" emissiveIntensity={2} /></mesh>
      <mesh position={[1.61, 0.02, -0.45]}><boxGeometry args={[0.02, 0.1, 0.3]} /><meshStandardMaterial color="#fff6d8" emissive="#fff6d8" emissiveIntensity={2} /></mesh>
      <mesh position={[-1.61, 0.05, 0]}><boxGeometry args={[0.02, 0.08, 1.0]} /><meshStandardMaterial color="#ff2e3b" emissive="#ff2e3b" emissiveIntensity={1.6} /></mesh>
      {wheel(1.05, 0.62)}{wheel(1.05, -0.62)}{wheel(-1.05, 0.62)}{wheel(-1.05, -0.62)}
    </group>
  )
}

export default function Scene({ color }) {
  return (
    <Canvas dpr={[1, 1.6]} camera={{ position: [4.2, 1.8, 4.6], fov: 34 }} gl={{ alpha: true, antialias: true }}>
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 6, 3]} intensity={1.5} />
      <Car color={color} />
      <ContactShadows position={[0, -0.82, 0]} opacity={0.55} scale={9} blur={2.4} far={3} />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={1.2} minPolarAngle={Math.PI / 3.2} maxPolarAngle={Math.PI / 2.1} />
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={4} position={[0, 5, 0]} rotation-x={Math.PI / 2} scale={[10, 4, 1]} />
        <Lightformer form="rect" intensity={2} position={[-5, 1, 0]} rotation-y={Math.PI / 2} scale={[10, 2, 1]} color="#7cff6b" />
        <Lightformer form="rect" intensity={2} position={[5, 1, 0]} rotation-y={-Math.PI / 2} scale={[10, 2, 1]} color="#a855f7" />
        <Lightformer form="rect" intensity={1.5} position={[0, 1, 5]} scale={[10, 2, 1]} color="#22d3ee" />
      </Environment>
    </Canvas>
  )
}
