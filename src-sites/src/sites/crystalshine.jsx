import React, { useRef, useMemo, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, useSpring, AnimatePresence, MotionConfig } from 'framer-motion'
import { ArrowRight, Phone, MapPin, Star, Droplets, Armchair, Sparkles, ShieldCheck, Disc3, Car } from 'lucide-react'
import '../lib/base.css'
import { useSmooth, Ribbon, SplitText, Reveal, Magnetic, Cursor, Marquee, Counter, useBooking, phoneFocus, CheckDraw, CallBar, Progress, Intro, tel, useLite, GMap, WA, waLink, LineReveal, IG } from '../lib/kit'
import ShineMeter from './crystalshine-meter'

const Crystals = lazy(() => import('./crystalshine3d'))
const b = {
  name: 'Crystal Shine Valeting Centre',
  addr: 'Withington Rd, Whalley Range, Manchester M16 8EE',
  phone: '+44 7722 185077',
  ig: 'https://www.instagram.com/Crystalshinewash/',
  rating: '4.5', rev: 247,
}
const ICE = '#f3f7ff', BLUE = '#0a1f5c', DEEP = '#061437'
const prism = 'linear-gradient(100deg,#3fd8ff 0%,#8a7bff 30%,#ff6fcf 55%,#ffcf5a 78%,#4cf0b0 100%)'
const D = "font-['Syne',sans-serif]"
const SV = [
  ['Exterior wash', 'Snow foam, hand wash, rinse and dry — the full outside refresh.', Droplets],
  ['Interior valet', 'Vacuum, dashboard, door cards, glass and mats inside.', Armchair],
  ['Full valet', 'Inside and out in one visit for a car that feels new again.', Car],
  ['Machine polish', 'Brings back depth and clarity to tired, hazy paintwork.', Sparkles],
  ['Wax & protection', 'A slick protective layer so the shine lasts longer.', ShieldCheck],
  ['Wheels & tyres', 'Brake dust off, alloys bright, tyres dressed.', Disc3],
]

/* prism light-split title: three colour layers converge into one */
function Prism({ text, className = '', light = false }) {
  const base = light ? '#ffffff' : BLUE
  const blend = light ? 'screen' : 'multiply'
  const layers = light ? ['#ff2bd1', '#2be8ff', '#ffe02b'] : ['#ff3fd0', '#30d8ff', '#ffd33a']
  const off = ['-0.09em', '0.09em', '0']
  return (
    <span className={'relative ' + (/\bblock\b/.test(className) ? '' : 'inline-block ') + className}>
      {layers.map((c, k) => (
        <motion.span key={k} aria-hidden="true" className="absolute inset-0" style={{ color: c, mixBlendMode: blend }}
          initial={{ x: off[k], y: k === 2 ? '0.08em' : 0, opacity: 0.9 }} whileInView={{ x: 0, y: 0, opacity: 0 }} viewport={{ once: true, margin: '0px 0px -10% 0px' }}
          transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1], opacity: { delay: 0.9, duration: 0.6 } }}>{text}</motion.span>
      ))}
      <motion.span className="relative" style={{ color: base }} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, margin: '0px 0px -10% 0px' }} transition={{ delay: 0.6, duration: 0.8 }}>{text}</motion.span>
    </span>
  )
}

