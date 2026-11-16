import React, { useRef, useState, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, useSpring, useMotionTemplate, AnimatePresence, MotionConfig } from 'framer-motion'
import { ArrowRight, Phone, MapPin, Star, Droplets, Armchair, Sparkles, ShieldCheck, Disc3, SprayCan, MoveHorizontal } from 'lucide-react'
import '../lib/base.css'
import { LineReveal, useSmooth, Ribbon, SplitText, ScrollWords, Reveal, Magnetic, Cursor, Marquee, Counter, useBooking, phoneFocus, CheckDraw, GMap, CallBar, Progress, Intro, tel, useLite, WA, waLink } from '../lib/kit'

const Car3D = lazy(() => import('./mbvalets3d'))

const b = {
  name: 'MB Valets',
  addr: 'Bletchley Ave, Horsforth, Leeds LS18 4FA',
  phone: '+44 7914 840733',
  fb: 'https://www.facebook.com/profile.php?id=61550820364923',
  rating: '5.0', rev: 70,
}
const G = '#15171b', G2 = '#22252b', BL = '#2f6bff', BL2 = '#8fb6ff', W = '#f3f4f6'
const grad = `linear-gradient(100deg, #ffffff 10%, ${BL2} 45%, ${BL} 90%)`
const H = "font-['Syne',sans-serif]"
const FB = p => (<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" {...p}><path d="M13.5 22v-8h2.7l.4-3.2h-3.1V8.8c0-.9.3-1.5 1.6-1.5h1.7V4.4c-.3 0-1.3-.1-2.5-.1-2.4 0-4.1 1.5-4.1 4.2v2.3H7.5V14h2.7v8h3.3Z" /></svg>)
const GRIME = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.035' numOctaves='4' seed='7'/><feColorMatrix values='0 0 0 0 .42  0 0 0 0 .37  0 0 0 0 .3  0 0 0 1.4 -.35'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")"

const SV = [
  ['Exterior valet', 'Snow foam, two-bucket hand wash, wheels, glass and a streak-free dry.', Droplets],
  ['Interior deep clean', 'Vacuum, upholstery and carpets, plastics, vents and door shuts.', Armchair],
  ['Machine polish', 'Lifting swirls and dullness to bring the depth back into the paint.', Sparkles],
  ['Paint protection', 'Wax, sealant or coating so water beads and dirt struggles to stick.', ShieldCheck],
  ['Wheels & tyres', 'Iron fallout and brake dust removed, tyres dressed, arches cleaned.', Disc3],
  ['Full valet', 'Inside and out in one visit — the complete reset for your car.', SprayCan],
]
const STEPS = [
  ['01', 'Assess', 'We look at the car with you first: what bothers you, what the paint and interior need, and what is realistic.'],
  ['02', 'Wash & decon', 'Pre-wash foam, safe hand wash and decontamination to strip road film, tar and fallout.'],
  ['03', 'Refine', 'Interior brought back to life, paint refined, glass and trim sorted down to the details.'],
  ['04', 'Protect', 'A protective layer to keep that just-valeted look for longer — then the keys go back to you.'],
]

/* ---------- hero with draggable before/after split ---------- */
function Hero({ lite }) {
  const ref = useRef(null)
  const ctl = useRef({ x: .3, active: false, last: -10 })
  const [touched, setTouched] = useState(false)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '35%'])
  const clip = useTransform(scrollYProgress, [0, 1], [0, 18])
  const cp = useMotionTemplate`inset(0 0 ${clip}% 0)`
  const setX = e => { const r = e.currentTarget.getBoundingClientRect(); ctl.current.x = ((e.clientX - r.left) / r.width) * 2 - 1; ctl.current.last = performance.now() / 1000 }
  const down = e => { ctl.current.active = true; e.currentTarget.setPointerCapture?.(e.pointerId); setX(e); setTouched(true) }
  const move = e => { if (ctl.current.active || e.pointerType === 'mouse' && e.buttons) setX(e) }
  const up = () => { ctl.current.active = false; ctl.current.last = performance.now() / 1000 }
  const [lx, setLx] = useState(50)
  return (
    <motion.section ref={ref} style={{ clipPath: cp, background: `radial-gradient(90% 70% at 70% 70%, #23272f 0%, ${G} 60%)` }} className="relative h-[100svh] min-h-[640px] overflow-hidden text-white md:min-h-[660px]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[.07]" style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '64px 64px', maskImage: 'radial-gradient(70% 60% at 60% 70%,#000,transparent)' }} />
      {!lite ? (
        <div data-cursor="Drag" className="absolute inset-0 touch-pan-y select-none" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
          <Suspense fallback={null}><Car3D ctl={ctl} /></Suspense>
        </div>
      ) : (
        <LiteSplit lx={lx} setLx={setLx} />
      )}
      <motion.div style={{ y }} className="pointer-events-none relative z-10 mx-auto flex h-full max-w-[1320px] flex-col justify-between px-6 pb-20 pt-[5vh] md:justify-start md:px-10 md:pb-0 md:pt-[15vh]">
        <div>
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5 }} className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[12.5px] font-semibold backdrop-blur">
          <Star size={14} fill={BL2} stroke="none" /> {b.rating} on Google · {b.rev} reviews · Horsforth, Leeds
        </motion.p>
        <h1 className={`${H} text-[clamp(50px,11vw,180px)] font-extrabold leading-[.84] tracking-[-.04em]`}>
          <SplitText text="Before." delay={1.3} y="-120%" rotate={-6} className="block text-[#8b857a] [text-shadow:0_2px_0_rgba(0,0,0,.25)]" />
          <LineReveal delay={1.55} className="pr-[.08em]"><span style={{ '--g': grad }} className="bg-clip-text text-transparent [background-image:var(--g)]">After.</span></LineReveal>
        </h1>
        </div>
        <div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }} className="max-w-[400px] text-[14px] leading-relaxed text-white/70 md:mt-6 md:text-[17px]">
          Car valeting and detailing in Horsforth. Drag the blue line across the car — that is the difference a proper valet makes.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.2 }} className="pointer-events-auto mt-5 flex flex-wrap gap-3 md:mt-8">
          <Magnetic><a href="#book" data-cursor="Book" className="inline-flex h-14 items-center gap-3 rounded-full px-7 text-[15px] font-bold text-white shadow-[0_18px_50px_-12px_rgba(47,107,255,.9)] transition-[scale] active:scale-95" style={{ background: BL }}>Book a valet <ArrowRight size={18} /></a></Magnetic>
          <a href={waLink(b.phone)} target="_blank" rel="noopener" className="inline-flex h-14 items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 text-[15px] font-bold backdrop-blur"><WA /> WhatsApp</a>
        </motion.div>
        </div>
      </motion.div>
      <AnimatePresence>{!touched && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: 10 }} transition={{ delay: 2.8 }} className="pointer-events-none absolute bottom-7 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3 whitespace-nowrap rounded-full bg-black/40 px-5 py-2.5 text-[12px] font-bold uppercase tracking-[.18em] text-white/80 backdrop-blur">
          <motion.span animate={{ x: [-6, 6, -6] }} transition={{ duration: 1.8, repeat: Infinity }}><MoveHorizontal size={16} /></motion.span> drag to clean
        </motion.div>
      )}</AnimatePresence>
      <div className="pointer-events-none absolute bottom-8 left-6 z-10 hidden text-[11px] font-bold uppercase tracking-[.25em] text-[#8b857a] md:left-10 md:block">← grime</div>
      <div className="pointer-events-none absolute bottom-8 right-6 z-10 hidden text-[11px] font-bold uppercase tracking-[.25em] text-[#8fb6ff] md:right-10 md:block">gloss →</div>
    </motion.section>
  )
}

