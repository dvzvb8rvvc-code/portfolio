import React, { useRef, useState, useEffect, useMemo, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, useSpring, useInView, useMotionValueEvent, AnimatePresence, MotionConfig } from 'framer-motion'
import { ArrowRight, ArrowLeft, Phone, MapPin, Star, X, MessageCircle } from 'lucide-react'
import '../lib/base.css'
import { Ribbon, useBooking, phoneFocus, CheckDraw, MapFrame, CallBar, tel, useLite, IG, TG } from '../lib/kit'

const Scene = lazy(() => import('./oliver3d'))

const b = {
  name: 'Оливер', addr: 'просп. Независимости, 177', place: 'ТЦ «Порт», секция 4', city: 'Минск',
  phone: '+375 17 301-10-20', mob: '+375 33 661-19-96', viber: 'https://viber.click/375336611996',
  tg: 'https://t.me/+375336611996', ig: 'https://www.instagram.com/salon.oliver', rating: '4,7', rev: 109, oid: '29243821712',
}
const F = "font-['Manrope',sans-serif]"
const INK = '#0c0c0d'

const SLIDES = [
  { id: 's0', t: 'Оливер', l: 'Салон красоты, парикмахерская и солярий в ТЦ «Порт»', bg: '#121315', glow: 'rgba(160,180,255,.18)', b2: ['Направления', '#s1'] },
  { id: 's1', k: 'Стрижки', t: 'Стрижки', l: 'Женские, мужские и детские — форма под ваш ритм жизни', bg: '#0f1217', glow: 'rgba(140,170,255,.22)',
    list: ['Женская стрижка', 'Мужская стрижка', 'Детская стрижка', 'Укладка', 'Причёска к событию'] },
  { id: 's2', k: 'Окрашивание', t: 'Окрашивание', l: 'От мягкого тона до смелого цвета — оттенок подбираем вместе', bg: '#160e11', glow: 'rgba(255,110,140,.2)',
    list: ['Окрашивание в один тон', 'Окрашивание корней', 'Тонирование', 'Мелирование', 'Сложное окрашивание'] },
  { id: 's3', k: 'Солярий', t: 'Солярий', l: 'Тёплый свет в любой сезон — в том же салоне', bg: '#170d05', glow: 'rgba(255,150,60,.26)',
    list: ['Сеанс загара', 'Первый визит: время подберёт администратор'] },
  { id: 's4', k: 'Уход', t: 'Уход', l: 'Блеск, мягкость и пауза для себя', bg: '#0a1412', glow: 'rgba(120,230,200,.18)',
    list: ['Уход для волос', 'Восстановление после окрашивания', 'Уход для кожи головы', 'Экспресс-уход'] },
]
const DIRS = SLIDES.slice(1)

/* ---------------- buttons (Tesla-like) ---------------- */
const BTN = 'inline-flex h-11 w-full items-center justify-center rounded-[4px] px-6 text-[14px] font-semibold tracking-[.01em] transition-colors sm:w-[248px]'
const B1 = BTN + ' bg-[#f4f4f4] text-[#171a20] hover:bg-white'
const B2 = BTN + ' bg-white/[.14] text-white backdrop-blur-md hover:bg-white/[.24]'

function Mask({ children, delay = 0, className = '' }) {
  return (
    <motion.span className="block overflow-hidden pb-[0.08em]" initial="h" whileInView="v" viewport={{ amount: 0.5 }}>
      <motion.span className={'block ' + className} variants={{ h: { y: '105%' }, v: { y: '0%' } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay }}>{children}</motion.span>
    </motion.span>
  )
}

