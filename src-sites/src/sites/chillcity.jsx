import React, { useRef, useState, useEffect, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, useInView, useAnimationFrame, AnimatePresence, MotionConfig } from 'framer-motion'
import { ArrowUpRight, Phone, MapPin, Play, Pause, Volume2, VolumeX, Star, TrainFront } from 'lucide-react'
import '../lib/base.css'
import { LineReveal, useSmooth, Ribbon, SplitText, ScrollWords, Reveal, Magnetic, Cursor, Marquee, Counter, useBooking, phoneFocus, CheckDraw, GMap, CallBar, Progress, Intro, tel, useLite, WA, waLink } from '../lib/kit'
import { subscribe, toggle, setMuted, freq, level, CHORDS } from './chillcity-audio'

const City = lazy(() => import('./chillcity3d'))
const b = {
  name: 'Chill City Nails', short: 'chill city',
  addr: '32 Stephenson St, Birmingham B2 4BH', near: 'A minute from New Street station',
  phone: '+44 7785 295516', rating: 4.4, rev: 292,
}
const PEACH = '#ffb38a', PINK = '#ff6f9c', TEAL = '#4ff0d8', DUSK = '#2a1740', INK = '#160c22'
const grad = `linear-gradient(100deg, ${PEACH}, ${PINK} 45%, ${TEAL})`
const D = "font-['Righteous',sans-serif]", M = "font-['VT323',monospace]"
const SV = [
  ['A1', 'Classic manicure', 'Shape, cuticle care and a neat polish. The ten-minute walk from the office, sorted.'],
  ['A2', 'Gel polish', 'Glossy colour that keeps its shine for weeks — for hands that type all day.'],
  ['A3', 'BIAB & builder gel', 'A strengthening layer over your natural nails for a clean, healthy look.'],
  ['B1', 'Acrylic extensions', 'Length and shape of your choice: square, almond, coffin and more.'],
  ['B2', 'Pedicure', 'Feet soaked, filed and polished. Sandal-ready in one sitting.'],
  ['B3', 'Nail art', 'From a single accent nail to chrome, French tips and hand-painted detail.'],
]
const TIMES = ['Lunch break', 'After work', 'Weekend']

function useChill() { const [s, set] = useState({ on: false, muted: false, chord: 0 }); useEffect(() => subscribe(set), []); return s }

/* VHS-soft reveal: blur + hue shift + skew settles like a tape locking in */
function VHS({ children, className = '', delay = 0 }) {
  return (
    <motion.div className={'relative ' + className}
      initial={{ opacity: 0, filter: 'blur(14px) saturate(2.2) hue-rotate(50deg)', x: -16, skewX: 10 }}
      whileInView={{ opacity: 1, filter: 'blur(0px) saturate(1) hue-rotate(0deg)', x: 0, skewX: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }} transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay }}>
      {children}
      <motion.span aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: 'repeating-linear-gradient(0deg, rgba(255,255,255,.14) 0 1px, transparent 1px 4px)' }}
        initial={{ opacity: 1 }} whileInView={{ opacity: 0 }} viewport={{ once: true }} transition={{ duration: 1.4, delay: delay + 0.2 }} />
    </motion.div>
  )
}

function ChillPill({ s }) {
  return (
    <button onClick={toggle} data-cursor={s.on ? 'Pause' : 'Play'} aria-pressed={s.on} className={`${M} relative inline-flex h-10 items-center gap-2 rounded-full px-4 text-[20px] leading-none ring-1 transition-colors ${s.on ? 'bg-[#4ff0d8] text-[#160c22] ring-[#4ff0d8]' : 'text-white ring-white/30 hover:ring-white'}`}>
      {s.on ? <Pause size={14} /> : <Play size={14} />} chill mode
      {s.on && <span className="absolute -right-1 -top-1 h-3 w-3 animate-ping rounded-full bg-[#ffb38a]" />}
    </button>
  )
}

