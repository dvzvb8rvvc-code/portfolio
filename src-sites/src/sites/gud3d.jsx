import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Lightformer, Float } from '@react-three/drei'
import * as THREE from 'three'

function useStripes() {
  return useMemo(() => {
    const c = document.createElement('canvas'); c.width = 256; c.height = 256
    const g = c.getContext('2d')
    const cols = ['#efe5d2', '#c9773b', '#efe5d2', '#13221b']
    const w = 64
    for (let i = -8; i < 16; i++) {
      g.fillStyle = cols[((i % 4) + 4) % 4]
      g.beginPath(); g.moveTo(i * w, 256); g.lineTo(i * w + w, 256); g.lineTo(i * w + w + 256, 0); g.lineTo(i * w + 256, 0); g.closePath(); g.fill()
    }
    const t = new THREE.CanvasTexture(c)
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1, 2); t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [])
}

function PoleMesh() {
  const tex = useStripes()
  const g = useRef()
  useFrame((s, dt) => {
    tex.offset.y -= dt * 0.25
    g.current.rotation.y += ((s.pointer.x * 0.4) - g.current.rotation.y) * 0.05
  })
  return (
    <Float speed={1.2} floatIntensity={0.4} rotationIntensity={0.2}>
      <group ref={g} rotation={[0, 0, 0.08]}>
        <mesh><cylinderGeometry args={[0.42, 0.42, 3.1, 64]} /><meshStandardMaterial map={tex} roughness={0.35} /></mesh>
        <mesh><cylinderGeometry args={[0.5, 0.5, 3.1, 64, 1, true]} /><meshStandardMaterial transparent opacity={0.18} roughness={0.05} metalness={0.2} color="#ffffff" side={THREE.DoubleSide} depthWrite={false} /></mesh>
        {[1.68, -1.68].map(y => (
          <group key={y} position={[0, y, 0]}>
            <mesh><cylinderGeometry args={[0.6, 0.6, 0.26, 64]} /><meshStandardMaterial color="#c9a46a" metalness={1} roughness={0.25} /></mesh>
            <mesh position={[0, y > 0 ? 0.3 : -0.3, 0]}><sphereGeometry args={[0.42, 48, 24, 0, Math.PI * 2, y > 0 ? 0 : Math.PI / 2, Math.PI / 2]} /><meshStandardMaterial color="#c9a46a" metalness={1} roughness={0.25} /></mesh>
          </group>
        ))}
      </group>
    </Float>
  )
}

export default function Scene() {
  return (
    <Canvas dpr={[1, 1.6]} camera={{ position: [0, 0, 6.2], fov: 42 }} gl={{ alpha: true, antialias: true }} style={{ pointerEvents: 'none' }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 3, 4]} intensity={1.6} color="#fff1dc" />
      <PoleMesh />
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={2.5} position={[2, 2, 3]} scale={[4, 6, 1]} color="#fff3e0" />
        <Lightformer form="rect" intensity={1} position={[-3, 0, 2]} rotation-y={Math.PI / 2} scale={[4, 6, 1]} color="#c9773b" />
      </Environment>
    </Canvas>
  )
}
