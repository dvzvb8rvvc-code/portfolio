import React, { useRef, useState, useEffect, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, useMotionValue, useMotionValueEvent, useInView, AnimatePresence, MotionConfig, animate } from 'framer-motion'
import { ArrowRight, ArrowDown, Phone, MapPin, Clock, Star, Plus, Minus } from 'lucide-react'
import '../lib/base.css'
import { useSmooth, Ribbon, LineReveal, Reveal, useBooking, phoneFocus, CheckDraw, MapFrame, CallBar, tel, useLite, useIsMobile } from '../lib/kit'

const ShifterScene = lazy(() => import('./mkpp3d'))

const b = {
  name: 'Мастерская по ремонту механических КПП', short: 'Мастерская МКПП',
  addr: 'ул. Уборевича, 77А, бокс 100', district: 'Чижовка', city: 'Минск',
  phone: '+375 29 624-07-73', rating: '4,9', rev: 44, revWord: 'оценки', oid: '1384684578',
}
const BASE = '#d6d9dc', PAPER = '#e9ebed', INK = '#15181b', GOLD = '#d4a22c', GOLD_D = '#7a5a0f', STEEL = '#8f969d'
const MONO = "font-['JetBrains_Mono',monospace]", SANS = "font-['Onest',sans-serif]"

/* ---------------- sound ---------------- */
let ac = null, muted = false
function clunk() {
  if (muted) return
  try {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)()
    const t = ac.currentTime
    const o = ac.createOscillator(), g = ac.createGain()
    o.type = 'triangle'; o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(52, t + 0.09)
    g.gain.setValueAtTime(0.22, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.13)
    o.connect(g).connect(ac.destination); o.start(t); o.stop(t + 0.15)
    const buf = ac.createBuffer(1, Math.floor(ac.sampleRate * 0.03), ac.sampleRate), d = buf.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3)
    const src = ac.createBufferSource(), g2 = ac.createGain(); g2.gain.value = 0.12
    src.buffer = buf; src.connect(g2).connect(ac.destination); src.start(t)
  } catch (e) { /* no audio */ }
  try { navigator.vibrate && navigator.vibrate(10) } catch (e) { }
}

/* ---------------- gears ---------------- */
// gate coords: x = column (-1,0,1), y = row (1 top, -1 bottom). Must match mkpp3d.jsx
const GEARS = { '1': [-1, 1], '2': [-1, -1], '3': [0, 1], '4': [0, -1], R: [1, -1] }
const ORDER = ['1', '2', '3', '4', 'R']
const INFO = {
  N: { t: 'Нейтраль', l: ['Потяните рычаг мышкой или пальцем', 'или нажмите передачу 1–4, R', 'Каждая передача открывает раздел'], href: '#services', cta: 'К услугам' },
  '1': { t: 'Что ремонтируем', l: ['Только механические КПП', 'Синхронизаторы, подшипники, вилки', 'Шестерни, сальники, дифференциал'], href: '#services', cta: 'Список работ' },
  '2': { t: 'Признаки поломки', l: ['Хруст при включении передачи', 'Гул на ходу · выбивает передачу', 'Тугое переключение · течь масла'], href: '#symptoms', cta: 'Разобрать мой симптом' },
  '3': { t: 'Как проходит ремонт', l: ['Звонок → диагностика', 'Цену и срок согласуем до работ', 'Ремонт → проверка → выдача'], href: '#process', cta: 'Все шаги' },
  '4': { t: 'Сроки', l: ['Зависят от поломки и запчастей', 'Простые работы — обычно быстрее', 'Точный срок — после диагностики'], href: '#terms', cta: 'Сроки и вопросы' },
  R: { t: 'Контакты', l: [b.addr, b.district + ', ' + b.city, b.phone], href: '#contact', cta: 'Карта и телефон' },
}
const clamp = (v, a, z) => Math.max(a, Math.min(z, v))
const RANGE = c => (c === 1 ? [-1, 0] : [-1, 1])
const gearAt = (c, r) => Object.keys(GEARS).find(k => GEARS[k][0] === c && GEARS[k][1] === r)
function stepGate(x, y, tx, ty) {
  if (Math.abs(y) < 0.04) {
    const nx = clamp(tx, -1, 1), col = Math.round(nx)
    if (Math.abs(nx - col) < 0.2) {
      const [lo, hi] = RANGE(col), ny = clamp(ty, lo, hi)
      if (Math.abs(ny) >= 0.04) return [col, ny]
    }
    return [nx, 0]
  }
  const col = Math.round(x), [lo, hi] = RANGE(col)
  let ny = clamp(ty, lo, hi)
  if (Math.abs(tx - col) > 0.5 && Math.abs(ny) < 0.3) ny = 0
  if (Math.abs(ny) < 0.04) return [col, 0]
  return [col, ny]
}
function constrain(x, y, tx, ty) {
  const x0 = x, y0 = y
  for (let i = 1; i <= 12; i++) [x, y] = stepGate(x, y, x0 + ((tx - x0) * i) / 12, y0 + ((ty - y0) * i) / 12)
  return [x, y]
}
const go = id => { const el = document.querySelector(id); if (!el) return; window.__lenis ? window.__lenis.scrollTo(el, { offset: -70 }) : el.scrollIntoView({ behavior: 'smooth' }) }

/* 2D lite shifter (no WebGL) */
function LiteShifter({ gx, gy, gear }) {
  const cx = useTransform(gx, v => 150 + v * 80), cy = useTransform(gy, v => 150 - v * 80)
  return (
    <svg viewBox="0 0 300 300" className="mx-auto h-full max-h-[320px] w-full" aria-hidden="true">
      <rect x="20" y="20" width="260" height="260" rx="22" fill="#a3a9af" />
      <path d="M70 150H230M70 70V230M150 70V230M230 150V230" stroke={INK} strokeWidth="22" strokeLinecap="round" fill="none" />
      {Object.entries(GEARS).map(([k, [x, y]]) => (
        <g key={k}><circle cx={150 + x * 80} cy={150 - y * 80 - y * 34} r="15" fill={k === gear ? GOLD : 'none'} stroke={INK} strokeWidth="2" />
          <text x={150 + x * 80} y={150 - y * 80 - y * 34 + 5} textAnchor="middle" fontSize="15" fontWeight="700" fontFamily="JetBrains Mono" fill={INK}>{k}</text></g>
      ))}
      <motion.circle cx={cx} cy={cy} r="26" fill="#25292d" stroke={GOLD} strokeWidth="4" />
    </svg>
  )
}

