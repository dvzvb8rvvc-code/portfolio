import React, { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue, useMotionValueEvent, useReducedMotion, animate, useInView } from 'framer-motion'
import { useLite, useIsMobile } from '../../lib/kit'
import { useLang } from './i18n'
import { T, PALAZZO, img } from './data'

const Exploded = lazy(() => import('./palazzo3d'))
const Vault = lazy(() => import('./palazzo3d').then(m => ({ default: m.Vault })))

const E = [0.16, 1, 0.3, 1]
const FRESCO = '#1c2f4d'
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const smooth = (a, b, v) => { const x = clamp((v - a) / (b - a)); return x * x * (3 - 2 * x) }
const LEVEL = ['−1', '0', '1', '2']
const FLOOR_M2 = PALAZZO.floors.map(f => f.units.reduce((a, u) => a + u.m2, 0))
const UNITS = PALAZZO.floors.flatMap((f, fi) => f.units.map(u => ({ ...u, fi, floor: f })))
const UNIT_IMG = { 1: 143, 2: 157, 3: 148, 4: 156, 5: 152, 6: 147 }
// schematic x-ranges per unit (mirrors palazzo3d PLAN, duplicated so the 2D path never loads three.js)
const ISO_PLAN = [
  [{ a: 0, b: 0.44 }, { a: 0.44, b: 0.56, core: 1 }, { a: 0.56, b: 1 }],
  [{ a: 0, b: 0.4, u: 1 }, { a: 0.4, b: 0.6, core: 1 }, { a: 0.6, b: 1, u: 2 }],
  [{ a: 0, b: 0.33, u: 3 }, { a: 0.33, b: 0.45, core: 1 }, { a: 0.45, b: 0.7, u: 4 }, { a: 0.7, b: 1, u: 5 }],
  [{ a: 0, b: 0.82, u: 6 }, { a: 0.82, b: 1, core: 1 }],
]
const ISO_H = [0.62, 1.0, 1.22, 0.72].map(h => h * 0.55)

function useNear(ref, margin = '100% 0px') {
  const [near, setNear] = useState(false), [vis, setVis] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const a = new IntersectionObserver(([e]) => { if (e.isIntersecting) setNear(true) }, { rootMargin: margin })
    const b = new IntersectionObserver(([e]) => setVis(e.isIntersecting), { rootMargin: '10% 0px' })
    a.observe(el); b.observe(el)
    return () => { a.disconnect(); b.disconnect() }
  }, [])
  return [near, vis]
}

function Mask({ children, delay = 0, className = '' }) {
  return (
    <span className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
      <motion.span className={'block ' + className} initial={{ y: '108%' }} whileInView={{ y: '0%' }} viewport={{ once: true, margin: '-10% 0px' }} transition={{ duration: 1.2, ease: E, delay }}>{children}</motion.span>
    </span>
  )
}
function Kicker({ children, className = '' }) {
  return <div className={`text-[11px] font-semibold uppercase tracking-[.24em] ${className}`}>{children}</div>
}

