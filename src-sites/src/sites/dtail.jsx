import React, { useRef, useState, useEffect, useLayoutEffect, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, useSpring, useMotionValueEvent, AnimatePresence, MotionConfig } from 'framer-motion'
import { ArrowRight, ArrowUpRight, Phone, MapPin, Star } from 'lucide-react'
import '../lib/base.css'
import { LineReveal, useSmooth, Ribbon, SplitText, ScrollWords, Reveal, Magnetic, Cursor, Marquee, Counter, useBooking, phoneFocus, CheckDraw, GMap, CallBar, Progress, Intro, tel, useLite, WA, waLink, Grain } from '../lib/kit'
import { S0, S1, S2, S3, FOCUS, ZOOM, BG } from './dtail-scenes'
import Flakes from './dtail-flake'

const Wheel3D = lazy(() => import('./dtail3d'))

const b = {
  name: 'ItsallintheDTail Ltd',
  addr: '21 Raynel Dr, Leeds LS16 6BS',
  phone: '+44 7971 565716',
  rating: '5.0', rev: 84,
}
const AM = '#f5a524', AM2 = '#ffb347', ST = '#8d99a6', K = '#0a0908'
const SERIF = "font-['Instrument_Serif',serif]"
const MONO = "font-['JetBrains_Mono',monospace]"
const grad = `linear-gradient(100deg, ${AM2} 0%, ${AM} 45%, #d7dde3 100%)`

const STAGES = [
  ['The whole car', 'Foam, hand wash, safe dry. The bit everyone sees — done properly.'],
  ['The wheels', 'Faces, barrels and nuts. Brake dust lifted, not just rinsed over.'],
  ['The calipers & bolts', 'The corners most valets skip. Cleaned by hand, bolt by bolt.'],
  ['The paint', 'Swirls and haze polished out so the reflection turns sharp again.'],
  ['The flake', 'Protected and glossed until every metallic flake catches the light.'],
]
const SV = [
  ['Exterior valet', 'Pre-wash, hand wash, wheels, glass and a streak-free finish.'],
  ['Interior valet', 'Vacuumed, shampooed and wiped down to the seams and vents.'],
  ['Wheels & calipers', 'Deep clean of faces, barrels, calipers and wheel bolts.'],
  ['Machine polish', 'Paint correction to reduce swirls, haze and light marring.'],
  ['Paint protection', 'Sealant or coating to lock in the gloss and repel the weather.'],
  ['Full detail', 'Every stage, inside and out — the whole story in one booking.'],
]

/* ---------- hero ---------- */
function Hero({ lite }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '40%'])
  const ls = useTransform(scrollYProgress, [0, 1], ['-0.02em', '0.06em'])
  return (
    <section ref={ref} className="relative h-[100svh] min-h-[640px] overflow-hidden" style={{ background: `radial-gradient(70% 60% at 75% 55%, #1c140a 0%, ${K} 70%)` }}>
      <div className="pointer-events-none absolute inset-0">{!lite ? <Suspense fallback={null}><Wheel3D /></Suspense> :
        <div className="absolute right-[-10%] top-1/2 h-[70vmin] w-[70vmin] -translate-y-1/2 animate-[spin_12s_linear_infinite] rounded-full border-[18px] border-[#1a1a1a]" style={{ background: 'repeating-conic-gradient(#8d99a6 0 8deg, #2a2a2a 8deg 72deg)' }} />}</div>
      <motion.div style={{ y }} className="relative z-10 mx-auto flex h-full max-w-[1360px] flex-col justify-between px-6 pb-20 pt-[6vh] md:justify-end md:px-10 md:pb-[12vh]">
        <div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }} className={`${MONO} mb-6 text-[11px] uppercase tracking-[.3em] text-[#8d99a6]`}>Car detailing · Leeds LS16 · <span className="text-[#f5a524]">{b.rating}★ / {b.rev} reviews</span></motion.p>
          <motion.h1 style={{ letterSpacing: ls }} className={`${SERIF} text-[clamp(60px,10.5vw,184px)] leading-[.86] text-[#f3eee6]`}>
            <SplitText text="It's all in" delay={1.3} stagger={.03} className="block" />
            <LineReveal delay={1.6} className="pr-[.1em]"><span style={{ '--g': grad }} className="bg-clip-text italic text-transparent [background-image:var(--g)]">the detail.</span></LineReveal>
          </motion.h1>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-6 md:mt-10">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }} className="max-w-[380px] text-[15px] leading-relaxed text-[#c9c2b6]/80 md:text-[17px]">Detailing for people who notice the wheel bolts. Scroll down — we will zoom in until you can see the flake in the paint.</motion.p>
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.2 }} className="flex flex-wrap gap-3">
            <Magnetic><a href="#book" data-cursor="Book" className="inline-flex h-14 items-center gap-3 rounded-full px-7 text-[15px] font-semibold text-[#0a0908]" style={{ background: AM }}>Book a detail <ArrowRight size={18} /></a></Magnetic>
            <a href={waLink(b.phone)} target="_blank" rel="noopener" className="inline-flex h-14 items-center gap-2 rounded-full border border-white/15 px-6 text-[15px] font-semibold text-white"><WA />WhatsApp</a>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}

