import React, { useRef, useState, useEffect, useLayoutEffect, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, useSpring, AnimatePresence, MotionConfig, LayoutGroup } from 'framer-motion'
import { ArrowRight, Phone, MapPin, Star, Check, Plus, Clock } from 'lucide-react'
import '../lib/base.css'
import { LineReveal, useSmooth, Ribbon, SplitText, ScrollWords, Reveal, Magnetic, Cursor, Counter, useBooking, phoneFocus, CheckDraw, GMap, CallBar, Progress, Intro, tel, useLite, WA, waLink } from '../lib/kit'

const Silk = lazy(() => import('./luxurynails3d'))
const b = {
  name: 'Luxury Nails & Spa', addr: '925 Walsall Rd, Great Barr, Birmingham B42 1TN', area: 'Great Barr, Birmingham',
  phone: '+44 7716 556789', rating: 4.7, rev: 203,
}
const IV = '#faf5ec', CH = '#e7cfa8', RG = '#b9786a', PL = '#3a1830', PL2 = '#22101c'
const rose = 'linear-gradient(100deg, #b9786a, #e6b9a0 45%, #c98f7a 70%, #8e5547)'
const D = "font-['Italiana',serif]", NUM = "font-['Mulish',sans-serif] font-light tracking-[-.02em]"
const SV = [
  ['Manicure', 'Shaping, cuticle care, a soothing hand cream and the colour of your choice.', 'radial-gradient(120% 90% at 20% 10%, #fff7ec, #ecd3b3 55%, #c99b80)'],
  ['Gel polish', 'Mirror-gloss colour that stays put, applied slowly and precisely.', 'radial-gradient(120% 90% at 80% 20%, #fbe6e1, #d9a3a0 55%, #9b5f63)'],
  ['Pedicure', 'Soak, file, tidy cuticles and polish. Light, neat and ready for sandals.', 'radial-gradient(120% 90% at 30% 80%, #f7efe2, #dcc29b 55%, #a37f5d)'],
  ['Spa pedicure', 'The long version: warm soak, exfoliation, mask and massage before polish.', 'radial-gradient(120% 90% at 70% 70%, #f3e2ea, #c79bb1 55%, #6e3b57)'],
  ['Nail art & extensions', 'From a soft French tip to full sets with chrome, ombré and fine detail.', 'radial-gradient(120% 90% at 50% 0%, #fff, #e8d6c0 45%, #b9786a)'],
  ['Hand & foot massage', 'A slow add-on to any treatment — the part people tend to close their eyes for.', 'radial-gradient(120% 90% at 10% 60%, #f6ece2, #d8b7a3 55%, #5a2a44)'],
]
const T = [
  { k: 'mani', n: 'Manicure', m: 30, r: 14, d: 'shape, cuticles, polish' },
  { k: 'gel', n: 'Gel polish', m: 45, r: 12, d: 'long-lasting gloss' },
  { k: 'pedi', n: 'Pedicure', m: 40, r: 18, d: 'neat & sandal-ready', x: 'spa' },
  { k: 'spa', n: 'Spa pedicure', m: 60, r: 30, d: 'soak, scrub, mask', x: 'pedi' },
  { k: 'art', n: 'Nail art', m: 20, r: 8, d: 'a little detail' },
  { k: 'mass', n: 'Add-on massage', m: 15, r: 22, d: 'hands or feet' },
]
const RMAX = 14 + 12 + 30 + 8 + 22
const MOODS = [[0, 'Still on the clock'], [.2, 'Shoulders dropping'], [.45, 'Properly unwinding'], [.7, 'Blissed out'], [.92, 'Floating on silk']]
const fmt = m => (m >= 60 ? `${Math.floor(m / 60)} h ${m % 60 ? (m % 60) + ' min' : ''}` : `${m} min`).trim()