function Slide({ s, i, onMore, onBook }) {
  return (
    <section id={s.id} className="relative flex h-[100svh] snap-start snap-always flex-col items-center justify-between px-5 pb-[104px] pt-[92px] text-center sm:pb-14 sm:pt-[104px]">
      <div>
        {i === 0 ? (
          <h1 className={`${F} text-[clamp(56px,11vw,150px)] font-medium leading-[.9] tracking-[-0.045em]`}><Mask>{s.t}</Mask></h1>
        ) : (
          <h2 className={`${F} text-[clamp(40px,6.4vw,84px)] font-medium leading-[.95] tracking-[-0.04em]`}><Mask>{s.t}</Mask></h2>
        )}
        <motion.p initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ amount: 0.6 }} transition={{ duration: 0.8, delay: 0.25 }} className="mx-auto mt-3 max-w-[460px] text-[15px] leading-snug text-white/70 md:text-[16px]">
          {s.l}
          {i === 0 && <span className="mt-1 block text-white/45">{b.addr}, {b.place}</span>}
        </motion.p>
      </div>
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ amount: 0.6 }} transition={{ duration: 0.7, delay: 0.35 }} className="flex w-full max-w-[340px] flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center sm:gap-6">
        <button type="button" onClick={() => onBook(s.k)} className={B1}>Записаться</button>
        {s.b2 ? <a href={s.b2[1]} className={B2}>{s.b2[0]}</a> : <button type="button" onClick={() => onMore(s)} className={B2}>Подробнее</button>}
      </motion.div>
      {i === 0 && <motion.span aria-hidden="true" animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute bottom-[78px] hidden text-white/40 sm:bottom-4 sm:block">⌄</motion.span>}
    </section>
  )
}

function LiteStage({ idx }) {
  const s = SLIDES[idx]
  return (
    <div className="absolute inset-0 grid place-items-center">
      <motion.div key={idx} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9 }}
        className="h-[42vmin] w-[42vmin] rounded-full" style={{ background: `radial-gradient(circle at 40% 35%, ${s.glow.replace(/[\d.]+\)$/, '0.9)')}, transparent 65%)` }} />
    </div>
  )
}

function Dots({ idx }) {
  return (
    <div className="pointer-events-auto absolute right-5 top-1/2 hidden -translate-y-1/2 flex-col gap-3 md:flex">
      {SLIDES.map((s, i) => <a key={s.id} href={'#' + s.id} aria-label={s.k || s.t} className="group flex items-center justify-end gap-3 py-1">
        <span className={`${F} text-[11px] font-semibold text-white/0 transition-colors group-hover:text-white/60`}>{s.k || 'Начало'}</span>
        <span className={`block h-[2px] rounded-full transition-all duration-500 ${i === idx ? 'w-7 bg-white' : 'w-3 bg-white/30'}`} />
      </a>)}
    </div>
  )
}

function Film({ lite, onMore, onBook }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const p = useSpring(useTransform(scrollYProgress, v => v * (SLIDES.length - 1)), { stiffness: 80, damping: 22, mass: 0.4 })
  const near = useInView(ref, { margin: '200px 0px' })
  const [mounted, setMounted] = useState(false)
  const [idx, setIdx] = useState(0)
  useEffect(() => { if (near) setMounted(true) }, [near])
  useMotionValueEvent(p, 'change', v => setIdx(Math.max(0, Math.min(SLIDES.length - 1, Math.round(v)))))
  const keys = SLIDES.map((_, i) => i)
  const bg = useTransform(p, keys, SLIDES.map(s => s.bg))
  const glow = useTransform(p, keys, SLIDES.map(s => s.glow))
  const glowBg = useTransform(glow, g => `radial-gradient(60% 55% at 50% 58%, ${g}, transparent 70%)`)
  return (
    <div ref={ref} className="relative">
      <motion.div className="sticky top-0 h-[100svh] overflow-hidden" style={{ background: bg }}>
        <motion.div className="absolute inset-0" style={{ background: glowBg }} />
        <div className="absolute inset-x-0 bottom-0 h-[30%] bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute inset-0">
          {lite ? <LiteStage idx={idx} /> : mounted && <Suspense fallback={null}><Scene progress={p} active={near} /></Suspense>}
        </div>
        <Dots idx={idx} />
      </motion.div>
      <div className="relative -mt-[100svh]">
        {SLIDES.map((s, i) => <Slide key={s.id} s={s} i={i} onMore={onMore} onBook={onBook} />)}
      </div>
    </div>
  )
}

