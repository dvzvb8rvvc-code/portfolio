import React, { useRef, useState, useEffect, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, useSpring, useMotionValueEvent, useInView, AnimatePresence, MotionConfig } from 'framer-motion'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import '../lib/base.css'
import { useSmooth, Ribbon, Reveal, useBooking, phoneFocus, CheckDraw, MapFrame, CallBar, tel, useLite } from '../lib/kit'

const Beam = lazy(() => import('./sunlight-beam'))

const b = { name: 'Sunlight', addr: 'Московская ул., 20', floor: 'этаж 3', city: 'Минск', phone: '+375 29 125-23-66', rating: '4,9', rev: 52, oid: '1103685550' }
const PAPER = '#f1efe9', INK = '#0b0b0b', ACC = '#ff5b14'
const F = "font-['Archivo',sans-serif]"
const W = v => ({ fontVariationSettings: `'wdth' ${v}` })
const EZ = [0.76, 0, 0.24, 1]

/* swiss label */
function L({ children, className = '' }) {
  return <p className={'text-[11px] font-semibold uppercase leading-[1.35] tracking-[.06em] ' + className}>{children}</p>
}
/* text mask reveal by line */
function Mask({ children, delay = 0, className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -5% 0px' })
  return (
    <span ref={ref} className={'block overflow-hidden ' + className}>
      <motion.span className="block" initial={{ y: '102%' }} animate={inView ? { y: '0%' } : {}} transition={{ duration: 1, ease: EZ, delay }}>{children}</motion.span>
    </span>
  )
}
/* faint 12-col grid lines */
function Grid() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[1] mx-auto grid max-w-[1440px] grid-cols-4 gap-4 px-4 md:grid-cols-12 md:gap-5 md:px-8">
      {Array.from({ length: 12 }).map((_, i) => <div key={i} className={`border-x border-[#0b0b0b]/[.035] ${i > 3 ? 'hidden md:block' : ''}`} />)}
    </div>
  )
}

/* ---------------- hero ---------------- */
function Hero() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const wd = useTransform(scrollYProgress, [0, 1], [112, 62])
  const fvs = useTransform(wd, v => `'wdth' ${v}`)
  const y2 = useTransform(scrollYProgress, [0, 1], ['0%', '-18%'])
  return (
    <section ref={ref} id="top" className="relative z-[2] px-4 pb-16 pt-6 md:px-8 md:pb-24">
      <div className="mx-auto grid max-w-[1440px] grid-cols-4 gap-4 border-t-2 border-[#0b0b0b] pt-3 md:grid-cols-12 md:gap-5">
        <L className="col-span-2 md:col-span-3">(01)<br />Студия загара</L>
        <L className="col-span-2 md:col-span-3">{b.addr}<br />{b.floor}, {b.city}</L>
        <L className="col-span-2 hidden md:col-span-3 md:block">Яндекс Карты<br />{b.rating} · {b.rev} оценки</L>
        <L className="col-span-2 hidden text-right md:col-span-3 md:block"><a href={'tel:' + tel(b.phone)}>{b.phone}</a><br />Запись по телефону</L>
      </div>
      <h1 className="mx-auto mt-6 max-w-[1440px] select-none font-black uppercase leading-[.8] tracking-[-0.045em]" aria-label="Sunlight — студия загара">
        <span className="block overflow-hidden">
          <motion.span className="block text-[clamp(84px,25vw,380px)]" initial={{ y: '100%', fontVariationSettings: "'wdth' 62" }} animate={{ y: '0%', fontVariationSettings: "'wdth' 112" }} transition={{ y: { duration: 1.1, ease: EZ }, fontVariationSettings: { duration: 1.6, ease: EZ, delay: 0.5 } }}>
            <motion.span className="block" style={{ fontVariationSettings: fvs }}>Sun</motion.span>
          </motion.span>
        </span>
        <span className="block overflow-hidden">
          <motion.span className="block text-right text-[clamp(84px,25vw,380px)]" initial={{ y: '100%' }} animate={{ y: '0%' }} transition={{ duration: 1.1, ease: EZ, delay: 0.12 }}>
            <motion.span className="inline-block" style={{ y: y2, ...W(100) }}>light<span style={{ color: ACC }}>.</span></motion.span>
          </motion.span>
        </span>
      </h1>
      <div className="mx-auto mt-10 grid max-w-[1440px] grid-cols-4 gap-4 md:mt-14 md:grid-cols-12 md:gap-5">
        <div className="col-span-4 md:col-span-5 md:col-start-1">
          <p className="text-[clamp(26px,2.8vw,42px)] font-extrabold leading-[1.02] tracking-[-0.03em]">
            <Mask delay={0.6}>Свет, который</Mask><Mask delay={0.7}>ложится ровно.</Mask>
          </p>
        </div>
        <div className="col-span-4 md:col-span-4 md:col-start-7">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 0.8 }} className="text-[16px] leading-[1.45] text-[#0b0b0b]/70">Студия загара в центре Минска. Московская, 20 — третий этаж. Короткие сеансы, спокойный ритм, ровный тон.</motion.p>
        </div>
        <div className="col-span-4 flex items-end gap-3 md:col-span-2 md:col-start-11 md:justify-end">
          <a href="#choose" className="group inline-flex h-12 w-full items-center justify-between gap-3 bg-[#0b0b0b] px-4 text-[14px] font-bold uppercase tracking-[.02em] text-[#f1efe9] md:w-auto">Подобрать <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></a>
        </div>
      </div>
    </section>
  )
}