function Hero({ s }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '35%'])
  const o = useTransform(scrollYProgress, [0, .7], [1, 0])
  const blur = useTransform(scrollYProgress, [0, .8], ['blur(0px)', 'blur(10px)'])
  return (
    <section ref={ref} className="relative h-[100svh] min-h-[640px] overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(22,12,34,.55), rgba(22,12,34,0) 60%)' }} />
      <motion.div style={{ y, opacity: o, filter: blur }} className="relative z-10 mx-auto flex h-full max-w-[1320px] flex-col justify-start px-6 pt-[13vh] md:justify-center md:px-10 md:pt-0">
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5 }} className={`${M} mb-5 flex items-center gap-2 text-[22px] leading-none text-[#ffd9c2]`}>
          <TrainFront size={16} /> 1 min from New Street
        </motion.p>
        <h1 className={`${D} text-[clamp(54px,11vw,180px)] leading-[.86] tracking-[-.01em] text-white`} style={{ textShadow: '0 10px 60px rgba(42,23,64,.5)' }}>
          <SplitText text="Clock off." delay={1.3} stagger={.04} className="block" />
          <LineReveal delay={1.65} className="pr-[.05em]"><span className="bg-clip-text text-transparent [background-image:var(--g)]" style={{ '--g': grad, textShadow: 'none' }}>Chill on.</span></LineReveal>
        </h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }} className="mt-7 max-w-[470px] text-[17px] leading-relaxed text-white/85">
          A nail bar for the city's slow hour. Manicures, gel, extensions and nail art in the heart of Birmingham — then back out into the evening.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.2 }} className="mt-9 flex flex-wrap items-center gap-3">
          <Magnetic><a href="#book" data-cursor="Book" className="inline-flex h-14 items-center gap-2 rounded-full px-8 text-[16px] font-bold text-[#160c22] shadow-[0_18px_50px_-14px_rgba(255,111,156,.9)]" style={{ background: grad }}>Book a slot <ArrowUpRight size={18} /></a></Magnetic>
          <a href={waLink(b.phone)} target="_blank" rel="noopener" className="inline-flex h-14 items-center gap-2 rounded-full bg-white/10 px-6 font-semibold text-white ring-1 ring-white/25 backdrop-blur hover:bg-white/20"><WA /> WhatsApp</a>
          <ChillPill s={s} />
        </motion.div>
        <motion.a href="https://www.google.com/maps/search/?api=1&query=Chill+City+Nails+32+Stephenson+St+Birmingham" target="_blank" rel="noopener" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }} className="mt-8 inline-flex w-fit items-center gap-2 text-[14px] text-white/80">
          <span className="flex text-[#ffb38a]">{[0, 1, 2, 3, 4].map(k => <Star key={k} size={14} fill="currentColor" />)}</span><b className="text-white">{b.rating}</b> on Google · {b.rev} reviews
        </motion.a>
      </motion.div>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3 }} className={`${M} absolute bottom-6 right-6 z-10 text-[20px] text-white/70 md:right-10`}>scroll — the sun goes down ↓</motion.p>
    </section>
  )
}

function Dusk() {
  return (
    <section className="relative flex min-h-[110vh] items-center px-6 md:px-10">
      <div className="mx-auto w-full max-w-[1100px]">
        <p className={`${M} mb-6 text-[22px] text-[#4ff0d8]`}>// 17:42, somewhere near platform 5</p>
        <ScrollWords dim={.18} className={`${D} text-[clamp(32px,5.4vw,80px)] leading-[1.05] text-white [text-shadow:0_6px_40px_rgba(0,0,0,.45)]`}
          text="Between the last meeting and the train home there's an hour that belongs to you. Spend it with your feet up and your hands in good company." />
      </div>
    </section>
  )
}

