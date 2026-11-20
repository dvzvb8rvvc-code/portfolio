import * as THREE from 'three'
import React, { useMemo, useRef, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, useTexture } from '@react-three/drei'
import { img } from './data'

/* ============================================================
   Procedural Tuscan palazzo that splits into its four floors.
   Every floor is a hollow band of textured walls with a floor-plan
   slab at its base — when the band above lifts, the plan shows.
   ============================================================ */
export const W = 4.2, D = 2.6
// schematic layouts (normalised x-ranges across the facade). Not to scale.
export const PLAN = [
  { id: 'cellar', h: 0.62, bays: 7, rooms: [{ a: 0, b: 0.44, l: { en: 'SPA SUITES', it: 'SUITE SPA' } }, { a: 0.44, b: 0.56, core: 1 }, { a: 0.56, b: 1, l: { en: 'WINE CELLARS', it: 'CANTINE' } }] },
  { id: 'ground', h: 1.0, bays: 7, rooms: [{ a: 0, b: 0.4, u: 1, m2: 83 }, { a: 0.4, b: 0.6, core: 1, l: { en: 'SALON', it: 'SALONE' } }, { a: 0.6, b: 1, u: 2, m2: 84 }] },
  { id: 'nobile', h: 1.22, bays: 7, rooms: [{ a: 0, b: 0.33, u: 3, m2: 68 }, { a: 0.33, b: 0.45, core: 1 }, { a: 0.45, b: 0.7, u: 4, m2: 58 }, { a: 0.7, b: 1, u: 5, m2: 79 }] },
  { id: 'attic', h: 0.72, bays: 7, rooms: [{ a: 0, b: 0.82, u: 6, m2: 102 }, { a: 0.82, b: 1, core: 1 }] },
]
const GAP = 1.0
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const smooth = (a, b, v) => { const x = clamp((v - a) / (b - a)); return x * x * (3 - 2 * x) }

function rng(seed) { return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 } }
function toTex(c, repeat) {
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping }
  return t
}

function archPath(g, x, yTop, w, yBot) {
  const r = w / 2
  g.beginPath(); g.moveTo(x - r, yBot); g.lineTo(x - r, yTop + r); g.arc(x, yTop + r, r, Math.PI, 0); g.lineTo(x + r, yBot); g.closePath()
}
function glass(g, x, y0, y1, lit, r) {
  const gr = g.createLinearGradient(0, y0, 0, y1)
  if (lit) { gr.addColorStop(0, '#ffd99a'); gr.addColorStop(1, '#b8692c') } else { gr.addColorStop(0, '#2f3a44'); gr.addColorStop(1, '#12171c') }
  return gr
}

