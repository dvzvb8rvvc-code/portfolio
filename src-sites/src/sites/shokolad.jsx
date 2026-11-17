import React, { useRef, useState, useEffect, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, useSpring, useInView, AnimatePresence, MotionConfig } from 'framer-motion'
import { ArrowRight, ArrowUpRight, Phone, MapPin, MessageCircle } from 'lucide-react'
import '../lib/base.css'
import { useSmooth, Ribbon, LineReveal, Reveal, Scramble, useBooking, phoneFocus, CheckDraw, MapFrame, CallBar, tel, useLite, IG, TG } from '../lib/kit'
import { click, setMuted } from './shokolad-sfx'

const DeviceScene = lazy(() => import('./shokolad3d'))

const b = {
  name: 'Шоколад', addr: 'ул. Чернышевского, 10А, офис 108', floor: 'этаж 1', city: 'Минск',
  phone: '+375 33 686-40-21', viberPhone: '+375 29 637-40-21', viber: 'viber://chat?number=%2B375296374021',
  ig: 'http://instagram.com/soliarii_shokolad', tg: 'https://t.me/soliarii_shokolad', rating: '4,9', rev: 84, oid: '1272158522',
}
const BASE = '#e9e7e2', INK = '#1b1714', OR = '#ff5b1f', BL = '#2f5bea', COCOA = '#5b3a26'
const MONO = "font-['IBM_Plex_Mono',monospace]", SANS = "font-['Inter_Tight',sans-serif]"

/* ---------------- tiny pixel icons ---------------- */
const PIX = {
  sun: ['..x..x..', 'x......x', '..xxxx..', '.xxxxxx.', '.xxxxxx.', '..xxxx..', 'x......x', '..x..x..'],
  chat: ['xxxxxxx.', 'x.....x.', 'x.x.x.x.', 'x.....x.', 'xxxxxxx.', '.x......', 'x.......', '........'],
  door: ['.xxxxx..', '.x...x..', '.x...x..', '.x..xx..', '.x...x..', '.x...x..', '.xxxxx..', 'xxxxxxx.'],
  bottle: ['...xx...', '...xx...', '..xxxx..', '.x....x.', '.x.xx.x.', '.x.xx.x.', '.x....x.', '..xxxx..'],
  clock: ['..xxxx..', '.x....x.', 'x..x...x', 'x..x...x', 'x..xxx.x', 'x......x', '.x....x.', '..xxxx..'],
  star: ['...x....', '...x....', '.xxxxx..', '..xxx...', '..x.x...', '.x...x..', '........', '........'],
}
function Pix({ k, size = 32, color = INK, className = '' }) {
  return (
    <svg viewBox="0 0 8 8" width={size} height={size} className={className} shapeRendering="crispEdges" aria-hidden="true">
      {PIX[k].flatMap((row, y) => [...row].map((c, x) => c === 'x' ? <rect key={x + '-' + y} x={x} y={y} width="1" height="1" fill={color} /> : null))}
    </svg>
  )
}

