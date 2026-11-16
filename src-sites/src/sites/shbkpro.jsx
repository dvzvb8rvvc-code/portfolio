import React, { useRef, useState, useEffect, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, useSpring, useInView, AnimatePresence, MotionConfig } from 'framer-motion'
import { ArrowRight, ArrowUpRight, Phone, MapPin, Star, Check, MessageCircle, Play, Pause, RotateCcw } from 'lucide-react'
import '../lib/base.css'
import { useSmooth, Ribbon, LineReveal, Reveal, useBooking, phoneFocus, CheckDraw, MapFrame, CallBar, tel, useLite, IG } from '../lib/kit'

const LiftScene = lazy(() => import('./shbkpro3d'))

const b = {
  name: 'Шбк Про', addr: 'ул. Фабрициуса, 8, корп. 12', city: 'Минск',
  phone: '+375 29 996-16-66', viber: 'https://viber.click/375299961666', ig: 'https://instagram.com/cto_shbk.pro',
  rating: '4,6', rev: 73, oid: '54819228107',
}
const BASE = '#0c0d0f', INK = '#f1f0ec', ACC = '#ff6a1a', CONC = '#e8e6e1'
const SANS = "font-['Inter_Tight',sans-serif]", MONO = "font-['JetBrains_Mono',monospace]"
const H2 = `${SANS} font-semibold tracking-[-0.045em] leading-[.95]`

const CH = [
  { k: 'Подвеска', n: '01', t: 'Стойки, рычаги, сайлентблоки.', d: 'Проверяем на подъёмнике: люфты и стуки видно снизу, а не на слух.', r: [0.26, 0.43] },
  { k: 'Тормоза', n: '02', t: 'Диски, колодки, суппорты.', d: 'Смотрим износ, трубки и шланги. Говорим, что срочно, а что подождёт.', r: [0.44, 0.61] },
  { k: 'Выхлоп', n: '03', t: 'Гофра, резонатор, глушитель.', d: 'Находим, где прогорело и что гремит на холостых.', r: [0.62, 0.79] },
  { k: 'Трансмиссия', n: '04', t: 'Коробка, приводы, ШРУСы.', d: 'Течи и порванные пыльники — первое, что видно снизу.', r: [0.8, 0.97] },
]

/* ---------------- pinned film ---------------- */
function Cap({ p, r, children, className = '' }) {
  const k = [r[0] - 0.005, r[0] + 0.03, r[1] - 0.04, r[1] - 0.012]
  const o = useTransform(p, k, [0, 1, 1, 0])
  const y = useTransform(p, k, [36, 0, 0, -36])
  return <motion.div style={{ opacity: o, y }} className={'pointer-events-none ' + className}>{children}</motion.div>
}
function RailItem({ p, c }) {
  const o = useTransform(p, [c.r[0] - 0.03, c.r[0], c.r[1], c.r[1] + 0.02], [0.35, 1, 1, 0.35])
  const w = useTransform(p, [c.r[0], c.r[1]], ['0%', '100%'])
  return (
    <motion.div style={{ opacity: o }} className="w-[150px]">
      <div className={`${MONO} flex justify-between text-[10px] uppercase tracking-[.18em]`}><span>{c.n}</span><span>{c.k}</span></div>
      <div className="mt-1.5 h-px bg-white/15"><motion.div style={{ width: w }} className="h-px bg-[#ff6a1a]" /></div>
    </motion.div>
  )
}
function LiteCar({ p }) {
  const y = useTransform(p, [0.04, 0.22], [0, -90])
  return (
    <div className="absolute inset-0 grid place-items-center md:pl-[30%]">
      <svg viewBox="-260 -200 520 300" className="w-[86%] max-w-[640px]" aria-hidden="true">
        <rect x="-12" y="-190" width="24" height="280" fill="#2a2d33" /><rect x="-6" y="-180" width="12" height="260" fill="#ff6a1a" opacity=".5" />
        <motion.g style={{ y }}>
          <path d="M-215 60 L-222 18 Q-224 -6 -195 -9 L-145 -13 L-62 -55 L38 -58 L112 -10 L195 0 Q226 4 226 30 L222 60 Z" fill="#d7d9dc" />
          <path d="M-130 -11 L-66 -48 L30 -50 L98 -13 Z" fill="#0c0d0f" />
          <circle cx="-135" cy="60" r="33" fill="#111" stroke="#9aa0a8" strokeWidth="10" /><circle cx="135" cy="60" r="33" fill="#111" stroke="#9aa0a8" strokeWidth="10" />
          <rect x="-110" y="62" width="220" height="5" fill="#ff6a1a" />
        </motion.g>
        <rect x="-260" y="94" width="520" height="2" fill="#2a2d33" />
      </svg>
    </div>
  )
}