/* CSS fallback for weak devices: same idea with a draggable line */
function LiteSplit({ lx, setLx }) {
  const set = e => { const r = e.currentTarget.getBoundingClientRect(); setLx(Math.max(0, Math.min(100, (e.clientX - r.left) / r.width * 100))) }
  return (
    <div className="absolute inset-x-0 bottom-0 h-[55%] touch-pan-y select-none" onPointerDown={e => { e.currentTarget.setPointerCapture?.(e.pointerId); set(e) }} onPointerMove={e => e.buttons && set(e)}>
      <svg viewBox="0 0 600 240" className="absolute bottom-[12%] left-1/2 w-[min(90vw,760px)] -translate-x-1/2">
        <defs><clipPath id="cl"><rect x="0" y="0" width={6 * lx} height="240" /></clipPath></defs>
        <path d="M40 170v-30c0-14 8-22 22-25l76-14 70-50c12-8 26-13 40-13h138c16 0 30 6 42 16l56 48 50 8c20 3 30 16 30 34v26z" fill="#6b6458" />
        <path clipPath="url(#cl)" d="M40 170v-30c0-14 8-22 22-25l76-14 70-50c12-8 26-13 40-13h138c16 0 30 6 42 16l56 48 50 8c20 3 30 16 30 34v26z" fill={BL} />
        <circle cx="132" cy="174" r="38" fill="#111" /><circle cx="452" cy="174" r="38" fill="#111" />
      </svg>
      <div className="absolute bottom-0 top-0 w-[2px] bg-[#8fb6ff] shadow-[0_0_24px_#2f6bff]" style={{ left: lx + '%' }} />
    </div>
  )
}

