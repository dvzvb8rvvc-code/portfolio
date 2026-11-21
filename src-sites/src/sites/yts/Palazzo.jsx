import React, { useRef, useState } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { useLite } from '../../lib/kit'
import { useLang } from './i18n'
import { T, PALAZZO, img } from './data'
import { useStage } from './engine'

/* PALAZZO CAMPANI (v3): one pinned film on the shared canvas (scenePalazzo.jsx) + one tight DOM block.
   The opening photo (Volterra rooftops) is the first frame of the film: it zooms and dissolves
   into the first frescoed room. No canvases here. */

const E = [0.16, 1, 0.3, 1]
const c01 = v => Math.min(1, Math.max(0, v))
const win = (a, b) => { const o = [c01(a - 0.03), c01(a), c01(b), c01(b + 0.03)]; for (let i = 1; i < 4; i++) if (o[i] <= o[i - 1]) o[i] = o[i - 1] + 1e-4; if (o[3] > 1) { const k = 1 / o[3]; return o.map(v => v * k) } return o }
// timeline — mirrors scenePalazzo.jsx
const TL = { open: [0, 0.12], rooms: [0.06, 0.8], look: [0.8, 0.95] }
const SPAN = 3.55
const fP = f => TL.rooms[0] + (f / SPAN) * (TL.rooms[1] - TL.rooms[0])

const ROOMS = [
  { id: 148, k: { en: 'Grotesques', it: 'Grottesche' }, t: { en: 'Painted vaults, room after room.', it: 'Volte dipinte, stanza dopo stanza.' } },
  { id: 156, k: { en: 'Arched windows', it: 'Finestre ad arco' }, t: { en: 'Tuscan light through deep stone reveals.', it: 'Luce toscana tra profondi sguinci di pietra.' } },
  { id: 157, k: { en: 'Salon', it: 'Salotto' }, t: { en: 'Decorated ceilings over quiet salons.', it: 'Soffitti decorati su salotti silenziosi.' } },
  { id: 152, k: { en: 'Bedroom', it: 'Camera' }, t: { en: 'Sleeping beneath original frescoes.', it: 'Dormire sotto affreschi originali.' } },
]

const UNITS = PALAZZO.floors.flatMap((f, fi) => f.units.map(u => ({ ...u, fi, floor: f })))
const UNIT_IMG = { 1: 143, 2: 157, 3: 148, 4: 156, 5: 152, 6: 147 }
// schematic section (bottom → top), x-ranges 0..1 per unit — schematic, not to scale
const SECTION = [
  { fi: 0, h: 34, parts: [] },
  { fi: 1, h: 62, parts: [{ a: 0, b: 0.42, u: 1 }, { a: 0.42, b: 0.58, core: 1 }, { a: 0.58, b: 1, u: 2 }] },
  { fi: 2, h: 78, parts: [{ a: 0, b: 0.33, u: 3 }, { a: 0.33, b: 0.45, core: 1 }, { a: 0.45, b: 0.7, u: 4 }, { a: 0.7, b: 1, u: 5 }] },
  { fi: 3, h: 50, parts: [{ a: 0, b: 0.82, u: 6 }, { a: 0.82, b: 1, core: 1 }] },
]
const GALLERY = [
  { id: 158, w: 1.78, t: { en: 'Ceiling fresco', it: 'Affresco del soffitto' } },
  { id: 151, w: 1.21, t: { en: 'Fresco medallion', it: 'Medaglione affrescato' } },
  { id: 144, w: 1.11, t: { en: 'Stone volute', it: 'Voluta in pietra' } },
  { id: 149, w: 1.21, t: { en: 'Private wine cellars', it: 'Cantine private' } },
  { id: 155, w: 1.24, t: { en: 'Spa suites', it: 'Suite spa' } },
  { id: 153, w: 1.22, t: { en: 'Cigar lounge', it: 'Cigar lounge' } },
]

