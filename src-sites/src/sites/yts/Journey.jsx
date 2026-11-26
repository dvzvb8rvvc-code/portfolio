import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useReducedMotion, useMotionValue, useMotionValueEvent } from 'framer-motion'
import { useIsMobile } from '../../lib/kit'
import { useLang } from './i18n'
import { T, SERVICES } from './data'
import { SOFT, MaskLine } from './motion'
import { DISPLAY, Clip } from './Hero'
import { W as SW, H as SH, PATHS } from './journeySketch'

/* JOURNEY v8 — Delta's "THE JOURNEY of COFFEE" line-art, told with his own hand:
   1) his sketch for Il Giardino di Teodolinda (vectorised from the original, journeySketch.js) draws itself
      stroke by stroke as you scroll;  2) it recedes and a thin gold line draws through the five stages of
      the studio's integrated package (data.js SERVICES). Behind: the lake film, darkened. */

const S = {
  a: { en: 'From the first line', it: 'Dal primo tratto' },
  to: { en: 'to', it: 'all’' },
  b: { en: 'the last stone', it: 'ultima pietra' },
  sketch: { en: 'Every project begins as a line on paper — here, his own sketch for Il Giardino di Teodolinda on Lake Como.', it: 'Ogni progetto inizia come una linea sulla carta — qui, il suo schizzo per Il Giardino di Teodolinda sul Lago di Como.' },
  hand: { en: 'Drawn by hand · Yehiel Tsubery', it: 'Disegnato a mano · Yehiel Tsubery' },
}
const SHORT = [
  { en: 'Concept', it: 'Concept' }, { en: 'Permits', it: 'Permessi' }, { en: 'Working drawings', it: 'Esecutivi' },
  { en: 'Interiors', it: 'Interni' }, { en: 'Development', it: 'Sviluppo' },
]
const ICONS = [
  'M5 19l3.5-.8L19 7.7 16.3 5 5.8 15.5zM14.6 6.7l2.7 2.7M4 21h7',
  'M9.5 3.5h5v5.2l2.5 3H7l2.5-3zM5 14.5h14V18H5zM6.5 21h11',
  'M4 20V5l15 15zM8 16v-3.4l3.4 3.4zM4 9h2M4 13h2M8 20v-2M12 20v-2',
  'M6.5 11V8.2A2.2 2.2 0 0 1 8.7 6h6.6a2.2 2.2 0 0 1 2.2 2.2V11M4 11h2.8v3.6h10.4V11H20v6H4zM6 17v3M18 17v3',
  'M3 20.5h18M6 20.5V9.5l6-4.5 6 4.5v11M10 20.5v-5h4v5M15.5 3.5v3',
]

/* gold route: desktop is horizontal arches (viewBox 1000×300), mobile a vertical zig-zag (300×1000) */
const NODES_D = [[90, 205], [295, 95], [500, 205], [705, 95], [910, 205]]
const NODES_M = [[80, 90], [220, 290], [80, 490], [220, 690], [80, 890]]
/* route in real pixels of its box (no non-uniform SVG scaling → crisp 1.4px line, exact pathLength) */
function route(w, h, mob) {
  const pts = mob
    ? [[w / 2, -24], ...NODES_M.map(([x, y]) => [x / 300 * w, y / 1000 * h]), [w / 2, h + 24]]
    : [[-24, h / 2], ...NODES_D.map(([x, y]) => [x / 1000 * w, y / 300 * h]), [w + 24, h / 2]]
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1], [bx, by] = pts[i]
    d += mob
      ? ` C${ax.toFixed(1)} ${(ay + (by - ay) / 2).toFixed(1)} ${bx.toFixed(1)} ${(by - (by - ay) / 2).toFixed(1)} ${bx.toFixed(1)} ${by.toFixed(1)}`
      : ` C${(ax + (bx - ax) / 2).toFixed(1)} ${ay.toFixed(1)} ${(bx - (bx - ax) / 2).toFixed(1)} ${by.toFixed(1)} ${bx.toFixed(1)} ${by.toFixed(1)}`
  }
  return d
}
function useBox(ref) {
  const [b, setB] = useState([1000, 300])
  useEffect(() => {
    const el = ref.current; if (!el) return
    const ro = new ResizeObserver(([e]) => setB([Math.round(e.contentRect.width), Math.round(e.contentRect.height)]))
    ro.observe(el); return () => ro.disconnect()
  }, [])
  return b
}

