import React, { useRef, useState, useEffect, useMemo, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, useSpring, useInView, AnimatePresence, MotionConfig } from 'framer-motion'
import { ArrowRight, ArrowLeft, ArrowUpRight, Phone, MapPin, CalendarDays, MessageCircle } from 'lucide-react'
import '../lib/base.css'
import { useSmooth, Ribbon, LineReveal, Reveal, useBooking, phoneFocus, CheckDraw, MapFrame, CallBar, tel, useLite, IG, TG, WA } from '../lib/kit'

const PrismScene = lazy(() => import('./sodabeauty3d'))

const b = {
  name: 'Soda Beauty Cosmetology', short: 'Soda Beauty', addr: 'Ржавецкая ул., 47', city: 'Минск',
  phone: '+375 44 780-88-00', viber: 'https://viber.click/375447808800', wa: 'https://wa.me/375447808800', tg: 'https://t.me/375447808800',
  ig: 'https://www.instagram.com/sodabeauty_cosmetology', rating: '5,0', rev: 62, oid: '164563294016',
}
const BASE = '#f5f8f9', INK = '#0d1620'
const DISP = "font-['Unbounded',sans-serif]", SANS = "font-['Golos_Text',sans-serif]"
const SPEC = 'linear-gradient(90deg,#ff9a8b,#ffc48a,#f7e68a,#9be7b8,#7fdcd3,#8fb8ff,#c79bff,#f39bd8)'

const CH = [
  { k: 'Чистота', n: '01', c: '#2fb9a9', tint: '#e6f5f2', t: 'Чистая кожа — первый свет.', d: 'Чистки и пилинги: убираем лишнее, чтобы кожа снова дышала.', r: [0.12, 0.33] },
  { k: 'Увлажнение', n: '02', c: '#4b8fe8', tint: '#e8f0fb', t: 'Вода — основа свежести.', d: 'Уходовые процедуры возвращают коже упругость и комфорт.', r: [0.34, 0.55] },
  { k: 'Тонус', n: '03', c: '#ee8a55', tint: '#fbefe6', t: 'Массаж — и лицо отдыхает.', d: 'Снимаем напряжение и отёчность, возвращаем тонус.', r: [0.56, 0.77] },
  { k: 'Сияние', n: '04', c: '#cf6bbf', tint: '#f8eaf5', t: 'Свет, который видно.', d: 'Ровный тон и сияние — к событию или просто так.', r: [0.78, 1.3] },
]

