import React, { useRef, useState, useEffect, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, useSpring, useVelocity, AnimatePresence, MotionConfig } from 'framer-motion'
import { ArrowUpRight, Phone, MapPin, Star, Check } from 'lucide-react'
import '../lib/base.css'
import { useSmooth, Ribbon, SplitText, ScrollWords, Reveal, Magnetic, Cursor, Marquee, Counter, useBooking, phoneFocus, CallBar, Progress, Intro, tel, useLite, Grain, IG } from '../lib/kit'

const Cleaver = lazy(() => import('./butchers3d'))

const b = {
  name: "The Butcher's Chop Shop",
  short: "Butcher's Chop Shop",
  addr: "8 St Ann's Square, Manchester M2 7EA",
  phone: '+44 161 839 8850',
  ig: 'https://www.instagram.com/thebutcherschopshop/',
  rating: 4.8, rev: 171,
}
const CREAM = '#efe3cc', OX = '#5c0f17', INK = '#16100e', BRASS = '#b8893a'
const SLAB = "font-['Alfa_Slab_One',serif]", MONO = "font-['Courier_Prime',monospace]"
const WORDS = ['fades.', 'beards.', 'line-ups.', 'tapers.', 'shaves.']

const CUTS = [
  { id: 'top', n: 1, label: 'The Top', svc: 'Scissor cut on top', d: 'Length, texture and shape on top — scissors or clippers, cut to suit how you wear it.',
    path: 'M128,150 C135,95 180,68 235,70 C285,72 322,105 330,165 C270,160 190,155 128,150 Z', lx: 230, ly: 112 },
  { id: 'lineup', n: 2, label: 'Line-up', svc: 'Line-up & edge', d: 'Crisp hairline, temples and sideburns. The sharp edge that makes a cut look fresh.',
    path: 'M128,150 C150,152 160,153 168,154 L166,212 C150,208 136,204 120,200 C116,185 120,165 128,150 Z', lx: 146, ly: 180 },
  { id: 'fade', n: 3, label: 'The Fade', svc: 'Skin / taper fade', d: 'Skin, low, mid or high — blended clean from the clipper guard down to the skin.',
    path: 'M168,154 C220,157 280,160 330,165 C332,195 326,222 316,244 C285,246 250,244 225,240 C210,225 190,215 166,212 Z', lx: 262, ly: 200 },
  { id: 'beard', n: 4, label: 'Beard', svc: 'Beard trim & shape', d: 'Shaped, trimmed and lined with a straight razor finish on the cheeks and neck.',
    path: 'M120,200 C136,204 150,208 166,212 C190,215 210,225 225,240 C235,270 238,300 215,330 C190,325 160,318 140,305 L118,300 C110,292 104,286 104,282 L108,265 L112,248 L126,235 Z', lx: 172, ly: 272 },
  { id: 'neck', n: 5, label: 'Neck', svc: 'Neck taper & tidy', d: 'Tapered, blocked or rounded nape, finished with a clean razor line.',
    path: 'M316,244 C310,262 300,272 302,300 C304,340 305,370 305,400 L222,400 C222,370 220,345 215,330 C240,300 235,270 225,240 C255,244 285,246 316,244 Z', lx: 266, ly: 320 },
]

const SV = [
  ['01', 'Skin fade', 'Blended down to the skin and finished on top to your spec.'],
  ['02', 'Classic scissor cut', 'Traditional cut with scissors and comb for longer styles.'],
  ['03', 'Beard trim', 'Shape, length and a razor-sharp line on cheeks and neck.'],
  ['04', 'Hot towel shave', 'Old-school wet shave with hot towels and a straight razor.'],
  ['05', 'Line-up', 'Quick edge-up between cuts to keep it looking fresh.'],
  ['06', 'Cut & beard', 'The full order — haircut and beard in one sitting.'],
]

function Paper({ className = '' }) {
  return <div aria-hidden="true" className={'pointer-events-none absolute inset-0 ' + className} style={{ backgroundImage: 'repeating-linear-gradient(97deg, rgba(92,15,23,.025) 0 2px, transparent 2px 9px), repeating-linear-gradient(8deg, rgba(22,16,14,.03) 0 1px, transparent 1px 13px), radial-gradient(ellipse at 20% 10%, rgba(255,255,255,.35), transparent 60%), radial-gradient(ellipse at 90% 90%, rgba(120,80,40,.12), transparent 55%)' }} />
}

