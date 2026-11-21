import React, { useRef } from 'react'
import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion'
import { useLang } from './i18n'
import { T, PERSON, COMPANIES, CLUB, img } from './data'

/* v3 Founder — pure DOM: portrait with CSS reveal + pointer tilt, timeline, ochre motto band, YTS Group, club line. */
const EASE = [0.16, 1, 0.3, 1]
const pad = n => String(n).padStart(2, '0')

const TIMELINE = [
  { y: '2008', a: 'Politecnico di Milano', b: { en: 'Architecture', it: 'Architettura' } },
  { y: '2010', a: 'Technion', b: { en: 'Project management — Israel Institute of Technology', it: 'Project management — Israel Institute of Technology' } },
  { y: String(PERSON.studioSince), a: 'YTS Architects', b: { en: 'Own studio — Ramat Gan', it: 'Studio proprio — Ramat Gan' } },
]

const GROUP = [
  { k: { en: 'Architecture', it: 'Architettura' }, d: { en: 'Design studio', it: 'Studio di progettazione' }, c: [COMPANIES[0]] },
  { k: { en: 'Holdings', it: 'Holding' }, d: { en: 'Italy', it: 'Italia' }, c: [COMPANIES[1], COMPANIES[2]] },
  { k: { en: 'Project companies', it: 'Società di progetto' }, d: { en: 'One per development', it: 'Una per ogni sviluppo' }, c: COMPANIES.slice(3) },
]

function Eyebrow({ children, className = '' }) {
  return <div className={`flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[.28em] ${className}`}><span className="h-px w-8 bg-[#c3a15e]" />{children}</div>
}

function Reveal({ children, delay = 0, className = '' }) {
  return (
    <span className={`block overflow-hidden pb-[.14em] -mb-[.08em] ${className}`}>
      <motion.span className="block" initial={{ y: '105%' }} whileInView={{ y: 0 }} viewport={{ once: true, margin: '-8%' }} transition={{ duration: 1.1, ease: EASE, delay }}>{children}</motion.span>
    </span>
  )
}

function Portrait() {
  const { t } = useLang()
  const mx = useMotionValue(0), my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 120, damping: 18, mass: 0.4 }), sy = useSpring(my, { stiffness: 120, damping: 18, mass: 0.4 })
  const rY = useTransform(sx, v => v * 7), rX = useTransform(sy, v => -v * 6)
  const ix = useTransform(sx, v => v * -18), iy = useTransform(sy, v => v * -14)
  const gx = useTransform(sx, v => `${50 + v * 30}%`)
  const move = e => {
    if (e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width - 0.5); my.set((e.clientY - r.top) / r.height - 0.5)
  }
  const leave = () => { mx.set(0); my.set(0) }
  return (
    <div onPointerMove={move} onPointerLeave={leave} className="relative mx-auto w-full max-w-[520px] [perspective:1100px]">
      <motion.div style={{ rotateX: rX, rotateY: rY }} className="relative [transform-style:preserve-3d]">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[6px] bg-[#14120f]">
          <motion.img src={img(126)} alt={t({ en: 'Yehiel Tsubery, architect', it: 'Yehiel Tsubery, architetto' })} loading="lazy" decoding="async" width="900" height="1125"
            initial={{ scale: 1.18 }} whileInView={{ scale: 1.04 }} viewport={{ once: true, margin: '-10%' }} transition={{ duration: 1.8, ease: EASE }}
            className="yts-grade h-full w-full object-cover object-[50%_40%]" />
          {/* ink shutter lifts to reveal */}
          <motion.div aria-hidden initial={{ scaleY: 1 }} whileInView={{ scaleY: 0 }} viewport={{ once: true, margin: '-10%' }} transition={{ duration: 1.3, ease: EASE }}
            className="absolute inset-0 origin-top bg-[#0b0a08]" />
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0b0a08]/75 via-transparent to-transparent" />
          <motion.div aria-hidden style={{ left: gx }} className="pointer-events-none absolute top-0 h-full w-[60%] -translate-x-1/2 bg-[radial-gradient(closest-side,rgba(217,191,134,.14),transparent)] mix-blend-screen" />
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-[11px] font-semibold uppercase tracking-[.2em] text-[#efe8dc]/75">
            <span>Ramat Gan · Milano</span><span className="tabular-nums">YTS</span>
          </div>
        </div>
        {/* b/w inset floats on its own depth */}
        <motion.div style={{ x: ix, y: iy, z: 60 }} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1.2, ease: EASE, delay: 0.5 }}
          className="absolute -bottom-8 right-2 w-[34%] overflow-hidden rounded-[4px] shadow-[0_30px_60px_-20px_rgba(0,0,0,.8)] ring-4 ring-[#0b0a08] md:-right-10">
          <img src={img(1, true)} alt="" loading="lazy" decoding="async" width="480" height="720" className="aspect-[2/3] w-full object-cover grayscale" />
        </motion.div>
      </motion.div>
    </div>
  )
}

