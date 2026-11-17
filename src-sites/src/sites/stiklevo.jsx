import React, { useRef, useState, useEffect, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, useSpring, useInView, AnimatePresence, MotionConfig, useAnimationFrame, useReducedMotion } from 'framer-motion'
import { ArrowRight, ArrowUpRight, Phone, MapPin, Navigation, Star, ChevronDown, Check, Minus, Plus, Clock } from 'lucide-react'
import '../lib/base.css'
import { useSmooth, Ribbon, LineReveal, Reveal, useBooking, phoneFocus, CheckDraw, MapFrame, CallBar, tel, useLite, useIsMobile } from '../lib/kit'

const Road3D = lazy(() => import('./stiklevo3d'))

const b = {
  name: 'СТО в Большом Стиклево', short: 'СТО', addr: 'Первый пер., 15', place: 'д. Большое Стиклево, Минский р-н',
  phone: '+375 29 647-22-58', rating: '5,0', rev: 66, oid: '93810176200',
}
const ROUTE = 'https://yandex.by/maps/?rtext=~' + encodeURIComponent('Минский район, деревня Большое Стиклево, Первый переулок, 15')
const F = "font-['Onest',sans-serif]"
const DARK = '#0c1812', PINE = '#13261c', CREAM = '#efeadf', INK = '#13201a', AMBER = '#eaa94b'
const btnLight = `${F} inline-flex h-12 min-w-[200px] items-center justify-center gap-2 rounded-[6px] bg-[#efeadf] px-6 text-[15px] font-semibold text-[#13201a] transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#eaa94b]`
const btnGhost = `${F} inline-flex h-12 min-w-[200px] items-center justify-center gap-2 rounded-[6px] bg-[#0c1812]/55 px-6 text-[15px] font-semibold text-[#efeadf] backdrop-blur-md ring-1 ring-inset ring-[#efeadf]/25 transition hover:ring-[#efeadf]/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#eaa94b]`

const NAV = [['services', 'Услуги'], ['how', 'Как работаем'], ['rating', 'Рейтинг'], ['contact', 'Контакты']]

