import React, { useRef, useState, useEffect, useMemo, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence, MotionConfig } from 'framer-motion'
import { ArrowRight, Phone, MapPin, Star, Wind, Armchair, Gauge, Droplets, Car, PawPrint, Check } from 'lucide-react'
import '../lib/base.css'
import { useSmooth, Ribbon, SplitText, LineReveal, ScrollWords, Reveal, Magnetic, Cursor, Marquee, Counter, useBooking, phoneFocus, CheckDraw, GMap, CallBar, Progress, Intro, tel, useLite, WA, waLink } from '../lib/kit'

const SteamSeat = lazy(() => import('./mcrpristine3d'))

const b = {
  name: 'MCR Pristine Clean',
  addr: '189 Mauldeth Rd, Manchester M19 1BA',
  phone: '+44 7466 957203',
  rating: '5.0', rev: 55,
}
const WHITE = '#f7faf9', MINT = '#5fd6b0', MINTD = '#0f8f6c', SLATE = '#24313b', SLATE2 = '#3a4a56'
const H = "font-['Manrope',sans-serif]"
const SERIF = "font-['Instrument_Serif',serif] italic font-normal"

const SV = [
  ['Interior steam clean', 'Hot steam through seats, vents, seams and door pockets — loosens grime without soaking.', Wind],
  ['Seat & carpet shampoo', 'Fabric shampooed and extracted to lift spills, marks and smells.', Armchair],
  ['Dashboard & console', 'Vents, buttons, cup holders and screens detailed and wiped down.', Gauge],
  ['Exterior wash', 'Snow foam, hand wash, wheels and a streak-free dry.', Droplets],
  ['Full valet', 'Inside and out in one booking — a fresh start for the whole car.', Car],
  ['Pet hair & odour', 'Fur removed from fabric and the cabin left smelling clean.', PawPrint],
]
const PROC = [
  ['Steam', 'Dry, hot steam opens up fabric and softens what has dried in.'],
  ['Lift', 'Brushes and agitation work grime up and out of the fibres.'],
  ['Extract', 'Dirt and moisture are pulled away instead of pushed deeper.'],
  ['Fresh', 'Surfaces dried off, glass cleared, cabin aired and handed back.'],
]
const ZONES = [
  { k: 'headliner', label: 'Headliner', d: 'Roof lining refreshed with a gentle, low-moisture clean.' },
  { k: 'dash', label: 'Dashboard & console', d: 'Vents, buttons, screens and cup holders steamed and wiped.' },
  { k: 'carpets', label: 'Carpets & mats', d: 'Footwells shampooed, mats cleaned and grit pulled out.' },
  { k: 'front', label: 'Front seats', d: 'Seat bases, bolsters and seams steam-cleaned.' },
  { k: 'rear', label: 'Rear seats', d: 'The bench that gets the crumbs, the spills and the dog.' },
  { k: 'boot', label: 'Boot', d: 'Boot liner and sides cleaned of mud, sand and smells.' },
]

/* ---------- transitions ---------- */
function Mist({ children, className = '', delay = 0, as = 'div' }) {
  const T = motion[as]
  return (
    <T className={className} initial={{ clipPath: 'inset(100% 0 0 0)', filter: 'blur(14px)', y: 40, opacity: 0 }} whileInView={{ clipPath: 'inset(0% 0 -10% 0)', filter: 'blur(0px)', y: 0, opacity: 1 }}
      viewport={{ once: true, margin: '0px 0px -8% 0px' }} transition={{ duration: 1.15, ease: [0.16, 1, 0.3, 1], delay }}>{children}</T>
  )
}
function FogBlob({ p, x, s, d, top }) {
  const y = useTransform(p, [0, 1], ['50%', '-45%'])
  const sc = useTransform(p, [0, 1], [.5 * s, 1.7 * s])
  const o = useTransform(p, [d, d + .3, 1], [0, 1, 1])
  return <motion.span style={{ left: x + '%', top: top + '%', y, scale: sc, opacity: o, background: `radial-gradient(circle, ${WHITE} 0%, rgba(247,250,249,.85) 30%, rgba(247,250,249,0) 66%)` }} className="absolute h-[46vw] min-h-[260px] w-[46vw] min-w-[260px] -translate-x-1/2 rounded-full" />
}
function Fog() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const blobs = useMemo(() => Array.from({ length: 14 }, (_, k) => ({ x: (k * 23) % 104 - 2, s: .8 + (k % 4) * .25, d: (k % 5) * .07, top: 10 + (k * 17) % 60 })), [])
  return (
    <div ref={ref} aria-hidden="true" className="relative h-[70vh] overflow-hidden" style={{ background: `linear-gradient(${SLATE} 0%, ${SLATE2} 35%, #b9c7c6 70%, ${WHITE} 100%)` }}>
      {blobs.map((bl, k) => <FogBlob key={k} p={scrollYProgress} {...bl} />)}
    </div>
  )
}

