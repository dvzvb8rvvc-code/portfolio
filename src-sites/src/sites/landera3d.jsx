import React, { useMemo, useRef, useEffect } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'

/* night-to-day city under a giant 24-hour dial. The sun and moon travel the dial with scroll,
   windows go dark one by one — only the tyre shop sign stays lit. */
const cl = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const sm = (a, b, x) => { const t = cl((x - a) / (b - a)); return t * t * (3 - 2 * t) }
const dayOf = h => { const hh = ((h % 24) + 24) % 24; return sm(5.4, 8.2, hh) * (1 - sm(17.3, 19.8, hh)) }
function rng(seed) { let s = seed; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646 } }
const R = 5.4, DIAL_Y = -0.15, DIAL_Z = -4.2

function useCity() {
  return useMemo(() => {
    const r = rng(54), bld = [], win = []
    const rows = [{ z: -2.7, h: [1.2, 2.9] }, { z: -1.7, h: [0.8, 2.1] }, { z: -0.75, h: [0.45, 1.3] }]
    rows.forEach((row, ri) => {
      let x = -9
      while (x < 9) {
        const w = 0.5 + r() * 0.55, d = 0.6 + r() * 0.3
        const cx = x + w / 2
        if (!(ri === 2 && Math.abs(cx) < 1.35) && cx > -3.6) {
          const h = row.h[0] + r() * (row.h[1] - row.h[0])
          bld.push({ x: cx, z: row.z, w, h, d })
          const cols = Math.max(1, Math.floor((w - 0.12) / 0.17)), rws = Math.max(1, Math.floor((h - 0.18) / 0.22))
          const ox = cx - ((cols - 1) * 0.17) / 2
          for (let i = 0; i < cols; i++) for (let j = 0; j < rws; j++) {
            if (r() < 0.22) continue
            const morning = r() < 0.38
            win.push({ x: ox + i * 0.17, y: 0.2 + j * 0.22, z: row.z + d / 2 + 0.003, off: 21.3 + r() * 5.4, on: 6 + r() * 1.6, offM: 8.1 + r() * 1.2, morning, warm: r() })
          }
        }
        x += w + 0.06 + r() * 0.12
      }
    })
    return { bld, win }
  }, [])
}

function labelTex(text, w = 256, h = 128, font = '700 72px Tektur, sans-serif', color = '#ffffff', bg = null) {
  const c = document.createElement('canvas'); c.width = w; c.height = h
  const g = c.getContext('2d')
  if (bg) { g.fillStyle = bg; g.fillRect(0, 0, w, h) }
  g.fillStyle = color; g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, w / 2, h / 2 + 4)
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4
  return t
}

