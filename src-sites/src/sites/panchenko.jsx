import React, { useRef, useState, useEffect, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, useSpring, useInView, AnimatePresence, MotionConfig } from 'framer-motion'
import { ArrowRight, ArrowUpRight, Phone, MapPin, Plus, Minus, ImagePlus, X, Check, AlertTriangle } from 'lucide-react'
import '../lib/base.css'
import { useSmooth, Ribbon, Reveal, useBooking, phoneFocus, CheckDraw, MapFrame, CallBar, tel, useLite, useIsMobile, LineReveal } from '../lib/kit'

const TyreCut = lazy(() => import('./panchenko3d'))

const b = {
  name: 'Шиномонтаж на Пимена Панченко', short: 'Шиномонтаж', addr: 'ул. Пимена Панченко, 17', district: 'Сухарево', city: 'Минск',
  phone: '+375 29 276-28-20', rating: '5,0', rev: 199, oid: '35641743026',
}
const OR = '#ff5b14', INK = '#171513', PAPER = '#f2ede3'
const S = "font-['IBM_Plex_Serif',serif]"
const M = "font-['IBM_Plex_Mono',monospace]"
const NAV = [['repair', 'Ремонт'], ['rules', 'Можно / нельзя'], ['services', 'Услуги'], ['how', 'Как работаем'], ['rating', 'Отзывы'], ['contact', 'Контакты']]

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
  const a = useActive(NAV.map(n => n[0]))
  return (
    <header className="sticky top-0 z-40 border-b border-[#171513] bg-[#f2ede3]/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-4 md:px-8">
        <a href="#top" className="flex items-center gap-3">
          <span className={`${M} grid h-10 w-10 place-items-center rounded-full border-2 border-[#171513] text-[13px] font-semibold`}>17</span>
          <span className="leading-tight"><span className={`${S} block text-[18px] font-semibold`}>Шиномонтаж</span><span className={`${M} block text-[11.5px] text-[#171513]/70`}>Пимена Панченко · Сухарево</span></span>
        </a>
        <nav className="hidden items-center gap-1 xl:flex" aria-label="Разделы">
          {NAV.map(([id, t]) => <a key={id} href={'#' + id} aria-current={a === id ? 'true' : undefined} className={`${M} rounded-full px-3 py-2 text-[13px] transition-colors ${a === id ? 'bg-[#171513] text-[#f2ede3]' : 'hover:bg-[#171513]/5'}`}>{t}</a>)}
        </nav>
        <div className="flex items-center gap-2">
          <a href={'tel:' + tel(b.phone)} className={`${M} hidden items-center gap-2 px-3 text-[14px] font-medium md:flex`}><Phone size={15} />{b.phone}</a>
          <a href="#book" className={`${M} inline-flex h-11 items-center rounded-full bg-[#ff5b14] px-5 text-[14px] font-semibold text-[#171513] hover:bg-[#171513] hover:text-[#f2ede3]`}>Записаться</a>
        </div>
      </div>
    </header>
  )
}

