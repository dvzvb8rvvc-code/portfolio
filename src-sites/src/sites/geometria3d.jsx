import React, { useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, Edges } from '@react-three/drei'

/* three solids hand off to each other as you scroll */
function Solid({ i, progress, children }) {
  const g = useRef()
  const { size } = useThree()
  useFrame((st, dt) => {
    const p = progress.get() * 3
    const d = Math.abs(p - i - .5)
    const s = Math.max(0, 1 - Math.max(0, d - .35) * 2.2)
    const mob = size.width < 768
    g.current.scale.setScalar((mob ? .55 : 1.05) * (s ** 1.4))
    g.current.rotation.x += dt * .25 + (st.pointer.y * .4 - g.current.rotation.x) * .02
    g.current.rotation.y += dt * .35 + (st.pointer.x * .6) * .02
    g.current.position.x = mob ? 0 : 1.9
    g.current.position.y = mob ? 2 : 0
  })
  return <group ref={g}>{children}</group>
}
function Mat() {
  return <meshPhysicalMaterial color="#f4efe9" metalness={.15} roughness={.18} clearcoat={1} iridescence={.6} iridescenceIOR={1.4} flatShading envMapIntensity={1.4} />
}
function Satellites({ progress }) {
  const g = useRef()
  useFrame((st, dt) => { g.current.rotation.z += dt * .15; g.current.rotation.y = progress.get() * 4 })
  return (
    <group ref={g} position={[1.9, 0, -1]}>
      {[[2.6, 0, 0], [-2.4, 1.2, 0], [0, -2.4, .5], [1.4, 2, -1]].map((p, k) => (
        <mesh key={k} position={p} scale={.16 + k * .03}>
          {k % 2 ? <octahedronGeometry /> : <boxGeometry />}
          <meshStandardMaterial color={k === 0 ? '#ff5a1f' : '#111111'} metalness={.5} roughness={.3} />
        </mesh>
      ))}
    </group>
  )
}
export default function Scene({ progress }) {
  return (
    <Canvas dpr={[1, 1.6]} camera={{ position: [0, 0, 7], fov: 40 }} gl={{ antialias: true, alpha: true }} style={{ pointerEvents: 'none' }}>
      <ambientLight intensity={.4} />
      <directionalLight position={[4, 5, 3]} intensity={1.4} />
      <Solid i={0} progress={progress}><mesh><icosahedronGeometry args={[1.5, 0]} /><Mat /><Edges color="#111" threshold={1} /></mesh></Solid>
      <Solid i={1} progress={progress}><mesh><boxGeometry args={[1.6, 1.6, 1.6]} /><Mat /><Edges color="#111" /></mesh></Solid>
      <Solid i={2} progress={progress}><mesh><torusKnotGeometry args={[1, .32, 160, 12, 2, 3]} /><Mat /></mesh></Solid>
      <Satellites progress={progress} />
      <Environment resolution={256}>
        <color attach="background" args={['#d9d4cc']} />
        <Lightformer form="rect" intensity={3} position={[0, 5, -2]} scale={[10, 3, 1]} />
        <Lightformer form="rect" intensity={2.5} position={[-5, 0, 1]} rotation-y={Math.PI / 2} scale={[8, 3, 1]} color="#ffb48f" />
        <Lightformer form="rect" intensity={2.5} position={[5, 0, 1]} rotation-y={-Math.PI / 2} scale={[8, 3, 1]} color="#9fd2ff" />
      </Environment>
    </Canvas>
  )
}
