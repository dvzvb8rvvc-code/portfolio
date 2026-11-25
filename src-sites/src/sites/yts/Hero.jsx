import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useReducedMotion, useMotionTemplate } from 'framer-motion'
import { useLang } from './i18n'
import { useStage } from './engine'
import { T, PERSON } from './data'

/* HERO v7 — pure DOM/CSS cinema (no WebGL, nothing layered twice).
   One image visible at a time; the next one is revealed by a slow curtain wipe; every slide has its
   own slow push-in. Scroll beats are played by the film stepper (stepper.jsx, STEPS.hero = 3):
   1) title leaves, image pushes in   2) frame recedes into a gold-framed window   3) hand-off to Studio. */

const E = [0.22, 1, 0.36, 1]
const GOLD = '#c3a15e'
const XL = id => `/portfolio/yts/img/${id}-xl.webp`
const SM = id => `/portfolio/yts/img/${id}.webp`

export const SLIDES = [
  { id: 5, w: 2048, h: 2560, pos: '47% 44%', l: { en: 'Il Giardino di Teodolinda · Lake Como', it: 'Il Giardino di Teodolinda · Lago di Como' } },
  { id: 103, w: 2560, h: 2160, pos: '72% 50%', l: { en: 'Studio work · Render', it: 'Progetto dello studio · Render' } },
  { id: 111, w: 2500, h: 1563, pos: '57% 50%', l: { en: 'Residential · Studio work', it: 'Residenziale · Progetto dello studio' } },
  { id: 84, w: 2560, h: 1280, pos: '55% 50%', l: { en: 'Studio work · Render', it: 'Progetto dello studio · Render' } },
]
const HOLD = 6.5 // seconds per slide
const WIPE = 1.8 // curtain duration

const S = {
  top: { en: 'YTS Architects · Architecture & development · Israel — Italy', it: 'YTS Architects · Architettura e sviluppo · Israele — Italia' },
  explore: { en: 'Explore residences', it: 'Scopri le residenze' },
  scroll: { en: 'Scroll', it: 'Scorri' },
  reel: { en: 'Selected work', it: 'Progetti scelti' },
}

function Rise({ children, d = 0, className = '' }) {
  return (
    <span className="block overflow-hidden pb-[.08em] -mb-[.04em]">
      <motion.span className={`block ${className}`} initial={{ y: '112%' }} animate={{ y: '0%' }} transition={{ duration: 1.9, ease: E, delay: d }}>{children}</motion.span>
    </span>
  )
}
const Fade = ({ children, d = 0, className = '' }) => (
  <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.6, ease: E, delay: d }} className={className}>{children}</motion.div>
)

/* one slide: curtain reveal (clip-path from the bottom) + its own slow push-in */
function Slide({ s, first, z }) {
  return (
    <motion.div className="absolute inset-0 will-change-[clip-path]" style={{ zIndex: z }}
      initial={first ? false : { clipPath: 'inset(100% 0% 0% 0%)' }}
      animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
      exit={{ opacity: 1, transition: { duration: WIPE } }}
      transition={{ duration: WIPE, ease: [0.76, 0, 0.24, 1] }}>
      <motion.img src={XL(s.id)} srcSet={`${SM(s.id)} 1800w, ${XL(s.id)} 2560w`} sizes="100vw" alt="" decoding="async" draggable={false}
        className="yts-grade absolute inset-0 h-full w-full select-none object-cover"
        style={{ objectPosition: s.pos }}
        initial={{ scale: first ? 1.06 : 1.14 }} animate={{ scale: 1.0 }} transition={{ duration: HOLD + WIPE + 1, ease: 'linear' }} />
    </motion.div>
  )
}

