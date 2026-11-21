import React, { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useSpring, useMotionValueEvent } from 'framer-motion'
import { useIsMobile, useLite } from '../../lib/kit'
import { useLang } from './i18n'
import { T, PERSON, COMPANIES, img } from './data'

const Portrait3D = lazy(() => import('./founder3d'))
const Map3D = lazy(() => import('./foundermap3d'))
const Group3D = lazy(() => import('./foundergroup3d'))

const EASE = [0.16, 1, 0.3, 1]
const pad = n => String(n).padStart(2, '0')

function useNear(ref, margin = '40% 0px') {
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
const skipPast = el => { if (!el) return; const y = el.getBoundingClientRect().bottom + scrollY - 2; window.__lenis ? window.__lenis.scrollTo(y, { duration: 1.4 }) : scrollTo({ top: y, behavior: 'smooth' }) }

function Skip({ target }) {
  const { t } = useLang()
  return (
    <button onClick={() => skipPast(target.current)} className="pointer-events-auto inline-flex h-9 items-center gap-2 rounded-full border border-[#ece7df]/25 px-4 text-[11px] font-semibold uppercase tracking-[.2em] text-[#ece7df]/75 backdrop-blur-md transition-colors hover:bg-[#ece7df] hover:text-[#151412]">
      {t('skip')}<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M5 1v8M1.5 5.5 5 9l3.5-3.5" /></svg>
    </button>
  )
}

function Eyebrow({ children, className = '' }) {
  return <div className={`flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[.22em] ${className}`}><span className="h-px w-8 bg-current opacity-60" />{children}</div>
}

function useTimeline() {
  const { t } = useLang()
  return [
    ...PERSON.edu.map(e => { const s = t(e); const m = s.match(/^(.*?)\s+—\s+(.*),\s*(\d{4})$/); return m ? { y: m[3], a: m[2].replace(', Israel Institute of Technology', ''), b: m[1] } : { y: '', a: s, b: '' } }),
    { y: String(PERSON.studioSince), a: 'YTS Architects', b: t({ en: 'Own studio — Ramat Gan', it: 'Studio proprio — Ramat Gan' }) },
  ]
}

/* ───────── 1. Portrait film: b/w particles → light sweep → storm → colour ───────── */
function PortraitFilm() {
  const { t } = useLang()
  const mobile = useIsMobile(), lite = useLite()
  const ref = useRef(null)
  const [near, vis] = useNear(ref)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const { scrollYProgress: enter } = useScroll({ target: ref, offset: ['start end', 'start start'] })
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: .3 })
  // portrait forms while the section scrolls in (negative = before pin)
  const film = useTransform([p, enter], ([a, e]) => (a > 0 ? a : (e - 1) * .12))
  const rows = useTimeline()
  const [beat, setBeat] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', v => setBeat(v < .3 ? 0 : v < .62 ? 1 : 2))
  const bigX = useTransform(p, [0, 1], ['4%', '-22%'])
  const bar = useTransform(p, [0, 1], [0, 1])
  const textY = useTransform(p, [0, .25], [40, 0])
  if (lite) return <PortraitStatic rows={rows} />
  return (
    <div ref={ref} data-film="portrait" className="relative h-[290vh] md:h-[320vh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* giant outlined surname behind the particles */}
        <motion.div aria-hidden style={{ x: bigX, WebkitTextStroke: '1px rgba(195,161,94,.28)' }}
          className="pointer-events-none absolute left-0 top-[14%] select-none whitespace-nowrap text-[38vw] font-black uppercase leading-[.8] tracking-[-.05em] text-transparent md:top-[8%] md:text-[27vw]">Tsubery</motion.div>
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(60%_55%_at_62%_45%,rgba(176,106,53,.16),transparent_70%)]" />
        {near && <Suspense fallback={null}><Portrait3D progress={film} active={vis} mobile={mobile} /></Suspense>}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-[#0e0e0d] via-[#0e0e0d]/70 to-transparent md:hidden" />

        <div className="pointer-events-none relative mx-auto flex h-full max-w-[1440px] flex-col justify-end px-5 pb-8 pt-24 md:justify-center md:px-10 md:pb-0">
          <motion.div style={{ y: textY }} className="max-w-[520px]">
            <Eyebrow className="text-[#c3a15e]">{t({ en: '05 — Founder', it: '05 — Fondatore' })}</Eyebrow>
            <h2 className={`${T.serif} mt-4 text-[17vw] leading-[.84] tracking-[-.02em] md:mt-6 md:text-[8vw] 2xl:text-[124px]`}>
              {['Yehiel', 'Tsubery'].map((w, i) => (
                <span key={w} className="block overflow-hidden pb-[.06em]">
                  <motion.span className={`inline-block ${i ? 'italic text-[#c3a15e]' : ''}`} initial={{ y: '105%' }} whileInView={{ y: '0%' }} viewport={{ once: true }} transition={{ duration: 1.1, ease: EASE, delay: i * .12 }}>{w}</motion.span>
                </span>
              ))}
            </h2>
            <p className="mt-4 text-[12px] font-semibold uppercase tracking-[.2em] text-[#ece7df]/55">{t(PERSON.role)}</p>
            <p className={`${T.serif} mt-5 hidden max-w-[30ch] text-[24px] leading-[1.18] text-[#ece7df]/85 md:block lg:text-[27px]`}>
              {t({ en: 'Trained in Milan and at the Technion, he has led YTS Architects from Ramat Gan since 2012 — commercial, public and residential buildings, and, through YTS Group, residences in Italy.', it: 'Formato a Milano e al Technion, guida YTS Architects da Ramat Gan dal 2012 — edifici commerciali, pubblici e residenziali e, con YTS Group, residenze in Italia.' })}
            </p>
            {/* timeline synced to the film */}
            <ol className="mt-6 grid grid-cols-3 gap-3 border-t border-[#ece7df]/15 pt-4 md:mt-9 md:gap-6 md:pt-5">
              {rows.map((r, i) => (
                <li key={i} className={`transition-all duration-700 ${beat === i ? 'opacity-100' : 'opacity-35'}`}>
                  <span className={`block text-[22px] font-black tabular-nums tracking-[-.03em] md:text-[30px] ${beat === i ? 'text-[#e9a25c]' : ''}`}>{r.y}</span>
                  <span className={`${T.serif} mt-1 block text-[15px] leading-[1.1] md:text-[19px]`}>{r.a}</span>
                  <span className="mt-1 hidden text-[11px] leading-snug text-[#ece7df]/55 md:block">{r.b}</span>
                </li>
              ))}
            </ol>
            <div className="mt-6 hidden flex-wrap items-center gap-2 md:flex">
              <span className="mr-2 text-[10.5px] font-semibold uppercase tracking-[.2em] text-[#ece7df]/45">{t({ en: 'Designs with', it: 'Progetta con' })}</span>
              {PERSON.tech.map(x => <span key={x} className="rounded-full border border-[#ece7df]/20 px-3.5 py-1 text-[12px] font-bold tracking-[.08em]">{x}</span>)}
            </div>
          </motion.div>
        </div>
        <div className="absolute right-5 top-20 flex items-center gap-4 md:right-10 md:top-24">
          <div className="hidden h-px w-24 overflow-hidden bg-[#ece7df]/15 md:block"><motion.div style={{ scaleX: bar }} className="h-full origin-left bg-[#e9a25c]" /></div>
          <Skip target={ref} />
        </div>
        <div className="pointer-events-none absolute bottom-8 right-10 hidden text-right text-[10.5px] font-semibold uppercase tracking-[.2em] text-[#ece7df]/45 md:block">
          {t({ en: 'Portrait from depth · move the cursor', it: 'Ritratto in profondità · muovi il cursore' })}
        </div>
      </div>
    </div>
  )
}

