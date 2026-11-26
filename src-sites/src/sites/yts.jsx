import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { MotionConfig, motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion'
import '../lib/base.css'
import { useSmooth, PORTFOLIO } from '../lib/kit'
import { LangProvider, useLang } from './yts/i18n'
import { T } from './yts/data'
import Hero from './yts/Hero'
import Story from './yts/Story'
import Journey from './yts/Journey'
import Studio from './yts/Studio'
import Projects from './yts/Projects'
import Details from './yts/Details'
import Como from './yts/Como'
import Models from './yts/Models'
import Palazzo from './yts/Palazzo'
import Works from './yts/Works'
import Founder from './yts/Founder'
import Contact from './yts/Contact'
import { Stage } from './yts/engine'
import { useFilmStepper } from './yts/stepper'
import { useLite } from '../lib/kit'

/* Shell: owns nav, language switch, ribbon, smooth scroll, global dark-luxury palette + grain.
   Sections live in ./yts/*.jsx (one owner each). */

// V5 dark luxury palette (data.js T stays the shared read-only source for fonts)
const P = { bg: '#0b0a08', s1: '#14120f', s2: '#1a1713', ink: '#efe8dc', mute: 'rgba(239,232,220,.62)', line: 'rgba(239,232,220,.12)', gold: '#c3a15e', lake: '#10202a', ochre: '#3a2412' }

const NAV = [['#studio', 'nav.studio'], ['#como', 'nav.residences'], ['#works', 'nav.works'], ['#founder', 'nav.founder']]
const EASE = [0.16, 1, 0.3, 1]

// grain = one static SVG turbulence tile (no animation, no canvas) + shared photo grade + small caps
const NOISE = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 .9 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>"
const CSS = `
html,body{background:${P.bg}}
#top{--gold:${P.gold}}
.yts-grain{position:fixed;inset:0;z-index:58;pointer-events:none;opacity:.07;mix-blend-mode:overlay;background-image:url("${NOISE}");background-size:180px 180px}
.yts-grade{filter:saturate(.86) sepia(.07) brightness(.95) contrast(1.02)}
@keyframes ytsPush{from{transform:scale(1.03) translate3d(0,0,0)}to{transform:scale(1.14) translate3d(-1.2%,-.8%,0)}}
.yts-push{animation:ytsPush 22s cubic-bezier(.45,0,.55,1) infinite alternate;will-change:transform}
@media (prefers-reduced-motion:reduce){.yts-push{animation:none;transform:scale(1.04)}}
.yts-glass{background:rgba(18,12,9,.52);-webkit-backdrop-filter:blur(18px) saturate(1.4);backdrop-filter:blur(18px) saturate(1.4);border:1px solid rgba(239,224,204,.10)}
.yts-cap{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.28em;line-height:1.4}
#top :focus-visible{outline:1px solid ${P.gold};outline-offset:3px}
#top input:-webkit-autofill{-webkit-text-fill-color:${P.ink};transition:background-color 9999s}
`

function LangSwitch({ big }) {
  const { lang, setLang } = useLang()
  return (
    <div className={`relative flex items-center rounded-full border p-[3px] text-[11px] font-semibold tracking-[.16em] text-[#efe8dc] ${big ? 'h-12 border-[rgba(239,232,220,.16)]' : 'h-12 border-transparent p-[5px]'}`}>
      {['en', 'it'].map(l => (
        <button key={l} onClick={() => setLang(l)} aria-pressed={lang === l} aria-label={l === 'en' ? 'English' : 'Italiano'}
          className={`relative z-10 h-full rounded-full uppercase ${big ? 'w-14' : 'w-11 md:w-10'}`}>
          {lang === l && <motion.span layoutId={big ? 'lang-pill-m' : 'lang-pill'} className="absolute inset-0 -z-10 rounded-full bg-[#efe8dc]" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
          <span className={`transition-colors duration-300 ${lang === l ? 'text-[#0b0a08]' : 'text-[#efe8dc]/70'}`}>{l}</span>
        </button>
      ))}
    </div>
  )
}

function Burger({ open, onClick }) {
  return (
    <button onClick={onClick} aria-expanded={open} aria-label={open ? 'Close menu' : 'Menu'}
      className="relative grid h-12 w-12 place-items-center rounded-full lg:hidden">
      <motion.span className="absolute h-px w-[18px] bg-[#efe8dc]" animate={open ? { rotate: 45, y: 0 } : { rotate: 0, y: -3.5 }} transition={{ duration: .5, ease: EASE }} />
      <motion.span className="absolute h-px w-[18px] bg-[#efe8dc]" animate={open ? { rotate: -45, y: 0 } : { rotate: 0, y: 3.5 }} transition={{ duration: .5, ease: EASE }} />
    </button>
  )
}

function Sheet({ close }) {
  const { t } = useLang()
  const items = [...NAV, ['#contact', 'nav.contact']]
  useEffect(() => {
    window.__lenis?.stop(); const o = document.body.style.overflow; document.body.style.overflow = 'hidden'
    const k = e => e.key === 'Escape' && close(); addEventListener('keydown', k)
    return () => { window.__lenis?.start(); document.body.style.overflow = o; removeEventListener('keydown', k) }
  }, [])
  // QA: unlock scroll BEFORE the global anchor handler (kit.jsx) runs lenis.scrollTo — a stopped Lenis ignores it
  const leave = () => { window.__lenis?.start(); document.body.style.overflow = ''; close() }
  return (
    <motion.div initial={{ clipPath: 'inset(0 0 100% 0)' }} animate={{ clipPath: 'inset(0 0 0% 0)' }} exit={{ clipPath: 'inset(0 0 100% 0)' }} transition={{ duration: .75, ease: EASE }}
      className={`fixed inset-0 z-[59] flex flex-col bg-[#0b0a08] px-6 pb-[max(28px,env(safe-area-inset-bottom))] pt-24 lg:hidden ${T.sans}`}>
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_50%_at_100%_0%,rgba(195,161,94,.10),transparent_70%)]" />
      <motion.span aria-hidden initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.1, ease: EASE, delay: .25 }} className="block h-px origin-left bg-[#c3a15e]/60" />
      <nav className="relative mt-2 flex flex-1 flex-col">
        {items.map(([h, k], i) => (
          <a key={h} href={h} onClick={leave} className="group flex min-h-[64px] items-baseline gap-5 border-b border-[rgba(239,232,220,.10)] py-3">
            <span className="w-6 text-[11px] font-semibold tabular-nums tracking-[.2em] text-[#c3a15e]">0{i + 1}</span>
            <span className="block overflow-hidden pb-[.06em]">
              <motion.span className={`${T.serif} block text-[40px] leading-[1.05] text-[#efe8dc] ${i % 2 ? 'italic' : ''}`} initial={{ y: '105%' }} animate={{ y: 0 }} transition={{ duration: .9, ease: EASE, delay: .25 + i * .06 }}>{t(k)}</motion.span>
            </span>
          </a>
        ))}
      </nav>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8, ease: EASE, delay: .55 }} className="relative mt-6 flex items-center justify-between gap-4">
        <LangSwitch big />
        <a href="#contact" onClick={leave} className="inline-flex h-12 items-center rounded-full bg-[#efe8dc] px-6 text-[11.5px] font-semibold uppercase tracking-[.2em] text-[#0b0a08]">{t('cta.inquire')}</a>
      </motion.div>
      <p className="yts-cap relative mt-6 text-[#efe8dc]/40">YTS Architects · Israel — Italia</p>
    </motion.div>
  )
}

