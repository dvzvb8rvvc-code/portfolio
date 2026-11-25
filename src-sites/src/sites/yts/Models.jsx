import React, { useEffect, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useLite } from '../../lib/kit'
import { useLang } from './i18n'
import { useStage, stage } from './engine'
import { T, COMO, PALAZZO, img } from './data'

/* MODELS (V6) — "Four projects, in the round". DOM only; the maquettes live in sceneModels.jsx.
   CIAO-style product film: lit plinth carousel → a maquette flies forward, turns 3/4 → the stage floods
   into its colour chapter (a shader inside the canvas, so the model sits *in* the colour) → headline +
   facts slide in, a small real render/photo card fades in → it turns to show its back → next → finale:
   all four in a curved lineup, then the frame scrolls away into Como.
   The scene renders itself into this section's sticky frame (scissored, own camera), so it scrolls in
   and out like a DOM block — no hard cut with Studio above or Como below.
   Timeline helpers are shared with the scene (keep the 3D and the type in lock-step). */

export const TL = { a: .075, b: .87, f: .085 }
const cl = v => Math.min(1, Math.max(0, v))
// chapter coordinate: -1..0 carousel intro, 0..4 = chapters (integer part = model), capped at 4
export const chapOf = p => (p < TL.a ? p / TL.a - 1 : Math.min(4, ((p - TL.a) / (TL.b - TL.a)) * 4))
const sm = x => { x = cl(x); return x * x * (3 - 2 * x) }
export const finOf = p => sm((p - TL.b) / TL.f)

const E = [0.16, 1, 0.3, 1]
const S = {
  eyebrow: { en: 'Study models · 04', it: 'Modelli di studio · 04' },
  h1: { en: 'Four projects,', it: 'Quattro progetti,' },
  h2: { en: 'in the round.', it: 'a tutto tondo.' },
  lead: { en: 'Architects think in models. Scroll — each one steps off the plinth.', it: 'Gli architetti pensano per modelli. Scorri — ognuno scende dal piedistallo.' },
  scroll: { en: 'Scroll to turn the plinth', it: 'Scorri per girare il piedistallo' },
  fin1: { en: 'Four projects.', it: 'Quattro progetti.' },
  fin2: { en: 'One studio.', it: 'Uno studio.' },
  finNote: { en: 'Next — the residences on Lake Como', it: 'Prossimo — le residenze sul Lago di Como' },
  model: { en: 'Study model', it: 'Modello di studio' },
}

