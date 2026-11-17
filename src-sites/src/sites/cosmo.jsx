import React, { useRef, useState, useEffect, useMemo, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, useSpring, useInView, AnimatePresence, MotionConfig } from 'framer-motion'
import { ArrowRight, Phone, MapPin } from 'lucide-react'
import '../lib/base.css'
import { useSmooth, Ribbon, Reveal, useBooking, phoneFocus, CheckDraw, MapFrame, CallBar, tel, useLite } from '../lib/kit'

const Capsule = lazy(() => import('./cosmo3d'))

const b = { name: 'Cosmo', addr: 'ул. Лобанка, 14', floor: 'этаж 1', city: 'Минск', phone: '+375 29 777-16-61', rating: '4,9', rev: 115, oid: '1287197622' }
const RED = '#d71921', BLACK = '#000', PAPER = '#efefec'
const DOT = "font-['DotGothic16',monospace]", SANS = "font-['Inter_Tight',sans-serif]"

/* ---------------- dot-matrix canvas text ---------------- */
function DotText({ lines, color = '#fff', dim = 'rgba(255,255,255,.07)', className = '', maxCells = 22, label }) {
  const wrap = useRef(null), cv = useRef(null)
  const inView = useInView(wrap, { margin: '100px 0px' })
  const state = useRef({ grid: null, cols: 0, rows: 0, pitch: 8, t0: 0, mx: -1e4, my: -1e4 })
  const [h, setH] = useState(0)
  useEffect(() => {
    let dead = false
    const build = async () => {
      try { await document.fonts.ready } catch (e) {}
      if (dead || !wrap.current) return
      const W = wrap.current.clientWidth
      const pitch = W < 520 ? 5 : W < 900 ? 6.5 : 8
      const cols = Math.floor(W / pitch)
      const o = document.createElement('canvas'), x = o.getContext('2d')
      let size = maxCells
      const font = s => `800 ${s}px 'Inter Tight', sans-serif`
      x.font = font(100)
      const widest = Math.max(...lines.map(l => x.measureText(l).width)) / 100
      size = Math.max(7, Math.min(maxCells, Math.floor((cols * 0.98) / widest)))
      const lh = Math.ceil(size * 0.96), rows = lh * lines.length + 2
      o.width = cols; o.height = rows
      x.font = font(size); x.fillStyle = '#fff'; x.textBaseline = 'alphabetic'
      lines.forEach((l, i) => x.fillText(l, 0, Math.round(lh * (i + 1) - size * 0.14)))
      const d = x.getImageData(0, 0, cols, rows).data
      const grid = new Uint8Array(cols * rows), rnd = new Float32Array(cols * rows)
      for (let i = 0; i < cols * rows; i++) { grid[i] = d[i * 4 + 3] > 110 ? 1 : 0; rnd[i] = Math.random() }
      Object.assign(state.current, { grid, rnd, cols, rows, pitch, t0: performance.now() })
      const c = cv.current, dpr = Math.min(2, devicePixelRatio || 1)
      c.width = cols * pitch * dpr; c.height = rows * pitch * dpr; c.style.width = cols * pitch + 'px'; c.style.height = rows * pitch + 'px'
      c.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0)
      setH(rows * pitch)
    }
    build()
    const ro = new ResizeObserver(() => build()); ro.observe(wrap.current)
    return () => { dead = true; ro.disconnect() }
  }, [lines.join('|')])
  useEffect(() => {
    if (!inView) return
    let id
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const draw = now => {
      const s = state.current, c = cv.current
      if (s.grid && c) {
        const x = c.getContext('2d'), { cols, rows, pitch, grid, rnd } = s
        const t = reduce ? 9 : (now - s.t0) / 1000
        x.clearRect(0, 0, cols * pitch, rows * pitch)
        const r = pitch * 0.36
        for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
          const k = j * cols + i
          const cx = i * pitch + pitch / 2, cy = j * pitch + pitch / 2
          if (!grid[k]) continue
          const reveal = t * 1.6 - (i / cols) - rnd[k] * 0.35
          const dx = cx - s.mx, dy = cy - s.my, near = dx * dx + dy * dy < 2600
          if (reveal < 0) { x.fillStyle = dim } else x.fillStyle = near ? RED : (reveal < 0.08 ? RED : color)
          x.beginPath(); x.arc(cx, cy, near ? r * 1.15 : r, 0, 6.283); x.fill()
        }
      }
      id = requestAnimationFrame(draw)
    }
    id = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(id)
  }, [inView, color])
  const move = e => { const r = cv.current.getBoundingClientRect(); state.current.mx = e.clientX - r.left; state.current.my = e.clientY - r.top }
  return (
    <span ref={wrap} className={'relative block w-full ' + className} style={{ minHeight: h }} onPointerMove={move} onPointerLeave={() => { state.current.mx = -1e4 }}>
      <span className="sr-only">{label || lines.join(' ')}</span>
      <canvas ref={cv} aria-hidden="true" className="block" />
    </span>
  )
}

