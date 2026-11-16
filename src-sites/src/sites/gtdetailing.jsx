import React, { useRef, useState, useEffect, useMemo, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, useSpring, useVelocity, useMotionValueEvent, AnimatePresence, MotionConfig } from 'framer-motion'
import { ArrowRight, Phone, MapPin, Star } from 'lucide-react'
import '../lib/base.css'
import { useSmooth, Ribbon, SplitText, Reveal, Magnetic, Cursor, Marquee, Counter, useBooking, phoneFocus, GMap, CallBar, Progress, Intro, tel, useLite, WA, waLink, IG } from '../lib/kit'

const Circuit = lazy(() => import('./gtdetailing3d'))

const b = {
  name: 'GT Detailing Manchester',
  addr: 'Unit 13, 75 Hemmons Rd, Levenshulme, Manchester M12 5ST',
  phone: '+44 7879 080069',
  ig: 'https://www.instagram.com/gtdetailing.mcr',
  rating: '5.0', rev: 40,
}
const OR = '#ff6a00', CARBON = '#0d0d0e', WHITE = '#f4f4f2'
const D = "font-['Barlow_Condensed',sans-serif] italic font-black uppercase"
const MONO = "font-['JetBrains_Mono',monospace]"
const SPLITS = [28.412, 29.087, 27.133]
const fmt = t => `${Math.floor(t / 60)}:${(t % 60).toFixed(3).padStart(6, '0')}`

const PKGS = [
  ['Maintenance wash', 'Safe wash for cars that are already looked after — keeps the finish sharp.'],
  ['Interior detail', 'Deep clean of seats, carpets, plastics and glass. Cabin back to fresh.'],
  ['Full detail', 'Inside and out, every panel and every seam. The full pit-lane treatment.'],
  ['Machine polish', 'Paint correction to cut back swirls and bring the gloss back.'],
  ['Paint protection', 'A protective layer after prep, so dirt and water slide off.'],
]
const CARBON_BG = { backgroundColor: CARBON, backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,.025) 0 2px, transparent 2px 6px), repeating-linear-gradient(-45deg, rgba(255,255,255,.025) 0 2px, transparent 2px 6px)' }

/* ---------- transitions ---------- */
function SpeedIn({ children, className = '', delay = 0, from = -1 }) {
  return (
    <motion.div className={className} initial={{ x: `${from * 45}vw`, skewX: from * -28, filter: 'blur(18px)', opacity: 0 }} whileInView={{ x: 0, skewX: 0, filter: 'blur(0px)', opacity: 1 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }} transition={{ duration: .9, ease: [0.16, 1, 0.3, 1], delay }}>{children}</motion.div>
  )
}
function Stripe({ p, i, color }) {
  const x = useTransform(p, [0, 1], [`${-140 + i * 12}%`, `${140 + i * 12}%`])
  return <motion.div style={{ x, background: color, top: `${8 + i * 30}%` }} className="absolute left-0 h-[26%] w-full -skew-x-[30deg]" />
}
function Livery({ from, to }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const bg = useTransform(scrollYProgress, [.45, .55], [from, to])
  return (
    <motion.div ref={ref} aria-hidden="true" className="relative h-[34vh] overflow-hidden" style={{ background: bg }}>
      <Stripe p={scrollYProgress} i={0} color={WHITE} />
      <Stripe p={scrollYProgress} i={1} color={OR} />
      <Stripe p={scrollYProgress} i={2} color={CARBON} />
    </motion.div>
  )
}
function Sq({ p, d, color }) {
  const s = useTransform(p, [d, d + .25], [0, 1.02])
  const r = useTransform(p, [d, d + .25], [90, 0])
  return <motion.div style={{ scale: s, rotate: r, background: color }} className="aspect-square w-full" />
}
function CheckerWipe({ from, to }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] })
  const cells = useMemo(() => { const c = []; for (let r = 0; r < 4; r++) for (let k = 0; k < 12; k++) c.push({ d: ((k + r) % 2) * .3 + (3 - r) * .06 + k * .012 }); return c }, [])
  return (
    <div ref={ref} aria-hidden="true" className="grid grid-cols-12 overflow-hidden" style={{ background: from }}>
      {cells.map((c, k) => <Sq key={k} p={scrollYProgress} d={c.d} color={to} />)}
    </div>
  )
}

