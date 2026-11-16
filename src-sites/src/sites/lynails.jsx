import React, { useRef, useState, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, AnimatePresence, MotionConfig } from 'framer-motion'
import { ArrowUpRight, Phone, MapPin, Star } from 'lucide-react'
import '../lib/base.css'
import { useSmooth, Ribbon, SplitText, LineReveal, Reveal, Magnetic, Cursor, Marquee, Counter, useBooking, phoneFocus, CheckDraw, GMap, CallBar, Progress, Intro, tel, useLite, WA, waLink } from '../lib/kit'

const GemScene = lazy(() => import('./lynails3d'))

const b = {
  name: 'Ly Nails',
  addr: '22 Augusta St, Birmingham B18 6JA',
  area: 'Jewellery Quarter',
  phones: ['+44 7429 294499', '+44 121 212 1657'],
  rating: 4.9, rev: 406,
}
const VEL = '#0b1c17', DEEP = '#06110d', GOLD = '#c9a45c', IVORY = '#f3ead8'
const DISP = "font-['Italiana',serif]", SERIF = "font-['Cormorant_Garamond',serif]"
const GOLDTXT = 'bg-gradient-to-r from-[#8a6a2c] via-[#f3dc9c] to-[#b48a3e] bg-clip-text text-transparent'

const GEMS = [
  { id: 'ruby', name: 'Ruby', c: '#b3122f', stops: ['#ff6b84', '#c4102f', '#5a0013'], note: 'Deep glassy red — the classic, cut sharp.' },
  { id: 'emerald', name: 'Emerald', c: '#0f8a58', stops: ['#7af0bd', '#108656', '#033a22'], note: 'Rich green with a cool, jewel-box glow.' },
  { id: 'sapphire', name: 'Sapphire', c: '#1d3fc0', stops: ['#8fa6ff', '#1f3fbf', '#08144f'], note: 'Midnight blue that flashes bright in the light.' },
  { id: 'opal', name: 'Opal', c: '#e7e3f5', stops: ['#ffd6ec', '#c9f0ff', '#d8ffd9', '#fff1c4', '#e6d2ff'], note: 'Milky base with a colour-shifting chrome glaze.' },
  { id: 'pearl', name: 'Pearl', c: '#efe6d6', stops: ['#ffffff', '#efe3d0', '#c8b9a2'], note: 'Soft, luminous nude — quiet luxury.' },
  { id: 'onyx', name: 'Onyx', c: '#1a1a1a', stops: ['#6b6b6b', '#1b1b1b', '#000000'], note: 'Glossy black, polished like a signet stone.' },
]
const SV = [
  ['Gel manicure', 'Shaping, cuticle care and a glossy gel colour that lasts.'],
  ['BIAB / builder gel', 'Strength and structure for your natural nails.'],
  ['Acrylic extensions', 'Length and shape built to order — square to almond.'],
  ['Nail art', 'Chrome, French, gems and hand-painted detail.'],
  ['Pedicure', 'Soak, tidy, file and a polished finish for toes.'],
  ['Removal & care', 'Gentle removal and a reset for tired nails.'],
]

/* faceted gem icon used for swatches and service cards */
function GemIcon({ g, size = 44 }) {
  const id = 'gi-' + g.id
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true">
      <defs><linearGradient id={id} x1="0" y1="0" x2="1" y2="1">{g.stops.map((s, k) => <stop key={k} offset={k / (g.stops.length - 1)} stopColor={s} />)}</linearGradient></defs>
      <polygon points="14,6 34,6 44,18 24,44 4,18" fill={`url(#${id})`} />
      <polygon points="14,6 34,6 30,18 18,18" fill="#fff" opacity=".35" />
      <path d="M4,18 L44,18 M18,18 L24,44 L30,18" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="1" />
      <polygon points="4,18 18,18 24,44" fill="#000" opacity=".18" />
    </svg>
  )
}

