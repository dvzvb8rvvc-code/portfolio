import React, { useEffect, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useLite } from '../../lib/kit'
import { useLang } from './i18n'
import { useStage, stage } from './engine'
import { COMO, SARDEGNA, T, img } from './data'

/* COMO (v3) — DOM only. The lake film lives in sceneComo.jsx on the shared canvas (engine.jsx).
   The film wrapper is transparent so the canvas shows through; the sticky overlay carries type and
   the scene-anchored labels (sceneComo projects the anchors and writes transform/opacity directly). */

const E = [0.16, 1, 0.3, 1]
const S = {
  eyebrow: { en: 'Residences · Lake Como', it: 'Residenze · Lago di Como' },
  place: { en: 'Perledo · Lake Como · Italy', it: 'Perledo · Lago di Como · Italia' },
  c1a: { en: 'Above Varenna,', it: 'Sopra Varenna,' },
  c1b: { en: 'on the Scenic Route.', it: 'lungo la strada panoramica.' },
  c2a: { en: 'The Golden Triangle', it: 'Il Triangolo d’Oro' },
  c2b: { en: 'from your garden.', it: 'dal tuo giardino.' },
  c3a: { en: 'Terraced homes,', it: 'Case a terrazze,' },
  c3b: { en: 'each with its garden.', it: 'ognuna col suo giardino.' },
  render: { en: 'Render · Il Giardino di Teodolinda', it: 'Render · Il Giardino di Teodolinda' },
  photo: { en: 'Photo from the site · Perledo', it: 'Foto dal cantiere · Perledo' },
  tod: { en: ['Afternoon', 'Golden hour'], it: ['Pomeriggio', 'Ora dorata'] },
  varenna: { en: 'Varenna', it: 'Varenna' }, varennaSub: { en: '7–10 min', it: '7–10 min' },
  bellagio: { en: 'Bellagio', it: 'Bellagio' }, bellagioSub: { en: 'across the lake', it: 'sull’altra sponda' },
  tri: { en: 'Golden Triangle', it: 'Triangolo d’Oro' }, triSub: { en: 'Vezio · Bellagio · Menaggio · Cadenabbia', it: 'Vezio · Bellagio · Menaggio · Cadenabbia' },
  home: { en: 'Il Giardino di Teodolinda', it: 'Il Giardino di Teodolinda' }, homeSub: { en: 'Perledo', it: 'Perledo' },
  every: { en: 'Every home includes', it: 'Ogni casa include' },
  range: { en: 'Sizes across the residences', it: 'Superfici nelle residenze' },
  small: { en: 'Smallest', it: 'Più piccola' }, large: { en: 'Largest', it: 'Più grande' },
  home2: { en: 'Home · built area', it: 'Casa · superficie' }, garden: { en: 'Private garden', it: 'Giardino privato' },
  rangeNote: { en: 'Home and garden sizes vary independently from unit to unit — details on request.', it: 'Superficie della casa e del giardino variano in modo indipendente da unità a unità — dettagli su richiesta.' },
  phases: { en: 'Building it — phase by phase', it: 'Il cantiere — fase per fase' },
  founder: { en: 'Yehiel Tsubery on site', it: 'Yehiel Tsubery in cantiere' },
  site: { en: 'Construction · Perledo', it: 'Cantiere · Perledo' },
  next: { en: 'Next', it: 'Prossimo' },
  inquire: { en: 'Ask about availability', it: 'Chiedi la disponibilità' },
  alt: { en: 'Lake Como seen from the hillside above Varenna', it: 'Il Lago di Como visto dalla collina sopra Varenna' },
}

