import React, { useRef, useState, useEffect, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, useSpring, useInView, useMotionValue, useMotionValueEvent, AnimatePresence, MotionConfig } from 'framer-motion'
import { ArrowRight, ArrowUpRight, Phone, MapPin, Star, X, Plus, Clock } from 'lucide-react'
import '../lib/base.css'
import { useSmooth, Ribbon, LineReveal, Reveal, useBooking, phoneFocus, CheckDraw, MapFrame, CallBar, tel, useLite, IG } from '../lib/kit'

const Facebook = ({ size = 18 }) => (<svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true"><path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.6V21h3.1Z" /></svg>)
const Tokens = lazy(() => import('./nadezhda3d'))

const b = {
  name: 'Надежда', addr: 'ул. Плеханова, 72', place: 'Дом быта, 1 этаж', city: 'Минск',
  phone: '+375 29 317-16-81', ig: 'https://www.instagram.com/salon_nadejda/', fb: 'https://facebook.com/nadejda.salon',
  rating: '4,9', rev: 326, oid: '1107074330',
}
const BASE = '#fbf6f0', INK = '#24203a'
const DISP = "font-['Rubik',sans-serif]", SANS = "font-['Onest',sans-serif]"
const SP = [
  { t: 'Стрижка', c: '#ff9f8a', soft: '#ffe6dd', items: ['Женская стрижка', 'Мужская стрижка', 'Детская стрижка', 'Укладка'] },
  { t: 'Окрашивание', c: '#a48bff', soft: '#ece6ff', items: ['Окрашивание в один тон', 'Тонирование', 'Мелирование', 'Сложное окрашивание'] },
  { t: 'Маникюр', c: '#4fc6a0', soft: '#ddf5ea', items: ['Маникюр', 'Покрытие гель-лаком', 'Педикюр', 'Уход за руками'] },
  { t: 'Солярий', c: '#f4b73b', soft: '#fff1c9', items: ['Сеанс солярия', 'Короткие сеансы', 'Загар к отпуску', 'Подбор времени'] },
]
const PASTEL = 'linear-gradient(120deg,#ffb5a3 0%,#ffc6e0 30%,#c8b8ff 60%,#9fe3c9 100%)'
const CAP = [
  { n: '01', h: 'Свежая стрижка — без долгих поисков.', d: 'Женские, мужские и детские стрижки, укладка. Первый этаж Дома быта.' },
  { n: '02', h: 'Цвет, который хочется носить.', d: 'От тонирования до сложного окрашивания — оттенок подберём вместе.' },
  { n: '03', h: 'Аккуратные руки — в соседнем кресле.', d: 'Маникюр, покрытие, педикюр. Можно совместить со стрижкой в один визит.' },
  { n: '04', h: 'Немного солнца в любой сезон.', d: 'Короткие сеансы для ровного загара. Время подскажем под ваш тип кожи.' },
  { n: '∞', h: 'Всё в одном месте.', d: 'Стрижка, цвет, ногти и солнце — один адрес, одна запись.' },
]
const stageOf = v => (v < 0.1 ? -1 : v < 0.3 ? 0 : v < 0.48 ? 1 : v < 0.66 ? 2 : v < 0.84 ? 3 : 4)
const BOUNCE = { type: 'spring', stiffness: 380, damping: 22 }

/* hand-drawn underline */
function Scribble({ color = '#ff8a73', delay = 0.6, className = '' }) {
  return (
    <svg viewBox="0 0 300 24" preserveAspectRatio="none" className={'pointer-events-none absolute -bottom-[0.12em] left-0 h-[0.28em] w-full ' + className} fill="none" aria-hidden="true">
      <motion.path d="M4 16 C 60 6, 120 4, 170 10 S 260 20, 296 8" stroke={color} strokeWidth="7" strokeLinecap="round"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 0.9, delay, ease: [0.65, 0, 0.35, 1] }} />
    </svg>
  )
}

