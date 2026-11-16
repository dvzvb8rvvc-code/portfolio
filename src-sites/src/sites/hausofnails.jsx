import React, { useRef, useState, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence, MotionConfig } from 'framer-motion'
import { ArrowRight, ArrowUpRight, MapPin, Star, Vibrate, RotateCcw } from 'lucide-react'
import '../lib/base.css'
import { useSmooth, Ribbon, SplitText, Reveal, Magnetic, Cursor, Marquee, Counter, useBooking, phoneFocus, CheckDraw, GMap, CallBar, Progress, Intro, useLite, IG } from '../lib/kit'
import Playground from './hausofnails-physics'

const Bauhaus = lazy(() => import('./hausofnails3d'))
const b = { name: 'HAUS OF NAILS', full: 'HAUS OF NAILS BIRMINGHAM', addr: '30 Lower Essex St, Birmingham B5 6SN', ig: 'https://www.instagram.com/hausofnails.uk', handle: '@hausofnails.uk', rating: '5.0', rev: 23 }
const P = '#efe9dc', R = '#d7262b', Y = '#f2b31b', BL = '#1e4fa3', K = '#141414'
const HEAD = "font-['Archivo_Black',sans-serif]"
const SV = [
  ['Gel manicure', 'Clean prep and a glossy, long-wearing gel finish.', R, 'circle', 'md:col-span-2'],
  ['Builder gel (BIAB)', 'A strengthening overlay for natural nails.', Y, 'tri', ''],
  ['Extensions', 'Length and structure — the shape is yours to choose.', BL, 'square', ''],
  ['Nail art', 'Graphic lines, blocks of colour, freehand detail.', K, 'semi', ''],
  ['Chrome & effects', 'Mirror chrome, shimmer and cat-eye finishes.', P, 'ring', ''],
  ['Pedicure', 'Shape, smooth and finish in gel or classic polish.', R, 'bars', 'md:col-span-2'],
]
const PR = [
  ['01', 'Form', 'Round, almond, square, coffin. Shape comes first — chosen to suit your hands, not a trend.', R, 'circle'],
  ['02', 'Colour', 'Primary brights, quiet neutrals or a full graphic set. On a nail, colour is the composition.', Y, 'tri'],
  ['03', 'Function', 'Strong, clean and made to wear well. Good design has to work in real life.', BL, 'square'],
]

/* polygon helpers for shape morphing (same point count for every shape) */
function walk(V, N = 24) {
  const segs = V.map((p, i) => { const q = V[(i + 1) % V.length]; return [p, q, Math.hypot(q[0] - p[0], q[1] - p[1])] })
  const L = segs.reduce((s, x) => s + x[2], 0), out = []
  for (let i = 0; i < N; i++) {
    let d = i / N * L
    for (const [p, q, l] of segs) { if (d <= l) { out.push([p[0] + (q[0] - p[0]) * d / l, p[1] + (q[1] - p[1]) * d / l]); break } d -= l }
  }
  return out
}
const SHAPE = {
  circle: Array.from({ length: 24 }, (_, i) => { const a = -Math.PI / 2 + i / 24 * Math.PI * 2; return [50 + Math.cos(a) * 46, 50 + Math.sin(a) * 46] }),
  tri: walk([[50, 4], [96, 88], [4, 88]]),
  square: walk([[50, 8], [92, 8], [92, 92], [8, 92], [8, 8]]),
}
const poly = k => 'polygon(' + SHAPE[k].map(([x, y]) => `${x.toFixed(1)}% ${y.toFixed(1)}%`).join(',') + ')'

