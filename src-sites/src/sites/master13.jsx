import React, { useRef, useState, useEffect, useMemo, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, useSpring, useInView, AnimatePresence, MotionConfig } from 'framer-motion'
import { ArrowRight, ArrowUpRight, Phone, MapPin, Star, ChevronDown, Search, Copy, Check, CornerDownLeft, Activity, Disc3, MessageSquare, Clock } from 'lucide-react'
import '../lib/base.css'
import { useSmooth, Ribbon, LineReveal, Reveal, useBooking, phoneFocus, CheckDraw, MapFrame, CallBar, tel, useLite, IG, TG, WA } from '../lib/kit'

const Neon13 = lazy(() => import('./master133d'))

const b = {
  name: 'Автомастерская 13', addr: 'пер. Болотникова, 10', city: 'Минск', phone: '+375 44 718-80-03',
  ig: 'https://www.instagram.com/automasterskaya_13', tg: 'https://t.me/+375447188003',
  rating: '4,9', rev: 65, oid: '117792472517',
}
const NUM = '375447188003'
const viberLink = txt => `viber://chat?number=%2B${NUM}` + (txt ? '&draft=' + encodeURIComponent(txt) : '')
const waLinkTxt = txt => `https://wa.me/${NUM}` + (txt ? '?text=' + encodeURIComponent(txt) : '')
const Vb = p => (<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" {...p}><path d="M11.4 2C7.6 2 3.4 2.9 3 8.5c-.2 3.2-.1 6.2 2.5 8.3v3.1c0 .7.8 1 1.3.5l2.2-2.3c.8.1 1.6.1 2.4.1 3.8 0 8-1 8.4-6.5.3-4.6-.6-8.1-3.6-9.2C15.3 2.1 13.4 2 11.4 2Zm.2 1.6c1.8 0 3.4.1 4.3.5 2.3.9 2.9 3.6 2.7 7.6-.3 4.4-3.5 5.1-6.8 5.1-.7 0-1.5 0-2.2-.1l-2.4 2.4v-2.9c-2.2-1.5-2.2-4-2-6.7.3-4.6 3.6-5.9 6.4-5.9Zm-2.5 2.6c-.3 0-.6.1-.9.4-.5.5-.9 1.2-.6 2.1.7 1.9 2.5 4.4 5 5.4.8.3 1.5-.1 2-.7.3-.4.2-.9-.2-1.2l-1.2-.9c-.4-.3-.9-.2-1.1.2l-.3.4c-.9-.3-2-1.4-2.4-2.4l.4-.3c.4-.3.5-.8.2-1.1l-.8-1.3a.9.9 0 0 0-.1-.1c-.2-.3-.4-.5-.6-.5Zm3.3.1a.4.4 0 0 0 0 .8c1.9.1 3 1.2 3.1 3.1a.4.4 0 0 0 .8 0c-.1-2.3-1.6-3.8-3.9-3.9Zm.1 1.4a.4.4 0 0 0 0 .8c.9.1 1.4.6 1.5 1.5a.4.4 0 0 0 .8 0c-.1-1.3-1-2.2-2.3-2.3Z" /></svg>)

const INTER = "font-['Inter',sans-serif]", MONO = "font-['JetBrains_Mono',monospace]"
const BG = '#08090a', NEON = '#ff7a1a', SIG = '#39f5c8'
const grad = 'bg-[linear-gradient(180deg,#fff_20%,#9ba0a8)] bg-clip-text text-transparent'

/* ---------------- primitives ---------------- */
function Glow({ children, className = '', inner = '', as = 'div', ...rest }) {
  const Tag = as
  const mv = e => { const r = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty('--mx', e.clientX - r.left + 'px'); e.currentTarget.style.setProperty('--my', e.clientY - r.top + 'px') }
  return (
    <Tag onPointerMove={mv} className={'group relative rounded-[14px] p-px ' + className} style={{ background: 'radial-gradient(320px circle at var(--mx,30%) var(--my,-10%), rgba(255,122,26,.55), rgba(255,255,255,.08) 60%)' }} {...rest}>
      <div className={'relative h-full rounded-[13px] bg-[#0d0e10] ' + inner}>{children}</div>
    </Tag>
  )
}
const Kbd = ({ children }) => <kbd className={`${MONO} inline-grid h-6 min-w-6 place-items-center rounded-[5px] border border-white/15 bg-white/5 px-1.5 text-[11.5px] text-[#c9ccd1]`}>{children}</kbd>
const Label = ({ children }) => <p className={`${MONO} text-[12.5px] uppercase tracking-[.16em] text-[#8a8f98]`}>{children}</p>

const NAV = [['services', 'Услуги'], ['how', 'Как работаем'], ['rating', 'Рейтинг'], ['contact', 'Контакты']]
function useActive(ids) {
  const [a, setA] = useState('')
  useEffect(() => {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) setA(e.target.id) }), { rootMargin: '-45% 0px -50% 0px' })
    ids.forEach(id => { const el = document.getElementById(id); if (el) io.observe(el) })
    return () => io.disconnect()
  }, [])
  return a
}
function Mark({ size = 34 }) {
  return (
    <span className={`${INTER} relative grid place-items-center rounded-[9px] font-extrabold tracking-[-0.08em] text-[#ff7a1a]`} style={{ width: size, height: size, fontSize: size * 0.5, background: '#140b05', boxShadow: 'inset 0 0 0 1px rgba(255,122,26,.5), 0 0 18px rgba(255,122,26,.35)' }}>13</span>
  )
}
function Header() {
  const act = useActive(['top', 'why', 'services', 'write', 'how', 'rating', 'book', 'faq', 'contact'])
  const cur = { why: 'services', write: 'services', book: 'rating', faq: 'contact' }[act] || act
  return (
    <header className={`${INTER} sticky top-0 z-50 border-b border-white/[.07] bg-[#08090a]/75 text-[#f7f8f8] backdrop-blur-xl`}>
      <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between gap-4 px-4 md:px-6">
        <a href="#top" className="flex min-w-0 items-center gap-3" aria-label="Автомастерская 13 — наверх">
          <Mark />
          <span className="min-w-0 leading-tight"><span className="block text-[15px] font-semibold tracking-[-0.01em]">Автомастерская 13</span><span className="block truncate text-[12px] text-[#8a8f98]">{b.addr}</span></span>
        </a>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Разделы">
          {NAV.map(([id, l]) => <a key={id} href={'#' + id} aria-current={cur === id ? 'true' : undefined} className={`rounded-[8px] px-3 py-1.5 text-[14px] transition ${cur === id ? 'bg-white/[.08] text-white' : 'text-[#8a8f98] hover:text-white'}`}>{l}</a>)}
        </nav>
        <div className="flex items-center gap-2">
          <a href={'tel:' + tel(b.phone)} className="hidden items-center gap-2 px-2 text-[14.5px] font-medium sm:inline-flex"><Phone size={15} className="text-[#ff7a1a]" />{b.phone}</a>
          <a href="#book" className="inline-flex h-9 items-center rounded-[8px] bg-[#f7f8f8] px-3.5 text-[14px] font-semibold text-[#08090a] hover:bg-white">Записаться</a>
        </div>
      </div>
    </header>
  )
}