/* ---------- hero: scroll drives a demo lap ---------- */
function Timing({ progress, compact }) {
  const [v, setV] = useState(0)
  useMotionValueEvent(progress, 'change', x => setV(Math.max(0, Math.min(1, x))))
  const total = SPLITS.reduce((a, c) => a + c, 0)
  const sec = Math.min(2, Math.floor(v * 3))
  let t = 0; for (let k = 0; k < sec; k++) t += SPLITS[k]
  t += SPLITS[sec] * (v * 3 - sec)
  if (v >= .999) t = total
  if (compact) return (
    <div className={`${MONO} flex items-center justify-between gap-3 rounded-lg bg-black/70 px-3 py-2 text-[11px] text-white ring-1 ring-white/10 backdrop-blur`}>
      <div><span className="block text-[9px] text-white/45">DEMO LAP</span><span className="text-[20px] font-bold leading-none" style={{ fontVariantNumeric: 'tabular-nums' }}>{fmt(t)}</span></div>
      <div className="flex gap-1.5">{SPLITS.map((s, k) => { const done = v * 3 >= k + 1 || v >= .999; return <span key={k} className="rounded px-1.5 py-1" style={{ background: done ? (k === 1 ? '#7e22ce' : '#15803d') : k === sec ? OR : '#222', color: k === sec && !done ? CARBON : '#fff' }}>S{k + 1}</span> })}</div>
    </div>
  )
  return (
    <div className={`${MONO} w-[210px] rounded-xl bg-black/70 p-3 text-[11px] text-white ring-1 ring-white/10 backdrop-blur md:w-[260px] md:p-4 md:text-[12px]`}>
      <div className="mb-1 flex justify-between text-white/50"><span>DEMO LAP</span><span>GT · MCR</span></div>
      <div className="mb-3 text-[26px] font-bold leading-none tracking-tight md:text-[34px]" style={{ fontVariantNumeric: 'tabular-nums' }}>{fmt(t)}</div>
      {SPLITS.map((s, k) => {
        const done = v * 3 >= k + 1 || v >= .999
        return (
          <div key={k} className="flex items-center justify-between border-t border-white/10 py-1.5">
            <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ background: done ? (k === 1 ? '#a855f7' : '#22c55e') : k === sec ? OR : '#333' }} />S{k + 1}</span>
            <span style={{ color: done ? (k === 1 ? '#c084fc' : '#4ade80') : 'rgba(255,255,255,.35)' }}>{done ? s.toFixed(3) : k === sec ? 'running' : '—'}</span>
          </div>
        )
      })}
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10"><div className="h-full" style={{ width: v * 100 + '%', background: OR }} /></div>
    </div>
  )
}
function SpeedLines() {
  const { scrollY } = useScroll()
  const vel = useSpring(useVelocity(scrollY), { stiffness: 200, damping: 40 })
  const o = useTransform(vel, [-2500, -300, 0, 300, 2500], [.8, .15, 0, .15, .8])
  return (
    <motion.div aria-hidden="true" style={{ opacity: o }} className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 16 }).map((_, k) => <motion.span key={k} className="absolute h-px bg-gradient-to-r from-transparent via-white to-transparent" style={{ top: `${(k * 37) % 100}%`, width: `${20 + (k * 13) % 40}%` }} animate={{ x: ['120vw', '-60vw'] }} transition={{ duration: .5 + (k % 4) * .15, repeat: Infinity, ease: 'linear', delay: k * .07 }} />)}
    </motion.div>
  )
}
function LiteTrack() {
  return (
    <svg viewBox="0 0 400 240" className="absolute right-[4%] top-[14%] w-[90vw] max-w-[620px] md:w-[50vw]" aria-hidden="true">
      <path id="lt" d="M40 120 C40 40 140 30 220 40 S380 50 370 120 S300 210 200 200 S40 200 40 120Z" fill="none" stroke="#1d1d20" strokeWidth="22" />
      <path d="M40 120 C40 40 140 30 220 40 S380 50 370 120 S300 210 200 200 S40 200 40 120Z" fill="none" stroke={OR} strokeWidth="2" strokeDasharray="8 10" />
    </svg>
  )
}
function Hero({ lite }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const lap = useTransform(scrollYProgress, [0, .92], [0, 1], { clamp: true })
  return (
    <section ref={ref} className="relative h-[320vh]" style={CARBON_BG}>
      <div className="sticky top-0 h-[100svh] min-h-[620px] overflow-hidden">
        <div className="absolute inset-0">{lite ? <LiteTrack /> : <Suspense fallback={<LiteTrack />}><Circuit progress={lap} /></Suspense>}</div>
        <SpeedLines />
        <div className="absolute left-10 top-8 z-20 hidden md:block"><Timing progress={lap} /></div>
        <div className="absolute inset-x-3 top-3 z-20 md:hidden"><Timing progress={lap} compact /></div>
        <div className="pointer-events-none relative z-10 mx-auto flex h-full max-w-[1400px] flex-col justify-end px-5 pb-24 md:px-10 md:pb-16">
          <motion.p initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.5 }} className={`${MONO} mb-4 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[.2em] text-[#ff6a00] md:text-[12px]`}><span className="h-[3px] w-10 bg-[#ff6a00]" />Detailing studio · Levenshulme, Manchester</motion.p>
          <h1 className={`${D} text-[clamp(56px,10.5vw,184px)] leading-[.82] tracking-[-.01em] text-[#f4f4f2]`}>
            <SpeedIn delay={1.3} className="block">Detailed like</SpeedIn>
            <SpeedIn delay={1.45} className="block"><span className="text-[#ff6a00]">it's race day.</span></SpeedIn>
          </h1>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }} className="mt-6 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <p className="max-w-[440px] text-[16px] text-white/65 md:text-[17px]">Washes, interior details, polishing and protection at our Levenshulme unit. Scroll to run a lap.</p>
            <div className="pointer-events-auto flex flex-wrap gap-3">
              <Magnetic><a href="#book" data-cursor="Box!" className={`${D} inline-flex h-14 items-center gap-3 bg-[#ff6a00] px-8 text-[22px] text-[#0d0d0e] transition-[scale] [clip-path:polygon(8%_0,100%_0,92%_100%,0_100%)] active:scale-95 md:h-16`}>Book a pit stop <ArrowRight size={20} /></a></Magnetic>
              <a href={waLink(b.phone)} target="_blank" rel="noopener" className="inline-flex h-14 items-center gap-2 bg-white/10 px-6 font-semibold text-white ring-1 ring-white/20 [clip-path:polygon(8%_0,100%_0,92%_100%,0_100%)] md:h-16"><WA /> WhatsApp</a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function Services() {
  return (
    <section id="services" className="relative px-5 py-28 md:px-10" style={CARBON_BG}>
      <div className="mx-auto max-w-[1400px]">
        <SpeedIn><p className={`${MONO} mb-3 text-[12px] font-bold uppercase tracking-[.2em] text-[#ff6a00]`}>The garage</p></SpeedIn>
        <SpeedIn delay={.05}><h2 className={`${D} mb-14 text-[clamp(52px,8vw,132px)] leading-[.85] text-[#f4f4f2]`}>Five setups.<br /><span className="text-transparent [-webkit-text-stroke:2px_#f4f4f2]">One standard.</span></h2></SpeedIn>
        <div className="border-t border-white/15">
          {PKGS.map(([t, d], k) => (
            <SpeedIn key={t} delay={k * .05} from={k % 2 ? 1 : -1}>
              <a href="#book" data-pkg={t} data-cursor="Select" className="group relative grid items-center gap-2 overflow-hidden border-b border-white/15 py-7 md:grid-cols-[90px_1fr_1.1fr_auto] md:gap-8">
                <span className="absolute inset-0 origin-left scale-x-0 bg-[#ff6a00] transition-transform duration-500 ease-[cubic-bezier(.2,0,0,1)] group-hover:scale-x-100" />
                <span className={`${MONO} relative text-[14px] text-white/40 group-hover:text-[#0d0d0e]`}>P{k + 1}</span>
                <h3 className={`${D} relative text-[clamp(36px,4.6vw,72px)] leading-none text-[#f4f4f2] group-hover:text-[#0d0d0e]`}>{t}</h3>
                <p className="relative max-w-[460px] text-[16px] text-white/60 group-hover:text-[#0d0d0e]/80">{d}</p>
                <ArrowRight className="relative hidden text-white/60 transition-transform group-hover:translate-x-2 group-hover:text-[#0d0d0e] md:block" />
              </a>
            </SpeedIn>
          ))}
        </div>
      </div>
    </section>
  )
}

