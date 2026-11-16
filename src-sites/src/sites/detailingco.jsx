import React, { useRef, useState, useEffect, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, useMotionValueEvent, useSpring, AnimatePresence, MotionConfig } from 'framer-motion'
import { ArrowRight, ArrowUpRight, Phone, MapPin, Star, Droplets, Armchair, Sparkles, ShieldCheck, Disc3, Car, Navigation } from 'lucide-react'
import '../lib/base.css'
import { useSmooth, Ribbon, SplitText, Reveal, Magnetic, Cursor, Marquee, Counter, useBooking, phoneFocus, CheckDraw, CallBar, Progress, Intro, tel, useLite, GMap, WA, waLink, LineReveal } from '../lib/kit'

const Road3D = lazy(() => import('./detailingco3d'))
const b = {
  name: 'Detailing&Co',
  full: 'Detailing&Co – Premium Mobile Valeting',
  addr: "St James' Ct, Harehills, Leeds LS8 5RA",
  phone: '+44 7859 143007',
  rating: '5.0', rev: 80,
}
const GREEN = '#0f3b2e', CREAM = '#f3ecdc', OR = '#ff6a1a', INK = '#0b2a21'
const H = "font-['Bricolage_Grotesque',sans-serif]"
const M = "font-['DM_Mono',monospace]"

const CH = [
  ['01', 'your driveway', 'Premium mobile valeting at your home or workplace. You carry on with your day — we bring the shine to the kerb.'],
  ['02', 'your car park', 'No queues, no waiting rooms, no lifts across town. Hand over the keys and put the kettle on.'],
  ['03', 'your street', 'Based in Harehills, valeting across Leeds & surrounding areas — just confirm your area when booking.'],
]
const SV = [
  ['Maintenance valet', 'Exterior hand wash, wheels, glass, interior hoover and wipe-down. The regular reset.', Droplets],
  ['Full valet', 'Inside and out, top to bottom — the treatment for when the car needs a proper going-over.', Car],
  ['Interior deep clean', 'Seats, carpets, mats, dashboard, vents and door cards — fresh, not just tidy.', Armchair],
  ['Paint enhancement', 'Machine polish to lift light swirls and bring the depth back into tired paintwork.', Sparkles],
  ['Wheels & tyres', 'Brake dust, grime and arches cleaned out, finished with a tyre dressing.', Disc3],
  ['Wax & sealant', 'A protective layer so the rain beads off and the shine lasts between visits.', ShieldCheck],
]
const STEPS = [
  ['Pick a slot', 'Call, WhatsApp or send the form. Tell us the car and what it needs.'],
  ['Tell us where', 'Home, office, gym car park — wherever the car will be sitting.'],
  ['We pull up', 'The van arrives with the kit and gets to work while you get on.'],
  ['Keys back', 'Walk round it together. Then enjoy the drive.'],
]
/* stylised Leeds postcode districts (illustrative positions, not to scale) */
const LS = {
  1: [300, 250, 'City Centre'], 2: [302, 230, 'City Centre'], 3: [280, 242, 'Burley'], 4: [262, 226, 'Kirkstall'], 5: [246, 205, 'Hawksworth'],
  6: [276, 200, 'Headingley'], 7: [318, 196, 'Chapeltown'], 8: [350, 192, 'Harehills · Roundhay'], 9: [342, 262, 'Richmond Hill'], 10: [316, 302, 'Hunslet'],
  11: [284, 292, 'Beeston'], 12: [248, 266, 'Armley'], 13: [214, 244, 'Bramley'], 14: [398, 214, 'Seacroft'], 15: [400, 256, 'Cross Gates'],
  16: [244, 160, 'Adel'], 17: [322, 140, 'Alwoodley'], 18: [214, 176, 'Horsforth'], 19: [188, 150, 'Yeadon'], 20: [176, 114, 'Guiseley'],
  21: [184, 70, 'Otley'], 22: [432, 92, 'Wetherby'], 23: [472, 140, 'Boston Spa'], 24: [504, 186, 'Tadcaster'], 25: [444, 292, 'Garforth'],
  26: [362, 334, 'Rothwell'], 27: [258, 342, 'Morley'], 28: [184, 252, 'Pudsey'], 29: [124, 48, 'Ilkley'],
}
const BASE = LS[8]

/* ---------- road-line wipe: section is unveiled behind a running road line ---------- */
function RoadWipe({ children, className = '', style, id, line = OR }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 25%'] })
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 24 })
  const clip = useTransform(p, v => `inset(0 ${Math.max(0, (1 - v * 1.15)) * 100}% 0 0)`)
  const w = useTransform(p, v => `${Math.min(100, v * 115)}%`)
  return (
    <section ref={ref} id={id} className="relative">
      <motion.div aria-hidden="true" style={{ width: w }} className="absolute left-0 top-0 z-10 h-[6px]"><div className="h-full w-full" style={{ backgroundImage: `repeating-linear-gradient(90deg, ${line} 0 38px, transparent 38px 62px)` }} /></motion.div>
      <motion.div style={{ clipPath: clip, ...style }} className={className}>{children}</motion.div>
    </section>
  )
}