/* ---------------- 1. Opening ---------------- */
function Opening() {
  const { t } = useLang()
  const ref = useRef()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['-12%', '12%'])
  const sc = useTransform(scrollYProgress, [0, 1], [1.18, 1.04])
  const x1 = useTransform(scrollYProgress, [0, 1], ['6%', '-8%'])
  const x2 = useTransform(scrollYProgress, [0, 1], ['-4%', '10%'])
  return (
    <div ref={ref} className="relative min-h-[100svh] overflow-hidden bg-[#151412] text-[#ece7df]">
      <motion.div className="absolute inset-0" style={{ y, scale: sc }}>
        <img src={img(145)} srcSet={`${img(145, 1)} 720w, ${img(145)} 1800w`} sizes="100vw" alt={t({ en: 'Rooftops of Volterra', it: 'I tetti di Volterra' })} className="h-full w-full object-cover" loading="lazy" decoding="async" width="1920" height="1716" />
      </motion.div>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#151412_0%,rgba(21,20,18,.35)_30%,rgba(21,20,18,.25)_55%,#151412_100%)]" />
      <div className="relative mx-auto flex min-h-[100svh] max-w-[1440px] flex-col justify-between px-5 pb-12 pt-28 md:px-10 md:pb-16">
        <div className="flex items-start justify-between gap-6">
          <Kicker className="text-[#ece7df]/70">{t({ en: 'Residences · Tuscany', it: 'Residenze · Toscana' })}</Kicker>
          <Kicker className="text-right text-[#ece7df]/70">{PALAZZO.place}</Kicker>
        </div>
        <h2 className={`${T.serif} pointer-events-none select-none leading-[.82] tracking-[-.02em]`}>
          <motion.span className="block text-[23vw] md:text-[15.5vw]" style={{ x: x1 }}><Mask>Palazzo</Mask></motion.span>
          <motion.span className="block pl-[8vw] text-[23vw] italic text-[#e9c48f] md:text-[15.5vw]" style={{ x: x2 }}><Mask delay={0.12}>Campani</Mask></motion.span>
        </h2>
        <div className="grid gap-8 md:grid-cols-12">
          <p className={`${T.serif} text-[24px] leading-[1.15] md:col-span-6 md:text-[34px]`}>{t(PALAZZO.lead)}</p>
          <div className="flex flex-col justify-end gap-3 text-[13px] leading-relaxed text-[#ece7df]/70 md:col-span-4 md:col-start-9">
            <span className="h-px w-16 bg-[#e9c48f]" />
            {t(PALAZZO.credit)}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------------- 2D isometric stack (lite fallback + picker) ---------------- */
const S = 36, ISO_GAP = 2.0
const W2 = 4.2, D2 = 2.6
const iso = (x, y, z) => [(x - z) * 0.866 * S, (x + z) * 0.5 * S - y * S]
const poly = pts => pts.map(p => iso(...p).map(n => n.toFixed(1)).join(',')).join(' ')
const ISO_BASE = (() => { let y = 0; return ISO_H.map(h => { const b = y; y += h; return b }) })()

function IsoFloor({ i, e, activeFloor, activeUnit, onPick, dark }) {
  const y = useTransform(e, v => -i * ISO_GAP * S * v)
  const h = ISO_H[i], b = ISO_BASE[i]
  const sel = activeFloor === i, dim = activeFloor != null && !sel
  const front = sel ? '#c98a52' : dim ? '#d4cabb' : dark ? '#b79a74' : '#d9c6a8'
  const right = sel ? '#9c5c2c' : dim ? '#bdb2a2' : dark ? '#8b7458' : '#bfa684'
  const top = dim ? '#e9e3d8' : '#f1e9da'
  return (
    <motion.g style={{ y }} animate={{ x: sel ? 18 : 0 }} transition={{ duration: 0.7, ease: E }}>
      <polygon points={poly([[0, b, D2], [W2, b, D2], [W2, b + h, D2], [0, b + h, D2]])} fill={front} stroke="#151412" strokeWidth=".8" />
      <polygon points={poly([[W2, b, D2], [W2, b, 0], [W2, b + h, 0], [W2, b + h, D2]])} fill={right} stroke="#151412" strokeWidth=".8" />
      {Array.from({ length: 7 }, (_, k) => (
        <polygon key={k} points={poly([[(k + 0.36) / 7 * W2, b + h * 0.28, D2], [(k + 0.64) / 7 * W2, b + h * 0.28, D2], [(k + 0.64) / 7 * W2, b + h * 0.72, D2], [(k + 0.36) / 7 * W2, b + h * 0.72, D2]])} fill="#2a2420" opacity={dim ? 0.25 : 0.75} />
      ))}
      {Array.from({ length: 4 }, (_, k) => (
        <polygon key={k} points={poly([[W2, b + h * 0.28, (k + 0.36) / 4 * D2], [W2, b + h * 0.28, (k + 0.64) / 4 * D2], [W2, b + h * 0.72, (k + 0.64) / 4 * D2], [W2, b + h * 0.72, (k + 0.36) / 4 * D2]])} fill="#2a2420" opacity={dim ? 0.2 : 0.6} />
      ))}
      <polygon points={poly([[0, b + h, 0], [W2, b + h, 0], [W2, b + h, D2], [0, b + h, D2]])} fill={top} stroke="#151412" strokeWidth="1.4" />
      {ISO_PLAN[i].map((r, k) => {
        const on = r.u && r.u === activeUnit
        const pts = poly([[r.a * W2, b + h, 0], [r.b * W2, b + h, 0], [r.b * W2, b + h, D2], [r.a * W2, b + h, D2]])
        const [cx, cy] = iso(((r.a + r.b) / 2) * W2, b + h, D2 / 2)
        return (
          <g key={k} onClick={r.u && onPick ? () => onPick(r.u) : undefined} style={{ cursor: r.u && onPick ? 'pointer' : 'default' }}>
            <polygon points={pts} fill={on ? '#b06a35' : r.core ? 'url(#yts-hatch)' : r.u ? (dim ? 'rgba(195,161,94,.12)' : 'rgba(195,161,94,.3)') : 'rgba(39,65,79,.12)'} stroke="#151412" strokeWidth=".9" className="transition-[fill] duration-300" />
            {r.u && <text x={cx} y={cy + 4} textAnchor="middle" fontSize="11" fontWeight="800" fill={on ? '#fff' : dim ? 'rgba(21,20,18,.45)' : '#151412'} fontFamily="Inter Tight, sans-serif" style={{ pointerEvents: 'none' }}>AP.{r.u}</text>}
          </g>
        )
      })}
    </motion.g>
  )
}
function IsoRoof({ e, activeFloor, dark }) {
  const y = useTransform(e, v => -(3 * ISO_GAP + 2.8) * S * v)
  const b = ISO_BASE[3] + ISO_H[3], rh = 0.7, dim = activeFloor != null
  return (
    <motion.g style={{ y }}>
      <polygon points={poly([[0, b, D2], [W2, b, D2], [W2 - D2 / 2, b + rh, D2 / 2], [D2 / 2, b + rh, D2 / 2]])} fill={dim ? '#d2bcaa' : dark ? '#a4532d' : '#b4613a'} stroke="#151412" strokeWidth=".8" />
      <polygon points={poly([[W2, b, D2], [W2, b, 0], [W2 - D2 / 2, b + rh, D2 / 2]])} fill={dim ? '#b9a290' : dark ? '#7e3c1f' : '#8f4a2a'} stroke="#151412" strokeWidth=".8" />
    </motion.g>
  )
}
function IsoStack({ e, activeFloor = null, activeUnit = null, onPick, dark, className = '' }) {
  const top = -(ISO_BASE[3] + ISO_H[3] + 0.7 + 3 * ISO_GAP + 2.8) * S - 10
  return (
    <svg viewBox={`${-D2 * 0.866 * S - 10} ${top} ${(W2 + D2) * 0.866 * S + 20} ${(W2 + D2) * 0.5 * S - top + 10}`} className={className} role="img" aria-label="Palazzo Campani — exploded floors">
      <defs><pattern id="yts-hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="5" height="5" fill="#efe7d8" /><line x1="0" y1="0" x2="0" y2="5" stroke="#151412" strokeWidth="1" opacity=".45" /></pattern></defs>
      {[0, 1, 2, 3].map(i => <IsoFloor key={i} i={i} e={e} activeFloor={activeFloor} activeUnit={activeUnit} onPick={onPick} dark={dark} />)}
      <IsoRoof e={e} activeFloor={activeFloor} dark={dark} />
    </svg>
  )
}

/* ---------------- 2. Exploded film ---------------- */
function FloorLabel({ i, f, hud, flow }) {
  const { t } = useLang()
  return (
    <div ref={el => { hud.current.labels[i] = el }} className={`${flow ? 'relative' : 'absolute left-0 top-0 will-change-transform'} w-[44vw] max-w-[330px] opacity-0 md:w-[30vw]`}>
      <div className="flex items-baseline gap-3">
        <span className="text-[9px] font-semibold uppercase tracking-[.2em] text-white/60 md:text-[10px] md:tracking-[.22em]">{t({ en: 'Level', it: 'Livello' })} {LEVEL[i]}</span>
        <span className="h-px flex-1 bg-white/25" />
      </div>
      <div className="mt-1 flex items-baseline justify-between gap-3">
        <span className={`${T.serif} text-[19px] leading-none md:text-[34px]`}>{t(f.t)}</span>
        {FLOOR_M2[i] > 0 && <span className="whitespace-nowrap text-[13px] font-semibold tabular-nums md:text-[20px]"><span ref={el => { hud.current.nums[`f${i}`] = el }}>0</span> m²</span>}
      </div>
      <div className="mt-1.5 hidden text-[12.5px] leading-snug text-white/70 md:block">
        {f.units.length ? f.units.map((u, k) => (
          <span key={u.n} className="mr-3 inline-block whitespace-nowrap tabular-nums">Ap.{u.n} <b className="font-semibold text-white"><span ref={el => { hud.current.nums[`u${u.n}`] = el }}>0</span> m²</b></span>
        )) : t(f.d)}
      </div>
      <div className="mt-0.5 text-[10.5px] leading-snug text-white/65 md:hidden">{f.units.length ? f.units.map(u => 'Ap.' + u.n).join(' · ') : t(f.d)}</div>
    </div>
  )
}

function Film({ pickerRef }) {
  const { t, lang } = useLang()
  const reduce = useReducedMotion()
  const lite = useLite()
  const mob = useIsMobile()
  const ref = useRef()
  const [near, vis] = useNear(ref)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const still = useMotionValue(1)
  const progress = reduce ? still : scrollYProgress
  const bg = useTransform(progress, [0, 0.16, 0.4, 0.6, 0.7, 0.9], [T.ink, T.ink, '#a5612f', '#9a5a2c', '#16171b', FRESCO])
  const word = useTransform(progress, [0, 1], ['8%', '-38%'])
  const bar = useTransform(progress, [0, 1], [0, 1])
  const c0 = useTransform(progress, [0, 0.16, 0.24], [1, 1, 0])
  const c1 = useTransform(progress, [0.2, 0.3, 0.52, 0.6], [0, 1, 1, 0])
  const c2 = useTransform(progress, [0.56, 0.66], [0, 1])
  const c0y = useTransform(progress, [0, 0.24], [0, -40])
  const c1y = useTransform(progress, [0.2, 0.3, 0.52, 0.6], [40, 0, 0, -40])
  const c2y = useTransform(progress, [0.56, 0.66], [40, 0])
  const isoE = useTransform(progress, v => smooth(0.14, 0.56, v))

  const hud = useRef({ labels: [], lines: [], nums: {}, total: null, last: {} })
  hud.current.update = (e, pRaw) => {
    const H = hud.current, p = pRaw ?? progress.get()
    PALAZZO.floors.forEach((f, i) => {
      const L = H.labels[i]; if (L) L.style.opacity = clamp((e - 0.5 - (3 - i) * 0.08) / 0.16)
      const k = smooth(0.36 + (3 - i) * 0.04, 0.72 + (3 - i) * 0.03, p)
      const set = (key, v) => { const el = H.nums[key]; if (el && H.last[key] !== v) { el.textContent = v; H.last[key] = v } }
      set('f' + i, Math.round(FLOOR_M2[i] * k))
      f.units.forEach(u => set('u' + u.n, Math.round(u.m2 * k)))
    })
    const tv = Math.round(PALAZZO.total * smooth(0.56, 0.8, p))
    if (H.total && H.last.total !== tv) { H.total.textContent = tv; H.last.total = tv }
  }
  const use3d = !lite
  useMotionValueEvent(progress, 'change', v => { if (!use3d) hud.current.update(smooth(0.14, 0.56, v), v) })
  useEffect(() => { if (!use3d || reduce) hud.current.update(smooth(0.14, 0.56, progress.get()), progress.get()) }, [use3d, reduce, lang])

  const skip = () => { const el = pickerRef.current; if (!el) return; window.__lenis ? window.__lenis.scrollTo(el, { offset: -64 }) : el.scrollIntoView({ behavior: 'smooth' }) }

  return (
    <div ref={ref} className="relative" style={{ height: reduce ? '100svh' : '420vh' }}>
      <motion.div className="sticky top-0 h-[100svh] overflow-hidden text-[#ece7df]" style={{ backgroundColor: bg }}>
        {/* giant outlined word behind the object */}
        <motion.div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 flex items-center whitespace-nowrap font-['Inter_Tight',sans-serif] text-[34vw] font-black uppercase leading-none tracking-[-.04em] text-transparent md:text-[24vw]" style={{ x: word, WebkitTextStroke: '1.5px rgba(236,231,223,.22)' }}>
          Campani
        </motion.div>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_40%_55%,rgba(255,220,170,.12),transparent_60%)]" />

        {use3d ? (
          <>
            <div className="absolute inset-0">{near && <Suspense fallback={null}><Exploded progress={progress} hud={hud} lang={lang} active={vis} lite={mob} /></Suspense>}</div>
            <div className="pointer-events-none absolute inset-0">
              {PALAZZO.floors.map((f, i) => (
                <React.Fragment key={f.id}>
                  <div ref={el => { hud.current.lines[i] = el }} className="absolute left-0 top-0 h-px origin-left bg-[#ece7df]/70 will-change-transform" style={{ transform: 'scaleX(0)' }}>
                    <span className="absolute -left-[3px] -top-[3px] h-[7px] w-[7px] rounded-full border border-[#ece7df] bg-[#ece7df]/30" />
                  </div>
                  <FloorLabel i={i} f={f} hud={hud} />
                </React.Fragment>
              ))}
            </div>
          </>
        ) : (
          <div className="absolute inset-0 mx-auto grid max-w-[1440px] grid-rows-[1fr_auto] items-center gap-4 px-5 pb-24 pt-44 md:grid-cols-12 md:grid-rows-1 md:px-10 md:pt-24">
            <IsoStack e={isoE} dark className="mx-auto h-full max-h-[62vh] w-full md:col-span-6 md:col-start-2" />
            <div className="grid grid-cols-2 gap-x-4 gap-y-4 md:col-span-4 md:col-start-9 md:grid-cols-1 md:gap-7">
              {[3, 2, 1, 0].map(i => <FloorLabel key={i} i={i} f={PALAZZO.floors[i]} hud={hud} flow />)}
            </div>
          </div>
        )}

        {/* chapters */}
        <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto max-w-[1440px] px-5 pt-20 md:px-10 md:pt-28">
          <div className="relative md:w-[38%]">
            <motion.div style={{ opacity: c0, y: c0y }} className="absolute inset-x-0 top-0">
              <Kicker className="text-white/60">{t({ en: 'Exploded section · 01', it: 'Spaccato assonometrico · 01' })}</Kicker>
              <h3 className={`${T.serif} mt-3 text-[40px] leading-[.95] md:text-[64px]`}>{t({ en: 'Four floors,', it: 'Quattro piani,' })}<br /><i className="text-[#e9c48f]">{t({ en: 'one palazzo.', it: 'un palazzo.' })}</i></h3>
              <p className="mt-4 hidden max-w-[34ch] text-[14px] leading-relaxed text-white/70 md:block">{t({ en: 'Keep scrolling — the building opens floor by floor, from the cellars to the attic loft.', it: 'Continua a scorrere — l’edificio si apre piano per piano, dalle cantine al loft mansardato.' })}</p>
            </motion.div>
            <motion.div style={{ opacity: c1, y: c1y }} className="absolute inset-x-0 top-0">
              <Kicker className="text-white/60">{t({ en: 'Cut open · 02', it: 'In sezione · 02' })}</Kicker>
              <h3 className={`${T.serif} mt-3 text-[40px] leading-[.95] md:text-[64px]`}>{t({ en: 'From the cellars', it: 'Dalle cantine' })}<br /><i className="text-[#f3d6a8]">{t({ en: 'to the attic loft.', it: 'al loft mansardato.' })}</i></h3>
            </motion.div>
            <motion.div style={{ opacity: c2, y: c2y }} className="absolute inset-x-0 top-0">
              <Kicker className="text-white/60">{t({ en: 'Six residences · 03', it: 'Sei residenze · 03' })}</Kicker>
              <div className="mt-2 flex items-baseline gap-2 font-['Inter_Tight',sans-serif] font-black leading-[.85] tracking-[-.04em] tabular-nums">
                <span ref={el => { hud.current.total = el }} className="text-[72px] md:text-[132px]">0</span>
                <span className="text-[28px] md:text-[48px]">m²</span>
              </div>
              <p className="mt-2 max-w-[30ch] text-[13px] leading-relaxed text-white/70 md:text-[14px]">{t({ en: 'Total area of the six residences, across three floors above the cellars and spa.', it: 'Superficie totale delle sei residenze, su tre piani sopra cantine e spa.' })}</p>
            </motion.div>
          </div>
        </div>

        {/* footer: skip + progress */}
        <div className="absolute inset-x-0 bottom-0 mx-auto flex max-w-[1440px] items-center gap-5 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] md:px-10 md:pb-8">
          {!reduce && <button onClick={skip} className="pointer-events-auto rounded-full border border-white/30 px-4 py-2 text-[12px] font-semibold uppercase tracking-[.16em] text-white/85 backdrop-blur transition-colors hover:bg-white hover:text-[#151412]">{t('skip')} ↓</button>}
          <div className="relative h-px flex-1 bg-white/20"><motion.div className="absolute inset-0 origin-left bg-white" style={{ scaleX: bar }} /></div>
          <span className="hidden text-[11px] uppercase tracking-[.2em] text-white/55 md:block">{t({ en: 'Schematic layout · not to scale', it: 'Schema indicativo · non in scala' })}</span>
        </div>
      </motion.div>
    </div>
  )
}