/* shard-shatter: the previous colour breaks into flying triangles as you scroll in */
function Shard({ pts, p, cx, cy, i, color }) {
  const dx = (cx - 50) * 0.9 + ((i * 37) % 11 - 5) * 2, dy = 30 + ((i * 53) % 17)
  const x = useTransform(p, [0, 1], [0, dx]), y = useTransform(p, [0, 1], [0, dy])
  const r = useTransform(p, [0, 1], [0, ((i * 71) % 2 ? 1 : -1) * (90 + (i * 29) % 180)])
  const o = useTransform(p, [0.3 + ((i * 13) % 10) / 40, 0.95], [1, 0])
  const s = useTransform(p, [0, 1], [1, 0.4])
  return <motion.polygon points={pts} fill={color} stroke={color} strokeWidth="0.3" style={{ x, y, rotate: r, opacity: o, scale: s, transformBox: 'fill-box', transformOrigin: 'center' }} />
}
function Shatter({ from = DEEP }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 85%', 'end 20%'] })
  const p = useSpring(scrollYProgress, { stiffness: 70, damping: 20 })
  const tris = useMemo(() => {
    const cols = 10, rows = 6, P = []
    for (let j = 0; j <= rows; j++) for (let i = 0; i <= cols; i++) {
      const edge = i === 0 || j === 0 || i === cols || j === rows
      P.push([i * 10 + (edge ? 0 : ((i * 7 + j * 13) % 7 - 3)), j * 10 + (edge ? 0 : ((i * 11 + j * 5) % 7 - 3))])
    }
    const T = []
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const a = P[j * (cols + 1) + i], b2 = P[j * (cols + 1) + i + 1], c = P[(j + 1) * (cols + 1) + i], d = P[(j + 1) * (cols + 1) + i + 1]
      const t1 = (i + j) % 2 ? [a, b2, d] : [a, b2, c], t2 = (i + j) % 2 ? [a, d, c] : [b2, d, c]
      for (const t of [t1, t2]) T.push({ pts: t.map(q => q.join(',')).join(' '), cx: (t[0][0] + t[1][0] + t[2][0]) / 3, cy: (t[0][1] + t[1][1] + t[2][1]) / 3 })
    }
    return T
  }, [])
  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[70vh]">
      <svg viewBox="0 0 100 60" preserveAspectRatio="none" className="h-full w-full overflow-visible">
        {tris.map((t, i) => <Shard key={i} i={i} pts={t.pts} cx={t.cx} cy={t.cy} p={p} color={from} />)}
      </svg>
    </div>
  )
}

/* prism-edge wipe: a rainbow light band sweeps across, revealing the section */
function PrismWipe({ children, className = '', id }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 20%'] })
  const p = useSpring(scrollYProgress, { stiffness: 80, damping: 22 })
  const clip = useTransform(p, v => { const a = v * 140 - 20; return `polygon(0 0, ${a}% 0, ${a - 20}% 100%, 0 100%)` })
  const bandX = useTransform(p, v => `${v * 140 - 30}%`)
  return (
    <section ref={ref} id={id} className="relative overflow-hidden" style={{ background: ICE }}>
      <motion.div style={{ clipPath: clip }} className={className}>{children}</motion.div>
      <motion.div aria-hidden="true" style={{ left: bandX, background: prism }} className="pointer-events-none absolute top-[-10%] h-[120%] w-[3vw] skew-x-[-11deg] opacity-80 blur-[6px]" />
    </section>
  )
}

