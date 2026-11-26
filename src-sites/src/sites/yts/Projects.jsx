import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useMotionValue, useTransform } from 'framer-motion'
import { useLang } from './i18n'
import { T, COMO, PALAZZO, SARDEGNA, img } from './data'
import { D, S, E, Display, Eyebrow, CineStyle, ask } from './cine'

/* PROJECTS (V8) — Delta's colourful product carousel, translated: a draggable, scroll-snapping row of
   project tiles on rich colour grounds. Each tile = his render on a lifted card + big condensed name.
   The active tile's name is echoed huge underneath (Delta's "VIETNAM" line). Named projects jump to
   their chapter; untitled studio renders open a lightbox (captions stay generic — honesty). */

const TILES = [
  { k: 'como', name: ['IL GIARDINO', 'DI TEODOLINDA'], short: 'Teodolinda', label: { en: 'Residences · Lake Como', it: 'Residenze · Lago di Como' }, place: COMO.place, bg: '#3f4a26', glow: '120,140,70', id: 5, href: '#como' },
  { k: 'palazzo', name: ['PALAZZO', 'CAMPANI'], short: 'Campani', label: { en: 'Restoration · Tuscany', it: 'Restauro · Toscana' }, place: PALAZZO.place, bg: '#8f4422', glow: '220,130,70', id: 148, href: '#palazzo' },
  { k: 'sardegna', name: ['WATERFRONT', 'SARDEGNA'], short: 'Sardegna', label: { en: 'In preparation', it: 'In preparazione' }, place: SARDEGNA.place, bg: '#1d4a63', glow: '90,160,200', id: null, href: '#contact' },
  { k: 'curve', name: ['CURVED', 'BALCONIES'], short: { en: 'Curve', it: 'Curva' }, label: { en: 'Studio work · Render', it: 'Lavoro dello studio · Render' }, place: { en: 'Residential · concept', it: 'Residenziale · concept' }, bg: '#a77a3a', glow: '240,200,130', id: 78 },
  { k: 'tower', name: ['STACKED', 'VOLUMES'], short: { en: 'Tower', it: 'Torre' }, label: { en: 'Studio work · Render', it: 'Lavoro dello studio · Render' }, place: { en: 'Tower · concept', it: 'Torre · concept' }, bg: '#5a2433', glow: '200,90,110', id: 40 },
  { k: 'fold', name: ['FOLDED', 'ROOF'], short: { en: 'Fold', it: 'Piega' }, label: { en: 'Studio work · Render', it: 'Lavoro dello studio · Render' }, place: { en: 'Public building · concept', it: 'Edificio pubblico · concept' }, bg: '#25504c', glow: '110,190,180', id: 112 },
]

/* thin line-art coast for the tile that has no images yet (honest: nothing to show) */
function Coast() {
  return (
    <svg viewBox="0 0 400 300" className="h-full w-full" fill="none" stroke="#efe8dc" strokeWidth="1.1" strokeLinecap="round">
      <motion.path d="M0 190 C60 170 90 205 140 188 S230 150 280 172 S360 196 400 176" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 2.4, ease: E }} />
      {[0, 1, 2, 3].map(i => (
        <motion.path key={i} d={`M${20 + i * 18} ${222 + i * 16} C${110 + i * 10} ${212 + i * 16} ${200} ${236 + i * 16} ${380 - i * 14} ${218 + i * 16}`} strokeOpacity={0.5 - i * 0.1}
          initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 2, ease: E, delay: 0.3 + i * 0.15 }} />
      ))}
      <motion.circle cx="300" cy="86" r="26" strokeOpacity=".7" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.8, ease: E, delay: 0.6 }} />
      <path d="M170 186 v-38 h46 v26 M216 160 h30 v20" strokeOpacity=".55" strokeDasharray="3 5" />
    </svg>
  )
}