function Glyph({ kind, color, className = '' }) {
  if (kind === 'circle') return <span className={'block rounded-full ' + className} style={{ background: color }} />
  if (kind === 'tri') return <span className={'block ' + className} style={{ background: color, clipPath: 'polygon(50% 4%,96% 92%,4% 92%)' }} />
  if (kind === 'square') return <span className={'block ' + className} style={{ background: color }} />
  if (kind === 'semi') return <span className={'block rounded-t-full ' + className} style={{ background: color, height: 'auto', aspectRatio: '2/1' }} />
  if (kind === 'ring') return <span className={'block rounded-full border-[14px] ' + className} style={{ borderColor: color }} />
  return <span className={'grid gap-2 ' + className}>{[0, 1, 2].map(i => <i key={i} className="block h-3" style={{ background: color, width: `${100 - i * 25}%` }} />)}</span>
}

/* grid of coloured blocks that clears away cell by cell when the section enters */
function BlockWipe({ cols = 6, rows = 4, colors = [K, R, Y, BL], children, className = '', id, style }) {
  return (
    <section id={id} className={'relative overflow-hidden ' + className} style={style}>
      {children}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 grid" style={{ gridTemplateColumns: `repeat(${cols},1fr)`, gridTemplateRows: `repeat(${rows},1fr)` }}>
        {Array.from({ length: cols * rows }).map((_, i) => {
          const r = Math.floor(i / cols), c = i % cols
          return <motion.span key={i} className="block origin-top" style={{ background: colors[(r + c * 3) % colors.length] }} initial={{ scaleY: 1.02 }} whileInView={{ scaleY: 0 }} viewport={{ once: true, amount: .15 }} transition={{ duration: .55, ease: [0.76, 0, 0.24, 1], delay: (r + c) * .055 }} />
        })}
      </div>
    </section>
  )
}

function Hero({ lite }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const ly = useTransform(scrollYProgress, [0, 1], ['0%', '-14%'])
  const ry = useTransform(scrollYProgress, [0, 1], ['0%', '14%'])
  return (
    <section ref={ref} className="relative grid min-h-[100svh] overflow-hidden md:grid-cols-2">
      <motion.div style={{ y: ry }} initial={{ clipPath: 'inset(0 0 100% 0)' }} animate={{ clipPath: 'inset(0 0 0% 0)' }} transition={{ duration: 1, delay: 1.2, ease: [0.76, 0, 0.24, 1] }} className="relative order-1 h-[46svh] overflow-hidden md:order-2 md:h-auto" >
        <div className="absolute inset-0" style={{ background: '#e4dccb' }} />
        <div className="absolute left-1/2 top-1/2 h-[78%] max-h-[560px] aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: Y }} />
        <div className="absolute bottom-0 left-0 h-[22%] w-[38%]" style={{ background: BL }} />
        <div className="absolute right-0 top-0 h-[16%] w-[16%]" style={{ background: K }} />
        <div className="absolute inset-0">{!lite ? <Suspense fallback={null}><Bauhaus progress={scrollYProgress} /></Suspense> :
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }} className="absolute inset-[22%]"><span className="absolute left-[30%] top-[20%] h-[45%] w-[45%] rounded-full" style={{ background: R }} /><span className="absolute bottom-[10%] left-[10%] h-[30%] w-[30%]" style={{ background: BL }} /></motion.div>}</div>
      </motion.div>
      <motion.div style={{ y: ly }} className="relative order-2 flex flex-col justify-center px-6 pb-16 pt-8 md:order-1 md:px-12 md:py-20">
        <div aria-hidden="true" className="absolute inset-0 opacity-60" style={{ backgroundImage: `linear-gradient(90deg, ${K}14 1px, transparent 1px)`, backgroundSize: '25% 100%' }} />
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }} className="relative mb-6 flex items-center gap-3 text-[13px] font-bold uppercase tracking-[.28em]"><span className="h-3 w-3" style={{ background: R }} />Nail studio · Lower Essex St, Birmingham</motion.p>
        <h1 className={`${HEAD} relative text-[clamp(64px,11.5vw,170px)] uppercase leading-[.82] tracking-[-.03em]`}>
          <SplitText text="Haus" delay={1.4} y="-130%" stagger={.07} className="block" />
          <span className="flex items-center gap-[.15em]">
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 1.8 }} className="grid h-[.92em] w-[.92em] place-items-center rounded-full text-[#efe9dc]" style={{ background: R }}><span className="text-[.4em] leading-none">of</span></motion.span>
            <motion.span initial={{ width: 0 }} animate={{ width: '1.6em' }} transition={{ duration: .8, delay: 2, ease: [0.76, 0, 0.24, 1] }} className="block h-[.16em]" style={{ background: K }} />
            <motion.span initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', delay: 2.1 }} className="block h-[.5em] w-[.56em]" style={{ background: Y, clipPath: 'polygon(50% 0,100% 100%,0 100%)' }} />
          </span>
          <SplitText text="Nails" delay={1.6} y="-130%" stagger={.07} className="block" />
        </h1>
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.2 }} className="relative mt-7 max-w-[420px] text-[19px] leading-snug">Nails built on <b>form</b>, <b>colour</b> and <b>function</b>. Bold sets, clean lines, zero clutter.</motion.p>
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.4 }} className="relative mt-8 flex flex-wrap gap-3">
          <Magnetic><a href="#book" data-cursor="Book" className={`${HEAD} inline-flex h-14 items-center gap-3 px-8 text-[15px] uppercase text-[#efe9dc]`} style={{ background: K }}>Book a set <ArrowRight size={18} /></a></Magnetic>
          <a href={b.ig} target="_blank" rel="noopener" className={`${HEAD} inline-flex h-14 items-center gap-2 border-[3px] border-[#141414] px-6 text-[15px] uppercase`}><IG />DM us</a>
        </motion.div>
      </motion.div>
    </section>
  )
}

