import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, ContactShadows } from '@react-three/drei'

/* cutaway tyre: a quarter lifts away, the section shows its layers, a sidewall cut appears, a patch closes it from inside */
const cl = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const ss = (a, b, v) => { const t = cl((v - a) / (b - a)); return t * t * (3 - 2 * t) }
const N = 56, RC = 1.02, RB = 0.6, HA = 0.5
const W0 = Math.PI * 0.25 // wedge start angle
const WL = Math.PI / 2

/* centreline of the U-shaped section, (r, y) */
function centre() {
  const pts = []
  for (let i = 0; i <= N; i++) {
    const t = -Math.PI / 2 + (i / N) * Math.PI
    const c = Math.cos(t)
    pts.push({ r: RC + RB * Math.pow(Math.abs(c), 0.42), y: HA * Math.sin(t), t })
  }
  for (let i = 0; i <= N; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(N, i + 1)]
    const dx = b.r - a.r, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1
    pts[i].nr = dy / l; pts[i].ny = -dx / l // outward normal
    const c = Math.cos(pts[i].t)
    pts[i].w = 0.075 + 0.1 * Math.pow(c, 6)
  }
  return pts
}
const C = centre()
const off = (k, lo = 0, hi = N) => C.slice(lo, hi + 1).map(p => new THREE.Vector2(p.r + p.nr * p.w * k, p.y + p.ny * p.w * k))
/* closed band between offsets k1 (outer) and k2 (inner) */
function band(k1, k2, lo = 0, hi = N) { const a = off(k1, lo, hi), b = off(k2, lo, hi).reverse(); return [...a, ...b, a[0].clone()] }
const shapeOf = pts => { const s = new THREE.Shape(); pts.forEach((p, i) => (i ? s.lineTo(p.x, p.y) : s.moveTo(p.x, p.y))); return s }

