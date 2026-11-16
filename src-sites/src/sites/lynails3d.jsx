import React, { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, Sparkles } from '@react-three/drei'

/* brilliant-cut gemstone from a low-segment lathe, flat shaded */
function Gem({ color, progress }) {
  const g = useRef(), m = useRef()
  const { size } = useThree()
  const geo = useMemo(() => {
    const pts = [[0.001, -1.25], [0.55, -0.62], [1.02, 0.02], [1.04, 0.12], [0.86, 0.36], [0.6, 0.56], [0.001, 0.56]].map(([x, y]) => new THREE.Vector2(x, y))
    const l = new THREE.LatheGeometry(pts, 12)
    return l.toNonIndexed()
  }, [])
  const target = useMemo(() => new THREE.Color(), [])
  useFrame((st, dt) => {
    dt = Math.min(dt, 0.05)
    const mob = size.width < 768
    const p = progress ? progress.get() : 0
    target.set(color)
    m.current.color.lerp(target, 0.06)
    g.current.rotation.y += dt * 0.35
    g.current.rotation.x += ((0.35 - st.pointer.y * 0.45) - g.current.rotation.x) * 0.05
    g.current.rotation.z += ((st.pointer.x * 0.3) - g.current.rotation.z) * 0.05
    const s = (mob ? 0.95 : 1.45) * (1 - p * 0.5)
    g.current.scale.setScalar(s)
    g.current.position.set(mob ? 0 : 1.9, (mob ? 1.35 : 0.1) + Math.sin(st.clock.elapsedTime) * 0.08 - p * 2.5, 0)
  })
  return (
    <group ref={g}>
      <mesh geometry={geo}>
        <meshPhysicalMaterial ref={m} color={color} metalness={0.15} roughness={0.04} clearcoat={1} clearcoatRoughness={0.05}
          iridescence={1} iridescenceIOR={1.7} iridescenceThicknessRange={[200, 800]} flatShading envMapIntensity={2.6} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

export default function Scene({ color, progress }) {
  const mob = typeof window !== 'undefined' && innerWidth < 768
  return (
    <Canvas dpr={[1, 1.6]} camera={{ position: [0, 0, 7], fov: 40 }} gl={{ antialias: true, alpha: true }} style={{ pointerEvents: 'none' }} eventSource={typeof document !== 'undefined' ? document.getElementById('root') : undefined} eventPrefix="client">
      <ambientLight intensity={0.25} />
      <Gem color={color} progress={progress} />
      <Sparkles count={mob ? 40 : 90} scale={[mob ? 5 : 11, 6, 3]} size={mob ? 2.5 : 3.5} speed={0.35} color="#f1d58e" opacity={0.9} />
      <Environment resolution={256}>
        <color attach="background" args={['#0b1c17']} />
        <Lightformer form="rect" intensity={6} position={[0, 5, -1]} scale={[8, 1.5, 1]} color="#fff6e0" />
        <Lightformer form="rect" intensity={4} position={[-5, 1, 2]} rotation-y={Math.PI / 2} scale={[6, 1, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={3} position={[5, -1, 2]} rotation-y={-Math.PI / 2} scale={[6, 1, 1]} color="#e7c27a" />
        <Lightformer form="ring" intensity={4} position={[0, 0, 5]} scale={2} color="#ffffff" />
        <Lightformer form="rect" intensity={2} position={[0, -5, 0]} rotation-x={-Math.PI / 2} scale={[6, 6, 1]} color="#7fd1b0" />
      </Environment>
    </Canvas>
  )
}
