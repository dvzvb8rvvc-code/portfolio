import React, { useRef, useState, useEffect, useCallback, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useInView, useScroll, useTransform, AnimatePresence, MotionConfig } from 'framer-motion'
import { ArrowRight, Phone, MapPin, Star, ChevronLeft, ChevronRight, Droplet, Sparkles, Hand, Footprints, Palette, Eye, Gem } from 'lucide-react'
import '../lib/base.css'
import { useSmooth, Ribbon, SplitText, Reveal, Magnetic, Cursor, Marquee, Counter, useBooking, phoneFocus, CheckDraw, GMap, CallBar, Progress, Intro, tel, useLite, IG } from '../lib/kit'

const Bottles = lazy(() => import('./fortnails3d'))
const b = {
  name: 'Nails Birmingham Fort Shopping Park', short: 'Nails & Brows',
  addr: '15B The Fort Shopping Park, 20 Fort Pkwy, Birmingham B24 9FP',
  phone: '+44 121 714 1235', ig: 'https://www.instagram.com/browsandnails_birmingham', rating: 4.7, rev: 152,
}
const INK = '#2a1838'
const SH = [
  ['Bubblegum', '#ff8fc7'], ['Cherry Pop', '#ff3b5c'], ['Tangerine', '#ff9b42'], ['Lemon Sherbet', '#ffd84d'],
  ['Mint Chip', '#5fdcae'], ['Blue Raspberry', '#4aa8ff'], ['Grape Soda', '#a77bff'],
]
const candy = SH.map(s => s[1])
const HL = ['#ff8fc7', '#ff3b5c', '#ff9b42', '#f2b600', '#3fcf9a', '#4aa8ff', '#a77bff']
const D = "font-['Shrikhand',cursive]"
const lum = h => { const n = parseInt(h.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, bl = n & 255; return (0.299 * r + 0.587 * g + 0.114 * bl) / 255 }
const txt = h => (lum(h) > .62 ? INK : '#ffffff')
const SV = [
  ['Manicure', 'Tidy shape, cuticle care and a fresh coat of whichever bottle you picked.', Hand],
  ['Gel polish', 'High-shine colour that lasts — perfect if your hands do a lot of shopping bags.', Droplet],
  ['Acrylic & extensions', 'Extra length, any shape. Square, almond, coffin or stiletto.', Gem],
  ['Pedicure', 'Feet soaked, smoothed and polished in a shade to match your fingers — or not.', Footprints],
  ['Nail art', 'French tips, chrome, glitter fades, tiny hearts. Bring a screenshot.', Palette],
  ['Brows', 'Brow shaping and tidying to frame your face — book it with your nails in one visit.', Eye],
]

/* --- liquid pour: a drippy layer floods the section in the chosen colour --- */
function Drips({ color }) {
  return (
    <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="absolute left-0 top-full h-[90px] w-full md:h-[120px]" aria-hidden="true">
      <path fill={color} d="M0 0H1200V20c-30 0-34 70-60 70s-24-58-50-58-20 40-48 40-26-62-60-62-30 96-62 96-28-80-58-80-24 34-52 34-30-50-60-50-26 70-56 70-28-44-58-44-30 22-58 22-26-48-56-48-30 86-62 86-28-70-58-70-26 40-54 40-32-56-62-56-28 30-58 30-26-38-56-38-30 66-60 66-26-54-58-54-26 24-54 24-30-34-60-34-26 58-56 58S30 20 0 20Z" />
    </svg>
  )
}
function Pour({ shade, layers }) {
  const ref = useRef(null)
  const col = SH[shade][1], fg = txt(col)
  const base = layers.length > 1 ? SH[layers[layers.length - 2].s][1] : '#fffdfb'
  return (
    <section ref={ref} id="shade" className="relative overflow-hidden" style={{ background: base }}>
      {layers.slice(-2).map(l => (
        <motion.div key={l.id} aria-hidden="true" className="absolute inset-x-0 top-0 h-full" style={{ background: SH[l.s][1] }}
          initial={{ y: '-115%' }} animate={{ y: '0%' }} transition={{ duration: 1.25, ease: [0.55, 0, 0.25, 1] }}>
          <Drips color={SH[l.s][1]} />
        </motion.div>
      ))}
      <div className="relative z-10 mx-auto grid min-h-[80vh] max-w-[1320px] items-center gap-10 px-6 py-24 md:grid-cols-[1.2fr_.8fr] md:px-10" style={{ color: layers.length ? fg : INK, transition: 'color .6s .5s' }}>
        <div>
          <p className="mb-4 text-[13px] font-bold uppercase tracking-[.22em] opacity-70">{layers.length ? 'Fresh pour' : 'Pick a bottle up there ↑'}</p>
          <AnimatePresence mode="wait">
            <motion.h2 key={layers.length ? layers[layers.length - 1].id : 'none'} className={`${D} text-[clamp(56px,10vw,160px)] leading-[.92]`}
              initial={{ y: 60, opacity: 0, rotate: -4 }} animate={{ y: 0, opacity: 1, rotate: 0 }} exit={{ y: -40, opacity: 0 }} transition={{ type: 'spring', stiffness: 160, damping: 14, delay: .55 }}>
              {layers.length ? SH[shade][0] : 'Your shade'}
            </motion.h2>
          </AnimatePresence>
          <p className="mt-6 max-w-[460px] text-[18px] font-medium opacity-80">{layers.length ? 'Lovely choice. It has already gone into your booking form — tell us if you want it on gel, acrylics or toes.' : 'Spin the carousel and tap a bottle. Its colour pours right into this section.'}</p>
          <a href="#book" className="mt-9 inline-flex h-14 items-center gap-2 rounded-full px-8 text-[16px] font-bold" style={{ background: layers.length ? fg : INK, color: layers.length ? col : '#fff' }}>Book in this shade <ArrowRight size={18} /></a>
        </div>
        <div className="relative mx-auto grid aspect-square w-full max-w-[340px] place-items-center">
          <motion.div key={layers.length ? layers[layers.length - 1].id : 0} initial={{ scale: 0, rotate: -40 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 180, damping: 11, delay: .8 }}
            className="relative h-[62%] w-[62%] rounded-[46%_54%_48%_52%/55%_50%_50%_45%] shadow-[inset_-18px_-22px_40px_rgba(0,0,0,.16),inset_14px_14px_30px_rgba(255,255,255,.5),0_30px_60px_-20px_rgba(0,0,0,.3)]" style={{ background: col }}>
            <span className="absolute left-[22%] top-[18%] h-[18%] w-[28%] rotate-[-30deg] rounded-full bg-white/60 blur-[2px]" />
          </motion.div>
          <motion.span className="absolute inset-0 rounded-full border-2 border-dashed opacity-30" style={{ borderColor: layers.length ? fg : INK }} animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }} />
        </div>
      </div>
    </section>
  )
}

