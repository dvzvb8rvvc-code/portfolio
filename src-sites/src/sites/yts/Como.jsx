import React, { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useSpring, useMotionValue, animate, useReducedMotion, useInView } from 'framer-motion'
import { useLite, useIsMobile } from '../../lib/kit'
import { useLang } from './i18n'
import { COMO, SARDEGNA, T, img } from './data'

const ComoScene = lazy(() => import('./como3d'))
const EASE = [0.16, 1, 0.3, 1]
const LAKE = '#27414f', PAPER = '#ece7df', INK = '#151412', GOLD = '#c3a15e', OCHRE = '#b06a35'

/* ───────────── small shared bits ───────────── */
function Mask({ children, className = '', delay = 0 }) {
  // observe the (unclipped) wrapper — the translated child is clipped, so IO on it would never fire
  const ref = useRef()
  const inView = useInView(ref, { once: true, margin: '0px 0px -8% 0px' })
  return (
    <span ref={ref} className={`block overflow-hidden pb-[.12em] -mb-[.12em] ${className}`}>
      <motion.span className="block" initial={{ y: '108%' }} animate={inView ? { y: '0%' } : { y: '108%' }} transition={{ duration: 1.1, ease: EASE, delay }}>{children}</motion.span>
    </span>
  )
}
function Eyebrow({ children, className = '' }) {
  return <div className={`flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[.22em] ${className}`}><span className="h-px w-8 bg-current opacity-60" />{children}</div>
}
function useNear(ref, margin = '100% 0px') {
  const [near, setNear] = useState(false), [vis, setVis] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const a = new IntersectionObserver(([e]) => setNear(e.isIntersecting), { rootMargin: margin })
    const b = new IntersectionObserver(([e]) => setVis(e.isIntersecting), { rootMargin: '10% 0px' })
    a.observe(el); b.observe(el)
    return () => { a.disconnect(); b.disconnect() }
  }, [])
  return [near, vis]
}
const scrollToId = id => { const el = document.getElementById(id); if (!el) return; const y = el.getBoundingClientRect().top + scrollY - 40; window.__lenis ? window.__lenis.scrollTo(y, { duration: 1.6 }) : scrollTo({ top: y, behavior: 'smooth' }) }

/* ───────────── 1. FILM: the hillside above Varenna ───────────── */
const CHAPTERS = [
  { en: 'The lake', it: 'Il lago' }, { en: 'The Golden Triangle', it: 'Il Triangolo d’Oro' }, { en: 'The hillside', it: 'La collina' }, { en: 'Your garden', it: 'Il tuo giardino' },
]
function Chapter({ p, range, children, className = '' }) {
  const [a, b, c, d] = range
  const first = a < 0, last = d > 1
  const inp = first ? [0, .01, c, d] : last ? [a, b, .99, 1] : [a, b, c, d]
  const opacity = useTransform(p, inp, first ? [1, 1, 1, 0] : last ? [0, 1, 1, 1] : [0, 1, 1, 0])
  const y = useTransform(p, inp, first ? [0, 0, 0, -40] : last ? [40, 0, 0, 0] : [40, 0, 0, -40])
  return <motion.div style={{ opacity, y }} className={`pointer-events-none absolute ${className}`}>{children}</motion.div>
}
function KineticWords({ p, text, from, to, className = '' }) {
  const words = text.split(' ')
  return (
    <span className={className}>
      {words.map((w, i) => <KWord key={i + w} p={p} w={w} a={from + (to - from) * (i / words.length)} b={from + (to - from) * ((i + 1) / words.length)} />)}
    </span>
  )
}
function KWord({ p, w, a, b }) {
  const y = useTransform(p, [a, b], ['105%', '0%']), o = useTransform(p, [a, b], [0, 1])
  return <span className="inline-block overflow-hidden pb-[.1em] -mb-[.1em] align-bottom"><motion.span className="inline-block" style={{ y, opacity: o }}>{w}&nbsp;</motion.span></span>
}

function Rail({ p }) {
  const { t } = useLang()
  const h = useTransform(p, [0, 1], ['0%', '100%'])
  return (
    <div className="pointer-events-none absolute right-6 top-1/2 hidden -translate-y-1/2 items-stretch gap-4 md:flex">
      <div className="flex flex-col justify-between py-1 text-right text-[10.5px] font-semibold uppercase tracking-[.2em] text-white/80">
        {CHAPTERS.map((c, i) => <RailItem key={i} p={p} i={i} label={t(c)} />)}
      </div>
      <div className="relative h-[220px] w-px bg-white/25"><motion.div className="absolute inset-x-0 top-0 bg-white" style={{ height: h }} /></div>
    </div>
  )
}
function RailItem({ p, i, label }) {
  const c = [[0, .16], [.16, .45], [.45, .78], [.78, 1.01]][i]
  const o = useTransform(p, v => (v >= c[0] && v < c[1] ? 1 : .38))
  return <motion.span style={{ opacity: o }}>{String(i + 1).padStart(2, '0')} · {label}</motion.span>
}

