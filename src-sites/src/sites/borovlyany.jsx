import React, { useRef, useState, useEffect, useMemo, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, useSpring, useInView, AnimatePresence, MotionConfig } from 'framer-motion'
import { ArrowRight, ArrowUpRight, Phone, Plus, Minus } from 'lucide-react'
import '../lib/base.css'
import { useSmooth, Ribbon, Reveal, useBooking, phoneFocus, CheckDraw, MapFrame, CallBar, tel, useLite, useIsMobile, IG, LineReveal } from '../lib/kit'

const KeyCard = lazy(() => import('./borovlyany3d'))

const b = {
  name: 'Шиномонтаж в Боровлянах', addr: 'ул. 40 лет Победы, 19А, корп. 2', place: 'д. Боровляны',
  phone: '+375 29 807-22-45', viber: 'viber://chat?number=%2B375298072245', ig: 'https://www.instagram.com/shinka_borovlyany',
  rating: '5,0', rev: 170, oid: '133512762574',
}
const BLUE = '#2340ff', INK = '#0e0e0e', PAPER = '#f5f4f0'
const MO = "font-['JetBrains_Mono',monospace]"
const NAV = [['services', 'Услуги'], ['book', 'Бронирование'], ['how', 'Как это работает'], ['rating', 'Отзывы'], ['contact', 'Контакты']]
const H2 = 'text-[clamp(40px,6vw,96px)] font-medium leading-[.95] tracking-[-0.045em]'

function useActive(ids) {
  const [a, setA] = useState('')
  useEffect(() => {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) setA(e.target.id) }), { rootMargin: '-45% 0px -50% 0px' })
    ids.forEach(id => { const el = document.getElementById(id); if (el) io.observe(el) })
    return () => io.disconnect()
  }, [])
  return a
}
const go = tab => window.dispatchEvent(new CustomEvent('bv-tab', { detail: tab }))

function Header() {
  const a = useActive(NAV.map(n => n[0]))
  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-[#f5f4f0]/90 backdrop-blur-md">
      <div className="mx-auto grid h-16 max-w-[1440px] grid-cols-[auto_1fr_auto] items-center gap-4 px-4 md:px-8">
        <a href="#top" className="flex items-center gap-3">
          <span className={`${MO} grid h-9 w-12 place-items-center rounded-md bg-[#2340ff] text-[13px] font-medium text-white`}>Ш·Б</span>
          <span className="leading-tight"><span className="block text-[16px] font-semibold tracking-[-0.02em]">Шинный отель</span><span className={`${MO} block text-[11.5px] text-black/60`}>Боровляны · шиномонтаж</span></span>
        </a>
        <nav className="hidden justify-center gap-6 lg:flex" aria-label="Разделы">
          {NAV.map(([id, t]) => <a key={id} href={'#' + id} aria-current={a === id ? 'true' : undefined} className={`relative py-2 text-[14.5px] transition-colors ${a === id ? 'text-[#2340ff]' : 'text-black/70 hover:text-black'}`}>{t}{a === id && <motion.span layoutId="bv-nav" className="absolute inset-x-0 -bottom-[13px] h-[2px] bg-[#2340ff]" />}</a>)}
        </nav>
        <div className="flex items-center gap-2 justify-self-end">
          <a href={'tel:' + tel(b.phone)} className={`${MO} hidden px-2 text-[13.5px] md:block`}>{b.phone}</a>
          <a href="#book" className="inline-flex h-10 items-center rounded-md bg-[#0e0e0e] px-4 text-[14.5px] font-medium text-white hover:bg-[#2340ff]">Забронировать</a>
        </div>
      </div>
    </header>
  )
}

