import React, { useRef, useState, useEffect, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, useSpring, useInView, AnimatePresence, MotionConfig } from 'framer-motion'
import { ArrowRight, ArrowLeft, Phone, MapPin } from 'lucide-react'
import '../lib/base.css'
import { useSmooth, Ribbon, LineReveal, Reveal, ScrollWords, useBooking, phoneFocus, CheckDraw, MapFrame, CallBar, tel, useLite } from '../lib/kit'

const SunScene = lazy(() => import('./sunnyside3d'))

const b = { name: 'Sunny Side', addr: 'Тучинский пер., 2', city: 'Минск', phone: '+375 29 888-16-45', rating: '4,8', rev: 52, oid: '1147696908' }
const INK = '#2a1a10', CREAM = '#fbf3ea'
const F = "font-['Inter_Tight',sans-serif]"
const WARM = 'linear-gradient(90deg,#ff8f70,#ffb347 50%,#ff7a2a)'

/* ---------------- pinned sunrise film ---------------- */
const CAP = [
  { k: 'Рассвет', t: 'Мягкий старт.', d: 'Первый сеанс — короткий. Коже нужно время, чтобы привыкнуть к солнцу.', r: [0.16, 0.37] },
  { k: 'Полдень', t: 'Ровный тон.', d: 'Загар набирается постепенно — сеанс за сеансом, без спешки.', r: [0.39, 0.59] },
  { k: 'Золотой час', t: 'Тёплое сияние.', d: 'Тот самый оттенок — без отпуска и пляжа.', r: [0.61, 0.81] },
  { k: 'Sunny Side', t: 'Ваша солнечная сторона.', d: 'Солярий и салон красоты на Тучинском, 2.', r: [0.83, 1.2] },
]
function Caption({ p, c }) {
  const k = [c.r[0], c.r[0] + 0.04, c.r[1] - 0.04, c.r[1]]
  const o = useTransform(p, k, [0, 1, 1, 0])
  const y = useTransform(p, k, [28, 0, 0, -20])
  const blur = useTransform(p, k, ['blur(8px)', 'blur(0px)', 'blur(0px)', 'blur(6px)'])
  return (
    <motion.div style={{ opacity: o, y, filter: blur }} className="pointer-events-none absolute inset-x-5 bottom-[96px] text-center md:bottom-[9vh]">
      <p className="text-[13px] font-semibold uppercase tracking-[.18em] text-[#b0603a]">{c.k}</p>
      <h2 className="mx-auto mt-3 max-w-[900px] text-[clamp(32px,4.6vw,68px)] font-semibold leading-[1.02] tracking-[-0.035em]">{c.t}</h2>
      <p className="mx-auto mt-3 max-w-[460px] text-[16px] leading-relaxed text-[#2a1a10]/60 md:text-[18px]">{c.d}</p>
    </motion.div>
  )
}
function DayMark({ p, c, i }) {
  const o = useTransform(p, [c.r[0] - 0.01, c.r[0] + 0.03, c.r[1] - 0.03, c.r[1]], [0.35, 1, 1, 0.35])
  return <motion.span style={{ opacity: o }} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full" style={{ background: ['#ff9f8a', '#f2c94c', '#ff8a2a', INK][i] }} />{c.k}</motion.span>
}
function LiteSun({ p }) {
  const y = useTransform(p, [0, 0.32, 0.7, 1], ['60vh', '0vh', '0vh', '4vh'])
  const bg = useTransform(p, [0, 0.3, 0.5, 0.8, 1], ['#ff9f8a', '#ffb48f', '#fff1c2', '#ff9a3d', '#ff7f2a'])
  return (
    <div className="absolute inset-0 grid place-items-center">
      <motion.div style={{ y, background: bg }} className="h-[34vmin] w-[34vmin] rounded-full shadow-[0_0_120px_40px_rgba(255,170,90,.35),inset_-20px_-30px_60px_rgba(150,60,10,.25),inset_20px_20px_40px_rgba(255,255,255,.6)]" />
    </div>
  )
}
function Film({ lite }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const p = useSpring(scrollYProgress, { stiffness: 80, damping: 24, mass: 0.4 })
  const near = useInView(ref, { margin: '300px 0px' })
  const [mounted, setMounted] = useState(false)
  useEffect(() => { if (near) setMounted(true) }, [near])
  const bg = useTransform(p, [0, 0.3, 0.5, 0.62, 0.8, 1], ['#fbf3ea', '#fde6dc', '#fff8e8', '#fff5df', '#fbdcb8', '#f8cfa4'])
  const heroO = useTransform(p, [0, 0.1], [1, 0])
  const heroY = useTransform(p, [0, 0.1], [0, -60])
  const heroS = useTransform(p, [0, 0.1], [1, 0.94])
  const heroPE = useTransform(p, v => (v < 0.05 ? 'auto' : 'none'))
  const markO = useTransform(p, [0.1, 0.16], [0, 1])
  return (
    <motion.section ref={ref} id="film" className="relative h-[520vh]" style={{ background: bg }}>
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="absolute inset-0">
          {lite ? <LiteSun p={p} /> : mounted && <Suspense fallback={null}><SunScene progress={p} active={near} /></Suspense>}
        </div>
        <motion.div style={{ opacity: heroO, y: heroY, scale: heroS, pointerEvents: heroPE }} className="absolute inset-x-0 top-[9vh] px-5 text-center md:top-[11vh]">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="text-[14px] font-semibold text-[#b0603a] md:text-[16px]">Солярий · салон красоты · Минск</motion.p>
          <h1 className="mx-auto mt-4 max-w-[1100px] text-[clamp(46px,8.6vw,138px)] font-semibold leading-[.95] tracking-[-0.05em]">
            <LineReveal delay={0.1}>Солнце.</LineReveal>
            <LineReveal delay={0.24}><span className="bg-clip-text pr-[0.04em] text-transparent" style={{ backgroundImage: WARM }}>По расписанию.</span></LineReveal>
          </h1>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.8 }} className="mx-auto mt-5 max-w-[440px] text-[17px] leading-relaxed text-[#2a1a10]/60 md:text-[20px]">Ровный загар круглый год — на Тучинском переулке, 2.</motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 0.8 }} className="mt-7 flex items-center justify-center gap-5 text-[16px] md:text-[17px]">
            <a href="#book" className="inline-flex h-11 items-center rounded-full bg-[#2a1a10] px-6 font-medium text-[#fff6ec] transition-colors hover:bg-[#4a2c18]">Записаться</a>
            <a href="#when" className="inline-flex items-center gap-1 font-medium text-[#b0603a] hover:underline">Когда лучше прийти <ArrowRight size={16} /></a>
          </motion.div>
        </motion.div>
        <motion.div style={{ opacity: markO }} className="pointer-events-none absolute inset-x-0 top-6 hidden justify-center gap-8 text-[12.5px] font-medium text-[#2a1a10]/70 md:flex">
          {CAP.map((c, i) => <DayMark key={c.k} p={p} c={c} i={i} />)}
        </motion.div>
        {CAP.map(c => <Caption key={c.k} p={p} c={c} />)}
      </div>
    </motion.section>
  )
}