function Kicker({ children, className = '' }) {
  return <div className={`text-[11px] font-semibold uppercase tracking-[.24em] ${className}`}>{children}</div>
}
function Mask({ children, delay = 0, className = '' }) {
  return (
    <span className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
      <motion.span className={'block ' + className} initial={{ y: '108%' }} whileInView={{ y: '0%' }} viewport={{ once: true, margin: '-8% 0px' }} transition={{ duration: 1.2, ease: E, delay }}>{children}</motion.span>
    </span>
  )
}
// kinetic title: letters rise one by one
function Letters({ text, delay = 0, className = '' }) {
  return (
    <span className={'inline-block overflow-hidden pb-[0.1em] -mb-[0.1em] ' + className} aria-label={text}>
      {[...text].map((c, i) => (
        <motion.span key={i} aria-hidden className="inline-block" initial={{ y: '105%', rotate: 6 }} whileInView={{ y: '0%', rotate: 0 }} viewport={{ once: true }} transition={{ duration: 1.1, ease: E, delay: delay + i * 0.045 }}>{c}</motion.span>
      ))}
    </span>
  )
}

/* ---------- opening frame (photo 145) ---------- */
function OpeningCopy({ t }) {
  return (
    <div className="pointer-events-none relative mx-auto flex h-full max-w-[1440px] flex-col justify-between px-5 pb-10 pt-24 text-[#ece7df] md:px-10 md:pb-14 md:pt-28">
      <div className="flex items-start justify-between gap-6 pr-24 md:pr-32">
        <Kicker className="text-[#ece7df]/80">{t({ en: 'Residences', it: 'Residenze' })} · {PALAZZO.place}</Kicker>
      </div>
      <div>
        <h2 className={`${T.serif} select-none leading-[.82] tracking-[-.02em] drop-shadow-[0_8px_40px_rgba(0,0,0,.4)]`}>
          <span className="block text-[22vw] md:text-[13vw]"><Letters text="Palazzo" /></span>
          <span className="block pl-[9vw] text-[22vw] italic text-[#f0c88f] md:text-[13vw]"><Letters text="Campani" delay={0.25} /></span>
        </h2>
        <div className="mt-6 grid gap-5 md:mt-8 md:grid-cols-12">
          <p className={`${T.serif} text-[21px] leading-[1.15] md:col-span-6 md:text-[30px]`}>{t(PALAZZO.lead)}</p>
          <div className="flex flex-col justify-end gap-3 text-[12.5px] leading-relaxed text-[#ece7df]/80 md:col-span-4 md:col-start-9 md:text-[13px]">
            <span className="h-px w-16 bg-[#f0c88f]" />
            {t(PALAZZO.credit)}
          </div>
        </div>
      </div>
    </div>
  )
}

function Caption({ prog, a, b, room, i, t }) {
  const o = useTransform(prog, win(a, b), [0, 1, 1, 0])
  const y = useTransform(prog, win(a, b), [24, 0, 0, -16])
  return (
    <motion.div style={{ opacity: o, y }} className="absolute bottom-0 left-0 max-w-[30rem]">
      <Kicker className="text-[#f0c88f]">{String(i + 1).padStart(2, '0')} — {t(room.k)}</Kicker>
      <p className={`${T.serif} mt-3 text-[34px] leading-[1] drop-shadow-[0_4px_30px_rgba(0,0,0,.7)] md:text-[58px]`}>{t(room.t)}</p>
    </motion.div>
  )
}
function Tick({ prog, a, b }) {
  const s = useTransform(prog, win(a, b), [0.35, 1, 1, 0.35])
  return <motion.span style={{ scaleY: s, opacity: s }} className="block h-7 w-px origin-center bg-[#f0c88f]" />
}