/* ---------- signature: scroll-driven infinite macro zoom with magnifier ---------- */
const SCENES = [S0, S1, S2, S3]
function stageStyles(p, W, H) {
  const k = Math.min(W / 1600, H / 1000)
  const C = [W / 2, H / 2]
  const j = Math.min(Math.floor(p), 4), e = j >= 4 ? 0 : p - j
  const out = Array(5).fill(null)
  if (j >= 4) { out[4] = { transform: 'none', opacity: 1 }; return { out, j } }
  const F = [W / 2 + (FOCUS[j][0] - 800) * k, H / 2 + (FOCUS[j][1] - 500) * k]
  const w = e * e * (3 - 2 * e), s = Math.pow(ZOOM, e)
  const L = [C[0] + (F[0] - C[0]) * w, C[1] + (F[1] - C[1]) * w]
  const po = 1 - Math.min(1, Math.max(0, (e - .86) / .14))
  const co = Math.min(1, Math.max(0, (e - .25) / .5))
  const R = 20 + e * 110
  out[j] = { transform: `translate(${(C[0] - L[0]) * s}px, ${(C[1] - L[1]) * s}px) scale(${s})`, opacity: po, filter: `blur(${Math.max(0, e - .7) * 6}px)` }
  out[j + 1] = { transform: `translate(${(F[0] - L[0]) * s}px, ${(F[1] - L[1]) * s}px) scale(${s / ZOOM})`, opacity: co, WebkitMaskImage: `radial-gradient(closest-side, #000 ${R}%, transparent ${R + 35}%)`, maskImage: `radial-gradient(closest-side, #000 ${R}%, transparent ${R + 35}%)` }
  return { out, j }
}

function Stage({ p, W, H, lensRef, flake = true }) {
  const { out } = stageStyles(p, W, H)
  return (
    <>
      {SCENES.map((Sc, i) => <div key={i} className="absolute inset-0 origin-center will-change-transform" style={out[i] ? out[i] : { visibility: 'hidden' }}>{out[i] && <Sc />}</div>)}
      {flake && <div className="absolute inset-0 origin-center will-change-transform" style={out[4] ? out[4] : { visibility: 'hidden' }}><Flakes lens={lensRef} active={!!out[4]} scale={W < 768 ? 34 : 58} /></div>}
    </>
  )
}

