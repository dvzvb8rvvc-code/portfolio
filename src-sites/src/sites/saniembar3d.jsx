import React, { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, ContactShadows } from '@react-three/drei'

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const sm = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t) }
const ACC = '#6fb6ff'

/* shift the framed object: right of text on desktop, up on mobile */
function Frame({ dx = -0.2, my = 0.2 }) {
  const { camera, size } = useThree()
  useEffect(() => {
    const mob = size.width < 768
    camera.setViewOffset(size.width, size.height, mob ? 0 : size.width * dx, mob ? size.height * my : 0, size.width, size.height)
    camera.updateProjectionMatrix()
    return () => { camera.clearViewOffset(); camera.updateProjectionMatrix() }
  }, [size.width, size.height])
  return null
}

function doorShape(s = 1) {
  const sh = new THREE.Shape()
  sh.moveTo(-1.65 * s, -1.0 * s)
  sh.lineTo(1.45 * s, -1.0 * s)
  sh.quadraticCurveTo(1.75 * s, -0.95 * s, 1.72 * s, -0.55 * s)
  sh.lineTo(1.62 * s, 0.72 * s)
  sh.lineTo(-1.6 * s, 0.78 * s)
  sh.quadraticCurveTo(-1.7 * s, 0.78 * s, -1.7 * s, 0.6 * s)
  sh.lineTo(-1.7 * s, -0.9 * s)
  sh.quadraticCurveTo(-1.7 * s, -1.0 * s, -1.65 * s, -1.0 * s)
  return sh
}
function noiseTex(dark, light, n = 2200) {
  const c = document.createElement('canvas'); c.width = c.height = 256
  const g = c.getContext('2d'); g.fillStyle = dark; g.fillRect(0, 0, 256, 256)
  for (let i = 0; i < n; i++) { g.fillStyle = light; g.globalAlpha = Math.random() * 0.5; const r = 1 + Math.random() * 3; g.beginPath(); g.arc(Math.random() * 256, Math.random() * 256, r, 0, 7); g.fill() }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 2); return t
}

const LAYERS = [
  { th: 0.05, s: 1, mat: { color: '#38434f', metalness: 0.6, roughness: 0.28, clearcoat: 1 } },
  { th: 0.035, s: 0.94, mat: { color: '#c9ced4', metalness: 1, roughness: 0.38 }, bump: true },
  { th: 0.2, s: 0.92, mat: { color: '#2b2e34', metalness: 0, roughness: 1 }, foam: true },
  { th: 0.05, s: 0.9, mat: { color: '#606772', metalness: 0, roughness: 0.85 } },
  { th: 0.12, s: 0.97, mat: { color: '#16181b', metalness: 0.1, roughness: 0.55, clearcoat: 0.3 }, card: true },
]
export const layerT = (p, i) => i === 0 ? 1 : sm(0.05 + (i - 1) * 0.16, 0.05 + (i - 1) * 0.16 + 0.12, p)

function Layer({ L, i, x0, progress }) {
  const g = useRef(), m = useRef()
  const geo = useMemo(() => { const e = new THREE.ExtrudeGeometry(doorShape(L.s), { depth: L.th, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.012, bevelSegments: 2, curveSegments: 10 }); e.rotateY(Math.PI / 2); return e }, [])
  const tex = useMemo(() => L.foam ? noiseTex('#2b2e34', '#5a5f68', 3000) : L.bump ? noiseTex('#888', '#fff', 1200) : null, [])
  useFrame(() => {
    const t = layerT(progress.get(), i)
    g.current.position.set(x0 + (1 - t) * 3.2, (1 - t) * 0.5, (1 - t) * -0.8)
    g.current.rotation.y = (1 - t) * -0.7
    m.current.opacity = clamp(t * 1.6)
    m.current.transparent = t < 0.99
    g.current.visible = t > 0.01
  })
  return (
    <group ref={g}>
      <mesh geometry={geo}>
        <meshPhysicalMaterial ref={m} {...L.mat} map={L.foam ? tex : null} bumpMap={L.bump ? tex : null} bumpScale={L.bump ? 0.6 : 0} />
      </mesh>
      {L.card && (
        <group position={[L.th + 0.02, 0, 0]}>
          <mesh position={[0.06, -0.05, 0.2]}><boxGeometry args={[0.12, 0.16, 1.6]} /><meshStandardMaterial color="#222529" roughness={0.6} /></mesh>
          <mesh position={[0.03, 0.32, -0.9]} rotation-y={Math.PI / 2}><torusGeometry args={[0.14, 0.025, 10, 24, Math.PI]} /><meshStandardMaterial color="#b9bfc6" metalness={1} roughness={0.2} /></mesh>
          <mesh position={[0.02, -0.55, 0.6]} rotation-z={Math.PI / 2}><cylinderGeometry args={[0.32, 0.32, 0.04, 40]} /><meshStandardMaterial color="#0b0c0e" roughness={0.9} /></mesh>
        </group>
      )}
    </group>
  )
}