/* ───────────── film overlay bits ───────────── */
function KLine({ p, a, b, children, className = '' }) {
  const y = useTransform(p, b >= 1 ? [a, a + .05, 1] : [a, a + .05, b - .05, b], b >= 1 ? ['110%', '0%', '0%'] : ['110%', '0%', '0%', '-110%'])
  return <span className="block overflow-hidden pb-[.08em]"><motion.span className={`block will-change-transform ${className}`} style={{ y }}>{children}</motion.span></span>
}
function Caption({ p, a, b, l1, l2, className = '' }) {
  return (
    <div className={`pointer-events-none absolute z-20 ${className}`}>
      <p className={`${T.serif} text-[clamp(32px,9vw,38px)] leading-[.96] text-[#efe8dc] [text-shadow:0_2px_30px_rgba(0,0,0,.35)] md:text-[clamp(46px,4.4vw,74px)]`}>
        <KLine p={p} a={a} b={b}>{l1}</KLine>
        <KLine p={p} a={a + .02} b={b} className="italic text-[#d9bd84]">{l2}</KLine>
      </p>
    </div>
  )
}
function Label({ k, title, sub, gold, reg }) {
  return (
    <div ref={el => (reg.current[k] = el)} style={{ opacity: 0 }} className="pointer-events-none absolute left-0 top-0 z-10 flex flex-col items-center whitespace-nowrap will-change-transform">
      <span className={`${T.serif} italic leading-none [text-shadow:0_1px_16px_rgba(0,0,0,.45)] ${gold ? 'text-[26px] text-[#d9bd84] md:text-[30px]' : 'text-[22px] text-[#efe8dc] md:text-[24px]'}`}>{title}</span>
      {sub && <span className={`${T.sans} mt-1.5 text-[11px] font-semibold uppercase tracking-[.16em] text-[#efe8dc]/85 [text-shadow:0_1px_10px_rgba(0,0,0,.6)] md:tracking-[.2em]`}>{sub}</span>}
      <span className="mt-2 block h-9 w-px bg-gradient-to-b from-[#efe8dc] to-[#efe8dc]/0" />
      <span className="-mt-px block h-[7px] w-[7px] rounded-full border border-[#c3a15e] shadow-[0_0_12px_rgba(195,161,94,.9)]" />
    </div>
  )
}
function Tod({ p }) {
  const { t } = useLang()
  const x = useTransform(p, [0, 1], ['0%', '100%'])
  const o = useTransform(p, [.92, .98], [1, 0]) // QA: gone before the film releases (no chrome over the dark tail)
  const names = t(S.tod)
  return (
    <motion.div style={{ opacity: o }} className={`${T.sans} pointer-events-none absolute bottom-[34px] left-5 z-30 w-[min(200px,48vw)] whitespace-nowrap text-[11px] font-semibold uppercase tracking-[.16em] text-[#efe8dc]/75 md:bottom-10 md:left-10 md:w-[220px] md:tracking-[.18em]`}>
      <div className="mb-2 flex justify-between gap-3"><span>{names[0]}</span><span className="text-[#c3a15e]">{names[1]}</span></div>
      <div className="relative h-px bg-[#efe8dc]/25">
        <motion.span style={{ left: x }} className="absolute -top-[3.5px] -ml-1 block h-2 w-2 rounded-full bg-[#c3a15e] shadow-[0_0_14px_#c3a15e]" />
      </div>
    </motion.div>
  )
}
function Skip({ p, target }) {
  const { t } = useLang()
  const o = useTransform(p, [.86, .96], [1, 0])
  const go = () => { const el = target.current; if (!el) return; const y = el.getBoundingClientRect().top + scrollY - 64; window.__lenis ? window.__lenis.scrollTo(y, { duration: 1.4 }) : scrollTo({ top: y, behavior: 'smooth' }) }
  return (
    <motion.button style={{ opacity: o }} onClick={go} className={`${T.sans} absolute bottom-5 right-4 z-40 h-11 rounded-full border border-[#efe8dc]/25 bg-[#0b0a08]/30 px-5 text-[11px] font-semibold uppercase tracking-[.16em] text-[#efe8dc] backdrop-blur-md transition-colors hover:border-[#c3a15e] hover:text-[#c3a15e] md:bottom-8 md:right-10 md:text-[12px]`}>
      {t('skip')} <span aria-hidden>↓</span>
    </motion.button>
  )
}

