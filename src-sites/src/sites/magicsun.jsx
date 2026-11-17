import React, { useRef, useState, useEffect, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, useSpring, useInView, AnimatePresence, MotionConfig } from 'framer-motion'
import { ArrowRight, ArrowUpRight, Phone, MapPin, MessageCircle, Sun, Info } from 'lucide-react'
import '../lib/base.css'
import { useSmooth, Ribbon, LineReveal, Reveal, useBooking, phoneFocus, CheckDraw, MapFrame, CallBar, tel, useLite, IG, TG, WA } from '../lib/kit'

const Journey = lazy(() => import('./magicsun3d'))

const b = {
  name: 'Мэджик Сан', addr: 'Интернациональная ул., 2', floor: '2 этаж', city: 'Минск',
  phone: '+375 29 155-21-55', viber: 'https://viber.click/375291552155', wa: 'https://wa.me/375291552155',
  tg: 'https://t.me/magic_sun_minsk', ig: 'http://instagram.com/magicsunminsk', vk: 'https://vk.ru/magicsunminsk',
  rating: '4,6', rev: 112, oid: '1001571425',
}
const SAND = '#f1e8da', INK = '#1d231c', FOREST = '#26332a', AMBER = '#d9822b'
const SERIF = "font-['Literata',serif]", SANS = "font-['Commissioner',sans-serif]"
const VK = ({ size = 18 }) => (<svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true"><path d="M12.8 17.3c-5.5 0-8.6-3.8-8.7-10h2.8c.1 4.6 2.1 6.5 3.7 6.9V7.3h2.6v3.9c1.6-.2 3.3-2 3.8-3.9h2.6c-.4 2.4-2.2 4.2-3.4 4.9 1.3.6 3.3 2.1 4.1 5.1h-2.9c-.6-2-2.2-3.5-4.2-3.7v3.7h-.4Z" /></svg>)

const CH = [
  { n: '01', time: '07:40', t: '−8°', h: 'Зима. Город ещё спит.', d: 'Серое небо, короткий день. Кожа скучает по свету.', r: [0.1, 0.28] },
  { n: '02', time: '08:15', t: '+4°', h: 'Первый луч.', d: 'Несколько спокойных минут под тёплым светом — и настроение уже другое.', r: [0.28, 0.48] },
  { n: '03', time: '12:00', t: '+19°', h: 'Тёплый берег.', d: 'Ровный загар без спешки: время сеанса подбираем под вашу кожу.', r: [0.48, 0.68] },
  { n: '04', time: '16:30', t: '+26°', h: 'Лето внутри.', d: 'А ещё косметология: уход, после которого хочется смотреть в зеркало.', r: [0.68, 0.86] },
  { n: '05', time: 'сейчас', t: '+26°', h: 'Пункт назначения — Интернациональная, 2.', d: 'Второй этаж, центр Минска. Лето — круглый год.', r: [0.86, 1.2] },
]

/* ---------------- pinned journey ---------------- */
function Note({ p, c }) {
  const k = [c.r[0], c.r[0] + 0.04, c.r[1] - 0.04, c.r[1]]
  const o = useTransform(p, k, [0, 1, 1, 0])
  const y = useTransform(p, k, [50, 0, 0, -40])
  return (
    <motion.div style={{ opacity: o, y }} className="pointer-events-none absolute inset-x-4 bottom-[108px] md:inset-x-auto md:bottom-[16vh] md:left-12 md:w-[440px]">
      <div className="relative rounded-[6px] bg-[#f6efe2] p-6 text-[#1d231c] shadow-[0_30px_60px_-30px_rgba(0,0,0,.6)] md:p-7" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent 0 27px, rgba(38,51,42,.07) 27px 28px)' }}>
        <div className={`${SANS} flex items-center justify-between border-b border-[#1d231c]/15 pb-3 text-[11px] font-medium uppercase tracking-[.22em] text-[#1d231c]/55`}>
          <span>Запись {c.n}</span><span>{c.time} · {c.t}</span>
        </div>
        <h2 className={`${SERIF} mt-4 text-[clamp(26px,2.6vw,38px)] font-normal leading-[1.08] tracking-[-0.02em]`}>{c.h}</h2>
        <p className={`${SANS} mt-3 text-[15px] leading-relaxed text-[#1d231c]/65`}>{c.d}</p>
      </div>
    </motion.div>
  )
}
function LiteSky({ p }) {
  const bg = useTransform(p, [0, 0.45, 1], ['linear-gradient(180deg,#1f2c40,#aebdcb 70%,#dfe7ee)', 'linear-gradient(180deg,#6e6a92,#f1b49a 70%,#d9b8a6)', 'linear-gradient(180deg,#e0883e,#ffd79a 70%,#e2ac6c)'])
  const sy = useTransform(p, [0, 1], ['70%', '30%'])
  return (
    <motion.div className="absolute inset-0" style={{ background: bg }}>
      <motion.div style={{ top: sy }} className="absolute left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-[#fff1c4] shadow-[0_0_120px_60px_rgba(255,220,150,.6)]" />
    </motion.div>
  )
}
function Film({ lite }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const p = useSpring(scrollYProgress, { stiffness: 70, damping: 22, mass: 0.4 })
  const near = useInView(ref, { margin: '300px 0px' })
  const [mounted, setMounted] = useState(false)
  useEffect(() => { if (near) setMounted(true) }, [near])
  const heroO = useTransform(p, [0, 0.07], [1, 0])
  const heroY = useTransform(p, [0, 0.07], [0, -40])
  const heroPE = useTransform(p, v => (v < 0.04 ? 'auto' : 'none'))
  const bar = useTransform(p, [0, 0.06, 0.92, 1], ['4vh', '9vh', '9vh', '0vh'])
  const temp = useTransform(p, [0.1, 0.86], [-8, 26])
  const tempTxt = useTransform(temp, v => (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(Math.round(v)) + '°')
  const lineW = useTransform(p, [0.1, 0.92], ['0%', '100%'])
  const hudO = useTransform(p, [0.06, 0.1], [0, 1])
  return (
    <section ref={ref} id="top" className="relative h-[560vh] bg-[#111611]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="absolute inset-0">
          {lite ? <LiteSky p={p} /> : mounted && <Suspense fallback={<LiteSky p={p} />}><Journey progress={p} active={near} /></Suspense>}
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,.35))]" />
        {/* letterbox */}
        <motion.div style={{ height: bar }} className="absolute inset-x-0 top-0 z-[3] bg-[#0c0f0c]" />
        <motion.div style={{ height: bar }} className="absolute inset-x-0 bottom-0 z-[3] bg-[#0c0f0c]" />

        <motion.div style={{ opacity: heroO, y: heroY, pointerEvents: heroPE }} className="absolute inset-x-0 top-[22%] z-[2] px-5 text-[#f6efe2] md:top-[24%] md:px-12">
          <p className={`${SANS} mb-6 text-[11.5px] font-medium uppercase tracking-[.28em] text-[#f6efe2]/70`}>Солярий · косметология · Минск</p>
          <h1 className={`${SERIF} max-w-[1000px] text-[clamp(46px,8vw,132px)] font-light leading-[.92] tracking-[-0.035em]`}>
            <LineReveal delay={0.15}>Лето — на втором</LineReveal>
            <LineReveal delay={0.3}><em className="font-light">этаже.</em></LineReveal>
          </h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9, duration: 1 }} className={`${SANS} mt-7 max-w-[440px] text-[16.5px] leading-relaxed text-[#f6efe2]/80`}>Путешествие к солнцу посреди зимы. Пролистайте — мы начинаем на рассвете.</motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1, duration: 1 }} className="mt-8 hidden gap-3 md:flex">
            <a href="#tan" className={`${SANS} inline-flex h-12 items-center gap-2 rounded-full bg-[#f6efe2] px-6 text-[15px] font-medium text-[#1d231c]`}>Подобрать время загара <ArrowRight size={16} /></a>
            <a href="#book" className={`${SANS} inline-flex h-12 items-center rounded-full border border-[#f6efe2]/40 px-6 text-[15px] font-medium text-[#f6efe2] hover:border-[#f6efe2]`}>Записаться</a>
          </motion.div>
        </motion.div>

        {CH.map(c => <Note key={c.n} p={p} c={c} />)}

        {/* expedition HUD */}
        <motion.div style={{ opacity: hudO }} className={`${SANS} pointer-events-none absolute right-5 top-[calc(9vh+76px)] z-[4] text-right text-[#f6efe2] md:right-12 md:top-[calc(9vh+88px)]`}>
          <p className="text-[10.5px] uppercase tracking-[.24em] text-[#f6efe2]/60">Температура настроения</p>
          <motion.p className={`${SERIF} text-[clamp(40px,5vw,72px)] font-light leading-none`}>{tempTxt}</motion.p>
        </motion.div>
        <motion.div style={{ opacity: hudO }} className="pointer-events-none absolute inset-x-5 bottom-[calc(9vh+14px)] z-[4] hidden md:inset-x-12 md:block">
          <div className={`${SANS} mb-2 flex justify-between text-[10.5px] uppercase tracking-[.22em] text-[#f6efe2]/60`}><span>Минск, зима</span><span>53.9° с.ш.</span><span>Лето</span></div>
          <div className="h-px bg-[#f6efe2]/25"><motion.div style={{ width: lineW }} className="h-px bg-[#f6efe2]" /></div>
        </motion.div>
      </div>
    </section>
  )
}

