import React, { useRef, useState, useEffect, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, useSpring, useInView, AnimatePresence, MotionConfig } from 'framer-motion'
import { ArrowRight, ArrowLeft, Phone, Plus, Minus, MapPin, Scissors, Palette, Sparkles, Hand, HelpCircle, Accessibility, Star } from 'lucide-react'
import '../lib/base.css'
import { useSmooth, Ribbon, Reveal, useBooking, phoneFocus, CheckDraw, MapFrame, CallBar, tel, useLite, useIsMobile, IG } from '../lib/kit'

const LotusScene = lazy(() => import('./lotos3d'))

const b = {
  name: 'Лотос', addr: 'ул. Матусевича, 90', district: 'Кунцевщина', city: 'Минск',
  phone: '+375 29 638-66-69', viber: 'viber://chat?number=%2B375296386669', ig: 'https://www.instagram.com/lotos__minsk',
  rating: '5,0', rev: 131, oid: '172816494269',
}
const INK = '#1f4747', CREAM = '#fbf6f1', ROSE = '#a8395c', PINK = '#f3b6c6'
const A = "font-['Alice',serif]"
const NAV = [['services', 'Услуги и цены'], ['book', 'Запись'], ['how', 'Как это работает'], ['rating', 'Отзывы'], ['contact', 'Контакты']]

function useActive(ids) {
  const [a, setA] = useState('')
  useEffect(() => {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) setA(e.target.id) }), { rootMargin: '-45% 0px -50% 0px' })
    ids.forEach(id => { const el = document.getElementById(id); if (el) io.observe(el) })
    return () => io.disconnect()
  }, [])
  return a
}

const LotusMark = ({ size = 28 }) => (
  <svg viewBox="0 0 40 28" width={size} height={size * 0.7} aria-hidden="true"><path d="M20 2c4 5 4 14 0 22-4-8-4-17 0-22Z" fill="#e98aa0" /><path d="M20 24C14 20 9 13 9 6c6 2 10 9 11 18Zm0 0c6-4 11-11 11-18-6 2-10 9-11 18Z" fill="#f3b6c6" /><path d="M20 25C12 25 4 21 1 14c7-1 14 4 19 11Zm0 0c8 0 16-4 19-11-7-1-14 4-19 11Z" fill="#c95b7d" /></svg>
)

function Header() {
  const a = useActive(NAV.map(n => n[0]))
  return (
    <header className="sticky top-0 z-40 bg-[#fbf6f1]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-4 px-5 md:px-8">
        <a href="#top" className={`${A} flex items-center gap-2 text-[26px] text-[#1f4747]`}><LotusMark />Лотос</a>
        <nav className="hidden items-center gap-1 rounded-full bg-white/80 p-1 shadow-[0_1px_0_rgba(31,71,71,.08)] lg:flex" aria-label="Разделы">
          {NAV.map(([id, t]) => <a key={id} href={'#' + id} aria-current={a === id ? 'true' : undefined} className={`rounded-full px-4 py-2 text-[15px] transition-colors ${a === id ? 'bg-[#1f4747] text-white' : 'text-[#1f4747]/75 hover:text-[#1f4747]'}`}>{t}</a>)}
        </nav>
        <div className="flex items-center gap-2">
          <a href={'tel:' + tel(b.phone)} className="hidden items-center gap-2 px-2 text-[16px] font-semibold text-[#1f4747] md:flex"><Phone size={16} />{b.phone}</a>
          <a href="#book" className="flex h-11 items-center rounded-full bg-[#a8395c] px-5 text-[15px] font-semibold text-white hover:bg-[#8e2d4c]">Записаться</a>
        </div>
      </div>
    </header>
  )
}

