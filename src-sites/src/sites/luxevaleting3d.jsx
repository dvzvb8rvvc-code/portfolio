import React, { useRef, useMemo, useEffect } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, Line } from '@react-three/drei'

/* dark showroom · sleek black car from primitives · torch follows the pointer · silk cover */
const GOLD = '#d4b483'
const PROFILE = [[-2.2, 0.36], [-2.24, 0.62], [-2.12, 0.84], [-1.2, 0.93], [-0.72, 1.3], [-0.2, 1.4], [0.35, 1.38], [0.95, 1.22], [1.32, 0.96], [2.0, 0.82], [2.26, 0.7], [2.26, 0.46], [2.2, 0.36]]
const topY = x => {
  if (x <= PROFILE[0][0]) return 0.36
  for (let i = 1; i < 11; i++) { const a = PROFILE[i], b = PROFILE[i + 1]; if (x >= a[0] && x <= b[0]) return a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0] || 1) }
  return x < 0 ? 0.8 : 0.7
}

function useBodyGeo() {
  return useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(-2.2, 0.3)
    s.lineTo(-2.24, 0.62); s.quadraticCurveTo(-2.24, 0.86, -2.0, 0.88)
    s.lineTo(-1.2, 0.93); s.quadraticCurveTo(-0.85, 1.28, -0.2, 1.38)
    s.lineTo(0.35, 1.37); s.quadraticCurveTo(0.85, 1.3, 1.32, 0.96)
    s.lineTo(2.0, 0.84); s.quadraticCurveTo(2.3, 0.78, 2.28, 0.5)
    s.lineTo(2.2, 0.3)
    s.lineTo(1.78, 0.3); s.absarc(1.38, 0.38, 0.44, 0, Math.PI, false)
    s.lineTo(-0.98, 0.3); s.absarc(-1.38, 0.38, 0.44, 0, Math.PI, false)
    s.lineTo(-2.2, 0.3)
    const g = new THREE.ExtrudeGeometry(s, { depth: 1.5, bevelEnabled: true, bevelThickness: 0.2, bevelSize: 0.12, bevelSegments: 5, curveSegments: 28 })
    g.translate(0, 0, -0.75)
    return g
  }, [])
}
function useGlassGeo() {
  return useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(-1.08, 0.98); s.quadraticCurveTo(-0.78, 1.24, -0.22, 1.3); s.lineTo(0.32, 1.29); s.quadraticCurveTo(0.78, 1.22, 1.14, 0.99); s.lineTo(-1.08, 0.98)
    const g = new THREE.ExtrudeGeometry(s, { depth: 1.86, bevelEnabled: false, curveSegments: 20 })
    g.translate(0, 0, -0.93)
    return g
  }, [])
}

function Wheel({ x, z }) {
  return (
    <group position={[x, 0.38, z]} rotation={[Math.PI / 2, 0, 0]}>
      <mesh><cylinderGeometry args={[0.38, 0.38, 0.3, 40]} /><meshStandardMaterial color="#070707" roughness={0.75} /></mesh>
      <mesh position={[0, z > 0 ? 0.152 : -0.152, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.25, 0.035, 10, 40]} /><meshStandardMaterial color={GOLD} metalness={1} roughness={0.22} /></mesh>
      {[0, 1, 2, 3, 4].map(k => <mesh key={k} position={[0, z > 0 ? 0.15 : -0.15, 0]} rotation={[0, k * 1.2566, 0]}><boxGeometry args={[0.04, 0.02, 0.46]} /><meshStandardMaterial color="#222" metalness={1} roughness={0.25} /></mesh>)}
    </group>
  )
}