/* facade texture for one wall of one floor */
function facade(kind, wu, hu, bays, seed, lite, centerDoor) {
  const s = lite ? 130 : 230
  const cw = Math.round(wu * s), ch = Math.round(hu * s)
  const c = document.createElement('canvas'); c.width = cw; c.height = ch
  const g = c.getContext('2d'), R = rng(seed)
  const base = { cellar: '#9a8a70', ground: '#c7b08d', nobile: '#d3a675', attic: '#cda172' }[kind]
  g.fillStyle = base; g.fillRect(0, 0, cw, ch)
  // mottled lime plaster / stone
  for (let i = 0; i < (cw * ch) / (lite ? 220 : 120); i++) {
    g.fillStyle = R() < 0.5 ? `rgba(70,45,20,${R() * 0.07})` : `rgba(255,244,225,${R() * 0.08})`
    const r = R() * s * 0.14; g.fillRect(R() * cw, R() * ch, r, r * 0.55)
  }
  // weathering streaks
  for (let i = 0; i < 14; i++) { g.fillStyle = `rgba(60,40,25,${0.03 + R() * 0.04})`; g.fillRect(R() * cw, 0, 2 + R() * s * 0.05, ch * (0.3 + R() * 0.7)) }
  g.lineWidth = Math.max(1, s * 0.008)
  if (kind === 'cellar') { // rusticated blocks
    const bh = s * 0.15
    for (let y = 0, row = 0; y < ch; y += bh, row++) {
      g.strokeStyle = 'rgba(35,25,15,.45)'; g.beginPath(); g.moveTo(0, y); g.lineTo(cw, y); g.stroke()
      const bw = s * 0.42
      for (let x = (row % 2) * bw * 0.5; x < cw; x += bw) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + bh); g.stroke() }
      g.strokeStyle = 'rgba(255,240,215,.18)'; g.beginPath(); g.moveTo(0, y + 2); g.lineTo(cw, y + 2); g.stroke()
    }
  }
  if (kind === 'ground') { // smooth bugnato grooves
    for (let y = s * 0.13; y < ch; y += s * 0.13) { g.strokeStyle = 'rgba(40,28,18,.32)'; g.beginPath(); g.moveTo(0, y); g.lineTo(cw, y); g.stroke(); g.strokeStyle = 'rgba(255,245,225,.2)'; g.beginPath(); g.moveTo(0, y + 2); g.lineTo(cw, y + 2); g.stroke() }
  }
  const stone = '#e8dcc6', bay = cw / bays
  for (let i = 0; i < bays; i++) {
    const x = (i + 0.5) * bay, lit = R() < 0.38
    if (kind === 'cellar') {
      const w = s * 0.24, h = s * 0.17, y = ch * 0.42
      g.fillStyle = stone; g.fillRect(x - w / 2 - s * 0.03, y - s * 0.03, w + s * 0.06, h + s * 0.06)
      g.fillStyle = glass(g, x, y, y + h, lit && R() < 0.5); g.fillRect(x - w / 2, y, w, h)
      g.strokeStyle = '#1b1510'; g.lineWidth = s * 0.012
      for (let k = 1; k < 4; k++) { g.beginPath(); g.moveTo(x - w / 2 + (w * k) / 4, y); g.lineTo(x - w / 2 + (w * k) / 4, y + h); g.stroke() }
    } else if (kind === 'ground') {
      const door = centerDoor && i === (bays - 1) / 2
      const w = door ? s * 0.42 : s * 0.3, yTop = door ? ch * 0.14 : ch * 0.22, yBot = door ? ch : ch * 0.86
      g.fillStyle = stone; archPath(g, x, yTop - s * 0.05, w + s * 0.1, yBot); g.fill()
      g.fillStyle = door ? '#3d2a1c' : glass(g, x, yTop, yBot, lit); archPath(g, x, yTop, w, yBot); g.fill()
      if (door) { g.strokeStyle = 'rgba(0,0,0,.45)'; g.lineWidth = s * 0.01; g.beginPath(); g.moveTo(x, yTop + w / 2); g.lineTo(x, yBot); g.stroke(); g.fillStyle = 'rgba(255,215,150,.85)'; g.fillRect(x - w * 0.3, yTop + w * 0.15, w * 0.6, s * 0.05) }
      else { g.strokeStyle = 'rgba(232,220,198,.8)'; g.lineWidth = s * 0.01; g.beginPath(); g.moveTo(x, yTop); g.lineTo(x, yBot); g.moveTo(x - w / 2, yTop + w * 0.9); g.lineTo(x + w / 2, yTop + w * 0.9); g.stroke() }
      g.fillStyle = '#efe4cf'; g.beginPath(); g.moveTo(x - s * 0.04, yTop - s * 0.06); g.lineTo(x + s * 0.04, yTop - s * 0.06); g.lineTo(x + s * 0.03, yTop + s * 0.04); g.lineTo(x - s * 0.03, yTop + s * 0.04); g.fill()
    } else if (kind === 'nobile') {
      const w = s * 0.26, yTop = ch * 0.24, yBot = ch * 0.84
      // pediment
      g.fillStyle = '#eadfca'
      if (i % 2) { g.beginPath(); g.moveTo(x - w * 0.85, yTop - s * 0.04); g.lineTo(x, yTop - s * 0.17); g.lineTo(x + w * 0.85, yTop - s * 0.04); g.closePath(); g.fill() }
      else { g.beginPath(); g.ellipse(x, yTop - s * 0.03, w * 0.8, s * 0.1, 0, Math.PI, 0); g.fill() }
      g.fillStyle = 'rgba(40,25,15,.35)'; g.fillRect(x - w * 0.85, yTop - s * 0.04, w * 1.7, s * 0.02)
      // shutters
      if (!lit) { g.fillStyle = '#5d6248'; g.fillRect(x - w / 2 - w * 0.42, yTop + s * 0.02, w * 0.4, yBot - yTop - s * 0.02); g.fillRect(x + w / 2 + w * 0.02, yTop + s * 0.02, w * 0.4, yBot - yTop - s * 0.02); g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 1; for (let yy = yTop + s * 0.04; yy < yBot; yy += s * 0.025) { g.beginPath(); g.moveTo(x - w / 2 - w * 0.42, yy); g.lineTo(x - w / 2 - w * 0.02, yy); g.moveTo(x + w / 2 + w * 0.02, yy); g.lineTo(x + w / 2 + w * 0.42, yy); g.stroke() } }
      g.fillStyle = stone; archPath(g, x, yTop - s * 0.035, w + s * 0.07, yBot + s * 0.02); g.fill()
      g.fillStyle = glass(g, x, yTop, yBot, lit); archPath(g, x, yTop, w, yBot); g.fill()
      g.strokeStyle = lit ? 'rgba(120,70,30,.6)' : 'rgba(220,210,190,.5)'; g.lineWidth = s * 0.008
      g.beginPath(); g.moveTo(x, yTop + w * 0.2); g.lineTo(x, yBot); for (let k = 1; k < 4; k++) { const yy = yTop + w / 2 + ((yBot - yTop - w / 2) * k) / 4; g.moveTo(x - w / 2, yy); g.lineTo(x + w / 2, yy) } g.stroke()
      // balcony sill
      g.fillStyle = '#efe4cf'; g.fillRect(x - w * 0.8, yBot, w * 1.6, s * 0.035); g.fillStyle = 'rgba(30,20,10,.35)'; g.fillRect(x - w * 0.8, yBot + s * 0.035, w * 1.6, s * 0.015)
    } else {
      const w = s * 0.2, h = s * 0.2, y = ch * 0.3
      g.fillStyle = stone; g.fillRect(x - w / 2 - s * 0.03, y - s * 0.03, w + s * 0.06, h + s * 0.06)
      g.fillStyle = glass(g, x, y, y + h, lit); g.fillRect(x - w / 2, y, w, h)
      g.strokeStyle = 'rgba(220,210,190,.5)'; g.lineWidth = s * 0.008; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + h); g.stroke()
    }
  }
  // string course at the top (+ modillions under the cornice for the attic)
  g.fillStyle = 'rgba(30,20,12,.35)'; g.fillRect(0, s * 0.055, cw, s * 0.018)
  g.fillStyle = '#e6d9c1'; g.fillRect(0, 0, cw, s * 0.055)
  if (kind === 'attic') { g.fillStyle = '#d9caae'; for (let x = s * 0.06; x < cw; x += s * 0.16) { g.fillRect(x, s * 0.055, s * 0.06, s * 0.08) } g.fillStyle = 'rgba(30,20,12,.3)'; for (let x = s * 0.06; x < cw; x += s * 0.16) g.fillRect(x + s * 0.06, s * 0.055, s * 0.012, s * 0.08) }
  if (kind === 'cellar') { g.fillStyle = 'rgba(20,14,8,.35)'; g.fillRect(0, ch - s * 0.05, cw, s * 0.05) }
  return toTex(c)
}