function Zoom() {
  const ref = useRef(null), box = useRef(null)
  const lensRef = useRef({ x: 0, y: 0, r: 110, on: false })
  const [lens, setLens] = useState({ x: 0, y: 0, on: false })
  const [sz, setSz] = useState({ W: 1280, H: 800 })
  const [p, setP] = useState(0)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  useMotionValueEvent(scrollYProgress, 'change', v => setP(Math.min(4, Math.max(0, v * 4.5 - .1))))
  useEffect(() => {
    const f = () => { const r = box.current.getBoundingClientRect(); setSz({ W: r.width, H: r.height }); lensRef.current.r = r.width < 768 ? 78 : 115 }
    f(); addEventListener('resize', f); return () => removeEventListener('resize', f)
  }, [])
  const pos = e => { const r = box.current.getBoundingClientRect(); const L = { x: e.clientX - r.left, y: e.clientY - r.top, on: true }; Object.assign(lensRef.current, L); setLens(L) }
  const off = () => { lensRef.current.on = false; setLens(l => ({ ...l, on: false })) }
  const idx = Math.min(4, Math.round(p))
  const R = lensRef.current.r
  const mag = Math.round(Math.pow(ZOOM, p))
  return (
    <section ref={ref} id="detail" className="relative h-[560vh]" style={{ background: BG }}>
      <div ref={box} className="sticky top-0 h-screen touch-pan-y select-none overflow-hidden" onPointerMove={e => (e.pointerType === 'mouse' || e.buttons) && pos(e)} onPointerDown={pos} onPointerLeave={e => e.pointerType === 'mouse' && off()}>
        <div className="absolute inset-0 transition-[filter] duration-300" style={{ filter: lens.on ? 'blur(3px) brightness(.7)' : 'none' }}>
          <Stage p={p} W={sz.W} H={sz.H} lensRef={lensRef} />
        </div>
        {lens.on && p < 3.85 && (
          <div aria-hidden="true" className="pointer-events-none absolute z-10 overflow-hidden rounded-full shadow-[0_0_0_2px_#f5a524,0_20px_60px_rgba(0,0,0,.6)]" style={{ left: lens.x - R, top: lens.y - R, width: R * 2, height: R * 2 }}>
            <div className="absolute" style={{ left: -(lens.x - R), top: -(lens.y - R), width: sz.W, height: sz.H, transform: 'scale(2.2)', transformOrigin: `${lens.x}px ${lens.y}px` }}>
              <Stage p={p} W={sz.W} H={sz.H} flake={false} />
            </div>
          </div>
        )}
        {/* HUD */}
        <div className="pointer-events-none absolute inset-0 z-20">
          <div className="absolute inset-x-6 top-6 flex items-start justify-between md:inset-x-10 md:top-8">
            <p className={`${MONO} text-[11px] uppercase tracking-[.3em] text-[#8d99a6]`}>Macro · <span className="text-[#f5a524]">0{idx + 1}</span> / 05</p>
            <p className={`${MONO} text-right text-[11px] uppercase tracking-[.3em] text-[#8d99a6]`}>zoom<br /><span className={`${SERIF} text-[40px] normal-case tracking-normal text-[#f3eee6] md:text-[56px]`} style={{ fontVariantNumeric: 'tabular-nums' }}>×{mag}</span></p>
          </div>
          <div className="absolute bottom-8 left-6 right-6 md:bottom-12 md:left-10 md:right-auto md:max-w-[520px]">
            <div className="rounded-2xl bg-[#0a0908]/60 p-5 backdrop-blur-md md:p-6">
              <AnimatePresence mode="wait">
                <motion.div key={idx} initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -16, filter: 'blur(8px)' }} transition={{ duration: .45 }}>
                  <h3 className={`${SERIF} text-[clamp(34px,4.6vw,64px)] leading-[.95] text-[#f3eee6]`}>{STAGES[idx][0]}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-[#c9c2b6]/80 md:text-[16px]">{STAGES[idx][1]}</p>
                </motion.div>
              </AnimatePresence>
              <div className="mt-4 flex gap-1.5">{STAGES.map((_, i) => <span key={i} className="h-[3px] flex-1 overflow-hidden rounded bg-white/10"><span className="block h-full bg-[#f5a524]" style={{ width: `${Math.max(0, Math.min(1, p - i + 1)) * 100}%` }} /></span>)}</div>
            </div>
          </div>
          <AnimatePresence>{!lens.on && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`${MONO} absolute right-6 top-1/2 hidden -translate-y-1/2 rotate-90 text-[10px] uppercase tracking-[.3em] text-[#8d99a6] md:right-4 md:block`}>move the cursor to magnify</motion.p>}</AnimatePresence>
          <AnimatePresence>{!lens.on && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`${MONO} absolute left-1/2 top-[22%] -translate-x-1/2 whitespace-nowrap rounded-full bg-black/50 px-4 py-2 text-[10px] uppercase tracking-[.25em] text-[#f5a524] md:hidden`}>tap to magnify · scroll to zoom</motion.p>}</AnimatePresence>
        </div>
      </div>
    </section>
  )
}

