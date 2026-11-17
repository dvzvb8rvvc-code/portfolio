import React, { useRef, useState, useEffect, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, useSpring, useInView, AnimatePresence, MotionConfig, useMotionValueEvent } from 'framer-motion'
import { ArrowRight, ChevronLeft, ChevronRight, Phone, MapPin, Star, Plus, Snowflake, Sun, Gauge, Wrench, Droplet, CircleDot, Disc3, Cpu, Scale } from 'lucide-react'
import '../lib/base.css'
import { useSmooth, Ribbon, LineReveal, Reveal, useBooking, phoneFocus, CheckDraw, MapFrame, CallBar, tel, useLite } from '../lib/kit'

const TyreScene = lazy(() => import('./avtoforum3d'))

const b = {
  name: 'Автофорум', addr: '4-й пер. Кольцова, 6', district: 'Зелёный Луг', city: 'Минск',
  phone: '+375 29 188-44-10', rating: '4,5', rev: 108, oid: '28220366518',
}
const INK = '#1d1d1f', GRAY = '#6e6e73', BG = '#fbfbfd', BLUE = '#0066cc'
const F = "font-['Inter_Tight',sans-serif]"
const NAV = [['services', 'Услуги'], ['season', 'Когда переобуваться'], ['how', 'Как мы работаем'], ['rating', 'Рейтинг'], ['contact', 'Контакты']]

function useActive(ids) {
  const [a, setA] = useState('')
  useEffect(() => {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) setA(e.target.id) }), { rootMargin: '-45% 0px -50% 0px' })
    ids.forEach(id => { const el = document.getElementById(id); if (el) io.observe(el) })
    return () => io.disconnect()
  }, [])
  return a
}

/* ---------------- header ---------------- */
function Header() {
  const a = useActive(NAV.map(n => n[0]))
  return (
    <header className="sticky top-0 z-40 border-b border-black/[.06] bg-[#fbfbfd]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between gap-4 px-5">
        <a href="#top" className="flex items-center gap-2 text-[17px] font-semibold tracking-[-0.02em]">
          <span className="relative grid h-6 w-6 place-items-center rounded-full border-[3px] border-[#1d1d1f]"><span className="h-1.5 w-1.5 rounded-full bg-[#1d1d1f]" /></span>Автофорум
        </a>
        <nav className="hidden items-center gap-6 text-[13px] lg:flex" aria-label="Разделы">
          {NAV.map(([id, t]) => <a key={id} href={'#' + id} aria-current={a === id ? 'true' : undefined} className={`transition-colors ${a === id ? 'text-[#1d1d1f]' : 'text-[#1d1d1f]/60 hover:text-[#1d1d1f]'}`}>{t}</a>)}
        </nav>
        <div className="flex items-center gap-4">
          <a href={'tel:' + tel(b.phone)} className="hidden text-[13px] font-medium md:inline">{b.phone}</a>
          <a href="#book" className="inline-flex h-8 items-center rounded-full bg-[#0071e3] px-4 text-[13px] font-medium text-white hover:bg-[#0077ed]">Записаться</a>
        </div>
      </div>
    </header>
  )
}

