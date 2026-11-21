import React, { useRef, useState } from 'react'
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent } from 'framer-motion'
import { useLite, useIsMobile } from '../../lib/kit'
import { useLang } from './i18n'
import { useStage } from './engine'
import { T, PERSON, SERVICES, PAIRS, img } from './data'

/* V3 Studio: (a) statement + services (DOM only) · (b) "Sketch → Reality" film on the shared canvas (sceneSketch.jsx). */

const E = [0.16, 1, 0.3, 1]

const S = {
  label: { en: 'The studio', it: 'Lo studio' },
  statement: {
    en: 'Since 2012, YTS has shaped *commercial,* *public* and *residential* architecture between Israel and Italy — from the first sketch to the finished interior.',
    it: 'Dal 2012 YTS dà forma ad architetture *commerciali,* *pubbliche* e *residenziali* tra Israele e Italia — dal primo schizzo all’interno finito.',
  },
  since: { en: 'Founded', it: 'Fondato' },
  office: { en: 'Studio', it: 'Studio' },
  where: { en: 'Working in', it: 'Operativi in' },
  whereV: { en: 'Israel · Italy', it: 'Israele · Italia' },
  tools: { en: 'Designed in', it: 'Progettato in' },
  services: { en: 'One integrated package', it: 'Un unico percorso integrato' },
  filmLabel: { en: 'Sketch → Reality', it: 'Schizzo → Realtà' },
  filmA: { en: 'Every line', it: 'Ogni linea' },
  filmB: { en: 'becomes a place.', it: 'diventa un luogo.' },
  filmNote: { en: 'The same projects, from his own drawings and building sites to the finished spaces.', it: 'Gli stessi progetti, dai suoi disegni e cantieri fino agli spazi finiti.' },
  scroll: { en: 'Scroll to build', it: 'Scorri per costruire' },
}

const PAIR_LAB = [
  [{ en: 'Sketch', it: 'Schizzo' }, { en: 'Render', it: 'Render' }],
  [{ en: 'Site', it: 'Cantiere' }, { en: 'Render', it: 'Render' }],
  [{ en: 'Render', it: 'Render' }, { en: 'Built', it: 'Realizzato' }],
  [{ en: 'Site', it: 'Cantiere' }, { en: 'Built', it: 'Realizzato' }],
]

const to = y => (window.__lenis ? window.__lenis.scrollTo(y) : window.scrollTo({ top: y, behavior: 'smooth' }))
const clamp01 = x => Math.min(1, Math.max(0, x))
const ss = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t) }

/* ---------- (a) statement ---------- */
function Word({ w, i, n, p }) {
  const a = i / n, o = useTransform(p, [a * .8, a * .8 + .2], [.16, 1])
  const accent = w.startsWith('*')
  return <motion.span style={{ opacity: o }} className={accent ? 'italic text-[#b06a35]' : ''}>{w.replace(/\*/g, '')} </motion.span>
}

function Service({ s, i }) {
  const { t } = useLang()
  return (
    <motion.li
      initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-10% 0px' }} transition={{ duration: .8, ease: E, delay: i * .06 }}
      className="group relative border-t border-[#151412]/15 py-4 md:py-[18px]"
    >
      <span className="absolute inset-x-0 top-[-1px] h-px origin-left scale-x-0 bg-[#b06a35] transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-x-100" />
      <div className="flex items-baseline gap-5">
        <span className={`${T.sans} w-6 shrink-0 text-[11px] font-semibold tabular-nums tracking-[.12em] text-[#b06a35]`}>{s.k}</span>
        <div className="min-w-0 flex-1">
          <h3 className={`${T.serif} text-[26px] leading-[1.05] text-[#151412] transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] md:text-[30px] md:group-hover:translate-x-2`}>{t(s.t)}</h3>
          <p className={`${T.sans} mt-1.5 max-w-[46ch] text-[13.5px] leading-[1.5] text-[#151412]/60 md:grid md:grid-rows-[0fr] md:opacity-0 md:transition-all md:duration-500 md:group-hover:grid-rows-[1fr] md:group-hover:opacity-100`}>
            <span className="md:overflow-hidden">{t(s.d)}</span>
          </p>
        </div>
        <span aria-hidden className={`${T.sans} hidden text-[18px] text-[#151412]/30 transition-all duration-500 group-hover:-rotate-45 group-hover:text-[#b06a35] md:block`}>→</span>
      </div>
    </motion.li>
  )
}

