import React, { useRef, useState, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, AnimatePresence, MotionConfig, useMotionValueEvent } from 'framer-motion'
import { ArrowRight, ArrowUpRight, MapPin, Flower2, Sun, Leaf, Snowflake, Star } from 'lucide-react'
import '../lib/base.css'
import { useSmooth, Ribbon, SplitText, ScrollWords, Reveal, Magnetic, Cursor, Marquee, Counter, useBooking, phoneFocus, CheckDraw, GMap, CallBar, Progress, Intro, tel, useLite, WA, waLink, IG } from '../lib/kit'

const Garden = lazy(() => import('./nailture3d'))
const b = {
  name: 'NAILTURE', phone: '+44 7979 419668', addr: 'Unit B201/B208, The Arcadian Centre, 70 Hurst St, Birmingham B5 4TD',
  ig: 'https://www.instagram.com/nailture_brum', rating: 4.9, rev: 208,
}
const SERIF = "font-['Fraunces',serif]"
const MOSS = '#3a5a40', DEEP = '#1f2e22', CREAM = '#f4efe4', BLUSH = '#e8b4a8', SAGE = '#a3b18a'
const SEASONS = {
  spring: { key: 'spring', name: 'Spring', Icon: Flower2, bg: '#f4efe4', bg2: '#e6ecdc', ink: '#24331f', vine: '#4f6f45', leaf: '#8fb573', bud: '#f4a7b9', part: ['#f4b6c2', '#f9d3db', '#ffffff', '#f0a3b4'], kind: 'petal',
    line: 'Fresh shoots and blossom — soft pinks, sage greens and milky sheers.',
    palette: [['Blossom', '#f4b6c2'], ['Sage', '#a3b18a'], ['Lilac', '#c8b6e2'], ['Butter', '#f3e0a3'], ['Milk', '#f7f1ea']] },
  summer: { key: 'summer', name: 'Summer', Icon: Sun, bg: '#f7efd9', bg2: '#f1e2c2', ink: '#2a3320', vine: '#3a5a40', leaf: '#5c9e4a', bud: '#ff8a65', part: ['#ffb38a', '#ffd27a', '#ff8f8f', '#fff1c9'], kind: 'petal',
    line: 'Long evenings and full bloom — coral, sunflower, aqua and juicy brights.',
    palette: [['Coral', '#ff7f6b'], ['Sunflower', '#f6c344'], ['Aqua', '#6cc5c1'], ['Mint', '#b9e3c6'], ['Peach', '#ffc7a6']] },
  autumn: { key: 'autumn', name: 'Autumn', Icon: Leaf, bg: '#f1e4d2', bg2: '#e8d3b9', ink: '#3a2a1c', vine: '#5a4632', leaf: '#c7682f', bud: '#7a2a2a', part: ['#c7682f', '#a8432a', '#d9a441', '#8a5a2b'], kind: 'leaf',
    line: 'Falling leaves and warm spice — terracotta, burgundy, mustard and cocoa.',
    palette: [['Terracotta', '#c0643f'], ['Burgundy', '#6e2232'], ['Mustard', '#d2a03a'], ['Olive', '#6b6b3a'], ['Cocoa', '#5b3b2b']] },
  winter: { key: 'winter', name: 'Winter', Icon: Snowflake, bg: '#e8edee', bg2: '#d9e2e4', ink: '#1f2a2e', vine: '#3e4f55', leaf: '#8aa5a8', bud: '#9b2342', part: ['#ffffff', '#eef5f8', '#dce9ef'], kind: 'snow',
    line: 'Frost and evergreen — icy blues, silver shimmer and deep berry.',
    palette: [['Ice', '#cfe3ee'], ['Silver', '#c9ccd1'], ['Berry', '#7a1f3d'], ['Frost', '#f4f7f8'], ['Evergreen', '#2f4a3a']] },
}
const SV = [
  ['Gel manicure', 'Gentle prep, cuticle care and glossy gel colour that lasts.', 'M50 92V30M50 60C34 54 26 40 28 26C42 30 50 44 50 60ZM50 48C64 42 72 30 70 16C56 20 50 32 50 48Z'],
  ['Builder gel (BIAB)', 'A strengthening overlay that helps natural nails grow.', 'M50 94V20M50 70C30 66 20 52 22 38M50 70C70 66 80 52 78 38M50 44C38 40 32 30 34 20M50 44C62 40 68 30 66 20'],
  ['Extensions', 'Length and shape — almond, coffin, square or stiletto.', 'M50 94C50 70 40 50 30 20M30 20C44 24 50 36 46 52M50 94C52 66 62 44 74 26M74 26C62 30 54 44 56 58'],
  ['Nail art', 'Florals, line work, chrome and seasonal designs.', 'M50 90V54M50 54C40 54 34 46 38 38C42 30 50 34 50 40C50 34 58 30 62 38C66 46 60 54 50 54ZM40 40C32 32 36 22 46 24M60 40C68 32 64 22 54 24M50 90C42 82 34 82 30 74'],
  ['Pedicure', 'Soak, shape, smooth and finish with gel or classic polish.', 'M30 92C30 60 46 40 70 30M70 30C68 46 56 54 44 56M30 92C40 70 58 64 74 66M74 66C64 76 50 78 40 76'],
  ['Removal & care', 'Safe soak-off and a nourishing reset between sets.', 'M50 92V40M50 40C50 26 40 18 30 18C30 32 40 40 50 40ZM50 56C50 42 62 34 72 34C72 48 62 56 50 56ZM50 74C50 62 40 56 32 56C32 68 40 74 50 74Z'],
]

