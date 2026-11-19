import React, { useRef, useState, useEffect, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useSpring, useInView, AnimatePresence, MotionConfig } from 'framer-motion'
import { ArrowRight, Phone, MapPin, Clock, Star, Plus, Minus, Check, Eye, Accessibility, Percent, TrainFront, Footprints, DoorOpen, Sun, Sparkles, WavesHorizontal, Wind, Droplets, MessageCircle } from 'lucide-react'
import '../lib/base.css'
import { useSmooth, Ribbon, Reveal, useBooking, phoneFocus, CheckDraw, MapFrame, CallBar, tel, useLite, IG } from '../lib/kit'

const SkinOrb = lazy(() => import('./elstudio3d'))

const b = {
  name: 'ELstudio', addr: 'просп. Дзержинского, 123', entr: 'подъезд 4', district: 'Малиновка', city: 'Минск',
  phone: '+375 44 700-07-49', ig: 'https://www.instagram.com/elstudio_minsk', igName: '@elstudio_minsk',
  viber: 'viber://chat?number=%2B375447000749', wa: 'https://wa.me/375447000749',
  rating: '5,0', rev: 139, revWord: 'оценок', oid: '63434160122',
}
const SERIF = "font-['Lora',serif]", SANS = "font-['Golos_Text',sans-serif]"
const THEME = {
  normal: { '--bg': '#f7f4ef', '--bg2': '#ede7de', '--card': '#fffdf9', '--ink': '#1c2422', '--mut': '#454f4b', '--acc': '#2f5d50', '--accH': '#244a40', '--accInk': '#ffffff', '--soft': '#dfe9e3', '--line': 'rgba(28,36,34,.16)', '--dark': '#1f3a33', '--darkInk': '#f7f4ef', '--darkMut': '#d5e2dc', '--focus': '#c2410c' },
  hc: { '--bg': '#ffffff', '--bg2': '#ffffff', '--card': '#ffffff', '--ink': '#000000', '--mut': '#000000', '--acc': '#000000', '--accH': '#1d3b8a', '--accInk': '#ffffff', '--soft': '#fff3a8', '--line': '#000000', '--dark': '#000000', '--darkInk': '#ffffff', '--darkMut': '#ffffff', '--focus': '#1d4ed8' },
}
const CSS = `
.e-bg{background:var(--bg)} .e-bg2{background:var(--bg2)} .e-card{background:var(--card);border:1px solid var(--line)}
.e-ink{color:var(--ink)} .e-mut{color:var(--mut)} .e-acc{color:var(--acc)} .e-soft{background:var(--soft)}
.e-btn{background:var(--acc);color:var(--accInk)} .e-btn:hover{background:var(--accH)}
.e-ghost{border:2px solid var(--ink);color:var(--ink)} .e-ghost:hover{background:var(--ink);color:var(--bg)}
.e-line{border-color:var(--line)} .e-dark{background:var(--dark);color:var(--darkInk)} .e-dmut{color:var(--darkMut)}
.e-on{background:var(--acc);color:var(--accInk);border-color:var(--acc)}
.elx :focus-visible{outline:3px solid var(--focus);outline-offset:3px}
[data-hc] .e-card{border-width:2px} [data-hc] .e-line{border-width:2px}
[data-hc] p a,[data-hc] li a{text-decoration:underline}
`
const go = id => { const el = document.querySelector(id); if (!el) return; window.__lenis ? window.__lenis.scrollTo(el, { offset: -80 }) : el.scrollIntoView({ behavior: 'smooth' }) }
const pick = svc => { window.dispatchEvent(new CustomEvent('el-svc', { detail: svc })); go('#book') }

function Kicker({ children, className = '' }) { return <p className={`${SANS} e-acc text-[0.9375rem] font-semibold uppercase tracking-[.12em] ${className}`}>{children}</p> }
function H2({ children, className = '' }) { return <h2 className={`${SERIF} text-[clamp(2.25rem,1.6rem+2.6vw,4rem)] font-medium leading-[1.08] tracking-[-0.01em] ${className}`}>{children}</h2> }

/* ---------------- a11y toggle ---------------- */
function A11yToggle({ on, set, compact }) {
  return (
    <button type="button" aria-pressed={on} onClick={() => set(!on)}
      className={`inline-flex min-h-[2.75rem] items-center gap-2 rounded-full border-2 px-3.5 text-[0.9375rem] font-semibold transition-colors ${on ? 'e-on' : 'e-ink border-[color:var(--ink)]'}`}>
      <Eye size={18} aria-hidden="true" />{compact ? <span>{on ? 'Обычная версия' : 'Крупный текст'}</span> : <span>{on ? 'Обычная версия' : 'Версия для слабовидящих'}</span>}
    </button>
  )
}