function Services({ bg }) {
  return (
    <motion.section id="services" style={{ background: bg }} className="relative overflow-hidden px-6 py-28 md:px-10">
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <VHS><p className={`${M} mb-2 text-[22px] text-[#ffb38a]`}>side A / side B</p><h2 className={`${D} text-[clamp(48px,7.5vw,120px)] leading-[.9] text-white`}>The tracklist</h2></VHS>
          <p className="max-w-[330px] text-white/60">Six things we do best. Tap a track to drop it into your booking — the team will confirm details when they call back.</p>
        </div>
        <div className="border-t border-white/15">
          {SV.map(([n, t, d], k) => (
            <VHS key={t} delay={k * .07}>
              <a href="#book" data-svc={t} data-cursor="Add" className="group relative grid grid-cols-[48px_1fr] items-center gap-x-5 gap-y-2 overflow-hidden border-b border-white/15 py-7 md:grid-cols-[80px_1.1fr_1fr_40px]">
                <span className="absolute inset-0 origin-left scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100" style={{ background: 'linear-gradient(90deg, rgba(255,179,138,.16), rgba(79,240,216,.08))' }} />
                <span className={`${M} relative text-[24px] text-[#4ff0d8]`}>{n}</span>
                <h3 className={`${D} relative text-[clamp(28px,3.6vw,54px)] leading-none text-white transition-transform duration-500 group-hover:translate-x-3`}>{t}</h3>
                <p className="relative col-start-2 text-white/60 md:col-start-auto">{d}</p>
                <span className="relative hidden h-10 w-10 place-items-center rounded-full ring-1 ring-white/25 transition-colors group-hover:bg-white group-hover:text-[#160c22] md:grid"><Play size={14} /></span>
              </a>
            </VHS>
          ))}
        </div>
      </div>
    </motion.section>
  )
}

function Slat({ i, n, p, bg }) {
  const sy = useTransform(p, [i / n * .35, .55 + i / n * .35], [1, 0])
  return <motion.div className="absolute inset-x-0 origin-top" style={{ top: `${i / n * 100}%`, height: `${100 / n + .3}%`, scaleY: sy, background: bg }} />
}

function EQ() {
  const bars = useRef([])
  useAnimationFrame(() => {
    const f = freq()
    bars.current.forEach((el, k) => { if (!el) return; const v = f ? f[2 + k * 2] / 255 : .06 + Math.sin(performance.now() / 600 + k) * .03; el.style.transform = `scaleY(${Math.max(.04, v)})` })
  })
  return <div aria-hidden="true" className="flex h-24 items-end gap-[5px]">{Array.from({ length: 24 }).map((_, k) => <span key={k} ref={el => (bars.current[k] = el)} className="block h-full w-[6px] origin-bottom rounded-full md:w-2" style={{ background: grad, transform: 'scaleY(.05)' }} />)}</div>
}