function Film({ lite }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const p = useSpring(scrollYProgress, { stiffness: 110, damping: 26, mass: 0.35 })
  const near = useInView(ref, { margin: '300px 0px' })
  const [mounted, setMounted] = useState(false)
  useEffect(() => { if (near) setMounted(true) }, [near])
  const heroO = useTransform(p, [0, 0.09], [1, 0])
  const heroY = useTransform(p, [0, 0.09], [0, -60])
  const heroPE = useTransform(p, v => (v < 0.06 ? 'auto' : 'none'))
  const mm = useTransform(p, v => String(Math.round(Math.min(1, Math.max(0, (v - 0.04) / 0.18)) * 1750)).padStart(4, '0'))
  const hintO = useTransform(p, [0, 0.04], [1, 0])
  const railO = useTransform(p, [0.04, 0.1], [0, 1])
  return (
    <section ref={ref} id="film" className="relative h-[520vh]" style={{ background: BASE }}>
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="absolute inset-x-0 top-[40%] bottom-[16%] md:inset-0">
          {lite ? <LiteCar p={p} /> : mounted && <Suspense fallback={null}><LiftScene progress={p} active={near} /></Suspense>}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#0c0d0f] to-transparent md:hidden" />
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-[46%] bg-gradient-to-r from-[#0c0d0f] via-[#0c0d0f]/70 to-transparent md:block" />

        {/* hero */}
        <motion.div style={{ opacity: heroO, y: heroY, pointerEvents: heroPE }} className="absolute inset-x-0 top-[84px] px-5 md:top-1/2 md:-translate-y-1/2 md:px-12">
          <div className="max-w-[620px]">
            <p className={`${MONO} mb-5 text-[11px] uppercase tracking-[.24em] text-[#ff6a1a]`}>Автотехцентр · Фабрициуса, 8к12</p>
            <h1 className={`${SANS} text-[clamp(42px,7.4vw,112px)] font-semibold leading-[.9] tracking-[-0.055em]`}>
              <LineReveal delay={0.1}>Ремонт,</LineReveal>
              <LineReveal delay={0.22}>который <span className="text-[#ff6a1a]">видно.</span></LineReveal>
            </h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.8 }} className="mt-6 max-w-[440px] text-[16px] leading-relaxed text-white/65 md:text-[18px]">
              Сначала диагностика и понятный список работ. Ремонт — только после вашего «да».
            </motion.p>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 0.8 }} className="mt-8 hidden flex-wrap gap-3 md:flex">
              <a href="#book" className="inline-flex h-12 items-center gap-2 rounded-full bg-[#ff6a1a] px-6 text-[15px] font-semibold text-[#0c0d0f] transition-transform hover:-translate-y-0.5">Записаться на диагностику <ArrowRight size={17} /></a>
              <a href={'tel:' + tel(b.phone)} className="inline-flex h-12 items-center gap-2 rounded-full border border-white/20 px-6 text-[15px] font-semibold hover:border-white/60"><Phone size={16} />{b.phone}</a>
            </motion.div>
          </div>
        </motion.div>
        <motion.div style={{ opacity: hintO }} className={`${MONO} pointer-events-none absolute bottom-[8%] left-5 text-[11px] uppercase tracking-[.2em] text-white/45 md:bottom-10 md:left-12`}>
          Листайте — машина поднимается ↓
        </motion.div>

        {/* chapters */}
        {CH.map(c => (
          <Cap key={c.n} p={p} r={c.r} className="absolute inset-x-0 top-[84px] px-5 md:top-1/2 md:-translate-y-1/2 md:px-12">
            <div className="max-w-[520px]">
              <p className={`${MONO} mb-4 text-[11px] uppercase tracking-[.24em] text-[#ff6a1a]`}>{c.n} / 04 · {c.k}</p>
              <h2 className={`${H2} text-[clamp(34px,5.4vw,80px)]`}>{c.t}</h2>
              <p className="mt-4 max-w-[400px] text-[15px] leading-relaxed text-white/60 md:text-[18px]">{c.d}</p>
            </div>
          </Cap>
        ))}
        <Cap p={p} r={[0.955, 1.3]} className="absolute inset-x-0 top-[84px] px-5 md:top-1/2 md:-translate-y-1/2 md:px-12">
          <h2 className={`${H2} max-w-[560px] text-[clamp(34px,5.4vw,80px)]`}>Всё это вы увидите <span className="text-[#ff6a1a]">до</span> ремонта.</h2>
        </Cap>

        {/* instrument rail */}
        <motion.div style={{ opacity: railO }} className="pointer-events-none absolute bottom-8 right-12 hidden items-end gap-8 text-white/80 md:flex">
          {CH.map(c => <RailItem key={c.n} p={p} c={c} />)}
          <div className={`${MONO} text-right`}>
            <p className="text-[10px] uppercase tracking-[.18em] text-white/45">Подъём, мм</p>
            <motion.p className="text-[28px] tabular-nums leading-none text-[#ff6a1a]">{mm}</motion.p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ---------------- manifesto ---------------- */