function Lever({ gx, gy, gear, setGear, shiftTo, lite, active }) {
  const drag = useRef(null)
  const down = e => {
    const r = e.currentTarget.getBoundingClientRect()
    drag.current = { sx: e.clientX, sy: e.clientY, x0: gx.get(), y0: gy.get(), unit: Math.max(44, r.height * 0.2), moved: false }
    e.currentTarget.setPointerCapture(e.pointerId)
    gx.stop(); gy.stop()
  }
  const move = e => {
    const d = drag.current; if (!d) return
    const dx = e.clientX - d.sx, dy = e.clientY - d.sy
    if (!d.moved && Math.hypot(dx, dy) < 5) return
    d.moved = true
    const [x, y] = constrain(gx.get(), gy.get(), d.x0 + dx / d.unit, d.y0 - dy / d.unit)
    gx.set(x); gy.set(y)
    const col = Math.round(x)
    if (Math.abs(y) > 0.82) { const k = gearAt(col, Math.sign(y)); if (k && k !== gear) setGear(k, true) }
    else if (Math.abs(y) < 0.25 && gear !== 'N') setGear('N', false)
  }
  const up = () => {
    const d = drag.current; drag.current = null
    if (!d) return
    if (!d.moved) { const i = ORDER.indexOf(gear); shiftTo(ORDER[(i + 1) % ORDER.length], true); return }
    const y = gy.get(), col = Math.round(gx.get())
    const sp = { type: 'spring', stiffness: 520, damping: 30 }
    if (Math.abs(y) > 0.5 && gearAt(col, Math.sign(y))) { animate(gy, Math.sign(y), sp); animate(gx, col, sp); const k = gearAt(col, Math.sign(y)); if (k !== gear) setGear(k, true) }
    else { animate(gy, 0, sp); animate(gx, 0, sp); if (gear !== 'N') setGear('N', false) }
  }
  return (
    <div onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
      className="relative h-full w-full cursor-grab touch-none select-none active:cursor-grabbing" aria-hidden="true">
      {lite ? <LiteShifter gx={gx} gy={gy} gear={gear} /> : <Suspense fallback={<LiteShifter gx={gx} gy={gy} gear={gear} />}><ShifterScene gx={gx} gy={gy} gear={gear} active={active} /></Suspense>}
    </div>
  )
}

function Keycap({ k, on, onClick }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on} aria-label={k === 'N' ? 'Нейтраль' : 'Передача ' + k + ': ' + INFO[k].t}
      className={`${MONO} grid h-12 min-w-0 flex-1 place-items-center rounded-lg text-[17px] font-bold transition-all active:translate-y-[2px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#15181b] ${on ? 'bg-[#d4a22c] text-[#15181b] shadow-[0_2px_0_#8a6510]' : 'bg-[#f3f4f5] text-[#15181b] shadow-[0_3px_0_#b4b9be] hover:bg-white'}`}>{k}</button>
  )
}

function Readout({ gear }) {
  const g = INFO[gear]
  return (
    <div className="rounded-xl bg-[#15181b] p-5 shadow-[inset_0_0_0_5px_#23272b]" aria-live="polite">
      <div className={`${MONO} flex items-center justify-between text-[11px] font-bold uppercase tracking-[.14em] text-[#d4a22c]/70`}>
        <span>{gear === 'N' ? 'N · нейтраль' : 'передача ' + gear}</span><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#d4a22c]" />вкл</span>
      </div>
        <motion.div key={gear} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          <p className={`${SANS} mt-3 text-[24px] font-bold leading-tight tracking-[-0.02em] text-white`}>{g.t}</p>
          <ul className={`${MONO} mt-2 space-y-0.5 text-[14px] leading-relaxed text-[#e9c46a]`}>{g.l.map(l => <li key={l}>→ {l}</li>)}</ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => go(g.href)} className={`${MONO} inline-flex h-11 items-center gap-2 rounded-md bg-[#d4a22c] px-4 text-[13px] font-bold uppercase tracking-[.06em] text-[#15181b] hover:bg-[#e3b440]`}>{g.cta} <ArrowDown size={15} /></button>
            {gear === 'R' && <a href={'tel:' + tel(b.phone)} className={`${MONO} inline-flex h-11 items-center gap-2 rounded-md border border-white/30 px-4 text-[13px] font-bold uppercase tracking-[.06em] text-white hover:bg-white/10`}><Phone size={15} />Позвонить</a>}
          </div>
        </motion.div>
    </div>
  )
}

function Screw({ className }) { return <span aria-hidden="true" className={'absolute h-3 w-3 rounded-full bg-[#b9bec3] shadow-[inset_0_1px_1px_rgba(0,0,0,.35)] ' + className}><span className="absolute left-1/2 top-1/2 h-[1.5px] w-2 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-[#7f868d]" /></span> }

