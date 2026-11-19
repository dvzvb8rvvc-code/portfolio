import React, { useRef, useState, useEffect, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, useSpring, useInView, useMotionTemplate, AnimatePresence, MotionConfig } from 'framer-motion'
import { ArrowRight, Phone, MapPin, Plus, Minus, Star, CircleDot, Scissors, RefreshCw, Flame, Snowflake, HelpCircle, Moon, Sun } from 'lucide-react'
import '../lib/base.css'
import { useSmooth, Ribbon, Reveal, useBooking, phoneFocus, CheckDraw, MapFrame, CallBar, tel, useLite, useIsMobile } from '../lib/kit'

const NightScene = lazy(() => import('./landera3d'))

const b = {
  name: 'Шиномонтаж на Ландера', addr: 'ул. Ландера, 54А', district: 'Курасовщина', city: 'Минск',
  phone: '+375 29 156-06-93', rating: '5,0', rev: 470, oid: '1084063065',
}
const AMB = '#ffb547', INK = '#0b1020', NAVY = '#121a33', DAY = '#eef1f6'
const D = "font-['Tektur',sans-serif]"
const NAV = [['help', 'Что случилось'], ['services', 'Услуги'], ['how', 'Как работаем'], ['rating', 'Отзывы'], ['contact', 'Контакты']]

/* ---------- time helpers ---------- */
function minskNow() {
  try { return new Intl.DateTimeFormat('ru-RU', { timeZone: 'Europe/Minsk', hour: '2-digit', minute: '2-digit' }).format(new Date()) } catch (e) { return '' }
}
function useNow() {
  const [t, setT] = useState(minskNow())
  useEffect(() => { const id = setInterval(() => setT(minskNow()), 15000); return () => clearInterval(id) }, [])
  return t
}
const fmtH = h => { const hh = ((h % 24) + 24) % 24; const H = Math.floor(hh), M = Math.floor((hh - H) * 60); return String(H).padStart(2, '0') + ':' + String(M).padStart(2, '0') }

function useActive(ids) {
  const [a, setA] = useState('')
  useEffect(() => {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) setA(e.target.id) }), { rootMargin: '-45% 0px -50% 0px' })
    ids.forEach(id => { const el = document.getElementById(id); if (el) io.observe(el) })
    return () => io.disconnect()
  }, [])
  return a
}

function LiveBadge({ className = '' }) {
  const now = useNow()
  return (
    <p className={`inline-flex items-center gap-2.5 rounded-full border border-[#3df59b]/40 bg-[#0b1020]/70 py-1.5 pl-2.5 pr-4 text-[14px] font-semibold text-white backdrop-blur ${className}`} role="status">
      <span className="relative flex h-2.5 w-2.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3df59b] opacity-70 motion-reduce:animate-none" /><span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#3df59b]" /></span>
      Сейчас открыто · круглосуточно{now && <span className={`${D} text-white/60`}>· {now}</span>}
    </p>
  )
}

function Header() {
  const a = useActive(NAV.map(n => n[0]))
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0b1020]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-4 md:px-8">
        <a href="#top" className="flex items-center gap-3 text-white">
          <span className={`${D} grid h-10 w-10 place-items-center rounded-full border-2 border-[#ffb547] text-[13px] font-bold text-[#ffb547]`}>24</span>
          <span className="leading-tight"><span className={`${D} block text-[17px] font-bold uppercase tracking-wide`}>Ландера 54А</span><span className="block text-[12px] text-white/60">шиномонтаж · {b.district}</span></span>
        </a>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Разделы">
          {NAV.map(([id, t]) => <a key={id} href={'#' + id} aria-current={a === id ? 'true' : undefined} className={`rounded-full px-3.5 py-2 text-[14px] font-medium transition-colors ${a === id ? 'bg-white text-[#0b1020]' : 'text-white/75 hover:text-white'}`}>{t}</a>)}
        </nav>
        <div className="flex items-center gap-2">
          <a href={'tel:' + tel(b.phone)} className={`${D} hidden items-center gap-2 px-3 text-[15px] font-semibold text-white hover:text-[#ffb547] md:flex`}><Phone size={16} />{b.phone}</a>
          <a href="#book" className="inline-flex h-11 items-center rounded-full bg-[#ffb547] px-5 text-[15px] font-bold text-[#0b1020] hover:bg-white">Записаться</a>
        </div>
      </div>
    </header>
  )
}

