import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, RoundedBox, ContactShadows } from '@react-three/drei'

// must match goldenbeauty.jsx chapter ranges
export const RANGES = [[0.14, 0.34], [0.34, 0.54], [0.54, 0.74], [0.74, 1.01]]

function iconTex(kind) {
  const c = document.createElement('canvas'); c.width = c.height = 256
  const x = c.getContext('2d')
  x.strokeStyle = x.fillStyle = '#3b2306'; x.lineWidth = 14; x.lineCap = x.lineJoin = 'round'
  if (kind === 'foot') {
    x.beginPath(); x.ellipse(128, 160, 44, 64, 0.08, 0, Math.PI * 2); x.stroke()
    ;[[96, 72, 15], [124, 62, 13], [150, 64, 11], [172, 74, 10], [190, 90, 9]].forEach(([a, b2, r]) => { x.beginPath(); x.arc(a, b2, r, 0, Math.PI * 2); x.fill() })
  } else if (kind === 'brow') {
    x.beginPath(); x.moveTo(52, 150); x.quadraticCurveTo(120, 70, 210, 120); x.lineWidth = 26; x.stroke()
    x.lineWidth = 10; x.beginPath(); x.moveTo(60, 196); x.quadraticCurveTo(128, 160, 196, 196); x.stroke()
  } else if (kind === 'lash') {
    x.beginPath(); x.moveTo(44, 140); x.quadraticCurveTo(128, 70, 212, 140); x.quadraticCurveTo(128, 200, 44, 140); x.stroke()
    x.beginPath(); x.arc(128, 138, 22, 0, Math.PI * 2); x.fill()
    for (let i = 0; i < 7; i++) { const t = 0.15 + i * 0.117, px = 44 + t * 168, py = 140 - Math.sin(t * Math.PI) * 52; x.beginPath(); x.moveTo(px, py); x.lineTo(px + (t - 0.5) * 40, py - 30); x.lineWidth = 9; x.stroke() }
  } else if (kind === 'nail') {
    x.beginPath(); x.moveTo(84, 210); x.lineTo(84, 110); x.quadraticCurveTo(84, 50, 128, 50); x.quadraticCurveTo(172, 50, 172, 110); x.lineTo(172, 210); x.stroke()
    x.beginPath(); x.moveTo(100, 200); x.lineTo(100, 116); x.quadraticCurveTo(100, 72, 128, 72); x.quadraticCurveTo(156, 72, 156, 116); x.lineTo(156, 200); x.closePath(); x.fill()
  } else {
    x.fillStyle = '#f3e7cf'; x.font = '600 120px Inter, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(kind, 128, 136)
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4
  return t
}

const KEYS = [
  { k: 'foot', p: [-0.78, 0, -0.78] },
  { k: 'brow', p: [0.78, 0, -0.78] },
  { k: 'lash', p: [-0.78, 0, 0.78] },
  { k: 'nail', p: [0.78, 0, 0.78] },
]
const DECO = [
  { k: '⌘', p: [-2.35, -0.05, -0.3], s: 0.8 },
  { k: 'K', p: [2.35, -0.05, -0.1], s: 0.8 },
  { k: '↵', p: [2.1, -0.05, 1.75], s: 0.7 },
]
const ss = (a, b, v) => { const t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t) }

