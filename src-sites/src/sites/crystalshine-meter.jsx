import React, { useRef, useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* Shine meter: rub the dull car — each pass polishes it a little more (dull → hazy → glossy),
   a light sweep runs over the polished paint, sparkles pop, at 100% crystals burst out. */
const W = 1000, HH = 420, GX = 100, GY = 42
const BODY = 'M60 300 L62 252 Q66 222 112 213 L300 190 Q362 122 452 106 L622 103 Q702 110 762 176 L900 196 Q952 206 954 252 L952 300 Z'
const WIN1 = 'M334 192 Q384 138 452 124 L540 122 L540 190 Z'
const WIN2 = 'M560 122 L620 122 Q688 128 732 180 L560 190 Z'
const WHEELS = [[232, 300], [790, 300]]
const PRISM = ['#7af0ff', '#b48cff', '#ff8ad8', '#ffe27a', '#8affc1']

function star(ctx, x, y, r, a) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.beginPath()
  for (let i = 0; i < 8; i++) { const rr = i % 2 ? r * 0.22 : r; const t = i * Math.PI / 4; ctx.lineTo(Math.cos(t) * rr, Math.sin(t) * rr) }
  ctx.closePath(); ctx.fill(); ctx.restore()
}

export default function ShineMeter({ onDone }) {
  const cv = useRef(null), wrap = useRef(null)
  const st = useRef(null)
  const [pct, setPct] = useState(0)
  const [done, setDone] = useState(false)
  const [burst, setBurst] = useState(0)

  const init = useCallback(() => {
    const body = new Path2D(BODY), probe = document.createElement('canvas').getContext('2d')
    const inside = new Uint8Array(GX * GY); let n = 0
    for (let j = 0; j < GY; j++) for (let i = 0; i < GX; i++) {
      const x = (i + 0.5) * W / GX, y = (j + 0.5) * HH / GY
      if (probe.isPointInPath(body, x, y)) { inside[j * GX + i] = 1; n++ }
    }
    const near = new Uint8Array(GX * GY)
    for (let j = 0; j < GY; j++) for (let i = 0; i < GX; i++) for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) { const a = i + di, b = j + dj; if (a >= 0 && b >= 0 && a < GX && b < GY && inside[b * GX + a]) near[j * GX + i] = 1 }
    const mask = document.createElement('canvas'); mask.width = GX; mask.height = GY
    const gloss = document.createElement('canvas'); gloss.width = W; gloss.height = HH
    const noise = document.createElement('canvas'); noise.width = W; noise.height = HH
    const nx = noise.getContext('2d')
    for (let k = 0; k < 2600; k++) { nx.fillStyle = `rgba(${k % 3 ? '70,60,50' : '255,255,255'},${0.05 + Math.random() * 0.12})`; nx.beginPath(); nx.arc(Math.random() * W, Math.random() * HH, Math.random() * 3 + 0.5, 0, 6.3); nx.fill() }
    st.current = { near, body, win1: new Path2D(WIN1), win2: new Path2D(WIN2), inside, n, polish: new Float32Array(GX * GY), mask, gloss, noise, parts: [], ptr: null, last: null, done: false, img: mask.getContext('2d').createImageData(GX, GY) }
  }, [])

  useEffect(() => {
    init()
    const c = cv.current, ctx = c.getContext('2d')
    let id, visible = true, frame = 0
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) { cancelAnimationFrame(id); id = requestAnimationFrame(draw) } })
    io.observe(c)
    const resize = () => {
      const r = c.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1)
      c.width = Math.round(r.width * d); c.height = Math.round(r.height * d)
    }
    resize(); addEventListener('resize', resize)
    function draw(time) {
      const S = st.current; if (!S) return
      const t = time / 1000, sc = c.width / W
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, c.width, c.height); ctx.setTransform(sc, 0, 0, sc, 0, 0)
      /* ground shadow */
      const sh = ctx.createRadialGradient(505, 330, 10, 505, 330, 470); sh.addColorStop(0, 'rgba(0,10,40,.45)'); sh.addColorStop(1, 'rgba(0,10,40,0)')
      ctx.fillStyle = sh; ctx.fillRect(0, 290, W, 120)
      /* dull layer */
      const dg = ctx.createLinearGradient(0, 100, 0, 300); dg.addColorStop(0, '#9aa0a6'); dg.addColorStop(1, '#6b7077')
      ctx.fillStyle = dg; ctx.fill(S.body)
      ctx.save(); ctx.clip(S.body); ctx.drawImage(S.noise, 0, 0); ctx.restore()
      ctx.fillStyle = '#5a5f66'; ctx.fill(S.win1); ctx.fill(S.win2)
      /* gloss layer, masked by polish */
      const g = S.gloss.getContext('2d')
      g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, W, HH)
      const gg = g.createLinearGradient(0, 100, 0, 300)
      gg.addColorStop(0, '#6fa8ff'); gg.addColorStop(0.32, '#1d4fd6'); gg.addColorStop(0.5, '#e8f3ff'); gg.addColorStop(0.53, '#0f2c86'); gg.addColorStop(1, '#040f33')
      g.fillStyle = gg; g.fill(S.body)
      g.fillStyle = '#071233'; g.fill(S.win1); g.fill(S.win2)
      g.save(); g.clip(S.body)
      g.globalCompositeOperation = 'source-atop'
      g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.moveTo(400, 100); g.lineTo(440, 100); g.lineTo(380, 200); g.lineTo(350, 200); g.fill()
      g.beginPath(); g.moveTo(600, 100); g.lineTo(612, 100); g.lineTo(560, 200); g.lineTo(552, 200); g.fill()
      /* travelling light sweep */
      const sx = ((t * 0.35) % 1.6 - 0.3) * W
      const sw = g.createLinearGradient(sx - 120, 0, sx + 120, 60)
      sw.addColorStop(0, 'rgba(255,255,255,0)'); sw.addColorStop(0.45, 'rgba(255,255,255,.75)'); sw.addColorStop(0.5, 'rgba(200,240,255,.95)'); sw.addColorStop(0.55, 'rgba(255,255,255,.75)'); sw.addColorStop(1, 'rgba(255,255,255,0)')
      g.fillStyle = sw; g.fillRect(0, 0, W, HH)
      /* thin prism edge */
      const pr = g.createLinearGradient(0, 0, W, 0); PRISM.forEach((c, k) => pr.addColorStop(k / 4, c))
      g.globalCompositeOperation = 'source-over'; g.strokeStyle = pr; g.lineWidth = 3; g.globalAlpha = 0.8; g.stroke(S.body); g.globalAlpha = 1
      g.restore()
      /* polish → mask */
      const d = S.img.data
      for (let k = 0; k < GX * GY; k++) { const p = S.polish[k]; d[k * 4 + 3] = Math.round(255 * p * p * (3 - 2 * p)) }
      S.mask.getContext('2d').putImageData(S.img, 0, 0)
      g.globalCompositeOperation = 'destination-in'; g.imageSmoothingEnabled = true; g.drawImage(S.mask, 0, 0, W, HH)
      ctx.drawImage(S.gloss, 0, 0)
      /* wheels */
      WHEELS.forEach(([x, y]) => {
        ctx.fillStyle = '#0b1020'; ctx.beginPath(); ctx.arc(x, y, 60, 0, 6.3); ctx.fill()
        const rg = ctx.createRadialGradient(x - 10, y - 12, 4, x, y, 36); rg.addColorStop(0, '#f4f8ff'); rg.addColorStop(1, '#8a97b5')
        ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(x, y, 34, 0, 6.3); ctx.fill()
        ctx.strokeStyle = '#3b4766'; ctx.lineWidth = 4
        for (let k = 0; k < 5; k++) { const a = k * 1.2566 + t * 0.2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * 30, y + Math.sin(a) * 30); ctx.stroke() }
      })
      /* idle twinkles on polished paint + particles */
      frame++
      if (frame % 6 === 0) {
        const k = (Math.random() * GX * GY) | 0
        if (S.inside[k] && S.polish[k] > 0.85) S.parts.push({ x: (k % GX + 0.5) * W / GX, y: (((k / GX) | 0) + 0.5) * HH / GY, vx: 0, vy: 0, life: 1, r: 8 + Math.random() * 10, c: '#ffffff' })
      }
      S.parts = S.parts.filter(p => (p.life -= 0.022) > 0)
      S.parts.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.05; ctx.globalAlpha = Math.sin(p.life * Math.PI); ctx.fillStyle = p.c; star(ctx, p.x, p.y, p.r * (0.5 + p.life * 0.5), p.life * 2) })
      ctx.globalAlpha = 1
      /* polishing pad */
      if (S.ptr && !S.done) {
        ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(S.ptr[0], S.ptr[1], 52, 0, 6.3); ctx.stroke()
        ctx.setLineDash([6, 8]); ctx.lineDashOffset = -t * 40; ctx.beginPath(); ctx.arc(S.ptr[0], S.ptr[1], 40, 0, 6.3); ctx.stroke(); ctx.setLineDash([])
      }
      if (visible) id = requestAnimationFrame(draw)
    }
    id = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(id); io.disconnect(); removeEventListener('resize', resize) }
  }, [init])

  const rub = e => {
    const S = st.current; if (!S || S.done) return
    if (e.pointerType !== 'mouse' && e.buttons === 0 && e.type === 'pointermove') return
    const r = cv.current.getBoundingClientRect(), s = r.width / W
    const x = (e.clientX - r.left) / s, y = (e.clientY - r.top) / s
    const last = S.last; S.ptr = [x, y]; S.last = [x, y]
    if (!last) return
    const mv = Math.min(1, Math.hypot(x - last[0], y - last[1]) / 24)
    if (mv < 0.02) return
    const R = 56, ci = Math.floor(x / (W / GX)), cj = Math.floor(y / (HH / GY)), ri = Math.ceil(R / (W / GX))
    let gained = false
    for (let j = cj - ri; j <= cj + ri; j++) for (let i = ci - ri; i <= ci + ri; i++) {
      if (i < 0 || j < 0 || i >= GX || j >= GY) continue
      const k = j * GX + i; if (!S.near[k]) continue
      const dd = Math.hypot((i + 0.5) * W / GX - x, (j + 0.5) * HH / GY - y); if (dd > R) continue
      const before = S.polish[k]
      S.polish[k] = Math.min(1, before + 0.075 * mv * (1 - dd / R * 0.7))
      if (before < 1 && S.polish[k] >= 1) gained = true
    }
    if (gained || Math.random() < 0.25 * mv) for (let q = 0; q < 2; q++) S.parts.push({ x: x + (Math.random() - 0.5) * 70, y: y + (Math.random() - 0.5) * 50, vx: (Math.random() - 0.5) * 3, vy: -Math.random() * 2.5, life: 1, r: 7 + Math.random() * 12, c: PRISM[(Math.random() * 5) | 0] })
    let sum = 0; for (let k = 0; k < S.polish.length; k++) if (S.inside[k]) sum += S.polish[k]
    let v = sum / S.n
    if (v > 0.93) { S.polish.forEach((_, k) => { if (S.near[k]) S.polish[k] = 1 }); v = 1; S.done = true; S.ptr = null; setDone(true); setBurst(b => b + 1); onDone?.() }
    setPct(Math.round(v * 100))
  }
  const leave = () => { if (st.current) { st.current.ptr = null; st.current.last = null } }
  const reset = () => { init(); setPct(0); setDone(false) }

  return (
    <div ref={wrap} className="relative">
      <div className="relative">
        <canvas ref={cv} onPointerMove={rub} onPointerDown={e => { if (st.current) st.current.last = null; rub(e) }} onPointerUp={e => e.pointerType !== 'mouse' && leave()} onPointerLeave={leave}
          data-cursor={done ? '' : 'Polish'} className="block aspect-[1000/420] w-full [touch-action:none]" aria-label="Rub the car to polish it" role="img" />
        <AnimatePresence>{pct === 0 && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pointer-events-none absolute inset-x-0 top-[38%] text-center font-['Syne',sans-serif] text-[clamp(16px,2vw,22px)] font-bold text-white drop-shadow-[0_2px_10px_rgba(0,0,0,.4)]">Rub the paint in circles ↻</motion.p>}</AnimatePresence>
        <Burst k={burst} />
      </div>
      <div className="mt-8 flex flex-wrap items-center gap-5">
        <div className="relative h-5 min-w-[220px] flex-1 overflow-hidden rounded-full bg-white/10 ring-1 ring-white/20">
          <motion.div animate={{ width: `${pct}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} className="h-full rounded-full" style={{ background: 'linear-gradient(90deg,#7af0ff,#b48cff,#ff8ad8,#ffe27a)' }} />
          <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent_0_9%,rgba(255,255,255,.25)_9%_9.4%)]" />
        </div>
        <span className="w-[120px] font-['Syne',sans-serif] text-[40px] font-extrabold leading-none tabular-nums text-white">{pct}%</span>
        {done && <button onClick={reset} className="text-[14px] font-bold text-white/70 underline underline-offset-4 hover:text-white">Dull it again</button>}
      </div>
    </div>
  )
}

function Burst({ k }) {
  if (!k) return null
  return (
    <div key={k} className="pointer-events-none absolute inset-0">
      {Array.from({ length: 42 }).map((_, i) => {
        const a = (i / 42) * Math.PI * 2 + (i % 3) * 0.2, d = 160 + (i % 5) * 70, s = 14 + (i % 4) * 9
        return <motion.span key={i} className="absolute left-1/2 top-1/2" style={{ width: s, height: s * 1.4, background: `linear-gradient(135deg,#fff,${PRISM[i % 5]})`, clipPath: i % 2 ? 'polygon(50% 0,100% 50%,50% 100%,0 50%)' : 'polygon(50% 0,100% 30%,80% 100%,20% 100%,0 30%)' }}
          initial={{ x: 0, y: 0, scale: 0, rotate: 0, opacity: 1 }} animate={{ x: Math.cos(a) * d, y: Math.sin(a) * d * 0.7 + 60, scale: [0, 1.2, 1], rotate: (i % 2 ? 1 : -1) * 360, opacity: [1, 1, 0] }} transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }} />
      })}
    </div>
  )
}
