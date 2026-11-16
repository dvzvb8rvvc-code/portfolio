import React, { useRef, useState, useEffect, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, useSpring, useInView, AnimatePresence, MotionConfig } from 'framer-motion'
import { ArrowRight, ArrowUpRight, Phone, MapPin } from 'lucide-react'
import '../lib/base.css'
import { useSmooth, Ribbon, LineReveal, Reveal, useBooking, phoneFocus, CheckDraw, MapFrame, CallBar, tel, useLite, IG } from '../lib/kit'

const SculptureScene = lazy(() => import('./lanaestet3d'))

const b = {
  name: 'Lanaestet', addr: 'ул. Петра Мстиславца, 7', floor: 'цокольный этаж · Маяк Минска',
  phone: '+375 29 857-68-33', ig: 'https://www.instagram.com/lanaestet.by', rating: '5,0', rev: 76, oid: '217461673627',
}
const BASE = '#f3efe9', INK = '#1e1c1a', ACC = '#9c7a5b'
const SERIF = "font-['Noto_Serif_Display',serif]", SANS = "font-['Onest',sans-serif]"
const LABEL = 'text-[11px] uppercase tracking-[.28em]'

const CH = [
  { w: 'Очищение', n: 'I', t: 'Сначала — чистый лист.', d: 'Деликатное очищение снимает лишнее и готовит кожу к уходу.', r: [0.12, 0.4], bg: '#efede9' },
  { w: 'Уход', n: 'II', t: 'Потом — то, что нужно именно вам.', d: 'Увлажнение, питание, восстановление — по состоянию кожи, а не по шаблону.', r: [0.41, 0.66], bg: '#f1e8df' },
  { w: 'Сияние', n: 'III', t: 'И свет, который идёт изнутри.', d: 'Ровный тон и мягкое сияние — тот самый эффект «выспалась».', r: [0.67, 0.95], bg: '#f6e9df' },
]

