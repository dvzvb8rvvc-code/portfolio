import React, { useRef, useState, useEffect, useMemo, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useMotionValueEvent, useInView, AnimatePresence, MotionConfig, useTransform } from 'framer-motion'
import { ArrowRight, ArrowUpRight, Phone, Check, Star, MapPin, ChevronDown, Gauge, Droplet, Wrench, Disc3, Cpu, CarFront, Cog, CalendarDays } from 'lucide-react'
import '../lib/base.css'
import { useSmooth, Ribbon, LineReveal, Reveal, useBooking, phoneFocus, CheckDraw, MapFrame, CallBar, tel, useLite, TG } from '../lib/kit'

const Axle = lazy(() => import('./rem100axle'))
const Gradient = lazy(() => import('./rem100-gradient'))

const b = {
  name: 'Рем100Сервис', addr: 'ул. Владислава Сырокомли, 7, офис 2', short: 'Сырокомли, 7', area: 'Лошица', city: 'Минск', phone: '+375 29 650-75-09',
  rating: '4,6', rev: 189, oid: '1151033906', tg: 'https://t.me/+375296507509', vk: 'https://vk.ru/club85105881', viber: 'viber://chat?number=%2B375296507509',
}
const BG = '#f6f9fc', INK = '#0a2540', SLATE = '#425466', BLUE = '#1d4ed8', GREEN = '#059669'
const F = "font-['Wix_Madefor_Display',sans-serif]"
const MONO = "font-['JetBrains_Mono',monospace]"
const EZ = [0.22, 1, 0.36, 1]
const VK = p => (<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" {...p}><path d="M12.8 17.5C6.9 17.5 3.5 13.4 3.4 6.6h3c.1 5 2.3 7.1 4 7.5V6.6h2.8v4.3c1.7-.2 3.5-2.1 4.1-4.3h2.8c-.5 2.6-2.4 4.5-3.8 5.3 1.4.7 3.6 2.4 4.4 5.6h-3.1c-.7-2.1-2.3-3.7-4.4-3.9v3.9h-.4Z" /></svg>)
const VB = p => (<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" {...p}><path d="M12 2.2c-5 0-9 3.3-9 8.3 0 2.8 1.3 4.8 3.4 6.1V21l3.4-2.4c.7.1 1.4.2 2.2.2 5 0 9-3.3 9-8.3S17 2.2 12 2.2Zm4.6 11.9-.8.8c-.5.4-1.3.2-2.6-.5a12 12 0 0 1-4.9-5.1c-.3-.8-.3-1.4.1-1.8l.7-.7c.3-.3.8-.2 1 .1l1 1.5c.2.3.1.7-.1.9l-.4.4c.5 1.2 1.5 2.2 2.8 2.8l.4-.4c.3-.2.6-.3.9-.1l1.5 1c.4.3.5.8.4 1.1Z" /></svg>)

function useSpy(ids) {
  const [a, setA] = useState('')
  useEffect(() => {
    const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && setA(e.target.id)), { rootMargin: '-45% 0px -50% 0px' })
    ids.forEach(id => { const el = document.getElementById(id); el && io.observe(el) })
    return () => io.disconnect()
  }, [])
  return a
}
function Eyebrow({ children, className = '' }) {
  return <p className={`${MONO} text-[13px] font-medium uppercase tracking-[.08em] text-[#1d4ed8] ${className}`}>{children}</p>
}
function Btn({ href, children, dark, className = '', ...rest }) {
  return (
    <a href={href} {...rest} className={`group inline-flex h-12 items-center gap-2 rounded-full px-5 text-[16px] font-semibold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1d4ed8] ${dark ? 'bg-[#0a2540] text-white hover:bg-[#1d4ed8]' : 'bg-white text-[#0a2540] shadow-[0_2px_6px_rgba(10,37,64,.12)] hover:shadow-[0_6px_16px_rgba(10,37,64,.18)]'} ${className}`}>
      {children}<ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
    </a>
  )
}