/* ---------- hero: pinned, scroll moves the steam wand ---------- */
function LiteSeat() {
  return (
    <div className="absolute right-[8%] top-[18%] hidden h-[56vh] w-[30vw] md:block" aria-hidden="true">
      <div className="absolute bottom-0 h-[30%] w-full rounded-[40px] bg-[#c4cdd2]" />
      <div className="absolute bottom-[22%] left-[8%] h-[70%] w-[84%] rounded-[40px] bg-[#d6dde0]" />
      {[0, 1, 2, 3, 4].map(k => <motion.span key={k} className="absolute h-24 w-24 rounded-full bg-white/40 blur-2xl" style={{ left: `${k * 20}%`, bottom: '30%' }} animate={{ y: [0, -200], opacity: [0, .8, 0] }} transition={{ duration: 4, repeat: Infinity, delay: k * .7 }} />)}
    </div>
  )
}
function Hero({ lite }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const [pct, setPct] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', v => setPct(Math.round(Math.min(1, v * 1.15) * 100)))
  const ty = useTransform(scrollYProgress, [.7, 1], ['0%', '-12%'])
  return (
    <section ref={ref} className="relative h-[230vh]" style={{ background: SLATE }}>
      <div className="sticky top-0 h-[100svh] min-h-[620px] overflow-hidden" style={{ background: `radial-gradient(80% 70% at 70% 45%, #33444f 0%, ${SLATE} 70%)` }}>
        <div className="absolute inset-0">{lite ? <LiteSeat /> : <Suspense fallback={<LiteSeat />}><SteamSeat progress={scrollYProgress} /></Suspense>}</div>
        <motion.div style={{ y: ty }} className="pointer-events-none relative z-10 mx-auto flex h-full max-w-[1320px] flex-col justify-end px-5 pb-24 md:justify-center md:px-10 md:pb-0">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }} className="mb-5 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[.22em] text-[#5fd6b0]"><span className="h-px w-8 bg-[#5fd6b0]" />Steam-clean valeting · Manchester</motion.p>
          <h1 className={`${H} max-w-[760px] text-[clamp(50px,8.6vw,138px)] font-extrabold leading-[.9] tracking-[-.05em] text-white`}>
            <SplitText text="Steam out" delay={1.3} className="block" />
            <SplitText text="the stains." delay={1.5} className="block" />
            <LineReveal delay={1.8} className={`${SERIF} text-[#5fd6b0] tracking-[-.02em]`}>breathe in clean.</LineReveal>
          </h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.1 }} className="mt-6 max-w-[460px] text-[17px] text-white/70">Interior steam cleaning and valeting from MCR Pristine Clean. Scroll — watch the wand go to work.</motion.p>
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.3 }} className="pointer-events-auto mt-8 flex flex-wrap items-center gap-3">
            <Magnetic><a href="#map" data-cursor="Build" className="inline-flex h-14 items-center gap-3 rounded-full bg-[#5fd6b0] px-8 text-[16px] font-bold text-[#24313b] transition-[scale] active:scale-95 md:h-16">Build your valet <ArrowRight size={19} /></a></Magnetic>
            <a href={waLink(b.phone)} target="_blank" rel="noopener" className="inline-flex h-14 items-center gap-2 rounded-full bg-white/10 px-6 font-bold text-white ring-1 ring-white/20 backdrop-blur md:h-16"><WA /> WhatsApp</a>
          </motion.div>
        </motion.div>
        <div className="absolute bottom-6 right-5 z-10 hidden items-center gap-3 rounded-full bg-white/10 px-4 py-2 text-[13px] font-semibold text-white/80 ring-1 ring-white/15 backdrop-blur md:flex">
          <span className="relative h-1.5 w-28 overflow-hidden rounded-full bg-white/15"><span className="absolute inset-y-0 left-0 bg-[#5fd6b0]" style={{ width: pct + '%' }} /></span>
          demo seat · {pct}% steamed
        </div>
      </div>
    </section>
  )
}

