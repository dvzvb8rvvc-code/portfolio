import React, { useRef, useState, useEffect, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, useSpring, useMotionValue, useInView, AnimatePresence, MotionConfig, animate } from 'framer-motion'
import { ArrowRight, ArrowUpRight, Phone, MapPin, Clock, Star, Plus, Minus, Coffee, Gauge, Wrench, Cpu, Disc3, Cog, Zap, Settings2, Check, CalendarClock } from 'lucide-react'
import '../lib/base.css'
import { useSmooth, Ribbon, LineReveal, Reveal, useBooking, phoneFocus, CheckDraw, MapFrame, CallBar, tel, useLite, useIsMobile, IG } from '../lib/kit'

const PitScene = lazy(() => import('./pitstop3d'))

const b = {
  name: 'ПитСтопМастер', addr: 'ул. Гурского, 34', room: 'помещение 9', district: 'Михалово', city: 'Минск',
  phone: '+375 29 632-11-02', ig: 'https://www.instagram.com/pitstopminsk', igName: '@pitstopminsk',
  rating: '4,7', rev: 409, revWord: 'оценок', oid: '15191488430',
}
const BG = '#0a0a0b', PANEL = '#131316', LINE = 'rgba(255,255,255,.1)', RED = '#ff2d2d', RED_D = '#d81e1e'
const DISP = "font-['Unbounded',sans-serif]", BODY = "font-['Golos_Text',sans-serif]"
const go = id => { const el = document.querySelector(id); if (!el) return; window.__lenis ? window.__lenis.scrollTo(el, { offset: -72 }) : el.scrollIntoView({ behavior: 'smooth' }) }
const pick = (brand, work) => { window.dispatchEvent(new CustomEvent('ps-pick', { detail: { brand, work } })); go('#book') }

/* ---------------- film ---------------- */
// must match pitstop3d.jsx R
const R = [[0.1, 0.28], [0.34, 0.52], [0.58, 0.74], [0.8, 0.96]]
const CH = [
  { k: 'Китайские авто', t: 'Знаем, как устроены китайские машины', d: 'Geely и Belgee, Chery, Haval, Changan, BYD, Exeed, Tank, JAC — работаем с ними каждый день.' },
  { k: '3D развал-схождение', t: 'Развал-схождение на 3D-стенде', d: 'Камеры считывают положение колёс, мастер выставляет углы по данным производителя.' },
  { k: 'Ходовая и ТО', t: 'Ходовая, ТО, диагностика', d: 'Подвеска, тормоза, масло и фильтры по регламенту. Сначала диагностика — потом согласуем работы.' },
  { k: 'Зона ожидания', t: 'Пока ждёте — чай и кофе', d: 'Не нужно уезжать: подождите в зоне ожидания, мастер позовёт, когда всё будет готово.' },
]
function Chapter({ p, i, c }) {
  const [a, z] = R[i]
  const o = useTransform(p, [a - 0.04, a + 0.01, z - 0.01, z + 0.03], [0, 1, 1, 0])
  const x = useTransform(p, [a - 0.04, a + 0.01, z - 0.01, z + 0.03], [-24, 0, 0, 16])
  const pe = useTransform(o, v => (v > 0.6 ? 'auto' : 'none'))
  return (
    <motion.div style={{ opacity: o, x, pointerEvents: pe }} className="absolute inset-0 flex flex-col justify-center">
      <p className={`${DISP} text-[14px] font-semibold uppercase tracking-[.18em]`} style={{ color: RED }}>Глава 0{i + 1} / 04 · {c.k}</p>
      <h2 className={`${DISP} mt-5 text-[clamp(34px,3.9vw,60px)] font-bold uppercase leading-[1.02] tracking-[-0.02em]`}>{c.t}</h2>
      <p className="mt-6 max-w-[470px] text-[19px] leading-relaxed text-white/75">{c.d}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <a href="#book" className="inline-flex h-14 items-center gap-2 rounded-md px-7 text-[17px] font-bold text-white hover:brightness-110" style={{ background: RED }}>Записаться <ArrowRight size={18} /></a>
        <a href="#brands" className="inline-flex h-14 items-center gap-2 rounded-md border border-white/25 px-6 text-[17px] font-semibold hover:bg-white hover:text-black">Выбрать марку</a>
      </div>
    </motion.div>
  )
}
function Seg({ p, i, c, top }) {
  const [a, z] = R[i]
  const fill = useTransform(p, [a - 0.06, z], [0, 1])
  const col = useTransform(p, [a - 0.03, a, z + 0.02, z + 0.04], ['rgba(255,255,255,.55)', '#fff', '#fff', 'rgba(255,255,255,.55)'])
  const jump = () => { const y = top() + ((a + z) / 2) * (window.innerHeight * 2); window.__lenis ? window.__lenis.scrollTo(y) : window.scrollTo({ top: y, behavior: 'smooth' }) }
  return (
    <button type="button" onClick={jump} className="group min-w-0 flex-1 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">
      <span className="block h-[3px] w-full overflow-hidden bg-white/15"><motion.span style={{ scaleX: fill, background: RED }} className="block h-full origin-left" /></span>
      <motion.span style={{ color: col }} className="mt-3 block truncate text-[15px] font-semibold group-hover:text-white">0{i + 1} {c.k}</motion.span>
    </button>
  )
}
function MobCaption({ p }) {
  const [i, setI] = useState(0)
  useEffect(() => p.on('change', v => { const k = R.findIndex(([a, z]) => v >= a - 0.03 && v <= z + 0.03); if (k >= 0) setI(k) }), [p])
  return (
    <AnimatePresence mode="wait"><motion.p key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute inset-x-4 bottom-4 flex items-center gap-2 text-[15px] font-semibold">
      <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: RED }} /><span className="truncate">0{i + 1} · {CH[i].t}</span>
    </motion.p></AnimatePresence>
  )
}
function LiteArt() {
  return (
    <svg viewBox="0 0 400 300" className="absolute inset-0 h-full w-full" aria-hidden="true">
      {Array.from({ length: 140 }, (_, i) => { const a = i / 140 * Math.PI * 2, r = 70 + (i % 3) * 14; return <circle key={i} cx={200 + Math.cos(a) * r} cy={150 + Math.sin(a) * r} r={i % 7 ? 1.4 : 2.2} fill={i % 7 ? '#cfd2d8' : RED} /> })}
      {Array.from({ length: 6 }, (_, k) => <line key={k} x1="200" y1="150" x2={200 + Math.cos(k / 6 * 6.28) * 60} y2={150 + Math.sin(k / 6 * 6.28) * 60} stroke="#cfd2d8" strokeDasharray="1 5" />)}
    </svg>
  )
}

