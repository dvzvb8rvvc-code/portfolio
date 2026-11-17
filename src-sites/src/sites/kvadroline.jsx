import React, { useEffect, useRef, useState, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, useSpring, useInView, AnimatePresence, MotionConfig } from 'framer-motion'
import { ArrowRight, ArrowLeft, ChevronRight, ChevronLeft, Phone, Star } from 'lucide-react'
import '../lib/base.css'
import { useSmooth, Ribbon, LineReveal, Reveal, useBooking, phoneFocus, CheckDraw, MapFrame, CallBar, tel, useLite } from '../lib/kit'

const Film3D = lazy(() => import('./kvadroline3d'))

const b = {
  name: 'КвадроЛайн', addr: 'Промышленный пер., 11, корп. 10', city: 'Минск',
  phone: '+375 33 603-27-27', rating: '5,0', rev: 324, oid: '1397769316',
}
const INK = '#1d1d1f', MUTE = '#6e6e73', ACC = '#0066ff', BG = '#fbfbfd'
const F = "font-['Inter_Tight',sans-serif]"
const CH = [[0.15, 0.2, 0.33, 0.37], [0.35, 0.4, 0.51, 0.55], [0.53, 0.58, 0.69, 0.73], [0.71, 0.76, 0.85, 0.89]]

const CAPS = [
  { r: [0.07, 0.1, 0.15, 0.18], t: 'Разбираем по системам.', d: 'Чтобы видеть причину, а не симптом.' },
  { r: [CH[0][0], CH[0][1], CH[0][2], CH[0][3]], k: 'Двигатель', t: 'Двигатель.', d: 'Диагностика, обслуживание и ремонт: масло, ремни и цепи, течи, охлаждение.' },
  { r: [CH[1][0], CH[1][1], CH[1][2], CH[1][3]], k: 'АКПП', t: 'АКПП.', d: 'Замена масла, диагностика гидроблока и электроники, адаптация коробки.' },
  { r: [CH[2][0], CH[2][1], CH[2][2], CH[2][3]], k: 'Airmatic', t: 'Подвеска Airmatic.', d: 'Пневмобаллоны, компрессор, клапаны и датчики уровня. Проверяем и восстанавливаем.' },
  { r: [CH[3][0], CH[3][1], CH[3][2], CH[3][3]], k: 'Электроника', t: 'Электроника.', d: 'Оборудование для диагностики дилерского уровня: ошибки, адаптации, поиск неисправностей.' },
  { r: [0.88, 0.92, 1.1, 1.2], t: 'И снова — единое целое.', d: 'Отдаём автомобиль таким, каким его задумали инженеры.' },
]

/* ---------- header ---------- */
function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/[.06] bg-[#fbfbfd]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-12 max-w-[1080px] items-center justify-between px-5">
        <a href="#top" className="text-[17px] font-semibold tracking-[-.02em]">КвадроЛайн</a>
        <nav className="hidden items-center gap-8 text-[12.5px] text-black/70 md:flex">
          <a href="#film" className="hover:text-black">Обзор</a><a href="#highlights" className="hover:text-black">Главное</a>
          <a href="#to" className="hover:text-black">Подбор ТО</a><a href="#specs" className="hover:text-black">Характеристики</a><a href="#contact" className="hover:text-black">Контакты</a>
        </nav>
        <a href="#book" className="rounded-full px-3.5 py-1 text-[12.5px] font-medium text-white" style={{ background: ACC }}>Записаться</a>
      </div>
    </header>
  )
}