/* ---------- signature: top-down interior map ---------- */
const BODY = 'M150 18 C228 18 262 52 262 132 L262 482 C262 552 232 584 150 584 C68 584 38 552 38 482 L38 132 C38 52 72 18 150 18Z'
const rr = (x, y, w, h, r) => `M${x + r} ${y}H${x + w - r}Q${x + w} ${y} ${x + w} ${y + r}V${y + h - r}Q${x + w} ${y + h} ${x + w - r} ${y + h}H${x + r}Q${x} ${y + h} ${x} ${y + h - r}V${y + r}Q${x} ${y} ${x + r} ${y}Z`
const SHAPES = {
  headliner: rr(50, 98, 200, 378, 34) + rr(64, 112, 172, 350, 24),
  dash: rr(70, 146, 160, 36, 14) + rr(140, 182, 20, 150, 8),
  carpets: rr(76, 188, 56, 40, 10) + rr(168, 188, 56, 40, 10) + rr(76, 336, 148, 28, 10),
  front: rr(78, 234, 54, 92, 16) + rr(168, 234, 54, 92, 16),
  rear: rr(76, 370, 148, 76, 20),
  boot: rr(66, 482, 168, 82, 22),
}
const CENTER = { headliner: [150, 105], dash: [150, 164], carpets: [104, 208], front: [105, 280], rear: [150, 408], boot: [150, 523] }

