import React, { useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { useIsMobile } from '../../lib/kit'
import { useLang } from './i18n'
import { T, PERSON } from './data'
import { MaskLine } from './motion'
import { DISPLAY, Pill } from './Hero'

/* STORY v8 — Delta's "SINCE 1961, COFFEE that AWAKENS STORIES": a centred giant condensed statement
   with his own archive (sketches, building sites, portrait, renders) scattered around like prints,
   each drifting at its own scroll speed. Transform-only. */

const S = {
  l1: { en: 'Since 2012,', it: 'Dal 2012,' },
  l2a: { en: 'Architecture', it: 'Architettura' }, that: { en: 'that', it: 'che' },
  l3: { en: 'shapes places', it: 'crea luoghi' },
  body: {
    en: 'Founded by architect Yehiel Tsubery — Politecnico di Milano, Technion — YTS designs commercial, public and residential architecture between Israel and Italy, from the first sketch to the finished interior.',
    it: 'Fondato dall’architetto Yehiel Tsubery — Politecnico di Milano, Technion — YTS progetta architetture commerciali, pubbliche e residenziali tra Israele e Italia, dal primo schizzo all’interno finito.',
  },
  cta: { en: 'The studio', it: 'Lo studio' },
}

const C = {
  sketch: { en: 'Sketch · Lake Como', it: 'Schizzo · Lago di Como' },
  sketch2: { en: 'Hand sketch', it: 'Schizzo a mano' },
  site: { en: 'Building site · Lake Como', it: 'Cantiere · Lago di Como' },
  render: { en: 'Render · Lake Como', it: 'Render · Lago di Como' },
  render2: { en: 'Studio work · Render', it: 'Progetto dello studio · Render' },
  me: { en: 'Yehiel Tsubery', it: 'Yehiel Tsubery' },
}

/* d = desktop [left %, top %, width vw] · m = mobile [left %, top %, width vw] (null = hidden) · r = rotation · s = drift speed */
const PRINTS = [
  { id: 30, ar: 3508 / 4960, d: [4, 6, 13], m: [-5, 1.5, 34], r: -6, s: 1.25, c: C.sketch },
  { id: 5, ar: 0.8, d: [34, 1, 10.5], m: [31, 9, 30], r: 2.5, s: 0.7, c: C.render },
  { id: 1, ar: 2 / 3, d: [80, 3, 12], m: [66, 0, 32], r: 4, s: 0.55, c: C.me },
  { id: 39, ar: 3508 / 4960, d: [8, 37, 9], m: [-7, 18, 27], r: 3, s: 0.45, c: C.sketch2 },
  { id: 134, ar: 1600 / 747, d: [82, 36, 14], m: [64, 19, 36], r: -4, s: 1.05, c: C.site },
  { id: 130, ar: 1600 / 747, d: [2, 64, 17], m: [-6, 74, 44], r: 5, s: 0.9, c: C.site },
  { id: 104, ar: 4 / 3, d: [68, 62, 18], m: [46, 71, 50], r: -3, s: 1.5, c: C.site },
  { id: 86, ar: 1393 / 1200, d: [24, 80, 11], m: [6, 87, 34], r: -7, s: 1.8, c: C.sketch2 },
  { id: 40, ar: 1446 / 1459, d: [42, 87, 10], m: null, r: 3, s: 1.1, c: C.render2 },
  { id: 85, ar: 3662 / 5177, d: [56, 83, 9.5], m: [62, 85, 30], r: 6, s: 1.3, c: C.sketch },
]

function Print({ x, p, mob, i }) {
  const { t } = useLang()
  const reduce = useReducedMotion()
  const k = mob ? 120 : 280
  const y = useTransform(p, [0, 1], [x.s * k * 0.5, -x.s * k * 0.5])
  const rot = useTransform(p, [0, 1], [x.r - x.s * 2, x.r + x.s * 2])
  const pos = mob ? x.m : x.d
  if (!pos) return null
  const [l, top, w] = pos
  return (
    <motion.figure
      initial={{ opacity: 0, scale: .92 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: (i % 4) * .08 }}
      className="absolute z-0" style={{ left: `${l}%`, top: `${top}%`, width: `${w}vw` }}>
      <motion.div style={reduce ? { rotate: x.r } : { y, rotate: rot }} className="will-change-transform">
        <div className="group bg-[#efe6d6] p-[5px] pb-0 shadow-[0_28px_50px_-18px_rgba(0,0,0,.75)] transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-1.5 md:p-[7px] md:pb-0">
          <div className="overflow-hidden bg-[#d9d0c0]" style={{ aspectRatio: x.ar }}>
            <img src={`/portfolio/yts/img/${x.id}-s.webp`} alt={t(x.c)} loading="lazy" decoding="async" draggable={false}
              className="h-full w-full select-none object-cover [filter:sepia(.18)_saturate(.85)_contrast(1.03)]" />
          </div>
          <figcaption className={`${T.serif} truncate py-[5px] text-[10.5px] italic leading-none text-[#3a2a1e]/75 md:py-2 md:text-[13px]`}>{t(x.c)}</figcaption>
        </div>
      </motion.div>
    </motion.figure>
  )
}

export default function Story() {
  const { t, lang } = useLang()
  const ref = useRef(null)
  const mob = useIsMobile()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  return (
    <section id="story" ref={ref}
      className="relative isolate overflow-hidden bg-[#1e130d] text-[#f2e6d4]">
      {/* warm espresso chapter with a soft glow; Delta's thin arc behind the title */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_50%,rgba(90,52,30,.55),transparent_75%)]" />
      <svg aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[150vw] w-[150vw] -translate-x-1/2 -translate-y-[38%] md:h-[110vw] md:w-[110vw]" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="49.8" fill="none" stroke="#c3a15e" strokeOpacity=".16" strokeWidth=".08" />
        <circle cx="50" cy="50" r="38" fill="none" stroke="#efe0cc" strokeOpacity=".06" strokeWidth=".06" />
      </svg>

      <div className="relative min-h-[232svh] md:min-h-[175vh]">
        {PRINTS.map((x, i) => <Print key={x.id} x={x} p={scrollYProgress} mob={mob} i={i} />)}

        <div className="pointer-events-none absolute inset-x-0 top-[31%] z-10 px-5 text-center md:top-[31%]">
          <h2 key={lang} className={`${DISPLAY} mx-auto font-[600] uppercase leading-[.86] tracking-[-.005em] text-[#f2e6d4] text-[clamp(46px,13.4vw,78px)] md:text-[clamp(84px,9vw,156px)]`}>
            <MaskLine>{t(S.l1)}</MaskLine>
            <MaskLine i={1}>{t(S.l2a)}</MaskLine>
            <MaskLine i={2}><span className={`${T.serif} mr-[.16em] align-[.12em] text-[.42em] font-normal normal-case italic tracking-normal text-[#d9bf86]`}>{t(S.that)}</span>{t(S.l3)}</MaskLine>
          </h2>
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: .3 }}
            className="pointer-events-auto mx-auto mt-8 flex max-w-[520px] flex-col items-center md:mt-10">
            <Pill href="#studio">{t(S.cta)}</Pill>
            <p className={`${T.sans} mt-7 max-w-[44ch] text-[15px] leading-[1.6] text-[#efe0cc]/70 md:text-[16px]`}>{t(S.body)}</p>
            <p className={`${T.sans} mt-4 text-[11px] font-semibold uppercase tracking-[.28em] text-[#c3a15e]`}>{t(PERSON.office)} · {t({ en: 'Italia', it: 'Italia' })}</p>
          </motion.div>
        </div>
      </div>
      {/* bottom: melt into the Journey film */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[18vh] bg-gradient-to-b from-transparent to-[#140d09]" />
    </section>
  )
}
