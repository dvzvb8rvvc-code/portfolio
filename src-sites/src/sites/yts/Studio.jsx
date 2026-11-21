import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent } from 'framer-motion'
import { useLite, useIsMobile } from '../../lib/kit'
import { useLang } from './i18n'
import { useStage, stage } from './engine'
import { SLIDES } from './Hero'
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

/* ---------- (a) statement + the hand-off card ---------- */
const GOLD = '#c3a15e', INK = '#efe8dc'
const CAP = `${T.sans} text-[11px] font-semibold uppercase tracking-[.28em]`

function Word({ w, i, n, p }) {
  const a = i / n, o = useTransform(p, [a * .8, a * .8 + .2], [.18, 1])
  const accent = w.startsWith('*')
  return <motion.span style={{ opacity: o }} className={accent ? 'italic text-[#d9bf86]' : ''}>{w.replace(/\*/g, '')} </motion.span>
}

function Service({ s, i }) {
  const { t } = useLang()
  return (
    <motion.li
      initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-10% 0px' }} transition={{ duration: .8, ease: E, delay: i * .06 }}
      className="group relative border-t border-[rgba(239,232,220,.12)] py-4 md:py-[18px]"
    >
      <span className="absolute inset-x-0 top-[-1px] h-px origin-left scale-x-0 bg-[#c3a15e] transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-x-100" />
      <div className="flex items-baseline gap-5">
        <span className={`${T.sans} w-6 shrink-0 text-[11px] font-semibold tabular-nums tracking-[.16em] text-[#c3a15e]`}>{s.k}</span>
        <div className="min-w-0 flex-1">
          <h3 className={`${T.serif} text-[25px] leading-[1.08] text-[#efe8dc] transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] md:text-[29px] md:group-hover:translate-x-2`}>{t(s.t)}</h3>
          <p className={`${T.sans} mt-1.5 max-w-[46ch] text-[15px] leading-[1.55] text-[#efe8dc]/60 md:text-[14px] md:grid md:grid-rows-[0fr] md:opacity-0 md:transition-all md:duration-500 md:group-hover:grid-rows-[1fr] md:group-hover:opacity-100`}>
            <span className="md:overflow-hidden">{t(s.d)}</span>
          </p>
        </div>
        <span aria-hidden className={`${T.sans} hidden text-[18px] text-[#efe8dc]/30 transition-all duration-500 group-hover:-rotate-45 group-hover:text-[#c3a15e] md:block`}>→</span>
      </div>
    </motion.li>
  )
}

/* The hero film lands here: sceneHero.jsx shrinks the live depth plane onto this rect (stage.hero.cardEl),
   then we swap in the same frame as a DOM <img> (stage.hero.landed). Without WebGL it is just a framed photo. */