function Hero({ lite, gem }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const op = useTransform(scrollYProgress, [0, 0.6], [1, 0])
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '25%'])
  return (
    <section ref={ref} className="relative min-h-[100svh] overflow-hidden" style={{ background: `radial-gradient(ellipse at 70% 40%, #17382d 0%, ${VEL} 55%, ${DEEP} 100%)` }}>
      <div className="absolute inset-x-0 top-0 h-[55%] md:inset-0 md:h-full">
        {!lite ? <Suspense fallback={null}><GemScene color={gem.c} progress={scrollYProgress} /></Suspense>
          : <div className="absolute left-1/2 top-[18%] -translate-x-1/2 md:left-auto md:right-[14%] md:top-[28%] md:translate-x-0"><GemIcon g={gem} size={220} /></div>}
      </div>
      <motion.div style={{ opacity: op, y }} className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1360px] flex-col justify-end px-5 pb-16 pt-[48vh] md:justify-center md:px-10 md:pt-24">
        <p className="mb-6 flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[.32em] text-[#c9a45c]">
          <span className="h-px w-10 bg-[#c9a45c]" />Nail salon · {b.area}, Birmingham
        </p>
        <h1 className={`${DISP} text-[clamp(52px,8.4vw,140px)] leading-[.92] text-[#f3ead8]`}>
          <SplitText text="Nails, cut" delay={1.5} stagger={0.05} className="block" />
          <span className="block"><SplitText text="like" delay={1.9} className={`${SERIF} mr-[.22em] inline-block italic`} /><LineReveal delay={2.1} className={`${GOLDTXT} !inline-block`}>gemstones.</LineReveal></span>
        </h1>
        <p className="mt-7 max-w-[440px] text-[16px] leading-relaxed text-[#f3ead8]/70">In the heart of Birmingham's Jewellery Quarter — manicures, extensions and nail art finished with a jeweller's eye for detail.</p>
        <div className="mt-9 flex flex-wrap items-center gap-3">
          <Magnetic><a href="#book" data-cursor="Book" className="inline-flex h-14 items-center gap-3 rounded-full bg-gradient-to-r from-[#b48a3e] via-[#f0d690] to-[#b48a3e] px-8 text-[14px] font-bold uppercase tracking-[.16em] text-[#0b1c17] shadow-[0_10px_30px_rgba(201,164,92,.3)]">Book a set <ArrowUpRight size={18} /></a></Magnetic>
          <a href={waLink(b.phones[0])} target="_blank" rel="noopener" className="inline-flex h-14 items-center gap-2 rounded-full border border-[#c9a45c]/50 px-6 text-[14px] font-semibold text-[#f3ead8] hover:border-[#c9a45c]"><WA />WhatsApp</a>
        </div>
      </motion.div>
      <div className={`${SERIF} pointer-events-none absolute bottom-8 right-8 z-10 hidden text-right text-[15px] italic text-[#f3ead8]/45 md:block`}>Move to turn the stone<br />scroll to open the box</div>
    </section>
  )
}