/* ---------- map-fold: printed paper panels fold away to reveal what's underneath ---------- */
function MapFold({ panels = 4, color = CREAM }) {
  const [done, setDone] = useState(false)
  return (
    <div aria-hidden="true" className={`absolute inset-0 z-20 flex ${done ? 'pointer-events-none' : ''}`} style={{ perspective: 1400 }}>
      {Array.from({ length: panels }).map((_, k) => (
        <motion.div key={k} className="relative h-full flex-1"
          style={{ transformOrigin: k % 2 ? 'left center' : 'right center', background: color, backgroundImage: `linear-gradient(rgba(15,59,46,.12) 1px,transparent 1px),linear-gradient(90deg,rgba(15,59,46,.12) 1px,transparent 1px)`, backgroundSize: '28px 28px', boxShadow: k % 2 ? 'inset 18px 0 30px -20px rgba(0,0,0,.35)' : 'inset -18px 0 30px -20px rgba(0,0,0,.35)' }}
          initial={{ rotateY: 0, opacity: 1 }} whileInView={{ rotateY: k % 2 ? 96 : -96, opacity: 0 }} viewport={{ once: true, amount: 0.45 }}
          transition={{ duration: 1.1, delay: 0.15 + k * 0.12, ease: [0.76, 0, 0.24, 1], opacity: { delay: 0.75 + k * 0.12, duration: 0.4 } }}
          onAnimationComplete={() => k === panels - 1 && setDone(true)}>
          {k === 0 && <span className={`${M} absolute left-4 top-4 text-[11px] uppercase tracking-[.2em] text-[#0f3b2e]/60`}>Leeds · folded map</span>}
        </motion.div>
      ))}
    </div>
  )
}

function VanIcon({ s = 1, fill = OR }) {
  return (
    <g transform={`scale(${s})`}>
      <rect x="-16" y="-9" width="22" height="14" rx="2.5" fill={CREAM} stroke={GREEN} strokeWidth="1.6" />
      <path d="M6 -5h5.5l4.5 5v5H6z" fill={CREAM} stroke={GREEN} strokeWidth="1.6" strokeLinejoin="round" />
      <rect x="-16" y="-1" width="32" height="2.4" fill={fill} />
      <circle cx="-9" cy="6" r="3" fill={GREEN} /><circle cx="9" cy="6" r="3" fill={GREEN} />
    </g>
  )
}

function LiteRoad({ progress }) {
  const x = useTransform(progress, [0, 1], ['4%', '86%'])
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: `linear-gradient(180deg, ${CREAM} 0 55%, #3b7d50 55% 100%)` }}>
      <div className="absolute inset-x-0 top-[62%] h-16 bg-[#2c3430]"><div className="absolute inset-x-0 top-1/2 h-[4px] -translate-y-1/2" style={{ backgroundImage: `repeating-linear-gradient(90deg, ${CREAM} 0 30px, transparent 30px 54px)` }} /></div>
      <motion.svg style={{ left: x }} className="absolute top-[56%] w-28" viewBox="-20 -14 40 24"><VanIcon /></motion.svg>
    </div>
  )
}