// facts: only from data.js; untitled studio renders stay generic
const PROJECTS = [
  {
    key: 'terraces', short: { en: 'Terraces', it: 'Terrazze' }, tag: { en: 'Residences · Lake Como', it: 'Residenze · Lago di Como' },
    title: [COMO.name.split(' di ')[0], 'di ' + COMO.name.split(' di ')[1]], place: COMO.place,
    facts: [
      { v: COMO.facts[0].v, u: 'm²', l: COMO.facts[0].l },
      { v: COMO.facts[1].v, u: 'm²', l: COMO.facts[1].l },
      { v: COMO.facts[2].v, u: 'min', l: COMO.facts[2].l },
    ],
    img: 5, cap: { en: 'Render · Il Giardino di Teodolinda', it: 'Render · Il Giardino di Teodolinda' },
  },
  {
    key: 'tower', short: { en: 'Tower', it: 'Torre' }, tag: { en: 'Studio work · Render', it: 'Lavoro dello studio · Render' },
    title: [{ en: 'Stacked', it: 'Volumi' }, { en: 'volumes', it: 'sovrapposti' }], place: { en: 'Tower · concept render', it: 'Torre · render di concept' },
    facts: [
      { v: 'Concept', l: { en: 'Studio service — early design that looks at the big picture', it: 'Servizio dello studio — progettazione iniziale con uno sguardo d’insieme' } },
      { v: 'BIM', l: { en: 'The studio designs in BIM and reviews in VR and AR', it: 'Lo studio progetta in BIM e verifica in VR e AR' } },
    ],
    img: 40, cap: { en: 'Render · studio work', it: 'Render · lavoro dello studio' },
  },
  {
    key: 'curve', short: { en: 'Curve', it: 'Curva' }, tag: { en: 'Studio work · Render', it: 'Lavoro dello studio · Render' },
    title: [{ en: 'The curved', it: 'La facciata' }, { en: 'facade', it: 'curva' }], place: { en: 'Curved balconies · render', it: 'Balconi curvi · render' },
    facts: [
      { v: { en: 'Detail', it: 'Dettaglio' }, l: { en: 'Studio service — working drawings with careful control of cost and programme', it: 'Servizio dello studio — esecutivi con attento controllo di costi e tempi' } },
      { v: { en: 'Interior', it: 'Interni' }, l: { en: 'Studio service — interiors designed together with the building', it: 'Servizio dello studio — interni progettati insieme all’edificio' } },
    ],
    img: 78, cap: { en: 'Render · studio work', it: 'Render · lavoro dello studio' },
  },
  {
    key: 'palazzo', short: { en: 'Palazzo', it: 'Palazzo' }, tag: { en: 'Residences · Tuscany', it: 'Residenze · Toscana' },
    title: ['Palazzo', 'Campani'], place: PALAZZO.place,
    facts: [
      { v: '6', u: '', l: { en: 'private residences', it: 'residenze private' } },
      { v: String(PALAZZO.total), u: 'm²', l: { en: 'across the six homes', it: 'nelle sei residenze' } },
      { v: { en: '17th', it: 'XVII' }, u: { en: 'c.', it: 'sec.' }, l: { en: 'noble residence, original frescoes', it: 'dimora nobiliare, affreschi originali' } },
    ],
    img: 145, cap: { en: 'Photo · Volterra', it: 'Foto · Volterra' },
  },
]
export const MODEL_KEYS = PROJECTS.map(p => p.key)

/* ───────────── pieces (top-level components only) ───────────── */
function Intro({ c }) {
  const { t } = useLang()
  const o = useTransform(c, [-1, -.35, -.05], [1, 1, 0])
  const y = useTransform(c, [-1, -.05], [0, -70])
  return (
    <motion.div style={{ opacity: o, y }} className="pointer-events-none absolute inset-x-0 top-[100px] z-20 md:top-[112px]">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <motion.p initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .9, ease: E }} className={`${T.sans} flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[.26em] text-[#efe8dc]/70`}><span className="h-px w-8 bg-[#c3a15e]" />{t(S.eyebrow)}</motion.p>
        <motion.h2 initial="h" whileInView="s" viewport={{ once: true }} className={`${T.serif} mt-3 text-[clamp(40px,11.5vw,50px)] leading-[.92] tracking-[-.015em] text-[#efe8dc] md:mt-5 md:text-[clamp(64px,6.6vw,112px)]`}>
          {[S.h1, S.h2].map((l, i) => (
            <span key={i} className="block overflow-hidden pb-[.07em]">
              <motion.span variants={{ h: { x: '-104%' }, s: { x: 0, transition: { duration: 1.25, ease: E, delay: .08 + i * .12 } } }} className={`block ${i ? 'italic text-[#d9bd84]' : ''}`}>{t(l)}</motion.span>
            </span>
          ))}
        </motion.h2>
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1, delay: .5 }} className={`${T.sans} mt-4 max-w-[34ch] text-[15px] leading-[1.5] text-[#efe8dc]/62 md:mt-6 md:text-[16px]`}>{t(S.lead)}</motion.p>
      </div>
    </motion.div>
  )
}

