import React, { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, animate, useMotionValue } from 'framer-motion'
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
  range: { en: 'From the smallest to the largest home', it: 'Dalla casa più piccola alla più grande' },
  small: { en: 'Smallest', it: 'Più piccola' }, large: { en: 'Largest', it: 'Più grande' },
  home2: { en: 'home', it: 'casa' }, garden: { en: 'garden', it: 'giardino' },
  rangeNote: { en: 'The two ends of the range. Every size in between — on request.', it: 'I due estremi della gamma. Ogni taglio intermedio — su richiesta.' },
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
      <p className={`${T.serif} text-[36px] leading-[.96] text-white [text-shadow:0_2px_30px_rgba(0,0,0,.25)] md:text-[clamp(46px,4.4vw,74px)]`}>
        <KLine p={p} a={a} b={b}>{l1}</KLine>
        <KLine p={p} a={a + .02} b={b} className="italic text-[#f3dca6]">{l2}</KLine>
      </p>
    </div>
  )
}
function Label({ k, title, sub, gold, reg }) {
  return (
    <div ref={el => (reg.current[k] = el)} style={{ opacity: 0 }} className="pointer-events-none absolute left-0 top-0 z-10 flex flex-col items-center whitespace-nowrap will-change-transform">
      <span className={`${T.serif} italic leading-none [text-shadow:0_1px_16px_rgba(0,0,0,.45)] ${gold ? 'text-[26px] text-[#f3dca6] md:text-[30px]' : 'text-[21px] text-white md:text-[24px]'}`}>{title}</span>
      {sub && <span className={`${T.sans} mt-1.5 text-[9.5px] font-semibold uppercase tracking-[.2em] text-white/85 [text-shadow:0_1px_10px_rgba(0,0,0,.5)] md:text-[10.5px]`}>{sub}</span>}
      <span className="mt-2 block h-9 w-px bg-gradient-to-b from-white to-white/0" />
      <span className="-mt-px block h-[7px] w-[7px] rounded-full border border-white shadow-[0_0_12px_rgba(255,220,170,.9)]" />
    </div>
  )
}
function Tod({ p }) {
  const { t } = useLang()
  const x = useTransform(p, [0, 1], ['0%', '100%'])
  const names = t(S.tod)
  return (
    <div className={`${T.sans} pointer-events-none absolute bottom-6 left-5 z-30 w-[150px] text-[10px] font-semibold uppercase tracking-[.18em] text-white/80 md:bottom-8 md:left-10 md:w-[220px] md:text-[11px]`}>
      <div className="mb-2 flex justify-between"><span>{names[0]}</span><span className="text-[#f3dca6]">{names[1]}</span></div>
      <div className="relative h-px bg-white/30">
        <motion.span style={{ left: x }} className="absolute -top-[3.5px] -ml-1 block h-2 w-2 rounded-full bg-[#f3dca6] shadow-[0_0_14px_#f3c27a]" />
      </div>
    </div>
  )
}
function Skip({ p, target }) {
  const { t } = useLang()
  const o = useTransform(p, [.86, .96], [1, 0])
  const go = () => { const el = target.current; if (!el) return; const y = el.getBoundingClientRect().top + scrollY - 64; window.__lenis ? window.__lenis.scrollTo(y, { duration: 1.4 }) : scrollTo({ top: y, behavior: 'smooth' }) }
  return (
    <motion.button style={{ opacity: o }} onClick={go} className={`${T.sans} absolute bottom-6 right-5 z-40 h-9 rounded-full border border-white/30 bg-black/20 px-4 text-[11px] font-semibold uppercase tracking-[.14em] text-white backdrop-blur-md transition-colors hover:bg-white hover:text-[#151412] md:bottom-8 md:right-10 md:h-10 md:text-[12px]`}>
      {t('skip')} <span aria-hidden>↓</span>
    </motion.button>
  )
}

