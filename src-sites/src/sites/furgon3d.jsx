import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, Edges, Grid } from '@react-three/drei'

/* a strict black van-prism on a grid; scroll orbits it and lights up the system of each chapter */
const cl = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const sm = t => t * t * (3 - 2 * t)
// keyframes: [progress, rotY, rotX, zoom]
const KF = [[0, -0.62, 0.12, 0.58], [0.12, -0.62, 0.12, 0.62], [0.32, 2.5, 0.42, 0.9], [0.52, 0.55, 0.16, 0.88], [0.72, 1.45, 0.1, 0.95], [0.9, -0.62, 0.12, 0.85]]
function kf(p) {
  for (let i = 0; i < KF.length - 1; i++) {
    const a = KF[i], b = KF[i + 1]
    if (p <= b[0]) { const t = sm(cl((p - a[0]) / (b[0] - a[0]))); return [1, 2, 3].map(k => a[k] + (b[k] - a[k]) * t) }
  }
  const l = KF[KF.length - 1]; return [l[1], l[2], l[3]]
}
const W = 1.9 // body width

function useBody() {
  return useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(-2.2, 0.35); s.lineTo(-1.84, 0.35)
    s.absarc(-1.4, 0.35, 0.44, Math.PI, 0, true); s.lineTo(0.91, 0.35)
    s.absarc(1.35, 0.35, 0.44, Math.PI, 0, true); s.lineTo(2.28, 0.35)
    s.lineTo(2.26, 1.02); s.lineTo(1.72, 1.3); s.lineTo(1.12, 2.2); s.lineTo(-2.2, 2.2); s.closePath()
    const g = new THREE.ExtrudeGeometry(s, { depth: W, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 2, curveSegments: 24 })
    g.translate(0, 0, -W / 2)
    return g
  }, [])
}

function Wheel({ x, z, mat }) {
  return (
    <group position={[x, 0.35, z]} rotation-x={Math.PI / 2}>
      <mesh><cylinderGeometry args={[0.37, 0.37, 0.28, 40]} /><meshStandardMaterial color="#050505" roughness={0.7} /></mesh>
      <mesh position-y={z > 0 ? 0.145 : -0.145}><cylinderGeometry args={[0.2, 0.2, 0.01, 32]} /><meshStandardMaterial ref={mat} color="#cfcfcf" metalness={1} roughness={0.25} emissive="#ffffff" emissiveIntensity={0} /></mesh>
    </group>
  )
}