/* ---------------- header ---------------- */
const NAV = [['services', 'Услуги'], ['align', 'Развал'], ['signs', 'Признаки'], ['how', 'Как работаем'], ['reviews', 'Рейтинг'], ['contact', 'Контакты']]
function Header({ active }) {
  const [solid, setSolid] = useState(false)
  useEffect(() => { const f = () => setSolid(scrollY > 60); f(); addEventListener('scroll', f, { passive: true }); return () => removeEventListener('scroll', f) }, [])
  return (
    <header className={`sticky top-0 z-50 transition-colors duration-300 ${solid ? 'border-b border-[#0a2540]/10 bg-white/90 text-[#0a2540] backdrop-blur-md' : 'bg-transparent text-white'}`}>
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 px-4 md:px-6">
        <a href="#top" className="text-[20px] font-extrabold tracking-[-0.03em]">Рем<span className={solid ? 'text-[#1d4ed8]' : 'text-[#a7f3d0]'}>100</span>Сервис</a>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Разделы">
          {NAV.map(([id, t]) => (
            <a key={id} href={'#' + id} aria-current={active === id ? 'true' : undefined}
              className={`rounded-full px-3 py-1.5 text-[15px] font-medium transition-colors ${active === id ? (solid ? 'bg-[#1d4ed8]/10 text-[#1d4ed8]' : 'bg-white/20') : 'opacity-85 hover:opacity-100'}`}>{t}</a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a href={'tel:' + tel(b.phone)} className="hidden items-center gap-1.5 text-[15px] font-semibold md:flex"><Phone size={15} />{b.phone}</a>
          <a href="#book" className={`inline-flex h-10 items-center rounded-full px-4 text-[15px] font-semibold ${solid ? 'bg-[#0a2540] text-white' : 'bg-white text-[#0a2540]'}`}>Записаться</a>
        </div>
      </div>
    </header>
  )
}

/* ---------------- hero ---------------- */
const ROWS = [['Развал, левое', -1.6], ['Развал, правое', -0.9], ['Схождение, левое', 0.42], ['Схождение, правое', -0.35]]
function ReportCard() {
  const [ok, setOk] = useState(false)
  useEffect(() => { const t = setInterval(() => setOk(v => !v), 3200); return () => clearInterval(t) }, [])
  return (
    <div className="relative w-full max-w-[440px] rounded-[18px] border border-[#0a2540]/10 bg-white p-5 text-[#0a2540] shadow-[0_30px_60px_-20px_rgba(10,37,64,.35),0_18px_36px_-18px_rgba(0,0,0,.3)]">
      <div className="flex items-center justify-between">
        <div><p className="text-[16px] font-bold">Углы установки колёс</p><p className={`${MONO} text-[12px] text-[#425466]`}>иллюстрация · не реальные данные</p></div>
        <motion.span key={String(ok)} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`rounded-full px-2.5 py-1 text-[13px] font-semibold ${ok ? 'bg-[#d1fae5] text-[#047857]' : 'bg-[#ffedd5] text-[#c2410c]'}`}>{ok ? 'После регулировки' : 'До регулировки'}</motion.span>
      </div>
      <div className="mt-4 divide-y divide-[#0a2540]/[.07] border-y border-[#0a2540]/[.07]">
        {ROWS.map(([t, v]) => {
          const val = ok ? 0 : v
          return (
            <div key={t} className="grid grid-cols-[1fr_88px_64px] items-center gap-3 py-2.5 text-[14px]">
              <span className="text-[#425466]">{t}</span>
              <span className="relative h-1.5 rounded-full bg-[#e3ebf5]">
                <span className="absolute left-1/2 top-1/2 h-3 w-px -translate-y-1/2 bg-[#94a3b8]" />
                <motion.span className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full" animate={{ left: `${50 + val * 25}%`, backgroundColor: ok ? '#10b981' : '#f97316' }} transition={{ duration: 0.9, ease: EZ }} />
              </span>
              <motion.span className={`${MONO} text-right font-medium`} animate={{ color: ok ? '#047857' : '#c2410c' }}>{(val > 0 ? '+' : val < 0 ? '−' : '') + Math.abs(val).toFixed(2)}°</motion.span>
            </div>
          )
        })}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-[14px] text-[#425466]">Руль</span>
        <motion.span animate={{ rotate: ok ? 0 : -14 }} transition={{ duration: 0.9, ease: EZ }} className="grid h-10 w-10 place-items-center rounded-full border-[3px] border-[#0a2540]"><span className="h-5 w-[3px] rounded bg-[#0a2540]" /></motion.span>
      </div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }} className="absolute -bottom-8 -left-6 hidden rounded-[14px] border border-[#0a2540]/10 bg-white px-4 py-3 shadow-[0_16px_30px_-12px_rgba(10,37,64,.35)] sm:block">
        <p className={`${MONO} text-[11px] uppercase text-[#425466]`}>Запись онлайн</p>
        <p className="mt-0.5 flex items-center gap-2 text-[15px] font-semibold"><CalendarDays size={16} className="text-[#1d4ed8]" />Выберите окно на неделе</p>
      </motion.div>
    </div>
  )
}
function Hero() {
  const lite = useLite()
  return (
    <section id="top" className="relative -mt-16 pt-16">
      <div aria-hidden="true" className="absolute inset-x-0 -top-40 h-[calc(100%+60px)] origin-top-left overflow-hidden" style={{ transform: 'skewY(-6deg)' }}>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(120deg,#1e3a8a,#0e7490 50%,#059669)' }} />
        {!lite && <Suspense fallback={null}><div className="absolute inset-0" style={{ transform: 'skewY(6deg) scale(1.2)' }}><Gradient /></div></Suspense>}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg,rgba(10,37,64,.55),rgba(10,37,64,.1) 65%,transparent)' }} />
      </div>
      <div className="relative mx-auto grid max-w-[1200px] items-center gap-12 px-4 pb-24 pt-10 md:px-6 md:pb-36 md:pt-16 lg:grid-cols-[1.15fr_1fr]">
        <div className="text-white">
          <a href="#contact" className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-[15px] font-medium backdrop-blur"><MapPin size={15} />{b.area} · {b.short}, офис 2</a>
          <a href="#reviews" className="ml-2 mt-2 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[15px] font-semibold text-[#0a2540] sm:hidden"><Star size={14} className="text-[#f59e0b]" fill="currentColor" strokeWidth={0} />{b.rating} · {b.rev} оценок</a>
          <h1 className="mt-6 text-[clamp(40px,6vw,76px)] font-extrabold leading-[1.02] tracking-[-0.04em]">
            <LineReveal>Развал-схождение,</LineReveal>
            <LineReveal delay={0.08}>масло и ремонт</LineReveal>
            <LineReveal delay={0.16}><span className="text-[#a7f3d0]">ровно на 100%</span></LineReveal>
          </h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-6 max-w-[520px] text-[18px] leading-[1.55] text-white/90">
            Автосервис в Лошице: регулировка углов установки колёс, замена масла и фильтров, ремонт подвески и тормозов.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mt-8 flex flex-wrap gap-3">
            <Btn href="#book">Записаться</Btn>
            <a href={'tel:' + tel(b.phone)} className="inline-flex h-12 items-center gap-2 rounded-full border border-white/40 px-5 text-[16px] font-semibold text-white hover:bg-white/10"><Phone size={16} />{b.phone}</a>
          </motion.div>
          <motion.a href="#reviews" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-8 inline-flex items-center gap-3 text-[15px]">
            <span className="flex text-[#fde68a]">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={16} fill="currentColor" strokeWidth={0} />)}</span>
            <span><b className="text-[17px]">{b.rating}</b> · {b.rev} оценок на Яндекс Картах</span>
          </motion.a>
        </div>
        <motion.div initial={{ opacity: 0, y: 30, rotateX: 8 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ duration: 1, delay: 0.3, ease: EZ }} className="flex justify-center lg:justify-end" style={{ perspective: 1000 }}>
          <ReportCard />
        </motion.div>
      </div>
    </section>
  )
}

