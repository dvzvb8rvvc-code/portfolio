import React, { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent, useReducedMotion } from 'framer-motion'
import { useLite } from '../../lib/kit'
import { useLang } from './i18n'
import { T, PERSON, SCALE, COMO, img } from './data'

const Hero3D = lazy(() => import('./hero3d'))
const E = [0.16, 1, 0.3, 1]
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const seg = (p, a, b) => clamp((p - a) / (b - a))
const ease = t => 1 - Math.pow(1 - t, 3)

/* giant words behind the model — one per chapter of the film */
const WORDS = { en: ['Sketch', 'Stone', 'Scale', 'Como'], it: ['Schizzo', 'Pietra', 'Scala', 'Como'] }
const STAGES = { en: ['Sketch', 'Stone', 'Scale', 'Place'], it: ['Schizzo', 'Pietra', 'Scala', 'Luogo'] }

const S = {
  eyebrow: { en: 'Architecture & development · Israel · Italy', it: 'Architettura e sviluppo · Israele · Italia' },
  title: { en: 'Yehiel Tsubery Architects', it: 'Yehiel Tsubery Architects' },
  residences: { en: 'Explore the residences', it: 'Scopri le residenze' },
  scroll: { en: 'Scroll — from sketch to stone', it: 'Scorri — dallo schizzo alla pietra' },
  n1a: { en: 'It begins as a line', it: 'Tutto nasce da una linea' },
  n1b: { en: 'drawn by hand —', it: 'tracciata a mano —' },
  n1c: { en: 'and becomes stone.', it: 'e diventa pietra.' },
  n2a: { en: 'One studio.', it: 'Uno studio.' },
  n2b: { en: 'Three scales.', it: 'Tre scale.' },
  n2c: { en: 'Large-scale commercial, public and residential architecture — designed in Israel and Italy.', it: 'Architettura commerciale, pubblica e residenziale di grande scala — progettata tra Israele e Italia.' },
  cap: { en: 'Render · Perledo, Lake Como', it: 'Render · Perledo, Lago di Como' },
  capLink: { en: 'Enter the residence', it: 'Entra nella residenza' },
  sketchShort: { en: 'Original sketch', it: 'Schizzo originale' },
  sketchCap: { en: 'Original sketch · Yehiel Tsubery', it: 'Schizzo originale · Yehiel Tsubery' },
}

function useMQ(q) {
  const [m, set] = useState(() => typeof window !== 'undefined' && matchMedia(q).matches)
  useEffect(() => { const mq = matchMedia(q), f = () => set(mq.matches); mq.addEventListener('change', f); return () => mq.removeEventListener('change', f) }, [q])
  return m
}

function skipTo() {
  const el = document.getElementById('studio')
  if (!el) return
  window.__lenis ? window.__lenis.scrollTo(el, { offset: 0, duration: 1.6 }) : el.scrollIntoView({ behavior: 'smooth' })
}

