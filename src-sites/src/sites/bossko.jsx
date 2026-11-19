import React, { useRef, useState, useEffect, Suspense, lazy, useMemo } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useInView, AnimatePresence, MotionConfig } from 'framer-motion'
import { ArrowRight, ArrowUpRight, Phone, Plus, Minus, MapPin, Check } from 'lucide-react'
import '../lib/base.css'
import { useSmooth, Ribbon, Reveal, SplitText, ScrollWords, LineReveal, useBooking, phoneFocus, CheckDraw, MapFrame, CallBar, tel, useLite, IG, TG } from '../lib/kit'

const GoldPlate = lazy(() => import('./bossko3d'))

const b = {
  name: 'Bossko', addr: 'просп. Дзержинского, 127', district: 'Малиновка', city: 'Минск',
  phone: '+375 29 319-00-88', ig: 'https://www.instagram.com/bossko.salon', tg: 'https://t.me/salon_bossko',
  viber: 'viber://chat?number=%2B375293190088', rating: '5,0', rev: 201, oid: '88376229041',
}
const INK = '#12100d', CREAM = '#f3ece0', GOLD = '#a8834a'
const D = "font-['Yeseva_One',serif]"
const T = "font-['Tenor_Sans',sans-serif]"
const GOLD_TXT = 'bg-[linear-gradient(100deg,#7a5a2c_0%,#d9b77a_35%,#f6e7c4_50%,#c49a5a_65%,#7a5a2c_100%)] bg-clip-text text-transparent'
const NAV = [['contents', 'Услуги'], ['pmu', 'Перманент'], ['how', 'Как это работает'], ['rating', 'Рейтинг'], ['contact', 'Контакты']]

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
    <header className="sticky top-0 z-40 border-b border-[#12100d]/15 bg-[#f3ece0]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1320px] items-center justify-between gap-4 px-5 md:px-10">
        <a href="#top" className={`${D} text-[26px] uppercase tracking-[.08em]`}>Bossko</a>
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Разделы">
          {NAV.map(([id, t]) => <a key={id} href={'#' + id} aria-current={a === id ? 'true' : undefined} className={`relative py-2 text-[13px] uppercase tracking-[.14em] transition-colors ${a === id ? 'text-[#12100d]' : 'text-[#12100d]/60 hover:text-[#12100d]'}`}>{t}{a === id && <motion.span layoutId="bk-nav" className="absolute inset-x-0 -bottom-0.5 h-px bg-[#a8834a]" />}</a>)}
        </nav>
        <div className="flex items-center gap-4">
          <a href={'tel:' + tel(b.phone)} className="hidden items-center gap-2 text-[15px] md:flex"><Phone size={15} />{b.phone}</a>
          <a href="#book" className="flex h-10 items-center bg-[#12100d] px-5 text-[13px] uppercase tracking-[.14em] text-[#f3ece0] hover:bg-[#a8834a]">Записаться</a>
        </div>
      </div>
    </header>
  )
}

