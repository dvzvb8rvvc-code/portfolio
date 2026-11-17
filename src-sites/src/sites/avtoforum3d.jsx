import React, { useMemo, useRef, useLayoutEffect } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, ContactShadows } from '@react-three/drei'

/* the season as a product: a tyre whose tread morphs summer -> winter while it rolls */
const cl = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const sm = (a, b, x) => { const t = cl((x - a) / (b - a)); return t * t * (3 - 2 * t) }
const R0 = 0.975 // tread base radius
const AMBER = new THREE.Color('#ff8a1f'), ICE = new THREE.Color('#3b9cff')
const dummy = new THREE.Object3D()

function Carcass() {
  const geo = useMemo(() => {
    const P = [[0.6, -0.33], [0.67, -0.375], [0.8, -0.395], [0.92, -0.38], [0.97, -0.33], [0.98, -0.22], [0.98, 0.22], [0.97, 0.33], [0.92, 0.38], [0.8, 0.395], [0.67, 0.375], [0.6, 0.33]]
    const pts = new THREE.SplineCurve(P.map(([r, y]) => new THREE.Vector2(r, y))).getPoints(48)
    const g = new THREE.LatheGeometry(pts, 96)
    g.rotateX(Math.PI / 2)
    return g
  }, [])
  return <mesh geometry={geo}><meshStandardMaterial color="#1c1c1f" roughness={0.82} metalness={0} side={THREE.DoubleSide} /></mesh>
}

/* build an instanced set of tread blocks; each block knows its angle for the sweeping morph */
function useBlocks(kind) {
  return useMemo(() => {
    const L = []
    if (kind === 'summer') {
      const rows = [[-0.255, 0.1], [-0.095, 0.12], [0.095, 0.12], [0.255, 0.1]]
      const N = 72
      rows.forEach(([z, w], ri) => { for (let i = 0; i < N; i++) L.push({ th: (i / N) * Math.PI * 2 + (ri % 2) * 0.02, z, w, l: (2 * Math.PI * R0 / N) * (ri === 0 || ri === 3 ? 0.62 : 0.9), d: 0.045, yaw: ri === 0 || ri === 3 ? 0.5 * (ri ? -1 : 1) : 0 }) })
    } else if (kind === 'winter') {
      const rows = [[-0.25, 0.12], [-0.085, 0.13], [0.085, 0.13], [0.25, 0.12]]
      const N = 34
      rows.forEach(([z, w], ri) => { for (let i = 0; i < N; i++) L.push({ th: ((i + (ri % 2) * 0.5) / N) * Math.PI * 2, z, w, l: (2 * Math.PI * R0 / N) * 0.7, d: 0.07, yaw: (z < 0 ? 1 : -1) * 0.38 }) })
    } else {
      const N = 34
      ;[-0.25, 0.25].forEach((z, ri) => { for (let i = 0; i < N; i += 2) L.push({ th: ((i + (ri % 2) * 0.5) / N) * Math.PI * 2, z, w: 1, l: 1, d: 0.082, yaw: 0 }) })
    }
    return L
  }, [kind])
}

function Tread({ kind, progress, geo, children }) {
  const ref = useRef(), last = useRef(-1)
  const L = useBlocks(kind)
  useLayoutEffect(() => { last.current = -1 }, [])
  useFrame(() => {
    const p = progress.get()
    if (Math.abs(p - last.current) < 0.0004) return
    last.current = p
    for (let i = 0; i < L.length; i++) {
      const b = L[i]
      const a = 0.22 + (b.th / (Math.PI * 2)) * 0.22
      const m = sm(a, a + 0.2, p)
      const s = Math.max(0.002, kind === 'summer' ? 1 - m : m)
      const h = b.d * s
      dummy.position.set(Math.cos(b.th) * (R0 + h / 2 - 0.01), Math.sin(b.th) * (R0 + h / 2 - 0.01), b.z)
      dummy.rotation.set(0, 0, b.th - Math.PI / 2)
      dummy.rotateY(b.yaw)
      dummy.scale.set(kind === 'stud' ? 1 : b.l, h, kind === 'stud' ? 1 : b.w * (0.6 + 0.4 * s))
      dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
    }
    ref.current.instanceMatrix.needsUpdate = true
  })
  return <instancedMesh ref={ref} args={[geo, undefined, L.length]} frustumCulled={false}>{children}</instancedMesh>
}