/* noise waves: loud outside, damped inside */
function Waves({ progress, xEnd }) {
  const refs = useRef([])
  const n = 120, X1 = -6.5, X2 = 6
  const lines = useMemo(() => [-1.1, -0.4, 0.3, 1.0].map((z, k) => {
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3))
    const m = new THREE.LineBasicMaterial({ color: k === 1 ? ACC : '#dfe6ee', transparent: true, opacity: k === 1 ? 0.95 : 0.35 })
    return { obj: new THREE.Line(g, m), z, k }
  }), [])
  useFrame(st => {
    const p = progress.get(), t = st.clock.elapsedTime
    let q = 0; for (let i = 1; i < 5; i++) q += layerT(p, i) / 4
    const inside = 1 - 0.92 * q
    lines.forEach(({ obj, z, k }) => {
      const a = obj.geometry.attributes.position.array
      for (let i = 0; i < n; i++) {
        const x = X1 + (X2 - X1) * i / (n - 1)
        const amp = x < 0 ? 0.42 : x > xEnd ? 0.42 * inside : THREE.MathUtils.lerp(0.42, 0.42 * inside, x / xEnd)
        const jit = Math.sin(x * 7.3 + t * 5 + k) * 0.25 + Math.sin(x * 13.1 - t * 9) * 0.15
        a[i * 3] = x; a[i * 3 + 1] = 0.05 + (Math.sin(x * 2.6 - t * 3.2 + k * 0.8) + jit) * amp; a[i * 3 + 2] = z
      }
      obj.geometry.attributes.position.needsUpdate = true
    })
  })
  return <group>{lines.map(l => <primitive key={l.k} object={l.obj} />)}</group>
}

function DoorRig({ progress }) {
  const { camera, size } = useThree()
  useFrame(st => {
    const p = progress.get(), mob = size.width < 768
    const th = THREE.MathUtils.lerp(1.05, 0.62, p) + st.pointer.x * 0.08
    const r = mob ? 12.5 : 8.6
    camera.position.x += (0.2 + r * Math.sin(th) - camera.position.x) * 0.1
    camera.position.y += (1.7 + st.pointer.y * 0.3 - camera.position.y) * 0.1
    camera.position.z += (r * Math.cos(th) - camera.position.z) * 0.1
    camera.lookAt(0.2, 0, 0)
  })
  return null
}

function Studio({ warm = false }) {
  return (
    <Environment resolution={256}>
      <color attach="background" args={['#0b0d10']} />
      <Lightformer form="rect" intensity={4} position={[0, 5, 2]} rotation-x={Math.PI / 2} scale={[10, 2, 1]} color="#ffffff" />
      <Lightformer form="rect" intensity={2.5} position={[-5, 1, 1]} rotation-y={Math.PI / 2} scale={[6, 1.2, 1]} color={warm ? '#ffe9c4' : '#cfe6ff'} />
      <Lightformer form="rect" intensity={2} position={[5, 0, 3]} rotation-y={-Math.PI / 2} scale={[6, 3, 1]} color="#ffffff" />
      <Lightformer form="ring" intensity={1.6} position={[0, 1, 6]} scale={2.5} color="#ffffff" />
    </Environment>
  )
}

export function DoorScene({ progress, active }) {
  let x = 0
  const xs = LAYERS.map(L => { const v = x; x += L.th + 0.1; return v })
  return (
    <Canvas dpr={[1, 1.6]} frameloop={active ? 'always' : 'never'} camera={{ position: [5, 1.7, 5], fov: 32 }} gl={{ antialias: true, alpha: true }}>
      <Frame dx={-0.2} my={0.1} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 5, 3]} intensity={1.6} />
      <directionalLight position={[-3, 2, 5]} intensity={0.8} color="#cfe6ff" />
      <DoorRig progress={progress} />
      <group position={[-0.2, 0, 0]}>
        {LAYERS.map((L, i) => <Layer key={i} L={L} i={i} x0={xs[i]} progress={progress} />)}
        <Waves progress={progress} xEnd={x} />
      </group>
      <ContactShadows position={[0, -1.35, 0]} scale={8} resolution={256} blur={2.6} far={2} opacity={0.6} frames={1} />
      <Studio />
    </Canvas>
  )
}

