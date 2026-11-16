import React, { useRef, useMemo, useLayoutEffect } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'

/* low-poly Leeds-ish landscape, winding road, valeting van follows the scroll */
const CREAM = '#efe6d2', GREEN = '#0f3b2e', OR = '#ff6a1a'
const roadX = z => 6 * Math.sin(z * 0.045) + 3 * Math.sin(z * 0.11 + 1)
const Z0 = 12, Z1 = -170
const hill = (x, z) => 2.2 * Math.sin(x * 0.09 + z * 0.03) + 1.6 * Math.sin(z * 0.07 - x * 0.05) + 0.8 * Math.sin(x * 0.21 + z * 0.17)
const smooth = (a, b, v) => { const t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t) }
const height = (x, z) => {
  const d = Math.abs(x - roadX(z))
  return (hill(x, z) + 2.4) * smooth(3, 13, d) + Math.min(d, 40) * 0.06 * smooth(3, 13, d) - 0.08
}
let seed = 7
const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646 }

function Terrain() {
  const geo = useMemo(() => {
    let g = new THREE.PlaneGeometry(140, 200, 70, 100)
    g.rotateX(-Math.PI / 2)
    g.translate(0, 0, -80)
    const p = g.attributes.position
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); p.setY(i, height(x, z)) }
    g = g.toNonIndexed()
    const pos = g.attributes.position, cols = new Float32Array(pos.count * 3)
    const pal = ['#2f6b45', '#3b7d50', '#26583a', '#4a8a57', '#d8cfae', '#5b9661'].map(c => new THREE.Color(c))
    for (let i = 0; i < pos.count; i += 3) {
      const h = (pos.getY(i) + pos.getY(i + 1) + pos.getY(i + 2)) / 3
      const r = rnd()
      const c = h < 0.15 ? pal[4] : pal[Math.floor((h * 0.6 + r * 2.4) % 4) + (r > 0.93 ? 2 : 0)] || pal[1]
      for (let k = 0; k < 3; k++) { cols[(i + k) * 3] = c.r; cols[(i + k) * 3 + 1] = c.g; cols[(i + k) * 3 + 2] = c.b }
    }
    g.setAttribute('color', new THREE.BufferAttribute(cols, 3))
    g.computeVertexNormals()
    return g
  }, [])
  return <mesh geometry={geo}><meshStandardMaterial vertexColors flatShading roughness={0.95} /></mesh>
}

function Road({ curve }) {
  const geo = useMemo(() => {
    const N = 420, W = 1.7, pos = [], idx = []
    for (let i = 0; i <= N; i++) {
      const t = i / N, p = curve.getPointAt(t), tg = curve.getTangentAt(t)
      const nx = -tg.z, nz = tg.x, l = Math.hypot(nx, nz)
      pos.push(p.x + nx / l * W, 0.02, p.z + nz / l * W, p.x - nx / l * W, 0.02, p.z - nz / l * W)
      if (i < N) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2) }
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals()
    return g
  }, [curve])
  const dashes = useRef()
  useLayoutEffect(() => {
    const o = new THREE.Object3D(), n = 150
    for (let i = 0; i < n; i++) {
      const t = i / n, p = curve.getPointAt(t), tg = curve.getTangentAt(t)
      o.position.set(p.x, 0.04, p.z); o.rotation.set(-Math.PI / 2, 0, Math.atan2(tg.x, tg.z)); o.updateMatrix()
      dashes.current.setMatrixAt(i, o.matrix)
    }
    dashes.current.instanceMatrix.needsUpdate = true
  }, [curve])
  return (
    <group>
      <mesh geometry={geo}><meshStandardMaterial color="#2c3430" roughness={0.9} side={THREE.DoubleSide} /></mesh>
      <instancedMesh ref={dashes} args={[null, null, 150]}><planeGeometry args={[0.14, 0.55]} /><meshBasicMaterial color={CREAM} /></instancedMesh>
    </group>
  )
}

