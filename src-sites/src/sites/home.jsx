import React, { useRef, useState, useEffect, Suspense, lazy, createContext, useContext } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, useSpring, useMotionValueEvent, AnimatePresence, MotionConfig, LayoutGroup, useInView } from 'framer-motion'
import { ArrowUpRight, ArrowRight, Download, Zap, Box, Wallet, MessageCircle, FileText, Presentation } from 'lucide-react'
import '../lib/base.css'
import { useSmooth, Reveal, LineReveal, useLite, TG, EASE } from '../lib/kit'
import { T } from './home-i18n'
import { WORKS, MORE, TG_URL, TG_HANDLE, BASE, thumb } from './home-data'
import BotDemo from './home-bot'

const Stack = lazy(() => import('./home3d'))
const D = "font-['Inter_Tight',sans-serif]"
const M = "font-['JetBrains_Mono',monospace]"
const GRAD = 'bg-gradient-to-b from-white via-white to-white/45 bg-clip-text text-transparent'
const A = '#8f9dff'

/* ---------------- language ---------------- */
const L = createContext({ t: T.en, lang: 'en', setLang: () => {} })
const useL = () => useContext(L)
function useLangState() {
  const [lang, set] = useState(() => { try { return localStorage.getItem('pf-lang') === 'ru' ? 'ru' : 'en' } catch (e) { return 'en' } })
  useEffect(() => { document.documentElement.lang = lang; try { localStorage.setItem('pf-lang', lang) } catch (e) {} }, [lang])
  return [lang, set]
}

/* ---------------- small parts ---------------- */
function Kicker({ children, className = '' }) {
  return <div className={M + ' mb-5 flex items-center gap-2 text-[11px] uppercase tracking-[.2em] text-white/50 ' + className}><span className="h-1.5 w-1.5 rounded-full" style={{ background: A, boxShadow: `0 0 12px ${A}` }} />{children}</div>
}
function TgButton({ children, className = '', big = false }) {
  return (
    <a href={TG_URL} target="_blank" rel="noopener" className={'group inline-flex items-center gap-2.5 rounded-full bg-white font-semibold text-[#07080b] transition hover:shadow-[0_0_40px_-6px_rgba(143,157,255,.8)] ' + (big ? 'px-7 py-4 text-[16px]' : 'px-5 py-3 text-[14px]') + ' ' + className}>
      <TG width={big ? 20 : 16} height={big ? 20 : 16} />{children}
      <ArrowUpRight size={big ? 18 : 15} className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </a>
  )
}
/* card with a 1px border light that follows the pointer */
function Glow({ children, className = '', as = 'div', ...rest }) {
  const Tag = as
  const move = e => { const r = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`); e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`) }
  return <Tag onPointerMove={move} className={'glow relative rounded-3xl border border-white/[.08] bg-white/[.025] ' + className} {...rest}>{children}</Tag>
}
function Img({ src, alt, className = '' }) {
  return <img src={src} alt={alt} loading="lazy" decoding="async" className={className} onError={e => { e.currentTarget.style.display = 'none' }} />
}

/* ---------------- header ---------------- */
function Header() {
  const { t, lang, setLang } = useL()
  const [solid, setSolid] = useState(false)
  useEffect(() => { const f = () => setSolid(scrollY > 40); f(); addEventListener('scroll', f, { passive: true }); return () => removeEventListener('scroll', f) }, [])
  return (
    <header className={'fixed inset-x-0 top-0 z-50 transition-all duration-500 ' + (solid ? 'border-b border-white/[.06] bg-[#07080b]/70 backdrop-blur-xl' : 'border-b border-transparent')}>
      <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between px-5 md:px-8">
        <a href="#top" className="flex items-center gap-2.5">
          <span className="grid h-7 w-7 place-items-center rounded-lg border border-white/15 bg-gradient-to-br from-white/20 to-white/[.02] text-[13px] font-bold">A</span>
          <span className={D + ' text-[15px] font-semibold tracking-tight'}>Artem</span>
          <span className={M + ' hidden text-[11px] text-white/40 lg:inline'}>/ websites · decks · bots</span>
        </a>
        <nav className="hidden items-center gap-7 text-[13.5px] text-white/60 md:flex">
          {t.nav.map(([h, l]) => <a key={h} href={h} className="transition hover:text-white">{l}</a>)}
        </nav>
        <div className="flex items-center gap-2">
          <div className={M + ' flex rounded-full border border-white/10 p-0.5 text-[11px]'} role="group" aria-label="Language">
            {['en', 'ru'].map(k => (
              <button key={k} onClick={() => setLang(k)} aria-pressed={lang === k} className={'rounded-full px-2.5 py-1 uppercase transition ' + (lang === k ? 'bg-white text-[#07080b]' : 'text-white/55 hover:text-white')}>{k}</button>
            ))}
          </div>
          <a href={TG_URL} target="_blank" rel="noopener" className="hidden items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-[13px] font-medium transition hover:border-white/40 sm:inline-flex"><TG width={14} height={14} />{t.tgBtn}</a>
        </div>
      </div>
    </header>
  )
}

