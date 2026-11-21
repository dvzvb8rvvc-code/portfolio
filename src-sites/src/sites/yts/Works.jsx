import React, { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValue } from 'framer-motion'
import { useIsMobile } from '../../lib/kit'
import { useLang } from './i18n'
import { T, WORKS, img } from './data'

/* v3 Works — pure DOM: filter tabs, a two-row draggable contact-sheet strip, lightbox, Israel row. No canvas. */
const EASE = [0.16, 1, 0.3, 1]
const pad = (n, l = 2) => String(n).padStart(l, '0')

const AR = { 4: 1, 3: 2.02, 84: 2, 40: 0.99, 112: 1.78, 78: 1.05, 82: 1.2, 101: 1.33, 102: 1.78, 111: 1.6, 103: 1.19, 98: 1.65, 89: 2.51, 83: 2.5, 107: 1.78, 124: 1.41, 125: 1, 90: 2, 91: 1.7, 97: 1.78, 99: 1.49, 108: 1.78, 113: 1.78, 8: 2.02, 10: 1.8, 11: 1.8, 12: 1.7, 13: 1.66, 18: 1.78, 20: 1.8, 24: 2, 25: 1.78, 26: 1.78, 34: 1.8, 42: 1, 43: 1.8, 45: 1.6, 46: 1.5, 47: 1.33, 49: 0.92, 50: 2, 53: 1.78, 57: 2, 62: 2.02, 65: 1.75, 73: 1.89, 88: 1.46, 136: 1.33, 6: 1.01, 21: 1.03, 23: 1.33, 29: 0.71, 31: 1.78, 32: 1.54, 35: 0.7, 36: 1.07, 37: 1.25, 39: 0.71, 59: 1.3, 64: 1.09, 79: 1.43, 80: 1.41, 86: 1.16, 87: 1.46, 93: 1.14, 100: 1.54, 106: 1.41, 110: 0.86, 44: 1.91, 16: 1.78, 17: 1.33, 19: 1.78, 22: 2.02, 27: 1.78, 33: 1.33, 51: 1.64, 66: 1.33, 67: 1.42, 71: 1.33, 74: 1.33, 75: 1.33, 81: 1.78, 94: 0.83, 96: 1.33, 105: 1.33, 127: 1.33, 128: 0.75 }

const KIND = {
  render: { cap: { en: 'Studio work · Render', it: 'Opera dello studio · Render' }, tab: { en: 'Renders', it: 'Render' }, word: { en: 'rendered,', it: 'renderizzato,' } },
  sketch: { cap: { en: 'Hand sketch', it: 'Schizzo a mano' }, tab: { en: 'Sketches', it: 'Schizzi' }, word: { en: 'Drawn,', it: 'Disegnato,' } },
  build: { cap: { en: 'On site · Construction', it: 'In cantiere · Costruzione' }, tab: { en: 'Construction', it: 'Cantiere' }, word: { en: 'built.', it: 'costruito.' } },
}
const FILTERS = ['all', 'render', 'sketch', 'build']

/* interleave kinds so "All" reads like a contact sheet of a whole practice */
const ITEMS = (() => {
  const src = { render: WORKS.render, sketch: WORKS.sketch, build: WORKS.build }
  const tot = { render: src.render.length, sketch: src.sketch.length, build: src.build.length }
  const all = tot.render + tot.sketch + tot.build
  const acc = { render: 0, sketch: 0, build: 0 }, out = []
  for (let i = 0; i < all; i++) {
    let best = null, bd = -1
    for (const k of ['render', 'sketch', 'build']) {
      if (acc[k] >= tot[k]) continue
      const d = (i + 1) / all - acc[k] / tot[k]
      if (d > bd) { bd = d; best = k }
    }
    const id = src[best][acc[best]++]
    out.push({ id, kind: best, ar: AR[id] || 1.5 })
  }
  return out.map((x, i) => ({ ...x, n: i + 1 }))
})()