function Film({ after }) {
  const { t, lang } = useLang()
  const lite = useLite()
  const ref = useRef()
  useStage('como', ref)
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const labels = useRef({})
  useEffect(() => { stage.labels = stage.labels || {}; stage.labels.como = labels.current; return () => { if (stage.labels?.como === labels.current) delete stage.labels.como } }, [])
  const titleY = useTransform(p, [0, .2], [0, -60])
  const titleO = useTransform(p, [.1, .2], [1, 0])
  const imgS = useTransform(p, [0, 1], [1.04, 1.18])
  const renderO = useTransform(p, [.7, .8], [0, 1])
  const renderCapO = useTransform(p, [.86, .9, .93, .98], [0, 1, 1, 0]) // QA: caption leaves before the tail
  return (
    <div ref={ref} className="relative h-[150vh] md:h-[220vh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {lite && <>
          <motion.img src={img(129)} alt={t(S.alt)} style={{ scale: imgS }} className="absolute inset-0 h-full w-full object-cover [filter:saturate(.85)_sepia(.12)_brightness(.86)_contrast(1.05)]" />
          {/* lite only: grade/vignette in CSS (the WebGL film does this in its shaders) */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_45%,transparent_50%,rgba(11,10,8,.55))]" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[38%] bg-gradient-to-b from-[#0b0a08]/70 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-[#0b0a08] to-transparent" />
        </>}

        {!lite && (
          <motion.div style={{ opacity: renderO }} className="pointer-events-none absolute inset-0 [html[data-como-ready]_&]:hidden">
            <img src={img(140)} alt="" decoding="async" className="h-full w-full object-cover [filter:saturate(.86)_sepia(.12)_brightness(.85)_contrast(1.05)]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0a08] via-transparent to-[#0b0a08]/50" />
          </motion.div>
        )}
        {!lite && <>
          <Label key={"varenna"+lang} k="varenna" reg={labels} title={t(S.varenna)} sub={t(S.varennaSub)} />
          <Label key={"bellagio"+lang} k="bellagio" reg={labels} title={t(S.bellagio)} sub={t(S.bellagioSub)} />
          <Label key={"triangle"+lang} k="triangle" reg={labels} title={t(S.tri)} sub={t(S.triSub)} />
          <Label key={"home"+lang} k="home" reg={labels} title={t(S.home)} sub={t(S.homeSub)} gold />
        </>}

        <motion.div style={{ y: titleY, opacity: titleO }} className="absolute inset-x-0 top-[92px] z-20 md:top-[110px]">
          <div className="mx-auto max-w-[1440px] px-5 md:px-10">
            <motion.p initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .9, ease: E }} className={`${T.sans} mb-4 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[.24em] text-[#efe8dc]/80 md:text-[12px]`}><span className="h-px w-8 bg-[#c3a15e]" />{t(S.eyebrow)}</motion.p>
            <h2 className={`${T.serif} max-w-[12ch] text-[clamp(44px,13vw,52px)] leading-[.88] tracking-[-.015em] text-[#efe8dc] [text-shadow:0_2px_40px_rgba(0,0,0,.3)] md:text-[clamp(76px,8.4vw,140px)]`}>
              {['Il Giardino', 'di Teodolinda'].map((l, i) => (
                <span key={i} className="block overflow-hidden pb-[.06em]">
                  <motion.span initial={{ y: '105%' }} whileInView={{ y: '0%' }} viewport={{ once: true }} transition={{ duration: 1.2, ease: E, delay: .1 + i * .1 }} className={`block ${i ? 'italic text-[#d9bd84]' : ''}`}>{l}</motion.span>
                </span>
              ))}
            </h2>
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1, delay: .45 }} className={`${T.sans} mt-5 text-[11px] font-medium uppercase tracking-[.2em] text-[#efe8dc]/75 md:text-[13px]`}>{t(S.place)}</motion.p>
          </div>
        </motion.div>

        <Caption p={p} a={.22} b={.44} l1={t(S.c1a)} l2={t(S.c1b)} className="bottom-[150px] left-5 md:bottom-[18%] md:left-10" />
        <Caption p={p} a={.4} b={.6} l1={t(S.c2a)} l2={t(S.c2b)} className="bottom-[150px] right-5 text-right md:bottom-[18%] md:right-10" />
        <Caption p={p} a={.66} b={.98} l1={t(S.c3a)} l2={t(S.c3b)} className="bottom-[150px] left-5 md:bottom-[16%] md:left-10" />
        <motion.p style={{ opacity: renderCapO }} className={`${T.sans} pointer-events-none absolute bottom-[112px] left-5 z-20 text-[11px] font-semibold uppercase tracking-[.18em] text-[#efe8dc]/70 md:bottom-[11%] md:left-10`}>{t(S.render)}</motion.p>

        <Tod p={p} />
        <Skip p={p} target={after} />
      </div>
    </div>
  )
}

/* ───────────── details: one tight block ───────────── */
function Reveal({ children, className = '', d = 0 }) {
  return <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '0px 0px -10% 0px' }} transition={{ duration: 1, ease: E, delay: d }} className={className}>{children}</motion.div>
}

const GRADE = '[filter:saturate(.86)_sepia(.1)_brightness(.9)_contrast(1.05)]'
const lbl = `${T.sans} text-[11px] font-semibold uppercase tracking-[.22em]`