/* ---------------- pinned typographic film ---------------- */
const STEPS = [
  { t: 'Подготовка', d: 'Чистая кожа, без косметики и парфюма. Очки для глаз и бальзам для губ — обязательно.', col: 9 },
  { t: 'Сеанс', d: 'Первый — короткий. Время подскажет администратор, дальше прибавляем постепенно.', col: 1 },
  { t: 'Пауза', d: 'Между сеансами коже нужен отдых. Не каждый день — так загар ложится ровнее.', col: 9 },
  { t: 'Тон', d: 'Оттенок проявляется постепенно. Увлажняйте кожу — и цвет держится дольше.', col: 1 },
]
function Film() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const [i, setI] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', v => setI(Math.min(3, Math.max(0, Math.floor(v * 4.0001)))))
  const bar = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })
  const s = STEPS[i]
  return (
    <section ref={ref} id="steps" className="relative z-[2] h-[420vh] bg-[#0b0b0b] text-[#f1efe9]">
      <div className="sticky top-0 flex h-[100svh] flex-col overflow-hidden px-4 pb-24 pt-20 md:px-8 md:pb-10 md:pt-24">
        <div className="mx-auto grid w-full max-w-[1440px] grid-cols-4 gap-4 border-t border-[#f1efe9]/30 pt-3 md:grid-cols-12 md:gap-5">
          <L className="col-span-2 md:col-span-3">(02)<br />Сеанс в четыре шага</L>
          <div className="col-span-2 flex items-start justify-end gap-1.5 md:col-span-9">
            {STEPS.map((x, k) => <span key={k} className={`h-[3px] w-8 transition-colors duration-500 md:w-14 ${k <= i ? 'bg-[#ff5b14]' : 'bg-[#f1efe9]/20'}`} />)}
          </div>
        </div>
        <div className="relative mx-auto mt-auto grid w-full max-w-[1440px] grid-cols-4 items-end gap-4 md:grid-cols-12 md:gap-5">
          <div className="relative col-span-4 h-[clamp(160px,30vw,440px)] overflow-hidden md:col-span-12">
            <AnimatePresence initial={false}>
              <motion.p key={i} initial={{ y: '100%' }} animate={{ y: '0%' }} exit={{ y: '-100%' }} transition={{ duration: 0.8, ease: EZ }}
                className={`absolute bottom-0 font-black leading-[.78] tracking-[-0.06em] text-[clamp(200px,38vw,560px)] ${i % 2 ? "md:right-0" : "left-0"}`} style={W(i % 2 ? 62 : 100)}>
                0{i + 1}
              </motion.p>
            </AnimatePresence>
          </div>
          <motion.div layout transition={{ duration: 0.8, ease: EZ }} className="col-span-4 md:col-span-4 md:absolute md:bottom-[4%]" style={{ left: `calc(${(s.col - 1) / 12 * 100}% )` }}>
            <AnimatePresence mode="wait">
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.45 }} className="pt-4 md:pt-0">
                <p className="text-[clamp(34px,4vw,60px)] font-black uppercase leading-[.9] tracking-[-0.04em]" style={{ color: ACC }}>{s.t}</p>
                <p className="mt-3 max-w-[380px] text-[16px] leading-[1.45] text-[#f1efe9]/75">{s.d}</p>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
        <motion.div style={{ scaleX: bar }} className="absolute inset-x-0 bottom-0 h-[6px] origin-left bg-[#ff5b14]" />
      </div>
    </section>
  )
}

