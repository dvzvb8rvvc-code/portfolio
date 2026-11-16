import React, { useRef, useState, useEffect, useMemo, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence, MotionConfig } from 'framer-motion'
import { ArrowRight, Phone, MapPin, Star, Droplets, Armchair, Sparkles, Disc3, PawPrint, Car } from 'lucide-react'
import '../lib/base.css'
import { useSmooth, Ribbon, SplitText, LineReveal, ScrollWords, Reveal, Magnetic, Cursor, Marquee, Counter, useBooking, phoneFocus, CheckDraw, GMap, CallBar, Progress, Intro, tel, useLite, WA, waLink } from '../lib/kit'

const Hive = lazy(() => import('./mcvaleting3d'))

const b = {
  name: 'Mobile Car Valeting Manchester',
  short: 'Home Car Valeting',
  addr: '60 Mornington Cres, Fallowfield, Manchester M14 6DD',
  phone: '+44 7523 077383',
  rating: '4.9', rev: 68,
}
const HONEY = '#ffb400', INK = '#141210', CREAM = '#fff8ec', AMBER = '#e08a00'
const H = "font-['Bricolage_Grotesque',sans-serif]"
const HEXCLIP = 'polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)'

const SV = [
  ['Exterior hand wash', 'Snow foam, safe two-bucket wash, wheels, arches and a streak-free dry.', Droplets],
  ['Interior valet', 'Hoover, wipe-down of every surface, glass inside and fresh mats.', Armchair],
  ['Full valet', 'Inside and out in one visit — the car back to how you want to remember it.', Car],
  ['Wheels & tyres', 'Brake dust and road grime lifted, tyres dressed.', Disc3],
  ['Pet hair removal', 'Fur pulled out of carpets, boot liners and seat seams.', PawPrint],
  ['Upholstery shampoo', 'Seats and carpets shampooed to lift stains and smells.', Sparkles],
]
const STEPS = [
  ['01', 'Pick a cell', 'Choose a slot in the hive below or drop us a WhatsApp.'],
  ['02', 'We buzz over', 'We come to you — your driveway, your street or your work car park.'],
  ['03', 'Keys back, car gleaming', 'You carry on with your day. The bees get on with the job.'],
]
const TIMES = ['08:00', '10:00', '12:00', '14:00', '16:00']
const PLACES = ['driveway.', 'street.', 'office car park.', 'doorstep.']

/* ---------- small pieces (all top-level) ---------- */
function HexMark({ size = 28, fill = HONEY, stroke = INK }) {
  return <svg viewBox="0 0 40 46" width={size} height={size * 1.15} aria-hidden="true"><polygon points="20,2 38,12 38,34 20,44 2,34 2,12" fill={fill} stroke={stroke} strokeWidth="3" strokeLinejoin="round" /><circle cx="20" cy="23" r="6" fill={stroke} /></svg>
}

function RotWord({ words, className = '' }) {
  const [i, setI] = useState(0)
  useEffect(() => { const t = setInterval(() => setI(v => (v + 1) % words.length), 2200); return () => clearInterval(t) }, [words.length])
  return (
    <span className={'relative inline-block h-[1.15em] overflow-hidden align-bottom ' + className}>
      <AnimatePresence mode="wait">
        <motion.span key={i} className="inline-block" initial={{ y: '100%', rotate: 6 }} animate={{ y: '0%', rotate: 0 }} exit={{ y: '-100%', rotate: -6 }} transition={{ duration: .5, ease: [0.76, 0, 0.24, 1] }}>{words[i]}</motion.span>
      </AnimatePresence>
    </span>
  )
}

function HexBg({ color = 'rgba(20,18,16,.06)' }) {
  return <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='56' height='97' viewBox='0 0 56 97'><path d='M28 0 56 16v32L28 64 0 48V16zM28 64v33M0 48v49M56 48v49' fill='none' stroke='${encodeURIComponent(color)}' stroke-width='1.5'/></svg>")`, backgroundSize: '56px 97px' }} />
}