function Principles() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const [i, setI] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', v => setI(Math.min(2, Math.floor(v * 3))))
  const rot = useTransform(scrollYProgress, [0, 1], [0, 360])
  return (
    <section ref={ref} className="relative h-[300vh]" style={{ background: P }}>
      <div className="sticky top-0 grid h-[100svh] overflow-hidden md:grid-cols-2">
        <div className="relative flex flex-col justify-end px-6 pb-10 md:justify-center md:px-12 md:pb-0">
          <p className="mb-4 text-[13px] font-bold uppercase tracking-[.28em]">The haus rules</p>
          <div className="relative h-[1.05em] overflow-hidden whitespace-nowrap text-[clamp(46px,7.2vw,116px)]">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.h2 key={i} initial={{ y: '100%' }} animate={{ y: '0%' }} exit={{ y: '-100%' }} transition={{ duration: .6, ease: [0.76, 0, 0.24, 1] }} className={`${HEAD} absolute inset-0 uppercase leading-none tracking-[-.03em]`}>{PR[i][1]}</motion.h2>
            </AnimatePresence>
          </div>
          <div className="mt-6 flex max-w-[460px] gap-5">
            <span className={`${HEAD} text-[15px]`}>{PR[i][0]}/03</span>
            <AnimatePresence mode="wait"><motion.p key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="text-[18px] leading-snug">{PR[i][2]}</motion.p></AnimatePresence>
          </div>
          <div className="mt-8 flex gap-2">{PR.map((p, k) => <span key={k} className="h-2 w-14 transition-colors duration-500" style={{ background: k === i ? p[3] : K + '22' }} />)}</div>
        </div>
        <div className="relative order-first grid place-items-center md:order-none">
          <motion.div style={{ rotate: rot }} className="absolute h-[70%] max-h-[620px] aspect-square rounded-full border-[2px] border-dashed border-[#141414]/30" />
          <motion.div animate={{ clipPath: poly(PR[i][4]), backgroundColor: PR[i][3] }} transition={{ duration: .9, ease: [0.76, 0, 0.24, 1] }} className="relative aspect-square w-[min(58vw,46vh,480px)]" />
          <motion.span style={{ rotate: rot }} className="absolute aspect-square w-[min(72vw,58vh,600px)]"><i className="absolute left-1/2 top-0 block h-6 w-6 -translate-x-1/2 rounded-full" style={{ background: K }} /></motion.span>
        </div>
      </div>
    </section>
  )
}