function FilmStatic() {
  // lite / reduced motion: end state as a still with gentle parallax
  const { t } = useLang()
  const ref = useRef()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['-8%', '8%'])
  return (
    <div ref={ref} className="relative h-[100svh] min-h-[560px] overflow-hidden">
      <motion.img style={{ y, scale: 1.18 }} src={img(120)} alt={t({ en: 'Il Giardino di Teodolinda — render', it: 'Il Giardino di Teodolinda — render' })} className="absolute inset-0 h-full w-full object-cover" loading="lazy" decoding="async" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#27414f]/70 via-transparent to-[#27414f]" />
      <FilmTitle className="absolute left-5 top-24 md:left-10" />
    </div>
  )
}
function FilmTitle({ className = '' }) {
  const { t } = useLang()
  return (
    <div className={className}>
      <Eyebrow className="mb-5 text-white/85">{t({ en: 'Residences · 01 — Lake Como', it: 'Residenze · 01 — Lago di Como' })}</Eyebrow>
      <h2 className={`${T.serif} text-[clamp(52px,9.4vw,150px)] leading-[.86] tracking-[-.02em] text-white drop-shadow-[0_2px_30px_rgba(0,0,0,.18)]`}>
        <Mask>Il Giardino</Mask>
        <Mask delay={.08}><em>di Teodolinda</em></Mask>
      </h2>
      <div className="mt-5 text-[13px] font-medium tracking-[.14em] text-white/85 uppercase">{COMO.place}</div>
    </div>
  )
}

function Film() {
  const { t } = useLang()
  const ref = useRef(), skyRef = useRef()
  const lite = useLite(), mobile = useIsMobile()
  const [near, vis] = useNear(ref)
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const wordY = useTransform(p, [0, .2], ['0vh', '-28vh'])
  const wordO = useTransform(p, [0, .14, .22], [1, 1, 0])
  const vistaO = useTransform(p, [.84, .95], [0, 1])
  const vistaY = useTransform(p, [.84, 1], ['8vh', '0vh'])
  const labels = useMemo(() => ({
    triangle: t({ en: 'The Golden Triangle', it: 'Il Triangolo d’Oro' }),
    varenna: ['Varenna', t({ en: '7–10 min', it: '7–10 min' })],
    vezio: ['Castello di Vezio', ''], bellagio: ['Bellagio', ''], menaggio: ['Menaggio', ''], cadenabbia: ['Cadenabbia', ''],
    home: ['Il Giardino di Teodolinda', 'Perledo'],
  }), [t])
  if (lite) return <FilmStatic />
  return (
    <div ref={ref} className="relative h-[480vh] md:h-[560vh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div ref={skyRef} className="absolute inset-0" style={{
          background: 'radial-gradient(circle at var(--sx,-50%) var(--sy,-50%), rgba(255,244,214,var(--glow,0)) 0, rgba(255,214,150,calc(var(--glow,0)*.7)) 5%, rgba(255,190,120,calc(var(--glow,0)*.3)) 20%, rgba(255,186,118,0) 48%), linear-gradient(180deg, var(--top,#56738a) 0%, var(--hor,#e2b8a6) var(--hy,55%), var(--hor,#e2b8a6) 100%)',
        }} />
        {/* giant type that the mountains cut through */}
        <motion.div aria-hidden style={{ y: wordY, opacity: wordO }} className="pointer-events-none absolute inset-x-0 top-[16%] select-none text-center md:top-[13%]">
          <span className={`${T.sans} block text-[34vw] font-black leading-[.8] tracking-[-.06em] text-white/90 md:text-[27vw]`}>COMO</span>
        </motion.div>
        <motion.div aria-hidden style={{ opacity: vistaO, y: vistaY }} className="pointer-events-none absolute inset-x-0 top-[18%] select-none text-center md:top-[13%]">
          <span className={`${T.serif} block text-[30vw] italic leading-[.8] tracking-[-.03em] text-[#fff3dc]/85 md:text-[22vw]`}>Vista</span>
        </motion.div>
        <div className="absolute inset-0">
          {near && <Suspense fallback={null}><ComoScene progress={p} skyRef={skyRef} active={vis} mobile={mobile} labels={labels} /></Suspense>}
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[46%] bg-gradient-to-t from-[#151412]/55 via-[#151412]/15 to-transparent" />

        {/* chapters */}
        <Chapter p={p} range={[-1, -.5, .1, .16]} className="bottom-[13%] left-5 right-5 md:bottom-[11%] md:left-10">
          <FilmTitle />
        </Chapter>
        <Chapter p={p} range={[.2, .26, .42, .47]} className="bottom-[12%] left-5 right-5 max-w-[520px] md:left-10">
          <Eyebrow className="mb-4 text-white/85">{t({ en: 'The view', it: 'La vista' })}</Eyebrow>
          <p className={`${T.serif} text-[clamp(30px,3.6vw,52px)] leading-[1.02] text-white drop-shadow-[0_2px_24px_rgba(0,0,0,.25)]`}>{t(COMO.views)}</p>
        </Chapter>
        <Chapter p={p} range={[.48, .53, .74, .79]} className="bottom-[12%] left-5 right-5 max-w-[560px] md:left-auto md:right-24">
          <Eyebrow className="mb-4 text-white/85">{t({ en: 'Perledo · SP65 Scenic Route', it: 'Perledo · Strada panoramica SP65' })}</Eyebrow>
          <p className={`${T.serif} text-[clamp(28px,3.1vw,46px)] leading-[1.04] text-white drop-shadow-[0_2px_24px_rgba(0,0,0,.3)]`}>{t(COMO.lead)}</p>
        </Chapter>
        <Chapter p={p} range={[.82, .88, 1.1, 1.2]} className="bottom-[12%] left-5 right-5 md:left-10">
          <Eyebrow className="mb-4 text-white/85">{t({ en: 'From every garden', it: 'Da ogni giardino' })}</Eyebrow>
          <h3 className={`${T.serif} text-[clamp(40px,6vw,96px)] leading-[.92] text-white drop-shadow-[0_2px_30px_rgba(0,0,0,.25)]`}>
            <KineticWords p={p} from={.84} to={.95} text={t({ en: 'The lake, framed as your own.', it: 'Il lago, incorniciato come fosse tuo.' })} />
          </h3>
        </Chapter>
        <Rail p={p} />
        <button onClick={() => scrollToId('como-units')} className="absolute bottom-6 right-5 z-10 flex h-10 items-center gap-2 rounded-full bg-white/15 px-4 text-[12px] font-semibold uppercase tracking-[.16em] text-white backdrop-blur-md transition hover:bg-white/25 md:right-10">
          {t('skip')}<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M6 1v10M2 7l4 4 4-4" /></svg>
        </button>
      </div>
    </div>
  )
}

