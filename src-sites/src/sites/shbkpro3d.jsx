import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, ContactShadows, Html } from '@react-three/drei'

const ACC = new THREE.Color('#ff6a1a')
const BLACK = new THREE.Color('#000000')
const LIFT = 1.75
// chapter ranges must match the captions in shbkpro.jsx
const RANGES = [[0.26, 0.43], [0.44, 0.61], [0.62, 0.79], [0.8, 0.97]]
const SYS = ['susp', 'brake', 'exh', 'trans']
const TAGS = ['Подвеска', 'Тормоза', 'Выхлоп', 'Трансмиссия']
// camera keyframes: [t, position, lookAt]
const KEYS = [
  [0.0, [7.4, 2.5, 7.6], [0, 0.85, 0]],
  [0.2, [6.6, 1.7, 6.6], [0, 1.95, 0]],
  [0.34, [4.9, 0.45, 4.3], [1.0, 1.95, 0.3]],
  [0.52, [-4.7, 0.4, 4.1], [-1.1, 1.95, 0.4]],
  [0.7, [-5.3, 0.35, -2.4], [-0.8, 1.9, 0.1]],
  [0.88, [4.2, 0.3, -4.0], [0.9, 1.95, 0.0]],
  [1.0, [6.2, 1.3, -5.2], [0, 1.75, 0]],
]
const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }
const v3 = new THREE.Vector3(), l3 = new THREE.Vector3()
function sampleCam(p, outP, outL) {
  let i = 0
  while (i < KEYS.length - 2 && p > KEYS[i + 1][0]) i++
  const [t0, p0, l0] = KEYS[i], [t1, p1, l1] = KEYS[i + 1]
  const t = ss(t0, t1, p)
  outP.set(p0[0] + (p1[0] - p0[0]) * t, p0[1] + (p1[1] - p0[1]) * t, p0[2] + (p1[2] - p0[2]) * t)
  outL.set(l0[0] + (l1[0] - l0[0]) * t, l0[1] + (l1[1] - l0[1]) * t, l0[2] + (l1[2] - l0[2]) * t)
}
const activeOf = p => RANGES.findIndex(([a, b]) => p >= a - 0.02 && p <= b)

/* ---------- geometry ---------- */
function bodyGeo() {
  const s = new THREE.Shape()
  s.moveTo(-2.15, 0.32)
  s.lineTo(-2.22, 0.72)
  s.quadraticCurveTo(-2.24, 0.96, -1.95, 0.99)
  s.lineTo(-1.45, 1.03)
  s.lineTo(-0.62, 1.45)
  s.quadraticCurveTo(-0.5, 1.48, -0.3, 1.48)
  s.lineTo(0.18, 1.48)
  s.quadraticCurveTo(0.3, 1.48, 0.38, 1.44)
  s.lineTo(1.12, 1.0)
  s.lineTo(1.95, 0.9)
  s.quadraticCurveTo(2.26, 0.86, 2.26, 0.6)
  s.lineTo(2.22, 0.32)
  s.lineTo(1.82, 0.32)
  s.absarc(1.35, 0.33, 0.47, 0, Math.PI, false)
  s.lineTo(-0.88, 0.32)
  s.absarc(-1.35, 0.33, 0.47, 0, Math.PI, false)
  s.lineTo(-2.15, 0.32)
  const g = new THREE.ExtrudeGeometry(s, { depth: 1.66, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.08, bevelSegments: 5, curveSegments: 28 })
  g.translate(0, 0, -0.83)
  return g
}
function sideGlassGeo() {
  const s = new THREE.Shape()
  s.moveTo(-1.3, 1.04); s.lineTo(-0.66, 1.38); s.lineTo(0.3, 1.4); s.lineTo(0.98, 1.03); s.lineTo(-1.3, 1.04)
  const g = new THREE.ExtrudeGeometry(s, { depth: 1.885, bevelEnabled: false })
  g.translate(0, 0, -0.9425)
  return g
}
class Helix extends THREE.Curve {
  getPoint(t, target = new THREE.Vector3()) { const a = t * Math.PI * 2 * 6; return target.set(Math.cos(a) * 0.085, t * 0.4, Math.sin(a) * 0.085) }
}