function Hero({ lite }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const [i, setI] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', v => setI(Math.min(2, Math.floor(v * 3))))
  const bar = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])
  return (
    <section ref={ref} className="relative h-[300vh]" style={{ background: CREAM }}>
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="absolute inset-0">{lite ? <LiteRoad progress={scrollYProgress} /> : <Suspense fallback={<LiteRoad progress={scrollYProgress} />}><Road3D progress={scrollYProgress} /></Suspense>}</div>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#f3ecdc] via-[#f3ecdc]/70 to-transparent md:bg-gradient-to-r md:via-[#f3ecdc]/55" style={{ maskImage: 'linear-gradient(180deg,#000 0 58%,transparent 80%)' }} />
        <div className="relative z-10 mx-auto flex h-full max-w-[1360px] flex-col px-5 pt-8 md:justify-center md:px-10 md:pt-0">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5 }} className={`${M} mb-4 inline-flex items-center gap-2 self-start rounded-full bg-[#0f3b2e] px-4 py-2 text-[11px] uppercase tracking-[.18em] text-[#f3ecdc] md:text-[12px]`}><span className="h-2 w-2 animate-pulse rounded-full bg-[#ff6a1a]" />Premium mobile valeting · Leeds</motion.p>
          <h1 className={`${H} text-[clamp(52px,10vw,168px)] font-extrabold leading-[.86] tracking-[-.045em]`} style={{ color: GREEN }}>
            <SplitText text="We come" delay={1.35} className="block" rotate={6} />
            <SplitText text="to you." delay={1.6} rotate={6} className="block text-[#ff6a1a]" />
          </h1>
          <div className="mt-4 h-[46px] overflow-hidden md:mt-6 md:h-[54px]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={i} initial={{ y: '110%' }} animate={{ y: '0%' }} exit={{ y: '-110%' }} transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }} className={`${H} inline-flex h-[46px] items-center gap-3 rounded-xl border-2 border-[#f3ecdc] bg-[#0f3b2e] px-4 text-[20px] font-bold text-[#f3ecdc] shadow-[0_0_0_2px_#0f3b2e] md:h-[54px] md:text-[24px]`}><ArrowUpRight size={22} className="text-[#ff6a1a]" />{CH[i][1]}</motion.span>
            </AnimatePresence>
          </div>
          <div className="mt-4 flex max-w-[460px] items-start gap-4 md:mt-6">
            <span className={`${M} pt-1 text-[12px] text-[#0f3b2e]/50`}>{CH[i][0]}/03</span>
            <AnimatePresence mode="wait"><motion.p key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="text-[15px] font-medium leading-relaxed text-[#0f3b2e]/80 md:text-[17px]">{CH[i][2]}</motion.p></AnimatePresence>
          </div>
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2 }} className="mt-6 flex flex-wrap gap-3 md:mt-10">
            <Magnetic><a href="#book" data-cursor="Book" className={`${H} inline-flex h-14 items-center gap-3 rounded-full bg-[#ff6a1a] px-7 text-[16px] font-bold text-white shadow-[0_18px_40px_-14px_rgba(255,106,26,.9)] md:h-16 md:px-9`}>Book a slot <ArrowRight size={19} /></a></Magnetic>
            <a href="#postcode" className={`${H} hidden h-16 items-center gap-2 rounded-full border-2 border-[#0f3b2e] px-7 text-[16px] font-bold text-[#0f3b2e] sm:inline-flex`}><Navigation size={17} />Check your postcode</a>
          </motion.div>
        </div>
        {/* route HUD */}
        <div className="absolute bottom-5 left-5 right-5 z-10 md:bottom-8 md:left-auto md:right-10 md:w-[360px]">
          <div className={`${M} mb-2 flex justify-between text-[11px] uppercase tracking-[.16em] text-[#0f3b2e]/70`}><span>Harehills</span><span>your door</span></div>
          <div className="relative h-3 rounded-full bg-[#0f3b2e]">
            <div className="absolute inset-x-2 top-1/2 h-[2px] -translate-y-1/2" style={{ backgroundImage: `repeating-linear-gradient(90deg, ${CREAM} 0 10px, transparent 10px 18px)` }} />
            <motion.div style={{ width: bar }} className="absolute left-0 top-0 h-full rounded-full bg-[#ff6a1a]/80" />
          </div>
        </div>
      </div>
    </section>
  )
}

function Services() {
  return (
    <RoadWipe id="services" className="px-5 py-24 md:px-10 md:py-32" style={{ background: CREAM }}>
      <div className="mx-auto max-w-[1360px]">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <h2 className={`${H} text-[clamp(44px,7vw,116px)] font-extrabold leading-[.88] tracking-[-.045em] text-[#0f3b2e]`}><SplitText text="Pick your" className="block" /><SplitText text="route." delay={0.2} className="block text-[#ff6a1a]" /></h2>
          <p className="max-w-[340px] text-[16px] text-[#0f3b2e]/70">Six ways to bring the car back to its best. Tap a sign to pre-fill your booking — we'll confirm the details with you.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SV.map(([t, d, I], k) => (
            <Reveal key={t} delay={k * 0.06}>
              <motion.a href="#book" data-svc={t} data-cursor="Book" whileHover={{ y: -6, rotate: k % 2 ? 0.8 : -0.8 }} transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                className="group relative flex h-full flex-col rounded-[22px] bg-[#0f3b2e] p-2 text-[#f3ecdc] shadow-[0_24px_50px_-28px_rgba(15,59,46,.8)]">
                <div className="flex h-full flex-col rounded-[16px] border-2 border-[#f3ecdc]/90 p-6">
                  <div className="mb-10 flex items-center justify-between">
                    <span className="grid h-12 w-12 place-items-center rounded-full bg-[#f3ecdc] text-[#0f3b2e]"><I size={22} /></span>
                    <span className={`${M} text-[12px] text-[#f3ecdc]/50`}>A{k + 61}</span>
                  </div>
                  <h3 className={`${H} mb-2 text-[28px] font-bold leading-tight tracking-[-.02em]`}>{t}</h3>
                  <p className="mb-6 text-[15px] text-[#f3ecdc]/70">{d}</p>
                  <span className="mt-auto inline-flex items-center gap-2 text-[14px] font-bold text-[#ff6a1a]">Book this <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></span>
                </div>
              </motion.a>
            </Reveal>
          ))}
        </div>
      </div>
    </RoadWipe>
  )
}