function Card() {
  const { t } = useLang()
  const box = useRef(), im = useRef(), frame = useRef()
  const [cur, setCur] = useState(SLIDES[0].id)
  const [gl, setGl] = useState(false)
  useEffect(() => {
    const hub = (stage.hero = stage.hero || { i: 0, k: 0, ready: false, go: -1, f: 0 })
    hub.cardEl = box.current
    let raf, id = -1, vis = -1, dash = -1, glOn = false
    const loop = () => {
      const h = stage.hero
      if (h && h.ready && h.cardEl === box.current) {
        if (!glOn) { glOn = true; setGl(true) }
        const v = h.landed ? 1 : 0
        if (v !== vis) { vis = v; im.current.style.opacity = v }
        if (h.cardId != null && h.cardId !== id) { id = h.cardId; im.current.src = img(id); im.current.style.objectPosition = h.cardPos; setCur(id) }
        const d = Math.round((1 - ss(.45, .98, h.cardK || 0)) * 1000) / 1000
        if (d !== dash && frame.current) { dash = d; frame.current.style.strokeDashoffset = d }
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => { cancelAnimationFrame(raf); if (hub.cardEl === box.current) hub.cardEl = null }
  }, [])
  const sl = SLIDES.find(x => x.id === cur) || SLIDES[0]
  return (
    <figure className="relative min-w-0">
      <div className="relative">
        {/* gold hairline frame: drawn by the hand-off (GL) or on view (static) */}
        <svg aria-hidden className="pointer-events-none absolute -inset-[10px] h-[calc(100%+20px)] w-[calc(100%+20px)] overflow-visible md:-inset-[14px] md:h-[calc(100%+28px)] md:w-[calc(100%+28px)]" preserveAspectRatio="none">
          <motion.rect ref={frame} x="0" y="0" width="100%" height="100%" fill="none" stroke={GOLD} strokeOpacity=".7" strokeWidth="1" vectorEffect="non-scaling-stroke" pathLength="1" strokeDasharray="1 1"
            initial={{ strokeDashoffset: 1 }} whileInView={gl ? undefined : { strokeDashoffset: 0 }} viewport={{ once: true }} transition={{ duration: 1.8, ease: E }} />
        </svg>
        {['left-0 top-0 border-l border-t', 'right-0 top-0 border-r border-t', 'left-0 bottom-0 border-l border-b', 'right-0 bottom-0 border-r border-b'].map(c => (
          <span key={c} aria-hidden className={`pointer-events-none absolute h-3 w-3 border-[#c3a15e]/80 ${c} -m-[18px] md:-m-[24px]`} />
        ))}
        <div ref={box} className={`relative aspect-[4/5] w-full overflow-hidden lg:aspect-[5/6] ${gl ? '' : 'bg-[#14120f]'}`}>
          <img ref={im} src={img(SLIDES[0].id)} alt={t(sl.l)} loading="lazy" decoding="async" width={sl.w} height={sl.h}
            className="yts-grade absolute inset-0 h-full w-full object-cover transition-opacity duration-300" style={{ objectPosition: SLIDES[0].pos }} />
        </div>
      </div>
      <figcaption className={`${CAP} mt-7 flex min-w-0 items-baseline justify-between gap-4 text-[#efe8dc]/55 md:mt-9`}>
        <span className="truncate">{t(sl.l)}</span>
        <span className="shrink-0 tabular-nums text-[#c3a15e]">YTS</span>
      </figcaption>
    </figure>
  )
}

function Intro() {
  const { t, lang } = useLang()
  const ref = useRef(), wrap = useRef()
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start .9', 'end .5'] })
  const { scrollYProgress: q } = useScroll({ target: wrap, offset: ['start 1', 'start .25'] })
  const rule = useTransform(q, [0, 1], [0, 1])
  const words = t(S.statement).split(' ')
  const facts = [[t(S.since), String(PERSON.studioSince)], [t(S.office), t(PERSON.office)], [t(S.where), t(S.whereV)], [t(S.tools), PERSON.tech.join(' · ')]]
  return (
    <div ref={wrap} className="relative">
      <div className="mx-auto max-w-[1440px] px-5 pb-20 pt-16 md:px-10 md:pb-28 md:pt-24">
        {/* chapter rule: the gold hairline draws across as the film hands over */}
        <div className={`${CAP} flex items-center gap-4 text-[#efe8dc]/60`}>
          <span className="tabular-nums text-[#c3a15e]">01</span>
          <span>{t(S.label)}</span>
          <span className="relative h-px flex-1 overflow-hidden bg-[rgba(239,232,220,.08)]"><motion.span style={{ scaleX: rule }} className="absolute inset-0 origin-left bg-[#c3a15e]" /></span>
          <span className="hidden tabular-nums md:inline">Est. {PERSON.studioSince}</span>
        </div>
        <div className="mt-10 grid gap-14 md:mt-14 lg:grid-cols-12 lg:gap-10">
          <div className="min-w-0 px-[10px] md:mx-auto md:w-full md:max-w-[560px] md:px-[14px] lg:col-span-5 lg:col-start-8 lg:row-start-1 lg:max-w-none"><Card /></div>
          <div className="min-w-0 lg:col-span-6 lg:row-start-1 lg:pt-2">
            <p ref={ref} key={lang} className={`${T.serif} text-[34px] leading-[1.06] tracking-[-.01em] text-[#efe8dc] sm:text-[44px] md:text-[52px] lg:text-[clamp(44px,4.1vw,68px)]`}>
              {words.map((w, i) => <Word key={i} w={w} i={i} n={words.length} p={p} />)}
            </p>
            <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-[rgba(239,232,220,.12)] pt-6 md:mt-14 lg:grid-cols-4">
              {facts.map(([k, v]) => (
                <div key={k}>
                  <dt className={`${CAP} text-[#efe8dc]/45`}>{k}</dt>
                  <dd className={`${T.sans} mt-2 text-[15px] font-medium tabular-nums text-[#efe8dc]`}>{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-14 md:mt-20">
              <p className={`${CAP} mb-3 text-[#efe8dc]/55`}>{t(S.services)}</p>
              <ol className="border-b border-[rgba(239,232,220,.12)]">{SERVICES.map((s, i) => <Service key={s.k} s={s} i={i} />)}</ol>
            </div>
          </div>
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
      <motion.span style={{ opacity: ob, y: yb }} className="col-start-1 row-start-1 italic text-[#d9bf86]">{t(PAIR_LAB[i][1])}</motion.span>
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
  // skip past the film completely: land on the next chapter's top (Como), else the film's end + 1px
  const skip = () => { const n = document.getElementById('como'), el = ref.current; const y = n ? n.getBoundingClientRect().top + window.scrollY : el ? el.getBoundingClientRect().bottom + window.scrollY + 1 : 0; to(y) }
  const out = useTransform(p, [.9, .985], [1, 0])
  const pair = PAIRS[idx]
  return (
    <div ref={ref} className="relative h-[170vh] md:h-[200vh]" aria-label={t(S.filmLabel)}>
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <motion.div style={{ opacity: out }} className="pointer-events-none mx-auto flex h-full max-w-[1440px] flex-col px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-[76px] md:px-10 md:pb-10 md:pt-24">
          {/* title */}
          <motion.div style={{ y: mobile ? 0 : titleY }} className="md:max-w-[40%]">
            <p className={`${T.sans} flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[.28em] text-[#efe8dc]/62`}><span className="h-px w-8 bg-[#c3a15e]" />{t(S.filmLabel)}</p>
            <h2 className={`${T.serif} mt-3 text-[28px] leading-[1] max-[380px]:text-[25px] tracking-[-.015em] text-[#efe8dc] md:mt-6 md:text-[clamp(54px,5.6vw,96px)]`}>
              <motion.span className="block" initial="h" whileInView="s" viewport={{ once: true }}>
                <span className="block overflow-hidden pb-[.08em]"><motion.span className="block" variants={{ h: { y: '105%' }, s: { y: 0, transition: { duration: 1.1, ease: E } } }}>{t(S.filmA)}</motion.span></span>
                <span className="block overflow-hidden pb-[.08em]"><motion.span className="block italic text-[#d9bf86]" variants={{ h: { y: '105%' }, s: { y: 0, transition: { duration: 1.1, ease: E, delay: .1 } } }}>{t(S.filmB)}</motion.span></span>
              </motion.span>
            </h2>
            <p className={`${T.sans} mt-5 hidden max-w-[36ch] text-[14.5px] leading-[1.55] text-[#efe8dc]/62 md:block`}>{t(S.filmNote)}</p>
          </motion.div>

          {/* caption + counter */}
          <div className="mt-auto md:max-w-[34%]">
            <div className={`${T.serif} flex items-baseline gap-3 text-[26px] leading-none text-[#efe8dc] md:text-[44px]`}>
              <StageLabel key={idx} r={r} i={idx} />
            </div>
            <div className="mt-2 h-[22px] overflow-hidden md:mt-3 md:h-[24px]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.p key={idx} initial={{ y: 22, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -22, opacity: 0 }} transition={{ duration: .5, ease: E }} className={`${T.sans} truncate text-[13.5px] font-medium text-[#efe8dc]/72 md:text-[15px]`}>{t(pair.t)}</motion.p>
              </AnimatePresence>
            </div>
            <div className="mt-2 flex items-center gap-4 md:mt-4">
              <span className={`${T.sans} text-[12px] font-semibold tabular-nums tracking-[.14em] text-[#efe8dc]`}>{String(idx + 1).padStart(2, '0')}<span className="text-[#efe8dc]/40"> / 04</span></span>
              <span className="relative h-px flex-1 bg-[rgba(239,232,220,.14)]"><motion.span style={{ scaleX: bar }} className="absolute inset-0 origin-left bg-[#c3a15e]" /></span>
              <button onClick={skip} className={`${T.sans} pointer-events-auto inline-flex h-11 items-center rounded-full border border-[rgba(239,232,220,.22)] px-5 text-[11px] font-semibold uppercase tracking-[.16em] text-[#efe8dc]/72 transition-colors hover:border-[#c3a15e] hover:text-[#efe8dc]`}>{t('skip')} ↓</button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

/* lite / reduced motion: simple before → after pairs */
function FilmLite() {
  const { t } = useLang()
  return (
    <div className="mx-auto max-w-[1440px] px-5 pb-20 pt-6 md:px-10">
      <p className={`${T.sans} flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[.28em] text-[#efe8dc]/62`}><span className="h-px w-8 bg-[#c3a15e]" />{t(S.filmLabel)}</p>
      <h2 className={`${T.serif} mt-4 text-[36px] leading-[1] text-[#efe8dc] md:text-[64px]`}>{t(S.filmA)} <span className="italic text-[#d9bf86]">{t(S.filmB)}</span></h2>
      <div className="mt-10 grid gap-10 md:grid-cols-2">
        {PAIRS.map((p, i) => (
          <figure key={i}>
            <div className="grid grid-cols-2 gap-2">
              {[p.a, p.b].map((id, k) => (
                <div key={id} className="relative aspect-[4/5] overflow-hidden bg-[#14120f]">
                  <img src={img(id, true)} alt={`${t(PAIR_LAB[i][k])} — ${t(p.t)}`} loading="lazy" decoding="async" width="720" height="900" className={`h-full w-full object-cover ${k === 0 && i === 0 ? '' : ''}`} />
                  <span className={`${T.sans} absolute left-2 top-2 rounded-full bg-[#0b0a08]/75 text-[#efe8dc] backdrop-blur px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[.2em]`}>{t(PAIR_LAB[i][k])}</span>
                </div>
              ))}
            </div>
            <figcaption className={`${T.sans} mt-3 text-[13.5px] text-[#efe8dc]/72`}><span className="tabular-nums text-[#d9bf86]">0{i + 1}</span> · {t(p.t)}</figcaption>
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
