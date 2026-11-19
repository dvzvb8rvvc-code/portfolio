import React, { useMemo, useRef, useEffect } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, ContactShadows } from '@react-three/drei'

/* a retro fashion magazine whose pages turn with scroll (bent pages computed analytically) */
const W = 1.5, HH = 2, SEG = 28
const PAPER = '#f1e6d2', INK = '#221b17', RED = '#c42a2a', MUS = '#d79a2b'
const CW = 768, CH = 1024
const cl = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const DISPLAY = '"Yeseva One", Georgia, serif', BODY = 'Commissioner, Arial, sans-serif'

function paper(g, bg = PAPER) {
  g.fillStyle = bg; g.fillRect(0, 0, CW, CH)
  g.fillStyle = 'rgba(80,50,20,.05)'
  for (let i = 0; i < 900; i++) g.fillRect((i * 7919) % CW, (i * 104729) % CH, 2, 2)
}
function folio(g, n, left) {
  g.fillStyle = INK; g.globalAlpha = 0.6; g.font = `500 22px ${BODY}`; g.textAlign = left ? 'left' : 'right'
  g.fillText(`МОДНОЕ МЕСТО · с. ${n}`, left ? 56 : CW - 56, CH - 44); g.globalAlpha = 1
}
function wrap(g, text, x, y, maxW, lh) {
  const words = text.split(' '); let line = ''
  for (const w of words) { const t = line ? line + ' ' + w : w; if (g.measureText(t).width > maxW && line) { g.fillText(line, x, y); line = w; y += lh } else line = t }
  g.fillText(line, x, y); return y
}
function titlePage(g, n, kicker, title, text, num) {
  paper(g)
  g.fillStyle = RED; g.font = `600 26px ${BODY}`; g.textAlign = 'left'; g.fillText(kicker.toUpperCase(), 56, 110)
  g.fillStyle = INK; g.font = `150px ${DISPLAY}`
  title.split('\n').forEach((t, i) => g.fillText(t, 50, 280 + i * 150))
  g.fillStyle = RED; g.fillRect(56, 300 + (title.split('\n').length - 1) * 150 + 30, 140, 8)
  g.fillStyle = INK; g.font = `400 34px ${BODY}`
  wrap(g, text, 56, 440 + (title.split('\n').length - 1) * 150, CW - 112, 48)
  g.globalAlpha = 0.12; g.font = `420px ${DISPLAY}`; g.textAlign = 'right'; g.fillText(num, CW - 30, CH - 90); g.globalAlpha = 1
  folio(g, n, true)
}
const PAGES = {
  cover(g) {
    paper(g, '#efe2c9')
    g.fillStyle = RED; g.fillRect(0, 0, CW, 250)
    g.fillStyle = PAPER; g.font = `128px ${DISPLAY}`; g.textAlign = 'center'; g.fillText('МОДНОЕ', CW / 2, 150)
    g.font = `600 30px ${BODY}`; g.fillText('М Е С Т О  ·  М А Л И Н О В К А', CW / 2, 215)
    // portrait: big curly hair
    const cx = CW / 2 + 40, cy = 600
    g.fillStyle = INK; g.beginPath(); g.ellipse(cx, cy, 250, 270, 0, 0, Math.PI * 2); g.fill()
    g.strokeStyle = '#4a3a30'; g.lineWidth = 6
    for (let i = 0; i < 26; i++) { const a = (i / 26) * Math.PI * 2; g.beginPath(); g.arc(cx + Math.cos(a) * 200, cy + Math.sin(a) * 215, 46, a, a + Math.PI * 1.4); g.stroke() }
    g.fillStyle = '#e8c6a8'; g.beginPath(); g.ellipse(cx - 20, cy + 40, 118, 158, -0.08, 0, Math.PI * 2); g.fill()
    g.fillStyle = INK; g.beginPath(); g.ellipse(cx - 60, cy + 10, 22, 6, 0, 0, Math.PI * 2); g.fill(); g.beginPath(); g.ellipse(cx + 22, cy + 10, 22, 6, 0, 0, Math.PI * 2); g.fill()
    g.fillStyle = RED; g.beginPath(); g.ellipse(cx - 22, cy + 120, 30, 13, 0, 0, Math.PI * 2); g.fill()
    g.fillStyle = INK; g.fillRect(cx - 160, cy + 196, 280, 200)
    // cover lines
    g.textAlign = 'left'; g.fillStyle = INK
    g.font = `52px ${DISPLAY}`; g.fillText('Цвет,', 46, 340); g.fillText('который', 46, 394); g.fillText('вам идёт', 46, 448)
    g.font = `500 26px ${BODY}`; g.fillText('окрашивание · с. 2', 48, 490)
    g.fillStyle = RED; g.font = `44px ${DISPLAY}`; g.fillText('Химзавивка', 46, 860); g.fillStyle = INK; g.font = `500 26px ${BODY}`; g.fillText('снова в моде · с. 6', 48, 898)
    // rating sticker
    g.fillStyle = MUS; g.beginPath(); g.arc(CW - 120, 340, 92, 0, Math.PI * 2); g.fill()
    g.fillStyle = INK; g.textAlign = 'center'; g.font = `64px ${DISPLAY}`; g.fillText('4,7', CW - 120, 345); g.font = `600 20px ${BODY}`; g.fillText('123 оценки', CW - 120, 380)
    g.font = `600 22px ${BODY}`; g.textAlign = 'left'; g.fillText('ул. Сергея Есенина, 30', 46, CH - 50)
    g.textAlign = 'right'; g.fillText('ВЫПУСК № 30', CW - 46, CH - 50)
  },
  colorL(g) { titlePage(g, 2, 'Тема выпуска', 'Окра-\nшивание', 'Однотонное, с переходом или просто освежить цвет — мастер подберёт оттенок под вас.', '1') },
  colorR(g) {
    paper(g)
    const sw = [['#2b1a12', 'Тёмный шоколад'], ['#5a3420', 'Каштан'], ['#8c4a2a', 'Медь'], ['#b98a5a', 'Карамель'], ['#d9bf8f', 'Блонд'], ['#a9a39a', 'Пепельный']]
    sw.forEach(([c, t], i) => {
      const y = 90 + i * 140
      const gr = g.createLinearGradient(56, 0, CW - 56, 0); gr.addColorStop(0, c); gr.addColorStop(1, PAPER)
      g.fillStyle = gr; g.beginPath(); g.moveTo(56, y); g.bezierCurveTo(300, y - 30, 500, y + 40, CW - 56, y + 10); g.lineTo(CW - 56, y + 100); g.bezierCurveTo(500, y + 130, 300, y + 70, 56, y + 100); g.fill()
      g.fillStyle = INK; g.font = `500 24px ${BODY}`; g.textAlign = 'left'; g.fillText(t, 70, y + 60)
    })
    g.fillStyle = INK; g.globalAlpha = .6; g.font = `400 20px ${BODY}`; g.fillText('Оттенки — для примера. Точный цвет подбирается на консультации.', 56, CH - 90); g.globalAlpha = 1
    folio(g, 3, false)
  },
  highL(g) { titlePage(g, 4, 'Свет в волосах', 'Мели-\nрование', 'Тонкие пряди или заметный контраст. Обсудим с мастером, как будет смотреться и как отрастать.', '2') },
  highR(g) {
    paper(g)
    for (let i = 0; i < 22; i++) { g.fillStyle = i % 3 === 0 ? '#e6cf9c' : i % 3 === 1 ? '#5a3420' : '#8c5a32'; g.save(); g.translate(CW / 2, CH / 2); g.rotate(-0.35); g.fillRect(-700 + i * 64, -900, i % 3 === 0 ? 22 : 42, 1800); g.restore() }
    g.fillStyle = PAPER; g.fillRect(56, CH - 260, CW - 112, 150)
    g.fillStyle = INK; g.font = `64px ${DISPLAY}`; g.textAlign = 'left'; g.fillText('Пряди света', 84, CH - 160)
    folio(g, 5, false)
  },
  permL(g) { titlePage(g, 6, 'Возвращение', 'Химза-\nвивка', 'Объём и локоны, которые держатся. Мастер подскажет, подойдёт ли процедура вашим волосам.', '3') },
  permR(g) {
    paper(g, '#efe2c9')
    g.strokeStyle = INK; g.lineWidth = 7
    for (let k = 0; k < 9; k++) {
      const x0 = 100 + (k % 3) * 285, y0 = 160 + Math.floor(k / 3) * 300
      g.beginPath(); for (let t = 0; t < 30; t += 0.15) { const r = 8 + t * 3.6; const x = x0 + Math.cos(t) * r, y = y0 + Math.sin(t) * r; t ? g.lineTo(x, y) : g.moveTo(x, y) } g.stroke()
    }
    g.fillStyle = RED; g.fillRect(56, CH - 150, 220, 10)
    folio(g, 7, false)
  },
  lashL(g) { titlePage(g, 8, 'Взгляд', 'Ресницы', 'Наращивание ресниц — подберём длину и изгиб, чтобы смотрелось естественно.', '4') },
  lashR(g) {
    paper(g)
    g.fillStyle = INK; g.textAlign = 'center'; g.font = `96px ${DISPLAY}`; g.fillText('Ваш', CW / 2, 230); g.fillText('мастер', CW / 2, 330); g.fillStyle = RED; g.fillText('ждёт', CW / 2, 430)
    g.strokeStyle = INK; g.lineWidth = 5
    for (let i = 0; i < 24; i++) { const a = Math.PI * (1.12 + (i / 23) * 0.76); g.beginPath(); g.moveTo(CW / 2 + Math.cos(a) * 160, 760 + Math.sin(a) * -60); g.quadraticCurveTo(CW / 2 + Math.cos(a) * 240, 760 - Math.abs(Math.sin(a)) * 160, CW / 2 + Math.cos(a) * 300, 760 - Math.abs(Math.sin(a)) * 230 - 20); g.stroke() }
    g.lineWidth = 8; g.beginPath(); g.ellipse(CW / 2, 760, 170, 60, 0, Math.PI, 0); g.stroke()
    g.font = `600 30px ${BODY}`; g.fillStyle = INK; g.fillText('+375 29 601-98-01', CW / 2, CH - 110)
    folio(g, 9, false)
  },
}
const LEAVES = [['cover', 'colorL'], ['colorR', 'highL'], ['highR', 'permL'], ['permR', 'lashL']]
const BASE = 'lashR'