/* ---------------- index of services ---------------- */
const SV = [
  ['Разовый сеанс', 'Чтобы освежить тон или попробовать.'],
  ['Абонемент', 'Для регулярного загара в своём ритме.'],
  ['Подбор времени сеанса', 'Подскажем, с чего начать именно вам.'],
  ['Консультация', 'Ответим на вопросы по телефону.'],
]
function Row({ t, d, i }) {
  return (
    <a href="#book" data-svc={t} className="group relative grid grid-cols-4 items-baseline gap-4 overflow-hidden border-b border-[#0b0b0b] py-5 md:grid-cols-12 md:gap-5 md:py-7">
      <span className="absolute inset-0 origin-bottom scale-y-0 bg-[#ff5b14] transition-transform duration-500 ease-[cubic-bezier(.76,0,.24,1)] group-hover:scale-y-100" />
      <span className="relative col-span-1 text-[13px] font-semibold">0{i + 1}</span>
      <span className="relative col-span-3 text-[clamp(28px,4.4vw,68px)] font-black uppercase leading-[.9] tracking-[-0.04em] transition-[font-variation-settings] duration-500 md:col-span-7" style={W(100)}>{t}</span>
      <span className="relative col-span-3 col-start-2 text-[15px] text-[#0b0b0b]/70 group-hover:text-[#0b0b0b] md:col-span-3 md:col-start-9">{d}</span>
      <ArrowUpRight className="relative col-span-1 hidden justify-self-end transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 md:block" size={28} />
    </a>
  )
}
function Index() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 20%'] })
  const fvs = useTransform(scrollYProgress, [0, 1], ["'wdth' 125", "'wdth' 62"])
  return (
    <section ref={ref} id="services" className="relative z-[2] px-4 py-24 md:px-8 md:py-36">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid grid-cols-4 gap-4 border-t-2 border-[#0b0b0b] pt-3 md:grid-cols-12 md:gap-5">
          <L className="col-span-2 md:col-span-3">(03)<br />Что у нас есть</L>
        </div>
        <motion.h2 style={{ fontVariationSettings: fvs }} className="mt-6 whitespace-nowrap text-[clamp(64px,15vw,230px)] font-black uppercase leading-[.82] tracking-[-0.05em]">Индекс</motion.h2>
        <div className="mt-10 border-t border-[#0b0b0b]">{SV.map(([t, d], i) => <Row key={t} t={t} d={d} i={i} />)}</div>
      </div>
    </section>
  )
}