/* ---------------- hero + pinned cutaway film ---------------- */
const CH = [
  { n: 'Рис. 2', h: 'Внутри шины — слои.', d: 'Протектор, стальной брекер, каркас из нитей корда и герметичный слой изнутри. Держит давление именно корд.', r: [0.14, 0.38] },
  { n: 'Рис. 3', h: 'Порез рвёт нити корда.', d: 'Дырку видно снаружи. Но опасность — в повреждённых нитях каркаса: под нагрузкой там может вздуться грыжа.', r: [0.38, 0.62] },
  { n: 'Рис. 4', h: 'Заплатка — изнутри, с кордом.', d: 'Большая ремонтная заплатка перекрывает зону пореза и берёт нагрузку на себя. Не заклёпка, которая просто затыкает отверстие.', r: [0.62, 1.2] },
]
function Chapter({ p, c }) {
  const k = [c.r[0], c.r[0] + 0.05, c.r[1] - 0.05, c.r[1]]
  const o = useTransform(p, k, [0, 1, 1, 0])
  const y = useTransform(p, k, [30, 0, 0, -20])
  return (
    <motion.div style={{ opacity: o, y }} className="pointer-events-none absolute inset-x-4 top-5 md:left-8 md:right-auto md:top-[14vh] md:w-[44vw]">
      <p className={`${M} text-[13px] text-[#171513]/70`}><span className="mr-2 inline-block bg-[#ff5b14] px-1.5 text-[#171513]">{c.n}</span>шина в разрезе</p>
      <h2 className={`${S} mt-3 text-[clamp(36px,5.6vw,84px)] font-medium leading-[1] tracking-[-0.02em]`}>{c.h}</h2>
      <p className="mt-4 max-w-[480px] text-[17px] leading-snug text-[#171513]/80 md:text-[19px]">{c.d}</p>
    </motion.div>
  )
}
function LiteTyre() {
  return (
    <div className="absolute inset-0 grid place-items-center md:left-1/2">
      <svg viewBox="0 0 200 200" className="h-[60%] max-h-[420px] w-auto" aria-hidden="true">
        <circle cx="100" cy="100" r="88" fill="#1d1b19" /><circle cx="100" cy="100" r="58" fill={PAPER} /><circle cx="100" cy="100" r="52" fill="#c9c4bb" />
        <path d="M100 12 A88 88 0 0 1 188 100 L158 100 A58 58 0 0 0 100 42Z" fill={PAPER} />
        <path d="M100 42 L100 12 M158 100 L188 100" stroke={OR} strokeWidth="4" />
      </svg>
    </div>
  )
}
function Film({ lite }) {
  const ref = useRef(null)
  const mob = useIsMobile()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.4 })
  const near = useInView(ref, { margin: '200px 0px' })
  const [mounted, setMounted] = useState(false)
  useEffect(() => { if (near) setMounted(true) }, [near])
  const heroO = useTransform(p, [0, 0.1], [1, 0])
  const heroPE = useTransform(p, v => (v < 0.06 ? 'auto' : 'none'))
  const stageY = useTransform(p, [0, 0.12], [mob ? '36vh' : '0vh', '0vh'])
  const capO = useTransform(p, [0.06, 0.12], [0, 1])
  return (
    <section ref={ref} id="top" className="relative h-[300vh]">
      <div className="sticky top-16 h-[calc(100svh-64px)] overflow-hidden">
        {/* drafting grid */}
        <div aria-hidden="true" className="absolute inset-0 opacity-[.5]" style={{ backgroundImage: 'linear-gradient(#17151312 1px,transparent 1px),linear-gradient(90deg,#17151312 1px,transparent 1px)', backgroundSize: '32px 32px' }} />
        <motion.div style={{ y: stageY }} className="absolute inset-0">
          {lite ? <LiteTyre /> : mounted && <Suspense fallback={<LiteTyre />}><TyreCut progress={p} active={near} /></Suspense>}
        </motion.div>

        <motion.div style={{ opacity: heroO, pointerEvents: heroPE }} className="relative z-[2] mx-auto max-w-[1440px] px-4 pt-6 md:px-8 md:pt-[7vh]">
          <p className={`${M} inline-flex items-center gap-2 border border-[#171513] px-2.5 py-1 text-[12.5px]`}><MapPin size={13} />{b.addr} · {b.district}, {b.city}</p>
          <h1 className={`${S} mt-5 max-w-[760px] text-[clamp(42px,6.6vw,104px)] font-medium leading-[.98] tracking-[-0.025em]`}>
            <LineReveal>Не спешите</LineReveal>
            <LineReveal delay={0.08}>выбрасывать</LineReveal>
            <LineReveal delay={0.16}><span className="italic">шину</span><span className="text-[#ff5b14]">.</span></LineReveal>
          </h1>
          <p className="mt-5 max-w-[520px] text-[17px] leading-snug text-[#171513]/80 md:text-[19px]">Шиномонтаж в Сухарево. Ремонтируем порезы боковины большой заплаткой изнутри — не заклёпкой. Заправка кондиционера и проверка на утечку.</p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a href="#book" onClick={() => window.dispatchEvent(new CustomEvent('pp-tab', { detail: { tab: 'photo' } }))} className={`${M} inline-flex h-14 items-center gap-2 rounded-full bg-[#ff5b14] px-6 text-[15px] font-semibold text-[#171513] hover:bg-[#171513] hover:text-[#f2ede3]`}>Пришлите фото пореза <ArrowRight size={17} /></a>
            <a href={'tel:' + tel(b.phone)} className={`${M} inline-flex h-14 items-center gap-2 rounded-full border-2 border-[#171513] px-5 text-[15px] font-medium hover:bg-[#171513] hover:text-[#f2ede3]`}><Phone size={16} />{b.phone}</a>
          </div>
          <a href="#rating" className={`${M} mt-6 inline-flex items-center gap-3 text-[13px]`}><span className={`${S} text-[40px] font-semibold leading-none`}>{b.rating}</span><span>Яндекс Карты<br /><span className="text-[#171513]/65">{b.rev} оценок</span></span></a>
        </motion.div>

        {CH.map(c => <Chapter key={c.n} p={p} c={c} />)}

        <motion.div style={{ opacity: capO }} className={`${M} pointer-events-none absolute bottom-[86px] left-4 right-4 z-[3] flex items-end justify-between gap-6 text-[12px] text-[#171513]/70 md:bottom-6 md:left-8 md:right-8`}>
          <span>Иллюстрация. Решение о ремонте — после осмотра.</span>
          <a href="#services" className="pointer-events-auto shrink-0 text-[13px] font-medium text-[#171513] underline underline-offset-4 hover:text-[#c2410c]">Пропустить →</a>
        </motion.div>
      </div>
    </section>
  )
}

/* ---------------- patch vs rivet explorer ---------------- */
const ZONES = [
  { k: 'tread', t: 'Протектор', v: 'ok', h: 'Обычно ремонтируется', d: 'Прокол или небольшой порез в зоне протектора — самый частый и самый благодарный ремонт.' },
  { k: 'shoulder', t: 'Плечо', v: 'maybe', h: 'Нужен осмотр', d: 'Переход протектора в боковину сильно работает на изгиб. Мастер посмотрит, задет ли корд и брекер.' },
  { k: 'side', t: 'Боковина', v: 'maybe', h: 'Часто можно — заплаткой', d: 'Боковой порез ремонтируют большой заплаткой с кордом изнутри, если не задет борт и шина не ехала спущенной.' },
  { k: 'bead', t: 'Борт', v: 'no', h: 'Как правило, нельзя', d: 'Борт держит шину на диске. Повреждённый борт не ремонтируют — безопаснее заменить шину.' },
]
const VC = { ok: ['bg-[#1f7a3d] text-white', 'Можно'], maybe: ['bg-[#ff5b14] text-[#171513]', 'Смотрим'], no: ['bg-[#171513] text-[#f2ede3]', 'Нельзя'] }

