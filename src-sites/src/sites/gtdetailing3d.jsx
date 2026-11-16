import React, { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'

const OR = '#ff6a00'
export const CURVE = new THREE.CatmullRomCurve3([
  [-5.2, 0, -.6], [-4, 0, -2.9], [-1, 0, -3.3], [2.2, 0, -3.1], [4.9, 0, -2.4], [5.6, 0, -.2],
  [4.4, 0, 1.5], [2, 0, 1.1], [.4, 0, 2.7], [-2.6, 0, 3.1], [-4.9, 0, 2],
].map(p => new THREE.Vector3(...p)), true, 'centripetal')

function Track() {
  const { geo, kerbs } = useMemo(() => {
    const N = 360, W = .62, pos = [], idx = [], up = new THREE.Vector3(0, 1, 0), kerbs = []
    for (let i = 0; i <= N; i++) {
      const u = i / N, p = CURVE.getPointAt(u % 1), t = CURVE.getTangentAt(u % 1)
      const s = new THREE.Vector3().crossVectors(t, up).normalize()
      pos.push(p.x + s.x * W, 0, p.z + s.z * W, p.x - s.x * W, 0, p.z - s.z * W)
      if (i < N) idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2)
      if (i < N && i % 2 === 0) for (const side of [1, -1]) kerbs.push({ x: p.x + s.x * (W + .07) * side, z: p.z + s.z * (W + .07) * side, ry: Math.atan2(t.x, t.z), c: (i / 2) % 2 })
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals()
    return { geo: g, kerbs }
  }, [])
  const kRef = useRef()
  const o = useMemo(() => new THREE.Object3D(), [])
  const colors = useMemo(() => { const a = new Float32Array(kerbs.length * 3); const w = new THREE.Color('#f4f4f2'), r = new THREE.Color(OR); kerbs.forEach((k, i) => (k.c ? r : w).toArray(a, i * 3)); return a }, [kerbs])
  const setRef = m => {
    if (!m || kRef.current) return
    kRef.current = m
    kerbs.forEach((k, i) => { o.position.set(k.x, .015, k.z); o.rotation.set(0, k.ry, 0); o.updateMatrix(); m.setMatrixAt(i, o.matrix) })
    m.instanceMatrix.needsUpdate = true
  }
  const start = CURVE.getPointAt(0), st = CURVE.getTangentAt(0)
  return (
    <group>
      <mesh geometry={geo} position-y={.005}><meshStandardMaterial color="#1d1d20" roughness={.85} metalness={.1} /></mesh>
      <instancedMesh ref={setRef} args={[null, null, kerbs.length]}>
        <boxGeometry args={[.12, .03, .1]} />
        <instancedBufferAttribute attach="instanceColor" args={[colors, 3]} />
        <meshStandardMaterial roughness={.5} />
      </instancedMesh>
      <group position={[start.x, .012, start.z]} rotation-y={Math.atan2(st.x, st.z)}>
        {Array.from({ length: 12 }).map((_, k) => <mesh key={k} position={[-.55 + (k % 6) * .22 + .11 * 0, 0, (k < 6 ? -.06 : .06)]} rotation-x={-Math.PI / 2}><planeGeometry args={[.11, .12]} /><meshBasicMaterial color={(k + (k < 6 ? 0 : 1)) % 2 ? '#111' : '#fff'} /></mesh>)}
      </group>
      <gridHelper args={[30, 30, '#2a2a2e', '#1a1a1d']} position-y={-.02} />
    </group>
  )
}

function Car({ progress, state }) {
  const g = useRef(), wheels = useRef([]), lines = useRef()
  const o = useMemo(() => new THREE.Object3D(), [])
  useFrame((st, dt) => {
    dt = Math.min(dt, .05)
    const target = Math.min(.9999, Math.max(0, progress ? progress.get() : 0))
    const prev = state.u
    state.u += (target - state.u) * Math.min(1, dt * 4)
    state.speed += ((Math.abs(state.u - prev) / Math.max(dt, .001)) - state.speed) * .2
    const u = state.u
    const p = CURVE.getPointAt(u), ahead = CURVE.getPointAt((u + .004) % 1)
    g.current.position.copy(p); g.current.lookAt(ahead)
    const t = CURVE.getTangentAt(u), t2 = CURVE.getTangentAt((u + .02) % 1)
    g.current.rotation.z = THREE.MathUtils.clamp((t.x * t2.z - t.z * t2.x) * 2.5, -.15, .15) * Math.min(1, state.speed * 8)
    wheels.current.forEach(w => w && (w.rotation.x += state.speed * dt * 900))
    const sp = Math.min(1, state.speed * 6)
    for (let i = 0; i < 14; i++) {
      const side = i % 2 ? 1 : -1
      o.position.set(side * (.32 + (i % 4) * .08), .08 + (i % 3) * .1, -.9 - (i % 5) * .25 - ((st.clock.elapsedTime * 3 + i * .37) % 1) * .6)
      o.scale.set(1, 1, sp * (1.2 + (i % 3)))
      o.updateMatrix(); lines.current.setMatrixAt(i, o.matrix)
    }
    lines.current.instanceMatrix.needsUpdate = true
    lines.current.material.opacity = sp * .7
    state.pos = p
  })
  return (
    <group ref={g}>
      <group scale={1.05}>
        <mesh position={[0, .13, 0]}><boxGeometry args={[.52, .14, 1.12]} /><meshStandardMaterial color="#f4f4f2" metalness={.3} roughness={.25} envMapIntensity={1.4} /></mesh>
        <mesh position={[0, .1, .66]} rotation-x={.18}><boxGeometry args={[.46, .09, .34]} /><meshStandardMaterial color="#f4f4f2" metalness={.3} roughness={.25} /></mesh>
        <mesh position={[0, .26, -.06]}><boxGeometry args={[.34, .13, .44]} /><meshStandardMaterial color="#0d0d0e" metalness={.6} roughness={.1} /></mesh>
        <mesh position={[0, .205, .02]}><boxGeometry args={[.13, .012, 1.14]} /><meshStandardMaterial color={OR} roughness={.4} /></mesh>
        <mesh position={[0, .17, .72]} rotation-x={.18}><boxGeometry args={[.13, .012, .3]} /><meshStandardMaterial color={OR} roughness={.4} /></mesh>
        <mesh position={[0, .04, .8]}><boxGeometry args={[.6, .02, .14]} /><meshStandardMaterial color="#111" /></mesh>
        <mesh position={[0, .38, -.58]}><boxGeometry args={[.62, .03, .14]} /><meshStandardMaterial color="#111" metalness={.4} roughness={.4} /></mesh>
        {[-.18, .18].map(x => <mesh key={x} position={[x, .29, -.55]}><boxGeometry args={[.02, .16, .06]} /><meshStandardMaterial color="#111" /></mesh>)}
        {[-.31, .31].map(x => <mesh key={x} position={[x, .38, -.58]}><boxGeometry args={[.02, .1, .18]} /><meshStandardMaterial color={OR} /></mesh>)}
        {[-.16, .16].map(x => <mesh key={x} position={[x, .13, .83]}><boxGeometry args={[.1, .03, .02]} /><meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={2} /></mesh>)}
        {[-.18, .18].map(x => <mesh key={x} position={[x, .15, -.565]}><boxGeometry args={[.1, .03, .02]} /><meshStandardMaterial color="#f00" emissive="#ff1a1a" emissiveIntensity={2} /></mesh>)}
        {[[-.28, .38], [.28, .38], [-.28, -.36], [.28, -.36]].map(([x, z], k) => (
          <group key={k} position={[x, .1, z]}>
            <mesh ref={el => (wheels.current[k] = el)} rotation-z={Math.PI / 2}><cylinderGeometry args={[.11, .11, .09, 14]} /><meshStandardMaterial color="#111" roughness={.7} /></mesh>
            <mesh position-x={x > 0 ? .046 : -.046} rotation-z={Math.PI / 2}><cylinderGeometry args={[.06, .06, .005, 6]} /><meshStandardMaterial color={OR} metalness={.7} roughness={.3} /></mesh>
          </group>
        ))}
      </group>
      <instancedMesh ref={lines} args={[null, null, 14]} frustumCulled={false}>
        <boxGeometry args={[.012, .012, .6]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0} depthWrite={false} />
      </instancedMesh>
    </group>
  )
}

function Rig() {
  const { camera, size } = useThree()
  const look = useMemo(() => new THREE.Vector3(0, 0, .6), [])
  useFrame((st, dt) => {
    const k = Math.min(1, dt * 2)
    camera.position.x += (st.pointer.x * 1.2 - camera.position.x) * k
    camera.position.y += (12 + st.pointer.y * .8 - camera.position.y) * k
    camera.position.z += (9.5 - camera.position.z) * k
    camera.lookAt(look)
  })
  return null
}
function Layout({ children }) {
  const g = useRef()
  const { size } = useThree()
  useFrame(() => {
    const mob = size.width < 768
    if (mob) { g.current.position.set(0, 0, -3.3); g.current.rotation.y = Math.PI / 2; g.current.scale.setScalar(.36) }
    else { g.current.position.set(size.width < 1100 ? 3 : 3.6, 0, -.9); g.current.rotation.y = 0; g.current.scale.setScalar(.74) }
  })
  return <group ref={g}>{children}</group>
}

export default function Scene({ progress }) {
  const state = useMemo(() => ({ u: 0, speed: 0, pos: null }), [])
  const src = typeof document !== 'undefined' ? document.getElementById('root') : undefined
  return (
    <Canvas dpr={[1, 1.6]} camera={{ position: [0, 12, 9.5], fov: 40 }} gl={{ antialias: true, alpha: true }} eventSource={src} eventPrefix="client" style={{ pointerEvents: 'none' }}>
      <ambientLight intensity={.35} />
      <directionalLight position={[4, 8, 3]} intensity={1.6} />
      <Layout>
        <Track />
        <Car progress={progress} state={state} />
      </Layout>
      <Rig />
      <Environment resolution={128}>
        <color attach="background" args={['#111']} />
        <Lightformer form="rect" intensity={4} position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[10, 4, 1]} />
        <Lightformer form="rect" intensity={2} position={[-6, 2, 0]} rotation-y={Math.PI / 2} scale={[8, 2, 1]} color="#ffb070" />
        <Lightformer form="rect" intensity={2} position={[6, 2, 0]} rotation-y={-Math.PI / 2} scale={[8, 2, 1]} />
      </Environment>
    </Canvas>
  )
}
