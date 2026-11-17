import React, { useRef, useState, useEffect, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, useSpring, useMotionValue, useInView, AnimatePresence, MotionConfig, animate } from 'framer-motion'
import { ArrowRight, Phone, MapPin, Clock, Star, Plus, Minus, Sun, CloudSun, Moon, Scissors, Palette, Wind, Hand, Baby, User } from 'lucide-react'
import '../lib/base.css'
import { useSmooth, Ribbon, LineReveal, Reveal, useBooking, phoneFocus, CheckDraw, MapFrame, CallBar, tel, useLite, useIsMobile, IG } from '../lib/kit'

const StrandsScene = lazy(() => import('./veronika3d'))

const b = {
  name: 'Вероника-стиль', addr: 'ул. Селицкого, 79', district: 'Шабаны', city: 'Минск',
  phone: '+375 17 355-84-54', ig: 'https://www.instagram.com/veronikastyle.offica', igName: '@veronikastyle.offica',
  rating: '4,6', rev: 125, revWord: 'оценок', oid: '1341922255',
}
const CREAM = '#f7f0e6', SAND = '#efe2d1', TERRA = '#b14f2a', TERRA_D = '#8a3a1c', INK = '#2a1d16'
const SERIF = "font-['Playfair_Display',serif]", SANS = "font-['Manrope',sans-serif]"
const go = id => { const el = document.querySelector(id); if (!el) return; window.__lenis ? window.__lenis.scrollTo(el, { offset: -76 }) : el.scrollIntoView({ behavior: 'smooth' }) }
const pick = svc => { window.dispatchEvent(new CustomEvent('vs-svc', { detail: svc })); go('#book') }