/* ---------------- pinned film ---------------- */
function Chapter({ p, c }) {
  const k = [c.r[0] - 0.005, c.r[0] + 0.035, c.r[1] - 0.04, c.r[1] - 0.008]
  const o = useTransform(p, k, [0, 1, 1, 0])
  const y = useTransform(p, k, [40, 0, 0, -30])
  const sc = useTransform(p, k, [0.96, 1, 1, 0.98])
  return (
    <motion.div style={{ opacity: o, y, scale: sc }} className="pointer-events-none absolute inset-x-4 bottom-[92px] md:inset-x-auto md:bottom-14 md:right-12 md:w-[420px]">
      <div className="relative overflow-hidden rounded-[28px] border border-white/70 bg-white/55 p-6 shadow-[0_30px_60px_-30px_rgba(13,22,32,.35)] backdrop-blur-xl md:p-8">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-50 blur-2xl" style={{ background: c.c }} />
        <p className={`${DISP} relative flex items-center gap-3 text-[11px] font-medium uppercase tracking-[.2em]`} style={{ color: c.c }}><span className="h-2.5 w-2.5 rounded-full" style={{ background: c.c }} />{c.n} · {c.k}</p>
        <h2 className={`${DISP} relative mt-4 text-[clamp(24px,2.5vw,34px)] font-normal leading-[1.08] tracking-[-0.03em]`}>{c.t}</h2>
        <p className="relative mt-3 text-[15.5px] leading-relaxed text-[#0d1620]/65">{c.d}</p>
      </div>
    </motion.div>
  )
}
function LitePrism({ p }) {
  const rot = useTransform(p, [0, 1], [0, 120])
  return (
    <div className="absolute inset-0">
      <div className="absolute left-[18%] top-[30%] h-[3px] w-[30%] -rotate-[8deg] bg-white shadow-[0_0_20px_#9fb3c2]" />
      <div className="absolute left-[46%] top-[24%] h-[40%] w-[60%] origin-left rotate-[12deg] opacity-60 blur-md" style={{ background: SPEC, clipPath: 'polygon(0 45%, 100% 0, 100% 100%, 0 55%)' }} />
      <motion.div style={{ rotate: rot }} className="absolute left-[38%] top-[14%] h-[28vmin] w-[28vmin] bg-white/50 backdrop-blur [clip-path:polygon(50%_0,100%_86%,0_86%)]" />
    </div>
  )
}
function Film({ lite }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.35 })
  const near = useInView(ref, { margin: '300px 0px' })
  const [mounted, setMounted] = useState(false)
  useEffect(() => { if (near) setMounted(true) }, [near])
  const bg = useTransform(p, [0, 0.1, 0.12, 0.34, 0.56, 0.78, 1], [BASE, BASE, CH[0].tint, CH[1].tint, CH[2].tint, CH[3].tint, CH[3].tint])
  const heroO = useTransform(p, [0, 0.08], [1, 0])
  const heroY = useTransform(p, [0, 0.08], [0, -50])
  const heroPE = useTransform(p, v => (v < 0.05 ? 'auto' : 'none'))
  const dotsO = useTransform(p, [0.06, 0.12], [0, 1])
  return (
    <motion.section ref={ref} id="film" className="relative h-[500vh]" style={{ background: bg }}>
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="absolute inset-0">
          {lite ? <LitePrism p={p} /> : mounted && <Suspense fallback={null}><PrismScene progress={p} active={near} /></Suspense>}
        </div>
        <motion.div style={{ opacity: heroO, y: heroY, pointerEvents: heroPE }} className="absolute inset-x-0 bottom-[112px] px-5 md:bottom-auto md:top-[16%] md:px-12">
          <p className={`${DISP} mb-5 text-[11px] font-medium uppercase tracking-[.22em] text-[#0d1620]/55`}>Косметология · массаж · Минск</p>
          <h1 className={`${DISP} max-w-[900px] text-[clamp(38px,6.2vw,104px)] font-light leading-[.98] tracking-[-0.05em]`}>
            <LineReveal delay={0.1}>Кожа, которая</LineReveal>
            <LineReveal delay={0.22}><span style={{ backgroundImage: 'linear-gradient(90deg,#2fb9a9,#4b8fe8 40%,#cf6bbf 75%,#ee8a55)' }} className="bg-clip-text text-transparent">ловит свет.</span></LineReveal>
          </h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.8 }} className="mt-6 max-w-[420px] text-[16px] leading-relaxed text-[#0d1620]/65 md:text-[17px]">Чистая кожа, свежий тон и сияние — на Ржавецкой, 47.</motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.85, duration: 0.8 }} className="mt-8 hidden gap-3 md:flex">
            <a href="#plan" className="inline-flex h-12 items-center gap-2 rounded-full bg-[#0d1620] px-6 text-[15px] font-medium text-white">Подготовиться к событию <ArrowRight size={16} /></a>
            <a href="#book" className="inline-flex h-12 items-center rounded-full border border-[#0d1620]/20 bg-white/50 px-6 text-[15px] font-medium backdrop-blur hover:border-[#0d1620]/50">Записаться</a>
          </motion.div>
        </motion.div>
        {CH.map(c => <Chapter key={c.n} p={p} c={c} />)}
        <motion.div style={{ opacity: dotsO }} className="pointer-events-none absolute left-12 top-1/2 hidden -translate-y-1/2 flex-col gap-4 md:flex">
          {CH.map(c => <Dot key={c.n} p={p} c={c} />)}
        </motion.div>
      </div>
    </motion.section>
  )
}
function Dot({ p, c }) {
  const o = useTransform(p, [c.r[0] - 0.01, c.r[0] + 0.02, c.r[1] - 0.02, c.r[1]], [0.3, 1, 1, 0.3])
  const w = useTransform(p, [c.r[0] - 0.01, c.r[0] + 0.02, c.r[1] - 0.02, c.r[1]], [10, 34, 34, 10])
  return <motion.div style={{ opacity: o }} className={`${DISP} flex items-center gap-3 text-[11px] uppercase tracking-[.18em]`}><motion.span style={{ width: w, background: c.c }} className="h-[3px] rounded-full" />{c.k}</motion.div>
}