/* ---------------- cover ---------------- */
const EyeArt = ({ className = '' }) => (
  <svg viewBox="0 0 300 220" className={className} fill="none" stroke="#12100d" strokeLinecap="round" aria-hidden="true">
    <motion.path d="M40 70 Q120 22 250 52" strokeWidth="9" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.4, delay: 0.5, ease: [0.6, 0, 0.2, 1] }} />
    <motion.path d="M50 140 Q150 70 260 132" strokeWidth="3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, delay: 0.9 }} />
    <motion.path d="M60 142 Q150 182 252 136" strokeWidth="1.6" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, delay: 1.1 }} />
    <motion.circle cx="152" cy="132" r="22" strokeWidth="2.2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 1.3 }} />
    <motion.circle cx="152" cy="132" r="8" fill="#12100d" stroke="none" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.8 }} />
    {[0, 1, 2, 3, 4, 5, 6].map(i => { const x = 80 + i * 27, y = 126 - Math.sin((i + 1) / 8 * Math.PI) * 44; return <motion.path key={i} d={`M${x} ${y} q${4 + i} -16 ${10 + i * 2} -22`} strokeWidth="1.6" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 1.5 + i * 0.05 }} /> })}
  </svg>
)
function Cover({ lite }) {
  const ref = useRef(null)
  const vis = useInView(ref, { margin: '100px 0px' })
  return (
    <section id="top" ref={ref} className="relative overflow-hidden">
      <div className="mx-auto max-w-[1320px] px-5 pt-6 md:px-10 md:pt-8">
        <SplitText as="p" text="BOSSKO" className={`${D} block text-center text-[clamp(84px,21vw,300px)] leading-[.82] tracking-[.02em]`} stagger={0.06} />
        <div className="mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-y border-[#12100d] py-2.5 text-[12.5px] uppercase tracking-[.16em]">
          <span>Салон красоты · {b.district}</span>
          <a href="#contact" className="hidden items-center gap-1.5 hover:text-[#a8834a] sm:inline-flex"><MapPin size={13} />{b.addr}</a>
          <a href="#rating" className="hover:text-[#a8834a]">★ {b.rating} · {b.rev} оценка на Яндекс Картах</a>
        </div>
        <div className="grid gap-8 pb-14 pt-8 md:grid-cols-12 md:gap-6 md:pb-20 md:pt-10">
          <div className="order-2 md:order-1 md:col-span-4 md:pt-4">
            <h1 className={`${D} text-[clamp(34px,3.6vw,52px)] leading-[1.02]`}>Брови, ресницы, перманент, маникюр и стрижки — на Малиновке</h1>
            <ul className="mt-7 divide-y divide-[#12100d]/20 border-y border-[#12100d]/20">
              {[['Брови и ресницы', '01'], ['Перманентный макияж', '02'], ['Маникюр и педикюр', '03'], ['Стрижки', '04']].map(([t, n]) => <li key={t}><a href="#contents" className="flex items-baseline justify-between py-3 text-[17px] hover:text-[#a8834a]"><span>{t}</span><span className="text-[12px] tracking-[.16em] text-[#12100d]/55">стр. {n}</span></a></li>)}
            </ul>
          </div>
          <div className="order-1 md:order-2 md:col-span-4">
            <div className="relative mx-auto aspect-[3/4] w-full max-w-[400px] overflow-hidden rounded-t-full bg-[linear-gradient(160deg,#6b4d24,#c9a468_45%,#f1dfb6_52%,#9c7a43)] max-md:aspect-[4/3.6] max-md:max-w-[340px]">
              {!lite && vis && <Suspense fallback={null}><div className="absolute inset-0"><GoldPlate active={vis} /></div></Suspense>}
              <EyeArt className="absolute left-1/2 top-[52%] w-[78%] -translate-x-1/2 -translate-y-1/2" />
              <p className="absolute inset-x-0 bottom-5 text-center text-[11px] uppercase tracking-[.3em] text-[#12100d]/70">Выпуск · {b.district}</p>
            </div>
          </div>
          <div className="order-3 flex flex-col justify-between gap-8 md:col-span-4 md:pt-4">
            <p className={`${D} text-[clamp(40px,4.6vw,68px)] leading-[.98]`}>Быть боссом<br /><span className={GOLD_TXT}>своего образа.</span></p>
            <div>
              <p className="max-w-[340px] text-[17px] leading-relaxed text-[#12100d]/75">Подберём форму бровей, сделаем перманент, маникюр или стрижку — спокойно, аккуратно, под вас.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href="#book" className="inline-flex h-14 items-center gap-3 bg-[#12100d] px-7 text-[14px] uppercase tracking-[.16em] text-[#f3ece0] hover:bg-[#a8834a]">Записаться <ArrowRight size={16} /></a>
                <a href={'tel:' + tel(b.phone)} className="inline-flex h-14 items-center gap-2 border border-[#12100d] px-5 text-[16px] hover:bg-[#12100d] hover:text-[#f3ece0]"><Phone size={15} />{b.phone}</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- contents (services) ---------------- */
const SV = [
  ['Брови: коррекция и окрашивание', 'Форма под черты лица, окрашивание краской или хной.', '≈ 40–60 мин'],
  ['Ламинирование бровей и ресниц', 'Укладка и питание — аккуратный вид без ежедневной укладки.', '≈ 1 ч'],
  ['Перманент бровей', 'Пудровое напыление или волоски — мастер подберёт технику.', 'по консультации'],
  ['Перманент губ', 'Контур и цвет губ, естественно или ярче.', 'по консультации'],
  ['Межресничка', 'Тонкая линия роста ресниц — взгляд выразительнее.', 'по консультации'],
  ['Маникюр', 'Уход, покрытие гель-лаком, дизайн.', '≈ 1–2 ч'],
  ['Педикюр', 'Аккуратная обработка стоп и ногтей, покрытие.', '≈ 1–1,5 ч'],
  ['Стрижки', 'Женские и мужские стрижки, укладка.', '≈ 40–60 мин'],
]
function Contents() {
  return (
    <section id="contents" className="scroll-mt-16 border-t border-[#12100d]">
      <div className="mx-auto grid max-w-[1320px] gap-10 px-5 py-20 md:px-10 md:py-28 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="text-[12.5px] uppercase tracking-[.2em] text-[#a8834a]">В номере</p>
          <h2 className={`${D} mt-3 text-[clamp(56px,8vw,120px)] leading-[.88]`}>Содер&shy;жание</h2>
          <p className="mt-6 max-w-[320px] text-[16px] leading-relaxed text-[#12100d]/70">Стоимость — уточняйте у администратора: зависит от объёма работы. Время — ориентировочное.</p>
        </div>
        <ol className="border-t border-[#12100d] lg:col-span-8">
          {SV.map(([t, d, time], i) => (
            <Reveal as="li" key={t} delay={i * 0.03} className="group grid grid-cols-[48px_1fr] gap-x-4 gap-y-2 border-b border-[#12100d]/25 py-6 md:grid-cols-[64px_1fr_150px_auto] md:items-center">
              <span className={`${D} text-[30px] leading-none text-[#a8834a]`}>{String(i + 1).padStart(2, '0')}</span>
              <div><h3 className={`${D} text-[24px] leading-tight md:text-[28px]`}>{t}</h3><p className="mt-1 text-[15.5px] leading-snug text-[#12100d]/70">{d}</p></div>
              <p className="col-start-2 text-[13px] uppercase tracking-[.12em] text-[#12100d]/65 md:col-start-auto">{time}<br /><span className="normal-case tracking-normal">цена — уточняйте</span></p>
              <a href="#book" data-svc={t} className="col-start-2 inline-flex h-11 w-fit items-center gap-2 border border-[#12100d] px-4 text-[12.5px] uppercase tracking-[.14em] transition-colors hover:bg-[#12100d] hover:text-[#f3ece0] md:col-start-auto">Записаться <ArrowRight size={14} /></a>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}

/* ---------------- PMU explainer ---------------- */
const rnd = i => { const x = Math.sin(i * 91.7) * 43758.5; return x - Math.floor(x) }
function browHairs(after) {
  const out = []
  const N = after ? 70 : 26
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1)
    if (!after && rnd(i + 7) < 0.3) continue
    const x = (1 - t) ** 2 * 96 + 2 * (1 - t) * t * 196 + t * t * 310
    const y = (1 - t) ** 2 * 104 + 2 * (1 - t) * t * 46 + t * t * 88
    const th = 18 * (1 - t) + 4
    const off = (rnd(i) - 0.5) * th
    const ang = (-72 + t * 58 + (rnd(i + 3) - 0.5) * 12) * Math.PI / 180
    const L = (after ? 15 : 11) + rnd(i + 5) * 5
    out.push(`M${(x).toFixed(1)} ${(y + off).toFixed(1)} l${(Math.cos(ang) * L).toFixed(1)} ${(Math.sin(ang) * L).toFixed(1)}`)
  }
  return out.join(' ')
}
const LASH_D = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => { const t = (i + 0.5) / 11, x = 60 + t * 280, y = 150 - Math.sin(t * Math.PI) * 50 * 1.05 - (t < 0.5 ? 0 : 0); const dx = (t - 0.35) * 30; return `M${x.toFixed(1)} ${y.toFixed(1)} q${(dx * 0.4).toFixed(1)} -14 ${(dx).toFixed(1)} -26` }).join(' ')
function Skin({ id }) {
  return <><defs><radialGradient id={id} cx="50%" cy="40%" r="75%"><stop offset="0" stopColor="#f0d9c4" /><stop offset="1" stopColor="#d9b597" /></radialGradient></defs><rect width="400" height="240" fill={`url(#${id})`} /></>
}
function BrowArt({ after }) {
  const hairs = useMemo(() => browHairs(after), [after])
  const k = after ? 'a' : 'b'
  return (
    <g>
      <Skin id={'sk-br' + k} />
      <path d="M100 168 Q200 108 300 168 Q200 206 100 168Z" fill="#fbf5ee" stroke="#3b2a1f" strokeWidth="2" />
      <circle cx="200" cy="162" r="26" fill="#5c3d28" /><circle cx="200" cy="162" r="11" fill="#140d08" /><circle cx="207" cy="155" r="4" fill="#fff" opacity=".8" />
      <path d="M96 156 Q200 92 304 156" stroke="#b08a6e" strokeWidth="1.5" fill="none" opacity=".6" />
      {after && <path d="M92 108 Q150 52 236 54 Q290 58 316 88 Q286 74 236 72 Q160 72 100 116Z" fill="#4a2f20" opacity=".55" />}
      <path d={hairs} stroke={after ? '#3a2417' : '#8f6d55'} strokeWidth={after ? 2 : 1.6} strokeLinecap="round" opacity={after ? 0.95 : 0.7} fill="none" />
    </g>
  )
}
function LipArt({ after }) {
  const k = after ? 'a' : 'b'
  return (
    <g>
      <Skin id={'sk-lp' + k} />
      <defs>
        <linearGradient id={'lp' + k} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={after ? '#b4505c' : '#ddb0a2'} /><stop offset="1" stopColor={after ? '#8e3442' : '#cf9e90'} /></linearGradient>
        <filter id="lpblur"><feGaussianBlur stdDeviation="2.2" /></filter>
      </defs>
      <g filter={after ? undefined : 'url(#lpblur)'}>
        <path d="M100 128 Q148 88 186 104 Q200 96 214 104 Q252 88 300 128 Q200 136 100 128Z" fill={`url(#lp${k})`} />
        <path d="M100 128 Q200 136 300 128 Q256 190 200 192 Q144 190 100 128Z" fill={`url(#lp${k})`} />
      </g>
      {after && <path d="M100 128 Q148 88 186 104 Q200 96 214 104 Q252 88 300 128 Q256 190 200 192 Q144 190 100 128Z" fill="none" stroke="#7a2733" strokeWidth="1.6" />}
      <path d="M104 128 Q200 140 296 128" stroke={after ? '#5e1c27' : '#b88576'} strokeWidth="2" fill="none" />
      <ellipse cx="200" cy="165" rx="38" ry="7" fill="#fff" opacity={after ? 0.28 : 0.15} />
    </g>
  )
}
function LashArt({ after }) {
  const k = after ? 'a' : 'b'
  return (
    <g>
      <Skin id={'sk-ls' + k} />
      <path d="M60 150 Q200 48 340 150 Q200 214 60 150Z" fill="#fbf5ee" stroke="#5a4334" strokeWidth="1.5" />
      <circle cx="200" cy="140" r="40" fill="#5c3d28" /><circle cx="200" cy="140" r="17" fill="#140d08" /><circle cx="211" cy="129" r="6" fill="#fff" opacity=".8" />
      <path d="M50 120 Q200 30 350 120" stroke="#b08a6e" strokeWidth="1.5" fill="none" opacity=".5" />
      <path d={LASH_D} stroke="#2a1b12" strokeWidth={after ? 2 : 1.4} strokeLinecap="round" fill="none" opacity={after ? 1 : 0.75} />
      {after && <path d="M62 149 Q200 46 338 149" stroke="#150d08" strokeWidth="4.5" strokeLinecap="round" fill="none" />}
    </g>
  )
}
const ZONES = [
  { k: 'brows', t: 'Брови', svc: 'Перманент бровей', Art: BrowArt, what: 'Пигмент в верхних слоях кожи создаёт форму и густоту бровей. Техника — пудровое напыление или волоски — подбирается на консультации.',
    prep: ['За 1–2 недели — не загорать и не делать пилинг в зоне бровей', 'Неделю не выщипывать брови — мастеру важна естественная форма', 'Накануне — без алкоголя и энергетиков', 'Беременность, приём лекарств, воспаления кожи — обсудите с мастером заранее'] },
  { k: 'lips', t: 'Губы', svc: 'Перманент губ', Art: LipArt, what: 'Пигмент выравнивает контур и добавляет цвет губам — от натурального оттенка до более яркого.',
    prep: ['Если бывает герпес — заранее проконсультируйтесь с врачом', 'За несколько дней — без пилинга губ, увлажняйте бальзамом', 'Накануне — без алкоголя', 'Противопоказания и самочувствие — обсудите с мастером заранее'] },
  { k: 'lash', t: 'Межресничка', svc: 'Межресничка', Art: LashArt, what: 'Тонкая прокрашенная линия между ресницами — ресницы выглядят гуще, взгляд выразительнее, без стрелок.',
    prep: ['Приходите без макияжа глаз', 'Контактные линзы — снять; возьмите очки или футляр', 'Наращённые ресницы — уточните у мастера заранее', 'Накануне — без алкоголя'] },
]
function BeforeAfter({ z }) {
  const [pos, setPos] = useState(50)
  const Art = z.Art
  return (
    <div className="relative select-none overflow-hidden border border-[#f3ece0]/20">
      <svg viewBox="0 0 400 240" className="block w-full" role="img" aria-label={`Иллюстрация «до и после»: ${z.t}`}>
        <defs><clipPath id={'clip-' + z.k}><rect x={pos * 4} y="0" width={400 - pos * 4} height="240" /></clipPath></defs>
        <Art after={false} />
        <g clipPath={`url(#clip-${z.k})`}><Art after /></g>
        <line x1={pos * 4} x2={pos * 4} y1="0" y2="240" stroke="#f3ece0" strokeWidth="1.5" />
        <circle cx={pos * 4} cy="120" r="15" fill="#12100d" stroke="#d9b77a" strokeWidth="1.5" />
        <path d={`M${pos * 4 - 5} 115 l-5 5 5 5 M${pos * 4 + 5} 115 l5 5 -5 5`} stroke="#f3ece0" strokeWidth="1.6" fill="none" />
      </svg>
      <span className="pointer-events-none absolute left-3 top-3 bg-[#12100d]/80 px-2 py-1 text-[11px] uppercase tracking-[.2em] text-[#f3ece0]">До</span>
      <span className="pointer-events-none absolute right-3 top-3 bg-[#a8834a] px-2 py-1 text-[11px] uppercase tracking-[.2em] text-[#12100d]">После</span>
      <input type="range" min="0" max="100" value={pos} onChange={e => setPos(+e.target.value)} aria-label="Сравнить: до и после" className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0" style={{ touchAction: 'pan-y' }} />
    </div>
  )
}
function Pmu() {
  const [zi, setZi] = useState(0)
  const z = ZONES[zi]
  return (
    <section id="pmu" className="scroll-mt-16 bg-[#12100d] text-[#f3ece0]">
      <div className="mx-auto max-w-[1320px] px-5 py-20 md:px-10 md:py-28">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="text-[12.5px] uppercase tracking-[.2em] text-[#d9b77a]">Разбор · стр. 02</p>
            <h2 className={`${D} mt-3 text-[clamp(48px,7vw,104px)] leading-[.9]`}>Перманент:<br /><span className={GOLD_TXT}>что изменится</span></h2>
          </div>
          <p className="text-[16.5px] leading-relaxed text-[#f3ece0]/70 lg:col-span-5">Выберите зону и потяните ползунок. Это иллюстрация, а не фото — реальный результат мастер обсудит с вами на консультации.</p>
        </div>
        <div className="mt-10 flex flex-wrap gap-2" role="tablist" aria-label="Зона">
          {ZONES.map((x, i) => <button key={x.k} role="tab" aria-selected={zi === i} aria-controls="pmu-panel" onClick={() => setZi(i)} className={`h-12 min-w-[120px] border px-5 text-[14px] uppercase tracking-[.16em] transition-colors ${zi === i ? 'border-[#d9b77a] bg-[#d9b77a] text-[#12100d]' : 'border-[#f3ece0]/30 hover:border-[#d9b77a]'}`}>{x.t}</button>)}
        </div>
        <div id="pmu-panel" role="tabpanel" className="mt-8 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait"><motion.div key={z.k} initial={{ opacity: 0, clipPath: 'inset(0 0 0 100%)' }} animate={{ opacity: 1, clipPath: 'inset(0 0 0 0%)' }} exit={{ opacity: 0 }} transition={{ duration: 0.6, ease: [0.6, 0, 0.2, 1] }}><BeforeAfter z={z} /></motion.div></AnimatePresence>
            <p className="mt-3 text-[13px] text-[#f3ece0]/55">Иллюстрация. Перетащите ползунок или используйте стрелки клавиатуры.</p>
          </div>
          <div className="lg:col-span-5">
            <h3 className={`${D} text-[36px] leading-none`}>{z.t}</h3>
            <p className="mt-4 text-[16.5px] leading-relaxed text-[#f3ece0]/80">{z.what}</p>
            <p className="mt-3 text-[15px] text-[#f3ece0]/60">Длительность, количество сеансов и цена — уточнит мастер на консультации.</p>
            <p className="mt-8 text-[12.5px] uppercase tracking-[.2em] text-[#d9b77a]">Как подготовиться</p>
            <ul className="mt-3 divide-y divide-[#f3ece0]/15 border-y border-[#f3ece0]/15">
              {z.prep.map(p => <li key={p} className="flex gap-3 py-3 text-[16px] leading-snug"><Check size={17} className="mt-0.5 shrink-0 text-[#d9b77a]" />{p}</li>)}
            </ul>
            <a href="#book" data-svc={z.svc} className="mt-8 inline-flex h-14 items-center gap-3 bg-[#d9b77a] px-7 text-[14px] uppercase tracking-[.16em] text-[#12100d] hover:bg-[#f3ece0]">Записаться: {z.t.toLowerCase()} <ArrowRight size={16} /></a>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- manifesto ---------------- */
function Manifesto() {
  return (
    <section className="bg-[#f3ece0] px-5 py-24 md:px-10 md:py-36">
      <div className="mx-auto max-w-[1100px]">
        <p className="text-[12.5px] uppercase tracking-[.2em] text-[#a8834a]">Колонка редактора</p>
        <ScrollWords text="Босс своего образа — это вы. Мы просто помогаем: подбираем форму, цвет и уход так, чтобы утром оставалось только выйти из дома." className={`${D} mt-6 block text-[clamp(32px,4.6vw,66px)] leading-[1.08]`} dim={0.18} />
      </div>
    </section>
  )
}

/* ---------------- how ---------------- */
const STEPS = [['Запись', 'На сайте, по телефону, в Viber или Telegram.'], ['Консультация', 'Обсуждаем, что хотите, мастер предлагает варианты.'], ['Процедура', 'Спокойно и аккуратно — без спешки.'], ['Уход', 'Расскажем, как ухаживать, чтобы результат держался.']]
function How() {
  return (
    <section id="how" className="scroll-mt-16 border-t border-[#12100d]">
      <div className="mx-auto max-w-[1320px] px-5 py-20 md:px-10 md:py-28">
        <h2 className={`${D} text-[clamp(48px,7vw,104px)] leading-[.9]`}>Как это работает</h2>
        <ol className="mt-12 grid gap-px bg-[#12100d]/25 md:grid-cols-4">
          {STEPS.map(([h, d], i) => (
            <Reveal as="li" key={h} delay={i * 0.06} className="bg-[#f3ece0] py-6 md:px-6 md:first:pl-0">
              <span className={`${D} text-[72px] leading-none ${GOLD_TXT}`}>{i + 1}</span>
              <h3 className={`${D} mt-6 text-[28px] leading-none`}>{h}</h3>
              <p className="mt-3 text-[16px] leading-snug text-[#12100d]/70">{d}</p>
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
    <section id="rating" className="scroll-mt-16 bg-[#12100d] text-[#f3ece0]">
      <div className="mx-auto grid max-w-[1320px] items-center gap-8 px-5 py-20 md:grid-cols-12 md:px-10 md:py-28">
        <p className={`${D} md:col-span-6 text-[clamp(150px,24vw,340px)] leading-[.8]`}><LineReveal className={GOLD_TXT}>{b.rating}</LineReveal></p>
        <div className="md:col-span-6">
          <p className="text-[12.5px] uppercase tracking-[.2em] text-[#d9b77a]">Яндекс Карты</p>
          <p className={`${D} mt-4 text-[clamp(32px,3.6vw,52px)] leading-[1.02]`}>{b.rev} оценка — и средний балл {b.rating}.</p>
          <p className="mt-4 max-w-[440px] text-[16.5px] leading-relaxed text-[#f3ece0]/70">Все отзывы клиенток — на странице салона в Яндекс Картах.</p>
          <a href={`https://yandex.ru/maps/org/${b.oid}/reviews/`} target="_blank" rel="noopener" className="mt-8 inline-flex h-14 items-center gap-3 border border-[#d9b77a] px-6 text-[14px] uppercase tracking-[.16em] hover:bg-[#d9b77a] hover:text-[#12100d]">Читать отзывы <ArrowUpRight size={16} /></a>
        </div>
      </div>
    </section>
  )
}

/* ---------------- FAQ ---------------- */
const FAQ = [
  ['Больно ли делать перманент?', 'Ощущения индивидуальны. Мастер расскажет, как проходит процедура и что можно сделать для комфорта.'],
  ['Сколько держится перманент?', 'Зависит от кожи, зоны и ухода. Обычно требуется коррекция — подробнее расскажет мастер на консультации.'],
  ['Можно ли прийти с ребёнком?', 'Лучше уточнить при записи — подскажем, как удобнее.'],
  ['Сколько длится маникюр?', 'Обычно 1–2 часа, зависит от покрытия и дизайна.'],
  ['Как оплатить?', 'Способы оплаты уточняйте у администратора.'],
  ['Где вы находитесь?', `${b.addr}, ${b.district}, ${b.city}. Карта — внизу страницы.`],
]
function Faq() {
  const [o, setO] = useState(0)
  return (
    <section id="faq" className="border-t border-[#12100d]">
      <div className="mx-auto grid max-w-[1320px] gap-10 px-5 py-20 md:px-10 md:py-28 lg:grid-cols-12">
        <h2 className={`${D} text-[clamp(48px,6vw,88px)] leading-[.9] lg:col-span-4`}>Вопросы<br />и ответы</h2>
        <div className="border-t border-[#12100d] lg:col-span-8">
          {FAQ.map(([q, a], i) => (
            <div key={q} className="border-b border-[#12100d]/25">
              <h3><button type="button" aria-expanded={o === i} aria-controls={'bq' + i} onClick={() => setO(o === i ? -1 : i)} className={`${D} flex w-full items-center justify-between gap-6 py-5 text-left text-[22px] leading-tight md:text-[26px]`}>{q}<span className={`grid h-10 w-10 shrink-0 place-items-center border ${o === i ? 'border-[#a8834a] bg-[#a8834a] text-[#12100d]' : 'border-[#12100d]'}`}>{o === i ? <Minus size={17} /> : <Plus size={17} />}</span></button></h3>
              <AnimatePresence initial={false}>{o === i && <motion.div id={'bq' + i} initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden"><p className="max-w-[640px] pb-6 text-[16.5px] leading-relaxed text-[#12100d]/75">{a}</p></motion.div>}</AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------- booking ---------------- */
const BSV = ['Брови', 'Ресницы', 'Перманент', 'Маникюр', 'Педикюр', 'Стрижка', 'Нужна консультация']
const WHEN = ['Как можно скорее', 'Будни', 'Выходные', 'Перезвоните мне']
function Opt({ on, children, ...r }) {
  return <button type="button" aria-pressed={on} className={`min-h-[52px] border px-5 text-[16px] transition-colors ${on ? 'border-[#12100d] bg-[#12100d] text-[#f3ece0]' : 'border-[#12100d]/30 hover:border-[#12100d]'}`} {...r}>{children}</button>
}
function Book() {
  const bk = useBooking()
  const [step, setStep] = useState(0)
  const [when, setWhen] = useState('')
  const [err, setErr] = useState('')
  const head = useRef(null)
  useEffect(() => { if (step) head.current?.focus() }, [step])
  useEffect(() => { if (bk.s.svc) { setStep(0); setErr('') } }, [bk.s.svc])
  const next = e => {
    e.preventDefault()
    if (step === 0 && !bk.s.svc) return setErr('Выберите услугу')
    if (step === 1 && !when) return setErr('Выберите, когда удобно')
    setErr('')
    if (step < 2) setStep(step + 1); else bk.submit()
  }
  const custom = bk.s.svc && !BSV.includes(bk.s.svc)
  return (
    <section id="book" className="scroll-mt-16 border-t border-[#12100d] bg-[#e9dfcd]">
      <div className="mx-auto grid max-w-[1320px] gap-12 px-5 py-20 md:px-10 md:py-28 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="text-[12.5px] uppercase tracking-[.2em] text-[#8a6a36]">Запись</p>
          <h2 className={`${D} mt-3 text-[clamp(52px,7vw,104px)] leading-[.9]`}>Ваше время</h2>
          <p className="mt-6 max-w-[380px] text-[17px] leading-relaxed text-[#12100d]/75">Три коротких шага — администратор перезвонит и подберёт время. Или напишите:</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <a href={'tel:' + tel(b.phone)} className="inline-flex h-12 items-center gap-2 border border-[#12100d] px-4 text-[15px] hover:bg-[#12100d] hover:text-[#f3ece0]"><Phone size={15} />{b.phone}</a>
            <a href={b.viber} className="inline-flex h-12 items-center border border-[#12100d] px-4 text-[15px] hover:bg-[#12100d] hover:text-[#f3ece0]">Viber</a>
            <a href={b.tg} target="_blank" rel="noopener" className="inline-flex h-12 items-center gap-2 border border-[#12100d] px-4 text-[15px] hover:bg-[#12100d] hover:text-[#f3ece0]"><TG />Telegram</a>
          </div>
        </div>
        <div className="bg-[#f3ece0] p-5 md:p-10 lg:col-span-7">
          {bk.s.sent ? (
            <div className="py-6 text-center" role="status">
              <CheckDraw className="mx-auto text-[#a8834a]" />
              <p className={`${D} mt-5 text-[44px] leading-none`}>Вы записаны</p>
              <p className="mx-auto mt-4 max-w-[420px] text-[16.5px] text-[#12100d]/75">{bk.s.svc} · {when}. Администратор перезвонит и подтвердит время. В готовом сайте заявка сразу придёт вам в Telegram.</p>
              <button type="button" onClick={() => { bk.reset(); setStep(0); setWhen('') }} className="mt-8 text-[13px] uppercase tracking-[.16em] underline underline-offset-4">Новая запись</button>
            </div>
          ) : (
            <form onSubmit={next} noValidate>
              <div className="flex gap-6 text-[12px] uppercase tracking-[.16em]" aria-hidden="true">{['Услуга', 'Когда', 'Контакт'].map((t, i) => <span key={t} className={`border-b pb-2 ${i <= step ? 'border-[#12100d] text-[#12100d]' : 'border-transparent text-[#12100d]/45'}`}>{String(i + 1).padStart(2, '0')} {t}</span>)}</div>
              <h3 ref={head} tabIndex={-1} className={`${D} mt-8 text-[34px] leading-none outline-none`}>{['Что делаем?', 'Когда удобно?', 'Как с вами связаться?'][step]}</h3>
              <AnimatePresence mode="wait">
                <motion.div key={step} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }} className="mt-6">
                  {step === 0 && <div className="flex flex-wrap gap-2">{custom && <Opt on>{bk.s.svc}</Opt>}{BSV.map(s => <Opt key={s} on={bk.s.svc === s} onClick={() => { bk.upd('svc', s); setErr('') }}>{s}</Opt>)}</div>}
                  {step === 1 && <div className="flex flex-wrap gap-2">{WHEN.map(d => <Opt key={d} on={when === d} onClick={() => { setWhen(d); setErr('') }}>{d}</Opt>)}</div>}
                  {step === 2 && <div className="space-y-4">
                    <div><label htmlFor="bk-name" className="text-[12px] uppercase tracking-[.16em] text-[#12100d]/70">Имя</label><input id="bk-name" value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} autoComplete="name" className="mt-1.5 h-14 w-full border border-[#12100d]/40 bg-white/60 px-4 text-[17px] outline-none focus:border-[#12100d] focus:ring-2 focus:ring-[#a8834a]/40" /></div>
                    <div><label htmlFor="bk-phone" className="text-[12px] uppercase tracking-[.16em] text-[#12100d]/70">Телефон</label><input id="bk-phone" value={bk.s.phone} onChange={e => bk.upd('phone', e.target.value)} onFocus={phoneFocus(bk)} type="tel" inputMode="tel" autoComplete="tel" placeholder="+375 __ ___-__-__" aria-invalid={bk.s.err} aria-describedby={bk.s.err ? 'bk-perr' : undefined} className={`mt-1.5 h-14 w-full border bg-white/60 px-4 text-[17px] outline-none placeholder:text-[#12100d]/40 focus:ring-2 focus:ring-[#a8834a]/40 ${bk.s.err ? 'border-[#a3122a]' : 'border-[#12100d]/40 focus:border-[#12100d]'}`} />
                      {bk.s.err && <p id="bk-perr" className="mt-2 text-[15px] text-[#a3122a]" role="alert">Проверьте номер — 12 цифр с кодом +375.</p>}</div>
                  </div>}
                </motion.div>
              </AnimatePresence>
              {err && <p className="mt-4 text-[15px] text-[#a3122a]" role="alert">{err}</p>}
              <div className="mt-8 flex items-center justify-between">
                {step > 0 ? <button type="button" onClick={() => setStep(step - 1)} className="min-h-[44px] text-[13px] uppercase tracking-[.16em] text-[#12100d]/70 hover:text-[#12100d]">← Назад</button> : <span />}
                <button type="submit" disabled={bk.s.loading} className="inline-flex h-14 items-center gap-3 bg-[#12100d] px-7 text-[14px] uppercase tracking-[.16em] text-[#f3ece0] hover:bg-[#a8834a] disabled:opacity-60">{step < 2 ? 'Дальше' : bk.s.loading ? 'Отправляем…' : 'Записаться'} <ArrowRight size={16} /></button>
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
    <section id="contact" className="scroll-mt-16 bg-[#12100d] text-[#f3ece0]">
      <div className="mx-auto grid max-w-[1320px] lg:grid-cols-2">
        <div className="px-5 py-20 md:px-10">
          <p className="text-[12.5px] uppercase tracking-[.2em] text-[#d9b77a]">Контакты</p>
          <h2 className={`${D} mt-3 text-[clamp(48px,6vw,88px)] leading-[.9]`}>Малиновка</h2>
          <dl className="mt-10 space-y-6">
            <div><dt className="text-[12px] uppercase tracking-[.16em] text-[#f3ece0]/55">Адрес</dt><dd className={`${D} mt-1 text-[26px]`}>{b.addr}<br />{b.district}, {b.city}</dd></div>
            <div><dt className="text-[12px] uppercase tracking-[.16em] text-[#f3ece0]/55">Телефон / Viber</dt><dd><a href={'tel:' + tel(b.phone)} className={`${D} mt-1 inline-block text-[26px] text-[#d9b77a]`}>{b.phone}</a></dd></div>
            <div><dt className="text-[12px] uppercase tracking-[.16em] text-[#f3ece0]/55">Часы работы</dt><dd className="mt-1 text-[16px]">Уточняйте по телефону</dd></div>
          </dl>
          <div className="mt-8 flex flex-wrap gap-2">
            <a href={'tel:' + tel(b.phone)} className="inline-flex h-12 items-center gap-2 bg-[#d9b77a] px-5 text-[13px] uppercase tracking-[.14em] text-[#12100d]"><Phone size={15} />Позвонить</a>
            <a href={b.viber} className="inline-flex h-12 items-center border border-[#f3ece0]/30 px-5 text-[13px] uppercase tracking-[.14em] hover:border-[#d9b77a]">Viber</a>
            <a href={b.tg} target="_blank" rel="noopener" className="inline-flex h-12 items-center gap-2 border border-[#f3ece0]/30 px-5 text-[13px] uppercase tracking-[.14em] hover:border-[#d9b77a]"><TG />Telegram</a>
            <a href={b.ig} target="_blank" rel="noopener" className="inline-flex h-12 items-center gap-2 border border-[#f3ece0]/30 px-5 text-[13px] uppercase tracking-[.14em] hover:border-[#d9b77a]"><IG />Instagram</a>
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
      <div className={`${T} overflow-x-clip`} style={{ background: CREAM, color: INK, '--sel': GOLD, '--selc': INK }}>
        <Ribbon name={b.name} bg={INK} fg={CREAM} />
        <Header />
        <main>
          <Cover lite={lite} />
          <Contents />
          <Pmu />
          <Manifesto />
          <How />
          <Rating />
          <Faq />
          <Book />
          <Contact />
        </main>
        <footer className="border-t border-[#f3ece0]/15 bg-[#12100d] text-[#f3ece0]/60"><div className="mx-auto flex max-w-[1320px] flex-wrap justify-between gap-3 px-5 py-6 text-[12px] uppercase tracking-[.14em] md:px-10"><span>© 2026 {b.name} · Концепт сайта — Артём</span><span>{b.addr}, {b.city}</span></div></footer>
        <CallBar phone={b.phone} barCls="bg-[#12100d] border-t border-[#d9b77a]/40" callCls="border border-[#f3ece0]/30 text-[#f3ece0]" bookCls="bg-[#d9b77a] text-[#12100d] uppercase tracking-[.12em] text-[14px]" />
        <div className="h-[72px] bg-[#12100d] sm:hidden" />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
