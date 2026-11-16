import React, { useRef, useState, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, AnimatePresence, MotionConfig, animate } from 'framer-motion'
import { ArrowUpRight, Phone, MapPin, Star } from 'lucide-react'
import '../lib/base.css'
import { useSmooth, Ribbon, SplitText, ScrollWords, Reveal, Magnetic, Cursor, Counter, useBooking, phoneFocus, CheckDraw, GMap, CallBar, Progress, Intro, tel, useLite, WA, waLink } from '../lib/kit'

const MarbleScene = lazy(() => import('./kathari3d'))

const b = {
  name: 'Kathari Nail Salon',
  short: 'Kathari',
  addr: '34 Islington Row Middleway, Birmingham B15 1LD',
  phone: '+44 7539 031868',
  rating: 4.8, rev: 340,
}
const MARBLE = '#f4f1ec', STONE = '#e6e0d7', GREY = '#8c857c', INK = '#2b2824', AEG = '#1f5f8b'
const SERIF = "font-['Marcellus',serif]"

const SV = [
  ['Α', 'Manicure', 'Shape, cuticle care and a clean, even finish.'],
  ['Β', 'Gel polish', 'High-shine colour that stays glossy for weeks.'],
  ['Γ', 'BIAB', 'Builder gel overlay to strengthen natural nails.'],
  ['Δ', 'Extensions', 'Length and shape, sculpted to suit your hands.'],
  ['Ε', 'Pedicure', 'Soak, tidy, file and polish — feet made new.'],
  ['Ζ', 'Nail art', 'Minimal lines, French tips, chrome and detail.'],
]
const STEPS = [
  ['I', 'Shape', 'Length evened out and filed to a clean, symmetrical shape.'],
  ['II', 'Cuticle', 'Cuticles softened and gently pushed back for a neat outline.'],
  ['III', 'Colour', 'Base, colour and a thin, even layer — edge to edge.'],
  ['IV', 'Gloss', 'Top coat cured to a mirror shine. Pure.'],
]
const SHADES = [['Aegean', AEG], ['Milk', '#f3eee6'], ['Nude', '#d7a99b']]
const marbleCss = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600'><filter id='m'><feTurbulence type='fractalNoise' baseFrequency='.004 .012' numOctaves='5' seed='7'/><feColorMatrix values='0 0 0 0 .55  0 0 0 0 .53  0 0 0 0 .5  0 0 0 -2.2 1.25'/></filter><rect width='100%' height='100%' fill='%23f4f1ec'/><rect width='100%' height='100%' filter='url(%23m)'/></svg>\")"

/* greek key border that draws itself */
function Meander({ units = 24, className = '', color = GREY }) {
  const W = units * 40
  let d = `M0,40 H${W} M0,0 H${W}`
  for (let i = 0; i < units; i++) { const o = i * 40; d += ` M${o},40 V6 H${o + 30} V32 H${o + 12} V14 H${o + 22} V24` }
  return (
    <svg viewBox={`0 -2 ${W} 44`} preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      <motion.path d={d} fill="none" stroke={color} strokeWidth="2" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 2.4, ease: 'easeInOut' }} />
    </svg>
  )
}