/* ---------------- statement ---------------- */
function Statement() {
  return (
    <section className="bg-[#f8cfa4] px-5 pb-28 pt-10 md:px-12 md:pb-40">
      <ScrollWords text="Мы не обещаем загар за один день. Мы помогаем набрать его красиво: короткими сеансами, с перерывами и в удобное для вас время." dim={0.18}
        className="mx-auto max-w-[1060px] text-center text-[clamp(26px,3.6vw,52px)] font-semibold leading-[1.12] tracking-[-0.035em]" />
    </section>
  )
}

/* ---------------- highlights carousel ---------------- */
const HL = [
  { k: 'Солярий', t: 'Ровный загар круглый год.', bg: 'radial-gradient(90% 70% at 50% 110%, #ff8a3d, #ffc58a 45%, #fde9d8 80%)', sun: '#ff9a3d', y: 62 },
  { k: 'Салон красоты', t: 'Уход — в том же месте.', bg: 'radial-gradient(90% 70% at 20% 0%, #ffd9c9, #fbeee6 60%)', sun: '#ffb48f', y: 26 },
  { k: 'Постепенно', t: 'Начните с короткого сеанса — и прибавляйте.', bg: 'linear-gradient(180deg,#fff7e3,#ffe6b0)', sun: '#f2c94c', y: 40 },
  { k: 'Ваше окно', t: 'Утро, день или вечер — подберём время.', bg: 'linear-gradient(180deg,#fde6dc,#ffcfae 60%,#ff9f6a)', sun: '#ff7f2a', y: 70 },
  { k: 'Рядом', t: 'Тучинский переулок, 2.', bg: 'radial-gradient(120% 80% at 80% 100%, #ffd8a8, #fff3e2 70%)', sun: '#ffb347', y: 48 },
]
function HLCard({ h, i }) {
  return (
    <div className="relative flex h-[440px] w-[80vw] shrink-0 snap-center flex-col overflow-hidden rounded-[30px] p-7 sm:w-[360px] md:h-[520px] md:w-[400px] md:p-9" style={{ background: h.bg }}>
      <p className="text-[14px] font-semibold text-[#b0603a]">{h.k}</p>
      <p className="mt-2 text-[clamp(24px,2.4vw,30px)] font-semibold leading-[1.1] tracking-[-0.03em]">{h.t}</p>
      <motion.div className="absolute left-1/2 h-36 w-36 -translate-x-1/2 rounded-full" style={{ top: h.y + '%', background: `radial-gradient(circle at 35% 30%, #fff8ec, ${h.sun} 55%, #c2541a)`, boxShadow: `0 0 80px 20px ${h.sun}55` }}
        initial={{ y: 60, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: i * 0.08 }} />
      <div className="absolute inset-x-0 bottom-0 h-[22%] bg-gradient-to-t from-white/50 to-transparent backdrop-blur-[2px]" />
    </div>
  )
}
function Highlights() {
  const row = useRef(null)
  const [idx, setIdx] = useState(0)
  const go = i => {
    const el = row.current; if (!el) return
    const c = el.children[Math.max(0, Math.min(HL.length - 1, i))]
    el.scrollTo({ left: c.offsetLeft - (el.clientWidth - c.clientWidth) / 2, behavior: 'smooth' })
  }
  const onScroll = () => {
    const el = row.current; if (!el) return
    const mid = el.scrollLeft + el.clientWidth / 2
    let best = 0, bd = 1e9
    ;[...el.children].forEach((c, i) => { const d = Math.abs(c.offsetLeft + c.clientWidth / 2 - mid); if (d < bd) { bd = d; best = i } })
    setIdx(best)
  }
  return (
    <section id="highlights" className="bg-[#fbf3ea] py-24 md:py-36">
      <h2 className="mx-auto max-w-[1100px] px-5 text-center text-[clamp(38px,5.6vw,80px)] font-semibold leading-[1] tracking-[-0.045em]"><Reveal as="span" className="block">Коротко о главном.</Reveal></h2>
      <div ref={row} onScroll={onScroll} data-lenis-prevent-wheel className="mt-14 flex snap-x snap-mandatory gap-5 overflow-x-auto px-[10vw] pb-4 [scrollbar-width:none] sm:px-[calc(50vw-180px)] md:px-[calc(50vw-200px)] [&::-webkit-scrollbar]:hidden">
        {HL.map((h, i) => <HLCard key={h.k} h={h} i={i} />)}
      </div>
      <div className="mt-8 flex items-center justify-center gap-4">
        <button type="button" onClick={() => go(idx - 1)} aria-label="Назад" className="grid h-11 w-11 place-items-center rounded-full bg-[#2a1a10]/[.07] hover:bg-[#2a1a10]/15"><ArrowLeft size={18} /></button>
        <div className="flex h-11 items-center gap-2.5 rounded-full bg-[#2a1a10]/[.07] px-5">
          {HL.map((h, i) => <button key={h.k} type="button" onClick={() => go(i)} aria-label={h.k} className={`h-2 rounded-full transition-all duration-500 ${idx === i ? 'w-8 bg-[#2a1a10]' : 'w-2 bg-[#2a1a10]/30'}`} />)}
        </div>
        <button type="button" onClick={() => go(idx + 1)} aria-label="Вперёд" className="grid h-11 w-11 place-items-center rounded-full bg-[#2a1a10]/[.07] hover:bg-[#2a1a10]/15"><ArrowRight size={18} /></button>
      </div>
    </section>
  )
}