/* the floor-plan "cap" for each band */
function planTex(fl, lang, lite) {
  const s = lite ? 160 : 260
  const cw = Math.round(W * s), ch = Math.round(D * s)
  const c = document.createElement('canvas'); c.width = cw; c.height = ch
  const g = c.getContext('2d')
  g.fillStyle = '#e9dcc5'; g.fillRect(0, 0, cw, ch)
  // terracotta floor grid
  g.strokeStyle = 'rgba(150,100,60,.12)'; g.lineWidth = 1
  for (let x = 0; x < cw; x += s * 0.12) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, ch); g.stroke() }
  for (let y = 0; y < ch; y += s * 0.12) { g.beginPath(); g.moveTo(0, y); g.lineTo(cw, y); g.stroke() }
  const pad = s * 0.07
  fl.rooms.forEach((r, k) => {
    const x0 = pad + r.a * (cw - 2 * pad), x1 = pad + r.b * (cw - 2 * pad)
    if (r.core) { // hatched stair core
      g.save(); g.beginPath(); g.rect(x0, pad, x1 - x0, ch - 2 * pad); g.clip()
      g.strokeStyle = 'rgba(21,20,18,.35)'; g.lineWidth = s * 0.006
      for (let t = -ch; t < cw; t += s * 0.06) { g.beginPath(); g.moveTo(x0 + t, pad); g.lineTo(x0 + t + ch, ch); g.stroke() }
      g.restore()
      g.fillStyle = '#efe7d8'; g.fillRect(x0 + (x1 - x0) * 0.18, ch * 0.32, (x1 - x0) * 0.64, ch * 0.36)
      g.strokeStyle = '#151412'; g.lineWidth = s * 0.006
      for (let y = ch * 0.32; y <= ch * 0.68; y += ch * 0.045) { g.beginPath(); g.moveTo(x0 + (x1 - x0) * 0.18, y); g.lineTo(x0 + (x1 - x0) * 0.82, y); g.stroke() }
    } else {
      g.fillStyle = r.u ? (k % 2 ? 'rgba(176,106,53,.42)' : 'rgba(195,161,94,.5)') : 'rgba(39,65,79,.3)'
      g.fillRect(x0, pad, x1 - x0, ch - 2 * pad)
      // inner partitions
      g.strokeStyle = 'rgba(21,20,18,.55)'; g.lineWidth = s * 0.008
      g.beginPath(); g.moveTo(x0, ch * 0.58); g.lineTo(x0 + (x1 - x0) * 0.55, ch * 0.58); g.moveTo(x0 + (x1 - x0) * 0.55, ch * 0.58); g.lineTo(x0 + (x1 - x0) * 0.55, ch - pad); g.stroke()
    }
    // labels
    g.fillStyle = '#151412'; g.textAlign = 'center'
    const cx = (x0 + x1) / 2
    if (r.u) {
      g.font = `800 ${s * 0.36}px "Inter Tight", Arial, sans-serif`; g.fillText('AP.' + r.u, cx, ch * 0.42)
      g.font = `600 ${s * 0.19}px "Inter Tight", Arial, sans-serif`; g.fillStyle = '#7a4520'; g.fillText(r.m2 + ' m²', cx, ch * 0.42 + s * 0.26)
    } else if (r.l) {
      g.font = `800 ${s * (r.core ? 0.1 : 0.17)}px "Inter Tight", Arial, sans-serif`; g.fillText(r.l[lang] || r.l.en, cx, r.core ? ch * 0.25 : ch * 0.4)
    }
    if (k > 0) { g.strokeStyle = '#151412'; g.lineWidth = s * 0.018; g.beginPath(); g.moveTo(x0, pad); g.lineTo(x0, ch - pad); g.stroke() }
  })
  g.strokeStyle = '#151412'; g.lineWidth = s * 0.035; g.strokeRect(pad, pad, cw - 2 * pad, ch - 2 * pad)
  // window openings in the outer wall
  g.fillStyle = '#efe7d8'
  for (let i = 0; i < 7; i++) { const x = pad + ((i + 0.5) / 7) * (cw - 2 * pad); g.fillRect(x - s * 0.1, pad - s * 0.02, s * 0.2, s * 0.04); g.fillRect(x - s * 0.1, ch - pad - s * 0.02, s * 0.2, s * 0.04) }
  return toTex(c)
}

