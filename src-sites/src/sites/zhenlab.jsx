import React, { useRef, useState, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, useSpring, useInView, AnimatePresence, MotionConfig } from 'framer-motion'
import { ArrowUpRight, Phone, MapPin, Star, ArrowRight, ArrowLeft, Check } from 'lucide-react'
import '../lib/base.css'
import { useSmooth, Ribbon, LineReveal, Reveal, useBooking, phoneFocus, CheckDraw, MapFrame, CallBar, tel, useLite, IG } from '../lib/kit'

const LabFilm = lazy(() => import('./zhenlab3d'))

const b = {
  name: 'ЖенЛаб', addr: 'просп. Дзержинского, 32', city: 'Минск',
  phone: '+375 33 370-75-75', viber: 'https://viber.click/375333707575',
  ig: 'https://www.instagram.com/zhen_lab', rating: '5,0', rev: 86, oid: '118158808362',
}
const BG = '#fbfaf8', INK = '#16191d', WARM = '#e07a4f', BLUSH = '#f5e7e0'
const MONO = "font-['IBM_Plex_Mono',monospace]"
const H = 'font-light tracking-[-.055em]'

/* ---------- pinned film: lab -> drop -> skin ---------- */
const CH = [
  { a: 0.11, e: 0.33, k: 'Шаг 0 · Протокол', t: 'Одна капля — точный расчёт', d: 'Средства и процедуры подбираем под вашу кожу, а не наоборот.' },
  { a: 0.36, e: 0.5, k: 'Слой 01 · Поверхность', t: 'Очищение', d: 'Убираем лишнее бережно — не нарушая защитный барьер.' },
  { a: 0.5, e: 0.66, k: 'Слой 02 · Эпидермис', t: 'Увлажнение', d: 'Возвращаем коже воду и комфорт — она перестаёт «тянуть».' },
  { a: 0.66, e: 0.82, k: 'Слой 03 · Дерма', t: 'Тонус', d: 'Уход и массаж поддерживают кожу там, где держится её каркас.' },
  { a: 0.82, e: 1.01, k: 'Слой 04 · Глубже', t: 'Микроциркуляция', d: 'Массаж помогает коже выглядеть отдохнувшей и свежей.' },
]
function Cap({ p, c }) {
  const o = useTransform(p, [c.a, c.a + 0.025, c.e - 0.025, c.e], [0, 1, 1, c.e > 1 ? 1 : 0])
  const y = useTransform(p, [c.a, c.a + 0.04], [28, 0])
  return (
    <motion.div style={{ opacity: o, y }} className="absolute inset-x-0 bottom-0">
      <p className={`${MONO} text-[11.5px] uppercase tracking-[.16em] text-[#e07a4f]`}>{c.k}</p>
      <h3 className={`${H} mt-2 text-[clamp(34px,4.6vw,68px)] leading-[.95]`}>{c.t}</h3>
      <p className="mt-3 max-w-[380px] text-[16px] leading-snug text-[#16191d]/60">{c.d}</p>
    </motion.div>
  )
}
function HeroCap({ p }) {
  const o = useTransform(p, [0, 0.06, 0.09], [1, 1, 0])
  const pe = useTransform(o, v => (v > 0.4 ? 'auto' : 'none'))
  const y = useTransform(p, [0, 0.09], [0, -40])
  return (
    <motion.div style={{ opacity: o, y, pointerEvents: pe }} className="absolute inset-x-0 bottom-0">
      <p className={`${MONO} mb-5 flex items-center gap-3 text-[11.5px] uppercase tracking-[.16em] text-[#16191d]/55`}><span className="h-2 w-2 rounded-full bg-[#e07a4f]" />Косметология · массаж · Минск</p>
      <h1 className={`${H} text-[clamp(44px,6.6vw,108px)] leading-[.9]`}>
        <LineReveal delay={0.15}>Точность</LineReveal>
        <LineReveal delay={0.25}>лаборатории.</LineReveal>
        <LineReveal delay={0.35} className="text-[#e07a4f]">Тепло рук.</LineReveal>
      </h1>
      <p className="mt-6 max-w-[420px] text-[17px] leading-relaxed text-[#16191d]/60">ЖенЛаб — кабинет косметологии и массажа на Дзержинского, 32. Сначала разбираемся в коже, потом действуем.</p>
      <div className="mt-7 flex flex-wrap items-center gap-3">
        <a href="#quiz" className="inline-flex h-14 items-center gap-3 rounded-full bg-[#16191d] px-7 text-[15px] font-semibold text-white hover:bg-black">Подобрать уход <ArrowRight size={17} /></a>
        <span className="flex items-center gap-2 px-2 text-[14px] text-[#16191d]/60"><span className="flex text-[#e07a4f]">{[0, 1, 2, 3, 4].map(k => <Star key={k} size={14} fill="currentColor" strokeWidth={0} />)}</span><b className="font-semibold text-[#16191d]">{b.rating}</b> · {b.rev} оценок на Яндекс Картах</span>
      </div>
    </motion.div>
  )
}
const DEPTH = ['Поверхность', 'Эпидермис', 'Дерма', 'Глубже']
function Depth({ p }) {
  const y = useTransform(p, [0.34, 0.5, 0.66, 0.82, 1], ['0%', '33%', '66%', '100%', '100%'])
  const o = useTransform(p, [0.3, 0.36], [0, 1])
  return (
    <motion.div style={{ opacity: o }} className="flex gap-4">
      <div className="relative w-px bg-[#16191d]/15"><motion.span style={{ top: y }} className="absolute -left-[5px] h-[11px] w-[11px] -translate-y-1/2 rounded-full border-2 border-[#e07a4f] bg-white" /></div>
      <ul className={`${MONO} flex h-[180px] flex-col justify-between text-[11px] uppercase tracking-[.14em] text-[#16191d]/55`}>{DEPTH.map(d => <li key={d} className="-my-1.5">{d}</li>)}</ul>
    </motion.div>
  )
}
function LiteLab({ p }) {
  const y = useTransform(p, [0.1, 0.35], ['0vh', '60vh'])
  const bg = useTransform(p, [0.3, 1], ['linear-gradient(#fbfaf8,#fbfaf8)', 'linear-gradient(#f2d6c8 0%, #f7e5dd 30%, #fbf0e0 100%)'])
  return (
    <motion.div style={{ background: bg }} className="absolute inset-0">
      <div className="absolute right-[16%] top-[22%] h-[30vh] w-[12vh] rounded-[30%_30%_12px_12px] border border-[#16191d]/15 bg-gradient-to-t from-[#f0b48b] from-50% to-white/30 to-50%" />
      <motion.div style={{ y }} className="absolute right-[19%] top-[18%] h-5 w-4 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] bg-[#f0b48b]" />
    </motion.div>
  )
}
function Film({ lite }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.6 })
  const near = useInView(ref, { margin: '300px 0px 300px 0px' })
  const bg = useTransform(p, [0.3, 0.45], [BG, BLUSH])
  return (
    <motion.section ref={ref} id="top" style={{ background: bg }} className="relative h-[720vh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="absolute inset-0">{!lite ? (near && <Suspense fallback={null}><LabFilm progress={p} active={near} /></Suspense>) : <LiteLab p={p} />}</div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-white/80 to-transparent md:inset-y-0 md:left-0 md:h-full md:w-[55%] md:bg-gradient-to-r md:from-white/70" />
        <div className="pointer-events-none relative mx-auto flex h-full max-w-[1400px] flex-col justify-end px-5 pb-32 pt-20 md:px-10 md:pb-28">
          <div className="absolute right-5 top-24 hidden md:right-10 md:block"><Depth p={p} /></div>
          <div className="relative h-[400px] md:h-[470px] md:max-w-[620px]">
            <HeroCap p={p} />
            {CH.map((c, i) => <Cap key={i} p={p} c={c} />)}
          </div>
        </div>
      </div>
    </motion.section>
  )
}