function Tile({ tl, i, onOpen, dragged }) {
  const { t } = useLang()
  const go = e => {
    if (dragged.current) { e.preventDefault(); return }
    if (tl.interest) ask(tl.interest)
    if (!tl.href) { e.preventDefault(); onOpen(tl) }
  }
  return (
    <a href={tl.href || '#'} onClick={go} data-tile={i} draggable={false}
      aria-label={`${tl.name.join(' ')} — ${t(tl.label)}`}
      className="group relative flex aspect-[4/5] w-[78vw] max-w-[440px] shrink-0 snap-start flex-col overflow-hidden rounded-[14px] p-5 text-[#efe8dc] outline-none transition-transform duration-700 [transition-timing-function:cubic-bezier(.16,1,.3,1)] hover:-translate-y-2 focus-visible:ring-2 focus-visible:ring-[#c3a15e] sm:w-[46vw] md:p-7 lg:w-[27vw]"
      style={{ background: tl.bg }}>
      <span aria-hidden className="pointer-events-none absolute inset-0 transition-opacity duration-700 group-hover:opacity-100" style={{ opacity: 0.75, background: `radial-gradient(70% 55% at 50% 42%, rgba(${tl.glow},.55), transparent 70%)` }} />
      <span aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_55%,rgba(0,0,0,.28))]" />
      <span className={`${T.sans} relative flex items-center justify-between text-[11px] font-semibold uppercase tracking-[.22em]`}>
        <span className="flex items-center gap-2.5"><span className="tabular-nums text-[#efe8dc]/60">0{i + 1}</span><span className="h-3 w-px bg-[#efe8dc]/35" />{t(tl.label)}</span>
      </span>
      {/* the render, lifted on its own card */}
      <span className="relative mx-auto mt-5 block w-[86%] flex-1 md:mt-6">
        <span className="absolute inset-0 block overflow-hidden rounded-[8px] shadow-[0_30px_60px_-24px_rgba(0,0,0,.65)] ring-1 ring-black/10 transition-all duration-700 [transition-timing-function:cubic-bezier(.16,1,.3,1)] group-hover:-translate-y-2 group-hover:rotate-0 group-hover:shadow-[0_44px_80px_-26px_rgba(0,0,0,.75)]"
          style={{ transform: `rotate(${i % 2 ? 1.6 : -1.6}deg)` }}>
          {tl.id
            ? <img src={img(tl.id, true)} alt="" loading="lazy" decoding="async" draggable={false} className="yts-grade h-full w-full select-none object-cover transition-transform duration-[1200ms] [transition-timing-function:cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.06]" />
            : <span className="flex h-full w-full items-center justify-center bg-[#163c52] p-4"><Coast /></span>}
        </span>
      </span>
      <span className="relative mt-5 flex items-end justify-between gap-3 md:mt-7">
        <span>
          <span className={`${D} yts-d block text-[clamp(30px,8.2vw,44px)] md:text-[clamp(40px,3.5vw,58px)]`}>{tl.name[0]}<br />{tl.name[1]}</span>
          <span className={`${T.sans} mt-2 block text-[11px] font-semibold uppercase tracking-[.2em] text-[#efe8dc]/70`}>{t(tl.place)}</span>
        </span>
        <span aria-hidden className="mb-1 grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#efe8dc] text-[#0b0a08] transition-transform duration-500 group-hover:-rotate-45">
          {tl.href
            ? <svg width="14" height="14" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M2 9h13M10 4l5 5-5 5" /></svg>
            : <svg width="14" height="14" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M9 2v14M2 9h14" /></svg>}
        </span>
      </span>
    </a>
  )
}