function LiteComb() {
  return (
    <div className="absolute right-[-10%] top-[8%] w-[70vw] max-w-[560px] md:right-[4%] md:top-[18%] md:w-[42vw]" aria-hidden="true">
      <svg viewBox="0 0 300 300" className="w-full">{[[150, 150], [150, 80], [150, 220], [90, 115], [210, 115], [90, 185], [210, 185]].map(([x, y], k) => <motion.polygon key={k} points={`${x},${y - 34} ${x + 30},${y - 17} ${x + 30},${y + 17} ${x},${y + 34} ${x - 30},${y + 17} ${x - 30},${y - 17}`} fill={k % 2 ? HONEY : '#f2a900'} stroke={INK} strokeWidth="3" animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, delay: k * .2 }} />)}</svg>
    </div>
  )
}

function Hero({ lite }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '25%'])
  const op = useTransform(scrollYProgress, [0, .8], [1, 0])
  return (
    <section ref={ref} className="relative h-[100svh] min-h-[660px] overflow-hidden" style={{ background: `radial-gradient(90% 80% at 75% 40%, #fff3d0 0%, ${CREAM} 60%)` }}>
      <HexBg />
      <div className="absolute inset-0">{lite ? <LiteComb /> : <Suspense fallback={<LiteComb />}><Hive progress={scrollYProgress} /></Suspense>}</div>
      <motion.div style={{ y, opacity: op }} className="pointer-events-none relative z-10 mx-auto flex h-full max-w-[1320px] flex-col justify-end px-5 pb-24 md:justify-center md:px-10 md:pb-0">
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5 }} className="mb-5 inline-flex w-fit items-center gap-2 rounded-full bg-[#141210] px-4 py-2 text-[12px] font-bold uppercase tracking-[.16em] text-[#ffb400]"><span className="h-2 w-2 animate-pulse rounded-full bg-[#ffb400]" />Mobile valeting · Manchester</motion.p>
        <h1 className={`${H} max-w-[820px] text-[clamp(54px,10vw,156px)] font-extrabold leading-[.86] tracking-[-.045em]`} style={{ color: INK }}>
          <SplitText text="Busy bees" delay={1.35} y="115%" rotate={6} className="block" />
          <LineReveal delay={1.6}><span className="relative inline-block px-[.08em]"><span className="absolute inset-x-0 bottom-[.08em] top-[.18em] -skew-x-6 bg-[#ffb400]" />
            <span className="relative">at your door.</span></span></LineReveal>
        </h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }} className="mt-6 max-w-[520px] text-[clamp(17px,1.5vw,20px)] font-medium text-[#4a4136]">
          Home car valeting across Manchester. We valet it on your <RotWord words={PLACES} className="font-bold text-[#141210]" />
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.2 }} className="pointer-events-auto mt-8 flex flex-wrap items-center gap-3">
          <Magnetic><a href="#book" data-cursor="Buzz!" className="inline-flex h-14 items-center gap-3 rounded-full bg-[#141210] px-8 text-[16px] font-bold text-[#ffb400] transition-[scale] active:scale-95 md:h-16 md:px-9">Pick a slot <ArrowRight size={19} /></a></Magnetic>
          <a href={waLink(b.phone)} target="_blank" rel="noopener" className="inline-flex h-14 items-center gap-2 rounded-full bg-white px-6 font-bold text-[#141210] shadow-[0_10px_30px_-12px_rgba(20,18,16,.4)] md:h-16"><WA /> WhatsApp</a>
          <span className="flex items-center gap-2 text-[14px] font-bold text-[#4a4136]"><Star size={16} fill={HONEY} stroke={HONEY} />{b.rating} · {b.rev} Google reviews</span>
        </motion.div>
      </motion.div>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3 }} className="absolute bottom-5 right-6 z-10 hidden text-[12px] font-bold uppercase tracking-[.2em] text-[#8a7a62] md:block">move your cursor — the hive follows</motion.p>
    </section>
  )
}