function GiantWord({ word, outline }) {
  const len = word.length
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-[40%] flex -translate-y-1/2 select-none justify-center md:top-[40%]">
      <AnimatePresence initial={false}>
        <motion.div key={word} className={`absolute flex overflow-hidden ${T.sans} font-black uppercase leading-[.82] tracking-[-.055em]`} style={{ fontSize: `min(${118 / len}vw, 38vh)` }}>
          {[...word].map((c, i) => (
            <motion.span key={i} className="inline-block pb-[.06em]" initial={{ y: '105%' }} animate={{ y: '0%' }} exit={{ y: '-105%' }} transition={{ duration: .9, ease: E, delay: i * .035 }}
              style={outline ? { color: 'transparent', WebkitTextStroke: '1.4px rgba(21,20,18,.32)' } : { color: '#ddd4c6' }}>{c}</motion.span>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function IntroText({ o, y }) {
  const { t } = useLang()
  return (
    <motion.div style={{ opacity: o, y }} className="absolute inset-x-0 bottom-0 z-20">
      <div className="mx-auto max-w-[1440px] px-5 pb-[max(28px,env(safe-area-inset-bottom))] md:px-10 md:pb-12">
        <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .9, ease: E, delay: .1 }} className={`${T.sans} mb-3 text-[10px] font-semibold uppercase tracking-[.16em] text-[#151412]/60 md:mb-4 md:text-[12px] md:tracking-[.22em]`}>{t(S.eyebrow)}</motion.p>
        <h1 className={`${T.serif} max-w-[16ch] text-[42px] leading-[.92] tracking-[-.01em] text-[#151412] sm:text-[64px] md:text-[clamp(64px,7vw,112px)]`}>
          <span className="block overflow-hidden"><motion.span className="block" initial={{ y: '105%' }} animate={{ y: 0 }} transition={{ duration: 1.1, ease: E, delay: .15 }}><span className={`${T.sans} mr-3 align-[.12em] text-[.42em] font-black tracking-[-.03em]`}>YTS —</span>Yehiel Tsubery</motion.span></span>
          <span className="block overflow-hidden"><motion.span className="block italic text-[#151412]/80" initial={{ y: '105%' }} animate={{ y: 0 }} transition={{ duration: 1.1, ease: E, delay: .25 }}>Architects</motion.span></span>
        </h1>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: .5 }} className="mt-4 flex flex-col-reverse gap-4 md:mt-8 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <a href="#residences" className={`${T.sans} inline-flex h-11 items-center gap-2 rounded-full bg-[#151412] px-4 text-[13px] md:h-12 md:px-6 md:text-[14px] font-semibold text-[#ece7df] transition-colors hover:bg-[#b06a35]`}>{t(S.residences)} <span aria-hidden>→</span></a>
            <a href="#contact" className={`${T.sans} inline-flex h-11 items-center rounded-full border border-[#151412]/25 px-4 text-[13px] md:h-12 md:px-6 md:text-[14px] font-semibold text-[#151412] transition-colors hover:border-[#151412]`}>{t('cta.inquire')}</a>
          </div>
          <div className="flex items-end gap-10">
            <p className={`${T.serif} text-[24px] italic leading-none text-[#151412] md:text-[30px]`}><span className="mr-3 inline-block h-px w-10 bg-[#b06a35] align-middle" />{t(PERSON.motto)}</p>
            <p className={`${T.sans} hidden text-[11px] font-semibold uppercase tracking-[.2em] text-[#151412]/50 xl:block`}>{t(S.scroll)}</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

function Hud({ p, stage }) {
  const { lang } = useLang()
  const w = useTransform(p, [0, 1], ['0%', '100%'])
  return (
    <div className="pointer-events-none absolute left-5 right-[100px] top-[84px] z-20 md:left-auto md:right-10 md:top-[96px] md:w-[300px]">
      <div className={`${T.sans} flex justify-between text-[10.5px] font-semibold uppercase tracking-[.16em] tabular-nums`}>
        {STAGES[lang].map((s, i) => (
          <span key={i} className={`transition-colors duration-500 ${i === stage ? 'text-[#151412]' : 'text-[#151412]/35'}`}>0{i + 1} <span className="hidden sm:inline">{s}</span></span>
        ))}
      </div>
      <div className="mt-2 h-px w-full bg-[#151412]/15"><motion.div className="h-px bg-[#b06a35]" style={{ width: w }} /></div>
    </div>
  )
}

function SkipBtn({ o }) {
  const { t } = useLang()
  return (
    <motion.button style={{ opacity: o }} onClick={skipTo} className={`${T.sans} absolute bottom-6 right-5 z-40 hidden h-10 items-center gap-2 rounded-full border border-[#151412]/20 bg-[#ece7df]/70 px-4 text-[12px] font-semibold uppercase tracking-[.14em] text-[#151412] backdrop-blur-md transition-colors hover:bg-[#151412] hover:text-[#ece7df] md:right-10 md:inline-flex`}>
      {t('skip')} <span aria-hidden>↓</span>
    </motion.button>
  )
}

function MobileSkip({ o }) {
  const { t } = useLang()
  return <motion.button style={{ opacity: o }} onClick={skipTo} className={`${T.sans} absolute right-5 top-[72px] z-40 h-8 rounded-full border border-[#151412]/20 bg-[#ece7df]/80 px-3 text-[11px] font-semibold uppercase tracking-[.14em] text-[#151412] md:hidden`}>{t('skip')} ↓</motion.button>
}

/* final chapter: his real render takes over full-bleed */
function RenderReveal({ p, from = .7, to = .9 }) {
  const { t } = useLang()
  const clip = useTransform(p, v => { const k = ease(seg(v, from, to)); const a = (1 - k) * 50, b = (1 - k) * 50; return `inset(${a}% ${b}% ${a}% ${b}% round ${(1 - k) * 18}px)` })
  const sc = useTransform(p, [from, 1], [1.28, 1])
  const capO = useTransform(p, [to - .04, to + .03], [0, 1])
  const capY = useTransform(p, [to - .04, to + .03], [24, 0])
  return (
    <motion.div className="absolute inset-0 z-30 overflow-hidden" style={{ clipPath: clip }}>
      <motion.img src={img(COMO.imgs.render[0])} srcSet={`${img(COMO.imgs.render[0], 1)} 720w, ${img(COMO.imgs.render[0])} 1800w`} sizes="100vw" alt="Il Giardino di Teodolinda — render, Lake Como" decoding="async" className="h-full w-full object-cover object-[50%_45%]" style={{ scale: sc }} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/20" />
      <motion.div style={{ opacity: capO, y: capY }} className="absolute inset-x-0 bottom-0">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-5 pb-10 md:flex-row md:items-end md:justify-between md:px-10 md:pb-14">
          <div>
            <p className={`${T.sans} mb-3 text-[11px] font-semibold uppercase tracking-[.22em] text-white/70`}>{t(S.cap)}</p>
            <p className={`${T.serif} text-[44px] leading-[.95] text-white md:text-[clamp(56px,6.4vw,104px)]`}>Il Giardino <span className="italic">di Teodolinda</span></p>
            <p className={`${T.sans} mt-3 text-[13px] font-medium uppercase tracking-[.18em] text-white/80`}>Lake Como · Italy</p>
          </div>
          <a href="#residences" className={`${T.sans} inline-flex h-12 w-fit items-center gap-2 rounded-full bg-white px-6 text-[14px] font-semibold text-[#151412]`}>{t(S.capLink)} →</a>
        </div>
      </motion.div>
    </motion.div>
  )
}

function Note({ p, a, b, children, className = '' }) {
  const o = useTransform(p, [a, a + .05, b - .05, b], [0, 1, 1, 0])
  const y = useTransform(p, [a, a + .05, b - .05, b], [30, 0, 0, -30])
  return <motion.div style={{ opacity: o, y }} className={`pointer-events-none absolute z-20 ${className}`}>{children}</motion.div>
}

function useStage(p, cuts) {
  const [s, set] = useState(0)
  useMotionValueEvent(p, 'change', v => { let k = 0; cuts.forEach((c, i) => { if (v >= c) k = i + 1 }); set(k) })
  return s
}

function useNear(ref) {
  const [near, set] = useState(true)
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => set(e.isIntersecting), { rootMargin: '100% 0px' })
    ref.current && io.observe(ref.current)
    return () => io.disconnect()
  }, [])
  return near
}