/* scroll scene: a ring box opens and the colour inside glows */
function JewelBox({ gem }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const lift = useTransform(scrollYProgress, [0, 0.25], ['40vh', '0vh'])
  const lid = useTransform(scrollYProgress, [0.25, 0.6], [0, -112])
  const glow = useTransform(scrollYProgress, [0.35, 0.65], [0, 1])
  const ring = useTransform(scrollYProgress, [0.4, 0.75], [0.4, 1])
  const tOp = useTransform(scrollYProgress, [0.55, 0.75], [0, 1])
  const tY = useTransform(scrollYProgress, [0.55, 0.75], [40, 0])
  const bg = useTransform(scrollYProgress, [0.7, 1], [DEEP, VEL])
  return (
    <motion.section ref={ref} style={{ background: bg }} className="relative h-[260vh]">
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden px-5">
        <motion.div style={{ opacity: glow, scale: ring }} className="pointer-events-none absolute left-1/2 top-1/2 h-[120vmin] w-[120vmin] -translate-x-1/2 -translate-y-1/2 rounded-full" >
          <div className="h-full w-full rounded-full" style={{ background: `conic-gradient(from 0deg, transparent, ${GOLD}33, transparent 20%, ${gem.c}44, transparent 40%, ${GOLD}33, transparent 60%, ${gem.c}44, transparent 80%)`, filter: 'blur(18px)' }} />
        </motion.div>
        <motion.div style={{ opacity: tOp, y: tY }} className="relative z-10 mb-10 text-center">
          <p className="mb-3 text-[12px] font-semibold uppercase tracking-[.32em] text-[#c9a45c]">The collection</p>
          <h2 className={`${DISP} text-[clamp(40px,6vw,92px)] leading-[.95] text-[#f3ead8]`}>Every set, <span className={`${SERIF} italic ${GOLDTXT}`}>a little jewel</span></h2>
        </motion.div>
        <motion.div style={{ y: lift }} className="relative z-10 w-[min(78vw,440px)]" >
          <div className="relative" style={{ perspective: 1100 }}>
            {/* interior cushion revealed when lid opens */}
            <div className="relative h-[clamp(90px,14vw,130px)] overflow-hidden rounded-t-[14px] bg-gradient-to-b from-[#040b08] to-[#10291f] shadow-[inset_0_10px_30px_#000]">
              <div className="absolute inset-x-[8%] top-[46%] h-[10px] rounded-full bg-black/70 shadow-[0_1px_0_rgba(255,255,255,.08)]" />
              <motion.div style={{ opacity: glow }} className="absolute left-1/2 top-[18%] -translate-x-1/2 drop-shadow-[0_0_24px_rgba(255,240,200,.6)]"><GemIcon g={gem} size={64} /></motion.div>
            </div>
            <motion.div style={{ rotateX: lid, transformOrigin: '50% 0%', transformStyle: 'preserve-3d' }} className="absolute inset-x-0 top-0 h-[clamp(90px,14vw,130px)]">
              <div className="absolute inset-0 rounded-t-[14px] border border-[#c9a45c]/40 bg-gradient-to-b from-[#1b4536] to-[#0e281f] shadow-[0_6px_20px_rgba(0,0,0,.5)]" style={{ backfaceVisibility: 'hidden' }}>
                <div className="absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-r from-[#8a6a2c] via-[#f3dc9c] to-[#8a6a2c]" />
                <div className={`${DISP} grid h-full place-items-center text-[clamp(22px,3vw,30px)] tracking-[.2em] text-[#c9a45c]`}>LY NAILS</div>
              </div>
              <div className="absolute inset-0 rounded-t-[14px] bg-gradient-to-b from-[#f6eedd] to-[#d9c9a8]" style={{ transform: 'rotateX(180deg)', backfaceVisibility: 'hidden' }}>
                <div className={`${SERIF} grid h-full place-items-center text-[18px] italic text-[#6b5326]`}>Jewellery Quarter · Birmingham</div>
              </div>
            </motion.div>
            <div className="relative h-[clamp(110px,16vw,150px)] rounded-b-[14px] border-x border-b border-[#c9a45c]/30 bg-gradient-to-b from-[#173c2f] to-[#081712] shadow-[0_30px_60px_rgba(0,0,0,.6)]">
              <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#8a6a2c] via-[#f3dc9c] to-[#8a6a2c]" />
              <div className="absolute left-1/2 top-3 h-5 w-10 -translate-x-1/2 rounded-b-md bg-gradient-to-b from-[#f3dc9c] to-[#8a6a2c]" />
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  )
}