/* tiny LED glyph strip */
function Glyph({ n = 12, active = 0, className = '' }) {
  return <span className={'inline-flex gap-[3px] ' + className}>{Array.from({ length: n }, (_, i) => <span key={i} className="h-[5px] w-[5px] rounded-full" style={{ background: i < active ? (i === active - 1 ? RED : 'currentColor') : 'rgba(127,127,127,.3)' }} />)}</span>
}

/* ---------------- film ---------------- */
const CAP = [
  { n: '01', t: 'Ровный свет со всех сторон', d: 'Загар ложится ровно, когда свет окружает целиком.', r: [0.12, 0.32] },
  { n: '02', t: 'Время — по фототипу', d: 'Администратор подскажет длительность сеанса под вашу кожу.', r: [0.34, 0.54] },
  { n: '03', t: 'Шаг за шагом', d: 'Короткие регулярные сеансы — бережнее одного долгого.', r: [0.56, 0.78] },
  { n: '04', t: 'Ваш космос — на Лобанка, 14', d: 'Первый этаж. Запишитесь заранее — и приходите к своему времени.', r: [0.82, 1.05] },
]
function Cap({ p, c }) {
  const k = [c.r[0], c.r[0] + 0.04, c.r[1] - 0.04, c.r[1]]
  const o = useTransform(p, k, [0, 1, 1, 0]), y = useTransform(p, k, [24, 0, 0, -16])
  return (
    <motion.div style={{ opacity: o, y }} className={`pointer-events-none absolute inset-x-5 bottom-[96px] md:bottom-16 md:left-12 md:right-auto md:w-[460px] ${c.n === '04' ? 'md:left-12' : ''}`}>
      <div className="flex items-center gap-3 text-white/60"><span className={`${DOT} text-[13px]`} style={{ color: RED }}>{c.n}/04</span><Glyph n={4} active={+c.n} className="text-white" /></div>
      <h2 className={`${DOT} mt-3 text-[clamp(28px,3.4vw,46px)] leading-[1.05] text-white`}>{c.t}</h2>
      <p className="mt-3 max-w-[400px] text-[15.5px] leading-relaxed text-white/55">{c.d}</p>
    </motion.div>
  )
}
function Readout({ p }) {
  const [v, setV] = useState(0)
  useEffect(() => p.on('change', x => setV(Math.round(Math.min(1, Math.max(0, (x - 0.1) / 0.7)) * 10))), [p])
  return (
    <div className={`${DOT} pointer-events-none absolute right-5 top-[84px] text-right text-[12px] text-white/50 md:right-12 md:top-[100px]`}>
      <p>UV TUBES</p>
      <p className="mt-1 text-[28px] leading-none text-white">{String(v).padStart(2, '0')}<span className="text-white/30">/10</span></p>
      <Glyph n={10} active={v} className="mt-2 text-white" />
    </div>
  )
}
function LiteCapsule() {
  return (
    <div className="absolute left-1/2 top-[30%] h-[26vmin] w-[70vmin] -translate-x-1/2 rounded-full border border-white/30 md:left-[62%]">
      <div className="absolute inset-[14%] grid grid-rows-4 gap-2">{[0, 1, 2, 3].map(i => <div key={i} className="rounded-full bg-[radial-gradient(circle,#fff_1.5px,transparent_2px)] [background-size:9px_9px] opacity-80" />)}</div>
    </div>
  )
}
function Film({ lite }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.35 })
  const near = useInView(ref, { margin: '200px 0px' })
  const [m, setM] = useState(false)
  useEffect(() => { if (near) setM(true) }, [near])
  const heroO = useTransform(p, [0, 0.09], [1, 0]), heroY = useTransform(p, [0, 0.09], [0, -40])
  const heroPE = useTransform(p, v => (v < 0.05 ? 'auto' : 'none'))
  const rd = useTransform(p, [0.06, 0.12], [0, 1])
  return (
    <section ref={ref} id="top" className="relative h-[460vh] bg-black text-white">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-50 [background-image:radial-gradient(rgba(255,255,255,.12)_1px,transparent_1.3px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_60%_45%,black,transparent_70%)]" />
        <div className="absolute inset-0">{lite ? <LiteCapsule /> : m && <Suspense fallback={null}><Capsule progress={p} active={near} /></Suspense>}</div>
        <motion.div style={{ opacity: heroO, y: heroY, pointerEvents: heroPE }} className="absolute inset-x-0 bottom-[92px] px-5 md:bottom-auto md:left-12 md:right-auto md:top-[22%] md:w-[min(560px,44vw)] md:px-0">
          <p className={`${DOT} mb-5 flex items-center gap-2 text-[13px] text-white/60`}><span className="h-2 w-2 animate-pulse rounded-full" style={{ background: RED }} />СТУДИЯ ЗАГАРА · МИНСК</p>
          <h1><DotText lines={['КОСМОС', 'И СВЕТ']} maxCells={26} label="Космос и свет" /></h1>
          <p className="mt-6 max-w-[400px] text-[16px] leading-relaxed text-white/60 md:text-[17px]">Cosmo — студия загара на Лобанка, 14. Ровный загар в своём темпе.</p>
          <div className="mt-8 hidden gap-3 md:flex">
            <a href="#timer" className={`${DOT} inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-[15px] text-black hover:bg-white/85`}>Выбрать время сеанса</a>
            <a href="#book" className={`${DOT} inline-flex h-12 items-center gap-2 rounded-full border border-white/25 px-6 text-[15px] hover:border-white`}><span className="h-2 w-2 rounded-full" style={{ background: RED }} />Записаться</a>
          </div>
        </motion.div>
        <motion.div style={{ opacity: rd }}><Readout p={p} /></motion.div>
        {CAP.map(c => <Cap key={c.n} p={p} c={c} />)}
      </div>
    </section>
  )
}