function Stamp({ className = '' }) {
  const txt = "THE BUTCHER'S CHOP SHOP · ST ANN'S SQUARE · MANCHESTER · "
  return (
    <motion.svg viewBox="0 0 200 200" className={className} animate={{ rotate: 360 }} transition={{ duration: 28, repeat: Infinity, ease: 'linear' }} aria-hidden="true">
      <defs><path id="bc" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" /></defs>
      <circle cx="100" cy="100" r="96" fill="none" stroke={OX} strokeWidth="2" />
      <circle cx="100" cy="100" r="60" fill="none" stroke={OX} strokeWidth="1.2" strokeDasharray="3 4" />
      <text fill={OX} fontSize="15.5" letterSpacing="2.4" fontFamily="'Courier Prime',monospace" fontWeight="700"><textPath href="#bc">{txt}</textPath></text>
      <text x="100" y="96" textAnchor="middle" fill={OX} fontSize="22" fontFamily="'Alfa Slab One',serif">PRIME</text>
      <text x="100" y="120" textAnchor="middle" fill={OX} fontSize="13" fontFamily="'Courier Prime',monospace" fontWeight="700">CUTS ONLY</text>
    </motion.svg>
  )
}

function Hero({ lite }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const [i, setI] = useState(0)
  useEffect(() => { const t = setInterval(() => setI(v => (v + 1) % WORDS.length), 2200); return () => clearInterval(t) }, [])
  const ty = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  return (
    <section ref={ref} className="relative min-h-[100svh] overflow-hidden">
      <Paper />
      <div className="absolute inset-x-0 top-0 h-[52%] md:inset-0 md:h-full">
        {!lite ? <Suspense fallback={null}><Cleaver progress={scrollYProgress} /></Suspense>
          : <div className="absolute right-[8%] top-[20%] h-40 w-64 rotate-[-12deg] rounded-[6px_40px_10px_6px] bg-gradient-to-br from-white via-[#b9b4ad] to-[#efece6] shadow-2xl md:h-56 md:w-96" />}
      </div>
      <motion.div style={{ y: ty }} className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1360px] flex-col justify-end px-5 pb-24 pt-[34vh] md:justify-center md:px-10 md:pb-10 md:pt-24">
        <p className={`${MONO} mb-5 flex flex-wrap items-center gap-3 text-[12px] font-bold uppercase tracking-[.28em] text-[#5c0f17]`}>
          <span className="inline-block h-[10px] w-[10px] rounded-full bg-[#5c0f17]" />Barbers · St Ann's Square · Manchester
        </p>
        <h1 className={`${SLAB} text-[clamp(50px,8.6vw,150px)] uppercase leading-[.86] tracking-[-.01em] text-[#16100e]`}>
          <SplitText text="Prime cuts," delay={1.5} stagger={0.04} className="block" />
          <span className="block">
            <SplitText text="fresh" delay={1.8} className="mr-[.25em] inline-block" />
            <span className="relative inline-block overflow-hidden align-bottom">
              <span className="invisible block">line-ups.</span>
              <AnimatePresence initial={false}>
                <motion.span key={i} initial={{ y: '105%' }} animate={{ y: '0%' }} exit={{ y: '-105%' }} transition={{ duration: 0.65, ease: [0.76, 0, 0.24, 1] }} className="absolute inset-0 block text-[#5c0f17]">{WORDS[i]}</motion.span>
              </AnimatePresence>
            </span>
          </span>
        </h1>
        <p className="mt-7 max-w-[460px] text-[17px] leading-relaxed text-[#16100e]/75">A barbershop dressed as an old-school butcher's counter. Pick your cut off the chart, take a number and leave sharper than you came in.</p>
        <div className="mt-9 flex flex-wrap items-center gap-3">
          <Magnetic><a href="#book" data-cursor="Take #" className={`${SLAB} inline-flex h-14 items-center gap-3 rounded-full bg-[#5c0f17] px-8 text-[15px] uppercase tracking-[.08em] text-[#efe3cc] shadow-[0_6px_0_#2b070b] transition-transform active:translate-y-1`}>Take a number <ArrowUpRight size={18} /></a></Magnetic>
          <a href={'tel:' + tel(b.phone)} className={`${MONO} inline-flex h-14 items-center gap-2 rounded-full border-2 border-[#16100e] px-6 text-[15px] font-bold`}><Phone size={16} />{b.phone}</a>
        </div>
      </motion.div>
      <Stamp className="pointer-events-none absolute bottom-10 right-8 z-10 hidden h-40 w-40 md:block" />
      <div className={`${MONO} pointer-events-none absolute left-1/2 top-24 z-10 hidden -translate-x-1/2 text-[11px] uppercase tracking-[.4em] text-[#16100e]/40 md:block`}>Spin the cleaver — move your cursor</div>
    </section>
  )
}