/* ---------- hero + pinned 24h film ---------- */
const HK = [0, 0.24, 0.44, 0.64, 0.86, 1], HV = [18, 22.67, 27.25, 31.5, 37, 41]
const CH = [
  { t: '22:40', icon: Moon, h: 'Прокол по дороге домой', d: 'Мы работаем. Позвоните — скажем, когда подъехать.', r: [0.14, 0.34], dark: true },
  { t: '03:15', icon: Moon, h: 'Город спит. Мы — нет.', d: 'Ночью закрыто почти всё. Шиномонтаж на Ландера — открыт.', r: [0.34, 0.54], dark: true },
  { t: '07:30', icon: Sun, h: 'Перед работой', d: 'Переобуть, подкачать, проверить колёса — пока город просыпается.', r: [0.54, 0.75], dark: false },
  { t: '13:00', icon: Sun, h: 'И в любое другое время', d: 'Хранение шин, аргонная сварка дисков, заправка кондиционера.', r: [0.75, 1.2], dark: false },
]
function Chapter({ p, c }) {
  const k = [c.r[0], c.r[0] + 0.04, c.r[1] - 0.04, c.r[1]]
  const o = useTransform(p, k, [0, 1, 1, 0])
  const y = useTransform(p, k, [30, 0, 0, -20])
  const I = c.icon
  return (
    <motion.div style={{ opacity: o, y }} className={`pointer-events-none absolute inset-x-5 top-[5vh] md:left-10 md:right-auto md:top-[16vh] md:w-[46vw] ${c.dark ? 'text-white' : 'text-[#0b1020]'}`}>
      <p className={`${D} flex items-center gap-2 text-[15px] font-semibold ${c.dark ? 'text-[#ffb547]' : 'text-[#7a4a00]'}`}><I size={16} />{c.t}</p>
      <h2 className={`${D} mt-3 text-[clamp(40px,6.4vw,104px)] font-extrabold uppercase leading-[.9] tracking-[-0.01em] [text-shadow:0_2px_24px_rgba(0,0,0,.18)]`}>{c.h}</h2>
      <p className={`mt-4 max-w-[460px] text-[17px] font-medium leading-snug md:text-[20px] ${c.dark ? 'text-white/80' : 'text-[#0b1020]/80'}`}>{c.d}</p>
    </motion.div>
  )
}
function LiteCity({ hour }) {
  const rot = useTransform(hour, v => ((v - 12) / 24) * 360)
  return (
    <div className="absolute inset-x-0 bottom-0 h-[60%] md:left-[40%]">
      <motion.div style={{ rotate: rot }} className="absolute bottom-[-40%] left-1/2 aspect-square w-[90%] -translate-x-1/2 rounded-full border-2 border-white/30">
        <span className="absolute left-1/2 top-[-14px] h-7 w-7 -translate-x-1/2 rounded-full bg-[#ffd27a]" />
        <span className="absolute bottom-[-10px] left-1/2 h-5 w-5 -translate-x-1/2 rounded-full bg-[#e3e8f6]" />
      </motion.div>
      <div className="absolute inset-x-0 bottom-0 h-[30%] bg-[#151b33]" style={{ clipPath: 'polygon(0 40%,8% 40%,8% 10%,16% 10%,16% 50%,26% 50%,26% 0,34% 0,34% 30%,44% 30%,44% 55%,56% 55%,56% 20%,66% 20%,66% 45%,76% 45%,76% 5%,86% 5%,86% 35%,100% 35%,100% 100%,0 100%)' }} />
    </div>
  )
}
function Film({ lite }) {
  const ref = useRef(null)
  const mob = useIsMobile()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.4 })
  const hour = useTransform(p, HK, HV)
  const near = useInView(ref, { margin: '200px 0px' })
  const [mounted, setMounted] = useState(false)
  useEffect(() => { if (near) setMounted(true) }, [near])
  const HS = [18, 20, 23, 27, 29.5, 31.5, 37, 41]
  const top = useTransform(hour, HS, ['#3a3f7a', '#121a3d', '#070b1a', '#05070f', '#1b2350', '#8fbfe6', '#6aaee6', '#5b8fd0'])
  const bot = useTransform(hour, HS, ['#d9825f', '#3b3566', '#141b38', '#0d1226', '#c97a6a', '#f6d3b0', '#d6ecfa', '#f2c49b'])
  const bg = useMotionTemplate`linear-gradient(180deg, ${top} 0%, ${bot} 100%)`
  const heroO = useTransform(p, [0, 0.1], [1, 0])
  const heroPE = useTransform(p, v => (v < 0.06 ? 'auto' : 'none'))
  const stageY = useTransform(p, [0, 0.1], [mob ? '22vh' : '0vh', '0vh'])
  const clock = useTransform(hour, fmtH)
  const hudCol = useTransform(hour, [28.5, 30], ['#ffffff', '#0b1020'])
  const hudO = useTransform(p, [0.05, 0.1], [0, 1])
  const bar = useTransform(p, [0, 1], ['0%', '100%'])
  return (
    <section ref={ref} id="top" className="relative h-[300vh]" style={{ background: INK }}>
      <motion.div style={{ background: bg }} className="sticky top-16 h-[calc(100svh-64px)] overflow-hidden">
        <motion.div style={{ y: stageY }} className="absolute inset-0">
          {lite ? <LiteCity hour={hour} /> : mounted && <Suspense fallback={<LiteCity hour={hour} />}><NightScene hour={hour} progress={p} active={near} /></Suspense>}
        </motion.div>

        <motion.div aria-hidden="true" style={{ opacity: heroO }} className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(90deg,rgba(11,16,32,.85)_0%,rgba(11,16,32,.55)_40%,transparent_62%)] max-md:bg-[linear-gradient(180deg,rgba(11,16,32,.6)_0%,rgba(11,16,32,.2)_60%,transparent_100%)]" />
        <motion.div style={{ opacity: heroO, pointerEvents: heroPE }} className="relative z-[2] mx-auto max-w-[1400px] px-5 pt-6 md:px-10 md:pt-[7vh]">
          <LiveBadge />
          <h1 className={`${D} mt-5 max-w-[760px] text-[clamp(42px,6.6vw,104px)] font-extrabold uppercase leading-[.92] text-white`}>
            Шиномонтаж на Ландера <span className="block text-[#ffb547]">открыт, когда всё закрыто</span>
          </h1>
          <p className="mt-4 max-w-[520px] text-[17px] font-medium leading-snug text-white/85 md:text-[19px]">Круглосуточно в Курасовщине: проколы, порезы, перебортовка, сварка дисков аргоном, заправка кондиционера.</p>
          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-white">
            <a href="#rating" className="inline-flex items-center gap-2.5"><span className={`${D} text-[32px] font-bold leading-none text-[#ffb547]`}>{b.rating}</span><span className="text-[14px] leading-tight">на Яндекс Картах<br /><span className="text-white/65">{b.rev} оценок</span></span></a>
            <span className="inline-flex items-center gap-2 text-[15px] text-white/85"><MapPin size={16} className="text-[#ffb547]" />{b.addr}, {b.district}</span>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={'tel:' + tel(b.phone)} className={`${D} inline-flex h-14 items-center gap-2.5 rounded-full bg-[#ffb547] px-7 text-[18px] font-bold text-[#0b1020] hover:bg-white`}><Phone size={19} />Позвонить</a>
            <a href="#book" className="inline-flex h-14 items-center gap-2 rounded-full border-2 border-white/40 px-6 text-[16px] font-bold text-white hover:border-white">Записаться <ArrowRight size={18} /></a>
            <a href="#help" className="inline-flex h-14 items-center gap-2 px-2 text-[16px] font-semibold text-white underline decoration-[#ffb547] decoration-2 underline-offset-[6px]">Что случилось?</a>
          </div>
        </motion.div>

        {CH.map(c => <Chapter key={c.t} p={p} c={c} />)}

        <motion.div style={{ opacity: hudO, color: hudCol }} className="pointer-events-none absolute bottom-[88px] left-5 right-5 z-[3] flex items-end justify-between gap-6 md:bottom-6 md:left-10 md:right-10">
          <div className="w-full max-w-[300px]">
            <div className="flex items-baseline justify-between"><motion.span className={`${D} text-[34px] font-bold leading-none`}>{clock}</motion.span><span className="text-[13px] font-semibold opacity-75">открыто</span></div>
            <div className="mt-2 h-[4px] rounded-full bg-current/20" style={{ background: 'rgba(127,127,127,.35)' }}><motion.div style={{ width: bar }} className="h-full rounded-full bg-[#ffb547]" /></div>
          </div>
          <a href="#help" className="pointer-events-auto shrink-0 text-[15px] font-semibold underline underline-offset-4">Пропустить →</a>
        </motion.div>
      </motion.div>
    </section>
  )
}