/* --- bottle-cap pop reveal --- */
function CapCard({ t, d, I, k }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -12% 0px' })
  const c = candy[k % candy.length]
  return (
    <motion.a ref={ref} href="#book" data-svc={t} data-cursor="Pick" className="group relative block rounded-[32px] bg-white p-7 pt-12 shadow-[0_24px_60px_-30px_rgba(42,24,56,.35)] ring-1 ring-[#2a1838]/5"
      initial={{ opacity: 0, scale: .6, y: 60, rotate: k % 2 ? 8 : -8 }} animate={inView ? { opacity: 1, scale: 1, y: 0, rotate: 0 } : {}} transition={{ type: 'spring', stiffness: 220, damping: 13, delay: (k % 3) * .1 }}
      whileHover={{ y: -8, rotate: k % 2 ? 1.5 : -1.5 }}>
      <motion.span aria-hidden="true" className="absolute left-7 top-0 h-7 w-14 -translate-y-1/2 rounded-t-xl rounded-b-md bg-[#2a1838]"
        initial={{ y: '-50%', rotate: 0, opacity: 1 }} animate={inView ? { y: [null, '-260%', '-50%'], rotate: [0, -35, 0], opacity: [1, 1, 1] } : {}} transition={{ duration: .9, delay: .25 + (k % 3) * .1, times: [0, .45, 1], ease: 'easeOut' }} />
      <motion.span aria-hidden="true" className="absolute left-7 top-0 h-3 w-14 -translate-y-1/2 rounded-full" style={{ background: c }} initial={{ scaleX: 0 }} animate={inView ? { scaleX: 1 } : {}} transition={{ delay: .4 + (k % 3) * .1 }} />
      <span className="mb-6 grid h-16 w-16 place-items-center rounded-[22px] transition-transform duration-300 group-hover:rotate-[-8deg] group-hover:scale-110" style={{ background: c, color: txt(c) }}><I size={28} /></span>
      <h3 className={`${D} mb-2 text-[30px] leading-tight`} style={{ color: INK }}>{t}</h3>
      <p className="text-[15px] leading-relaxed text-[#2a1838]/65">{d}</p>
      <span className="mt-5 inline-flex items-center gap-1 text-[14px] font-bold" style={{ color: INK }}>Book this <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" /></span>
    </motion.a>
  )
}