/* ---------------- hero + pinned film ---------------- */
const CH = [
  { r: [0.16, 0.38], n: '01', h: 'Тринадцать — к удаче.', d: 'Но полагаемся мы всё-таки на диагностику.' },
  { r: [0.38, 0.62], n: '02', h: 'Подключаемся и читаем сигнал', d: 'Ошибки, датчики, параметры — вместо гаданий.' },
  { r: [0.62, 0.84], n: '03', h: 'Нашли причину — чиним её', d: 'И согласуем работы с вами до начала.' },
]
function Caption({ p, c }) {
  const k = [c.r[0], c.r[0] + 0.04, c.r[1] - 0.04, c.r[1]]
  const o = useTransform(p, k, [0, 1, 1, 0]), y = useTransform(p, k, [20, 0, 0, -14])
  return (
    <motion.div style={{ opacity: o, y }} className="pointer-events-none absolute inset-x-4 bottom-[calc(132px+env(safe-area-inset-bottom))] md:bottom-auto md:left-6 md:right-auto md:top-[8vh] md:w-[420px] lg:left-[max(24px,calc(50vw-596px))]">
      <div className="rounded-[14px] border border-white/10 bg-[#0d0e10]/70 p-5 backdrop-blur-xl md:p-6">
        <p className={`${MONO} text-[12px] tracking-[.14em] text-[#8a8f98]`}><span className="text-[#ff7a1a]">{c.n}</span> / 03</p>
        <h2 className={`${INTER} mt-3 text-[clamp(24px,2.6vw,34px)] font-semibold leading-[1.08] tracking-[-0.03em] text-white`}>{c.h}</h2>
        <p className={`${INTER} mt-2 text-[16px] leading-snug text-[#a6abb3]`}>{c.d}</p>
      </div>
    </motion.div>
  )
}
function Lite13() {
  return (
    <div className="absolute inset-0 grid place-items-start justify-center pt-[16vh] md:place-items-center md:justify-end md:pr-[10vw] md:pt-0">
      <span className={`${INTER} select-none text-[clamp(160px,30vw,420px)] font-extrabold leading-none tracking-[-0.08em] text-transparent`} style={{ WebkitTextStroke: '3px #ff7a1a', filter: 'drop-shadow(0 0 18px rgba(255,122,26,.6))' }}>13</span>
    </div>
  )
}
function Film({ lite }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.4 })
  const near = useInView(ref, { margin: '200px 0px' })
  const [mounted, setMounted] = useState(false)
  useEffect(() => { if (near) setMounted(true) }, [near])
  const heroO = useTransform(p, [0, 0.1], [1, 0]), heroX = useTransform(p, [0, 0.1], [0, -40]), heroPE = useTransform(p, v => (v < 0.06 ? 'auto' : 'none'))
  const endO = useTransform(p, [0.84, 0.92], [0, 1]), endPE = useTransform(p, v => (v > 0.88 ? 'auto' : 'none'))
  const scope = useTransform(p, [0.4, 0.62], [0, 1])
  return (
    <section ref={ref} id="top" className="relative h-[280vh]" style={{ background: BG }}>
      <div className="sticky top-16 h-[calc(100svh-64px)] overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(60%_50%_at_70%_40%,rgba(255,122,26,.13),transparent_70%),radial-gradient(40%_40%_at_10%_90%,rgba(57,245,200,.06),transparent_70%)]" />
        <div aria-hidden="true" className="absolute inset-0 opacity-[.35] [background-image:linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,#000_30%,transparent_75%)]" />
        <div className="absolute inset-0">{lite ? <Lite13 /> : mounted ? <Suspense fallback={<Lite13 />}><Neon13 progress={p} active={near} /></Suspense> : <Lite13 />}</div>

        <motion.div style={{ opacity: heroO, x: heroX, pointerEvents: heroPE }} className="absolute inset-x-0 bottom-[calc(132px+env(safe-area-inset-bottom))] px-4 md:bottom-0 md:top-0 md:flex md:items-center md:px-6">
          <div className="mx-auto w-full max-w-[1240px]">
            <div className="max-w-[600px]">
              <a href="#contact" className={`${MONO} inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.04] py-1 pl-1.5 pr-3 text-[12.5px] text-[#c9ccd1] backdrop-blur`}>
                <span className="rounded-full bg-[#ff7a1a]/15 px-2 py-0.5 text-[#ff9a4d]">Минск</span><MapPin size={13} /> {b.addr}
              </a>
              <h1 className={`${INTER} mt-5 text-[clamp(34px,5.6vw,76px)] font-semibold leading-[1] tracking-[-0.045em]`}>
                <LineReveal className={grad}>Диагностика, ремонт</LineReveal>
                <LineReveal delay={0.1} className={grad}>и шиномонтаж</LineReveal>
              </h1>
              <p className={`${INTER} mt-5 hidden max-w-[480px] text-[17px] leading-snug text-[#a6abb3] sm:block`}>Автомастерская 13 на Болотникова. Записывайтесь по телефону или напишите мастеру в мессенджер.</p>
              <a href="#rating" className={`${INTER} mt-4 inline-flex items-center gap-2 text-[15px] text-[#f7f8f8]`}><Star size={15} className="fill-[#ff7a1a] text-[#ff7a1a]" /><b>{b.rating}</b><span className="text-[#8a8f98]">· {b.rev} оценок на Яндекс Картах</span></a>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <a href="#book" className={`${INTER} inline-flex h-12 items-center gap-2 rounded-[10px] bg-[#ff7a1a] px-5 text-[15.5px] font-semibold text-[#130800] shadow-[0_0_30px_rgba(255,122,26,.35)] hover:bg-[#ff8d3a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white`}>Записаться <ArrowRight size={16} /></a>
                <a href="#write" className={`${INTER} inline-flex h-12 items-center gap-2 rounded-[10px] border border-white/12 bg-white/[.04] px-5 text-[15.5px] font-medium text-white backdrop-blur hover:border-white/30`}><MessageSquare size={16} /> Написать мастеру</a>
                <a href={'tel:' + tel(b.phone)} className={`${INTER} hidden h-12 items-center gap-2 px-2 text-[15.5px] font-medium text-white sm:inline-flex`}><Phone size={16} className="text-[#ff7a1a]" />{b.phone}</a>
              </div>
              <a href="#services" className={`${INTER} mt-5 hidden items-center gap-1.5 text-[14px] text-[#8a8f98] hover:text-white md:inline-flex`}>Пропустить анимацию <ArrowRight size={14} /></a>
            </div>
          </div>
        </motion.div>

        {CH.map(c => <Caption key={c.n} p={p} c={c} />)}

        <motion.div style={{ opacity: scope }} className={`${MONO} pointer-events-none absolute right-4 top-[3vh] text-right text-[11.5px] leading-relaxed text-[#39f5c8]/80 md:right-6`} aria-hidden="true">
          <p>CH1 · 5V/div</p><p>SCAN · OK</p>
        </motion.div>

        <motion.div style={{ opacity: endO, pointerEvents: endPE }} className="absolute inset-x-4 bottom-[calc(132px+env(safe-area-inset-bottom))] md:bottom-[9vh]">
          <div className="mx-auto max-w-[720px] rounded-[16px] border border-white/10 bg-[#0d0e10]/75 p-5 text-center backdrop-blur-xl md:p-7">
            <h2 className={`${INTER} text-[clamp(24px,3vw,38px)] font-semibold leading-[1.08] tracking-[-0.03em] text-white`}>Опишите проблему — за 10 секунд</h2>
            <p className={`${INTER} mt-2 text-[16px] text-[#a6abb3]`}>Соберём сообщение мастеру в WhatsApp, Viber или Telegram.</p>
            <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
              <a href="#write" className={`${INTER} inline-flex h-12 items-center justify-center gap-2 rounded-[10px] bg-[#f7f8f8] px-5 text-[15.5px] font-semibold text-[#08090a]`}>Собрать сообщение <ArrowRight size={16} /></a>
              <a href="#services" className={`${INTER} inline-flex h-12 items-center justify-center rounded-[10px] border border-white/12 px-5 text-[15.5px] font-medium text-white hover:border-white/30`}>Все 13 услуг</a>
            </div>
          </div>
        </motion.div>
        <a href="#services" className={`${INTER} absolute bottom-4 right-4 hidden text-[13.5px] text-[#8a8f98] hover:text-white md:block`}>Пропустить →</a>
      </div>
    </section>
  )
}