/* ---------- value: care finder ---------- */
const Q = [
  { k: 'skin', q: 'Какая у вас кожа?', o: ['Сухая', 'Нормальная', 'Комбинированная', 'Жирная', 'Чувствительная'] },
  { k: 'goal', q: 'Что хочется изменить?', o: ['Увлажнение', 'Тонус', 'Пигментация', 'Акне'] },
  { k: 'when', q: 'Когда событие?', o: ['Через неделю', 'Через месяц', 'Без повода — для себя'] },
]
const DIR = {
  'Увлажнение': ['Увлажняющий уход', 'Процедуры, которые возвращают коже воду и восстанавливают барьер.'],
  'Тонус': ['Массаж лица и лифтинг-уход', 'Работа с тонусом и чёткостью контуров — руками и уходовыми средствами.'],
  'Пигментация': ['Программа выравнивания тона', 'Курс процедур и домашний уход для более ровного цвета лица.'],
  'Акне': ['Чистка и уход для проблемной кожи', 'Очищение, успокоение и протокол, который не пересушивает кожу.'],
}
const SKIN = { 'Сухая': 'Акцент на питании и липидном слое.', 'Нормальная': 'Задача — сохранить баланс.', 'Комбинированная': 'Разный подход к Т-зоне и щекам.', 'Жирная': 'Акцент на балансе и очищении пор.', 'Чувствительная': 'Только мягкие протоколы, без агрессивных воздействий.' }
const WHEN = { 'Через неделю': 'К событию — мягкие процедуры без периода восстановления. Курсовые начнём после.', 'Через месяц': 'Успеем пройти несколько процедур курсом к нужной дате.', 'Без повода — для себя': 'Спокойно выстроим курс и домашний уход.' }
function Option({ on, children, onClick }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on}
      className={`flex h-14 items-center justify-between rounded-full border px-6 text-left text-[16px] transition-all ${on ? 'border-[#16191d] bg-[#16191d] text-white' : 'border-[#16191d]/15 bg-white hover:border-[#16191d]/50'}`}>
      {children}<span className={`grid h-6 w-6 place-items-center rounded-full ${on ? 'bg-[#e07a4f]' : 'border border-[#16191d]/20'}`}>{on && <Check size={13} />}</span>
    </button>
  )
}
function Quiz() {
  const [a, setA] = useState({})
  const [i, setI] = useState(0)
  const done = Object.keys(a).length === 3
  const pick = v => { const k = Q[i].k; setA(s => ({ ...s, [k]: v })); if (i < 2) setTimeout(() => setI(i + 1), 260) }
  const dir = a.goal ? DIR[a.goal] : null
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 15%'] })
  const clip = useTransform(scrollYProgress, v => `inset(${(1 - v) * 8}% ${(1 - v) * 6}% 0% ${(1 - v) * 6}% round ${(1 - v) * 48}px)`)
  return (
    <motion.section ref={ref} id="quiz" style={{ clipPath: clip }} className="relative bg-white px-5 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-[1400px]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className={`${MONO} text-[11.5px] uppercase tracking-[.16em] text-[#e07a4f]`}>Подбор ухода · 3 вопроса</p>
            <h2 className={`${H} mt-3 text-[clamp(40px,6vw,96px)] leading-[.92]`}><LineReveal>Расскажите о коже —</LineReveal><LineReveal delay={0.08} className="text-[#16191d]/40">мы предложим направление</LineReveal></h2>
          </div>
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-[1.15fr_1fr]">
          <div className="rounded-[28px] border border-[#16191d]/10 bg-[#fbfaf8] p-6 md:p-10">
            <div className="mb-8 flex items-center justify-between">
              <div className="flex gap-1.5">{Q.map((q, j) => <button key={q.k} type="button" onClick={() => setI(j)} aria-label={`Вопрос ${j + 1}`} className={`h-1.5 rounded-full transition-all ${j === i ? 'w-10 bg-[#16191d]' : a[q.k] ? 'w-5 bg-[#e07a4f]' : 'w-5 bg-[#16191d]/15'}`} />)}</div>
              <span className={`${MONO} text-[12px] text-[#16191d]/50`}>0{i + 1} / 03</span>
            </div>
            <AnimatePresence mode="wait">
              <motion.fieldset key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}>
                <legend className={`${H} mb-6 text-[clamp(28px,3vw,40px)] leading-tight`}>{Q[i].q}</legend>
                <div className="grid gap-2 sm:grid-cols-2">{Q[i].o.map(o => <Option key={o} on={a[Q[i].k] === o} onClick={() => pick(o)}>{o}</Option>)}</div>
              </motion.fieldset>
            </AnimatePresence>
            {i > 0 && <button type="button" onClick={() => setI(i - 1)} className="mt-6 inline-flex items-center gap-2 text-[14px] text-[#16191d]/55 hover:text-[#16191d]"><ArrowLeft size={15} />Назад</button>}
          </div>
          <div className="relative overflow-hidden rounded-[28px] bg-[#16191d] p-6 text-white md:p-10">
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#e07a4f]/30 blur-3xl" />
            <p className={`${MONO} text-[11.5px] uppercase tracking-[.16em] text-white/45`}>Протокол подбора</p>
            <dl className={`${MONO} mt-5 grid gap-2 text-[13px]`}>
              {Q.map(q => <div key={q.k} className="flex justify-between gap-4 border-b border-white/10 pb-2"><dt className="text-white/45">{q.q.replace('?', '')}</dt><dd className="text-right">{a[q.k] || '—'}</dd></div>)}
            </dl>
            <AnimatePresence mode="wait">
              {done ? (
                <motion.div key={a.goal + a.skin + a.when} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="relative mt-8">
                  <p className={`${MONO} text-[11.5px] uppercase tracking-[.16em] text-[#e07a4f]`}>Направление</p>
                  <h3 className={`${H} mt-2 text-[clamp(30px,3.2vw,46px)] leading-[1]`}>{dir[0]}</h3>
                  <p className="mt-3 text-[15px] text-white/70">{dir[1]} {SKIN[a.skin]}</p>
                  <p className="mt-3 border-l-2 border-[#e07a4f] pl-3 text-[14px] text-white/60">{WHEN[a.when]}</p>
                  <p className="mt-5 text-[13px] text-white/45">Это ориентир, не назначение. Точный протокол косметолог составит на консультации.</p>
                  <a href="#book" data-svc={`Консультация косметолога · ${dir[0]}`} className="mt-6 inline-flex h-14 items-center gap-3 rounded-full bg-[#e07a4f] px-7 text-[15px] font-semibold text-white hover:bg-[#d06a40]">Записаться на консультацию <ArrowUpRight size={17} /></a>
                </motion.div>
              ) : (
                <motion.p key="wait" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative mt-8 max-w-[320px] text-[15px] text-white/50">Ответьте на три вопроса — здесь появится рекомендованное направление ухода.</motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.section>
  )
}

/* ---------- services: horizontal snap shelf ---------- */
const SV = [
  { t: 'Уходовые процедуры', d: 'Протоколы под тип и состояние кожи: увлажнение, питание, восстановление.', c: ['#f6d7c6', '#fbefe8'] },
  { t: 'Чистка лица', d: 'Бережное очищение пор и успокаивающий финиш.', c: ['#e9e4dc', '#ffffff'] },
  { t: 'Пилинги', d: 'Обновление и ровный тон — подбираем интенсивность под кожу.', c: ['#f3c9b0', '#fff3ea'] },
  { t: 'Массаж лица', d: 'Тонус, лимфодренаж и отдых для лица.', c: ['#efd9cf', '#fdf8f4'] },
  { t: 'Массаж тела', d: 'Классический и расслабляющий — чтобы снять напряжение.', c: ['#e7d6c6', '#fbf6f0'] },
]
function Specimen({ c, i }) {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden="true">
      <defs><radialGradient id={'sp' + i} cx=".35" cy=".35"><stop offset="0" stopColor={c[1]} /><stop offset="1" stopColor={c[0]} /></radialGradient></defs>
      <circle cx="100" cy="100" r="86" fill={`url(#sp${i})`} stroke="#16191d" strokeOpacity=".08" />
      {Array.from({ length: 7 + i }, (_, k) => {
        const a = (k / (7 + i)) * Math.PI * 2, r = 30 + ((k * 37) % 40)
        return <motion.circle key={k} cx={100 + Math.cos(a) * r} cy={100 + Math.sin(a) * r} r={5 + (k % 3) * 3} fill={k % 4 === 0 ? WARM : '#ffffff'} fillOpacity={k % 4 === 0 ? 0.8 : 0.9}
          animate={{ y: [0, -4, 0] }} transition={{ duration: 3 + (k % 3), repeat: Infinity, delay: k * 0.2 }} />
      })}
      <circle cx="100" cy="100" r="92" fill="none" stroke="#16191d" strokeOpacity=".15" strokeDasharray="2 6" />
    </svg>
  )
}
function Shelf() {
  const ref = useRef(null)
  const go = d => ref.current?.scrollBy({ left: d * ref.current.clientWidth * 0.6, behavior: 'smooth' })
  return (
    <section id="services" className="py-24 md:py-32" style={{ background: BG }}>
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-end justify-between gap-6 px-5 md:px-10">
        <div>
          <p className={`${MONO} text-[11.5px] uppercase tracking-[.16em] text-[#16191d]/50`}>Направления</p>
          <h2 className={`${H} mt-3 text-[clamp(38px,5.4vw,84px)] leading-[.92]`}><LineReveal>Пять образцов</LineReveal><LineReveal delay={0.08} className="text-[#16191d]/40">заботы</LineReveal></h2>
        </div>
        <div className="hidden gap-2 md:flex">
          <button onClick={() => go(-1)} aria-label="Назад" className="grid h-12 w-12 place-items-center rounded-full border border-[#16191d]/15 hover:bg-[#16191d] hover:text-white"><ArrowLeft size={18} /></button>
          <button onClick={() => go(1)} aria-label="Вперёд" className="grid h-12 w-12 place-items-center rounded-full border border-[#16191d]/15 hover:bg-[#16191d] hover:text-white"><ArrowRight size={18} /></button>
        </div>
      </div>
      <div ref={ref} data-lenis-prevent-wheel className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 md:px-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {SV.map((s, i) => (
          <article key={s.t} className="group w-[78vw] shrink-0 snap-start rounded-[28px] border border-[#16191d]/10 bg-white p-6 sm:w-[46vw] lg:w-[30vw] lg:max-w-[440px] md:p-8">
            <div className="flex items-center justify-between"><span className={`${MONO} text-[12px] text-[#16191d]/45`}>Образец {String(i + 1).padStart(2, '0')}</span><span className="h-2 w-2 rounded-full bg-[#e07a4f]" /></div>
            <div className="mx-auto my-6 aspect-square w-[70%] transition-transform duration-700 group-hover:rotate-12 group-hover:scale-105"><Specimen c={s.c} i={i} /></div>
            <h3 className="text-[26px] font-normal tracking-[-.04em]">{s.t}</h3>
            <p className="mt-2 min-h-[48px] text-[15px] text-[#16191d]/60">{s.d}</p>
            <a href="#book" data-svc={s.t} className="mt-5 inline-flex items-center gap-2 text-[14px] font-semibold text-[#16191d] hover:text-[#e07a4f]">Записаться <ArrowUpRight size={15} /></a>
          </article>
        ))}
        <div className="w-1 shrink-0" />
      </div>
    </section>
  )
}