function Hero({ lite }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '35%'])
  const ls = useTransform(scrollYProgress, [0, 1], ['0.02em', '0.3em'])
  return (
    <section ref={ref} className="relative min-h-[100svh] overflow-hidden">
      <div className="absolute inset-0">
        {!lite ? <Suspense fallback={<div className="h-full w-full" style={{ backgroundImage: marbleCss, backgroundSize: 'cover' }} />}><MarbleScene progress={scrollYProgress} /></Suspense>
          : <div className="h-full w-full" style={{ backgroundImage: marbleCss, backgroundSize: 'cover' }} />}
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(244,241,236,.55),transparent_70%)]" />
      <motion.div style={{ y }} className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1280px] flex-col items-center justify-center px-5 pb-24 pt-20 text-center">
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.6, duration: 0.8 }} className="mb-6 text-[12px] font-medium uppercase tracking-[.5em] text-[#2b2824]/60">καθαρή — pure, clean</motion.p>
        <motion.h1 style={{ letterSpacing: ls }} className={`${SERIF} text-[clamp(64px,15vw,240px)] uppercase leading-[.85] text-[#2b2824]`}>
          <SplitText text="Kathari" delay={1.4} stagger={0.08} y="100%" />
        </motion.h1>
        <p className={`${SERIF} mt-6 text-[clamp(22px,2.6vw,36px)] text-[#2b2824]`}>
          <SplitText text="Pure hands." mode="words" delay={2} stagger={0.12} /> <SplitText text="Clean lines." mode="words" delay={2.25} stagger={0.12} className="text-[#1f5f8b]" />
        </p>
        <p className="mt-6 max-w-[440px] text-[16px] font-light leading-relaxed text-[#2b2824]/75">A calm, spotless nail salon on Islington Row, Birmingham. Manicures, gel and extensions with nothing out of place.</p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Magnetic><a href="#book" data-cursor="Book" className="inline-flex h-14 items-center gap-3 bg-[#2b2824] px-9 text-[13px] font-medium uppercase tracking-[.25em] text-[#f4f1ec] transition-colors hover:bg-[#1f5f8b]">Book a visit <ArrowUpRight size={16} /></a></Magnetic>
          <a href={waLink(b.phone)} target="_blank" rel="noopener" className="inline-flex h-14 items-center gap-2 border border-[#2b2824]/40 bg-[#f4f1ec]/60 px-7 text-[13px] font-medium uppercase tracking-[.2em] text-[#2b2824] backdrop-blur hover:border-[#2b2824]"><WA width={16} height={16} />WhatsApp</a>
        </div>
      </motion.div>
      <p className="pointer-events-none absolute bottom-7 left-1/2 z-10 hidden -translate-x-1/2 text-[11px] uppercase tracking-[.4em] text-[#2b2824]/45 md:block">Move the cursor to swirl the marble</p>
    </section>
  )
}