function Bar({ a, b, r = 0.03, mat }) {
  // cylinder from a to b
  const { pos, quat, len } = useMemo(() => {
    const A = new THREE.Vector3(...a), Bv = new THREE.Vector3(...b)
    const d = Bv.clone().sub(A)
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize())
    return { pos: A.clone().add(Bv).multiplyScalar(0.5), quat: q, len: d.length() }
  }, [a, b])
  return <mesh position={pos} quaternion={quat} material={mat}><cylinderGeometry args={[r, r, len, 10]} /></mesh>
}

function Car({ mats, progress }) {
  const g = useRef()
  const body = useMemo(bodyGeo, []), sg = useMemo(sideGlassGeo, [])
  const spring = useMemo(() => new THREE.TubeGeometry(new Helix(), 140, 0.016, 6), [])
  const exhaust = useMemo(() => new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
    [1.55, 0.36, 0.1], [1.2, 0.19, 0.22], [0.4, 0.16, 0.26], [-0.6, 0.16, 0.28], [-1.5, 0.17, 0.3], [-1.95, 0.22, 0.42], [-2.32, 0.25, 0.5],
  ].map(v => new THREE.Vector3(...v))), 80, 0.045, 10), [])
  const paint = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#d7d9dc', metalness: 0.55, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.08 }), [])
  const glass = useMemo(() => new THREE.MeshStandardMaterial({ color: '#07090c', metalness: 0.9, roughness: 0.06 }), [])
  const rubber = useMemo(() => new THREE.MeshStandardMaterial({ color: '#111214', roughness: 0.92 }), [])
  const rim = useMemo(() => new THREE.MeshStandardMaterial({ color: '#b9bcc1', metalness: 1, roughness: 0.25 }), [])
  const pan = useMemo(() => new THREE.MeshStandardMaterial({ color: '#1b1d21', roughness: 0.85, metalness: 0.2 }), [])
  const head = useMemo(() => new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#fff4e0', emissiveIntensity: 2 }), [])
  const tail = useMemo(() => new THREE.MeshStandardMaterial({ color: '#600', emissive: '#ff2a1a', emissiveIntensity: 1.6 }), [])
  useFrame(() => { g.current.position.y = ss(0.04, 0.22, progress.get()) * LIFT })
  const W = [[1.35, 1], [1.35, -1], [-1.35, 1], [-1.35, -1]]
  return (
    <group ref={g}>
      <mesh geometry={body} material={paint} />
      <mesh geometry={sg} material={glass} />
      {/* windshield + rear window */}
      <mesh position={[0.75 + 0.497 * 0.085, 1.22 + 0.868 * 0.085, 0]} rotation-z={-0.537} material={glass}><boxGeometry args={[0.8, 0.012, 1.5]} /></mesh>
      <mesh position={[-1.035 - 0.42 * 0.085, 1.24 + 0.907 * 0.085, 0]} rotation-z={0.467} material={glass}><boxGeometry args={[0.8, 0.012, 1.45]} /></mesh>
      {[1, -1].map(z => <mesh key={'h' + z} position={[2.3, 0.72, z * 0.62]} material={head}><boxGeometry args={[0.06, 0.08, 0.36]} /></mesh>)}
      {[1, -1].map(z => <mesh key={'t' + z} position={[-2.29, 0.86, z * 0.66]} material={tail}><boxGeometry args={[0.06, 0.07, 0.4]} /></mesh>)}
      <mesh position={[0, 0.232, 0]} material={pan}><boxGeometry args={[3.6, 0.02, 1.5]} /></mesh>
      {/* wheels */}
      {W.map(([x, s]) => (
        <group key={x + '' + s} position={[x, 0.33, s * 0.82]}>
          <mesh rotation-x={Math.PI / 2} material={rubber}><cylinderGeometry args={[0.33, 0.33, 0.22, 36]} /></mesh>
          <mesh rotation-x={Math.PI / 2} position-z={s * 0.005} material={rim}><cylinderGeometry args={[0.215, 0.215, 0.225, 24]} /></mesh>
          {/* brakes */}
          <mesh rotation-x={Math.PI / 2} position-z={-s * 0.15} material={mats.brake}><cylinderGeometry args={[0.2, 0.2, 0.026, 32]} /></mesh>
          <mesh position={[x > 0 ? -0.16 : 0.16, 0.08, -s * 0.15]} material={mats.brake}><boxGeometry args={[0.1, 0.18, 0.08]} /></mesh>
          {/* strut + spring */}
          <mesh geometry={spring} position={[0, 0.05, -s * 0.23]} material={mats.susp} />
          <mesh position={[0, 0.24, -s * 0.23]} material={mats.susp}><cylinderGeometry args={[0.035, 0.035, 0.42, 10]} /></mesh>
        </group>
      ))}
      {/* front subframe + lower arms */}
      <mesh position={[1.35, 0.2, 0]} material={mats.susp}><boxGeometry args={[0.36, 0.06, 1.05]} /></mesh>
      {[1, -1].map(s => <Bar key={'la' + s} a={[1.2, 0.2, s * 0.5]} b={[1.35, 0.26, s * 0.68]} r={0.035} mat={mats.susp} />)}
      {[1, -1].map(s => <Bar key={'lb' + s} a={[1.55, 0.2, s * 0.5]} b={[1.35, 0.26, s * 0.68]} r={0.03} mat={mats.susp} />)}
      <Bar a={[1.65, 0.24, -0.62]} b={[1.65, 0.24, 0.62]} r={0.02} mat={mats.susp} />
      {/* rear twist beam + trailing arms */}
      <Bar a={[-1.35, 0.27, -0.66]} b={[-1.35, 0.27, 0.66]} r={0.05} mat={mats.susp} />
      {[1, -1].map(s => <Bar key={'ta' + s} a={[-0.8, 0.25, s * 0.6]} b={[-1.35, 0.27, s * 0.66]} r={0.04} mat={mats.susp} />)}
      {/* brake lines */}
      {[0.18, -0.18].map(z => <Bar key={'bl' + z} a={[1.2, 0.215, z]} b={[-1.25, 0.215, z]} r={0.01} mat={mats.brake} />)}
      {/* exhaust */}
      <mesh geometry={exhaust} material={mats.exh} />
      <mesh position={[0.4, 0.16, 0.26]} rotation-z={Math.PI / 2} material={mats.exh}><cylinderGeometry args={[0.085, 0.085, 0.46, 20]} /></mesh>
      <mesh position={[-0.55, 0.16, 0.28]} rotation-z={Math.PI / 2} material={mats.exh}><cylinderGeometry args={[0.07, 0.07, 0.5, 20]} /></mesh>
      <mesh position={[-1.88, 0.2, 0.18]} scale={[1, 1, 1.7]} rotation-z={Math.PI / 2} material={mats.exh}><cylinderGeometry args={[0.11, 0.11, 0.55, 24]} /></mesh>
      {/* engine oil pan + gearbox + drive shafts */}
      <mesh position={[1.62, 0.2, -0.12]} material={pan}><boxGeometry args={[0.5, 0.12, 0.55]} /></mesh>
      <mesh position={[1.3, 0.3, 0.28]} rotation-x={Math.PI / 2} material={mats.trans}><cylinderGeometry args={[0.17, 0.22, 0.42, 8]} /></mesh>
      {[1, -1].map(s => <Bar key={'cv' + s} a={[1.35, 0.31, s * 0.12]} b={[1.35, 0.33, s * 0.66]} r={0.03} mat={mats.trans} />)}
      {[1, -1].map(s => <mesh key={'bt' + s} position={[1.35, 0.33, s * 0.6]} rotation-x={Math.PI / 2} material={mats.trans}><cylinderGeometry args={[0.05, 0.065, 0.1, 14]} /></mesh>)}
      {/* floating tags */}
      {[[1.35, 0.25, 0.68], [-1.35, 0.33, 0.62], [-1.88, 0.12, 0.18], [1.3, 0.12, 0.28]].map((pos, i) => (
        <Html key={i} position={pos} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
          <div ref={el => (mats.tags[i] = el)} style={{ opacity: 0, transition: 'opacity .35s' }} className="flex items-center gap-2 whitespace-nowrap">
            <span className="relative grid h-4 w-4 place-items-center"><span className="absolute h-4 w-4 animate-ping rounded-full bg-[#ff6a1a]/50" /><span className="h-2 w-2 rounded-full bg-[#ff6a1a]" /></span>
            <span className="rounded-full bg-[#0c0d0f]/85 px-2.5 py-1 font-['JetBrains_Mono',monospace] text-[10px] uppercase tracking-[.16em] text-[#f1f0ec] ring-1 ring-[#ff6a1a]/60">{TAGS[i]}</span>
          </div>
        </Html>
      ))}
    </group>
  )
}

