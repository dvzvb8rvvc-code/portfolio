import React, { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion'
import { useIsMobile, useLite } from '../../lib/kit'
import { useLang } from './i18n'
import { T, CLUB, img } from './data'

const Sea3D = lazy(() => import('./club3d'))
const EASE = [0.16, 1, 0.3, 1]
const pad = n => String(n).padStart(2, '0')

function useNear(ref, margin = '80% 0px') {
  const [near, setNear] = useState(false), [vis, setVis] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const a = new IntersectionObserver(([e]) => setNear(e.isIntersecting), { rootMargin: margin })
    const b = new IntersectionObserver(([e]) => setVis(e.isIntersecting), { rootMargin: '5% 0px' })
    a.observe(el); b.observe(el)
    return () => { a.disconnect(); b.disconnect() }
  }, [])
  return [near, vis]
}

function Ask({ className = '' }) {
  const { t } = useLang()
  const ask = () => { window.dispatchEvent(new CustomEvent('yts:interest', { detail: 'club' })) }
  return (
    <a href="#contact" onClick={ask} className={`pointer-events-auto inline-flex h-12 items-center gap-3 rounded-full bg-[#ece7df] px-6 text-[13px] font-semibold text-[#151412] transition-colors hover:bg-[#e9a25c] ${className}`}>
      {t({ en: 'Ask about the club', it: 'Informazioni sul club' })}
      <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 9h13M10 4l5 5-5 5" /></svg>
    </a>
  )
}

function Lead() {
  const { t } = useLang()
  return (
    <h2 className={`${T.serif} max-w-[22ch] text-[30px] leading-[1.04] md:text-[44px] lg:text-[50px]`}>
      {t(CLUB.lead).split(' — ').map((s, i) => i === 0 ? <span key={i}>{s} </span> : <em key={i} className="text-[#ece7df]/55">— {s}</em>)}
    </h2>
  )
}

function Static() {
  const { t } = useLang()
  return (
    <section id="club" className={`relative overflow-hidden bg-[#0d1a26] text-[#ece7df] ${T.sans}`}>
      <div className="mx-auto max-w-[1440px] px-5 py-20 md:px-10">
        <div className="text-[11px] font-semibold uppercase tracking-[.22em] text-[#c3a15e]">{t({ en: '06 — Club & events', it: '06 — Club ed eventi' })}</div>
        <div className="mt-5"><Lead /></div>
        <ul className="mt-10 border-b border-[#ece7df]/15">{CLUB.items.map((it, i) => <li key={i} className="flex items-baseline gap-4 border-t border-[#ece7df]/15 py-5"><span className="text-[12px] tabular-nums text-[#ece7df]/45">{pad(i + 1)}</span><span className={`${T.serif} text-[34px] leading-none`}>{t(it.t)}</span><span className="ml-auto text-[11px] font-semibold uppercase tracking-[.2em] text-[#c3a15e]">{it.p}</span></li>)}</ul>
        <div className="mt-10"><Ask /></div>
      </div>
    </section>
  )
}