/* ---------------- bento ---------------- */
function MiniWave() {
  return (
    <svg viewBox="0 0 300 80" className="h-20 w-full" aria-hidden="true">
      <defs><linearGradient id="mw" x1="0" x2="1"><stop offset="0" stopColor="#39f5c8" stopOpacity="0" /><stop offset=".5" stopColor="#39f5c8" /><stop offset="1" stopColor="#39f5c8" stopOpacity="0" /></linearGradient></defs>
      <motion.path d="M0 50 L40 50 L52 48 L58 12 L64 66 L70 50 L120 50 L132 48 L138 12 L144 66 L150 50 L200 50 L212 48 L218 12 L224 66 L230 50 L300 50" fill="none" stroke="url(#mw)" strokeWidth="2.5"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: false }} transition={{ duration: 1.8, ease: 'easeInOut' }} style={{ filter: 'drop-shadow(0 0 6px #39f5c8)' }} />
    </svg>
  )
}
function Bento() {
  return (
    <section id="why" className="px-4 py-24 md:px-6 md:py-32" style={{ background: BG }}>
      <div className="mx-auto max-w-[1240px]">
        <Label>Почему 13</Label>
        <h2 className={`${INTER} mt-3 max-w-[760px] text-[clamp(32px,4.4vw,58px)] font-semibold leading-[1.02] tracking-[-0.04em]`}><span className={grad}>Один адрес — три задачи.</span> <span className="text-[#5d626a]">Диагностика, ремонт и колёса.</span></h2>
        <div className="mt-12 grid gap-3 md:grid-cols-6 md:grid-rows-[auto_auto]">
          <Glow className="md:col-span-4" inner="p-6 md:p-8">
            <div className="flex items-center gap-2 text-[#39f5c8]"><Activity size={18} /><Label>Автодиагностика</Label></div>
            <h3 className={`${INTER} mt-4 text-[26px] font-semibold tracking-[-0.03em] text-white`}>Сначала находим причину</h3>
            <p className={`${INTER} mt-2 max-w-[460px] text-[16px] text-[#a6abb3]`}>Компьютерная диагностика и осмотр — чтобы менять только то, что действительно неисправно.</p>
            <MiniWave />
          </Glow>
          <Glow className="md:col-span-2" inner="flex flex-col justify-between p-6 md:p-8">
            <Label>Яндекс Карты</Label>
            <div>
              <p className={`${INTER} text-[88px] font-semibold leading-none tracking-[-0.06em] text-white`}>{b.rating}</p>
              <p className={`${INTER} mt-2 text-[15px] text-[#a6abb3]`}>{b.rev} оценок</p>
            </div>
          </Glow>
          <Glow className="md:col-span-2" inner="p-6 md:p-8">
            <div className="flex items-center gap-2 text-[#ff7a1a]"><Disc3 size={18} /><Label>Шиномонтаж</Label></div>
            <motion.svg viewBox="0 0 100 100" className="mx-auto my-4 h-28 w-28" animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }} aria-hidden="true">
              <circle cx="50" cy="50" r="44" fill="none" stroke="#2a2c30" strokeWidth="12" /><circle cx="50" cy="50" r="44" fill="none" stroke="#ff7a1a" strokeOpacity=".5" strokeWidth="1" strokeDasharray="3 4" />
              <circle cx="50" cy="50" r="24" fill="none" stroke="#c9ccd1" strokeWidth="2" />{[0, 72, 144, 216, 288].map(a => <circle key={a} cx={50 + Math.cos(a * Math.PI / 180) * 12} cy={50 + Math.sin(a * Math.PI / 180) * 12} r="2.5" fill="#c9ccd1" />)}
            </motion.svg>
            <p className={`${INTER} text-[16px] text-[#a6abb3]`}>Сезонная смена, балансировка, проколы.</p>
          </Glow>
          <Glow className="md:col-span-2" inner="p-6 md:p-8">
            <Label>Мессенджеры</Label>
            <p className={`${INTER} mt-4 text-[22px] font-semibold leading-tight tracking-[-0.02em] text-white`}>Пишите туда, где вам удобно</p>
            <div className="mt-5 flex gap-2">
              {[[WA, waLinkTxt(''), 'WhatsApp'], [Vb, viberLink(''), 'Viber'], [TG, b.tg, 'Telegram'], [IG, b.ig, 'Instagram']].map(([I, h, l]) => <a key={l} href={h} target="_blank" rel="noopener" aria-label={l} className="grid h-12 w-12 place-items-center rounded-[10px] border border-white/10 bg-white/[.03] text-[#c9ccd1] hover:border-[#ff7a1a]/60 hover:text-white"><I /></a>)}
            </div>
          </Glow>
          <Glow className="md:col-span-2" inner="flex flex-col justify-between p-6 md:p-8">
            <Label>Адрес</Label>
            <div className="mt-6">
              <p className={`${INTER} text-[26px] font-semibold tracking-[-0.03em] text-white`}>{b.addr}</p>
              <a href="#contact" className={`${INTER} mt-2 inline-flex items-center gap-1 text-[15px] text-[#ff9a4d] hover:underline`}>Карта и контакты <ArrowRight size={14} /></a>
            </div>
          </Glow>
        </div>
      </div>
    </section>
  )
}

