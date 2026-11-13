import React, { useRef, useMemo, useLayoutEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'

function Tread({ count = 64, R = 1.42 }) {
  const ref = useRef()
  useLayoutEffect(() => {
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler()
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2
      e.set(0, 0, a); q.setFromEuler(e)
      const tilt = new THREE.Quaternion().setFromEuler(new THREE.Euler(i % 2 ? 0.5 : -0.5, 0, 0))
      q.multiply(tilt)
      m.compose(new THREE.Vector3(Math.cos(a) * R, Math.sin(a) * R, 0), q, new THREE.Vector3(1, 1, 1))
      ref.current.setMatrixAt(i, m)
    }
    ref.current.instanceMatrix.needsUpdate = true
  }, [count, R])
  return (
    <instancedMesh ref={ref} args={[null, null, count]}>
      <boxGeometry args={[0.1, 0.12, 0.62]} />
      <meshStandardMaterial color="#111" roughness={0.85} />
    </instancedMesh>
  )
}

function Wheel({ progress }) {
  const g = useRef()
  useFrame((s, dt) => {
    const p = progress ? progress.get() : 0
    g.current.rotation.z = -p * Math.PI * 5 - s.clock.elapsedTime * 0.35
    g.current.rotation.y += ((s.pointer.x * 0.5 - 0.5) - g.current.rotation.y) * 0.05
    g.current.rotation.x += ((-s.pointer.y * 0.3 + 0.15) - g.current.rotation.x) * 0.05
    g.current.position.x = p * 2.5
  })
  const spokes = useMemo(() => Array.from({ length: 5 }, (_, i) => (i / 5) * Math.PI * 2), [])
  return (
    <group ref={g} rotation={[0.15, -0.5, 0]}>
      <mesh><torusGeometry args={[1.32, 0.34, 48, 120]} /><meshStandardMaterial color="#141414" roughness={0.8} /></mesh>
      <Tread />
      <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[1.0, 1.0, 0.46, 64, 1, true]} /><meshStandardMaterial color="#2a2a2a" metalness={0.8} roughness={0.35} side={THREE.DoubleSide} /></mesh>
      {spokes.map((a, i) => (
        <mesh key={i} rotation={[0, 0, a]} position={[0, 0, 0.12]}>
          <boxGeometry args={[0.2, 1.9, 0.12]} />
          <meshStandardMaterial color="#ffd400" metalness={0.6} roughness={0.25} />
        </mesh>
      ))}
      <mesh position={[0, 0, 0.18]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.32, 0.32, 0.2, 48]} /><meshStandardMaterial color="#ffd400" metalness={0.7} roughness={0.2} /></mesh>
      <mesh position={[0, 0, 0.29]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.12, 0.12, 0.05, 32]} /><meshStandardMaterial color="#0c0c0c" /></mesh>
    </group>
  )
}

export default function Scene({ progress }) {
  return (
    <Canvas dpr={[1, 1.6]} camera={{ position: [0, 0, 5], fov: 45 }} gl={{ alpha: true, antialias: true }} style={{ pointerEvents: 'none' }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 4, 5]} intensity={2} />
      <directionalLight position={[-4, -2, 3]} intensity={0.6} color="#ffd400" />
      <Wheel progress={progress} />
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={3} position={[0, 3, 3]} scale={[8, 2, 1]} />
        <Lightformer form="rect" intensity={1.5} position={[-3, 0, 2]} rotation-y={Math.PI / 2} scale={[6, 3, 1]} color="#ffe680" />
      </Environment>
    </Canvas>
  )
}