function Film({ after }) {
  const { t } = useLang()
  const lite = useLite()
  const ref = useRef()
  useStage('como', ref)
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const labels = useRef({})
  useEffect(() => { stage.labels = stage.labels || {}; stage.labels.como = labels.current; return () => { if (stage.labels?.como === labels.current) delete stage.labels.como } }, [])
  const titleY = useTransform(p, [0, .2], [0, -60])
  const titleO = useTransform(p, [.1, .2], [1, 0])
  const imgS = useTransform(p, [0, 1], [1.04, 1.18])
  const renderO = useTransform(p, [.86, .92], [0, 1])
  return (
    <div ref={ref} className="relative h-[220vh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {lite && (
          <motion.img src={img(129)} alt={t(S.alt)} style={{ scale: imgS }} className="absolute inset-0 h-full w-full object-cover" />
        )}
        {/* legibility + vignette (CSS instead of a post pass) */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_45%,transparent_55%,rgba(10,14,18,.38))]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[38%] bg-gradient-to-b from-black/30 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[30%] bg-gradient-to-t from-black/35 to-transparent" />

        {!lite && <>
          <Label k="varenna" reg={labels} title={t(S.varenna)} sub={t(S.varennaSub)} />
          <Label k="bellagio" reg={labels} title={t(S.bellagio)} sub={t(S.bellagioSub)} />
          <Label k="triangle" reg={labels} title={t(S.tri)} sub={t(S.triSub)} />
          <Label k="home" reg={labels} title={t(S.home)} sub={t(S.homeSub)} gold />
        </>}

        <motion.div style={{ y: titleY, opacity: titleO }} className="absolute inset-x-0 top-[92px] z-20 md:top-[110px]">
          <div className="mx-auto max-w-[1440px] px-5 md:px-10">
            <motion.p initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .9, ease: E }} className={`${T.sans} mb-4 flex items-center gap-3 text-[10.5px] font-semibold uppercase tracking-[.24em] text-white/85 md:text-[12px]`}><span className="h-px w-8 bg-white/60" />{t(S.eyebrow)}</motion.p>
            <h2 className={`${T.serif} max-w-[12ch] text-[50px] leading-[.88] tracking-[-.015em] text-white [text-shadow:0_2px_40px_rgba(0,0,0,.25)] md:text-[clamp(76px,8.4vw,140px)]`}>
              {['Il Giardino', 'di Teodolinda'].map((l, i) => (
                <span key={i} className="block overflow-hidden pb-[.06em]">
                  <motion.span initial={{ y: '105%' }} whileInView={{ y: '0%' }} viewport={{ once: true }} transition={{ duration: 1.2, ease: E, delay: .1 + i * .1 }} className={`block ${i ? 'italic text-[#f3dca6]' : ''}`}>{l}</motion.span>
                </span>
              ))}
            </h2>
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1, delay: .45 }} className={`${T.sans} mt-5 text-[12px] font-medium uppercase tracking-[.2em] text-white/80 md:text-[13px]`}>{t(S.place)}</motion.p>
          </div>
        </motion.div>

        <Caption p={p} a={.22} b={.44} l1={t(S.c1a)} l2={t(S.c1b)} className="bottom-[22%] left-5 md:bottom-[18%] md:left-10" />
        <Caption p={p} a={.44} b={.68} l1={t(S.c2a)} l2={t(S.c2b)} className="bottom-[22%] right-5 text-right md:bottom-[18%] md:right-10" />
        <Caption p={p} a={.8} b={1.06} l1={t(S.c3a)} l2={t(S.c3b)} className="bottom-[20%] left-5 md:bottom-[16%] md:left-10" />
        <motion.p style={{ opacity: renderO }} className={`${T.sans} pointer-events-none absolute bottom-[14%] left-5 z-20 text-[10px] font-semibold uppercase tracking-[.2em] text-white/75 md:bottom-[11%] md:left-10 md:text-[11px]`}>{t(S.render)}</motion.p>

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
function Count({ to, className }) {
  const mv = useMotionValue(to), ref = useRef(), first = useRef(true)
  useEffect(() => mv.on('change', v => { if (ref.current) ref.current.textContent = Math.round(v) }), [])
  useEffect(() => { if (first.current) { first.current = false; return } const c = animate(mv, to, { duration: .9, ease: E }); return c.stop }, [to])
  return <span ref={ref} className={className}>{to}</span>
}