/* ---------------- services ---------------- */
const SV = [
  { I: Gauge, t: 'Развал-схождение', d: 'Регулировка углов установки колёс: машина едет прямо, шины изнашиваются равномерно.' },
  { I: Droplet, t: 'Замена масла и фильтров', d: 'Моторное масло, масляный, воздушный и салонный фильтры.' },
  { I: CarFront, t: 'Диагностика ходовой', d: 'Найдём источник стука, скрипа или люфта.' },
  { I: Wrench, t: 'Ремонт подвески', d: 'Рычаги, сайлентблоки, стойки, рулевые наконечники.' },
  { I: Disc3, t: 'Тормозная система', d: 'Колодки, диски, тормозная жидкость.' },
  { I: Cpu, t: 'Компьютерная диагностика', d: 'Считаем ошибки и объясним, что они значат.' },
  { I: Cog, t: 'Слесарный ремонт', d: 'Другие работы — опишите задачу, мастер подскажет.' },
]
function Services() {
  return (
    <section id="services" className="scroll-mt-20 px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto max-w-[1200px]">
        <Eyebrow>Услуги</Eyebrow>
        <h2 className="mt-3 max-w-[720px] text-[clamp(32px,4.4vw,52px)] font-extrabold leading-[1.05] tracking-[-0.035em]">Всё, чтобы машина ехала прямо и без сюрпризов</h2>
        <p className="mt-4 max-w-[600px] text-[18px] text-[#425466]">Стоимость зависит от модели и объёма работ — мастер назовёт её до начала.</p>
        <div className="mt-12 grid overflow-hidden rounded-[18px] border border-[#0a2540]/10 bg-[#0a2540]/10 [gap:1px] sm:grid-cols-2 lg:grid-cols-3">
          {SV.map(({ I, t, d }, i) => (
            <Reveal key={t} delay={i * 0.04} className={`group relative flex flex-col bg-white p-6 transition-colors hover:bg-[#f8fbff] md:p-7 ${i === 0 ? 'sm:col-span-2' : ''} ${i === SV.length - 1 ? 'lg:col-span-2' : ''}`}>
              <span className="grid h-11 w-11 place-items-center rounded-[12px] text-white" style={{ background: `linear-gradient(135deg,${BLUE},#06b6d4 60%,#10b981)` }}><I size={20} /></span>
              <h3 className={`mt-5 font-bold tracking-[-0.02em] ${i === 0 ? 'text-[28px]' : 'text-[20px]'}`}>{t}</h3>
              <p className="mt-2 flex-1 text-[16px] leading-[1.5] text-[#425466]">{d}</p>
              {i === 0 && <p className={`${MONO} mt-6 text-[13px] text-[#059669]`}>камбер · кастер · схождение</p>}
              <div className="mt-5 flex items-center justify-between">
                <span className={`${MONO} text-[12px] text-[#425466]/80`}>время и цена — уточнит мастер</span>
                <a href="#book" data-svc={t} className="inline-flex h-10 items-center gap-1 rounded-full bg-[#0a2540]/[.06] px-3.5 text-[15px] font-semibold text-[#0a2540] transition-colors hover:bg-[#0a2540] hover:text-white">Записаться <ArrowRight size={14} /></a>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------- pinned axle film ---------------- */
const CH = [
  ['01', 'Развал', 'Угол наклона колеса, если смотреть спереди. Когда он сбит, шина стирается по одному краю.'],
  ['02', 'Схождение', 'Смотрят ли колёса строго вперёд, если глядеть сверху. Из-за него машину тянет, а шины «пилит».'],
  ['03', 'Регулировка', 'Мастер выставляет углы по параметрам производителя для вашей модели.'],
  ['04', 'Ровно', 'Руль стоит по центру, машина держит прямую, шины ходят дольше.'],
]
function Film() {
  const ref = useRef(null)
  const prog = useRef(0)
  const lite = useLite()
  const inView = useInView(ref, { margin: '200px' })
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const [i, setI] = useState(0)
  const [k, setK] = useState(1)
  useMotionValueEvent(scrollYProgress, 'change', v => {
    prog.current = v; setI(Math.min(3, Math.floor(v * 4)))
    const t = Math.min(1, Math.max(0, (v - 0.5) / 0.3)); setK(1 - t * t * (3 - 2 * t))
  })
  const bar = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])
  return (
    <section id="align" ref={ref} className="relative h-[300vh] bg-white">
      <div className="sticky top-0 flex h-[100svh] flex-col overflow-hidden pt-16">
        <div className="relative mx-auto grid w-full max-w-[1200px] flex-1 grid-rows-[auto_1fr] px-4 pb-24 md:px-6 md:pb-8 lg:grid-cols-[400px_1fr] lg:grid-rows-1 lg:gap-10">
          <div className="relative z-10 flex flex-col pt-6 lg:justify-center lg:pt-0">
            <div className="flex items-center justify-between"><Eyebrow>Ровно на 100%</Eyebrow><a href="#signs" className="text-[15px] font-semibold text-[#1d4ed8] hover:underline">Пропустить →</a></div>
            <div className="mt-4 h-[3px] overflow-hidden rounded-full bg-[#e3ebf5]"><motion.div className="h-full" style={{ width: bar, background: 'linear-gradient(90deg,#1d4ed8,#06b6d4,#10b981)' }} /></div>
            <div className="relative mt-6 min-h-[170px] lg:min-h-[240px]">
              <AnimatePresence mode="wait">
                <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.4, ease: EZ }}>
                  <p className={`${MONO} text-[14px] text-[#425466]`}>{CH[i][0]} / 04</p>
                  <h2 className="mt-2 text-[clamp(36px,5vw,60px)] font-extrabold leading-[1] tracking-[-0.04em]">{CH[i][1]}</h2>
                  <p className="mt-3 max-w-[380px] text-[17px] leading-[1.5] text-[#425466]">{CH[i][2]}</p>
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="mt-2 hidden gap-2 lg:flex">{CH.map((c, n) => <span key={n} className={`${MONO} rounded-full border px-3 py-1 text-[13px] transition-colors ${n === i ? 'border-[#0a2540] bg-[#0a2540] text-white' : 'border-[#0a2540]/15 text-[#425466]'}`}>{c[1]}</span>)}</div>
          </div>
          <div className="relative min-h-0">
            {!lite ? <Suspense fallback={null}><div className="absolute inset-0"><Axle prog={prog} active={inView} /></div></Suspense>
              : <div className="absolute inset-0 grid place-items-center"><div className="flex gap-24"><motion.span style={{ rotate: -10 * k }} className="block h-40 w-12 rounded-[14px] bg-[#1b2533]" /><motion.span style={{ rotate: 10 * k }} className="block h-40 w-12 rounded-[14px] bg-[#1b2533]" /></div></div>}
            <div className="absolute bottom-0 right-0 w-[230px] rounded-[14px] border border-[#0a2540]/10 bg-white/90 p-4 shadow-[0_16px_30px_-14px_rgba(10,37,64,.3)] backdrop-blur md:bottom-4">
              <p className={`${MONO} text-[11px] uppercase tracking-[.06em] text-[#425466]`}>Наглядно, углы утрированы</p>
              {[['Развал', 2.4], ['Схождение', 0.6]].map(([t, v]) => (
                <div key={t} className="mt-2 flex items-center justify-between text-[15px]"><span>{t}</span><span className={`${MONO} font-semibold`} style={{ color: k > 0.02 ? '#c2410c' : '#047857' }}>{k > 0.02 ? '−' : ''}{(v * k).toFixed(2)}°</span></div>
              ))}
              <div className="mt-3 flex items-center gap-2 text-[14px] font-semibold" style={{ color: k > 0.02 ? '#c2410c' : '#047857' }}>{k > 0.02 ? <span className="h-2 w-2 rounded-full bg-current" /> : <Check size={16} />}{k > 0.02 ? 'Нужна регулировка' : 'В допуске'}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- value: signs it's time ---------------- */
const SIGNS = [
  ['wheel', 'Руль стоит не по центру', 'когда едете прямо'],
  ['pull', 'Машину тянет в сторону', 'на ровной дороге'],
  ['wear', 'Шины изнашиваются неровно', 'по внутреннему или внешнему краю'],
  ['pit', 'Был сильный удар', 'яма, бордюр, лежачий полицейский'],
  ['tyres', 'Поставили новые шины', 'или меняли детали подвески'],
]
function Toggle({ on, onClick, label, sub }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={onClick}
      className={`flex w-full items-center justify-between gap-4 rounded-[14px] border bg-white p-4 text-left transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1d4ed8] md:p-5 ${on ? 'border-[#1d4ed8] shadow-[0_8px_20px_-10px_rgba(29,78,216,.5)]' : 'border-[#0a2540]/10 hover:border-[#0a2540]/25'}`}>
      <span><span className="block text-[17px] font-semibold">{label}</span><span className="block text-[15px] text-[#425466]">{sub}</span></span>
      <span className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${on ? 'bg-[#1d4ed8]' : 'bg-[#cbd5e1]'}`}>
        <motion.span layout transition={{ type: 'spring', stiffness: 600, damping: 32 }} className="absolute top-1 h-5 w-5 rounded-full bg-white shadow" style={{ left: on ? 24 : 4 }} />
      </span>
    </button>
  )
}
function advice(sel) {
  const n = sel.length
  if (!n) return { lvl: 0, t: 'Пока всё ровно', d: 'Отметьте, что замечаете за машиной, — подскажем, стоит ли ехать на проверку.' }
  const extra = []
  if (sel.includes('pit')) extra.push('После сильного удара заодно посмотрим ходовую.')
  if (sel.includes('tyres')) extra.push('С новыми шинами или деталями подвески углы разумно выставить сразу.')
  if (sel.includes('wear')) extra.push('Неровный износ — частый признак сбитых углов.')
  if (n === 1) return { lvl: 1, t: 'Стоит проверить углы', d: ['Один признак — уже повод для проверки: это дешевле, чем менять шины раньше срока.', ...extra].join(' ') }
  return { lvl: 2, t: 'Похоже, пора на развал-схождение', d: [`Отмечено признаков: ${n} из 5.`, ...extra].join(' ') }
}
function Signs() {
  const [sel, setSel] = useState([])
  const a = advice(sel)
  const C = ['#425466', '#d97706', '#059669'][a.lvl]
  return (
    <section id="signs" className="scroll-mt-20 px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto max-w-[1200px]">
        <Eyebrow>Проверьте себя</Eyebrow>
        <h2 className="mt-3 max-w-[720px] text-[clamp(32px,4.4vw,52px)] font-extrabold leading-[1.05] tracking-[-0.035em]">Признаки, что пора на развал</h2>
        <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_420px]">
          <div className="grid gap-3">{SIGNS.map(([k, t, s]) => <Toggle key={k} on={sel.includes(k)} label={t} sub={s} onClick={() => setSel(v => v.includes(k) ? v.filter(x => x !== k) : [...v, k])} />)}</div>
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="overflow-hidden rounded-[18px] border border-[#0a2540]/10 bg-white shadow-[0_30px_60px_-30px_rgba(10,37,64,.35)]">
              <div className="h-1.5" style={{ background: 'linear-gradient(90deg,#1d4ed8,#06b6d4,#10b981)' }} />
              <div className="p-6 md:p-7" aria-live="polite">
                <div className="flex items-center gap-1.5">{[0, 1, 2, 3, 4].map(n => <motion.span key={n} className="h-2 flex-1 rounded-full" animate={{ backgroundColor: n < sel.length ? C : '#e3ebf5' }} />)}</div>
                <AnimatePresence mode="wait">
                  <motion.div key={a.t} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
                    <p className={`${MONO} mt-6 text-[13px] uppercase`} style={{ color: C }}>Рекомендация</p>
                    <h3 className="mt-2 text-[26px] font-extrabold leading-[1.15] tracking-[-0.03em]">{a.t}</h3>
                    <p className="mt-3 text-[16px] leading-[1.55] text-[#425466]">{a.d}</p>
                  </motion.div>
                </AnimatePresence>
                <a href="#book" data-svc="Развал-схождение" className={`mt-6 flex h-12 items-center justify-center gap-2 rounded-full text-[16px] font-semibold transition-colors ${a.lvl ? 'bg-[#0a2540] text-white hover:bg-[#1d4ed8]' : 'bg-[#0a2540]/[.06] text-[#0a2540]'}`}>Выбрать время на развал <ArrowRight size={16} /></a>
                <p className="mt-3 text-center text-[14px] text-[#425466]">Подсказка не заменяет осмотр мастера</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- how it works + proof ---------------- */
const HOW = [['Записались', 'Онлайн-окно на сайте, по телефону или в мессенджере.'], ['Приехали', `${b.short}, офис 2 — ${b.area}.`], ['Диагностика', 'Мастер проверяет и объясняет, что нужно сделать и сколько это стоит.'], ['Готово', 'Согласованные работы выполнены — можно ехать.']]
function How() {
  return (
    <section id="how" className="scroll-mt-20 bg-[#0a2540] px-4 py-20 text-white md:px-6 md:py-28" style={{ clipPath: 'polygon(0 4vw,100% 0,100% 100%,0 100%)' }}>
      <div className="mx-auto max-w-[1200px] pt-6">
        <Eyebrow className="text-[#67e8f9]">Как это работает</Eyebrow>
        <h2 className="mt-3 text-[clamp(32px,4.4vw,52px)] font-extrabold leading-[1.05] tracking-[-0.035em]">Четыре шага — без сюрпризов</h2>
        <ol className="relative mt-14 grid gap-8 md:grid-cols-4 md:gap-6">
          <div aria-hidden="true" className="absolute left-0 right-0 top-[19px] hidden h-px md:block" style={{ background: 'linear-gradient(90deg,#1d4ed8,#06b6d4,#10b981)' }} />
          {HOW.map(([t, d], n) => (
            <Reveal as="li" key={t} delay={n * 0.08} className="relative">
              <span className={`${MONO} relative grid h-10 w-10 place-items-center rounded-full border border-white/25 bg-[#0a2540] text-[15px]`}>0{n + 1}</span>
              <h3 className="mt-5 text-[22px] font-bold">{t}</h3>
              <p className="mt-2 text-[16px] leading-[1.5] text-white/70">{d}</p>
            </Reveal>
          ))}
        </ol>
        <div id="reviews" className="mt-20 grid scroll-mt-24 overflow-hidden rounded-[18px] border border-white/10 [gap:1px] bg-white/10 sm:grid-cols-3">
          <div className="bg-[#0a2540] p-7"><p className={`${MONO} text-[13px] uppercase text-white/60`}>Яндекс Карты</p><p className="mt-3 flex items-baseline gap-2 text-[64px] font-extrabold leading-none tracking-[-0.04em]">{b.rating}<Star size={28} className="text-[#fde68a]" fill="currentColor" strokeWidth={0} /></p></div>
          <div className="bg-[#0a2540] p-7"><p className={`${MONO} text-[13px] uppercase text-white/60`}>Оценок</p><p className="mt-3 text-[64px] font-extrabold leading-none tracking-[-0.04em]">{b.rev}</p></div>
          <a href={`https://yandex.by/maps/org/${b.oid}/reviews/`} target="_blank" rel="noopener" className="group flex flex-col justify-between bg-[#0a2540] p-7 hover:bg-[#0f2f52]"><p className={`${MONO} text-[13px] uppercase text-white/60`}>Отзывы</p><p className="mt-3 flex items-center gap-2 text-[22px] font-bold">Читать на Яндекс Картах <ArrowUpRight className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></p></a>
        </div>
      </div>
    </section>
  )
}

