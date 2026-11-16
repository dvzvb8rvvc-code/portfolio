import React, { useRef, useState, useEffect, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, useSpring, useMotionValueEvent, useMotionTemplate, useInView, AnimatePresence, MotionConfig } from 'framer-motion'
import { ArrowRight, ArrowUpRight, Phone, MapPin, ChevronLeft } from 'lucide-react'
import '../lib/base.css'
import { LineReveal, useSmooth, Ribbon, Reveal, useBooking, phoneFocus, CheckDraw, MapFrame, CallBar, tel, useLite, IG, TG } from '../lib/kit'

const Molecule3D = lazy(() => import('./dopamine3d'))

const b = {
  name: 'Dopamine studio',
  addr: 'ул. Притыцкого, 2, корп. 2, этаж 1, Минск',
  short: 'Притыцкого, 2/2',
  phone: '+375 29 604-93-94',
  ig: 'https://instagram.com/dopamine_st',
  tg: 'https://t.me/+375296049394',
  rating: '5.0', rev: 240, oid: '81422310503',
}
const CREAM = '#f6efea', BLUSH = '#f3e3e0', LILAC = '#ece6f3', SAND = '#f4ebe1', PLUM = '#2a2230', ROSE = '#c27384', SOFT = '#e7b8c2'
const DISP = "font-['Unbounded',sans-serif]"

const CH = [
  { k: 'Шугаринг', t: 'Гладко. Надолго.', d: 'Шугаринг и депиляция — бережно, без спешки, с вниманием к коже.' },
  { k: 'Лазер', t: 'Лёгкость вместо привычки.', d: 'Лазерная эпиляция курсом — с правильными интервалами между сеансами.' },
  { k: 'Массаж', t: 'Отпустить напряжение.', d: 'Массаж, после которого хочется просто помолчать.' },
  { k: 'Уход', t: 'Кожа, которая светится.', d: 'Косметология и уходовые процедуры — подберём под вашу кожу.' },
]

/* ---------------- pinned film ---------------- */
function LiteBlob({ idx }) {
  const R = ['50% 50% 50% 50%', '60% 40% 55% 45% / 45% 55% 45% 55%', '70% 30% 70% 30% / 40% 60% 40% 60%', '50%', '40% 60% 60% 40% / 60% 40% 60% 40%']
  return (
    <div className="absolute left-1/2 top-[30%] -translate-x-1/2 -translate-y-1/2 md:left-[66%] md:top-1/2">
      <motion.div animate={{ borderRadius: R[idx], rotate: idx * 40 }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }} className="h-[52vmin] w-[52vmin]" style={{ background: 'radial-gradient(60% 60% at 35% 30%, #fff, #f4dbe3 45%, #d9cdef 100%)', boxShadow: '0 40px 80px -30px rgba(194,115,132,.4), inset -20px -30px 60px rgba(201,189,240,.6)' }} />
    </div>
  )
}

