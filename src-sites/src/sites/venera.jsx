import React, { useRef, useState, useEffect, useMemo, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, useSpring, useMotionValue, useInView, AnimatePresence, MotionConfig, animate } from 'framer-motion'
import { ArrowRight, Phone, MapPin, Clock, Star, Plus, Minus, Check, Sparkles, Scissors, Hand, Flower2 } from 'lucide-react'
import '../lib/base.css'
import { useSmooth, Ribbon, LineReveal, Reveal, useBooking, phoneFocus, CheckDraw, MapFrame, CallBar, tel, useLite, useIsMobile } from '../lib/kit'

const VenusScene = lazy(() => import('./venera3d'))

const b = {
  name: 'Венера', addr: 'Сухаревская ул., 39', district: 'Сухарево', city: 'Минск',
  phone: '+375 29 555-51-51', rating: '4,9', rev: 176, revWord: 'оценок', oid: '1100314729',
}
const PEARL = '#f7f2ef', BLUSH = '#f0e2de', ROSE = '#c98591', ROSE_D = '#93445a', PLUM = '#2e2233', GOLD = '#b98d66'
const SERIF = "font-['Cormorant_Garamond',serif]", SANS = "font-['Jost',sans-serif]"
const go = id => { const el = document.querySelector(id); if (!el) return; window.__lenis ? window.__lenis.scrollTo(el, { offset: -76 }) : el.scrollIntoView({ behavior: 'smooth' }) }
const pick = svc => { window.dispatchEvent(new CustomEvent('vn-svc', { detail: svc })); go('#book') }

function Kicker({ children, light, className = '' }) {
  return <p className={`${SANS} flex items-center gap-3 text-[14px] font-medium uppercase tracking-[.28em] ${light ? 'text-[#e9b9bf]' : 'text-[#93445a]'} ${className}`}><span aria-hidden="true" className="inline-block h-[7px] w-[7px] rounded-full border border-current" />{children}</p>
}
function H2({ children, className = '' }) {
  return <h2 className={`${SERIF} text-[clamp(44px,5.6vw,84px)] font-normal leading-[0.98] tracking-[-0.01em] ${className}`}>{children}</h2>
}

/* ---------------- film ---------------- */
const R = [[0.16, 0.34], [0.36, 0.54], [0.56, 0.74], [0.76, 0.94]]
const CH = [
  { k: 'Лицо', t: 'Уход и массаж лица', d: 'Спокойный ритуал ухода — косметолог подберёт процедуру под вашу кожу.', svc: 'Уход за лицом' },
  { k: 'Эпиляция', t: 'Гладкость без спешки', d: 'Эпиляция в отдельном кабинете — в своё, заранее выбранное время.', svc: 'Эпиляция' },
  { k: 'Барбершоп', t: 'Стрижки и борода', d: 'Мужские и женские стрижки, оформление бороды — всё в одном салоне.', svc: 'Мужская стрижка' },
  { k: 'Ногти', t: 'Ногтевая студия', d: 'Маникюр и педикюр — можно записаться сразу после другой услуги.', svc: 'Маникюр' },
]
function Chapter({ p, i, c }) {
  const [a, z] = R[i]
  const o = useTransform(p, [a - 0.04, a + 0.01, z - 0.01, z + 0.03], [0, 1, 1, 0])
  const y = useTransform(p, [a - 0.04, a + 0.01, z - 0.01, z + 0.03], [30, 0, 0, -24])
  const pe = useTransform(o, v => (v > 0.6 ? 'auto' : 'none'))
  return (
    <motion.div style={{ opacity: o, y, pointerEvents: pe }} className="absolute inset-x-0 bottom-0 max-w-[560px]">
      <p className={`${SANS} text-[15px] font-medium uppercase tracking-[.28em] text-[#93445a]`}>Орбита {i + 1} из 4 · {c.k}</p>
      <h2 className={`${SERIF} mt-3 text-[clamp(52px,6vw,96px)] font-normal leading-[0.95]`}>{c.t}</h2>
      <p className="mt-5 max-w-[440px] text-[19px] leading-relaxed text-[#2e2233]/80">{c.d}</p>
      <button type="button" onClick={() => pick(c.svc)} className="mt-7 inline-flex h-14 items-center gap-2 rounded-full px-7 text-[17px] font-medium text-[#f7f2ef] hover:bg-[#93445a]" style={{ background: PLUM }}>Выбрать время <ArrowRight size={18} /></button>
    </motion.div>
  )
}
function Dot({ p, i }) {
  const [a, z] = R[i]
  const s = useTransform(p, [a - 0.02, a, z, z + 0.02], [1, 1.8, 1.8, 1])
  const bg = useTransform(p, [a - 0.02, a, z, z + 0.02], ['rgba(46,34,51,.0)', ROSE_D, ROSE_D, 'rgba(46,34,51,.0)'])
  return <motion.span style={{ scale: s, background: bg }} className="h-2.5 w-2.5 rounded-full border border-[#93445a]" />
}
function MobCaption({ p }) {
  const [i, setI] = useState(-1)
  useEffect(() => p.on('change', v => setI(R.findIndex(([a, z]) => v >= a && v <= z + 0.02))), [p])
  return <AnimatePresence>{i >= 0 && <motion.span key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`${SERIF} absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#f7f2ef]/90 px-5 py-1 text-[20px] italic text-[#93445a]`}>{CH[i].t}</motion.span>}</AnimatePresence>
}
function Sky({ p, lite, active, mob }) {
  if (lite) return (
    <svg viewBox="0 0 400 300" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <defs><radialGradient id="vn-pl" cx="40%" cy="35%"><stop offset="0" stopColor="#fbf3ef" /><stop offset=".7" stopColor="#ecc4c1" /><stop offset="1" stopColor="#d9a3a3" /></radialGradient></defs>
      <ellipse cx="260" cy="150" rx="150" ry="34" fill="none" stroke="#c99a8e" strokeWidth="10" opacity=".35" transform="rotate(-12 260 150)" />
      <circle cx="260" cy="150" r="70" fill="url(#vn-pl)" />
      <path d="M118 170 A150 34 0 0 0 402 126" fill="none" stroke="#c99a8e" strokeWidth="10" opacity=".55" transform="rotate(-12 260 150)" />
    </svg>
  )
  return <>{active && <Suspense fallback={null}><VenusScene progress={p} active={active} mobile={mob} /></Suspense>}{mob && <MobCaption p={p} />}</>
}

