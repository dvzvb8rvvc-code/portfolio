import React, { useRef, useState, useEffect, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, useSpring, useMotionValue, useInView, AnimatePresence, MotionConfig, animate } from 'framer-motion'
import { ArrowRight, ArrowUpRight, Phone, MapPin, Clock, Star, Plus, Minus, Check, X, Sun, CloudSun, Moon, Info } from 'lucide-react'
import '../lib/base.css'
import { useSmooth, Ribbon, LineReveal, Reveal, useBooking, phoneFocus, CheckDraw, MapFrame, CallBar, tel, useLite, useIsMobile, IG, WA } from '../lib/kit'

const FollicleScene = lazy(() => import('./lissa3d'))

const b = {
  name: 'Lissa', addr: 'Сухаревская ул., 26', district: 'Сухарево', city: 'Минск',
  phone: '+375 29 130-03-03', wa: 'https://wa.me/375291300303',
  ig: 'http://instagram.com/lissa.salon', igName: '@lissa.salon', vk: 'https://vk.ru/club102746290',
  rating: '4,8', rev: 164, revWord: 'оценки', oid: '1396822109',
}
const PORC = '#f7f6f3', INK = '#1c2024', TEAL = '#0e6b68', TEAL_L = '#d7ebe8', NUDE = '#ece2d8', HAIR = 'rgba(28,32,36,.1)'
const DISP = "font-['Geologica',sans-serif]", BODY = "font-['Inter_Tight',sans-serif]"
const go = id => { const el = document.querySelector(id); if (!el) return; window.__lenis ? window.__lenis.scrollTo(el, { offset: -72 }) : el.scrollIntoView({ behavior: 'smooth' }) }
const pick = svc => { window.dispatchEvent(new CustomEvent('ls-pick', { detail: svc })); go('#book') }

function Label({ n, children, className = '' }) {
  return <p className={`flex items-center gap-3 text-[15px] font-semibold uppercase tracking-[.16em] ${className}`} style={{ color: TEAL }}><span className="tabular-nums">{n}</span><span className="h-px w-8" style={{ background: TEAL }} />{children}</p>
}
const H2 = `${DISP} text-[clamp(32px,4.6vw,66px)] font-light leading-[1.04] tracking-[-0.035em]`

