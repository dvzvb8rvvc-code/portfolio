import React, { useRef, useState, useEffect, useMemo, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, useSpring, useInView, AnimatePresence, MotionConfig } from 'framer-motion'
import { ArrowRight, ArrowUpRight, Phone, MapPin, Plus, Minus, Recycle, Star, Clock } from 'lucide-react'
import '../lib/base.css'
import { useSmooth, Ribbon, Reveal, useBooking, phoneFocus, CheckDraw, MapFrame, CallBar, tel, useLite, useIsMobile, IG } from '../lib/kit'

const CarScene = lazy(() => import('./pereobuvayka3d'))

const b = {
  name: 'Переобувайка', addr: 'ул. Лейтенанта Кижеватова, 88', city: 'Минск',
  phone: '+375 29 378-77-44', ig: 'https://www.instagram.com/pereobuvayka/', rating: '5,0', rev: 192, oid: '30972995173',
}
const INK = '#22124a', CREAM = '#fff6e5', LEMON = '#ffd23f', CORAL = '#ff6f59', MINT = '#43d9a3', SKY = '#7cc6ff'
const D = "font-['Unbounded',sans-serif]"
const NAV = [['services', 'Услуги'], ['fit', 'Примерочная'], ['how', 'Как это работает'], ['rating', 'Отзывы'], ['contact', 'Контакты']]
const stk = 'border-[2.5px] border-[#22124a] shadow-[4px_4px_0_#22124a]'
const PRICE_NOTE = 'Полная переобувка — 36–55 BYN по данным карточки на Яндекс Картах. Уточняйте по телефону.'

function useActive(ids) {
  const [a, setA] = useState('')
  useEffect(() => {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) setA(e.target.id) }), { rootMargin: '-45% 0px -50% 0px' })
    ids.forEach(id => { const el = document.getElementById(id); if (el) io.observe(el) })
    return () => io.disconnect()
  }, [])
  return a
}

function Header() {
  const a = useActive(NAV.map(n => n[0]))
  return (
    <header className="sticky top-0 z-40 px-3 pt-3 md:px-6">
      <div className={`mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-3 rounded-full bg-white px-3 md:px-4 ${stk}`}>
        <a href="#top" className={`${D} flex items-center gap-2 text-[17px] font-bold md:text-[19px]`}>
          <span className="grid h-10 w-10 place-items-center rounded-full bg-[#ffd23f] ring-[2.5px] ring-[#22124a]"><Wheel kind="summer" size={30} /></span>
          Переобувайка
        </a>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Разделы">
          {NAV.map(([id, t]) => <a key={id} href={'#' + id} aria-current={a === id ? 'true' : undefined} className={`rounded-full px-4 py-2 text-[15px] font-semibold transition-colors ${a === id ? 'bg-[#22124a] text-white' : 'hover:bg-[#ffd23f]'}`}>{t}</a>)}
        </nav>
        <div className="flex items-center gap-2">
          <a href={'tel:' + tel(b.phone)} className="hidden items-center gap-2 px-2 text-[15px] font-semibold md:flex"><Phone size={16} />{b.phone}</a>
          <a href="#fit" className={`${D} inline-flex h-11 items-center rounded-full bg-[#ff6f59] px-5 text-[14px] font-semibold text-[#22124a] ring-[2.5px] ring-[#22124a] hover:bg-[#ffd23f]`}>Записаться</a>
        </div>
      </div>
    </header>
  )
}

/* tiny 2D wheel used across the site */
function Wheel({ kind = 'summer', size = 60 }) {
  const w = kind === 'winter', a = kind === 'all'
  return (
    <svg viewBox="0 0 60 60" width={size} height={size} aria-hidden="true">
      <circle cx="30" cy="30" r="27" fill={w ? '#2c2346' : a ? SKY : '#fbfbf7'} stroke={INK} strokeWidth="3" />
      {Array.from({ length: 12 }, (_, i) => { const r = (i / 12) * Math.PI * 2; return <line key={i} x1={30 + Math.cos(r) * 22} y1={30 + Math.sin(r) * 22} x2={30 + Math.cos(r) * 27} y2={30 + Math.sin(r) * 27} stroke={w ? '#5a4d86' : a ? INK : CORAL} strokeWidth={w ? 4 : 2.5} /> })}
      {w && <circle cx="30" cy="30" r="17" fill="none" stroke={CREAM} strokeWidth="5" strokeDasharray="2 2.5" />}
      <circle cx="30" cy="30" r="13" fill={w ? LEMON : a ? MINT : CORAL} stroke={INK} strokeWidth="3" />
      <circle cx="30" cy="30" r="3.5" fill={INK} />
    </svg>
  )
}