function Film({ lite }) {
  const ref = useRef(null)
  const mob = useIsMobile()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const sp = useSpring(scrollYProgress, { stiffness: 80, damping: 24, mass: 0.4 })
  const auto = useMotionValue(0)
  useEffect(() => {
    if (!mob || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const c = animate(auto, [0, 0.1, 0.25, 0.45, 0.65, 0.85, 0.96, 0.96], { duration: 24, repeat: Infinity, ease: 'easeInOut' })
    return () => c.stop()
  }, [mob])
  const p = mob ? auto : sp
  const near = useInView(ref, { margin: '200px 0px' })
  const heroO = useTransform(sp, [0, 0.11], [1, 0])
  const heroY = useTransform(sp, [0, 0.11], [0, -30])
  const heroPE = useTransform(sp, v => (v < 0.07 ? 'auto' : 'none'))
  return (
    <section ref={ref} id="top" className="relative md:h-[280vh]" style={{ background: `radial-gradient(90% 70% at 72% 35%, #fbf6f3 0%, ${PEARL} 45%, ${BLUSH} 100%)` }}>
      <div className="md:sticky md:top-[76px] md:h-[calc(100svh-76px)] md:overflow-hidden">
        <div className="relative h-[40svh] min-h-[260px] md:absolute md:inset-0 md:h-auto">
          <Sky p={p} lite={lite} active={near} mob={mob} />
        </div>
        <div className="relative mx-auto h-full max-w-[1360px] px-5 pb-12 md:px-12 md:pb-[9vh]">
          <div className="relative h-full md:pt-[6vh]">
            <motion.div style={mob ? undefined : { opacity: heroO, y: heroY, pointerEvents: heroPE }} className="flex h-full max-w-[640px] flex-col justify-end">
              <Kicker>Салон красоты · барбершоп · ногти</Kicker>
              <h1 className={`${SERIF} mt-5 text-[clamp(50px,7vw,112px)] font-normal leading-[0.92] tracking-[-0.015em]`}>
                <LineReveal delay={0.05}>Красота на</LineReveal>
                <LineReveal delay={0.15}><span className="italic text-[#93445a]">Сухарево —</span></LineReveal>
                <LineReveal delay={0.25}>без ожидания</LineReveal>
              </h1>
              <p className="mt-6 max-w-[500px] text-[19px] leading-relaxed text-[#2e2233]/85">Уход и массаж лица, эпиляция, стрижки и ногти. Выберите время онлайн — и приходите ровно к нему.</p>
              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-[17px]">
                <span className="inline-flex items-center gap-2 font-medium"><Star size={18} fill={GOLD} stroke={GOLD} />{b.rating} · {b.rev} {b.revWord} на Яндекс Картах</span>
                <span className="inline-flex items-center gap-2"><MapPin size={18} className="text-[#93445a]" />{b.addr}</span>
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a href="#book" className="inline-flex h-16 items-center justify-center gap-2 rounded-full px-9 text-[19px] font-medium text-[#f7f2ef] shadow-[0_18px_40px_-20px_rgba(46,34,51,.8)] hover:bg-[#93445a]" style={{ background: PLUM }}>Выбрать время <ArrowRight size={20} /></a>
                <a href={'tel:' + tel(b.phone)} className="inline-flex h-16 items-center justify-center gap-3 rounded-full border border-[#2e2233]/40 px-8 text-[19px] font-medium hover:border-[#2e2233]"><Phone size={19} />{b.phone}</a>
              </div>
              <a href="#services" className="mt-6 hidden w-fit text-[16px] underline decoration-[#c98591] underline-offset-[6px] md:inline-block">Пропустить → к услугам</a>
            </motion.div>
            {!mob && CH.map((c, i) => <Chapter key={c.k} p={sp} i={i} c={c} />)}
          </div>
          {!mob && <div className="absolute bottom-[9vh] right-12 flex flex-col gap-3" aria-hidden="true">{R.map((_, i) => <Dot key={i} p={sp} i={i} />)}</div>}
        </div>
      </div>
    </section>
  )
}

/* ---------------- services ---------------- */
const GROUPS = [
  { k: 'Лицо', I: Sparkles, items: [{ t: 'Уход за лицом', d: 'Очищение, увлажнение и уход по типу кожи.', time: 'около часа — уточним' }, { t: 'Массаж лица', d: 'Расслабляющий массаж для тонуса и отдыха.', time: 'уточним при записи' }] },
  { k: 'Тело', I: Flower2, items: [{ t: 'Эпиляция', d: 'Разные зоны — подскажем, как подготовиться.', time: 'зависит от зоны' }] },
  { k: 'Волосы и барбер', I: Scissors, items: [{ t: 'Женская стрижка', d: 'Освежить форму или сменить образ.', time: 'обычно около часа' }, { t: 'Мужская стрижка', d: 'Классика или фейд, аккуратный контур.', time: 'обычно 30–45 минут' }, { t: 'Оформление бороды', d: 'Форма, контур и уход.', time: 'уточним при записи' }] },
  { k: 'Ногти', I: Hand, items: [{ t: 'Маникюр', d: 'С покрытием или без — по желанию.', time: 'обычно 1–2 часа' }, { t: 'Педикюр', d: 'Ухоженные стопы и аккуратные ногти.', time: 'уточним при записи' }] },
]
const ALL = GROUPS.flatMap(g => g.items.map(x => ({ ...x, g: g.k })))
function Services() {
  return (
    <section id="services" className="px-5 py-24 md:px-12 md:py-36" style={{ background: PEARL }}>
      <div className="mx-auto max-w-[1280px]">
        <div className="grid gap-6 md:grid-cols-2 md:items-end">
          <div><Kicker>Услуги</Kicker><H2 className="mt-4">Четыре орбиты заботы</H2></div>
          <p className="max-w-[440px] text-[18px] leading-relaxed text-[#2e2233]/80 md:justify-self-end">Цены — уточняйте у администратора: они зависят от процедуры и длины волос. «Выбрать время» сразу перенесёт услугу в запись.</p>
        </div>
        <div className="mt-16 grid gap-5 md:grid-cols-2">
          {GROUPS.map((g, gi) => (
            <Reveal key={g.k} delay={gi * 0.06} className="rounded-[36px] bg-[#fbf8f6] p-7 shadow-[0_30px_60px_-50px_rgba(46,34,51,.6)] md:p-10">
              <div className="flex items-center gap-4">
                <span className="grid h-14 w-14 place-items-center rounded-full border border-[#c98591]/60 text-[#93445a]"><g.I size={22} /></span>
                <h3 className={`${SERIF} text-[36px] font-medium leading-none`}>{g.k}</h3>
              </div>
              <ul className="mt-6 divide-y divide-[#2e2233]/10">
                {g.items.map(s => (
                  <li key={s.t} className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[20px] font-medium">{s.t}</p>
                      <p className="mt-0.5 text-[17px] text-[#2e2233]/75">{s.d}</p>
                      <p className="mt-1 text-[15px] text-[#93445a]">{s.time} · цена — уточняйте</p>
                    </div>
                    <button type="button" onClick={() => pick(s.t)} className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full border border-[#2e2233] px-5 text-[16px] font-medium transition-colors hover:bg-[#2e2233] hover:text-[#f7f2ef] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2e2233]">Выбрать время</button>
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------- why no waiting ---------------- */
function Promise_() {
  const items = [['Ваше время — за вами', 'Вы выбираете окно, администратор подтверждает его звонком.'], ['Мастер готовится заранее', 'Знает, кто придёт и на какую услугу, — кабинет готов к вашему приходу.'], ['Несколько услуг подряд', 'Скажите при записи — постараемся поставить их одну за другой.']]
  return (
    <section id="how" className="relative overflow-hidden px-5 py-24 text-[#f7f2ef] md:px-12 md:py-36" style={{ background: PLUM }}>
      <svg className="pointer-events-none absolute -right-40 -top-40 h-[620px] w-[620px] opacity-30" viewBox="0 0 200 200" aria-hidden="true">
        {[40, 62, 84].map((r, i) => <motion.circle key={r} cx="100" cy="100" r={r} fill="none" stroke="#e9b9bf" strokeWidth=".4" strokeDasharray="1 3" animate={{ rotate: i % 2 ? -360 : 360 }} transition={{ duration: 80 + i * 30, repeat: Infinity, ease: 'linear' }} style={{ originX: '100px', originY: '100px' }} />)}
      </svg>
      <div className="relative mx-auto max-w-[1280px]">
        <Kicker light>Как это работает</Kicker>
        <H2 className="mt-4 max-w-[900px]">Вы приходите <span className="italic text-[#e9b9bf]">к своему времени</span></H2>
        <ol className="mt-16 grid gap-10 md:grid-cols-3">
          {items.map(([t, d], i) => (
            <Reveal as="li" key={t} delay={i * 0.1} className="border-t border-[#f7f2ef]/25 pt-6">
              <span className={`${SERIF} text-[56px] italic leading-none text-[#e9b9bf]`}>0{i + 1}</span>
              <h3 className={`${SERIF} mt-4 text-[32px] font-medium leading-tight`}>{t}</h3>
              <p className="mt-3 text-[18px] leading-relaxed text-[#f7f2ef]/80">{d}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}

/* ---------------- slot booking ---------------- */
const TIMES = ['10:00', '11:30', '13:00', '14:30', '16:00', '17:30', '19:00']
const DOW = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб']
const MON = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
const taken = (d, s) => ((d * 7 + s * 3 + d * s) % 5 === 1) || ((d + s) % 6 === 4)
function useDays() {
  return useMemo(() => {
    const now = new Date()
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i)
      return { i, dow: i === 0 ? 'сегодня' : i === 1 ? 'завтра' : DOW[d.getDay()], n: d.getDate(), full: `${d.getDate()} ${MON[d.getMonth()]}`, past: i === 0 ? now.getHours() + now.getMinutes() / 60 : -1 }
    })
  }, [])
}
function Slot({ t, state, onClick }) {
  const dis = state === 'busy' || state === 'past'
  return (
    <button type="button" disabled={dis} aria-pressed={state === 'on'} onClick={onClick} aria-label={`${t}${state === 'busy' ? ', занято' : state === 'past' ? ', уже прошло' : ''}`}
      className={`h-14 rounded-2xl border text-[18px] font-medium tabular-nums transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2e2233]
      ${state === 'on' ? 'border-[#2e2233] bg-[#2e2233] text-[#f7f2ef]' : dis ? 'cursor-not-allowed border-dashed border-[#2e2233]/20 text-[#2e2233]/35 line-through' : 'border-[#2e2233]/25 bg-white hover:border-[#93445a]'}`}>{t}</button>
  )
}
function Book() {
  const bk = useBooking()
  const days = useDays()
  const [step, setStep] = useState(0), [day, setDay] = useState(1), [time, setTime] = useState(''), [err, setErr] = useState('')
  const head = useRef(null)
  useEffect(() => { if (step) head.current?.focus() }, [step])
  useEffect(() => { const h = e => { bk.upd('svc', e.detail); setStep(0); setErr('') }; window.addEventListener('vn-svc', h); return () => window.removeEventListener('vn-svc', h) }, [])
  const next = e => {
    e.preventDefault()
    if (step === 0 && !bk.s.svc) return setErr('Выберите услугу')
    if (step === 1 && !time) return setErr('Выберите свободное время')
    setErr('')
    if (step < 2) setStep(step + 1); else bk.submit()
  }
  const D = days[day]
  const state = (t, si) => {
    const h = parseInt(t) + (t.endsWith('30') ? 0.5 : 0)
    if (D.past >= 0 && h <= D.past + 0.5) return 'past'
    if (taken(day, si)) return 'busy'
    return time === t ? 'on' : 'free'
  }
  const titles = ['Какая услуга?', 'Выберите день и время', 'Куда подтвердить запись?']
  const inp = 'mt-2 h-16 w-full rounded-2xl border bg-white px-5 text-[18px] outline-none focus:border-[#93445a] focus:ring-2 focus:ring-[#c98591]/30'
  return (
    <section id="book" className="px-5 py-24 md:px-12 md:py-36" style={{ background: BLUSH }}>
      <div className="mx-auto grid max-w-[1280px] gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <Kicker>Без ожидания</Kicker>
          <H2 className="mt-4">Выберите своё окно</H2>
          <p className="mt-6 max-w-[420px] text-[19px] leading-relaxed text-[#2e2233]/80">Услуга, день и время — в три касания. Администратор перезвонит и подтвердит запись, а вы придёте ровно к назначенному часу.</p>
          <ul className="mt-8 space-y-3 text-[17px]">
            {['Свободные окна видны сразу', 'Подтверждение звонком', 'Перенести можно по телефону'].map(t => <li key={t} className="flex items-center gap-3"><span className="grid h-7 w-7 place-items-center rounded-full bg-[#2e2233] text-[#f7f2ef]"><Check size={15} /></span>{t}</li>)}
          </ul>
          <a href={'tel:' + tel(b.phone)} className="mt-10 inline-flex items-center gap-3 text-[24px] font-medium"><Phone size={22} className="text-[#93445a]" />{b.phone}</a>
        </div>
        <div className="rounded-[36px] bg-[#fbf8f6] p-6 shadow-[0_40px_80px_-50px_rgba(46,34,51,.55)] md:p-10">
          {bk.s.sent ? (
            <div className="py-10 text-center" role="status">
              <CheckDraw className="mx-auto text-[#93445a]" size={84} />
              <p className={`${SERIF} mt-6 text-[44px] leading-none`}>Ждём вас</p>
              <p className="mt-3 text-[20px] font-medium">{D.full}, {time}</p>
              <p className="mx-auto mt-3 max-w-[420px] text-[18px] leading-relaxed text-[#2e2233]/80">Администратор перезвонит и подтвердит время. В готовом сайте заявка сразу придёт вам в Telegram.</p>
              <button type="button" onClick={() => { bk.reset(); setStep(0); setTime('') }} className="mt-8 h-12 text-[17px] font-medium underline underline-offset-4">Новая запись</button>
            </div>
          ) : (
            <form onSubmit={next} noValidate>
              <div className="flex gap-2" aria-hidden="true">{[0, 1, 2].map(i => <span key={i} className="h-1.5 flex-1 rounded-full" style={{ background: i <= step ? PLUM : '#e7d3ce' }} />)}</div>
              <p className="mt-4 text-[15px] font-medium uppercase tracking-[.2em] text-[#93445a]">Шаг {step + 1} из 3</p>
              <h3 ref={head} tabIndex={-1} className={`${SERIF} mb-6 mt-1 text-[38px] leading-tight outline-none`}>{titles[step]}</h3>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={step} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }} transition={{ duration: 0.2 }}>
                  {step === 0 && <div className="grid gap-2.5 sm:grid-cols-2">{ALL.map(s => (
                    <button key={s.t} type="button" aria-pressed={bk.s.svc === s.t} onClick={() => { bk.upd('svc', s.t); setErr('') }}
                      className={`min-h-[64px] rounded-2xl border px-5 py-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2e2233] ${bk.s.svc === s.t ? 'border-[#2e2233] bg-[#2e2233] text-[#f7f2ef]' : 'border-[#2e2233]/20 bg-white hover:border-[#93445a]'}`}>
                      <span className="block text-[18px] font-medium">{s.t}</span><span className="block text-[14px] opacity-75">{s.g}</span>
                    </button>))}</div>}
                  {step === 1 && (<>
                    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2" role="group" aria-label="День">
                      {days.map(d => (
                        <button key={d.i} type="button" aria-pressed={day === d.i} onClick={() => { setDay(d.i); setTime(''); setErr('') }}
                          className={`flex h-[76px] w-[68px] shrink-0 flex-col items-center justify-center rounded-2xl border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2e2233] ${day === d.i ? 'border-[#93445a] bg-[#93445a] text-white' : 'border-[#2e2233]/20 bg-white hover:border-[#93445a]'}`}>
                          <span className="text-[14px]">{d.dow}</span><span className={`${SERIF} text-[28px] leading-none`}>{d.n}</span>
                        </button>
                      ))}
                    </div>
                    <div className="mt-5 grid grid-cols-3 gap-2.5 sm:grid-cols-4" role="group" aria-label="Время">
                      {TIMES.map((t, si) => <Slot key={t} t={t} state={state(t, si)} onClick={() => { setTime(t); setErr('') }} />)}
                    </div>
                    <p className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-[15px] text-[#2e2233]/70"><span>Демо-расписание: в готовом сайте — реальные свободные окна мастеров.</span><span className="line-through">00:00</span><span>— занято</span></p>
                  </>)}
                  {step === 2 && (<div className="space-y-5">
                    <p className="rounded-2xl p-4 text-[17px]" style={{ background: BLUSH }}><b className="font-medium">{bk.s.svc}</b> · {D.full}, {time}</p>
                    <div><label htmlFor="vn-name" className="text-[17px] font-medium">Ваше имя</label>
                      <input id="vn-name" value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} autoComplete="name" className={inp + ' border-[#2e2233]/20'} /></div>
                    <div><label htmlFor="vn-phone" className="text-[17px] font-medium">Телефон</label>
                      <input id="vn-phone" value={bk.s.phone} onChange={e => bk.upd('phone', e.target.value)} onFocus={phoneFocus(bk)} type="tel" inputMode="tel" autoComplete="tel" placeholder="+375 __ ___-__-__" aria-invalid={bk.s.err} aria-describedby={bk.s.err ? 'vn-perr' : undefined}
                        className={`${inp} ${bk.s.err ? 'border-[#b42318]' : 'border-[#2e2233]/20'}`} /></div>
                    {bk.s.err && <p id="vn-perr" className="text-[16px] font-medium text-[#b42318]">Проверьте номер: 12 цифр, начиная с +375.</p>}
                  </div>)}
                </motion.div>
              </AnimatePresence>
              {err && <p className="mt-4 text-[16px] font-medium text-[#b42318]" role="alert">{err}</p>}
              <div className="mt-8 flex items-center justify-between gap-4">
                {step > 0 ? <button type="button" onClick={() => setStep(step - 1)} className="h-14 px-2 text-[17px] font-medium text-[#2e2233]/75 hover:text-[#2e2233]">← Назад</button> : <span />}
                <button type="submit" disabled={bk.s.loading} className="inline-flex h-16 items-center gap-2 rounded-full px-8 text-[18px] font-medium text-[#f7f2ef] disabled:opacity-60" style={{ background: PLUM }}>{step < 2 ? 'Дальше' : bk.s.loading ? 'Отправляем…' : 'Записаться'} <ArrowRight size={19} /></button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

/* ---------------- rating ---------------- */
function Rating() {
  return (
    <section id="reviews" className="px-5 py-24 md:px-12 md:py-36" style={{ background: PEARL }}>
      <div className="mx-auto flex max-w-[1000px] flex-col items-center text-center">
        <Kicker>Отзывы</Kicker>
        <div className="relative mt-8">
          <svg className="absolute left-1/2 top-1/2 h-[150%] w-[190%] -translate-x-1/2 -translate-y-1/2" viewBox="0 0 400 200" aria-hidden="true">
            <motion.ellipse cx="200" cy="100" rx="190" ry="54" fill="none" stroke="#c98591" strokeWidth="1" transform="rotate(-10 200 100)" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 2, ease: 'easeInOut' }} />
          </svg>
          <p className={`${SERIF} relative text-[clamp(130px,18vw,240px)] font-normal leading-[.8]`}>{b.rating}</p>
        </div>
        <div className="mt-8 flex gap-1.5" aria-hidden="true">{[0, 1, 2, 3, 4].map(i => <Star key={i} size={24} fill={GOLD} stroke={GOLD} />)}</div>
        <p className="mt-4 text-[20px]">{b.rev} {b.revWord} на Яндекс Картах</p>
        <p className="mt-4 max-w-[560px] text-[18px] leading-relaxed text-[#2e2233]/75">Онлайн-запись по времени — чтобы визит начинался с процедуры, а не с ожидания в холле.</p>
        <a href={`https://yandex.by/maps/org/${b.oid}/reviews/`} target="_blank" rel="noopener" className="mt-8 inline-flex h-14 items-center gap-2 rounded-full border border-[#2e2233] px-7 text-[17px] font-medium hover:bg-[#2e2233] hover:text-[#f7f2ef]">Читать отзывы <ArrowRight size={18} /></a>
      </div>
    </section>
  )
}

/* ---------------- faq ---------------- */
const FAQ = [
  ['Можно прийти без записи?', 'Можно позвонить и спросить, есть ли свободный мастер. Но по записи вы приходите к своему времени и не ждёте.'],
  ['Сколько длится уход за лицом?', 'Обычно около часа, зависит от процедуры. Точнее подскажет администратор при записи.'],
  ['Можно записаться на несколько услуг подряд?', 'Да, скажите об этом при подтверждении — постараемся поставить услуги одну за другой.'],
  ['Как перенести или отменить запись?', `Позвоните по номеру ${b.phone} — подберём другое время.`],
  ['Как оплатить?', 'Способы оплаты уточняйте у администратора.'],
  ['Есть ли парковка?', `Салон находится на ${b.addr.replace('ул.', 'улице')}. О парковке рядом подскажем по телефону.`],
]
function Faq() {
  const [open, setOpen] = useState(0)
  return (
    <section id="faq" className="px-5 py-24 md:px-12 md:py-32" style={{ background: BLUSH }}>
      <div className="mx-auto grid max-w-[1280px] gap-10 md:grid-cols-[0.8fr_1.2fr]">
        <div>
          <Kicker>Вопросы</Kicker>
          <H2 className="mt-4">Частые вопросы</H2>
          <p className="mt-5 text-[18px] text-[#2e2233]/80">Не нашли ответ? <a href={'tel:' + tel(b.phone)} className="font-medium underline underline-offset-4">{b.phone}</a></p>
        </div>
        <div className="border-t border-[#2e2233]/20">
          {FAQ.map(([q, a], i) => (
            <div key={q} className="border-b border-[#2e2233]/12">
              <h3>
                <button type="button" aria-expanded={open === i} aria-controls={'vnf-' + i} onClick={() => setOpen(open === i ? -1 : i)} className="flex min-h-[76px] w-full items-center justify-between gap-4 py-4 text-left text-[20px] font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2e2233]">
                  {q}<span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border ${open === i ? 'border-[#2e2233] bg-[#2e2233] text-[#f7f2ef]' : 'border-[#2e2233]/30'}`}>{open === i ? <Minus size={18} /> : <Plus size={18} />}</span>
                </button>
              </h3>
              <AnimatePresence initial={false}>
                {open === i && <motion.div id={'vnf-' + i} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden"><p className="pb-6 text-[18px] leading-relaxed text-[#2e2233]/80">{a}</p></motion.div>}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------- contact ---------------- */
function Contact() {
  return (
    <section id="contact" className="px-5 py-24 md:px-12 md:py-32" style={{ background: PEARL }}>
      <div className="mx-auto grid max-w-[1280px] gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <div>
          <Kicker>Контакты</Kicker>
          <H2 className="mt-4">Ждём вас <span className="italic text-[#93445a]">на Сухарево</span></H2>
          <ul className="mt-8 space-y-5 text-[19px]">
            <li className="flex items-start gap-3"><MapPin className="mt-1 shrink-0 text-[#93445a]" size={22} /><span>{b.addr}<br /><span className="text-[#2e2233]/70">{b.district}, {b.city}</span></span></li>
            <li className="flex items-start gap-3"><Clock className="mt-1 shrink-0 text-[#93445a]" size={22} />Часы работы — уточняйте по телефону</li>
            <li><a href={'tel:' + tel(b.phone)} className="flex items-center gap-3 text-[28px] font-medium"><Phone size={22} className="text-[#93445a]" />{b.phone}</a></li>
          </ul>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#book" className="inline-flex h-16 items-center justify-center gap-2 rounded-full px-8 text-[18px] font-medium text-[#f7f2ef]" style={{ background: PLUM }}>Выбрать время <ArrowRight size={19} /></a>
            <a href={'tel:' + tel(b.phone)} className="inline-flex h-16 items-center justify-center gap-2 rounded-full border border-[#2e2233] px-8 text-[18px] font-medium"><Phone size={19} />Позвонить</a>
          </div>
        </div>
        <div className="relative aspect-square max-h-[600px] w-full overflow-hidden rounded-full border-[10px] border-[#fbf8f6] shadow-[0_40px_80px_-50px_rgba(46,34,51,.6)] sm:mx-auto sm:max-w-[600px]">
          <MapFrame oid={b.oid} />
        </div>
      </div>
    </section>
  )
}

/* ---------------- header ---------------- */
const NAV = [['#services', 'Услуги'], ['#how', 'Как это работает'], ['#book', 'Без ожидания'], ['#reviews', 'Отзывы'], ['#contact', 'Контакты']]
function useActive() {
  const [a, setA] = useState('')
  useEffect(() => {
    const els = ['#services', '#how', '#book', '#reviews', '#faq', '#contact'].map(h => document.querySelector(h)).filter(Boolean)
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) setA('#' + e.target.id) }), { rootMargin: '-45% 0px -50% 0px' })
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])
  return a === '#faq' ? '#reviews' : a
}
function Header() {
  const active = useActive()
  return (
    <header className="sticky top-0 z-50 border-b border-[#2e2233]/10 bg-[#f7f2ef]/90 backdrop-blur">
      <div className="mx-auto flex h-[64px] max-w-[1360px] items-center justify-between gap-4 px-4 md:h-[76px] md:px-12">
        <a href="#top" className="flex min-w-0 items-center gap-3" aria-label="Венера — наверх">
          <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="7" fill="#e3b3b2" /><ellipse cx="16" cy="16" rx="14" ry="4" fill="none" stroke="#93445a" strokeWidth="1.2" transform="rotate(-18 16 16)" /></svg>
          <span className="leading-none">
            <span className={`${SERIF} block text-[28px] font-medium tracking-[.04em]`}>Венера</span>
            <span className={`${SANS} mt-0.5 block truncate text-[12px] uppercase tracking-[.24em] text-[#93445a]`}>Сухарево</span>
          </span>
        </a>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Разделы">
          {NAV.map(([h, t]) => <a key={h} href={h} aria-current={active === h ? 'true' : undefined} className={`rounded-full px-4 py-2 text-[16px] transition-colors ${active === h ? 'bg-[#2e2233] text-[#f7f2ef]' : 'hover:bg-[#2e2233]/[.06]'}`}>{t}</a>)}
        </nav>
        <div className="flex shrink-0 items-center gap-3">
          <a href={'tel:' + tel(b.phone)} className="hidden text-[17px] font-medium xl:inline">{b.phone}</a>
          <a href={'tel:' + tel(b.phone)} aria-label={'Позвонить ' + b.phone} className="grid h-11 w-11 place-items-center rounded-full border border-[#2e2233]/30 sm:hidden"><Phone size={19} /></a>
          <a href="#book" className="hidden h-11 items-center rounded-full px-6 text-[16px] font-medium text-[#f7f2ef] sm:inline-flex" style={{ background: PLUM }}>Записаться</a>
        </div>
      </div>
    </header>
  )
}

function App() {
  useSmooth()
  const lite = useLite()
  return (
    <MotionConfig reducedMotion="user">
      <div className={`${SANS} text-[18px] text-[#2e2233]`} style={{ background: PEARL, '--sel': ROSE_D, '--selc': '#fff' }}>
        <Ribbon name={b.name} bg={PLUM} fg={PEARL} />
        <Header />
        <main>
          <Film lite={lite} />
          <Services />
          <Promise_ />
          <Book />
          <Rating />
          <Faq />
          <Contact />
        </main>
        <footer className="px-5 py-10 text-[16px] md:px-12" style={{ background: PLUM, color: 'rgba(247,242,239,.75)' }}>
          <div className="mx-auto flex max-w-[1280px] flex-wrap justify-between gap-4"><span>© 2026 {b.name} · Концепт сайта — Артём</span><span>{b.addr}, {b.city}</span></div>
        </footer>
        <CallBar phone={b.phone} barCls="bg-[#f7f2ef]/95 backdrop-blur border-t border-[#2e2233]/10" callCls="rounded-full border border-[#2e2233] text-[#2e2233] text-[18px]" bookCls="rounded-full bg-[#2e2233] text-[#f7f2ef] text-[18px]" />
        <div className="h-[76px] sm:hidden" style={{ background: PLUM }} />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