/* horizontal road chapter */
function Journey() {
  const ref = useRef(null), track = useRef(null)
  const [dist, setDist] = useState(0)
  useEffect(() => {
    const f = () => track.current && setDist(track.current.scrollWidth - innerWidth)
    f(); addEventListener('resize', f); return () => removeEventListener('resize', f)
  }, [])
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const x = useTransform(scrollYProgress, v => -v * dist)
  const vanX = useTransform(scrollYProgress, [0, 1], ['2%', '92%'])
  return (
    <section ref={ref} className="relative h-[280vh]" style={{ background: GREEN }}>
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden text-[#f3ecdc]">
        <p className={`${M} mb-6 px-5 text-[12px] uppercase tracking-[.2em] text-[#ff6a1a] md:px-10`}>How it works · scroll the road</p>
        <motion.div ref={track} style={{ x }} className="flex w-max gap-5 px-5 md:gap-8 md:px-10">
          <div className="flex w-[78vw] shrink-0 flex-col justify-end md:w-[38vw]">
            <h2 className={`${H} text-[clamp(48px,7vw,120px)] font-extrabold leading-[.86] tracking-[-.045em]`}>Four stops.<br /><span className="text-[#ff6a1a]">Zero queues.</span></h2>
          </div>
          {STEPS.map(([t, d], k) => (
            <div key={t} className="relative flex h-[46vh] w-[78vw] shrink-0 flex-col justify-between rounded-[28px] bg-[#f3ecdc] p-7 text-[#0f3b2e] md:h-[52vh] md:w-[34vw] md:p-10">
              <span className={`${H} text-[clamp(80px,10vw,150px)] font-extrabold leading-none tracking-[-.06em] text-[#ff6a1a]`}>0{k + 1}</span>
              <div><h3 className={`${H} mb-3 text-[clamp(30px,3vw,46px)] font-bold leading-none tracking-[-.03em]`}>{t}</h3><p className="max-w-[360px] text-[16px] text-[#0f3b2e]/70">{d}</p></div>
            </div>
          ))}
          <div className="w-[10vw] shrink-0" />
        </motion.div>
        <div className="relative mx-5 mt-10 h-14 rounded-xl bg-[#1d2421] md:mx-10">
          <div className="absolute inset-x-4 top-1/2 h-[3px] -translate-y-1/2" style={{ backgroundImage: `repeating-linear-gradient(90deg, ${CREAM} 0 26px, transparent 26px 46px)` }} />
          <motion.svg style={{ left: vanX }} className="absolute top-1/2 w-16 -translate-y-1/2" viewBox="-20 -14 40 24"><VanIcon /></motion.svg>
        </div>
      </div>
    </section>
  )
}

/* signature toy: postcode checker */
const quadPts = (a, c, z, n = 26) => Array.from({ length: n }, (_, k) => { const t = k / (n - 1), u = 1 - t; return [u * u * a[0] + 2 * u * t * c[0] + t * t * z[0], u * u * a[1] + 2 * u * t * c[1] + t * t * z[1]] })
function Checker({ onPostcode }) {
  const [val, setVal] = useState('')
  const [pos, setPos] = useState([BASE[0], BASE[1]])
  const [trip, setTrip] = useState(null)
  const [msg, setMsg] = useState(null)
  const go = e => {
    e?.preventDefault()
    const v = val.trim().toUpperCase()
    const m = v.match(/^LS\s?(\d{1,2})(\s?\d[A-Z]{2})?$/) || v.match(/^LS\s?(\d{1,2})/)
    if (m && LS[+m[1]]) {
      const d = LS[+m[1]], a = pos, z = [d[0], d[1]]
      const dx = z[0] - a[0], dy = z[1] - a[1], L = Math.hypot(dx, dy) || 1
      const c = [(a[0] + z[0]) / 2 - dy / L * L * 0.3, (a[1] + z[1]) / 2 + dx / L * L * 0.3]
      const pts = quadPts(a, c, z)
      const ang = pts.map((p, k) => { const q = pts[Math.min(k + 1, pts.length - 1)], r = pts[Math.max(k - 1, 0)]; return Math.atan2(q[1] - r[1], q[0] - r[0]) * 180 / Math.PI })
      const flip = ang.map(x => (Math.abs(x) > 90 ? -1 : 1))
      setTrip({ id: Date.now(), d: `M${a[0]} ${a[1]} Q${c[0]} ${c[1]} ${z[0]} ${z[1]}`, pts, ang: ang.map((x, k) => flip[k] < 0 ? x + 180 : x), flip, dur: Math.max(1.1, L / 120), district: 'LS' + +m[1], area: d[2] })
      setPos(z); setMsg({ ok: true, code: v.replace(/^LS\s?/, 'LS'), area: d[2] }); onPostcode?.(v)
    } else if (/^[A-Z]{1,2}\d/.test(v)) {
      setMsg({ ok: false, t: "That's outside the LS area — drop us a message and we'll let you know if we can reach you." })
    } else setMsg({ ok: false, t: 'Try a Leeds postcode, e.g. LS8 or LS6 3AB.' })
  }
  return (
    <section id="postcode" className="relative overflow-hidden px-5 py-24 md:px-10 md:py-32" style={{ background: GREEN }}>
      <div className="mx-auto grid max-w-[1360px] items-center gap-12 lg:grid-cols-[.85fr_1.15fr]">
        <div className="text-[#f3ecdc]">
          <p className={`${M} mb-5 text-[12px] uppercase tracking-[.2em] text-[#ff6a1a]`}>Postcode checker</p>
          <h2 className={`${H} mb-6 text-[clamp(44px,6vw,96px)] font-extrabold leading-[.88] tracking-[-.045em]`}><LineReveal>Where's the</LineReveal><LineReveal delay={0.1} className="text-[#ff6a1a]">car parked?</LineReveal></h2>
          <p className="mb-8 max-w-[420px] text-[16px] text-[#f3ecdc]/70">Type your postcode and watch the van set off from Harehills. We cover Leeds & surrounding areas — we'll confirm your exact location when you book.</p>
          <form onSubmit={go} className="flex max-w-[460px] gap-2 rounded-full bg-[#f3ecdc] p-2">
            <input value={val} onChange={e => setVal(e.target.value)} aria-label="Your postcode" placeholder="e.g. LS8" maxLength={8} autoCapitalize="characters"
              className={`${M} min-w-0 flex-1 bg-transparent px-4 text-[20px] uppercase text-[#0f3b2e] outline-none placeholder:text-[#0f3b2e]/35`} />
            <button className={`${H} h-12 shrink-0 rounded-full bg-[#ff6a1a] px-6 text-[15px] font-bold text-white md:h-14`}>Send the van</button>
          </form>
          <div className="mt-3 flex flex-wrap gap-2">{['LS1', 'LS6', 'LS14', 'LS17', 'LS28'].map(p => <button key={p} type="button" onClick={() => setVal(p)} className={`${M} rounded-full border border-[#f3ecdc]/25 px-3 py-1 text-[12px] text-[#f3ecdc]/70 hover:border-[#ff6a1a] hover:text-[#ff6a1a]`}>{p}</button>)}</div>
          <div className="mt-8 min-h-[120px]">
            <AnimatePresence mode="wait">
              {msg && <motion.div key={JSON.stringify(msg)} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0, transition: { delay: msg.ok ? trip?.dur * 0.8 || 0 : 0 } }} exit={{ opacity: 0 }} className="rounded-2xl border border-[#f3ecdc]/15 bg-[#f3ecdc]/[.06] p-5">
                {msg.ok ? <>
                  <p className={`${H} mb-1 text-[26px] font-bold leading-tight`}>We'll come to you — book a slot.</p>
                  <p className="mb-4 text-[14px] text-[#f3ecdc]/60">{msg.code} · {msg.area}. Leeds & surrounding areas — confirm when booking.</p>
                  <a href="#book" className="inline-flex items-center gap-2 font-bold text-[#ff6a1a]">Book for {msg.code} <ArrowRight size={16} /></a>
                </> : <p className="text-[16px] text-[#f3ecdc]/80">{msg.t}</p>}
              </motion.div>}
            </AnimatePresence>
          </div>
        </div>
        <div className="relative aspect-[600/420] overflow-hidden rounded-[28px] shadow-[0_40px_80px_-30px_rgba(0,0,0,.6)]" style={{ background: CREAM }}>
          <MapFold />
          <svg viewBox="40 10 520 380" className="h-full w-full">
            <defs><pattern id="dg" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="#0f3b2e" strokeOpacity=".07" /></pattern></defs>
            <rect x="0" y="0" width="600" height="420" fill="url(#dg)" />
            <path d="M40 300 C140 270 200 250 260 262 S340 270 380 300 S480 330 560 320" fill="none" stroke="#9cc3b4" strokeWidth="9" strokeLinecap="round" />
            <path d="M120 30 C150 60 160 70 200 70 S300 60 360 80" fill="none" stroke="#9cc3b4" strokeWidth="5" strokeLinecap="round" opacity=".7" />
            <ellipse cx="300" cy="238" rx="78" ry="56" fill="none" stroke="#0f3b2e" strokeOpacity=".22" strokeWidth="3" strokeDasharray="8 7" />
            {[['M300 238 L180 120', 0], ['M300 238 L460 110', 1], ['M300 238 L470 300', 2], ['M300 238 L250 360', 3], ['M300 238 L120 260', 4]].map(([d, k]) => <path key={k} d={d} stroke="#0f3b2e" strokeOpacity=".12" strokeWidth="5" strokeLinecap="round" />)}
            {Object.entries(LS).map(([n, [x, y]]) => {
              const on = trip?.district === 'LS' + n
              return <g key={n}><circle cx={x} cy={y} r={on ? 6 : 3.5} fill={on ? OR : GREEN} opacity={on ? 1 : 0.55} /><text x={x + 7} y={y + 4} className={M} fontSize="11" fill={GREEN} opacity={on ? 1 : 0.5} fontWeight={on ? 700 : 400}>LS{n}</text></g>
            })}
            <g><circle cx={BASE[0]} cy={BASE[1]} r="12" fill={GREEN} opacity=".12" /><text x={BASE[0] - 20} y={BASE[1] - 16} fontSize="10" fill={GREEN} className={M} fontWeight="700">BASE</text></g>
            {trip && <motion.path key={'r' + trip.id} d={trip.d} fill="none" stroke={OR} strokeWidth="3.5" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: trip.dur, ease: 'easeInOut' }} />}
            {trip && <motion.g key={'p' + trip.id} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: trip.dur, type: 'spring', bounce: 0.6 }} style={{ transformOrigin: `${trip.pts.at(-1)[0]}px ${trip.pts.at(-1)[1]}px` }}>
              <circle cx={trip.pts.at(-1)[0]} cy={trip.pts.at(-1)[1]} r="16" fill={OR} opacity=".18" />
              <path transform={`translate(${trip.pts.at(-1)[0]} ${trip.pts.at(-1)[1] - 6})`} d="M0 6 C-10 -6 -10 -22 0 -22 S10 -6 0 6Z" fill={OR} stroke={CREAM} strokeWidth="2" />
            </motion.g>}
            <motion.g initial={false} animate={trip ? { x: trip.pts.map(p => p[0]), y: trip.pts.map(p => p[1]) } : { x: BASE[0], y: BASE[1] }} transition={{ duration: trip?.dur || 0, ease: 'easeInOut' }}>
              <motion.g initial={false} animate={trip ? { rotate: trip.ang, scaleX: trip.flip } : { rotate: 0 }} transition={{ duration: trip?.dur || 0, ease: 'easeInOut' }}><VanIcon s={1.15} /></motion.g>
            </motion.g>
          </svg>
          <span className={`${M} absolute bottom-3 left-4 text-[10px] uppercase tracking-[.16em] text-[#0f3b2e]/50`}>Illustrative map · not to scale</span>
        </div>
      </div>
    </section>
  )
}

