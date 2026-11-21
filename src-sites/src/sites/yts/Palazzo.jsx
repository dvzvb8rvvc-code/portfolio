import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue } from 'framer-motion'
import { useLite } from '../../lib/kit'
import { useLang } from './i18n'
import { T, PALAZZO, img } from './data'
import { useStage, stage } from './engine'

/* PALAZZO CAMPANI (v5) — one pinned film + one compact dark DOM block.
   The film lives in scenePalazzo.jsx on the shared canvas: ONE plane, ONE shader holding the current
   and next photo (+ depth). Volterra 145 → rooms 148 → 156 → 157 → 152 → ceiling 154, joined by the
   hero's slow liquid, depth-aware ink-bleed. The scene draws itself inside this film's sticky frame
   (it follows the frame while it scrolls in / out), and publishes its damped progress into
   stage.palazzoMV so every caption here moves in lock-step with the picture. */

// shared timeline (scenePalazzo.jsx imports this) — p ranges of the five transitions
export const PAL = {
  ids: [145, 148, 156, 157, 152, 154],
  tr: [[0.05, 0.21], [0.25, 0.41], [0.45, 0.6], [0.64, 0.79], [0.82, 0.97]],
}

const E = [0.16, 1, 0.3, 1]
const GOLD = '#c3a15e'
const INK = '#efe8dc'
const ILLU = { en: 'Interior photos · illustrative', it: 'Foto degli interni · indicative' }

const CAPS = [
  null, // 145 → the opening title
  { k: { en: 'Grotesques', it: 'Grottesche' }, t: { en: 'Painted vaults, room after room.', it: 'Volte dipinte, stanza dopo stanza.' } },
  { k: { en: 'Arched windows', it: 'Finestre ad arco' }, t: { en: 'Tuscan light through deep stone reveals.', it: 'Luce toscana tra profondi sguinci di pietra.' } },
  { k: { en: 'Salon', it: 'Salotto' }, t: { en: 'Decorated ceilings over quiet salons.', it: 'Soffitti decorati su salotti silenziosi.' } },
  { k: { en: 'Bedroom', it: 'Camera' }, t: { en: 'Sleeping beneath original frescoes.', it: 'Dormire sotto affreschi originali.' } },
  null, // 154 → "Look up."
]

// caption window of image i: fades in as the image settles, out as the next one starts to bleed in
function capWin(i) {
  const a = i > 0 ? PAL.tr[i - 1] : null, b = i < PAL.tr.length ? PAL.tr[i] : null
  const inA = a ? a[0] + (a[1] - a[0]) * 0.5 : -0.02, inB = a ? a[0] + (a[1] - a[0]) * 0.92 : -0.01
  const outA = b ? b[0] + (b[1] - b[0]) * 0.12 : 1.5, outB = b ? b[0] + (b[1] - b[0]) * 0.45 : 1.6
  return [inA, inB, outA, outB]
}

const UNITS = PALAZZO.floors.flatMap((f, fi) => f.units.map(u => ({ ...u, fi, floor: f })))
// schematic section (bottom → top), x-ranges 0..1 per unit — schematic, not to scale
const SECTION = [
  { fi: 0, h: 30, parts: [] },
  { fi: 1, h: 56, parts: [{ a: 0, b: 0.42, u: 1 }, { a: 0.42, b: 0.58, core: 1 }, { a: 0.58, b: 1, u: 2 }] },
  { fi: 2, h: 70, parts: [{ a: 0, b: 0.33, u: 3 }, { a: 0.33, b: 0.45, core: 1 }, { a: 0.45, b: 0.7, u: 4 }, { a: 0.7, b: 1, u: 5 }] },
  { fi: 3, h: 46, parts: [{ a: 0, b: 0.82, u: 6 }, { a: 0.82, b: 1, core: 1 }] },
]
const GALLERY = [
  { id: 158, w: 1.78, t: { en: 'Ceiling fresco', it: 'Affresco del soffitto' } },
  { id: 151, w: 1.21, t: { en: 'Fresco medallion', it: 'Medaglione affrescato' } },
  { id: 144, w: 1.11, t: { en: 'Stone volute', it: 'Voluta in pietra' } },
  { id: 149, w: 1.21, t: { en: 'Private wine cellars', it: 'Cantine private' } },
  { id: 155, w: 1.24, t: { en: 'Spa suites', it: 'Suite spa' } },
  { id: 153, w: 1.22, t: { en: 'Cigar lounge', it: 'Cigar lounge' } },
]