/* ---------------- event planner (value interaction) ---------------- */
const STEPS = [
  { d: 28, t: 'Консультация и старт', x: 'Разбираем состояние кожи. Если нужно — чистка или мягкий пилинг: у кожи будет время восстановиться.', c: '#2fb9a9', svc: 'Консультация' },
  { d: 14, t: 'Увлажнение и уход', x: 'Уходовые процедуры возвращают коже плотность и комфорт.', c: '#4b8fe8', svc: 'Уходовая процедура' },
  { d: 7, t: 'Массаж и тонус', x: 'Снимаем отёки и напряжение, выравниваем цвет лица. Новых активных процедур уже не начинаем.', c: '#ee8a55', svc: 'Массаж лица' },
  { d: 3, t: 'Сияние', x: 'Мягкий уход для свежего тона — без восстановительного периода.', c: '#cf6bbf', svc: 'Уход для сияния' },
  { d: 0, t: 'Ваш день', x: 'Только увлажнение дома — и хорошее настроение.', c: '#0d1620' },
]
const EVENTS = ['Свадьба', 'Выпускной', 'Фотосессия', 'Праздник']
const DAY = 864e5
const iso = d => new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10)
const fmt = d => d.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'short' })
const plural = (n, a, b2, c) => { const m = n % 10, h = n % 100; return m === 1 && h !== 11 ? a : m >= 2 && m <= 4 && (h < 12 || h > 14) ? b2 : c }
function Planner() {
  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d }, [])
  const [date, setDate] = useState(() => iso(new Date(today.getTime() + 30 * DAY)))
  const [ev, setEv] = useState('Свадьба')
  const target = new Date(date + 'T00:00:00')
  const left = Math.round((target - today) / DAY)
  const valid = !isNaN(left) && left >= 0
  const first = STEPS.find(s => s.d > 0 && s.d <= left)
  const span = Math.max(28, left)
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 15%'] })
  const clip = useTransform(scrollYProgress, [0, 1], ['circle(18% at 50% 30%)', 'circle(150% at 50% 30%)'])
  const quick = [['Через 2 недели', 14], ['Через месяц', 30], ['Через 6 недель', 42]]
  return (
    <motion.section ref={ref} id="plan" style={{ clipPath: clip }} className="relative overflow-hidden bg-[#0d1620] px-5 py-24 text-white md:px-12 md:py-36">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[900px] -translate-x-1/2 rounded-full opacity-25 blur-[100px]" style={{ background: SPEC }} />
      <div className="relative mx-auto max-w-[1320px]">
        <div className="grid gap-8 md:grid-cols-2 md:items-end">
          <h2 className={`${DISP} text-[clamp(36px,5.4vw,84px)] font-light leading-[1] tracking-[-0.05em]`}>Подготовка<br />к событию</h2>
          <p className="max-w-[440px] text-[16px] leading-relaxed text-white/60 md:justify-self-end">Укажите дату — и увидите, когда лучше начать. Шаги примерные: точный план косметолог составит на консультации.</p>
        </div>
        <div className="mt-12 grid gap-6 rounded-[28px] border border-white/10 bg-white/[.04] p-5 md:grid-cols-[1fr_1fr] md:p-8">
          <div>
            <p className={`${DISP} mb-3 text-[11px] uppercase tracking-[.2em] text-white/45`}>Событие</p>
            <div className="flex flex-wrap gap-2">{EVENTS.map(e => <button key={e} type="button" onClick={() => setEv(e)} aria-pressed={ev === e} className={`h-11 rounded-full px-5 text-[14.5px] transition-colors ${ev === e ? 'bg-white text-[#0d1620]' : 'border border-white/15 text-white/80 hover:border-white/50'}`}>{e}</button>)}</div>
          </div>
          <div>
            <p className={`${DISP} mb-3 text-[11px] uppercase tracking-[.2em] text-white/45`}>Дата</p>
            <div className="flex flex-wrap items-center gap-2">
              <label className="relative inline-flex h-11 items-center gap-2 rounded-full border border-white/25 px-4 focus-within:border-white">
                <CalendarDays size={16} className="text-white/60" />
                <input type="date" value={date} min={iso(today)} onChange={e => setDate(e.target.value)} aria-label="Дата события" className="bg-transparent text-[14.5px] text-white outline-none [color-scheme:dark]" />
              </label>
              {quick.map(([l, n]) => <button key={l} type="button" onClick={() => setDate(iso(new Date(today.getTime() + n * DAY)))} className="h-11 rounded-full px-3.5 text-[13.5px] text-white/60 underline-offset-4 hover:text-white hover:underline">{l}</button>)}
            </div>
          </div>
        </div>

        {valid && (
          <div className="mt-12">
            <p className={`${DISP} text-[clamp(20px,2.2vw,30px)] font-light tracking-[-0.03em]`}>
              {ev} · {fmt(target)} — {left === 0 ? 'Это сегодня!' : <>До события <span className="bg-clip-text text-transparent" style={{ backgroundImage: SPEC }}>{left} {plural(left, 'день', 'дня', 'дней')}</span>.</>}
            </p>
            {/* desktop timeline */}
            <div className="relative mt-16 hidden h-[2px] md:block" style={{ background: 'rgba(255,255,255,.12)' }}>
              <motion.div className="absolute inset-y-0 left-0" style={{ background: SPEC }} initial={{ width: 0 }} whileInView={{ width: '100%' }} viewport={{ once: true }} transition={{ duration: 1.4, ease: [0.2, 0, 0, 1] }} />
              <div className="absolute -top-8 left-0 -translate-x-1/2 text-[12px] text-white/50">сегодня</div>
              {STEPS.map(s => {
                const x = ((span - s.d) / span) * 100, ok = s.d <= left
                return (
                  <motion.div key={s.d} layout className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ left: x + '%' }} transition={{ type: 'spring', stiffness: 120, damping: 20 }}>
                    <span className={`block h-4 w-4 rounded-full border-2 ${ok ? '' : 'opacity-30'}`} style={{ borderColor: s.c === '#0d1620' ? '#fff' : s.c, background: ok ? (s.c === '#0d1620' ? '#fff' : s.c) : 'transparent' }} />
                    <span className={`${DISP} absolute left-1/2 top-6 -translate-x-1/2 whitespace-nowrap text-[11px] uppercase tracking-[.12em] ${ok ? 'text-white/80' : 'text-white/30'}`}>{s.d ? `за ${s.d} дн.` : 'день Х'}</span>
                  </motion.div>
                )
              })}
            </div>
            <div className="mt-16 grid gap-3 md:grid-cols-5">
              <AnimatePresence initial={false}>
                {STEPS.map((s, i) => {
                  const ok = s.d <= left, when = new Date(target.getTime() - s.d * DAY)
                  return (
                    <motion.div key={s.d} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: ok ? 1 : 0.4, y: 0 }} transition={{ delay: i * 0.06 }}
                      className="relative overflow-hidden rounded-[22px] border border-white/10 bg-white/[.05] p-5">
                      <span className="absolute inset-x-0 top-0 h-[3px]" style={{ background: s.c === '#0d1620' ? '#fff' : s.c }} />
                      <p className="text-[12.5px] text-white/50">{s.d ? `за ${s.d} ${plural(s.d, 'день', 'дня', 'дней')}` : 'в день события'}{ok ? ' · ' + fmt(when) : ''}</p>
                      <p className={`${DISP} mt-3 text-[17px] font-normal leading-snug tracking-[-0.02em]`}>{s.t}</p>
                      <p className="mt-2 text-[14px] leading-relaxed text-white/60">{ok ? s.x : 'Уже не успеваем — косметолог предложит мягкую замену.'}</p>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
            <div className="mt-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <p className="max-w-[560px] text-[13.5px] text-white/45">{left < 3 ? 'До события совсем мало времени — подойдёт деликатный экспресс-уход. Позвоните, подберём время.' : 'Это ориентир, а не медицинская рекомендация. Состав и количество процедур подбираются индивидуально.'}</p>
              <a href="#book" data-svc={`Подготовка к событию: ${ev}, ${fmt(target)}${first ? ' — ' + first.t.toLowerCase() : ''}`} className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-white px-7 text-[15px] font-medium text-[#0d1620] transition-transform hover:-translate-y-0.5">
                {first ? 'Записаться на первый шаг' : 'Записаться на экспресс-уход'} <ArrowRight size={17} />
              </a>
            </div>
          </div>
        )}
      </div>
    </motion.section>
  )
}

