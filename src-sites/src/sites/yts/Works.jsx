import React, { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion'
import { useLite, useIsMobile } from '../../lib/kit'
import { useLang } from './i18n'
import { T, WORKS, img } from './data'

const WorksWall = lazy(() => import('./works3d'))
const EASE = [0.16, 1, 0.3, 1]

const AR = { 4: 1, 3: 2.02, 84: 2, 40: 0.99, 112: 1.78, 78: 1.05, 82: 1.2, 101: 1.33, 102: 1.78, 111: 1.6, 103: 1.19, 98: 1.65, 89: 2.51, 83: 2.5, 107: 1.78, 124: 1.41, 125: 1, 90: 2, 91: 1.7, 97: 1.78, 99: 1.49, 108: 1.78, 113: 1.78, 8: 2.02, 10: 1.8, 11: 1.8, 12: 1.7, 13: 1.66, 18: 1.78, 20: 1.8, 24: 2, 25: 1.78, 26: 1.78, 34: 1.8, 42: 1, 43: 1.8, 45: 1.6, 46: 1.5, 47: 1.33, 49: 0.92, 50: 2, 53: 1.78, 57: 2, 62: 2.02, 65: 1.75, 73: 1.89, 88: 1.46, 136: 1.33, 6: 1.01, 21: 1.03, 23: 1.33, 29: 0.71, 31: 1.78, 32: 1.54, 35: 0.7, 36: 1.07, 37: 1.25, 39: 0.71, 59: 1.3, 64: 1.09, 79: 1.43, 80: 1.41, 86: 1.16, 87: 1.46, 93: 1.14, 100: 1.54, 106: 1.41, 110: 0.86, 44: 1.91, 16: 1.78, 17: 1.33, 19: 1.78, 22: 2.02, 27: 1.78, 33: 1.33, 51: 1.64, 66: 1.33, 67: 1.42, 71: 1.33, 74: 1.33, 75: 1.33, 81: 1.78, 94: 0.83, 96: 1.33, 105: 1.33, 127: 1.33, 128: 0.75 }

const KIND = {
  render: { en: 'Studio work', it: 'Opera dello studio', tab: { en: 'Renders', it: 'Render' } },
  sketch: { en: 'Hand sketch', it: 'Schizzo a mano', tab: { en: 'Sketches', it: 'Schizzi' } },
  build: { en: 'On site', it: 'In cantiere', tab: { en: 'Construction', it: 'Cantiere' } },
}
const FILTERS = ['all', 'render', 'sketch', 'build']

/* interleave the three kinds so the "All" wall reads like a contact sheet of a whole practice */
const ITEMS = (() => {
  const src = { render: [...WORKS.render], sketch: [...WORKS.sketch], build: [...WORKS.build] }
  const total = src.render.length + src.sketch.length + src.build.length
  const out = [], acc = { render: 0, sketch: 0, build: 0 }
  for (let i = 0; i < total; i++) {
    let best = null, bestV = -1
    for (const k of Object.keys(src)) {
      if (!src[k].length) continue
      const v = acc[k] + WORKS[k].length / total
      if (v > bestV) { bestV = v; best = k }
    }
    for (const k of Object.keys(src)) if (src[k].length) acc[k] += WORKS[k].length / total
    acc[best] -= 1
    out.push({ id: src[best].shift(), kind: best })
  }
  return out.map((it, i) => ({ ...it, n: i + 1, ar: AR[it.id] || 1.5 }))
})()
const pad = n => String(n).padStart(2, '0')

function Tabs({ filter, setFilter, dark }) {
  const { t } = useLang()
  const count = k => k === 'all' ? ITEMS.length : WORKS[k].length
  return (
    <div role="tablist" className={`inline-flex w-max gap-0.5 rounded-full p-1 ${dark ? 'bg-white/[.07]' : 'bg-black/[.05]'}`}>
      {FILTERS.map(k => (
        <button key={k} role="tab" aria-selected={filter === k} onClick={() => setFilter(k)}
          className={`relative h-9 shrink-0 rounded-full px-3 text-[12.5px] font-semibold tracking-[.02em] transition-colors md:px-4 ${filter === k ? (dark ? 'text-[#151412]' : 'text-[#ece7df]') : (dark ? 'text-[#ece7df]/70 hover:text-[#ece7df]' : 'text-[#151412]/65')}`}>
          {filter === k && <motion.span layoutId={dark ? 'wtab-d' : 'wtab-l'} className={`absolute inset-0 -z-0 rounded-full ${dark ? 'bg-[#ece7df]' : 'bg-[#151412]'}`} transition={{ type: 'spring', stiffness: 420, damping: 38 }} />}
          <span className="relative">{k === 'all' ? t({ en: 'All', it: 'Tutto' }) : t(KIND[k].tab)}<sup className="ml-1 text-[9px] tabular-nums opacity-60">{count(k)}</sup></span>
        </button>
      ))}
    </div>
  )
}

/* fullscreen viewer — arrows, swipe, Esc */
function Lightbox({ list, index, setIndex }) {
  const { t } = useLang()
  const open = index !== null
  const it = open ? list[index] : null
  const go = useCallback(d => setIndex(i => (i + d + list.length) % list.length), [list.length, setIndex])
  const start = useRef(null)
  useEffect(() => {
    if (!open) return
    window.__lenis?.stop()
    const k = e => { if (e.key === 'Escape') setIndex(null); if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1) }
    addEventListener('keydown', k)
    return () => { removeEventListener('keydown', k); window.__lenis?.start() }
  }, [open, go, setIndex])
  useEffect(() => { // preload neighbours
    if (!open) return
    ;[1, -1].forEach(d => { const n = list[(index + d + list.length) % list.length]; if (n) { const im = new Image(); im.src = img(n.id) } })
  }, [open, index, list])
  const sketch = it?.kind === 'sketch'
  return (
    <AnimatePresence>
      {open && (
        <motion.div key="lb" role="dialog" aria-modal="true" aria-label={t(KIND[it.kind])}
          className={`fixed inset-0 z-[90] flex flex-col ${sketch ? 'bg-[#e9e3d8] text-[#151412]' : 'bg-[#0e0d0c] text-[#ece7df]'} transition-colors duration-500 ${T.sans}`}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}
          onPointerDown={e => { start.current = e.clientX }}
          onPointerUp={e => { if (start.current === null) return; const dx = e.clientX - start.current; start.current = null; if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1) }}>
          {sketch && <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[.35] mix-blend-multiply" style={{ backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .55 0 0 0 0 .5 0 0 0 0 .42 0 0 0 .5 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")" }} />}
          <div className="relative z-10 flex h-16 shrink-0 items-center justify-between px-5 md:px-10">
            <div className="flex items-baseline gap-3 text-[12px] font-semibold uppercase tracking-[.16em]">
              <span className="tabular-nums">{pad(index + 1)} / {pad(list.length)}</span>
              <span className="opacity-50">{t(KIND[it.kind])}</span>
            </div>
            <button onClick={() => setIndex(null)} className={`grid h-11 w-11 place-items-center rounded-full ${sketch ? 'bg-black/[.07]' : 'bg-white/10'}`} aria-label={t({ en: 'Close', it: 'Chiudi' })}>
              <svg width="16" height="16" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5"><path d="M2 2l12 12M14 2L2 14" /></svg>
            </button>
          </div>
          <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center px-4 pb-4 md:px-24">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.img key={it.id} src={img(it.id)} alt={t(KIND[it.kind])} decoding="async" draggable={false}
                className={`max-h-full max-w-full select-none object-contain ${sketch ? 'mix-blend-multiply' : 'shadow-[0_40px_120px_-30px_rgba(0,0,0,.8)]'}`}
                style={{ aspectRatio: it.ar }}
                initial={{ opacity: 0, scale: 0.97, filter: 'blur(8px)' }} animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.6, ease: EASE }} />
            </AnimatePresence>
            {['prev', 'next'].map(d => (
              <button key={d} onClick={() => go(d === 'next' ? 1 : -1)} aria-label={d === 'next' ? t({ en: 'Next', it: 'Successiva' }) : t({ en: 'Previous', it: 'Precedente' })}
                className={`absolute top-1/2 hidden h-14 w-14 -translate-y-1/2 place-items-center rounded-full border md:grid ${d === 'next' ? 'right-6' : 'left-6'} ${sketch ? 'border-black/15 hover:bg-black/5' : 'border-white/15 hover:bg-white/10'} transition-colors`}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" className={d === 'prev' ? 'rotate-180' : ''}><path d="M2 9h13M10 4l5 5-5 5" /></svg>
              </button>
            ))}
          </div>
          <div className="relative z-10 flex h-14 shrink-0 items-center justify-between px-5 text-[12px] opacity-60 md:px-10">
            <span className={`${T.serif} text-[18px] italic`}>{sketch ? t({ en: 'Drawn by hand, before any screen.', it: 'Disegnato a mano, prima di ogni schermo.' }) : it.kind === 'build' ? t({ en: 'Where the drawing meets the ground.', it: 'Dove il disegno incontra il terreno.' }) : t({ en: 'YTS Architects', it: 'YTS Architects' })}</span>
            <span className="hidden md:inline">{t({ en: '← → to browse · Esc to close', it: '← → per sfogliare · Esc per chiudere' })}</span>
            <span className="md:hidden">{t({ en: 'Swipe', it: 'Scorri' })}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* simple swipeable masonry (mobile, lite): images balanced into N rows of one horizontal scroller */
