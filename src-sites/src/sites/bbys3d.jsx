import React, { useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Text3D, Center, Environment, Lightformer, Float } from '@react-three/drei'
import font from '../assets/helvetiker_bold.typeface.json'

function Chrome() {
  const g = useRef()
  const { size } = useThree()
  const mob = size.width < 768
  useFrame((st, dt) => {
    g.current.rotation.y += (st.pointer.x * .5 - g.current.rotation.y) * .06
    g.current.rotation.x += (-st.pointer.y * .3 - g.current.rotation.x) * .06
  })
  return (
    <group ref={g} scale={mob ? .5 : 1} position={[0, mob ? .9 : .35, 0]}>
      <Float speed={2} rotationIntensity={.25} floatIntensity={.6}>
        <Center>
          <Text3D font={font} size={1.5} height={.5} curveSegments={10} bevelEnabled bevelThickness={.12} bevelSize={.06} bevelSegments={6} letterSpacing={-.04}>
            bby's
            <meshStandardMaterial color="#ffeaf4" metalness={1} roughness={.04} envMapIntensity={1.6} />
          </Text3D>
        </Center>
      </Float>
      {[[-3.4, 1.4, -1, .35], [3.3, -1.2, -.5, .25], [2.6, 1.6, -1.5, .18], [-2.8, -1.4, .2, .22]].map(([x, y, z, r], k) => (
        <Float key={k} speed={3} floatIntensity={1.4}><mesh position={[x, y, z]}><sphereGeometry args={[r, 32, 32]} /><meshStandardMaterial color={k % 2 ? '#ff4fa3' : '#ffffff'} metalness={1} roughness={.05} /></mesh></Float>
      ))}
    </group>
  )
}
export default function Scene() {
  return (
    <Canvas dpr={[1, 1.6]} camera={{ position: [0, 0, 8], fov: 40 }} gl={{ antialias: true, alpha: true }} style={{ pointerEvents: 'none' }}>
      <Chrome />
      <Environment resolution={256}>
        <color attach="background" args={['#ff9cc9']} />
        <Lightformer form="rect" intensity={5} position={[0, 4, -2]} scale={[12, 2, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={3} position={[-5, 0, 2]} rotation-y={Math.PI / 2} scale={[10, 2, 1]} color="#ff5fb0" />
        <Lightformer form="rect" intensity={3} position={[5, 0, 2]} rotation-y={-Math.PI / 2} scale={[10, 2, 1]} color="#9ad8ff" />
        <Lightformer form="rect" intensity={2} position={[0, -4, 2]} scale={[12, 1, 1]} color="#2a0016" />
        <Lightformer form="ring" intensity={6} position={[2, 1, 6]} scale={1.5} color="#ffffff" />
      </Environment>
    </Canvas>
  )
}