function Key({ k, p, i, progress }) {
  const g = useRef(), mat = useRef()
  const tex = useMemo(() => iconTex(k), [k])
  const amber = useMemo(() => new THREE.Color('#ff9a1f'), [])
  useFrame((st, dt) => {
    const v = progress.get(), t = st.clock.elapsedTime
    const [a, b] = RANGES[i]
    const on = ss(a, a + 0.05, v) * (1 - ss(b - 0.03, b + 0.02, v))
    const press = ss(a + 0.02, a + 0.06, v) * (1 - ss(a + 0.07, a + 0.11, v))
    const intro = v < 0.12 ? Math.sin(t * 1.4 + i * 1.3) * 0.06 : 0
    const y = on * 0.42 - press * 0.3 + intro
    g.current.position.y += (y - g.current.position.y) * Math.min(1, dt * 8)
    mat.current.emissiveIntensity += (on * 0.55 - mat.current.emissiveIntensity) * Math.min(1, dt * 6)
  })
  return (
    <group ref={g} position={p}>
      <RoundedBox args={[1.36, 0.62, 1.36]} radius={0.2} smoothness={4}>
        <meshPhysicalMaterial ref={mat} color="#e9b54c" emissive={amber} emissiveIntensity={0} metalness={1} roughness={0.16} clearcoat={1} clearcoatRoughness={0.08} envMapIntensity={1.6} />
      </RoundedBox>
      <mesh rotation-x={-Math.PI / 2} position-y={0.312}><planeGeometry args={[0.9, 0.9]} /><meshStandardMaterial map={tex} transparent metalness={0.5} roughness={0.35} /></mesh>
    </group>
  )
}
function Deco({ k, p, s }) {
  const tex = useMemo(() => iconTex(k), [k])
  const g = useRef()
  useFrame(st => { g.current.position.y = p[1] + Math.sin(st.clock.elapsedTime * 1.1 + p[0]) * 0.05 })
  return (
    <group ref={g} position={p} scale={s}>
      <RoundedBox args={[1.2, 0.56, 1.2]} radius={0.2} smoothness={4}>
        <meshPhysicalMaterial color="#17130f" metalness={0.6} roughness={0.12} clearcoat={1} clearcoatRoughness={0.05} envMapIntensity={1.4} />
      </RoundedBox>
      <mesh rotation-x={-Math.PI / 2} position-y={0.285}><planeGeometry args={[0.8, 0.8]} /><meshBasicMaterial map={tex} transparent toneMapped={false} /></mesh>
    </group>
  )
}

function Rig({ progress, children }) {
  const g = useRef(), { size } = useThree()
  useFrame((st, dt) => {
    const v = progress.get(), mob = size.width < 768
    const film = ss(0.06, 0.16, v)
    const tx = mob ? 0 : 1.7 - film * 0.2
    const ty = mob ? 1.15 : 0.1
    g.current.position.x += (tx - g.current.position.x) * Math.min(1, dt * 4)
    g.current.position.y = ty
    g.current.scale.setScalar(mob ? 0.62 : 1)
    const ry = -0.55 + v * 0.9 + st.pointer.x * 0.15
    g.current.rotation.y += (ry - g.current.rotation.y) * Math.min(1, dt * 4)
    g.current.rotation.x = 0.62 - st.pointer.y * 0.08
  })
  return <group ref={g}>{children}</group>
}

export default function KeysScene({ progress, active }) {
  return (
    <Canvas frameloop={active ? 'always' : 'never'} dpr={[1, 1.6]} camera={{ position: [0, 0, 9], fov: 32 }} gl={{ antialias: true, alpha: true }} style={{ pointerEvents: 'none' }}
      eventSource={typeof document !== 'undefined' ? document.getElementById('root') : undefined} eventPrefix="client">
      <Rig progress={progress}>
        {KEYS.map((k, i) => <Key key={k.k} {...k} i={i} progress={progress} />)}
        {DECO.map(d => <Deco key={d.k} {...d} />)}
        <ContactShadows position={[0, -0.34, 0]} scale={8} blur={2.4} far={2} opacity={0.6} color="#000" resolution={256} />
      </Rig>
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={4} position={[0, 5, 2]} rotation-x={Math.PI / 2} scale={[8, 2, 1]} color="#fff4dc" />
        <Lightformer form="rect" intensity={3} position={[-5, 1, 1]} rotation-y={Math.PI / 2} scale={[6, 1, 1]} color="#ffd38a" />
        <Lightformer form="rect" intensity={2.5} position={[5, 0, -1]} rotation-y={-Math.PI / 2} scale={[6, 2, 1]} color="#ff8a2a" />
        <Lightformer form="ring" intensity={4} position={[1, 3, 5]} scale={1.2} color="#ffffff" />
      </Environment>
    </Canvas>
  )
}