function Chapter({ c, i, pr }) {
  const { t } = useLang()
  const a = i
  const o = useTransform(c, [a + .16, a + .3, a + .8, a + .92], [0, 1, 1, 0])
  const x = useTransform(c, [a + .16, a + .34, a + .8, a + .94], [-90, 0, 0, -40])
  const x2 = useTransform(c, [a + .2, a + .4, a + .8, a + .94], [-120, 0, 0, -30])
  const fo = useTransform(c, [a + .3, a + .44, a + .8, a + .9], [0, 1, 1, 0])
  const fy = useTransform(c, [a + .3, a + .46], [24, 0])
  const co = useTransform(c, [a + .34, a + .5, a + .78, a + .9], [0, 1, 1, 0])
  const cs = useTransform(c, [a + .34, a + .6], [1.08, 1])
  const cy = useTransform(c, [a + .34, a + .9], [30, -20])
  const title = pr.title.map(l => t(l))
  return (
    <>
      <motion.div style={{ opacity: o }} className="pointer-events-none absolute inset-x-0 bottom-[86px] z-20 md:bottom-auto md:top-1/2 md:-translate-y-[46%]">
        <div className="mx-auto max-w-[1440px] px-5 md:px-10">
          <div className="max-w-[560px] md:max-w-[36%]">
            <motion.p style={{ x }} className={`${T.sans} inline-flex items-center gap-2.5 rounded-[3px] border border-[#efe8dc]/25 bg-[#0b0a08]/20 px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[.2em] text-[#efe8dc] backdrop-blur-sm`}>
              <span className="tabular-nums text-[#f0d79e]">0{i + 1} / 04</span><span className="h-3 w-px bg-[#efe8dc]/30" />{t(pr.tag)}
            </motion.p>
            <h3 className={`${T.serif} mt-3 text-[clamp(38px,10.5vw,46px)] leading-[.9] tracking-[-.015em] text-[#efe8dc] [text-shadow:0_2px_30px_rgba(0,0,0,.25)] md:mt-5 md:text-[clamp(56px,5.6vw,96px)]`}>
              <span className="block overflow-hidden pb-[.06em]"><motion.span style={{ x }} className="block">{title[0]}</motion.span></span>
              <span className="block overflow-hidden pb-[.06em]"><motion.span style={{ x: x2 }} className="block italic text-[#f3dfb4]">{title[1]}</motion.span></span>
            </h3>
            <motion.p style={{ x: x2 }} className={`${T.sans} mt-2 text-[11px] font-semibold uppercase tracking-[.2em] text-[#efe8dc]/80 md:mt-4 md:text-[12px]`}>{t(pr.place)}</motion.p>
            <motion.dl style={{ opacity: fo, y: fy }} className={`mt-4 grid gap-x-5 border-t border-[#efe8dc]/20 md:mt-7 ${pr.facts.length > 2 ? 'grid-cols-3' : 'grid-cols-2'} md:grid-cols-1`}>
              {pr.facts.map((f, k) => (
                <div key={k} className="flex flex-col gap-1 border-b border-[#efe8dc]/15 py-2.5 md:flex-row md:items-baseline md:gap-5 md:py-3.5">
                  <dd className={`${T.serif} whitespace-nowrap text-[26px] leading-none tabular-nums text-[#efe8dc] md:w-[150px] md:shrink-0 md:text-[40px]`}>{t(f.v)}{f.u && <span className={`${T.sans} ml-1 text-[11px] font-semibold text-[#f0d79e] md:text-[13px]`}>{t(f.u)}</span>}</dd>
                  <dt className={`${T.sans} text-[12px] leading-snug text-[#efe8dc]/72 md:text-[14px]`}>{t(f.l)}</dt>
                </div>
              ))}
            </motion.dl>
          </div>
        </div>
      </motion.div>
      {/* the honest link: a small real render / photo of that project */}
      <motion.figure style={{ opacity: co, y: cy }} className="pointer-events-none absolute right-4 top-[96px] z-20 w-[84px] md:right-10 md:top-auto md:bottom-[18%] md:w-[clamp(180px,16vw,250px)]">
        <motion.div style={{ scale: cs }} className="overflow-hidden rounded-[6px] p-[3px] ring-1 ring-[#efe8dc]/30 [background:rgba(11,10,8,.25)] md:p-[5px]">
          <img src={img(pr.img, true)} alt={t(pr.cap)} loading="lazy" decoding="async" className="aspect-[4/5] w-full rounded-[3px] object-cover yts-grade" />
        </motion.div>
        <figcaption className={`${T.sans} mt-2 hidden text-[10.5px] font-semibold uppercase leading-snug tracking-[.14em] text-[#efe8dc]/80 md:block md:text-[11px]`}>{t(pr.cap)}</figcaption>
      </motion.figure>
    </>
  )
}