const RANGES = [{ k: 'home2', lo: 35, hi: 95 }, { k: 'garden', lo: 25, hi: 160 }]
const SCALE_MAX = 160
function RangeBar({ r, i }) {
  const { t } = useLang()
  const gold = i === 1
  return (
    <div className="border-t border-[#efe8dc]/[.12] pt-4">
      <div className="flex items-baseline justify-between gap-3">
        <span className={`${lbl} ${gold ? 'text-[#c3a15e]' : 'text-[#efe8dc]/60'}`}>{t(S[r.k])}</span>
        <span className={`${T.serif} whitespace-nowrap text-[44px] leading-none tabular-nums md:text-[52px] ${gold ? 'italic text-[#c3a15e]' : ''}`}>{r.lo}–{r.hi}<span className={`${T.sans} ml-1.5 text-[13px] font-semibold not-italic ${gold ? 'text-[#c3a15e]/75' : 'text-[#efe8dc]/55'}`}>m²</span></span>
      </div>
      <div className="relative mt-3 h-[6px] rounded-full bg-[#efe8dc]/[.08]" aria-hidden>
        <motion.span initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1.2, ease: E, delay: .15 + i * .12 }}
          className={`absolute inset-y-0 origin-left rounded-full ${gold ? 'bg-[#c3a15e]' : 'bg-[#efe8dc]'}`} style={{ left: (r.lo / SCALE_MAX * 100) + '%', width: ((r.hi - r.lo) / SCALE_MAX * 100) + '%' }} />
      </div>
    </div>
  )
}
function Range() {
  const { t } = useLang()
  return (
    <div className="flex h-full flex-col rounded-[20px] border border-[#efe8dc]/[.12] bg-[#14120f] p-5 text-[#efe8dc] md:p-6">
      <p className={`${lbl} mb-4 text-[#efe8dc]/55`}>{t(S.range)}</p>
      <div className="grid gap-5">{RANGES.map((r, i) => <RangeBar key={r.k} r={r} i={i} />)}</div>
      <div className={`${T.sans} mt-2 flex justify-between text-[11px] tabular-nums text-[#efe8dc]/35`} aria-hidden><span>0</span><span>{SCALE_MAX} m²</span></div>
      <div className="relative mt-5 aspect-[16/9] overflow-hidden rounded-[12px] lg:aspect-auto lg:min-h-[150px] lg:flex-1">
        <img src={img(95, true)} alt={t(S.render)} loading="lazy" decoding="async" width="720" height="405" className={`absolute inset-0 h-full w-full object-cover ${GRADE}`} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0a08]/50 to-transparent" />
      </div>
      <p className={`${T.sans} mt-3 text-[13px] leading-snug text-[#efe8dc]/55`}>{t(S.rangeNote)}</p>
    </div>
  )
}