function Car({ revealRef }) {
  const body = useBodyGeo(), glass = useGlassGeo()
  const lines = useMemo(() => {
    const belt = [[-2.15, 0.86], [-1.2, 0.95], [0, 0.97], [1.3, 0.97], [2.05, 0.84]]
    const roof = [[-1.15, 0.98], [-0.78, 1.26], [-0.2, 1.36], [0.35, 1.35], [0.82, 1.27], [1.2, 1.0]]
    const sill = [[-0.92, 0.36], [0.92, 0.36]]
    const out = []
    for (const z of [0.95, -0.95]) out.push(belt.map(([x, y]) => [x, y - 0.02, z]), sill.map(([x, y]) => [x, y + 0.02, z * 0.98]))
    out.push(roof.map(([x, y]) => [x, y + 0.02, 0]))
    return out
  }, [])
  const mats = useRef([])
  useFrame(() => { const r = revealRef.current; mats.current.forEach(m => m && (m.opacity = 0.25 + r * 0.75)) })
  return (
    <group>
      <mesh geometry={body} castShadow><meshPhysicalMaterial color="#121212" metalness={0.6} roughness={0.22} clearcoat={1} clearcoatRoughness={0.04} envMapIntensity={1.4} /></mesh>
      <mesh geometry={glass}><meshPhysicalMaterial color="#020202" metalness={0.9} roughness={0.05} envMapIntensity={2} /></mesh>
      <mesh position={[2.36, 0.68, 0]}><boxGeometry args={[0.04, 0.05, 1.3]} /><meshStandardMaterial color="#fff6e4" emissive="#fff3dd" emissiveIntensity={2.2} /></mesh>
      <mesh position={[-2.33, 0.78, 0]}><boxGeometry args={[0.04, 0.04, 1.4]} /><meshStandardMaterial color="#5a0b0b" emissive="#c0141a" emissiveIntensity={1.6} /></mesh>
      {lines.map((p, k) => <Line key={k} points={p} color={GOLD} lineWidth={1.4} transparent ref={el => { if (el) mats.current[k] = el.material }} />)}
      <Wheel x={1.38} z={0.86} /><Wheel x={-1.38} z={0.86} /><Wheel x={1.38} z={-0.86} /><Wheel x={-1.38} z={-0.86} />
    </group>
  )
}

/* silk cover: a draped cloth that whips off as `revealRef` goes 0 → 1 */
function Silk({ revealRef }) {
  const mesh = useRef(), mat = useRef()
  const { geo, base } = useMemo(() => {
    const g = new THREE.PlaneGeometry(6.2, 3.6, 64, 36)
    g.rotateX(-Math.PI / 2)
    const p = g.attributes.position, base = new Float32Array(p.count * 3)
    for (let i = 0; i < p.count; i++) {
      const u = p.getX(i), v = p.getZ(i)
      const xc = Math.max(-2.32, Math.min(2.38, u))
      const top = topY(xc) + 0.06
      let x = u, y, z = v
      const s = Math.abs(v), sg = Math.sign(v) || 1
      if (s < 0.98) y = top * (1 - Math.pow(s / 0.98, 4) * 0.12)
      else { const d = s - 0.98; y = top * 0.88 - d * 1.9; z = sg * (0.98 + Math.min(d, 0.1) + d * 0.08); if (y < 0.02) { z += sg * (0.02 - y) * 0.6; y = 0.02 } }
      const e = Math.abs(u) - 2.36
      if (e > 0) { y = Math.max(0.02, y - e * 1.6); x = Math.sign(u) * (2.36 + Math.min(e, 0.12) + e * 0.12) }
      y += Math.sin(u * 6.5 + v * 2.3) * 0.012 + Math.sin(u * 2.1 - v * 5) * 0.01
      base[i * 3] = x; base[i * 3 + 1] = y; base[i * 3 + 2] = z
      p.setXYZ(i, x, y, z)
    }
    g.computeVertexNormals()
    return { geo: g, base }
  }, [])
  useFrame(st => {
    const r = revealRef.current, t = st.clock.elapsedTime
    mesh.current.visible = r < 0.995
    if (!mesh.current.visible) return
    const p = geo.attributes.position, e = r * r * (3 - 2 * r)
    for (let i = 0; i < p.count; i++) {
      const bx = base[i * 3], by = base[i * 3 + 1], bz = base[i * 3 + 2]
      const lead = 0.45 + 0.55 * (1 - (bx + 3.1) / 6.2)
      const k = Math.min(1, e * (0.8 + lead * 0.6))
      const fl = Math.sin(t * 7 + bx * 1.8 + bz * 2) * 0.22 * Math.sin(k * Math.PI)
      p.setXYZ(i, bx - k * k * 8.5 - k * 0.8, by + Math.sin(k * Math.PI) * 1.4 * lead + k * 1.2 + fl, bz * (1 - k * 0.35) + Math.sin(t * 5 + bx) * 0.05 * k)
    }
    p.needsUpdate = true
    geo.computeVertexNormals()
    mat.current.opacity = 1 - Math.max(0, (e - 0.7) / 0.3)
  })
  return <mesh ref={mesh} geometry={geo}><meshPhysicalMaterial ref={mat} color="#b9a888" sheen={1} sheenColor="#f3dfb4" sheenRoughness={0.4} roughness={0.55} metalness={0.05} side={THREE.DoubleSide} transparent /></mesh>
}