/* ---------------- pinned film: exploded manual ---------------- */
// ranges must match shokolad3d.jsx
const R = [[0.2, 0.34], [0.34, 0.48], [0.48, 0.62], [0.62, 0.76], [0.76, 0.9]]
const PARTS = [
  { n: '01', t: 'Пульт', d: 'Консультация: администратор подбирает режим под вашу кожу.' },
  { n: '02', t: 'Лампы', d: 'Время сеанса — по фототипу, а не на глаз.' },
  { n: '03', t: 'Кабина', d: 'Чистая и подготовленная к каждому гостю.' },
  { n: '04', t: 'Средства', d: 'Подскажем, что нанести до и после загара.' },
  { n: '05', t: 'Курс', d: 'Сеансы с паузами — ровный оттенок без спешки.' },
]
function PartRow({ p, i, c }) {
  const [a, z] = R[i]
  const o = useTransform(p, [a - 0.02, a, z - 0.01, z], [0.35, 1, 1, 0.35])
  const x = useTransform(p, [a - 0.02, a, z - 0.01, z], [0, 10, 10, 0])
  const bg = useTransform(p, [a - 0.02, a, z - 0.01, z], [BL, OR, OR, BL])
  return (
    <motion.li style={{ opacity: o, x }} className="flex gap-4 border-t border-[#1b1714]/15 py-4">
      <motion.span style={{ background: bg }} className={`${MONO} grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-bold text-white`}>{c.n}</motion.span>
      <div><p className={`${SANS} text-[19px] font-bold tracking-[-0.02em]`}>{c.t}</p><p className="mt-1 text-[14.5px] leading-snug text-[#1b1714]/65">{c.d}</p></div>
    </motion.li>
  )
}
function MobCaption({ p, i, c }) {
  const [a, z] = R[i]
  const o = useTransform(p, [a - 0.005, a + 0.02, z - 0.02, z], [0, 1, 1, 0])
  const y = useTransform(p, [a - 0.005, a + 0.02, z - 0.02, z], [20, 0, 0, -16])
  return (
    <motion.div style={{ opacity: o, y }} className="absolute inset-x-0 bottom-0 rounded-xl border border-[#1b1714]/15 bg-[#f4f2ee]/95 p-5">
      <p className={`${MONO} flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.14em]`}><span className="grid h-6 w-6 place-items-center rounded-full text-white" style={{ background: OR }}>{c.n}</span>{c.t}</p>
      <p className="mt-2 text-[16px] leading-snug">{c.d}</p>
    </motion.div>
  )
}
function LiteDevice() {
  return (
    <div className="absolute right-[6%] top-[20%] hidden aspect-[3/2] w-[38vw] rounded-[28px] border border-[#1b1714]/10 bg-[#e7e4dd] p-6 shadow-[0_40px_60px_-30px_rgba(59,38,24,.5)] md:flex md:gap-4">
      <div className="flex flex-1 justify-around rounded-lg border-[6px] p-3" style={{ borderColor: COCOA, background: '#24180f' }}>{Array.from({ length: 7 }, (_, i) => <span key={i} className="w-2 rounded-full bg-[#ffb38a] shadow-[0_0_14px_#ff7a2a]" />)}</div>
      <div className="flex w-[24%] flex-col items-center gap-4 rounded-lg p-3" style={{ background: COCOA }}><span className="h-8 w-full rounded bg-[#17110c]" /><span className="h-10 w-10 rounded-full" style={{ background: OR }} /><span className="h-8 w-8 rounded-full bg-[#e7e4dd]" /></div>
    </div>
  )
}
function Film({ lite }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.35 })
  const near = useInView(ref, { margin: '300px 0px' })
  const [mounted, setMounted] = useState(false)
  useEffect(() => { if (near) setMounted(true) }, [near])
  const heroO = useTransform(p, [0, 0.1], [1, 0])
  const heroY = useTransform(p, [0, 0.1], [0, -40])
  const heroPE = useTransform(p, v => (v < 0.05 ? 'auto' : 'none'))
  const listO = useTransform(p, [0.13, 0.2, 0.9, 0.95], [0, 1, 1, 0])
  const endO = useTransform(p, [0.92, 0.98], [0, 1])
  const endPE = useTransform(p, v => (v > 0.94 ? 'auto' : 'none'))
  const bar = useTransform(p, [0, 1], ['0%', '100%'])
  const bg = useTransform(p, [0, 0.4, 0.9, 1], [BASE, '#e6e1d9', '#e6e1d9', BASE])
  const pct = useTransform(p, v => String(Math.round(v * 100)).padStart(3, '0'))
  return (
    <motion.section ref={ref} id="top" className="relative h-[460vh]" style={{ background: bg }}>
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 opacity-[.5]" style={{ backgroundImage: 'radial-gradient(#1b1714 0.8px, transparent 0.8px)', backgroundSize: '24px 24px', maskImage: 'radial-gradient(ellipse at 60% 50%, #000 20%, transparent 75%)', WebkitMaskImage: 'radial-gradient(ellipse at 60% 50%, #000 20%, transparent 75%)' }} />
        <div className="absolute inset-0">
          {lite ? <LiteDevice /> : mounted && <Suspense fallback={null}><DeviceScene progress={p} active={near} /></Suspense>}
        </div>
        {/* hero */}
        <motion.div style={{ opacity: heroO, y: heroY, pointerEvents: heroPE }} className="absolute inset-x-0 bottom-[96px] px-5 md:bottom-auto md:top-[15%] md:px-10">
          <p className={`${MONO} mb-5 flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[.14em]`}>
            <span className="rounded-sm px-1.5 py-0.5 text-white" style={{ background: OR }}>ШК-108</span><span>студия загара · минск</span>
          </p>
          <h1 className={`${SANS} max-w-[760px] text-[clamp(46px,7.4vw,118px)] font-extrabold leading-[.9] tracking-[-0.055em]`}>
            <LineReveal delay={0.1}>Загар,</LineReveal>
            <LineReveal delay={0.2}>настроенный</LineReveal>
            <LineReveal delay={0.3}><span style={{ color: COCOA }}>под вас.</span></LineReveal>
          </h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="mt-6 max-w-[380px] text-[16px] leading-snug text-[#1b1714]/70">Студия загара на Чернышевского, 10А. Ровный оттенок без спешки — с подбором режима под кожу.</motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.85 }} className="mt-7 hidden flex-wrap gap-3 md:flex">
            <a href="#panel" className={`${MONO} inline-flex h-12 items-center gap-2 rounded-md px-5 text-[13px] font-bold uppercase tracking-[.08em] text-white`} style={{ background: OR }}>Подобрать режим <ArrowRight size={16} /></a>
            <a href="#book" className={`${MONO} inline-flex h-12 items-center rounded-md border-2 border-[#1b1714] px-5 text-[13px] font-bold uppercase tracking-[.08em] hover:bg-[#1b1714] hover:text-white`}>Записаться</a>
          </motion.div>
          <p className={`${MONO} mt-7 hidden text-[11px] uppercase tracking-[.14em] text-[#1b1714]/55 md:block`}>↘ ручки и кнопки на устройстве нажимаются</p>
        </motion.div>
        {/* exploded manual list */}
        <motion.div style={{ opacity: listO }} className="pointer-events-none absolute left-10 top-[14%] hidden w-[340px] md:block">
          <p className={`${MONO} text-[11px] font-bold uppercase tracking-[.14em]`}>Схема 1 · ваш визит в разобранном виде</p>
          <ol className="mt-4 border-b border-[#1b1714]/15">{PARTS.map((c, i) => <PartRow key={c.n} p={p} i={i} c={c} />)}</ol>
        </motion.div>
        <motion.div style={{ opacity: listO }} className="pointer-events-none absolute inset-x-4 bottom-[92px] h-[120px] md:hidden">
          {PARTS.map((c, i) => <MobCaption key={c.n} p={p} i={i} c={c} />)}
        </motion.div>
        <motion.div style={{ opacity: endO, pointerEvents: endPE }} className="absolute inset-x-5 bottom-[96px] md:bottom-auto md:left-10 md:right-auto md:top-[20%]">
          <p className={`${MONO} text-[11px] font-bold uppercase tracking-[.14em]`}>Сборка завершена</p>
          <h2 className={`${SANS} mt-3 text-[clamp(36px,5vw,72px)] font-extrabold leading-[.92] tracking-[-0.05em]`}>Всё собрано.<br /><span style={{ color: OR }}>Осталось прийти.</span></h2>
          <a href="#panel" className={`${MONO} mt-6 inline-flex h-12 items-center gap-2 rounded-md px-5 text-[13px] font-bold uppercase tracking-[.08em] text-white`} style={{ background: INK }}>К пульту подбора <ArrowRight size={16} /></a>
        </motion.div>
        {/* manual ruler */}
        <div className={`${MONO} pointer-events-none absolute inset-x-5 bottom-[76px] flex items-center gap-3 text-[10px] font-bold uppercase tracking-[.14em] text-[#1b1714]/60 md:inset-x-10 md:bottom-6`}>
          <motion.span>{pct}</motion.span>
          <div className="relative h-[6px] flex-1 border-x border-[#1b1714]/40" style={{ backgroundImage: 'repeating-linear-gradient(90deg,rgba(27,23,20,.35) 0 1px,transparent 1px 10%)' }}>
            <motion.div style={{ width: bar, background: OR }} className="absolute left-0 top-[2px] h-[2px]" />
          </div>
          <span>100</span>
        </div>
      </div>
    </motion.section>
  )
}