const ENDS = [{ h: 35, g: 25 }, { h: 95, g: 160 }]
function Range() {
  const { t } = useLang()
  const [i, setI] = useState(0)
  const e = ENDS[i]
  const px = v => Math.sqrt(v / 160) * 100 // side ∝ √area, garden 160 m² = 100%
  return (
    <div className="flex h-full flex-col rounded-[22px] bg-[#151412] p-5 text-[#ece7df] md:p-6">
      <div className="flex items-center justify-between gap-3">
        <p className={`${T.sans} text-[10.5px] font-semibold uppercase tracking-[.2em] text-[#ece7df]/60`}>{t(S.range)}</p>
      </div>
      <div role="radiogroup" className={`${T.sans} relative mt-4 grid grid-cols-2 rounded-full bg-white/10 p-1 text-[12px] font-semibold`}>
        <motion.span className="absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-[#ece7df]" animate={{ x: i ? '100%' : '0%' }} transition={{ type: 'spring', stiffness: 420, damping: 38 }} />
        {[S.small, S.large].map((l, k) => (
          <button key={k} role="radio" aria-checked={i === k} onClick={() => setI(k)} className={`relative z-10 h-9 rounded-full transition-colors duration-300 ${i === k ? 'text-[#151412]' : 'text-[#ece7df]/75'}`}>{t(l)}</button>
        ))}
      </div>
      <div className="mt-5 grid grid-cols-[1fr_auto] items-end gap-4">
        <div className={`${T.serif} leading-none`}>
          <div className="text-[56px] md:text-[64px]"><Count to={e.h} /><span className={`${T.sans} ml-1 text-[14px] font-semibold text-[#ece7df]/60`}>m² {t(S.home2)}</span></div>
          <div className="mt-1 text-[56px] italic text-[#c3a15e] md:text-[64px]">+<Count to={e.g} /><span className={`${T.sans} ml-1 text-[14px] font-semibold not-italic text-[#c3a15e]/70`}>m² {t(S.garden)}</span></div>
        </div>
        {/* plan glyph: garden square with the home inside, sides ∝ √area */}
        <div className="relative h-[104px] w-[104px]">
          <motion.div className="absolute bottom-0 left-0 rounded-[4px] border border-[#c3a15e]/70 bg-[#c3a15e]/15" animate={{ width: px(e.g) + '%', height: px(e.g) + '%' }} transition={{ duration: .9, ease: E }} />
          <motion.div className="absolute bottom-0 left-0 rounded-[3px] bg-[#ece7df]" animate={{ width: px(e.h) + '%', height: px(e.h) + '%' }} transition={{ duration: .9, ease: E }} />
        </div>
      </div>
      <div className="relative mt-5 min-h-[150px] flex-1 overflow-hidden rounded-[14px]">
        <img src={img(95, true)} alt={t(S.render)} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
      </div>
      <p className={`${T.sans} mt-3 text-[12px] leading-snug text-[#ece7df]/55`}>{t(S.rangeNote)}</p>
    </div>
  )
}