function roofTex() {
  const c = document.createElement('canvas'); c.width = c.height = 512
  const g = c.getContext('2d'), R = rng(7)
  g.fillStyle = '#9a4b2a'; g.fillRect(0, 0, 512, 512)
  const cols = 32, rows = 22
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
    const x = (i / cols) * 512, y = (j / rows) * 512, w = 512 / cols, h = 512 / rows
    const l = 33 + R() * 12, hue = 13 + R() * 9
    const gr = g.createLinearGradient(x, 0, x + w, 0)
    gr.addColorStop(0, `hsl(${hue},42%,${l - 12}%)`); gr.addColorStop(0.5, `hsl(${hue},46%,${l + 6}%)`); gr.addColorStop(1, `hsl(${hue},42%,${l - 14}%)`)
    g.fillStyle = gr; g.fillRect(x + 1, y + (i % 2) * h * 0.5, w - 2, h - 1)
    if (R() < 0.12) { g.fillStyle = 'rgba(60,70,40,.25)'; g.fillRect(x, y, w, h) }
  }
  return toTex(c, true)
}

function hipGeometry(w, d, h) {
  const A = [-w, 0, d], B = [w, 0, d], C = [w, 0, -d], Dd = [-w, 0, -d], R1 = [-w + d, h, 0], R2 = [w - d, h, 0]
  const tris = [A, B, R2, A, R2, R1, B, C, R2, C, Dd, R1, C, R1, R2, Dd, A, R1]
  const pos = new Float32Array(tris.flat()), uv = new Float32Array((tris.length) * 2)
  tris.forEach((p, i) => { uv[i * 2] = p[0] * 0.55; uv[i * 2 + 1] = p[2] * 0.55 + p[1] * 0.8 })
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
  geo.computeVertexNormals(); return geo
}