function Puff({ x, y }) {
  return (
    <g style={{ pointerEvents: 'none' }} filter="url(#soft)">
      {[0, 1, 2, 3, 4, 5].map(k => (
        <motion.circle key={k} cx={x + (k - 2.5) * 6} fill={k % 2 ? '#ffffff' : '#bff3e2'} initial={{ cy: y, r: 4, opacity: .95 }} animate={{ cy: y - 46 - k * 8, r: 16 + k * 3, opacity: 0, cx: x + (k - 2.5) * 12 }} transition={{ duration: 1.25, delay: k * .05, ease: 'easeOut' }} />
      ))}
    </g>
  )
}
function Zone({ z, on, toggle }) {
  return (
    <motion.path d={SHAPES[z.k]} fillRule="evenodd" role="button" tabIndex={0} aria-pressed={on} aria-label={z.label} data-cursor="Steam"
      onClick={e => toggle(z.k, e)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(z.k, null) } }}
      className="cursor-pointer outline-none transition-[stroke-width] focus-visible:[stroke-width:4]"
      animate={{ fill: on ? MINT : z.k === 'headliner' ? '#dfe7ea' : '#eef3f4' }} whileHover={{ scale: 1.015 }} style={{ transformOrigin: `${CENTER[z.k][0]}px ${CENTER[z.k][1]}px` }}
      stroke={on ? MINTD : '#9fb0b8'} strokeWidth="2" />
  )
}
function InteriorMap({ sel, toggleSel }) {
  const svg = useRef(null)
  const [puffs, setPuffs] = useState([])
  const toggle = (k, e) => {
    let x = CENTER[k][0], y = CENTER[k][1]
    if (e && e.clientX && svg.current) {
      const pt = svg.current.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY
      const p = pt.matrixTransform(svg.current.getScreenCTM().inverse()); x = p.x; y = p.y
    }
    if (!sel.includes(k)) { const id = Math.random(); setPuffs(ps => [...ps, { id, x, y }]); setTimeout(() => setPuffs(ps => ps.filter(p => p.id !== id)), 1500) }
    toggleSel(k)
  }
  return (
    <svg ref={svg} viewBox="0 0 300 600" className="mx-auto h-[min(76svh,640px)] w-auto touch-manipulation select-none drop-shadow-[0_40px_60px_rgba(36,49,59,.25)]" role="group" aria-label="Car interior, top-down">
      <defs>
        <filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" /></filter>
        <linearGradient id="glass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#9fd9cf" /><stop offset="1" stopColor="#4f6b75" /></linearGradient>
      </defs>
      {[[22, 120], [262, 120], [22, 430], [262, 430]].map(([x, y], k) => <rect key={k} x={x} y={y} width="16" height="62" rx="6" fill="#1a232a" />)}
      <path d="M38 150 l-18 -6 v18 l18 4Z M262 150 l18 -6 v18 l-18 4Z" fill={SLATE} />
      <path d={BODY} fill={SLATE} />
      <path d="M70 92 Q150 64 230 92 L222 112 Q150 92 78 112Z" fill="url(#glass)" opacity=".85" />
      <path d="M78 470 Q150 486 222 470 L226 480 Q150 498 74 480Z" fill="url(#glass)" opacity=".7" />
      {ZONES.map(z => <Zone key={z.k} z={z} on={sel.includes(z.k)} toggle={toggle} />)}
      <circle cx="105" cy="168" r="13" fill="none" stroke={SLATE} strokeWidth="4" style={{ pointerEvents: 'none' }} />
      {[['dash', 'DASH', 150, 168], ['front', 'SEAT', 105, 284], ['front', 'SEAT', 195, 284], ['rear', 'REAR SEATS', 150, 412], ['boot', 'BOOT', 150, 528], ['carpets', 'MATS', 150, 354]].map(([k, t, x, y], i) => <text key={i} x={x} y={y} textAnchor="middle" fontSize="10" fontWeight="800" letterSpacing="1.5" fill={sel.includes(k) ? SLATE : '#7d8f98'} style={{ pointerEvents: 'none', fontFamily: 'Manrope' }}>{t}</text>)}
      <text x="150" y="108" textAnchor="middle" fontSize="8" fontWeight="800" letterSpacing="2" fill={sel.includes('headliner') ? SLATE : '#7d8f98'} style={{ pointerEvents: 'none', fontFamily: 'Manrope' }}>HEADLINER</text>
      {puffs.map(p => <Puff key={p.id} x={p.x} y={p.y} />)}
    </svg>
  )
}
function MapSection({ sel, toggleSel }) {
  return (
    <section id="map" className="relative overflow-hidden px-5 py-28 md:px-10" style={{ background: 'linear-gradient(#f7faf9, #e8f7f1)' }}>
      <div className="mx-auto grid max-w-[1320px] items-center gap-14 lg:grid-cols-[1fr_1fr]">
        <div>
          <Mist><p className="mb-3 text-[13px] font-bold uppercase tracking-[.22em] text-[#0f8f6c]">Build your valet</p></Mist>
          <Mist delay={.05}><h2 className={`${H} text-[clamp(44px,6.4vw,96px)] font-extrabold leading-[.92] tracking-[-.05em] text-[#24313b]`}>Tap where it <span className={`${SERIF} text-[#0f8f6c]`}>needs</span> steam.</h2></Mist>
          <Mist delay={.1}><p className="mt-5 max-w-[460px] text-[17px] text-[#4d5d68]">Tap parts of the cabin on the car — or the list — and each one gets a puff. Your picks go straight into the booking form.</p></Mist>
          <div className="mt-8 grid gap-2.5 sm:grid-cols-2">
            {ZONES.map(z => {
              const on = sel.includes(z.k)
              return (
                <button key={z.k} onClick={() => toggleSel(z.k)} aria-pressed={on} className={`group flex items-start gap-3 rounded-2xl p-4 text-left ring-1 transition-colors ${on ? 'bg-[#24313b] text-white ring-[#24313b]' : 'bg-white text-[#24313b] ring-[#24313b]/10 hover:ring-[#5fd6b0]'}`}>
                  <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full ${on ? 'bg-[#5fd6b0] text-[#24313b]' : 'ring-1 ring-[#24313b]/20'}`}>{on && <Check size={14} strokeWidth={3} />}</span>
                  <span><b className="block text-[15px]">{z.label}</b><span className={`text-[13px] ${on ? 'text-white/65' : 'text-[#6b7b85]'}`}>{z.d}</span></span>
                </button>
              )
            })}
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <a href="#book" className="inline-flex h-14 items-center gap-2 rounded-full bg-[#24313b] px-7 font-bold text-white">{sel.length ? `Book these ${sel.length}` : 'Go to booking'} <ArrowRight size={18} /></a>
            {sel.length > 0 && <button onClick={() => sel.forEach(k => toggleSel(k))} className="text-[14px] font-bold text-[#4d5d68] underline underline-offset-4">Clear</button>}
          </div>
        </div>
        <div className="relative">
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#5fd6b0]/25 blur-3xl" />
          <InteriorMap sel={sel} toggleSel={toggleSel} />
        </div>
      </div>
    </section>
  )
}

/* ---------- colour-morph process ---------- */
function Process() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const bg = useTransform(scrollYProgress, [0, .3, .65, 1], ['#e8f7f1', '#bdeedd', '#5fd6b0', SLATE])
  const fg = useTransform(scrollYProgress, [0, .7, .85], [SLATE, SLATE, '#ffffff'])
  const [i, setI] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', v => setI(Math.min(3, Math.floor(v * 4))))
  return (
    <motion.section ref={ref} className="relative h-[340vh]" style={{ background: bg }}>
      <motion.div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden px-5 md:px-10" style={{ color: fg }}>
        <div className="mx-auto w-full max-w-[1320px]">
          <p className="mb-6 text-[13px] font-bold uppercase tracking-[.22em] opacity-70">How a steam valet works · {String(i + 1).padStart(2, '0')}/04</p>
          <div className="relative h-[clamp(110px,22vw,320px)]">
            <AnimatePresence mode="popLayout">
              <motion.h2 key={i} className={`${H} absolute inset-x-0 bottom-0 text-[clamp(96px,22vw,330px)] font-extrabold leading-[.8] tracking-[-.07em]`}
                initial={{ clipPath: 'inset(100% 0 0 0)', filter: 'blur(18px)', y: 60 }} animate={{ clipPath: 'inset(0% 0 -20% 0)', filter: 'blur(0px)', y: 0 }} exit={{ opacity: 0, filter: 'blur(18px)', y: -80 }} transition={{ duration: .7, ease: [0.16, 1, 0.3, 1] }}>
                {PROC[i][0]}<span className="text-[#0f8f6c]">.</span>
              </motion.h2>
            </AnimatePresence>
          </div>
          <AnimatePresence mode="wait"><motion.p key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="mt-8 max-w-[520px] text-[clamp(18px,1.8vw,24px)] font-medium">{PROC[i][1]}</motion.p></AnimatePresence>
          <div className="mt-10 flex gap-2">{PROC.map((_, k) => <span key={k} className="h-1.5 flex-1 rounded-full bg-current transition-opacity duration-500" style={{ opacity: k <= i ? .9 : .2 }} />)}</div>
        </div>
      </motion.div>
    </motion.section>
  )
}

function Services() {
  return (
    <section id="services" className="px-5 py-28 md:px-10" style={{ background: WHITE }}>
      <div className="mx-auto max-w-[1320px]">
        <ScrollWords className={`${H} mb-20 max-w-[1100px] text-[clamp(30px,4.2vw,62px)] font-bold leading-[1.08] tracking-[-.035em] text-[#24313b]`} text="Steam gets into the places a cloth never reaches — seams, vents, stitching, the bit under the seat rail. Then the dirt comes out with it." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SV.map(([t, d, I], k) => (
            <Mist key={t} delay={(k % 3) * .08}>
              <a href="#book" data-svc={t} data-cursor="Add" className="group relative flex h-full min-h-[270px] flex-col justify-between overflow-hidden rounded-[28px] bg-white p-7 ring-1 ring-[#24313b]/8 transition-shadow hover:shadow-[0_30px_60px_-30px_rgba(36,49,59,.4)]">
                <span className="pointer-events-none absolute -bottom-24 left-1/2 h-48 w-[120%] -translate-x-1/2 rounded-full bg-[#5fd6b0]/0 blur-2xl transition-all duration-700 group-hover:-bottom-10 group-hover:bg-[#5fd6b0]/40" />
                <div className="flex items-center justify-between"><span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#e8f7f1] text-[#0f8f6c]"><I size={24} /></span><span className="text-[13px] font-bold text-[#9fb0b8]">0{k + 1}</span></div>
                <div className="relative"><h3 className={`${H} mb-2 text-[26px] font-extrabold tracking-[-.03em] text-[#24313b]`}>{t}</h3><p className="text-[15px] text-[#5b6b75]">{d}</p></div>
              </a>
            </Mist>
          ))}
        </div>
      </div>
    </section>
  )
}

function Book({ bk, sel, toggleSel }) {
  const f = 'h-14 w-full rounded-2xl bg-white/[.07] px-5 text-[17px] text-white outline-none ring-1 ring-white/15 placeholder:text-white/35 focus:ring-2 focus:ring-[#5fd6b0]'
  return (
    <section id="book" className="relative overflow-hidden px-5 py-28 md:px-10" style={{ background: SLATE }}>
      <div className="pointer-events-none absolute -right-40 top-0 h-[520px] w-[520px] rounded-full bg-[#5fd6b0]/20 blur-[120px]" />
      <div className="relative mx-auto grid max-w-[1200px] gap-12 md:grid-cols-[1fr_1fr]">
        <div className="text-white">
          <div className="mb-10 flex flex-wrap gap-4">
            <Mist className="rounded-[24px] bg-white/[.06] p-6 ring-1 ring-white/10"><span className="flex items-end gap-2"><span className={`${H} text-[64px] font-extrabold leading-none tracking-[-.05em] text-[#5fd6b0]`}>{b.rating}</span><Star className="mb-3" size={22} fill={MINT} stroke={MINT} /></span><span className="text-[14px] text-white/60">Google rating</span></Mist>
            <Mist delay={.1} className="rounded-[24px] bg-white/[.06] p-6 ring-1 ring-white/10"><span className={`${H} block text-[64px] font-extrabold leading-none tracking-[-.05em]`}><Counter to={b.rev} /></span><span className="text-[14px] text-white/60">Google reviews</span></Mist>
          </div>
          <h2 className={`${H} text-[clamp(44px,6vw,92px)] font-extrabold leading-[.9] tracking-[-.05em]`}><SplitText text="Book a" className="block" /><span className={`${SERIF} block text-[#5fd6b0]`}>fresh start.</span></h2>
          <p className="mb-8 mt-6 max-w-[420px] text-[17px] text-white/65">Leave your number and what needs doing — we'll come back to you with a time.</p>
          <a href={'tel:' + tel(b.phone)} className={`${H} text-[clamp(30px,3.4vw,42px)] font-extrabold tracking-[-.02em]`}>{b.phone}</a>
        </div>
        <div className="relative rounded-[32px] bg-white/[.05] p-6 ring-1 ring-white/12 backdrop-blur-xl md:p-9">
          <AnimatePresence mode="wait">
            {!bk.s.sent ? (
              <motion.form key="f" exit={{ opacity: 0, filter: 'blur(12px)', y: -20 }} onSubmit={e => { e.preventDefault(); bk.submit() }} noValidate className="grid gap-4">
                <div className="rounded-2xl bg-[#5fd6b0]/10 p-4 ring-1 ring-[#5fd6b0]/30">
                  <p className="mb-2 text-[12px] font-bold uppercase tracking-[.18em] text-[#5fd6b0]">Your interior picks</p>
                  {sel.length ? <div className="flex flex-wrap gap-2">{sel.map(k => <button type="button" key={k} onClick={() => toggleSel(k)} className="rounded-full bg-[#5fd6b0] px-3 py-1.5 text-[13px] font-bold text-[#24313b]">{ZONES.find(z => z.k === k).label} ×</button>)}</div>
                    : <a href="#map" className="text-[15px] font-semibold text-white/70 underline underline-offset-4">Nothing yet — tap the car map</a>}
                </div>
                <input className={f} placeholder="Your name" value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} autoComplete="name" />
                <motion.input animate={bk.s.err ? { x: [0, -8, 8, -6, 6, 0] } : {}} className={f + (bk.s.err ? ' ring-2 !ring-red-400' : '')} type="tel" inputMode="tel" placeholder="+44 7___ ______" value={bk.s.phone} onFocus={phoneFocus(bk, '+44 ')} onChange={e => bk.upd('phone', e.target.value)} autoComplete="tel" />
                <div className="flex flex-wrap gap-2">{['Exterior wash', 'Full valet', 'Pet hair & odour'].map(t => <button type="button" key={t} onClick={() => bk.upd('extra', bk.s.extra === t ? '' : t)} className={`rounded-full px-4 py-2 text-[13px] font-bold transition-colors ${bk.s.extra === t ? 'bg-white text-[#24313b]' : 'bg-white/[.08] text-white/75 hover:bg-white/15'}`}>+ {t}</button>)}</div>
                <button disabled={bk.s.loading} className="mt-2 h-16 rounded-2xl bg-[#5fd6b0] text-[17px] font-bold text-[#24313b] transition-[scale,opacity] active:scale-[.97] disabled:opacity-60">{bk.s.loading ? 'Heating the steam…' : 'Request a valet'}</button>
                <p className="text-[13px] text-white/45">In the finished site this request goes straight to your phone/Telegram.</p>
              </motion.form>
            ) : (
              <motion.div key="ok" initial={{ opacity: 0, filter: 'blur(14px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} className="grid min-h-[380px] place-items-center text-center text-white">
                <div><CheckDraw className="mx-auto mb-5 text-[#5fd6b0]" /><h3 className={`${H} text-[38px] font-extrabold leading-none tracking-[-.03em]`}>Request received.</h3><p className="mx-auto mb-5 mt-3 max-w-[340px] text-white/65">In the finished site this request goes straight to your phone/Telegram.</p><button onClick={bk.reset} className="font-bold text-[#5fd6b0] underline underline-offset-4">Send another</button></div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

function Contact() {
  return (
    <section id="contact" className="px-5 py-28 md:px-10" style={{ background: WHITE }}>
      <div className="mx-auto grid max-w-[1320px] gap-6 md:grid-cols-[.9fr_1.1fr]">
        <div className="grid content-start gap-6">
          <Mist><h2 className={`${H} text-[clamp(48px,7vw,104px)] font-extrabold leading-[.9] tracking-[-.05em] text-[#24313b]`}>Say <span className={`${SERIF} text-[#0f8f6c]`}>hello.</span></h2></Mist>
          <Mist delay={.05}><p className="flex items-start gap-3 text-[20px] font-semibold text-[#24313b]"><MapPin className="mt-1 shrink-0 text-[#0f8f6c]" />{b.addr}</p></Mist>
          <Mist delay={.1}><a href={'tel:' + tel(b.phone)} className={`${H} text-[clamp(32px,4vw,48px)] font-extrabold tracking-[-.02em] text-[#24313b]`}>{b.phone}</a></Mist>
          <Mist delay={.15} className="flex flex-wrap gap-3">
            <Magnetic><a href={waLink(b.phone)} target="_blank" rel="noopener" className="inline-flex h-14 items-center gap-2 rounded-full bg-[#24313b] px-7 font-bold text-white"><WA /> WhatsApp</a></Magnetic>
            <a href={'tel:' + tel(b.phone)} className="inline-flex h-14 items-center gap-2 rounded-full bg-[#5fd6b0] px-7 font-bold text-[#24313b]"><Phone size={18} /> Call now</a>
          </Mist>
        </div>
        <Mist delay={.1} className="h-[420px] overflow-hidden rounded-[32px] ring-1 ring-[#24313b]/10"><GMap q={`${b.name}, ${b.addr}`} /></Mist>
      </div>
    </section>
  )
}

function App() {
  useSmooth()
  const lite = useLite()
  const bk = useBooking()
  const [sel, setSel] = useState([])
  const toggleSel = k => setSel(s => s.includes(k) ? s.filter(x => x !== k) : [...s, k])
  useEffect(() => {
    const parts = []
    if (sel.length) parts.push('Interior: ' + sel.map(k => ZONES.find(z => z.k === k).label).join(', '))
    if (bk.s.extra) parts.push(bk.s.extra)
    bk.upd('svc', parts.join(' + '))
  }, [sel, bk.s.extra])
  return (
    <MotionConfig reducedMotion="user">
      <div className="font-['Manrope',sans-serif]" style={{ background: WHITE, color: SLATE, '--sel': MINT, '--selc': SLATE }}>
        <Intro bg={SLATE} fg="#fff" duration={1.6}>
          <div className="relative grid place-items-center">
            {[0, 1, 2, 3].map(k => <motion.span key={k} className="absolute h-24 w-24 rounded-full bg-[#5fd6b0]/40 blur-xl" initial={{ y: 30, opacity: 0, scale: .5 }} animate={{ y: -90, opacity: [0, 1, 0], scale: 1.8 }} transition={{ duration: 1.3, delay: k * .15 }} />)}
            <span className={`${H} relative text-[34px] font-extrabold tracking-[-.04em]`}>MCR <span className={`${SERIF} text-[#5fd6b0]`}>pristine</span></span>
          </div>
        </Intro>
        <Progress color={MINT} />
        <Cursor color={MINT} blend="normal" textColor={SLATE} />
        <Ribbon lang="en" name={b.name} bg="#1a242c" fg="#cdeee3" />
        <header className="sticky top-0 z-40 bg-[#24313b]/80 text-white backdrop-blur-xl">
          <div className="mx-auto flex h-[66px] max-w-[1320px] items-center justify-between px-5 md:px-10">
            <a href="#top" className={`${H} text-[21px] font-extrabold tracking-[-.04em]`}>MCR <span className={`${SERIF} text-[#5fd6b0]`}>pristine</span></a>
            <nav className="hidden gap-8 text-[14px] font-semibold text-white/70 md:flex">{[['#services', 'Services'], ['#map', 'Build a valet'], ['#book', 'Book'], ['#contact', 'Contact']].map(([h, t]) => <a key={h} href={h} className="hover:text-white">{t}</a>)}</nav>
            <a href={'tel:' + tel(b.phone)} className="hidden h-11 items-center gap-2 rounded-full bg-[#5fd6b0] px-5 text-[14px] font-bold text-[#24313b] sm:inline-flex"><Phone size={15} />{b.phone}</a>
          </div>
        </header>
        <main id="top">
          <Hero lite={lite} />
          <div style={{ background: SLATE }} className="py-5 text-white/90">
            <Marquee base={-1.6} skew={false}>{['seats', 'carpets', 'dashboard', 'headliner', 'boot', 'vents'].map(t => <span key={t} className={`${H} mx-8 inline-flex items-center gap-16 text-[clamp(32px,4vw,58px)] font-extrabold tracking-[-.04em]`}>{t}<span className={`${SERIF} text-[#5fd6b0]`}>steamed</span></span>)}</Marquee>
          </div>
          <Fog />
          <Services />
          <MapSection sel={sel} toggleSel={toggleSel} />
          <Process />
          <Book bk={bk} sel={sel} toggleSel={toggleSel} />
          <Contact />
        </main>
        <footer className="px-5 py-10 text-[14px] font-medium text-white/55 md:px-10" style={{ background: SLATE }}><div className="mx-auto flex max-w-[1320px] flex-wrap justify-between gap-4"><span>© 2026 {b.name} · Website concept by Artem</span><a href={'tel:' + tel(b.phone)} className="text-[#5fd6b0]">{b.phone}</a></div></footer>
        <CallBar lang="en" phone={b.phone} barCls="bg-[#24313b]/90 backdrop-blur-xl" callCls="rounded-2xl bg-white/10 text-white ring-1 ring-white/20" bookCls="rounded-2xl bg-[#5fd6b0] text-[#24313b]" />
        <div className="h-[72px] sm:hidden" style={{ background: SLATE }} />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
