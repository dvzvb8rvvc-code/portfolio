import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'

/* Low-poly beaver workshop on a river island.
   mode="hero": idle + pointer orbit.  mode="film": prog ref (0..1) drives camera, car and beaver. */

const mat = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.85, flatShading: true, ...o })
const MT = {
  bark: mat('#6b3d1f'), cut: mat('#efc98e'), plank: mat('#c98a4e'), plank2: mat('#ad6f3b'), post: mat('#7d4a26'),
  moss: mat('#8f9a50'), moss2: mat('#75843f'), bank: mat('#6a7a3a'), river: mat('#2a7f86', { roughness: 0.3 }),
  stone: mat('#a39a8c'), pine: mat('#3d6a3c'), pine2: mat('#4f7d45'),
  beaver: mat('#7a4524'), belly: mat('#c99566'), tail: mat('#3f2616'), black: mat('#1a120c', { roughness: 0.35 }),
  white: mat('#fffaf0'), hat: mat('#f2a33a', { roughness: 0.4 }), car: mat('#e8892b', { roughness: 0.4 }),
  glass: mat('#173c45', { roughness: 0.15 }), tyre: mat('#24201d', { roughness: 0.9 }), steel: mat('#c9cdd2', { roughness: 0.3, metalness: 0.8 }),
  foam: new THREE.MeshBasicMaterial({ color: '#d8f1ec', transparent: true, opacity: 0.6 }),
}
const LOG = [MT.bark, MT.cut, MT.cut]
const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }

function Log({ len = 2, r = 0.16, axis = 'x', ...p }) {
  const rot = axis === 'x' ? [0, 0, Math.PI / 2] : axis === 'z' ? [Math.PI / 2, 0, 0] : [0, 0, 0]
  return <mesh {...p} rotation={rot} material={LOG} castShadow receiveShadow><cylinderGeometry args={[r, r, len, 7]} /></mesh>
}

function signTexture() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 192
  const g = c.getContext('2d')
  g.fillStyle = '#e8bf83'; g.fillRect(0, 0, 512, 192)
  g.strokeStyle = 'rgba(107,61,31,.25)'; g.lineWidth = 3
  for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(0, 30 + i * 28); g.bezierCurveTo(170, 20 + i * 30, 340, 44 + i * 26, 512, 30 + i * 28); g.stroke() }
  g.fillStyle = '#2a1a0f'; g.font = '800 92px Geologica, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'
  g.fillText('У БОБРА', 256, 100)
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t
}

function Island() {
  const tex = useMemo(signTexture, [])
  return (
    <group>
      <mesh material={MT.moss} position={[0, -0.15, 0]} receiveShadow><cylinderGeometry args={[3.4, 3.8, 0.6, 9]} /></mesh>
      {Array.from({ length: 7 }).map((_, i) => (
        <mesh key={i} material={i % 2 ? MT.plank : MT.plank2} position={[-1.5 + i * 0.5, 0.19, 0.35]} receiveShadow castShadow><boxGeometry args={[0.47, 0.08, 2.7]} /></mesh>
      ))}
      {/* back wall of logs */}
      {[0, 1, 2, 3].map(i => <Log key={i} len={4} r={0.17} position={[0, 0.36 + i * 0.32, -1.25]} />)}
      {[-2, 2].map(x => <Log key={x} axis="y" len={2.2} r={0.13} position={[x, 1.0, -1.05]} />)}
      <mesh material={MT.plank2} position={[0, 1.78, -0.75]} rotation-x={0.28} castShadow><boxGeometry args={[4.6, 0.1, 1.4]} /></mesh>
      {/* log pile */}
      {[[-0.34, 0.32], [0, 0.32], [0.34, 0.32], [-0.17, 0.62], [0.17, 0.62], [0, 0.92]].map(([x, y], i) => <Log key={i} axis="z" len={1.3} r={0.16} position={[-2.6 + x, y, 0.4]} />)}
      {/* tyres */}
      {[0, 1, 2].map(i => <mesh key={i} material={MT.tyre} position={[1.55, 0.36 + i * 0.25, -0.55]} rotation-x={Math.PI / 2} castShadow><torusGeometry args={[0.3, 0.13, 6, 12]} /></mesh>)}
      {/* sign */}
      <Log axis="y" len={1.4} r={0.07} position={[2.6, 0.75, 2.3]} />
      <mesh position={[2.6, 1.3, 2.36]} rotation-y={0.35} castShadow>
        <boxGeometry args={[1.25, 0.46, 0.07]} />
        <meshStandardMaterial attach="material-0" color="#b77a43" flatShading />
        <meshStandardMaterial attach="material-1" color="#b77a43" flatShading />
        <meshStandardMaterial attach="material-2" color="#b77a43" flatShading />
        <meshStandardMaterial attach="material-3" color="#b77a43" flatShading />
        <meshStandardMaterial attach="material-4" map={tex} roughness={0.8} />
        <meshStandardMaterial attach="material-5" color="#b77a43" flatShading />
      </mesh>
    </group>
  )
}