const goTo = id => {
  const el = document.getElementById(id); if (!el) return
  const y = el.getBoundingClientRect().top + window.scrollY - 40
  window.__lenis ? window.__lenis.scrollTo(y, { duration: 1.6 }) : window.scrollTo({ top: y, behavior: 'smooth' })
}

function Kicker({ children, className = '' }) {
  return <div className={`${T.sans} text-[11px] font-semibold uppercase tracking-[.26em] ${className}`}>{children}</div>
}
function Mask({ children, delay = 0, className = '' }) {
  return (
    <span className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
      <motion.span className={'block ' + className} initial={{ y: '108%' }} whileInView={{ y: '0%' }} viewport={{ once: true, margin: '-8% 0px' }} transition={{ duration: 1.3, ease: E, delay }}>{children}</motion.span>
    </span>
  )
}
// kinetic title: letters rise one by one, slightly rotated
function Letters({ text, delay = 0 }) {
  return (
    <span className="inline-block overflow-hidden pb-[0.1em] -mb-[0.1em]" aria-label={text}>
      {[...text].map((c, i) => (
        <motion.span key={i} aria-hidden className="inline-block" initial={{ y: '105%', rotate: 5 }} whileInView={{ y: '0%', rotate: 0 }} viewport={{ once: true }} transition={{ duration: 1.3, ease: E, delay: delay + i * 0.05 }}>{c}</motion.span>
      ))}
    </span>
  )
}

/* ---------- film overlays (all driven by the scene's damped progress) ---------- */
function OpeningCopy({ t }) {
  return (
    <div className="relative mx-auto flex h-full max-w-[1440px] flex-col justify-end px-5 pb-[max(64px,calc(env(safe-area-inset-bottom)+56px))] md:px-10 md:pb-20">
      <Kicker className="mb-4 flex items-center gap-3 text-[#efe8dc]/80 md:mb-5"><span className="h-px w-8 bg-[#c3a15e]" />{t({ en: 'Residences', it: 'Residenze' })} · {PALAZZO.place}</Kicker>
      <h2 className={`${T.serif} select-none text-[clamp(60px,18.5vw,92px)] leading-[.84] tracking-[-.02em] text-[#f4eee4] md:text-[clamp(96px,10.5vw,184px)]`}>
        <span className="block"><Letters text="Palazzo" /></span>
        <span className="block pl-[.6em] italic text-[#e6cf9f]"><Letters text="Campani" delay={0.22} /></span>
      </h2>
      <div className="mt-5 grid gap-4 md:mt-8 md:grid-cols-12 md:gap-8">
        <p className={`${T.serif} text-[19px] leading-[1.22] text-[#efe8dc]/92 md:col-span-6 md:text-[27px] md:leading-[1.18]`}>{t(PALAZZO.lead)}</p>
        <div className="hidden flex-col justify-end gap-3 text-[13px] leading-relaxed text-[#efe8dc]/80 [text-shadow:0_1px_12px_rgba(0,0,0,.7)] md:col-span-3 md:col-start-8 md:flex">
          <span className="h-px w-12 bg-[#c3a15e]" />{t(PALAZZO.credit)}
        </div>
      </div>
    </div>
  )
}

function Caption({ prog, i, cap, t }) {
  const w = capWin(i)
  const o = useTransform(prog, w, [0, 1, 1, 0])
  const y = useTransform(prog, w, [26, 0, 0, -18])
  const f = useTransform(prog, w, ['blur(8px)', 'blur(0px)', 'blur(0px)', 'blur(6px)'])
  return (
    <motion.div style={{ opacity: o, y, filter: f }} className="absolute bottom-0 left-0 w-full max-w-[34rem]">
      <Kicker className="text-[#e6cf9f]">{String(i).padStart(2, '0')} — {t(cap.k)}</Kicker>
      <p className={`${T.serif} mt-3 text-[34px] leading-[1.02] text-[#f4eee4] md:text-[54px]`}>{t(cap.t)}</p>
    </motion.div>
  )
}
function Tick({ prog, i }) {
  const w = capWin(i)
  const s = useTransform(prog, w, [0, 1, 1, 0])
  const sc = useTransform(s, [0, 1], [0.4, 1])
  const op = useTransform(s, [0, 1], [0.35, 1])
  return <motion.span style={{ scaleY: sc, opacity: op }} className="block h-7 w-px origin-center bg-[#c3a15e]" />
}

