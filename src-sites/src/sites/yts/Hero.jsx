import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { useLite } from '../../lib/kit'
import { useLang } from './i18n'
import { useStage, stage } from './engine'
import { T, PERSON, img } from './data'

/* HERO v4 — DOM layer. The showreel itself (4 renders as real depth, liquid transitions) lives in
   sceneHero.jsx on the shared canvas; this file carries type, counter, CTAs and the scroll beat.
   The two sides talk through stage.hero = { i, k, ready, go } (read in a rAF loop, no per-frame state). */

const E = [0.22, 1, 0.36, 1] // long, quiet ease-out
const GOLD = '#c3a15e'

// keep in sync with IDS in sceneHero.jsx
const SLIDES = [
  { id: 5, w: 1440, h: 1800, pos: '47% 44%', l: { en: 'Il Giardino di Teodolinda · Lake Como', it: 'Il Giardino di Teodolinda · Lago di Como' } },
  { id: 103, w: 1800, h: 1519, pos: '79% 50%', l: { en: 'Studio work · Render', it: 'Progetto dello studio · Render' } },
  { id: 111, w: 1800, h: 1125, pos: '57% 50%', l: { en: 'Residential · Studio work', it: 'Residenziale · Progetto dello studio' } },
  { id: 84, w: 1800, h: 900, pos: '55% 50%', l: { en: 'Studio work · Render', it: 'Progetto dello studio · Render' } },
]

const S = {
  top: { en: 'YTS Architects · Architecture & development · Israel — Italy', it: 'YTS Architects · Architettura e sviluppo · Israele — Italia' },
  topS: { en: 'Israel — Italy', it: 'Israele — Italia' },
  explore: { en: 'Explore residences', it: 'Scopri le residenze' },
  scroll: { en: 'Scroll', it: 'Scorri' },
  reel: { en: 'Selected work', it: 'Progetti scelti' },
  show: { en: 'Show project', it: 'Mostra progetto' },
}

/* the transparent nav sits on a dark film here → flip its ink to light until it turns solid (owned by yts.jsx) */
const NAV_CSS = `#top header:not(.backdrop-blur-xl)>div:nth-child(2){filter:invert(1) hue-rotate(180deg) brightness(1.04)}#top header>div:nth-child(2){transition:filter .6s ease}`

function Rise({ children, d = 0, className = '' }) {
  return (
    <span className="block overflow-hidden pb-[.08em] -mb-[.04em]">
      <motion.span className={`block ${className}`} initial={{ y: '112%' }} animate={{ y: '0%' }} transition={{ duration: 1.9, ease: E, delay: d }}>{children}</motion.span>
    </span>
  )
}

function Fade({ children, d = 0, className = '' }) {
  return <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.6, ease: E, delay: d }} className={className}>{children}</motion.div>
}

function Title({ p }) {
  const { t } = useLang()
  const o = useTransform(p, [0, .4], [1, 0])
  const sc = useTransform(p, [0, .5], [1, .93])
  const y = useTransform(p, [0, .5], [0, -46])
  const blur = useTransform(p, [0, .42], ['blur(0px)', 'blur(14px)'])
  const ev = useTransform(p, v => (v > .3 ? 'none' : 'auto'))
  return (
    <motion.div style={{ opacity: o, scale: sc, y, filter: blur, pointerEvents: ev }} className="absolute inset-x-0 bottom-0 z-20 origin-bottom-left">
      <div className="mx-auto max-w-[1440px] px-6 pb-[max(36px,calc(env(safe-area-inset-bottom)+24px))] md:px-12 md:pb-16">
        <Fade d={.2} className={`${T.sans} mb-5 flex items-center gap-4 text-[10px] font-medium uppercase tracking-[.34em] text-[#f3ede3]/70 md:mb-7 md:text-[11px] md:tracking-[.4em]`}>
          <span className="h-px w-10 bg-[#c3a15e]" />{t(PERSON.motto)}
        </Fade>
        <h1 className={`${T.serif} text-[#f6f1e8] text-[clamp(64px,19vw,96px)] leading-[.86] tracking-[-.02em] md:text-[clamp(96px,11.4vw,200px)]`}>
          <Rise d={.15}>Yehiel</Rise>
          <Rise d={.3} className="italic text-[#e9dcc0] md:pl-[.9em]">Tsubery</Rise>
        </h1>
        <Fade d={1.1} className="mt-8 flex flex-wrap items-center gap-3 md:mt-11 md:gap-4">
          <a href="#como" className={`${T.sans} group inline-flex h-12 items-center gap-3 rounded-full bg-[#f3ede3] px-6 text-[12px] font-semibold uppercase tracking-[.18em] text-[#151412] transition-colors duration-500 hover:bg-[#c3a15e] md:h-[52px] md:px-7`}>
            {t(S.explore)} <span aria-hidden className="transition-transform duration-500 group-hover:translate-x-1">→</span>
          </a>
          <a href="#contact" className={`${T.sans} inline-flex h-12 items-center rounded-full border border-[#f3ede3]/30 px-6 text-[12px] font-semibold uppercase tracking-[.18em] text-[#f3ede3] backdrop-blur-[2px] transition-colors duration-500 hover:border-[#c3a15e] hover:text-[#e6c88e] md:h-[52px] md:px-7`}>{t('cta.inquire')}</a>
        </Fade>
      </div>
    </motion.div>
  )
}