/* ---------- headlight lens ---------- */
function reflectorGeo() {
  const pts = []; for (let i = 0; i <= 16; i++) { const r = 0.1 + (0.82 * i) / 16; pts.push(new THREE.Vector2(r, -0.75 + r * r * 0.6)) }
  const g = new THREE.LatheGeometry(pts, 48); g.rotateX(Math.PI / 2); return g
}
function Lens({ progress }) {
  const g = useRef(), lens = useRef(), haze = useRef(), bulb = useRef(), beam = useRef(), glow = useRef()
  const refl = useMemo(reflectorGeo, [])
  const yellow = useMemo(() => new THREE.Color('#d9b552'), [])
  const white = useMemo(() => new THREE.Color('#ffffff'), [])
  const { size } = useThree()
  useFrame(st => {
    const p = progress.get(), c = sm(0.1, 0.7, p), mob = size.width < 768
    g.current.rotation.y += ((THREE.MathUtils.lerp(-0.75, -0.25, p) + st.pointer.x * 0.15) - g.current.rotation.y) * 0.08
    g.current.rotation.x += ((-0.08 - st.pointer.y * 0.1) - g.current.rotation.x) * 0.08
    g.current.scale.setScalar(mob ? 0.8 : 1)
    lens.current.color.copy(yellow).lerp(white, c)
    lens.current.roughness = 0.75 * (1 - c) + 0.02
    lens.current.opacity = 0.92 - 0.72 * c
    haze.current.opacity = 0.8 * (1 - c) ** 1.5
    bulb.current.color.setRGB(1, 0.92 + 0.08 * c, 0.75 + 0.25 * c).multiplyScalar(0.6 + 2.4 * c)
    beam.current.opacity = 0.03 + 0.22 * sm(0.55, 0.95, p)
    glow.current.opacity = 0.05 + 0.35 * c
  })
  return (
    <group ref={g}>
      <mesh position={[0, 0, 0.44]} rotation-x={Math.PI / 2}><sphereGeometry args={[0.98, 48, 24, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} /><meshStandardMaterial color="#101215" roughness={0.6} side={THREE.DoubleSide} /></mesh>
      <mesh geometry={refl} position={[0, 0, 0.5]}><meshStandardMaterial color="#e7ebef" metalness={1} roughness={0.12} side={THREE.DoubleSide} /></mesh>
      <mesh position={[0, 0, -0.05]}><sphereGeometry args={[0.13, 32, 16]} /><meshBasicMaterial ref={bulb} toneMapped={false} /></mesh>
      <mesh position={[0, 0, 0.05]}><circleGeometry args={[0.7, 48]} /><meshBasicMaterial ref={glow} color="#fff6e2" transparent blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} opacity={0.2} /></mesh>
      <mesh position={[0, 0, 0.44]}><torusGeometry args={[0.96, 0.06, 16, 64]} /><meshStandardMaterial color="#c3c8ce" metalness={1} roughness={0.18} /></mesh>
      <mesh position={[0, 0, -0.5]} rotation-x={Math.PI / 2}><sphereGeometry args={[1.32, 48, 20, 0, Math.PI * 2, 0, 0.78]} /><meshPhysicalMaterial ref={lens} transparent roughness={0.7} clearcoat={1} clearcoatRoughness={0.05} metalness={0} envMapIntensity={1.6} depthWrite={false} /></mesh>
      <mesh position={[0, 0, -0.495]} rotation-x={Math.PI / 2} scale={1.006}><sphereGeometry args={[1.32, 40, 16, 0, Math.PI * 2, 0, 0.78]} /><meshStandardMaterial ref={haze} color="#c9a64a" transparent roughness={1} depthWrite={false} /></mesh>
      <mesh position={[0, 0, 2.1]} rotation-x={Math.PI / 2}><cylinderGeometry args={[1.7, 0.92, 3.2, 48, 1, true]} /><meshBasicMaterial ref={beam} color="#f6f1e2" transparent blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} /></mesh>
    </group>
  )
}
export function LensScene({ progress, active }) {
  return (
    <Canvas dpr={[1, 1.6]} frameloop={active ? 'always' : 'never'} camera={{ position: [0, 0.3, 6.4], fov: 34 }} gl={{ antialias: true, alpha: true }}>
      <Frame dx={-0.22} my={0.22} />
      <ambientLight intensity={0.25} />
      <Lens progress={progress} />
      <Studio warm />
    </Canvas>
  )
}