function Film() {
  const { t } = useLang()
  const ref = useRef(), frame = useRef()
  useStage('palazzo', ref)
  const prog = useMotionValue(0)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  useEffect(() => {
    stage.palazzoMV = prog
    stage.palazzoFrame = frame.current
    // until the scene runs (chunk/textures still loading) the captions follow the raw scroll
    const off = scrollYProgress.on('change', v => { if (!(stage.palazzoLive > performance.now() - 400)) prog.set(v) })
    return () => { off(); if (stage.palazzoFrame === frame.current) stage.palazzoFrame = null }
  }, [prog, scrollYProgress])

  const openO = useTransform(prog, capWin(0), [1, 1, 1, 0])
  const openY = useTransform(prog, capWin(0), [0, 0, 0, -50])
  const chromeO = useTransform(prog, [0.03, 0.12], [0, 1])
  const lw = capWin(5)
  const lookO = useTransform(prog, lw, [0, 1, 1, 1])
  const lookS = useTransform(prog, [lw[0], 1], [0.94, 1.02])
  const bar = useTransform(prog, [0, 0.98], [0, 1])
  const skip = () => goTo('palazzo-residences')

  return (
    <div ref={ref} className="relative h-[180vh] md:h-[220vh]">
      {/* transparent sticky frame: the canvas draws the film exactly inside it */}
      <div ref={frame} className="sticky top-0 h-[100svh] overflow-hidden text-[#efe8dc]">
        {/* legibility (CSS, over the canvas) */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#0b0a08]/70 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-[#0b0a08]/88 via-[#0b0a08]/35 to-transparent" />

        <motion.div style={{ opacity: openO }} className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(11,10,8,.62)_0%,rgba(11,10,8,.25)_45%,transparent_70%)] max-md:bg-[linear-gradient(0deg,rgba(11,10,8,.45)_0%,rgba(11,10,8,.2)_55%,transparent_75%)]" />
        <motion.div style={{ opacity: openO, y: openY }} className="pointer-events-none absolute inset-0"><OpeningCopy t={t} /></motion.div>

        <motion.div style={{ opacity: chromeO }} className="pointer-events-none absolute inset-0">
          <div className="absolute bottom-[max(72px,calc(env(safe-area-inset-bottom)+60px))] left-5 right-5 md:bottom-20 md:left-10 md:right-auto md:w-[40rem]">
            <div className="relative h-[150px] md:h-[190px]">
              {CAPS.map((c, i) => c && <Caption key={i} prog={prog} i={i} cap={c} t={t} />)}
            </div>
          </div>
          <div className="absolute right-10 top-1/2 hidden -translate-y-1/2 flex-col gap-3 md:flex">
            {PAL.ids.map((_, i) => <Tick key={i} prog={prog} i={i} />)}
          </div>
        </motion.div>

        <motion.div style={{ opacity: lookO, scale: lookS }} className="pointer-events-none absolute inset-0 grid place-items-center bg-[radial-gradient(52%_40%_at_50%_50%,rgba(11,10,8,.62),rgba(11,10,8,.18)_70%,transparent)] text-center">
          <div className="px-5">
            <Kicker className="text-[#e6cf9f]">05 — {t({ en: 'Original frescoes', it: 'Affreschi originali' })}</Kicker>
            <div className={`${T.serif} mt-3 text-[clamp(64px,19vw,96px)] italic leading-[.86] text-[#f4eee4] [text-shadow:0_6px_50px_rgba(0,0,0,.6)] md:text-[clamp(96px,10vw,176px)]`}>{t({ en: 'Look up.', it: 'Alza lo sguardo.' })}</div>
            <p className="mx-auto mt-5 max-w-[32ch] text-[15px] leading-relaxed text-[#efe8dc]/85 [text-shadow:0_2px_16px_rgba(0,0,0,.8)]">{t({ en: 'Original frescoes beneath vaulted ceilings.', it: 'Affreschi originali sotto soffitti a volta.' })}</p>
          </div>
        </motion.div>

        {/* chrome: honesty note + progress hairline */}
        <div className="pointer-events-none absolute inset-x-5 bottom-[max(22px,calc(env(safe-area-inset-bottom)+14px))] flex items-center gap-4 md:inset-x-10 md:bottom-8">
          <span className={`${T.sans} shrink-0 text-[11px] uppercase tracking-[.2em] text-[#efe8dc]/62`}>{t(ILLU)}</span>
          <span className="relative h-px flex-1 bg-[#efe8dc]/12"><motion.span style={{ scaleX: bar }} className="absolute inset-0 origin-left bg-[#c3a15e]" /></span>
        </div>
        <button onClick={skip} className={`${T.sans} absolute right-4 top-[72px] z-10 inline-flex h-11 items-center gap-2 rounded-full border border-[#efe8dc]/20 bg-[#0b0a08]/30 px-5 text-[11.5px] font-semibold uppercase tracking-[.18em] text-[#efe8dc] backdrop-blur-md transition-colors hover:border-[#c3a15e] hover:text-[#e6cf9f] md:right-10 md:top-24`}>{t('skip')} <span aria-hidden>↓</span></button>
      </div>
    </div>
  )
}

