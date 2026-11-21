import React, { useRef, useState } from 'react'
import { motion, useScroll, useTransform, useMotionValueEvent, useReducedMotion } from 'framer-motion'
import { useLite } from '../../lib/kit'
import { useLang } from './i18n'
import { useStage } from './engine'
import { T, PERSON, img } from './data'

/* HERO (v3) — DOM only. The 3D lives in sceneHero.jsx on the shared fixed canvas (engine.jsx).
   This wrapper is transparent so the canvas shows through; the sticky overlay carries the type. */

const E = [0.16, 1, 0.3, 1]

const S = {
  eyebrow: { en: 'Architecture & development · Israel · Italy', it: 'Architettura e sviluppo · Israele · Italia' },
  residences: { en: 'Explore the residences', it: 'Scopri le residenze' },
  scroll: { en: 'Scroll — from line to place', it: 'Scorri — dalla linea al luogo' },
  ch: { en: ['Line', 'Colour', 'Stone', 'Place'], it: ['Linea', 'Colore', 'Pietra', 'Luogo'] },
  b2a: { en: 'Every project begins', it: 'Ogni progetto nasce' },
  b2b: { en: 'as a line drawn by hand.', it: 'da una linea tracciata a mano.' },
  b3a: { en: 'Then it gathers', it: 'Poi prende' },
  b3b: { en: 'colour, depth, weight.', it: 'colore, profondità, peso.' },
  cap: { en: 'Render · Perledo, Lake Como', it: 'Render · Perledo, Lago di Como' },
  place: { en: 'Lake Como', it: 'Lago di Como' },
  enter: { en: 'Enter the residences', it: 'Entra nelle residenze' },
  sketchCap: { en: 'Original sketch · Yehiel Tsubery', it: 'Schizzo originale · Yehiel Tsubery' },
  alt: { en: 'Il Giardino di Teodolinda — render, Lake Como', it: 'Il Giardino di Teodolinda — render, Lago di Como' },
}

function skipTo() {
  const el = document.getElementById('hero')
  const y = el ? el.getBoundingClientRect().bottom + window.scrollY : window.innerHeight * 2
  window.__lenis ? window.__lenis.scrollTo(y, { duration: 1.4 }) : window.scrollTo({ top: y, behavior: 'smooth' })
}

/* masked word rise on load */
function Rise({ children, d = 0, className = '' }) {
  return (
    <span className="block overflow-hidden pb-[.06em]">
      <motion.span className={`block ${className}`} initial={{ y: '108%' }} animate={{ y: '0%' }} transition={{ duration: 1.15, ease: E, delay: d }}>{children}</motion.span>
    </span>
  )
}

/* scroll-linked masked line (kinetic type tied to the film) */
function KLine({ p, a, b, children, className = '' }) {
  const y = useTransform(p, [a, a + .06, b - .06, b], ['110%', '0%', '0%', '-110%'])
  return <span className="block overflow-hidden pb-[.08em]"><motion.span className={`block ${className}`} style={{ y }}>{children}</motion.span></span>
}

function Intro({ p }) {
  const { t } = useLang()
  const o = useTransform(p, [0, .1], [1, 0])
  const y = useTransform(p, [0, .12], [0, -70])
  const ev = useTransform(p, v => (v > .1 ? 'none' : 'auto'))
  return (
    <motion.div style={{ opacity: o, y, pointerEvents: ev }} className="absolute inset-x-0 bottom-0 z-20">
      <div className="mx-auto max-w-[1440px] px-5 pb-[max(28px,env(safe-area-inset-bottom))] md:px-10 md:pb-14">
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .9, ease: E, delay: .1 }} className={`${T.sans} mb-3 text-[10px] font-semibold uppercase tracking-[.18em] text-[#151412]/60 md:mb-5 md:text-[12px] md:tracking-[.24em]`}>{t(S.eyebrow)}</motion.p>
        <h1 className={`${T.serif} max-w-[11ch] text-[46px] leading-[.9] tracking-[-.012em] text-[#151412] sm:text-[64px] md:max-w-[9.5ch] md:text-[clamp(72px,8vw,132px)]`}>
          <Rise d={.15}><span className={`${T.sans} mr-[.18em] align-[.14em] text-[.4em] font-black tracking-[-.03em]`}>YTS —</span>Yehiel</Rise>
          <Rise d={.24}>Tsubery</Rise>
          <Rise d={.33} className="italic text-[#151412]/75">Architects</Rise>
        </h1>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: .7 }} className="mt-5 flex flex-col gap-5 md:mt-9 md:flex-row md:items-end md:gap-12">
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <a href="#residences" className={`${T.sans} inline-flex h-11 items-center gap-2 rounded-full bg-[#151412] px-5 text-[13px] font-semibold text-[#ece7df] transition-colors hover:bg-[#b06a35] md:h-12 md:px-6 md:text-[14px]`}>{t(S.residences)} <span aria-hidden>→</span></a>
            <a href="#contact" className={`${T.sans} inline-flex h-11 items-center rounded-full border border-[#151412]/25 bg-[#ece7df]/60 px-5 text-[13px] font-semibold text-[#151412] backdrop-blur-sm transition-colors hover:border-[#151412] md:h-12 md:px-6 md:text-[14px]`}>{t('cta.inquire')}</a>
          </div>
          <p className={`${T.serif} text-[22px] italic leading-none text-[#151412] md:text-[28px]`}><span className="mr-3 inline-block h-px w-10 bg-[#b06a35] align-middle" />{t(PERSON.motto)}</p>
        </motion.div>
      </div>
    </motion.div>
  )
}