/* ---------------- hero film: how laser works ---------------- */
const R = [[0.1, 0.28], [0.34, 0.5], [0.56, 0.72], [0.78, 0.96]]
const toM = p => { for (let i = 0; i < 3; i++) { const z = R[i][1], a = R[i + 1][0]; if (p < z) return i; if (p < a) return i + (p - z) / (a - z) } return 3 }
const CH = [
  { k: 'Луч', t: 'Луч находит пигмент в волосе', d: 'Свет лазера поглощается меланином — тем, что окрашивает волос, — и проходит к его корню.' },
  { k: 'Нагрев', t: 'Нагревает фолликул', d: 'Энергия превращается в тепло и воздействует на волосяную луковицу. Кожа вокруг при этом защищена настройками аппарата.' },
  { k: 'Выпадение', t: 'Волос выходит в течение пары недель', d: 'Обработанные волосы ослабевают и выпадают постепенно — это нормально.' },
  { k: 'Курс', t: 'Поэтому нужен курс', d: 'Волосы растут фазами, лазер действует только на те, что сейчас в активной фазе. Количество процедур подберёт мастер.' },
]
function Caption({ p, i, c }) {
  const [a, z] = R[i]
  const o = useTransform(p, [a - 0.04, a + 0.01, z - 0.01, z + 0.03], [0, 1, 1, 0])
  const y = useTransform(p, [a - 0.04, a + 0.01, z - 0.01, z + 0.03], [18, 0, 0, -14])
  const pe = useTransform(o, v => (v > 0.6 ? 'auto' : 'none'))
  return (
    <motion.div style={{ opacity: o, y, pointerEvents: pe }} className="absolute inset-0 grid items-end gap-6 md:grid-cols-[1.1fr_0.9fr]">
      <div>
        <p className="text-[15px] font-semibold uppercase tracking-[.16em]" style={{ color: TEAL }}>Как работает лазер · {i + 1} / 4</p>
        <h2 className={`${DISP} mt-3 text-[clamp(30px,3.6vw,54px)] font-light leading-[1.04] tracking-[-0.035em]`}>{c.t}</h2>
      </div>
      <div>
        <p className="text-[18px] leading-relaxed text-[#1c2024]/75">{c.d}</p>
        {i === 3 && <button type="button" onClick={() => go('#zones')} className="mt-4 inline-flex h-12 items-center gap-2 rounded-full px-6 text-[16px] font-semibold text-white" style={{ background: TEAL }}>Выбрать зоны <ArrowRight size={17} /></button>}
      </div>
    </motion.div>
  )
}
function Step({ p, i, c }) {
  const [a, z] = R[i]
  const o = useTransform(p, [a - 0.03, a, z, z + 0.03], [0.45, 1, 1, 0.45])
  const bg = useTransform(p, [a - 0.03, a, z, z + 0.03], ['rgba(255,255,255,.7)', TEAL, TEAL, 'rgba(255,255,255,.7)'])
  const fg = useTransform(p, [a - 0.03, a, z, z + 0.03], [INK, '#ffffff', '#ffffff', INK])
  return <motion.span style={{ opacity: o, background: bg, color: fg }} className="rounded-full px-3.5 py-1.5 text-[14px] font-semibold backdrop-blur">{i + 1} {c.k}</motion.span>
}
function Legend() {
  return (
    <div className="absolute right-4 top-4 hidden flex-col gap-1.5 rounded-2xl bg-white/80 px-4 py-3 text-[14px] backdrop-blur md:flex" aria-hidden="true">
      <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#2fd1c4]" />активная фаза роста</span>
      <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#ff7a3d]" />нагрев луковицы</span>
      <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#6b4a3a]" />фаза покоя</span>
    </div>
  )
}
function MobCap({ m }) {
  const [i, setI] = useState(0)
  useEffect(() => m.on('change', v => setI(Math.min(3, Math.round(v)))), [m])
  return (
    <AnimatePresence mode="wait"><motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4">
      <p className="text-[14px] font-semibold uppercase tracking-[.14em]" style={{ color: TEAL }}>Как работает лазер · {i + 1} / 4</p>
      <p className={`${DISP} mt-1 text-[24px] font-light leading-tight`}>{CH[i].t}</p>
      <p className="mt-2 text-[16px] leading-relaxed text-[#1c2024]/75">{CH[i].d}</p>
    </motion.div></AnimatePresence>
  )
}
function Panel({ m, lite, near, mob, children }) {
  return (
    <div className="relative h-full overflow-hidden rounded-[28px] border" style={{ borderColor: HAIR, background: 'linear-gradient(180deg, #ffffff 0%, #f1ece6 100%)' }}>
      {lite ? (
        <svg viewBox="0 0 600 260" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <rect y="130" width="600" height="130" fill="#f3d6c6" /><rect y="126" width="600" height="6" fill="#e5bfa9" />
          {Array.from({ length: 24 }, (_, i) => <g key={i}><line x1={20 + i * 24} y1="190" x2={24 + i * 24} y2={i % 3 ? 100 : 80} stroke="#3a2a22" strokeWidth="2" /><circle cx={20 + i * 24} cy="192" r="5" fill={i % 3 === 0 ? '#2fd1c4' : '#6b4a3a'} /></g>)}
        </svg>
      ) : near && <Suspense fallback={null}><FollicleScene progress={m} active={near} count={mob ? 160 : 300} /></Suspense>}
      <Legend />
      {children}
    </div>
  )
}
function Hero({ lite }) {
  const ref = useRef(null)
  const mob = useIsMobile()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const sp = useSpring(scrollYProgress, { stiffness: 80, damping: 24, mass: 0.4 })
  const m = useTransform(sp, toM)
  const auto = useMotionValue(0)
  useEffect(() => {
    if (!mob || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const c = animate(auto, [0, 0, 1, 1, 2, 2, 3, 3, 0], { duration: 20, repeat: Infinity, ease: 'easeInOut', times: [0, .1, .2, .35, .45, .6, .7, .92, 1] })
    return () => c.stop()
  }, [mob])
  const near = useInView(ref, { margin: '200px 0px' })
  const heroO = useTransform(sp, [0, 0.07], [1, 0])
  const heroPE = useTransform(sp, v => (v < 0.05 ? 'auto' : 'none'))
  const intro = (
    <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr] md:items-end">
      <div>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px] font-semibold uppercase tracking-[.16em]" style={{ color: TEAL }}><span>Салон красоты</span><span aria-hidden="true">·</span><span>{b.addr}</span></p>
        <h1 className={`${DISP} mt-4 text-[clamp(36px,5vw,80px)] font-light leading-[1.0] tracking-[-0.04em]`}>
          <LineReveal delay={0.05}>Лазерная эпиляция</LineReveal>
          <LineReveal delay={0.13}><span style={{ color: TEAL }}>и уход</span> на Сухарево</LineReveal>
        </h1>
      </div>
      <div>
        <p className="text-[18px] leading-relaxed text-[#1c2024]/75">Лазер, шугаринг, наращивание ресниц и сложное окрашивание в одном салоне.</p>
        <a href={`https://yandex.by/maps/org/${b.oid}/reviews/`} target="_blank" rel="noopener" className="mt-3 inline-flex items-center gap-2 text-[17px] font-semibold hover:underline"><Star size={18} fill={TEAL} stroke={TEAL} />{b.rating} · {b.rev} {b.revWord} на Яндекс Картах</a>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <a href="#book" className="inline-flex h-14 items-center justify-center gap-2 rounded-full px-7 text-[17px] font-semibold text-white hover:brightness-110" style={{ background: TEAL }}>Записаться <ArrowRight size={18} /></a>
          <a href={'tel:' + tel(b.phone)} className="inline-flex h-14 items-center justify-center gap-2 rounded-full border px-6 text-[17px] font-semibold hover:bg-[#1c2024] hover:text-white" style={{ borderColor: 'rgba(28,32,36,.25)' }}><Phone size={18} />{b.phone}</a>
        </div>
      </div>
    </div>
  )
  if (mob) return (
    <section ref={ref} id="top" className="px-5 pb-12 pt-8" style={{ background: PORC }}>
      {intro}
      <div className="mt-8 h-[260px]"><Panel m={auto} lite={lite} near={near} mob /></div>
      <MobCap m={auto} />
    </section>
  )
  return (
    <section ref={ref} id="top" className="relative h-[300vh]" style={{ background: PORC }}>
      <div className="sticky top-[72px] h-[calc(100svh-72px)]">
        <div className="mx-auto grid h-full max-w-[1320px] grid-rows-[auto_1fr] gap-6 px-10 pb-8 pt-8">
          <div className="relative min-h-[230px]">
            <motion.div style={{ opacity: heroO, pointerEvents: heroPE }} className="absolute inset-x-0 bottom-0">{intro}</motion.div>
            {CH.map((c, i) => <Caption key={c.k} p={sp} i={i} c={c} />)}
          </div>
          <Panel m={m} lite={lite} near={near}>
            <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">{CH.map((c, i) => <Step key={c.k} p={sp} i={i} c={c} />)}</div>
            <a href="#zones" className="absolute bottom-4 right-4 rounded-full bg-white/85 px-4 py-2 text-[15px] font-semibold backdrop-blur hover:bg-white">Пропустить → к зонам</a>
          </Panel>
        </div>
      </div>
    </section>
  )
}