/* ---------------- glyph dial timer (value interaction) ---------------- */
const MIN = 3, MAX = 20, TICKS = 60
function Dial({ value, setValue }) {
  const ref = useRef(null), drag = useRef(false)
  const fromPoint = e => {
    const r = ref.current.getBoundingClientRect()
    const a = Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) + Math.PI / 2
    const t = ((a / (Math.PI * 2)) + 1) % 1
    setValue(Math.max(MIN, Math.min(MAX, Math.round(MIN + t * (MAX - MIN)))))
  }
  const vr = useRef(value); vr.current = value
  useEffect(() => {
    const el = ref.current
    const w = e => { e.preventDefault(); setValue(Math.max(MIN, Math.min(MAX, vr.current + (e.deltaY < 0 ? 1 : -1)))) }
    el.addEventListener('wheel', w, { passive: false }); return () => el.removeEventListener('wheel', w)
  }, [])
  const frac = (value - MIN) / (MAX - MIN)
  const litN = Math.round(frac * (TICKS - 1)) + 1
  const ang = frac * Math.PI * 2 - Math.PI / 2
  return (
    <div ref={ref} role="slider" tabIndex={0} aria-label="Желаемое время сеанса, минут" aria-valuemin={MIN} aria-valuemax={MAX} aria-valuenow={value}
      onKeyDown={e => { if (['ArrowUp', 'ArrowRight'].includes(e.key)) { e.preventDefault(); setValue(Math.min(MAX, value + 1)) } if (['ArrowDown', 'ArrowLeft'].includes(e.key)) { e.preventDefault(); setValue(Math.max(MIN, value - 1)) } }}
      onPointerDown={e => { drag.current = true; e.currentTarget.setPointerCapture(e.pointerId); fromPoint(e) }}
      onPointerMove={e => drag.current && fromPoint(e)} onPointerUp={() => (drag.current = false)} onPointerCancel={() => (drag.current = false)}
      className="relative mx-auto aspect-square w-[min(84vw,440px)] cursor-grab touch-none select-none rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#d71921] active:cursor-grabbing" data-lenis-prevent>
      <svg viewBox="-110 -110 220 220" className="absolute inset-0 h-full w-full">
        {Array.from({ length: TICKS }, (_, i) => {
          const a = (i / TICKS) * Math.PI * 2 - Math.PI / 2, on = i < litN, head = i === litN - 1
          return <circle key={i} cx={Math.cos(a) * 96} cy={Math.sin(a) * 96} r={head ? 4.2 : i % 5 === 0 ? 3 : 2.2} fill={head ? RED : on ? '#000' : 'rgba(0,0,0,.14)'} />
        })}
        {Array.from({ length: 36 }, (_, i) => { const a = (i / 36) * Math.PI * 2; return <circle key={'i' + i} cx={Math.cos(a) * 80} cy={Math.sin(a) * 80} r="1" fill="rgba(0,0,0,.18)" /> })}
        <line x1="0" y1="0" x2={Math.cos(ang) * 70} y2={Math.sin(ang) * 70} stroke="rgba(0,0,0,.12)" strokeWidth="1" strokeDasharray="2 3" />
        <circle cx={Math.cos(ang) * 80} cy={Math.sin(ang) * 80} r="7" fill={RED} />
      </svg>
      <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
        <div>
          <AnimatePresence mode="popLayout"><motion.p key={value} initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }} transition={{ duration: 0.18 }} className={`${DOT} text-[clamp(84px,18vw,150px)] leading-none tracking-[-0.02em]`}>{String(value).padStart(2, '0')}</motion.p></AnimatePresence>
          <p className={`${DOT} mt-1 text-[13px] text-black/50`}>МИН · ПОЖЕЛАНИЕ</p>
        </div>
      </div>
    </div>
  )
}
function Timer({ onBook }) {
  const [v, setV] = useState(8)
  const [first, setFirst] = useState(false)
  return (
    <section id="timer" className="relative px-5 py-24 md:px-12 md:py-36" style={{ background: PAPER, color: BLACK }}>
      <div className="mx-auto grid max-w-[1240px] items-center gap-14 lg:grid-cols-[1fr_1fr]">
        <div>
          <p className={`${DOT} flex items-center gap-2 text-[13px] text-black/55`}><span className="h-2 w-2 rounded-full" style={{ background: RED }} />ТАЙМЕР СЕАНСА</p>
          <div className="mt-6"><DotText lines={['ПОВЕРНИТЕ', 'ЦИФЕРБЛАТ']} color="#000" dim="rgba(0,0,0,.07)" maxCells={18} label="Поверните циферблат" /></div>
          <p className="mt-6 max-w-[440px] text-[16px] leading-relaxed text-black/60">Отметьте, сколько хотели бы загорать, — мы передадим это администратору вместе с заявкой. Тяните точку по кругу, крутите колесо или стрелки.</p>
          <div className="mt-8 flex items-start gap-4 rounded-[18px] border border-black/10 bg-white p-5">
            <span className={`${DOT} grid h-9 w-9 shrink-0 place-items-center rounded-full text-[15px] text-white`} style={{ background: RED }}>!</span>
            <p className="text-[15px] leading-relaxed"><b className="font-semibold">Точное время подберёт администратор по фототипу.</b> <span className="text-black/60">Цифра на циферблате — только ваше пожелание, а не рекомендация.</span></p>
          </div>
          <label className="mt-5 flex cursor-pointer items-center gap-3 text-[15px]">
            <button type="button" role="switch" aria-checked={first} onClick={() => setFirst(!first)} className={`relative h-7 w-12 rounded-full transition-colors ${first ? 'bg-black' : 'bg-black/15'}`}><span className={`absolute top-1 h-5 w-5 rounded-full transition-all ${first ? 'left-6' : 'left-1'}`} style={{ background: first ? RED : '#fff' }} /></button>
            Я впервые в солярии
          </label>
          {first && <p className="mt-2 pl-[60px] text-[14px] text-black/55">Отлично — начнём со знакомства: администратор расскажет, как подготовиться.</p>}
        </div>
        <div>
          <Dial value={v} setValue={setV} />
          <div className="mt-8 flex justify-center">
            <button type="button" onClick={() => onBook(`Сеанс ~${v} мин${first ? ', первый визит' : ''} (время уточнит администратор)`)} className={`${DOT} inline-flex h-14 items-center gap-3 rounded-full bg-black px-8 text-[16px] text-white hover:bg-black/85`}><span className="h-2.5 w-2.5 rounded-full" style={{ background: RED }} />Забронировать {v} мин</button>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- bento ---------------- */
function LedPanel() {
  const [t, setT] = useState(0)
  const ref = useRef(null), on = useInView(ref)
  useEffect(() => { if (!on) return; const id = setInterval(() => setT(x => x + 1), 120); return () => clearInterval(id) }, [on])
  const C = 16, R = 8
  return (
    <div ref={ref} className="grid gap-[5px]" style={{ gridTemplateColumns: `repeat(${C},1fr)` }}>
      {Array.from({ length: C * R }, (_, k) => {
        const i = k % C, j = (k / C) | 0
        const wave = Math.sin(i * 0.55 - t * 0.35) * 3 + 3.5
        const lit = R - 1 - j < wave
        return <span key={k} className="aspect-square rounded-full" style={{ background: lit ? (R - 1 - j > wave - 1 ? RED : '#fff') : 'rgba(255,255,255,.08)' }} />
      })}
    </div>
  )
}
function Card({ children, className = '' }) {
  return <Reveal className={`relative overflow-hidden rounded-[24px] border border-white/10 bg-[#0d0d0d] p-6 md:p-7 ${className}`}>{children}</Reveal>
}
function Bento() {
  return (
    <section id="about" className="bg-black px-5 py-24 text-white md:px-12 md:py-32">
      <div className="mx-auto max-w-[1240px]">
        <div className="mb-12 max-w-[760px]"><DotText lines={['ТЕХНИЧЕСКИ', 'О ЗАГАРЕ']} maxCells={16} label="Технически о загаре" /></div>
        <div className="grid auto-rows-[minmax(210px,auto)] gap-4 md:grid-cols-4">
          <Card className="md:col-span-2 md:row-span-2">
            <p className={`${DOT} text-[13px] text-white/50`}>РЕЙТИНГ · ЯНДЕКС КАРТЫ</p>
            <p className={`${DOT} mt-auto pt-10 text-[clamp(110px,14vw,190px)] leading-none`}>{b.rating}</p>
            <div className="mt-4 flex items-center gap-4"><Glyph n={5} active={5} className="text-white" /><span className="text-[15px] text-white/55">{b.rev} оценок</span></div>
          </Card>
          <Card className="md:col-span-2">
            <p className={`${DOT} text-[13px] text-white/50`}>СВЕТ · ВИЗУАЛИЗАЦИЯ</p>
            <div className="mt-6"><LedPanel /></div>
          </Card>
          <Card>
            <p className={`${DOT} text-[13px]`} style={{ color: RED }}>ПРАВИЛО 01</p>
            <p className={`${DOT} mt-auto pt-10 text-[22px] leading-tight`}>Очки — всегда</p>
            <p className="mt-2 text-[14px] text-white/55">Глазам нужна защита. Спросите у администратора.</p>
          </Card>
          <Card>
            <p className={`${DOT} text-[13px]`} style={{ color: RED }}>ПРАВИЛО 02</p>
            <p className={`${DOT} mt-auto pt-10 text-[22px] leading-tight`}>Без спешки</p>
            <p className="mt-2 text-[14px] text-white/55">Между сеансами коже нужен отдых.</p>
          </Card>
          <Card className="md:col-span-2">
            <p className={`${DOT} text-[13px] text-white/50`}>КООРДИНАТЫ</p>
            <p className={`${DOT} mt-auto pt-10 text-[clamp(26px,3vw,40px)] leading-tight`}>{b.addr}</p>
            <p className="mt-1 text-[15px] text-white/55">{b.floor[0].toUpperCase() + b.floor.slice(1)} · {b.city}</p>
          </Card>
          <Card className="md:col-span-2">
            <p className={`${DOT} text-[13px] text-white/50`}>СВЯЗЬ</p>
            <a href={'tel:' + tel(b.phone)} className={`${DOT} mt-auto block pt-10 text-[clamp(26px,3vw,40px)] leading-tight hover:text-[#d71921]`}>{b.phone}</a>
            <p className="mt-1 text-[15px] text-white/55">Звоните — подберём удобное время</p>
          </Card>
        </div>
      </div>
    </section>
  )
}

/* ---------------- booking ---------------- */
const RU_D = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ']
const PARTS = ['Утро', 'День', 'Вечер', 'Любое']
function Book({ svc }) {
  const bk = useBooking()
  const [step, setStep] = useState(0), [day, setDay] = useState(null), [part, setPart] = useState(null), [err, setErr] = useState('')
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i); return { i, w: i === 0 ? 'СЕГОДНЯ' : i === 1 ? 'ЗАВТРА' : RU_D[d.getDay()], n: d.getDate() } }), [])
  useEffect(() => { if (svc) bk.upd('svc', svc) }, [svc])
  const next = e => {
    e.preventDefault()
    if (step === 0 && day == null) return setErr('Выберите день')
    if (step === 1 && !part) return setErr('Выберите время суток')
    setErr('')
    if (step < 2) setStep(step + 1)
    else { bk.set(p => ({ ...p, svc: [p.svc || 'Сеанс загара', days[day].w, part].join(' · ') })); bk.submit() }
  }
  const T = ['КОГДА?', 'ВО СКОЛЬКО?', 'КУДА ПЕРЕЗВОНИТЬ?']
  const P = s => `${DOT} h-12 rounded-full px-5 text-[15px] transition-colors ${s ? 'bg-black text-white' : 'border border-black/15 bg-white hover:border-black'}`
  return (
    <section id="book" className="px-5 py-24 md:px-12 md:py-32" style={{ background: PAPER, color: BLACK }}>
      <div className="mx-auto grid max-w-[1240px] gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <DotText lines={['ЗАПИСЬ', 'НА СЕАНС']} color="#000" dim="rgba(0,0,0,.07)" maxCells={18} label="Запись на сеанс" />
          <p className="mt-6 max-w-[380px] text-[16px] text-black/60">Три шага. Администратор перезвонит, уточнит фототип и подтвердит время.</p>
          {bk.s.svc && !bk.s.sent && <p className={`${DOT} mt-6 inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-[13px] text-white`}><span className="h-2 w-2 rounded-full" style={{ background: RED }} />{bk.s.svc}</p>}
        </div>
        <div className="rounded-[28px] bg-white p-6 md:p-10">
          {bk.s.sent ? (
            <div className="py-10 text-center" role="status">
              <CheckDraw className="mx-auto" />
              <p className={`${DOT} mt-6 text-[28px]`}>ЗАЯВКА ПРИНЯТА</p>
              <p className="mx-auto mt-3 max-w-[380px] text-black/60">Администратор перезвонит и подберёт время сеанса. В готовом сайте заявка сразу придёт вам в Telegram.</p>
              <button type="button" onClick={() => { bk.reset(); setStep(0); setDay(null); setPart(null) }} className="mt-8 text-[14px] text-black/55 underline underline-offset-4">Новая заявка</button>
            </div>
          ) : (
            <form onSubmit={next} noValidate>
              <div className="flex items-center justify-between"><Glyph n={3} active={step + 1} className="text-black" /><span className={`${DOT} text-[13px] text-black/45`}>ШАГ {step + 1}/3</span></div>
              <h3 className={`${DOT} mt-6 text-[28px]`}>{T[step]}</h3>
              <AnimatePresence mode="wait">
                <motion.div key={step} className="mt-6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                  {step === 0 && <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">{days.map(d => (
                    <button key={d.i} type="button" aria-pressed={day === d.i} onClick={() => { setDay(d.i); setErr('') }} className={`${DOT} flex h-20 flex-col items-center justify-center rounded-[16px] transition-colors ${day === d.i ? 'bg-black text-white' : 'border border-black/10 hover:border-black'}`}>
                      <span className="text-[10.5px] opacity-60">{d.w}</span><span className="text-[26px] leading-none">{d.n}</span>
                    </button>))}</div>}
                  {step === 1 && <div className="flex flex-wrap gap-2.5">{PARTS.map(x => <button key={x} type="button" aria-pressed={part === x} onClick={() => { setPart(x); setErr('') }} className={P(part === x)}>{x}</button>)}</div>}
                  {step === 2 && <div className="space-y-3">
                    <input value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} autoComplete="name" placeholder="Имя" aria-label="Имя" className="h-14 w-full rounded-[14px] border border-black/12 bg-[#f6f6f4] px-5 text-[16px] outline-none focus:border-black" />
                    <input value={bk.s.phone} onChange={e => bk.upd('phone', e.target.value)} onFocus={phoneFocus(bk)} type="tel" inputMode="tel" autoComplete="tel" placeholder="+375 __ ___-__-__" aria-label="Телефон" aria-invalid={bk.s.err}
                      className={`h-14 w-full rounded-[14px] border bg-[#f6f6f4] px-5 text-[16px] outline-none focus:border-black ${bk.s.err ? 'border-[#d71921]' : 'border-black/12'}`} />
                    {bk.s.err && <p className="text-[14px]" style={{ color: RED }}>Проверьте номер — 12 цифр с кодом +375.</p>}
                  </div>}
                </motion.div>
              </AnimatePresence>
              {err && <p className="mt-4 text-[14px]" style={{ color: RED }} role="alert">{err}</p>}
              <div className="mt-9 flex items-center justify-between">
                {step > 0 ? <button type="button" onClick={() => setStep(step - 1)} className={`${DOT} text-[14px] text-black/55 hover:text-black`}>← НАЗАД</button> : <span />}
                <button type="submit" disabled={bk.s.loading} className={`${DOT} inline-flex h-12 items-center gap-2 rounded-full bg-black px-7 text-[15px] text-white disabled:opacity-60`}>{step < 2 ? 'ДАЛЬШЕ' : bk.s.loading ? 'ОТПРАВКА…' : 'ЗАПИСАТЬСЯ'} <ArrowRight size={16} /></button>
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
    <section id="contact" className="bg-black px-5 py-24 text-white md:px-12">
      <div className="mx-auto grid max-w-[1240px] gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <DotText lines={['КОНТАКТЫ']} maxCells={16} />
          <p className="mt-8 flex items-start gap-3 text-[18px]"><MapPin size={19} className="mt-1 shrink-0" style={{ color: RED }} />{b.addr}, {b.floor}, {b.city}</p>
          <a href={'tel:' + tel(b.phone)} className={`${DOT} mt-5 flex items-center gap-3 text-[28px] hover:text-[#d71921]`}><Phone size={20} style={{ color: RED }} />{b.phone}</a>
          <a href="#book" className={`${DOT} mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-[15px] text-black hover:bg-white/85`}><span className="h-2 w-2 rounded-full" style={{ background: RED }} />Записаться</a>
        </div>
        <div className="h-[380px] overflow-hidden rounded-[24px] border border-white/10 md:h-[440px]"><MapFrame oid={b.oid} dark /></div>
      </div>
    </section>
  )
}