const STEPS = [
  ['Смотрим', 'Подъёмник, компьютер, тест-драйв — по ситуации.'],
  ['Объясняем', 'Что нашли, почему это важно и что можно отложить.'],
  ['Согласуем', 'Список работ — до начала ремонта. Без сюрпризов.'],
  ['Ремонтируем', 'Только то, на что вы сказали «да».'],
]
function Manifesto() {
  return (
    <section className="relative px-5 pb-28 pt-10 md:px-12 md:pb-40" style={{ background: BASE }}>
      <div className="mx-auto max-w-[1320px]">
        <Reveal><p className={`${MONO} mb-8 text-[11px] uppercase tracking-[.24em] text-white/45`}>Как мы работаем</p></Reveal>
        <h2 className={`${H2} max-w-[1100px] text-[clamp(36px,6vw,96px)]`}>
          <Reveal as="span" className="block">Машина — не чёрный ящик.</Reveal>
          <Reveal as="span" delay={0.1} className="block text-white/35">И автосервис тоже.</Reveal>
        </h2>
        <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(([t, d], i) => (
            <Reveal key={t} delay={i * 0.08} className="bg-[#0c0d0f] p-7 md:p-8">
              <p className={`${MONO} text-[11px] text-[#ff6a1a]`}>0{i + 1}</p>
              <h3 className={`${SANS} mt-10 text-[26px] font-semibold tracking-[-0.03em]`}>{t}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-white/55">{d}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------- repair tracker (value interaction) ---------------- */
const STAGES = ['Приёмка', 'Диагностика', 'Согласование', 'Ремонт', 'Готово']
const DIAG = [['Подвеска', 'нужно внимание', 2], ['Тормоза', 'износ колодок', 2], ['Выхлоп', 'норма', 0], ['Трансмиссия', 'пыльник ШРУСа', 1], ['Ошибки ЭБУ', 'нет', 0]]
const FOUND = [
  { id: 'sb', t: 'Сайлентблоки переднего рычага', s: 'Рекомендуем сейчас' },
  { id: 'pads', t: 'Передние тормозные колодки', s: 'Износ близок к пределу' },
  { id: 'boot', t: 'Пыльник наружного ШРУСа', s: 'Можно отложить' },
  { id: 'oil', t: 'Замена масла и фильтра', s: 'По регламенту' },
]
const DUR = 3800
function Row({ i, children }) {
  return <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.35, duration: 0.5 }}>{children}</motion.div>
}
function StagePanel({ stage, approved, toggle, approve }) {
  if (stage === 0) return (
    <div className="space-y-3">
      {['Пробег и уровень топлива записаны', 'Фото кузова при приёмке', 'Жалоба: стук спереди справа на неровностях'].map((t, i) => (
        <Row key={t} i={i}><div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3.5 text-[15px]"><Check size={16} className="text-[#ff6a1a]" />{t}</div></Row>
      ))}
    </div>
  )
  if (stage === 1) return (
    <div className="divide-y divide-black/10 rounded-xl bg-white px-4">
      {DIAG.map(([k, v, lvl], i) => (
        <Row key={k} i={i}><div className="flex items-center justify-between py-3.5 text-[15px]"><span>{k}</span>
          <span className={`${MONO} rounded-full px-2.5 py-1 text-[11px] uppercase tracking-[.08em] ${lvl === 2 ? 'bg-[#ff6a1a] text-[#0c0d0f]' : lvl === 1 ? 'bg-[#ff6a1a]/15 text-[#b5430a]' : 'bg-black/5 text-black/50'}`}>{v}</span></div></Row>
      ))}
    </div>
  )
  if (stage === 2) return (
    <div>
      <div className="space-y-2.5">
        {FOUND.map(f => {
          const on = approved.includes(f.id)
          return (
            <button key={f.id} type="button" onClick={() => toggle(f.id)} aria-pressed={on}
              className={`flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-left transition-colors ${on ? 'bg-[#0c0d0f] text-[#f1f0ec]' : 'bg-white text-[#0c0d0f] hover:bg-white/70'}`}>
              <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border ${on ? 'border-[#ff6a1a] bg-[#ff6a1a] text-[#0c0d0f]' : 'border-black/25'}`}>{on && <Check size={15} strokeWidth={3} />}</span>
              <span className="flex-1"><span className="block text-[15px] font-medium">{f.t}</span><span className={`text-[13px] ${on ? 'text-white/55' : 'text-black/50'}`}>{f.s}</span></span>
            </button>
          )
        })}
      </div>
      <button type="button" onClick={approve} disabled={!approved.length}
        className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#ff6a1a] text-[15px] font-semibold text-[#0c0d0f] disabled:opacity-40">
        Согласовать работы ({approved.length}) <ArrowRight size={16} />
      </button>
      <p className="mt-3 text-center text-[13px] text-black/50">Без вашего согласия ничего не меняем.</p>
    </div>
  )
  if (stage === 3) return (
    <div className="space-y-3">
      {FOUND.filter(f => approved.includes(f.id)).map((f, i) => (
        <div key={f.id} className="rounded-xl bg-white px-4 py-3.5">
          <div className="flex justify-between text-[15px]"><span>{f.t}</span></div>
          <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-black/10"><motion.div className="h-full rounded-full bg-[#ff6a1a]" initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 1.1, delay: i * 0.7, ease: 'easeInOut' }} /></div>
        </div>
      ))}
    </div>
  )
  return (
    <div className="rounded-xl bg-[#0c0d0f] p-6 text-[#f1f0ec]">
      <CheckDraw size={54} className="text-[#ff6a1a]" />
      <p className={`${SANS} mt-4 text-[30px] font-semibold tracking-[-0.03em]`}>Машина готова</p>
      <p className="mt-1 text-[15px] text-white/55">Выполнено: {approved.length} {approved.length === 1 ? 'работа' : approved.length < 5 ? 'работы' : 'работ'}. Можно забирать.</p>
      <a href="#book" data-svc="Диагностика ходовой" className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-[#ff6a1a] px-6 text-[15px] font-semibold text-[#0c0d0f]">Записаться на диагностику <ArrowRight size={16} /></a>
    </div>
  )
}
function Tracker() {
  const ref = useRef(null)
  const inView = useInView(ref, { amount: 0.35 })
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 25%'] })
  const clip = useTransform(scrollYProgress, [0, 1], ['inset(9% 5% 0% 5% round 48px)', 'inset(0% 0% 0% 0% round 0px)'])
  const [stage, setStage] = useState(0)
  const [auto, setAuto] = useState(true)
  const [approved, setApproved] = useState(['sb', 'pads'])
  useEffect(() => {
    if (!auto || !inView || stage === 2 || stage === 4) return
    const t = setTimeout(() => setStage(s => s + 1), DUR)
    return () => clearTimeout(t)
  }, [stage, auto, inView])
  const toggle = id => setApproved(a => (a.includes(id) ? a.filter(x => x !== id) : [...a, id]))
  const waiting = stage === 2
  const from = stage / 4, to = stage === 4 ? 1 : waiting ? stage / 4 : (stage + 0.85) / 4
  return (
    <motion.section ref={ref} id="tracker" style={{ clipPath: clip, background: CONC }} className="relative px-5 py-24 text-[#0c0d0f] md:px-12 md:py-36">
      <div className="mx-auto grid max-w-[1320px] gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className={`${MONO} mb-6 inline-flex items-center gap-2 rounded-full border border-black/15 px-3 py-1.5 text-[10.5px] uppercase tracking-[.18em]`}><span className="h-1.5 w-1.5 rounded-full bg-[#ff6a1a]" />Демо-функция для сайта</p>
          <h2 className={`${H2} text-[clamp(40px,6vw,92px)]`}>Где ваша<br />машина?</h2>
          <p className="mt-6 max-w-[440px] text-[17px] leading-relaxed text-black/60">Так мог бы работать трекер ремонта на вашем сайте: клиент видит этап, получает список найденного и согласует работы в одно касание — без звонков «ну что там».</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button type="button" onClick={() => setAuto(a => !a)} className="inline-flex h-11 items-center gap-2 rounded-full border border-black/20 px-5 text-[14px] font-medium hover:border-black/60">{auto ? <Pause size={15} /> : <Play size={15} />}{auto ? 'Пауза' : 'Продолжить'}</button>
            <button type="button" onClick={() => { setStage(0); setApproved(['sb', 'pads']); setAuto(true) }} className="inline-flex h-11 items-center gap-2 rounded-full border border-black/20 px-5 text-[14px] font-medium hover:border-black/60"><RotateCcw size={15} />Сначала</button>
          </div>
        </div>

        <div className="rounded-[28px] bg-[#d9d6cf] p-3 shadow-[0_40px_80px_-40px_rgba(0,0,0,.35)] md:p-4">
          <div className="rounded-[20px] bg-[#f4f3ef] p-5 md:p-7">
            <div className="flex items-center justify-between">
              <div>
                <p className={`${MONO} text-[10.5px] uppercase tracking-[.18em] text-black/45`}>Заказ-наряд · демо</p>
                <p className={`${SANS} mt-1 text-[20px] font-semibold tracking-[-0.02em]`}>Ваш автомобиль · 1234 AB-7</p>
              </div>
              <span className={`${MONO} rounded-full px-3 py-1.5 text-[11px] uppercase tracking-[.12em] ${stage === 4 ? 'bg-[#0c0d0f] text-[#ff6a1a]' : 'bg-[#ff6a1a] text-[#0c0d0f]'}`}>{STAGES[stage]}</span>
            </div>
            {/* live progress line */}
            <div className="relative mt-8 mb-9">
              <div className="absolute left-[10px] right-[10px] top-[9px] h-[2px] bg-black/10" />
              <div className="absolute left-[10px] right-[10px] top-[9px] h-[2px]">
                <motion.div key={stage} className="relative h-full bg-[#ff6a1a]" initial={{ width: from * 100 + '%' }} animate={{ width: to * 100 + '%' }} transition={{ duration: stage === 4 ? 0.6 : DUR / 1000, ease: 'linear' }}>
                  {stage < 4 && <span className="absolute -right-1.5 -top-[5px] h-3 w-3 rounded-full bg-[#ff6a1a] shadow-[0_0_0_6px_rgba(255,106,26,.2)]" />}
                </motion.div>
              </div>
              <div className="relative flex justify-between">
                {STAGES.map((s, i) => (
                  <button key={s} type="button" onClick={() => { setStage(i); setAuto(false) }} className="group flex w-5 flex-col items-center" aria-label={'Этап: ' + s}>
                    <span className={`grid h-5 w-5 place-items-center rounded-full border-2 transition-colors ${i < stage || stage === 4 ? 'border-[#ff6a1a] bg-[#ff6a1a]' : i === stage ? 'border-[#ff6a1a] bg-[#f4f3ef]' : 'border-black/20 bg-[#f4f3ef]'}`}>
                      {(i < stage || stage === 4) && <Check size={11} strokeWidth={3.5} className="text-[#0c0d0f]" />}
                    </span>
                    <span className={`${MONO} mt-2.5 whitespace-nowrap text-[9.5px] uppercase tracking-[.06em] md:text-[10.5px] ${i === stage ? 'text-black' : 'text-black/40'} ${i % 2 && i !== stage ? 'max-md:invisible' : ''}`}>{s}</span>
                  </button>
                ))}
              </div>
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={stage} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35 }} className="min-h-[330px]">
                {waiting && <p className="mb-3 flex items-center gap-2 text-[14px] font-medium text-[#b5430a]"><span className="h-2 w-2 animate-pulse rounded-full bg-[#ff6a1a]" />Ждём вашего решения</p>}
                <StagePanel stage={stage} approved={approved} toggle={toggle} approve={() => { setStage(3); setAuto(true) }} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.section>
  )
}

/* ---------------- bento ---------------- */
function Glow({ className = '', children, href, ...rest }) {
  const onMove = e => { const r = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty('--x', e.clientX - r.left + 'px'); e.currentTarget.style.setProperty('--y', e.clientY - r.top + 'px') }
  const Tag = href ? 'a' : 'div'
  return (
    <Reveal className={'group relative rounded-[24px] p-px ' + className} {...rest}>
      <div className="absolute inset-0 rounded-[24px] bg-white/10" />
      <div className="absolute inset-0 rounded-[24px] opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: 'radial-gradient(320px circle at var(--x,50%) var(--y,50%), #ff6a1a, transparent 65%)' }} />
      <Tag href={href} target={href && href.startsWith('http') ? '_blank' : undefined} rel="noopener" onPointerMove={onMove} className="relative flex h-full flex-col overflow-hidden rounded-[23px] bg-[#131418] p-6 md:p-7">{children}</Tag>
    </Reveal>
  )
}
function Wave() {
  return (
    <svg viewBox="0 0 400 90" className="mt-auto h-[90px] w-full" preserveAspectRatio="none" aria-hidden="true">
      {[20, 45, 70].map(y => <line key={y} x1="0" x2="400" y1={y} y2={y} stroke="#fff" strokeOpacity=".06" />)}
      <motion.path d="M0 45 L40 45 L52 20 L64 70 L76 45 L130 45 L142 30 L154 60 L166 45 L230 45 L242 12 L254 78 L266 45 L320 45 L332 28 L344 62 L356 45 L400 45" fill="none" stroke="#ff6a1a" strokeWidth="2"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: [0, 1, 1], opacity: [1, 1, 0] }} viewport={{ once: false }} transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }} />
    </svg>
  )
}
function MiniChecks() {
  return (
    <div className="mt-auto space-y-2">
      {['Диагностика', 'Список работ', 'Ваше «да»'].map((t, i) => (
        <div key={t} className="flex items-center gap-2.5 text-[14px] text-white/70">
          <motion.span className="grid h-5 w-5 place-items-center rounded-md bg-[#ff6a1a] text-[#0c0d0f]" initial={{ scale: 0 }} whileInView={{ scale: [0, 1, 1, 0] }} transition={{ duration: 4, times: [0, 0.15, 0.85, 1], delay: i * 0.5, repeat: Infinity, repeatDelay: 0.6 }}><Check size={13} strokeWidth={3.5} /></motion.span>{t}
        </div>
      ))}
    </div>
  )
}
function Bento() {
  return (
    <section id="why" className="px-5 py-28 md:px-12 md:py-36" style={{ background: BASE }}>
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <h2 className={`${H2} text-[clamp(40px,6vw,92px)]`}><Reveal as="span" className="block">Коротко</Reveal><Reveal as="span" delay={0.08} className="block text-white/35">о главном.</Reveal></h2>
          <p className="max-w-[360px] text-[16px] text-white/55">Цены и сроки — после диагностики, когда понятно, что именно нужно машине.</p>
        </div>
        <div className="grid auto-rows-[minmax(200px,auto)] gap-4 md:grid-cols-4">
          <Glow className="md:col-span-2 md:row-span-2">
            <p className={`${MONO} text-[11px] uppercase tracking-[.2em] text-white/45`}>Яндекс Карты</p>
            <p className={`${SANS} mt-auto text-[clamp(110px,14vw,200px)] font-semibold leading-[.8] tracking-[-0.06em]`}>{b.rating}</p>
            <div className="mt-6 flex gap-1.5">
              {[0, 1, 2, 3, 4].map(i => (
                <motion.span key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 + i * 0.1 }}>
                  <Star size={26} className="text-[#ff6a1a]" fill={i < 4 ? '#ff6a1a' : 'url(#half)'} />
                </motion.span>
              ))}
              <svg width="0" height="0"><defs><linearGradient id="half"><stop offset="60%" stopColor="#ff6a1a" /><stop offset="60%" stopColor="transparent" /></linearGradient></defs></svg>
            </div>
            <p className="mt-3 text-[16px] text-white/60">{b.rev} оценки клиентов на Яндекс Картах</p>
          </Glow>
          <Glow className="md:col-span-2">
            <p className={`${SANS} text-[24px] font-semibold tracking-[-0.03em]`}>Сначала диагностика</p>
            <p className="mt-1 max-w-[360px] text-[15px] text-white/55">Компьютерная и на подъёмнике — чтобы менять то, что действительно нужно.</p>
            <Wave />
          </Glow>
          <Glow>
            <p className={`${SANS} text-[22px] font-semibold tracking-[-0.03em]`}>Без сюрпризов</p>
            <p className="mb-6 mt-1 text-[14px] text-white/55">Работы — только после согласования.</p>
            <MiniChecks />
          </Glow>
          <Glow href={b.viber}>
            <MessageCircle className="text-[#ff6a1a]" />
            <p className={`${SANS} mt-auto text-[22px] font-semibold tracking-[-0.03em]`}>Viber</p>
            <p className="text-[14px] text-white/55">Скиньте вопрос или фото — ответим.</p>
            <ArrowUpRight className="absolute right-6 top-6 text-white/40 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" size={20} />
          </Glow>
          <Glow className="md:col-span-3">
            <div className="flex h-full flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <p className={`${MONO} text-[11px] uppercase tracking-[.2em] text-white/45`}>Адрес</p>
                <p className={`${SANS} mt-3 text-[clamp(30px,3.6vw,52px)] font-semibold leading-none tracking-[-0.04em]`}>Фабрициуса, 8к12</p>
                <p className="mt-2 text-[15px] text-white/55">Минск · звоните или пишите в Viber</p>
              </div>
              <svg viewBox="0 0 260 100" className="h-[100px] w-full max-w-[260px]" aria-hidden="true">
                <path d="M0 80 H70 V30 H160 V70 H230" fill="none" stroke="#fff" strokeOpacity=".12" strokeWidth="10" strokeLinejoin="round" />
                <motion.path d="M0 80 H70 V30 H160 V70 H230" fill="none" stroke="#ff6a1a" strokeWidth="2.5" strokeDasharray="6 7" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ duration: 2.2, ease: 'easeInOut' }} />
                <circle cx="230" cy="70" r="9" fill="#ff6a1a" /><circle cx="230" cy="70" r="3.5" fill="#0c0d0f" />
              </svg>
            </div>
          </Glow>
          <Glow href={b.ig}>
            <IG width={24} height={24} className="text-[#ff6a1a]" />
            <p className={`${SANS} mt-auto text-[22px] font-semibold tracking-[-0.03em]`}>Instagram</p>
            <p className="text-[14px] text-white/55">@cto_shbk.pro</p>
            <ArrowUpRight className="absolute right-6 top-6 text-white/40 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" size={20} />
          </Glow>
        </div>
      </div>
    </section>
  )
}

/* ---------------- services ---------------- */
const SV = [
  ['Диагностика', 'Компьютерная и на подъёмнике'], ['Ходовая часть', 'Подвеска, рулевое, сайлентблоки'], ['Тормозная система', 'Колодки, диски, суппорты, жидкость'],
  ['ТО и масло', 'Масло, фильтры, жидкости по регламенту'], ['Двигатель', 'Течи, ремни, навесное оборудование'], ['Выхлопная система', 'Гофры, глушители, крепления'],
  ['Трансмиссия', 'Сцепление, приводы, ШРУСы'], ['Автоэлектрика', 'Поиск неисправностей, датчики'],
]
function Services() {
  return (
    <section id="services" className="px-5 pb-28 md:px-12 md:pb-36" style={{ background: BASE }}>
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-10 flex items-end justify-between border-b border-white/10 pb-6">
          <h2 className={`${H2} text-[clamp(36px,4.6vw,68px)]`}>Услуги</h2>
          <p className={`${MONO} text-[11px] uppercase tracking-[.2em] text-white/45`}>{SV.length} направлений</p>
        </div>
        {SV.map(([t, d], i) => (
          <a key={t} href="#book" data-svc={t} className="group relative grid grid-cols-[40px_1fr_auto] items-center gap-4 overflow-hidden border-b border-white/10 py-6 md:grid-cols-[80px_1fr_1fr_auto] md:py-7">
            <span className="absolute inset-0 origin-bottom scale-y-0 bg-[#ff6a1a] transition-transform duration-500 ease-[cubic-bezier(.2,0,0,1)] group-hover:scale-y-100" />
            <span className={`${MONO} relative text-[12px] text-white/40 group-hover:text-[#0c0d0f]`}>{String(i + 1).padStart(2, '0')}</span>
            <span className={`${SANS} relative text-[clamp(22px,2.6vw,36px)] font-semibold tracking-[-0.035em] group-hover:text-[#0c0d0f]`}>{t}</span>
            <span className="relative hidden text-[15px] text-white/50 group-hover:text-[#0c0d0f]/75 md:block">{d}</span>
            <ArrowRight className="relative text-white/40 transition-transform group-hover:translate-x-1 group-hover:text-[#0c0d0f]" />
          </a>
        ))}
      </div>
    </section>
  )
}

/* ---------------- booking ---------------- */
const BSV = ['Диагностика', 'Ходовая', 'Тормоза', 'ТО и масло', 'Двигатель', 'Выхлоп', 'Трансмиссия', 'Другое']
const DAYS = ['Сегодня', 'Завтра', 'На этой неделе', 'Позже']
const TIMES = ['Утро', 'День', 'Вечер']
function Chip({ on, children, ...rest }) {
  return <button type="button" aria-pressed={on} className={`h-11 rounded-full border px-5 text-[14.5px] font-medium transition-colors ${on ? 'border-[#ff6a1a] bg-[#ff6a1a] text-[#0c0d0f]' : 'border-white/15 text-white/80 hover:border-white/50'}`} {...rest}>{children}</button>
}
function Book() {
  const bk = useBooking()
  const [step, setStep] = useState(0)
  const [car, setCar] = useState('')
  const [day, setDay] = useState('')
  const [time, setTime] = useState('')
  const [err, setErr] = useState('')
  const head = useRef(null)
  useEffect(() => { if (step) head.current?.focus() }, [step])
  const next = e => {
    e.preventDefault()
    if (step === 0 && !bk.s.svc) return setErr('Выберите, с чем приехать')
    if (step === 1 && !day) return setErr('Выберите удобный день')
    setErr('')
    if (step < 2) setStep(step + 1); else bk.submit()
  }
  const custom = bk.s.svc && !BSV.includes(bk.s.svc)
  const titles = ['Что с машиной?', 'Когда удобно?', 'Как с вами связаться?']
  return (
    <section id="book" className="px-5 py-28 md:px-12 md:py-36" style={{ background: '#111215' }}>
      <div className="mx-auto grid max-w-[1320px] gap-14 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className={`${MONO} mb-6 text-[11px] uppercase tracking-[.24em] text-[#ff6a1a]`}>Запись</p>
          <h2 className={`${H2} text-[clamp(40px,6vw,92px)]`}>Приезжайте<br /><span className="text-white/35">на диагностику.</span></h2>
          <p className="mt-6 max-w-[380px] text-[16px] text-white/55">Три шага — и мастер перезвонит, чтобы подтвердить время. Или сразу звоните:</p>
          <a href={'tel:' + tel(b.phone)} className={`${SANS} mt-3 inline-block text-[26px] font-semibold tracking-[-0.02em] hover:text-[#ff6a1a]`}>{b.phone}</a>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-[#0c0d0f] p-6 md:p-10">
          {bk.s.sent ? (
            <div className="py-10 text-center" role="status">
              <CheckDraw className="mx-auto text-[#ff6a1a]" />
              <p className={`${SANS} mt-6 text-[34px] font-semibold tracking-[-0.03em]`}>Заявка принята</p>
              <p className="mx-auto mt-3 max-w-[380px] text-white/60">{bk.s.name ? bk.s.name + ', мы' : 'Мы'} перезвоним, чтобы подтвердить время. В готовом сайте заявка сразу придёт вам в Telegram.</p>
              <button type="button" onClick={() => { bk.reset(); setStep(0); setDay(''); setTime(''); setCar('') }} className="mt-8 text-[14px] text-white/50 underline underline-offset-4 hover:text-white">Новая заявка</button>
            </div>
          ) : (
            <form onSubmit={next} noValidate>
              <div className="mb-8 flex gap-2">{[0, 1, 2].map(i => <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-white/10"><motion.div className="h-full bg-[#ff6a1a]" animate={{ width: i <= step ? '100%' : '0%' }} transition={{ duration: 0.5 }} /></div>)}</div>
              <p className={`${MONO} text-[11px] uppercase tracking-[.2em] text-white/40`}>Шаг {step + 1} из 3</p>
              <h3 ref={head} tabIndex={-1} className={`${SANS} mb-7 mt-2 text-[28px] font-semibold tracking-[-0.03em] outline-none`}>{titles[step]}</h3>
              <AnimatePresence mode="wait">
                <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3 }}>
                  {step === 0 && (<>
                    <div className="flex flex-wrap gap-2.5">
                      {custom && <Chip on>{bk.s.svc}</Chip>}
                      {BSV.map(s => <Chip key={s} on={bk.s.svc === s} onClick={() => { bk.upd('svc', s); setErr('') }}>{s}</Chip>)}
                    </div>
                    <label className="mt-7 block"><span className="mb-2 block text-[13px] text-white/45">Марка и модель (необязательно)</span>
                      <input value={car} onChange={e => setCar(e.target.value)} placeholder="Например, Volkswagen Passat B6" className="h-13 w-full rounded-xl border border-white/15 bg-transparent px-4 py-3.5 text-[16px] outline-none placeholder:text-white/25 focus:border-[#ff6a1a]" /></label>
                  </>)}
                  {step === 1 && (<>
                    <div className="flex flex-wrap gap-2.5">{DAYS.map(d => <Chip key={d} on={day === d} onClick={() => { setDay(d); setErr('') }}>{d}</Chip>)}</div>
                    <p className="mb-3 mt-7 text-[13px] text-white/45">Время суток</p>
                    <div className="flex flex-wrap gap-2.5">{TIMES.map(t => <Chip key={t} on={time === t} onClick={() => setTime(t)}>{t}</Chip>)}</div>
                  </>)}
                  {step === 2 && (<div className="space-y-4">
                    <label className="block"><span className="mb-2 block text-[13px] text-white/45">Имя</span>
                      <input value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} autoComplete="name" className="w-full rounded-xl border border-white/15 bg-transparent px-4 py-3.5 text-[16px] outline-none focus:border-[#ff6a1a]" /></label>
                    <label className="block"><span className="mb-2 block text-[13px] text-white/45">Телефон</span>
                      <input value={bk.s.phone} onChange={e => bk.upd('phone', e.target.value)} onFocus={phoneFocus(bk)} type="tel" inputMode="tel" autoComplete="tel" placeholder="+375 __ ___-__-__" aria-invalid={bk.s.err}
                        className={`w-full rounded-xl border bg-transparent px-4 py-3.5 text-[16px] outline-none focus:border-[#ff6a1a] ${bk.s.err ? 'border-[#ff6a1a]' : 'border-white/15'}`} /></label>
                    {bk.s.err && <p className="text-[14px] text-[#ff8a4a]">Проверьте номер — нужно 12 цифр с кодом +375.</p>}
                    <p className="text-[13px] text-white/40">{[bk.s.svc, car, day, time].filter(Boolean).join(' · ')}</p>
                  </div>)}
                </motion.div>
              </AnimatePresence>
              {err && <p className="mt-4 text-[14px] text-[#ff8a4a]" role="alert">{err}</p>}
              <div className="mt-9 flex items-center justify-between">
                {step > 0 ? <button type="button" onClick={() => setStep(step - 1)} className="text-[14px] text-white/50 hover:text-white">← Назад</button> : <span />}
                <button type="submit" className="inline-flex h-12 items-center gap-2 rounded-full bg-[#ff6a1a] px-7 text-[15px] font-semibold text-[#0c0d0f] disabled:opacity-60" disabled={bk.s.loading}>
                  {step < 2 ? 'Дальше' : bk.s.loading ? 'Отправляем…' : 'Записаться'} <ArrowRight size={16} />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

/* ---------------- contacts ---------------- */
function Contact() {
  return (
    <section id="contact" className="px-5 py-24 md:px-12" style={{ background: BASE }}>
      <div className="mx-auto grid max-w-[1320px] gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <h2 className={`${H2} text-[clamp(36px,4.6vw,68px)]`}>Контакты</h2>
          <p className="mt-8 flex items-start gap-3 text-[18px]"><MapPin className="mt-1 shrink-0 text-[#ff6a1a]" size={20} />{b.addr}, {b.city}</p>
          <a href={'tel:' + tel(b.phone)} className="mt-4 flex items-center gap-3 text-[22px] font-semibold hover:text-[#ff6a1a]"><Phone className="text-[#ff6a1a]" size={20} />{b.phone}</a>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={b.viber} target="_blank" rel="noopener" className="inline-flex h-12 items-center gap-2 rounded-full bg-[#7360f2] px-6 text-[14px] font-semibold text-white"><MessageCircle size={17} />Viber</a>
            <a href={b.ig} target="_blank" rel="noopener" className="inline-flex h-12 items-center gap-2 rounded-full border border-white/20 px-6 text-[14px] font-semibold hover:border-white/60"><IG />Instagram</a>
          </div>
        </div>
        <div className="h-[380px] overflow-hidden rounded-[24px] border border-white/10 md:h-[460px]"><MapFrame oid={b.oid} dark /></div>
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
        <Ribbon name={b.name} bg={ACC} fg={BASE} />
        <header className="sticky top-0 z-40 border-b border-white/[.07] bg-[#0c0d0f]/75 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-[1320px] items-center justify-between px-5 md:px-12">
            <a href="#film" className="flex items-center gap-2.5"><span className="grid h-7 w-7 place-items-center rounded-md bg-[#ff6a1a] text-[12px] font-bold text-[#0c0d0f]">Ш</span><span className="text-[17px] font-semibold tracking-[-0.03em]">Шбк Про</span></a>
            <nav className="hidden gap-8 text-[14px] text-white/60 md:flex">{[['#tracker', 'Трекер'], ['#why', 'О нас'], ['#services', 'Услуги'], ['#contact', 'Контакты']].map(([h, t]) => <a key={h} href={h} className="hover:text-white">{t}</a>)}</nav>
            <div className="flex items-center gap-4">
              <a href={'tel:' + tel(b.phone)} className="hidden text-[14px] font-medium lg:block">{b.phone}</a>
              <a href="#book" className="hidden h-10 items-center rounded-full bg-[#f1f0ec] px-5 text-[14px] font-semibold text-[#0c0d0f] hover:bg-[#ff6a1a] sm:inline-flex">Записаться</a>
            </div>
          </div>
        </header>
        <main>
          <Film lite={lite} />
          <Manifesto />
          <Tracker />
          <Bento />
          <Services />
          <Book />
          <Contact />
        </main>
        <footer className="border-t border-white/10 px-5 py-8 text-[13px] text-white/45 md:px-12" style={{ background: BASE }}>
          <div className="mx-auto flex max-w-[1320px] flex-wrap justify-between gap-4"><span>© 2026 {b.name} · Концепт сайта — Артём</span><span>{b.addr}, {b.city}</span></div>
        </footer>
        <CallBar phone={b.phone} barCls="bg-[#0c0d0f]/95 backdrop-blur border-t border-white/10" callCls="rounded-full border border-white/25 text-[#f1f0ec]" bookCls="rounded-full bg-[#ff6a1a] text-[#0c0d0f]" />
        <div className="h-[72px] sm:hidden" style={{ background: BASE }} />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