function Lightbox({ tile, close }) {
  const { t } = useLang()
  useEffect(() => {
    if (!tile) return
    window.__lenis?.stop(); const o = document.body.style.overflow; document.body.style.overflow = 'hidden'
    const k = e => e.key === 'Escape' && close(); addEventListener('keydown', k)
    return () => { removeEventListener('keydown', k); window.__lenis?.start(); document.body.style.overflow = o }
  }, [tile])
  return createPortal(
    <AnimatePresence>
      {tile && (
        <motion.div key="plb" role="dialog" aria-modal="true" aria-label={tile.name.join(' ')} onClick={close}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .35 }}
          className={`fixed inset-0 z-[95] flex flex-col bg-[#0b0a08]/[.96] pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)] text-[#efe8dc] backdrop-blur-md ${T.sans}`}>
          <div className="flex h-16 shrink-0 items-center justify-between px-5 md:px-10">
            <span className="text-[11px] font-semibold uppercase tracking-[.22em] text-[#efe8dc]/60">{t(tile.label)}</span>
            <button onClick={close} aria-label={t({ en: 'Close', it: 'Chiudi' })} className="grid h-11 w-11 place-items-center rounded-full border border-[rgba(239,232,220,.2)] transition-colors hover:border-[#c3a15e] hover:bg-[#c3a15e] hover:text-[#0b0a08]">
              <svg width="14" height="14" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.5"><path d="M1 1l12 12M13 1 1 13" /></svg>
            </button>
          </div>
          <div className="flex min-h-0 flex-1 items-center justify-center px-4 md:px-20">
            <motion.img src={img(tile.id)} alt={`${tile.name.join(' ')} — ${t(tile.label)}`} onClick={e => e.stopPropagation()}
              initial={{ opacity: 0, scale: .96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: .6, ease: E }}
              className="yts-grade max-h-full max-w-full rounded-[6px] object-contain shadow-[0_40px_120px_-30px_rgba(0,0,0,.8)]" />
          </div>
          <div className="flex min-h-16 items-center px-5 py-3 md:px-10">
            <span className={`${D} yts-d text-[28px] md:text-[34px]`}>{tile.name.join(' ')}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}

/* mouse drag with inertia (touch = native swipe); snap is suspended while dragging */
function useDrag(ref, dragged) {
  useEffect(() => {
    const el = ref.current; if (!el) return
    let s = null, raf = 0
    const down = e => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return
      cancelAnimationFrame(raf)
      s = { x: e.clientX, sl: el.scrollLeft, v: 0, lx: e.clientX, lt: performance.now() }
      dragged.current = false
      addEventListener('pointermove', move); addEventListener('pointerup', up)
    }
    const move = e => {
      const dx = e.clientX - s.x
      if (Math.abs(dx) > 6 && !dragged.current) { dragged.current = true; el.style.scrollSnapType = 'none'; el.style.cursor = 'grabbing' }
      if (!dragged.current) return
      el.scrollLeft = s.sl - dx
      const now = performance.now(), dt = Math.max(1, now - s.lt)
      s.v = s.v * 0.6 + ((e.clientX - s.lx) / dt) * 0.4; s.lx = e.clientX; s.lt = now
    }
    const up = () => {
      removeEventListener('pointermove', move); removeEventListener('pointerup', up)
      el.style.cursor = ''
      if (!dragged.current) return
      let v = s.v * 16
      const step = () => {
        if (Math.abs(v) < 0.6) { el.style.scrollSnapType = ''; return }
        el.scrollLeft -= v; v *= 0.92; raf = requestAnimationFrame(step)
      }
      raf = requestAnimationFrame(step)
      setTimeout(() => { dragged.current = false }, 50)
    }
    el.addEventListener('pointerdown', down)
    return () => { el.removeEventListener('pointerdown', down); removeEventListener('pointermove', move); removeEventListener('pointerup', up); cancelAnimationFrame(raf) }
  }, [])
}

function Bar({ prog }) {
  const x = useTransform(prog, v => `${v * 100}%`)
  return (
    <div className="relative h-px flex-1 bg-[rgba(239,232,220,.14)]">
      <motion.span style={{ left: x }} className="absolute -top-[3px] block h-[7px] w-[7px] -translate-x-1/2 rounded-full bg-[#c3a15e]" />
      <motion.span style={{ width: x }} className="absolute left-0 top-0 block h-px bg-[#c3a15e]/70" />
    </div>
  )
}