/* ---------------- value interaction: when to come ---------------- */
const WD = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const WDF = ['понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота', 'воскресенье']
const TOD = [
  { k: 'Утро', d: 'До работы — и весь день с тёплым тоном.', c: '#ff9f8a', x: 18, y: 70, sky: 'linear-gradient(180deg,#fde6dc,#fff3ea)' },
  { k: 'День', d: 'В обеденный перерыв или между делами.', c: '#f2b632', x: 50, y: 18, sky: 'linear-gradient(180deg,#fff3c9,#fffaf0)' },
  { k: 'Вечер', d: 'После работы — спокойно и без спешки.', c: '#ff7f2a', x: 82, y: 70, sky: 'linear-gradient(180deg,#ffc996,#fde3c8)' },
]
const SVCW = ['Солярий', 'Салон красоты']
function Chip({ on, children, ...rest }) {
  return <button type="button" aria-pressed={on} className={`h-11 min-w-[44px] rounded-full px-4 text-[15px] font-medium transition-all ${on ? 'bg-[#2a1a10] text-[#fff6ec]' : 'bg-white text-[#2a1a10] shadow-[inset_0_0_0_1px_rgba(42,26,16,.12)] hover:shadow-[inset_0_0_0_1px_rgba(42,26,16,.4)]'}`} {...rest}>{children}</button>
}
function SunArc({ t }) {
  const T = TOD[t]
  return (
    <div className="relative h-[120px] w-full overflow-hidden rounded-[22px]" style={{ background: T.sky, transition: 'background .8s' }}>
      <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="absolute inset-0 h-full w-full"><path d="M6 46 Q50 -14 94 46" fill="none" stroke="#2a1a10" strokeOpacity=".15" strokeWidth=".5" strokeDasharray="1.5 1.5" vectorEffect="non-scaling-stroke" /></svg>
      <motion.span className="absolute h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full" animate={{ left: T.x + '%', top: T.y + '%', background: T.c, boxShadow: `0 0 40px 12px ${T.c}66` }} transition={{ type: 'spring', stiffness: 70, damping: 14 }} />
      <div className="absolute inset-x-0 bottom-0 h-px bg-[#2a1a10]/15" />
    </div>
  )
}
function When() {
  const [days, setDays] = useState([1, 3])
  const [t, setT] = useState(2)
  const [svc, setSvc] = useState('Солярий')
  const tog = i => setDays(d => d.includes(i) ? d.filter(x => x !== i) : [...d, i].sort())
  const sorted = [...days].sort()
  const close = svc === 'Солярий' && sorted.some((d, i) => i > 0 && d - sorted[i - 1] === 1) || (svc === 'Солярий' && sorted.includes(0) && sorted.includes(6))
  const T = TOD[t]
  const label = sorted.map(d => WD[d]).join(', ')
  return (
    <section id="when" className="bg-white px-5 py-24 md:px-12 md:py-36">
      <div className="mx-auto max-w-[1180px]">
        <div className="text-center">
          <p className="text-[15px] font-semibold text-[#b0603a]">Когда лучше прийти</p>
          <h2 className="mx-auto mt-3 max-w-[900px] text-[clamp(38px,5.6vw,80px)] font-semibold leading-[1] tracking-[-0.045em]">Соберите своё <span className="bg-clip-text text-transparent" style={{ backgroundImage: WARM }}>солнечное окно.</span></h2>
          <p className="mx-auto mt-5 max-w-[520px] text-[17px] leading-relaxed text-[#2a1a10]/60">Отметьте удобные дни и время — получите карточку для записи. Точное время подтвердит администратор.</p>
        </div>
        <div className="mt-14 grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
          <div className="rounded-[30px] bg-[#fbf3ea] p-6 md:p-9">
            <p className="text-[13px] font-semibold uppercase tracking-[.14em] text-[#2a1a10]/45">Что планируете</p>
            <div className="mt-3 flex flex-wrap gap-2">{SVCW.map(s => <Chip key={s} on={svc === s} onClick={() => setSvc(s)}>{s}</Chip>)}</div>
            <p className="mt-8 text-[13px] font-semibold uppercase tracking-[.14em] text-[#2a1a10]/45">Дни недели</p>
            <div className="mt-3 grid grid-cols-7 gap-1.5 sm:flex sm:flex-wrap sm:gap-2">{WD.map((d, i) => <Chip key={d} on={days.includes(i)} onClick={() => tog(i)} aria-label={WDF[i]}>{d}</Chip>)}</div>
            <p className="mt-8 text-[13px] font-semibold uppercase tracking-[.14em] text-[#2a1a10]/45">Время суток</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {TOD.map((o, i) => (
                <button key={o.k} type="button" aria-pressed={t === i} onClick={() => setT(i)} className={`rounded-[20px] p-4 text-left transition-all ${t === i ? 'bg-white shadow-[0_14px_30px_-18px_rgba(120,50,10,.45),inset_0_0_0_2px_#2a1a10]' : 'bg-white/60 shadow-[inset_0_0_0_1px_rgba(42,26,16,.1)] hover:bg-white'}`}>
                  <span className="block h-3 w-3 rounded-full" style={{ background: o.c }} />
                  <span className="mt-3 block text-[16px] font-semibold">{o.k}</span>
                </button>
              ))}
            </div>
            <p className="mt-4 text-[15px] text-[#2a1a10]/60">{T.d}</p>
          </div>

          {/* timetable card */}
          <motion.div layout className="relative flex flex-col overflow-hidden rounded-[30px] bg-[#2a1a10] p-6 text-[#fff6ec] md:p-9">
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-50 blur-[70px] transition-colors duration-700" style={{ background: T.c }} />
            <div className="relative flex items-center justify-between">
              <p className="text-[13px] font-semibold uppercase tracking-[.14em] text-[#fff6ec]/55">Ваше окно · {svc}</p>
              <span className="text-[13px] text-[#fff6ec]/55">{b.name}</span>
            </div>
            <div className="relative mt-5"><SunArc t={t} /></div>
            <div className="relative mt-6 grid grid-cols-7 gap-1.5">
              {WD.map((d, i) => {
                const on = days.includes(i)
                return (
                  <div key={d} className={`flex flex-col items-center gap-2 rounded-2xl py-3 transition-colors ${on ? 'bg-white/10' : ''}`}>
                    <span className={`text-[12.5px] ${on ? 'text-[#fff6ec]' : 'text-[#fff6ec]/35'}`}>{d}</span>
                    <motion.span className="h-5 w-5 rounded-full" animate={{ scale: on ? 1 : 0.35, opacity: on ? 1 : 0.25, background: on ? T.c : '#fff6ec' }} transition={{ type: 'spring', stiffness: 260, damping: 18 }} style={{ boxShadow: on ? `0 0 18px ${T.c}` : 'none' }} />
                  </div>
                )
              })}
            </div>
            <AnimatePresence mode="wait">
              <motion.p key={label + t} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3 }} className="relative mt-7 text-[clamp(24px,2.6vw,34px)] font-semibold leading-[1.1] tracking-[-0.03em]">
                {sorted.length ? <>{label} · {T.k.toLowerCase()}</> : 'Выберите хотя бы один день'}
              </motion.p>
            </AnimatePresence>
            <p className="relative mt-3 min-h-[48px] text-[15px] leading-relaxed text-[#fff6ec]/60">
              {!sorted.length ? 'Можно отметить несколько — мы предложим ближайшее свободное время.'
                : close ? 'Дни идут подряд. Между сеансами в солярии коже нужен отдых — администратор подскажет, как лучше чередовать.'
                  : svc === 'Солярий' ? 'Хороший ритм: между сеансами есть паузы для отдыха кожи.' : 'Подберём мастера и время под ваши дни.'}
            </p>
            <div className="relative mt-auto pt-6">
              <a href="#book" aria-disabled={!sorted.length} data-svc={sorted.length ? `${svc} · ${label} · ${T.k.toLowerCase()}` : svc}
                className={`inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#fff6ec] text-[16px] font-semibold text-[#2a1a10] transition-transform hover:-translate-y-0.5 ${sorted.length ? '' : 'pointer-events-none opacity-40'}`}>
                Записаться в это окно <ArrowRight size={17} />
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- bento ---------------- */
function Tile({ className = '', children, style }) {
  return <Reveal className={'relative flex flex-col overflow-hidden rounded-[30px] p-7 md:p-9 ' + className} style={style}>{children}</Reveal>
}
function Bento() {
  return (
    <section className="bg-[#fbf3ea] px-5 py-24 md:px-12 md:py-36">
      <div className="mx-auto max-w-[1180px]">
        <h2 className="text-center text-[clamp(38px,5.6vw,80px)] font-semibold leading-[1] tracking-[-0.045em]"><Reveal as="span" className="block">Тепло. Спокойно.</Reveal><Reveal as="span" delay={0.08} className="block text-[#2a1a10]/35">По-соседски.</Reveal></h2>
        <div className="mt-14 grid auto-rows-[minmax(220px,auto)] gap-4 md:grid-cols-3">
          <Tile className="bg-white md:row-span-2">
            <p className="text-[14px] font-semibold text-[#b0603a]">Яндекс Карты</p>
            <p className="mt-auto bg-clip-text text-[clamp(110px,13vw,190px)] font-semibold leading-[.85] tracking-[-0.06em] text-transparent" style={{ backgroundImage: 'linear-gradient(160deg,#ffb347,#ff7a2a 55%,#c2541a)' }}>{b.rating}</p>
            <p className="mt-5 text-[17px] text-[#2a1a10]/65">{b.rev} оценки гостей</p>
          </Tile>
          <Tile className="md:col-span-2" style={{ background: 'linear-gradient(120deg,#fde6dc,#ffd9b0)' }}>
            <p className="text-[14px] font-semibold text-[#b0603a]">Два в одном</p>
            <p className="mt-auto max-w-[520px] text-[clamp(26px,3vw,40px)] font-semibold leading-[1.08] tracking-[-0.035em]">Солярий и салон красоты — под одной крышей.</p>
          </Tile>
          <Tile className="bg-[#2a1a10] text-[#fff6ec]">
            <MapPin size={22} className="text-[#ffb347]" />
            <p className="mt-auto text-[28px] font-semibold tracking-[-0.03em]">Тучинский пер., 2</p>
            <p className="mt-1 text-[15px] text-[#fff6ec]/55">Минск</p>
          </Tile>
          <Tile className="bg-white">
            <Phone size={22} className="text-[#b0603a]" />
            <a href={'tel:' + tel(b.phone)} className="mt-auto text-[clamp(22px,2.2vw,28px)] font-semibold tracking-[-0.02em] hover:text-[#b0603a]">{b.phone}</a>
            <p className="mt-1 text-[15px] text-[#2a1a10]/55">Звоните — подберём время</p>
          </Tile>
        </div>
      </div>
    </section>
  )
}