function Diagram({ mode, len }) {
  // zoomed section of a sidewall: outer rubber / cord / liner; cut across
  const w = 18 + len * 4.2, cx = 300
  const cords = Array.from({ length: 26 }, (_, i) => 24 + i * 22)
  return (
    <svg viewBox="0 0 600 300" className="h-auto w-full" role="img" aria-label={mode === 'patch' ? 'Заплатка с кордом изнутри перекрывает порез' : 'Заклёпка затыкает отверстие, нити корда остаются порваны'}>
      <defs>
        <pattern id="pp-h" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="8" fill="#2a2724" /><line x1="0" y1="0" x2="0" y2="8" stroke="#3a3632" strokeWidth="3" /></pattern>
      </defs>
      <text x="16" y="34" className="fill-[#171513]/60" style={{ font: '500 13px IBM Plex Mono, monospace' }}>снаружи</text>
      <text x="16" y="290" className="fill-[#171513]/60" style={{ font: '500 13px IBM Plex Mono, monospace' }}>внутри шины</text>
      {/* rubber body */}
      <rect x="0" y="60" width="600" height="150" fill="url(#pp-h)" />
      <rect x="0" y="196" width="600" height="14" fill="#55504a" />
      {/* cords */}
      {cords.map(x => {
        const hit = Math.abs(x - cx) < w / 2 + 4
        return hit
          ? <g key={x}><line x1={x} y1="150" x2={x} y2="138" stroke={OR} strokeWidth="5" strokeLinecap="round" /><line x1={x} y1="168" x2={x} y2="180" stroke={OR} strokeWidth="5" strokeLinecap="round" /></g>
          : <line key={x} x1={x} y1="150" x2={x} y2="180" stroke={OR} strokeWidth="5" strokeLinecap="round" />
      })}
      <line x1="0" y1="150" x2={cx - w / 2 - 6} y2="150" stroke={OR} strokeWidth="2" opacity=".5" />
      <line x1={cx + w / 2 + 6} y1="150" x2="600" y2="150" stroke={OR} strokeWidth="2" opacity=".5" />
      {/* the cut */}
      <motion.path animate={{ d: `M${cx - w / 2} 60 L${cx - w / 4} 210 L${cx + w / 4} 210 L${cx + w / 2} 60 Z` }} transition={{ type: 'spring', stiffness: 140, damping: 20 }} fill={PAPER} stroke="#171513" strokeWidth="2" />
      <AnimatePresence mode="wait">
        {mode === 'rivet' ? (
          <motion.g key="r" initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
            <rect x={cx - 10} y="46" width="20" height="186" rx="4" fill="#8a837b" stroke="#171513" strokeWidth="2" />
            <ellipse cx={cx} cy="234" rx="38" ry="9" fill="#8a837b" stroke="#171513" strokeWidth="2" />
            <g stroke="#c2410c" strokeWidth="2.5" fill="none"><path d={`M${cx - w / 2 - 30} 120 l-26 0 m6 -6 l-6 6 l6 6`} /><path d={`M${cx + w / 2 + 30} 120 l26 0 m-6 -6 l6 6 l-6 6`} /></g>
            <text x={cx} y="28" textAnchor="middle" style={{ font: '600 14px IBM Plex Mono, monospace' }} className="fill-[#171513]">нити корда остались порваны</text>
          </motion.g>
        ) : (
          <motion.g key="p" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.4 }}>
            <path d={`M${cx - w / 4} 210 L${cx + w / 4} 210 L${cx + w / 2} 60 L${cx - w / 2} 60 Z`} fill="#2f2b28" />
            <rect x={cx - w / 2 - 90} y="210" width={w + 180} height="22" rx="11" fill="#3b3632" stroke={OR} strokeWidth="3" />
            {Array.from({ length: Math.round((w + 150) / 16) }, (_, i) => <line key={i} x1={cx - w / 2 - 75 + i * 16} y1="215" x2={cx - w / 2 - 75 + i * 16} y2="227" stroke={OR} strokeWidth="2.5" />)}
            <text x={cx} y="28" textAnchor="middle" style={{ font: '600 14px IBM Plex Mono, monospace' }} className="fill-[#171513]">заплатка с кордом берёт нагрузку на себя</text>
          </motion.g>
        )}
      </AnimatePresence>
    </svg>
  )
}