function Film({ lite }) {
  const ref = useRef(null)
  const near = useInView(ref, { margin: '300px 0px 300px 0px' })
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const p = useSpring(scrollYProgress, { stiffness: 70, damping: 22, mass: .5 })
  const [idx, setIdx] = useState(0)
  useMotionValueEvent(p, 'change', v => setIdx(Math.min(4, Math.max(0, Math.round(v * 4.6 - .15)))))
  const bg = useTransform(p, [0, .12, .2, .36, .42, .57, .63, .79, .85, 1], [CREAM, CREAM, BLUSH, BLUSH, LILAC, LILAC, BLUSH, BLUSH, SAND, SAND])
  const heroO = useTransform(scrollYProgress, [0, .08], [1, 0])
  const heroY = useTransform(scrollYProgress, [0, .1], [0, -50])
  const blur = useTransform(scrollYProgress, [0, .08], [0, 12])
  const filter = useMotionTemplate`blur(${blur}px)`
  return (
    <motion.section ref={ref} id="film" className="relative h-[560vh]" style={{ background: bg, color: PLUM }}>
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* soft aura */}
        <motion.div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[34%] h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70 blur-[80px] md:left-[66%] md:top-1/2" style={{ background: 'radial-gradient(circle, #f7cdd8 0%, #e3d8f6 55%, transparent 70%)' }} animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }} />
        <div className="pointer-events-none absolute inset-0">
          {lite ? <LiteBlob idx={idx} /> : near && <Suspense fallback={null}><Molecule3D p={p} active={near} /></Suspense>}
        </div>

        <motion.div style={{ opacity: heroO, y: heroY, filter }} className={`absolute inset-x-0 bottom-0 px-6 pb-28 md:bottom-auto md:top-[18vh] md:px-14 md:pb-0 ${idx > 0 ? 'pointer-events-none' : ''}`}>
          <div className="mx-auto max-w-[1400px]">
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .4 }} className="mb-6 text-[13px] font-medium tracking-[.04em] opacity-60">шугаринг · косметология · массаж</motion.p>
            <h1 className={`${DISP} text-[clamp(44px,7.4vw,128px)] font-light leading-[.95] tracking-[-.04em]`}>
              <LineReveal delay={.15}>Немного</LineReveal>
              <LineReveal delay={.3}><span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(95deg, ${ROSE}, #a58bd0 70%, ${ROSE})` }}>дофамина.</span></LineReveal>
            </h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .8 }} className="mt-7 max-w-[400px] text-[16px] leading-relaxed opacity-70 md:text-[17px]">Студия ухода на Притыцкого. Мягко, спокойно и с ощущением, что вы себя наградили.</motion.p>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .95 }} className="mt-8 flex flex-wrap gap-3">
              <a href="#book" className="inline-flex h-[54px] items-center gap-3 rounded-full px-7 text-[15px] font-semibold text-white" style={{ background: PLUM }}>Записаться <ArrowRight size={17} /></a>
              <a href="#course" className="inline-flex h-[54px] items-center rounded-full bg-white/60 px-6 text-[15px] font-semibold backdrop-blur">Собрать курс</a>
            </motion.div>
          </div>
        </motion.div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 px-6 pb-24 md:inset-y-0 md:flex md:items-center md:px-14 md:pb-0">
          <div className="mx-auto w-full max-w-[1400px]">
            <AnimatePresence mode="wait">
              {idx > 0 && (
                <motion.div key={idx} initial={{ opacity: 0, filter: 'blur(14px)', y: 14 }} animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }} exit={{ opacity: 0, filter: 'blur(14px)' }} transition={{ duration: .8, ease: [0.16, 1, 0.3, 1] }} className="max-w-[460px]">
                  <p className="mb-5 text-[13px] font-semibold" style={{ color: ROSE }}>{CH[idx - 1].k}</p>
                  <h2 className={`${DISP} text-[clamp(32px,4.2vw,64px)] font-light leading-[1.02] tracking-[-.035em]`}>{CH[idx - 1].t}</h2>
                  <p className="mt-5 text-[15px] leading-relaxed opacity-70 md:text-[17px]">{CH[idx - 1].d}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="absolute right-6 top-6 flex flex-col items-end gap-2 md:bottom-12 md:right-14 md:top-auto">
          {CH.map((c, i) => <span key={c.k} className="flex items-center gap-3 text-[12px] font-medium transition-opacity duration-700" style={{ opacity: idx === i + 1 ? 1 : .3 }}><span className="hidden md:inline">{c.k}</span><span className="block h-2 w-2 rounded-full transition-transform duration-700" style={{ background: ROSE, transform: `scale(${idx === i + 1 ? 1.6 : 1})` }} /></span>)}
        </div>
      </div>
    </motion.section>
  )
}

/* ---------------- soft radial mask reveal (transition #2) ---------------- */
function Bloom({ children, id, className = '', style }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 20%'] })
  const r = useTransform(scrollYProgress, [0, 1], [20, 150])
  const m = useMotionTemplate`radial-gradient(ellipse ${r}% ${r}% at 50% 0%, #000 60%, transparent 100%)`
  return <motion.section ref={ref} id={id} style={{ WebkitMaskImage: m, maskImage: m, ...style }} className={className}>{children}</motion.section>
}