/* freezer strip curtain parts as you scroll */
function Curtain() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const N = 9
  return (
    <section ref={ref} className="relative h-[220vh] bg-[#16100e]">
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="absolute inset-0 grid place-items-center px-5 text-center">
          <div>
            <p className={`${MONO} mb-5 text-[12px] font-bold uppercase tracking-[.35em] text-[#b8893a]`}>Behind the counter</p>
            <ScrollWords text="No cling film. No fuss. Just sharp blades, hot towels and a proper cut." className={`${SLAB} mx-auto max-w-[1000px] text-[clamp(34px,5.6vw,88px)] uppercase leading-[1] text-[#efe3cc]`} dim={0.12} />
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0 flex">
          {Array.from({ length: N }, (_, k) => <Strip key={k} k={k} N={N} p={scrollYProgress} />)}
        </div>
      </div>
    </section>
  )
}
function Strip({ k, N, p }) {
  const c = (k - (N - 1) / 2) / ((N - 1) / 2)
  const x = useTransform(p, [0.3, 0.6], ['0vw', `${c * 55 + (c >= 0 ? 12 : -12)}vw`])
  const r = useTransform(p, [0.3, 0.6], [0, c * 18])
  return <motion.div style={{ x, rotateY: r, transformPerspective: 800 }} className="h-full flex-1 border-x border-white/20 bg-[linear-gradient(90deg,rgba(255,255,255,.08),rgba(220,235,240,.28)_40%,rgba(255,255,255,.1)_60%,rgba(200,220,230,.22))] backdrop-blur-[3px]" />
}