/* ---------- transition 1: left-to-right wipe reveal with a glowing edge ---------- */
function Wipe({ children, bg, className = '', id }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 25%'] })
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 24 })
  const right = useTransform(p, [0, 1], [100, 0])
  const cp = useMotionTemplate`inset(0 ${right}% 0 0)`
  const left = useTransform(right, v => `${100 - v}%`)
  const op = useTransform(p, [0, .9, 1], [1, 1, 0])
  return (
    <section ref={ref} id={id} className={'relative ' + className} style={{ background: G }}>
      <motion.div style={{ clipPath: cp, background: bg }} className="relative">{children}</motion.div>
      <motion.div aria-hidden="true" style={{ left, opacity: op }} className="pointer-events-none absolute bottom-0 top-0 z-10 w-[3px] bg-[#8fb6ff] shadow-[0_0_30px_6px_rgba(47,107,255,.7)]" />
    </section>
  )
}

/* service card: grime layer wipes off on hover / tap */
function ServiceCard({ t, d, I, k }) {
  const [clean, setClean] = useState(false)
  return (
    <Reveal delay={k * .06} className="h-full">
      <div onPointerEnter={e => e.pointerType === 'mouse' && setClean(true)} onPointerLeave={e => e.pointerType === 'mouse' && setClean(false)} onClick={() => setClean(c => !c)} data-cursor="Clean"
        className="group relative flex h-full min-h-[270px] cursor-pointer flex-col overflow-hidden rounded-[28px] bg-white p-7 shadow-[0_24px_60px_-30px_rgba(21,23,27,.35)]">
        <span className="mb-10 grid h-14 w-14 place-items-center rounded-2xl text-white" style={{ background: BL }}><I size={24} /></span>
        <h3 className={`${H} mb-2 text-[26px] font-bold leading-tight text-[#15171b]`}>{t}</h3>
        <p className="text-[15px] leading-relaxed text-[#4a4f59]">{d}</p>
        <a href="#book" data-svc={t} onClick={e => e.stopPropagation()} className="mt-auto inline-flex items-center gap-2 pt-6 text-[14px] font-bold" style={{ color: BL }}>Book this <ArrowRight size={16} /></a>
        <motion.div aria-hidden="true" initial={false} animate={{ clipPath: clean ? 'inset(0 0 0 100%)' : 'inset(0 0 0 0%)' }} transition={{ duration: .7, ease: [0.76, 0, 0.24, 1] }}
          className="pointer-events-none absolute inset-0 grid content-end p-7" style={{ backgroundColor: '#8a8274', backgroundImage: GRIME, backgroundSize: '220px' }}>
          <span className={`${H} text-[26px] font-bold leading-tight text-[#2e2a24]/80`}>{t}</span>
          <span className="mt-1 text-[12px] font-bold uppercase tracking-[.2em] text-[#2e2a24]/60">hover or tap to clean</span>
        </motion.div>
        <motion.span aria-hidden="true" initial={false} animate={{ left: clean ? '100%' : '0%', opacity: clean ? [1, 1, 0] : 0 }} transition={{ duration: .7, ease: [0.76, 0, 0.24, 1] }} className="pointer-events-none absolute bottom-0 top-0 w-[3px] bg-[#2f6bff] shadow-[0_0_20px_#2f6bff]" />
      </div>
    </Reveal>
  )
}

function Services() {
  return (
    <div className="px-6 py-28 md:px-10">
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <h2 className={`${H} text-[clamp(44px,7vw,108px)] font-extrabold leading-[.88] tracking-[-.03em] text-[#15171b]`}><SplitText text="What we" className="block" /><SplitText text="bring back." delay={.15} className="block text-[#2f6bff]" /></h2>
          <p className="max-w-[340px] text-[16px] text-[#4a4f59]">Every card below is still dirty. Clean it to read what we do.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{SV.map(([t, d, I], k) => <ServiceCard key={t} t={t} d={d} I={I} k={k} />)}</div>
      </div>
    </div>
  )
}

