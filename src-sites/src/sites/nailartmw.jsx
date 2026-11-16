import React, { useRef, useState, useEffect, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, useSpring, useMotionValue, AnimatePresence, MotionConfig } from 'framer-motion'
import { ArrowRight, ArrowUpRight, MapPin, Brush, CircleDot, Minus, PaintBucket, Undo2, RotateCcw, Shuffle, Star, X } from 'lucide-react'
import '../lib/base.css'
import { LineReveal, useSmooth, Ribbon, SplitText, ScrollWords, Reveal, Magnetic, Cursor, Marquee, Counter, useBooking, phoneFocus, CheckDraw, GMap, CallBar, Progress, Intro, tel, useLite, WA, waLink, IG } from '../lib/kit'
import { getCanvas, store, drawDefault, drawRandom, PAINTS, NAIL_D, NAIL_BB, W, H } from './nailartmw-paint'

const NailScene = lazy(() => import('./nailartmw3d'))
const b = {
  name: 'Nailart_MW', phone: '+44 7454 453655', addr: '52 Blucher St, Birmingham B1 1QU',
  ig: 'https://www.instagram.com/nailart_mw', rating: 4.9, rev: 338,
}
const PAPER = '#f7f5f0', INK = '#121212', RED = '#ff3b1f', BLUE = '#2541ff', YEL = '#ffd60a'
const HEAD = "font-['Syne',sans-serif]", HAND = "font-['Caveat',cursive]"
const TOOLS = [['brush', 'Brush', Brush], ['dots', 'Dots', CircleDot], ['stripes', 'Stripes', Minus], ['fill', 'Base coat', PaintBucket]]
const SIZES = [['S', 10], ['M', 24], ['L', 46]]
const SV = [
  ['Gel polish manicure', 'Gel colour on natural nail', 'Shaped, prepped and finished in glossy gel colour that keeps its shine.', 'solid'],
  ['Builder gel (BIAB)', 'Strengthening gel overlay', 'A flexible overlay that helps natural nails grow longer and stronger.', 'milky'],
  ['Extensions', 'Sculpted gel / tips', 'Extra length and the shape you want — almond, coffin, square or stiletto.', 'long'],
  ['Hand-painted nail art', 'Fine brush, gel paint', 'Line work, florals, characters, abstract pieces — painted freehand.', 'art'],
  ['Chrome & effects', 'Chrome powder, cat-eye gel', 'Mirror chrome, aurora shimmer and magnetic cat-eye finishes.', 'chrome'],
  ['French & ombré', 'Gel, airbrush blend', 'Clean classic tips, colour French and soft gradient fades.', 'french'],
]

/* ---------------- small visual helpers ---------------- */
function Splash({ color, className = '', delay = 0 }) {
  return (
    <motion.svg viewBox="0 0 200 200" aria-hidden="true" className={'pointer-events-none absolute ' + className} initial={{ scale: 0, rotate: -30 }} whileInView={{ scale: 1, rotate: 0 }} viewport={{ once: true }} transition={{ type: 'spring', stiffness: 160, damping: 11, delay }}>
      <path fill={color} d="M100 28c14 0 18-22 30-18s0 26 12 34 30-8 34 4-22 16-20 30 26 16 22 30-26 2-32 14 10 30-2 36-18-18-32-16-14 34-28 30-2-28-14-34-30 10-36-2 18-20 12-32-34-6-32-20 28-8 30-22-20-26-10-34 24 10 34 2-2-30 10-32 14 14 22 14z" />
      <circle cx="176" cy="40" r="7" fill={color} /><circle cx="20" cy="150" r="5" fill={color} /><circle cx="160" cy="178" r="4" fill={color} />
    </motion.svg>
  )
}

/* a section whose background is painted on with a giant zig-zag brush stroke as it scrolls in */
function PaintWipe({ color, id, className = '', children }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 0.1'] })
  const pl = useSpring(scrollYProgress, { stiffness: 90, damping: 24, restDelta: .001 })
  const solid = useTransform(pl, [.92, 1], [0, 1])
  const show = useTransform(pl, [.45, .8], [0, 1])
  return (
    <section ref={ref} id={id} className={'relative ' + className}>
      <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <motion.path d="M-14 3L114 9L-14 22L114 30L-14 43L114 51L-14 64L114 72L-14 85L114 93L-14 104" fill="none" stroke={color} strokeWidth="19" strokeLinecap="round" strokeLinejoin="round" style={{ pathLength: pl }} />
      </svg>
      <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: color, opacity: solid }} />
      <motion.div style={{ opacity: show }} className="relative">{children}</motion.div>
    </section>
  )
}

