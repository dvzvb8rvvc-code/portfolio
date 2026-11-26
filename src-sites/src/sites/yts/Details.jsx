import React, { useRef } from 'react'
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from 'framer-motion'
import { useLang } from './i18n'
import { T, img } from './data'
import { SOFT } from './motion'
import { D, S, E, Display, CineStyle } from './cine'

/* DETAILS (V8) — Spyker-style detail chapters on the one light (warm sand) ground of the page.
   Three alternating rows: a tight close-up crop of his own render/photo that slowly zooms with the
   scroll, an outlined gold numeral, a short honest caption of what is VISIBLE, and a small context
   thumbnail with a gold frame marking where the crop comes from. No engineering claims. */

const SAND = '#e9dfcf', INK = '#1a1410'

// crop = transform-origin (ox, oy in %) + zoom s; the context frame is computed from the same numbers
const ROWS = [
  {
    id: 5, ox: 40, oy: 62, s: 2.3,
    t: { en: ['TERRACES', { c: 'that' }, 'STEP'], it: ['TERRAZZE', { c: 'che' }, 'SCENDONO'] },
    t2: { en: ['WITH THE HILLSIDE'], it: ['CON LA COLLINA'] },
    d: { en: 'Each home sits on its own level of the slope: planted edges, an open deck, and the next roof becoming the garden below.', it: 'Ogni casa occupa il proprio livello del pendio: bordi piantumati, una terrazza aperta e il tetto vicino che diventa giardino.' },
    cap: { en: 'Render · Il Giardino di Teodolinda', it: 'Render · Il Giardino di Teodolinda' },
  },
  {
    id: 78, ox: 58, oy: 46, s: 2.5,
    t: { en: ['CURVED', 'BALCONIES'], it: ['BALCONI', 'CURVI'] },
    t2: { en: [{ c: 'in' }, 'ONE CONTINUOUS LINE'], it: [{ c: 'in' }, 'UNA LINEA CONTINUA'] },
    d: { en: 'White balcony bands wrap the corner in soft curves, floor after floor — the facade reads as layered horizontal lines rather than a wall.', it: 'Fasce bianche di balconi avvolgono l’angolo con curve morbide, piano dopo piano — la facciata si legge come linee orizzontali, non come un muro.' },
    cap: { en: 'Render · studio work', it: 'Render · lavoro dello studio' },
  },
  {
    id: 154, xl: true, ox: 50, oy: 40, s: 2.1, inset: 144,
    t: { en: ['FRESCOES'], it: ['AFFRESCHI'] },
    t2: { en: [{ c: 'kept' }, 'IN PLACE'], it: [{ c: 'rimasti' }, 'AL LORO POSTO'] },
    d: { en: 'In Palazzo Campani the painted ceilings, vaults and alabaster are part of the residences themselves — the rooms are lived in around them.', it: 'A Palazzo Campani soffitti dipinti, volte e alabastro fanno parte delle residenze stesse — le stanze si abitano intorno a loro.' },
    cap: { en: 'Photo · Palazzo Campani, Volterra', it: 'Foto · Palazzo Campani, Volterra' },
  },
]

function Crop({ r, alt }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const p = useSpring(scrollYProgress, SOFT)
  const sc = useTransform(p, [0, 1], [r.s * 1.16, r.s * .96])
  const src = r.xl ? `/portfolio/yts/img/${r.id}-xl.webp` : img(r.id)
  return (
    <div ref={ref} className="relative aspect-[4/5] overflow-hidden rounded-[6px] bg-[#d8ccb7]">
      <motion.img src={src} alt={alt} loading="lazy" decoding="async" draggable={false}
        style={{ scale: reduce ? r.s : sc, transformOrigin: `${r.ox}% ${r.oy}%` }}
        className="yts-grade absolute inset-0 h-full w-full object-cover will-change-transform" />
      <div aria-hidden className="pointer-events-none absolute inset-0 shadow-[inset_0_0_80px_rgba(26,20,16,.25)]" />
    </div>
  )
}