/* ---------------- hero ---------------- */
function Hero({ lite }) {
  const ref = useRef(null), stage = useRef(null)
  const mob = useIsMobile()
  const gx = useMotionValue(0), gy = useMotionValue(0)
  const [gear, setGearS] = useState('N')
  const gearRef = useRef('N'), shiftId = useRef(0), lastIdx = useRef(-2)
  const near = useInView(stage, { margin: '200px 0px' })
  const setGear = (k, sound) => { gearRef.current = k; setGearS(k); if (sound && k !== 'N') clunk() }
  const shiftTo = async (k, sound) => {
    const id = ++shiftId.current
    const sp = { type: 'spring', stiffness: 420, damping: 32 }
    const [tx, ty] = k === 'N' ? [0, 0] : GEARS[k]
    if (Math.abs(gy.get()) > 0.02 && Math.abs(gx.get() - tx) > 0.02) { setGear('N'); await animate(gy, 0, sp); if (id !== shiftId.current) return }
    if (Math.abs(gx.get() - tx) > 0.02) { await animate(gx, tx, sp); if (id !== shiftId.current) return }
    await animate(gy, ty, sp)
    if (id !== shiftId.current) return
    setGear(k, sound)
  }
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  useMotionValueEvent(scrollYProgress, 'change', v => {
    if (mob) return
    const idx = v < 0.12 ? -1 : Math.min(4, Math.floor((v - 0.12) / 0.17))
    if (idx !== lastIdx.current) { lastIdx.current = idx; shiftTo(idx < 0 ? 'N' : ORDER[idx], false) }
  })
  const bar = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])
  return (
    <section ref={ref} id="top" className="relative md:h-[260vh]" style={{ background: BASE }}>
      <div className="relative overflow-hidden md:sticky md:top-16 md:h-[calc(100svh-64px)]">
        <div aria-hidden="true" className="absolute inset-0 opacity-60" style={{ backgroundImage: 'linear-gradient(rgba(21,24,27,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(21,24,27,.07) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="relative mx-auto grid h-full max-w-[1360px] items-center gap-8 px-5 pb-10 pt-8 md:grid-cols-[1fr_1.05fr] md:gap-10 md:px-10 md:py-6">
          <div>
            <p className={`${MONO} flex flex-wrap items-center gap-2 text-[12px] font-bold uppercase tracking-[.12em]`}>
              <span className="rounded px-2 py-1 text-[#15181b]" style={{ background: GOLD }}>Только МКПП</span>
              <span className="text-[#15181b]/70">{b.district} · {b.city}</span>
            </p>
            <h1 className={`${SANS} mt-5 text-[clamp(38px,5.2vw,80px)] font-extrabold leading-[.95] tracking-[-0.045em]`}>
              <LineReveal delay={0.05}>Ремонт</LineReveal>
              <LineReveal delay={0.13}><span className="relative">механических<span aria-hidden="true" className="absolute inset-x-0 bottom-[.06em] -z-0 h-[.14em]" style={{ background: GOLD }} /></span></LineReveal>
              <LineReveal delay={0.21}>коробок передач</LineReveal>
            </h1>
            <p className="mt-5 max-w-[500px] text-[17px] leading-snug text-[#15181b]/80">Узкая специализация: только механика. Автоматы и вариаторы не берём. Хрустит, гудит, выбивает передачу или течёт масло — найдём причину и отремонтируем.</p>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[15px]">
              <span className="inline-flex items-center gap-1.5 font-semibold"><Star size={17} fill={GOLD} stroke={GOLD_D} />{b.rating} · {b.rev} {b.revWord} на Яндекс Картах</span>
              <span className="inline-flex items-center gap-1.5 text-[#15181b]/80"><MapPin size={16} />{b.addr}</span>
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#book" className={`${MONO} inline-flex h-14 items-center gap-2 rounded-lg px-6 text-[14px] font-bold uppercase tracking-[.06em] text-[#15181b] shadow-[0_3px_0_#8a6510] hover:bg-[#e3b440] active:translate-y-[3px] active:shadow-none`} style={{ background: GOLD }}>Записаться на диагностику <ArrowRight size={17} /></a>
              <a href={'tel:' + tel(b.phone)} className={`${MONO} inline-flex h-14 items-center gap-2 rounded-lg border-2 border-[#15181b] px-5 text-[15px] font-bold hover:bg-[#15181b] hover:text-white`}><Phone size={17} />{b.phone}</a>
            </div>
            <a href="#services" className={`${MONO} mt-6 hidden text-[12px] font-bold uppercase tracking-[.12em] text-[#15181b]/60 underline-offset-4 hover:underline md:inline-block`}>Пропустить →</a>
          </div>

          <div ref={stage} className="relative rounded-[26px] bg-[#e4e6e8] p-4 shadow-[0_2px_0_#fff_inset,0_40px_70px_-35px_rgba(10,12,14,.55)] md:p-5">
            <Screw className="left-3 top-3" /><Screw className="right-3 top-3" /><Screw className="bottom-3 left-3" /><Screw className="bottom-3 right-3" />
            <div className={`${MONO} flex justify-between px-2 text-[11px] font-bold uppercase tracking-[.12em] text-[#15181b]/60`}><span>Рис. 1 · рычаг КПП</span><span>тяните ↕↔</span></div>
            <div className="h-[260px] md:h-[min(36vh,330px)]">
              <Lever gx={gx} gy={gy} gear={gear} setGear={setGear} shiftTo={shiftTo} lite={lite} active={near} />
            </div>
            <div className="flex gap-2" role="group" aria-label="Выбор передачи">
              {['N', ...ORDER].map(k => <Keycap key={k} k={k} on={gear === k} onClick={() => shiftTo(k, true)} />)}
            </div>
            <div className="mt-3"><Readout gear={gear} /></div>
          </div>
        </div>
        <div className={`${MONO} pointer-events-none absolute inset-x-10 bottom-3 hidden items-center gap-3 text-[10px] font-bold uppercase tracking-[.14em] text-[#15181b]/55 md:flex`}>
          <span>прокрутка переключает передачи</span>
          <div className="relative h-[6px] flex-1 border-x border-[#15181b]/40" style={{ backgroundImage: 'repeating-linear-gradient(90deg,rgba(21,24,27,.35) 0 1px,transparent 1px 20%)' }}>
            <motion.div style={{ width: bar, background: GOLD_D }} className="absolute left-0 top-[2px] h-[2px]" />
          </div>
          <span>N · 1 · 2 · 3 · 4 · R</span>
        </div>
      </div>
    </section>
  )
}

/* ---------------- only manual strip ---------------- */
function OnlyManual() {
  return (
    <section className="bg-[#15181b] px-5 py-14 text-white md:px-10">
      <div className="mx-auto grid max-w-[1280px] gap-8 md:grid-cols-3">
        <Reveal><p className={`${MONO} text-[12px] font-bold uppercase tracking-[.14em] text-[#d4a22c]`}>Ремонтируем</p><p className={`${SANS} mt-2 text-[26px] font-bold leading-tight tracking-[-0.02em]`}>Механические коробки передач — МКПП</p></Reveal>
        <Reveal delay={0.08}><p className={`${MONO} text-[12px] font-bold uppercase tracking-[.14em] text-white/60`}>Не ремонтируем</p><p className={`${SANS} mt-2 text-[26px] font-bold leading-tight tracking-[-0.02em] text-white/70 line-through decoration-[#d4a22c] decoration-2`}>Автоматы (АКПП) и вариаторы</p></Reveal>
        <Reveal delay={0.16}><p className={`${MONO} text-[12px] font-bold uppercase tracking-[.14em] text-[#d4a22c]`}>Яндекс Карты</p><p className={`${SANS} mt-2 text-[26px] font-bold leading-tight tracking-[-0.02em]`}>{b.rating} из 5 · {b.rev} {b.revWord}</p></Reveal>
      </div>
    </section>
  )
}

function SecHead({ gear, kicker, title, children }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-6">
      <div>
        <p className={`${MONO} flex items-center gap-3 text-[12px] font-bold uppercase tracking-[.14em]`}>
          <span className="grid h-9 w-9 place-items-center rounded-lg text-[16px] text-[#15181b]" style={{ background: GOLD }}>{gear}</span>{kicker}
        </p>
        <h2 className={`${SANS} mt-4 text-[clamp(34px,4.8vw,72px)] font-extrabold leading-[.95] tracking-[-0.045em]`}>{title}</h2>
      </div>
      {children}
    </div>
  )
}

