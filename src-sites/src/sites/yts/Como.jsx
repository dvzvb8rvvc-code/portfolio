import React, { useRef } from 'react'
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from 'framer-motion'
import { useLang } from './i18n'
import { T, COMO, img } from './data'
import { SOFT } from './motion'
import { D, S, E, Display, Eyebrow, Pill, Video, CineStyle, ask } from './cine'

/* COMO (V8) — Delta's "THE FIRST PORTUGUESE COFFEE" block: a full-bleed filmed loop of the lake,
   a giant centred condensed title, place line and a pill CTA; then an olive chapter with the facts
   strip, the every-home list and a second film card (the terraces render). DOM + <video> only. */

const OLIVE = '#1e2618'

function Hero() {
  const { t } = useLang()
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const p = useSpring(scrollYProgress, SOFT)
  const vs = useTransform(p, [0, 1], [1, 1.12])
  const ty = useTransform(p, [0, 1], ['0%', '-22%'])
  const to = useTransform(p, [0, .7], [1, 0])
  const enter = useRef(null)
  const { scrollYProgress: ep } = useScroll({ target: enter, offset: ['start end', 'start start'] })
  const eps = useSpring(ep, SOFT)
  const clip = useTransform(eps, [0, 1], ['inset(9% 7% 0% 7% round 22px)', 'inset(0% 0% 0% 0% round 0px)'])
  return (
    <div ref={enter}>
      <motion.div ref={ref} style={reduce ? undefined : { clipPath: clip }} className="relative h-[100svh] min-h-[600px] overflow-hidden">
        <motion.div style={reduce ? undefined : { scale: vs }} className="absolute inset-0">
          <Video name="lake" fallback={img(129)} alt={t({ en: 'Lake Como seen from the hillside above Varenna', it: 'Il Lago di Como visto dalla collina sopra Varenna' })} className="h-full w-full" pos="50% 55%" />
        </motion.div>
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(11,10,8,.55)_0%,rgba(11,10,8,.12)_34%,rgba(11,10,8,.2)_62%,rgba(30,38,24,.95)_100%)]" />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_45%_at_50%_52%,rgba(0,0,0,.32),transparent_75%)]" />
        <motion.div style={reduce ? undefined : { y: ty, opacity: to }} className="relative flex h-full flex-col items-center justify-center px-5 pt-16 text-center">
          <Eyebrow center tone="text-[#efe8dc]/85">{t({ en: 'YTS Group · Lake Como', it: 'YTS Group · Lago di Como' })}</Eyebrow>
          <Display center className="mt-5 text-[clamp(52px,15vw,76px)] [text-shadow:0_4px_40px_rgba(0,0,0,.35)] md:text-[clamp(84px,10.4vw,176px)]" cTone="text-[#f0d79e]"
            lines={[['IL GIARDINO'], [{ c: 'di' }, 'TEODOLINDA']]} />
          <motion.p initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1, ease: E, delay: .35 }}
            className={`${T.sans} mt-5 text-[12px] font-semibold uppercase tracking-[.26em] text-[#efe8dc]/85`}>{t(COMO.place)}</motion.p>
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1, ease: E, delay: .5 }} className="mt-8 flex flex-wrap justify-center gap-3">
            <Pill href="#como-facts">{t({ en: 'The residences', it: 'Le residenze' })}</Pill>
          </motion.div>
        </motion.div>
        <span className={`${T.sans} absolute bottom-6 left-5 text-[10.5px] font-semibold uppercase tracking-[.22em] text-[#efe8dc]/55 md:left-10`}>{t({ en: 'View from the site · Perledo', it: 'Vista dal cantiere · Perledo' })}</span>
      </motion.div>
    </div>
  )
}