/* ---------------- bento ---------------- */
function Soft({ children, className = '', tone = '#fff' }) {
  const ref = useRef(null)
  const mv = e => { const r = ref.current.getBoundingClientRect(); ref.current.style.setProperty('--x', e.clientX - r.left + 'px'); ref.current.style.setProperty('--y', e.clientY - r.top + 'px') }
  return (
    <Reveal className={className}>
      <div ref={ref} onPointerMove={mv} className="group relative h-full rounded-[34px] p-px" style={{ background: `radial-gradient(380px circle at var(--x,50%) var(--y,-40%), ${SOFT}, rgba(42,34,48,.06) 60%)` }}>
        <div className="relative h-full overflow-hidden rounded-[33px]" style={{ background: tone }}>{children}</div>
      </div>
    </Reveal>
  )
}

function Breath() {
  const [inhale, setIn] = useState(true)
  const ref = useRef(null); const v = useInView(ref)
  useEffect(() => { if (!v) return; const t = setInterval(() => setIn(x => !x), 4000); return () => clearInterval(t) }, [v])
  return (
    <div ref={ref} className="relative flex h-full min-h-[300px] flex-col justify-between p-8">
      <p className="text-[13px] font-semibold opacity-55">Массаж</p>
      <div className="grid place-items-center">
        <motion.div animate={{ scale: inhale ? 1.35 : .8 }} transition={{ duration: 4, ease: 'easeInOut' }} className="grid h-28 w-28 place-items-center rounded-full" style={{ background: 'radial-gradient(circle at 35% 30%, #fff, #e7dcf6 60%, #d4c4ef)' }}>
          <AnimatePresence mode="wait"><motion.span key={inhale ? 'i' : 'o'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[12px] font-semibold">{inhale ? 'вдох' : 'выдох'}</motion.span></AnimatePresence>
        </motion.div>
      </div>
      <p className="text-[15px] leading-relaxed opacity-65">Подышите вместе с кругом. Примерно так ощущается час массажа.</p>
    </div>
  )
}

function Rating() {
  return (
    <div className="relative flex h-full flex-col justify-between overflow-hidden p-8 md:p-10">
      <motion.div aria-hidden="true" className="absolute -right-24 -top-24 h-80 w-80 rounded-full blur-3xl" style={{ background: 'radial-gradient(circle,#f5c7d3,#ddd0f5 60%,transparent 70%)' }} animate={{ x: [0, -30, 0], y: [0, 30, 0] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} />
      <p className="relative text-[13px] font-semibold opacity-55">Яндекс Карты</p>
      <div className="relative">
        <p className={`${DISP} text-[clamp(96px,12vw,180px)] font-light leading-[.85] tracking-[-.06em]`}>{b.rating}</p>
        <p className="mt-4 max-w-[340px] text-[16px] leading-relaxed opacity-70">Средняя оценка из {b.rev} оценок гостей студии.</p>
      </div>
    </div>
  )
}

function Morph() {
  return (
    <div className="flex h-full min-h-[300px] flex-col justify-between p-8">
      <p className="text-[13px] font-semibold opacity-55">Шугаринг</p>
      <div className="grid place-items-center">
        <motion.div className="h-28 w-36" style={{ background: 'linear-gradient(135deg,#f7d9c8,#f3c3cf)' }} animate={{ borderRadius: ['42% 58% 63% 37% / 46% 41% 59% 54%', '60% 40% 38% 62% / 55% 60% 40% 45%', '42% 58% 63% 37% / 46% 41% 59% 54%'] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />
      </div>
      <p className="text-[15px] leading-relaxed opacity-65">Тёплая паста, мягкие движения, гладкая кожа.</p>
    </div>
  )
}

function Glow() {
  return (
    <div className="relative flex h-full min-h-[260px] flex-col justify-between overflow-hidden p-8">
      <motion.div aria-hidden="true" className="absolute inset-0" style={{ background: 'conic-gradient(from 0deg at 50% 60%, #f9e0e6, #efe5fa, #fbeadf, #f9e0e6)' }} animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }} />
      <div className="absolute inset-[1px] rounded-[32px] bg-white/40 backdrop-blur-xl" />
      <p className="relative text-[13px] font-semibold opacity-55">Косметология</p>
      <p className={`${DISP} relative text-[30px] font-light leading-[1.05] tracking-[-.03em]`}>Сияние —<br />это просто уход.</p>
    </div>
  )
}

function Place() {
  return (
    <a href="#contact" className="flex h-full min-h-[240px] flex-col justify-between p-8">
      <div className="flex justify-between"><p className="text-[13px] font-semibold opacity-55">Где мы</p><ArrowUpRight size={20} className="transition-transform duration-300 group-hover:rotate-45" /></div>
      <p className={`${DISP} text-[28px] font-light leading-[1.05] tracking-[-.03em]`}>{b.short}<span className="mt-2 block text-[15px] font-['Manrope',sans-serif] font-medium opacity-60">первый этаж</span></p>
    </a>
  )
}

function Quote() {
  return (
    <div className="flex h-full min-h-[240px] items-end p-8 md:p-10" style={{ color: '#f6efea' }}>
      <p className={`${DISP} text-[clamp(26px,2.6vw,40px)] font-light leading-[1.1] tracking-[-.03em]`}>Ваше время здесь —<br /><span style={{ color: SOFT }}>только ваше.</span></p>
    </div>
  )
}

function Bento() {
  return (
    <Bloom id="about" className="relative px-4 py-24 md:px-14 md:py-36" style={{ background: CREAM, color: PLUM }}>
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-14 grid gap-6 md:grid-cols-[1.2fr_1fr] md:items-end">
          <h2 className={`${DISP} text-[clamp(38px,5.6vw,92px)] font-light leading-[1] tracking-[-.045em]`}><LineReveal>Маленькая</LineReveal><LineReveal delay={.12}><span style={{ color: ROSE }}>награда</span> для себя.</LineReveal></h2>
          <p className="max-w-[400px] text-[16px] leading-relaxed opacity-65 md:justify-self-end">Три направления — одно ощущение: вы выходите спокойнее и легче, чем пришли.</p>
        </div>
        <div className="grid auto-rows-[minmax(240px,auto)] gap-3 md:grid-cols-12 md:gap-4">
          <Soft className="md:col-span-7 md:row-span-2" tone="#fbf6f3"><Rating /></Soft>
          <Soft className="md:col-span-5" tone="#f7ecee"><Morph /></Soft>
          <Soft className="md:col-span-5" tone="#f2edf8"><Breath /></Soft>
          <Soft className="md:col-span-4" tone="#fff"><Glow /></Soft>
          <Soft className="md:col-span-3" tone="#fbf3ea"><Place /></Soft>
          <Soft className="md:col-span-5" tone={PLUM}><Quote /></Soft>
        </div>
      </div>
    </Bloom>
  )
}

/* ---------------- value: course planner (sticky split, transition #3) ---------------- */
const PROC = {
  'Шугаринг': { zones: ['Ноги', 'Руки', 'Подмышки', 'Бикини', 'Лицо'], weeks: [0, 4, 8, 12, 16], span: 18, note: 'Повтор примерно раз в 3–5 недель — по скорости роста волос.' },
  'Лазер': { zones: ['Ноги', 'Руки', 'Подмышки', 'Бикини', 'Лицо', 'Спина'], weeks: [0, 5, 10, 16, 22, 29], span: 31, note: 'Курс из нескольких сеансов, интервалы между ними постепенно растут.' },
  'Массаж': { zones: ['Спина', 'Шея и плечи', 'Ноги', 'Всё тело'], weeks: [0, .5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5], span: 5.5, note: 'Курс — около десяти сеансов, по два в неделю.' },
  'Уход': { zones: ['Лицо', 'Шея и декольте', 'Руки'], weeks: [0, 3, 6, 9, 12], span: 14, note: 'Процедуры раз в 3–4 недели — коже нужно время на восстановление.' },
}

function Timeline({ proc, zones }) {
  const P = PROC[proc]
  const [hover, setHover] = useState(-1)
  const label = w => w === 0 ? 'Первый визит' : Number.isInteger(w) ? `Неделя ${w}` : `Неделя ${Math.floor(w)}½`
  return (
    <div className="relative rounded-[30px] bg-white/70 p-6 shadow-[0_30px_80px_-50px_rgba(42,34,48,.4)] backdrop-blur md:p-9">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className={`${DISP} text-[22px] font-light tracking-[-.03em]`}>{P.weeks.length} визитов</p>
        <p className="text-[13px] opacity-55">≈ {Math.ceil(P.span)} недель · без спешки</p>
      </div>
      <div className="relative mt-12 h-24">
        <div className="absolute inset-x-0 top-[11px] h-[2px] rounded-full bg-[#2a2230]/10" />
        <motion.div key={proc} className="absolute left-0 top-[11px] h-[2px] origin-left rounded-full" style={{ background: `linear-gradient(90deg, ${ROSE}, #a58bd0)`, width: `${P.weeks[P.weeks.length - 1] / P.span * 100}%` }} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }} />
        {P.weeks.map((w, i) => (
          <motion.button type="button" key={proc + i} onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(-1)} onFocus={() => setHover(i)} onBlur={() => setHover(-1)} aria-label={label(w)}
            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: .15 + i * .09, type: 'spring', stiffness: 300, damping: 20 }}
            className="absolute top-0 -translate-x-1/2" style={{ left: `${w / P.span * 100}%` }}>
            <span className="block h-6 w-6 rounded-full border-[3px] border-white shadow-[0_6px_16px_-4px_rgba(194,115,132,.6)]" style={{ background: i === 0 ? PLUM : `linear-gradient(135deg, ${SOFT}, #cdbdf0)` }} />
            {(i === 0 || hover === i) && <span className="absolute left-1/2 top-9 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#2a2230] px-3 py-1.5 text-[12px] font-semibold text-white">{label(w)}</span>}
          </motion.button>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[12px] opacity-45"><span>сегодня</span><span>через {Math.ceil(P.span)} нед.</span></div>
      <div className="mt-7 flex flex-wrap gap-2">{(zones.length ? zones : ['зона не выбрана']).map(z => <span key={z} className="rounded-full bg-[#f3e3e0] px-3 py-1.5 text-[13px]">{z}</span>)}</div>
      <p className="mt-5 text-[14px] leading-relaxed opacity-60">{P.note} Это ориентир — точный план составим на первом визите.</p>
    </div>
  )
}