export default function Projects() {
  const { t } = useLang()
  const row = useRef(null), dragged = useRef(false)
  const [active, setActive] = useState(0)
  const [open, setOpen] = useState(null)
  const prog = useMotionValue(0)
  useDrag(row, dragged)
  useEffect(() => {
    const el = row.current; if (!el) return
    const f = () => {
      const m = el.scrollWidth - el.clientWidth
      prog.set(m > 0 ? el.scrollLeft / m : 0)
      const tiles = el.querySelectorAll('[data-tile]'); const left = el.getBoundingClientRect().left
      let best = 0, bd = 1e9
      tiles.forEach((n, i) => { const d = Math.abs(n.getBoundingClientRect().left - left - parseFloat(getComputedStyle(el).paddingLeft || 0)); if (d < bd) { bd = d; best = i } })
      if (m > 0 && el.scrollLeft >= m - 4) best = tiles.length - 1
      setActive(a => (a === best ? a : best))
    }
    f(); el.addEventListener('scroll', f, { passive: true }); addEventListener('resize', f)
    return () => { el.removeEventListener('scroll', f); removeEventListener('resize', f) }
  }, [])
  const nudge = d => { const el = row.current; const n = el.querySelector('[data-tile]'); el.scrollBy({ left: d * (n ? n.offsetWidth + 16 : el.clientWidth * .8), behavior: 'smooth' }) }
  const cur = TILES[active]
  return (
    <section id="projects" className={`relative isolate overflow-x-clip bg-[#0b0a08] py-20 text-[#efe8dc] md:py-28 ${T.sans}`} aria-label={t({ en: 'Projects', it: 'Progetti' })}>
      <CineStyle />
      {/* the active tile's colour bleeds into the page, like Delta's carousel */}
      <motion.div aria-hidden className="pointer-events-none absolute inset-0 -z-10" animate={{ background: `radial-gradient(60% 46% at 50% 62%, ${cur.bg}66, transparent 72%)` }} transition={{ duration: 1.2, ease: E }} />
      <div className="mx-auto max-w-[1440px] px-5 text-center md:px-10">
        <Eyebrow center>{t({ en: 'Projects', it: 'Progetti' })}</Eyebrow>
        <Display center className="mt-5 text-[clamp(46px,13.5vw,64px)] md:text-[clamp(72px,8.4vw,136px)]"
          lines={t({ en: [['FROM THE HILLSIDE'], [{ c: 'to' }, 'THE PALAZZO']], it: [['DALLA COLLINA'], [{ c: 'al' }, 'PALAZZO']] })} />
        <p className="mx-auto mt-5 max-w-[46ch] text-[15px] leading-relaxed text-[#efe8dc]/65 md:text-[16px]">{t({ en: 'Residences in Italy developed by YTS Group, and a few of the studio’s own designs. Drag the row — open any project.', it: 'Le residenze in Italia sviluppate da YTS Group e alcuni progetti dello studio. Trascina la fila — apri un progetto.' })}</p>
      </div>
      <div ref={row} onDragStart={e => e.preventDefault()}
        className="mt-10 flex cursor-grab snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain scroll-px-5 px-5 pb-4 pt-3 [scrollbar-width:none] md:mt-14 md:scroll-px-10 md:px-10 [&::-webkit-scrollbar]:hidden">
        {TILES.map((tl, i) => (
          <motion.div key={tl.k} className="shrink-0 snap-start" initial={{ opacity: 0, x: 60 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-5%' }} transition={{ duration: 1, ease: E, delay: i * .07 }}>
            <Tile tl={tl} i={i} onOpen={setOpen} dragged={dragged} />
          </motion.div>
        ))}
        <span aria-hidden className="w-1 shrink-0 md:w-6" />
      </div>
      <div className="mx-auto mt-6 flex max-w-[1440px] items-center gap-5 px-5 md:px-10">
        <span className="text-[11px] font-semibold tabular-nums tracking-[.2em] text-[#efe8dc]/60">0{active + 1} / 0{TILES.length}</span>
        <Bar prog={prog} />
        <div className="flex gap-2">
          {[-1, 1].map(d => (
            <button key={d} onClick={() => nudge(d)} aria-label={d < 0 ? t({ en: 'Previous', it: 'Precedente' }) : t({ en: 'Next', it: 'Successivo' })}
              className="grid h-11 w-11 place-items-center rounded-full border border-[rgba(239,232,220,.2)] transition-colors hover:border-[#c3a15e] hover:bg-[#c3a15e] hover:text-[#0b0a08]">
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ transform: d < 0 ? 'scaleX(-1)' : '' }}><path d="M2 9h13M10 4l5 5-5 5" /></svg>
            </button>
          ))}
        </div>
      </div>
      {/* Delta's echo line: the active project's name, huge */}
      <div className="relative mt-8 h-[1.1em] overflow-hidden text-center text-[clamp(40px,12vw,56px)] md:mt-10 md:text-[clamp(56px,7vw,112px)]" aria-live="polite">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span key={cur.k} className={`${D} yts-d absolute inset-x-0 top-0 block text-[#efe8dc]/[.13]`}
            initial={{ y: '100%' }} animate={{ y: '0%' }} exit={{ y: '-100%' }} transition={{ duration: .8, ease: E }}>
            {typeof cur.short === 'string' ? cur.short : t(cur.short)}
          </motion.span>
        </AnimatePresence>
      </div>
      <Lightbox tile={open} close={() => setOpen(null)} />
    </section>
  )
}