/* ---------------- header ---------------- */
function useActive(ids) {
  const [a, setA] = useState('')
  useEffect(() => {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) setA(e.target.id) }), { rootMargin: '-45% 0px -50% 0px' })
    ids.forEach(id => { const el = document.getElementById(id); if (el) io.observe(el) })
    return () => io.disconnect()
  }, [])
  return a
}
function Header() {
  const act = useActive(['film', 'services', 'choice', 'how', 'rating', 'book', 'faq', 'contact'])
  const map = { choice: 'services', book: 'rating', faq: 'contact' }
  const cur = map[act] || act
  return (
    <header className={`${F} sticky top-0 z-50 border-b border-white/10 bg-[#0c1812]/80 text-[#efeadf] backdrop-blur-xl`}>
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-4 md:px-8">
        <a href="#film" className="flex min-w-0 items-center gap-3" aria-label="СТО в Большом Стиклево — наверх">
          <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true"><path d="M15 3 4 22h22L15 3Z" fill="none" stroke={AMBER} strokeWidth="2" /><path d="M15 11 9.5 21h11L15 11Z" fill={AMBER} /></svg>
          <span className="min-w-0 leading-tight">
            <span className="block text-[15px] font-semibold tracking-[-0.01em]">СТО · Большое Стиклево</span>
            <span className="block truncate text-[12px] text-[#efeadf]/60">Двигатели и АКПП · за МКАД</span>
          </span>
        </a>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Разделы">
          {NAV.map(([id, l]) => (
            <a key={id} href={'#' + id} aria-current={cur === id ? 'true' : undefined}
              className={`rounded-[6px] px-3.5 py-2 text-[14.5px] font-medium transition ${cur === id ? 'bg-[#efeadf]/12 text-white' : 'text-[#efeadf]/70 hover:text-white'}`}>{l}</a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a href={'tel:' + tel(b.phone)} className="hidden items-center gap-2 px-2 text-[15px] font-semibold sm:inline-flex"><Phone size={16} className="text-[#eaa94b]" />{b.phone}</a>
          <a href="#book" className="inline-flex h-10 items-center rounded-[6px] bg-[#eaa94b] px-4 text-[14.5px] font-semibold text-[#13201a] hover:bg-[#f2bc66]">Записаться</a>
        </div>
      </div>
    </header>
  )
}

/* ---------------- pinned road film (hero) ---------------- */
const CH = [
  { r: [0.13, 0.33], k: 'Глава 1', h: 'Минск остаётся позади', d: 'Едем по трассе от города.' },
  { r: [0.33, 0.55], k: 'Глава 2', h: 'Под МКАДом — и уже за городом', d: 'Мастерская — сразу за кольцевой.' },
  { r: [0.55, 0.78], k: 'Глава 3', h: 'Поля, потом сосны', d: 'Спокойная загородная мастерская.' },
]
function Caption({ p, c }) {
  const k = [c.r[0], c.r[0] + 0.04, c.r[1] - 0.04, c.r[1]]
  const o = useTransform(p, k, [0, 1, 1, 0]), y = useTransform(p, k, [24, 0, 0, -18])
  return (
    <motion.div style={{ opacity: o, y }} className="pointer-events-none absolute inset-x-4 top-[5vh] text-center text-[#efeadf]">
      <p className={`${F} text-[12px] font-medium uppercase tracking-[.3em] text-[#efeadf]/70`}>{c.k}</p>
      <h2 className={`${F} mx-auto mt-3 max-w-[900px] text-[clamp(32px,5vw,68px)] font-medium leading-[1.02] tracking-[-0.035em] [text-shadow:0_2px_30px_rgba(0,0,0,.35)]`}>{c.h}</h2>
      <p className={`${F} mt-3 text-[17px] text-[#efeadf]/80`}>{c.d}</p>
    </motion.div>
  )
}
function LiteRoad({ p }) {
  const bg = useTransform(p, [0, 0.5, 1], ['linear-gradient(180deg,#2a3647,#8b94a0 62%,#3a3f3c 62%)', 'linear-gradient(180deg,#173328,#b9a27c 62%,#2a3d2a 62%)', 'linear-gradient(180deg,#0e2119,#d9935a 62%,#22331f 62%)'])
  return (
    <motion.div className="absolute inset-0" style={{ background: bg }}>
      <svg className="absolute inset-x-0 bottom-0 h-[38%] w-full" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">
        <path d="M44 0h12l30 40H14Z" fill="#26292a" /><path d="M49.6 0h.8l1.6 40h-4Z" fill="#e8e2cf" opacity=".5" />
      </svg>
      <svg className="absolute inset-x-0 top-[44%] h-[18%] w-full" viewBox="0 0 200 20" preserveAspectRatio="none" aria-hidden="true">
        {Array.from({ length: 40 }, (_, i) => { const x = i * 5 + (i % 3); const h = 8 + ((i * 7) % 9); return Math.abs(x - 100) < 10 ? null : <path key={i} d={`M${x} 20 l3 -${h} l3 ${h}Z`} fill="#16301f" /> })}
      </svg>
    </motion.div>
  )
}
function Film({ lite, mobile }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const p = useSpring(scrollYProgress, { stiffness: 80, damping: 24, mass: 0.4 })
  const near = useInView(ref, { margin: '200px 0px' })
  const [mounted, setMounted] = useState(false)
  useEffect(() => { if (near) setMounted(true) }, [near])
  const heroO = useTransform(p, [0, 0.09], [1, 0]), heroPE = useTransform(p, v => (v < 0.06 ? 'auto' : 'none'))
  const endO = useTransform(p, [0.8, 0.88], [0, 1]), endPE = useTransform(p, v => (v > 0.84 ? 'auto' : 'none'))
  const km = useTransform(p, [0, 1], [0, 100]), kmW = useTransform(km, v => v + '%')
  return (
    <section ref={ref} id="film" className="relative h-[300vh]" style={{ background: DARK }} aria-label="Дорога до мастерской">
      <div className="sticky top-16 h-[calc(100svh-64px)] overflow-hidden">
        <div className="absolute inset-0">
          {lite ? <LiteRoad p={p} /> : mounted ? <Suspense fallback={<LiteRoad p={p} />}><Road3D progress={p} active={near} lite={mobile} /></Suspense> : <LiteRoad p={p} />}
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(12,24,18,.75),rgba(12,24,18,.35)_30%,transparent_45%,transparent_60%,rgba(12,24,18,.7))]" />

        {/* hero: Tesla composition — title top, buttons bottom */}
        <motion.div style={{ opacity: heroO, pointerEvents: heroPE }} className="absolute inset-0 flex flex-col items-center px-4 pb-[calc(140px+env(safe-area-inset-bottom))] pt-[4vh] text-center text-[#efeadf] sm:pb-[9vh]">
          <a href="#rating" className={`${F} inline-flex items-center gap-2 rounded-full bg-[#0c1812]/55 px-3.5 py-1.5 text-[14px] font-medium ring-1 ring-[#efeadf]/20 backdrop-blur-md`}>
            <Star size={14} className="fill-[#eaa94b] text-[#eaa94b]" /> {b.rating} на Яндекс Картах · {b.rev} оценок
          </a>
          <h1 className={`${F} mt-5 max-w-[1100px] text-[clamp(38px,6.6vw,96px)] font-medium leading-[.98] tracking-[-0.045em] [text-shadow:0_2px_40px_rgba(0,0,0,.3)]`}>
            <LineReveal delay={0.05}>Ремонт двигателей</LineReveal>
            <LineReveal delay={0.18}>и АКПП за МКАДом</LineReveal>
          </h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.8 }} className={`${F} mt-4 max-w-[560px] text-[17px] leading-snug text-[#efeadf] [text-shadow:0_1px_12px_rgba(0,0,0,.9),0_0_2px_rgba(0,0,0,.8)]`}>
            Спокойная загородная мастерская. <span className="whitespace-nowrap"><MapPin size={15} className="mb-0.5 inline text-[#eaa94b]" /> {b.place.split(',')[0]}, {b.addr}</span>
          </motion.p>
          <div className="mt-auto flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
            <a href="#book" data-svc="Диагностика" className={btnLight + ' w-full sm:w-auto'}>Записаться на диагностику</a>
            <a href={'tel:' + tel(b.phone)} className={btnGhost + ' hidden sm:inline-flex'}><Phone size={16} /> {b.phone}</a>
          </div>
          <a href="#services" className={`${F} mt-4 inline-flex items-center gap-1 text-[14.5px] font-medium text-[#efeadf]/75 underline-offset-4 hover:text-white hover:underline`}>Пропустить дорогу <ArrowRight size={15} /></a>
        </motion.div>

        {CH.map(c => <Caption key={c.k} p={p} c={c} />)}

        <motion.div style={{ opacity: endO, pointerEvents: endPE }} className="absolute inset-0 flex flex-col items-center px-4 pb-[calc(140px+env(safe-area-inset-bottom))] pt-[5vh] text-center text-[#efeadf] sm:pb-[9vh]">
          <p className={`${F} text-[12px] font-medium uppercase tracking-[.3em] text-[#efeadf]/70`}>Приехали</p>
          <h2 className={`${F} mt-3 text-[clamp(34px,5.4vw,76px)] font-medium leading-[1] tracking-[-0.04em] [text-shadow:0_2px_30px_rgba(0,0,0,.4)]`}>Первый пер., 15</h2>
          <p className={`${F} mt-3 text-[17px] text-[#efeadf]/85`}>Большое Стиклево, Минский район</p>
          <div className="mt-auto flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
            <a href={ROUTE} target="_blank" rel="noopener" className={btnLight + ' w-full sm:w-auto'}><Navigation size={16} /> Маршрут из Минска</a>
            <a href="#services" className={btnGhost + ' w-full sm:w-auto'}>Что мы ремонтируем</a>
          </div>
        </motion.div>

        <div className="pointer-events-none absolute inset-x-6 bottom-4 hidden md:block">
          <div className={`${F} mb-1.5 flex justify-between text-[11px] uppercase tracking-[.24em] text-[#efeadf]/55`}><span>Минск</span><span>МКАД</span><span>Б. Стиклево</span></div>
          <div className="h-px bg-[#efeadf]/20"><motion.div style={{ width: kmW }} className="h-px bg-[#eaa94b]" /></div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- SVG visuals for Tesla slides ---------------- */
function gearPath(teeth, ro, ri, inner = false) {
  let d = ''
  const n = teeth * 4
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2, ph = i % 4
    const r = inner ? (ph === 0 || ph === 1 ? ri : ro) : (ph === 0 || ph === 1 ? ro : ri)
    d += (i ? 'L' : 'M') + (Math.cos(a) * r).toFixed(2) + ' ' + (Math.sin(a) * r).toFixed(2)
  }
  return d + 'Z'
}
const SUN_P = gearPath(14, 42, 35), PLANET_P = gearPath(10, 30, 24), RING_P = gearPath(38, 112, 105, true)
function usePlay(ref) { const v = useInView(ref, { margin: '100px 0px' }); const r = useReducedMotion(); return v && !r }
function Planetary() {
  const ref = useRef(null), sun = useRef(), car = useRef(), pl = [useRef(), useRef(), useRef()]
  const play = usePlay(ref)
  const t = useRef(0)
  useAnimationFrame((_, dt) => {
    if (!play) return
    t.current += dt / 1000
    const w = t.current * 0.9, carA = w * 42 / (42 + 108)
    sun.current.setAttribute('transform', `rotate(${(w * 57.3).toFixed(2)})`)
    car.current.setAttribute('transform', `rotate(${(carA * 57.3).toFixed(2)})`)
    pl.forEach(r => r.current.setAttribute('transform', `rotate(${(-(w - carA) * 42 / 27 * 57.3).toFixed(2)})`))
  })
  return (
    <svg ref={ref} viewBox="-130 -130 260 260" className="h-full w-full" aria-hidden="true">
      <circle r="124" fill="none" stroke="#efeadf" strokeOpacity=".15" />
      <path d={RING_P} fill="none" stroke="#efeadf" strokeOpacity=".7" strokeWidth="1.4" />
      <circle r="120" fill="none" stroke="#efeadf" strokeOpacity=".35" />
      <g ref={car}>
        {[0, 120, 240].map((a, i) => (
          <g key={a} transform={`rotate(${a}) translate(69 0)`}>
            <g ref={pl[i]}><path d={PLANET_P} fill="#13261c" stroke="#efeadf" strokeWidth="1.4" /><circle r="7" fill="none" stroke="#eaa94b" strokeWidth="1.6" /></g>
          </g>
        ))}
        <circle r="69" fill="none" stroke="#eaa94b" strokeOpacity=".35" strokeDasharray="2 5" />
      </g>
      <g ref={sun}><path d={SUN_P} fill="#eaa94b" fillOpacity=".12" stroke="#eaa94b" strokeWidth="1.6" /><circle r="10" fill="#eaa94b" /></g>
    </svg>
  )
}
function Piston() {
  const ref = useRef(null), pis = useRef(), rod = useRef(), pin = useRef(), arm = useRef()
  const play = usePlay(ref)
  const t = useRef(0)
  const R = 34, L = 92
  useAnimationFrame((_, dt) => {
    if (!play) return
    t.current += dt / 1000
    const a = t.current * 2.4, px = Math.sin(a) * R, py = -Math.cos(a) * R
    const yP = py - Math.sqrt(L * L - px * px)
    pis.current.setAttribute('transform', `translate(0 ${yP.toFixed(2)})`)
    rod.current.setAttribute('d', `M${px.toFixed(2)} ${py.toFixed(2)} L0 ${yP.toFixed(2)}`)
    pin.current.setAttribute('cx', px.toFixed(2)); pin.current.setAttribute('cy', py.toFixed(2))
    arm.current.setAttribute('transform', `rotate(${(a * 57.3).toFixed(1)})`)
  })
  return (
    <svg ref={ref} viewBox="-120 -190 240 260" className="h-full w-full" aria-hidden="true">
      <path d="M-46 -182 V-60 M46 -182 V-60" stroke="#efeadf" strokeOpacity=".7" strokeWidth="1.6" />
      <path d="M-58 -186 H58" stroke="#efeadf" strokeOpacity=".35" />
      <circle r="52" fill="none" stroke="#efeadf" strokeOpacity=".2" strokeDasharray="3 6" />
      <g ref={arm}><path d="M-14 0 A14 14 0 0 1 14 0 L8 -34 A8 8 0 0 1 -8 -34Z" fill="#13261c" stroke="#efeadf" strokeWidth="1.4" /><circle r="44" fill="none" stroke="#eaa94b" strokeOpacity=".25" /></g>
      <path ref={rod} stroke="#eaa94b" strokeWidth="5" strokeLinecap="round" />
      <circle ref={pin} r="6" fill="#eaa94b" />
      <circle r="5" fill="#efeadf" />
      <g ref={pis}>
        <rect x="-44" y="-30" width="88" height="54" rx="4" fill="#13261c" stroke="#efeadf" strokeWidth="1.6" />
        <path d="M-44 -18 H44 M-44 -10 H44" stroke="#efeadf" strokeOpacity=".5" />
        <circle r="6" fill="none" stroke="#eaa94b" strokeWidth="2" />
      </g>
    </svg>
  )
}