/* ---------------- body zone selector ---------------- */
const ZONES = [
  { id: 'face', t: 'Лицо', d: 'верхняя губа, подбородок' },
  { id: 'arm', t: 'Подмышки' },
  { id: 'hands', t: 'Руки' },
  { id: 'line', t: 'Белая линия живота' },
  { id: 'bikini', t: 'Бикини' },
  { id: 'thigh', t: 'Бёдра' },
  { id: 'shin', t: 'Голени' },
  { id: 'back', t: 'Спина', d: 'отмечается списком' },
]
function Zone({ id, on, toggle, label, children }) {
  return (
    <g role="button" tabIndex={0} aria-pressed={on} aria-label={label} onClick={() => toggle(id)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(id) } }}
      className="cursor-pointer outline-none [&:focus-visible>*]:stroke-[#1c2024] [&:hover>*]:opacity-100" style={{ color: on ? TEAL : '#c9b9aa' }}>
      {children}
    </g>
  )
}
function Figure({ sel, toggle }) {
  const on = id => sel.includes(id)
  const zf = id => ({ fill: on(id) ? TEAL : 'rgba(14,107,104,.0)', stroke: on(id) ? TEAL : 'rgba(14,107,104,.45)', strokeWidth: 1.5, strokeDasharray: on(id) ? '0' : '4 4', style: { transition: 'fill .25s' } })
  const limb = id => ({ stroke: on(id) ? TEAL : '#e6d8cb', style: { transition: 'stroke .25s' } })
  const lab = id => ZONES.find(z => z.id === id).t
  return (
    <svg viewBox="0 0 200 440" className="mx-auto h-[min(560px,70vh)] w-auto max-w-full" role="group" aria-label="Силуэт: нажмите на зону">
      {/* base body */}
      <g fill="#efe5db">
        <ellipse cx="100" cy="40" rx="22" ry="27" />
        <rect x="92" y="62" width="16" height="18" rx="6" />
        <path d="M62 86 Q100 72 138 86 L140 122 Q131 160 128 190 Q140 214 138 236 L62 236 Q60 214 72 190 Q69 160 60 122 Z" />
      </g>
      <g strokeLinecap="round" fill="none">
        <Zone id="hands" on={on('hands')} toggle={toggle} label={lab('hands')}><path d="M60 92 L44 160 L38 228" strokeWidth="17" {...limb('hands')} /><path d="M140 92 L156 160 L162 228" strokeWidth="17" {...limb('hands')} /></Zone>
        <Zone id="thigh" on={on('thigh')} toggle={toggle} label={lab('thigh')}><path d="M84 244 L80 330" strokeWidth="30" {...limb('thigh')} /><path d="M116 244 L120 330" strokeWidth="30" {...limb('thigh')} /></Zone>
        <Zone id="shin" on={on('shin')} toggle={toggle} label={lab('shin')}><path d="M80 344 L82 418" strokeWidth="22" {...limb('shin')} /><path d="M120 344 L118 418" strokeWidth="22" {...limb('shin')} /></Zone>
      </g>
      <Zone id="face" on={on('face')} toggle={toggle} label={lab('face')}><path d="M84 46 Q100 74 116 46 Q112 64 100 66 Q88 64 84 46 Z" {...zf('face')} /></Zone>
      <Zone id="arm" on={on('arm')} toggle={toggle} label={lab('arm')}><ellipse cx="70" cy="104" rx="7" ry="11" {...zf('arm')} /><ellipse cx="130" cy="104" rx="7" ry="11" {...zf('arm')} /></Zone>
      <Zone id="line" on={on('line')} toggle={toggle} label={lab('line')}><rect x="95" y="150" width="10" height="64" rx="5" {...zf('line')} /></Zone>
      <Zone id="bikini" on={on('bikini')} toggle={toggle} label={lab('bikini')}><path d="M78 222 L122 222 L100 252 Z" strokeLinejoin="round" {...zf('bikini')} /></Zone>
    </svg>
  )
}
function Zones() {
  const [sel, setSel] = useState(['arm', 'shin'])
  const toggle = id => setSel(s => (s.includes(id) ? s.filter(x => x !== id) : [...s, id]))
  const names = ZONES.filter(z => sel.includes(z.id)).map(z => z.t)
  return (
    <section id="zones" className="border-t px-5 py-24 md:px-10 md:py-32" style={{ background: '#fff', borderColor: HAIR }}>
      <div className="mx-auto max-w-[1240px]">
        <Label n="01">Лазерная эпиляция</Label>
        <div className="mt-4 grid gap-6 md:grid-cols-[1.1fr_0.9fr] md:items-end">
          <h2 className={H2}>Отметьте зоны — запишем на консультацию</h2>
          <p className="text-[18px] leading-relaxed text-[#1c2024]/70">Нажмите на силуэт или выберите из списка. Можно отметить несколько зон — их удобно обработать за один визит.</p>
        </div>
        <div className="mt-12 grid gap-8 rounded-[32px] border p-5 md:grid-cols-[0.9fr_1.1fr] md:p-10" style={{ borderColor: HAIR, background: PORC }}>
          <div className="relative rounded-[24px] bg-white py-6"><Figure sel={sel} toggle={toggle} /></div>
          <div className="flex flex-col">
            <p className="text-[16px] font-semibold text-[#1c2024]/60">Зоны</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {ZONES.map(z => { const on = sel.includes(z.id); return (
                <button key={z.id} type="button" aria-pressed={on} onClick={() => toggle(z.id)} className={`flex min-h-[60px] items-center gap-3 rounded-2xl border px-4 py-2 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1c2024] ${on ? 'border-[#0e6b68] bg-[#0e6b68] text-white' : 'border-[#1c2024]/12 bg-white hover:border-[#0e6b68]'}`}>
                  <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border ${on ? 'border-white bg-white text-[#0e6b68]' : 'border-[#1c2024]/25'}`}>{on && <Check size={14} />}</span>
                  <span className="min-w-0"><span className="block text-[17px] font-semibold leading-tight">{z.t}</span>{z.d && <span className={`block text-[14px] ${on ? 'text-white/80' : 'text-[#1c2024]/55'}`}>{z.d}</span>}</span>
                </button>) })}
            </div>
            <div className="mt-6 rounded-2xl p-5" style={{ background: TEAL_L }}>
              <p className="flex items-start gap-3 text-[16px] leading-relaxed"><Info size={20} className="mt-0.5 shrink-0" style={{ color: TEAL }} /><span><b>Про курс.</b> Волосы растут фазами, и за одну процедуру лазер действует только на активные. Поэтому нужно несколько сеансов с перерывами — <b>количество процедур подберёт мастер</b> после консультации.</span></p>
            </div>
            <div className="mt-6 flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: HAIR }}>
              <p className="min-h-[28px] text-[17px]" aria-live="polite">{names.length ? <><span className="text-[#1c2024]/60">Выбрано: </span><b>{names.join(', ')}</b></> : <span className="text-[#1c2024]/60">Зоны не выбраны</span>}</p>
              <div className="flex shrink-0 gap-2">
                {names.length > 0 && <button type="button" onClick={() => setSel([])} className="grid h-14 w-14 place-items-center rounded-full border border-[#1c2024]/15 hover:border-[#1c2024]" aria-label="Сбросить зоны"><X size={18} /></button>}
                <button type="button" disabled={!names.length} onClick={() => pick('Лазерная эпиляция: ' + names.join(', '))} className="inline-flex h-14 items-center gap-2 rounded-full px-7 text-[17px] font-semibold text-white hover:brightness-110 disabled:opacity-40" style={{ background: TEAL }}>Записаться <ArrowRight size={18} /></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- services ---------------- */
const SVC = [
  { t: 'Лазерная эпиляция', d: 'Курс процедур по выбранным зонам. Перед первым сеансом — консультация.', time: 'зависит от зон' },
  { t: 'Шугаринг', d: 'Удаление волос сахарной пастой — для любых зон.', time: 'зависит от зон' },
  { t: 'Наращивание ресниц', d: 'Объём и изгиб подбираем под форму глаз.', time: 'обычно 2–3 часа' },
  { t: 'Коррекция и снятие ресниц', d: 'Обновим или аккуратно снимем наращенные ресницы.', time: 'уточним при записи' },
  { t: 'Сложное окрашивание', d: 'Растяжка цвета, мягкие переходы, осветление.', time: 'от нескольких часов' },
  { t: 'Тонирование', d: 'Освежить оттенок и блеск, нейтрализовать желтизну.', time: 'уточним при записи' },
]
function Services() {
  return (
    <section id="services" className="border-t px-5 py-24 md:px-10 md:py-32" style={{ background: PORC, borderColor: HAIR }}>
      <div className="mx-auto max-w-[1240px]">
        <Label n="02">Услуги</Label>
        <div className="mt-4 grid gap-6 md:grid-cols-[1.1fr_0.9fr] md:items-end">
          <h2 className={H2}>Что мы делаем</h2>
          <p className="text-[18px] leading-relaxed text-[#1c2024]/70">Цена — уточняйте: она зависит от зоны, длины и объёма работы. Время ориентировочное.</p>
        </div>
        <ul className="mt-12 border-t" style={{ borderColor: HAIR }}>
          {SVC.map((s, i) => (
            <Reveal as="li" key={s.t} delay={i * 0.04} className="grid grid-cols-[40px_1fr] gap-x-4 gap-y-3 border-b py-7 md:grid-cols-[60px_1fr_1.1fr_200px_auto] md:items-center md:gap-x-8" style={{ borderColor: HAIR }}>
              <span className="text-[15px] font-semibold tabular-nums text-[#1c2024]/45">{String(i + 1).padStart(2, '0')}</span>
              <h3 className={`${DISP} text-[24px] font-normal leading-tight tracking-[-0.02em] md:text-[28px]`}>{s.t}</h3>
              <p className="col-span-2 text-[17px] leading-relaxed text-[#1c2024]/70 md:col-span-1">{s.d}</p>
              <p className="col-span-2 text-[15px] text-[#1c2024]/60 md:col-span-1"><span className="flex items-center gap-2"><Clock size={15} />{s.time}</span><span className="mt-0.5 block">цена — уточняйте</span></p>
              <button type="button" onClick={() => pick(s.t)} className="col-span-2 inline-flex h-12 items-center justify-center gap-2 rounded-full border px-6 text-[16px] font-semibold transition-colors hover:border-[#0e6b68] hover:bg-[#0e6b68] hover:text-white md:col-span-1" style={{ borderColor: 'rgba(28,32,36,.2)' }}>Записаться</button>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ---------------- complex colouring ---------------- */
const TECH = [
  { t: 'Растяжка цвета', d: 'Плавный переход от более тёмных корней к светлым длинам — отрастает мягко, без резкой границы.', g: ['#3b2a22', '#7a5a43', '#c9a27c', '#ead2b2'] },
  { t: 'Мягкое осветление', d: 'Светлые пряди, которые выглядят естественно и дают объём.', g: ['#5a4030', '#a07e5e', '#e2c7a2', '#a07e5e'] },
  { t: 'Холодный блонд', d: 'Осветление с тонированием — оттенок подбираем, чтобы убрать желтизну.', g: ['#8e8576', '#c9c1b2', '#ece6da', '#f6f2ea'] },
  { t: 'Тёплый медный', d: 'Насыщенный рыжий или медный цвет с переливом на свету.', g: ['#4a2416', '#8c3f1f', '#c4642f', '#e09a5e'] },
]
function Colour() {
  const [i, setI] = useState(0)
  const t = TECH[i]
  return (
    <section id="colour" className="border-t px-5 py-24 md:px-10 md:py-32" style={{ background: INK, color: PORC, borderColor: HAIR }}>
      <div className="mx-auto max-w-[1240px]">
        <Label n="03" className="!text-[#7fd1c9]">Сложное окрашивание</Label>
        <div className="mt-4 grid gap-6 md:grid-cols-[1.1fr_0.9fr] md:items-end">
          <h2 className={H2}>Цвет, который переходит, а не обрывается</h2>
          <p className="text-[18px] leading-relaxed text-white/70">Техника и оттенок — после консультации: мастер посмотрит на исходный цвет и состояние волос.</p>
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="grid gap-2" role="group" aria-label="Техника окрашивания">
            {TECH.map((x, k) => (
              <button key={x.t} type="button" aria-pressed={k === i} onClick={() => setI(k)} className={`flex min-h-[72px] items-center gap-4 rounded-2xl border px-5 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-white ${k === i ? 'border-white/60 bg-white/10' : 'border-white/10 hover:border-white/35'}`}>
                <span className="h-9 w-14 shrink-0 rounded-full" style={{ background: `linear-gradient(90deg, ${x.g.join(',')})` }} />
                <span className="text-[19px] font-semibold">{x.t}</span>
              </button>
            ))}
          </div>
          <div className="relative overflow-hidden rounded-[28px] border border-white/10">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div key={t.t} initial={{ clipPath: 'inset(0 100% 0 0)' }} animate={{ clipPath: 'inset(0 0% 0 0)' }} exit={{ opacity: 0 }} transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1] }}
                className="h-[260px] md:h-[340px]" style={{ background: `linear-gradient(100deg, ${t.g.join(',')})` }}>
                <div className="h-full w-full opacity-40 mix-blend-soft-light" style={{ backgroundImage: 'repeating-linear-gradient(100deg, rgba(255,255,255,.5) 0 1px, transparent 1px 7px)' }} />
              </motion.div>
            </AnimatePresence>
            <div className="flex flex-col gap-4 p-6 md:flex-row md:items-end md:justify-between md:p-8">
              <div><p className={`${DISP} text-[28px] font-light`}>{t.t}</p><p className="mt-2 max-w-[460px] text-[17px] leading-relaxed text-white/70">{t.d}</p></div>
              <button type="button" onClick={() => pick('Сложное окрашивание — ' + t.t.toLowerCase())} className="inline-flex h-14 shrink-0 items-center justify-center gap-2 rounded-full bg-white px-7 text-[17px] font-semibold text-[#1c2024] hover:bg-[#d7ebe8]">Консультация <ArrowRight size={18} /></button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- how ---------------- */
const HOW = [
  { t: 'Запись', d: 'Позвоните, напишите в WhatsApp или оставьте заявку на сайте.' },
  { t: 'Консультация', d: 'Мастер посмотрит кожу или волосы, расскажет о подготовке и ответит на вопросы.' },
  { t: 'Процедура', d: 'Настройки и материалы подбираются под вас. Работаем спокойно, без спешки.' },
  { t: 'План дальше', d: 'Для лазера — график следующих сеансов, для ресниц и цвета — когда прийти на коррекцию.' },
]
function How() {
  return (
    <section id="how" className="border-t px-5 py-24 md:px-10 md:py-32" style={{ background: '#fff', borderColor: HAIR }}>
      <div className="mx-auto max-w-[1240px]">
        <Label n="04">Как мы работаем</Label>
        <h2 className={`${H2} mt-4`}>Четыре шага</h2>
        <ol className="mt-12 grid border-l border-t md:grid-cols-4" style={{ borderColor: HAIR }}>
          {HOW.map((s, i) => (
            <Reveal as="li" key={s.t} delay={i * 0.07} className="border-b border-r p-7" style={{ borderColor: HAIR }}>
              <span className={`${DISP} text-[56px] font-extralight leading-none`} style={{ color: TEAL }}>{i + 1}</span>
              <h3 className="mt-6 text-[21px] font-semibold">{s.t}</h3>
              <p className="mt-2 text-[17px] leading-relaxed text-[#1c2024]/70">{s.d}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}

/* ---------------- reviews ---------------- */
function Reviews() {
  return (
    <section id="reviews" className="border-t px-5 py-24 md:px-10 md:py-28" style={{ background: NUDE, borderColor: HAIR }}>
      <div className="mx-auto grid max-w-[1240px] gap-10 md:grid-cols-[auto_1fr] md:items-center md:gap-20">
        <div>
          <Label n="05">Отзывы</Label>
          <p className={`${DISP} mt-4 text-[clamp(110px,15vw,210px)] font-extralight leading-[.85] tracking-[-0.06em]`}>{b.rating}</p>
        </div>
        <div>
          <div className="flex gap-1.5" aria-hidden="true">{[0, 1, 2, 3, 4].map(i => <Star key={i} size={28} fill={i < 4 ? TEAL : 'none'} stroke={TEAL} />)}</div>
          <p className="mt-4 text-[22px] font-semibold">{b.rev} {b.revWord} на Яндекс Картах</p>
          <p className="mt-3 max-w-[480px] text-[18px] leading-relaxed text-[#1c2024]/70">Почитайте, что пишут гости о лазере, ресницах и окрашивании, — прежде чем записаться.</p>
          <a href={`https://yandex.by/maps/org/${b.oid}/reviews/`} target="_blank" rel="noopener" className="mt-7 inline-flex h-14 items-center gap-2 rounded-full border px-7 text-[17px] font-semibold hover:bg-[#1c2024] hover:text-white" style={{ borderColor: 'rgba(28,32,36,.3)' }}>Читать отзывы <ArrowUpRight size={18} /></a>
        </div>
      </div>
    </section>
  )
}

/* ---------------- booking ---------------- */
const B_SVC = ['Лазерная эпиляция', 'Шугаринг', 'Наращивание ресниц', 'Сложное окрашивание', 'Тонирование', 'Консультация']
const PARTS = [{ t: 'Утро', I: Sun }, { t: 'День', I: CloudSun }, { t: 'Вечер', I: Moon }]
const inCls = 'mt-2 h-16 w-full rounded-2xl border bg-white px-5 text-[18px] outline-none focus:border-[#0e6b68]'
function Book() {
  const bk = useBooking()
  const [step, setStep] = useState(0), [part, setPart] = useState(''), [err, setErr] = useState('')
  const head = useRef(null)
  useEffect(() => { if (step) head.current?.focus() }, [step])
  useEffect(() => { const h = e => { bk.upd('svc', e.detail); setStep(0); setErr('') }; window.addEventListener('ls-pick', h); return () => window.removeEventListener('ls-pick', h) }, [])
  const next = e => {
    e.preventDefault()
    if (step === 0 && !bk.s.svc) return setErr('Выберите услугу')
    if (step === 1 && !part) return setErr('Выберите удобное время')
    setErr('')
    if (step < 2) setStep(step + 1); else bk.submit()
  }
  const custom = bk.s.svc && !B_SVC.includes(bk.s.svc)
  return (
    <section id="book" className="border-t px-5 py-24 md:px-10 md:py-32" style={{ background: PORC, borderColor: HAIR }}>
      <div className="mx-auto grid max-w-[1240px] gap-10 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <Label n="06">Запись</Label>
          <h2 className={`${H2} mt-4`}>Запишитесь на процедуру или консультацию</h2>
          <p className="mt-5 max-w-[420px] text-[18px] leading-relaxed text-[#1c2024]/70">Администратор перезвонит и подберёт время. Или свяжитесь сами:</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
            <a href={'tel:' + tel(b.phone)} className="inline-flex h-14 items-center justify-center gap-2 rounded-full px-7 text-[17px] font-semibold text-white" style={{ background: INK }}><Phone size={18} />{b.phone}</a>
            <a href={b.wa} target="_blank" rel="noopener" className="inline-flex h-14 items-center justify-center gap-2 rounded-full border px-7 text-[17px] font-semibold hover:border-[#1c2024]" style={{ borderColor: 'rgba(28,32,36,.2)' }}><WA />WhatsApp</a>
          </div>
        </div>
        <div className="rounded-[32px] border bg-white p-6 md:p-10" style={{ borderColor: HAIR }}>
          {bk.s.sent ? (
            <div className="py-10 text-center" role="status">
              <CheckDraw className="mx-auto text-[#0e6b68]" size={84} />
              <p className={`${DISP} mt-6 text-[34px] font-light`}>Заявка отправлена</p>
              <p className="mx-auto mt-3 max-w-[420px] text-[18px] leading-relaxed text-[#1c2024]/70">Мы перезвоним и подберём время. В готовом сайте заявка сразу придёт вам в Telegram.</p>
              <button type="button" onClick={() => { bk.reset(); setStep(0); setPart('') }} className="mt-8 h-12 text-[17px] font-semibold underline underline-offset-4">Новая заявка</button>
            </div>
          ) : (
            <form onSubmit={next} noValidate>
              <div className="flex gap-2" aria-hidden="true">{[0, 1, 2].map(i => <span key={i} className="h-1 flex-1 rounded-full" style={{ background: i <= step ? TEAL : '#e3ded8' }} />)}</div>
              <p className="mt-4 text-[15px] font-semibold" style={{ color: TEAL }}>Шаг {step + 1} из 3</p>
              <h3 ref={head} tabIndex={-1} className={`${DISP} mb-6 mt-1 text-[28px] font-light outline-none`}>{['Какая услуга?', 'Когда удобно?', 'Куда перезвонить?'][step]}</h3>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={step} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }} transition={{ duration: 0.2 }}>
                  {step === 0 && (<>
                    {custom && <p className="mb-3 rounded-2xl p-4 text-[16px]" style={{ background: TEAL_L }}><b>Вы выбрали:</b> {bk.s.svc}</p>}
                    <div className="grid gap-2 sm:grid-cols-2">{B_SVC.map(s => { const on = bk.s.svc === s; return <button key={s} type="button" aria-pressed={on} onClick={() => { bk.upd('svc', s); setErr('') }} className={`min-h-[60px] rounded-2xl border px-4 text-left text-[17px] font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1c2024] ${on ? 'border-[#0e6b68] bg-[#0e6b68] text-white' : 'border-[#1c2024]/12 hover:border-[#0e6b68]'}`}>{s}</button> })}</div>
                  </>)}
                  {step === 1 && <div className="grid gap-2 sm:grid-cols-3">{PARTS.map(({ t, I }) => { const on = part === t; return <button key={t} type="button" aria-pressed={on} onClick={() => { setPart(t); setErr('') }} className={`flex min-h-[64px] items-center gap-3 rounded-2xl border px-4 text-[17px] font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1c2024] ${on ? 'border-[#0e6b68] bg-[#0e6b68] text-white' : 'border-[#1c2024]/12 hover:border-[#0e6b68]'}`}><I size={22} />{t}</button> })}</div>}
                  {step === 2 && (<div className="space-y-5">
                    <div><label htmlFor="ls-name" className="text-[16px] font-semibold">Имя</label><input id="ls-name" value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} autoComplete="name" className={inCls + ' border-[#1c2024]/15'} /></div>
                    <div><label htmlFor="ls-phone" className="text-[16px] font-semibold">Телефон</label>
                      <input id="ls-phone" value={bk.s.phone} onChange={e => bk.upd('phone', e.target.value)} onFocus={phoneFocus(bk)} type="tel" inputMode="tel" autoComplete="tel" placeholder="+375 __ ___-__-__" aria-invalid={bk.s.err} aria-describedby={bk.s.err ? 'ls-perr' : undefined} className={inCls + (bk.s.err ? ' border-[#b42318]' : ' border-[#1c2024]/15')} /></div>
                    {bk.s.err && <p id="ls-perr" className="text-[16px] font-semibold text-[#b42318]">Проверьте номер: нужно 12 цифр, начиная с +375.</p>}
                    <p className="rounded-2xl p-4 text-[16px]" style={{ background: PORC }}>{bk.s.svc} · {part}</p>
                  </div>)}
                </motion.div>
              </AnimatePresence>
              {err && <p className="mt-4 text-[16px] font-semibold text-[#b42318]" role="alert">{err}</p>}
              <div className="mt-8 flex items-center justify-between gap-4">
                {step > 0 ? <button type="button" onClick={() => setStep(step - 1)} className="h-14 px-2 text-[17px] font-semibold text-[#1c2024]/65 hover:text-[#1c2024]">← Назад</button> : <span />}
                <button type="submit" disabled={bk.s.loading} className="inline-flex h-16 items-center gap-2 rounded-full px-8 text-[18px] font-semibold text-white disabled:opacity-60" style={{ background: TEAL }}>{step < 2 ? 'Дальше' : bk.s.loading ? 'Отправляем…' : 'Записаться'} <ArrowRight size={19} /></button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

/* ---------------- faq ---------------- */
const FAQ = [
  ['Сколько процедур лазера понадобится?', 'Это индивидуально: зависит от зоны, типа волос и кожи. Количество процедур и интервалы подберёт мастер на консультации.'],
  ['Больно ли делать лазерную эпиляцию?', 'Ощущения у всех разные. Мастер подбирает параметры аппарата под вашу кожу и следит за самочувствием во время процедуры.'],
  ['Как подготовиться к процедуре?', 'Мастер расскажет о подготовке при записи. Обычно просят не загорать перед сеансом и не удалять волосы с корнем — точные рекомендации дадим для вашей зоны.'],
  ['Можно ли делать лазер летом?', 'Уточните у мастера — он подскажет, как совмещать процедуры с солнцем и что учесть для вашей кожи.'],
  ['Сколько длится сложное окрашивание?', 'Обычно несколько часов — зависит от длины, исходного цвета и техники. Точнее скажем после консультации.'],
  ['Как оплатить и есть ли парковка?', 'Способы оплаты и парковку рядом уточняйте по телефону или в WhatsApp.'],
]
function Faq() {
  const [open, setOpen] = useState(0)
  return (
    <section id="faq" className="border-t px-5 py-24 md:px-10 md:py-28" style={{ background: '#fff', borderColor: HAIR }}>
      <div className="mx-auto grid max-w-[1240px] gap-10 md:grid-cols-[0.8fr_1.2fr]">
        <div>
          <Label n="07">Вопросы</Label>
          <h2 className={`${H2} mt-4`}>Частые вопросы</h2>
          <p className="mt-5 text-[18px] text-[#1c2024]/70">Не нашли ответ? <a href={'tel:' + tel(b.phone)} className="font-semibold underline underline-offset-4" style={{ color: TEAL }}>{b.phone}</a></p>
        </div>
        <div className="border-t" style={{ borderColor: HAIR }}>
          {FAQ.map(([q, a], i) => (
            <div key={q} className="border-b" style={{ borderColor: HAIR }}>
              <h3>
                <button type="button" aria-expanded={open === i} aria-controls={'lf-' + i} onClick={() => setOpen(open === i ? -1 : i)} className="flex min-h-[72px] w-full items-center justify-between gap-4 py-4 text-left text-[19px] font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1c2024]">
                  {q}<span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border" style={{ borderColor: open === i ? TEAL : HAIR, background: open === i ? TEAL : 'transparent', color: open === i ? '#fff' : INK }}>{open === i ? <Minus size={18} /> : <Plus size={18} />}</span>
                </button>
              </h3>
              <AnimatePresence initial={false}>
                {open === i && <motion.div id={'lf-' + i} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden"><p className="pb-6 text-[17px] leading-relaxed text-[#1c2024]/70">{a}</p></motion.div>}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------- contact ---------------- */
const VK = p => (<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" {...p}><path d="M12.8 17.5C6.9 17.5 3.5 13.4 3.4 6.6h3c.1 5 2.3 7.1 4 7.5V6.6h2.8v4.3c1.7-.2 3.5-2.2 4.1-4.3h2.8c-.5 2.7-2.4 4.6-3.8 5.4 1.4.7 3.6 2.4 4.4 5.5h-3.1c-.7-2.1-2.3-3.7-4.4-3.9v3.9Z" /></svg>)
function Contact() {
  return (
    <section id="contact" className="border-t px-5 py-24 md:px-10 md:py-28" style={{ background: PORC, borderColor: HAIR }}>
      <div className="mx-auto grid max-w-[1240px] gap-10 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <Label n="08">Контакты</Label>
          <h2 className={`${H2} mt-4`}>Сухаревская, 26</h2>
          <ul className="mt-8 space-y-5 text-[18px]">
            <li className="flex items-start gap-3"><MapPin className="mt-1 shrink-0" size={21} style={{ color: TEAL }} /><span>{b.addr}<br /><span className="text-[#1c2024]/60">{b.district}, {b.city}</span></span></li>
            <li className="flex items-start gap-3"><Clock className="mt-1 shrink-0" size={21} style={{ color: TEAL }} />Часы работы — уточняйте по телефону</li>
            <li><a href={'tel:' + tel(b.phone)} className="flex items-center gap-3 text-[26px] font-semibold"><Phone size={21} style={{ color: TEAL }} />{b.phone}</a><span className="ml-9 text-[15px] text-[#1c2024]/60">телефон и WhatsApp</span></li>
            <li className="flex flex-wrap gap-x-6 gap-y-3">
              <a href={b.wa} target="_blank" rel="noopener" className="flex items-center gap-2 font-semibold hover:underline"><WA style={{ color: TEAL }} />WhatsApp</a>
              <a href={b.ig} target="_blank" rel="noopener" className="flex items-center gap-2 font-semibold hover:underline"><IG style={{ color: TEAL }} />{b.igName}</a>
              <a href={b.vk} target="_blank" rel="noopener" className="flex items-center gap-2 font-semibold hover:underline"><VK style={{ color: TEAL }} />ВКонтакте</a>
            </li>
          </ul>
          <a href={'tel:' + tel(b.phone)} className="mt-8 inline-flex h-14 items-center gap-2 rounded-full px-7 text-[17px] font-semibold text-white" style={{ background: TEAL }}><Phone size={18} />Позвонить</a>
        </div>
        <div className="h-[380px] overflow-hidden rounded-[28px] border md:h-[480px]" style={{ borderColor: HAIR }}><MapFrame oid={b.oid} /></div>
      </div>
    </section>
  )
}

/* ---------------- header ---------------- */
const NAV = [['#zones', 'Лазер'], ['#services', 'Услуги'], ['#colour', 'Окрашивание'], ['#how', 'Как мы работаем'], ['#reviews', 'Отзывы'], ['#contact', 'Контакты']]
function useActive() {
  const [a, setA] = useState('')
  useEffect(() => {
    const els = ['#zones', '#services', '#colour', '#how', '#reviews', '#book', '#faq', '#contact'].map(h => document.querySelector(h)).filter(Boolean)
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) setA('#' + e.target.id) }), { rootMargin: '-45% 0px -50% 0px' })
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])
  return a === '#book' ? '#reviews' : a === '#faq' ? '#contact' : a
}
function Header() {
  const active = useActive()
  return (
    <header className="sticky top-0 z-50 border-b bg-[#f7f6f3]/90 backdrop-blur" style={{ borderColor: HAIR }}>
      <div className="mx-auto flex h-[64px] max-w-[1320px] items-center justify-between gap-4 px-4 md:h-[72px] md:px-10">
        <a href="#top" className="flex min-w-0 items-baseline gap-3" aria-label="Lissa — наверх">
          <span className={`${DISP} text-[28px] font-light tracking-[-0.04em]`}>lissa<span style={{ color: TEAL }}>.</span></span>
          <span className="hidden truncate text-[13px] font-semibold uppercase tracking-[.14em] text-[#1c2024]/55 2xl:block">салон красоты · Сухарево</span>
        </a>
        <nav className="hidden items-center gap-0.5 xl:flex" aria-label="Разделы">
          {NAV.map(([h, t]) => <a key={h} href={h} aria-current={active === h ? 'true' : undefined} className={`whitespace-nowrap rounded-full px-3.5 py-2 text-[16px] font-medium transition-colors ${active === h ? 'bg-[#d7ebe8] text-[#0e6b68]' : 'hover:bg-[#1c2024]/[.05]'}`}>{t}</a>)}
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <a href={'tel:' + tel(b.phone)} className="hidden h-11 items-center gap-2 rounded-full border px-4 text-[16px] font-semibold lg:inline-flex" style={{ borderColor: 'rgba(28,32,36,.2)' }}><Phone size={16} />{b.phone}</a>
          <a href="#book" className="hidden h-11 items-center rounded-full px-5 text-[16px] font-semibold text-white sm:inline-flex" style={{ background: TEAL }}>Записаться</a>
          <a href={'tel:' + tel(b.phone)} className="grid h-11 w-11 place-items-center rounded-full border sm:hidden" style={{ borderColor: 'rgba(28,32,36,.2)' }} aria-label="Позвонить"><Phone size={18} /></a>
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
      <div className={`${BODY} text-[18px] text-[#1c2024]`} style={{ background: PORC, '--sel': TEAL, '--selc': '#fff' }}>
        <Ribbon name={b.name} bg={INK} fg={PORC} />
        <Header />
        <main>
          <Hero lite={lite} />
          <Zones />
          <Services />
          <Colour />
          <How />
          <Reviews />
          <Book />
          <Faq />
          <Contact />
        </main>
        <footer className="border-t px-5 py-10 text-[16px] md:px-10" style={{ borderColor: HAIR, color: 'rgba(28,32,36,.65)' }}>
          <div className="mx-auto flex max-w-[1240px] flex-wrap justify-between gap-4"><span>© 2026 {b.name} · Концепт сайта — Артём</span><span>{b.addr}, {b.city}</span></div>
        </footer>
        <CallBar phone={b.phone} barCls="bg-[#f7f6f3]/95 backdrop-blur border-t border-[#1c2024]/10" callCls="rounded-full border border-[#1c2024]/25 text-[#1c2024] text-[18px]" bookCls="rounded-full bg-[#0e6b68] text-white text-[18px]" />
        <div className="h-[76px] sm:hidden" />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