/* ---------------- spec table: preparation ---------------- */
const SPEC = [
  ['Кожа', ['Чистая и сухая', 'Скраб и пилинг — не в день сеанса']],
  ['Косметика', ['Смойте макияж', 'Без парфюма и дезодоранта со спиртом']],
  ['Защита', ['Очки для глаз — обязательно', 'Бальзам для губ', 'Волосы — под шапочку']],
  ['Первый раз', ['Начните с короткого сеанса', 'Время подскажет администратор']],
  ['После сеанса', ['Увлажняющий крем', 'Душ — не сразу']],
  ['Между сеансами', ['Не каждый день', 'Коже нужен отдых']],
  ['Важно', ['При сомнениях по здоровью — сначала консультация врача']],
]
function Prep() {
  return (
    <section id="prep" className="bg-white px-5 py-24 md:px-12 md:py-36">
      <div className="mx-auto max-w-[1180px]">
        <h2 className="text-[clamp(38px,5.6vw,80px)] font-semibold leading-[1] tracking-[-0.045em]"><Reveal as="span" className="block">Как подготовиться</Reveal><Reveal as="span" delay={0.06} className="block">к сеансу.</Reveal></h2>
        <div className="mt-14 border-t border-[#2a1a10]/15">
          {SPEC.map(([k, v], i) => (
            <Reveal key={k} delay={i * 0.03} className="grid gap-3 border-b border-[#2a1a10]/10 py-7 md:grid-cols-[280px_1fr] md:py-9">
              <p className="text-[20px] font-semibold tracking-[-0.02em] md:text-[24px]">{k}</p>
              <ul className="space-y-1.5 text-[17px] text-[#2a1a10]/70 md:text-[19px]">{v.map(x => <li key={x}>{x}</li>)}</ul>
            </Reveal>
          ))}
        </div>
        <p className="mt-6 text-[13.5px] text-[#2a1a10]/45">Общие рекомендации. Подробности — у администратора по телефону.</p>
      </div>
    </section>
  )
}

