import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'

/* Dark workshop bay: a swinging work lamp travels along a pegboard as you scroll (prog 0..1),
   its spotlight revealing tool groups. */
const steel = new THREE.MeshStandardMaterial({ color: '#c8ccd0', metalness: 1, roughness: 0.32 })
const dark = new THREE.MeshStandardMaterial({ color: '#2a2c2f', metalness: 0.6, roughness: 0.5 })
const amber = new THREE.MeshStandardMaterial({ color: '#d98a1c', roughness: 0.45 })
const red = new THREE.MeshStandardMaterial({ color: '#9e2b20', roughness: 0.5 })
const wood = new THREE.MeshStandardMaterial({ color: '#8a5a33', roughness: 0.7 })
const black = new THREE.MeshStandardMaterial({ color: '#141414', roughness: 0.6 })

function pegTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 256
  const g = c.getContext('2d')
  g.fillStyle = '#6a5a47'; g.fillRect(0, 0, 256, 256)
  for (let i = 0; i < 2000; i++) { g.fillStyle = `rgba(0,0,0,${Math.random() * 0.06})`; g.fillRect(Math.random() * 256, Math.random() * 256, 2, 2) }
  g.fillStyle = '#17120d'
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { g.beginPath(); g.arc(16 + x * 32, 16 + y * 32, 4.5, 0, Math.PI * 2); g.fill() }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(5, 2.5); t.colorSpace = THREE.SRGBColorSpace
  return t
}

function Wrench({ s = 1, ...p }) {
  return (
    <group {...p} scale={s}>
      <mesh material={steel} castShadow><boxGeometry args={[0.09, 1.0, 0.03]} /></mesh>
      <mesh material={steel} position={[0, 0.56, 0]} castShadow><torusGeometry args={[0.1, 0.035, 6, 16, Math.PI * 1.45]} /></mesh>
      <mesh material={steel} position={[0, -0.56, 0]} castShadow><torusGeometry args={[0.085, 0.03, 6, 16]} /></mesh>
    </group>
  )
}
function Screwdriver({ mat, ...p }) {
  return (
    <group {...p}>
      <mesh material={mat} position={[0, 0.25, 0]} castShadow><cylinderGeometry args={[0.07, 0.06, 0.38, 8]} /></mesh>
      <mesh material={steel} position={[0, -0.18, 0]} castShadow><cylinderGeometry args={[0.018, 0.018, 0.5, 6]} /></mesh>
    </group>
  )
}
function Tools() {
  return (
    <group position={[0, 0, 0.09]}>
      {/* group 1: wrench set */}
      {[0, 1, 2, 3, 4, 5].map(i => <Wrench key={i} s={0.7 + i * 0.09} position={[-4.4 + i * 0.32, 0.55 - i * 0.03, 0]} />)}
      {/* group 2: hammer, screwdrivers */}
      <group position={[-1.6, 0.6, 0]} rotation-z={0.05}>
        <mesh material={wood} position={[0, -0.2, 0]} castShadow><cylinderGeometry args={[0.045, 0.05, 1.1, 8]} /></mesh>
        <mesh material={dark} position={[0, 0.38, 0]} castShadow><boxGeometry args={[0.5, 0.16, 0.14]} /></mesh>
      </group>
      {[amber, red, black, amber].map((m, i) => <Screwdriver key={i} mat={m} position={[-0.95 + i * 0.26, 0.55, 0]} />)}
      {/* group 3: pliers + socket rail */}
      <group position={[0.75, 0.5, 0]}>
        {[-1, 1].map(k => (
          <group key={k} rotation-z={k * 0.12}>
            <mesh material={red} position={[k * 0.06, -0.25, 0]} castShadow><boxGeometry args={[0.07, 0.6, 0.04]} /></mesh>
            <mesh material={steel} position={[k * 0.02, 0.18, 0]} castShadow><boxGeometry args={[0.06, 0.32, 0.04]} /></mesh>
          </group>
        ))}
      </group>
      <group position={[1.75, 0.9, 0]}>
        <mesh material={dark} castShadow><boxGeometry args={[1.3, 0.06, 0.06]} /></mesh>
        {Array.from({ length: 7 }).map((_, i) => <mesh key={i} material={steel} position={[-0.54 + i * 0.18, -0.13, 0.02]} castShadow><cylinderGeometry args={[0.045 + i * 0.006, 0.045 + i * 0.006, 0.2, 10]} /></mesh>)}
      </group>
      <group position={[1.75, 0.2, 0]}>
        {[0, 1, 2].map(i => <mesh key={i} material={steel} position={[-0.4 + i * 0.4, 0, 0]} rotation-z={Math.PI / 4} castShadow><torusGeometry args={[0.13, 0.025, 6, 4]} /></mesh>)}
      </group>
      {/* group 4: tyre iron + coil spring */}
      <group position={[3.35, 0.45, 0]} rotation-z={0.6}>
        <mesh material={steel} castShadow><cylinderGeometry args={[0.035, 0.035, 1.3, 8]} /></mesh>
        <mesh material={steel} rotation-z={Math.PI / 2} castShadow><cylinderGeometry args={[0.035, 0.035, 1.3, 8]} /></mesh>
      </group>
      <mesh material={amber} position={[4.45, 0.5, 0.1]} rotation-x={Math.PI / 2} castShadow>
        <torusGeometry args={[0.28, 0.05, 6, 16]} />
      </mesh>
      <mesh material={amber} position={[4.45, 0.5, 0.25]} rotation-x={Math.PI / 2} castShadow><torusGeometry args={[0.28, 0.05, 6, 16]} /></mesh>
    </group>
  )
}

