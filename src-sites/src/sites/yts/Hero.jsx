import React, { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { useLang } from './i18n'
import { T, PERSON } from './data'

/* HERO v8 — "like deltacafes.com": one full-bleed filmed loop, a giant condensed name bottom-left,
   a two-part pill CTA and a row of three numbered teasers. Pure DOM, no WebGL.
   Shared bits exported for other sections: DISPLAY (font class), Clip (lazy video w/ still fallback), Pill. */

export const DISPLAY = "font-['Oswald',sans-serif]"
const E = [0.22, 1, 0.36, 1]

/* ---------- Clip: autoplay muted loop video with a still fallback ----------
   /portfolio/yts/video/<name>-1080.mp4 (desktop) · -720.mp4 (≤768px) · <name>.jpg poster.
   The still (`still`) is always underneath with a slow CSS push-in; the video fades in only once it is
   actually playing, so a missing file simply leaves the still. Plays only while on screen. */
const V = '/portfolio/yts/video/'
export function Clip({ name, still, pos = '50% 50%', className = '', eager = false, push = true }) {
  const box = useRef(null), vid = useRef(null)
  const reduce = useReducedMotion()
  const [src, setSrc] = useState(null)
  const [on, setOn] = useState(false)
  useEffect(() => {
    if (reduce) return
    const el = box.current
    const pick = () => setSrc(`${V}${name}-${window.innerWidth <= 768 ? 720 : 1080}.mp4`)
    if (eager) { pick(); return }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { pick(); io.disconnect() } }, { rootMargin: '60% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [name, reduce, eager])
  useEffect(() => {
    const v = vid.current, el = box.current
    if (!v || !src) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) v.play().catch(() => {}); else v.pause() }, { threshold: 0.01 })
    io.observe(el)
    return () => io.disconnect()
  }, [src])
  return (
    <div ref={box} aria-hidden className={`absolute inset-0 overflow-hidden ${className}`}>
      <img src={still} alt="" decoding="async" fetchpriority={eager ? 'high' : undefined} loading={eager ? 'eager' : 'lazy'} draggable={false}
        className={`yts-grade absolute inset-0 h-full w-full select-none object-cover ${push && !reduce ? 'yts-push' : ''}`} style={{ objectPosition: pos }} />
      {src && (
        <video ref={vid} key={src} src={src} poster={`${V}${name}.jpg`} muted playsInline loop autoPlay preload="metadata" disablePictureInPicture
          onPlaying={() => setOn(true)} onError={() => setOn(false)}
          className="yts-grade absolute inset-0 h-full w-full object-cover transition-opacity duration-[1400ms]" style={{ opacity: on ? 1 : 0, objectPosition: pos }} />
      )}
    </div>
  )
}

/* Delta's two-part pill: a light label capsule + a separate dark circle with an arrow */
export function Pill({ href, children, dark = false, className = '' }) {
  return (
    <a href={href} className={`${T.sans} group inline-flex h-12 items-center ${className}`}>
      <span className={`inline-flex h-full items-center rounded-full px-6 text-[13.5px] font-medium tracking-[.01em] transition-colors duration-500 ${dark ? 'bg-[#2a1a12] text-[#efe0cc] group-hover:bg-[#3a2418]' : 'bg-[#efe0cc] text-[#2a1a12] group-hover:bg-white'}`}>{children}</span>
      <span className={`grid h-12 w-12 place-items-center rounded-full transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:translate-x-1 ${dark ? 'bg-[#efe0cc] text-[#2a1a12]' : 'bg-[#4a2f22] text-[#efe0cc]'}`}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M1 7h12M8 2l5 5-5 5" /></svg>
      </span>
    </a>
  )
}

const S = {
  kick: { en: 'Architecture & development · Israel — Italy', it: 'Architettura e sviluppo · Israele — Italia' },
  kickM: { en: 'Architects · Israel — Italy', it: 'Architetti · Israele — Italia' },
  lead: { en: 'Commercial, public and residential architecture — and residences on Lake Como and in Volterra.', it: 'Architettura commerciale, pubblica e residenziale — e residenze sul Lago di Como e a Volterra.' },
  cta: { en: 'Explore residences', it: 'Scopri le residenze' },
  film: { en: 'Il Giardino di Teodolinda · Lake Como', it: 'Il Giardino di Teodolinda · Lago di Como' },
}

const TEASE = [
  { href: '#como', id: 5, pos: '50% 60%', t: { en: ['Il Giardino di Teodolinda,', 'Lake Como.'], it: ['Il Giardino di Teodolinda,', 'Lago di Como.'] } },
  { href: '#palazzo', id: 145, pos: '50% 50%', t: { en: ['Palazzo Campani,', 'Volterra.'], it: ['Palazzo Campani,', 'Volterra.'] } },
  { href: '#works', id: 40, pos: '50% 40%', t: { en: ['Selected works,', 'Israel — Italy.'], it: ['Progetti scelti,', 'Israele — Italia.'] } },
]