/* ---------------- hero + pinned shoe-change film ---------------- */
const CH = [
  { n: '1', h: 'Снимаем кеды', d: 'Поднимаем машину, аккуратно снимаем летние колёса.', c: LEMON, r: [0.13, 0.33] },
  { n: '2', h: 'Надеваем ботинки', d: 'Ставим зимние. Или наоборот — смотря какой сезон.', c: SKY, r: [0.33, 0.53] },
  { n: '3', h: 'Балансируем', d: 'Чтобы руль не дрожал на скорости.', c: MINT, r: [0.53, 0.76] },
  { n: '4', h: 'Старые — на утилизацию', d: 'Отслужившие шины можно оставить у нас.', c: CORAL, r: [0.76, 1.2] },
]
function Chapter({ p, c }) {
  const k = [c.r[0], c.r[0] + 0.04, c.r[1] - 0.04, c.r[1]]
  const o = useTransform(p, k, [0, 1, 1, 0])
  const sc = useTransform(p, k, [0.85, 1, 1, 0.9])
  const rot = useTransform(p, k, [-8, -2, -2, 4])
  return (
    <motion.div style={{ opacity: o, scale: sc, rotate: rot }} className={`pointer-events-none absolute left-4 top-6 max-w-[min(440px,calc(100%-32px))] rounded-[28px] bg-white p-5 md:left-10 md:top-[10vh] md:p-7 ${stk}`}>
      <span className={`${D} inline-grid h-10 w-10 place-items-center rounded-full text-[16px] font-bold ring-[2.5px] ring-[#22124a]`} style={{ background: c.c }}>{c.n}</span>
      <h2 className={`${D} mt-3 text-[clamp(26px,3.4vw,46px)] font-bold leading-[1.05]`}>{c.h}</h2>
      <p className="mt-2 text-[17px] leading-snug text-[#22124a]/80">{c.d}</p>
    </motion.div>
  )
}
function LiteCar() {
  return <div className="absolute inset-x-0 bottom-[14%] grid place-items-center"><MiniCar kind="winter" /></div>
}
function Film({ lite }) {
  const ref = useRef(null)
  const mob = useIsMobile()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 22, mass: 0.4 })
  const near = useInView(ref, { margin: '200px 0px' })
  const [mounted, setMounted] = useState(false)
  useEffect(() => { if (near) setMounted(true) }, [near])
  const heroO = useTransform(p, [0, 0.09], [1, 0])
  const heroY = useTransform(p, [0, 0.09], [0, -60])
  const heroPE = useTransform(p, v => (v < 0.05 ? 'auto' : 'none'))
  const stageY = useTransform(p, [0, 0.1], [mob ? '22vh' : '8vh', '0vh'])
  const skipO = useTransform(p, [0.06, 0.11], [0, 1])
  const bg = useTransform(p, [0, 0.33, 0.53, 0.76, 1], [CREAM, '#fff1c9', '#e3f2ff', '#dcf7ec', '#ffe4dd'])
  return (
    <motion.section ref={ref} id="top" style={{ background: bg }} className="relative -mt-[76px] h-[300vh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden pt-[76px]">
        <div aria-hidden="true" className="absolute -right-24 top-24 h-72 w-72 rounded-full bg-[#ffd23f] opacity-60 blur-2xl" />
        <div aria-hidden="true" className="absolute -left-20 bottom-10 h-64 w-64 rounded-full bg-[#7cc6ff] opacity-50 blur-2xl" />
        <motion.div style={{ y: stageY }} className="absolute inset-0 top-[76px]">
          {lite ? <LiteCar /> : mounted && <Suspense fallback={<LiteCar />}><CarScene progress={p} active={near} /></Suspense>}
        </motion.div>

        <motion.div style={{ opacity: heroO, y: heroY, pointerEvents: heroPE }} className="relative z-[2] mx-auto max-w-[1100px] px-4 pt-6 text-center md:pt-[5vh]">
          <p className="inline-flex flex-wrap items-center justify-center gap-2 text-[15px] font-semibold">
            <span className={`inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 ${stk.replace('shadow-[4px_4px_0_#22124a]', '')}`}><MapPin size={15} />{b.addr}</span>
            <a href="#rating" className="inline-flex -rotate-2 items-center gap-1.5 rounded-full bg-[#ffd23f] px-3 py-1.5 ring-[2.5px] ring-[#22124a]"><Star size={15} fill={INK} />{b.rating} · {b.rev} оценок на Яндексе</a>
          </p>
          <h1 className={`${D} mt-5 text-[clamp(38px,7.2vw,104px)] font-bold leading-[.98] tracking-[-0.03em]`}>
            <motion.span className="block" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 160, damping: 14 }}>Машине пора</motion.span>
            <motion.span className="relative inline-block" initial={{ y: 40, opacity: 0, rotate: -6 }} animate={{ y: 0, opacity: 1, rotate: -2 }} transition={{ type: 'spring', stiffness: 160, damping: 12, delay: 0.1 }}>
              <span className="relative z-[1]">переобуться</span>
              <svg aria-hidden="true" viewBox="0 0 300 20" preserveAspectRatio="none" className="absolute -bottom-1 left-0 h-[.28em] w-full"><motion.path d="M4 14 C 80 4, 160 4, 296 12" fill="none" stroke={CORAL} strokeWidth="7" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.5, duration: 0.7 }} /></svg>
            </motion.span>
          </h1>
          <p className="mx-auto mt-5 max-w-[620px] text-[17px] leading-snug md:text-[19px]">Шиномонтаж: переобувка, балансировка, вулканизация и утилизация шин. Запишитесь заранее — и не стойте в очереди на въезде.</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a href="#fit" className={`${D} inline-flex h-14 items-center gap-2 rounded-full bg-[#ff6f59] px-7 text-[16px] font-semibold ${stk} transition-transform hover:-translate-y-0.5`}>Выбрать время <ArrowRight size={18} /></a>
            <a href={'tel:' + tel(b.phone)} className={`inline-flex h-14 items-center gap-2 rounded-full bg-white px-6 text-[17px] font-semibold ${stk}`}><Phone size={17} />{b.phone}</a>
          </div>
        </motion.div>

        {CH.map(c => <Chapter key={c.n} p={p} c={c} />)}
        <motion.a href="#services" style={{ opacity: skipO }} className="absolute bottom-[88px] right-4 z-[3] rounded-full bg-white px-4 py-2 text-[15px] font-semibold ring-[2.5px] ring-[#22124a] md:bottom-8 md:right-10">Пропустить →</motion.a>
      </div>
    </motion.section>
  )
}