/* ---------------- knob ---------------- */
function Knob({ label, steps, value, onChange, color, size = 112 }) {
  const ref = useRef(null), drag = useRef(null)
  const span = 270, a0 = -135
  const ang = a0 + (steps.length > 1 ? (span * value) / (steps.length - 1) : 0)
  const set = v => { const n = Math.max(0, Math.min(steps.length - 1, v)); if (n !== value) { click(n > value ? 2100 : 1700); onChange(n) } }
  const fromPoint = e => {
    const r = ref.current.getBoundingClientRect()
    let a = (Math.atan2(e.clientX - (r.left + r.width / 2), -(e.clientY - (r.top + r.height / 2))) * 180) / Math.PI
    a = Math.max(a0, Math.min(-a0, a))
    return Math.round(((a - a0) / span) * (steps.length - 1))
  }
  const down = e => { drag.current = { x: e.clientX, y: e.clientY, moved: false }; e.currentTarget.setPointerCapture(e.pointerId) }
  const move = e => { if (!drag.current) return; if (Math.hypot(e.clientX - drag.current.x, e.clientY - drag.current.y) > 6) drag.current.moved = true; if (drag.current.moved) set(fromPoint(e)) }
  const up = () => { if (drag.current && !drag.current.moved) set(value + 1 > steps.length - 1 ? 0 : value + 1); drag.current = null }
  const key = e => { if (['ArrowRight', 'ArrowUp'].includes(e.key)) { e.preventDefault(); set(value + 1) } if (['ArrowLeft', 'ArrowDown'].includes(e.key)) { e.preventDefault(); set(value - 1) } }
  return (
    <div className="flex flex-col items-center">
      <p className={`${MONO} mb-3 text-[11px] font-bold uppercase tracking-[.14em]`}>{label}</p>
      <div className="relative" style={{ width: size + 36, height: size + 36 }}>
        {steps.map((s, i) => {
          const a = ((a0 + (span * i) / Math.max(1, steps.length - 1)) * Math.PI) / 180
          const rr = size / 2 + 12
          return <span key={i} className="absolute h-[6px] w-[6px] rounded-full" style={{ left: '50%', top: '50%', transform: `translate(${Math.sin(a) * rr - 3}px, ${-Math.cos(a) * rr - 3}px)`, background: i === value ? color : 'rgba(27,23,20,.25)' }} />
        })}
        <div ref={ref} role="slider" tabIndex={0} aria-label={label} aria-valuemin={0} aria-valuemax={steps.length - 1} aria-valuenow={value} aria-valuetext={steps[value]}
          onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={() => (drag.current = null)} onKeyDown={key}
          className="absolute left-1/2 top-1/2 cursor-grab touch-none rounded-full outline-none focus-visible:ring-4 focus-visible:ring-[#2f5bea]/40 active:cursor-grabbing"
          style={{ width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2, background: '#d7d3cb', boxShadow: 'inset 0 2px 0 rgba(255,255,255,.7), 0 10px 18px -8px rgba(0,0,0,.45), 0 2px 0 #b5b0a6' }}>
          <motion.div animate={{ rotate: ang }} transition={{ type: 'spring', stiffness: 500, damping: 26 }} className="absolute inset-[14%] rounded-full" style={{ background: color, boxShadow: 'inset 0 -6px 10px rgba(0,0,0,.2), inset 0 3px 0 rgba(255,255,255,.35)' }}>
            <span className="absolute left-1/2 top-[8%] h-[30%] w-[5px] -translate-x-1/2 rounded-full bg-white" />
          </motion.div>
        </div>
      </div>
      <p className={`${MONO} mt-2 h-5 text-[12px] font-bold uppercase`}>{steps[value]}</p>
    </div>
  )
}