function Rise({ children, d = 0, className = '' }) {
  return (
    <span className="block overflow-hidden pb-[.04em]">
      <motion.span className={`block ${className}`} initial={{ y: '106%' }} animate={{ y: '0%' }} transition={{ duration: 1.6, ease: E, delay: d }}>{children}</motion.span>
    </span>
  )
}
const Fade = ({ children, d = 0, className = '' }) => (
  <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.4, ease: E, delay: d }} className={className}>{children}</motion.div>
)

function Teaser({ x, i }) {
  const { t } = useLang()
  const [a, b] = t(x.t)
  return (
    <a href={x.href} className={`${T.sans} group flex min-w-[232px] shrink-0 snap-start items-start gap-3.5 border-t border-[#efe0cc]/30 pt-4 md:min-w-0 md:flex-1`}>
      <span className="relative block h-[58px] w-[92px] shrink-0 overflow-hidden rounded-[3px] bg-[#1a120d] md:h-[62px] md:w-[102px]">
        <img src={`/portfolio/yts/img/${x.id}-s.webp`} alt="" loading="lazy" decoding="async" className="yts-grade h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-110" style={{ objectPosition: x.pos }} />
      </span>
      <span className="block text-[13px] leading-[1.3] text-[#efe0cc]/90">
        <span className="mb-2.5 block text-[11px] tabular-nums tracking-[.12em] text-[#efe0cc]/60">0{i + 1}</span>
        <span className="block transition-colors group-hover:text-white">{a}</span>
        <span className="block text-[#efe0cc]/65">{b}</span>
      </span>
    </a>
  )
}

export default function Hero() {
  const { t, lang } = useLang()
  const ref = useRef()
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '18%'])
  const sc = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 1.08])
  const textY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -90])
  const textO = useTransform(scrollYProgress, [0, 0.55], [1, reduce ? 1 : 0])

  return (
    <section id="hero" ref={ref} className="relative h-[100svh] min-h-[600px] overflow-hidden bg-[#1a120d]">
      <motion.div className="absolute inset-0 will-change-transform" style={{ y, scale: sc }}>
        <Clip name="como" still="/portfolio/yts/img/5-xl.webp" pos="50% 58%" eager />
        {/* Delta-like warm grade: soft vignette, bottom fades into the espresso Story chapter */}
        <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_70%_30%,transparent_30%,rgba(26,14,8,.55)_100%)]" />
        <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-black/55 to-transparent" />
      </motion.div>
      {/* static (not inside the moving layer) so the hand-off to the espresso Story chapter never shows an edge */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/45 via-black/10 to-transparent max-md:hidden" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[72%] bg-gradient-to-t from-[#1e130d] via-[#1e130d]/65 to-transparent md:h-[64%]" />

      <motion.div style={{ y: textY, opacity: textO }} className="absolute inset-x-0 bottom-0 z-10">
        <div className="mx-auto max-w-[1440px] px-5 pb-[max(22px,calc(env(safe-area-inset-bottom)+14px))] md:px-10 md:pb-9">
          <Fade d={.25} className={`${T.sans} mb-3 flex items-center gap-3 text-[10.5px] font-semibold uppercase tracking-[.22em] text-[#efe0cc]/90 [text-shadow:0_1px_12px_rgba(0,0,0,.6)] md:mb-4 md:text-[11px] md:tracking-[.3em]`}>
            <span className="h-px w-8 shrink-0 bg-[#c3a15e]" /><span className="md:hidden">{t(S.kickM)}</span><span className="max-md:hidden">{t(S.kick)}</span>
          </Fade>
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between md:gap-10">
            <h1 key={lang} className={`${DISPLAY} font-[600] uppercase leading-[.84] tracking-[-.01em] text-[#f2e6d4] text-[clamp(82px,25.5vw,132px)] md:text-[clamp(120px,14.2vw,236px)]`}>
              <Rise d={.1}>Yehiel</Rise>
              <Rise d={.22}>Tsubery</Rise>
            </h1>
            <Fade d={.7} className="md:mb-4 md:max-w-[360px]">
              <p className={`${T.serif} text-[19px] italic leading-[1.3] text-[#efe0cc]/85 md:text-[22px]`}>{t(S.lead)}</p>
              <Pill href="#como" className="mt-5">{t(S.cta)}</Pill>
            </Fade>
          </div>
          <Fade d={1} className="mt-6 md:mt-9">
            <div className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-1 [scrollbar-width:none] md:mx-0 md:gap-6 md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden">
              {TEASE.map((x, i) => <Teaser key={x.href} x={x} i={i} />)}
              <div className={`${T.sans} hidden flex-1 items-start justify-end border-t border-[#efe0cc]/30 pt-4 text-right text-[11px] uppercase tracking-[.24em] text-[#efe0cc]/55 lg:flex`}>
                <span><span className="block text-[#c3a15e]">{t(PERSON.motto)}</span><span className="mt-2 block">{t(S.film)}</span></span>
              </div>
            </div>
          </Fade>
        </div>
      </motion.div>
    </section>
  )
}