function Strip({ list, rows, h, onOpen }) {
  const { t } = useLang()
  const lines = useMemo(() => {
    const out = Array.from({ length: rows }, () => ({ w: 0, items: [] }))
    list.forEach((it, i) => { const r = out.reduce((a, b) => (b.w < a.w ? b : a)); r.items.push({ ...it, i }); r.w += it.ar })
    return out
  }, [list, rows])
  return (
    <div className="-mx-5 overflow-x-auto overscroll-x-contain px-5 pb-4 [scrollbar-width:none] md:-mx-10 md:px-10 [&::-webkit-scrollbar]:hidden" style={{ touchAction: 'pan-x pan-y' }}>
      <div className="flex w-max flex-col gap-2.5">
        {lines.map((ln, r) => (
          <div key={r} className="flex gap-2.5">
            {ln.items.map(it => (
              <motion.button layout="position" key={it.id} onClick={() => onOpen(it.i)} aria-label={t(KIND[it.kind])}
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }}
                className={`group relative shrink-0 overflow-hidden ${it.kind === 'sketch' ? 'bg-[#ece7df]' : 'bg-white/5'}`} style={{ height: h, width: `calc(${h} * ${Math.min(Math.max(it.ar, 0.7), 2.1)})` }}>
                <img src={img(it.id, true)} alt="" loading="lazy" decoding="async" className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04] ${it.kind === 'sketch' ? 'mix-blend-multiply' : ''}`} />
                <span className={`absolute bottom-1.5 left-2 text-[10px] font-semibold uppercase tracking-[.14em] ${it.kind === 'sketch' ? 'text-[#151412]/60' : 'text-white/80 [text-shadow:0_1px_6px_rgba(0,0,0,.6)]'}`}>{pad(it.n)}</span>
              </motion.button>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function Hud({ hover, filter, list }) {
  const { t } = useLang()
  return (
    <div className="pointer-events-none flex min-h-[64px] items-end gap-4">
      <AnimatePresence mode="wait">
        {hover ? (
          <motion.div key={hover.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.35, ease: EASE }} className="flex items-end gap-4">
            <span className="text-[56px] font-black leading-[.8] tracking-[-.04em] tabular-nums text-[#c3a15e]">{pad(hover.n)}</span>
            <span className="pb-1">
              <span className={`${T.serif} block text-[24px] italic leading-none`}>{t(KIND[hover.kind])}</span>
              <span className="mt-1 block text-[11px] uppercase tracking-[.18em] text-[#ece7df]/50">{t({ en: 'Click to open', it: 'Clicca per aprire' })}</span>
            </span>
          </motion.div>
        ) : (
          <motion.div key={'f' + filter} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.35, ease: EASE }} className="pb-1">
            <span className={`${T.serif} block text-[24px] italic leading-none`}>{filter === 'all' ? t({ en: 'The whole practice', it: 'Tutto lo studio' }) : t(KIND[filter].tab)} <span className="not-italic text-[#ece7df]/40 tabular-nums">· {list.length}</span></span>
            <span className="mt-1.5 block text-[11px] uppercase tracking-[.18em] text-[#ece7df]/50">{t({ en: 'Scroll to turn · drag to spin', it: 'Scorri per ruotare · trascina per girare' })}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Stage({ filter, setFilter, list, onOpen, lbOpen, mobile }) {
  const { t } = useLang()
  const ref = useRef(null), stageRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 })
  const near = useInView(ref, { margin: '100% 0px 100% 0px' })
  const active = useInView(ref, { margin: '0px' })
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(near) }, [near])
  const [hover, setHover] = useState(null)
  const [flying, setFlying] = useState(false)
  const drag = useRef({ down: false, x: 0, sx: 0, moved: false, offset: 0, target: 0 })
  const x1 = useTransform(scrollYProgress, [0, 1], ['8%', '-22%'])
  const bar = useTransform(scrollYProgress, [0, 1], [0, 1])
  const skip = () => { const el = document.getElementById('works-after'); if (el) window.__lenis ? window.__lenis.scrollTo(el, { offset: -70 }) : el.scrollIntoView() }
  const openIt = useCallback(it => { const i = list.findIndex(x => x.id === it.id); if (i >= 0) onOpen(i) }, [list, onOpen])
  return (
    <div ref={ref} className="relative h-[220vh] md:h-[300vh]">
      <div ref={stageRef} className="sticky top-0 h-screen overflow-hidden bg-[#151412] text-[#ece7df]"
        style={{ touchAction: 'pan-y' }}
        onPointerDown={e => { const d = drag.current; d.down = true; d.x = d.sx = e.clientX; d.moved = false }}
        onPointerMove={e => { const d = drag.current; if (!d.down) return; d.target -= (e.clientX - d.x) * 0.0042; d.x = e.clientX; if (Math.abs(e.clientX - d.sx) > 6) d.moved = true }}
        onPointerUp={() => { drag.current.down = false }} onPointerLeave={() => { drag.current.down = false }}>
        {mounted && (
          <Suspense fallback={null}>
            <WorksWall items={ITEMS} filter={filter} progress={progress} dragState={drag} onHover={setHover} onOpen={openIt} active={active} lbOpen={lbOpen} onFly={setFlying} mobile={mobile} />
          </Suspense>
        )}
        {/* the big word passes over the wall, inverting what it crosses */}
        <div aria-hidden className={`pointer-events-none absolute inset-x-0 top-[50%] -translate-y-1/2 select-none overflow-hidden mix-blend-difference transition-opacity duration-500 ${flying ? 'opacity-0' : ''}`}>
          <motion.div style={{ x: x1, WebkitTextStroke: '1.5px rgba(236,231,223,.75)' }} className="whitespace-nowrap text-[21vw] font-black uppercase leading-[.82] tracking-[-.05em] text-transparent">{t({ en: 'The lineup.', it: 'La rassegna.' })}</motion.div>
        </div>
        {/* top bar */}
        <div className={`pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-[#151412] via-[#151412]/70 to-transparent pb-10 pt-20 transition-opacity duration-500 ${flying ? 'opacity-0' : ''}`}>
          <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-5 md:flex-row md:items-end md:justify-between md:gap-6 md:px-10">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[.22em] text-[#c3a15e]">{t({ en: '04 — Works', it: '04 — Progetti' })}</div>
              <h2 className={`${T.serif} mt-2 text-[44px] leading-[.95] lg:text-[56px]`}>{t({ en: 'The archive, ', it: 'L’archivio, ' })}<em className="text-[#ece7df]/55">{t({ en: 'in the round.', it: 'a tutto tondo.' })}</em></h2>
            </div>
            <div className="pointer-events-auto -mx-5 overflow-x-auto px-5 [scrollbar-width:none] md:mx-0 md:px-0"><Tabs filter={filter} setFilter={setFilter} dark /></div>
          </div>
        </div>
        {/* bottom bar */}
        <div className={`pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#151412]/90 via-[#151412]/30 to-transparent pb-7 pt-14 transition-opacity duration-500 ${flying ? 'opacity-0' : ''}`}>
          <div className="mx-auto flex max-w-[1440px] items-end justify-between gap-6 px-5 md:px-10">
            <Hud hover={hover} filter={filter} list={list} />
            <div className="pointer-events-auto flex items-center gap-5">
              <div className="hidden w-40 items-center gap-3 text-[11px] tabular-nums text-[#ece7df]/50 lg:flex">
                <span className="relative h-px flex-1 bg-white/15"><motion.span style={{ scaleX: bar }} className="absolute inset-0 origin-left bg-[#c3a15e]" /></span>
              </div>
              <button onClick={skip} className="h-10 rounded-full border border-white/20 px-4 text-[12px] font-semibold uppercase tracking-[.14em] text-[#ece7df]/80 transition-colors hover:bg-white/10">{t('skip')} ↓</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function IsraelList() {
  const { t } = useLang()
  return (
    <div className="grid gap-10 md:grid-cols-12">
      <div className="md:col-span-4">
        <div className="text-[11px] font-semibold uppercase tracking-[.22em] text-[#b06a35]">{t({ en: 'Selected · Israel', it: 'Selezione · Israele' })}</div>
        <p className={`${T.serif} mt-4 max-w-[22ch] text-[30px] leading-[1.05] md:text-[34px]`}>{t({ en: 'Three houses published on Archilovers.', it: 'Tre case pubblicate su Archilovers.' })}</p>
      </div>
      <ol className="md:col-span-8">
        {WORKS.israel.map((p, i) => (
          <motion.li key={i} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-10%' }} transition={{ duration: 0.8, ease: EASE, delay: i * 0.08 }}
            className="group relative grid grid-cols-[44px_1fr] items-baseline gap-x-4 border-t border-[#151412]/15 py-6 last:border-b md:grid-cols-[60px_1fr_auto] md:py-7">
            <span className="text-[12px] font-semibold tabular-nums text-[#151412]/40">{pad(i + 1)}</span>
            <span className={`${T.serif} text-[30px] leading-[1.05] transition-transform duration-700 [transition-timing-function:cubic-bezier(.16,1,.3,1)] group-hover:translate-x-3 md:text-[44px]`}>{t(p.t)}</span>
            <span className="col-start-2 mt-1 text-[12px] font-semibold uppercase tracking-[.16em] text-[#151412]/50 md:col-start-3 md:mt-0">{p.p}</span>
            <span className="absolute bottom-[-1px] left-0 h-px w-full origin-left scale-x-0 bg-[#b06a35] transition-transform duration-700 group-hover:scale-x-100" />
          </motion.li>
        ))}
      </ol>
    </div>
  )
}

export default function Works() {
  const { t } = useLang()
  const lite = useLite()
  const mobile = useIsMobile()
  const [filter, setFilter] = useState('all')
  const [index, setIndex] = useState(null)
  const list = useMemo(() => ITEMS.filter(it => filter === 'all' || it.kind === filter), [filter])
  const simple = lite
  return (
    <section id="works" className={`relative bg-[#151412] text-[#ece7df] ${T.sans}`}>
      {simple ? (
        <div className="mx-auto max-w-[1440px] px-5 pb-16 pt-24 md:px-10">
          <div className="text-[11px] font-semibold uppercase tracking-[.22em] text-[#c3a15e]">{t({ en: '04 — Works', it: '04 — Progetti' })}</div>
          <h2 className="mt-4 text-[17vw] font-black uppercase leading-[.82] tracking-[-.05em] md:text-[10vw]">{t({ en: 'The lineup.', it: 'La rassegna.' })}</h2>
          <p className={`${T.serif} mt-5 max-w-[30ch] text-[24px] leading-[1.1] text-[#ece7df]/70`}>{t({ en: 'Renders, the hand behind them, and the sites where they became real.', it: 'I render, la mano che li precede e i cantieri dove diventano realtà.' })}</p>
          <div className="mt-8 overflow-x-auto [scrollbar-width:none]"><Tabs filter={filter} setFilter={setFilter} dark /></div>
          <div className="mt-6"><Strip key={filter} list={list} rows={mobile ? 2 : 3} h={mobile ? '42vw' : '15vw'} onOpen={setIndex} /></div>
          <div className="mt-2 text-[11px] uppercase tracking-[.18em] text-[#ece7df]/45">{t({ en: 'Swipe sideways · tap to open', it: 'Scorri di lato · tocca per aprire' })}</div>
        </div>
      ) : (
        <Stage filter={filter} setFilter={setFilter} list={list} onOpen={setIndex} lbOpen={index !== null} mobile={mobile} />
      )}
      <div id="works-after" className="bg-[#ece7df] text-[#151412]">
        <div className="mx-auto max-w-[1440px] px-5 py-24 md:px-10 md:py-32"><IsraelList /></div>
      </div>
      <Lightbox list={list} index={index} setIndex={setIndex} />
    </section>
  )
}