/* ---------- bento ---------- */
function Cell({ className = '', dark, children }) {
  const ref = useRef(null)
  const mv = e => { const r = ref.current.getBoundingClientRect(); ref.current.style.setProperty('--mx', e.clientX - r.left + 'px'); ref.current.style.setProperty('--my', e.clientY - r.top + 'px') }
  return (
    <Reveal className={'group ' + className}>
      <div ref={ref} onPointerMove={mv} className={`relative h-full overflow-hidden rounded-[26px] p-6 md:p-7 ${dark ? 'bg-[#16191d] text-white' : 'border border-[#16191d]/10 bg-white'}`}>
        <div className="pointer-events-none absolute inset-0 rounded-[26px] opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ padding: 1.5, background: 'radial-gradient(240px circle at var(--mx) var(--my), rgba(224,122,79,.9), transparent 70%)', WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude' }} />
        {children}
      </div>
    </Reveal>
  )
}
function Bento() {
  return (
    <section className="px-5 pb-24 md:px-10 md:pb-32" style={{ background: BG }}>
      <div className="mx-auto grid max-w-[1400px] auto-rows-[minmax(200px,auto)] gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Cell dark className="sm:col-span-2 lg:row-span-2">
          <div className="flex h-full flex-col justify-between gap-6">
            <p className={`${MONO} text-[11.5px] uppercase tracking-[.16em] text-white/45`}>Результат наблюдений · Яндекс Карты</p>
            <div>
              <p className="text-[clamp(110px,15vw,220px)] font-extralight leading-[.8] tracking-[-.07em]">{b.rating}</p>
              <div className="mt-5 flex flex-wrap items-center gap-3"><span className="flex gap-1 text-[#e07a4f]">{[0, 1, 2, 3, 4].map(k => <Star key={k} size={20} fill="currentColor" strokeWidth={0} />)}</span><span className="text-[16px] text-white/65">{b.rev} оценок клиенток</span></div>
            </div>
            <p className="max-w-[360px] text-[15px] text-white/50">Высшая оценка — при каждом из {b.rev} голосов в среднем.</p>
          </div>
        </Cell>
        <Cell className="sm:col-span-2">
          <p className={`${MONO} text-[11.5px] uppercase tracking-[.16em] text-[#16191d]/45`}>Метод</p>
          <h3 className={`${H} mt-2 text-[clamp(28px,3vw,40px)] leading-[1.02]`}>Сначала диагностика, потом процедура</h3>
          <div className="mt-6 flex items-center gap-2" aria-hidden="true">
            {['Осмотр', 'Протокол', 'Процедура', 'Домашний уход'].map((s, k) => (
              <React.Fragment key={s}>
                <motion.span initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 + k * 0.15 }} className={`${MONO} whitespace-nowrap rounded-full border border-[#16191d]/15 px-3 py-1.5 text-[11px] ${k === 2 ? 'bg-[#e07a4f] text-white' : ''}`}>{s}</motion.span>
                {k < 3 && <span className="h-px min-w-2 flex-1 bg-[#16191d]/20" />}
              </React.Fragment>
            ))}
          </div>
        </Cell>
        <Cell>
          <a href="#contact" className="flex h-full flex-col justify-between">
            <MapPin size={26} className="text-[#e07a4f]" />
            <div><h3 className="text-[22px] font-normal leading-tight tracking-[-.03em]">Дзержинского, 32</h3><p className="mt-1 flex items-center gap-1 text-[14px] text-[#16191d]/55">Маршрут <ArrowRight size={14} /></p></div>
          </a>
        </Cell>
        <Cell>
          <div className="flex h-full flex-col justify-between">
            <div className="relative h-14 w-10" aria-hidden="true">
              <motion.span className="absolute left-1/2 top-0 h-5 w-4 -translate-x-1/2 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] bg-[#e07a4f]" animate={{ y: [0, 34], opacity: [1, 0], scaleY: [1, 1.3] }} transition={{ duration: 1.4, repeat: Infinity, ease: 'easeIn' }} />
              <span className="absolute inset-x-0 bottom-0 h-px bg-[#16191d]/30" />
            </div>
            <div className="flex flex-col gap-2">
              <a href={b.viber} target="_blank" rel="noopener" className="flex items-center justify-between rounded-full border border-[#16191d]/15 px-4 py-2.5 text-[14px] hover:bg-[#16191d] hover:text-white">Viber <ArrowUpRight size={15} /></a>
              <a href={b.ig} target="_blank" rel="noopener" className="flex items-center justify-between rounded-full border border-[#16191d]/15 px-4 py-2.5 text-[14px] hover:bg-[#16191d] hover:text-white"><span className="flex items-center gap-2"><IG width={15} />Instagram</span><ArrowUpRight size={15} /></a>
            </div>
          </div>
        </Cell>
      </div>
    </section>
  )
}