/* ---------------- bento ---------------- */
function Tile({ className = '', children, href, glow = '#7fdcd3' }) {
  const Tag = href ? 'a' : 'div'
  return (
    <Reveal className={'group relative ' + className}>
      <div className="absolute -inset-px rounded-[28px] opacity-0 blur-[2px] transition-opacity duration-500 group-hover:opacity-100" style={{ background: SPEC }} />
      <Tag href={href} target={href && href.startsWith('http') ? '_blank' : undefined} rel="noopener" className="relative flex h-full flex-col overflow-hidden rounded-[27px] bg-white p-6 shadow-[0_20px_50px_-30px_rgba(13,22,32,.25)] md:p-7">
        <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full opacity-30 blur-3xl" style={{ background: glow }} />
        {children}
      </Tag>
    </Reveal>
  )
}
function MiniPrism() {
  return (
    <div className="relative h-[96px] w-[96px] shrink-0">
      <motion.div className="absolute inset-0 rounded-full blur-md" style={{ background: 'conic-gradient(from 0deg, #ff9a8b, #f7e68a, #7fdcd3, #8fb8ff, #f39bd8, #ff9a8b)' }} animate={{ rotate: 360 }} transition={{ duration: 14, repeat: Infinity, ease: 'linear' }} />
      <div className="absolute inset-[10px] bg-white/75 backdrop-blur [clip-path:polygon(50%_4%,98%_92%,2%_92%)]" />
    </div>
  )
}
function Bento() {
  return (
    <section id="about" className="px-5 py-28 md:px-12 md:py-36" style={{ background: BASE }}>
      <div className="mx-auto max-w-[1320px]">
        <h2 className={`${DISP} mb-14 max-w-[900px] text-[clamp(32px,4.6vw,72px)] font-light leading-[1.02] tracking-[-0.05em]`}><Reveal as="span" className="block">Свежо, спокойно,</Reveal><Reveal as="span" delay={0.08} className="block text-[#0d1620]/35">по-честному.</Reveal></h2>
        <div className="grid auto-rows-[minmax(210px,auto)] gap-4 md:grid-cols-4">
          <Tile className="md:col-span-2 md:row-span-2" glow="#8fb8ff">
            <p className={`${DISP} text-[11px] uppercase tracking-[.2em] text-[#0d1620]/45`}>Яндекс Карты</p>
            <p className={`${DISP} mt-auto bg-clip-text text-[clamp(110px,14vw,210px)] font-light leading-[.85] tracking-[-0.07em] text-transparent`} style={{ backgroundImage: 'linear-gradient(120deg,#2fb9a9,#4b8fe8 45%,#cf6bbf)' }}>{b.rating}</p>
            <p className="mt-5 text-[16px] text-[#0d1620]/65">{b.rev} оценки на Яндекс Картах</p>
          </Tile>
          <Tile className="md:col-span-2" glow="#f7e68a">
            <p className={`${DISP} text-[11px] uppercase tracking-[.2em] text-[#0d1620]/45`}>Адрес</p>
            <p className={`${DISP} mt-auto text-[clamp(26px,2.8vw,40px)] font-light tracking-[-0.04em]`}>Ржавецкая, 47</p>
            <p className="mt-1 text-[15px] text-[#0d1620]/60">Минск</p>
          </Tile>
          <Tile glow="#f39bd8">
            <p className="text-[14px] text-[#0d1620]/60">Косметология и массаж в одном месте.</p>
            <div className="mt-4 flex flex-1 items-center justify-center"><MiniPrism /></div>
          </Tile>
          <Tile href={b.ig} glow="#ff9a8b">
            <IG width={22} height={22} />
            <p className={`${DISP} mt-auto text-[17px] font-normal tracking-[-0.02em]`}>Instagram</p>
            <p className="break-all text-[13.5px] text-[#0d1620]/55">@sodabeauty_cosmetology</p>
            <ArrowUpRight size={18} className="absolute right-6 top-6 text-[#0d1620]/35 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
          </Tile>
          <Tile className="md:col-span-4" glow="#7fdcd3">
            <div className="flex h-full flex-col justify-between gap-6 md:flex-row md:items-center">
              <div>
                <p className={`${DISP} text-[clamp(22px,2.4vw,34px)] font-light tracking-[-0.04em]`}>Удобнее написать?</p>
                <p className="mt-1 text-[15px] text-[#0d1620]/60">Ответим в мессенджере — один номер для всех.</p>
              </div>
              <div className="flex flex-wrap gap-2.5">
                <a href={b.tg} target="_blank" rel="noopener" className="inline-flex h-12 items-center gap-2 rounded-full bg-[#229ed9] px-5 text-[14px] font-medium text-white"><TG />Telegram</a>
                <a href={b.viber} target="_blank" rel="noopener" className="inline-flex h-12 items-center gap-2 rounded-full bg-[#7360f2] px-5 text-[14px] font-medium text-white"><MessageCircle size={17} />Viber</a>
                <a href={b.wa} target="_blank" rel="noopener" className="inline-flex h-12 items-center gap-2 rounded-full bg-[#25d366] px-5 text-[14px] font-medium text-[#0d1620]"><WA />WhatsApp</a>
              </div>
            </div>
          </Tile>
        </div>
      </div>
    </section>
  )
}

