import React, { useRef, useState, useEffect, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, useMotionValueEvent, useSpring, useMotionValue, AnimatePresence, MotionConfig } from 'framer-motion'
import { ArrowRight, Phone, MapPin, Star } from 'lucide-react'
import '../lib/base.css'
import { useSmooth, Ribbon, SplitText, Reveal, Magnetic, Cursor, Marquee, Counter, useBooking, phoneFocus, CheckDraw, CallBar, Progress, Intro, tel, useLite, GMap, WA, waLink, ScrollWords, LineReveal } from '../lib/kit'

const Showroom = lazy(() => import('./luxevaleting3d'))
const b = {
  name: 'LUXE Mobile Valeting',
  addr: 'South Pkwy, Seacroft, Leeds LS14 6FP',
  phone: '+44 7818 341573',
  rating: '4.9', rev: 27,
}
const BLACK = '#070707', GOLD = '#cfae78', IVORY = '#f3ede1'
const SERIF = "font-['Cormorant_Garamond',serif]"
const SANS = "font-['Jost',sans-serif]"
const goldGrad = 'linear-gradient(100deg,#9c7a45 0%,#f1dcae 35%,#cfae78 55%,#fff1cf 70%,#a8834c 100%)'

const ACTS = [
  ['I', 'The Wash', 'A careful hand wash, wheels and arches first, paint treated with the patience it deserves.'],
  ['II', 'The Detail', 'Interior vacuumed, wiped and dressed. Glass streak-free. Every seam and stitch looked after.'],
  ['III', 'The Finish', 'A protective finish that leaves the paint deep, slick and ready to be seen.'],
]
const MENU = [
  ['Exterior hand wash', 'Snow foam, two-bucket wash, wheels, arches and a hand dry.'],
  ['Interior valet', 'Vacuum, surfaces, trims, glass and mats — calm, clean cabin.'],
  ['Full valet', 'Inside and out in a single appointment, at your address.'],
  ['Machine polish', 'Lifts light swirls and restores depth and clarity to the paint.'],
  ['Paint protection', 'Wax or sealant finish to keep the gloss and repel the weather.'],
  ['Wheels & glass', 'Deep clean of alloys and tyres, crystal-clear glass all round.'],
]

/* gold line that draws itself as it enters */
function GoldLine({ className = '', delay = 0, vertical = false }) {
  return <motion.span aria-hidden="true" className={'block ' + (vertical ? 'w-px origin-top ' : 'h-px origin-left ') + className} style={{ background: goldGrad }}
    initial={vertical ? { scaleY: 0 } : { scaleX: 0 }} whileInView={vertical ? { scaleY: 1 } : { scaleX: 1 }} viewport={{ once: true, margin: '0px 0px -10% 0px' }} transition={{ duration: 1.6, delay, ease: [0.65, 0, 0.35, 1] }} />
}
function Gold({ children, className = '' }) {
  return <span className={'bg-clip-text text-transparent ' + className} style={{ backgroundImage: goldGrad }}>{children}</span>
}

function HoldButton({ revealed, onHold, onRelease, progress, onReset }) {
  const circ = 2 * Math.PI * 30
  const dash = useTransform(progress, v => circ * (1 - v))
  if (revealed) return (
    <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onReset} className={`${SANS} pointer-events-auto inline-flex items-center gap-3 text-[12px] font-light uppercase tracking-[.3em] text-[#f3ede1]/70 hover:text-[#cfae78]`}>
      <span className="h-px w-8" style={{ background: goldGrad }} />Cover it again
    </motion.button>
  )
  return (
    <button onPointerDown={e => { e.preventDefault(); e.currentTarget.setPointerCapture?.(e.pointerId); onHold() }} onPointerUp={onRelease} onPointerCancel={onRelease} onLostPointerCapture={onRelease} onContextMenu={e => e.preventDefault()}
      data-cursor="Hold" className={`${SANS} pointer-events-auto group inline-flex select-none items-center gap-4 text-[12px] font-light uppercase tracking-[.3em] text-[#f3ede1] [touch-action:none] [-webkit-touch-callout:none]`}>
      <span className="relative grid h-[72px] w-[72px] place-items-center">
        <svg viewBox="0 0 72 72" className="absolute inset-0 -rotate-90"><circle cx="36" cy="36" r="30" fill="none" stroke="#f3ede1" strokeOpacity=".15" strokeWidth="1" /><motion.circle cx="36" cy="36" r="30" fill="none" stroke={GOLD} strokeWidth="2" strokeDasharray={circ} style={{ strokeDashoffset: dash }} /></svg>
        <span className="h-3 w-3 rounded-full transition-transform group-active:scale-150" style={{ background: goldGrad }} />
      </span>
      Press &amp; hold to unveil
    </button>
  )
}