function TopLine({ p }) {
  const { t } = useLang()
  const o = useTransform(p, [0, .25], [1, 0])
  return (
    <motion.div style={{ opacity: o }} className="pointer-events-none absolute inset-x-0 top-[76px] z-20 max-md:hidden md:top-[92px]">
      <Fade d={.5} className={`${T.sans} mx-auto flex max-w-[1440px] items-center gap-4 px-6 text-[10px] font-medium uppercase tracking-[.32em] text-[#f3ede3]/75 md:px-12 md:text-[11px] md:tracking-[.38em]`}>
        <span className="hidden md:inline">{t(S.top)}</span>
        <span className="md:hidden">YTS Architects · {t(S.topS)}</span>
      </Fade>
    </motion.div>
  )
}

function Tick({ n, active, bar, onGo, label }) {
  return (
    <button onClick={() => onGo(n)} aria-label={`${label} ${n + 1}`} aria-current={active ? 'true' : undefined} className="group relative h-6 flex-1 pointer-events-auto">
      <span className="absolute inset-x-0 top-1/2 h-px bg-[#f3ede3]/20 transition-colors duration-500 group-hover:bg-[#f3ede3]/45" />
      {active && <span ref={bar} className="absolute left-0 right-0 top-1/2 h-px origin-left bg-[#c3a15e]" style={{ transform: 'scaleX(0)' }} />}
    </button>
  )
}

function Reel({ p, i, bar }) {
  const { t } = useLang()
  const o = useTransform(p, [0, .3], [1, 0])
  const go = n => { if (stage.hero) stage.hero.go = n }
  return (
    <motion.div style={{ opacity: o }} className="pointer-events-none absolute right-6 top-[122px] z-30 w-[150px] md:bottom-16 md:right-12 md:top-auto md:w-[280px]">
      <Fade d={1.4}>
        <div className={`${T.sans} flex items-baseline justify-between text-[#f3ede3]`}>
          <span className="text-[10px] font-medium uppercase tracking-[.34em] text-[#f3ede3]/60 max-md:hidden">{t(S.reel)}</span>
          <span className="tabular-nums tracking-[.2em]">
            <span className={`${T.serif} text-[22px] italic text-[#e9dcc0] md:text-[26px]`}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span key={i} className="inline-block" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: .7, ease: E }}>0{i + 1}</motion.span>
              </AnimatePresence>
            </span>
            <span className="ml-2 text-[10px] text-[#f3ede3]/50">/ 0{SLIDES.length}</span>
          </span>
        </div>
        <div className="mt-2 flex gap-2">
          {SLIDES.map((_, n) => <Tick key={n} n={n} active={n === i} bar={bar} onGo={go} label={t(S.show)} />)}
        </div>
        <div className="relative mt-2 h-[30px] overflow-hidden md:h-4">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: .9, ease: E }}
              className={`${T.sans} max-md:hidden text-right text-[9.5px] font-medium uppercase leading-[1.5] tracking-[.24em] text-[#f3ede3]/70 md:text-[10px] md:tracking-[.3em]`}>
              {t(SLIDES[i].l)}
            </motion.p>
          </AnimatePresence>
        </div>
      </Fade>
    </motion.div>
  )
}

function ScrollCue({ p }) {
  const { t } = useLang()
  const o = useTransform(p, [0, .12], [1, 0])
  return (
    <motion.div style={{ opacity: o }} className="pointer-events-none absolute bottom-6 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-3 md:flex">
      <Fade d={2}>
        <div className="flex flex-col items-center gap-3">
          <span className={`${T.sans} text-[9.5px] font-medium uppercase tracking-[.42em] text-[#f3ede3]/60`}>{t(S.scroll)}</span>
          <span className="relative block h-10 w-px overflow-hidden bg-[#f3ede3]/15">
            <motion.span className="absolute left-0 top-0 block h-4 w-px bg-[#c3a15e]" animate={{ y: [-16, 40] }} transition={{ duration: 2.4, ease: [0.65, 0, 0.35, 1], repeat: Infinity, repeatDelay: .4 }} />
          </span>
        </div>
      </Fade>
    </motion.div>
  )
}