/* leaf-shaped polygon for clip-path; s≈3 covers the box */
function leafPoly(s, rot = -.6) {
  const N = 16, pts = []
  for (let i = 0; i <= N; i++) { const t = i / N * Math.PI; pts.push([Math.pow(Math.sin(t), 1.2) * .48, -Math.cos(t)]) }
  for (let i = N - 1; i > 0; i--) { const t = i / N * Math.PI; pts.push([-Math.pow(Math.sin(t), 1.2) * .48, -Math.cos(t)]) }
  const c = Math.cos(rot), sn = Math.sin(rot)
  return 'polygon(' + pts.map(([x, y]) => { const X = (x * c - y * sn) * s * 60 + 50, Y = (x * sn + y * c) * s * 60 + 50; return `${X.toFixed(2)}% ${Y.toFixed(2)}%` }).join(',') + ')'
}
/* smooth closed blob path with fixed structure so it can morph */
function blob(seed, n = 7, r = 40, v = .22, cx = 50, cy = 50) {
  let s = seed; const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280 }
  const P = Array.from({ length: n }, (_, i) => { const a = i / n * Math.PI * 2, rr = r * (1 - v + rnd() * v * 2); return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr] })
  let d = `M${P[0][0].toFixed(1)} ${P[0][1].toFixed(1)}`
  for (let i = 0; i < n; i++) {
    const p0 = P[(i - 1 + n) % n], p1 = P[i], p2 = P[(i + 1) % n], p3 = P[(i + 2) % n]
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += `C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`
  }
  return d + 'Z'
}
const BLOBS = [blob(11), blob(23), blob(37), blob(11)]
const WAVES = ['M0 40C20 10 40 60 60 30S90 10 100 30V60H0Z', 'M0 30C25 50 40 10 65 35S90 50 100 20V60H0Z', 'M0 40C20 10 40 60 60 30S90 10 100 30V60H0Z']

function Morph({ paths, fill, className = '', dur = 12, viewBox = '0 0 100 100', preserve }) {
  return <svg viewBox={viewBox} preserveAspectRatio={preserve} aria-hidden="true" className={'pointer-events-none ' + className}><motion.path fill={fill} style={{ transition: 'fill .8s' }} animate={{ d: paths }} transition={{ duration: dur, repeat: Infinity, ease: 'easeInOut' }} /></svg>
}