function Slide({ id, kicker, title, line, svc, more, children, tone = PINE }) {
  return (
    <section id={id} className="relative flex min-h-[100svh] flex-col items-center overflow-hidden px-4 pb-[calc(140px+env(safe-area-inset-bottom))] pt-[10vh] text-center text-[#efeadf] sm:pb-[9vh]" style={{ background: `radial-gradient(ellipse at 50% 62%, #1f3a2a 0%, ${tone} 55%, ${DARK} 100%)` }}>
      <Reveal><p className={`${F} text-[12px] font-medium uppercase tracking-[.3em] text-[#efeadf]/60`}>{kicker}</p></Reveal>
      <Reveal delay={0.05}><h2 className={`${F} mt-3 text-[clamp(36px,5.6vw,80px)] font-medium leading-[1] tracking-[-0.045em]`}>{title}</h2></Reveal>
      <Reveal delay={0.1}><p className={`${F} mt-4 max-w-[560px] text-[17px] leading-snug text-[#efeadf]/75`}>{line}</p></Reveal>
      <div className="my-6 flex w-full flex-1 items-center justify-center">
        <div className="aspect-square w-[min(78vw,46vh,520px)]">{children}</div>
      </div>
      <div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
        <a href="#book" data-svc={svc} className={btnLight + ' w-full sm:w-auto'}>Записаться</a>
        <a href={more} className={btnGhost + ' w-full sm:w-auto'}>Ремонт или замена?</a>
      </div>
    </section>
  )
}