/* ---------------- film ---------------- */
// ranges must match veronika3d.jsx
const R = [[0.18, 0.34], [0.38, 0.54], [0.58, 0.74], [0.78, 0.92]]
const CH = [
  { k: 'Стрижка', t: 'Стрижка для всей семьи', d: 'Женские, мужские и детские стрижки. Расскажите, как вам удобно носить, — мастер подскажет форму.', svc: 'Стрижка женская' },
  { k: 'Окрашивание', t: 'Цвет, который вам идёт', d: 'Освежим цвет, подберём новый оттенок или закрасим седину — после консультации с мастером.', svc: 'Окрашивание' },
  { k: 'Укладка', t: 'Укладка — к празднику и на каждый день', d: 'Объём, локоны или аккуратная повседневная укладка.', svc: 'Укладка' },
  { k: 'Маникюр', t: 'И ухоженные руки', d: 'Маникюр в том же салоне — удобно записаться вместе со стрижкой.', svc: 'Маникюр' },
]
function Chapter({ p, i, c }) {
  const [a, z] = R[i]
  const o = useTransform(p, [a - 0.04, a + 0.01, z - 0.01, z + 0.03], [0, 1, 1, 0])
  const y = useTransform(p, [a - 0.04, a + 0.01, z - 0.01, z + 0.03], [30, 0, 0, -24])
  const pe = useTransform(o, v => (v > 0.6 ? 'auto' : 'none'))
  return (
    <motion.div style={{ opacity: o, y, pointerEvents: pe }} className="absolute inset-0 flex flex-col justify-center">
      <p className={`${SANS} text-[15px] font-bold uppercase tracking-[.16em]`} style={{ color: TERRA_D }}>0{i + 1} · {c.k}</p>
      <h2 className={`${SERIF} mt-4 text-[clamp(40px,4.8vw,76px)] font-medium leading-[1.02] tracking-[-0.02em]`}>{c.t}</h2>
      <p className="mt-5 max-w-[460px] text-[19px] leading-relaxed text-[#2a1d16]/80">{c.d}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" onClick={() => pick(c.svc)} className="inline-flex h-14 items-center gap-2 rounded-full px-7 text-[17px] font-bold text-white hover:brightness-110" style={{ background: TERRA }}>Записаться <ArrowRight size={18} /></button>
        <a href={'tel:' + tel(b.phone)} className="inline-flex h-14 items-center gap-2 rounded-full border-2 border-[#2a1d16] px-6 text-[17px] font-bold hover:bg-[#2a1d16] hover:text-white"><Phone size={18} />Позвонить</a>
      </div>
    </motion.div>
  )
}
function Dot({ p, i }) {
  const [a, z] = R[i]
  const bg = useTransform(p, [a - 0.02, a, z, z + 0.02], ['rgba(42,29,22,.2)', TERRA, TERRA, 'rgba(42,29,22,.2)'])
  const w = useTransform(p, [a - 0.02, a, z, z + 0.02], [10, 34, 34, 10])
  return <motion.span style={{ background: bg, width: w }} className="h-[10px] rounded-full" />
}
function MobCaption({ p }) {
  const [i, setI] = useState(-1)
  useEffect(() => p.on('change', v => setI(R.findIndex(([a, z]) => v >= a && v <= z + 0.03))), [p])
  return (
    <AnimatePresence>{i >= 0 && <motion.span key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-[#f7f0e6]/95 px-4 py-1.5 text-[15px] font-bold" style={{ color: TERRA_D }}>{CH[i].k}</motion.span>}</AnimatePresence>
  )
}

function Arch({ p, lite, active, mob }) {
  return (
    <div className="relative mx-auto h-full w-full overflow-hidden rounded-t-[999px] rounded-b-[28px]" style={{ background: `radial-gradient(120% 80% at 50% 30%, #fbf6ef 0%, ${SAND} 60%, #e6d3bd 100%)` }}>
      {lite ? (
        <svg viewBox="0 0 300 400" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          {Array.from({ length: 22 }, (_, i) => <path key={i} d={`M${40 + i * 4} -10 C ${260 - i * 3} 120, ${20 + i * 5} 240, ${200 + i * 2} 330`} stroke={i % 3 ? '#6e3d26' : '#b05a30'} strokeWidth="1.6" fill="none" opacity=".85" />)}
        </svg>
      ) : active && <Suspense fallback={null}><StrandsScene progress={p} active={active} count={mob ? 48 : 72} /></Suspense>}
      {mob && <MobCaption p={p} />}
    </div>
  )
}

function Film({ lite }) {
  const ref = useRef(null)
  const mob = useIsMobile()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const sp = useSpring(scrollYProgress, { stiffness: 80, damping: 24, mass: 0.4 })
  const auto = useMotionValue(0)
  useEffect(() => {
    if (!mob || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const c = animate(auto, [0, 0.12, 0.3, 0.5, 0.7, 0.9, 0.98, 0.98], { duration: 22, repeat: Infinity, ease: 'easeInOut' })
    return () => c.stop()
  }, [mob])
  const p = mob ? auto : sp
  const near = useInView(ref, { margin: '200px 0px' })
  const [mounted, setMounted] = useState(false)
  useEffect(() => { if (near) setMounted(true) }, [near])
  const heroO = useTransform(sp, [0, 0.12], [1, 0])
  const heroY = useTransform(sp, [0, 0.12], [0, -30])
  const heroPE = useTransform(sp, v => (v < 0.08 ? 'auto' : 'none'))
  return (
    <section ref={ref} id="top" className="relative md:h-[300vh]" style={{ background: CREAM }}>
      <div className="md:sticky md:top-[76px] md:h-[calc(100svh-76px)]">
        <div className="mx-auto grid h-full max-w-[1320px] grid-cols-1 gap-6 px-5 pb-12 pt-5 md:grid-cols-[1.1fr_0.9fr] md:items-center md:gap-14 md:px-10 md:py-8">
          <div className="relative order-2 min-w-0 md:order-1 md:h-[min(560px,80%)]">
            <motion.div style={mob ? undefined : { opacity: heroO, y: heroY, pointerEvents: heroPE }} className="flex h-full flex-col justify-center">
              <p className={`${SANS} flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px] font-bold uppercase tracking-[.14em]`} style={{ color: TERRA_D }}>
                <span>Парикмахерская</span><span aria-hidden="true">·</span><span>Салон красоты</span>
              </p>
              <h1 className={`${SERIF} mt-4 text-[clamp(40px,5.6vw,88px)] font-medium leading-[1.0] tracking-[-0.02em]`}>
                <LineReveal delay={0.05}>Салон красоты</LineReveal>
                <LineReveal delay={0.15}><span className="italic" style={{ color: TERRA }}>на Шабанах —</span></LineReveal>
                <LineReveal delay={0.25}>для всей семьи</LineReveal>
              </h1>
              <p className="mt-6 max-w-[500px] text-[19px] leading-relaxed text-[#2a1d16]/85">Стрижки для взрослых и детей, окрашивание, укладка и маникюр. {b.addr}, рядом с домом.</p>
              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-[17px]">
                <span className="inline-flex items-center gap-2 font-bold"><Star size={19} fill={TERRA} stroke={TERRA} />{b.rating} · {b.rev} {b.revWord} на Яндекс Картах</span>
                <span className="inline-flex items-center gap-2"><MapPin size={18} style={{ color: TERRA_D }} />{b.addr}</span>
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a href={'tel:' + tel(b.phone)} className="inline-flex h-16 items-center justify-center gap-3 rounded-full px-8 text-[19px] font-bold text-white shadow-[0_14px_30px_-14px_rgba(177,79,42,.8)] hover:brightness-110" style={{ background: TERRA }}><Phone size={21} />Позвонить · {b.phone}</a>
                <a href="#book" className="inline-flex h-16 items-center justify-center gap-2 rounded-full border-2 border-[#2a1d16] px-8 text-[19px] font-bold hover:bg-[#2a1d16] hover:text-white">Перезвоните мне</a>
              </div>
              <a href="#services" className="mt-6 hidden w-fit text-[16px] font-semibold underline decoration-[#b14f2a] decoration-2 underline-offset-4 md:inline-block">Пропустить → к услугам</a>
            </motion.div>
            {!mob && CH.map((c, i) => <Chapter key={c.k} p={sp} i={i} c={c} />)}
          </div>
          <div className="relative order-1 h-[28svh] min-h-[190px] min-w-0 md:order-2 md:h-[min(620px,86%)]">
            {mounted || mob ? <Arch p={p} lite={lite} active={near} mob={mob} /> : <div className="h-full w-full rounded-t-[999px] rounded-b-[28px]" style={{ background: SAND }} />}
            {!mob && <div className="absolute -bottom-7 left-1/2 flex -translate-x-1/2 gap-2" aria-hidden="true">{R.map((_, i) => <Dot key={i} p={sp} i={i} />)}</div>}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- services ---------------- */
const SVC = [
  { t: 'Стрижка женская', d: 'Короткие и длинные волосы, обновить форму или сменить образ.', time: 'обычно около часа', I: Scissors },
  { t: 'Стрижка мужская', d: 'Классика, машинка и ножницы, аккуратный контур.', time: 'обычно 30–40 минут', I: User },
  { t: 'Стрижка детская', d: 'Спокойно и бережно — для маленьких и школьников.', time: 'обычно 20–30 минут', I: Baby },
  { t: 'Окрашивание', d: 'Однотонное окрашивание, тонирование, седина — подбор оттенка.', time: 'зависит от длины — уточним', I: Palette },
  { t: 'Укладка', d: 'Повседневная или праздничная, объём и локоны.', time: 'обычно 30–60 минут', I: Wind },
  { t: 'Маникюр', d: 'Ухоженные руки — можно в тот же день, что и стрижка.', time: 'уточним при записи', I: Hand },
]
function Services() {
  return (
    <section id="services" className="px-5 py-24 md:px-10 md:py-32" style={{ background: CREAM }}>
      <div className="mx-auto max-w-[1200px]">
        <div className="grid gap-6 md:grid-cols-[1fr_1fr] md:items-end">
          <div>
            <p className={`${SANS} text-[15px] font-bold uppercase tracking-[.16em]`} style={{ color: TERRA_D }}>Услуги</p>
            <h2 className={`${SERIF} mt-3 text-[clamp(38px,5vw,72px)] font-medium leading-[1.02] tracking-[-0.02em]`}>Что мы делаем</h2>
          </div>
          <p className="max-w-[440px] text-[18px] leading-relaxed text-[#2a1d16]/80 md:justify-self-end">Цены — уточняйте по телефону: они зависят от длины волос и задачи. Нажмите «Записаться» — услуга сразу попадёт в заявку.</p>
        </div>
        <ul className="mt-14 border-t-2 border-[#2a1d16]/15">
          {SVC.map((s, i) => (
            <Reveal as="li" key={s.t} delay={i * 0.04} className="group grid grid-cols-[52px_1fr] items-center gap-x-5 gap-y-4 border-b-2 border-[#2a1d16]/10 py-7 md:grid-cols-[64px_1.1fr_1fr_auto] md:gap-x-8">
              <span className="grid h-[52px] w-[52px] place-items-center rounded-full md:h-16 md:w-16" style={{ background: SAND, color: TERRA_D }}><s.I size={24} /></span>
              <div>
                <h3 className={`${SERIF} text-[28px] font-medium leading-tight md:text-[34px]`}>{s.t}</h3>
                <p className="mt-1 text-[16px] font-semibold text-[#2a1d16]/65">{s.time} · цена — уточняйте</p>
              </div>
              <p className="col-span-2 text-[18px] leading-relaxed text-[#2a1d16]/80 md:col-span-1">{s.d}</p>
              <button type="button" onClick={() => pick(s.t)} className="col-span-2 inline-flex h-14 w-full items-center justify-center gap-2 rounded-full border-2 px-6 text-[17px] font-bold transition-colors group-hover:text-white md:col-span-1 md:w-auto" style={{ borderColor: TERRA, color: TERRA_D }}
                onMouseEnter={e => { e.currentTarget.style.background = TERRA; e.currentTarget.style.color = '#fff' }} onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = TERRA_D }}>Записаться</button>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ---------------- how ---------------- */
const HOW = [
  { t: 'Позвоните или оставьте заявку', d: `По телефону ${b.phone} или через форму на сайте.` },
  { t: 'Подберём время и мастера', d: 'Утро, день или вечер — как вам удобнее. Можно к знакомому мастеру.' },
  { t: 'Приходите', d: `${b.addr}, ${b.district}. Мастер встретит и всё обсудит перед работой.` },
]
function How() {
  return (
    <section id="how" className="px-5 py-24 md:px-10 md:py-28" style={{ background: SAND }}>
      <div className="mx-auto max-w-[1200px]">
        <p className={`${SANS} text-[15px] font-bold uppercase tracking-[.16em]`} style={{ color: TERRA_D }}>Как записаться</p>
        <h2 className={`${SERIF} mt-3 text-[clamp(38px,5vw,72px)] font-medium leading-[1.02] tracking-[-0.02em]`}>Три простых шага</h2>
        <ol className="mt-14 grid gap-6 md:grid-cols-3">
          {HOW.map((s, i) => (
            <Reveal as="li" key={s.t} delay={i * 0.08} className="rounded-[28px] bg-[#fbf6ef] p-8">
              <span className={`${SERIF} text-[64px] italic leading-none`} style={{ color: TERRA }}>{i + 1}</span>
              <h3 className={`${SERIF} mt-5 text-[27px] font-medium leading-tight`}>{s.t}</h3>
              <p className="mt-3 text-[18px] leading-relaxed text-[#2a1d16]/80">{s.d}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}

/* ---------------- booking ---------------- */
const B_SVC = SVC.map(s => s.t)
const PARTS = [{ t: 'Утро', d: 'первая половина дня', I: Sun }, { t: 'День', d: 'после обеда', I: CloudSun }, { t: 'Вечер', d: 'после работы', I: Moon }]
function Choice({ on, onClick, children, className = '' }) {
  return (
    <button type="button" aria-pressed={!!on} onClick={onClick}
      className={`min-h-[64px] rounded-2xl border-2 px-5 py-3 text-left text-[18px] font-bold transition-all focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#2a1d16] ${on ? 'border-[#b14f2a] bg-[#b14f2a] text-white' : 'border-[#2a1d16]/15 bg-white hover:border-[#b14f2a]'} ${className}`}>{children}</button>
  )
}
function Book() {
  const bk = useBooking()
  const [step, setStep] = useState(0), [part, setPart] = useState(''), [master, setMaster] = useState(''), [err, setErr] = useState('')
  const head = useRef(null)
  useEffect(() => { if (step) head.current?.focus() }, [step])
  useEffect(() => { const h = e => { bk.upd('svc', e.detail); setStep(0); setErr('') }; window.addEventListener('vs-svc', h); return () => window.removeEventListener('vs-svc', h) }, [])
  const next = e => {
    e.preventDefault()
    if (step === 0 && !bk.s.svc) return setErr('Пожалуйста, выберите услугу')
    if (step === 1 && !part) return setErr('Пожалуйста, выберите удобное время')
    setErr('')
    if (step < 2) setStep(step + 1); else bk.submit()
  }
  const titles = ['Какая услуга нужна?', 'Когда вам удобно?', 'Куда перезвонить?']
  return (
    <section id="book" className="px-5 py-24 md:px-10 md:py-32" style={{ background: CREAM }}>
      <div className="mx-auto grid max-w-[1200px] gap-10 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className={`${SANS} text-[15px] font-bold uppercase tracking-[.16em]`} style={{ color: TERRA_D }}>Запись</p>
          <h2 className={`${SERIF} mt-3 text-[clamp(38px,5vw,68px)] font-medium leading-[1.02] tracking-[-0.02em]`}>Запись к удобному мастеру</h2>
          <p className="mt-6 max-w-[420px] text-[19px] leading-relaxed text-[#2a1d16]/80">Выберите услугу и время — администратор перезвонит и подберёт мастера. А проще всего — позвонить:</p>
          <a href={'tel:' + tel(b.phone)} className="mt-8 flex items-center gap-5 rounded-[28px] p-6 text-white transition-transform hover:-translate-y-0.5" style={{ background: TERRA }}>
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-white/15"><Phone size={28} /></span>
            <span><span className="block text-[16px] font-semibold opacity-90">Позвонить в салон</span><span className="block text-[26px] font-extrabold tracking-[-0.01em]">{b.phone}</span></span>
          </a>
        </div>
        <div className="rounded-[32px] bg-[#fbf6ef] p-6 shadow-[0_30px_60px_-40px_rgba(90,50,30,.6)] md:p-10">
          {bk.s.sent ? (
            <div className="py-10 text-center" role="status">
              <CheckDraw className="mx-auto" size={84} />
              <p className={`${SERIF} mt-6 text-[36px] font-medium`}>Спасибо!</p>
              <p className="mx-auto mt-3 max-w-[420px] text-[18px] leading-relaxed text-[#2a1d16]/80">Мы перезвоним и подберём время у мастера. В готовом сайте заявка сразу придёт вам в Telegram.</p>
              <button type="button" onClick={() => { bk.reset(); setStep(0); setPart(''); setMaster('') }} className="mt-8 h-12 text-[17px] font-bold underline underline-offset-4">Новая заявка</button>
            </div>
          ) : (
            <form onSubmit={next} noValidate>
              <div className="flex gap-2" aria-hidden="true">{[0, 1, 2].map(i => <span key={i} className="h-2 flex-1 rounded-full" style={{ background: i <= step ? TERRA : '#e6d3bd' }} />)}</div>
              <p className="mt-4 text-[16px] font-bold" style={{ color: TERRA_D }}>Шаг {step + 1} из 3</p>
              <h3 ref={head} tabIndex={-1} className={`${SERIF} mb-6 mt-1 text-[32px] font-medium outline-none`}>{titles[step]}</h3>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={step} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }} transition={{ duration: 0.2 }}>
                  {step === 0 && <div className="grid gap-3 sm:grid-cols-2">{B_SVC.map(s => <Choice key={s} on={bk.s.svc === s} onClick={() => { bk.upd('svc', s); setErr('') }}>{s}</Choice>)}</div>}
                  {step === 1 && (<>
                    <div className="grid gap-3 sm:grid-cols-3">{PARTS.map(({ t, d, I }) => (
                      <Choice key={t} on={part === t} onClick={() => { setPart(t); setErr('') }} className="flex items-center gap-3 sm:flex-col sm:items-start sm:py-5">
                        <I size={26} /><span><span className="block">{t}</span><span className="block text-[15px] font-semibold opacity-75">{d}</span></span>
                      </Choice>
                    ))}</div>
                    <label htmlFor="vs-master" className="mt-7 block text-[17px] font-bold">К какому мастеру? <span className="font-semibold text-[#2a1d16]/60">(необязательно)</span></label>
                    <input id="vs-master" value={master} onChange={e => setMaster(e.target.value)} placeholder="Имя мастера или «любой свободный»" className="mt-2 h-16 w-full rounded-2xl border-2 border-[#2a1d16]/15 bg-white px-5 text-[18px] outline-none focus:border-[#b14f2a]" />
                  </>)}
                  {step === 2 && (<div className="space-y-5">
                    <div><label htmlFor="vs-name" className="text-[17px] font-bold">Как к вам обращаться</label>
                      <input id="vs-name" value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} autoComplete="name" className="mt-2 h-16 w-full rounded-2xl border-2 border-[#2a1d16]/15 bg-white px-5 text-[18px] outline-none focus:border-[#b14f2a]" /></div>
                    <div><label htmlFor="vs-phone" className="text-[17px] font-bold">Номер телефона</label>
                      <input id="vs-phone" value={bk.s.phone} onChange={e => bk.upd('phone', e.target.value)} onFocus={phoneFocus(bk)} type="tel" inputMode="tel" autoComplete="tel" placeholder="+375 __ ___-__-__" aria-invalid={bk.s.err} aria-describedby={bk.s.err ? 'vs-perr' : undefined}
                        className={`mt-2 h-16 w-full rounded-2xl border-2 bg-white px-5 text-[18px] outline-none focus:border-[#b14f2a] ${bk.s.err ? 'border-[#b42318]' : 'border-[#2a1d16]/15'}`} /></div>
                    {bk.s.err && <p id="vs-perr" className="text-[16px] font-semibold text-[#b42318]">Проверьте номер: нужно 12 цифр, начиная с +375.</p>}
                    <p className="rounded-2xl p-4 text-[16px]" style={{ background: SAND }}>{bk.s.svc} · {part}{master ? ' · ' + master : ''}</p>
                  </div>)}
                </motion.div>
              </AnimatePresence>
              {err && <p className="mt-4 text-[16px] font-semibold text-[#b42318]" role="alert">{err}</p>}
              <div className="mt-8 flex items-center justify-between gap-4">
                {step > 0 ? <button type="button" onClick={() => setStep(step - 1)} className="h-14 px-2 text-[17px] font-bold text-[#2a1d16]/75 hover:text-[#2a1d16]">← Назад</button> : <span />}
                <button type="submit" disabled={bk.s.loading} className="inline-flex h-16 items-center gap-2 rounded-full px-8 text-[18px] font-bold text-white disabled:opacity-60" style={{ background: TERRA }}>{step < 2 ? 'Дальше' : bk.s.loading ? 'Отправляем…' : 'Перезвоните мне'} <ArrowRight size={19} /></button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

/* ---------------- rating ---------------- */
function Rating() {
  const vals = [['Для всей семьи', 'Стрижём взрослых и детей — можно прийти вместе.'], ['Рядом с домом', `${b.addr}, ${b.district}. Не нужно ехать в центр.`], ['Без спешки', 'Мастер обсудит пожелания до начала работы.']]
  return (
    <section id="reviews" className="px-5 py-24 md:px-10 md:py-28" style={{ background: INK, color: CREAM }}>
      <div className="mx-auto grid max-w-[1200px] gap-12 md:grid-cols-[0.9fr_1.1fr] md:items-center">
        <div>
          <p className={`${SANS} text-[15px] font-bold uppercase tracking-[.16em] text-[#e9a27f]`}>Отзывы</p>
          <p className={`${SERIF} mt-4 text-[clamp(96px,14vw,190px)] font-medium leading-[.9]`}>{b.rating}</p>
          <div className="mt-3 flex gap-1" aria-hidden="true">{[0, 1, 2, 3, 4].map(i => <Star key={i} size={26} fill={i < 4 ? '#e9a27f' : 'none'} stroke="#e9a27f" />)}</div>
          <p className="mt-4 text-[20px]">{b.rev} {b.revWord} на Яндекс Картах</p>
          <a href={`https://yandex.by/maps/org/${b.oid}/reviews/`} target="_blank" rel="noopener" className="mt-6 inline-flex h-14 items-center gap-2 rounded-full border-2 border-[#f7f0e6]/60 px-6 text-[17px] font-bold hover:bg-[#f7f0e6] hover:text-[#2a1d16]">Читать отзывы <ArrowRight size={18} /></a>
        </div>
        <ul className="grid gap-4">
          {vals.map(([t, d], i) => (
            <Reveal as="li" key={t} delay={i * 0.08} className="rounded-[24px] border border-[#f7f0e6]/15 p-7">
              <h3 className={`${SERIF} text-[28px] font-medium`}>{t}</h3>
              <p className="mt-2 text-[18px] leading-relaxed text-[#f7f0e6]/80">{d}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ---------------- faq ---------------- */
const FAQ = [
  ['Можно прийти без записи?', 'Лучше позвонить заранее — подскажем, свободен ли мастер, чтобы вам не пришлось ждать.'],
  ['Можно прийти с ребёнком?', 'Да, мы делаем детские стрижки. Удобно записаться всей семьёй на одно время — скажите об этом по телефону.'],
  ['Сколько длится визит?', 'Стрижка обычно занимает от получаса до часа, окрашивание — дольше и зависит от длины волос. Точнее подскажем при записи.'],
  ['Подберёте цвет, чтобы закрыть седину?', 'Да, мастер подберёт оттенок на консультации перед окрашиванием.'],
  ['Как оплатить?', 'Способы оплаты уточняйте по телефону.'],
  ['Есть ли парковка?', 'Салон находится в жилом квартале на Селицкого. О парковке рядом подскажем по телефону.'],
]
function Faq() {
  const [open, setOpen] = useState(0)
  return (
    <section id="faq" className="px-5 py-24 md:px-10 md:py-28" style={{ background: CREAM }}>
      <div className="mx-auto grid max-w-[1200px] gap-10 md:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className={`${SANS} text-[15px] font-bold uppercase tracking-[.16em]`} style={{ color: TERRA_D }}>Вопросы</p>
          <h2 className={`${SERIF} mt-3 text-[clamp(38px,5vw,64px)] font-medium leading-[1.02] tracking-[-0.02em]`}>Частые вопросы</h2>
          <p className="mt-5 text-[18px] text-[#2a1d16]/80">Не нашли ответ? Позвоните — <a href={'tel:' + tel(b.phone)} className="font-bold underline underline-offset-4" style={{ color: TERRA_D }}>{b.phone}</a></p>
        </div>
        <div className="border-t-2 border-[#2a1d16]/15">
          {FAQ.map(([q, a], i) => (
            <div key={q} className="border-b-2 border-[#2a1d16]/10">
              <h3>
                <button type="button" aria-expanded={open === i} aria-controls={'vf-' + i} onClick={() => setOpen(open === i ? -1 : i)} className="flex min-h-[72px] w-full items-center justify-between gap-4 py-4 text-left text-[20px] font-bold focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#2a1d16]">
                  {q}<span className="grid h-10 w-10 shrink-0 place-items-center rounded-full" style={{ background: open === i ? TERRA : SAND, color: open === i ? '#fff' : INK }}>{open === i ? <Minus size={18} /> : <Plus size={18} />}</span>
                </button>
              </h3>
              <AnimatePresence initial={false}>
                {open === i && <motion.div id={'vf-' + i} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden"><p className="pb-6 text-[18px] leading-relaxed text-[#2a1d16]/80">{a}</p></motion.div>}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------- contact ---------------- */
function Contact() {
  return (
    <section id="contact" className="px-5 py-24 md:px-10 md:py-28" style={{ background: SAND }}>
      <div className="mx-auto grid max-w-[1200px] gap-10 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className={`${SANS} text-[15px] font-bold uppercase tracking-[.16em]`} style={{ color: TERRA_D }}>Контакты</p>
          <h2 className={`${SERIF} mt-3 text-[clamp(38px,5vw,64px)] font-medium leading-[1.02] tracking-[-0.02em]`}>Ждём вас на Селицкого</h2>
          <ul className="mt-8 space-y-5 text-[19px]">
            <li className="flex items-start gap-3"><MapPin className="mt-1 shrink-0" size={22} style={{ color: TERRA_D }} /><span>{b.addr}<br /><span className="text-[#2a1d16]/70">{b.district}, {b.city}</span></span></li>
            <li className="flex items-start gap-3"><Clock className="mt-1 shrink-0" size={22} style={{ color: TERRA_D }} />Часы работы — уточняйте по телефону</li>
            <li><a href={'tel:' + tel(b.phone)} className="flex items-center gap-3 text-[26px] font-extrabold"><Phone size={22} style={{ color: TERRA_D }} />{b.phone}</a></li>
            <li><a href={b.ig} target="_blank" rel="noopener" className="flex items-center gap-3 font-semibold underline-offset-4 hover:underline"><IG width="22" height="22" style={{ color: TERRA_D }} />Instagram {b.igName}</a></li>
          </ul>
          <a href={'tel:' + tel(b.phone)} className="mt-8 inline-flex h-16 items-center gap-3 rounded-full px-8 text-[19px] font-bold text-white" style={{ background: TERRA }}><Phone size={21} />Позвонить</a>
        </div>
        <div className="overflow-hidden rounded-t-[200px] rounded-b-[28px] bg-[#fbf6ef] p-3">
          <div className="h-[380px] overflow-hidden rounded-t-[190px] rounded-b-[20px] md:h-[480px]"><MapFrame oid={b.oid} /></div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- header ---------------- */
const NAV = [['#services', 'Услуги'], ['#how', 'Как записаться'], ['#reviews', 'Отзывы'], ['#contact', 'Контакты']]
function useActive() {
  const [a, setA] = useState('')
  useEffect(() => {
    const els = [...NAV.map(([h]) => document.querySelector(h)), document.querySelector('#book'), document.querySelector('#faq')].filter(Boolean)
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) setA('#' + e.target.id) }), { rootMargin: '-45% 0px -50% 0px' })
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])
  return a === '#book' ? '#how' : a === '#faq' ? '#reviews' : a
}
function Header() {
  const active = useActive()
  return (
    <header className="sticky top-0 z-50 border-b border-[#2a1d16]/10 bg-[#f7f0e6]/92 backdrop-blur">
      <div className="mx-auto flex h-[64px] max-w-[1320px] items-center justify-between gap-4 px-4 md:h-[76px] md:px-10">
        <a href="#top" className="min-w-0 leading-none" aria-label="Вероника-стиль — наверх">
          <span className={`${SERIF} block truncate text-[24px] font-semibold italic md:text-[28px]`}>Вероника-стиль</span>
          <span className="mt-1 block text-[13px] font-bold uppercase tracking-[.14em]" style={{ color: TERRA_D }}>салон красоты · Шабаны</span>
        </a>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Разделы">
          {NAV.map(([h, t]) => <a key={h} href={h} aria-current={active === h ? 'true' : undefined} className={`rounded-full px-4 py-2 text-[17px] font-semibold transition-colors ${active === h ? 'bg-[#2a1d16] text-white' : 'hover:bg-[#2a1d16]/[.07]'}`}>{t}</a>)}
        </nav>
        <div className="flex shrink-0 items-center gap-3">
          <a href={'tel:' + tel(b.phone)} className="hidden text-[18px] font-extrabold xl:inline">{b.phone}</a>
          <a href={'tel:' + tel(b.phone)} className="inline-flex h-12 items-center gap-2 rounded-full px-5 text-[17px] font-bold text-white" style={{ background: TERRA }}><Phone size={18} /><span className="hidden sm:inline">Позвонить</span></a>
        </div>
      </div>
    </header>
  )
}

function FloatCall() {
  return (
    <a href={'tel:' + tel(b.phone)} className="fixed bottom-6 right-6 z-50 hidden h-16 items-center gap-3 rounded-full pl-3 pr-7 text-white shadow-[0_18px_40px_-14px_rgba(138,58,28,.75)] transition-transform hover:-translate-y-0.5 sm:inline-flex" style={{ background: TERRA }} aria-label={'Позвонить ' + b.phone}>
      <span className="grid h-11 w-11 place-items-center rounded-full bg-white/15"><Phone size={21} /></span>
      <span className="leading-tight"><span className="block text-[14px] font-semibold opacity-90">Позвонить</span><span className="block text-[18px] font-extrabold">{b.phone}</span></span>
    </a>
  )
}

function App() {
  useSmooth()
  const lite = useLite()
  return (
    <MotionConfig reducedMotion="user">
      <div className={`${SANS} text-[18px] text-[#2a1d16]`} style={{ background: CREAM, '--sel': TERRA, '--selc': '#fff' }}>
        <Ribbon name={b.name} bg={INK} fg={CREAM} />
        <Header />
        <main>
          <Film lite={lite} />
          <Services />
          <How />
          <Book />
          <Rating />
          <Faq />
          <Contact />
        </main>
        <footer className="px-5 py-10 text-[16px] md:px-10" style={{ background: INK, color: 'rgba(247,240,230,.75)' }}>
          <div className="mx-auto flex max-w-[1200px] flex-wrap justify-between gap-4"><span>© 2026 {b.name} · Концепт сайта — Артём</span><span>{b.addr}, {b.city}</span></div>
        </footer>
        <FloatCall />
        <CallBar phone={b.phone} barCls="bg-[#f7f0e6]/95 backdrop-blur border-t border-[#2a1d16]/10" callCls="rounded-full bg-[#b14f2a] text-white text-[18px]" bookCls="rounded-full border-2 border-[#2a1d16] text-[#2a1d16] text-[18px]" />
        <div className="h-[76px] sm:hidden" style={{ background: INK }} />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