/* ---------- pinned film (hero + explode) ---------- */
function Caption({ p, c }) {
  const [a, b2, c2, d] = c.r
  const o = useTransform(p, [a, b2, c2, d], [0, 1, 1, 0])
  const y = useTransform(p, [a, b2], [24, 0])
  return (
    <motion.div style={{ opacity: o, y }} className="absolute inset-x-0 bottom-0 px-6 text-center">
      <h3 className="text-[clamp(30px,4.6vw,56px)] font-semibold leading-[1.05] tracking-[-.035em]">{c.t}</h3>
      <p className="mx-auto mt-3 max-w-[520px] text-[clamp(16px,1.5vw,20px)] leading-snug" style={{ color: MUTE }}>{c.d}</p>
    </motion.div>
  )
}
function ChapterDots({ p }) {
  const [i, setI] = useState(-1)
  useEffect(() => p.on('change', v => setI(CH.findIndex(c => v >= c[0] && v < c[3]))), [p])
  return (
    <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[12px] font-medium">
      {CAPS.slice(1, 5).map((c, k) => (
        <span key={k} className="flex items-center gap-2 transition-colors" style={{ color: k === i ? INK : '#a1a1a6' }}>
          <span className="h-1.5 w-1.5 rounded-full transition-colors" style={{ background: k === i ? ACC : '#d2d2d7' }} />{c.k}
        </span>
      ))}
    </div>
  )
}
function LiteSedan({ p }) {
  const e = useTransform(p, [0.07, 0.2, 0.87, 0.97], [0, 1, 1, 0])
  const by = useTransform(e, v => -60 * v), bo = useTransform(e, v => 1 - 0.8 * v)
  const fills = CH.map(c => useTransform(p, [c[0], c[1], c[2], c[3]], ['#c7c9ce', ACC, ACC, '#c7c9ce']))
  return (
    <svg viewBox="0 0 480 220" className="absolute left-1/2 top-[30%] w-[min(86vw,640px)] -translate-x-1/2">
      <motion.rect x="300" y="120" width="70" height="40" rx="6" style={{ fill: fills[0] }} />
      <motion.rect x="230" y="128" width="60" height="26" rx="12" style={{ fill: fills[1] }} />
      <motion.rect x="90" y="122" width="16" height="44" rx="6" style={{ fill: fills[2] }} /><motion.rect x="370" y="122" width="16" height="44" rx="6" style={{ fill: fills[2] }} />
      <motion.path d="M120 132 C 200 120 280 120 330 128" stroke={fills[3]} strokeWidth="4" fill="none" />
      <motion.g style={{ y: by, opacity: bo }}>
        <path d="M14 150 L460 150 Q474 146 472 118 Q468 96 420 92 L320 86 Q270 40 210 36 L140 38 Q80 46 46 84 Q12 92 10 120 Z" fill="#c9cdd3" />
        <path d="M306 88 Q262 48 212 44 L144 46 Q96 52 64 86 Z" fill="#1d1d1f" />
      </motion.g>
      {[98, 378].map(x => <g key={x}><circle cx={x} cy="160" r="30" fill="#1d1d1f" /><circle cx={x} cy="160" r="18" fill="#d6d9de" /></g>)}
    </svg>
  )
}
function Film({ lite }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const p = useSpring(scrollYProgress, { stiffness: 80, damping: 24, mass: 0.6 })
  const near = useInView(ref, { margin: '200px 0px 200px 0px' })
  const heroO = useTransform(p, [0, 0.05], [1, 0])
  const heroY = useTransform(p, [0, 0.06], [0, -40])
  return (
    <section ref={ref} id="film" className="relative h-[640vh]" style={{ background: BG }}>
      <span id="top" className="absolute top-0" />
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="absolute inset-0">
          {!lite ? (near && <Suspense fallback={null}><Film3D progress={p} active={near} /></Suspense>) : <LiteSedan p={p} />}
        </div>
        <motion.div style={{ opacity: heroO, y: heroY }} className="relative px-5 pt-[8vh] text-center md:pt-[9vh]">
          <p className="text-[clamp(15px,1.5vw,19px)] font-semibold" style={{ color: ACC }}>Автосервис Mercedes-Benz</p>
          <h1 className="mt-2 text-[clamp(44px,8.2vw,112px)] font-semibold leading-[.98] tracking-[-.045em]">
            <LineReveal delay={0.1}>Каждая система.</LineReveal>
            <LineReveal delay={0.22} className="text-[#86868b]">На своём месте.</LineReveal>
          </h1>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[15px] md:text-[17px]">
            <a href="#book" className="rounded-full px-5 py-2.5 font-medium text-white" style={{ background: ACC }}>Записаться</a>
            <a href="#to" className="inline-flex items-center gap-0.5 font-medium" style={{ color: ACC }}>Подобрать ТО <ChevronRight size={18} /></a>
          </div>
        </motion.div>
        <motion.div style={{ opacity: heroO }} className="absolute inset-x-0 bottom-[calc(96px+env(safe-area-inset-bottom))] text-center text-[13px] sm:bottom-10" >
          <span className="inline-flex items-center gap-2" style={{ color: MUTE }}><Star size={14} fill={INK} strokeWidth={0} /> <b className="font-semibold text-[#1d1d1f]">{b.rating}</b> · {b.rev} оценки на Яндекс Картах · листайте</span>
        </motion.div>
        <div className="pointer-events-none absolute inset-x-0 bottom-[calc(92px+env(safe-area-inset-bottom))] h-[170px] sm:bottom-24 md:h-[160px]">
          {CAPS.map((c, i) => <Caption key={i} p={p} c={c} />)}
        </div>
        <div className="absolute inset-x-0 bottom-[calc(76px+env(safe-area-inset-bottom))] hidden px-5 sm:bottom-8 sm:block"><ChapterDots p={p} /></div>
      </div>
    </section>
  )
}