/* silk-fold reveal: the panel unfolds from a corner like fabric opening */
function Fold({ children, className = '', delay = 0, style }) {
  return (
    <motion.div className={'relative ' + className} style={style}
      initial={{ clipPath: 'polygon(0% 0%, 0% 0%, 0% 0%, 0% 0%)', rotateX: 18, transformPerspective: 1200 }}
      whileInView={{ clipPath: ['polygon(0% 0%, 0% 0%, 0% 0%, 0% 0%)', 'polygon(0% 0%, 100% 0%, 45% 55%, 0% 100%)', 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'], rotateX: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }} transition={{ duration: 1.5, ease: [0.65, 0, 0.35, 1], delay, times: [0, .55, 1] }}>
      {children}
      <motion.span aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(115deg, transparent 30%, rgba(255,255,255,.55) 48%, transparent 66%)', backgroundSize: '250% 100%' }}
        initial={{ backgroundPosition: '120% 0' }} whileInView={{ backgroundPosition: '-60% 0' }} viewport={{ once: true }} transition={{ duration: 1.8, delay: delay + .6, ease: 'easeInOut' }} />
    </motion.div>
  )
}
function SlowFade({ children, className = '', delay = 0 }) {
  return <motion.div className={className} initial={{ opacity: 0, filter: 'blur(16px)', scale: 1.03 }} whileInView={{ opacity: 1, filter: 'blur(0px)', scale: 1 }} viewport={{ once: true, margin: '0px 0px -10% 0px' }} transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1], delay }}>{children}</motion.div>
}

function Hero({ lite }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '25%'])
  const o = useTransform(scrollYProgress, [0, .75], [1, 0])
  const f = useTransform(scrollYProgress, [0, .75], ['blur(0px)', 'blur(12px)'])
  return (
    <section ref={ref} className="relative h-[100svh] min-h-[640px] overflow-hidden" style={{ background: `radial-gradient(110% 80% at 70% 20%, #fffaf2 0%, ${IV} 40%, #efe0cc 100%)` }}>
      <div className="absolute inset-0">{!lite ? <Suspense fallback={null}><Silk /></Suspense> :
        <motion.div className="absolute inset-[-20%]" style={{ background: 'repeating-linear-gradient(115deg, #f4e6d2 0 60px, #e2c7a2 120px, #fbf3e6 180px)', filter: 'blur(18px)' }} animate={{ x: ['-4%', '4%', '-4%'] }} transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }} />}</div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: `linear-gradient(180deg, ${IV}ee 0%, ${IV}00 38%), linear-gradient(90deg, ${IV}cc, ${IV}00 55%)` }} />
      <motion.div style={{ y, opacity: o, filter: f }} className="pointer-events-none relative z-10 mx-auto flex h-full max-w-[1320px] flex-col justify-start px-6 pt-[11vh] md:justify-center md:px-10 md:pt-0">
        <motion.p initial={{ opacity: 0, letterSpacing: '.6em' }} animate={{ opacity: 1, letterSpacing: '.32em' }} transition={{ delay: 1.6, duration: 1.6 }} className="mb-6 text-[12px] font-semibold uppercase text-[#8e5547]">Nails & spa · {b.area}</motion.p>
        <h1 className={`${D} text-[clamp(64px,12vw,200px)] leading-[.86] tracking-[-.01em] text-[#3a1830]`}>
          <SplitText text="Unwind" delay={1.4} stagger={.07} y="105%" className="block" />
          <LineReveal delay={1.9} className="pr-[.08em]"><span className="bg-clip-text text-transparent [background-image:var(--g)]" style={{ '--g': rose }}>in silk.</span></LineReveal>
        </h1>
        <motion.p initial={{ opacity: 0, filter: 'blur(8px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} transition={{ delay: 2.3, duration: 1.2 }} className="mt-7 max-w-[440px] text-[17px] leading-relaxed text-[#5a3a48]">
          Manicures, pedicures and slow spa rituals on Walsall Road. Move your cursor across the silk — then let someone else take care of the rest.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.5, duration: 1 }} className="pointer-events-auto mt-10 flex flex-wrap items-center gap-3">
          <Magnetic><a href="#book" data-cursor="Book" className="inline-flex h-14 items-center gap-3 rounded-full bg-[#3a1830] px-8 text-[15px] font-semibold tracking-wide text-[#faf5ec] shadow-[0_20px_50px_-18px_rgba(58,24,48,.8)] transition-colors hover:bg-[#5a2a44]">Book a visit <ArrowRight size={18} /></a></Magnetic>
          <a href="#pamper" className="inline-flex h-14 items-center gap-2 rounded-full bg-white/60 px-7 text-[15px] font-semibold text-[#3a1830] ring-1 ring-[#3a1830]/15 backdrop-blur hover:bg-white">Build your pamper</a>
        </motion.div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.8 }} className="mt-8 flex items-center gap-2 text-[14px] text-[#5a3a48]"><span className="flex text-[#b9786a]">{[0, 1, 2, 3, 4].map(k => <Star key={k} size={14} fill="currentColor" />)}</span><b>{b.rating}</b> on Google · {b.rev} reviews</motion.p>
      </motion.div>
    </section>
  )
}