/* ---------------- booking with week slot picker ---------------- */
const SLOTS = ['09:00', '10:30', '12:00', '13:30', '15:00', '16:30']
const BSV = ['Развал-схождение', 'Замена масла и фильтров', 'Диагностика ходовой', 'Тормозная система', 'Другое']
function useWeek() {
  return useMemo(() => {
    const out = [], d = new Date(); d.setHours(0, 0, 0, 0)
    for (let n = 0; out.length < 6; n++) {
      const x = new Date(d); x.setDate(d.getDate() + n + 1)
      if (x.getDay() === 0) continue
      out.push(x)
    }
    return out
  }, [])
}
const taken = (d, s) => ((d.getDate() * 7 + s * 13) % 5) === 0
function Book() {
  const bk = useBooking()
  const week = useWeek()
  const [step, setStep] = useState(0)
  const [day, setDay] = useState(0)
  const [slot, setSlot] = useState(null)
  const [err, setErr] = useState('')
  const T = ['Услуга', 'Время', 'Контакты']
  const fmt = (d, o) => d.toLocaleDateString('ru-RU', o)
  const next = e => {
    e.preventDefault()
    if (step === 0 && !bk.s.svc) return setErr('Выберите услугу')
    if (step === 1 && slot === null) return setErr('Выберите окно — или нажмите «Время подберёт мастер»')
    setErr('')
    if (step < 2) setStep(step + 1); else bk.submit()
  }
  const when = slot === -1 ? 'время подберёт мастер' : slot !== null ? `${fmt(week[day], { weekday: 'short', day: 'numeric', month: 'long' })}, ${SLOTS[slot]}` : ''
  return (
    <section id="book" className="scroll-mt-20 px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto grid max-w-[1200px] gap-10 lg:grid-cols-[1fr_620px]">
        <div>
          <Eyebrow>Запись</Eyebrow>
          <h2 className="mt-3 text-[clamp(32px,4.4vw,52px)] font-extrabold leading-[1.05] tracking-[-0.035em]">Выберите окно на неделе</h2>
          <p className="mt-4 max-w-[440px] text-[18px] text-[#425466]">Три шага — и мастер перезвонит, чтобы подтвердить время. Удобнее голосом?</p>
          <a href={'tel:' + tel(b.phone)} className="mt-3 inline-flex items-center gap-2 text-[22px] font-bold text-[#1d4ed8]"><Phone size={20} />{b.phone}</a>
          <div className="mt-6 flex gap-2">
            <a href={b.viber} aria-label="Viber" className="grid h-12 w-12 place-items-center rounded-full border border-[#0a2540]/15 hover:bg-[#0a2540] hover:text-white"><VB /></a>
            <a href={b.tg} target="_blank" rel="noopener" aria-label="Telegram" className="grid h-12 w-12 place-items-center rounded-full border border-[#0a2540]/15 hover:bg-[#0a2540] hover:text-white"><TG /></a>
            <a href={b.vk} target="_blank" rel="noopener" aria-label="ВКонтакте" className="grid h-12 w-12 place-items-center rounded-full border border-[#0a2540]/15 hover:bg-[#0a2540] hover:text-white"><VK /></a>
          </div>
        </div>
        <div className="rounded-[18px] border border-[#0a2540]/10 bg-white p-5 shadow-[0_40px_80px_-40px_rgba(10,37,64,.45)] md:p-7">
          {bk.s.sent ? (
            <div role="status" className="py-8 text-center">
              <CheckDraw className="mx-auto text-[#059669]" />
              <h3 className="mt-5 text-[28px] font-extrabold tracking-[-0.03em]">Заявка отправлена</h3>
              <p className="mx-auto mt-3 max-w-[420px] text-[16px] text-[#425466]">{bk.s.svc} · {when}. Мастер перезвонит и подтвердит. В готовом сайте заявка сразу придёт вам в Telegram.</p>
              <button type="button" onClick={() => { bk.reset(); setStep(0); setSlot(null) }} className="mt-6 text-[15px] font-semibold text-[#1d4ed8] underline underline-offset-4">Новая заявка</button>
            </div>
          ) : (
            <form onSubmit={next} noValidate>
              <ol className="grid grid-cols-3 gap-2" aria-label="Шаги записи">
                {T.map((t, n) => (
                  <li key={t} aria-current={step === n ? 'step' : undefined}>
                    <span className="block h-1 overflow-hidden rounded-full bg-[#e3ebf5]"><motion.span className="block h-full bg-[#1d4ed8]" animate={{ width: step >= n ? '100%' : '0%' }} /></span>
                    <span className={`${MONO} mt-2 block text-[13px] ${step === n ? 'text-[#0a2540]' : 'text-[#425466]/70'}`}>0{n + 1} {t}</span>
                  </li>
                ))}
              </ol>
              <AnimatePresence mode="wait">
                <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }} className="mt-6 min-h-[270px]">
                  {step === 0 && (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {[...BSV, ...(bk.s.svc && !BSV.includes(bk.s.svc) ? [bk.s.svc] : [])].map(s => (
                        <button key={s} type="button" aria-pressed={bk.s.svc === s} onClick={() => { bk.upd('svc', s); setErr('') }}
                          className={`flex h-14 items-center justify-between rounded-[12px] border px-4 text-left text-[16px] font-semibold transition-colors ${bk.s.svc === s ? 'border-[#1d4ed8] bg-[#eff6ff] text-[#1d4ed8]' : 'border-[#0a2540]/10 hover:border-[#0a2540]/30'}`}>
                          {s}{bk.s.svc === s && <Check size={18} />}
                        </button>
                      ))}
                    </div>
                  )}
                  {step === 1 && (
                    <div>
                      <div className="grid grid-cols-6 gap-1.5" role="group" aria-label="День">
                        {week.map((d, n) => (
                          <button key={n} type="button" aria-pressed={day === n} onClick={() => { setDay(n); setSlot(null) }}
                            className={`flex h-16 flex-col items-center justify-center rounded-[12px] border text-[13px] transition-colors ${day === n ? 'border-[#0a2540] bg-[#0a2540] text-white' : 'border-[#0a2540]/10 hover:border-[#0a2540]/30'}`}>
                            <span className="uppercase opacity-70">{fmt(d, { weekday: 'short' })}</span><span className="text-[20px] font-bold leading-tight">{d.getDate()}</span>
                          </button>
                        ))}
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-2" role="group" aria-label="Время">
                        {SLOTS.map((s, n) => {
                          const busy = taken(week[day], n)
                          return (
                            <button key={s} type="button" disabled={busy} aria-pressed={slot === n} onClick={() => { setSlot(n); setErr('') }}
                              className={`${MONO} h-12 rounded-[12px] border text-[15px] transition-colors disabled:cursor-not-allowed disabled:border-dashed disabled:text-[#94a3b8] disabled:line-through ${slot === n ? 'border-[#059669] bg-[#ecfdf5] font-semibold text-[#047857]' : 'border-[#0a2540]/10 hover:border-[#0a2540]/30'}`}>{s}</button>
                          )
                        })}
                      </div>
                      <button type="button" aria-pressed={slot === -1} onClick={() => { setSlot(-1); setErr('') }} className={`mt-2 h-12 w-full rounded-[12px] border text-[15px] font-semibold ${slot === -1 ? 'border-[#059669] bg-[#ecfdf5] text-[#047857]' : 'border-[#0a2540]/10 hover:border-[#0a2540]/30'}`}>Время подберёт мастер</button>
                      <p className={`${MONO} mt-3 text-[12px] leading-[1.5] text-[#425466]`}>Демо-слоты для примера. В готовом сайте — реальные свободные окна; время подтвердит мастер.</p>
                    </div>
                  )}
                  {step === 2 && (
                    <div className="space-y-4">
                      <p className="rounded-[12px] bg-[#f6f9fc] p-3 text-[15px]"><b>{bk.s.svc}</b> · {when}</p>
                      <label className="block"><span className="text-[15px] font-semibold">Имя</span>
                        <input value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} autoComplete="name" className="mt-1.5 h-12 w-full rounded-[12px] border border-[#0a2540]/15 px-4 text-[17px] outline-none focus:border-[#1d4ed8] focus:ring-4 focus:ring-[#1d4ed8]/15" /></label>
                      <label className="block"><span className="text-[15px] font-semibold">Телефон *</span>
                        <input value={bk.s.phone} onChange={e => bk.upd('phone', e.target.value)} onFocus={phoneFocus(bk)} type="tel" inputMode="tel" autoComplete="tel" placeholder="+375 __ ___-__-__" aria-invalid={bk.s.err}
                          className={`mt-1.5 h-12 w-full rounded-[12px] border px-4 text-[17px] outline-none focus:ring-4 focus:ring-[#1d4ed8]/15 ${bk.s.err ? 'border-[#dc2626]' : 'border-[#0a2540]/15 focus:border-[#1d4ed8]'}`} /></label>
                      {bk.s.err && <p className="text-[15px] font-medium text-[#dc2626]">Проверьте номер: 12 цифр с кодом +375.</p>}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
              {err && <p role="alert" className="mb-2 text-[15px] font-medium text-[#dc2626]">{err}</p>}
              <div className="flex items-center justify-between border-t border-[#0a2540]/[.08] pt-5">
                {step ? <button type="button" onClick={() => setStep(step - 1)} className="h-12 px-2 text-[15px] font-semibold text-[#425466]">← Назад</button> : <span />}
                <button type="submit" disabled={bk.s.loading} className="inline-flex h-12 items-center gap-2 rounded-full bg-[#0a2540] px-6 text-[16px] font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-60">{step < 2 ? 'Дальше' : bk.s.loading ? 'Отправляем…' : 'Отправить заявку'} <ArrowRight size={16} /></button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

/* ---------------- FAQ ---------------- */
const FAQ = [
  ['Сколько занимает развал-схождение?', 'Зависит от машины и того, нужно ли менять детали. Ориентировочное время мастер назовёт при записи.'],
  ['Как часто нужно делать развал?', 'Обычно проверяют после замены шин, ремонта подвески, сильного удара или если появились признаки — руль не по центру, машину тянет.'],
  ['Сколько стоит?', 'Цена зависит от модели и объёма работ. Мастер назовёт её до начала.'],
  ['Можно приехать без записи?', 'Лучше записаться заранее — так вам не придётся ждать. Позвоните, если нужно срочно.'],
  ['Как оплатить?', 'Способы оплаты уточняйте по телефону.'],
  ['Где припарковаться?', `Адрес — ${b.addr}. Как удобнее подъехать, подскажем по телефону.`],
]
function Faq() {
  const [o, setO] = useState(0)
  return (
    <section id="faq" className="scroll-mt-20 px-4 pb-20 md:px-6 md:pb-28">
      <div className="mx-auto max-w-[860px]">
        <Eyebrow>Вопросы</Eyebrow>
        <h2 className="mt-3 text-[clamp(32px,4.4vw,52px)] font-extrabold leading-[1.05] tracking-[-0.035em]">Частые вопросы</h2>
        <div className="mt-10 divide-y divide-[#0a2540]/10 border-y border-[#0a2540]/10">
          {FAQ.map(([q, a], n) => (
            <div key={q}>
              <h3><button type="button" aria-expanded={o === n} aria-controls={'rf' + n} onClick={() => setO(o === n ? -1 : n)} className="flex w-full items-center justify-between gap-4 py-5 text-left text-[18px] font-semibold">{q}<ChevronDown size={20} className={`shrink-0 transition-transform ${o === n ? 'rotate-180 text-[#1d4ed8]' : ''}`} /></button></h3>
              <AnimatePresence initial={false}>{o === n && <motion.div id={'rf' + n} initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden"><p className="pb-5 text-[16px] leading-[1.6] text-[#425466]">{a}</p></motion.div>}</AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Contact() {
  return (
    <section id="contact" className="scroll-mt-20 px-4 pb-20 md:px-6 md:pb-28">
      <div className="mx-auto grid max-w-[1200px] overflow-hidden rounded-[18px] border border-[#0a2540]/10 bg-white lg:grid-cols-[400px_1fr]">
        <div className="p-7 md:p-9">
          <Eyebrow>Контакты</Eyebrow>
          <h2 className="mt-3 text-[34px] font-extrabold leading-[1.05] tracking-[-0.03em]">{b.area}, {b.short}</h2>
          <dl className="mt-6 space-y-4 text-[16px]">
            <div><dt className={`${MONO} text-[12px] uppercase text-[#425466]`}>Адрес</dt><dd className="mt-1 font-semibold">{b.addr}, {b.city}</dd></div>
            <div><dt className={`${MONO} text-[12px] uppercase text-[#425466]`}>Телефон и Viber</dt><dd className="mt-1"><a href={'tel:' + tel(b.phone)} className="text-[20px] font-bold text-[#1d4ed8]">{b.phone}</a></dd></div>
            <div><dt className={`${MONO} text-[12px] uppercase text-[#425466]`}>Часы работы</dt><dd className="mt-1">Уточняйте по телефону</dd></div>
          </dl>
          <div className="mt-6 flex flex-wrap gap-2">
            <a href={b.tg} target="_blank" rel="noopener" className="inline-flex h-11 items-center gap-2 rounded-full border border-[#0a2540]/15 px-4 text-[15px] font-semibold hover:bg-[#0a2540] hover:text-white"><TG />Telegram</a>
            <a href={b.viber} className="inline-flex h-11 items-center gap-2 rounded-full border border-[#0a2540]/15 px-4 text-[15px] font-semibold hover:bg-[#0a2540] hover:text-white"><VB />Viber</a>
            <a href={b.vk} target="_blank" rel="noopener" className="inline-flex h-11 items-center gap-2 rounded-full border border-[#0a2540]/15 px-4 text-[15px] font-semibold hover:bg-[#0a2540] hover:text-white"><VK />ВКонтакте</a>
          </div>
          <a href={`https://yandex.by/maps/?rtext=~${encodeURIComponent('Минск, ул. Владислава Сырокомли, 7')}`} target="_blank" rel="noopener" className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-[#0a2540] px-5 text-[16px] font-semibold text-white hover:bg-[#1d4ed8]">Построить маршрут <ArrowUpRight size={16} /></a>
        </div>
        <div className="h-[360px] lg:h-auto lg:min-h-[460px]"><MapFrame oid={b.oid} /></div>
      </div>
    </section>
  )
}

function App() {
  useSmooth()
  const active = useSpy(['services', 'align', 'signs', 'how', 'reviews', 'book', 'faq', 'contact'])
  return (
    <MotionConfig reducedMotion="user">
      <div className={`relative overflow-x-clip ${F}`} style={{ background: BG, color: INK, '--sel': BLUE, '--selc': '#fff' }}>
        <Ribbon name={b.name} bg={INK} fg="#fff" />
        <Header active={active} />
        <main>
          <Hero />
          <Services />
          <Film />
          <Signs />
          <How />
          <Book />
          <Faq />
          <Contact />
        </main>
        <footer className="border-t border-[#0a2540]/10 px-4 py-8 md:px-6">
          <div className="mx-auto flex max-w-[1200px] flex-wrap justify-between gap-3 text-[15px] text-[#425466]">
            <span>© 2026 {b.name} · Концепт сайта — Артём</span>
            <span>{b.addr}, {b.city} · <a href={'tel:' + tel(b.phone)}>{b.phone}</a></span>
          </div>
        </footer>
        <CallBar phone={b.phone} barCls="bg-white/95 backdrop-blur border-t border-[#0a2540]/10" callCls="rounded-full border border-[#0a2540]/20 text-[#0a2540] text-[16px]" bookCls="rounded-full bg-[#0a2540] text-white text-[16px]" />
        <div className="h-[76px] sm:hidden" />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
