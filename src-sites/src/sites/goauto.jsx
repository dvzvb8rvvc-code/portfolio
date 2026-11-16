import React, { useEffect, useRef, useState, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, useSpring, useVelocity, useInView, AnimatePresence, MotionConfig } from 'framer-motion'
import { ArrowUpRight, Phone, MapPin, Star, ArrowRight, ArrowLeft } from 'lucide-react'
import '../lib/base.css'
import { useSmooth, Ribbon, LineReveal, Reveal, Counter, useBooking, phoneFocus, CheckDraw, MapFrame, CallBar, tel, useLite, IG, TG, WA } from '../lib/kit'

const Film3D = lazy(() => import('./goauto3d'))

const b = {
  name: 'Go!', full: 'Go! — автомойка и детейлинг',
  addr: 'ул. Крупской, 8, корп. 1', city: 'Минск',
  phone: '+375 29 666-51-00',
  ig: 'https://www.instagram.com/go.autominsk', tg: 'https://t.me/+375296665100',
  wa: 'https://wa.me/375296665100', viber: 'https://viber.click/375296665100',
  rating: '5,0', rev: 1080, oid: '176387456182',
}
const INK = '#0b0c0e', PAPER = '#f1f0ea', LIME = '#c8ff1a'
const DISP = "font-['Unbounded',sans-serif]"

const STATIONS = [
  { n: '01', t: 'Предмойка', d: 'Снимаем песок и дорожную грязь до первого касания кузова.' },
  { n: '02', t: 'Пена', d: 'Активный состав размягчает грязь и отделяет её от лака.' },
  { n: '03', t: 'Контакт', d: 'Бережно проходим каждую панель — без спешки и пропусков.' },
  { n: '04', t: 'Ополаскивание', d: 'Смываем всё до последней капли, включая проёмы.' },
  { n: '05', t: 'Сушка', d: 'Воздух и микрофибра — чтобы не осталось разводов.' },
  { n: '06', t: 'Финиш', d: 'Блеск, в котором отражается небо. Можно ехать.' },
]

/* ---------- hero: speed streaks on canvas ---------- */
function Streaks({ vel }) {
  const ref = useRef(null)
  useEffect(() => {
    const c = ref.current, g = c.getContext('2d')
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    let W, H, dpr, id, on = true
    const S = Array.from({ length: 90 }, () => ({ x: Math.random(), y: Math.random(), l: 0.04 + Math.random() * 0.22, s: 0.15 + Math.random() * 0.6, lime: Math.random() < 0.18, w: Math.random() < 0.1 ? 2 : 1 }))
    const size = () => { dpr = Math.min(devicePixelRatio, 1.6); W = c.clientWidth; H = c.clientHeight; c.width = W * dpr; c.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0) }
    size(); addEventListener('resize', size)
    const io = new IntersectionObserver(([e]) => { on = e.isIntersecting; if (on && !reduce) { cancelAnimationFrame(id); id = requestAnimationFrame(draw) } })
    io.observe(c)
    let last = performance.now()
    function draw(t) {
      const dt = Math.min(0.05, (t - last) / 1000); last = t
      const boost = 1 + Math.min(6, Math.abs(vel.get()) / 400)
      g.clearRect(0, 0, W, H)
      for (const s of S) {
        s.x -= dt * s.s * boost * 0.6
        if (s.x + s.l < 0) { s.x = 1 + Math.random() * 0.2; s.y = Math.random() }
        const x = s.x * W, y = s.y * H, L = s.l * W * (0.6 + boost * 0.4)
        const gr = g.createLinearGradient(x, 0, x + L, 0)
        const col = s.lime ? '200,255,26' : '255,255,255'
        gr.addColorStop(0, `rgba(${col},${s.lime ? 0.9 : 0.5})`); gr.addColorStop(1, `rgba(${col},0)`)
        g.strokeStyle = gr; g.lineWidth = s.w; g.beginPath(); g.moveTo(x, y); g.lineTo(x + L, y); g.stroke()
      }
      if (on && !reduce) id = requestAnimationFrame(draw)
    }
    if (reduce) draw(performance.now() + 16); else id = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(id); io.disconnect(); removeEventListener('resize', size) }
  }, [])
  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full opacity-70" />
}

function Stars({ size = 18, cls = '' }) {
  return <span className={'flex gap-1 ' + cls}>{[0, 1, 2, 3, 4].map(k => <Star key={k} size={size} fill="currentColor" strokeWidth={0} />)}</span>
}

