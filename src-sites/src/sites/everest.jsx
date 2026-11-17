import React, { useEffect, useRef, useState, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, useSpring, useInView, AnimatePresence, MotionConfig } from 'framer-motion'
import { ArrowRight, ArrowLeft, Phone, ArrowUpRight } from 'lucide-react'
import '../lib/base.css'
import { useSmooth, Ribbon, LineReveal, Reveal, useBooking, phoneFocus, CheckDraw, MapFrame, CallBar, tel, useLite, IG, TG } from '../lib/kit'

const Film3D = lazy(() => import('./everest3d').then(m => ({ default: m.AssemblyFilm })))
const Config3D = lazy(() => import('./everest3d').then(m => ({ default: m.Configurator })))

const b = {
  name: 'Эверест', addr: 'просп. Газеты Звязда, 16, корп. 1', city: 'Минск',
  phone: '+375 29 392-55-55', phone2: '+375 33 392-55-55',
  viber: 'viber://chat?number=%2B375333925555', wa: 'https://wa.me/375333925555',
  ig: 'https://www.instagram.com/everestminsk', tg: 'https://t.me/375333925555', vk: 'https://vk.ru/everestminsk',
  rating: '5,0', rev: 127, oid: '1577954445',
}
const CREAM = '#f2ede4', INK = '#2b2723', OAK = '#a77c4f', SOFT = '#7c746a'
const SERIF = "font-['Cormorant_Garamond',serif]"

const SW = {
  oak: { t: 'Дуб', css: 'repeating-linear-gradient(92deg,#c49a6c 0 6px,#b98c5d 6px 9px,#c9a174 9px 15px,#a87b4e 15px 16px)' },
  enamel: { t: 'Эмаль', css: 'radial-gradient(circle at 30% 25%,#fffdf8,#ece5d8 55%,#d6cdbd)' },
  veneer: { t: 'Шпон', css: 'repeating-linear-gradient(88deg,#6a4a35 0 5px,#5a3d2a 5px 7px,#7a573f 7px 13px,#3d2718 13px 14px)' },
  glass: { t: 'Стекло', css: 'linear-gradient(135deg,rgba(190,205,202,.9),rgba(150,168,165,.6) 50%,rgba(220,228,226,.9))' },
}
const TYPES = [['kitchen', 'Кухня'], ['wardrobe', 'Шкаф'], ['walkin', 'Гардеробная']]
const LAYOUTS = [['straight', 'Прямая'], ['l', 'Угловая'], ['u', 'П-образная']]

/* ---------- header ---------- */
function Header() {
  return (
    <header className="sticky top-0 z-50 bg-[#f2ede4]/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-6 md:px-14">
        <a href="#top" className={`${SERIF} text-[26px] font-light tracking-[.18em]`}>ЭВЕРЕСТ</a>
        <nav className="hidden gap-10 text-[13px] font-light tracking-[.08em] lg:flex">
          <a href="#film" className="hover:text-[#a77c4f]">Как мы собираем</a><a href="#build" className="hover:text-[#a77c4f]">Собрать</a><a href="#rooms" className="hover:text-[#a77c4f]">Мебель</a><a href="#contact" className="hover:text-[#a77c4f]">Салон</a>
        </nav>
        <a href="#book" className="border-b border-[#2b2723]/40 pb-0.5 text-[13px] tracking-[.08em] hover:border-[#a77c4f] hover:text-[#a77c4f]">Заказать замер</a>
      </div>
    </header>
  )
}

