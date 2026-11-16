import React, { useRef, useState, useEffect, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, useSpring, useMotionValueEvent, useMotionTemplate, useInView, AnimatePresence, MotionConfig } from 'framer-motion'
import { ArrowRight, ArrowUpRight, Phone, MapPin, Star, Check, ChevronLeft } from 'lucide-react'
import '../lib/base.css'
import { LineReveal, useSmooth, Ribbon, Reveal, useBooking, phoneFocus, CheckDraw, MapFrame, CallBar, tel, useLite, IG, WA } from '../lib/kit'

const Car3D = lazy(() => import('./lrpremium3d'))

const b = {
  name: 'ЛР Премиум',
  addr: 'ул. Скрыганова, 6/1, Минск',
  phone: '+375 29 282-89-96',
  msg: '+375 29 607-17-76',
  ig: 'https://www.instagram.com/jlr.premium/',
  rating: '4.8', rev: 330, oid: '2799816513',
}
const viber = 'viber://chat?number=%2B' + b.msg.replace(/\D/g, '')
const wa = 'https://wa.me/' + b.msg.replace(/\D/g, '')

const STONE = '#e9e4da', INK = '#121a16', GREEN = '#15241c', NIGHT = '#0c110e', BRASS = '#a9824a', BRASS2 = '#c9a46a'
const SERIF = "font-['Cormorant_Garamond',serif]"

const CH = [
  { k: 'Двигатель', t: 'Под капотом — без догадок.', d: 'Диагностика, обслуживание и ремонт двигателей. Сначала данные, потом ключи.' },
  { k: 'Пневмоподвеска', t: 'Снова держит уровень.', d: 'Компрессор, пневмобаллоны, клапаны, датчики высоты. Ищем причину, а не меняем всё подряд.' },
  { k: 'Электроника', t: 'Каждый блок на связи.', d: 'Ошибки, адаптации, кодирование блоков, проводка — с пониманием того, как устроены эти машины.' },
  { k: 'Детейлинг', t: 'Выглядит так же уверенно, как едет.', d: 'Мойка, полировка, защитные покрытия кузова, химчистка салона.' },
]
const FAMS = ['Range Rover', 'Discovery', 'Defender', 'Jaguar']

/* ---------------- pinned film: hero + 4 service zones ---------------- */
function LiteCar({ idx }) {
  const zones = [null, [330, 150], [260, 215], [200, 130], [120, 120]]
  const z = zones[idx]
  return (
    <svg viewBox="0 0 520 280" className="absolute left-1/2 top-[30%] w-[min(92vw,760px)] -translate-x-1/2 md:left-[62%] md:top-1/2 md:-translate-y-1/2">
      <path d="M40 200 L40 150 Q42 128 70 124 L150 118 L190 76 Q200 66 220 66 L380 66 Q398 66 406 80 L430 122 L470 128 Q490 132 490 150 L490 200 Z" fill="currentColor" opacity=".9" />
      <path d="M200 80 L224 76 L300 76 L300 116 L178 118 Z M312 76 L380 76 Q392 76 398 86 L414 116 L312 116 Z" fill="#0d1113" opacity=".7" />
      {[130, 400].map(x => <g key={x}><circle cx={x} cy="205" r="38" fill="#141414" /><circle cx={x} cy="205" r="22" fill="#8d9297" /></g>)}
      {z && <g><circle cx={z[0]} cy={z[1]} r="26" fill="none" stroke={BRASS2} strokeWidth="2"><animate attributeName="r" values="18;34;18" dur="2.4s" repeatCount="indefinite" /></circle><circle cx={z[0]} cy={z[1]} r="6" fill={BRASS2} /></g>}
    </svg>
  )
}