/* ---------------- services: horizontal snap gallery ---------------- */
const SV = [
  ['Чистка лица', 'Глубокое очищение пор и выравнивание рельефа.', '#2fb9a9'],
  ['Пилинги', 'Обновление кожи, ровный тон и текстура.', '#7fdcd3'],
  ['Уходовые процедуры', 'Увлажнение, питание и комфорт для кожи.', '#4b8fe8'],
  ['Массаж лица', 'Тонус, свежий цвет лица, меньше отёков.', '#ee8a55'],
  ['Массаж', 'Снять напряжение и восстановиться.', '#f2b45a'],
  ['Консультация', 'Разбор кожи и план ухода под ваши задачи.', '#cf6bbf'],
]
function Services() {
  const row = useRef(null)
  const go = d => row.current?.scrollBy({ left: d * Math.min(420, row.current.clientWidth * 0.85), behavior: 'smooth' })
  return (
    <section id="services" className="pb-28 md:pb-36" style={{ background: BASE }}>
      <div className="mx-auto mb-10 flex max-w-[1320px] items-end justify-between px-5 md:px-12">
        <h2 className={`${DISP} text-[clamp(32px,4.6vw,72px)] font-light tracking-[-0.05em]`}>Процедуры</h2>
        <div className="hidden gap-2 md:flex">
          <button type="button" onClick={() => go(-1)} aria-label="Назад" className="grid h-12 w-12 place-items-center rounded-full border border-[#0d1620]/15 hover:border-[#0d1620]/50"><ArrowLeft size={18} /></button>
          <button type="button" onClick={() => go(1)} aria-label="Вперёд" className="grid h-12 w-12 place-items-center rounded-full border border-[#0d1620]/15 hover:border-[#0d1620]/50"><ArrowRight size={18} /></button>
        </div>
      </div>
      <div ref={row} data-lenis-prevent-wheel className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 [scrollbar-width:none] md:px-[max(48px,calc((100vw-1320px)/2+48px))] [&::-webkit-scrollbar]:hidden">
        {SV.map(([t, d, c], i) => (
          <a key={t} href="#book" data-svc={t} className="group relative flex h-[380px] w-[78vw] shrink-0 snap-start flex-col overflow-hidden rounded-[28px] bg-white p-7 shadow-[0_20px_50px_-30px_rgba(13,22,32,.3)] sm:w-[340px]">
            <div className="absolute inset-x-0 top-0 h-[55%] transition-transform duration-700 group-hover:scale-110" style={{ background: `radial-gradient(120% 90% at 30% 0%, ${c}, transparent 70%)`, opacity: 0.55 }} />
            <span className={`${DISP} relative text-[12px] text-[#0d1620]/50`}>0{i + 1}</span>
            <p className={`${DISP} relative mt-auto text-[26px] font-light leading-[1.05] tracking-[-0.04em]`}>{t}</p>
            <p className="relative mt-3 text-[15px] leading-relaxed text-[#0d1620]/60">{d}</p>
            <span className="relative mt-6 inline-flex items-center gap-2 text-[14px] font-medium">Записаться <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" /></span>
          </a>
        ))}
      </div>
    </section>
  )
}