function Bay() {
  const tex = useMemo(pegTexture, [])
  return (
    <group>
      <mesh position={[0, 0.6, 0]} receiveShadow><planeGeometry args={[12, 4.4]} /><meshStandardMaterial map={tex} roughness={0.85} /></mesh>
      <mesh position={[0, -2.2, 3]} rotation-x={-Math.PI / 2} receiveShadow><planeGeometry args={[30, 12]} /><meshStandardMaterial color="#1b1b1c" roughness={0.75} metalness={0.1} /></mesh>
      <mesh position={[0, 4.4, 0.3]} receiveShadow><boxGeometry args={[30, 3.6, 0.5]} /><meshStandardMaterial color="#111214" roughness={0.9} /></mesh>
      {/* workbench */}
      <mesh material={wood} position={[0, -0.95, 0.6]} castShadow receiveShadow><boxGeometry args={[10.5, 0.12, 1.2]} /></mesh>
      {[-5, 5].map(x => <mesh key={x} material={dark} position={[x, -1.6, 0.6]}><boxGeometry args={[0.12, 1.2, 1.1]} /></mesh>)}
      <group position={[-3.2, -0.6, 0.6]}>
        <mesh material={red} castShadow><boxGeometry args={[1.1, 0.55, 0.55]} /></mesh>
        <mesh material={dark} position={[0, 0.33, 0]}><boxGeometry args={[0.6, 0.06, 0.08]} /></mesh>
      </group>
      <mesh material={black} position={[3.6, -0.55, 0.7]} rotation-x={Math.PI / 2} castShadow><torusGeometry args={[0.45, 0.18, 10, 24]} /></mesh>
      <Tools />
    </group>
  )
}