/* ───────────── 2. UNIT EXPLORER: isometric home that grows from the smallest to the largest ───────────── */
const lerp = (a, b, t) => a + (b - a) * t
const C30 = Math.cos(Math.PI / 6), S30 = .5
const iso = (x, y, z, s) => [(x - y) * C30 * s, (x + y) * S30 * s - z * s]
const poly = (pts, s) => 'M' + pts.map(([x, y, z]) => iso(x, y, z, s).map(v => v.toFixed(1)).join(',')).join('L') + 'Z'
const seg = (a, b, s) => { const p = iso(...a, s), q = iso(...b, s); return `M${p[0].toFixed(1)},${p[1].toFixed(1)}L${q[0].toFixed(1)},${q[1].toFixed(1)}` }
function unitGeom(t) {
  const A = lerp(35, 95, t), G = lerp(25, 160, t)
  const w = Math.sqrt(A * 1.6), d = A / w, H = 3.3
  const gw = Math.max(w + 1, Math.sqrt(G * 1.25)), gd = G / gw
  const s = 15
  const x0 = -w / 2, x1 = w / 2, gx0 = -gw / 2, gx1 = gw / 2
  const out = {}
  out.garden = poly([[gx0, 0, 0], [gx1, 0, 0], [gx1, gd, 0], [gx0, gd, 0]], s)
  out.gardenEdge = poly([[gx0, gd, 0], [gx1, gd, 0], [gx1, gd, -.8], [gx0, gd, -.8]], s) + poly([[gx1, 0, 0], [gx1, gd, 0], [gx1, gd, -.8], [gx1, 0, -.8]], s)
  let hatch = ''
  for (let i = 1; i < 14; i++) { const yy = gd * i / 14; hatch += seg([gx0 + .5, yy, 0], [gx0 + .5 + Math.min(gw - 1, 1.2 + (i % 3) * .8), yy, 0], s) }
  out.hatch = hatch
  out.side = poly([[x1, -d, 0], [x1, 0, 0], [x1, 0, H], [x1, -d, H]], s)
  out.front = poly([[x0, 0, 0], [x1, 0, 0], [x1, 0, H], [x0, 0, H]], s)
  out.roof = poly([[x0 - .3, -d - .2, H], [x1 + .3, -d - .2, H], [x1 + .3, .5, H], [x0 - .3, .5, H]], s)
  out.roofEdge = poly([[x0 - .3, .5, H], [x1 + .3, .5, H], [x1 + .3, .5, H - .25], [x0 - .3, .5, H - .25]], s) + poly([[x1 + .3, -d - .2, H], [x1 + .3, .5, H], [x1 + .3, .5, H - .25], [x1 + .3, -d - .2, H - .25]], s)
  let mull = ''; const n = Math.max(3, Math.round(w / 1.6))
  for (let i = 1; i < n; i++) { const xx = lerp(x0, x1, i / n); mull += seg([xx, 0, .05], [xx, 0, H - .05], s) }
  mull += seg([x0, 0, H * .52], [x1, 0, H * .52], s)
  out.mull = mull
  const tx = gx1 - 2.8, ty = gd - 2.9
  out.tub = poly([[tx, ty, .02], [tx + 2.2, ty, .02], [tx + 2.2, ty + 2.2, .02], [tx, ty + 2.2, .02]], s)
  out.tubIn = poly([[tx + .35, ty + .35, .03], [tx + 1.85, ty + .35, .03], [tx + 1.85, ty + 1.85, .03], [tx + .35, ty + 1.85, .03]], s)
  const px = x1 + 1.2
  out.park = poly([[px, -6, 0], [px + 2.6, -6, 0], [px + 2.6, -.8, 0], [px, -.8, 0]], s)
  out.parkP = iso(px + 1.3, -3.4, 0, s)
  out.pool = poly([[-21, -3, 0], [-13.5, -3, 0], [-13.5, 2, 0], [-21, 2, 0]], s)
  out.poolIn = poly([[-20.2, -2.2, .02], [-14.3, -2.2, .02], [-14.3, 1.2, .02], [-20.2, 1.2, .02]], s)
  out.poolL = iso(-17.2, 3.7, 0, s)
  out.heat = poly([[x0 + .6, -d + .4, H], [x0 + 2, -d + .4, H], [x0 + 2, -d + 1.6, H], [x0 + .6, -d + 1.6, H]], s) + poly([[x0 + .6, -d + 1.6, H], [x0 + 2, -d + 1.6, H], [x0 + 2, -d + 1.6, H + .7], [x0 + .6, -d + 1.6, H + .7]], s)
  // dimension line along the front of the garden
  out.dimA = seg([gx0, gd + 2, 0], [gx1, gd + 2, 0], s)
  out.dimL = iso(0, gd + 3.6, 0, s)
  out.houseL = iso(x1 + .2, -d / 2, H + 1.6, s)
  out.lake = iso(6, gd + 5.5, 0, s)
  return out
}
const PARTS = ['garden', 'heat', 'park', 'tub', 'pool'] // maps to COMO.every order