/* ---------------- hero + pinned key-card film ---------------- */
const CH = [
  { n: '01', k: 'Заезд', h: 'Привозите комплект', d: 'Шины или колёса на дисках — в день переобувки или отдельно.', r: [0.12, 0.34] },
  { n: '02', k: 'Номер', h: 'Своё место на стеллаже', d: 'Комплект хранится на стеллаже, у каждого — своя ячейка.', r: [0.34, 0.54] },
  { n: '03', k: 'Проживание', h: 'До следующего сезона', d: 'Не нужно держать колёса на балконе или в гараже.', r: [0.54, 0.74] },
  { n: '04', k: 'Выезд', h: 'Переобуем в тот же визит', d: 'Записываетесь онлайн — забираете комплект уже на машине.', r: [0.74, 1.2] },
]
function Chapter({ p, c }) {
  const k = [c.r[0], c.r[0] + 0.04, c.r[1] - 0.04, c.r[1]]
  const o = useTransform(p, k, [0, 1, 1, 0])
  const clip = useTransform(p, k, ['inset(0 100% 0 0)', 'inset(0 0% 0 0)', 'inset(0 0% 0 0)', 'inset(0 0 0 100%)'])
  return (
    <motion.div style={{ opacity: o, clipPath: clip }} className="pointer-events-none absolute inset-x-4 top-6 md:left-8 md:right-auto md:top-[12vh] md:w-[44vw]">
      <div className={`${MO} flex items-center gap-3 text-[13px]`}><span className="text-[#2340ff]">{c.n}</span><span className="h-px w-10 bg-black/30" /><span className="uppercase tracking-[.12em]">{c.k}</span></div>
      <h2 className="mt-4 text-[clamp(36px,5vw,76px)] font-medium leading-[.98] tracking-[-0.045em]">{c.h}</h2>
      <p className="mt-4 max-w-[440px] text-[17px] leading-snug text-black/70 md:text-[19px]">{c.d}</p>
    </motion.div>
  )
}
function LiteCard() {
  return (
    <div className="absolute inset-0 grid place-items-center max-md:items-end max-md:pb-28 md:left-1/2">
      <div className={`${MO} grid aspect-[1.586] w-[min(380px,70vw)] -rotate-6 content-between rounded-2xl bg-[#2340ff] p-6 text-white shadow-2xl`}><span className="text-[22px] font-medium">Шинный отель</span><span className="text-[13px]">KEY · БОРОВЛЯНЫ</span></div>
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
  const heroO = useTransform(p, [0, 0.09], [1, 0])
  const heroPE = useTransform(p, v => (v < 0.05 ? 'auto' : 'none'))
  const stageY = useTransform(p, [0, 0.1], [mob ? '30vh' : '0vh', '0vh'])
  const bar = useTransform(p, [0.08, 0.95], ['0%', '100%'])
  const hudO = useTransform(p, [0.06, 0.11], [0, 1])
  return (
    <section ref={ref} id="top" className="relative h-[300vh]">
      <div className="sticky top-16 h-[calc(100svh-64px)] overflow-hidden">
        {/* rack grid: rows and room numbers */}
        <div aria-hidden="true" className="absolute inset-0 grid grid-cols-6 grid-rows-4 md:grid-cols-12">
          {Array.from({ length: 48 }, (_, i) => <span key={i} className={`${MO} border-b border-r border-black/[.06] p-2 text-[10px] text-black/20 ${i >= 24 ? 'max-md:hidden' : ''}`}>{String.fromCharCode(65 + Math.floor(i / 12))}-{String((i % 12) + 1).padStart(2, '0')}</span>)}
        </div>
        <motion.div style={{ y: stageY }} className="absolute inset-0">
          {lite ? <LiteCard /> : mounted && <Suspense fallback={<LiteCard />}><KeyCard progress={p} active={near} /></Suspense>}
        </motion.div>

        <motion.div style={{ opacity: heroO, pointerEvents: heroPE }} className="relative z-[2] mx-auto max-w-[1440px] px-4 pt-6 md:px-8 md:pt-[6vh]">
          <p className={`${MO} text-[12.5px] uppercase tracking-[.12em] text-black/65`}>{b.place} · {b.addr}</p>
          <h1 className="mt-4 max-w-[720px] text-[clamp(44px,7vw,112px)] font-medium leading-[.92] tracking-[-0.055em]">
            <LineReveal>Шинный отель</LineReveal>
            <LineReveal delay={0.08}><span className="text-[#2340ff]">в Боровлянах.</span></LineReveal>
          </h1>
          <p className="mt-5 max-w-[500px] text-[17px] leading-snug text-black/75 md:text-[19px]">Хранение шин и колёс на стеллажах, переобувка по онлайн-записи, заправка и чистка кондиционера.</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <a href="#book" onClick={() => go('store')} className="inline-flex h-14 items-center gap-2 rounded-md bg-[#2340ff] px-6 text-[16px] font-medium text-white hover:bg-[#0e0e0e]">Забронировать хранение <ArrowRight size={17} /></a>
            <a href="#book" onClick={() => go('svc')} className="inline-flex h-14 items-center rounded-md border border-black/80 px-5 text-[16px] font-medium hover:bg-black hover:text-white">Записаться на переобувку</a>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
            <a href="#rating" className="flex items-baseline gap-2"><span className="text-[34px] font-medium tracking-[-0.04em]">{b.rating}</span><span className={`${MO} text-[12.5px] text-black/65`}>Яндекс · {b.rev} оценок</span></a>
            <a href={'tel:' + tel(b.phone)} className={`${MO} inline-flex items-center gap-2 text-[14px]`}><Phone size={15} />{b.phone}</a>
            <a href={b.viber} className={`${MO} text-[14px] underline underline-offset-4`}>Viber</a>
          </div>
        </motion.div>

        {CH.map(c => <Chapter key={c.n} p={p} c={c} />)}

        <motion.div style={{ opacity: hudO }} className={`${MO} pointer-events-none absolute bottom-[86px] left-4 right-4 z-[3] flex items-end justify-between gap-6 text-[12px] uppercase text-black/60 md:bottom-6 md:left-8 md:right-8`}>
          <div className="w-full max-w-[300px]"><span>Заезд → Выезд</span><div className="mt-2 h-[2px] bg-black/10"><motion.div style={{ width: bar }} className="h-full bg-[#2340ff]" /></div></div>
          <a href="#services" className="pointer-events-auto shrink-0 text-[13px] normal-case text-black underline underline-offset-4 hover:text-[#2340ff]">Пропустить →</a>
        </motion.div>
      </div>
    </section>
  )
}

/* ---------------- services as a room list ---------------- */
const SV = [
  ['S-01', 'Хранение шин и колёс', 'На стеллажах, до следующего сезона. Шины или колёса на дисках.', 'сезон', 'store'],
  ['S-02', 'Переобувка', 'Сезонная замена колёс в сборе.', '~30–60 мин', 'svc'],
  ['S-03', 'Шиномонтаж и балансировка', 'Перебортовка шин на диски и балансировка.', '~40–60 мин', 'svc'],
  ['S-04', 'Заправка кондиционера', 'Заправка системы по норме для вашего авто.', '~30–60 мин', 'svc'],
  ['S-05', 'Чистка кондиционера', 'Чтобы из дефлекторов не пахло сыростью.', '~30–60 мин', 'svc'],
  ['S-06', 'Онлайн-запись', 'Выберите день — без ожидания на месте.', '1 минута', 'svc'],
]
function Services() {
  return (
    <section id="services" className="scroll-mt-16 border-t border-black/15 px-4 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid gap-6 md:grid-cols-12">
          <p className={`${MO} text-[13px] uppercase tracking-[.12em] text-black/60 md:col-span-3`}>01 — Услуги</p>
          <div className="md:col-span-9">
            <h2 className={H2}>Номера и сервис</h2>
            <p className="mt-4 max-w-[560px] text-[17px] text-black/70">Цена — уточнит мастер. Время — ориентировочное.</p>
          </div>
        </div>
        <ul className="mt-12 border-t border-black">
          {SV.map(([n, t, d, time, tab]) => (
            <li key={n} className="group border-b border-black/15 transition-colors hover:bg-white">
              <div className="grid grid-cols-[64px_1fr] items-center gap-x-4 gap-y-2 py-5 md:grid-cols-12 md:gap-6 md:px-2">
                <span className={`${MO} text-[13px] text-[#2340ff] md:col-span-1`}>{n}</span>
                <h3 className="text-[24px] font-medium leading-tight tracking-[-0.03em] md:col-span-4 md:text-[28px]">{t}</h3>
                <p className="col-start-2 text-[16px] leading-snug text-black/70 md:col-span-4 md:col-start-auto">{d}</p>
                <p className={`${MO} col-start-2 text-[12.5px] uppercase text-black/60 md:col-span-1 md:col-start-auto`}>{time}</p>
                <a href="#book" data-svc={t} onClick={() => { window.__bvSvc = t; go(tab) }} className="col-start-2 inline-flex h-11 w-fit items-center gap-2 rounded-md border border-black px-4 text-[14.5px] font-medium transition-colors group-hover:border-[#2340ff] group-hover:bg-[#2340ff] group-hover:text-white md:col-span-2 md:col-start-auto md:justify-self-end">{tab === 'store' ? 'Забронировать' : 'Записаться'} <ArrowRight size={15} /></a>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ---------------- booking: storage receipt + service ---------------- */
const SETS = [['tyres', '4 шины', 'без дисков'], ['wheels', '4 колеса', 'на дисках']]
const RADII = ['R13', 'R14', 'R15', 'R16', 'R17', 'R18', 'R19', 'R20+']
const SEASONS = [['summer', 'Летние'], ['winter', 'Зимние']]
const WHEN = ['При переобувке', 'Сегодня', 'Завтра', 'На этой неделе']
const BSV = ['Переобувка', 'Шиномонтаж и балансировка', 'Заправка кондиционера', 'Чистка кондиционера']
const DAYS = ['Сегодня', 'Завтра', 'На этой неделе', 'Перезвоните мне']

function Seg({ on, children, sub, ...r }) {
  return <button type="button" aria-pressed={on} className={`min-h-[52px] rounded-md border px-4 text-left text-[16px] transition-colors ${on ? 'border-[#2340ff] bg-[#2340ff] text-white' : 'border-black/20 bg-white hover:border-black'}`} {...r}><span className="font-medium">{children}</span>{sub && <span className={`${MO} block text-[12px] ${on ? 'text-white/80' : 'text-black/55'}`}>{sub}</span>}</button>
}
function Row({ k, v, hi }) {
  return <div className="flex items-baseline justify-between gap-4 border-b border-dashed border-black/20 py-2.5"><dt className={`${MO} text-[12px] uppercase tracking-[.08em] text-black/55`}>{k}</dt><dd className={`text-right text-[16px] ${hi ? 'font-semibold text-[#2340ff]' : 'font-medium'} ${v ? '' : 'text-black/35'}`}>{v || '—'}</dd></div>
}
function Receipt({ set, radius, season, when, also, name, sent }) {
  const s = SETS.find(x => x[0] === set), se = SEASONS.find(x => x[0] === season)
  return (
    <div className="relative">
      <div className="rounded-xl bg-white p-6 shadow-[0_30px_60px_-30px_rgba(0,0,0,.35)] md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div><p className={`${MO} text-[12px] uppercase tracking-[.12em] text-black/55`}>Квитанция хранения</p><p className="mt-1 text-[24px] font-medium tracking-[-0.03em]">Шинный отель · Боровляны</p></div>
          <span className={`${MO} shrink-0 rounded px-2 py-1 text-[11.5px] uppercase ${sent ? 'bg-[#19c26b] text-white' : 'bg-black/5 text-black/60'}`}>{sent ? 'Заявка' : 'Черновик'}</span>
        </div>
        <dl className="mt-6">
          <Row k="Гость" v={name} />
          <Row k="Комплект" v={s && `${s[1]} · ${s[2]}`} />
          <Row k="Радиус" v={radius} />
          <Row k="Сезон хранения" v={se && se[1]} />
          <Row k="Заезд" v={when} />
          <Row k="Переобувка" v={also ? 'в тот же визит' : 'не нужна'} />
          <Row k="Номер ячейки" v="присвоят при заезде" hi />
        </dl>
        <div className="mt-6 flex items-end justify-between gap-4">
          <svg viewBox="0 0 160 36" className="h-9 w-40" aria-hidden="true">{Array.from({ length: 40 }, (_, i) => <rect key={i} x={i * 4} y="0" width={(i * 7) % 3 === 0 ? 2.6 : 1.2} height="36" fill="#0e0e0e" />)}</svg>
          <p className={`${MO} text-right text-[11.5px] text-black/55`}>Стоимость и условия<br />уточнит мастер</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute -bottom-3 left-6 right-6 h-3 rounded-b-xl bg-white/60" />
    </div>
  )
}
function StoreForm() {
  const bk = useBooking()
  const [step, setStep] = useState(0)
  const [set, setSet] = useState('wheels'), [radius, setRadius] = useState(''), [season, setSeason] = useState('')
  const [when, setWhen] = useState(''), [also, setAlso] = useState(true)
  const [err, setErr] = useState('')
  const head = useRef(null)
  useEffect(() => { if (step) head.current?.focus() }, [step])
  const next = e => {
    e.preventDefault()
    if (step === 0 && (!radius || !season)) return setErr(!radius ? 'Выберите радиус' : 'Какой комплект оставляете на хранение?')
    if (step === 1 && !when) return setErr('Когда привезёте комплект?')
    setErr('')
    if (step < 2) setStep(step + 1); else { bk.upd('svc', 'Хранение'); bk.submit() }
  }
  const reset = () => { bk.reset(); setStep(0); setRadius(''); setSeason(''); setWhen('') }
  return (
    <div className="grid gap-8 lg:grid-cols-[1.05fr_.95fr]">
      <div className="order-2 lg:order-1">
        {bk.s.sent ? (
          <div className="py-6" role="status">
            <CheckDraw className="text-[#2340ff]" />
            <p className="mt-5 text-[34px] font-medium tracking-[-0.03em]">Бронь хранения принята</p>
            <p className="mt-3 max-w-[460px] text-[17px] text-black/70">Мастер перезвонит на {bk.s.phone}, подтвердит дату заезда и условия. В готовом сайте заявка сразу придёт вам в Telegram.</p>
            <button type="button" onClick={reset} className={`${MO} mt-6 min-h-[44px] text-[13px] uppercase underline underline-offset-4`}>Новая бронь</button>
          </div>
        ) : (
          <form onSubmit={next} noValidate>
            <ol className={`${MO} grid grid-cols-3 gap-2 text-[12px] uppercase`} aria-label="Шаги">{['Комплект', 'Заезд', 'Гость'].map((t, i) => <li key={t} aria-current={i === step ? 'step' : undefined} className={`border-t-2 pt-2 ${i <= step ? 'border-[#2340ff] text-black' : 'border-black/15 text-black/45'}`}>0{i + 1} {t}</li>)}</ol>
            <h3 ref={head} tabIndex={-1} className="mt-6 text-[28px] font-medium tracking-[-0.03em] outline-none">{['Что храним?', 'Когда заезд?', 'На кого бронь?'][step]}</h3>
            <div className="mt-5">
              {step === 0 && <div className="space-y-5">
                <div className="grid grid-cols-2 gap-2">{SETS.map(([k, t, s]) => <Seg key={k} on={set === k} sub={s} onClick={() => setSet(k)}>{t}</Seg>)}</div>
                <div><p id="bv-r" className={`${MO} text-[12.5px] uppercase text-black/60`}>Радиус</p><div role="group" aria-labelledby="bv-r" className="mt-2 grid grid-cols-4 gap-2">{RADII.map(r => <Seg key={r} on={radius === r} onClick={() => { setRadius(r); setErr('') }}>{r}</Seg>)}</div></div>
                <div><p id="bv-s" className={`${MO} text-[12.5px] uppercase text-black/60`}>Оставляете на хранение</p><div role="group" aria-labelledby="bv-s" className="mt-2 grid grid-cols-2 gap-2">{SEASONS.map(([k, t]) => <Seg key={k} on={season === k} onClick={() => { setSeason(k); setErr('') }}>{t}</Seg>)}</div></div>
              </div>}
              {step === 1 && <div className="space-y-5">
                <div className="grid grid-cols-2 gap-2">{WHEN.map(w => <Seg key={w} on={when === w} onClick={() => { setWhen(w); setErr('') }}>{w}</Seg>)}</div>
                <label className="flex min-h-[56px] cursor-pointer items-center justify-between gap-4 rounded-md border border-black/20 bg-white px-4">
                  <span className="text-[16px] font-medium">Переобуть в тот же визит</span>
                  <input type="checkbox" checked={also} onChange={e => setAlso(e.target.checked)} className="h-6 w-6 accent-[#2340ff]" />
                </label>
              </div>}
              {step === 2 && <div className="grid gap-4 sm:grid-cols-2">
                <div><label htmlFor="bs-name" className={`${MO} text-[12.5px] uppercase text-black/60`}>Имя</label><input id="bs-name" value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} autoComplete="name" className="mt-1.5 h-14 w-full rounded-md border border-black/25 bg-white px-4 text-[17px] outline-none focus:border-[#2340ff] focus:ring-2 focus:ring-[#2340ff]/30" /></div>
                <div><label htmlFor="bs-phone" className={`${MO} text-[12.5px] uppercase text-black/60`}>Телефон</label><input id="bs-phone" value={bk.s.phone} onChange={e => bk.upd('phone', e.target.value)} onFocus={phoneFocus(bk)} type="tel" inputMode="tel" autoComplete="tel" placeholder="+375 __ ___-__-__" aria-invalid={bk.s.err} aria-describedby={bk.s.err ? 'bs-perr' : undefined} className={`mt-1.5 h-14 w-full rounded-md border bg-white px-4 text-[17px] outline-none focus:border-[#2340ff] focus:ring-2 focus:ring-[#2340ff]/30 ${bk.s.err ? 'border-[#c8102e]' : 'border-black/25'}`} />
                  {bk.s.err && <p id="bs-perr" className="mt-2 text-[15px] text-[#c8102e]">Проверьте номер — 12 цифр с кодом +375.</p>}</div>
              </div>}
            </div>
            {err && <p className="mt-4 text-[15px] text-[#c8102e]" role="alert">{err}</p>}
            <div className="mt-8 flex items-center justify-between">
              {step > 0 ? <button type="button" onClick={() => setStep(step - 1)} className={`${MO} min-h-[44px] text-[13px] uppercase text-black/60 hover:text-black`}>← Назад</button> : <span />}
              <button type="submit" disabled={bk.s.loading} className="inline-flex h-14 items-center gap-2 rounded-md bg-[#2340ff] px-6 text-[16px] font-medium text-white hover:bg-[#0e0e0e] disabled:opacity-60">{step < 2 ? 'Дальше' : bk.s.loading ? 'Отправляем…' : 'Забронировать'} <ArrowRight size={17} /></button>
            </div>
          </form>
        )}
      </div>
      <div className="order-1 lg:order-2"><Receipt set={set} radius={radius} season={season} when={when} also={also} name={bk.s.name} sent={bk.s.sent} /></div>
    </div>
  )
}
function SvcForm() {
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
  useEffect(() => { if (window.__bvSvc && window.__bvSvc !== 'Хранение шин и колёс') bk.upd('svc', window.__bvSvc); window.__bvSvc = '' }, [])
  const custom = bk.s.svc && !BSV.includes(bk.s.svc)
  if (bk.s.sent) return (
    <div className="max-w-[640px] py-6" role="status">
      <CheckDraw className="text-[#2340ff]" />
      <p className="mt-5 text-[34px] font-medium tracking-[-0.03em]">Записали</p>
      <p className="mt-3 text-[17px] text-black/70">{bk.s.svc} · {day}. Мастер перезвонит и подтвердит время. В готовом сайте заявка сразу придёт вам в Telegram.</p>
      <button type="button" onClick={() => { bk.reset(); setStep(0); setDay('') }} className={`${MO} mt-6 min-h-[44px] text-[13px] uppercase underline underline-offset-4`}>Новая запись</button>
    </div>
  )
  return (
    <form onSubmit={next} noValidate className="max-w-[760px]">
      <ol className={`${MO} grid grid-cols-3 gap-2 text-[12px] uppercase`} aria-label="Шаги">{['Услуга', 'День', 'Контакт'].map((t, i) => <li key={t} aria-current={i === step ? 'step' : undefined} className={`border-t-2 pt-2 ${i <= step ? 'border-[#2340ff]' : 'border-black/15 text-black/45'}`}>0{i + 1} {t}</li>)}</ol>
      <h3 ref={head} tabIndex={-1} className="mt-6 text-[28px] font-medium tracking-[-0.03em] outline-none">{['Что нужно?', 'Когда удобно?', 'Как связаться?'][step]}</h3>
      <div className="mt-5">
        {step === 0 && <div className="grid gap-2 sm:grid-cols-2">{custom && <Seg on>{bk.s.svc}</Seg>}{BSV.map(s => <Seg key={s} on={bk.s.svc === s} onClick={() => { bk.upd('svc', s); setErr('') }}>{s}</Seg>)}</div>}
        {step === 1 && <div className="grid grid-cols-2 gap-2">{DAYS.map(d => <Seg key={d} on={day === d} onClick={() => { setDay(d); setErr('') }}>{d}</Seg>)}</div>}
        {step === 2 && <div className="grid gap-4 sm:grid-cols-2">
          <div><label htmlFor="bb-name" className={`${MO} text-[12.5px] uppercase text-black/60`}>Имя</label><input id="bb-name" value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} autoComplete="name" className="mt-1.5 h-14 w-full rounded-md border border-black/25 bg-white px-4 text-[17px] outline-none focus:border-[#2340ff] focus:ring-2 focus:ring-[#2340ff]/30" /></div>
          <div><label htmlFor="bb-phone" className={`${MO} text-[12.5px] uppercase text-black/60`}>Телефон</label><input id="bb-phone" value={bk.s.phone} onChange={e => bk.upd('phone', e.target.value)} onFocus={phoneFocus(bk)} type="tel" inputMode="tel" autoComplete="tel" placeholder="+375 __ ___-__-__" aria-invalid={bk.s.err} aria-describedby={bk.s.err ? 'bb-perr' : undefined} className={`mt-1.5 h-14 w-full rounded-md border bg-white px-4 text-[17px] outline-none focus:border-[#2340ff] focus:ring-2 focus:ring-[#2340ff]/30 ${bk.s.err ? 'border-[#c8102e]' : 'border-black/25'}`} />
            {bk.s.err && <p id="bb-perr" className="mt-2 text-[15px] text-[#c8102e]">Проверьте номер — 12 цифр с кодом +375.</p>}</div>
        </div>}
      </div>
      {err && <p className="mt-4 text-[15px] text-[#c8102e]" role="alert">{err}</p>}
      <div className="mt-8 flex items-center justify-between">
        {step > 0 ? <button type="button" onClick={() => setStep(step - 1)} className={`${MO} min-h-[44px] text-[13px] uppercase text-black/60 hover:text-black`}>← Назад</button> : <span />}
        <button type="submit" disabled={bk.s.loading} className="inline-flex h-14 items-center gap-2 rounded-md bg-[#2340ff] px-6 text-[16px] font-medium text-white hover:bg-[#0e0e0e] disabled:opacity-60">{step < 2 ? 'Дальше' : bk.s.loading ? 'Отправляем…' : 'Записаться'} <ArrowRight size={17} /></button>
      </div>
    </form>
  )
}
function Book() {
  const [tab, setTab] = useState('store')
  useEffect(() => { const h = e => setTab(e.detail); window.addEventListener('bv-tab', h); return () => window.removeEventListener('bv-tab', h) }, [])
  return (
    <section id="book" className="scroll-mt-16 bg-[#e9e8e3] px-4 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid gap-6 md:grid-cols-12">
          <p className={`${MO} text-[13px] uppercase tracking-[.12em] text-black/60 md:col-span-3`}>02 — Бронирование</p>
          <div className="md:col-span-9">
            <h2 className={H2}>Забронируйте<br /><span className="text-[#2340ff]">номер для колёс.</span></h2>
            <div role="tablist" aria-label="Тип заявки" className="mt-8 inline-flex rounded-lg border border-black/20 bg-white p-1">
              {[['store', 'Хранение'], ['svc', 'Переобувка и сервис']].map(([k, t]) => <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`min-h-[44px] rounded-md px-4 text-[15px] font-medium transition-colors ${tab === k ? 'bg-[#0e0e0e] text-white' : 'text-black/70 hover:text-black'}`}>{t}</button>)}
            </div>
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="mt-12 md:ml-[25%]">
            {tab === 'store' ? <StoreForm /> : <SvcForm />}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}

/* ---------------- how ---------------- */
const STEPS = [['Онлайн-запись', 'Выбрали услугу и день на сайте или позвонили.'], ['Заезд', 'Приезжаете к назначенному времени — без ожидания.'], ['Работа', 'Переобуваем; комплект на хранение — на стеллаж.'], ['Выезд', 'В следующий сезон — запись, и колёса снова на машине.']]
function How() {
  return (
    <section id="how" className="scroll-mt-16 border-t border-black/15 px-4 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid gap-6 md:grid-cols-12">
          <p className={`${MO} text-[13px] uppercase tracking-[.12em] text-black/60 md:col-span-3`}>03 — Как это работает</p>
          <h2 className={`${H2} md:col-span-9`}>Четыре шага</h2>
        </div>
        <ol className="mt-12 grid border-l border-t border-black/15 md:ml-[25%] md:grid-cols-2">
          {STEPS.map(([h, d], i) => (
            <Reveal as="li" key={h} delay={i * 0.06} className="border-b border-r border-black/15 p-6 md:p-8">
              <span className={`${MO} text-[13px] text-[#2340ff]`}>0{i + 1}</span>
              <h3 className="mt-6 text-[28px] font-medium tracking-[-0.03em]">{h}</h3>
              <p className="mt-2 text-[16px] leading-snug text-black/70">{d}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}

function Rating() {
  return (
    <section id="rating" className="scroll-mt-16 bg-[#2340ff] px-4 py-20 text-white md:px-8 md:py-28">
      <div className="mx-auto grid max-w-[1440px] gap-6 md:grid-cols-12">
        <p className={`${MO} text-[13px] uppercase tracking-[.12em] text-white/75 md:col-span-3`}>04 — Отзывы</p>
        <div className="md:col-span-4"><p className="text-[clamp(120px,16vw,240px)] font-medium leading-[.85] tracking-[-0.07em]">{b.rating}</p><p className={`${MO} mt-3 text-[14px]`}>Яндекс Карты · {b.rev} оценок</p></div>
        <div className="flex flex-col justify-end md:col-span-5">
          <p className="text-[clamp(24px,2.6vw,38px)] font-medium leading-tight tracking-[-0.03em]">В отзывах чаще всего отмечают, что ждать не приходится.</p>
          <a href={`https://yandex.ru/maps/org/${b.oid}/reviews/`} target="_blank" rel="noopener" className="mt-8 inline-flex h-12 w-fit items-center gap-2 rounded-md bg-white px-5 text-[15px] font-medium text-[#0e0e0e]">Читать отзывы <ArrowUpRight size={16} /></a>
        </div>
      </div>
    </section>
  )
}

const FAQ = [
  ['Что можно оставить на хранение?', 'Комплект шин или колёс на дисках. Условия и стоимость хранения уточнит мастер.'],
  ['Можно сдать колёса и сразу переобуться?', 'Да, удобнее всего так: записываетесь на переобувку и в тот же визит оставляете снятый комплект.'],
  ['Сколько длится переобувка?', 'Обычно 30–60 минут для колёс в сборе. Шиномонтаж на диски — дольше.'],
  ['Нужна ли запись?', 'Лучше записаться онлайн или позвонить — так не придётся ждать.'],
  ['Как оплатить?', 'Способы оплаты уточняйте по телефону.'],
  ['Делаете кондиционер?', 'Да: заправка и чистка кондиционера. Время и цену подскажет мастер.'],
]
function Faq() {
  const [o, setO] = useState(0)
  return (
    <section id="faq" className="px-4 py-20 md:px-8 md:py-28">
      <div className="mx-auto grid max-w-[1440px] gap-6 md:grid-cols-12">
        <p className={`${MO} text-[13px] uppercase tracking-[.12em] text-black/60 md:col-span-3`}>05 — Вопросы</p>
        <div className="border-t border-black md:col-span-9">
          {FAQ.map(([q, a], i) => (
            <div key={q} className="border-b border-black/15">
              <h3><button type="button" aria-expanded={o === i} aria-controls={'bq' + i} onClick={() => setO(o === i ? -1 : i)} className="flex w-full items-center justify-between gap-6 py-5 text-left text-[20px] font-medium tracking-[-0.02em] md:text-[24px]">{q}<span className={`grid h-9 w-9 shrink-0 place-items-center rounded-md ${o === i ? 'bg-[#2340ff] text-white' : 'border border-black/25'}`}>{o === i ? <Minus size={17} /> : <Plus size={17} />}</span></button></h3>
              <AnimatePresence initial={false}>{o === i && <motion.div id={'bq' + i} initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden"><p className="max-w-[680px] pb-6 text-[17px] leading-relaxed text-black/75">{a}</p></motion.div>}</AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Contact() {
  return (
    <section id="contact" className="scroll-mt-16 border-t border-black/15">
      <div className="mx-auto grid max-w-[1440px] lg:grid-cols-2">
        <div className="px-4 py-20 md:px-8">
          <p className={`${MO} text-[13px] uppercase tracking-[.12em] text-black/60`}>06 — Контакты</p>
          <h2 className={`${H2} mt-4`}>Ресепшн</h2>
          <dl className="mt-10 grid gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2"><dt className={`${MO} text-[12.5px] uppercase text-black/55`}>Адрес</dt><dd className="mt-1 text-[24px] font-medium tracking-[-0.02em]">{b.place}, {b.addr}</dd></div>
            <div><dt className={`${MO} text-[12.5px] uppercase text-black/55`}>Телефон / Viber</dt><dd><a href={'tel:' + tel(b.phone)} className="mt-1 inline-block text-[24px] font-medium tracking-[-0.02em] text-[#2340ff] underline-offset-4 hover:underline">{b.phone}</a></dd></div>
            <div><dt className={`${MO} text-[12.5px] uppercase text-black/55`}>Часы работы</dt><dd className="mt-1 text-[17px]">Уточняйте по телефону</dd></div>
          </dl>
          <div className="mt-8 flex flex-wrap gap-2">
            <a href={'tel:' + tel(b.phone)} className="inline-flex h-14 items-center gap-2 rounded-md bg-[#2340ff] px-6 text-[16px] font-medium text-white"><Phone size={16} />Позвонить</a>
            <a href={b.viber} className="inline-flex h-14 items-center rounded-md border border-black/80 px-5 text-[16px] font-medium hover:bg-black hover:text-white">Viber</a>
            <a href={b.ig} target="_blank" rel="noopener" className="inline-flex h-14 items-center gap-2 rounded-md border border-black/80 px-5 text-[16px] font-medium hover:bg-black hover:text-white"><IG />Instagram</a>
            <a href={`https://yandex.ru/maps/org/${b.oid}/`} target="_blank" rel="noopener" className="inline-flex h-14 items-center gap-2 rounded-md border border-black/80 px-5 text-[16px] font-medium hover:bg-black hover:text-white">Маршрут <ArrowUpRight size={16} /></a>
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
      <div className="overflow-x-clip font-['Onest',sans-serif]" style={{ background: PAPER, color: INK, '--sel': BLUE, '--selc': '#fff' }}>
        <Ribbon name={b.name} bg={BLUE} fg="#fff" />
        <Header />
        <main>
          <Film lite={lite} />
          <Services />
          <Book />
          <How />
          <Rating />
          <Faq />
          <Contact />
        </main>
        <footer className={`${MO} flex flex-wrap justify-between gap-3 bg-[#0e0e0e] px-4 py-6 text-[12.5px] text-white/65 md:px-8`}><span>© 2026 {b.name} · Концепт сайта — Артём</span><span>{b.place}, {b.addr}</span></footer>
        <CallBar phone={b.phone} barCls="bg-[#f5f4f0] border-t border-black/15" callCls="rounded-md border border-black text-[#0e0e0e]" bookCls="rounded-md bg-[#2340ff] text-white" />
        <div className="h-[72px] bg-[#0e0e0e] sm:hidden" />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