/* signature: vintage beef-cuts chart, but for a head */
function CutsChart({ picked, toggle }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start start'] })
  const clip = useTransform(scrollYProgress, [0, 1], ['circle(8% at 50% 50%)', 'circle(100% at 50% 50%)'])
  const [hov, setHov] = useState('fade')
  const cur = CUTS.find(c => c.id === hov)
  return (
    <motion.section ref={ref} id="chart" style={{ clipPath: clip }} className="relative overflow-hidden bg-[#efe3cc] px-5 py-24 md:px-10 md:py-32">
      <Paper />
      <div className="relative mx-auto max-w-[1360px]">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6 border-b-[3px] border-double border-[#5c0f17] pb-6">
          <div>
            <p className={`${MONO} mb-3 text-[12px] font-bold uppercase tracking-[.3em] text-[#5c0f17]`}>Fig. 1 — Cuts of the head</p>
            <h2 className={`${SLAB} text-[clamp(44px,7vw,112px)] uppercase leading-[.88] text-[#16100e]`}>The cuts chart</h2>
          </div>
          <p className="max-w-[360px] text-[#16100e]/70">Hover or tap a region to see the cut. Tap again to add it to your order — it goes straight on your ticket.</p>
        </div>
        <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_.85fr]">
          <div className="relative mx-auto w-full max-w-[620px]">
            <svg viewBox="40 40 360 380" className="w-full touch-manipulation select-none" role="group" aria-label="Head cuts diagram">
              <defs>
                <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke={OX} strokeWidth="1.4" strokeOpacity=".35" /></pattern>
              </defs>
              {/* face skin pieces */}
              <path d="M120,200 L114,196 L108,206 L92,232 L106,240 L126,235 Z" fill="#f6ecd9" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
              <path d="M128,150 C121,165 116,185 120,200" fill="none" stroke={INK} strokeWidth="2" />
              {CUTS.map(c => {
                const on = picked.includes(c.id), h = hov === c.id
                return (
                  <g key={c.id} className="cursor-pointer" data-cursor={on ? 'Remove' : 'Add'}
                    onPointerEnter={() => setHov(c.id)} onClick={() => { if (hov === c.id) toggle(c.id); else setHov(c.id) }}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(c.id) } }} onFocus={() => setHov(c.id)} tabIndex={0} role="button" aria-pressed={on} aria-label={c.label}>
                    <motion.path d={c.path} stroke={INK} strokeWidth="2.2" strokeLinejoin="round"
                      animate={{ fill: on ? OX : h ? '#d9b98f' : '#f6ecd9' }} transition={{ duration: 0.3 }} />
                    {h && !on && <path d={c.path} fill="url(#hatch)" pointerEvents="none" />}
                    <motion.g animate={{ scale: h ? 1.15 : 1 }} style={{ transformOrigin: `${c.lx}px ${c.ly}px` }} pointerEvents="none">
                      <circle cx={c.lx} cy={c.ly} r="13" fill={on ? CREAM : OX} />
                      <text x={c.lx} y={c.ly + 5} textAnchor="middle" fontSize="14" fontFamily="'Alfa Slab One',serif" fill={on ? OX : CREAM}>{c.n}</text>
                    </motion.g>
                  </g>
                )
              })}
              {/* ear + profile details */}
              <path d="M238,190 C250,178 268,184 266,204 C265,220 254,224 250,236 C246,244 236,242 236,232" fill="none" stroke={INK} strokeWidth="2" pointerEvents="none" />
              <path d="M104,282 L108,265 L112,248 L106,240 M102,252 L110,252" fill="none" stroke={INK} strokeWidth="2" pointerEvents="none" />
              <circle cx="132" cy="196" r="3" fill={INK} pointerEvents="none" />
              <text x="56" y="70" fontSize="11" fontFamily="'Courier Prime',monospace" fontWeight="700" fill={OX} letterSpacing="2">GRADE A · BARBER'S CUTS</text>
              <text x="320" y="410" fontSize="10" fontFamily="'Courier Prime',monospace" fill={INK} opacity=".55">M2 7EA</text>
            </svg>
          </div>
          <div>
            <AnimatePresence mode="wait">
              <motion.div key={cur.id} initial={{ opacity: 0, y: 16, rotate: -1 }} animate={{ opacity: 1, y: 0, rotate: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35 }} className="relative rounded-sm border-2 border-[#16100e] bg-[#f6ecd9] p-7 shadow-[8px_8px_0_#5c0f17]">
                <span className={`${MONO} text-[12px] font-bold uppercase tracking-[.25em] text-[#5c0f17]`}>Cut No. {cur.n}</span>
                <h3 className={`${SLAB} mt-2 text-[clamp(34px,4vw,54px)] uppercase leading-none`}>{cur.label}</h3>
                <p className="mt-4 text-[16px] leading-relaxed text-[#16100e]/75">{cur.d}</p>
                <button onClick={() => toggle(cur.id)} className={`${MONO} mt-6 inline-flex h-12 items-center gap-2 rounded-full px-6 text-[14px] font-bold uppercase tracking-[.12em] transition-colors ${picked.includes(cur.id) ? 'bg-[#16100e] text-[#efe3cc]' : 'bg-[#5c0f17] text-[#efe3cc]'}`}>
                  {picked.includes(cur.id) ? <><Check size={16} /> On your order</> : 'Add to order'}
                </button>
              </motion.div>
            </AnimatePresence>
            <div className="mt-8">
              <p className={`${MONO} mb-3 text-[12px] font-bold uppercase tracking-[.25em] text-[#16100e]/60`}>Your order</p>
              <div className="flex min-h-[48px] flex-wrap gap-2">
                <AnimatePresence>
                  {picked.length === 0 && <motion.span key="e" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`${MONO} text-[14px] text-[#16100e]/45`}>Nothing on the scales yet.</motion.span>}
                  {picked.map(id => { const c = CUTS.find(x => x.id === id); return (
                    <motion.button layout key={id} initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }} onClick={() => toggle(id)} className={`${MONO} rounded-sm border-2 border-[#5c0f17] bg-[#efe3cc] px-3 py-2 text-[13px] font-bold uppercase text-[#5c0f17]`}>{c.n}. {c.label} ×</motion.button>
                  ) })}
                </AnimatePresence>
              </div>
              {picked.length > 0 && <a href="#book" className={`${SLAB} mt-6 inline-flex items-center gap-2 text-[18px] uppercase text-[#5c0f17] underline decoration-2 underline-offset-4`}>Take a number <ArrowUpRight size={18} /></a>}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  )
}

