import React, { useRef, useState, useEffect, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useMotionValue, useInView, AnimatePresence, MotionConfig } from 'framer-motion'
import { ArrowRight, ArrowUp, ArrowDown, Phone, MapPin, Plus, Minus, Check, X, Star, Bell } from 'lucide-react'
import '../lib/base.css'
import { useSmooth, Ribbon, Reveal, useBooking, phoneFocus, CheckDraw, MapFrame, CallBar, tel, useLite, IG, TG, WA, Tilt } from '../lib/kit'

const LiftScene = lazy(() => import('./beautylevel3d'))

const b = {
  name: 'Beauty Level Studio', addr: 'ул. Лобанка, 81', floor: '2 этаж', district: 'Сухарево', city: 'Минск',
  phone: '+375 29 101-05-10', rating: '5,0', rev: 181, oid: '230677524695',
  ig: 'https://www.instagram.com/beauty_level_studio__', tg: 'https://t.me/bl_studio',
  wa: 'https://wa.me/375291010510', viber: 'viber://chat?number=%2B375291010510',
}
const PLUM = '#2a1320', DEEP = '#1c0c15', BRASS = '#c9a46a', CREAM = '#f5ece0'
const F = "font-['Forum',serif]"
const NAV = [['levels', 'Уровни'], ['visit', 'Ваш визит'], ['how', 'Как записаться'], ['rating', 'Отзывы'], ['contact', 'Контакты']]

const LV = [
  { id: 'l1', n: 1, t: 'Волосы', d: 'Стрижки, окрашивание, укладки и уход — от освежить длину до смены образа.', s: [['Женская стрижка', '≈ 1 ч'], ['Мужская стрижка', '≈ 40 мин'], ['Окрашивание', 'от 2 ч'], ['Укладка и причёска', '≈ 1 ч'], ['Уход и восстановление', '≈ 1 ч']] },
  { id: 'l2', n: 2, t: 'Ногти', d: 'Маникюр и педикюр, покрытие и дизайн — аккуратно и без спешки.', s: [['Маникюр', '≈ 1 ч'], ['Маникюр с покрытием', '≈ 1,5–2 ч'], ['Педикюр', '≈ 1,5 ч'], ['Наращивание ногтей', 'от 2 ч'], ['Дизайн', 'по задаче']] },
  { id: 'l3', n: 3, t: 'Брови и ресницы', d: 'Форма, цвет и ламинирование — взгляд, который не нужно рисовать каждое утро.', s: [['Коррекция и окрашивание бровей', '≈ 40 мин'], ['Ламинирование бровей', '≈ 1 ч'], ['Наращивание ресниц', 'от 2 ч'], ['Ламинирование ресниц', '≈ 1 ч']] },
  { id: 'l4', n: 4, t: 'Косметология', d: 'Чистки и уходовые процедуры. Начнём с консультации и разговора о коже.', s: [['Консультация косметолога', '≈ 30 мин'], ['Чистка лица', '≈ 1–1,5 ч'], ['Пилинг', '≈ 1 ч'], ['Уходовая процедура', '≈ 1 ч']] },
  { id: 'l5', n: 5, t: 'Солярий', d: 'Ровный загар круглый год. Время сеанса подскажет администратор.', s: [['Сеанс солярия', 'несколько минут'], ['Подбор времени сеанса', 'бесплатно спросить']] },
]
const ALL = LV.flatMap(l => l.s.map(([t]) => ({ t, lv: l.n })))
const lvOf = t => (ALL.find(x => x.t === t) || {}).lv

function useActive(ids, margin = '-45% 0px -50% 0px') {
  const [a, setA] = useState('')
  useEffect(() => {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) setA(e.target.id) }), { rootMargin: margin })
    ids.forEach(id => { const el = document.getElementById(id); if (el) io.observe(el) })
    return () => io.disconnect()
  }, [])
  return a
}

