import React, { useRef, useState } from 'react'
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from 'framer-motion'
import { useLang } from './i18n'
import { T, PALAZZO } from './data'
import { SOFT } from './motion'
import { D, S, E, Display, Eyebrow, Pill, Video, CineStyle, ask } from './cine'

/* PALAZZO (V8) — two filmed loops (Volterra rooftops → frescoed rooms), a giant "PALAZZO *Campani*",
   the lead + restoration credit, an espresso chapter with the residences table (data.js m² only),
   the shared extras (no floor assignment) and the technical-archive CTA. DOM + <video> only. */

const ESP = '#2a1a12'
const xl = id => `/portfolio/yts/img/${id}-xl.webp`
const FLOORS = PALAZZO.floors.filter(f => f.units.length).slice().reverse() // attic → ground, as you read a section drawing
const MAX = Math.max(...PALAZZO.floors.flatMap(f => f.units.map(u => u.m2)))

function Opening() {
  const { t } = useLang()
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const p = useSpring(scrollYProgress, SOFT)
  const vs = useTransform(p, [0, 1], [1.12, 1])
  const ty = useTransform(p, [.3, 1], ['0%', '-30%'])
  const tsc = useTransform(p, [0, .5], [1.08, 1])
  return (
    <div ref={ref} className="relative h-[100svh] min-h-[600px] overflow-hidden">
      <motion.div style={reduce ? undefined : { scale: vs }} className="absolute inset-0">
        <Video name="volterra" fallback={xl(145)} alt={t({ en: 'The rooftops of Volterra', it: 'I tetti di Volterra' })} className="h-full w-full" pos="50% 60%" />
      </motion.div>
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(11,10,8,.95)_0%,rgba(11,10,8,.25)_26%,rgba(42,26,18,.25)_60%,rgba(42,26,18,1)_100%)]" />
      <motion.div style={reduce ? undefined : { y: ty, scale: tsc }} className="relative flex h-full flex-col items-center justify-center px-5 pt-14 text-center">
        <Eyebrow center tone="text-[#efe8dc]/85">{t({ en: 'YTS Group · Tuscany', it: 'YTS Group · Toscana' })}</Eyebrow>
        <Display center cTone="text-[#f0d79e]" className="mt-5 text-[clamp(62px,19vw,92px)] [text-shadow:0_4px_40px_rgba(0,0,0,.35)] md:text-[clamp(96px,12.5vw,210px)]"
          lines={[['PALAZZO'], [{ i: 'Campani' }]]} />
        <motion.p initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1, ease: E, delay: .35 }}
          className={`${T.sans} mt-5 text-[12px] font-semibold uppercase tracking-[.26em] text-[#efe8dc]/85`}>{t(PALAZZO.place)}</motion.p>
        <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1, ease: E, delay: .5 }} className="mt-8">
          <Pill href="#palazzo-homes">{t({ en: 'The six residences', it: 'Le sei residenze' })}</Pill>
        </motion.div>
      </motion.div>
    </div>
  )
}

function Rooms() {
  const { t } = useLang()
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const p = useSpring(scrollYProgress, SOFT)
  const clip = useTransform(p, [0, .45], ['inset(14% 10% 14% 10% round 18px)', 'inset(0% 0% 0% 0% round 14px)'])
  const y = useTransform(p, [0, 1], ['-5%', '5%'])
  return (
    <div ref={ref} className="relative">
      <motion.div style={reduce ? undefined : { clipPath: clip }} className="relative aspect-[4/5] overflow-hidden rounded-[14px] md:aspect-[21/10]">
        <motion.div style={reduce ? undefined : { y, scale: 1.12 }} className="absolute inset-0">
          <Video name="frescoes" fallback={xl(148)} alt={t({ en: 'A frescoed room in Palazzo Campani', it: 'Una sala affrescata di Palazzo Campani' })} className="h-full w-full" pos="50% 45%" />
        </motion.div>
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/10" />
        <div className="absolute inset-x-5 bottom-5 flex flex-col gap-3 md:inset-x-9 md:bottom-8 md:flex-row md:items-end md:justify-between">
          <p className={`${D} yts-d text-[40px] md:text-[72px]`}>{t({ en: 'THE ROOMS', it: 'LE SALE' })} <span className={`${S} block text-[.5em] normal-case italic text-[#f0d79e] md:inline md:text-[.42em]`}>{t({ en: 'as they were painted', it: 'come furono dipinte' })}</span></p>
          <span className="text-[10.5px] font-semibold uppercase tracking-[.2em] text-[#efe8dc]/70">{t({ en: 'Photo · Palazzo Campani', it: 'Foto · Palazzo Campani' })}</span>
        </div>
      </motion.div>
    </div>
  )
}

