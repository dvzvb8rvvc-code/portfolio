import React, { useRef, useState, useEffect, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, useSpring, useMotionValue, useInView, AnimatePresence, MotionConfig, animate } from 'framer-motion'
import { ArrowRight, Phone, MapPin, Clock, Star, Plus, Minus, Navigation, Check, Wrench, Gauge, Disc3, Cog, Link2, Zap, Calendar } from 'lucide-react'
import '../lib/base.css'
import { useSmooth, Ribbon, LineReveal, Reveal, useBooking, phoneFocus, CheckDraw, MapFrame, CallBar, tel, useLite, useIsMobile } from '../lib/kit'

const HarbourScene = lazy(() => import('./avtogavan3d'))

const b = {
  name: 'Автогавань', addr: 'ул. 40 лет Победы, 5А', place: 'д. Боровляны', near: 'у МКАД',
  phone: '+375 29 131-00-95', rating: '5,0', rev: 275, revWord: 'оценок', oid: '234530365959',
}
const FULL = `${b.place}, ${b.addr}`
const SAND = '#f3ece0', SAND2 = '#e8dcc8', PAPER = '#fbf8f2', NAVY = '#0f2a44', NAVY2 = '#173a5e', AMBER = '#f0b54a', INK = '#0f2a44'
const SANS = "font-['IBM_Plex_Sans',sans-serif]", MONO = "font-['IBM_Plex_Mono',monospace]"
const go = id => { const el = document.querySelector(id); if (!el) return; window.__lenis ? window.__lenis.scrollTo(el, { offset: -72 }) : el.scrollIntoView({ behavior: 'smooth' }) }
const pick = svc => { window.dispatchEvent(new CustomEvent('ag-svc', { detail: svc })); go('#book') }
const YA_ROUTE = `https://yandex.by/maps/?rtext=~${encodeURIComponent('Минский район, ' + FULL)}&rtt=auto`
const G_ROUTE = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent('Боровляны, улица 40 лет Победы 5А')}`

function Label({ children, light, className = '' }) {
  return <p className={`${MONO} text-[14px] font-medium uppercase tracking-[.14em] ${light ? 'text-[#f0b54a]' : 'text-[#173a5e]'} ${className}`}>{children}</p>
}
function H2({ children, className = '' }) {
  return <h2 className={`${SANS} text-[clamp(36px,4.6vw,64px)] font-semibold leading-[1.02] tracking-[-0.03em] ${className}`}>{children}</h2>
}
function Mark({ size = 30, color = NAVY }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="16" cy="16" r="15" stroke={color} strokeWidth="1.5" />
      <path d="M13 25 L14.2 11 H17.8 L19 25 Z" fill={color} />
      <rect x="13.6" y="7.6" width="4.8" height="3" rx=".6" fill={AMBER} />
      <path d="M18.6 9 L28 5.5 V12.5 Z" fill={AMBER} opacity=".55" />
    </svg>
  )
}

/* ---------------- film ---------------- */
// ranges must match avtogavan3d.jsx
const R = [[0.16, 0.34], [0.36, 0.54], [0.56, 0.74], [0.76, 0.94]]
const CH = [
  { k: 'Развал-схождение', t: 'Машина едет прямо', d: 'Настроим углы колёс на стенде: руль ровно, резина изнашивается равномерно.', svc: 'Развал-схождение' },
  { k: 'Шиномонтаж', t: 'Сезонная смена без суеты', d: 'Снимем, смонтируем, отбалансируем. По предзаписи — в назначенное время.', svc: 'Шиномонтаж и балансировка' },
  { k: 'ТО', t: 'Плановое ТО', d: 'Масло, фильтры, жидкости и осмотр. Что менять — согласуем до начала работ.', svc: 'Техническое обслуживание' },
  { k: 'Фаркоп', t: 'Фаркоп под ваш кузов', d: 'Подберём тип — съёмный, фланцевый или скрытый — и подключим розетку.', svc: 'Установка фаркопа' },
]
function Chapter({ p, i, c }) {
  const [a, z] = R[i]
  const o = useTransform(p, [a - 0.04, a + 0.01, z - 0.01, z + 0.03], [0, 1, 1, 0])
  const y = useTransform(p, [a - 0.04, a + 0.01, z - 0.01, z + 0.03], [28, 0, 0, -22])
  const pe = useTransform(o, v => (v > 0.6 ? 'auto' : 'none'))
  return (
    <motion.div style={{ opacity: o, y, pointerEvents: pe }} className="absolute inset-0 flex flex-col justify-center text-[#fbf8f2]">
      <p className={`${MONO} text-[15px] font-medium uppercase tracking-[.14em] text-[#f0b54a]`}>Причал 0{i + 1} / 04 · {c.k}</p>
      <h2 className={`${SANS} mt-4 text-[clamp(40px,4.6vw,72px)] font-semibold leading-[1.0] tracking-[-0.03em]`}>{c.t}</h2>
      <p className="mt-5 max-w-[460px] text-[19px] leading-relaxed text-[#fbf8f2]/85">{c.d}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" onClick={() => (i === 3 ? go('#towbar') : pick(c.svc))} className="inline-flex h-14 items-center gap-2 rounded-[10px] px-7 text-[17px] font-semibold text-[#0f2a44] hover:brightness-105" style={{ background: AMBER }}>{i === 3 ? 'Подобрать фаркоп' : 'Записаться'} <ArrowRight size={18} /></button>
        <a href={'tel:' + tel(b.phone)} className="inline-flex h-14 items-center gap-2 rounded-[10px] border border-[#fbf8f2]/50 px-6 text-[17px] font-semibold hover:bg-[#fbf8f2] hover:text-[#0f2a44]"><Phone size={18} />Позвонить</a>
      </div>
    </motion.div>
  )
}
function Tick({ p, i }) {
  const [a, z] = R[i]
  const bg = useTransform(p, [a - 0.02, a, z, z + 0.02], ['rgba(251,248,242,.25)', AMBER, AMBER, 'rgba(251,248,242,.25)'])
  const h = useTransform(p, [a - 0.02, a, z, z + 0.02], [14, 36, 36, 14])
  return <motion.span style={{ background: bg, height: h }} className="w-[3px] rounded-full" />
}
function MobCaption({ p }) {
  const [i, setI] = useState(-1)
  useEffect(() => p.on('change', v => setI(R.findIndex(([a, z]) => v >= a && v <= z + 0.02))), [p])
  return (
    <AnimatePresence>{i >= 0 && <motion.span key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`${MONO} absolute bottom-3 left-3 rounded-md bg-[#0f2a44]/85 px-3 py-1.5 text-[15px] font-medium text-[#f0b54a]`}>0{i + 1} · {CH[i].k}</motion.span>}</AnimatePresence>
  )
}
function Stage({ p, lite, active, mob }) {
  const mask = mob ? undefined : { WebkitMaskImage: 'radial-gradient(ellipse 62% 58% at 50% 52%, #000 55%, transparent 100%)', maskImage: 'radial-gradient(ellipse 62% 58% at 50% 52%, #000 55%, transparent 100%)' }
  return (
    <div className="relative h-full w-full overflow-hidden" style={mask}>
      {lite ? (
        <svg viewBox="0 0 300 300" className="absolute inset-0 m-auto h-full w-full" aria-hidden="true">
          <path d="M150 112 L250 70 L250 154 Z" fill={AMBER} opacity=".22" />
          <path d="M134 250 L141 120 H159 L166 250 Z" fill={PAPER} stroke={NAVY2} />
          {[0, 1, 2].map(i => <path key={i} d={`M${136 + i * 1.6} ${226 - i * 40} L${164 - i * 1.6} ${226 - i * 40} L${163 - i * 1.6} ${206 - i * 40} L${137 + i * 1.6} ${206 - i * 40} Z`} fill={NAVY2} />)}
          <rect x="140" y="104" width="20" height="16" fill={AMBER} /><path d="M136 104 L150 90 L164 104 Z" fill={NAVY2} />
          <path d="M60 252 H240" stroke={NAVY2} strokeOpacity=".4" />
        </svg>
      ) : active && <Suspense fallback={null}><HarbourScene progress={p} active={active} mobile={mob} /></Suspense>}
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
    const c = animate(auto, [0, 0.1, 0.25, 0.45, 0.65, 0.85, 0.96, 0.96], { duration: 24, repeat: Infinity, ease: 'easeInOut' })
    return () => c.stop()
  }, [mob])
  const p = mob ? auto : sp
  const near = useInView(ref, { margin: '200px 0px' })
  const [mounted, setMounted] = useState(false)
  useEffect(() => { if (near) setMounted(true) }, [near])
  const heroO = useTransform(sp, [0, 0.11], [1, 0])
  const heroY = useTransform(sp, [0, 0.11], [0, -30])
  const heroPE = useTransform(sp, v => (v < 0.07 ? 'auto' : 'none'))
  const bg = useTransform(sp, [0.03, 0.2], [SAND, NAVY])
  const mobBg = useTransform(auto, [0.03, 0.2, 0.94, 1], [SAND2, NAVY, NAVY, SAND2])
  return (
    <motion.section ref={ref} id="top" className="relative md:h-[290vh]" style={{ background: mob ? SAND : bg }}>
      <div className="md:sticky md:top-[72px] md:h-[calc(100svh-72px)]">
        <div className="mx-auto grid h-full max-w-[1360px] grid-cols-1 gap-5 px-5 pb-10 pt-5 md:grid-cols-[1.05fr_0.95fr] md:items-center md:gap-10 md:px-10 md:py-6">
          <div className="relative order-2 min-w-0 md:order-1 md:h-[min(600px,88%)]">
            <motion.div style={mob ? undefined : { opacity: heroO, y: heroY, pointerEvents: heroPE }} className="flex h-full flex-col justify-center text-[#0f2a44]">
              <Label>Автосервис · {b.place}, {b.near}</Label>
              <h1 className={`${SANS} mt-4 text-[clamp(40px,5vw,76px)] font-semibold leading-[0.98] tracking-[-0.035em]`}>
                <LineReveal delay={0.05}>Развал-схождение,</LineReveal>
                <LineReveal delay={0.13}>шиномонтаж, ТО</LineReveal>
                <LineReveal delay={0.21}><span className="text-[#173a5e]/60">и фаркопы у МКАД</span></LineReveal>
              </h1>
              <p className="mt-6 max-w-[520px] text-[19px] leading-relaxed text-[#0f2a44]/85">Спокойная гавань для вашей машины: записываетесь заранее — приезжаете к своему времени, без очереди.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a href="#book" className="inline-flex h-16 items-center justify-center gap-2 rounded-[12px] px-8 text-[19px] font-semibold text-white hover:bg-[#173a5e]" style={{ background: NAVY }}>Записаться <ArrowRight size={20} /></a>
                <a href={'tel:' + tel(b.phone)} className="inline-flex h-16 items-center justify-center gap-3 rounded-[12px] border border-[#0f2a44]/40 px-7 text-[19px] font-semibold hover:border-[#0f2a44]"><Phone size={20} />{b.phone}</a>
              </div>
              <dl className="mt-8 grid grid-cols-1 border-y border-[#0f2a44]/20 sm:grid-cols-3">
                <div className="flex items-center gap-3 border-b border-[#0f2a44]/15 py-3 sm:block sm:border-b-0 sm:border-r sm:py-4 sm:pr-4">
                  <dt className={`${MONO} text-[14px] uppercase tracking-[.12em] text-[#173a5e]`}>Яндекс Карты</dt>
                  <dd className="flex items-center gap-1.5 text-[17px] font-semibold sm:mt-1"><Star size={17} fill={AMBER} stroke="#b07a17" />{b.rating} · {b.rev} {b.revWord}</dd>
                </div>
                <div className="flex items-center gap-3 border-b border-[#0f2a44]/15 py-3 sm:block sm:border-b-0 sm:border-r sm:px-4 sm:py-4">
                  <dt className={`${MONO} text-[14px] uppercase tracking-[.12em] text-[#173a5e]`}>Где</dt>
                  <dd className="text-[17px] font-semibold sm:mt-1">{b.place}, {b.addr}</dd>
                </div>
                <div className="flex items-center gap-3 py-3 sm:block sm:py-4 sm:pl-4">
                  <dt className={`${MONO} text-[14px] uppercase tracking-[.12em] text-[#173a5e]`}>Запись</dt>
                  <dd className="text-[17px] font-semibold sm:mt-1">Предзапись — к времени</dd>
                </div>
              </dl>
              <a href="#services" className="mt-5 hidden w-fit text-[16px] font-medium underline decoration-[#f0b54a] decoration-2 underline-offset-4 md:inline-block">Пропустить → к услугам</a>
            </motion.div>
            {!mob && CH.map((c, i) => <Chapter key={c.k} p={sp} i={i} c={c} />)}
          </div>
          <motion.div className="relative order-1 h-[34svh] min-h-[220px] min-w-0 overflow-hidden rounded-[18px] md:order-2 md:h-[min(680px,92%)] md:rounded-none" style={mob ? { background: mobBg } : undefined}>
            {mounted || mob ? <Stage p={p} lite={lite} active={near} mob={mob} /> : null}
            {!mob && <div className="absolute right-2 top-1/2 flex -translate-y-1/2 flex-col items-center gap-2" aria-hidden="true">{R.map((_, i) => <Tick key={i} p={sp} i={i} />)}</div>}
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}