/* trees + back-to-back terraces + a little city skyline at the end */
function Scatter() {
  const trees = useRef(), trunks = useRef(), houses = useRef(), roofs = useRef(), towers = useRef()
  const data = useMemo(() => {
    seed = 42
    const T = [], H = [], S = []
    while (T.length < 260) {
      const z = Z0 - rnd() * (Z0 - Z1 + 10), x = (rnd() - 0.5) * 120
      if (Math.abs(x - roadX(z)) < 4.5) continue
      T.push([x, height(x, z), z, 0.6 + rnd() * 0.9])
    }
    for (let z = -10; z > -130; z -= 2.2) {
      if (Math.sin(z * 0.09) < 0.15) continue
      for (const side of [-1, 1]) {
        const x = roadX(z) + side * (5.5 + (rnd() > 0.5 ? 0 : 3))
        H.push([x, height(x, z), z, side])
      }
    }
    for (let i = 0; i < 22; i++) {
      const z = -150 - rnd() * 18, x = roadX(z) + (rnd() - 0.5) * 26
      if (Math.abs(x - roadX(z)) < 3) continue
      S.push([x, height(x, z), z, 3 + rnd() * 9, 1.4 + rnd() * 1.6])
    }
    return { T, H, S }
  }, [])
  useLayoutEffect(() => {
    const o = new THREE.Object3D(), c = new THREE.Color()
    data.T.forEach(([x, y, z, s], i) => {
      o.position.set(x, y + 1.1 * s, z); o.scale.set(s, s, s); o.rotation.set(0, i, 0); o.updateMatrix(); trees.current.setMatrixAt(i, o.matrix)
      trees.current.setColorAt(i, c.set(['#1f4d33', '#2a5e3d', '#173f2a', '#3a6f42'][i % 4]))
      o.position.set(x, y + 0.3 * s, z); o.updateMatrix(); trunks.current.setMatrixAt(i, o.matrix)
    })
    data.H.forEach(([x, y, z, side], i) => {
      o.rotation.set(0, 0, 0); o.scale.set(1, 1, 1)
      o.position.set(x, y + 0.6, z); o.updateMatrix(); houses.current.setMatrixAt(i, o.matrix)
      houses.current.setColorAt(i, c.set(['#9c4a32', '#a85a3c', '#8a3f2b', '#b4694a'][i % 4]))
      o.position.set(x, y + 1.2 + 0.35, z); o.rotation.set(0, 0, Math.PI / 2); o.scale.set(1, 1, 1); o.updateMatrix(); roofs.current.setMatrixAt(i, o.matrix)
    })
    data.S.forEach(([x, y, z, h, w], i) => {
      o.rotation.set(0, i * 0.3, 0); o.position.set(x, y + h / 2, z); o.scale.set(w, h, w); o.updateMatrix(); towers.current.setMatrixAt(i, o.matrix)
      towers.current.setColorAt(i, c.set(['#e9dfc7', '#d6ccb1', '#c7bea4', '#f3ecdc'][i % 4]))
    })
    ;[trees, trunks, houses, roofs, towers].forEach(r => { r.current.instanceMatrix.needsUpdate = true; if (r.current.instanceColor) r.current.instanceColor.needsUpdate = true })
  }, [data])
  return (
    <group>
      <instancedMesh ref={trees} args={[null, null, data.T.length]}><coneGeometry args={[0.7, 1.9, 5]} /><meshStandardMaterial flatShading roughness={0.9} /></instancedMesh>
      <instancedMesh ref={trunks} args={[null, null, data.T.length]}><cylinderGeometry args={[0.1, 0.12, 0.6, 5]} /><meshStandardMaterial color="#5a3d2b" flatShading /></instancedMesh>
      <instancedMesh ref={houses} args={[null, null, data.H.length]}><boxGeometry args={[1.6, 1.2, 2]} /><meshStandardMaterial flatShading roughness={0.85} /></instancedMesh>
      <instancedMesh ref={roofs} args={[null, null, data.H.length]}><cylinderGeometry args={[0.62, 0.62, 2.02, 3]} /><meshStandardMaterial color="#3b3f45" flatShading /></instancedMesh>
      <instancedMesh ref={towers} args={[null, null, data.S.length]}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial flatShading roughness={0.7} /></instancedMesh>
      {/* a stylised clock tower on the horizon */}
      <group position={[roadX(-158) + 7, height(roadX(-158) + 7, -158), -158]}>
        <mesh position={[0, 2, 0]}><boxGeometry args={[4, 4, 3]} /><meshStandardMaterial color="#e2d6b8" flatShading /></mesh>
        <mesh position={[0, 6.5, 0]}><boxGeometry args={[1.4, 5, 1.4]} /><meshStandardMaterial color="#e9dfc7" flatShading /></mesh>
        <mesh position={[0, 9.8, 0]}><coneGeometry args={[1.05, 1.8, 4]} /><meshStandardMaterial color={GREEN} flatShading /></mesh>
        <mesh position={[0, 7.6, 0.71]}><circleGeometry args={[0.45, 16]} /><meshBasicMaterial color={OR} /></mesh>
      </group>
    </group>
  )
}