function Tabs({ filter, setFilter }) {
  const { t } = useLang()
  return (
    <div role="tablist" aria-label={t({ en: 'Filter works', it: 'Filtra i progetti' })} className="flex w-max items-center gap-1 rounded-full bg-[#151412]/[.06] p-1">
      {FILTERS.map(f => {
        const on = filter === f
        const n = f === 'all' ? ITEMS.length : ITEMS.filter(x => x.kind === f).length
        return (
          <button key={f} role="tab" aria-selected={on} onClick={() => setFilter(f)}
            className={`relative h-10 rounded-full px-4 text-[13px] font-semibold transition-colors duration-300 md:px-5 ${on ? 'text-[#ece7df]' : 'text-[#151412]/70 hover:text-[#151412]'}`}>
            {on && <motion.span layoutId="works-tab" className="absolute inset-0 rounded-full bg-[#151412]" transition={{ type: 'spring', stiffness: 480, damping: 40 }} />}
            <span className="relative">{f === 'all' ? t({ en: 'All', it: 'Tutti' }) : t(KIND[f].tab)}</span>
            <sup className={`relative ml-1 text-[9.5px] tabular-nums ${on ? 'text-[#e9a25c]' : 'text-[#151412]/40'}`}>{n}</sup>
          </button>
        )
      })}
    </div>
  )
}

function Thumb({ it, h, onOpen, dragged }) {
  const { t } = useLang()
  const sketch = it.kind === 'sketch'
  return (
    <button type="button" onClick={e => { if (dragged.current) { e.preventDefault(); return } onOpen(it) }}
      aria-label={`${t(KIND[it.kind].cap)} ${pad(it.n, 3)}`}
      style={{ width: Math.round(h * it.ar), height: h }}
      className={`group relative shrink-0 overflow-hidden rounded-[6px] outline-none ring-[#b06a35] focus-visible:ring-2 ${sketch ? 'bg-[#f3ead9]' : 'bg-[#d9d2c6]'}`}>
      <img src={img(it.id, true)} alt="" loading="lazy" decoding="async" draggable={false}
        className={`h-full w-full select-none object-cover transition-transform duration-[900ms] [transition-timing-function:cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.06] ${sketch ? 'p-[7%] mix-blend-multiply [filter:sepia(.25)_contrast(1.05)]' : ''}`} />
      {sketch && <span aria-hidden className="pointer-events-none absolute inset-0 shadow-[inset_0_0_40px_rgba(140,110,60,.18)]" />}
      <span className="pointer-events-none absolute inset-x-0 bottom-0 flex translate-y-2 items-end justify-between gap-3 bg-gradient-to-t from-black/65 to-transparent px-3 pb-2.5 pt-10 text-left opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
        <span className="text-[11px] font-semibold uppercase tracking-[.16em] text-white">{t(KIND[it.kind].cap)}</span>
        <span className="text-[10.5px] tabular-nums text-white/65">{pad(it.n, 3)}</span>
      </span>
    </button>
  )
}