/* ---------------- services: lucky 13 ---------------- */
const SERVICES = [
  ['Диагностика', 'Компьютерная диагностика', 'Считываем ошибки и живые параметры датчиков.', 'обычно до часа'],
  ['Диагностика', 'Диагностика ходовой', 'Подвеска, рулевое, люфты и стуки.', 'обычно до часа'],
  ['Диагностика', 'Проверка перед покупкой', 'Посмотрим машину до сделки.', 'уточняйте при записи'],
  ['Ремонт', 'Автоэлектрика', 'Проводка, датчики, запуск, зарядка.', 'по объёму работ'],
  ['Ремонт', 'Ремонт подвески', 'Рычаги, сайлентблоки, амортизаторы, стойки.', 'по объёму работ'],
  ['Ремонт', 'Тормозная система', 'Колодки, диски, суппорты, жидкость.', 'часто в день обращения'],
  ['Ремонт', 'Замена масла и фильтров', 'Плановое ТО по регламенту.', 'часто в день обращения'],
  ['Ремонт', 'Зажигание: свечи и катушки', 'Если троит и плавают обороты.', 'часто в день обращения'],
  ['Ремонт', 'Ремонт двигателя', 'ГРМ, течи, навесное оборудование.', 'по итогам диагностики'],
  ['Шины', 'Шиномонтаж', 'Снятие, монтаж и установка колёс.', 'уточняйте при записи'],
  ['Шины', 'Балансировка', 'Если руль бьёт на скорости.', 'уточняйте при записи'],
  ['Шины', 'Ремонт проколов', 'Латка или жгут — по состоянию шины.', 'уточняйте при записи'],
  ['Шины', 'Сезонная смена колёс', 'Переобувка к зиме и к лету.', 'уточняйте при записи'],
]
function Services() {
  const [cat, setCat] = useState('Все'), [q, setQ] = useState('')
  const inp = useRef(null)
  useEffect(() => {
    const h = e => { if (e.key === '/' && !/INPUT|TEXTAREA/.test(document.activeElement?.tagName)) { e.preventDefault(); inp.current?.focus() } }
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h)
  }, [])
  const list = SERVICES.map((s, i) => [i, ...s]).filter(([, c, t, d]) => (cat === 'Все' || c === cat) && (t + ' ' + d).toLowerCase().includes(q.toLowerCase().trim()))
  return (
    <section id="services" className="relative overflow-hidden px-4 py-24 md:px-6 md:py-32" style={{ background: '#0a0b0c' }}>
      <span aria-hidden="true" className={`${INTER} pointer-events-none absolute -right-[4vw] -top-[6vw] select-none text-[40vw] font-extrabold leading-none tracking-[-0.08em] text-transparent [-webkit-text-stroke:1px_rgba(255,122,26,.12)]`}>13</span>
      <div className="relative mx-auto max-w-[1240px]">
        <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <Label>Услуги</Label>
            <h2 className={`${INTER} mt-3 text-[clamp(32px,4.4vw,58px)] font-semibold leading-[1.02] tracking-[-0.04em]`}><span className={grad}>Ровно 13 вещей,</span><br /><span className="text-[#5d626a]">с которыми к нам едут.</span></h2>
          </div>
          <div className="flex flex-col gap-3 md:w-[400px]">
            <label className="relative block">
              <span className="sr-only">Поиск услуги</span>
              <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8a8f98]" />
              <input ref={inp} value={q} onChange={e => setQ(e.target.value)} placeholder="Найти услугу…" className={`${INTER} h-12 w-full rounded-[10px] border border-white/10 bg-white/[.03] pl-10 pr-12 text-[16px] text-white placeholder:text-[#6b7078] focus:border-[#ff7a1a]/70 focus:outline-none`} />
              <span className="absolute right-3 top-1/2 hidden -translate-y-1/2 md:block"><Kbd>/</Kbd></span>
            </label>
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Категории">
              {['Все', 'Диагностика', 'Ремонт', 'Шины'].map(c => <button key={c} role="tab" aria-selected={cat === c} onClick={() => setCat(c)} className={`${INTER} h-10 rounded-[8px] px-3.5 text-[14.5px] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ff7a1a] ${cat === c ? 'bg-white text-[#08090a]' : 'border border-white/10 text-[#c9ccd1] hover:border-white/30'}`}>{c}</button>)}
            </div>
          </div>
        </div>
        <ul className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map(([i, c, t, d, time]) => (
            <Glow as="li" key={t} inner="flex h-full flex-col p-5">
              <div className="flex items-start justify-between">
                <span className={`${INTER} text-[44px] font-semibold leading-none tracking-[-0.06em] ${i === 12 ? 'text-[#ff7a1a]' : 'text-[#2c2f34]'}`}>{String(i + 1).padStart(2, '0')}</span>
                <span className={`${MONO} rounded-full border border-white/10 px-2 py-0.5 text-[11.5px] text-[#8a8f98]`}>{c}</span>
              </div>
              <h3 className={`${INTER} mt-5 text-[19px] font-semibold tracking-[-0.02em] text-white`}>{t}</h3>
              <p className={`${INTER} mt-1.5 text-[15.5px] leading-snug text-[#a6abb3]`}>{d}</p>
              <div className="mt-auto flex items-end justify-between gap-3 pt-5">
                <p className={`${INTER} text-[13.5px] leading-snug text-[#8a8f98]`}><span className="flex items-center gap-1"><Clock size={13} /> {time}</span>цена — уточнит мастер</p>
                <a href="#book" data-svc={t} className={`${INTER} inline-flex h-10 shrink-0 items-center rounded-[8px] border border-white/12 px-3.5 text-[14px] font-medium text-white hover:border-[#ff7a1a] hover:text-[#ffb27a]`}>Записаться</a>
              </div>
            </Glow>
          ))}
        </ul>
        {!list.length && <p className={`${INTER} mt-10 text-[16px] text-[#a6abb3]`}>Ничего не нашли — <a className="text-[#ff9a4d] underline" href="#write">напишите мастеру</a>, он подскажет.</p>}
      </div>
    </section>
  )
}