/* ---------- transition 2: pinned horizontal chapters ---------- */
function Process() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const x = useTransform(scrollYProgress, [0, 1], ['0%', `-${(STEPS.length - 1) * 100}%`])
  const bar = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])
  const dirtO = useTransform(scrollYProgress, [0, 1], [.35, 0])
  return (
    <section ref={ref} className="relative h-[400vh]" style={{ background: G }}>
      <div className="sticky top-0 h-screen overflow-hidden text-white">
        <motion.div aria-hidden="true" style={{ opacity: dirtO, backgroundImage: GRIME, backgroundSize: '300px' }} className="pointer-events-none absolute inset-0 mix-blend-multiply" />
        <div className="absolute left-6 right-6 top-8 z-10 flex items-center gap-4 md:left-10 md:right-10">
          <span className="text-[11px] font-bold uppercase tracking-[.25em] text-[#8b857a]">grime</span>
          <div className="relative h-[3px] flex-1 overflow-hidden rounded bg-white/10"><motion.div style={{ width: bar, background: BL }} className="absolute inset-y-0 left-0 shadow-[0_0_12px_#2f6bff]" /></div>
          <span className="text-[11px] font-bold uppercase tracking-[.25em] text-[#8fb6ff]">gloss</span>
        </div>
        <motion.div style={{ x }} className="flex h-full">
          {STEPS.map(([n, t, d], k) => (
            <div key={n} className="relative flex h-full w-screen shrink-0 items-center px-6 md:px-16">
              <span aria-hidden="true" className={`${H} pointer-events-none absolute right-[-2vw] top-1/2 -translate-y-1/2 text-[clamp(220px,40vw,620px)] font-extrabold leading-none text-white/[.04]`}>{n}</span>
              <div className="relative max-w-[720px]">
                <p className="mb-5 text-[13px] font-bold uppercase tracking-[.25em] text-[#8fb6ff]">How we work · {n}/0{STEPS.length}</p>
                <h3 className={`${H} text-[clamp(52px,9vw,150px)] font-extrabold leading-[.86] tracking-[-.04em]`} style={k === STEPS.length - 1 ? { color: BL2 } : undefined}>{t}</h3>
                <p className="mt-6 max-w-[460px] text-[17px] leading-relaxed text-white/65">{d}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ---------- transition 3: split curtain opens onto the rating ---------- */
function Proof() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center center'] })
  const p = useSpring(scrollYProgress, { stiffness: 80, damping: 22 })
  const top = useTransform(p, [0, 1], ['0%', '-101%'])
  const bot = useTransform(p, [0, 1], ['0%', '101%'])
  const sc = useTransform(p, [0, 1], [.85, 1])
  return (
    <section ref={ref} className="relative overflow-hidden px-6 py-32 md:px-10" style={{ background: W }}>
      <motion.div style={{ scale: sc }} className="mx-auto grid max-w-[1320px] items-center gap-12 md:grid-cols-[1.1fr_.9fr]">
        <div>
          <p className="mb-4 text-[13px] font-bold uppercase tracking-[.25em] text-[#2f6bff]">What drivers say</p>
          <div className="flex items-end gap-4">
            <span className={`${H} text-[clamp(120px,22vw,300px)] font-extrabold leading-[.8] tracking-[-.05em] text-[#15171b]`}>{b.rating}</span>
            <div className="mb-4 flex gap-1">{[0, 1, 2, 3, 4].map(i => <motion.span key={i} initial={{ scale: 0, rotate: -40 }} whileInView={{ scale: 1, rotate: 0 }} viewport={{ once: true }} transition={{ delay: .3 + i * .08, type: 'spring' }}><Star size={28} fill={BL} stroke="none" /></motion.span>)}</div>
          </div>
          <p className="mt-6 text-[20px] font-semibold text-[#15171b]">from <Counter to={b.rev} className={`${H} font-extrabold text-[#2f6bff]`} /> Google reviews</p>
        </div>
        <ScrollWords className={`${H} text-[clamp(26px,3vw,40px)] font-bold leading-[1.15] text-[#15171b]`} text="Every one of those reviews started the same way — a car that needed some love, and a driver who got it back looking like the day they bought it." />
      </motion.div>
      <motion.div aria-hidden="true" style={{ y: top }} className="pointer-events-none absolute inset-x-0 top-0 z-10 h-1/2 border-b border-[#2f6bff]" ><div className="h-full w-full" style={{ background: G }} /></motion.div>
      <motion.div aria-hidden="true" style={{ y: bot }} className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-1/2 border-t border-[#2f6bff]"><div className="h-full w-full" style={{ background: G }} /></motion.div>
    </section>
  )
}

function Book() {
  const bk = useBooking()
  const f = 'h-14 w-full rounded-2xl bg-white/[.06] px-5 text-[16px] text-white outline-none ring-1 ring-white/15 placeholder:text-white/40 focus:ring-2 focus:ring-[#2f6bff]'
  return (
    <div className="relative overflow-hidden px-6 py-28 text-white md:px-10">
      <div className="absolute -right-40 top-10 h-[480px] w-[480px] rounded-full opacity-30 blur-[120px]" style={{ background: BL }} />
      <div className="relative mx-auto grid max-w-[1200px] gap-12 md:grid-cols-2">
        <div>
          <h2 className={`${H} text-[clamp(48px,7vw,104px)] font-extrabold leading-[.86] tracking-[-.04em]`}><SplitText text="Your car's" className="block" /><span className="block text-[#8fb6ff]"><SplitText text="after shot." delay={.2} /></span></h2>
          <p className="mb-8 mt-6 max-w-[400px] text-[17px] text-white/65">Tell us what the car needs and we will come back to you with a time that works. Prefer to chat? Call or WhatsApp.</p>
          <a href={'tel:' + tel(b.phone)} className={`${H} block text-[34px] font-bold`}>{b.phone}</a>
        </div>
        <div className="relative rounded-[32px] bg-white/[.04] p-7 ring-1 ring-white/10 backdrop-blur-xl md:p-10">
          <AnimatePresence mode="wait">
            {!bk.s.sent ? (
              <motion.form key="f" exit={{ opacity: 0, clipPath: 'inset(0 0 0 100%)' }} transition={{ duration: .5 }} onSubmit={bk.submit} noValidate className="grid gap-4">
                <input className={f} placeholder="Your name" value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} autoComplete="name" />
                <motion.input animate={bk.s.err ? { x: [0, -8, 8, -6, 6, 0] } : {}} className={f + (bk.s.err ? ' ring-2 !ring-red-400' : '')} type="tel" inputMode="tel" placeholder="+44 7___ ______" value={bk.s.phone} onFocus={phoneFocus(bk, '+44 ')} onChange={e => bk.upd('phone', e.target.value)} autoComplete="tel" />
                <p className="mt-1 text-[12px] font-bold uppercase tracking-[.2em] text-white/45">What does it need?</p>
                <div className="flex flex-wrap gap-2">{SV.map(s => s[0]).map(t => <button type="button" key={t} onClick={() => bk.upd('svc', t)} className={`rounded-full px-4 py-2 text-[13px] font-bold transition-colors ${bk.s.svc === t ? 'bg-[#2f6bff] text-white' : 'bg-white/[.07] text-white/75 hover:bg-white/15'}`}>{t}</button>)}</div>
                <button disabled={bk.s.loading} className="mt-2 h-16 rounded-2xl text-[16px] font-bold text-white transition-[scale,opacity] active:scale-[.97] disabled:opacity-60" style={{ background: BL }}>{bk.s.loading ? 'Sending…' : 'Request a booking'}</button>
                <p className="text-[13px] text-white/45">In the finished site this request goes straight to your phone / Telegram.</p>
              </motion.form>
            ) : (
              <motion.div key="ok" initial={{ clipPath: 'inset(0 100% 0 0)' }} animate={{ clipPath: 'inset(0 0% 0 0)' }} transition={{ duration: .7, ease: [0.76, 0, 0.24, 1] }} className="grid min-h-[340px] place-items-center text-center">
                <div><CheckDraw className="mx-auto mb-5 text-[#8fb6ff]" /><h3 className={`${H} text-[38px] font-extrabold`}>Request received</h3><p className="mx-auto mb-5 max-w-[320px] text-white/65">In the finished site this request goes straight to your phone / Telegram.</p><button onClick={bk.reset} className="font-bold underline underline-offset-4">Send another</button></div>
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
    <div className="px-6 py-28 md:px-10">
      <div className="mx-auto grid max-w-[1320px] gap-6 md:grid-cols-[.9fr_1.1fr]">
        <Reveal className="grid content-start gap-6 text-[#15171b]">
          <h2 className={`${H} text-[clamp(48px,7vw,100px)] font-extrabold leading-[.88] tracking-[-.04em]`}>Find us</h2>
          <p className="flex items-start gap-3 text-[21px] font-bold"><MapPin className="mt-1 shrink-0 text-[#2f6bff]" />{b.addr}</p>
          <a href={'tel:' + tel(b.phone)} className={`${H} flex items-center gap-3 text-[32px] font-bold`}><Phone className="text-[#2f6bff]" />{b.phone}</a>
          <div className="flex flex-wrap gap-2">
            <a href={waLink(b.phone)} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-full bg-[#15171b] px-5 py-3 font-bold text-white"><WA />WhatsApp</a>
            <a href={b.fb} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-bold shadow-sm ring-1 ring-black/5"><FB />Facebook</a>
          </div>
        </Reveal>
        <Reveal delay={.1} className="h-[420px] overflow-hidden rounded-[32px] shadow-[0_24px_60px_-30px_rgba(21,23,27,.4)]"><GMap q={`${b.name}, ${b.addr}`} /></Reveal>
      </div>
    </div>
  )
}

function App() {
  useSmooth()
  const lite = useLite()
  return (
    <MotionConfig reducedMotion="user">
      <div className="font-['Manrope',sans-serif]" style={{ background: G, color: '#fff', '--sel': BL, '--selc': '#fff' }}>
        <Intro bg={G} fg="#fff" duration={1.5}>
          <div className={`${H} relative overflow-hidden text-[56px] font-extrabold tracking-[-.03em]`}>
            <span className="text-[#8b857a]">MB</span> Valets
            <motion.span className="absolute inset-y-0 w-[3px] bg-[#2f6bff] shadow-[0_0_20px_#2f6bff]" initial={{ left: '0%' }} animate={{ left: '100%' }} transition={{ duration: .9, ease: [0.76, 0, 0.24, 1] }} />
          </div>
        </Intro>
        <Progress color={BL} />
        <Cursor color={BL} blend="normal" textColor="#fff" />
        <Ribbon lang="en" name={b.name} bg={BL} fg="#fff" />
        <header className="sticky top-0 z-40 border-b border-white/5 bg-[#15171b]/70 backdrop-blur-xl">
          <div className="mx-auto flex h-[66px] max-w-[1320px] items-center justify-between px-6 md:px-10">
            <a href="#top" className={`${H} flex items-center gap-2 text-[22px] font-extrabold tracking-[-.02em]`}><span className="relative h-6 w-6 overflow-hidden rounded-md bg-[#8b857a]"><span className="absolute inset-y-0 left-0 w-1/2" style={{ background: BL }} /></span>MB Valets</a>
            <nav className="hidden gap-8 text-[14px] font-semibold text-white/60 md:flex">{[['#services', 'Services'], ['#process', 'Process'], ['#book', 'Book'], ['#contact', 'Contact']].map(([h, t]) => <a key={h} href={h} className="hover:text-white">{t}</a>)}</nav>
            <a href={'tel:' + tel(b.phone)} className="hidden h-10 items-center gap-2 rounded-full px-5 text-[14px] font-bold text-white sm:inline-flex" style={{ background: BL }}><Phone size={15} />Call</a>
          </div>
        </header>
        <main id="top">
          <Hero lite={lite} />
          <div className="border-y border-white/5 py-5">
            <Marquee base={-2}>{['exterior', 'interior', 'polish', 'protection', 'wheels', 'full valet'].map(t => <span key={t} className={`${H} mx-6 inline-flex items-center gap-12 text-[clamp(34px,4.5vw,64px)] font-extrabold tracking-[-.03em]`}><span className="text-[#8b857a]">{t}</span><span className="inline-block h-[3px] w-14 bg-[#2f6bff]" /></span>)}</Marquee>
          </div>
          <Wipe id="services" bg={W}><Services /></Wipe>
          <div id="process"><Process /></div>
          <Proof />
          <Wipe id="book" bg={`linear-gradient(180deg, ${G2}, ${G})`}><Book /></Wipe>
          <Wipe id="contact" bg={W}><Contact /></Wipe>
        </main>
        <footer className="px-6 py-10 text-[13px] font-semibold text-white/45 md:px-10"><div className="mx-auto flex max-w-[1320px] flex-wrap justify-between gap-4"><span>© 2026 {b.name} · Website concept by Artem</span><span>{b.addr}</span></div></footer>
        <CallBar lang="en" phone={b.phone} barCls="bg-[#15171b]/85 backdrop-blur-xl" callCls="rounded-2xl bg-white/10 text-white" bookCls="rounded-2xl text-white bg-[#2f6bff]" />
        <div className="h-[72px] sm:hidden" />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