function Rig({ progress }) {
  const g = useRef(), drop = useRef(), beam = useRef(), armA = useRef(), armB = useRef(), glass = useRef()
  const hubs = [useRef(), useRef(), useRef(), useRef()]
  const { size } = useThree()
  const body = useBody()
  useFrame((st, dt) => {
    const p = progress.get(), mob = size.width < 768
    const [ry, rx, z] = kf(p)
    const s = (mob ? 0.62 : 1) * z
    g.current.scale.setScalar(THREE.MathUtils.lerp(g.current.scale.x, s, 0.12))
    g.current.position.set(0, THREE.MathUtils.lerp(mob ? -2.7 : -2.6, mob ? -1.7 : -1.62, sm(cl(p / 0.22))), 0)
    g.current.rotation.y = THREE.MathUtils.lerp(g.current.rotation.y, ry + st.pointer.x * 0.12, 0.08)
    g.current.rotation.x = THREE.MathUtils.lerp(g.current.rotation.x, rx - st.pointer.y * 0.04, 0.08)
    const on = (a, b) => cl(Math.min((p - a) / 0.05, (b - p) / 0.05))
    const c1 = on(0.2, 0.42), c2 = on(0.42, 0.62), c3 = on(0.62, 0.8)
    beam.current.emissiveIntensity = c1 * 1.6
    armA.current.emissiveIntensity = armB.current.emissiveIntensity = c1 * 1.6
    hubs.forEach((h, i) => { if (h.current) h.current.emissiveIntensity = (i < 2 ? c2 : c2 * 0.3) * 1.4 })
    // oil drop falls into the bay during chapter 3
    const k = cl((p - 0.62) / 0.16)
    drop.current.visible = c3 > 0.01
    drop.current.position.set(1.9, 2.6 - k * 1.5, 0)
    drop.current.scale.setScalar(0.22 * (1 - k * 0.5) * c3)
    glass.current.emissiveIntensity = 0.12 + cl((p - 0.8) / 0.08) * 0.5
  })
  return (
    <group ref={g}>
      <Grid position={[0, -0.03, 0]} args={[40, 40]} cellSize={0.5} cellThickness={0.6} cellColor="#1f1f1f" sectionSize={2.5} sectionThickness={1} sectionColor="#3a3a3a" fadeDistance={22} fadeStrength={1.5} infiniteGrid />
      <mesh geometry={body}>
        <meshStandardMaterial color="#0b0b0b" metalness={0.75} roughness={0.22} />
        <Edges threshold={20} color="#ffffff" />
      </mesh>
      {/* windshield + side window strips */}
      <mesh position={[1.45, 1.77, 0]} rotation-z={-0.983}><boxGeometry args={[1.0, 0.02, W - 0.18]} /><meshStandardMaterial ref={glass} color="#111" emissive="#ffffff" emissiveIntensity={0.12} metalness={1} roughness={0.1} /></mesh>
      {[1, -1].map(sd => <mesh key={sd} position={[0.9, 1.72, sd * (W / 2 + 0.045)]}><planeGeometry args={[0.55, 0.5]} /><meshStandardMaterial side={THREE.DoubleSide} color="#141414" metalness={1} roughness={0.1} /></mesh>)}
      {[[-1.4, 1], [-1.4, -1], [1.35, 1], [1.35, -1]].map(([x, sd], i) => <Wheel key={i} x={x} z={sd * (W / 2 - 0.08)} mat={hubs[i < 2 ? 2 + i : i - 2]} />)}
      {/* rear torsion beam */}
      <mesh position={[-1.4, 0.32, 0]} rotation-x={Math.PI / 2}><cylinderGeometry args={[0.07, 0.07, W - 0.4, 16]} /><meshStandardMaterial ref={beam} color="#3a3a3a" metalness={1} roughness={0.35} emissive="#ffffff" emissiveIntensity={0} /></mesh>
      {/* front lower arms */}
      <group>
        {[1, -1].map(sd => <mesh key={sd} position={[1.15, 0.24, sd * 0.55]} rotation-y={sd * 0.5}><boxGeometry args={[0.7, 0.06, 0.12]} /><meshStandardMaterial ref={sd > 0 ? armA : armB} color="#3a3a3a" metalness={1} roughness={0.35} emissive="#ffffff" emissiveIntensity={0} /></mesh>)}
      </group>
      <mesh ref={drop} visible={false}><sphereGeometry args={[1, 32, 24]} /><meshStandardMaterial color="#e8e8e8" metalness={0.2} roughness={0.05} emissive="#ffffff" emissiveIntensity={0.35} /></mesh>
    </group>
  )
}

export default function VanScene({ progress, active }) {
  return (
    <Canvas frameloop={active ? 'always' : 'never'} dpr={[1, 1.6]} camera={{ position: [0, 1.1, 9.5], fov: 34 }} gl={{ antialias: true, alpha: true }} style={{ pointerEvents: 'none' }}
      eventSource={typeof document !== 'undefined' ? document.getElementById('root') : undefined} eventPrefix="client">
      <ambientLight intensity={0.15} />
      <directionalLight position={[3, 6, 4]} intensity={0.8} />
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={3} position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[10, 3, 1]} />
        <Lightformer form="rect" intensity={2} position={[-6, 1, 2]} rotation-y={Math.PI / 2} scale={[6, 0.4, 1]} />
        <Lightformer form="rect" intensity={2} position={[6, 1, -2]} rotation-y={-Math.PI / 2} scale={[6, 0.4, 1]} />
      </Environment>
      <Rig progress={progress} />
    </Canvas>
  )
}