/* ---------------- booking ---------------- */
const BSV = ['Консультация', 'Чистка лица', 'Пилинг', 'Уходовая процедура', 'Массаж лица', 'Массаж']
const DAYS = ['Ближайшие дни', 'На этой неделе', 'На следующей', 'Подберите сами']
const TIMES = ['Утро', 'День', 'Вечер']
function Pill({ on, children, ...rest }) {
  return <button type="button" aria-pressed={on} className={`h-11 rounded-full px-5 text-[14.5px] transition-colors ${on ? 'bg-[#0d1620] text-white' : 'border border-[#0d1620]/15 bg-white hover:border-[#0d1620]/50'}`} {...rest}>{children}</button>
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
    if (step === 0 && !bk.s.svc) return setErr('Выберите процедуру или консультацию')
    if (step === 1 && !day) return setErr('Выберите, когда удобно')
    setErr('')
    if (step < 2) setStep(step + 1); else bk.submit()
  }
  const custom = bk.s.svc && !BSV.includes(bk.s.svc)
  const titles = ['Что хотите сделать?', 'Когда удобно?', 'Куда ответить?']
  return (
    <section id="book" className="px-5 py-28 md:px-12 md:py-36" style={{ background: '#eef3f5' }}>
      <div className="mx-auto grid max-w-[1320px] gap-14 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <h2 className={`${DISP} text-[clamp(36px,5.4vw,84px)] font-light leading-[1] tracking-[-0.05em]`}>Запишитесь<br /><span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(90deg,#2fb9a9,#4b8fe8,#cf6bbf)' }}>за минуту</span></h2>
          <p className="mt-6 max-w-[380px] text-[16px] leading-relaxed text-[#0d1620]/60">Три шага — и администратор свяжется с вами, чтобы подтвердить время.</p>
          <a href={'tel:' + tel(b.phone)} className={`${DISP} mt-4 inline-block text-[24px] font-light tracking-[-0.03em] hover:text-[#4b8fe8]`}>{b.phone}</a>
        </div>
        <div className="rounded-[32px] bg-white p-6 shadow-[0_40px_80px_-40px_rgba(13,22,32,.3)] md:p-10">
          {bk.s.sent ? (
            <div className="py-10 text-center" role="status">
              <CheckDraw className="mx-auto text-[#2fb9a9]" />
              <p className={`${DISP} mt-6 text-[30px] font-light tracking-[-0.04em]`}>Заявка отправлена</p>
              <p className="mx-auto mt-3 max-w-[380px] text-[#0d1620]/60">Ответим {via === 'Звонок' ? 'звонком' : 'в ' + via}. В готовом сайте заявка сразу придёт вам в Telegram.</p>
              <button type="button" onClick={() => { bk.reset(); setStep(0); setDay(''); setTime('') }} className="mt-8 text-[14px] text-[#0d1620]/55 underline underline-offset-4">Новая заявка</button>
            </div>
          ) : (
            <form onSubmit={next} noValidate>
              <div className="mb-8 h-1.5 overflow-hidden rounded-full bg-[#0d1620]/[.06]"><motion.div className="h-full rounded-full" style={{ background: SPEC }} animate={{ width: ((step + 1) / 3) * 100 + '%' }} transition={{ duration: 0.6, ease: [0.2, 0, 0, 1] }} /></div>
              <p className="text-[13px] text-[#0d1620]/45">Шаг {step + 1} из 3</p>
              <h3 ref={head} tabIndex={-1} className={`${DISP} mb-7 mt-1 text-[26px] font-light tracking-[-0.04em] outline-none`}>{titles[step]}</h3>
              <AnimatePresence mode="wait">
                <motion.div key={step} initial={{ opacity: 0, y: 14, filter: 'blur(4px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }} transition={{ duration: 0.3 }}>
                  {step === 0 && <div className="flex flex-wrap gap-2.5">{custom && <Pill on>{bk.s.svc}</Pill>}{BSV.map(s => <Pill key={s} on={bk.s.svc === s} onClick={() => { bk.upd('svc', s); setErr('') }}>{s}</Pill>)}</div>}
                  {step === 1 && (<>
                    <div className="flex flex-wrap gap-2.5">{DAYS.map(d => <Pill key={d} on={day === d} onClick={() => { setDay(d); setErr('') }}>{d}</Pill>)}</div>
                    <p className="mb-3 mt-7 text-[13px] text-[#0d1620]/45">Время</p>
                    <div className="flex flex-wrap gap-2.5">{TIMES.map(t => <Pill key={t} on={time === t} onClick={() => setTime(t)}>{t}</Pill>)}</div>
                  </>)}
                  {step === 2 && (<div className="space-y-4">
                    <input value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} autoComplete="name" placeholder="Имя" aria-label="Имя" className="h-14 w-full rounded-2xl border border-[#0d1620]/12 bg-[#f5f8f9] px-5 text-[16px] outline-none focus:border-[#4b8fe8]" />
                    <input value={bk.s.phone} onChange={e => bk.upd('phone', e.target.value)} onFocus={phoneFocus(bk)} type="tel" inputMode="tel" autoComplete="tel" placeholder="+375 __ ___-__-__" aria-label="Телефон" aria-invalid={bk.s.err}
                      className={`h-14 w-full rounded-2xl border bg-[#f5f8f9] px-5 text-[16px] outline-none focus:border-[#4b8fe8] ${bk.s.err ? 'border-[#e0566b]' : 'border-[#0d1620]/12'}`} />
                    {bk.s.err && <p className="text-[14px] text-[#e0566b]">Проверьте номер — 12 цифр с кодом +375.</p>}
                    <p className="pt-2 text-[13px] text-[#0d1620]/45">Как удобнее ответить</p>
                    <div className="flex flex-wrap gap-2">{['Звонок', 'Telegram', 'Viber', 'WhatsApp'].map(v => <Pill key={v} on={via === v} onClick={() => setVia(v)}>{v}</Pill>)}</div>
                  </div>)}
                </motion.div>
              </AnimatePresence>
              {err && <p className="mt-4 text-[14px] text-[#e0566b]" role="alert">{err}</p>}
              <div className="mt-9 flex items-center justify-between">
                {step > 0 ? <button type="button" onClick={() => setStep(step - 1)} className="text-[14px] text-[#0d1620]/55 hover:text-[#0d1620]">← Назад</button> : <span />}
                <button type="submit" disabled={bk.s.loading} className="inline-flex h-12 items-center gap-2 rounded-full bg-[#0d1620] px-7 text-[15px] font-medium text-white disabled:opacity-60">{step < 2 ? 'Дальше' : bk.s.loading ? 'Отправляем…' : 'Записаться'} <ArrowRight size={16} /></button>
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
      <div className="mx-auto grid max-w-[1320px] gap-10 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <h2 className={`${DISP} text-[clamp(32px,4.2vw,64px)] font-light tracking-[-0.05em]`}>Контакты</h2>
          <p className="mt-8 flex items-start gap-3 text-[18px]"><MapPin className="mt-1 shrink-0 text-[#2fb9a9]" size={20} />{b.addr}, {b.city}</p>
          <a href={'tel:' + tel(b.phone)} className="mt-4 flex items-center gap-3 text-[22px] hover:text-[#4b8fe8]"><Phone className="text-[#2fb9a9]" size={19} />{b.phone}</a>
          <p className="mt-2 text-[14px] text-[#0d1620]/50">Telegram, Viber, WhatsApp — по этому же номеру</p>
          <div className="mt-8 flex flex-wrap gap-2.5">
            <a href={b.tg} target="_blank" rel="noopener" className="inline-flex h-12 items-center gap-2 rounded-full border border-[#0d1620]/15 bg-white px-5 text-[14px] font-medium hover:border-[#0d1620]/50"><TG />Telegram</a>
            <a href={b.viber} target="_blank" rel="noopener" className="inline-flex h-12 items-center gap-2 rounded-full border border-[#0d1620]/15 bg-white px-5 text-[14px] font-medium hover:border-[#0d1620]/50"><MessageCircle size={17} />Viber</a>
            <a href={b.wa} target="_blank" rel="noopener" className="inline-flex h-12 items-center gap-2 rounded-full border border-[#0d1620]/15 bg-white px-5 text-[14px] font-medium hover:border-[#0d1620]/50"><WA />WhatsApp</a>
            <a href={b.ig} target="_blank" rel="noopener" className="inline-flex h-12 items-center gap-2 rounded-full border border-[#0d1620]/15 bg-white px-5 text-[14px] font-medium hover:border-[#0d1620]/50"><IG />Instagram</a>
          </div>
        </div>
        <div className="h-[380px] overflow-hidden rounded-[28px] md:h-[460px]"><MapFrame oid={b.oid} /></div>
      </div>
    </section>
  )
}

function App() {
  useSmooth()
  const lite = useLite()
  return (
    <MotionConfig reducedMotion="user">
      <div className={`overflow-x-clip ${SANS}`} style={{ background: BASE, color: INK, '--sel': '#7fdcd3', '--selc': INK }}>
        <Ribbon name={b.name} bg={INK} fg="#fff" />
        <header className="sticky top-0 z-40 bg-[#f5f8f9]/70 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-[1320px] items-center justify-between px-5 md:px-12">
            <a href="#film" className="flex items-center gap-2.5"><span className="h-6 w-6 [clip-path:polygon(50%_0,100%_90%,0_90%)]" style={{ background: 'conic-gradient(from 200deg,#7fdcd3,#8fb8ff,#f39bd8,#ffc48a,#7fdcd3)' }} /><span className={`${DISP} text-[16px] font-normal tracking-[-0.04em]`}>soda beauty</span></a>
            <nav className="hidden gap-8 text-[14px] text-[#0d1620]/60 md:flex">{[['#plan', 'К событию'], ['#about', 'О нас'], ['#services', 'Процедуры'], ['#contact', 'Контакты']].map(([h, t]) => <a key={h} href={h} className="hover:text-[#0d1620]">{t}</a>)}</nav>
            <a href="#book" className="hidden h-10 items-center rounded-full bg-[#0d1620] px-5 text-[14px] font-medium text-white sm:inline-flex">Записаться</a>
          </div>
          <div className="h-px opacity-60" style={{ background: SPEC }} />
        </header>
        <main>
          <Film lite={lite} />
          <Planner />
          <Bento />
          <Services />
          <Book />
          <Contact />
        </main>
        <footer className="px-5 py-8 text-[13px] text-[#0d1620]/50 md:px-12" style={{ background: BASE }}>
          <div className="mx-auto flex max-w-[1320px] flex-wrap justify-between gap-4 border-t border-[#0d1620]/10 pt-8"><span>© 2026 {b.name} · Концепт сайта — Артём</span><span>{b.addr}, {b.city}</span></div>
        </footer>
        <CallBar phone={b.phone} barCls="bg-white/90 backdrop-blur border-t border-[#0d1620]/10" callCls="rounded-full border border-[#0d1620]/20 text-[#0d1620]" bookCls="rounded-full bg-[#0d1620] text-white" />
        <div className="h-[72px] sm:hidden" style={{ background: BASE }} />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
