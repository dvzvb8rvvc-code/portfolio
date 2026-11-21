import React, { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useMotionValueEvent, useInView, animate, useReducedMotion } from 'framer-motion'
import { useLite, useIsMobile } from '../../lib/kit'
import { useLang } from './i18n'

const StudioFilm = lazy(() => import('./studio3d'))
const Compare3D = lazy(() => import('./studiocompare3d'))
import { T, PERSON, SERVICES, SCALE, PAIRS, img } from './data'

const E = [0.16, 1, 0.3, 1]

const S = {
  label: { en: 'The studio', it: 'Lo studio' },
  statement: {
    en: 'Since 2012, YTS has shaped large-scale *commercial,* *public* and *residential* architecture between Israel and Italy — from the first sketch to the finished interior.',
    it: 'Dal 2012 YTS dà forma ad architetture *commerciali,* *pubbliche* e *residenziali* di grande scala tra Israele e Italia — dal primo schizzo all’interno finito.',
  },
  office: { en: 'Studio', it: 'Studio' },
  where: { en: 'Working in', it: 'Operativi in' },
  whereV: { en: 'Israel · Italy', it: 'Israele · Italia' },
  tools: { en: 'Designed & presented in', it: 'Progettato e presentato in' },
  since: { en: 'Founded', it: 'Fondato' },
  procLabel: { en: 'Process', it: 'Metodo' },
  procTitleA: { en: 'One integrated', it: 'Un unico' },
  procTitleB: { en: 'package —', it: 'percorso —' },
  procTitleC: { en: 'from concept to interiors.', it: 'dal concept agli interni.' },
  procNote: { en: 'One studio from the first sketch to the interiors — so the original idea carries through to the finished building.', it: 'Un solo studio dal primo schizzo agli interni — perché l’idea originale arrivi intatta fino all’edificio finito.' },
  cmpLabel: { en: 'Sketch ↔ Reality', it: 'Schizzo ↔ Realtà' },
  cmpA: { en: 'Sketch', it: 'Schizzo' },
  cmpB: { en: 'Reality', it: 'Realtà' },
  cmpLead: { en: 'The same projects at every stage — his own drawings, renders, building sites and finished spaces. Drag the line.', it: 'Gli stessi progetti in ogni fase — i suoi disegni, i render, i cantieri e gli spazi finiti. Trascina la linea.' },
  drag: { en: 'Drag to compare', it: 'Trascina per confrontare' },
  prev: { en: 'Previous pair', it: 'Coppia precedente' },
  next: { en: 'Next pair', it: 'Coppia successiva' },
  slider: { en: 'Comparison divider', it: 'Divisore di confronto' },
}

const STEP_IMG = [
  { id: 59, fit: 'contain', c: { en: 'Concept sketch · studio archive', it: 'Schizzo di concept · archivio dello studio' } },
  { id: 32, fit: 'contain', c: { en: 'Elevation sketch · studio archive', it: 'Schizzo di prospetto · archivio dello studio' } },
  { id: 35, fit: 'contain', c: { en: 'Construction detail · studio archive', it: 'Dettaglio costruttivo · archivio dello studio' } },
  { id: 98, fit: 'cover', c: { en: 'Interior render · studio work', it: 'Render di interni · progetto dello studio' } },
  { id: 130, fit: 'cover', c: { en: 'Building site · Lake Como', it: 'Cantiere · Lago di Como' } },
]

const PAIR_LAB = [
  [{ en: 'Sketch', it: 'Schizzo' }, { en: 'Render', it: 'Render' }],
  [{ en: 'Site', it: 'Cantiere' }, { en: 'Render', it: 'Render' }],
  [{ en: 'Render', it: 'Render' }, { en: 'Built', it: 'Realizzato' }],
  [{ en: 'Site', it: 'Cantiere' }, { en: 'Built', it: 'Realizzato' }],
]

/* ---------- 1. statement with scroll-lit words ---------- */
function Word({ w, i, n, p }) {
  const a = i / n, o = useTransform(p, [a * .8, a * .8 + .2], [.14, 1])
  const accent = w.startsWith('*')
  const txt = w.replace(/\*/g, '')
  return <motion.span style={{ opacity: o }} className={accent ? 'italic text-[#b06a35]' : ''}>{txt} </motion.span>
}

