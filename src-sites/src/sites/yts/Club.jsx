import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useLang } from './i18n'
import { T, CLUB } from './data'

const EASE = [0.16, 1, 0.3, 1]

/* calm lake drawn as contour lines; the pointer is a hull leaving a wake */
function Lake() {
  const ref = useRef(null)
  useEffect(() => {
    const c = ref.current, ctx = c.getContext('2d')
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    let W = 0, H = 0, dpr = 1, raf = 0, on = false
    const trail = []
    const size = () => { dpr = Math.min(1.5, devicePixelRatio || 1); W = c.clientWidth; H = c.clientHeight; c.width = W * dpr; c.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); if (reduce) draw(0) }
    const draw = t => {
      ctx.clearRect(0, 0, W, H)
      const gap = W < 768 ? 16 : 20, step = W < 768 ? 10 : 8, now = t / 1000
      for (let i = trail.length - 1; i >= 0; i--) if (now - trail[i].t > 2.6) trail.splice(i, 1)
      for (let y0 = gap; y0 < H; y0 += gap) {
        const depth = y0 / H
        ctx.beginPath()
        for (let x = 0; x <= W + step; x += step) {
          let dy = Math.sin(x * 0.006 + now * 0.5 + y0 * 0.05) * 2.2 * (0.4 + depth) + Math.sin(x * 0.013 - now * 0.35 + y0 * 0.02) * 1.2
          for (let k = 0; k < trail.length; k++) {
            const p = trail[k], age = now - p.t
            const dx = x - p.x, ddy = y0 - p.y, d = Math.sqrt(dx * dx + ddy * ddy)
            const front = age * 140
            const ring = Math.exp(-((d - front) * (d - front)) / 900)
            dy += Math.sin((d - front) * 0.12) * ring * 9 * Math.max(0, 1 - age / 2.6) * p.s
          }
          x === 0 ? ctx.moveTo(x, y0 + dy) : ctx.lineTo(x, y0 + dy)
        }
        ctx.strokeStyle = `rgba(236,231,223,${0.06 + depth * 0.13})`
        ctx.lineWidth = 1
        ctx.stroke()
      }
    }
    const loop = t => { draw(t); if (on) raf = requestAnimationFrame(loop) }
    let last = 0, lx = 0, ly = 0
    const move = e => {
      const r = c.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, t = performance.now() / 1000
      const d = Math.hypot(x - lx, y - ly)
      if (t - last > 0.07 && d > 12) { trail.push({ x, y, t, s: Math.min(1, d / 60) }); if (trail.length > 26) trail.shift(); last = t; lx = x; ly = y }
    }
    size()
    const io = new IntersectionObserver(([e]) => { const v = e.isIntersecting && !reduce; if (v && !on) { on = true; raf = requestAnimationFrame(loop) } else if (!v) { on = false; cancelAnimationFrame(raf) } })
    io.observe(c)
    addEventListener('resize', size)
    const host = c.parentElement
    host.addEventListener('pointermove', move)
    return () => { on = false; cancelAnimationFrame(raf); io.disconnect(); removeEventListener('resize', size); host.removeEventListener('pointermove', move) }
  }, [])
  return <canvas ref={ref} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />
}

const ART = {
  sail: ['M60 6 V66', 'M58 10 L58 60 L20 60 Z', 'M62 16 L94 60 L62 60', 'M12 66 Q60 80 108 66'],
  wine: ['M44 8 Q38 40 60 46 Q82 40 76 8 Z', 'M42 24 H78', 'M60 46 V70', 'M46 72 H74'],
  column: ['M36 12 H84', 'M40 18 H80', 'M46 18 V64', 'M55 18 V64', 'M65 18 V64', 'M74 18 V64', 'M40 64 H80', 'M36 70 H84'],
  flotilla: ['M30 20 V56 L12 56 Z', 'M62 10 V60 L38 60 Z', 'M64 16 L82 60 L64 60', 'M94 30 V58 L80 58 Z', 'M6 62 Q60 72 114 62'],
}
const KEYS = ['sail', 'wine', 'column', 'flotilla']

function Art({ k, hot }) {
  return (
    <motion.svg initial="h" whileInView="v" viewport={{ once: true }} viewBox="0 0 120 80" className="h-[64px] w-[96px] overflow-visible md:h-[80px] md:w-[120px]" fill="none" strokeLinecap="round" strokeLinejoin="round">
      {ART[k].map((d, i) => (
        <motion.path key={i} d={d} stroke={hot ? '#c3a15e' : 'rgba(236,231,223,.7)'} strokeWidth="1.2" style={{ transition: 'stroke .5s' }}
          variants={{ h: { pathLength: 0 }, v: { pathLength: 1, transition: { duration: 1.4, ease: EASE, delay: 0.2 + i * 0.12 } } }} />
      ))}
    </motion.svg>
  )
}