function Counter({ i, go }) {
  const { t } = useLang()
  return (
    <div className={`${T.sans} pointer-events-auto flex items-center gap-4 text-[11px] font-medium uppercase tracking-[.3em] text-[#f3ede3]/70`}>
      <span className="max-md:hidden">{t(S.reel)}</span>
      <span className="tabular-nums tracking-[.15em] text-[#f3ede3]"><span className="text-[#c3a15e]">0{i + 1}</span> / 0{SLIDES.length}</span>
      <div className="flex gap-2">
        {SLIDES.map((s, k) => (
          <button key={s.id} onClick={() => go(k)} aria-label={`${k + 1}`} className="group relative h-11 w-8">
            <span className="absolute inset-x-0 top-1/2 h-px bg-[#f3ede3]/25" />
            {k === i && <motion.span key={i} className="absolute left-0 top-1/2 h-px w-full origin-left bg-[#c3a15e]" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: HOLD, ease: 'linear' }} />}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function Hero() {
  const { t, lang } = useLang()
  const ref = useRef()
  useStage('hero', ref)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const p = useSpring(scrollYProgress, { stiffness: 70, damping: 22, mass: 0.6 })

  // showreel clock — pauses once the visitor starts scrolling
  const [i, setI] = useState(0)
  const paused = useRef(false)
  const zc = useRef({ i: 0, z: 1 })
  if (zc.current.i !== i) zc.current = { i, z: zc.current.z + 1 }
  useEffect(() => scrollYProgress.on('change', v => { paused.current = v > 0.02 }), [scrollYProgress])
  useEffect(() => {
    if (reduce) return
    const id = setInterval(() => { if (!paused.current && !document.hidden) setI(k => (k + 1) % SLIDES.length) }, HOLD * 1000)
    return () => clearInterval(id)
  }, [reduce, i])
  // preload the big frames once
  useEffect(() => { SLIDES.forEach(s => { const im = new Image(); im.src = XL(s.id) }) }, [])

  // scroll beats
  const titleO = useTransform(p, [0, 0.3], [1, 0])
  const titleY = useTransform(p, [0, 0.33], [0, -70])
  const push = useTransform(p, [0, 0.4], [1, 1.12])
  const ins = useTransform(p, [0.36, 0.9], [0, 1])
  const top = useTransform(ins, v => `${v * 16}%`), side = useTransform(ins, v => `${v * 9}%`), rad = useTransform(ins, v => `${v * 6}px`)
  const clip = useMotionTemplate`inset(${top} ${side} ${top} ${side} round ${rad})`
  const frameO = useTransform(p, [0.55, 0.85], [0, 1])
  const dim = useTransform(p, [0.4, 1], [0, 0.35])
  const capO = useTransform(p, [0.62, 0.9], [0, 1])
  const capY = useTransform(p, [0.62, 0.9], [24, 0])
  const uiO = useTransform(p, [0, 0.18], [1, 0])

  return (
    <section id="hero" ref={ref} className="relative h-[190vh] bg-[#0b0a08]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* the picture, receding into a window on scroll */}
        <motion.div className="absolute inset-0" style={{ clipPath: clip }}>
          <motion.div className="absolute inset-0" style={{ scale: push }}>
            <AnimatePresence initial={false}>
              <Slide key={SLIDES[i].id} s={SLIDES[i]} z={zc.current.z} first={zc.current.z === 1} />
            </AnimatePresence>
          </motion.div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-black/5 max-md:bg-gradient-to-t max-md:from-black/85 max-md:via-black/45 max-md:to-black/20" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/50 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black/70 to-transparent" />
          <motion.div className="pointer-events-none absolute inset-0 bg-[#0b0a08]" style={{ opacity: dim }} />
        </motion.div>

        {/* gold frame that appears as the picture recedes */}
        <motion.div aria-hidden className="pointer-events-none absolute border border-[#c3a15e]/60" style={{ opacity: frameO, top: 'calc(16% - 14px)', bottom: 'calc(16% - 14px)', left: 'calc(9% - 14px)', right: 'calc(9% - 14px)' }} />

        {/* caption that takes over after the recede */}
        <motion.div className="pointer-events-none absolute inset-x-0 bottom-[5%] z-20 text-center" style={{ opacity: capO, y: capY }}>
          <div className={`${T.sans} text-[11px] font-medium uppercase tracking-[.34em] text-[#c3a15e]`}>{t(SLIDES[i].l)}</div>
          <div className={`${T.serif} mt-2 text-[26px] italic text-[#efe8dc] md:text-[34px]`}>{t({ en: 'From the first line to the finished home.', it: 'Dal primo tratto alla casa finita.' })}</div>
        </motion.div>

        {/* top line */}
        <motion.div style={{ opacity: uiO }} className="pointer-events-none absolute inset-x-0 top-[88px] z-20 max-md:hidden">
          <Fade d={.5} className={`${T.sans} mx-auto flex max-w-[1440px] items-center gap-4 px-12 text-[11px] font-medium uppercase tracking-[.38em] text-[#f3ede3]/75`}>
            <span className="h-px w-10 bg-[#c3a15e]" />{t(S.top)}
          </Fade>
        </motion.div>

        {/* title block */}
        <motion.div style={{ opacity: titleO, y: titleY }} className="absolute inset-x-0 bottom-0 z-20">
          <div className="mx-auto max-w-[1440px] px-6 pb-[max(36px,calc(env(safe-area-inset-bottom)+24px))] md:px-12 md:pb-16">
            <Fade d={.2} className={`${T.sans} mb-5 flex items-center gap-4 text-[11px] font-medium uppercase tracking-[.3em] text-[#f3ede3]/80 md:mb-7 md:tracking-[.4em]`}>
              <span className="h-px w-10 bg-[#c3a15e]" />{t(PERSON.motto)}
            </Fade>
            <h1 key={lang} className={`${T.serif} text-[#f6f1e8] text-[clamp(64px,19vw,96px)] leading-[.86] tracking-[-.02em] md:text-[clamp(96px,11.4vw,200px)]`}>
              <Rise d={.15}>Yehiel</Rise>
              <Rise d={.3} className="italic text-[#e9dcc0] md:pl-[.9em]">Tsubery</Rise>
            </h1>
            <Fade d={.9} className="mt-8 flex flex-wrap items-center gap-3 md:mt-10 md:gap-4">
              <a href="#como" className={`${T.sans} group inline-flex h-12 items-center gap-3 rounded-full bg-[#f3ede3] px-6 text-[12px] font-semibold uppercase tracking-[.18em] text-[#151412] transition-colors duration-500 hover:bg-white`}>
                {t(S.explore)} <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
              </a>
              <a href="#contact" className={`${T.sans} inline-flex h-12 items-center rounded-full border border-[#f3ede3]/35 px-6 text-[12px] font-semibold uppercase tracking-[.18em] text-[#f3ede3] transition-colors duration-500 hover:border-[#f3ede3]/70`}>
                {t('cta.inquire')}
              </a>
            </Fade>
          </div>
        </motion.div>

        {/* reel counter + project label */}
        <motion.div style={{ opacity: uiO }} className="absolute bottom-[max(36px,calc(env(safe-area-inset-bottom)+24px))] right-6 z-30 flex flex-col items-end gap-1 max-md:top-[84px] max-md:bottom-auto md:bottom-16 md:right-12">
          <Fade d={1.1}><Counter i={i} go={setI} /></Fade>
          <AnimatePresence mode="wait">
            <motion.div key={i + lang} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: .8, ease: E }}
              className={`${T.sans} text-right text-[11px] font-medium uppercase tracking-[.26em] text-[#f3ede3]/65 max-md:hidden`}>{t(SLIDES[i].l)}</motion.div>
          </AnimatePresence>
        </motion.div>

        {/* scroll cue */}
        <motion.div style={{ opacity: uiO }} className="pointer-events-none absolute bottom-6 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-3 md:flex">
          <span className={`${T.sans} text-[11px] font-medium uppercase tracking-[.42em] text-[#f3ede3]/60`}>{t(S.scroll)}</span>
          <span className="relative block h-10 w-px overflow-hidden bg-[#f3ede3]/15">
            <motion.span className="absolute left-0 top-0 block h-4 w-px" style={{ background: GOLD }} animate={{ y: [-16, 40] }} transition={{ duration: 2.4, ease: [0.65, 0, 0.35, 1], repeat: Infinity, repeatDelay: .4 }} />
          </span>
        </motion.div>
      </div>
    </section>
  )
}
