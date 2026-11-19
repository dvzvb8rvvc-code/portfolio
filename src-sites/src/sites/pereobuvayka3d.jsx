import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, ContactShadows, RoundedBox } from '@react-three/drei'

/* a toy car takes off its sneakers and puts on winter boots */
const cl = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const ss = (a, b, v) => { const t = cl((v - a) / (b - a)); return t * t * (3 - 2 * t) }
const back = t => { const c = 1.7; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2) }
const INK = '#22124a', CORAL = '#ff6f59', LEMON = '#ffd23f', MINT = '#43d9a3', SKY = '#7cc6ff', CREAM = '#fff6e5'
const SLOTS = [[0.92, 0.68], [0.92, -0.68], [-0.92, 0.68], [-0.92, -0.68]]
const WY = -0.42

function Sneaker() {
  // white sidewall, coral rim, "laces" across the tread
  return (
    <group rotation-x={Math.PI / 2}>
      <mesh rotation-x={Math.PI / 2}><torusGeometry args={[0.32, 0.15, 18, 40]} /><meshStandardMaterial color="#fbfbf7" roughness={0.5} /></mesh>
      <mesh><cylinderGeometry args={[0.24, 0.24, 0.2, 32]} /><meshStandardMaterial color={CORAL} roughness={0.35} metalness={0.1} /></mesh>
      <mesh position-y={0.11}><cylinderGeometry args={[0.07, 0.07, 0.04, 20]} /><meshStandardMaterial color={CREAM} /></mesh>
      {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
        <mesh key={i} rotation-y={(i / 8) * Math.PI * 2} position={[Math.cos((i / 8) * Math.PI * 2) * 0.46, 0, -Math.sin((i / 8) * Math.PI * 2) * 0.46]}>
          <boxGeometry args={[0.035, 0.24, 0.05]} /><meshStandardMaterial color={CORAL} />
        </mesh>
      ))}
    </group>
  )
}
function Boot() {
  // chunky dark tread with studs, cosy fur cuff, lemon rim
  const studs = useMemo(() => Array.from({ length: 18 }, (_, i) => (i / 18) * Math.PI * 2), [])
  return (
    <group rotation-x={Math.PI / 2}>
      <mesh rotation-x={Math.PI / 2}><torusGeometry args={[0.32, 0.18, 18, 40]} /><meshStandardMaterial color="#2c2346" roughness={0.8} /></mesh>
      {studs.map((a, i) => (
        <mesh key={i} position={[Math.cos(a) * 0.5, (i % 2 ? 0.07 : -0.07), Math.sin(a) * 0.5]} rotation-z={Math.PI / 2} rotation-y={-a}>
          <boxGeometry args={[0.08, 0.06, 0.11]} /><meshStandardMaterial color="#3b3160" roughness={0.7} />
        </mesh>
      ))}
      <mesh position-y={0.12} rotation-x={Math.PI / 2}><torusGeometry args={[0.25, 0.06, 12, 36]} /><meshStandardMaterial color={CREAM} roughness={1} /></mesh>
      <mesh><cylinderGeometry args={[0.22, 0.22, 0.24, 32]} /><meshStandardMaterial color={LEMON} roughness={0.35} metalness={0.1} /></mesh>
      <mesh position-y={0.13}><cylinderGeometry args={[0.07, 0.07, 0.04, 20]} /><meshStandardMaterial color={INK} /></mesh>
    </group>
  )
}

