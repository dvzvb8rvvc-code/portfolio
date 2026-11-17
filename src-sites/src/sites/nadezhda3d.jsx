import React, { useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, RoundedBox } from '@react-three/drei'

/* soft pastel "space" tokens that bounce around the living board.
   stage: -1 hero, 0..3 = active space, 4 = all together */
const COLORS = ['#ff9f8a', '#a48bff', '#4fc6a0', '#f4b73b']

// desktop targets (world units, camera z=10 fov 35 -> ~6.3 high)
const HERO = [[2.0, 1.0, 0], [3.5, 0.0, 0.4], [1.9, -1.1, 0.7], [3.3, 1.6, -0.6]]
const RING = [[-0.55, 2.15, 0.6], [4.75, 2.25, 0.6], [4.85, -2.15, 0.6], [-0.45, -2.2, 0.6]]
const PILE = [[3.95, 2.05, 0.6], [4.6, 2.25, 0.2], [4.3, 1.55, 0.9], [4.75, 1.6, 0.4]]
// mobile
const M_HERO = [[-0.7, 2.0, 0], [0.55, 2.35, 0.3], [0.85, 1.35, 0.6], [-0.35, 1.05, 0.2]]
const M_ROW = [[-1.05, 0.3, 0.4], [-0.35, 0.3, 0.4], [0.35, 0.3, 0.4], [1.05, 0.3, 0.4]]
const M_PILE = [[-0.25, 0.4, 0.4], [0.25, 0.5, 0.1], [0.0, 0.15, 0.7], [0.4, 0.2, 0.3]]

function Shape({ i, color }) {
  const mat = <meshPhysicalMaterial color={color} roughness={0.32} clearcoat={1} clearcoatRoughness={0.25} sheen={0.6} sheenColor="#ffffff" envMapIntensity={1.1} />
  if (i === 0) return <RoundedBox args={[1, 1, 1]} radius={0.34} smoothness={5}>{mat}</RoundedBox>
  if (i === 1) return <mesh><torusGeometry args={[0.48, 0.25, 24, 48]} />{mat}</mesh>
  if (i === 2) return <mesh rotation-z={0.6}><capsuleGeometry args={[0.34, 0.62, 10, 28]} />{mat}</mesh>
  return <mesh><sphereGeometry args={[0.58, 48, 48]} />{mat}</mesh>
}

function Token({ i, stage }) {
  const ref = useRef(), inner = useRef()
  const s = useRef({ p: new THREE.Vector3(...HERO[i]), v: new THREE.Vector3(), k: 1, kv: 0 })
  const tgt = useRef(new THREE.Vector3())
  const { size } = useThree()
  useFrame((st, dt) => {
    dt = Math.min(dt, 1 / 30)
    const mob = size.width < 768, g = stage.current, t = st.clock.elapsedTime
    const set = g < 0 ? (mob ? M_HERO : HERO) : g === 4 ? (mob ? M_PILE : PILE) : (mob ? M_ROW : RING)
    tgt.current.set(...set[i])
    if (g < 0) { tgt.current.x += st.pointer.x * (0.25 + i * 0.08); tgt.current.y += st.pointer.y * (0.2 + i * 0.06) }
    tgt.current.y += Math.sin(t * 1.3 + i * 1.7) * 0.08
    const ks = g === i ? 1.45 : g === 4 ? 0.85 : g < 0 ? (i === 1 ? 1.15 : 1) : 0.8
    const S = s.current
    // bouncy spring
    const a = tgt.current.clone().sub(S.p).multiplyScalar(70).sub(S.v.clone().multiplyScalar(8.5))
    S.v.addScaledVector(a, dt); S.p.addScaledVector(S.v, dt)
    S.kv += ((ks - S.k) * 90 - S.kv * 9) * dt; S.k += S.kv * dt
    ref.current.position.copy(S.p)
    const base = (mob ? 0.42 : 0.82) * S.k
    // jelly squash from velocity
    const sp = Math.min(0.25, S.v.length() * 0.04)
    ref.current.scale.set(base * (1 + sp), base * (1 - sp * 0.6), base)
    inner.current.rotation.x = t * 0.35 + i
    inner.current.rotation.y = t * 0.5 + i * 2 + S.v.x * 0.08
  })
  return <group ref={ref}><group ref={inner}><Shape i={i} color={COLORS[i]} /></group></group>
}

export default function Tokens({ stage, active }) {
  return (
    <Canvas frameloop={active ? 'always' : 'never'} dpr={[1, 1.6]} camera={{ position: [0, 0, 10], fov: 35 }} gl={{ antialias: true, alpha: true }} style={{ pointerEvents: 'none' }}
      eventSource={typeof document !== 'undefined' ? document.getElementById('root') : undefined} eventPrefix="client">
      {COLORS.map((c, i) => <Token key={i} i={i} stage={stage} />)}
      <ambientLight intensity={0.5} />
      <Environment resolution={128}>
        <color attach="background" args={['#fff6ee']} />
        <Lightformer form="circle" intensity={3} position={[0, 5, 4]} scale={6} color="#ffffff" />
        <Lightformer form="rect" intensity={2} position={[-5, 1, 2]} rotation-y={Math.PI / 2} scale={[6, 3, 1]} color="#ffd9f2" />
        <Lightformer form="rect" intensity={2} position={[5, -1, 2]} rotation-y={-Math.PI / 2} scale={[6, 3, 1]} color="#d6f7ff" />
        <Lightformer form="rect" intensity={1.2} position={[0, -5, 2]} rotation-x={Math.PI / 2} scale={[8, 2, 1]} color="#fff1c2" />
      </Environment>
    </Canvas>
  )
}