/* ---- signature: gemstone shade picker on a hand ---- */
const FINGERS = [
  { x: 92, y: 92, w: 54, h: 230 },
  { x: 152, y: 52, w: 56, h: 260 },
  { x: 214, y: 76, w: 54, h: 240 },
  { x: 274, y: 134, w: 48, h: 190 },
]
const THUMB = { x: 26, y: 250, w: 56, h: 160 }
const nailOf = f => ({ x: f.x + 9, y: f.y + 9, w: f.w - 18, h: f.w * 1.18, rx: (f.w - 18) / 2 })
function Nail({ f, fill, k, gemId }) {
  const n = nailOf(f)
  return (
    <g>
      <rect x={n.x} y={n.y} width={n.w} height={n.h} rx={n.rx} fill="#e8c9b4" />
      <motion.rect key={gemId} x={n.x} y={n.y} width={n.w} height={n.h} rx={n.rx} fill={fill}
        initial={{ opacity: 0, scaleY: 0.2 }} animate={{ opacity: 1, scaleY: 1 }} transition={{ duration: 0.6, delay: k * 0.07, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformOrigin: `${n.x + n.w / 2}px ${n.y + n.h}px` }} />
      <rect x={n.x + n.w * 0.22} y={n.y + 8} width={n.w * 0.16} height={n.h * 0.5} rx={n.w * 0.08} fill="#fff" opacity=".55" />
    </g>
  )
}
function Sparkle({ x, y, d }) {
  return (
    <motion.path d={`M${x},${y - 12} L${x + 3},${y - 3} L${x + 12},${y} L${x + 3},${y + 3} L${x},${y + 12} L${x - 3},${y + 3} L${x - 12},${y} L${x - 3},${y - 3} Z`} fill="#fff6d6"
      initial={{ scale: 0, opacity: 0, rotate: 0 }} animate={{ scale: [0, 1.2, 0], opacity: [0, 1, 0], rotate: 90 }} transition={{ duration: 0.9, delay: d }} style={{ transformOrigin: `${x}px ${y}px` }} />
  )
}
function Hand({ gem }) {
  const fill = `url(#nf-${gem.id})`
  const t = nailOf(THUMB)
  return (
    <svg viewBox="-40 10 400 480" className="h-full w-full" aria-label={`Hand with ${gem.name} nails`} role="img">
      <defs>
        {GEMS.map(g => (
          <linearGradient key={g.id} id={'nf-' + g.id} x1="0" y1="0" x2={g.id === 'opal' ? '1' : '.4'} y2="1">
            {g.stops.map((s, k) => <stop key={k} offset={k / (g.stops.length - 1)} stopColor={s} />)}
          </linearGradient>
        ))}
        <linearGradient id="skin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f0d3bf" /><stop offset="1" stopColor="#d9ae94" /></linearGradient>
        <linearGradient id="sweep" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset=".5" stopColor="#fff" stopOpacity=".85" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
        <clipPath id="nailclip">
          {FINGERS.map((f, k) => { const n = nailOf(f); return <rect key={k} x={n.x} y={n.y} width={n.w} height={n.h} rx={n.rx} /> })}
          <rect x={t.x} y={t.y} width={t.w} height={t.h} rx={t.rx} transform="rotate(-38 54 400)" />
        </clipPath>
      </defs>
      <g transform="rotate(-38 54 400)">
        <rect x={THUMB.x} y={THUMB.y} width={THUMB.w} height={THUMB.h + 60} rx={THUMB.w / 2} fill="url(#skin)" />
      </g>
      {FINGERS.map((f, k) => <rect key={k} x={f.x} y={f.y} width={f.w} height={f.h + 40} rx={f.w / 2} fill="url(#skin)" />)}
      <rect x="86" y="262" width="242" height="240" rx="64" fill="url(#skin)" />
      {/* finger creases */}
      {FINGERS.map((f, k) => <path key={k} d={`M${f.x + 12},${f.y + f.h * 0.55} q${f.w / 2 - 12},6 ${f.w - 24},0`} stroke="#c49880" strokeWidth="2" fill="none" opacity=".6" />)}
      {/* gold ring on the ring finger */}
      <rect x={FINGERS[2].x - 3} y={FINGERS[2].y + 168} width={FINGERS[2].w + 6} height="16" rx="6" fill="#c9a45c" />
      <rect x={FINGERS[2].x - 3} y={FINGERS[2].y + 168} width={FINGERS[2].w + 6} height="5" rx="3" fill="#f3dc9c" />
      <g transform="rotate(-38 54 400)"><Nail f={THUMB} fill={fill} k={0} gemId={gem.id} /></g>
      {FINGERS.map((f, k) => <Nail key={k} f={f} fill={fill} k={k + 1} gemId={gem.id} />)}
      <g clipPath="url(#nailclip)">
        <g transform="skewX(-20)"><motion.rect key={gem.id} y="0" width="120" height="480" fill="url(#sweep)" initial={{ x: -160 }} animate={{ x: 560 }} transition={{ duration: 1.1, delay: 0.25, ease: 'easeInOut' }} /></g>
      </g>
      <g key={'s' + gem.id} pointerEvents="none">
        {FINGERS.map((f, k) => <Sparkle key={k} x={f.x + f.w - 6} y={f.y + 8} d={0.3 + k * 0.08} />)}
        <Sparkle x={60} y={300} d={0.2} />
      </g>
    </svg>
  )
}
function Picker({ gem, setGem }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 20%'] })
  const clip = useTransform(scrollYProgress, [0, 1], ['polygon(50% 40%, 60% 50%, 50% 60%, 40% 50%)', 'polygon(50% -60%, 160% 50%, 50% 160%, -60% 50%)'])
  return (
    <motion.section ref={ref} id="shades" style={{ clipPath: clip }} className="relative overflow-hidden px-5 py-24 md:px-10 md:py-32" >
      <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 30% 50%, ${gem.c}38, transparent 60%), ${IVORY}` }} />
      <div className="relative mx-auto grid max-w-[1360px] items-center gap-12 lg:grid-cols-[1fr_1fr]">
        <div className="order-2 lg:order-1">
          <p className="mb-4 text-[12px] font-bold uppercase tracking-[.32em] text-[#8a6a2c]">The shade cabinet</p>
          <h2 className={`${DISP} text-[clamp(44px,6.4vw,104px)] leading-[.92] text-[#0b1c17]`}>Choose your <span className={`${SERIF} italic`}>stone</span></h2>
          <p className="mt-5 max-w-[440px] text-[16px] text-[#0b1c17]/70">Tap a gem and watch the set change. Bring the shade with you — your technician will match it in gel.</p>
          <div className="mt-9 grid grid-cols-3 gap-3 sm:grid-cols-6">
            {GEMS.map(g => (
              <button key={g.id} onClick={() => setGem(g)} aria-pressed={gem.id === g.id} data-cursor={g.name}
                className={`group relative grid place-items-center rounded-2xl px-2 py-3 transition-colors ${gem.id === g.id ? 'bg-[#0b1c17] text-[#f3ead8]' : 'bg-white/60 text-[#0b1c17] hover:bg-white'}`}>
                {gem.id === g.id && <motion.span layoutId="gemring" className="absolute inset-0 rounded-2xl ring-2 ring-[#c9a45c]" />}
                <motion.span whileHover={{ rotate: 12, scale: 1.1 }} whileTap={{ scale: 0.9 }}><GemIcon g={g} size={40} /></motion.span>
                <span className="mt-1 text-[12px] font-semibold uppercase tracking-[.12em]">{g.name}</span>
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={gem.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mt-8 border-l-2 border-[#c9a45c] pl-5">
              <p className={`${DISP} text-[34px] leading-none text-[#0b1c17]`}>{gem.name}</p>
              <p className={`${SERIF} mt-1 text-[20px] italic text-[#0b1c17]/70`}>{gem.note}</p>
            </motion.div>
          </AnimatePresence>
          <a href="#book" data-svc={`Gel manicure — ${gem.name} shade`} className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#0b1c17] px-7 py-4 text-[13px] font-bold uppercase tracking-[.16em] text-[#f3ead8] hover:bg-[#17382d]">Book the {gem.name} set <ArrowUpRight size={16} /></a>
        </div>
        <div className="relative order-1 mx-auto aspect-[3/4] w-full max-w-[420px] lg:order-2">
          <div className="absolute inset-[6%] rounded-[46%_46%_20px_20px] border border-[#c9a45c]/50 bg-[#0b1c17] shadow-[0_40px_80px_rgba(11,28,23,.35)]" />
          <div className="absolute inset-[6%] overflow-hidden rounded-[46%_46%_20px_20px]"><div className="absolute inset-0" style={{ background: `radial-gradient(circle at 50% 30%, ${gem.c}55, transparent 65%)`, transition: 'background .6s' }} /></div>
          <div className="absolute inset-[10%_12%_4%]"><Hand gem={gem} /></div>
        </div>
      </div>
    </motion.section>
  )
}

function Services() {
  return (
    <section id="services" className="relative px-5 py-28 md:px-10" style={{ background: VEL }}>
      <div className="mx-auto max-w-[1360px]">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <h2 className={`${DISP} text-[clamp(44px,6.4vw,104px)] leading-[.92] text-[#f3ead8]`}><SplitText text="The display case" /></h2>
          <p className="max-w-[340px] text-[#f3ead8]/60">Every treatment polished to a finish. Ask in the salon or on WhatsApp for current pricing.</p>
        </div>
        <div className="grid gap-px overflow-hidden rounded-[22px] border border-[#c9a45c]/30 bg-[#c9a45c]/25 sm:grid-cols-2 lg:grid-cols-3">
          {SV.map(([t, d], k) => (
            <Reveal key={t} delay={k * 0.06} className="group relative overflow-hidden bg-[#0b1c17] p-8 md:p-10">
              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-60" style={{ background: GEMS[k].c }} />
              <div className="mb-10 flex items-center justify-between">
                <span className={`${SERIF} text-[18px] italic text-[#c9a45c]`}>No. {String(k + 1).padStart(2, '0')}</span>
                <motion.span whileHover={{ rotate: 180 }} transition={{ duration: 0.8 }}><GemIcon g={GEMS[k]} size={38} /></motion.span>
              </div>
              <h3 className={`${DISP} text-[34px] leading-none text-[#f3ead8]`}>{t}</h3>
              <p className="mt-3 min-h-[48px] text-[15px] leading-relaxed text-[#f3ead8]/60">{d}</p>
              <a href="#book" data-svc={t} className="mt-6 inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[.2em] text-[#c9a45c]">Reserve <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function Certificate() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center center'] })
  const rot = useTransform(scrollYProgress, [0, 1], [-8, 0])
  const sc = useTransform(scrollYProgress, [0, 1], [0.85, 1])
  return (
    <section ref={ref} className="relative overflow-hidden px-5 py-28 md:px-10" style={{ background: `linear-gradient(${VEL}, ${DEEP})` }}>
      <motion.div style={{ rotate: rot, scale: sc }} className="relative mx-auto max-w-[900px] rounded-[6px] bg-[#f3ead8] p-3 shadow-[0_40px_80px_rgba(0,0,0,.5)]">
        <div className="rounded-[4px] border-2 border-[#c9a45c] p-7 text-[#0b1c17] md:p-12">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#c9a45c]/60 pb-5">
            <span className={`${DISP} text-[clamp(24px,3vw,36px)]`}>Grading report</span>
            <span className="text-[11px] font-bold uppercase tracking-[.3em] text-[#8a6a2c]">Verified on Google</span>
          </div>
          <div className="grid gap-8 py-8 sm:grid-cols-2">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[.3em] text-[#0b1c17]/50">Clarity</p>
              <p className={`${DISP} text-[clamp(84px,12vw,150px)] leading-none`}>4.9</p>
              <div className="mt-2 flex gap-1 text-[#c9a45c]">{[0, 1, 2, 3, 4].map(k => <Star key={k} size={22} fill="currentColor" />)}</div>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[.3em] text-[#0b1c17]/50">Count</p>
              <p className={`${DISP} text-[clamp(84px,12vw,150px)] leading-none`}><Counter to={b.rev} /></p>
              <p className={`${SERIF} mt-2 text-[20px] italic text-[#0b1c17]/70`}>reviews from real clients</p>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-[#c9a45c]/60 pt-5 text-[12px] uppercase tracking-[.2em] text-[#0b1c17]/55">
            <span>Ly Nails · B18 6JA</span>
            <span className="grid h-16 w-16 place-items-center rounded-full border-2 border-[#c9a45c] text-[10px] font-bold text-[#8a6a2c]">Seal</span>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

function Book() {
  const bk = useBooking()
  const f = 'h-14 w-full rounded-none border-0 border-b border-[#0b1c17]/25 bg-transparent text-[18px] text-[#0b1c17] outline-none placeholder:text-[#0b1c17]/35 focus:border-[#c9a45c]'
  return (
    <section id="book" className="relative px-5 py-28 md:px-10" style={{ background: DEEP }}>
      <div className="mx-auto grid max-w-[1360px] items-center gap-12 lg:grid-cols-2">
        <div className="text-[#f3ead8]">
          <p className="mb-4 text-[12px] font-bold uppercase tracking-[.32em] text-[#c9a45c]">Reserve your set</p>
          <h2 className={`${DISP} text-[clamp(48px,7vw,116px)] leading-[.9]`}>Book a <span className={`${SERIF} italic ${GOLDTXT}`}>sitting</span></h2>
          <p className="mt-6 max-w-[420px] text-[#f3ead8]/65">Leave your number and the salon will message you back with a time. Ly Nails also takes bookings on Fresha.</p>
          <div className="mt-8 grid gap-2">{b.phones.map(p => <a key={p} href={'tel:' + tel(p)} className={`${DISP} text-[clamp(28px,3vw,40px)] hover:text-[#c9a45c]`}>{p}</a>)}</div>
        </div>
        <div className="relative rounded-[28px] bg-[#f3ead8] p-8 shadow-[0_40px_80px_rgba(0,0,0,.45)] md:p-12">
          <div className="pointer-events-none absolute inset-3 rounded-[20px] border border-[#c9a45c]/60" />
          <AnimatePresence mode="wait">
            {!bk.s.sent ? (
              <motion.form key="f" exit={{ opacity: 0, y: -10 }} onSubmit={bk.submit} noValidate className="relative grid gap-6">
                <input className={f} placeholder="Your name" value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} autoComplete="name" />
                <motion.input animate={bk.s.err ? { x: [0, -8, 8, -5, 5, 0] } : {}} className={f + (bk.s.err ? ' !border-red-600' : '')} type="tel" inputMode="tel" placeholder="+44 7___ ______" value={bk.s.phone} onFocus={phoneFocus(bk, '+44 ')} onChange={e => bk.upd('phone', e.target.value)} autoComplete="tel" />
                {bk.s.err && <p className="-mt-3 text-[13px] text-red-700">Please enter a full phone number.</p>}
                <input className={f} placeholder="Treatment or shade" value={bk.s.svc} onChange={e => bk.upd('svc', e.target.value)} />
                <button disabled={bk.s.loading} className="mt-2 h-16 rounded-full bg-[#0b1c17] text-[13px] font-bold uppercase tracking-[.2em] text-[#f3ead8] transition-colors hover:bg-[#17382d] disabled:opacity-60">{bk.s.loading ? 'Sending…' : 'Request a time'}</button>
                <p className="text-center text-[13px] text-[#0b1c17]/55">In the finished site this request goes straight to your phone.</p>
              </motion.form>
            ) : (
              <motion.div key="ok" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative grid place-items-center py-10 text-center text-[#0b1c17]">
                <CheckDraw className="mb-5 text-[#c9a45c]" />
                <h3 className={`${DISP} text-[44px]`}>Request received</h3>
                <p className="mt-2 max-w-[320px] text-[#0b1c17]/65">In the finished site this request goes straight to your phone, and the salon replies with a time.</p>
                <button onClick={bk.reset} className="mt-5 text-[13px] font-semibold uppercase tracking-[.16em] underline underline-offset-4">Book another</button>
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
    <section id="contact" className="relative px-5 py-24 md:px-10" style={{ background: VEL }}>
      <div className="mx-auto grid max-w-[1360px] gap-10 lg:grid-cols-[.9fr_1.1fr]">
        <div className="text-[#f3ead8]">
          <p className="mb-4 text-[12px] font-bold uppercase tracking-[.32em] text-[#c9a45c]">Visit</p>
          <h2 className={`${DISP} mb-8 text-[clamp(44px,6vw,92px)] leading-[.92]`}>Augusta Street</h2>
          <p className="mb-6 flex items-start gap-3 text-[19px]"><MapPin className="mt-1 shrink-0 text-[#c9a45c]" />{b.addr}<br />{b.area}</p>
          {b.phones.map(p => <a key={p} href={'tel:' + tel(p)} className="mb-2 flex items-center gap-3 text-[22px] hover:text-[#c9a45c]"><Phone size={18} className="text-[#c9a45c]" />{p}</a>)}
          <div className="mt-8 flex flex-wrap gap-3">
            <Magnetic><a href={waLink(b.phones[0])} target="_blank" rel="noopener" className="inline-flex h-12 items-center gap-2 rounded-full bg-[#25d366] px-6 text-[14px] font-bold text-[#06110d]"><WA />WhatsApp</a></Magnetic>
            <a href={'tel:' + tel(b.phones[1])} className="inline-flex h-12 items-center gap-2 rounded-full border border-[#c9a45c]/50 px-6 text-[14px] font-bold hover:border-[#c9a45c]"><Phone size={16} />Call the salon</a>
          </div>
        </div>
        <div className="h-[380px] overflow-hidden rounded-[22px] border border-[#c9a45c]/40 md:h-[460px]"><GMap q={`${b.name}, ${b.addr}`} dark /></div>
      </div>
    </section>
  )
}

function App() {
  useSmooth()
  const lite = useLite()
  const [gem, setGem] = useState(GEMS[1])
  return (
    <MotionConfig reducedMotion="user">
      <div className="overflow-x-clip font-['Manrope',sans-serif]" style={{ background: VEL, color: IVORY, '--sel': GOLD, '--selc': VEL }}>
        <Intro bg={DEEP} fg={GOLD} duration={1.7}>
          <div className="text-center">
            <motion.div initial={{ rotate: -90, scale: 0.4, opacity: 0 }} animate={{ rotate: 0, scale: 1, opacity: 1 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}><GemIcon g={GEMS[1]} size={84} /></motion.div>
            <p className={`${DISP} mt-4 text-[28px] tracking-[.3em]`}>LY NAILS</p>
          </div>
        </Intro>
        <Progress color={GOLD} />
        <Cursor color={GOLD} blend="normal" textColor={VEL} />
        <Ribbon lang="en" name={b.name} bg={GOLD} fg={VEL} />
        <header className="sticky top-0 z-40 border-b border-[#c9a45c]/25 bg-[#0b1c17]/80 backdrop-blur-xl">
          <div className="mx-auto flex h-[68px] max-w-[1360px] items-center justify-between px-5 md:px-10">
            <a href="#top" className="flex items-center gap-3"><GemIcon g={gem} size={28} /><span className={`${DISP} text-[24px] tracking-[.18em]`}>LY NAILS</span></a>
            <nav className="hidden gap-8 text-[12px] font-semibold uppercase tracking-[.2em] text-[#f3ead8]/65 md:flex">{[['#shades', 'Shades'], ['#services', 'Treatments'], ['#book', 'Book'], ['#contact', 'Visit']].map(([h, t]) => <a key={h} href={h} className="hover:text-[#c9a45c]">{t}</a>)}</nav>
            <a href="#book" className="hidden h-10 items-center rounded-full border border-[#c9a45c] px-5 text-[12px] font-bold uppercase tracking-[.18em] text-[#c9a45c] hover:bg-[#c9a45c] hover:text-[#0b1c17] sm:inline-flex">Book</a>
          </div>
        </header>
        <main id="top">
          <Hero lite={lite} gem={gem} />
          <JewelBox gem={gem} />
          <Marquee base={-1.6} className="border-y border-[#c9a45c]/30 bg-[#06110d] py-5">
            {['Gel manicures', 'BIAB', 'Extensions', 'Chrome', 'Nail art', 'Pedicures'].map(t => <span key={t} className={`${DISP} mx-8 inline-flex items-center gap-14 text-[clamp(30px,4vw,58px)] text-[#f3ead8]`}>{t}<span className="text-[22px] text-[#c9a45c]">◆</span></span>)}
          </Marquee>
          <Picker gem={gem} setGem={setGem} />
          <Services />
          <Certificate />
          <Book />
          <Contact />
        </main>
        <footer className="border-t border-[#c9a45c]/25 px-5 py-8 text-[13px] text-[#f3ead8]/55 md:px-10" style={{ background: DEEP }}>
          <div className="mx-auto flex max-w-[1360px] flex-wrap justify-between gap-4"><span>© 2026 {b.name} · Website concept by Artem</span><span>{b.addr}</span></div>
        </footer>
        <CallBar lang="en" phone={b.phones[0]} barCls="bg-[#06110d]/95 backdrop-blur border-t border-[#c9a45c]/30" callCls="rounded-full border border-[#c9a45c] text-[#c9a45c]" bookCls="rounded-full bg-[#c9a45c] text-[#0b1c17]" />
        <div className="h-[72px] sm:hidden" style={{ background: DEEP }} />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