function Nav() {
  const { t } = useLang()
  const { scrollY } = useScroll()
  const [solid, setSolid] = useState(false)
  useMotionValueEvent(scrollY, 'change', v => setSolid(v > 40))
  const [open, setOpen] = useState(false)
  const home = () => { if (open) { window.__lenis?.start(); document.body.style.overflow = '' } setOpen(false) }
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[60]">
        <div className={`overflow-hidden transition-[max-height] duration-500 ${solid || open ? 'max-h-0' : 'max-h-16'}`}><Ribbon /></div>
        {/* Delta-like floating dark-glass bar: logo badge · centred link pill · language + inquiry */}
        <div className={`mx-auto flex max-w-[1480px] items-center justify-between gap-3 px-3 pt-3 md:px-5 md:pt-4 ${T.sans}`}>
          <a href="#top" onClick={home} className={`flex h-12 items-center gap-3 rounded-full px-5 text-[#efe8dc] ${open ? '' : 'yts-glass'}`}>
            <span className="text-[17px] font-black tracking-[.06em]">YTS</span>
            <span className="h-4 w-px bg-[#c3a15e]/70" />
            <span className={`${T.serif} text-[17px] italic text-[#efe8dc]/75`}>Yehiel Tsubery</span>
          </a>
          <nav className="yts-glass hidden h-12 items-center gap-1 rounded-full px-2 lg:flex">
            {NAV.map(([h, k]) => (
              <a key={h} href={h} className="group relative flex h-9 items-center rounded-full px-5 text-[11.5px] font-semibold uppercase tracking-[.2em] text-[#efe8dc]/80 transition-colors duration-300 hover:bg-[#efe8dc]/10 hover:text-[#efe8dc]">{t(k)}</a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <div className={`hidden rounded-full sm:block ${open ? '' : 'yts-glass'}`}><LangSwitch /></div>
            <a href="#contact" className="hidden h-12 items-center rounded-full bg-[#efe0cc] px-6 text-[11.5px] font-semibold uppercase tracking-[.18em] text-[#1e130d] transition-colors duration-500 hover:bg-white lg:inline-flex">{t('cta.inquire')}</a>
            <div className={`rounded-full lg:hidden ${open ? '' : 'yts-glass'}`}><Burger open={open} onClick={() => setOpen(!open)} /></div>
          </div>
        </div>
      </header>
      <AnimatePresence>{open && <Sheet key="sheet" close={() => setOpen(false)} />}</AnimatePresence>
    </>
  )
}

function Ribbon() {
  const { t } = useLang()
  return (
    <div className={`relative z-[61] border-b border-[rgba(239,232,220,.08)] bg-[#14120f] px-4 py-2 text-center text-[11.5px] font-medium leading-snug tracking-[.02em] text-[#efe8dc]/70 ${T.sans}`}>
      {t({ en: 'Website concept for YTS · Yehiel Tsubery — independent demo, not affiliated · ', it: 'Concept di sito per YTS · Yehiel Tsubery — demo indipendente, non affiliata · ' })}
      <a className="-my-3 inline-flex min-h-[44px] items-center text-[#d9bf86] underline decoration-[#c3a15e]/50 underline-offset-[3px]" href={PORTFOLIO} target="_blank" rel="noopener">by Artem</a>
    </div>
  )
}

function App() {
  useSmooth()
  const lite = useLite()
  useFilmStepper(!lite)
  return (
    <MotionConfig reducedMotion="user">
      <div id="top" className={`min-h-screen bg-[#0b0a08] text-[#efe8dc] ${T.sans}`} style={{ '--sel': '#c3a15e', '--selc': '#0b0a08' }}>
        <style>{CSS}</style>
        <Stage lite={lite} />
        <Nav />
        <main className="relative z-10">
          <Hero />
          <Story />
          <Journey />
          <Studio />
          <Projects />
          <Models />
          <Como />
          <Details />
          <Palazzo />
          <Works />
          <Founder />
          <Contact />
        </main>
        <div aria-hidden className="yts-grain" />
      </div>
    </MotionConfig>
  )
}

createRoot(document.getElementById('root')).render(<LangProvider><App /></LangProvider>)