function StrokeUnder({ color, delay = 0, className = '' }) {
  return (
    <svg viewBox="0 0 400 40" preserveAspectRatio="none" aria-hidden="true" className={'pointer-events-none absolute ' + className}>
      <motion.path d="M6 26C80 10 160 34 230 20S350 12 394 22" fill="none" stroke={color} strokeWidth="14" strokeLinecap="round" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: .9, delay, ease: [0.65, 0, 0.35, 1] }} />
    </svg>
  )
}

/* CSS/SVG painted nail for the gallery exhibits */
function ArtNail({ kind, id }) {
  const cp = `url(#${id})`
  return (
    <svg viewBox="-6 -6 112 162" className="h-full w-auto drop-shadow-[0_24px_30px_rgba(0,0,0,.25)]">
      <defs>
        <clipPath id={id}><path d={NAIL_D} /></clipPath>
        <linearGradient id={id + 'c'} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff" /><stop offset=".3" stopColor="#9aa0a8" /><stop offset=".5" stopColor="#f4f6f8" /><stop offset=".75" stopColor="#6f757d" /><stop offset="1" stopColor="#dfe3e8" /></linearGradient>
        <linearGradient id={id + 'g'} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset=".22" stopColor="#fff" stopOpacity=".6" /><stop offset=".34" stopColor="#fff" stopOpacity="0" /></linearGradient>
        <linearGradient id={id + 'o'} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ff3b1f" /><stop offset=".7" stopColor="#ffd60a" stopOpacity=".9" /><stop offset="1" stopColor="#f6efe6" /></linearGradient>
      </defs>
      <g clipPath={cp}>
        {kind === 'solid' && <rect width="100" height="150" fill={RED} />}
        {kind === 'milky' && <rect width="100" height="150" fill="#f3d6cf" />}
        {kind === 'long' && <><rect width="100" height="150" fill={INK} /><path d="M0 40L100 90V150H0Z" fill={BLUE} /></>}
        {kind === 'art' && <><rect width="100" height="150" fill="#f6efe6" /><path d="M-5 100C30 60 60 130 105 80" stroke={RED} strokeWidth="18" fill="none" strokeLinecap="round" /><path d="M10 30C40 10 60 60 92 40" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" /><circle cx="68" cy="58" r="12" fill={YEL} />{[0, 1, 2, 3, 4].map(i => <circle key={i} cx={18 + i * 15} cy={128 - i * 3} r="3" fill={INK} />)}</>}
        {kind === 'chrome' && <rect width="100" height="150" fill={`url(#${id}c)`} />}
        {kind === 'french' && <><rect width="100" height="150" fill={`url(#${id}o)`} /><path d="M0 0H100V34C70 50 30 50 0 34Z" fill="#fbf8f2" /></>}
        <rect width="100" height="150" fill={`url(#${id}g)`} />
      </g>
      <path d={NAIL_D} fill="none" stroke="rgba(0,0,0,.18)" strokeWidth="1" />
    </svg>
  )
}

/* ---------------- hero ---------------- */
function LiteNail({ snap, className = '' }) {
  return (
    <div className={'grid place-items-center [perspective:900px] ' + className}>
      <motion.div animate={{ rotateY: [-25, 25, -25] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} className="aspect-[2/3] h-[70%] max-h-[420px]" style={{ clipPath: 'url(#nailclip)' }}>
        {snap && <img src={snap} alt="" className="h-full w-full" />}
      </motion.div>
    </div>
  )
}

function Hero({ lite, snap }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const ty = useTransform(scrollYProgress, [0, 1], ['0%', '-18%'])
  const op = useTransform(scrollYProgress, [0, .7], [1, 0])
  return (
    <section ref={ref} className="relative h-[100svh] min-h-[660px] overflow-hidden" style={{ background: PAPER }}>
      <div aria-hidden="true" className="absolute inset-0 opacity-[.5]" style={{ backgroundImage: 'linear-gradient(#12121210 1px,transparent 1px),linear-gradient(90deg,#12121210 1px,transparent 1px)', backgroundSize: '48px 48px' }} />
      <Splash color={YEL} className="-left-16 top-[8%] w-[200px] md:w-[300px]" delay={1.6} />
      <Splash color={BLUE} className="-right-10 bottom-[6%] w-[140px] md:w-[220px]" delay={1.8} />
      <div className="absolute inset-x-0 top-0 h-[52%] md:inset-y-0 md:left-auto md:h-full md:w-[58%]">
        {!lite ? <Suspense fallback={null}><NailScene progress={scrollYProgress} /></Suspense> : <LiteNail snap={snap} className="h-full w-full" />}
      </div>
      <motion.div style={{ y: ty, opacity: op }} className="pointer-events-none relative z-10 mx-auto flex h-full max-w-[1320px] flex-col justify-end px-6 pb-16 md:justify-center md:px-10 md:pb-0">
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5 }} className="mb-5 flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[.26em]"><span className="h-3 w-3 rounded-full" style={{ background: RED }} />Nail art studio · Blucher St, Birmingham</motion.p>
        <h1 className={`${HEAD} max-w-[760px] text-[clamp(38px,6.6vw,104px)] font-extrabold uppercase leading-[.86] tracking-[-.04em]`}>
          <SplitText text="Tiny" delay={1.3} y="120%" rotate={10} className="block" />
          <SplitText text="canvases." delay={1.45} y="120%" rotate={10} className="block" />
          <span className="relative inline-block">
            <LineReveal delay={1.8}><span style={{ color: RED }}>Big art.</span></LineReveal>
            <StrokeUnder color={BLUE} delay={2.3} className="-bottom-[.08em] left-0 h-[.24em] w-full" />
          </span>
        </h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.1 }} className="mt-7 max-w-[440px] text-[17px] leading-relaxed text-black/65">Hand-painted nail art on a canvas the size of a fingertip. Bring an idea, a screenshot or a scribble — leave with a set worth framing.</motion.p>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.3 }} className="pointer-events-auto mt-8 flex flex-wrap gap-3">
          <Magnetic><a href="#book" data-cursor="Book" className={`${HEAD} inline-flex h-14 items-center gap-3 rounded-full px-8 text-[15px] font-bold text-white`} style={{ background: INK }}>Book a set <ArrowRight size={18} /></a></Magnetic>
          <a href="#studio" className={`${HEAD} inline-flex h-14 items-center gap-2 rounded-full border-2 border-black px-7 text-[15px] font-bold`}><Brush size={17} />Paint your own</a>
        </motion.div>
      </motion.div>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.8 }} className={`${HAND} absolute right-6 top-6 z-10 hidden rotate-[-6deg] text-[28px] md:block`} style={{ color: BLUE }}>this nail is painted live ↓</motion.p>
    </section>
  )
}

