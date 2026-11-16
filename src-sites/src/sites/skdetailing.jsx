import React, { useRef, useState, useEffect, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, useSpring, useMotionTemplate, useInView, AnimatePresence, MotionConfig } from 'framer-motion'
import { ArrowRight, Phone, MapPin, Star, ShieldCheck, Sparkles, Droplet, Armchair, CircleDot, Waves } from 'lucide-react'
import '../lib/base.css'
import { LineReveal, useSmooth, Ribbon, SplitText, ScrollWords, Reveal, Magnetic, Cursor, Marquee, Counter, useBooking, phoneFocus, CheckDraw, GMap, CallBar, Progress, Intro, tel, useLite, WA, waLink } from '../lib/kit'

const Panel3D = lazy(() => import('./skdetailing3d'))

const b = {
  name: 'SK Detailing & Valeting',
  short: 'SK Detailing',
  addr: '21 Abbeydale Grove, Hawksworth, Leeds LS5 3RE',
  phone: '+44 7521 214899',
  fb: 'https://www.facebook.com/share/mt9WUpFAWBQrLqnU/',
  rating: '5.0', rev: 77,
}
const NV = '#060b1c', NV2 = '#0c1530', CY = '#34e1ff', SL = '#c9d1dc'
const grad = `linear-gradient(100deg, ${SL} 0%, #ffffff 40%, ${CY} 100%)`
const H = "font-['Unbounded',sans-serif]"
const FB = p => (<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" {...p}><path d="M13.5 22v-8h2.7l.4-3.2h-3.1V8.8c0-.9.3-1.5 1.6-1.5h1.7V4.4c-.3 0-1.3-.1-2.5-.1-2.4 0-4.1 1.5-4.1 4.2v2.3H7.5V14h2.7v8h3.3Z" /></svg>)

const SV = [
  ['Ceramic coating', 'A hard, slick protective layer bonded to the paint. Water beads, dirt lets go, gloss deepens.', ShieldCheck],
  ['Paint enhancement', 'Machine polishing to reduce swirls and haze before protection goes on.', Sparkles],
  ['Full valet', 'Exterior and interior brought back together in one visit.', Droplet],
  ['Interior detailing', 'Seats, carpets, plastics and glass cleaned properly, not just wiped.', Armchair],
  ['Wheels & glass', 'Deep-cleaned wheels and treated glass so rain clears away.', CircleDot],
  ['Maintenance wash', 'Safe wash routine that keeps a coated car performing like day one.', Waves],
]
const PROS = {
  coated: ['Water beads up and rolls off', 'Dirt struggles to bond, so washing is easier', 'Deeper, wet-look gloss', 'A barrier between paint and the elements'],
  bare: ['Water sheets out and clings', 'Grime dries into the paint as spots', 'Gloss fades between washes', 'Paint takes the full hit of the weather'],
}

/* glossy light sweep across a heading */
function Sheen({ text, className = '', delay = 0 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: false, margin: '-10% 0px' })
  return (
    <span ref={ref} className={'relative inline-block ' + className}>
      {text}
      <motion.span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-clip-text text-transparent"
        style={{ backgroundImage: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,.95) 48%, #9ff3ff 52%, transparent 65%)', backgroundSize: '300% 100%', backgroundRepeat: 'no-repeat' }}
        initial={{ backgroundPosition: '120% 0' }} animate={inView ? { backgroundPosition: ['120% 0', '-20% 0'] } : {}} transition={{ duration: 1.6, delay, ease: [0.65, 0, 0.35, 1], repeat: Infinity, repeatDelay: 4 }}>{text}</motion.span>
    </span>
  )
}

function Toggle({ coated, set, big }) {
  return (
    <div role="group" aria-label="Paint protection" className={`pointer-events-auto relative inline-grid grid-cols-2 rounded-full bg-white/[.06] p-1.5 ring-1 ring-white/15 backdrop-blur-xl ${big ? 'text-[15px]' : 'text-[13px]'}`}>
      <motion.span className="absolute inset-y-1.5 left-1.5 w-[calc(50%-6px)] rounded-full" initial={false} animate={{ x: coated ? '100%' : '0%', background: coated ? CY : '#5a6273', boxShadow: coated ? '0 0 30px rgba(52,225,255,.6)' : '0 0 0px rgba(0,0,0,0)' }} transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
      <button onClick={() => set(false)} aria-pressed={!coated} className={`relative z-10 h-11 rounded-full px-5 font-bold transition-colors ${!coated ? 'text-white' : 'text-white/55'}`}>Uncoated</button>
      <button onClick={() => set(true)} aria-pressed={coated} className={`relative z-10 h-11 rounded-full px-5 font-bold transition-colors ${coated ? 'text-[#060b1c]' : 'text-white/55'}`}>Coated</button>
    </div>
  )
}

function LiteDrops({ coated }) {
  return (
    <div className="absolute bottom-[6%] right-[4%] h-[46%] w-[min(92vw,640px)] overflow-hidden rounded-[40%_40%_20%_20%/30%_30%_10%_10%]" style={{ background: 'linear-gradient(160deg,#1a3a7a,#0b2350 50%,#050c22)' }}>
      {Array.from({ length: 26 }).map((_, i) => <motion.span key={i} className="absolute rounded-full" style={{ left: `${(i * 37) % 95}%`, background: 'radial-gradient(circle at 30% 30%,#fff,rgba(160,240,255,.35))' }}
        animate={coated ? { top: ['-5%', '110%'], width: 10 + i % 4 * 5, height: 10 + i % 4 * 5, opacity: 1 } : { top: `${(i * 23) % 90}%`, width: 34 + i % 3 * 12, height: 8, opacity: .5 }}
        transition={coated ? { duration: 2 + i % 4, repeat: Infinity, delay: i * .15, ease: 'easeIn' } : { duration: .8 }} />)}
    </div>
  )
}

function Hero({ lite, coated, setCoated, coatedRef }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const op = useTransform(scrollYProgress, [0, .8], [1, 0])
  return (
    <section ref={ref} className="relative h-[100svh] min-h-[640px] overflow-hidden md:min-h-[680px]" style={{ background: `radial-gradient(80% 70% at 75% 65%, #10224a 0%, ${NV} 65%)` }}>
      <div className="absolute inset-0 touch-pan-y" data-cursor="Splash">{!lite ? <Suspense fallback={null}><Panel3D coatedRef={coatedRef} /></Suspense> : <LiteDrops coated={coated} />}</div>
      <motion.div style={{ y, opacity: op }} className="pointer-events-none relative z-10 mx-auto flex h-full max-w-[1320px] flex-col justify-between px-6 pb-16 pt-[4vh] md:justify-center md:px-10 md:pb-0 md:pt-0">
        <div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }} className="mb-6 inline-flex w-fit items-center gap-2 text-[12px] font-semibold uppercase tracking-[.22em] text-[#34e1ff]">
          <span className="h-px w-8 bg-[#34e1ff]" /> Ceramic coating<span className="hidden sm:inline"> · Hawksworth, Leeds</span>
        </motion.p>
        <h1 className={`${H} text-[clamp(44px,8.4vw,128px)] font-bold leading-[.9] tracking-[-.03em] text-white`}>
          <SplitText text="Bead." delay={1.3} className="block" />
          <SplitText text="Slide." delay={1.45} className="block text-[#c9d1dc]" />
          <LineReveal delay={1.65} className="pr-[.06em]"><span style={{ '--g': grad }} className="bg-clip-text text-transparent [background-image:var(--g)]">Shine.</span></LineReveal>
        </h1>
        </div>
        <div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }} className="md:mt-6 max-w-[380px] text-[15px] leading-relaxed text-[#c9d1dc]/80 md:text-[17px]">
          Flip the switch, tilt the panel with your cursor, tap it to splash. That is what a coated car does in Leeds rain.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.2 }} className="mt-7 flex flex-wrap items-center gap-3">
          <Toggle coated={coated} set={setCoated} big />
          <Magnetic className="pointer-events-auto hidden sm:inline-block"><a href="#book" data-cursor="Book" className="inline-flex h-14 items-center gap-2 rounded-full bg-white px-6 text-[14px] font-bold text-[#060b1c]">Book <ArrowRight size={17} /></a></Magnetic>
        </motion.div>
        </div>
      </motion.div>
      <div className="pointer-events-none absolute bottom-6 left-6 z-10 flex items-center gap-2 text-[12px] font-semibold text-white/60 md:left-10"><Star size={14} fill={CY} stroke="none" />{b.rating} on Google · {b.rev} reviews</div>
    </section>
  )
}