const ss = (a, b, v) => { const t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t) }
const DRAW = [0.03, 0.44], ROUTE = [0.5, 0.93]
const thOf = (at, mob) => ROUTE[0] + (mob ? at[1] / 1000 : at[0] / 1000) * (ROUTE[1] - ROUTE[0])

function Stroke({ d, i, n, p }) {
  const a = DRAW[0] + (i / n) * (DRAW[1] - DRAW[0] - 0.07)
  const k = useTransform(p, v => ss(a, a + 0.07, v))
  const o = useTransform(k, v => (v > 0.003 ? 1 : 0))
  return <motion.path d={d} style={{ pathLength: k, opacity: o }} />
}

function Node({ i, at, p, mob, active }) {
  const { t } = useLang()
  const th = thOf(at, mob)
  const k = useTransform(p, v => ss(th - 0.03, th + 0.02, v))
  const sc = useTransform(k, [0, 1], [0.6, 1])
  // framer owns `transform` here (scale) → centre with x/y, not Tailwind translate classes
  const x = mob ? at[0] / 3 : at[0] / 10, y = mob ? at[1] / 10 : at[1] / 3
  return (
    <motion.div style={{ left: `${x}%`, top: `${y}%`, opacity: k, scale: sc, x: '-50%', y: '-50%' }} className="absolute">
      <div className={`relative grid h-[54px] w-[54px] place-items-center rounded-full border transition-colors duration-700 md:h-[92px] md:w-[92px] ${active ? 'border-[#c3a15e] bg-[#c3a15e]/15' : 'border-[#efe0cc]/35 bg-[#140d09]/55'} backdrop-blur-[2px]`}>
        <svg viewBox="0 0 24 24" className={`h-[22px] w-[22px] md:h-[34px] md:w-[34px] ${active ? 'text-[#f0d79e]' : 'text-[#efe0cc]/85'}`} fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"><path d={ICONS[i]} /></svg>
      </div>
      <div className={`${T.sans} absolute whitespace-nowrap text-[12px] tracking-[.02em] md:left-1/2 md:top-full md:mt-3 md:-translate-x-1/2 md:text-center md:text-[14px] ${mob ? (at[0] < 150 ? 'left-full top-1/2 ml-3 -translate-y-1/2' : 'right-full top-1/2 mr-3 -translate-y-1/2 text-right') : ''}`}>
        <span className="block text-[10px] font-semibold tabular-nums tracking-[.2em] text-[#c3a15e] md:text-[11px]">0{i + 1}</span>
        <span className={`${T.serif} block text-[18px] italic md:text-[22px] ${active ? 'text-[#f2e6d4]' : 'text-[#efe0cc]/70'}`}>{t(SHORT[i])}</span>
      </div>
    </motion.div>
  )
}

