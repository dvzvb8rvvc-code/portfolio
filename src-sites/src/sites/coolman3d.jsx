import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { RoundedBox, Environment, Lightformer, Sparkles, Float } from '@react-three/drei'

function Cubes({ progress }) {
  const g = useRef()
  const { size } = useThree()
  const mob = size.width < 768
  const C = useMemo(() => [[1.2, .5, 0, 1.3], [3.2, 1.6, -1.5, .8], [2.6, -1.4, .5, .9], [4.4, -.2, -2, .6], [.2, 2.1, -2.5, .5], [-.6, -1.8, -1, .45]], [])
  useFrame((st, dt) => {
    const p = progress.get()
    g.current.rotation.y += (st.pointer.x * .4 - g.current.rotation.y) * .04
    g.current.rotation.x += (-st.pointer.y * .25 - g.current.rotation.x) * .04
    g.current.position.y = p * 3
  })
  return (
    <group ref={g} position={[mob ? -1.6 : 0, mob ? 1.4 : 0, 0]} scale={mob ? .6 : 1}>
      {C.map(([x, y, z, s], k) => (
        <Float key={k} speed={1.2 + k * .2} rotationIntensity={1.4} floatIntensity={1.2}>
          <RoundedBox args={[s, s, s]} radius={s * .14} smoothness={4} position={[x, y, z]} rotation={[k, k * 2, 0]}>
            <meshPhysicalMaterial color="#cfefff" roughness={.06} metalness={0} clearcoat={1} iridescence={.5} transparent opacity={.55} envMapIntensity={2.5} />
          </RoundedBox>
        </Float>
      ))}
    </group>
  )
}
export default function Scene({ progress }) {
  return (
    <Canvas dpr={[1, 1.6]} camera={{ position: [0, 0, 8], fov: 42 }} gl={{ antialias: true, alpha: true }} style={{ pointerEvents: 'none' }}>
      <ambientLight intensity={.4} />
      <Cubes progress={progress} />
      <Sparkles count={120} scale={[14, 8, 6]} size={2.2} speed={.4} color="#bfe9ff" opacity={.8} />
      <Environment resolution={256}>
        <color attach="background" args={['#0b2a40']} />
        <Lightformer form="rect" intensity={4} position={[0, 5, -2]} scale={[12, 2, 1]} color="#e8f8ff" />
        <Lightformer form="rect" intensity={3} position={[-5, 0, 2]} rotation-y={Math.PI / 2} scale={[10, 2, 1]} color="#5fd0ff" />
        <Lightformer form="rect" intensity={2} position={[5, 0, 2]} rotation-y={-Math.PI / 2} scale={[10, 2, 1]} color="#ffffff" />
        <Lightformer form="ring" intensity={5} position={[2, 2, 6]} scale={1.4} />
      </Environment>
    </Canvas>
  )
}