/* ---------------- services ---------------- */
const SERVICES = [
  { g: 'Двигатель', t: 'Диагностика двигателя', d: 'Компьютерная и механическая проверка: ищем причину, а не симптом.', time: 'обычно в день обращения' },
  { g: 'Двигатель', t: 'Ремонт двигателя', d: 'Частичный или капитальный — по результатам дефектовки.', time: 'по итогам дефектовки' },
  { g: 'Двигатель', t: 'Замена ГРМ', d: 'Ремень или цепь, ролики, помпа — по регламенту и состоянию.', time: 'уточнит мастер' },
  { g: 'Двигатель', t: 'Устранение течей масла', d: 'Прокладки, сальники, уплотнения.', time: 'уточнит мастер' },
  { g: 'АКПП', t: 'Диагностика АКПП', d: 'Проверка работы, ошибок и состояния масла.', time: 'обычно в день обращения' },
  { g: 'АКПП', t: 'Ремонт АКПП', d: 'Разборка, дефектовка, замена изношенных узлов.', time: 'по итогам дефектовки' },
  { g: 'АКПП', t: 'Замена масла в АКПП', d: 'Частичная или полная — подскажем, что подходит вашей коробке.', time: 'уточнит мастер' },
  { g: 'Оба узла', t: 'Установка контрактного агрегата', d: 'Если ремонт нецелесообразен — подбор и установка по согласованию.', time: 'уточнит мастер' },
]
function Services() {
  const [g, setG] = useState('Все')
  const list = SERVICES.filter(s => g === 'Все' || s.g === g)
  return (
    <section id="services" className="px-4 py-24 md:px-8 md:py-32" style={{ background: CREAM, color: INK }}>
      <div className="mx-auto max-w-[1200px]">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className={`${F} text-[12px] font-semibold uppercase tracking-[.28em] text-[#13201a]/55`}>Услуги</p>
            <h2 className={`${F} mt-3 text-[clamp(34px,4.6vw,64px)] font-medium leading-[1] tracking-[-0.04em]`}>Двигатель и коробка.<br /><span className="text-[#13201a]/45">Это наша специализация.</span></h2>
          </div>
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Фильтр услуг">
            {['Все', 'Двигатель', 'АКПП', 'Оба узла'].map(x => (
              <button key={x} role="tab" aria-selected={g === x} onClick={() => setG(x)} className={`${F} h-11 rounded-[6px] px-4 text-[15px] font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#13201a] ${g === x ? 'bg-[#13201a] text-[#efeadf]' : 'bg-[#13201a]/6 text-[#13201a] ring-1 ring-inset ring-[#13201a]/15 hover:ring-[#13201a]/40'}`}>{x}</button>
            ))}
          </div>
        </div>
        <ul className="mt-12 border-t border-[#13201a]/15">
          <AnimatePresence initial={false}>
            {list.map(s => (
              <motion.li key={s.t} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 gap-3 border-b border-[#13201a]/15 py-6 md:grid-cols-[160px_1fr_220px_auto] md:items-center md:gap-8">
                <span className={`${F} text-[13px] font-semibold uppercase tracking-[.2em] text-[#2f5a3f]`}>{s.g}</span>
                <div>
                  <h3 className={`${F} text-[22px] font-medium tracking-[-0.02em]`}>{s.t}</h3>
                  <p className={`${F} mt-1 text-[16px] leading-snug text-[#13201a]/65`}>{s.d}</p>
                </div>
                <div className={`${F} text-[14.5px] leading-snug text-[#13201a]/65`}>
                  <p className="flex items-center gap-1.5"><Clock size={14} /> {s.time}</p>
                  <p className="mt-0.5">цена — уточнит мастер</p>
                </div>
                <a href="#book" data-svc={s.t} className={`${F} inline-flex h-11 items-center justify-center gap-1.5 rounded-[6px] bg-[#13201a] px-5 text-[15px] font-semibold text-[#efeadf] hover:bg-[#2f5a3f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#13201a]`}>Записаться <ArrowRight size={15} /></a>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>
    </section>
  )
}

/* ---------------- value interaction: repair or replace ---------------- */
const UNITS = { eng: { t: 'Двигатель', gen: 'двигателя' }, akpp: { t: 'АКПП', gen: 'АКПП' } }
const LEVELS = [
  { t: 'Лёгкие', eng: 'Повышенный расход масла, неровный холостой ход, Check Engine загорается время от времени.', akpp: 'Лёгкие толчки при переключении, задержка включения передачи на холодную.', tilt: -11,
    hint: 'При таких симптомах чаще всего начинают с диагностики и точечного ремонта — менять агрегат обычно рано.' },
  { t: 'Заметные', eng: 'Посторонний стук, дымный выхлоп, заметная потеря мощности.', akpp: 'Пинки, пробуксовка, периодический уход в аварийный режим.', tilt: -5,
    hint: 'Решает дефектовка: мастер покажет, что изношено, и сравнит варианты вместе с вами.' },
  { t: 'Серьёзные', eng: 'Сильный стук, масло в антифризе, двигатель не заводится или заклинил.', akpp: 'Машина не едет в одном из режимов, сильная пробуксовка, стружка в масле.', tilt: 0,
    hint: 'Здесь стоит честно сравнить оба пути: после осмотра станет понятно, что разумнее именно для вашей машины.' },
]
const PROS = {
  rep: { t: 'Ремонт', s: 'вашего агрегата', plus: ['Остаётся родной узел с известной вам историей', 'Меняются только изношенные детали', 'Устраняется причина поломки, а не только следствие'], minus: ['Нужна дефектовка — срок зависит от запчастей', 'При сильном износе объём работ может быть большим'] },
  rpl: { t: 'Контрактный', s: 'агрегат', plus: ['Часто быстрее вернуть машину в строй', 'Разумно, если корпус или блок повреждены'], minus: ['История узла известна только со слов продавца', 'Нужна проверка и адаптация после установки', 'Состояние у каждого экземпляра своё'] },
}
function Scale({ tilt }) {
  return (
    <svg viewBox="0 0 240 120" className="h-[110px] w-full max-w-[300px]" aria-hidden="true">
      <path d="M120 112 V30" stroke="#efeadf" strokeOpacity=".5" strokeWidth="2" /><path d="M96 112 H144" stroke="#efeadf" strokeOpacity=".5" strokeWidth="2" />
      <motion.g animate={{ rotate: tilt }} transition={{ type: 'spring', stiffness: 90, damping: 12 }} style={{ originX: '120px', originY: '30px' }}>
        <path d="M30 30 H210" stroke="#eaa94b" strokeWidth="3" strokeLinecap="round" />
        <path d="M30 30 L14 72 H46Z M210 30 L194 72 H226Z" fill="none" stroke="#efeadf" strokeOpacity=".6" />
        <text x="30" y="92" textAnchor="middle" fill="#efeadf" fontSize="12" fontFamily="Onest">ремонт</text>
        <text x="210" y="92" textAnchor="middle" fill="#efeadf" fontSize="12" fontFamily="Onest">замена</text>
      </motion.g>
      <circle cx="120" cy="30" r="5" fill="#eaa94b" />
    </svg>
  )
}
function ProsCard({ k, emph }) {
  const c = PROS[k]
  return (
    <div className={`rounded-[10px] p-6 transition md:p-7 ${emph ? 'bg-[#efeadf] text-[#13201a]' : 'bg-white/[.04] text-[#efeadf] ring-1 ring-inset ring-white/12'}`}>
      <p className={`${F} text-[26px] font-medium tracking-[-0.03em]`}>{c.t} <span className="opacity-50">{c.s}</span></p>
      <ul className={`${F} mt-5 space-y-3 text-[16px] leading-snug`}>
        {c.plus.map(x => <li key={x} className="flex gap-3"><Plus size={18} className={'mt-0.5 shrink-0 ' + (emph ? 'text-[#2f5a3f]' : 'text-[#eaa94b]')} />{x}</li>)}
        {c.minus.map(x => <li key={x} className="flex gap-3 opacity-70"><Minus size={18} className="mt-0.5 shrink-0" />{x}</li>)}
      </ul>
    </div>
  )
}
function Choice() {
  const [u, setU] = useState('akpp'), [l, setL] = useState(1)
  const L = LEVELS[l]
  return (
    <section id="choice" className="relative px-4 py-24 text-[#efeadf] md:px-8 md:py-32" style={{ background: DARK }}>
      <div className="mx-auto max-w-[1200px]">
        <div className="text-center">
          <p className={`${F} text-[12px] font-medium uppercase tracking-[.3em] text-[#efeadf]/60`}>Честный разбор</p>
          <h2 className={`${F} mt-3 text-[clamp(36px,5.4vw,76px)] font-medium leading-[1] tracking-[-0.045em]`}>Ремонт или замена?</h2>
          <p className={`${F} mx-auto mt-4 max-w-[600px] text-[17px] leading-snug text-[#efeadf]/70`}>Выберите узел и насколько всё серьёзно — покажем плюсы и минусы обоих путей. Без цен и без диагноза по телефону.</p>
        </div>

        <div className="mx-auto mt-12 grid max-w-[900px] gap-6">
          <fieldset>
            <legend className={`${F} mb-3 text-[14px] font-semibold uppercase tracking-[.18em] text-[#efeadf]/60`}>1 · Что беспокоит</legend>
            <div className="grid grid-cols-2 gap-2 rounded-[10px] bg-white/[.05] p-1.5">
              {Object.entries(UNITS).map(([k, x]) => (
                <button key={k} type="button" aria-pressed={u === k} onClick={() => setU(k)} className={`${F} h-14 rounded-[7px] text-[17px] font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#eaa94b] ${u === k ? 'bg-[#efeadf] text-[#13201a]' : 'text-[#efeadf]/75 hover:text-white'}`}>{x.t}</button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className={`${F} mb-3 text-[14px] font-semibold uppercase tracking-[.18em] text-[#efeadf]/60`}>2 · Насколько серьёзно</legend>
            <div className="grid gap-2 md:grid-cols-3">
              {LEVELS.map((x, i) => (
                <button key={x.t} type="button" aria-pressed={l === i} onClick={() => setL(i)} className={`${F} rounded-[10px] p-4 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#eaa94b] ${l === i ? 'bg-[#1f3a2a] ring-2 ring-inset ring-[#eaa94b]' : 'bg-white/[.04] ring-1 ring-inset ring-white/12 hover:ring-white/30'}`}>
                  <span className="flex items-center gap-2 text-[17px] font-semibold">
                    <span className="flex gap-0.5">{[0, 1, 2].map(j => <span key={j} className={`h-3 w-1.5 rounded-sm ${j <= i ? 'bg-[#eaa94b]' : 'bg-white/20'}`} />)}</span>{x.t}
                  </span>
                  <span className="mt-2 block text-[15px] leading-snug text-[#efeadf]/70">{x[u]}</span>
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="mt-14 grid items-center gap-8 md:grid-cols-[1fr_auto_1fr]">
          <ProsCard k="rep" emph={l < 2} />
          <div className="order-first flex flex-col items-center text-center md:order-none md:w-[280px]">
            <Scale tilt={L.tilt} />
            <AnimatePresence mode="wait">
              <motion.p key={u + l} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className={`${F} mt-3 text-[16px] leading-snug text-[#efeadf]/85`}>{L.hint}</motion.p>
            </AnimatePresence>
          </div>
          <ProsCard k="rpl" emph={l === 2} />
        </div>
        <div className="mt-12 flex flex-col items-center gap-3 text-center">
          <a href="#book" data-svc={`Диагностика ${UNITS[u].gen} · симптомы: ${L.t.toLowerCase()}`} className={btnLight}>Записаться на диагностику {UNITS[u].gen} <ArrowRight size={16} /></a>
          <p className={`${F} max-w-[520px] text-[14.5px] text-[#efeadf]/55`}>Это ориентир, а не диагноз. Решение принимаем только после осмотра — вместе с вами.</p>
        </div>
      </div>
    </section>
  )
}

/* ---------------- how ---------------- */
const STEPS = [
  ['Звонок', 'Опишите, что происходит с машиной. Договоримся о дне.'],
  ['Приезжаете', 'Из Минска — за МКАД, в Большое Стиклево. Маршрут ниже.'],
  ['Диагностика', 'Находим причину и объясняем простыми словами.'],
  ['Согласование и ремонт', 'Работы — только после вашего «да». Потом забираете авто.'],
]
function How() {
  return (
    <section id="how" className="px-4 py-24 md:px-8 md:py-32" style={{ background: CREAM, color: INK }}>
      <div className="mx-auto max-w-[1200px]">
        <p className={`${F} text-center text-[12px] font-semibold uppercase tracking-[.28em] text-[#13201a]/55`}>Как мы работаем</p>
        <h2 className={`${F} mt-3 text-center text-[clamp(34px,4.6vw,64px)] font-medium leading-[1] tracking-[-0.04em]`}>Четыре шага. Без сюрпризов.</h2>
        <ol className="mt-14 grid gap-px overflow-hidden rounded-[10px] bg-[#13201a]/15 md:grid-cols-4">
          {STEPS.map(([t, d], i) => (
            <Reveal as="li" key={t} delay={i * 0.06} className="bg-[#efeadf] p-7">
              <span className={`${F} text-[56px] font-light leading-none tracking-[-0.05em] text-[#2f5a3f]`}>{i + 1}</span>
              <h3 className={`${F} mt-6 text-[21px] font-medium tracking-[-0.02em]`}>{t}</h3>
              <p className={`${F} mt-2 text-[16px] leading-snug text-[#13201a]/65`}>{d}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}

/* ---------------- rating (Tesla slide) ---------------- */
function Rating() {
  return (
    <section id="rating" className="relative flex min-h-[86svh] flex-col items-center justify-center overflow-hidden px-4 py-24 text-center text-[#efeadf]" style={{ background: `radial-gradient(ellipse at 50% 100%, #3b2d14 0%, ${PINE} 45%, ${DARK} 100%)` }}>
      <p className={`${F} text-[12px] font-medium uppercase tracking-[.3em] text-[#efeadf]/60`}>Рейтинг на Яндекс Картах</p>
      <Reveal><p className={`${F} mt-4 text-[clamp(120px,24vw,340px)] font-light leading-[.85] tracking-[-0.07em]`}>{b.rating}</p></Reveal>
      <div className="mt-4 flex gap-1.5" aria-label="5 звёзд из 5">{[0, 1, 2, 3, 4].map(i => <Star key={i} size={26} className="fill-[#eaa94b] text-[#eaa94b]" />)}</div>
      <p className={`${F} mt-5 text-[19px] text-[#efeadf]/80`}>{b.rev} оценок от водителей</p>
      <div className="mt-10 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
        <a href="#book" className={btnLight + ' w-full sm:w-auto'}>Записаться</a>
        <a href={`https://yandex.by/maps/org/${b.oid}/reviews/`} target="_blank" rel="noopener" className={btnGhost + ' w-full sm:w-auto'}>Отзывы на Яндексе <ArrowUpRight size={16} /></a>
      </div>
    </section>
  )
}

/* ---------------- booking ---------------- */
const B_SVC = ['Диагностика двигателя', 'Ремонт двигателя', 'Диагностика АКПП', 'Ремонт АКПП', 'Замена масла в АКПП', 'Другое']
function Booking() {
  const bk = useBooking()
  const [step, setStep] = useState(0), [car, setCar] = useState(''), [note, setNote] = useState('')
  useEffect(() => { if (bk.s.svc && !bk.s.sent) setStep(s => (s === 0 ? 1 : s)) }, [bk.s.svc])
  const inp = `${F} mt-2 block h-14 w-full rounded-[8px] bg-white px-4 text-[17px] text-[#13201a] ring-1 ring-inset ring-[#13201a]/20 placeholder:text-[#13201a]/40 focus:outline-none focus:ring-2 focus:ring-[#2f5a3f]`
  const send = e => { e.preventDefault(); bk.submit() }
  return (
    <section id="book" className="px-4 py-24 md:px-8 md:py-32" style={{ background: CREAM, color: INK }}>
      <div className="mx-auto grid max-w-[1100px] gap-12 md:grid-cols-[.9fr_1.1fr]">
        <div>
          <p className={`${F} text-[12px] font-semibold uppercase tracking-[.28em] text-[#13201a]/55`}>Запись</p>
          <h2 className={`${F} mt-3 text-[clamp(34px,4.6vw,60px)] font-medium leading-[1] tracking-[-0.04em]`}>Запишитесь на диагностику</h2>
          <p className={`${F} mt-5 max-w-[420px] text-[17px] leading-snug text-[#13201a]/65`}>Три коротких шага. Мастер перезвонит, уточнит детали и предложит удобный день.</p>
          <a href={'tel:' + tel(b.phone)} className={`${F} mt-8 inline-flex items-center gap-3 text-[22px] font-semibold`}><span className="grid h-12 w-12 place-items-center rounded-full bg-[#13201a] text-[#eaa94b]"><Phone size={18} /></span>{b.phone}</a>
        </div>
        <div className="rounded-[14px] bg-[#e4dccb] p-5 md:p-8">
          {bk.s.sent ? (
            <div className="grid min-h-[360px] place-items-center text-center" role="status">
              <div>
                <CheckDraw className="mx-auto text-[#2f5a3f]" />
                <p className={`${F} mt-5 text-[28px] font-medium tracking-[-0.03em]`}>Заявка отправлена</p>
                <p className={`${F} mx-auto mt-2 max-w-[340px] text-[16px] text-[#13201a]/65`}>Мастер перезвонит, чтобы договориться о дне. В готовом сайте заявка сразу придёт вам в Telegram.</p>
                <button onClick={() => { bk.reset(); setStep(0); setCar(''); setNote('') }} className={`${F} mt-6 h-11 rounded-[6px] px-5 text-[15px] font-semibold ring-1 ring-inset ring-[#13201a]/30 hover:ring-[#13201a]`}>Новая заявка</button>
              </div>
            </div>
          ) : (
            <form onSubmit={send} noValidate>
              <div className="flex gap-2" aria-hidden="true">{[0, 1, 2].map(i => <span key={i} className={`h-1.5 flex-1 rounded-full transition ${i <= step ? 'bg-[#2f5a3f]' : 'bg-[#13201a]/15'}`} />)}</div>
              <p className={`${F} mt-3 text-[14px] font-medium text-[#13201a]/60`}>Шаг {step + 1} из 3</p>
              {step === 0 && (
                <fieldset className="mt-5">
                  <legend className={`${F} text-[22px] font-medium tracking-[-0.02em]`}>Что нужно сделать?</legend>
                  <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {B_SVC.map(x => (
                      <button key={x} type="button" aria-pressed={bk.s.svc === x} onClick={() => { bk.upd('svc', x); setStep(1) }} className={`${F} min-h-[52px] rounded-[8px] px-4 text-left text-[16px] font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2f5a3f] ${bk.s.svc === x ? 'bg-[#13201a] text-[#efeadf]' : 'bg-white ring-1 ring-inset ring-[#13201a]/15 hover:ring-[#13201a]/40'}`}>{x}</button>
                    ))}
                  </div>
                </fieldset>
              )}
              {step === 1 && (
                <div className="mt-5 space-y-4">
                  <p className={`${F} rounded-[8px] bg-white/60 px-4 py-3 text-[15px]`}>Услуга: <b>{bk.s.svc || 'не выбрана'}</b> <button type="button" onClick={() => setStep(0)} className="ml-2 underline underline-offset-2">изменить</button></p>
                  <label className={`${F} block text-[15px] font-medium`}>Марка и модель <span className="text-[#13201a]/50">(необязательно)</span>
                    <input className={inp} value={car} onChange={e => setCar(e.target.value)} placeholder="Например, Volkswagen Passat B6" autoComplete="off" />
                  </label>
                  <label className={`${F} block text-[15px] font-medium`}>Что происходит <span className="text-[#13201a]/50">(необязательно)</span>
                    <textarea className={inp + ' h-28 py-3'} value={note} onChange={e => setNote(e.target.value)} placeholder="Пинки при переключении с 2 на 3…" />
                  </label>
                  <div className="flex gap-2 pt-1">
                    <button type="button" onClick={() => setStep(0)} className={`${F} h-14 rounded-[8px] px-5 text-[16px] font-semibold ring-1 ring-inset ring-[#13201a]/25`}>Назад</button>
                    <button type="button" onClick={() => setStep(2)} className={`${F} h-14 flex-1 rounded-[8px] bg-[#13201a] text-[16px] font-semibold text-[#efeadf] hover:bg-[#2f5a3f]`}>Далее</button>
                  </div>
                </div>
              )}
              {step === 2 && (
                <div className="mt-5 space-y-4">
                  <label className={`${F} block text-[15px] font-medium`}>Имя
                    <input className={inp} value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} placeholder="Как к вам обращаться" autoComplete="given-name" />
                  </label>
                  <label className={`${F} block text-[15px] font-medium`}>Телефон
                    <input className={inp + (bk.s.err ? ' ring-2 ring-[#b3261e]' : '')} type="tel" inputMode="tel" value={bk.s.phone} onFocus={phoneFocus(bk)} onChange={e => bk.upd('phone', e.target.value)} placeholder="+375 29 000-00-00" autoComplete="tel" aria-invalid={bk.s.err} aria-describedby="st-err" />
                  </label>
                  {bk.s.err && <p id="st-err" className={`${F} text-[15px] font-medium text-[#b3261e]`}>Проверьте номер — нужен полный, с кодом оператора.</p>}
                  <div className="flex gap-2 pt-1">
                    <button type="button" onClick={() => setStep(1)} className={`${F} h-14 rounded-[8px] px-5 text-[16px] font-semibold ring-1 ring-inset ring-[#13201a]/25`}>Назад</button>
                    <button type="submit" disabled={bk.s.loading} className={`${F} h-14 flex-1 rounded-[8px] bg-[#eaa94b] text-[16px] font-semibold text-[#13201a] hover:bg-[#f2bc66] disabled:opacity-60`}>{bk.s.loading ? 'Отправляем…' : 'Отправить заявку'}</button>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

/* ---------------- FAQ ---------------- */
const FAQ = [
  ['Сколько длится диагностика?', 'Зависит от неисправности. Обычно причину находим в день обращения, но сложные случаи могут потребовать больше времени — мастер скажет заранее.'],
  ['Можно приехать без записи?', 'Лучше позвонить заранее: так мастер сможет выделить время именно под вашу машину.'],
  ['Машина не на ходу — что делать?', 'Позвоните и опишите ситуацию — обсудим, как удобнее доставить автомобиль в мастерскую.'],
  ['Вы ставите контрактные агрегаты?', 'Оба варианта — ремонт и замену — обсуждаем после диагностики. Наличие и условия уточняйте у мастера.'],
  ['Как оплатить?', 'Способы оплаты уточняйте по телефону при записи.'],
  ['Где оставить машину и есть ли где подождать?', 'Мастерская за городом, места вокруг спокойные. Где удобнее встать, подскажем при звонке.'],
]
function Faq() {
  const [o, setO] = useState(0)
  return (
    <section id="faq" className="px-4 py-24 text-[#efeadf] md:px-8 md:py-32" style={{ background: DARK }}>
      <div className="mx-auto max-w-[860px]">
        <p className={`${F} text-center text-[12px] font-medium uppercase tracking-[.3em] text-[#efeadf]/60`}>Вопросы</p>
        <h2 className={`${F} mt-3 text-center text-[clamp(34px,4.6vw,60px)] font-medium leading-[1] tracking-[-0.04em]`}>Частые вопросы</h2>
        <div className="mt-12 divide-y divide-white/12 border-y border-white/12">
          {FAQ.map(([q, a], i) => (
            <div key={q}>
              <h3>
                <button type="button" aria-expanded={o === i} onClick={() => setO(o === i ? -1 : i)} className={`${F} flex w-full items-center justify-between gap-6 py-5 text-left text-[18px] font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#eaa94b]`}>
                  {q}<ChevronDown size={20} className={`shrink-0 text-[#eaa94b] transition ${o === i ? 'rotate-180' : ''}`} />
                </button>
              </h3>
              <AnimatePresence initial={false}>
                {o === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <p className={`${F} pb-6 text-[16.5px] leading-relaxed text-[#efeadf]/70`}>{a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------- contact / how to get there ---------------- */
function Contact() {
  return (
    <section id="contact" className="px-4 pb-28 pt-24 md:px-8 md:pb-24 md:pt-32" style={{ background: PINE, color: CREAM }}>
      <div className="mx-auto max-w-[1300px]">
        <div className="overflow-hidden rounded-[18px] bg-[#0c1812] ring-1 ring-white/10 md:grid md:grid-cols-[1fr_1.15fr]">
          <div className="p-6 md:p-12">
            <p className={`${F} text-[12px] font-medium uppercase tracking-[.3em] text-[#efeadf]/60`}>Как доехать из Минска</p>
            <h2 className={`${F} mt-4 text-[clamp(32px,4vw,56px)] font-medium leading-[1] tracking-[-0.04em]`}>Сразу за МКАД.<br /><span className="text-[#eaa94b]">Большое Стиклево.</span></h2>
            <ol className={`${F} mt-8 space-y-4 text-[17px] leading-snug`}>
              <li className="flex gap-4"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#efeadf]/10 text-[14px] font-semibold">1</span>Выезжайте из Минска за кольцевую — мы в деревне Большое Стиклево, Минский район.</li>
              <li className="flex gap-4"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#efeadf]/10 text-[14px] font-semibold">2</span>Адрес для навигатора: Первый переулок, 15.</li>
              <li className="flex gap-4"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#efeadf]/10 text-[14px] font-semibold">3</span>Сомневаетесь в повороте — позвоните, подскажем.</li>
            </ol>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a href={ROUTE} target="_blank" rel="noopener" className={`${F} inline-flex h-14 items-center justify-center gap-2 rounded-[8px] bg-[#eaa94b] px-6 text-[16px] font-semibold text-[#13201a] hover:bg-[#f2bc66]`}><Navigation size={18} /> Построить маршрут в Яндекс</a>
              <a href={'tel:' + tel(b.phone)} className={`${F} inline-flex h-14 items-center justify-center gap-2 rounded-[8px] px-6 text-[16px] font-semibold ring-1 ring-inset ring-[#efeadf]/30 hover:ring-[#efeadf]`}><Phone size={18} /> {b.phone}</a>
            </div>
            <dl className={`${F} mt-10 grid gap-5 border-t border-white/10 pt-8 text-[16px] sm:grid-cols-2`}>
              <div><dt className="text-[13px] uppercase tracking-[.2em] text-[#efeadf]/50">Адрес</dt><dd className="mt-1.5">{b.addr}, {b.place}</dd></div>
              <div><dt className="text-[13px] uppercase tracking-[.2em] text-[#efeadf]/50">Часы работы</dt><dd className="mt-1.5">Уточняйте по телефону</dd></div>
              <div><dt className="text-[13px] uppercase tracking-[.2em] text-[#efeadf]/50">Специализация</dt><dd className="mt-1.5">Ремонт двигателей и АКПП</dd></div>
              <div><dt className="text-[13px] uppercase tracking-[.2em] text-[#efeadf]/50">Связь</dt><dd className="mt-1.5">Только по телефону — так быстрее</dd></div>
            </dl>
          </div>
          <div className="h-[380px] md:h-auto md:min-h-[560px]"><MapFrame oid={b.oid} /></div>
        </div>
      </div>
    </section>
  )
}

function App() {
  useSmooth()
  const lite = useLite(), mobile = useIsMobile()
  return (
    <MotionConfig reducedMotion="user">
      <div className={`${F} min-h-screen overflow-x-clip`} style={{ background: DARK, '--sel': AMBER, '--selc': INK }}>
        <Ribbon name={b.name} bg={AMBER} fg={INK} />
        <Header />
        <main>
          <Film lite={lite} mobile={mobile} />
          <Slide id="engine" kicker="Двигатель" title="Ремонт двигателей" line="От диагностики до капитального ремонта — с разбором, почему это случилось." svc="Ремонт двигателя" more="#choice"><Piston /></Slide>
          <Slide id="akpp" kicker="Автоматическая коробка" title="Ремонт АКПП" line="Толчки, пробуксовка, аварийный режим — находим причину и чиним по делу." svc="Ремонт АКПП" more="#choice" tone="#10241a"><Planetary /></Slide>
          <Services />
          <Choice />
          <How />
          <Rating />
          <Booking />
          <Faq />
          <Contact />
        </main>
        <footer className={`${F} border-t border-white/10 px-4 pb-28 pt-10 text-[14.5px] text-[#efeadf]/60 md:px-8 md:pb-10`} style={{ background: DARK }}>
          <div className="mx-auto flex max-w-[1300px] flex-col justify-between gap-3 md:flex-row">
            <p>© 2026 {b.name} · Концепт сайта — Артём</p>
            <p>{b.addr}, {b.place} · <a href={'tel:' + tel(b.phone)} className="hover:text-white">{b.phone}</a></p>
          </div>
        </footer>
        <CallBar phone={b.phone} barCls="bg-[#0c1812]/92 backdrop-blur-xl border-t border-white/10" callCls="rounded-[8px] bg-[#efeadf]/10 text-[#efeadf]" bookCls="rounded-[8px] bg-[#eaa94b] text-[#13201a]" />
      </div>
    </MotionConfig>
  )
}

createRoot(document.getElementById('root')).render(<App />)