function Intro2() {
  return (
    <section className="relative overflow-hidden px-6 py-32 md:px-10" style={{ background: IV }}>
      <div className="mx-auto grid max-w-[1240px] items-center gap-14 md:grid-cols-[1fr_1.1fr]">
        <Fold className="aspect-[4/5] overflow-hidden rounded-t-full" style={{ background: 'radial-gradient(90% 70% at 30% 20%, #fff8ee, #ead2b0 50%, #b9786a 100%)' }}>
          <div className="absolute inset-0" style={{ background: 'repeating-linear-gradient(120deg, rgba(255,255,255,.0) 0 40px, rgba(255,255,255,.25) 70px, rgba(255,255,255,0) 110px)' }} />
          <span className={`${D} absolute bottom-8 left-8 text-[22px] text-[#3a1830]/80`}>a quiet hour</span>
        </Fold>
        <div>
          <p className="mb-6 text-[12px] font-semibold uppercase tracking-[.32em] text-[#8e5547]">The feeling</p>
          <ScrollWords dim={.16} className={`${D} text-[clamp(34px,4.4vw,64px)] leading-[1.08] text-[#3a1830]`}
            text="Warm water, soft light, nobody asking you for anything. Your hands and feet get the attention — you get to switch off." />
        </div>
      </div>
    </section>
  )
}