/* ---------------- panel (value interaction) ---------------- */
const SKIN = ['I · очень светлая', 'II · светлая', 'III · средняя', 'IV · смуглая']
const GOAL = ['лёгкий', 'ровный', 'глубокий']
function plan(skin, goal, first) {
  const base = [[2, 3], [4, 6], [6, 8]][goal]
  const add = skin === 0 ? 2 : skin === 1 ? 1 : 0
  const v = [base[0] + add, base[1] + add]
  const lines = [
    first ? 'Старт: пробный короткий сеанс' : skin <= 1 ? 'Старт: короткий сеанс' : 'Старт: умеренный сеанс',
    `Визитов: примерно ${v[0]}–${v[1]}`,
    'Пауза между сеансами: от 48 ч',
    skin <= 1 ? 'Время прибавляем постепенно' : 'Время — по реакции кожи',
  ]
  const warn = skin === 0 && goal === 2 ? 'Для очень светлой кожи глубокий оттенок — только постепенно. Обсудим на месте.' : ''
  return { lines, v, warn }
}
function Screw({ className }) { return <span aria-hidden="true" className={'absolute h-3 w-3 rounded-full bg-[#c9c4bb] shadow-[inset_0_1px_1px_rgba(0,0,0,.35)] ' + className}><span className="absolute left-1/2 top-1/2 h-[1.5px] w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[#8f897f]" /></span> }

function Panel() {
  const [skin, setSkin] = useState(1), [goal, setGoal] = useState(1), [first, setFirst] = useState(true)
  const pl = plan(skin, goal, first)
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 25%'] })
  const clip = useTransform(scrollYProgress, [0, 1], ['inset(14% 8% 0% 8% round 32px)', 'inset(0% 0% 0% 0% round 0px)'])
  const book = () => {
    click(1200, 0.06)
    const svc = `Сеанс: кожа ${SKIN[skin].split(' · ')[0]}, ${GOAL[goal]} оттенок${first ? ', первый раз' : ''}`
    window.dispatchEvent(new CustomEvent('shk-svc', { detail: svc }))
    const el = document.getElementById('book'); window.__lenis ? window.__lenis.scrollTo(el, { offset: -60 }) : el.scrollIntoView()
  }
  return (
    <motion.section ref={ref} id="panel" style={{ clipPath: clip }} className="relative bg-[#d9d5cd] px-5 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-[1280px]">
        <div className="grid gap-6 md:grid-cols-[1fr_1fr] md:items-end">
          <div>
            <p className={`${MONO} text-[11px] font-bold uppercase tracking-[.14em]`}><span style={{ color: OR }}>■</span> Схема 2 · пульт подбора</p>
            <h2 className={`${SANS} mt-4 text-[clamp(38px,5.6vw,88px)] font-extrabold leading-[.9] tracking-[-0.055em]`}>Покрутите ручки.</h2>
          </div>
          <p className="max-w-[420px] text-[16px] leading-snug text-[#1b1714]/70 md:justify-self-end">Экран предложит бережный план загара. Это ориентир — точное время сеанса подберёт администратор на месте.</p>
        </div>

        <div className="relative mt-12 rounded-[28px] bg-[#efece6] p-5 shadow-[0_2px_0_#fff_inset,0_40px_70px_-35px_rgba(59,38,24,.55)] md:p-10">
          <Screw className="left-4 top-4" /><Screw className="right-4 top-4" /><Screw className="bottom-4 left-4" /><Screw className="bottom-4 right-4" />
          <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
            {/* screen */}
            <div className="rounded-2xl bg-[#17110c] p-5 shadow-[inset_0_0_0_6px_#2a1d15] md:p-7" aria-live="polite">
              <div className={`${MONO} flex justify-between text-[10px] font-bold uppercase tracking-[.14em] text-[#ff6a2a]/60`}><span>шк-108 / план</span><span>{first ? 'первый визит' : 'повторный'}</span></div>
              <AnimatePresence mode="wait">
                <motion.div key={skin + '-' + goal + '-' + first} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className={`${MONO} mt-5 min-h-[170px] text-[14px] leading-[1.75] text-[#ff7a3a] md:text-[15px]`}>
                  <p className="text-[#ffb38a]">&gt; кожа {SKIN[skin]} · {GOAL[goal]}</p>
                  {pl.lines.map((l, i) => <motion.p key={l} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 * i }}>→ {l}</motion.p>)}
                  {pl.warn && <p className="mt-2 text-[#ffd2b8]">! {pl.warn}</p>}
                </motion.div>
              </AnimatePresence>
              <div className="mt-4 flex h-16 items-end gap-[5px]" aria-hidden="true">
                {Array.from({ length: pl.v[1] }, (_, i) => (
                  <motion.span key={i} layout initial={{ height: 0 }} animate={{ height: `${22 + (i / Math.max(1, pl.v[1] - 1)) * 70}%` }} transition={{ delay: i * 0.03 }} className="flex-1" style={{ background: i < pl.v[0] ? '#ff6a2a' : '#5a3a26' }} />
                ))}
              </div>
              <p className={`${MONO} mt-3 text-[10px] uppercase tracking-[.12em] text-[#ff6a2a]/55`}>* сеансы по нарастающей · точное время уточнит администратор</p>
            </div>
            {/* controls */}
            <div className="flex flex-col justify-between gap-8">
              <div className="flex flex-wrap justify-around gap-6">
                <Knob label="Тип кожи" steps={SKIN.map(s => s.split(' · ')[0])} value={skin} onChange={setSkin} color={OR} />
                <Knob label="Оттенок" steps={GOAL} value={goal} onChange={setGoal} color={BL} />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#1b1714]/10 pt-6">
                <button type="button" role="switch" aria-checked={first} onClick={() => { setFirst(v => !v); click(first ? 1500 : 2200) }} className="flex items-center gap-3">
                  <span className="relative h-8 w-14 rounded-full bg-[#d0cbc2] shadow-[inset_0_2px_4px_rgba(0,0,0,.2)]">
                    <motion.span animate={{ x: first ? 26 : 2 }} transition={{ type: 'spring', stiffness: 600, damping: 30 }} className="absolute top-1 h-6 w-6 rounded-full shadow-md" style={{ background: first ? OR : '#f4f2ee' }} />
                  </span>
                  <span className={`${MONO} text-[12px] font-bold uppercase tracking-[.1em]`}>Первый раз</span>
                </button>
                <div className="flex gap-3">
                  <button type="button" onClick={() => { setSkin(1); setGoal(1); setFirst(true); click(1300) }} className={`${MONO} h-12 rounded-md bg-[#cfcac1] px-4 text-[12px] font-bold uppercase tracking-[.1em] shadow-[0_3px_0_#aaa49a] active:translate-y-[3px] active:shadow-none`}>Сброс</button>
                  <button type="button" onClick={book} className={`${MONO} h-12 rounded-md px-5 text-[12px] font-bold uppercase tracking-[.1em] text-white shadow-[0_3px_0_#b8380c] active:translate-y-[3px] active:shadow-none`} style={{ background: OR }}>Записаться с планом</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  )
}