const plaster = new THREE.MeshStandardMaterial({ color: '#e7dccb', roughness: 0.9 })
const stoneMat = new THREE.MeshStandardMaterial({ color: '#e2d4bb', roughness: 0.8 })
const darkMat = new THREE.MeshStandardMaterial({ color: '#4a3b2c', roughness: 1 })

function Ring({ y, h, o, mat }) {
  const t = 0.07 + o
  return (
    <group position-y={y}>
      <mesh position={[0, 0, D / 2 + o - t / 2]} material={mat}><boxGeometry args={[W + 2 * o, h, t]} /></mesh>
      <mesh position={[0, 0, -D / 2 - o + t / 2]} material={mat}><boxGeometry args={[W + 2 * o, h, t]} /></mesh>
      <mesh position={[W / 2 + o - t / 2, 0, 0]} material={mat}><boxGeometry args={[t, h, D]} /></mesh>
      <mesh position={[-W / 2 - o + t / 2, 0, 0]} material={mat}><boxGeometry args={[t, h, D]} /></mesh>
    </group>
  )
}

function Floor({ fl, i, lang, lite, fref }) {
  const t = 0.07
  const tex = useMemo(() => ({
    front: facade(fl.id, W, fl.h, fl.bays, 11 + i * 7, lite, true),
    back: facade(fl.id, W, fl.h, fl.bays, 31 + i * 5, lite, false),
    side: facade(fl.id, D, fl.h, 4, 51 + i * 3, lite, false),
  }), [fl, i, lite])
  const plan = useMemo(() => planTex(fl, lang, lite), [fl, lang, lite])
  useEffect(() => () => { Object.values(tex).forEach(x => x.dispose()) }, [tex])
  useEffect(() => () => plan.dispose(), [plan])
  const mats = useMemo(() => {
    const m = k => new THREE.MeshStandardMaterial({ map: tex[k], roughness: 0.85 })
    const edge = new THREE.MeshStandardMaterial({ color: { cellar: '#9a8a70', ground: '#c7b08d', nobile: '#d3a675', attic: '#cda172' }[fl.id], roughness: 0.9 })
    return { front: [edge, edge, stoneMat, plaster, m('front'), plaster], back: [edge, edge, stoneMat, plaster, m('back'), plaster], side: [edge, edge, stoneMat, plaster, m('side'), plaster] }
  }, [tex, fl.id])
  const h = fl.h
  return (
    <group ref={fref}>
      <mesh position={[0, h / 2, D / 2 - t / 2]} material={mats.front}><boxGeometry args={[W, h, t]} /></mesh>
      <mesh position={[0, h / 2, -D / 2 + t / 2]} rotation-y={Math.PI} material={mats.back}><boxGeometry args={[W, h, t]} /></mesh>
      <mesh position={[W / 2 - t / 2, h / 2, 0]} rotation-y={Math.PI / 2} material={mats.side}><boxGeometry args={[D - 2 * t, h, t]} /></mesh>
      <mesh position={[-W / 2 + t / 2, h / 2, 0]} rotation-y={-Math.PI / 2} material={mats.side}><boxGeometry args={[D - 2 * t, h, t]} /></mesh>
      {/* base slab */}
      <mesh position={[0, -0.03, 0]} material={stoneMat}><boxGeometry args={[W + 0.04, 0.06, D + 0.04]} /></mesh>
      {/* the cut cap: floor plan on top of the band, with raised walls */}
      <mesh position={[0, h - 0.004, 0]} rotation-x={-Math.PI / 2}><planeGeometry args={[W - 0.02, D - 0.02]} /><meshStandardMaterial map={plan} roughness={0.95} /></mesh>
      {fl.rooms.slice(1).map((r, k) => (
        <mesh key={k} position={[-W / 2 + 0.07 + r.a * (W - 0.14), h + 0.03, 0]} material={plaster}><boxGeometry args={[0.035, 0.07, D - 0.14]} /></mesh>
      ))}
      {/* string course / plinth / cornice as hollow rings so the plan stays visible */}
      <Ring y={h - 0.02} h={0.05} o={0.04} mat={stoneMat} />
      {i === 0 && <Ring y={0.05} h={0.1} o={0.05} mat={darkMat} />}
      {i === 3 && <Ring y={h + 0.04} h={0.1} o={0.12} mat={stoneMat} />}
    </group>
  )
}

