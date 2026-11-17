import React, { useRef, useState, useEffect, useMemo, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, useSpring, useInView, AnimatePresence, MotionConfig } from 'framer-motion'
import { ArrowRight, Phone, MapPin, MessageCircle, Check } from 'lucide-react'
import '../lib/base.css'
import { useSmooth, Ribbon, LineReveal, Reveal, Scramble, useBooking, phoneFocus, CheckDraw, MapFrame, CallBar, tel, useLite, IG } from '../lib/kit'

const PrismScene = lazy(() => import('./manic3d'))

const b = {
  name: 'Маник', addr: 'просп. Газеты Правда, 1', floor: 'этаж 1', city: 'Минск',
  phone: '+375 44 555-10-30', viber: 'viber://chat?number=%2B375445551030',
  ig: 'https://www.instagram.com/manic_beautystudio', vk: 'https://vk.ru/manic_beautystudio', rating: '5,0', rev: 59, oid: '17301802324',
}
const SANS = "font-['Geist','Inter',sans-serif]", MONO = "font-['Geist_Mono',ui-monospace,monospace]"
const GRAD = 'linear-gradient(180deg,#fff 30%,rgba(255,255,255,.55))'
const VK = p => (<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" {...p}><path d="M12.8 17.5c-5.5 0-8.6-3.8-8.8-10h2.8c.1 4.6 2.1 6.5 3.7 6.9V7.5h2.6v4c1.6-.2 3.2-2 3.8-4h2.6c-.4 2.4-2.2 4.2-3.5 5 1.3.6 3.3 2.2 4.1 5h-2.9c-.6-1.9-2.1-3.4-4.1-3.6v3.6h-.3Z" /></svg>)

/* corner crosses for grid frames */
function Cross({ className = '' }) {
  return <span aria-hidden="true" className={'pointer-events-none absolute h-[15px] w-[15px] ' + className}><span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/50" /><span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-white/50" /></span>
}
function Frame({ children, className = '' }) {
  return (
    <div className={'relative border border-white/[.12] ' + className}>
      <Cross className="-left-[8px] -top-[8px]" /><Cross className="-right-[8px] -top-[8px]" /><Cross className="-bottom-[8px] -left-[8px]" /><Cross className="-bottom-[8px] -right-[8px]" />
      {children}
    </div>
  )
}
function Label({ n, children }) { return <p className={`${MONO} text-[12px] uppercase tracking-[.08em] text-white/50`}><span className="text-white">{n}</span> / {children}</p> }
function Rule() {
  return <motion.div aria-hidden="true" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1.2, ease: [0.2, 0, 0, 1] }} className="h-px origin-left bg-white/[.14]" />
}