/* desktop: procedural 3D film */
function Film3D() {
  const { t, lang } = useLang()
  const ref = useRef()
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const stage = useStage(p, [.08, .4, .7])
  const near = useNear(ref)
  const [covered, setCovered] = useState(false)
  useMotionValueEvent(p, 'change', v => setCovered(v > .93))
  const introO = useTransform(p, [0, .07], [1, 0]), introY = useTransform(p, [0, .07], [0, -50])
  const skipO = useTransform(p, [.9, .97], [1, 0])
  return (
    <section id="hero" ref={ref} className="relative h-[340vh] bg-[#ece7df]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[.5]" style={{ backgroundImage: 'linear-gradient(rgba(21,20,18,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(21,20,18,.05) 1px, transparent 1px)', backgroundSize: '48px 48px', maskImage: 'radial-gradient(ellipse 70% 60% at 60% 45%, #000 30%, transparent 75%)', WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 60% 45%, #000 30%, transparent 75%)' }} />
        <GiantWord word={WORDS[lang][stage]} outline={stage === 0} />
        <div className="absolute inset-0 z-10">
          {near && <Suspense fallback={null}><Hero3D progress={p} labels={SCALE[lang]} active={near && !covered} /></Suspense>}
        </div>
        <Hud p={p} stage={stage} />
        <IntroText o={introO} y={introY} />
        <Note p={p} a={.1} b={.4} className="bottom-14 left-10">
          <p className={`${T.serif} text-[clamp(40px,4.4vw,72px)] leading-[.98] text-[#151412]`}>{t(S.n1a)}<br /><span className="italic text-[#b06a35]">{t(S.n1b)}</span><br />{t(S.n1c)}</p>
        </Note>
        <Note p={p} a={.42} b={.71} className="bottom-14 left-10 max-w-[440px]">
          <p className={`${T.serif} text-[clamp(44px,4.8vw,80px)] leading-[.95] text-[#151412]`}>{t(S.n2a)}<br /><span className="italic">{t(S.n2b)}</span></p>
          <p className={`${T.sans} mt-5 max-w-[34ch] text-[15px] leading-relaxed text-[#151412]/70`}>{t(S.n2c)}</p>
        </Note>
        <RenderReveal p={p} />
        <SkipBtn o={skipO} />
      </div>
    </section>
  )
}

/* mobile / lite: his own sketch draws in, the render wipes over it, then goes full-bleed */
function FilmImg() {
  const { t, lang } = useLang()
  const ref = useRef()
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const stage = useStage(p, [.12, .45, .66])
  const introO = useTransform(p, [0, .1], [1, 0]), introY = useTransform(p, [0, .1], [0, -40])
  const wipe = useTransform(p, v => `inset(${(1 - ease(seg(v, .15, .45))) * 100}% 0 0 0)`)
  const lineY = useTransform(p, v => `${(1 - ease(seg(v, .15, .45))) * 100}%`)
  const lineO = useTransform(p, [.14, .16, .44, .46], [0, 1, 1, 0])
  const cardSc = useTransform(p, [0, .12, .45, .66], [1, 1.3, 1.3, 1.15])
  const skipO = useTransform(p, [.85, .95], [1, 0])
  const labA = useTransform(p, [.12, .2, .45, .5], [1, 1, 1, 0])
  return (
    <section id="hero" ref={ref} className="relative h-[300vh] bg-[#ece7df]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <GiantWord word={WORDS[lang][Math.min(stage, 3)]} outline={stage === 0} />
        <motion.div style={{ scale: cardSc, x: '-50%', transformOrigin: '50% 0%' }} className="absolute left-1/2 top-[108px] z-10 h-[calc(100svh-390px)] min-h-[220px] md:top-[140px] md:h-[calc(100svh-300px)]">
          <div className="relative h-full overflow-hidden rounded-[6px] bg-white shadow-[0_24px_50px_-24px_rgba(21,20,18,.4)]" style={{ aspectRatio: '3508/4960' }}>
            <motion.img src={img(30, 1)} alt={t(S.sketchCap)} width="720" height="1018" decoding="async" className="absolute inset-0 h-full w-full object-cover" initial={{ clipPath: 'inset(0 0 100% 0)' }} animate={{ clipPath: 'inset(0 0 0% 0)' }} transition={{ duration: 2.4, ease: [0.65, 0, 0.35, 1], delay: .2 }} />
            <motion.img src={img(5, 1)} alt="Il Giardino di Teodolinda — render" width="720" height="900" decoding="async" className="absolute inset-0 h-full w-full object-cover" style={{ clipPath: wipe }} />
            <motion.div className="absolute inset-x-0 h-px bg-[#b06a35]" style={{ top: lineY, opacity: lineO }} />
            <motion.span style={{ opacity: labA }} className={`${T.sans} absolute left-2 top-2 rounded-full bg-[#ece7df]/90 px-2 py-0.5 text-[8.5px] font-semibold uppercase tracking-[.16em] text-[#151412] whitespace-nowrap`}>{t(S.sketchShort)}</motion.span>
          </div>
        </motion.div>
        <Hud p={p} stage={stage} />
        <MobileSkip o={skipO} />
        <IntroText o={introO} y={introY} />
        <Note p={p} a={.14} b={.46} className="bottom-8 left-5 right-5">
          <p className={`${T.serif} text-[36px] leading-[1] text-[#151412]`}>{t(S.n1a)} <span className="italic text-[#b06a35]">{t(S.n1b)}</span> {t(S.n1c)}</p>
        </Note>
        <Note p={p} a={.44} b={.68} className="bottom-8 left-5 right-5">
          <p className={`${T.serif} text-[38px] leading-[1] text-[#151412]`}>{t(S.n2a)} <span className="italic">{t(S.n2b)}</span></p>
          <p className={`${T.sans} mt-2 text-[13px] font-semibold uppercase tracking-[.14em] text-[#151412]/60`}>{SCALE[lang].join(' · ')}</p>
        </Note>
        <RenderReveal p={p} from={.66} to={.86} />
      </div>
    </section>
  )
}

function StaticHero() {
  const { t, lang } = useLang()
  return (
    <section id="hero" className="relative grid min-h-[100svh] bg-[#ece7df] md:grid-cols-2">
      <div className="relative order-2 flex flex-col justify-end px-5 pb-12 pt-10 md:order-1 md:px-10 md:pt-28">
        <p className={`${T.sans} mb-4 text-[12px] font-semibold uppercase tracking-[.22em] text-[#151412]/60`}>{t(S.eyebrow)}</p>
        <h1 className={`${T.serif} text-[52px] leading-[.92] md:text-[96px]`}><span className={`${T.sans} mr-3 text-[.42em] font-black`}>YTS —</span>Yehiel Tsubery <span className="italic">Architects</span></h1>
        <p className={`${T.serif} mt-6 text-[28px] italic`}>{t(PERSON.motto)}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#residences" className={`${T.sans} inline-flex h-12 items-center rounded-full bg-[#151412] px-6 text-[14px] font-semibold text-[#ece7df]`}>{t(S.residences)} →</a>
          <a href="#contact" className={`${T.sans} inline-flex h-11 items-center rounded-full border border-[#151412]/25 px-4 text-[13px] md:h-12 md:px-6 md:text-[14px] font-semibold`}>{t('cta.inquire')}</a>
        </div>
      </div>
      <figure className="relative order-1 min-h-[50svh] md:order-2">
        <img src={img(5)} alt="Il Giardino di Teodolinda — render, Lake Como" className="absolute inset-0 h-full w-full object-cover" />
        <figcaption className={`${T.sans} absolute bottom-4 left-4 rounded-full bg-[#ece7df]/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[.14em]`}>Il Giardino di Teodolinda · Lake Como</figcaption>
      </figure>
    </section>
  )
}

export default function Hero() {
  const reduce = useReducedMotion()
  const lite = useLite()
  const mobile = useMQ('(max-width: 768px)')
  if (reduce) return <StaticHero />
  return mobile || lite ? <FilmImg /> : <Film3D />
}