/* ---------------- safe tan planner (value interaction) ---------------- */
const TYPES = [
  { k: 'I', sw: '#f6e0d2', t: 'Очень светлая кожа', d: 'Веснушки, светлые или рыжие волосы. Почти всегда обгорает, загар не держится.', plan: null },
  { k: 'II', sw: '#ecc9ad', t: 'Светлая кожа', d: 'Светлые глаза и волосы. Обгорает легко, загорает медленно.', plan: [3, 3, 4, 4, 5] },
  { k: 'III', sw: '#d4a37c', t: 'Светлая, с тёплым тоном', d: 'Тёмно-русые или каштановые волосы. Иногда обгорает, загорает постепенно.', plan: [5, 5, 6, 7, 8] },
  { k: 'IV', sw: '#a8734c', t: 'Смуглая, оливковая', d: 'Тёмные волосы и глаза. Обгорает редко, загорает быстро.', plan: [6, 7, 8, 9, 10] },
]
function Tan() {
  const [i, setI] = useState(2)
  const T = TYPES[i]
  const max = 10
  return (
    <section id="tan" className="relative px-5 py-28 md:px-12 md:py-36" style={{ background: SAND, color: INK }}>
      <div className="mx-auto max-w-[1320px]">
        <div className="grid gap-8 md:grid-cols-[1.1fr_.9fr] md:items-end">
          <div>
            <p className={`${SANS} mb-5 text-[11.5px] font-medium uppercase tracking-[.26em] text-[#1d231c]/50`}>Полевой журнал · безопасный загар</p>
            <h2 className={`${SERIF} text-[clamp(38px,5.6vw,88px)] font-light leading-[.98] tracking-[-0.03em]`}>Маршрут к загару —<br /><em>без ожогов.</em></h2>
          </div>
          <p className={`${SANS} max-w-[440px] text-[16px] leading-relaxed text-[#1d231c]/65 md:justify-self-end`}>Выберите свой фототип — покажем, как обычно выстраивают первые сеансы: начинают с короткого времени и наращивают плавно. Точные минуты подберёт администратор — они зависят от ламп и вашей кожи.</p>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-3 md:grid-cols-4" role="radiogroup" aria-label="Фототип кожи">
          {TYPES.map((x, j) => (
            <button key={x.k} type="button" role="radio" aria-checked={i === j} onClick={() => setI(j)}
              className={`group relative overflow-hidden rounded-[6px] border p-5 text-left transition-colors md:p-6 ${i === j ? 'border-[#1d231c] bg-[#fbf7ef]' : 'border-[#1d231c]/15 hover:border-[#1d231c]/45'}`}>
              <div className="flex items-center gap-3">
                <span className="h-12 w-12 rounded-full shadow-[inset_0_-6px_12px_rgba(0,0,0,.12)] transition-transform group-hover:scale-105" style={{ background: x.sw }} />
                <span className={`${SERIF} text-[34px] font-light leading-none`}>{x.k}</span>
              </div>
              <p className={`${SANS} mt-4 text-[14.5px] font-semibold`}>{x.t}</p>
              <p className={`${SANS} mt-1 hidden text-[13px] leading-relaxed text-[#1d231c]/55 md:block`}>{x.d}</p>
              {i === j && <motion.span layoutId="tanbar" className="absolute inset-x-0 bottom-0 h-1" style={{ background: AMBER }} />}
            </button>
          ))}
        </div>

        <div className="mt-6 rounded-[6px] bg-[#26332a] p-6 text-[#f6efe2] md:p-10">
          <AnimatePresence mode="wait">
            <motion.div key={T.k} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.45, ease: [0.2, 0, 0, 1] }}>
              {T.plan ? (<>
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className={`${SANS} text-[11px] uppercase tracking-[.24em] text-[#f6efe2]/55`}>Фототип {T.k} · план первых сеансов</p>
                    <p className={`${SERIF} mt-3 text-[clamp(28px,3.4vw,48px)] font-light leading-tight`}>Старт — <span className="text-[#f0b365]">короткие сеансы</span>, время подберёт администратор</p>
                  </div>
                  <p className={`${SANS} max-w-[340px] text-[14px] text-[#f6efe2]/60`}>Между сеансами — не меньше 48 часов, чтобы кожа успела восстановиться.</p>
                </div>
                <div className="relative mt-12">
                  <div className="absolute left-0 right-0 top-[52px] hidden border-t border-dashed border-[#f6efe2]/25 md:block" />
                  <div className="grid grid-cols-5 gap-2 md:gap-4">
                    {T.plan.map((m, j) => (
                      <motion.div key={j} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + j * 0.08, duration: 0.5 }} className="relative flex flex-col items-center text-center">
                        <div className="grid h-[104px] place-items-center">
                          <span className="rounded-full" style={{ width: 26 + (m / max) * 70, height: 26 + (m / max) * 70, background: `radial-gradient(circle at 40% 35%, #fff1c4, ${AMBER} 70%)`, boxShadow: `0 0 ${10 + m * 4}px rgba(240,179,101,.5)` }} />
                        </div>
                        <p className={`${SERIF} mt-3 text-[clamp(15px,1.6vw,22px)] font-light leading-tight`}>{['Мягкий старт', 'Чуть дольше', 'Привыкание', 'Ровный тон', 'Поддержка'][j]}</p>
                        <p className={`${SANS} mt-1 text-[11px] uppercase tracking-[.16em] text-[#f6efe2]/50`}>Сеанс {j + 1}</p>
                        <p className={`${SANS} hidden text-[12.5px] text-[#f6efe2]/45 md:block`}>{j === 0 ? 'день 1' : `день ${1 + j * 2}+`}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </>) : (
                <div className="grid gap-6 md:grid-cols-[auto_1fr] md:items-center">
                  <span className="grid h-16 w-16 place-items-center rounded-full border border-[#f6efe2]/30"><Info size={26} /></span>
                  <div>
                    <p className={`${SERIF} text-[clamp(26px,3vw,42px)] font-light leading-tight`}>Для I фототипа солярий обычно не рекомендуют.</p>
                    <p className={`${SANS} mt-3 max-w-[620px] text-[15px] leading-relaxed text-[#f6efe2]/65`}>Очень светлая кожа легко обгорает. Загляните на консультацию — администратор подскажет, что подойдёт именно вам, в том числе среди уходовых процедур.</p>
                  </div>
                </div>
              )}
              <div className="mt-10 flex flex-col gap-4 border-t border-[#f6efe2]/15 pt-6 md:flex-row md:items-center md:justify-between">
                <p className={`${SANS} flex max-w-[620px] items-start gap-2 text-[13.5px] text-[#f6efe2]/55`}><Info size={16} className="mt-0.5 shrink-0" />Это общий ориентир, не медицинская рекомендация. Перед первым сеансом проконсультируйтесь с администратором: время зависит от типа солярия и ламп.</p>
                <a href="#book" data-svc={T.plan ? `Солярий, фототип ${T.k} — первый сеанс` : 'Консультация (фототип I)'} className={`${SANS} inline-flex h-13 h-[52px] shrink-0 items-center justify-center gap-2 rounded-full bg-[#f6efe2] px-7 text-[15px] font-medium text-[#1d231c] transition-transform hover:-translate-y-0.5`}>{T.plan ? 'Записаться на первый сеанс' : 'Записаться на консультацию'} <ArrowRight size={16} /></a>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

/* ---------------- chapters of services (clip reveal) ---------------- */
const SV = [
  { k: 'Солярий', n: 'Глава I', d: 'Ровный загар круглый год. Время сеанса подбираем под фототип — спокойно, без спешки.', list: ['Сеансы загара', 'Подбор времени', 'Первый визит с консультацией'], g: 'radial-gradient(120% 90% at 70% 110%, #f0b365, #c46a2a 45%, #3a2a1c 100%)' },
  { k: 'Косметология', n: 'Глава II', d: 'Уход за кожей лица — до и после сезона, когда хочется свежести и сияния.', list: ['Уходовые процедуры', 'Очищение', 'Консультация по уходу'], g: 'radial-gradient(120% 90% at 30% 110%, #c9b38f, #5b6b4f 50%, #1d231c 100%)' },
]
function SvCard({ s, i }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 30%'] })
  const clip = useTransform(scrollYProgress, [0, 1], ['inset(18% 8% 18% 8% round 6px)', 'inset(0% 0% 0% 0% round 6px)'])
  return (
    <motion.a ref={ref} href="#book" data-svc={s.k} style={{ clipPath: clip, background: s.g }} className="group relative flex min-h-[520px] flex-col justify-end overflow-hidden p-7 text-[#f6efe2] md:min-h-[620px] md:p-10">
      <p className={`${SANS} absolute left-7 top-7 text-[11px] uppercase tracking-[.26em] text-[#f6efe2]/60 md:left-10 md:top-10`}>{s.n}</p>
      <Sun className="absolute right-7 top-7 text-[#f6efe2]/50 transition-transform duration-700 group-hover:rotate-90 md:right-10 md:top-10" size={26} strokeWidth={1.2} />
      <h3 className={`${SERIF} text-[clamp(44px,6vw,92px)] font-light leading-none tracking-[-0.03em]`}>{s.k}</h3>
      <p className={`${SANS} mt-5 max-w-[420px] text-[15.5px] leading-relaxed text-[#f6efe2]/75`}>{s.d}</p>
      <ul className={`${SANS} mt-6 flex flex-wrap gap-2`}>{s.list.map(l => <li key={l} className="rounded-full border border-[#f6efe2]/30 px-3.5 py-1.5 text-[13px]">{l}</li>)}</ul>
      <span className={`${SANS} mt-8 inline-flex items-center gap-2 text-[14.5px] font-medium`}>Записаться <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" /></span>
    </motion.a>
  )
}
function Services() {
  return (
    <section id="services" className="px-5 py-28 md:px-12 md:py-36" style={{ background: '#e9dfcd' }}>
      <div className="mx-auto max-w-[1320px]">
        <h2 className={`${SERIF} mb-12 text-[clamp(36px,5vw,76px)] font-light tracking-[-0.03em]`}><Reveal as="span" className="block">Две главы</Reveal><Reveal as="span" delay={0.1} className="block text-[#1d231c]/40"><em>одного лета.</em></Reveal></h2>
        <div className="grid gap-4 md:grid-cols-2">{SV.map((s, i) => <SvCard key={s.k} s={s} i={i} />)}</div>
      </div>
    </section>
  )
}

/* ---------------- proof / field notes ---------------- */
function Proof() {
  return (
    <section className="px-5 pb-28 md:px-12 md:pb-36" style={{ background: '#e9dfcd' }}>
      <div className="mx-auto grid max-w-[1320px] gap-4 md:grid-cols-3">
        <Reveal className="rounded-[6px] bg-[#f6efe2] p-8 md:col-span-1 md:p-10">
          <p className={`${SANS} text-[11px] uppercase tracking-[.24em] text-[#1d231c]/50`}>Яндекс Карты</p>
          <p className={`${SERIF} mt-10 text-[clamp(96px,11vw,160px)] font-light leading-[.85] tracking-[-0.04em]`}>{b.rating}</p>
          <p className={`${SANS} mt-4 text-[15px] text-[#1d231c]/60`}>{b.rev} оценок от гостей студии</p>
        </Reveal>
        <Reveal delay={0.08} className="rounded-[6px] bg-[#26332a] p-8 text-[#f6efe2] md:p-10">
          <p className={`${SANS} text-[11px] uppercase tracking-[.24em] text-[#f6efe2]/50`}>Координаты</p>
          <p className={`${SERIF} mt-10 text-[clamp(30px,3vw,44px)] font-light leading-tight`}>Интернациональная, 2</p>
          <p className={`${SANS} mt-3 text-[15px] text-[#f6efe2]/60`}>{b.floor} · центр Минска</p>
        </Reveal>
        <Reveal delay={0.16} className="flex flex-col rounded-[6px] p-8 text-[#1d231c] md:p-10" style={{ background: 'linear-gradient(160deg,#f0b365,#d9822b)' }}>
          <p className={`${SANS} text-[11px] uppercase tracking-[.24em] text-[#1d231c]/60`}>Связь</p>
          <a href={'tel:' + tel(b.phone)} className={`${SERIF} mt-10 text-[clamp(26px,2.6vw,38px)] font-light`}>{b.phone}</a>
          <p className={`${SANS} mt-2 text-[14.5px] text-[#1d231c]/70`}>Звонок, Viber, WhatsApp — один номер</p>
          <div className="mt-auto flex gap-2 pt-8">
            {[[b.tg, <TG key="t" />, 'Telegram'], [b.ig, <IG key="i" />, 'Instagram'], [b.vk, <VK key="v" />, 'VK']].map(([h, ic, l]) => <a key={l} href={h} target="_blank" rel="noopener" aria-label={l} className="grid h-12 w-12 place-items-center rounded-full border border-[#1d231c]/25 hover:bg-[#1d231c] hover:text-[#f6efe2]">{ic}</a>)}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ---------------- booking ---------------- */
const BSV = ['Солярий', 'Первый сеанс с консультацией', 'Косметология', 'Консультация']
const DAYS = ['Сегодня', 'Завтра', 'На неделе', 'Подберите сами']
const TIMES = ['Утро', 'День', 'Вечер']
function Pill({ on, children, ...rest }) {
  return <button type="button" aria-pressed={on} className={`${SANS} h-11 rounded-full px-5 text-[14.5px] transition-colors ${on ? 'bg-[#1d231c] text-[#f6efe2]' : 'border border-[#1d231c]/20 hover:border-[#1d231c]/60'}`} {...rest}>{children}</button>
}
function Book() {
  const bk = useBooking()
  const [step, setStep] = useState(0)
  const [day, setDay] = useState(''), [time, setTime] = useState(''), [via, setVia] = useState('Звонок')
  const [err, setErr] = useState('')
  const head = useRef(null)
  useEffect(() => { if (step) head.current?.focus() }, [step])
  const next = e => {
    e.preventDefault()
    if (step === 0 && !bk.s.svc) return setErr('Выберите услугу')
    if (step === 1 && !day) return setErr('Выберите, когда удобно')
    setErr('')
    if (step < 2) setStep(step + 1); else bk.submit()
  }
  const custom = bk.s.svc && !BSV.includes(bk.s.svc)
  const titles = ['Куда отправимся?', 'Когда?', 'Как с вами связаться?']
  return (
    <section id="book" className="px-5 py-28 md:px-12 md:py-36" style={{ background: SAND, color: INK }}>
      <div className="mx-auto grid max-w-[1320px] gap-14 lg:grid-cols-[.85fr_1.15fr]">
        <div>
          <p className={`${SANS} mb-5 text-[11.5px] font-medium uppercase tracking-[.26em] text-[#1d231c]/50`}>Последняя запись в журнале</p>
          <h2 className={`${SERIF} text-[clamp(38px,5.4vw,84px)] font-light leading-[.98] tracking-[-0.03em]`}>Забронируйте<br /><em>немного лета.</em></h2>
          <p className={`${SANS} mt-6 max-w-[380px] text-[16px] leading-relaxed text-[#1d231c]/60`}>Администратор свяжется и подтвердит время.</p>
          <a href={'tel:' + tel(b.phone)} className={`${SERIF} mt-4 inline-block text-[26px] font-light hover:text-[#d9822b]`}>{b.phone}</a>
        </div>
        <div className="rounded-[6px] bg-[#fbf7ef] p-6 shadow-[0_40px_80px_-50px_rgba(29,35,28,.5)] md:p-10">
          {bk.s.sent ? (
            <div className="py-10 text-center" role="status">
              <CheckDraw className="mx-auto text-[#d9822b]" />
              <p className={`${SERIF} mt-6 text-[32px] font-light`}>Заявка отправлена</p>
              <p className={`${SANS} mx-auto mt-3 max-w-[380px] text-[#1d231c]/60`}>Ответим {via === 'Звонок' ? 'звонком' : 'в ' + via}. В готовом сайте заявка сразу придёт вам в Telegram.</p>
              <button type="button" onClick={() => { bk.reset(); setStep(0); setDay(''); setTime('') }} className={`${SANS} mt-8 text-[14px] text-[#1d231c]/55 underline underline-offset-4`}>Новая заявка</button>
            </div>
          ) : (
            <form onSubmit={next} noValidate className={SANS}>
              <div className="mb-8 flex items-center gap-3">
                {[0, 1, 2].map(i => <React.Fragment key={i}><span className={`grid h-8 w-8 place-items-center rounded-full text-[13px] ${i <= step ? 'bg-[#1d231c] text-[#f6efe2]' : 'border border-[#1d231c]/20 text-[#1d231c]/45'}`}>{i + 1}</span>{i < 2 && <span className="h-px flex-1 bg-[#1d231c]/15"><motion.span className="block h-px bg-[#1d231c]" animate={{ width: i < step ? '100%' : '0%' }} transition={{ duration: 0.5 }} /></span>}</React.Fragment>)}
              </div>
              <h3 ref={head} tabIndex={-1} className={`${SERIF} mb-7 text-[28px] font-light outline-none`}>{titles[step]}</h3>
              <AnimatePresence mode="wait">
                <motion.div key={step} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                  {step === 0 && <div className="flex flex-wrap gap-2.5">{custom && <Pill on>{bk.s.svc}</Pill>}{BSV.map(s => <Pill key={s} on={bk.s.svc === s} onClick={() => { bk.upd('svc', s); setErr('') }}>{s}</Pill>)}</div>}
                  {step === 1 && (<>
                    <div className="flex flex-wrap gap-2.5">{DAYS.map(d => <Pill key={d} on={day === d} onClick={() => { setDay(d); setErr('') }}>{d}</Pill>)}</div>
                    <p className="mb-3 mt-7 text-[13px] text-[#1d231c]/45">Время</p>
                    <div className="flex flex-wrap gap-2.5">{TIMES.map(t => <Pill key={t} on={time === t} onClick={() => setTime(t)}>{t}</Pill>)}</div>
                  </>)}
                  {step === 2 && (<div className="space-y-4">
                    <input value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} autoComplete="name" placeholder="Имя" aria-label="Имя" className="h-14 w-full rounded-[6px] border border-[#1d231c]/15 bg-[#f1e8da] px-5 text-[16px] outline-none focus:border-[#d9822b]" />
                    <input value={bk.s.phone} onChange={e => bk.upd('phone', e.target.value)} onFocus={phoneFocus(bk)} type="tel" inputMode="tel" autoComplete="tel" placeholder="+375 __ ___-__-__" aria-label="Телефон" aria-invalid={bk.s.err}
                      className={`h-14 w-full rounded-[6px] border bg-[#f1e8da] px-5 text-[16px] outline-none focus:border-[#d9822b] ${bk.s.err ? 'border-[#c0392b]' : 'border-[#1d231c]/15'}`} />
                    {bk.s.err && <p className="text-[14px] text-[#c0392b]">Проверьте номер — 12 цифр с кодом +375.</p>}
                    <p className="pt-2 text-[13px] text-[#1d231c]/45">Как ответить</p>
                    <div className="flex flex-wrap gap-2">{['Звонок', 'Viber', 'WhatsApp', 'Telegram'].map(v => <Pill key={v} on={via === v} onClick={() => setVia(v)}>{v}</Pill>)}</div>
                  </div>)}
                </motion.div>
              </AnimatePresence>
              {err && <p className="mt-4 text-[14px] text-[#c0392b]" role="alert">{err}</p>}
              <div className="mt-9 flex items-center justify-between">
                {step > 0 ? <button type="button" onClick={() => setStep(step - 1)} className="text-[14px] text-[#1d231c]/55 hover:text-[#1d231c]">← Назад</button> : <span />}
                <button type="submit" disabled={bk.s.loading} className="inline-flex h-12 items-center gap-2 rounded-full bg-[#1d231c] px-7 text-[15px] font-medium text-[#f6efe2] disabled:opacity-60">{step < 2 ? 'Дальше' : bk.s.loading ? 'Отправляем…' : 'Записаться'} <ArrowRight size={16} /></button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

function Contact() {
  const L = [[b.viber, <MessageCircle key="v" size={17} />, 'Viber'], [b.wa, <WA key="w" />, 'WhatsApp'], [b.tg, <TG key="t" />, 'Telegram'], [b.ig, <IG key="i" />, 'Instagram'], [b.vk, <VK key="k" />, 'VK']]
  return (
    <section id="contact" className="px-5 py-24 md:px-12" style={{ background: FOREST, color: '#f6efe2' }}>
      <div className="mx-auto grid max-w-[1320px] gap-10 lg:grid-cols-[.85fr_1.15fr]">
        <div className={SANS}>
          <h2 className={`${SERIF} text-[clamp(34px,4.4vw,64px)] font-light tracking-[-0.03em]`}>Как добраться</h2>
          <p className="mt-8 flex items-start gap-3 text-[18px]"><MapPin className="mt-1 shrink-0 text-[#f0b365]" size={20} />{b.addr}, {b.floor}, {b.city}</p>
          <a href={'tel:' + tel(b.phone)} className="mt-4 flex items-center gap-3 text-[22px] hover:text-[#f0b365]"><Phone className="text-[#f0b365]" size={19} />{b.phone}</a>
          <p className="mt-2 text-[14px] text-[#f6efe2]/50">Viber и WhatsApp — по этому же номеру</p>
          <div className="mt-8 flex flex-wrap gap-2.5">{L.map(([h, ic, l]) => <a key={l} href={h} target="_blank" rel="noopener" className="inline-flex h-12 items-center gap-2 rounded-full border border-[#f6efe2]/25 px-5 text-[14px] font-medium hover:border-[#f6efe2]">{ic}{l}</a>)}</div>
        </div>
        <div className="h-[380px] overflow-hidden rounded-[6px] md:h-[460px]"><MapFrame oid={b.oid} /></div>
      </div>
    </section>
  )
}

function App() {
  useSmooth()
  const lite = useLite()
  return (
    <MotionConfig reducedMotion="user">
      <div className={`overflow-x-clip ${SANS}`} style={{ background: SAND, color: INK, '--sel': '#f0b365', '--selc': INK }}>
        <Ribbon name={b.name} bg="#0c0f0c" fg="#f6efe2" />
        <header className="sticky top-0 z-40 mix-blend-normal">
          <div className="absolute inset-0 bg-[#0c0f0c]/60 backdrop-blur-md" />
          <div className="relative mx-auto flex h-16 max-w-[1320px] items-center justify-between px-5 text-[#f6efe2] md:px-12">
            <a href="#top" className="flex items-center gap-2.5"><span className="relative h-6 w-6 overflow-hidden rounded-full border border-[#f6efe2]/70"><span className="absolute inset-x-0 bottom-0 h-1/2 bg-[#f0b365]" /></span><span className={`${SERIF} text-[19px] font-light tracking-[-0.01em]`}>Мэджик Сан</span></a>
            <nav className="hidden gap-8 text-[13px] uppercase tracking-[.16em] text-[#f6efe2]/75 md:flex">{[['#tan', 'Фототип'], ['#services', 'Услуги'], ['#contact', 'Контакты']].map(([h, t]) => <a key={h} href={h} className="hover:text-[#f6efe2]">{t}</a>)}</nav>
            <a href="#book" className="hidden h-10 items-center rounded-full bg-[#f6efe2] px-5 text-[14px] font-medium text-[#1d231c] sm:inline-flex">Записаться</a>
          </div>
        </header>
        <main className="-mt-16">
          <Film lite={lite} />
          <Tan />
          <Services />
          <Proof />
          <Book />
          <Contact />
        </main>
        <footer className="px-5 py-8 text-[13px] text-[#f6efe2]/50 md:px-12" style={{ background: FOREST }}>
          <div className="mx-auto flex max-w-[1320px] flex-wrap justify-between gap-4 border-t border-[#f6efe2]/10 pt-8"><span>© 2026 {b.name} · Концепт сайта — Артём</span><span>{b.addr}, {b.floor}</span></div>
        </footer>
        <CallBar phone={b.phone} barCls="bg-[#1d231c]/95 backdrop-blur border-t border-[#f6efe2]/10" callCls="rounded-full border border-[#f6efe2]/30 text-[#f6efe2]" bookCls="rounded-full bg-[#f0b365] text-[#1d231c]" />
        <div className="h-[72px] sm:hidden" style={{ background: FOREST }} />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