function Roof({ rref }) {
  const tex = useMemo(roofTex, [])
  const geo = useMemo(() => hipGeometry(W / 2 + 0.16, D / 2 + 0.16, 0.85), [])
  return (
    <group ref={rref}>
      <mesh geometry={geo}><meshStandardMaterial map={tex} roughness={0.85} side={THREE.DoubleSide} /></mesh>
      {/* chimneys */}
      {[[-1.1, 0.25], [1.25, -0.3]].map(([x, z], k) => (
        <mesh key={k} position={[x, 0.75, z]} material={stoneMat}><boxGeometry args={[0.16, 0.5, 0.16]} /></mesh>
      ))}
    </group>
  )
}

const V = new THREE.Vector3()
function Building({ progress, hud, lang, lite }) {
  const root = useRef(), floors = [useRef(), useRef(), useRef(), useRef()], roof = useRef()
  const cur = useRef(progress.get())
  const { size, camera } = useThree()
  const tops = useMemo(() => { let y = 0; return PLAN.map(f => { const b = y; y += f.h; return b }) }, [])
  const H0 = PLAN.reduce((a, f) => a + f.h, 0)
  useFrame((st, dt) => {
    cur.current = THREE.MathUtils.damp(cur.current, progress.get(), 5, Math.min(dt, 0.05))
    const p = cur.current, e = smooth(0.14, 0.56, p), intro = smooth(0, 0.14, p)
    const mob = size.width < 768
    floors.forEach((f, i) => {
      if (!f.current) return
      f.current.position.y = tops[i] + i * GAP * e
      f.current.rotation.y = (i - 1.5) * 0.16 * e
    })
    if (roof.current) { roof.current.position.y = H0 + 0.09 + (4 * GAP + 0.35) * e; roof.current.rotation.y = 2.5 * 0.16 * e }
    const g = root.current
    const sc = mob ? 0.56 : 1
    g.scale.setScalar(sc)
    g.position.set(mob ? -0.85 : -1.15, (-(H0 + 0.8) / 2 - 2 * GAP * e) * sc - (1 - intro) * 0.5, 0)
    g.rotation.y = -0.95 + intro * 0.38 + p * 0.28 + st.pointer.x * 0.06
    camera.position.set(0, 1.2 + 7.2 * e, 12.5 + 5.2 * e)
    camera.lookAt(0, 0.1 * e, 0)
    // HUD: project the front-right corner of each band and drive leader lines
    if (hud.current) {
      const lx0 = size.width * (mob ? 0.6 : 0.64)
      floors.forEach((f, i) => {
        const L = hud.current.labels[i], Ln = hud.current.lines[i]
        if (!f.current || !L || !Ln) return
        f.current.localToWorld(V.set(W / 2, PLAN[i].h * 0.55, D / 2))
        V.project(camera)
        const ax = (V.x + 1) / 2 * size.width, ay = (1 - V.y) / 2 * size.height
        const lx = Math.max(lx0, ax + 30)
        L.style.transform = `translate3d(${lx}px,${ay}px,0) translateY(-50%)`
        const o = clamp((e - 0.5 - (3 - i) * 0.08) / 0.16)
        Ln.style.transform = `translate3d(${ax}px,${ay}px,0) scaleX(${o})`
        Ln.style.width = Math.max(0, lx - ax - 10) + 'px'
      })
      hud.current.update && hud.current.update(e)
    }
  })
  return (
    <group ref={root}>
      {PLAN.map((fl, i) => <Floor key={fl.id} fl={fl} i={i} lang={lang} lite={lite} fref={floors[i]} />)}
      <Roof rref={roof} />
    </group>
  )
}