/* ---------------- living board (pinned film) ---------------- */
function SpaceCard({ t, c, soft, i, big }) {
  const r = [-14, 10, -8, 16][i % 4]
  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.4, rotate: r, x: r * 6, y: 60 }} animate={{ opacity: 1, scale: 1, rotate: 0, x: 0, y: 0 }} exit={{ opacity: 0, scale: 0.6, rotate: -r, y: -30 }}
      transition={{ ...BOUNCE, delay: i * 0.06 }}
      className={`relative overflow-hidden rounded-[20px] bg-white p-3.5 shadow-[0_10px_30px_-18px_rgba(36,32,58,.45)] md:p-4 ${big ? 'col-span-2' : ''}`}>
      <span className="absolute -right-6 -top-6 h-16 w-16 rounded-full opacity-70 blur-xl" style={{ background: c }} />
      <span className="relative mb-2 block h-2 w-8 rounded-full" style={{ background: c }} />
      <p className={`${DISP} relative text-[14px] font-medium leading-tight md:text-[16px]`}>{t}</p>
      {big && <p className="relative mt-1 text-[12.5px] text-[#24203a]/55">Свободное время — по звонку</p>}
      <span className="absolute bottom-3 right-3 hidden h-6 w-6 place-items-center rounded-full md:grid" style={{ background: soft }}><Plus size={13} /></span>
    </motion.div>
  )
}
function Board({ stage }) {
  const on = stage >= 0
  const s = SP[Math.min(stage, 3)] || SP[0]
  const all = stage === 4
  return (
    <motion.div initial={false} animate={on ? { y: 0, opacity: 1, rotate: 0, scale: 1 } : { y: 160, opacity: 0, rotate: 5, scale: 0.92 }} transition={{ type: 'spring', stiffness: 160, damping: 18 }}
      className="absolute inset-x-4 bottom-[96px] top-[54svh] md:inset-x-auto md:bottom-auto md:right-[4vw] md:top-[calc(50%-min(230px,29vh))] md:h-[min(460px,58vh)] md:w-[min(640px,50vw)]">
      <motion.div animate={{ backgroundColor: all ? '#f6eefc' : s.soft }} transition={{ duration: 0.6 }} className="flex h-full overflow-hidden rounded-[28px] border-[6px] border-white shadow-[0_40px_80px_-40px_rgba(36,32,58,.45)]">
        {/* sidebar */}
        <div className="hidden w-[190px] shrink-0 flex-col p-3 md:flex">
          <div className="mb-4 flex gap-1.5 px-2 pt-1">{['#ff8a73', '#f4b73b', '#4fc6a0'].map(c => <span key={c} className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />)}</div>
          <div className={`${DISP} mb-3 rounded-xl bg-white/60 px-3 py-2 text-[12px] text-[#24203a]/55`}>Надежда › {all ? 'всё' : s.t.toLowerCase()}</div>
          {SP.map((x, i) => (
            <div key={x.t} className={`${DISP} relative flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[14px] font-medium`}>
              {(stage === i || all) && <motion.span layoutId={all ? undefined : 'sb'} className="absolute inset-0 rounded-xl bg-white shadow-[0_6px_16px_-10px_rgba(36,32,58,.5)]" transition={BOUNCE} />}
              <span className="relative h-3 w-3 rounded-[5px]" style={{ background: x.c }} />
              <span className="relative">{x.t}</span>
            </div>
          ))}
          <p className="mt-auto px-3 text-[11.5px] leading-snug text-[#24203a]/45">Плеханова, 72<br />Дом быта, 1 этаж</p>
        </div>
        {/* content */}
        <div className="m-2 flex min-w-0 flex-1 flex-col rounded-[20px] bg-white/55 p-3 md:ml-0 md:p-5">
          <div className="mb-3 flex gap-1.5 overflow-hidden md:hidden">
            {SP.map((x, i) => <span key={x.t} className={`${DISP} shrink-0 rounded-full px-2.5 py-1 text-[11.5px] font-medium ${stage === i || all ? 'bg-white shadow-sm' : 'text-[#24203a]/45'}`}>{x.t}</span>)}
          </div>
          <AnimatePresence mode="popLayout">
            <motion.p key={all ? 'all' : s.t} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={BOUNCE}
              className={`${DISP} mb-3 text-[22px] font-semibold leading-none tracking-[-0.03em] md:mb-4 md:text-[34px]`}>{all ? 'Один визит' : s.t}</motion.p>
          </AnimatePresence>
          <div className="grid flex-1 auto-rows-fr grid-cols-2 gap-2 md:gap-3">
            <AnimatePresence mode="popLayout">
              {all
                ? SP.map((x, i) => <SpaceCard key={'all' + i} i={i} t={x.t} c={x.c} soft={x.soft} />)
                : s.items.map((t, i) => <SpaceCard key={stage + '-' + i} i={i} t={t} c={s.c} soft={s.soft} />)}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
function Blobs() {
  const x = useMotionValue(0), y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 40, damping: 14 }), sy = useSpring(y, { stiffness: 40, damping: 14 })
  const ix = useTransform(sx, v => -v * 0.6), iy = useTransform(sy, v => -v * 0.6)
  useEffect(() => {
    const m = e => { x.set((e.clientX / innerWidth - 0.5) * 160); y.set((e.clientY / innerHeight - 0.5) * 120) }
    addEventListener('pointermove', m); return () => removeEventListener('pointermove', m)
  }, [])
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <motion.div style={{ x: sx, y: sy }} className="absolute -left-[10%] top-[8%] h-[55vmax] w-[55vmax] rounded-full bg-[#ffc9b8] opacity-60 blur-[90px]" />
      <motion.div style={{ x: ix, y: iy }} className="absolute -right-[12%] bottom-[-10%] h-[50vmax] w-[50vmax] rounded-full bg-[#d4c6ff] opacity-60 blur-[90px]" />
      <motion.div style={{ x: iy, y: sx }} className="absolute left-[40%] top-[50%] h-[30vmax] w-[30vmax] rounded-full bg-[#bff0dc] opacity-50 blur-[80px]" />
    </div>
  )
}
function LiteTokens({ stage }) {
  return (
    <div className="absolute right-[6%] top-[14%] hidden gap-4 md:flex">
      {SP.map((x, i) => <motion.span key={i} animate={{ scale: stage === i ? 1.3 : 1, y: stage === i ? -10 : 0 }} transition={BOUNCE} className="h-16 w-16 rounded-[22px]" style={{ background: x.c }} />)}
    </div>
  )
}
function Film({ lite }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const p = useSpring(scrollYProgress, { stiffness: 110, damping: 26, mass: 0.3 })
  const near = useInView(ref, { margin: '300px 0px' })
  const [mounted, setMounted] = useState(false)
  useEffect(() => { if (near) setMounted(true) }, [near])
  const [stage, setStage] = useState(-1)
  const stageRef = useRef(-1)
  useMotionValueEvent(p, 'change', v => { const s = stageOf(v); if (s !== stageRef.current) { stageRef.current = s; setStage(s) } })
  const bg = useTransform(p, [0, 0.1, 0.14, 0.3, 0.34, 0.48, 0.52, 0.66, 0.7, 0.84, 0.88], [BASE, BASE, SP[0].soft, SP[0].soft, SP[1].soft, SP[1].soft, SP[2].soft, SP[2].soft, SP[3].soft, SP[3].soft, '#f6eefc'])
  const heroO = useTransform(p, [0, 0.08], [1, 0])
  const heroY = useTransform(p, [0, 0.08], [0, -60])
  const heroPE = useTransform(p, v => (v < 0.05 ? 'auto' : 'none'))
  const cap = stage >= 0 ? CAP[stage] : null
  const col = stage >= 0 && stage < 4 ? SP[stage].c : '#a48bff'
  return (
    <motion.section ref={ref} id="top" className="relative h-[480vh]" style={{ background: bg }}>
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <Blobs />
        <motion.div style={{ opacity: heroO, y: heroY, pointerEvents: heroPE }} className="absolute inset-x-0 bottom-[104px] z-[2] px-5 md:bottom-auto md:top-[17%] md:px-12">
          <motion.span initial={{ scale: 0, rotate: -12 }} animate={{ scale: 1, rotate: -4 }} transition={{ ...BOUNCE, delay: 0.5 }}
            className={`${DISP} mb-6 inline-flex items-center gap-2 rounded-full border-[3px] border-white bg-[#24203a] px-4 py-2 text-[13px] font-medium text-white shadow-[0_10px_24px_-12px_rgba(36,32,58,.6)]`}>
            <Star size={14} className="fill-[#f4b73b] text-[#f4b73b]" /> {b.rating} · {b.rev} оценок на Яндекс Картах
          </motion.span>
          <h1 className={`${DISP} max-w-[860px] text-[clamp(42px,7.2vw,118px)] font-semibold leading-[.95] tracking-[-0.045em]`}>
            <LineReveal delay={0.1}>Всё красивое —</LineReveal>
            <LineReveal delay={0.22}>в <span className="relative inline-block">одном месте.<Scribble delay={0.9} /></span></LineReveal>
          </h1>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="mt-7 max-w-[460px] text-[16.5px] leading-relaxed text-[#24203a]/70 md:text-[18px]">
            Парикмахерская, маникюр и солярий в Доме быта на Плеханова, 72. Заходите по-соседски.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85 }} className="mt-8 hidden gap-3 md:flex">
            <motion.a whileHover={{ scale: 1.05, rotate: -2 }} whileTap={{ scale: 0.95 }} transition={BOUNCE} href="#visit" className={`${DISP} inline-flex h-14 items-center gap-2 rounded-full bg-[#24203a] px-7 text-[16px] font-medium text-white`}>Собрать мой визит <ArrowRight size={18} /></motion.a>
            <motion.a whileHover={{ scale: 1.05, rotate: 2 }} whileTap={{ scale: 0.95 }} transition={BOUNCE} href="#book" className={`${DISP} inline-flex h-14 items-center rounded-full border-[3px] border-white bg-white/60 px-7 text-[16px] font-medium backdrop-blur`}>Записаться</motion.a>
          </motion.div>
        </motion.div>

        <AnimatePresence mode="wait">
          {cap && (
            <motion.div key={stage} initial={{ opacity: 0, y: 30, rotate: -3 }} animate={{ opacity: 1, y: 0, rotate: 0 }} exit={{ opacity: 0, y: -20, rotate: 2 }} transition={BOUNCE}
              className="pointer-events-none absolute inset-x-5 top-[84px] z-[2] md:inset-x-auto md:left-12 md:top-[32%] md:w-[min(420px,38vw)]">
              <span className={`${DISP} inline-block rotate-[-3deg] rounded-full border-[3px] border-white px-3.5 py-1 text-[13px] font-semibold text-white shadow-md`} style={{ background: col }}>{cap.n} · {stage < 4 ? SP[stage].t : 'Надежда'}</span>
              <h2 className={`${DISP} mt-4 text-[clamp(28px,3.6vw,54px)] font-semibold leading-[1] tracking-[-0.04em]`}>{cap.h}</h2>
              <p className="mt-3 max-w-[380px] text-[15px] leading-relaxed text-[#24203a]/65 md:text-[16.5px]">{cap.d}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <Board stage={stage} />
        <div className="pointer-events-none absolute inset-0 z-[3]">
          {lite ? <LiteTokens stage={stage} /> : mounted && <Suspense fallback={null}><Tokens stage={stageRef} active={near} /></Suspense>}
        </div>
      </div>
    </motion.section>
  )
}