function ChillMode({ s, bg }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start start'] })
  const glow = useRef(null)
  useAnimationFrame(() => { if (glow.current) glow.current.style.transform = `scale(${1 + level.v * .5})` })
  return (
    <section ref={ref} id="chill" className="relative min-h-[100svh] overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">{Array.from({ length: 9 }).map((_, i) => <Slat key={i} i={i} n={9} p={scrollYProgress} bg={bg} />)}</div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(13,8,24,.1), rgba(13,8,24,.55) 70%, rgba(13,8,24,.85))' }} />
      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1320px] flex-col items-center justify-center px-6 py-24 text-center md:px-10">
        <p className={`${M} mb-4 text-[22px] text-[#4ff0d8]`}>the signature toy</p>
        <h2 className={`${D} max-w-[900px] text-[clamp(44px,7vw,112px)] leading-[.92] text-white`}>Press play. <span className="text-[#ffb38a]">Watch the city breathe.</span></h2>
        <p className="mt-6 max-w-[520px] text-white/75">Chill mode plays a soft lo-fi chord loop, made live in your browser, and every window in the skyline pulses along. No autoplay — it only starts when you press the button.</p>
        <div className="relative mt-12 grid place-items-center">
          <span ref={glow} aria-hidden="true" className="absolute h-44 w-44 rounded-full opacity-60 blur-2xl" style={{ background: grad }} />
          <Magnetic strength={.25}>
            <button onClick={toggle} data-cursor={s.on ? 'Pause' : 'Play'} aria-pressed={s.on} aria-label={s.on ? 'Pause chill mode' : 'Start chill mode'} className="relative grid h-36 w-36 place-items-center rounded-full bg-[#160c22] text-white ring-2 ring-white/30 transition-[scale] active:scale-95">
              <span className="absolute inset-[6px] rounded-full ring-1 ring-white/10" style={{ background: 'repeating-radial-gradient(circle, rgba(255,255,255,.06) 0 1px, transparent 1px 5px)' }} />
              <motion.span animate={{ rotate: s.on ? 360 : 0 }} transition={s.on ? { duration: 3.3, repeat: Infinity, ease: 'linear' } : { duration: .6 }} className="absolute h-10 w-10 rounded-full" style={{ background: grad }} />
              <span className="relative text-[#160c22]">{s.on ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" className="translate-x-[1px]" />}</span>
            </button>
          </Magnetic>
        </div>
        <div className="mt-10 flex flex-col items-center gap-5">
          <EQ />
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className={`${M} inline-flex h-10 items-center gap-2 rounded-full bg-white/10 px-4 text-[20px] text-white ring-1 ring-white/15`}>
              <span className={`h-2 w-2 rounded-full ${s.on ? 'animate-pulse bg-[#4ff0d8]' : 'bg-white/30'}`} />
              {s.on ? <>now playing · <AnimatePresence mode="wait"><motion.b key={s.chord} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="font-normal text-[#ffb38a]">{CHORDS[s.chord][0]}</motion.b></AnimatePresence></> : 'tape paused'}
            </span>
            {s.on && <button onClick={() => setMuted(!s.muted)} className={`${M} inline-flex h-10 items-center gap-2 rounded-full bg-white/10 px-4 text-[20px] text-white ring-1 ring-white/15 hover:bg-white/20`} aria-pressed={s.muted}>{s.muted ? <VolumeX size={16} /> : <Volume2 size={16} />}{s.muted ? 'unmute' : 'mute'}</button>}
          </div>
        </div>
      </div>
    </section>
  )
}

function Stats({ bg }) {
  const items = [
    [<><span>{b.rating}</span><Star className="inline-block -translate-y-2 md:-translate-y-4" size={'0.45em'} fill="currentColor" /></>, 'average rating on Google'],
    [<Counter to={b.rev} />, 'reviews from real visitors'],
    [<>1<span className="text-[.5em]"> min</span></>, 'walk from New Street'],
  ]
  return (
    <motion.section style={{ background: bg }} className="px-6 py-24 md:px-10">
      <div className="mx-auto grid max-w-[1320px] gap-px overflow-hidden rounded-[28px] bg-white/10 md:grid-cols-3">
        {items.map(([n, t], k) => (
          <VHS key={k} delay={k * .1} className="bg-[#160c22]/70 p-10">
            <span className={`${D} block bg-clip-text text-[clamp(72px,8vw,120px)] leading-none text-transparent`} style={{ backgroundImage: grad }}>{n}</span>
            <span className={`${M} text-[22px] text-white/70`}>{t}</span>
          </VHS>
        ))}
      </div>
    </motion.section>
  )
}