/* ---------------- signature: paint studio ---------------- */
function ToolBtn({ on, onClick, children, label }) {
  return <button type="button" aria-label={label} aria-pressed={on} onClick={onClick} className={`flex h-12 items-center gap-2 rounded-full px-4 text-[14px] font-semibold transition-colors ${on ? 'bg-black text-white' : 'bg-white text-black ring-1 ring-black/15 hover:ring-black/50'}`}>{children}</button>
}

function Studio({ lite, onSnap, onBook }) {
  const host = useRef(null)
  const [tool, setTool] = useState('brush'), [col, setCol] = useState(RED), [size, setSize] = useState(1)
  const st = useRef({}); st.current = { tool, col, size: SIZES[size][1] }
  const snapRef = useRef(onSnap); snapRef.current = onSnap
  useEffect(() => {
    const c = getCanvas(), ctx = c.getContext('2d')
    host.current.appendChild(c)
    c.className = 'block h-full w-full touch-none select-none'
    c.style.clipPath = 'url(#nailclip)'
    let drawing = false, last = null, start = null, base = null
    const pt = e => { const r = c.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * W, (e.clientY - r.top) / r.height * H] }
    const dot = (x, y, r) => { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = st.current.col; ctx.fill() }
    const down = e => {
      e.preventDefault(); try { c.setPointerCapture(e.pointerId) } catch (_) {}
      const p = pt(e), { tool, col, size } = st.current
      store.undo.push(ctx.getImageData(0, 0, W, H)); if (store.undo.length > 12) store.undo.shift()
      drawing = true; start = last = p
      if (tool === 'fill') { ctx.fillStyle = col; ctx.fillRect(0, 0, W, H); drawing = false; snapRef.current() }
      else if (tool === 'dots') dot(p[0], p[1], size * .6)
      else if (tool === 'brush') dot(p[0], p[1], size / 2)
      else base = ctx.getImageData(0, 0, W, H)
      store.ver++
    }
    const move = e => {
      if (!drawing) return
      const p = pt(e), { tool, col, size } = st.current
      if (tool === 'brush') {
        const d = Math.hypot(p[0] - last[0], p[1] - last[1])
        ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.lineJoin = 'round'
        ctx.lineWidth = size * Math.max(.55, 1.15 - d / 60)
        ctx.beginPath(); ctx.moveTo(last[0], last[1]); ctx.lineTo(p[0], p[1]); ctx.stroke(); last = p
      } else if (tool === 'dots') {
        if (Math.hypot(p[0] - last[0], p[1] - last[1]) > size * 1.9) { dot(p[0], p[1], size * .6); last = p }
      } else if (tool === 'stripes') {
        ctx.putImageData(base, 0, 0); ctx.strokeStyle = col; ctx.lineWidth = size * .8; ctx.lineCap = 'butt'
        ctx.beginPath(); ctx.moveTo(start[0], start[1]); ctx.lineTo(p[0], p[1]); ctx.stroke(); last = p
      }
      store.ver++
    }
    const up = () => {
      if (!drawing) return
      drawing = false
      const { tool, col, size } = st.current
      if (tool === 'stripes' && Math.hypot(last[0] - start[0], last[1] - start[1]) < 8) {
        ctx.putImageData(base, 0, 0); ctx.fillStyle = col; ctx.fillRect(0, start[1] - size * .4, W, size * .8); store.ver++
      }
      snapRef.current()
    }
    c.addEventListener('pointerdown', down); c.addEventListener('pointermove', move)
    c.addEventListener('pointerup', up); c.addEventListener('pointercancel', up); c.addEventListener('pointerleave', up)
    return () => { c.removeEventListener('pointerdown', down); c.removeEventListener('pointermove', move); c.removeEventListener('pointerup', up); c.removeEventListener('pointercancel', up); c.removeEventListener('pointerleave', up); c.remove() }
  }, [])
  const ctx = () => getCanvas().getContext('2d')
  const undo = () => { const d = store.undo.pop(); if (d) { ctx().putImageData(d, 0, 0); store.ver++; onSnap() } }
  const clear = () => { store.undo.push(ctx().getImageData(0, 0, W, H)); const c = ctx(); c.fillStyle = '#f6efe6'; c.fillRect(0, 0, W, H); store.ver++; onSnap() }
  const surprise = () => { store.undo.push(ctx().getImageData(0, 0, W, H)); drawRandom(getCanvas()); store.ver++; onSnap() }
  return (
    <div className="mx-auto max-w-[1320px] px-6 pb-28 pt-32 md:px-10">
      <div className="mb-12 grid gap-6 md:grid-cols-[1.2fr_1fr] md:items-end">
        <h2 className={`${HEAD} text-[clamp(42px,6.6vw,104px)] font-extrabold uppercase leading-[.88] tracking-[-.04em] text-white`}>
          <SplitText text="The studio" className="block" /><span className="relative inline-block" style={{ color: YEL }}>table.<StrokeUnder color={RED} className="-bottom-1 left-0 h-[.2em] w-full" delay={.4} /></span>
        </h2>
        <p className="max-w-[420px] text-[17px] text-white/70">Pick a brush, a colour, and paint on the nail. Every stroke lands on the 3D tip in real time. Like it? Send it with your booking.</p>
      </div>
      <div className="grid items-center gap-8 rounded-[32px] p-5 md:grid-cols-[auto_1fr_1fr] md:gap-10 md:p-10" style={{ background: PAPER }}>
        <div className="order-3 grid gap-5 md:order-1">
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[.2em] text-black/45">Tool</p>
            <div className="flex flex-wrap gap-2 md:grid">{TOOLS.map(([k, t, I]) => <ToolBtn key={k} on={tool === k} onClick={() => setTool(k)} label={t}><I size={17} />{t}</ToolBtn>)}</div>
          </div>
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[.2em] text-black/45">Colour</p>
            <div className="flex gap-2">{PAINTS.map(([n, c]) => <button key={n} type="button" aria-label={n} title={n} onClick={() => setCol(c)} className={`h-11 w-11 rounded-full ring-black/15 transition-transform ${col === c ? 'scale-110 ring-[3px] ring-black ring-offset-2' : 'ring-1'}`} style={{ background: c }} />)}</div>
          </div>
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[.2em] text-black/45">Size</p>
            <div className="flex gap-2">{SIZES.map(([n], k) => <ToolBtn key={n} on={size === k} onClick={() => setSize(k)} label={'Size ' + n}><span className="w-4 text-center">{n}</span></ToolBtn>)}</div>
          </div>
          <div className="flex flex-wrap gap-2">
            <ToolBtn onClick={undo} label="Undo"><Undo2 size={16} />Undo</ToolBtn>
            <ToolBtn onClick={clear} label="Clear"><RotateCcw size={16} />Clear</ToolBtn>
            <ToolBtn onClick={surprise} label="Surprise me"><Shuffle size={16} />Surprise</ToolBtn>
          </div>
        </div>
        <div className="order-2 grid place-items-center">
          <div className="relative">
            <div className="absolute -inset-5 rounded-[40px] bg-white shadow-[0_30px_60px_-30px_rgba(0,0,0,.35)]" />
            <div ref={host} className="relative aspect-[2/3] w-[min(62vw,280px)] cursor-crosshair" aria-label="Nail canvas — draw here" role="img" />
            <svg viewBox="-2 -2 104 154" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden="true"><path d={NAIL_D} fill="none" stroke="#12121230" strokeWidth="1" strokeDasharray="3 3" /></svg>
            <p className={`${HAND} absolute -right-4 -top-10 rotate-6 text-[24px]`} style={{ color: BLUE }}>draw here!</p>
          </div>
        </div>
        <div className="order-1 grid gap-4 md:order-3">
          <div className="relative h-[230px] overflow-hidden rounded-[24px] md:h-[440px]" style={{ background: 'radial-gradient(circle at 50% 40%,#fff,#ece8e1)' }}>
            {!lite ? <Suspense fallback={null}><NailScene studio /></Suspense> : <LiteNail snap={null} className="h-full" />}
            <span className="absolute left-4 top-4 rounded-full bg-black px-3 py-1 text-[11px] font-bold uppercase tracking-[.16em] text-white">Live 3D</span>
          </div>
          <Magnetic className="w-full"><button type="button" onClick={onBook} data-cursor="Book it" className={`${HEAD} flex h-14 w-full items-center justify-center gap-3 rounded-full text-[15px] font-bold text-white`} style={{ background: RED }}>Book with this design <ArrowRight size={18} /></button></Magnetic>
        </div>
      </div>
    </div>
  )
}