const SITE = [[135, S.site], [138, S.site], [130, S.site], [104, S.founder]]
function Details({ innerRef }) {
  const { t } = useLang()
  const every = t(COMO.every)
  return (
    <div ref={innerRef} className="relative z-10 bg-[#ece7df] pb-16 pt-14 md:pb-24 md:pt-20">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <div className="grid gap-8 md:grid-cols-12 md:gap-8">
          <Reveal className="md:col-span-5">
            <p className={`${T.sans} text-[11px] font-semibold uppercase tracking-[.22em] text-[#151412]/55`}>{COMO.name}</p>
            <p className={`${T.serif} mt-3 text-[28px] leading-[1.06] md:text-[clamp(30px,2.6vw,40px)]`}>{t(COMO.lead)}</p>
            <div className="mt-7 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-[#151412]/15 pt-6">
              {COMO.facts.map((f, k) => (
                <div key={k}>
                  <div className={`${T.serif} text-[44px] leading-none tabular-nums md:text-[54px]`}>{f.v}<span className={`${T.sans} ml-1 text-[13px] font-semibold text-[#151412]/50`}>{f.u}</span></div>
                  <div className={`${T.sans} mt-1.5 text-[12.5px] text-[#151412]/65`}>{t(f.l)}</div>
                </div>
              ))}
            </div>
            <p className={`${T.sans} mt-6 text-[13px] leading-relaxed text-[#151412]/60`}>{t(COMO.views)}</p>
          </Reveal>
          <Reveal d={.08} className="md:col-span-3">
            <p className={`${T.sans} text-[11px] font-semibold uppercase tracking-[.22em] text-[#151412]/55`}>{t(S.every)}</p>
            <ul className="mt-4">
              {every.map((x, k) => (
                <li key={k} className="flex items-baseline gap-3 border-b border-[#151412]/12 py-3">
                  <span className={`${T.sans} text-[10.5px] font-semibold tabular-nums text-[#b06a35]`}>{String(k + 1).padStart(2, '0')}</span>
                  <span className={`${T.serif} text-[21px] leading-tight md:text-[22px]`}>{x}</span>
                </li>
              ))}
            </ul>
            <p className={`${T.sans} mt-4 text-[12.5px] leading-relaxed text-[#151412]/60`}>{t(COMO.model)}</p>
          </Reveal>
          <Reveal d={.16} className="md:col-span-4"><Range /></Reveal>
        </div>

        {/* build phases: one row of labels + real site photos */}
        <Reveal className="mt-14 md:mt-16">
          <div className="flex items-end justify-between gap-4">
            <p className={`${T.serif} text-[30px] leading-none md:text-[40px]`}>{t(S.phases)}</p>
            <a href="#contact" className={`${T.sans} hidden h-10 shrink-0 items-center rounded-full bg-[#151412] px-5 text-[12.5px] font-semibold text-[#ece7df] md:inline-flex`}>{t(S.inquire)} →</a>
          </div>
          <ol className={`${T.sans} relative mt-6 flex gap-1 overflow-x-auto pb-1 [scrollbar-width:none] md:gap-0`}>
            {t(COMO.phases).map((ph, k, a) => (
              <li key={k} className="relative min-w-[110px] flex-1 pr-3">
                <div className="flex items-center gap-2">
                  <span className="block h-2 w-2 shrink-0 rounded-full bg-[#b06a35]" />
                  {k < a.length - 1 && <span className="block h-px flex-1 bg-[#151412]/20" />}
                </div>
                <div className="mt-2.5 text-[10px] font-semibold tabular-nums tracking-[.16em] text-[#151412]/45">{String(k + 1).padStart(2, '0')}</div>
                <div className="mt-0.5 text-[13px] font-semibold leading-tight">{ph}</div>
              </li>
            ))}
          </ol>
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {SITE.map(([id, cap], k) => (
              <figure key={id} className="group">
                <div className="aspect-[4/3] overflow-hidden rounded-[14px] bg-[#e2dcd2]">
                  <img src={img(id, true)} alt={t(cap)} loading="lazy" className={`h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04] ${id === 104 ? '' : ''}`} />
                </div>
                <figcaption className={`${T.sans} mt-2 text-[11.5px] ${id === 104 ? 'font-semibold text-[#151412]' : 'text-[#151412]/55'}`}>{t(cap)}</figcaption>
              </figure>
            ))}
          </div>
          <p className={`${T.sans} mt-5 max-w-[70ch] text-[13px] leading-relaxed text-[#151412]/65`}>{t(COMO.phasesNote)}</p>
        </Reveal>

        <div className={`${T.sans} mt-10 flex flex-wrap items-baseline gap-x-4 gap-y-1 border-t border-[#151412]/15 pt-5 text-[13px]`}>
          <span className="text-[10.5px] font-semibold uppercase tracking-[.22em] text-[#151412]/45">{t(S.next)}</span>
          <span className={`${T.serif} text-[22px]`}>{SARDEGNA.name}</span>
          <span className="text-[#151412]/55">{SARDEGNA.place}</span>
          <span className="rounded-full border border-[#151412]/20 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[.14em] text-[#b06a35]">{t(SARDEGNA.note)}</span>
          <a href="#contact" className="ml-auto font-semibold underline underline-offset-4 md:hidden">{t(S.inquire)} →</a>
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