function Lift({ progress }) {
  const g = useRef()
  const post = useMemo(() => new THREE.MeshStandardMaterial({ color: '#2a2d33', metalness: 0.6, roughness: 0.45 }), [])
  const accent = useMemo(() => new THREE.MeshStandardMaterial({ color: '#ff6a1a', metalness: 0.3, roughness: 0.4 }), [])
  const arm = useMemo(() => new THREE.MeshStandardMaterial({ color: '#3a3e45', metalness: 0.7, roughness: 0.35 }), [])
  useFrame(() => { g.current.position.y = ss(0.04, 0.22, progress.get()) * LIFT })
  return (
    <group>
      {[1, -1].map(s => (
        <group key={s} position={[0, 0, s * 1.42]}>
          <mesh position={[0, 1.75, 0]} material={post}><boxGeometry args={[0.24, 3.5, 0.3]} /></mesh>
          <mesh position={[0, 1.75, -s * 0.152]} material={accent}><boxGeometry args={[0.06, 3.3, 0.01]} /></mesh>
          <mesh position={[0, 0.02, 0]} material={post}><boxGeometry args={[0.5, 0.04, 0.5]} /></mesh>
        </group>
      ))}
      <mesh position={[0, 3.55, 0]} material={post}><boxGeometry args={[0.2, 0.16, 3.1]} /></mesh>
      <group ref={g}>
        {[1, -1].map(s => (
          <group key={s}>
            <mesh position={[0, 0.2, s * 1.25]} material={accent}><boxGeometry args={[0.32, 0.34, 0.12]} /></mesh>
            {[1, -1].map(d => <Bar key={d} a={[0, 0.12, s * 1.25]} b={[d * 0.95, 0.12, s * 0.6]} r={0.045} mat={arm} />)}
            {[1, -1].map(d => <mesh key={'p' + d} position={[d * 0.95, 0.18, s * 0.6]} material={post}><cylinderGeometry args={[0.08, 0.08, 0.1, 16]} /></mesh>)}
          </group>
        ))}
      </group>
    </group>
  )
}