const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }
function Lamp({ prog }) {
  const pivot = useRef(), spot = useRef(), target = useMemo(() => new THREE.Object3D(), []), bulb = useRef()
  const { camera, size } = useThree()
  const x = useRef(-3.3), cp = useRef(new THREE.Vector3(0, 0.4, 8)), tp = useMemo(() => new THREE.Vector3(), []), look = useMemo(() => new THREE.Vector3(), [])
  const wp = useMemo(() => new THREE.Vector3(), [])
  useFrame((st, dt) => {
    dt = Math.min(dt, 1 / 30)
    const p = prog.current, t = st.clock.elapsedTime, mob = size.width < 768
    const tx = mob ? -1.8 + p * 3.6 : -3.3 + p * 7.0
    x.current += (tx - x.current) * (1 - Math.exp(-dt * 3))
    pivot.current.position.x = x.current
    pivot.current.rotation.z = Math.sin(t * 1.25) * (0.16 + Math.abs(tx - x.current) * 0.25) + (tx - x.current) * -0.4
    pivot.current.rotation.x = Math.sin(t * 0.9) * 0.05 - 0.12
    bulb.current.getWorldPosition(wp)
    target.position.set(wp.x * 1.04, wp.y - 1.6, 0)
    tp.set(x.current * (mob ? 0.75 : 0.3), (mob ? 1.2 : 0.3) - ss(0, 1, p) * 0.3 + st.pointer.y * 0.15, (mob ? 13 : 8.2) - p * 1.2)
    tp.x += st.pointer.x * 0.35
    cp.current.lerp(tp, 1 - Math.exp(-dt * 3)); camera.position.copy(cp.current)
    look.set(cp.current.x * 0.8, mob ? 1.0 : 0.2, 0); camera.lookAt(look)
  })
  return (
    <>
    <primitive object={target} />
    <group ref={pivot} position={[-3.3, 4.6, 1.9]}>
      <mesh material={black} position={[0, -1.1, 0]}><cylinderGeometry args={[0.012, 0.012, 2.2, 4]} /></mesh>
      <group position={[0, -2.3, 0]} rotation-x={0.35}>
        <mesh material={dark}><coneGeometry args={[0.32, 0.38, 16, 1, true]} /></mesh>
        {Array.from({ length: 4 }).map((_, i) => <mesh key={i} material={dark} rotation-y={(i / 4) * Math.PI} position={[0, -0.28, 0]}><torusGeometry args={[0.2, 0.008, 4, 16]} /></mesh>)}
        <mesh ref={bulb} position={[0, -0.12, 0]}><sphereGeometry args={[0.1, 16, 12]} /><meshBasicMaterial color="#ffd38a" toneMapped={false} /></mesh>
        <pointLight position={[0, -0.15, 0.1]} intensity={2.2} distance={4} color="#ffb347" decay={2} />
      </group>
      <spotLight ref={spot} position={[0, -2.45, 0]} target={target} angle={0.55} penumbra={0.65} intensity={60} distance={9} decay={1.6} color="#ffbe6b"
        castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0006} />
    </group>
    </>
  )
}

function Dust({ prog }) {
  const ref = useRef()
  const geo = useMemo(() => {
    const n = 220, a = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) { a[i * 3] = (Math.random() - 0.5) * 9; a[i * 3 + 1] = Math.random() * 4 - 1.5; a[i * 3 + 2] = Math.random() * 2.2 + 0.3 }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(a, 3)); return g
  }, [])
  useFrame(({ clock }) => { ref.current.rotation.y = Math.sin(clock.elapsedTime * 0.05) * 0.1; ref.current.position.y = Math.sin(clock.elapsedTime * 0.3) * 0.08; ref.current.position.x = -3.3 + prog.current * 7 })
  return <points ref={ref} geometry={geo}><pointsMaterial color="#ffcf8a" size={0.025} transparent opacity={0.55} depthWrite={false} /></points>
}

export default function BayScene({ prog, active }) {
  return (
    <Canvas frameloop={active ? 'always' : 'never'} shadows dpr={[1, 1.6]} camera={{ position: [0, 0.4, 8], fov: 38 }} gl={{ antialias: true }}
      style={{ pointerEvents: 'none' }} eventSource={typeof document !== 'undefined' ? document.getElementById('root') : undefined} eventPrefix="client">
      <color attach="background" args={['#0b0c0d']} />
      <fog attach="fog" args={['#0b0c0d', 9, 18]} />
      <ambientLight intensity={0.05} />
      <Bay />
      <Lamp prog={prog} />
      <Dust prog={prog} />
      <Environment resolution={64}>
        <Lightformer form="rect" intensity={0.6} position={[0, 4, 5]} scale={[10, 1, 1]} color="#ffcf8a" />
        <Lightformer form="rect" intensity={0.25} position={[-6, 0, 3]} rotation-y={Math.PI / 2} scale={[4, 2, 1]} color="#8fa3b8" />
      </Environment>
    </Canvas>
  )
}