function UnitRow({ u, f, i, hover, setHover }) {
  const { t } = useLang()
  const on = hover === u.n
  return (
    <motion.li initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .8, ease: E, delay: i * .06 }}
      onPointerEnter={() => setHover(u.n)} onPointerLeave={() => setHover(null)}
      className={`grid grid-cols-[52px_1fr_auto] items-center gap-4 border-b border-[#efe8dc]/12 py-4 transition-colors duration-500 md:grid-cols-[80px_1fr_220px_auto] md:gap-8 md:py-5 ${on ? 'bg-[#efe8dc]/[.04]' : ''}`}>
      <span className={`${D} text-[22px] font-[500] tabular-nums text-[#c3a15e] md:text-[26px]`}>{t({ en: 'AP.', it: 'APP.' })}{u.n}</span>
      <span>
        <span className={`${S} block text-[20px] leading-tight md:text-[24px]`}>{t(f.t)}</span>
        {u.r && <span className="mt-0.5 block text-[12.5px] text-[#efe8dc]/55">{t(u.r)}</span>}
      </span>
      <span className="relative hidden h-px bg-[#efe8dc]/12 md:block">
        <motion.span className="absolute inset-y-[-1px] left-0 block origin-left bg-[#c3a15e]" style={{ width: `${(u.m2 / MAX) * 100}%` }}
          initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1.4, ease: E, delay: .2 + i * .06 }} />
      </span>
      <span className={`${D} yts-d text-right text-[40px] tabular-nums md:text-[56px]`}>{u.m2}<span className={`${S} ml-1 align-[.6em] text-[.34em] normal-case italic text-[#d9bf86]`}>m²</span></span>
    </motion.li>
  )
}

function Table() {
  const { t } = useLang()
  const [hover, setHover] = useState(null)
  let k = 0
  return (
    <div>
      <ul className="border-t border-[#efe8dc]/15">
        {FLOORS.map(f => f.units.map(u => <UnitRow key={u.n} u={u} f={f} i={k++} hover={hover} setHover={setHover} />))}
      </ul>
      <div className="flex items-end justify-between gap-4 pt-6">
        <span className="text-[11px] font-semibold uppercase tracking-[.26em] text-[#efe8dc]/60">{t({ en: 'Six residences · total', it: 'Sei residenze · totale' })}</span>
        <span className={`${D} yts-d text-[64px] tabular-nums text-[#f0d79e] md:text-[96px]`}>{PALAZZO.total}<span className={`${S} ml-1.5 align-[.6em] text-[.32em] normal-case italic text-[#d9bf86]`}>m²</span></span>
      </div>
    </div>
  )
}

export default function Palazzo() {
  const { t } = useLang()
  return (
    <section id="palazzo" className={`relative isolate overflow-x-clip text-[#efe8dc] ${T.sans}`} style={{ background: ESP }} aria-label={PALAZZO.name}>
      <CineStyle />
      <Opening />
      <div className="mx-auto max-w-[1440px] px-5 pb-20 pt-12 md:px-10 md:pb-28 md:pt-16">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <p className={`${S} text-[27px] leading-[1.14] md:text-[38px] lg:col-span-8`}>{t(PALAZZO.lead)}</p>
          <p className="max-w-[36ch] border-l border-[#c3a15e]/50 pl-4 text-[13.5px] leading-relaxed text-[#efe8dc]/65 lg:col-span-4">{t(PALAZZO.credit)}</p>
        </div>
        <div className="mt-14 md:mt-20"><Rooms /></div>
        <div id="palazzo-homes" className="mt-16 grid scroll-mt-24 gap-12 md:mt-24 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4">
            <Eyebrow tone="text-[#c3a15e]">{t({ en: 'The residences', it: 'Le residenze' })}</Eyebrow>
            <Display cTone="text-[#f0d79e]" className="mt-5 text-[clamp(48px,13vw,64px)] md:text-[clamp(60px,5.4vw,92px)]"
              lines={t({ en: [['SIX HOMES'], [{ c: 'in' }, 'ONE PALAZZO']], it: [['SEI CASE'], [{ c: 'in' }, 'UN PALAZZO']] })} />
            <div className="mt-10">
              <p className="text-[11px] font-semibold uppercase tracking-[.28em] text-[#c3a15e]">{t({ en: 'Shared in the palazzo', it: 'Spazi del palazzo' })}</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {t(PALAZZO.extras).map((x, i) => (
                  <motion.li key={i} initial={{ opacity: 0, scale: .9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: .6, ease: E, delay: i * .05 }}
                    className="rounded-full border border-[#efe8dc]/20 px-4 py-2 text-[13.5px] text-[#efe8dc]/85">{x}</motion.li>
                ))}
              </ul>
            </div>
          </div>
          <div className="lg:col-span-8"><Table /></div>
        </div>
        <div className="mt-16 flex flex-col gap-6 rounded-[14px] border border-[#efe8dc]/12 bg-[#0b0a08]/25 p-6 md:mt-20 md:flex-row md:items-center md:justify-between md:p-9">
          <div className="flex items-start gap-5">
            <svg aria-hidden width="44" height="44" viewBox="0 0 44 44" fill="none" stroke="#c3a15e" strokeWidth="1" className="mt-1 shrink-0"><path d="M6 10h32v26H6z M6 16h32 M12 22h14 M12 27h20 M12 32h10" /></svg>
            <p className={`${S} max-w-[52ch] text-[21px] leading-[1.25] md:text-[25px]`}>{t(PALAZZO.archive)}</p>
          </div>
          <Pill href="#contact" onClick={() => ask('palazzo')} className="shrink-0 self-start md:self-auto">{t({ en: 'Request the archive', it: 'Richiedi l’archivio' })}</Pill>
        </div>
      </div>
      {/* hand-off into the dark Works chapter: no edge */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[28vh] bg-gradient-to-b from-[#2a1a12]/0 to-[#0b0a08]" />
    </section>
  )
}