/* ---------- hero ---------- */
function Disc({ css, cls, delay, label }) {
  return (
    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.6, delay, ease: [0.16, 1, 0.3, 1] }} className={'absolute ' + cls}>
      <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 7 + delay * 2, repeat: Infinity, ease: 'easeInOut' }} className="flex flex-col items-center gap-4">
        <div className="aspect-square w-full rounded-full shadow-[0_40px_60px_-30px_rgba(60,40,20,.45),inset_0_2px_6px_rgba(255,255,255,.5),inset_0_-10px_20px_rgba(0,0,0,.12)]" style={{ background: css }} />
        <span className="text-[11px] font-light uppercase tracking-[.3em]" style={{ color: SOFT }}>{label}</span>
      </motion.div>
    </motion.div>
  )
}
function Hero() {
  return (
    <section id="top" className="relative overflow-hidden px-6 md:px-14" style={{ background: CREAM }}>
      <div className="mx-auto grid min-h-[calc(100svh-100px)] max-w-[1500px] items-center gap-10 py-14 md:grid-cols-[1.25fr_1fr] md:py-0">
        <div>
          <p className="text-[12px] font-light uppercase tracking-[.32em]" style={{ color: SOFT }}>Мебель на заказ · Минск</p>
          <h1 className={`${SERIF} mt-8 text-[clamp(54px,8.6vw,148px)] font-light leading-[.92] tracking-[-.02em]`}>
            <LineReveal delay={0.15}>Сделано</LineReveal>
            <LineReveal delay={0.3}>по вашим</LineReveal>
            <LineReveal delay={0.45} className="italic" ><span style={{ color: OAK }}>меркам.</span></LineReveal>
          </h1>
          <Reveal delay={0.7} className="mt-10 max-w-[420px] text-[16px] font-light leading-relaxed" style={{ color: SOFT }}>
            Кухни, шкафы и гардеробные, которые встают в ваш дом до миллиметра. Дуб, эмаль, шпон, стекло — материалы, к которым хочется прикасаться.
          </Reveal>
          <Reveal delay={0.85} className="mt-10 flex flex-wrap items-center gap-8">
            <a href="#build" className="inline-flex h-14 items-center gap-3 rounded-full px-8 text-[14px] tracking-[.06em] text-[#f2ede4]" style={{ background: INK }}>Собрать свою <ArrowRight size={16} strokeWidth={1.4} /></a>
            <span className="text-[13px] font-light" style={{ color: SOFT }}><span className={`${SERIF} text-[26px] text-[#2b2723]`}>{b.rating}</span> · {b.rev} оценок на Яндекс Картах</span>
          </Reveal>
        </div>
        <div className="relative mx-auto aspect-[1/1.05] w-full max-w-[520px]">
          <Disc css={SW.oak.css} label="Дуб" cls="left-[6%] top-[4%] w-[46%]" delay={0.4} />
          <Disc css="radial-gradient(circle at 30% 25%,#f5f5f2,#c8c8c4 50%,#9a9a96)" label="Алюминий" cls="right-[4%] top-[30%] w-[34%]" delay={0.6} />
          <Disc css={SW.enamel.css} label="Эмаль" cls="left-[22%] bottom-[0%] w-[38%]" delay={0.8} />
        </div>
      </div>
    </section>
  )
}