/* ---------------- booking ---------------- */
const BSV = ['Солярий', 'Салон красоты', 'Хочу консультацию']
const DAYS = ['Сегодня', 'Завтра', 'На этой неделе', 'Подберите сами']
function Pill({ on, children, ...rest }) {
  return <button type="button" aria-pressed={on} className={`h-11 rounded-full px-5 text-[15px] font-medium transition-colors ${on ? 'bg-[#2a1a10] text-[#fff6ec]' : 'bg-white shadow-[inset_0_0_0_1px_rgba(42,26,16,.14)] hover:shadow-[inset_0_0_0_1px_rgba(42,26,16,.45)]'}`} {...rest}>{children}</button>
}
function Book() {
  const bk = useBooking()
  const [step, setStep] = useState(0)
  const [day, setDay] = useState(''), [time, setTime] = useState('')
  const [err, setErr] = useState('')
  const head = useRef(null)
  const fromWindow = bk.s.svc.includes('·')
  useEffect(() => { if (step) head.current?.focus() }, [step])
  useEffect(() => { if (fromWindow && step === 0) { setStep(2) } }, [bk.s.svc])
  const next = e => {
    e.preventDefault()
    if (step === 0 && !bk.s.svc) return setErr('Выберите услугу')
    if (step === 1 && !day) return setErr('Выберите, когда удобно')
    setErr('')
    if (step < 2) setStep(step + 1); else bk.submit()
  }
  const titles = ['Что планируете?', 'Когда удобно?', 'Как с вами связаться?']
  return (
    <section id="book" className="px-5 py-24 md:px-12 md:py-36" style={{ background: 'linear-gradient(180deg,#fbf3ea,#f8d9b8)' }}>
      <div className="mx-auto max-w-[720px] text-center">
        <h2 className="text-[clamp(40px,6vw,88px)] font-semibold leading-[.98] tracking-[-0.05em]"><Reveal as="span" className="block">Запишитесь.</Reveal><Reveal as="span" delay={0.06} className="block bg-clip-text text-transparent" style={{ backgroundImage: WARM }}>Солнце подождёт.</Reveal></h2>
        <p className="mx-auto mt-5 max-w-[420px] text-[17px] text-[#2a1a10]/60">Оставьте заявку — администратор перезвонит и подтвердит время. Или сразу позвоните: <a href={'tel:' + tel(b.phone)} className="font-semibold text-[#2a1a10] underline-offset-4 hover:underline">{b.phone}</a></p>
      </div>
      <div className="mx-auto mt-12 max-w-[720px] rounded-[34px] bg-white/85 p-6 shadow-[0_40px_90px_-40px_rgba(120,50,10,.35)] backdrop-blur md:p-10">
        {bk.s.sent ? (
          <div className="py-10 text-center" role="status">
            <CheckDraw className="mx-auto text-[#ff7a2a]" />
            <p className="mt-6 text-[30px] font-semibold tracking-[-0.03em]">Заявка отправлена</p>
            <p className="mx-auto mt-3 max-w-[400px] text-[#2a1a10]/60">Перезвоним, чтобы подтвердить время. В готовом сайте заявка сразу придёт вам в Telegram.</p>
            <button type="button" onClick={() => { bk.reset(); setStep(0); setDay(''); setTime('') }} className="mt-8 text-[14px] text-[#2a1a10]/55 underline underline-offset-4">Новая заявка</button>
          </div>
        ) : (
          <form onSubmit={next} noValidate>
            <div className="mb-8 grid grid-cols-3 gap-2">{[0, 1, 2].map(i => <div key={i} className="h-1.5 overflow-hidden rounded-full bg-[#2a1a10]/[.08]"><motion.div className="h-full rounded-full" style={{ background: WARM }} animate={{ width: step >= i ? '100%' : '0%' }} transition={{ duration: 0.6, ease: [0.2, 0, 0, 1] }} /></div>)}</div>
            <p className="text-[13px] text-[#2a1a10]/45">Шаг {step + 1} из 3</p>
            <h3 ref={head} tabIndex={-1} className="mb-7 mt-1 text-[26px] font-semibold tracking-[-0.03em] outline-none">{titles[step]}</h3>
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                {step === 0 && <div className="flex flex-wrap gap-2.5">{BSV.map(s => <Pill key={s} on={bk.s.svc === s} onClick={() => { bk.upd('svc', s); setErr('') }}>{s}</Pill>)}</div>}
                {step === 1 && (<>
                  <div className="flex flex-wrap gap-2.5">{DAYS.map(d => <Pill key={d} on={day === d} onClick={() => { setDay(d); setErr('') }}>{d}</Pill>)}</div>
                  <p className="mb-3 mt-7 text-[13px] text-[#2a1a10]/45">Время суток</p>
                  <div className="flex flex-wrap gap-2.5">{TOD.map(t => <Pill key={t.k} on={time === t.k} onClick={() => setTime(t.k)}>{t.k}</Pill>)}</div>
                </>)}
                {step === 2 && (<div className="space-y-4">
                  {bk.s.svc && <p className="rounded-2xl bg-[#fbf3ea] px-5 py-3.5 text-[15px]"><span className="text-[#2a1a10]/50">Выбрано: </span>{bk.s.svc}{day && !fromWindow ? ` · ${day.toLowerCase()}` : ''}{time && !fromWindow ? ` · ${time.toLowerCase()}` : ''}</p>}
                  <input value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} autoComplete="name" placeholder="Имя" aria-label="Имя" className="h-14 w-full rounded-2xl bg-[#fbf3ea] px-5 text-[16px] outline-none ring-[#ff9a3d] focus:ring-2" />
                  <input value={bk.s.phone} onChange={e => bk.upd('phone', e.target.value)} onFocus={phoneFocus(bk)} type="tel" inputMode="tel" autoComplete="tel" placeholder="+375 __ ___-__-__" aria-label="Телефон" aria-invalid={bk.s.err}
                    className={`h-14 w-full rounded-2xl bg-[#fbf3ea] px-5 text-[16px] outline-none ring-[#ff9a3d] focus:ring-2 ${bk.s.err ? 'ring-2 ring-[#d9433a]' : ''}`} />
                  {bk.s.err && <p className="text-[14px] text-[#d9433a]">Проверьте номер — 12 цифр с кодом +375.</p>}
                </div>)}
              </motion.div>
            </AnimatePresence>
            {err && <p className="mt-4 text-[14px] text-[#d9433a]" role="alert">{err}</p>}
            <div className="mt-9 flex items-center justify-between">
              {step > 0 ? <button type="button" onClick={() => setStep(fromWindow && step === 2 ? 0 : step - 1)} className="text-[15px] text-[#2a1a10]/55 hover:text-[#2a1a10]">← Назад</button> : <span />}
              <button type="submit" disabled={bk.s.loading} className="inline-flex h-12 items-center gap-2 rounded-full bg-[#2a1a10] px-7 text-[15px] font-semibold text-[#fff6ec] disabled:opacity-60">{step < 2 ? 'Дальше' : bk.s.loading ? 'Отправляем…' : 'Записаться'} <ArrowRight size={16} /></button>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}

function Contact() {
  return (
    <section id="contact" className="bg-[#f8d9b8] px-5 pb-24 md:px-12">
      <div className="mx-auto grid max-w-[1180px] gap-6 lg:grid-cols-[.8fr_1.2fr]">
        <div className="flex flex-col rounded-[30px] bg-white p-7 md:p-10">
          <h2 className="text-[clamp(32px,4vw,56px)] font-semibold tracking-[-0.04em]">Где нас найти</h2>
          <p className="mt-8 flex items-start gap-3 text-[19px]"><MapPin className="mt-1 shrink-0 text-[#ff7a2a]" size={20} />{b.addr}, {b.city}</p>
          <a href={'tel:' + tel(b.phone)} className="mt-4 flex items-center gap-3 text-[22px] font-semibold hover:text-[#b0603a]"><Phone className="text-[#ff7a2a]" size={19} />{b.phone}</a>
          <p className="mt-2 text-[14.5px] text-[#2a1a10]/50">Запись и вопросы — по телефону</p>
          <a href={'tel:' + tel(b.phone)} className="mt-auto inline-flex h-12 w-fit items-center gap-2 rounded-full bg-[#2a1a10] px-6 pt-0 text-[15px] font-semibold text-[#fff6ec] max-lg:mt-8">Позвонить <Phone size={16} /></a>
        </div>
        <div className="h-[380px] overflow-hidden rounded-[30px] md:h-[480px]"><MapFrame oid={b.oid} /></div>
      </div>
    </section>
  )
}

function App() {
  useSmooth()
  const lite = useLite()
  return (
    <MotionConfig reducedMotion="user">
      <div className={`overflow-x-clip ${F}`} style={{ background: CREAM, color: INK, '--sel': '#ffb347', '--selc': INK }}>
        <Ribbon name={b.name} bg={INK} fg="#fff6ec" />
        <header className="sticky top-0 z-40 border-b border-[#2a1a10]/[.06] bg-[#fbf3ea]/75 backdrop-blur-xl">
          <div className="mx-auto flex h-14 max-w-[1180px] items-center justify-between px-5 md:px-8">
            <a href="#film" className="flex items-center gap-2"><span className="h-5 w-5 rounded-full" style={{ background: 'radial-gradient(circle at 35% 30%,#fff6ec,#ffb347 50%,#ff7a2a)' }} /><span className="text-[17px] font-semibold tracking-[-0.03em]">Sunny Side</span></a>
            <nav className="hidden gap-8 text-[13.5px] text-[#2a1a10]/70 md:flex">{[['#highlights', 'Главное'], ['#when', 'Когда прийти'], ['#prep', 'Подготовка'], ['#contact', 'Контакты']].map(([h, t]) => <a key={h} href={h} className="hover:text-[#2a1a10]">{t}</a>)}</nav>
            <div className="flex items-center gap-4">
              <a href={'tel:' + tel(b.phone)} className="hidden text-[13.5px] font-medium text-[#2a1a10]/70 hover:text-[#2a1a10] lg:inline">{b.phone}</a>
              <a href="#book" className="hidden h-8 items-center rounded-full bg-[#2a1a10] px-4 text-[13px] font-medium text-[#fff6ec] sm:inline-flex">Записаться</a>
            </div>
          </div>
        </header>
        <main>
          <Film lite={lite} />
          <Statement />
          <Highlights />
          <When />
          <Bento />
          <Prep />
          <Book />
          <Contact />
        </main>
        <footer className="bg-[#f8d9b8] px-5 pb-8 text-[13px] text-[#2a1a10]/55 md:px-12">
          <div className="mx-auto flex max-w-[1180px] flex-wrap justify-between gap-4 border-t border-[#2a1a10]/10 pt-8"><span>© 2026 {b.name} · Концепт сайта — Артём</span><span>{b.addr}, {b.city}</span></div>
        </footer>
        <CallBar phone={b.phone} barCls="bg-[#fbf3ea]/90 backdrop-blur border-t border-[#2a1a10]/10" callCls="rounded-full bg-white text-[#2a1a10] shadow-[inset_0_0_0_1px_rgba(42,26,16,.18)]" bookCls="rounded-full bg-[#2a1a10] text-[#fff6ec]" />
        <div className="h-[72px] bg-[#f8d9b8] sm:hidden" />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