function Book({ bg }) {
  const bk = useBooking()
  const [time, setTime] = useState('After work')
  const f = 'h-14 w-full rounded-2xl bg-white/[.07] px-5 text-[17px] text-white outline-none ring-1 ring-white/15 placeholder:text-white/40 focus:ring-2 focus:ring-[#4ff0d8]'
  return (
    <motion.section id="book" style={{ background: bg }} className="relative overflow-hidden px-6 py-28 md:px-10">
      <motion.div initial={{ clipPath: 'inset(100% 0% 0% 0% round 40px)' }} whileInView={{ clipPath: 'inset(0% 0% 0% 0% round 40px)' }} viewport={{ once: true, margin: '0px 0px -15% 0px' }} transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
        className="relative mx-auto grid max-w-[1240px] gap-12 overflow-hidden rounded-[40px] p-8 md:grid-cols-2 md:p-14" style={{ background: 'linear-gradient(160deg, #3a1d52, #1d1030 60%, #0f2a33)' }}>
        <span aria-hidden="true" className="absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-50 blur-[90px]" style={{ background: PINK }} />
        <span aria-hidden="true" className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full opacity-40 blur-[90px]" style={{ background: TEAL }} />
        <div className="relative text-white">
          <p className={`${M} mb-3 text-[22px] text-[#4ff0d8]`}>book your slow hour</p>
          <h2 className={`${D} text-[clamp(46px,6vw,96px)] leading-[.9]`}>Save me<br />a seat.</h2>
          <p className="mb-8 mt-6 max-w-[400px] text-white/70">Leave your number and when suits you — we'll call or WhatsApp back with the nearest free time.</p>
          <a href={'tel:' + tel(b.phone)} className={`${D} text-[clamp(28px,3vw,38px)]`}>{b.phone}</a>
        </div>
        <div className="relative">
          <AnimatePresence mode="wait">
            {!bk.s.sent ? (
              <motion.form key="f" exit={{ opacity: 0, filter: 'blur(10px)' }} onSubmit={bk.submit} noValidate className="grid gap-4">
                <input className={f} placeholder="Your name" value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} autoComplete="name" />
                <motion.input animate={bk.s.err ? { x: [0, -8, 8, -6, 6, 0] } : {}} className={f + (bk.s.err ? ' !ring-2 !ring-red-400' : '')} type="tel" inputMode="tel" placeholder="+44 7___ ______" value={bk.s.phone} onFocus={phoneFocus(bk, '+44 ')} onChange={e => bk.upd('phone', e.target.value)} autoComplete="tel" />
                {bk.s.err && <p className="-mt-2 text-[13px] text-red-300">Please check the number — it looks a little short.</p>}
                <p className={`${M} mt-2 text-[20px] text-white/60`}>what for?</p>
                <div className="flex flex-wrap gap-2">{SV.map(x => x[1]).map(t => <button type="button" key={t} onClick={() => bk.upd('svc', t)} className={`rounded-full px-4 py-2 text-[13px] font-semibold transition-colors ${bk.s.svc === t ? 'bg-[#ffb38a] text-[#160c22]' : 'bg-white/10 text-white/80 hover:bg-white/20'}`}>{t}</button>)}</div>
                <p className={`${M} mt-2 text-[20px] text-white/60`}>when suits?</p>
                <div className="grid grid-cols-3 gap-2">{TIMES.map(t => <button type="button" key={t} onClick={() => setTime(t)} className={`rounded-2xl px-2 py-3 text-[13px] font-semibold transition-colors ${time === t ? 'bg-[#4ff0d8] text-[#160c22]' : 'bg-white/10 text-white/80 hover:bg-white/20'}`}>{t}</button>)}</div>
                <button disabled={bk.s.loading} className="mt-3 h-16 rounded-2xl text-[17px] font-bold text-[#160c22] transition-[scale,opacity] active:scale-[.97] disabled:opacity-60" style={{ background: grad }}>{bk.s.loading ? 'Rewinding the tape…' : 'Request a slot'}</button>
                <p className="text-[13px] text-white/50">In the finished site this request goes straight to your phone/Telegram.</p>
              </motion.form>
            ) : (
              <motion.div key="ok" initial={{ opacity: 0, filter: 'blur(14px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} className="grid min-h-[380px] place-items-center text-center text-white">
                <div><CheckDraw className="mx-auto mb-5 text-[#4ff0d8]" /><h3 className={`${D} text-[40px]`}>You're on the list.</h3><p className="mx-auto mb-5 max-w-[340px] text-white/70">{bk.s.svc || 'Your visit'} · {time.toLowerCase()}. In the finished site this request goes straight to your phone/Telegram.</p><button onClick={bk.reset} className="font-semibold underline underline-offset-4">Book another</button></div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.section>
  )
}

function Contact({ bg }) {
  return (
    <motion.section id="contact" style={{ background: bg }} className="px-6 pb-28 pt-10 md:px-10">
      <div className="mx-auto grid max-w-[1320px] gap-6 md:grid-cols-[.9fr_1.1fr]">
        <VHS className="grid content-start gap-6 text-white">
          <h2 className={`${D} text-[clamp(48px,7vw,104px)] leading-[.9]`}>Find us<br /><span className="bg-clip-text text-transparent" style={{ backgroundImage: grad }}>downtown</span></h2>
          <p className="flex items-start gap-3 text-[22px] font-semibold"><MapPin className="mt-1 shrink-0 text-[#ffb38a]" />{b.addr}</p>
          <p className={`${M} -mt-3 flex items-center gap-2 pl-9 text-[22px] text-[#4ff0d8]`}><TrainFront size={16} />{b.near}</p>
          <a href={'tel:' + tel(b.phone)} className={`${D} flex items-center gap-3 text-[clamp(28px,3vw,40px)]`}><Phone className="text-[#ffb38a]" />{b.phone}</a>
          <div className="flex flex-wrap gap-3">
            <Magnetic><a href={waLink(b.phone)} target="_blank" rel="noopener" className="inline-flex h-14 items-center gap-2 rounded-full bg-[#25d366] px-7 font-bold text-[#0b2a17]"><WA /> Message on WhatsApp</a></Magnetic>
            <a href={'tel:' + tel(b.phone)} className="inline-flex h-14 items-center gap-2 rounded-full px-7 font-bold text-white ring-1 ring-white/30 hover:bg-white/10"><Phone size={16} /> Call</a>
          </div>
        </VHS>
        <Reveal delay={.1} className="h-[420px] overflow-hidden rounded-[32px] ring-1 ring-white/10"><GMap q={`${b.name}, ${b.addr}`} dark /></Reveal>
      </div>
    </motion.section>
  )
}

function LiteSky() {
  const { scrollY } = useScroll()
  const o = useTransform(scrollY, v => Math.min(1, v / (innerHeight * 1.5)))
  const windows = Array.from({ length: 90 }, (_, i) => [((i * 53) % 100), 78 + ((i * 29) % 18)])
  return (
    <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg,#3e1f6b 0%,#f0758c 55%,#ffc999 75%,#5a3460 76%)' }}>
      <motion.div className="absolute inset-0" style={{ opacity: o, background: 'linear-gradient(180deg,#05040f 0%,#1f1240 60%,#3a1c4a 75%,#0d0818 76%)' }} />
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <path d="M0 100V78h6v-8h5v12h4V66h7v10h5v-6h6v14h5V60h8v18h4v-9h6v11h5V72h7v-8h5v16h6V68h7v32Z" fill="#1a0e2a" />
        {windows.map(([x, y], k) => <rect key={k} x={x} y={y} width=".8" height="1.2" fill={k % 7 ? '#ffc987' : '#4ff0d8'} opacity={.8} />)}
      </svg>
    </div>
  )
}

function App() {
  useSmooth()
  const lite = useLite()
  const s = useChill()
  const { scrollYProgress } = useScroll()
  const bg = useTransform(scrollYProgress, [0, .3, .45, .6, .78, 1], ['#2a1740', '#2a1740', '#3b1a4a', '#122a36', '#2d1438', '#160c22'])
  const heroRef = useRef(null), duskRef = useRef(null), chillRef = useRef(null)
  const v1 = useInView(heroRef), v2 = useInView(duskRef), v3 = useInView(chillRef)
  return (
    <MotionConfig reducedMotion="user">
      <div className="relative font-['Outfit',sans-serif] text-white" style={{ background: INK, '--sel': PINK, '--selc': '#fff' }}>
        <Intro bg={DUSK} fg="#fff" duration={1.5}>
          <div className="grid place-items-center gap-4">
            <div className="relative h-28 w-28 overflow-hidden rounded-full" style={{ background: `linear-gradient(180deg, #ffe0a0, ${PINK})` }}>{[0, 1, 2, 3].map(k => <motion.span key={k} className="absolute inset-x-0 bg-[#2a1740]" style={{ top: `${58 + k * 11}%` }} initial={{ height: 0 }} animate={{ height: 3 + k * 2 }} transition={{ delay: .2 + k * .12 }} />)}</div>
            <span className={`${D} text-[40px]`}>chill city</span>
          </div>
        </Intro>
        <Progress color={TEAL} />
        <Cursor color={PEACH} blend="normal" textColor={INK} />
        <div className="fixed inset-0 z-0">{!lite ? <Suspense fallback={<LiteSky />}><City active={v1 || v2 || v3} /></Suspense> : <LiteSky />}</div>
        <div className="relative z-10">
          <Ribbon lang="en" name={b.name} bg="#ffb38a" fg={INK} />
          <header className="sticky top-0 z-40 border-b border-white/10 bg-[#160c22]/35 backdrop-blur-xl">
            <div className="mx-auto flex h-[68px] max-w-[1320px] items-center justify-between gap-3 px-5 md:px-10">
              <a href="#top" className={`${D} flex items-center gap-2 text-[24px] text-white`}><span className="h-6 w-6 rounded-full" style={{ background: `linear-gradient(180deg,#ffe0a0,${PINK})`, boxShadow: `0 0 18px ${PINK}` }} />chill city</a>
              <nav className="hidden gap-8 text-[15px] text-white/75 md:flex">{[['#services', 'Tracklist'], ['#chill', 'Chill mode'], ['#book', 'Book'], ['#contact', 'Find us']].map(([h, t]) => <a key={h} href={h} className="hover:text-white">{t}</a>)}</nav>
              <div className="flex items-center gap-2"><ChillPill s={s} /><a href="#book" className="hidden h-10 items-center rounded-full bg-white px-5 text-[14px] font-bold text-[#160c22] sm:inline-flex">Book</a></div>
            </div>
          </header>
          <main id="top">
            <div ref={heroRef}><Hero s={s} /></div>
            <div ref={duskRef}><Dusk /></div>
            <motion.div style={{ background: bg }} className="py-7">
              <Marquee base={-2} className="py-2">{['manicure', 'gel', 'BIAB', 'pedicure', 'nail art', 'extensions'].map(t => <span key={t} className={`${D} mx-6 inline-flex items-center gap-12 text-[clamp(38px,5vw,72px)] text-transparent [-webkit-text-stroke:1.5px_#ffb38a]`}>{t}<span className="inline-block h-3 w-3 rounded-full bg-[#4ff0d8] shadow-[0_0_14px_#4ff0d8]" /></span>)}</Marquee>
            </motion.div>
            <Services bg={bg} />
            <div ref={chillRef}><ChillMode s={s} bg={bg} /></div>
            <Stats bg={bg} />
            <Book bg={bg} />
            <Contact bg={bg} />
          </main>
          <motion.footer style={{ background: bg }} className="border-t border-white/10 px-6 py-10 text-[14px] text-white/55 md:px-10"><div className="mx-auto flex max-w-[1320px] flex-wrap justify-between gap-4"><span>© 2026 {b.name} · Website concept by Artem</span><span>{b.addr}</span></div></motion.footer>
          <CallBar lang="en" phone={b.phone} barCls="bg-[#160c22]/80 backdrop-blur-xl" callCls="rounded-2xl bg-white/10 text-white ring-1 ring-white/20" bookCls="rounded-2xl text-[#160c22] bg-[#ffb38a]" />
          <motion.div style={{ background: bg }} className="h-[72px] sm:hidden" />
        </div>
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
