import React, { useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { MeshDistortMaterial, Float, Environment, Lightformer } from '@react-three/drei'

function Blob({ pos, r, color, speed, distort, follow = 0.3 }) {
  const m = useRef()
  const { size } = useThree()
  const mob = size.width < 768
  useFrame((s) => {
    const tx = mob ? pos[0] * 0.45 + 0.9 : pos[0], ty = mob ? pos[1] * 0.6 + 2.2 : pos[1]
    m.current.scale.setScalar(mob ? 0.55 : 1)
    m.current.position.x += (tx + s.pointer.x * follow - m.current.position.x) * 0.04
    m.current.position.y += (ty + s.pointer.y * follow - m.current.position.y) * 0.04
  })
  return (
    <Float speed={speed} floatIntensity={1.2} rotationIntensity={0.6}>
      <mesh ref={m} position={pos}>
        <sphereGeometry args={[r, 48, 48]} />
        <MeshDistortMaterial color={color} roughness={0.55} metalness={0} distort={distort} speed={1.2} />
      </mesh>
    </Float>
  )
}

export default function Scene() {
  return (
    <Canvas dpr={[1, 1.3]} camera={{ position: [0, 0, 7], fov: 40 }} gl={{ alpha: true, antialias: true }} style={{ pointerEvents: 'none' }}>
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 4, 5]} intensity={1.2} color="#fff4ee" />
      <Blob pos={[2.6, 0.6, 0]} r={1.5} color="#f2b9ab" speed={1.4} distort={0.45} />
      <Blob pos={[3.9, -1.4, -1]} r={0.9} color="#b9c9ad" speed={1.8} distort={0.5} follow={0.5} />
      <Blob pos={[1.2, 2.1, -2]} r={0.6} color="#f7d9c8" speed={2} distort={0.4} follow={0.6} />
      <Blob pos={[-3.6, -2.2, -2]} r={0.7} color="#e8c5d6" speed={1.6} distort={0.45} follow={0.4} />
      <Environment resolution={64}>
        <Lightformer form="rect" intensity={2} position={[0, 4, 4]} scale={[10, 3, 1]} color="#fff" />
        <Lightformer form="rect" intensity={1} position={[-4, 0, 2]} rotation-y={Math.PI / 2} scale={[6, 4, 1]} color="#ffd9cf" />
      </Environment>
    </Canvas>
  )
}