function Facts() {
  const { t } = useLang()
  return (
    <dl className="grid grid-cols-2 border-t border-[#efe8dc]/15 lg:grid-cols-4">
      {COMO.facts.map((f, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 26 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-6%' }} transition={{ duration: 1, ease: E, delay: i * .08 }}
          className={`border-b border-[#efe8dc]/15 py-6 pr-4 md:py-9 ${i % 2 ? 'pl-4 md:pl-8' : ''} ${i > 0 ? 'lg:border-l lg:border-[#efe8dc]/15 lg:pl-8' : ''}`}>
          <dd className={`${D} yts-d whitespace-nowrap text-[clamp(44px,12.5vw,60px)] tabular-nums text-[#efe8dc] md:text-[clamp(64px,6vw,96px)]`}>
            {f.v}{f.u && <span className={`${S} ml-1.5 align-[.5em] text-[.32em] normal-case italic text-[#d9bf86]`}>{f.u}</span>}
          </dd>
          <dt className="mt-3 text-[13px] leading-snug text-[#efe8dc]/65 md:text-[14px]">{t(f.l)}</dt>
        </motion.div>
      ))}
    </dl>
  )
}

function Every() {
  const { t } = useLang()
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[.28em] text-[#c3a15e]">{t({ en: 'Every home includes', it: 'Ogni casa comprende' })}</p>
      <ul className="mt-4">
        {t(COMO.every).map((x, i) => (
          <motion.li key={i} initial={{ opacity: 0, x: -14 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: .8, ease: E, delay: i * .06 }}
            className="group flex items-baseline gap-4 border-b border-[#efe8dc]/12 py-3.5">
            <span className="w-6 shrink-0 text-[11px] font-semibold tabular-nums text-[#c3a15e]/80">0{i + 1}</span>
            <span className={`${S} text-[21px] leading-[1.15] transition-transform duration-500 group-hover:translate-x-1 md:text-[24px]`}>{x}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  )
}

function FilmCard() {
  const { t } = useLang()
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['-6%', '6%'])
  const reduce = useReducedMotion()
  return (
    <figure ref={ref} className="relative">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[14px] md:aspect-[16/11]">
        <motion.div style={reduce ? undefined : { y, scale: 1.14 }} className="absolute inset-0">
          <Video name="como" fallback={img(5)} alt={t({ en: 'Render — terraced homes stepping down the hillside', it: 'Render — case a terrazze lungo la collina' })} className="h-full w-full" pos="50% 40%" />
        </motion.div>
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
        <figcaption className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4 md:inset-x-7 md:bottom-6">
          <span className={`${D} yts-d text-[34px] md:text-[48px]`}>{t({ en: 'Terraces', it: 'Terrazze' })} <span className={`${S} text-[.5em] normal-case italic text-[#f0d79e]`}>{t({ en: 'facing the lake', it: 'sul lago' })}</span></span>
          <span className="shrink-0 text-[10.5px] font-semibold uppercase tracking-[.2em] text-[#efe8dc]/70">Render</span>
        </figcaption>
      </div>
    </figure>
  )
}

export default function Como() {
  const { t } = useLang()
  return (
    <section id="como" className={`relative isolate overflow-x-clip text-[#efe8dc] ${T.sans}`} style={{ background: OLIVE }} aria-label={COMO.name}>
      <CineStyle />
      <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-[30vh] bg-[#0b0a08]" />
      <Hero />
      <div id="como-facts" className="relative mx-auto max-w-[1440px] scroll-mt-20 px-5 pb-20 pt-14 md:px-10 md:pb-28 md:pt-20">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <p className={`${S} text-[27px] leading-[1.14] md:text-[38px] lg:col-span-8`}>{t(COMO.lead)}</p>
          <p className="max-w-[40ch] text-[14.5px] leading-relaxed text-[#efe8dc]/65 lg:col-span-4">{t(COMO.views)}</p>
        </div>
        <div className="mt-10 md:mt-14"><Facts /></div>
        <div className="mt-14 grid gap-12 md:mt-20 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7"><FilmCard /></div>
          <div className="flex flex-col justify-between gap-10 lg:col-span-5">
            <Every />
            <div>
              <p className="max-w-[44ch] text-[14.5px] leading-relaxed text-[#efe8dc]/65">{t(COMO.model)}</p>
              <p className="mt-3 max-w-[44ch] text-[13px] leading-relaxed text-[#efe8dc]/50">{t(COMO.phasesNote)}</p>
              <div className="mt-6"><Pill href="#contact" onClick={() => ask('como')}>{t({ en: 'Ask about a home', it: 'Chiedi di una casa' })}</Pill></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