function UnitSvg({ t, hi }) {
  const { t: tr } = useLang()
  const g = k => useTransform(t, v => unitGeom(v)[k]) // eslint-disable-line react-hooks/rules-of-hooks
  const P = {}
  ;['garden', 'gardenEdge', 'hatch', 'side', 'front', 'roof', 'roofEdge', 'mull', 'tub', 'tubIn', 'park', 'pool', 'poolIn', 'heat', 'dimA'].forEach(k => { P[k] = g(k) })
  const pT = useTransform(t, v => { const q = unitGeom(v).parkP; return `translate(${q[0]}px, ${q[1]}px)` })
  const dT = useTransform(t, v => { const q = unitGeom(v).dimL; return `translate(${q[0]}px, ${q[1]}px)` })
  const gT = useTransform(t, v => Math.round(lerp(25, 160, v)) + ' m²')
  const on = k => hi === k
  const stroke = k => (on(k) ? OCHRE : INK)
  const pl = unitGeom(0).poolL, lk = unitGeom(1).lake
  return (
    <svg viewBox="-290 -175 570 400" className="h-auto w-full overflow-visible" role="img" aria-label={tr({ en: 'Isometric drawing of a home with its garden', it: 'Disegno isometrico di una casa con il suo giardino' })}>
      <defs>
        <pattern id="como-glass" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><path d="M0 0v6" stroke="#27414f" strokeOpacity=".35" strokeWidth="1" /></pattern>
      </defs>
      <text x={lk[0]} y={lk[1]} className={`${T.serif}`} fontSize="20" fontStyle="italic" fill={LAKE} opacity=".55" textAnchor="middle">↙ {tr({ en: 'towards the lake', it: 'verso il lago' })}</text>
      <motion.path d={P.pool} fill="#dfe6e3" stroke={stroke('pool')} strokeWidth={on('pool') ? 1.8 : 1} strokeDasharray={on('pool') ? '0' : '4 3'} />
      <motion.path d={P.poolIn} fill={on('pool') ? '#9fd3da' : '#c4dde0'} stroke="none" />
      <text x={pl[0]} y={pl[1]} fontSize="10.5" letterSpacing="1.6" fill={stroke('pool')} textAnchor="middle" fontWeight="600">{tr({ en: 'SHARED POOL', it: 'PISCINA COMUNE' })}</text>
      <motion.path d={P.gardenEdge} fill="#cfc6b6" stroke={INK} strokeWidth=".8" />
      <motion.path d={P.garden} fill={on('garden') ? '#cbd8a6' : '#dfe3c9'} stroke={stroke('garden')} strokeWidth={on('garden') ? 1.8 : 1} />
      <motion.path d={P.hatch} stroke="#6f7f3a" strokeOpacity=".45" strokeWidth=".9" fill="none" />
      <motion.path d={P.tub} fill="#f1ede6" stroke={stroke('tub')} strokeWidth={on('tub') ? 1.8 : .9} strokeDasharray={on('tub') ? '0' : '3 2'} />
      <motion.path d={P.tubIn} fill={on('tub') ? '#9fd3da' : 'none'} stroke={stroke('tub')} strokeWidth=".7" strokeDasharray="2 2" />
      <motion.path d={P.park} fill={on('park') ? '#f3dcc6' : 'none'} stroke={stroke('park')} strokeWidth={on('park') ? 1.8 : 1} strokeDasharray="5 3" />
      <motion.text style={{ transform: pT }} fontSize="15" fontWeight="800" fill={stroke('park')} textAnchor="middle" dy="5">P</motion.text>
      <motion.path d={P.side} fill="#e6dccb" stroke={INK} strokeWidth="1" />
      <motion.path d={P.front} fill="#b9c6c9" stroke={INK} strokeWidth="1" />
      <motion.path d={P.front} fill="url(#como-glass)" stroke="none" />
      <motion.path d={P.mull} stroke={INK} strokeWidth=".8" />
      <motion.path d={P.roofEdge} fill="#d5cbb9" stroke={INK} strokeWidth=".9" />
      <motion.path d={P.roof} fill="#a9b77c" stroke={INK} strokeWidth="1" />
      <motion.path d={P.heat} fill={on('heat') ? OCHRE : '#efe9de'} fillOpacity={on('heat') ? .5 : 1} stroke={stroke('heat')} strokeWidth={on('heat') ? 1.6 : .8} />
      <motion.path d={P.dimA} stroke={INK} strokeWidth=".8" markerEnd="" />
      <motion.g style={{ transform: dT }}>
        <motion.text fontSize="12" letterSpacing="1.4" fill={INK} textAnchor="middle" fontWeight="600">{gT}</motion.text>
      </motion.g>
    </svg>
  )
}

function Num({ t, a, b, className = '' }) {
  const v = useTransform(t, x => Math.round(lerp(a, b, x)))
  return <motion.span className={`tabular-nums ${className}`}>{v}</motion.span>
}