function makeTex(key, mirror) {
  const c = document.createElement('canvas'); c.width = CW; c.height = CH
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4
  if (mirror) { t.wrapS = THREE.RepeatWrapping; t.repeat.x = -1; t.offset.x = 1 }
  const draw = () => { const g = c.getContext('2d'); g.clearRect(0, 0, CW, CH); PAGES[key](g); t.needsUpdate = true }
  draw()
  return { t, draw }
}

function Leaf({ i, progress, texs }) {
  const geo = useMemo(() => { const g = new THREE.PlaneGeometry(W, HH, SEG, 1); g.translate(W / 2, 0, 0); return g }, [])
  const base = useMemo(() => Float32Array.from(geo.attributes.position.array), [geo])
  const last = useRef(-1)
  useFrame(() => {
    const p = progress.get()
    const s = 0.12 + i * 0.2
    const k = ease(cl((p - s) / 0.15))
    if (Math.abs(k - last.current) < 1e-4) return
    last.current = k
    const th = k * Math.PI, bend = 0.9 * Math.sin(th) / W
    const pos = geo.attributes.position.array
    const zOff = k < 0.5 ? (LEAVES.length - i) * 0.006 : (i + 1) * 0.006
    for (let v = 0; v < pos.length; v += 3) {
      const x = base[v]
      let px, pz
      if (Math.abs(bend) < 1e-5) { px = x * Math.cos(th); pz = x * Math.sin(th) }
      else { px = (Math.sin(th + bend * x) - Math.sin(th)) / bend; pz = (Math.cos(th) - Math.cos(th + bend * x)) / bend }
      pos[v] = px; pos[v + 2] = pz + zOff
    }
    geo.attributes.position.needsUpdate = true
    geo.computeVertexNormals()
  })
  return (
    <group>
      <mesh geometry={geo}><meshStandardMaterial map={texs[0].t} side={THREE.FrontSide} roughness={0.85} /></mesh>
      <mesh geometry={geo}><meshStandardMaterial map={texs[1].t} side={THREE.BackSide} roughness={0.85} /></mesh>
    </group>
  )
}