/* lite / reduced motion: no canvas — opening still + the ceiling as a still */
const LITE_GRADE = { filter: 'saturate(.88) sepia(.08) brightness(.94) contrast(1.04)' }
function FilmLite() {
  const { t } = useLang()
  return (
    <>
      <div className="relative h-[100svh] overflow-hidden bg-[#0b0a08] text-[#efe8dc]">
        <img src={img(145)} srcSet={`${img(145, 1)} 720w, ${img(145)} 1800w`} sizes="100vw" alt={t({ en: 'Rooftops of Volterra', it: 'I tetti di Volterra' })} style={LITE_GRADE} className="absolute inset-0 h-full w-full object-cover object-[68%_50%] md:object-center" decoding="async" width="1800" height="1609" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-[#0b0a08]/90 via-[#0b0a08]/35 to-transparent" />
        <div className="absolute inset-0"><OpeningCopy t={t} /></div>
      </div>
      <div className="relative h-[80svh] overflow-hidden bg-[#0b0a08] text-[#efe8dc]">
        <img src={img(154)} srcSet={`${img(154, 1)} 720w, ${img(154)} 1800w`} sizes="100vw" alt={t({ en: 'Frescoed ceiling in Palazzo Campani', it: 'Soffitto affrescato di Palazzo Campani' })} style={LITE_GRADE} className="absolute inset-0 h-full w-full object-cover" loading="lazy" decoding="async" width="1776" height="1800" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_50%_at_50%_50%,rgba(11,10,8,.55),transparent_80%)]" />
        <div className="absolute inset-0 grid place-items-center px-5 text-center">
          <div>
            <Kicker className="text-[#e6cf9f]">{t({ en: 'Original frescoes', it: 'Affreschi originali' })}</Kicker>
            <div className={`${T.serif} mt-3 text-[clamp(56px,16vw,150px)] italic leading-[.86]`}>{t({ en: 'Look up.', it: 'Alza lo sguardo.' })}</div>
            <div className={`${T.sans} mt-5 text-[11px] uppercase tracking-[.2em] text-[#efe8dc]/62`}>{t(ILLU)}</div>
          </div>
        </div>
      </div>
    </>
  )
}

