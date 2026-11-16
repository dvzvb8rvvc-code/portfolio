import React, { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'

/* chrome cleaver: extruded blade with hang-hole, wooden handle, brass rivets */
function useBlade() {
  return useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(-1.5, 0.95)
    s.lineTo(1.35, 0.95)
    s.quadraticCurveTo(1.62, 0.95, 1.66, 0.6)
    s.lineTo(1.78, -0.78)
    s.quadraticCurveTo(0.2, -1.02, -1.5, -0.62)
    s.lineTo(-1.5, 0.95)
    const h = new THREE.Path()
    h.absarc(1.12, 0.52, 0.17, 0, Math.PI * 2, true)
    s.holes.push(h)
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.05, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.03, bevelSegments: 2, curveSegments: 24 })
    g.translate(0, 0, -0.025)
    return g
  }, [])
}

function Cleaver({ progress }) {
  const g = useRef(), inner = useRef()
  const blade = useBlade()
  const { size } = useThree()
  useFrame((st, dt) => {
    dt = Math.min(dt, 0.05)
    const mob = size.width < 768
    const p = progress ? progress.get() : 0
    inner.current.rotation.y += dt * (0.4 + p * 3)
    g.current.rotation.x += ((-st.pointer.y * 0.5) - g.current.rotation.x) * 0.06
    g.current.rotation.z += ((st.pointer.x * 0.35 - 0.25) - g.current.rotation.z) * 0.06
    const sc = mob ? 0.72 : 0.7
    g.current.scale.setScalar(sc * (1 - p * 0.25))
    g.current.position.x = mob ? 0.2 : 3.0 + p * 0.6
    g.current.position.y = (mob ? 1.4 : 1.45) + Math.sin(st.clock.elapsedTime * 0.9) * 0.08 + p * 1.6
  })
  return (
    <group ref={g}>
      <group ref={inner}>
        <group position={[0.6, 0, 0]}>
          <mesh geometry={blade}>
            <meshStandardMaterial color="#e9e6e1" metalness={1} roughness={0.14} envMapIntensity={1.6} />
          </mesh>
          {/* bevelled cutting edge highlight */}
          <mesh position={[0.15, -0.86, 0]} rotation={[0, 0, 0.17]}>
            <boxGeometry args={[3.2, 0.06, 0.012]} />
            <meshStandardMaterial color="#ffffff" metalness={1} roughness={0.05} />
          </mesh>
          {/* tang + handle */}
          <mesh position={[-2.35, 0.46, 0]}>
            <boxGeometry args={[1.8, 0.42, 0.2]} />
            <meshStandardMaterial color="#3a1712" metalness={0.1} roughness={0.55} />
          </mesh>
          <mesh position={[-3.28, 0.46, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.21, 0.24, 0.1, 24]} />
            <meshStandardMaterial color="#c99a46" metalness={1} roughness={0.25} />
          </mesh>
          <mesh position={[-1.42, 0.46, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.24, 0.24, 0.12, 24]} />
            <meshStandardMaterial color="#c99a46" metalness={1} roughness={0.25} />
          </mesh>
          {[-1.85, -2.4, -2.95].map(x => (
            <mesh key={x} position={[x, 0.46, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.06, 0.06, 0.24, 16]} />
              <meshStandardMaterial color="#d8ac58" metalness={1} roughness={0.2} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  )
}

/* drifting sawdust / hair clippings */
function Dust({ n }) {
  const ref = useRef()
  const pos = useMemo(() => {
    const a = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) { a[i * 3] = (Math.random() - 0.5) * 14; a[i * 3 + 1] = (Math.random() - 0.5) * 9; a[i * 3 + 2] = (Math.random() - 0.5) * 4 }
    return a
  }, [n])
  useFrame((st, dt) => {
    const a = ref.current.geometry.attributes.position.array
    for (let i = 0; i < n; i++) { a[i * 3 + 1] -= dt * (0.15 + (i % 5) * 0.05); if (a[i * 3 + 1] < -4.5) a[i * 3 + 1] = 4.5 }
    ref.current.geometry.attributes.position.needsUpdate = true
    ref.current.rotation.y = st.pointer.x * 0.15
  })
  return (
    <points ref={ref}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[pos, 3]} /></bufferGeometry>
      <pointsMaterial size={0.035} color="#5c0f17" transparent opacity={0.55} sizeAttenuation />
    </points>
  )
}

export default function Scene({ progress }) {
  const mob = typeof window !== 'undefined' && innerWidth < 768
  return (
    <Canvas dpr={[1, 1.6]} camera={{ position: [0, 0, 7.5], fov: 40 }} gl={{ antialias: true, alpha: true }} style={{ pointerEvents: 'none' }} eventSource={typeof document !== 'undefined' ? document.getElementById('root') : undefined} eventPrefix="client">
      <ambientLight intensity={0.3} />
      <Cleaver progress={progress} />
      <Dust n={mob ? 60 : 140} />
      <Environment resolution={256}>
        <color attach="background" args={['#4a4440']} />
        <Lightformer form="rect" intensity={7} position={[0, 5, -2]} scale={[10, 2, 1]} color="#fff4e2" />
        <Lightformer form="rect" intensity={3} position={[-5, 0, 2]} rotation-y={Math.PI / 2} scale={[8, 2, 1]} color="#ffd8b0" />
        <Lightformer form="rect" intensity={1.6} position={[5, -1, 2]} rotation-y={-Math.PI / 2} scale={[8, 2, 1]} color="#d06a5a" />
        <Lightformer form="ring" intensity={2} position={[0, -4, 3]} scale={3} color="#ffffff" />
      </Environment>
    </Canvas>
  )
}