/* columns rise from the floor, the lintel settles on top */
function Column({ p, k, n }) {
  const s = 0.05 + (Math.abs(k - (n - 1) / 2) / n) * 0.3
  const y = useTransform(p, [s, s + 0.35], ['105%', '0%'])
  return (
    <motion.div style={{ y }} className="flex h-full w-[clamp(34px,6vw,84px)] flex-col items-center">
      <div className="h-[3%] w-[150%] bg-[#e6e0d7] shadow-[0_2px_0_#cfc7bb]" />
      <div className="h-[2.5%] w-[125%] rounded-b-[50%] bg-[#ece7df]" />
      <div className="relative w-full flex-1" style={{ background: 'repeating-linear-gradient(90deg, #f6f3ee 0 10%, #ddd6cb 10% 12%, #f6f3ee 12% 22%)', boxShadow: 'inset -10px 0 18px rgba(120,110,95,.25), inset 8px 0 14px rgba(255,255,255,.7)' }} />
      <div className="h-[2.5%] w-[125%] bg-[#ece7df]" />
      <div className="h-[3%] w-[150%] bg-[#e6e0d7]" />
    </motion.div>
  )
}
function Temple() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const N = 6
  const lintel = useTransform(scrollYProgress, [0.45, 0.65], ['-120%', '0%'])
  const tOp = useTransform(scrollYProgress, [0.6, 0.8], [0, 1])
  return (
    <section ref={ref} className="relative h-[230vh]" style={{ background: MARBLE }}>
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="absolute inset-x-0 bottom-0 h-[8%] bg-gradient-to-b from-[#e6e0d7] to-[#d8d0c4]" />
        <div className="absolute inset-x-[4%] bottom-[8%] top-[22%] flex items-stretch justify-between md:inset-x-[10%]">
          {Array.from({ length: N }, (_, k) => <Column key={k} k={k} n={N} p={scrollYProgress} />)}
        </div>
        <motion.div style={{ y: lintel }} className="absolute inset-x-[2%] top-[13%] h-[9%] md:inset-x-[8%]">
          <div className="grid h-full place-items-center bg-[#ece7df] shadow-[0_10px_30px_rgba(80,70,60,.15)]" style={{ backgroundImage: marbleCss, backgroundSize: '600px' }}>
            <span className={`${SERIF} text-[clamp(14px,2.2vw,28px)] tracking-[.5em] text-[#2b2824]/70`}>ΚΑΘΑΡΗ · PURE · CLEAN</span>
          </div>
        </motion.div>
        <motion.div style={{ opacity: tOp }} className="absolute inset-x-0 top-[34%] mx-auto max-w-[760px] px-[14%] text-center md:px-6">
          <div className="bg-[#f4f1ec]/85 p-6 backdrop-blur-sm md:p-10">
            <p className="mb-4 text-[11px] font-medium uppercase tracking-[.4em] text-[#1f5f8b]">The name</p>
            <p className={`${SERIF} text-[clamp(22px,3vw,40px)] leading-[1.2] text-[#2b2824]`}>Kathari comes from the Greek for pure. It's how every set should feel.</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ---- signature: the purity ritual ---- */
const JIT = Array.from({ length: 41 }, (_, i) => Math.sin(i * 12.9898) * 43758.5453 % 1)
function nailPath(t1) {
  const ry = 72 + 34 * (1 - t1), cx = 150 + (1 - t1) * 6, rx = 58
  let d = 'M92,300 L92,150'
  for (let i = 0; i <= 40; i++) {
    const a = Math.PI - (i / 40) * Math.PI
    const j = JIT[i] * 9 * (1 - t1) * Math.sin(a)
    d += ` L${(cx + Math.cos(a) * (rx + j * 0.4)).toFixed(1)},${(150 - Math.sin(a) * (ry + j)).toFixed(1)}`
  }
  return d + ' L208,150 L208,300 C190,318 110,318 92,300 Z'
}
function cuticlePath(h) {
  let d = `M92,330 L92,${300 - h * 0.6}`
  for (let i = 0; i <= 12; i++) { const x = 92 + i * 9.67; d += ` L${x},${(300 - h + (i % 2 ? 5 : -3) * (h / 26)).toFixed(1)}` }
  return d + ' L208,330 Z'
}
const clamp01 = v => Math.max(0, Math.min(1, v))
function RitualNail({ v, shade }) {
  const t1 = clamp01(v), t2 = clamp01(v - 1), t3 = clamp01(v - 2), t4 = clamp01(v - 3)
  const np = nailPath(t1)
  const ch = 26 * (1 - t2)
  return (
    <svg viewBox="40 20 220 420" className="h-full w-full" role="img" aria-label="Animated nail">
      <defs>
        <linearGradient id="kskin" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#d9b09c" /><stop offset=".45" stopColor="#f0d2c2" /><stop offset="1" stopColor="#d2a590" /></linearGradient>
        <clipPath id="knail"><path d={np} /></clipPath>
        <linearGradient id="kgloss" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset=".5" stopColor="#fff" stopOpacity=".9" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
      </defs>
      <rect x="62" y="70" width="176" height="420" rx="88" fill="url(#kskin)" />
      <path d={np} fill="#f2cfc4" stroke="#c99b8c" strokeWidth="1.5" />
      <path d="M110,300 C120,275 180,275 190,300 Z" fill="#fbeee8" opacity={0.7 * (1 - t3)} />
      <g clipPath="url(#knail)">
        <rect x="60" y={330 - t3 * 300} width="180" height="320" fill={shade} style={{ transition: 'fill .5s' }} />
        {t3 > 0 && t3 < 1 && <rect x="60" y={326 - t3 * 300} width="180" height="5" fill="#fff" opacity=".35" />}
        <rect x="104" y="96" width="14" height="180" rx="7" fill="#fff" opacity={t4 * 0.65} />
        <rect x={20 + t4 * 260} y="40" width="50" height="320" fill="url(#kgloss)" opacity={t4 > 0 && t4 < 1 ? 0.9 : 0} transform={`rotate(14 150 200)`} />
      </g>
      {ch > 0.5 && <path d={cuticlePath(ch)} fill="#e9c3b1" stroke="#cf9f8c" strokeWidth="1" />}
      {v > 1 && v < 2 && (
        <g transform={`translate(${95 + t2 * 110},${296 - ch}) rotate(-28)`}>
          <rect x="-4" y="-80" width="8" height="78" rx="3" fill="#b9bcc0" />
          <rect x="-7" y="-4" width="14" height="10" rx="4" fill="#dfe2e5" />
        </g>
      )}
      <AnimatePresence>
        {v > 3.92 && [[214, 96], [92, 128], [190, 60]].map(([x, y], k) => (
          <motion.path key={k} d={`M${x},${y - 12} L${x + 3},${y - 3} L${x + 12},${y} L${x + 3},${y + 3} L${x},${y + 12} L${x - 3},${y + 3} L${x - 12},${y} L${x - 3},${y - 3} Z`} fill={AEG}
            initial={{ scale: 0, opacity: 0 }} animate={{ scale: [0, 1.2, 1], opacity: 1 }} exit={{ scale: 0, opacity: 0 }} transition={{ delay: k * 0.12 }} style={{ transformOrigin: `${x}px ${y}px` }} />
        ))}
      </AnimatePresence>
    </svg>
  )
}
function Ritual() {
  const [val, setVal] = useState(0)
  const [shade, setShade] = useState(SHADES[0])
  const v = val / 25
  const step = Math.min(3, Math.floor(v - 0.0001 < 0 ? 0 : v - 0.0001))
  const go = k => { animate(val, (k + 1) * 25, { duration: 1.1, ease: [0.65, 0, 0.35, 1], onUpdate: setVal }) }
  return (
    <section id="ritual" className="relative overflow-hidden px-5 py-24 md:px-10 md:py-32" style={{ background: STONE }}>
      <Meander className="absolute inset-x-0 top-6 h-6 w-full opacity-60" />
      <div className="relative mx-auto grid max-w-[1280px] items-center gap-12 lg:grid-cols-[1fr_.9fr]">
        <div>
          <p className="mb-4 text-[11px] font-medium uppercase tracking-[.4em] text-[#1f5f8b]">The purity ritual</p>
          <h2 className={`${SERIF} text-[clamp(42px,6vw,96px)] leading-[.95] text-[#2b2824]`}>From bare<br />to <em className="not-italic text-[#1f5f8b]">pure.</em></h2>
          <p className="mt-5 max-w-[420px] font-light text-[#2b2824]/70">Drag the slider and watch a manicure come together in four calm steps — exactly the order we follow in the salon.</p>
          <div className="mt-10 grid grid-cols-4 gap-2">
            {STEPS.map(([n, t], k) => (
              <button key={n} onClick={() => go(k)} className={`border-t-2 pt-3 text-left transition-colors ${k <= step && v > 0 ? 'border-[#1f5f8b] text-[#2b2824]' : 'border-[#2b2824]/15 text-[#2b2824]/45'}`}>
                <span className={`${SERIF} block text-[20px]`}>{n}</span>
                <span className="text-[12px] uppercase tracking-[.18em]">{t}</span>
              </button>
            ))}
          </div>
          <div className="relative mt-8">
            <input type="range" min="0" max="100" step="0.1" value={val} onChange={e => setVal(+e.target.value)} aria-label="Ritual progress"
              className="k-range h-10 w-full cursor-grab touch-pan-y appearance-none bg-transparent active:cursor-grabbing"
              style={{ '--p': `${val}%` }} data-cursor="Drag" />
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={step + (v > 0 ? 'a' : 'b')} initial={{ opacity: 0, clipPath: 'inset(0 100% 0 0)' }} animate={{ opacity: 1, clipPath: 'inset(0 0% 0 0)' }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="mt-6 min-h-[84px]">
              {v === 0 ? <p className={`${SERIF} text-[24px] text-[#2b2824]/60`}>A bare nail, as it arrives.</p> : <>
                <p className={`${SERIF} text-[26px] text-[#2b2824]`}>{STEPS[step][0]}. {STEPS[step][1]}</p>
                <p className="mt-1 font-light text-[#2b2824]/70">{STEPS[step][2]}</p></>}
            </motion.div>
          </AnimatePresence>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="text-[11px] uppercase tracking-[.3em] text-[#2b2824]/55">Shade</span>
            {SHADES.map(s => <button key={s[0]} onClick={() => setShade(s)} aria-pressed={shade[0] === s[0]} className={`flex items-center gap-2 border px-3 py-2 text-[12px] uppercase tracking-[.16em] ${shade[0] === s[0] ? 'border-[#2b2824] text-[#2b2824]' : 'border-[#2b2824]/20 text-[#2b2824]/55'}`}><span className="h-4 w-4 rounded-full ring-1 ring-black/10" style={{ background: s[1] }} />{s[0]}</button>)}
            <a href="#book" data-svc={`Gel manicure — ${shade[0]}`} className="ml-auto inline-flex items-center gap-2 border-b border-[#1f5f8b] pb-1 text-[12px] font-medium uppercase tracking-[.2em] text-[#1f5f8b]">Book this <ArrowUpRight size={14} /></a>
          </div>
        </div>
        <div className="relative mx-auto aspect-[4/5] w-full max-w-[440px]">
          <div className="absolute inset-0 rounded-t-full border border-[#2b2824]/10" style={{ backgroundImage: marbleCss, backgroundSize: '500px' }} />
          <div className="absolute inset-[8%_12%_0]"><RitualNail v={v} shade={shade[1]} /></div>
          <div className={`${SERIF} absolute -bottom-2 right-0 translate-y-full pt-3 text-[13px] tracking-[.3em] text-[#2b2824]/50`}>{String(Math.round(val)).padStart(3, '0')} / 100</div>
        </div>
      </div>
      <style>{`.k-range::-webkit-slider-runnable-track{height:2px;background:linear-gradient(90deg,${AEG} var(--p),rgba(43,40,36,.18) var(--p))}
.k-range::-moz-range-track{height:2px;background:linear-gradient(90deg,${AEG} var(--p),rgba(43,40,36,.18) var(--p))}
.k-range::-webkit-slider-thumb{-webkit-appearance:none;margin-top:-17px;height:36px;width:36px;border-radius:9999px;background:${MARBLE};border:1px solid ${INK};box-shadow:0 6px 16px rgba(43,40,36,.2)}
.k-range::-moz-range-thumb{height:36px;width:36px;border-radius:9999px;background:${MARBLE};border:1px solid ${INK}}
.k-range:focus-visible{outline:2px solid ${AEG};outline-offset:6px}`}</style>
    </section>
  )
}

function Services() {
  return (
    <section id="services" className="relative px-5 py-28 md:px-10" style={{ background: MARBLE }}>
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-14 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
          <h2 className={`${SERIF} text-[clamp(44px,7vw,112px)] leading-[.9] text-[#2b2824]`}><SplitText text="Treatments" /></h2>
          <p className="max-w-[320px] font-light text-[#2b2824]/65">Each one done with the same quiet care. Message us for current prices and availability.</p>
        </div>
        <div className="border-t border-[#2b2824]/20">
          {SV.map(([g, t, d], k) => (
            <motion.a key={t} href="#book" data-svc={t} data-cursor="Book"
              initial={{ clipPath: 'inset(0 100% 0 0)' }} whileInView={{ clipPath: 'inset(0 0% 0 0)' }} viewport={{ once: true, margin: '0px 0px -10% 0px' }} transition={{ duration: 1, ease: [0.65, 0, 0.35, 1], delay: k * 0.05 }}
              className="group relative grid grid-cols-[48px_1fr] items-baseline gap-x-4 gap-y-1 border-b border-[#2b2824]/20 py-7 md:grid-cols-[90px_1fr_1fr_40px] md:py-9">
              <span className="absolute inset-0 origin-left scale-x-0 bg-[#1f5f8b] transition-transform duration-500 ease-out group-hover:scale-x-100" />
              <span className={`${SERIF} relative text-[28px] text-[#1f5f8b] transition-colors group-hover:text-[#f4f1ec]`}>{g}</span>
              <span className={`${SERIF} relative text-[clamp(30px,4vw,56px)] leading-none text-[#2b2824] transition-colors group-hover:text-[#f4f1ec]`}>{t}</span>
              <span className="relative col-start-2 font-light text-[#2b2824]/65 transition-colors group-hover:text-[#f4f1ec]/80 md:col-start-auto">{d}</span>
              <ArrowUpRight className="relative hidden text-[#2b2824] transition-all group-hover:rotate-45 group-hover:text-[#f4f1ec] md:block" />
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  )
}

function Rating() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const sc = useTransform(scrollYProgress, [0, 0.6], [2.6, 1])
  const op = useTransform(scrollYProgress, [0.45, 0.75], [0, 1])
  return (
    <section ref={ref} className="relative h-[200vh]" style={{ background: MARBLE }}>
      <div className="sticky top-0 grid h-screen place-items-center overflow-hidden px-5">
        <div className="text-center">
          <motion.div style={{ scale: sc }} className={`${SERIF} bg-clip-text text-[clamp(150px,30vw,420px)] leading-[.85] text-transparent`}>
            <span style={{ backgroundImage: `${marbleCss}, linear-gradient(#bdb5a9,#8c857c)`, backgroundSize: '700px, cover', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', WebkitTextStroke: '1.5px rgba(43,40,36,.4)' }}>4.8</span>
          </motion.div>
          <motion.div style={{ opacity: op }} className="mt-4">
            <div className="mb-3 flex justify-center gap-1.5 text-[#1f5f8b]">{[0, 1, 2, 3, 4].map(k => <Star key={k} size={22} fill="currentColor" />)}</div>
            <p className={`${SERIF} text-[clamp(22px,2.6vw,34px)] text-[#2b2824]`}><Counter to={b.rev} /> reviews on Google</p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function Book() {
  const bk = useBooking()
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 30%'] })
  const bg = useTransform(scrollYProgress, [0, 1], [MARBLE, AEG])
  const f = 'h-14 w-full border-0 border-b border-[#2b2824]/25 bg-transparent text-[18px] font-light text-[#2b2824] outline-none placeholder:text-[#2b2824]/35 focus:border-[#1f5f8b]'
  return (
    <motion.section ref={ref} id="book" style={{ background: bg }} className="relative px-5 py-28 md:px-10">
      <div className="mx-auto grid max-w-[1280px] items-center gap-12 lg:grid-cols-2">
        <div className="text-[#f4f1ec]">
          <p className="mb-4 text-[11px] font-medium uppercase tracking-[.4em] text-[#f4f1ec]/70">Appointments</p>
          <h2 className={`${SERIF} text-[clamp(48px,7vw,112px)] leading-[.9]`}>Reserve<br />your calm</h2>
          <p className="mt-6 max-w-[400px] font-light text-[#f4f1ec]/75">Leave your number and we'll message you back with a time — or WhatsApp us directly.</p>
          <a href={'tel:' + tel(b.phone)} className={`${SERIF} mt-8 block text-[clamp(28px,3vw,40px)]`}>{b.phone}</a>
        </div>
        <Reveal className="bg-[#f4f1ec] p-8 shadow-[0_40px_80px_rgba(10,30,45,.35)] md:p-12">
          <AnimatePresence mode="wait">
            {!bk.s.sent ? (
              <motion.form key="f" exit={{ opacity: 0, clipPath: 'inset(0 0 0 100%)' }} onSubmit={bk.submit} noValidate className="grid gap-6">
                <input className={f} placeholder="Your name" value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} autoComplete="name" />
                <motion.input animate={bk.s.err ? { x: [0, -8, 8, -5, 5, 0] } : {}} className={f + (bk.s.err ? ' !border-red-600' : '')} type="tel" inputMode="tel" placeholder="+44 7___ ______" value={bk.s.phone} onFocus={phoneFocus(bk, '+44 ')} onChange={e => bk.upd('phone', e.target.value)} autoComplete="tel" />
                {bk.s.err && <p className="-mt-3 text-[13px] text-red-700">Please enter a full phone number.</p>}
                <input className={f} placeholder="Treatment" value={bk.s.svc} onChange={e => bk.upd('svc', e.target.value)} />
                <button disabled={bk.s.loading} className="mt-2 h-16 bg-[#2b2824] text-[13px] font-medium uppercase tracking-[.28em] text-[#f4f1ec] transition-colors hover:bg-[#1f5f8b] disabled:opacity-60">{bk.s.loading ? 'Sending…' : 'Request a time'}</button>
                <p className="text-center text-[13px] font-light text-[#2b2824]/55">In the finished site this request goes straight to your phone.</p>
              </motion.form>
            ) : (
              <motion.div key="ok" initial={{ opacity: 0, clipPath: 'inset(0 100% 0 0)' }} animate={{ opacity: 1, clipPath: 'inset(0 0% 0 0)' }} transition={{ duration: 0.8 }} className="grid place-items-center py-10 text-center text-[#2b2824]">
                <CheckDraw className="mb-5 text-[#1f5f8b]" />
                <h3 className={`${SERIF} text-[42px]`}>Thank you</h3>
                <p className="mt-2 max-w-[320px] font-light text-[#2b2824]/65">In the finished site this request goes straight to your phone, and the salon replies with a time.</p>
                <button onClick={bk.reset} className="mt-5 text-[12px] uppercase tracking-[.2em] underline underline-offset-4">Book another</button>
              </motion.div>
            )}
          </AnimatePresence>
        </Reveal>
      </div>
    </motion.section>
  )
}

function Contact() {
  return (
    <section id="contact" className="relative px-5 py-24 md:px-10" style={{ background: MARBLE }}>
      <Meander className="absolute inset-x-0 top-0 h-6 w-full opacity-50" />
      <div className="mx-auto grid max-w-[1280px] gap-10 pt-6 lg:grid-cols-[.9fr_1.1fr]">
        <div>
          <p className="mb-4 text-[11px] font-medium uppercase tracking-[.4em] text-[#1f5f8b]">Find us</p>
          <h2 className={`${SERIF} mb-8 text-[clamp(44px,6vw,88px)] leading-[.92] text-[#2b2824]`}>Islington Row</h2>
          <p className="mb-5 flex items-start gap-3 text-[19px] font-light"><MapPin className="mt-1 shrink-0 text-[#1f5f8b]" />{b.addr}</p>
          <a href={'tel:' + tel(b.phone)} className="flex items-center gap-3 text-[22px]"><Phone size={18} className="text-[#1f5f8b]" />{b.phone}</a>
          <div className="mt-8 flex flex-wrap gap-3">
            <Magnetic><a href={waLink(b.phone)} target="_blank" rel="noopener" className="inline-flex h-12 items-center gap-2 bg-[#2b2824] px-6 text-[12px] font-medium uppercase tracking-[.2em] text-[#f4f1ec] hover:bg-[#1f5f8b]"><WA width={16} height={16} />WhatsApp</a></Magnetic>
            <a href={'tel:' + tel(b.phone)} className="inline-flex h-12 items-center gap-2 border border-[#2b2824]/40 px-6 text-[12px] font-medium uppercase tracking-[.2em] hover:border-[#2b2824]"><Phone size={15} />Call</a>
          </div>
        </div>
        <div className="h-[380px] overflow-hidden border border-[#2b2824]/15 md:h-[460px]" style={{ filter: 'grayscale(.85) contrast(1.05)' }}><GMap q={`${b.name}, ${b.addr}`} /></div>
      </div>
    </section>
  )
}

function App() {
  useSmooth()
  const lite = useLite()
  return (
    <MotionConfig reducedMotion="user">
      <div className="overflow-x-clip font-['Jost',sans-serif]" style={{ background: MARBLE, color: INK, '--sel': AEG, '--selc': MARBLE }}>
        <Intro bg={MARBLE} fg={INK} duration={1.6}>
          <div className="text-center">
            <motion.div initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} style={{ originY: 1 }} className="mx-auto h-24 w-8" >
              <div className="h-full w-full" style={{ background: 'repeating-linear-gradient(90deg,#f6f3ee 0 20%,#cfc7bb 20% 26%)', boxShadow: 'inset -4px 0 8px rgba(0,0,0,.15)' }} />
            </motion.div>
            <p className={`${SERIF} mt-4 text-[22px] tracking-[.5em]`}>KATHARI</p>
          </div>
        </Intro>
        <Progress color={AEG} />
        <Cursor color={AEG} blend="normal" textColor={MARBLE} />
        <Ribbon lang="en" name={b.name} bg={INK} fg={MARBLE} />
        <header className="sticky top-0 z-40 border-b border-[#2b2824]/10 bg-[#f4f1ec]/80 backdrop-blur-xl">
          <div className="mx-auto flex h-[68px] max-w-[1280px] items-center justify-between px-5 md:px-10">
            <a href="#top" className={`${SERIF} text-[22px] tracking-[.35em]`}>KATHARI</a>
            <nav className="hidden gap-9 text-[12px] uppercase tracking-[.24em] text-[#2b2824]/60 md:flex">{[['#ritual', 'Ritual'], ['#services', 'Treatments'], ['#book', 'Book'], ['#contact', 'Find us']].map(([h, t]) => <a key={h} href={h} className="hover:text-[#1f5f8b]">{t}</a>)}</nav>
            <a href="#book" className="hidden h-10 items-center bg-[#2b2824] px-6 text-[12px] uppercase tracking-[.22em] text-[#f4f1ec] hover:bg-[#1f5f8b] sm:inline-flex">Book</a>
          </div>
        </header>
        <main id="top">
          <Hero lite={lite} />
          <Temple />
          <section className="px-5 py-24 md:px-10" style={{ background: MARBLE }}>
            <ScrollWords text="No clutter, no rush, no shortcuts. Just clean tools, a calm room and nails finished to perfection." className={`${SERIF} mx-auto max-w-[1100px] text-center text-[clamp(28px,4.4vw,64px)] leading-[1.15] text-[#2b2824]`} />
          </section>
          <Ritual />
          <Services />
          <Rating />
          <Book />
          <Contact />
        </main>
        <footer className="border-t border-[#2b2824]/10 px-5 py-8 text-[13px] font-light text-[#2b2824]/55 md:px-10">
          <div className="mx-auto flex max-w-[1280px] flex-wrap justify-between gap-4"><span>© 2026 {b.name} · Website concept by Artem</span><span>{b.addr}</span></div>
        </footer>
        <CallBar lang="en" phone={b.phone} barCls="bg-[#f4f1ec]/95 backdrop-blur border-t border-[#2b2824]/10" callCls="border border-[#2b2824]" bookCls="bg-[#2b2824] text-[#f4f1ec]" />
        <div className="h-[72px] sm:hidden" />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