/* ---------------- services ---------------- */
const SV = [
  { t: 'Переобувка', d: 'Колёса в сборе: сняли летние — поставили зимние, и наоборот.', time: '~30–60 мин', c: LEMON, big: true, price: true },
  { t: 'Шиномонтаж', d: 'Перебортовка шин на ваши диски.', time: '~40–60 мин', c: 'white' },
  { t: 'Балансировка', d: 'Чтобы руль не бил и шины изнашивались ровно.', time: '~20–40 мин', c: SKY },
  { t: 'Вулканизация', d: 'Ремонт проколов и порезов — мастер скажет после осмотра.', time: 'по осмотру', c: MINT },
  { t: 'Утилизация шин', d: 'Старые шины можно оставить — не придётся везти их самим.', time: 'при визите', c: CORAL },
  { t: 'Предзапись', d: 'Выберите день и время — приедете к своему окну.', time: '1 минута', c: 'white' },
]
function Services() {
  return (
    <section id="services" className="scroll-mt-24 px-4 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-[1400px]">
        <h2 className={`${D} text-[clamp(36px,5.6vw,80px)] font-bold leading-[1] tracking-[-0.03em]`}>Что умеем <span className="inline-block rotate-3 rounded-2xl bg-[#43d9a3] px-3 ring-[2.5px] ring-[#22124a]">обувать</span></h2>
        <p className="mt-4 max-w-[620px] text-[17px] text-[#22124a]/80">Цена — уточнит мастер. Время — ориентировочное, зависит от авто и размера колёс.</p>
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SV.map((s, i) => (
            <Reveal as="li" key={s.t} delay={i * 0.04} className={`flex flex-col rounded-[28px] p-6 ${stk} ${s.big ? 'sm:col-span-2 lg:row-span-2' : ''}`} style={{ background: s.c }}>
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-[14px] font-semibold ring-2 ring-[#22124a]"><Clock size={14} />{s.time}</span>
              <h3 className={`${D} mt-5 font-bold leading-tight ${s.big ? 'text-[clamp(32px,3.6vw,52px)]' : 'text-[24px]'}`}>{s.t}</h3>
              <p className={`mt-2 flex-1 leading-snug ${s.big ? 'text-[19px]' : 'text-[16px]'}`}>{s.d}</p>
              {s.big && <div className="my-6 flex items-center gap-3"><Wheel kind="summer" size={70} /><ArrowRight size={28} /><Wheel kind="winter" size={70} /></div>}
              <p className="mt-4 text-[14px] font-medium text-[#22124a]/75">{s.price ? PRICE_NOTE : 'Цена — уточнит мастер'}</p>
              <a href="#fit" data-svc={s.t} className={`${D} mt-4 inline-flex h-12 w-fit items-center gap-2 rounded-full bg-[#22124a] px-5 text-[14px] font-semibold text-white hover:bg-white hover:text-[#22124a] hover:ring-2 hover:ring-[#22124a]`}>Записаться <ArrowRight size={16} /></a>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ---------------- fitting room booking (value interaction) ---------------- */
const KINDS = [['winter', 'Зимние', '«ботинки»'], ['summer', 'Летние', '«кеды»'], ['all', 'Всесезонные', '«кроссовки»']]
const RADII = ['R13', 'R14', 'R15', 'R16', 'R17', 'R18', 'R19', 'R20', 'R21+']
const TIMES = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00']
const WD = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб']
const MON = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']

function MiniCar({ kind = 'summer', recycle = false }) {
  return (
    <div className="relative">
      <svg viewBox="0 0 320 150" className="h-auto w-[280px] md:w-[320px]" aria-hidden="true">
        <ellipse cx="160" cy="140" rx="135" ry="7" fill={INK} opacity=".15" />
        <path d="M30 100 Q30 70 60 66 L95 62 Q120 30 160 28 L200 28 Q230 30 250 60 L282 66 Q300 70 300 100 L300 108 Q300 114 294 114 L36 114 Q30 114 30 108 Z" fill={CORAL} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
        <path d="M112 62 Q130 40 160 38 L196 38 Q220 40 236 62 Z" fill={SKY} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
        <line x1="172" y1="38" x2="172" y2="62" stroke={INK} strokeWidth="4" />
        <circle cx="290" cy="82" r="7" fill={CREAM} stroke={INK} strokeWidth="3" />
        <rect x="34" y="78" width="10" height="10" rx="2" fill={LEMON} stroke={INK} strokeWidth="3" />
      </svg>
      <AnimatePresence mode="popLayout">
        {[[0.2, 'l'], [0.75, 'r']].map(([x, k]) => (
          <motion.div key={kind + k} initial={{ y: -60, opacity: 0, rotate: -90 }} animate={{ y: 0, opacity: 1, rotate: 0 }} exit={{ y: 30, x: -30, opacity: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 14 }}
            className="absolute" style={{ left: `calc(${x * 100}% - 30px)`, top: '60%' }}>
            <Wheel kind={kind} size={62} />
          </motion.div>
        ))}
      </AnimatePresence>
      <AnimatePresence>{recycle && <motion.span initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 8 }} exit={{ scale: 0 }} className="absolute -right-2 -top-2 inline-flex items-center gap-1 rounded-full bg-[#43d9a3] px-3 py-1 text-[13px] font-bold ring-2 ring-[#22124a]"><Recycle size={14} />старые — сдаём</motion.span>}</AnimatePresence>
    </div>
  )
}
function Chip({ on, children, className = '', ...r }) {
  return <button type="button" aria-pressed={on} className={`min-h-[48px] rounded-full px-4 text-[16px] font-semibold ring-[2.5px] ring-[#22124a] transition-all ${on ? 'bg-[#22124a] text-white' : 'bg-white hover:-translate-y-0.5 hover:bg-[#ffd23f]'} ${className}`} {...r}>{children}</button>
}
function Toggle({ on, onChange, label, id }) {
  return (
    <button type="button" role="switch" aria-checked={on} id={id} onClick={() => onChange(!on)} className="flex min-h-[56px] w-full items-center justify-between gap-4 rounded-2xl bg-white px-4 text-left text-[16px] font-semibold ring-[2.5px] ring-[#22124a]">
      <span className="flex items-center gap-2"><Recycle size={18} />{label}</span>
      <span className={`relative h-8 w-14 shrink-0 rounded-full ring-2 ring-[#22124a] transition-colors ${on ? 'bg-[#43d9a3]' : 'bg-[#e9e2d3]'}`}><motion.span layout transition={{ type: 'spring', stiffness: 500, damping: 30 }} className={`absolute top-1 h-6 w-6 rounded-full bg-white ring-2 ring-[#22124a] ${on ? 'right-1' : 'left-1'}`} /></span>
    </button>
  )
}
function Fit() {
  const bk = useBooking()
  const [step, setStep] = useState(0)
  const [kind, setKind] = useState('winter')
  const [radius, setRadius] = useState('')
  const [rims, setRims] = useState(true)
  const [recycle, setRecycle] = useState(false)
  const [day, setDay] = useState(null)
  const [time, setTime] = useState('')
  const [err, setErr] = useState('')
  const head = useRef(null)
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i); return { k: i, wd: i === 0 ? 'сегодня' : i === 1 ? 'завтра' : WD[d.getDay()], label: `${d.getDate()} ${MON[d.getMonth()]}` } }), [])
  useEffect(() => { if (step) head.current?.focus() }, [step])
  const kindLabel = KINDS.find(k => k[0] === kind)
  const next = e => {
    e.preventDefault()
    if (step === 0 && !radius) return setErr('Выберите радиус — это «размер обуви» вашей машины')
    if (step === 1 && (day === null || !time)) return setErr('Выберите день и время')
    setErr('')
    if (step < 2) setStep(step + 1); else { if (!bk.s.svc) bk.upd('svc', 'Переобувка'); bk.submit() }
  }
  const summary = `${bk.s.svc && bk.s.svc !== 'Переобувка' ? bk.s.svc + ' · ' : ''}${kindLabel[1]} ${radius || ''} · ${rims ? 'колёса на дисках' : 'только шины'}${recycle ? ' · утилизация старых' : ''}`
  return (
    <section id="fit" className="scroll-mt-24 bg-[#22124a] px-4 py-20 text-white md:px-8 md:py-28">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid gap-6 lg:grid-cols-[auto_1fr] lg:items-end lg:gap-14">
          <h2 className={`${D} text-[clamp(36px,5.6vw,80px)] font-bold leading-[1] tracking-[-0.03em]`}>Примерочная<span className="text-[#ffd23f]">.</span></h2>
          <p className="max-w-[520px] text-[18px] text-white/80">Что надеваем, какой размер, когда приедете. Три шага — и окно ваше. Рядом автомойка, в сезон на въезде бывает очередь — с записью проще.</p>
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-[.85fr_1.15fr]">
          {/* live preview */}
          <div className={`flex flex-col items-center justify-between gap-6 rounded-[32px] bg-[#fff6e5] p-6 text-[#22124a] md:p-8 ${stk.replace('#22124a]', '#ffd23f]')}`}>
            <p className={`${D} self-start text-[14px] font-semibold`}>Ваша машина в {kindLabel[2]}</p>
            <MiniCar kind={kind} recycle={recycle} />
            <div className="w-full rounded-2xl bg-white p-4 ring-2 ring-[#22124a]">
              <p className="text-[15px] font-semibold">{summary}</p>
              <p className="mt-1 text-[14px] text-[#22124a]/70">{day !== null && time ? `${days[day].wd}, ${days[day].label} · ${time}` : 'Время ещё не выбрано'}</p>
              <p className="mt-3 border-t border-dashed border-[#22124a]/30 pt-3 text-[13.5px] text-[#22124a]/75">{PRICE_NOTE}</p>
            </div>
          </div>
          {/* steps */}
          <div className="rounded-[32px] bg-white p-5 text-[#22124a] md:p-8">
            {bk.s.sent ? (
              <div className="py-8 text-center" role="status">
                <CheckDraw className="mx-auto text-[#43d9a3]" />
                <p className={`${D} mt-5 text-[32px] font-bold`}>Окно ваше!</p>
                <p className="mx-auto mt-3 max-w-[420px] text-[17px] text-[#22124a]/80">{summary}. {days[day].wd}, {days[day].label} в {time}. Мастер перезвонит и подтвердит. В готовом сайте заявка сразу придёт вам в Telegram.</p>
                <button type="button" onClick={() => { bk.reset(); setStep(0); setDay(null); setTime(''); setRadius('') }} className="mt-6 min-h-[44px] text-[15px] font-semibold underline underline-offset-4">Новая запись</button>
              </div>
            ) : (
              <form onSubmit={next} noValidate>
                <ol className="flex gap-2" aria-label="Шаги">{['Что надеваем', 'Когда', 'Контакт'].map((t, i) => <li key={t} aria-current={i === step ? 'step' : undefined} className={`flex-1 rounded-full py-2 text-center text-[13.5px] font-bold ring-2 ring-[#22124a] ${i < step ? 'bg-[#43d9a3]' : i === step ? 'bg-[#ffd23f]' : 'bg-white text-[#22124a]/50 ring-[#22124a]/20'}`}>{i + 1}. {t}</li>)}</ol>
                <h3 ref={head} tabIndex={-1} className={`${D} mt-6 text-[26px] font-bold outline-none`}>{['Что надеваем?', 'Когда приедете?', 'Куда позвонить?'][step]}</h3>
                <AnimatePresence mode="wait">
                  <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ type: 'spring', stiffness: 300, damping: 28 }} className="mt-5">
                    {step === 0 && <div className="space-y-6">
                      {bk.s.svc && <p className="inline-flex rounded-full bg-[#fff1c9] px-3 py-1 text-[14px] font-semibold ring-2 ring-[#22124a]">Услуга: {bk.s.svc}</p>}
                      <div role="radiogroup" aria-label="Какие колёса ставим" className="grid grid-cols-3 gap-2">
                        {KINDS.map(([k, t, s]) => (
                          <button key={k} type="button" role="radio" aria-checked={kind === k} onClick={() => setKind(k)} className={`flex min-h-[112px] flex-col items-center justify-center gap-1 rounded-2xl p-2 ring-[2.5px] transition-all ${kind === k ? 'bg-[#ffd23f] ring-[#22124a]' : 'ring-[#22124a]/25 hover:ring-[#22124a]'}`}>
                            <Wheel kind={k} size={44} /><span className="text-[15px] font-bold">{t}</span><span className="text-[12.5px] text-[#22124a]/70">{s}</span>
                          </button>
                        ))}
                      </div>
                      <div>
                        <p id="pr-r" className="text-[15px] font-semibold">Радиус — «размер обуви»</p>
                        <div role="group" aria-labelledby="pr-r" className="mt-2 flex flex-wrap gap-2">{RADII.map(r => <Chip key={r} on={radius === r} onClick={() => { setRadius(r); setErr('') }} className="min-w-[64px]">{r}</Chip>)}</div>
                        <p className="mt-2 text-[13.5px] text-[#22124a]/65">Радиус написан на боковине шины: например, 205/55 <b>R16</b>.</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Chip on={rims} onClick={() => setRims(true)}>Колёса на дисках</Chip>
                        <Chip on={!rims} onClick={() => setRims(false)}>Только шины</Chip>
                      </div>
                      <Toggle on={recycle} onChange={setRecycle} label="Утилизировать старые шины?" id="pr-rec" />
                    </div>}
                    {step === 1 && <div className="space-y-6">
                      <div role="radiogroup" aria-label="День" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 pt-1">
                        {days.map(d => (
                          <button key={d.k} type="button" role="radio" aria-checked={day === d.k} onClick={() => { setDay(d.k); setErr('') }} className={`flex min-h-[72px] min-w-[84px] shrink-0 flex-col items-center justify-center rounded-2xl ring-[2.5px] ${day === d.k ? 'bg-[#22124a] text-white ring-[#22124a]' : 'ring-[#22124a]/25 hover:ring-[#22124a]'}`}>
                            <span className="text-[13px] font-semibold opacity-80">{d.wd}</span><span className="text-[17px] font-bold">{d.label}</span>
                          </button>
                        ))}
                      </div>
                      <div role="radiogroup" aria-label="Время" className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                        {TIMES.map(t => <Chip key={t} on={time === t} onClick={() => { setTime(t); setErr('') }}>{t}</Chip>)}
                      </div>
                      <p className="text-[13.5px] text-[#22124a]/65">Часы работы и свободные окна мастер подтвердит по телефону.</p>
                    </div>}
                    {step === 2 && <div className="grid gap-4 sm:grid-cols-2">
                      <div><label htmlFor="pr-name" className="text-[15px] font-semibold">Имя</label><input id="pr-name" value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} autoComplete="name" className="mt-1.5 h-14 w-full rounded-2xl px-4 text-[17px] outline-none ring-[2.5px] ring-[#22124a]/30 focus:ring-[#22124a]" /></div>
                      <div><label htmlFor="pr-phone" className="text-[15px] font-semibold">Телефон</label><input id="pr-phone" value={bk.s.phone} onChange={e => bk.upd('phone', e.target.value)} onFocus={phoneFocus(bk)} type="tel" inputMode="tel" autoComplete="tel" placeholder="+375 __ ___-__-__" aria-invalid={bk.s.err} aria-describedby={bk.s.err ? 'pr-perr' : undefined} className={`mt-1.5 h-14 w-full rounded-2xl px-4 text-[17px] outline-none ring-[2.5px] focus:ring-[#22124a] ${bk.s.err ? 'ring-[#d92d20]' : 'ring-[#22124a]/30'}`} />
                        {bk.s.err && <p id="pr-perr" className="mt-2 text-[15px] font-semibold text-[#d92d20]">Проверьте номер — 12 цифр с кодом +375.</p>}</div>
                    </div>}
                  </motion.div>
                </AnimatePresence>
                {err && <p className="mt-4 text-[15px] font-semibold text-[#d92d20]" role="alert">{err}</p>}
                <div className="mt-8 flex items-center justify-between gap-3">
                  {step > 0 ? <button type="button" onClick={() => setStep(step - 1)} className="min-h-[44px] text-[15px] font-semibold text-[#22124a]/70 hover:text-[#22124a]">← Назад</button> : <span />}
                  <button type="submit" disabled={bk.s.loading} className={`${D} inline-flex h-14 items-center gap-2 rounded-full bg-[#ff6f59] px-7 text-[16px] font-semibold ${stk} disabled:opacity-60`}>{step < 2 ? 'Дальше' : bk.s.loading ? 'Отправляем…' : 'Записаться'} <ArrowRight size={18} /></button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- how ---------------- */