function App() {
  useSmooth()
  const lite = useLite()
  const [svc, setSvc] = useState('')
  const onBook = s => { setSvc(s); const el = document.getElementById('book'); window.__lenis ? window.__lenis.scrollTo(el, { offset: -60 }) : el?.scrollIntoView() }
  return (
    <MotionConfig reducedMotion="user">
      <div className={`overflow-x-clip ${SANS}`} style={{ background: BLACK, color: '#fff', '--sel': RED, '--selc': '#fff' }}>
        <Ribbon name={b.name} bg={PAPER} fg="#000" />
        <header className="sticky top-0 z-40 border-b border-white/10 bg-black/70 backdrop-blur-xl">
          <div className="mx-auto flex h-14 max-w-[1240px] items-center justify-between px-5 md:px-12">
            <a href="#top" className={`${DOT} flex items-center gap-2 text-[20px] tracking-[.12em]`}>COSMO<span className="h-1.5 w-1.5 rounded-full" style={{ background: RED }} /></a>
            <nav className={`${DOT} hidden gap-8 text-[13px] text-white/55 md:flex`}>{[['#timer', 'ТАЙМЕР'], ['#about', 'О ЗАГАРЕ'], ['#book', 'ЗАПИСЬ'], ['#contact', 'КОНТАКТЫ']].map(([h, t]) => <a key={h} href={h} className="hover:text-white">{t}</a>)}</nav>
            <a href={'tel:' + tel(b.phone)} className={`${DOT} hidden text-[14px] hover:text-[#d71921] sm:inline`}>{b.phone}</a>
          </div>
        </header>
        <main>
          <Film lite={lite} />
          <Timer onBook={onBook} />
          <Bento />
          <Book svc={svc} />
          <Contact />
        </main>
        <footer className={`${DOT} bg-black px-5 py-8 text-[12.5px] text-white/40 md:px-12`}>
          <div className="mx-auto flex max-w-[1240px] flex-wrap justify-between gap-3 border-t border-white/10 pt-6"><span>© 2026 {b.name} · Концепт сайта — Артём</span><span>{b.addr}, {b.floor}</span></div>
        </footer>
        <CallBar phone={b.phone} barCls="bg-black/85 backdrop-blur-xl border-t border-white/10" callCls={`rounded-full border border-white/25 text-white ${DOT} font-normal`} bookCls={`rounded-full bg-white text-black ${DOT} font-normal`} />
        <div className="h-[72px] bg-black sm:hidden" />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