/* ---------- transition 1: hexagon tile wipe ---------- */
function HexTile({ p, d, x, y, color }) {
  const s = useTransform(p, [d, d + .38], [0, 1.18])
  return <motion.div style={{ left: x + 'vw', top: y + 'vw', scale: s, background: color, clipPath: HEXCLIP }} className="absolute h-[14.5vw] w-[12.6vw]" />
}
function HexWipe({ from, to }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] })
  const tiles = useMemo(() => {
    const T = []
    for (let r = 0; r < 4; r++) for (let c = -1; c < 9; c++) T.push({ x: c * 12.5 + (r % 2 ? 6.25 : 0) - 0.05, y: r * 10.8 - 3.6, d: (3 - r) * .14 + ((c * 37 + r * 11) % 7) * .022 })
    return T
  }, [])
  return (
    <div ref={ref} aria-hidden="true" className="relative h-[36vw] overflow-hidden" style={{ background: from }}>
      {tiles.map((t, k) => <HexTile key={k} p={scrollYProgress} {...t} color={to} />)}
    </div>
  )
}

/* ---------- transition 2: pinned hex mask reveal ---------- */
const hexPoly = r => 'polygon(' + [-90, -30, 30, 90, 150, 210].map(a => `calc(50% + ${(Math.cos(a * Math.PI / 180) * r).toFixed(2)}vmax) calc(50% + ${(Math.sin(a * Math.PI / 180) * r).toFixed(2)}vmax)`).join(',') + ')'
function StepCopy({ i, dark }) {
  const c = dark ? INK : HONEY
  return (
    <div className="mx-auto flex h-full max-w-[1100px] flex-col items-center justify-center px-6 text-center" style={{ color: c }}>
      <p className="mb-4 text-[13px] font-bold uppercase tracking-[.24em]">How the hive works</p>
      <AnimatePresence mode="wait">
        <motion.div key={i} initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} transition={{ duration: .45, ease: [0.16, 1, 0.3, 1] }}>
          <span className={`${H} text-[clamp(70px,14vw,200px)] font-extrabold leading-none tracking-[-.05em]`} style={{ WebkitTextStroke: `2px ${c}`, color: 'transparent' }}>{STEPS[i][0]}</span>
          <h2 className={`${H} -mt-[.2em] text-[clamp(40px,7vw,104px)] font-extrabold leading-[.92] tracking-[-.04em]`}>{STEPS[i][1]}</h2>
          <p className="mx-auto mt-5 max-w-[460px] text-[18px] font-medium opacity-80">{STEPS[i][2]}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
function HexScene() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const clip = useTransform(scrollYProgress, [0, .85], [4, 82], { clamp: true })
  const clipPath = useTransform(clip, hexPoly)
  const rot = useTransform(scrollYProgress, [0, 1], [0, 90])
  const [i, setI] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', v => setI(Math.min(2, Math.floor(v * 3.2))))
  return (
    <section ref={ref} className="relative h-[320vh]" style={{ background: INK }}>
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <motion.div style={{ rotate: rot }} className="pointer-events-none absolute left-1/2 top-1/2 h-[120vmax] w-[120vmax] -translate-x-1/2 -translate-y-1/2 opacity-60"><HexBg color="rgba(255,180,0,.12)" /></motion.div>
        <div className="absolute inset-0"><StepCopy i={i} /></div>
        <motion.div className="absolute inset-0" style={{ clipPath, background: HONEY }}><StepCopy i={i} dark /></motion.div>
        <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-2">{STEPS.map((_, k) => <span key={k} className="h-2 w-8 rounded-full transition-colors duration-300" style={{ background: k === i ? '#fff' : 'rgba(255,255,255,.25)', mixBlendMode: 'difference' }} />)}</div>
      </div>
    </section>
  )
}