/* ---------------- pinned film ---------------- */
const CH = [
  { n: '01', k: 'Геометрия', t: 'Всё начинается с точной линии.', r: [0.1, 0.24] },
  { n: '02', k: 'Форма', t: 'Треугольник становится миндалём — форму выводим по вашей руке.', r: [0.24, 0.5] },
  { n: '03', k: 'Покрытие', t: 'Ровный тонкий слой и аккуратная линия у кутикулы.', r: [0.5, 0.72] },
  { n: '04', k: 'Финиш', t: 'Блик ложится ровно — как по линейке.', r: [0.72, 0.97] },
]
function Caption({ p, c }) {
  const k = [c.r[0], c.r[0] + 0.03, c.r[1] - 0.03, c.r[1]]
  const o = useTransform(p, k, [0, 1, 1, 0])
  const y = useTransform(p, k, [16, 0, 0, -12])
  const f = useTransform(p, k, ['blur(6px)', 'blur(0px)', 'blur(0px)', 'blur(6px)'])
  return (
    <motion.div style={{ opacity: o, y, filter: f }} className="absolute inset-x-0 bottom-0 text-center">
      <p className={`${MONO} text-[12px] uppercase tracking-[.1em] text-white/50`}><span className="text-white">{c.n}</span> / 04 · {c.k}</p>
      <p className={`${SANS} mx-auto mt-3 max-w-[560px] px-5 text-[clamp(22px,2.6vw,34px)] font-semibold leading-[1.15] tracking-[-0.04em]`}>{c.t}</p>
    </motion.div>
  )
}
function Readout({ p }) {
  const morph = useTransform(p, v => String(Math.round(Math.min(1, Math.max(0, (v - 0.22) / 0.28)) * 100)).padStart(3, '0') + '%')
  const angle = useTransform(p, v => (60 + Math.min(1, Math.max(0, (v - 0.22) / 0.28)) * 18).toFixed(1) + '°')
  const coat = useTransform(p, v => (Math.min(1, Math.max(0, (v - 0.5) / 0.16))).toFixed(2))
  const o = useTransform(p, [0.08, 0.14, 0.95, 1], [0, 1, 1, 0])
  const rows = [['форма', morph], ['угол кончика', angle], ['покрытие', coat]]
  return (
    <motion.div style={{ opacity: o }} className={`${MONO} pointer-events-none absolute right-10 top-[18%] hidden w-[220px] text-[12px] lg:block`}>
      <p className="mb-3 uppercase tracking-[.1em] text-white/40">параметры</p>
      {rows.map(([l, v]) => <div key={l} className="flex justify-between border-t border-white/10 py-2.5"><span className="text-white/50">{l}</span><motion.span className="tabular-nums">{v}</motion.span></div>)}
    </motion.div>
  )
}
function LitePrism() {
  return <div className="absolute left-1/2 top-[52%] h-[30vmin] w-[34vmin] -translate-x-1/2 -translate-y-1/2 border border-white/60 bg-white/10 [clip-path:polygon(50%_0,100%_100%,0_100%)]" />
}
function Film({ lite }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.35 })
  const near = useInView(ref, { margin: '300px 0px' })
  const [mounted, setMounted] = useState(false)
  useEffect(() => { if (near) setMounted(true) }, [near])
  const heroO = useTransform(p, [0, 0.08], [1, 0])
  const heroY = useTransform(p, [0, 0.08], [0, -40])
  const heroPE = useTransform(p, v => (v < 0.05 ? 'auto' : 'none'))
  const gridS = useTransform(p, [0, 1], [1, 1.25])
  const bar = useTransform(p, [0, 1], ['0%', '100%'])
  return (
    <section ref={ref} id="top" className="relative h-[420vh] bg-black">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <motion.div aria-hidden="true" style={{ scale: gridS }} className="absolute inset-0">
          <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.07) 1px,transparent 1px)', backgroundSize: '64px 64px', backgroundPosition: 'center center', maskImage: 'radial-gradient(ellipse 60% 55% at 50% 55%,#000 30%,transparent 80%)', WebkitMaskImage: 'radial-gradient(ellipse 60% 55% at 50% 55%,#000 30%,transparent 80%)' }} />
        </motion.div>
        <div className="absolute inset-0">{lite ? <LitePrism /> : mounted && <Suspense fallback={null}><PrismScene progress={p} active={near} /></Suspense>}</div>
        <motion.div style={{ opacity: heroO, y: heroY, pointerEvents: heroPE }} className="absolute inset-x-0 bottom-[100px] px-5 text-center md:bottom-auto md:top-[11%]">
          <p className={`${MONO} inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-[12px] text-white/70`}><span className="h-1.5 w-1.5 rounded-full bg-white" />Ногтевая студия · {b.addr}</p>
          <h1 className={`${SANS} mx-auto mt-6 max-w-[1000px] text-[clamp(42px,7.2vw,112px)] font-semibold leading-[.95] tracking-[-0.06em]`}>
            <LineReveal delay={0.1}><span className="bg-clip-text text-transparent" style={{ backgroundImage: GRAD }}>Маникюр,</span></LineReveal>
            <LineReveal delay={0.2}><span className="bg-clip-text text-transparent" style={{ backgroundImage: GRAD }}>выверенный до линии.</span></LineReveal>
          </h1>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="mt-8 hidden justify-center gap-3 md:flex">
            <a href="#build" className={`${SANS} inline-flex h-12 items-center gap-2 rounded-md bg-white px-5 text-[15px] font-medium text-black hover:bg-white/85`}>Собрать визит <ArrowRight size={16} /></a>
            <a href="#book" className={`${SANS} inline-flex h-12 items-center rounded-md border border-white/20 px-5 text-[15px] font-medium hover:bg-white/10`}>Записаться</a>
          </motion.div>
        </motion.div>
        <div className="pointer-events-none absolute inset-x-0 bottom-[100px] h-[130px] md:bottom-16">{CH.map(c => <Caption key={c.n} p={p} c={c} />)}</div>
        <Readout p={p} />
        <div className={`${MONO} pointer-events-none absolute left-10 top-[18%] hidden text-[12px] text-white/40 lg:block`}>
          <p>rating {b.rating}</p><p>{b.rev} оценок</p>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-[76px] h-px bg-white/10 md:bottom-0"><motion.div style={{ width: bar }} className="h-full bg-white" /></div>
      </div>
    </section>
  )
}

