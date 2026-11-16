import React, { useEffect, useRef, useState, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, useSpring, useInView, AnimatePresence, MotionConfig } from 'framer-motion'
import { ArrowUpRight, Phone, MapPin, Star, ArrowRight, ArrowLeft, Check, Plus } from 'lucide-react'
import '../lib/base.css'
import { useSmooth, Ribbon, LineReveal, Reveal, useBooking, phoneFocus, CheckDraw, MapFrame, CallBar, tel, useLite, IG } from '../lib/kit'

const DoorScene = lazy(() => import('./saniembar3d').then(m => ({ default: m.DoorScene })))
const LensScene = lazy(() => import('./saniembar3d').then(m => ({ default: m.LensScene })))

const b = {
  name: 'Saniembar detailing center', short: 'Saniembar',
  addr: 'Суражская ул., 10, помещение 1', city: 'Минск',
  phone: '+375 29 677-18-70',
  ig: 'http://www.instagram.com/tvojamojka', vk: 'https://vk.ru/club138285006',
  rating: '4,8', rev: 152, oid: '1751697807',
}
const BASE = '#0e1114', INK = '#e8ebee', ACC = '#6fb6ff', LIGHT = '#eceef0'
const MONO = "font-['JetBrains_Mono',monospace]"
const clamp = (v, a = 0, c = 1) => Math.min(c, Math.max(a, v))
const sm = (a, c, x) => { const t = clamp((x - a) / (c - a)); return t * t * (3 - 2 * t) }
const layerT = (p, i) => sm(0.05 + (i - 1) * 0.16, 0.05 + (i - 1) * 0.16 + 0.12, p)
const quiet = p => { let q = 0; for (let i = 1; i < 5; i++) q += layerT(p, i) / 4; return q }

const VK = p => (<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" {...p}><path d="M12.8 17.5c-5.5 0-8.6-3.8-8.8-10h2.8c.1 4.6 2.1 6.5 3.7 6.9V7.5h2.6v4c1.6-.2 3.3-2 3.8-4h2.6c-.4 2.4-2.2 4.2-3.4 4.9 1.3.6 3.3 2.1 4.1 5.1h-2.9c-.6-1.9-2.2-3.4-4.2-3.6v3.6h-.3Z" /></svg>)

/* ---------- hero: noise you can calm with the cursor ---------- */
function NoiseField({ calm }) {
  const ref = useRef(null)
  useEffect(() => {
    const c = ref.current, g = c.getContext('2d')
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    let W, H, id, on = true, px = -9999, py = -9999, tpx = -9999
    const size = () => { const d = Math.min(devicePixelRatio, 1.6); W = c.clientWidth; H = c.clientHeight; c.width = W * d; c.height = H * d; g.setTransform(d, 0, 0, d, 0, 0) }
    size(); addEventListener('resize', size)
    const mv = e => { const r = c.getBoundingClientRect(); tpx = e.clientX - r.left; py = e.clientY - r.top }
    addEventListener('pointermove', mv)
    const io = new IntersectionObserver(([e]) => { on = e.isIntersecting; if (on && !reduce) { cancelAnimationFrame(id); id = requestAnimationFrame(draw) } }); io.observe(c)
    const L = 9
    function draw(tm) {
      const t = tm / 1000
      px += (tpx - px) * 0.08
      g.clearRect(0, 0, W, H)
      const cm = calm.get()
      for (let l = 0; l < L; l++) {
        const y0 = H * (0.3 + 0.5 * l / (L - 1))
        g.beginPath()
        for (let x = 0; x <= W; x += 4) {
          const d = Math.exp(-((x - px) ** 2) / (2 * 140 ** 2)) * Math.exp(-((y0 - py) ** 2) / (2 * 220 ** 2))
          const edge = Math.min(1, x / (W * 0.15))
          const a = 26 * (1 - d * 0.95) * (1 - cm * 0.9) * edge
          const y = y0 + a * (Math.sin(x * 0.021 + t * 2.4 + l) * 0.6 + Math.sin(x * 0.053 - t * 3.7 + l * 2) * 0.3 + Math.sin(x * 0.11 + t * 6 + l * 5) * 0.1)
          x ? g.lineTo(x, y) : g.moveTo(x, y)
        }
        g.strokeStyle = l === 7 ? 'rgba(111,182,255,.9)' : `rgba(232,235,238,${0.08 + 0.05 * (l % 3)})`
        g.lineWidth = l === 7 ? 1.6 : 1
        g.stroke()
      }
      if (on && !reduce) id = requestAnimationFrame(draw)
    }
    if (reduce) draw(0); else id = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(id); io.disconnect(); removeEventListener('resize', size); removeEventListener('pointermove', mv) }
  }, [])
  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />
}