function Hero({ lite, front, setFront, pick }) {
  const col = SH[front][1]
  const words = 'Pick a colour.'
  let ci = 0
  return (
    <section className="relative overflow-hidden" style={{ background: 'radial-gradient(100% 70% at 75% 40%, #fff3f9 0%, #fffdfb 60%)' }}>
      <div className="mx-auto grid min-h-[calc(100svh-110px)] max-w-[1320px] items-center gap-4 px-6 pb-10 pt-6 md:grid-cols-[1fr_1.1fr] md:px-10 md:pt-0">
        <div className="relative z-10">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.4 }} className="mb-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[13px] font-bold shadow-[0_8px_30px_-12px_rgba(42,24,56,.3)]"><Sparkles size={14} className="text-[#ff3b5c]" /> Nails & brows · The Fort Shopping Park</motion.p>
          <h1 className={`${D} text-[clamp(44px,8.4vw,128px)] leading-[.95] tracking-[-.01em]`} aria-label="Pick a colour. Any colour.">
            <span aria-hidden="true" className="block">{words.split(' ').map((w, wi) => (
              <span key={wi} className="inline-block whitespace-nowrap">{[...w].map(ch => { const k = ci++; return (
                <motion.span key={k} className="inline-block" style={{ color: HL[k % HL.length] }} initial={{ y: '80%', opacity: 0, rotate: -20, scale: .5 }} animate={{ y: '0%', opacity: 1, rotate: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 12, delay: 1.4 + k * .05 }} whileHover={{ y: -12, rotate: 8 }}>{ch}</motion.span>) })}{wi < 2 && <span>&nbsp;</span>}</span>
            ))}</span>
            <span aria-hidden="true" className="block text-[#2a1838]"><SplitText text="Any colour." delay={2.1} y="100%" rotate={6} /></span>
          </h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.4 }} className="mt-6 hidden max-w-[440px] text-[17px] font-medium leading-relaxed text-[#2a1838]/70 md:block">A playful polish bar for nails and brows inside The Fort Shopping Park. Spin the bottles, tap the one you love — it pours straight into your booking.</motion.p>
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.6 }} className="mt-8 flex flex-wrap gap-3">
            <Magnetic><a href="#book" data-cursor="Book!" className="inline-flex h-14 items-center gap-2 rounded-full px-8 text-[16px] font-bold text-white shadow-[0_18px_40px_-14px_rgba(255,59,92,.8)]" style={{ background: '#ff3b5c' }}>Book now <ArrowRight size={18} /></a></Magnetic>
            <a href={'tel:' + tel(b.phone)} className="hidden h-14 items-center gap-2 rounded-full bg-white px-6 font-bold sm:inline-flex shadow-[0_10px_30px_-12px_rgba(42,24,56,.3)]"><Phone size={16} />{b.phone}</a>
          </motion.div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.9 }} className="mt-6 hidden items-center gap-2 text-[14px] font-semibold text-[#2a1838]/70 md:flex"><span className="flex text-[#ffb800]">{[0, 1, 2, 3, 4].map(k => <Star key={k} size={14} fill="currentColor" />)}</span>{b.rating} on Google · {b.rev} reviews</motion.p>
        </div>
        <div className="relative">
          <div className="relative h-[46svh] min-h-[320px] md:h-[64vh]">
            <span aria-hidden="true" className="absolute bottom-[12%] left-1/2 h-10 w-[70%] -translate-x-1/2 rounded-[50%] bg-[#2a1838]/10 blur-xl" />
            <motion.span aria-hidden="true" className="absolute left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-[80px]" animate={{ background: col }} transition={{ duration: .6 }} />
            {!lite ? <Suspense fallback={null}><div className="absolute inset-0"><Bottles colors={candy} target={front} onFront={setFront} onPick={pick} /></div></Suspense> : (
              <div className="absolute inset-0 flex items-end justify-center gap-3 pb-[18%]">{SH.map(([n, c], i) => <button key={n} onClick={() => pick(i)} aria-label={n} className={`relative w-10 rounded-b-2xl rounded-t-lg transition-transform ${i === front ? 'h-36 -translate-y-3' : 'h-28'}`} style={{ background: c }}><span className="absolute -top-10 left-1/2 h-10 w-5 -translate-x-1/2 rounded-t-md bg-[#2a1838]" /></button>)}</div>
            )}
          </div>
          <div className="relative z-10 -mt-4 flex items-center justify-center gap-3">
            <button onClick={() => setFront((front + SH.length - 1) % SH.length)} aria-label="Previous shade" className="grid h-12 w-12 place-items-center rounded-full bg-white shadow-[0_8px_24px_-10px_rgba(42,24,56,.35)]"><ChevronLeft /></button>
            <div className="min-w-[180px] text-center">
              <AnimatePresence mode="wait"><motion.p key={front} initial={{ y: 12, opacity: 0, scale: .8 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: -12, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 18 }} className={`${D} text-[26px] leading-none`} style={{ color: col === '#ffd84d' ? '#d9a800' : col }}>{SH[front][0]}</motion.p></AnimatePresence>
              <p className="mt-1 text-[12px] font-semibold uppercase tracking-[.16em] text-[#2a1838]/50">drag to spin · tap to pour</p>
            </div>
            <button onClick={() => setFront((front + 1) % SH.length)} aria-label="Next shade" className="grid h-12 w-12 place-items-center rounded-full bg-white shadow-[0_8px_24px_-10px_rgba(42,24,56,.35)]"><ChevronRight /></button>
          </div>
          <div className="mt-4 flex justify-center"><Magnetic><button onClick={() => pick(front)} data-cursor="Pour" className="inline-flex h-12 items-center gap-2 rounded-full px-6 text-[15px] font-bold transition-colors" style={{ background: col, color: txt(col) }}><Droplet size={16} fill="currentColor" /> Pour this colour</button></Magnetic></div>
        </div>
      </div>
    </section>
  )
}

