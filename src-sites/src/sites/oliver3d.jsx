import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, RoundedBox, ContactShadows } from '@react-three/drei'

// slide index (continuous) -> which sculpture: ribbon covers slides 0..1, then swatch 2, dome 3, serum 4
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const ease = t => 1 - Math.pow(1 - t, 3)
const weight = (p, a, b) => (p < a ? 1 - clamp(a - p) : p > b ? 1 - clamp(p - b) : 1)

/* ---------- 1. hair-ribbon sculpture ---------- */
function ribbonGeo(phase, amp, width, len = 3.4) {
  const N = 220, pos = [], nor = [], idx = []
  const P = t => new THREE.Vector3(
    Math.sin(t * Math.PI * 1.6 + phase) * amp * (1 - t * 0.35),
    len / 2 - t * len,
    Math.cos(t * Math.PI * 1.6 + phase) * amp * 0.6
  )
  for (let i = 0; i <= N; i++) {
    const t = i / N
    const p = P(t), tan = P(Math.min(1, t + 0.002)).sub(P(Math.max(0, t - 0.002))).normalize()
    const side0 = new THREE.Vector3(0, 0, 1).cross(tan).normalize()
    const tw = t * Math.PI * 2.2 + phase
    const side = side0.clone().applyAxisAngle(tan, tw)
    const n = tan.clone().cross(side).normalize()
    const w = width * (0.35 + Math.sin(t * Math.PI) * 0.65)
    const a = p.clone().addScaledVector(side, -w / 2), b = p.clone().addScaledVector(side, w / 2)
    pos.push(a.x, a.y, a.z, b.x, b.y, b.z); nor.push(n.x, n.y, n.z, n.x, n.y, n.z)
    if (i < N) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2) }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3))
  g.setIndex(idx)
  return g
}
const STRANDS = [
  { ph: 0, amp: 0.95, w: 0.46, c: '#2a1a14' },
  { ph: 1.1, amp: 0.8, w: 0.38, c: '#8a5a33' },
  { ph: 2.3, amp: 0.9, w: 0.3, c: '#d6b07a' },
  { ph: 3.5, amp: 0.7, w: 0.34, c: '#4a2c1e' },
  { ph: 4.6, amp: 0.85, w: 0.26, c: '#b88a55' },
]
function Ribbon() {
  const geos = useMemo(() => STRANDS.map(s => ribbonGeo(s.ph, s.amp, s.w)), [])
  return (
    <group>
      {STRANDS.map((s, i) => (
        <mesh key={i} geometry={geos[i]}>
          <meshPhysicalMaterial color={s.c} metalness={0.55} roughness={0.28} clearcoat={1} clearcoatRoughness={0.15} sheen={1} sheenColor="#ffe2b8" side={THREE.DoubleSide} envMapIntensity={1.6} />
        </mesh>
      ))}
    </group>
  )
}

/* ---------- 2. colour swatch fan ---------- */
const SW = ['#efe2c8', '#d9b77c', '#ba8646', '#b45a2c', '#8c2b2b', '#c98f8f', '#9a9893', '#5b3524', '#2f1e17', '#141111']
function Fan({ amt }) {
  const blades = useRef([])
  useFrame(st => {
    const a = amt.current, t = st.clock.elapsedTime
    blades.current.forEach((b, i) => { if (b) b.rotation.z = ((i - (SW.length - 1) / 2) * 0.19 + Math.sin(t * 0.8 + i) * 0.01) * a })
  })
  return (
    <group position-y={-1.25}>
      {SW.map((c, i) => (
        <group key={c} ref={el => (blades.current[i] = el)} position-z={i * 0.035 - 0.16}>
          <RoundedBox args={[0.36, 2.6, 0.025]} radius={0.012} smoothness={2} position-y={1.3}>
            <meshPhysicalMaterial color={c} roughness={0.32} metalness={0.15} clearcoat={0.8} sheen={0.6} sheenColor="#ffffff" />
          </RoundedBox>
          <mesh position={[0, 0.25, 0.02]}><circleGeometry args={[0.07, 24]} /><meshStandardMaterial color="#f4efe7" roughness={0.6} /></mesh>
        </group>
      ))}
      <mesh rotation-x={Math.PI / 2} position-z={0.02} position-y={0.2}><cylinderGeometry args={[0.09, 0.09, 0.52, 24]} /><meshStandardMaterial color="#d9d4cc" metalness={1} roughness={0.2} /></mesh>
    </group>
  )
}