function Statement() {
  const { t, lang } = useLang()
  const ref = useRef()
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start .85', 'end .45'] })
  const words = t(S.statement).split(' ')
  return (
    <div className="mx-auto max-w-[1440px] px-5 pb-24 pt-28 md:px-10 md:pb-36 md:pt-40">
      <div className="grid gap-10 md:grid-cols-12">
        <div className="md:col-span-3">
          <p className={`${T.sans} flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[.22em] text-[#151412]/60`}><span className="h-px w-8 bg-[#b06a35]" />{t(S.label)}</p>
        </div>
        <p ref={ref} key={lang} className={`${T.serif} text-[38px] leading-[1.02] tracking-[-.01em] text-[#151412] sm:text-[52px] md:col-span-9 md:text-[clamp(52px,5.4vw,92px)]`}>
          {words.map((w, i) => <Word key={i} w={w} i={i} n={words.length} p={p} />)}
        </p>
      </div>
      <div className="mt-16 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-[#151412]/15 pt-8 md:mt-24 md:grid-cols-12">
        {[
          [t(S.since), String(PERSON.studioSince)],
          [t(S.office), PERSON.office],
          [t(S.where), t(S.whereV)],
          [t(S.tools), PERSON.tech.join(' · ')],
        ].map(([k, v], i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-10% 0px' }} transition={{ duration: .9, ease: E, delay: i * .08 }} className={`${i === 0 ? 'md:col-start-4' : ''} md:col-span-2 ${i === 3 ? 'md:col-span-3' : ''}`}>
            <p className={`${T.sans} text-[11px] font-semibold uppercase tracking-[.18em] text-[#151412]/50`}>{k}</p>
            <p className={`${T.serif} mt-2 text-[26px] leading-tight tabular-nums text-[#151412] md:text-[30px]`}>{v}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

/* ---------- 2. process: sticky rolling numeral + steps ---------- */
function Step({ s, i, setActive }) {
  const { t } = useLang()
  const ref = useRef()
  const inView = useInView(ref, { margin: '-45% 0px -45% 0px' })
  useEffect(() => { if (inView) setActive(i) }, [inView])
  const im = STEP_IMG[i]
  return (
    <article ref={ref} className="grid gap-6 border-t border-[#ece7df]/15 py-12 md:min-h-[78vh] md:grid-cols-[1fr_1.05fr] md:items-center md:gap-10 md:py-16">
      <div>
        <p className={`${T.sans} text-[12px] font-semibold tabular-nums tracking-[.2em] text-[#c3a15e]`}>{s.k} / 05</p>
        <h3 className={`${T.serif} mt-4 text-[44px] leading-[.95] text-[#ece7df] md:text-[clamp(48px,4.2vw,72px)]`}>{t(s.t)}</h3>
        <p className={`${T.sans} mt-5 max-w-[38ch] text-[16px] leading-relaxed text-[#ece7df]/70`}>{t(s.d)}</p>
      </div>
      <motion.figure initial={{ clipPath: 'inset(18% 0 18% 0)', opacity: .3 }} whileInView={{ clipPath: 'inset(0% 0 0% 0)', opacity: 1 }} viewport={{ once: true, margin: '-15% 0px' }} transition={{ duration: 1.2, ease: E }} className="relative">
        <div className={`aspect-[4/3] overflow-hidden rounded-[4px] ${im.fit === 'contain' ? 'bg-[#f6f3ee]' : 'bg-[#2a2826]'}`}>
          <img src={img(im.id, 1)} srcSet={`${img(im.id, 1)} 720w, ${img(im.id)} 1800w`} sizes="(min-width: 768px) 40vw, 100vw" alt={t(im.c)} loading="lazy" decoding="async" width="720" height="540" className={`h-full w-full ${im.fit === 'contain' ? 'object-contain p-5 mix-blend-multiply' : 'object-cover'}`} />
        </div>
        <figcaption className={`${T.sans} mt-3 text-[11px] font-medium uppercase tracking-[.16em] text-[#ece7df]/45`}>{t(im.c)}</figcaption>
      </motion.figure>
    </article>
  )
}

function ProcessFlat() {
  const { t } = useLang()
  const [active, setActive] = useState(0)
  return (
    <div className="relative bg-[#151412] text-[#ece7df]">
      <div className="mx-auto grid max-w-[1440px] gap-6 px-5 py-20 md:grid-cols-12 md:gap-10 md:px-10 md:py-32">
        <div className="md:col-span-5">
          <div className="sticky top-[88px] z-10 -mx-5 bg-[#151412]/92 px-5 pb-4 pt-2 backdrop-blur-sm md:static md:mx-0 md:bg-transparent md:p-0 md:backdrop-blur-0 md:[position:sticky] md:top-[110px]">
            <p className={`${T.sans} flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[.22em] text-[#ece7df]/55`}><span className="h-px w-8 bg-[#c3a15e]" />{t(S.procLabel)}</p>
            <h2 className={`${T.serif} mt-5 hidden text-[clamp(44px,4.4vw,76px)] leading-[.95] md:block`}>{t(S.procTitleA)} <span className="italic">{t(S.procTitleB)}</span><br />{t(S.procTitleC)}</h2>
            <div className="mt-2 flex items-end gap-5 md:mt-12">
              <div className={`${T.sans} relative h-[1em] overflow-hidden text-[64px] font-black leading-none tracking-[-.06em] tabular-nums md:text-[clamp(120px,15vw,240px)]`} aria-hidden="true">
                <span className="text-[#ece7df]/20">0</span>
                <span className="relative inline-block h-[1em] overflow-hidden align-top">
                  <motion.span className="flex flex-col" animate={{ y: `${-active}em` }} transition={{ duration: .9, ease: E }}>
                    {SERVICES.map((s, i) => <span key={i} className="block h-[1em] text-[#c3a15e]">{i + 1}</span>)}
                  </motion.span>
                </span>
              </div>
              <div className="pb-2 md:pb-6">
                <AnimatePresence mode="wait">
                  <motion.p key={active} initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -14, opacity: 0 }} transition={{ duration: .45, ease: E }} className={`${T.serif} text-[24px] italic leading-none md:text-[30px]`}>{t(SERVICES[active].t)}</motion.p>
                </AnimatePresence>
                <div className="mt-3 flex gap-1.5">{SERVICES.map((_, i) => <span key={i} className={`h-[3px] w-7 rounded-full transition-colors duration-500 ${i <= active ? 'bg-[#c3a15e]' : 'bg-[#ece7df]/15'}`} />)}</div>
              </div>
            </div>
            <p className={`${T.sans} mt-10 hidden max-w-[36ch] text-[15px] leading-relaxed text-[#ece7df]/60 md:block`}>{t(S.procNote)}</p>
          </div>
          <h2 className={`${T.serif} mt-6 text-[44px] leading-[.95] md:hidden`}>{t(S.procTitleA)} <span className="italic">{t(S.procTitleB)}</span> {t(S.procTitleC)}</h2>
        </div>
        <div className="md:col-span-7">
          {SERVICES.map((s, i) => <Step key={s.k} s={s} i={i} setActive={setActive} />)}
        </div>
      </div>
    </div>
  )
}

/* ---------- 2b. process film: one sticky canvas morphing through five 3D vignettes ---------- */
const WORDS = { en: ['CONCEPT', 'PERMITS', 'DRAWINGS', 'INTERIORS', 'DEVELOP'], it: ['CONCEPT', 'PERMESSI', 'ESECUTIVO', 'INTERNI', 'SVILUPPO'] }
const VIG = [
  { en: 'Ink lines find the massing', it: 'Le linee a china trovano il volume' },
  { en: 'Zoning envelope · authority review', it: 'Inviluppo urbanistico · verifica degli enti' },
  { en: 'Slabs · columns · facade fins · glazing', it: 'Solai · pilastri · lamelle di facciata · vetrate' },
  { en: 'Interior render · studio work — in depth', it: 'Render di interni · progetto dello studio — in profondità' },
  { en: 'Building site · Lake Como — in depth', it: 'Cantiere · Lago di Como — in profondità' },
]

function KineticTitle({ text }) {
  const words = text.split(' ')
  return (
    <span className="block">
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[.08em] align-top">
          <motion.span className="inline-block" initial={{ y: '105%', rotate: 4 }} animate={{ y: 0, rotate: 0 }} exit={{ y: '-105%' }} transition={{ duration: .8, ease: E, delay: .05 + i * .06 }}>{w}&nbsp;</motion.span>
        </span>
      ))}
    </span>
  )
}