function Book({ shade, setShade }) {
  const bk = useBooking()
  const col = SH[shade][1]
  const f = 'h-14 w-full rounded-2xl bg-[#f6f1f8] px-5 text-[17px] font-medium text-[#2a1838] outline-none ring-2 ring-transparent placeholder:text-[#2a1838]/40 focus:ring-[#ff8fc7]'
  return (
    <section id="book" className="relative overflow-hidden px-6 py-28 md:px-10" style={{ background: '#fffdfb' }}>
      <motion.div initial={{ clipPath: 'circle(0% at 50% 0%)' }} whileInView={{ clipPath: 'circle(150% at 50% 0%)' }} viewport={{ once: true, margin: '0px 0px -20% 0px' }} transition={{ duration: 1.3, ease: [0.65, 0, 0.35, 1] }}
        className="relative mx-auto grid max-w-[1240px] gap-12 rounded-[44px] p-8 md:grid-cols-2 md:p-14" style={{ background: INK }}>
        <div className="text-white">
          <h2 className={`${D} text-[clamp(48px,6.4vw,100px)] leading-[.95]`}>Grab a <span style={{ color: col }}>seat</span></h2>
          <p className="mb-8 mt-6 max-w-[380px] text-white/70">Leave your name and number and we'll ring you back with a time. Shopping first, nails after? Totally fine.</p>
          <a href={'tel:' + tel(b.phone)} className={`${D} text-[clamp(28px,3vw,38px)]`}>{b.phone}</a>
          <div className="mt-10 flex items-center gap-4 rounded-3xl bg-white/5 p-4 ring-1 ring-white/10">
            <motion.span key={shade} initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 12 }} className="h-14 w-14 shrink-0 rounded-[40%_60%_55%_45%/50%_45%_55%_50%]" style={{ background: col }} />
            <div><p className="text-[12px] font-bold uppercase tracking-[.18em] text-white/50">Your shade</p><p className={`${D} text-[24px]`}>{SH[shade][0]}</p></div>
          </div>
        </div>
        <div className="rounded-[32px] bg-white p-6 md:p-8">
          <AnimatePresence mode="wait">
            {!bk.s.sent ? (
              <motion.form key="f" exit={{ opacity: 0, scale: .9 }} onSubmit={bk.submit} noValidate className="grid gap-4">
                <input className={f} placeholder="Your name" value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} autoComplete="name" />
                <motion.input animate={bk.s.err ? { x: [0, -8, 8, -6, 6, 0] } : {}} className={f + (bk.s.err ? ' !ring-red-400' : '')} type="tel" inputMode="tel" placeholder="+44 ___ ___ ____" value={bk.s.phone} onFocus={phoneFocus(bk, '+44 ')} onChange={e => bk.upd('phone', e.target.value)} autoComplete="tel" />
                {bk.s.err && <p className="-mt-2 text-[13px] font-semibold text-red-500">Please check the number — it looks a little short.</p>}
                <p className="mt-1 text-[12px] font-bold uppercase tracking-[.16em] text-[#2a1838]/50">Service</p>
                <div className="flex flex-wrap gap-2">{SV.map(s => s[0]).map(t => <button type="button" key={t} onClick={() => bk.upd('svc', t)} className={`rounded-full px-4 py-2 text-[13px] font-bold transition-colors ${bk.s.svc === t ? 'text-white' : 'bg-[#f6f1f8] text-[#2a1838] hover:bg-[#efe6f3]'}`} style={bk.s.svc === t ? { background: INK } : undefined}>{t}</button>)}</div>
                <p className="mt-1 text-[12px] font-bold uppercase tracking-[.16em] text-[#2a1838]/50">Shade · {SH[shade][0]}</p>
                <div className="flex flex-wrap gap-2">{SH.map(([n, c], i) => <button type="button" key={n} aria-label={n} onClick={() => setShade(i)} className={`h-10 w-10 rounded-full ring-offset-2 transition-transform ${i === shade ? 'scale-110 ring-2 ring-[#2a1838]' : 'hover:scale-110'}`} style={{ background: c }} />)}</div>
                <button disabled={bk.s.loading} className="mt-3 h-16 rounded-2xl text-[17px] font-bold transition-[scale,opacity] active:scale-[.97] disabled:opacity-60" style={{ background: col, color: txt(col) }}>{bk.s.loading ? 'Shaking the bottle…' : 'Request my appointment'}</button>
                <p className="text-[13px] text-[#2a1838]/55">In the finished site this request goes straight to your phone/Telegram.</p>
              </motion.form>
            ) : (
              <motion.div key="ok" initial={{ opacity: 0, scale: .8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 14 }} className="grid min-h-[400px] place-items-center text-center text-[#2a1838]">
                <div><CheckDraw className="mx-auto mb-5" size={84} /><h3 className={`${D} text-[40px]`}>Shade saved!</h3><p className="mx-auto mb-5 max-w-[320px] text-[#2a1838]/65">{bk.s.svc || 'Your visit'} in {SH[shade][0]}. In the finished site this request goes straight to your phone/Telegram.</p><button onClick={bk.reset} className="font-bold underline underline-offset-4">Book another</button></div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  )
}