/* ---------- 3. warm light dome ---------- */
function Dome({ amt }) {
  const core = useRef(), arcs = useRef()
  useFrame(st => {
    const t = st.clock.elapsedTime, a = amt.current
    if (core.current) core.current.material.emissiveIntensity = 2.2 + Math.sin(t * 1.4) * 0.4 + a
    if (arcs.current) arcs.current.rotation.y = t * 0.12
  })
  return (
    <group position-y={-0.6}>
      <mesh rotation-y={-Math.PI * 0.35}>
        <sphereGeometry args={[1.7, 48, 24, 0, Math.PI * 1.4, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#1a120c" metalness={0.9} roughness={0.25} side={THREE.FrontSide} />
      </mesh>
      <mesh rotation-y={-Math.PI * 0.35} scale={0.985}>
        <sphereGeometry args={[1.7, 48, 24, 0, Math.PI * 1.4, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#ffb062" emissive="#ff8a2a" emissiveIntensity={0.8} roughness={0.6} side={THREE.BackSide} />
      </mesh>
      <group ref={arcs}>
        {Array.from({ length: 8 }, (_, i) => (
          <mesh key={i} rotation={[0, (i / 8) * Math.PI * 2, 0]}>
            <torusGeometry args={[1.45, 0.018, 8, 48, Math.PI / 2]} />
            <meshStandardMaterial color="#fff1d6" emissive="#ffc27a" emissiveIntensity={3} toneMapped={false} />
          </mesh>
        ))}
      </group>
      <mesh ref={core} position-y={0.7}>
        <sphereGeometry args={[0.42, 48, 24]} />
        <meshStandardMaterial color="#ffd9a0" emissive="#ffa040" emissiveIntensity={2.4} toneMapped={false} />
      </mesh>
      <pointLight position={[0, 0.8, 0.6]} color="#ff9a3c" intensity={14} distance={6} />
      <mesh rotation-x={-Math.PI / 2} position-y={0.005}><ringGeometry args={[1.62, 1.8, 48]} /><meshStandardMaterial color="#c9a27a" metalness={1} roughness={0.25} /></mesh>
    </group>
  )
}

/* ---------- 4. glass serum ---------- */
function Serum({ amt }) {
  const drop = useRef()
  const bottle = useMemo(() => {
    const pts = [[0, -1.1], [0.62, -1.1], [0.7, -1.02], [0.72, 0.3], [0.66, 0.5], [0.3, 0.72], [0.24, 0.9], [0.24, 1.0]]
    return new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), 48)
  }, [])
  const liquid = useMemo(() => {
    const pts = [[0, -1.04], [0.62, -1.04], [0.665, -0.98], [0.675, 0.05], [0, 0.05]]
    return new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), 48)
  }, [])
  useFrame(st => {
    const t = (st.clock.elapsedTime % 2.4) / 2.4
    if (drop.current) { drop.current.position.y = 2.2 - ease(t) * 1.0; drop.current.scale.setScalar(t > 0.92 ? 0 : 0.6 + t * 0.5) }
  })
  return (
    <group position-y={-0.15}>
      <mesh geometry={liquid}><meshPhysicalMaterial color="#e2a24f" roughness={0.15} clearcoat={1} emissive="#7a3d0c" emissiveIntensity={0.35} transparent opacity={0.85} /></mesh>
      <mesh geometry={bottle} renderOrder={2}><meshPhysicalMaterial color="#ffffff" transparent opacity={0.28} roughness={0.04} clearcoat={1} clearcoatRoughness={0.02} envMapIntensity={2.6} depthWrite={false} side={THREE.DoubleSide} /></mesh>
      <mesh position-y={1.18}><cylinderGeometry args={[0.28, 0.28, 0.36, 40]} /><meshPhysicalMaterial color="#14110f" metalness={0.4} roughness={0.15} clearcoat={1} /></mesh>
      <mesh position-y={1.62} scale={[1, 1.5, 1]}><sphereGeometry args={[0.23, 40, 20]} /><meshStandardMaterial color="#2b201b" roughness={0.75} /></mesh>
      <mesh position-y={0.1}><cylinderGeometry args={[0.05, 0.035, 2, 16]} /><meshPhysicalMaterial color="#ffffff" transparent opacity={0.35} roughness={0.05} clearcoat={1} depthWrite={false} /></mesh>
      <mesh ref={drop} position={[1.15, 2, 0]}><sphereGeometry args={[0.09, 32, 16]} /><meshPhysicalMaterial color="#f0b464" roughness={0.05} clearcoat={1} transparent opacity={0.9} /></mesh>
    </group>
  )
}