function Services() {
  return (
    <BlockWipe id="services" className="px-6 py-24 md:px-12" style={{ background: P }}>
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6 border-b-[6px] border-[#141414] pb-6">
          <h2 className={`${HEAD} text-[clamp(52px,8vw,128px)] uppercase leading-[.85] tracking-[-.03em]`}>Services</h2>
          <p className="max-w-[320px] text-[17px]">Six treatments, one design rule: nothing unnecessary. Tap a block to request it.</p>
        </div>
        <div className="grid gap-[6px] bg-[#141414] p-[6px] sm:grid-cols-2 md:grid-cols-4">
          {SV.map(([t, d, c, g, span], k) => {
            const dark = c === K || c === BL || c === R
            return (
              <motion.a key={t} href="#book" data-svc={t} data-cursor="Book" initial={{ opacity: 0, rotate: k % 2 ? 6 : -6, scale: .85 }} whileInView={{ opacity: 1, rotate: 0, scale: 1 }} viewport={{ once: true, margin: '0px 0px -10% 0px' }} transition={{ type: 'spring', stiffness: 120, damping: 16, delay: .5 + (k % 4) * .07 }}
                className={`group relative flex min-h-[280px] flex-col justify-between overflow-hidden p-7 ${span}`} style={{ background: c, color: dark ? P : K }}>
                <div className="flex items-center gap-3"><span className={`${HEAD} text-[14px]`}>0{k + 1}</span><ArrowUpRight className="transition-transform duration-300 group-hover:rotate-45" /></div>
                <Glyph kind={g} color={c === P ? R : c === Y ? K : c === K ? Y : P} className="absolute right-6 top-6 h-20 w-20 transition-transform duration-500 group-hover:rotate-[30deg] group-hover:scale-110" />
                <div className="relative max-w-[260px]"><h3 className={`${HEAD} text-[26px] uppercase leading-none`}>{t}</h3><p className="mt-2 text-[15px] opacity-80">{d}</p></div>
              </motion.a>
            )
          })}
        </div>
      </div>
    </BlockWipe>
  )
}

function Play() {
  const pg = useRef(null)
  return (
    <section className="relative px-4 py-24 md:px-12" style={{ background: K, color: P }}>
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-8 grid gap-6 md:grid-cols-[1.2fr_1fr] md:items-end">
          <h2 className={`${HEAD} text-[clamp(44px,7vw,112px)] uppercase leading-[.86] tracking-[-.03em]`}><SplitText text="Play" y="-120%" className="block" /><span style={{ color: Y }}>with form.</span></h2>
          <div>
            <p className="mb-5 max-w-[400px] text-[17px] text-[#efe9dc]/75">Grab a shape, stack it, throw it. Tap empty space to drop a new one. Build a composition — then let us put it on your nails.</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => pg.current?.shake()} className={`${HEAD} inline-flex h-12 items-center gap-2 px-6 text-[14px] uppercase text-[#141414]`} style={{ background: Y }}><Vibrate size={18} />Shake</button>
              <button onClick={() => pg.current?.reset()} className={`${HEAD} inline-flex h-12 items-center gap-2 border-2 border-[#efe9dc] px-6 text-[14px] uppercase`}><RotateCcw size={16} />Reset</button>
            </div>
          </div>
        </div>
        <div className="relative h-[62svh] min-h-[380px] overflow-hidden md:h-[68vh]" style={{ background: P }}>
          <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ backgroundImage: `linear-gradient(90deg, ${K}12 1px, transparent 1px), linear-gradient(${K}12 1px, transparent 1px)`, backgroundSize: '80px 80px' }} />
          <span className={`${HEAD} pointer-events-none absolute left-5 top-4 text-[12px] uppercase tracking-[.2em] text-[#141414]/50`}>Fig. 1 — gravity study</span>
          <Playground ref={pg} className="relative" />
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <p className="text-[15px] text-[#efe9dc]/60">Like your composition? Screenshot it and send it with your booking.</p>
          <a href="#book" data-svc="Bauhaus nail art" className={`${HEAD} inline-flex h-12 items-center gap-2 px-6 text-[14px] uppercase text-[#efe9dc]`} style={{ background: R }}>Book this look <ArrowRight size={16} /></a>
        </div>
      </div>
    </section>
  )
}