/* ---------------- 3. Residence picker ---------------- */
function Picker({ innerRef }) {
  const { t } = useLang()
  const [sel, setSel] = useState(1)
  const u = UNITS.find(x => x.n === sel)
  const e = useMotionValue(0)
  const inView = useInView(innerRef, { once: true, margin: '-20% 0px' })
  useEffect(() => { if (inView) animate(e, 1, { duration: 1.6, ease: E }) }, [inView])
  return (
    <div ref={innerRef} className="relative bg-[#e2dcd2] py-24 text-[#151412] md:py-36">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <div className="grid gap-6 md:grid-cols-12">
          <div className="md:col-span-7">
            <Kicker className="text-[#b06a35]">{t({ en: 'Choose a residence', it: 'Scegli una residenza' })}</Kicker>
            <h3 className={`${T.serif} mt-4 text-[48px] leading-[.92] tracking-[-.01em] md:text-[96px]`}>
              <Mask>{t({ en: 'Six residences,', it: 'Sei residenze,' })}</Mask>
              <Mask delay={0.1} className="italic text-[#b06a35]">{t({ en: 'one address.', it: 'un solo indirizzo.' })}</Mask>
            </h3>
          </div>
          <p className="self-end text-[15px] leading-relaxed text-[#151412]/70 md:col-span-4 md:col-start-9">{t({ en: 'Tap a residence — or a unit on the plan — to see where it sits inside the palazzo.', it: 'Tocca una residenza — o un’unità sulla pianta — per vedere dove si trova nel palazzo.' })}</p>
        </div>

        <div className="mt-14 grid gap-10 md:mt-20 md:grid-cols-12 md:gap-8">
          {/* list */}
          <div className="md:col-span-4" role="tablist" aria-label={t({ en: 'Residences', it: 'Residenze' })}>
            <div className="grid grid-cols-3 gap-2 md:grid-cols-1 md:gap-0">
              {UNITS.map(x => {
                const on = x.n === sel
                return (
                  <button key={x.n} role="tab" aria-selected={on} onClick={() => setSel(x.n)} className={`group relative flex flex-col items-start rounded-2xl border px-3 py-3 text-left transition-colors md:flex-row md:items-baseline md:gap-5 md:rounded-none md:border-0 md:border-t md:px-0 md:py-4 ${on ? 'border-[#151412] bg-[#151412] text-[#ece7df] md:bg-transparent md:text-[#151412]' : 'border-black/10 md:border-black/15'}`}>
                    {on && <motion.span layoutId="yts-unit-bar" className="absolute left-0 top-[-1px] hidden h-[2px] w-full bg-[#b06a35] md:block" transition={{ duration: 0.6, ease: E }} />}
                    <span className={`${T.serif} text-[30px] leading-none md:w-[90px] md:text-[48px] ${on ? 'md:text-[#b06a35]' : ''}`}>Ap.{x.n}</span>
                    <span className="mt-1 text-[11px] uppercase tracking-[.14em] opacity-70 md:mt-0 md:flex-1 md:text-[12px]">{t(x.floor.t)}</span>
                    <span className="mt-0.5 text-[15px] font-semibold tabular-nums md:mt-0 md:text-[18px]">{x.m2} m²</span>
                  </button>
                )
              })}
            </div>
          </div>
          {/* iso */}
          <div className="relative md:col-span-5">
            <IsoStack e={e} activeFloor={u.fi} activeUnit={sel} onPick={setSel} className="mx-auto max-h-[78vh] w-full max-w-[460px]" />
            <div className="absolute left-0 top-0 text-[11px] uppercase tracking-[.2em] text-[#151412]/50">{t({ en: 'Schematic · not to scale', it: 'Schema · non in scala' })}</div>
          </div>
          {/* photo + facts */}
          <div className="md:col-span-3">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[4px] bg-[#151412] md:aspect-[4/5]">
              <AnimatePresence initial={false}>
                <motion.img key={sel} src={img(UNIT_IMG[sel], 1)} alt={t({ en: 'Interior of Palazzo Campani', it: 'Interno di Palazzo Campani' })} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover"
                  initial={{ clipPath: 'inset(100% 0 0 0)', scale: 1.15 }} animate={{ clipPath: 'inset(0% 0 0 0)', scale: 1 }} exit={{ opacity: 0.6 }} transition={{ duration: 1, ease: E }} />
              </AnimatePresence>
            </div>
            <div className="mt-2 text-[11px] text-[#151412]/50">{t({ en: 'Palazzo interiors — illustrative', it: 'Interni del palazzo — a titolo illustrativo' })}</div>
            <AnimatePresence mode="wait">
              <motion.div key={sel} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.45, ease: E }} className="mt-6">
                <div className="flex items-baseline gap-2 font-black tracking-[-.04em] tabular-nums"><span className="text-[64px] leading-none">{u.m2}</span><span className="text-[22px]">m²</span></div>
                <div className="mt-2 text-[14px] text-[#151412]/75">{t(u.floor.t)} · {t({ en: 'Level', it: 'Livello' })} {LEVEL[u.fi]}{u.r ? ' · ' + t(u.r) : ''}</div>
              </motion.div>
            </AnimatePresence>
            <a href="#contact" className="mt-7 inline-flex h-12 items-center gap-3 rounded-full bg-[#151412] px-6 text-[13px] font-semibold text-[#ece7df] transition-colors hover:bg-[#b06a35]">
              {t({ en: 'Request the technical archive', it: 'Richiedi l’archivio tecnico' })} <span aria-hidden>→</span>
            </a>
            <p className="mt-4 text-[12.5px] leading-relaxed text-[#151412]/60">{t(PALAZZO.archive)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------------- 4. Look up ---------------- */
function LookUp() {
  const { t } = useLang()
  const lite = useLite()
  const reduce = useReducedMotion()
  const ref = useRef()
  const [near, vis] = useNear(ref)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const still = useMotionValue(0.85)
  const progress = reduce ? still : scrollYProgress
  const drag = useRef({ yaw: 0, pitch: 0, x: null })
  const o1 = useTransform(progress, [0, 0.2, 0.4], [1, 1, 0])
  const y1 = useTransform(progress, [0, 0.4], [0, -80])
  const o2 = useTransform(progress, [0.6, 0.8], [0, 1])
  const imgScale = useTransform(progress, [0, 1], [1.35, 1])
  const imgRot = useTransform(progress, [0, 1], [-8, 0])
  const onDown = ev => { drag.current.x = ev.clientX }
  const onMove = ev => { if (drag.current.x == null) return; drag.current.yaw += (ev.clientX - drag.current.x) * 0.004; drag.current.x = ev.clientX }
  const onUp = () => { drag.current.x = null }
  return (
    <div ref={ref} className="relative bg-[#07090f]" style={{ height: reduce ? '100svh' : '280vh' }}>
      <div className="sticky top-0 h-[100svh] touch-pan-y overflow-hidden text-[#ece7df]" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}>
        {lite ? (
          <motion.img src={img(154)} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" style={{ scale: imgScale, rotate: imgRot }} />
        ) : (
          <div className="absolute inset-0 cursor-grab active:cursor-grabbing">{near && <Suspense fallback={null}><Vault progress={progress} drag={drag} active={vis} /></Suspense>}</div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(7,9,15,.7)_100%)]" />
        <motion.div style={{ opacity: o1, y: y1 }} className="pointer-events-none absolute inset-x-0 bottom-[12vh] mx-auto max-w-[1440px] px-5 text-center md:px-10">
          <Kicker className="text-[#e9c48f]">{t({ en: 'Piano nobile · original frescoes', it: 'Piano nobile · affreschi originali' })}</Kicker>
          <div className={`${T.serif} mt-3 text-[22vw] italic leading-[.8] md:text-[13vw]`}>{t({ en: 'Look up.', it: 'Alza lo sguardo.' })}</div>
          <p className="mx-auto mt-5 max-w-[40ch] text-[14px] leading-relaxed text-white/70">{t({ en: 'Scroll slowly. Drag to turn beneath the vault.', it: 'Scorri piano. Trascina per girare sotto la volta.' })}</p>
        </motion.div>
        <motion.div style={{ opacity: o2 }} className="pointer-events-none absolute inset-x-0 bottom-0 mx-auto flex max-w-[1440px] items-end justify-between gap-6 px-5 pb-10 md:px-10">
          <p className={`${T.serif} max-w-[18ch] text-[28px] leading-[1.05] md:text-[44px]`}>{t({ en: 'Original frescoes beneath vaulted ceilings.', it: 'Affreschi originali sotto soffitti a volta.' })}</p>
          <span className="hidden text-[11px] uppercase tracking-[.2em] text-white/55 md:block">Palazzo Campani · Volterra</span>
        </motion.div>
      </div>
    </div>
  )
}

/* ---------------- 5. Amenities + gallery ---------------- */
const AMEN_IMG = [155, 149, 143, 147, 153, 151, 157]
function AmenityRow({ i, label, active, setActive }) {
  return (
    <motion.li onViewportEnter={() => setActive(i)} viewport={{ margin: '-45% 0px -45% 0px' }} onMouseEnter={() => setActive(i)}
      className={`group flex items-center gap-4 border-t border-white/12 py-5 transition-colors duration-500 md:py-7 ${active ? 'text-[#ece7df]' : 'text-[#ece7df]/35'}`}>
      <span className="w-8 text-[11px] font-semibold tabular-nums tracking-[.1em] text-[#e9c48f]">{String(i + 1).padStart(2, '0')}</span>
      <img src={img(AMEN_IMG[i], 1)} alt="" loading="lazy" decoding="async" className="h-14 w-14 rounded-[3px] object-cover md:hidden" />
      <span className={`${T.serif} flex-1 text-[30px] leading-none transition-transform duration-700 md:text-[60px] ${active ? 'md:translate-x-3' : ''}`}>{label}</span>
    </motion.li>
  )
}
function Amenities() {
  const { t, lang } = useLang()
  const [active, setActive] = useState(0)
  const list = PALAZZO.extras[lang] || PALAZZO.extras.en
  return (
    <div className="bg-[#151412] py-24 text-[#ece7df] md:py-36">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-5 md:grid-cols-12 md:px-10">
        <div className="hidden md:col-span-5 md:block">
          <div className="sticky top-24 aspect-[4/5] overflow-hidden rounded-[4px]">
            <AnimatePresence initial={false}>
              <motion.img key={active} src={img(AMEN_IMG[active])} alt={list[active]} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover"
                initial={{ opacity: 0, scale: 1.08 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.1, ease: E }} />
            </AnimatePresence>
          </div>
        </div>
        <div className="md:col-span-6 md:col-start-7">
          <Kicker className="text-[#e9c48f]">{t({ en: 'Life in the palazzo', it: 'Vivere il palazzo' })}</Kicker>
          <h3 className={`${T.serif} mt-4 text-[44px] leading-[.95] md:text-[72px]`}><Mask>{t({ en: 'Shared rooms,', it: 'Spazi comuni,' })}</Mask><Mask delay={0.1} className="italic text-[#e9c48f]">{t({ en: 'private pleasures.', it: 'piaceri privati.' })}</Mask></h3>
          <ul className="mt-12">{list.map((l, i) => <AmenityRow key={i} i={i} label={l} active={active === i} setActive={setActive} />)}</ul>
        </div>
      </div>
    </div>
  )
}

const COLS = [[148, 158, 144], [152, 150, 151], [156, 146, 143]]
function GalleryCol({ ids, speed, progress, className = '' }) {
  const y = useTransform(progress, [0, 1], [speed * 120, -speed * 120])
  return (
    <motion.div style={{ y }} className={`flex flex-col gap-4 md:gap-6 ${className}`}>
      {ids.map(id => (
        <div key={id} className="overflow-hidden rounded-[3px] bg-white/5">
          <motion.img src={img(id, 1)} srcSet={`${img(id, 1)} 720w, ${img(id)} 1800w`} sizes="(max-width:768px) 50vw, 33vw" alt="Palazzo Campani" loading="lazy" decoding="async" className="w-full object-cover"
            initial={{ scale: 1.2, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true, margin: '-5% 0px' }} transition={{ duration: 1.4, ease: E }} />
        </div>
      ))}
    </motion.div>
  )
}
function Gallery() {
  const { t } = useLang()
  const ref = useRef()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const p = useSpring(scrollYProgress, { stiffness: 80, damping: 25 })
  return (
    <div ref={ref} className="overflow-hidden bg-[#151412] pb-24 text-[#ece7df] md:pb-36">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <div className="mb-12 grid gap-6 border-t border-white/12 pt-10 md:grid-cols-12">
          <h3 className={`${T.serif} text-[40px] leading-[.95] md:col-span-6 md:text-[64px]`}>{t({ en: 'Frescoes, vaults', it: 'Affreschi, volte' })} <i className="text-[#e9c48f]">{t({ en: '& alabaster.', it: 'e alabastro.' })}</i></h3>
          <p className="self-end text-[14px] leading-relaxed text-white/60 md:col-span-4 md:col-start-9">{t({ en: 'The rooms of Palazzo Campani, in the heart of Volterra.', it: 'Le sale di Palazzo Campani, nel cuore di Volterra.' })}</p>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
          <GalleryCol ids={COLS[0]} speed={0.3} progress={p} />
          <GalleryCol ids={COLS[1]} speed={-0.25} progress={p} className="mt-16" />
          <GalleryCol ids={COLS[2]} speed={0.45} progress={p} className="hidden md:flex" />
        </div>
        <div className="mt-24 flex flex-col items-start justify-between gap-8 border-t border-white/12 pt-10 md:flex-row md:items-end">
          <p className={`${T.serif} max-w-[24ch] text-[30px] leading-[1.05] md:text-[48px]`}>{t(PALAZZO.archive)}</p>
          <a href="#contact" className="inline-flex h-14 shrink-0 items-center gap-3 rounded-full bg-[#ece7df] px-7 text-[14px] font-semibold text-[#151412] transition-colors hover:bg-[#e9c48f]">{t({ en: 'Request the technical archive', it: 'Richiedi l’archivio tecnico' })} <span aria-hidden>→</span></a>
        </div>
      </div>
    </div>
  )
}

export default function Palazzo() {
  const pickerRef = useRef()
  return (
    <section id="palazzo" className="relative">
      <Opening />
      <Film pickerRef={pickerRef} />
      <Picker innerRef={pickerRef} />
      <LookUp />
      <Amenities />
      <Gallery />
    </section>
  )
}