/* two balanced rows; mouse drag with inertia, native swipe on touch */
function Strip({ list, h, onOpen }) {
  const { t } = useLang()
  const ref = useRef(null), dragged = useRef(false), st = useRef({ down: false, x: 0, sl: 0, v: 0, lx: 0, lt: 0, raf: 0 })
  const prog = useMotionValue(0), thumb = useMotionValue(1)
  const rows = useMemo(() => {
    const r = [[], []], w = [0, 0]
    list.forEach(it => { const k = w[0] <= w[1] ? 0 : 1; r[k].push(it); w[k] += it.ar })
    return r
  }, [list])
  useEffect(() => {
    const el = ref.current; if (!el) return
    el.scrollLeft = 0
    const upd = () => { const m = el.scrollWidth - el.clientWidth; prog.set(m > 0 ? el.scrollLeft / m : 0); thumb.set(Math.min(1, el.clientWidth / el.scrollWidth)) }
    upd(); el.addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd)
    return () => { el.removeEventListener('scroll', upd); removeEventListener('resize', upd); cancelAnimationFrame(st.current.raf) }
  }, [list])
  const down = e => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return
    const s = st.current, el = ref.current
    cancelAnimationFrame(s.raf)
    Object.assign(s, { down: true, x: e.clientX, sl: el.scrollLeft, v: 0, lx: e.clientX, lt: performance.now() })
    dragged.current = false
    const move = ev => {
      const dx = ev.clientX - s.x
      if (Math.abs(dx) > 5) { dragged.current = true; el.style.cursor = 'grabbing' }
      el.scrollLeft = s.sl - dx
      const now = performance.now(), dt = Math.max(1, now - s.lt)
      s.v = s.v * 0.6 + ((ev.clientX - s.lx) / dt) * 0.4; s.lx = ev.clientX; s.lt = now
    }
    const up = () => {
      removeEventListener('pointermove', move); removeEventListener('pointerup', up)
      el.style.cursor = ''; s.down = false
      let v = s.v * 16
      const step = () => { if (Math.abs(v) < 0.3) return; el.scrollLeft -= v; v *= 0.93; s.raf = requestAnimationFrame(step) }
      s.raf = requestAnimationFrame(step)
      setTimeout(() => { dragged.current = false }, 40)
    }
    addEventListener('pointermove', move); addEventListener('pointerup', up)
  }
  const nudge = d => { const el = ref.current; el.scrollBy({ left: d * el.clientWidth * 0.75, behavior: 'smooth' }) }
  return (
    <div>
      <div ref={ref} onPointerDown={down} onDragStart={e => e.preventDefault()}
        className="cursor-grab overflow-x-auto overscroll-x-contain px-5 pb-1 [scrollbar-width:none] md:px-10 [&::-webkit-scrollbar]:hidden">
        <div className="flex w-max flex-col gap-2 md:gap-2.5">
          {rows.map((r, k) => (
            <div key={k} className={`flex gap-2 md:gap-2.5 ${k ? 'pl-[6vw]' : ''}`}>
              {r.map(it => <Thumb key={it.id} it={it} h={h} onOpen={onOpen} dragged={dragged} />)}
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto mt-6 flex max-w-[1440px] items-center gap-5 px-5 md:px-10">
        <div className="relative h-px flex-1 bg-[#151412]/15">
          <ProgressThumb prog={prog} thumb={thumb} />
        </div>
        <span className="hidden text-[11px] font-semibold uppercase tracking-[.18em] text-[#151412]/45 md:inline">{t({ en: 'Drag to browse · click to open', it: 'Trascina per sfogliare · clic per aprire' })}</span>
        <span className="text-[11px] font-semibold uppercase tracking-[.18em] text-[#151412]/45 md:hidden">{t({ en: 'Swipe · tap to open', it: 'Scorri · tocca per aprire' })}</span>
        <div className="hidden gap-2 md:flex">
          {[-1, 1].map(d => (
            <button key={d} onClick={() => nudge(d)} aria-label={d < 0 ? t({ en: 'Previous', it: 'Precedente' }) : t({ en: 'Next', it: 'Successivo' })}
              className="grid h-10 w-10 place-items-center rounded-full border border-[#151412]/20 transition-colors hover:bg-[#151412] hover:text-[#ece7df]">
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ transform: d < 0 ? 'scaleX(-1)' : '' }}><path d="M2 9h13M10 4l5 5-5 5" /></svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

/* progress bar thumb — width = visible fraction, position follows scroll (motion values only) */
function ProgressThumb({ prog, thumb }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    const f = () => { const w = thumb.get(); el.style.width = (w * 100) + '%'; el.style.transform = `translateX(${(prog.get() * (1 - w) / w) * 100}%)` }
    f(); const a = prog.on('change', f), b = thumb.on('change', f)
    return () => { a(); b() }
  }, [])
  return <span ref={ref} className="absolute -top-px left-0 block h-[3px] rounded-full bg-[#b06a35] will-change-transform" />
}

function Lightbox({ list, index, setIndex }) {
  const { t } = useLang()
  const open = index !== null
  const it = open ? list[index] : null
  const go = d => setIndex(i => (i + d + list.length) % list.length)
  useEffect(() => {
    if (!open) return
    window.__lenis?.stop(); const o = document.body.style.overflow; document.body.style.overflow = 'hidden'
    const k = e => { if (e.key === 'Escape') setIndex(null); else if (e.key === 'ArrowRight') go(1); else if (e.key === 'ArrowLeft') go(-1) }
    addEventListener('keydown', k)
    return () => { removeEventListener('keydown', k); window.__lenis?.start(); document.body.style.overflow = o }
  }, [open, list.length])
  useEffect(() => { if (!open) return; [1, -1].forEach(d => { const n = list[(index + d + list.length) % list.length]; if (n) { const im = new Image(); im.src = img(n.id) } }) }, [index, open])
  return (
    <AnimatePresence>
      {open && (
        <motion.div key="lb" role="dialog" aria-modal="true" aria-label={t(KIND[it.kind].cap)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}
          className={`fixed inset-0 z-[90] flex flex-col bg-[#0f0e0d]/95 text-[#ece7df] backdrop-blur-sm ${T.sans}`} onClick={() => setIndex(null)}>
          <div className="flex h-16 shrink-0 items-center justify-between px-5 md:px-10" onClick={e => e.stopPropagation()}>
            <span className="text-[12px] font-semibold tabular-nums tracking-[.16em] text-[#ece7df]/60">{pad(index + 1)} / {pad(list.length)}</span>
            <button onClick={() => setIndex(null)} aria-label={t({ en: 'Close', it: 'Chiudi' })} className="grid h-10 w-10 place-items-center rounded-full bg-white/10 transition-colors hover:bg-white hover:text-black">
              <svg width="14" height="14" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.5"><path d="M1 1l12 12M13 1 1 13" /></svg>
            </button>
          </div>
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 md:px-24">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.img key={it.id} src={img(it.id)} alt={t(KIND[it.kind].cap)} decoding="async" draggable={false}
                initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.45, ease: EASE }}
                drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.35} onDragEnd={(e, i) => { if (i.offset.x < -70) go(1); else if (i.offset.x > 70) go(-1) }}
                onClick={e => e.stopPropagation()}
                className={`max-h-full max-w-full touch-pan-y select-none rounded-[4px] object-contain shadow-[0_40px_120px_-30px_rgba(0,0,0,.8)] ${it.kind === 'sketch' ? 'bg-[#f3ead9] p-4 md:p-8' : ''}`} />
            </AnimatePresence>
            {[-1, 1].map(d => (
              <button key={d} onClick={e => { e.stopPropagation(); go(d) }} aria-label={d < 0 ? t({ en: 'Previous', it: 'Precedente' }) : t({ en: 'Next', it: 'Successivo' })}
                className={`absolute top-1/2 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 transition-colors hover:bg-white hover:text-black md:grid ${d < 0 ? 'left-8' : 'right-8'}`}>
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ transform: d < 0 ? 'scaleX(-1)' : '' }}><path d="M2 9h13M10 4l5 5-5 5" /></svg>
              </button>
            ))}
          </div>
          <div className="flex h-16 shrink-0 items-center justify-between gap-4 px-5 md:px-10" onClick={e => e.stopPropagation()}>
            <span className={`${T.serif} text-[22px] italic`}>{t(KIND[it.kind].cap)}</span>
            <span className="text-[11px] uppercase tracking-[.16em] text-[#ece7df]/45">{t({ en: '← → · swipe · Esc', it: '← → · scorri · Esc' })}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* kinetic headline: the word for the active filter lights up ochre, the others recede */
function Headline({ filter }) {
  const { t } = useLang()
  const words = ['sketch', 'render', 'build']
  return (
    <h2 className={`${T.serif} text-[13.5vw] leading-[.9] tracking-[-.02em] md:text-[7.4vw] 2xl:text-[108px]`}>
      {words.map((k, i) => {
        const on = filter === 'all' || filter === k
        return (
          <span key={k} className="mr-[.22em] inline-block overflow-hidden pb-[.08em] align-bottom">
            <motion.span className="inline-block" initial={{ y: '105%' }} whileInView={{ y: 0 }} viewport={{ once: true }} transition={{ duration: 1.1, ease: EASE, delay: i * 0.1 }}>
              <motion.span className={`inline-block ${i === 2 ? 'italic' : ''}`} animate={{ opacity: on ? 1 : 0.22, color: filter === k ? '#b06a35' : '#151412' }} transition={{ duration: 0.6, ease: EASE }}>{t(KIND[k].word)}</motion.span>
            </motion.span>
          </span>
        )
      })}
    </h2>
  )
}

function IsraelRow() {
  const { t } = useLang()
  return (
    <div className="mx-auto mt-16 max-w-[1440px] px-5 md:mt-20 md:px-10">
      <div className="grid items-baseline gap-y-3 border-y border-[#151412]/15 py-5 md:grid-cols-[180px_1fr_1fr_1fr] md:gap-x-8">
        <div className="text-[11px] font-semibold uppercase tracking-[.22em] text-[#b06a35]">{t({ en: 'Selected · Israel', it: 'Selezione · Israele' })}</div>
        {WORKS.israel.map((p, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: EASE, delay: i * 0.08 }}
            className="group flex items-baseline gap-3 md:block">
            <span className="text-[11px] font-semibold tabular-nums text-[#151412]/35 md:mr-2">{pad(i + 1)}</span>
            <span className={`${T.serif} text-[22px] leading-[1.1] md:text-[24px]`}>{t(p.t)}</span>
            <span className="ml-auto text-[11px] font-semibold uppercase tracking-[.14em] text-[#151412]/50 md:ml-0 md:mt-1 md:block">{p.p}</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default function Works() {
  const { t } = useLang()
  const mobile = useIsMobile()
  const [filter, setFilter] = useState('all')
  const [index, setIndex] = useState(null)
  const list = useMemo(() => ITEMS.filter(it => filter === 'all' || it.kind === filter), [filter])
  const open = it => setIndex(list.findIndex(x => x.id === it.id))
  return (
    <section id="works" className={`relative overflow-hidden bg-[#ece7df] py-20 text-[#151412] md:py-28 ${T.sans}`}>
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[.22em] text-[#b06a35]"><span className="h-px w-8 bg-current opacity-60" />{t({ en: '04 — Works', it: '04 — Progetti' })}</div>
        <div className="mt-5 grid items-end gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8"><Headline filter={filter} /></div>
          <p className="max-w-[36ch] text-[15px] leading-relaxed text-[#151412]/65 lg:col-span-4 lg:justify-self-end">{t({ en: 'A contact sheet of the practice — the hand sketch, the render, and the site where it became real.', it: 'Il provino dello studio — lo schizzo a mano, il render e il cantiere dove diventa realtà.' })}</p>
        </div>
        <div className="-mx-5 mt-8 overflow-x-auto px-5 [scrollbar-width:none] md:mx-0 md:mt-10 md:px-0"><Tabs filter={filter} setFilter={setFilter} /></div>
      </div>
      <div className="mt-6 md:mt-8">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={filter} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.5, ease: EASE }}>
            <Strip list={list} h={mobile ? 150 : 250} onOpen={open} />
          </motion.div>
        </AnimatePresence>
      </div>
      <IsraelRow />
      <Lightbox list={list} index={index} setIndex={setIndex} />
    </section>
  )
}