/* transition 1: droplet ripple — the section opens as an expanding circle with rings */
function Ripple({ children, bg, id, origin = '50% 0%' }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 15%'] })
  const p = useSpring(scrollYProgress, { stiffness: 70, damping: 20 })
  const r = useTransform(p, [0, 1], [0, 150])
  const cp = useMotionTemplate`circle(${r}% at ${origin})`
  return (
    <section ref={ref} id={id} className="relative" style={{ background: NV }}>
      <motion.div style={{ clipPath: cp, background: bg }} className="relative">{children}</motion.div>
    </section>
  )
}

function Rings() {
  return <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0">{[0, 1, 2].map(k => <motion.span key={k} className="absolute block -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#34e1ff]/40" initial={{ width: 0, height: 0, opacity: .8 }} whileInView={{ width: 900, height: 900, opacity: 0 }} viewport={{ once: false }} transition={{ duration: 2.4, delay: k * .45, repeat: Infinity, ease: 'easeOut' }} />)}</div>
}

function Test({ coated, setCoated }) {
  // contact-angle diagram: bead vs sheet
  const d = coated ? 'M40 150 C40 60 90 40 150 40 C210 40 260 60 260 150 Z' : 'M-10 150 C40 128 90 120 150 120 C210 120 260 128 310 150 Z'
  return (
    <div className="relative overflow-hidden px-6 py-28 text-white md:px-10">
      <Rings />
      <div className="relative mx-auto max-w-[1240px]">
        <p className="mb-4 text-center text-[12px] font-semibold uppercase tracking-[.25em] text-[#34e1ff]">The water test</p>
        <h2 className={`${H} mx-auto mb-6 max-w-[900px] text-center text-[clamp(34px,5.4vw,80px)] font-bold leading-[.98] tracking-[-.03em]`}><Sheen text="One drop tells you everything." /></h2>
        <div className="mb-14 flex justify-center"><Toggle coated={coated} set={setCoated} /></div>
        <div className="grid items-center gap-10 md:grid-cols-[1.1fr_.9fr]">
          <div className="relative overflow-hidden rounded-[36px] p-6 ring-1 ring-white/10" style={{ background: 'linear-gradient(180deg,#0e1b3d,#071028)' }}>
            <svg viewBox="0 0 300 190" className="w-full">
              <defs>
                <linearGradient id="wt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffffff" stopOpacity=".95" /><stop offset=".5" stopColor="#9ff3ff" stopOpacity=".55" /><stop offset="1" stopColor="#34e1ff" stopOpacity=".25" /></linearGradient>
                <linearGradient id="pn" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#0b2350" /><stop offset=".5" stopColor="#2a4f9a" /><stop offset="1" stopColor="#0b2350" /></linearGradient>
              </defs>
              <rect x="0" y="150" width="300" height="40" fill="url(#pn)" />
              <rect x="0" y="150" width="300" height="3" fill={coated ? CY : '#5a6273'} opacity=".9" />
              <motion.path d={d} animate={{ d }} transition={{ type: 'spring', stiffness: 90, damping: 14 }} fill="url(#wt)" stroke="#bff6ff" strokeOpacity=".6" />
              <motion.ellipse animate={{ cx: coated ? 115 : 120, cy: coated ? 72 : 128, rx: coated ? 26 : 50, ry: coated ? 12 : 3 }} fill="#fff" opacity=".7" />
            </svg>
            <div className="mt-4 flex items-center justify-between text-[12px] font-semibold uppercase tracking-[.2em]">
              <span className="text-white/50">Contact angle</span>
              <motion.span key={String(coated)} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={coated ? 'text-[#34e1ff]' : 'text-white/70'}>{coated ? 'High — water beads' : 'Low — water sheets'}</motion.span>
            </div>
          </div>
          <div>
            <AnimatePresence mode="wait">
              <motion.ul key={String(coated)} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} className="grid gap-4">
                {(coated ? PROS.coated : PROS.bare).map((t, k) => (
                  <motion.li key={t} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: k * .07 }} className="flex items-start gap-4 border-b border-white/10 pb-4 text-[18px] md:text-[20px]">
                    <span className={`mt-2 h-3 w-3 shrink-0 rounded-full ${coated ? 'bg-[#34e1ff] shadow-[0_0_14px_#34e1ff]' : 'bg-[#5a6273]'}`} />{t}
                  </motion.li>
                ))}
              </motion.ul>
            </AnimatePresence>
            <a href="#book" data-svc="Ceramic coating" className="mt-8 inline-flex h-14 items-center gap-2 rounded-full px-7 text-[14px] font-bold text-[#060b1c]" style={{ background: CY }}>Ask about ceramic coating <ArrowRight size={17} /></a>
          </div>
        </div>
      </div>
    </div>
  )
}

