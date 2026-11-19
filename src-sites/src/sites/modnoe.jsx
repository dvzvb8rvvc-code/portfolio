import React, { useRef, useState, useEffect, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, useSpring, useInView, AnimatePresence, MotionConfig } from 'framer-motion'
import { ArrowRight, Phone, MapPin, Plus, Minus, Star, UserRound, Sparkles } from 'lucide-react'
import '../lib/base.css'
import { useSmooth, Ribbon, Reveal, useBooking, phoneFocus, CheckDraw, MapFrame, CallBar, tel, useLite, useIsMobile } from '../lib/kit'

const MagScene = lazy(() => import('./modnoe3d'))

const b = {
  name: 'Модное место', addr: 'ул. Сергея Есенина, 30', floor: '1 этаж', district: 'Малиновка', city: 'Минск',
  phone: '+375 29 601-98-01', rating: '4,7', rev: 123, oid: '1274326800',
  fb: 'https://facebook.com/1483060951917458', vk: 'https://vk.ru/club79173733',
}
const PAPER = '#f1e6d2', INK = '#221b17', RED = '#c42a2a', MUS = '#d79a2b'
const Y = "font-['Yeseva_One',serif]"
const NAV = [['services', 'Услуги'], ['master', 'Ваш мастер'], ['how', 'Как записаться'], ['rating', 'Отзывы'], ['contact', 'Контакты']]

const FB = p => (<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" {...p}><path d="M13.5 22v-8h2.7l.4-3.2h-3.1V8.8c0-.9.3-1.5 1.6-1.5h1.7V4.4c-.3 0-1.3-.1-2.5-.1-2.4 0-4.1 1.5-4.1 4.2v2.3H7.5V14h2.7v8h3.3Z" /></svg>)
const VK = p => (<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" {...p}><path d="M12.8 17.5c-5.5 0-8.6-3.8-8.8-10h2.8c.1 4.6 2.1 6.5 3.7 6.9V7.5h2.6v4c1.6-.2 3.3-2 3.8-4h2.6a7.7 7.7 0 0 1-3.5 5 7.9 7.9 0 0 1 4.1 5h-2.9a5 5 0 0 0-4.1-3.6v3.6h-.3Z" /></svg>)

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
    <header className="sticky top-0 z-40 border-b-2 border-[#221b17] bg-[#f1e6d2]">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-4 md:px-8">
        <a href="#top" className="flex items-baseline gap-3 text-[#221b17]">
          <span className={`${Y} text-[26px] leading-none text-[#c42a2a]`}>Модное место</span>
          <span className="hidden text-[13px] font-semibold uppercase tracking-[.14em] sm:inline">Малиновка</span>
        </a>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Разделы">
          {NAV.map(([id, t]) => <a key={id} href={'#' + id} aria-current={a === id ? 'true' : undefined} className={`px-3 py-2 text-[16px] font-medium transition-colors ${a === id ? 'bg-[#221b17] text-[#f1e6d2]' : 'text-[#221b17] hover:text-[#c42a2a]'}`}>{t}</a>)}
        </nav>
        <div className="flex items-center gap-2">
          <a href={'tel:' + tel(b.phone)} className="hidden items-center gap-2 px-2 text-[17px] font-semibold text-[#221b17] hover:text-[#c42a2a] md:flex"><Phone size={17} />{b.phone}</a>
          <a href="#master" className="inline-flex h-12 items-center bg-[#c42a2a] px-5 text-[16px] font-bold text-[#f1e6d2] hover:bg-[#221b17]">Записаться</a>
        </div>
      </div>
    </header>
  )
}