function ProcessFilm() {
  const { t, lang } = useLang()
  const mobile = useIsMobile()
  const ref = useRef()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const near = useInView(ref, { margin: '100% 0px 100% 0px' })
  const active = useInView(ref, { margin: '0px' })
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(near) }, [near])
  const [step, setStep] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', v => { const s = Math.min(4, Math.max(0, Math.floor(v * 5))); setStep(o => (o === s ? o : s)) })
  const bar = useTransform(scrollYProgress, [0, 1], [0, 1])
  // full-bleed colour chapters (kept in sync with CHAPTER in studio3d)
  const bg = useTransform(scrollYProgress, [0, .16, .25, .36, .45, .56, .65, 1], ['#100f0e', '#100f0e', '#1f3a47', '#1f3a47', '#a35d2c', '#a35d2c', '#121110', '#121110'])
  const shade = useTransform(bg, c => mobile ? `linear-gradient(0deg, ${c} 0%, ${c}cc 28%, ${c}00 62%)` : `linear-gradient(90deg, ${c}f0 0%, ${c}99 28%, ${c}00 58%)`)
  const to = y => (window.__lenis ? window.__lenis.scrollTo(y) : window.scrollTo({ top: y, behavior: 'smooth' }))
  const goStep = i => { const el = ref.current; const top = el.getBoundingClientRect().top + window.scrollY; to(top + (el.offsetHeight - window.innerHeight) * (i + .5) / 5) }
  const skip = () => { const el = ref.current; to(el.getBoundingClientRect().top + window.scrollY + el.offsetHeight) }
  const s = SERVICES[step]
  return (
    <motion.div ref={ref} style={{ backgroundColor: bg }} className="relative h-[560vh] text-[#ece7df]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {mounted && <Suspense fallback={null}><StudioFilm progress={scrollYProgress} active={active} mobile={mobile} words={WORDS[lang] || WORDS.en} /></Suspense>}
        <motion.div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: shade }} />
        {/* top */}
        <div className="pointer-events-none absolute inset-x-0 top-0 pt-[84px] md:pt-[104px]">
          <div className="mx-auto flex max-w-[1440px] items-start justify-between gap-6 px-5 md:px-10">
            <div>
              <p className={`${T.sans} flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[.22em] text-[#ece7df]/60`}><span className="h-px w-8 bg-[#c3a15e]" />{t(S.procLabel)}</p>
              <h2 className={`${T.serif} mt-3 max-w-[16ch] text-[26px] leading-[1] md:mt-4 md:text-[clamp(34px,3vw,50px)]`}>{t(S.procTitleA)} <span className="italic text-[#c3a15e]">{t(S.procTitleB)}</span> {t(S.procTitleC)}</h2>
            </div>
            <ol className="pointer-events-auto hidden flex-col items-end gap-2 md:flex" aria-label={t(S.procLabel)}>
              {SERVICES.map((x, i) => (
                <li key={i}><button onClick={() => goStep(i)} aria-current={i === step} className={`${T.sans} group flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[.18em] transition-colors ${i === step ? 'text-[#ece7df]' : 'text-[#ece7df]/35 hover:text-[#ece7df]/70'}`}>
                  <span className="hidden lg:inline">{t(x.t)}</span><span className="tabular-nums">{x.k}</span>
                  <span className={`h-px transition-all duration-500 ${i === step ? 'w-10 bg-[#c3a15e]' : 'w-4 bg-[#ece7df]/30'}`} />
                </button></li>
              ))}
            </ol>
          </div>
        </div>
        {/* bottom-left: the step */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 pb-7 md:pb-12">
          <div className="mx-auto flex max-w-[1440px] items-end justify-between gap-6 px-5 md:px-10">
            <div className="max-w-[560px]">
              <div className="flex items-end gap-4 md:gap-6">
                <div className={`${T.sans} relative flex h-[1em] shrink-0 overflow-hidden whitespace-nowrap text-[72px] font-black leading-none tracking-[-.06em] tabular-nums md:text-[clamp(120px,11vw,190px)]`} aria-hidden="true">
                  <span className="text-[#ece7df]/20">0</span>
                  <span className="relative inline-block h-[1em] w-[.62em] overflow-hidden align-top">
                    <AnimatePresence initial={false}>
                      <motion.span key={step} className="absolute inset-0 block text-[#c3a15e]" initial={{ y: '100%' }} animate={{ y: '0%' }} exit={{ y: '-100%' }} transition={{ duration: .8, ease: E }}>{step + 1}</motion.span>
                    </AnimatePresence>
                  </span>
                </div>
                <div className="pb-1 md:pb-4">
                  <div className="flex gap-1.5">{SERVICES.map((_, i) => <span key={i} className={`h-[3px] w-6 rounded-full transition-colors duration-500 md:w-8 ${i <= step ? 'bg-[#c3a15e]' : 'bg-[#ece7df]/15'}`} />)}</div>
                  <AnimatePresence mode="wait">
                    <motion.p key={'v' + step + lang} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: .5, ease: E }} className={`${T.sans} mt-3 max-w-[30ch] text-[10.5px] font-semibold uppercase leading-snug tracking-[.16em] text-[#ece7df]/55`}>{t(VIG[step])}</motion.p>
                  </AnimatePresence>
                </div>
              </div>
              <AnimatePresence mode="wait">
                <motion.div key={step + lang} className="mt-3 md:mt-5" exit={{ opacity: 0, transition: { duration: .25 } }}>
                  <h3 className={`${T.serif} text-[40px] leading-[.95] md:text-[clamp(52px,4.6vw,80px)]`}><KineticTitle text={t(s.t)} /></h3>
                  <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8, ease: E, delay: .25 }} className={`${T.sans} mt-3 max-w-[40ch] text-[14.5px] leading-relaxed text-[#ece7df]/72 md:mt-4 md:text-[16px]`}>{t(s.d)}</motion.p>
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="pointer-events-auto flex shrink-0 flex-col items-end gap-4">
              <div className="hidden h-24 w-px bg-white/15 md:block"><motion.div style={{ scaleY: bar }} className="h-full w-full origin-top bg-[#c3a15e]" /></div>
              <button onClick={skip} className={`${T.sans} h-10 rounded-full border border-white/20 px-4 text-[11.5px] font-semibold uppercase tracking-[.14em] text-[#ece7df]/80 backdrop-blur-sm transition-colors hover:bg-white/10`}>{t('skip')} ↓</button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function Process() {
  const lite = useLite()
  const reduce = useReducedMotion()
  return lite || reduce ? <ProcessFlat /> : <ProcessFilm />
}