function Units() {
  const { t } = useLang()
  const raw = useMotionValue(0)
  const sp = useSpring(raw, { stiffness: 90, damping: 20, mass: .8 })
  const [end, setEnd] = useState(0)
  const [hi, setHi] = useState(null)
  const track = useRef(), drag = useRef(false)
  const reduce = useReducedMotion()
  const go = v => { setEnd(v); animate(raw, v, { duration: reduce ? 0 : .9, ease: EASE }) }
  const fromPointer = e => { const r = track.current.getBoundingClientRect(); raw.set(Math.min(1, Math.max(0, (e.clientX - r.left) / r.width))) }
  const knob = useTransform(sp, v => `${v * 100}%`)
  const ref = useRef(); const inView = useInView(ref, { once: true, margin: '-30% 0px' })
  useEffect(() => { if (inView && !reduce) { const id = setTimeout(() => go(1), 700); return () => clearTimeout(id) } }, [inView])
  return (
    <div id="como-units" ref={ref} className="relative bg-[#ece7df] text-[#151412]">
      <div className="mx-auto grid max-w-[1440px] grid-cols-12 gap-x-5 px-5 pb-24 pt-24 md:px-10 md:pb-36 md:pt-36">
        <div className="col-span-12 lg:col-span-5">
          <Eyebrow className="text-[#151412]/70">{t({ en: 'The homes', it: 'Le case' })}</Eyebrow>
          <h3 className={`${T.serif} mt-6 text-[clamp(44px,6vw,92px)] leading-[.92] tracking-[-.01em]`}>
            <Mask>{t({ en: 'One home,', it: 'Una casa,' })}</Mask>
            <Mask delay={.07}><em className="text-[#27414f]">{t({ en: 'one garden.', it: 'un giardino.' })}</em></Mask>
          </h3>
          <p className="mt-6 max-w-[440px] text-[16px] leading-[1.6] text-[#151412]/70">{t({ en: 'Homes range from 35 m² with a 25 m² garden to 95 m² with a 160 m² garden. Drag between the two ends of the range.', it: 'Le case vanno da 35 m² con 25 m² di giardino fino a 95 m² con 160 m² di giardino. Trascina tra i due estremi della gamma.' })}</p>

          <div className="mt-10 grid grid-cols-2 gap-6 border-t border-[#151412]/15 pt-8">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[.2em] text-[#151412]/55">{t({ en: 'Built area', it: 'Superficie' })}</div>
              <div className={`${T.serif} mt-2 text-[clamp(64px,7vw,108px)] leading-[.85]`}><Num t={sp} a={35} b={95} /><span className="ml-1 text-[.36em] align-top">m²</span></div>
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[.2em] text-[#151412]/55">{t({ en: 'Private garden', it: 'Giardino privato' })}</div>
              <div className={`${T.serif} mt-2 text-[clamp(64px,7vw,108px)] leading-[.85] text-[#27414f]`}><Num t={sp} a={25} b={160} /><span className="ml-1 text-[.36em] align-top">m²</span></div>
            </div>
          </div>

          {/* range slider — two real ends only */}
          <div className="mt-10 select-none">
            <div className="mb-3 flex justify-between text-[11px] font-semibold uppercase tracking-[.2em]">
              <button onClick={() => go(0)} className={end === 0 ? 'text-[#151412]' : 'text-[#151412]/45'}>{t({ en: 'From', it: 'Da' })} · 35 + 25 m²</button>
              <button onClick={() => go(1)} className={end === 1 ? 'text-[#151412]' : 'text-[#151412]/45'}>{t({ en: 'To', it: 'A' })} · 95 + 160 m²</button>
            </div>
            <div
              ref={track} role="slider" tabIndex={0} aria-valuemin={0} aria-valuemax={1} aria-valuenow={end}
              aria-valuetext={end ? t({ en: 'Largest home', it: 'Casa più grande' }) : t({ en: 'Smallest home', it: 'Casa più piccola' })}
              aria-label={t({ en: 'Home size range', it: 'Gamma di superfici' })}
              onKeyDown={e => { if (e.key === 'ArrowRight' || e.key === 'ArrowUp') go(1); if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') go(0) }}
              onPointerDown={e => { drag.current = true; e.currentTarget.setPointerCapture(e.pointerId); fromPointer(e) }}
              onPointerMove={e => drag.current && fromPointer(e)}
              onPointerUp={() => { drag.current = false; go(raw.get() > .5 ? 1 : 0) }}
              className="relative mx-6 h-12 cursor-grab touch-none outline-none active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-[#27414f]/40 rounded-full"
            >
              <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-[#151412]/25" />
              <motion.div className="absolute left-0 top-1/2 h-[2px] -translate-y-1/2 bg-[#151412]" style={{ width: knob }} />
              <div className="absolute left-0 top-1/2 h-3 w-px -translate-y-1/2 bg-[#151412]" /><div className="absolute right-0 top-1/2 h-3 w-px -translate-y-1/2 bg-[#151412]" />
              <motion.div className="absolute top-1/2 -ml-6 -mt-6 grid h-12 w-12 place-items-center rounded-full bg-[#151412] text-[#ece7df] shadow-[0_10px_30px_-10px_rgba(0,0,0,.5)]" style={{ left: knob }}>
                <svg width="18" height="10" viewBox="0 0 18 10" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 1 1 5l4 4M13 1l4 4-4 4" /></svg>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="col-span-12 mt-14 lg:col-span-7 lg:mt-0">
          <div className="relative rounded-[28px] bg-[#e2dcd2] p-4 md:p-8">
            <div className="absolute left-6 top-5 text-[10.5px] font-semibold uppercase tracking-[.22em] text-[#151412]/50 md:left-8 md:top-7">{t({ en: 'Axonometric · not to scale', it: 'Assonometria · non in scala' })}</div>
            <div className="pt-6"><UnitSvg t={sp} hi={hi} /></div>
          </div>
          <div className="mt-8">
            <div className="mb-4 text-[11px] font-semibold uppercase tracking-[.2em] text-[#151412]/55">{t({ en: 'Every home includes', it: 'Ogni casa include' })}</div>
            <ul className="divide-y divide-[#151412]/12 border-y border-[#151412]/12">
              {t(COMO.every).map((x, i) => (
                <li key={i} onMouseEnter={() => setHi(PARTS[i])} onMouseLeave={() => setHi(null)} onFocus={() => setHi(PARTS[i])} onBlur={() => setHi(null)} tabIndex={0}
                  className="group flex cursor-default items-baseline gap-5 py-4 outline-none">
                  <span className="w-6 text-[11px] font-semibold tabular-nums text-[#151412]/40">{String(i + 1).padStart(2, '0')}</span>
                  <span className={`${T.serif} flex-1 text-[22px] leading-tight transition-colors duration-300 md:text-[26px] ${hi === PARTS[i] ? 'text-[#b06a35]' : ''}`}>{x}</span>
                  <span className={`h-px transition-all duration-500 ${hi === PARTS[i] ? 'w-14 bg-[#b06a35]' : 'w-6 bg-[#151412]/25'}`} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ───────────── 3. FACTS: numerals cut out of the lake ───────────── */
function Fact({ f, i, p }) {
  const { t } = useLang()
  const bx = useTransform(p, [0, 1], [`${10 + i * 22}%`, `${40 + i * 18}%`])
  return (
    <div className={`relative border-t border-[#151412]/15 pt-5 ${i % 2 ? 'md:mt-32' : ''}`}>
      <div className="flex items-baseline justify-between text-[11px] font-semibold uppercase tracking-[.2em] text-[#151412]/55">
        <span>{String(i + 1).padStart(2, '0')}</span><span>{t(f.l)}</span>
      </div>
      <Mask>
        <motion.span
          className={`${T.serif} block whitespace-nowrap bg-clip-text text-transparent text-[clamp(96px,17vw,280px)] leading-[.9] tracking-[-.04em]`}
          style={{ backgroundImage: `url(${img(i % 2 ? 141 : 129)})`, backgroundSize: '260% auto', backgroundPositionX: bx, backgroundPositionY: '64%', WebkitBackgroundClip: 'text', WebkitTextStroke: '1px rgba(39,65,79,.22)' }}
        >{f.v}</motion.span>
      </Mask>
      {f.u && <div className={`${T.serif} -mt-2 text-[34px] italic text-[#27414f]`}>{f.u}</div>}
    </div>
  )
}
function Facts() {
  const { t } = useLang()
  const ref = useRef()
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  return (
    <div ref={ref} className="relative overflow-hidden bg-[#ece7df] text-[#151412]">
      <div className="mx-auto max-w-[1440px] px-5 pb-24 md:px-10 md:pb-40">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <Eyebrow className="text-[#151412]/70">{t({ en: 'In numbers', it: 'In cifre' })}</Eyebrow>
          <p className={`${T.serif} max-w-[460px] text-[24px] italic leading-snug text-[#151412]/70`}>{t({ en: 'Two complexes, A and B — figures cut from the view itself.', it: 'Due complessi, A e B — cifre ritagliate dalla vista stessa.' })}</p>
        </div>
        <div className="grid gap-x-16 gap-y-14 md:grid-cols-2">
          {COMO.facts.map((f, i) => <Fact key={i} f={f} i={i} p={p} />)}
        </div>
      </div>
    </div>
  )
}

/* ───────────── 4. BUILD PROGRESS: horizontal pinned timeline ───────────── */
const PH_IMG = [[30, 'sketch'], [85, 'sketch'], [138, 'site'], [130, 'site'], [132, 'site'], [134, 'site'], [140, 'render']]
const KIND = { sketch: { en: 'Sketch', it: 'Schizzo' }, site: { en: 'Site photo', it: 'Foto di cantiere' }, render: { en: 'Render', it: 'Render' } }
function PhaseCard({ i, name, id, kind }) {
  const { t } = useLang()
  const tall = id === 132 || kind === 'sketch'
  return (
    <figure className="relative flex w-[78vw] shrink-0 flex-col sm:w-[46vw] lg:w-[30vw] lg:max-w-[460px]">
      <div className="flex items-baseline gap-3 border-t border-white/25 pt-4">
        <span className="text-[11px] font-semibold tabular-nums tracking-[.2em] text-[#c3a15e]">{String(i + 1).padStart(2, '0')} / 07</span>
      </div>
      <div className={`${T.serif} mt-2 text-[clamp(34px,3.4vw,54px)] leading-none text-[#ece7df]`}>{name}</div>
      <div className={`mt-6 overflow-hidden rounded-[18px] ${kind === 'sketch' ? 'bg-[#ece7df]' : 'bg-black/20'}`}>
        <img src={img(id, true)} alt={`${name} — ${t(KIND[kind])}`} loading="lazy" decoding="async"
          className={`w-full ${tall ? 'aspect-[4/5] object-contain' : 'aspect-[4/3] object-cover'} ${kind === 'sketch' ? 'p-4 mix-blend-multiply' : ''} ${id === 132 ? '!object-cover' : ''}`} />
      </div>
      <figcaption className="mt-3 text-[11px] font-medium uppercase tracking-[.18em] text-white/45">{t(KIND[kind])}</figcaption>
    </figure>
  )
}
function FounderCard() {
  const { t } = useLang()
  return (
    <figure className="relative w-[86vw] shrink-0 sm:w-[64vw] lg:w-[46vw] lg:max-w-[720px]">
      <div className="overflow-hidden rounded-[22px]">
        <img src={img(104)} alt={t({ en: 'Yehiel Tsubery on site above Lake Como', it: 'Yehiel Tsubery in cantiere sopra il Lago di Como' })} loading="lazy" decoding="async" className="aspect-[4/3] w-full object-cover grayscale" />
      </div>
      <figcaption className="mt-4 flex items-baseline justify-between gap-4">
        <span className={`${T.serif} text-[28px] italic text-[#ece7df]`}>{t({ en: 'Yehiel Tsubery on site', it: 'Yehiel Tsubery in cantiere' })}</span>
        <span className="text-[11px] font-semibold uppercase tracking-[.18em] text-white/45">Perledo</span>
      </figcaption>
    </figure>
  )
}
function Build() {
  const { t } = useLang()
  const ref = useRef(), trackRef = useRef()
  const mobile = useIsMobile(), reduce = useReducedMotion()
  const [dist, setDist] = useState(0)
  const distMV = useMotionValue(0)
  useEffect(() => {
    const f = () => { if (!trackRef.current) return; const d = Math.max(0, trackRef.current.scrollWidth - innerWidth); setDist(d); distMV.set(d) }
    f(); addEventListener('resize', f); const id = setTimeout(f, 800)
    return () => { removeEventListener('resize', f); clearTimeout(id) }
  }, [mobile])
  const pinned = !mobile && !reduce
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const x = useTransform([p, distMV], ([v, d]) => -v * d)
  const fill = useTransform(p, [0, 1], ['0%', '100%'])
  const phases = t(COMO.phases)
  const head = (
    <div className="flex w-[86vw] shrink-0 flex-col justify-between pr-6 sm:w-[60vw] lg:w-[34vw] lg:max-w-[520px]">
      <div>
        <Eyebrow className="text-[#c3a15e]">{t({ en: 'Build progress', it: 'Avanzamento lavori' })}</Eyebrow>
        <h3 className={`${T.serif} mt-6 text-[clamp(48px,5.6vw,92px)] leading-[.9] text-[#ece7df]`}>
          <Mask>{t({ en: 'Seven steps,', it: 'Sette passi,' })}</Mask>
          <Mask delay={.07}><em className="text-[#c3a15e]">{t({ en: 'one hillside.', it: 'una collina.' })}</em></Mask>
        </h3>
      </div>
      <p className="mt-8 max-w-[400px] text-[15.5px] leading-[1.6] text-[#ece7df]/70">{t(COMO.phasesNote)}</p>
    </div>
  )
  const items = []
  phases.forEach((n, i) => { items.push(<PhaseCard key={i} i={i} name={n} id={PH_IMG[i][0]} kind={PH_IMG[i][1]} />); if (i === 2) items.push(<FounderCard key="f" />) })
  return (
    <div ref={ref} className="relative bg-[#27414f]" style={pinned ? { height: `calc(100vh + ${dist}px)` } : undefined}>
      <div className={pinned ? 'sticky top-0 flex h-screen flex-col justify-center overflow-hidden' : 'overflow-hidden py-24'}>
        {pinned && (
          <div className="absolute inset-x-10 top-24 flex items-center gap-4">
            <div className="relative h-px flex-1 bg-white/15"><motion.div className="absolute inset-y-0 left-0 bg-[#c3a15e]" style={{ width: fill }} /></div>
            <div className="flex gap-6 text-[10.5px] font-semibold uppercase tracking-[.18em] text-white/50">
              {phases.map((n, i) => <PhaseTick key={i} p={p} i={i} n={n} />)}
            </div>
          </div>
        )}
        <motion.div ref={trackRef} style={pinned ? { x } : undefined}
          className={`flex items-start gap-8 px-5 md:gap-12 md:px-10 ${pinned ? 'w-max pt-16' : 'snap-x snap-mandatory overflow-x-auto pb-6 [scrollbar-width:none] [&>*]:snap-start'}`}>
          {head}{items}
          <div className="w-[10vw] shrink-0" />
        </motion.div>
      </div>
    </div>
  )
}
function PhaseTick({ p, i, n }) {
  const o = useTransform(p, v => (v * 7.2 >= i + .2 ? 1 : .4))
  const c = useTransform(o, v => (v === 1 ? '#c3a15e' : 'rgba(255,255,255,.5)'))
  return <motion.span className="hidden xl:inline" style={{ color: c }}>{n}</motion.span>
}

/* ───────────── business model + sports + map ───────────── */
function Model() {
  const { t } = useLang()
  const sports = t(COMO.sport).split(', ')
  return (
    <div className="relative bg-[#27414f] text-[#ece7df]">
      <div className="mx-auto grid max-w-[1440px] grid-cols-12 gap-x-5 gap-y-16 px-5 py-24 md:px-10 md:py-36">
        <div className="col-span-12 lg:col-span-7">
          <Eyebrow className="text-[#c3a15e]">{t({ en: 'The idea', it: 'L’idea' })}</Eyebrow>
          <p className={`${T.serif} mt-8 text-[clamp(32px,3.9vw,60px)] leading-[1.04]`}>
            <span className="text-[#c3a15e]">“</span>{t(COMO.model)}<span className="text-[#c3a15e]">”</span>
          </p>
          <div className="mt-12 overflow-hidden rounded-[22px] border border-white/10">
            <div className="flex items-center justify-between bg-white/5 px-5 py-3 text-[11px] font-semibold uppercase tracking-[.2em] text-white/60">
              <span>Perledo · Lago di Como</span><span>45.99° N · 9.29° E</span>
            </div>
            <iframe title={t({ en: 'Map — Perledo, Lake Como', it: 'Mappa — Perledo, Lago di Como' })} loading="lazy" referrerPolicy="no-referrer-when-downgrade"
              src="https://maps.google.com/maps?q=Perledo%2C%20Lake%20Como%2C%20Italy&z=13&output=embed"
              className="block h-[300px] w-full border-0 md:h-[360px]" style={{ filter: 'grayscale(.5) sepia(.15) contrast(.95)' }} />
          </div>
        </div>
        <div className="col-span-12 lg:col-span-4 lg:col-start-9">
          <Eyebrow className="text-[#c3a15e]">{t({ en: 'Around the lake', it: 'Intorno al lago' })}</Eyebrow>
          <ul className="mt-8">
            {sports.map((s, i) => (
              <motion.li key={s} initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-10% 0px' }} transition={{ duration: .9, ease: EASE, delay: i * .06 }}
                className="group flex items-baseline justify-between border-b border-white/12 py-3">
                <span className={`${T.serif} text-[clamp(30px,3vw,44px)] leading-none transition-transform duration-500 group-hover:translate-x-2 group-hover:italic`}>{s.charAt(0).toUpperCase() + s.slice(1)}</span>
                <span className="text-[11px] tabular-nums text-white/35">{String(i + 1).padStart(2, '0')}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

/* ───────────── 5. LAKE VIEWS — cinemascope strip ───────────── */
const VIEWS = [[129, 2.57], [131, 2.14], [141, 3.96], [142, 4.24]]
function ViewFrame({ id, ar, i, p }) {
  const { t } = useLang()
  const x = useTransform(p, [0, 1], i % 2 ? ['-7%', '3%'] : ['3%', '-7%'])
  const w = ['md:w-[78%]', 'md:w-[64%] md:ml-auto', 'md:w-[92%] md:ml-[4%]', 'md:w-[84%] md:ml-auto'][i]
  return (
    <motion.figure initial={{ clipPath: 'inset(0 0 100% 0)' }} whileInView={{ clipPath: 'inset(0 0 0% 0)' }} viewport={{ once: true, margin: '-12% 0px' }} transition={{ duration: 1.4, ease: EASE }}
      className={`relative w-full ${w}`}>
      <div className="relative overflow-hidden rounded-[6px]" style={{ aspectRatio: String(Math.min(ar, 3.2)) }}>
        <motion.img style={{ x, scale: 1.16 }} src={img(id)} srcSet={`${img(id, true)} 720w, ${img(id)} 1800w`} sizes="(max-width:768px) 100vw, 90vw" alt={t({ en: 'Lake Como seen from the hillside', it: 'Il Lago di Como visto dalla collina' })} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
      </div>
      <figcaption className="mt-3 flex justify-between text-[11px] font-medium uppercase tracking-[.18em] text-white/45">
        <span>{t({ en: 'Lake Como', it: 'Lago di Como' })}</span><span className="tabular-nums">{String(i + 1).padStart(2, '0')} / 04</span>
      </figcaption>
    </motion.figure>
  )
}
function Views() {
  const { t } = useLang()
  const ref = useRef()
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const big = useTransform(p, [0, 1], ['10%', '-30%'])
  return (
    <div ref={ref} className="relative overflow-hidden bg-[#1d323d] py-24 text-[#ece7df] md:py-36">
      <motion.div aria-hidden style={{ x: big }} className={`${T.serif} pointer-events-none absolute left-0 top-10 whitespace-nowrap text-[26vw] italic leading-none text-white/[.04]`}>Lago di Como · Lario</motion.div>
      <div className="relative mx-auto max-w-[1440px] px-5 md:px-10">
        <div className="mb-16 grid grid-cols-12 gap-5">
          <div className="col-span-12 md:col-span-6">
            <Eyebrow className="text-[#c3a15e]">{t({ en: 'The view', it: 'La vista' })}</Eyebrow>
            <h3 className={`${T.serif} mt-6 text-[clamp(44px,5.4vw,86px)] leading-[.92]`}>
              <Mask>{t({ en: 'Wide as', it: 'Ampia come' })}</Mask>
              <Mask delay={.07}><em className="text-[#c3a15e]">{t({ en: 'a cinema screen.', it: 'uno schermo di cinema.' })}</em></Mask>
            </h3>
          </div>
        </div>
        <div className="flex flex-col gap-14 md:gap-24">
          {VIEWS.map(([id, ar], i) => <ViewFrame key={id} id={id} ar={ar} i={i} p={p} />)}
        </div>
        <Sardegna />
      </div>
    </div>
  )
}

function Sardegna() {
  const { t } = useLang()
  return (
    <motion.a href="#contact" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1, ease: EASE }}
      className="group relative mt-24 grid grid-cols-12 items-center gap-5 overflow-hidden rounded-[26px] bg-[#ece7df] p-6 text-[#151412] md:mt-36 md:p-10">
      <svg aria-hidden viewBox="0 0 600 120" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-24 w-full opacity-60">
        {[0, 1, 2].map(k => (
          <motion.path key={k} d={`M0 ${60 + k * 18} Q 75 ${44 + k * 18} 150 ${60 + k * 18} T 300 ${60 + k * 18} T 450 ${60 + k * 18} T 600 ${60 + k * 18}`} fill="none" stroke={LAKE} strokeOpacity={.5 - k * .12} strokeWidth="1"
            animate={{ x: [0, -150] }} transition={{ duration: 7 + k * 3, repeat: Infinity, ease: 'linear' }} />
        ))}
      </svg>
      <div className="relative col-span-12 md:col-span-3">
        <div className="text-[11px] font-semibold uppercase tracking-[.22em] text-[#151412]/55">{t({ en: 'Next on the coast', it: 'Prossimamente sulla costa' })}</div>
      </div>
      <div className="relative col-span-12 md:col-span-6">
        <div className={`${T.serif} text-[clamp(40px,4.6vw,72px)] leading-[.95]`}>{SARDEGNA.name}</div>
        <div className="mt-2 text-[13px] font-medium uppercase tracking-[.16em] text-[#151412]/60">{SARDEGNA.place}</div>
      </div>
      <div className="relative col-span-12 flex md:col-span-3 md:justify-end">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#151412]/20 px-4 py-2 text-[12px] font-semibold uppercase tracking-[.14em]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#b06a35]" />{t(SARDEGNA.note)}
        </span>
      </div>
    </motion.a>
  )
}

export default function Como() {
  return (
    <section id="como" className={`relative bg-[#27414f] text-[#ece7df] ${T.sans}`}>
      <Film />
      <Units />
      <Facts />
      <Build />
      <Model />
      <Views />
    </section>
  )
}
