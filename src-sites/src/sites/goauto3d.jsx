import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, ContactShadows } from '@react-three/drei'

/* tunnel layout: 6 stations along +x, the car drives through them with scroll */
const N = 6, X0 = -5, LEN = 44
const stX = i => X0 + LEN * (i + 0.5) / N
const carX = p => X0 + LEN * p
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const sm = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t) }
const LIME = '#c8ff1a'

function bodyShape() {
  const s = new THREE.Shape()
  s.moveTo(-2.12, 0.3)
  s.lineTo(2.08, 0.3)
  s.quadraticCurveTo(2.26, 0.32, 2.24, 0.62)
  s.quadraticCurveTo(2.18, 0.84, 1.62, 0.88)
  s.lineTo(0.78, 0.94)
  s.quadraticCurveTo(0.34, 1.4, -0.22, 1.42)
  s.lineTo(-0.98, 1.4)
  s.quadraticCurveTo(-1.62, 1.32, -1.98, 1.0)
  s.quadraticCurveTo(-2.22, 0.9, -2.22, 0.6)
  s.quadraticCurveTo(-2.22, 0.32, -2.12, 0.3)
  return s
}
function glassShape() {
  const s = new THREE.Shape()
  s.moveTo(0.66, 0.97)
  s.quadraticCurveTo(0.28, 1.34, -0.2, 1.35)
  s.lineTo(-0.94, 1.33)
  s.quadraticCurveTo(-1.5, 1.27, -1.84, 1.0)
  s.lineTo(0.66, 0.97)
  return s
}

function Wheel({ x, z, spin }) {
  const g = useRef()
  useFrame(() => { g.current.rotation.z = -spin.current / 0.37 })
  return (
    <group position={[x, 0.37, z]}>
      <group ref={g}>
        <mesh rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[0.37, 0.37, 0.28, 32]} />
          <meshStandardMaterial color="#0c0c0d" roughness={0.75} />
        </mesh>
        <mesh rotation-x={Math.PI / 2} position-z={z > 0 ? 0.142 : -0.142}>
          <cylinderGeometry args={[0.24, 0.24, 0.02, 10]} />
          <meshStandardMaterial color="#9aa0a6" metalness={1} roughness={0.25} />
        </mesh>
        <mesh position-z={z > 0 ? 0.155 : -0.155}>
          <boxGeometry args={[0.4, 0.05, 0.01]} />
          <meshStandardMaterial color="#2a2c30" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>
    </group>
  )
}

function Car({ progress }) {
  const g = useRef(), mat = useRef(), spin = useRef(0), last = useRef(null)
  const body = useMemo(() => { const e = new THREE.ExtrudeGeometry(bodyShape(), { depth: 1.6, bevelEnabled: true, bevelSize: 0.09, bevelThickness: 0.09, bevelSegments: 4, curveSegments: 16 }); e.translate(0, 0, -0.8); return e }, [])
  const glass = useMemo(() => { const e = new THREE.ExtrudeGeometry(glassShape(), { depth: 1.66, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 2, curveSegments: 12 }); e.translate(0, 0, -0.83); return e }, [])
  const dusty = useMemo(() => new THREE.Color('#8c8373'), [])
  const clean = useMemo(() => new THREE.Color('#121418'), [])
  useFrame(() => {
    const p = progress.get()
    const x = carX(p)
    if (last.current !== null) spin.current += x - last.current
    last.current = x
    g.current.position.x = x
    const c = sm(0.12, 0.66, p), gl = sm(0.62, 0.94, p)
    const m = mat.current
    m.color.copy(dusty).lerp(clean, c)
    m.roughness = THREE.MathUtils.lerp(0.95, 0.4, c) * (1 - gl) + 0.06 * gl
    m.clearcoat = gl
    m.metalness = 0.05 + 0.45 * c
    m.envMapIntensity = 0.25 + 1.75 * (c * 0.4 + gl * 0.6)
  })
  return (
    <group ref={g}>
      <mesh geometry={body}>
        <meshPhysicalMaterial ref={mat} color="#8c8373" roughness={0.95} clearcoatRoughness={0.04} />
      </mesh>
      <mesh geometry={glass}>
        <meshPhysicalMaterial color="#050608" roughness={0.05} metalness={0.4} clearcoat={1} envMapIntensity={1.4} />
      </mesh>
      <mesh position={[2.27, 0.66, 0]}><boxGeometry args={[0.04, 0.07, 1.4]} /><meshBasicMaterial color="#f3f6ff" toneMapped={false} /></mesh>
      <mesh position={[-2.27, 0.74, 0]}><boxGeometry args={[0.04, 0.06, 1.5]} /><meshBasicMaterial color="#ff2a2a" toneMapped={false} /></mesh>
      {[[1.38, 0.86], [1.38, -0.86], [-1.36, 0.86], [-1.36, -0.86]].map(([x, z], k) => <Wheel key={k} x={x} z={z} spin={spin} />)}
      <ContactShadows position={[0, 0.005, 0]} scale={[6, 3]} resolution={256} blur={2.2} far={1.4} opacity={0.75} color="#000" />
    </group>
  )
}