/* ---------- 3. Sketch ↔ Reality comparison ---------- */
function Handle({ pos, onKey, label }) {
  const [v, setV] = useState(50)
  useMotionValueEvent(pos, 'change', x => setV(Math.round(x)))
  const left = useTransform(pos, x => `${x}%`)
  return (
    <motion.div style={{ left }} className="pointer-events-none absolute inset-y-0 z-20 w-0">
      <div className="absolute inset-y-0 -left-px w-[2px] bg-[#ece7df] shadow-[0_0_24px_rgba(0,0,0,.35)]" />
      <button role="slider" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={v} aria-orientation="horizontal" onKeyDown={onKey}
        className="pointer-events-auto absolute left-0 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize place-items-center rounded-full bg-[#ece7df] text-[#151412] shadow-[0_10px_40px_rgba(0,0,0,.35)] outline-none ring-[#c3a15e] ring-offset-2 ring-offset-transparent transition-transform focus-visible:ring-2 active:scale-95 md:h-20 md:w-20">
        <svg width="30" height="14" viewBox="0 0 30 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M7 1 1 7l6 6M23 1l6 6-6 6M1 7h28" /></svg>
      </button>
    </motion.div>
  )
}

function Compare() {
  const { t, lang } = useLang()
  const [idx, setIdx] = useState(0)
  const pos = useMotionValue(50)
  const stage = useRef(), drag = useRef(false), wrap = useRef()
  const inView = useInView(wrap, { once: true, margin: '-25% 0px' })
  const reduce = useReducedMotion()
  const lite = useLite(), mobile = useIsMobile()
  const nearC = useInView(wrap, { margin: '80% 0px 80% 0px' })
  const onC = useInView(stage, { margin: '10% 0px' })
  const [m3, setM3] = useState(false)
  useEffect(() => { setM3(nearC) }, [nearC])
  const use3d = !lite && !reduce
  const clipA = useTransform(pos, x => `inset(0 ${100 - x}% 0 0)`)
  const labAO = useTransform(pos, [4, 18], [0, 1]), labBO = useTransform(pos, [82, 96], [1, 0])

  const sweep = (seq, times) => { if (reduce) { pos.set(50); return } animate(pos, seq, { duration: times ? 2.4 : 1.1, ease: [0.65, 0, 0.35, 1], times }) }
  useEffect(() => { if (inView) sweep([50, 80, 22, 50], [0, .35, .75, 1]) }, [inView])
  const go = n => { setIdx((n + PAIRS.length) % PAIRS.length); pos.set(6); sweep([6, 50]) }

  const setFrom = e => { const r = stage.current.getBoundingClientRect(); pos.set(Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100))) }
  const down = e => { drag.current = true; pos.stop(); e.currentTarget.setPointerCapture?.(e.pointerId); setFrom(e) }
  const move = e => { if (drag.current) setFrom(e) }
  const up = () => { drag.current = false }
  const onKey = e => {
    const v = pos.get(), d = { ArrowLeft: -4, ArrowRight: 4, ArrowDown: -4, ArrowUp: 4, PageDown: -20, PageUp: 20 }[e.key]
    if (d) { e.preventDefault(); pos.set(Math.min(100, Math.max(0, v + d))) }
    if (e.key === 'Home') { e.preventDefault(); pos.set(0) }
    if (e.key === 'End') { e.preventDefault(); pos.set(100) }
  }
  const P = PAIRS[idx], L = PAIR_LAB[idx]
  return (
    <div ref={wrap} className="relative overflow-hidden bg-[#27414f] text-[#ece7df]">
      <div className="mx-auto max-w-[1440px] px-5 pb-20 pt-20 md:px-10 md:pb-28 md:pt-28">
        <div className="grid items-end gap-8 md:grid-cols-12">
          <h2 className="md:col-span-8">
            <span className={`${T.sans} mb-6 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[.22em] text-[#ece7df]/60`}><span className="h-px w-8 bg-[#c3a15e]" />{t(S.cmpLabel)}</span>
            <span className="block overflow-hidden"><motion.span initial={{ y: '100%' }} whileInView={{ y: 0 }} viewport={{ once: true }} transition={{ duration: 1.1, ease: E }} className={`${T.serif} block text-[64px] italic leading-[.88] md:text-[clamp(96px,10vw,168px)]`}>{t(S.cmpA)} <span className="not-italic text-[#c3a15e]">↔</span></motion.span></span>
            <span className="block overflow-hidden"><motion.span initial={{ y: '100%' }} whileInView={{ y: 0 }} viewport={{ once: true }} transition={{ duration: 1.1, ease: E, delay: .08 }} className={`${T.sans} block text-[60px] font-black uppercase leading-[.86] tracking-[-.05em] md:text-[clamp(88px,9.4vw,160px)]`}>{t(S.cmpB)}</motion.span></span>
          </h2>
          <p className={`${T.sans} max-w-[40ch] text-[15px] leading-relaxed text-[#ece7df]/70 md:col-span-4 md:pb-4`}>{t(S.cmpLead)}</p>
        </div>

        <div className="mt-12 md:mt-16">
          <div ref={stage} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
            className="relative aspect-[4/5] w-full cursor-ew-resize select-none overflow-hidden rounded-[6px] bg-[#1d323d] sm:aspect-[16/10] md:max-h-[80vh]" style={{ touchAction: 'pan-y' }}>
            <AnimatePresence initial={false}>
              <motion.div key={idx} className="absolute inset-0" initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: .9, ease: E }}>
                <img src={img(P.b, mobile)} alt={`${t(P.t)} — ${t(L[1])}`} draggable="false" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
                <motion.div className="absolute inset-0 bg-[#f4f1ec]" style={{ clipPath: clipA }}>
                  <img src={img(P.a, mobile)} alt={`${t(P.t)} — ${t(L[0])}`} draggable="false" loading="lazy" decoding="async" className={`absolute inset-0 h-full w-full ${idx === 0 ? 'object-cover object-[50%_55%]' : 'object-cover'}`} />
                </motion.div>
              </motion.div>
            </AnimatePresence>
            {use3d && m3 && <Suspense fallback={null}><Compare3D pairs={PAIRS} idx={idx} pos={pos} small={mobile} mobile={mobile} active={onC} /></Suspense>}
            <motion.span style={{ opacity: labAO }} className={`${T.sans} pointer-events-none absolute left-4 top-4 z-10 rounded-full bg-[#151412]/80 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[.18em] text-[#ece7df] backdrop-blur md:left-6 md:top-6`}>{t(L[0])}</motion.span>
            <motion.span style={{ opacity: labBO }} className={`${T.sans} pointer-events-none absolute right-4 top-4 z-10 rounded-full bg-[#ece7df]/90 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[.18em] text-[#151412] md:right-6 md:top-6`}>{t(L[1])}</motion.span>
            <Handle pos={pos} onKey={onKey} label={`${t(S.slider)} — ${t(P.t)}`} />
            <span className={`${T.sans} pointer-events-none absolute bottom-4 left-4 z-10 rounded-full bg-black/35 px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[.18em] text-white/85 backdrop-blur md:bottom-6 md:left-6`}>{t(S.drag)}</span>
          </div>

          <div className="mt-6 flex items-center justify-between gap-4">
            <AnimatePresence mode="wait">
              <motion.p key={idx + lang} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: .4, ease: E }} className={`${T.serif} text-[26px] leading-tight md:text-[36px]`}>
                <span className={`${T.sans} mr-3 align-middle text-[12px] font-semibold tabular-nums tracking-[.18em] text-[#c3a15e]`}>0{idx + 1} / 0{PAIRS.length}</span>{t(P.t)}
              </motion.p>
            </AnimatePresence>
            <div className="flex shrink-0 gap-2">
              <button onClick={() => go(idx - 1)} aria-label={t(S.prev)} className="grid h-12 w-12 place-items-center rounded-full border border-[#ece7df]/25 transition-colors hover:bg-[#ece7df] hover:text-[#151412]">←</button>
              <button onClick={() => go(idx + 1)} aria-label={t(S.next)} className="grid h-12 w-12 place-items-center rounded-full border border-[#ece7df]/25 transition-colors hover:bg-[#ece7df] hover:text-[#151412]">→</button>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {PAIRS.map((q, i) => (
              <button key={i} onClick={() => i !== idx && go(i)} aria-pressed={i === idx} className={`group text-left transition-opacity ${i === idx ? 'opacity-100' : 'opacity-55 hover:opacity-90'}`}>
                <div className="relative flex aspect-[16/9] overflow-hidden rounded-[4px] bg-[#1d323d]">
                  <img src={img(q.a, 1)} alt="" loading="lazy" decoding="async" className="h-full w-1/2 bg-[#f4f1ec] object-cover" />
                  <img src={img(q.b, 1)} alt="" loading="lazy" decoding="async" className="h-full w-1/2 object-cover" />
                  <span className="absolute inset-y-0 left-1/2 w-px bg-[#ece7df]" />
                </div>
                <div className="mt-3 h-[2px] w-full bg-[#ece7df]/15"><div className={`h-full bg-[#c3a15e] transition-[width] duration-700 ${i === idx ? 'w-full' : 'w-0'}`} /></div>
                <p className={`${T.sans} mt-2 text-[11px] font-semibold uppercase tracking-[.14em] text-[#ece7df]/80`}><span className="tabular-nums text-[#c3a15e]">0{i + 1}</span> · {t(PAIR_LAB[i][0])} → {t(PAIR_LAB[i][1])}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Studio() {
  return (
    <section id="studio" className="relative bg-[#ece7df]">
      <Statement />
      <Process />
      <Compare />
    </section>
  )
}