/* ---------------- value: subscription or single ---------------- */
const Q1 = ['Один раз — к событию', 'Иногда, по настроению', 'Регулярно']
const Q2 = ['Лёгкий оттенок', 'Заметный загар', 'Держать цвет']
function pick(a, c) {
  if (a === 2 || (a === 1 && c > 0)) return {
    k: 'Абонемент', tag: 'Регулярно', why: a === 2 ? 'Вы планируете приходить постоянно — абонемент удобнее, чем каждый раз записываться заново.' : 'Чтобы цвет набирался и держался, сеансы нужны с паузами, но регулярно.',
    pts: ['Свой ритм сеансов с паузами', 'Не нужно думать о каждом визите', 'Администратор подскажет, как распределить сеансы'],
  }
  return {
    k: 'Разовый', tag: 'По случаю', why: a === 0 ? 'Для одного события достаточно разового визита — без обязательств.' : 'Для лёгкого оттенка время от времени разовый сеанс — то, что нужно.',
    pts: ['Без обязательств', 'Короткий сеанс — для старта', 'Можно перейти на абонемент позже'],
  }
}
function Opt({ on, n, children, ...rest }) {
  return (
    <button type="button" aria-pressed={on} className={`group flex w-full items-baseline gap-4 border-b border-[#0b0b0b] py-4 text-left transition-colors ${on ? 'text-[#ff5b14]' : 'hover:text-[#0b0b0b]/60'}`} {...rest}>
      <span className="w-6 shrink-0 text-[12px] font-semibold">{n}</span>
      <span className="text-[clamp(22px,2.4vw,34px)] font-extrabold leading-[1] tracking-[-0.03em]">{children}</span>
      <span className={`ml-auto h-4 w-4 shrink-0 self-center rounded-full border-2 border-current ${on ? 'bg-[#ff5b14]' : ''}`} />
    </button>
  )
}
function Choose() {
  const [a, setA] = useState(null), [c, setC] = useState(null)
  const r = a !== null && c !== null ? pick(a, c) : null
  return (
    <section id="choose" className="relative z-[2] bg-[#e6e2d8] px-4 py-24 md:px-8 md:py-36">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid grid-cols-4 gap-4 border-t-2 border-[#0b0b0b] pt-3 md:grid-cols-12 md:gap-5">
          <L className="col-span-2 md:col-span-3">(04)<br />Два вопроса</L>
          <L className="col-span-2 md:col-span-3 md:col-start-10">Без цен — стоимость<br />уточнит администратор</L>
        </div>
        <h2 className="mt-6 text-[clamp(52px,9vw,150px)] font-black uppercase leading-[.84] tracking-[-0.05em]"><Mask>Абонемент</Mask><Mask delay={0.08}><span className="text-[#0b0b0b]/25">или</span> разовый?</Mask></h2>
        <div className="mt-14 grid grid-cols-4 gap-x-4 gap-y-12 md:grid-cols-12 md:gap-x-5">
          <div className="col-span-4 md:col-span-4">
            <L>Вопрос 1 — Как часто планируете загорать?</L>
            <div className="mt-3 border-t border-[#0b0b0b]">{Q1.map((q, i) => <Opt key={q} n={'A' + (i + 1)} on={a === i} onClick={() => setA(i)}>{q}</Opt>)}</div>
          </div>
          <div className="col-span-4 md:col-span-4">
            <L>Вопрос 2 — Какой результат хотите?</L>
            <div className="mt-3 border-t border-[#0b0b0b]">{Q2.map((q, i) => <Opt key={q} n={'B' + (i + 1)} on={c === i} onClick={() => setC(i)}>{q}</Opt>)}</div>
          </div>
          <div className="col-span-4 md:col-span-4">
            <div className="relative min-h-[420px] overflow-hidden bg-[#0b0b0b] p-6 text-[#f1efe9] md:p-7">
              <AnimatePresence mode="wait">
                {r ? (
                  <motion.div key={r.k} initial={{ clipPath: 'inset(0 0 100% 0)' }} animate={{ clipPath: 'inset(0 0 0% 0)' }} exit={{ opacity: 0 }} transition={{ duration: 0.7, ease: EZ }} className="flex min-h-[372px] flex-col">
                    <L className="text-[#ff5b14]">Рекомендация · {r.tag}</L>
                    <p className="mt-4 text-[clamp(44px,4.6vw,72px)] font-black uppercase leading-[.85] tracking-[-0.05em]" style={W(r.k === 'Абонемент' ? 75 : 100)}>{r.k}</p>
                    <p className="mt-4 text-[15px] leading-[1.45] text-[#f1efe9]/75">{r.why}</p>
                    <ul className="mt-4 space-y-1.5 text-[14px]">{r.pts.map(x => <li key={x} className="flex gap-2"><span className="mt-[7px] h-1.5 w-1.5 shrink-0 bg-[#ff5b14]" />{x}</li>)}</ul>
                    <a href="#book" data-svc={r.k === 'Абонемент' ? 'Абонемент' : 'Разовый сеанс'} className="group mt-auto inline-flex h-12 items-center justify-between bg-[#ff5b14] px-4 pt-0 text-[14px] font-bold uppercase text-[#0b0b0b] max-md:mt-6">Записаться <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></a>
                  </motion.div>
                ) : (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex min-h-[372px] flex-col">
                    <L className="text-[#f1efe9]/50">Рекомендация</L>
                    <p className="mt-auto text-[clamp(120px,12vw,190px)] font-black leading-[.8] tracking-[-0.06em] text-[#f1efe9]/15">{(a !== null) + (c !== null)}/2</p>
                    <p className="mt-4 text-[15px] text-[#f1efe9]/60">Ответьте на оба вопроса — и мы предложим формат.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- facts poster (bento) ---------------- */
function Facts() {
  return (
    <section id="facts" className="relative z-[2] px-4 py-24 md:px-8 md:py-36">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid grid-cols-4 gap-4 border-t-2 border-[#0b0b0b] pt-3 md:grid-cols-12 md:gap-5"><L className="col-span-2 md:col-span-3">(05)<br />В цифрах</L></div>
        <div className="mt-6 grid grid-cols-4 gap-4 md:grid-cols-12 md:gap-5">
          <Reveal className="col-span-4 flex min-h-[360px] flex-col justify-between bg-[#ff5b14] p-5 md:col-span-7 md:row-span-2 md:min-h-[560px] md:p-7">
            <L>Рейтинг на Яндекс Картах</L>
            <p className="font-black leading-[.78] tracking-[-0.07em] text-[clamp(160px,26vw,400px)]">{b.rating}</p>
          </Reveal>
          <Reveal className="col-span-2 flex min-h-[260px] flex-col justify-between border-2 border-[#0b0b0b] p-5 md:col-span-5 md:p-7">
            <L>Оценок от гостей</L>
            <p className="font-black leading-[.8] tracking-[-0.06em] text-[clamp(90px,12vw,190px)]" style={W(62)}>{b.rev}</p>
          </Reveal>
          <Reveal className="col-span-2 flex min-h-[260px] flex-col justify-between bg-[#0b0b0b] p-5 text-[#f1efe9] md:col-span-3 md:p-7">
            <L>Московская ул.</L>
            <p className="font-black leading-[.8] tracking-[-0.06em] text-[clamp(90px,10vw,170px)]">20</p>
          </Reveal>
          <Reveal className="col-span-4 flex min-h-[200px] flex-col justify-between border-2 border-[#0b0b0b] p-5 md:col-span-2 md:p-7">
            <L>Этаж</L>
            <p className="font-black leading-[.8] tracking-[-0.06em] text-[clamp(90px,10vw,170px)] md:text-right">3</p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

/* ---------------- booking ---------------- */
const BSV = ['Разовый сеанс', 'Абонемент', 'Консультация']
const DAYS = ['Сегодня', 'Завтра', 'На неделе', 'Подберите сами']
const TIMES = ['Утро', 'День', 'Вечер']
function Pill({ on, children, ...rest }) {
  return <button type="button" aria-pressed={on} className={`h-12 border-2 border-[#0b0b0b] px-4 text-[14px] font-bold uppercase tracking-[.02em] transition-colors ${on ? 'bg-[#0b0b0b] text-[#f1efe9]' : 'hover:bg-[#0b0b0b]/[.06]'}`} {...rest}>{children}</button>
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
    if (step === 0 && !bk.s.svc) return setErr('Выберите формат')
    if (step === 1 && !day) return setErr('Выберите, когда удобно')
    setErr('')
    if (step < 2) setStep(step + 1); else bk.submit()
  }
  const titles = ['Формат', 'Когда', 'Контакт']
  return (
    <section id="book" className="relative z-[2] px-4 py-24 md:px-8 md:py-36">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid grid-cols-4 gap-4 border-t-2 border-[#0b0b0b] pt-3 md:grid-cols-12 md:gap-5"><L className="col-span-2 md:col-span-3">(06)<br />Запись</L></div>
        <div className="mt-6 grid grid-cols-4 gap-x-4 gap-y-10 md:grid-cols-12 md:gap-x-5">
          <div className="col-span-4 md:col-span-5">
            <h2 className="text-[clamp(56px,8vw,128px)] font-black uppercase leading-[.84] tracking-[-0.05em]"><Mask>Запи–</Mask><Mask delay={0.08}>сать<span style={{ color: ACC }}>ся.</span></Mask></h2>
            <p className="mt-6 max-w-[360px] text-[16px] leading-[1.45] text-[#0b0b0b]/70">Оставьте заявку — администратор перезвонит и подтвердит время. Или позвоните сразу:</p>
            <a href={'tel:' + tel(b.phone)} className="mt-2 inline-block text-[clamp(24px,2.4vw,34px)] font-extrabold tracking-[-0.03em] hover:text-[#ff5b14]">{b.phone}</a>
          </div>
          <div className="col-span-4 md:col-span-6 md:col-start-7">
            {bk.s.sent ? (
              <div className="border-t-2 border-[#0b0b0b] py-10" role="status">
                <CheckDraw className="text-[#ff5b14]" />
                <p className="mt-6 text-[40px] font-black uppercase leading-[.9] tracking-[-0.04em]">Заявка<br />отправлена</p>
                <p className="mt-4 max-w-[420px] text-[#0b0b0b]/70">Перезвоним, чтобы подтвердить время. В готовом сайте заявка сразу придёт вам в Telegram.</p>
                <button type="button" onClick={() => { bk.reset(); setStep(0); setDay(''); setTime('') }} className="mt-8 text-[13px] font-bold uppercase underline underline-offset-4">Новая заявка</button>
              </div>
            ) : (
              <form onSubmit={next} noValidate>
                <div className="grid grid-cols-3 border-t-2 border-[#0b0b0b]">
                  {titles.map((t, k) => (
                    <div key={t} className={`relative pt-3 ${k ? 'pl-3' : ''}`}>
                      <motion.span className="absolute -top-[2px] left-0 h-[4px] origin-left bg-[#ff5b14]" style={{ right: 0 }} animate={{ scaleX: step >= k ? 1 : 0 }} transition={{ duration: 0.6, ease: EZ }} />
                      <p className={`text-[44px] font-black leading-none tracking-[-0.05em] transition-colors md:text-[64px] ${step === k ? '' : 'text-[#0b0b0b]/20'}`}>0{k + 1}</p>
                      <L className={step === k ? '' : 'text-[#0b0b0b]/40'}>{t}</L>
                    </div>
                  ))}
                </div>
                <h3 ref={head} tabIndex={-1} className="sr-only">{titles[step]}</h3>
                <div className="mt-8 min-h-[190px]">
                  <AnimatePresence mode="wait">
                    <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.35, ease: EZ }}>
                      {step === 0 && <div className="flex flex-wrap gap-2">{BSV.map(s => <Pill key={s} on={bk.s.svc === s} onClick={() => { bk.upd('svc', s); setErr('') }}>{s}</Pill>)}{bk.s.svc && !BSV.includes(bk.s.svc) && <Pill on>{bk.s.svc}</Pill>}</div>}
                      {step === 1 && (<>
                        <div className="flex flex-wrap gap-2">{DAYS.map(d => <Pill key={d} on={day === d} onClick={() => { setDay(d); setErr('') }}>{d}</Pill>)}</div>
                        <L className="mb-2 mt-6 text-[#0b0b0b]/50">Время</L>
                        <div className="flex flex-wrap gap-2">{TIMES.map(t => <Pill key={t} on={time === t} onClick={() => setTime(t)}>{t}</Pill>)}</div>
                      </>)}
                      {step === 2 && (<div className="space-y-5">
                        <input value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} autoComplete="name" placeholder="Имя" aria-label="Имя" className="h-14 w-full border-b-2 border-[#0b0b0b] bg-transparent text-[22px] font-bold outline-none placeholder:text-[#0b0b0b]/30 focus:border-[#ff5b14]" />
                        <input value={bk.s.phone} onChange={e => bk.upd('phone', e.target.value)} onFocus={phoneFocus(bk)} type="tel" inputMode="tel" autoComplete="tel" placeholder="+375 __ ___-__-__" aria-label="Телефон" aria-invalid={bk.s.err}
                          className={`h-14 w-full border-b-2 bg-transparent text-[22px] font-bold outline-none placeholder:text-[#0b0b0b]/30 focus:border-[#ff5b14] ${bk.s.err ? 'border-[#d4220f]' : 'border-[#0b0b0b]'}`} />
                        {bk.s.err && <p className="text-[14px] font-semibold text-[#d4220f]">Проверьте номер — 12 цифр с кодом +375.</p>}
                      </div>)}
                    </motion.div>
                  </AnimatePresence>
                </div>
                {err && <p className="mt-2 text-[14px] font-semibold text-[#d4220f]" role="alert">{err}</p>}
                <div className="mt-8 flex items-center justify-between border-t border-[#0b0b0b] pt-5">
                  {step > 0 ? <button type="button" onClick={() => setStep(step - 1)} className="text-[13px] font-bold uppercase hover:text-[#ff5b14]">← Назад</button> : <span />}
                  <button type="submit" disabled={bk.s.loading} className="group inline-flex h-14 items-center gap-6 bg-[#0b0b0b] px-6 text-[14px] font-bold uppercase text-[#f1efe9] disabled:opacity-60">{step < 2 ? 'Дальше' : bk.s.loading ? 'Отправляем…' : 'Отправить'} <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function Contact() {
  return (
    <section id="contact" className="relative z-[2] px-4 pb-16 md:px-8">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid grid-cols-4 gap-4 border-t-2 border-[#0b0b0b] pt-3 md:grid-cols-12 md:gap-5"><L className="col-span-2 md:col-span-3">(07)<br />Адрес</L></div>
        <div className="mt-6 grid grid-cols-4 gap-4 md:grid-cols-12 md:gap-5">
          <div className="col-span-4 md:col-span-4">
            <p className="text-[clamp(40px,4.6vw,72px)] font-black uppercase leading-[.86] tracking-[-0.045em]">Москов–<br />ская, 20</p>
            <p className="mt-4 text-[18px] font-bold">{b.floor[0].toUpperCase() + b.floor.slice(1)} · {b.city}</p>
            <a href={'tel:' + tel(b.phone)} className="mt-8 block text-[clamp(24px,2.4vw,32px)] font-extrabold tracking-[-0.03em] hover:text-[#ff5b14]">{b.phone}</a>
            <L className="mt-2 text-[#0b0b0b]/55">Запись и вопросы — по телефону</L>
          </div>
          <div className="col-span-4 h-[380px] border-2 border-[#0b0b0b] grayscale-[.6] md:col-span-8 md:h-[480px]"><MapFrame oid={b.oid} /></div>
        </div>
      </div>
    </section>
  )
}

function App() {
  useSmooth()
  const lite = useLite()
  const [beam, setBeam] = useState(false)
  useEffect(() => { const t = setTimeout(() => setBeam(true), 300); return () => clearTimeout(t) }, [])
  return (
    <MotionConfig reducedMotion="user">
      <div className={`relative overflow-x-clip ${F}`} style={{ background: PAPER, color: INK, '--sel': ACC, '--selc': INK }}>
        <Ribbon name={b.name} bg={INK} fg={PAPER} />
        <Grid />
        {beam && !lite && <Suspense fallback={null}><Beam /></Suspense>}
        {lite && <div aria-hidden="true" className="pointer-events-none fixed -top-[20vh] left-1/2 z-[45] h-[140vh] w-[60vw] -translate-x-1/2 -rotate-12 mix-blend-multiply" style={{ background: 'linear-gradient(180deg,rgba(255,179,92,.55),transparent 85%)', clipPath: 'polygon(46% 0,54% 0,100% 100%,0 100%)' }} />}
        <header className="sticky top-0 z-50 bg-[#f1efe9]/90 px-4 backdrop-blur md:px-8">
          <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between border-b border-[#0b0b0b]">
            <a href="#top" className="text-[20px] font-black uppercase tracking-[-0.04em]" style={W(112)}>Sunlight<span style={{ color: ACC }}>.</span></a>
            <nav className="hidden gap-7 text-[12px] font-semibold uppercase tracking-[.04em] md:flex">{[['#steps', 'Шаги'], ['#services', 'Индекс'], ['#choose', 'Выбор'], ['#contact', 'Адрес']].map(([h, t]) => <a key={h} href={h} className="hover:text-[#ff5b14]">{t}</a>)}</nav>
            <a href="#book" className="hidden h-9 items-center bg-[#ff5b14] px-4 text-[12px] font-bold uppercase tracking-[.04em] sm:inline-flex">Записаться</a>
          </div>
        </header>
        <main>
          <Hero />
          <Film />
          <Index />
          <Choose />
          <Facts />
          <Book />
          <Contact />
        </main>
        <footer className="relative z-[2] px-4 pb-8 md:px-8">
          <div className="mx-auto grid max-w-[1440px] grid-cols-4 gap-4 border-t-2 border-[#0b0b0b] pt-3 md:grid-cols-12 md:gap-5">
            <L className="col-span-4 md:col-span-6">© 2026 {b.name} · Концепт сайта — Артём</L>
            <L className="col-span-4 md:col-span-6 md:text-right">{b.addr}, {b.floor}, {b.city}</L>
          </div>
        </footer>
        <CallBar phone={b.phone} barCls="bg-[#f1efe9] border-t-2 border-[#0b0b0b]" callCls="border-2 border-[#0b0b0b] text-[#0b0b0b] uppercase text-[14px]" bookCls="bg-[#ff5b14] text-[#0b0b0b] uppercase text-[14px]" />
        <div className="h-[72px] sm:hidden" />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