function Split() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const a = useTransform(scrollYProgress, [0, .5, 1], ['-40%', '0%', '10%'])
  const c = useTransform(scrollYProgress, [0, .5, 1], ['40%', '0%', '-10%'])
  return (
    <section ref={ref} className="grid overflow-hidden md:grid-cols-2">
      <motion.div style={{ y: a }} className="relative flex min-h-[52vh] flex-col justify-between p-8 md:min-h-[80vh] md:p-12">
        <div className="absolute inset-0" style={{ background: Y }} />
        <span className={`${HEAD} relative text-[14px] uppercase tracking-[.2em]`}>Google rating</span>
        <div className="relative"><span className={`${HEAD} block text-[clamp(110px,18vw,260px)] leading-[.8] tracking-[-.04em]`}>5.0</span><span className="mt-4 flex gap-1">{[0, 1, 2, 3, 4].map(i => <Star key={i} size={26} fill={K} stroke={K} />)}</span></div>
      </motion.div>
      <motion.div style={{ y: c }} className="relative flex min-h-[52vh] flex-col justify-between p-8 text-[#efe9dc] md:min-h-[80vh] md:p-12">
        <div className="absolute inset-0" style={{ background: BL }} />
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full" style={{ background: R }} />
        <span className={`${HEAD} relative text-[14px] uppercase tracking-[.2em]`}>Google reviews</span>
        <div className="relative"><span className={`${HEAD} block text-[clamp(110px,18vw,260px)] leading-[.8] tracking-[-.04em]`}><Counter to={b.rev} /></span><p className="mt-4 max-w-[320px] text-[17px] text-[#efe9dc]/80">Every one of them five stars. Read them on the studio's Google profile.</p></div>
      </motion.div>
    </section>
  )
}