/* ---------------- hero + pinned tyre film ---------------- */
const CAP = [
  { k: 'summer', e: 'Лето', h: 'Продольные канавки уводят воду.', d: 'Летняя резина мягко держит сухой и мокрый асфальт.', r: [0.1, 0.32] },
  { k: 'mid', e: 'Ниже +7 °C', h: 'Летний протектор начинает дубеть.', d: 'Смесь твердеет, сцепление падает — пора думать о смене.', r: [0.32, 0.56] },
  { k: 'winter', e: 'Зима', h: 'Ламели и шипы держат на снегу и льду.', d: 'Мелкие блоки цепляются за наст, шипы — за лёд.', r: [0.56, 0.8] },
  { k: 'done', e: 'Шиномонтаж', h: 'Переобуем за один визит.', d: 'Снимем, смонтируем, отбалансируем. Запишитесь на удобное время.', r: [0.8, 1.1] },
]
function Caption({ p, c }) {
  const k = [c.r[0], c.r[0] + 0.04, c.r[1] - 0.04, c.r[1]]
  const o = useTransform(p, k, [0, 1, 1, c.k === 'done' ? 1 : 0])
  const y = useTransform(p, k, [24, 0, 0, -16])
  const col = c.k === 'summer' ? '#c25b00' : c.k === 'winter' ? '#0a66c2' : GRAY
  return (
    <motion.div style={{ opacity: o, y }} className="pointer-events-none absolute inset-x-5 bottom-[92px] text-center md:bottom-[7vh]">
      <p className="text-[14px] font-semibold md:text-[17px]" style={{ color: col }}>{c.e}</p>
      <h2 className="mx-auto mt-1 max-w-[780px] text-[clamp(26px,4vw,52px)] font-semibold leading-[1.06] tracking-[-0.03em]">{c.h}</h2>
      <p className="mx-auto mt-2 max-w-[520px] text-[16px] text-[#6e6e73] md:text-[19px]">{c.d}</p>
    </motion.div>
  )
}
function LiteTyre({ p }) {
  const rot = useTransform(p, [0, 1], [0, -540])
  const k = useTransform(p, [0.3, 0.62], [0, 1])
  return (
    <div className="absolute inset-0 grid place-items-center pb-[24vh] md:pb-[12vh]">
      <motion.svg style={{ rotate: rot }} viewBox="0 0 200 200" className="h-[44vmin] w-[44vmin]">
        <circle cx="100" cy="100" r="96" fill="#1c1c1f" />
        <motion.g style={{ opacity: useTransform(k, v => 1 - v) }}>{Array.from({ length: 36 }, (_, i) => <rect key={i} x="98" y="4" width="4" height="12" fill="#3a3a3e" transform={`rotate(${i * 10} 100 100)`} />)}</motion.g>
        <motion.g style={{ opacity: k }}>{Array.from({ length: 24 }, (_, i) => <rect key={i} x="94" y="4" width="10" height="14" rx="2" fill="#3a3a3e" transform={`rotate(${i * 15} 100 100)`} />)}</motion.g>
        <circle cx="100" cy="100" r="62" fill="#d4d6da" /><circle cx="100" cy="100" r="54" fill="#eceef0" />
        {Array.from({ length: 5 }, (_, i) => <rect key={i} x="95" y="50" width="10" height="40" rx="4" fill="#b4b7bc" transform={`rotate(${i * 72} 100 100)`} />)}
        <circle cx="100" cy="100" r="12" fill="#9a9ea4" />
      </motion.svg>
    </div>
  )
}
function Film({ lite }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const p = useSpring(scrollYProgress, { stiffness: 80, damping: 24, mass: 0.4 })
  const near = useInView(ref, { margin: '200px 0px' })
  const [mounted, setMounted] = useState(false)
  useEffect(() => { if (near) setMounted(true) }, [near])
  const heroO = useTransform(p, [0, 0.08], [1, 0])
  const heroY = useTransform(p, [0, 0.08], [0, -30])
  const heroPE = useTransform(p, v => (v < 0.05 ? 'auto' : 'none'))
  const stageY = useTransform(p, [0, 0.09], ['46vh', '0vh'])
  const seasonW = useTransform(p, [0.3, 0.62], ['0%', '100%'])
  const dotO = useTransform(p, [0.06, 0.1], [0, 1])
  return (
    <section ref={ref} id="top" className="relative h-[300vh]" aria-label="Автофорум — шиномонтаж на Зелёном Луге">
      <div className="sticky top-14 h-[calc(100svh-56px)] overflow-hidden">
        <motion.div style={{ y: stageY }} className="absolute inset-0">
          {lite ? <LiteTyre p={p} /> : mounted && <Suspense fallback={<LiteTyre p={p} />}><TyreScene progress={p} active={near} /></Suspense>}
        </motion.div>

        <motion.div style={{ opacity: heroO, y: heroY, pointerEvents: heroPE }} className="relative z-[2] px-5 pt-[5vh] text-center md:pt-[7vh]">
          <p className="text-[15px] font-semibold text-[#6e6e73] md:text-[19px]">Автосервис и шиномонтаж · {b.district}</p>
          <h1 className="mx-auto mt-2 max-w-[980px] text-[clamp(38px,6.6vw,88px)] font-semibold leading-[1.02] tracking-[-0.045em]">
            <LineReveal delay={0.05}>Шиномонтаж и ремонт</LineReveal>
            <LineReveal delay={0.15}>на Зелёном Луге.</LineReveal>
          </h1>
          <p className="mx-auto mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[16px] text-[#6e6e73] md:text-[19px]">
            <span className="inline-flex items-center gap-1.5"><MapPin size={17} aria-hidden="true" />{b.addr}</span>
            <span aria-hidden="true">·</span>
            <a href="#rating" className="inline-flex items-center gap-1.5 text-[#1d1d1f]"><Star size={16} className="fill-[#1d1d1f]" aria-hidden="true" />{b.rating} · {b.rev} оценок на Яндексе</a>
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            <a href="#book" className="inline-flex h-12 items-center rounded-full bg-[#0071e3] px-7 text-[17px] font-medium text-white hover:bg-[#0077ed]">Записаться</a>
            <a href={'tel:' + tel(b.phone)} className="inline-flex items-center gap-1 text-[17px] font-medium text-[#0066cc] hover:underline">{b.phone} <ArrowRight size={16} /></a>
          </div>
        </motion.div>

        {CAP.map(c => <Caption key={c.k} p={p} c={c} />)}

        {/* season meter */}
        <motion.div style={{ opacity: dotO }} className="pointer-events-none absolute left-1/2 top-5 z-[3] w-[220px] -translate-x-1/2 md:top-8 md:w-[280px]">
          <div className="flex justify-between text-[12px] font-medium text-[#6e6e73]"><span className="inline-flex items-center gap-1"><Sun size={13} />Лето</span><span className="inline-flex items-center gap-1">Зима<Snowflake size={13} /></span></div>
          <div className="mt-2 h-[3px] rounded-full bg-black/[.08]"><motion.div style={{ width: seasonW }} className="h-full rounded-full bg-gradient-to-r from-[#ff8a1f] to-[#3b9cff]" /></div>
        </motion.div>
        <a href="#services" className="absolute bottom-5 right-5 z-[4] hidden text-[14px] font-medium text-[#0066cc] hover:underline md:block">Пропустить →</a>
        <a href="#services" className="absolute right-4 top-4 z-[4] text-[14px] font-medium text-[#0066cc] md:hidden">Пропустить →</a>
      </div>
    </section>
  )
}