function Progress({ c, fin }) {
  const { t } = useLang()
  const o = useTransform(fin, [0, .5], [1, 0])
  return (
    <motion.div style={{ opacity: o }} className="pointer-events-none absolute bottom-[26px] left-5 z-30 w-[min(260px,52vw)] md:bottom-10 md:left-1/2 md:w-[min(520px,40vw)] md:-translate-x-1/2">
      <div className="flex gap-1.5">
        {PROJECTS.map((pr, i) => <Seg key={pr.key} c={c} i={i} label={t(pr.short)} />)}
      </div>
    </motion.div>
  )
}
function Seg({ c, i, label }) {
  const sx = useTransform(c, [i, i + 1], [0, 1])
  const lo = useTransform(c, [i - .2, i + .1, i + .9, i + 1.1], [.45, 1, 1, .45])
  return (
    <div className="flex-1">
      <motion.span style={{ opacity: lo }} className={`${T.sans} block truncate text-[10.5px] font-semibold uppercase tracking-[.16em] text-[#efe8dc] md:text-[11px]`}>{label}</motion.span>
      <div className="relative mt-2 h-px bg-[#efe8dc]/22"><motion.span style={{ scaleX: sx }} className="absolute inset-0 origin-left bg-[#efe8dc]" /></div>
    </div>
  )
}

function Finale({ fin }) {
  const { t } = useLang()
  const o = useTransform(fin, [.35, .8], [0, 1])
  const y = useTransform(fin, [.35, 1], [40, 0])
  return (
    <motion.div style={{ opacity: o, y }} className="pointer-events-none absolute inset-x-0 top-[84px] z-20 px-5 text-center md:top-[104px]">
      <p className={`${T.serif} text-[clamp(32px,9vw,44px)] leading-[.95] text-[#efe8dc] md:text-[clamp(52px,5vw,84px)]`}>{t(S.fin1)} <span className="italic text-[#d9bd84]">{t(S.fin2)}</span></p>
      <p className={`${T.sans} mt-3 text-[11px] font-semibold uppercase tracking-[.22em] text-[#efe8dc]/60 md:mt-4 md:text-[12px]`}>{t(S.finNote)} ↓</p>
    </motion.div>
  )
}

// lineup name tags — positioned every frame by sceneModels (projected anchors), transform/opacity only
function Tag({ i, pr, reg }) {
  const { t } = useLang()
  return (
    <div ref={el => (reg.current[i] = el)} style={{ opacity: 0 }} className="pointer-events-none absolute left-0 top-0 z-20 flex -translate-x-1/2 flex-col items-center whitespace-nowrap will-change-transform">
      <span className="mb-2 block h-5 w-px bg-gradient-to-b from-[#efe8dc]/0 to-[#efe8dc]/70" />
      <span className={`${T.sans} text-[10.5px] font-semibold tabular-nums tracking-[.2em] text-[#c3a15e]`}>0{i + 1}</span>
      <span className={`${T.serif} mt-1 text-[19px] italic leading-none text-[#efe8dc] md:text-[22px]`}>{t(pr.short)}</span>
    </div>
  )
}

