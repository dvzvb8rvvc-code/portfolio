import React, { useEffect, useRef, useState, useCallback } from 'react'
import {
  motion, useScroll, useTransform, useSpring, useMotionValue, useVelocity,
  useAnimationFrame, useReducedMotion, useInView, animate
} from 'framer-motion'
import Lenis from 'lenis'

export const PORTFOLIO = 'https://dvzvb8rvvc-code.github.io/portfolio/'
export const tel = p => '+' + p.replace(/\D/g, '')
export const EASE = [0.2, 0, 0, 1]
export const wrap = (min, max, v) => { const r = max - min; return ((((v - min) % r) + r) % r) + min }

/* ---------------- smooth scroll ---------------- */
export function useSmooth() {
  const reduce = useReducedMotion()
  useEffect(() => {
    if (reduce) return
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true })
    let id
    const raf = t => { lenis.raf(t); id = requestAnimationFrame(raf) }
    id = requestAnimationFrame(raf)
    const onClick = e => {
      const a = e.target.closest('a[href^="#"]')
      if (!a) return
      const el = document.querySelector(a.getAttribute('href'))
      if (el) { e.preventDefault(); lenis.scrollTo(el, { offset: -70 }) }
    }
    document.addEventListener('click', onClick)
    window.__lenis = lenis
    return () => { cancelAnimationFrame(id); lenis.destroy(); document.removeEventListener('click', onClick) }
  }, [reduce])
}

/* ---------------- demo ribbon ---------------- */
export function Ribbon({ name, bg, fg }) {
  return (
    <div className="relative z-[70] px-4 py-2 text-center text-[12.5px] font-semibold leading-snug" style={{ background: bg, color: fg }}>
      Демо-концепт сайта для «{name}» · тексты и фото заменим на ваши ·{' '}
      <a className="underline underline-offset-2" href={PORTFOLIO} target="_blank" rel="noopener">автор — Артём</a>
    </div>
  )
}

/* ---------------- kinetic text ---------------- */
export function SplitText({ text, className = '', delay = 0, stagger = 0.035, mode = 'chars', once = true, as = 'span', y = '110%', rotate = 0 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once, margin: '0px 0px -10% 0px' })
  const reduce = useReducedMotion()
  const Tag = motion[as]
  const words = text.split(' ')
  let i = 0
  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {words.map((w, wi) => (
        <span key={wi} aria-hidden="true" className="inline-block whitespace-nowrap">
          {(mode === 'chars' ? [...w] : [w]).map((ch, ci) => {
            const idx = i++
            return (
              <span key={ci} className="inline-block overflow-hidden align-bottom pb-[0.08em] -mb-[0.08em]">
                <motion.span
                  className="inline-block will-change-transform"
                  initial={reduce ? { opacity: 0 } : { y, rotate }}
                  animate={inView ? (reduce ? { opacity: 1 } : { y: '0%', rotate: 0 }) : {}}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: delay + idx * stagger }}
                >{ch}</motion.span>
              </span>
            )
          })}
          {wi < words.length - 1 && <span className="inline-block">&nbsp;</span>}
        </span>
      ))}
    </Tag>
  )
}

/* words light up as you scroll */
export function ScrollWords({ text, className = '', dim = 0.15 }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 85%', 'end 45%'] })
  const words = text.split(' ')
  return (
    <p ref={ref} className={className}>
      {words.map((w, i) => {
        const s = i / words.length, e = s + 1 / words.length
        return <Word key={i} p={scrollYProgress} range={[s, e]} dim={dim}>{w}</Word>
      })}
    </p>
  )
}
function Word({ children, p, range, dim }) {
  const o = useTransform(p, range, [dim, 1])
  return <motion.span style={{ opacity: o }} className="inline-block mr-[0.25em]">{children}</motion.span>
}

/* ---------------- reveal ---------------- */
export function Reveal({ children, className = '', delay = 0, y = 24, as = 'div', ...rest }) {
  const reduce = useReducedMotion()
  const Tag = motion[as]
  return (
    <Tag
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y, filter: 'blur(6px)' }}
      whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 0.8, ease: EASE, delay }}
      {...rest}
    >{children}</Tag>
  )
}

/* ---------------- magnetic ---------------- */
export function Magnetic({ children, strength = 0.35, className = '' }) {
  const ref = useRef(null)
  const x = useMotionValue(0), y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 })
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 })
  const move = e => {
    if (e.pointerType !== 'mouse') return
    const r = ref.current.getBoundingClientRect()
    x.set((e.clientX - r.left - r.width / 2) * strength)
    y.set((e.clientY - r.top - r.height / 2) * strength)
  }
  return (
    <motion.div ref={ref} onPointerMove={move} onPointerLeave={() => { x.set(0); y.set(0) }} style={{ x: sx, y: sy }} className={'inline-block ' + className}>
      {children}
    </motion.div>
  )
}