const STEPS = [['Записались', 'Выбрали время в примерочной или позвонили.', LEMON], ['Приехали к окну', `${b.addr}. Без ожидания в общей очереди.`, SKY], ['Переобули', 'Сняли, поставили, отбалансировали.', MINT], ['Поехали', 'Старые шины — оставили на утилизацию, если нужно.', CORAL]]
function How() {
  return (
    <section id="how" className="scroll-mt-24 px-4 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-[1400px]">
        <h2 className={`${D} text-[clamp(36px,5.6vw,80px)] font-bold leading-[1] tracking-[-0.03em]`}>Как это работает</h2>
        <ol className="mt-12 grid gap-5 md:grid-cols-4">
          {STEPS.map(([h, d, c], i) => (
            <motion.li key={h} initial={{ opacity: 0, y: 40, rotate: i % 2 ? 4 : -4 }} whileInView={{ opacity: 1, y: 0, rotate: i % 2 ? 1.5 : -1.5 }} viewport={{ once: true, margin: '-10% 0px' }} transition={{ type: 'spring', stiffness: 160, damping: 14, delay: i * 0.08 }} className={`rounded-[28px] p-6 ${stk}`} style={{ background: c }}>
              <span className={`${D} text-[56px] font-bold leading-none`}>{i + 1}</span>
              <h3 className={`${D} mt-4 text-[22px] font-bold leading-tight`}>{h}</h3>
              <p className="mt-2 text-[16px] leading-snug">{d}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function Rating() {
  return (
    <section id="rating" className="scroll-mt-24 px-4 pb-20 md:px-8 md:pb-28">
      <div className={`mx-auto grid max-w-[1400px] items-center gap-8 rounded-[40px] bg-[#ffd23f] p-8 md:grid-cols-[auto_1fr] md:p-14 ${stk}`}>
        <div className="flex items-end gap-4">
          <span className={`${D} text-[clamp(96px,14vw,200px)] font-bold leading-[.85] tracking-[-0.05em]`}>{b.rating}</span>
          <span className="pb-3"><span className="flex gap-0.5">{[0, 1, 2, 3, 4].map(i => <Star key={i} size={22} fill={INK} />)}</span><span className="mt-1 block text-[17px] font-semibold">{b.rev} оценок</span></span>
        </div>
        <div>
          <p className={`${D} text-[clamp(22px,2.6vw,36px)] font-bold leading-tight`}>Средняя оценка на Яндекс Картах — по {b.rev} оценкам водителей.</p>
          <a href={`https://yandex.ru/maps/org/${b.oid}/reviews/`} target="_blank" rel="noopener" className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-white px-5 text-[16px] font-semibold ring-[2.5px] ring-[#22124a]">Читать отзывы <ArrowUpRight size={17} /></a>
        </div>
      </div>
    </section>
  )
}

const FAQ = [
  ['Сколько длится переобувка?', 'Обычно 30–60 минут для колёс в сборе. Если нужна перебортовка шин на диски — дольше. Точнее скажет мастер.'],
  ['Есть ли очередь?', 'Рядом автомойка, и в сезон на въезде бывает очередь. Поэтому лучше записаться заранее — приедете к своему времени.'],
  ['Сколько стоит?', PRICE_NOTE + ' Цена зависит от радиуса и того, на дисках ли колёса.'],
  ['Можно сдать старые шины?', 'Да, есть утилизация шин. Отметьте это при записи — мастер подскажет условия.'],
  ['Как оплатить?', 'Способы оплаты уточняйте по телефону.'],
  ['Можно ли подождать на месте?', 'Уточните по телефону при записи — подскажем, как удобнее.'],
]
function Faq() {
  const [o, setO] = useState(0)
  return (
    <section id="faq" className="bg-white px-4 py-20 md:px-8 md:py-28">
      <div className="mx-auto grid max-w-[1400px] gap-10 lg:grid-cols-[.7fr_1.3fr]">
        <h2 className={`${D} text-[clamp(36px,5.6vw,80px)] font-bold leading-[1] tracking-[-0.03em]`}>Вопросы?</h2>
        <div className="space-y-3">
          {FAQ.map(([q, a], i) => (
            <div key={q} className={`rounded-3xl ring-[2.5px] ring-[#22124a] ${o === i ? 'bg-[#e3f2ff]' : 'bg-white'}`}>
              <h3><button type="button" aria-expanded={o === i} aria-controls={'rq' + i} onClick={() => setO(o === i ? -1 : i)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-[18px] font-bold md:text-[20px]">{q}<span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#ffd23f] ring-2 ring-[#22124a]">{o === i ? <Minus size={18} /> : <Plus size={18} />}</span></button></h3>
              <AnimatePresence initial={false}>{o === i && <motion.div id={'rq' + i} initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden"><p className="max-w-[680px] px-5 pb-5 text-[17px] leading-relaxed">{a}</p></motion.div>}</AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Contact() {
  return (
    <section id="contact" className="scroll-mt-24 px-4 py-20 md:px-8 md:py-28">
      <div className="mx-auto grid max-w-[1400px] gap-6 lg:grid-cols-[.9fr_1.1fr]">
        <div className={`rounded-[32px] bg-[#7cc6ff] p-7 md:p-10 ${stk}`}>
          <h2 className={`${D} text-[clamp(36px,5vw,72px)] font-bold leading-[1] tracking-[-0.03em]`}>Где нас найти</h2>
          <dl className="mt-8 space-y-5">
            <div><dt className="text-[14px] font-semibold opacity-75">Адрес</dt><dd className={`${D} mt-1 text-[22px] font-semibold`}>{b.addr}, {b.city}</dd></div>
            <div><dt className="text-[14px] font-semibold opacity-75">Телефон</dt><dd><a href={'tel:' + tel(b.phone)} className={`${D} mt-1 inline-block text-[22px] font-semibold underline-offset-4 hover:underline`}>{b.phone}</a></dd></div>
            <div><dt className="text-[14px] font-semibold opacity-75">Часы работы</dt><dd className="mt-1 text-[17px] font-medium">Уточняйте по телефону</dd></div>
            <div><dt className="text-[14px] font-semibold opacity-75">Ориентир</dt><dd className="mt-1 text-[17px] font-medium">Рядом с автомойкой</dd></div>
          </dl>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={'tel:' + tel(b.phone)} className={`${D} inline-flex h-14 items-center gap-2 rounded-full bg-[#ff6f59] px-6 text-[15px] font-semibold ring-[2.5px] ring-[#22124a]`}><Phone size={17} />Позвонить</a>
            <a href={b.ig} target="_blank" rel="noopener" className="inline-flex h-14 items-center gap-2 rounded-full bg-white px-6 text-[16px] font-semibold ring-[2.5px] ring-[#22124a]"><IG />Instagram</a>
            <a href={`https://yandex.ru/maps/org/${b.oid}/`} target="_blank" rel="noopener" className="inline-flex h-14 items-center gap-2 rounded-full bg-white px-6 text-[16px] font-semibold ring-[2.5px] ring-[#22124a]">Маршрут <ArrowUpRight size={17} /></a>
          </div>
        </div>
        <div className={`h-[400px] overflow-hidden rounded-[32px] lg:h-auto lg:min-h-[520px] ${stk}`}><MapFrame oid={b.oid} /></div>
      </div>
    </section>
  )
}

function App() {
  useSmooth()
  const lite = useLite()
  return (
    <MotionConfig reducedMotion="user">
      <div className="overflow-x-clip font-['Golos_Text',sans-serif]" style={{ background: CREAM, color: INK, '--sel': LEMON, '--selc': INK }}>
        <Ribbon name={b.name} bg={INK} fg="#fff" />
        <Header />
        <main>
          <Film lite={lite} />
          <Services />
          <Fit />
          <How />
          <Rating />
          <Faq />
          <Contact />
        </main>
        <footer className="flex flex-wrap justify-between gap-3 bg-[#22124a] px-4 py-6 text-[14px] text-white/75 md:px-8"><span>© 2026 {b.name} · Концепт сайта — Артём</span><span>{b.addr}, {b.city}</span></footer>
        <CallBar phone={b.phone} barCls="bg-[#fff6e5] border-t-[2.5px] border-[#22124a]" callCls="rounded-full bg-white ring-[2.5px] ring-[#22124a] text-[#22124a]" bookCls="rounded-full bg-[#ff6f59] ring-[2.5px] ring-[#22124a] text-[#22124a]" />
        <div className="h-[72px] bg-[#22124a] sm:hidden" />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
