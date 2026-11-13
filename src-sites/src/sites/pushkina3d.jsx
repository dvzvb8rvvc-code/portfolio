import React, { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, ContactShadows } from '@react-three/drei'

function Tire({ y, phase, progress }) {
  const g = useRef(), wheel = useRef()
  const tread = useMemo(() => Array.from({ length: 36 }, (_, i) => i / 36 * Math.PI * 2), [])
  useFrame((st, dt) => {
    const p = progress.get()
    wheel.current.rotation.z -= dt * (.4 + p * 6)
    g.current.position.y = y + Math.sin(st.clock.elapsedTime * 1.2 + phase) * .05
    g.current.rotation.y = -.5 + st.pointer.x * .5 + p * (phase + 1) * 1.2
    g.current.position.x = p * (phase - 1) * 2.2
  })
  return (
    <group ref={g} position={[0, y, 0]}>
      <group ref={wheel}>
        <mesh><torusGeometry args={[1, .42, 20, 64]} /><meshStandardMaterial color="#141414" roughness={.85} /></mesh>
        {tread.map((a, i) => <mesh key={i} position={[Math.cos(a) * 1.38, Math.sin(a) * 1.38, 0]} rotation={[0, 0, a + (i % 2 ? .35 : -.35)]}><boxGeometry args={[.1, .14, .7]} /><meshStandardMaterial color="#1c1c1c" roughness={.9} /></mesh>)}
        <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[.72, .72, .5, 48]} /><meshStandardMaterial color="#d8d8d8" metalness={1} roughness={.22} /></mesh>
        {[0, 1, 2, 3, 4].map(i => <mesh key={i} rotation={[0, 0, i / 5 * Math.PI * 2]} position={[0, 0, .27]}><boxGeometry args={[.16, 1.3, .08]} /><meshStandardMaterial color="#ff3b1f" metalness={.6} roughness={.3} /></mesh>)}
        <mesh position={[0, 0, .3]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[.18, .18, .1, 24]} /><meshStandardMaterial color="#111" metalness={1} roughness={.3} /></mesh>
      </group>
    </group>
  )
}
function Stack({ progress }) {
  const { size } = useThree()
  const mob = size.width < 768
  return (
    <group position={[mob ? .6 : 3.6, mob ? 2.5 : 0, 0]} scale={mob ? .4 : .72} rotation={[0, 0, 0]}>
      <Tire y={1.5} phase={0} progress={progress} />
      <Tire y={-1.5} phase={2} progress={progress} />
    </group>
  )
}
export default function Scene({ progress }) {
  return (
    <Canvas dpr={[1, 1.6]} camera={{ position: [0, 0, 9], fov: 40 }} gl={{ antialias: true, alpha: true }} style={{ pointerEvents: 'none' }}>
      <ambientLight intensity={.3} />
      <directionalLight position={[5, 6, 4]} intensity={2} />
      <spotLight position={[-6, 2, 4]} intensity={40} color="#ff3b1f" angle={.6} penumbra={1} />
      <Stack progress={progress} />
      <ContactShadows position={[0, -3.4, 0]} opacity={.5} scale={14} blur={2.5} far={5} />
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={3} position={[0, 5, -2]} scale={[10, 2, 1]} />
        <Lightformer form="rect" intensity={2} position={[-5, 0, 2]} rotation-y={Math.PI / 2} scale={[8, 2, 1]} color="#ff8a6a" />
        <Lightformer form="rect" intensity={2} position={[5, 0, 2]} rotation-y={-Math.PI / 2} scale={[8, 2, 1]} />
      </Environment>
    </Canvas>
  )
}