function Film() {
  const { t } = useLang()
  const ref = useRef()
  useStage('palazzo', ref)
  const { scrollYProgress: prog } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const { scrollYProgress: enter } = useScroll({ target: ref, offset: ['start end', 'start start'] })
  // opening photo: gentle parallax while it arrives, then a slow push-in that dissolves into the first room
  const photoY = useTransform(enter, [0, 1], ['-12%', '0%'])
  const photoS = useTransform(prog, [0, TL.open[1]], [1.04, 1.32])
  const photoO = useTransform(prog, [0.035, TL.open[1]], [1, 0])
  const copyO = useTransform(prog, [0, 0.06], [1, 0])
  const copyY = useTransform(prog, [0, 0.07], [0, -80])
  const chromeO = useTransform(prog, [0.07, 0.11, 0.96, 1], [0, 1, 1, 0.6])
  const lookO = useTransform(prog, [0.84, 0.9, 1], [0, 1, 1])
  const lookS = useTransform(prog, [0.84, 1], [0.94, 1.04])
  const windows = ROOMS.map((_, k) => [fP(k === 0 ? 0.05 : k - 0.05), fP(k === ROOMS.length - 1 ? 3.3 : k + 0.62)])
  return (
    <div ref={ref} className="relative h-[250vh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* vignette over the 3D (CSS, not a post pass) */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_45%,transparent_45%,rgba(12,9,6,.6)_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/55 to-transparent" />

        <motion.div style={{ opacity: chromeO }} className="pointer-events-none absolute inset-0 text-[#ece7df]">
          <div className="absolute bottom-10 left-5 right-5 md:bottom-14 md:left-10 md:right-auto md:w-[40rem]">
            <div className="relative h-[150px] md:h-[200px]">
              {ROOMS.map((r, i) => <Caption key={r.id} prog={prog} a={windows[i][0]} b={windows[i][1]} room={r} i={i} t={t} />)}
            </div>
          </div>
          <div className="absolute right-5 top-1/2 hidden -translate-y-1/2 flex-col gap-3 md:right-10 md:flex">
            {windows.map((w, i) => <Tick key={i} prog={prog} a={w[0]} b={w[1]} />)}
            <Tick prog={prog} a={0.86} b={0.96} />
          </div>
          <div className="absolute bottom-4 left-5 text-[10.5px] uppercase tracking-[.2em] text-white/60 md:bottom-6 md:left-10">{t({ en: 'Interior photos · illustrative', it: 'Foto degli interni · indicative' })}</div>
        </motion.div>

        <motion.div style={{ opacity: lookO, scale: lookS }} className="pointer-events-none absolute inset-0 grid place-items-center bg-[radial-gradient(60%_45%_at_50%_50%,rgba(15,10,6,.55),transparent_75%)] text-center text-[#ece7df]">
          <div>
            <Kicker className="text-[#f0c88f]">05 — {t({ en: 'Original frescoes', it: 'Affreschi originali' })}</Kicker>
            <div className={`${T.serif} mt-3 text-[21vw] italic leading-[.8] drop-shadow-[0_6px_40px_rgba(0,0,0,.65)] md:text-[11vw]`}>{t({ en: 'Look up.', it: 'Alza lo sguardo.' })}</div>
            <p className="mx-auto mt-5 max-w-[34ch] px-5 text-[14px] leading-relaxed text-white/85 drop-shadow-[0_2px_12px_rgba(0,0,0,.8)]">{t({ en: 'Original frescoes beneath vaulted ceilings.', it: 'Affreschi originali sotto soffitti a volta.' })}</p>
          </div>
        </motion.div>

        {/* opening frame — opaque, covers the canvas until it dissolves into the first room */}
        <motion.div style={{ opacity: photoO }} className="absolute inset-0 overflow-hidden bg-[#151412]">
          <motion.img style={{ y: photoY, scale: photoS }} src={img(145)} srcSet={`${img(145, 1)} 720w, ${img(145)} 1800w`} sizes="100vw" alt={t({ en: 'Rooftops of Volterra', it: 'I tetti di Volterra' })} className="absolute inset-0 h-full w-full object-cover" decoding="async" width="1800" height="1609" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(21,20,18,.7)_0%,rgba(21,20,18,.12)_30%,rgba(21,20,18,.15)_55%,rgba(21,20,18,.85)_100%)]" />
        </motion.div>
        <motion.div style={{ opacity: copyO, y: copyY }} className="absolute inset-0"><OpeningCopy t={t} /></motion.div>

        <a href="#palazzo-residences" className="absolute right-5 top-20 z-10 inline-flex h-9 items-center gap-2 rounded-full bg-white/10 px-4 text-[12px] font-semibold uppercase tracking-[.14em] text-white backdrop-blur-md transition-colors hover:bg-white/20 md:right-10 md:top-24">{t('skip')} <span aria-hidden>↓</span></a>
      </div>
    </div>
  )
}