/* ---------------- highlights: services carousel ---------------- */
const SV = [
  { t: 'Шиномонтаж', d: 'Снятие, монтаж и балансировка комплекта.', time: 'обычно 40–60 мин', I: Disc3, tone: '#f5f5f7' },
  { t: 'Сезонная переобувка', d: 'Смена колёс в сборе — лето на зиму и обратно.', time: 'обычно 20–30 мин', I: Snowflake, tone: '#eef5ff' },
  { t: 'Ремонт шин', d: 'Проколы, порезы, подкачка и проверка давления.', time: 'обычно 20–40 мин', I: CircleDot, tone: '#f5f5f7' },
  { t: 'Балансировка', d: 'Убираем вибрацию руля на скорости.', time: 'обычно 15–30 мин', I: Scale, tone: '#fff4ea' },
  { t: 'Диагностика ходовой', d: 'Найдём стуки и люфты, покажем, что важно сейчас.', time: 'обычно 30–60 мин', I: Gauge, tone: '#f5f5f7' },
  { t: 'Замена масла и фильтров', d: 'Плановое ТО: масло, фильтры, проверка жидкостей.', time: 'обычно 30–45 мин', I: Droplet, tone: '#f5f5f7' },
  { t: 'Ремонт подвески и тормозов', d: 'Колодки, диски, амортизаторы, рычаги.', time: 'по итогам осмотра', I: Wrench, tone: '#f5f5f7' },
  { t: 'Компьютерная диагностика', d: 'Считаем ошибки, объясним простыми словами.', time: 'обычно около 30 мин', I: Cpu, tone: '#f5f5f7' },
]
function SvCard({ s }) {
  return (
    <article className="flex w-[78vw] max-w-[340px] shrink-0 snap-start flex-col rounded-[28px] p-7 md:w-[340px]" style={{ background: s.tone }}>
      <s.I size={34} strokeWidth={1.5} aria-hidden="true" />
      <h3 className="mt-10 text-[24px] font-semibold leading-tight tracking-[-0.02em]">{s.t}</h3>
      <p className="mt-2 text-[16px] leading-snug text-[#6e6e73]">{s.d}</p>
      <dl className="mt-6 space-y-1 text-[14px]">
        <div className="flex justify-between gap-3 border-t border-black/[.08] pt-3"><dt className="text-[#6e6e73]">Время</dt><dd className="font-medium">{s.time}</dd></div>
        <div className="flex justify-between gap-3 border-t border-black/[.08] pt-3"><dt className="text-[#6e6e73]">Цена</dt><dd className="font-medium">уточнит мастер</dd></div>
      </dl>
      <a href="#book" data-svc={s.t} className="mt-auto inline-flex items-center gap-1 pt-7 text-[16px] font-medium text-[#0066cc] hover:underline">Записаться <ArrowRight size={15} /></a>
    </article>
  )
}
function Services() {
  const sc = useRef(null)
  const go = d => sc.current?.scrollBy({ left: d * 360, behavior: 'smooth' })
  return (
    <section id="services" className="scroll-mt-14 py-24 md:py-32">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-end justify-between gap-6 px-5">
        <div>
          <h2 className="text-[clamp(34px,5vw,64px)] font-semibold leading-[1.04] tracking-[-0.04em]">Услуги.<br /><span className="text-[#6e6e73]">Всё для колёс и не только.</span></h2>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={() => go(-1)} aria-label="Назад" className="grid h-11 w-11 place-items-center rounded-full bg-[#e8e8ed] hover:bg-[#dcdce1]"><ChevronLeft size={20} /></button>
          <button type="button" onClick={() => go(1)} aria-label="Вперёд" className="grid h-11 w-11 place-items-center rounded-full bg-[#e8e8ed] hover:bg-[#dcdce1]"><ChevronRight size={20} /></button>
        </div>
      </div>
      <div ref={sc} className="mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-5 pb-4 [scrollbar-width:none] md:px-[max(20px,calc((100vw-1200px)/2+20px))] [&::-webkit-scrollbar]:hidden" tabIndex={0} aria-label="Список услуг, прокрутите вбок">
        {SV.map(s => <SvCard key={s.t} s={s} />)}
      </div>
      <p className="mx-auto mt-6 max-w-[1200px] px-5 text-[14px] text-[#6e6e73]">Стоимость зависит от размера колёс и объёма работ — мастер назовёт её до начала.</p>
    </section>
  )
}

