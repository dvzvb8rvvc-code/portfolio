import React, { Children, useEffect, useRef } from 'react'
import { motion, useScroll, useSpring, useTransform, useReducedMotion, useMotionValue } from 'framer-motion'

/* YTS motion kit (V6 "reel" choreography) — scroll-linked, damped, transform/opacity only.
   useEnter(ref) → damped 0..1 as an element enters · MaskLine · Stagger · CountUp · ChapterFlood.
   prefers-reduced-motion → everything renders in its final, static state. */

export const SOFT = { stiffness: 70, damping: 22, mass: 0.6, restDelta: 0.0005 }
const clamp01 = x => (x < 0 ? 0 : x > 1 ? 1 : x)
const ease = t => 1 - Math.pow(1 - t, 3)

/* damped entry progress of `ref` (0 when its top is near the viewport bottom → 1 at `end`) */
export function useEnter(ref, { start = 'start 0.96', end = 'start 0.5' } = {}) {
  const { scrollYProgress } = useScroll({ target: ref, offset: [start, end] })
  return useSpring(scrollYProgress, SOFT)
}

/* one line in a mask: slides up (default) or in from the left; i = stagger slot along the shared progress `p` */
export function MaskLine({ children, p, i = 0, from = 'bottom', step = 0.12, span = 0.7, className = '', inner = '', inline = false }) {
  const own = useRef(null)
  const reduce = useReducedMotion()
  const local = useEnter(own)
  const src = p || local
  const a = i * step
  const k = useTransform(src, v => ease(clamp01((v - a) / span)))
  const x = useTransform(k, v => (from === 'left' ? (1 - v) * -102 + '%' : '0%'))
  const y = useTransform(k, v => (from === 'left' ? '0%' : (1 - v) * 108 + '%'))
  const o = useTransform(k, v => (from === 'left' ? 0.2 + v * 0.8 : 1))
  const W = inline ? 'span' : 'span'
  return (
    <W ref={own} className={`${inline ? 'inline-block' : 'block'} overflow-hidden pb-[.1em] -mb-[.06em] align-bottom ${className}`}>
      {reduce
        ? <span className={`${inline ? 'inline-block' : 'block'} ${inner}`}>{children}</span>
        : <motion.span style={{ x, y, opacity: o }} className={`${inline ? 'inline-block' : 'block'} will-change-transform ${inner}`}>{children}</motion.span>}
    </W>
  )
}

/* small labels / list items: each child fades + rises a little, staggered along `p` */
function StaggerItem({ p, a, span, children, dy, dx, item, itemClass }) {
  const k = useTransform(p, v => ease(clamp01((v - a) / span)))
  const y = useTransform(k, v => (1 - v) * dy)
  const x = useTransform(k, v => (1 - v) * dx)
  const M = motion[item]
  return <M style={{ opacity: k, y, x }} className={itemClass}>{children}</M>
}
const Plain = ({ item, itemClass, children }) => React.createElement(item, { className: itemClass }, children)
export function Stagger({ children, p, start = 0.1, step = 0.07, span = 0.45, dy = 14, dx = 0, className = '', as: Tag = 'div', item = 'div', itemClass }) {
  const own = useRef(null)
  const reduce = useReducedMotion()
  const local = useEnter(own)
  const src = p || local
  const kids = Children.toArray(children)
  return (
    <Tag ref={own} className={className}>
      {kids.map((c, i) => reduce
        ? <Plain key={c.key ?? i} item={item} itemClass={itemClass}>{c}</Plain>
        : <StaggerItem key={c.key ?? i} p={src} a={start + i * step} span={span} dy={dy} dx={dx} item={item} itemClass={itemClass}>{c}</StaggerItem>)}
    </Tag>
  )
}

/* a numeral that counts to its real value as it scrolls in (tabular figures, no React re-render) */
export function CountUp({ to, from = 0, p, a = 0, span = 0.75, pad = 0, className = '' }) {
  const own = useRef(null), out = useRef(null)
  const reduce = useReducedMotion()
  const local = useEnter(own, { start: 'start 0.98', end: 'start 0.55' })
  const src = p || local
  const fmt = v => String(Math.round(v)).padStart(pad, '0')
  useEffect(() => {
    if (reduce || !out.current) return
    const f = v => { const n = fmt(from + (to - from) * ease(clamp01((v - a) / span))); if (out.current && out.current.textContent !== n) out.current.textContent = n }
    f(src.get())
    return src.on('change', f)
  }, [src, to, from, reduce])
  return <span ref={own} className={`tabular-nums ${className}`}><span ref={out}>{fmt(reduce ? to : from)}</span></span>
}

/* full-bleed colour chapter: a viewport-sized radial glow that floods in while the section is on screen
   and drains out as it leaves. Lives under the section's content (section must be `relative isolate`).
   The container is masked top/bottom so there is never an edge between chapters. */
export function ChapterFlood({ tint = '58,36,18', at = '30% 45%', glow = '195,161,94', strength = 1, fade = '22vh', layer = '-z-10', className = '' }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const s = useSpring(scrollYProgress, SOFT)
  const o = useTransform(s, [0, 0.22, 0.78, 1], [0, strength, strength, 0])
  const sc = useTransform(s, [0, 0.3, 1], [0.82, 1, 1.12])
  const still = useMotionValue(strength * 0.8)
  const mask = `linear-gradient(180deg,transparent 0,#000 ${fade},#000 calc(100% - ${fade}),transparent 100%)`
  return (
    <div ref={ref} aria-hidden className={`pointer-events-none absolute inset-0 ${layer} ${className}`} style={{ WebkitMaskImage: mask, maskImage: mask }}>
      <motion.div className="sticky top-0 h-[100lvh] w-full overflow-x-clip will-change-[opacity]" style={{ opacity: reduce ? still : o }}>
        <motion.div className="absolute inset-[-12%] will-change-transform" style={{
          scale: reduce ? 1 : sc,
          background: `radial-gradient(70% 62% at ${at}, rgba(${tint},.95) 0%, rgba(${tint},.55) 38%, rgba(${tint},0) 72%), radial-gradient(38% 30% at ${at}, rgba(${glow},.10), transparent 70%)`,
        }} />
      </motion.div>
    </div>
  )
}