function useTreadTex() {
  return useMemo(() => {
    const c = document.createElement('canvas'); c.width = 1024; c.height = 256
    const g = c.getContext('2d')
    g.fillStyle = '#3a3632'; g.fillRect(0, 0, 1024, 256)
    // v runs along the profile (0 = outer bead … 1 = other bead): tread sits around the middle
    g.fillStyle = '#100f0e'
    ;[0.4, 0.5, 0.6].forEach(v => g.fillRect(0, v * 256 - 5, 1024, 10))
    g.strokeStyle = '#100f0e'; g.lineWidth = 6
    for (let x = 0; x < 1024; x += 22) { g.beginPath(); g.moveTo(x, 0.34 * 256); g.lineTo(x + 14, 0.4 * 256); g.moveTo(x + 8, 0.6 * 256); g.lineTo(x + 22, 0.66 * 256); g.stroke() }
    g.fillStyle = '#34302c'; g.fillRect(0, 0.2 * 256, 1024, 4); g.fillRect(0, 0.8 * 256, 1024, 4)
    const t = new THREE.CanvasTexture(c); t.wrapS = THREE.RepeatWrapping; t.repeat.set(6, 1); t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [])
}

function Section({ angle, flip }) {
  // the visible layers on a cut face
  const geos = useMemo(() => ({
    rubber: new THREE.ShapeGeometry(shapeOf(band(0.5, -0.5))),
    liner: new THREE.ShapeGeometry(shapeOf(band(-0.36, -0.5))),
    carcass: new THREE.ShapeGeometry(shapeOf(band(0.02, -0.14))),
    belt1: new THREE.ShapeGeometry(shapeOf(band(0.2, 0.1, 18, 38))),
    belt2: new THREE.ShapeGeometry(shapeOf(band(0.33, 0.24, 20, 36))),
  }), [])
  const z = flip ? -1 : 1
  return (
    <group rotation-y={angle - Math.PI / 2}>
      <mesh geometry={geos.rubber}><meshStandardMaterial color="#2b2724" roughness={0.9} side={THREE.DoubleSide} /></mesh>
      <mesh geometry={geos.liner} position-z={0.002 * z}><meshStandardMaterial color="#4a4541" roughness={0.9} side={THREE.DoubleSide} /></mesh>
      <mesh geometry={geos.carcass} position-z={0.003 * z}><meshStandardMaterial color="#ff5b14" roughness={0.6} side={THREE.DoubleSide} /></mesh>
      <mesh geometry={geos.belt1} position-z={0.004 * z}><meshStandardMaterial color="#b9b4ac" metalness={0.8} roughness={0.35} side={THREE.DoubleSide} /></mesh>
      <mesh geometry={geos.belt2} position-z={0.004 * z}><meshStandardMaterial color="#d9d4cc" metalness={0.8} roughness={0.3} side={THREE.DoubleSide} /></mesh>
    </group>
  )
}

function Tyre({ progress }) {
  const g = useRef(), wedge = useRef(), cut = useRef(), patch = useRef(), patchRim = useRef(), plate = useRef()
  const { size } = useThree()
  const tex = useTreadTex()
  const outer = useMemo(() => band(0.5, -0.5), [])
  const main = useMemo(() => new THREE.LatheGeometry(outer, 120, W0 + WL, Math.PI * 2 - WL), [outer])
  const wedgeGeo = useMemo(() => new THREE.LatheGeometry(outer, 40, W0, WL), [outer])
  // sidewall slit on outer surface (near the cut face so the section shows it) and patch on the inner liner
  const cutGeo = useMemo(() => new THREE.LatheGeometry(off(0.52, 6, 14), 2, W0 + WL + 0.06, 0.035), [])
  const patchGeo = useMemo(() => new THREE.LatheGeometry(off(-0.62, 3, 17), 12, W0 + WL, 0.36), [])
  const rimGeo = useMemo(() => new THREE.LatheGeometry(off(-0.56, 2, 18), 12, W0 + WL, 0.42), [])
  useFrame((st, dt) => {
    const p = progress.get(), mob = size.width < 768
    const open = ss(0.12, 0.34, p), cutIn = ss(0.42, 0.55, p), patchIn = ss(0.64, 0.8, p)
    // wedge lifts out along its bisector and fades
    const bis = W0 + WL / 2
    wedge.current.position.set(Math.sin(bis) * open * 1.4, open * 1.1, Math.cos(bis) * open * 1.4)
    wedge.current.scale.setScalar(1 - open * 0.9)
    wedge.current.visible = open < 0.98
    cut.current.scale.setScalar(0.001 + cutIn)
    cut.current.visible = cutIn > 0.01
    patch.current.visible = patchRim.current.visible = patchIn > 0.01
    patch.current.material.opacity = patchIn
    patchRim.current.material.opacity = patchIn
    const s = mob ? 0.78 : 1
    g.current.scale.setScalar(s)
    g.current.position.set(mob ? 0 : 1.75, mob ? -0.85 : -0.05, 0)
    const targetY = -0.2 - open * 0.85 + patchIn * 0.1 + st.pointer.x * 0.15
    g.current.rotation.y = THREE.MathUtils.lerp(g.current.rotation.y, targetY, 1 - Math.exp(-Math.min(dt, 0.25) * 4))
    g.current.rotation.x = THREE.MathUtils.lerp(g.current.rotation.x, 1.0 - open * 0.42 + st.pointer.y * -0.08, 1 - Math.exp(-Math.min(dt, 0.25) * 4))
  })
  return (
    <group ref={g}>
      <mesh geometry={main}><meshStandardMaterial map={tex} roughness={0.85} metalness={0} side={THREE.DoubleSide} /></mesh>
      <Section angle={W0 + WL} />
      <Section angle={Math.PI * 2 + W0} flip />
      <group ref={wedge}>
        <mesh geometry={wedgeGeo}><meshStandardMaterial map={tex} roughness={0.85} side={THREE.DoubleSide} /></mesh>
      </group>
      <mesh ref={cut} geometry={cutGeo}><meshStandardMaterial color="#ff5b14" emissive="#ff3d00" emissiveIntensity={1.2} side={THREE.DoubleSide} /></mesh>
      <mesh ref={patchRim} geometry={rimGeo}><meshStandardMaterial color="#ff5b14" transparent opacity={0} side={THREE.DoubleSide} /></mesh>
      <mesh ref={patch} geometry={patchGeo}><meshStandardMaterial color="#3b3632" roughness={0.7} transparent opacity={0} side={THREE.DoubleSide} /></mesh>
      {/* simple steel rim */}
      <group ref={plate}>
        <mesh rotation-x={0}><cylinderGeometry args={[RC - 0.02, RC - 0.02, 0.86, 64, 1, true]} /><meshStandardMaterial color="#c9c4bb" metalness={1} roughness={0.28} side={THREE.DoubleSide} /></mesh>
        <mesh><cylinderGeometry args={[0.38, 0.38, 0.3, 48]} /><meshStandardMaterial color="#a8a39b" metalness={1} roughness={0.3} /></mesh>
        {[0, 1, 2, 3, 4].map(i => (
          <mesh key={i} rotation-y={(i / 5) * Math.PI} position-y={0.05}>
            <boxGeometry args={[0.1, 0.06, (RC - 0.04) * 2]} />
            <meshStandardMaterial color="#bdb8af" metalness={1} roughness={0.3} />
          </mesh>
        ))}
      </group>
      <ContactShadows position={[0, -0.9, 0]} opacity={0.35} scale={6} blur={2.6} far={2.4} resolution={256} color="#3a2a20" />
    </group>
  )
}

export default function TyreCut({ progress, active }) {
  return (
    <Canvas frameloop={active ? 'always' : 'never'} dpr={[1, 1.6]} camera={{ position: [0, 0.6, 7.4], fov: 34 }} gl={{ antialias: true, alpha: true }} style={{ pointerEvents: 'none' }}
      eventSource={typeof document !== 'undefined' ? document.getElementById('root') : undefined} eventPrefix="client">
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 6, 5]} intensity={1.4} />
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={3} position={[0, 5, 3]} scale={[10, 2, 1]} />
        <Lightformer form="rect" intensity={1.6} color="#ffd9c2" position={[-6, 1, 1]} rotation-y={Math.PI / 2} scale={[8, 2, 1]} />
        <Lightformer form="rect" intensity={1.2} position={[6, -1, 2]} rotation-y={-Math.PI / 2} scale={[8, 1, 1]} />
      </Environment>
      <Tyre progress={progress} />
    </Canvas>
  )
}