/* ---------------- build log (value interaction) ---------------- */
const OPT = {
  removal: { t: 'Снятие покрытия', m: 15 },
  shape: { t: 'Маникюр и форма', m: 40 },
  coat: [{ t: 'Без покрытия', m: 0 }, { t: 'Гель-лак', m: 40 }, { t: 'Укрепление + гель-лак', m: 55 }],
  design: [{ t: 'Без дизайна', m: 0 }, { t: 'Минимал', m: 10 }, { t: 'Сложный дизайн', m: 30 }],
}
const fmtMin = m => { const h = Math.floor(m / 60), r = m % 60; return h ? `${h} ч${r ? ' ' + r + ' мин' : ''}` : `${r} мин` }
function Seg({ on, items, value, onChange, label }) {
  return (
    <div className="border-t border-black/10 py-5">
      <p className={`${MONO} mb-3 text-[12px] uppercase tracking-[.08em] text-black/50`}>{label}</p>
      <div className="grid grid-cols-3 rounded-md border border-black/15 p-1">
        {items.map((it, i) => <button key={it.t} type="button" aria-pressed={value === i} onClick={() => onChange(i)} className={`${SANS} min-h-10 rounded-[5px] px-2 py-2 text-[13.5px] font-medium leading-tight transition-colors ${value === i ? 'bg-black text-white' : 'text-black/60 hover:text-black'}`}>{it.t}</button>)}
      </div>
    </div>
  )
}
function Toggle({ on, onClick, t, m }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={onClick} className="flex w-full items-center justify-between border-t border-black/10 py-5 text-left">
      <span className="flex items-center gap-3">
        <span className={`grid h-5 w-5 place-items-center rounded-[4px] border transition-colors ${on ? 'border-black bg-black text-white' : 'border-black/30'}`}>{on && <Check size={13} strokeWidth={3} />}</span>
        <span className={`${SANS} text-[16px] font-medium`}>{t}</span>
      </span>
      <span className={`${MONO} text-[13px] text-black/50`}>~{m} мин</span>
    </button>
  )
}
function hash(s) { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) } return (h >>> 0).toString(16).slice(0, 7) }
function Build() {
  const [removal, setRemoval] = useState(true), [shape, setShape] = useState(true), [coat, setCoat] = useState(1), [design, setDesign] = useState(1)
  const steps = useMemo(() => {
    const s = []
    if (removal) s.push(OPT.removal)
    if (shape) s.push(OPT.shape)
    if (coat) s.push(OPT.coat[coat])
    if (design) s.push(OPT.design[design])
    return s
  }, [removal, shape, coat, design])
  const total = steps.reduce((a, s) => a + s.m, 0)
  const id = hash(steps.map(s => s.t).join('|'))
  const [shown, setShown] = useState(0), [run, setRun] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-20% 0px' })
  useEffect(() => {
    if (!inView) return
    setShown(0)
    let i = 0
    const t = setInterval(() => { i++; setShown(i); if (i > steps.length + 1) clearInterval(t) }, 380)
    return () => clearInterval(t)
  }, [inView, run, id])
  const done = shown > steps.length + 1
  const book = () => {
    const svc = steps.map(s => s.t).join(' + ') || 'Консультация'
    window.dispatchEvent(new CustomEvent('manic-svc', { detail: svc }))
    const el = document.getElementById('book'); window.__lenis ? window.__lenis.scrollTo(el, { offset: -60 }) : el.scrollIntoView()
  }
  let acc = 0
  return (
    <section id="build" ref={ref} className="bg-white px-5 py-24 text-black md:px-10 md:py-32">
      <div className="mx-auto max-w-[1200px]">
        <p className={`${MONO} text-[12px] uppercase tracking-[.08em] text-black/50`}><span className="text-black">02</span> / Сборка визита</p>
        <div className="mt-4 grid gap-6 md:grid-cols-2 md:items-end">
          <h2 className={`${SANS} text-[clamp(38px,5.4vw,80px)] font-semibold leading-[.95] tracking-[-0.06em]`}>Соберите маникюр.<br /><span className="text-black/40">Как деплой.</span></h2>
          <p className="max-w-[420px] text-[16px] leading-relaxed text-black/60 md:justify-self-end">Выберите шаги — лог покажет, из чего сложится визит и сколько он примерно займёт. Точное время подскажет мастер.</p>
        </div>
        <div className="mt-14 grid border border-black/15 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="p-6 md:p-8 lg:border-r lg:border-black/15">
            <p className={`${MONO} pb-4 text-[12px] uppercase tracking-[.08em] text-black/50`}>config</p>
            <Toggle on={removal} onClick={() => setRemoval(v => !v)} {...OPT.removal} />
            <Toggle on={shape} onClick={() => setShape(v => !v)} {...OPT.shape} />
            <Seg label="Покрытие" items={OPT.coat} value={coat} onChange={setCoat} />
            <Seg label="Дизайн" items={OPT.design} value={design} onChange={setDesign} />
          </div>
          <div className="flex flex-col bg-[#0a0a0a] text-white">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
              <span className="flex gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-white/25" /><span className="h-2.5 w-2.5 rounded-full bg-white/25" /><span className="h-2.5 w-2.5 rounded-full bg-white/25" /></span>
              <span className={`${MONO} text-[12px] text-white/45`}>manic — build {id}</span>
              <button type="button" onClick={() => setRun(r => r + 1)} className={`${MONO} text-[12px] text-white/60 hover:text-white`}>↻ заново</button>
            </div>
            <div className={`${MONO} min-h-[300px] flex-1 space-y-2 p-5 text-[13px] leading-relaxed md:p-6 md:text-[14px]`} aria-live="polite">
              {shown > 0 && <p className="text-white/50">$ manic build --visit</p>}
              {steps.map((s, i) => {
                const start = acc; acc += s.m
                if (shown < i + 2) return null
                return (
                  <motion.p key={s.t} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="flex gap-3">
                    <span className="text-white/35">[{fmtMin(start).padStart(2, '0')}]</span>
                    <span className="flex-1">{s.t}</span>
                    <span className="text-white/60">~{s.m} мин</span>
                    <span>✓</span>
                  </motion.p>
                )
              })}
              {steps.length === 0 && shown > 0 && <p className="text-white/60">Шаги не выбраны — запишитесь на консультацию.</p>}
              {done && steps.length > 0 && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-3 text-white">▲ Готово. Визит примерно {fmtMin(total)}.</motion.p>}
              {!done && <span className="inline-block h-4 w-2 animate-pulse bg-white/70 align-middle" />}
            </div>
            <div className="border-t border-white/10 p-5 md:p-6">
              <div className="flex h-2 gap-[2px] overflow-hidden rounded-full bg-white/10">
                {steps.map((s, i) => <motion.span key={s.t} layout initial={{ scaleX: 0 }} animate={{ scaleX: shown >= i + 2 ? 1 : 0 }} transition={{ duration: 0.4 }} className="h-full origin-left" style={{ flex: s.m, background: `rgba(255,255,255,${1 - i * 0.2})` }} />)}
              </div>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                <p className={`${MONO} text-[13px] text-white/60`}>итого ~<span className="text-white">{fmtMin(total)}</span> · примерно</p>
                <button type="button" onClick={book} className={`${SANS} inline-flex h-11 items-center gap-2 rounded-md bg-white px-5 text-[14.5px] font-medium text-black hover:bg-white/85`}>Записаться с этой сборкой <ArrowRight size={16} /></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- bento on grid ---------------- */
const TRI = 'M50 8 L92 84 L8 84 Z'
const NAIL = 'M50 8 C70 8 80 30 80 56 C80 74 70 88 50 88 C30 88 20 74 20 56 C20 30 30 8 50 8 Z'
const TRI2 = 'M50 8 C64 33 78 58 92 84 C64 84 36 84 8 84 C22 58 36 33 50 8 Z'
function MorphIcon() {
  const [n, setN] = useState(false)
  useEffect(() => { const t = setInterval(() => setN(v => !v), 1800); return () => clearInterval(t) }, [])
  return (
    <svg viewBox="0 0 100 96" className="h-32 w-32" aria-hidden="true">
      <motion.path d={TRI2} animate={{ d: n ? NAIL : TRI2 }} transition={{ duration: 1, ease: [0.65, 0, 0.35, 1] }} fill="none" stroke="#fff" strokeWidth="1.2" />
      <line x1="50" y1="0" x2="50" y2="96" stroke="rgba(255,255,255,.2)" strokeDasharray="2 3" />
      <line x1="0" y1="56" x2="100" y2="56" stroke="rgba(255,255,255,.2)" strokeDasharray="2 3" />
    </svg>
  )
}
function Cell({ children, className = '' }) {
  return <Reveal className={'group relative border-white/[.12] p-6 transition-colors hover:bg-white/[.03] md:p-8 ' + className}>{children}</Reveal>
}
function Bento() {
  return (
    <section id="studio" className="bg-black px-5 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-[1200px]">
        <Label n="03">Студия</Label>
        <h2 className={`${SANS} mt-4 text-[clamp(38px,5.4vw,80px)] font-semibold leading-[.95] tracking-[-0.06em]`}><span className="bg-clip-text text-transparent" style={{ backgroundImage: GRAD }}>Точность в деталях.</span></h2>
        <Frame className="mt-14 grid md:grid-cols-3">
          <Cell className="border-b md:col-span-2 md:border-r">
            <p className={`${MONO} text-[12px] uppercase tracking-[.08em] text-white/45`}>Яндекс Карты</p>
            <p className={`${MONO} mt-6 text-[clamp(80px,12vw,168px)] font-medium leading-[.85] tracking-[-0.06em]`}><Scramble text={b.rating} chars="0123456789" /></p>
            <p className="mt-4 text-[16px] text-white/60">{b.rev} оценок — максимальный рейтинг</p>
          </Cell>
          <Cell className="flex flex-col items-center justify-center border-b text-center"><MorphIcon /><p className={`${MONO} mt-4 text-[12px] uppercase tracking-[.08em] text-white/50`}>форма по вашей руке</p></Cell>
          <Cell className="border-b md:border-b-0 md:border-r">
            <p className={`${MONO} text-[12px] text-white/45`}>01</p>
            <p className={`${SANS} mt-10 text-[22px] font-semibold tracking-[-0.03em]`}>Этаж 1</p>
            <p className="mt-2 text-[15px] text-white/55">Газеты Правда, 1 — вход с улицы.</p>
          </Cell>
          <Cell className="border-b md:border-b-0 md:border-r">
            <p className={`${MONO} text-[12px] text-white/45`}>02</p>
            <p className={`${SANS} mt-10 text-[22px] font-semibold tracking-[-0.03em]`}>Чистые линии</p>
            <p className="mt-2 text-[15px] text-white/55">Аккуратная кутикула и ровный торец.</p>
          </Cell>
          <Cell>
            <p className={`${MONO} text-[12px] text-white/45`}>03</p>
            <p className={`${SANS} mt-10 text-[22px] font-semibold tracking-[-0.03em]`}>Работы — в соцсетях</p>
            <div className="mt-4 flex gap-2">
              <a href={b.ig} target="_blank" rel="noopener" className="inline-flex h-10 items-center gap-2 rounded-md border border-white/20 px-3 text-[14px] hover:bg-white hover:text-black"><IG />Instagram</a>
              <a href={b.vk} target="_blank" rel="noopener" className="inline-flex h-10 items-center gap-2 rounded-md border border-white/20 px-3 text-[14px] hover:bg-white hover:text-black"><VK />VK</a>
            </div>
          </Cell>
        </Frame>
      </div>
    </section>
  )
}

/* ---------------- services table ---------------- */
const SVC = [
  { t: 'Маникюр', d: 'Обработка кутикулы, форма, уход.' },
  { t: 'Покрытие гель-лаком', d: 'Однотон или френч, ровный тонкий слой.' },
  { t: 'Укрепление', d: 'Выравнивание и прочность натуральной пластины.' },
  { t: 'Дизайн', d: 'От минимала до сложных техник.' },
  { t: 'Снятие покрытия', d: 'Бережно, без вреда для ногтя.' },
  { t: 'Педикюр', d: 'Уход и покрытие для стоп.' },
]
function Services() {
  return (
    <section id="services" className="bg-black px-5 pb-24 md:px-10 md:pb-32">
      <div className="mx-auto max-w-[1200px]">
        <Rule />
        <div className="grid gap-6 pt-16 md:grid-cols-[0.8fr_1.2fr]">
          <div>
            <Label n="04">Услуги</Label>
            <h2 className={`${SANS} mt-4 text-[clamp(34px,4.4vw,64px)] font-semibold leading-[.95] tracking-[-0.06em]`}>Что делаем</h2>
            <p className="mt-4 max-w-[320px] text-[15px] text-white/55">Нажмите на строку — услуга подставится в запись.</p>
          </div>
          <div>
            {SVC.map((s, i) => (
              <a key={s.t} href="#book" data-svc={s.t} className="group grid grid-cols-[40px_1fr_auto] items-baseline gap-4 border-t border-white/[.12] py-5 last:border-b">
                <span className={`${MONO} text-[13px] text-white/40`}>{String(i + 1).padStart(2, '0')}</span>
                <span><span className={`${SANS} block text-[20px] font-medium tracking-[-0.03em] transition-transform group-hover:translate-x-1`}>{s.t}</span><span className="mt-1 block text-[14.5px] text-white/50">{s.d}</span></span>
                <span className={`${MONO} text-[12px] text-white/40 transition-colors group-hover:text-white`}>+ запись</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- booking ---------------- */
const DAYS = ['Сегодня', 'Завтра', 'На неделе', 'Другой день']
const TIMES = ['Утро', 'День', 'Вечер']
function Opt({ on, children, onClick }) {
  return <button type="button" aria-pressed={!!on} onClick={onClick} className={`${SANS} min-h-11 rounded-md border px-4 py-2 text-[14.5px] font-medium transition-colors ${on ? 'border-white bg-white text-black' : 'border-white/15 text-white/75 hover:border-white/50'}`}>{children}</button>
}
function Book() {
  const bk = useBooking()
  const [step, setStep] = useState(0), [day, setDay] = useState(''), [time, setTime] = useState(''), [via, setVia] = useState('Звонок'), [err, setErr] = useState('')
  const head = useRef(null)
  useEffect(() => { if (step) head.current?.focus() }, [step])
  useEffect(() => { const h = e => { bk.upd('svc', e.detail); setStep(0); setErr('') }; window.addEventListener('manic-svc', h); return () => window.removeEventListener('manic-svc', h) }, [])
  const next = e => {
    e.preventDefault()
    if (step === 0 && !bk.s.svc) return setErr('Выберите услугу')
    if (step === 1 && !day) return setErr('Выберите день')
    setErr('')
    if (step < 2) setStep(step + 1); else bk.submit()
  }
  const names = SVC.map(s => s.t)
  const custom = bk.s.svc && !names.includes(bk.s.svc)
  const titles = ['Услуга', 'Время', 'Контакт']
  return (
    <section id="book" className="bg-black px-5 pb-24 md:px-10 md:pb-32">
      <div className="mx-auto max-w-[1200px]">
        <Rule />
        <div className="grid gap-12 pt-16 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <Label n="05">Запись</Label>
            <h2 className={`${SANS} mt-4 text-[clamp(38px,5.4vw,80px)] font-semibold leading-[.95] tracking-[-0.06em]`}><span className="bg-clip-text text-transparent" style={{ backgroundImage: GRAD }}>Три шага до записи.</span></h2>
            <p className="mt-6 max-w-[360px] text-[16px] text-white/55">Мастер свяжется и подтвердит время.</p>
            <a href={'tel:' + tel(b.phone)} className={`${MONO} mt-6 inline-block text-[22px] hover:text-white/70`}>{b.phone}</a>
          </div>
          <Frame className="bg-[#0a0a0a] p-6 md:p-10">
            {bk.s.sent ? (
              <div className="py-10 text-center" role="status">
                <CheckDraw className="mx-auto text-white" />
                <p className={`${SANS} mt-6 text-[30px] font-semibold tracking-[-0.04em]`}>Заявка отправлена</p>
                <p className="mx-auto mt-3 max-w-[380px] text-white/55">Ответим {via === 'Звонок' ? 'звонком' : 'в ' + via}. В готовом сайте заявка сразу придёт вам в Telegram.</p>
                <button type="button" onClick={() => { bk.reset(); setStep(0); setDay(''); setTime('') }} className={`${MONO} mt-8 text-[13px] text-white/55 underline underline-offset-4`}>Новая заявка</button>
              </div>
            ) : (
              <form onSubmit={next} noValidate>
                <ol className={`${MONO} flex items-center gap-2 text-[12px]`}>
                  {titles.map((t, i) => <li key={t} className="flex items-center gap-2"><span className={`grid h-6 w-6 place-items-center rounded-full border ${i <= step ? 'border-white bg-white text-black' : 'border-white/25 text-white/50'}`}>{i + 1}</span><span className={i === step ? 'text-white' : 'text-white/40'}>{t}</span>{i < 2 && <span className="mx-1 h-px w-5 bg-white/20 sm:w-10" />}</li>)}
                </ol>
                <h3 ref={head} tabIndex={-1} className={`${SANS} mb-7 mt-8 text-[26px] font-semibold tracking-[-0.04em] outline-none`}>{['Что делаем?', 'Когда удобно?', 'Куда ответить?'][step]}</h3>
                <AnimatePresence mode="wait">
                  <motion.div key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                    {step === 0 && <div className="flex flex-wrap gap-2.5">{custom && <Opt on>{bk.s.svc}</Opt>}{names.map(s => <Opt key={s} on={bk.s.svc === s} onClick={() => { bk.upd('svc', s); setErr('') }}>{s}</Opt>)}</div>}
                    {step === 1 && (<>
                      <div className="flex flex-wrap gap-2.5">{DAYS.map(d => <Opt key={d} on={day === d} onClick={() => { setDay(d); setErr('') }}>{d}</Opt>)}</div>
                      <p className={`${MONO} mb-3 mt-7 text-[12px] uppercase tracking-[.08em] text-white/45`}>время</p>
                      <div className="flex flex-wrap gap-2.5">{TIMES.map(t => <Opt key={t} on={time === t} onClick={() => setTime(t)}>{t}</Opt>)}</div>
                    </>)}
                    {step === 2 && (<div className="space-y-4">
                      <input value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} autoComplete="name" placeholder="Имя" aria-label="Имя" className="h-12 w-full rounded-md border border-white/15 bg-black px-4 text-[16px] outline-none focus:border-white" />
                      <input value={bk.s.phone} onChange={e => bk.upd('phone', e.target.value)} onFocus={phoneFocus(bk)} type="tel" inputMode="tel" autoComplete="tel" placeholder="+375 __ ___-__-__" aria-label="Телефон" aria-invalid={bk.s.err}
                        className={`${MONO} h-12 w-full rounded-md border bg-black px-4 text-[16px] outline-none focus:border-white ${bk.s.err ? 'border-[#ff4d4d]' : 'border-white/15'}`} />
                      {bk.s.err && <p className="text-[14px] text-[#ff6b6b]">Проверьте номер — 12 цифр с кодом +375.</p>}
                      <p className={`${MONO} pt-2 text-[12px] uppercase tracking-[.08em] text-white/45`}>как ответить</p>
                      <div className="flex flex-wrap gap-2.5">{['Звонок', 'Viber', 'Instagram'].map(v => <Opt key={v} on={via === v} onClick={() => setVia(v)}>{v}</Opt>)}</div>
                    </div>)}
                  </motion.div>
                </AnimatePresence>
                {err && <p className="mt-4 text-[14px] text-[#ff6b6b]" role="alert">{err}</p>}
                <div className="mt-9 flex items-center justify-between">
                  {step > 0 ? <button type="button" onClick={() => setStep(step - 1)} className={`${MONO} text-[13px] text-white/55 hover:text-white`}>← назад</button> : <span />}
                  <button type="submit" disabled={bk.s.loading} className={`${SANS} inline-flex h-11 items-center gap-2 rounded-md bg-white px-6 text-[15px] font-medium text-black hover:bg-white/85 disabled:opacity-60`}>{step < 2 ? 'Дальше' : bk.s.loading ? 'Отправляем…' : 'Записаться'} <ArrowRight size={16} /></button>
                </div>
              </form>
            )}
          </Frame>
        </div>
      </div>
    </section>
  )
}

function Contact() {
  const btn = `${SANS} inline-flex h-11 items-center gap-2 rounded-md border border-white/20 px-4 text-[14px] font-medium hover:bg-white hover:text-black`
  return (
    <section id="contact" className="bg-black px-5 pb-24 md:px-10">
      <div className="mx-auto max-w-[1200px]">
        <Rule />
        <div className="grid gap-10 pt-16 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <Label n="06">Контакты</Label>
            <h2 className={`${SANS} mt-4 text-[clamp(34px,4.4vw,64px)] font-semibold leading-[.95] tracking-[-0.06em]`}>Как нас найти</h2>
            <p className="mt-8 flex items-start gap-3 text-[18px]"><MapPin className="mt-1 shrink-0 text-white/60" size={20} />{b.addr}, {b.floor}, {b.city}</p>
            <a href={'tel:' + tel(b.phone)} className={`${MONO} mt-5 flex items-center gap-3 text-[22px] hover:text-white/70`}><Phone size={19} className="text-white/60" />{b.phone}</a>
            <p className="mt-2 text-[14px] text-white/45">Звонок и Viber — по одному номеру</p>
            <div className="mt-8 flex flex-wrap gap-2.5">
              <a href={b.viber} className={btn}><MessageCircle size={17} />Viber</a>
              <a href={b.ig} target="_blank" rel="noopener" className={btn}><IG />Instagram</a>
              <a href={b.vk} target="_blank" rel="noopener" className={btn}><VK />VK</a>
            </div>
          </div>
          <Frame className="h-[360px] md:h-[440px]"><MapFrame oid={b.oid} className="grayscale" /></Frame>
        </div>
      </div>
    </section>
  )
}

function App() {
  useSmooth()
  const lite = useLite()
  return (
    <MotionConfig reducedMotion="user">
      <div className={`${SANS} bg-black text-[#ededed]`} style={{ '--sel': '#fff', '--selc': '#000' }}>
        <Ribbon name={b.name} bg="#fff" fg="#000" />
        <header className="sticky top-0 z-50 border-b border-white/10 bg-black/75 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-5 md:px-10">
            <a href="#top" className="flex items-center gap-2.5">
              <svg viewBox="0 0 20 24" width="18" height="22" aria-hidden="true"><path d="M10 1C15 1 18 6 18 12C18 19 14.5 23 10 23C5.5 23 2 19 2 12C2 6 5 1 10 1Z" fill="#fff" /></svg>
              <span className="text-[18px] font-semibold tracking-[-0.04em]">маник</span>
              <span className={`${MONO} hidden rounded border border-white/15 px-1.5 py-0.5 text-[10.5px] text-white/50 sm:inline`}>nail studio</span>
            </a>
            <nav className="hidden gap-7 text-[14px] text-white/60 md:flex">{[['#build', 'Сборка'], ['#studio', 'Студия'], ['#services', 'Услуги'], ['#contact', 'Контакты']].map(([h, t]) => <a key={h} href={h} className="hover:text-white">{t}</a>)}</nav>
            <div className="flex items-center gap-2">
              <a href={'tel:' + tel(b.phone)} className="hidden h-9 items-center rounded-md border border-white/15 px-3 text-[13.5px] hover:bg-white/10 lg:inline-flex">{b.phone}</a>
              <a href="#book" className="hidden h-9 items-center rounded-md bg-white px-4 text-[14px] font-medium text-black hover:bg-white/85 sm:inline-flex">Записаться</a>
            </div>
          </div>
        </header>
        <main>
          <Film lite={lite} />
          <Build />
          <Bento />
          <Services />
          <Book />
          <Contact />
        </main>
        <footer className={`${MONO} bg-black px-5 py-8 text-[12px] text-white/45 md:px-10`}>
          <div className="mx-auto flex max-w-[1200px] flex-wrap justify-between gap-4 border-t border-white/10 pt-8"><span>© 2026 {b.name} · Концепт сайта — Артём</span><span>{b.addr}, {b.city}</span></div>
        </footer>
        <CallBar phone={b.phone} barCls="bg-black/85 backdrop-blur border-t border-white/10" callCls="rounded-md border border-white/25 text-white" bookCls="rounded-md bg-white text-black" />
        <div className="h-[72px] bg-black sm:hidden" />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