/* ---------- residences: table + schematic + extras + archive + gallery (dark luxury) ---------- */
function Schematic({ sel, onPick, t }) {
  const X0 = 10, X1 = 290
  let y = 236
  const rows = SECTION.map(r => { y -= r.h; return { ...r, y } })
  const top = rows[rows.length - 1].y
  return (
    <svg viewBox="0 0 300 258" className="w-full" role="img" aria-label={t({ en: 'Schematic section of the palazzo', it: 'Sezione schematica del palazzo' })}>
      <defs>
        <pattern id="pal-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke={INK} strokeOpacity=".16" strokeWidth="1" /></pattern>
      </defs>
      <path d={`M${X0 - 6} ${top} L150 ${top - 24} L${X1 + 6} ${top}`} fill="none" stroke={INK} strokeOpacity=".55" strokeWidth="1" />
      <line x1="0" x2="300" y1="236" y2="236" stroke={INK} strokeOpacity=".3" strokeDasharray="3 4" />
      {rows.map(r => (
        <g key={r.fi}>
          {r.parts.length === 0 && <rect x={X0} y={r.y + 2} width={X1 - X0} height={r.h - 4} fill="url(#pal-hatch)" stroke={INK} strokeOpacity=".2" />}
          {r.parts.map((pt, j) => {
            const x = X0 + pt.a * (X1 - X0), w = (pt.b - pt.a) * (X1 - X0)
            const on = pt.u === sel
            return (
              <g key={j} onClick={pt.u ? () => onPick(pt.u) : undefined} className={pt.u ? 'cursor-pointer' : ''}>
                <rect x={x + 2} y={r.y + 2} width={w - 4} height={r.h - 4} style={{ transition: 'fill .5s, stroke .5s, fill-opacity .5s' }}
                  fill={pt.core ? 'url(#pal-hatch)' : on ? GOLD : INK} fillOpacity={pt.core ? 1 : on ? 0.92 : 0.04} stroke={on ? GOLD : INK} strokeOpacity={on ? 1 : 0.3} />
                {pt.u && <text x={x + w / 2} y={r.y + r.h / 2 + 6} textAnchor="middle" style={{ transition: 'fill .5s' }} fill={on ? '#0b0a08' : INK} fillOpacity={on ? 1 : 0.8} className="font-['Instrument_Serif',serif]" fontSize="18">{pt.u}</text>}
              </g>
            )
          })}
        </g>
      ))}
      <text x={X0} y="254" fontSize="9" letterSpacing="1.6" fill={INK} fillOpacity=".5">{t({ en: 'SCHEMATIC · NOT TO SCALE', it: 'SCHEMA · NON IN SCALA' })}</text>
    </svg>
  )
}