/* ---------------- pinned film ---------------- */
function Fade({ p, r, children, className = '', y0 = 30 }) {
  const k = [r[0] - 0.005, r[0] + 0.04, r[1] - 0.05, r[1] - 0.01]
  const o = useTransform(p, k, [0, 1, 1, 0])
  const y = useTransform(p, k, [y0, 0, 0, -y0])
  return <motion.div style={{ opacity: o, y }} className={'pointer-events-none ' + className}>{children}</motion.div>
}
function BigWord({ p, c }) {
  const k = [c.r[0] - 0.005, c.r[0] + 0.05, c.r[1] - 0.05, c.r[1] - 0.01]
  const o = useTransform(p, k, [0, 1, 1, 0])
  const ls = useTransform(p, [c.r[0], c.r[1]], ['-0.02em', '0.06em'])
  return <motion.p style={{ opacity: o, letterSpacing: ls }} className={`${SERIF} absolute inset-x-0 top-1/2 -translate-y-1/2 select-none whitespace-nowrap text-center text-[clamp(84px,19vw,300px)] font-light italic leading-none text-[#d9cbbd]`}>{c.w}</motion.p>
}
function LiteForm({ p }) {
  const rot = useTransform(p, [0, 1], [0, 160])
  const bg = useTransform(p, [0, 1], ['radial-gradient(circle at 20% 30%, #fff, #dcd8d2 70%)', 'radial-gradient(circle at 80% 30%, #fff, #ecd6c6 70%)'])
  return <div className="absolute inset-0 grid place-items-center"><motion.div style={{ rotate: rot, background: bg }} className="h-[46vmin] w-[34vmin] rounded-[48%_52%_44%_56%/60%_44%_56%_40%] shadow-[0_40px_80px_-30px_rgba(80,60,40,.4)]" /></div>
}
function Film({ lite }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const p = useSpring(scrollYProgress, { stiffness: 80, damping: 24, mass: 0.4 })
  const near = useInView(ref, { margin: '300px 0px' })
  const [mounted, setMounted] = useState(false)
  useEffect(() => { if (near) setMounted(true) }, [near])
  const bg = useTransform(p, [0, 0.12, 0.41, 0.67, 1], ['#f3efe9', CH[0].bg, CH[1].bg, CH[2].bg, '#f6e9df'])
  const heroO = useTransform(p, [0, 0.09], [1, 0])
  const heroPE = useTransform(p, v => (v < 0.05 ? 'auto' : 'none'))
  const line = useTransform(p, [0.12, 0.95], ['0%', '100%'])
  return (
    <motion.section ref={ref} id="film" className="relative h-[480vh]" style={{ background: bg }}>
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {CH.map(c => <BigWord key={c.w} p={p} c={c} />)}
        <div className="absolute inset-x-0 top-[13%] bottom-[42%] md:inset-0">
          {lite ? <LiteForm p={p} /> : mounted && <Suspense fallback={null}><SculptureScene progress={p} active={near} /></Suspense>}
        </div>

        {/* hero */}
        <motion.div style={{ opacity: heroO, pointerEvents: heroPE }} className="absolute inset-x-0 bottom-[112px] px-5 md:bottom-14 md:px-12">
          <div className="mx-auto flex max-w-[1400px] flex-col gap-5 md:gap-7">
            <h1 className={`${SERIF} text-[clamp(46px,7.6vw,128px)] font-light leading-[.92] tracking-[-0.035em]`}>
              <LineReveal delay={0.15}>Свет. Тишина.</LineReveal>
              <LineReveal delay={0.3}><em className="text-[#9c7a5b]">Ваша кожа.</em></LineReveal>
            </h1>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 1 }} className="max-w-[340px]">
              <p className="text-[15.5px] leading-relaxed text-[#1e1c1a]/65">Кабинет косметолога у «Маяка Минска». Уход без спешки — и план, понятный с первой консультации.</p>
              <a href="#book" className="mt-5 hidden items-center gap-3 border-b border-[#1e1c1a] pb-1.5 text-[14px] font-medium md:inline-flex">Записаться на консультацию <ArrowRight size={16} /></a>
            </motion.div>
          </div>
        </motion.div>
        <motion.p style={{ opacity: heroO }} className={`${LABEL} absolute left-5 top-[86px] text-[#1e1c1a]/55 md:left-12`}>Косметология · Минск</motion.p>

        {/* chapters */}
        {CH.map(c => (
          <Fade key={c.n} p={p} r={c.r} className="absolute inset-x-0 bottom-[96px] px-5 md:bottom-auto md:left-12 md:right-auto md:top-1/2 md:w-[340px] md:-translate-y-1/2 md:px-0">
            <p className={`${LABEL} mb-4 text-[#9c7a5b]`}>Глава {c.n} · {c.w}</p>
            <h2 className={`${SERIF} text-[clamp(30px,3.4vw,50px)] font-light leading-[1.02] tracking-[-0.02em]`}>{c.t}</h2>
            <p className="mt-4 text-[15.5px] leading-relaxed text-[#1e1c1a]/65">{c.d}</p>
          </Fade>
        ))}
        <div className="pointer-events-none absolute bottom-10 right-12 hidden w-[220px] md:block">
          <div className="flex justify-between text-[11px] tracking-[.2em] text-[#1e1c1a]/50">{CH.map(c => <span key={c.n}>{c.n}</span>)}</div>
          <div className="mt-2 h-px bg-[#1e1c1a]/15"><motion.div style={{ width: line }} className="h-px bg-[#9c7a5b]" /></div>
        </div>
      </div>
    </motion.section>
  )
}