/* ---------------- specs bento ---------------- */
function PixelSun() {
  const [t, setT] = useState(0)
  useEffect(() => { const id = setInterval(() => setT(v => v + 1), 380); return () => clearInterval(id) }, [])
  return (
    <svg viewBox="0 0 16 16" className="h-24 w-24" shapeRendering="crispEdges" aria-hidden="true">
      {Array.from({ length: 256 }, (_, i) => {
        const x = i % 16, y = (i / 16) | 0, d = Math.hypot(x - 7.5, y - 7.5)
        const on = d < 3.6 || (Math.abs(d - 5.6 - (t % 3) * 0.6) < 0.5 && ((x + y + t) % 2 === 0))
        return on ? <rect key={i} x={x} y={y} width="1" height="1" fill={d < 3.6 ? OR : '#ffb38a'} /> : null
      })}
    </svg>
  )
}
function Tile({ children, className = '', n }) {
  return (
    <Reveal className={'relative rounded-2xl border border-[#1b1714]/12 bg-[#f4f2ee] p-6 ' + className}>
      {n && <span className={`${MONO} absolute right-5 top-5 text-[10px] font-bold text-[#1b1714]/40`}>{n}</span>}
      {children}
    </Reveal>
  )
}
function Specs() {
  return (
    <section id="specs" className="px-5 py-24 md:px-10 md:py-32" style={{ background: BASE }}>
      <div className="mx-auto max-w-[1280px]">
        <p className={`${MONO} text-[11px] font-bold uppercase tracking-[.14em]`}><span style={{ color: BL }}>■</span> Схема 3 · характеристики</p>
        <h2 className={`${SANS} mt-4 text-[clamp(38px,5.6vw,88px)] font-extrabold leading-[.9] tracking-[-0.055em]`}>Коротко о студии.</h2>
        <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          <Tile n="S-01" className="col-span-2 row-span-2 flex flex-col justify-between">
            <div className="flex gap-1">{Array.from({ length: 5 }, (_, i) => <Pix key={i} k="star" size={22} color={OR} />)}</div>
            <div>
              <p className={`${MONO} text-[clamp(84px,12vw,170px)] font-bold leading-[.85] tracking-[-0.06em]`}><Scramble text={b.rating} chars="0123456789" /></p>
              <p className="mt-4 text-[16px]">{b.rev} оценки на Яндекс Картах</p>
            </div>
          </Tile>
          <Tile n="S-02" className="col-span-2 flex items-center gap-6 md:col-span-2"><PixelSun /><div><p className={`${SANS} text-[22px] font-bold tracking-[-0.03em]`}>Мягкий старт</p><p className="mt-1 text-[14.5px] text-[#1b1714]/65">Первый сеанс — короткий. Дальше прибавляем по реакции кожи.</p></div></Tile>
          <Tile n="S-03"><Pix k="door" color={BL} /><p className={`${SANS} mt-6 text-[19px] font-bold tracking-[-0.02em]`}>Этаж 1</p><p className="mt-1 text-[14px] text-[#1b1714]/65">Офис 108 — сразу от входа.</p></Tile>
          <Tile n="S-04"><Pix k="chat" color={OR} /><p className={`${SANS} mt-6 text-[19px] font-bold tracking-[-0.02em]`}>Viber, Telegram</p><p className="mt-1 text-[14px] text-[#1b1714]/65">Запишем в мессенджере.</p></Tile>
          <Tile n="S-05"><Pix k="bottle" color={COCOA} /><p className={`${SANS} mt-6 text-[19px] font-bold tracking-[-0.02em]`}>Средства</p><p className="mt-1 text-[14px] text-[#1b1714]/65">Подскажем, что нужно до и после.</p></Tile>
          <Tile n="S-06"><Pix k="clock" color={INK} /><p className={`${SANS} mt-6 text-[19px] font-bold tracking-[-0.02em]`}>Курсом</p><p className="mt-1 text-[14px] text-[#1b1714]/65">Сеансы с паузами — для ровного оттенка.</p></Tile>
        </div>
      </div>
    </section>
  )
}

