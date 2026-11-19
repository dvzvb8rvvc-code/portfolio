import React, { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, ContactShadows, RoundedBox } from '@react-three/drei'

/* a hotel key-card for your tyre set: turns as you scroll, then checks in to the reader */
const cl = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const ss = (a, b, v) => { const t = cl((v - a) / (b - a)); return t * t * (3 - 2 * t) }
const W = 3.2, H = 2.02, R = 0.16, T = 0.04
const BLUE = '#2340ff', INK = '#0e0e0e', PAPER = '#f5f4f0'

function rrShape(w, h, r) {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y)
  return s
}
function faceGeo() {
  const g = new THREE.ShapeGeometry(rrShape(W, H, R), 8)
  const p = g.attributes.position, uv = g.attributes.uv
  for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) + W / 2) / W, (p.getY(i) + H / 2) / H)
  return g
}
function drawFront(g, w, h) {
  g.fillStyle = BLUE; g.fillRect(0, 0, w, h)
  g.fillStyle = '#fff'
  g.font = '600 64px Onest, Arial, sans-serif'; g.fillText('Шинный отель', 64, 120)
  g.font = '400 30px "JetBrains Mono", monospace'; g.fillStyle = 'rgba(255,255,255,.8)'; g.fillText('БОРОВЛЯНЫ · 40 ЛЕТ ПОБЕДЫ, 19А', 64, 172)
  g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 2; g.beginPath(); g.moveTo(64, 400); g.lineTo(w - 64, 400); g.stroke()
  g.fillStyle = '#fff'; g.font = '400 28px "JetBrains Mono", monospace'; g.fillText('KEY · КОМПЛЕКТ 4 / 4', 64, 460)
  g.font = '600 140px Onest, Arial, sans-serif'; g.fillText('№', 64, 590)
  // tyre glyph
  const cx = w - 190, cy = 250
  ;[120, 98, 60, 22].forEach((r, i) => { g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.lineWidth = i === 0 ? 18 : 4; g.strokeStyle = '#fff'; g.stroke() })
  for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2; g.beginPath(); g.moveTo(cx + Math.cos(a) * 104, cy + Math.sin(a) * 104); g.lineTo(cx + Math.cos(a) * 116, cy + Math.sin(a) * 116); g.lineWidth = 6; g.strokeStyle = BLUE; g.stroke() }
}
function drawBack(g, w, h) {
  g.fillStyle = PAPER; g.fillRect(0, 0, w, h)
  g.fillStyle = INK; g.fillRect(0, 70, w, 110)
  g.font = '400 28px "JetBrains Mono", monospace'; g.fillStyle = INK
  ;[['ЗАЕЗД', 'при переобувке'], ['ПРОЖИВАНИЕ', 'стеллаж, сухо'], ['ВЫЕЗД', 'следующий сезон']].forEach(([a, c], i) => {
    const y = 270 + i * 90
    g.fillStyle = 'rgba(14,14,14,.55)'; g.fillText(a, 64, y)
    g.fillStyle = INK; g.font = '500 40px Onest, Arial, sans-serif'; g.fillText(c, 360, y + 4); g.font = '400 28px "JetBrains Mono", monospace'
    g.fillStyle = 'rgba(14,14,14,.15)'; g.fillRect(64, y + 30, w - 128, 2)
  })
  g.fillStyle = BLUE; g.fillRect(w - 120, h - 120, 56, 56)
}
function useCardTex(draw) {
  const tex = useMemo(() => {
    const c = document.createElement('canvas'); c.width = 1024; c.height = Math.round(1024 * H / W)
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4
    t.userData.c = c
    return t
  }, [])
  useEffect(() => {
    const paint = () => { const c = tex.userData.c; draw(c.getContext('2d'), c.width, c.height); tex.needsUpdate = true }
    paint()
    document.fonts?.ready.then(paint)
  }, [tex])
  return tex
}

