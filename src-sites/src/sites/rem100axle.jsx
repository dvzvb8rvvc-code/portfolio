import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, ContactShadows } from '@react-three/drei'

/* Front axle: wheels start with exaggerated camber/toe; scroll (prog 0..1) straightens them.
   Angle arcs drawn as live lines. Illustrative only. */
const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }
const BAD = new THREE.Color('#ff7a45'), GOOD = new THREE.Color('#10b981')
const CAMBER = 0.16, TOE = 0.14

function useLine(color, n = 40) {
  return useMemo(() => {
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3))
    const m = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.95 })
    return new THREE.Line(g, m)
  }, [])
}
function setArc(line, cx, cy, cz, r, a0, a1, plane) {
  const p = line.geometry.attributes.position, n = p.count
  for (let i = 0; i < n; i++) {
    const a = a0 + (a1 - a0) * (i / (n - 1))
    if (plane === 'xy') p.setXYZ(i, cx + Math.sin(a) * r, cy + Math.cos(a) * r, cz)
    else p.setXYZ(i, cx + Math.sin(a) * r, cy, cz + Math.cos(a) * r)
  }
  p.needsUpdate = true
}

const tyreMat = new THREE.MeshStandardMaterial({ color: '#1b2533', roughness: 0.75 })
const rimMat = new THREE.MeshStandardMaterial({ color: '#dfe7f1', roughness: 0.18, metalness: 1 })
const axMat = new THREE.MeshStandardMaterial({ color: '#7c8ba1', roughness: 0.35, metalness: 0.9 })
const hubMat = new THREE.MeshStandardMaterial({ color: '#2563eb', roughness: 0.3, metalness: 0.4 })

function Wheel() {
  const tyre = useMemo(() => {
    const pts = []
    for (let i = 0; i <= 20; i++) { const a = (i / 20) * Math.PI; pts.push(new THREE.Vector2(0.62 + Math.sin(a) * 0.3, Math.cos(a) * 0.3)) }
    return new THREE.LatheGeometry(pts, 48)
  }, [])
  return (
    <group rotation-z={Math.PI / 2}>
      <mesh geometry={tyre} material={tyreMat} castShadow />
      <mesh material={rimMat}><cylinderGeometry args={[0.6, 0.6, 0.06, 40]} /></mesh>
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={i} material={rimMat} rotation-y={(i / 5) * Math.PI * 2} position={[0, 0.06, 0]}>
          <boxGeometry args={[0.1, 0.05, 1.1]} />
        </mesh>
      ))}
      <mesh material={hubMat} position={[0, 0.09, 0]}><cylinderGeometry args={[0.15, 0.15, 0.08, 24]} /></mesh>
    </group>
  )
}