function Rig({ progress, mats }) {
  const { camera, size } = useThree()
  const tp = useRef(new THREE.Vector3(7.4, 2.5, 7.6)), tl = useRef(new THREE.Vector3(0, 0.85, 0)), cl = useRef(new THREE.Vector3(0, 0.85, 0))
  const last = useRef(-1)
  useFrame((st, dt) => {
    const p = progress.get(), mob = size.width < 768
    if (last.current !== size.width) {
      last.current = size.width
      if (mob) camera.clearViewOffset(); else camera.setViewOffset(size.width, size.height, -size.width * 0.17, 0, size.width, size.height)
    }
    sampleCam(p, v3, l3)
    if (mob) v3.sub(l3).multiplyScalar(1.22).add(l3)
    v3.x += st.pointer.x * 0.35; v3.y += st.pointer.y * 0.2
    const k = 1 - Math.pow(0.0015, Math.min(dt, 0.05))
    tp.current.lerp(v3, k); cl.current.lerp(l3, k)
    camera.position.copy(tp.current); camera.lookAt(cl.current)
    // highlight
    const a = activeOf(p), pulse = 0.65 + Math.sin(st.clock.elapsedTime * 3) * 0.25
    SYS.forEach((key, i) => {
      const m = mats[key], on = a === i
      m.emissive.lerp(on ? ACC : BLACK, 0.12)
      m.emissiveIntensity = on ? pulse : 0.6
      if (mats.tags[i]) mats.tags[i].style.opacity = on ? '1' : '0'
    })
  })
  return null
}