function Course({ bk }) {
  const [proc, setProc] = useState('Шугаринг')
  const [zones, setZones] = useState(['Ноги'])
  const pickProc = k => { setProc(k); setZones([PROC[k].zones[0]]) }
  const tog = z => setZones(s => s.includes(z) ? s.filter(x => x !== z) : [...s, z])
  const go = () => { bk.upd('svc', `${proc}${zones.length ? ': ' + zones.join(', ').toLowerCase() : ''} — первый визит`); document.getElementById('book')?.scrollIntoView({ behavior: 'smooth' }) }
  return (
    <section id="course" className="px-4 py-24 md:px-14 md:py-36" style={{ background: LILAC, color: PLUM }}>
      <div className="mx-auto grid max-w-[1400px] gap-12 md:grid-cols-[.85fr_1.15fr] md:gap-16">
        <div className="md:sticky md:top-28 md:self-start">
          <p className="mb-5 text-[13px] font-semibold" style={{ color: ROSE }}>Курс без спешки</p>
          <h2 className={`${DISP} text-[clamp(38px,5vw,84px)] font-light leading-[1] tracking-[-.045em]`}><LineReveal>Соберите</LineReveal><LineReveal delay={.12}>свой курс.</LineReveal></h2>
          <p className="mt-6 max-w-[400px] text-[16px] leading-relaxed opacity-65">Выберите процедуру и зоны — покажем, как может выглядеть курс во времени. Без давления и лишних визитов.</p>
        </div>
        <div>
          <div role="tablist" className="grid grid-cols-2 gap-2 rounded-[26px] bg-white/50 p-1.5 sm:grid-cols-4">
            {Object.keys(PROC).map(k => <button key={k} role="tab" aria-selected={proc === k} onClick={() => pickProc(k)} className="relative h-12 rounded-[20px] text-[14px] font-semibold">
              {proc === k && <motion.span layoutId="procPill" className="absolute inset-0 rounded-[20px] bg-white shadow-[0_8px_20px_-10px_rgba(42,34,48,.35)]" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
              <span className={`relative ${proc === k ? '' : 'opacity-55'}`}>{k}</span>
            </button>)}
          </div>
          <p className="mb-3 mt-8 text-[13px] font-semibold opacity-55">Зоны</p>
          <div className="mb-8 flex flex-wrap gap-2">
            {PROC[proc].zones.map(z => <button key={z} onClick={() => tog(z)} aria-pressed={zones.includes(z)} className={`rounded-full border px-4 py-2.5 text-[14px] font-medium transition-colors ${zones.includes(z) ? 'border-transparent text-white' : 'border-[#2a2230]/15 bg-white/40 hover:border-[#2a2230]/40'}`} style={zones.includes(z) ? { background: ROSE } : undefined}>{z}</button>)}
          </div>
          <Timeline proc={proc} zones={zones} />
          <button onClick={go} className="mt-8 inline-flex h-14 items-center gap-3 rounded-full px-7 text-[15px] font-semibold text-white" style={{ background: PLUM }}>Записаться на первый визит <ArrowRight size={17} /></button>
        </div>
      </div>
    </section>
  )
}

/* ---------------- booking: 3 steps ---------------- */
const SVC = ['Шугаринг', 'Лазерная эпиляция', 'Массаж', 'Косметология', 'Подскажите мне']
const DAY = ['Утро', 'День', 'Вечер']
const WK = ['Будни', 'Выходные', 'Любой день']
function Chip({ on, children, onClick }) {
  return <button type="button" onClick={onClick} aria-pressed={on} className={`rounded-full border px-4 py-2.5 text-[14px] font-medium transition-colors ${on ? 'border-transparent bg-[#2a2230] text-white' : 'border-[#2a2230]/15 hover:border-[#2a2230]/40'}`}>{children}</button>
}
function Book({ bk }) {
  const [step, setStep] = useState(0)
  const [day, setDay] = useState('')
  const [wk, setWk] = useState('')
  const [err, setErr] = useState('')
  const next = e => {
    e.preventDefault()
    if (step === 0 && !bk.s.svc) return setErr('Выберите процедуру')
    if (step === 1 && (!day || !wk)) return setErr('Выберите удобное время')
    setErr('')
    if (step < 2) return setStep(step + 1)
    bk.submit()
  }
  const input = 'h-14 w-full rounded-[18px] border border-[#2a2230]/12 bg-white px-5 text-[16px] outline-none transition-colors focus:border-[#c27384]'
  return (
    <Bloom id="book" className="px-4 py-24 md:px-14 md:py-36" style={{ background: BLUSH, color: PLUM }}>
      <div className="mx-auto grid max-w-[1400px] gap-12 md:grid-cols-[.85fr_1.15fr] md:gap-16">
        <div>
          <p className="mb-5 text-[13px] font-semibold" style={{ color: ROSE }}>Запись</p>
          <h2 className={`${DISP} text-[clamp(38px,5vw,84px)] font-light leading-[1] tracking-[-.045em]`}><LineReveal>Первый визит —</LineReveal><LineReveal delay={.12}><span style={{ color: ROSE }}>в три касания.</span></LineReveal></h2>
          <p className="mt-6 max-w-[380px] text-[16px] leading-relaxed opacity-65">Оставьте пожелания — администратор напишет или перезвонит и подберёт время.</p>
          <a href={'tel:' + tel(b.phone)} className={`${DISP} mt-8 inline-block text-[26px] font-light`}>{b.phone}</a>
        </div>
        <div className="rounded-[34px] bg-white/75 p-6 backdrop-blur md:p-10">
          <AnimatePresence mode="wait">
            {!bk.s.sent ? (
              <motion.form key="f" onSubmit={next} noValidate exit={{ opacity: 0, filter: 'blur(10px)' }}>
                <div className="mb-8 flex items-center gap-2" aria-label={`Шаг ${step + 1} из 3`}>
                  {[0, 1, 2].map(i => <motion.span key={i} className="h-2 rounded-full" animate={{ width: i === step ? 40 : 8, background: i <= step ? ROSE : 'rgba(42,34,48,.15)' }} transition={{ type: 'spring', stiffness: 300, damping: 26 }} />)}
                  <span className="ml-2 text-[13px] opacity-50">шаг {step + 1} из 3</span>
                </div>
                <AnimatePresence mode="wait">
                  <motion.div key={step} initial={{ opacity: 0, filter: 'blur(8px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} exit={{ opacity: 0, filter: 'blur(8px)' }} transition={{ duration: .35 }} className="min-h-[220px]">
                    {step === 0 && <div>
                      <p className={`${DISP} mb-5 text-[24px] font-light tracking-[-.03em]`}>Что хочется?</p>
                      {bk.s.svc && !SVC.includes(bk.s.svc) && <p className="mb-4 rounded-[18px] bg-[#f3e3e0] px-4 py-3 text-[14px]">{bk.s.svc}</p>}
                      <div className="flex flex-wrap gap-2">{SVC.map(s => <Chip key={s} on={bk.s.svc === s} onClick={() => bk.upd('svc', s)}>{s}</Chip>)}</div>
                    </div>}
                    {step === 1 && <div>
                      <p className={`${DISP} mb-5 text-[24px] font-light tracking-[-.03em]`}>Когда удобно?</p>
                      <div className="flex flex-wrap gap-2">{WK.map(s => <Chip key={s} on={wk === s} onClick={() => setWk(s)}>{s}</Chip>)}</div>
                      <div className="mt-3 flex flex-wrap gap-2">{DAY.map(s => <Chip key={s} on={day === s} onClick={() => setDay(s)}>{s}</Chip>)}</div>
                    </div>}
                    {step === 2 && <div className="grid gap-3">
                      <p className={`${DISP} mb-2 text-[24px] font-light tracking-[-.03em]`}>Как к вам обращаться?</p>
                      <input className={input} placeholder="Имя" value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} autoComplete="name" autoFocus />
                      <motion.input animate={bk.s.err ? { x: [0, -8, 8, -5, 5, 0] } : {}} className={input + (bk.s.err ? ' !border-red-400' : '')} type="tel" inputMode="tel" placeholder="+375 __ ___-__-__" value={bk.s.phone} onFocus={phoneFocus(bk)} onChange={e => bk.upd('phone', e.target.value)} autoComplete="tel" aria-invalid={bk.s.err} />
                      {bk.s.err && <p className="text-[13px] text-red-500">Проверьте номер телефона</p>}
                      <p className="mt-1 text-[13px] opacity-50">{[bk.s.svc, wk, day].filter(Boolean).join(' · ')}</p>
                    </div>}
                  </motion.div>
                </AnimatePresence>
                {err && <p className="mt-2 text-[13px] text-red-500">{err}</p>}
                <div className="mt-6 flex gap-3">
                  {step > 0 && <button type="button" onClick={() => setStep(step - 1)} aria-label="Назад" className="grid h-14 w-14 place-items-center rounded-full border border-[#2a2230]/15"><ChevronLeft size={20} /></button>}
                  <button disabled={bk.s.loading} className="inline-flex h-14 flex-1 items-center justify-center gap-3 rounded-full text-[15px] font-semibold text-white disabled:opacity-60" style={{ background: PLUM }}>{bk.s.loading ? 'Отправляем…' : step < 2 ? 'Дальше' : 'Записаться'} <ArrowRight size={17} /></button>
                </div>
              </motion.form>
            ) : (
              <motion.div key="ok" initial={{ opacity: 0, filter: 'blur(12px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} className="grid min-h-[320px] place-items-center text-center">
                <div><CheckDraw className="mx-auto mb-5 text-[#c27384]" size={72} /><h3 className={`${DISP} text-[30px] font-light tracking-[-.03em]`}>Ждём вас.</h3><p className="mx-auto mb-6 mt-3 max-w-[340px] opacity-65">В готовом сайте заявка сразу придёт вам в Telegram.</p><button onClick={() => { bk.reset(); setStep(0); setDay(''); setWk('') }} className="underline underline-offset-4">Новая заявка</button></div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Bloom>
  )
}

function Contact() {
  return (
    <section id="contact" className="px-4 py-24 md:px-14 md:py-32" style={{ background: CREAM, color: PLUM }}>
      <div className="mx-auto grid max-w-[1400px] gap-10 md:grid-cols-[.85fr_1.15fr]">
        <Reveal className="grid content-start gap-6">
          <h2 className={`${DISP} text-[clamp(38px,5vw,84px)] font-light leading-[1] tracking-[-.045em]`}>Притыцкого, <span style={{ color: ROSE }}>2/2</span></h2>
          <p className="flex items-start gap-3 text-[16px] opacity-70"><MapPin size={20} className="mt-0.5 shrink-0" style={{ color: ROSE }} />{b.addr}</p>
          <a href={'tel:' + tel(b.phone)} className={`${DISP} text-[30px] font-light`}>{b.phone}</a>
          <div className="flex flex-wrap gap-2">
            <a href={'tel:' + tel(b.phone)} className="inline-flex h-12 items-center gap-2 rounded-full px-5 text-[14px] font-semibold text-white" style={{ background: PLUM }}><Phone size={16} />Позвонить</a>
            <a href={b.tg} target="_blank" rel="noopener" className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-5 text-[14px] font-semibold"><TG />Telegram</a>
            <a href={b.ig} target="_blank" rel="noopener" className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-5 text-[14px] font-semibold"><IG />Instagram</a>
          </div>
        </Reveal>
        <Reveal delay={.1} className="h-[380px] overflow-hidden rounded-[34px] md:h-[440px]"><MapFrame oid={b.oid} /></Reveal>
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
      <div className="font-['Manrope',sans-serif]" style={{ background: CREAM, color: PLUM, '--sel': SOFT, '--selc': PLUM }}>
        <Ribbon name={b.name} bg={PLUM} fg={CREAM} />
        <header className="sticky top-0 z-40 bg-[#f6efea]/70 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6 md:px-14">
            <a href="#film" className={`${DISP} text-[19px] font-normal tracking-[-.04em]`}>dopamine<span style={{ color: ROSE }}>.</span></a>
            <nav className="hidden gap-8 text-[14px] font-medium md:flex">{[['#film', 'Направления'], ['#about', 'Студия'], ['#course', 'Курс'], ['#book', 'Запись'], ['#contact', 'Контакты']].map(([h, t]) => <a key={h} href={h} className="opacity-60 transition-opacity hover:opacity-100">{t}</a>)}</nav>
            <a href={'tel:' + tel(b.phone)} className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-[14px] font-semibold shadow-[0_6px_20px_-10px_rgba(42,34,48,.4)]"><Phone size={15} /><span className="hidden sm:inline">{b.phone}</span></a>
          </div>
        </header>
        <main>
          <Film lite={lite} />
          <Bento />
          <Course bk={bk} />
          <Book bk={bk} />
          <Contact />
        </main>
        <footer className="px-6 pb-10 text-[13px] opacity-60 md:px-14" style={{ background: CREAM }}>
          <div className="mx-auto flex max-w-[1400px] flex-wrap justify-between gap-4 border-t border-[#2a2230]/10 pt-8"><span>© 2026 {b.name} · Концепт сайта — Артём</span><span>{b.addr}</span></div>
        </footer>
        <CallBar phone={b.phone} barCls="bg-[#f6efea]/90 backdrop-blur-xl" callCls="rounded-full bg-white text-[#2a2230]" bookCls="rounded-full text-white bg-[#2a2230]" />
        <div className="h-[72px] sm:hidden" style={{ background: CREAM }} />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