export default function Journey() {
  const { t, lang } = useLang()
  const ref = useRef(null)
  const mob = useIsMobile()
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const sp = useSpring(scrollYProgress, SOFT)
  const one = useMotionValue(1)
  const p = reduce ? one : sp

  const [act, setAct] = useState(reduce ? 4 : -1)
  useMotionValueEvent(p, 'change', v => {
    let a = -1
    if (v >= DRAW[0] && v < ROUTE[0]) a = -1
    if (v >= ROUTE[0]) { a = 0; (mob ? NODES_M : NODES_D).forEach((at, i) => { if (v >= thOf(at, mob) - 0.01) a = i }) }
    setAct(x => (x === a ? x : a))
  })

  const skO = useTransform(p, [0, 0.03, 0.46, 0.56], [0.0, 1, 1, 0.16])
  const skS = useTransform(p, [0.44, 0.58], [1, 0.84])
  const skY = useTransform(p, [0.44, 0.58], ['0%', mob ? '-6%' : '-4%'])
  const capO = useTransform(p, [0.06, 0.12, 0.42, 0.5], [0, 1, 1, 0])
  const routeK = useTransform(p, v => ss(ROUTE[0], ROUTE[1], v))
  const boxRef = useRef(null)
  const [bw, bh] = useBox(boxRef)
  const rd = route(bw, bh, mob)
  const routeO = useTransform(p, [ROUTE[0] - 0.02, ROUTE[0] + 0.01], [0, 1])
  const dim = useTransform(p, [0, 0.5, 1], [0.8, 0.74, 0.58])
  const nodes = mob ? NODES_M : NODES_D
  const cur = act >= 0 ? SERVICES[act] : null

  return (
    <section id="journey" ref={ref} className={`relative bg-[#140d09] text-[#f2e6d4] ${reduce ? '' : 'h-[360vh] md:h-[380vh]'}`}>
      <div className={`${reduce ? 'relative min-h-[100svh]' : 'sticky top-0 h-[100svh]'} overflow-hidden`}>
        <Clip name="lake" still="/portfolio/yts/img/129.webp" pos="50% 50%" />
        <motion.div aria-hidden className="absolute inset-0 bg-[#140d09]" style={{ opacity: dim }} />
        <div aria-hidden className="absolute inset-x-0 top-0 h-[22vh] bg-gradient-to-b from-[#140d09] to-transparent" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-[26vh] bg-gradient-to-t from-[#140d09] to-transparent" />

        {/* title */}
        <div className="relative z-10 px-5 pt-[88px] text-center md:pt-[104px]">
          <h2 key={lang} className={`${DISPLAY} font-[600] uppercase leading-[.86] text-[#f2e6d4] text-[clamp(40px,11.2vw,64px)] md:text-[clamp(64px,6.6vw,118px)]`}>
            <MaskLine>{t(S.a)}</MaskLine>
            <MaskLine i={1}><span className={`${T.serif} mr-[.14em] align-[.1em] text-[.46em] font-normal normal-case italic tracking-normal text-[#d9bf86]`}>{t(S.to)}</span>{t(S.b)}</MaskLine>
          </h2>
        </div>

        {/* his sketch, drawing itself */}
        <motion.div aria-hidden style={{ opacity: skO, scale: skS, y: skY }}
          className="pointer-events-none absolute inset-x-0 bottom-[22%] top-[27%] flex items-center justify-center md:bottom-[4%] md:top-[30%]">
          <svg viewBox={`0 0 ${SW} ${SH}`} className="h-full max-w-[92vw]" fill="none" stroke="#efe0cc" strokeOpacity=".9" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
            {PATHS.map((d, i) => <Stroke key={i} d={d} i={i} n={PATHS.length} p={p} />)}
          </svg>
        </motion.div>
        <motion.div style={{ opacity: reduce ? 0 : capO }} className="pointer-events-none absolute bottom-[max(20px,env(safe-area-inset-bottom))] left-5 right-5 z-10 md:bottom-12 md:left-10 md:right-auto md:max-w-[340px]">
          <p className={`${T.sans} text-[11px] font-semibold uppercase tracking-[.28em] text-[#c3a15e]`}>01 · {t(SHORT[0])}</p>
          <p className={`${T.serif} mt-2 text-[18px] italic leading-[1.3] text-[#efe0cc]/90 md:text-[21px]`}>{t(S.sketch)}</p>
        </motion.div>

        {/* gold route through the five stages */}
        <motion.div ref={boxRef} style={{ opacity: routeO }} className={`absolute z-10 ${mob ? 'left-1/2 top-[37%] h-[40%] w-[300px] -translate-x-1/2' : 'inset-x-[4%] top-[38%] h-[34%]'}`}>
          <svg viewBox={`0 0 ${bw} ${bh}`} className="absolute inset-0 h-full w-full overflow-visible" fill="none">
            <path d={rd} stroke="#efe0cc" strokeOpacity=".16" strokeWidth="1" strokeDasharray="3 6" />
            <motion.path d={rd} stroke="#c3a15e" strokeWidth="1.4" strokeLinecap="round" style={{ pathLength: routeK }} />
          </svg>
          {nodes.map((at, i) => <Node key={i} i={i} at={at} p={p} mob={mob} active={act === i} />)}
        </motion.div>

        {/* stage description */}
        <div className="absolute inset-x-5 bottom-[max(18px,env(safe-area-inset-bottom))] z-10 min-h-[92px] md:bottom-10 md:left-auto md:right-10 md:w-[380px]">
          <AnimatePresence mode="wait">
            {cur && (
              <motion.div key={act + lang} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: .6, ease: [0.22, 1, 0.36, 1] }}
                className="md:text-right">
                <p className={`${T.sans} text-[11px] font-semibold uppercase tracking-[.28em] text-[#c3a15e]`}>{cur.k} · {t(cur.t)}</p>
                <p className={`${T.sans} mt-2 text-[14.5px] leading-[1.55] text-[#efe0cc]/80 md:text-[15px]`}>{t(cur.d)}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <motion.p style={{ opacity: capO }} className={`${T.sans} pointer-events-none absolute bottom-12 right-10 z-10 hidden text-[11px] uppercase tracking-[.28em] text-[#efe0cc]/50 md:block`}>{t(S.hand)}</motion.p>
      </div>
    </section>
  )
}
