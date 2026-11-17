import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, ContactShadows } from '@react-three/drei'

/* a giant hex nut spins down a threaded bolt as you scroll */
const cl = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const ease = t => 1 - Math.pow(1 - t, 3)
const PITCH = 0.16, SHAFT = 0.42, TOP = 1.05, HEAD_Y = -2.35
const NUT_H = 0.62, NUT_START = 2.15, NUT_END = HEAD_Y + 0.25 + 0.05 + NUT_H / 2

class Helix extends THREE.Curve {
  constructor(r, pitch, y0, y1) { super(); this.r = r; this.p = pitch; this.y0 = y0; this.y1 = y1 }
  getPoint(t, out = new THREE.Vector3()) {
    const y = this.y0 + (this.y1 - this.y0) * t
    const a = ((y - this.y0) / this.p) * Math.PI * 2
    return out.set(Math.cos(a) * this.r, y, Math.sin(a) * this.r)
  }
}

function Bolt() {
  const thread = useMemo(() => {
    const y0 = HEAD_Y + 0.3, turns = (TOP - 0.06 - y0) / PITCH
    return new THREE.TubeGeometry(new Helix(SHAFT, PITCH, y0, TOP - 0.06), Math.round(turns * 40), 0.05, 6, false)
  }, [])
  const steel = <meshStandardMaterial color="#7d8288" metalness={1} roughness={0.32} />
  return (
    <group>
      <mesh position-y={(TOP + HEAD_Y) / 2}><cylinderGeometry args={[SHAFT - 0.02, SHAFT - 0.02, TOP - HEAD_Y, 40]} />{steel}</mesh>
      <mesh geometry={thread}><meshStandardMaterial color="#9aa0a6" metalness={1} roughness={0.28} /></mesh>
      <mesh position-y={TOP + 0.02}><cylinderGeometry args={[SHAFT - 0.07, SHAFT - 0.02, 0.06, 40]} />{steel}</mesh>
      {/* hex head */}
      <mesh position-y={HEAD_Y} rotation-y={Math.PI / 6}><cylinderGeometry args={[0.95, 0.95, 0.5, 6]} /><meshStandardMaterial color="#5c6168" metalness={1} roughness={0.38} flatShading /></mesh>
      <mesh position-y={HEAD_Y + 0.27}><cylinderGeometry args={[0.86, 0.86, 0.05, 48]} /><meshStandardMaterial color="#8a8f95" metalness={1} roughness={0.3} /></mesh>
    </group>
  )
}

function useNutGeo() {
  return useMemo(() => {
    const s = new THREE.Shape()
    for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; const x = Math.cos(a) * 0.92, y = Math.sin(a) * 0.92; i ? s.lineTo(x, y) : s.moveTo(x, y) }
    s.closePath()
    const h = new THREE.Path(); h.absarc(0, 0, SHAFT + 0.07, 0, Math.PI * 2, true); s.holes.push(h)
    const g = new THREE.ExtrudeGeometry(s, { depth: NUT_H - 0.08, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 1, curveSegments: 40 })
    g.translate(0, 0, -(NUT_H - 0.08) / 2)
    g.rotateX(Math.PI / 2)
    return g
  }, [])
}

function Rig({ progress }) {
  const g = useRef(), nut = useRef(), last = useRef(0)
  const { size } = useThree()
  const geo = useNutGeo()
  useFrame((st, dt) => {
    const p = progress.get(), mob = size.width < 768
    const k = ease(cl((p - 0.04) / 0.86))
    const y = THREE.MathUtils.lerp(NUT_START, NUT_END, k)
    nut.current.position.y = y + (1 - cl(k * 8)) * Math.sin(st.clock.elapsedTime * 1.6) * 0.06
    const onThread = y < TOP + NUT_H / 2
    // real pitch would be ~30 turns; show a readable fraction of it plus an idle spin before contact
    nut.current.rotation.y = -((NUT_START - y) / PITCH) * Math.PI * 0.5
    nut.current.position.x = onThread ? 0 : Math.sin(st.clock.elapsedTime * 1.3) * 0.03
    g.current.scale.setScalar(mob ? 0.58 : 1)
    g.current.position.set(mob ? 0 : 2.3, mob ? -0.55 : -0.1, 0)
    g.current.rotation.y = THREE.MathUtils.lerp(g.current.rotation.y, st.pointer.x * 0.25 + 0.3, 0.06)
    g.current.rotation.x = THREE.MathUtils.lerp(g.current.rotation.x, 0.18 + st.pointer.y * -0.08, 0.06)
    last.current = p
  })
  return (
    <group ref={g}>
      <Bolt />
      <mesh ref={nut} geometry={geo}><meshStandardMaterial color="#ffd400" metalness={0.55} roughness={0.3} flatShading /></mesh>
      <ContactShadows position={[0, HEAD_Y - 0.26, 0]} opacity={0.55} scale={5} blur={2.4} far={2} resolution={256} color="#000" />
    </group>
  )
}

export default function NutScene({ progress, active }) {
  return (
    <Canvas frameloop={active ? 'always' : 'never'} dpr={[1, 1.6]} camera={{ position: [0, 0.4, 9], fov: 35 }} gl={{ antialias: true, alpha: true }} style={{ pointerEvents: 'none' }}
      eventSource={typeof document !== 'undefined' ? document.getElementById('root') : undefined} eventPrefix="client">
      <ambientLight intensity={0.25} />
      <directionalLight position={[4, 6, 5]} intensity={1.6} />
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={4} position={[0, 5, 2]} scale={[10, 1.2, 1]} />
        <Lightformer form="rect" intensity={2.2} color="#ffe680" position={[-6, 0, 1]} rotation-y={Math.PI / 2} scale={[8, 1, 1]} />
        <Lightformer form="rect" intensity={1.5} position={[6, -1, 2]} rotation-y={-Math.PI / 2} scale={[8, 0.6, 1]} />
      </Environment>
      <Rig progress={progress} />
    </Canvas>
  )
}