/* ---------- triage (value interaction) ---------- */
const CASES = [
  { k: 'prokol', t: 'Прокол в пути', I: CircleDot, svc: 'Ремонт прокола', steps: ['Включите аварийку и остановитесь в безопасном месте.', 'Не едьте далеко на спущенном колесе — так легко испортить шину и диск.', 'Поставьте запаску или подкачайте колесо и приезжайте на Ландера, 54А.'], note: 'Мастер осмотрит колесо и скажет, можно ли его отремонтировать.' },
  { k: 'porez', t: 'Порез или грыжа', I: Scissors, svc: 'Вулканизация / ремонт пореза', steps: ['Не подкачивайте колесо выше нормы и не разгоняйтесь.', 'По возможности поставьте запаску.', 'Привезите колесо — мастер оценит, поможет ли вулканизация.'], note: 'Некоторые боковые повреждения не ремонтируются — скажем честно, до начала работ.' },
  { k: 'perebort', t: 'Перебортовка', I: RefreshCw, svc: 'Перебортовка / переобувка', steps: ['Позвоните и уточните, когда удобнее подъехать.', 'Если стоят секретки — возьмите ключ от них.', 'Сезонный комплект можно сразу оставить на хранение.'], note: 'Время работы зависит от колёс — мастер подскажет по телефону.' },
  { k: 'disk', t: 'Сварка диска', I: Flame, svc: 'Аргонная сварка диска', steps: ['Трещина или отлом? Не ставьте такой диск на ход.', 'Приезжайте на авто или привезите снятое колесо.', 'Мастер посмотрит и скажет, подлежит ли диск сварке.'], note: 'Сварка — аргоном. Решение принимаем после осмотра.' },
  { k: 'ac', t: 'Кондиционер', I: Snowflake, svc: 'Заправка кондиционера', steps: ['Кондиционер дует тёплым или слабо холодит?', 'Позвоните — договоримся о времени.', 'Приезжайте: заправим и подскажем, что дальше.'], note: 'Если причина не в заправке — мастер скажет, куда смотреть.' },
  { k: 'other', t: 'Другое', I: HelpCircle, svc: 'Нужна консультация', steps: ['Опишите проблему по телефону — так быстрее всего.', 'Скажем, сможем ли помочь и когда подъехать.', 'Работаем круглосуточно.'], note: 'Звонок ни к чему не обязывает.' },
]
function CaseBtn({ c, on, onClick }) {
  const I = c.I
  return (
    <button type="button" aria-pressed={on} onClick={onClick} className={`flex min-h-[68px] items-center gap-3 rounded-2xl border-2 px-4 text-left text-[17px] font-semibold transition-colors ${on ? 'border-[#ffb547] bg-[#ffb547] text-[#0b1020]' : 'border-white/15 bg-white/[.04] text-white hover:border-white/50'}`}>
      <I size={22} strokeWidth={2.2} className="shrink-0" />{c.t}
    </button>
  )
}
function Triage() {
  const [k, setK] = useState('prokol')
  const now = useNow()
  const c = CASES.find(x => x.k === k)
  return (
    <section id="help" className="scroll-mt-16 bg-[#0b1020] px-5 py-20 text-white md:px-10 md:py-28">
      <div className="mx-auto max-w-[1300px]">
        <Reveal><p className={`${D} text-[14px] font-semibold uppercase tracking-[.14em] text-[#ffb547]`}>Быстрая помощь</p></Reveal>
        <Reveal><h2 className={`${D} mt-3 text-[clamp(44px,7vw,110px)] font-extrabold uppercase leading-[.9]`}>Что случилось?</h2></Reveal>
        <p className="mt-4 max-w-[560px] text-[18px] text-white/75">Выберите ситуацию — подскажем, что сделать прямо сейчас. Остальное — по телефону, в любое время суток.</p>
        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.15fr]">
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2" role="group" aria-label="Ситуация">
            {CASES.map(x => <CaseBtn key={x.k} c={x} on={x.k === k} onClick={() => setK(x.k)} />)}
          </div>
          <div className="relative overflow-hidden rounded-3xl border border-white/12 bg-[#121a33] p-6 md:p-9" aria-live="polite">
            <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#ffb547]/15 blur-3xl" />
            <AnimatePresence mode="wait">
              <motion.div key={k} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }} className="relative">
                <h3 className={`${D} text-[30px] font-bold uppercase leading-none md:text-[38px]`}>{c.t}</h3>
                <p className="mt-6 text-[14px] font-semibold uppercase tracking-[.12em] text-white/55">Что сделать сейчас</p>
                <ol className="mt-3 space-y-3">
                  {c.steps.map((s, i) => <li key={s} className="flex gap-4 text-[18px] leading-snug"><span className={`${D} grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-[15px] font-bold text-[#0b1020]`}>{i + 1}</span><span className="pt-0.5">{s}</span></li>)}
                </ol>
                <p className="mt-5 border-l-2 border-[#ffb547] pl-4 text-[16px] text-white/75">{c.note}</p>
                <a href={'tel:' + tel(b.phone)} className={`${D} mt-7 flex h-[72px] w-full items-center justify-center gap-3 rounded-2xl bg-[#ffb547] text-[22px] font-bold text-[#0b1020] hover:bg-white md:text-[26px]`}><Phone size={24} />Позвонить · {b.phone}</a>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[15px]">
                  <span className="text-white/65">{now ? `Сейчас ${now} — мы открыты` : 'Мы открыты круглосуточно'}</span>
                  <a href="#book" data-svc={c.svc} className="font-semibold underline decoration-[#ffb547] decoration-2 underline-offset-4">или оставить заявку →</a>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- services (day palette) ---------- */