/* ---------------- hero + signature (one pinned 3D scene) ---------------- */
function NailFan({ season }) {
  return (
    <div className="relative mx-auto mt-6 flex h-[140px] items-end justify-center gap-2 md:h-[190px] md:gap-3">
      {season.palette.map(([n, c], k) => (
        <motion.div key={season.key + k} initial={{ y: 60, opacity: 0, rotate: 0 }} animate={{ y: 0, opacity: 1, rotate: (k - 2) * 7 }} transition={{ type: 'spring', stiffness: 160, damping: 14, delay: k * .06 }}
          className="relative w-[44px] origin-bottom md:w-[54px]" style={{ height: [84, 96, 100, 94, 76][k] + '%' }}>
          <div className="absolute inset-x-0 top-0 h-[62%] rounded-t-[999px] rounded-b-[14px] shadow-[0_12px_24px_-10px_rgba(0,0,0,.35)] ring-1 ring-black/5" style={{ background: `linear-gradient(105deg, ${c} 0%, ${c} 55%, #ffffff66 62%, ${c} 72%)` }} />
          <div className="absolute inset-x-[-4px] bottom-0 top-[56%] rounded-t-[18px] bg-[#e9c9b4]" />
        </motion.div>
      ))}
    </div>
  )
}

function SeasonPanel({ season, setSeason, onPick }) {
  return (
    <div className="pointer-events-auto mx-auto w-full max-w-[560px] rounded-[32px] p-5 shadow-[0_30px_80px_-30px_rgba(0,0,0,.35)] backdrop-blur-xl md:p-8" style={{ background: 'color-mix(in srgb, var(--bg) 82%, transparent)' }}>
      <p className="mb-1 text-[12px] font-bold uppercase tracking-[.24em] opacity-60">Grow your set</p>
      <h2 className={`${SERIF} mb-4 text-[clamp(30px,4vw,48px)] font-light leading-none`}>Pick a <i>season</i></h2>
      <div className="mb-5 grid grid-cols-4 gap-1 rounded-full p-1" style={{ background: 'color-mix(in srgb, var(--ink) 8%, transparent)' }} role="tablist">
        {Object.values(SEASONS).map(s => (
          <button key={s.key} role="tab" aria-selected={season.key === s.key} onClick={() => setSeason(s.key)} className="relative flex h-11 items-center justify-center gap-1.5 rounded-full text-[13px] font-semibold">
            {season.key === s.key && <motion.span layoutId="seas" className="absolute inset-0 rounded-full" style={{ background: 'var(--ink)' }} transition={{ type: 'spring', bounce: .25, duration: .5 }} />}
            <span className="relative flex items-center gap-1.5" style={{ color: season.key === s.key ? 'var(--bg)' : 'var(--ink)' }}><s.Icon size={15} /><span className="hidden sm:inline">{s.name}</span></span>
          </button>
        ))}
      </div>
      <NailFan season={season} />
      <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1 text-[12px] font-semibold opacity-75">{season.palette.map(([n, c]) => <span key={n} className="flex items-center gap-1.5"><i className="h-3 w-3 rounded-full ring-1 ring-black/10" style={{ background: c }} />{n}</span>)}</div>
      <AnimatePresence mode="wait"><motion.p key={season.key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mx-auto mt-3 max-w-[400px] text-center text-[14px] opacity-75">{season.line}</motion.p></AnimatePresence>
      <button onClick={onPick} className="mt-5 flex h-13 w-full items-center justify-center gap-2 rounded-full py-4 text-[15px] font-bold" style={{ background: 'var(--ink)', color: 'var(--bg)' }}>Book this {season.name.toLowerCase()} palette <ArrowRight size={17} /></button>
    </div>
  )
}

function Scene({ lite, season, setSeason, onPick }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const grow = useTransform(scrollYProgress, [0, .55], [.18, 1])
  const aOp = useTransform(scrollYProgress, [0, .22, .3], [1, 1, 0])
  const aY = useTransform(scrollYProgress, [0, .3], ['0%', '-12%'])
  const bOp = useTransform(scrollYProgress, [.32, .42], [0, 1])
  const bY = useTransform(scrollYProgress, [.32, .45], [60, 0])
  const [bOn, setBOn] = useState(false)
  useMotionValueEvent(scrollYProgress, 'change', v => setBOn(v > .33))
  return (
    <section ref={ref} className="relative h-[270vh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <Morph paths={BLOBS} fill="var(--bg2)" className="absolute -left-[20vw] top-[10%] h-[80vh] w-[80vh] opacity-80" dur={16} />
        <Morph paths={[...BLOBS].reverse()} fill={BLUSH + '55'} className="absolute -right-[18vw] bottom-[-10%] h-[70vh] w-[70vh]" dur={14} />
        <div className="absolute inset-0">{!lite ? <Suspense fallback={null}><Garden grow={grow} season={season} /></Suspense> :
          Array.from({ length: 16 }).map((_, i) => <motion.span key={i} className="absolute h-4 w-3 rounded-[60%_0]" style={{ left: `${(i * 37) % 100}%`, background: season.part[i % season.part.length] }} animate={{ y: ['-10vh', '110vh'], rotate: [0, 360] }} transition={{ duration: 9 + i % 5, repeat: Infinity, delay: i * .5, ease: 'linear' }} />)}</div>
        <motion.div style={{ opacity: aOp, y: aY }} className="pointer-events-none relative z-10 mx-auto flex h-full max-w-[1280px] flex-col items-center justify-center px-6 text-center">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5 }} className="mb-6 rounded-full px-4 py-2 text-[12px] font-bold uppercase tracking-[.24em] backdrop-blur" style={{ background: 'color-mix(in srgb, var(--bg) 70%, transparent)' }}>Nail salon · The Arcadian, Hurst St</motion.p>
          <h1 className={`${SERIF} text-[clamp(56px,11vw,168px)] font-light leading-[.88] tracking-[-.03em]`}>
            <SplitText text="Nails," delay={1.3} mode="words" stagger={.12} className="block" />
            <span className="block italic" style={{ color: 'var(--vine)' }}><SplitText text="grown" delay={1.45} stagger={.06} rotate={6} /></span>
            <SplitText text="naturally." delay={1.7} stagger={.04} className="block" />
          </h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2 }} className="mt-7 max-w-[440px] rounded-2xl px-3 py-1 text-[17px] leading-relaxed backdrop-blur-[2px]">A calm, botanical nail salon in the heart of Birmingham. Scroll to let the garden grow.</motion.p>
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.4 }} className="pointer-events-auto mt-8 flex flex-wrap justify-center gap-3">
            <Magnetic><a href="#book" data-cursor="Book" className="inline-flex h-14 items-center gap-3 rounded-full px-8 text-[15px] font-bold" style={{ background: 'var(--ink)', color: 'var(--bg)' }}>Book an appointment <ArrowRight size={18} /></a></Magnetic>
            <a href={waLink(b.phone)} target="_blank" rel="noopener" className="inline-flex h-14 items-center gap-2 rounded-full border-[1.5px] px-7 text-[15px] font-bold" style={{ borderColor: 'var(--ink)' }}><WA />WhatsApp</a>
          </motion.div>
        </motion.div>
        <motion.div style={{ opacity: bOp, y: bY, pointerEvents: bOn ? 'auto' : 'none' }} className="absolute inset-x-0 bottom-0 z-20 px-4 pb-6 md:inset-y-0 md:flex md:items-center md:px-10 md:pb-0">
          <SeasonPanel season={season} setSeason={setSeason} onPick={onPick} />
        </motion.div>
      </div>
    </section>
  )
}