function SketchTag({ p }) {
  const { t } = useLang()
  const o = useTransform(p, [0, .08], [1, 0])
  return (
    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.6, duration: 1 }} className={`${T.sans} pointer-events-none absolute z-20 hidden text-[10.5px] font-semibold uppercase tracking-[.2em] text-[#151412]/55 md:block md:bottom-14 md:right-10`}>
      <motion.span style={{ opacity: o }} className="flex items-center gap-3"><span className="h-px w-8 bg-[#151412]/40" />{t(S.sketchCap)}</motion.span>
    </motion.p>
  )
}

function Hud({ p, chap, dark }) {
  const { t } = useLang()
  const w = useTransform(p, [0, 1], ['0%', '100%'])
  const names = t(S.ch)
  return (
    <div className="pointer-events-none absolute left-5 right-5 top-[78px] z-30 md:left-auto md:right-10 md:top-[96px] md:w-[300px]">
      <div className={`${T.sans} flex justify-between text-[10px] font-semibold uppercase tracking-[.16em] tabular-nums md:text-[10.5px]`}>
        {names.map((s, i) => (
          <span key={i} className={`transition-colors duration-700 ${i === chap ? (dark ? 'text-white' : 'text-[#151412]') : (dark ? 'text-white/35' : 'text-[#151412]/35')}`}>0{i + 1} <span className="hidden sm:inline">{s}</span></span>
        ))}
      </div>
      <div className={`mt-2 h-px w-full transition-colors duration-700 ${dark ? 'bg-white/20' : 'bg-[#151412]/15'}`}><motion.div className="h-px bg-[#c3a15e]" style={{ width: w }} /></div>
    </div>
  )
}

function Skip({ p, dark }) {
  const { t } = useLang()
  const o = useTransform(p, [.88, .97], [1, 0])
  const c = dark ? 'border-white/25 bg-black/25 text-white hover:bg-white hover:text-[#151412]' : 'border-[#151412]/20 bg-[#ece7df]/70 text-[#151412] hover:bg-[#151412] hover:text-[#ece7df]'
  return (
    <motion.button style={{ opacity: o }} onClick={skipTo} className={`${T.sans} absolute right-5 top-[104px] z-40 h-8 rounded-full border px-3 text-[11px] font-semibold uppercase tracking-[.14em] backdrop-blur-md transition-colors duration-500 md:bottom-6 md:left-1/2 md:right-auto md:top-auto md:h-10 md:-translate-x-1/2 md:px-4 md:text-[12px] ${c}`}>
      {t('skip')} <span aria-hidden>↓</span>
    </motion.button>
  )
}

function Beat({ p, a, b, l1, l2, dark, className }) {
  return (
    <div className={`pointer-events-none absolute z-20 ${className}`}>
      <p className={`${T.serif} text-[38px] leading-[.95] md:text-[clamp(48px,4.8vw,80px)] ${dark ? 'text-white' : 'text-[#151412]'}`}>
        <KLine p={p} a={a} b={b}>{l1}</KLine>
        <KLine p={p} a={a + .025} b={b} className={`italic ${dark ? 'text-[#e6c88e]' : 'text-[#b06a35]'}`}>{l2}</KLine>
      </p>
    </div>
  )
}