/* ---------------- details sheet ---------------- */
function Sheet({ s, onClose, onBook }) {
  useEffect(() => {
    if (!s) return
    const k = e => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k)
  }, [s])
  return (
    <AnimatePresence>
      {s && (
        <motion.div className="fixed inset-0 z-[75] flex items-end justify-center bg-black/50 backdrop-blur-sm md:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div role="dialog" aria-modal="true" aria-label={s.t} onClick={e => e.stopPropagation()} initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }} transition={{ duration: 0.45, ease: [0.2, 0, 0, 1] }}
            className="w-full max-w-[560px] rounded-t-[14px] bg-[#f4f4f4] p-7 text-[#171a20] md:rounded-[10px] md:p-10">
            <div className="flex items-start justify-between">
              <h3 className={`${F} text-[34px] font-medium tracking-[-0.03em]`}>{s.t}</h3>
              <button type="button" onClick={onClose} autoFocus aria-label="Закрыть" className="grid h-10 w-10 place-items-center rounded-full hover:bg-black/5"><X size={20} /></button>
            </div>
            <p className="mt-1 text-[15px] text-[#171a20]/60">{s.l}</p>
            <ul className="mt-6 divide-y divide-black/10 border-y border-black/10">
              {s.list.map(x => <li key={x} className="flex items-center justify-between py-3.5 text-[15.5px]">{x}<span className="h-1.5 w-1.5 rounded-full bg-[#171a20]/30" /></li>)}
            </ul>
            <p className="mt-4 text-[13px] text-[#171a20]/50">Точный перечень и время уточнит администратор.</p>
            <button type="button" onClick={() => { onClose(); onBook(s.k) }} className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-[4px] bg-[#3e6ae1] text-[14px] font-semibold text-white hover:bg-[#3457b1]">Записаться — {s.t.toLowerCase()}</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ---------------- proof ---------------- */
function Proof() {
  return (
    <section className="relative flex min-h-[100svh] snap-start flex-col items-center justify-between overflow-hidden bg-[#f4f4f4] px-5 pb-[104px] pt-[96px] text-center text-[#171a20] sm:pb-14">
      <div>
        <h2 className={`${F} text-[clamp(40px,6.4vw,84px)] font-medium leading-[.95] tracking-[-0.04em]`}><Mask>Нам доверяют</Mask></h2>
        <p className="mt-3 text-[15px] text-[#171a20]/60">{b.rev} оценок на Яндекс Картах</p>
      </div>
      <div className="relative">
        <motion.p initial={{ opacity: 0, scale: 0.92, filter: 'blur(10px)' }} whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} viewport={{ amount: 0.5 }} transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className={`${F} text-[clamp(140px,30vw,380px)] font-medium leading-[.8] tracking-[-0.07em]`}>{b.rating}</motion.p>
        <div className="mt-6 flex justify-center gap-1.5">{[0, 1, 2, 3, 4].map(i => <motion.span key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ amount: 0.5 }} transition={{ delay: 0.4 + i * 0.08 }}><Star size={22} className={i < 4 ? 'fill-[#171a20] text-[#171a20]' : 'fill-[#171a20]/40 text-[#171a20]/0'} /></motion.span>)}</div>
      </div>
      <div className="flex w-full max-w-[340px] flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center sm:gap-6">
        <a href="#book" className={BTN + ' bg-[#171a20] text-white hover:bg-black'}>Записаться</a>
        <a href={`https://yandex.ru/maps/org/${b.oid}/reviews/`} target="_blank" rel="noopener" className={BTN + ' bg-[#171a20]/[.08] text-[#171a20] hover:bg-[#171a20]/[.14]'}>Читать отзывы</a>
      </div>
    </section>
  )
}

/* ---------------- 3-tap booking ---------------- */
const RU_D = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб']
const RU_M = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
const TIMES = [['Утро', 'до 12:00'], ['День', '12:00–17:00'], ['Вечер', 'после 17:00'], ['Любое', 'как удобнее мастеру']]
function Book({ dir, setDir }) {
  const bk = useBooking()
  const [step, setStep] = useState(0), [back, setBack] = useState(false)
  const [day, setDay] = useState(null), [time, setTime] = useState(null)
  const days = useMemo(() => Array.from({ length: 8 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i); return { i, top: i === 0 ? 'Сегодня' : i === 1 ? 'Завтра' : RU_D[d.getDay()], n: d.getDate(), m: RU_M[d.getMonth()] } }), [])
  useEffect(() => { if (dir) { setStep(s => (s === 0 ? 1 : s)); setBack(false) } }, [dir])
  const go = n => { setBack(n < step); setStep(n) }
  const steps = ['Направление', 'День', 'Время', 'Контакты']
  const dLabel = day != null ? (day.i < 2 ? day.top : `${day.top}, ${day.n} ${day.m}`) : ''
  const summary = [dir, dLabel, time].filter(Boolean).join(' · ')
  const send = e => { e.preventDefault(); bk.set(p => ({ ...p, svc: summary })); bk.submit() }
  const reset = () => { bk.reset(); setDir(null); setDay(null); setTime(null); setStep(0) }
  return (
    <section id="book" className="relative flex min-h-[100svh] snap-start flex-col items-center bg-[#0c0c0d] px-5 pb-[110px] pt-[96px] text-white sm:pb-16">
      <div className="text-center">
        <h2 className={`${F} text-[clamp(36px,5.6vw,76px)] font-medium leading-[.98] tracking-[-0.04em]`}><Mask>Записаться</Mask><Mask delay={0.08} className="text-white/45">за 3 касания</Mask></h2>
      </div>
      <div className="mt-10 w-full max-w-[880px]">
        <div className="grid grid-cols-4 gap-2">
          {steps.map((s, i) => (
            <button key={s} type="button" disabled={i > step || bk.s.sent} onClick={() => go(i)} className="text-left disabled:cursor-default">
              <span className="block h-[3px] overflow-hidden rounded-full bg-white/15"><motion.span className="block h-full bg-white" animate={{ width: bk.s.sent || i < step ? '100%' : i === step ? '45%' : '0%' }} transition={{ duration: 0.5 }} /></span>
              <span className={`${F} mt-2 block text-[11.5px] font-semibold sm:text-[13px] ${i <= step ? 'text-white' : 'text-white/35'}`}>{s}</span>
            </button>
          ))}
        </div>
        <p className="mt-6 h-5 text-[14px] text-white/50" aria-live="polite">{summary || 'Коснитесь варианта — следующий шаг откроется сам'}</p>
        <div className="relative mt-5 min-h-[330px] overflow-hidden">
          <AnimatePresence mode="wait" custom={back}>
            <motion.div key={bk.s.sent ? 'ok' : step} custom={back} initial={{ x: back ? -80 : 80, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: back ? 80 : -80, opacity: 0 }} transition={{ duration: 0.4, ease: [0.2, 0, 0, 1] }}>
              {bk.s.sent ? (
                <div className="py-8 text-center" role="status">
                  <CheckDraw className="mx-auto text-white" />
                  <p className={`${F} mt-5 text-[30px] font-medium tracking-[-0.03em]`}>Заявка отправлена</p>
                  <p className="mx-auto mt-2 max-w-[420px] text-white/60">{summary}. Администратор перезвонит и подтвердит время. В готовом сайте заявка сразу придёт вам в Telegram.</p>
                  <button type="button" onClick={reset} className="mt-7 text-[14px] text-white/55 underline underline-offset-4">Новая запись</button>
                </div>
              ) : step === 0 ? (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {DIRS.map(d => (
                    <button key={d.k} type="button" onClick={() => { setDir(d.k); go(1) }} aria-pressed={dir === d.k}
                      className={`group relative flex h-[150px] flex-col justify-end overflow-hidden rounded-[8px] p-4 text-left transition-colors md:h-[300px] ${dir === d.k ? 'bg-white text-[#171a20]' : 'bg-white/[.06] hover:bg-white/[.1]'}`}>
                      <span className="absolute inset-0 opacity-70 transition-transform duration-700 group-hover:scale-110" style={{ background: `radial-gradient(80% 60% at 50% 30%, ${d.glow.replace(/[\d.]+\)$/, '0.55)')}, transparent 70%)` }} />
                      <span className={`${F} relative text-[19px] font-semibold tracking-[-0.02em] md:text-[22px]`}>{d.t}</span>
                    </button>
                  ))}
                </div>
              ) : step === 1 ? (
                <div className="grid grid-cols-4 gap-2.5 md:grid-cols-8">
                  {days.map(d => (
                    <button key={d.i} type="button" onClick={() => { setDay(d); go(2) }} aria-pressed={day?.i === d.i}
                      className={`flex h-[96px] flex-col items-center justify-center rounded-[8px] transition-colors ${day?.i === d.i ? 'bg-white text-[#171a20]' : 'bg-white/[.06] hover:bg-white/[.12]'}`}>
                      <span className="text-[11.5px] opacity-60">{d.top}</span>
                      <span className={`${F} text-[28px] font-medium leading-none tracking-[-0.03em]`}>{d.n}</span>
                      <span className="text-[11.5px] opacity-60">{d.m}</span>
                    </button>
                  ))}
                </div>
              ) : step === 2 ? (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {TIMES.map(([t, s]) => (
                    <button key={t} type="button" onClick={() => { setTime(t); go(3) }} aria-pressed={time === t}
                      className={`flex h-[120px] flex-col justify-end rounded-[8px] p-4 text-left transition-colors ${time === t ? 'bg-white text-[#171a20]' : 'bg-white/[.06] hover:bg-white/[.12]'}`}>
                      <span className={`${F} text-[22px] font-semibold tracking-[-0.02em]`}>{t}</span>
                      <span className="text-[13px] opacity-60">{s}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <form onSubmit={send} noValidate className="mx-auto grid max-w-[520px] gap-3">
                  <input value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} autoComplete="name" placeholder="Имя" aria-label="Имя" autoFocus className="h-14 rounded-[6px] border border-white/15 bg-white/[.06] px-5 text-[16px] outline-none placeholder:text-white/35 focus:border-white/60" />
                  <input value={bk.s.phone} onChange={e => bk.upd('phone', e.target.value)} onFocus={phoneFocus(bk)} type="tel" inputMode="tel" autoComplete="tel" placeholder="+375 __ ___-__-__" aria-label="Телефон" aria-invalid={bk.s.err}
                    className={`h-14 rounded-[6px] border bg-white/[.06] px-5 text-[16px] outline-none placeholder:text-white/35 focus:border-white/60 ${bk.s.err ? 'border-[#ff6b6b]' : 'border-white/15'}`} />
                  {bk.s.err && <p className="text-[14px] text-[#ff8a8a]" role="alert">Проверьте номер — 12 цифр с кодом +375.</p>}
                  <button type="submit" disabled={bk.s.loading} className="mt-2 inline-flex h-12 items-center justify-center gap-2 rounded-[4px] bg-[#3e6ae1] text-[15px] font-semibold text-white hover:bg-[#3457b1] disabled:opacity-60">{bk.s.loading ? 'Отправляем…' : 'Отправить заявку'} <ArrowRight size={16} /></button>
                  <p className="text-center text-[12.5px] text-white/40">Администратор перезвонит и подтвердит время</p>
                </form>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        {!bk.s.sent && step > 0 && <button type="button" onClick={() => go(step - 1)} className="mt-4 inline-flex items-center gap-1.5 text-[14px] text-white/55 hover:text-white"><ArrowLeft size={15} /> Назад</button>}
      </div>
    </section>
  )
}

/* ---------------- contacts ---------------- */
function Contact() {
  const L = 'inline-flex h-11 items-center gap-2 rounded-[4px] bg-[#171a20]/[.07] px-4 text-[14px] font-semibold hover:bg-[#171a20]/[.13]'
  return (
    <section id="contact" className="flex min-h-[100svh] snap-start flex-col bg-[#f4f4f4] text-[#171a20] md:flex-row">
      <div className="flex flex-col justify-center px-5 pb-10 pt-[96px] md:w-[44%] md:px-14">
        <h2 className={`${F} text-[clamp(36px,4.6vw,64px)] font-medium leading-[.98] tracking-[-0.04em]`}><Mask>Мы в «Порту»</Mask></h2>
        <p className="mt-6 flex items-start gap-3 text-[17px]"><MapPin size={19} className="mt-0.5 shrink-0" />{b.addr}, {b.place}, {b.city}</p>
        <div className="mt-6 space-y-2">
          <a href={'tel:' + tel(b.phone)} className={`${F} flex items-center gap-3 text-[24px] font-medium tracking-[-0.02em] hover:text-[#3e6ae1]`}><Phone size={18} />{b.phone}</a>
          <a href={'tel:' + tel(b.mob)} className={`${F} flex items-center gap-3 text-[24px] font-medium tracking-[-0.02em] hover:text-[#3e6ae1]`}><Phone size={18} />{b.mob}</a>
          <p className="pl-[30px] text-[13.5px] text-[#171a20]/55">Мобильный — также в Viber и Telegram</p>
        </div>
        <div className="mt-7 flex flex-wrap gap-2">
          <a href={b.viber} target="_blank" rel="noopener" className={L}><MessageCircle size={17} />Viber</a>
          <a href={b.tg} target="_blank" rel="noopener" className={L}><TG />Telegram</a>
          <a href={b.ig} target="_blank" rel="noopener" className={L}><IG />Instagram</a>
        </div>
        <a href="#book" className={BTN + ' mt-8 bg-[#171a20] text-white hover:bg-black'}>Записаться</a>
      </div>
      <div className="h-[420px] md:h-auto md:flex-1"><MapFrame oid={b.oid} /></div>
    </section>
  )
}

function Header() {
  return (
    <header className="sticky top-0 z-40 -mb-14 h-14">
      <div className="flex h-full items-center justify-between px-5 text-white mix-blend-difference md:px-10">
        <a href="#s0" className={`${F} text-[15px] font-bold uppercase tracking-[.42em]`}>Оливер</a>
        <nav className={`${F} hidden gap-1 text-[14px] font-semibold md:flex`}>{DIRS.map(d => <a key={d.id} href={'#' + d.id} className="rounded-[4px] px-3.5 py-1.5 hover:bg-white/10">{d.t}</a>)}<a href="#contact" className="rounded-[4px] px-3.5 py-1.5 hover:bg-white/10">Контакты</a></nav>
        <a href="#book" className={`${F} rounded-[4px] px-3.5 py-1.5 text-[14px] font-semibold hover:bg-white/10`}>Запись</a>
      </div>
    </header>
  )
}

function App() {
  const lite = useLite()
  const [sheet, setSheet] = useState(null)
  const [dir, setDir] = useState(null)
  useEffect(() => {
    const h = document.documentElement
    h.style.scrollSnapType = 'y proximity'; h.style.scrollBehavior = 'smooth'
    return () => { h.style.scrollSnapType = ''; h.style.scrollBehavior = '' }
  }, [])
  const onBook = k => { if (k) setDir(k); document.getElementById('book')?.scrollIntoView({ behavior: 'smooth' }) }
  return (
    <MotionConfig reducedMotion="user">
      <div className={`overflow-x-clip ${F}`} style={{ background: INK, color: '#fff', '--sel': '#3e6ae1', '--selc': '#fff' }}>
        <Ribbon name={b.name} bg="#f4f4f4" fg="#171a20" />
        <Header />
        <main>
          <Film lite={lite} onMore={setSheet} onBook={onBook} />
          <Proof />
          <Book dir={dir} setDir={setDir} />
          <Contact />
        </main>
        <footer className="bg-[#f4f4f4] px-5 pb-8 text-[13px] text-[#171a20]/55 md:px-14">
          <div className="flex flex-wrap justify-between gap-3 border-t border-[#171a20]/10 pt-6"><span>© 2026 {b.name} · Концепт сайта — Артём</span><span>{b.addr}, {b.place}</span></div>
        </footer>
        <Sheet s={sheet} onClose={() => setSheet(null)} onBook={onBook} />
        <CallBar phone={b.phone} barCls="bg-[#0c0c0d]/85 backdrop-blur-md" callCls="rounded-[4px] bg-white/[.14] text-white" bookCls="rounded-[4px] bg-[#f4f4f4] text-[#171a20]" />
        <div className="h-[72px] bg-[#f4f4f4] sm:hidden" />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