function Hero({ lite }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '35%'])
  return (
    <section ref={ref} className="relative h-[100svh] min-h-[660px] overflow-hidden" style={{ background: `radial-gradient(90% 70% at 75% 40%, #ffffff 0%, #e6eeff 45%, #cfdcff 100%)` }}>
      <div aria-hidden="true" className="absolute right-[-10%] top-[10%] h-[60vh] w-[60vw] rounded-full opacity-40 blur-[90px]" style={{ background: prism }} />
      <div className="absolute inset-0">{lite ? <LiteCrystals /> : <Suspense fallback={<LiteCrystals />}><Crystals scroll={scrollYProgress} /></Suspense>}</div>
      <motion.div style={{ y }} className="pointer-events-none relative z-10 mx-auto flex h-full max-w-[1380px] flex-col justify-end px-5 pb-12 md:justify-center md:px-10 md:pb-0">
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.6 }} className="mb-5 inline-flex items-center gap-3 self-start rounded-full bg-white/70 px-4 py-2 text-[12px] font-bold uppercase tracking-[.18em] text-[#0a1f5c] backdrop-blur"><span className="h-2 w-2 rotate-45" style={{ background: prism }} />Car wash & valeting · Whalley Range</motion.p>
        <h1 className={`${D} text-[clamp(40px,8.6vw,150px)] font-extrabold uppercase leading-[.84] tracking-[-.04em] text-[#0a1f5c]`}>
          <SplitText text="Crystal" delay={1.4} y="120%" rotate={-6} className="block" />
          <LineReveal delay={1.7} className="pr-[.05em]"><span className="bg-clip-text text-transparent" style={{ backgroundImage: prism }}>clear</span></LineReveal>
          <SplitText text="shine." delay={1.9} y="120%" rotate={-6} className="block" />
        </h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.3 }} className="mt-6 max-w-[420px] text-[16px] font-medium text-[#0a1f5c]/75 md:text-[18px]">Hand car wash and valeting in Manchester. We polish the dull out of your paint until it catches the light like glass.</motion.p>
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.5 }} className="pointer-events-auto mt-8 flex flex-wrap gap-3">
          <Magnetic><a href="#book" data-cursor="Shine" className={`${D} inline-flex h-14 items-center gap-3 rounded-full bg-[#0a1f5c] px-8 text-[15px] font-bold text-white shadow-[0_18px_40px_-14px_rgba(10,31,92,.8)] md:h-16`}>Book a wash <ArrowRight size={18} /></a></Magnetic>
          <a href="#shine" className={`${D} hidden h-16 items-center gap-2 rounded-full bg-white/80 px-7 text-[15px] font-bold text-[#0a1f5c] backdrop-blur sm:inline-flex`}>Try the shine meter</a>
        </motion.div>
      </motion.div>
      <p className="absolute bottom-5 right-5 z-10 hidden text-[11px] font-bold uppercase tracking-[.25em] text-[#0a1f5c]/50 md:block">move the cursor · crystals follow</p>
    </section>
  )
}
function LiteCrystals() {
  return <div className="absolute inset-0">{Array.from({ length: 12 }).map((_, i) => <motion.span key={i} className="absolute" style={{ left: `${45 + (i * 23) % 50}%`, top: `${8 + (i * 31) % 55}%`, width: 30 + (i % 4) * 22, height: (30 + (i % 4) * 22) * 1.4, clipPath: 'polygon(50% 0,100% 50%,50% 100%,0 50%)', background: `linear-gradient(135deg,#fff,${['#9fe8ff', '#cdb8ff', '#ffc2ea', '#fff0b0'][i % 4]})` }} animate={{ y: [0, -18, 0], rotate: [0, 12, 0] }} transition={{ duration: 4 + (i % 3), repeat: Infinity, delay: i * 0.3 }} />)}</div>
}