/* ---------- stage ---------- */
function Slot({ progress, range, children, amtRef }) {
  const g = useRef()
  useFrame((st, dt) => {
    const p = progress.get()
    const w = ease(weight(p, range[0], range[1]))
    if (amtRef) amtRef.current += (w - amtRef.current) * Math.min(1, dt * 3)
    g.current.visible = w > 0.01
    g.current.scale.setScalar(0.6 + w * 0.4)
    g.current.position.y = (1 - w) * (p < range[0] ? -1.8 : 1.8)
    g.current.rotation.y = (1 - w) * (p < range[0] ? -1.4 : 1.4) + st.clock.elapsedTime * 0.18 + st.pointer.x * 0.25
    g.current.rotation.x = st.pointer.y * -0.06
  })
  return <group ref={g}>{children}</group>
}

const RIM = ['#9fb7ff', '#9fb7ff', '#ff6f91', '#ff9a3c', '#8fe3d0']
function Rig({ progress, children }) {
  const g = useRef(), rim = useRef(), { size, camera } = useThree()
  const c = useMemo(() => new THREE.Color(), [])
  useFrame((st, dt) => {
    const p = progress.get(), mob = size.width < 768
    g.current.position.y = mob ? -0.15 : -0.25
    g.current.scale.setScalar(mob ? 0.68 : 1)
    const z = p < 1 ? 10 - p * 1.8 : 8.2
    camera.position.z += (z - camera.position.z) * Math.min(1, dt * 4)
    camera.position.y += ((0.3 + st.pointer.y * 0.2) - camera.position.y) * Math.min(1, dt * 2)
    camera.lookAt(0, 0, 0)
    const i = Math.min(RIM.length - 1, Math.round(p))
    c.set(RIM[i]); rim.current.color.lerp(c, Math.min(1, dt * 2.5))
  })
  return (
    <>
      <spotLight ref={rim} position={[-4, 3, -3]} intensity={60} angle={0.6} penumbra={1} color="#9fb7ff" />
      <group ref={g}>{children}</group>
    </>
  )
}

export default function OliverScene({ progress, active }) {
  const fan = useRef(0), dome = useRef(0), serum = useRef(0)
  return (
    <Canvas frameloop={active ? 'always' : 'never'} dpr={[1, 1.6]} camera={{ position: [0, 0.3, 10], fov: 30 }} gl={{ antialias: true, alpha: true }} style={{ pointerEvents: 'none' }}
      eventSource={typeof document !== 'undefined' ? document.getElementById('root') : undefined} eventPrefix="client">
      <Rig progress={progress}>
        <Slot progress={progress} range={[0, 1]}><Ribbon /></Slot>
        <Slot progress={progress} range={[2, 2]} amtRef={fan}><Fan amt={fan} /></Slot>
        <Slot progress={progress} range={[3, 3]} amtRef={dome}><Dome amt={dome} /></Slot>
        <Slot progress={progress} range={[4, 4]} amtRef={serum}><Serum amt={serum} /></Slot>
        <ContactShadows position={[0, -1.85, 0]} scale={7} blur={2.6} far={4} opacity={0.55} color="#000000" resolution={256} />
      </Rig>
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={5} position={[0, 5, 1]} rotation-x={Math.PI / 2} scale={[6, 3, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={2.5} position={[-5, 1, 2]} rotation-y={Math.PI / 2} scale={[5, 1.2, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={1.6} position={[5, 0, 1]} rotation-y={-Math.PI / 2} scale={[5, 3, 1]} color="#ffe2c4" />
        <Lightformer form="ring" intensity={3} position={[2, 2, 6]} scale={1.4} color="#ffffff" />
      </Environment>
    </Canvas>
  )
}