/* ---------- transition 3: horizontal chapter ---------- */
function Services() {
  const ref = useRef(null), track = useRef(null)
  const [dist, setDist] = useState(0)
  useEffect(() => {
    const m = () => track.current && setDist(Math.max(0, track.current.scrollWidth - innerWidth))
    m(); addEventListener('resize', m); return () => removeEventListener('resize', m)
  }, [])
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const x = useTransform(scrollYProgress, [0, 1], [0, -dist])
  return (
    <section ref={ref} id="services" className="relative h-[300vh]" style={{ background: HONEY }}>
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden">
        <div className="mx-auto mb-8 w-full max-w-[1320px] px-5 md:px-10">
          <p className="mb-2 text-[13px] font-bold uppercase tracking-[.24em] text-[#141210]/70">What the bees do</p>
          <h2 className={`${H} text-[clamp(44px,7vw,110px)] font-extrabold leading-[.9] tracking-[-.04em] text-[#141210]`}><SplitText text="Six jobs, one hive." /></h2>
        </div>
        <motion.div ref={track} style={{ x }} className="flex w-max gap-5 px-5 md:px-10">
          {SV.map(([t, d, I], k) => (
            <a key={t} href="#book" data-svc={t} data-cursor="Book" className="group relative flex h-[min(52svh,420px)] w-[78vw] max-w-[380px] shrink-0 flex-col justify-between overflow-hidden rounded-[28px] bg-[#141210] p-7 text-[#fff8ec] md:w-[34vw]">
              <span className="absolute -right-12 -top-12 h-48 w-44 bg-[#ffb400] opacity-15 transition-transform duration-700 group-hover:rotate-[60deg] group-hover:scale-125" style={{ clipPath: HEXCLIP }} />
              <div className="flex items-start justify-between">
                <span className="grid h-16 w-14 place-items-center bg-[#ffb400] text-[#141210]" style={{ clipPath: HEXCLIP }}><I size={24} /></span>
                <span className={`${H} text-[18px] font-bold text-[#ffb400]`}>0{k + 1}</span>
              </div>
              <div>
                <h3 className={`${H} mb-3 text-[clamp(30px,3vw,40px)] font-extrabold leading-[.95] tracking-[-.03em]`}>{t}</h3>
                <p className="text-[16px] text-[#fff8ec]/70">{d}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-[14px] font-bold text-[#ffb400]">Add to booking <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></span>
              </div>
            </a>
          ))}
          <div className="flex w-[60vw] max-w-[360px] shrink-0 items-center"><p className={`${H} text-[clamp(32px,4vw,56px)] font-extrabold leading-[.95] tracking-[-.03em] text-[#141210]`}>Not sure? Tell us the car — we'll suggest the job.</p></div>
        </motion.div>
      </div>
    </section>
  )
}

/* ---------- transition 4: honey drip reveal ---------- */
function Drip({ p, x, w, max, d }) {
  const h = useTransform(p, [d, d + .55], [8, max])
  return <motion.span style={{ left: x + '%', width: w, height: h }} className="absolute top-0 rounded-b-full bg-[#ffb400]" />
}
function DripEdge() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const drips = useMemo(() => Array.from({ length: 16 }, (_, k) => ({ x: k * 6.4 + ((k * 13) % 5), w: 18 + ((k * 7) % 5) * 9, max: 70 + ((k * 53) % 9) * 26, d: ((k * 31) % 7) * .04 })), [])
  return (
    <div ref={ref} aria-hidden="true" className="relative h-[260px] overflow-hidden" style={{ background: INK }}>
      <div className="absolute inset-x-0 top-0 h-6 bg-[#ffb400]" />
      {drips.map((d, k) => <Drip key={k} p={scrollYProgress} {...d} />)}
    </div>
  )
}

