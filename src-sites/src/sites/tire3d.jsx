import React, { useRef, useMemo, useLayoutEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Lightformer, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'

const lerp = (a, b, t) => a + (b - a) * t
const clamp01 = v => Math.min(Math.max(v, 0), 1)
const ease = t => 1 - Math.pow(1 - t, 3)

function Tread({ R = 1.5, count = 72 }) {
  const ref = useRef()
  useLayoutEffect(() => {
    const m = new THREE.Matrix4()
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2
      m.compose(new THREE.Vector3(Math.cos(a) * R, Math.sin(a) * R, 0), new THREE.Quaternion().setFromEuler(new THREE.Euler(i % 2 ? .45 : -.45, 0, a)), new THREE.Vector3(1, 1, 1))
      ref.current.setMatrixAt(i, m)
    }
    ref.current.instanceMatrix.needsUpdate = true
  }, [])
  return <instancedMesh ref={ref} args={[null, null, count]}><boxGeometry args={[0.09, 0.1, 0.66]} /><meshStandardMaterial color="#1a1d24" roughness={0.8} /></instancedMesh>
}

function Assembly({ progress, mobile }) {
  const root = useRef(), tire = useRef(), rim = useRef(), hub = useRef()
  const spokes = useMemo(() => Array.from({ length: 10 }, (_, i) => (i / 10) * Math.PI * 2), [])
  useFrame((s) => {
    const p = progress ? progress.get() : 0
    const e = ease(clamp01((p - 0.12) / 0.6))
    const sc = mobile ? 0.7 : 1
    root.current.scale.setScalar(sc)
    root.current.rotation.y = lerp(-0.25, -1.05, e) + s.pointer.x * 0.15
    root.current.rotation.x = lerp(0.1, 0.25, e) - s.pointer.y * 0.1
    root.current.rotation.z = -p * 1.5
    tire.current.position.z = lerp(0, 1.6, e)
    rim.current.position.z = lerp(0, 0, e)
    hub.current.position.z = lerp(0, -1.9, e)
    root.current.position.x = mobile ? 0 : lerp(0, 0.3, e)
  })
  return (
    <group ref={root}>
      <group ref={tire}>
        <mesh><torusGeometry args={[1.38, 0.36, 48, 128]} /><meshStandardMaterial color="#20232b" roughness={0.75} /></mesh>
        <Tread />
      </group>
      <group ref={rim}>
        <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[1.05, 1.05, 0.5, 96, 1, true]} /><meshStandardMaterial color="#dfe5ee" metalness={1} roughness={0.18} side={THREE.DoubleSide} /></mesh>
        {spokes.map((a, i) => <mesh key={i} rotation={[0, 0, a]} position={[0, 0, 0.12]}><boxGeometry args={[0.1, 1.9, 0.08]} /><meshStandardMaterial color="#e9eef5" metalness={1} roughness={0.15} /></mesh>)}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.12]}><torusGeometry args={[1.0, 0.04, 16, 96]} /><meshStandardMaterial color="#1f5eff" metalness={0.5} roughness={0.3} /></mesh>
      </group>
      <group ref={hub}>
        <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.45, 0.45, 0.4, 48]} /><meshStandardMaterial color="#1f5eff" metalness={0.6} roughness={0.25} /></mesh>
        {Array.from({ length: 5 }, (_, i) => { const a = i / 5 * Math.PI * 2; return <mesh key={i} position={[Math.cos(a) * .28, Math.sin(a) * .28, .25]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[.05, .05, .2, 16]} /><meshStandardMaterial color="#c9d2e0" metalness={1} roughness={.2} /></mesh> })}
      </group>
    </group>
  )
}

export default function Scene({ progress, mobile }) {
  return (
    <Canvas dpr={[1, 1.6]} camera={{ position: [0, 0, 7], fov: 40 }} gl={{ alpha: true, antialias: true }} style={{ pointerEvents: 'none' }}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 5, 6]} intensity={1.8} />
      <Assembly progress={progress} mobile={mobile} />
      <ContactShadows position={[0, -2.3, 0]} opacity={0.25} scale={10} blur={2.6} far={4} />
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={3} position={[0, 4, 4]} scale={[10, 3, 1]} />
        <Lightformer form="rect" intensity={1.5} position={[-5, 0, 2]} rotation-y={Math.PI / 2} scale={[8, 4, 1]} color="#cfe0ff" />
        <Lightformer form="rect" intensity={1.5} position={[5, 0, 2]} rotation-y={-Math.PI / 2} scale={[8, 4, 1]} />
      </Environment>
    </Canvas>
  )
}