/* hanging price tags on a meat rail, scrolled sideways */
function Rail() {
  const ref = useRef(null), track = useRef(null)
  const [dist, setDist] = useState(0)
  useEffect(() => {
    const m = () => track.current && setDist(Math.max(0, track.current.scrollWidth - innerWidth))
    m(); addEventListener('resize', m); return () => removeEventListener('resize', m)
  }, [])
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const x = useTransform(scrollYProgress, [0, 1], [0, -dist])
  const vel = useVelocity(x)
  const swing = useSpring(useTransform(vel, [-1500, 0, 1500], [14, 0, -14]), { stiffness: 90, damping: 6, mass: 0.6 })
  return (
    <section ref={ref} id="services" className="relative bg-[#5c0f17] text-[#efe3cc]" style={{ height: `calc(100vh + ${dist}px)` }}>
      <div className="sticky top-0 flex h-screen flex-col overflow-hidden">
        <div className="mx-auto w-full max-w-[1360px] px-5 pt-20 md:px-10 md:pt-24">
          <p className={`${MONO} text-[12px] font-bold uppercase tracking-[.3em] text-[#b8893a]`}>On the rail today</p>
          <h2 className={`${SLAB} text-[clamp(40px,6.5vw,104px)] uppercase leading-[.9]`}>The menu</h2>
        </div>
        <div className="relative mt-6 flex-1">
          <div className="absolute inset-x-0 top-3 h-[10px] bg-gradient-to-b from-[#e6c77f] via-[#b8893a] to-[#6e4f1c] shadow-[0_4px_10px_rgba(0,0,0,.4)]" />
          <motion.div ref={track} style={{ x }} className="flex h-full items-start gap-8 pl-5 pr-[10vw] md:gap-14 md:pl-10">
            {SV.map((s, k) => <Tag key={s[0]} s={s} k={k} swing={swing} />)}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
function Tag({ s: [n, t, d], k, swing }) {
  const rot = useTransform(swing, v => v * (0.7 + (k % 3) * 0.2))
  return (
    <motion.div style={{ rotate: rot, transformOrigin: '50% 0%' }} className="relative shrink-0 pt-1">
      <motion.div whileHover={{ rotate: [0, -7, 5, -3, 1, 0] }} transition={{ duration: 1.2 }} style={{ transformOrigin: '50% 0%' }} className="flex flex-col items-center">
        <div className="h-7 w-[3px] rounded bg-gradient-to-b from-[#d8ac58] to-[#8a6524]" />
        <div className="-mt-1 h-6 w-6 rounded-full border-[3px] border-[#d8ac58]" />
        <div className="relative -mt-2 w-[min(74vw,290px)] bg-[#efe3cc] px-6 pb-7 pt-10 text-[#16100e] shadow-[0_18px_30px_rgba(0,0,0,.35)]" style={{ clipPath: 'polygon(22% 0,78% 0,100% 12%,100% 100%,0 100%,0 12%)' }}>
          <div className="absolute left-1/2 top-4 h-4 w-4 -translate-x-1/2 rounded-full bg-[#5c0f17]" />
          <div className="mb-4 flex items-center justify-between border-b-2 border-dashed border-[#16100e]/30 pb-3">
            <span className={`${MONO} text-[12px] font-bold uppercase tracking-[.2em] text-[#5c0f17]`}>Cut No. {n}</span>
            <span className={`${MONO} text-[11px] uppercase tracking-[.15em] text-[#16100e]/50`}>Fresh today</span>
          </div>
          <h3 className={`${SLAB} text-[clamp(28px,3vw,38px)] uppercase leading-[.95]`}>{t}</h3>
          <p className="mt-3 min-h-[72px] text-[15px] leading-relaxed text-[#16100e]/70">{d}</p>
          <a href="#book" data-svc={t} className={`${MONO} mt-5 inline-flex items-center gap-2 border-b-2 border-[#5c0f17] text-[13px] font-bold uppercase tracking-[.12em] text-[#5c0f17]`}>Order this cut <ArrowUpRight size={14} /></a>
          <div className="pointer-events-none absolute -right-5 bottom-6 rotate-[-14deg] rounded-sm border-[3px] border-[#5c0f17]/60 px-3 py-1 text-[11px] font-bold uppercase tracking-[.2em] text-[#5c0f17]/60">Grade A</div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function Reviews() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center center'] })
  const bg = useTransform(scrollYProgress, [0, 1], ['#16100e', '#efe3cc'])
  const fg = useTransform(scrollYProgress, [0, 1], ['#efe3cc', '#16100e'])
  const sc = useTransform(scrollYProgress, [0, 1], [0.8, 1])
  return (
    <motion.section ref={ref} style={{ background: bg, color: fg }} className="relative overflow-hidden px-5 py-28 md:px-10">
      <motion.div style={{ scale: sc }} className="mx-auto grid max-w-[1360px] items-center gap-12 md:grid-cols-2">
        <div>
          <p className={`${MONO} mb-4 text-[12px] font-bold uppercase tracking-[.3em] text-[#b8893a]`}>Weighed on Google</p>
          <div className="flex items-end gap-4">
            <span className={`${SLAB} text-[clamp(110px,18vw,260px)] leading-[.8]`}>4.8</span>
            <div className="mb-4 flex gap-1 text-[#b8893a]">{[0, 1, 2, 3, 4].map(k => <Star key={k} size={28} fill="currentColor" />)}</div>
          </div>
        </div>
        <div className="relative">
          <div className="rounded-sm border-2 border-current p-8">
            <div className={`${MONO} flex items-center justify-between border-b-2 border-dashed border-current pb-3 text-[13px] font-bold uppercase tracking-[.2em]`}><span>Scale reading</span><span>Net</span></div>
            <div className={`${SLAB} py-6 text-[clamp(64px,9vw,128px)] leading-none`}><Counter to={b.rev} /></div>
            <p className={`${MONO} text-[14px] uppercase tracking-[.18em] opacity-70`}>reviews on Google · average {b.rating}★</p>
          </div>
        </div>
      </motion.div>
    </motion.section>
  )
}

/* deli counter "take a number" ticket dispenser */
function Dispenser({ picked }) {
  const bk = useBooking()
  const [num, setNum] = useState(null)
  const [serving, setServing] = useState(17)
  useEffect(() => { const t = setInterval(() => setServing(v => (v % 99) + 1), 4200); return () => clearInterval(t) }, [])
  useEffect(() => {
    if (!picked.length) return
    bk.upd('svc', picked.map(id => CUTS.find(c => c.id === id).svc).join(' + '))
  }, [picked.join()])
  const pull = e => {
    e.preventDefault()
    if (bk.submit()) setNum(String(((serving + 3 + Math.floor(Math.random() * 6)) % 99) + 1).padStart(2, '0'))
  }
  const again = () => { bk.reset(); setNum(null) }
  const inp = `${MONO} h-12 w-full border-0 border-b-2 border-dashed border-[#16100e]/35 bg-transparent text-[18px] outline-none placeholder:text-[#16100e]/35 focus:border-solid focus:border-[#5c0f17]`
  return (
    <section id="book" className="relative overflow-hidden bg-[#efe3cc] px-5 py-28 md:px-10">
      <Paper />
      <div className="relative mx-auto max-w-[1360px]">
        <div className="mb-14 text-center">
          <p className={`${MONO} mb-3 text-[12px] font-bold uppercase tracking-[.3em] text-[#5c0f17]`}>Booking counter</p>
          <h2 className={`${SLAB} text-[clamp(44px,8vw,128px)] uppercase leading-[.86]`}><SplitText text="Take a number" /></h2>
        </div>
        <div className="grid items-start gap-12 lg:grid-cols-[1fr_1fr]">
          <form onSubmit={pull} noValidate className="relative rotate-[-1deg] bg-[#fbf5e8] p-7 shadow-[0_20px_40px_rgba(60,30,10,.18)] md:p-10" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent 0 39px, rgba(92,15,23,.12) 39px 40px)' }}>
            <div className="mb-6 flex items-center justify-between border-b-[3px] border-double border-[#5c0f17] pb-3">
              <span className={`${SLAB} text-[22px] uppercase text-[#5c0f17]`}>Order slip</span>
              <span className={`${MONO} text-[12px] uppercase tracking-[.2em] text-[#16100e]/50`}>St Ann's Sq.</span>
            </div>
            <div className="grid gap-6">
              <label className="block"><span className={`${MONO} text-[11px] font-bold uppercase tracking-[.2em] text-[#16100e]/55`}>Name</span>
                <input className={inp} placeholder="Your name" value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} autoComplete="name" /></label>
              <label className="block"><span className={`${MONO} text-[11px] font-bold uppercase tracking-[.2em] text-[#16100e]/55`}>Phone</span>
                <motion.input animate={bk.s.err ? { x: [0, -8, 8, -5, 5, 0] } : {}} className={inp + (bk.s.err ? ' !border-[#c0262d]' : '')} type="tel" inputMode="tel" placeholder="+44 7___ ______" value={bk.s.phone} onFocus={phoneFocus(bk, '+44 ')} onChange={e => bk.upd('phone', e.target.value)} autoComplete="tel" /></label>
              {bk.s.err && <p className={`${MONO} -mt-3 text-[13px] text-[#c0262d]`}>Please enter a full phone number.</p>}
              <label className="block"><span className={`${MONO} text-[11px] font-bold uppercase tracking-[.2em] text-[#16100e]/55`}>The cut</span>
                <input className={inp} placeholder="e.g. Skin fade + beard" value={bk.s.svc} onChange={e => bk.upd('svc', e.target.value)} /></label>
            </div>
            <button disabled={bk.s.loading || bk.s.sent} className={`${SLAB} mt-9 flex h-16 w-full items-center justify-center gap-3 rounded-full bg-[#5c0f17] text-[17px] uppercase tracking-[.08em] text-[#efe3cc] shadow-[0_6px_0_#2b070b] transition-transform active:translate-y-1 disabled:opacity-70`}>
              {bk.s.loading ? 'Printing…' : bk.s.sent ? 'Ticket printed' : 'Pull a ticket'}
            </button>
            <p className={`${MONO} mt-4 text-[12px] text-[#16100e]/55`}>Prefer to talk? Ring the shop on <a className="font-bold text-[#5c0f17]" href={'tel:' + tel(b.phone)}>{b.phone}</a></p>
          </form>
          <div className="relative mx-auto w-full max-w-[420px]">
            <div className="relative z-10 rounded-[38px_38px_24px_24px] bg-gradient-to-b from-[#7a1520] to-[#4a0b12] p-6 pb-10 shadow-[inset_0_-10px_0_rgba(0,0,0,.25),0_30px_50px_rgba(40,0,0,.35)]">
              <div className="mx-auto mb-5 w-fit rounded-full bg-[#efe3cc] px-5 py-1.5"><span className={`${SLAB} text-[15px] uppercase text-[#5c0f17]`}>Please take a number</span></div>
              <div className="rounded-xl bg-[#120606] p-4 shadow-[inset_0_0_20px_#000]">
                <p className={`${MONO} text-center text-[11px] uppercase tracking-[.35em] text-[#ff5a4f]/60`}>Now serving</p>
                <div className="text-center font-['Courier_Prime',monospace] text-[80px] font-bold leading-none text-[#ff4436]" style={{ textShadow: '0 0 18px rgba(255,60,40,.8)' }}>{String(serving).padStart(2, '0')}</div>
              </div>
              <div className="mt-6 flex items-center justify-center gap-3">
                {[0, 1, 2].map(k => <span key={k} className="h-3 w-3 rounded-full bg-[#2b070b] shadow-[inset_0_1px_2px_#000]" />)}
              </div>
              <div className="mx-auto mt-6 h-3 w-[78%] rounded-full bg-[#120606] shadow-[inset_0_2px_4px_#000]" />
            </div>
            <div className="relative -mt-[34px] h-[300px] overflow-hidden px-[13%]">
              <AnimatePresence>
                {(bk.s.loading || bk.s.sent) && num && (
                  <motion.div key={num} initial={{ y: '-100%' }} animate={{ y: '0%' }} exit={{ y: '-100%' }} transition={{ duration: 1, ease: [0.3, 0, 0.2, 1] }}
                    drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={0.2}
                    className="relative mx-auto bg-[#fff7e6] px-6 pb-7 pt-10 text-center text-[#16100e] shadow-[0_12px_20px_rgba(0,0,0,.2)]"
>
                    <span className="absolute -left-3 top-[58%] h-6 w-6 rounded-full bg-[#efe3cc]" /><span className="absolute -right-3 top-[58%] h-6 w-6 rounded-full bg-[#efe3cc]" />
                    <p className={`${MONO} text-[11px] font-bold uppercase tracking-[.3em] text-[#5c0f17]`}>The Butcher's Chop Shop</p>
                    <div className={`${SLAB} my-2 text-[96px] leading-none text-[#5c0f17]`}>{num}</div>
                    <div className="my-3 border-t-2 border-dashed border-[#16100e]/30" />
                    {bk.s.sent ? (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <p className={`${MONO} text-[13px] font-bold uppercase`}>{bk.s.name ? `Cheers, ${bk.s.name}.` : 'Cheers.'} You're in the queue.</p>
                        <p className="mt-2 text-[13px] leading-snug text-[#16100e]/65">In the finished site this request goes straight to your phone, so the shop can call back with a time.</p>
                        <button onClick={again} className={`${MONO} mt-3 text-[12px] font-bold uppercase underline underline-offset-4`}>Take another</button>
                      </motion.div>
                    ) : <p className={`${MONO} text-[13px] uppercase tracking-[.2em] text-[#16100e]/50`}>Printing…</p>}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Contact() {
  return (
    <section id="contact" className="relative bg-[#16100e] px-5 py-24 text-[#efe3cc] md:px-10">
      <div className="mx-auto grid max-w-[1360px] gap-10 lg:grid-cols-[.9fr_1.1fr]">
        <div>
          <p className={`${MONO} mb-3 text-[12px] font-bold uppercase tracking-[.3em] text-[#b8893a]`}>Find the shop</p>
          <h2 className={`${SLAB} mb-8 text-[clamp(44px,6vw,96px)] uppercase leading-[.88]`}>St Ann's<br />Square</h2>
          <p className="mb-6 flex items-start gap-3 text-[20px]"><MapPin className="mt-1 shrink-0 text-[#b8893a]" />{b.addr}</p>
          <a href={'tel:' + tel(b.phone)} className={`${SLAB} block text-[clamp(28px,3.4vw,44px)] text-[#efe3cc] hover:text-[#b8893a]`}>{b.phone}</a>
          <div className="mt-8 flex flex-wrap gap-3">
            <Magnetic><a href={'tel:' + tel(b.phone)} className={`${MONO} inline-flex h-12 items-center gap-2 rounded-full bg-[#5c0f17] px-6 text-[14px] font-bold uppercase tracking-[.1em]`}><Phone size={16} />Call the shop</a></Magnetic>
            <a href={b.ig} target="_blank" rel="noopener" className={`${MONO} inline-flex h-12 items-center gap-2 rounded-full border-2 border-[#efe3cc]/40 px-6 text-[14px] font-bold uppercase tracking-[.1em] hover:border-[#b8893a] hover:text-[#b8893a]`}><IG />Instagram</a>
          </div>
        </div>
        <div className="h-[380px] overflow-hidden rounded-sm border-2 border-[#b8893a]/50 md:h-[460px]"><GMapSepia /></div>
      </div>
    </section>
  )
}
function GMapSepia() {
  return <iframe title="Map" loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" className="block h-full w-full border-0" style={{ filter: 'sepia(.35) contrast(1.05)' }}
    src={`https://maps.google.com/maps?q=${encodeURIComponent(`${b.name}, ${b.addr}`)}&z=16&output=embed`} />
}

function App() {
  useSmooth()
  const lite = useLite()
  const [picked, setPicked] = useState([])
  const toggle = id => setPicked(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  return (
    <MotionConfig reducedMotion="user">
      <div className="overflow-x-clip font-['Archivo',sans-serif]" style={{ background: CREAM, color: INK, '--sel': OX, '--selc': CREAM }}>
        <Intro bg={OX} fg={CREAM} duration={1.6}>
          <div className="text-center">
            <motion.div initial={{ scale: 0.6, rotate: -20, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={{ duration: 0.6 }} className={`${SLAB} text-[64px] leading-none`}>No. 01</motion.div>
            <p className={`${MONO} mt-3 text-[12px] font-bold uppercase tracking-[.35em]`}>Sharpening the blades…</p>
          </div>
        </Intro>
        <Grain opacity={0.08} />
        <Progress color={OX} />
        <Cursor color={OX} blend="normal" textColor={CREAM} />
        <Ribbon lang="en" name={b.name} bg={INK} fg={CREAM} />
        <header className="sticky top-0 z-40 border-b-2 border-[#16100e] bg-[#efe3cc]/90 backdrop-blur-md">
          <div className="mx-auto flex h-[66px] max-w-[1360px] items-center justify-between px-5 md:px-10">
            <a href="#top" className="flex items-center gap-3">
              <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true"><rect x="2" y="6" width="20" height="14" rx="2" fill={OX} /><circle cx="17" cy="10" r="2" fill={CREAM} /><rect x="21" y="9" width="8" height="4" rx="1.5" fill={INK} /></svg>
              <span className={`${SLAB} text-[16px] uppercase leading-none sm:text-[18px]`}>{b.short}</span>
            </a>
            <nav className={`${MONO} hidden gap-8 text-[13px] font-bold uppercase tracking-[.16em] md:flex`}>{[['#chart', 'Cuts chart'], ['#services', 'Menu'], ['#book', 'Book'], ['#contact', 'Find us']].map(([h, t]) => <a key={h} href={h} className="hover:text-[#5c0f17]">{t}</a>)}</nav>
            <a href="#book" className={`${MONO} hidden h-10 items-center rounded-full bg-[#16100e] px-5 text-[13px] font-bold uppercase tracking-[.12em] text-[#efe3cc] sm:inline-flex`}>Take a number</a>
          </div>
        </header>
        <main id="top">
          <Hero lite={lite} />
          <Marquee base={-2.5} className="border-y-2 border-[#16100e] bg-[#5c0f17] py-4 text-[#efe3cc]">
            {['Fades', 'Tapers', 'Beard trims', 'Hot towel shaves', 'Line-ups', 'Scissor cuts'].map(t => <span key={t} className={`${SLAB} mx-6 inline-flex items-center gap-10 text-[clamp(28px,3.6vw,52px)] uppercase`}>{t}<span className="text-[#b8893a]">✂</span></span>)}
          </Marquee>
          <Curtain />
          <CutsChart picked={picked} toggle={toggle} />
          <Rail />
          <Reviews />
          <Dispenser picked={picked} />
          <Contact />
        </main>
        <footer className={`${MONO} border-t-2 border-[#b8893a]/40 bg-[#16100e] px-5 py-8 text-[13px] text-[#efe3cc]/60 md:px-10`}>
          <div className="mx-auto flex max-w-[1360px] flex-wrap justify-between gap-4"><span>© 2026 {b.name} · Website concept by Artem</span><a href="#top" className="hover:text-[#b8893a]">Back to the top ↑</a></div>
        </footer>
        <CallBar lang="en" phone={b.phone} barCls="bg-[#efe3cc]/95 backdrop-blur border-t-2 border-[#16100e]" callCls="rounded-full border-2 border-[#16100e]" bookCls="rounded-full bg-[#5c0f17] text-[#efe3cc]" />
        <div className="h-[72px] bg-[#16100e] sm:hidden" />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
