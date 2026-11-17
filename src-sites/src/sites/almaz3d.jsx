import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, ContactShadows } from '@react-three/drei'

/* a small faceted brilliant in brushed metal, slowly turning under studio light */
export const FINISH = {
  silver: { color: '#e9edf1', metalness: 0.92, roughness: 0.2 },
  graphite: { color: '#55595f', metalness: 0.95, roughness: 0.28 },
  ice: { color: '#cfe8f5', metalness: 0.8, roughness: 0.14 },
}

function Gem({ progress, finish }) {
  const g = useRef(), mat = useRef(), edge = useRef(), ice = useRef()
  const { size } = useThree()
  const geo = useMemo(() => {
    const P = [[0.001, -1.0], [0.42, -0.62], [0.82, -0.2], [1.0, -0.03], [1.0, 0.04], [0.86, 0.2], [0.6, 0.4], [0.001, 0.4]]
    const gg = new THREE.LatheGeometry(P.map(([r, y]) => new THREE.Vector2(r, y)), 16)
    return gg.toNonIndexed()
  }, [])
  const edges = useMemo(() => new THREE.EdgesGeometry(geo, 10), [geo])
  const target = useMemo(() => new THREE.Color(), [])
  useFrame((st, dt) => {
    const p = progress ? progress.get() : 0
    const t = st.clock.elapsedTime
    g.current.rotation.y = t * 0.16 + p * Math.PI * 1.5
    g.current.rotation.x = 0.32 + Math.sin(t * 0.3) * 0.04 + st.pointer.y * -0.08
    g.current.rotation.z = Math.sin(t * 0.2) * 0.05 + st.pointer.x * 0.06
    g.current.position.y = Math.sin(t * 0.6) * 0.04 + 0.15
    g.current.scale.setScalar(size.width < 768 ? 0.72 : 0.8)
    const f = FINISH[finish] || FINISH.silver
    target.set(f.color)
    mat.current.color.lerp(target, Math.min(1, dt * 4))
    mat.current.metalness += (f.metalness - mat.current.metalness) * Math.min(1, dt * 4)
    mat.current.roughness += (f.roughness - mat.current.roughness) * Math.min(1, dt * 4)
    ice.current.position.set(Math.cos(t * 0.4 + p * 4) * 3, 1.2, Math.sin(t * 0.4 + p * 4) * 3)
  })
  return (
    <>
      <pointLight ref={ice} color="#9fd6f2" intensity={6} distance={8} />
      <group ref={g}>
        <mesh geometry={geo}>
          <meshPhysicalMaterial ref={mat} color="#e9edf1" metalness={0.92} roughness={0.2} clearcoat={1} clearcoatRoughness={0.06} flatShading envMapIntensity={1.3} />
        </mesh>
        <lineSegments ref={edge} geometry={edges}><lineBasicMaterial color="#ffffff" transparent opacity={0.28} /></lineSegments>
      </group>
    </>
  )
}

export default function GemScene({ progress, active, finish = 'silver' }) {
  return (
    <Canvas frameloop={active ? 'always' : 'never'} dpr={[1, 1.6]} camera={{ position: [0, 0.6, 5.2], fov: 30 }} gl={{ antialias: true, alpha: true }} style={{ pointerEvents: 'none' }}
      eventSource={typeof document !== 'undefined' ? document.getElementById('root') : undefined} eventPrefix="client">
      <ambientLight intensity={0.6} />
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={4} position={[0, 5, 0]} rotation-x={Math.PI / 2} scale={[6, 6, 1]} />
        <Lightformer form="rect" intensity={2.5} position={[-4, 1, 2]} rotation-y={Math.PI / 2} scale={[1, 6, 1]} />
        <Lightformer form="rect" intensity={2} position={[4, 0.5, -1]} rotation-y={-Math.PI / 2} scale={[1, 5, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#bfe6fa" position={[0, 0, -5]} scale={[8, 2, 1]} />
        <Lightformer form="rect" intensity={2.2} position={[0, -5, 0]} rotation-x={-Math.PI / 2} scale={[8, 8, 1]} />
        <Lightformer form="rect" intensity={1.6} position={[0, 0.5, 5]} scale={[6, 3, 1]} />
        <Lightformer form="ring" intensity={1.5} position={[2, 3, 4]} scale={1.5} />
      </Environment>
      <Gem progress={progress} finish={finish} />
      <ContactShadows position={[0, -0.9, 0]} opacity={0.22} scale={4} blur={3} far={2} resolution={256} />
    </Canvas>
  )
}