/* ---------------- value interaction: message builder ---------------- */
const BRANDS = ['Toyota', 'Volkswagen', 'Renault', 'Hyundai', 'Kia', 'Skoda', 'Audi', 'BMW', 'Mercedes', 'Opel', 'Ford', 'Nissan', 'Mazda', 'Peugeot', 'Citroen', 'Geely', 'Lada', 'Другая']
const PROBS = ['Горит Check Engine', 'Нужна компьютерная диагностика', 'Стук в подвеске', 'Скрип тормозов', 'Плохо заводится', 'Плавают обороты', 'Вибрация на скорости', 'Шиномонтаж / смена колёс', 'Пробито колесо', 'Плановое ТО, масло', 'Что-то с электрикой']
const WHEN = ['Сегодня', 'Завтра', 'На этой неделе', 'Не срочно']
function Chip({ on, onClick, children }) {
  return <button type="button" aria-pressed={on} onClick={onClick} className={`${INTER} min-h-[44px] rounded-[9px] px-3.5 text-[15px] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ff7a1a] ${on ? 'bg-[#ff7a1a] font-semibold text-[#130800] shadow-[0_0_18px_rgba(255,122,26,.35)]' : 'border border-white/10 bg-white/[.02] text-[#c9ccd1] hover:border-white/30'}`}>{children}</button>
}
function Writer() {
  const [brand, setBrand] = useState(''), [model, setModel] = useState(''), [probs, setProbs] = useState([]), [when, setWhen] = useState(''), [note, setNote] = useState('')
  const [t0, setT0] = useState(0), [done, setDone] = useState(0), [toast, setToast] = useState('')
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 25%'] })
  const rx = useTransform(scrollYProgress, [0, 1], [18, 0]), sc = useTransform(scrollYProgress, [0, 1], [0.94, 1])
  const touch = () => { if (!t0) setT0(Date.now()) }
  const ready = brand && probs.length
  useEffect(() => { if (ready && t0 && !done) setDone(Math.max(1, Math.round((Date.now() - t0) / 1000))) }, [ready])
  const car = [brand === 'Другая' ? '' : brand, model].filter(Boolean).join(' ')
  const msg = useMemo(() => {
    const L = ['Здравствуйте! Пишу с сайта Автомастерской 13.']
    if (car) L.push('Авто: ' + car + '.')
    if (probs.length) L.push('Вопрос: ' + probs.join(', ').toLowerCase().replace('check engine', 'Check Engine') + '.')
    if (note.trim()) L.push(note.trim())
    if (when) L.push('Когда удобно: ' + when.toLowerCase() + '.')
    L.push('Подскажите, когда можно подъехать?')
    return L.join('\n')
  }, [car, probs, when, note])
  const flash = s => { setToast(s); setTimeout(() => setToast(''), 2400) }
  const copy = async () => { try { await navigator.clipboard.writeText(msg); return true } catch (e) { return false } }
  const tgClick = async () => { const ok = await copy(); flash(ok ? 'Текст скопирован — вставьте его в чат Telegram' : 'Откройте чат и вставьте текст') }
  const vbClick = async () => { await copy() }
  const toggle = x => { touch(); setProbs(p => p.includes(x) ? p.filter(y => y !== x) : [...p, x]) }
  const summary = [car, probs.join(', ')].filter(Boolean).join(' · ').slice(0, 120) || 'Сообщение мастеру'
  return (
    <section id="write" ref={ref} className="relative px-4 py-24 md:px-6 md:py-32" style={{ background: BG }}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[500px] bg-[radial-gradient(50%_60%_at_50%_0%,rgba(255,122,26,.12),transparent)]" />
      <div className="relative mx-auto max-w-[1240px]">
        <div className="text-center">
          <Label>Написать мастеру</Label>
          <h2 className={`${INTER} mx-auto mt-3 max-w-[820px] text-[clamp(32px,4.6vw,62px)] font-semibold leading-[1.02] tracking-[-0.045em]`}><span className={grad}>Сообщение мастеру</span> <span className="text-[#ff7a1a]">за 10 секунд</span></h2>
          <p className={`${INTER} mx-auto mt-4 max-w-[560px] text-[17px] text-[#a6abb3]`}>Нажмите марку и что случилось — текст соберётся сам. Останется отправить в удобный мессенджер.</p>
        </div>
        <motion.div style={{ rotateX: rx, scale: sc, transformPerspective: 1400 }} className="mt-12 origin-top">
          <Glow inner="grid overflow-hidden lg:grid-cols-[1.25fr_1fr]">
            <div className="space-y-7 p-5 md:p-8">
              <fieldset>
                <legend className="mb-3 flex items-center gap-2"><Kbd>1</Kbd><span className={`${INTER} text-[16px] font-semibold text-white`}>Марка авто</span></legend>
                <div className="flex flex-wrap gap-2">{BRANDS.map(x => <Chip key={x} on={brand === x} onClick={() => { touch(); setBrand(brand === x ? '' : x) }}>{x}</Chip>)}</div>
                <label className="mt-3 block"><span className="sr-only">Модель и год</span>
                  <input value={model} onChange={e => { touch(); setModel(e.target.value) }} placeholder="Модель и год — необязательно (например, Golf 2012)" className={`${INTER} h-12 w-full rounded-[10px] border border-white/10 bg-white/[.03] px-4 text-[16px] text-white placeholder:text-[#6b7078] focus:border-[#ff7a1a]/70 focus:outline-none`} />
                </label>
              </fieldset>
              <fieldset>
                <legend className="mb-3 flex items-center gap-2"><Kbd>2</Kbd><span className={`${INTER} text-[16px] font-semibold text-white`}>Что беспокоит</span><span className={`${INTER} text-[14px] text-[#8a8f98]`}>· можно несколько</span></legend>
                <div className="flex flex-wrap gap-2">{PROBS.map(x => <Chip key={x} on={probs.includes(x)} onClick={() => toggle(x)}>{x}</Chip>)}</div>
                <label className="mt-3 block"><span className="sr-only">Своими словами</span>
                  <input value={note} onChange={e => { touch(); setNote(e.target.value) }} placeholder="Своими словами — необязательно" className={`${INTER} h-12 w-full rounded-[10px] border border-white/10 bg-white/[.03] px-4 text-[16px] text-white placeholder:text-[#6b7078] focus:border-[#ff7a1a]/70 focus:outline-none`} />
                </label>
              </fieldset>
              <fieldset>
                <legend className="mb-3 flex items-center gap-2"><Kbd>3</Kbd><span className={`${INTER} text-[16px] font-semibold text-white`}>Когда удобно</span></legend>
                <div className="flex flex-wrap gap-2">{WHEN.map(x => <Chip key={x} on={when === x} onClick={() => { touch(); setWhen(when === x ? '' : x) }}>{x}</Chip>)}</div>
              </fieldset>
            </div>
            <div className="flex flex-col border-t border-white/[.07] bg-[#0a0b0c] p-5 md:p-8 lg:border-l lg:border-t-0">
              <div className="flex items-center justify-between">
                <p className={`${MONO} text-[12.5px] text-[#8a8f98]`}>сообщение.txt</p>
                <AnimatePresence>{done > 0 && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className={`${MONO} rounded-full bg-[#39f5c8]/10 px-2.5 py-0.5 text-[12px] text-[#39f5c8]`}>готово за {done} сек</motion.p>}</AnimatePresence>
              </div>
              <pre aria-live="polite" className={`${INTER} mt-4 min-h-[190px] flex-1 whitespace-pre-wrap rounded-[10px] border border-white/[.07] bg-[#08090a] p-4 text-[15.5px] leading-relaxed text-[#e6e8eb]`}>{msg}<span className="ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[3px] animate-pulse bg-[#ff7a1a]" /></pre>
              {!ready && <p className={`${INTER} mt-3 text-[14.5px] text-[#8a8f98]`}>Выберите марку и хотя бы одну проблему — так мастеру будет проще ответить.</p>}
              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                <a href={waLinkTxt(msg)} target="_blank" rel="noopener" className={`${INTER} inline-flex h-12 items-center justify-center gap-2 rounded-[10px] bg-[#25d366] text-[15px] font-semibold text-[#062b14] hover:brightness-110`}><WA /> WhatsApp</a>
                <a href={viberLink(msg)} onClick={vbClick} className={`${INTER} inline-flex h-12 items-center justify-center gap-2 rounded-[10px] bg-[#7360f2] text-[15px] font-semibold text-white hover:brightness-110`}><Vb /> Viber</a>
                <a href={b.tg} target="_blank" rel="noopener" onClick={tgClick} className={`${INTER} inline-flex h-12 items-center justify-center gap-2 rounded-[10px] bg-[#2aabee] text-[15px] font-semibold text-white hover:brightness-110`}><TG /> Telegram</a>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button type="button" onClick={async () => flash((await copy()) ? 'Текст скопирован' : 'Не удалось скопировать — выделите текст вручную')} className={`${INTER} inline-flex h-11 items-center justify-center gap-2 rounded-[10px] border border-white/12 text-[14.5px] text-white hover:border-white/30`}><Copy size={15} /> Скопировать</button>
                <a href="#book" data-svc={summary} className={`${INTER} inline-flex h-11 items-center justify-center gap-2 rounded-[10px] border border-white/12 text-[14.5px] text-white hover:border-white/30`}>Заявка на сайте <ArrowRight size={15} /></a>
              </div>
              <p className={`${INTER} mt-3 text-[13.5px] leading-snug text-[#8a8f98]`}>WhatsApp и Viber откроются с готовым текстом. В Telegram текст скопируется — просто вставьте его в чат.</p>
              <AnimatePresence>{toast && <motion.p role="status" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`${INTER} mt-3 flex items-center gap-2 rounded-[8px] bg-[#39f5c8]/10 px-3 py-2 text-[14.5px] text-[#39f5c8]`}><Check size={15} /> {toast}</motion.p>}</AnimatePresence>
            </div>
          </Glow>
        </motion.div>
      </div>
    </section>
  )
}