function Row({ it, i, hot, setHot }) {
  const { t } = useLang()
  const on = hot === i
  return (
    <motion.li onPointerEnter={() => setHot(i)} onFocus={() => setHot(i)} tabIndex={0}
      initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-8%' }} transition={{ duration: 0.9, ease: EASE, delay: i * 0.06 }}
      className="group relative grid grid-cols-[36px_1fr_auto] items-center gap-x-4 border-t border-[#ece7df]/15 py-7 outline-none md:grid-cols-[80px_1fr_auto_140px] md:py-9">
      <span className="self-start pt-3 text-[12px] font-semibold tabular-nums text-[#ece7df]/45">{String(i + 1).padStart(2, '0')}</span>
      <span className={`${T.serif} text-[40px] leading-[.95] transition-all duration-700 [transition-timing-function:cubic-bezier(.16,1,.3,1)] md:text-[5.4vw] 2xl:text-[80px] ${on ? 'translate-x-2 italic text-[#ece7df]' : 'text-[#ece7df]/80'}`}>{t(it.t)}</span>
      <span className="col-start-2 row-start-2 mt-2 text-[12px] font-semibold uppercase tracking-[.2em] text-[#c3a15e] md:col-start-3 md:row-start-1 md:mt-0">{it.p}</span>
      <span className="col-start-3 row-span-2 row-start-1 justify-self-end md:col-start-4 md:row-span-1"><Art k={KEYS[i]} hot={on} /></span>
      <motion.span aria-hidden className="absolute bottom-[-1px] left-0 h-px w-full origin-left bg-[#c3a15e]" initial={false} animate={{ scaleX: on ? 1 : 0 }} transition={{ duration: 0.8, ease: EASE }} />
    </motion.li>
  )
}

export default function Club() {
  const { t } = useLang()
  const [hot, setHot] = useState(0)
  const ask = () => { window.dispatchEvent(new CustomEvent('yts:interest', { detail: 'club' })) }
  return (
    <section id="club" className={`relative overflow-hidden bg-[#27414f] text-[#ece7df] ${T.sans}`}>
      <Lake />
      <div aria-hidden className="pointer-events-none absolute -right-[4vw] top-[6%] select-none text-[34vw] font-black uppercase leading-[.75] tracking-[-.06em] text-[#ece7df]/[.04]">Club</div>
      <div className="relative mx-auto max-w-[1440px] px-5 py-24 md:px-10 md:py-36">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="text-[11px] font-semibold uppercase tracking-[.22em] text-[#c3a15e]">{t({ en: '06 — Club & events', it: '06 — Club ed eventi' })}</div>
            <p className="mt-6 max-w-[30ch] text-[14px] leading-relaxed text-[#ece7df]/60">{t({ en: 'Move the cursor across the water.', it: 'Muovi il cursore sull’acqua.' })}</p>
          </div>
          <h2 className={`${T.serif} text-[42px] leading-[1.02] md:text-[64px] lg:col-span-8`}>
            {t(CLUB.lead).split(' — ').map((s, i) => i === 0 ? <span key={i}>{s} </span> : <em key={i} className="text-[#ece7df]/55">— {s}</em>)}
          </h2>
        </div>
        <ul className="mt-20 border-b border-[#ece7df]/15 md:mt-28">
          {CLUB.items.map((it, i) => <Row key={i} it={it} i={i} hot={hot} setHot={setHot} />)}
        </ul>
        <div className="mt-14 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <p className={`${T.serif} max-w-[34ch] text-[24px] italic leading-[1.15] text-[#ece7df]/75`}>{t({ en: 'From a marina in Herzliya to a flotilla off Olbia — Italy is easier to understand in good company.', it: 'Da una marina di Herzliya a una flottiglia al largo di Olbia — l’Italia si capisce meglio in buona compagnia.' })}</p>
          <a href="#contact" onClick={ask} className="inline-flex h-12 items-center gap-3 rounded-full bg-[#ece7df] px-6 text-[13px] font-semibold text-[#151412] transition-colors hover:bg-[#c3a15e]">
            {t({ en: 'Ask about the club', it: 'Informazioni sul club' })}
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 9h13M10 4l5 5-5 5" /></svg>
          </a>
        </div>
      </div>
    </section>
  )
}