/* ---------------- season helper (value interaction) ---------------- */
const MONTHS = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']
const NORM = [-4, -4, 1, 8, 14, 17, 19, 18, 13, 7, 1, -3]
const RADII = ['R13', 'R14', 'R15', 'R16', 'R17', 'R18', 'R19', 'R20', 'R21']
function advice(t) {
  if (t < 4) return { w: true, h: 'Пора на зимние.', d: 'Средняя температура ниже +7 °C — летняя смесь твердеет и хуже держит дорогу. А при нуле и ниже возможны гололёд и снег.' }
  if (t < 7) return { w: true, h: 'Скорее на зимние.', d: 'Ниже +7 °C летние шины теряют сцепление. Особенно если ночью уже бывают заморозки.' }
  if (t < 10) return { w: false, h: 'Переходный период.', d: 'Около +7 °C — граница. Смотрите на ночные температуры: если ночью стабильно выше нуля, можно планировать летние.' }
  return { w: false, h: 'Время летних шин.', d: 'Выше +7 °C зимняя резина становится слишком мягкой: быстрее изнашивается и дольше тормозит.' }
}
function TreadViz({ t }) {
  const k = Math.min(1, Math.max(0, (10 - t) / 7))
  return (
    <svg viewBox="0 0 240 150" className="h-auto w-full" aria-hidden="true">
      <rect x="10" y="10" width="220" height="130" rx="22" fill="#1d1d1f" />
      <g opacity={1 - k}>{[52, 96, 144, 188].map(x => <rect key={x} x={x - 4} y="10" width="8" height="130" fill="#3d3d42" />)}{Array.from({ length: 8 }, (_, i) => <line key={i} x1="10" y1={20 + i * 16} x2="40" y2={28 + i * 16} stroke="#3d3d42" strokeWidth="4" />)}{Array.from({ length: 8 }, (_, i) => <line key={i} x1="230" y1={20 + i * 16} x2="200" y2={28 + i * 16} stroke="#3d3d42" strokeWidth="4" />)}</g>
      <g opacity={k}>
        {Array.from({ length: 4 }, (_, c) => Array.from({ length: 5 }, (_, r) => {
          const x = 24 + c * 52, y = 18 + r * 25 + (c % 2) * 10
          return <g key={c + '-' + r} transform={`translate(${x} ${y}) skewY(${c < 2 ? 14 : -14})`}><rect width="40" height="18" rx="3" fill="none" stroke="#3d3d42" strokeWidth="3" /><path d="M10 2v14M20 2l0 14M30 2v14" stroke="#3d3d42" strokeWidth="1.5" />{(c === 0 || c === 3) && r % 2 === 0 && <circle cx="20" cy="9" r="2.5" fill="#c8ccd2" />}</g>
        }))}
      </g>
    </svg>
  )
}
function Season() {
  const [m, setM] = useState(() => new Date().getMonth())
  const [t, setT] = useState(() => NORM[new Date().getMonth()])
  const [r, setR] = useState('R16')
  const a = advice(t)
  const col = a.w ? '#0a66c2' : '#c25b00'
  const svc = `Шиномонтаж ${r} — ${a.w ? 'на зимние' : 'на летние'}`
  return (
    <section id="season" className="scroll-mt-14 bg-[#f5f5f7] px-5 py-24 md:py-32">
      <div className="mx-auto max-w-[1200px]">
        <Reveal><h2 className="text-center text-[clamp(34px,5vw,64px)] font-semibold leading-[1.04] tracking-[-0.04em]">Когда переобуваться?</h2></Reveal>
        <Reveal delay={0.05}><p className="mx-auto mt-4 max-w-[620px] text-center text-[17px] text-[#6e6e73] md:text-[21px]">Выберите месяц или подвиньте температуру — подскажем по общему правилу +7 °C.</p></Reveal>
        <div className="mt-14 grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
          <div className="rounded-[28px] bg-white p-6 md:p-10">
            <p id="m-label" className="text-[14px] font-medium text-[#6e6e73]">Месяц</p>
            <div className="mt-3 grid grid-cols-6 gap-2 md:grid-cols-12" role="radiogroup" aria-labelledby="m-label">
              {MONTHS.map((x, i) => <button key={x} type="button" role="radio" aria-checked={m === i} onClick={() => { setM(i); setT(NORM[i]) }} className={`h-11 rounded-full text-[15px] font-medium transition-colors ${m === i ? 'bg-[#1d1d1f] text-white' : 'bg-[#f5f5f7] hover:bg-[#e8e8ed]'}`}>{x}</button>)}
            </div>
            <div className="mt-9 flex items-end justify-between gap-4">
              <label htmlFor="temp" className="text-[14px] font-medium text-[#6e6e73]">Средняя температура за сутки</label>
              <output htmlFor="temp" className="text-[44px] font-semibold leading-none tracking-[-0.04em] tabular-nums md:text-[56px]" style={{ color: col }}>{t > 0 ? '+' : t < 0 ? '−' : ''}{Math.abs(t)} °C</output>
            </div>
            <input id="temp" type="range" min={-20} max={30} step={1} value={t} onChange={e => setT(+e.target.value)}
              className="mt-5 h-2 w-full cursor-pointer appearance-none rounded-full outline-none focus-visible:ring-4 focus-visible:ring-[#0071e3]/30 [&::-webkit-slider-thumb]:h-7 [&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_2px_8px_rgba(0,0,0,.25)] [&::-moz-range-thumb]:h-7 [&::-moz-range-thumb]:w-7 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-white"
              style={{ background: 'linear-gradient(90deg,#3b9cff 0%,#9cc9ff 46%,#ffd2a6 54%,#ff8a1f 100%)' }} />
            <div className="mt-2 flex justify-between text-[13px] text-[#6e6e73]"><span>−20°</span><span className="font-medium text-[#1d1d1f]">+7° — граница</span><span>+30°</span></div>
            <p className="mt-6 text-[13px] text-[#6e6e73]">При выборе месяца подставляется примерная средняя температура для Минска. Ориентируйтесь и на прогноз погоды.</p>
          </div>
          <div className="flex flex-col rounded-[28px] bg-white p-6 md:p-10">
            <div className="mx-auto w-full max-w-[260px]"><TreadViz t={t} /></div>
            <AnimatePresence mode="wait">
              <motion.div key={a.h} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3 }} aria-live="polite">
                <p className="mt-6 text-[30px] font-semibold leading-tight tracking-[-0.03em]" style={{ color: col }}>{a.h}</p>
                <p className="mt-2 text-[16px] leading-relaxed text-[#6e6e73]">{a.d}</p>
              </motion.div>
            </AnimatePresence>
            <p id="r-label" className="mt-7 text-[14px] font-medium text-[#6e6e73]">Диаметр колёс</p>
            <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-labelledby="r-label">
              {RADII.map(x => <button key={x} type="button" role="radio" aria-checked={r === x} onClick={() => setR(x)} className={`h-11 min-w-[56px] rounded-full px-3 text-[15px] font-medium transition-colors ${r === x ? 'bg-[#1d1d1f] text-white' : 'bg-[#f5f5f7] hover:bg-[#e8e8ed]'}`}>{x}</button>)}
            </div>
            <a href="#book" data-svc={svc} className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-[#0071e3] px-6 text-[17px] font-medium text-white hover:bg-[#0077ed]">Записаться на шиномонтаж · {r}</a>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- how ---------------- */
const STEPS = [
  ['Записываетесь', 'Онлайн или по телефону — выбираете услугу и удобное время.'],
  ['Приезжаете', `${b.addr}, ${b.district}. Без долгого ожидания в очереди.`],
  ['Мастер смотрит', 'Осматривает авто и называет стоимость до начала работ.'],
  ['Забираете', 'Рассказываем, что сделали и на что обратить внимание.'],
]
function How() {
  return (
    <section id="how" className="scroll-mt-14 px-5 py-24 md:py-32">
      <div className="mx-auto max-w-[1200px]">
        <Reveal><h2 className="text-[clamp(34px,5vw,64px)] font-semibold leading-[1.04] tracking-[-0.04em]">Как мы работаем.<br /><span className="text-[#6e6e73]">Четыре шага.</span></h2></Reveal>
        <ol className="mt-14 grid gap-5 md:grid-cols-4">
          {STEPS.map(([h, d], i) => (
            <Reveal as="li" key={h} delay={i * 0.06} className="rounded-[28px] bg-[#f5f5f7] p-7">
              <span className="text-[48px] font-semibold leading-none tracking-[-0.04em] text-[#1d1d1f]/20">{i + 1}</span>
              <h3 className="mt-8 text-[22px] font-semibold tracking-[-0.02em]">{h}</h3>
              <p className="mt-2 text-[16px] leading-snug text-[#6e6e73]">{d}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}

/* ---------------- rating ---------------- */
function Rating() {
  return (
    <section id="rating" className="scroll-mt-14 bg-[#1d1d1f] px-5 py-24 text-[#f5f5f7] md:py-32">
      <div className="mx-auto max-w-[1200px] text-center">
        <p className="text-[17px] font-semibold text-[#86868b] md:text-[21px]">Рейтинг на Яндекс Картах</p>
        <Reveal><p className="mt-4 text-[clamp(120px,22vw,280px)] font-semibold leading-[.85] tracking-[-0.06em]">{b.rating}</p></Reveal>
        <div className="mt-6 flex justify-center gap-1.5" aria-label={`Рейтинг ${b.rating} из 5`}>
          {[0, 1, 2, 3, 4].map(i => <Star key={i} size={26} className={i < 4 ? 'fill-[#f5f5f7] text-[#f5f5f7]' : 'fill-[#f5f5f7]/40 text-[#f5f5f7]/40'} aria-hidden="true" />)}
        </div>
        <p className="mt-6 text-[19px] text-[#a1a1a6] md:text-[24px]">{b.rev} оценок от клиентов</p>
        <a href={`https://yandex.ru/maps/org/${b.oid}/reviews/`} target="_blank" rel="noopener" className="mt-6 inline-flex items-center gap-1 text-[17px] text-[#2997ff] hover:underline">Читать отзывы на Яндекс Картах <ArrowRight size={16} /></a>
      </div>
    </section>
  )
}

/* ---------------- FAQ ---------------- */
const FAQ = [
  ['Сколько длится переобувка?', 'Обычно 30–60 минут за комплект — зависит от размера колёс и того, в сборе они или нужно перебортировать. Точнее скажем при записи.'],
  ['Нужно ли записываться заранее?', 'Лучше да: в начале сезона желающих много. Можно и позвонить в день визита — подскажем ближайшее свободное время.'],
  ['Можно приехать со своими шинами?', 'Да, работаем с вашими шинами и дисками. Если колёса уже в сборе — переобувка займёт меньше времени.'],
  ['Как оплатить?', 'Доступные способы оплаты уточните по телефону при записи.'],
  ['Что если мастер найдёт другую проблему?', 'Он покажет её и объяснит, насколько это срочно. Дополнительные работы — только после вашего согласия.'],
  ['Как вас найти?', `${b.addr}, ${b.district}, ${b.city}. Карта — ниже. Если заблудились, позвоните: ${b.phone}.`],
]
function FaqItem({ q, a, open, onClick, i }) {
  return (
    <div className="border-b border-black/10">
      <h3>
        <button type="button" onClick={onClick} aria-expanded={open} aria-controls={'fa' + i} className="flex w-full items-center justify-between gap-6 py-6 text-left text-[19px] font-semibold tracking-[-0.01em] md:text-[22px]">
          {q}<Plus size={22} className={`shrink-0 transition-transform duration-300 ${open ? 'rotate-45' : ''}`} aria-hidden="true" />
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open && <motion.div id={'fa' + i} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: [0.2, 0, 0, 1] }} className="overflow-hidden"><p className="max-w-[720px] pb-6 text-[17px] leading-relaxed text-[#6e6e73]">{a}</p></motion.div>}
      </AnimatePresence>
    </div>
  )
}
function Faq() {
  const [o, setO] = useState(0)
  return (
    <section id="faq" className="scroll-mt-14 px-5 py-24 md:py-32">
      <div className="mx-auto grid max-w-[1200px] gap-10 md:grid-cols-[.8fr_1.2fr]">
        <h2 className="text-[clamp(34px,5vw,64px)] font-semibold leading-[1.04] tracking-[-0.04em]">Вопросы<br /><span className="text-[#6e6e73]">и ответы.</span></h2>
        <div className="border-t border-black/10">{FAQ.map(([q, a], i) => <FaqItem key={q} q={q} a={a} i={i} open={o === i} onClick={() => setO(o === i ? -1 : i)} />)}</div>
      </div>
    </section>
  )
}

/* ---------------- booking ---------------- */
const BSV = ['Шиномонтаж', 'Сезонная переобувка', 'Ремонт шин', 'Диагностика ходовой', 'Замена масла и фильтров', 'Другое — расскажу по телефону']
const DAYS = ['Сегодня', 'Завтра', 'На этой неделе', 'Перезвоните, подберём']
const TIMES = ['Утро', 'День', 'Вечер']
function Chip({ on, children, ...rest }) {
  return <button type="button" aria-pressed={on} className={`min-h-[48px] rounded-full px-5 text-[16px] font-medium transition-colors ${on ? 'bg-[#1d1d1f] text-white' : 'bg-[#f5f5f7] hover:bg-[#e8e8ed]'}`} {...rest}>{children}</button>
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
    if (step === 1 && !day) return setErr('Выберите день')
    setErr('')
    if (step < 2) setStep(step + 1); else bk.submit()
  }
  const custom = bk.s.svc && !BSV.includes(bk.s.svc)
  const titles = ['Что нужно сделать?', 'Когда удобно?', 'Как с вами связаться?']
  return (
    <section id="book" className="scroll-mt-14 bg-[#f5f5f7] px-5 py-24 md:py-32">
      <div className="mx-auto max-w-[760px]">
        <h2 className="text-center text-[clamp(34px,5vw,64px)] font-semibold leading-[1.04] tracking-[-0.04em]">Запись на сервис.</h2>
        <p className="mt-4 text-center text-[17px] text-[#6e6e73] md:text-[21px]">Три коротких шага. Или просто позвоните: <a href={'tel:' + tel(b.phone)} className="text-[#0066cc] hover:underline">{b.phone}</a></p>
        <div className="mt-12 rounded-[28px] bg-white p-6 md:p-10">
          {bk.s.sent ? (
            <div className="py-8 text-center" role="status">
              <CheckDraw className="mx-auto text-[#0071e3]" />
              <p className="mt-6 text-[30px] font-semibold tracking-[-0.03em]">Заявка отправлена.</p>
              <p className="mx-auto mt-3 max-w-[420px] text-[17px] text-[#6e6e73]">{bk.s.svc} · {day}{time ? ', ' + time.toLowerCase() : ''}. Мастер перезвонит и подтвердит время. В готовом сайте заявка сразу придёт вам в Telegram.</p>
              <button type="button" onClick={() => { bk.reset(); setStep(0); setDay(''); setTime('') }} className="mt-8 text-[16px] text-[#0066cc] hover:underline">Новая заявка</button>
            </div>
          ) : (
            <form onSubmit={next} noValidate>
              <div className="flex gap-2" aria-hidden="true">{[0, 1, 2].map(i => <span key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-black/[.08]"><motion.span className="block h-full bg-[#0071e3]" animate={{ width: i <= step ? '100%' : '0%' }} transition={{ duration: 0.4 }} /></span>)}</div>
              <p className="mt-6 text-[14px] font-medium text-[#6e6e73]">Шаг {step + 1} из 3</p>
              <h3 ref={head} tabIndex={-1} className="mt-1 text-[26px] font-semibold tracking-[-0.02em] outline-none">{titles[step]}</h3>
              <AnimatePresence mode="wait">
                <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.25 }} className="mt-6">
                  {step === 0 && <div className="flex flex-wrap gap-2.5">{custom && <Chip on>{bk.s.svc}</Chip>}{BSV.map(s => <Chip key={s} on={bk.s.svc === s} onClick={() => { bk.upd('svc', s); setErr('') }}>{s}</Chip>)}</div>}
                  {step === 1 && (<>
                    <div className="flex flex-wrap gap-2.5">{DAYS.map(d => <Chip key={d} on={day === d} onClick={() => { setDay(d); setErr('') }}>{d}</Chip>)}</div>
                    <p className="mb-3 mt-7 text-[14px] font-medium text-[#6e6e73]">Время (необязательно)</p>
                    <div className="flex flex-wrap gap-2.5">{TIMES.map(x => <Chip key={x} on={time === x} onClick={() => setTime(time === x ? '' : x)}>{x}</Chip>)}</div>
                  </>)}
                  {step === 2 && (<div className="space-y-4">
                    <div><label htmlFor="af-name" className="text-[14px] font-medium text-[#6e6e73]">Имя</label>
                      <input id="af-name" value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} autoComplete="name" className="mt-1.5 h-14 w-full rounded-[14px] border border-black/15 bg-white px-4 text-[17px] outline-none focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/20" /></div>
                    <div><label htmlFor="af-phone" className="text-[14px] font-medium text-[#6e6e73]">Телефон</label>
                      <input id="af-phone" value={bk.s.phone} onChange={e => bk.upd('phone', e.target.value)} onFocus={phoneFocus(bk)} type="tel" inputMode="tel" autoComplete="tel" placeholder="+375 __ ___-__-__" aria-invalid={bk.s.err} aria-describedby={bk.s.err ? 'af-perr' : undefined}
                        className={`mt-1.5 h-14 w-full rounded-[14px] border bg-white px-4 text-[17px] outline-none focus:ring-4 focus:ring-[#0071e3]/20 ${bk.s.err ? 'border-[#d70015]' : 'border-black/15 focus:border-[#0071e3]'}`} />
                      {bk.s.err && <p id="af-perr" className="mt-2 text-[14px] text-[#d70015]">Проверьте номер — нужно 12 цифр с кодом +375.</p>}</div>
                  </div>)}
                </motion.div>
              </AnimatePresence>
              {err && <p className="mt-4 text-[15px] text-[#d70015]" role="alert">{err}</p>}
              <div className="mt-9 flex items-center justify-between">
                {step > 0 ? <button type="button" onClick={() => setStep(step - 1)} className="min-h-[44px] text-[16px] text-[#0066cc] hover:underline">Назад</button> : <span />}
                <button type="submit" disabled={bk.s.loading} className="inline-flex h-12 items-center gap-2 rounded-full bg-[#0071e3] px-7 text-[17px] font-medium text-white hover:bg-[#0077ed] disabled:opacity-60">{step < 2 ? 'Продолжить' : bk.s.loading ? 'Отправляем…' : 'Записаться'}</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

/* ---------------- tech specs = contacts ---------------- */
function Contact() {
  const rows = [
    ['Адрес', <>{b.addr}<br />{b.district}, {b.city}</>],
    ['Телефон', <a href={'tel:' + tel(b.phone)} className="text-[#0066cc] hover:underline">{b.phone}</a>],
    ['Часы работы', 'Уточняйте по телефону'],
    ['Рейтинг', <>{b.rating} на Яндекс Картах · {b.rev} оценок</>],
    ['Услуги', 'Шиномонтаж, сезонная переобувка, ремонт шин, балансировка, диагностика и ремонт авто'],
    ['Запись', <a href="#book" className="text-[#0066cc] hover:underline">Онлайн-заявка</a>],
  ]
  return (
    <section id="contact" className="scroll-mt-14 px-5 py-24 md:py-32">
      <div className="mx-auto max-w-[1200px]">
        <h2 className="text-[clamp(34px,5vw,64px)] font-semibold leading-[1.04] tracking-[-0.04em]">Характеристики.<br /><span className="text-[#6e6e73]">Где и как нас найти.</span></h2>
        <div className="mt-14 grid gap-10 lg:grid-cols-2">
          <dl className="border-t border-black/15">
            {rows.map(([k, v]) => <div key={k} className="grid grid-cols-[120px_1fr] gap-4 border-b border-black/10 py-5 text-[17px] md:grid-cols-[180px_1fr]"><dt className="font-semibold">{k}</dt><dd className="text-[#1d1d1f]/80">{v}</dd></div>)}
          </dl>
          <div className="h-[380px] overflow-hidden rounded-[28px] bg-[#f5f5f7] md:h-[460px]"><MapFrame oid={b.oid} /></div>
        </div>
      </div>
    </section>
  )
}

function App() {
  useSmooth()
  const lite = useLite()
  return (
    <MotionConfig reducedMotion="user">
      <div className={`overflow-x-clip ${F}`} style={{ background: BG, color: INK, '--sel': '#0071e3', '--selc': '#fff' }}>
        <Ribbon name={b.name} bg="#1d1d1f" fg="#f5f5f7" />
        <Header />
        <main>
          <Film lite={lite} />
          <Services />
          <Season />
          <How />
          <Rating />
          <Faq />
          <Book />
          <Contact />
        </main>
        <footer className="bg-[#f5f5f7] px-5 py-8 text-[13px] text-[#6e6e73]">
          <div className="mx-auto flex max-w-[1200px] flex-wrap justify-between gap-3"><span>© 2026 {b.name} · Концепт сайта — Артём</span><span>{b.addr}, {b.city}</span></div>
        </footer>
        <CallBar phone={b.phone} barCls="bg-[#fbfbfd]/90 backdrop-blur-xl border-t border-black/[.08]" callCls="rounded-full bg-[#e8e8ed] text-[#1d1d1f]" bookCls="rounded-full bg-[#0071e3] text-white" />
        <div className="h-[72px] bg-[#f5f5f7] sm:hidden" />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