/* ---------------- editorial statement ---------------- */
function Statement() {
  return (
    <section className="px-5 py-28 md:px-12 md:py-44" style={{ background: '#f6e9df' }}>
      <div className="mx-auto grid max-w-[1400px] gap-10 md:grid-cols-[1fr_2fr]">
        <Reveal><p className={`${LABEL} text-[#9c7a5b]`}>Подход</p></Reveal>
        <div>
          <h2 className={`${SERIF} text-[clamp(34px,4.6vw,72px)] font-light leading-[1.04] tracking-[-0.025em]`}>
            <Reveal as="span" className="block">Без спешки и лишних обещаний.</Reveal>
            <Reveal as="span" delay={0.1} className="block italic text-[#9c7a5b]">Сначала — разговор о вашей коже.</Reveal>
          </h2>
          <div className="mt-12 grid gap-8 border-t border-[#1e1c1a]/15 pt-8 sm:grid-cols-3">
            {[['Смотрим', 'Тип и состояние кожи, ваши задачи и ритм жизни.'], ['Предлагаем', 'Понятный план: что делать сейчас, а что — потом.'], ['Ведём', 'Корректируем уход от сеанса к сеансу.']].map(([t, d], i) => (
              <Reveal key={t} delay={i * 0.08}><p className={`${SERIF} text-[26px] font-light`}>{t}</p><p className="mt-2 text-[15px] leading-relaxed text-[#1e1c1a]/60">{d}</p></Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- compare (value interaction) ---------------- */
const DIR = [
  { id: 'clean', n: 'Чистка лица', gives: ['Очищает поры, убирает чёрные точки', 'Выравнивает рельеф', 'Кожа лучше принимает уход'], min: [60, 90], course: '1 раз в 1–2 месяца', feel: 'Возможно лёгкое покраснение в день процедуры', res: 'Чистота — сразу, ровный тон — через пару дней' },
  { id: 'peel', n: 'Пилинг', gives: ['Обновляет верхний слой кожи', 'Выравнивает тон и текстуру', 'Помогает при следах постакне'], min: [30, 60], course: 'Курс 3–6 процедур с перерывом 1–3 недели', feel: 'Покалывание; возможно шелушение несколько дней', res: 'Заметнее к концу курса' },
  { id: 'care', n: 'Уходовая процедура', gives: ['Увлажняет и питает', 'Снимает стянутость и тусклость', 'Мягкое сияние'], min: [45, 75], course: 'Разово или курсом 1 раз в 1–2 недели', feel: 'Приятно, без восстановления', res: 'Сразу после процедуры' },
  { id: 'mass', n: 'Массаж лица', gives: ['Снимает напряжение мышц', 'Улучшает тонус и цвет лица', 'Уменьшает утреннюю отёчность'], min: [30, 60], course: 'Курс 5–10 сеансов, 1–2 раза в неделю', feel: 'Расслабляет', res: 'Свежесть — сразу, тонус — к середине курса' },
  { id: 'dev', n: 'Аппаратный уход', gives: ['Поддерживает тонус и плотность кожи', 'Усиливает действие ухода', 'Дополняет ручные техники'], min: [40, 60], course: 'Курс 5–10 процедур', feel: 'Обычно комфортно', res: 'Накопительный' },
]
function Picker({ label, val, other, set }) {
  return (
    <div>
      <p className={`${LABEL} mb-3 text-[#1e1c1a]/50`}>{label}</p>
      <div className="flex flex-wrap gap-2">
        {DIR.map(d => (
          <button key={d.id} type="button" onClick={() => set(d.id)} aria-pressed={val === d.id} disabled={other === d.id}
            className={`relative border px-4 py-2.5 text-[14px] transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${val === d.id ? 'border-[#1e1c1a] bg-[#1e1c1a] text-[#f3efe9]' : 'border-[#1e1c1a]/20 hover:border-[#1e1c1a]/60'}`}>{d.n}</button>
        ))}
      </div>
    </div>
  )
}
function Cell({ k, children }) {
  return <AnimatePresence mode="wait"><motion.div key={k} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3 }}>{children}</motion.div></AnimatePresence>
}
function Dur({ d }) {
  return (
    <div>
      <p className={`${SERIF} text-[clamp(22px,2.4vw,32px)] font-light`}>≈ {d.min[0]}–{d.min[1]} мин</p>
      <div className="relative mt-3 h-[3px] bg-[#1e1c1a]/10">
        <motion.div className="absolute inset-y-0 bg-[#9c7a5b]/35" animate={{ left: 0, width: (d.min[1] / 90) * 100 + '%' }} transition={{ duration: 0.6 }} />
        <motion.div className="absolute inset-y-0 left-0 bg-[#9c7a5b]" animate={{ width: (d.min[0] / 90) * 100 + '%' }} transition={{ duration: 0.6 }} />
      </div>
    </div>
  )
}
function Compare() {
  const [a, setA] = useState('clean'), [bb, setB] = useState('care')
  const A = DIR.find(d => d.id === a), Bd = DIR.find(d => d.id === bb)
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 20%'] })
  const clip = useTransform(scrollYProgress, [0, 1], ['inset(12% 8% 0% 8%)', 'inset(0% 0% 0% 0%)'])
  const rows = [
    ['Что даёт', d => <ul className="space-y-1.5">{d.gives.map(g => <li key={g} className="flex gap-2"><span className="mt-[9px] h-px w-3 shrink-0 bg-[#9c7a5b]" />{g}</li>)}</ul>],
    ['Сеанс', d => <Dur d={d} />],
    ['Обычно', d => d.course],
    ['Ощущения', d => d.feel],
    ['Результат', d => d.res],
  ]
  return (
    <motion.section ref={ref} id="compare" style={{ clipPath: clip }} className="bg-[#1e1c1a] px-5 py-24 text-[#f3efe9] md:px-12 md:py-36">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid gap-8 md:grid-cols-[1fr_1fr] md:items-end">
          <h2 className={`${SERIF} text-[clamp(44px,6.6vw,108px)] font-light leading-[.95] tracking-[-0.035em]`}>Сравнить<br /><em className="text-[#c9a888]">процедуры</em></h2>
          <p className="max-w-[420px] text-[16px] leading-relaxed text-[#f3efe9]/60 md:justify-self-end">Выберите два направления и посмотрите, чем они отличаются. Не уверены, что подойдёт? Это и есть повод для консультации.</p>
        </div>
        <div className="mt-14 grid gap-8 border-y border-[#f3efe9]/15 py-8 md:grid-cols-2 [&_button]:border-[#f3efe9]/25 [&_button[aria-pressed=true]]:border-[#f3efe9] [&_button[aria-pressed=true]]:bg-[#f3efe9] [&_button[aria-pressed=true]]:text-[#1e1c1a] [&_p]:text-[#f3efe9]/50">
          <Picker label="Первое" val={a} other={bb} set={setA} />
          <Picker label="Второе" val={bb} other={a} set={setB} />
        </div>
        <div className="mt-2">
          <div className="grid grid-cols-2 gap-5 border-b border-[#f3efe9]/15 py-7 md:grid-cols-[200px_1fr_1fr] md:gap-10">
            <span className="hidden md:block" />
            {[A, Bd].map((d, i) => <Cell key={i} k={d.id}><p className={`${SERIF} text-[clamp(24px,3vw,44px)] font-light italic leading-tight text-[#c9a888]`}>{d.n}</p></Cell>)}
          </div>
          {rows.map(([label, f]) => (
            <div key={label} className="grid grid-cols-2 gap-x-5 gap-y-3 border-b border-[#f3efe9]/15 py-6 text-[15px] leading-relaxed text-[#f3efe9]/80 md:grid-cols-[200px_1fr_1fr] md:gap-10">
              <p className={`${LABEL} col-span-2 text-[#f3efe9]/45 md:col-span-1 md:pt-1`}>{label}</p>
              <Cell k={a}>{f(A)}</Cell>
              <Cell k={bb}>{f(Bd)}</Cell>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <p className="max-w-[560px] text-[13.5px] text-[#f3efe9]/45">Данные ориентировочные. Перечень процедур, длительность и план курса косметолог подберёт на консультации.</p>
          <a href="#book" data-svc={`Консультация: ${A.n} или ${Bd.n}`} className="inline-flex h-14 items-center justify-center gap-3 bg-[#f3efe9] px-8 text-[15px] font-medium text-[#1e1c1a] transition-colors hover:bg-[#c9a888]">Обсудить на консультации <ArrowRight size={17} /></a>
        </div>
      </div>
    </motion.section>
  )
}

/* ---------------- bento ---------------- */
function Card({ className = '', children, href }) {
  const Tag = href ? 'a' : 'div'
  return (
    <Reveal className={'group relative ' + className}>
      <Tag href={href} target={href && href.startsWith('http') ? '_blank' : undefined} rel="noopener" className="relative flex h-full flex-col overflow-hidden border border-[#1e1c1a]/12 bg-[#f8f5f0] p-7 transition-[border-color,box-shadow] duration-500 hover:border-[#9c7a5b]/60 hover:shadow-[0_0_0_1px_rgba(156,122,91,.25),0_30px_60px_-30px_rgba(156,122,91,.5)]">{children}</Tag>
    </Reveal>
  )
}
function Breath() {
  return (
    <div className="relative mx-auto my-auto grid h-[150px] w-[150px] place-items-center">
      <motion.span className="absolute inset-0 rounded-full border border-[#9c7a5b]/40" animate={{ scale: [0.7, 1, 0.7] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.span className="absolute inset-[22%] rounded-full" style={{ background: 'radial-gradient(circle at 35% 30%, #fff, #e8d6c6 70%)' }} animate={{ scale: [0.85, 1.05, 0.85] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.span className={`${LABEL} relative text-[10px] text-[#1e1c1a]/60`} animate={{ opacity: [1, 0, 1, 0, 1] }} transition={{ duration: 8, repeat: Infinity, times: [0, 0.45, 0.5, 0.95, 1] }}>вдох</motion.span>
    </div>
  )
}
function Bento() {
  return (
    <section id="about" className="px-5 py-28 md:px-12 md:py-36" style={{ background: BASE }}>
      <div className="mx-auto max-w-[1400px]">
        <h2 className={`${SERIF} mb-14 text-[clamp(40px,5.4vw,88px)] font-light leading-[.98] tracking-[-0.03em]`}><Reveal as="span" className="block">Тихое место</Reveal><Reveal as="span" delay={0.08} className="block italic text-[#9c7a5b]">для вашей кожи</Reveal></h2>
        <div className="grid auto-rows-[minmax(220px,auto)] gap-4 md:grid-cols-4">
          <Card className="md:col-span-2 md:row-span-2">
            <p className={`${LABEL} text-[#1e1c1a]/50`}>Яндекс Карты</p>
            <p className={`${SERIF} mt-auto text-[clamp(120px,15vw,230px)] font-light leading-[.8] tracking-[-0.05em]`}>{b.rating}</p>
            <div className="mt-6 h-px bg-[#1e1c1a]/15"><motion.div className="h-px bg-[#9c7a5b]" initial={{ width: 0 }} whileInView={{ width: '100%' }} viewport={{ once: true }} transition={{ duration: 1.6, ease: [0.2, 0, 0, 1] }} /></div>
            <p className="mt-4 text-[16px] text-[#1e1c1a]/65">{b.rev} оценок — средняя пять из пяти</p>
          </Card>
          <Card className="md:col-span-2">
            <p className={`${LABEL} text-[#1e1c1a]/50`}>Где мы</p>
            <p className={`${SERIF} mt-auto text-[clamp(28px,3vw,44px)] font-light leading-tight`}>Петра Мстиславца, 7</p>
            <p className="mt-1 text-[15px] text-[#1e1c1a]/60">Цокольный этаж · «Маяк Минска»</p>
          </Card>
          <Card>
            <p className={`${LABEL} text-[#1e1c1a]/50`}>Ритм</p>
            <Breath />
            <p className="text-[14px] text-[#1e1c1a]/60">Сеанс — время только для вас.</p>
          </Card>
          <Card href={b.ig}>
            <IG width={22} height={22} className="text-[#9c7a5b]" />
            <p className={`${SERIF} mt-auto text-[28px] font-light italic`}>@lanaestet.by</p>
            <p className="text-[14px] text-[#1e1c1a]/60">Работы и новости — в Instagram</p>
            <ArrowUpRight size={18} className="absolute right-6 top-6 text-[#1e1c1a]/40 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
          </Card>
        </div>
      </div>
    </section>
  )
}

/* ---------------- directions index ---------------- */
function Directions() {
  return (
    <section id="services" className="px-5 pb-28 md:px-12 md:pb-36" style={{ background: BASE }}>
      <div className="mx-auto max-w-[1400px] border-t border-[#1e1c1a]/15">
        {DIR.concat([{ id: 'cons', n: 'Консультация', gives: ['Разбор состояния кожи и план ухода'] }]).map((d, i) => (
          <a key={d.id} href="#book" data-svc={d.n} className="group grid grid-cols-[48px_1fr_auto] items-baseline gap-4 border-b border-[#1e1c1a]/15 py-7 md:grid-cols-[120px_1.2fr_1fr_auto]">
            <span className={`${SERIF} text-[15px] italic text-[#9c7a5b]`}>{String(i + 1).padStart(2, '0')}</span>
            <span className={`${SERIF} text-[clamp(26px,3.4vw,52px)] font-light leading-none tracking-[-0.02em] transition-[letter-spacing,color] duration-700 group-hover:tracking-[0.01em] group-hover:text-[#9c7a5b]`}>{d.n}</span>
            <span className="hidden text-[15px] text-[#1e1c1a]/55 md:block">{d.gives[0]}</span>
            <ArrowRight size={18} className="text-[#1e1c1a]/40 transition-transform group-hover:translate-x-1 group-hover:text-[#9c7a5b]" />
          </a>
        ))}
      </div>
    </section>
  )
}

/* ---------------- booking ---------------- */
const BSV = ['Консультация', 'Чистка лица', 'Пилинг', 'Уходовая процедура', 'Массаж лица', 'Аппаратный уход']
const DAYS = ['Будни', 'Выходные', 'Как можно скорее']
const TIMES = ['Утро', 'День', 'Вечер']
function Opt({ on, children, ...rest }) {
  return <button type="button" aria-pressed={on} className={`border px-4 py-3 text-[14.5px] transition-colors ${on ? 'border-[#1e1c1a] bg-[#1e1c1a] text-[#f3efe9]' : 'border-[#1e1c1a]/20 hover:border-[#1e1c1a]/60'}`} {...rest}>{children}</button>
}
function Book() {
  const bk = useBooking()
  const [step, setStep] = useState(0)
  const [day, setDay] = useState(''), [time, setTime] = useState(''), [note, setNote] = useState('')
  const [err, setErr] = useState('')
  const head = useRef(null)
  useEffect(() => { if (step) head.current?.focus() }, [step])
  const next = e => {
    e.preventDefault()
    if (step === 0 && !bk.s.svc) return setErr('Выберите направление — или «Консультация»')
    if (step === 1 && !day) return setErr('Выберите удобные дни')
    setErr('')
    if (step < 2) setStep(step + 1); else bk.submit()
  }
  const custom = bk.s.svc && !BSV.includes(bk.s.svc)
  const titles = ['С чего начнём?', 'Когда вам удобно?', 'Оставьте контакт']
  return (
    <section id="book" className="px-5 py-28 md:px-12 md:py-40" style={{ background: '#ece4da' }}>
      <div className="mx-auto grid max-w-[1400px] gap-14 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <p className={`${LABEL} mb-6 text-[#9c7a5b]`}>Запись</p>
          <h2 className={`${SERIF} text-[clamp(44px,6vw,100px)] font-light leading-[.95] tracking-[-0.035em]`}>Начните<br /><em className="text-[#9c7a5b]">с консультации</em></h2>
          <p className="mt-6 max-w-[380px] text-[16px] leading-relaxed text-[#1e1c1a]/60">Три коротких шага. Мы перезвоним и подберём время. Или позвоните сами:</p>
          <a href={'tel:' + tel(b.phone)} className={`${SERIF} mt-3 inline-block text-[30px] font-light hover:text-[#9c7a5b]`}>{b.phone}</a>
        </div>
        <div className="border border-[#1e1c1a]/12 bg-[#f8f5f0] p-6 md:p-10">
          {bk.s.sent ? (
            <div className="py-10 text-center" role="status">
              <CheckDraw className="mx-auto text-[#9c7a5b]" />
              <p className={`${SERIF} mt-6 text-[38px] font-light`}>Спасибо{bk.s.name ? ', ' + bk.s.name : ''}</p>
              <p className="mx-auto mt-3 max-w-[380px] text-[#1e1c1a]/60">Мы свяжемся с вами, чтобы подтвердить время. В готовом сайте заявка сразу придёт вам в Telegram.</p>
              <button type="button" onClick={() => { bk.reset(); setStep(0); setDay(''); setTime(''); setNote('') }} className="mt-8 text-[14px] text-[#1e1c1a]/55 underline underline-offset-4">Новая заявка</button>
            </div>
          ) : (
            <form onSubmit={next} noValidate>
              <div className="mb-8 flex items-center gap-4">
                {[0, 1, 2].map(i => <span key={i} className={`${SERIF} text-[15px] italic transition-colors ${i === step ? 'text-[#1e1c1a]' : i < step ? 'text-[#9c7a5b]' : 'text-[#1e1c1a]/30'}`}>{['I', 'II', 'III'][i]}</span>)}
                <div className="h-px flex-1 bg-[#1e1c1a]/12"><motion.div className="h-px bg-[#9c7a5b]" animate={{ width: ((step + 1) / 3) * 100 + '%' }} transition={{ duration: 0.6 }} /></div>
              </div>
              <h3 ref={head} tabIndex={-1} className={`${SERIF} mb-7 text-[32px] font-light outline-none`}>{titles[step]}</h3>
              <AnimatePresence mode="wait">
                <motion.div key={step} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35 }}>
                  {step === 0 && <div className="flex flex-wrap gap-2.5">{custom && <Opt on>{bk.s.svc}</Opt>}{BSV.map(s => <Opt key={s} on={bk.s.svc === s} onClick={() => { bk.upd('svc', s); setErr('') }}>{s}</Opt>)}</div>}
                  {step === 1 && (<>
                    <div className="flex flex-wrap gap-2.5">{DAYS.map(d => <Opt key={d} on={day === d} onClick={() => { setDay(d); setErr('') }}>{d}</Opt>)}</div>
                    <p className={`${LABEL} mb-3 mt-7 text-[#1e1c1a]/45`}>Время</p>
                    <div className="flex flex-wrap gap-2.5">{TIMES.map(t => <Opt key={t} on={time === t} onClick={() => setTime(t)}>{t}</Opt>)}</div>
                  </>)}
                  {step === 2 && (<div className="space-y-5">
                    <label className="block"><span className={`${LABEL} mb-2 block text-[#1e1c1a]/45`}>Имя</span>
                      <input value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} autoComplete="name" className="w-full border-b border-[#1e1c1a]/25 bg-transparent py-3 text-[17px] outline-none focus:border-[#9c7a5b]" /></label>
                    <label className="block"><span className={`${LABEL} mb-2 block text-[#1e1c1a]/45`}>Телефон</span>
                      <input value={bk.s.phone} onChange={e => bk.upd('phone', e.target.value)} onFocus={phoneFocus(bk)} type="tel" inputMode="tel" autoComplete="tel" placeholder="+375 __ ___-__-__" aria-invalid={bk.s.err}
                        className={`w-full border-b bg-transparent py-3 text-[17px] outline-none focus:border-[#9c7a5b] ${bk.s.err ? 'border-[#b0563a]' : 'border-[#1e1c1a]/25'}`} /></label>
                    {bk.s.err && <p className="text-[14px] text-[#b0563a]">Проверьте номер — 12 цифр с кодом +375.</p>}
                    <label className="block"><span className={`${LABEL} mb-2 block text-[#1e1c1a]/45`}>Что беспокоит (необязательно)</span>
                      <input value={note} onChange={e => setNote(e.target.value)} className="w-full border-b border-[#1e1c1a]/25 bg-transparent py-3 text-[17px] outline-none focus:border-[#9c7a5b]" /></label>
                  </div>)}
                </motion.div>
              </AnimatePresence>
              {err && <p className="mt-4 text-[14px] text-[#b0563a]" role="alert">{err}</p>}
              <div className="mt-10 flex items-center justify-between">
                {step > 0 ? <button type="button" onClick={() => setStep(step - 1)} className="text-[14px] text-[#1e1c1a]/55 hover:text-[#1e1c1a]">← Назад</button> : <span />}
                <button type="submit" disabled={bk.s.loading} className="inline-flex h-13 items-center gap-3 bg-[#1e1c1a] px-8 py-4 text-[15px] font-medium text-[#f3efe9] transition-colors hover:bg-[#9c7a5b] disabled:opacity-60">{step < 2 ? 'Дальше' : bk.s.loading ? 'Отправляем…' : 'Записаться'} <ArrowRight size={16} /></button>
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
      <div className="mx-auto grid max-w-[1400px] gap-10 lg:grid-cols-[1fr_1.3fr]">
        <div>
          <h2 className={`${SERIF} text-[clamp(40px,5vw,80px)] font-light leading-none tracking-[-0.03em]`}>Контакты</h2>
          <p className="mt-8 flex items-start gap-3 text-[18px]"><MapPin className="mt-1 shrink-0 text-[#9c7a5b]" size={20} /><span>{b.addr}, Минск<br /><span className="text-[#1e1c1a]/55">{b.floor}</span></span></p>
          <a href={'tel:' + tel(b.phone)} className="mt-5 flex items-center gap-3 text-[22px] hover:text-[#9c7a5b]"><Phone className="text-[#9c7a5b]" size={19} />{b.phone}</a>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={'tel:' + tel(b.phone)} className="inline-flex h-12 items-center gap-2 bg-[#1e1c1a] px-6 text-[14px] font-medium text-[#f3efe9]"><Phone size={16} />Позвонить</a>
            <a href={b.ig} target="_blank" rel="noopener" className="inline-flex h-12 items-center gap-2 border border-[#1e1c1a]/25 px-6 text-[14px] font-medium hover:border-[#1e1c1a]"><IG />Instagram</a>
          </div>
        </div>
        <div className="h-[380px] overflow-hidden border border-[#1e1c1a]/12 md:h-[460px]"><MapFrame oid={b.oid} className="grayscale-[.5]" /></div>
      </div>
    </section>
  )
}

function App() {
  useSmooth()
  const lite = useLite()
  return (
    <MotionConfig reducedMotion="user">
      <div className={`overflow-x-clip ${SANS}`} style={{ background: BASE, color: INK, '--sel': ACC, '--selc': BASE }}>
        <Ribbon name={b.name} bg={INK} fg={BASE} />
        <header className="sticky top-0 z-40 border-b border-[#1e1c1a]/10 bg-[#f3efe9]/70 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 md:px-12">
            <a href="#film" className={`${SERIF} text-[24px] font-light italic tracking-[-0.01em]`}>Lanaestet</a>
            <nav className="hidden gap-9 text-[14px] text-[#1e1c1a]/60 md:flex">{[['#compare', 'Сравнить'], ['#about', 'О кабинете'], ['#services', 'Направления'], ['#contact', 'Контакты']].map(([h, t]) => <a key={h} href={h} className="hover:text-[#1e1c1a]">{t}</a>)}</nav>
            <a href="#book" className="hidden h-10 items-center border border-[#1e1c1a] px-5 text-[14px] font-medium transition-colors hover:bg-[#1e1c1a] hover:text-[#f3efe9] sm:inline-flex">Записаться</a>
          </div>
        </header>
        <main>
          <Film lite={lite} />
          <Statement />
          <Compare />
          <Bento />
          <Directions />
          <Book />
          <Contact />
        </main>
        <footer className="border-t border-[#1e1c1a]/10 px-5 py-8 text-[13px] text-[#1e1c1a]/50 md:px-12" style={{ background: BASE }}>
          <div className="mx-auto flex max-w-[1400px] flex-wrap justify-between gap-4"><span>© 2026 {b.name} · Концепт сайта — Артём</span><span>{b.addr}, {b.floor}</span></div>
        </footer>
        <CallBar phone={b.phone} barCls="bg-[#f3efe9]/95 backdrop-blur border-t border-[#1e1c1a]/10" callCls="border border-[#1e1c1a]/30 text-[#1e1c1a]" bookCls="bg-[#1e1c1a] text-[#f3efe9]" />
        <div className="h-[72px] sm:hidden" style={{ background: BASE }} />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