/* ---------------- cursor ---------------- */
export function Cursor({ color = '#fff', blend = 'difference', textColor = '#000' }) {
  const x = useMotionValue(-100), y = useMotionValue(-100)
  const sx = useSpring(x, { stiffness: 500, damping: 40 }), sy = useSpring(y, { stiffness: 500, damping: 40 })
  const [label, setLabel] = useState('')
  const [hover, setHover] = useState(false)
  const [on, setOn] = useState(false)
  useEffect(() => {
    if (!matchMedia('(hover:hover) and (pointer:fine)').matches) return
    setOn(true); document.documentElement.classList.add('has-cursor')
    const mv = e => { x.set(e.clientX); y.set(e.clientY); const t = e.target.closest('a,button,[data-cursor]'); setHover(!!t); setLabel(t?.dataset?.cursor || '') }
    window.addEventListener('pointermove', mv)
    return () => { window.removeEventListener('pointermove', mv); document.documentElement.classList.remove('has-cursor') }
  }, [])
  if (!on) return null
  const size = label ? 88 : hover ? 56 : 14
  return (
    <motion.div aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-[100] grid place-items-center rounded-full text-[11px] font-bold uppercase tracking-wider"
      style={{ x: sx, y: sy, translateX: '-50%', translateY: '-50%', background: color, mixBlendMode: label ? 'normal' : blend, color: textColor }}
      animate={{ width: size, height: size }} transition={{ type: 'spring', stiffness: 400, damping: 30 }}>
      {label}
    </motion.div>
  )
}

/* ---------------- velocity marquee ---------------- */
export function Marquee({ children, base = -2, className = '', skew = true }) {
  const bx = useMotionValue(0)
  const { scrollY } = useScroll()
  const vel = useVelocity(scrollY)
  const sv = useSpring(vel, { damping: 50, stiffness: 400 })
  const factor = useTransform(sv, [-1000, 0, 1000], [-5, 0, 5], { clamp: false })
  const sk = useTransform(sv, [-1500, 1500], [-8, 8])
  const reduce = useReducedMotion()
  const dir = useRef(1)
  const x = useTransform(bx, v => `${wrap(-50, 0, v)}%`)
  useAnimationFrame((t, delta) => {
    if (reduce) return
    let m = dir.current * base * (delta / 1000)
    if (factor.get() < 0) dir.current = -1; else if (factor.get() > 0) dir.current = 1
    m += dir.current * m * factor.get()
    bx.set(bx.get() + m)
  })
  return (
    <div className={'overflow-hidden whitespace-nowrap ' + className}>
      <motion.div className="inline-flex flex-nowrap" style={{ x, skewX: skew ? sk : 0 }}>
        <div className="inline-flex flex-nowrap">{children}</div>
        <div className="inline-flex flex-nowrap" aria-hidden="true">{children}</div>
      </motion.div>
    </div>
  )
}

/* ---------------- counter ---------------- */
export function Counter({ to, className = '', duration = 2 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const [v, setV] = useState(0)
  useEffect(() => {
    if (!inView) return
    const c = animate(0, to, { duration, ease: [0.16, 1, 0.3, 1], onUpdate: n => setV(Math.round(n)) })
    return () => c.stop()
  }, [inView, to])
  return <span ref={ref} className={className} style={{ fontVariantNumeric: 'tabular-nums' }}>{v}</span>
}

/* ---------------- tilt card ---------------- */
export function Tilt({ children, className = '', max = 10, ...rest }) {
  const rx = useMotionValue(0), ry = useMotionValue(0)
  const srx = useSpring(rx, { stiffness: 200, damping: 20 }), sry = useSpring(ry, { stiffness: 200, damping: 20 })
  const mv = e => {
    if (e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    ry.set(((e.clientX - r.left) / r.width - 0.5) * max * 2)
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * max * 2)
  }
  return (
    <motion.div onPointerMove={mv} onPointerLeave={() => { rx.set(0); ry.set(0) }} style={{ rotateX: srx, rotateY: sry, transformPerspective: 900 }} className={className} {...rest}>
      {children}
    </motion.div>
  )
}

/* ---------------- booking ---------------- */
export function useBooking() {
  const [s, set] = useState({ name: '', phone: '', svc: '', sent: false, loading: false, err: false })
  const upd = (k, v) => set(p => ({ ...p, [k]: v, err: k === 'phone' ? false : p.err }))
  const submit = e => {
    e?.preventDefault()
    if (s.phone.replace(/\D/g, '').length < 12) { set(p => ({ ...p, err: true })); return false }
    set(p => ({ ...p, loading: true }))
    setTimeout(() => set(p => ({ ...p, loading: false, sent: true })), 1100)
    return true
  }
  const reset = () => set({ name: '', phone: '', svc: '', sent: false, loading: false, err: false })
  useEffect(() => {
    const h = e => { const t = e.target.closest('[data-svc]'); if (t) upd('svc', t.dataset.svc) }
    document.addEventListener('click', h)
    return () => document.removeEventListener('click', h)
  }, [])
  return { s, upd, submit, reset, set }
}
export const phoneFocus = (b) => () => { if (!b.s.phone) b.upd('phone', '+375 ') }

export function CheckDraw({ size = 76, className = '' }) {
  return (
    <svg viewBox="0 0 52 52" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <motion.circle cx="26" cy="26" r="23" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.7, ease: EASE }} />
      <motion.path d="M15 27l7 7 15-16" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.45, delay: 0.5, ease: EASE }} />
    </svg>
  )
}