function Floor() {
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position-y={-0.001}><planeGeometry args={[60, 60]} /><meshStandardMaterial color="#141519" roughness={0.55} metalness={0.25} /></mesh>
      {[2.3, -2.3].map(z => <mesh key={z} rotation-x={-Math.PI / 2} position={[0, 0.001, z]}><planeGeometry args={[7, 0.07]} /><meshBasicMaterial color="#ff6a1a" toneMapped={false} /></mesh>)}
      {[-3.5, 3.5].map(x => <mesh key={x} rotation-x={-Math.PI / 2} position={[x, 0.001, 0]}><planeGeometry args={[0.07, 4.67]} /><meshBasicMaterial color="#3a3c42" /></mesh>)}
    </group>
  )
}

export default function LiftScene({ progress, active }) {
  const mats = useMemo(() => ({
    susp: new THREE.MeshStandardMaterial({ color: '#9aa0a8', metalness: 0.75, roughness: 0.32 }),
    brake: new THREE.MeshStandardMaterial({ color: '#8f9296', metalness: 0.85, roughness: 0.28 }),
    exh: new THREE.MeshStandardMaterial({ color: '#7d8086', metalness: 0.85, roughness: 0.38 }),
    trans: new THREE.MeshStandardMaterial({ color: '#5d626a', metalness: 0.6, roughness: 0.4 }),
    tags: [],
  }), [])
  return (
    <Canvas frameloop={active ? 'always' : 'never'} dpr={[1, 1.6]} camera={{ position: [7.4, 2.5, 7.6], fov: 34, near: 0.1, far: 60 }} gl={{ antialias: true, alpha: false }}>
      <color attach="background" args={['#0c0d0f']} />
      <fog attach="fog" args={['#0c0d0f', 10, 24]} />
      <hemisphereLight args={['#dfe4ec', '#22160f', 0.5]} />
      <directionalLight position={[4, 8, 5]} intensity={1.4} />
      <pointLight position={[0.4, 0.5, 0.2]} intensity={9} distance={7} decay={2} color="#ffd9b8" />
      <Rig progress={progress} mats={mats} />
      <Car mats={mats} progress={progress} />
      <Lift progress={progress} />
      <Floor />
      <ContactShadows position={[0, 0.002, 0]} scale={12} blur={2.6} far={4} opacity={0.75} resolution={512} color="#000" />
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={5} position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[10, 0.6, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={4} position={[0, 6, 2.5]} rotation-x={Math.PI / 2} scale={[10, 0.6, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={4} position={[0, 6, -2.5]} rotation-x={Math.PI / 2} scale={[10, 0.6, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={2.5} position={[-7, 2, 0]} rotation-y={Math.PI / 2} scale={[12, 3, 1]} color="#e9eef5" />
        <Lightformer form="rect" intensity={1.6} position={[7, 1, 0]} rotation-y={-Math.PI / 2} scale={[12, 2, 1]} color="#ffb47a" />
        <Lightformer form="rect" intensity={2.2} position={[0, -4, 0]} rotation-x={-Math.PI / 2} scale={[8, 8, 1]} color="#ffe2c4" />
      </Environment>
    </Canvas>
  )
}