/* ---------------- «Мой визит» (value interaction) ---------------- */
const SVC = [
  { id: 'w', t: 'Женская стрижка', s: 0, m: [45, 60] },
  { id: 'm', t: 'Мужская стрижка', s: 0, m: [30, 40] },
  { id: 'st', t: 'Укладка', s: 0, m: [30, 45] },
  { id: 'c', t: 'Окрашивание', s: 1, m: [120, 180] },
  { id: 'tn', t: 'Тонирование', s: 1, m: [60, 90] },
  { id: 'mn', t: 'Маникюр', s: 2, m: [60, 90] },
  { id: 'gl', t: 'Покрытие гель-лаком', s: 2, m: [30, 45] },
  { id: 'pd', t: 'Педикюр', s: 2, m: [60, 90] },
  { id: 'sl', t: 'Солярий', s: 3, m: [10, 20] },
]
const dur = m => { m = Math.round(m / 5) * 5; const h = Math.floor(m / 60), r = m % 60; return h ? `${h} ч${r ? ' ' + r + ' мин' : ''}` : `${r} мин` }
function Sticker({ v, on, i, toggle, add, zone, canDrag, setDragging }) {
  const moved = useRef(false)
  const c = SP[v.s].c
  return (
    <motion.button type="button" aria-pressed={on} layout
      drag={canDrag && !on} dragSnapToOrigin dragElastic={0.9}
      onDragStart={() => { moved.current = true; setDragging(true) }}
      onDragEnd={e => {
        setDragging(false)
        const r = zone.current?.getBoundingClientRect(), x = e.clientX, y = e.clientY
        if (r && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) add(v.id)
      }}
      onClick={() => { if (moved.current) { moved.current = false; return } toggle(v.id) }}
      whileHover={{ y: -4, rotate: i % 2 ? 2.5 : -2.5 }} whileTap={{ scale: 0.94 }} whileDrag={{ scale: 1.12, rotate: -6, zIndex: 40, boxShadow: '0 30px 40px -20px rgba(36,32,58,.5)' }}
      transition={BOUNCE}
      className={`${DISP} relative inline-flex h-14 select-none items-center gap-2.5 rounded-full border-[3px] pl-2 pr-5 text-[15px] font-medium shadow-[0_8px_18px_-12px_rgba(36,32,58,.55)] ${on ? 'border-transparent bg-[#24203a]/[.06] text-[#24203a]/40' : 'cursor-grab border-white bg-white active:cursor-grabbing'}`}>
      <span className="grid h-9 w-9 place-items-center rounded-full text-white" style={{ background: on ? '#24203a33' : c }}>{on ? <X size={15} /> : <Plus size={16} />}</span>
      {v.t}
    </motion.button>
  )
}
function Burst({ n, color }) {
  if (!n) return null
  return (
    <div key={n} className="pointer-events-none absolute left-1/2 top-10" aria-hidden="true">
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2, d = 70 + (i % 3) * 24
        return <motion.span key={n + '-' + i} initial={{ x: 0, y: 0, scale: 1, opacity: 1 }} animate={{ x: Math.cos(a) * d, y: Math.sin(a) * d, scale: 0, opacity: 0 }} transition={{ duration: 0.8, ease: [0.2, 0.8, 0.3, 1] }}
          className="absolute h-3 w-3 rounded-[4px]" style={{ background: i % 2 ? color : ['#ff9f8a', '#a48bff', '#4fc6a0', '#f4b73b'][i % 4] }} />
      })}
    </div>
  )
}
function Visit() {
  const [sel, setSel] = useState(['w', 'mn'])
  const [burst, setBurst] = useState({ n: 0, c: '#a48bff' })
  const [dragging, setDragging] = useState(false)
  const [canDrag, setCanDrag] = useState(false)
  const zone = useRef(null)
  useEffect(() => { setCanDrag(matchMedia('(pointer:fine)').matches) }, [])
  const add = id => setSel(s => { if (s.includes(id)) return s; setBurst(x => ({ n: x.n + 1, c: SP[SVC.find(v => v.id === id).s].c })); return [...s, id] })
  const toggle = id => (sel.includes(id) ? setSel(s => s.filter(x => x !== id)) : add(id))
  const items = sel.map(id => SVC.find(v => v.id === id))
  const lo = items.reduce((a, v) => a + v.m[0], 0), hi = items.reduce((a, v) => a + v.m[1], 0)
  const spaces = new Set(items.map(v => v.s)).size
  return (
    <section id="visit" className="relative overflow-hidden px-5 py-28 md:px-12 md:py-36" style={{ background: BASE }}>
      <div className="pointer-events-none absolute -left-40 top-20 h-[420px] w-[420px] rounded-full bg-[#ffd6c9] opacity-60 blur-[100px]" />
      <div className="relative mx-auto max-w-[1280px]">
        <div className="grid gap-6 md:grid-cols-2 md:items-end">
          <h2 className={`${DISP} text-[clamp(38px,5.6vw,88px)] font-semibold leading-[.95] tracking-[-0.045em]`}>
            Соберите <span className="relative inline-block">свой визит<Scribble color="#a48bff" delay={0.3} /></span>
          </h2>
          <p className="max-w-[440px] text-[16.5px] leading-relaxed text-[#24203a]/65 md:justify-self-end">{canDrag ? 'Перетащите' : 'Нажмите на'} услуги в карточку визита — посчитаем, сколько примерно времени заложить. Мастеров администратор подберёт друг за другом.</p>
        </div>
        <div className="mt-14 grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
          <div className="space-y-7">
            {SP.map((s, si) => (
              <div key={s.t}>
                <p className={`${DISP} mb-3 flex items-center gap-2 text-[13px] font-medium uppercase tracking-[.12em] text-[#24203a]/50`}><span className="h-3 w-3 rounded-[4px]" style={{ background: s.c }} />{s.t}</p>
                <div className="flex flex-wrap gap-2.5">
                  {SVC.filter(v => v.s === si).map((v, i) => <Sticker key={v.id} v={v} i={i} on={sel.includes(v.id)} toggle={toggle} add={add} zone={zone} canDrag={canDrag} setDragging={setDragging} />)}
                </div>
              </div>
            ))}
          </div>
          <motion.div ref={zone} animate={{ scale: dragging ? 1.03 : 1, rotate: dragging ? -1 : 0 }} transition={BOUNCE}
            className={`relative self-start rounded-[32px] border-[6px] bg-white p-6 shadow-[0_40px_80px_-40px_rgba(36,32,58,.45)] md:p-8 lg:sticky lg:top-24 ${dragging ? 'border-dashed border-[#a48bff]' : 'border-white'}`}>
            <Burst n={burst.n} color={burst.c} />
            <div className="flex items-center justify-between">
              <p className={`${DISP} text-[24px] font-semibold tracking-[-0.03em]`}>Мой визит</p>
              <span className="rounded-full px-3 py-1 text-[12.5px] font-medium" style={{ background: '#f2ecff' }}>{items.length ? `${items.length} усл. · ${spaces} ${spaces === 1 ? 'мастер' : 'мастера'}` : 'пусто'}</span>
            </div>
            <div className="mt-5 min-h-[120px] space-y-2">
              <AnimatePresence initial={false}>
                {items.length === 0 && <motion.p key="e" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid h-[120px] place-items-center rounded-[20px] border-2 border-dashed border-[#24203a]/12 text-[14.5px] text-[#24203a]/45">{canDrag ? 'Бросьте услугу сюда' : 'Добавьте услугу слева'}</motion.p>}
                {items.map(v => (
                  <motion.div key={v.id} layout initial={{ opacity: 0, scale: 0.6, x: -40, rotate: -6 }} animate={{ opacity: 1, scale: 1, x: 0, rotate: 0 }} exit={{ opacity: 0, scale: 0.6, x: 40 }} transition={BOUNCE}
                    className="flex items-center gap-3 rounded-[18px] px-4 py-3" style={{ background: SP[v.s].soft }}>
                    <span className="h-3 w-3 shrink-0 rounded-[4px]" style={{ background: SP[v.s].c }} />
                    <span className={`${DISP} flex-1 text-[15.5px] font-medium`}>{v.t}</span>
                    <span className="text-[13px] text-[#24203a]/55">{dur(v.m[0])}–{dur(v.m[1])}</span>
                    <button type="button" onClick={() => toggle(v.id)} aria-label={'Убрать ' + v.t} className="grid h-8 w-8 place-items-center rounded-full hover:bg-white"><X size={15} /></button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            {items.length > 0 && (
              <div className="mt-6 flex h-4 overflow-hidden rounded-full bg-[#24203a]/[.05]">
                {items.map(v => <motion.span key={v.id} layout initial={{ width: 0 }} animate={{ width: (v.m[1] / hi) * 100 + '%' }} transition={BOUNCE} className="h-full border-r-2 border-white" style={{ background: SP[v.s].c }} />)}
              </div>
            )}
            <div className="mt-6 flex items-end justify-between gap-4 border-t-2 border-dashed border-[#24203a]/10 pt-5">
              <div>
                <p className="flex items-center gap-1.5 text-[13px] text-[#24203a]/50"><Clock size={14} />Заложите примерно</p>
                <motion.p key={lo + '-' + hi} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={BOUNCE} className={`${DISP} mt-1 text-[30px] font-semibold tracking-[-0.04em]`}>{items.length ? (lo === hi ? dur(lo) : `${dur(lo)} – ${dur(hi)}`) : '—'}</motion.p>
              </div>
            </div>
            <p className="mt-3 text-[12.5px] leading-relaxed text-[#24203a]/45">Время ориентировочное: точнее подскажет администратор при записи.</p>
            <a href="#book" data-svc={items.length ? 'Мой визит: ' + items.map(v => v.t).join(', ') : ''} className={`${DISP} mt-6 flex h-14 items-center justify-center gap-2 rounded-full bg-[#24203a] text-[16px] font-medium text-white transition-transform hover:-translate-y-0.5 ${items.length ? '' : 'pointer-events-none opacity-40'}`}>Записаться на этот визит <ArrowRight size={18} /></a>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- bento ---------------- */
function Tile({ className = '', children, href, bg = '#fff', rot = 0 }) {
  const Tag = href ? motion.a : motion.div
  return (
    <Reveal className={className}>
      <Tag href={href} target={href && href.startsWith('http') ? '_blank' : undefined} rel="noopener" whileHover={{ rotate: rot, y: -6, scale: 1.015 }} transition={BOUNCE}
        className="group relative flex h-full flex-col overflow-hidden rounded-[30px] border-[5px] border-white p-6 shadow-[0_24px_50px_-34px_rgba(36,32,58,.5)] md:p-7" style={{ background: bg }}>
        {children}
      </Tag>
    </Reveal>
  )
}
function Bento() {
  return (
    <section id="about" className="px-5 pb-28 md:px-12 md:pb-36" style={{ background: BASE }}>
      <div className="mx-auto max-w-[1280px]">
        <h2 className={`${DISP} mb-12 max-w-[820px] text-[clamp(34px,4.8vw,72px)] font-semibold leading-[1] tracking-[-0.045em]`}><Reveal as="span" className="block">Салон по соседству,</Reveal><Reveal as="span" delay={0.08} className="block text-[#24203a]/35">которому доверяют.</Reveal></h2>
        <div className="grid auto-rows-[minmax(200px,auto)] gap-4 md:grid-cols-4">
          <Tile className="md:col-span-2 md:row-span-2" bg="linear-gradient(150deg,#fff,#f3edff)" rot={-1}>
            <p className="text-[13px] font-medium uppercase tracking-[.12em] text-[#24203a]/45">Яндекс Карты</p>
            <div className="mt-auto flex items-end gap-4">
              <p className={`${DISP} bg-clip-text text-[clamp(110px,14vw,200px)] font-semibold leading-[.82] tracking-[-0.06em] text-transparent`} style={{ backgroundImage: 'linear-gradient(120deg,#ff8a73,#a48bff 55%,#4fc6a0)' }}>{b.rating}</p>
              <div className="mb-3 flex gap-1">{[0, 1, 2, 3, 4].map(i => <motion.span key={i} initial={{ scale: 0, rotate: -40 }} whileInView={{ scale: 1, rotate: 0 }} viewport={{ once: true }} transition={{ ...BOUNCE, delay: 0.3 + i * 0.08 }}><Star size={22} className="fill-[#f4b73b] text-[#f4b73b]" /></motion.span>)}</div>
            </div>
            <p className="mt-5 text-[16px] text-[#24203a]/65">{b.rev} оценок от гостей салона</p>
          </Tile>
          <Tile className="md:col-span-2" bg={SP[0].soft} rot={1}>
            <MapPin size={22} />
            <p className={`${DISP} mt-auto text-[clamp(26px,2.8vw,40px)] font-semibold tracking-[-0.04em]`}>Плеханова, 72</p>
            <p className="mt-1 text-[15px] text-[#24203a]/60">Дом быта, первый этаж — без лестниц и поисков.</p>
          </Tile>
          <Tile bg={SP[3].soft} rot={-2}>
            <p className={`${DISP} text-[20px] font-semibold leading-tight tracking-[-0.03em]`}>4 направления — одна запись</p>
            <div className="mt-auto flex -space-x-3 pt-6">{SP.map((s, i) => <motion.span key={i} whileHover={{ y: -10 }} transition={BOUNCE} className="h-12 w-12 rounded-[16px] border-[3px] border-white" style={{ background: s.c, rotate: (i - 1.5) * 8 + 'deg' }} />)}</div>
          </Tile>
          <Tile href={b.ig} bg={SP[1].soft} rot={2}>
            <IG width={24} height={24} />
            <p className={`${DISP} mt-auto text-[19px] font-semibold`}>Instagram</p>
            <p className="text-[14px] text-[#24203a]/55">@salon_nadejda</p>
            <ArrowUpRight size={20} className="absolute right-6 top-6 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
          </Tile>
          <Tile href={b.fb} bg={SP[2].soft} className="md:col-span-2" rot={-1}>
            <Facebook size={24} />
            <p className={`${DISP} mt-auto text-[19px] font-semibold`}>Facebook</p>
            <p className="text-[14px] text-[#24203a]/55">nadejda.salon</p>
            <ArrowUpRight size={20} className="absolute right-6 top-6 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
          </Tile>
          <Tile href={'tel:' + tel(b.phone)} bg="#24203a" className="md:col-span-2" rot={1}>
            <Phone size={22} className="text-white" />
            <p className={`${DISP} mt-auto text-[clamp(24px,2.6vw,36px)] font-semibold tracking-[-0.03em] text-white`}>{b.phone}</p>
            <p className="mt-1 text-[14.5px] text-white/60">Позвоните — подберём время и мастеров</p>
          </Tile>
        </div>
      </div>
    </section>
  )
}

/* ---------------- booking ---------------- */
const BSV = ['Стрижка', 'Окрашивание', 'Маникюр', 'Педикюр', 'Солярий', 'Укладка']
const DAYS = ['Сегодня', 'Завтра', 'На неделе', 'Подберите сами']
const TIMES = ['Утро', 'День', 'Вечер']
function Pill({ on, children, ...rest }) {
  return <motion.button type="button" whileTap={{ scale: 0.93 }} transition={BOUNCE} aria-pressed={on} className={`${DISP} h-12 rounded-full px-5 text-[15px] font-medium transition-colors ${on ? 'bg-[#24203a] text-white' : 'border-2 border-[#24203a]/10 bg-white hover:border-[#24203a]/40'}`} {...rest}>{children}</motion.button>
}
function Book() {
  const bk = useBooking()
  const [step, setStep] = useState(0)
  const [day, setDay] = useState(''), [time, setTime] = useState('')
  const [err, setErr] = useState('')
  const head = useRef(null)
  useEffect(() => { if (step) head.current?.focus() }, [step])
  const next = e => {
    e.preventDefault()
    if (step === 0 && !bk.s.svc) return setErr('Выберите услугу')
    if (step === 1 && !day) return setErr('Выберите, когда удобно')
    setErr('')
    if (step < 2) setStep(step + 1); else bk.submit()
  }
  const custom = bk.s.svc && !BSV.includes(bk.s.svc)
  const titles = ['Что делаем?', 'Когда удобно?', 'Как с вами связаться?']
  return (
    <section id="book" className="relative overflow-hidden px-5 py-28 md:px-12 md:py-36" style={{ background: '#f3edff' }}>
      <div className="pointer-events-none absolute -right-40 -top-20 h-[460px] w-[460px] rounded-full bg-[#ffd6c9] opacity-70 blur-[100px]" />
      <div className="relative mx-auto grid max-w-[1280px] gap-14 lg:grid-cols-[.85fr_1.15fr]">
        <div>
          <h2 className={`${DISP} text-[clamp(38px,5.4vw,84px)] font-semibold leading-[.95] tracking-[-0.045em]`}>Запишитесь<br /><span className="relative inline-block">в пару касаний<Scribble color="#4fc6a0" delay={0.3} /></span></h2>
          <p className="mt-7 max-w-[380px] text-[16.5px] leading-relaxed text-[#24203a]/65">Оставьте заявку — администратор перезвонит и подтвердит время.</p>
          <a href={'tel:' + tel(b.phone)} className={`${DISP} mt-5 inline-block text-[26px] font-semibold tracking-[-0.03em] hover:text-[#a48bff]`}>{b.phone}</a>
        </div>
        <div className="rounded-[32px] border-[6px] border-white bg-white p-6 shadow-[0_40px_80px_-40px_rgba(36,32,58,.4)] md:p-10">
          {bk.s.sent ? (
            <div className="relative py-10 text-center" role="status">
              <Burst n={1} color="#a48bff" />
              <CheckDraw className="mx-auto text-[#4fc6a0]" />
              <p className={`${DISP} mt-6 text-[30px] font-semibold tracking-[-0.04em]`}>Ура, заявка у нас!</p>
              <p className="mx-auto mt-3 max-w-[380px] text-[#24203a]/60">Администратор скоро перезвонит. В готовом сайте заявка сразу придёт вам в Telegram.</p>
              <button type="button" onClick={() => { bk.reset(); setStep(0); setDay(''); setTime('') }} className="mt-8 text-[14px] text-[#24203a]/55 underline underline-offset-4">Новая заявка</button>
            </div>
          ) : (
            <form onSubmit={next} noValidate>
              <div className="mb-7 flex gap-2">{[0, 1, 2].map(i => <motion.span key={i} animate={{ flex: i === step ? 3 : 1, backgroundColor: i <= step ? ['#ff9f8a', '#a48bff', '#4fc6a0'][i] : '#24203a14' }} transition={BOUNCE} className="h-2.5 rounded-full" />)}</div>
              <p className="text-[13px] text-[#24203a]/45">Шаг {step + 1} из 3</p>
              <h3 ref={head} tabIndex={-1} className={`${DISP} mb-7 mt-1 text-[28px] font-semibold tracking-[-0.04em] outline-none`}>{titles[step]}</h3>
              <AnimatePresence mode="wait">
                <motion.div key={step} initial={{ opacity: 0, x: 30, rotate: 1 }} animate={{ opacity: 1, x: 0, rotate: 0 }} exit={{ opacity: 0, x: -30 }} transition={BOUNCE}>
                  {step === 0 && <div className="flex flex-wrap gap-2.5">{custom && <Pill on>{bk.s.svc}</Pill>}{BSV.map(s => <Pill key={s} on={bk.s.svc === s} onClick={() => { bk.upd('svc', s); setErr('') }}>{s}</Pill>)}</div>}
                  {step === 1 && (<>
                    <div className="flex flex-wrap gap-2.5">{DAYS.map(d => <Pill key={d} on={day === d} onClick={() => { setDay(d); setErr('') }}>{d}</Pill>)}</div>
                    <p className="mb-3 mt-7 text-[13px] text-[#24203a]/45">Время</p>
                    <div className="flex flex-wrap gap-2.5">{TIMES.map(t => <Pill key={t} on={time === t} onClick={() => setTime(t)}>{t}</Pill>)}</div>
                  </>)}
                  {step === 2 && (<div className="space-y-4">
                    <input value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} autoComplete="name" placeholder="Имя" aria-label="Имя" className="h-14 w-full rounded-[18px] border-2 border-[#24203a]/10 bg-[#fbf6f0] px-5 text-[16px] outline-none focus:border-[#a48bff]" />
                    <input value={bk.s.phone} onChange={e => bk.upd('phone', e.target.value)} onFocus={phoneFocus(bk)} type="tel" inputMode="tel" autoComplete="tel" placeholder="+375 __ ___-__-__" aria-label="Телефон" aria-invalid={bk.s.err}
                      className={`h-14 w-full rounded-[18px] border-2 bg-[#fbf6f0] px-5 text-[16px] outline-none focus:border-[#a48bff] ${bk.s.err ? 'border-[#e0566b]' : 'border-[#24203a]/10'}`} />
                    {bk.s.err && <p className="text-[14px] text-[#e0566b]">Проверьте номер — 12 цифр с кодом +375.</p>}
                  </div>)}
                </motion.div>
              </AnimatePresence>
              {err && <p className="mt-4 text-[14px] text-[#e0566b]" role="alert">{err}</p>}
              <div className="mt-9 flex items-center justify-between">
                {step > 0 ? <button type="button" onClick={() => setStep(step - 1)} className="text-[14px] text-[#24203a]/55 hover:text-[#24203a]">← Назад</button> : <span />}
                <motion.button whileTap={{ scale: 0.94 }} transition={BOUNCE} type="submit" disabled={bk.s.loading} className={`${DISP} inline-flex h-13 h-[52px] items-center gap-2 rounded-full bg-[#24203a] px-7 text-[15.5px] font-medium text-white disabled:opacity-60`}>{step < 2 ? 'Дальше' : bk.s.loading ? 'Отправляем…' : 'Записаться'} <ArrowRight size={17} /></motion.button>
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
    <section id="contact" className="px-5 py-24 md:px-12" style={{ background: BASE }}>
      <div className="mx-auto grid max-w-[1280px] gap-10 lg:grid-cols-[.85fr_1.15fr]">
        <div>
          <h2 className={`${DISP} text-[clamp(34px,4.4vw,64px)] font-semibold tracking-[-0.045em]`}>Как нас найти</h2>
          <p className="mt-8 flex items-start gap-3 text-[18px]"><MapPin className="mt-1 shrink-0 text-[#ff8a73]" size={20} />{b.addr}, {b.place}, {b.city}</p>
          <a href={'tel:' + tel(b.phone)} className="mt-4 flex items-center gap-3 text-[22px] hover:text-[#a48bff]"><Phone className="text-[#ff8a73]" size={19} />{b.phone}</a>
          <div className="mt-8 flex flex-wrap gap-2.5">
            <a href={b.ig} target="_blank" rel="noopener" className={`${DISP} inline-flex h-12 items-center gap-2 rounded-full border-[3px] border-white bg-[#ece6ff] px-5 text-[14.5px] font-medium shadow-sm hover:-rotate-2`}><IG />Instagram</a>
            <a href={b.fb} target="_blank" rel="noopener" className={`${DISP} inline-flex h-12 items-center gap-2 rounded-full border-[3px] border-white bg-[#ddf5ea] px-5 text-[14.5px] font-medium shadow-sm hover:rotate-2`}><Facebook size={17} />Facebook</a>
          </div>
        </div>
        <div className="h-[380px] overflow-hidden rounded-[32px] border-[6px] border-white shadow-[0_30px_60px_-40px_rgba(36,32,58,.5)] md:h-[460px]"><MapFrame oid={b.oid} /></div>
      </div>
    </section>
  )
}

function App() {
  useSmooth()
  const lite = useLite()
  return (
    <MotionConfig reducedMotion="user">
      <div className={`overflow-x-clip ${SANS}`} style={{ background: BASE, color: INK, '--sel': '#c8b8ff', '--selc': INK }}>
        <Ribbon name={b.name} bg={INK} fg="#fff" />
        <header className="sticky top-0 z-40 px-3 pt-3 md:px-6">
          <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between rounded-full border-[3px] border-white bg-white/70 pl-3 pr-2 shadow-[0_10px_30px_-20px_rgba(36,32,58,.5)] backdrop-blur-xl">
            <a href="#top" className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 grid-cols-2 gap-[3px] rounded-[10px] p-[5px]" style={{ background: PASTEL }}>{SP.map(s => <span key={s.t} className="rounded-[3px] bg-white/80" />)}</span>
              <span className={`${DISP} text-[18px] font-semibold tracking-[-0.03em]`}>Надежда</span>
            </a>
            <nav className={`${DISP} hidden gap-7 text-[14.5px] font-medium text-[#24203a]/60 md:flex`}>{[['#visit', 'Мой визит'], ['#about', 'О салоне'], ['#contact', 'Контакты']].map(([h, t]) => <a key={h} href={h} className="hover:text-[#24203a]">{t}</a>)}</nav>
            <a href="#book" className={`${DISP} inline-flex h-10 items-center rounded-full bg-[#24203a] px-5 text-[14px] font-medium text-white`}>Записаться</a>
          </div>
        </header>
        <main className="-mt-[68px]">
          <Film lite={lite} />
          <Visit />
          <Bento />
          <Book />
          <Contact />
        </main>
        <footer className="px-5 py-8 text-[13px] text-[#24203a]/50 md:px-12" style={{ background: BASE }}>
          <div className="mx-auto flex max-w-[1280px] flex-wrap justify-between gap-4 border-t-2 border-dashed border-[#24203a]/10 pt-8"><span>© 2026 {b.name} · Концепт сайта — Артём</span><span>{b.addr}, {b.place}</span></div>
        </footer>
        <CallBar phone={b.phone} barCls="bg-white/90 backdrop-blur border-t border-[#24203a]/10" callCls="rounded-full border-2 border-[#24203a]/15 text-[#24203a]" bookCls="rounded-full bg-[#24203a] text-white" />
        <div className="h-[72px] sm:hidden" style={{ background: BASE }} />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