function Van({ vref }) {
  const wheels = useRef([])
  useFrame((_, dt) => wheels.current.forEach(w => w && (w.rotation.x -= dt * 6)))
  const W = (x, z, k) => (
    <mesh key={k} ref={el => (wheels.current[k] = el)} position={[x, 0.22, z]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.22, 0.22, 0.18, 10]} /><meshStandardMaterial color="#1b1d1c" flatShading />
    </mesh>
  )
  return (
    <group ref={vref} scale={0.75}>
      <mesh position={[0, 0.78, -0.25]}><boxGeometry args={[1.25, 1.05, 2.3]} /><meshStandardMaterial color="#f6f0e2" flatShading roughness={0.4} /></mesh>
      <mesh position={[0, 0.6, 1.2]}><boxGeometry args={[1.22, 0.7, 0.75]} /><meshStandardMaterial color="#f6f0e2" flatShading roughness={0.4} /></mesh>
      <mesh position={[0, 1.02, 1.05]} rotation={[-0.6, 0, 0]}><boxGeometry args={[1.12, 0.5, 0.06]} /><meshStandardMaterial color="#20302a" roughness={0.1} metalness={0.4} /></mesh>
      <mesh position={[0, 0.7, -0.25]}><boxGeometry args={[1.27, 0.18, 2.32]} /><meshStandardMaterial color={OR} flatShading /></mesh>
      <mesh position={[0, 0.98, -0.25]}><boxGeometry args={[1.27, 0.06, 2.32]} /><meshStandardMaterial color={GREEN} /></mesh>
      <mesh position={[0, 1.36, 0.2]}><boxGeometry args={[0.5, 0.1, 0.18]} /><meshStandardMaterial color={OR} emissive={OR} emissiveIntensity={0.8} /></mesh>
      {W(0.6, 0.95, 0)}{W(-0.6, 0.95, 1)}{W(0.6, -0.95, 2)}{W(-0.6, -0.95, 3)}
    </group>
  )
}

function Rig({ progress, curve }) {
  const van = useRef(), smoothT = useRef(0.01)
  const { size, camera } = useThree()
  const tmp = useMemo(() => ({ look: new THREE.Vector3(), cam: new THREE.Vector3(), side: new THREE.Vector3() }), [])
  useFrame((st, dt) => {
    const target = 0.015 + Math.min(1, Math.max(0, progress.get())) * 0.86
    smoothT.current += (target - smoothT.current) * Math.min(1, dt * 3)
    const t = smoothT.current + Math.sin(st.clock.elapsedTime * 0.5) * 0.0004
    const p = curve.getPointAt(t), tg = curve.getTangentAt(t)
    van.current.position.set(p.x, 0.02, p.z)
    van.current.rotation.y = Math.atan2(tg.x, tg.z)
    van.current.position.y = 0.02 + Math.abs(Math.sin(st.clock.elapsedTime * 9)) * 0.015
    const mob = size.width < 768
    tmp.side.set(-tg.z, 0, tg.x)
    const back = mob ? 7.2 : 6, up = mob ? 4.2 : 2.9
    const sideOff = (mob ? 0 : -2.2) + st.pointer.x * 1.2
    tmp.cam.copy(p).addScaledVector(tg, -back).addScaledVector(tmp.side, sideOff)
    tmp.cam.y = up + st.pointer.y * 0.6
    camera.position.lerp(tmp.cam, Math.min(1, dt * 2.5))
    tmp.look.copy(p).addScaledVector(tg, 4).addScaledVector(tmp.side, mob ? 0 : -1.2)
    tmp.look.y = mob ? -0.6 : 0.6
    camera.lookAt(tmp.look)
  })
  return <Van vref={van} />
}

export default function Scene({ progress }) {
  const curve = useMemo(() => {
    const pts = []
    for (let z = Z0; z >= Z1; z -= 6) pts.push(new THREE.Vector3(roadX(z), 0, z))
    return new THREE.CatmullRomCurve3(pts)
  }, [])
  return (
    <Canvas dpr={[1, 1.6]} camera={{ position: [0, 3, 18], fov: 48, near: 0.1, far: 220 }} gl={{ antialias: true, alpha: false }} style={{ pointerEvents: 'none' }}>
      <color attach="background" args={[CREAM]} />
      <fog attach="fog" args={[CREAM, 22, 75]} />
      <hemisphereLight args={['#fff6e0', '#2f5a40', 0.7]} />
      <directionalLight position={[12, 18, 6]} intensity={2.1} color="#fff1d6" />
      <Terrain />
      <Road curve={curve} />
      <Scatter />
      <Rig progress={progress} curve={curve} />
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={2} position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[12, 12, 1]} color="#fff4dd" />
        <Lightformer form="rect" intensity={1.5} position={[-6, 2, 2]} rotation-y={Math.PI / 2} scale={[8, 3, 1]} color={OR} />
      </Environment>
    </Canvas>
  )
}