/* ---------- lift transition ---------- */
function scrollToId(id) {
  const el = document.getElementById(id); if (!el) return
  if (window.__lenis) window.__lenis.scrollTo(el, { immediate: true, offset: -64, force: true })
  else window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 64)
}
function Doors({ ride }) {
  return (
    <AnimatePresence>
      {ride && (
        <motion.div key={ride.k} className="pointer-events-none fixed inset-0 z-[85]" aria-hidden="true">
          {[0, 1].map(side => (
            <motion.div key={side} initial={{ x: side ? '100%' : '-100%' }} animate={{ x: ride.open ? (side ? '100%' : '-100%') : '0%' }} exit={{ x: side ? '100%' : '-100%' }} transition={{ duration: 0.45, ease: [0.7, 0, 0.3, 1] }}
              className={`absolute inset-y-0 w-1/2 ${side ? 'right-0' : 'left-0'}`}
              style={{ background: 'repeating-linear-gradient(90deg,#b8925a 0 2px,#c9a46a 2px 5px,#d9b77c 5px 7px)', boxShadow: side ? 'inset 6px 0 18px rgba(0,0,0,.35)' : 'inset -6px 0 18px rgba(0,0,0,.35)' }} />
          ))}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: ride.open ? 0 : 1 }} transition={{ duration: 0.2 }} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-[#1c0c15] px-8 py-5 text-center shadow-2xl">
            <p className="flex items-center justify-center gap-2 text-[#ffb35c]">{ride.up ? <ArrowUp size={22} /> : <ArrowDown size={22} />}<span className={`${F} text-[56px] leading-none [text-shadow:0_0_18px_rgba(255,179,92,.7)]`}>{ride.n}</span></p>
            <p className="mt-1 text-[15px] font-semibold text-[#f5ece0]">{ride.t}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
function useLift() {
  const [ride, setRide] = useState(null)
  const cur = useRef(0)
  const go = (id, n, t) => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return scrollToId(id)
    const k = Date.now()
    setRide({ k, n, t, up: n >= cur.current, open: false })
    cur.current = n
    setTimeout(() => { scrollToId(id); setRide(r => r && r.k === k ? { ...r, open: true } : r) }, 650)
    setTimeout(() => setRide(r => (r && r.k === k ? null : r)), 1200)
  }
  return { ride, go }
}

/* ---------- header ---------- */
function Header({ go, active }) {
  const a = useActive(NAV.map(n => n[0]))
  const lv = LV.find(l => l.id === active)
  return (
    <header className="sticky top-0 z-40 border-b border-[#c9a46a]/30 bg-[#1c0c15]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-3 px-4 md:px-8">
        <a href="#top" className="flex items-center gap-3 text-[#f5ece0]">
          <span className={`${F} grid h-10 w-10 place-items-center rounded-full border border-[#c9a46a] text-[20px] text-[#c9a46a]`}>BL</span>
          <span className={`${F} text-[22px] leading-none`}>Beauty Level</span>
        </a>
        <div className="hidden items-center gap-1 rounded-full border border-[#c9a46a]/40 bg-black/30 px-3 py-1.5 md:flex" aria-label="Текущий уровень">
          <span className={`${F} w-6 text-center text-[22px] leading-none text-[#ffb35c] [text-shadow:0_0_10px_rgba(255,179,92,.6)]`}>{lv ? lv.n : '·'}</span>
          <span className="text-[13px] text-[#f5ece0]/75">{lv ? lv.t : 'Лобби'}</span>
        </div>
        <nav className="hidden items-center gap-0.5 xl:flex" aria-label="Разделы">
          {NAV.map(([id, t]) => <a key={id} href={'#' + id} aria-current={a === id ? 'true' : undefined} className={`rounded-full px-3.5 py-2 text-[14px] font-medium transition-colors ${a === id ? 'bg-[#c9a46a] text-[#1c0c15]' : 'text-[#f5ece0]/75 hover:text-[#f5ece0]'}`}>{t}</a>)}
        </nav>
        <div className="flex items-center gap-2">
          <a href={'tel:' + tel(b.phone)} className="hidden items-center gap-2 px-2 text-[15px] font-semibold text-[#f5ece0] hover:text-[#c9a46a] lg:flex"><Phone size={16} />{b.phone}</a>
          <a href="#book" className="inline-flex h-11 items-center rounded-full bg-[#c9a46a] px-5 text-[15px] font-bold text-[#1c0c15] hover:bg-[#f5ece0]">Записаться</a>
        </div>
      </div>
    </header>
  )
}

/* ---------- hero with lift panel ---------- */
function LiftButton({ l, on, onPress }) {
  return (
    <button type="button" onClick={onPress} aria-label={`Уровень ${l.n}: ${l.t}`} className="group flex min-h-[56px] w-full items-center gap-4 rounded-full py-1 pl-1 pr-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-[#1c0c15]">
      <span className={`${F} relative grid h-[54px] w-[54px] shrink-0 place-items-center rounded-full text-[24px] transition-all duration-200 group-active:scale-95 ${on ? 'text-[#ffb35c]' : 'text-[#3a2416]'}`}
        style={{ background: 'radial-gradient(circle at 35% 30%,#fff3d6,#d8b67c 45%,#8f6a3a 100%)', boxShadow: on ? '0 0 0 3px #ffb35c, 0 0 22px rgba(255,179,92,.8), inset 0 -3px 6px rgba(0,0,0,.35)' : '0 3px 0 #6e4f2a, 0 6px 14px rgba(0,0,0,.35), inset 0 -3px 6px rgba(0,0,0,.25)' }}>
        <span className={on ? '[text-shadow:0_0_10px_#ffb35c]' : ''}>{l.n}</span>
      </span>
      <span className="text-[17px] font-semibold text-[#2a1320] group-hover:underline">{l.t}</span>
    </button>
  )
}
function Panel({ go, active }) {
  const [pressed, setPressed] = useState(null)
  const lv = LV.find(l => l.id === active)
  const press = l => { setPressed(l.n); go(l.id, l.n, l.t); setTimeout(() => setPressed(null), 1300) }
  return (
    <Tilt max={6} className="relative mx-auto w-full max-w-[380px]">
      <div className="rounded-[30px] p-[3px] shadow-[0_40px_80px_-30px_rgba(0,0,0,.8)]" style={{ background: 'linear-gradient(150deg,#f4dfb2,#a27a44 50%,#e2c48c)' }}>
        <div className="relative rounded-[27px] px-6 pb-6 pt-5" style={{ background: 'linear-gradient(160deg,#ead2a0 0%,#c9a46a 40%,#b08a52 75%,#d7b880 100%)' }}>
          {['left-3 top-3', 'right-3 top-3', 'left-3 bottom-3', 'right-3 bottom-3'].map(p => <span key={p} className={`absolute ${p} h-2.5 w-2.5 rounded-full bg-[#8f6a3a] shadow-[inset_0_1px_1px_rgba(255,255,255,.5)]`} />)}
          <div className="flex items-center justify-between rounded-2xl bg-[#140810] px-5 py-3 shadow-[inset_0_2px_10px_rgba(0,0,0,.8)]">
            <span className={`${F} text-[44px] leading-none text-[#ffb35c] [text-shadow:0_0_14px_rgba(255,179,92,.75)]`}>{pressed || (lv ? lv.n : 'L')}</span>
            <span className="text-right text-[13px] font-semibold uppercase tracking-[.14em] text-[#ffb35c]/80">{pressed ? 'Едем…' : lv ? lv.t : 'Выберите уровень'}</span>
          </div>
          <div className="mt-5 space-y-2">
            {[...LV].reverse().map(l => <LiftButton key={l.id} l={l} on={pressed === l.n} onPress={() => press(l)} />)}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2 border-t border-[#8f6a3a]/40 pt-5">
            <a href={'tel:' + tel(b.phone)} className="flex h-12 items-center justify-center gap-2 rounded-full bg-[#2a1320] text-[15px] font-bold text-[#f5ece0]"><Bell size={16} />Позвонить</a>
            <a href="#book" className="flex h-12 items-center justify-center rounded-full border-2 border-[#2a1320] text-[15px] font-bold text-[#2a1320]">Записаться</a>
          </div>
        </div>
      </div>
    </Tilt>
  )
}
function Hero({ go, active }) {
  return (
    <section id="top" className="relative overflow-hidden bg-[#2a1320] px-5 pb-20 pt-10 text-[#f5ece0] md:px-10 md:pb-28 md:pt-16">
      {/* deco sunburst */}
      <svg aria-hidden="true" viewBox="0 0 800 800" className="pointer-events-none absolute -right-40 top-1/2 h-[1100px] w-[1100px] -translate-y-1/2 opacity-[.13] max-md:hidden">
        {Array.from({ length: 36 }, (_, i) => { const a = (i / 36) * Math.PI * 2; return <line key={i} x1="400" y1="400" x2={400 + Math.cos(a) * 400} y2={400 + Math.sin(a) * 400} stroke="#c9a46a" strokeWidth="2" /> })}
        {[120, 200, 280, 360].map(r => <circle key={r} cx="400" cy="400" r={r} fill="none" stroke="#c9a46a" strokeWidth="1.5" />)}
      </svg>
      <div className="relative mx-auto grid max-w-[1300px] items-center gap-14 lg:grid-cols-[1.2fr_.8fr]">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-[#c9a46a]/50 px-4 py-2 text-[14px] font-semibold"><MapPin size={15} className="text-[#c9a46a]" />{b.addr}, {b.floor} · {b.district}</p>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.2, 0, 0, 1] }} className={`${F} mt-6 text-[clamp(46px,7.2vw,112px)] leading-[.95]`}>
            Салон красоты <span className="text-[#c9a46a]">на пять уровней</span>
          </motion.h1>
          <p className="mt-6 max-w-[540px] text-[18px] leading-relaxed text-[#f5ece0]/85 md:text-[19px]">Волосы, ногти, брови и ресницы, косметология и солярий — в одном месте в Сухарево. Можно собрать несколько услуг в один визит.</p>
          <div className="mt-7 flex flex-wrap items-center gap-x-8 gap-y-4">
            <a href="#rating" className="flex items-center gap-3"><span className={`${F} text-[48px] leading-none text-[#c9a46a]`}>{b.rating}</span><span className="text-[14px] leading-tight">на Яндекс Картах<br /><span className="text-[#f5ece0]/65">{b.rev} оценка</span></span></a>
            <a href={'tel:' + tel(b.phone)} className="text-[19px] font-semibold hover:text-[#c9a46a]">{b.phone}</a>
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#book" className="inline-flex h-14 items-center gap-2 rounded-full bg-[#c9a46a] px-8 text-[17px] font-bold text-[#1c0c15] hover:bg-[#f5ece0]">Записаться <ArrowRight size={18} /></a>
            <a href="#levels" className="inline-flex h-14 items-center rounded-full border-2 border-[#f5ece0]/30 px-7 text-[17px] font-semibold hover:border-[#c9a46a]">Смотреть услуги</a>
          </div>
        </div>
        <div>
          <p className="mb-4 text-center text-[14px] font-semibold uppercase tracking-[.16em] text-[#c9a46a]">Нажмите уровень — поедем</p>
          <Panel go={go} active={active} />
        </div>
      </div>
    </section>
  )
}

/* ---------- levels (sticky 3D + service lists) ---------- */
function LiteShaft({ level }) {
  const [n, setN] = useState(0)
  useEffect(() => level.on('change', v => setN(Math.round(v))), [])
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div className="relative h-[70%] w-28 rounded-xl border-2 border-[#c9a46a]/60">
        {[0, 1, 2, 3, 4].map(i => <span key={i} className="absolute inset-x-0 border-t border-[#c9a46a]/30" style={{ bottom: `${i * 20}%` }} />)}
        <motion.div animate={{ bottom: `${n * 20 + 2}%` }} transition={{ type: 'spring', stiffness: 80, damping: 16 }} className="absolute inset-x-3 h-[16%] rounded-md bg-[#ffcf8a]/80 shadow-[0_0_30px_#ffb35c]" />
      </div>
    </div>
  )
}
function Stage({ level, lite, cls }) {
  const ref = useRef(null)
  const near = useInView(ref, { margin: '200px 0px' })
  const [m, setM] = useState(false)
  useEffect(() => { if (near) setM(true) }, [near])
  return (
    <div ref={ref} className={cls}>
      {lite ? <LiteShaft level={level} /> : m && <Suspense fallback={<LiteShaft level={level} />}><LiftScene level={level} active={near} /></Suspense>}
    </div>
  )
}
function SvcRow({ t, time, on, toggle }) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-[#2a1320]/15 py-4">
      <div className="min-w-0">
        <h4 className="text-[18px] font-semibold leading-snug">{t}</h4>
        <p className="text-[14px] text-[#2a1320]/60">{time} · цена — уточняйте</p>
      </div>
      <div className="flex items-center gap-2">
        <button type="button" aria-pressed={on} onClick={toggle} className={`inline-flex h-11 items-center gap-1.5 rounded-full border-2 px-4 text-[14px] font-bold transition-colors ${on ? 'border-[#2a1320] bg-[#2a1320] text-[#f5ece0]' : 'border-[#2a1320]/25 hover:border-[#2a1320]'}`}>{on ? <Check size={16} /> : <Plus size={16} />}{on ? 'В визите' : 'В визит'}</button>
        <a href="#book" onClick={() => { if (!on) toggle() }} className="inline-flex h-11 items-center px-2 text-[14px] font-bold underline decoration-[#c9a46a] decoration-2 underline-offset-4">Записаться</a>
      </div>
    </li>
  )
}
function Level({ l, visit, toggle }) {
  return (
    <section id={l.id} className="scroll-mt-16 border-b border-[#2a1320]/15 px-5 py-16 md:px-12 md:py-24">
      <div className="flex items-end gap-5">
        <span className={`${F} text-[clamp(96px,12vw,170px)] leading-[.75] text-transparent [-webkit-text-stroke:2px_#c9a46a]`}>{l.n}</span>
        <div className="pb-1">
          <p className="text-[13px] font-bold uppercase tracking-[.18em] text-[#8a6538]">Уровень {l.n}</p>
          <h3 className={`${F} text-[clamp(38px,4.4vw,64px)] leading-[.95]`}>{l.t}</h3>
        </div>
      </div>
      <p className="mt-6 max-w-[520px] text-[18px] leading-relaxed text-[#2a1320]/80">{l.d}</p>
      <ul className="mt-6 border-t border-[#2a1320]/15">
        {l.s.map(([t, time]) => <SvcRow key={t} t={t} time={time} on={visit.includes(t)} toggle={() => toggle(t)} />)}
      </ul>
    </section>
  )
}
function Levels({ level, lite, visit, toggle }) {
  return (
    <section id="levels" className="scroll-mt-16 bg-[#f5ece0] text-[#2a1320]">
      <div className="mx-auto max-w-[1400px] px-5 pt-20 md:px-12 md:pt-28">
        <p className="text-[14px] font-bold uppercase tracking-[.18em] text-[#8a6538]">Услуги</p>
        <h2 className={`${F} mt-2 text-[clamp(48px,7vw,104px)] leading-[.95]`}>Пять уровней ухода</h2>
        <p className="mt-4 max-w-[560px] text-[18px] text-[#2a1320]/75">Отмечайте «В визит» на любых уровнях — соберём всё в одну запись. Длительность ориентировочная, цены уточнит администратор.</p>
      </div>
      <div className="mx-auto mt-10 grid max-w-[1400px] lg:grid-cols-[.85fr_1.15fr]">
        <div className="relative hidden lg:block">
          <div className="sticky top-16 h-[calc(100vh-64px)] overflow-hidden bg-[#2a1320]">
            <Stage level={level} lite={lite} cls="absolute inset-0" />
            <LevelHud />
          </div>
        </div>
        <Stage level={level} lite={lite} cls="relative h-[46vh] bg-[#2a1320] lg:hidden" />
        <div>{LV.map(l => <Level key={l.id} l={l} visit={visit} toggle={toggle} />)}</div>
      </div>
    </section>
  )
}
function LevelHud() {
  const a = useActive(LV.map(l => l.id))
  const l = LV.find(x => x.id === a) || LV[0]
  return (
    <div className="pointer-events-none absolute bottom-8 left-8 right-8 flex items-end justify-between text-[#f5ece0]">
      <AnimatePresence mode="wait"><motion.p key={l.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={`${F} text-[34px] leading-none`}><span className="text-[#ffb35c]">{l.n}</span> · {l.t}</motion.p></AnimatePresence>
      <a href="#visit" className="pointer-events-auto text-[15px] font-semibold underline underline-offset-4">Пропустить →</a>
    </div>
  )
}

/* ---------- visit builder ---------- */
function Visit({ visit, toggle, clear }) {
  const stops = LV.map(l => ({ l, items: visit.filter(t => lvOf(t) === l.n) })).filter(x => x.items.length)
  return (
    <section id="visit" className="scroll-mt-16 bg-[#1c0c15] px-5 py-20 text-[#f5ece0] md:px-10 md:py-28">
      <div className="mx-auto grid max-w-[1300px] gap-12 lg:grid-cols-[.9fr_1.1fr]">
        <div>
          <p className="text-[14px] font-bold uppercase tracking-[.18em] text-[#c9a46a]">Ваш визит</p>
          <h2 className={`${F} mt-2 text-[clamp(44px,6vw,92px)] leading-[.95]`}>Несколько услуг — одна запись</h2>
          <p className="mt-5 max-w-[460px] text-[18px] leading-relaxed text-[#f5ece0]/80">Лифт сам заедет на нужные уровни. Администратор подберёт порядок процедур и время, чтобы не ждать между ними.</p>
        </div>
        <div className="rounded-[28px] border border-[#c9a46a]/35 bg-[#2a1320] p-6 md:p-9">
          {stops.length === 0 ? (
            <div>
              <p className={`${F} text-[30px] leading-tight`}>Пока пусто</p>
              <p className="mt-2 text-[17px] text-[#f5ece0]/70">Добавьте услуги кнопкой «В визит» — или начните с популярного:</p>
              <div className="mt-5 flex flex-wrap gap-2">{['Маникюр с покрытием', 'Коррекция и окрашивание бровей', 'Женская стрижка', 'Сеанс солярия'].map(t => <button key={t} type="button" onClick={() => toggle(t)} className="inline-flex min-h-[48px] items-center gap-1.5 rounded-full border-2 border-[#c9a46a]/40 px-4 text-[15px] font-semibold hover:border-[#c9a46a]"><Plus size={15} />{t}</button>)}</div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between"><p className="text-[15px] font-semibold text-[#f5ece0]/70">{visit.length} услуг(и) · {stops.length} уровн{stops.length === 1 ? 'ь' : 'я'}</p><button type="button" onClick={clear} className="min-h-[44px] text-[14px] font-semibold text-[#f5ece0]/60 underline underline-offset-4 hover:text-[#f5ece0]">Очистить</button></div>
              <ol className="relative mt-4 space-y-5 before:absolute before:bottom-3 before:left-[23px] before:top-3 before:w-[2px] before:bg-[#c9a46a]/40">
                {stops.map(({ l, items }) => (
                  <motion.li layout key={l.id} className="relative flex gap-5">
                    <span className={`${F} relative grid h-12 w-12 shrink-0 place-items-center rounded-full text-[22px] text-[#ffb35c] shadow-[0_0_0_3px_#2a1320]`} style={{ background: 'radial-gradient(circle at 35% 30%,#4a2a35,#1c0c15)' }}>{l.n}</span>
                    <div className="flex-1 pt-1">
                      <p className={`${F} text-[24px] leading-none`}>{l.t}</p>
                      <ul className="mt-2 flex flex-wrap gap-2">{items.map(t => <li key={t}><button type="button" onClick={() => toggle(t)} aria-label={'Убрать ' + t} className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full bg-[#f5ece0] px-3.5 text-[14px] font-semibold text-[#2a1320] hover:bg-white">{t}<X size={14} /></button></li>)}</ul>
                    </div>
                  </motion.li>
                ))}
              </ol>
              <a href="#book" className="mt-8 flex h-14 items-center justify-center gap-2 rounded-full bg-[#c9a46a] text-[17px] font-bold text-[#1c0c15] hover:bg-[#f5ece0]">Записаться на весь визит <ArrowRight size={18} /></a>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
function VisitPill({ visit }) {
  const show = visit.length > 0
  return (
    <AnimatePresence>
      {show && (
        <motion.a href="#visit" initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }} className="fixed bottom-[84px] left-1/2 z-[45] flex h-12 -translate-x-1/2 items-center gap-3 whitespace-nowrap rounded-full border border-[#c9a46a] bg-[#1c0c15] pl-2 pr-5 text-[15px] font-semibold text-[#f5ece0] shadow-2xl sm:bottom-6 sm:left-auto sm:right-6 sm:translate-x-0">
          <span className={`${F} grid h-9 w-9 place-items-center rounded-full bg-[#c9a46a] text-[19px] text-[#1c0c15]`}>{visit.length}</span>Ваш визит <ArrowRight size={16} />
        </motion.a>
      )}
    </AnimatePresence>
  )
}

/* ---------- how / rating / faq ---------- */
const HOW = [['Соберите визит', 'Отметьте услуги на нужных уровнях — или просто позвоните.'], ['Оставьте заявку', 'Имя, телефон и удобное время — меньше минуты.'], ['Подтвердим время', 'Администратор свяжется и согласует запись.'], ['Приходите', `${b.addr}, ${b.floor}. Мы ждём.`]]
function How() {
  return (
    <section id="how" className="scroll-mt-16 bg-[#f5ece0] px-5 py-20 text-[#2a1320] md:px-10 md:py-28">
      <div className="mx-auto max-w-[1300px]">
        <h2 className={`${F} text-[clamp(44px,6vw,92px)] leading-[.95]`}>Как записаться</h2>
        <ol className="mt-12 grid gap-4 md:grid-cols-4">
          {HOW.map(([t, d], i) => (
            <Reveal as="li" key={t} delay={i * 0.07} className="rounded-[26px] border border-[#2a1320]/12 bg-white/60 p-6">
              <span className={`${F} grid h-12 w-12 place-items-center rounded-full text-[22px] text-[#3a2416]`} style={{ background: 'radial-gradient(circle at 35% 30%,#fff3d6,#d8b67c 45%,#8f6a3a 100%)' }}>{i + 1}</span>
              <h3 className={`${F} mt-5 text-[28px] leading-none`}>{t}</h3>
              <p className="mt-3 text-[17px] leading-snug text-[#2a1320]/75">{d}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
function Rating() {
  return (
    <section id="rating" className="scroll-mt-16 bg-[#2a1320] px-5 py-20 text-[#f5ece0] md:px-10 md:py-28">
      <div className="mx-auto grid max-w-[1300px] gap-4 md:grid-cols-3">
        <Reveal className="rounded-[28px] p-8 text-[#2a1320] md:col-span-2 md:p-12" style={{ background: 'linear-gradient(150deg,#ead2a0,#c9a46a 55%,#b08a52)' }}>
          <p className="text-[14px] font-bold uppercase tracking-[.18em]">Яндекс Карты</p>
          <div className="mt-3 flex flex-wrap items-end gap-6"><p className={`${F} text-[clamp(110px,15vw,200px)] leading-[.8]`}>{b.rating}</p><div className="pb-3"><div className="flex gap-1" aria-label="5 из 5">{[0, 1, 2, 3, 4].map(i => <Star key={i} size={26} fill="#2a1320" strokeWidth={0} />)}</div><p className="mt-2 text-[19px] font-semibold">{b.rev} оценка гостей</p></div></div>
          <a href={`https://yandex.ru/maps/org/${b.oid}/reviews/`} target="_blank" rel="noopener" className="mt-8 inline-flex h-14 items-center gap-2 rounded-full bg-[#2a1320] px-7 text-[16px] font-bold text-[#f5ece0]">Читать отзывы <ArrowRight size={18} /></a>
        </Reveal>
        <div className="grid gap-4">
          <Reveal delay={0.05}><a href={b.ig} target="_blank" rel="noopener" className="flex h-full items-center gap-4 rounded-[28px] border border-[#c9a46a]/35 p-6 hover:bg-white/5"><IG width={30} height={30} className="text-[#c9a46a]" /><span><span className={`${F} block text-[26px] leading-none`}>Instagram</span><span className="text-[15px] text-[#f5ece0]/65">работы мастеров</span></span></a></Reveal>
          <Reveal delay={0.1}><a href={b.tg} target="_blank" rel="noopener" className="flex h-full items-center gap-4 rounded-[28px] border border-[#c9a46a]/35 p-6 hover:bg-white/5"><TG width={30} height={30} className="text-[#c9a46a]" /><span><span className={`${F} block text-[26px] leading-none`}>Telegram</span><span className="text-[15px] text-[#f5ece0]/65">новости студии</span></span></a></Reveal>
        </div>
      </div>
    </section>
  )
}
const FAQ = [
  ['Можно сделать несколько услуг за один визит?', 'Да. Соберите визит на сайте или скажите по телефону — администратор подскажет порядок и подберёт время.'],
  ['Сколько длится процедура?', 'На сайте указана ориентировочная длительность. Точнее скажет мастер — зависит от задачи.'],
  ['Сколько стоит?', 'Цены уточняйте у администратора по телефону или в мессенджерах.'],
  ['Можно прийти с ребёнком?', 'Лучше уточнить при записи — подскажем, как удобнее.'],
  ['Как оплатить?', 'Способы оплаты уточняйте по телефону.'],
  ['Как вас найти?', `${b.addr}, ${b.floor}, ${b.district}. Карта — ниже.`],
]
function Faq() {
  const [o, setO] = useState(0)
  return (
    <section id="faq" className="bg-[#f5ece0] px-5 py-20 text-[#2a1320] md:px-10 md:py-28">
      <div className="mx-auto grid max-w-[1300px] gap-10 lg:grid-cols-[.8fr_1.2fr]">
        <h2 className={`${F} text-[clamp(44px,6vw,92px)] leading-[.95]`}>Вопросы</h2>
        <div className="border-t border-[#2a1320]/20">
          {FAQ.map(([q, a], i) => (
            <div key={q} className="border-b border-[#2a1320]/20">
              <h3><button type="button" aria-expanded={o === i} aria-controls={'bq' + i} onClick={() => setO(o === i ? -1 : i)} className="flex w-full items-center justify-between gap-6 py-5 text-left text-[19px] font-semibold md:text-[21px]">{q}<span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${o === i ? 'bg-[#c9a46a]' : 'bg-[#2a1320] text-[#f5ece0]'}`}>{o === i ? <Minus size={18} /> : <Plus size={18} />}</span></button></h3>
              <AnimatePresence initial={false}>{o === i && <motion.div id={'bq' + i} initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.28 }} className="overflow-hidden"><p className="max-w-[680px] pb-6 text-[17px] leading-relaxed text-[#2a1320]/80">{a}</p></motion.div>}</AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------- booking ---------- */
const DAYS = ['Сегодня', 'Завтра', 'На неделе', 'В выходные']
const PARTS = ['Утро', 'День', 'Вечер']
const VIA = ['Звонок', 'Viber', 'WhatsApp', 'Telegram']
function Opt({ on, children, ...r }) {
  return <button type="button" aria-pressed={on} className={`min-h-[50px] rounded-full border-2 px-5 text-[16px] font-semibold transition-colors ${on ? 'border-[#c9a46a] bg-[#c9a46a] text-[#1c0c15]' : 'border-[#f5ece0]/20 text-[#f5ece0] hover:border-[#c9a46a]'}`} {...r}>{children}</button>
}
function Book({ visit, toggle }) {
  const bk = useBooking()
  const [step, setStep] = useState(0)
  const [day, setDay] = useState(''), [part, setPart] = useState(''), [via, setVia] = useState('Звонок')
  const [err, setErr] = useState('')
  const head = useRef(null)
  useEffect(() => { if (step) head.current?.focus() }, [step])
  const next = e => {
    e.preventDefault()
    if (step === 0 && !visit.length) return setErr('Выберите хотя бы одну услугу')
    if (step === 1 && (!day || !part)) return setErr('Выберите день и время суток')
    setErr('')
    if (step < 2) setStep(step + 1); else bk.submit()
  }
  return (
    <section id="book" className="scroll-mt-16 bg-[#1c0c15] px-5 py-20 text-[#f5ece0] md:px-10 md:py-28">
      <div className="mx-auto grid max-w-[1300px] gap-12 lg:grid-cols-[.85fr_1.15fr]">
        <div>
          <h2 className={`${F} text-[clamp(48px,7vw,104px)] leading-[.95]`}>Запись</h2>
          <p className="mt-5 max-w-[420px] text-[18px] text-[#f5ece0]/75">Три шага — администратор свяжется и подтвердит время. Или напишите сразу:</p>
          <a href={'tel:' + tel(b.phone)} className={`${F} mt-3 inline-block text-[40px] text-[#c9a46a]`}>{b.phone}</a>
          <div className="mt-4 flex flex-wrap gap-2">
            <a href={b.viber} className="inline-flex h-11 items-center rounded-full border border-[#f5ece0]/25 px-4 text-[15px] font-semibold hover:border-[#c9a46a]">Viber</a>
            <a href={b.wa} target="_blank" rel="noopener" className="inline-flex h-11 items-center gap-2 rounded-full border border-[#f5ece0]/25 px-4 text-[15px] font-semibold hover:border-[#c9a46a]"><WA width={16} height={16} />WhatsApp</a>
            <a href={b.tg} target="_blank" rel="noopener" className="inline-flex h-11 items-center gap-2 rounded-full border border-[#f5ece0]/25 px-4 text-[15px] font-semibold hover:border-[#c9a46a]"><TG width={16} height={16} />Telegram</a>
          </div>
        </div>
        <div className="rounded-[28px] border border-[#c9a46a]/35 bg-[#2a1320] p-5 md:p-9">
          {bk.s.sent ? (
            <div className="py-6 text-center" role="status">
              <CheckDraw className="mx-auto text-[#c9a46a]" />
              <p className={`${F} mt-5 text-[44px] leading-none`}>Заявка принята</p>
              <p className="mx-auto mt-3 max-w-[440px] text-[17px] text-[#f5ece0]/75">{visit.join(', ')} · {day}, {part.toLowerCase()}. Свяжемся: {via.toLowerCase()}. В готовом сайте заявка сразу придёт вам в Telegram.</p>
              <button type="button" onClick={() => { bk.reset(); setStep(0); setDay(''); setPart('') }} className="mt-8 min-h-[44px] text-[15px] font-semibold underline underline-offset-4">Новая заявка</button>
            </div>
          ) : (
            <form onSubmit={next} noValidate>
              <div className="grid grid-cols-3 gap-1.5 text-[13px] font-semibold" aria-hidden="true">{['Услуги', 'Время', 'Контакт'].map((t, i) => <span key={t} className={`rounded-full py-2 text-center ${i <= step ? 'bg-[#c9a46a] text-[#1c0c15]' : 'bg-white/10 text-[#f5ece0]/55'}`}>{i + 1}. {t}</span>)}</div>
              <p className="sr-only">Шаг {step + 1} из 3</p>
              <h3 ref={head} tabIndex={-1} className={`${F} mt-7 text-[34px] leading-none outline-none`}>{['Что делаем?', 'Когда удобно?', 'Как связаться?'][step]}</h3>
              <AnimatePresence mode="wait">
                <motion.div key={step} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }} className="mt-6">
                  {step === 0 && <div className="space-y-4">{LV.map(l => (
                    <div key={l.id}><p className="mb-2 text-[13px] font-bold uppercase tracking-[.16em] text-[#c9a46a]">{l.n} · {l.t}</p>
                      <div className="flex flex-wrap gap-2">{l.s.map(([t]) => <Opt key={t} on={visit.includes(t)} onClick={() => { toggle(t); setErr('') }}>{t}</Opt>)}</div></div>))}</div>}
                  {step === 1 && <div className="space-y-5"><div className="flex flex-wrap gap-2">{DAYS.map(d => <Opt key={d} on={day === d} onClick={() => { setDay(d); setErr('') }}>{d}</Opt>)}</div><div className="flex flex-wrap gap-2">{PARTS.map(d => <Opt key={d} on={part === d} onClick={() => { setPart(d); setErr('') }}>{d}</Opt>)}</div></div>}
                  {step === 2 && <div className="space-y-4">
                    <div><label htmlFor="b-name" className="text-[14px] font-semibold text-[#f5ece0]/70">Имя</label><input id="b-name" value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} autoComplete="name" className="mt-1.5 h-14 w-full rounded-2xl border-2 border-[#f5ece0]/20 bg-transparent px-4 text-[17px] outline-none focus:border-[#c9a46a]" /></div>
                    <div><label htmlFor="b-phone" className="text-[14px] font-semibold text-[#f5ece0]/70">Телефон</label><input id="b-phone" value={bk.s.phone} onChange={e => bk.upd('phone', e.target.value)} onFocus={phoneFocus(bk)} type="tel" inputMode="tel" autoComplete="tel" placeholder="+375 __ ___-__-__" aria-invalid={bk.s.err} aria-describedby={bk.s.err ? 'b-perr' : undefined} className={`mt-1.5 h-14 w-full rounded-2xl border-2 bg-transparent px-4 text-[17px] outline-none placeholder:text-[#f5ece0]/35 focus:border-[#c9a46a] ${bk.s.err ? 'border-[#ff8a8a]' : 'border-[#f5ece0]/20'}`} />
                      {bk.s.err && <p id="b-perr" className="mt-2 text-[15px] text-[#ffa3a3]">Проверьте номер — 12 цифр с кодом +375.</p>}</div>
                    <fieldset><legend className="text-[14px] font-semibold text-[#f5ece0]/70">Как удобнее связаться</legend><div className="mt-2 flex flex-wrap gap-2">{VIA.map(v => <Opt key={v} on={via === v} onClick={() => setVia(v)}>{v}</Opt>)}</div></fieldset>
                  </div>}
                </motion.div>
              </AnimatePresence>
              {err && <p className="mt-4 text-[15px] text-[#ffa3a3]" role="alert">{err}</p>}
              <div className="mt-8 flex items-center justify-between">
                {step > 0 ? <button type="button" onClick={() => setStep(step - 1)} className="min-h-[44px] text-[15px] font-semibold text-[#f5ece0]/70 hover:text-[#f5ece0]">← Назад</button> : <span className="text-[14px] text-[#f5ece0]/55">{visit.length ? `Выбрано: ${visit.length}` : ''}</span>}
                <button type="submit" disabled={bk.s.loading} className="inline-flex h-14 items-center gap-2 rounded-full bg-[#c9a46a] px-7 text-[17px] font-bold text-[#1c0c15] hover:bg-[#f5ece0] disabled:opacity-60">{step < 2 ? 'Дальше' : bk.s.loading ? 'Отправляем…' : 'Записаться'} <ArrowRight size={18} /></button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

function Contact() {
  return (
    <section id="contact" className="scroll-mt-16 bg-[#2a1320] text-[#f5ece0]">
      <div className="mx-auto grid max-w-[1400px] lg:grid-cols-2">
        <div className="px-5 py-20 md:px-10">
          <h2 className={`${F} text-[clamp(48px,7vw,104px)] leading-[.95]`}>Контакты</h2>
          <dl className="mt-10 space-y-6">
            <div><dt className="text-[13px] font-bold uppercase tracking-[.16em] text-[#c9a46a]">Адрес</dt><dd className={`${F} mt-1 text-[30px] leading-tight`}>{b.addr}, {b.floor}<br /><span className="text-[#f5ece0]/70">{b.district}, {b.city}</span></dd></div>
            <div><dt className="text-[13px] font-bold uppercase tracking-[.16em] text-[#c9a46a]">Телефон, Viber, WhatsApp</dt><dd><a href={'tel:' + tel(b.phone)} className={`${F} mt-1 inline-block text-[32px]`}>{b.phone}</a></dd></div>
            <div><dt className="text-[13px] font-bold uppercase tracking-[.16em] text-[#c9a46a]">Часы работы</dt><dd className="mt-1 text-[17px]">Уточняйте по телефону</dd></div>
          </dl>
          <div className="mt-8 flex flex-wrap gap-2.5">
            <a href={'tel:' + tel(b.phone)} className="inline-flex h-14 items-center gap-2 rounded-full bg-[#c9a46a] px-7 text-[16px] font-bold text-[#1c0c15]"><Phone size={18} />Позвонить</a>
            <a href={b.ig} target="_blank" rel="noopener" aria-label="Instagram" className="grid h-14 w-14 place-items-center rounded-full border border-[#f5ece0]/30 hover:border-[#c9a46a]"><IG width={20} height={20} /></a>
            <a href={b.tg} target="_blank" rel="noopener" aria-label="Telegram" className="grid h-14 w-14 place-items-center rounded-full border border-[#f5ece0]/30 hover:border-[#c9a46a]"><TG width={20} height={20} /></a>
            <a href={b.wa} target="_blank" rel="noopener" aria-label="WhatsApp" className="grid h-14 w-14 place-items-center rounded-full border border-[#f5ece0]/30 hover:border-[#c9a46a]"><WA width={20} height={20} /></a>
            <a href={`https://yandex.ru/maps/org/${b.oid}/`} target="_blank" rel="noopener" className="inline-flex h-14 items-center gap-2 rounded-full border border-[#f5ece0]/30 px-6 text-[16px] font-semibold hover:border-[#c9a46a]">Маршрут <ArrowRight size={18} /></a>
          </div>
        </div>
        <div className="h-[400px] lg:h-auto lg:min-h-[560px]"><MapFrame oid={b.oid} /></div>
      </div>
    </section>
  )
}

function App() {
  useSmooth()
  const lite = useLite()
  const { ride, go } = useLift()
  const [visit, setVisit] = useState([])
  const toggle = t => setVisit(v => (v.includes(t) ? v.filter(x => x !== t) : [...v, t]))
  const active = useActive(LV.map(l => l.id))
  const level = useMotionValue(0)
  useEffect(() => { const i = LV.findIndex(l => l.id === active); if (i >= 0) level.set(i) }, [active])
  return (
    <MotionConfig reducedMotion="user">
      <div className="overflow-x-clip font-['Raleway',sans-serif]" style={{ background: PLUM, color: CREAM, '--sel': BRASS, '--selc': DEEP }}>
        <Ribbon name={b.name} bg={BRASS} fg={DEEP} />
        <Header go={go} active={active} />
        <main>
          <Hero go={go} active={active} />
          <Levels level={level} lite={lite} visit={visit} toggle={toggle} />
          <Visit visit={visit} toggle={toggle} clear={() => setVisit([])} />
          <How />
          <Rating />
          <Faq />
          <Book visit={visit} toggle={toggle} />
          <Contact />
        </main>
        <footer className="flex flex-wrap justify-between gap-3 border-t border-[#c9a46a]/25 bg-[#1c0c15] px-5 py-6 text-[14px] text-[#f5ece0]/60 md:px-10"><span>© 2026 {b.name} · Концепт сайта — Артём</span><span>{b.addr}, {b.floor}, {b.city}</span></footer>
        <VisitPill visit={visit} />
        <Doors ride={ride} />
        <CallBar phone={b.phone} barCls="bg-[#1c0c15]/95 backdrop-blur border-t border-[#c9a46a]/30" callCls="rounded-full border-2 border-[#c9a46a] text-[#f5ece0]" bookCls="rounded-full bg-[#c9a46a] text-[#1c0c15]" />
        <div className="h-[72px] bg-[#1c0c15] sm:hidden" />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