const SITE = [[135, S.site], [138, S.site], [130, S.site], [104, S.founder]]
function Details({ innerRef }) {
  const { t } = useLang()
  const every = t(COMO.every)
  return (
    <div ref={innerRef} className="relative z-10 bg-[#0b0a08] pb-14 pt-6 text-[#efe8dc] md:pb-20 md:pt-12">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        {/* lead + facts */}
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
          <Reveal className="lg:col-span-5">
            <p className={`${lbl} flex items-center gap-3 text-[#c3a15e]`}><span className="h-px w-8 bg-[#c3a15e]" />{COMO.name}</p>
            <p className={`${T.serif} mt-4 text-[27px] leading-[1.1] md:text-[clamp(30px,2.6vw,40px)] md:leading-[1.06]`}>{t(COMO.lead)}</p>
            <p className={`${T.sans} mt-5 text-[15px] leading-relaxed text-[#efe8dc]/60`}>{t(COMO.views)}</p>
          </Reveal>
          <Reveal d={.06} className="lg:col-span-7 lg:pt-9">
            <dl className="grid grid-cols-2 border-t border-[#efe8dc]/[.12] lg:grid-cols-4">
              {COMO.facts.map((f, k) => (
                <div key={k} className={`border-b border-[#efe8dc]/[.12] py-5 md:border-b-0 md:py-6 ${k % 2 ? 'pl-5' : 'pr-5'} ${k % 2 ? 'border-l md:border-l' : ''} md:px-5 ${k === 0 ? 'md:pl-0' : 'md:border-l'} border-[#efe8dc]/[.12]`}>
                  <dd className={`${T.serif} whitespace-nowrap text-[40px] leading-none tabular-nums lg:text-[clamp(40px,3.6vw,56px)]`}>{f.v}<span className={`${T.sans} ml-1 text-[13px] font-semibold text-[#c3a15e]`}>{f.u}</span></dd>
                  <dt className={`${T.sans} mt-2 text-[13px] leading-snug text-[#efe8dc]/60`}>{t(f.l)}</dt>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        {/* includes + range */}
        <div className="mt-10 grid gap-8 md:mt-14 md:grid-cols-2 md:gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <p className={`${lbl} text-[#efe8dc]/55`}>{t(S.every)}</p>
            <ul className="mt-3">
              {every.map((x, k) => (
                <li key={k} className="flex items-baseline gap-4 border-b border-[#efe8dc]/[.12] py-3.5">
                  <span className={`${T.sans} w-5 shrink-0 text-[11px] font-semibold tabular-nums text-[#c3a15e]`}>{String(k + 1).padStart(2, '0')}</span>
                  <span className={`${T.serif} text-[21px] leading-tight md:text-[23px]`}>{x}</span>
                </li>
              ))}
            </ul>
            <p className={`${T.sans} mt-5 text-[15px] leading-relaxed text-[#efe8dc]/60`}>{t(COMO.model)}</p>
          </Reveal>
          <Reveal d={.08} className="lg:col-span-7"><Range /></Reveal>
        </div>

        {/* build phases: one row of steps + real site photos */}
        <Reveal className="mt-14 md:mt-20">
          <div className="flex items-end justify-between gap-4">
            <p className={`${T.serif} text-[32px] leading-none md:text-[44px]`}>{t(S.phases)}</p>
            <a href="#contact" className={`${T.sans} hidden h-11 shrink-0 items-center rounded-full border border-[#c3a15e]/60 px-6 text-[13px] font-semibold text-[#efe8dc] transition-colors hover:bg-[#c3a15e] hover:text-[#0b0a08] md:inline-flex`}>{t(S.inquire)} →</a>
          </div>
          <ol className={`${T.sans} mt-6 grid grid-cols-2 gap-x-5 border-t border-[#efe8dc]/[.12] md:mt-8 md:flex md:gap-0 md:border-t-0`}>
            {t(COMO.phases).map((ph, k, a) => (
              <li key={k} className="relative flex items-baseline gap-3 border-b border-[#efe8dc]/[.12] py-3 md:block md:flex-1 md:border-b-0 md:py-0 md:pr-3">
                <div className="hidden items-center gap-2 md:flex">
                  <span className={`block h-2 w-2 shrink-0 rounded-full ${k === a.length - 1 ? 'bg-[#c3a15e] shadow-[0_0_12px_#c3a15e]' : 'border border-[#c3a15e] bg-[#0b0a08]'}`} />
                  {k < a.length - 1 && <span className="block h-px flex-1 bg-gradient-to-r from-[#c3a15e]/60 to-[#efe8dc]/15" />}
                </div>
                <div className="text-[11px] font-semibold tabular-nums tracking-[.16em] text-[#c3a15e] md:mt-3">{String(k + 1).padStart(2, '0')}</div>
                <div className="text-[15px] font-medium leading-tight text-[#efe8dc] md:mt-1 md:text-[14px]">{ph}</div>
              </li>
            ))}
          </ol>
          <div className="mt-7 grid grid-cols-2 gap-2.5 md:mt-8 md:grid-cols-4 md:gap-4">
            {SITE.map(([id, cap]) => (
              <figure key={id} className="group">
                <div className="aspect-[4/3] overflow-hidden rounded-[12px] bg-[#14120f] md:aspect-[3/2]">
                  <img src={img(id, true)} alt={t(cap)} loading="lazy" decoding="async" width="720" height="480" className={`h-full w-full object-cover ${GRADE} transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04]`} />
                </div>
                <figcaption className={`${T.sans} mt-2 text-[12px] leading-snug ${id === 104 ? 'font-semibold text-[#c3a15e]' : 'text-[#efe8dc]/55'}`}>{t(cap)}</figcaption>
              </figure>
            ))}
          </div>
          <p className={`${T.sans} mt-6 max-w-[70ch] text-[15px] leading-relaxed text-[#efe8dc]/60`}>{t(COMO.phasesNote)}</p>
          <a href="#contact" className={`${T.sans} mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-[#c3a15e] text-[14px] font-semibold text-[#0b0a08] md:hidden`}>{t(S.inquire)} →</a>
        </Reveal>

        {/* next: Sardegna */}
        <div className="mt-12 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[#efe8dc]/[.12] pt-6 md:mt-16">
          <span className={`${lbl} w-full text-[#efe8dc]/45 md:w-auto`}>{t(S.next)}</span>
          <span className={`${T.serif} text-[30px] leading-none md:text-[34px]`}>{SARDEGNA.name}</span>
          <span className={`${T.sans} text-[14px] text-[#efe8dc]/55`}>{t(SARDEGNA.place)}</span>
          <span className={`${T.sans} rounded-full border border-[#c3a15e]/50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[.16em] text-[#c3a15e]`}>{t(SARDEGNA.note)}</span>
        </div>
      </div>
    </div>
  )
}

export default function Como() {
  const after = useRef()
  return (
    <section id="como" className="relative">
      <Film after={after} />
      <Details innerRef={after} />
    </section>
  )
}