export default function Club() {
  const { t } = useLang()
  const mobile = useIsMobile(), lite = useLite()
  const ref = useRef(null), host = useRef(null)
  const [near, vis] = useNear(ref)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const [i, setI] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', v => setI(Math.min(3, Math.max(0, Math.floor((v - .06) / .22)))))
  const bar = useTransform(scrollYProgress, [0, 1], [0, 1])
  const bigX = useTransform(scrollYProgress, [0, 1], ['6%', '-30%'])
  if (lite) return <Static />
  const skip = () => { const el = ref.current; const y = el.getBoundingClientRect().bottom + scrollY - 2; window.__lenis ? window.__lenis.scrollTo(y, { duration: 1.4 }) : scrollTo({ top: y, behavior: 'smooth' }) }
  const it = CLUB.items[i]
  return (
    <section id="club" ref={ref} className={`relative h-[300vh] bg-[#0d1a26] text-[#ece7df] md:h-[340vh] ${T.sans}`}>
      <div ref={host} className="sticky top-0 h-[100svh] touch-pan-y overflow-hidden">
        {near && <Suspense fallback={null}><Sea3D progress={scrollYProgress} active={vis} mobile={mobile} lite={lite} host={host} /></Suspense>}
        {/* giant word sits on the horizon */}
        <motion.div aria-hidden style={{ x: bigX }} className="pointer-events-none absolute left-0 top-[24%] select-none whitespace-nowrap text-[30vw] font-black uppercase leading-[.8] tracking-[-.06em] text-[#ece7df]/[.035] md:top-[14%] md:text-[22vw]">Club · Vela · Vino</motion.div>
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[38%] bg-gradient-to-b from-[#06101a]/80 to-transparent" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-t from-[#04080d]/85 to-transparent" />

        <div className="pointer-events-none relative mx-auto flex h-full max-w-[1440px] flex-col px-5 pb-7 pt-20 md:px-10 md:pb-10 md:pt-24">
          <div className="grid gap-4 lg:grid-cols-12">
            <div className="flex items-start justify-between lg:col-span-4 lg:block">
              <div className="text-[11px] font-semibold uppercase tracking-[.22em] text-[#e9a25c]">{t({ en: '06 — Club & events', it: '06 — Club ed eventi' })}</div>
              <button onClick={skip} className="pointer-events-auto inline-flex h-9 items-center gap-2 rounded-full border border-[#ece7df]/25 px-4 text-[11px] font-semibold uppercase tracking-[.2em] text-[#ece7df]/75 backdrop-blur-md transition-colors hover:bg-[#ece7df] hover:text-[#151412] lg:mt-5">
                {t('skip')}<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M5 1v8M1.5 5.5 5 9l3.5-3.5" /></svg>
              </button>
            </div>
            <div className="lg:col-span-8"><Lead /></div>
          </div>

          <div className="mt-auto grid items-end gap-6 lg:grid-cols-12">
            {/* active item — big floating title */}
            <div className="lg:col-span-8">
              <div className="flex items-center gap-4 text-[12px] font-semibold tabular-nums text-[#ece7df]/55">
                <span className="text-[#e9a25c]">{pad(i + 1)}</span><span className="h-px w-16 overflow-hidden bg-[#ece7df]/20"><motion.span style={{ scaleX: bar }} className="block h-full origin-left bg-[#e9a25c]" /></span><span>{pad(CLUB.items.length)}</span>
              </div>
              <div className="relative mt-3 h-[1.9em] text-[15vw] leading-[.92] md:h-[1.05em] md:whitespace-nowrap md:text-[6.4vw] 2xl:text-[96px]">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.div key={i} className={`${T.serif} absolute inset-x-0 bottom-0`} initial={{ y: '60%', opacity: 0, filter: 'blur(10px)' }} animate={{ y: '0%', opacity: 1, filter: 'blur(0px)' }} exit={{ y: '-50%', opacity: 0, filter: 'blur(8px)' }} transition={{ duration: .9, ease: EASE }}>
                    {t(it.t).split(' ').map((w, k) => <span key={k} className={k % 2 ? 'italic text-[#e9a25c]' : ''}>{w} </span>)}
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="mt-3 flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[.22em] text-[#ece7df]/70">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#e9a25c" strokeWidth="1.3"><path d="M7 13s4.5-4.2 4.5-7.5a4.5 4.5 0 1 0-9 0C2.5 8.8 7 13 7 13Z" /><circle cx="7" cy="5.5" r="1.5" /></svg>
                <AnimatePresence mode="wait" initial={false}><motion.span key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: .4 }}>{it.p}</motion.span></AnimatePresence>
              </div>
            </div>
            {/* editorial index */}
            <div className="lg:col-span-4">
              <ul className="hidden border-t border-[#ece7df]/15 md:block">
                {CLUB.items.map((x, k) => (
                  <li key={k} className={`flex items-baseline gap-3 border-b border-[#ece7df]/15 py-2.5 transition-all duration-700 ${k === i ? 'opacity-100' : 'opacity-40'}`}>
                    <span className="w-6 text-[11px] tabular-nums text-[#ece7df]/50">{pad(k + 1)}</span>
                    <span className={`${T.serif} text-[20px] leading-none ${k === i ? 'italic text-[#e9a25c]' : ''}`}>{t(x.t)}</span>
                    <span className="ml-auto text-[10px] font-semibold uppercase tracking-[.18em] text-[#ece7df]/55">{x.p}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                <span className="text-[11px] font-semibold uppercase tracking-[.2em] text-[#ece7df]/50">{mobile ? t({ en: 'Tap the water', it: 'Tocca l’acqua' }) : t({ en: 'Move across the water · click to drop', it: 'Muoviti sull’acqua · clic per un’onda' })}</span>
                <Ask />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