function Car({ progress }) {
  const root = useRef(), body = useRef(), sn = useRef([]), bt = useRef([]), bin = useRef(), weights = useRef()
  const { size } = useThree()
  useFrame((st, dt) => {
    const p = progress.get(), t = st.clock.elapsedTime, mob = size.width < 768
    const lift = ss(0.12, 0.2, p) * (1 - ss(0.46, 0.54, p))
    const off = ss(0.16, 0.32, p), on = ss(0.32, 0.48, p), spin = ss(0.55, 0.62, p) * (1 - ss(0.72, 0.78, p))
    const toBin = ss(0.8, 0.95, p), binIn = ss(0.76, 0.84, p)
    root.current.scale.setScalar(mob ? 0.62 : 1)
    root.current.position.set(mob ? 0 : 0.2, mob ? -1.25 : -0.85, 0)
    root.current.rotation.y = THREE.MathUtils.lerp(root.current.rotation.y, -0.55 + st.pointer.x * 0.25, 1 - Math.exp(-Math.min(dt, 0.25) * 4))
    body.current.position.y = lift * 0.55 + Math.sin(t * 2.2) * 0.025 * (1 - lift)
    body.current.rotation.z = Math.sin(t * 1.4) * 0.015
    SLOTS.forEach(([x, z], i) => {
      const s = sn.current[i], b = bt.current[i]
      const side = Math.sign(z)
      // sneakers hop off sideways, then later get tossed into the recycle bin
      const hop = Math.sin(off * Math.PI) * 0.5
      const sx = x + off * (x > 0 ? 0.5 : -0.5), sz = z + off * side * 1.1
      s.position.set(THREE.MathUtils.lerp(sx, -2.6, toBin), WY + lift * 0.55 * (1 - off) + hop - off * 0.08 + Math.sin(toBin * Math.PI) * 1.2 - toBin * 0.1, THREE.MathUtils.lerp(sz, -1.2, toBin))
      s.scale.setScalar(Math.max(0.001, 1 - toBin * 0.75))
      s.visible = toBin < 0.99
      s.rotation.z = -p * 18 * (1 - off) - off * 2
      // boots drop in from above with a little bounce
      const k = back(on)
      b.position.set(x, WY + lift * 0.55 + (1 - k) * 2.8, z)
      b.visible = on > 0.001
      b.rotation.z = -(p * 18 + spin * t * 14)
    })
    weights.current.visible = spin > 0.05
    weights.current.scale.setScalar(spin)
    bin.current.scale.setScalar(Math.max(0.001, binIn))
    bin.current.visible = binIn > 0.01
  })
  return (
    <group ref={root}>
      <group ref={body}>
        <RoundedBox args={[2.7, 0.62, 1.32]} radius={0.28} smoothness={4} position-y={0}><meshStandardMaterial color={CORAL} roughness={0.35} /></RoundedBox>
        <RoundedBox args={[1.5, 0.62, 1.16]} radius={0.26} smoothness={4} position={[-0.15, 0.5, 0]}><meshStandardMaterial color={CORAL} roughness={0.35} /></RoundedBox>
        <RoundedBox args={[1.32, 0.42, 1.2]} radius={0.16} smoothness={3} position={[-0.15, 0.53, 0]}><meshStandardMaterial color={SKY} roughness={0.15} metalness={0.2} /></RoundedBox>
        <mesh position={[-0.15, 0.53, 0]}><boxGeometry args={[0.07, 0.44, 1.22]} /><meshStandardMaterial color={CORAL} /></mesh>
        {/* headlight eyes */}
        {[0.36, -0.36].map(z => (
          <group key={z} position={[1.33, 0.08, z]}>
            <mesh><sphereGeometry args={[0.13, 24, 24]} /><meshStandardMaterial color={CREAM} roughness={0.2} /></mesh>
            <mesh position-x={0.09}><sphereGeometry args={[0.06, 16, 16]} /><meshStandardMaterial color={INK} /></mesh>
          </group>
        ))}
        <mesh position={[1.36, -0.16, 0]}><boxGeometry args={[0.04, 0.05, 0.4]} /><meshStandardMaterial color={INK} /></mesh>
        <mesh position={[-1.36, 0.06, 0]}><boxGeometry args={[0.04, 0.12, 0.9]} /><meshStandardMaterial color={LEMON} /></mesh>
        <mesh position={[0, -0.02, 0.665]}><boxGeometry args={[2.1, 0.06, 0.02]} /><meshStandardMaterial color={LEMON} /></mesh>
        <mesh position={[0, -0.02, -0.665]}><boxGeometry args={[2.1, 0.06, 0.02]} /><meshStandardMaterial color={LEMON} /></mesh>
      </group>
      {SLOTS.map((_, i) => <group key={'s' + i} ref={el => (sn.current[i] = el)}><Sneaker /></group>)}
      {SLOTS.map((_, i) => <group key={'b' + i} ref={el => (bt.current[i] = el)}><Boot /></group>)}
      {/* balancing weights floating near the front wheel */}
      <group ref={weights} position={[0.92, WY + 0.75, 1.15]}>
        {[-0.22, 0, 0.22].map((x, i) => <mesh key={i} position={[x, Math.sin(i) * 0.05, 0]}><boxGeometry args={[0.16, 0.08, 0.06]} /><meshStandardMaterial color="#c9c3d9" metalness={0.8} roughness={0.25} /></mesh>)}
      </group>
      {/* recycle bin */}
      <group ref={bin} position={[-2.6, WY - 0.05, -1.2]}>
        <mesh position-y={0.3}><cylinderGeometry args={[0.55, 0.46, 0.85, 32, 1, true]} /><meshStandardMaterial color={MINT} roughness={0.5} side={THREE.DoubleSide} /></mesh>
        <mesh position-y={-0.12}><cylinderGeometry args={[0.46, 0.46, 0.02, 32]} /><meshStandardMaterial color={MINT} /></mesh>
        <mesh position-y={0.73} rotation-x={Math.PI / 2}><torusGeometry args={[0.55, 0.04, 10, 40]} /><meshStandardMaterial color={INK} /></mesh>
      </group>
      <ContactShadows position={[0, WY - 0.5, 0]} opacity={0.45} scale={9} blur={2.2} far={3} resolution={256} color={INK} />
    </group>
  )
}

export default function CarScene({ progress, active }) {
  return (
    <Canvas frameloop={active ? 'always' : 'never'} dpr={[1, 1.6]} camera={{ position: [0, 1.5, 8], fov: 33 }} gl={{ antialias: true, alpha: true }} style={{ pointerEvents: 'none' }}
      eventSource={typeof document !== 'undefined' ? document.getElementById('root') : undefined} eventPrefix="client">
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 6, 5]} intensity={1.5} />
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={3} position={[0, 5, 3]} scale={[10, 2, 1]} />
        <Lightformer form="rect" intensity={1.8} color="#ffe7c2" position={[-6, 1, 2]} rotation-y={Math.PI / 2} scale={[8, 2, 1]} />
        <Lightformer form="rect" intensity={1.4} color="#c9e8ff" position={[6, 0, 2]} rotation-y={-Math.PI / 2} scale={[8, 2, 1]} />
      </Environment>
      <Car progress={progress} />
    </Canvas>
  )
}