/* ---------------- misc ---------------- */
export function MapFrame({ oid, dark = false, className = '' }) {
  return <iframe title="Карта" loading="lazy" allowFullScreen className={'block h-full w-full border-0 ' + className}
    style={dark ? { filter: 'invert(.92) hue-rotate(180deg) saturate(.6)' } : undefined}
    src={`https://yandex.ru/map-widget/v1/?oid=${oid}&z=16`} />
}
export const IG = p => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="18" height="18" {...p}><rect x="2.5" y="2.5" width="19" height="19" rx="5.5" /><circle cx="12" cy="12" r="4.2" /><circle cx="17.6" cy="6.4" r=".8" fill="currentColor" /></svg>)
export const TG = p => (<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" {...p}><path d="M21.9 4.3 18.7 19.4c-.2 1-.9 1.3-1.7.8l-4.8-3.6-2.3 2.2c-.3.3-.5.5-1 .5l.3-4.9 8.9-8c.4-.3-.1-.5-.6-.2L6.5 13.2 1.8 11.7c-1-.3-1-1 .2-1.5L20.6 3c.9-.3 1.6.2 1.3 1.3Z" /></svg>)
export const YT = p => (<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" {...p}><path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12 31 31 0 0 0 1 16.8a3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1c.4-1.6.5-3.2.5-4.8s-.1-3.2-.5-4.8ZM9.8 15.1V8.9L15.5 12z" /></svg>)

export function messengerLinks(b) {
  const L = []
  if (b.tg) L.push({ k: 'tg', label: 'Telegram', href: b.tg, Icon: TG })
  if (b.viber) L.push({ k: 'vb', label: 'Viber', href: b.viber })
  if (b.wa) L.push({ k: 'wa', label: 'WhatsApp', href: b.wa })
  if (b.ig) L.push({ k: 'ig', label: 'Instagram', href: b.ig, Icon: IG })
  if (b.yt) L.push({ k: 'yt', label: 'YouTube', href: b.yt, Icon: YT })
  return L
}

export function CallBar({ phone, callCls, bookCls, barCls }) {
  return (
    <div className={'fixed inset-x-0 bottom-0 z-50 grid grid-cols-2 gap-2 px-3 pt-2.5 pb-[calc(10px+env(safe-area-inset-bottom))] sm:hidden ' + barCls}>
      <a href={'tel:' + tel(phone)} className={'grid h-12 place-items-center font-bold ' + callCls}>Позвонить</a>
      <a href="#book" className={'grid h-12 place-items-center font-bold ' + bookCls}>Записаться</a>
    </div>
  )
}

/* scroll progress bar */
export function Progress({ color }) {
  const { scrollYProgress } = useScroll()
  const sx = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })
  return <motion.div className="fixed left-0 right-0 top-0 z-[80] h-[3px] origin-left" style={{ scaleX: sx, background: color }} />
}

/* intro loader curtain */
export function Intro({ children, bg, fg, duration = 1.6 }) {
  const reduce = useReducedMotion()
  const [show, setShow] = useState(!reduce)
  useEffect(() => { if (!show) return; const t = setTimeout(() => setShow(false), duration * 1000); return () => clearTimeout(t) }, [])
  if (!show) return null
  return (
    <motion.div className="fixed inset-0 z-[90] grid place-items-center" style={{ background: bg, color: fg }}
      initial={{ clipPath: 'inset(0 0 0% 0)' }} animate={{ clipPath: 'inset(0 0 100% 0)' }}
      transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1], delay: duration - 0.9 }}>
      {children}
    </motion.div>
  )
}

export function useMounted() { const [m, setM] = useState(false); useEffect(() => setM(true), []); return m }
export function useIsMobile() { const [m, setM] = useState(false); useEffect(() => { const q = matchMedia('(max-width: 768px)'); const f = () => setM(q.matches); f(); q.addEventListener('change', f); return () => q.removeEventListener('change', f) }, []); return m }

/* whole-line reveal (keeps gradients intact) */
export function LineReveal({ children, className = '', delay = 0 }) {
  const reduce = useReducedMotion()
  return (
    <span className="block overflow-hidden pb-[0.1em] -mb-[0.1em]">
      <motion.span className={'inline-block ' + className} initial={reduce ? { opacity: 0 } : { y: '110%', rotate: 3 }} animate={reduce ? { opacity: 1 } : { y: '0%', rotate: 0 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay }}>{children}</motion.span>
    </span>
  )
}