function River() {
  const rip = useRef([])
  useFrame(({ clock }) => {
    rip.current.forEach((m, i) => {
      if (!m) return
      const k = (clock.elapsedTime * 0.25 + i / 3) % 1
      m.scale.setScalar(1 + k * 0.5); m.material.opacity = 0.55 * (1 - k)
    })
  })
  const trees = useMemo(() => Array.from({ length: 11 }).map((_, i) => {
    const a = Math.PI * 0.95 + i * 0.13 + (i % 3) * 0.04, r = 8.4 + (i % 4) * 0.7
    return [Math.cos(a) * r, Math.sin(a) * r, 0.8 + (i % 3) * 0.3]
  }), [])
  return (
    <group>
      <mesh material={MT.river} rotation-x={-Math.PI / 2} position={[0, -0.22, 0]} receiveShadow><circleGeometry args={[7.4, 24]} /></mesh>
      <mesh material={MT.bank} rotation-x={-Math.PI / 2} position={[0, 0, 0]} receiveShadow><ringGeometry args={[7.4, 22, 24]} /></mesh>
      <mesh material={MT.moss2} position={[0, -0.11, 0]}><cylinderGeometry args={[7.4, 7.4, 0.22, 24, 1, true]} /></mesh>
      {[0, 1, 2].map(i => (
        <mesh key={i} ref={el => (rip.current[i] = el)} rotation-x={-Math.PI / 2} position={[0, -0.2, 0]}>
          <ringGeometry args={[3.85, 3.97, 36]} />
          <meshBasicMaterial color="#d8f1ec" transparent opacity={0.5} />
        </mesh>
      ))}
      {[[-4.6, 2.5, 0.35], [4.8, -3, 0.45], [-2, -5.2, 0.3], [5.6, 3.6, 0.28]].map(([x, z, r], i) => (
        <mesh key={i} material={MT.stone} position={[x, -0.15, z]} rotation={[i, i * 2, 0]} castShadow><dodecahedronGeometry args={[r, 0]} /></mesh>
      ))}
      {trees.map(([x, z, s], i) => (
        <group key={i} position={[x, 0, z]} scale={s}>
          <mesh material={MT.post} position={[0, 0.3, 0]}><cylinderGeometry args={[0.1, 0.12, 0.6, 5]} /></mesh>
          <mesh material={i % 2 ? MT.pine : MT.pine2} position={[0, 1.1, 0]} castShadow><coneGeometry args={[0.8, 1.4, 6]} /></mesh>
          <mesh material={i % 2 ? MT.pine2 : MT.pine} position={[0, 1.8, 0]} castShadow><coneGeometry args={[0.58, 1.1, 6]} /></mesh>
        </group>
      ))}
      {/* log bridge to the bank */}
      {Array.from({ length: 16 }).map((_, i) => {
        const x = 3.25 + i * 0.27
        return <Log key={i} axis="z" len={1.35} r={0.12} position={[x, 0.1 - (i / 15) * 0.1, 1.05]} />
      })}
    </group>
  )
}

function Car({ carRef }) {
  return (
    <group ref={carRef}>
      <mesh material={MT.car} position={[0, 0.42, 0]} castShadow><boxGeometry args={[1.7, 0.42, 0.86]} /></mesh>
      <mesh material={MT.car} position={[0.12, 0.78, 0]} castShadow><boxGeometry args={[0.95, 0.36, 0.78]} /></mesh>
      <mesh material={MT.glass} position={[0.12, 0.79, 0]}><boxGeometry args={[0.97, 0.26, 0.8]} /></mesh>
      <mesh material={MT.white} position={[-0.86, 0.46, 0.26]}><boxGeometry args={[0.02, 0.1, 0.16]} /></mesh>
      <mesh material={MT.white} position={[-0.86, 0.46, -0.26]}><boxGeometry args={[0.02, 0.1, 0.16]} /></mesh>
      {[[-0.55, 0.43], [-0.55, -0.43], [0.55, 0.43], [0.55, -0.43]].map(([x, z], i) => (
        <mesh key={i} material={MT.tyre} position={[x, 0.2, z]} rotation-x={Math.PI / 2} castShadow><cylinderGeometry args={[0.2, 0.2, 0.14, 10]} /></mesh>
      ))}
    </group>
  )
}