/* ---------- signature: honeycomb booking grid ---------- */
const R = 46, SQ = Math.sqrt(3)
const hexPts = (cx, cy, r) => [0, 60, 120, 180, 240, 300].map(a => `${(cx + r * Math.cos(a * Math.PI / 180)).toFixed(1)},${(cy + r * Math.sin(a * Math.PI / 180)).toFixed(1)}`).join(' ')
function useDays() {
  return useMemo(() => {
    const out = [], d = new Date()
    while (out.length < 6) { d.setDate(d.getDate() + 1); out.push({ w: d.toLocaleDateString('en-GB', { weekday: 'short' }), n: d.getDate(), m: d.toLocaleDateString('en-GB', { month: 'short' }) }) }
    return out
  }, [])
}
function Cell({ cx, cy, label, taken, sel, onPick, id }) {
  return (
    <g role="button" tabIndex={taken ? -1 : 0} aria-disabled={taken} aria-pressed={sel} aria-label={label}
      onClick={() => !taken && onPick()} onKeyDown={e => { if (!taken && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onPick() } }}
      className={taken ? 'cursor-not-allowed' : 'cursor-pointer outline-none [&:focus-visible>polygon:first-of-type]:stroke-white'} data-cursor={taken ? undefined : 'Fill'}>
      <clipPath id={id}><polygon points={hexPts(cx, cy, R - 3)} /></clipPath>
      <polygon points={hexPts(cx, cy, R - 3)} fill={taken ? '#2a241c' : '#1d1a15'} stroke={sel ? HONEY : 'rgba(255,180,0,.45)'} strokeWidth={sel ? 3 : 1.5} className="transition-[stroke]" />
      {taken && <g clipPath={`url(#${id})`} opacity=".5">{[-30, -15, 0, 15, 30].map(o => <line key={o} x1={cx - 50} y1={cy + o + 50} x2={cx + 50} y2={cy + o - 50} stroke="#5a4a30" strokeWidth="3" />)}</g>}
      <g clipPath={`url(#${id})`}>
        <motion.g initial={false} animate={{ y: sel ? 0 : R * 2 + 14 }} transition={{ type: 'spring', stiffness: 70, damping: 13 }}>
          <motion.path d={`M${cx - 60} ${cy - R + 6} q15 -10 30 0 t30 0 t30 0 t30 0 V${cy + R + 20} H${cx - 60}Z`} fill={HONEY} animate={sel ? { x: [0, -30] } : {}} transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }} />
          <ellipse cx={cx - 14} cy={cy - 12} rx="9" ry="5" fill="#fff" opacity=".45" />
        </motion.g>
      </g>
      {sel && <motion.ellipse cx={cx} rx="5" ry="7" fill={HONEY} initial={{ cy: cy + R - 8, opacity: 1 }} animate={{ cy: cy + R + 26, opacity: 0, ry: 9 }} transition={{ duration: 1.1, delay: .5, ease: 'easeIn' }} />}
      <text x={cx} y={cy + 5} textAnchor="middle" fontSize="15" fontWeight="700" fill={sel ? INK : taken ? '#6b5c44' : '#fff8ec'} style={{ pointerEvents: 'none', fontFamily: 'DM Sans, sans-serif' }}>{taken ? 'taken' : label.split(' · ')[1]}</text>
    </g>
  )
}
function HoneyGrid({ slot, setSlot }) {
  const days = useDays()
  const W = 1.5 * R * 5 + 2 * R, TOP = 40, Hh = SQ * R * 5.5 + TOP + 30
  return (
    <svg viewBox={`-4 0 ${W + 8} ${Hh}`} className="w-full max-w-[520px] touch-manipulation select-none" role="group" aria-label="Demo time slots">
      {days.map((d, c) => (
        <text key={c} x={R + c * 1.5 * R} y="22" textAnchor="middle" fontSize="14" fontWeight="700" fill={HONEY} style={{ fontFamily: 'DM Sans, sans-serif', letterSpacing: '.06em' }}>{d.w.toUpperCase()} {d.n}</text>
      ))}
      {days.map((d, c) => TIMES.map((t, r) => {
        const cx = R + c * 1.5 * R, cy = TOP + SQ * R / 2 + r * SQ * R + (c % 2 ? SQ * R / 2 : 0)
        const label = `${d.w} ${d.n} ${d.m} · ${t}`
        const taken = (c * 7 + r * 3) % 5 === 0
        return <Cell key={c + '-' + r} id={`hx${c}${r}`} cx={cx} cy={cy} label={label} taken={taken} sel={slot === label} onPick={() => setSlot(slot === label ? '' : label)} />
      }))}
    </svg>
  )
}