/* lite / reduced motion: no canvas — opening photo, then the first room as a still */
function FilmLite() {
  const { t } = useLang()
  return (
    <>
      <div className="relative h-[100svh] overflow-hidden bg-[#151412]">
        <img src={img(145)} srcSet={`${img(145, 1)} 720w, ${img(145)} 1800w`} sizes="100vw" alt={t({ en: 'Rooftops of Volterra', it: 'I tetti di Volterra' })} className="absolute inset-0 h-full w-full object-cover" decoding="async" width="1800" height="1609" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(21,20,18,.7)_0%,rgba(21,20,18,.12)_30%,rgba(21,20,18,.15)_55%,rgba(21,20,18,.85)_100%)]" />
        <div className="absolute inset-0"><OpeningCopy t={t} /></div>
      </div>
      <div className="relative h-[85svh] overflow-hidden bg-[#151412] text-[#ece7df]">
        <img src={img(148)} srcSet={`${img(148, 1)} 720w, ${img(148)} 1800w`} sizes="100vw" alt={t({ en: 'Frescoed room in Palazzo Campani', it: 'Sala affrescata di Palazzo Campani' })} className="absolute inset-0 h-full w-full object-cover" loading="lazy" decoding="async" width="1759" height="1800" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-10 left-5 max-w-[30rem] md:left-10">
          <Kicker className="text-[#f0c88f]">01 — {t(ROOMS[0].k)}</Kicker>
          <p className={`${T.serif} mt-3 text-[34px] leading-[1] md:text-[56px]`}>{t({ en: 'Original frescoes beneath vaulted ceilings.', it: 'Affreschi originali sotto soffitti a volta.' })}</p>
          <div className="mt-4 text-[10.5px] uppercase tracking-[.2em] text-white/60">{t({ en: 'Interior photos · illustrative', it: 'Foto degli interni · indicative' })}</div>
        </div>
      </div>
    </>
  )
}

/* ---------- residences: table + schematic + photo ---------- */
function Schematic({ sel, onPick, t }) {
  const W = 300, X0 = 10, X1 = 290
  let y = 250
  const rows = SECTION.map(r => { y -= r.h; return { ...r, y } })
  const top = rows[rows.length - 1].y
  return (
    <svg viewBox="0 0 300 268" className="w-full" role="img" aria-label={t({ en: 'Schematic section of the palazzo', it: 'Sezione schematica del palazzo' })}>
      <defs>
        <pattern id="pal-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="#151412" strokeOpacity=".22" strokeWidth="1" /></pattern>
      </defs>
      <path d={`M${X0 - 6} ${top} L150 ${top - 26} L${X1 + 6} ${top}`} fill="none" stroke="#151412" strokeWidth="1.2" />
      <line x1="0" x2={W} y1="250" y2="250" stroke="#151412" strokeOpacity=".4" strokeDasharray="3 4" />
      {rows.map(r => (
        <g key={r.fi}>
          {r.parts.length === 0 && <rect x={X0} y={r.y + 2} width={X1 - X0} height={r.h - 4} fill="url(#pal-hatch)" stroke="#151412" strokeOpacity=".35" />}
          {r.parts.map((pt, j) => {
            const x = X0 + pt.a * (X1 - X0), w = (pt.b - pt.a) * (X1 - X0)
            const on = pt.u === sel
            return (
              <g key={j} onClick={pt.u ? () => onPick(pt.u) : undefined} className={pt.u ? 'cursor-pointer' : ''}>
                <rect x={x + 2} y={r.y + 2} width={w - 4} height={r.h - 4} style={{ transition: 'fill .5s, stroke .5s' }}
                  fill={pt.core ? 'url(#pal-hatch)' : on ? '#b06a35' : '#ece7df'} stroke={on ? '#b06a35' : '#151412'} strokeOpacity={on ? 1 : 0.45} />
                {pt.u && <text x={x + w / 2} y={r.y + r.h / 2 + 5} textAnchor="middle" style={{ transition: 'fill .5s' }} fill={on ? '#ece7df' : '#151412'} className="font-['Instrument_Serif',serif]" fontSize="17">{pt.u}</text>}
              </g>
            )
          })}
        </g>
      ))}
      <text x={X0} y="264" fontSize="9" letterSpacing="1.5" fill="#151412" fillOpacity=".55">{t({ en: 'SCHEMATIC · NOT TO SCALE', it: 'SCHEMA · NON IN SCALA' })}</text>
    </svg>
  )
}