const SV = [
  ['Шиномонтаж', 'Снятие, монтаж и балансировка колёс легкового авто.', '≈ 30–60 мин'],
  ['Сезонная переобувка', 'Лето ↔ зима: колёса в сборе или перебортовка.', '≈ 20–60 мин'],
  ['Ремонт проколов', 'Латка или грибок, проверка давления.', '≈ 20–40 мин'],
  ['Вулканизация', 'Ремонт порезов и повреждений шины — по осмотру.', 'по осмотру'],
  ['Балансировка', 'Убираем биение руля на скорости.', '≈ 20–40 мин'],
  ['Хранение шин', 'Оставьте сезонный комплект — заберёте, когда нужно.', 'уточняйте'],
  ['Аргонная сварка дисков', 'Трещины и отломы на легкосплавных дисках.', 'по осмотру'],
  ['Заправка кондиционера', 'Возвращаем холод в салон.', 'уточняйте'],
]
function Services() {
  return (
    <section id="services" className="scroll-mt-16 bg-[#eef1f6] px-5 py-20 text-[#0b1020] md:px-10 md:py-28">
      <div className="mx-auto max-w-[1300px]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className={`${D} flex items-center gap-2 text-[14px] font-semibold uppercase tracking-[.14em] text-[#8a5a00]`}><Sun size={16} />Днём и ночью</p>
            <h2 className={`${D} mt-3 text-[clamp(44px,7vw,110px)] font-extrabold uppercase leading-[.9]`}>Услуги</h2>
          </div>
          <p className="max-w-[360px] text-[16px] text-[#0b1020]/70">Цена — уточнит мастер после осмотра. Время — ориентировочное и зависит от колёс.</p>
        </div>
        <ul className="mt-12 grid gap-3 md:grid-cols-2">
          {SV.map(([t, d, time], i) => (
            <Reveal as="li" key={t} delay={(i % 2) * 0.05} className="group flex flex-col justify-between gap-5 rounded-3xl bg-white p-6 shadow-[0_1px_0_rgba(11,16,32,.06)] transition-shadow hover:shadow-[0_20px_50px_-24px_rgba(11,16,32,.35)] sm:flex-row sm:items-center md:p-7">
              <div className="flex gap-5">
                <span className={`${D} pt-1 text-[14px] font-semibold text-[#0b1020]/40`}>{String(i + 1).padStart(2, '0')}</span>
                <div><h3 className={`${D} text-[24px] font-bold uppercase leading-tight`}>{t}</h3><p className="mt-1.5 text-[16px] leading-snug text-[#0b1020]/70">{d}</p><p className="mt-2 text-[14px] font-semibold text-[#0b1020]/55">{time} · цена — у мастера</p></div>
              </div>
              <a href="#book" data-svc={t} className="inline-flex h-12 shrink-0 items-center gap-2 self-start rounded-full bg-[#0b1020] px-5 text-[15px] font-bold text-white hover:bg-[#ffb547] hover:text-[#0b1020] sm:self-center">Записаться <ArrowRight size={16} /></a>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ---------- how ---------- */
const HOW = [
  ['Звоните', 'Днём или ночью. Скажем, когда лучше подъехать.'],
  ['Приезжаете', `${b.addr}, ${b.district}.`],
  ['Осмотр и цена', 'Мастер смотрит колесо и называет стоимость до начала работ.'],
  ['Готово', 'Проверяем давление — и можно ехать дальше.'],
]
function How() {
  return (
    <section id="how" className="scroll-mt-16 bg-[#121a33] px-5 py-20 text-white md:px-10 md:py-28">
      <div className="mx-auto max-w-[1300px]">
        <h2 className={`${D} text-[clamp(40px,6vw,92px)] font-extrabold uppercase leading-[.9]`}>Как мы работаем</h2>
        <ol className="relative mt-14 grid gap-10 md:grid-cols-4 md:gap-6">
          <div aria-hidden="true" className="absolute left-[19px] top-0 h-full w-[2px] bg-white/10 md:left-0 md:top-[19px] md:h-[2px] md:w-full" />
          {HOW.map(([t, d], i) => (
            <Reveal as="li" key={t} delay={i * 0.08} className="relative pl-16 md:pl-0 md:pt-16">
              <span className={`${D} absolute left-0 top-0 grid h-10 w-10 place-items-center rounded-full bg-[#ffb547] text-[17px] font-bold text-[#0b1020]`}>{i + 1}</span>
              <h3 className={`${D} text-[26px] font-bold uppercase leading-none`}>{t}</h3>
              <p className="mt-3 max-w-[260px] text-[17px] leading-snug text-white/75">{d}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}

/* ---------- rating bento ---------- */
function Ring24() {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden="true">
      {Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * Math.PI * 2 - Math.PI / 2; return <motion.line key={i} x1={100 + Math.cos(a) * 66} y1={100 + Math.sin(a) * 66} x2={100 + Math.cos(a) * 88} y2={100 + Math.sin(a) * 88} stroke="#ffb547" strokeWidth="7" strokeLinecap="round" initial={{ opacity: 0.12 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.04 }} /> })}
      <text x="100" y="112" textAnchor="middle" fill="#fff" style={{ font: '800 44px Tektur, sans-serif' }}>24/7</text>
    </svg>
  )
}
function Rating() {
  return (
    <section id="rating" className="scroll-mt-16 bg-[#0b1020] px-5 py-20 text-white md:px-10 md:py-28">
      <div className="mx-auto grid max-w-[1300px] gap-3 md:grid-cols-6">
        <Reveal className="rounded-3xl bg-[#ffb547] p-7 text-[#0b1020] md:col-span-3 md:row-span-2 md:p-10">
          <p className="text-[15px] font-semibold uppercase tracking-[.12em]">Яндекс Карты</p>
          <p className={`${D} mt-4 text-[clamp(110px,16vw,220px)] font-extrabold leading-[.85]`}>{b.rating}</p>
          <div className="mt-3 flex gap-1" aria-label="5 из 5">{[0, 1, 2, 3, 4].map(i => <Star key={i} size={28} fill="#0b1020" strokeWidth={0} />)}</div>
          <p className="mt-5 text-[20px] font-semibold">{b.rev} оценок водителей</p>
          <a href={`https://yandex.ru/maps/org/${b.oid}/reviews/`} target="_blank" rel="noopener" className="mt-7 inline-flex h-14 items-center gap-2 rounded-full bg-[#0b1020] px-6 text-[16px] font-bold text-white hover:bg-white hover:text-[#0b1020]">Читать отзывы <ArrowRight size={18} /></a>
        </Reveal>
        <Reveal delay={0.05} className="flex items-center gap-6 rounded-3xl border border-white/12 bg-[#121a33] p-6 md:col-span-3">
          <div className="h-32 w-32 shrink-0"><Ring24 /></div>
          <div><h3 className={`${D} text-[26px] font-bold uppercase leading-none`}>Круглосуточно</h3><p className="mt-2 text-[16px] text-white/70">24 часа из 24 — по данным карточки на Яндекс Картах.</p></div>
        </Reveal>
        <Reveal delay={0.1} className="rounded-3xl border border-white/12 bg-[#121a33] p-6 md:col-span-2">
          <MapPin className="text-[#ffb547]" /><h3 className={`${D} mt-4 text-[22px] font-bold uppercase leading-tight`}>{b.addr}</h3><p className="mt-1 text-[16px] text-white/70">{b.district}, {b.city}</p>
        </Reveal>
        <Reveal delay={0.15} className="rounded-3xl border border-white/12 bg-[#121a33] p-6 md:col-span-1">
          <Phone className="text-[#ffb547]" /><a href={'tel:' + tel(b.phone)} className={`${D} mt-4 block !whitespace-normal text-[18px] font-bold leading-tight`}>Звонок ночью — нормально</a>
        </Reveal>
      </div>
    </section>
  )
}

/* ---------- FAQ ---------- */
const FAQ = [
  ['Вы правда работаете ночью?', 'По данным карточки — круглосуточно. Ночью лучше набрать перед выездом: скажем, свободен ли мастер прямо сейчас.'],
  ['Нужна ли запись?', 'Можно просто позвонить и приехать. Если хотите конкретное время — оставьте заявку, перезвоним.'],
  ['Сколько займёт шиномонтаж?', 'Обычно 30–60 минут на комплект, но многое зависит от колёс. Точнее скажет мастер.'],
  ['Можно оставить шины на хранение?', 'Да, хранение шин есть. Условия и сроки уточняйте по телефону.'],
  ['Как оплатить?', 'Способы оплаты уточняйте по телефону.'],
  ['Как вас найти?', `${b.addr}, ${b.district}, ${b.city}. Карта и кнопка «Маршрут» — ниже.`],
]
function Faq() {
  const [o, setO] = useState(0)
  return (
    <section id="faq" className="bg-[#eef1f6] px-5 py-20 text-[#0b1020] md:px-10 md:py-28">
      <div className="mx-auto grid max-w-[1300px] gap-10 lg:grid-cols-[.8fr_1.2fr]">
        <h2 className={`${D} text-[clamp(40px,6vw,92px)] font-extrabold uppercase leading-[.9]`}>Частые вопросы</h2>
        <div className="space-y-2.5">
          {FAQ.map(([q, a], i) => (
            <div key={q} className="rounded-2xl bg-white">
              <h3><button type="button" aria-expanded={o === i} aria-controls={'lq' + i} onClick={() => setO(o === i ? -1 : i)} className="flex w-full items-center justify-between gap-6 px-5 py-5 text-left text-[18px] font-semibold md:px-7 md:text-[20px]">{q}<span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${o === i ? 'bg-[#ffb547]' : 'bg-[#0b1020] text-white'}`}>{o === i ? <Minus size={18} /> : <Plus size={18} />}</span></button></h3>
              <AnimatePresence initial={false}>{o === i && <motion.div id={'lq' + i} initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.28 }} className="overflow-hidden"><p className="px-5 pb-6 text-[17px] leading-relaxed text-[#0b1020]/75 md:px-7">{a}</p></motion.div>}</AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------- booking ---------- */
const BSV = ['Шиномонтаж / переобувка', 'Ремонт прокола', 'Вулканизация / ремонт пореза', 'Хранение шин', 'Аргонная сварка диска', 'Заправка кондиционера']
const WHEN = ['Прямо сейчас', 'Сегодня позже', 'Ночью', 'Завтра', 'Перезвоните']
function Opt({ on, children, ...r }) {
  return <button type="button" aria-pressed={on} className={`min-h-[52px] rounded-full border-2 px-5 text-[16px] font-semibold transition-colors ${on ? 'border-[#ffb547] bg-[#ffb547] text-[#0b1020]' : 'border-white/20 text-white hover:border-white/60'}`} {...r}>{children}</button>
}
function Book() {
  const bk = useBooking()
  const [step, setStep] = useState(0)
  const [when, setWhen] = useState('')
  const [err, setErr] = useState('')
  const head = useRef(null)
  useEffect(() => { if (step) head.current?.focus() }, [step])
  const next = e => {
    e.preventDefault()
    if (step === 0 && !bk.s.svc) return setErr('Выберите услугу')
    if (step === 1 && !when) return setErr('Выберите время')
    setErr('')
    if (step < 2) setStep(step + 1); else bk.submit()
  }
  const custom = bk.s.svc && !BSV.includes(bk.s.svc)
  return (
    <section id="book" className="scroll-mt-16 bg-[#121a33] px-5 py-20 text-white md:px-10 md:py-28">
      <div className="mx-auto grid max-w-[1300px] gap-12 lg:grid-cols-[.85fr_1.15fr]">
        <div>
          <h2 className={`${D} text-[clamp(44px,7vw,110px)] font-extrabold uppercase leading-[.9]`}>Записаться</h2>
          <p className="mt-6 max-w-[420px] text-[18px] text-white/75">Три шага — и мастер перезвонит. Срочно? Звоните, это быстрее:</p>
          <a href={'tel:' + tel(b.phone)} className={`${D} mt-3 inline-block text-[clamp(30px,3.6vw,44px)] font-bold text-[#ffb547]`}>{b.phone}</a>
          <LiveBadge className="mt-6" />
        </div>
        <div className="rounded-3xl border border-white/12 bg-[#0b1020] p-5 md:p-9">
          {bk.s.sent ? (
            <div className="py-6 text-center" role="status">
              <CheckDraw className="mx-auto text-[#ffb547]" />
              <p className={`${D} mt-5 text-[40px] font-bold uppercase leading-none`}>Заявка принята</p>
              <p className="mx-auto mt-3 max-w-[420px] text-[17px] text-white/75">{bk.s.svc} · {when}. Мастер перезвонит и подтвердит. В готовом сайте заявка сразу придёт вам в Telegram.</p>
              <button type="button" onClick={() => { bk.reset(); setStep(0); setWhen('') }} className="mt-8 min-h-[44px] text-[15px] font-semibold underline underline-offset-4">Новая заявка</button>
            </div>
          ) : (
            <form onSubmit={next} noValidate>
              <div className="grid grid-cols-3 gap-1.5 text-[13px] font-semibold" aria-hidden="true">{['Услуга', 'Когда', 'Контакт'].map((t, i) => <span key={t} className={`rounded-full py-2 text-center ${i <= step ? 'bg-[#ffb547] text-[#0b1020]' : 'bg-white/10 text-white/55'}`}>{i + 1}. {t}</span>)}</div>
              <p className="sr-only">Шаг {step + 1} из 3</p>
              <h3 ref={head} tabIndex={-1} className={`${D} mt-7 text-[30px] font-bold uppercase leading-none outline-none`}>{['Что нужно?', 'Когда удобно?', 'Куда перезвонить?'][step]}</h3>
              <AnimatePresence mode="wait">
                <motion.div key={step} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }} className="mt-6">
                  {step === 0 && <div className="flex flex-wrap gap-2">{custom && <Opt on>{bk.s.svc}</Opt>}{BSV.map(s => <Opt key={s} on={bk.s.svc === s} onClick={() => { bk.upd('svc', s); setErr('') }}>{s}</Opt>)}</div>}
                  {step === 1 && <div className="flex flex-wrap gap-2">{WHEN.map(d => <Opt key={d} on={when === d} onClick={() => { setWhen(d); setErr('') }}>{d}</Opt>)}</div>}
                  {step === 2 && <div className="space-y-4">
                    <div><label htmlFor="l-name" className="text-[14px] font-semibold text-white/70">Имя</label><input id="l-name" value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} autoComplete="name" className="mt-1.5 h-14 w-full rounded-2xl border-2 border-white/20 bg-transparent px-4 text-[17px] text-white outline-none focus:border-[#ffb547]" /></div>
                    <div><label htmlFor="l-phone" className="text-[14px] font-semibold text-white/70">Телефон</label><input id="l-phone" value={bk.s.phone} onChange={e => bk.upd('phone', e.target.value)} onFocus={phoneFocus(bk)} type="tel" inputMode="tel" autoComplete="tel" placeholder="+375 __ ___-__-__" aria-invalid={bk.s.err} aria-describedby={bk.s.err ? 'l-perr' : undefined} className={`mt-1.5 h-14 w-full rounded-2xl border-2 bg-transparent px-4 text-[17px] text-white outline-none placeholder:text-white/35 focus:border-[#ffb547] ${bk.s.err ? 'border-[#ff7a7a]' : 'border-white/20'}`} />
                      {bk.s.err && <p id="l-perr" className="mt-2 text-[15px] text-[#ff9a9a]">Проверьте номер — 12 цифр с кодом +375.</p>}</div>
                  </div>}
                </motion.div>
              </AnimatePresence>
              {err && <p className="mt-4 text-[15px] text-[#ff9a9a]" role="alert">{err}</p>}
              <div className="mt-8 flex items-center justify-between">
                {step > 0 ? <button type="button" onClick={() => setStep(step - 1)} className="min-h-[44px] text-[15px] font-semibold text-white/70 hover:text-white">← Назад</button> : <span />}
                <button type="submit" disabled={bk.s.loading} className={`${D} inline-flex h-14 items-center gap-2 rounded-full bg-[#ffb547] px-7 text-[18px] font-bold text-[#0b1020] hover:bg-white disabled:opacity-60`}>{step < 2 ? 'Дальше' : bk.s.loading ? 'Отправляем…' : 'Отправить'} <ArrowRight size={18} /></button>
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
    <section id="contact" className="scroll-mt-16 bg-[#0b1020] text-white">
      <div className="mx-auto grid max-w-[1400px] lg:grid-cols-2">
        <div className="px-5 py-20 md:px-10">
          <h2 className={`${D} text-[clamp(44px,7vw,110px)] font-extrabold uppercase leading-[.9]`}>Контакты</h2>
          <dl className="mt-10 space-y-6">
            <div><dt className="text-[14px] font-semibold uppercase tracking-[.12em] text-white/55">Адрес</dt><dd className={`${D} mt-1 text-[26px] font-bold`}>{b.addr}<br /><span className="text-white/70">{b.district}, {b.city}</span></dd></div>
            <div><dt className="text-[14px] font-semibold uppercase tracking-[.12em] text-white/55">Телефон</dt><dd><a href={'tel:' + tel(b.phone)} className={`${D} mt-1 inline-block text-[28px] font-bold text-[#ffb547]`}>{b.phone}</a></dd></div>
            <div><dt className="text-[14px] font-semibold uppercase tracking-[.12em] text-white/55">Часы работы</dt><dd className="mt-1 text-[18px] font-semibold">Круглосуточно, без выходных <span className="block text-[15px] font-normal text-white/60">По данным Яндекс Карт. Ночью лучше позвонить перед выездом.</span></dd></div>
          </dl>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={'tel:' + tel(b.phone)} className={`${D} inline-flex h-14 items-center gap-2 rounded-full bg-[#ffb547] px-7 text-[18px] font-bold text-[#0b1020]`}><Phone size={18} />Позвонить</a>
            <a href={`https://yandex.ru/maps/org/${b.oid}/`} target="_blank" rel="noopener" className="inline-flex h-14 items-center gap-2 rounded-full border-2 border-white/30 px-6 text-[16px] font-bold hover:border-white">Маршрут <ArrowRight size={18} /></a>
          </div>
        </div>
        <div className="h-[400px] lg:h-auto lg:min-h-[560px]"><MapFrame oid={b.oid} dark /></div>
      </div>
    </section>
  )
}

function App() {
  useSmooth()
  const lite = useLite()
  return (
    <MotionConfig reducedMotion="user">
      <div className="overflow-x-clip font-['Montserrat',sans-serif]" style={{ background: INK, color: '#fff', '--sel': AMB, '--selc': INK }}>
        <Ribbon name={b.name} bg={AMB} fg={INK} />
        <Header />
        <main>
          <Film lite={lite} />
          <Triage />
          <Services />
          <How />
          <Rating />
          <Faq />
          <Book />
          <Contact />
        </main>
        <footer className="flex flex-wrap justify-between gap-3 border-t border-white/10 bg-[#0b1020] px-5 py-6 text-[14px] text-white/60 md:px-10"><span>© 2026 {b.name} · Концепт сайта — Артём</span><span>{b.addr}, {b.city} · круглосуточно</span></footer>
        <CallBar phone={b.phone} barCls="bg-[#0b1020]/95 backdrop-blur border-t border-white/10" callCls="rounded-full bg-[#ffb547] text-[#0b1020]" bookCls="rounded-full border-2 border-white/30 text-white" />
        <div className="h-[72px] bg-[#0b1020] sm:hidden" />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