function Services() {
  const ref = useRef(null), track = useRef(null)
  const [dist, setDist] = useState(0)
  useLayoutEffect(() => {
    const m = () => track.current && setDist(Math.max(0, track.current.scrollWidth - innerWidth + 48))
    m(); addEventListener('resize', m); return () => removeEventListener('resize', m)
  }, [])
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const x = useSpring(useTransform(scrollYProgress, v => -v * dist), { stiffness: 90, damping: 24 })
  const bar = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])
  return (
    <section ref={ref} id="services" className="relative" style={{ height: `calc(100vh + ${dist}px)`, background: IV }}>
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="mx-auto mb-10 flex w-full max-w-[1320px] items-end justify-between gap-6 px-6 md:px-10">
          <h2 className={`${D} text-[clamp(48px,7vw,112px)] leading-[.9] text-[#3a1830]`}><SplitText text="Treatments" stagger={.025} /></h2>
          <div className="hidden w-48 md:block"><div className="h-px bg-[#3a1830]/15"><motion.div className="h-px bg-[#b9786a]" style={{ width: bar }} /></div><p className="mt-2 text-[12px] uppercase tracking-[.2em] text-[#8e5547]">scroll to drift</p></div>
        </div>
        <motion.div ref={track} style={{ x }} className="flex w-max gap-5 pl-6 pr-6 md:gap-7 md:pl-10">
          {SV.map(([t, d, g], k) => (
            <a key={t} href="#book" data-svc={t} data-cursor="Choose" className="group relative flex h-[56vh] max-h-[520px] min-h-[380px] w-[78vw] max-w-[400px] flex-col justify-end overflow-hidden rounded-[28px] p-7 md:w-[30vw]">
              <span className="absolute inset-0 transition-transform duration-[1.6s] ease-out group-hover:scale-110" style={{ background: g }} />
              <span className="absolute inset-0 opacity-60 mix-blend-soft-light transition-transform duration-[2s] group-hover:translate-x-10" style={{ background: 'repeating-linear-gradient(118deg, transparent 0 50px, rgba(255,255,255,.6) 80px, transparent 120px)' }} />
              <span className={`${D} absolute right-6 top-5 text-[64px] leading-none text-white/60`}>0{k + 1}</span>
              <div className="relative rounded-2xl bg-[#faf5ec]/80 p-5 backdrop-blur-md">
                <h3 className={`${D} text-[32px] leading-none text-[#3a1830]`}>{t}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-[#5a3a48]">{d}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-[13px] font-semibold text-[#8e5547]">Book this <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" /></span>
              </div>
            </a>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function Ring({ pct }) {
  const mood = [...MOODS].reverse().find(m => pct >= m[0])[1]
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[380px]">
      <svg viewBox="0 0 260 260" className="absolute inset-0 h-full w-full -rotate-90">
        <defs><linearGradient id="rg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f3d4b8" /><stop offset=".5" stopColor="#c98f7a" /><stop offset="1" stopColor="#f7e3cc" /></linearGradient></defs>
        <circle cx="130" cy="130" r="112" fill="none" stroke="rgba(250,245,236,.1)" strokeWidth="14" />
        <motion.circle cx="130" cy="130" r="112" fill="none" stroke="url(#rg)" strokeWidth="14" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: Math.max(.001, pct) }} transition={{ type: 'spring', stiffness: 40, damping: 14 }} />
        {Array.from({ length: 48 }).map((_, k) => <line key={k} x1="130" y1="6" x2="130" y2="12" stroke="rgba(250,245,236,.25)" strokeWidth="1" transform={`rotate(${k * 7.5} 130 130)`} />)}
      </svg>
      <motion.div className="absolute inset-[18%] rounded-full" animate={{ scale: [1, 1.04, 1], opacity: .25 + pct * .6 }} transition={{ scale: { duration: 4.5, repeat: Infinity, ease: 'easeInOut' }, opacity: { duration: 1 } }} style={{ background: 'radial-gradient(circle, rgba(231,207,168,.55), rgba(185,120,106,0) 70%)' }} />
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <p className="text-[11px] uppercase tracking-[.3em] text-[#e7cfa8]/70">relax-o-meter</p>
          <p className={`${NUM} text-[clamp(56px,7vw,84px)] leading-none text-[#faf5ec]`}><Counter key={Math.round(pct * 100)} to={Math.round(pct * 100)} duration={.9} />%</p>
          <AnimatePresence mode="wait"><motion.p key={mood} initial={{ opacity: 0, filter: 'blur(6px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} exit={{ opacity: 0, filter: 'blur(6px)' }} className="mt-1 text-[15px] text-[#e7cfa8]">{mood}</motion.p></AnimatePresence>
        </div>
      </div>
    </div>
  )
}

function Pamper() {
  const [sel, setSel] = useState(['mani', 'mass'])
  const tog = t => setSel(s => s.includes(t.k) ? s.filter(x => x !== t.k) : [...s.filter(x => x !== t.x), t.k])
  const chosen = T.filter(t => sel.includes(t.k))
  const total = chosen.reduce((a, t) => a + t.m, 0) + (chosen.length ? 5 : 0)
  const pct = Math.min(1, chosen.reduce((a, t) => a + t.r, 0) / RMAX)
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 65%'] })
  const bg = useTransform(scrollYProgress, [0, 1], [IV, PL])
  return (
    <motion.section ref={ref} id="pamper" style={{ background: bg }} className="relative overflow-hidden px-6 py-28 md:px-10">
      <div className="mx-auto max-w-[1320px] text-[#faf5ec]">
        <SlowFade className="mb-14 max-w-[760px]">
          <p className="mb-5 text-[12px] font-semibold uppercase tracking-[.32em] text-[#e7cfa8]">Pamper builder</p>
          <h2 className={`${D} text-[clamp(46px,6.6vw,104px)] leading-[.92]`}>Compose your <span className="bg-clip-text text-transparent" style={{ backgroundImage: rose }}>visit</span></h2>
          <p className="mt-5 max-w-[520px] text-[#faf5ec]/70">Pick your treatments and watch the ring fill. The timeline shows roughly how long you'll be in the chair — then send it straight to the booking form.</p>
        </SlowFade>
        <div className="grid items-center gap-14 lg:grid-cols-[1.1fr_.9fr]">
          <div>
            <div className="grid gap-3 sm:grid-cols-2">
              {T.map(t => {
                const on = sel.includes(t.k)
                return (
                  <motion.button key={t.k} onClick={() => tog(t)} whileTap={{ scale: .97 }} aria-pressed={on}
                    className={`group relative flex items-center gap-4 overflow-hidden rounded-2xl p-4 text-left ring-1 transition-colors duration-500 ${on ? 'bg-[#faf5ec] text-[#3a1830] ring-[#faf5ec]' : 'bg-white/[.04] text-[#faf5ec] ring-white/15 hover:ring-white/40'}`}>
                    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full transition-colors duration-500 ${on ? 'bg-[#b9786a] text-white' : 'bg-white/10'}`}>{on ? <Check size={18} /> : <Plus size={18} />}</span>
                    <span className="flex-1"><b className={`${D} block text-[24px] font-normal leading-tight`}>{t.n}</b><span className={`text-[13px] ${on ? 'text-[#5a3a48]' : 'text-white/50'}`}>{t.d}</span></span>
                    <span className={`text-[13px] tabular-nums ${on ? 'text-[#8e5547]' : 'text-white/50'}`}>~{t.m} min</span>
                  </motion.button>
                )
              })}
            </div>
            <div className="mt-10">
              <div className="mb-3 flex items-center justify-between text-[13px] text-[#faf5ec]/70"><span className="flex items-center gap-2"><Clock size={14} /> Your visit, roughly</span><b className={`${NUM} text-[22px] text-[#faf5ec]`}>{chosen.length ? `about ${fmt(total)}` : '—'}</b></div>
              <LayoutGroup>
                <div className="flex h-16 w-full gap-1 overflow-hidden rounded-2xl bg-white/[.05] p-1">
                  <AnimatePresence initial={false}>
                    {chosen.length > 0 && <motion.div layout key="arr" initial={{ opacity: 0, flexGrow: 0 }} animate={{ opacity: 1, flexGrow: 5 }} exit={{ opacity: 0, flexGrow: 0 }} className="grid min-w-0 basis-0 place-items-center rounded-xl bg-white/10 text-[11px] text-white/60">✦</motion.div>}
                    {chosen.map((t, k) => (
                      <motion.div layout key={t.k} initial={{ opacity: 0, flexGrow: 0, filter: 'blur(8px)' }} animate={{ opacity: 1, flexGrow: t.m, filter: 'blur(0px)' }} exit={{ opacity: 0, flexGrow: 0 }} transition={{ type: 'spring', stiffness: 80, damping: 18 }}
                        className="flex min-w-0 basis-0 flex-col justify-center overflow-hidden rounded-xl px-3" style={{ background: ['#e7cfa8', '#c98f7a', '#f3d4b8', '#a0606a', '#ead9c4', '#d6a48e'][k % 6] }}>
                        <span className="truncate text-[12px] font-bold text-[#3a1830]">{t.n}</span><span className="truncate text-[11px] text-[#3a1830]/70">~{t.m} min</span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {!chosen.length && <span className="grid w-full place-items-center text-[13px] text-white/40">Choose a treatment to begin</span>}
                </div>
              </LayoutGroup>
              <p className="mt-3 text-[12px] text-[#faf5ec]/50">All durations are approximate and include a few minutes to settle in. The team will confirm timings when you book.</p>
            </div>
          </div>
          <div className="text-center">
            <Ring pct={pct} />
            <Magnetic><a href="#book" data-svc={chosen.length ? chosen.map(t => t.n).join(' + ') : 'Manicure'} data-cursor="Book" className="mt-10 inline-flex h-14 items-center gap-3 rounded-full px-8 text-[15px] font-semibold text-[#3a1830] shadow-[0_20px_50px_-18px_rgba(231,207,168,.7)]" style={{ background: 'linear-gradient(100deg,#f7e3cc,#e7cfa8,#c98f7a)' }}>Book this pamper <ArrowRight size={18} /></a></Magnetic>
          </div>
        </div>
      </div>
    </motion.section>
  )
}

function Stats() {
  return (
    <section className="px-6 pb-28 md:px-10" style={{ background: PL }}>
      <div className="mx-auto grid max-w-[1320px] gap-5 md:grid-cols-[1.3fr_1fr_1fr]">
        <SlowFade className="overflow-hidden rounded-[28px] text-[#3a1830]"><div className="h-full p-10" style={{ background: 'linear-gradient(140deg,#faf5ec,#ead2b0)' }}><p className={`${D} text-[clamp(30px,3vw,44px)] leading-[1.1]`}>Rated <b className={`${NUM} text-[#8e5547]`}>{b.rating}</b> <b className="font-normal text-[#8e5547]">out of 5</b> by people who've sat in our chairs.</p><p className="mt-5 flex text-[#b9786a]">{[0, 1, 2, 3, 4].map(k => <Star key={k} size={18} fill="currentColor" />)}</p></div></SlowFade>
        <SlowFade delay={.15} className="rounded-[28px] p-10 ring-1 ring-white/15"><span className={`${NUM} block text-[88px] leading-none text-[#faf5ec]`}><Counter to={b.rev} /></span><span className="text-[#e7cfa8]">Google reviews</span></SlowFade>
        <SlowFade delay={.3} className="rounded-[28px] p-10 ring-1 ring-white/15"><span className={`${NUM} block text-[88px] leading-none text-[#faf5ec]`}>6</span><span className="text-[#e7cfa8]">ways to be pampered</span></SlowFade>
      </div>
    </section>
  )
}

function Book() {
  const bk = useBooking()
  const f = 'h-14 w-full border-0 border-b border-[#3a1830]/20 bg-transparent text-[18px] text-[#3a1830] outline-none placeholder:text-[#3a1830]/35 focus:border-[#b9786a]'
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 40%'] })
  const bg = useTransform(scrollYProgress, [0, 1], [PL, IV])
  return (
    <motion.section ref={ref} id="book" style={{ background: bg }} className="relative overflow-hidden px-6 py-28 md:px-10">
      <div className="mx-auto grid max-w-[1240px] gap-14 md:grid-cols-[.9fr_1.1fr]">
        <SlowFade>
          <p className="mb-5 text-[12px] font-semibold uppercase tracking-[.32em] text-[#8e5547]">Reserve your time</p>
          <h2 className={`${D} text-[clamp(50px,6.4vw,100px)] leading-[.9] text-[#3a1830]`}>Your chair<br />is waiting.</h2>
          <p className="mb-8 mt-6 max-w-[380px] text-[#5a3a48]">Leave your name and number — we'll call or message you on WhatsApp to find a time that suits.</p>
          <a href={'tel:' + tel(b.phone)} className={`${NUM} text-[clamp(28px,3vw,38px)] text-[#3a1830]`}>{b.phone}</a>
        </SlowFade>
        <Fold className="rounded-[32px] bg-white/70 p-8 shadow-[0_40px_90px_-40px_rgba(58,24,48,.45)] ring-1 ring-[#3a1830]/10 backdrop-blur md:p-12">
          <AnimatePresence mode="wait">
            {!bk.s.sent ? (
              <motion.form key="f" exit={{ opacity: 0, filter: 'blur(12px)' }} transition={{ duration: .6 }} onSubmit={bk.submit} noValidate className="grid gap-6">
                <input className={f} placeholder="Your name" value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} autoComplete="name" />
                <motion.input animate={bk.s.err ? { x: [0, -8, 8, -6, 6, 0] } : {}} className={f + (bk.s.err ? ' !border-red-500' : '')} type="tel" inputMode="tel" placeholder="+44 7___ ______" value={bk.s.phone} onFocus={phoneFocus(bk, '+44 ')} onChange={e => bk.upd('phone', e.target.value)} autoComplete="tel" />
                {bk.s.err && <p className="-mt-3 text-[13px] text-red-600">Please check your number — it looks a little short.</p>}
                <div>
                  <p className="mb-3 text-[12px] uppercase tracking-[.2em] text-[#8e5547]">Treatment</p>
                  <div className="flex flex-wrap gap-2">{SV.map(s => s[0]).map(t => <button type="button" key={t} onClick={() => bk.upd('svc', t)} className={`rounded-full px-4 py-2 text-[13px] font-semibold transition-colors duration-500 ${bk.s.svc === t ? 'bg-[#3a1830] text-[#faf5ec]' : 'bg-[#3a1830]/[.06] text-[#3a1830] hover:bg-[#3a1830]/10'}`}>{t}</button>)}</div>
                  <AnimatePresence>{bk.s.svc && !SV.some(s => s[0] === bk.s.svc) && <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4 rounded-2xl bg-[#e7cfa8]/40 px-4 py-3 text-[14px] text-[#3a1830]">Your pamper: <b>{bk.s.svc}</b></motion.p>}</AnimatePresence>
                </div>
                <button disabled={bk.s.loading} className="mt-2 h-16 rounded-full bg-[#3a1830] text-[16px] font-semibold tracking-wide text-[#faf5ec] transition-[scale,opacity] active:scale-[.98] disabled:opacity-60">{bk.s.loading ? 'Warming the water…' : 'Request my visit'}</button>
                <p className="text-[13px] text-[#5a3a48]/70">In the finished site this request goes straight to your phone/Telegram.</p>
              </motion.form>
            ) : (
              <motion.div key="ok" initial={{ opacity: 0, filter: 'blur(14px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} transition={{ duration: 1 }} className="grid min-h-[380px] place-items-center text-center text-[#3a1830]">
                <div><CheckDraw className="mx-auto mb-5 text-[#b9786a]" /><h3 className={`${D} text-[44px]`}>Breathe out.</h3><p className="mx-auto mb-5 max-w-[340px] text-[#5a3a48]">Request received. In the finished site this request goes straight to your phone/Telegram.</p><button onClick={bk.reset} className="font-semibold underline underline-offset-4">Make another request</button></div>
              </motion.div>
            )}
          </AnimatePresence>
        </Fold>
      </div>
    </motion.section>
  )
}

function Contact() {
  return (
    <section id="contact" className="px-6 pb-28 md:px-10" style={{ background: IV }}>
      <div className="mx-auto grid max-w-[1320px] gap-6 md:grid-cols-[.9fr_1.1fr]">
        <SlowFade className="grid content-start gap-6 text-[#3a1830]">
          <h2 className={`${D} text-[clamp(50px,7vw,104px)] leading-[.9]`}>Visit us</h2>
          <p className="flex items-start gap-3 text-[22px]"><MapPin className="mt-1 shrink-0 text-[#b9786a]" />{b.addr}</p>
          <a href={'tel:' + tel(b.phone)} className={`${NUM} flex items-center gap-3 text-[clamp(28px,3vw,38px)]`}><Phone className="text-[#b9786a]" />{b.phone}</a>
          <div className="flex flex-wrap gap-3">
            <Magnetic><a href={waLink(b.phone)} target="_blank" rel="noopener" className="inline-flex h-14 items-center gap-2 rounded-full bg-[#3a1830] px-7 font-semibold text-[#faf5ec]"><WA /> WhatsApp us</a></Magnetic>
            <a href={'tel:' + tel(b.phone)} className="inline-flex h-14 items-center gap-2 rounded-full px-7 font-semibold ring-1 ring-[#3a1830]/25 hover:bg-white"><Phone size={16} /> Call</a>
          </div>
        </SlowFade>
        <Fold className="h-[420px] overflow-hidden rounded-[32px] shadow-[0_30px_70px_-40px_rgba(58,24,48,.5)]"><GMap q={`${b.name}, ${b.addr}`} /></Fold>
      </div>
    </section>
  )
}

function App() {
  useSmooth()
  const lite = useLite()
  return (
    <MotionConfig reducedMotion="user">
      <div className="font-['Mulish',sans-serif] text-[#3a1830]" style={{ background: IV, '--sel': RG, '--selc': '#fff' }}>
        <Intro bg={PL} fg={IV} duration={1.7}>
          <div className="text-center"><motion.span initial={{ opacity: 0, letterSpacing: '.8em', filter: 'blur(10px)' }} animate={{ opacity: 1, letterSpacing: '.2em', filter: 'blur(0px)' }} transition={{ duration: 1.2 }} className={`${D} block text-[44px] md:text-[64px]`}>LUXURY</motion.span><span className="text-[12px] uppercase tracking-[.4em] text-[#e7cfa8]">nails & spa</span></div>
        </Intro>
        <Progress color={RG} />
        <Cursor color={RG} blend="normal" textColor="#fff" />
        <Ribbon lang="en" name={b.name} bg={PL} fg={IV} />
        <header className="sticky top-0 z-40 bg-[#faf5ec]/70 backdrop-blur-xl">
          <div className="mx-auto flex h-[70px] max-w-[1320px] items-center justify-between px-6 md:px-10">
            <a href="#top" className="leading-none"><span className={`${D} block text-[26px] tracking-[.12em]`}>LUXURY</span><span className="text-[10px] uppercase tracking-[.38em] text-[#8e5547]">nails & spa</span></a>
            <nav className="hidden gap-9 text-[14px] text-[#5a3a48] md:flex">{[['#services', 'Treatments'], ['#pamper', 'Pamper builder'], ['#book', 'Book'], ['#contact', 'Visit']].map(([h, t]) => <a key={h} href={h} className="hover:text-[#3a1830]">{t}</a>)}</nav>
            <a href="#book" className="hidden h-11 items-center rounded-full bg-[#3a1830] px-6 text-[14px] font-semibold text-[#faf5ec] sm:inline-flex">Book</a>
          </div>
        </header>
        <main id="top">
          <Hero lite={lite} />
          <Intro2 />
          <Services />
          <Pamper />
          <Stats />
          <Book />
          <Contact />
        </main>
        <footer className="border-t border-[#3a1830]/10 px-6 py-10 text-[14px] text-[#5a3a48]/80 md:px-10" style={{ background: IV }}><div className="mx-auto flex max-w-[1320px] flex-wrap justify-between gap-4"><span>© 2026 {b.name} · Website concept by Artem</span><span>{b.addr}</span></div></footer>
        <CallBar lang="en" phone={b.phone} barCls="bg-[#faf5ec]/85 backdrop-blur-xl" callCls="rounded-full bg-white text-[#3a1830] ring-1 ring-[#3a1830]/15" bookCls="rounded-full text-[#faf5ec] bg-[#3a1830]" />
        <div className="h-[72px] sm:hidden" />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
