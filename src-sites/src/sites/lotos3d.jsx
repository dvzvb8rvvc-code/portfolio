import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, ContactShadows } from '@react-three/drei'

/* a lotus built from deformed planes; scroll progress opens the petal rings one after another */
const cl = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const sm = t => t * t * (3 - 2 * t)

function usePetal(len, wid, tipCol, baseCol) {
  return useMemo(() => {
    const g = new THREE.PlaneGeometry(1, 1, 10, 18)
    const p = g.attributes.position, cols = []
    const a = new THREE.Color(baseCol), b = new THREE.Color(tipCol), c = new THREE.Color()
    for (let i = 0; i < p.count; i++) {
      const u = p.getX(i) * 2, v = p.getY(i) + 0.5 // u -1..1, v 0..1
      const w = Math.pow(Math.sin(Math.PI * Math.min(v * 1.08, 1)), 0.75) * (1 - Math.pow(v, 6) * 0.6)
      const x = u * w * wid * 0.5
      const y = v * len
      const z = -(u * u) * wid * 0.22 * w + Math.pow(v, 2.2) * len * 0.22 // cup + curl outward at tip
      p.setXYZ(i, x, y, z)
      c.copy(a).lerp(b, Math.pow(v, 1.6)); cols.push(c.r, c.g, c.b)
    }
    g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3))
    g.computeVertexNormals()
    return g
  }, [len, wid, tipCol, baseCol])
}

const RINGS = [
  { n: 6, len: 1.05, wid: 0.62, open: [0.12, 0.38], from: 0.08, to: 0.55, off: 0.5, tip: '#f39ab3', base: '#fff3f1' },
  { n: 8, len: 1.35, wid: 0.7, open: [0.3, 0.6], from: 0.12, to: 1.0, off: 0, tip: '#ec7d9d', base: '#fde7ea' },
  { n: 9, len: 1.5, wid: 0.72, open: [0.5, 0.85], from: 0.2, to: 1.35, off: 0.35, tip: '#e06b8f', base: '#fbe1e6' },
]

function Ring({ r, progress, idx }) {
  const geo = usePetal(r.len, r.wid, r.tip, r.base)
  const refs = useRef([])
  useFrame(st => {
    const p = progress.get()
    const k = sm(cl((p - r.open[0]) / (r.open[1] - r.open[0])))
    const t = st.clock.elapsedTime
    refs.current.forEach((m, i) => { if (m) m.rotation.x = r.from + (r.to - r.from) * k + Math.sin(t * 0.8 + i + idx) * 0.015 })
  })
  return (
    <group>
      {Array.from({ length: r.n }, (_, i) => (
        <group key={i} rotation-y={(i / r.n) * Math.PI * 2 + r.off}>
          <group position-z={0.12 + idx * 0.05}>
            <mesh ref={el => (refs.current[i] = el)} geometry={geo}>
              <meshStandardMaterial vertexColors side={THREE.DoubleSide} roughness={0.55} metalness={0} />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  )
}

function Pad({ pos, s, rot }) {
  return (
    <mesh position={pos} rotation={[-Math.PI / 2, 0, rot]} scale={s}>
      <circleGeometry args={[1, 40, 0.25, Math.PI * 2 - 0.5]} />
      <meshStandardMaterial color="#3f7d63" roughness={0.6} side={THREE.DoubleSide} />
    </mesh>
  )
}

function Lotus({ progress }) {
  const g = useRef(), pod = useRef()
  const { size } = useThree()
  const stamens = useMemo(() => Array.from({ length: 22 }, (_, i) => { const a = i * 2.399, r = 0.2 + (i % 3) * 0.04; return [Math.cos(a) * r, Math.sin(a) * r] }), [])
  useFrame((st) => {
    const p = progress.get(), mob = size.width < 768
    const t = st.clock.elapsedTime
    g.current.scale.setScalar(mob ? 0.62 : 1)
    g.current.position.set(mob ? 0 : 1.9, (mob ? -1.25 : -0.9) + Math.sin(t * 0.6) * 0.04, 0)
    g.current.rotation.y = t * 0.08 + p * 1.2 + st.pointer.x * 0.15
    g.current.rotation.x = THREE.MathUtils.lerp(g.current.rotation.x, 0.32 + p * 0.25 - st.pointer.y * 0.05, 0.05)
    pod.current.scale.setScalar(0.6 + sm(cl((p - 0.6) / 0.3)) * 0.5)
  })
  return (
    <group ref={g}>
      {RINGS.map((r, i) => <Ring key={i} r={r} idx={i} progress={progress} />)}
      <group ref={pod} position-y={0.2}>
        <mesh><cylinderGeometry args={[0.24, 0.17, 0.2, 32]} /><meshStandardMaterial color="#e7c552" roughness={0.5} /></mesh>
        {stamens.map(([x, z], i) => <mesh key={i} position={[x, 0.12, z]}><sphereGeometry args={[0.035, 10, 8]} /><meshStandardMaterial color="#f2d36b" roughness={0.4} /></mesh>)}
      </group>
      <Pad pos={[0, -0.02, 0]} s={1.9} rot={0.4} />
      <Pad pos={[-2.3, -0.06, 0.9]} s={1.0} rot={2.2} />
      <Pad pos={[1.9, -0.05, -1.4]} s={0.8} rot={4.1} />
      <ContactShadows position={[0, -0.08, 0]} opacity={0.25} scale={7} blur={2.8} far={2} resolution={256} color="#1f4747" />
    </group>
  )
}

export default function LotusScene({ progress, active }) {
  return (
    <Canvas frameloop={active ? 'always' : 'never'} dpr={[1, 1.6]} camera={{ position: [0, 2.4, 7.2], fov: 35 }} gl={{ antialias: true, alpha: true }} style={{ pointerEvents: 'none' }}
      onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
      eventSource={typeof document !== 'undefined' ? document.getElementById('root') : undefined} eventPrefix="client">
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 6, 3]} intensity={1.3} color="#fff4ea" />
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={2} position={[0, 5, 2]} scale={[8, 2, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={1.2} position={[-5, 1, 2]} rotation-y={Math.PI / 2} scale={[6, 2, 1]} color="#ffe1ea" />
        <Lightformer form="rect" intensity={1} position={[5, 1, -2]} rotation-y={-Math.PI / 2} scale={[6, 2, 1]} color="#d8f0ea" />
      </Environment>
      <Lotus progress={progress} />
    </Canvas>
  )
}