function Skip({ p, wrap }) {
  const { t } = useLang()
  const o = useTransform(p, [.9, .98], [1, 0])
  const go = () => {
    const n = document.getElementById('como'), el = wrap.current
    const y = n ? n.getBoundingClientRect().top + scrollY : el ? el.getBoundingClientRect().bottom + scrollY + 1 : 0
    window.__lenis ? window.__lenis.scrollTo(y, { duration: 1.4 }) : scrollTo({ top: y, behavior: 'smooth' })
  }
  return (
    <motion.button style={{ opacity: o }} onClick={go} className={`${T.sans} absolute bottom-5 right-4 z-40 h-11 rounded-full border border-[#efe8dc]/25 bg-[#0b0a08]/30 px-5 text-[11px] font-semibold uppercase tracking-[.16em] text-[#efe8dc] backdrop-blur-md transition-colors hover:border-[#c3a15e] hover:text-[#c3a15e] md:bottom-8 md:right-10 md:text-[12px]`}>
      {t('skip')} <span aria-hidden>↓</span>
    </motion.button>
  )
}

/* lite / reduced motion: the end state as a quiet still grid */
function Still() {
  const { t } = useLang()
  return (
    <div className="mx-auto max-w-[1440px] px-5 py-16 md:px-10 md:py-24">
      <p className={`${T.sans} flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[.26em] text-[#efe8dc]/70`}><span className="h-px w-8 bg-[#c3a15e]" />{t(S.eyebrow)}</p>
      <h2 className={`${T.serif} mt-3 text-[44px] leading-[.95] text-[#efe8dc] md:text-[84px]`}>{t(S.h1)} <span className="italic text-[#d9bd84]">{t(S.h2)}</span></h2>
      <div className="mt-8 grid grid-cols-2 gap-3 md:mt-12 md:grid-cols-4 md:gap-5">
        {PROJECTS.map((pr, i) => (
          <figure key={pr.key}>
            <div className="aspect-[4/5] overflow-hidden rounded-[10px] bg-[#14120f]"><img src={img(pr.img, true)} alt={t(pr.cap)} loading="lazy" decoding="async" className="h-full w-full object-cover yts-grade" /></div>
            <figcaption className="mt-3">
              <span className={`${T.sans} text-[11px] font-semibold tabular-nums tracking-[.2em] text-[#c3a15e]`}>0{i + 1}</span>
              <p className={`${T.serif} text-[24px] leading-tight text-[#efe8dc]`}>{pr.title.map(l => t(l)).join(' ')}</p>
              <p className={`${T.sans} text-[12px] text-[#efe8dc]/60`}>{t(pr.place)}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  )
}

export default function Models() {
  const lite = useLite()
  const { t, lang } = useLang()
  const ref = useRef(), frame = useRef(), tags = useRef({})
  useStage('models', ref)
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const c = useTransform(p, chapOf)
  const fin = useTransform(p, finOf)
  useEffect(() => {
    stage.models = { frame: frame.current, tags: tags.current }
    return () => { if (stage.models?.frame === frame.current) delete stage.models }
  }, [lite])
  if (lite) return <section id="models" className="relative"><div ref={ref}><Still /></div></section>
  return (
    <section id="models" className="relative" aria-label={`${t(S.h1)} ${t(S.h2)}`}>
      <div ref={ref} className="relative h-[200vh] md:h-[260vh]">
        <div ref={frame} className="sticky top-0 h-[100svh] overflow-hidden">
          <Intro c={c} />
          {PROJECTS.map((pr, i) => <Chapter key={pr.key + lang} c={c} i={i} pr={pr} />)}
          {PROJECTS.map((pr, i) => <Tag key={pr.key + lang} i={i} pr={pr} reg={tags} />)}
          <Finale fin={fin} />
          <Progress c={c} fin={fin} />
          <Skip p={p} wrap={ref} />
        </div>
      </div>
    </section>
  )
}