/* ---------------- hero ---------------- */
function Hero({ lite, hc }) {
  const ref = useRef(null)
  const near = useInView(ref, { margin: '100px 0px' })
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const sp = useSpring(scrollYProgress, { stiffness: 80, damping: 24 })
  const facts = [[TrainFront, '2 минуты от метро «Малиновка»'], [Accessibility, 'Пандус и парковка для людей с инвалидностью'], [Percent, 'Действует система скидок']]
  return (
    <section ref={ref} id="top" className="e-bg relative overflow-hidden px-5 pb-16 pt-10 md:px-10 md:pb-24 md:pt-16">
      <div className="mx-auto grid max-w-[80rem] items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="order-2 lg:order-1">
          <Kicker>Косметология и салон · Малиновка</Kicker>
          <h1 className={`${SERIF} e-ink mt-4 text-[clamp(2.6rem,1.6rem+4vw,5.4rem)] font-medium leading-[1.02] tracking-[-0.02em]`}>
            <motion.span className="block" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>Косметолог</motion.span>
            <motion.span className="e-acc block italic" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}>у метро Малиновка</motion.span>
          </h1>
          <p className="e-mut mt-6 max-w-[34rem] text-[1.1875rem] leading-relaxed">Фракционная мезотерапия, уход за кожей и биозавивка. Начинаем с консультации — без навязанных процедур.</p>
          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-[1.0625rem]">
            <span className="e-ink inline-flex items-center gap-2 font-semibold"><Star size={18} fill="#c99a3b" stroke="#a37a22" aria-hidden="true" />{b.rating} · {b.rev} {b.revWord} на Яндекс Картах</span>
            <span className="e-ink inline-flex items-center gap-2"><MapPin size={18} className="e-acc" aria-hidden="true" />{b.addr}, {b.entr}</span>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a href="#match" className="e-btn inline-flex min-h-[3.75rem] items-center justify-center gap-2 rounded-full px-8 text-[1.1875rem] font-semibold">Подобрать процедуру <ArrowRight size={20} aria-hidden="true" /></a>
            <a href={'tel:' + tel(b.phone)} className="e-ghost inline-flex min-h-[3.75rem] items-center justify-center gap-3 rounded-full px-7 text-[1.1875rem] font-semibold"><Phone size={19} aria-hidden="true" />{b.phone}</a>
          </div>
          <ul className="mt-9 grid gap-3 sm:grid-cols-3">
            {facts.map(([I, t]) => <li key={t} className="e-card flex items-start gap-3 rounded-2xl p-4 text-[1rem] font-medium leading-snug"><span className="e-soft e-acc grid h-9 w-9 shrink-0 place-items-center rounded-full"><I size={18} aria-hidden="true" /></span><span className="e-ink">{t}</span></li>)}
          </ul>
        </div>
        <div className="order-1 lg:order-2">
          <div className="relative mx-auto aspect-square w-full max-w-[13rem] sm:max-w-[26rem] lg:max-w-[34rem]">
            {!hc && <div aria-hidden="true" className="absolute inset-[6%] rounded-full" style={{ background: 'radial-gradient(circle at 40% 35%, #fbf1e8 0%, #ead3c2 55%, #d9bba6 100%)', boxShadow: '0 50px 90px -50px rgba(60,40,30,.55)' }} />}
            {hc && <div aria-hidden="true" className="absolute inset-[10%] rounded-full border-4 border-black" />}
            {!lite && !hc && near && <div className="absolute inset-0"><Suspense fallback={null}><SkinOrb progress={sp} active={near} /></Suspense></div>}
            <p className={`${SERIF} e-ink absolute bottom-1 hidden sm:block left-1/2 -translate-x-1/2 whitespace-nowrap text-[1.0625rem] italic`}>кожа — в центре внимания</p>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- concern matcher ---------------- */
const CONCERNS = [
  { k: 'Тусклая кожа', I: Sun, dir: ['Фракционная мезотерапия', 'Уходовые процедуры для лица'], note: 'Когда коже не хватает свежести и ровного тона, косметолог может предложить курс мезотерапии или уходовые процедуры — после осмотра кожи.' },
  { k: 'Морщины', I: WavesHorizontal, dir: ['Фракционная мезотерапия', 'Уход и рекомендации для дома'], note: 'Подход зависит от типа морщин и состояния кожи. На консультации косметолог объяснит, какой результат реально ожидать.' },
  { k: 'Пигментация', I: Droplets, dir: ['Подбор процедуры после осмотра', 'Домашний уход и защита от солнца'], note: 'Пигментация бывает разной природы, поэтому процедуру подбирают только после осмотра. Иногда специалист может порекомендовать сначала обратиться к дерматологу.' },
  { k: 'Выпадение волос', I: Wind, dir: ['Консультация: процедуры для кожи головы'], note: 'На консультации обсудим, подходят ли вам процедуры для кожи головы. Если выпадение сильное или внезапное, специалист порекомендует обратиться к врачу.' },
  { k: 'Хочу кудри', I: Sparkles, dir: ['Биозавивка'], note: 'Биозавивка помогает получить локоны или мягкую волну. Мастер оценит состояние волос и подскажет, какой вариант подойдёт.' },
]
function Match() {
  const [i, setI] = useState(-1)
  const C = CONCERNS[i]
  return (
    <section id="match" className="e-bg2 px-5 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-[80rem]">
        <Kicker>Подбор за 10 секунд</Kicker>
        <H2 className="e-ink mt-3">Что вас беспокоит?</H2>
        <p className="e-mut mt-4 max-w-[38rem] text-[1.125rem] leading-relaxed">Выберите один вариант — покажем, с чего обычно начинают. Это не диагноз: окончательное решение — после консультации косметолога.</p>
        <div className="mt-10 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div role="radiogroup" aria-label="Что вас беспокоит" className="grid gap-3 sm:grid-cols-2">
            {CONCERNS.map((c, j) => (
              <button key={c.k} type="button" role="radio" aria-checked={i === j} onClick={() => setI(j)}
                className={`flex min-h-[4.5rem] items-center gap-4 rounded-2xl border-2 px-5 text-left text-[1.1875rem] font-semibold transition-colors ${i === j ? 'e-on' : 'e-card e-ink hover:border-[color:var(--acc)]'} ${j === 4 ? 'sm:col-span-2' : ''}`}>
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${i === j ? 'bg-white/20' : 'e-soft e-acc'}`}><c.I size={20} aria-hidden="true" /></span>
                <span className="flex-1">{c.k}</span>
                {i === j && <Check size={20} aria-hidden="true" />}
              </button>
            ))}
          </div>
          <div className="e-card rounded-[1.75rem] p-6 md:p-9" aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              {C ? (
                <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                  <p className="e-acc text-[0.9375rem] font-semibold uppercase tracking-[.1em]">Шаг 1 — всегда</p>
                  <p className={`${SERIF} e-ink mt-1 text-[1.875rem] font-medium leading-tight`}>Консультация косметолога</p>
                  <p className="e-acc mt-6 text-[0.9375rem] font-semibold uppercase tracking-[.1em]">Возможные направления</p>
                  <ul className="mt-2 space-y-2">{C.dir.map(d => <li key={d} className="e-ink flex items-center gap-3 text-[1.1875rem] font-medium"><span className="e-soft e-acc grid h-7 w-7 place-items-center rounded-full"><Check size={15} aria-hidden="true" /></span>{d}</li>)}</ul>
                  <p className="e-mut mt-6 text-[1.0625rem] leading-relaxed">{C.note}</p>
                  <button type="button" onClick={() => pick(`Консультация: ${C.k.toLowerCase()}`)} className="e-btn mt-7 inline-flex min-h-[3.5rem] w-full items-center justify-center gap-2 rounded-full px-6 text-[1.125rem] font-semibold sm:w-auto">Записаться на консультацию <ArrowRight size={19} aria-hidden="true" /></button>
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex h-full min-h-[16rem] flex-col justify-center">
                  <p className={`${SERIF} e-ink text-[1.75rem] italic leading-snug`}>Выберите вариант слева —</p>
                  <p className="e-mut mt-2 text-[1.125rem]">здесь появится подсказка, с чего начать.</p>
                  <p className="e-mut mt-6 text-[1.0625rem]">Не нашли своё? <a href={'tel:' + tel(b.phone)} className="e-acc font-semibold underline underline-offset-4">Позвоните</a> — подскажем.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- services ---------------- */
const SVC = [
  { t: 'Консультация косметолога', d: 'Осмотр кожи, ответы на вопросы и план процедур.', time: 'уточним при записи' },
  { t: 'Фракционная мезотерапия', d: 'Курс процедур для кожи — подбирается после консультации.', time: 'зависит от зоны' },
  { t: 'Уход за лицом', d: 'Уходовые процедуры по типу и состоянию кожи.', time: 'обычно около часа' },
  { t: 'Биозавивка', d: 'Локоны или мягкая волна — с оценкой состояния волос.', time: 'зависит от длины' },
]
function Services() {
  return (
    <section id="services" className="e-bg px-5 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-[80rem]">
        <div className="grid gap-5 md:grid-cols-2 md:items-end">
          <div><Kicker>Услуги</Kicker><H2 className="e-ink mt-3">Чем мы занимаемся</H2></div>
          <p className="e-mut max-w-[30rem] text-[1.125rem] leading-relaxed md:justify-self-end">Стоимость зависит от процедуры и зоны — уточняйте по телефону. Постоянным клиентам — система скидок.</p>
        </div>
        <ul className="mt-12 grid gap-4 md:grid-cols-2">
          {SVC.map((s, i) => (
            <Reveal as="li" key={s.t} delay={i * 0.05} className="e-card flex flex-col rounded-[1.5rem] p-7">
              <span className={`${SERIF} e-acc text-[1.125rem] italic`}>0{i + 1}</span>
              <h3 className={`${SERIF} e-ink mt-2 text-[1.75rem] font-medium leading-tight`}>{s.t}</h3>
              <p className="e-mut mt-2 flex-1 text-[1.0625rem] leading-relaxed">{s.d}</p>
              <p className="e-mut mt-3 text-[0.9375rem] font-medium">{s.time} · цена — уточняйте</p>
              <button type="button" onClick={() => pick(s.t)} className="e-ghost mt-5 inline-flex min-h-[3.25rem] w-full items-center justify-center rounded-full px-6 text-[1.0625rem] font-semibold sm:w-fit">Записаться</button>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ---------------- route ---------------- */
function RouteMap({ hc }) {
  const ink = hc ? '#000' : '#1c2422', acc = hc ? '#000' : '#2f5d50'
  return (
    <svg viewBox="0 0 620 280" className="w-full" role="img" aria-label="Схема: от метро Малиновка около двух минут пешком до дома 123, вход в 4-й подъезд с пандусом">
      <rect x="14" y="14" width="592" height="252" rx="22" fill="none" stroke={ink} strokeOpacity={hc ? 1 : 0.15} strokeWidth={hc ? 2 : 1} />
      <circle cx="90" cy="178" r="36" fill={acc} />
      <text x="90" y="192" textAnchor="middle" fill="#fff" fontSize="40" fontWeight="700" fontFamily="Golos Text, sans-serif">М</text>
      <text x="90" y="240" textAnchor="middle" fill={ink} fontSize="17" fontWeight="600" fontFamily="Golos Text, sans-serif">Малиновка</text>
      <motion.path d="M130 178 C 220 178, 250 120, 340 120 S 430 150, 440 150" fill="none" stroke={acc} strokeWidth="4" strokeDasharray="2 10" strokeLinecap="round" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.8, ease: 'easeInOut' }} />
      <rect x="250" y="80" width="118" height="30" rx="15" fill={hc ? '#fff3a8' : '#dfe9e3'} />
      <text x="309" y="101" textAnchor="middle" fill={ink} fontSize="16" fontWeight="600" fontFamily="Golos Text, sans-serif">≈ 2 минуты</text>
      <rect x="440" y="58" width="146" height="150" rx="8" fill={hc ? '#fff' : '#fffdf9'} stroke={ink} strokeWidth="2" />
      <text x="513" y="48" textAnchor="middle" fill={ink} fontSize="15" fontWeight="600" fontFamily="Golos Text, sans-serif">Дзержинского, 123</text>
      {[0, 1, 2, 3].map(k => (
        <g key={k}>
          <rect x={452 + k * 33} y="168" width="24" height="40" rx="3" fill={k === 3 ? acc : 'none'} stroke={ink} strokeWidth="1.5" strokeOpacity={k === 3 ? 1 : 0.45} />
          <text x={464 + k * 33} y="160" textAnchor="middle" fill={ink} fontSize="14" fontWeight={k === 3 ? 700 : 400} fillOpacity={k === 3 ? 1 : 0.6} fontFamily="Golos Text, sans-serif">{k + 1}</text>
        </g>
      ))}
      <path d="M548 208 L600 226" stroke={acc} strokeWidth="5" strokeLinecap="round" />
      <text x="586" y="252" textAnchor="end" fill={ink} fontSize="14" fontFamily="Golos Text, sans-serif">пандус</text>
      <text x="30" y="40" fill={ink} fillOpacity=".6" fontSize="13" fontFamily="Golos Text, sans-serif">схема условная</text>
    </svg>
  )
}
function Route({ hc }) {
  const steps = [[TrainFront, 'Метро «Малиновка»', 'Выходите из метро — студия в паре минут пешком.'], [Footprints, 'Около 2 минут', `Идёте к дому ${b.addr.replace('просп. ', 'на проспекте ')}.`], [DoorOpen, 'Вход в 4-й подъезд', 'Ищите подъезд №4. Есть пандус.'], [Accessibility, 'Парковка', 'Есть парковка для людей с инвалидностью. Нужна помощь при входе — скажите при записи.']]
  return (
    <section id="route" className="e-bg2 px-5 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-[80rem]">
        <Kicker>Как добраться</Kicker>
        <H2 className="e-ink mt-3">От метро — 2 минуты, вход в 4-й подъезд</H2>
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="e-card rounded-[1.75rem] p-3 md:p-5"><RouteMap hc={hc} /></div>
          <ol className="space-y-4">
            {steps.map(([I, t, d], i) => (
              <Reveal as="li" key={t} delay={i * 0.06} className="flex gap-4">
                <span className="e-btn grid h-12 w-12 shrink-0 place-items-center rounded-full"><I size={22} aria-hidden="true" /></span>
                <div><p className="e-ink text-[1.25rem] font-semibold">{i + 1}. {t}</p><p className="e-mut mt-1 text-[1.0625rem] leading-relaxed">{d}</p></div>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

/* ---------------- how ---------------- */
function How() {
  const st = [['Запись', 'По телефону, в Viber, WhatsApp или через сайт.'], ['Консультация', 'Косметолог осмотрит кожу или волосы и ответит на вопросы.'], ['План', 'Обсуждаем направление, количество визитов и уход дома.'], ['Процедура', 'В спокойной обстановке, в назначенное время.']]
  return (
    <section id="how" className="e-dark px-5 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-[80rem]">
        <p className={`${SANS} text-[0.9375rem] font-semibold uppercase tracking-[.12em] e-dmut`}>Как это работает</p>
        <H2 className="mt-3">Четыре шага — без спешки</H2>
        <ol className="mt-12 grid gap-8 md:grid-cols-4">
          {st.map(([t, d], i) => (
            <Reveal as="li" key={t} delay={i * 0.08} className="border-t-2 border-current pt-5">
              <span className={`${SERIF} text-[3rem] italic leading-none`}>{i + 1}</span>
              <h3 className={`${SERIF} mt-3 text-[1.625rem] font-medium`}>{t}</h3>
              <p className="e-dmut mt-2 text-[1.0625rem] leading-relaxed">{d}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}

/* ---------------- booking ---------------- */
const B_SVC = SVC.map(s => s.t)
const CONTACT = ['Звонок', 'Viber', 'WhatsApp']
function Book() {
  const bk = useBooking()
  const [step, setStep] = useState(0), [via, setVia] = useState('Звонок'), [help, setHelp] = useState(false), [err, setErr] = useState('')
  const head = useRef(null)
  useEffect(() => { if (step) head.current?.focus() }, [step])
  useEffect(() => { const h = e => { bk.upd('svc', e.detail); setStep(0); setErr('') }; window.addEventListener('el-svc', h); return () => window.removeEventListener('el-svc', h) }, [])
  const custom = bk.s.svc && !B_SVC.includes(bk.s.svc)
  const next = e => {
    e.preventDefault()
    if (step === 0) { if (!bk.s.svc) return setErr('Выберите, что вас интересует'); setErr(''); return setStep(1) }
    bk.submit()
  }
  const inp = 'e-ink mt-2 min-h-[3.75rem] w-full rounded-2xl border-2 bg-[color:var(--card)] px-5 text-[1.125rem] outline-none focus:border-[color:var(--acc)]'
  return (
    <section id="book" className="e-bg px-5 py-20 md:px-10 md:py-28">
      <div className="mx-auto grid max-w-[80rem] gap-10 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <Kicker>Запись</Kicker>
          <H2 className="e-ink mt-3">Записаться на консультацию</H2>
          <p className="e-mut mt-5 max-w-[28rem] text-[1.1875rem] leading-relaxed">Два шага — и мы свяжемся удобным для вас способом. Или напишите сами:</p>
          <div className="mt-7 flex flex-col gap-3">
            <a href={'tel:' + tel(b.phone)} className="e-btn inline-flex min-h-[3.75rem] items-center gap-3 rounded-full px-7 text-[1.25rem] font-semibold sm:w-fit"><Phone size={20} aria-hidden="true" />{b.phone}</a>
            <div className="flex flex-wrap gap-3">
              <a href={b.viber} className="e-ghost inline-flex min-h-[3.25rem] items-center gap-2 rounded-full px-6 text-[1.0625rem] font-semibold"><MessageCircle size={18} aria-hidden="true" />Viber</a>
              <a href={b.wa} target="_blank" rel="noopener" className="e-ghost inline-flex min-h-[3.25rem] items-center gap-2 rounded-full px-6 text-[1.0625rem] font-semibold"><MessageCircle size={18} aria-hidden="true" />WhatsApp</a>
            </div>
          </div>
        </div>
        <div className="e-card rounded-[1.75rem] p-6 md:p-10">
          {bk.s.sent ? (
            <div className="py-8 text-center" role="status">
              <CheckDraw className="e-acc mx-auto" size={84} />
              <p className={`${SERIF} e-ink mt-6 text-[2.25rem] font-medium`}>Спасибо!</p>
              <p className="e-mut mx-auto mt-3 max-w-[26rem] text-[1.125rem] leading-relaxed">Мы свяжемся с вами ({via.toLowerCase()}) и подберём время. В готовом сайте заявка сразу придёт вам в Telegram.</p>
              <button type="button" onClick={() => { bk.reset(); setStep(0); setHelp(false) }} className="e-ink mt-8 min-h-[3rem] text-[1.0625rem] font-semibold underline underline-offset-4">Новая заявка</button>
            </div>
          ) : (
            <form onSubmit={next} noValidate>
              <div className="flex gap-2" aria-hidden="true">{[0, 1].map(i => <span key={i} className="h-2 flex-1 rounded-full" style={{ background: i <= step ? 'var(--acc)' : 'var(--line)' }} />)}</div>
              <p className="e-acc mt-4 text-[1rem] font-semibold">Шаг {step + 1} из 2</p>
              <h3 ref={head} tabIndex={-1} className={`${SERIF} e-ink mb-6 mt-1 text-[1.875rem] font-medium outline-none`}>{step === 0 ? 'Что вас интересует?' : 'Как с вами связаться?'}</h3>
              {step === 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {custom && <button type="button" aria-pressed="true" className="e-on min-h-[4rem] rounded-2xl border-2 px-5 text-left text-[1.125rem] font-semibold sm:col-span-2">{bk.s.svc}</button>}
                  {B_SVC.map(s => <button key={s} type="button" aria-pressed={bk.s.svc === s} onClick={() => { bk.upd('svc', s); setErr('') }} className={`min-h-[4rem] rounded-2xl border-2 px-5 text-left text-[1.125rem] font-semibold ${bk.s.svc === s ? 'e-on' : 'e-ink e-line bg-[color:var(--card)] hover:border-[color:var(--acc)]'}`}>{s}</button>)}
                </div>
              ) : (
                <div className="space-y-5">
                  <div><label htmlFor="el-name" className="e-ink text-[1.0625rem] font-semibold">Как к вам обращаться</label>
                    <input id="el-name" value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} autoComplete="name" className={inp + ' e-line'} /></div>
                  <div><label htmlFor="el-phone" className="e-ink text-[1.0625rem] font-semibold">Телефон</label>
                    <input id="el-phone" value={bk.s.phone} onChange={e => bk.upd('phone', e.target.value)} onFocus={phoneFocus(bk)} type="tel" inputMode="tel" autoComplete="tel" placeholder="+375 __ ___-__-__" aria-invalid={bk.s.err} aria-describedby={bk.s.err ? 'el-perr' : undefined}
                      className={`${inp} ${bk.s.err ? 'border-[#b42318]' : 'e-line'}`} /></div>
                  {bk.s.err && <p id="el-perr" className="text-[1rem] font-semibold text-[#b42318]">Проверьте номер: 12 цифр, начиная с +375.</p>}
                  <fieldset><legend className="e-ink text-[1.0625rem] font-semibold">Удобный способ связи</legend>
                    <div className="mt-2 grid grid-cols-3 gap-2">{CONTACT.map(c => <button key={c} type="button" aria-pressed={via === c} onClick={() => setVia(c)} className={`min-h-[3.25rem] rounded-xl border-2 text-[1rem] font-semibold ${via === c ? 'e-on' : 'e-ink e-line'}`}>{c}</button>)}</div>
                  </fieldset>
                  <label className="e-ink flex min-h-[3rem] cursor-pointer items-center gap-3 text-[1.0625rem]">
                    <input type="checkbox" checked={help} onChange={e => setHelp(e.target.checked)} className="h-6 w-6 accent-[#2f5d50]" />Нужна помощь при входе / место на парковке
                  </label>
                  <p className="e-soft e-ink rounded-2xl p-4 text-[1rem]">{bk.s.svc}</p>
                </div>
              )}
              {err && <p className="mt-4 text-[1rem] font-semibold text-[#b42318]" role="alert">{err}</p>}
              <div className="mt-8 flex items-center justify-between gap-4">
                {step > 0 ? <button type="button" onClick={() => setStep(0)} className="e-mut min-h-[3.5rem] px-2 text-[1.0625rem] font-semibold">← Назад</button> : <span />}
                <button type="submit" disabled={bk.s.loading} className="e-btn inline-flex min-h-[3.75rem] items-center gap-2 rounded-full px-8 text-[1.125rem] font-semibold disabled:opacity-60">{step === 0 ? 'Дальше' : bk.s.loading ? 'Отправляем…' : 'Отправить заявку'} <ArrowRight size={19} aria-hidden="true" /></button>
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
  return (
    <section id="reviews" className="e-bg2 px-5 py-20 md:px-10 md:py-28">
      <div className="mx-auto grid max-w-[80rem] gap-10 md:grid-cols-2 md:items-center">
        <div>
          <Kicker>Отзывы</Kicker>
          <p className={`${SERIF} e-ink mt-3 text-[clamp(6rem,4rem+8vw,11rem)] font-medium leading-[.9]`}>{b.rating}</p>
          <div className="mt-3 flex gap-1" aria-hidden="true">{[0, 1, 2, 3, 4].map(i => <Star key={i} size={26} fill="#c99a3b" stroke="#a37a22" />)}</div>
          <p className="e-ink mt-4 text-[1.25rem]">{b.rev} {b.revWord} на Яндекс Картах</p>
          <a href={`https://yandex.by/maps/org/${b.oid}/reviews/`} target="_blank" rel="noopener" className="e-ghost mt-6 inline-flex min-h-[3.5rem] items-center gap-2 rounded-full px-6 text-[1.0625rem] font-semibold">Читать отзывы <ArrowRight size={18} aria-hidden="true" /></a>
        </div>
        <ul className="grid gap-4">
          {[[Accessibility, 'Доступная среда', 'Пандус и парковка для людей с инвалидностью.'], [Percent, 'Система скидок', 'Подробности — у администратора по телефону.'], [TrainFront, 'Рядом с метро', 'Малиновка — пара минут пешком.']].map(([I, t, d], i) => (
            <Reveal as="li" key={t} delay={i * 0.07} className="e-card flex gap-4 rounded-[1.5rem] p-6">
              <span className="e-soft e-acc grid h-12 w-12 shrink-0 place-items-center rounded-full"><I size={22} aria-hidden="true" /></span>
              <div><h3 className={`${SERIF} e-ink text-[1.5rem] font-medium`}>{t}</h3><p className="e-mut mt-1 text-[1.0625rem]">{d}</p></div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ---------------- faq ---------------- */
const FAQ = [
  ['Обязательна ли консультация?', 'Перед процедурами мы рекомендуем консультацию: косметолог оценит кожу или волосы и предложит подходящее направление.'],
  ['Можно ли подъехать на машине?', 'Да, рядом есть парковка, в том числе места для людей с инвалидностью. Если нужна помощь при входе — скажите при записи.'],
  ['Как найти вход?', `Дом ${b.addr}, вход в 4-й подъезд. У подъезда есть пандус. От метро «Малиновка» — около двух минут пешком.`],
  ['Сколько длится процедура?', 'Зависит от процедуры и зоны. Ориентировочное время подскажем при записи.'],
  ['Есть ли скидки?', 'Да, действует система скидок. Условия уточняйте по телефону.'],
  ['Как оплатить?', 'Способы оплаты уточняйте у администратора.'],
]
function Faq() {
  const [open, setOpen] = useState(0)
  return (
    <section id="faq" className="e-bg px-5 py-20 md:px-10 md:py-28">
      <div className="mx-auto grid max-w-[80rem] gap-10 md:grid-cols-[0.8fr_1.2fr]">
        <div><Kicker>Вопросы</Kicker><H2 className="e-ink mt-3">Частые вопросы</H2></div>
        <div className="e-line border-t-2">
          {FAQ.map(([q, a], i) => (
            <div key={q} className="e-line border-b-2">
              <h3>
                <button type="button" aria-expanded={open === i} aria-controls={'elf-' + i} onClick={() => setOpen(open === i ? -1 : i)} className="e-ink flex min-h-[4.5rem] w-full items-center justify-between gap-4 py-4 text-left text-[1.25rem] font-semibold">
                  {q}<span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 ${open === i ? 'e-on' : 'e-line'}`}>{open === i ? <Minus size={18} aria-hidden="true" /> : <Plus size={18} aria-hidden="true" />}</span>
                </button>
              </h3>
              <AnimatePresence initial={false}>
                {open === i && <motion.div id={'elf-' + i} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden"><p className="e-mut pb-6 text-[1.125rem] leading-relaxed">{a}</p></motion.div>}
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
    <section id="contact" className="e-bg2 px-5 py-20 md:px-10 md:py-28">
      <div className="mx-auto grid max-w-[80rem] gap-10 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <Kicker>Контакты</Kicker>
          <H2 className="e-ink mt-3">Ждём вас на Малиновке</H2>
          <ul className="e-ink mt-8 space-y-5 text-[1.1875rem]">
            <li className="flex items-start gap-3"><MapPin className="e-acc mt-1 shrink-0" size={22} aria-hidden="true" /><span>{b.addr}, <b className="font-semibold">{b.entr}</b><br /><span className="e-mut">{b.district}, {b.city} · 2 минуты от метро</span></span></li>
            <li className="flex items-start gap-3"><Accessibility className="e-acc mt-1 shrink-0" size={22} aria-hidden="true" />Пандус, парковка для людей с инвалидностью</li>
            <li className="flex items-start gap-3"><Clock className="e-acc mt-1 shrink-0" size={22} aria-hidden="true" />Часы работы — уточняйте по телефону</li>
            <li><a href={'tel:' + tel(b.phone)} className="flex items-center gap-3 text-[1.75rem] font-semibold"><Phone size={22} className="e-acc" aria-hidden="true" />{b.phone}</a></li>
            <li className="flex flex-wrap gap-x-6 gap-y-2">
              <a href={b.viber} className="font-semibold underline underline-offset-4">Viber</a>
              <a href={b.wa} target="_blank" rel="noopener" className="font-semibold underline underline-offset-4">WhatsApp</a>
              <a href={b.ig} target="_blank" rel="noopener" className="inline-flex items-center gap-2 font-semibold underline underline-offset-4"><IG width="20" height="20" aria-hidden="true" />{b.igName}</a>
            </li>
          </ul>
        </div>
        <div className="e-card min-h-[23rem] overflow-hidden rounded-[1.75rem] lg:min-h-[32rem]"><MapFrame oid={b.oid} /></div>
      </div>
    </section>
  )
}

/* ---------------- header ---------------- */
const NAV = [['#services', 'Услуги'], ['#match', 'Подбор'], ['#route', 'Как добраться'], ['#reviews', 'Отзывы'], ['#contact', 'Контакты']]
function useActive() {
  const [a, setA] = useState('')
  useEffect(() => {
    const els = ['#match', '#services', '#route', '#how', '#book', '#reviews', '#faq', '#contact'].map(h => document.querySelector(h)).filter(Boolean)
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) setA('#' + e.target.id) }), { rootMargin: '-45% 0px -50% 0px' })
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])
  return a === '#how' || a === '#book' ? '#route' : a === '#faq' ? '#reviews' : a
}
function Header({ hc, setHc }) {
  const active = useActive()
  return (
    <header className="e-bg e-line sticky top-0 z-50 border-b">
      <div className="mx-auto flex min-h-[4.5rem] max-w-[86rem] items-center justify-between gap-3 px-4 py-2 md:px-10">
        <a href="#top" className="min-w-0 leading-none" aria-label="ELstudio — наверх">
          <span className={`${SERIF} e-ink block text-[1.625rem] font-medium tracking-[-0.01em]`}>EL<span className="e-acc italic">studio</span></span>
          <span className="e-mut mt-1 block truncate text-[0.8125rem] font-semibold uppercase tracking-[.1em]">Малиновка</span>
        </a>
        <nav className="hidden items-center gap-1 xl:flex" aria-label="Разделы">
          {NAV.map(([h, t]) => <a key={h} href={h} aria-current={active === h ? 'true' : undefined} className={`rounded-full px-4 py-2 text-[1rem] font-medium ${active === h ? 'e-on' : 'e-ink hover:bg-[color:var(--bg2)]'}`}>{t}</a>)}
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden md:inline-flex"><A11yToggle on={hc} set={setHc} /></span>
          <span className="md:hidden"><A11yToggle on={hc} set={setHc} compact /></span>
          <a href="#book" className="e-btn hidden min-h-[2.75rem] items-center rounded-full px-5 text-[1rem] font-semibold lg:inline-flex">Записаться</a>
        </div>
      </div>
    </header>
  )
}

function App() {
  useSmooth()
  const lite = useLite()
  const [hc, setHc] = useState(() => { try { return localStorage.getItem('el-a11y') === '1' } catch (e) { return false } })
  useEffect(() => {
    document.documentElement.style.fontSize = hc ? '20px' : ''
    document.body.style.background = hc ? '#ffffff' : '#f7f4ef'
    try { localStorage.setItem('el-a11y', hc ? '1' : '0') } catch (e) {}
  }, [hc])
  return (
    <MotionConfig reducedMotion={hc ? 'always' : 'user'}>
      <style>{CSS}</style>
      <div data-hc={hc ? '' : undefined} className={`elx ${SANS} e-bg e-ink text-[1.125rem]`} style={{ ...THEME[hc ? 'hc' : 'normal'], '--sel': '#2f5d50', '--selc': '#fff' }}>
        <Ribbon name={b.name} bg={hc ? '#000' : '#1f3a33'} fg="#ffffff" />
        <Header hc={hc} setHc={setHc} />
        <main>
          <Hero lite={lite} hc={hc} />
          <Match />
          <Services />
          <Route hc={hc} />
          <How />
          <Book />
          <Rating />
          <Faq />
          <Contact />
        </main>
        <footer className="e-dark px-5 py-10 text-[1rem] md:px-10">
          <div className="e-dmut mx-auto flex max-w-[80rem] flex-wrap justify-between gap-4"><span>© 2026 {b.name} · Концепт сайта — Артём</span><span>{b.addr}, {b.entr}, {b.city}</span></div>
        </footer>
        <CallBar phone={b.phone} barCls="e-bg border-t border-[color:var(--line)]" callCls="rounded-full e-ghost text-[18px]" bookCls="rounded-full e-btn text-[18px]" />
        <div className="e-dark h-[76px] sm:hidden" />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