function Caption({ p }) {
  const { t } = useLang()
  const o = useTransform(p, [.8, .9], [0, 1])
  const ev = useTransform(p, v => (v > .82 ? 'auto' : 'none'))
  const shade = useTransform(p, [.7, .92], [0, 1])
  return (
    <>
      <motion.div style={{ opacity: shade }} className="pointer-events-none absolute inset-0 z-[15] bg-gradient-to-t from-black/70 via-black/0 to-black/25" />
      <motion.div style={{ opacity: o, pointerEvents: ev }} className="absolute inset-x-0 bottom-0 z-20">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-5 px-5 pb-[max(40px,env(safe-area-inset-bottom))] md:flex-row md:items-end md:justify-between md:px-10 md:pb-24">
          <div>
            <p className={`${T.sans} mb-3 text-[11px] font-semibold uppercase tracking-[.22em] text-white/70`}>{t(S.cap)}</p>
            <p className={`${T.serif} text-[46px] leading-[.92] text-white md:text-[clamp(60px,6.6vw,112px)]`}>
              <KLine p={p} a={.8} b={1.2}>Il Giardino</KLine>
              <KLine p={p} a={.83} b={1.2} className="italic">di Teodolinda</KLine>
            </p>
            <p className={`${T.sans} mt-3 text-[12px] font-medium uppercase tracking-[.2em] text-white/80 md:text-[13px]`}>Il Giardino di Teodolinda · {t(S.place)}</p>
          </div>
          <a href="#residences" className={`${T.sans} inline-flex h-12 w-fit items-center gap-2 rounded-full bg-white px-6 text-[14px] font-semibold text-[#151412] transition-colors hover:bg-[#c3a15e]`}>{t(S.enter)} →</a>
        </div>
      </motion.div>
    </>
  )
}

function Film() {
  const { t } = useLang()
  const ref = useRef()
  useStage('hero', ref)
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const [chap, setChap] = useState(0)
  useMotionValueEvent(p, 'change', v => { const k = v < .2 ? 0 : v < .44 ? 1 : v < .66 ? 2 : 3; setChap(c => (c === k ? c : k)) })
  const dark = chap >= 2
  return (
    <section id="hero" ref={ref} className="relative h-[220vh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <Hud p={p} chap={chap} dark={dark} />
        <Intro p={p} />
        <SketchTag p={p} />
        <Beat p={p} a={.12} b={.38} l1={t(S.b2a)} l2={t(S.b2b)} className="bottom-10 left-5 right-5 md:bottom-16 md:left-10 md:right-auto md:max-w-[34vw]" />
        <Beat p={p} a={.48} b={.74} l1={t(S.b3a)} l2={t(S.b3b)} dark className="bottom-10 left-5 right-5 md:bottom-16 md:left-10 md:right-auto md:max-w-[34vw]" />
        <Caption p={p} />
        <Skip p={p} dark={dark} />
      </div>
    </section>
  )
}

/* lite / reduced motion: the final frame as a photo, with the title */
function StaticHero() {
  const { t } = useLang()
  return (
    <section id="hero" className="relative min-h-[100svh] overflow-hidden bg-[#151412]">
      <img src={img(5)} srcSet={`${img(5, 1)} 576w, ${img(5)} 1440w`} sizes="100vw" alt={t(S.alt)} width="1440" height="1800" decoding="async" fetchpriority="high" className="absolute inset-0 h-full w-full object-cover object-[50%_45%]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />
      <div className="relative mx-auto flex min-h-[100svh] max-w-[1440px] flex-col justify-end px-5 pb-12 pt-28 md:px-10 md:pb-16">
        <p className={`${T.sans} mb-4 text-[11px] font-semibold uppercase tracking-[.22em] text-white/70 md:text-[12px]`}>{t(S.eyebrow)}</p>
        <h1 className={`${T.serif} max-w-[12ch] text-[50px] leading-[.9] text-white md:text-[clamp(72px,8vw,128px)]`}><span className={`${T.sans} mr-3 align-[.14em] text-[.4em] font-black`}>YTS —</span>Yehiel Tsubery <span className="italic">Architects</span></h1>
        <p className={`${T.serif} mt-5 text-[24px] italic text-white/90 md:text-[28px]`}><span className="mr-3 inline-block h-px w-10 bg-[#c3a15e] align-middle" />{t(PERSON.motto)}</p>
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <a href="#residences" className={`${T.sans} inline-flex h-12 items-center rounded-full bg-white px-6 text-[14px] font-semibold text-[#151412]`}>{t(S.residences)} →</a>
          <a href="#contact" className={`${T.sans} inline-flex h-12 items-center rounded-full border border-white/40 px-6 text-[14px] font-semibold text-white`}>{t('cta.inquire')}</a>
        </div>
        <p className={`${T.sans} mt-8 text-[11px] font-semibold uppercase tracking-[.2em] text-white/60`}>Il Giardino di Teodolinda · {t(S.place)}</p>
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