function Rating() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const bg = useTransform(scrollYProgress, [0.1, 0.4], [GREEN, CREAM])
  const sc = useTransform(scrollYProgress, [0.1, 0.5], [0.8, 1])
  return (
    <motion.section ref={ref} style={{ background: bg }} className="px-5 py-24 md:px-10 md:py-32">
      <motion.div style={{ scale: sc }} className="mx-auto grid max-w-[1360px] gap-5 md:grid-cols-[1.3fr_1fr]">
        <div className="rounded-[28px] bg-[#0f3b2e] p-8 text-[#f3ecdc] md:p-12">
          <div className="mb-6 flex gap-1 text-[#ff6a1a]">{Array.from({ length: 5 }).map((_, k) => <motion.span key={k} initial={{ scale: 0, rotate: -40 }} whileInView={{ scale: 1, rotate: 0 }} viewport={{ once: true }} transition={{ delay: k * 0.1, type: 'spring', bounce: 0.6 }}><Star fill="currentColor" size={30} /></motion.span>)}</div>
          <p className={`${H} text-[clamp(96px,16vw,230px)] font-extrabold leading-[.8] tracking-[-.06em]`}>{b.rating}</p>
          <p className="mt-4 text-[17px] text-[#f3ecdc]/70">Google rating from our customers across Leeds.</p>
        </div>
        <div className="flex flex-col justify-between rounded-[28px] bg-[#ff6a1a] p-8 text-white md:p-12">
          <p className={`${M} text-[12px] uppercase tracking-[.2em]`}>Google reviews</p>
          <p className={`${H} text-[clamp(96px,14vw,200px)] font-extrabold leading-[.8] tracking-[-.06em]`}><Counter to={b.rev} /></p>
          <p className="text-[17px] text-white/85">real reviews and counting. Read them on Google Maps, then add yours after your valet.</p>
        </div>
      </motion.div>
    </motion.section>
  )
}

