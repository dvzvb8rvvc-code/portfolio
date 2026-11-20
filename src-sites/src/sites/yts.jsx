import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { MotionConfig, motion, useScroll, useMotionValueEvent } from 'framer-motion'
import '../lib/base.css'
import { useSmooth, PORTFOLIO } from '../lib/kit'
import { LangProvider, useLang } from './yts/i18n'
import { T } from './yts/data'
import Hero from './yts/Hero'
import Studio from './yts/Studio'
import Como from './yts/Como'
import Palazzo from './yts/Palazzo'
import Works from './yts/Works'
import Founder from './yts/Founder'
import Club from './yts/Club'
import Contact from './yts/Contact'

/* Shell: owns nav, language switch, ribbon, smooth scroll. Sections live in ./yts/*.jsx (one owner each). */
const NAV = [['#studio', 'nav.studio'], ['#residences', 'nav.residences'], ['#works', 'nav.works'], ['#founder', 'nav.founder'], ['#club', 'nav.club']]

function LangSwitch({ dark }) {
  const { lang, setLang } = useLang()
  return (
    <div className={`relative flex h-9 items-center rounded-full p-1 text-[12px] font-semibold tracking-[.08em] ${dark ? 'bg-white/10 text-white' : 'bg-black/[.06] text-[#151412]'}`}>
      {['en', 'it'].map(l => (
        <button key={l} onClick={() => setLang(l)} aria-pressed={lang === l} className="relative z-10 h-7 w-10 rounded-full uppercase">
          {lang === l && <motion.span layoutId="lang-pill" className={`absolute inset-0 -z-10 rounded-full ${dark ? 'bg-white text-black' : 'bg-[#151412]'}`} transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
          <span className={lang === l ? (dark ? 'text-black' : 'text-[#ece7df]') : ''}>{l}</span>
        </button>
      ))}
    </div>
  )
}

function Nav() {
  const { t } = useLang()
  const { scrollY } = useScroll()
  const [solid, setSolid] = useState(false)
  useMotionValueEvent(scrollY, 'change', v => setSolid(v > 40))
  const [open, setOpen] = useState(false)
  return (
    <header className={`fixed inset-x-0 top-0 z-[60] transition-[background,backdrop-filter] duration-500 ${solid ? 'bg-[#ece7df]/80 backdrop-blur-xl' : ''}`}>
      <div className={`mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 md:px-10 ${T.sans}`}>
        <a href="#top" className="flex items-baseline gap-2 text-[#151412]">
          <span className="text-[19px] font-black tracking-[-.02em]">YTS</span>
          <span className={`${T.serif} hidden text-[17px] italic text-[#151412]/60 sm:inline`}>Yehiel Tsubery</span>
        </a>
        <nav className="hidden items-center gap-8 text-[13px] font-medium text-[#151412]/75 lg:flex">
          {NAV.map(([h, k]) => <a key={h} href={h} className="transition-colors hover:text-[#151412]">{t(k)}</a>)}
        </nav>
        <div className="flex items-center gap-3">
          <LangSwitch />
          <a href="#contact" className="hidden h-9 items-center rounded-full bg-[#151412] px-4 text-[12.5px] font-semibold text-[#ece7df] sm:inline-flex">{t('cta.inquire')}</a>
          <button onClick={() => setOpen(!open)} className="grid h-9 w-9 place-items-center rounded-full bg-black/[.06] lg:hidden" aria-label="Menu">
            <span className="block h-[1.5px] w-4 bg-[#151412] shadow-[0_5px_0_#151412]" />
          </button>
        </div>
      </div>
      {open && (
        <div className={`border-t border-black/10 bg-[#ece7df] px-5 pb-6 pt-2 lg:hidden ${T.sans}`} onClick={() => setOpen(false)}>
          {[...NAV, ['#contact', 'nav.contact']].map(([h, k]) => <a key={h} href={h} className={`${T.serif} block py-2 text-[34px] leading-tight text-[#151412]`}>{t(k)}</a>)}
        </div>
      )}
    </header>
  )
}

function Ribbon() {
  const { t } = useLang()
  return (
    <div className={`relative z-[61] bg-[#151412] px-4 py-2 text-center text-[12px] font-medium text-[#ece7df]/85 ${T.sans}`}>
      {t({ en: 'Website concept for YTS · Yehiel Tsubery — independent demo, not affiliated · ', it: 'Concept di sito per YTS · Yehiel Tsubery — demo indipendente, non affiliata · ' })}
      <a className="underline underline-offset-2" href={PORTFOLIO} target="_blank" rel="noopener">by Artem</a>
    </div>
  )
}

function App() {
  useSmooth()
  return (
    <MotionConfig reducedMotion="user">
      <div id="top" className={`bg-[#ece7df] text-[#151412] ${T.sans}`} style={{ '--sel': '#151412', '--selc': '#ece7df' }}>
        <Ribbon />
        <Nav />
        <main>
          <Hero />
          <Studio />
          <div id="residences">
            <Como />
            <Palazzo />
          </div>
          <Works />
          <Founder />
          <Club />
          <Contact />
        </main>
      </div>
    </MotionConfig>
  )
}

createRoot(document.getElementById('root')).render(<LangProvider><App /></LangProvider>)