function Film() {
  const { t } = useLang()
  const ref = useRef()
  useStage('hero', ref)
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const [i, setI] = useState(0)
  const [ready, setReady] = useState(false)
  const bar = useRef()
  const iR = useRef(0)
  useEffect(() => {
    let raf, done = false, rbV = -1, rbS = -1
    const loop = () => {
      const h = stage.hero
      if (h && window.scrollY < window.innerHeight * 2) {
        if (h.ready && !done) { done = true; setReady(true) }
        if (h.i !== iR.current) { iR.current = h.i; setI(h.i) }
        if (bar.current) bar.current.style.transform = `scaleX(${h.k.toFixed(4)})`
      }
      // demo ribbon offset above the film (fonts can re-wrap it) + floor mask that follows it until the film pins
      if (ref.current && window.scrollY < window.innerHeight * 2) {
        const top = ref.current.getBoundingClientRect().top, r = Math.max(0, Math.round(top + window.scrollY)), v = Math.max(0, Math.round(top))
        if (r !== rbV) { rbV = r; ref.current.style.setProperty('--rb', r + 'px') }
        if (v !== rbS) { rbS = v; ref.current.style.setProperty('--rbs', v + 'px') }
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])
  // paper hand-off for the DOM poster too (if WebGL is slow or missing, the poster still dissolves to paper)
  const paper = useTransform(p, [.56, .94], [0, 1])
  const s0 = SLIDES[0]
  return (
    <section id="hero" ref={ref} className="relative h-[160vh]">
      <style>{NAV_CSS}</style>
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* instant first frame: poster of slide 01 (same framing), dissolves into the live depth film */}
        <motion.div initial={false} animate={{ opacity: ready ? 0 : 1 }} transition={{ duration: 1.6, ease: E, delay: ready ? .2 : 0 }} className="absolute inset-0 bg-[#0c0b09]">
          <img src={img(s0.id)} alt={t(s0.l)} width={s0.w} height={s0.h} decoding="async" fetchpriority="high"
            className="h-full w-full scale-[1.1] object-cover [filter:saturate(.84)_brightness(.86)]" style={{ objectPosition: s0.pos }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/35" />
        </motion.div>
        <div className="absolute inset-x-0 top-0 h-[calc(100%-2*var(--rb,0px))]">
          <TopLine p={p} />
          <Title p={p} />
          <Reel p={p} i={i} bar={bar} />
          <ScrollCue p={p} />
        </div>
        {/* deep cinematic floor; also masks a Chrome compositing gap under the canvas while the demo ribbon is still in view */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-[22vh] bg-gradient-to-b from-transparent to-[#0a0907]/80" />
        <div className="pointer-events-none absolute inset-0 z-[5] bg-gradient-to-r from-black/55 via-black/15 to-transparent max-md:bg-gradient-to-t max-md:from-black/70 max-md:via-black/20" />
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[5] h-[calc(var(--rbs,0px)*1.25)] bg-gradient-to-b from-[#0a0907]/0 via-[#0a0907] via-[20%] to-[#0a0907]" />
        <motion.div style={{ opacity: paper }} className="pointer-events-none absolute inset-0 z-[25] bg-[#ece7df]" />
      </div>
    </section>
  )
}

/* lite / reduced motion: a still of slide 01, full bleed, with the same type */
function StaticHero() {
  const { t } = useLang()
  const s0 = SLIDES[0]
  return (
    <section id="hero" className="relative min-h-[100svh] overflow-hidden bg-[#0c0b09]">
      <style>{NAV_CSS}</style>
      <img src={img(s0.id)} srcSet={`${img(s0.id, 1)} 720w, ${img(s0.id)} 1800w`} sizes="100vw" alt={t(s0.l)} width={s0.w} height={s0.h} decoding="async" fetchpriority="high"
        className="absolute inset-0 h-full w-full object-cover [filter:saturate(.84)_brightness(.86)]" style={{ objectPosition: s0.pos }} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />
      <div className="relative mx-auto flex min-h-[100svh] max-w-[1440px] flex-col justify-end px-6 pb-12 pt-32 md:px-12 md:pb-16">
        <p className={`${T.sans} mb-auto text-[10px] font-medium uppercase tracking-[.32em] text-[#f3ede3]/75 md:text-[11px]`}>{t(S.top)}</p>
        <p className={`${T.sans} mb-5 flex items-center gap-4 text-[10px] font-medium uppercase tracking-[.34em] text-[#f3ede3]/70 md:text-[11px]`}><span className="h-px w-10 bg-[#c3a15e]" />{t(PERSON.motto)}</p>
        <h1 className={`${T.serif} text-[clamp(64px,19vw,96px)] leading-[.86] tracking-[-.02em] text-[#f6f1e8] md:text-[clamp(96px,11.4vw,200px)]`}>Yehiel<br /><span className="italic text-[#e9dcc0] md:pl-[.9em]">Tsubery</span></h1>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a href="#como" className={`${T.sans} inline-flex h-12 items-center gap-3 rounded-full bg-[#f3ede3] px-6 text-[12px] font-semibold uppercase tracking-[.18em] text-[#151412]`}>{t(S.explore)} →</a>
          <a href="#contact" className={`${T.sans} inline-flex h-12 items-center rounded-full border border-[#f3ede3]/30 px-6 text-[12px] font-semibold uppercase tracking-[.18em] text-[#f3ede3]`}>{t('cta.inquire')}</a>
        </div>
        <p className={`${T.sans} mt-8 text-[10px] font-medium uppercase tracking-[.3em] text-[#f3ede3]/60`}>{t(s0.l)}</p>
      </div>
    </section>
  )
}

export default function Hero() {
  const reduce = useReducedMotion()
  const lite = useLite()
  if (reduce || lite) return <StaticHero />
  return <Film />
}