/* ---------------- 1 services + exploded diagram ---------------- */
const SVC = [
  { c: '01', t: 'Диагностика МКПП', d: 'Слушаем коробку на ходу и на подъёмнике, находим причину.' },
  { c: '02', t: 'Синхронизаторы', d: 'Хруст при включении — меняем кольца и муфты.' },
  { c: '03', t: 'Подшипники валов', d: 'Гул и вой на ходу — замена подшипников.' },
  { c: '04', t: 'Вилки и кулиса', d: 'Выбивает передачу, туго включается — ремонт механизма выбора.' },
  { c: '05', t: 'Шестерни', d: 'Износ и сколы зубьев — замена шестерён.' },
  { c: '06', t: 'Сальники и течи', d: 'Капает масло — меняем сальники и прокладки.' },
  { c: '07', t: 'Дифференциал', d: 'Ремонт дифференциала и замена его подшипников.' },
  { c: '08', t: 'Замена масла в КПП', d: 'Подберём масло по допуску вашей коробки.' },
]
// callout anchor points in the diagram (viewBox 520x380)
const CALL = { '02': [214, 118], '03': [70, 132], '04': [214, 52], '05': [318, 228], '06': [38, 132], '07': [430, 300], '08': [470, 330] }
const CALL_LABEL = { '02': [214, 22], '03': [92, 22], '04': [300, 22], '05': [380, 196], '06': [30, 22], '07': [496, 250], '08': [496, 360] }
function Diagram({ hot }) {
  const gearsTop = [[120, 46], [168, 34], [262, 40], [318, 30], [372, 26]]
  const gearsBot = [[120, 30], [168, 42], [262, 36], [318, 46], [372, 50]]
  return (
    <svg viewBox="0 0 520 380" className="h-auto w-full" role="img" aria-label="Схема механической коробки передач с номерами узлов">
      <rect x="24" y="60" width="440" height="240" rx="28" fill="none" stroke={INK} strokeOpacity=".35" strokeDasharray="6 6" strokeWidth="1.5" />
      <line x1="30" y1="132" x2="470" y2="132" stroke={INK} strokeWidth="6" strokeLinecap="round" />
      <line x1="60" y1="228" x2="470" y2="228" stroke={INK} strokeWidth="6" strokeLinecap="round" />
      {gearsTop.map(([x, h], i) => <rect key={'t' + i} x={x - 9} y={132 - h / 2} width="18" height={h} rx="3" fill="#c8ccd0" stroke={INK} strokeWidth="1.5" />)}
      {gearsBot.map(([x, h], i) => <rect key={'b' + i} x={x - 9} y={228 - h / 2} width="18" height={h} rx="3" fill={hot === '05' ? GOLD : '#c8ccd0'} stroke={INK} strokeWidth="1.5" />)}
      {[214, 416].map(x => <rect key={x} x={x - 8} y="114" width="16" height="36" rx="3" fill={hot === '02' ? GOLD : '#2a2f34'} />)}
      {[[70, 132], [450, 132], [80, 228], [450, 228]].map(([x, y], i) => (
        <g key={i}><circle cx={x} cy={y} r="13" fill={hot === '03' ? GOLD : PAPER} stroke={INK} strokeWidth="1.5" /><path d={`M${x - 7} ${y - 7}L${x + 7} ${y + 7}M${x + 7} ${y - 7}L${x - 7} ${y + 7}`} stroke={INK} strokeWidth="1.2" /></g>
      ))}
      <rect x="32" y="122" width="10" height="20" fill={hot === '06' ? GOLD : PAPER} stroke={INK} strokeWidth="1.5" />
      <path d="M214 60V100M206 100h16v14h-16z" fill={hot === '04' ? GOLD : 'none'} stroke={INK} strokeWidth="2" />
      <path d="M416 60V100M408 100h16v14h-16z" fill={hot === '04' ? GOLD : 'none'} stroke={INK} strokeWidth="2" />
      <circle cx="430" cy="300" r="34" fill={hot === '07' ? GOLD : '#c8ccd0'} stroke={INK} strokeWidth="1.5" />
      <circle cx="430" cy="300" r="14" fill={PAPER} stroke={INK} strokeWidth="1.5" />
      <path d="M470 316c0 0-8 10-8 15a8 8 0 0 0 16 0c0-5-8-15-8-15z" fill={hot === '08' ? GOLD : '#2a2f34'} />
      {Object.keys(CALL).map(k => {
        const [ax, ay] = CALL[k], [lx, ly] = CALL_LABEL[k], on = hot === k
        return (
          <g key={k}>
            <line x1={ax} y1={ay} x2={lx} y2={ly} stroke={on ? GOLD_D : INK} strokeOpacity={on ? 1 : 0.4} strokeWidth="1" />
            <circle cx={lx} cy={ly} r="12" fill={on ? GOLD : INK} />
            <text x={lx} y={ly + 4} textAnchor="middle" fontSize="11" fontWeight="700" fontFamily="JetBrains Mono" fill={on ? INK : '#fff'}>{k}</text>
          </g>
        )
      })}
      <text x="24" y="372" fontSize="11" fontWeight="700" fontFamily="JetBrains Mono" fill={INK} fillOpacity=".55">РИС. 2 · МКПП В РАЗРЕЗЕ (УСЛОВНО)</text>
    </svg>
  )
}
function Services() {
  const [hot, setHot] = useState('02')
  return (
    <section id="services" className="px-5 py-20 md:px-10 md:py-28" style={{ background: PAPER }}>
      <div className="mx-auto max-w-[1280px]">
        <SecHead gear="1" kicker="Что ремонтируем" title="Коробка целиком — от сальника до синхронизатора.">
          <p className="max-w-[360px] text-[16px] text-[#15181b]/75">Цена — уточнит мастер после диагностики. Нажмите «Записаться» — работа подставится в заявку.</p>
        </SecHead>
        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1.1fr]">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-[22px] border border-[#15181b]/12 bg-[#f4f5f6] p-4 md:p-6"><Diagram hot={hot} /></div>
          </div>
          <ul className="border-t border-[#15181b]/15">
            {SVC.map(s => (
              <li key={s.c} onMouseEnter={() => setHot(s.c)} onFocus={() => setHot(s.c)} className={`grid grid-cols-[44px_1fr] items-start gap-x-4 gap-y-3 border-b border-[#15181b]/15 py-5 transition-colors sm:grid-cols-[44px_1fr_auto] sm:items-center ${hot === s.c ? 'bg-[#15181b]/[.04]' : ''}`}>
                <span className={`${MONO} grid h-9 w-9 place-items-center rounded-lg text-[13px] font-bold ${hot === s.c ? 'text-[#15181b]' : 'bg-[#15181b] text-white'}`} style={hot === s.c ? { background: GOLD } : undefined}>{s.c}</span>
                <div>
                  <p className={`${SANS} text-[21px] font-bold tracking-[-0.02em]`}>{s.t}</p>
                  <p className="mt-1 text-[16px] leading-snug text-[#15181b]/75">{s.d}</p>
                  <p className={`${MONO} mt-1.5 text-[12px] uppercase tracking-[.08em] text-[#15181b]/55`}>цена — уточнит мастер</p>
                </div>
                <a href="#book" data-svc={s.t} className={`${MONO} col-start-2 inline-flex h-11 w-fit items-center gap-2 rounded-md border-2 border-[#15181b] px-4 text-[12px] font-bold uppercase tracking-[.08em] hover:bg-[#15181b] hover:text-white sm:col-start-3`}>Записаться</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

/* ---------------- 2 symptoms ---------------- */
const SYM = [
  { k: 'crunch', t: 'Хруст при включении передачи', c: [['Синхронизатор', 'изношены кольца или муфта — передача входит с хрустом, часто одна-две конкретные'], ['Сцепление', 'если педаль выключает его не полностью — хрустят все передачи'], ['Масло', 'старое или не того типа']], tip: 'Запомните, на какой передаче хруст и на холодную или на горячую — это ускорит диагностику.', svc: 'Синхронизаторы' },
  { k: 'hum', t: 'Гул на ходу', c: [['Подшипники валов', 'гул нарастает со скоростью'], ['Дифференциал', 'его подшипники или пара шестерён'], ['Уровень масла', 'при низком уровне шум растёт и износ ускоряется']], tip: 'Обратите внимание, меняется ли гул при сбросе газа и на нейтрали. Иногда гудит ступичный подшипник — проверим и это.', svc: 'Подшипники валов' },
  { k: 'pop', t: 'Передача выбивает', c: [['Муфты и шестерни', 'износ зубьев — передача не держится под нагрузкой'], ['Вилки и фиксаторы', 'износ механизма выбора передач'], ['Кулиса и опоры', 'тяги, тросы, подушки двигателя и КПП']], tip: 'Не удерживайте рычаг рукой подолгу — износ идёт быстрее. Лучше показать коробку мастеру.', svc: 'Вилки и кулиса' },
  { k: 'stiff', t: 'Тугое переключение', c: [['Сцепление', 'не выключается полностью — передачи входят с усилием'], ['Кулиса, тросы, тяги', 'износ, люфт или закисание'], ['Синхронизаторы', 'а иногда — неподходящее масло']], tip: 'Если туго только на холодную — тоже скажите мастеру, это важная подсказка.', svc: 'Вилки и кулиса' },
  { k: 'leak', t: 'Течь масла', c: [['Сальники', 'приводов или первичного вала'], ['Прокладки', 'картера и крышек КПП'], ['Сапун', 'если засорён — масло выдавливает']], tip: 'Следите за уровнем масла: езда с низким уровнем быстро добивает подшипники.', svc: 'Сальники и течи' },
]
function Scope({ sym }) {
  const ref = useRef(null)
  const inView = useInView(ref, { margin: '100px 0px' })
  const symRef = useRef(sym)
  useEffect(() => { symRef.current = sym }, [sym])
  useEffect(() => {
    if (!inView) return
    const cv = ref.current, g = cv.getContext('2d')
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    let id, t0 = performance.now()
    const draw = now => {
      const W = cv.width = cv.clientWidth * Math.min(2, devicePixelRatio), H = cv.height = cv.clientHeight * Math.min(2, devicePixelRatio)
      const t = reduce ? 1.3 : (now - t0) / 1000, k = symRef.current
      g.fillStyle = '#15181b'; g.fillRect(0, 0, W, H)
      g.strokeStyle = 'rgba(212,162,44,.12)'; g.lineWidth = 1
      for (let i = 1; i < 10; i++) { g.beginPath(); g.moveTo((W * i) / 10, 0); g.lineTo((W * i) / 10, H); g.stroke() }
      for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(0, (H * i) / 4); g.lineTo(W, (H * i) / 4); g.stroke() }
      g.strokeStyle = GOLD; g.lineWidth = 2 * Math.min(2, devicePixelRatio); g.shadowColor = GOLD; g.shadowBlur = 8
      g.beginPath()
      const mid = H / 2, A = H * 0.36
      for (let px = 0; px <= W; px += 2) {
        const x = px / W, ph = x * 6 - t * 0.9
        let y = 0
        if (k === 'crunch') { const env = Math.max(0, Math.sin(ph * 1.6)) ** 8; y = env * (Math.sin(px * 1.7 + t * 40) * 0.6 + Math.sin(px * 0.73 + t * 23) * 0.4) + Math.sin(ph * 4) * 0.04 }
        else if (k === 'hum') y = Math.sin(x * 22 - t * 6) * 0.45 + Math.sin(x * 66 - t * 14) * 0.12
        else if (k === 'pop') { const s = (ph % 3 + 3) % 3; y = s < 2 ? Math.sin(x * 40 - t * 8) * 0.18 : (s < 2.15 ? -0.9 : Math.sin(x * 40) * 0.05) }
        else if (k === 'stiff') { const s = (ph % 2 + 2) % 2; y = s < 1.4 ? -0.8 * Math.min(1, s / 1.2) ** 2 : -0.8 + (s - 1.4) * 1.33 }
        else if (k === 'leak') { const s = (ph * 1.4 % 1.6 + 1.6) % 1.6; y = s < 0.12 ? Math.sin((s / 0.12) * Math.PI) * 0.7 : 0.02 * Math.sin(px) }
        else y = Math.sin(px * 0.9 + t * 9) * 0.015
        const yy = mid - y * A
        px ? g.lineTo(px, yy) : g.moveTo(px, yy)
      }
      g.stroke(); g.shadowBlur = 0
      if (!reduce) id = requestAnimationFrame(draw)
    }
    id = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(id)
  }, [inView])
  return <canvas ref={ref} className="block h-[120px] w-full rounded-lg md:h-[140px]" aria-hidden="true" />
}
function Symptoms() {
  const [k, setK] = useState('')
  const s = SYM.find(x => x.k === k)
  const book = () => { window.dispatchEvent(new CustomEvent('mkpp-svc', { detail: 'Диагностика: ' + s.t.toLowerCase() })); go('#book') }
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 30%'] })
  const clip = useTransform(scrollYProgress, [0, 1], ['inset(8% 5% 0% 5% round 28px)', 'inset(0% 0% 0% 0% round 0px)'])
  return (
    <motion.section ref={ref} id="symptoms" style={{ clipPath: clip, background: BASE }} className="px-5 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-[1280px]">
        <SecHead gear="2" kicker="Признаки поломки" title="Что слышите?">
          <p className="max-w-[380px] text-[16px] text-[#15181b]/75">Выберите, что происходит с коробкой, — расскажем простыми словами, что это может быть.</p>
        </SecHead>
        <div className="mt-12 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="grid gap-2.5" role="radiogroup" aria-label="Симптом">
            {SYM.map((x, i) => (
              <button key={x.k} type="button" role="radio" aria-checked={k === x.k} onClick={() => setK(x.k)}
                className={`flex min-h-[64px] items-center gap-4 rounded-xl px-5 text-left transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#15181b] ${k === x.k ? 'bg-[#15181b] text-white shadow-[0_3px_0_#000]' : 'bg-[#eef0f1] shadow-[0_3px_0_#b4b9be] hover:bg-white'}`}>
                <span className={`${MONO} grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[13px] font-bold ${k === x.k ? 'text-[#15181b]' : 'bg-[#15181b]/10'}`} style={k === x.k ? { background: GOLD } : undefined}>0{i + 1}</span>
                <span className={`${SANS} text-[18px] font-semibold tracking-[-0.01em]`}>{x.t}</span>
              </button>
            ))}
          </div>
          <div className="rounded-[22px] bg-[#e4e6e8] p-4 shadow-[0_2px_0_#fff_inset,0_30px_60px_-35px_rgba(10,12,14,.5)] md:p-6">
            <Scope sym={k} />
            <div aria-live="polite" className="min-h-[300px] px-1 pt-5">
              <>
                {!s ? (
                  <motion.div key="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <p className={`${MONO} text-[12px] font-bold uppercase tracking-[.14em] text-[#15181b]/55`}>Ожидание сигнала</p>
                    <p className={`${SANS} mt-3 text-[24px] font-bold tracking-[-0.02em]`}>Выберите симптом слева.</p>
                    <p className="mt-2 text-[16px] text-[#15181b]/75">Покажем вероятные причины и подскажем, что сделать до визита.</p>
                  </motion.div>
                ) : (
                  <motion.div key={s.k} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                    <p className={`${MONO} text-[12px] font-bold uppercase tracking-[.14em] text-[#15181b]/55`}>Чаще всего это</p>
                    <ol className="mt-3 space-y-3">
                      {s.c.map(([h, d], i) => (
                        <li key={h} className="flex gap-3">
                          <span className={`${MONO} mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md text-[12px] font-bold ${i ? 'bg-[#15181b]/10' : 'text-[#15181b]'}`} style={i ? undefined : { background: GOLD }}>{i + 1}</span>
                          <p className="text-[17px] leading-snug"><b className="font-bold">{h}</b> — {d}</p>
                        </li>
                      ))}
                    </ol>
                    <p className="mt-4 rounded-lg bg-white/70 p-3 text-[15.5px] leading-snug"><b>Совет:</b> {s.tip}</p>
                    <p className={`${MONO} mt-3 text-[12px] font-bold uppercase tracking-[.08em] text-[#7a5a0f]`}>* Точно — только после диагностики</p>
                    <button type="button" onClick={book} className={`${MONO} mt-4 inline-flex h-12 items-center gap-2 rounded-lg px-5 text-[13px] font-bold uppercase tracking-[.06em] text-[#15181b] shadow-[0_3px_0_#8a6510] active:translate-y-[3px] active:shadow-none`} style={{ background: GOLD }}>Записаться на диагностику <ArrowRight size={16} /></button>
                  </motion.div>
                )}
              </>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  )
}

/* ---------------- 3 process ---------------- */
const STEPS = [
  { t: 'Звонок', d: 'Опишите симптомы — договоримся о времени.' },
  { t: 'Диагностика', d: 'Проверяем коробку и находим причину.' },
  { t: 'Согласование', d: 'Цену и срок называем до начала работ.' },
  { t: 'Ремонт и выдача', d: 'Ремонтируем, проверяем переключение, отдаём машину.' },
]
function Process() {
  return (
    <section id="process" className="bg-[#15181b] px-5 py-20 text-white md:px-10 md:py-28">
      <div className="mx-auto max-w-[1280px]">
        <div>
          <p className={`${MONO} flex items-center gap-3 text-[12px] font-bold uppercase tracking-[.14em]`}><span className="grid h-9 w-9 place-items-center rounded-lg text-[16px] text-[#15181b]" style={{ background: GOLD }}>3</span>Как проходит ремонт</p>
          <h2 className={`${SANS} mt-4 text-[clamp(34px,4.8vw,72px)] font-extrabold leading-[.95] tracking-[-0.045em]`}>Четыре передачи — <span className="text-[#d4a22c]">и вы снова едете.</span></h2>
        </div>
        <div className="relative mt-14">
        <div aria-hidden="true" className="absolute left-0 right-0 top-[27px] hidden h-[3px] bg-white/15 md:block" />
        <ol className="relative grid gap-8 md:grid-cols-4 md:gap-4">
          {STEPS.map((s, i) => (
            <Reveal as="li" key={s.t} delay={i * 0.08} className="relative">
              <span className={`${MONO} relative grid h-14 w-14 place-items-center rounded-full border-[3px] border-[#d4a22c] bg-[#15181b] text-[20px] font-bold text-[#d4a22c]`}>{i + 1}</span>
              <p className={`${SANS} mt-5 text-[23px] font-bold tracking-[-0.02em]`}>{s.t}</p>
              <p className="mt-2 max-w-[260px] text-[16px] leading-snug text-white/75">{s.d}</p>
            </Reveal>
          ))}
        </ol>
        </div>
      </div>
    </section>
  )
}

/* ---------------- 4 terms + faq ---------------- */
const TERMS = [
  ['Диагностика', 'время назначим по телефону'],
  ['Простые работы', 'сальник, масло — обычно быстрее'],
  ['Ремонт с разборкой', 'дольше; запчасти иногда под заказ'],
  ['Точный срок', 'назовём после диагностики'],
]
const FAQ = [
  ['Вы ремонтируете автоматические коробки?', 'Нет. Мастерская работает только с механическими коробками передач (МКПП). Автоматы и вариаторы — не наш профиль.'],
  ['Сколько времени займёт ремонт?', 'Зависит от поломки и наличия запчастей. Срок назовём после диагностики, а если деталь нужно заказывать — предупредим заранее.'],
  ['Можно доехать своим ходом?', 'Если машина едет и передачи включаются — обычно да. Если сильная течь, передачи не включаются или в коробке стук — позвоните, подскажем, как лучше поступить.'],
  ['Сколько стоит ремонт?', 'Цену назовёт мастер после диагностики. Работы начинаем только после согласования.'],
  ['Как оплатить?', 'Способы оплаты уточняйте по телефону.'],
  ['Нужна ли запись?', 'Лучше позвонить заранее: мастер выделит время, и вам не придётся ждать.'],
]
function FaqItem({ q, a, open, onToggle, id }) {
  return (
    <div className="border-b border-[#15181b]/15">
      <h3>
        <button type="button" aria-expanded={open} aria-controls={id} onClick={onToggle} className={`${SANS} flex w-full items-center justify-between gap-4 py-5 text-left text-[18px] font-semibold tracking-[-0.01em] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#15181b]`}>
          {q}<span className="grid h-8 w-8 shrink-0 place-items-center rounded-md" style={{ background: open ? GOLD : 'rgba(21,24,27,.08)' }}>{open ? <Minus size={16} /> : <Plus size={16} />}</span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open && <motion.div id={id} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden"><p className="pb-5 text-[16.5px] leading-relaxed text-[#15181b]/80">{a}</p></motion.div>}
      </AnimatePresence>
    </div>
  )
}
function Terms() {
  const [open, setOpen] = useState(0)
  return (
    <section id="terms" className="px-5 py-20 md:px-10 md:py-28" style={{ background: PAPER }}>
      <div className="mx-auto max-w-[1280px]">
        <SecHead gear="4" kicker="Сроки и вопросы" title="Честно о сроках." />
        <div className="mt-12 grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="self-start rounded-[22px] bg-[#15181b] p-6 text-white md:p-8">
            <p className={`${MONO} text-[12px] font-bold uppercase tracking-[.14em] text-[#d4a22c]`}>Таблица 1 · ориентиры</p>
            <dl className="mt-5">
              {TERMS.map(([a, z]) => (
                <div key={a} className="flex flex-col gap-1 border-t border-white/15 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                  <dt className={`${SANS} text-[19px] font-bold`}>{a}</dt><dd className={`${MONO} text-[14px] text-[#e9c46a] sm:text-right`}>{z}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-[15px] text-white/70">Срок зависит от поломки и запчастей. Мы не обещаем «за час» — сначала разберёмся.</p>
          </div>
          <div className="border-t border-[#15181b]/15">
            {FAQ.map(([q, a], i) => <FaqItem key={q} id={'faq-' + i} q={q} a={a} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />)}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- booking ---------------- */
const B_SVC = ['Диагностика', ...SYM.map(s => s.t), 'Замена масла в КПП']
const DAYS = ['Сегодня', 'Завтра', 'На этой неделе', 'Другой день']
function Key({ on, children, onClick }) {
  return <button type="button" aria-pressed={!!on} onClick={onClick} className={`min-h-[48px] rounded-lg px-4 text-left text-[16px] font-semibold transition-all active:translate-y-[2px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#15181b] ${on ? 'bg-[#15181b] text-white shadow-[0_2px_0_#000]' : 'bg-[#f3f4f5] shadow-[0_3px_0_#b4b9be] hover:bg-white'}`}>{children}</button>
}
function Book() {
  const bk = useBooking()
  const [step, setStep] = useState(0), [day, setDay] = useState(''), [car, setCar] = useState(''), [err, setErr] = useState('')
  const head = useRef(null)
  useEffect(() => { if (step) head.current?.focus() }, [step])
  useEffect(() => { const h = e => { bk.upd('svc', e.detail); setStep(0); setErr('') }; window.addEventListener('mkpp-svc', h); return () => window.removeEventListener('mkpp-svc', h) }, [])
  const next = e => {
    e.preventDefault()
    if (step === 0 && !bk.s.svc) return setErr('Выберите, что беспокоит')
    if (step === 1 && !day) return setErr('Выберите, когда удобно')
    setErr('')
    if (step < 2) setStep(step + 1); else bk.submit()
  }
  const custom = bk.s.svc && !B_SVC.includes(bk.s.svc)
  const titles = ['Что с коробкой?', 'Когда удобно приехать?', 'Куда перезвонить?']
  return (
    <section id="book" className="px-5 py-20 md:px-10 md:py-28" style={{ background: BASE }}>
      <div className="mx-auto grid max-w-[1280px] gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className={`${MONO} text-[12px] font-bold uppercase tracking-[.14em]`}>Запись</p>
          <h2 className={`${SANS} mt-4 text-[clamp(34px,4.8vw,72px)] font-extrabold leading-[.95] tracking-[-0.045em]`}>Запишитесь на диагностику.</h2>
          <p className="mt-6 max-w-[380px] text-[17px] text-[#15181b]/80">Три коротких шага — мастер перезвонит и согласует время. Или просто позвоните:</p>
          <a href={'tel:' + tel(b.phone)} className={`${MONO} mt-4 inline-flex items-center gap-2 text-[24px] font-bold hover:text-[#7a5a0f]`}><Phone size={20} />{b.phone}</a>
        </div>
        <div className="relative rounded-[26px] bg-[#e9ebed] p-6 shadow-[0_2px_0_#fff_inset,0_40px_70px_-35px_rgba(10,12,14,.5)] md:p-10">
          <Screw className="left-3 top-3" /><Screw className="right-3 top-3" /><Screw className="bottom-3 left-3" /><Screw className="bottom-3 right-3" />
          {bk.s.sent ? (
            <div className="py-10 text-center" role="status">
              <CheckDraw className="mx-auto text-[#7a5a0f]" />
              <p className={`${SANS} mt-6 text-[30px] font-extrabold tracking-[-0.03em]`}>Заявка принята</p>
              <p className="mx-auto mt-3 max-w-[400px] text-[16px] text-[#15181b]/75">Мастер перезвонит и согласует время. В готовом сайте заявка сразу придёт вам в Telegram.</p>
              <button type="button" onClick={() => { bk.reset(); setStep(0); setDay(''); setCar('') }} className={`${MONO} mt-8 text-[13px] font-bold uppercase underline underline-offset-4`}>Новая заявка</button>
            </div>
          ) : (
            <form onSubmit={next} noValidate>
              <div className="flex items-center gap-2" aria-hidden="true">
                {[0, 1, 2].map(i => <span key={i} className="h-2 flex-1 rounded-full transition-colors" style={{ background: i <= step ? GOLD : '#c7ccd1' }} />)}
              </div>
              <p className={`${MONO} mt-4 text-[12px] font-bold uppercase tracking-[.14em] text-[#15181b]/60`}>Шаг {step + 1} из 3</p>
              <h3 ref={head} tabIndex={-1} className={`${SANS} mb-6 mt-2 text-[28px] font-extrabold tracking-[-0.03em] outline-none`}>{titles[step]}</h3>
              <AnimatePresence mode="wait">
                <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.22 }}>
                  {step === 0 && (<>
                    <div className="grid gap-2.5 sm:grid-cols-2">{custom && <Key on>{bk.s.svc}</Key>}{B_SVC.map(s => <Key key={s} on={bk.s.svc === s} onClick={() => { bk.upd('svc', s); setErr('') }}>{s}</Key>)}</div>
                    <label className="mt-6 block text-[15px] font-semibold" htmlFor="mk-car">Марка и модель (необязательно)</label>
                    <input id="mk-car" value={car} onChange={e => setCar(e.target.value)} placeholder="Например, Volkswagen Passat B6" className="mt-2 h-14 w-full rounded-lg border-2 border-[#15181b]/15 bg-white px-4 text-[16px] outline-none focus:border-[#15181b]" />
                  </>)}
                  {step === 1 && <div className="grid gap-2.5 sm:grid-cols-2">{DAYS.map(d => <Key key={d} on={day === d} onClick={() => { setDay(d); setErr('') }}>{d}</Key>)}</div>}
                  {step === 2 && (<div className="space-y-4">
                    <div><label className="text-[15px] font-semibold" htmlFor="mk-name">Имя</label>
                      <input id="mk-name" value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} autoComplete="name" className="mt-2 h-14 w-full rounded-lg border-2 border-[#15181b]/15 bg-white px-4 text-[16px] outline-none focus:border-[#15181b]" /></div>
                    <div><label className="text-[15px] font-semibold" htmlFor="mk-phone">Телефон</label>
                      <input id="mk-phone" value={bk.s.phone} onChange={e => bk.upd('phone', e.target.value)} onFocus={phoneFocus(bk)} type="tel" inputMode="tel" autoComplete="tel" placeholder="+375 __ ___-__-__" aria-invalid={bk.s.err} aria-describedby={bk.s.err ? 'mk-perr' : undefined}
                        className={`mt-2 h-14 w-full rounded-lg border-2 bg-white px-4 text-[16px] outline-none focus:border-[#15181b] ${bk.s.err ? 'border-[#b42318]' : 'border-[#15181b]/15'}`} /></div>
                    {bk.s.err && <p id="mk-perr" className="text-[15px] text-[#b42318]">Проверьте номер — 12 цифр с кодом +375.</p>}
                    <p className="text-[14px] text-[#15181b]/65">{bk.s.svc}{car ? ' · ' + car : ''} · {day}</p>
                  </div>)}
                </motion.div>
              </AnimatePresence>
              {err && <p className="mt-4 text-[15px] text-[#b42318]" role="alert">{err}</p>}
              <div className="mt-8 flex items-center justify-between gap-4">
                {step > 0 ? <button type="button" onClick={() => setStep(step - 1)} className={`${MONO} h-12 text-[13px] font-bold uppercase text-[#15181b]/70 hover:text-[#15181b]`}>← Назад</button> : <span />}
                <button type="submit" disabled={bk.s.loading} className={`${MONO} inline-flex h-14 items-center gap-2 rounded-lg px-6 text-[14px] font-bold uppercase tracking-[.06em] text-[#15181b] shadow-[0_3px_0_#8a6510] active:translate-y-[3px] active:shadow-none disabled:opacity-60`} style={{ background: GOLD }}>{step < 2 ? 'Дальше' : bk.s.loading ? 'Отправляем…' : 'Перезвоните мне'} <ArrowRight size={17} /></button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

/* ---------------- R contacts ---------------- */
function Contact() {
  return (
    <section id="contact" className="px-5 py-20 md:px-10 md:py-28" style={{ background: PAPER }}>
      <div className="mx-auto grid max-w-[1280px] gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className={`${MONO} flex items-center gap-3 text-[12px] font-bold uppercase tracking-[.14em]`}><span className="grid h-9 w-9 place-items-center rounded-lg text-[16px] text-[#15181b]" style={{ background: GOLD }}>R</span>Контакты</p>
          <h2 className={`${SANS} mt-4 text-[clamp(34px,4.4vw,64px)] font-extrabold leading-[.95] tracking-[-0.045em]`}>Бокс 100 на Чижовке.</h2>
          <ul className="mt-8 space-y-5 text-[18px]">
            <li className="flex items-start gap-3"><MapPin className="mt-1 shrink-0 text-[#7a5a0f]" size={20} /><span>{b.addr}<br /><span className="text-[#15181b]/70">{b.district}, {b.city}</span></span></li>
            <li className="flex items-start gap-3"><Clock className="mt-1 shrink-0 text-[#7a5a0f]" size={20} /><span>Часы работы — уточняйте по телефону</span></li>
            <li><a href={'tel:' + tel(b.phone)} className="flex items-center gap-3 text-[24px] font-bold hover:text-[#7a5a0f]"><Phone className="shrink-0 text-[#7a5a0f]" size={20} />{b.phone}</a></li>
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={'tel:' + tel(b.phone)} className={`${MONO} inline-flex h-14 items-center gap-2 rounded-lg px-6 text-[14px] font-bold uppercase tracking-[.06em] text-[#15181b] shadow-[0_3px_0_#8a6510]`} style={{ background: GOLD }}><Phone size={17} />Позвонить</a>
            <a href="#book" className={`${MONO} inline-flex h-14 items-center rounded-lg border-2 border-[#15181b] px-6 text-[14px] font-bold uppercase tracking-[.06em] hover:bg-[#15181b] hover:text-white`}>Оставить заявку</a>
          </div>
          <p className="mt-6 text-[15px] text-[#15181b]/70">Не нашли бокс — позвоните, подскажем.</p>
        </div>
        <div className="rounded-[26px] bg-[#e4e6e8] p-3 shadow-[0_30px_60px_-35px_rgba(10,12,14,.5)]">
          <div className="h-[360px] overflow-hidden rounded-[20px] md:h-[460px]"><MapFrame oid={b.oid} /></div>
          <p className={`${MONO} flex justify-between px-2 pt-3 text-[11px] font-bold uppercase tracking-[.12em] text-[#15181b]/60`}><span>Уборевича, 77А</span><span>бокс 100</span></p>
        </div>
      </div>
    </section>
  )
}

/* ---------------- header ---------------- */
const NAV = [['#services', '1', 'Услуги'], ['#symptoms', '2', 'Признаки'], ['#process', '3', 'Ремонт'], ['#terms', '4', 'Сроки'], ['#contact', 'R', 'Контакты']]
function useActive() {
  const [a, setA] = useState('')
  useEffect(() => {
    const els = NAV.map(([h]) => document.querySelector(h)).filter(Boolean)
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) setA('#' + e.target.id) }), { rootMargin: '-45% 0px -50% 0px' })
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])
  return a
}
function Header({ mute, setMute }) {
  const active = useActive()
  return (
    <header className="sticky top-0 z-50 border-b border-[#15181b]/10 bg-[#d6d9dc]/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-4 md:px-10">
        <a href="#top" className="flex min-w-0 items-center gap-2.5" aria-label="Мастерская МКПП — наверх">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#15181b]">
            <svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke={GOLD} strokeWidth="2.4" strokeLinecap="round"><path d="M4 4v12M10 4v12M16 10v6M4 10h12" /></svg>
          </span>
          <span className="min-w-0 leading-none"><span className={`${SANS} block truncate text-[17px] font-extrabold tracking-[-0.03em]`}>Мастерская МКПП</span><span className={`${MONO} block text-[10px] font-bold uppercase tracking-[.14em] text-[#15181b]/60`}>ремонт механики · Чижовка</span></span>
        </a>
        <nav className={`${MONO} hidden items-center gap-1 text-[12px] font-bold uppercase tracking-[.08em] lg:flex`} aria-label="Разделы">
          {NAV.map(([h, n, t]) => (
            <a key={h} href={h} aria-current={active === h ? 'true' : undefined} className={`flex items-center gap-2 rounded-md px-2.5 py-2 transition-colors ${active === h ? 'bg-[#15181b] text-white' : 'hover:bg-[#15181b]/10'}`}>
              <span className={`grid h-5 w-5 place-items-center rounded text-[11px] ${active === h ? 'text-[#15181b]' : 'bg-[#15181b]/10'}`} style={active === h ? { background: GOLD } : undefined}>{n}</span>{t}
            </a>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-3">
          <button type="button" onClick={() => setMute(m => !m)} aria-pressed={!mute} className={`${MONO} hidden h-9 items-center gap-2 rounded-md border border-[#15181b]/25 px-3 text-[10px] font-bold uppercase tracking-[.12em] xl:inline-flex`}><span className="h-2 w-2 rounded-full" style={{ background: mute ? '#999' : GOLD_D }} />Звук {mute ? 'выкл' : 'вкл'}</button>
          <a href={'tel:' + tel(b.phone)} className={`${MONO} hidden text-[14px] font-bold md:inline`}>{b.phone}</a>
          <a href={'tel:' + tel(b.phone)} aria-label="Позвонить" className="grid h-10 w-10 place-items-center rounded-md border-2 border-[#15181b] md:hidden"><Phone size={17} /></a>
          <a href="#book" className={`${MONO} hidden h-10 items-center rounded-md px-4 text-[12px] font-bold uppercase tracking-[.06em] text-[#15181b] sm:inline-flex`} style={{ background: GOLD }}>Записаться</a>
        </div>
      </div>
    </header>
  )
}

function App() {
  useSmooth()
  const lite = useLite()
  const [mute, setMute] = useState(false)
  useEffect(() => { muted = mute }, [mute])
  return (
    <MotionConfig reducedMotion="user">
      <div className={`${SANS} text-[#15181b]`} style={{ background: BASE, '--sel': GOLD, '--selc': INK }}>
        <Ribbon name={b.short} bg={INK} fg="#e9ebed" />
        <Header mute={mute} setMute={setMute} />
        <main>
          <Hero lite={lite} />
          <OnlyManual />
          <Services />
          <Symptoms />
          <Process />
          <Terms />
          <Book />
          <Contact />
        </main>
        <footer className={`${MONO} bg-[#15181b] px-5 py-8 text-[12px] font-bold uppercase tracking-[.08em] text-white/60 md:px-10`}>
          <div className="mx-auto flex max-w-[1280px] flex-wrap justify-between gap-4"><span>© 2026 {b.short} · Концепт сайта — Артём</span><span>{b.addr}, {b.city}</span></div>
        </footer>
        <CallBar phone={b.phone} barCls="bg-[#d6d9dc]/95 backdrop-blur border-t border-[#15181b]/10" callCls="rounded-lg border-2 border-[#15181b] text-[#15181b]" bookCls="rounded-lg bg-[#d4a22c] text-[#15181b]" />
        <div className="h-[72px] bg-[#15181b] sm:hidden" />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