function Beaver({ bRef, head, arm }) {
  return (
    <group ref={bRef}>
      <mesh material={MT.beaver} position={[0, 0.5, 0]} scale={[1, 1.2, 0.9]} castShadow><icosahedronGeometry args={[0.42, 1]} /></mesh>
      <mesh material={MT.belly} position={[0, 0.45, 0.2]} scale={[0.8, 1, 0.5]}><icosahedronGeometry args={[0.34, 1]} /></mesh>
      <mesh material={MT.tail} position={[0, 0.16, -0.55]} rotation-x={-0.25} scale={[0.85, 0.18, 1.4]} castShadow><icosahedronGeometry args={[0.32, 0]} /></mesh>
      {[-0.2, 0.2].map(x => <mesh key={x} material={MT.tail} position={[x, 0.07, 0.18]} scale={[1, 0.6, 1.4]}><icosahedronGeometry args={[0.11, 0]} /></mesh>)}
      <group ref={head} position={[0, 1.04, 0.06]}>
        <mesh material={MT.beaver} scale={[1, 0.92, 0.95]} castShadow><icosahedronGeometry args={[0.32, 1]} /></mesh>
        <mesh material={MT.belly} position={[0, -0.07, 0.25]} scale={[1.15, 0.85, 0.9]}><icosahedronGeometry args={[0.15, 1]} /></mesh>
        <mesh material={MT.black} position={[0, 0.0, 0.38]}><icosahedronGeometry args={[0.06, 0]} /></mesh>
        {[-0.032, 0.032].map(x => <mesh key={x} material={MT.white} position={[x, -0.17, 0.34]}><boxGeometry args={[0.055, 0.09, 0.025]} /></mesh>)}
        {[-0.13, 0.13].map(x => <mesh key={x} material={MT.black} position={[x, 0.08, 0.26]}><icosahedronGeometry args={[0.045, 0]} /></mesh>)}
        {[-0.22, 0.22].map(x => <mesh key={x} material={MT.tail} position={[x, 0.22, -0.02]}><icosahedronGeometry args={[0.08, 0]} /></mesh>)}
        <mesh material={MT.hat} position={[0, 0.16, -0.02]}><sphereGeometry args={[0.3, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2]} /></mesh>
        <mesh material={MT.hat} position={[0, 0.16, 0.05]}><cylinderGeometry args={[0.36, 0.36, 0.03, 12]} /></mesh>
      </group>
      <mesh material={MT.beaver} position={[-0.36, 0.55, 0.12]} rotation-z={0.5}><capsuleGeometry args={[0.07, 0.24, 3, 6]} /></mesh>
      <group ref={arm} position={[0.34, 0.68, 0.1]}>
        <mesh material={MT.beaver} position={[0.05, -0.14, 0.04]} rotation-z={-0.35}><capsuleGeometry args={[0.07, 0.24, 3, 6]} /></mesh>
        <group position={[0.12, -0.3, 0.12]} rotation-x={-1.2}>
          <mesh material={MT.steel} position={[0, 0.2, 0]}><boxGeometry args={[0.05, 0.42, 0.03]} /></mesh>
          <mesh material={MT.steel} position={[0, 0.45, 0]}><torusGeometry args={[0.07, 0.025, 4, 10, Math.PI * 1.5]} /></mesh>
        </group>
      </group>
    </group>
  )
}

/* chapters: 0 записались (sign), 1 приехали (car drives in), 2 мастер смотрит (beaver works), 3 готово (car leaves) */
const K = [
  { p: [8.5, 6.5, 10.5], l: [0.5, 0, 0] },
  { p: [6.2, 2.3, 6.4], l: [2.5, 0.9, 2.0] },
  { p: [6.2, 3.4, 6.6], l: [1.6, 0.3, 0.8] },
  { p: [-2.0, 1.9, 4.8], l: [0.0, 0.6, 1.0] },
  { p: [10.5, 4.8, 7.5], l: [5.5, 0.2, 1.0] },
]
const surf = x => x < 1.75 ? 0.23 : x < 3.2 ? 0.15 : Math.max(0, 0.15 - (x - 3.2) / 4.2 * 0.15)