function Standings() {
  return (
    <section className="relative overflow-hidden px-5 py-28 md:px-10" style={{ background: WHITE }}>
      <div className="mx-auto max-w-[1400px]">
        <SpeedIn><h2 className={`${D} max-w-[1100px] text-[clamp(44px,7vw,116px)] leading-[.86] text-[#0d0d0e]`}>Every car leaves <span className="text-[#ff6a00]">pole-position</span> clean.</h2></SpeedIn>
        <div className="mt-16 grid gap-4 md:grid-cols-3">
          <Reveal className="relative overflow-hidden bg-[#0d0d0e] p-8 text-white md:col-span-2 md:p-12">
            <span className={`${MONO} text-[12px] uppercase tracking-[.2em] text-white/50`}>Timing tower · Google</span>
            <div className="mt-6 flex flex-wrap items-end gap-x-10 gap-y-4">
              <div><span className={`${D} block text-[clamp(96px,13vw,190px)] leading-[.8] text-[#ff6a00]`}>{b.rating}</span><span className="mt-3 flex gap-1">{[0, 1, 2, 3, 4].map(k => <Star key={k} size={20} fill={OR} stroke={OR} />)}</span></div>
              <div><span className={`${D} block text-[clamp(96px,13vw,190px)] leading-[.8]`}><Counter to={b.rev} /></span><span className="mt-3 block text-white/60">Google reviews</span></div>
            </div>
            <div className="absolute -right-10 top-0 hidden h-full w-40 -skew-x-[20deg] bg-[#ff6a00] md:block" />
            <div className="absolute right-24 top-0 hidden h-full w-6 -skew-x-[20deg] bg-white md:block" />
          </Reveal>
          <Reveal delay={.1} className="flex flex-col justify-between bg-[#ff6a00] p-8 md:p-10">
            <span className={`${MONO} text-[12px] uppercase tracking-[.2em] text-[#0d0d0e]/70`}>Pit garage</span>
            <p className={`${D} mt-6 text-[clamp(36px,3.6vw,54px)] leading-[.9] text-[#0d0d0e]`}>Unit 13, Hemmons Rd — Levenshulme</p>
            <a href="#contact" className="mt-6 inline-flex items-center gap-2 font-bold text-[#0d0d0e]">Directions <ArrowRight size={18} /></a>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

/* ---------- signature: pit-stop booking ---------- */
function useDays() {
  return useMemo(() => { const o = [], d = new Date(); while (o.length < 7) { d.setDate(d.getDate() + 1); o.push(d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })) } return o }, [])
}
function Lights({ lit, out }) {
  return (
    <div className="flex justify-center gap-2 rounded-2xl bg-[#050505] p-3 ring-1 ring-white/10 md:gap-4 md:p-5" aria-label={`${out ? 0 : lit} of 5 lights on`}>
      {[0, 1, 2, 3, 4].map(k => {
        const on = !out && k < lit
        return (
          <div key={k} className="grid gap-1.5 rounded-xl bg-[#151515] p-1.5 md:gap-2 md:p-2">
            {[0, 1].map(r => <motion.span key={r} className="block h-8 w-8 rounded-full md:h-12 md:w-12" initial={false}
              animate={{ backgroundColor: on ? '#ff1e1e' : '#2a0a0a', boxShadow: on ? '0 0 26px 4px rgba(255,30,30,.65)' : '0 0 0 0 rgba(0,0,0,0)' }}
              transition={{ duration: .15, delay: on ? (k % 2) * .35 : 0 }} />)}
          </div>
        )
      })}
    </div>
  )
}
function CheckerFlash() {
  const cols = 10, rows = 18
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[95] grid overflow-hidden" style={{ gridTemplateColumns: `repeat(${cols},1fr)` }}>
      {Array.from({ length: cols * rows }).map((_, i) => {
        const r = Math.floor(i / cols), c = i % cols
        return <motion.div key={i} className="aspect-square" style={{ background: (r + c) % 2 ? CARBON : WHITE, originX: 0 }} initial={{ scaleX: 0 }} animate={{ scaleX: [0, 1, 1, 0] }} transition={{ duration: 1.5, times: [0, .35, .65, 1], delay: c * .03 + r * .015, ease: 'easeInOut' }} />
      })}
    </div>
  )
}
function Row({ k, label, value, active }) {
  return (
    <div className={`flex items-baseline justify-between gap-4 border-b border-white/10 py-3 ${active ? 'text-[#ffd400]' : 'text-white/80'}`}>
      <span className={`${MONO} text-[12px] text-white/40`}>{k}</span>
      <span className={`${D} truncate text-right text-[clamp(26px,3vw,40px)] leading-none`}>{value || label}</span>
    </div>
  )
}
function PitStop({ bk }) {
  const days = useDays()
  const [pkg, setPkg] = useState('')
  const [day, setDay] = useState('')
  const [out, setOut] = useState(false)
  const [flash, setFlash] = useState(false)
  const phoneOk = bk.s.phone.replace(/\D/g, '').length >= 12
  const lit = (pkg ? 2 : 0) + (day ? 2 : 0) + (phoneOk ? 1 : 0)
  useEffect(() => { bk.upd('svc', [pkg, day].filter(Boolean).join(' · ')) }, [pkg, day])
  useEffect(() => {
    const h = e => { const t = e.target.closest('[data-pkg]'); if (t) setPkg(t.dataset.pkg) }
    document.addEventListener('click', h); return () => document.removeEventListener('click', h)
  }, [])
  const box = e => {
    e.preventDefault()
    if (!bk.submit()) return
    setOut(true)
    setTimeout(() => setFlash(true), 700)
    setTimeout(() => setFlash(false), 2400)
  }
  const restart = () => { bk.reset(); setPkg(''); setDay(''); setOut(false) }
  const f = 'h-14 w-full bg-white/[.06] px-5 text-[18px] text-white outline-none ring-1 ring-white/15 placeholder:text-white/30 focus:ring-2 focus:ring-[#ff6a00] ' + MONO
  const chip = on => `px-4 py-2.5 text-[14px] font-semibold transition-colors [clip-path:polygon(6%_0,100%_0,94%_100%,0_100%)] ${on ? 'bg-[#ff6a00] text-[#0d0d0e]' : 'bg-white/[.07] text-white/75 hover:bg-white/15'}`
  return (
    <section id="book" className="relative overflow-hidden px-5 py-28 md:px-10" style={CARBON_BG}>
      {flash && <CheckerFlash />}
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-10 grid items-end gap-8 md:grid-cols-[1fr_auto]">
          <div>
            <SpeedIn><p className={`${MONO} mb-3 text-[12px] font-bold uppercase tracking-[.2em] text-[#ff6a00]`}>Pit stop booking</p></SpeedIn>
            <SpeedIn delay={.05}><h2 className={`${D} text-[clamp(52px,8vw,132px)] leading-[.85] text-[#f4f4f2]`}>Five lights.<br /><span className="text-[#ff6a00]">Then box, box.</span></h2></SpeedIn>
          </div>
          <Lights lit={lit} out={out} />
        </div>
        <AnimatePresence mode="wait">
          {!bk.s.sent ? (
            <motion.div key="f" exit={{ opacity: 0, x: '-30vw', skewX: 20, filter: 'blur(16px)' }} transition={{ duration: .5 }} className="grid gap-10 lg:grid-cols-[1.25fr_.75fr]">
              <form onSubmit={box} noValidate className="grid gap-9">
                <div>
                  <p className={`${MONO} mb-3 text-[12px] uppercase tracking-[.16em] text-white/50`}><span className="text-[#ff6a00]">01</span> · Choose your setup</p>
                  <div className="flex flex-wrap gap-2">{PKGS.map(([t]) => <button type="button" key={t} onClick={() => setPkg(t)} className={chip(pkg === t)}>{t}</button>)}</div>
                </div>
                <div>
                  <p className={`${MONO} mb-3 text-[12px] uppercase tracking-[.16em] text-white/50`}><span className="text-[#ff6a00]">02</span> · Pick a day <span className="normal-case text-white/35">(we confirm the time)</span></p>
                  <div className="flex flex-wrap gap-2">{days.map(d => <button type="button" key={d} onClick={() => setDay(d)} className={chip(day === d)}>{d}</button>)}</div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2"><p className={`${MONO} mb-3 text-[12px] uppercase tracking-[.16em] text-white/50`}><span className="text-[#ff6a00]">03</span> · Radio in</p></div>
                  <input className={f} placeholder="Your name" value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} autoComplete="name" />
                  <motion.input animate={bk.s.err ? { x: [0, -8, 8, -6, 6, 0] } : {}} className={f + (bk.s.err ? ' ring-2 !ring-red-500' : '')} type="tel" inputMode="tel" placeholder="+44 7___ ______" value={bk.s.phone} onFocus={phoneFocus(bk, '+44 ')} onChange={e => bk.upd('phone', e.target.value)} autoComplete="tel" />
                </div>
                <div>
                  <button disabled={bk.s.loading} className={`${D} group relative h-20 w-full overflow-hidden text-[40px] leading-none transition-[scale] active:scale-[.98] disabled:opacity-80 sm:w-auto sm:px-16 ${lit === 5 ? 'bg-[#ff6a00] text-[#0d0d0e]' : 'bg-white/10 text-white/60'}`} style={{ clipPath: 'polygon(4% 0,100% 0,96% 100%,0 100%)' }}>
                    {bk.s.loading ? 'Lights out…' : 'Box, box'}
                  </button>
                  <p className="mt-3 text-[13px] text-white/45">In the finished site this request goes straight to your phone/Telegram.</p>
                </div>
              </form>
              <div className="relative bg-[#050505] p-6 ring-1 ring-white/10 md:p-8">
                <div className="mb-4 flex items-center justify-between"><span className={`${MONO} text-[12px] text-white/40`}>PIT BOARD</span><span className="h-3 w-3 animate-pulse rounded-full bg-[#ff6a00]" /></div>
                <Row k="CAR" label="GT" value="GT · MCR" />
                <Row k="PKG" label="— setup" value={pkg} active={!!pkg} />
                <Row k="DAY" label="— day" value={day} active={!!day} />
                <Row k="RADIO" label="— phone" value={phoneOk ? bk.s.phone : ''} active={phoneOk} />
                <p className={`${D} mt-6 text-[clamp(48px,5vw,72px)] leading-none ${lit === 5 ? 'text-[#ffd400]' : 'text-white/15'}`}>{lit === 5 ? 'Box box' : `${lit}/5`}</p>
              </div>
            </motion.div>
          ) : (
            <motion.div key="ok" initial={{ opacity: 0, x: '30vw', skewX: -20, filter: 'blur(16px)' }} animate={{ opacity: 1, x: 0, skewX: 0, filter: 'blur(0px)' }} transition={{ delay: .9, duration: .6 }} className="relative overflow-hidden bg-[#f4f4f2] p-8 text-[#0d0d0e] md:p-14">
              <div className="absolute inset-y-0 right-0 hidden w-1/3 md:block" style={{ backgroundImage: `conic-gradient(${CARBON} 25%, ${WHITE} 0 50%, ${CARBON} 0 75%, ${WHITE} 0)`, backgroundSize: '48px 48px' }} />
              <div className="relative max-w-[640px]">
                <p className={`${MONO} mb-3 text-[12px] uppercase tracking-[.2em] text-[#ff6a00]`}>Chequered flag</p>
                <h3 className={`${D} text-[clamp(52px,7vw,104px)] leading-[.85]`}>Box confirmed.</h3>
                <p className="mt-4 text-[17px] text-[#0d0d0e]/70">{pkg && day ? `${pkg} · ${day}. ` : ''}In the finished site this request goes straight to your phone/Telegram.</p>
                <button onClick={restart} className="mt-6 font-bold underline underline-offset-4">Book another stop</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

function Contact() {
  return (
    <section id="contact" className="px-5 py-28 md:px-10" style={{ background: WHITE }}>
      <div className="mx-auto grid max-w-[1400px] gap-8 md:grid-cols-[.9fr_1.1fr]">
        <div className="grid content-start gap-6 text-[#0d0d0e]">
          <SpeedIn><h2 className={`${D} text-[clamp(56px,8vw,128px)] leading-[.85]`}>Pit <span className="text-[#ff6a00]">lane</span></h2></SpeedIn>
          <Reveal><p className="flex items-start gap-3 text-[20px] font-semibold"><MapPin className="mt-1 shrink-0 text-[#ff6a00]" />{b.addr}</p></Reveal>
          <Reveal delay={.05}><a href={'tel:' + tel(b.phone)} className={`${D} text-[clamp(40px,4.6vw,64px)] leading-none`}>{b.phone}</a></Reveal>
          <Reveal delay={.1} className="flex flex-wrap gap-3">
            <Magnetic><a href={waLink(b.phone)} target="_blank" rel="noopener" className="inline-flex h-14 items-center gap-2 bg-[#0d0d0e] px-7 font-semibold text-white [clip-path:polygon(6%_0,100%_0,94%_100%,0_100%)]"><WA /> WhatsApp</a></Magnetic>
            <a href={'tel:' + tel(b.phone)} className="inline-flex h-14 items-center gap-2 bg-[#ff6a00] px-7 font-semibold text-[#0d0d0e] [clip-path:polygon(6%_0,100%_0,94%_100%,0_100%)]"><Phone size={18} /> Call</a>
            <a href={b.ig} target="_blank" rel="noopener" className="inline-flex h-14 items-center gap-2 px-5 font-semibold ring-2 ring-[#0d0d0e] [clip-path:polygon(6%_0,100%_0,94%_100%,0_100%)]"><IG /> @gtdetailing.mcr</a>
          </Reveal>
        </div>
        <Reveal delay={.1} className="relative h-[440px] overflow-hidden ring-4 ring-[#0d0d0e]"><GMap q={`${b.name}, ${b.addr}`} /><div className="pointer-events-none absolute inset-x-0 top-0 h-3" style={{ backgroundImage: `conic-gradient(${CARBON} 25%, ${WHITE} 0 50%, ${CARBON} 0 75%, ${WHITE} 0)`, backgroundSize: '12px 12px' }} /></Reveal>
      </div>
    </section>
  )
}

function App() {
  useSmooth()
  const lite = useLite()
  const bk = useBooking()
  return (
    <MotionConfig reducedMotion="user">
      <div className="font-['Barlow',sans-serif]" style={{ background: CARBON, color: WHITE, '--sel': OR, '--selc': CARBON }}>
        <Intro bg={CARBON} fg={WHITE} duration={1.7}>
          <div className="flex flex-col items-center gap-6">
            <div className="flex gap-2">{[0, 1, 2, 3, 4].map(k => <motion.span key={k} className="h-7 w-7 rounded-full" initial={{ backgroundColor: '#2a0a0a' }} animate={{ backgroundColor: ['#2a0a0a', '#ff1e1e', '#ff1e1e', '#2a0a0a'] }} transition={{ duration: 1.3, times: [0, .1, .85, 1], delay: k * .12 }} />)}</div>
            <span className={`${D} text-[44px] leading-none`}>GT <span className="text-[#ff6a00]">Detailing</span></span>
          </div>
        </Intro>
        <Progress color={OR} />
        <Cursor color={OR} blend="normal" textColor={CARBON} />
        <Ribbon lang="en" name={b.name} bg={OR} fg={CARBON} />
        <header className="sticky top-0 z-40 bg-[#0d0d0e]/80 backdrop-blur-xl">
          <div className="mx-auto flex h-[64px] max-w-[1400px] items-center justify-between px-5 md:px-10">
            <a href="#top" className={`${D} flex items-center gap-2 text-[28px] leading-none`}><span className="flex h-6 w-9 -skew-x-[20deg] overflow-hidden"><span className="w-1/3 bg-[#f4f4f2]" /><span className="w-1/3 bg-[#ff6a00]" /><span className="w-1/3 bg-[#f4f4f2]" /></span>GT Detailing</a>
            <nav className="hidden gap-8 text-[14px] font-semibold uppercase tracking-[.1em] text-white/60 md:flex">{[['#services', 'Services'], ['#book', 'Pit stop'], ['#contact', 'Contact']].map(([h, t]) => <a key={h} href={h} className="hover:text-white">{t}</a>)}</nav>
            <a href={'tel:' + tel(b.phone)} className={`${MONO} hidden h-10 items-center gap-2 bg-[#ff6a00] px-5 text-[13px] font-bold text-[#0d0d0e] [clip-path:polygon(8%_0,100%_0,92%_100%,0_100%)] sm:inline-flex`}><Phone size={14} />{b.phone}</a>
          </div>
        </header>
        <main id="top" className="overflow-x-clip">
          <Hero lite={lite} />
          <div className="-skew-y-2 bg-[#ff6a00] py-4">
            <Marquee base={-3}>{['wash', 'detail', 'polish', 'protect', 'interior', 'pit stop'].map(t => <span key={t} className={`${D} mx-6 inline-flex items-center gap-12 text-[clamp(40px,5vw,76px)] leading-none text-[#0d0d0e]`}>{t}<span className="inline-block h-6 w-10 -skew-x-[20deg] bg-[#0d0d0e]" /></span>)}</Marquee>
          </div>
          <Services />
          <Livery from={CARBON} to={WHITE} />
          <Standings />
          <CheckerWipe from={WHITE} to={CARBON} />
          <PitStop bk={bk} />
          <Livery from={CARBON} to={WHITE} />
          <Contact />
        </main>
        <footer className="px-5 py-10 text-[14px] text-white/55 md:px-10" style={{ background: CARBON }}><div className="mx-auto flex max-w-[1400px] flex-wrap justify-between gap-4"><span>© 2026 {b.name} · Website concept by Artem</span><a href={b.ig} target="_blank" rel="noopener" className="text-[#ff6a00]">Instagram</a></div></footer>
        <CallBar lang="en" phone={b.phone} barCls="bg-[#0d0d0e]/90 backdrop-blur-xl" callCls="bg-white/10 text-white ring-1 ring-white/20" bookCls="bg-[#ff6a00] text-[#0d0d0e]" />
        <div className="h-[72px] sm:hidden" style={{ background: CARBON }} />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