/* ---------------- hero + lotus film ---------------- */
const CH = [
  { n: 'Стрижки', d: 'Женские и мужские стрижки, укладка — без лишних слов и спешки.', r: [0.16, 0.36] },
  { n: 'Окрашивание', d: 'Однотонное, тонирование, освежить цвет — подберём оттенок вместе.', r: [0.36, 0.56] },
  { n: 'Кератин', d: 'Кератиновое выпрямление — гладкие, послушные волосы.', r: [0.56, 0.76] },
  { n: 'Маникюр', d: 'Аккуратные руки — маникюр и покрытие.', r: [0.76, 1.2] },
]
function Chapter({ p, c, i }) {
  const k = [c.r[0], c.r[0] + 0.04, c.r[1] - 0.04, c.r[1]]
  const o = useTransform(p, k, [0, 1, 1, 0])
  const y = useTransform(p, k, [30, 0, 0, -20])
  return (
    <motion.div style={{ opacity: o, y }} className="pointer-events-none absolute inset-x-5 top-[6vh] md:left-[8vw] md:right-auto md:top-[24vh] md:w-[42vw]">
      <p className="text-[15px] font-semibold text-[#a8395c]">Лепесток {i + 1} из 4</p>
      <h2 className={`${A} mt-2 text-[clamp(52px,8vw,120px)] leading-[.95] text-[#1f4747]`}>{c.n}</h2>
      <p className="mt-4 max-w-[420px] text-[18px] leading-relaxed text-[#1f4747]/80">{c.d}</p>
    </motion.div>
  )
}
function LiteLotus({ p }) {
  const s = useTransform(p, [0, 0.85], [0.8, 1.1])
  return (
    <div className="absolute inset-x-0 bottom-[12vh] grid place-items-center md:inset-y-0 md:left-1/2 md:bottom-0">
      <motion.div style={{ scale: s }}><svg viewBox="0 0 40 28" className="w-[min(60vw,380px)]" aria-hidden="true"><path d="M20 2c4 5 4 14 0 22-4-8-4-17 0-22Z" fill="#e98aa0" /><path d="M20 24C14 20 9 13 9 6c6 2 10 9 11 18Zm0 0c6-4 11-11 11-18-6 2-10 9-11 18Z" fill="#f3b6c6" /><path d="M20 25C12 25 4 21 1 14c7-1 14 4 19 11Zm0 0c8 0 16-4 19-11-7-1-14 4-19 11Z" fill="#c95b7d" /></svg></motion.div>
    </div>
  )
}
function Film({ lite }) {
  const ref = useRef(null)
  const mob = useIsMobile()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const p = useSpring(scrollYProgress, { stiffness: 80, damping: 24, mass: 0.5 })
  const near = useInView(ref, { margin: '200px 0px' })
  const [mounted, setMounted] = useState(false)
  useEffect(() => { if (near) setMounted(true) }, [near])
  const heroO = useTransform(p, [0, 0.12], [1, 0])
  const heroPE = useTransform(p, v => (v < 0.06 ? 'auto' : 'none'))
  const stageY = useTransform(p, [0, 0.14], [mob ? '22vh' : '0vh', '0vh'])
  const bg = useTransform(p, [0, 1], ['linear-gradient(180deg,#fbf6f1 0%,#fbf6f1 55%,#e3efeb 100%)', 'linear-gradient(180deg,#fdeef1 0%,#fbf6f1 50%,#d6e9e3 100%)'])
  const dots = [0, 1, 2, 3].map(i => useTransform(p, [CH[i].r[0], CH[i].r[0] + 0.04], [0.25, 1]))
  const hudO = useTransform(p, [0.12, 0.17], [0, 1])
  return (
    <section ref={ref} id="top" className="relative h-[260vh]">
      <motion.div style={{ background: bg }} className="sticky top-16 h-[calc(100svh-64px)] overflow-hidden">
        <motion.div style={{ y: stageY }} className="absolute inset-0">
          {lite ? <LiteLotus p={p} /> : mounted && <Suspense fallback={<LiteLotus p={p} />}><LotusScene progress={p} active={near} /></Suspense>}
        </motion.div>
        <motion.div style={{ opacity: heroO, pointerEvents: heroPE }} className="relative z-[2] mx-auto max-w-[1280px] px-5 pt-6 md:px-8 md:pt-[9vh]">
          <div className="max-w-[600px]">
            <div className="flex flex-wrap gap-2">
              <a href="#contact" className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[14px] font-semibold text-[#1f4747] shadow-sm"><MapPin size={14} />{b.addr} · {b.district}</a>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[14px] font-semibold text-[#1f4747] shadow-sm"><Accessibility size={14} />Вход с пандусом</span>
            </div>
            <h1 className={`${A} mt-5 text-[clamp(40px,6vw,82px)] leading-[1.02] text-[#1f4747]`}>Парикмахерская и маникюр на Кунцевщине</h1>
            <p className="mt-4 max-w-[480px] text-[18px] leading-relaxed text-[#1f4747]/80">Салон красоты «Лотос»: стрижки, окрашивание, кератиновое выпрямление, маникюр. Спокойно, по-доброму, с понятными ценами.</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a href="#book" className="inline-flex h-14 items-center gap-2 rounded-full bg-[#a8395c] px-7 text-[17px] font-semibold text-white shadow-[0_10px_30px_-10px_rgba(168,57,92,.6)] hover:bg-[#8e2d4c]">Записаться за минуту <ArrowRight size={18} /></a>
              <a href={'tel:' + tel(b.phone)} className="inline-flex h-14 items-center gap-2 rounded-full bg-white px-6 text-[17px] font-semibold text-[#1f4747] shadow-sm hover:bg-[#f2e8e1]"><Phone size={17} />{b.phone}</a>
            </div>
            <a href="#rating" className="mt-6 inline-flex items-center gap-3 text-[15px] text-[#1f4747]">
              <span className="flex text-[#e0a526]">{[0, 1, 2, 3, 4].map(i => <Star key={i} size={17} fill="currentColor" strokeWidth={0} />)}</span>
              <span><b>{b.rating}</b> · {b.rev} оценка на Яндекс Картах</span>
            </a>
          </div>
        </motion.div>
        {CH.map((c, i) => <Chapter key={c.n} p={p} c={c} i={i} />)}
        <motion.div style={{ opacity: hudO }} className="absolute bottom-[86px] left-5 right-5 z-[3] flex items-center justify-between md:bottom-7 md:left-8 md:right-8">
          <div className="flex items-center gap-2" aria-hidden="true">{dots.map((o, i) => <motion.span key={i} style={{ opacity: o }} className="h-2.5 w-8 rounded-full bg-[#a8395c]" />)}</div>
          <a href="#services" className="rounded-full bg-white/85 px-4 py-2 text-[15px] font-semibold text-[#1f4747] hover:bg-white">Пропустить →</a>
        </motion.div>
      </motion.div>
    </section>
  )
}

/* ---------------- services & prices ---------------- */
const SV = [
  { t: 'Мужская стрижка', d: 'Машинкой и ножницами, оформление.', price: '8–20 BYN', time: '≈ 30–45 мин', Icon: Scissors },
  { t: 'Женская стрижка', d: 'Стрижка и укладка по длине волос.', price: null, time: '≈ 45–60 мин', Icon: Scissors },
  { t: 'Окрашивание', d: 'Однотонное, тонирование, корни.', price: null, time: 'от 1,5 ч', Icon: Palette },
  { t: 'Кератиновое выпрямление', d: 'Гладкость и блеск, зависит от длины и густоты.', price: null, time: 'от 2 ч', Icon: Sparkles },
  { t: 'Маникюр', d: 'Обработка, покрытие по желанию.', price: null, time: '≈ 1–1,5 ч', Icon: Hand },
]
function Services() {
  return (
    <section id="services" className="scroll-mt-16 bg-[#fbf6f1] px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-[1280px]">
        <div className="grid gap-6 md:grid-cols-2 md:items-end">
          <h2 className={`${A} text-[clamp(44px,6vw,84px)] leading-[1] text-[#1f4747]`}>Услуги и цены</h2>
          <p className="max-w-[460px] rounded-2xl bg-[#fdeef1] px-5 py-4 text-[16px] leading-relaxed text-[#1f4747] md:justify-self-end">Цены — по данным карточки салона на Яндекс Картах. Точную стоимость уточняйте по телефону: она зависит от длины волос и объёма работы.</p>
        </div>
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SV.map(({ t, d, price, time, Icon }, i) => (
            <Reveal as="li" key={t} delay={i * 0.05} className="flex flex-col rounded-[28px] bg-white p-6 shadow-[0_1px_0_rgba(31,71,71,.06),0_20px_40px_-30px_rgba(31,71,71,.4)] md:p-7">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-[#fdeef1] text-[#a8395c]"><Icon size={22} /></span>
              <h3 className={`${A} mt-5 text-[28px] leading-tight text-[#1f4747]`}>{t}</h3>
              <p className="mt-1 flex-1 text-[16px] leading-snug text-[#1f4747]/75">{d}</p>
              <div className="mt-5 flex items-end justify-between gap-3 border-t border-[#1f4747]/10 pt-4">
                <div>
                  <p className={price ? 'text-[24px] font-bold text-[#1f4747]' : 'text-[17px] font-semibold text-[#1f4747]/70'}>{price || 'уточняйте'}</p>
                  <p className="text-[14px] text-[#1f4747]/65">{time}</p>
                </div>
                <a href="#book" data-svc={t} className="inline-flex h-11 items-center gap-1.5 rounded-full bg-[#1f4747] px-4 text-[15px] font-semibold text-white hover:bg-[#a8395c]">Записаться</a>
              </div>
            </Reveal>
          ))}
          <Reveal as="li" delay={0.25} className="flex flex-col justify-between rounded-[28px] bg-[#1f4747] p-6 text-white md:p-7">
            <p className={`${A} text-[28px] leading-tight`}>Не знаете, что выбрать?</p>
            <p className="mt-2 text-[16px] text-white/80">Позвоните — мастер подскажет и назовёт цену.</p>
            <a href={'tel:' + tel(b.phone)} className="mt-6 inline-flex h-12 w-fit items-center gap-2 rounded-full bg-white px-5 text-[16px] font-semibold text-[#1f4747]"><Phone size={16} />{b.phone}</a>
          </Reveal>
        </ul>
        <p className="mt-6 text-[14px] text-[#1f4747]/65">Время — ориентировочное.</p>
      </div>
    </section>
  )
}

/* ---------------- booking: one minute, big steps ---------------- */
const BSV = [['Стрижка', Scissors], ['Окрашивание', Palette], ['Кератин', Sparkles], ['Маникюр', Hand], ['Не знаю — подскажите', HelpCircle]]
const DAYS = ['Сегодня', 'Завтра', 'На этой неделе', 'Перезвоните мне']
function Tile({ on, children, ...r }) {
  return <button type="button" aria-pressed={on} className={`flex min-h-[72px] items-center gap-3 rounded-2xl border-2 px-5 text-left text-[19px] font-semibold transition-colors ${on ? 'border-[#a8395c] bg-[#fdeef1] text-[#1f4747]' : 'border-[#1f4747]/15 bg-white text-[#1f4747] hover:border-[#1f4747]/40'}`} {...r}>{children}</button>
}
function Book() {
  const bk = useBooking()
  const [step, setStep] = useState(0)
  const [day, setDay] = useState('')
  const [err, setErr] = useState('')
  const head = useRef(null)
  useEffect(() => { if (step) head.current?.focus() }, [step])
  useEffect(() => { if (bk.s.svc) setErr('') }, [bk.s.svc])
  const go = s => { setErr(''); setStep(s) }
  const pickSvc = s => { bk.upd('svc', s); setTimeout(() => go(1), 180) }
  const pickDay = d => { setDay(d); setTimeout(() => go(2), 180) }
  const submit = e => { e.preventDefault(); if (!bk.s.svc) return go(0); if (!day) return go(1); bk.submit() }
  const custom = bk.s.svc && !BSV.some(x => x[0] === bk.s.svc)
  return (
    <section id="book" className="scroll-mt-16 bg-[#e3efeb] px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-[920px]">
        <h2 className={`${A} text-center text-[clamp(44px,6vw,84px)] leading-[1] text-[#1f4747]`}>Записаться за минуту</h2>
        <p className="mx-auto mt-4 max-w-[520px] text-center text-[18px] text-[#1f4747]/80">Три простых шага. Мы перезвоним и подтвердим время.</p>
        <div className="mt-10 rounded-[32px] bg-white p-5 shadow-[0_30px_60px_-40px_rgba(31,71,71,.5)] md:p-10">
          {bk.s.sent ? (
            <div className="py-6 text-center" role="status">
              <CheckDraw className="mx-auto text-[#a8395c]" size={88} />
              <p className={`${A} mt-5 text-[40px] leading-none text-[#1f4747]`}>Готово, спасибо!</p>
              <p className="mx-auto mt-4 max-w-[440px] text-[18px] text-[#1f4747]/80">{bk.s.svc} · {day}. Мы перезвоним на {bk.s.phone}. В готовом сайте заявка сразу придёт вам в Telegram.</p>
              <button type="button" onClick={() => { bk.reset(); setStep(0); setDay('') }} className="mt-8 h-12 rounded-full border-2 border-[#1f4747]/20 px-6 text-[16px] font-semibold text-[#1f4747]">Новая запись</button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              <div className="flex items-center justify-between">
                <p className="text-[17px] font-semibold text-[#1f4747]">Шаг {step + 1} из 3</p>
                {step > 0 && <button type="button" onClick={() => go(step - 1)} className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-3 text-[16px] font-semibold text-[#1f4747]/75 hover:bg-[#f2e8e1]"><ArrowLeft size={17} />Назад</button>}
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2" aria-hidden="true">{[0, 1, 2].map(i => <span key={i} className={`h-2 rounded-full ${i <= step ? 'bg-[#a8395c]' : 'bg-[#1f4747]/10'}`} />)}</div>
              <h3 ref={head} tabIndex={-1} className={`${A} mt-8 text-[34px] leading-tight text-[#1f4747] outline-none md:text-[40px]`}>{['Что хотите сделать?', 'Когда удобно?', 'Как вас зовут и куда звонить?'][step]}</h3>
              <AnimatePresence mode="wait">
                <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }} className="mt-6">
                  {step === 0 && <div className="grid gap-3 sm:grid-cols-2">{custom && <Tile on onClick={() => go(1)}>{bk.s.svc}</Tile>}{BSV.map(([s, I]) => <Tile key={s} on={bk.s.svc === s} onClick={() => pickSvc(s)}><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#fdeef1] text-[#a8395c]"><I size={19} /></span>{s}</Tile>)}</div>}
                  {step === 1 && <div className="grid gap-3 sm:grid-cols-2">{DAYS.map(d => <Tile key={d} on={day === d} onClick={() => pickDay(d)}>{d}</Tile>)}</div>}
                  {step === 2 && <div className="space-y-5">
                    <div><label htmlFor="l-name" className="text-[17px] font-semibold text-[#1f4747]">Имя</label><input id="l-name" value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} autoComplete="name" className="mt-2 h-16 w-full rounded-2xl border-2 border-[#1f4747]/15 px-5 text-[19px] text-[#1f4747] outline-none focus:border-[#a8395c] focus:ring-4 focus:ring-[#f3b6c6]/50" /></div>
                    <div><label htmlFor="l-phone" className="text-[17px] font-semibold text-[#1f4747]">Телефон</label><input id="l-phone" value={bk.s.phone} onChange={e => bk.upd('phone', e.target.value)} onFocus={phoneFocus(bk)} type="tel" inputMode="tel" autoComplete="tel" placeholder="+375 __ ___-__-__" aria-invalid={bk.s.err} aria-describedby={bk.s.err ? 'l-perr' : undefined} className={`mt-2 h-16 w-full rounded-2xl border-2 px-5 text-[19px] text-[#1f4747] outline-none placeholder:text-[#1f4747]/35 focus:ring-4 focus:ring-[#f3b6c6]/50 ${bk.s.err ? 'border-[#b3261e]' : 'border-[#1f4747]/15 focus:border-[#a8395c]'}`} />
                      {bk.s.err && <p id="l-perr" className="mt-2 text-[16px] font-semibold text-[#b3261e]" role="alert">Проверьте номер — 12 цифр с кодом +375.</p>}</div>
                    <button type="submit" disabled={bk.s.loading} className="flex h-16 w-full items-center justify-center gap-2 rounded-full bg-[#a8395c] text-[19px] font-bold text-white hover:bg-[#8e2d4c] disabled:opacity-60">{bk.s.loading ? 'Отправляем…' : <>Записаться <ArrowRight size={19} /></>}</button>
                    <p className="text-center text-[15px] text-[#1f4747]/70">{bk.s.svc} · {day}</p>
                  </div>}
                </motion.div>
              </AnimatePresence>
              {err && <p className="mt-4 text-[16px] font-semibold text-[#b3261e]" role="alert">{err}</p>}
            </form>
          )}
        </div>
        <p className="mt-6 text-center text-[17px] text-[#1f4747]">Удобнее голосом? <a href={'tel:' + tel(b.phone)} className="font-bold text-[#a8395c] underline underline-offset-4">{b.phone}</a> · <a href={b.viber} className="font-bold text-[#a8395c] underline underline-offset-4">Viber</a></p>
      </div>
    </section>
  )
}

/* ---------------- how ---------------- */
const STEPS = [['Записались', 'На сайте, по телефону или в Viber.'], ['Пришли', `${b.addr}. Вход с пандусом.`], ['Обсудили', 'Мастер слушает, советует и называет цену заранее.'], ['Готово', 'Уходите с хорошим настроением.']]
function How() {
  return (
    <section id="how" className="scroll-mt-16 bg-[#fbf6f1] px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-[1280px]">
        <h2 className={`${A} text-[clamp(44px,6vw,84px)] leading-[1] text-[#1f4747]`}>Как это работает</h2>
        <ol className="mt-12 grid gap-4 md:grid-cols-4">
          {STEPS.map(([h, d], i) => (
            <Reveal as="li" key={h} delay={i * 0.06} className="relative rounded-[28px] bg-white p-6">
              <span className={`${A} grid h-14 w-14 place-items-center rounded-full bg-[#a8395c] text-[28px] text-white`}>{i + 1}</span>
              <h3 className={`${A} mt-6 text-[28px] text-[#1f4747]`}>{h}</h3>
              <p className="mt-2 text-[16.5px] leading-snug text-[#1f4747]/75">{d}</p>
            </Reveal>
          ))}
        </ol>
        <div className="mt-6 flex items-start gap-4 rounded-[28px] bg-[#1f4747] p-6 text-white md:items-center md:p-8">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-white/10"><Accessibility size={28} /></span>
          <div><p className={`${A} text-[26px] leading-tight`}>Удобно для всех</p><p className="mt-1 text-[16.5px] text-white/80">У входа есть пандус — можно с коляской или на кресле. Если нужна помощь — скажите при записи.</p></div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- rating ---------------- */
function Rating() {
  return (
    <section id="rating" className="scroll-mt-16 overflow-hidden bg-[#fdeef1] px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto grid max-w-[1280px] items-center gap-10 md:grid-cols-2">
        <div className="relative">
          <p className={`${A} text-[clamp(140px,22vw,300px)] leading-[.85] text-[#a8395c]`}>{b.rating}</p>
          <div className="mt-2 flex text-[#e0a526]">{[0, 1, 2, 3, 4].map(i => <Star key={i} size={30} fill="currentColor" strokeWidth={0} />)}</div>
        </div>
        <div>
          <p className={`${A} text-[clamp(32px,3.6vw,50px)] leading-[1.05] text-[#1f4747]`}>{b.rev} оценка на Яндекс Картах — средний балл {b.rating}.</p>
          <p className="mt-4 max-w-[440px] text-[17px] leading-relaxed text-[#1f4747]/80">Что пишут клиенты — читайте на странице салона.</p>
          <a href={`https://yandex.ru/maps/org/${b.oid}/reviews/`} target="_blank" rel="noopener" className="mt-7 inline-flex h-14 items-center gap-2 rounded-full bg-[#1f4747] px-6 text-[17px] font-semibold text-white hover:bg-[#a8395c]">Читать отзывы <ArrowRight size={18} /></a>
        </div>
      </div>
    </section>
  )
}

/* ---------------- FAQ ---------------- */
const FAQ = [
  ['Сколько стоит мужская стрижка?', 'По данным карточки салона — 8–20 BYN, зависит от сложности. Точнее подскажет мастер.'],
  ['Сколько по времени кератин?', 'Обычно от 2 часов — зависит от длины и густоты волос. Уточните при записи.'],
  ['Можно прийти с ребёнком или с коляской?', 'У входа есть пандус. Про детские стрижки и визит с ребёнком уточните по телефону.'],
  ['Нужна ли запись?', 'Лучше записаться — так не придётся ждать. Можно позвонить и спросить, есть ли окно сегодня.'],
  ['Как оплатить?', 'Способы оплаты уточняйте по телефону.'],
  ['Где вы находитесь?', `${b.addr}, ${b.district}, ${b.city}. Карта — ниже.`],
]
function Faq() {
  const [o, setO] = useState(0)
  return (
    <section id="faq" className="bg-[#fbf6f1] px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-[880px]">
        <h2 className={`${A} text-[clamp(44px,6vw,84px)] leading-[1] text-[#1f4747]`}>Частые вопросы</h2>
        <div className="mt-10 space-y-3">
          {FAQ.map(([q, a], i) => (
            <div key={q} className="rounded-2xl bg-white">
              <h3><button type="button" aria-expanded={o === i} aria-controls={'lq' + i} onClick={() => setO(o === i ? -1 : i)} className="flex w-full items-center justify-between gap-6 px-5 py-5 text-left text-[18px] font-semibold text-[#1f4747] md:px-6 md:text-[20px]">{q}<span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${o === i ? 'bg-[#a8395c] text-white' : 'bg-[#fdeef1] text-[#a8395c]'}`}>{o === i ? <Minus size={18} /> : <Plus size={18} />}</span></button></h3>
              <AnimatePresence initial={false}>{o === i && <motion.div id={'lq' + i} initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden"><p className="px-5 pb-6 text-[17px] leading-relaxed text-[#1f4747]/80 md:px-6">{a}</p></motion.div>}</AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Contact() {
  return (
    <section id="contact" className="scroll-mt-16 bg-[#1f4747] text-white">
      <div className="mx-auto grid max-w-[1280px] lg:grid-cols-2">
        <div className="px-5 py-20 md:px-8">
          <h2 className={`${A} text-[clamp(44px,6vw,84px)] leading-[1]`}>Как нас найти</h2>
          <dl className="mt-10 space-y-6">
            <div><dt className="text-[15px] text-white/65">Адрес</dt><dd className={`${A} mt-1 text-[28px]`}>{b.addr}<br />{b.district}, {b.city}</dd></div>
            <div><dt className="text-[15px] text-white/65">Вход</dt><dd className="mt-1 flex items-center gap-2 text-[18px]"><Accessibility size={18} />Есть пандус</dd></div>
            <div><dt className="text-[15px] text-white/65">Телефон / Viber</dt><dd><a href={'tel:' + tel(b.phone)} className={`${A} mt-1 inline-block text-[28px] text-[#f3b6c6]`}>{b.phone}</a></dd></div>
            <div><dt className="text-[15px] text-white/65">Часы работы</dt><dd className="mt-1 text-[18px]">Уточняйте по телефону</dd></div>
          </dl>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={'tel:' + tel(b.phone)} className="inline-flex h-14 items-center gap-2 rounded-full bg-[#f3b6c6] px-6 text-[17px] font-semibold text-[#1f4747]"><Phone size={17} />Позвонить</a>
            <a href={b.viber} className="inline-flex h-14 items-center rounded-full border-2 border-white/30 px-6 text-[17px] font-semibold hover:border-white">Viber</a>
            <a href={b.ig} target="_blank" rel="noopener" className="inline-flex h-14 items-center gap-2 rounded-full border-2 border-white/30 px-6 text-[17px] font-semibold hover:border-white"><IG />Instagram</a>
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
  return (
    <MotionConfig reducedMotion="user">
      <div className="overflow-x-clip font-['Mulish',sans-serif]" style={{ background: CREAM, color: INK, '--sel': PINK, '--selc': INK }}>
        <Ribbon name={b.name} bg={INK} fg="#fff" />
        <Header />
        <main>
          <Film lite={lite} />
          <Services />
          <Book />
          <How />
          <Rating />
          <Faq />
          <Contact />
        </main>
        <footer className="bg-[#173838] text-white/70"><div className="mx-auto flex max-w-[1280px] flex-wrap justify-between gap-3 px-5 py-6 text-[14px] md:px-8"><span>© 2026 {b.name} · Концепт сайта — Артём</span><span>{b.addr}, {b.city}</span></div></footer>
        <CallBar phone={b.phone} barCls="bg-white/95 backdrop-blur shadow-[0_-8px_24px_-12px_rgba(31,71,71,.3)]" callCls="rounded-full border-2 border-[#1f4747]/20 text-[#1f4747]" bookCls="rounded-full bg-[#a8395c] text-white" />
        <div className="h-[72px] bg-[#173838] sm:hidden" />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