function Film({ lite }) {
  const ref = useRef(null)
  const near = useInView(ref, { margin: '300px 0px 300px 0px' })
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: .4 })
  const [idx, setIdx] = useState(0)
  useMotionValueEvent(p, 'change', v => setIdx(Math.min(4, Math.max(0, Math.round(v * 4.6 - .15)))))
  const bg = useTransform(p, [0, .1, .17, .54, .6, .77, .83, 1], [STONE, STONE, GREEN, GREEN, NIGHT, NIGHT, STONE, STONE])
  const fg = useTransform(p, [0, .1, .17, .77, .83, 1], [INK, INK, STONE, STONE, INK, INK])
  const heroO = useTransform(scrollYProgress, [0, .09], [1, 0])
  const heroY = useTransform(scrollYProgress, [0, .1], [0, -80])
  const heroBlur = useTransform(scrollYProgress, [0, .09], [0, 10])
  const filter = useMotionTemplate`blur(${heroBlur}px)`
  return (
    <motion.section ref={ref} id="film" className="relative h-[560vh]" style={{ background: bg, color: fg }}>
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          {lite ? <LiteCar idx={idx} /> : near && <Suspense fallback={null}><Car3D p={p} active={near} /></Suspense>}
        </div>

        {/* hero statement */}
        <motion.div style={{ opacity: heroO, y: heroY, filter }} className={`absolute inset-x-0 bottom-0 px-6 pb-28 md:bottom-auto md:top-[16vh] md:px-12 md:pb-0 ${idx > 0 ? 'pointer-events-none' : ''}`}>
          <div className="mx-auto max-w-[1400px]">
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .3 }} className="mb-5 text-[12px] font-semibold uppercase tracking-[.22em] opacity-60">Land Rover · Range Rover · Jaguar · Минск</motion.p>
            <h1 className={`${SERIF} text-[clamp(56px,8.4vw,150px)] font-medium leading-[.84] tracking-[-.025em]`}>
              <LineReveal delay={.1}>Спокойная</LineReveal>
              <LineReveal delay={.22} className="italic" ><span style={{ color: BRASS }}>уверенность.</span></LineReveal>
            </h1>
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .7 }} className="mt-6 max-w-[420px] text-[16px] leading-relaxed opacity-75 md:text-[17px]">Сервис и детейлинг британских автомобилей. Прокрутите — снимем панели и покажем, чем мы занимаемся.</motion.p>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .85 }} className="mt-8 flex flex-wrap items-center gap-3">
              <a href="#book" className="inline-flex h-[52px] items-center gap-3 rounded-full px-7 text-[15px] font-semibold text-[#e9e4da]" style={{ background: INK }}>Записаться <ArrowRight size={17} /></a>
              <a href="#plan" className="inline-flex h-[52px] items-center rounded-full border px-6 text-[15px] font-semibold" style={{ borderColor: 'rgba(18,26,22,.2)' }}>План обслуживания</a>
            </motion.div>
          </div>
        </motion.div>

        {/* chapter captions */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 px-6 pb-24 md:inset-y-0 md:flex md:items-center md:px-12 md:pb-0">
          <div className="mx-auto w-full max-w-[1400px]">
            <AnimatePresence mode="wait">
              {idx > 0 && (
                <motion.div key={idx} initial={{ opacity: 0, y: 28, clipPath: 'inset(100% 0 0 0)' }} animate={{ opacity: 1, y: 0, clipPath: 'inset(0% 0 0 0)' }} exit={{ opacity: 0, y: -20 }} transition={{ duration: .6, ease: [0.16, 1, 0.3, 1] }} className="max-w-[460px]">
                  <p className="mb-4 flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[.22em]" style={{ color: BRASS2 }}><span className="tabular-nums">0{idx}</span><span className="h-px w-10 bg-current" />{CH[idx - 1].k}</p>
                  <h2 className={`${SERIF} text-[clamp(40px,5.2vw,84px)] font-medium leading-[.92] tracking-[-.02em]`}>{CH[idx - 1].t}</h2>
                  <p className="mt-4 text-[15px] leading-relaxed opacity-70 md:text-[17px]">{CH[idx - 1].d}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* zone rail */}
        <div className="absolute right-6 top-6 flex gap-1.5 md:bottom-10 md:right-12 md:top-auto md:gap-6">
          {CH.map((c, i) => (
            <div key={c.k} className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.18em] transition-opacity duration-500" style={{ opacity: idx === i + 1 ? 1 : .35 }}>
              <span className="block h-[3px] w-6 rounded-full md:w-8" style={{ background: idx === i + 1 ? BRASS2 : 'currentColor' }} />
              <span className="hidden md:inline">{c.k}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}

/* ---------------- clip-path reveal (transition #2) ---------------- */
function Clip({ children, id, className = '', style }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 25%'] })
  const ins = useTransform(scrollYProgress, [0, 1], [7, 0])
  const r = useTransform(scrollYProgress, [0, 1], [56, 0])
  const cp = useMotionTemplate`inset(0 ${ins}% 0 ${ins}% round ${r}px ${r}px 0 0)`
  return <motion.section ref={ref} id={id} style={{ clipPath: cp, ...style }} className={className}>{children}</motion.section>
}

/* ---------------- bento ---------------- */
function Glow({ children, className = '', dark = false }) {
  const ref = useRef(null)
  const mv = e => { const r = ref.current.getBoundingClientRect(); ref.current.style.setProperty('--x', e.clientX - r.left + 'px'); ref.current.style.setProperty('--y', e.clientY - r.top + 'px') }
  return (
    <Reveal className={className}>
      <div ref={ref} onPointerMove={mv} className="group relative h-full rounded-[28px] p-px" style={{ background: `radial-gradient(420px circle at var(--x,50%) var(--y,0%), ${BRASS2}, ${dark ? 'rgba(255,255,255,.08)' : 'rgba(18,26,22,.1)'} 55%)` }}>
        <div className={`relative h-full overflow-hidden rounded-[27px] ${dark ? 'bg-[#15241c] text-[#e9e4da]' : 'bg-[#f3efe8] text-[#121a16]'}`}>{children}</div>
      </div>
    </Reveal>
  )
}

function Families() {
  const [i, setI] = useState(0)
  const ref = useRef(null); const v = useInView(ref)
  useEffect(() => { if (!v) return; const t = setInterval(() => setI(x => (x + 1) % FAMS.length), 2200); return () => clearInterval(t) }, [v])
  return (
    <div ref={ref} className="flex h-full flex-col justify-between p-8 md:p-10">
      <p className="text-[12px] font-semibold uppercase tracking-[.22em] opacity-60">Специализация</p>
      <div>
        <div className="relative h-[1.05em] overflow-hidden text-[clamp(48px,6.4vw,104px)]">
          <AnimatePresence mode="popLayout">
            <motion.span key={i} initial={{ y: '100%' }} animate={{ y: '0%' }} exit={{ y: '-100%' }} transition={{ duration: .8, ease: [0.76, 0, 0.24, 1] }} className={`${SERIF} absolute inset-x-0 top-0 block font-medium leading-[1] tracking-[-.02em]`}>{FAMS[i]}</motion.span>
          </AnimatePresence>
        </div>
        <p className="mt-6 max-w-[440px] text-[15px] leading-relaxed opacity-70">Работаем только с Land Rover и Jaguar. Знаем, где у этих машин слабые места и как их проверять.</p>
      </div>
    </div>
  )
}

function Rating() {
  const ref = useRef(null); const v = useInView(ref, { once: true })
  return (
    <div ref={ref} className="flex h-full flex-col justify-between p-8">
      <p className="text-[12px] font-semibold uppercase tracking-[.22em] opacity-60">Яндекс Карты</p>
      <div>
        <div className="flex items-end gap-4"><span className={`${SERIF} text-[104px] font-medium leading-[.8]`}>{b.rating}</span>
          <div className="relative mb-2 flex gap-1">
            {[0, 1, 2, 3, 4].map(i => <Star key={i} size={18} stroke="none" fill="rgba(18,26,22,.15)" />)}
            <motion.div initial={{ width: 0 }} animate={v ? { width: `${(4.8 / 5) * 100}%` } : {}} transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }} className="absolute inset-y-0 left-0 flex gap-1 overflow-hidden">
              {[0, 1, 2, 3, 4].map(i => <Star key={i} size={18} stroke="none" fill={BRASS} className="shrink-0" />)}
            </motion.div>
          </div>
        </div>
        <p className="mt-4 text-[15px] opacity-70">{b.rev} оценок клиентов</p>
      </div>
    </div>
  )
}

function Level() {
  return (
    <div className="flex h-full flex-col justify-between gap-6 p-8">
      <div className="flex items-start justify-between"><p className="text-[12px] font-semibold uppercase tracking-[.22em] opacity-60">Пневмоподвеска</p><span className="text-[12px] opacity-50">уровень кузова</span></div>
      <svg viewBox="0 0 300 120" className="w-full">
        <line x1="0" y1="112" x2="300" y2="112" stroke="currentColor" strokeOpacity=".2" />
        <motion.g animate={{ y: [0, -16, -16, 6, 6, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', times: [0, .2, .45, .6, .85, 1] }}>
          <path d="M30 70 L30 52 Q32 44 44 42 L90 40 L112 20 L210 20 L228 40 L262 44 Q272 46 272 56 L272 70 Z" fill="currentColor" />
          {[80, 225].map(x => <motion.rect key={x} x={x - 6} y="70" width="12" height="18" rx="5" fill={BRASS} animate={{ scaleY: [1, 1.8, 1.8, .7, .7, 1] }} style={{ originY: 0 }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', times: [0, .2, .45, .6, .85, 1] }} />)}
        </motion.g>
        {[80, 225].map(x => <g key={x}><circle cx={x} cy="94" r="17" fill="#141414" /><circle cx={x} cy="94" r="8" fill="#8d9297" /></g>)}
      </svg>
      <p className="text-[15px] leading-relaxed opacity-70">Проверяем компрессор, баллоны и клапаны, ищем утечки, калибруем датчики высоты.</p>
    </div>
  )
}

function Scope() {
  return (
    <div className="flex h-full flex-col justify-between gap-6 p-8">
      <p className="text-[12px] font-semibold uppercase tracking-[.22em] opacity-60">Диагностика</p>
      <svg viewBox="0 0 300 90" className="w-full" fill="none">
        {[0, 1, 2].map(i => <line key={i} x1="0" x2="300" y1={15 + i * 30} y2={15 + i * 30} stroke="currentColor" strokeOpacity=".08" />)}
        <motion.path d="M0 45 L40 45 L50 15 L60 75 L70 45 L120 45 L130 20 L140 70 L150 45 L200 45 L210 12 L220 78 L230 45 L300 45" stroke={BRASS2} strokeWidth="2" initial={{ pathLength: 0 }} whileInView={{ pathLength: [0, 1] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }} />
      </svg>
      <p className="text-[15px] leading-relaxed opacity-70">Дилерский уровень диагностики: ошибки, параметры, адаптации.</p>
    </div>
  )
}

function Gloss() {
  return (
    <div className="relative flex h-full min-h-[260px] flex-col justify-between overflow-hidden p-8">
      <div className="absolute inset-0" style={{ background: 'linear-gradient(140deg,#1d3328 0%,#0e1712 60%,#22362c 100%)' }} />
      <motion.div className="absolute inset-y-[-20%] w-[40%] -skew-x-12" style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,.22),transparent)' }} animate={{ x: ['-120%', '320%'] }} transition={{ duration: 3.2, repeat: Infinity, ease: [0.76, 0, 0.24, 1], repeatDelay: 1 }} />
      <p className="relative text-[12px] font-semibold uppercase tracking-[.22em] text-[#e9e4da]/60">Детейлинг</p>
      <p className={`${SERIF} relative text-[40px] font-medium leading-[.95] text-[#e9e4da]`}>Глубина цвета.<br /><em style={{ color: BRASS2 }}>Без спешки.</em></p>
    </div>
  )
}

function Place() {
  return (
    <a href="#contact" className="flex h-full flex-col justify-between gap-6 p-8">
      <div className="flex items-start justify-between"><p className="text-[12px] font-semibold uppercase tracking-[.22em] opacity-60">Адрес</p><ArrowUpRight size={20} className="transition-transform duration-300 group-hover:rotate-45" /></div>
      <svg viewBox="0 0 300 100" className="w-full" fill="none">
        <path d="M0 70 Q80 64 140 40 T300 22" stroke="currentColor" strokeOpacity=".18" strokeWidth="10" strokeLinecap="round" />
        <path d="M60 0 L90 100 M210 0 L180 100" stroke="currentColor" strokeOpacity=".1" strokeWidth="6" />
        <circle cx="150" cy="38" r="7" fill={BRASS} /><circle cx="150" cy="38" r="7" stroke={BRASS} strokeWidth="2"><animate attributeName="r" values="7;22" dur="2s" repeatCount="indefinite" /><animate attributeName="opacity" values="1;0" dur="2s" repeatCount="indefinite" /></circle>
      </svg>
      <p className={`${SERIF} text-[34px] font-medium leading-none`}>Скрыганова, 6/1</p>
    </a>
  )
}

function Bento() {
  return (
    <Clip id="about" className="relative z-10 px-4 py-24 md:px-10 md:py-32" style={{ background: STONE, color: INK }}>
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-12 grid gap-6 md:mb-16 md:grid-cols-[1.2fr_1fr] md:items-end">
          <h2 className={`${SERIF} text-[clamp(48px,7vw,120px)] font-medium leading-[.86] tracking-[-.025em]`}><LineReveal>Один профиль.</LineReveal><LineReveal delay={.1} className="italic"><span style={{ color: BRASS }}>Полное внимание.</span></LineReveal></h2>
          <p className="max-w-[420px] text-[16px] leading-relaxed opacity-70 md:justify-self-end">Обслуживание, ремонт и уход за британскими автомобилями — в одном месте, с одной командой и одним подходом.</p>
        </div>
        <div className="grid auto-rows-[minmax(250px,auto)] gap-3 md:grid-cols-12 md:gap-4">
          <Glow className="md:col-span-7 md:row-span-2"><Families /></Glow>
          <Glow className="md:col-span-5"><Rating /></Glow>
          <Glow className="md:col-span-5" dark><Level /></Glow>
          <Glow className="md:col-span-4"><Scope /></Glow>
          <Glow className="md:col-span-4"><Gloss /></Glow>
          <Glow className="md:col-span-4"><Place /></Glow>
        </div>
      </div>
    </Clip>
  )
}

/* ---------------- value: maintenance plan (sticky split, transition #3) ---------------- */
function planFor(fam, km) {
  const L = [
    ['Масло и фильтры двигателя', 'замена'],
    ['Диагностика всех электронных блоков', 'проверка'],
    ['Тормоза: колодки, диски, шланги', 'проверка'],
  ]
  if (fam === 'Jaguar') L.push(['Подвеска: амортизаторы, сайлентблоки', 'проверка'])
  else if (fam === 'Defender') L.push(['Подвеска по комплектации: пневмо или пружины', 'проверка'])
  else L.push(['Пневмоподвеска: компрессор, баллоны, утечки', 'проверка'])
  if (km >= 30000) L.push(['Салонный и воздушный фильтры', 'замена'])
  if (km >= 45000) L.push(['Тормозная жидкость', 'по состоянию'])
  if (km >= 60000) L.push(['Свечи зажигания или топливный фильтр', 'по двигателю'])
  if (km >= 90000) L.push(['Масло АКПП' + (fam === 'Jaguar' ? '' : ' и раздаточной коробки'), 'по состоянию'])
  if (km >= 100000) L.push(['Охлаждающая жидкость, патрубки, помпа', 'проверка'])
  if (km >= 120000) L.push(['Привод ГРМ: цепь или ремень', 'проверка'])
  if (km >= 150000) L.push(['Ходовая: шаровые, тяги, сайлентблоки', 'проверка'])
  L.push(['Мойка и защита кузова', 'по желанию'])
  return L
}

function Plan({ bk }) {
  const [fam, setFam] = useState('Range Rover')
  const [km, setKm] = useState(60000)
  const list = planFor(fam, km)
  const pick = () => { bk.upd('svc', `План ТО: ${fam}, ${km.toLocaleString('ru-RU')} км`); document.getElementById('book')?.scrollIntoView({ behavior: 'smooth' }) }
  return (
    <section id="plan" className="relative px-6 py-24 text-[#e9e4da] md:px-12 md:py-36" style={{ background: GREEN }}>
      <div className="mx-auto grid max-w-[1400px] gap-12 md:grid-cols-[.9fr_1.1fr] md:gap-20">
        <div className="md:sticky md:top-28 md:self-start">
          <p className="mb-5 text-[12px] font-semibold uppercase tracking-[.22em]" style={{ color: BRASS2 }}>План обслуживания</p>
          <h2 className={`${SERIF} text-[clamp(48px,6.4vw,108px)] font-medium leading-[.86] tracking-[-.025em]`}><LineReveal>Что пора</LineReveal><LineReveal delay={.1} className="italic">сделать?</LineReveal></h2>
          <p className="mt-6 max-w-[400px] text-[16px] leading-relaxed text-[#e9e4da]/65">Выберите семейство и пробег — покажем, на что стоит обратить внимание. Точный регламент подберём по VIN и истории машины.</p>
        </div>
        <div>
          <div role="tablist" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {FAMS.map(f => <button key={f} role="tab" aria-selected={fam === f} onClick={() => setFam(f)} className={`relative h-14 rounded-2xl text-[14px] font-semibold transition-colors ${fam === f ? 'text-[#121a16]' : 'bg-white/[.04] text-[#e9e4da]/70 hover:bg-white/[.08]'}`}>
              {fam === f && <motion.span layoutId="famPill" className="absolute inset-0 rounded-2xl" style={{ background: BRASS2 }} transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
              <span className="relative">{f}</span>
            </button>)}
          </div>
          <div className="mt-10">
            <div className="flex items-end justify-between gap-4">
              <label htmlFor="km" className="text-[12px] font-semibold uppercase tracking-[.22em] text-[#e9e4da]/55">Пробег</label>
              <p className={`${SERIF} text-[clamp(44px,5vw,72px)] font-medium leading-none tabular-nums`}>{km.toLocaleString('ru-RU')} <span className="text-[.45em] opacity-60">км</span></p>
            </div>
            <input id="km" type="range" min={10000} max={250000} step={5000} value={km} onChange={e => setKm(+e.target.value)} className="mt-5 h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-[#c9a46a]" style={{ background: `linear-gradient(90deg, ${BRASS2} ${(km - 10000) / 2400}%, rgba(255,255,255,.1) 0)` }} />
            <div className="mt-2 flex justify-between text-[12px] text-[#e9e4da]/40"><span>10 000</span><span>250 000</span></div>
          </div>
          <ul className="mt-10 border-t border-white/10">
            <AnimatePresence initial={false}>
              {list.map(([t, tag]) => (
                <motion.li key={t} layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: .4, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden border-b border-white/10">
                  <div className="flex items-center justify-between gap-4 py-4">
                    <span className="flex items-center gap-3 text-[16px]"><Check size={16} style={{ color: BRASS2 }} className="shrink-0" />{t}</span>
                    <span className="shrink-0 rounded-full border border-white/15 px-3 py-1 text-[12px] text-[#e9e4da]/60">{tag}</span>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button onClick={pick} className="inline-flex h-14 items-center gap-3 rounded-full px-7 text-[15px] font-semibold text-[#121a16]" style={{ background: BRASS2 }}>Записаться с этим планом <ArrowRight size={17} /></button>
            <p className="text-[13px] text-[#e9e4da]/45">Ориентир, не прайс. Всё обсудим до начала работ.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- booking: 3 steps ---------------- */
const SVC = ['Плановое ТО', 'Двигатель', 'Пневмоподвеска', 'Электроника', 'Детейлинг', 'Другое']
const TIMES = ['Будни, утро', 'Будни, день', 'Будни, вечер', 'Выходные']
function Chip({ on, children, onClick }) {
  return <button type="button" onClick={onClick} aria-pressed={on} className={`rounded-full border px-4 py-2.5 text-[14px] font-medium transition-colors ${on ? 'border-[#121a16] bg-[#121a16] text-[#e9e4da]' : 'border-[#121a16]/15 hover:border-[#121a16]/50'}`}>{children}</button>
}

function Book({ bk }) {
  const [step, setStep] = useState(0)
  const [car, setCar] = useState('')
  const [time, setTime] = useState('')
  const [err, setErr] = useState('')
  const next = e => {
    e.preventDefault()
    if (step === 0 && !bk.s.svc) return setErr('Выберите, что нужно сделать')
    if (step === 1 && !car) return setErr('Выберите автомобиль')
    setErr('')
    if (step < 2) return setStep(step + 1)
    bk.submit()
  }
  const L = ['Работы', 'Машина', 'Контакты']
  const input = 'h-14 w-full rounded-2xl border border-[#121a16]/15 bg-white/60 px-5 text-[16px] outline-none transition-colors focus:border-[#121a16]'
  return (
    <Clip id="book" className="px-6 py-24 md:px-12 md:py-32" style={{ background: STONE, color: INK }}>
      <div className="mx-auto grid max-w-[1400px] gap-12 md:grid-cols-[.9fr_1.1fr] md:gap-20">
        <div>
          <p className="mb-5 text-[12px] font-semibold uppercase tracking-[.22em]" style={{ color: BRASS }}>Запись</p>
          <h2 className={`${SERIF} text-[clamp(48px,6.4vw,108px)] font-medium leading-[.86] tracking-[-.025em]`}><LineReveal>Приезжайте</LineReveal><LineReveal delay={.1} className="italic"><span style={{ color: BRASS }}>спокойно.</span></LineReveal></h2>
          <p className="mt-6 max-w-[380px] text-[16px] leading-relaxed opacity-70">Три коротких шага. Перезвоним, уточним детали и подберём время.</p>
          <a href={'tel:' + tel(b.phone)} className={`${SERIF} mt-8 inline-block text-[38px] font-medium`}>{b.phone}</a>
        </div>
        <div className="rounded-[32px] bg-[#f3efe8] p-6 shadow-[0_30px_80px_-40px_rgba(18,26,22,.35)] md:p-10">
          <AnimatePresence mode="wait">
            {!bk.s.sent ? (
              <motion.form key="f" onSubmit={next} noValidate exit={{ opacity: 0, y: -10 }}>
                <div className="mb-8 grid grid-cols-3 gap-2">
                  {L.map((l, i) => <button type="button" key={l} onClick={() => i < step && setStep(i)} className="text-left">
                    <span className="block h-[3px] overflow-hidden rounded-full bg-[#121a16]/10"><motion.span className="block h-full" style={{ background: INK }} animate={{ width: i <= step ? '100%' : '0%' }} transition={{ duration: .5 }} /></span>
                    <span className={`mt-2 block text-[12px] font-semibold uppercase tracking-[.16em] ${i === step ? '' : 'opacity-40'}`}>0{i + 1} · {l}</span>
                  </button>)}
                </div>
                <AnimatePresence mode="wait">
                  <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: .35 }} className="min-h-[230px]">
                    {step === 0 && <div>
                      <p className={`${SERIF} mb-5 text-[32px] font-medium leading-none`}>Что нужно сделать?</p>
                      {bk.s.svc && !SVC.includes(bk.s.svc) && <p className="mb-4 rounded-2xl border border-[#a9824a]/40 bg-[#a9824a]/10 px-4 py-3 text-[14px]">{bk.s.svc}</p>}
                      <div className="flex flex-wrap gap-2">{SVC.map(s => <Chip key={s} on={bk.s.svc === s} onClick={() => bk.upd('svc', s)}>{s}</Chip>)}</div>
                    </div>}
                    {step === 1 && <div>
                      <p className={`${SERIF} mb-5 text-[32px] font-medium leading-none`}>Какой автомобиль?</p>
                      <div className="flex flex-wrap gap-2">{FAMS.map(s => <Chip key={s} on={car === s} onClick={() => setCar(s)}>{s}</Chip>)}</div>
                      <p className="mb-3 mt-7 text-[12px] font-semibold uppercase tracking-[.16em] opacity-50">Удобное время</p>
                      <div className="flex flex-wrap gap-2">{TIMES.map(s => <Chip key={s} on={time === s} onClick={() => setTime(s)}>{s}</Chip>)}</div>
                    </div>}
                    {step === 2 && <div className="grid gap-3">
                      <p className={`${SERIF} mb-2 text-[32px] font-medium leading-none`}>Как с вами связаться?</p>
                      <input className={input} placeholder="Имя" value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} autoComplete="name" autoFocus />
                      <motion.input animate={bk.s.err ? { x: [0, -8, 8, -5, 5, 0] } : {}} className={input + (bk.s.err ? ' !border-red-500' : '')} type="tel" inputMode="tel" placeholder="+375 __ ___-__-__" value={bk.s.phone} onFocus={phoneFocus(bk)} onChange={e => bk.upd('phone', e.target.value)} autoComplete="tel" aria-invalid={bk.s.err} />
                      {bk.s.err && <p className="text-[13px] text-red-600">Проверьте номер телефона</p>}
                      <p className="mt-1 text-[13px] opacity-55">{[bk.s.svc, car, time].filter(Boolean).join(' · ')}</p>
                    </div>}
                  </motion.div>
                </AnimatePresence>
                {err && <p className="mt-2 text-[13px] text-red-600">{err}</p>}
                <div className="mt-6 flex items-center gap-3">
                  {step > 0 && <button type="button" onClick={() => setStep(step - 1)} aria-label="Назад" className="grid h-14 w-14 place-items-center rounded-full border border-[#121a16]/15"><ChevronLeft size={20} /></button>}
                  <button disabled={bk.s.loading} className="inline-flex h-14 flex-1 items-center justify-center gap-3 rounded-full text-[15px] font-semibold text-[#e9e4da] disabled:opacity-60" style={{ background: INK }}>{bk.s.loading ? 'Отправляем…' : step < 2 ? 'Далее' : 'Отправить заявку'} <ArrowRight size={17} /></button>
                </div>
              </motion.form>
            ) : (
              <motion.div key="ok" initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} className="grid min-h-[340px] place-items-center text-center">
                <div><CheckDraw className="mx-auto mb-5" size={72} /><h3 className={`${SERIF} text-[44px] font-medium leading-none`}>Заявка принята.</h3><p className="mx-auto mb-6 mt-4 max-w-[340px] opacity-65">В готовом сайте заявка сразу придёт вам в Telegram.</p><button onClick={() => { bk.reset(); setStep(0); setCar(''); setTime('') }} className="underline underline-offset-4">Новая заявка</button></div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Clip>
  )
}

function Contact() {
  return (
    <section id="contact" className="px-6 py-24 text-[#e9e4da] md:px-12 md:py-32" style={{ background: NIGHT }}>
      <div className="mx-auto grid max-w-[1400px] gap-10 md:grid-cols-[.9fr_1.1fr]">
        <Reveal className="grid content-start gap-7">
          <h2 className={`${SERIF} text-[clamp(48px,6.4vw,108px)] font-medium leading-[.86] tracking-[-.025em]`}>Скрыганова, <em style={{ color: BRASS2 }}>6/1</em></h2>
          <p className="flex items-start gap-3 text-[17px] text-[#e9e4da]/70"><MapPin className="mt-0.5 shrink-0" size={20} style={{ color: BRASS2 }} />{b.addr}</p>
          <div className="grid gap-2">
            <a href={'tel:' + tel(b.phone)} className={`${SERIF} text-[40px] font-medium leading-none`}>{b.phone}</a>
            <p className="text-[14px] text-[#e9e4da]/50">Viber / WhatsApp: <a href={'tel:' + tel(b.msg)} className="text-[#e9e4da]/80">{b.msg}</a></p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={'tel:' + tel(b.phone)} className="inline-flex h-12 items-center gap-2 rounded-full px-5 text-[14px] font-semibold text-[#121a16]" style={{ background: BRASS2 }}><Phone size={16} />Позвонить</a>
            <a href={viber} className="inline-flex h-12 items-center gap-2 rounded-full border border-white/15 px-5 text-[14px] font-semibold">Viber</a>
            <a href={wa} target="_blank" rel="noopener" className="inline-flex h-12 items-center gap-2 rounded-full border border-white/15 px-5 text-[14px] font-semibold"><WA />WhatsApp</a>
            <a href={b.ig} target="_blank" rel="noopener" className="inline-flex h-12 items-center gap-2 rounded-full border border-white/15 px-5 text-[14px] font-semibold"><IG />Instagram</a>
          </div>
        </Reveal>
        <Reveal delay={.1} className="h-[380px] overflow-hidden rounded-[28px] ring-1 ring-white/10 md:h-[460px]"><MapFrame oid={b.oid} dark /></Reveal>
      </div>
    </section>
  )
}

function App() {
  useSmooth()
  const lite = useLite()
  const bk = useBooking()
  return (
    <MotionConfig reducedMotion="user">
      <div className="font-['Manrope',sans-serif]" style={{ background: STONE, color: INK, '--sel': BRASS2, '--selc': INK }}>
        <Ribbon name={b.name} bg={INK} fg={STONE} />
        <header className="sticky top-0 z-40 border-b border-[#121a16]/10 bg-[#e9e4da]/75 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6 md:px-12">
            <a href="#film" className={`${SERIF} text-[26px] font-semibold leading-none tracking-[-.01em]`}>ЛР <em className="font-medium" style={{ color: BRASS }}>Премиум</em></a>
            <nav className="hidden gap-8 text-[14px] font-medium md:flex">{[['#film', 'Сервис'], ['#about', 'О нас'], ['#plan', 'План ТО'], ['#book', 'Запись'], ['#contact', 'Контакты']].map(([h, t]) => <a key={h} href={h} className="opacity-70 transition-opacity hover:opacity-100">{t}</a>)}</nav>
            <a href={'tel:' + tel(b.phone)} className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-[14px] font-semibold text-[#e9e4da]" style={{ background: INK }}><Phone size={15} /><span className="hidden sm:inline">{b.phone}</span></a>
          </div>
        </header>
        <main>
          <Film lite={lite} />
          <Bento />
          <Plan bk={bk} />
          <Book bk={bk} />
          <Contact />
        </main>
        <footer className="px-6 pb-10 text-[13px] text-[#e9e4da]/45 md:px-12" style={{ background: NIGHT }}>
          <div className="mx-auto flex max-w-[1400px] flex-wrap justify-between gap-4 border-t border-white/10 pt-8"><span>© 2026 {b.name} · Концепт сайта — Артём</span><span>Land Rover, Range Rover, Discovery, Defender, Jaguar — товарные знаки их владельцев</span></div>
        </footer>
        <CallBar phone={b.phone} barCls="bg-[#e9e4da]/90 backdrop-blur-xl border-t border-[#121a16]/10" callCls="rounded-full border border-[#121a16]/20 text-[#121a16]" bookCls="rounded-full text-[#e9e4da] bg-[#121a16]" />
        <div className="h-[72px] sm:hidden" style={{ background: NIGHT }} />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