/* ---------- highlights carousel ---------- */
function VisClasses() {
  return (
    <div className="absolute inset-x-0 bottom-0 top-[42%] overflow-hidden">
      <motion.div className="flex gap-6 whitespace-nowrap text-[120px] font-semibold leading-none tracking-[-.06em] text-white/[.13]" animate={{ x: ['0%', '-50%'] }} transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}>
        {[...'ACESGV', ...'ACESGV'].map((c, i) => <span key={i}>{c}<span className="text-[60px]">-Class</span></span>)}
      </motion.div>
      <p className="absolute bottom-8 left-8 text-[15px] text-white/60">A · C · E · S · GLC · GLE · G · Sprinter</p>
    </div>
  )
}
function VisWave() {
  return (
    <svg viewBox="0 0 400 200" className="absolute inset-x-0 bottom-6 w-full">
      {[0, 1, 2].map(k => (
        <motion.path key={k} d={`M0 ${100 + k * 18} ${Array.from({ length: 20 }, (_, i) => `L${(i + 1) * 20} ${100 + k * 18 + Math.sin(i * (1.1 + k * 0.4)) * (24 - k * 6)}`).join(' ')}`} fill="none" stroke={k === 0 ? ACC : '#c7c7cc'} strokeWidth={k === 0 ? 2.5 : 1.5}
          initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ duration: 2 + k * 0.4, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' }} />
      ))}
    </svg>
  )
}
function VisAir() {
  return (
    <div className="absolute inset-x-8 bottom-10 flex h-[46%] items-end justify-between">
      {[0, 1, 2, 3].map(k => (
        <div key={k} className="flex flex-col items-center gap-2">
          <motion.div className="w-12 rounded-[14px] bg-gradient-to-t from-[#0066ff] to-[#7fb2ff]" animate={{ height: [60, 120, 80, 120, 60] }} transition={{ duration: 4, repeat: Infinity, delay: k * 0.25, ease: 'easeInOut' }} />
          <span className="text-[11px] text-black/40">{['ПЛ', 'ПП', 'ЗЛ', 'ЗП'][k]}</span>
        </div>
      ))}
    </div>
  )
}
function VisGear() {
  return (
    <motion.svg viewBox="-100 -100 200 200" className="absolute -bottom-16 -right-10 w-[78%] text-white/20" animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}>
      {Array.from({ length: 24 }, (_, i) => <rect key={i} x="-6" y="-96" width="12" height="20" rx="3" fill="currentColor" transform={`rotate(${i * 15})`} />)}
      <circle r="76" fill="none" stroke="currentColor" strokeWidth="10" /><circle r="30" fill="none" stroke="#0066ff" strokeWidth="6" />
    </motion.svg>
  )
}
function VisRing() {
  return (
    <svg viewBox="0 0 200 200" className="absolute bottom-6 left-1/2 w-[62%] -translate-x-1/2 -rotate-90">
      <circle cx="100" cy="100" r="80" fill="none" stroke="#e8e8ed" strokeWidth="14" />
      <motion.circle cx="100" cy="100" r="80" fill="none" stroke={ACC} strokeWidth="14" strokeLinecap="round" initial={{ pathLength: 0 }} whileInView={{ pathLength: 0.72 }} transition={{ duration: 1.8, ease: [0.2, 0, 0, 1] }} />
    </svg>
  )
}
function VisStars() {
  return (
    <div className="absolute inset-x-8 bottom-10">
      <div className="flex gap-2 text-white">{[0, 1, 2, 3, 4].map(k => <motion.span key={k} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + k * 0.1 }}><Star size={34} fill="currentColor" strokeWidth={0} /></motion.span>)}</div>
      <p className="mt-4 text-[64px] font-semibold leading-none tracking-[-.05em] text-white">{b.rev}</p>
      <p className="mt-1 text-[15px] text-white/60">оценки на Яндекс Картах</p>
    </div>
  )
}
const HL = [
  { t: 'Только Mercedes-Benz.', d: 'Один бренд — значит, знакомые узлы и понятные решения.', dark: true, V: VisClasses },
  { t: 'Диагностика дилерского уровня.', d: 'Оборудование, которое видит блоки управления так же глубоко, как задумал производитель.', V: VisWave },
  { t: 'Airmatic под контролем.', d: 'Уровень кузова, компрессор, утечки — проверяем всю пневматику.', V: VisAir },
  { t: 'АКПП без догадок.', d: 'Масло, адаптации и диагностика по данным коробки.', dark: true, V: VisGear },
  { t: 'ТО по регламенту.', d: 'Перечень работ под ваш класс и пробег — ниже на странице.', V: VisRing },
  { t: `${b.rating} на Яндекс Картах.`, d: 'Оценка клиентов сервиса.', dark: true, V: VisStars },
]
function HCard({ h }) {
  const V = h.V
  return (
    <article className={'relative h-[520px] w-[82vw] shrink-0 snap-center overflow-hidden rounded-[28px] p-8 sm:w-[420px] md:h-[580px] ' + (h.dark ? 'bg-black text-white' : 'bg-white text-[#1d1d1f]')}>
      <h3 className="text-[26px] font-semibold leading-[1.1] tracking-[-.03em]">{h.t}</h3>
      <p className={'mt-3 max-w-[320px] text-[16px] leading-snug ' + (h.dark ? 'text-white/60' : 'text-black/55')}>{h.d}</p>
      <V />
    </article>
  )
}
function Highlights() {
  const ref = useRef(null)
  const [i, setI] = useState(0)
  const onScroll = () => { const el = ref.current; const w = el.firstChild.firstChild.offsetWidth + 20; setI(Math.min(HL.length - 1, Math.round(el.scrollLeft / w))) }
  const go = d => { const el = ref.current; const w = el.firstChild.firstChild.offsetWidth + 20; el.scrollTo({ left: el.scrollLeft + d * w, behavior: 'smooth' }) }
  return (
    <section id="highlights" className="py-24 md:py-32" style={{ background: '#f5f5f7' }}>
      <div className="mx-auto max-w-[1080px] px-5">
        <h2 className="text-[clamp(36px,5.4vw,64px)] font-semibold tracking-[-.04em]"><LineReveal>Главное о сервисе.</LineReveal></h2>
      </div>
      <div ref={ref} onScroll={onScroll} className="mt-10 snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex w-max gap-5 px-5 md:px-[max(20px,calc((100vw-1080px)/2))]">{HL.map((h, k) => <HCard key={k} h={h} />)}</div>
      </div>
      <div className="mx-auto mt-8 flex max-w-[1080px] items-center justify-center gap-4 px-5">
        <div className="flex h-12 items-center gap-2.5 rounded-full bg-black/[.06] px-5">{HL.map((_, k) => <span key={k} className="h-2 rounded-full transition-all duration-500" style={{ width: k === i ? 28 : 8, background: k === i ? INK : '#a1a1a6' }} />)}</div>
        <button aria-label="Назад" onClick={() => go(-1)} className="grid h-12 w-12 place-items-center rounded-full bg-black/[.06] hover:bg-black/10"><ChevronLeft size={20} /></button>
        <button aria-label="Вперёд" onClick={() => go(1)} className="grid h-12 w-12 place-items-center rounded-full bg-black/[.06] hover:bg-black/10"><ChevronRight size={20} /></button>
      </div>
    </section>
  )
}