function Magazine({ progress }) {
  const g = useRef()
  const { size } = useThree()
  const texs = useMemo(() => ({ leaves: LEAVES.map(([f, bk]) => [makeTex(f, false), makeTex(bk, true)]), base: makeTex(BASE, false) }), [])
  useEffect(() => {
    let alive = true
    const all = [...texs.leaves.flat(), texs.base]
    Promise.all([document.fonts.load('100px "Yeseva One"'), document.fonts.load('500 30px Commissioner'), document.fonts.load('600 30px Commissioner')]).then(() => alive && all.forEach(x => x.draw())).catch(() => {})
    return () => { alive = false }
  }, [])
  useFrame((st, dt) => {
    const p = progress.get(), mob = size.width < 768
    const open = cl((p - 0.12) / 0.12)
    const sc = mob ? 0.62 : 1
    g.current.scale.setScalar(THREE.MathUtils.damp(g.current.scale.x, sc, 6, dt))
    const tx = (mob ? 0 : 1.55) + THREE.MathUtils.lerp(-W / 2, 0, ease(open)) * sc
    g.current.position.x = THREE.MathUtils.damp(g.current.position.x, tx, 6, dt)
    g.current.position.y = mob ? -1.05 : -0.1
    g.current.rotation.x = THREE.MathUtils.damp(g.current.rotation.x, -0.32 + st.pointer.y * 0.06, 4, dt)
    g.current.rotation.y = THREE.MathUtils.damp(g.current.rotation.y, st.pointer.x * 0.12, 4, dt)
    g.current.rotation.z = THREE.MathUtils.damp(g.current.rotation.z, (1 - open) * 0.06, 4, dt)
  })
  return (
    <group ref={g}>
      <mesh position={[W / 2, 0, 0]}><planeGeometry args={[W, HH]} /><meshStandardMaterial map={texs.base.t} roughness={0.85} /></mesh>
      <mesh position={[W / 2, 0, -0.02]}><boxGeometry args={[W, HH, 0.03]} /><meshStandardMaterial color="#d9c7a6" roughness={0.9} /></mesh>
      {LEAVES.map((_, i) => <Leaf key={i} i={i} progress={progress} texs={texs.leaves[i]} />)}
      <ContactShadows position={[0, -HH / 2 - 0.05, 0]} rotation-x={0} opacity={0.35} scale={6} blur={2.5} far={1.5} resolution={256} color="#5a3a1a" />
    </group>
  )
}

export default function MagScene({ progress, active }) {
  return (
    <Canvas frameloop={active ? 'always' : 'never'} dpr={[1, 1.6]} camera={{ position: [0, 0.2, 5.6], fov: 38 }} gl={{ antialias: true, alpha: true }} style={{ pointerEvents: 'none' }}
      eventSource={typeof document !== 'undefined' ? document.getElementById('root') : undefined} eventPrefix="client">
      <ambientLight intensity={0.55} />
      <directionalLight position={[-3, 4, 5]} intensity={1.6} color="#fff2dc" />
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={1.4} position={[0, 4, 4]} scale={[8, 2, 1]} />
        <Lightformer form="rect" intensity={0.8} color="#ffd9a8" position={[-5, 0, 2]} rotation-y={Math.PI / 2} scale={[6, 2, 1]} />
      </Environment>
      <Magazine progress={progress} />
    </Canvas>
  )
}
