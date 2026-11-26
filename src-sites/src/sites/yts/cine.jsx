import React, { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useLite } from '../../lib/kit'
import { T } from './data'

/* V8 "cine" kit — shared by Projects / Como / Details / Palazzo / Works / Founder / Contact / Models.
   D       : big condensed display face (Oswald — same family the shell loads in index.html)
   Display : giant uppercase lines with small italic-serif connector words  ("IL GIARDINO *di* TEODOLINDA")
   Video   : muted · playsinline · loop · autoplay, plays only while on screen, 720/1080 by width,
             graceful fallback = the source render with a slow CSS push-in (until the clips exist / lite / reduced)
   Pill    : Delta-style cream pill CTA with a dark arrow disc */

export const FONT = 'Oswald'
export const D = "font-['Oswald',sans-serif]"
export const S = T.serif
export const E = [0.16, 1, 0.3, 1]
export const VID = n => `/portfolio/yts/video/${n}`

// make sure the display face is there even if the shell link is missing (no-op when present)
if (typeof document !== 'undefined' && ![...document.querySelectorAll('link[href*="fonts.googleapis"]')].some(l => l.href.includes(FONT))) {
  const l = document.createElement('link'); l.rel = 'stylesheet'
  l.href = `https://fonts.googleapis.com/css2?family=${FONT}:wght@400;500;600;700&display=swap`
  document.head.appendChild(l)
}

const CSS = `
@keyframes ytsPush{from{transform:scale(1.03) translate3d(0,0,0)}to{transform:scale(1.14) translate3d(-1.2%,-.8%,0)}}
.yts-push{animation:ytsPush 22s cubic-bezier(.45,0,.55,1) infinite alternate;will-change:transform}
@media (prefers-reduced-motion:reduce){.yts-push{animation:none;transform:scale(1.04)}}
.yts-d{font-family:'${FONT}',sans-serif;text-transform:uppercase;font-weight:600;letter-spacing:-.005em;line-height:.86}
`
export function CineStyle() { return <style>{CSS}</style> }

/* ── Display headline ──
   lines: [ ['IL GIARDINO'], [{ c: 'di' }, 'TEODOLINDA'] ]  — strings = condensed caps, {c} = italic serif connector,
   {i: 'Campani'} = big italic serif word (same size as caps). Each line slides up from a mask when in view. */
export function Display({ lines, className = '', as: Tag = 'h2', delay = 0, center = false, cTone = 'text-[#d9bf86]', once = true }) {
  const M = motion[Tag]
  // the observer sits on the heading itself (the lines start clipped inside their masks, so they can't observe)
  return (
    <M className={`${D} yts-d ${className}`} initial="h" whileInView="s" viewport={{ once, margin: '0px 0px -6% 0px' }}>
      {lines.map((ln, i) => (
        <span key={i} className={`block overflow-hidden pb-[.08em] -mb-[.04em] ${center ? 'text-center' : ''}`}>
          <motion.span className="block will-change-transform"
            variants={{ h: { y: '108%' }, s: { y: '0%', transition: { duration: 1.15, ease: E, delay: delay + i * 0.09 } } }}>
            {ln.map((w, k) => <Word key={k} w={w} cTone={cTone} />)}
          </motion.span>
        </span>
      ))}
    </M>
  )
}
function Word({ w, cTone }) {
  if (typeof w === 'string') return <span className="mx-[.06em] inline-block">{w}</span>
  if (w.c) return <span className={`${S} mx-[.14em] inline-block align-[.32em] text-[.38em] normal-case italic leading-none tracking-normal ${cTone}`}>{w.c}</span>
  return <span className={`${S} mx-[.06em] inline-block normal-case italic tracking-[-.01em] ${cTone}`} style={{ fontWeight: 400 }}>{w.i}</span>
}