/* ---------------- gallery: horizontal exhibition ---------------- */
function Gallery() {
  const ref = useRef(null), track = useRef(null)
  const [dist, setDist] = useState(0)
  const dmv = useMotionValue(0)
  useEffect(() => {
    const m = () => { const d = Math.max(0, track.current.scrollWidth - innerWidth); setDist(d); dmv.set(d) }
    m(); addEventListener('resize', m); return () => removeEventListener('resize', m)
  }, [])
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const x = useTransform([scrollYProgress, dmv], ([v, d]) => -v * d)
  return (
    <section ref={ref} id="services" className="relative" style={{ height: `calc(100vh + ${dist}px)`, background: PAPER }}>
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <motion.div ref={track} style={{ x }} className="flex items-stretch gap-6 pl-6 pr-[10vw] md:gap-10 md:pl-10">
          <div className="flex w-[78vw] shrink-0 flex-col justify-center sm:w-[440px]">
            <p className="mb-4 text-[12px] font-bold uppercase tracking-[.26em] text-black/50">Now showing</p>
            <h2 className={`${HEAD} text-[clamp(44px,6vw,92px)] font-extrabold uppercase leading-[.88] tracking-[-.04em]`}>The <span style={{ color: BLUE }}>collection</span></h2>
            <p className="mt-6 max-w-[360px] text-[16px] text-black/60">Six ways to wear art. Scroll through the exhibition — tap any piece to book it.</p>
          </div>
          {SV.map(([t, med, d, kind], k) => (
            <a key={t} href="#book" data-svc={t} data-cursor="Book" className="group flex w-[74vw] shrink-0 flex-col sm:w-[340px]">
              <div className="relative grid h-[44vh] max-h-[400px] place-items-center overflow-hidden rounded-[6px] border-[10px] border-black bg-white p-8 transition-transform duration-500 group-hover:-rotate-1 group-hover:scale-[1.02]">
                <motion.div className="h-full" initial={{ rotate: -8 }} whileInView={{ rotate: k % 2 ? 5 : -5 }} transition={{ type: 'spring', stiffness: 60 }}><ArtNail kind={kind} id={'an' + k} /></motion.div>
                <span className="absolute left-3 top-3 h-3 w-3 rounded-full" style={{ background: [RED, BLUE, YEL][k % 3] }} />
              </div>
              <div className="mt-4 border-l-4 border-black bg-white p-4 shadow-[0_10px_30px_-20px_rgba(0,0,0,.4)]">
                <p className="text-[11px] font-bold uppercase tracking-[.2em] text-black/45">No. 0{k + 1}</p>
                <h3 className={`${HEAD} text-[22px] font-bold leading-tight`}>{t}</h3>
                <p className="text-[13px] italic text-black/55">{med}</p>
                <p className="mt-2 text-[14px] text-black/70">{d}</p>
              </div>
            </a>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ---------------- booking ---------------- */
function Book({ bk, design, clearDesign }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start start'] })
  const clip = useTransform(scrollYProgress, [0, 1], ['circle(6% at 50% 30%)', 'circle(90% at 50% 30%)'])
  const f = 'h-14 w-full rounded-2xl bg-white/10 px-5 text-[17px] text-white outline-none ring-1 ring-white/15 placeholder:text-white/40 focus:ring-2 focus:ring-[#ffd60a]'
  return (
    <section ref={ref} id="book" className="relative" style={{ background: PAPER }}>
      <motion.div style={{ clipPath: clip, background: INK }} className="relative overflow-hidden px-6 py-28 md:px-10">
        <Splash color={RED} className="-left-20 -top-16 w-[260px] opacity-90" />
        <div className="relative mx-auto grid max-w-[1180px] gap-12 md:grid-cols-2">
          <div className="text-white">
            <h2 className={`${HEAD} text-[clamp(46px,7vw,110px)] font-extrabold uppercase leading-[.86] tracking-[-.04em]`}><SplitText text="Claim a" className="block" /><span className="block" style={{ color: YEL }}>seat.</span></h2>
            <p className="mb-8 mt-6 max-w-[400px] text-[17px] text-white/70">Leave your number and the idea you have in mind — we'll message you back with a time that suits.</p>
            <a href={'tel:' + tel(b.phone)} className={`${HEAD} block text-[32px] font-bold`}>{b.phone}</a>
            <a href={waLink(b.phone)} target="_blank" rel="noopener" className="mt-4 inline-flex h-12 items-center gap-2 rounded-full bg-[#25d366] px-6 font-bold text-black"><WA />WhatsApp</a>
          </div>
          <div className="relative rounded-[28px] bg-white/[.06] p-7 ring-1 ring-white/15 md:p-10">
            <AnimatePresence mode="wait">
              {!bk.s.sent ? (
                <motion.form key="f" exit={{ opacity: 0, scale: .92 }} onSubmit={bk.submit} noValidate className="grid gap-4">
                  <input className={f} placeholder="Your name" value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} autoComplete="name" />
                  <motion.input animate={bk.s.err ? { x: [0, -8, 8, -6, 6, 0] } : {}} className={f + (bk.s.err ? ' ring-2 !ring-red-400' : '')} type="tel" inputMode="tel" placeholder="+44 7___ ______" value={bk.s.phone} onFocus={phoneFocus(bk, '+44 ')} onChange={e => bk.upd('phone', e.target.value)} autoComplete="tel" />
                  <div className="flex flex-wrap gap-2">{SV.map(s => s[0]).map(t => <button type="button" key={t} onClick={() => bk.upd('svc', t)} className={`rounded-full px-4 py-2 text-[13px] font-semibold transition-colors ${bk.s.svc === t ? 'bg-[#ffd60a] text-black' : 'bg-white/10 text-white/80 hover:bg-white/20'}`}>{t}</button>)}</div>
                  <AnimatePresence>{design && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-4 overflow-hidden rounded-2xl bg-white/10 p-3">
                      <img src={design} alt="Your nail design" className="h-20 w-[53px] shrink-0" style={{ clipPath: 'url(#nailclip)' }} />
                      <div className="flex-1 text-[14px] text-white"><b className="block">Your design is attached</b><span className="text-white/60">The artist will see it with your request.</span></div>
                      <button type="button" onClick={clearDesign} aria-label="Remove design" className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white"><X size={16} /></button>
                    </motion.div>)}</AnimatePresence>
                  <button disabled={bk.s.loading} className={`${HEAD} mt-2 h-16 rounded-2xl text-[17px] font-bold text-black transition-[scale,opacity] active:scale-[.97] disabled:opacity-60`} style={{ background: YEL }}>{bk.s.loading ? 'Mixing the paint…' : 'Send request'}</button>
                  <p className="text-[13px] text-white/50">In the finished site this request goes straight to your phone/Telegram.</p>
                </motion.form>
              ) : (
                <motion.div key="ok" initial={{ opacity: 0, scale: .85 }} animate={{ opacity: 1, scale: 1 }} className="relative grid min-h-[340px] place-items-center text-center text-white">
                  <Splash color={RED} className="left-0 top-0 w-24" /><Splash color={BLUE} className="bottom-0 right-0 w-28" delay={.1} /><Splash color={YEL} className="right-6 top-4 w-16" delay={.2} />
                  <div className="relative"><CheckDraw className="mx-auto mb-5 text-[#ffd60a]" /><h3 className={`${HEAD} text-[38px] font-extrabold uppercase`}>Request sent!</h3><p className="mx-auto mb-5 max-w-[300px] text-white/70">This is what your client sees. In the finished site this request goes straight to your phone/Telegram.</p><button onClick={bk.reset} className="font-bold underline underline-offset-4">Send another</button></div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

function App() {
  useSmooth()
  const lite = useLite()
  const bk = useBooking()
  const [design, setDesign] = useState(null)
  const [snap, setSnap] = useState(null)
  useEffect(() => { if (lite) setSnap(getCanvas().toDataURL()) }, [lite])
  const onSnap = () => { if (lite) setSnap(getCanvas().toDataURL()) }
  const onBook = () => {
    setDesign(getCanvas().toDataURL('image/png'))
    bk.upd('svc', 'Hand-painted nail art')
    const el = document.getElementById('book')
    window.__lenis ? window.__lenis.scrollTo(el, { offset: 0 }) : el.scrollIntoView({ behavior: 'smooth' })
  }
  return (
    <MotionConfig reducedMotion="user">
      <div className="font-['Inter_Tight',sans-serif]" style={{ background: PAPER, color: INK, '--sel': RED, '--selc': '#fff' }}>
        <svg width="0" height="0" className="absolute" aria-hidden="true"><defs><clipPath id="nailclip" clipPathUnits="objectBoundingBox"><path d={NAIL_BB} /></clipPath></defs></svg>
        <Intro bg={PAPER} fg={INK} duration={1.6}>
          <div className="relative grid place-items-center">
            <svg viewBox="0 0 400 120" className="absolute w-[340px]"><motion.path d="M10 70C90 20 160 110 230 60S350 30 390 70" fill="none" stroke={RED} strokeWidth="38" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: .8, ease: [0.65, 0, 0.35, 1] }} /></svg>
            <span className={`${HEAD} relative text-[46px] font-extrabold uppercase tracking-[-.03em]`}>Nailart_MW</span>
          </div>
        </Intro>
        <Progress color={RED} />
        <Cursor color={INK} blend="normal" textColor="#fff" />
        <Ribbon lang="en" name={b.name} bg={INK} fg="#fff" />
        <header className="sticky top-0 z-40 border-b border-black/10 bg-[#f7f5f0]/80 backdrop-blur-xl">
          <div className="mx-auto flex h-[66px] max-w-[1320px] items-center justify-between px-6 md:px-10">
            <a href="#top" className={`${HEAD} flex items-center gap-2 text-[22px] font-extrabold`}><span className="flex gap-[3px]">{[RED, BLUE, YEL].map(c => <i key={c} className="block h-3 w-3 rounded-full" style={{ background: c }} />)}</span>Nailart_MW</a>
            <nav className="hidden gap-8 text-[14px] font-semibold text-black/60 md:flex">{[['#studio', 'Studio'], ['#services', 'Collection'], ['#book', 'Book'], ['#contact', 'Visit']].map(([h, t]) => <a key={h} href={h} className="hover:text-black">{t}</a>)}</nav>
            <a href="#book" className={`${HEAD} hidden h-11 items-center rounded-full px-6 text-[14px] font-bold text-white sm:inline-flex`} style={{ background: INK }}>Book now</a>
          </div>
        </header>
        <main id="top">
          <Hero lite={lite} snap={snap} />
          <div className="border-y-2 border-black py-5" style={{ background: YEL }}>
            <Marquee base={-2.2}>
              {['hand-painted', 'gel polish', 'BIAB', 'extensions', 'chrome', 'french', 'line art'].map(t => <span key={t} className={`${HEAD} mx-6 inline-flex items-center gap-10 text-[clamp(32px,4.4vw,64px)] font-extrabold uppercase`}>{t}<Brush size={34} /></span>)}
            </Marquee>
          </div>
          <section className="relative overflow-hidden px-6 py-28 md:px-10" style={{ background: PAPER }}>
            <Splash color={RED} className="-right-16 top-10 w-[160px]" />
            <div className="mx-auto max-w-[1100px]">
              <p className={`${HAND} mb-4 text-[30px]`} style={{ color: RED }}>the idea —</p>
              <ScrollWords className={`${HEAD} text-[clamp(30px,4.4vw,64px)] font-bold leading-[1.08] tracking-[-.02em]`} text="Every nail is a canvas the size of a fingertip. We treat it like one — sketch, colour, line, finish. Ten tiny paintings you carry everywhere." />
            </div>
          </section>
          <PaintWipe id="studio" color={INK}>
            <Studio lite={lite} onSnap={onSnap} onBook={onBook} />
          </PaintWipe>
          <Gallery />
          <PaintWipe color={BLUE}>
            <div className="relative mx-auto grid max-w-[1320px] gap-6 px-6 py-28 text-white md:grid-cols-[1.2fr_1fr_1fr] md:px-10">
              <Reveal><h2 className={`${HEAD} text-[clamp(40px,5.4vw,84px)] font-extrabold uppercase leading-[.9] tracking-[-.04em]`}>The guest book</h2><p className="mt-5 max-w-[340px] text-white/75">What clients say on Google, in numbers. Read every review on the studio's Google profile.</p></Reveal>
              <Reveal delay={.1} className="relative rounded-[28px] bg-white p-8 text-black">
                <span className={`${HEAD} block text-[96px] font-extrabold leading-none`}>4.9</span>
                <span className="mt-2 flex gap-1" style={{ color: RED }}>{[0, 1, 2, 3, 4].map(i => <Star key={i} size={20} fill="currentColor" />)}</span>
                <span className="mt-3 block font-semibold text-black/60">Google rating</span>
              </Reveal>
              <Reveal delay={.2} className="relative overflow-hidden rounded-[28px] p-8 text-black" style={{ background: YEL }}>
                <span className={`${HEAD} block text-[96px] font-extrabold leading-none`}><Counter to={b.rev} /></span>
                <span className="mt-3 block font-semibold text-black/70">Google reviews</span>
                <Splash color={RED} className="-bottom-10 -right-10 w-[120px]" />
              </Reveal>
            </div>
          </PaintWipe>
          <Book bk={bk} design={design} clearDesign={() => setDesign(null)} />
          <section id="contact" className="px-6 py-28 md:px-10" style={{ background: PAPER }}>
            <div className="mx-auto grid max-w-[1320px] gap-8 md:grid-cols-[.9fr_1.1fr]">
              <Reveal className="grid content-start gap-6">
                <h2 className={`${HEAD} text-[clamp(46px,6.4vw,96px)] font-extrabold uppercase leading-[.88] tracking-[-.04em]`}>Visit the <span style={{ color: RED }}>studio</span></h2>
                <p className="flex items-start gap-3 text-[22px] font-semibold"><MapPin className="mt-1 shrink-0" style={{ color: BLUE }} />{b.addr}</p>
                <a href={'tel:' + tel(b.phone)} className={`${HEAD} text-[34px] font-bold`}>{b.phone}</a>
                <div className="flex flex-wrap gap-2">
                  <a href={waLink(b.phone)} target="_blank" rel="noopener" className="inline-flex h-12 items-center gap-2 rounded-full bg-[#25d366] px-6 font-bold text-black"><WA />WhatsApp</a>
                  <a href={b.ig} target="_blank" rel="noopener" className="inline-flex h-12 items-center gap-2 rounded-full border-2 border-black px-6 font-bold"><IG />@nailart_mw</a>
                  <a href={'tel:' + tel(b.phone)} className="inline-flex h-12 items-center gap-2 rounded-full bg-black px-6 font-bold text-white">Call <ArrowUpRight size={16} /></a>
                </div>
              </Reveal>
              <Reveal delay={.1} className="h-[420px] overflow-hidden rounded-[28px] border-[8px] border-black"><GMap q={`${b.name}, ${b.addr}`} /></Reveal>
            </div>
          </section>
        </main>
        <footer className="border-t-2 border-black px-6 py-10 text-[14px] font-semibold text-black/60 md:px-10" style={{ background: PAPER }}><div className="mx-auto flex max-w-[1320px] flex-wrap justify-between gap-4"><span>© 2026 {b.name} · Website concept by Artem</span><a href={b.ig} target="_blank" rel="noopener" className="hover:text-black">Instagram</a></div></footer>
        <CallBar lang="en" phone={b.phone} barCls="bg-[#f7f5f0]/85 backdrop-blur-xl" callCls="rounded-2xl bg-white text-black ring-1 ring-black/20" bookCls="rounded-2xl text-white bg-[#121212]" />
        <div className="h-[72px] sm:hidden" />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
