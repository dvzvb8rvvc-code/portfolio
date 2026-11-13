import React, { useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { MeshDistortMaterial, Environment, Lightformer, Float } from '@react-three/drei'

function GoldBlob({ progress }) {
  const m = useRef()
  const { size } = useThree()
  const mob = size.width < 768
  useFrame((state, dt) => {
    if (!m.current) return
    const p = progress ? progress.get() : 0
    const { x, y } = state.pointer
    m.current.rotation.y += (x * 0.6 - m.current.rotation.y) * 0.05 + dt * 0.08
    m.current.rotation.x += (-y * 0.4 - m.current.rotation.x) * 0.05
    const s = (mob ? 0.62 : 1) + p * 0.6
    m.current.scale.setScalar(s)
    m.current.position.y = (mob ? 1.35 : 0.95) - p * 1.2
    m.current.position.x = mob ? 0.55 : 1.7
  })
  return (
    <Float speed={1.4} rotationIntensity={0.4} floatIntensity={0.8}>
      <mesh ref={m} position={[1.7, 0.95, 0]}>
        <icosahedronGeometry args={[1.02, 32]} />
        <MeshDistortMaterial color="#e9c98f" metalness={1} roughness={0.22} distort={0.35} speed={1.4} envMapIntensity={1.6} />
      </mesh>
    </Float>
  )
}
export default function Scene({ progress }) {
  return (
    <Canvas dpr={[1, 1.6]} camera={{ position: [0, 0, 5.2], fov: 42 }} gl={{ antialias: true, alpha: true }} style={{ pointerEvents: 'none' }}>
      <ambientLight intensity={0.2} />
      <directionalLight position={[3, 4, 5]} intensity={1.2} color="#fff3d6" />
      <GoldBlob progress={progress} />
      <Environment resolution={256}>
        <color attach="background" args={['#3a2a14']} />
        <Lightformer form="rect" intensity={3} position={[0, 4, -2]} scale={[10, 3, 1]} color="#fff4dc" />
        <Lightformer form="rect" intensity={2} position={[4, 0, -3]} rotation-y={-Math.PI / 2} scale={[8, 4, 1]} color="#ffcf8a" />
        <Lightformer form="circle" intensity={2} position={[0, 0, 6]} scale={6} color="#c89c5a" />
        <Lightformer form="rect" intensity={2} position={[-4, 0, 2]} rotation-y={Math.PI / 2} scale={[8, 3, 1]} color="#ffd9a0" />
        <Lightformer form="ring" intensity={3} position={[3, 1, 3]} scale={2} color="#ffffff" />
        <Lightformer form="rect" intensity={1} position={[0, -3, 2]} scale={[10, 1, 1]} color="#8a6a3a" />
      </Environment>
    </Canvas>
  )
}