/* ---------- booking ---------- */
const SVCS = ['Консультация косметолога', 'Уходовые процедуры', 'Чистка лица', 'Пилинги', 'Массаж лица', 'Массаж тела']
const DAYS = ['Будни', 'Выходные', 'Как получится'], TIMES = ['Утро', 'День', 'Вечер']
const STEPS = ['Направление', 'Время', 'Контакты']
function Pill({ on, onClick, children }) {
  return <button type="button" aria-pressed={on} onClick={onClick} className={`h-12 rounded-full border px-5 text-[14.5px] transition-colors ${on ? 'border-[#16191d] bg-[#16191d] text-white' : 'border-[#16191d]/15 bg-white hover:border-[#16191d]/50'}`}>{children}</button>
}
function Booking() {
  const bk = useBooking()
  const [step, setStep] = useState(0)
  const [day, setDay] = useState(''), [time, setTime] = useState('')
  const [err, setErr] = useState('')
  const next = () => {
    if (step === 0 && !bk.s.svc) return setErr('Выберите направление.')
    if (step === 1 && (!day || !time)) return setErr('Отметьте дни и время.')
    setErr(''); setStep(s => s + 1)
  }
  const onSubmit = e => { e.preventDefault(); if (step < 2) next(); else bk.submit() }
  const f = 'h-14 w-full rounded-[16px] border border-[#16191d]/15 bg-white px-4 text-[17px] outline-none placeholder:text-[#16191d]/35 focus:border-[#e07a4f]'
  return (
    <section id="book" className="px-5 py-24 md:px-10 md:py-32" style={{ background: BLUSH }}>
      <div className="mx-auto grid max-w-[1400px] gap-12 lg:grid-cols-[1fr_1.1fr]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className={`${MONO} text-[11.5px] uppercase tracking-[.16em] text-[#e07a4f]`}>Запись</p>
          <h2 className={`${H} mt-3 text-[clamp(44px,6.4vw,104px)] leading-[.9]`}><LineReveal>Запишитесь</LineReveal><LineReveal delay={0.08} className="text-[#16191d]/40">в лабораторию</LineReveal></h2>
          <p className="mt-6 max-w-[400px] text-[16px] text-[#16191d]/60">Три шага — и администратор свяжется с вами, чтобы подтвердить время. Или позвоните:</p>
          <a href={'tel:' + tel(b.phone)} className="mt-4 inline-flex items-center gap-3 text-[clamp(24px,2.6vw,34px)] font-light tracking-[-.03em] hover:text-[#e07a4f]"><Phone size={22} />{b.phone}</a>
        </div>
        <div className="rounded-[30px] bg-[#fbfaf8] p-6 shadow-[0_40px_80px_-40px_rgba(122,70,48,.35)] md:p-10">
          <AnimatePresence mode="wait">
            {!bk.s.sent ? (
              <motion.form key="f" onSubmit={onSubmit} noValidate exit={{ opacity: 0 }}>
                <div className="mb-8">
                  <div className="flex justify-between">{STEPS.map((s, i) => <span key={s} className={`${MONO} text-[11.5px] uppercase tracking-[.14em] ${i <= step ? 'text-[#16191d]' : 'text-[#16191d]/35'}`}>0{i + 1} {s}</span>)}</div>
                  <div className="mt-3 h-[3px] rounded bg-[#16191d]/10"><motion.div className="h-full rounded bg-[#e07a4f]" animate={{ width: `${((step + 1) / 3) * 100}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} /></div>
                </div>
                <AnimatePresence mode="wait">
                  <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.28 }} className="min-h-[240px]">
                    {step === 0 && (
                      <fieldset><legend className={`${H} mb-5 text-[28px]`}>Что вас интересует?</legend>
                        <div className="flex flex-wrap gap-2">{SVCS.map(s => <Pill key={s} on={bk.s.svc === s || (s === SVCS[0] && bk.s.svc.startsWith(s))} onClick={() => { bk.upd('svc', s); setErr('') }}>{s}</Pill>)}</div>
                        {bk.s.svc && !SVCS.includes(bk.s.svc) && <p className={`${MONO} mt-4 text-[12px] text-[#16191d]/55`}>Из подбора: {bk.s.svc}</p>}
                      </fieldset>
                    )}
                    {step === 1 && (
                      <div className="grid gap-6">
                        <fieldset><legend className={`${H} mb-4 text-[28px]`}>Когда удобно?</legend><div className="flex flex-wrap gap-2">{DAYS.map(d => <Pill key={d} on={day === d} onClick={() => { setDay(d); setErr('') }}>{d}</Pill>)}</div></fieldset>
                        <fieldset><legend className="mb-3 text-[14px] text-[#16191d]/55">Время</legend><div className="flex flex-wrap gap-2">{TIMES.map(d => <Pill key={d} on={time === d} onClick={() => { setTime(d); setErr('') }}>{d}</Pill>)}</div></fieldset>
                      </div>
                    )}
                    {step === 2 && (
                      <div className="grid gap-4">
                        <label className="grid gap-2 text-[13px] text-[#16191d]/55">Имя<input className={f} autoComplete="name" placeholder="Как к вам обращаться" value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} /></label>
                        <label className="grid gap-2 text-[13px] text-[#16191d]/55">Телефон
                          <motion.input animate={bk.s.err ? { x: [0, -8, 8, -5, 5, 0] } : {}} className={f + (bk.s.err ? ' !border-red-500' : '')} type="tel" inputMode="tel" autoComplete="tel" placeholder="+375 __ ___-__-__" value={bk.s.phone} onFocus={phoneFocus(bk)} onChange={e => bk.upd('phone', e.target.value)} aria-invalid={bk.s.err} />
                        </label>
                        {bk.s.err && <p role="alert" className="text-[13px] text-red-600">Введите номер полностью: +375 и 9 цифр.</p>}
                        <p className={`${MONO} text-[12px] text-[#16191d]/50`}>{bk.s.svc} · {day} · {time}</p>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
                {err && <p role="alert" className="mt-2 text-[13px] text-red-600">{err}</p>}
                <div className="mt-8 flex items-center justify-between">
                  {step > 0 ? <button type="button" onClick={() => { setErr(''); setStep(s => s - 1) }} className="inline-flex h-12 items-center gap-2 text-[14px] text-[#16191d]/55 hover:text-[#16191d]"><ArrowLeft size={16} />Назад</button> : <span />}
                  <button disabled={bk.s.loading} className="inline-flex h-14 items-center gap-2 rounded-full bg-[#16191d] px-8 text-[15px] font-semibold text-white hover:bg-black disabled:opacity-60">{step < 2 ? <>Дальше <ArrowRight size={17} /></> : bk.s.loading ? 'Отправляем…' : 'Записаться'}</button>
                </div>
              </motion.form>
            ) : (
              <motion.div key="ok" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid min-h-[360px] place-items-center text-center">
                <div>
                  <CheckDraw className="mx-auto mb-6 text-[#e07a4f]" size={84} />
                  <h3 className={`${H} text-[42px]`}>Заявка принята</h3>
                  <p className="mx-auto mt-3 max-w-[360px] text-[#16191d]/60">В готовом сайте заявка сразу придёт вам в Telegram — администратор свяжется и подтвердит время.</p>
                  <button onClick={() => { bk.reset(); setStep(0); setDay(''); setTime('') }} className="mt-6 text-[14px] text-[#e07a4f] underline underline-offset-4">Новая запись</button>
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
  return (
    <section id="contact" className="px-5 py-24 md:px-10 md:py-28" style={{ background: BG }}>
      <div className="mx-auto grid max-w-[1400px] gap-10 lg:grid-cols-[.9fr_1.1fr]">
        <div>
          <p className={`${MONO} text-[11.5px] uppercase tracking-[.16em] text-[#16191d]/50`}>Контакты</p>
          <h2 className={`${H} mt-3 text-[clamp(38px,4.8vw,72px)] leading-[.95]`}>Дзержинского, 32</h2>
          <p className="mt-3 flex items-start gap-2 text-[16px] text-[#16191d]/60"><MapPin size={18} className="mt-0.5 shrink-0 text-[#e07a4f]" />{b.addr}, {b.city}</p>
          <a href={'tel:' + tel(b.phone)} className="mt-8 block text-[clamp(28px,3vw,42px)] font-light tracking-[-.03em] hover:text-[#e07a4f]">{b.phone}</a>
          <p className="mt-1 text-[14px] text-[#16191d]/50">Телефон и Viber</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <a href={'tel:' + tel(b.phone)} className="inline-flex h-12 items-center gap-2 rounded-full bg-[#16191d] px-6 text-[14px] font-semibold text-white"><Phone size={16} />Позвонить</a>
            <a href={b.viber} target="_blank" rel="noopener" className="inline-flex h-12 items-center rounded-full border border-[#16191d]/20 px-5 text-[14px] hover:border-[#16191d]/60">Viber</a>
            <a href={b.ig} target="_blank" rel="noopener" className="inline-flex h-12 items-center gap-2 rounded-full border border-[#16191d]/20 px-5 text-[14px] hover:border-[#16191d]/60"><IG width={16} />Instagram</a>
          </div>
        </div>
        <div className="h-[380px] overflow-hidden rounded-[28px] border border-[#16191d]/10 md:h-[460px]"><MapFrame oid={b.oid} /></div>
      </div>
    </section>
  )
}

function App() {
  useSmooth()
  const lite = useLite()
  return (
    <MotionConfig reducedMotion="user">
      <div className="overflow-x-clip font-['Manrope',sans-serif] text-[#16191d]" style={{ background: BG, '--sel': WARM, '--selc': '#fff' }}>
        <Ribbon name={b.name} bg={INK} fg="#fff" />
        <header className="sticky top-0 z-40 border-b border-[#16191d]/10 bg-[#fbfaf8]/75 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 md:px-10">
            <a href="#top" className="flex items-center gap-2 text-[21px] font-medium tracking-[-.04em]"><span className="grid h-7 w-7 place-items-center rounded-full border border-[#16191d]"><span className="h-2 w-2 rounded-full bg-[#e07a4f]" /></span>ЖенЛаб</a>
            <nav className="hidden gap-8 text-[14px] text-[#16191d]/60 md:flex">{[['#quiz', 'Подбор ухода'], ['#services', 'Направления'], ['#book', 'Запись'], ['#contact', 'Контакты']].map(([h, t]) => <a key={h} href={h} className="hover:text-[#16191d]">{t}</a>)}</nav>
            <div className="flex items-center gap-2">
              <a href={'tel:' + tel(b.phone)} className="hidden h-10 items-center gap-2 px-3 text-[14px] lg:inline-flex"><Phone size={15} />{b.phone}</a>
              <a href="#book" className="inline-flex h-10 items-center rounded-full bg-[#16191d] px-5 text-[14px] font-semibold text-white">Записаться</a>
            </div>
          </div>
        </header>
        <main>
          <Film lite={lite} />
          <Quiz />
          <Shelf />
          <Bento />
          <Booking />
          <Contact />
        </main>
        <footer className="border-t border-[#16191d]/10 px-5 py-8 text-[13px] text-[#16191d]/50 md:px-10" style={{ background: BG }}>
          <div className="mx-auto flex max-w-[1400px] flex-wrap justify-between gap-4"><span>© 2026 {b.name} · Концепт сайта — Артём</span><span>{b.addr}, {b.city}</span></div>
        </footer>
        <CallBar phone={b.phone} barCls="bg-[#fbfaf8]/95 backdrop-blur border-t border-[#16191d]/10" callCls="rounded-full border border-[#16191d]/25 text-[#16191d]" bookCls="rounded-full bg-[#16191d] text-white" />
        <div className="h-[72px] sm:hidden" style={{ background: BG }} />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