function Torch({ ptr }) {
  const light = useRef(), target = useRef(), halo = useRef()
  const { viewport, size } = useThree()
  useEffect(() => { light.current.target = target.current }, [])
  useFrame((st, dt) => {
    const mob = size.width < 768
    const tx = ptr.current.x * (mob ? 2.4 : 4.2), tz = -ptr.current.y * 1.8 + 0.4
    target.current.position.x += (tx - target.current.position.x) * Math.min(1, dt * 5)
    target.current.position.z += (tz - target.current.position.z) * Math.min(1, dt * 5)
    target.current.position.y = 0.6
    light.current.position.set(target.current.position.x * 0.6 + 1.2, 5.8, target.current.position.z + 3.4)
    halo.current.position.set(target.current.position.x, 0.005, target.current.position.z)
  })
  return (
    <>
      <spotLight ref={light} angle={0.42} penumbra={0.75} intensity={100} decay={1.5} distance={20} color="#fff1d9" castShadow={false} />
      <object3D ref={target} />
      <mesh ref={halo} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[2.2, 48]} /><meshBasicMaterial color="#f5deb0" transparent opacity={0.03} depthWrite={false} /></mesh>
    </>
  )
}

function Rig({ scroll, children }) {
  const g = useRef()
  const { size, camera } = useThree()
  useFrame((st, dt) => {
    const mob = size.width < 768
    const p = scroll.get()
    /* dolly zoom: camera pulls back while the lens narrows */
    const dist = (mob ? 11.5 : 8.4) + p * 5
    const fov = 2 * Math.atan((mob ? 3.8 : 2.9) / dist) * 180 / Math.PI
    camera.fov += (fov - camera.fov) * Math.min(1, dt * 4)
    camera.position.set(Math.sin(st.clock.elapsedTime * 0.08) * 0.6, (mob ? 2.4 : 1.9) + p * 0.6, dist)
    camera.lookAt(mob ? 0 : 0.3, mob ? 1.75 : 1.15, 0)
    camera.updateProjectionMatrix()
    g.current.rotation.y = -0.55 + Math.sin(st.clock.elapsedTime * 0.15) * 0.08 + p * 0.5
    g.current.position.x = mob ? 0 : 1.6
    g.current.scale.setScalar(mob ? 0.62 : 1)
  })
  return <group ref={g}>{children}</group>
}

export default function Scene({ revealRef, scroll }) {
  const ptr = useRef({ x: 0.3, y: 0 })
  useEffect(() => {
    const m = e => { ptr.current.x = e.clientX / innerWidth * 2 - 1; ptr.current.y = -(e.clientY / innerHeight * 2 - 1) }
    addEventListener('pointermove', m); addEventListener('pointerdown', m)
    return () => { removeEventListener('pointermove', m); removeEventListener('pointerdown', m) }
  }, [])
  return (
    <Canvas dpr={[1, 1.6]} camera={{ position: [0, 2, 9], fov: 26 }} gl={{ antialias: true, alpha: false }} style={{ pointerEvents: 'none' }}>
      <color attach="background" args={['#050505']} />
      <fog attach="fog" args={['#050505', 10, 22]} />
      <ambientLight intensity={0.06} />
      <Torch ptr={ptr} />
      <Rig scroll={scroll}>
        <Car revealRef={revealRef} />
        <Silk revealRef={revealRef} />
      </Rig>
      <mesh rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[60, 60]} /><meshStandardMaterial color="#0b0b0b" roughness={0.32} metalness={0.7} /></mesh>
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={1.6} position={[0, 5, 0]} rotation-x={Math.PI / 2} scale={[9, 0.35, 1]} color={GOLD} />
        <Lightformer form="rect" intensity={1.2} position={[0, 5, 1.5]} rotation-x={Math.PI / 2} scale={[9, 0.2, 1]} color="#fff4e0" />
        <Lightformer form="rect" intensity={0.9} position={[-6, 1.5, 0]} rotation-y={Math.PI / 2} scale={[10, 0.25, 1]} color={GOLD} />
        <Lightformer form="rect" intensity={0.6} position={[6, 1.2, 0]} rotation-y={-Math.PI / 2} scale={[10, 0.2, 1]} color="#ffffff" />
      </Environment>
    </Canvas>
  )
}