/* ---------- transition: dive into the full stop ---------- */
function Dive() {
  const ref = useRef(null), dot = useRef(null), h = useRef(null)
  const [origin, setOrigin] = useState('50% 50%')
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const sc = useTransform(scrollYProgress, [0, .85], [1, 140], { clamp: true })
  const scE = useTransform(sc, v => v)
  const op = useTransform(scrollYProgress, [0, .1], [.4, 1])
  const fill = useTransform(scrollYProgress, [.6, .82], [0, 1])
  useLayoutEffect(() => {
    const f = () => { const d = dot.current; if (!d) return; setOrigin(`${d.offsetLeft + d.offsetWidth / 2}px ${d.offsetTop + d.offsetHeight * .74}px`) }
    f(); document.fonts?.ready.then(f); addEventListener('resize', f); return () => removeEventListener('resize', f)
  }, [])
  return (
    <section ref={ref} className="relative h-[220vh]" style={{ background: K }}>
      <div className="sticky top-0 grid h-screen place-items-center overflow-hidden px-6">
        <motion.h2 ref={h} style={{ scale: scE, transformOrigin: origin, opacity: op }} className={`${SERIF} relative text-center text-[clamp(64px,13vw,220px)] leading-[.9] text-[#f5a524] will-change-transform`}>
          Look <em>closer</em><span ref={dot}>.</span>
        </motion.h2>
        <motion.div aria-hidden="true" style={{ opacity: fill }} className="pointer-events-none absolute inset-0 bg-[#f5a524]" />
        <p className={`${MONO} absolute bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] uppercase tracking-[.3em] text-[#8d99a6]`}>keep scrolling</p>
      </div>
    </section>
  )
}

/* ---------- services: index rows with line-draw reveal ---------- */
function Row({ t, d, i }) {
  return (
    <motion.a href="#book" data-svc={t} data-cursor="Book" initial="h" whileInView="v" whileHover="o" viewport={{ once: true, margin: '-10% 0px' }} className="group relative block py-7 md:py-9">
      <motion.span variants={{ h: { scaleX: 0 }, v: { scaleX: 1, transition: { duration: 1.1, ease: [0.76, 0, 0.24, 1], delay: i * .06 } } }} className="absolute inset-x-0 top-0 block h-px origin-left bg-[#0a0908]" />
      <motion.span variants={{ h: { scaleY: 0 }, v: { scaleY: 0 }, o: { scaleY: 1 } }} transition={{ duration: .45, ease: [0.76, 0, 0.24, 1] }} className="absolute inset-0 origin-bottom bg-[#0a0908]" />
      <div className="relative grid items-baseline gap-3 transition-colors duration-300 group-hover:text-[#f5a524] md:grid-cols-[80px_1fr_1fr_40px]">
        <span className={`${MONO} text-[12px] tracking-[.2em] opacity-60`}>0{i + 1}</span>
        <h3 className={`${SERIF} text-[clamp(40px,5.6vw,84px)] leading-[.95]`}>{t}</h3>
        <p className="max-w-[420px] text-[16px] leading-relaxed opacity-75 group-hover:text-[#e8dcc6]">{d}</p>
        <ArrowUpRight className="hidden transition-transform duration-300 group-hover:rotate-45 md:block" size={32} />
      </div>
    </motion.a>
  )
}
function Services() {
  return (
    <section id="services" className="px-6 pb-28 pt-16 md:px-10" style={{ background: AM, color: K }}>
      <div className="mx-auto max-w-[1360px]">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <h2 className={`${SERIF} text-[clamp(56px,9vw,150px)] leading-[.85]`}><SplitText text="Every detail," className="block" /><SplitText text="one booking." delay={.15} className="block italic" /></h2>
          <p className={`${MONO} max-w-[300px] text-[12px] uppercase leading-relaxed tracking-[.15em]`}>Pick a service below and it drops straight into the booking form.</p>
        </div>
        <div>{SV.map(([t, d], i) => <Row key={t} t={t} d={d} i={i} />)}<span className="block h-px bg-[#0a0908]" /></div>
      </div>
    </section>
  )
}

function Proof() {
  return (
    <section className="relative overflow-hidden px-6 py-32 md:px-10" style={{ background: K }}>
      <div className="mx-auto grid max-w-[1360px] items-end gap-14 md:grid-cols-[auto_1fr]">
        <div>
          <p className={`${MONO} mb-4 text-[11px] uppercase tracking-[.3em] text-[#8d99a6]`}>Google rating</p>
          <div className="flex items-start gap-4">
            <span className={`${SERIF} text-[clamp(140px,22vw,320px)] leading-[.78] text-[#f3eee6]`}>{b.rating}</span>
            <div className="mt-4 grid gap-1">{[0, 1, 2, 3, 4].map(i => <motion.span key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * .08 }}><Star size={20} fill={AM} stroke="none" /></motion.span>)}</div>
          </div>
          <p className="mt-6 text-[18px] text-[#c9c2b6]">across <Counter to={b.rev} className={`${SERIF} text-[34px] text-[#f5a524]`} /> reviews</p>
        </div>
        <ScrollWords className={`${SERIF} text-[clamp(30px,3.6vw,54px)] leading-[1.1] text-[#f3eee6]`} text="Eighty-four reviews, every one of them five stars. That is what happens when nobody skips the wheel bolts." />
      </div>
    </section>
  )
}