/* ---------- value interaction: подбор ТО ---------- */
const CLASSES = ['A', 'C', 'E', 'S', 'GLC', 'GLE', 'G', 'Sprinter']
function works(cls, km) {
  const each = ['Замена моторного масла и масляного фильтра', 'Проверка жидкостей, тормозов, подвески и рулевого', 'Компьютерная диагностика и сброс сервисного интервала']
  const now = []
  if (km % 30 === 0) now.push('Замена салонного фильтра', 'Замена тормозной жидкости')
  if (km % 60 === 0) now.push('Замена воздушного фильтра', 'Свечи зажигания или топливный фильтр — по типу двигателя', 'Замена масла в АКПП')
  if (km % 90 === 0) now.push('Осмотр приводного ремня и роликов')
  if (km % 150 === 0) now.push('Замена охлаждающей жидкости')
  const extra = []
  if (['S', 'GLE'].includes(cls)) extra.push('Диагностика пневмоподвески Airmatic')
  if (['E', 'GLC'].includes(cls)) extra.push('Диагностика пневмоподвески Airmatic — при наличии')
  if (cls === 'G') extra.push(km % 60 === 0 ? 'Замена масла в раздаточной коробке и мостах' : 'Проверка мостов, раздатки и блокировок')
  if (cls === 'Sprinter') extra.push('Проверка подвески и тормозов с учётом нагрузки', 'Осмотр карданного вала и креплений')
  if (cls === 'A' && km % 60 === 0) extra.push('Обслуживание роботизированной коробки — по комплектации')
  if (km >= 120) extra.push('Осмотр сайлентблоков, опор двигателя и коробки')
  return { each, now, extra }
}
function Group({ title, items, accent }) {
  if (!items.length) return null
  return (
    <div className="border-t border-white/10 pt-5">
      <p className="text-[12px] font-medium uppercase tracking-[.14em]" style={{ color: accent ? '#4d94ff' : 'rgba(255,255,255,.45)' }}>{title}</p>
      <ul className="mt-3 grid gap-2.5">
        <AnimatePresence initial={false} mode="popLayout">
          {items.map(t => <motion.li layout key={t} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.35 }} className="flex gap-3 text-[16px] leading-snug text-white/85"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-white/40" />{t}</motion.li>)}
        </AnimatePresence>
      </ul>
    </div>
  )
}
function Picker() {
  const [cls, setCls] = useState('E')
  const [km, setKm] = useState(60)
  const w = works(cls, km)
  const n = w.each.length + w.now.length + w.extra.length
  const kind = w.now.length >= 3 ? 'Расширенное ТО' : 'Плановое ТО'
  const book = () => { window.dispatchEvent(new CustomEvent('kv-svc', { detail: `${kind} · ${cls === 'Sprinter' ? 'Sprinter' : cls + '-Class'} · ${km} 000 км` })); const el = document.getElementById('book'); window.__lenis ? window.__lenis.scrollTo(el, { offset: -50 }) : el.scrollIntoView() }
  return (
    <section id="to" className="bg-black px-5 py-24 text-white md:py-36">
      <div className="mx-auto max-w-[1080px]">
        <div className="text-center">
          <p className="text-[17px] font-semibold" style={{ color: '#4d94ff' }}>Подбор ТО</p>
          <h2 className="mt-2 text-[clamp(38px,6.4vw,80px)] font-semibold leading-[1] tracking-[-.045em]"><LineReveal>Ваш класс. Ваш пробег.</LineReveal><LineReveal delay={0.1} className="text-white/45">Ваш список работ.</LineReveal></h2>
        </div>
        <div className="mt-14 grid gap-10 md:grid-cols-[1fr_1.1fr] md:gap-14">
          <div>
            <p className="text-[14px] text-white/50">Класс</p>
            <div role="radiogroup" aria-label="Класс автомобиля" className="mt-3 grid grid-cols-4 gap-1.5 rounded-[18px] bg-white/[.07] p-1.5">
              {CLASSES.map(c => (
                <button key={c} role="radio" aria-checked={cls === c} onClick={() => setCls(c)} className="relative h-12 rounded-[13px] text-[15px] font-medium">
                  {cls === c && <motion.span layoutId="clsPill" className="absolute inset-0 rounded-[13px] bg-white" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
                  <span className={'relative ' + (cls === c ? 'text-black' : 'text-white/75')}>{c}</span>
                </button>
              ))}
            </div>
            <div className="mt-10 flex items-end justify-between">
              <p className="text-[14px] text-white/50">Пробег</p>
              <p className="text-[clamp(40px,5vw,60px)] font-semibold leading-none tracking-[-.04em]" style={{ fontVariantNumeric: 'tabular-nums' }}>{km} 000 <span className="text-[20px] text-white/45">км</span></p>
            </div>
            <input aria-label="Пробег, тысяч км" type="range" min="15" max="300" step="15" value={km} onChange={e => setKm(+e.target.value)} className="mt-5 w-full accent-[#0066ff]" />
            <div className="mt-2 flex justify-between text-[12px] text-white/35"><span>15 000</span><span>300 000</span></div>
            <div className="mt-10 rounded-[22px] bg-white/[.06] p-6">
              <p className="text-[14px] text-white/50">Тип обслуживания</p>
              <p className="mt-1 text-[28px] font-semibold tracking-[-.03em]">{kind}</p>
              <p className="mt-1 text-[15px] text-white/55">{n} позиций в перечне</p>
              <button onClick={book} className="mt-5 inline-flex h-12 items-center gap-2 rounded-full px-6 text-[15px] font-medium text-white" style={{ background: ACC }}>Записаться на это ТО <ArrowRight size={17} /></button>
            </div>
          </div>
          <div className="grid content-start gap-6">
            <Group title="Каждое ТО" items={w.each} />
            <Group title={`На ${km} 000 км`} items={w.now} accent />
            <Group title={`Для ${cls === 'Sprinter' ? 'Sprinter' : cls + '-Class'}`} items={w.extra} />
            <p className="text-[13px] leading-relaxed text-white/40">Ориентировочный перечень. Точный состав — по регламенту вашего автомобиля и после диагностики.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- bento ---------- */
function Bento() {
  const card0 = 'relative overflow-hidden rounded-[28px] p-8 shadow-[0_2px_30px_rgba(0,0,0,.04)]', card = card0 + ' bg-white'
  return (
    <section className="px-5 py-24 md:py-32" style={{ background: '#f5f5f7' }}>
      <div className="mx-auto max-w-[1080px]">
        <h2 className="text-center text-[clamp(36px,5.4vw,64px)] font-semibold tracking-[-.04em]"><LineReveal>Почему здесь.</LineReveal></h2>
        <div className="mt-12 grid gap-4 md:grid-cols-6 md:grid-rows-[260px_260px]">
          <Reveal className={card + ' md:col-span-4 md:row-span-1'}>
            <p className="text-[15px]" style={{ color: MUTE }}>Сначала диагностика</p>
            <p className="mt-2 max-w-[420px] text-[clamp(26px,3vw,36px)] font-semibold leading-[1.08] tracking-[-.03em]">Потом согласование. Потом — работа.</p>
            <div className="mt-6 flex flex-wrap items-center gap-2 text-[13px] md:absolute md:bottom-8 md:left-8 md:right-8 md:mt-0 md:gap-3 font-medium">
              {['Диагностика', 'Смета', 'Согласование', 'Ремонт'].map((s, k) => <React.Fragment key={s}><span className={k === 3 ? 'text-white rounded-full px-3 py-1.5' : 'rounded-full bg-[#f5f5f7] px-3 py-1.5'} style={k === 3 ? { background: ACC } : undefined}>{s}</span>{k < 3 && <span className="hidden h-px flex-1 bg-black/10 sm:block" />}</React.Fragment>)}
            </div>
          </Reveal>
          <Reveal delay={0.08} className={card0 + ' min-h-[300px] bg-black text-white md:col-span-2 md:row-span-2'}>
            <p className="text-[15px] text-white/55">Яндекс Карты</p>
            <p className="mt-2 text-[110px] font-semibold leading-none tracking-[-.06em]">{b.rating}</p>
            <div className="mt-2 flex gap-1">{[0, 1, 2, 3, 4].map(k => <Star key={k} size={18} fill="#fff" strokeWidth={0} />)}</div>
            <p className="absolute bottom-8 left-8 text-[15px] text-white/60">{b.rev} оценки клиентов</p>
          </Reveal>
          <Reveal delay={0.12} className={card + ' md:col-span-2'}>
            <p className="text-[15px]" style={{ color: MUTE }}>Классы</p>
            <p className="mt-2 text-[28px] font-semibold leading-[1.05] tracking-[-.03em]">От A-Class до Sprinter.</p>
          </Reveal>
          <Reveal delay={0.16} className={card + ' md:col-span-2'}>
            <p className="text-[15px]" style={{ color: MUTE }}>Адрес</p>
            <p className="mt-2 text-[24px] font-semibold leading-[1.1] tracking-[-.03em]">{b.addr}</p>
            <a href="#contact" className="mt-3 inline-flex items-center text-[15px] font-medium" style={{ color: ACC }}>Как добраться <ChevronRight size={16} /></a>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

/* ---------- specs ---------- */
const SPECS = [
  ['Специализация', 'Mercedes-Benz: легковые A, C, E, S; внедорожники GLC, GLE, G; Sprinter.'],
  ['Виды работ', 'Плановое ТО · Компьютерная диагностика · Двигатель · АКПП · Подвеска и Airmatic · Тормозная система · Рулевое управление · Электрика и электроника'],
  ['Диагностика', 'Оборудование для диагностики дилерского уровня: чтение и расшифровка ошибок, проверка систем, адаптации.'],
  ['Подвеска', 'Пневмоподвеска Airmatic: баллоны, компрессор, клапанный блок, датчики уровня. Пружинная подвеска: амортизаторы, рычаги, сайлентблоки.'],
  ['Трансмиссия', 'АКПП: замена масла, диагностика, адаптация. Полный привод: раздаточная коробка, мосты.'],
  ['Запись', 'По телефону или онлайн на этой странице.'],
  ['Адрес', `${b.addr}, ${b.city}`],
  ['Оценка', `${b.rating} на Яндекс Картах · ${b.rev} оценки`],
]
function Specs() {
  return (
    <section id="specs" className="px-5 py-24 md:py-32" style={{ background: BG }}>
      <div className="mx-auto max-w-[1080px]">
        <h2 className="border-b border-black/10 pb-6 text-[clamp(32px,4.6vw,56px)] font-semibold tracking-[-.04em]"><LineReveal>Технические характеристики сервиса</LineReveal></h2>
        <dl>
          {SPECS.map(([k, v], i) => (
            <Reveal key={k} delay={i * 0.03} className="grid gap-2 border-b border-black/10 py-7 md:grid-cols-[260px_1fr]">
              <dt className="text-[clamp(20px,2vw,26px)] font-semibold tracking-[-.02em]">{k}</dt>
              <dd className="text-[17px] leading-relaxed" style={{ color: k === 'Запись' ? INK : '#424245' }}>{k === 'Запись' ? <>{v} <a href={'tel:' + tel(b.phone)} className="font-medium" style={{ color: ACC }}>{b.phone}</a></> : v}</dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  )
}

/* ---------- booking ---------- */
const SVCS = ['Плановое ТО', 'Диагностика', 'Двигатель', 'АКПП', 'Airmatic / подвеска', 'Электроника', 'Тормоза']
const STEPS = ['Работа', 'Автомобиль', 'Контакты']
function Chip({ on, children, onClick }) {
  return <button type="button" onClick={onClick} aria-pressed={on} className={'h-11 rounded-full border px-4 text-[15px] transition-colors ' + (on ? 'border-[#1d1d1f] bg-[#1d1d1f] text-white' : 'border-black/15 hover:border-black/40')}>{children}</button>
}
function Booking() {
  const bk = useBooking()
  const [step, setStep] = useState(0)
  const [cls, setCls] = useState(''), [model, setModel] = useState('')
  const [err, setErr] = useState('')
  useEffect(() => { const h = e => { bk.upd('svc', e.detail); setStep(0); setErr('') }; window.addEventListener('kv-svc', h); return () => window.removeEventListener('kv-svc', h) }, [])
  const next = () => {
    if (step === 0 && !bk.s.svc) return setErr('Выберите работу или опишите задачу.')
    if (step === 1 && !cls) return setErr('Отметьте класс автомобиля.')
    setErr(''); setStep(s => s + 1)
  }
  const onSubmit = e => { e.preventDefault(); if (step < 2) next(); else bk.submit() }
  const f = 'h-14 w-full rounded-[14px] border border-black/15 bg-white px-4 text-[17px] outline-none placeholder:text-black/35 focus:border-[#0066ff]'
  return (
    <section id="book" className="px-5 py-24 md:py-32" style={{ background: '#f5f5f7' }}>
      <div className="mx-auto max-w-[720px]">
        <h2 className="text-center text-[clamp(38px,6vw,72px)] font-semibold leading-[1] tracking-[-.045em]"><LineReveal>Запись в сервис.</LineReveal></h2>
        <p className="mt-4 text-center text-[17px]" style={{ color: MUTE }}>Три коротких шага. Мы перезвоним и подтвердим время.</p>
        <div className="mt-10 rounded-[28px] bg-white p-6 shadow-[0_2px_40px_rgba(0,0,0,.05)] md:p-10">
          <AnimatePresence mode="wait">
            {!bk.s.sent ? (
              <motion.form key="f" onSubmit={onSubmit} noValidate exit={{ opacity: 0, y: -10 }}>
                <ol className="mb-8 grid grid-cols-3 gap-2" aria-label="Шаги">
                  {STEPS.map((s, i) => (
                    <li key={s} aria-current={i === step ? 'step' : undefined}>
                      <div className="h-1 overflow-hidden rounded bg-black/[.07]"><motion.div className="h-full" style={{ background: ACC }} animate={{ width: i <= step ? '100%' : '0%' }} /></div>
                      <p className={'mt-2 text-[13px] font-medium ' + (i <= step ? '' : 'text-black/35')}>{i + 1}. {s}</p>
                    </li>
                  ))}
                </ol>
                <AnimatePresence mode="wait">
                  <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="min-h-[230px]">
                    {step === 0 && (
                      <fieldset>
                        <legend className="mb-5 text-[24px] font-semibold tracking-[-.03em]">Что нужно сделать?</legend>
                        <div className="flex flex-wrap gap-2">{SVCS.map(s => <Chip key={s} on={bk.s.svc === s} onClick={() => { bk.upd('svc', s); setErr('') }}>{s}</Chip>)}</div>
                        <input className={f + ' mt-5'} placeholder="Или опишите задачу своими словами" value={SVCS.includes(bk.s.svc) ? '' : bk.s.svc} onChange={e => bk.upd('svc', e.target.value)} />
                      </fieldset>
                    )}
                    {step === 1 && (
                      <div className="grid gap-5">
                        <fieldset><legend className="mb-4 text-[24px] font-semibold tracking-[-.03em]">Какой автомобиль?</legend><div className="flex flex-wrap gap-2">{CLASSES.map(c => <Chip key={c} on={cls === c} onClick={() => { setCls(c); setErr('') }}>{c}</Chip>)}</div></fieldset>
                        <input className={f} placeholder="Модель и год (необязательно)" value={model} onChange={e => setModel(e.target.value)} />
                      </div>
                    )}
                    {step === 2 && (
                      <div className="grid gap-4">
                        <p className="rounded-[14px] bg-[#f5f5f7] px-4 py-3 text-[14px]" style={{ color: MUTE }}><span style={{ color: INK }}>{bk.s.svc}</span> · {cls}{model && ' · ' + model}</p>
                        <label className="grid gap-2 text-[13px] font-medium" style={{ color: MUTE }}>Имя<input className={f} autoComplete="name" placeholder="Как к вам обращаться" value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} /></label>
                        <label className="grid gap-2 text-[13px] font-medium" style={{ color: MUTE }}>Телефон
                          <input className={f + (bk.s.err ? ' !border-red-500' : '')} type="tel" inputMode="tel" autoComplete="tel" placeholder="+375 __ ___-__-__" value={bk.s.phone} onFocus={phoneFocus(bk)} onChange={e => bk.upd('phone', e.target.value)} aria-invalid={bk.s.err} />
                        </label>
                        {bk.s.err && <p role="alert" className="text-[13px] text-red-600">Введите номер полностью: +375 и 9 цифр.</p>}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
                {err && <p role="alert" className="mt-3 text-[13px] text-red-600">{err}</p>}
                <div className="mt-8 flex items-center justify-between">
                  {step > 0 ? <button type="button" onClick={() => { setErr(''); setStep(s => s - 1) }} className="inline-flex h-12 items-center gap-2 px-2 text-[15px] font-medium" style={{ color: MUTE }}><ArrowLeft size={16} />Назад</button> : <span />}
                  <button type="submit" disabled={bk.s.loading} className="inline-flex h-12 items-center gap-2 rounded-full px-7 text-[15px] font-medium text-white disabled:opacity-60" style={{ background: ACC }}>{step < 2 ? <>Дальше <ArrowRight size={17} /></> : bk.s.loading ? 'Отправляем…' : 'Записаться'}</button>
                </div>
              </motion.form>
            ) : (
              <motion.div key="ok" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="grid min-h-[340px] place-items-center text-center">
                <div>
                  <CheckDraw className="mx-auto mb-5" size={80} />
                  <h3 className="text-[34px] font-semibold tracking-[-.04em]">Заявка принята.</h3>
                  <p className="mx-auto mt-3 max-w-[380px]" style={{ color: MUTE }}>В готовом сайте заявка сразу придёт вам в Telegram — мастер перезвонит и подтвердит время.</p>
                  <button onClick={() => { bk.reset(); setStep(0); setCls(''); setModel('') }} className="mt-5 text-[15px] font-medium" style={{ color: ACC }}>Новая запись</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

function Contact() {
  return (
    <section id="contact" className="px-5 py-24 md:py-32" style={{ background: BG }}>
      <div className="mx-auto max-w-[1080px] text-center">
        <p className="text-[17px] font-semibold" style={{ color: ACC }}>Контакты</p>
        <a href={'tel:' + tel(b.phone)} className="mt-3 inline-block text-[clamp(36px,7vw,88px)] font-semibold leading-none tracking-[-.045em] hover:opacity-70">{b.phone}</a>
        <p className="mt-4 text-[19px]" style={{ color: MUTE }}>{b.addr}, {b.city}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href={'tel:' + tel(b.phone)} className="inline-flex h-12 items-center gap-2 rounded-full px-6 text-[15px] font-medium text-white" style={{ background: ACC }}><Phone size={16} />Позвонить</a>
          <a href="#book" className="inline-flex h-12 items-center rounded-full border border-black/15 px-6 text-[15px] font-medium">Записаться онлайн</a>
        </div>
        <Reveal className="mt-14 h-[420px] overflow-hidden rounded-[28px] border border-black/10 md:h-[480px]"><MapFrame oid={b.oid} /></Reveal>
      </div>
    </section>
  )
}

function App() {
  useSmooth()
  const lite = useLite()
  return (
    <MotionConfig reducedMotion="user">
      <div className={'overflow-x-clip ' + F} style={{ background: BG, color: INK, '--sel': ACC, '--selc': '#fff' }}>
        <Ribbon name={b.name} bg="#1d1d1f" fg="#f5f5f7" />
        <Header />
        <main>
          <Film lite={lite} />
          <Highlights />
          <Picker />
          <Bento />
          <Specs />
          <Booking />
          <Contact />
        </main>
        <footer className="border-t border-black/10 px-5 py-6 text-[12px]" style={{ background: '#f5f5f7', color: MUTE }}>
          <div className="mx-auto flex max-w-[1080px] flex-wrap justify-between gap-3"><span>© 2026 {b.name} · Концепт сайта — Артём</span><span>Автосервис Mercedes-Benz · {b.city}</span></div>
        </footer>
        <CallBar phone={b.phone} barCls="bg-[#fbfbfd]/90 backdrop-blur-xl border-t border-black/10" callCls="rounded-full border border-black/15 text-[#1d1d1f]" bookCls="rounded-full bg-[#0066ff] text-white" />
        <div className="h-[72px] sm:hidden" style={{ background: '#f5f5f7' }} />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