function Rig({ mode, prog }) {
  const car = useRef(), bv = useRef(), head = useRef(), arm = useRef()
  const { camera, size } = useThree()
  const cp = useRef(new THREE.Vector3(...K[0].p)), cl = useRef(new THREE.Vector3(0, 0, 0))
  const tp = useMemo(() => new THREE.Vector3(), []), tl = useMemo(() => new THREE.Vector3(), [])
  const a = useMemo(() => new THREE.Vector3(), []), b = useMemo(() => new THREE.Vector3(), [])
  useFrame((st, dt) => {
    dt = Math.min(dt, 1 / 30)
    const t = st.clock.elapsedTime, mob = size.width < 640
    let carX = 0.3, carRot = 0, carLift = 0, work = 0.5
    if (mode === 'hero') {
      const ang = 0.72 + st.pointer.x * 0.25, r = mob ? 15.5 : 13.2
      tp.set(Math.sin(ang) * r, (mob ? 7.6 : 6.4) + st.pointer.y * 0.8, Math.cos(ang) * r)
      tl.set(0.4, mob ? 0.9 : 0.5, 0.3)
      work = 0.7
    } else {
      const p = Math.min(0.9999, Math.max(0, prog.current))
      const s = p * 4, i = Math.floor(s), f = s - i, e = ss(0, 0.55, f)
      a.set(...K[i].p); b.set(...K[i + 1].p); tp.lerpVectors(a, b, e)
      a.set(...K[i].l); b.set(...K[i + 1].l); tl.lerpVectors(a, b, e)
      if (mob) tp.multiplyScalar(1.28)
      if (i === 0) carX = 9.2
      else if (i === 1) carX = 9.2 - ss(0, 0.75, f) * 8.9
      else if (i === 2) { carX = 0.3; carLift = ss(0.05, 0.3, f) * 0.12; work = 1 }
      else { carRot = ss(0, 0.3, f) * Math.PI; carX = 0.3 + ss(0.25, 1, f) * 9.4; carLift = 0.12 * (1 - ss(0, 0.15, f)) }
    }
    cp.current.lerp(tp, 1 - Math.exp(-dt * 4)); cl.current.lerp(tl, 1 - Math.exp(-dt * 4))
    camera.position.copy(cp.current); camera.lookAt(cl.current)
    if (car.current) {
      car.current.position.set(carX, surf(carX) + carLift, 1.05)
      car.current.rotation.y = carRot
    }
    if (bv.current) {
      bv.current.position.set(-0.75, 0.23 + Math.abs(Math.sin(t * 3)) * 0.03 * work, 1.95)
      bv.current.rotation.y = 1.25 + Math.sin(t * 0.7) * 0.15
    }
    if (head.current) { head.current.rotation.y = -0.5 + st.pointer.x * 0.5; head.current.rotation.x = -st.pointer.y * 0.2 }
    if (arm.current) arm.current.rotation.z = Math.sin(t * (4 + work * 6)) * 0.45 * work
  })
  return (
    <>
      <Car carRef={car} />
      <Beaver bRef={bv} head={head} arm={arm} />
    </>
  )
}

export default function Workshop({ mode = 'hero', prog, active = true }) {
  return (
    <Canvas frameloop={active ? 'always' : 'never'} shadows dpr={[1, 1.6]} camera={{ position: K[0].p, fov: 32 }} gl={{ antialias: true, alpha: true }}
      style={{ pointerEvents: 'none' }} eventSource={typeof document !== 'undefined' ? document.getElementById('root') : undefined} eventPrefix="client">
      <hemisphereLight args={['#fff1dc', '#5c6b34', 0.7]} />
      <directionalLight position={[6, 11, 5]} intensity={2.3} color="#ffe2b8" castShadow shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-7} shadow-camera-right={7} shadow-camera-top={7} shadow-camera-bottom={-7} shadow-bias={-0.0004} />
      <Island />
      <River />
      <Rig mode={mode} prog={prog} />
      <Environment resolution={64}>
        <Lightformer form="rect" intensity={2} position={[0, 6, 4]} scale={[10, 4, 1]} color="#fff3e0" />
        <Lightformer form="rect" intensity={1.2} position={[-6, 2, -2]} rotation-y={Math.PI / 2} scale={[8, 3, 1]} color="#bfe3dc" />
      </Environment>
    </Canvas>
  )
}