function Book({ postcode }) {
  const bk = useBooking()
  const [pc, setPc] = useState('')
  useEffect(() => { if (postcode) setPc(postcode) }, [postcode])
  const f = `h-14 w-full rounded-2xl bg-white px-5 text-[17px] text-[#0f3b2e] outline-none ring-1 ring-[#0f3b2e]/15 placeholder:text-[#0f3b2e]/40 focus:ring-2 focus:ring-[#ff6a1a]`
  return (
    <RoadWipe id="book" line={GREEN} className="px-5 py-24 md:px-10 md:py-32" style={{ background: CREAM }}>
      <div className="mx-auto grid max-w-[1360px] gap-12 md:grid-cols-2">
        <div>
          <h2 className={`${H} text-[clamp(48px,7vw,116px)] font-extrabold leading-[.86] tracking-[-.045em] text-[#0f3b2e]`}><SplitText text="Book the" className="block" /><SplitText text="van." delay={0.15} className="block text-[#ff6a1a]" /></h2>
          <p className="mb-8 mt-6 max-w-[400px] text-[17px] text-[#0f3b2e]/70">Leave your number and postcode — we'll get back to you with the next free slot and confirm we can reach you.</p>
          <a href={'tel:' + tel(b.phone)} className={`${H} block text-[clamp(30px,3.4vw,44px)] font-bold text-[#0f3b2e]`}>{b.phone}</a>
          <a href={waLink(b.phone)} target="_blank" rel="noopener" className="mt-4 inline-flex h-12 items-center gap-2 rounded-full bg-[#25d366] px-6 font-bold text-white"><WA />WhatsApp us</a>
        </div>
        <div className="rounded-[28px] bg-[#0f3b2e] p-6 md:p-10">
          <AnimatePresence mode="wait">
            {!bk.s.sent ? (
              <motion.form key="f" exit={{ opacity: 0, x: 40 }} onSubmit={bk.submit} noValidate className="grid gap-3">
                <input className={f} placeholder="Your name" value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} autoComplete="name" />
                <motion.input animate={bk.s.err ? { x: [0, -8, 8, -6, 6, 0] } : {}} className={f + (bk.s.err ? ' !ring-2 !ring-red-500' : '')} type="tel" inputMode="tel" placeholder="+44 7___ ______" value={bk.s.phone} onFocus={phoneFocus(bk, '+44 ')} onChange={e => bk.upd('phone', e.target.value)} autoComplete="tel" />
                <input className={f + ` ${M} uppercase`} placeholder="Postcode" value={pc} onChange={e => setPc(e.target.value)} autoComplete="postal-code" />
                <div className="mt-1 flex flex-wrap gap-2">{SV.map(s => s[0]).map(t => <button type="button" key={t} onClick={() => bk.upd('svc', t)} className={`rounded-full px-4 py-2 text-[13px] font-bold transition-colors ${bk.s.svc === t ? 'bg-[#ff6a1a] text-white' : 'bg-[#f3ecdc]/10 text-[#f3ecdc]/80 hover:bg-[#f3ecdc]/20'}`}>{t}</button>)}</div>
                <button disabled={bk.s.loading} className={`${H} mt-3 h-16 rounded-2xl bg-[#ff6a1a] text-[17px] font-bold text-white transition-[scale,opacity] active:scale-[.97] disabled:opacity-60`}>{bk.s.loading ? 'Starting the engine…' : 'Request a slot'}</button>
                <p className="text-[13px] text-[#f3ecdc]/50">In the finished site this request goes straight to your phone or Telegram.</p>
              </motion.form>
            ) : (
              <motion.div key="ok" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="grid min-h-[360px] place-items-center text-center text-[#f3ecdc]">
                <div><CheckDraw className="mx-auto mb-5 text-[#ff6a1a]" /><h3 className={`${H} text-[40px] font-bold leading-tight`}>The van's on the way… soon.</h3><p className="mx-auto mb-5 max-w-[340px] text-[#f3ecdc]/70">This is how your customer sees the confirmation. In the finished site this request goes straight to your phone or Telegram.</p><button onClick={bk.reset} className="font-bold underline underline-offset-4">Another booking</button></div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </RoadWipe>
  )
}

function Contact() {
  return (
    <section id="contact" className="px-5 pb-24 md:px-10 md:pb-32" style={{ background: CREAM }}>
      <div className="mx-auto grid max-w-[1360px] gap-5 md:grid-cols-[.9fr_1.1fr]">
        <Reveal className="flex flex-col gap-6 rounded-[28px] bg-white p-8 ring-1 ring-[#0f3b2e]/10 md:p-12">
          <h2 className={`${H} text-[clamp(44px,5vw,80px)] font-extrabold leading-[.9] tracking-[-.04em] text-[#0f3b2e]`}>Say hello</h2>
          <p className="flex items-start gap-3 text-[20px] font-semibold text-[#0f3b2e]"><MapPin className="mt-1 shrink-0 text-[#ff6a1a]" />{b.addr}</p>
          <p className="text-[15px] text-[#0f3b2e]/60">Mobile service — we come to you across Leeds & surrounding areas. Confirm your location when booking.</p>
          <a href={'tel:' + tel(b.phone)} className={`${H} inline-flex items-center gap-3 text-[clamp(28px,3vw,40px)] font-bold text-[#0f3b2e]`}><Phone className="text-[#ff6a1a]" />{b.phone}</a>
          <div className="flex flex-wrap gap-3">
            <a href={waLink(b.phone)} target="_blank" rel="noopener" className="inline-flex h-12 items-center gap-2 rounded-full bg-[#25d366] px-6 font-bold text-white"><WA />WhatsApp</a>
            <a href={'tel:' + tel(b.phone)} className="inline-flex h-12 items-center gap-2 rounded-full bg-[#0f3b2e] px-6 font-bold text-[#f3ecdc]"><Phone size={16} />Call now</a>
          </div>
        </Reveal>
        <div className="relative h-[440px] overflow-hidden rounded-[28px] ring-1 ring-[#0f3b2e]/10">
          <MapFold panels={5} />
          <GMap q={`${b.full}, ${b.addr}`} />
        </div>
      </div>
    </section>
  )
}

function App() {
  useSmooth()
  const lite = useLite()
  const [pc, setPc] = useState('')
  return (
    <MotionConfig reducedMotion="user">
      <div className="font-['Bricolage_Grotesque',sans-serif] overflow-x-clip" style={{ background: CREAM, color: INK, '--sel': OR, '--selc': '#fff' }}>
        <Intro bg={GREEN} fg={CREAM} duration={1.6}>
          <div className="w-[260px]">
            <svg viewBox="-20 -14 40 24" className="mx-auto mb-4 w-20"><VanIcon /></svg>
            <div className="h-[4px] w-full overflow-hidden"><motion.div initial={{ x: '-100%' }} animate={{ x: '0%' }} transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }} className="h-full w-full" style={{ backgroundImage: `repeating-linear-gradient(90deg, ${OR} 0 22px, transparent 22px 36px)` }} /></div>
            <p className={`${H} mt-4 text-center text-[28px] font-extrabold tracking-[-.03em]`}>Detailing&amp;Co</p>
          </div>
        </Intro>
        <Progress color={OR} />
        <Cursor color={OR} blend="normal" textColor="#fff" />
        <Ribbon lang="en" name={b.name} bg={INK} fg={CREAM} />
        <header className="sticky top-0 z-40 border-b border-[#0f3b2e]/10 bg-[#f3ecdc]/85 backdrop-blur-xl">
          <div className="mx-auto flex h-[64px] max-w-[1360px] items-center justify-between px-5 md:h-[70px] md:px-10">
            <a href="#top" className={`${H} flex items-center gap-2 text-[21px] font-extrabold tracking-[-.03em] text-[#0f3b2e]`}><span className="grid h-8 w-8 place-items-center rounded-lg bg-[#0f3b2e] text-[#ff6a1a]"><Navigation size={16} fill="currentColor" /></span>Detailing<span className="text-[#ff6a1a]">&amp;</span>Co</a>
            <nav className="hidden gap-8 text-[14px] font-semibold text-[#0f3b2e]/70 md:flex">{[['#services', 'Services'], ['#postcode', 'Postcode check'], ['#book', 'Book'], ['#contact', 'Contact']].map(([h, t]) => <a key={h} href={h} className="hover:text-[#ff6a1a]">{t}</a>)}</nav>
            <a href={'tel:' + tel(b.phone)} className="hidden h-11 items-center gap-2 rounded-full bg-[#0f3b2e] px-5 text-[14px] font-bold text-[#f3ecdc] sm:inline-flex"><Phone size={15} />{b.phone}</a>
          </div>
        </header>
        <main id="top">
          <Hero lite={lite} />
          <Marquee base={-2.2} className="bg-[#ff6a1a] py-5 text-white">
            {['we come to you', 'hand wash', 'interior', 'polish', 'wheels', 'protection'].map(t => <span key={t} className={`${H} mx-6 inline-flex items-center gap-12 text-[clamp(30px,4vw,60px)] font-extrabold tracking-[-.03em]`}>{t}<svg viewBox="-20 -14 40 24" className="w-12"><VanIcon fill={GREEN} /></svg></span>)}
          </Marquee>
          <Services />
          <Journey />
          <Checker onPostcode={setPc} />
          <Rating />
          <Book postcode={pc} />
          <Contact />
        </main>
        <footer className="px-5 pb-10 text-[14px] font-semibold text-[#0f3b2e]/60 md:px-10" style={{ background: CREAM }}>
          <div className="mx-auto flex max-w-[1360px] flex-wrap justify-between gap-4 border-t border-[#0f3b2e]/15 pt-8"><span>© 2026 {b.name} · Website concept by Artem</span><a href="#top" className="inline-flex items-center gap-1 hover:text-[#ff6a1a]">Back to the start <ArrowUpRight size={15} /></a></div>
        </footer>
        <CallBar lang="en" phone={b.phone} barCls="bg-[#f3ecdc]/90 backdrop-blur-xl" callCls="rounded-2xl bg-[#0f3b2e] text-[#f3ecdc]" bookCls="rounded-2xl bg-[#ff6a1a] text-white" />
        <div className="h-[72px] sm:hidden" />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