function Residences() {
  const { t } = useLang()
  const [sel, setSel] = useState(3)
  const unit = UNITS.find(u => u.n === sel)
  return (
    <div id="palazzo-residences" className="relative bg-[#ece7df] px-5 pb-12 pt-14 md:px-10 md:pb-14 md:pt-16">
      <div className="mx-auto grid max-w-[1440px] gap-10 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-5">
          <Kicker className="text-[#b06a35]">{t({ en: 'Six residences · 474 m²', it: 'Sei residenze · 474 m²' })}</Kicker>
          <h3 className={`${T.serif} mt-3 text-[46px] leading-[.9] md:text-[64px]`}>
            <Mask>{t({ en: 'Six residences,', it: 'Sei residenze,' })}</Mask>
            <Mask delay={0.1} className="italic text-[#b06a35]">{t({ en: 'one palazzo.', it: 'un palazzo.' })}</Mask>
          </h3>
          <p className="mt-3 max-w-[40ch] text-[14px] leading-relaxed text-[#151412]/65">{t({ en: 'Two on the ground floor, three on the piano nobile, one attic loft. Choose a residence to see where it sits.', it: 'Due al piano terra, tre al piano nobile, un loft mansardato. Scegli una residenza per vedere dove si trova.' })}</p>
          <div className="mt-6" role="tablist" aria-label={t({ en: 'Residences', it: 'Residenze' })}>
            {PALAZZO.floors.filter(f => f.units.length).map(f => (
              <div key={f.id} className="mb-2">
                <div className="flex items-baseline justify-between border-b border-[#151412]/20 pb-1 text-[10.5px] font-semibold uppercase tracking-[.22em] text-[#151412]/50">
                  <span>{t(f.t)}</span><span>m²</span>
                </div>
                {f.units.map(u => {
                  const on = u.n === sel
                  return (
                    <button key={u.n} role="tab" aria-selected={on} onClick={() => setSel(u.n)} onMouseEnter={() => setSel(u.n)}
                      className={`relative flex w-full items-baseline gap-4 border-b border-[#151412]/10 py-2 text-left transition-colors ${on ? 'text-[#151412]' : 'text-[#151412]/55 hover:text-[#151412]'}`}>
                      {on && <motion.span layoutId="pal-row" className="absolute inset-y-0 -left-3 w-[3px] bg-[#b06a35]" transition={{ type: 'spring', stiffness: 400, damping: 36 }} />}
                      <span className={`${T.serif} w-[4.2rem] text-[26px] leading-none md:text-[28px]`}>Ap. {u.n}</span>
                      <span className="flex-1 text-[13px]">{u.r ? t(u.r) : ''}</span>
                      <span className={`${T.serif} text-[28px] leading-none tabular-nums md:text-[30px] ${on ? 'text-[#b06a35]' : ''}`}>{u.m2}</span>
                    </button>
                  )
                })}
              </div>
            ))}
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-[11px] font-semibold uppercase tracking-[.22em]">{t({ en: 'Total', it: 'Totale' })}</span>
              <span className={`${T.serif} text-[34px] leading-none tabular-nums`}>474 <span className="text-[18px]">m²</span></span>
            </div>
          </div>
        </div>

        <div className="md:col-span-7">
          <div className="grid grid-cols-2 gap-5 md:grid-cols-7 md:gap-8">
            <div className="col-span-2 flex flex-col justify-between md:col-span-3">
              <Schematic sel={sel} onPick={setSel} t={t} />
              <div className="mt-4">
                <div className={`${T.serif} text-[38px] leading-none`}>Ap. {sel} <span className="text-[#b06a35]">· {unit.m2} m²</span></div>
                <div className="mt-2 text-[13.5px] text-[#151412]/70">{t(unit.floor.t)}{unit.r ? ' · ' + t(unit.r) : ''}</div>
              </div>
            </div>
            <div className="col-span-2 md:col-span-4">
              <div className="relative aspect-[5/4] overflow-hidden bg-[#151412] md:aspect-square">
                <AnimatePresence initial={false}>
                  <motion.img key={sel} src={img(UNIT_IMG[sel], 1)} alt={t({ en: 'Interior of Palazzo Campani', it: 'Interno di Palazzo Campani' })} loading="lazy" decoding="async"
                    className="absolute inset-0 h-full w-full object-cover" initial={{ opacity: 0, scale: 1.06 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.9, ease: E }} />
                </AnimatePresence>
              </div>
              <div className="mt-2 text-[11px] text-[#151412]/50">{t({ en: 'Palazzo interiors — illustrative, not the specific residence', it: 'Interni del palazzo — indicativi, non della singola residenza' })}</div>
            </div>
          </div>
          <div className="mt-7 grid gap-5 border-t border-[#151412]/15 pt-5 md:grid-cols-7 md:gap-8">
            <div className="md:col-span-4">
              <Kicker className="text-[#151412]/50">{t({ en: 'Inside the palazzo', it: 'Nel palazzo' })}</Kicker>
              <ul className={`${T.serif} mt-2 flex flex-wrap gap-x-3 gap-y-0.5 text-[19px] leading-snug md:text-[21px]`}>
                {t(PALAZZO.extras).map((x, i) => <li key={i} className="flex items-center gap-3">{i > 0 && <span aria-hidden className="h-1 w-1 rounded-full bg-[#b06a35]" />}{x}</li>)}
              </ul>
            </div>
            <div className="md:col-span-3">
              <p className="text-[12.5px] leading-relaxed text-[#151412]/65">{t(PALAZZO.archive)}</p>
              <a href="#contact" className="mt-3 inline-flex h-11 items-center gap-3 rounded-full bg-[#151412] px-5 text-[13px] font-semibold text-[#ece7df] transition-colors hover:bg-[#b06a35]">{t({ en: 'Request the technical archive', it: 'Richiedi l’archivio tecnico' })} <span aria-hidden>→</span></a>
            </div>
          </div>
        </div>

        <div className="md:col-span-12">
          <div className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 md:mx-0 md:overflow-visible md:px-0 md:pb-0">
            {GALLERY.map((g, i) => (
              <motion.figure key={g.id} style={{ flexGrow: g.w }} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-5% 0px' }} transition={{ duration: 1, ease: E, delay: i * 0.06 }}
                className="group relative h-[170px] w-[62vw] shrink-0 snap-start overflow-hidden bg-[#151412] md:h-[180px] md:w-auto md:basis-0">
                <img src={img(g.id, 1)} alt={t(g.t)} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.06]" />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-3 pb-2.5 pt-8 text-[11px] font-medium uppercase tracking-[.16em] text-white/90">{t(g.t)}</figcaption>
              </motion.figure>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-[#151412]/45">{t({ en: 'Lifestyle photographs are illustrative.', it: 'Le fotografie lifestyle sono indicative.' })}</p>
        </div>
      </div>
    </div>
  )
}

export default function Palazzo() {
  const lite = useLite()
  return (
    <section id="palazzo" className="relative">
      {lite ? <FilmLite /> : <Film />}
      <Residences />
    </section>
  )
}