function Axle({ prog }) {
  const L = useRef(), R = useRef(), lasers = useRef([])
  const arcL = useLine('#ff7a45'), arcR = useLine('#ff7a45'), toeL = useLine('#ff7a45'), toeR = useLine('#ff7a45')
  const refL = useLine('#94a3b8', 2), refR = useLine('#94a3b8', 2)
  const { camera, size } = useThree()
  const cp = useRef(new THREE.Vector3(0, 0.6, 7)), tp = useMemo(() => new THREE.Vector3(), []), look = useMemo(() => new THREE.Vector3(), [])
  const col = useMemo(() => new THREE.Color(), [])
  useFrame((st, dt) => {
    dt = Math.min(dt, 1 / 30)
    const p = prog.current, mob = size.width < 768
    const k = 1 - ss(0.5, 0.8, p)                 // misalignment amount
    const cam = CAMBER * k, toe = TOE * k
    // camera: front → top → 3/4
    const top = ss(0.18, 0.32, p) * (1 - ss(0.74, 0.88, p))
    const q = ss(0.78, 0.98, p)
    tp.set(0, 0.5 + top * 6.0 + q * 1.8, 7 - top * 4.6 + q * -0.5)
    tp.x = q * 3.2 + st.pointer.x * 0.3
    if (mob) tp.multiplyScalar(1.45)
    cp.current.lerp(tp, 1 - Math.exp(-dt * 5)); camera.position.copy(cp.current)
    look.set(0, 0, top * 0.6); camera.lookAt(look)
    L.current.rotation.set(0, toe, -cam); R.current.rotation.set(0, -toe, cam)
    const spin = st.clock.elapsedTime * (0.6 + q * 3)
    L.current.children[0].rotation.x = spin; R.current.children[0].rotation.x = spin
    col.copy(BAD).lerp(GOOD, 1 - k)
    ;[arcL, arcR, toeL, toeR].forEach(l => l.material.color.copy(col))
    // camber arcs (front plane) above each wheel, from vertical to tilt
    setArc(arcL, -1.9, 0, 0.5, 1.15, 0, -cam - 0.0001, 'xy')
    setArc(arcR, 1.9, 0, 0.5, 1.15, 0, cam + 0.0001, 'xy')
    // toe arcs (ground plane) in front of each wheel
    setArc(toeL, -1.9, -0.92, 0, 1.2, 0, toe + 0.0001, 'xz')
    setArc(toeR, 1.9, -0.92, 0, 1.2, 0, -toe - 0.0001, 'xz')
    const show = 1 - top
    arcL.material.opacity = arcR.material.opacity = 0.95 * show * (k > 0.02 ? 1 : 0.3)
    toeL.material.opacity = toeR.material.opacity = 0.95 * Math.max(top, 0.25) * (k > 0.02 ? 1 : 0.3)
    const pr = refL.geometry.attributes.position; pr.setXYZ(0, -1.9, 0, 0.5); pr.setXYZ(1, -1.9, 1.3, 0.5); pr.needsUpdate = true
    const pr2 = refR.geometry.attributes.position; pr2.setXYZ(0, 1.9, 0, 0.5); pr2.setXYZ(1, 1.9, 1.3, 0.5); pr2.needsUpdate = true
    // laser guides appear when aligned
    lasers.current.forEach((m, i) => {
      if (!m) return
      const on = ss(0.75, 0.9, p)
      m.scale.z = Math.max(0.001, on); m.material.opacity = on * 0.8
      m.rotation.y = i ? -toe : toe
    })
  })
  return (
    <group>
      <mesh material={axMat} rotation-z={Math.PI / 2}><cylinderGeometry args={[0.07, 0.07, 3.2, 16]} /></mesh>
      <mesh material={axMat} position={[0, 0, 0]}><boxGeometry args={[0.6, 0.3, 0.4]} /></mesh>
      <mesh material={axMat} position={[0, 0, -0.9]} rotation-x={Math.PI / 2}><cylinderGeometry args={[0.05, 0.05, 1.6, 12]} /></mesh>
      <group ref={L} position={[-1.9, 0, 0]}><group><Wheel /></group></group>
      <group ref={R} position={[1.9, 0, 0]}><group><Wheel /></group></group>
      <primitive object={arcL} /><primitive object={arcR} /><primitive object={toeL} /><primitive object={toeR} />
      <primitive object={refL} /><primitive object={refR} />
      {[-1.9, 1.9].map((x, i) => (
        <group key={i} position={[x, -0.9, 0]}>
          <mesh ref={el => (lasers.current[i] = el)} position={[0, 0, 0]}>
            <boxGeometry args={[0.03, 0.01, 7]} />
            <meshBasicMaterial color="#10b981" transparent opacity={0} />
          </mesh>
        </group>
      ))}
      <gridHelper args={[14, 28, '#c7d6ea', '#e3ebf5']} position={[0, -0.93, 0]} />
    </group>
  )
}

export default function AxleScene({ prog, active }) {
  return (
    <Canvas frameloop={active ? 'always' : 'never'} dpr={[1, 1.6]} camera={{ position: [0, 0.6, 7], fov: 34 }} gl={{ antialias: true, alpha: true }}
      style={{ pointerEvents: 'none' }} eventSource={typeof document !== 'undefined' ? document.getElementById('root') : undefined} eventPrefix="client">
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 6, 5]} intensity={1.6} />
      <Axle prog={prog} />
      <ContactShadows position={[0, -0.92, 0]} opacity={0.35} scale={10} blur={2.4} far={2} />
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={3} position={[0, 5, 3]} scale={[10, 2, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={2} position={[-5, 1, 2]} rotation-y={Math.PI / 2} scale={[6, 3, 1]} color="#93c5fd" />
        <Lightformer form="rect" intensity={2} position={[5, 1, 2]} rotation-y={-Math.PI / 2} scale={[6, 3, 1]} color="#a7f3d0" />
      </Environment>
    </Canvas>
  )
}