/* ---------------- catalogue ---------------- */
const SVC = [
  { c: 'SH-01', k: 'sun', t: 'Сеанс загара', d: 'Время подберём по типу кожи и задаче.', col: OR },
  { c: 'SH-02', k: 'star', t: 'Первый визит', d: 'Знакомство, подбор режима, короткий пробный сеанс.', col: BL },
  { c: 'SH-03', k: 'clock', t: 'Курс сеансов', d: 'План с паузами — к отпуску или событию.', col: COCOA },
  { c: 'SH-04', k: 'bottle', t: 'Косметика для загара', d: 'Средства до и после — подскажем на месте.', col: INK },
]
function Catalogue() {
  return (
    <section id="services" className="border-t border-[#1b1714]/10 px-5 py-24 md:px-10 md:py-32" style={{ background: BASE }}>
      <div className="mx-auto max-w-[1280px]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className={`${MONO} text-[11px] font-bold uppercase tracking-[.14em]`}><span style={{ color: COCOA }}>■</span> Схема 4 · каталог</p>
            <h2 className={`${SANS} mt-4 text-[clamp(38px,5.6vw,88px)] font-extrabold leading-[.9] tracking-[-0.055em]`}>Услуги.</h2>
          </div>
          <p className="max-w-[340px] text-[15px] text-[#1b1714]/65">Нажмите «+ в заявку» — услуга подставится в форму записи.</p>
        </div>
        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          {SVC.map((s, i) => (
            <Reveal key={s.c} delay={i * 0.06} className="group flex flex-col rounded-2xl border border-[#1b1714]/12 bg-[#f4f2ee] p-6 transition-transform duration-300 hover:-translate-y-1">
              <div className={`${MONO} flex justify-between text-[10px] font-bold uppercase tracking-[.14em] text-[#1b1714]/45`}><span>{s.c}</span><span>{String(i + 1).padStart(2, '0')}/04</span></div>
              <div className="my-10 grid aspect-[4/3] place-items-center rounded-xl bg-[#e3dfd8]"><Pix k={s.k} size={64} color={s.col} /></div>
              <p className={`${SANS} text-[22px] font-bold tracking-[-0.03em]`}>{s.t}</p>
              <p className="mt-2 flex-1 text-[14.5px] leading-snug text-[#1b1714]/65">{s.d}</p>
              <a href="#book" data-svc={s.t} className={`${MONO} mt-6 inline-flex h-10 w-fit items-center rounded-md border-2 border-[#1b1714] px-3 text-[11px] font-bold uppercase tracking-[.1em] group-hover:bg-[#1b1714] group-hover:text-white`}>+ в заявку</a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------- booking ---------------- */
const DAYS = ['Сегодня', 'Завтра', 'На выходных', 'Другой день']
const TIMES = ['Утро', 'День', 'Вечер']
function Key({ on, children, onClick }) {
  return <button type="button" aria-pressed={!!on} onClick={() => { click(on ? 1500 : 2000); onClick && onClick() }} className={`${MONO} h-11 rounded-md px-4 text-[12.5px] font-bold uppercase tracking-[.06em] transition-all active:translate-y-[2px] ${on ? 'bg-[#1b1714] text-white shadow-[0_2px_0_#000]' : 'bg-[#e3dfd8] shadow-[0_3px_0_#c4bfb6] hover:bg-[#dcd7cf]'}`}>{children}</button>
}
function Book() {
  const bk = useBooking()
  const [step, setStep] = useState(0), [day, setDay] = useState(''), [time, setTime] = useState(''), [via, setVia] = useState('Звонок'), [err, setErr] = useState('')
  const head = useRef(null)
  useEffect(() => { if (step) head.current?.focus() }, [step])
  useEffect(() => { const h = e => { bk.upd('svc', e.detail); setStep(0); setErr('') }; window.addEventListener('shk-svc', h); return () => window.removeEventListener('shk-svc', h) }, [])
  const next = e => {
    e.preventDefault()
    if (step === 0 && !bk.s.svc) return setErr('Выберите услугу')
    if (step === 1 && !day) return setErr('Выберите день')
    setErr('')
    if (step < 2) setStep(step + 1); else bk.submit()
  }
  const names = SVC.map(s => s.t)
  const custom = bk.s.svc && !names.includes(bk.s.svc)
  const titles = ['Что записываем?', 'Когда удобно?', 'Куда ответить?']
  return (
    <section id="book" className="px-5 py-24 md:px-10 md:py-32" style={{ background: '#d9d5cd' }}>
      <div className="mx-auto grid max-w-[1280px] gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className={`${MONO} text-[11px] font-bold uppercase tracking-[.14em]`}><span style={{ color: OR }}>■</span> Схема 5 · запись</p>
          <h2 className={`${SANS} mt-4 text-[clamp(38px,5.6vw,88px)] font-extrabold leading-[.9] tracking-[-0.055em]`}>Три кнопки — и вы записаны.</h2>
          <p className="mt-6 max-w-[360px] text-[16px] text-[#1b1714]/65">Администратор перезвонит и подтвердит время.</p>
          <a href={'tel:' + tel(b.phone)} className={`${MONO} mt-6 inline-block text-[22px] font-bold hover:text-[#ff5b1f]`}>{b.phone}</a>
        </div>
        <div className="relative rounded-[28px] bg-[#efece6] p-6 shadow-[0_2px_0_#fff_inset,0_40px_70px_-35px_rgba(59,38,24,.5)] md:p-10">
          <Screw className="left-4 top-4" /><Screw className="right-4 top-4" /><Screw className="bottom-4 left-4" /><Screw className="bottom-4 right-4" />
          {bk.s.sent ? (
            <div className="py-10 text-center" role="status">
              <CheckDraw className="mx-auto text-[#ff5b1f]" />
              <p className={`${SANS} mt-6 text-[32px] font-extrabold tracking-[-0.04em]`}>Заявка принята</p>
              <p className="mx-auto mt-3 max-w-[380px] text-[#1b1714]/65">Ответим {via === 'Звонок' ? 'звонком' : 'в ' + via}. В готовом сайте заявка сразу придёт вам в Telegram.</p>
              <button type="button" onClick={() => { bk.reset(); setStep(0); setDay(''); setTime('') }} className={`${MONO} mt-8 text-[12px] font-bold uppercase underline underline-offset-4`}>Новая заявка</button>
            </div>
          ) : (
            <form onSubmit={next} noValidate className="pt-2">
              <div className="flex items-center gap-3" aria-hidden="true">
                {[0, 1, 2].map(i => <span key={i} className="h-3 w-3 rounded-full transition-all" style={{ background: i <= step ? OR : '#cfcac1', boxShadow: i <= step ? '0 0 10px #ff5b1f' : 'none' }} />)}
                <span className={`${MONO} ml-2 text-[11px] font-bold uppercase tracking-[.14em] text-[#1b1714]/50`}>шаг {step + 1}/3</span>
              </div>
              <h3 ref={head} tabIndex={-1} className={`${SANS} mb-7 mt-5 text-[28px] font-extrabold tracking-[-0.04em] outline-none`}>{titles[step]}</h3>
              <AnimatePresence mode="wait">
                <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}>
                  {step === 0 && <div className="flex flex-wrap gap-2.5">{custom && <Key on>{bk.s.svc}</Key>}{names.map(s => <Key key={s} on={bk.s.svc === s} onClick={() => { bk.upd('svc', s); setErr('') }}>{s}</Key>)}</div>}
                  {step === 1 && (<>
                    <div className="flex flex-wrap gap-2.5">{DAYS.map(d => <Key key={d} on={day === d} onClick={() => { setDay(d); setErr('') }}>{d}</Key>)}</div>
                    <p className={`${MONO} mb-3 mt-7 text-[11px] font-bold uppercase tracking-[.14em] text-[#1b1714]/50`}>Время</p>
                    <div className="flex flex-wrap gap-2.5">{TIMES.map(t => <Key key={t} on={time === t} onClick={() => setTime(t)}>{t}</Key>)}</div>
                  </>)}
                  {step === 2 && (<div className="space-y-4">
                    <input value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} autoComplete="name" placeholder="Имя" aria-label="Имя" className="h-14 w-full rounded-md border-2 border-[#1b1714]/15 bg-white px-4 text-[16px] outline-none focus:border-[#2f5bea]" />
                    <input value={bk.s.phone} onChange={e => bk.upd('phone', e.target.value)} onFocus={phoneFocus(bk)} type="tel" inputMode="tel" autoComplete="tel" placeholder="+375 __ ___-__-__" aria-label="Телефон" aria-invalid={bk.s.err}
                      className={`h-14 w-full rounded-md border-2 bg-white px-4 text-[16px] outline-none focus:border-[#2f5bea] ${bk.s.err ? 'border-[#ff5b1f]' : 'border-[#1b1714]/15'}`} />
                    {bk.s.err && <p className="text-[14px] text-[#d2400c]">Проверьте номер — 12 цифр с кодом +375.</p>}
                    <p className={`${MONO} pt-2 text-[11px] font-bold uppercase tracking-[.14em] text-[#1b1714]/50`}>Как ответить</p>
                    <div className="flex flex-wrap gap-2.5">{['Звонок', 'Viber', 'Telegram'].map(v => <Key key={v} on={via === v} onClick={() => setVia(v)}>{v}</Key>)}</div>
                  </div>)}
                </motion.div>
              </AnimatePresence>
              {err && <p className="mt-4 text-[14px] text-[#d2400c]" role="alert">{err}</p>}
              <div className="mt-9 flex items-center justify-between">
                {step > 0 ? <button type="button" onClick={() => setStep(step - 1)} className={`${MONO} text-[12px] font-bold uppercase text-[#1b1714]/60 hover:text-[#1b1714]`}>← Назад</button> : <span />}
                <button type="submit" disabled={bk.s.loading} className={`${MONO} inline-flex h-12 items-center gap-2 rounded-md px-6 text-[13px] font-bold uppercase tracking-[.08em] text-white shadow-[0_3px_0_#b8380c] active:translate-y-[3px] active:shadow-none disabled:opacity-60`} style={{ background: OR }}>{step < 2 ? 'Дальше' : bk.s.loading ? 'Отправляем…' : 'Записаться'} <ArrowRight size={16} /></button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

function Contact() {
  const btn = `${MONO} inline-flex h-11 items-center gap-2 rounded-md border-2 border-[#1b1714] px-4 text-[12px] font-bold uppercase tracking-[.08em] hover:bg-[#1b1714] hover:text-white`
  return (
    <section id="contact" className="px-5 py-24 md:px-10" style={{ background: BASE }}>
      <div className="mx-auto grid max-w-[1280px] gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className={`${MONO} text-[11px] font-bold uppercase tracking-[.14em]`}><span style={{ color: BL }}>■</span> Схема 6 · где мы</p>
          <h2 className={`${SANS} mt-4 text-[clamp(36px,4.4vw,68px)] font-extrabold leading-[.92] tracking-[-0.05em]`}>Контакты</h2>
          <p className="mt-8 flex items-start gap-3 text-[18px]"><MapPin className="mt-1 shrink-0" style={{ color: OR }} size={20} />{b.addr}, {b.floor}, {b.city}</p>
          <a href={'tel:' + tel(b.phone)} className="mt-5 flex items-center gap-3 text-[22px] font-semibold hover:text-[#ff5b1f]"><Phone size={19} style={{ color: OR }} />{b.phone}</a>
          <a href={b.viber} className="mt-2 flex items-center gap-3 text-[17px] hover:text-[#2f5bea]"><MessageCircle size={18} style={{ color: BL }} />Viber: {b.viberPhone}</a>
          <div className="mt-8 flex flex-wrap gap-2.5">
            <a href={b.tg} target="_blank" rel="noopener" className={btn}><TG />Telegram</a>
            <a href={b.viber} className={btn}><MessageCircle size={17} />Viber</a>
            <a href={b.ig} target="_blank" rel="noopener" className={btn}><IG />Instagram</a>
          </div>
        </div>
        <div className="relative rounded-[28px] bg-[#efece6] p-3 shadow-[0_30px_60px_-35px_rgba(59,38,24,.5)]">
          <div className="h-[360px] overflow-hidden rounded-[20px] md:h-[440px]"><MapFrame oid={b.oid} /></div>
          <p className={`${MONO} flex justify-between px-2 pt-3 text-[10px] font-bold uppercase tracking-[.14em] text-[#1b1714]/50`}><span>Чернышевского, 10А</span><span>офис 108 · этаж 1</span></p>
        </div>
      </div>
    </section>
  )
}

function App() {
  useSmooth()
  const lite = useLite()
  const [mute, setMute] = useState(false)
  useEffect(() => { setMuted(mute) }, [mute])
  return (
    <MotionConfig reducedMotion="user">
      <div className={`${SANS} text-[#1b1714]`} style={{ background: BASE, '--sel': OR, '--selc': '#fff' }}>
        <Ribbon name={b.name} bg={INK} fg={BASE} />
        <header className="sticky top-0 z-50 border-b border-[#1b1714]/10 bg-[#e9e7e2]/85 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-5 md:px-10">
            <a href="#top" className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-md" style={{ background: COCOA }}><span className="h-3 w-3 rounded-full" style={{ background: OR }} /></span>
              <span className="leading-none"><span className={`${SANS} block text-[18px] font-extrabold tracking-[-0.04em]`}>шоколад</span><span className={`${MONO} block text-[9.5px] font-bold uppercase tracking-[.16em] text-[#1b1714]/55`}>студия загара</span></span>
            </a>
            <nav className={`${MONO} hidden gap-7 text-[11px] font-bold uppercase tracking-[.14em] md:flex`}>{[['#panel', 'Пульт'], ['#specs', 'Студия'], ['#services', 'Услуги'], ['#contact', 'Контакты']].map(([h, t]) => <a key={h} href={h} className="hover:text-[#ff5b1f]">{t}</a>)}</nav>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setMute(m => !m)} aria-pressed={!mute} className={`${MONO} hidden h-9 items-center gap-2 rounded-md border border-[#1b1714]/20 px-3 text-[10px] font-bold uppercase tracking-[.14em] lg:inline-flex`}><span className="h-2 w-2 rounded-full" style={{ background: mute ? '#bbb' : BL }} />Звук {mute ? 'выкл' : 'вкл'}</button>
              <a href={'tel:' + tel(b.phone)} className={`${MONO} hidden text-[13px] font-bold xl:inline`}>{b.phone}</a>
              <a href="#book" className={`${MONO} hidden h-10 items-center rounded-md px-4 text-[12px] font-bold uppercase tracking-[.08em] text-white sm:inline-flex`} style={{ background: OR }}>Записаться</a>
            </div>
          </div>
        </header>
        <main>
          <Film lite={lite} />
          <Panel />
          <Specs />
          <Catalogue />
          <Book />
          <Contact />
        </main>
        <footer className={`${MONO} px-5 py-8 text-[11px] font-bold uppercase tracking-[.1em] text-[#1b1714]/55 md:px-10`} style={{ background: BASE }}>
          <div className="mx-auto flex max-w-[1280px] flex-wrap justify-between gap-4 border-t border-[#1b1714]/15 pt-8"><span>© 2026 {b.name} · Концепт сайта — Артём</span><span>{b.addr}, {b.city}</span></div>
        </footer>
        <CallBar phone={b.phone} barCls="bg-[#e9e7e2]/95 backdrop-blur border-t border-[#1b1714]/10" callCls="rounded-md border-2 border-[#1b1714] text-[#1b1714]" bookCls="rounded-md bg-[#ff5b1f] text-white" />
        <div className="h-[72px] sm:hidden" style={{ background: BASE }} />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