function PortraitStatic({ rows }) {
  const { t } = useLang()
  return (
    <div className="mx-auto grid max-w-[1440px] items-center gap-10 px-5 pb-10 pt-24 md:grid-cols-2 md:px-10">
      <div>
        <Eyebrow className="text-[#c3a15e]">{t({ en: '05 — Founder', it: '05 — Fondatore' })}</Eyebrow>
        <h2 className={`${T.serif} mt-5 text-[17vw] leading-[.84] md:text-[8vw]`}>Yehiel <em className="text-[#c3a15e]">Tsubery</em></h2>
        <p className="mt-4 text-[12px] font-semibold uppercase tracking-[.2em] text-[#ece7df]/55">{t(PERSON.role)}</p>
        <ol className="mt-8 grid grid-cols-3 gap-4 border-t border-[#ece7df]/15 pt-5">{rows.map((r, i) => <li key={i}><span className="block text-[26px] font-black text-[#e9a25c]">{r.y}</span><span className={`${T.serif} text-[17px]`}>{r.a}</span></li>)}</ol>
      </div>
      <img src={img(126)} alt="Yehiel Tsubery" loading="lazy" decoding="async" width="800" height="700" className="aspect-[8/7] w-full object-cover" />
    </div>
  )
}

/* ───────── 2. Motto: two words drift apart ───────── */
function Motto() {
  const { t } = useLang()
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const a = useTransform(scrollYProgress, [0, 1], ['-12%', '8%'])
  const b = useTransform(scrollYProgress, [0, 1], ['14%', '-10%'])
  const words = t(PERSON.motto).split(' ')
  return (
    <div ref={ref} className="relative overflow-hidden bg-[#b06a35] py-10 text-[#151412] md:py-14">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10"><Eyebrow className="text-[#151412]/60">{t({ en: 'The studio’s motto', it: 'Il motto dello studio' })}</Eyebrow></div>
      <motion.div style={{ x: a }} className={`${T.serif} mt-3 whitespace-nowrap pl-[6vw] text-[19vw] leading-[.82] tracking-[-.02em] md:text-[14vw]`}>{words[0]}</motion.div>
      <motion.div style={{ x: b }} className={`${T.serif} whitespace-nowrap pl-[20vw] text-[19vw] italic leading-[.9] tracking-[-.02em] text-[#ece7df] md:text-[14vw]`}>{words.slice(1).join(' ')}.</motion.div>
    </div>
  )
}

/* ───────── 3. Map film: Israel ↔ Italy ───────── */
const STOPS = [
  { k: 'home', n: 'Ramat Gan', d: { en: 'Studio · since 2012', it: 'Studio · dal 2012' } },
  { k: 'milano', n: 'Milano', d: { en: 'Politecnico, 2008', it: 'Politecnico, 2008' } },
  { k: 'como', n: { en: 'Lake Como', it: 'Lago di Como' }, d: { en: 'Residences', it: 'Residenze' } },
  { k: 'volterra', n: 'Volterra', d: { en: 'Palazzo Campani', it: 'Palazzo Campani' } },
  { k: 'roma', n: 'Roma', d: { en: 'Real-estate conference', it: 'Conferenza immobiliare' } },
  { k: 'sardegna', n: 'Sardegna', d: { en: 'In preparation', it: 'In preparazione' } },
]
const STOP_AT = [0, .4, .5, .61, .72, .84]

function MapFilm() {
  const { t } = useLang()
  const mobile = useIsMobile(), lite = useLite()
  const ref = useRef(null)
  const [near, vis] = useNear(ref)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const [step, setStep] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', v => { let s = 0; STOP_AT.forEach((a, i) => { if (v >= a) s = i }); setStep(s) })
  const labels = Object.fromEntries(STOPS.map(s => [s.k, [t(s.n), t(s.d)]]))
  const bar = useTransform(scrollYProgress, [0, .9], [0, 1])
  const Head = (
    <>
      <Eyebrow className="text-[#c3a15e]">{t({ en: 'Israel ↔ Italy', it: 'Israele ↔ Italia' })}</Eyebrow>
      <h3 className={`${T.serif} mt-3 text-[40px] leading-[.98] md:text-[58px]`}>{t({ en: 'A studio between ', it: 'Uno studio tra ' })}<em className="text-[#c3a15e]">{t({ en: 'two shores.', it: 'due sponde.' })}</em></h3>
      <p className="mt-4 hidden max-w-[36ch] text-[14.5px] leading-relaxed text-[#ece7df]/65 md:block">{t({ en: 'Drawings are made in Ramat Gan. Degrees were earned in Milan and Haifa. The residences rise on Lake Como and in Volterra — with Sardinia in preparation.', it: 'I disegni nascono a Ramat Gan. Gli studi a Milano e Haifa. Le residenze sorgono sul Lago di Como e a Volterra — con la Sardegna in preparazione.' })}</p>
    </>
  )
  if (lite) return (
    <div className="mx-auto max-w-[1440px] px-5 py-16 md:px-10">{Head}
      <ol className="mt-8 grid gap-3 md:grid-cols-3">{STOPS.map(s => <li key={s.k} className="border-t border-[#ece7df]/15 pt-3"><span className={`${T.serif} text-[24px]`}>{t(s.n)}</span><span className="block text-[11px] uppercase tracking-[.18em] text-[#c3a15e]">{t(s.d)}</span></li>)}</ol>
    </div>
  )
  return (
    <div ref={ref} data-film="map" className="relative h-[240vh] md:h-[280vh]" role="img" aria-label={t({ en: 'Map: Ramat Gan, Israel connected to Milan, Lake Como, Volterra, Rome and Sardinia', it: 'Mappa: Ramat Gan, Israele collegata a Milano, Lago di Como, Volterra, Roma e Sardegna' })}>
      <div className="sticky top-0 h-[100svh] overflow-hidden bg-[#0e0e0d]">
        {near && <Suspense fallback={null}><Map3D progress={scrollYProgress} active={vis} mobile={mobile} lite={lite} labels={labels} /></Suspense>}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#0e0e0d] to-transparent" />
        <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 hidden w-[42%] bg-gradient-to-r from-[#0e0e0d]/90 to-transparent md:block" />
        <div className="pointer-events-none relative mx-auto flex h-full max-w-[1440px] flex-col justify-between px-5 pb-8 pt-20 md:justify-center md:px-10 md:pb-0">
          <div className="max-w-[440px]">{Head}</div>
          <ol className="mt-8 grid max-w-[440px] grid-cols-3 gap-x-4 gap-y-3 md:grid-cols-1 md:gap-0">
            {STOPS.map((s, i) => (
              <li key={s.k} className={`flex items-baseline gap-3 transition-all duration-700 md:border-b md:border-[#ece7df]/10 md:py-2 ${i <= step ? 'opacity-100' : 'opacity-30'}`}>
                <span className="hidden w-6 text-[10.5px] font-semibold tabular-nums text-[#ece7df]/40 md:inline">{pad(i + 1)}</span>
                <span className={`${T.serif} text-[17px] leading-none md:text-[22px] ${i === step ? 'text-[#e9a25c]' : ''}`}>{t(s.n)}</span>
                <span className="ml-auto hidden text-[10px] font-semibold uppercase tracking-[.18em] text-[#ece7df]/45 md:inline">{t(s.d)}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="absolute right-5 top-20 flex items-center gap-4 md:right-10 md:top-24">
          <div className="hidden h-px w-24 overflow-hidden bg-[#ece7df]/15 md:block"><motion.div style={{ scaleX: bar }} className="h-full origin-left bg-[#e9a25c]" /></div>
          <Skip target={ref} />
        </div>
        <div className={`${T.serif} pointer-events-none absolute bottom-6 right-6 text-[15vw] italic leading-none text-[#ece7df]/[.05] md:bottom-4 md:right-10 md:text-[9vw]`}>{t({ en: 'Mediterranean', it: 'Mediterraneo' })}</div>
      </div>
    </div>
  )
}

/* ───────── 4. YTS Group: 3D constellation + editorial list ───────── */
const BRANCHES = [
  { t: { en: 'Architecture', it: 'Architettura' }, items: [0] },
  { t: { en: 'Holdings', it: 'Holding' }, items: [1, 2] },
  { t: { en: 'Project companies', it: 'Società di progetto' }, items: [3, 4, 5, 6, 7] },
]

function Group() {
  const { t } = useLang()
  const mobile = useIsMobile(), lite = useLite()
  const ref = useRef(null)
  const [near, vis] = useNear(ref)
  const hot = useRef(-1), inView = useRef(false)
  const [h, setH] = useState(-1)
  useEffect(() => { inView.current = vis }, [vis])
  const set = i => { hot.current = i; setH(i) }
  const labels = { root: 'YTS Group', branches: BRANCHES.map(b => t(b.t)) }
  return (
    <div ref={ref} data-film="group" className="relative mx-auto grid max-w-[1440px] gap-6 px-5 pb-20 pt-12 md:px-10 md:pb-28 lg:grid-cols-12 lg:gap-10">
      <div className="lg:col-span-5">
        <Eyebrow className="text-[#c3a15e]">YTS Group</Eyebrow>
        <h3 className={`${T.serif} mt-3 max-w-[16ch] text-[42px] leading-[.98] md:text-[60px]`}>{t({ en: 'One signature, ', it: 'Una firma, ' })}<em className="text-[#c3a15e]">{t({ en: 'eight companies.', it: 'otto società.' })}</em></h3>
        <p className="mt-4 max-w-[40ch] text-[14.5px] leading-relaxed text-[#ece7df]/65">{t({ en: 'Design and development under one roof — the architecture studio in Israel, and the companies that acquire and deliver residences in Italy.', it: 'Progetto e sviluppo sotto lo stesso tetto — lo studio di architettura in Israele e le società che acquisiscono e realizzano residenze in Italia.' })}</p>
        <div className="mt-8 space-y-6" onPointerLeave={() => set(-1)}>
          {BRANCHES.map(b => (
            <div key={b.t.en}>
              <div className="flex items-center justify-between border-b border-[#ece7df]/25 pb-2">
                <span className="text-[11px] font-bold uppercase tracking-[.2em] text-[#c3a15e]">{t(b.t)}</span>
                <span className="text-[11px] tabular-nums text-[#ece7df]/40">{pad(b.items.length)}</span>
              </div>
              <ul className={b.items.length > 2 ? 'sm:grid sm:grid-cols-2 sm:gap-x-6' : 'sm:grid sm:grid-cols-2 sm:gap-x-6'}>
                {b.items.map(i => {
                  const c = COMPANIES[i]
                  return (
                    <li key={c} tabIndex={0} onPointerEnter={() => set(i)} onFocus={() => set(i)} onBlur={() => set(-1)}
                      className="flex cursor-default items-baseline gap-3 border-b border-[#ece7df]/10 py-2.5 outline-none">
                      <span className={`w-6 shrink-0 text-[11px] font-semibold tabular-nums transition-colors ${h === i ? 'text-[#e9a25c]' : 'text-[#ece7df]/35'}`}>{pad(i + 1)}</span>
                      <span className={`${T.serif} text-[21px] leading-[1.05] transition-all duration-500 md:text-[23px] ${h === i ? 'translate-x-1 italic text-[#e9a25c]' : ''}`}>{c.replace(/ ltd$/, '')}{/ ltd$/.test(c) && <span className="ml-1.5 align-middle font-['Inter_Tight',sans-serif] text-[9.5px] font-semibold uppercase tracking-[.16em] text-[#ece7df]/35">ltd</span>}</span>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="relative order-first h-[380px] md:h-[520px] lg:order-none lg:col-span-7 lg:h-auto lg:min-h-[600px]">
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(50%_50%_at_50%_50%,rgba(176,106,53,.14),transparent_70%)]" />
        {near && !lite && <Suspense fallback={null}><Group3D hot={hot} active={vis} mobile={mobile} lite={lite} labels={labels} inView={inView} /></Suspense>}
        {lite && <div className={`${T.serif} grid h-full place-items-center text-[60px] italic text-[#c3a15e]`}>YTS Group</div>}
        <div className="pointer-events-none absolute bottom-2 right-0 text-[10.5px] font-semibold uppercase tracking-[.2em] text-[#ece7df]/40">{t({ en: 'Hover a company to trace it', it: 'Passa su una società per seguirla' })}</div>
      </div>
    </div>
  )
}

export default function Founder() {
  return (
    <section id="founder" className={`relative bg-[#0e0e0d] text-[#ece7df] ${T.sans}`}>
      <PortraitFilm />
      <Motto />
      <MapFilm />
      <Group />
    </section>
  )
}