/* ---------------- pinned film: hero + 4 chapters ---------------- */
const CAP = [[.19, .24, .33, .38], [.42, .46, .55, .6], [.64, .68, .77, .82], [.86, .9, .98, 1]]
function Caption({ p, r, c, last }) {
  const o = useTransform(p, r, last ? [0, 1, 1, 1] : [0, 1, 1, 0])
  const y = useTransform(p, [r[0], r[1], r[2], r[3]], last ? [30, 0, 0, 0] : [30, 0, 0, -30])
  return (
    <motion.div style={{ opacity: o, y }} className="absolute inset-x-0 bottom-[9vh] mx-auto max-w-[760px] px-6 text-center md:bottom-[10vh]">
      {!last && <div className={M + ' mb-3 text-[11px] uppercase tracking-[.25em]'} style={{ color: A }}>{c[0]}</div>}
      <h2 className={D + ' text-[clamp(34px,6.4vw,84px)] font-semibold leading-[.98] tracking-[-.04em] ' + GRAD}>{c[1]}</h2>
      <p className="mx-auto mt-4 max-w-[520px] text-[15px] leading-relaxed text-white/55 md:text-[17px]">{c[2]}</p>
    </motion.div>
  )
}
function LiteStack() {
  return (
    <div className="absolute inset-0 flex items-start justify-center pt-[16vh] md:items-center md:justify-end md:pr-[6vw] md:pt-0" style={{ perspective: 1200 }}>
      <div className="relative h-[180px] w-[290px] md:h-[300px] md:w-[480px]" style={{ transformStyle: 'preserve-3d', transform: 'rotateY(-28deg) rotateX(8deg)' }}>
        {['everest', 'butchers', 'goauto'].map((s, i) => (
          <div key={s} className="absolute inset-0 overflow-hidden rounded-xl border border-white/15 bg-[#161a26] shadow-2xl" style={{ transform: `translate3d(${i * 26}px,${i * -18}px,${i * 60}px)` }}><Img src={thumb(s)} alt="" className="h-full w-full object-cover" /></div>
        ))}
      </div>
    </div>
  )
}
function Film() {
  const { t, lang } = useL()
  const lite = useLite()
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const p = useSpring(scrollYProgress, { stiffness: 80, damping: 22, mass: .5 })
  const heroO = useTransform(scrollYProgress, [0, .12], [1, 0])
  const heroY = useTransform(scrollYProgress, [0, .12], [0, -70])
  const hintO = useTransform(scrollYProgress, [0, .04], [1, 0])
  const [ch, setCh] = useState(-1)
  useMotionValueEvent(scrollYProgress, 'change', v => setCh(v < .19 ? -1 : v < .41 ? 0 : v < .63 ? 1 : v < .85 ? 2 : 3))
  const active = useInView(ref, { margin: '100px 0px 100px 0px' })
  return (
    <section ref={ref} id="top" className="relative h-[460vh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0" style={{ background: 'radial-gradient(60% 50% at 70% 40%, rgba(110,125,255,.16), transparent 70%), radial-gradient(40% 40% at 20% 80%, rgba(170,140,255,.07), transparent 70%)' }} />
        <div aria-hidden="true" className="beams absolute inset-0 opacity-60" />
        <div className="absolute inset-0">
          {lite ? <LiteStack /> : <Suspense fallback={null}><Stack progress={p} active={active} /></Suspense>}
        </div>
        {/* hero copy */}
        <motion.div style={{ opacity: heroO, y: heroY }} className="relative z-10 mx-auto flex h-full max-w-[1240px] flex-col justify-end px-5 pb-[9vh] md:justify-center md:px-8 md:pb-0">
          <div className="max-w-[620px]">
            <Kicker>{t.eyebrow}</Kicker>
            <h1 key={lang} className={D + ' text-[clamp(36px,6.6vw,92px)] font-semibold leading-[.95] tracking-[-.045em]'}>
              {t.h1.map((l, i) => <LineReveal key={i} delay={.15 + i * .1} className={i === 2 ? 'bg-gradient-to-r from-[#c9cfff] via-[#8f9dff] to-[#c3a8ff] bg-clip-text text-transparent' : GRAD}>{l}</LineReveal>)}
            </h1>
            <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .6, duration: .8, ease: EASE }} className="mt-6 max-w-[500px] text-[15.5px] leading-relaxed text-white/60 md:text-[17px]">{t.sub}</motion.p>
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .75, duration: .8, ease: EASE }} className="mt-8 flex flex-wrap gap-3">
              <a href="#work" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[.04] px-5 py-3 text-[14px] font-medium backdrop-blur transition hover:border-white/40">{t.ctaWork}<ArrowRight size={15} /></a>
              <TgButton>{t.ctaTg}</TgButton>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 1 }} className="mt-10 hidden gap-8 border-t border-white/[.08] pt-5 sm:flex">
              {t.speeds.map(([a, b]) => <div key={b}><div className={M + ' text-[15px] text-white'}>{a}</div><div className="text-[12.5px] text-white/45">{b}</div></div>)}
            </motion.div>
          </div>
        </motion.div>
        <motion.div style={{ opacity: hintO }} className={M + ' absolute bottom-6 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-[10px] uppercase tracking-[.3em] text-white/35 md:flex'}>
          <span className="relative h-8 w-px overflow-hidden bg-white/15"><motion.span className="absolute inset-x-0 top-0 h-3 bg-white/70" animate={{ y: [-12, 32] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }} /></span>{t.scroll}
        </motion.div>
        {/* chapters */}
        {t.chapters.map((c, i) => <Caption key={lang + i} p={scrollYProgress} r={CAP[i]} c={c} last={i === 3} />)}
        <div className="absolute right-6 top-1/2 hidden -translate-y-1/2 flex-col gap-3 lg:flex">
          {t.chapters.map((c, i) => (
            <div key={i} className={M + ' flex items-center justify-end gap-2 text-[10px] transition-colors duration-500 ' + (ch === i ? 'text-white' : 'text-white/25')}>
              <span>{c[0]}</span><span className="h-px transition-all duration-500" style={{ width: ch === i ? 26 : 12, background: ch === i ? A : 'rgba(255,255,255,.25)' }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------- selected work ---------------- */
function WorkCard({ w, i }) {
  const { t, lang } = useL()
  return (
    <motion.div layout initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: .96 }} transition={{ duration: .55, ease: EASE }}>
      <Glow as="a" href={`${BASE}${w.s}/`} target="_blank" rel="noopener" className="group block p-3 transition-colors hover:bg-white/[.04]">
        <motion.div initial={{ clipPath: 'inset(10% 10% 10% 10% round 18px)' }} whileInView={{ clipPath: 'inset(0% 0% 0% 0% round 18px)' }} viewport={{ once: true, margin: '0px 0px -10% 0px' }} transition={{ duration: 1, ease: EASE }}
          className="relative overflow-hidden rounded-[18px] border border-white/[.06] bg-[#11141c]">
          <div className="flex items-center gap-1.5 border-b border-white/[.06] bg-[#0d1016] px-3 py-2">
            {[0, 1, 2].map(k => <span key={k} className="h-2 w-2 rounded-full bg-white/15" />)}
            <span className={M + ' ml-3 truncate text-[10.5px] text-white/35'}>/portfolio/{w.s}/</span>
          </div>
          <div className="relative aspect-[16/10] overflow-hidden">
            <div className={D + ' absolute inset-0 grid place-items-center text-[28px] font-semibold text-white/20'}>{w.name}</div>
            <Img src={thumb(w.s)} alt={`${w.name} — ${w.niche.en}`} className="relative h-full w-full object-cover object-top transition duration-[1.2s] ease-out group-hover:scale-[1.035]" />
            <span className={M + ' absolute left-3 top-3 rounded-full border border-white/20 bg-black/55 px-2.5 py-1 text-[10px] uppercase tracking-wider text-white/85 backdrop-blur'}>{t.concept}</span>
          </div>
        </motion.div>
        <div className="flex items-start justify-between gap-4 px-2 pb-2 pt-5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h3 className={D + ' text-[22px] font-semibold tracking-[-.02em]'}>{w.name}</h3>
              <span className="text-[13px] text-white/45">{w.niche[lang]}</span>
            </div>
            <p className="mt-2 max-w-[520px] text-[14.5px] leading-relaxed text-white/60">{w.idea[lang]}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {w.tags.map(x => <span key={x} className={M + ' rounded-md border border-white/10 px-2 py-0.5 text-[10.5px] text-white/55'}>{x}</span>)}
            </div>
          </div>
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/10 transition group-hover:border-white/40 group-hover:bg-white group-hover:text-[#07080b]" aria-label={t.open}><ArrowUpRight size={17} /></span>
        </div>
      </Glow>
    </motion.div>
  )
}
function Work() {
  const { t } = useL()
  const [f, setF] = useState('all')
  const list = WORKS.filter(w => f === 'all' || (f === 'uk' ? w.uk : w.cat === f))
  return (
    <section id="work" className="relative mx-auto max-w-[1240px] px-5 pb-24 pt-28 md:px-8 md:pt-36">
      <div className="mb-12 grid gap-8 md:grid-cols-[1.3fr_1fr] md:items-end">
        <div>
          <Kicker>{t.workKicker} <span className="text-white/30">/ {String(WORKS.length).padStart(2, '0')}</span></Kicker>
          <Reveal as="h2" className={D + ' text-[clamp(34px,5vw,64px)] font-semibold leading-[1] tracking-[-.04em] ' + GRAD}>{t.workH}</Reveal>
        </div>
        <Reveal delay={.1} className="text-[15px] leading-relaxed text-white/55">{t.workNote}</Reveal>
      </div>
      <LayoutGroup>
        <div className="mb-8 flex flex-wrap gap-2">
          {t.filters.map(([k, l]) => (
            <button key={k} onClick={() => setF(k)} className={'relative rounded-full border px-4 py-2 text-[13px] transition ' + (f === k ? 'border-transparent text-[#07080b]' : 'border-white/10 text-white/60 hover:border-white/30 hover:text-white')}>
              {f === k && <motion.span layoutId="chip" className="absolute inset-0 rounded-full bg-white" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
              <span className="relative">{l}</span>
            </button>
          ))}
        </div>
        <motion.div layout className="grid gap-5 lg:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {list.map((w, i) => <WorkCard key={w.s} w={w} i={i} />)}
          </AnimatePresence>
        </motion.div>
      </LayoutGroup>
    </section>
  )
}

function More() {
  const { t, lang } = useL()
  return (
    <section className="mx-auto max-w-[1240px] px-5 pb-28 md:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-t border-white/[.08] pt-10">
        <h3 className={D + ' text-[28px] font-semibold tracking-[-.03em]'}>{t.moreH} <span className={M + ' align-middle text-[13px] text-white/35'}>{MORE.length}</span></h3>
        <p className="max-w-[420px] text-[14px] text-white/45">{t.moreNote}</p>
      </div>
      <div className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-4">
        {MORE.map(([s, name, en, ru, uk], i) => (
          <a key={s} href={`${BASE}${s}/`} target="_blank" rel="noopener" className="group flex items-center gap-3 border-b border-white/[.06] py-3 transition hover:border-white/25">
            <span className={M + ' w-6 text-[10px] text-white/25'}>{String(i + 1).padStart(2, '0')}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[14px] font-medium text-white/85 transition group-hover:text-white">{name}</span>
              <span className="block truncate text-[12px] text-white/40">{lang === 'ru' ? ru : en}{uk ? ' · UK' : ''}</span>
            </span>
            <ArrowUpRight size={14} className="text-white/25 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" />
          </a>
        ))}
      </div>
    </section>
  )
}

/* ---------------- presentations ---------------- */
function DeckCard({ d, i }) {
  const { t } = useL()
  const [id, title, desc] = d
  return (
    <Reveal delay={i * .08}>
      <Glow className="group flex h-full flex-col p-4">
        <div className="relative aspect-[16/10] overflow-visible">
          {[2, 1, 0].map(k => (
            <div key={k} className="absolute inset-0 overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-[#1a1e2b] to-[#0e1017] shadow-[0_20px_50px_-20px_rgba(0,0,0,.8)] transition-transform duration-700 ease-[cubic-bezier(.2,0,0,1)]"
              style={{ transform: `translate(${k * 10}px, ${-k * 10}px) rotate(${k * 2}deg)`, zIndex: 3 - k, '--fan': `translate(${k * 34}px, ${-k * 22}px) rotate(${k * 5}deg)` }} data-fan>
              <div className="absolute inset-0 flex flex-col justify-between p-4">
                <div className={M + ' text-[9px] uppercase tracking-widest text-white/30'}>{t.sample} · 0{k + 1}</div>
                <div className={D + ' text-[20px] font-semibold leading-none text-white/25'}>{title}</div>
              </div>
              <Img src={`${BASE}decks/${id}-${k + 1}.png`} alt={k === 0 ? `${title} — slide preview` : ''} className="relative h-full w-full object-cover" />
            </div>
          ))}
        </div>
        <div className="mt-7 flex flex-1 flex-col px-1">
          <h3 className={D + ' text-[21px] font-semibold tracking-[-.02em]'}>{title}</h3>
          <p className="mt-2 flex-1 text-[14px] leading-relaxed text-white/55">{desc}</p>
          <a href={`${BASE}decks/${id}.pptx`} download className="mt-5 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-[13px] font-medium transition hover:border-white/40 hover:bg-white/[.05]"><Download size={14} />{t.download}</a>
        </div>
      </Glow>
    </Reveal>
  )
}
function Decks() {
  const { t } = useL()
  return (
    <section id="decks" className="relative border-t border-white/[.06] py-28 md:py-36">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[400px]" style={{ background: 'radial-gradient(50% 60% at 50% 0%, rgba(143,157,255,.10), transparent 70%)' }} />
      <div className="relative mx-auto max-w-[1240px] px-5 md:px-8">
        <div className="mb-14 max-w-[760px]">
          <Kicker>{t.decksKicker}</Kicker>
          <Reveal as="h2" className={D + ' text-[clamp(34px,5vw,64px)] font-semibold leading-[1] tracking-[-.04em] ' + GRAD}>{t.decksH}</Reveal>
          <Reveal delay={.1} as="p" className="mt-5 max-w-[560px] text-[16px] leading-relaxed text-white/55">{t.decksSub}</Reveal>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {t.decks.map((d, i) => <DeckCard key={d[0]} d={d} i={i} />)}
        </div>
        <a href={`${BASE}slides/`} target="_blank" rel="noopener" className="mt-8 inline-flex items-center gap-2 text-[14px] text-white/70 transition hover:text-white"><Presentation size={16} />{t.webSlides}<ArrowUpRight size={14} /></a>
      </div>
    </section>
  )
}

/* ---------------- telegram bots ---------------- */
function Bots() {
  const { t, lang } = useL()
  return (
    <section id="bots" className="relative overflow-hidden border-t border-white/[.06] py-28 md:py-36">
      <div aria-hidden="true" className="pointer-events-none absolute right-[-10%] top-[20%] h-[600px] w-[600px] rounded-full" style={{ background: 'radial-gradient(closest-side, rgba(90,140,255,.14), transparent)' }} />
      <div className="relative mx-auto grid max-w-[1240px] items-center gap-14 px-5 md:px-8 lg:grid-cols-[1fr_auto]">
        <div>
          <Kicker>{t.botsKicker}</Kicker>
          <Reveal as="h2" className={D + ' max-w-[640px] text-[clamp(34px,5vw,64px)] font-semibold leading-[1] tracking-[-.04em] ' + GRAD}>{t.botsH}</Reveal>
          <Reveal delay={.1} as="p" className="mt-5 max-w-[520px] text-[16px] leading-relaxed text-white/55">{t.botsSub}</Reveal>
          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {t.botFeat.map(([h, p], i) => (
              <Reveal key={h} delay={i * .06}><Glow className="h-full rounded-2xl p-5"><div className={M + ' mb-3 text-[10px] text-white/35'}>0{i + 1}</div><div className="text-[15px] font-semibold">{h}</div><div className="mt-1.5 text-[13.5px] leading-relaxed text-white/50">{p}</div></Glow></Reveal>
            ))}
          </div>
        </div>
        <BotDemo key={lang} t={t} />
      </div>
    </section>
  )
}

/* ---------------- pricing ---------------- */
function Pricing() {
  const { t } = useL()
  const icons = [Box, FileText, MessageCircle]
  return (
    <section id="pricing" className="border-t border-white/[.06] py-28 md:py-36">
      <div className="mx-auto max-w-[1240px] px-5 md:px-8">
        <div className="mb-14 max-w-[760px]">
          <Kicker>{t.priceKicker}</Kicker>
          <Reveal as="h2" className={D + ' text-[clamp(34px,5vw,64px)] font-semibold leading-[1] tracking-[-.04em] ' + GRAD}>{t.priceH}</Reveal>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {t.plans.map((pl, i) => {
            const I = icons[i]
            return (
              <Reveal key={pl.t} delay={i * .08}>
                <Glow className={'flex h-full flex-col p-7 ' + (i === 0 ? 'bg-gradient-to-b from-[#8f9dff]/[.08] to-transparent' : '')}>
                  <div className="mb-8 flex items-center justify-between">
                    <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[.04]"><I size={18} style={{ color: A }} /></span>
                    <span className={M + ' rounded-full border border-white/10 px-2.5 py-1 text-[10.5px] text-white/55'}>{pl.d}</span>
                  </div>
                  <h3 className={D + ' text-[21px] font-semibold tracking-[-.02em]'}>{pl.t}</h3>
                  <div className="mt-5 flex items-baseline gap-2"><span className="text-[13px] text-white/45">{t.from}</span><span className={D + ' text-[44px] font-semibold leading-none tracking-[-.04em]'}>{pl.p}</span></div>
                  <div className="mt-1.5 text-[13px] text-white/45">{pl.p2}</div>
                  <ul className="mt-7 flex-1 space-y-2.5 border-t border-white/[.08] pt-6">
                    {pl.f.map(x => <li key={x} className="flex gap-2.5 text-[14px] text-white/70"><span className="mt-[7px] h-1 w-1 shrink-0 rounded-full" style={{ background: A }} />{x}</li>)}
                  </ul>
                </Glow>
              </Reveal>
            )
          })}
        </div>
        <div className="mt-8 flex flex-col items-start justify-between gap-5 rounded-3xl border border-white/[.08] p-6 md:flex-row md:items-center">
          <p className="flex items-center gap-3 text-[14.5px] text-white/65"><Wallet size={18} className="shrink-0" style={{ color: A }} />{t.payNote}</p>
          <TgButton>{t.discuss}</TgButton>
        </div>
      </div>
    </section>
  )
}

/* ---------------- process (sticky split) ---------------- */
function Process() {
  const { t } = useL()
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 70%', 'end 60%'] })
  const h = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })
  return (
    <section className="border-t border-white/[.06] py-28 md:py-36">
      <div className="mx-auto grid max-w-[1240px] gap-12 px-5 md:grid-cols-[1fr_1.2fr] md:px-8">
        <div className="md:sticky md:top-32 md:self-start">
          <Kicker>{t.procKicker}</Kicker>
          <Reveal as="h2" className={D + ' text-[clamp(34px,5vw,64px)] font-semibold leading-[1] tracking-[-.04em] ' + GRAD}>{t.procH}</Reveal>
        </div>
        <div ref={ref} className="relative pl-10">
          <div className="absolute bottom-2 left-[11px] top-2 w-px bg-white/10" />
          <motion.div className="absolute left-[11px] top-2 w-px origin-top" style={{ scaleY: h, height: 'calc(100% - 16px)', background: `linear-gradient(${A}, #c3a8ff)` }} />
          {t.steps.map(([h2, p], i) => (
            <Reveal key={h2} className="relative pb-14 last:pb-0">
              <span className={M + ' absolute -left-10 top-0 grid h-[23px] w-[23px] place-items-center rounded-full border border-white/20 bg-[#07080b] text-[10px] text-white/70'}>{i + 1}</span>
              <h3 className={D + ' text-[26px] font-semibold tracking-[-.03em] md:text-[32px]'}>{h2}</h3>
              <p className="mt-3 max-w-[460px] text-[15.5px] leading-relaxed text-white/55">{p}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------- why me (bento) ---------------- */
function PayToggle() {
  const { lang } = useL()
  const ref = useRef(null), inView = useInView(ref, { amount: .6 })
  const [on, setOn] = useState(false)
  useEffect(() => { if (!inView) return; const id = setInterval(() => setOn(v => !v), 1800); return () => clearInterval(id) }, [inView])
  return (
    <div ref={ref} className="flex items-center gap-3">
      <button onClick={() => setOn(v => !v)} aria-label="toggle" className={'relative h-8 w-14 rounded-full transition-colors duration-500 ' + (on ? 'bg-[#8f9dff]' : 'bg-white/10')}>
        <motion.span className="absolute top-1 h-6 w-6 rounded-full bg-white" animate={{ left: on ? 28 : 4 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
      </button>
      <span className={M + ' text-[12px] text-white/60'}>{on ? (lang === 'ru' ? 'нравится → оплата' : 'like it → pay') : (lang === 'ru' ? 'не нравится → $0' : 'not happy → $0')}</span>
    </div>
  )
}
function Why() {
  const { t } = useL()
  const [fast, td, pay, direct] = t.why
  return (
    <section className="border-t border-white/[.06] py-28 md:py-36">
      <div className="mx-auto max-w-[1240px] px-5 md:px-8">
        <div className="mb-14"><Kicker>{t.whyKicker}</Kicker><Reveal as="h2" className={D + ' text-[clamp(34px,5vw,64px)] font-semibold leading-[1] tracking-[-.04em] ' + GRAD}>{t.whyH}</Reveal></div>
        <div className="grid gap-5 md:grid-cols-6">
          <Reveal className="md:col-span-4"><Glow className="flex h-full min-h-[260px] flex-col justify-between overflow-hidden p-7">
            <Zap size={20} style={{ color: A }} />
            <div className={D + ' my-6 text-[clamp(64px,10vw,140px)] font-semibold leading-[.85] tracking-[-.06em] ' + GRAD}>48h</div>
            <div><div className="text-[18px] font-semibold">{fast[0]}</div><p className="mt-1.5 max-w-[420px] text-[14px] text-white/55">{fast[1]}</p></div>
          </Glow></Reveal>
          <Reveal delay={.06} className="md:col-span-2"><Glow className="flex h-full min-h-[260px] flex-col justify-between overflow-hidden p-7">
            <div className="relative mx-auto my-4 h-24 w-24" style={{ perspective: 400 }}>
              <div className="cube absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
                {['rotateY(0deg)', 'rotateY(90deg)', 'rotateY(180deg)', 'rotateY(-90deg)', 'rotateX(90deg)', 'rotateX(-90deg)'].map(r => <span key={r} className="absolute inset-0 rounded-md border border-[#8f9dff]/60 bg-[#8f9dff]/[.06]" style={{ transform: `${r} translateZ(48px)` }} />)}
              </div>
            </div>
            <div><div className="text-[18px] font-semibold">{td[0]}</div><p className="mt-1.5 text-[14px] text-white/55">{td[1]}</p></div>
          </Glow></Reveal>
          <Reveal className="md:col-span-3"><Glow className="flex h-full min-h-[220px] flex-col justify-between p-7">
            <PayToggle />
            <div className="mt-8"><div className="text-[18px] font-semibold">{pay[0]}</div><p className="mt-1.5 max-w-[420px] text-[14px] text-white/55">{pay[1]}</p></div>
          </Glow></Reveal>
          <Reveal delay={.06} className="md:col-span-3"><Glow as="a" href={TG_URL} target="_blank" rel="noopener" className="group flex h-full min-h-[220px] flex-col justify-between p-7">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#2b5278] px-3.5 py-2 text-[13px] text-white"><TG width={14} height={14} />{TG_HANDLE}</span>
            <div className="mt-8"><div className="flex items-center gap-2 text-[18px] font-semibold">{direct[0]}<ArrowUpRight size={16} className="opacity-50 transition group-hover:opacity-100" /></div><p className="mt-1.5 max-w-[420px] text-[14px] text-white/55">{direct[1]}</p></div>
          </Glow></Reveal>
        </div>
      </div>
    </section>
  )
}

/* ---------------- cv teaser + contact ---------------- */
function CvTeaser() {
  const { t } = useL()
  return (
    <section className="mx-auto max-w-[1240px] px-5 pb-28 md:px-8">
      <Reveal><Glow className="grid items-center gap-10 overflow-hidden p-7 md:grid-cols-[1.2fr_1fr] md:p-12">
        <div>
          <Kicker>{t.cvKicker}</Kicker>
          <h2 className={D + ' text-[clamp(30px,4vw,48px)] font-semibold leading-[1.02] tracking-[-.04em]'}>{t.cvH}</h2>
          <p className="mt-4 max-w-[440px] text-[15px] text-white/55">{t.cvSub}</p>
          <a href={`${BASE}cv/`} className="mt-7 inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-[14px] font-medium transition hover:border-white/40">{t.cvBtn}<ArrowRight size={15} /></a>
        </div>
        <div className="relative mx-auto h-[220px] w-full max-w-[340px]" style={{ perspective: 900 }}>
          <div className="absolute inset-x-6 top-2 h-[260px] rounded-lg bg-[#f6f6f4] p-5 shadow-[0_30px_80px_-20px_rgba(0,0,0,.9)] transition-transform duration-700 hover:rotate-0" style={{ transform: 'rotateX(18deg) rotateZ(-4deg)' }}>
            <div className="text-[15px] font-bold text-black">Artem</div>
            <div className="mb-4 text-[9px] text-black/50">Web Designer & Developer</div>
            {[90, 70, 84, 60, 0, 76, 88, 52, 0, 80, 64].map((w, i) => <div key={i} className="mb-1.5 h-1.5 rounded-full bg-black/10" style={{ width: w + '%', opacity: w ? 1 : 0 }} />)}
          </div>
        </div>
      </Glow></Reveal>
    </section>
  )
}
function Contact() {
  const { t, lang } = useL()
  return (
    <section id="contact" className="relative overflow-hidden border-t border-white/[.06] py-32 text-center md:py-44">
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-[700px] w-[900px] max-w-[160vw] -translate-x-1/2 -translate-y-1/2" style={{ background: 'radial-gradient(closest-side, rgba(143,157,255,.2), transparent)' }} />
      <div className="relative mx-auto max-w-[900px] px-5">
        <h2 key={lang} className={D + ' text-[clamp(44px,9vw,128px)] font-semibold leading-[.92] tracking-[-.055em]'}>
          {t.ctaH.map((l, i) => <Reveal key={i} delay={i * .1} className={GRAD + ' block pb-[.06em]'}>{l}</Reveal>)}
        </h2>
        <Reveal delay={.2} as="p" className="mx-auto mt-6 max-w-[480px] text-[16px] text-white/55">{t.ctaSub}</Reveal>
        <Reveal delay={.3} className="mt-10"><TgButton big>{TG_HANDLE}</TgButton></Reveal>
      </div>
    </section>
  )
}
function Footer() {
  const { t } = useL()
  return (
    <footer className="border-t border-white/[.06] pb-24 pt-8 md:pb-8">
      <div className="mx-auto flex max-w-[1240px] flex-col justify-between gap-3 px-5 text-[12.5px] text-white/40 md:flex-row md:px-8">
        <span>{t.foot}</span>
        <span className="flex gap-5"><span>{t.footNote}</span><a href={`${BASE}cv/`} className="hover:text-white">CV</a><a href={TG_URL} target="_blank" rel="noopener" className="hover:text-white">Telegram</a></span>
      </div>
    </footer>
  )
}
function FloatTg() {
  const [show, set] = useState(false)
  useEffect(() => { const f = () => set(scrollY > innerHeight * .8); f(); addEventListener('scroll', f, { passive: true }); return () => removeEventListener('scroll', f) }, [])
  return (
    <a href={TG_URL} target="_blank" rel="noopener" aria-label="Telegram" className={'fixed bottom-5 right-4 z-50 inline-flex transition-all duration-500 ' + (show ? 'opacity-100' : 'pointer-events-none translate-y-4 opacity-0') + ' items-center gap-2 rounded-full bg-[#2aa6e0] px-4 py-3 text-[14px] font-semibold text-white shadow-[0_10px_30px_-6px_rgba(42,166,224,.7)] md:hidden'} style={{ marginBottom: 'env(safe-area-inset-bottom)' }}>
      <TG width={18} height={18} />Telegram
    </a>
  )
}

function App() {
  useSmooth()
  const [lang, setLang] = useLangState()
  return (
    <MotionConfig reducedMotion="user">
      <L.Provider value={{ t: T[lang], lang, setLang }}>
        <div className={"min-h-screen bg-[#07080b] text-[#eef0f5] font-['Inter_Tight',sans-serif]"}>
          <Header />
          <main>
            <Film />
            <Work />
            <More />
            <Decks />
            <Bots />
            <Pricing />
            <Process />
            <Why />
            <CvTeaser />
            <Contact />
          </main>
          <Footer />
          <FloatTg />
        </div>
      </L.Provider>
    </MotionConfig>
  )
}

createRoot(document.getElementById('root')).render(<App />)