/* ---------- transition: hexagonal aperture (iris) opens the booking ---------- */
function Iris({ children, id }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 10%'] })
  const p = useSpring(scrollYProgress, { stiffness: 70, damping: 20 })
  const cp = useTransform(p, v => {
    const r = v * 1700, a0 = v * 120 * Math.PI / 180
    return `polygon(${Array.from({ length: 6 }, (_, i) => { const a = a0 + i * Math.PI / 3; return `calc(50% + ${(Math.cos(a) * r).toFixed(1)}px) calc(30% + ${(Math.sin(a) * r).toFixed(1)}px)` }).join(',')})`
  })
  return (
    <section ref={ref} id={id} className="relative" style={{ background: K }}>
      <motion.div style={{ clipPath: cp }} className="relative" >{children}</motion.div>
    </section>
  )
}

function Book() {
  const bk = useBooking()
  const f = 'h-14 w-full border-b border-[#8d99a6]/40 bg-transparent text-[18px] text-white outline-none placeholder:text-white/35 focus:border-[#f5a524]'
  return (
    <div className="px-6 py-28 text-white md:px-10" style={{ background: 'linear-gradient(160deg, #1d2228 0%, #121518 60%)' }}>
      <div className="mx-auto grid max-w-[1240px] gap-14 md:grid-cols-2">
        <div>
          <p className={`${MONO} mb-6 text-[11px] uppercase tracking-[.3em] text-[#f5a524]`}>Booking</p>
          <h2 className={`${SERIF} text-[clamp(56px,8vw,128px)] leading-[.86]`}><SplitText text="Book the" className="block" /><SplitText text="detail." delay={.15} className="block italic text-[#f5a524]" /></h2>
          <p className="mb-8 mt-6 max-w-[400px] text-[17px] text-white/60">Leave your number and what you have in mind. We will get back to you to arrange a time.</p>
          <a href={'tel:' + tel(b.phone)} className={`${SERIF} block text-[40px]`}>{b.phone}</a>
        </div>
        <div>
          <AnimatePresence mode="wait">
            {!bk.s.sent ? (
              <motion.form key="f" exit={{ opacity: 0, scale: .96, filter: 'blur(8px)' }} onSubmit={bk.submit} noValidate className="grid gap-6">
                <input className={f} placeholder="Your name" value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} autoComplete="name" />
                <motion.input animate={bk.s.err ? { x: [0, -8, 8, -6, 6, 0] } : {}} className={f + (bk.s.err ? ' !border-red-400' : '')} type="tel" inputMode="tel" placeholder="+44 7___ ______" value={bk.s.phone} onFocus={phoneFocus(bk, '+44 ')} onChange={e => bk.upd('phone', e.target.value)} autoComplete="tel" />
                <div className="flex flex-wrap gap-2">{SV.map(s => s[0]).map(t => <button type="button" key={t} onClick={() => bk.upd('svc', t)} className={`rounded-full border px-4 py-2 text-[13px] transition-colors ${bk.s.svc === t ? 'border-[#f5a524] bg-[#f5a524] text-[#0a0908]' : 'border-white/15 text-white/70 hover:border-white/40'}`}>{t}</button>)}</div>
                <button disabled={bk.s.loading} className="mt-2 h-16 rounded-full text-[16px] font-semibold text-[#0a0908] transition-[scale,opacity] active:scale-[.97] disabled:opacity-60" style={{ background: AM }}>{bk.s.loading ? 'Sending…' : 'Request a booking'}</button>
                <p className="text-[13px] text-white/40">In the finished site this request goes straight to your phone / Telegram.</p>
              </motion.form>
            ) : (
              <motion.div key="ok" initial={{ opacity: 0, scale: 1.4, filter: 'blur(12px)' }} animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} transition={{ duration: .7 }} className="grid min-h-[340px] place-items-center text-center">
                <div><CheckDraw className="mx-auto mb-5 text-[#f5a524]" /><h3 className={`${SERIF} text-[48px]`}>Noted, in detail.</h3><p className="mx-auto mb-5 max-w-[340px] text-white/60">In the finished site this request goes straight to your phone / Telegram.</p><button onClick={bk.reset} className="underline underline-offset-4">Send another</button></div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

function Contact() {
  return (
    <section id="contact" className="px-6 py-28 md:px-10" style={{ background: K }}>
      <div className="mx-auto grid max-w-[1360px] gap-8 md:grid-cols-[.9fr_1.1fr]">
        <Reveal className="grid content-start gap-6 text-[#f3eee6]">
          <h2 className={`${SERIF} text-[clamp(56px,8vw,120px)] leading-[.86]`}>Find <em className="text-[#f5a524]">us</em></h2>
          <p className="flex items-start gap-3 text-[20px]"><MapPin className="mt-1 shrink-0 text-[#f5a524]" />{b.addr}</p>
          <a href={'tel:' + tel(b.phone)} className={`${SERIF} flex items-center gap-3 text-[38px]`}><Phone className="text-[#f5a524]" />{b.phone}</a>
          <div className="flex flex-wrap gap-2">
            <a href={waLink(b.phone)} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-full px-5 py-3 font-semibold text-[#0a0908]" style={{ background: AM }}><WA />WhatsApp</a>
            <a href={'tel:' + tel(b.phone)} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 font-semibold"><Phone size={16} />Call</a>
          </div>
        </Reveal>
        <Reveal delay={.1} className="h-[420px] overflow-hidden rounded-[24px] ring-1 ring-white/10"><GMap q={`${b.name}, ${b.addr}`} dark /></Reveal>
      </div>
    </section>
  )
}

function App() {
  useSmooth()
  const lite = useLite()
  return (
    <MotionConfig reducedMotion="user">
      <div className="font-['Inter',sans-serif]" style={{ background: K, color: '#f3eee6', '--sel': AM, '--selc': K }}>
        <Intro bg={K} fg="#f3eee6" duration={1.6}>
          <div className="relative grid place-items-center">
            <motion.span className="absolute rounded-full border border-[#f5a524]" initial={{ width: 400, height: 400, opacity: 0 }} animate={{ width: 20, height: 20, opacity: [0, 1, 1] }} transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }} />
            <span className={`${SERIF} text-[44px] italic`}>the detail<span className="text-[#f5a524]">.</span></span>
          </div>
        </Intro>
        <Grain opacity={.06} />
        <Progress color={AM} />
        <Cursor color={AM} blend="normal" textColor={K} />
        <Ribbon lang="en" name={b.name} bg={AM} fg={K} />
        <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0a0908]/70 backdrop-blur-xl">
          <div className="mx-auto flex h-[64px] max-w-[1360px] items-center justify-between px-6 md:px-10">
            <a href="#top" className={`${SERIF} text-[24px] leading-none`}>Itsallinthe<em className="text-[#f5a524]">DTail</em></a>
            <nav className={`${MONO} hidden gap-8 text-[11px] uppercase tracking-[.2em] text-white/55 md:flex`}>{[['#detail', 'Zoom in'], ['#services', 'Services'], ['#book', 'Book'], ['#contact', 'Contact']].map(([h, t]) => <a key={h} href={h} className="hover:text-[#f5a524]">{t}</a>)}</nav>
            <a href={'tel:' + tel(b.phone)} className="hidden h-10 items-center gap-2 rounded-full px-5 text-[14px] font-semibold text-[#0a0908] sm:inline-flex" style={{ background: AM }}><Phone size={15} />Call</a>
          </div>
        </header>
        <main id="top">
          <Hero lite={lite} />
          <div className="border-y border-white/5 py-5">
            <Marquee base={-1.4}>{['wheels', 'calipers', 'bolts', 'paint', 'flake', 'interior', 'glass'].map(t => <span key={t} className={`${SERIF} mx-8 inline-flex items-center gap-14 text-[clamp(40px,5vw,72px)] italic text-[#c9c2b6]`}>{t}<span className="inline-block h-2.5 w-2.5 rounded-full bg-[#f5a524]" /></span>)}</Marquee>
          </div>
          <Zoom />
          <Dive />
          <Services />
          <Proof />
          <Iris id="book"><Book /></Iris>
          <Contact />
        </main>
        <footer className={`${MONO} px-6 py-10 text-[11px] uppercase tracking-[.15em] text-white/40 md:px-10`}><div className="mx-auto flex max-w-[1360px] flex-wrap justify-between gap-4 border-t border-white/10 pt-8"><span>© 2026 {b.name} · Website concept by Artem</span><span>{b.addr}</span></div></footer>
        <CallBar lang="en" phone={b.phone} barCls="bg-[#0a0908]/85 backdrop-blur-xl" callCls="rounded-full border border-white/15 text-white" bookCls="rounded-full text-[#0a0908] bg-[#f5a524]" />
        <div className="h-[72px] sm:hidden" />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