function Timeline() {
  const { t } = useLang()
  return (
    <ol className="relative mt-10 grid grid-cols-3 gap-4 pt-7 md:gap-8">
      <motion.span aria-hidden initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1.6, ease: EASE }}
        className="absolute left-0 right-0 top-0 h-px origin-left bg-[rgba(239,232,220,.16)]" />
      {TIMELINE.map((r, i) => (
        <motion.li key={r.y} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: EASE, delay: 0.2 + i * 0.15 }} className="relative">
          <span aria-hidden className="absolute -top-[31px] left-0 h-[7px] w-[7px] rounded-full bg-[#c3a15e]" />
          <div className={`${T.serif} text-[34px] tabular-nums leading-none text-[#d9bf86] md:text-[46px]`}>{r.y}</div>
          <div className={`${T.serif} mt-2 text-[18px] leading-[1.1] md:text-[22px]`}>{r.a}</div>
          <div className="mt-1 text-[13px] leading-snug text-[#efe8dc]/55">{t(r.b)}</div>
        </motion.li>
      ))}
    </ol>
  )
}

function MottoBand() {
  const { t } = useLang()
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const a = useTransform(scrollYProgress, [0, 1], ['10%', '-8%'])
  const b = useTransform(scrollYProgress, [0, 1], ['-10%', '8%'])
  const [w1, ...rest] = t(PERSON.motto).split(' ')
  return (
    <div ref={ref} className="relative overflow-hidden border-y border-[rgba(195,161,94,.22)] bg-[#3a2412] py-8 text-[#efe8dc] md:py-10">
      <div className="flex flex-col items-center justify-center whitespace-nowrap text-[15vw] leading-[.9] md:flex-row md:gap-[.25em] md:text-[9vw] 2xl:text-[132px]">
        <motion.span style={{ x: a }} className="font-black uppercase tracking-[-.04em] text-[#efe8dc]/90">{w1}</motion.span>
        <motion.span style={{ x: b }} className={`${T.serif} italic text-[#d9bf86]`}>{rest.join(' ')}.</motion.span>
      </div>
      <div className="mx-auto mt-3 flex max-w-[1440px] justify-between px-5 text-[11px] font-semibold uppercase tracking-[.28em] text-[#efe8dc]/55 md:px-10">
        <span>{t({ en: 'The studio motto', it: 'Il motto dello studio' })}</span><span>YTS</span>
      </div>
    </div>
  )
}