function Gantry({ x, children, label = true }) {
  return (
    <group position={[x, 0, 0]}>
      {[-2, 2].map(z => <mesh key={z} position={[0, 1.6, z]}><boxGeometry args={[0.24, 3.2, 0.24]} /><meshStandardMaterial color="#1a1c20" metalness={0.8} roughness={0.35} /></mesh>)}
      <mesh position={[0, 3.25, 0]}><boxGeometry args={[0.34, 0.3, 4.24]} /><meshStandardMaterial color="#1a1c20" metalness={0.8} roughness={0.35} /></mesh>
      {label && <mesh position={[0, 3.09, 0]}><boxGeometry args={[0.36, 0.025, 4.0]} /><meshBasicMaterial color={LIME} toneMapped={false} /></mesh>}
      {children}
    </group>
  )
}

/* 01 pre-wash: fine falling mist */
function Mist({ x }) {
  const ref = useRef()
  const n = 420
  const pos = useMemo(() => { const a = new Float32Array(n * 3); for (let i = 0; i < n; i++) { a[i * 3] = (Math.random() - 0.5) * 0.9; a[i * 3 + 1] = Math.random() * 3; a[i * 3 + 2] = (Math.random() - 0.5) * 3.8 } return a }, [])
  useFrame((_, dt) => {
    const a = ref.current.geometry.attributes.position.array
    for (let i = 0; i < n; i++) { a[i * 3 + 1] -= dt * (2.2 + (i % 7) * 0.3); a[i * 3] += dt * 0.2 * Math.sin(i); if (a[i * 3 + 1] < 0) a[i * 3 + 1] = 3 }
    ref.current.geometry.attributes.position.needsUpdate = true
  })
  return (
    <points ref={ref} position={[x, 0, 0]}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[pos, 3]} /></bufferGeometry>
      <pointsMaterial size={0.035} color="#dfe8ee" transparent opacity={0.7} depthWrite={false} />
    </points>
  )
}