function Intro() {
  const { t, lang } = useLang()
  const ref = useRef()
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start .9', 'end .5'] })
  const words = t(S.statement).split(' ')
  const facts = [[t(S.since), String(PERSON.studioSince)], [t(S.office), PERSON.office], [t(S.where), t(S.whereV)], [t(S.tools), PERSON.tech.join(' · ')]]
  return (
    <div className="relative bg-[#ece7df]">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-5 pb-16 pt-20 md:grid-cols-12 md:gap-10 md:px-10 md:pb-24 md:pt-28">
        <div className="md:col-span-7">
          <p className={`${T.sans} flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[.22em] text-[#151412]/60`}><span className="h-px w-8 bg-[#b06a35]" />{t(S.label)}</p>
          <p ref={ref} key={lang} className={`${T.serif} mt-7 text-[36px] leading-[1.03] tracking-[-.01em] text-[#151412] sm:text-[46px] md:text-[clamp(46px,4.3vw,70px)]`}>
            {words.map((w, i) => <Word key={i} w={w} i={i} n={words.length} p={p} />)}
          </p>
          <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-5 md:mt-14 md:grid-cols-4">
            {facts.map(([k, v]) => (
              <div key={k}>
                <dt className={`${T.sans} text-[10.5px] font-semibold uppercase tracking-[.2em] text-[#151412]/45`}>{k}</dt>
                <dd className={`${T.sans} mt-1.5 text-[15px] font-medium tabular-nums text-[#151412]`}>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="md:col-span-5 md:pt-[52px]">
          <p className={`${T.sans} mb-3 text-[11px] font-semibold uppercase tracking-[.22em] text-[#151412]/60`}>{t(S.services)}</p>
          <ol className="border-b border-[#151412]/15">{SERVICES.map((s, i) => <Service key={s.k} s={s} i={i} />)}</ol>
        </div>
      </div>
    </div>
  )
}

/* ---------- (b) Sketch → Reality film (3D lives in sceneSketch.jsx on the shared canvas) ---------- */
function StageLabel({ r, i }) {
  const { t } = useLang()
  const oa = useTransform(r, v => 1 - ss(.35, .6, v)), ob = useTransform(r, v => ss(.35, .6, v))
  const ya = useTransform(r, v => -ss(.35, .6, v) * 100 + '%'), yb = useTransform(r, v => (1 - ss(.35, .6, v)) * 100 + '%')
  return (
    <span className="relative -my-[.18em] inline-grid overflow-hidden py-[.18em] align-bottom">
      <motion.span style={{ opacity: oa, y: ya }} className="col-start-1 row-start-1">{t(PAIR_LAB[i][0])}</motion.span>
      <motion.span style={{ opacity: ob, y: yb }} className="col-start-1 row-start-1 italic text-[#b06a35]">{t(PAIR_LAB[i][1])}</motion.span>
    </span>
  )
}

function Film() {
  const { t } = useLang()
  const ref = useRef()
  const mobile = useIsMobile()
  useStage('sketch', ref)
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const [idx, setIdx] = useState(0)
  useMotionValueEvent(p, 'change', v => { const k = Math.min(3, Math.floor(clamp01(v) * 4 * 0.9999 + 1e-6)); setIdx(k) })
  const r = useTransform(p, v => { const S = clamp01(v) * 4 * .9999; return ss(.06, .72, S - Math.floor(S)) })
  const bar = useTransform(p, v => clamp01(v))
  const titleY = useTransform(p, [0, 1], ['0%', '-18%'])
  const skip = () => { const el = ref.current; if (el) to(el.getBoundingClientRect().bottom + window.scrollY - window.innerHeight * 0.6) }
  const pair = PAIRS[idx]
  return (
    <div ref={ref} className="relative h-[200vh]" aria-label={t(S.filmLabel)}>
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="pointer-events-none mx-auto flex h-full max-w-[1440px] flex-col px-5 pb-24 pt-20 md:px-10 md:pb-10 md:pt-24">
          {/* title */}
          <motion.div style={{ y: mobile ? 0 : titleY }} className="md:max-w-[40%]">
            <p className={`${T.sans} flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[.22em] text-[#151412]/60`}><span className="h-px w-8 bg-[#b06a35]" />{t(S.filmLabel)}</p>
            <h2 className={`${T.serif} mt-4 text-[34px] leading-[.98] tracking-[-.015em] text-[#151412] md:mt-6 md:text-[clamp(54px,5.6vw,96px)]`}>
              <motion.span className="block" initial="h" whileInView="s" viewport={{ once: true }}>
                <span className="block overflow-hidden pb-[.08em]"><motion.span className="block" variants={{ h: { y: '105%' }, s: { y: 0, transition: { duration: 1.1, ease: E } } }}>{t(S.filmA)}</motion.span></span>
                <span className="block overflow-hidden pb-[.08em]"><motion.span className="block italic text-[#b06a35]" variants={{ h: { y: '105%' }, s: { y: 0, transition: { duration: 1.1, ease: E, delay: .1 } } }}>{t(S.filmB)}</motion.span></span>
              </motion.span>
            </h2>
            <p className={`${T.sans} mt-5 hidden max-w-[36ch] text-[14.5px] leading-[1.55] text-[#151412]/60 md:block`}>{t(S.filmNote)}</p>
          </motion.div>

          {/* caption + counter */}
          <div className="mt-auto md:max-w-[34%]">
            <div className={`${T.serif} flex items-baseline gap-3 text-[30px] leading-none text-[#151412] md:text-[44px]`}>
              <StageLabel key={idx} r={r} i={idx} />
            </div>
            <div className="mt-3 h-[22px] overflow-hidden md:h-[24px]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.p key={idx} initial={{ y: 22, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -22, opacity: 0 }} transition={{ duration: .5, ease: E }} className={`${T.sans} truncate text-[13.5px] font-medium text-[#151412]/70 md:text-[15px]`}>{t(pair.t)}</motion.p>
              </AnimatePresence>
            </div>
            <div className="mt-4 flex items-center gap-4">
              <span className={`${T.sans} text-[12px] font-semibold tabular-nums tracking-[.14em] text-[#151412]`}>{String(idx + 1).padStart(2, '0')}<span className="text-[#151412]/35"> / 04</span></span>
              <span className="relative h-px flex-1 bg-[#151412]/15"><motion.span style={{ scaleX: bar }} className="absolute inset-0 origin-left bg-[#b06a35]" /></span>
              <button onClick={skip} className={`${T.sans} pointer-events-auto rounded-full border border-[#151412]/20 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[.16em] text-[#151412]/70 transition-colors hover:border-[#151412] hover:text-[#151412]`}>{t('skip')} ↓</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* lite / reduced motion: simple before → after pairs */
function FilmLite() {
  const { t } = useLang()
  return (
    <div className="mx-auto max-w-[1440px] px-5 pb-20 pt-6 md:px-10">
      <p className={`${T.sans} flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[.22em] text-[#151412]/60`}><span className="h-px w-8 bg-[#b06a35]" />{t(S.filmLabel)}</p>
      <h2 className={`${T.serif} mt-4 text-[36px] leading-[1] text-[#151412] md:text-[64px]`}>{t(S.filmA)} <span className="italic text-[#b06a35]">{t(S.filmB)}</span></h2>
      <div className="mt-10 grid gap-10 md:grid-cols-2">
        {PAIRS.map((p, i) => (
          <figure key={i}>
            <div className="grid grid-cols-2 gap-2">
              {[p.a, p.b].map((id, k) => (
                <div key={id} className="relative aspect-[4/5] overflow-hidden bg-[#e2dcd2]">
                  <img src={img(id, true)} alt={`${t(PAIR_LAB[i][k])} — ${t(p.t)}`} loading="lazy" decoding="async" width="720" height="900" className={`h-full w-full object-cover ${k === 0 && i === 0 ? 'mix-blend-multiply' : ''}`} />
                  <span className={`${T.sans} absolute left-2 top-2 rounded-full bg-[#ece7df]/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[.14em]`}>{t(PAIR_LAB[i][k])}</span>
                </div>
              ))}
            </div>
            <figcaption className={`${T.sans} mt-3 text-[13.5px] text-[#151412]/70`}><span className="tabular-nums text-[#b06a35]">0{i + 1}</span> · {t(p.t)}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  )
}

export default function Studio() {
  const lite = useLite()
  return (
    <section id="studio" className="relative">
      <Intro />
      {lite ? <FilmLite /> : <Film />}
    </section>
  )
}
