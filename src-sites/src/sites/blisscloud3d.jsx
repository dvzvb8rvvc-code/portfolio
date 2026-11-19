import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'

/* soft volumetric-looking clouds: layered billboard puffs; the camera drifts forward with scroll */

const rnd = (() => { let s = 11; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646 } })()

function puffTexture() {
  const W = 256, c = document.createElement('canvas'); c.width = c.height = W
  const g = c.getContext('2d')
  const blob = (x, y, r, a) => { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(255,255,255,${a})`); gr.addColorStop(0.55, `rgba(255,255,255,${a * 0.55})`); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill() }
  for (let i = 0; i < 26; i++) { const a = rnd() * Math.PI * 2, d = Math.sqrt(rnd()) * 62; blob(128 + Math.cos(a) * d * 1.25, 140 + Math.sin(a) * d * 0.6, 34 + rnd() * 34, 0.36 + rnd() * 0.26) }
  // flatter, slightly shaded base
  g.globalCompositeOperation = 'destination-out'
  const fade = g.createLinearGradient(0, 150, 0, 256); fade.addColorStop(0, 'rgba(0,0,0,0)'); fade.addColorStop(1, 'rgba(0,0,0,.55)')
  g.fillStyle = fade; g.fillRect(0, 0, W, W)
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace
  return t
}

const TINTS = ['#ffd9cc', '#e4dafc', '#d4e6ff', '#fff3ea'].map(c => new THREE.Color(c))
const DEPTH = 64
const WHITE = new THREE.Color('#ffffff')

function Clouds({ progress, count }) {
  const { camera, size } = useThree()
  const tex = useMemo(puffTexture, [])
  const items = useMemo(() => Array.from({ length: count }, (_, i) => {
    let x = (rnd() * 2 - 1) * 7
    if (Math.abs(x) < 1.6) x = Math.sign(x || 1) * (1.6 + rnd() * 2)
    return { x, y: (rnd() * 2 - 1) * 3.4 - 0.4, z: -(i / count) * DEPTH + rnd() * 2, s: 3.6 + rnd() * 4.4, sp: 0.05 + rnd() * 0.1, ph: rnd() * 6.28, w: rnd() }
  }), [count])
  const refs = useRef([])
  const mats = useMemo(() => items.map(() => new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, opacity: 0, color: '#fff', toneMapped: false })), [items, tex])
  const geo = useMemo(() => new THREE.PlaneGeometry(1, 0.62), [])
  const st = useRef({ z: 6, t: 0 })
  const tint = useMemo(() => new THREE.Color(), [])
  useFrame((s, dt) => {
    const p = progress.get(), v = st.current
    v.t += dt
    const tz = 6 - p * (DEPTH - 14)
    v.z += (tz - v.z) * Math.min(1, dt * 3)
    camera.position.z = v.z
    camera.position.x += (s.pointer.x * 0.5 - camera.position.x) * Math.min(1, dt * 2)
    camera.position.y += (s.pointer.y * 0.3 - camera.position.y) * Math.min(1, dt * 2)
    const f = Math.min(2.999, p * 3), k = Math.floor(f)
    tint.copy(TINTS[k]).lerp(TINTS[k + 1], f - k)
    const narrow = size.width < 768
    items.forEach((c, i) => {
      const m = refs.current[i]; if (!m) return
      let z = c.z
      while (z > v.z + 1) z -= DEPTH
      const d = v.z - z
      m.position.set((narrow ? c.x * 0.6 : c.x) + Math.sin(v.t * c.sp + c.ph) * 0.4, c.y + Math.cos(v.t * c.sp * 0.8 + c.ph) * 0.15, z)
      m.scale.setScalar(c.s)
      const o = Math.min(1, Math.max(0, (d - 0.6) / 3)) * Math.min(1, Math.max(0, (DEPTH * 0.7 - d) / 12))
      mats[i].opacity = o * (narrow ? 0.85 : 0.95)
      mats[i].color.copy(tint).lerp(WHITE, c.w * 0.6)
    })
  })
  return <>{items.map((c, i) => <mesh key={i} ref={el => (refs.current[i] = el)} geometry={geo} material={mats[i]} />)}</>
}

export default function CloudScene({ progress, active, count = 64 }) {
  return (
    <Canvas flat frameloop={active ? 'always' : 'never'} dpr={[1, 1.5]} camera={{ position: [0, 0, 6], fov: 55, near: 0.1, far: 80 }} gl={{ antialias: false, alpha: true }} style={{ pointerEvents: 'none' }}>
      <Clouds progress={progress} count={count} />
    </Canvas>
  )
}