function Services() {
  return (
    <section id="services" className="relative px-5 py-24 md:px-10 md:py-32" style={{ background: ICE }}>
      <div className="mx-auto max-w-[1380px]">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <h2 className={`${D} text-[clamp(44px,7vw,112px)] font-extrabold uppercase leading-[.86] tracking-[-.04em]`}><Prism text="Every" className="block" /><Prism text="facet." className="block" /></h2>
          <p className="max-w-[340px] text-[16px] text-[#0a1f5c]/65">From a quick wash to a full valet. Tap a service to add it to your booking — the team will confirm the details.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SV.map(([t, d, I], k) => (
            <Reveal key={t} delay={k * 0.06}>
              <a href="#book" data-svc={t} data-cursor="Add" className="group relative block h-full overflow-hidden bg-white p-7 shadow-[0_24px_60px_-34px_rgba(10,31,92,.5)] transition-transform duration-500 hover:-translate-y-1" style={{ clipPath: 'polygon(0 0, calc(100% - 34px) 0, 100% 34px, 100% 100%, 34px 100%, 0 calc(100% - 34px))' }}>
                <span aria-hidden="true" className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: 'linear-gradient(135deg, rgba(63,216,255,.16), rgba(138,123,255,.14) 40%, rgba(255,111,207,.14) 70%, rgba(255,207,90,.16))' }} />
                <span aria-hidden="true" className="absolute -left-1/2 top-0 h-full w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 transition-all duration-700 group-hover:left-[120%] group-hover:opacity-100" />
                <span className="relative mb-10 grid h-14 w-14 place-items-center text-white" style={{ background: BLUE, clipPath: 'polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)' }}><I size={22} /></span>
                <h3 className={`${D} relative mb-2 text-[26px] font-bold uppercase leading-tight tracking-[-.02em] text-[#0a1f5c]`}>{t}</h3>
                <p className="relative text-[15px] text-[#0a1f5c]/65">{d}</p>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function Shine() {
  return (
    <section id="shine" className="relative overflow-hidden px-5 py-24 md:px-10 md:py-32" style={{ background: `radial-gradient(80% 60% at 50% 0%, #17337f, ${DEEP})` }}>
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px" style={{ background: prism }} />
      <div className="relative mx-auto max-w-[1200px]">
        <div className="mb-12 grid gap-6 md:grid-cols-[1.2fr_1fr] md:items-end">
          <div>
            <p className="mb-4 text-[12px] font-bold uppercase tracking-[.25em] text-[#7af0ff]">The shine meter</p>
            <h2 className={`${D} text-[clamp(42px,6.5vw,104px)] font-extrabold uppercase leading-[.86] tracking-[-.04em]`}><Prism text="Dull to" light className="block" /><Prism text="dazzling." light className="block" /></h2>
          </div>
          <p className="max-w-[400px] text-[16px] text-white/70">This car's paint has gone flat and hazy. Rub it with your cursor or finger — each pass brings up a little more gloss. Polish it to 100%.</p>
        </div>
        <ShineMeter />
      </div>
    </section>
  )
}

function Rating() {
  return (
    <section className="relative overflow-hidden px-5 pb-24 pt-[42vh] md:px-10 md:pb-32" style={{ background: ICE }}>
      <Shatter from={DEEP} />
      <div className="relative mx-auto grid max-w-[1380px] items-end gap-10 md:grid-cols-2">
        <div>
          <div className="mb-4 flex gap-1 text-[#ffb400]">{[0, 1, 2, 3].map(k => <Star key={k} size={28} fill="currentColor" />)}<span className="relative inline-block"><Star size={28} className="text-[#ffb400]/30" fill="currentColor" /><span className="absolute inset-0 w-1/2 overflow-hidden"><Star size={28} fill="currentColor" /></span></span></div>
          <p className={`${D} text-[clamp(110px,18vw,260px)] font-extrabold leading-[.8] tracking-[-.06em] text-[#0a1f5c]`}>{b.rating}</p>
          <p className="mt-3 text-[17px] font-medium text-[#0a1f5c]/60">average rating on Google</p>
        </div>
        <div className="md:text-right">
          <p className={`${D} bg-clip-text text-[clamp(110px,18vw,260px)] font-extrabold leading-[.8] tracking-[-.06em] text-transparent`} style={{ backgroundImage: prism }}><Counter to={b.rev} /></p>
          <p className="mt-3 text-[17px] font-medium text-[#0a1f5c]/60">Google reviews from Manchester drivers</p>
        </div>
      </div>
    </section>
  )
}

function Book() {
  const bk = useBooking()
  const f = 'h-14 w-full rounded-2xl bg-white px-5 text-[17px] text-[#0a1f5c] outline-none ring-1 ring-[#0a1f5c]/10 placeholder:text-[#0a1f5c]/35 focus:ring-2 focus:ring-[#8a7bff]'
  return (
    <PrismWipe id="book" className="px-5 py-24 md:px-10 md:py-32">
      <div className="mx-auto grid max-w-[1380px] gap-12 md:grid-cols-2">
        <div>
          <h2 className={`${D} text-[clamp(46px,7vw,112px)] font-extrabold uppercase leading-[.86] tracking-[-.04em]`}><Prism text="Book your" className="block" /><Prism text="shine." className="block" /></h2>
          <p className="mb-8 mt-6 max-w-[400px] text-[17px] text-[#0a1f5c]/65">Leave your number and pick a service — we'll call back with a time that works.</p>
          <a href={'tel:' + tel(b.phone)} className={`${D} block text-[clamp(30px,3.4vw,46px)] font-bold text-[#0a1f5c]`}>{b.phone}</a>
          <div className="mt-5 flex flex-wrap gap-3">
            <a href={waLink(b.phone)} target="_blank" rel="noopener" className="inline-flex h-12 items-center gap-2 rounded-full bg-[#25d366] px-6 font-bold text-white"><WA />WhatsApp</a>
            <a href={b.ig} target="_blank" rel="noopener" className="inline-flex h-12 items-center gap-2 rounded-full px-6 font-bold text-white" style={{ background: 'linear-gradient(45deg,#f9a03f,#e1306c,#833ab4)' }}><IG />Instagram</a>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-[32px] p-[2px]" style={{ background: prism }}>
          <div className="h-full rounded-[30px] bg-[#f3f7ff] p-6 md:p-10">
            <AnimatePresence mode="wait">
              {!bk.s.sent ? (
                <motion.form key="f" exit={{ opacity: 0, scale: 0.95 }} onSubmit={bk.submit} noValidate className="grid gap-3">
                  <input className={f} placeholder="Your name" value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} autoComplete="name" />
                  <motion.input animate={bk.s.err ? { x: [0, -8, 8, -6, 6, 0] } : {}} className={f + (bk.s.err ? ' !ring-2 !ring-red-500' : '')} type="tel" inputMode="tel" placeholder="+44 7___ ______" value={bk.s.phone} onFocus={phoneFocus(bk, '+44 ')} onChange={e => bk.upd('phone', e.target.value)} autoComplete="tel" />
                  <div className="mt-1 flex flex-wrap gap-2">{SV.map(s => s[0]).map(t => <button type="button" key={t} onClick={() => bk.upd('svc', t)} className={`rounded-full px-4 py-2 text-[13px] font-bold transition-colors ${bk.s.svc === t ? 'bg-[#0a1f5c] text-white' : 'bg-white text-[#0a1f5c]/70 ring-1 ring-[#0a1f5c]/10 hover:ring-[#8a7bff]'}`}>{t}</button>)}</div>
                  <button disabled={bk.s.loading} className={`${D} mt-3 h-16 rounded-2xl bg-[#0a1f5c] text-[16px] font-bold uppercase tracking-[.08em] text-white transition-[scale,opacity] active:scale-[.97] disabled:opacity-60`}>{bk.s.loading ? 'Polishing…' : 'Request a time'}</button>
                  <p className="text-[13px] text-[#0a1f5c]/50">In the finished site this request goes straight to your phone or Telegram.</p>
                </motion.form>
              ) : (
                <motion.div key="ok" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="grid min-h-[340px] place-items-center text-center text-[#0a1f5c]">
                  <div><CheckDraw className="mx-auto mb-5 text-[#8a7bff]" /><h3 className={`${D} text-[36px] font-extrabold uppercase leading-tight`}>Crystal clear.</h3><p className="mx-auto mb-5 max-w-[340px] text-[#0a1f5c]/65">This is the confirmation your customer sees. In the finished site this request goes straight to your phone or Telegram.</p><button onClick={bk.reset} className="font-bold underline underline-offset-4">Another booking</button></div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </PrismWipe>
  )
}

function Contact() {
  return (
    <section id="contact" className="px-5 pb-24 md:px-10 md:pb-32" style={{ background: ICE }}>
      <div className="mx-auto grid max-w-[1380px] gap-5 md:grid-cols-[.9fr_1.1fr]">
        <Reveal className="flex flex-col gap-6 rounded-[32px] p-8 text-white md:p-12" style={{ background: `linear-gradient(160deg, #17337f, ${DEEP})` }}>
          <h2 className={`${D} text-[clamp(42px,5vw,80px)] font-extrabold uppercase leading-[.88] tracking-[-.04em]`}>Find us</h2>
          <span className="h-[3px] w-24" style={{ background: prism }} />
          <p className="flex items-start gap-3 text-[20px] font-semibold"><MapPin className="mt-1 shrink-0 text-[#7af0ff]" />{b.addr}</p>
          <a href={'tel:' + tel(b.phone)} className={`${D} inline-flex items-center gap-3 text-[clamp(26px,3vw,38px)] font-bold`}><Phone className="text-[#7af0ff]" />{b.phone}</a>
          <div className="flex flex-wrap gap-3">
            <a href={waLink(b.phone)} target="_blank" rel="noopener" className="inline-flex h-12 items-center gap-2 rounded-full bg-[#25d366] px-6 font-bold text-white"><WA />WhatsApp</a>
            <a href={b.ig} target="_blank" rel="noopener" className="inline-flex h-12 items-center gap-2 rounded-full bg-white/10 px-6 font-bold ring-1 ring-white/20"><IG />@Crystalshinewash</a>
          </div>
        </Reveal>
        <Reveal delay={0.1} className="h-[440px] overflow-hidden rounded-[32px] shadow-[0_24px_60px_-34px_rgba(10,31,92,.5)]"><GMap q={`${b.name}, ${b.addr}`} /></Reveal>
      </div>
    </section>
  )
}

function App() {
  useSmooth()
  const lite = useLite()
  return (
    <MotionConfig reducedMotion="user">
      <div className="font-['Manrope',sans-serif] overflow-x-clip" style={{ background: ICE, color: BLUE, '--sel': '#8a7bff', '--selc': '#fff' }}>
        <Intro bg={DEEP} fg="#fff" duration={1.6}>
          <div className="relative grid place-items-center">
            <motion.div initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }} className="h-24 w-16" style={{ clipPath: 'polygon(50% 0,100% 40%,50% 100%,0 40%)', background: prism }} />
            <p className={`${D} mt-5 text-[22px] font-extrabold uppercase tracking-[.2em]`}>Crystal Shine</p>
          </div>
        </Intro>
        <Progress color="#8a7bff" />
        <Cursor color="#ffffff" blend="difference" textColor={BLUE} />
        <Ribbon lang="en" name={b.name} bg={DEEP} fg="#fff" />
        <header className="sticky top-0 z-40 border-b border-[#0a1f5c]/[.06] bg-white/70 backdrop-blur-xl">
          <div className="mx-auto flex h-[64px] max-w-[1380px] items-center justify-between px-5 md:h-[70px] md:px-10">
            <a href="#top" className={`${D} flex items-center gap-3 text-[19px] font-extrabold uppercase tracking-[-.01em] text-[#0a1f5c]`}><span className="h-7 w-5" style={{ clipPath: 'polygon(50% 0,100% 40%,50% 100%,0 40%)', background: prism }} />Crystal Shine</a>
            <nav className="hidden gap-8 text-[14px] font-bold text-[#0a1f5c]/60 md:flex">{[['#services', 'Services'], ['#shine', 'Shine meter'], ['#book', 'Book'], ['#contact', 'Contact']].map(([h, t]) => <a key={h} href={h} className="hover:text-[#0a1f5c]">{t}</a>)}</nav>
            <a href={'tel:' + tel(b.phone)} className="hidden h-11 items-center gap-2 rounded-full bg-[#0a1f5c] px-5 text-[14px] font-bold text-white sm:inline-flex"><Phone size={15} />{b.phone}</a>
          </div>
        </header>
        <main id="top">
          <Hero lite={lite} />
          <Marquee base={-2.4} className="bg-[#0a1f5c] py-5 text-white">
            {['hand wash', 'valeting', 'machine polish', 'interior', 'wheels', 'protection'].map(t => <span key={t} className={`${D} mx-6 inline-flex items-center gap-12 text-[clamp(30px,4vw,60px)] font-extrabold uppercase tracking-[-.02em]`}>{t}<span className="h-7 w-5" style={{ clipPath: 'polygon(50% 0,100% 40%,50% 100%,0 40%)', background: '#fff' }} /></span>)}
          </Marquee>
          <Services />
          <Shine />
          <Rating />
          <Book />
          <Contact />
        </main>
        <footer className="px-5 pb-10 text-[14px] font-semibold text-[#0a1f5c]/55 md:px-10" style={{ background: ICE }}>
          <div className="mx-auto flex max-w-[1380px] flex-wrap justify-between gap-4 border-t border-[#0a1f5c]/10 pt-8"><span>© 2026 {b.name} · Website concept by Artem</span><a href={b.ig} target="_blank" rel="noopener" className="inline-flex items-center gap-2 hover:text-[#0a1f5c]"><IG width={15} height={15} />Instagram</a></div>
        </footer>
        <CallBar lang="en" phone={b.phone} barCls="bg-white/85 backdrop-blur-xl" callCls="rounded-2xl bg-white text-[#0a1f5c] ring-1 ring-[#0a1f5c]/15" bookCls="rounded-2xl bg-[#0a1f5c] text-white" />
        <div className="h-[72px] sm:hidden" />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