/* transition 2: sticky stacked cards that sink back as the next one slides over */
function StackCard({ t, d, I, k, total, progress }) {
  const sc = useTransform(progress, [k / total, 1], [1, 1 - (total - k) * .035])
  const br = useTransform(progress, [k / total, 1], [1, .55])
  const filter = useMotionTemplate`brightness(${br})`
  return (
    <div className="sticky h-[64vh] min-h-[380px] pt-4" style={{ top: `calc(90px + ${k * 18}px)` }}>
      <motion.div style={{ scale: sc, filter }} className="relative flex h-full origin-top flex-col justify-between overflow-hidden rounded-[36px] p-7 text-[#060b1c] shadow-[0_-20px_60px_-20px_rgba(0,0,0,.5)] md:p-12"
        data-cursor="Book">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, #eef2f7 0%, ${SL} 55%, #9aa6b8 100%)` }} />
        <div className="absolute -right-24 -top-24 h-[360px] w-[360px] rounded-full opacity-60 blur-[90px]" style={{ background: CY }} />
        <div className="relative flex items-start justify-between gap-6">
          <span className={`${H} text-[clamp(18px,2vw,24px)] font-semibold text-[#060b1c]/50`}>0{k + 1}</span>
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-[#060b1c] text-[#34e1ff]"><I size={28} /></span>
        </div>
        <div className="relative">
          <h3 className={`${H} mb-4 text-[clamp(32px,5vw,72px)] font-bold leading-[.95] tracking-[-.03em]`}>{t}</h3>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <p className="max-w-[460px] text-[16px] leading-relaxed text-[#060b1c]/70 md:text-[18px]">{d}</p>
            <a href="#book" data-svc={t} className="inline-flex h-12 items-center gap-2 rounded-full bg-[#060b1c] px-6 text-[14px] font-bold text-white">Book <ArrowRight size={16} /></a>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function Services() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  return (
    <section id="services" className="relative px-4 pb-24 pt-28 md:px-10" style={{ background: NV }}>
      <div className="mx-auto max-w-[1240px]">
        <h2 className={`${H} mb-10 text-[clamp(38px,6vw,96px)] font-bold leading-[.92] tracking-[-.03em] text-white`}><Sheen text="What we do" /></h2>
        <div ref={ref} className="relative">{SV.map(([t, d, I], k) => <StackCard key={t} t={t} d={d} I={I} k={k} total={SV.length} progress={scrollYProgress} />)}</div>
      </div>
    </section>
  )
}

/* transition 3: navy → silver colour morph with the rating */
function Proof() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 35%'] })
  const bg = useTransform(scrollYProgress, [0, 1], [NV, '#dfe4eb'])
  const fg = useTransform(scrollYProgress, [0, .35, .55, 1], ['#ffffff', '#ffffff', '#060b1c', '#060b1c'])
  return (
    <motion.section ref={ref} style={{ background: bg, color: fg }} className="relative overflow-hidden px-6 py-32 md:px-10">
      <div className="mx-auto grid max-w-[1240px] items-center gap-12 md:grid-cols-2">
        <div>
          <div className="flex items-center gap-1.5">{[0, 1, 2, 3, 4].map(i => <motion.span key={i} initial={{ y: -40, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * .08, type: 'spring', bounce: .6 }}><Star size={30} fill="#0aa5c8" stroke="none" /></motion.span>)}</div>
          <p className={`${H} mt-6 text-[clamp(96px,16vw,220px)] font-bold leading-[.82] tracking-[-.05em]`}>{b.rating}</p>
          <p className="mt-6 text-[20px] font-semibold">Google rating from <Counter to={b.rev} className={`${H} font-bold`} /> reviews</p>
        </div>
        <ScrollWords className={`${H} text-[clamp(22px,2.6vw,34px)] font-semibold leading-[1.25]`} text="Seventy-seven people took the time to leave a review. That says more about the finish than any brochure could." />
      </div>
    </motion.section>
  )
}

function Splash() {
  return <div aria-hidden="true" className="pointer-events-none absolute inset-0 grid place-items-center">{[0, 1, 2, 3].map(k => <motion.span key={k} className="absolute rounded-full border-2 border-[#34e1ff]" initial={{ width: 0, height: 0, opacity: 1 }} animate={{ width: 520, height: 520, opacity: 0 }} transition={{ duration: 1.6, delay: k * .22, ease: 'easeOut' }} />)}</div>
}

function Book() {
  const bk = useBooking()
  const f = 'h-14 w-full rounded-2xl bg-white/[.05] px-5 text-[16px] text-white outline-none ring-1 ring-white/15 placeholder:text-white/40 focus:ring-2 focus:ring-[#34e1ff]'
  return (
    <div className="relative overflow-hidden px-6 py-28 text-white md:px-10">
      <div className="relative mx-auto grid max-w-[1200px] gap-12 md:grid-cols-2">
        <div>
          <h2 className={`${H} text-[clamp(40px,6vw,88px)] font-bold leading-[.92] tracking-[-.03em]`}><Sheen text="Book your" /><br /><span className="text-[#34e1ff]"><Sheen text="coating." delay={.3} /></span></h2>
          <p className="mb-8 mt-6 max-w-[420px] text-[17px] text-[#c9d1dc]/75">Tell us about the car and what you are after. We will come back to you to talk options and find a date.</p>
          <a href={'tel:' + tel(b.phone)} className={`${H} block text-[28px] font-semibold`}>{b.phone}</a>
        </div>
        <div className="relative rounded-[32px] bg-white/[.04] p-7 ring-1 ring-white/10 backdrop-blur-xl md:p-10">
          <AnimatePresence mode="wait">
            {!bk.s.sent ? (
              <motion.form key="f" exit={{ opacity: 0, scale: .95 }} onSubmit={bk.submit} noValidate className="grid gap-4">
                <input className={f} placeholder="Your name" value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} autoComplete="name" />
                <motion.input animate={bk.s.err ? { x: [0, -8, 8, -6, 6, 0] } : {}} className={f + (bk.s.err ? ' ring-2 !ring-red-400' : '')} type="tel" inputMode="tel" placeholder="+44 7___ ______" value={bk.s.phone} onFocus={phoneFocus(bk, '+44 ')} onChange={e => bk.upd('phone', e.target.value)} autoComplete="tel" />
                <div className="flex flex-wrap gap-2">{SV.map(s => s[0]).map(t => <button type="button" key={t} onClick={() => bk.upd('svc', t)} className={`rounded-full px-4 py-2 text-[13px] font-semibold transition-colors ${bk.s.svc === t ? 'bg-[#34e1ff] text-[#060b1c]' : 'bg-white/[.07] text-white/75 hover:bg-white/15'}`}>{t}</button>)}</div>
                <button disabled={bk.s.loading} className="mt-2 h-16 rounded-2xl text-[16px] font-bold text-[#060b1c] transition-[scale,opacity] active:scale-[.97] disabled:opacity-60" style={{ background: CY }}>{bk.s.loading ? 'Sending…' : 'Send request'}</button>
                <p className="text-[13px] text-white/45">In the finished site this request goes straight to your phone / Telegram.</p>
              </motion.form>
            ) : (
              <motion.div key="ok" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative grid min-h-[340px] place-items-center text-center">
                <Splash />
                <div className="relative"><CheckDraw className="mx-auto mb-5 text-[#34e1ff]" /><h3 className={`${H} text-[30px] font-bold`}>Request received</h3><p className="mx-auto mb-5 max-w-[320px] text-white/65">In the finished site this request goes straight to your phone / Telegram.</p><button onClick={bk.reset} className="font-bold underline underline-offset-4">Send another</button></div>
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
    <section id="contact" className="px-6 py-28 md:px-10" style={{ background: NV2 }}>
      <div className="mx-auto grid max-w-[1240px] gap-6 md:grid-cols-[.9fr_1.1fr]">
        <Reveal className="grid content-start gap-6 text-white">
          <h2 className={`${H} text-[clamp(40px,6vw,84px)] font-bold leading-[.92] tracking-[-.03em]`}><Sheen text="Find us" /></h2>
          <p className="flex items-start gap-3 text-[20px] font-semibold"><MapPin className="mt-1 shrink-0 text-[#34e1ff]" />{b.addr}</p>
          <a href={'tel:' + tel(b.phone)} className={`${H} flex items-center gap-3 text-[26px] font-semibold`}><Phone className="text-[#34e1ff]" />{b.phone}</a>
          <div className="flex flex-wrap gap-2">
            <a href={waLink(b.phone)} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-full bg-[#34e1ff] px-5 py-3 font-bold text-[#060b1c]"><WA />WhatsApp</a>
            <a href={b.fb} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-3 font-bold ring-1 ring-white/15"><FB />Facebook</a>
          </div>
        </Reveal>
        <Reveal delay={.1} className="h-[420px] overflow-hidden rounded-[32px] ring-1 ring-white/10"><GMap q={`${b.name}, ${b.addr}`} dark /></Reveal>
      </div>
    </section>
  )
}

function App() {
  useSmooth()
  const lite = useLite()
  const [coated, setCoatedS] = useState(true)
  const coatedRef = useRef(true)
  const setCoated = v => { coatedRef.current = v; setCoatedS(v) }
  return (
    <MotionConfig reducedMotion="user">
      <div className="font-['DM_Sans',sans-serif]" style={{ background: NV, color: '#fff', '--sel': CY, '--selc': NV }}>
        <Intro bg={NV} fg="#fff" duration={1.6}>
          <div className="relative grid place-items-center">
            <motion.span className="block h-4 w-4 rounded-full bg-[#34e1ff]" initial={{ y: -120, scaleY: 1.6 }} animate={{ y: 0, scaleY: [1.6, 1, .3], opacity: [1, 1, 0] }} transition={{ duration: .6, ease: 'easeIn' }} />
            {[0, 1, 2].map(k => <motion.span key={k} className="absolute rounded-full border border-[#34e1ff]" initial={{ width: 0, height: 0, opacity: 0 }} animate={{ width: 280, height: 90, opacity: [0, 1, 0] }} transition={{ duration: 1, delay: .55 + k * .15 }} />)}
            <span className={`${H} absolute top-10 whitespace-nowrap text-[22px] font-bold`}>SK Detailing</span>
          </div>
        </Intro>
        <Progress color={CY} />
        <Cursor color={CY} blend="normal" textColor={NV} />
        <Ribbon lang="en" name={b.name} bg={SL} fg={NV} />
        <header className="sticky top-0 z-40 border-b border-white/5 bg-[#060b1c]/70 backdrop-blur-xl">
          <div className="mx-auto flex h-[66px] max-w-[1320px] items-center justify-between px-6 md:px-10">
            <a href="#top" className={`${H} flex items-center gap-2.5 text-[17px] font-bold`}><span className="h-5 w-5 rounded-[50%_50%_50%_0] bg-gradient-to-br from-white to-[#34e1ff] -rotate-45" />SK Detailing</a>
            <nav className="hidden gap-8 text-[14px] font-medium text-white/60 md:flex">{[['#test', 'Water test'], ['#services', 'Services'], ['#book', 'Book'], ['#contact', 'Contact']].map(([h, t]) => <a key={h} href={h} className="hover:text-white">{t}</a>)}</nav>
            <a href={'tel:' + tel(b.phone)} className="hidden h-10 items-center gap-2 rounded-full bg-white px-5 text-[14px] font-bold text-[#060b1c] sm:inline-flex"><Phone size={15} />Call</a>
          </div>
        </header>
        <main id="top">
          <Hero lite={lite} coated={coated} setCoated={setCoated} coatedRef={coatedRef} />
          <div className="border-y border-white/5 py-5">
            <Marquee base={-1.6}>{['ceramic coating', 'gloss', 'hydrophobic', 'protection', 'valeting', 'detailing'].map(t => <span key={t} className={`${H} mx-6 inline-flex items-center gap-12 text-[clamp(28px,4vw,56px)] font-bold text-[#c9d1dc]`}>{t}<span className="inline-block h-3 w-3 rounded-[50%_50%_50%_0] -rotate-45 bg-[#34e1ff]" /></span>)}</Marquee>
          </div>
          <Ripple id="test" bg={`radial-gradient(120% 80% at 50% 0%, #10224a, ${NV2} 60%)`}><Test coated={coated} setCoated={setCoated} /></Ripple>
          <Services />
          <Proof />
          <Ripple id="book" origin="50% 100%" bg={`radial-gradient(120% 80% at 50% 100%, #10224a, ${NV} 70%)`}><Book /></Ripple>
          <Contact />
        </main>
        <footer className="px-6 py-10 text-[13px] text-white/45 md:px-10" style={{ background: NV2 }}><div className="mx-auto flex max-w-[1320px] flex-wrap justify-between gap-4 border-t border-white/10 pt-8"><span>© 2026 {b.name} · Website concept by Artem</span><span>{b.addr}</span></div></footer>
        <CallBar lang="en" phone={b.phone} barCls="bg-[#060b1c]/85 backdrop-blur-xl" callCls="rounded-2xl bg-white/10 text-white" bookCls="rounded-2xl text-[#060b1c] bg-[#34e1ff]" />
        <div className="h-[72px] sm:hidden" />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