export function Eyebrow({ children, className = '', tone = 'text-[#efe8dc]/70', center = false }) {
  return (
    <p className={`${T.sans} flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[.28em] ${tone} ${center ? 'justify-center' : ''} ${className}`}>
      <span className="h-px w-7 bg-[#c3a15e]" />{children}{center && <span className="h-px w-7 bg-[#c3a15e]" />}
    </p>
  )
}

export function Pill({ children, href, onClick, tone = 'light', className = '' }) {
  const Tag = href ? 'a' : 'button'
  const skin = {
    light: ['bg-[#efe8dc] text-[#0b0a08] hover:bg-[#d9bf86]', 'bg-[#0b0a08] text-[#efe8dc]'],
    ink: ['bg-[#1a1410] text-[#efe8dc] hover:bg-[#3a2a1c]', 'bg-[#e9dfcf] text-[#1a1410]'],
    ghost: ['border border-[#efe8dc]/30 text-[#efe8dc] hover:border-[#c3a15e] hover:bg-[#c3a15e]/10', 'bg-[#efe8dc] text-[#0b0a08]'],
  }[tone]
  return (
    <Tag href={href} onClick={onClick} type={href ? undefined : 'button'}
      className={`${T.sans} group inline-flex h-12 items-center gap-3 rounded-full pl-6 pr-1.5 text-[11.5px] font-semibold uppercase tracking-[.18em] transition-colors duration-500 ${skin[0]} ${className}`}>
      {children}
      <span className={`grid h-9 w-9 place-items-center rounded-full transition-transform duration-500 group-hover:-rotate-45 ${skin[1]}`}>
        <svg width="14" height="14" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M2 9h13M10 4l5 5-5 5" /></svg>
      </span>
    </Tag>
  )
}

/* ── Video ──  name → /video/<name>-1080.mp4 (desktop) / -720.mp4 (≤768px) / <name>.jpg poster.
   The fallback image is always underneath (with a slow push-in); the video fades in only once it plays. */
export function Video({ name, fallback, alt = '', className = '', pos = '50% 50%', imgClass = 'yts-grade', eager = false }) {
  const wrap = useRef(null), vid = useRef(null)
  const lite = useLite()
  const reduce = useReducedMotion()
  const [src, setSrc] = useState(null)
  const [playing, setPlaying] = useState(false)
  const [failed, setFailed] = useState(false)
  const allowVideo = !!name && !lite && !reduce && !failed
  useEffect(() => {
    if (!allowVideo) return
    const el = wrap.current; if (!el) return
    const io = new IntersectionObserver(([e]) => {
      const v = vid.current
      if (e.isIntersecting) {
        if (!src) setSrc(VID(`${name}-${innerWidth <= 768 ? 720 : 1080}.mp4`))
        else if (v) v.play().catch(() => {})
      } else if (v) v.pause()
    }, { rootMargin: '25% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [allowVideo, src, name])
  useEffect(() => { if (src && vid.current) { vid.current.load(); vid.current.play().catch(() => {}) } }, [src])
  return (
    <div ref={wrap} className={`relative overflow-hidden bg-[#14120f] ${className}`}>
      <img src={fallback} alt={alt} decoding="async" loading={eager ? 'eager' : 'lazy'} draggable={false}
        className={`absolute inset-0 h-full w-full object-cover ${playing ? '' : 'yts-push'} ${imgClass}`} style={{ objectPosition: pos }} />
      {allowVideo && src && (
        <video ref={vid} muted playsInline loop autoPlay preload="metadata" aria-hidden disablePictureInPicture
          onPlaying={() => setPlaying(true)} onError={() => setFailed(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1200ms] ${playing ? 'opacity-100' : 'opacity-0'} ${imgClass}`} style={{ objectPosition: pos }}>
          <source src={src} type="video/mp4" onError={() => setFailed(true)} />
        </video>
      )}
    </div>
  )
}

/* concierge hook: preselect an interest in the contact form and scroll there */
export const ask = k => window.dispatchEvent(new CustomEvent('yts:interest', { detail: k }))