function Hero({ lite }) {
  const ref = useRef(null)
  const mob = useIsMobile()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const sp = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.4 })
  const auto = useMotionValue(0)
  useEffect(() => {
    if (!mob || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const c = animate(auto, [0.15, 0.2, 0.42, 0.46, 0.66, 0.7, 0.88, 0.92, 1, 0.15], { duration: 24, repeat: Infinity, ease: 'easeInOut' })
    return () => c.stop()
  }, [mob])
  const near = useInView(ref, { margin: '200px 0px' })
  const heroO = useTransform(sp, [0, 0.08], [1, 0])
  const heroY = useTransform(sp, [0, 0.08], [0, -30])
  const heroPE = useTransform(sp, v => (v < 0.06 ? 'auto' : 'none'))
  const top = () => ref.current ? ref.current.getBoundingClientRect().top + window.scrollY : 0
  const intro = (
    <>
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px] font-semibold uppercase tracking-[.14em] text-white/70">
        <span style={{ color: RED }}>Автосервис</span><span aria-hidden="true">/</span><span>{b.district}, {b.addr}</span>
      </p>
      <h1 className={`${DISP} mt-5 text-[clamp(36px,5.4vw,84px)] font-bold uppercase leading-[0.98] tracking-[-0.03em]`}>
        <LineReveal delay={0.05}>Ремонт</LineReveal>
        <LineReveal delay={0.12}><span style={{ color: RED }}>китайских</span></LineReveal>
        <LineReveal delay={0.19}>авто</LineReveal>
      </h1>
      <p className="mt-6 max-w-[520px] text-[19px] leading-relaxed text-white/75">Geely, Belgee, Chery, Haval, Changan, BYD, Exeed, Tank, JAC и другие. ТО, диагностика, ходовая и 3D развал-схождение. Пока ждёте — чай и кофе.</p>
      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-[17px]">
        <a href={`https://yandex.by/maps/org/${b.oid}/reviews/`} target="_blank" rel="noopener" className="inline-flex items-center gap-2 font-bold hover:underline"><Star size={19} fill={RED} stroke={RED} />{b.rating} · {b.rev} {b.revWord} на Яндекс Картах</a>
      </div>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <a href="#book" className="inline-flex h-16 items-center justify-center gap-2 rounded-md px-8 text-[19px] font-bold text-white shadow-[0_18px_40px_-18px_rgba(255,45,45,.9)] hover:brightness-110" style={{ background: RED }}>Записаться <ArrowRight size={20} /></a>
        <a href={'tel:' + tel(b.phone)} className="inline-flex h-16 items-center justify-center gap-3 rounded-md border border-white/25 px-7 text-[19px] font-bold hover:bg-white hover:text-black"><Phone size={20} />{b.phone}</a>
      </div>
    </>
  )
  if (mob) return (
    <section ref={ref} id="top" className="relative px-5 pb-10 pt-8" style={{ background: BG }}>
      {intro}
      <div className="relative mt-8 h-[300px] overflow-hidden rounded-lg border" style={{ borderColor: LINE, background: 'radial-gradient(80% 70% at 50% 45%, #1b1b20, #0a0a0b)' }}>
        {lite ? <LiteArt /> : near && <Suspense fallback={null}><PitScene progress={auto} active={near} count={3800} side={false} /></Suspense>}
        <MobCaption p={auto} />
      </div>
    </section>
  )
  return (
    <section ref={ref} id="top" className="relative h-[300vh]" style={{ background: BG }}>
      <div className="sticky top-[72px] h-[calc(100svh-72px)] overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0" style={{ background: 'radial-gradient(50% 60% at 70% 45%, #1d1d23 0%, #0a0a0b 70%)' }} />
        <div aria-hidden="true" className="absolute inset-0 opacity-[.35]" style={{ backgroundImage: `linear-gradient(${LINE} 1px, transparent 1px), linear-gradient(90deg, ${LINE} 1px, transparent 1px)`, backgroundSize: '80px 80px', maskImage: 'radial-gradient(60% 70% at 70% 45%, #000, transparent)' }} />
        <div className="absolute inset-0">{lite ? <div className="absolute inset-y-0 right-0 w-1/2"><LiteArt /></div> : near && <Suspense fallback={null}><PitScene progress={sp} active={near} /></Suspense>}</div>
        <div className="relative mx-auto flex h-full max-w-[1320px] flex-col px-10 pb-8">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 w-[min(560px,48%)]">
              <motion.div style={{ opacity: heroO, y: heroY, pointerEvents: heroPE }} className="flex h-full flex-col justify-center">
                {intro}
                <a href="#brands" className="mt-6 w-fit text-[16px] font-semibold text-white/70 underline decoration-[#ff2d2d] decoration-2 underline-offset-4 hover:text-white">Пропустить → к выбору марки</a>
              </motion.div>
              {CH.map((c, i) => <Chapter key={c.k} p={sp} i={i} c={c} />)}
            </div>
          </div>
          <div className="flex gap-4">{CH.map((c, i) => <Seg key={c.k} p={sp} i={i} c={c} top={top} />)}</div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- brand picker ---------------- */
const WORKS = {
  to: { t: 'ТО по регламенту', d: 'Масло, фильтры, жидкости — по сервисной книжке вашей модели.', I: Settings2 },
  diag: { t: 'Компьютерная диагностика', d: 'Считываем ошибки блоков, проверяем датчики и системы.', I: Cpu },
  align: { t: '3D развал-схождение', d: 'Выставим углы колёс на 3D-стенде — после ремонта подвески или при уводе.', I: Gauge },
  susp: { t: 'Ходовая и рулевое', d: 'Стуки, люфты, амортизаторы, рычаги, сайлентблоки.', I: Wrench },
  brakes: { t: 'Тормозная система', d: 'Колодки, диски, суппорты, замена тормозной жидкости.', I: Disc3 },
  gear: { t: 'Обслуживание КПП', d: 'Замена масла в коробке — тип КПП уточним по VIN.', I: Cog },
  elec: { t: 'Автоэлектрика', d: 'Не заводится, горят ошибки, не работает свет или датчики.', I: Zap },
}
const BRANDS = [
  { n: 'Geely', m: 'Coolray, Atlas, Monjaro, Tugella, Emgrand', w: ['to', 'diag', 'susp', 'gear', 'align', 'brakes'] },
  { n: 'Belgee', m: 'X50, X70', w: ['to', 'diag', 'susp', 'align', 'brakes', 'elec'] },
  { n: 'Chery', m: 'Tiggo 4, Tiggo 7 Pro, Tiggo 8 Pro, Arrizo', w: ['to', 'diag', 'gear', 'susp', 'brakes', 'align'] },
  { n: 'Haval', m: 'Jolion, F7, H6, Dargo, M6', w: ['to', 'diag', 'gear', 'susp', 'align', 'elec'] },
  { n: 'Changan', m: 'CS35 Plus, CS55 Plus, UNI-K, UNI-V', w: ['to', 'diag', 'susp', 'brakes', 'align', 'gear'] },
  { n: 'BYD', m: 'Song Plus, Han, Seal, Atto 3', w: ['diag', 'susp', 'brakes', 'align', 'elec', 'to'], note: 'Гибриды и электромобили: что именно сделаем по вашей модели — уточните по телефону.' },
  { n: 'Exeed', m: 'LX, TXL, VX, RX', w: ['to', 'diag', 'gear', 'susp', 'align', 'brakes'] },
  { n: 'Tank', m: '300, 500', w: ['to', 'susp', 'diag', 'align', 'brakes', 'gear'] },
  { n: 'JAC', m: 'J7, JS4, T8, S3', w: ['to', 'diag', 'susp', 'brakes', 'elec', 'align'] },
  { n: 'Omoda', m: 'C5, S5', w: ['to', 'diag', 'gear', 'susp', 'align', 'brakes'] },
  { n: 'Jetour', m: 'X70, X90, Dashing', w: ['to', 'diag', 'susp', 'gear', 'align', 'brakes'] },
  { n: 'Другая марка', m: 'Great Wall, Dongfeng, Lifan, FAW и др. — уточните по телефону', w: ['diag', 'to', 'susp', 'brakes', 'align', 'elec'] },
]
function BrandBtn({ br, on, onClick }) {
  return (
    <button type="button" aria-pressed={on} onClick={onClick}
      className={`relative h-16 min-w-0 rounded-md border px-3 text-[15px] font-bold uppercase tracking-[.02em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:h-[72px] md:text-[17px] ${DISP} ${on ? 'border-[#ff2d2d] bg-[#ff2d2d] text-white' : 'border-white/15 bg-[#131316] text-white/85 hover:border-white/50'}`}>
      <span className="block truncate">{br.n}</span>
    </button>
  )
}
function Brands() {
  const [i, setI] = useState(3)
  const br = BRANDS[i]
  return (
    <section id="brands" className="px-5 py-24 md:px-10 md:py-32" style={{ background: BG }}>
      <div className="mx-auto max-w-[1240px]">
        <p className="text-[15px] font-semibold uppercase tracking-[.16em]" style={{ color: RED }}>Ваша марка</p>
        <div className="mt-3 grid gap-6 md:grid-cols-[1.2fr_0.8fr] md:items-end">
          <h2 className={`${DISP} text-[clamp(30px,4.4vw,64px)] font-bold uppercase leading-[1.02] tracking-[-0.02em]`}>Выберите марку — покажем, с чем чаще приезжают</h2>
          <p className="text-[18px] leading-relaxed text-white/70">Список типовой. Точный объём работ мастер скажет после диагностики и согласует с вами.</p>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6" role="group" aria-label="Марка автомобиля">
          {BRANDS.map((x, k) => <BrandBtn key={x.n} br={x} on={k === i} onClick={() => setI(k)} />)}
        </div>
        <div className="mt-6 overflow-hidden rounded-lg border" style={{ borderColor: LINE, background: PANEL }}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={br.n} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} className="grid lg:grid-cols-[0.8fr_1.2fr]">
              <div className="relative border-b p-7 md:p-10 lg:border-b-0 lg:border-r" style={{ borderColor: LINE }}>
                <p className="text-[15px] font-semibold uppercase tracking-[.14em] text-white/55">Марка</p>
                <p className={`${DISP} mt-2 break-words text-[clamp(40px,6vw,88px)] font-extrabold uppercase leading-[.95] tracking-[-0.03em]`}>{br.n}</p>
                <p className="mt-6 text-[15px] font-semibold uppercase tracking-[.14em] text-white/55">Например</p>
                <p className="mt-2 text-[19px] leading-relaxed text-white/85">{br.m}</p>
                {br.note && <p className="mt-6 rounded-md border border-[#ff2d2d]/50 p-4 text-[16px] leading-relaxed text-white/85">{br.note}</p>}
                <button type="button" onClick={() => pick(br.n, '')} className="mt-8 inline-flex h-14 w-full items-center justify-center gap-2 rounded-md px-7 text-[17px] font-bold text-white hover:brightness-110 sm:w-auto" style={{ background: RED }}>Записать {br.n === 'Другая марка' ? 'автомобиль' : br.n} <ArrowRight size={18} /></button>
              </div>
              <ul className="divide-y" style={{ borderColor: LINE }}>
                {br.w.map((k, n) => { const w = WORKS[k]; return (
                  <li key={k} className="grid grid-cols-[44px_1fr] items-center gap-x-4 gap-y-3 border-white/10 px-6 py-5 sm:grid-cols-[44px_1fr_auto] md:px-8">
                    <span className="grid h-11 w-11 place-items-center rounded-md bg-white/[.06]" style={{ color: n === 0 ? RED : '#fff' }}><w.I size={21} /></span>
                    <span><span className="block text-[18px] font-bold">{w.t}</span><span className="mt-0.5 block text-[16px] leading-snug text-white/65">{w.d}</span></span>
                    <button type="button" onClick={() => pick(br.n, w.t)} className="col-span-2 inline-flex h-12 items-center justify-center gap-1.5 rounded-md border border-white/20 px-4 text-[16px] font-semibold hover:border-[#ff2d2d] hover:bg-[#ff2d2d] sm:col-span-1">Записаться <ArrowRight size={16} /></button>
                  </li>) })}
              </ul>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

/* ---------------- services ---------------- */
const SVC = [
  { ...WORKS.diag, time: 'обычно до часа' },
  { ...WORKS.to, time: '1–2 часа, зависит от регламента' },
  { ...WORKS.align, time: 'обычно около часа' },
  { ...WORKS.susp, time: 'после диагностики' },
  { ...WORKS.brakes, time: 'от часа — зависит от работ' },
  { ...WORKS.gear, time: 'уточним по VIN' },
  { ...WORKS.elec, time: 'после диагностики' },
  { t: 'Подбор запчастей', d: 'Предложим варианты запчастей и согласуем до заказа.', I: Check, time: 'при записи' },
]
function Services() {
  return (
    <section id="services" className="border-t px-5 py-24 md:px-10 md:py-32" style={{ background: BG, borderColor: LINE }}>
      <div className="mx-auto max-w-[1240px]">
        <p className="text-[15px] font-semibold uppercase tracking-[.16em]" style={{ color: RED }}>Услуги</p>
        <div className="mt-3 grid gap-6 md:grid-cols-[1.2fr_0.8fr] md:items-end">
          <h2 className={`${DISP} text-[clamp(30px,4.4vw,64px)] font-bold uppercase leading-[1.02] tracking-[-0.02em]`}>Что делаем</h2>
          <p className="text-[18px] leading-relaxed text-white/70">Цену назовёт мастер — она зависит от модели и состояния машины. Время — ориентировочное.</p>
        </div>
        <div className="mt-12 grid gap-px overflow-hidden rounded-lg border sm:grid-cols-2 lg:grid-cols-4" style={{ borderColor: LINE, background: LINE }}>
          {SVC.map((s, i) => (
            <Reveal key={s.t} delay={(i % 4) * 0.05} className="group flex flex-col p-6 md:p-7" style={{ background: PANEL }}>
              <div className="flex items-center justify-between">
                <s.I size={26} style={{ color: RED }} />
                <span className="text-[14px] font-semibold tabular-nums text-white/40">{String(i + 1).padStart(2, '0')}</span>
              </div>
              <h3 className="mt-6 text-[21px] font-bold leading-tight">{s.t}</h3>
              <p className="mt-2 flex-1 text-[16px] leading-relaxed text-white/65">{s.d}</p>
              <p className="mt-5 flex items-center gap-2 text-[15px] text-white/75"><Clock size={16} />{s.time}</p>
              <p className="mt-1 text-[15px] text-white/50">цена — уточнит мастер</p>
              <button type="button" onClick={() => pick('', s.t)} className="mt-5 inline-flex h-12 items-center justify-center gap-1.5 rounded-md border border-white/20 text-[16px] font-semibold transition-colors group-hover:border-[#ff2d2d] hover:bg-[#ff2d2d]">Записаться</button>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------- how ---------------- */
const HOW = [
  { t: 'Записываетесь', d: 'Звонок или заявка на сайте. Скажите марку и что беспокоит.' },
  { t: 'Приезжаете', d: `${b.addr}, ${b.district}. Можно подождать в зоне ожидания — чай и кофе.` },
  { t: 'Диагностика и согласование', d: 'Мастер покажет, что нашёл, назовёт работы и стоимость. Без согласования не начинаем.' },
  { t: 'Забираете машину', d: 'Расскажем, что сделали и на что обратить внимание дальше.' },
]
function How() {
  return (
    <section id="how" className="px-5 py-24 md:px-10 md:py-32" style={{ background: '#0f0f11' }}>
      <div className="mx-auto max-w-[1240px]">
        <p className="text-[15px] font-semibold uppercase tracking-[.16em]" style={{ color: RED }}>Как мы работаем</p>
        <h2 className={`${DISP} mt-3 text-[clamp(30px,4.4vw,64px)] font-bold uppercase leading-[1.02] tracking-[-0.02em]`}>Четыре шага до пит-стопа</h2>
        <ol className="relative mt-14 grid gap-10 md:grid-cols-4 md:gap-6">
          <span aria-hidden="true" className="absolute left-0 right-0 top-[27px] hidden h-px md:block" style={{ background: `linear-gradient(90deg, ${RED}, rgba(255,45,45,.1))` }} />
          {HOW.map((s, i) => (
            <Reveal as="li" key={s.t} delay={i * 0.08} className="relative">
              <span className={`${DISP} relative grid h-14 w-14 place-items-center rounded-md text-[20px] font-bold`} style={{ background: i === 0 ? RED : PANEL, border: `1px solid ${i === 0 ? RED : 'rgba(255,255,255,.2)'}` }}>{i + 1}</span>
              <h3 className="mt-6 text-[22px] font-bold">{s.t}</h3>
              <p className="mt-2 text-[17px] leading-relaxed text-white/70">{s.d}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}

/* ---------------- proof / bento ---------------- */
function Steam() {
  return (
    <svg viewBox="0 0 120 120" className="h-28 w-28" aria-hidden="true">
      {[40, 60, 80].map((x, i) => (
        <motion.path key={x} d={`M${x} 62 C ${x - 10} 50, ${x + 10} 38, ${x} 22`} stroke="#fff" strokeOpacity=".55" strokeWidth="3" fill="none" strokeLinecap="round"
          animate={{ pathLength: [0, 1, 1], opacity: [0, 1, 0] }} transition={{ duration: 2.6, repeat: Infinity, delay: i * 0.5, ease: 'easeInOut' }} />
      ))}
      <path d="M28 66h64v14a22 22 0 0 1-22 22H50a22 22 0 0 1-22-22Z" fill={RED} />
      <path d="M92 70h6a10 10 0 0 1 0 20h-8" stroke={RED} strokeWidth="5" fill="none" />
    </svg>
  )
}
function Proof() {
  return (
    <section id="reviews" className="border-t px-5 py-24 md:px-10 md:py-32" style={{ background: BG, borderColor: LINE }}>
      <div className="mx-auto max-w-[1240px]">
        <p className="text-[15px] font-semibold uppercase tracking-[.16em]" style={{ color: RED }}>Отзывы и рейтинг</p>
        <h2 className={`${DISP} mt-3 text-[clamp(30px,4.4vw,64px)] font-bold uppercase leading-[1.02] tracking-[-0.02em]`}>Почему к нам возвращаются</h2>
        <div className="mt-12 grid gap-3 md:grid-cols-6 md:grid-rows-[auto_auto]">
          <Reveal className="relative overflow-hidden rounded-lg border p-8 md:col-span-3 md:row-span-2 md:p-10" style={{ borderColor: LINE, background: `radial-gradient(90% 80% at 0% 100%, rgba(255,45,45,.22), ${PANEL} 60%)` }}>
            <p className="text-[16px] font-semibold text-white/70">Яндекс Карты</p>
            <p className={`${DISP} mt-4 text-[clamp(96px,13vw,180px)] font-extrabold leading-[.85] tracking-[-0.05em]`}>{b.rating}</p>
            <div className="mt-5 flex gap-1.5" aria-hidden="true">{[0, 1, 2, 3, 4].map(i => <Star key={i} size={26} fill={i < 4 ? RED : 'none'} stroke={RED} />)}</div>
            <p className="mt-4 text-[20px]">{b.rev} {b.revWord} от клиентов</p>
            <a href={`https://yandex.by/maps/org/${b.oid}/reviews/`} target="_blank" rel="noopener" className="mt-8 inline-flex h-14 items-center gap-2 rounded-md border border-white/25 px-6 text-[17px] font-bold hover:bg-white hover:text-black">Читать отзывы <ArrowUpRight size={18} /></a>
          </Reveal>
          <Reveal delay={0.05} className="flex flex-col justify-between gap-6 rounded-lg border p-7 md:col-span-3" style={{ borderColor: LINE, background: PANEL }}>
            <div className="flex items-start justify-between gap-4">
              <div><h3 className="text-[24px] font-bold">Зона ожидания</h3><p className="mt-2 max-w-[340px] text-[17px] leading-relaxed text-white/70">Чай и кофе, пока мастер работает. Не нужно уезжать и возвращаться.</p></div>
              <Steam />
            </div>
          </Reveal>
          <Reveal delay={0.1} className="rounded-lg border p-7 md:col-span-2" style={{ borderColor: LINE, background: PANEL }}>
            <Gauge size={28} style={{ color: RED }} /><h3 className="mt-5 text-[21px] font-bold">3D-стенд</h3><p className="mt-2 text-[16px] leading-relaxed text-white/70">Развал-схождение по данным производителя вашей модели.</p>
          </Reveal>
          <Reveal delay={0.15} className="rounded-lg border p-7 md:col-span-1" style={{ borderColor: LINE, background: PANEL }}>
            <Check size={28} style={{ color: RED }} /><h3 className="mt-5 text-[21px] font-bold">Согласуем всё заранее</h3>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

/* ---------------- booking ---------------- */
const B_WORK = [...Object.values(WORKS).map(w => w.t), 'Другое / не знаю']
const WHEN = [{ t: 'Как можно скорее', d: 'ближайшее свободное время' }, { t: 'На этой неделе', d: 'подберём день' }, { t: 'Позже', d: 'договоримся по телефону' }]
function Chip({ on, onClick, children, className = '' }) {
  return (
    <button type="button" aria-pressed={!!on} onClick={onClick}
      className={`min-h-[56px] rounded-md border px-4 py-3 text-left text-[17px] font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${on ? 'border-[#ff2d2d] bg-[#ff2d2d] text-white' : 'border-white/15 bg-white/[.03] hover:border-white/50'} ${className}`}>{children}</button>
  )
}
const inputCls = 'mt-2 h-16 w-full rounded-md border bg-white/[.04] px-5 text-[18px] text-white outline-none placeholder:text-white/35 focus:border-[#ff2d2d]'
function Book() {
  const bk = useBooking()
  const [step, setStep] = useState(0), [brand, setBrand] = useState(''), [model, setModel] = useState(''), [when, setWhen] = useState(''), [err, setErr] = useState('')
  const head = useRef(null)
  useEffect(() => { if (step) head.current?.focus() }, [step])
  useEffect(() => {
    const h = e => { if (e.detail.brand) setBrand(e.detail.brand); if (e.detail.work) bk.upd('svc', e.detail.work); setStep(0); setErr('') }
    window.addEventListener('ps-pick', h); return () => window.removeEventListener('ps-pick', h)
  }, [])
  const next = e => {
    e.preventDefault()
    if (step === 0 && !brand) return setErr('Выберите марку автомобиля')
    if (step === 0 && !bk.s.svc) return setErr('Выберите, что нужно сделать')
    if (step === 1 && !when) return setErr('Выберите, когда удобно приехать')
    setErr('')
    if (step < 2) setStep(step + 1); else bk.submit()
  }
  const titles = ['Машина и работа', 'Когда удобно?', 'Куда перезвонить?']
  return (
    <section id="book" className="px-5 py-24 md:px-10 md:py-32" style={{ background: '#0f0f11' }}>
      <div className="mx-auto grid max-w-[1240px] gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-[15px] font-semibold uppercase tracking-[.16em]" style={{ color: RED }}>Запись</p>
          <h2 className={`${DISP} mt-3 text-[clamp(30px,4.4vw,60px)] font-bold uppercase leading-[1.02] tracking-[-0.02em]`}>Запись в сервис</h2>
          <p className="mt-6 max-w-[420px] text-[18px] leading-relaxed text-white/70">Три коротких шага — мастер перезвонит, уточнит детали и предложит время. Или просто позвоните:</p>
          <a href={'tel:' + tel(b.phone)} className="mt-8 flex items-center gap-5 rounded-lg border p-6 transition-colors hover:border-[#ff2d2d]" style={{ borderColor: LINE, background: PANEL }}>
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-md" style={{ background: RED }}><Phone size={24} /></span>
            <span><span className="block text-[15px] font-semibold text-white/60">Позвонить в сервис</span><span className="block text-[24px] font-bold tracking-[-0.01em]">{b.phone}</span></span>
          </a>
          <p className="mt-6 flex items-center gap-3 text-[17px] text-white/70"><Coffee size={20} style={{ color: RED }} />Можно подождать машину в зоне ожидания</p>
        </div>
        <div className="rounded-lg border p-6 md:p-10" style={{ borderColor: LINE, background: PANEL }}>
          {bk.s.sent ? (
            <div className="py-10 text-center" role="status">
              <CheckDraw className="mx-auto text-[#ff2d2d]" size={84} />
              <p className={`${DISP} mt-6 text-[32px] font-bold uppercase`}>Заявка принята</p>
              <p className="mx-auto mt-3 max-w-[440px] text-[18px] leading-relaxed text-white/75">Перезвоним и подберём время. В готовом сайте заявка сразу придёт вам в Telegram.</p>
              <button type="button" onClick={() => { bk.reset(); setStep(0); setBrand(''); setModel(''); setWhen('') }} className="mt-8 h-12 text-[17px] font-bold underline underline-offset-4">Новая заявка</button>
            </div>
          ) : (
            <form onSubmit={next} noValidate>
              <div className="flex gap-2" aria-hidden="true">{[0, 1, 2].map(i => <span key={i} className="h-1 flex-1" style={{ background: i <= step ? RED : 'rgba(255,255,255,.12)' }} />)}</div>
              <p className="mt-4 text-[15px] font-semibold text-white/60">Шаг {step + 1} из 3</p>
              <h3 ref={head} tabIndex={-1} className={`${DISP} mb-6 mt-1 text-[26px] font-bold uppercase outline-none`}>{titles[step]}</h3>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={step} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }} transition={{ duration: 0.2 }}>
                  {step === 0 && (<>
                    <p className="text-[16px] font-bold">Марка</p>
                    <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">{BRANDS.map(x => <Chip key={x.n} on={brand === x.n} onClick={() => { setBrand(x.n); setErr('') }} className="text-center">{x.n}</Chip>)}</div>
                    <label htmlFor="ps-model" className="mt-6 block text-[16px] font-bold">Модель и год <span className="font-normal text-white/50">(необязательно)</span></label>
                    <input id="ps-model" value={model} onChange={e => setModel(e.target.value)} placeholder="Например, Jolion 2023" className={inputCls + ' border-white/15'} />
                    <p className="mt-6 text-[16px] font-bold">Что нужно сделать</p>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">{B_WORK.map(w => <Chip key={w} on={bk.s.svc === w} onClick={() => { bk.upd('svc', w); setErr('') }}>{w}</Chip>)}</div>
                  </>)}
                  {step === 1 && <div className="grid gap-2 sm:grid-cols-3">{WHEN.map(({ t, d }) => (
                    <Chip key={t} on={when === t} onClick={() => { setWhen(t); setErr('') }} className="sm:py-5"><CalendarClock size={22} className="mb-2" /><span className="block">{t}</span><span className="block text-[15px] font-normal opacity-75">{d}</span></Chip>
                  ))}</div>}
                  {step === 2 && (<div className="space-y-5">
                    <div><label htmlFor="ps-name" className="text-[16px] font-bold">Как к вам обращаться</label>
                      <input id="ps-name" value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} autoComplete="name" className={inputCls + ' border-white/15'} /></div>
                    <div><label htmlFor="ps-phone" className="text-[16px] font-bold">Телефон</label>
                      <input id="ps-phone" value={bk.s.phone} onChange={e => bk.upd('phone', e.target.value)} onFocus={phoneFocus(bk)} type="tel" inputMode="tel" autoComplete="tel" placeholder="+375 __ ___-__-__" aria-invalid={bk.s.err} aria-describedby={bk.s.err ? 'ps-perr' : undefined}
                        className={inputCls + (bk.s.err ? ' border-[#ff6b6b]' : ' border-white/15')} /></div>
                    {bk.s.err && <p id="ps-perr" className="text-[16px] font-semibold text-[#ff8a8a]">Проверьте номер: нужно 12 цифр, начиная с +375.</p>}
                    <p className="rounded-md bg-white/[.05] p-4 text-[16px] text-white/85">{brand}{model ? ' ' + model : ''} · {bk.s.svc} · {when}</p>
                  </div>)}
                </motion.div>
              </AnimatePresence>
              {err && <p className="mt-4 text-[16px] font-semibold text-[#ff8a8a]" role="alert">{err}</p>}
              <div className="mt-8 flex items-center justify-between gap-4">
                {step > 0 ? <button type="button" onClick={() => setStep(step - 1)} className="h-14 px-2 text-[17px] font-semibold text-white/70 hover:text-white">← Назад</button> : <span />}
                <button type="submit" disabled={bk.s.loading} className="inline-flex h-16 items-center gap-2 rounded-md px-8 text-[18px] font-bold text-white hover:brightness-110 disabled:opacity-60" style={{ background: RED }}>{step < 2 ? 'Дальше' : bk.s.loading ? 'Отправляем…' : 'Записаться'} <ArrowRight size={19} /></button>
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
  ['Сколько займёт ремонт?', 'Диагностика обычно до часа, ТО — 1–2 часа. Точное время мастер назовёт после осмотра машины.'],
  ['Можно подождать на месте?', 'Да, есть зона ожидания с чаем и кофе. Если работы надолго — предупредим заранее.'],
  ['Работаете с моей маркой?', 'Специализация — китайские автомобили: Geely, Belgee, Chery, Haval, Changan, BYD, Exeed, Tank, JAC и другие. Если марки нет в списке — позвоните, подскажем.'],
  ['Можно со своими запчастями?', 'Обсудите это с мастером при записи — он подскажет, подходят ли детали для вашей модели.'],
  ['Как узнать стоимость?', 'Цена зависит от модели и состояния машины. После диагностики мастер назовёт стоимость и начнёт работу только после согласования.'],
  ['Как оплатить и есть ли парковка?', 'Способы оплаты и парковку рядом с сервисом уточняйте по телефону.'],
]
function Faq() {
  const [open, setOpen] = useState(0)
  return (
    <section id="faq" className="border-t px-5 py-24 md:px-10 md:py-28" style={{ background: BG, borderColor: LINE }}>
      <div className="mx-auto grid max-w-[1240px] gap-10 md:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-[15px] font-semibold uppercase tracking-[.16em]" style={{ color: RED }}>Вопросы</p>
          <h2 className={`${DISP} mt-3 text-[clamp(30px,4vw,56px)] font-bold uppercase leading-[1.02] tracking-[-0.02em]`}>Частые вопросы</h2>
          <p className="mt-5 text-[18px] text-white/70">Не нашли ответ? <a href={'tel:' + tel(b.phone)} className="font-bold text-white underline decoration-[#ff2d2d] underline-offset-4">{b.phone}</a></p>
        </div>
        <div className="border-t" style={{ borderColor: LINE }}>
          {FAQ.map(([q, a], i) => (
            <div key={q} className="border-b" style={{ borderColor: LINE }}>
              <h3>
                <button type="button" aria-expanded={open === i} aria-controls={'pf-' + i} onClick={() => setOpen(open === i ? -1 : i)} className="flex min-h-[72px] w-full items-center justify-between gap-4 py-4 text-left text-[19px] font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">
                  {q}<span className="grid h-10 w-10 shrink-0 place-items-center rounded-md" style={{ background: open === i ? RED : 'rgba(255,255,255,.07)' }}>{open === i ? <Minus size={18} /> : <Plus size={18} />}</span>
                </button>
              </h3>
              <AnimatePresence initial={false}>
                {open === i && <motion.div id={'pf-' + i} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden"><p className="pb-6 text-[17px] leading-relaxed text-white/70">{a}</p></motion.div>}
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
    <section id="contact" className="px-5 py-24 md:px-10 md:py-28" style={{ background: '#0f0f11' }}>
      <div className="mx-auto grid max-w-[1240px] gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-[15px] font-semibold uppercase tracking-[.16em]" style={{ color: RED }}>Контакты</p>
          <h2 className={`${DISP} mt-3 text-[clamp(30px,4vw,56px)] font-bold uppercase leading-[1.02] tracking-[-0.02em]`}>Михалово, Гурского, 34</h2>
          <ul className="mt-8 space-y-5 text-[18px]">
            <li className="flex items-start gap-3"><MapPin className="mt-1 shrink-0" size={22} style={{ color: RED }} /><span>{b.addr}, {b.room}<br /><span className="text-white/60">{b.district}, {b.city}</span></span></li>
            <li className="flex items-start gap-3"><Clock className="mt-1 shrink-0" size={22} style={{ color: RED }} />Часы работы — уточняйте по телефону</li>
            <li><a href={'tel:' + tel(b.phone)} className="flex items-center gap-3 text-[26px] font-bold"><Phone size={22} style={{ color: RED }} />{b.phone}</a></li>
            <li><a href={b.ig} target="_blank" rel="noopener" className="flex items-center gap-3 font-semibold underline-offset-4 hover:underline"><IG width="22" height="22" style={{ color: RED }} />Instagram {b.igName}</a></li>
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={'tel:' + tel(b.phone)} className="inline-flex h-14 items-center gap-2 rounded-md px-7 text-[17px] font-bold text-white" style={{ background: RED }}><Phone size={19} />Позвонить</a>
            <a href={`https://yandex.by/maps/org/${b.oid}/`} target="_blank" rel="noopener" className="inline-flex h-14 items-center gap-2 rounded-md border border-white/25 px-6 text-[17px] font-semibold hover:bg-white hover:text-black">Маршрут <ArrowUpRight size={18} /></a>
          </div>
        </div>
        <div className="h-[380px] overflow-hidden rounded-lg border md:h-[480px]" style={{ borderColor: LINE }}><MapFrame oid={b.oid} dark /></div>
      </div>
    </section>
  )
}

/* ---------------- header ---------------- */
const NAV = [['#brands', 'Марки'], ['#services', 'Услуги'], ['#how', 'Как мы работаем'], ['#reviews', 'Отзывы'], ['#contact', 'Контакты']]
function useActive() {
  const [a, setA] = useState('')
  useEffect(() => {
    const els = ['#brands', '#services', '#how', '#reviews', '#book', '#faq', '#contact'].map(h => document.querySelector(h)).filter(Boolean)
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) setA('#' + e.target.id) }), { rootMargin: '-45% 0px -50% 0px' })
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])
  return a === '#book' ? '#reviews' : a === '#faq' ? '#contact' : a
}
function Header() {
  const active = useActive()
  return (
    <header className="sticky top-0 z-50 border-b bg-[#0a0a0b]/90 backdrop-blur" style={{ borderColor: LINE }}>
      <div className="mx-auto flex h-[64px] max-w-[1320px] items-center justify-between gap-4 px-4 md:h-[72px] md:px-10">
        <a href="#top" className="min-w-0 leading-none" aria-label="ПитСтопМастер — наверх">
          <span className={`${DISP} block truncate text-[16px] font-bold uppercase tracking-[-0.01em] md:text-[19px]`}>ПитСтоп<span style={{ color: RED }}>/</span>Мастер</span>
          <span className="mt-1 block text-[13px] font-semibold uppercase tracking-[.12em] text-white/55">китайские авто · Михалово</span>
        </a>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Разделы">
          {NAV.map(([h, t]) => <a key={h} href={h} aria-current={active === h ? 'true' : undefined} className={`relative rounded-md px-3.5 py-2 text-[16px] font-semibold transition-colors ${active === h ? 'text-white' : 'text-white/65 hover:text-white'}`}>{t}{active === h && <motion.span layoutId="ps-nav" className="absolute inset-x-3 -bottom-[3px] h-[2px]" style={{ background: RED }} />}</a>)}
        </nav>
        <div className="flex shrink-0 items-center gap-3">
          <a href={'tel:' + tel(b.phone)} className="hidden text-[17px] font-bold xl:inline">{b.phone}</a>
          <a href={'tel:' + tel(b.phone)} className="grid h-11 w-11 place-items-center rounded-md border border-white/20 sm:hidden" aria-label="Позвонить"><Phone size={18} /></a>
          <a href="#book" className="hidden h-11 items-center gap-2 rounded-md px-5 sm:inline-flex text-[16px] font-bold text-white hover:brightness-110" style={{ background: RED }}>Записаться</a>
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
      <div className={`${BODY} text-[18px] text-white`} style={{ background: BG, '--sel': RED, '--selc': '#fff' }}>
        <Ribbon name={b.name} bg={RED_D} fg="#fff" />
        <Header />
        <main>
          <Hero lite={lite} />
          <Brands />
          <Services />
          <How />
          <Proof />
          <Book />
          <Faq />
          <Contact />
        </main>
        <footer className="border-t px-5 py-10 text-[16px] md:px-10" style={{ borderColor: LINE, color: 'rgba(255,255,255,.6)' }}>
          <div className="mx-auto flex max-w-[1240px] flex-wrap justify-between gap-4"><span>© 2026 {b.name} · Концепт сайта — Артём</span><span>{b.addr}, {b.room}, {b.city}</span></div>
        </footer>
        <CallBar phone={b.phone} barCls="bg-[#0a0a0b]/95 backdrop-blur border-t border-white/10" callCls="rounded-md border border-white/25 text-white text-[18px]" bookCls="rounded-md bg-[#ff2d2d] text-white text-[18px]" />
        <div className="h-[76px] sm:hidden" />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