function Group() {
  const { t } = useLang()
  return (
    <div className="mx-auto max-w-[1440px] px-5 pt-20 md:px-10 md:pt-24">
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Eyebrow className="text-[#c3a15e]">YTS Group</Eyebrow>
          <h3 className={`${T.serif} mt-4 text-[40px] leading-[.95] md:text-[54px]`}>
            <Reveal>{t({ en: 'One studio,', it: 'Uno studio,' })}</Reveal>
            <Reveal delay={0.1}><em className="text-[#d9bf86]">{t({ en: 'eight companies.', it: 'otto società.' })}</em></Reveal>
          </h3>
          <p className="mt-4 max-w-[34ch] text-[14px] leading-relaxed text-[#efe8dc]/60">{t({ en: 'Design in Israel, development in Italy — each residence carried by its own project company.', it: 'Progettazione in Israele, sviluppo in Italia — ogni residenza affidata alla propria società di progetto.' })}</p>
        </div>
        <div className="grid gap-px overflow-hidden rounded-[6px] bg-[rgba(239,232,220,.12)] sm:grid-cols-3 lg:col-span-8">
          {GROUP.map((g, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-8%' }} transition={{ duration: 0.9, ease: EASE, delay: i * 0.1 }}
              className="bg-[#14120f] p-6 md:p-7">
              <div className="flex items-baseline justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-[.26em] text-[#d9bf86]">{t(g.k)}</span>
                <span className="text-[11px] tabular-nums text-[#efe8dc]/35">{pad(g.c.length)}</span>
              </div>
              <div className="mt-1 text-[12px] text-[#efe8dc]/45">{t(g.d)}</div>
              <ul className="mt-5 space-y-2.5">
                {g.c.map(c => (
                  <li key={c} className={`${T.serif} group flex items-baseline gap-2 text-[20px] leading-[1.1] md:text-[22px]`}>
                    <span className="h-px w-3 shrink-0 translate-y-[-5px] bg-[rgba(239,232,220,.3)] transition-all duration-500 group-hover:w-6 group-hover:bg-[#c3a15e]" />{c}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Club() {
  const { t } = useLang()
  const ask = () => window.dispatchEvent(new CustomEvent('yts:interest', { detail: 'club' }))
  return (
    <div id="club" className="mx-auto max-w-[1440px] px-5 pt-16 md:px-10 md:pt-20">
      <div className="border-t border-[rgba(239,232,220,.12)] pt-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Eyebrow className="text-[#c3a15e]">{t({ en: 'Club & events', it: 'Club ed eventi' })}</Eyebrow>
            <p className={`${T.serif} mt-3 max-w-[44ch] text-[24px] leading-[1.15] md:text-[28px]`}>{t(CLUB.lead)}</p>
          </div>
          <a href="#contact" onClick={ask} className="inline-flex h-12 shrink-0 items-center gap-3 self-start rounded-full border border-[#c3a15e]/60 px-6 text-[11px] font-semibold uppercase tracking-[.2em] transition-colors duration-500 hover:bg-[#c3a15e] hover:text-[#0b0a08] lg:self-auto">
            {t({ en: 'Ask about the club', it: 'Informazioni sul club' })}
            <svg width="14" height="14" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 9h13M10 4l5 5-5 5" /></svg>
          </a>
        </div>
        <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 md:grid-cols-4">
          {CLUB.items.map((it, i) => (
            <motion.li key={i} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: EASE, delay: i * 0.08 }}
              className="group border-l border-[rgba(239,232,220,.12)] pl-4 transition-colors hover:border-[#c3a15e]">
              <div className="text-[11px] tabular-nums text-[#efe8dc]/40">{pad(i + 1)}</div>
              <div className={`${T.serif} mt-1 text-[22px] leading-[1.05] transition-transform duration-500 group-hover:translate-x-1 md:text-[26px]`}>{t(it.t)}</div>
              <div className="mt-1 text-[11px] font-semibold uppercase tracking-[.18em] text-[#c3a15e]">{t(it.p)}</div>
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default function Founder() {
  const { t } = useLang()
  return (
    <section id="founder" className={`relative overflow-hidden border-t border-[rgba(239,232,220,.08)] bg-[#0b0a08] pb-20 text-[#efe8dc] md:pb-28 ${T.sans}`}>
      <div className="mx-auto grid max-w-[1440px] items-center gap-14 px-5 py-20 md:px-10 md:py-28 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5"><Portrait /></div>
        <div className="lg:col-span-6 lg:col-start-7">
          <Eyebrow className="text-[#c3a15e]">{t({ en: '05 — Founder', it: '05 — Fondatore' })}</Eyebrow>
          <h2 className={`${T.serif} mt-5 text-[17vw] leading-[.86] tracking-[-.02em] md:text-[8vw] 2xl:text-[116px]`}>
            <Reveal>Yehiel</Reveal>
            <Reveal delay={0.1}><em className="text-[#d9bf86]">Tsubery</em></Reveal>
          </h2>
          <div className="mt-4 text-[12px] font-semibold uppercase tracking-[.22em] text-[#efe8dc]/60">{t(PERSON.role)}</div>
          <p className="mt-6 max-w-[46ch] text-[16px] leading-relaxed text-[#efe8dc]/75">{t({ en: 'Trained in Milan and at the Technion, he has led his own studio in Ramat Gan since 2012 — commercial, public and residential work — and, through YTS Group, develops residences in Italy.', it: 'Formato a Milano e al Technion, dal 2012 guida il proprio studio a Ramat Gan — progetti commerciali, pubblici e residenziali — e, con YTS Group, sviluppa residenze in Italia.' })}</p>
          <Timeline />
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-[rgba(239,232,220,.12)] pt-6">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[.2em] text-[#efe8dc]/45">{t({ en: 'Studio', it: 'Studio' })}</div>
              <div className={`${T.serif} mt-1 text-[22px]`}>Ramat Gan, {t({ en: 'Israel', it: 'Israele' })}</div>
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[.2em] text-[#efe8dc]/45">{t({ en: 'Works in', it: 'Lavora in' })}</div>
              <div className="mt-2 flex gap-2">
                {PERSON.tech.map(x => <span key={x} className="rounded-full border border-[#c3a15e]/50 px-3 py-1 text-[12px] font-bold tracking-[.12em] text-[#d9bf86]">{x}</span>)}
              </div>
            </div>
          </div>
        </div>
      </div>
      <MottoBand />
      <Group />
      <Club />
    </section>
  )
}