/* ---------- cover + pinned magazine ---------- */
const CH = [
  { n: 'с. 2–3', h: 'Окрашивание', d: 'Однотонное, с переходом или освежить цвет — мастер подберёт оттенок.', r: [0.13, 0.33] },
  { n: 'с. 4–5', h: 'Мелирование', d: 'Тонкие пряди или заметный контраст — обсудим до начала.', r: [0.33, 0.53] },
  { n: 'с. 6–7', h: 'Химзавивка', d: 'Объём и локоны. Мастер скажет, подойдёт ли вашим волосам.', r: [0.53, 0.73] },
  { n: 'с. 8–9', h: 'Ресницы и ваш мастер', d: 'Наращивание ресниц. Записывайтесь к своему мастеру — или мы подберём.', r: [0.73, 1.2] },
]
function Chapter({ p, c }) {
  const k = [c.r[0], c.r[0] + 0.04, c.r[1] - 0.04, c.r[1]]
  const o = useTransform(p, k, [0, 1, 1, 0])
  const x = useTransform(p, k, [-30, 0, 0, 20])
  return (
    <motion.div style={{ opacity: o, x }} className="pointer-events-none absolute inset-x-5 top-[4vh] md:left-10 md:right-auto md:top-[18vh] md:w-[36vw]">
      <p className="text-[15px] font-bold uppercase tracking-[.16em] text-[#c42a2a]">{c.n}</p>
      <h2 className={`${Y} mt-2 text-[clamp(44px,5.6vw,92px)] leading-[.95] text-[#221b17]`}>{c.h}</h2>
      <p className="mt-4 max-w-[420px] text-[18px] leading-snug text-[#221b17]/85 md:text-[20px]">{c.d}</p>
    </motion.div>
  )
}
function LiteMag({ p }) {
  const r = useTransform(p, [0.1, 0.9], [0, -170])
  return (
    <div className="absolute inset-x-0 bottom-[6%] flex justify-center md:inset-y-0 md:left-[42%] md:items-center" style={{ perspective: 1200 }}>
      <div className="relative h-[46vh] w-[34vh] bg-[#efe2c9] shadow-2xl">
        <motion.div style={{ rotateY: r, transformOrigin: 'left center' }} className="absolute inset-0 grid place-items-start bg-[#c42a2a] p-5">
          <span className={`${Y} text-[44px] leading-none text-[#f1e6d2]`}>МОДНОЕ<br />МЕСТО</span>
        </motion.div>
      </div>
    </div>
  )
}
function Film({ lite }) {
  const ref = useRef(null)
  const mob = useIsMobile()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.4 })
  const near = useInView(ref, { margin: '200px 0px' })
  const [mounted, setMounted] = useState(false)
  useEffect(() => { if (near) setMounted(true) }, [near])
  const heroO = useTransform(p, [0, 0.09], [1, 0])
  const heroPE = useTransform(p, v => (v < 0.05 ? 'auto' : 'none'))
  const stageY = useTransform(p, [0, 0.1], [mob ? '24vh' : '0vh', '0vh'])
  const page = useTransform(p, [0, 0.12, 0.32, 0.52, 0.72, 0.9], ['01', '01', '03', '05', '07', '09'])
  const hudO = useTransform(p, [0.05, 0.1], [0, 1])
  return (
    <section ref={ref} id="top" className="relative h-[300vh] bg-[#f1e6d2]">
      <div className="sticky top-16 h-[calc(100svh-64px)] overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 opacity-[.5]" style={{ backgroundImage: 'radial-gradient(rgba(34,27,23,.08) 1px, transparent 1px)', backgroundSize: '6px 6px' }} />
        <motion.div style={{ y: stageY }} className="absolute inset-0">
          {lite ? <LiteMag p={p} /> : mounted && <Suspense fallback={<LiteMag p={p} />}><MagScene progress={p} active={near} /></Suspense>}
        </motion.div>

        <motion.div style={{ opacity: heroO, pointerEvents: heroPE }} className="relative z-[2] mx-auto max-w-[1400px] px-5 pt-6 md:px-10 md:pt-[6vh]">
          <p className="inline-flex flex-wrap items-center gap-x-3 gap-y-1 border-y-2 border-[#221b17] py-1.5 text-[14px] font-bold uppercase tracking-[.12em] text-[#221b17]"><span>Выпуск: {b.district}</span><span className="text-[#c42a2a]">●</span><span className="inline-flex items-center gap-1.5"><MapPin size={14} />{b.addr}</span></p>
          <h1 className="mt-5 max-w-[620px] text-[#221b17]">
            <motion.span initial={{ y: '40%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, ease: [0.2, 0, 0, 1] }} className={`${Y} block text-[clamp(56px,8.6vw,140px)] leading-[.88] text-[#c42a2a]`}>Модное место</motion.span>
            <motion.span initial={{ y: '40%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, delay: 0.12, ease: [0.2, 0, 0, 1] }} className="mt-3 block text-[clamp(22px,2.2vw,30px)] font-semibold leading-tight">Парикмахерская в Малиновке</motion.span>
          </h1>
          <p className="mt-4 max-w-[500px] text-[18px] leading-snug text-[#221b17]/85 md:text-[20px]">Стрижки, окрашивание, мелирование, химзавивка и наращивание ресниц. Можно записаться к своему мастеру.</p>
          <div className="mt-5 flex flex-wrap items-center gap-5">
            <a href="#rating" className="grid h-[92px] w-[92px] -rotate-6 place-items-center rounded-full bg-[#d79a2b] text-center text-[#221b17] shadow-[4px_4px_0_#221b17]"><span><span className={`${Y} block text-[32px] leading-none`}>{b.rating}</span><span className="block text-[12px] font-bold leading-tight">{b.rev} оценки<br />Яндекс</span></span></a>
            <a href={'tel:' + tel(b.phone)} className="text-[22px] font-bold text-[#221b17] underline decoration-[#c42a2a] decoration-[3px] underline-offset-[6px]">{b.phone}</a>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#master" className="inline-flex h-14 items-center gap-2 bg-[#c42a2a] px-7 text-[18px] font-bold text-[#f1e6d2] shadow-[4px_4px_0_#221b17] hover:bg-[#221b17]">Записаться <ArrowRight size={19} /></a>
            <a href="#services" className="inline-flex h-14 items-center border-2 border-[#221b17] px-6 text-[18px] font-bold text-[#221b17] hover:bg-[#221b17] hover:text-[#f1e6d2]">Все услуги</a>
          </div>
        </motion.div>

        {CH.map(c => <Chapter key={c.n} p={p} c={c} />)}

        <motion.div style={{ opacity: hudO }} className="pointer-events-none absolute bottom-[88px] left-5 right-5 z-[3] flex items-end justify-between text-[#221b17] md:bottom-6 md:left-10 md:right-10">
          <p className="text-[15px] font-bold uppercase tracking-[.14em]">Страница <motion.span className={`${Y} text-[26px] text-[#c42a2a]`}>{page}</motion.span> / 09</p>
          <a href="#services" className="pointer-events-auto text-[16px] font-semibold underline underline-offset-4">Пропустить →</a>
        </motion.div>
      </div>
    </section>
  )
}

/* ---------- kinetic strip ---------- */
function Strip() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const x = useTransform(scrollYProgress, [0, 1], ['0%', '-40%'])
  const x2 = useTransform(scrollYProgress, [0, 1], ['-40%', '0%'])
  const W = 'Стрижки · Окрашивание · Мелирование · Химзавивка · Ресницы · '
  return (
    <div ref={ref} aria-hidden="true" className="overflow-hidden border-y-2 border-[#221b17] bg-[#c42a2a] py-4 text-[#f1e6d2]">
      <motion.p style={{ x }} className={`${Y} whitespace-nowrap text-[clamp(40px,6vw,88px)] leading-none`}>{W + W + W}</motion.p>
      <motion.p style={{ x: x2 }} className={`${Y} mt-2 whitespace-nowrap text-[clamp(40px,6vw,88px)] leading-none text-transparent [-webkit-text-stroke:1.5px_#f1e6d2]`}>{W + W + W}</motion.p>
    </div>
  )
}

/* ---------- services as table of contents ---------- */
const SV = [
  ['Женская стрижка', 'Форма, длина, чёлка — как привыкли или по-новому.', '≈ 1 ч'],
  ['Мужская стрижка', 'Классика и аккуратные короткие стрижки.', '≈ 30–40 мин'],
  ['Окрашивание', 'В один тон, с переходом, закрашивание седины.', 'от 2 ч'],
  ['Мелирование', 'Пряди светлее основного цвета — тонко или контрастно.', 'от 2 ч'],
  ['Химзавивка', 'Объём и локоны на длительный срок.', 'от 2 ч'],
  ['Укладка', 'К празднику, на работу или просто так.', '≈ 40 мин'],
  ['Наращивание ресниц', 'Подберём длину и изгиб под ваш взгляд.', 'от 2 ч'],
]
function Services() {
  return (
    <section id="services" className="scroll-mt-16 bg-[#f1e6d2] text-[#221b17]">
      <div className="mx-auto grid max-w-[1400px] lg:grid-cols-2">
        <div className="border-b-2 border-[#221b17] px-5 py-16 md:px-10 lg:border-b-0 lg:border-r-2 lg:py-24">
          <p className="text-[15px] font-bold uppercase tracking-[.16em] text-[#c42a2a]">В этом выпуске</p>
          <h2 className={`${Y} mt-3 text-[clamp(56px,8vw,128px)] leading-[.88]`}>Содер&shy;жание</h2>
          <p className="mt-6 max-w-[420px] text-[19px] leading-relaxed text-[#221b17]/80">Цены — уточняйте у администратора или мастера. Время — ориентировочное, зависит от длины и густоты волос.</p>
          <div className="mt-10 hidden aspect-[4/5] max-w-[360px] rotate-[-3deg] border-2 border-[#221b17] bg-[#c42a2a] p-6 shadow-[8px_8px_0_#221b17] lg:block">
            <p className={`${Y} text-[44px] leading-[.95] text-[#f1e6d2]`}>Мастер, к которому хочется вернуться</p>
            <a href="#master" className="mt-6 inline-flex h-12 items-center gap-2 bg-[#f1e6d2] px-5 text-[16px] font-bold text-[#221b17]">Ваш мастер <ArrowRight size={17} /></a>
          </div>
        </div>
        <ol className="px-5 py-10 md:px-10 lg:py-24">
          {SV.map(([t, d, time], i) => (
            <Reveal as="li" key={t} delay={i * 0.03} className="border-b border-[#221b17]/25 py-6 first:pt-0">
              <div className="flex items-baseline gap-3">
                <h3 className={`${Y} text-[clamp(28px,2.8vw,38px)] leading-none`}>{t}</h3>
                <span aria-hidden="true" className="mb-1 flex-1 border-b-2 border-dotted border-[#221b17]/40" />
                <span className="text-[16px] font-bold text-[#c42a2a]">с. {String(i + 1).padStart(2, '0')}</span>
              </div>
              <p className="mt-2 text-[18px] leading-snug text-[#221b17]/80">{d}</p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <span className="text-[16px] text-[#221b17]/65">{time} · цена — уточняйте</span>
                <a href="#master" data-svc={t} className="inline-flex h-12 items-center gap-2 border-2 border-[#221b17] px-5 text-[16px] font-bold hover:bg-[#221b17] hover:text-[#f1e6d2]">Записаться <ArrowRight size={16} /></a>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}

/* ---------- booking: «Ваш мастер» ---------- */
const BSV = ['Стрижка', 'Окрашивание', 'Мелирование', 'Химзавивка', 'Укладка', 'Наращивание ресниц', 'Не знаю — посоветуйте']
const DAYS = ['Сегодня', 'Завтра', 'На этой неделе', 'Перезвоните']
const PARTS = ['Утро', 'День', 'Вечер']
function Opt({ on, children, ...r }) {
  return <button type="button" aria-pressed={on} className={`min-h-[56px] border-2 px-5 text-[18px] font-semibold transition-colors ${on ? 'border-[#221b17] bg-[#221b17] text-[#f1e6d2]' : 'border-[#221b17]/35 bg-[#f1e6d2] text-[#221b17] hover:border-[#221b17]'}`} {...r}>{children}</button>
}
function MasterCard({ on, title, text, Icon, onClick }) {
  return (
    <button type="button" aria-pressed={on} onClick={onClick} className={`flex min-h-[130px] flex-col items-start gap-2 border-2 p-5 text-left transition-all ${on ? 'border-[#221b17] bg-[#c42a2a] text-[#f1e6d2] shadow-[6px_6px_0_#221b17]' : 'border-[#221b17]/35 bg-[#f1e6d2] text-[#221b17] hover:border-[#221b17]'}`}>
      <Icon size={26} />
      <span className={`${Y} text-[28px] leading-none`}>{title}</span>
      <span className={`text-[16px] ${on ? 'text-[#f1e6d2]/90' : 'text-[#221b17]/70'}`}>{text}</span>
    </button>
  )
}
function Book() {
  const bk = useBooking()
  const [step, setStep] = useState(0)
  const [mode, setMode] = useState('')
  const [master, setMaster] = useState('')
  const [day, setDay] = useState(''), [part, setPart] = useState('')
  const [err, setErr] = useState('')
  const head = useRef(null)
  useEffect(() => { if (step) head.current?.focus() }, [step])
  const next = e => {
    e.preventDefault()
    if (step === 0 && !mode) return setErr('Выберите вариант')
    if (step === 0 && mode === 'own' && !master.trim()) return setErr('Напишите имя мастера — или выберите «Подберите мне»')
    if (step === 1 && (!bk.s.svc || !day || !part)) return setErr('Выберите услугу, день и время суток')
    setErr('')
    if (step < 2) setStep(step + 1); else bk.submit()
  }
  const svc = bk.s.svc && !BSV.includes(bk.s.svc) ? [bk.s.svc, ...BSV] : BSV
  const who = mode === 'own' ? `к мастеру ${master.trim()}` : 'мастера подберём'
  return (
    <section id="master" className="scroll-mt-16 bg-[#e8d9be] px-5 py-20 text-[#221b17] md:px-10 md:py-28">
      <div className="mx-auto grid max-w-[1300px] gap-12 lg:grid-cols-[.8fr_1.2fr]">
        <div>
          <p className="text-[15px] font-bold uppercase tracking-[.16em] text-[#c42a2a]">Рубрика</p>
          <h2 className={`${Y} mt-3 text-[clamp(56px,8vw,120px)] leading-[.88]`}>Ваш мастер</h2>
          <p className="mt-6 max-w-[440px] text-[19px] leading-relaxed text-[#221b17]/85">Ходите к одному мастеру? Просто укажите имя. Впервые у нас — подберём мастера под вашу задачу.</p>
          <p className="mt-6 text-[17px] text-[#221b17]/75">Удобнее по телефону:</p>
          <a href={'tel:' + tel(b.phone)} className={`${Y} mt-1 inline-block text-[clamp(32px,3.6vw,46px)] text-[#c42a2a]`}>{b.phone}</a>
        </div>
        <div className="border-2 border-[#221b17] bg-[#f1e6d2] p-5 shadow-[10px_10px_0_#221b17] md:p-9">
          {bk.s.sent ? (
            <div className="py-6 text-center" role="status">
              <CheckDraw className="mx-auto text-[#c42a2a]" />
              <p className={`${Y} mt-5 text-[44px] leading-none`}>Заявка принята</p>
              <p className="mx-auto mt-4 max-w-[460px] text-[18px] leading-relaxed text-[#221b17]/80">{bk.s.svc}, {who}. {day}, {part.toLowerCase()}. Администратор перезвонит и подтвердит время. В готовом сайте заявка сразу придёт вам в Telegram.</p>
              <button type="button" onClick={() => { bk.reset(); setStep(0); setMode(''); setMaster(''); setDay(''); setPart('') }} className="mt-8 min-h-[48px] text-[17px] font-semibold underline underline-offset-4">Новая заявка</button>
            </div>
          ) : (
            <form onSubmit={next} noValidate>
              <div className="grid grid-cols-3 gap-1.5 text-[14px] font-bold" aria-hidden="true">{['Мастер', 'Услуга и время', 'Контакт'].map((t, i) => <span key={t} className={`py-2 text-center ${i <= step ? 'bg-[#221b17] text-[#f1e6d2]' : 'bg-[#221b17]/10 text-[#221b17]/60'}`}>{i + 1}. {t}</span>)}</div>
              <p className="sr-only">Шаг {step + 1} из 3</p>
              <h3 ref={head} tabIndex={-1} className={`${Y} mt-7 text-[36px] leading-none outline-none`}>{['К кому записать?', 'Что и когда?', 'Куда перезвонить?'][step]}</h3>
              <AnimatePresence mode="wait">
                <motion.div key={step} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }} className="mt-6">
                  {step === 0 && <div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <MasterCard on={mode === 'own'} Icon={UserRound} title="К своему мастеру" text="Укажу имя" onClick={() => { setMode('own'); setErr('') }} />
                      <MasterCard on={mode === 'pick'} Icon={Sparkles} title="Подберите мне" text="Впервые или всё равно к кому" onClick={() => { setMode('pick'); setErr('') }} />
                    </div>
                    {mode === 'own' && <div className="mt-5"><label htmlFor="m-master" className="text-[17px] font-semibold">Имя мастера</label><input id="m-master" value={master} onChange={e => { setMaster(e.target.value); setErr('') }} placeholder="Например: Ольга" className="mt-2 h-14 w-full border-2 border-[#221b17] bg-white/60 px-4 text-[18px] outline-none focus:border-[#c42a2a]" /></div>}
                  </div>}
                  {step === 1 && <div className="space-y-6">
                    <fieldset><legend className="mb-2 text-[17px] font-semibold">Услуга</legend><div className="flex flex-wrap gap-2">{svc.map(s => <Opt key={s} on={bk.s.svc === s} onClick={() => { bk.upd('svc', s); setErr('') }}>{s}</Opt>)}</div></fieldset>
                    <fieldset><legend className="mb-2 text-[17px] font-semibold">День</legend><div className="flex flex-wrap gap-2">{DAYS.map(d => <Opt key={d} on={day === d} onClick={() => { setDay(d); setErr('') }}>{d}</Opt>)}</div></fieldset>
                    <fieldset><legend className="mb-2 text-[17px] font-semibold">Время суток</legend><div className="flex flex-wrap gap-2">{PARTS.map(d => <Opt key={d} on={part === d} onClick={() => { setPart(d); setErr('') }}>{d}</Opt>)}</div></fieldset>
                  </div>}
                  {step === 2 && <div className="space-y-5">
                    <div><label htmlFor="m-name" className="text-[17px] font-semibold">Ваше имя</label><input id="m-name" value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} autoComplete="name" className="mt-2 h-14 w-full border-2 border-[#221b17] bg-white/60 px-4 text-[18px] outline-none focus:border-[#c42a2a]" /></div>
                    <div><label htmlFor="m-phone" className="text-[17px] font-semibold">Телефон</label><input id="m-phone" value={bk.s.phone} onChange={e => bk.upd('phone', e.target.value)} onFocus={phoneFocus(bk)} type="tel" inputMode="tel" autoComplete="tel" placeholder="+375 __ ___-__-__" aria-invalid={bk.s.err} aria-describedby={bk.s.err ? 'm-perr' : undefined} className={`mt-2 h-14 w-full border-2 bg-white/60 px-4 text-[18px] outline-none placeholder:text-[#221b17]/40 focus:border-[#c42a2a] ${bk.s.err ? 'border-[#c42a2a]' : 'border-[#221b17]'}`} />
                      {bk.s.err && <p id="m-perr" className="mt-2 text-[16px] font-semibold text-[#a01d1d]">Проверьте номер — 12 цифр с кодом +375.</p>}</div>
                    <p className="text-[16px] text-[#221b17]/70">Ваша запись: {bk.s.svc}, {who}, {day.toLowerCase()}, {part.toLowerCase()}.</p>
                  </div>}
                </motion.div>
              </AnimatePresence>
              {err && <p className="mt-4 text-[16px] font-semibold text-[#a01d1d]" role="alert">{err}</p>}
              <div className="mt-8 flex items-center justify-between">
                {step > 0 ? <button type="button" onClick={() => setStep(step - 1)} className="min-h-[48px] text-[17px] font-semibold text-[#221b17]/75 hover:text-[#221b17]">← Назад</button> : <span />}
                <button type="submit" disabled={bk.s.loading} className="inline-flex h-14 items-center gap-2 bg-[#c42a2a] px-7 text-[18px] font-bold text-[#f1e6d2] hover:bg-[#221b17] disabled:opacity-60">{step < 2 ? 'Дальше' : bk.s.loading ? 'Отправляем…' : 'Записаться'} <ArrowRight size={19} /></button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

/* ---------- how / rating / faq / contact ---------- */
const HOW = [['Позвоните или оставьте заявку', 'Как вам удобнее — телефон или форма на сайте.'], ['Скажите, к кому идёте', 'Назовите своего мастера или попросите подобрать.'], ['Подтвердим время', 'Администратор перезвонит и согласует запись.'], ['Приходите', `${b.addr}, ${b.floor}, ${b.district}.`]]
function How() {
  return (
    <section id="how" className="scroll-mt-16 border-t-2 border-[#221b17] bg-[#f1e6d2] px-5 py-20 text-[#221b17] md:px-10 md:py-28">
      <div className="mx-auto max-w-[1300px]">
        <h2 className={`${Y} text-[clamp(48px,7vw,104px)] leading-[.9]`}>Как записаться</h2>
        <ol className="mt-12 grid border-2 border-[#221b17] md:grid-cols-4">
          {HOW.map(([t, d], i) => (
            <Reveal as="li" key={t} delay={i * 0.06} className="border-[#221b17] p-6 max-md:border-b-2 max-md:last:border-b-0 md:border-r-2 md:last:border-r-0 md:p-8">
              <span className={`${Y} text-[72px] leading-none text-[#c42a2a]`}>{i + 1}</span>
              <h3 className="mt-3 text-[22px] font-bold leading-tight">{t}</h3>
              <p className="mt-2 text-[18px] leading-snug text-[#221b17]/80">{d}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
function Rating() {
  return (
    <section id="rating" className="scroll-mt-16 bg-[#221b17] px-5 py-20 text-[#f1e6d2] md:px-10 md:py-28">
      <div className="mx-auto grid max-w-[1300px] items-center gap-10 lg:grid-cols-2">
        <div>
          <p className="text-[15px] font-bold uppercase tracking-[.16em] text-[#d79a2b]">Письма читателей</p>
          <h2 className={`${Y} mt-3 text-[clamp(48px,6.6vw,100px)] leading-[.9]`}>Нас оценили на Яндекс Картах</h2>
          <p className="mt-5 max-w-[460px] text-[19px] text-[#f1e6d2]/80">Отзывы гостей — на странице салона. Почитайте, к кому из мастеров идут чаще.</p>
          <a href={`https://yandex.ru/maps/org/${b.oid}/reviews/`} target="_blank" rel="noopener" className="mt-8 inline-flex h-14 items-center gap-2 bg-[#d79a2b] px-7 text-[18px] font-bold text-[#221b17] hover:bg-[#f1e6d2]">Читать отзывы <ArrowRight size={19} /></a>
        </div>
        <Reveal className="relative mx-auto grid aspect-square w-full max-w-[420px] place-items-center rounded-full border-2 border-dashed border-[#d79a2b] p-6">
          <div className="text-center">
            <p className={`${Y} text-[clamp(120px,16vw,200px)] leading-[.8] text-[#d79a2b]`}>{b.rating}</p>
            <div className="mt-4 flex justify-center gap-1" aria-label="4,7 из 5">{[0, 1, 2, 3, 4].map(i => <Star key={i} size={26} fill={i < 4 ? '#d79a2b' : 'none'} stroke="#d79a2b" />)}</div>
            <p className="mt-3 text-[20px] font-semibold">{b.rev} оценки</p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
const FAQ = [
  ['Можно записаться к определённому мастеру?', 'Да. Укажите имя мастера в заявке или скажите по телефону — подберём время у него.'],
  ['Сколько длится окрашивание?', 'Обычно от двух часов — зависит от длины, густоты волос и техники. Точнее скажет мастер.'],
  ['Подойдёт ли мне химзавивка?', 'Это лучше решить вместе с мастером: он посмотрит состояние волос и подскажет.'],
  ['Сколько стоит?', 'Цены уточняйте по телефону — зависят от длины волос и объёма работы.'],
  ['Как оплатить?', 'Способы оплаты уточняйте по телефону.'],
  ['Где вы находитесь?', `${b.addr}, ${b.floor}, ${b.district}. Карта — ниже.`],
]
function Faq() {
  const [o, setO] = useState(0)
  return (
    <section id="faq" className="bg-[#f1e6d2] px-5 py-20 text-[#221b17] md:px-10 md:py-28">
      <div className="mx-auto grid max-w-[1300px] gap-10 lg:grid-cols-[.8fr_1.2fr]">
        <h2 className={`${Y} text-[clamp(48px,7vw,104px)] leading-[.9]`}>Вопрос — ответ</h2>
        <div className="border-t-2 border-[#221b17]">
          {FAQ.map(([q, a], i) => (
            <div key={q} className="border-b-2 border-[#221b17]">
              <h3><button type="button" aria-expanded={o === i} aria-controls={'mq' + i} onClick={() => setO(o === i ? -1 : i)} className="flex w-full items-center justify-between gap-6 py-5 text-left text-[20px] font-bold md:text-[22px]">{q}<span className={`grid h-11 w-11 shrink-0 place-items-center ${o === i ? 'bg-[#c42a2a] text-[#f1e6d2]' : 'bg-[#221b17] text-[#f1e6d2]'}`}>{o === i ? <Minus size={20} /> : <Plus size={20} />}</span></button></h3>
              <AnimatePresence initial={false}>{o === i && <motion.div id={'mq' + i} initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.28 }} className="overflow-hidden"><p className="max-w-[680px] pb-6 text-[18px] leading-relaxed text-[#221b17]/85">{a}</p></motion.div>}</AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
function Contact() {
  return (
    <section id="contact" className="scroll-mt-16 border-t-2 border-[#221b17] bg-[#e8d9be] text-[#221b17]">
      <div className="mx-auto grid max-w-[1400px] lg:grid-cols-2">
        <div className="px-5 py-20 md:px-10">
          <h2 className={`${Y} text-[clamp(48px,7vw,104px)] leading-[.9]`}>Контакты</h2>
          <dl className="mt-10 space-y-6">
            <div><dt className="text-[15px] font-bold uppercase tracking-[.14em] text-[#c42a2a]">Адрес</dt><dd className={`${Y} mt-1 text-[30px] leading-tight`}>{b.addr}, {b.floor}<br /><span className="text-[#221b17]/70">{b.district}, {b.city}</span></dd></div>
            <div><dt className="text-[15px] font-bold uppercase tracking-[.14em] text-[#c42a2a]">Телефон</dt><dd><a href={'tel:' + tel(b.phone)} className={`${Y} mt-1 inline-block text-[34px]`}>{b.phone}</a></dd></div>
            <div><dt className="text-[15px] font-bold uppercase tracking-[.14em] text-[#c42a2a]">Часы работы</dt><dd className="mt-1 text-[18px]">Уточняйте по телефону</dd></div>
          </dl>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={'tel:' + tel(b.phone)} className="inline-flex h-14 items-center gap-2 bg-[#c42a2a] px-7 text-[18px] font-bold text-[#f1e6d2]"><Phone size={19} />Позвонить</a>
            <a href={b.vk} target="_blank" rel="noopener" className="inline-flex h-14 items-center gap-2 border-2 border-[#221b17] px-5 text-[17px] font-bold hover:bg-[#221b17] hover:text-[#f1e6d2]"><VK />ВКонтакте</a>
            <a href={b.fb} target="_blank" rel="noopener" className="inline-flex h-14 items-center gap-2 border-2 border-[#221b17] px-5 text-[17px] font-bold hover:bg-[#221b17] hover:text-[#f1e6d2]"><FB />Facebook</a>
            <a href={`https://yandex.ru/maps/org/${b.oid}/`} target="_blank" rel="noopener" className="inline-flex h-14 items-center gap-2 px-3 text-[17px] font-bold underline decoration-[#c42a2a] decoration-2 underline-offset-4">Маршрут <ArrowRight size={18} /></a>
          </div>
        </div>
        <div className="h-[400px] border-t-2 border-[#221b17] lg:h-auto lg:min-h-[560px] lg:border-l-2 lg:border-t-0"><MapFrame oid={b.oid} /></div>
      </div>
    </section>
  )
}

function App() {
  useSmooth()
  const lite = useLite()
  return (
    <MotionConfig reducedMotion="user">
      <div className="overflow-x-clip font-['Commissioner',sans-serif] text-[18px]" style={{ background: PAPER, color: INK, '--sel': RED, '--selc': PAPER }}>
        <Ribbon name={b.name} bg={INK} fg={PAPER} />
        <Header />
        <main>
          <Film lite={lite} />
          <Strip />
          <Services />
          <span id="book" aria-hidden="true" className="block" />
          <Book />
          <How />
          <Rating />
          <Faq />
          <Contact />
        </main>
        <footer className="flex flex-wrap justify-between gap-3 border-t-2 border-[#221b17] bg-[#221b17] px-5 py-6 text-[15px] text-[#f1e6d2]/70 md:px-10"><span>© 2026 {b.name} · Концепт сайта — Артём</span><span>{b.addr}, {b.city}</span></footer>
        <CallBar phone={b.phone} barCls="bg-[#f1e6d2] border-t-2 border-[#221b17]" callCls="border-2 border-[#221b17] text-[#221b17] text-[17px]" bookCls="bg-[#c42a2a] text-[#f1e6d2] text-[17px]" />
        <div className="h-[72px] bg-[#221b17] sm:hidden" />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