/* ---------------- services ---------------- */
const SVC = [
  { t: 'Развал-схождение', d: 'Проверка и регулировка углов установки колёс на стенде.', time: 'обычно около часа', I: Gauge },
  { t: 'Шиномонтаж и балансировка', d: 'Сезонная смена колёс, монтаж шин, балансировка.', time: 'обычно 30–60 минут', I: Disc3 },
  { t: 'Техническое обслуживание', d: 'Замена масла и фильтров, проверка жидкостей и узлов.', time: 'зависит от регламента', I: Cog },
  { t: 'Установка фаркопа', d: 'Съёмный, фланцевый или скрытый — подбор под кузов и задачу.', time: 'зависит от модели', I: Link2 },
  { t: 'Электрика для фаркопа', d: 'Подключение розетки 7 или 13 pin, проверка фонарей прицепа.', time: 'уточним по модели', I: Zap },
]
function Services() {
  return (
    <section id="services" className="px-5 py-24 md:px-10 md:py-32" style={{ background: SAND }}>
      <div className="mx-auto max-w-[1240px]">
        <div className="grid gap-6 md:grid-cols-2 md:items-end">
          <div><Label>Услуги</Label><H2 className="mt-3 text-[#0f2a44]">Чем займёмся</H2></div>
          <p className="max-w-[460px] text-[18px] leading-relaxed text-[#0f2a44]/80 md:justify-self-end">Цена зависит от машины и объёма работ — мастер уточнит при записи. Нажмите «Записаться», и услуга сразу попадёт в заявку.</p>
        </div>
        <ul className="mt-14 border-t border-[#0f2a44]/25">
          {SVC.map((s, i) => (
            <Reveal as="li" key={s.t} delay={i * 0.04} className="grid grid-cols-[44px_1fr] items-center gap-x-4 gap-y-4 border-b border-[#0f2a44]/15 py-7 md:grid-cols-[70px_56px_1.1fr_1fr_auto] md:gap-x-6">
              <span className={`${MONO} hidden text-[15px] text-[#173a5e] md:block`}>0{i + 1}</span>
              <span className="grid h-11 w-11 place-items-center rounded-full border border-[#0f2a44]/25 text-[#173a5e] md:h-14 md:w-14"><s.I size={22} /></span>
              <div>
                <h3 className={`${SANS} text-[25px] font-semibold leading-tight tracking-[-0.02em] text-[#0f2a44] md:text-[28px]`}>{s.t}</h3>
                <p className={`${MONO} mt-1 text-[14px] text-[#0f2a44]/70`}>{s.time} · цена — уточнит мастер</p>
              </div>
              <p className="col-span-2 text-[18px] leading-relaxed text-[#0f2a44]/80 md:col-span-1">{s.d}</p>
              <button type="button" onClick={() => (s.t === 'Установка фаркопа' ? go('#towbar') : pick(s.t))} className="col-span-2 inline-flex h-14 w-full items-center justify-center gap-2 rounded-[12px] border border-[#0f2a44] px-6 text-[17px] font-semibold text-[#0f2a44] transition-colors hover:bg-[#0f2a44] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f2a44] md:col-span-1 md:w-auto">
                {s.t === 'Установка фаркопа' ? 'Подобрать' : 'Записаться'}
              </button>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ---------------- towbar configurator ---------------- */
const BODIES = [
  { k: 'Седан', d: 'M18 84 V72 Q20 64 40 62 L96 56 L130 34 Q138 30 150 30 H206 Q218 30 228 38 L256 58 L292 62 Q302 64 302 74 V84 Z', g: 'M136 38 L148 34 H200 Q212 34 220 42 L238 56 H128 Z' },
  { k: 'Универсал', d: 'M18 84 V72 Q20 64 40 62 L96 56 L128 32 Q134 28 146 28 H282 Q292 28 296 38 L302 60 V84 Z', g: 'M134 36 L146 32 H280 Q288 32 290 40 L294 54 H124 Z' },
  { k: 'Кроссовер', d: 'M16 86 V70 Q18 60 38 58 L92 52 L124 28 Q132 24 144 24 H262 Q276 24 284 34 L298 54 Q304 58 304 68 V86 Z', g: 'M130 32 L142 28 H260 Q272 28 278 36 L290 50 H120 Z' },
  { k: 'Внедорожник', d: 'M16 86 V60 Q16 52 30 50 L88 46 L108 18 Q112 14 122 14 H286 Q296 14 298 24 L302 50 V86 Z', g: 'M114 22 L122 18 H284 Q292 18 293 26 L295 44 H100 Z' },
  { k: 'Минивэн', d: 'M16 86 V64 Q18 54 34 50 L70 22 Q78 14 92 14 H284 Q298 14 300 28 L304 56 V86 Z', g: 'M78 26 Q84 18 94 18 H282 Q294 18 296 30 L298 46 H64 Z' },
]
const TYPES = [
  { k: 'Съёмный', pro: ['Шар снимается — не мешает парковке и не цепляет номер', 'Незаметен, когда не нужен'], con: ['Шар нужно хранить и ставить перед поездкой'] },
  { k: 'Фланцевый', pro: ['Надёжное болтовое крепление', 'Можно сменить шар или высоту, удобно для велокрепления'], con: ['Шар всегда на виду'] },
  { k: 'Скрытый', pro: ['Почти не виден под бампером', 'Внешний вид авто не меняется'], con: ['Есть не для всех моделей — подбирается индивидуально'] },
]
const ELEC = [{ k: 'Не нужна', d: 'только тягово-сцепное' }, { k: '7-pin', d: 'базовые фонари прицепа' }, { k: '13-pin', d: 'больше функций, часто для кемперов и велобагажников' }, { k: 'Не знаю', d: 'мастер подскажет' }]
function Towbar({ type, elec }) {
  return (
    <g>
      {type === 'Фланцевый' && <g><rect x="300" y="74" width="7" height="16" rx="1.5" fill={NAVY2} /><circle cx="303.5" cy="78" r="1.4" fill={PAPER} /><circle cx="303.5" cy="86" r="1.4" fill={PAPER} /><path d="M307 82 H320 V72" stroke={NAVY2} strokeWidth="4" fill="none" strokeLinecap="round" /><circle cx="320" cy="68" r="5.5" fill={NAVY2} /></g>}
      {type === 'Съёмный' && <g>
        <rect x="296" y="82" width="10" height="6" rx="1" fill={NAVY2} />
        <motion.g animate={{ y: [0, -5, 0], x: [0, 3, 0] }} transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}>
          <path d="M306 85 Q318 85 320 74" stroke={NAVY2} strokeWidth="4" fill="none" strokeLinecap="round" /><circle cx="320.5" cy="69" r="5.5" fill={NAVY2} />
        </motion.g>
      </g>}
      {type === 'Скрытый' && <g>
        <rect x="292" y="86" width="10" height="5" rx="1" fill={NAVY2} />
        <motion.g style={{ originX: '298px', originY: '88px' }} animate={{ rotate: [0, 0, 70, 70, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', times: [0, 0.2, 0.45, 0.75, 1] }}>
          <path d="M298 88 Q312 88 314 76" stroke={NAVY2} strokeWidth="4" fill="none" strokeLinecap="round" /><circle cx="314.5" cy="71" r="5.5" fill={NAVY2} />
        </motion.g>
      </g>}
      {elec && elec !== 'Не нужна' && <g><rect x="306" y="92" width="16" height="10" rx="3" fill={AMBER} /><text x="314" y="99.6" textAnchor="middle" fontSize="6.5" fontWeight="700" fill={NAVY} fontFamily="IBM Plex Mono, monospace">{elec === 'Не знаю' ? '?' : elec.replace('-pin', '')}</text></g>}
    </g>
  )
}
function Opt({ on, onClick, children, className = '' }) {
  return (
    <button type="button" aria-pressed={!!on} onClick={onClick}
      className={`min-h-[56px] rounded-[12px] border px-4 py-3 text-left text-[17px] font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f2a44] ${on ? 'border-[#0f2a44] bg-[#0f2a44] text-white' : 'border-[#0f2a44]/25 bg-white text-[#0f2a44] hover:border-[#0f2a44]'} ${className}`}>{children}</button>
  )
}
function TowbarPicker() {
  const [body, setBody] = useState('Кроссовер'), [type, setType] = useState('Съёмный'), [elec, setElec] = useState('13-pin')
  const B = BODIES.find(x => x.k === body), T = TYPES.find(x => x.k === type)
  const summary = `Фаркоп: ${body.toLowerCase()} · ${type.toLowerCase()} · электрика: ${elec === 'Не нужна' ? 'не нужна' : elec === 'Не знаю' ? 'нужна консультация' : 'розетка ' + elec}`
  return (
    <section id="towbar" className="px-5 py-24 md:px-10 md:py-32" style={{ background: PAPER }}>
      <div className="mx-auto max-w-[1240px]">
        <div className="grid gap-6 md:grid-cols-2 md:items-end">
          <div><Label>Подбор за минуту</Label><H2 className="mt-3 text-[#0f2a44]">Подобрать фаркоп</H2></div>
          <p className="max-w-[460px] text-[18px] leading-relaxed text-[#0f2a44]/80 md:justify-self-end">Выберите кузов, тип фаркопа и нужна ли розетка — мы получим готовый запрос. Совместимость с вашей моделью подтвердит мастер.</p>
        </div>
        <div className="mt-12 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-8">
            <fieldset>
              <legend className={`${MONO} text-[14px] uppercase tracking-[.12em] text-[#173a5e]`}>1 · Кузов</legend>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">{BODIES.map(x => <Opt key={x.k} on={body === x.k} onClick={() => setBody(x.k)} className="text-center text-[16px]">{x.k}</Opt>)}</div>
            </fieldset>
            <fieldset>
              <legend className={`${MONO} text-[14px] uppercase tracking-[.12em] text-[#173a5e]`}>2 · Тип фаркопа</legend>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {TYPES.map(x => (
                  <button key={x.k} type="button" aria-pressed={type === x.k} onClick={() => setType(x.k)}
                    className={`rounded-[14px] border p-4 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f2a44] ${type === x.k ? 'border-[#0f2a44] bg-[#0f2a44] text-white' : 'border-[#0f2a44]/25 bg-white text-[#0f2a44] hover:border-[#0f2a44]'}`}>
                    <span className="flex items-center justify-between text-[18px] font-semibold">{x.k}{type === x.k && <Check size={18} />}</span>
                    <ul className="mt-3 space-y-1.5 text-[16px] leading-snug">
                      {x.pro.map(t => <li key={t} className="flex gap-2"><span aria-hidden="true" className={type === x.k ? 'text-[#f0b54a]' : 'text-[#2f7a4f]'}>+</span><span className="opacity-90">{t}</span></li>)}
                      {x.con.map(t => <li key={t} className="flex gap-2"><span aria-hidden="true" className={type === x.k ? 'text-[#f0b54a]' : 'text-[#a3412a]'}>−</span><span className="opacity-90">{t}</span></li>)}
                    </ul>
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className={`${MONO} text-[14px] uppercase tracking-[.12em] text-[#173a5e]`}>3 · Электрика (розетка)</legend>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">{ELEC.map(x => <Opt key={x.k} on={elec === x.k} onClick={() => setElec(x.k)}><span className="block">{x.k}</span><span className="mt-0.5 block text-[14px] font-normal leading-snug opacity-80">{x.d}</span></Opt>)}</div>
            </fieldset>
          </div>
          <div className="lg:sticky lg:top-[96px] lg:self-start">
            <div className="overflow-hidden rounded-[20px] border border-[#0f2a44]/15 bg-[#f3ece0]">
              <div className="relative px-4 pb-2 pt-8" style={{ backgroundImage: 'linear-gradient(rgba(15,42,68,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(15,42,68,.07) 1px,transparent 1px)', backgroundSize: '24px 24px' }}>
                <p className={`${MONO} absolute left-4 top-3 text-[13px] uppercase tracking-[.12em] text-[#173a5e]`}>вид сбоку · схема</p>
                <svg viewBox="0 0 340 112" className="w-full" role="img" aria-label={`Схема: ${body}, фаркоп ${type.toLowerCase()}`}>
                  <line x1="0" y1="103" x2="340" y2="103" stroke={NAVY} strokeOpacity=".35" strokeDasharray="3 4" />
                  <AnimatePresence mode="wait">
                    <motion.g key={body} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 14 }} transition={{ duration: 0.3 }}>
                      <path d={B.d} fill={PAPER} stroke={NAVY} strokeWidth="2" strokeLinejoin="round" />
                      <path d={B.g} fill={NAVY2} opacity=".18" />
                      {[78, 248].map(x => <g key={x}><circle cx={x} cy="86" r="17" fill={NAVY} /><circle cx={x} cy="86" r="7" fill={SAND2} /></g>)}
                    </motion.g>
                  </AnimatePresence>
                  <Towbar type={type} elec={elec} />
                </svg>
              </div>
              <div className="border-t border-[#0f2a44]/15 bg-white p-6">
                <p className={`${MONO} text-[13px] uppercase tracking-[.12em] text-[#173a5e]`}>Ваш запрос</p>
                <p className="mt-2 text-[20px] font-semibold leading-snug text-[#0f2a44]">{body} · {type} · {elec === 'Не нужна' ? 'без розетки' : elec === 'Не знаю' ? 'розетка — посоветуйте' : 'розетка ' + elec}</p>
                <p className="mt-2 text-[16px] leading-relaxed text-[#0f2a44]/75">{T.pro[0]}. Стоимость и сроки назовёт мастер после уточнения модели.</p>
                <button type="button" onClick={() => pick(summary)} className="mt-5 inline-flex h-14 w-full items-center justify-center gap-2 rounded-[12px] text-[18px] font-semibold text-white hover:bg-[#173a5e]" style={{ background: NAVY }}>Отправить запрос <ArrowRight size={19} /></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- how ---------------- */
const HOW = [
  { t: 'Предзапись', d: `Звонок на ${b.phone} или заявка на сайте. Подберём день и время.` },
  { t: 'Приезжаете к времени', d: `${b.place}, ${b.addr} — сразу за МКАД.` },
  { t: 'Осмотр и согласование', d: 'Мастер посмотрит машину и согласует работы до начала.' },
  { t: 'Готово', d: 'Забираете машину и рекомендации, если они есть.' },
]
function How() {
  return (
    <section id="how" className="relative overflow-hidden px-5 py-24 text-[#fbf8f2] md:px-10 md:py-32" style={{ background: NAVY }}>
      <div className="mx-auto max-w-[1240px]">
        <Label light>Как мы работаем</Label>
        <H2 className="mt-3">Четыре спокойных шага</H2>
        <ol className="relative mt-16 grid gap-10 md:grid-cols-4 md:gap-6">
          <svg className="absolute left-0 right-0 top-[22px] hidden h-2 w-full md:block" preserveAspectRatio="none" viewBox="0 0 100 2" aria-hidden="true">
            <motion.line x1="0" y1="1" x2="100" y2="1" stroke={AMBER} strokeWidth=".5" strokeDasharray="1.2 1.2" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.6, ease: 'easeInOut' }} />
          </svg>
          {HOW.map((s, i) => (
            <Reveal as="li" key={s.t} delay={i * 0.1} className="relative">
              <span className={`${MONO} relative grid h-11 w-11 place-items-center rounded-full border border-[#f0b54a] bg-[#0f2a44] text-[16px] font-semibold text-[#f0b54a]`}>{i + 1}</span>
              <h3 className={`${SANS} mt-6 text-[24px] font-semibold tracking-[-0.02em]`}>{s.t}</h3>
              <p className="mt-2 text-[18px] leading-relaxed text-[#fbf8f2]/80">{s.d}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}

/* ---------------- booking ---------------- */
const B_SVC = SVC.map(s => s.t)
const WHEN = [{ t: 'Ближайшие дни', d: 'как можно раньше' }, { t: 'На этой неделе', d: 'в удобный день' }, { t: 'Назову дату', d: 'обсудим по телефону' }]
function Book() {
  const bk = useBooking()
  const [step, setStep] = useState(0), [when, setWhen] = useState(''), [car, setCar] = useState(''), [err, setErr] = useState('')
  const head = useRef(null)
  useEffect(() => { if (step) head.current?.focus() }, [step])
  useEffect(() => { const h = e => { bk.upd('svc', e.detail); setStep(0); setErr('') }; window.addEventListener('ag-svc', h); return () => window.removeEventListener('ag-svc', h) }, [])
  const next = e => {
    e.preventDefault()
    if (step === 0 && !bk.s.svc) return setErr('Выберите услугу')
    if (step === 1 && !when) return setErr('Выберите, когда удобно')
    setErr('')
    if (step < 2) setStep(step + 1); else bk.submit()
  }
  const custom = bk.s.svc && !B_SVC.includes(bk.s.svc)
  const titles = ['Что нужно сделать?', 'Когда удобно приехать?', 'Куда перезвонить?']
  const inp = 'mt-2 h-14 w-full rounded-[12px] border bg-white px-4 text-[18px] text-[#0f2a44] outline-none focus:border-[#0f2a44] focus:ring-2 focus:ring-[#0f2a44]/20'
  return (
    <section id="book" className="px-5 py-24 md:px-10 md:py-32" style={{ background: SAND }}>
      <div className="mx-auto grid max-w-[1240px] gap-10 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <Label>Предзапись</Label>
          <H2 className="mt-3 text-[#0f2a44]">Встаньте на причал заранее</H2>
          <p className="mt-6 max-w-[420px] text-[19px] leading-relaxed text-[#0f2a44]/80">Три коротких шага — и мы перезвоним, чтобы подтвердить время. Или сразу позвоните:</p>
          <a href={'tel:' + tel(b.phone)} className="mt-8 flex items-center gap-5 rounded-[18px] p-6 text-white transition-transform hover:-translate-y-0.5" style={{ background: NAVY }}>
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-[#f0b54a] text-[#f0b54a]"><Phone size={24} /></span>
            <span><span className="block text-[16px] opacity-85">Позвонить в Автогавань</span><span className="block text-[25px] font-semibold tracking-[-0.01em]">{b.phone}</span></span>
          </a>
        </div>
        <div className="rounded-[22px] border border-[#0f2a44]/12 bg-[#fbf8f2] p-6 md:p-10">
          {bk.s.sent ? (
            <div className="py-10 text-center text-[#0f2a44]" role="status">
              <CheckDraw className="mx-auto text-[#173a5e]" size={84} />
              <p className={`${SANS} mt-6 text-[34px] font-semibold tracking-[-0.02em]`}>Заявка принята</p>
              <p className="mx-auto mt-3 max-w-[420px] text-[18px] leading-relaxed text-[#0f2a44]/80">Перезвоним и подтвердим время. В готовом сайте заявка сразу придёт вам в Telegram.</p>
              <button type="button" onClick={() => { bk.reset(); setStep(0); setWhen(''); setCar('') }} className="mt-8 h-12 text-[17px] font-semibold underline underline-offset-4">Новая заявка</button>
            </div>
          ) : (
            <form onSubmit={next} noValidate className="text-[#0f2a44]">
              <div className="flex gap-2" aria-hidden="true">{[0, 1, 2].map(i => <span key={i} className="h-1.5 flex-1 rounded-full" style={{ background: i <= step ? NAVY : SAND2 }} />)}</div>
              <p className={`${MONO} mt-4 text-[14px] uppercase tracking-[.12em] text-[#173a5e]`}>Шаг {step + 1} из 3</p>
              <h3 ref={head} tabIndex={-1} className={`${SANS} mb-6 mt-1 text-[30px] font-semibold tracking-[-0.02em] outline-none`}>{titles[step]}</h3>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={step} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }} transition={{ duration: 0.2 }}>
                  {step === 0 && <div className="grid gap-2.5 sm:grid-cols-2">
                    {custom && <Opt on onClick={() => {}} className="sm:col-span-2">{bk.s.svc}</Opt>}
                    {B_SVC.map(s => <Opt key={s} on={bk.s.svc === s} onClick={() => { bk.upd('svc', s); setErr('') }}>{s}</Opt>)}
                  </div>}
                  {step === 1 && (<>
                    <div className="grid gap-2.5 sm:grid-cols-3">{WHEN.map(({ t, d }) => <Opt key={t} on={when === t} onClick={() => { setWhen(t); setErr('') }}><Calendar size={20} className="mb-2" /><span className="block">{t}</span><span className="block text-[14px] font-normal opacity-80">{d}</span></Opt>)}</div>
                    <label htmlFor="ag-car" className="mt-7 block text-[17px] font-semibold">Марка и модель <span className="font-normal text-[#0f2a44]/65">(необязательно)</span></label>
                    <input id="ag-car" value={car} onChange={e => setCar(e.target.value)} placeholder="Например, Skoda Octavia 2018" className={inp + ' border-[#0f2a44]/25'} />
                  </>)}
                  {step === 2 && (<div className="space-y-5">
                    <div><label htmlFor="ag-name" className="text-[17px] font-semibold">Как к вам обращаться</label>
                      <input id="ag-name" value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} autoComplete="name" className={inp + ' border-[#0f2a44]/25'} /></div>
                    <div><label htmlFor="ag-phone" className="text-[17px] font-semibold">Телефон</label>
                      <input id="ag-phone" value={bk.s.phone} onChange={e => bk.upd('phone', e.target.value)} onFocus={phoneFocus(bk)} type="tel" inputMode="tel" autoComplete="tel" placeholder="+375 __ ___-__-__" aria-invalid={bk.s.err} aria-describedby={bk.s.err ? 'ag-perr' : undefined}
                        className={`${inp} ${bk.s.err ? 'border-[#b42318]' : 'border-[#0f2a44]/25'}`} /></div>
                    {bk.s.err && <p id="ag-perr" className="text-[16px] font-semibold text-[#b42318]">Проверьте номер: 12 цифр, начиная с +375.</p>}
                    <p className="rounded-[12px] p-4 text-[16px]" style={{ background: SAND }}>{bk.s.svc} · {when}{car ? ' · ' + car : ''}</p>
                  </div>)}
                </motion.div>
              </AnimatePresence>
              {err && <p className="mt-4 text-[16px] font-semibold text-[#b42318]" role="alert">{err}</p>}
              <div className="mt-8 flex items-center justify-between gap-4">
                {step > 0 ? <button type="button" onClick={() => setStep(step - 1)} className="h-14 px-2 text-[17px] font-semibold text-[#0f2a44]/75 hover:text-[#0f2a44]">← Назад</button> : <span />}
                <button type="submit" disabled={bk.s.loading} className="inline-flex h-14 items-center gap-2 rounded-[12px] px-8 text-[18px] font-semibold text-white disabled:opacity-60" style={{ background: NAVY }}>{step < 2 ? 'Дальше' : bk.s.loading ? 'Отправляем…' : 'Записаться'} <ArrowRight size={19} /></button>
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
  const vals = [['Предзапись', 'Приезжаете к своему времени, а не в общую очередь.'], ['Сразу за МКАД', `${b.place} — удобно заехать из Минска.`], ['Согласуем заранее', 'Работы и их объём обсуждаются до начала.']]
  return (
    <section id="reviews" className="px-5 py-24 md:px-10 md:py-32" style={{ background: PAPER }}>
      <div className="mx-auto grid max-w-[1240px] gap-12 text-[#0f2a44] md:grid-cols-[0.9fr_1.1fr] md:items-center">
        <div>
          <Label>Отзывы</Label>
          <p className={`${SANS} mt-3 text-[clamp(110px,15vw,210px)] font-semibold leading-[.85] tracking-[-0.05em]`}>{b.rating}</p>
          <div className="mt-4 flex gap-1" aria-hidden="true">{[0, 1, 2, 3, 4].map(i => <Star key={i} size={26} fill={AMBER} stroke="#b07a17" />)}</div>
          <p className="mt-4 text-[20px]">{b.rev} {b.revWord} на Яндекс Картах</p>
          <a href={`https://yandex.by/maps/org/${b.oid}/reviews/`} target="_blank" rel="noopener" className="mt-6 inline-flex h-14 items-center gap-2 rounded-[12px] border border-[#0f2a44] px-6 text-[17px] font-semibold hover:bg-[#0f2a44] hover:text-white">Читать отзывы <ArrowRight size={18} /></a>
        </div>
        <ul className="grid gap-4">
          {vals.map(([t, d], i) => (
            <Reveal as="li" key={t} delay={i * 0.08} className="flex gap-5 rounded-[18px] border border-[#0f2a44]/15 bg-white p-6">
              <span className={`${MONO} text-[15px] text-[#173a5e]`}>0{i + 1}</span>
              <div><h3 className={`${SANS} text-[24px] font-semibold tracking-[-0.02em]`}>{t}</h3><p className="mt-1 text-[18px] leading-relaxed text-[#0f2a44]/80">{d}</p></div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ---------------- faq ---------------- */
const FAQ = [
  ['Сколько длится развал-схождение?', 'Обычно около часа, но многое зависит от машины и состояния подвески. Точнее скажет мастер при записи.'],
  ['Можно приехать без записи?', 'Можно позвонить и уточнить, есть ли свободное окно. По предзаписи вы приезжаете к своему времени.'],
  ['Сколько времени занимает установка фаркопа?', 'Зависит от модели авто, типа фаркопа и подключения электрики. Срок назовём, когда узнаем модель.'],
  ['Нужно ли привозить фаркоп с собой?', 'Обсудим при записи: подскажем, какой вариант подходит вашему кузову и как удобнее организовать.'],
  ['Как оплатить?', 'Способы оплаты уточняйте по телефону.'],
  ['Где оставить машину?', `Сервис находится в ${b.place.replace('д.', 'деревне')}, ${b.addr}. Где удобнее встать — подскажем по телефону.`],
]
function Faq() {
  const [open, setOpen] = useState(0)
  return (
    <section id="faq" className="px-5 py-24 md:px-10 md:py-28" style={{ background: SAND }}>
      <div className="mx-auto grid max-w-[1240px] gap-10 text-[#0f2a44] md:grid-cols-[0.8fr_1.2fr]">
        <div>
          <Label>Вопросы</Label>
          <H2 className="mt-3">Частые вопросы</H2>
          <p className="mt-5 text-[18px] text-[#0f2a44]/80">Не нашли ответ? <a href={'tel:' + tel(b.phone)} className="font-semibold underline underline-offset-4">{b.phone}</a></p>
        </div>
        <div className="border-t border-[#0f2a44]/25">
          {FAQ.map(([q, a], i) => (
            <div key={q} className="border-b border-[#0f2a44]/15">
              <h3>
                <button type="button" aria-expanded={open === i} aria-controls={'agf-' + i} onClick={() => setOpen(open === i ? -1 : i)} className="flex min-h-[72px] w-full items-center justify-between gap-4 py-4 text-left text-[20px] font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0f2a44]">
                  {q}<span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border ${open === i ? 'border-[#0f2a44] bg-[#0f2a44] text-white' : 'border-[#0f2a44]/30'}`}>{open === i ? <Minus size={18} /> : <Plus size={18} />}</span>
                </button>
              </h3>
              <AnimatePresence initial={false}>
                {open === i && <motion.div id={'agf-' + i} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden"><p className="pb-6 text-[18px] leading-relaxed text-[#0f2a44]/80">{a}</p></motion.div>}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------- contact ---------------- */
function RouteChart() {
  return (
    <svg viewBox="0 0 320 200" className="w-full" role="img" aria-label="Схема: Боровляны находятся сразу за МКАД">
      <defs><pattern id="ag-grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="#fbf8f2" strokeOpacity=".08" /></pattern></defs>
      <rect width="320" height="200" fill="url(#ag-grid)" />
      <ellipse cx="130" cy="118" rx="96" ry="72" fill="none" stroke="#fbf8f2" strokeOpacity=".55" strokeWidth="2" />
      <text x="130" y="122" textAnchor="middle" fill="#fbf8f2" fillOpacity=".7" fontSize="13" fontFamily="IBM Plex Mono, monospace">МИНСК</text>
      <text x="40" y="58" fill="#fbf8f2" fillOpacity=".6" fontSize="11" fontFamily="IBM Plex Mono, monospace">МКАД</text>
      <motion.path d="M130 118 C 170 100, 200 70, 240 46" fill="none" stroke={AMBER} strokeWidth="2.5" strokeDasharray="5 6" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.4, ease: 'easeInOut' }} />
      <circle cx="244" cy="44" r="16" fill={AMBER} fillOpacity=".2" /><circle cx="244" cy="44" r="7" fill={AMBER} />
      <text x="262" y="40" fill="#fbf8f2" fontSize="12" fontWeight="600" fontFamily="IBM Plex Sans, sans-serif">Автогавань</text>
      <text x="262" y="56" fill="#fbf8f2" fillOpacity=".7" fontSize="10.5" fontFamily="IBM Plex Mono, monospace">Боровляны</text>
      <text x="310" y="192" textAnchor="end" fill="#fbf8f2" fillOpacity=".45" fontSize="10" fontFamily="IBM Plex Mono, monospace">схема, не в масштабе</text>
    </svg>
  )
}
function Contact() {
  return (
    <section id="contact" className="px-5 py-24 md:px-10 md:py-32" style={{ background: PAPER }}>
      <div className="mx-auto max-w-[1240px] text-[#0f2a44]">
        <Label>Контакты</Label>
        <H2 className="mt-3">Как нас найти</H2>
        <div className="mt-12 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="flex flex-col gap-6">
            <div className="rounded-[20px] p-6 text-[#fbf8f2] md:p-8" style={{ background: NAVY }}>
              <p className={`${MONO} text-[14px] uppercase tracking-[.12em] text-[#f0b54a]`}>Маршрут</p>
              <p className={`${SANS} mt-2 text-[26px] font-semibold leading-tight tracking-[-0.02em]`}>{b.place}, {b.addr}</p>
              <p className="mt-2 text-[17px] text-[#fbf8f2]/80">Минский район, сразу за МКАД. Постройте маршрут в навигаторе:</p>
              <div className="mt-4"><RouteChart /></div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <a href={YA_ROUTE} target="_blank" rel="noopener" className="inline-flex h-14 items-center justify-center gap-2 rounded-[12px] text-[17px] font-semibold text-[#0f2a44]" style={{ background: AMBER }}><Navigation size={18} />Яндекс Карты</a>
                <a href={G_ROUTE} target="_blank" rel="noopener" className="inline-flex h-14 items-center justify-center gap-2 rounded-[12px] border border-[#fbf8f2]/50 text-[17px] font-semibold hover:bg-[#fbf8f2] hover:text-[#0f2a44]"><Navigation size={18} />Google Maps</a>
              </div>
            </div>
            <ul className="space-y-4 text-[19px]">
              <li className="flex items-start gap-3"><Clock className="mt-1 shrink-0 text-[#173a5e]" size={22} />Часы работы — уточняйте по телефону</li>
              <li><a href={'tel:' + tel(b.phone)} className="flex items-center gap-3 text-[26px] font-semibold"><Phone size={22} className="text-[#173a5e]" />{b.phone}</a></li>
            </ul>
          </div>
          <div className="min-h-[380px] overflow-hidden rounded-[20px] border border-[#0f2a44]/15 lg:min-h-[560px]"><MapFrame oid={b.oid} /></div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- header ---------------- */
const NAV = [['#services', 'Услуги'], ['#towbar', 'Фаркоп'], ['#how', 'Как работаем'], ['#reviews', 'Отзывы'], ['#contact', 'Контакты']]
function useActive() {
  const [a, setA] = useState('')
  useEffect(() => {
    const els = ['#services', '#towbar', '#how', '#book', '#reviews', '#faq', '#contact'].map(h => document.querySelector(h)).filter(Boolean)
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) setA('#' + e.target.id) }), { rootMargin: '-45% 0px -50% 0px' })
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])
  return a === '#book' ? '#how' : a === '#faq' ? '#reviews' : a
}
function Header() {
  const active = useActive()
  return (
    <header className="sticky top-0 z-50 border-b border-[#0f2a44]/12 bg-[#fbf8f2]/92 backdrop-blur">
      <div className="mx-auto flex h-[64px] max-w-[1360px] items-center justify-between gap-4 px-4 md:h-[72px] md:px-10">
        <a href="#top" className="flex min-w-0 items-center gap-3" aria-label="Автогавань — наверх">
          <Mark />
          <span className="leading-none">
            <span className={`${SANS} block text-[21px] font-semibold tracking-[-0.02em] text-[#0f2a44]`}>Автогавань</span>
            <span className={`${MONO} mt-1 block truncate text-[12.5px] uppercase tracking-[.1em] text-[#173a5e]`}>Боровляны · у МКАД</span>
          </span>
        </a>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Разделы">
          {NAV.map(([h, t]) => <a key={h} href={h} aria-current={active === h ? 'true' : undefined} className={`relative px-3 py-2 text-[16.5px] font-medium text-[#0f2a44] transition-colors`}>
            {t}{active === h && <motion.span layoutId="ag-nav" className="absolute inset-x-3 -bottom-0.5 h-[2px] bg-[#f0b54a]" />}
          </a>)}
        </nav>
        <div className="flex shrink-0 items-center gap-3">
          <a href={'tel:' + tel(b.phone)} className="hidden text-[17px] font-semibold text-[#0f2a44] xl:inline">{b.phone}</a>
          <a href={'tel:' + tel(b.phone)} aria-label={'Позвонить ' + b.phone} className="grid h-11 w-11 place-items-center rounded-[10px] border border-[#0f2a44]/30 text-[#0f2a44] sm:hidden"><Phone size={19} /></a>
          <a href="#book" className="hidden h-11 items-center gap-2 rounded-[10px] px-5 text-[16.5px] font-semibold text-white sm:inline-flex" style={{ background: NAVY }}>Записаться</a>
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
      <div className={`${SANS} text-[18px] text-[#0f2a44]`} style={{ background: SAND, '--sel': NAVY, '--selc': '#fff' }}>
        <Ribbon name={b.name} bg={NAVY} fg={SAND} />
        <Header />
        <main>
          <Film lite={lite} />
          <Services />
          <TowbarPicker />
          <How />
          <Book />
          <Rating />
          <Faq />
          <Contact />
        </main>
        <footer className="px-5 py-10 text-[16px] md:px-10" style={{ background: NAVY, color: 'rgba(251,248,242,.75)' }}>
          <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-4"><span className="flex items-center gap-3"><Mark size={26} color="#fbf8f2" />© 2026 {b.name} · Концепт сайта — Артём</span><span>{FULL}</span></div>
        </footer>
        <CallBar phone={b.phone} barCls="bg-[#fbf8f2]/95 backdrop-blur border-t border-[#0f2a44]/12" callCls="rounded-[12px] border border-[#0f2a44] text-[#0f2a44] text-[18px]" bookCls="rounded-[12px] bg-[#0f2a44] text-white text-[18px]" />
        <div className="h-[76px] sm:hidden" style={{ background: NAVY }} />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