function Card({ progress }) {
  const g = useRef(), card = useRef(), led = useRef(), reader = useRef()
  const { size } = useThree()
  const face = useMemo(faceGeo, [])
  const body = useMemo(() => { const e = new THREE.ExtrudeGeometry(rrShape(W, H, R), { depth: T, bevelEnabled: false, curveSegments: 8 }); e.translate(0, 0, -T / 2); return e }, [])
  const front = useCardTex(drawFront), back = useCardTex(drawBack)
  const ledOff = useMemo(() => new THREE.Color(BLUE), []), ledOn = useMemo(() => new THREE.Color('#19c26b'), [])
  useFrame((st, dt) => {
    const p = progress.get(), t = st.clock.elapsedTime, mob = size.width < 768
    const k = 1 - Math.exp(-Math.min(dt, 0.25) * 5)
    const turn = ss(0.06, 0.72, p), ins = ss(0.76, 0.92, p), rd = ss(0.7, 0.8, p)
    g.current.scale.setScalar(mob ? 0.6 : 1)
    g.current.position.set(mob ? 0 : 1.55, mob ? -0.9 : 0, 0)
    const idle = 1 - turn
    card.current.rotation.y = THREE.MathUtils.lerp(card.current.rotation.y, turn * Math.PI * 4 - 0.35 * idle * (1 - ins) + st.pointer.x * 0.2 * (1 - ins), k)
    card.current.rotation.x = THREE.MathUtils.lerp(card.current.rotation.x, (0.22 * idle + Math.sin(turn * Math.PI) * 0.35) * (1 - ins) - st.pointer.y * 0.1 * (1 - ins), k)
    card.current.rotation.z = THREE.MathUtils.lerp(card.current.rotation.z, (-0.12 * idle) * (1 - ins) + ins * Math.PI / 2, k)
    card.current.position.y = Math.sin(t * 1.2) * 0.06 * (1 - ins) + 0.35 * rd - ins * 1.0
    reader.current.position.y = THREE.MathUtils.lerp(-4, -1.35, rd)
    reader.current.visible = rd > 0.01
    led.current.material.color.copy(ledOff).lerp(ledOn, ss(0.86, 0.92, p))
    led.current.material.emissive.copy(led.current.material.color)
  })
  return (
    <group ref={g}>
      <group ref={card}>
        <mesh geometry={body}><meshStandardMaterial color="#e9e8e3" roughness={0.4} /></mesh>
        <mesh geometry={face} position-z={T / 2 + 0.001}><meshStandardMaterial map={front} roughness={0.32} metalness={0.05} /></mesh>
        <mesh geometry={face} position-z={-T / 2 - 0.001} rotation-y={Math.PI}><meshStandardMaterial map={back} roughness={0.5} /></mesh>
      </group>
      <group ref={reader}>
        <RoundedBox args={[2.4, 1.8, 0.7]} radius={0.12} smoothness={4}><meshStandardMaterial color="#1b1b1d" roughness={0.35} metalness={0.3} /></RoundedBox>
        <mesh position={[0, 0.901, 0]}><boxGeometry args={[2.15, 0.004, 0.09]} /><meshStandardMaterial color="#000" /></mesh>
        <mesh ref={led} position={[0.85, 0.5, 0.36]}><sphereGeometry args={[0.07, 24, 24]} /><meshStandardMaterial color={BLUE} emissive={BLUE} emissiveIntensity={1.5} /></mesh>
        <mesh position={[0, -0.3, 0.352]}><planeGeometry args={[1.6, 0.04]} /><meshStandardMaterial color="#3a3a3e" /></mesh>
      </group>
      <ContactShadows position={[0, -2.3, 0]} opacity={0.3} scale={7} blur={2.8} far={3} resolution={256} color="#000" />
    </group>
  )
}

export default function KeyCard({ progress, active }) {
  return (
    <Canvas frameloop={active ? 'always' : 'never'} dpr={[1, 1.6]} camera={{ position: [0, 0.2, 8.4], fov: 34 }} gl={{ antialias: true, alpha: true }} style={{ pointerEvents: 'none' }}
      eventSource={typeof document !== 'undefined' ? document.getElementById('root') : undefined} eventPrefix="client">
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 5, 6]} intensity={1.1} />
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={2.5} position={[0, 4, 5]} scale={[10, 2, 1]} />
        <Lightformer form="rect" intensity={1.2} position={[-6, 0, 2]} rotation-y={Math.PI / 2} scale={[8, 2, 1]} />
        <Lightformer form="rect" intensity={1} position={[6, 0, 2]} rotation-y={-Math.PI / 2} scale={[8, 2, 1]} />
      </Environment>
      <Card progress={progress} />
    </Canvas>
  )
}
