import React, { useRef, useMemo, useEffect } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, Sparkles } from '@react-three/drei'

/* faceted crystal shards orbit a central gem, drift towards the pointer, glitter all around */
function Shards({ count, geo, ptr, seed, scroll }) {
  const mesh = useRef()
  const { viewport, size } = useThree()
  const tmp = useMemo(() => new THREE.Object3D(), [])
  const data = useMemo(() => {
    let s = seed
    const r = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646 }
    return Array.from({ length: count }, () => ({
      rad: 1.9 + r() * 2.6, sp: (0.12 + r() * 0.25) * (r() > 0.5 ? 1 : -1), ph: r() * 6.28, tilt: (r() - 0.5) * 1.4, yo: (r() - 0.5) * 2.2,
      sc: 0.12 + r() ** 2 * 0.38, rs: 0.3 + r() * 1.2, ox: 0, oy: 0, oz: 0,
    }))
  }, [count, seed])
  useFrame((st, dt) => {
    dt = Math.min(dt, 0.05)
    const t = st.clock.elapsedTime, mob = size.width < 768
    const cx = mob ? 0 : 3.1, cy = mob ? 1.7 : 0.1, k = mob ? 0.62 : 1
    const px = ptr.current.x * viewport.width / 2, py = ptr.current.y * viewport.height / 2
    const sp = scroll ? scroll.get() : 0
    data.forEach((d, i) => {
      const a = t * d.sp + d.ph
      let x = cx + Math.cos(a) * d.rad * k * (1 + sp * 0.8), z = Math.sin(a) * d.rad * k
      let y = cy + d.yo * k + Math.sin(a) * d.tilt * k
      /* attraction to the pointer */
      const dx = px - (x + d.ox), dy = py - (y + d.oy), dist = Math.hypot(dx, dy)
      const pull = dist < 3.2 ? (1 - dist / 3.2) * 1.6 : 0
      d.ox += (dx * pull - d.ox) * Math.min(1, dt * 2.2)
      d.oy += (dy * pull - d.oy) * Math.min(1, dt * 2.2)
      d.oz += ((pull > 0 ? 1.2 * pull : 0) - d.oz) * Math.min(1, dt * 2)
      tmp.position.set(x + d.ox, y + d.oy, z + d.oz)
      tmp.rotation.set(t * d.rs + d.ph, t * d.rs * 0.7, d.ph)
      tmp.scale.setScalar(d.sc * k * (1 + pull * 0.4))
      tmp.updateMatrix()
      mesh.current.setMatrixAt(i, tmp.matrix)
    })
    mesh.current.instanceMatrix.needsUpdate = true
  })
  return (
    <instancedMesh ref={mesh} args={[null, null, count]}>
      {geo === 'ico' ? <icosahedronGeometry args={[1, 0]} /> : <octahedronGeometry args={[1, 0]} />}
      <CrystalMat />
    </instancedMesh>
  )
}
function CrystalMat({ color = '#eef5ff' }) {
  return <meshPhysicalMaterial color={color} flatShading metalness={0.25} roughness={0.04} clearcoat={1} clearcoatRoughness={0} iridescence={1} iridescenceIOR={1.6} iridescenceThicknessRange={[200, 1100]} envMapIntensity={2.6} />
}

function Gem({ ptr, scroll }) {
  const g = useRef()
  const { size } = useThree()
  useFrame((st, dt) => {
    const mob = size.width < 768
    const sp = scroll ? scroll.get() : 0
    g.current.position.set(mob ? 0 : 3.1, mob ? 1.7 : 0.1, 0)
    g.current.rotation.y += dt * 0.35
    g.current.rotation.x += (ptr.current.y * 0.5 - g.current.rotation.x) * 0.04
    g.current.rotation.z += (-ptr.current.x * 0.4 - g.current.rotation.z) * 0.04
    g.current.scale.setScalar((mob ? 0.8 : 1.25) * (1 - sp * 0.3))
  })
  return (
    <group ref={g}>
      <mesh scale={[1, 1.45, 1]}><octahedronGeometry args={[1, 0]} /><CrystalMat color="#f4f9ff" /></mesh>
      <mesh scale={[0.62, 0.9, 0.62]} rotation={[0, 0.78, 0]}><octahedronGeometry args={[1, 0]} /><meshPhysicalMaterial color="#9fc2ff" flatShading roughness={0.1} metalness={0.4} iridescence={1} envMapIntensity={2} transparent opacity={0.55} /></mesh>
    </group>
  )
}

export default function Scene({ scroll }) {
  const ptr = useRef({ x: 0.4, y: 0 })
  useEffect(() => {
    const m = e => { ptr.current.x = e.clientX / innerWidth * 2 - 1; ptr.current.y = -(e.clientY / innerHeight * 2 - 1) }
    addEventListener('pointermove', m); addEventListener('pointerdown', m)
    return () => { removeEventListener('pointermove', m); removeEventListener('pointerdown', m) }
  }, [])
  const mob = typeof window !== 'undefined' && innerWidth < 768
  return (
    <Canvas dpr={[1, 1.6]} camera={{ position: [0, 0, 9], fov: 42 }} gl={{ antialias: true, alpha: true }} style={{ pointerEvents: 'none' }}>
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 5, 4]} intensity={1.4} />
      <Gem ptr={ptr} scroll={scroll} />
      <Shards count={mob ? 12 : 22} geo="ico" ptr={ptr} seed={11} scroll={scroll} />
      <Shards count={mob ? 12 : 22} geo="oct" ptr={ptr} seed={97} scroll={scroll} />
      <Sparkles count={mob ? 50 : 110} scale={[14, 8, 5]} size={mob ? 3 : 4} speed={0.35} opacity={0.9} color="#ffffff" />
      <Sparkles count={mob ? 20 : 40} scale={[10, 6, 4]} size={6} speed={0.25} opacity={0.7} color="#8fd3ff" />
      <Environment resolution={256}>
        <color attach="background" args={['#1a2c5c']} />
        <Lightformer form="rect" intensity={5} position={[0, 5, -2]} scale={[12, 2, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={4} position={[-5, 1, 1]} rotation-y={Math.PI / 2} scale={[8, 2, 1]} color="#ff5fd2" />
        <Lightformer form="rect" intensity={4} position={[5, 1, 1]} rotation-y={-Math.PI / 2} scale={[8, 2, 1]} color="#3ff0ff" />
        <Lightformer form="rect" intensity={3} position={[0, -4, 2]} rotation-x={-Math.PI / 2} scale={[10, 2, 1]} color="#ffe14f" />
        <Lightformer form="ring" intensity={5} position={[2, 2, 5]} scale={2} color="#ffffff" />
      </Environment>
    </Canvas>
  )
}