function Hero() {
  const ref = useRef(null)
  const { scrollY } = useScroll()
  const vel = useVelocity(scrollY)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const skew = useSpring(useTransform(vel, [-2500, 0, 2500], [10, 0, -10]), { stiffness: 200, damping: 30 })
  const x = useTransform(scrollYProgress, [0, 1], ['0%', '-18%'])
  const op = useTransform(scrollYProgress, [0.4, 0.9], [1, 0])
  return (
    <section ref={ref} id="top" className="relative overflow-hidden" style={{ background: INK }}>
      <Streaks vel={vel} />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#0b0c0e] to-transparent" />
      <motion.div style={{ opacity: op }} className="relative mx-auto flex min-h-[calc(100svh-104px)] max-w-[1440px] flex-col justify-between px-5 pb-10 pt-10 md:px-10 md:pb-14">
        <div className="flex flex-wrap items-center justify-between gap-3 text-[12px] font-semibold uppercase tracking-[.22em] text-white/55">
          <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#c8ff1a]" />Автомойка и детейлинг</span>
          <span>{b.addr} · {b.city}</span>
        </div>
        <h1 className="relative my-6 md:my-0">
          <span className="sr-only">{b.full}</span>
          <motion.span aria-hidden="true" style={{ skewX: skew, x }} className={`${DISP} block origin-left select-none text-[clamp(120px,31vw,470px)] font-black leading-[.78] tracking-[-.07em] text-[#f1f0ea]`}>
            <LineReveal delay={0.15}>GO<span className="text-[#c8ff1a]">!</span></LineReveal>
          </motion.span>
        </h1>
        <div className="grid items-end gap-8 md:grid-cols-[1.1fr_1fr]">
          <div>
            <p className={`${DISP} max-w-[560px] text-[clamp(24px,3vw,40px)] font-medium leading-[1.05] tracking-[-.03em] text-white`}>
              <LineReveal delay={0.45}>Чистая машина —</LineReveal>
              <LineReveal delay={0.55} className="text-white/55">быстрее, чем кажется.</LineReveal>
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#book" className="inline-flex h-14 items-center gap-3 rounded-full bg-[#c8ff1a] px-7 text-[15px] font-bold text-[#0b0c0e] transition-transform hover:-translate-y-0.5">Записаться <ArrowUpRight size={18} /></a>
              <a href={'tel:' + tel(b.phone)} className="inline-flex h-14 items-center gap-2 rounded-full border border-white/20 px-6 text-[15px] font-semibold text-white hover:border-white/60"><Phone size={16} />{b.phone}</a>
            </div>
          </div>
          <motion.div initial={{ clipPath: 'inset(0 100% 0 0)' }} animate={{ clipPath: 'inset(0 0% 0 0)' }} transition={{ duration: 1.1, delay: 0.7, ease: [0.76, 0, 0.24, 1] }}
            className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[.04] p-6 backdrop-blur md:justify-self-end md:p-8">
            <div className="flex items-end gap-5">
              <span className={`${DISP} text-[clamp(64px,8vw,120px)] font-black leading-[.8] tracking-[-.06em] text-[#c8ff1a]`}><Counter to={b.rev} duration={2.2} /></span>
              <span className="pb-1 text-[14px] leading-tight text-white/70">оценок<br />на Яндекс Картах</span>
            </div>
            <div className="mt-5 flex items-center gap-3 border-t border-white/10 pt-4 text-white">
              <span className={`${DISP} text-[28px] font-bold`}>{b.rating}</span><Stars cls="text-[#c8ff1a]" /><span className="text-[13px] text-white/50">средняя оценка</span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}

/* ---------- pinned film ---------- */
function Caption({ p, i, s }) {
  const a = i / 6, e = (i + 1) / 6
  const o = useTransform(p, i === 0 ? [0, 0.01, e - 0.03, e] : i === 5 ? [a, a + 0.03, 1, 1.01] : [a, a + 0.03, e - 0.03, e], [i === 0 ? 1 : 0, 1, 1, i === 5 ? 1 : 0])
  const y = useTransform(p, [a, a + 0.04], [i === 0 ? 0 : 40, 0])
  return (
    <motion.div style={{ opacity: o, y }} className="absolute inset-x-0 bottom-0">
      <div className="flex items-baseline gap-4">
        <span className={`${DISP} text-[clamp(56px,7vw,110px)] font-black leading-none tracking-[-.06em] text-[#c8ff1a]`}>{s.n}</span>
        <span className="text-[12px] font-semibold uppercase tracking-[.24em] text-white/45">станция / 06</span>
      </div>
      <h3 className={`${DISP} mt-2 text-[clamp(30px,4.4vw,64px)] font-bold leading-[.95] tracking-[-.04em] text-white`}>{s.t}</h3>
      <p className="mt-3 max-w-[360px] text-[16px] leading-snug text-white/65">{s.d}</p>
    </motion.div>
  )
}
function Rail({ p }) {
  const w = useTransform(p, [0, 1], ['0%', '100%'])
  const gloss = useTransform(p, [0.12, 0.95], ['0%', '100%'])
  return (
    <div className="grid gap-5">
      <div>
        <div className="mb-2 flex justify-between text-[11px] font-semibold uppercase tracking-[.2em] text-white/45"><span>Въезд</span><span>Выезд</span></div>
        <div className="relative h-[3px] rounded bg-white/10"><motion.div style={{ width: w }} className="absolute inset-y-0 left-0 rounded bg-[#c8ff1a]" />
          {STATIONS.map((s, i) => <span key={i} className="absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/40 bg-[#0b0c0e]" style={{ left: `${((i + 0.5) / 6) * 100}%` }} />)}
        </div>
      </div>
      <div>
        <div className="mb-2 flex justify-between text-[11px] font-semibold uppercase tracking-[.2em] text-white/45"><span>Матовый, в пыли</span><span>Зеркальный блеск</span></div>
        <div className="relative h-[3px] overflow-hidden rounded bg-white/10"><motion.div style={{ width: gloss }} className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#8c8373] via-white/70 to-white" /></div>
      </div>
    </div>
  )
}
function LiteCar({ p }) {
  const f = useTransform(p, [0.1, 0.9], ['#8c8373', '#15171b'])
  const sh = useTransform(p, [0.6, 1], [0, 1])
  const x = useTransform(p, [0, 1], ['-30%', '30%'])
  return (
    <motion.svg style={{ x }} viewBox="0 0 440 160" className="absolute left-1/2 top-[22%] w-[min(80vw,620px)] -translate-x-1/2 md:top-[34%]">
      <motion.path d="M10 120 L410 120 Q430 118 428 90 Q424 70 370 66 L285 60 Q245 18 190 16 L118 18 Q60 26 28 56 Q8 64 8 92 Z" style={{ fill: f }} />
      <path d="M270 62 Q238 26 192 24 L122 26 Q70 32 42 58 Z" fill="#050608" />
      <motion.path d="M60 50 Q200 10 360 60" stroke="#fff" strokeWidth="3" fill="none" style={{ opacity: sh }} />
      <circle cx="90" cy="122" r="30" fill="#0c0c0d" /><circle cx="340" cy="122" r="30" fill="#0c0c0d" />
      <circle cx="90" cy="122" r="18" fill="#9aa0a6" /><circle cx="340" cy="122" r="18" fill="#9aa0a6" />
    </motion.svg>
  )
}
function Film({ lite }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.6 })
  const near = useInView(ref, { margin: '300px 0px 300px 0px' })
  return (
    <section ref={ref} id="wash" className="relative h-[620vh]" style={{ background: INK }}>
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="absolute inset-0">
          {!lite ? (near && <Suspense fallback={null}><Film3D progress={p} active={near} /></Suspense>) : <LiteCar p={p} />}
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0b0c0e] via-transparent to-transparent md:bg-gradient-to-r md:from-[#0b0c0e]/90 md:via-[#0b0c0e]/10" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-[#0b0c0e] to-transparent md:hidden" />
        <div className="relative mx-auto flex h-full max-w-[1440px] flex-col justify-between px-5 pb-28 pt-20 md:px-10 md:pb-12 md:pt-24">
          <div className="max-w-[520px]">
            <p className="text-[12px] font-semibold uppercase tracking-[.24em] text-[#c8ff1a]">Тоннель Go!</p>
            <h2 className={`${DISP} mt-3 text-[clamp(26px,3.4vw,48px)] font-bold leading-[1] tracking-[-.04em] text-white`}>Шесть станций<br className="hidden md:block" /> от пыли до блеска</h2>
          </div>
          <div className="grid items-end gap-8 md:grid-cols-[minmax(0,460px)_1fr]">
            <div className="relative h-[210px] md:h-[250px]">{STATIONS.map((s, i) => <Caption key={i} p={p} i={i} s={s} />)}</div>
            <div className="hidden md:block md:pl-[20%]"><Rail p={p} /></div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- value interaction: how much time do you have ---------- */
const PLANS = [
  { m: 20, label: '20 мин', name: 'Экспресс', fit: 'Заехать между делами и выехать с чистым кузовом.', items: ['Бесконтактная мойка кузова', 'Сушка и протирка', 'Стёкла и зеркала снаружи'], svc: 'Экспресс-мойка' },
  { m: 40, label: '40 мин', name: 'Комплекс', fit: 'Порядок снаружи и внутри — за одну остановку.', items: ['Мойка кузова и дисков', 'Уборка салона пылесосом', 'Пластик и стёкла внутри', 'Коврики'], svc: 'Комплексная мойка' },
  { m: 95, label: '90+ мин', name: 'Детейлинг', fit: 'Когда машине нужен полный перезапуск.', items: ['Детейлинг-мойка кузова', 'Химчистка салона или отдельных элементов', 'Полировка или защитное покрытие — по согласованию'], svc: 'Детейлинг' },
]
function Dial({ m }) {
  const R = 92, C = 2 * Math.PI * R
  return (
    <svg viewBox="0 0 220 220" className="h-full w-full -rotate-90">
      <circle cx="110" cy="110" r={R} fill="none" stroke="#0b0c0e" strokeOpacity=".1" strokeWidth="14" />
      {Array.from({ length: 24 }, (_, k) => <line key={k} x1="110" y1="6" x2="110" y2="14" stroke="#0b0c0e" strokeOpacity=".25" strokeWidth="2" transform={`rotate(${k * 15} 110 110)`} />)}
      <motion.circle cx="110" cy="110" r={R} fill="none" stroke="#0b0c0e" strokeWidth="14" strokeLinecap="round" strokeDasharray={C}
        animate={{ strokeDashoffset: C * (1 - Math.min(m, 120) / 120) }} transition={{ type: 'spring', stiffness: 70, damping: 16 }} />
    </svg>
  )
}
function TimePick() {
  const [k, setK] = useState(1)
  const plan = PLANS[k]
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 25%'] })
  const clip = useTransform(scrollYProgress, [0, 1], ['polygon(0% 22%, 100% 0%, 100% 100%, 0% 100%)', 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'])
  return (
    <motion.section ref={ref} id="time" style={{ clipPath: clip, background: PAPER }} className="relative -mt-[12vh] px-5 pb-24 pt-[18vh] text-[#0b0c0e] md:px-10 md:pb-32">
      <div className="mx-auto max-w-[1440px]">
        <p className="text-[12px] font-semibold uppercase tracking-[.24em] text-[#0b0c0e]/50">Подбор за 5 секунд</p>
        <h2 className={`${DISP} mt-3 max-w-[900px] text-[clamp(38px,6.4vw,104px)] font-black leading-[.9] tracking-[-.06em]`}>
          <LineReveal>Сколько у вас</LineReveal><LineReveal delay={0.08}>времени<span className="text-[#0b0c0e]/30">?</span></LineReveal>
        </h2>
        <div role="radiogroup" aria-label="Сколько у вас времени" className="mt-10 grid grid-cols-3 gap-2 rounded-[22px] bg-[#0b0c0e]/[.06] p-2 md:max-w-[760px]">
          {PLANS.map((pl, i) => (
            <button key={pl.m} role="radio" aria-checked={k === i} onClick={() => setK(i)}
              className={`relative h-16 rounded-[16px] text-[clamp(15px,2vw,22px)] font-bold transition-colors md:h-20 ${k === i ? 'text-[#c8ff1a]' : 'text-[#0b0c0e]/70 hover:text-[#0b0c0e]'}`}>
              {k === i && <motion.span layoutId="tp" className="absolute inset-0 rounded-[16px] bg-[#0b0c0e]" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
              <span className={`${DISP} relative`}>{pl.label}</span>
            </button>
          ))}
        </div>
        <div className="mt-10 grid items-center gap-10 md:grid-cols-[320px_1fr] lg:grid-cols-[380px_1fr]">
          <div className="relative mx-auto aspect-square w-[min(70vw,340px)]">
            <Dial m={plan.m} />
            <div className="absolute inset-0 grid place-items-center text-center">
              <div>
                <AnimatePresence mode="wait"><motion.p key={plan.m} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className={`${DISP} text-[clamp(44px,6vw,72px)] font-black leading-none tracking-[-.06em]`}>{plan.label.replace(' мин', '')}</motion.p></AnimatePresence>
                <p className="mt-1 text-[13px] font-semibold uppercase tracking-[.2em] text-[#0b0c0e]/50">минут</p>
              </div>
            </div>
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={plan.name} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.45, ease: [0.2, 0, 0, 1] }}
              className="rounded-[28px] bg-[#0b0c0e] p-7 text-white md:p-10">
              <p className="text-[12px] font-semibold uppercase tracking-[.24em] text-[#c8ff1a]">Рекомендуем</p>
              <h3 className={`${DISP} mt-2 text-[clamp(36px,5vw,72px)] font-black leading-none tracking-[-.05em]`}>{plan.name}</h3>
              <p className="mt-3 max-w-[460px] text-[17px] text-white/70">{plan.fit}</p>
              <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                {plan.items.map((it, j) => (
                  <motion.li key={it} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + j * 0.06 }} className="flex items-start gap-3 border-t border-white/10 pt-3 text-[15px]">
                    <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#c8ff1a]" />{it}
                  </motion.li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a href="#book" data-svc={plan.svc} className="inline-flex h-14 items-center gap-3 rounded-full bg-[#c8ff1a] px-7 text-[15px] font-bold text-[#0b0c0e]">Записаться на «{plan.name}» <ArrowUpRight size={18} /></a>
                <span className="max-w-[260px] text-[12.5px] leading-snug text-white/45">Время ориентировочное — точнее подскажем при записи, по машине и загрузке.</span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.section>
  )
}

/* ---------- bento ---------- */
function Card({ className = '', children, dark = false }) {
  const ref = useRef(null)
  const mv = e => { const r = ref.current.getBoundingClientRect(); ref.current.style.setProperty('--mx', e.clientX - r.left + 'px'); ref.current.style.setProperty('--my', e.clientY - r.top + 'px') }
  return (
    <Reveal className={'group relative ' + className}>
      <div ref={ref} onPointerMove={mv} className={`relative h-full overflow-hidden rounded-[26px] p-6 md:p-7 ${dark ? 'bg-[#0b0c0e] text-white' : 'bg-white text-[#0b0c0e]'}`}>
        <div className="pointer-events-none absolute inset-0 rounded-[26px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: 'radial-gradient(260px circle at var(--mx) var(--my), rgba(200,255,26,.35), transparent 70%)', WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude', padding: 1.5 }} />
        {children}
      </div>
    </Reveal>
  )
}
function SweepLines() {
  return (
    <svg viewBox="0 0 300 120" className="absolute bottom-0 right-0 w-[70%] opacity-90" aria-hidden="true">
      {[0, 1, 2, 3, 4].map(k => <motion.line key={k} x1="300" x2="120" y1={20 + k * 20} y2={20 + k * 20} stroke={k === 2 ? LIME : '#0b0c0e'} strokeOpacity={k === 2 ? 1 : 0.15} strokeWidth={k === 2 ? 3 : 2} strokeLinecap="round"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: false }} transition={{ duration: 1.2, delay: k * 0.08, repeat: Infinity, repeatDelay: 1.6, ease: [0.76, 0, 0.24, 1] }} />)}
    </svg>
  )
}
function Bento() {
  return (
    <section id="services" className="px-5 pb-24 md:px-10 md:pb-32" style={{ background: PAPER }}>
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6 text-[#0b0c0e]">
          <h2 className={`${DISP} text-[clamp(36px,5.4vw,84px)] font-black leading-[.9] tracking-[-.06em]`}><LineReveal>Всё, что нужно</LineReveal><LineReveal delay={0.08}>машине</LineReveal></h2>
          <p className="max-w-[340px] text-[16px] text-[#0b0c0e]/60">От быстрой мойки до детейлинга. Стоимость зависит от класса машины — уточним по телефону.</p>
        </div>
        <div className="grid auto-rows-[minmax(190px,auto)] grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card dark className="sm:col-span-2 lg:row-span-2">
            <div className="flex h-full flex-col justify-between gap-8">
              <p className="text-[12px] font-semibold uppercase tracking-[.24em] text-white/50">Яндекс Карты</p>
              <div>
                <p className={`${DISP} text-[clamp(84px,12vw,190px)] font-black leading-[.8] tracking-[-.07em] text-[#c8ff1a]`}>1080</p>
                <p className="mt-4 text-[20px] font-semibold">оценок от водителей</p>
                <div className="mt-4 flex items-center gap-3"><span className={`${DISP} text-[34px] font-bold`}>{b.rating}</span><Stars size={22} cls="text-[#c8ff1a]" /></div>
              </div>
              <p className="max-w-[420px] text-[15px] text-white/55">Такой объём оценок не собрать рекламой — только тысячами довольных выездов.</p>
            </div>
          </Card>
          <Card>
            <p className="text-[12px] font-semibold uppercase tracking-[.2em] text-[#0b0c0e]/45">Кузов</p>
            <h3 className={`${DISP} mt-2 text-[26px] font-bold leading-none tracking-[-.04em]`}>Мойка</h3>
            <p className="mt-2 max-w-[220px] text-[14px] text-[#0b0c0e]/60">Бесконтактная и ручная, диски и пороги.</p>
            <SweepLines />
          </Card>
          <Card>
            <p className="text-[12px] font-semibold uppercase tracking-[.2em] text-[#0b0c0e]/45">Салон</p>
            <h3 className={`${DISP} mt-2 text-[26px] font-bold leading-none tracking-[-.04em]`}>Химчистка</h3>
            <p className="mt-2 max-w-[220px] text-[14px] text-[#0b0c0e]/60">Сиденья, потолок, ковры, пластик.</p>
            <div className="absolute bottom-5 right-5 grid grid-cols-6 gap-1.5" aria-hidden="true">
              {Array.from({ length: 18 }, (_, k) => <motion.span key={k} className="h-2.5 w-2.5 rounded-full bg-[#0b0c0e]" animate={{ opacity: [0.12, 1, 0.12] }} transition={{ duration: 2.4, repeat: Infinity, delay: (k % 6) * 0.12 + Math.floor(k / 6) * 0.2 }} />)}
            </div>
          </Card>
          <Card dark className="sm:col-span-2">
            <div className="relative z-10">
              <p className="text-[12px] font-semibold uppercase tracking-[.2em] text-white/45">Детейлинг</p>
              <h3 className={`${DISP} mt-2 text-[clamp(28px,3.4vw,44px)] font-black leading-none tracking-[-.05em]`}>Полировка и защита</h3>
              <p className="mt-3 max-w-[380px] text-[14px] text-white/60">Возвращаем глубину цвета и закрепляем блеск. Покрытие подберём под задачу.</p>
            </div>
            <motion.div aria-hidden="true" className="pointer-events-none absolute inset-y-0 w-[40%] -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent" animate={{ left: ['-50%', '130%'] }} transition={{ duration: 2.6, repeat: Infinity, repeatDelay: 1.4, ease: 'easeInOut' }} />
          </Card>
          <Card>
            <a href="#contact" className="flex h-full flex-col justify-between">
              <div className="relative h-16 w-16" aria-hidden="true">
                <motion.span className="absolute inset-0 rounded-full bg-[#c8ff1a]" animate={{ scale: [0.4, 1.4], opacity: [0.7, 0] }} transition={{ duration: 1.8, repeat: Infinity }} />
                <span className="absolute inset-[22px] rounded-full bg-[#0b0c0e]" />
              </div>
              <div><h3 className={`${DISP} text-[22px] font-bold leading-tight tracking-[-.03em]`}>Крупской, 8,<br />корп. 1</h3><p className="mt-1 flex items-center gap-1 text-[14px] text-[#0b0c0e]/55">Как добраться <ArrowRight size={14} /></p></div>
            </a>
          </Card>
          <Card>
            <div className="flex h-full flex-col justify-between">
              <p className="text-[12px] font-semibold uppercase tracking-[.2em] text-[#0b0c0e]/45">На связи</p>
              <div className="grid grid-cols-2 gap-2">
                {[[b.viber, 'Viber'], [b.wa, 'WhatsApp'], [b.tg, 'Telegram'], [b.ig, 'Instagram']].map(([h, t]) => <a key={t} href={h} target="_blank" rel="noopener" className="rounded-full border border-[#0b0c0e]/15 px-3 py-2 text-center text-[13px] font-semibold hover:bg-[#0b0c0e] hover:text-[#c8ff1a]">{t}</a>)}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}

/* ---------- booking: 3 steps ---------- */
const SVCS = ['Экспресс-мойка', 'Комплексная мойка', 'Детейлинг', 'Химчистка салона', 'Полировка кузова', 'Защитное покрытие']
const DAYS = ['Сегодня', 'Завтра', 'Другой день'], SLOTS = ['Утро', 'День', 'Вечер']
const STEPS = ['Услуга', 'Когда', 'Контакты']
function Chip({ on, children, onClick }) {
  return <button type="button" onClick={onClick} aria-pressed={on} className={`h-12 rounded-full border px-5 text-[14px] font-semibold transition-colors ${on ? 'border-[#c8ff1a] bg-[#c8ff1a] text-[#0b0c0e]' : 'border-white/15 text-white/80 hover:border-white/50'}`}>{children}</button>
}
function Booking() {
  const bk = useBooking()
  const [step, setStep] = useState(0)
  const [day, setDay] = useState(''), [slot, setSlot] = useState('')
  const [err, setErr] = useState('')
  const next = () => {
    if (step === 0 && !bk.s.svc) return setErr('Выберите услугу — или напишите свою.')
    if (step === 1 && (!day || !slot)) return setErr('Отметьте день и время суток.')
    setErr(''); setStep(s => s + 1)
  }
  const onSubmit = e => { e.preventDefault(); if (step < 2) next(); else bk.submit() }
  const f = 'h-14 w-full rounded-[14px] border border-white/15 bg-white/[.04] px-4 text-[17px] text-white outline-none placeholder:text-white/35 focus:border-[#c8ff1a]'
  return (
    <section id="book" className="relative px-5 py-24 md:px-10 md:py-32" style={{ background: INK }}>
      <div className="mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-[1fr_1.1fr]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="text-[12px] font-semibold uppercase tracking-[.24em] text-[#c8ff1a]">Запись</p>
          <h2 className={`${DISP} mt-3 text-[clamp(44px,7vw,120px)] font-black leading-[.85] tracking-[-.07em] text-white`}><LineReveal>Ready.</LineReveal><LineReveal delay={0.08}>Steady.</LineReveal><LineReveal delay={0.16} className="text-[#c8ff1a]">Go!</LineReveal></h2>
          <p className="mt-6 max-w-[420px] text-[16px] text-white/60">Три шага — и мы перезвоним, чтобы подтвердить время. Или сразу звоните:</p>
          <a href={'tel:' + tel(b.phone)} className={`${DISP} mt-3 inline-block text-[clamp(24px,2.6vw,36px)] font-bold tracking-[-.03em] text-white hover:text-[#c8ff1a]`}>{b.phone}</a>
        </div>
        <div className="rounded-[30px] border border-white/10 bg-white/[.03] p-6 md:p-10">
          <AnimatePresence mode="wait">
            {!bk.s.sent ? (
              <motion.form key="form" onSubmit={onSubmit} noValidate exit={{ opacity: 0, y: -12 }}>
                <ol className="mb-8 grid grid-cols-3 gap-2" aria-label="Шаги записи">
                  {STEPS.map((s, i) => (
                    <li key={s} aria-current={i === step ? 'step' : undefined}>
                      <div className="h-1 overflow-hidden rounded bg-white/10"><motion.div className="h-full bg-[#c8ff1a]" animate={{ width: i <= step ? '100%' : '0%' }} transition={{ duration: 0.5 }} /></div>
                      <p className={`mt-2 text-[12px] font-semibold uppercase tracking-[.18em] ${i <= step ? 'text-white' : 'text-white/35'}`}>{i + 1}. {s}</p>
                    </li>
                  ))}
                </ol>
                <AnimatePresence mode="wait">
                  <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3 }} className="min-h-[250px]">
                    {step === 0 && (
                      <fieldset>
                        <legend className={`${DISP} mb-5 text-[24px] font-bold tracking-[-.03em] text-white`}>Что делаем?</legend>
                        <div className="flex flex-wrap gap-2">{SVCS.map(s => <Chip key={s} on={bk.s.svc === s} onClick={() => { bk.upd('svc', s); setErr('') }}>{s}</Chip>)}</div>
                        <input className={f + ' mt-5'} placeholder="Или опишите задачу" value={SVCS.includes(bk.s.svc) ? '' : bk.s.svc} onChange={e => bk.upd('svc', e.target.value)} />
                      </fieldset>
                    )}
                    {step === 1 && (
                      <div className="grid gap-6">
                        <fieldset><legend className={`${DISP} mb-4 text-[24px] font-bold tracking-[-.03em] text-white`}>Когда удобно?</legend><div className="flex flex-wrap gap-2">{DAYS.map(d => <Chip key={d} on={day === d} onClick={() => { setDay(d); setErr('') }}>{d}</Chip>)}</div></fieldset>
                        <fieldset><legend className="mb-3 text-[14px] font-semibold text-white/60">Время суток</legend><div className="flex flex-wrap gap-2">{SLOTS.map(d => <Chip key={d} on={slot === d} onClick={() => { setSlot(d); setErr('') }}>{d}</Chip>)}</div></fieldset>
                      </div>
                    )}
                    {step === 2 && (
                      <div className="grid gap-4">
                        <p className="rounded-[14px] bg-white/[.05] px-4 py-3 text-[14px] text-white/70"><span className="text-[#c8ff1a]">{bk.s.svc}</span> · {day} · {slot}</p>
                        <label className="grid gap-2 text-[13px] font-semibold text-white/60">Имя<input className={f} autoComplete="name" placeholder="Как к вам обращаться" value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} /></label>
                        <label className="grid gap-2 text-[13px] font-semibold text-white/60">Телефон
                          <motion.input animate={bk.s.err ? { x: [0, -8, 8, -5, 5, 0] } : {}} className={f + (bk.s.err ? ' !border-red-400' : '')} type="tel" inputMode="tel" autoComplete="tel" placeholder="+375 __ ___-__-__" value={bk.s.phone} onFocus={phoneFocus(bk)} onChange={e => bk.upd('phone', e.target.value)} aria-invalid={bk.s.err} />
                        </label>
                        {bk.s.err && <p role="alert" className="text-[13px] text-red-300">Введите номер полностью: +375 и 9 цифр.</p>}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
                {err && <p role="alert" className="mt-3 text-[13px] text-red-300">{err}</p>}
                <div className="mt-8 flex items-center justify-between gap-3">
                  {step > 0 ? <button type="button" onClick={() => { setErr(''); setStep(s => s - 1) }} className="inline-flex h-14 items-center gap-2 rounded-full px-4 text-[14px] font-semibold text-white/70 hover:text-white"><ArrowLeft size={16} />Назад</button> : <span />}
                  <button type="submit" disabled={bk.s.loading} className="inline-flex h-14 items-center gap-3 rounded-full bg-[#c8ff1a] px-8 text-[15px] font-bold text-[#0b0c0e] disabled:opacity-60">{step < 2 ? <>Дальше <ArrowRight size={18} /></> : bk.s.loading ? 'Отправляем…' : 'Записаться'}</button>
                </div>
              </motion.form>
            ) : (
              <motion.div key="ok" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="grid min-h-[380px] place-items-center text-center text-white">
                <div>
                  <CheckDraw className="mx-auto mb-6 text-[#c8ff1a]" size={88} />
                  <h3 className={`${DISP} text-[40px] font-black tracking-[-.05em]`}>Заявка принята</h3>
                  <p className="mx-auto mt-3 max-w-[360px] text-white/60">В готовом сайте заявка сразу придёт вам в Telegram — администратор перезвонит и подтвердит время.</p>
                  <button onClick={() => { bk.reset(); setStep(0); setDay(''); setSlot('') }} className="mt-6 text-[14px] font-semibold text-[#c8ff1a] underline underline-offset-4">Новая запись</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

function Contact() {
  return (
    <section id="contact" className="px-5 pb-24 md:px-10 md:pb-32" style={{ background: INK }}>
      <div className="mx-auto grid max-w-[1440px] gap-6 lg:grid-cols-[1fr_1.3fr]">
        <div className="flex flex-col justify-between rounded-[30px] bg-[#c8ff1a] p-7 text-[#0b0c0e] md:p-10">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[.24em] text-[#0b0c0e]/60">Контакты</p>
            <h2 className={`${DISP} mt-3 text-[clamp(34px,4.4vw,64px)] font-black leading-[.9] tracking-[-.06em]`}>Крупской, 8,<br />корп. 1</h2>
            <p className="mt-3 flex items-center gap-2 text-[15px] font-semibold"><MapPin size={16} />{b.city}</p>
          </div>
          <div className="mt-10">
            <a href={'tel:' + tel(b.phone)} className={`${DISP} block text-[clamp(26px,3vw,40px)] font-bold tracking-[-.04em]`}>{b.phone}</a>
            <p className="mt-1 text-[14px] text-[#0b0c0e]/60">Звонок, Viber, WhatsApp</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <a href={b.viber} target="_blank" rel="noopener" className="inline-flex h-11 items-center rounded-full bg-[#0b0c0e] px-5 text-[14px] font-semibold text-white">Viber</a>
              <a href={b.wa} target="_blank" rel="noopener" className="inline-flex h-11 items-center gap-2 rounded-full bg-[#0b0c0e] px-5 text-[14px] font-semibold text-white"><WA width={16} />WhatsApp</a>
              <a href={b.tg} target="_blank" rel="noopener" className="inline-flex h-11 items-center gap-2 rounded-full bg-[#0b0c0e] px-5 text-[14px] font-semibold text-white"><TG width={16} />Telegram</a>
              <a href={b.ig} target="_blank" rel="noopener" className="inline-flex h-11 items-center gap-2 rounded-full bg-[#0b0c0e] px-5 text-[14px] font-semibold text-white"><IG width={16} />Instagram</a>
            </div>
          </div>
        </div>
        <div className="h-[380px] overflow-hidden rounded-[30px] lg:h-auto lg:min-h-[480px]"><MapFrame oid={b.oid} dark /></div>
      </div>
    </section>
  )
}

function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0b0c0e]/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 md:px-10">
        <a href="#top" className={`${DISP} text-[24px] font-black tracking-[-.06em] text-white`} aria-label="Go! — на главную">GO<span className="text-[#c8ff1a]">!</span></a>
        <nav className="hidden gap-8 text-[14px] font-medium text-white/60 md:flex">{[['#wash', 'Тоннель'], ['#time', 'Подбор'], ['#services', 'Услуги'], ['#contact', 'Контакты']].map(([h, t]) => <a key={h} href={h} className="hover:text-white">{t}</a>)}</nav>
        <div className="flex items-center gap-2">
          <a href={'tel:' + tel(b.phone)} className="hidden h-10 items-center gap-2 rounded-full px-3 text-[14px] font-semibold text-white lg:inline-flex"><Phone size={15} />{b.phone}</a>
          <a href="#book" className="inline-flex h-10 items-center rounded-full bg-[#c8ff1a] px-5 text-[14px] font-bold text-[#0b0c0e]">Записаться</a>
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
      <div className="overflow-x-clip font-['Inter_Tight',sans-serif]" style={{ background: INK, color: '#fff', '--sel': LIME, '--selc': INK }}>
        <Ribbon name={b.name} bg={LIME} fg={INK} />
        <Header />
        <main>
          <Hero />
          <Film lite={lite} />
          <TimePick />
          <Bento />
          <Booking />
          <Contact />
        </main>
        <footer className="border-t border-white/10 px-5 py-8 text-[13px] text-white/45 md:px-10" style={{ background: INK }}>
          <div className="mx-auto flex max-w-[1440px] flex-wrap justify-between gap-4"><span>© 2026 {b.name} · Концепт сайта — Артём</span><span>{b.addr}, {b.city}</span></div>
        </footer>
        <CallBar phone={b.phone} barCls="bg-[#0b0c0e]/95 backdrop-blur border-t border-white/10" callCls="rounded-full border border-white/25 text-white" bookCls="rounded-full bg-[#c8ff1a] text-[#0b0c0e]" />
        <div className="h-[72px] sm:hidden" style={{ background: INK }} />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