function App() {
  useSmooth()
  const lite = useLite()
  const [front, setFront] = useState(0)
  const [layers, setLayers] = useState([])
  const pourRef = useRef(null)
  const pourIn = useInView(pourRef, { once: true, margin: '0px 0px -40% 0px' })
  const pick = useCallback(i => { setFront(i); setLayers(L => [...L.slice(-2), { id: Date.now() + Math.random(), s: i }]) }, [])
  useEffect(() => { if (pourIn && !layers.length) pick(front) }, [pourIn])
  const shade = layers.length ? layers[layers.length - 1].s : front
  return (
    <MotionConfig reducedMotion="user">
      <div className="font-['Rubik',sans-serif] text-[#2a1838]" style={{ background: '#fffdfb', '--sel': '#ff8fc7', '--selc': INK }}>
        <Intro bg="#fffdfb" fg={INK} duration={1.5}>
          <div className="flex items-end gap-2">{candy.map((c, k) => <motion.span key={k} className="block w-5 rounded-b-xl rounded-t-md" style={{ background: c }} initial={{ height: 0 }} animate={{ height: 40 + (k % 3) * 18 }} transition={{ type: 'spring', stiffness: 300, damping: 12, delay: k * .06 }} />)}</div>
        </Intro>
        <Progress color="#ff3b5c" />
        <Cursor color={SH[shade][1]} blend="normal" textColor={txt(SH[shade][1])} />
        <Ribbon lang="en" name={b.name} bg={INK} fg="#fff" />
        <header className="sticky top-0 z-40 bg-white/75 backdrop-blur-xl">
          <div className="mx-auto flex h-[68px] max-w-[1320px] items-center justify-between px-6 md:px-10">
            <a href="#top" className={`${D} flex items-center gap-2 text-[24px]`}><span className="flex gap-[3px]">{candy.slice(0, 4).map(c => <span key={c} className="block h-6 w-[6px] rounded-full" style={{ background: c }} />)}</span>nails & brows</a>
            <nav className="hidden gap-8 text-[15px] font-semibold text-[#2a1838]/70 md:flex">{[['#shade', 'Your shade'], ['#services', 'Services'], ['#book', 'Book'], ['#contact', 'Find us']].map(([h, t]) => <a key={h} href={h} className="hover:text-[#2a1838]">{t}</a>)}</nav>
            <a href="#book" className="hidden h-11 items-center rounded-full px-6 text-[14px] font-bold text-white sm:inline-flex" style={{ background: INK }}>Book</a>
          </div>
        </header>
        <main id="top">
          <Hero lite={lite} front={front} setFront={setFront} pick={pick} />
          <div ref={pourRef}><Pour shade={shade} layers={layers} /></div>
          <div className="relative z-10 bg-[#fffdfb] pb-4 pt-[110px] md:pt-[140px]">
            <Marquee base={-2.2} skew={false}>{['nails', 'brows', 'gel', 'acrylics', 'pedis', 'nail art'].map((t, k) => <span key={t} className={`${D} mx-6 inline-flex items-center gap-12 text-[clamp(40px,5.4vw,80px)]`} style={{ color: candy[k % candy.length] }}>{t}<span className="text-[#2a1838]">✦</span></span>)}</Marquee>
          </div>
          <section id="services" className="px-6 py-24 md:px-10" style={{ background: '#fffdfb' }}>
            <div className="mx-auto max-w-[1320px]">
              <div className="mb-16 flex flex-wrap items-end justify-between gap-6">
                <h2 className={`${D} text-[clamp(48px,7vw,112px)] leading-[.95]`}><SplitText text="Pop the cap" stagger={.04} rotate={8} /></h2>
                <p className="max-w-[340px] font-medium text-[#2a1838]/65">Nails, toes and brows under one roof. Tap a card to add it to your booking — we'll confirm the details when we call.</p>
              </div>
              <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">{SV.map(([t, d, I], k) => <CapCard key={t} t={t} d={d} I={I} k={k} />)}</div>
            </div>
          </section>
          <section className="px-6 pb-24 md:px-10" style={{ background: '#fffdfb' }}>
            <div className="mx-auto grid max-w-[1320px] gap-5 md:grid-cols-3">
              {[[<>{b.rating}<Star className="ml-1 inline-block -translate-y-3" size={40} fill="currentColor" /></>, 'average on Google', '#ff8fc7'], [<Counter to={b.rev} />, 'Google reviews', '#ffd84d'], [<>2<span className="text-[.45em]"> in 1</span></>, 'nails & brows, one visit', '#5fdcae']].map(([n, t, c], k) => (
                <Reveal key={t} delay={k * .1} className="rounded-[36px] p-10" style={{ background: c }}><span className={`${D} block text-[88px] leading-none text-[#2a1838]`}>{n}</span><span className="font-bold text-[#2a1838]/75">{t}</span></Reveal>
              ))}
            </div>
          </section>
          <Book shade={shade} setShade={i => pick(i)} />
          <section id="contact" className="px-6 pb-28 md:px-10" style={{ background: '#fffdfb' }}>
            <div className="mx-auto grid max-w-[1320px] gap-6 md:grid-cols-[.9fr_1.1fr]">
              <Reveal className="grid content-start gap-6">
                <h2 className={`${D} text-[clamp(48px,7vw,100px)] leading-[.95]`}>Find us at <span className="text-[#ff3b5c]">the Fort</span></h2>
                <p className="flex items-start gap-3 text-[20px] font-semibold"><MapPin className="mt-1 shrink-0 text-[#ff3b5c]" />{b.addr}</p>
                <a href={'tel:' + tel(b.phone)} className={`${D} flex items-center gap-3 text-[clamp(28px,3vw,38px)]`}><Phone className="text-[#ff3b5c]" />{b.phone}</a>
                <div className="flex flex-wrap gap-3">
                  <Magnetic><a href={'tel:' + tel(b.phone)} className="inline-flex h-14 items-center gap-2 rounded-full px-7 font-bold text-white" style={{ background: INK }}><Phone size={16} /> Call the salon</a></Magnetic>
                  <a href={b.ig} target="_blank" rel="noopener" className="inline-flex h-14 items-center gap-2 rounded-full px-7 font-bold text-white" style={{ background: 'linear-gradient(100deg,#ff8fc7,#ff3b5c,#ff9b42)' }}><IG /> @browsandnails_birmingham</a>
                </div>
              </Reveal>
              <Reveal delay={.1} className="h-[420px] overflow-hidden rounded-[36px] ring-4 ring-[#ff8fc7]/30"><GMap q={`${b.name}, ${b.addr}`} /></Reveal>
            </div>
          </section>
        </main>
        <footer className="px-6 py-10 text-[14px] font-semibold text-[#2a1838]/55 md:px-10" style={{ background: '#fffdfb' }}><div className="mx-auto flex max-w-[1320px] flex-wrap justify-between gap-4"><span>© 2026 {b.name} · Website concept by Artem</span><span>{b.addr}</span></div></footer>
        <CallBar lang="en" phone={b.phone} barCls="bg-white/85 backdrop-blur-xl" callCls="rounded-full bg-white text-[#2a1838] ring-1 ring-[#2a1838]/15" bookCls="rounded-full text-white bg-[#ff3b5c]" />
        <div className="h-[72px] sm:hidden" />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