export default function Exploded({ progress, hud, lang, active, lite }) {
  return (
    <Canvas frameloop={active ? 'always' : 'never'} dpr={[1, lite ? 1.25 : 1.6]} camera={{ position: [0, 1.2, 12.5], fov: 34 }} gl={{ antialias: true, alpha: true }} style={{ pointerEvents: 'none' }}>
      <ambientLight intensity={0.55} />
      <directionalLight position={[5, 7, 6]} intensity={2.1} color="#ffe2bf" />
      <directionalLight position={[-6, 2, -3]} intensity={0.5} color="#9fb6d6" />
      <Building progress={progress} hud={hud} lang={lang} lite={lite} />
      <Environment resolution={64} frames={1}>
        <Lightformer form="rect" intensity={2} position={[0, 5, 3]} scale={[10, 3, 1]} />
        <Lightformer form="rect" intensity={1.5} position={[-5, 1, 2]} rotation-y={Math.PI / 2} scale={[6, 3, 1]} color="#ffcf9a" />
      </Environment>
    </Canvas>
  )
}

/* ============================================================
   LOOK UP — the frescoed ceiling projected onto a dome.
   Planar UVs from below: at the zenith you see the photo exactly
   as it was shot (looking straight up), rim falls into shadow.
   ============================================================ */
const domeVert = `varying vec2 vUv; varying float vH; void main(){ vUv = uv; vH = position.y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`
const domeFrag = `uniform sampler2D map; uniform float uR; uniform float uGlow; varying vec2 vUv; varying float vH;
void main(){ vec3 c = texture2D(map, vUv).rgb; c = pow(c, vec3(2.2));
  float h = clamp(vH / uR, 0.0, 1.0); float k = smoothstep(0.0, 0.3, h);
  vec2 q = vUv - .5; float rr = length(q) * 2.0;
  vec3 col = c * mix(0.05, 1.0, k) * (1.0 + uGlow * (1.0 - rr) * 0.35);
  col = mix(vec3(0.03,0.04,0.07), col, k);
  gl_FragColor = vec4(pow(col, vec3(1.0/2.2)), 1.0); }`

function Dome({ progress, drag }) {
  const tex = useTexture(img(154))
  const R = 6
  const geo = useMemo(() => {
    const g = new THREE.SphereGeometry(R, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2)
    const p = g.attributes.position, uv = g.attributes.uv
    for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / (2 * R) * 0.98 + 0.5, 0.5 - p.getZ(i) / (2 * R) * 0.98)
    uv.needsUpdate = true; return g
  }, [])
  const mat = useMemo(() => new THREE.ShaderMaterial({ uniforms: { map: { value: tex }, uR: { value: R }, uGlow: { value: 0 } }, vertexShader: domeVert, fragmentShader: domeFrag, side: THREE.BackSide }), [tex])
  const cur = useRef(0), yaw = useRef(0)
  useFrame((st, dt) => {
    dt = Math.min(dt, 0.05)
    cur.current = THREE.MathUtils.damp(cur.current, progress.get(), 3, dt)
    const s = smooth(0.08, 0.8, cur.current)
    yaw.current = THREE.MathUtils.damp(yaw.current, drag.current.yaw, 4, dt)
    drag.current.yaw += dt * 0.025
    const cam = st.camera
    cam.rotation.order = 'YXZ'
    cam.position.set(0, -4.6, 0)
    cam.rotation.set(0.3 + s * (Math.PI / 2 - 0.301), yaw.current, 0)
    cam.fov = 72 - s * 8; cam.updateProjectionMatrix()
    mat.uniforms.uGlow.value = s
  })
  return (
    <group>
      <mesh geometry={geo} material={mat} />
      {/* gilded cornice ring at the springing of the vault */}
      <mesh rotation-x={Math.PI / 2}><torusGeometry args={[R - 0.05, 0.09, 8, 96]} /><meshBasicMaterial color="#8a6f3c" /></mesh>
      <mesh rotation-x={Math.PI / 2} position-y={-0.3}><torusGeometry args={[R - 0.02, 0.04, 6, 96]} /><meshBasicMaterial color="#4a3b22" /></mesh>
      {/* dark walls below */}
      <mesh position-y={-5}><cylinderGeometry args={[R, R, 10, 48, 1, true]} /><meshBasicMaterial color="#0a0c12" side={THREE.BackSide} /></mesh>
    </group>
  )
}

export function Vault({ progress, drag, active }) {
  return (
    <Canvas frameloop={active ? 'always' : 'never'} dpr={[1, 1.5]} camera={{ position: [0, 0, 0], fov: 78, near: 0.1, far: 50 }} gl={{ antialias: true }}>
      <color attach="background" args={['#07090f']} />
      <React.Suspense fallback={null}><Dome progress={progress} drag={drag} /></React.Suspense>
    </Canvas>
  )
}