function Residences() {
  const { t } = useLang()
  const [sel, setSel] = useState(3)
  const unit = UNITS.find(u => u.n === sel)
  return (
    <div id="palazzo-residences" className={`${T.sans} relative bg-[#0b0a08] px-5 pb-14 pt-14 text-[#efe8dc] md:px-10 md:pb-16 md:pt-20`}>
      <div className="mx-auto grid max-w-[1440px] gap-10 md:grid-cols-12 md:gap-x-10 md:gap-y-12">
        <div className="min-w-0 md:col-span-5">
          <Kicker className="text-[#c3a15e]">{t({ en: 'Six residences · 474 m²', it: 'Sei residenze · 474 m²' })}</Kicker>
          <h3 className={`${T.serif} mt-3 text-[46px] leading-[.92] md:text-[64px]`}>
            <Mask>{t({ en: 'Six residences,', it: 'Sei residenze,' })}</Mask>
            <Mask delay={0.1} className="italic text-[#e6cf9f]">{t({ en: 'one palazzo.', it: 'un palazzo.' })}</Mask>
          </h3>
          <p className="mt-4 max-w-[40ch] text-[15px] leading-relaxed text-[#efe8dc]/62">{t({ en: 'Two on the ground floor, three on the piano nobile, one attic loft. Choose a residence to see where it sits.', it: 'Due al piano terra, tre al piano nobile, un loft mansardato. Scegli una residenza per vedere dove si trova.' })}</p>
          <div className="mt-7" role="tablist" aria-label={t({ en: 'Residences', it: 'Residenze' })}>
            {PALAZZO.floors.filter(f => f.units.length).map(f => (
              <div key={f.id} className="mb-3">
                <div className="flex items-baseline justify-between border-b border-[#efe8dc]/12 pb-1.5 text-[11px] font-semibold uppercase tracking-[.22em] text-[#efe8dc]/50">
                  <span>{t(f.t)}</span><span>m²</span>
                </div>
                {f.units.map(u => {
                  const on = u.n === sel
                  return (
                    <button key={u.n} role="tab" aria-selected={on} onClick={() => setSel(u.n)} onMouseEnter={() => setSel(u.n)}
                      className={`relative flex min-h-[48px] w-full items-center gap-4 border-b border-[#efe8dc]/[.07] py-2 text-left transition-colors duration-300 ${on ? 'text-[#efe8dc]' : 'text-[#efe8dc]/55 hover:text-[#efe8dc]'}`}>
                      {on && <motion.span layoutId="pal-row" className="absolute inset-y-0 -left-3 w-[2px] bg-[#c3a15e]" transition={{ type: 'spring', stiffness: 400, damping: 36 }} />}
                      <span className={`${T.serif} w-[4.4rem] text-[26px] leading-none md:text-[28px]`}>Ap. {u.n}</span>
                      <span className="flex-1 text-[13.5px]">{u.r ? t(u.r) : ''}</span>
                      <span className={`${T.serif} text-[28px] leading-none tabular-nums md:text-[30px] ${on ? 'text-[#c3a15e]' : ''}`}>{u.m2}</span>
                    </button>
                  )
                })}
              </div>
            ))}
            <div className="flex items-baseline justify-between pt-2">
              <span className="text-[11px] font-semibold uppercase tracking-[.22em] text-[#efe8dc]/62">{t({ en: 'Total', it: 'Totale' })}</span>
              <span className={`${T.serif} text-[36px] leading-none tabular-nums`}>{PALAZZO.total} <span className="text-[18px] text-[#efe8dc]/62">m²</span></span>
            </div>
          </div>
        </div>

        <div className="min-w-0 md:col-span-7">
          <div className="grid gap-6 md:grid-cols-7 md:gap-8">
            <div className="flex flex-col justify-between rounded-[2px] border border-[#efe8dc]/12 bg-[#14120f] p-5 md:col-span-4 md:p-7">
              <Schematic sel={sel} onPick={setSel} t={t} />
              <div className="mt-5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-[#efe8dc]/12 pt-4">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div key={sel} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.35, ease: E }} className={`${T.serif} text-[36px] leading-none`}>
                    Ap. {sel} <span className="text-[#c3a15e] tabular-nums">· {unit.m2} m²</span>
                  </motion.div>
                </AnimatePresence>
                <div className="text-[13.5px] text-[#efe8dc]/62">{t(unit.floor.t)}{unit.r ? ' · ' + t(unit.r) : ''}</div>
              </div>
            </div>
            <div className="flex flex-col gap-6 md:col-span-3">
              <div>
                <Kicker className="text-[#efe8dc]/50">{t({ en: 'Inside the palazzo', it: 'Nel palazzo' })}</Kicker>
                <ul className={`${T.serif} mt-3 text-[20px] leading-snug md:text-[21px]`}>
                  {t(PALAZZO.extras).map((x, i) => (
                    <motion.li key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: E, delay: i * 0.05 }}
                      className="flex items-center gap-3 border-b border-[#efe8dc]/[.07] py-1.5"><span aria-hidden className="h-1 w-1 shrink-0 rounded-full bg-[#c3a15e]" />{x}</motion.li>
                  ))}
                </ul>
              </div>
              <div className="mt-auto">
                <p className="text-[14px] leading-relaxed text-[#efe8dc]/62">{t(PALAZZO.archive)}</p>
                <a href="#contact" className="group mt-4 inline-flex min-h-[48px] items-center gap-3 rounded-full bg-[#efe8dc] px-6 text-[12px] font-semibold uppercase tracking-[.16em] text-[#0b0a08] transition-colors duration-500 hover:bg-[#c3a15e]">
                  {t({ en: 'Request the archive', it: 'Richiedi l’archivio' })} <span aria-hidden className="transition-transform duration-500 group-hover:translate-x-1">→</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="min-w-0 md:col-span-12">
          <div className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] md:mx-0 md:overflow-visible md:px-0 md:pb-0">
            {GALLERY.map((g, i) => (
              <motion.figure key={g.id} style={{ flexGrow: g.w }} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-5% 0px' }} transition={{ duration: 1, ease: E, delay: i * 0.06 }}
                className="group relative h-[200px] w-[64vw] shrink-0 snap-start overflow-hidden bg-[#14120f] md:h-[190px] md:w-auto md:basis-0">
                <img src={img(g.id, 1)} alt={t(g.t)} loading="lazy" decoding="async" style={LITE_GRADE} className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-[1.06]" />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0b0a08]/80 to-transparent px-3 pb-2.5 pt-10 text-[11px] font-medium uppercase tracking-[.16em] text-[#efe8dc]/90">{t(g.t)}</figcaption>
              </motion.figure>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-[#efe8dc]/45">{t({ en: 'Interior and lifestyle photographs are illustrative.', it: 'Le fotografie degli interni e lifestyle sono indicative.' })}</p>
        </div>
      </div>
    </div>
  )
}

export default function Palazzo() {
  const lite = useLite()
  return (
    <section id="palazzo" className="relative bg-transparent">
      {lite ? <FilmLite /> : <Film />}
      <Residences />
    </section>
  )
}