function Book({ bk }) {
  const f = 'h-14 w-full border-0 border-b-[3px] border-[#141414] bg-transparent px-1 text-[19px] outline-none placeholder:text-[#141414]/40 focus:border-[#d7262b]'
  return (
    <BlockWipe id="book" cols={5} rows={3} colors={[R, K, BL, Y]} className="px-6 py-24 md:px-12" style={{ background: P }}>
      <div className="mx-auto grid max-w-[1320px] border-[6px] border-[#141414] md:grid-cols-2">
        <div className="relative overflow-hidden p-8 text-[#efe9dc] md:p-12" style={{ background: R }}>
          <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full" style={{ background: Y }} />
          <div className="absolute bottom-10 right-40 h-20 w-20" style={{ background: K }} />
          <h2 className={`${HEAD} relative text-[clamp(48px,7vw,104px)] uppercase leading-[.86] tracking-[-.03em]`}>Book<br />a set</h2>
          <p className="relative mb-8 mt-6 max-w-[380px] text-[18px]">Leave your number and the look you want. We'll get back to you to confirm a time.</p>
          <a href={b.ig} target="_blank" rel="noopener" className={`${HEAD} relative inline-flex h-12 items-center gap-2 px-6 text-[14px] uppercase text-[#141414]`} style={{ background: P }}><IG />Or DM {b.handle}</a>
        </div>
        <div className="p-8 md:p-12">
          <AnimatePresence mode="wait">
            {!bk.s.sent ? (
              <motion.form key="f" exit={{ opacity: 0, x: 40 }} onSubmit={bk.submit} noValidate className="grid gap-6">
                <input className={f} placeholder="Name" value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} autoComplete="name" />
                <motion.input animate={bk.s.err ? { x: [0, -8, 8, -6, 6, 0] } : {}} className={f + (bk.s.err ? ' !border-[#d7262b]' : '')} type="tel" inputMode="tel" placeholder="+44 7___ ______" value={bk.s.phone} onFocus={phoneFocus(bk, '+44 ')} onChange={e => bk.upd('phone', e.target.value)} autoComplete="tel" />
                <div className="flex flex-wrap gap-2">{[...SV.map(s => s[0]), 'Bauhaus nail art'].map(t => <button type="button" key={t} onClick={() => bk.upd('svc', t)} className={`border-2 border-[#141414] px-3 py-2 text-[14px] font-semibold transition-colors ${bk.s.svc === t ? 'bg-[#141414] text-[#efe9dc]' : 'hover:bg-[#f2b31b]'}`}>{t}</button>)}</div>
                <button disabled={bk.s.loading} className={`${HEAD} h-16 text-[17px] uppercase text-[#efe9dc] transition-[scale,opacity] active:scale-[.97] disabled:opacity-60`} style={{ background: K }}>{bk.s.loading ? 'Composing…' : 'Send request'}</button>
                <p className="text-[14px] text-[#141414]/60">In the finished site this request goes straight to your phone/Telegram.</p>
              </motion.form>
            ) : (
              <motion.div key="ok" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative grid min-h-[340px] place-items-center text-center">
                {[[R, 'rounded-full', -120, -90], [Y, '', 130, -70], [BL, '', -110, 100]].map(([c, cl, x, y], k) => <motion.span key={k} className={'absolute left-1/2 top-1/2 h-12 w-12 ' + cl} style={{ background: c }} initial={{ x: 0, y: 0, scale: 0 }} animate={{ x, y, scale: 1, rotate: 180 }} transition={{ type: 'spring', delay: k * .08 }} />)}
                <div className="relative"><CheckDraw className="mx-auto mb-5" /><h3 className={`${HEAD} text-[38px] uppercase`}>Request sent</h3><p className="mx-auto mb-5 max-w-[300px] text-[#141414]/70">This is what your client sees. In the finished site this request goes straight to your phone/Telegram.</p><button onClick={bk.reset} className="font-bold underline underline-offset-4">Send another</button></div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </BlockWipe>
  )
}

function App() {
  useSmooth()
  const lite = useLite()
  const bk = useBooking()
  return (
    <MotionConfig reducedMotion="user">
      <div className="font-['Josefin_Sans',sans-serif]" style={{ background: P, color: K, '--sel': R, '--selc': P }}>
        <Intro bg={P} fg={K} duration={1.5}>
          <div className="grid place-items-center gap-5">
            <div className="flex items-end gap-3">
              {[['rounded-full', R], ['', Y, 'polygon(50% 0,100% 100%,0 100%)'], ['', BL]].map(([cl, c, cp], k) => <motion.span key={k} className={'block h-12 w-12 ' + cl} style={{ background: c, clipPath: cp }} initial={{ y: -200, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 14, delay: k * .12 }} />)}
            </div>
            <span className={`${HEAD} text-[30px] uppercase tracking-[.08em]`}>Haus of Nails</span>
          </div>
        </Intro>
        <Progress color={R} />
        <Cursor color={R} blend="normal" textColor={P} />
        <Ribbon lang="en" name={b.full} bg={K} fg={P} />
        <header className="sticky top-0 z-40 border-b-[3px] border-[#141414]" style={{ background: P }}>
          <div className="mx-auto flex h-[64px] max-w-[1320px] items-center justify-between px-6 md:px-12">
            <a href="#top" className={`${HEAD} flex items-center gap-3 text-[20px] uppercase`}><span className="flex items-end gap-[3px]"><i className="block h-4 w-4 rounded-full" style={{ background: R }} /><i className="block h-4 w-4" style={{ background: Y, clipPath: 'polygon(50% 0,100% 100%,0 100%)' }} /><i className="block h-4 w-4" style={{ background: BL }} /></span>Haus of Nails</a>
            <nav className="hidden gap-8 text-[15px] font-semibold uppercase tracking-[.12em] md:flex">{[['#services', 'Services'], ['#play', 'Play'], ['#book', 'Book'], ['#contact', 'Contact']].map(([h, t]) => <a key={h} href={h} className="hover:text-[#d7262b]">{t}</a>)}</nav>
            <a href={b.ig} target="_blank" rel="noopener" className={`${HEAD} hidden h-11 items-center gap-2 px-5 text-[13px] uppercase text-[#efe9dc] sm:inline-flex`} style={{ background: K }}><IG width={16} height={16} />Message</a>
          </div>
        </header>
        <main id="top">
          <Hero lite={lite} />
          <div className="border-y-[3px] border-[#141414] py-5" style={{ background: K, color: P }}>
            <Marquee base={-2}>{['Form', 'Colour', 'Function', 'Nails'].map((t, k) => <span key={t} className={`${HEAD} mx-6 inline-flex items-center gap-12 text-[clamp(34px,5vw,72px)] uppercase`}>{t}<Glyph kind={['circle', 'tri', 'square', 'circle'][k]} color={[R, Y, BL, P][k]} className="h-10 w-10" /></span>)}</Marquee>
          </div>
          <Principles />
          <Services />
          <div id="play"><Play /></div>
          <Split />
          <Book bk={bk} />
          <BlockWipe id="contact" cols={6} rows={3} colors={[BL, Y, K, R]} className="px-6 py-24 md:px-12" style={{ background: P }}>
            <div className="mx-auto grid max-w-[1320px] gap-8 md:grid-cols-[1fr_1.1fr]">
              <div className="grid content-start gap-6">
                <h2 className={`${HEAD} text-[clamp(48px,7vw,110px)] uppercase leading-[.86] tracking-[-.03em]`}>Find<br />the <span style={{ color: R }}>haus</span></h2>
                <p className="flex items-start gap-3 text-[22px] font-semibold"><MapPin className="mt-0.5 shrink-0" style={{ color: BL }} />{b.addr}</p>
                <p className="max-w-[420px] text-[17px]">Bookings and questions go through Instagram — send a DM and we'll reply with availability.</p>
                <Magnetic><a href={b.ig} target="_blank" rel="noopener" data-cursor="DM" className={`${HEAD} inline-flex h-16 items-center gap-3 px-8 text-[17px] uppercase text-[#efe9dc]`} style={{ background: BL }}><IG width={22} height={22} />{b.handle}</a></Magnetic>
              </div>
              <div className="h-[420px] border-[6px] border-[#141414]"><GMap q={`${b.full}, ${b.addr}`} /></div>
            </div>
          </BlockWipe>
        </main>
        <footer className="border-t-[3px] border-[#141414] px-6 py-10 text-[15px] font-semibold md:px-12"><div className="mx-auto flex max-w-[1320px] flex-wrap justify-between gap-4"><span>© 2026 {b.full} · Website concept by Artem</span><a href={b.ig} target="_blank" rel="noopener" className="hover:text-[#d7262b]">Instagram</a></div></footer>
        <CallBar lang="en" phone={null} barCls="bg-[#efe9dc] border-t-[3px] border-[#141414]" callCls="bg-[#1e4fa3] text-[#efe9dc]" bookCls="bg-[#141414] text-[#efe9dc]" />
        <div className="h-[72px] sm:hidden" />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