/* 02 foam stage told as hanging curtains of light */
function LightCurtain({ x, progress }) {
  const strips = useRef([])
  const k = 22
  useFrame(st => {
    const cx = carX(progress.get())
    const d = cx - x
    const push = clamp(1 - Math.abs(d) / 2.6)
    strips.current.forEach((s, i) => {
      if (!s) return
      s.rotation.z = push * (d < 0 ? -0.75 : 0.75) * (0.7 + 0.3 * Math.sin(i * 1.7)) + Math.sin(st.clock.elapsedTime * 2.2 + i) * 0.04
    })
  })
  return (
    <group position={[x, 3.08, 0]}>
      {Array.from({ length: k }, (_, i) => {
        const z = -1.8 + (3.6 * i) / (k - 1)
        return (
          <group key={i} position={[0, 0, z]} ref={el => (strips.current[i] = el)}>
            <mesh position={[0, -1.35, 0]}>
              <planeGeometry args={[0.08, 2.7]} />
              <meshBasicMaterial color={i % 3 === 0 ? '#ffffff' : LIME} transparent opacity={i % 3 === 0 ? 0.55 : 0.8} toneMapped={false} side={THREE.DoubleSide} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

function stripeTex(a, b, n = 16) {
  const c = document.createElement('canvas'); c.width = 64; c.height = 256
  const x = c.getContext('2d')
  for (let i = 0; i < n; i++) { x.fillStyle = i % 2 ? a : b; x.fillRect(0, (256 / n) * i, 64, 256 / n) }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1, 3); return t
}

/* 03 contact wash: spinning soft brushes */
function Brushes({ x, progress }) {
  const a = useRef(), b = useRef(), c = useRef()
  const tex = useMemo(() => { const t = stripeTex('#2a2e35', '#c9ced6', 24); t.rotation = Math.PI / 2; return t }, [])
  useFrame((_, dt) => {
    const near = clamp(1 - Math.abs(carX(progress.get()) - x) / 3.2)
    a.current.rotation.y += dt * 9; b.current.rotation.y -= dt * 9; c.current.rotation.z += dt * 7
    a.current.position.z = 1.55 - near * 0.18; b.current.position.z = -1.55 + near * 0.18
  })
  return (
    <group position={[x, 0, 0]}>
      <mesh ref={a} position={[0, 1.3, 1.55]}><cylinderGeometry args={[0.42, 0.42, 2.3, 28, 1, true]} /><meshStandardMaterial map={tex} roughness={0.9} /></mesh>
      <mesh ref={b} position={[0, 1.3, -1.55]}><cylinderGeometry args={[0.42, 0.42, 2.3, 28, 1, true]} /><meshStandardMaterial map={tex} roughness={0.9} /></mesh>
      <mesh ref={c} position={[0.9, 1.95, 0]} rotation-x={Math.PI / 2}><cylinderGeometry args={[0.32, 0.32, 3.4, 28, 1, true]} /><meshStandardMaterial map={tex} roughness={0.9} /></mesh>
    </group>
  )
}

/* 04 rinse: two falling water blades */
function Rinse({ x }) {
  const tex = useMemo(() => {
    const c = document.createElement('canvas'); c.width = 256; c.height = 256
    const g = c.getContext('2d')
    for (let i = 0; i < 160; i++) { g.fillStyle = `rgba(255,255,255,${0.1 + Math.random() * 0.5})`; g.fillRect(Math.random() * 256, Math.random() * 256, 1 + Math.random() * 1.5, 20 + Math.random() * 70) }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 1.5); return t
  }, [])
  useFrame((_, dt) => { tex.offset.y += dt * 1.6 })
  return (
    <group position={[x, 1.55, 0]}>
      {[-0.3, 0.3].map(dx => (
        <mesh key={dx} position={[dx, 0, 0]} rotation-y={Math.PI / 2}>
          <planeGeometry args={[4, 3.1]} />
          <meshBasicMaterial map={tex} color="#bfe6ff" transparent opacity={0.65} depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
    </group>
  )
}

/* 05 dry: air-blade streaks */
function Air({ x }) {
  const ref = useRef()
  const n = 70
  const seeds = useMemo(() => Array.from({ length: n }, () => ({ z: (Math.random() - 0.5) * 3.6, t: Math.random(), s: 0.7 + Math.random() * 0.8, y: 2.9 })), [])
  const m = useMemo(() => new THREE.Object3D(), [])
  useFrame((_, dt) => {
    seeds.forEach((d, i) => {
      d.t += dt * d.s * 1.4; if (d.t > 1) d.t -= 1
      m.position.set(d.t * -1.6, 2.9 - d.t * 2.2, d.z)
      m.rotation.set(0, 0, 0.94)
      m.scale.set(1, 1, 1)
      m.updateMatrix(); ref.current.setMatrixAt(i, m.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })
  return (
    <instancedMesh frustumCulled={false} ref={ref} args={[null, null, n]} position={[x + 0.6, 0, 0]}>
      <boxGeometry args={[0.7, 0.008, 0.008]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.55} toneMapped={false} />
    </instancedMesh>
  )
}

/* 06 finish: a portal of light */
function Portal({ x }) {
  const w = 4.4, h = 3.5
  return (
    <group position={[x + 1.2, 0, 0]}>
      <mesh position={[0, h, 0]}><boxGeometry args={[0.08, 0.08, w]} /><meshBasicMaterial color="#ffffff" toneMapped={false} /></mesh>
      {[-w / 2, w / 2].map(z => <mesh key={z} position={[0, h / 2, z]}><boxGeometry args={[0.08, h, 0.08]} /><meshBasicMaterial color="#ffffff" toneMapped={false} /></mesh>)}
      <mesh position={[0, 0.01, 0]} rotation-x={-Math.PI / 2}><planeGeometry args={[0.12, w]} /><meshBasicMaterial color={LIME} toneMapped={false} /></mesh>
    </group>
  )
}

function Floor() {
  const dash = useRef()
  const n = 64
  const m = useMemo(() => new THREE.Object3D(), [])
  React.useLayoutEffect(() => {
    for (let i = 0; i < n; i++) { const side = i % 2 ? 2.45 : -2.45; m.position.set(X0 - 6 + Math.floor(i / 2) * 1.8, 0.004, side); m.rotation.set(-Math.PI / 2, 0, 0); m.updateMatrix(); dash.current.setMatrixAt(i, m.matrix) }
    dash.current.instanceMatrix.needsUpdate = true
  }, [])
  return (
    <>
      <mesh rotation-x={-Math.PI / 2} position={[X0 + LEN / 2, 0, 0]}>
        <planeGeometry args={[LEN + 30, 30]} />
        <meshStandardMaterial color="#0d0e11" roughness={0.55} metalness={0.3} />
      </mesh>
      <instancedMesh frustumCulled={false} ref={dash} args={[null, null, n]}>
        <planeGeometry args={[0.9, 0.06]} />
        <meshBasicMaterial color="#3a3d44" />
      </instancedMesh>
      {[-1.2, 1.2].map(z => <mesh key={z} position={[X0 + LEN / 2, 3.9, z]}><boxGeometry args={[LEN + 20, 0.04, 0.12]} /><meshBasicMaterial color="#e8ecf2" toneMapped={false} /></mesh>)}
    </>
  )
}

function Rig({ progress }) {
  const { camera, size } = useThree()
  const look = useMemo(() => new THREE.Vector3(), [])
  React.useEffect(() => { camera.fov = size.width < 768 ? 50 : 34; camera.updateProjectionMatrix() }, [size.width])
  useFrame(st => {
    const p = progress.get(), x = carX(p), mob = size.width < 768
    const th = THREE.MathUtils.lerp(0.62, -0.28, p) + st.pointer.x * 0.06
    const r = mob ? 12.5 : 8.6
    const tx = x + r * Math.sin(th), ty = (mob ? 3.4 : 2.2) + st.pointer.y * 0.2, tz = r * Math.cos(th)
    camera.position.x += (tx - camera.position.x) * 0.12
    camera.position.y += (ty - camera.position.y) * 0.12
    camera.position.z += (tz - camera.position.z) * 0.12
    look.set(x + (mob ? 0.3 : -1.7), mob ? 0.2 : 0.85, 0)
    camera.lookAt(look)
  })
  return null
}

export default function GoFilm({ progress, active }) {
  return (
    <Canvas dpr={[1, 1.6]} frameloop={active ? 'always' : 'never'} camera={{ position: [0, 2, 8], fov: 34 }} gl={{ antialias: true }}>
      <color attach="background" args={['#0b0c0e']} />
      <fog attach="fog" args={['#0b0c0e', 9, 24]} />
      <ambientLight intensity={0.2} />
      <directionalLight position={[3, 6, 4]} intensity={0.8} />
      <Rig progress={progress} />
      <Floor />
      {Array.from({ length: N }, (_, i) => (
        <Gantry key={i} x={stX(i)} label={i !== N - 1}>
        </Gantry>
      ))}
      <Mist x={stX(0)} />
      <LightCurtain x={stX(1)} progress={progress} />
      <Brushes x={stX(2)} progress={progress} />
      <Rinse x={stX(3)} />
      <Air x={stX(4)} />
      <Portal x={stX(5)} />
      <Car progress={progress} />
      <Environment resolution={256}>
        <color attach="background" args={['#050506']} />
        <Lightformer form="rect" intensity={5} position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[14, 1.2, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={2.5} position={[0, 6, 2.2]} rotation-x={Math.PI / 2} scale={[14, 0.5, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={3} position={[-6, 2, 0]} rotation-y={Math.PI / 2} scale={[10, 0.6, 1]} color={LIME} />
        <Lightformer form="rect" intensity={2} position={[6, 2, 3]} rotation-y={-Math.PI / 2} scale={[10, 2, 1]} color="#e6eeff" />
        <Lightformer form="ring" intensity={2} position={[0, 2, 7]} scale={3} color="#ffffff" />
      </Environment>
    </Canvas>
  )
}
