import React, { useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'

const R = '#d7262b', Y = '#f2b31b', B = '#1e4fa3', K = '#141414', P = '#efe9dc'
function M({ c }) { return <meshStandardMaterial color={c} roughness={.62} metalness={0} /> }

/* a slowly turning Bauhaus sculpture made of primitives */
function Composition({ progress }) {
  const g = useRef(), a = useRef(), b = useRef(), c = useRef()
  const { size } = useThree()
  useFrame((st, dt) => {
    const t = st.clock.elapsedTime, p = progress ? progress.get() : 0, mob = size.width < 768
    g.current.scale.setScalar(mob ? .62 : 1)
    g.current.position.set(0, mob ? .2 : 0, 0)
    g.current.rotation.y = t * .18 + p * 2.4 + st.pointer.x * .35
    g.current.rotation.x = THREE.MathUtils.lerp(g.current.rotation.x, .25 - st.pointer.y * .25, .05)
    a.current.rotation.z = t * .5
    b.current.position.y = 1.55 + Math.sin(t * 1.2) * .12
    c.current.rotation.x = t * .3
  })
  return (
    <group ref={g}>
      <mesh position={[.55, .35, 0]}><sphereGeometry args={[1, 48, 32]} /><M c={R} /></mesh>
      <mesh ref={b} position={[-1, 1.55, .4]} rotation={[0, .4, 0]}><coneGeometry args={[.85, 1.45, 3]} /><M c={Y} /></mesh>
      <mesh position={[-1.15, -.75, .5]} rotation={[.3, .6, .1]}><boxGeometry args={[1.25, 1.25, 1.25]} /><M c={B} /></mesh>
      <mesh ref={a} rotation={[Math.PI / 2.3, 0, 0]}><torusGeometry args={[2.25, .045, 10, 96]} /><M c={K} /></mesh>
      <mesh position={[1.3, -1.25, -.3]} rotation={[Math.PI / 2, 0, .3]}><cylinderGeometry args={[.85, .85, .22, 48, 1, false, 0, Math.PI]} /><M c={Y} /></mesh>
      <mesh position={[0, -.1, -1.2]} rotation={[0, 0, .78]}><boxGeometry args={[4.6, .1, .1]} /><M c={K} /></mesh>
      <mesh position={[.2, 0, -1.25]} rotation={[0, 0, -.5]}><boxGeometry args={[3.4, .1, .1]} /><M c={K} /></mesh>
      <mesh ref={c} position={[1.75, 1.35, -.6]}><cylinderGeometry args={[.42, .42, .12, 48]} /><M c={B} /></mesh>
      <mesh position={[-1.9, .2, -.8]}><sphereGeometry args={[.22, 32, 20]} /><M c={K} /></mesh>
      <mesh position={[.3, -1.9, .8]} rotation={[0, 0, 0]}><boxGeometry args={[.9, .22, .22]} /><M c={R} /></mesh>
      <mesh position={[-.2, 1.2, -1.6]}><boxGeometry args={[.7, .7, .05]} /><M c={P} /></mesh>
    </group>
  )
}

export default function Bauhaus({ progress }) {
  return (
    <Canvas dpr={[1, 1.6]} camera={{ position: [0, 0, 8.5], fov: 40 }} gl={{ antialias: true, alpha: true }} style={{ pointerEvents: 'none' }}>
      <ambientLight intensity={.9} />
      <directionalLight position={[4, 6, 5]} intensity={1.6} />
      <directionalLight position={[-5, -2, 2]} intensity={.4} />
      <Composition progress={progress} />
      <Environment resolution={128}>
        <color attach="background" args={['#e7e1d4']} />
        <Lightformer form="rect" intensity={2} position={[0, 5, 3]} scale={[10, 3, 1]} />
        <Lightformer form="rect" intensity={1} position={[-5, 0, 2]} rotation-y={Math.PI / 2} scale={[6, 3, 1]} />
      </Environment>
    </Canvas>
  )
}