function Book({ bk }) {
  const slot = bk.s.slot || ''
  const setSlot = v => bk.upd('slot', v)
  const f = 'h-14 w-full rounded-2xl bg-white/[.06] px-5 text-[17px] text-[#fff8ec] outline-none ring-1 ring-white/15 placeholder:text-white/35 focus:ring-2 focus:ring-[#ffb400]'
  const submit = e => { e.preventDefault(); bk.submit() }
  return (
    <section id="book" className="relative overflow-hidden px-5 pb-28 pt-6 md:px-10" style={{ background: INK }}>
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-12 max-w-[760px]">
          <p className="mb-3 text-[13px] font-bold uppercase tracking-[.24em] text-[#ffb400]">The booking hive</p>
          <h2 className={`${H} text-[clamp(44px,7vw,108px)] font-extrabold leading-[.88] tracking-[-.045em] text-[#fff8ec]`}><SplitText text="Fill a cell" className="block" /><span className="block text-[#ffb400]"><SplitText text="with honey." delay={.2} /></span></h2>
          <p className="mt-5 max-w-[520px] text-[17px] text-[#fff8ec]/65">Each cell is a time slot. Tap one and it drops straight into your request. <span className="text-[#ffb400]">Demo slots</span> — in the live site they'd come from your real diary.</p>
        </div>
        <div className="grid items-start gap-12 lg:grid-cols-[1.05fr_.95fr]">
          <div className="flex flex-col items-center lg:items-start">
            <HoneyGrid slot={slot} setSlot={setSlot} />
            <div className="mt-4 flex flex-wrap gap-5 text-[13px] font-medium text-[#fff8ec]/60">
              <span className="flex items-center gap-2"><span className="h-3 w-3 bg-[#ffb400]" style={{ clipPath: HEXCLIP }} />your pick</span>
              <span className="flex items-center gap-2"><span className="h-3 w-3 bg-[#5a4a30]" style={{ clipPath: HEXCLIP }} />taken (demo)</span>
            </div>
          </div>
          <div className="relative rounded-[32px] bg-white/[.04] p-6 ring-1 ring-white/10 md:p-9 lg:sticky lg:top-24">
            <AnimatePresence mode="wait">
              {!bk.s.sent ? (
                <motion.form key="f" exit={{ opacity: 0, y: -20 }} onSubmit={submit} noValidate className="grid gap-4">
                  <div className="flex min-h-[72px] items-center gap-4 rounded-2xl bg-[#ffb400]/10 p-4 ring-1 ring-[#ffb400]/30">
                    <HexMark size={30} fill={slot ? HONEY : 'transparent'} stroke={HONEY} />
                    <div>
                      <p className="text-[12px] font-bold uppercase tracking-[.16em] text-[#ffb400]/80">Your slot</p>
                      <AnimatePresence mode="wait"><motion.p key={slot} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="text-[18px] font-bold text-[#fff8ec]">{slot || 'Tap a cell in the hive'}</motion.p></AnimatePresence>
                    </div>
                  </div>
                  <input className={f} placeholder="Your name" value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} autoComplete="name" />
                  <motion.input animate={bk.s.err ? { x: [0, -8, 8, -6, 6, 0] } : {}} className={f + (bk.s.err ? ' ring-2 !ring-red-400' : '')} type="tel" inputMode="tel" placeholder="+44 7___ ______" value={bk.s.phone} onFocus={phoneFocus(bk, '+44 ')} onChange={e => bk.upd('phone', e.target.value)} autoComplete="tel" />
                  <div className="flex flex-wrap gap-2">{SV.map(s => s[0]).map(t => <button type="button" key={t} onClick={() => bk.upd('svc', t)} className={`rounded-full px-4 py-2 text-[13px] font-bold transition-colors ${bk.s.svc === t ? 'bg-[#ffb400] text-[#141210]' : 'bg-white/[.07] text-[#fff8ec]/75 hover:bg-white/15'}`}>{t}</button>)}</div>
                  <button disabled={bk.s.loading} className="mt-2 h-16 rounded-2xl bg-[#ffb400] text-[17px] font-bold text-[#141210] transition-[scale,opacity] active:scale-[.97] disabled:opacity-60">{bk.s.loading ? 'Buzzing…' : 'Send to the hive'}</button>
                  <p className="text-[13px] text-[#fff8ec]/45">In the finished site this request goes straight to your phone/Telegram.</p>
                </motion.form>
              ) : (
                <motion.div key="ok" initial={{ opacity: 0, scale: .9 }} animate={{ opacity: 1, scale: 1 }} className="grid min-h-[380px] place-items-center text-center text-[#fff8ec]">
                  <div><CheckDraw className="mx-auto mb-5 text-[#ffb400]" /><h3 className={`${H} text-[40px] font-extrabold leading-none`}>Request buzzed through!</h3><p className="mx-auto mb-5 mt-3 max-w-[340px] text-[#fff8ec]/65">{slot ? `Slot: ${slot}. ` : ''}In the finished site this request goes straight to your phone/Telegram.</p><button onClick={bk.reset} className="font-bold text-[#ffb400] underline underline-offset-4">Book another</button></div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}

function Proof() {
  return (
    <section className="relative overflow-hidden px-5 py-28 md:px-10" style={{ background: CREAM }}>
      <HexBg />
      <div className="relative mx-auto max-w-[1320px]">
        <ScrollWords className={`${H} max-w-[1100px] text-[clamp(32px,4.6vw,68px)] font-bold leading-[1.04] tracking-[-.03em] text-[#141210]`} text="The worker bee is Manchester's own symbol of getting the job done. That's the whole idea: we turn up, we graft, you get a clean car without leaving the house." />
        <div className="mt-20 grid gap-5 md:grid-cols-[1.2fr_1fr]">
          <Reveal className="relative overflow-hidden rounded-[32px] bg-[#141210] p-9 text-[#fff8ec] md:p-12">
            <div className="flex items-end gap-4"><span className={`${H} text-[clamp(96px,12vw,170px)] font-extrabold leading-[.8] tracking-[-.05em] text-[#ffb400]`}>{b.rating}</span><div className="mb-3 flex gap-1">{[0, 1, 2, 3, 4].map(k => <motion.span key={k} initial={{ scale: 0, rotate: -90 }} whileInView={{ scale: 1, rotate: 0 }} viewport={{ once: true }} transition={{ delay: .3 + k * .1, type: 'spring' }}><HexMark size={22} fill={HONEY} stroke={HONEY} /></motion.span>)}</div></div>
            <p className="mt-6 text-[18px] text-[#fff8ec]/70">Average Google rating</p>
          </Reveal>
          <Reveal delay={.1} className="rounded-[32px] bg-[#ffb400] p-9 md:p-12">
            <span className={`${H} block text-[clamp(96px,12vw,170px)] font-extrabold leading-[.8] tracking-[-.05em] text-[#141210]`}><Counter to={b.rev} /></span>
            <p className="mt-6 text-[18px] font-medium text-[#141210]/75">reviews from Manchester drivers on Google</p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

function Contact() {
  return (
    <section id="contact" className="px-5 pb-28 md:px-10" style={{ background: CREAM }}>
      <div className="mx-auto grid max-w-[1320px] gap-6 md:grid-cols-[.9fr_1.1fr]">
        <Reveal className="grid content-start gap-6">
          <h2 className={`${H} text-[clamp(48px,7vw,104px)] font-extrabold leading-[.88] tracking-[-.045em]`}>Find the hive</h2>
          <p className="flex items-start gap-3 text-[20px] font-medium"><MapPin className="mt-1 shrink-0 text-[#e08a00]" />{b.addr}</p>
          <p className="text-[16px] text-[#4a4136]">Base address — we're mobile, so we come to you across Manchester.</p>
          <a href={'tel:' + tel(b.phone)} className={`${H} text-[clamp(32px,4vw,48px)] font-extrabold tracking-[-.02em]`}>{b.phone}</a>
          <div className="flex flex-wrap gap-3">
            <Magnetic><a href={waLink(b.phone)} target="_blank" rel="noopener" className="inline-flex h-14 items-center gap-2 rounded-full bg-[#141210] px-7 font-bold text-[#ffb400]"><WA /> WhatsApp us</a></Magnetic>
            <a href={'tel:' + tel(b.phone)} className="inline-flex h-14 items-center gap-2 rounded-full bg-[#ffb400] px-7 font-bold text-[#141210]"><Phone size={18} /> Call</a>
          </div>
        </Reveal>
        <Reveal delay={.1} className="h-[420px] overflow-hidden rounded-[32px] ring-4 ring-[#141210]" style={{ clipPath: 'polygon(6% 0, 94% 0, 100% 50%, 94% 100%, 6% 100%, 0 50%)' }}><GMap q={`${b.name}, ${b.addr}`} /></Reveal>
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
      <div className="font-['DM_Sans',sans-serif]" style={{ background: CREAM, color: INK, '--sel': HONEY, '--selc': INK }}>
        <Intro bg={HONEY} fg={INK} duration={1.5}>
          <div className="flex flex-col items-center gap-4">
            <svg viewBox="0 0 40 46" width="90" height="104"><motion.polygon points="20,2 38,12 38,34 20,44 2,34 2,12" fill="none" stroke={INK} strokeWidth="3" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: .9 }} /></svg>
            <span className={`${H} text-[28px] font-extrabold tracking-[-.02em]`}>buzzing over…</span>
          </div>
        </Intro>
        <Progress color={HONEY} />
        <Cursor color={HONEY} blend="normal" textColor={INK} />
        <Ribbon lang="en" name={b.name} bg={INK} fg={HONEY} />
        <header className="sticky top-0 z-40 bg-[#fff8ec]/75 backdrop-blur-xl">
          <div className="mx-auto flex h-[66px] max-w-[1320px] items-center justify-between px-5 md:px-10">
            <a href="#top" className="flex items-center gap-2.5"><HexMark size={26} /><span className={`${H} text-[19px] font-extrabold leading-none tracking-[-.02em]`}>Home Car<br className="sm:hidden" /> Valeting</span></a>
            <nav className="hidden gap-8 text-[15px] font-bold text-[#4a4136] md:flex">{[['#services', 'Services'], ['#book', 'Book'], ['#contact', 'Contact']].map(([h, t]) => <a key={h} href={h} className="hover:text-[#141210]">{t}</a>)}</nav>
            <a href={'tel:' + tel(b.phone)} className="hidden h-11 items-center gap-2 rounded-full bg-[#141210] px-5 text-[14px] font-bold text-[#ffb400] sm:inline-flex"><Phone size={15} />{b.phone}</a>
          </div>
        </header>
        <main id="top">
          <Hero lite={lite} />
          <div className="bg-[#ffb400] py-5">
            <Marquee base={-2.2}>{['exterior', 'interior', 'full valet', 'wheels', 'pet hair', 'upholstery'].map(t => <span key={t} className={`${H} mx-6 inline-flex items-center gap-12 text-[clamp(36px,4.5vw,64px)] font-extrabold tracking-[-.03em] text-[#141210]`}>{t}<HexMark size={30} fill={INK} stroke={INK} /></span>)}</Marquee>
          </div>
          <HexWipe from={CREAM} to={INK} />
          <HexScene />
          <Services />
          <DripEdge />
          <Book bk={bk} />
          <HexWipe from={INK} to={CREAM} />
          <Proof />
          <Contact />
        </main>
        <footer className="px-5 py-10 text-[14px] font-medium text-[#fff8ec]/60 md:px-10" style={{ background: INK }}><div className="mx-auto flex max-w-[1320px] flex-wrap justify-between gap-4"><span>© 2026 {b.name} · Website concept by Artem</span><a href={'tel:' + tel(b.phone)} className="text-[#ffb400]">{b.phone}</a></div></footer>
        <CallBar lang="en" phone={b.phone} barCls="bg-[#fff8ec]/85 backdrop-blur-xl" callCls="rounded-2xl bg-white text-[#141210] ring-1 ring-[#141210]/15" bookCls="rounded-2xl bg-[#141210] text-[#ffb400]" />
        <div className="h-[72px] sm:hidden" style={{ background: INK }} />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