/* the whole frame, with a gold rectangle where the close-up was cut from */
function Context({ r, cap }) {
  const k = 1 / r.s
  const box = { left: `${r.ox * (1 - k)}%`, top: `${r.oy * (1 - k)}%`, width: `${k * 100}%`, height: `${k * 100}%` }
  return (
    <figure className="w-[132px] md:w-[150px]">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[4px] bg-[#d8ccb7]">
        <img src={img(r.id, true)} alt="" loading="lazy" decoding="async" className="yts-grade absolute inset-0 h-full w-full object-cover" />
        <div aria-hidden className="absolute inset-0 bg-[#1a1410]/25" />
        <motion.span aria-hidden className="absolute block ring-1 ring-[#f0d79e] shadow-[0_0_0_999px_rgba(26,20,16,.35)]" style={box}
          initial={{ opacity: 0, scale: 1.6 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 1.2, ease: E, delay: .3 }} />
      </div>
      <figcaption className="mt-2 text-[10.5px] font-semibold uppercase leading-snug tracking-[.16em] text-[#1a1410]/55">{cap}</figcaption>
    </figure>
  )
}

function Row({ r, i }) {
  const { t } = useLang()
  const flip = i % 2 === 1
  const cap = t(r.cap)
  return (
    <article className="grid items-center gap-8 md:gap-10 lg:grid-cols-12">
      <motion.div initial={{ clipPath: 'inset(12% 0% 12% 0%)', opacity: 0 }} whileInView={{ clipPath: 'inset(0% 0% 0% 0%)', opacity: 1 }} viewport={{ once: true, margin: '-10%' }} transition={{ duration: 1.3, ease: E }}
        className={`relative lg:col-span-6 ${flip ? 'lg:order-2 lg:col-start-7' : ''}`}>
        <Crop r={r} alt={`${t(r.cap)} — ${t({ en: 'detail', it: 'dettaglio' })}`} />
        {r.inset && (
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1.1, ease: E, delay: .4 }}
            className={`absolute -bottom-6 w-[38%] overflow-hidden rounded-[4px] shadow-[0_30px_60px_-20px_rgba(26,20,16,.55)] ring-[5px] ring-[#e9dfcf] ${flip ? '-left-3 md:-left-8' : '-right-3 md:-right-8'}`}>
            <img src={img(r.inset, true)} alt={t({ en: 'Alabaster spiral, Palazzo Campani', it: 'Spirale in alabastro, Palazzo Campani' })} loading="lazy" decoding="async" className="yts-grade aspect-square w-full object-cover" />
          </motion.div>
        )}
      </motion.div>
      <div className={`lg:col-span-5 ${flip ? 'lg:order-1 lg:col-start-1' : 'lg:col-start-8'}`}>
        <div className="flex items-center gap-4">
          <span className={`${D} text-[64px] font-[400] leading-none text-transparent [-webkit-text-stroke:1px_#a8843f] md:text-[96px]`}>0{i + 1}</span>
          <motion.span initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1.2, ease: E }} className="h-px flex-1 origin-left bg-[#a8843f]/60" />
          <span className="text-[11px] font-semibold uppercase tracking-[.26em] text-[#8a6a2c]">{t({ en: 'Detail', it: 'Dettaglio' })}</span>
        </div>
        <Display as="h3" cTone="text-[#8a6a2c]" className="mt-5 text-[clamp(34px,9.6vw,54px)] text-[#1a1410] md:text-[clamp(52px,4.6vw,78px)]" lines={[t(r.t), t(r.t2)]} />
        <motion.p initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1, ease: E, delay: .25 }}
          className="mt-5 max-w-[42ch] text-[15.5px] leading-relaxed text-[#1a1410]/72 md:text-[16.5px]">{t(r.d)}</motion.p>
        <div className="mt-8"><Context r={r} cap={cap} /></div>
      </div>
    </article>
  )
}

export default function Details() {
  const { t } = useLang()
  return (
    <section id="details" className={`relative isolate overflow-x-clip py-20 md:py-32 ${T.sans}`} style={{ background: SAND, color: INK }} aria-label={t({ en: 'Details', it: 'Dettagli' })}>
      <CineStyle />
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <div className="flex flex-col gap-6 border-b border-[#1a1410]/15 pb-10 md:flex-row md:items-end md:justify-between md:pb-14">
          <div>
            <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[.28em] text-[#8a6a2c]"><span className="h-px w-7 bg-[#a8843f]" />{t({ en: 'In the detail', it: 'Nel dettaglio' })}</p>
            <Display cTone="text-[#8a6a2c]" className="mt-5 text-[clamp(52px,15vw,74px)] md:text-[clamp(80px,9vw,150px)]"
              lines={t({ en: [['SEEN', { c: 'up' }, 'CLOSE']], it: [['VISTO', { c: 'da' }, 'VICINO']] })} />
          </div>
          <p className={`${S} max-w-[30ch] text-[22px] italic leading-[1.2] text-[#1a1410]/75 md:text-right md:text-[26px]`}>{t({ en: 'Three close-ups from his own renders and photographs.', it: 'Tre primi piani dai suoi render e dalle sue fotografie.' })}</p>
        </div>
        <div className="mt-14 space-y-20 md:mt-20 md:space-y-28">
          {ROWS.map((r, i) => <Row key={r.id} r={r} i={i} />)}
        </div>
      </div>
    </section>
  )
}