function Repair() {
  const [mode, setMode] = useState('patch')
  const [zone, setZone] = useState('side')
  const [len, setLen] = useState(15)
  const z = ZONES.find(x => x.k === zone)
  const send = () => window.dispatchEvent(new CustomEvent('pp-tab', { detail: { tab: 'photo', prefill: `${z.t}, порез ~${len} мм` } }))
  return (
    <section id="repair" className="scroll-mt-16 border-t border-[#171513] px-4 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid gap-6 md:grid-cols-[1fr_1fr] md:items-end">
          <div>
            <p className={`${M} text-[13px] text-[#171513]/70`}>§ 1 · Заплатка или заклёпка</p>
            <h2 className={`${S} mt-3 text-[clamp(38px,5.4vw,80px)] font-medium leading-[1] tracking-[-0.02em]`}>Разница — <span className="italic">внутри</span>.</h2>
          </div>
          <p className="max-w-[520px] text-[18px] leading-snug text-[#171513]/80">Переключите способ ремонта и подвигайте длину пореза. Схема условная — она показывает принцип, а не конкретную шину.</p>
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-[1.35fr_.65fr]">
          <figure className="border border-[#171513] bg-[#fbf8f2] p-4 md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div role="tablist" aria-label="Способ ремонта" className="inline-flex rounded-full border-2 border-[#171513] p-1">
                {[['patch', 'Заплатка с кордом'], ['rivet', 'Заклёпка / грибок']].map(([k, t]) => (
                  <button key={k} role="tab" aria-selected={mode === k} onClick={() => setMode(k)} className={`${M} min-h-[44px] rounded-full px-4 text-[14px] font-medium transition-colors ${mode === k ? 'bg-[#171513] text-[#f2ede3]' : 'hover:bg-[#171513]/5'}`}>{t}</button>
                ))}
              </div>
              <span className={`${M} text-[12.5px] text-[#171513]/65`}>Рис. 5 — боковина, увеличено</span>
            </div>
            <div className="mt-4"><Diagram mode={mode} len={len} /></div>
            <label htmlFor="pp-len" className={`${M} mt-2 flex items-center justify-between text-[14px]`}><span>Длина пореза</span><span className="font-semibold">~{len} мм</span></label>
            <input id="pp-len" type="range" min="3" max="40" value={len} onChange={e => setLen(+e.target.value)} className="mt-2 h-10 w-full accent-[#ff5b14]" />
            <figcaption className="mt-3 text-[15px] leading-snug text-[#171513]/75">{mode === 'patch' ? 'Заплатку ставят изнутри: она перекрывает зону вокруг пореза, а её собственный корд заменяет порванные нити.' : 'Заклёпка закрывает отверстие и держит воздух, но порванный корд под нагрузкой остаётся слабым местом — особенно на боковине.'}</figcaption>
          </figure>

          <div className="flex flex-col border border-[#171513] bg-[#171513] p-5 text-[#f2ede3] md:p-6">
            <p className={`${M} text-[13px] text-[#f2ede3]/70`}>Где повреждение?</p>
            <div role="radiogroup" aria-label="Зона повреждения" className="mt-3 grid grid-cols-2 gap-2">
              {ZONES.map(x => <button key={x.k} role="radio" aria-checked={zone === x.k} onClick={() => setZone(x.k)} className={`${M} min-h-[52px] rounded-lg border px-3 text-[15px] transition-colors ${zone === x.k ? 'border-[#ff5b14] bg-[#ff5b14] text-[#171513]' : 'border-[#f2ede3]/25 hover:border-[#f2ede3]'}`}>{x.t}</button>)}
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={zone} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }} className="mt-6 flex-1" aria-live="polite">
                <span className={`${M} inline-block rounded px-2 py-1 text-[12.5px] font-semibold ${VC[z.v][0]}`}>{VC[z.v][1]}</span>
                <p className={`${S} mt-3 text-[30px] font-medium leading-tight`}>{z.h}</p>
                <p className="mt-3 text-[16px] leading-snug text-[#f2ede3]/80">{z.d}</p>
              </motion.div>
            </AnimatePresence>
            <a href="#book" onClick={send} className={`${M} mt-6 inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[#ff5b14] px-5 text-[15px] font-semibold text-[#171513] hover:bg-[#f2ede3]`}>Показать порез мастеру <ArrowRight size={17} /></a>
            <p className={`${M} mt-3 text-[12px] text-[#f2ede3]/60`}>Общие правила, не диагноз. Окончательно решает мастер.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- rules ---------------- */
const CAN = ['Прокол протектора гвоздём или саморезом', 'Небольшой порез протектора', 'Порез боковины, если не задет борт', 'Медленно травит — найти и закрыть место']
const CANT = ['Грыжа (вздутие) на боковине', 'Шина ехала спущенной — следы по кругу на боковине', 'Повреждён борт или видна проволока', 'Расслоение, трещины по всей резине, сильный износ']
function Rules() {
  return (
    <section id="rules" className="scroll-mt-16 bg-[#171513] px-4 py-20 text-[#f2ede3] md:px-8 md:py-28">
      <div className="mx-auto max-w-[1440px]">
        <p className={`${M} text-[13px] text-[#f2ede3]/70`}>§ 2 · Когда можно отремонтировать, а когда нет</p>
        <h2 className={`${S} mt-3 max-w-[900px] text-[clamp(38px,5.4vw,80px)] font-medium leading-[1] tracking-[-0.02em]`}>Честно — до того, как вы <span className="italic text-[#ff5b14]">потратите</span> деньги.</h2>
        <div className="mt-12 grid gap-px bg-[#f2ede3]/20 md:grid-cols-2">
          {[[CAN, 'Обычно можно', Check, 'text-[#7ee2a0]'], [CANT, 'Как правило, нельзя', AlertTriangle, 'text-[#ff5b14]']].map(([list, t, Icon, cls]) => (
            <div key={t} className="bg-[#171513] p-6 md:p-10">
              <p className={`${S} flex items-center gap-3 text-[30px] font-medium`}><Icon className={cls} size={26} />{t}</p>
              <ul className="mt-6">
                {list.map((x, i) => (
                  <Reveal as="li" key={x} delay={i * 0.05} className="flex gap-4 border-t border-[#f2ede3]/15 py-4 text-[17px] leading-snug">
                    <span className={`${M} w-7 shrink-0 text-[13px] text-[#f2ede3]/55`}>{String(i + 1).padStart(2, '0')}</span>{x}
                  </Reveal>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-8 max-w-[720px] text-[16px] text-[#f2ede3]/70">Это общие правила безопасности. Если сомневаетесь — пришлите фото: мастер скажет, есть ли смысл ехать.</p>
      </div>
    </section>
  )
}

/* ---------------- services ---------------- */
const SV = [
  ['Ремонт пореза боковины', 'Большая заплатка с кордом изнутри.', 'по осмотру'],
  ['Ремонт прокола', 'Найдём место, закроем изнутри, проверим давление.', '20–40 мин'],
  ['Шиномонтаж и балансировка', 'Снятие, монтаж, балансировка колёс.', '40–60 мин'],
  ['Сезонная переобувка', 'Колёса в сборе — лето или зима.', '20–40 мин'],
  ['Заправка кондиционера', 'Заправка фреоном по норме для вашего авто.', '30–60 мин'],
  ['Проверка кондиционера на утечку', 'Ищем, куда уходит фреон, до заправки.', 'по осмотру'],
]
function Services() {
  return (
    <section id="services" className="scroll-mt-16 px-4 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-[1440px]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className={`${M} text-[13px] text-[#171513]/70`}>§ 3 · Услуги</p>
            <h2 className={`${S} mt-3 text-[clamp(38px,5.4vw,80px)] font-medium leading-[1] tracking-[-0.02em]`}>Что делаем</h2>
          </div>
          <p className={`${M} max-w-[340px] text-[13px] text-[#171513]/70`}>Цена — уточнит мастер. Время — ориентировочное.</p>
        </div>
        <ul className="mt-10 grid gap-px border border-[#171513] bg-[#171513] sm:grid-cols-2 lg:grid-cols-3">
          {SV.map(([t, d, time], i) => (
            <li key={t} className="group flex flex-col bg-[#f2ede3] p-6 transition-colors hover:bg-[#fbf8f2] md:p-8">
              <span className={`${M} text-[12.5px] text-[#171513]/60`}>{String(i + 1).padStart(2, '0')} · {time}</span>
              <h3 className={`${S} mt-4 text-[27px] font-medium leading-tight`}>{t}</h3>
              <p className="mt-2 flex-1 text-[16px] leading-snug text-[#171513]/75">{d}</p>
              <p className={`${M} mt-4 text-[12.5px] text-[#171513]/60`}>цена — уточнит мастер</p>
              <a href="#book" data-svc={t} onClick={() => window.dispatchEvent(new CustomEvent('pp-tab', { detail: { tab: 'book' } }))} className={`${M} mt-4 inline-flex h-12 w-fit items-center gap-2 rounded-full border-2 border-[#171513] px-5 text-[14px] font-medium transition-colors group-hover:bg-[#171513] group-hover:text-[#f2ede3]`}>Записаться <ArrowRight size={16} /></a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ---------------- how ---------------- */
const STEPS = [['Фото или звонок', 'Пришлите фото пореза или позвоните — скажем, есть ли смысл ехать.'], ['Приезжаете', `${b.addr}, к согласованному времени.`], ['Осмотр изнутри', 'Снимаем шину, смотрим корд с внутренней стороны, называем способ и цену.'], ['Ремонт и проверка', 'Ставим заплатку, балансируем, проверяем давление.']]
function How() {
  return (
    <section id="how" className="scroll-mt-16 border-t border-[#171513] bg-[#fbf8f2] px-4 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-[1440px]">
        <p className={`${M} text-[13px] text-[#171513]/70`}>§ 4 · Как это работает</p>
        <h2 className={`${S} mt-3 text-[clamp(38px,5.4vw,80px)] font-medium leading-[1] tracking-[-0.02em]`}>Четыре шага</h2>
        <ol className="mt-12 grid gap-8 md:grid-cols-4 md:gap-6">
          {STEPS.map(([h, d], i) => (
            <Reveal as="li" key={h} delay={i * 0.06} className="relative border-t-2 border-[#171513] pt-6">
              <span className={`${M} absolute -top-[14px] left-0 grid h-7 w-7 place-items-center rounded-full bg-[#ff5b14] text-[13px] font-semibold`}>{i + 1}</span>
              <h3 className={`${S} text-[26px] font-medium leading-tight`}>{h}</h3>
              <p className="mt-2 text-[16px] leading-snug text-[#171513]/75">{d}</p>
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
    <section id="rating" className="scroll-mt-16 border-y border-[#171513] px-4 py-20 md:px-8 md:py-28">
      <div className="mx-auto grid max-w-[1440px] gap-10 md:grid-cols-[auto_1fr] md:items-center md:gap-16">
        <div>
          <p className={`${M} text-[13px] text-[#171513]/70`}>§ 5 · Яндекс Карты</p>
          <p className={`${S} text-[clamp(120px,18vw,260px)] font-medium leading-[.9] tracking-[-0.04em]`}>{b.rating}</p>
          <p className={`${M} text-[15px]`}>{b.rev} оценок</p>
        </div>
        <div>
          <p className={`${M} text-[13px] text-[#171513]/70`}>О чём чаще всего пишут в отзывах</p>
          <ul className="mt-4 space-y-4">
            {['Порез на боковине отремонтировали большой заплаткой, а не заклёпкой', 'Заправили кондиционер и проверили систему на утечку'].map(t => (
              <li key={t} className={`${S} border-l-4 border-[#ff5b14] pl-5 text-[clamp(22px,2.4vw,32px)] leading-snug`}>{t}</li>
            ))}
          </ul>
          <a href={`https://yandex.ru/maps/org/${b.oid}/reviews/`} target="_blank" rel="noopener" className={`${M} mt-8 inline-flex h-12 items-center gap-2 rounded-full border-2 border-[#171513] px-5 text-[14px] font-medium hover:bg-[#171513] hover:text-[#f2ede3]`}>Все отзывы на Яндексе <ArrowUpRight size={16} /></a>
        </div>
      </div>
    </section>
  )
}

/* ---------------- FAQ ---------------- */
const FAQ = [
  ['Сколько длится ремонт пореза?', 'Зависит от размера и места повреждения. Обычно это не минуты, а около часа или больше — мастер скажет точнее после осмотра.'],
  ['Можно ли ездить с заплаткой на боковине?', 'Если ремонт возможен и сделан заплаткой с кордом — шина продолжает служить. Если повреждение опасное, мастер честно скажет, что лучше заменить.'],
  ['Как понять заранее, есть ли смысл ехать?', 'Пришлите фото пореза через форму на сайте или позвоните. По фото мастер подскажет, но окончательно — после осмотра изнутри.'],
  ['Сколько стоит?', 'Цена зависит от размера шины и характера повреждения. Мастер назовёт её до начала работ.'],
  ['Как оплатить?', 'Способы оплаты уточняйте по телефону.'],
  ['Нужна ли запись?', 'Лучше записаться или позвонить заранее — так не придётся ждать.'],
]
function Faq() {
  const [o, setO] = useState(0)
  return (
    <section id="faq" className="px-4 py-20 md:px-8 md:py-28">
      <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[.7fr_1.3fr]">
        <div><p className={`${M} text-[13px] text-[#171513]/70`}>§ 6</p><h2 className={`${S} mt-3 text-[clamp(38px,5.4vw,80px)] font-medium leading-[1] tracking-[-0.02em]`}>Вопросы</h2></div>
        <div className="border-t-2 border-[#171513]">
          {FAQ.map(([q, a], i) => (
            <div key={q} className="border-b border-[#171513]">
              <h3><button type="button" aria-expanded={o === i} aria-controls={'pq' + i} onClick={() => setO(o === i ? -1 : i)} className={`${S} flex w-full items-center justify-between gap-6 py-5 text-left text-[21px] font-medium leading-snug md:text-[24px]`}>{q}<span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-[#171513] ${o === i ? 'bg-[#ff5b14]' : ''}`}>{o === i ? <Minus size={18} /> : <Plus size={18} />}</span></button></h3>
              <AnimatePresence initial={false}>{o === i && <motion.div id={'pq' + i} initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden"><p className="max-w-[680px] pb-6 text-[17px] leading-relaxed text-[#171513]/80">{a}</p></motion.div>}</AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------- photo request + booking ---------------- */
const MAXF = 5
function Thumb({ f, onRemove }) {
  return (
    <motion.li layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="relative aspect-square overflow-hidden rounded-lg border border-[#171513]">
      <img src={f.url} alt={'Фото: ' + f.name} className="h-full w-full object-cover" />
      <button type="button" onClick={onRemove} aria-label={'Удалить ' + f.name} className="absolute right-1 top-1 grid h-9 w-9 place-items-center rounded-full bg-[#ff5b14] text-[#171513]"><X size={17} /></button>
    </motion.li>
  )
}
const inputCls = 'mt-1.5 h-14 w-full rounded-lg border-2 bg-white px-4 text-[17px] outline-none focus:border-[#ff5b14]'
function PhotoForm({ prefill }) {
  const [files, setFiles] = useState([])
  const [note, setNote] = useState(prefill || '')
  const [phone, setPhone] = useState('')
  const [err, setErr] = useState('')
  const [state, setState] = useState('form')
  const filesRef = useRef(files); filesRef.current = files
  useEffect(() => () => filesRef.current.forEach(f => URL.revokeObjectURL(f.url)), [])
  useEffect(() => { if (prefill) setNote(prefill) }, [prefill])
  const add = list => { const imgs = Array.from(list || []).filter(f => f.type.startsWith('image/')); setFiles(prev => [...prev, ...imgs.slice(0, MAXF - prev.length).map(f => ({ id: Math.random().toString(36).slice(2), url: URL.createObjectURL(f), name: f.name }))]) }
  const remove = id => setFiles(prev => { const f = prev.find(x => x.id === id); if (f) URL.revokeObjectURL(f.url); return prev.filter(x => x.id !== id) })
  const submit = e => { e.preventDefault(); if (phone.replace(/\D/g, '').length < 12) return setErr('Нужен номер: 12 цифр с кодом +375'); setErr(''); setState('loading'); setTimeout(() => setState('sent'), 1000) }
  if (state === 'sent') return (
    <div className="py-8 text-center" role="status">
      <CheckDraw className="mx-auto text-[#ff5b14]" />
      <p className={`${S} mt-5 text-[34px] font-medium`}>Фото у мастера</p>
      <p className="mx-auto mt-2 max-w-[420px] text-[16px] text-[#171513]/75">{files.length ? `${files.length} фото. ` : ''}Перезвоним на {phone} и скажем, что можно сделать. В готовом сайте заявка с фото сразу придёт вам в Telegram.</p>
      <button type="button" onClick={() => { files.forEach(f => URL.revokeObjectURL(f.url)); setFiles([]); setPhone(''); setState('form') }} className={`${M} mt-6 min-h-[44px] text-[14px] underline underline-offset-4`}>Новая заявка</button>
    </div>
  )
  return (
    <form onSubmit={submit} noValidate>
      <p className={`${M} text-[13px] text-[#171513]/70`} id="pp-fl">1 · Фото пореза ({files.length}/{MAXF}) — снаружи и, если можно, линейка рядом</p>
      <label onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); add(e.dataTransfer.files) }} className={`mt-3 flex min-h-[130px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#171513]/45 p-5 text-center hover:bg-white focus-within:outline focus-within:outline-[3px] focus-within:outline-[#ff5b14] ${files.length >= MAXF ? 'pointer-events-none opacity-50' : ''}`}>
        <input type="file" accept="image/*" multiple className="sr-only" aria-describedby="pp-fl" disabled={files.length >= MAXF} onChange={e => { add(e.target.files); e.target.value = '' }} />
        <ImagePlus size={28} aria-hidden="true" />
        <span className={`${S} text-[22px] font-medium`}>Добавить фото</span>
        <span className="text-[14px] text-[#171513]/65">Нажмите или перетащите. С телефона можно сразу снять.</span>
      </label>
      {files.length > 0 && <ul className="mt-3 grid grid-cols-5 gap-2"><AnimatePresence>{files.map(f => <Thumb key={f.id} f={f} onRemove={() => remove(f.id)} />)}</AnimatePresence></ul>}
      <label htmlFor="pp-note" className={`${M} mt-6 block text-[13px] text-[#171513]/70`}>2 · Что и где (необязательно)</label>
      <input id="pp-note" value={note} onChange={e => setNote(e.target.value)} placeholder="Боковина, порез ~15 мм" className={inputCls + ' border-[#171513]/30 placeholder:text-[#171513]/40'} />
      <label htmlFor="pp-phone" className={`${M} mt-6 block text-[13px] text-[#171513]/70`}>3 · Телефон</label>
      <div className="mt-1.5 flex flex-col gap-3 sm:flex-row">
        <input id="pp-phone" value={phone} onChange={e => { setPhone(e.target.value); setErr('') }} onFocus={() => { if (!phone) setPhone('+375 ') }} type="tel" inputMode="tel" autoComplete="tel" placeholder="+375 __ ___-__-__" aria-invalid={!!err} aria-describedby={err ? 'pp-perr' : undefined} className={`h-14 flex-1 rounded-lg border-2 bg-white px-4 text-[17px] outline-none focus:border-[#ff5b14] ${err ? 'border-[#b42318]' : 'border-[#171513]/30'}`} />
        <button type="submit" disabled={state === 'loading'} className={`${M} h-14 rounded-full bg-[#171513] px-6 text-[15px] font-semibold text-[#f2ede3] hover:bg-[#ff5b14] hover:text-[#171513] disabled:opacity-60`}>{state === 'loading' ? 'Отправляем…' : 'Отправить фото'}</button>
      </div>
      {err && <p id="pp-perr" className="mt-2 text-[15px] font-medium text-[#b42318]" role="alert">{err}</p>}
      <p className="mt-4 text-[13px] text-[#171513]/60">В демо-версии фото остаются в вашем браузере.</p>
    </form>
  )
}
const BSV = ['Ремонт пореза / прокола', 'Шиномонтаж', 'Переобувка', 'Заправка кондиционера', 'Проверка на утечку']
const DAYS = ['Сегодня', 'Завтра', 'На этой неделе', 'Перезвоните мне']
function Opt({ on, children, ...r }) {
  return <button type="button" aria-pressed={on} className={`${M} min-h-[52px] rounded-full border-2 px-5 text-[15px] transition-colors ${on ? 'border-[#171513] bg-[#171513] text-[#f2ede3]' : 'border-[#171513]/25 hover:border-[#171513]'}`} {...r}>{children}</button>
}
function BookForm() {
  const bk = useBooking()
  const [step, setStep] = useState(0)
  const [day, setDay] = useState('')
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
  if (bk.s.sent) return (
    <div className="py-8 text-center" role="status">
      <CheckDraw className="mx-auto text-[#ff5b14]" />
      <p className={`${S} mt-5 text-[34px] font-medium`}>Записали</p>
      <p className="mx-auto mt-2 max-w-[420px] text-[16px] text-[#171513]/75">{bk.s.svc} · {day}. Мастер перезвонит и подтвердит время. В готовом сайте заявка сразу придёт вам в Telegram.</p>
      <button type="button" onClick={() => { bk.reset(); setStep(0); setDay('') }} className={`${M} mt-6 min-h-[44px] text-[14px] underline underline-offset-4`}>Новая заявка</button>
    </div>
  )
  return (
    <form onSubmit={next} noValidate>
      <ol className={`${M} grid grid-cols-3 gap-2 text-[12.5px]`} aria-label="Шаги">{['Услуга', 'Когда', 'Контакт'].map((t, i) => <li key={t} aria-current={i === step ? 'step' : undefined} className={`border-t-4 pt-2 ${i <= step ? 'border-[#ff5b14]' : 'border-[#171513]/15 text-[#171513]/50'}`}>{i + 1}. {t}</li>)}</ol>
      <h3 ref={head} tabIndex={-1} className={`${S} mt-6 text-[28px] font-medium outline-none`}>{['Что нужно сделать?', 'Когда удобно?', 'Как с вами связаться?'][step]}</h3>
      <div className="mt-5">
        {step === 0 && <div className="flex flex-wrap gap-2">{custom && <Opt on>{bk.s.svc}</Opt>}{BSV.map(s => <Opt key={s} on={bk.s.svc === s} onClick={() => { bk.upd('svc', s); setErr('') }}>{s}</Opt>)}</div>}
        {step === 1 && <div className="flex flex-wrap gap-2">{DAYS.map(d => <Opt key={d} on={day === d} onClick={() => { setDay(d); setErr('') }}>{d}</Opt>)}</div>}
        {step === 2 && <div className="grid gap-4 sm:grid-cols-2">
          <div><label htmlFor="pb-name" className={`${M} text-[13px] text-[#171513]/70`}>Имя</label><input id="pb-name" value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} autoComplete="name" className={inputCls + ' border-[#171513]/30'} /></div>
          <div><label htmlFor="pb-phone" className={`${M} text-[13px] text-[#171513]/70`}>Телефон</label><input id="pb-phone" value={bk.s.phone} onChange={e => bk.upd('phone', e.target.value)} onFocus={phoneFocus(bk)} type="tel" inputMode="tel" autoComplete="tel" placeholder="+375 __ ___-__-__" aria-invalid={bk.s.err} aria-describedby={bk.s.err ? 'pb-perr' : undefined} className={inputCls + (bk.s.err ? ' border-[#b42318]' : ' border-[#171513]/30')} />
            {bk.s.err && <p id="pb-perr" className="mt-2 text-[15px] font-medium text-[#b42318]">Проверьте номер — 12 цифр с кодом +375.</p>}</div>
        </div>}
      </div>
      {err && <p className="mt-4 text-[15px] font-medium text-[#b42318]" role="alert">{err}</p>}
      <div className="mt-8 flex items-center justify-between">
        {step > 0 ? <button type="button" onClick={() => setStep(step - 1)} className={`${M} min-h-[44px] text-[14px] text-[#171513]/70 hover:text-[#171513]`}>← Назад</button> : <span />}
        <button type="submit" disabled={bk.s.loading} className={`${M} inline-flex h-14 items-center gap-2 rounded-full bg-[#ff5b14] px-6 text-[15px] font-semibold text-[#171513] hover:bg-[#171513] hover:text-[#f2ede3] disabled:opacity-60`}>{step < 2 ? 'Дальше' : bk.s.loading ? 'Отправляем…' : 'Записаться'} <ArrowRight size={17} /></button>
      </div>
    </form>
  )
}
function Book() {
  const [tab, setTab] = useState('photo')
  const [prefill, setPrefill] = useState('')
  useEffect(() => {
    const h = e => { setTab(e.detail.tab); if (e.detail.prefill) setPrefill(e.detail.prefill) }
    window.addEventListener('pp-tab', h)
    const svc = e => { if (e.target.closest('[data-svc]')) setTab('book') }
    document.addEventListener('click', svc)
    return () => { window.removeEventListener('pp-tab', h); document.removeEventListener('click', svc) }
  }, [])
  return (
    <section id="book" className="scroll-mt-16 bg-[#ff5b14] px-4 py-20 md:px-8 md:py-28">
      <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[.8fr_1.2fr]">
        <div>
          <p className={`${M} text-[13px]`}>§ 7 · Связаться</p>
          <h2 className={`${S} mt-3 text-[clamp(42px,6vw,92px)] font-medium leading-[.98] tracking-[-0.025em]`}>Пришлите <span className="italic">фото</span> пореза.</h2>
          <p className="mt-5 max-w-[440px] text-[18px] leading-snug">Мастер посмотрит и скажет, можно ли спасти шину. Или запишитесь сразу — в три шага.</p>
          <p className={`${M} mt-8 text-[13px]`}>Или позвоните</p>
          <a href={'tel:' + tel(b.phone)} className={`${S} text-[clamp(30px,3.4vw,46px)] font-medium underline decoration-2 underline-offset-[6px]`}>{b.phone}</a>
        </div>
        <div className="rounded-2xl border-2 border-[#171513] bg-[#f2ede3] p-5 md:p-8">
          <div role="tablist" aria-label="Тип заявки" className="mb-7 grid grid-cols-2 rounded-full border-2 border-[#171513] p-1">
            {[['photo', 'Фото пореза'], ['book', 'Запись']].map(([k, t]) => <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`${M} min-h-[44px] rounded-full text-[14px] font-medium ${tab === k ? 'bg-[#171513] text-[#f2ede3]' : ''}`}>{t}</button>)}
          </div>
          {tab === 'photo' ? <PhotoForm prefill={prefill} /> : <BookForm />}
        </div>
      </div>
    </section>
  )
}

function Contact() {
  return (
    <section id="contact" className="scroll-mt-16 bg-[#171513] text-[#f2ede3]">
      <div className="mx-auto grid max-w-[1440px] lg:grid-cols-[.9fr_1.1fr]">
        <div className="px-4 py-20 md:px-8">
          <p className={`${M} text-[13px] text-[#f2ede3]/70`}>§ 8 · Контакты</p>
          <h2 className={`${S} mt-3 text-[clamp(38px,5.4vw,80px)] font-medium leading-[1]`}>Как доехать</h2>
          <dl className="mt-10 space-y-6">
            <div><dt className={`${M} text-[13px] text-[#f2ede3]/60`}>Адрес</dt><dd className={`${S} mt-1 text-[26px]`}>{b.addr}<br />{b.district}, {b.city}</dd></div>
            <div><dt className={`${M} text-[13px] text-[#f2ede3]/60`}>Телефон</dt><dd><a href={'tel:' + tel(b.phone)} className={`${S} mt-1 inline-block text-[26px] text-[#ff5b14] underline-offset-4 hover:underline`}>{b.phone}</a></dd></div>
            <div><dt className={`${M} text-[13px] text-[#f2ede3]/60`}>Часы работы</dt><dd className="mt-1 text-[17px]">Уточняйте по телефону</dd></div>
          </dl>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={'tel:' + tel(b.phone)} className={`${M} inline-flex h-14 items-center gap-2 rounded-full bg-[#ff5b14] px-6 text-[15px] font-semibold text-[#171513]`}><Phone size={16} />Позвонить</a>
            <a href={`https://yandex.ru/maps/org/${b.oid}/`} target="_blank" rel="noopener" className={`${M} inline-flex h-14 items-center gap-2 rounded-full border-2 border-[#f2ede3]/40 px-6 text-[15px] font-medium hover:border-[#f2ede3]`}>Маршрут в Яндексе <ArrowUpRight size={16} /></a>
          </div>
        </div>
        <div className="h-[400px] lg:h-auto lg:min-h-[560px]"><MapFrame oid={b.oid} /></div>
      </div>
    </section>
  )
}

function App() {
  useSmooth()
  const lite = useLite()
  return (
    <MotionConfig reducedMotion="user">
      <div className="overflow-x-clip font-['IBM_Plex_Serif',serif]" style={{ background: PAPER, color: INK, '--sel': OR, '--selc': INK }}>
        <Ribbon name={b.name} bg={INK} fg={PAPER} />
        <Header />
        <main>
          <Film lite={lite} />
          <Repair />
          <Rules />
          <Services />
          <How />
          <Rating />
          <Faq />
          <Book />
          <Contact />
        </main>
        <footer className={`${M} flex flex-wrap justify-between gap-3 border-t border-[#f2ede3]/20 bg-[#171513] px-4 py-6 text-[12.5px] text-[#f2ede3]/60 md:px-8`}><span>© 2026 {b.name} · Концепт сайта — Артём</span><span>{b.addr}, {b.city}</span></footer>
        <CallBar phone={b.phone} barCls="bg-[#f2ede3] border-t border-[#171513]" callCls="rounded-full border-2 border-[#171513] text-[#171513]" bookCls="rounded-full bg-[#ff5b14] text-[#171513]" />
        <div className="h-[72px] bg-[#171513] sm:hidden" />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