function Dial() {
  const ticks = useRef()
  const labels = useMemo(() => [['00', -Math.PI / 2], ['06', Math.PI], ['12', Math.PI / 2], ['18', 0]].map(([t, a]) => ({ t, a, tex: labelTex(t, 256, 128, '600 70px Tektur, sans-serif', '#cfd8ff') })), [])
  useEffect(() => {
    const m = new THREE.Object3D()
    for (let i = 0; i < 48; i++) {
      const a = (i / 48) * Math.PI * 2, major = i % 12 === 0, mid = i % 2 === 0
      const len = major ? 0.42 : mid ? 0.22 : 0.12
      m.position.set(Math.cos(a) * (R - 0.18 - len / 2), Math.sin(a) * (R - 0.18 - len / 2), 0)
      m.rotation.set(0, 0, a); m.scale.set(len, major ? 0.05 : 0.026, 0.02); m.updateMatrix()
      ticks.current.setMatrixAt(i, m.matrix)
    }
    ticks.current.instanceMatrix.needsUpdate = true
  }, [])
  return (
    <group position={[0, DIAL_Y, DIAL_Z]}>
      <mesh><torusGeometry args={[R, 0.03, 8, 160]} /><meshBasicMaterial color="#b9c4ff" transparent opacity={0.55} toneMapped={false} /></mesh>
      <mesh><torusGeometry args={[R - 0.62, 0.012, 6, 140]} /><meshBasicMaterial color="#b9c4ff" transparent opacity={0.25} toneMapped={false} /></mesh>
      <instancedMesh ref={ticks} args={[null, null, 48]}><boxGeometry /><meshBasicMaterial color="#dfe5ff" transparent opacity={0.7} toneMapped={false} /></instancedMesh>
      {labels.map(l => (
        <mesh key={l.t} position={[Math.cos(l.a) * (R - 1.05), Math.sin(l.a) * (R - 1.05), 0]}>
          <planeGeometry args={[0.7, 0.35]} /><meshBasicMaterial map={l.tex} transparent opacity={0.75} toneMapped={false} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}

function City({ hour }) {
  const { bld, win } = useCity()
  const bRef = useRef(), wRef = useRef(), ground = useRef(), last = useRef(-99)
  const bMat = useRef(), gMat = useRef()
  useEffect(() => {
    const m = new THREE.Object3D()
    bld.forEach((b, i) => { m.position.set(b.x, b.h / 2, b.z); m.scale.set(b.w, b.h, b.d); m.updateMatrix(); bRef.current.setMatrixAt(i, m.matrix) })
    bRef.current.instanceMatrix.needsUpdate = true
    m.scale.set(0.085, 0.11, 1); m.rotation.set(0, 0, 0)
    win.forEach((w, i) => { m.position.set(w.x, w.y, w.z); m.updateMatrix(); wRef.current.setMatrixAt(i, m.matrix) })
    wRef.current.instanceMatrix.needsUpdate = true
  }, [])
  const c = useMemo(() => ({ nightB: new THREE.Color('#151b33'), dayB: new THREE.Color('#9fb0c6'), nightG: new THREE.Color('#0a0e1c'), dayG: new THREE.Color('#7f8ea3'), warm: new THREE.Color('#ffc86b'), cool: new THREE.Color('#fff1c9'), off: new THREE.Color('#1c2440'), tmp: new THREE.Color() }), [])
  useFrame(() => {
    const h = hour.get()
    if (Math.abs(h - last.current) < 0.03) return
    last.current = h
    const day = dayOf(h)
    bMat.current.color.lerpColors(c.nightB, c.dayB, day)
    gMat.current.color.lerpColors(c.nightG, c.dayG, day)
    const offCol = c.tmp.copy(c.off).lerp(c.dayB, day).multiplyScalar(0.82)
    const fade = 1 - day * 0.9
    const col = new THREE.Color()
    win.forEach((w, i) => {
      const lit = (h >= 17 && h < w.off) || (w.morning && h - 24 > w.on && h - 24 < w.offM)
      if (lit) { col.copy(w.warm > 0.7 ? c.cool : c.warm).lerp(offCol, 1 - fade) } else col.copy(offCol)
      wRef.current.setColorAt(i, col)
    })
    wRef.current.instanceColor.needsUpdate = true
  })
  return (
    <group>
      <mesh ref={ground} rotation-x={-Math.PI / 2} position={[0, 0, -1]}><planeGeometry args={[40, 14]} /><meshStandardMaterial ref={gMat} color="#0a0e1c" roughness={0.9} /></mesh>
      <instancedMesh ref={bRef} args={[null, null, bld.length]}><boxGeometry /><meshStandardMaterial ref={bMat} color="#151b33" roughness={0.75} metalness={0.1} /></instancedMesh>
      <instancedMesh ref={wRef} args={[null, null, win.length]}><planeGeometry /><meshBasicMaterial toneMapped={false} /></instancedMesh>
    </group>
  )
}

function Shop() {
  const tyre = useRef(), light = useRef()
  const sign = useMemo(() => labelTex('ШИНОМОНТАЖ 24/7', 1024, 160, '800 96px Tektur, sans-serif', '#ffb547', '#120d05'), [])
  useFrame((st, dt) => {
    tyre.current.rotation.y += dt * 0.6
    light.current.intensity = 6 + Math.sin(st.clock.elapsedTime * 2.1) * 0.25
  })
  return (
    <group position={[0, 0, -0.35]}>
      <mesh position={[0, 0.34, 0]}><boxGeometry args={[2.1, 0.68, 0.9]} /><meshStandardMaterial color="#2a3150" roughness={0.6} /></mesh>
      {/* open garage doors, warm inside */}
      {[-0.52, 0.52].map(x => (
        <mesh key={x} position={[x, 0.25, 0.452]}><planeGeometry args={[0.82, 0.46]} /><meshBasicMaterial color="#ffd38a" toneMapped={false} /></mesh>
      ))}
      <mesh position={[0, 0.25, 0.453]}><planeGeometry args={[0.06, 0.5]} /><meshBasicMaterial color="#2a3150" /></mesh>
      <mesh position={[0, 0.6, 0.456]}><planeGeometry args={[2.0, 0.18]} /><meshBasicMaterial map={sign} toneMapped={false} /></mesh>
      {/* tyre on the roof */}
      <group ref={tyre} position={[0, 1.06, 0]}>
        <mesh><torusGeometry args={[0.24, 0.11, 18, 48]} /><meshStandardMaterial color="#141414" roughness={0.75} /></mesh>
        <mesh rotation-x={Math.PI / 2}><cylinderGeometry args={[0.16, 0.16, 0.1, 32]} /><meshStandardMaterial color="#c9cfd8" metalness={1} roughness={0.25} /></mesh>
      </group>
      <mesh position={[0, 0.77, 0]}><cylinderGeometry args={[0.02, 0.02, 0.2, 8]} /><meshStandardMaterial color="#6b7390" metalness={0.8} roughness={0.4} /></mesh>
      <pointLight ref={light} position={[0, 0.5, 1.1]} color="#ffb547" intensity={6} distance={4.5} decay={1.6} />
      {/* light spill on the ground */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.004, 1.1]}><circleGeometry args={[1.5, 40]} /><meshBasicMaterial color="#ffb547" transparent opacity={0.16} toneMapped={false} depthWrite={false} /></mesh>
    </group>
  )
}

function Stars({ hour }) {
  const ref = useRef()
  const geo = useMemo(() => {
    const r = rng(7), n = 380, p = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) { p[i * 3] = (r() - 0.5) * 34; p[i * 3 + 1] = 1.5 + r() * 9; p[i * 3 + 2] = -9 - r() * 4 }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); return g
  }, [])
  useFrame(st => { ref.current.material.opacity = (1 - dayOf(hour.get())) * (0.75 + Math.sin(st.clock.elapsedTime * 1.3) * 0.08) })
  return <points ref={ref} geometry={geo}><pointsMaterial size={0.05} color="#e6ebff" transparent depthWrite={false} toneMapped={false} /></points>
}

function Bodies({ hour }) {
  const sun = useRef(), moon = useRef(), dir = useRef(), amb = useRef()
  const cw = useMemo(() => ({ noon: new THREE.Color('#fff6e8'), low: new THREE.Color('#ff9d5c'), night: new THREE.Color('#8ea2ff') }), [])
  useFrame(() => {
    const h = hour.get(), day = dayOf(h)
    const a = Math.PI / 2 + ((12 - h) / 24) * Math.PI * 2
    sun.current.position.set(Math.cos(a) * R, DIAL_Y + Math.sin(a) * R, DIAL_Z + 0.05)
    moon.current.position.set(Math.cos(a + Math.PI) * R, DIAL_Y + Math.sin(a + Math.PI) * R, DIAL_Z + 0.05)
    const sy = Math.sin(a)
    dir.current.position.set(Math.cos(a) * 6, Math.max(1, sy * 8 + 2), 4)
    dir.current.intensity = 0.25 + day * 2.1
    dir.current.color.lerpColors(cw.low, cw.noon, cl(sy * 1.6)).lerp(cw.night, 1 - day)
    amb.current.intensity = 0.18 + day * 0.55
  })
  return (
    <group>
      <mesh ref={sun}><sphereGeometry args={[0.46, 40, 40]} /><meshBasicMaterial color="#ffd27a" toneMapped={false} /></mesh>
      <mesh ref={moon}><sphereGeometry args={[0.32, 40, 40]} /><meshStandardMaterial color="#e3e8f6" emissive="#9aa8d8" emissiveIntensity={0.55} roughness={0.9} /></mesh>
      <directionalLight ref={dir} intensity={1} />
      <ambientLight ref={amb} intensity={0.3} />
    </group>
  )
}

function Rig({ hour, progress }) {
  const g = useRef()
  const { size, camera } = useThree()
  useFrame(st => {
    const mob = size.width < 768, p = progress.get()
    g.current.scale.setScalar(mob ? 0.5 : 0.86)
    g.current.position.set(mob ? 0 : 2.3, mob ? -1.55 : -2.05, 0)
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, st.pointer.x * 0.35, 0.05)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 0.8 + st.pointer.y * 0.18, 0.05)
    camera.position.z = 10 - p * 1.1
    camera.lookAt(mob ? 0 : 1.2, 0.3, 0)
  })
  return (
    <group ref={g}>
      <Stars hour={hour} />
      <Dial />
      <Bodies hour={hour} />
      <City hour={hour} />
      <Shop />
    </group>
  )
}

export default function NightScene({ hour, progress, active }) {
  return (
    <Canvas frameloop={active ? 'always' : 'never'} dpr={[1, 1.6]} camera={{ position: [0, 0.8, 10], fov: 38 }} gl={{ antialias: true, alpha: true }} style={{ pointerEvents: 'none' }}
      eventSource={typeof document !== 'undefined' ? document.getElementById('root') : undefined} eventPrefix="client">
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={1.6} position={[0, 5, 3]} scale={[10, 1, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#ffb547" position={[-5, 1, 2]} rotation-y={Math.PI / 2} scale={[6, 1, 1]} />
      </Environment>
      <Rig hour={hour} progress={progress} />
    </Canvas>
  )
}