function Hero({ lite }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const revealRef = useRef(0)
  const prog = useMotionValue(0)
  const holding = useRef(false)
  const [revealed, setRevealed] = useState(false)
  useEffect(() => {
    let id, last = performance.now()
    const tick = t => {
      const dt = Math.min(0.25, (t - last) / 1000); last = t
      let r = revealRef.current
      if (r < 1) {
        if (holding.current) r = Math.min(1, r + dt * 0.55)
        else if (r > 0 && r < 0.62) r = Math.max(0, r - dt * 0.9)
        else if (r >= 0.62) r = Math.min(1, r + dt * 0.7)
        revealRef.current = r; prog.set(Math.min(1, r / 0.62))
        if (r >= 1) setRevealed(true)
      }
      id = requestAnimationFrame(tick)
    }
    id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [])
  const bars = useTransform(scrollYProgress, [0, 1], ['0vh', '13vh'])
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '-25%'])
  const textO = useTransform(scrollYProgress, [0.55, 0.95], [1, 0])
  return (
    <section ref={ref} className="relative h-[210vh] bg-[#070707]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="absolute inset-0">
          {lite ? <LiteCar revealed={revealed} prog={prog} /> : <Suspense fallback={null}><Showroom revealRef={revealRef} scroll={scrollYProgress} /></Suspense>}
        </div>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_80%_60%,transparent_30%,rgba(7,7,7,.75)_80%)]" />
        <motion.div style={{ height: bars }} className="absolute inset-x-0 top-0 z-20 bg-black" />
        <motion.div style={{ height: bars }} className="absolute inset-x-0 bottom-0 z-20 bg-black" />
        <motion.div style={{ y: textY, opacity: textO }} className="pointer-events-none relative z-10 mx-auto flex h-full max-w-[1400px] flex-col px-6 pb-8 pt-10 md:justify-center md:px-12 md:pt-0">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8, duration: 1 }} className={`${SANS} mb-6 flex items-center gap-4 text-[11px] font-light uppercase tracking-[.42em] text-[#f3ede1]/70`}><span className="h-px w-10" style={{ background: goldGrad }} />Mobile valeting · Leeds</motion.p>
          <h1 className={`${SERIF} text-[clamp(56px,9.5vw,160px)] font-light leading-[.86] tracking-[-.02em] text-[#f3ede1]`}>
            <SplitText text="Unveil" delay={1.6} stagger={0.06} className="block" />
            <LineReveal delay={1.95} className="italic pr-[.08em]">the <Gold>finish.</Gold></LineReveal>
          </h1>
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.4, duration: 1 }} className={`${SANS} mt-6 max-w-[380px] text-[15px] font-light leading-relaxed text-[#f3ede1]/70 md:text-[17px]`}>Showroom standard, delivered to your driveway. Move the light across the car — then lift the cover.</motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.8, duration: 1 }} className="mt-auto flex flex-wrap items-center gap-6 pb-[10vh] md:mt-12 md:pb-0">
            <HoldButton revealed={revealed} progress={prog} onHold={() => (holding.current = true)} onRelease={() => (holding.current = false)} onReset={() => { revealRef.current = 0; prog.set(0); setRevealed(false) }} />
            <Magnetic className="pointer-events-auto hidden sm:inline-block"><a href="#book" data-cursor="Reserve" className={`${SANS} inline-flex h-14 items-center gap-3 border border-[#cfae78]/60 px-8 text-[12px] font-normal uppercase tracking-[.3em] text-[#f3ede1] transition-colors hover:bg-[#cfae78] hover:text-black`}>Reserve <ArrowRight size={16} /></a></Magnetic>
          </motion.div>
          <AnimatePresence>{revealed && <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: 0.3 }} className={`${SERIF} absolute bottom-[16vh] right-6 hidden text-[28px] italic text-[#f3ede1]/80 md:right-12 md:block`}>This is how yours could look.</motion.p>}</AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}