/* a section that opens through a growing leaf as you scroll */
function LeafOpen({ children, bg, id, className = '' }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start start'] })
  const clip = useTransform(scrollYProgress, v => leafPoly(.04 + Math.pow(v, 1.4) * 3.2))
  return (
    <section ref={ref} id={id} className="relative">
      <motion.div style={{ clipPath: clip, background: bg }} className={className}>{children}</motion.div>
    </section>
  )
}

function Services() {
  return (
    <section id="services" className="px-6 py-28 md:px-10">
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <h2 className={`${SERIF} text-[clamp(46px,7vw,112px)] font-light leading-[.9] tracking-[-.03em]`}><SplitText text="The ritual" className="block" /><i style={{ color: 'var(--vine)' }}>menu</i></h2>
          <p className="max-w-[340px] opacity-70">Each treatment is a small ritual: slow, careful and kind to your natural nail. Tap a card to request it.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SV.map(([t, d, path], k) => (
            <motion.a key={t} href="#book" data-svc={t} data-cursor="Book"
              initial={{ clipPath: leafPoly(.02, -.6 + k * .3) }} whileInView={{ clipPath: leafPoly(3.4, -.6 + k * .3) }} viewport={{ once: true, margin: '0px 0px -12% 0px' }} transition={{ duration: 1.3, ease: [0.65, 0, 0.35, 1], delay: (k % 3) * .12 }}
              className="group relative flex min-h-[320px] flex-col justify-between overflow-hidden rounded-[28px] p-7" style={{ background: k % 3 === 1 ? 'var(--vine)' : 'var(--bg2)', color: k % 3 === 1 ? 'var(--bg)' : 'var(--ink)' }}>
              <div className="flex items-start justify-between">
                <span className="text-[12px] font-bold uppercase tracking-[.22em] opacity-60">Specimen 0{k + 1}</span>
                <ArrowUpRight className="transition-transform duration-500 group-hover:rotate-45" />
              </div>
              <svg viewBox="0 0 100 100" className="mx-auto h-[120px] w-[120px] transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <motion.path d={path} initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 2, delay: .6 + k * .08 }} />
              </svg>
              <div><h3 className={`${SERIF} text-[30px] leading-tight`}>{t}</h3><p className="mt-1 text-[15px] opacity-75">{d}</p></div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  )
}

function Book({ bk, picked }) {
  const f = 'h-14 w-full rounded-full bg-white/60 px-6 text-[16px] outline-none ring-1 ring-black/10 placeholder:text-black/40 focus:ring-2 focus:ring-[color:var(--vine)]'
  const chips = [...SV.map(s => s[0]), ...Object.values(SEASONS).map(s => s.name + ' palette')]
  return (
    <section id="book" className="relative px-6 pb-28 pt-36 md:px-10" style={{ background: 'var(--bg2)', transition: 'background-color .8s' }}>
      <Morph paths={WAVES} fill="var(--bg)" viewBox="0 0 100 60" preserve="none" className="absolute inset-x-0 top-0 h-[90px] w-full rotate-180" dur={9} />
      <div className="relative mx-auto grid max-w-[1180px] gap-12 md:grid-cols-2">
        <div>
          <h2 className={`${SERIF} text-[clamp(48px,7vw,104px)] font-light leading-[.9] tracking-[-.03em]`}><SplitText text="Plant a" className="block" /><i style={{ color: 'var(--vine)' }}>visit</i></h2>
          <p className="mb-8 mt-6 max-w-[400px] text-[17px] opacity-75">Leave your number and we'll message you back with a time. Prefer to chat? WhatsApp us directly.</p>
          <a href={'tel:' + tel(b.phone)} className={`${SERIF} block text-[34px]`}>{b.phone}</a>
          <a href={waLink(b.phone)} target="_blank" rel="noopener" className="mt-4 inline-flex h-12 items-center gap-2 rounded-full bg-[#25d366] px-6 font-bold text-black"><WA />WhatsApp</a>
        </div>
        <div className="relative rounded-[36px] bg-white/45 p-7 ring-1 ring-black/5 backdrop-blur md:p-10">
          <AnimatePresence mode="wait">
            {!bk.s.sent ? (
              <motion.form key="f" exit={{ opacity: 0, scale: .94 }} onSubmit={bk.submit} noValidate className="grid gap-4">
                <input className={f} placeholder="Your name" value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} autoComplete="name" />
                <motion.input animate={bk.s.err ? { x: [0, -8, 8, -6, 6, 0] } : {}} className={f + (bk.s.err ? ' ring-2 !ring-red-500' : '')} type="tel" inputMode="tel" placeholder="+44 7___ ______" value={bk.s.phone} onFocus={phoneFocus(bk, '+44 ')} onChange={e => bk.upd('phone', e.target.value)} autoComplete="tel" />
                <div className="flex flex-wrap gap-2">{chips.map(t => <button type="button" key={t} onClick={() => bk.upd('svc', t)} className={`rounded-full px-4 py-2 text-[13px] font-semibold transition-colors ${bk.s.svc === t ? 'text-[color:var(--bg)]' : 'bg-white/60 hover:bg-white'}`} style={bk.s.svc === t ? { background: 'var(--ink)' } : undefined}>{t}</button>)}</div>
                {picked && <div className="flex items-center gap-3 rounded-2xl bg-white/60 p-3 text-[14px]"><span className="flex -space-x-1.5">{picked.palette.map(([n, c]) => <i key={n} className="h-6 w-6 rounded-full ring-2 ring-white" style={{ background: c }} />)}</span><span><b>{picked.name} palette</b> attached</span></div>}
                <button disabled={bk.s.loading} className="mt-2 h-16 rounded-full text-[16px] font-bold transition-[scale,opacity] active:scale-[.97] disabled:opacity-60" style={{ background: 'var(--ink)', color: 'var(--bg)' }}>{bk.s.loading ? 'Planting…' : 'Request appointment'}</button>
                <p className="text-[13px] opacity-60">In the finished site this request goes straight to your phone/Telegram.</p>
              </motion.form>
            ) : (
              <motion.div key="ok" initial={{ opacity: 0, scale: .85 }} animate={{ opacity: 1, scale: 1 }} className="relative grid min-h-[340px] place-items-center text-center">
                {Array.from({ length: 14 }).map((_, k) => { const a = k / 14 * 6.28; return <motion.span key={k} className="absolute left-1/2 top-1/2 h-5 w-3 rounded-[60%_0]" style={{ background: k % 2 ? 'var(--vine)' : BLUSH }} initial={{ x: 0, y: 0, scale: 0 }} animate={{ x: Math.cos(a) * 150, y: Math.sin(a) * 120, scale: [0, 1, 0], rotate: 220 }} transition={{ duration: 1.6 }} /> })}
                <div><CheckDraw className="mx-auto mb-5" /><h3 className={`${SERIF} text-[40px]`}>Request received</h3><p className="mx-auto mb-5 max-w-[300px] opacity-70">This is what your client sees. In the finished site this request goes straight to your phone/Telegram.</p><button onClick={bk.reset} className="font-bold underline underline-offset-4">Send another</button></div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

function App() {
  useSmooth()
  const lite = useLite()
  const bk = useBooking()
  const [sk, setSk] = useState('spring')
  const [picked, setPicked] = useState(null)
  const season = SEASONS[sk]
  const onPick = () => {
    setPicked(season); bk.upd('svc', season.name + ' palette')
    const el = document.getElementById('book')
    window.__lenis ? window.__lenis.scrollTo(el, { offset: -40 }) : el.scrollIntoView({ behavior: 'smooth' })
  }
  const vars = { '--bg': season.bg, '--bg2': season.bg2, '--ink': season.ink, '--vine': season.vine, '--sel': season.vine, '--selc': '#fff', background: season.bg, color: season.ink, transition: 'background-color .8s, color .8s' }
  return (
    <MotionConfig reducedMotion="user">
      <div className="font-['Manrope',sans-serif]" style={vars}>
        <Intro bg={CREAM} fg={MOSS} duration={1.6}>
          <div className="grid place-items-center gap-2">
            <svg viewBox="0 0 100 100" width="90" height="90" fill="none" stroke={MOSS} strokeWidth="2.4" strokeLinecap="round">
              <motion.path d="M50 95V45" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: .6 }} />
              <motion.path d="M50 60C30 58 20 42 24 28C40 30 50 44 50 60Z" fill={SAGE} initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ originX: '50px', originY: '60px' }} transition={{ delay: .45, type: 'spring' }} />
              <motion.path d="M50 48C66 44 76 30 72 16C58 18 50 32 50 48Z" fill={BLUSH} initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ originX: '50px', originY: '48px' }} transition={{ delay: .6, type: 'spring' }} />
            </svg>
            <span className={`${SERIF} text-[34px] tracking-[.2em]`}>NAILTURE</span>
          </div>
        </Intro>
        <Progress color={season.vine} />
        <Cursor color={MOSS} blend="normal" textColor={CREAM} />
        <Ribbon lang="en" name={b.name} bg={DEEP} fg={CREAM} />
        <header className="sticky top-0 z-40 backdrop-blur-xl" style={{ background: 'color-mix(in srgb, var(--bg) 75%, transparent)' }}>
          <div className="mx-auto flex h-[68px] max-w-[1280px] items-center justify-between px-6 md:px-10">
            <a href="#top" className={`${SERIF} flex items-center gap-2 text-[24px] tracking-[.14em]`}><Leaf size={20} style={{ color: 'var(--vine)' }} />NAILTURE</a>
            <nav className="hidden gap-8 text-[14px] font-semibold opacity-75 md:flex">{[['#services', 'Rituals'], ['#book', 'Book'], ['#contact', 'Find us']].map(([h, t]) => <a key={h} href={h} className="hover:opacity-100">{t}</a>)}</nav>
            <a href="#book" className="hidden h-11 items-center rounded-full px-6 text-[14px] font-bold sm:inline-flex" style={{ background: 'var(--ink)', color: 'var(--bg)' }}>Book now</a>
          </div>
        </header>
        <main id="top">
          <Scene lite={lite} season={season} setSeason={setSk} onPick={onPick} />
          <LeafOpen bg={DEEP} className="px-6 py-32 text-[#f4efe4] md:px-10 md:py-44">
            <div className="mx-auto max-w-[1100px]">
              <p className={`${SERIF} mb-6 text-[22px] italic text-[#e8b4a8]`}>our ethos</p>
              <ScrollWords dim={.18} className={`${SERIF} text-[clamp(30px,4.6vw,68px)] font-light leading-[1.1]`} text="Rooted in care. We treat nails like living things — gentle prep, healthy growth and colour that feels like it belongs to the season you're in." />
            </div>
          </LeafOpen>
          <div className="py-8"><Marquee base={-1.6}>{['gel manicure', 'BIAB', 'extensions', 'nail art', 'pedicure', 'seasonal sets'].map(t => <span key={t} className={`${SERIF} mx-6 inline-flex items-center gap-10 text-[clamp(34px,4.6vw,66px)] font-light italic`}>{t}<Flower2 size={30} style={{ color: 'var(--vine)' }} /></span>)}</Marquee></div>
          <Services />
          <section className="relative overflow-hidden px-6 py-24 md:px-10">
            <div className="relative mx-auto grid max-w-[1100px] items-center gap-10 md:grid-cols-2">
              <div className="relative mx-auto aspect-square w-full max-w-[460px]">
                <Morph paths={BLOBS} fill={BLUSH} className="absolute inset-0 h-full w-full" dur={10} />
                <Morph paths={[...BLOBS].reverse()} fill="none" className="absolute inset-[-6%] h-[112%] w-[112%] [&_path]:stroke-[color:var(--vine)] [&_path]:[stroke-width:.4]" dur={13} />
                <div className="absolute inset-0 grid place-items-center text-center text-[#1f2e22]">
                  <div><span className={`${SERIF} block text-[clamp(80px,12vw,150px)] font-light leading-none`}>4.9</span><span className="flex justify-center gap-1">{[0, 1, 2, 3, 4].map(i => <Star key={i} size={18} fill="currentColor" />)}</span><span className="mt-2 block text-[13px] font-bold uppercase tracking-[.2em]">on Google</span></div>
                </div>
              </div>
              <Reveal>
                <h2 className={`${SERIF} text-[clamp(44px,6vw,90px)] font-light leading-[.92]`}><Counter to={b.rev} /> <i style={{ color: 'var(--vine)' }}>kind words</i></h2>
                <p className="mt-5 max-w-[400px] text-[17px] opacity-75">That's how many Google reviews NAILTURE has collected so far — read them all on the salon's Google profile.</p>
                <a href="#book" className="mt-8 inline-flex h-14 items-center gap-2 rounded-full px-8 font-bold" style={{ background: 'var(--ink)', color: 'var(--bg)' }}>Join them <ArrowRight size={18} /></a>
              </Reveal>
            </div>
          </section>
          <Book bk={bk} picked={picked} />
          <LeafOpen id="contact" bg={MOSS} className="px-6 py-28 text-[#f4efe4] md:px-10">
            <div className="mx-auto grid max-w-[1280px] gap-8 md:grid-cols-[.9fr_1.1fr]">
              <div className="grid content-start gap-6">
                <h2 className={`${SERIF} text-[clamp(48px,6.4vw,96px)] font-light leading-[.9]`}>Find the <i className="text-[#e8b4a8]">garden</i></h2>
                <p className="flex items-start gap-3 text-[20px] font-semibold"><MapPin className="mt-1 shrink-0 text-[#e8b4a8]" />{b.addr}</p>
                <a href={'tel:' + tel(b.phone)} className={`${SERIF} text-[34px]`}>{b.phone}</a>
                <div className="flex flex-wrap gap-2">
                  <a href={waLink(b.phone)} target="_blank" rel="noopener" className="inline-flex h-12 items-center gap-2 rounded-full bg-[#25d366] px-6 font-bold text-black"><WA />WhatsApp</a>
                  <a href={b.ig} target="_blank" rel="noopener" className="inline-flex h-12 items-center gap-2 rounded-full bg-[#f4efe4] px-6 font-bold text-[#1f2e22]"><IG />@nailture_brum</a>
                  <a href={'tel:' + tel(b.phone)} className="inline-flex h-12 items-center gap-2 rounded-full px-6 font-bold ring-1 ring-[#f4efe4]/50">Call <ArrowUpRight size={16} /></a>
                </div>
              </div>
              <div className="h-[420px] overflow-hidden rounded-[120px_28px_120px_28px]"><GMap q={`${b.name}, ${b.addr}`} /></div>
            </div>
          </LeafOpen>
        </main>
        <footer className="px-6 py-10 text-[14px] font-semibold opacity-70 md:px-10"><div className="mx-auto flex max-w-[1280px] flex-wrap justify-between gap-4"><span>© 2026 {b.name} · Website concept by Artem</span><a href={b.ig} target="_blank" rel="noopener">Instagram</a></div></footer>
        <CallBar lang="en" phone={b.phone} barCls="backdrop-blur-xl bg-white/50" callCls="rounded-full bg-white text-[#1f2e22] ring-1 ring-black/10" bookCls="rounded-full text-[#f4efe4] bg-[#3a5a40]" />
        <div className="h-[72px] sm:hidden" />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