function Hero() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const calm = useTransform(scrollYProgress, [0, 0.7], [0, 1])
  const op = useTransform(scrollYProgress, [0.3, 0.85], [1, 0])
  return (
    <section ref={ref} id="top" className="relative overflow-hidden" style={{ background: BASE }}>
      <NoiseField calm={calm} />
      <motion.div style={{ opacity: op }} className="relative mx-auto flex min-h-[calc(100svh-100px)] max-w-[1400px] flex-col justify-between px-5 pb-10 pt-12 md:px-10 md:pb-14">
        <div className={`${MONO} flex flex-wrap justify-between gap-3 text-[11.5px] uppercase tracking-[.18em] text-[#e8ebee]/45`}>
          <span>Детейлинг · шумоизоляция · фары · шины</span><span>Суражская, 10 · Минск</span>
        </div>
        <div className="py-10">
          <h1 className="max-w-[1100px] text-[clamp(46px,8.6vw,138px)] font-light leading-[.92] tracking-[-.055em] text-[#e8ebee]">
            <LineReveal delay={0.1}>Тишина —</LineReveal>
            <LineReveal delay={0.2}>это тоже <span className="font-medium text-[#6fb6ff]">чистота.</span></LineReveal>
          </h1>
          <p className="mt-7 max-w-[470px] text-[17px] leading-relaxed text-[#e8ebee]/60">Saniembar detailing center: шумоизоляция, полировка фар, детейлинг-мойка и шиномонтаж. Делаем так, чтобы в машине было тихо и ясно.</p>
          <p className={`${MONO} mt-5 hidden text-[11.5px] uppercase tracking-[.18em] text-[#e8ebee]/35 md:block`}>Наведите курсор на волны — станет тише</p>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="flex flex-wrap gap-3">
            <a href="#plan" className="inline-flex h-14 items-center gap-3 rounded-full bg-[#e8ebee] px-7 text-[15px] font-semibold text-[#0e1114] hover:bg-white">Собрать визит <ArrowRight size={18} /></a>
            <a href={'tel:' + tel(b.phone)} className="inline-flex h-14 items-center gap-2 rounded-full border border-[#e8ebee]/20 px-6 text-[15px] font-medium text-[#e8ebee] hover:border-[#e8ebee]/60"><Phone size={16} />{b.phone}</a>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[44px] font-light leading-none tracking-[-.04em]">{b.rating}</span>
            <span className="text-[13px] leading-tight text-[#e8ebee]/55"><span className="mb-1 flex gap-0.5 text-[#6fb6ff]">{[0, 1, 2, 3, 4].map(k => <Star key={k} size={13} fill="currentColor" strokeWidth={0} />)}</span>{b.rev} оценки<br />на Яндекс Картах</span>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

/* ---------- film 1: door cross-section ---------- */
const DOOR = [
  { k: '00', t: 'Голый металл', d: 'Тонкая панель двери дрожит и пропускает шум дороги в салон.' },
  { k: '01', t: 'Вибропоглощение', d: 'Гасим резонанс металла — дверь перестаёт «звенеть».' },
  { k: '02', t: 'Шумопоглощение', d: 'Мягкий слой забирает воздушный шум: шины, ветер, поток.' },
  { k: '03', t: 'Изоляция', d: 'Закрываем технологические отверстия и щели.' },
  { k: '04', t: 'Обшивка на место', d: 'Снаружи — та же машина. Внутри — другой звук.' },
]
function DoorCap({ p, i, s }) {
  const a = i * 0.15, e = (i + 1) * 0.15
  const o = useTransform(p, i === 0 ? [0, 0.01, e - 0.03, e] : i === 4 ? [a, a + 0.03, 1, 1.01] : [a, a + 0.03, e - 0.03, e], [i === 0 ? 1 : 0, 1, 1, i === 4 ? 1 : 0])
  const y = useTransform(p, [a, a + 0.05], [i === 0 ? 0 : 24, 0])
  return (
    <motion.div style={{ opacity: o, y }} className="absolute inset-x-0 bottom-0">
      <p className={`${MONO} text-[12px] uppercase tracking-[.2em] text-[#6fb6ff]`}>Слой {s.k}</p>
      <h3 className="mt-2 text-[clamp(32px,4.6vw,66px)] font-light leading-[.95] tracking-[-.05em]">{s.t}</h3>
      <p className="mt-3 max-w-[380px] text-[16px] leading-snug text-[#e8ebee]/60">{s.d}</p>
    </motion.div>
  )
}
function Meter({ p }) {
  const q = useTransform(p, quiet)
  const db = useTransform(q, v => String(Math.round(78 - 16 * v)))
  const h = useTransform(q, v => `${100 - v * 62}%`)
  return (
    <div className="flex items-end gap-4">
      <div className="relative h-[150px] w-2 overflow-hidden rounded-full bg-[#e8ebee]/10 md:h-[200px]"><motion.div style={{ height: h }} className="absolute inset-x-0 bottom-0 rounded-full bg-gradient-to-t from-[#6fb6ff] to-[#e8ebee]" /></div>
      <div>
        <p className={`${MONO} text-[11px] uppercase tracking-[.18em] text-[#e8ebee]/45`}>Шум в салоне</p>
        <p className="text-[clamp(56px,6vw,96px)] font-light leading-none tracking-[-.06em] tabular-nums"><motion.span>{db}</motion.span><span className="ml-1 text-[.35em] text-[#e8ebee]/50">дБ</span></p>
        <p className={`${MONO} mt-1 max-w-[200px] text-[10.5px] leading-snug text-[#e8ebee]/40`}>* условная шкала для иллюстрации, не замер</p>
      </div>
    </div>
  )
}
function useFilm(ref) {
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.6 })
  const near = useInView(ref, { margin: '300px 0px 300px 0px' })
  return [p, near]
}
function LiteDoor({ p }) {
  return (
    <div className="absolute right-[8%] top-[18%] flex h-[40%] items-center gap-1.5 md:top-[25%]">
      {['#38434f', '#c9ced4', '#2b2e34', '#606772', '#16181b'].map((c, i) => <LiteSlab key={i} p={p} i={i} c={c} />)}
    </div>
  )
}
function LiteSlab({ p, i, c }) {
  const t = useTransform(p, v => i === 0 ? 1 : layerT(v, i))
  const x = useTransform(t, v => (1 - v) * 120)
  return <motion.div style={{ x, opacity: t, background: c, width: i === 2 ? 34 : 12 }} className="h-full rounded" />
}
function DoorFilm({ lite }) {
  const ref = useRef(null)
  const [p, near] = useFilm(ref)
  return (
    <section ref={ref} id="silence" className="relative h-[460vh]" style={{ background: BASE }}>
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="absolute inset-0">{!lite ? (near && <Suspense fallback={null}><DoorScene progress={p} active={near} /></Suspense>) : <LiteDoor p={p} />}</div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0e1114] via-[#0e1114]/30 to-transparent md:bg-gradient-to-r md:from-[#0e1114] md:via-[#0e1114]/40 md:to-transparent" />
        <div className="relative mx-auto flex h-full max-w-[1400px] flex-col justify-between px-5 pb-28 pt-20 md:px-10 md:pb-14 md:pt-24">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className={`${MONO} text-[12px] uppercase tracking-[.2em] text-[#e8ebee]/45`}>Глава 1 · Шумоизоляция</p>
              <h2 className="mt-3 max-w-[460px] text-[clamp(26px,3vw,42px)] font-light leading-[1.05] tracking-[-.04em]">Дверь в разрезе. Слой за слоем.</h2>
            </div>
          </div>
          <div className="flex items-end justify-between gap-8">
            <div className="relative h-[200px] w-full md:h-[230px] md:max-w-[460px]">{DOOR.map((s, i) => <DoorCap key={i} p={p} i={i} s={s} />)}</div>
            <div className="hidden shrink-0 md:block"><Meter p={p} /></div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- film 2: headlight lens, revealed through an iris ---------- */
const LENS = [
  { t: 'Желтизна и муть', d: 'Пластик стареет: свет рассеивается и не доходит до дороги.' },
  { t: 'Шлифовка', d: 'Снимаем повреждённый верхний слой — поэтапно, бережно.' },
  { t: 'Полировка', d: 'Возвращаем прозрачность, пока стекло не станет «водой».' },
  { t: 'Ясный свет', d: 'Луч снова собран. Ехать ночью — спокойнее.' },
]
function LensCap({ p, i, s }) {
  const a = i / 4, e = (i + 1) / 4
  const o = useTransform(p, i === 0 ? [0, 0.01, e - 0.03, e] : i === 3 ? [a, a + 0.03, 1, 1.01] : [a, a + 0.03, e - 0.03, e], [i === 0 ? 1 : 0, 1, 1, i === 3 ? 1 : 0])
  return (
    <motion.div style={{ opacity: o }} className="absolute inset-x-0 bottom-0">
      <p className={`${MONO} text-[12px] uppercase tracking-[.2em] text-[#e8ebee]/45`}>{String(i + 1).padStart(2, '0')} / 04</p>
      <h3 className="mt-2 text-[clamp(32px,4.6vw,66px)] font-light leading-[.95] tracking-[-.05em]">{s.t}</h3>
      <p className="mt-3 max-w-[380px] text-[16px] leading-snug text-[#e8ebee]/60">{s.d}</p>
    </motion.div>
  )
}
function Clarity({ p }) {
  const w = useTransform(p, [0.1, 0.7], ['0%', '100%'])
  const pct = useTransform(p, v => String(Math.round(sm(0.1, 0.7, v) * 100)))
  return (
    <div className="w-[240px]">
      <div className={`${MONO} mb-2 flex justify-between text-[11px] uppercase tracking-[.18em] text-[#e8ebee]/45`}><span>Прозрачность</span><span><motion.span>{pct}</motion.span>%</span></div>
      <div className="h-[3px] overflow-hidden rounded bg-[#e8ebee]/10"><motion.div style={{ width: w }} className="h-full bg-gradient-to-r from-[#d9b552] to-white" /></div>
      <p className={`${MONO} mt-2 text-[10.5px] text-[#e8ebee]/35`}>* иллюстрация</p>
    </div>
  )
}
function LiteLens({ p }) {
  const bg = useTransform(p, [0.1, 0.8], ['radial-gradient(circle, #e0c46a 0%, #8a7434 60%, #2a2412 100%)', 'radial-gradient(circle, #ffffff 0%, #c9d8e8 45%, #1c2128 100%)'])
  return <motion.div style={{ background: bg }} className="absolute left-1/2 top-[18%] h-[42vmin] w-[42vmin] -translate-x-1/2 rounded-full border-[6px] border-[#c3c8ce] md:left-auto md:right-[14%] md:top-[26%] md:translate-x-0" />
}
function LensFilm({ lite }) {
  const ref = useRef(null)
  const [p, near] = useFilm(ref)
  const { scrollYProgress: enter } = useScroll({ target: ref, offset: ['start end', 'start start'] })
  const clip = useTransform(enter, t => `circle(${(t * t * t * 140).toFixed(2)}vmax at 70% ${(t * 50).toFixed(2)}vh)`)
  return (
    <motion.section ref={ref} id="lights" style={{ clipPath: clip }} className="relative -mt-[100vh] h-[380vh] bg-[#050607]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="absolute inset-0">{!lite ? (near && <Suspense fallback={null}><LensScene progress={p} active={near} /></Suspense>) : <LiteLens p={p} />}</div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050607] via-transparent to-transparent md:bg-gradient-to-r md:from-[#050607] md:via-[#050607]/20" />
        <div className="relative mx-auto flex h-full max-w-[1400px] flex-col justify-between px-5 pb-28 pt-20 md:px-10 md:pb-14 md:pt-24">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className={`${MONO} text-[12px] uppercase tracking-[.2em] text-[#e8ebee]/45`}>Глава 2 · Полировка фар</p>
              <h2 className="mt-3 max-w-[460px] text-[clamp(26px,3vw,42px)] font-light leading-[1.05] tracking-[-.04em]">Из мутного — в кристально ясный.</h2>
            </div>
            <div className="hidden md:block"><Clarity p={p} /></div>
          </div>
          <div className="relative h-[200px] md:h-[230px] md:max-w-[460px]">{LENS.map((s, i) => <LensCap key={i} p={p} i={i} s={s} />)}</div>
        </div>
      </div>
    </motion.section>
  )
}

/* ---------- value: build a visit ---------- */
const JOBS = [
  { id: 'doors', g: 'Шумоизоляция', t: 'Двери', note: 'Нужна марка и модель — от них зависит объём работ.' },
  { id: 'floor', g: 'Шумоизоляция', t: 'Пол', note: 'Работа с разбором салона — время согласуем заранее.' },
  { id: 'arches', g: 'Шумоизоляция', t: 'Арки', note: 'Снижает шум от шин и камней по аркам.' },
  { id: 'lights', g: 'Оптика', t: 'Полировка фар', note: 'Осмотрим фары: нет ли трещин и влаги внутри.' },
  { id: 'wash', g: 'Кузов и салон', t: 'Детейлинг-мойка', note: 'Расскажите о проблемных местах — уделим им внимание.' },
  { id: 'tyres', g: 'Колёса', t: 'Шиномонтаж', note: 'Подскажите размер шин при звонке.' },
]
function JobIcon({ id, on }) {
  const s = on ? '#0e1114' : '#0e1114'
  return (
    <svg viewBox="0 0 48 48" width="40" height="40" fill="none" stroke={s} strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
      {id === 'doors' && <><path d="M8 30 L10 16 Q11 12 15 12 L38 12 L40 30 Z" /><path d="M8 30 L8 38 L40 38 L40 30" /><path d="M30 24 h5" /></>}
      {id === 'floor' && <><rect x="6" y="20" width="36" height="16" rx="3" /><path d="M6 26 h36 M6 31 h36" opacity=".5" /></>}
      {id === 'arches' && <><path d="M4 36 L10 36 A14 14 0 0 1 38 36 L44 36" /><circle cx="24" cy="36" r="9" /></>}
      {id === 'lights' && <><ellipse cx="18" cy="24" rx="10" ry="8" /><path d="M30 18 h12 M30 24 h14 M30 30 h12" /></>}
      {id === 'wash' && <><path d="M24 8 C30 18 34 22 34 28 a10 10 0 0 1 -20 0 C14 22 18 18 24 8 Z" /></>}
      {id === 'tyres' && <><circle cx="24" cy="24" r="16" /><circle cx="24" cy="24" r="7" /><path d="M24 8 v9 M24 31 v9 M8 24 h9 M31 24 h9" opacity=".5" /></>}
    </svg>
  )
}
function JobTile({ j, on, toggle }) {
  return (
    <button type="button" onClick={toggle} aria-pressed={on}
      className={`group relative flex min-h-[132px] flex-col justify-between rounded-[22px] border p-5 text-left transition-all duration-300 ${on ? 'border-[#0e1114] bg-white shadow-[0_18px_40px_-20px_rgba(14,17,20,.45)]' : 'border-[#0e1114]/10 bg-white/50 hover:border-[#0e1114]/30'}`}>
      <div className="flex items-start justify-between">
        <JobIcon id={j.id} on={on} />
        <span className={`grid h-8 w-8 place-items-center rounded-full transition-colors ${on ? 'bg-[#0e1114] text-white' : 'border border-[#0e1114]/20 text-[#0e1114]/60'}`}>{on ? <Check size={16} /> : <Plus size={16} />}</span>
      </div>
      <div>
        <p className={`${MONO} text-[10.5px] uppercase tracking-[.16em] text-[#0e1114]/45`}>{j.g}</p>
        <p className="mt-1 text-[19px] font-medium tracking-[-.02em] text-[#0e1114]">{j.t}</p>
      </div>
    </button>
  )
}
function Planner() {
  const [sel, setSel] = useState(['doors', 'lights'])
  const toggle = id => setSel(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
  const chosen = JOBS.filter(j => sel.includes(j.id))
  const label = j => j.g === 'Шумоизоляция' ? `Шумоизоляция: ${j.t.toLowerCase()}` : j.t
  return (
    <section id="plan" className="relative px-5 py-24 text-[#0e1114] md:px-10 md:py-32" style={{ background: LIGHT }}>
      <div className="mx-auto max-w-[1400px]">
        <p className={`${MONO} text-[12px] uppercase tracking-[.2em] text-[#0e1114]/50`}>Планировщик визита</p>
        <h2 className="mt-3 text-[clamp(40px,6.4vw,104px)] font-light leading-[.92] tracking-[-.055em]"><LineReveal>Что сделать</LineReveal><LineReveal delay={0.08}>с машиной?</LineReveal></h2>
        <div className="mt-12 grid gap-8 lg:grid-cols-[1.3fr_1fr]">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">{JOBS.map(j => <JobTile key={j.id} j={j} on={sel.includes(j.id)} toggle={() => toggle(j.id)} />)}</div>
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="relative overflow-hidden rounded-[26px] bg-[#0e1114] p-7 text-[#e8ebee] md:p-8">
              <div className="flex items-baseline justify-between">
                <p className={`${MONO} text-[11px] uppercase tracking-[.2em] text-[#e8ebee]/45`}>Ваш визит</p>
                <p className="text-[14px] text-[#e8ebee]/55">работ: <span className="text-[#6fb6ff] tabular-nums">{chosen.length}</span></p>
              </div>
              <div className="mt-5 min-h-[180px]">
                {!chosen.length && <p className="text-[16px] text-[#e8ebee]/45">Отметьте работы слева — здесь соберётся план визита.</p>}
                <ul className="grid gap-0">
                  <AnimatePresence initial={false}>
                    {chosen.map(j => (
                      <motion.li key={j.id} layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.35, ease: [0.2, 0, 0, 1] }} className="overflow-hidden">
                        <div className="border-t border-[#e8ebee]/10 py-3.5">
                          <p className="text-[17px] font-medium tracking-[-.01em]">{label(j)}</p>
                          <p className="mt-0.5 text-[13.5px] text-[#e8ebee]/50">{j.note}</p>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              </div>
              <div className="mt-4 border-t border-[#e8ebee]/10 pt-5">
                <p className="text-[13.5px] text-[#e8ebee]/50">Стоимость и время назовём после звонка — они зависят от модели авто.</p>
                <a href="#book" data-svc={chosen.map(label).join(', ')} aria-disabled={!chosen.length}
                  className={`mt-5 flex h-14 items-center justify-center gap-2 rounded-full text-[15px] font-semibold transition-colors ${chosen.length ? 'bg-[#e8ebee] text-[#0e1114] hover:bg-white' : 'pointer-events-none bg-[#e8ebee]/10 text-[#e8ebee]/40'}`}>Перенести в заявку <ArrowRight size={17} /></a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- bento ---------- */
function Tile({ className = '', dark, children }) {
  const ref = useRef(null)
  const mv = e => { const r = ref.current.getBoundingClientRect(); ref.current.style.setProperty('--mx', e.clientX - r.left + 'px'); ref.current.style.setProperty('--my', e.clientY - r.top + 'px') }
  return (
    <Reveal className={'group ' + className}>
      <div ref={ref} onPointerMove={mv} className={`relative h-full overflow-hidden rounded-[24px] p-6 md:p-7 ${dark ? 'bg-[#0e1114] text-[#e8ebee]' : 'bg-white text-[#0e1114]'}`}>
        <div className="pointer-events-none absolute inset-0 rounded-[24px] opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ padding: 1.5, background: 'radial-gradient(240px circle at var(--mx) var(--my), rgba(111,182,255,.8), transparent 70%)', WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude' }} />
        {children}
      </div>
    </Reveal>
  )
}
function MiniWave() {
  return (
    <svg viewBox="0 0 300 60" className="mt-6 w-full" aria-hidden="true">
      <motion.path fill="none" stroke="#6fb6ff" strokeWidth="2" strokeLinecap="round"
        animate={{ d: ['M0 30 Q15 5 30 30 T60 30 T90 30 T120 30 T150 30 T180 30 T210 30 T240 30 T270 30 T300 30', 'M0 30 Q15 26 30 30 T60 30 T90 30 T120 30 T150 30 T180 30 T210 30 T240 30 T270 30 T300 30'] }}
        transition={{ duration: 2.4, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }} />
    </svg>
  )
}
function Bento() {
  return (
    <section id="services" className="px-5 pb-24 md:px-10 md:pb-32" style={{ background: LIGHT }}>
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6 text-[#0e1114]">
          <h2 className="text-[clamp(36px,5vw,76px)] font-light leading-[.95] tracking-[-.05em]"><LineReveal>Одна мастерская —</LineReveal><LineReveal delay={0.08} className="text-[#0e1114]/45">четыре направления</LineReveal></h2>
        </div>
        <div className="grid auto-rows-[minmax(200px,auto)] gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Tile dark className="sm:col-span-2 lg:row-span-2">
            <div className="flex h-full flex-col justify-between gap-6">
              <p className={`${MONO} text-[11px] uppercase tracking-[.2em] text-[#e8ebee]/45`}>Яндекс Карты</p>
              <div>
                <p className="text-[clamp(96px,13vw,200px)] font-light leading-[.8] tracking-[-.07em]">{b.rating}</p>
                <div className="mt-5 flex items-center gap-3"><span className="flex gap-1 text-[#6fb6ff]">{[0, 1, 2, 3, 4].map(k => <Star key={k} size={20} fill="currentColor" strokeWidth={0} />)}</span><span className="text-[16px] text-[#e8ebee]/65">{b.rev} оценки клиентов</span></div>
              </div>
              <p className="max-w-[380px] text-[15px] text-[#e8ebee]/50">Оценки ставят те, кто уже ездит в тишине и с ясными фарами.</p>
            </div>
          </Tile>
          <Tile className="sm:col-span-2">
            <p className={`${MONO} text-[11px] uppercase tracking-[.2em] text-[#0e1114]/45`}>Двери · пол · арки</p>
            <h3 className="mt-2 text-[30px] font-light tracking-[-.04em]">Шумоизоляция</h3>
            <MiniWave />
          </Tile>
          <Tile>
            <p className={`${MONO} text-[11px] uppercase tracking-[.2em] text-[#0e1114]/45`}>Оптика</p>
            <h3 className="mt-2 text-[26px] font-light tracking-[-.04em]">Полировка фар</h3>
            <motion.div aria-hidden="true" className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full" animate={{ background: ['radial-gradient(circle, #d9b552 0%, transparent 65%)', 'radial-gradient(circle, #ffffff 0%, #cfe6ff 30%, transparent 65%)'] }} transition={{ duration: 2.6, repeat: Infinity, repeatType: 'mirror' }} />
          </Tile>
          <Tile>
            <p className={`${MONO} text-[11px] uppercase tracking-[.2em] text-[#0e1114]/45`}>Колёса</p>
            <h3 className="mt-2 text-[26px] font-light tracking-[-.04em]">Шиномонтаж</h3>
            <motion.svg viewBox="0 0 48 48" className="absolute bottom-5 right-5 h-20 w-20" animate={{ rotate: 360 }} transition={{ duration: 6, repeat: Infinity, ease: 'linear' }} aria-hidden="true">
              <circle cx="24" cy="24" r="21" fill="none" stroke="#0e1114" strokeWidth="5" /><circle cx="24" cy="24" r="9" fill="none" stroke="#0e1114" strokeWidth="1.5" />{[0, 72, 144, 216, 288].map(a => <line key={a} x1="24" y1="15" x2="24" y2="5" stroke="#0e1114" strokeWidth="1.5" transform={`rotate(${a} 24 24)`} />)}
            </motion.svg>
          </Tile>
          <Tile dark className="sm:col-span-2">
            <p className={`${MONO} text-[11px] uppercase tracking-[.2em] text-[#e8ebee]/45`}>Кузов и салон</p>
            <h3 className="mt-2 text-[30px] font-light tracking-[-.04em]">Детейлинг-мойка</h3>
            <p className="mt-2 max-w-[380px] text-[15px] text-[#e8ebee]/55">Аккуратная ручная мойка с вниманием к деталям: проёмы, диски, стёкла.</p>
          </Tile>
          <Tile>
            <a href="#contact" className="flex h-full flex-col justify-between">
              <MapPin size={28} />
              <div><h3 className="text-[22px] font-medium leading-tight tracking-[-.03em]">Суражская, 10</h3><p className="mt-1 flex items-center gap-1 text-[14px] text-[#0e1114]/55">помещение 1 · маршрут <ArrowRight size={14} /></p></div>
            </a>
          </Tile>
          <Tile>
            <div className="flex h-full flex-col justify-between">
              <p className={`${MONO} text-[11px] uppercase tracking-[.2em] text-[#0e1114]/45`}>Работы до/после</p>
              <div className="flex flex-col gap-2">
                <a href={b.ig} target="_blank" rel="noopener" className="flex items-center justify-between rounded-full border border-[#0e1114]/15 px-4 py-2.5 text-[14px] font-medium hover:bg-[#0e1114] hover:text-white"><span className="flex items-center gap-2"><IG width={16} />Instagram</span><ArrowUpRight size={15} /></a>
                <a href={b.vk} target="_blank" rel="noopener" className="flex items-center justify-between rounded-full border border-[#0e1114]/15 px-4 py-2.5 text-[14px] font-medium hover:bg-[#0e1114] hover:text-white"><span className="flex items-center gap-2"><VK width={16} />ВКонтакте</span><ArrowUpRight size={15} /></a>
              </div>
            </div>
          </Tile>
        </div>
      </div>
    </section>
  )
}

/* ---------- booking ---------- */
const STEPS = ['Работы', 'Автомобиль', 'Контакты']
const WHEN = ['На этой неделе', 'На следующей', 'Пока узнать цену']
function Booking() {
  const bk = useBooking()
  const [step, setStep] = useState(0)
  const [car, setCar] = useState(''), [when, setWhen] = useState('')
  const [err, setErr] = useState('')
  const next = () => {
    if (step === 0 && bk.s.svc.trim().length < 3) return setErr('Опишите, что нужно сделать — или соберите визит выше.')
    if (step === 1 && (!car.trim() || !when)) return setErr('Укажите машину и когда удобно.')
    setErr(''); setStep(s => s + 1)
  }
  const onSubmit = e => { e.preventDefault(); if (step < 2) next(); else bk.submit() }
  const f = 'h-14 w-full rounded-none border-0 border-b border-[#e8ebee]/20 bg-transparent px-0 text-[18px] text-[#e8ebee] outline-none placeholder:text-[#e8ebee]/30 focus:border-[#6fb6ff]'
  return (
    <section id="book" className="px-5 py-24 md:px-10 md:py-32" style={{ background: BASE }}>
      <div className="mx-auto grid max-w-[1400px] gap-12 lg:grid-cols-[1fr_1.1fr]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className={`${MONO} text-[12px] uppercase tracking-[.2em] text-[#6fb6ff]`}>Запись</p>
          <h2 className="mt-3 text-[clamp(44px,6.6vw,108px)] font-light leading-[.9] tracking-[-.06em]"><LineReveal>Запишитесь</LineReveal><LineReveal delay={0.08} className="text-[#e8ebee]/45">в тишину</LineReveal></h2>
          <p className="mt-6 max-w-[400px] text-[16px] text-[#e8ebee]/55">Три коротких шага. Мастер перезвонит, уточнит модель и назовёт время работ.</p>
          <a href={'tel:' + tel(b.phone)} className="mt-6 inline-flex items-center gap-3 text-[clamp(24px,2.6vw,34px)] font-light tracking-[-.03em] hover:text-[#6fb6ff]"><Phone size={22} />{b.phone}</a>
        </div>
        <div className="rounded-[28px] border border-[#e8ebee]/10 bg-[#141920] p-6 md:p-10">
          <AnimatePresence mode="wait">
            {!bk.s.sent ? (
              <motion.form key="f" onSubmit={onSubmit} noValidate exit={{ opacity: 0 }}>
                <div className="mb-9 flex items-center gap-3" aria-label={`Шаг ${step + 1} из 3`}>
                  {STEPS.map((s, i) => (
                    <React.Fragment key={s}>
                      <span className={`${MONO} flex items-center gap-2 text-[12px] uppercase tracking-[.14em] ${i <= step ? 'text-[#e8ebee]' : 'text-[#e8ebee]/30'}`}>
                        <span className={`grid h-7 w-7 place-items-center rounded-full border text-[11px] ${i < step ? 'border-[#6fb6ff] bg-[#6fb6ff] text-[#0e1114]' : i === step ? 'border-[#e8ebee]' : 'border-[#e8ebee]/20'}`}>{i < step ? <Check size={13} /> : i + 1}</span>
                        <span className="hidden sm:inline">{s}</span>
                      </span>
                      {i < 2 && <span className="h-px flex-1 bg-[#e8ebee]/15" />}
                    </React.Fragment>
                  ))}
                </div>
                <AnimatePresence mode="wait">
                  <motion.div key={step} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.3 }} className="min-h-[230px]">
                    {step === 0 && (
                      <label className="grid gap-3"><span className="text-[22px] font-light tracking-[-.02em]">Что нужно сделать?</span>
                        <textarea rows={4} className="w-full resize-none rounded-[14px] border border-[#e8ebee]/15 bg-transparent p-4 text-[17px] text-[#e8ebee] outline-none placeholder:text-[#e8ebee]/30 focus:border-[#6fb6ff]" placeholder="Например: шумоизоляция дверей и полировка фар" value={bk.s.svc} onChange={e => bk.upd('svc', e.target.value)} />
                        <span className="text-[13px] text-[#e8ebee]/40">Подсказка: соберите визит в планировщике — список подставится сам.</span>
                      </label>
                    )}
                    {step === 1 && (
                      <div className="grid gap-6">
                        <label className="grid gap-1"><span className="text-[13px] text-[#e8ebee]/50">Марка и модель</span><input className={f} placeholder="Например, Volkswagen Passat B7" value={car} onChange={e => { setCar(e.target.value); setErr('') }} /></label>
                        <fieldset><legend className="mb-3 text-[13px] text-[#e8ebee]/50">Когда удобно</legend>
                          <div className="flex flex-wrap gap-2">{WHEN.map(w => <button type="button" key={w} aria-pressed={when === w} onClick={() => { setWhen(w); setErr('') }} className={`h-11 rounded-full border px-4 text-[14px] transition-colors ${when === w ? 'border-[#6fb6ff] bg-[#6fb6ff] text-[#0e1114]' : 'border-[#e8ebee]/15 text-[#e8ebee]/75 hover:border-[#e8ebee]/45'}`}>{w}</button>)}</div>
                        </fieldset>
                      </div>
                    )}
                    {step === 2 && (
                      <div className="grid gap-5">
                        <label className="grid gap-1"><span className="text-[13px] text-[#e8ebee]/50">Имя</span><input className={f} autoComplete="name" placeholder="Как к вам обращаться" value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} /></label>
                        <label className="grid gap-1"><span className="text-[13px] text-[#e8ebee]/50">Телефон</span>
                          <motion.input animate={bk.s.err ? { x: [0, -8, 8, -5, 5, 0] } : {}} className={f + (bk.s.err ? ' !border-red-400' : '')} type="tel" inputMode="tel" autoComplete="tel" placeholder="+375 __ ___-__-__" value={bk.s.phone} onFocus={phoneFocus(bk)} onChange={e => bk.upd('phone', e.target.value)} aria-invalid={bk.s.err} />
                        </label>
                        {bk.s.err && <p role="alert" className="text-[13px] text-red-300">Введите номер полностью: +375 и 9 цифр.</p>}
                        <p className={`${MONO} text-[11.5px] leading-relaxed text-[#e8ebee]/40`}>{bk.s.svc} · {car} · {when}</p>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
                {err && <p role="alert" className="mt-2 text-[13px] text-red-300">{err}</p>}
                <div className="mt-8 flex items-center justify-between">
                  {step > 0 ? <button type="button" onClick={() => { setErr(''); setStep(s => s - 1) }} className="inline-flex h-12 items-center gap-2 text-[14px] text-[#e8ebee]/60 hover:text-[#e8ebee]"><ArrowLeft size={16} />Назад</button> : <span />}
                  <button disabled={bk.s.loading} className="inline-flex h-14 items-center gap-2 rounded-full bg-[#e8ebee] px-8 text-[15px] font-semibold text-[#0e1114] hover:bg-white disabled:opacity-60">{step < 2 ? <>Дальше <ArrowRight size={17} /></> : bk.s.loading ? 'Отправляем…' : 'Отправить заявку'}</button>
                </div>
              </motion.form>
            ) : (
              <motion.div key="ok" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid min-h-[360px] place-items-center text-center">
                <div>
                  <CheckDraw className="mx-auto mb-6 text-[#6fb6ff]" size={84} />
                  <h3 className="text-[40px] font-light tracking-[-.04em]">Заявка у мастера</h3>
                  <p className="mx-auto mt-3 max-w-[360px] text-[#e8ebee]/55">В готовом сайте заявка сразу придёт вам в Telegram — с машиной и списком работ.</p>
                  <button onClick={() => { bk.reset(); setStep(0); setCar(''); setWhen('') }} className="mt-6 text-[14px] text-[#6fb6ff] underline underline-offset-4">Новая заявка</button>
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
    <section id="contact" className="px-5 pb-24 md:px-10 md:pb-32" style={{ background: BASE }}>
      <div className="mx-auto grid max-w-[1400px] gap-10 border-t border-[#e8ebee]/10 pt-16 lg:grid-cols-[.9fr_1.1fr]">
        <div>
          <p className={`${MONO} text-[12px] uppercase tracking-[.2em] text-[#e8ebee]/45`}>Контакты</p>
          <h2 className="mt-3 text-[clamp(36px,4.6vw,68px)] font-light leading-[.95] tracking-[-.05em]">Суражская, 10</h2>
          <p className="mt-3 flex items-start gap-2 text-[16px] text-[#e8ebee]/60"><MapPin size={18} className="mt-0.5 shrink-0" />{b.addr}, {b.city}</p>
          <a href={'tel:' + tel(b.phone)} className="mt-8 block text-[clamp(28px,3vw,42px)] font-light tracking-[-.03em] hover:text-[#6fb6ff]">{b.phone}</a>
          <div className="mt-6 flex flex-wrap gap-2">
            <a href={'tel:' + tel(b.phone)} className="inline-flex h-12 items-center gap-2 rounded-full bg-[#e8ebee] px-6 text-[14px] font-semibold text-[#0e1114]"><Phone size={16} />Позвонить</a>
            <a href={b.ig} target="_blank" rel="noopener" className="inline-flex h-12 items-center gap-2 rounded-full border border-[#e8ebee]/20 px-5 text-[14px] hover:border-[#e8ebee]/60"><IG width={16} />Instagram</a>
            <a href={b.vk} target="_blank" rel="noopener" className="inline-flex h-12 items-center gap-2 rounded-full border border-[#e8ebee]/20 px-5 text-[14px] hover:border-[#e8ebee]/60"><VK width={16} />ВКонтакте</a>
          </div>
        </div>
        <div className="h-[380px] overflow-hidden rounded-[26px] md:h-[460px]"><MapFrame oid={b.oid} dark /></div>
      </div>
    </section>
  )
}

function App() {
  useSmooth()
  const lite = useLite()
  return (
    <MotionConfig reducedMotion="user">
      <div className="overflow-x-clip font-['Onest',sans-serif]" style={{ background: BASE, color: INK, '--sel': ACC, '--selc': BASE }}>
        <Ribbon name={b.short} bg="#e8ebee" fg={BASE} />
        <header className="sticky top-0 z-40 border-b border-[#e8ebee]/10 bg-[#0e1114]/75 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 md:px-10">
            <a href="#top" className="flex items-baseline gap-2"><span className="text-[20px] font-semibold tracking-[-.04em]">Saniembar</span><span className={`${MONO} hidden text-[10.5px] uppercase tracking-[.18em] text-[#e8ebee]/45 sm:inline`}>detailing center</span></a>
            <nav className="hidden gap-8 text-[14px] text-[#e8ebee]/60 md:flex">{[['#silence', 'Шумоизоляция'], ['#lights', 'Фары'], ['#plan', 'Визит'], ['#contact', 'Контакты']].map(([h, t]) => <a key={h} href={h} className="hover:text-[#e8ebee]">{t}</a>)}</nav>
            <a href="#book" className="inline-flex h-10 items-center rounded-full bg-[#e8ebee] px-5 text-[14px] font-semibold text-[#0e1114]">Записаться</a>
          </div>
        </header>
        <main>
          <Hero />
          <DoorFilm lite={lite} />
          <LensFilm lite={lite} />
          <Planner />
          <Bento />
          <Booking />
          <Contact />
        </main>
        <footer className="border-t border-[#e8ebee]/10 px-5 py-8 text-[13px] text-[#e8ebee]/45 md:px-10">
          <div className="mx-auto flex max-w-[1400px] flex-wrap justify-between gap-4"><span>© 2026 {b.name} · Концепт сайта — Артём</span><span>{b.addr}</span></div>
        </footer>
        <CallBar phone={b.phone} barCls="bg-[#0e1114]/95 backdrop-blur border-t border-[#e8ebee]/10" callCls="rounded-full border border-[#e8ebee]/25 text-[#e8ebee]" bookCls="rounded-full bg-[#e8ebee] text-[#0e1114]" />
        <div className="h-[72px] sm:hidden" style={{ background: BASE }} />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