function Rim() {
  const spokes = useMemo(() => Array.from({ length: 5 }, (_, i) => (i / 5) * Math.PI * 2), [])
  return (
    <group>
      <mesh rotation-x={Math.PI / 2}><cylinderGeometry args={[0.6, 0.6, 0.62, 48, 1, true]} /><meshStandardMaterial color="#8d9097" metalness={1} roughness={0.38} side={THREE.DoubleSide} /></mesh>
      <mesh position-z={0.3}><torusGeometry args={[0.6, 0.026, 12, 72]} /><meshStandardMaterial color="#e7e9ec" metalness={1} roughness={0.18} /></mesh>
      <mesh position-z={-0.3}><torusGeometry args={[0.6, 0.02, 10, 72]} /><meshStandardMaterial color="#bfc2c7" metalness={1} roughness={0.3} /></mesh>
      <mesh position-z={0.12}><cylinderGeometry args={[0.3, 0.3, 0.05, 40]} /><meshStandardMaterial color="#3b3d42" metalness={0.9} roughness={0.45} /></mesh>
      {spokes.map(a => (
        <group key={a} rotation-z={a}>
          <mesh position={[0, 0.36, 0.22]} rotation-x={-0.22}><boxGeometry args={[0.11, 0.5, 0.06]} /><meshStandardMaterial color="#dfe2e6" metalness={1} roughness={0.2} /></mesh>
        </group>
      ))}
      <mesh position-z={0.25} rotation-x={Math.PI / 2}><cylinderGeometry args={[0.13, 0.15, 0.1, 32]} /><meshStandardMaterial color="#d9dce0" metalness={1} roughness={0.22} /></mesh>
      <mesh position-z={0.305} rotation-x={Math.PI / 2}><cylinderGeometry args={[0.07, 0.07, 0.02, 32]} /><meshStandardMaterial color="#1d1d1f" metalness={0.4} roughness={0.4} /></mesh>
    </group>
  )
}

function SeasonRing({ progress }) {
  const m1 = useRef(), m2 = useRef()
  useFrame(() => { const p = progress.get(); const k = sm(0.3, 0.62, p); m1.current.color.copy(AMBER).lerp(ICE, k); m2.current.color.copy(m1.current.color) })
  return (<>
    <mesh position-z={0.398}><torusGeometry args={[0.79, 0.006, 8, 120]} /><meshBasicMaterial ref={m1} toneMapped={false} /></mesh>
    <mesh position-z={-0.398}><torusGeometry args={[0.79, 0.006, 8, 120]} /><meshBasicMaterial ref={m2} toneMapped={false} /></mesh>
  </>)
}

function Tyre({ progress }) {
  const yawG = useRef(), spinG = useRef(), wrap = useRef()
  const { size } = useThree()
  const box = useMemo(() => new THREE.BoxGeometry(1, 1, 1), [])
  const stud = useMemo(() => new THREE.CylinderGeometry(0.014, 0.014, 1, 10), [])
  useFrame((st, dt) => {
    const p = progress.get(), mob = size.width < 768
    const yaw = THREE.MathUtils.lerp(0.35, -1.05, sm(0.02, 0.3, p)) + THREE.MathUtils.lerp(0, -0.35, sm(0.4, 0.7, p)) + THREE.MathUtils.lerp(0, 0.9, sm(0.82, 1, p))
    yawG.current.rotation.y = yaw + st.pointer.x * 0.12
    yawG.current.rotation.x = 0.12 + st.pointer.y * -0.06
    spinG.current.rotation.z = -p * Math.PI * 3 - st.clock.elapsedTime * 0.08
    wrap.current.scale.setScalar(mob ? 0.5 : 0.82)
    wrap.current.position.y = mob ? 0.3 : 0.18
  })
  return (
    <group ref={wrap}>
      <group ref={yawG}>
        <group ref={spinG}>
          <Carcass />
          <Tread kind="summer" progress={progress} geo={box}><meshStandardMaterial color="#202024" roughness={0.75} /></Tread>
          <Tread kind="winter" progress={progress} geo={box}><meshStandardMaterial color="#202024" roughness={0.8} /></Tread>
          <Tread kind="stud" progress={progress} geo={stud}><meshStandardMaterial color="#cfd3d8" metalness={1} roughness={0.25} /></Tread>
          <SeasonRing progress={progress} />
          <Rim />
        </group>
      </group>
      <ContactShadows position={[0, -1.08, 0]} opacity={0.3} scale={5} blur={2.6} far={1.6} resolution={256} />
    </group>
  )
}

export default function TyreScene({ progress, active }) {
  return (
    <Canvas frameloop={active ? 'always' : 'never'} dpr={[1, 1.6]} camera={{ position: [0, 0.15, 4.2], fov: 32 }} gl={{ antialias: true, alpha: true }} style={{ pointerEvents: 'none' }}
      eventSource={typeof document !== 'undefined' ? document.getElementById('root') : undefined} eventPrefix="client">
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 4, 5]} intensity={1.2} />
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={3} position={[0, 4, 3]} scale={[8, 2, 1]} />
        <Lightformer form="rect" intensity={1.6} position={[-5, 1, 2]} rotation-y={Math.PI / 2} scale={[6, 3, 1]} />
        <Lightformer form="rect" intensity={1.2} position={[5, 0, 1]} rotation-y={-Math.PI / 2} scale={[6, 2, 1]} />
        <Lightformer form="ring" intensity={0.8} position={[0, 0, -5]} scale={4} />
      </Environment>
      <Tyre progress={progress} />
    </Canvas>
  )
}