function LiteCar({ revealed, prog }) {
  const x = useTransform(prog, [0, 1], ['0%', '-8%'])
  return (
    <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(50%_40%_at_60%_70%,#2a2418,#070707)]">
      <svg viewBox="0 0 440 150" className="mt-[30vh] w-[78%] max-w-[760px] md:ml-[20%] md:mt-[20vh]">
        <path d="M10 110 L12 80 Q14 64 34 62 L110 56 Q140 22 200 18 L260 18 Q300 22 330 52 L400 62 Q430 66 428 96 L426 110 Z" fill="#0d0d0d" stroke={GOLD} strokeWidth="1.2" />
        <circle cx="96" cy="112" r="24" fill="#050505" stroke={GOLD} /><circle cx="344" cy="112" r="24" fill="#050505" stroke={GOLD} />
        <motion.path style={{ x }} animate={{ opacity: revealed ? 0 : 1 }} d="M0 116 Q8 60 40 54 L108 46 Q140 10 200 8 L262 8 Q306 12 336 44 L404 54 Q440 60 440 116 Z" fill="#e8dcc2" />
      </svg>
    </div>
  )
}

function Statement() {
  return (
    <section className="relative bg-[#070707] px-6 py-28 md:px-12 md:py-40">
      <div className="mx-auto max-w-[1100px]">
        <GoldLine className="mb-12 w-full" />
        <ScrollWords text="Every panel, every seam, every stitch — treated as if the car were about to go on show. Then we pack up quietly and leave you with the keys." className={`${SERIF} text-[clamp(32px,4.6vw,72px)] font-light leading-[1.08] text-[#f3ede1]`} dim={0.12} />
        <GoldLine className="ml-auto mt-12 w-1/3" delay={0.3} />
      </div>
    </section>
  )
}

/* letterbox acts: cinematic bars close in, slow dolly-zoom on the numeral */
function Acts() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const [i, setI] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', v => setI(Math.min(2, Math.floor(v * 3))))
  const bar = useTransform(scrollYProgress, [0, 0.12, 0.88, 1], ['0vh', '14vh', '14vh', '0vh'])
  const zoom = useTransform(scrollYProgress, v => 1 + ((v * 3) % 1) * 0.25)
  const line = useTransform(scrollYProgress, [0, 1], [0, 1])
  return (
    <section ref={ref} className="relative h-[320vh] bg-[#0b0a08]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <motion.div style={{ scale: zoom }} aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(40%_50%_at_50%_50%,rgba(207,174,120,.16),transparent_70%)]" />
        <motion.div style={{ scale: zoom }} className={`${SERIF} pointer-events-none absolute inset-0 grid place-items-center text-[clamp(220px,42vw,620px)] font-light italic leading-none`}>
          <AnimatePresence mode="wait"><motion.span key={i} initial={{ opacity: 0, filter: 'blur(20px)' }} animate={{ opacity: 0.16, filter: 'blur(0px)' }} exit={{ opacity: 0, filter: 'blur(20px)' }} transition={{ duration: 0.9 }}><Gold>{ACTS[i][0]}</Gold></motion.span></AnimatePresence>
        </motion.div>
        <motion.div style={{ height: bar }} className="absolute inset-x-0 top-0 z-10 flex items-end bg-black px-6 pb-3 md:px-12"><span className={`${SANS} text-[10px] font-light uppercase tracking-[.4em] text-[#f3ede1]/40`}>The appointment · in three acts</span></motion.div>
        <motion.div style={{ height: bar }} className="absolute inset-x-0 bottom-0 z-10 bg-black">
          <div className="absolute left-6 right-6 top-4 h-px bg-white/10 md:left-12 md:right-12"><motion.div style={{ scaleX: line, background: goldGrad }} className="h-full origin-left" /></div>
        </motion.div>
        <div className="relative z-[5] mx-auto flex h-full max-w-[1100px] flex-col items-center justify-center px-6 text-center">
          <AnimatePresence mode="wait">
            <motion.div key={i} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
              <p className={`${SANS} mb-6 text-[12px] font-light uppercase tracking-[.5em] text-[#cfae78]`}>Act {ACTS[i][0]}</p>
              <h2 className={`${SERIF} text-[clamp(56px,9vw,150px)] font-light leading-[.9] text-[#f3ede1]`}>{ACTS[i][1]}</h2>
              <p className={`${SANS} mx-auto mt-6 max-w-[460px] text-[16px] font-light leading-relaxed text-[#f3ede1]/65`}>{ACTS[i][2]}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

function MenuRow({ t, d, k, open, setOpen }) {
  return (
    <div className="relative">
      <GoldLine delay={k * 0.08} className="w-full opacity-50" />
      <button onMouseEnter={() => setOpen(k)} onClick={() => setOpen(k)} className="group grid w-full grid-cols-[48px_1fr_auto] items-center gap-4 py-7 text-left md:grid-cols-[80px_1fr_1fr_auto] md:py-9">
        <span className={`${SANS} text-[12px] font-light tracking-[.2em] text-[#cfae78]`}>0{k + 1}</span>
        <span className={`${SERIF} text-[clamp(30px,4vw,60px)] font-light leading-none transition-all duration-500 ${open === k ? 'italic text-[#cfae78] md:translate-x-4' : 'text-[#f3ede1]'}`}>{t}</span>
        <span className={`${SANS} hidden text-[15px] font-light text-[#f3ede1]/55 transition-opacity duration-500 md:block ${open === k ? 'opacity-100' : 'opacity-0'}`}>{d}</span>
        <a href="#book" data-svc={t} onClick={e => e.stopPropagation()} className={`${SANS} grid h-11 w-11 place-items-center rounded-full border transition-colors ${open === k ? 'border-[#cfae78] bg-[#cfae78] text-black' : 'border-white/20 text-[#f3ede1]'}`} aria-label={`Reserve ${t}`}><ArrowRight size={16} /></a>
      </button>
      <AnimatePresence initial={false}>{open === k && <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className={`${SANS} overflow-hidden pb-6 pl-[64px] text-[15px] font-light text-[#f3ede1]/60 md:hidden`}>{d}</motion.p>}</AnimatePresence>
    </div>
  )
}
function Menu() {
  const [open, setOpen] = useState(0)
  return (
    <section id="services" className="bg-[#070707] px-6 py-28 md:px-12 md:py-36">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-16 flex flex-wrap items-end justify-between gap-8">
          <h2 className={`${SERIF} text-[clamp(56px,8vw,130px)] font-light leading-[.85] text-[#f3ede1]`}><SplitText text="The" className="block" /><span className="block italic"><Gold>Menu</Gold></span></h2>
          <p className={`${SANS} max-w-[340px] text-[15px] font-light leading-relaxed text-[#f3ede1]/60`}>Choose a treatment and we'll confirm the details and time with you personally.</p>
        </div>
        {MENU.map(([t, d], k) => <MenuRow key={t} t={t} d={d} k={k} open={open} setOpen={setOpen} />)}
        <GoldLine className="w-full opacity-50" />
      </div>
    </section>
  )
}

/* iris reveal for the rating */
function Rating() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center center'] })
  const r = useSpring(useTransform(scrollYProgress, [0, 1], [8, 85]), { stiffness: 60, damping: 20 })
  const clip = useTransform(r, v => `circle(${v}% at 50% 50%)`)
  return (
    <section ref={ref} className="bg-[#070707]">
      <motion.div style={{ clipPath: clip }} className="bg-[#f3ede1] px-6 py-28 text-[#070707] md:px-12 md:py-40">
        <div className="mx-auto grid max-w-[1200px] items-center gap-14 md:grid-cols-2">
          <div className="relative mx-auto grid aspect-square w-[min(80vw,420px)] place-items-center">
            <svg viewBox="0 0 200 200" className="absolute inset-0 -rotate-90"><circle cx="100" cy="100" r="94" fill="none" stroke="#070707" strokeOpacity=".08" /><motion.circle cx="100" cy="100" r="94" fill="none" stroke="#b08d55" strokeWidth="1.5" initial={{ pathLength: 0 }} whileInView={{ pathLength: 0.98 }} viewport={{ once: true }} transition={{ duration: 2.2, ease: [0.65, 0, 0.35, 1] }} /></svg>
            <div className="text-center">
              <p className={`${SERIF} text-[clamp(110px,16vw,200px)] font-light leading-[.8]`}>{b.rating}</p>
              <div className="mt-4 flex justify-center gap-1 text-[#b08d55]">{Array.from({ length: 5 }).map((_, k) => <Star key={k} size={16} fill="currentColor" />)}</div>
            </div>
          </div>
          <div>
            <p className={`${SANS} mb-6 text-[12px] font-light uppercase tracking-[.4em] text-[#8a6c3c]`}>On Google</p>
            <h2 className={`${SERIF} text-[clamp(44px,5.5vw,84px)] font-light leading-[.95]`}><Counter to={b.rev} /> reviews,<br /><span className="italic text-[#8a6c3c]">{b.rating} stars.</span></h2>
            <p className={`${SANS} mt-6 max-w-[420px] text-[16px] font-light leading-relaxed text-black/60`}>Rated by customers across Leeds. Read every word on Google Maps — and leave yours after your appointment.</p>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

function Reserve() {
  const bk = useBooking()
  const f = `${SANS} h-14 w-full border-0 border-b border-[#f3ede1]/20 bg-transparent text-[18px] font-light text-[#f3ede1] outline-none placeholder:text-[#f3ede1]/35 focus:border-[#cfae78]`
  return (
    <section id="book" className="relative overflow-hidden bg-[#070707] px-6 py-28 md:px-12 md:py-36">
      <div aria-hidden="true" className="absolute left-1/2 top-0 h-[60vh] w-[80vw] -translate-x-1/2 bg-[radial-gradient(50%_50%_at_50%_0%,rgba(207,174,120,.14),transparent)]" />
      <div className="relative mx-auto grid max-w-[1300px] gap-16 md:grid-cols-2">
        <div>
          <p className={`${SANS} mb-6 text-[12px] font-light uppercase tracking-[.4em] text-[#cfae78]`}>Reservations</p>
          <h2 className={`${SERIF} text-[clamp(52px,7vw,116px)] font-light leading-[.88] text-[#f3ede1]`}><SplitText text="Reserve your" className="block" /><span className="block italic"><Gold>appointment.</Gold></span></h2>
          <p className={`${SANS} mb-10 mt-8 max-w-[400px] text-[16px] font-light leading-relaxed text-[#f3ede1]/60`}>Leave your details and we'll be in touch to confirm the treatment, your address and a time that suits.</p>
          <a href={'tel:' + tel(b.phone)} className={`${SERIF} block text-[clamp(34px,3.6vw,52px)] font-light text-[#f3ede1]`}>{b.phone}</a>
          <a href={waLink(b.phone)} target="_blank" rel="noopener" className={`${SANS} mt-5 inline-flex h-12 items-center gap-3 border border-[#cfae78]/50 px-6 text-[12px] uppercase tracking-[.25em] text-[#f3ede1] hover:bg-[#cfae78] hover:text-black`}><WA />WhatsApp</a>
        </div>
        <div className="relative border border-[#cfae78]/25 p-7 md:p-12">
          {['left-0 top-0 border-l border-t', 'right-0 top-0 border-r border-t', 'left-0 bottom-0 border-l border-b', 'right-0 bottom-0 border-r border-b'].map(c => <span key={c} className={`absolute h-5 w-5 border-[#cfae78] ${c}`} />)}
          <AnimatePresence mode="wait">
            {!bk.s.sent ? (
              <motion.form key="f" exit={{ opacity: 0, filter: 'blur(8px)' }} onSubmit={bk.submit} noValidate className="grid gap-6">
                <input className={f} placeholder="Name" value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} autoComplete="name" />
                <motion.input animate={bk.s.err ? { x: [0, -8, 8, -6, 6, 0] } : {}} className={f + (bk.s.err ? ' !border-red-400' : '')} type="tel" inputMode="tel" placeholder="+44 7___ ______" value={bk.s.phone} onFocus={phoneFocus(bk, '+44 ')} onChange={e => bk.upd('phone', e.target.value)} autoComplete="tel" />
                <div className="flex flex-wrap gap-2">{MENU.map(m => m[0]).map(t => <button type="button" key={t} onClick={() => bk.upd('svc', t)} className={`${SANS} border px-4 py-2 text-[12px] font-light tracking-[.08em] transition-colors ${bk.s.svc === t ? 'border-[#cfae78] bg-[#cfae78] text-black' : 'border-white/15 text-[#f3ede1]/70 hover:border-[#cfae78]/60'}`}>{t}</button>)}</div>
                <button disabled={bk.s.loading} className={`${SANS} mt-2 h-16 text-[12px] font-normal uppercase tracking-[.35em] text-black transition-opacity disabled:opacity-60`} style={{ background: goldGrad }}>{bk.s.loading ? 'Reserving…' : 'Request reservation'}</button>
                <p className={`${SANS} text-[13px] font-light text-[#f3ede1]/45`}>In the finished site this request goes straight to your phone or Telegram.</p>
              </motion.form>
            ) : (
              <motion.div key="ok" initial={{ opacity: 0, filter: 'blur(8px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} className="grid min-h-[340px] place-items-center text-center text-[#f3ede1]">
                <div><CheckDraw className="mx-auto mb-6 text-[#cfae78]" /><h3 className={`${SERIF} text-[44px] font-light italic`}>Your request is in.</h3><p className={`${SANS} mx-auto mb-6 max-w-[340px] font-light text-[#f3ede1]/60`}>This is how your client sees it. In the finished site this request goes straight to your phone or Telegram.</p><button onClick={bk.reset} className={`${SANS} text-[12px] uppercase tracking-[.3em] text-[#cfae78]`}>Another reservation</button></div>
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
    <section id="contact" className="bg-[#070707] px-6 pb-28 md:px-12 md:pb-36">
      <div className="mx-auto grid max-w-[1300px] gap-0 border border-white/10 md:grid-cols-[.9fr_1.1fr]">
        <Reveal className="flex flex-col gap-7 p-8 md:p-14">
          <h2 className={`${SERIF} text-[clamp(48px,5vw,84px)] font-light italic leading-[.9] text-[#f3ede1]`}>Find us</h2>
          <GoldLine className="w-24" />
          <p className={`${SANS} flex items-start gap-3 text-[18px] font-light text-[#f3ede1]/85`}><MapPin className="mt-1 shrink-0 text-[#cfae78]" size={20} />{b.addr}</p>
          <p className={`${SANS} text-[14px] font-light text-[#f3ede1]/50`}>A mobile service — we come to your home or workplace. Confirm your location when booking.</p>
          <a href={'tel:' + tel(b.phone)} className={`${SERIF} inline-flex items-center gap-3 text-[clamp(30px,3vw,42px)] font-light text-[#f3ede1]`}><Phone size={22} className="text-[#cfae78]" />{b.phone}</a>
          <div className="flex flex-wrap gap-3">
            <a href={waLink(b.phone)} target="_blank" rel="noopener" className={`${SANS} inline-flex h-12 items-center gap-2 px-6 text-[12px] uppercase tracking-[.25em] text-black`} style={{ background: goldGrad }}><WA />WhatsApp</a>
            <a href={'tel:' + tel(b.phone)} className={`${SANS} inline-flex h-12 items-center gap-2 border border-white/20 px-6 text-[12px] uppercase tracking-[.25em] text-[#f3ede1]`}><Phone size={14} />Call</a>
          </div>
        </Reveal>
        <div className="h-[420px] md:h-auto md:min-h-[480px]"><GMap q={`${b.name}, ${b.addr}`} dark /></div>
      </div>
    </section>
  )
}

function App() {
  useSmooth()
  const lite = useLite()
  return (
    <MotionConfig reducedMotion="user">
      <div className={`${SANS} overflow-x-clip`} style={{ background: BLACK, color: IVORY, '--sel': GOLD, '--selc': '#000' }}>
        <Intro bg={BLACK} fg={IVORY} duration={1.9}>
          <div className="text-center">
            <motion.p initial={{ opacity: 0, letterSpacing: '0.1em' }} animate={{ opacity: 1, letterSpacing: '0.5em' }} transition={{ duration: 1.4 }} className={`${SERIF} pl-[.5em] text-[54px] font-light`}><Gold>LUXE</Gold></motion.p>
            <motion.span initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.1, delay: 0.2, ease: [0.65, 0, 0.35, 1] }} className="mx-auto mt-3 block h-px w-48" style={{ background: goldGrad }} />
          </div>
        </Intro>
        <Progress color={GOLD} />
        <Cursor color={GOLD} blend="difference" textColor="#000" />
        <Ribbon lang="en" name={b.name} bg="#14110b" fg={IVORY} />
        <header className="sticky top-0 z-40 border-b border-white/[.06] bg-[#070707]/75 backdrop-blur-xl">
          <div className="mx-auto flex h-[66px] max-w-[1400px] items-center justify-between px-6 md:h-[76px] md:px-12">
            <a href="#top" className="flex items-baseline gap-3"><span className={`${SERIF} text-[28px] font-light tracking-[.35em]`}><Gold>LUXE</Gold></span><span className={`${SANS} hidden text-[10px] font-light uppercase tracking-[.4em] text-[#f3ede1]/50 sm:inline`}>Mobile Valeting</span></a>
            <nav className={`${SANS} hidden gap-10 text-[11px] font-light uppercase tracking-[.32em] text-[#f3ede1]/60 md:flex`}>{[['#services', 'Menu'], ['#book', 'Reserve'], ['#contact', 'Contact']].map(([h, t]) => <a key={h} href={h} className="hover:text-[#cfae78]">{t}</a>)}</nav>
            <a href={'tel:' + tel(b.phone)} className={`${SANS} hidden h-11 items-center gap-2 border border-[#cfae78]/50 px-5 text-[12px] font-light tracking-[.12em] text-[#f3ede1] hover:bg-[#cfae78] hover:text-black sm:inline-flex`}><Phone size={14} />{b.phone}</a>
          </div>
        </header>
        <main id="top">
          <Hero lite={lite} />
          <Marquee base={-1.2} className="border-y border-white/[.06] py-6" skew={false}>
            {['hand wash', 'interior', 'machine polish', 'protection', 'at your door'].map(t => <span key={t} className={`${SERIF} mx-8 inline-flex items-center gap-16 text-[clamp(36px,4.5vw,68px)] font-light italic text-[#f3ede1]/85`}>{t}<span className="h-2 w-2 rotate-45" style={{ background: goldGrad }} /></span>)}
          </Marquee>
          <Statement />
          <Acts />
          <Menu />
          <Rating />
          <Reserve />
          <Contact />
        </main>
        <footer className={`${SANS} bg-[#070707] px-6 pb-10 text-[12px] font-light tracking-[.12em] text-[#f3ede1]/45 md:px-12`}>
          <div className="mx-auto flex max-w-[1400px] flex-wrap justify-between gap-4 border-t border-white/10 pt-8"><span>© 2026 {b.name} · Website concept by Artem</span><span className={`${SERIF} text-[16px] italic tracking-normal`}>Showroom standard, at your door.</span></div>
        </footer>
        <CallBar lang="en" phone={b.phone} barCls="bg-black/85 backdrop-blur-xl border-t border-white/10" callCls="border border-[#cfae78]/60 text-[#f3ede1]" bookCls="bg-[#cfae78] text-black" />
        <div className="h-[72px] sm:hidden" />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