/* ---------------- how ---------------- */
const STEPS = [['Пишете или звоните', 'В мессенджер, по телефону или через форму.'], ['Приезжаете', 'На Болотникова, 10 — в согласованное время.'], ['Диагностика', 'Показываем, что нашли, и объясняем без терминов.'], ['Согласовали — сделали', 'Ремонт только после вашего согласия.']]
function How() {
  return (
    <section id="how" className="px-4 py-24 md:px-6 md:py-32" style={{ background: '#0a0b0c' }}>
      <div className="mx-auto max-w-[1240px]">
        <Label>Как мы работаем</Label>
        <h2 className={`${INTER} mt-3 text-[clamp(32px,4.4vw,58px)] font-semibold leading-[1.02] tracking-[-0.04em]`}><span className={grad}>Четыре шага до готовой машины</span></h2>
        <ol className="relative mt-14 grid gap-3 md:grid-cols-4">
          <div aria-hidden="true" className="absolute left-0 right-0 top-[34px] hidden h-px bg-[linear-gradient(90deg,transparent,rgba(255,122,26,.6),rgba(57,245,200,.6),transparent)] md:block" />
          {STEPS.map(([t, d], i) => (
            <Reveal as="li" key={t} delay={i * 0.07} className="relative">
              <span className={`${MONO} relative z-[1] grid h-[68px] w-[68px] place-items-center rounded-[14px] border border-white/10 bg-[#0d0e10] text-[20px] text-white`} style={{ boxShadow: `0 0 24px ${i < 2 ? 'rgba(255,122,26,.18)' : 'rgba(57,245,200,.16)'}` }}>0{i + 1}</span>
              <h3 className={`${INTER} mt-6 text-[20px] font-semibold tracking-[-0.02em] text-white`}>{t}</h3>
              <p className={`${INTER} mt-2 text-[16px] leading-snug text-[#a6abb3]`}>{d}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}

/* ---------------- rating ---------------- */
function Rating() {
  return (
    <section id="rating" className="relative overflow-hidden px-4 py-24 md:px-6 md:py-32" style={{ background: BG }}>
      <div className="mx-auto grid max-w-[1240px] items-center gap-10 md:grid-cols-[1.2fr_1fr]">
        <div className="relative">
          <p aria-hidden="true" className={`${INTER} select-none text-[clamp(140px,22vw,300px)] font-extrabold leading-[.8] tracking-[-0.08em] text-transparent [-webkit-text-stroke:2px_#ff7a1a]`} style={{ filter: 'drop-shadow(0 0 22px rgba(255,122,26,.45))' }}>{b.rating}</p>
        </div>
        <div>
          <Label>Рейтинг на Яндекс Картах</Label>
          <p className={`${INTER} mt-4 text-[clamp(28px,3.4vw,44px)] font-semibold leading-[1.08] tracking-[-0.03em] text-white`}>{b.rating} из 5 — по {b.rev} оценкам водителей</p>
          <div className="mt-4 flex gap-1" aria-hidden="true">{[0, 1, 2, 3, 4].map(i => <Star key={i} size={22} className="fill-[#ff7a1a] text-[#ff7a1a]" />)}</div>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#book" className={`${INTER} inline-flex h-12 items-center gap-2 rounded-[10px] bg-[#ff7a1a] px-5 text-[15.5px] font-semibold text-[#130800] hover:bg-[#ff8d3a]`}>Записаться <ArrowRight size={16} /></a>
            <a href={`https://yandex.by/maps/org/${b.oid}/reviews/`} target="_blank" rel="noopener" className={`${INTER} inline-flex h-12 items-center gap-2 rounded-[10px] border border-white/12 px-5 text-[15.5px] text-white hover:border-white/30`}>Читать отзывы <ArrowUpRight size={16} /></a>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- booking: command-palette style ---------------- */
const DAYS = ['Сегодня', 'Завтра', 'Другой день']
function Booking() {
  const bk = useBooking()
  const [step, setStep] = useState(0), [q, setQ] = useState(''), [hi, setHi] = useState(0), [day, setDay] = useState('')
  useEffect(() => { if (bk.s.svc && !bk.s.sent) setStep(s => (s === 0 ? 1 : s)) }, [bk.s.svc])
  const opts = [...SERVICES.map(s => s[1]), 'Другое — опишу по телефону'].filter(x => x.toLowerCase().includes(q.toLowerCase().trim()))
  const pick = x => { bk.upd('svc', x); setStep(1) }
  const key = e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setHi(h => Math.min(opts.length - 1, h + 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setHi(h => Math.max(0, h - 1)) }
    if (e.key === 'Enter') { e.preventDefault(); if (opts[hi]) pick(opts[hi]) }
  }
  const inp = `${INTER} mt-2 block h-14 w-full rounded-[10px] border border-white/10 bg-white/[.03] px-4 text-[17px] text-white placeholder:text-[#6b7078] focus:border-[#ff7a1a]/70 focus:outline-none`
  return (
    <section id="book" className="px-4 py-24 md:px-6 md:py-32" style={{ background: '#0a0b0c' }}>
      <div className="mx-auto max-w-[720px]">
        <div className="text-center">
          <Label>Запись</Label>
          <h2 className={`${INTER} mt-3 text-[clamp(32px,4.4vw,56px)] font-semibold leading-[1.02] tracking-[-0.04em]`}><span className={grad}>Записаться в «13»</span></h2>
          <p className={`${INTER} mt-3 text-[17px] text-[#a6abb3]`}>Три шага. Мастер перезвонит и подтвердит время.</p>
        </div>
        <Glow className="mt-10" inner="p-5 md:p-7">
          {bk.s.sent ? (
            <div className="grid min-h-[340px] place-items-center text-center" role="status">
              <div>
                <CheckDraw className="mx-auto text-[#39f5c8]" />
                <p className={`${INTER} mt-5 text-[26px] font-semibold tracking-[-0.03em] text-white`}>Заявка принята</p>
                <p className={`${INTER} mx-auto mt-2 max-w-[360px] text-[16px] text-[#a6abb3]`}>Мастер свяжется с вами, чтобы подтвердить время. В готовом сайте заявка сразу придёт вам в Telegram.</p>
                <button onClick={() => { bk.reset(); setStep(0); setDay(''); setQ('') }} className={`${INTER} mt-6 h-11 rounded-[10px] border border-white/15 px-5 text-[15px] text-white hover:border-white/40`}>Новая заявка</button>
              </div>
            </div>
          ) : (
            <form onSubmit={e => { e.preventDefault(); bk.submit() }} noValidate>
              <div className="flex items-center gap-2">{['Услуга', 'День', 'Контакты'].map((l, i) => (
                <button key={l} type="button" disabled={i > step} onClick={() => setStep(i)} className={`${MONO} flex h-8 items-center gap-1.5 rounded-full px-3 text-[12px] ${i === step ? 'bg-white text-[#08090a]' : i < step ? 'border border-white/15 text-white' : 'border border-white/[.06] text-[#5d626a]'}`}>{i < step ? <Check size={12} /> : i + 1} {l}</button>
              ))}</div>
              {step === 0 && (
                <div className="mt-5">
                  <label className="relative block"><span className="sr-only">Найти услугу</span>
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8a8f98]" />
                    <input value={q} onChange={e => { setQ(e.target.value); setHi(0) }} onKeyDown={key} placeholder="Найти услугу…" className={`${INTER} h-14 w-full rounded-[10px] border border-white/10 bg-white/[.03] pl-11 pr-4 text-[17px] text-white placeholder:text-[#6b7078] focus:border-[#ff7a1a]/70 focus:outline-none`} />
                  </label>
                  <ul role="listbox" aria-label="Услуги" className="mt-3 max-h-[300px] overflow-y-auto pr-1" data-lenis-prevent>
                    {opts.map((x, i) => (
                      <li key={x} role="option" aria-selected={i === hi}>
                        <button type="button" onMouseEnter={() => setHi(i)} onClick={() => pick(x)} className={`${INTER} flex min-h-[48px] w-full items-center justify-between rounded-[8px] px-3.5 text-left text-[16px] ${i === hi ? 'bg-white/[.07] text-white' : 'text-[#c9ccd1]'}`}>
                          {x}{i === hi && <span className="hidden md:inline-flex"><Kbd><CornerDownLeft size={12} /></Kbd></span>}
                        </button>
                      </li>
                    ))}
                  </ul>
                  <p className={`${INTER} mt-3 hidden items-center gap-2 text-[13px] text-[#6b7078] md:flex`}><Kbd>↑</Kbd><Kbd>↓</Kbd> выбрать · <Kbd>↵</Kbd> подтвердить</p>
                </div>
              )}
              {step === 1 && (
                <div className="mt-6">
                  <p className={`${INTER} text-[15px] text-[#a6abb3]`}>Услуга: <span className="text-white">{bk.s.svc}</span> <button type="button" onClick={() => setStep(0)} className="ml-1 text-[#ff9a4d] underline underline-offset-2">изменить</button></p>
                  <p className={`${INTER} mt-6 text-[18px] font-semibold text-white`}>Когда удобно приехать?</p>
                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">{DAYS.map(d => <Chip key={d} on={day === d} onClick={() => { setDay(d); setStep(2) }}>{d}</Chip>)}</div>
                  <p className={`${INTER} mt-3 text-[14px] text-[#8a8f98]`}>Точное время мастер подтвердит при звонке.</p>
                </div>
              )}
              {step === 2 && (
                <div className="mt-6 space-y-4">
                  <p className={`${INTER} text-[15px] text-[#a6abb3]`}>{bk.s.svc} · {day || 'день уточним'}</p>
                  <label className={`${INTER} block text-[15px] text-[#c9ccd1]`}>Имя<input className={inp} value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} placeholder="Как к вам обращаться" autoComplete="given-name" /></label>
                  <label className={`${INTER} block text-[15px] text-[#c9ccd1]`}>Телефон<input className={inp + (bk.s.err ? ' border-[#ff5a5a]' : '')} type="tel" inputMode="tel" value={bk.s.phone} onFocus={phoneFocus(bk)} onChange={e => bk.upd('phone', e.target.value)} placeholder="+375 44 000-00-00" autoComplete="tel" aria-invalid={bk.s.err} aria-describedby="m13-err" /></label>
                  {bk.s.err && <p id="m13-err" className={`${INTER} text-[15px] text-[#ff8080]`}>Введите полный номер с кодом оператора.</p>}
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setStep(1)} className={`${INTER} h-14 rounded-[10px] border border-white/12 px-5 text-[16px] text-white`}>Назад</button>
                    <button type="submit" disabled={bk.s.loading} className={`${INTER} h-14 flex-1 rounded-[10px] bg-[#ff7a1a] text-[16px] font-semibold text-[#130800] hover:bg-[#ff8d3a] disabled:opacity-60`}>{bk.s.loading ? 'Отправляем…' : 'Отправить заявку'}</button>
                  </div>
                </div>
              )}
            </form>
          )}
        </Glow>
      </div>
    </section>
  )
}

/* ---------------- FAQ ---------------- */
const FAQ = [
  ['Можно написать, а не звонить?', 'Да. WhatsApp, Viber и Telegram — на номер ' + b.phone + '. Удобнее всего собрать сообщение в блоке «Написать мастеру».'],
  ['Сколько длится компьютерная диагностика?', 'Обычно до часа, но зависит от машины и неисправности. Мастер сориентирует при записи.'],
  ['Нужна ли запись на шиномонтаж?', 'В сезон переобувки лучше записаться заранее — так не придётся ждать.'],
  ['Скажете, что нужно сделать, до начала работ?', 'Да: после диагностики мастер объяснит, что нашёл, и ремонт начинается только после вашего согласия.'],
  ['Как оплатить?', 'Способы оплаты уточняйте по телефону или в мессенджере.'],
  ['Где оставить машину?', 'Подскажем при записи, где удобнее встать по адресу Болотникова, 10.'],
]
function Faq() {
  const [o, setO] = useState(0)
  return (
    <section id="faq" className="px-4 py-24 md:px-6 md:py-32" style={{ background: BG }}>
      <div className="mx-auto grid max-w-[1240px] gap-10 md:grid-cols-[.8fr_1.2fr]">
        <div><Label>FAQ</Label><h2 className={`${INTER} mt-3 text-[clamp(32px,4vw,52px)] font-semibold leading-[1.02] tracking-[-0.04em]`}><span className={grad}>Частые вопросы</span></h2></div>
        <div className="space-y-2">
          {FAQ.map(([q, a], i) => (
            <div key={q} className={`rounded-[12px] border transition ${o === i ? 'border-white/15 bg-white/[.03]' : 'border-white/[.07]'}`}>
              <h3><button type="button" aria-expanded={o === i} onClick={() => setO(o === i ? -1 : i)} className={`${INTER} flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-[17px] font-medium text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ff7a1a]`}>{q}<ChevronDown size={18} className={`shrink-0 text-[#8a8f98] transition ${o === i ? 'rotate-180 text-[#ff7a1a]' : ''}`} /></button></h3>
              <AnimatePresence initial={false}>{o === i && <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden"><p className={`${INTER} px-5 pb-5 text-[16px] leading-relaxed text-[#a6abb3]`}>{a}</p></motion.div>}</AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------- contact ---------------- */
function Contact() {
  const links = [[WA, 'WhatsApp', waLinkTxt('Здравствуйте! Пишу с сайта Автомастерской 13.')], [Vb, 'Viber', viberLink('')], [TG, 'Telegram', b.tg], [IG, 'Instagram', b.ig]]
  return (
    <section id="contact" className="px-4 pb-28 pt-24 md:px-6 md:pb-24 md:pt-32" style={{ background: '#0a0b0c' }}>
      <div className="mx-auto max-w-[1240px]">
        <Glow inner="grid overflow-hidden md:grid-cols-[1fr_1.2fr]">
          <div className="p-6 md:p-10">
            <Label>Контакты</Label>
            <h2 className={`${INTER} mt-3 text-[clamp(30px,3.6vw,48px)] font-semibold leading-[1.04] tracking-[-0.04em]`}><span className={grad}>Болотникова, 10</span></h2>
            <dl className={`${INTER} mt-8 space-y-5 text-[16px]`}>
              <div><dt className="text-[13.5px] text-[#8a8f98]">Адрес</dt><dd className="mt-1 text-white">{b.addr}, {b.city}</dd></div>
              <div><dt className="text-[13.5px] text-[#8a8f98]">Телефон · Viber · WhatsApp</dt><dd className="mt-1"><a href={'tel:' + tel(b.phone)} className="text-[22px] font-semibold text-white hover:text-[#ffb27a]">{b.phone}</a></dd></div>
              <div><dt className="text-[13.5px] text-[#8a8f98]">Часы работы</dt><dd className="mt-1 text-white">Уточняйте по телефону</dd></div>
            </dl>
            <div className="mt-8 grid grid-cols-2 gap-2">
              {links.map(([I, l, h]) => <a key={l} href={h} target="_blank" rel="noopener" className={`${INTER} inline-flex h-12 items-center gap-2.5 rounded-[10px] border border-white/10 px-4 text-[15px] text-white hover:border-[#ff7a1a]/60`}><I /> {l}</a>)}
            </div>
            <a href={'https://yandex.by/maps/?rtext=~' + encodeURIComponent('Минск, переулок Болотникова, 10')} target="_blank" rel="noopener" className={`${INTER} mt-3 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[10px] bg-[#f7f8f8] text-[15.5px] font-semibold text-[#08090a]`}>Построить маршрут <ArrowUpRight size={16} /></a>
          </div>
          <div className="h-[360px] md:h-auto md:min-h-[520px]"><MapFrame oid={b.oid} dark /></div>
        </Glow>
      </div>
    </section>
  )
}

function Shortcuts() {
  useEffect(() => {
    const h = e => {
      if (e.metaKey || e.ctrlKey || e.altKey || /INPUT|TEXTAREA/.test(document.activeElement?.tagName)) return
      const id = { w: 'write', ц: 'write', b: 'book', и: 'book' }[e.key.toLowerCase()]
      if (id) { const el = document.getElementById(id); if (el) { window.__lenis ? window.__lenis.scrollTo(el, { offset: -70 }) : el.scrollIntoView() } }
    }
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h)
  }, [])
  return null
}

function App() {
  useSmooth()
  const lite = useLite()
  return (
    <MotionConfig reducedMotion="user">
      <div className={`${INTER} min-h-screen overflow-x-clip text-[#f7f8f8]`} style={{ background: BG, '--sel': NEON, '--selc': '#000' }}>
        <Shortcuts />
        <Ribbon name={b.name} bg="#ff7a1a" fg="#130800" />
        <Header />
        <main>
          <Film lite={lite} />
          <Bento />
          <Services />
          <Writer />
          <How />
          <Rating />
          <Booking />
          <Faq />
          <Contact />
        </main>
        <footer className={`${INTER} border-t border-white/[.07] px-4 pb-28 pt-10 text-[14px] text-[#8a8f98] md:px-6 md:pb-10`} style={{ background: BG }}>
          <div className="mx-auto flex max-w-[1240px] flex-col justify-between gap-3 md:flex-row md:items-center">
            <p className="flex items-center gap-3"><Mark size={26} /> © 2026 {b.name} · Концепт сайта — Артём</p>
            <p className="hidden items-center gap-2 md:flex"><Kbd>W</Kbd> написать мастеру <Kbd>B</Kbd> записаться</p>
          </div>
        </footer>
        <CallBar phone={b.phone} barCls="bg-[#08090a]/90 backdrop-blur-xl border-t border-white/10" callCls="rounded-[10px] border border-white/15 text-white" bookCls="rounded-[10px] bg-[#ff7a1a] text-[#130800]" />
      </div>
    </MotionConfig>
  )
}

createRoot(document.getElementById('root')).render(<App />)