/* ---------- pinned film ---------- */
const CAPS = [
  { r: [0, 0.01, 0.26, 0.3], n: 'I', t: 'Корпус', d: 'Основа, которую не видно. Ровная геометрия, точные зазоры, плотные соединения.' },
  { r: [0.3, 0.34, 0.47, 0.51], n: 'II', t: 'Фасады', d: 'Лицо мебели. Дуб с живой текстурой, эмаль, шпон — под ваш интерьер.' },
  { r: [0.51, 0.55, 0.6, 0.63], n: 'III', t: 'Столешница', d: 'Рабочая поверхность, рассчитанная на каждый день.' },
  { r: [0.63, 0.67, 0.8, 0.84], n: 'IV', t: 'Стекло и свет', d: 'Витрины и мягкая подсветка — чтобы кухня жила и вечером.' },
  { r: [0.84, 0.88, 1.1, 1.2], n: 'V', t: 'Ваша кухня', d: 'Собрана из сотен деталей. Ощущается как одна.' },
]
function Caption({ p, c }) {
  const [a, b2, c2, d] = c.r
  const o = useTransform(p, [a, b2, c2, d], [a === 0 ? 1 : 0, 1, 1, 0])
  const y = useTransform(p, [a, b2], [a === 0 ? 0 : 30, 0])
  const f = useTransform(p, [a, b2, c2, d], ['blur(8px)', 'blur(0px)', 'blur(0px)', 'blur(8px)'])
  return (
    <motion.div style={{ opacity: o, y, filter: f }} className="absolute inset-x-0 bottom-0">
      <p className={`${SERIF} text-[22px] italic`} style={{ color: OAK }}>{c.n}.</p>
      <h3 className={`${SERIF} mt-1 text-[clamp(44px,6vw,96px)] font-light leading-[.95]`}>{c.t}</h3>
      <p className="mt-4 max-w-[340px] text-[15px] font-light leading-relaxed" style={{ color: SOFT }}>{c.d}</p>
    </motion.div>
  )
}
function LiteAssembly({ p }) {
  const items = [[0.06, 0.3, 'bg-[#ece7de]', 'left-[10%] top-[40%] w-[80%] h-[32%]'], [0.3, 0.5, '', 'left-[11%] top-[42%] w-[78%] h-[28%]'], [0.5, 0.62, 'bg-[#d9d4cb]', 'left-[8%] top-[38%] w-[84%] h-[3%]'], [0.62, 0.74, 'bg-[#a9b8b5]/60', 'left-[10%] top-[8%] w-[80%] h-[24%]']]
  return (
    <div className="absolute inset-0 md:left-[40%]">
      {items.map(([a, z, cls, pos], k) => <LiteBlock key={k} p={p} a={a} z={z} cls={cls} pos={pos} oak={k === 1} />)}
    </div>
  )
}
function LiteBlock({ p, a, z, cls, pos, oak }) {
  const o = useTransform(p, [a, z], [0, 1]), y = useTransform(p, [a, z], [60, 0])
  return <motion.div style={{ opacity: o, y, background: oak ? SW.oak.css : undefined }} className={'absolute rounded-[2px] shadow-[0_30px_40px_-30px_rgba(0,0,0,.4)] ' + cls + ' ' + pos} />
}
function Film({ lite }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const p = useSpring(scrollYProgress, { stiffness: 70, damping: 24, mass: 0.7 })
  const near = useInView(ref, { margin: '200px 0px 200px 0px' })
  const bar = useTransform(p, [0, 1], ['0%', '100%'])
  return (
    <section ref={ref} id="film" className="relative h-[560vh]" style={{ background: '#ebe5da' }}>
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="absolute inset-0">{!lite ? (near && <Suspense fallback={null}><Film3D progress={p} active={near} /></Suspense>) : <LiteAssembly p={p} />}</div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-[#ebe5da] via-[#ebe5da]/70 to-transparent md:hidden" />
        <div className="relative mx-auto flex h-full max-w-[1500px] flex-col justify-between px-6 pb-28 pt-20 md:px-14 md:pb-16 md:pt-24">
          <p className="text-[12px] font-light uppercase tracking-[.32em]" style={{ color: SOFT }}>Как собирается кухня</p>
          <div className="relative h-[220px] md:h-[300px] md:max-w-[460px]">{CAPS.map((c, i) => <Caption key={i} p={p} c={c} />)}</div>
          <div className="absolute bottom-16 right-14 hidden w-[240px] md:block">
            <div className="h-px bg-[#2b2723]/15"><motion.div style={{ width: bar }} className="h-px bg-[#2b2723]" /></div>
            <div className={`${SERIF} mt-3 flex justify-between text-[15px] italic`} style={{ color: SOFT }}>{CAPS.map(c => <span key={c.n}>{c.n}</span>)}</div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- rooms (quiet list) ---------- */
const ROOMS = [
  ['Кухни', 'Прямые, угловые, П-образные, с островом', 'oak'],
  ['Шкафы', 'Распашные и купе, во всю высоту стены', 'enamel'],
  ['Гардеробные', 'Открытые системы, ящики, штанги, подсветка', 'veneer'],
  ['Прихожие', 'Хранение, зеркало, место для обуви', 'oak'],
  ['Детские', 'Мебель, которая растёт вместе с ребёнком', 'enamel'],
  ['Гостиные', 'ТВ-зоны, стеллажи, витрины', 'glass'],
]
function Rooms() {
  const [h, setH] = useState(0)
  return (
    <section id="rooms" className="px-6 py-28 md:px-14 md:py-40" style={{ background: CREAM }}>
      <div className="mx-auto grid max-w-[1500px] gap-16 md:grid-cols-[1fr_1.4fr]">
        <div className="md:sticky md:top-32 md:self-start">
          <p className="text-[12px] font-light uppercase tracking-[.32em]" style={{ color: SOFT }}>Мебель</p>
          <h2 className={`${SERIF} mt-6 text-[clamp(40px,5vw,80px)] font-light leading-[1]`}><LineReveal>Для каждой</LineReveal><LineReveal delay={0.1} className="italic">комнаты.</LineReveal></h2>
          <motion.div key={h} initial={{ clipPath: 'inset(0 0 100% 0)' }} animate={{ clipPath: 'inset(0 0 0% 0)' }} transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }} className="mt-12 hidden aspect-[4/5] w-[70%] rounded-[2px] md:block" style={{ background: SW[ROOMS[h][2]].css }} />
        </div>
        <ul>
          {ROOMS.map(([t, d], i) => (
            <li key={t} onMouseEnter={() => setH(i)} className="group border-t border-[#2b2723]/12 last:border-b">
              <a href="#build" className="flex items-baseline justify-between gap-6 py-8">
                <span className="flex items-baseline gap-6">
                  <span className={`${SERIF} text-[16px] italic`} style={{ color: OAK }}>0{i + 1}</span>
                  <span className={`${SERIF} text-[clamp(34px,4vw,60px)] font-light leading-none transition-transform duration-700 group-hover:translate-x-3`}>{t}</span>
                </span>
                <span className="hidden max-w-[260px] text-right text-[14px] font-light md:block" style={{ color: SOFT }}>{d}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ---------- configurator ---------- */
function LayoutIcon({ k }) {
  const d = k === 'straight' ? 'M4 6h32' : k === 'l' ? 'M4 6h32M4 6v24' : 'M4 30V6h32v24'
  return <svg viewBox="0 0 40 36" width="40" height="36" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="square"><path d={d} /></svg>
}
function LiteConfig({ facade }) {
  return <div className="absolute inset-[18%] rounded-[2px] shadow-[0_40px_60px_-30px_rgba(60,40,20,.5)]" style={{ background: SW[facade].css }} />
}
function Builder({ lite }) {
  const [type, setType] = useState('kitchen')
  const [facade, setFacade] = useState('oak')
  const [layout, setLayout] = useState('l')
  const ref = useRef(null)
  const near = useInView(ref, { margin: '200px 0px 200px 0px' })
  const tName = TYPES.find(t => t[0] === type)[1], lName = LAYOUTS.find(t => t[0] === layout)[1]
  const order = () => { window.dispatchEvent(new CustomEvent('ev-svc', { detail: `${tName} · ${lName.toLowerCase()} · ${SW[facade].t.toLowerCase()}` })); const el = document.getElementById('book'); window.__lenis ? window.__lenis.scrollTo(el, { offset: -60 }) : el.scrollIntoView() }
  const label = 'text-[11px] font-light uppercase tracking-[.3em]'
  return (
    <section ref={ref} id="build" className="px-6 py-28 md:px-14 md:py-36" style={{ background: '#e9e2d6' }}>
      <div className="mx-auto max-w-[1500px]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className={`${SERIF} text-[clamp(44px,6vw,100px)] font-light leading-[.95]`}><LineReveal>Соберите</LineReveal><LineReveal delay={0.1} className="italic">свою.</LineReveal></h2>
          <p className="max-w-[360px] text-[15px] font-light leading-relaxed" style={{ color: SOFT }}>Выберите тип, материал фасадов и планировку — модель перестроится. Точный проект сделаем после замера.</p>
        </div>
        <div className="mt-14 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
          <div className="relative aspect-[4/3.4] overflow-hidden rounded-[2px] bg-[#efe9df] md:aspect-[16/11]">
            {!lite ? (near && <Suspense fallback={null}><Config3D type={type} facade={facade} layout={layout} active={near} /></Suspense>) : <LiteConfig facade={facade} />}
            <p className={`${SERIF} pointer-events-none absolute bottom-5 left-6 text-[20px] italic`} style={{ color: SOFT }}>{tName} · {lName.toLowerCase()} · {SW[facade].t.toLowerCase()}</p>
          </div>
          <div className="grid content-start gap-10">
            <div>
              <p className={label} style={{ color: SOFT }}>Тип</p>
              <div className="mt-4 flex flex-wrap gap-x-7 gap-y-2">
                {TYPES.map(([k, t]) => <button key={k} onClick={() => setType(k)} aria-pressed={type === k} className={`${SERIF} relative pb-1 text-[30px] font-light transition-colors ${type === k ? '' : 'text-[#2b2723]/40 hover:text-[#2b2723]/70'}`}>{t}{type === k && <motion.span layoutId="tline" className="absolute inset-x-0 bottom-0 h-px bg-[#2b2723]" />}</button>)}
              </div>
            </div>
            <div>
              <p className={label} style={{ color: SOFT }}>Фасады</p>
              <div className="mt-5 flex gap-5">
                {Object.entries(SW).map(([k, s]) => (
                  <button key={k} onClick={() => setFacade(k)} aria-pressed={facade === k} className="group flex flex-col items-center gap-3">
                    <span className={'block h-14 w-14 rounded-full ring-offset-4 ring-offset-[#e9e2d6] transition-all duration-500 ' + (facade === k ? 'ring-1 ring-[#2b2723]' : 'group-hover:scale-105')} style={{ background: s.css, boxShadow: 'inset 0 -6px 12px rgba(0,0,0,.12), 0 14px 20px -12px rgba(60,40,20,.5)' }} />
                    <span className={'text-[12px] font-light tracking-[.08em] ' + (facade === k ? '' : 'text-[#2b2723]/50')}>{s.t}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className={label} style={{ color: SOFT }}>Планировка</p>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {LAYOUTS.map(([k, t]) => (
                  <button key={k} onClick={() => setLayout(k)} aria-pressed={layout === k} className={'flex flex-col items-center gap-3 border py-5 transition-colors duration-500 ' + (layout === k ? 'border-[#2b2723] text-[#2b2723]' : 'border-[#2b2723]/15 text-[#2b2723]/45 hover:border-[#2b2723]/40')}>
                    <LayoutIcon k={k} /><span className="text-[12px] font-light tracking-[.06em]">{t}</span>
                  </button>
                ))}
              </div>
            </div>
            <button onClick={order} className="inline-flex h-14 items-center justify-center gap-3 rounded-full text-[14px] tracking-[.06em] text-[#f2ede4]" style={{ background: INK }}>Заказать замер <ArrowRight size={16} strokeWidth={1.4} /></button>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- bento: process & proof ---------- */
function Bento() {
  const c = 'relative overflow-hidden rounded-[2px] p-8 md:p-10'
  const steps = [['Замер', 'Приезжаем, измеряем, обсуждаем задачу на месте.'], ['Проект', 'Показываем, как мебель встанет в комнату.'], ['Производство', 'Изготавливаем по вашим размерам.'], ['Монтаж', 'Собираем, выставляем, регулируем фасады.']]
  return (
    <section className="px-6 py-28 md:px-14 md:py-40" style={{ background: CREAM }}>
      <div className="mx-auto max-w-[1500px]">
        <p className="text-[12px] font-light uppercase tracking-[.32em]" style={{ color: SOFT }}>От замера до монтажа</p>
        <div className="mt-10 grid gap-4 md:grid-cols-4 md:grid-rows-[300px_300px]">
          <Reveal className={c + ' bg-[#2b2723] text-[#f2ede4] md:col-span-2 md:row-span-2'}>
            <p className="text-[11px] font-light uppercase tracking-[.3em] text-[#f2ede4]/50">Яндекс Карты</p>
            <p className={`${SERIF} mt-6 text-[clamp(110px,14vw,220px)] font-light leading-[.8]`}>{b.rating}</p>
            <p className="mt-6 text-[15px] font-light text-[#f2ede4]/65">{b.rev} оценок клиентов салона</p>
            <motion.div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full opacity-80" style={{ background: SW.oak.css }} animate={{ rotate: 360 }} transition={{ duration: 80, repeat: Infinity, ease: 'linear' }} />
          </Reveal>
          {steps.map(([t, d], i) => (
            <Reveal key={t} delay={i * 0.08} className={c + ' bg-[#e9e2d6]'}>
              <span className={`${SERIF} text-[18px] italic`} style={{ color: OAK }}>0{i + 1}</span>
              <h3 className={`${SERIF} mt-3 text-[38px] font-light leading-none`}>{t}</h3>
              <p className="mt-4 max-w-[260px] text-[14px] font-light leading-relaxed" style={{ color: SOFT }}>{d}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------- booking ---------- */
const WHAT = ['Кухня', 'Шкаф', 'Гардеробная', 'Прихожая', 'Детская', 'Другое']
const WHEN = ['Будни', 'Выходные', 'Утро', 'День', 'Вечер']
const STEPS = ['Что', 'Когда', 'Контакты']
function Chip({ on, children, onClick }) {
  return <button type="button" onClick={onClick} aria-pressed={on} className={'h-11 rounded-full border px-5 text-[14px] font-light tracking-[.04em] transition-colors duration-300 ' + (on ? 'border-[#2b2723] bg-[#2b2723] text-[#f2ede4]' : 'border-[#2b2723]/20 hover:border-[#2b2723]/60')}>{children}</button>
}
function Booking() {
  const bk = useBooking()
  const [step, setStep] = useState(0)
  const [when, setWhen] = useState([]), [area, setArea] = useState('')
  const [err, setErr] = useState('')
  useEffect(() => { const h = e => { bk.upd('svc', e.detail); setStep(0); setErr('') }; window.addEventListener('ev-svc', h); return () => window.removeEventListener('ev-svc', h) }, [])
  const next = () => {
    if (step === 0 && !bk.s.svc) return setErr('Выберите, что будем делать.')
    if (step === 1 && !when.length) return setErr('Отметьте удобное время для замера.')
    setErr(''); setStep(s => s + 1)
  }
  const onSubmit = e => { e.preventDefault(); if (step < 2) next(); else bk.submit() }
  const tog = w => { setErr(''); setWhen(a => a.includes(w) ? a.filter(x => x !== w) : [...a, w]) }
  const f = 'h-14 w-full border-b border-[#2b2723]/25 bg-transparent px-1 text-[18px] font-light outline-none placeholder:text-[#2b2723]/35 focus:border-[#2b2723]'
  return (
    <section id="book" className="px-6 py-28 md:px-14 md:py-40" style={{ background: '#e9e2d6' }}>
      <div className="mx-auto grid max-w-[1500px] gap-14 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <p className="text-[12px] font-light uppercase tracking-[.32em]" style={{ color: SOFT }}>Замер</p>
          <h2 className={`${SERIF} mt-6 text-[clamp(48px,6.4vw,110px)] font-light leading-[.92]`}><LineReveal>Начнём</LineReveal><LineReveal delay={0.1} className="italic">с размеров.</LineReveal></h2>
          <p className="mt-8 max-w-[380px] text-[15px] font-light leading-relaxed" style={{ color: SOFT }}>Оставьте заявку — договоримся о времени замера. Или позвоните:</p>
          <a href={'tel:' + tel(b.phone)} className={`${SERIF} mt-3 inline-block text-[34px] font-light hover:text-[#a77c4f]`}>{b.phone}</a>
        </div>
        <div className="bg-[#f2ede4] p-7 md:p-12">
          <AnimatePresence mode="wait">
            {!bk.s.sent ? (
              <motion.form key="f" onSubmit={onSubmit} noValidate exit={{ opacity: 0 }}>
                <ol className="mb-10 grid grid-cols-3 gap-3" aria-label="Шаги">
                  {STEPS.map((s, i) => (
                    <li key={s} aria-current={i === step ? 'step' : undefined}>
                      <div className="h-px bg-[#2b2723]/15"><motion.div className="h-px bg-[#2b2723]" animate={{ width: i <= step ? '100%' : '0%' }} transition={{ duration: 0.6 }} /></div>
                      <p className={`${SERIF} mt-3 text-[17px] italic ${i <= step ? '' : 'text-[#2b2723]/35'}`}>{['I', 'II', 'III'][i]}. {s}</p>
                    </li>
                  ))}
                </ol>
                <AnimatePresence mode="wait">
                  <motion.div key={step} initial={{ opacity: 0, filter: 'blur(6px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} exit={{ opacity: 0, filter: 'blur(6px)' }} transition={{ duration: 0.4 }} className="min-h-[230px]">
                    {step === 0 && (
                      <fieldset>
                        <legend className={`${SERIF} mb-6 text-[32px] font-light`}>Что будем делать?</legend>
                        <div className="flex flex-wrap gap-2">{WHAT.map(s => <Chip key={s} on={bk.s.svc === s} onClick={() => { bk.upd('svc', s); setErr('') }}>{s}</Chip>)}</div>
                        {bk.s.svc && !WHAT.includes(bk.s.svc) && <p className="mt-5 text-[14px] font-light" style={{ color: SOFT }}>Из конфигуратора: <span className="text-[#2b2723]">{bk.s.svc}</span></p>}
                      </fieldset>
                    )}
                    {step === 1 && (
                      <div className="grid gap-6">
                        <fieldset><legend className={`${SERIF} mb-5 text-[32px] font-light`}>Когда удобно?</legend><div className="flex flex-wrap gap-2">{WHEN.map(w => <Chip key={w} on={when.includes(w)} onClick={() => tog(w)}>{w}</Chip>)}</div></fieldset>
                        <input className={f} placeholder="Район или адрес (необязательно)" value={area} onChange={e => setArea(e.target.value)} />
                      </div>
                    )}
                    {step === 2 && (
                      <div className="grid gap-5">
                        <p className="text-[14px] font-light" style={{ color: SOFT }}>{bk.s.svc} · {when.join(', ')}{area && ' · ' + area}</p>
                        <input className={f} autoComplete="name" placeholder="Имя" aria-label="Имя" value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} />
                        <input className={f + (bk.s.err ? ' !border-red-700' : '')} type="tel" inputMode="tel" autoComplete="tel" placeholder="+375 __ ___-__-__" aria-label="Телефон" value={bk.s.phone} onFocus={phoneFocus(bk)} onChange={e => bk.upd('phone', e.target.value)} aria-invalid={bk.s.err} />
                        {bk.s.err && <p role="alert" className="text-[13px] text-red-800">Введите номер полностью: +375 и 9 цифр.</p>}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
                {err && <p role="alert" className="mt-3 text-[13px] text-red-800">{err}</p>}
                <div className="mt-10 flex items-center justify-between">
                  {step > 0 ? <button type="button" onClick={() => { setErr(''); setStep(s => s - 1) }} className="inline-flex h-12 items-center gap-2 text-[14px] font-light" style={{ color: SOFT }}><ArrowLeft size={15} strokeWidth={1.4} />Назад</button> : <span />}
                  <button type="submit" disabled={bk.s.loading} className="inline-flex h-14 items-center gap-3 rounded-full px-8 text-[14px] tracking-[.06em] text-[#f2ede4] disabled:opacity-60" style={{ background: INK }}>{step < 2 ? <>Дальше <ArrowRight size={16} strokeWidth={1.4} /></> : bk.s.loading ? 'Отправляем…' : 'Заказать замер'}</button>
                </div>
              </motion.form>
            ) : (
              <motion.div key="ok" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid min-h-[360px] place-items-center text-center">
                <div>
                  <CheckDraw className="mx-auto mb-6 text-[#a77c4f]" size={76} />
                  <h3 className={`${SERIF} text-[44px] font-light`}>Спасибо.</h3>
                  <p className="mx-auto mt-3 max-w-[360px] text-[15px] font-light" style={{ color: SOFT }}>В готовом сайте заявка сразу придёт вам в Telegram — дизайнер перезвонит и согласует время замера.</p>
                  <button onClick={() => { bk.reset(); setStep(0); setWhen([]); setArea('') }} className="mt-6 border-b border-[#2b2723]/40 text-[14px] font-light">Новая заявка</button>
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
  const links = [['Viber', b.viber], ['WhatsApp', b.wa], ['Telegram', b.tg], ['Instagram', b.ig], ['ВКонтакте', b.vk]]
  return (
    <section id="contact" className="px-6 py-28 md:px-14 md:py-40" style={{ background: CREAM }}>
      <div className="mx-auto grid max-w-[1500px] gap-14 lg:grid-cols-[1fr_1.3fr]">
        <div>
          <p className="text-[12px] font-light uppercase tracking-[.32em]" style={{ color: SOFT }}>Салон мебели</p>
          <h2 className={`${SERIF} mt-6 text-[clamp(40px,4.6vw,72px)] font-light leading-[1]`}>{b.addr}</h2>
          <p className="mt-3 text-[15px] font-light" style={{ color: SOFT }}>{b.city}</p>
          <div className="mt-12 grid gap-6 border-t border-[#2b2723]/12 pt-8">
            <div><p className="text-[11px] font-light uppercase tracking-[.3em]" style={{ color: SOFT }}>Телефон</p><a href={'tel:' + tel(b.phone)} className={`${SERIF} text-[32px] font-light hover:text-[#a77c4f]`}>{b.phone}</a></div>
            <div><p className="text-[11px] font-light uppercase tracking-[.3em]" style={{ color: SOFT }}>Viber и WhatsApp</p><a href={'tel:' + tel(b.phone2)} className={`${SERIF} text-[32px] font-light hover:text-[#a77c4f]`}>{b.phone2}</a></div>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3">
            {links.map(([t, h]) => <a key={t} href={h} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 border-b border-[#2b2723]/25 pb-1 text-[14px] font-light hover:border-[#a77c4f] hover:text-[#a77c4f]">{t === 'Instagram' ? <IG width={15} height={15} /> : t === 'Telegram' ? <TG width={15} height={15} /> : null}{t}<ArrowUpRight size={13} strokeWidth={1.4} /></a>)}
          </div>
        </div>
        <Reveal className="h-[440px] overflow-hidden rounded-[2px] md:h-[560px]"><MapFrame oid={b.oid} /></Reveal>
      </div>
    </section>
  )
}

function App() {
  useSmooth()
  const lite = useLite()
  return (
    <MotionConfig reducedMotion="user">
      <div className="overflow-x-clip font-['Jost',sans-serif]" style={{ background: CREAM, color: INK, '--sel': OAK, '--selc': '#fff' }}>
        <Ribbon name={b.name} bg={INK} fg={CREAM} />
        <Header />
        <main>
          <Hero />
          <Film lite={lite} />
          <Rooms />
          <Builder lite={lite} />
          <Bento />
          <Booking />
          <Contact />
        </main>
        <footer className="border-t border-[#2b2723]/12 px-6 py-8 text-[12px] font-light tracking-[.04em] md:px-14" style={{ background: CREAM, color: SOFT }}>
          <div className="mx-auto flex max-w-[1500px] flex-wrap justify-between gap-3"><span>© 2026 {b.name} · Концепт сайта — Артём</span><span>Мебель на заказ · {b.city}</span></div>
        </footer>
        <CallBar phone={b.phone} barCls="bg-[#f2ede4]/95 backdrop-blur border-t border-[#2b2723]/10" callCls="rounded-full border border-[#2b2723]/30 text-[#2b2723] font-normal" bookCls="rounded-full bg-[#2b2723] text-[#f2ede4] font-normal" />
        <div className="h-[72px] sm:hidden" style={{ background: CREAM }} />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
