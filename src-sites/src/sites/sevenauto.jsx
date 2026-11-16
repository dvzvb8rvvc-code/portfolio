import React, { useRef, useState, useEffect, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, useSpring, useMotionValueEvent, useMotionTemplate, useInView, AnimatePresence, MotionConfig } from 'framer-motion'
import { ArrowRight, ArrowUpRight, Phone, MapPin, Star, ChevronLeft } from 'lucide-react'
import '../lib/base.css'
import { LineReveal, useSmooth, Ribbon, Reveal, useBooking, phoneFocus, CheckDraw, MapFrame, CallBar, tel, useLite, IG } from '../lib/kit'

const Engine3D = lazy(() => import('./sevenauto3d'))

const b = {
  name: '7auto',
  addr: 'ул. Академика Жебрака, 26, помещение 3, Минск',
  short: 'Жебрака, 26',
  phone: '+375 44 773-77-00',
  ig: 'https://instagram.com/sevenavto',
  rating: '4.5', rev: 195, oid: '214265357350',
}
const PAPER = '#e6e8eb', INK = '#0d0f12', ACC = '#ff4d17', DARK = '#0b0d10'
const MONO = "font-['JetBrains_Mono',monospace]"

const CH = [
  { k: 'ГРМ', t: 'Фазы — по меткам.', d: 'Ремень или цепь, ролики, натяжитель, распредвалы. Меняем комплектом и выставляем по меткам.', s: ['ремень / цепь', 'ролики', 'распредвалы'] },
  { k: 'ЦПГ', t: 'Измеряем, а не на глаз.', d: 'Поршни, кольца, вкладыши, коленвал. Дефектовка, капремонт, сборка по моментам затяжки.', s: ['поршни', 'шатуны', 'коленвал'] },
  { k: 'Электрика', t: 'Ток идёт по цепи. Мы — по схеме.', d: 'Аккумулятор, стартер, генератор, зажигание, проводка, блоки управления.', s: ['стартер', 'генератор', 'ЭБУ'] },
  { k: 'Сборка', t: 'Собрано. Проверено.', d: 'После ремонта двигатель проверяем под нагрузкой и на диагностике, прежде чем отдать машину.', s: ['моменты', 'проверка', 'выдача'] },
]

/* ---------------- pinned film ---------------- */
function LiteEngine({ idx }) {
  const on = i => idx === i ? ACC : 'currentColor'
  return (
    <svg viewBox="0 0 400 300" fill="none" strokeWidth="3" className="absolute left-1/2 top-[28%] w-[min(86vw,620px)] -translate-x-1/2 -translate-y-1/2 md:left-[64%] md:top-1/2">
      <rect x="60" y="90" width="260" height="120" rx="8" stroke="currentColor" />
      <rect x="70" y="50" width="240" height="40" rx="8" stroke={on(1)} />
      {[100, 160, 220, 280].map((x, i) => <g key={x}><rect x={x - 20} y={110} width="40" height="34" stroke={on(2)}><animate attributeName="y" values={i % 3 ? '130;110;130' : '110;130;110'} dur="1s" repeatCount="indefinite" /></rect></g>)}
      <circle cx="350" cy="230" r="22" stroke={on(1)} /><circle cx="350" cy="70" r="16" stroke={on(1)} /><path d="M350 54 L372 230 M350 54 L328 230" stroke={on(1)} />
      <path d="M40 250 H200 V215" stroke={on(3)} strokeDasharray="6 6"><animate attributeName="stroke-dashoffset" values="24;0" dur=".6s" repeatCount="indefinite" /></path>
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
  const bg = useTransform(p, [0, .54, .6, .77, .83, 1], [PAPER, PAPER, DARK, DARK, PAPER, PAPER])
  const fg = useTransform(p, [0, .54, .6, .77, .83, 1], [INK, INK, PAPER, PAPER, INK, INK])
  const heroO = useTransform(scrollYProgress, [0, .08], [1, 0])
  const heroY = useTransform(scrollYProgress, [0, .1], [0, -60])
  const words = ['Разобрать.', 'Понять.', 'Собрать.']
  return (
    <motion.section ref={ref} id="film" className="relative h-[560vh]" style={{ background: bg, color: fg }}>
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* engineering grid */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[.07]" style={{ backgroundImage: 'linear-gradient(currentColor 1px,transparent 1px),linear-gradient(90deg,currentColor 1px,transparent 1px)', backgroundSize: '64px 64px', maskImage: 'radial-gradient(70% 70% at 60% 50%,#000,transparent)' }} />
        <div className="pointer-events-none absolute inset-0">
          {lite ? <LiteEngine idx={idx} /> : near && <Suspense fallback={null}><Engine3D p={p} active={near} /></Suspense>}
        </div>

        <motion.div style={{ opacity: heroO, y: heroY }} className={`absolute inset-x-0 bottom-0 px-5 pb-28 md:bottom-auto md:top-[15vh] md:px-12 md:pb-0 ${idx > 0 ? 'pointer-events-none' : ''}`}>
          <div className="mx-auto max-w-[1440px]">
            <p className={`${MONO} mb-6 text-[11px] uppercase tracking-[.2em] opacity-60`}>Ремонт двигателей · Автоэлектрика · Минск</p>
            <h1 className="text-[clamp(52px,8.6vw,150px)] font-extrabold leading-[.86] tracking-[-.055em]">
              {words.map((w, i) => <LineReveal key={w} delay={.1 + i * .14}><span style={{ color: i === 2 ? ACC : undefined }}>{w}</span></LineReveal>)}
            </h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .7 }} className="mt-6 max-w-[400px] text-[16px] leading-relaxed opacity-70">Ремонт двигателей и автоэлектрика с инженерным подходом. Листайте — двигатель разберётся на ваших глазах.</motion.p>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .85 }} className="mt-8 flex flex-wrap gap-3">
              <a href="#symptom" className="inline-flex h-[52px] items-center gap-3 rounded-[10px] px-6 text-[15px] font-semibold text-white" style={{ background: ACC }}>Что с машиной? <ArrowRight size={17} /></a>
              <a href={'tel:' + tel(b.phone)} className="inline-flex h-[52px] items-center gap-2 rounded-[10px] border border-[#0d0f12]/20 px-6 text-[15px] font-semibold"><Phone size={16} />{b.phone}</a>
            </motion.div>
          </div>
        </motion.div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 px-5 pb-24 md:inset-y-0 md:flex md:items-center md:px-12 md:pb-0">
          <div className="mx-auto w-full max-w-[1440px]">
            <AnimatePresence mode="wait">
              {idx > 0 && (
                <motion.div key={idx} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} transition={{ duration: .5, ease: [0.16, 1, 0.3, 1] }} className="max-w-[440px]">
                  <p className={`${MONO} mb-4 text-[11px] uppercase tracking-[.2em]`}><span style={{ color: ACC }}>[{String(idx).padStart(2, '0')}]</span> {CH[idx - 1].k}</p>
                  <h2 className="text-[clamp(36px,4.6vw,72px)] font-extrabold leading-[.92] tracking-[-.045em]">{CH[idx - 1].t}</h2>
                  <p className="mt-4 text-[15px] leading-relaxed opacity-70 md:text-[17px]">{CH[idx - 1].d}</p>
                  <div className={`${MONO} mt-5 hidden flex-wrap gap-2 text-[11px] uppercase tracking-[.12em] md:flex`}>{CH[idx - 1].s.map(s => <span key={s} className="rounded-[6px] border border-current/20 px-2.5 py-1 opacity-70" style={{ borderColor: 'color-mix(in srgb, currentColor 25%, transparent)' }}>{s}</span>)}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* spec counter */}
        <div className={`${MONO} absolute right-5 top-5 text-right text-[11px] uppercase tracking-[.2em] md:bottom-10 md:right-12 md:top-auto`}>
          <p className="opacity-50">узел</p>
          <p className="text-[34px] font-medium leading-none tracking-normal md:text-[56px]"><span style={{ color: ACC }}>{String(idx).padStart(2, '0')}</span><span className="opacity-30">/04</span></p>
        </div>
      </div>
    </motion.section>
  )
}

/* ---------------- shutter reveal (transition #2) ---------------- */
function Shutter({ children, id, className = '', style }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 30%'] })
  const a = useTransform(scrollYProgress, [0, 1], [14, 0])
  const cp = useMotionTemplate`polygon(0 ${a}%, 100% 0, 100% 100%, 0 100%)`
  return <motion.section ref={ref} id={id} style={{ clipPath: cp, ...style }} className={className}>{children}</motion.section>
}

/* ---------------- bento ---------------- */
function Card({ children, className = '', dark }) {
  const ref = useRef(null)
  const mv = e => { const r = ref.current.getBoundingClientRect(); ref.current.style.setProperty('--x', e.clientX - r.left + 'px'); ref.current.style.setProperty('--y', e.clientY - r.top + 'px') }
  return (
    <Reveal className={className}>
      <div ref={ref} onPointerMove={mv} className="group relative h-full rounded-[18px] p-px" style={{ background: `radial-gradient(360px circle at var(--x,-100px) var(--y,-100px), ${ACC}, ${dark ? 'rgba(255,255,255,.08)' : 'rgba(13,15,18,.1)'} 60%)` }}>
        <div className={`relative h-full overflow-hidden rounded-[17px] ${dark ? 'bg-[#0b0d10] text-[#e6e8eb]' : 'bg-[#f2f3f5] text-[#0d0f12]'}`}>{children}</div>
      </div>
    </Reveal>
  )
}
const Lbl = ({ children }) => <p className={`${MONO} text-[11px] uppercase tracking-[.2em] opacity-55`}>{children}</p>

function Caliper() {
  return (
    <div className="flex h-full flex-col justify-between gap-6 p-7 md:p-9">
      <Lbl>Ремонт двигателей</Lbl>
      <svg viewBox="0 0 420 140" className="w-full" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="10" y="40" width="400" height="26" rx="3" />
        {Array.from({ length: 40 }, (_, i) => <line key={i} x1={20 + i * 10} x2={20 + i * 10} y1="40" y2={i % 5 ? 48 : 54} strokeWidth="1" />)}
        <path d="M10 66 V128 H34 V66" />
        <motion.g animate={{ x: [180, 120, 120, 220, 180] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}>
          <path d="M0 30 H70 V76 H24 V128 H0 Z" stroke={ACC} />
        </motion.g>
        <circle cx="70" cy="110" r="18" strokeDasharray="4 4" />
      </svg>
      <div>
        <h3 className="text-[clamp(30px,3.4vw,48px)] font-extrabold leading-[.95] tracking-[-.045em]">От диагностики<br />до капремонта.</h3>
        <p className="mt-3 max-w-[460px] text-[15px] leading-relaxed opacity-65">Дефектовка, замена ГРМ, ремонт головки блока, капитальный ремонт. Каждую деталь измеряем.</p>
      </div>
    </div>
  )
}
function Rating() {
  const ref = useRef(null); const v = useInView(ref, { once: true })
  return (
    <div ref={ref} className="flex h-full flex-col justify-between p-7">
      <Lbl>Яндекс Карты</Lbl>
      <div>
        <p className="text-[88px] font-extrabold leading-[.8] tracking-[-.06em]">{b.rating}</p>
        <div className="relative mt-4 h-[6px] overflow-hidden rounded-full bg-current/10" style={{ background: 'rgba(13,15,18,.1)' }}><motion.div className="h-full" style={{ background: ACC }} initial={{ width: 0 }} animate={v ? { width: '90%' } : {}} transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }} /></div>
        <p className="mt-3 flex items-center gap-2 text-[14px] opacity-65"><Star size={14} fill={ACC} stroke="none" />{b.rev} оценок</p>
      </div>
    </div>
  )
}
function Circuit() {
  const d = 'M20 100 H90 V40 H190 V100 H280'
  return (
    <div className="flex h-full flex-col justify-between gap-5 p-7">
      <Lbl>Автоэлектрика</Lbl>
      <svg viewBox="0 0 300 130" className="w-full" fill="none">
        <path d={d} stroke="currentColor" strokeOpacity=".25" strokeWidth="2" />
        <motion.path d={d} stroke={ACC} strokeWidth="3" strokeLinecap="round" initial={{ pathLength: .12, pathOffset: 0 }} animate={{ pathOffset: [0, 1] }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} />
        <rect x="8" y="88" width="24" height="24" rx="3" stroke="currentColor" strokeWidth="2" /><circle cx="285" cy="100" r="11" stroke="currentColor" strokeWidth="2" />
        <rect x="120" y="26" width="40" height="28" rx="3" fill="currentColor" />
      </svg>
      <p className="text-[15px] leading-relaxed opacity-65">Стартер, генератор, проводка, ошибки блоков.</p>
    </div>
  )
}
function Readout() {
  const [v, setV] = useState(780)
  const ref = useRef(null); const on = useInView(ref)
  useEffect(() => { if (!on) return; const t = setInterval(() => setV(x => Math.round(760 + Math.random() * 60)), 420); return () => clearInterval(t) }, [on])
  return (
    <div ref={ref} className="flex h-full flex-col justify-between gap-5 p-7">
      <Lbl>Диагностика</Lbl>
      <div>
        <p className={`${MONO} text-[56px] leading-none tabular-nums`}>{v}<span className="ml-2 text-[14px] opacity-50">об/мин</span></p>
        <div className="mt-4 flex h-8 items-end gap-[3px]">{Array.from({ length: 24 }, (_, i) => <motion.span key={i} className="flex-1 rounded-[2px]" style={{ background: i > 18 ? ACC : 'currentColor', opacity: i > 18 ? 1 : .3 }} animate={{ height: ['30%', `${40 + ((i * 37) % 60)}%`, '30%'] }} transition={{ duration: 1.2 + (i % 4) * .2, repeat: Infinity }} />)}</div>
      </div>
      <p className="text-[15px] leading-relaxed opacity-65">Читаем параметры в работе, а не только коды ошибок.</p>
    </div>
  )
}
function Steps() {
  const S = ['Слушаем', 'Диагностика', 'Согласуем', 'Ремонт', 'Проверка']
  return (
    <div className="flex h-full flex-col justify-between gap-8 p-7 md:p-9">
      <Lbl>Порядок работы</Lbl>
      <div className="relative">
        <motion.span className="absolute left-0 right-0 top-[7px] h-[2px] origin-left" style={{ background: ACC }} initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1.8, ease: [0.76, 0, 0.24, 1] }} />
        <span className="absolute left-0 right-0 top-[7px] h-[2px] bg-white/10" />
        <ol className="relative grid grid-cols-5 gap-2">
          {S.map((s, i) => <motion.li key={s} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: .3 + i * .25 }}>
            <span className="block h-4 w-4 rounded-full border-2" style={{ borderColor: ACC, background: DARK }} />
            <span className={`${MONO} mt-3 block text-[10px] opacity-50`}>0{i + 1}</span>
            <span className="mt-1 block text-[13px] font-semibold leading-tight md:text-[15px]">{s}</span>
          </motion.li>)}
        </ol>
      </div>
      <p className="max-w-[520px] text-[15px] leading-relaxed opacity-65">Никаких работ без согласования. Сначала причина и план — потом ремонт.</p>
    </div>
  )
}
function Place() {
  return (
    <a href="#contact" className="flex h-full flex-col justify-between gap-5 p-7">
      <div className="flex justify-between"><Lbl>Адрес</Lbl><ArrowUpRight size={20} className="transition-transform duration-300 group-hover:rotate-45" /></div>
      <svg viewBox="0 0 300 110" className="w-full" fill="none" stroke="currentColor" strokeOpacity=".25">
        {[20, 55, 90].map(y => <line key={y} x1="0" x2="300" y1={y} y2={y} />)}{[40, 120, 200, 270].map(x => <line key={x} y1="0" y2="110" x1={x} x2={x} />)}
        <rect x="128" y="62" width="64" height="22" fill={ACC} stroke="none" />
      </svg>
      <p className="text-[28px] font-extrabold leading-none tracking-[-.04em]">{b.short}</p>
    </a>
  )
}

function Bento() {
  return (
    <Shutter id="about" className="relative z-10 px-4 py-24 md:px-12 md:py-32" style={{ background: PAPER, color: INK }}>
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <h2 className="text-[clamp(44px,6.6vw,112px)] font-extrabold leading-[.88] tracking-[-.055em]"><LineReveal>Точность —</LineReveal><LineReveal delay={.1}><span style={{ color: ACC }}>это метод.</span></LineReveal></h2>
          <p className="max-w-[360px] text-[16px] leading-relaxed opacity-65">Двигатель и электрика — две специализации, в которых не работают «на глаз».</p>
        </div>
        <div className="grid auto-rows-[minmax(240px,auto)] gap-3 md:grid-cols-12">
          <Card className="md:col-span-6 md:row-span-2"><Caliper /></Card>
          <Card className="md:col-span-3"><Rating /></Card>
          <Card className="md:col-span-3" dark><Circuit /></Card>
          <Card className="md:col-span-3"><Readout /></Card>
          <Card className="md:col-span-3"><Place /></Card>
          <Card className="md:col-span-12" dark><Steps /></Card>
        </div>
      </div>
    </Shutter>
  )
}

/* ---------------- value: symptom picker (sticky split, transition #3) ---------------- */
const SYM = [
  { k: 'Стук в двигателе', f: ['cpg'], z: 'Цилиндро-поршневая группа', d: 'Стук может идти от вкладышей, поршней, гидрокомпенсаторов или навесного. Слушаем на разных режимах и измеряем.', c: ['прослушивание', 'давление масла', 'эндоскопия цилиндров'] },
  { k: 'Не заводится', f: ['elec', 'ign'], z: 'Пуск и зажигание', d: 'Чаще всего — аккумулятор, стартер, зажигание или питание. Идём по цепи от батареи до свечей.', c: ['АКБ и клеммы', 'стартер', 'искра и топливо'] },
  { k: 'Горит Check Engine', f: ['ign', 'intake'], z: 'Датчики и зажигание', d: 'Лампа — это симптом. Считываем ошибки и смотрим живые параметры, чтобы найти причину.', c: ['коды ошибок', 'датчики', 'катушки и свечи'] },
  { k: 'Плавают обороты', f: ['intake'], z: 'Впуск и холостой ход', d: 'Подсос воздуха, дроссель, датчики или вентиляция картера. Проверяем впуск под дымогенератором и по параметрам.', c: ['дроссель', 'подсос воздуха', 'датчики'] },
  { k: 'Троит двигатель', f: ['ign', 'cpg'], z: 'Зажигание и компрессия', d: 'Пропуски воспламенения: катушки, свечи, форсунки или компрессия в цилиндре.', c: ['катушки', 'свечи', 'компрессия'] },
  { k: 'Шум со стороны ремня', f: ['grm'], z: 'Привод ГРМ', d: 'Свист, шелест или вибрация — повод проверить ремень, ролики и натяжитель до того, как ремень порвётся.', c: ['ремень', 'ролики', 'натяжитель'] },
  { k: 'Проблемы с электрикой', f: ['elec'], z: 'Электрическая цепь', d: 'Разряжается АКБ, не горит свет, отказывают блоки. Ищем утечки тока и обрывы по схеме.', c: ['утечка тока', 'генератор', 'проводка и блоки'] },
]

function Symptoms({ bk }) {
  const ref = useRef(null)
  const near = useInView(ref, { margin: '200px 0px 200px 0px' })
  const lite = useLite()
  const [i, setI] = useState(0)
  const s = SYM[i]
  const go = () => { bk.upd('svc', 'Диагностика: ' + s.k.toLowerCase()); document.getElementById('book')?.scrollIntoView({ behavior: 'smooth' }) }
  return (
    <section ref={ref} id="symptom" className="px-4 py-24 text-[#e6e8eb] md:px-12 md:py-32" style={{ background: DARK }}>
      <div className="mx-auto grid max-w-[1440px] gap-10 md:grid-cols-[.85fr_1.15fr] md:gap-14">
        <div>
          <p className={`${MONO} mb-5 text-[11px] uppercase tracking-[.2em]`} style={{ color: ACC }}>Что с машиной?</p>
          <h2 className="text-[clamp(44px,5.6vw,96px)] font-extrabold leading-[.88] tracking-[-.055em]"><LineReveal>Опишите</LineReveal><LineReveal delay={.1}>симптом.</LineReveal></h2>
          <p className="mb-8 mt-5 max-w-[400px] text-[16px] leading-relaxed text-white/60">Покажем, какой узел под подозрением и что проверим на диагностике.</p>
          <div role="listbox" aria-label="Симптомы" className="grid gap-1.5">
            {SYM.map((x, j) => (
              <button key={x.k} role="option" aria-selected={i === j} onClick={() => setI(j)} className={`group relative flex h-14 items-center justify-between overflow-hidden rounded-[12px] px-5 text-left text-[16px] font-semibold transition-colors ${i === j ? 'text-white' : 'text-white/60 hover:bg-white/[.04] hover:text-white'}`}>
                {i === j && <motion.span layoutId="symBg" className="absolute inset-0 rounded-[12px]" style={{ background: ACC }} transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
                <span className="relative">{x.k}</span>
                <span className={`${MONO} relative text-[11px] opacity-60`}>{String(j + 1).padStart(2, '0')}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="md:sticky md:top-24 md:self-start">
          <div className="relative h-[340px] overflow-hidden rounded-[22px] border border-white/10 md:h-[460px]" style={{ background: 'radial-gradient(80% 80% at 50% 40%, #1c2026, #0b0d10)' }}>
            {!lite && near ? <Suspense fallback={null}><Engine3D focus={s.f} active={near} /></Suspense> : <LiteEngine idx={s.f.includes('grm') ? 1 : s.f.includes('cpg') ? 2 : 3} />}
            <p className={`${MONO} absolute left-5 top-5 text-[11px] uppercase tracking-[.2em] text-white/50`}>подсветка узла</p>
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: .35 }} className="mt-6">
              <p className={`${MONO} text-[11px] uppercase tracking-[.2em] text-white/45`}>вероятно</p>
              <h3 className="mt-2 text-[clamp(28px,3vw,44px)] font-extrabold leading-none tracking-[-.04em]">{s.z}</h3>
              <p className="mt-3 max-w-[560px] text-[15px] leading-relaxed text-white/65">{s.d}</p>
              <div className={`${MONO} mt-4 flex flex-wrap gap-2 text-[11px] uppercase tracking-[.1em]`}>{s.c.map(c => <span key={c} className="rounded-[6px] border border-white/15 px-2.5 py-1.5 text-white/70">{c}</span>)}</div>
            </motion.div>
          </AnimatePresence>
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <button onClick={go} className="inline-flex h-14 items-center gap-3 rounded-[12px] px-6 text-[15px] font-semibold text-white" style={{ background: ACC }}>Записаться на диагностику <ArrowRight size={17} /></button>
            <p className="text-[13px] text-white/40">Это ориентир. Точную причину назовём после диагностики.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- booking: 3 steps ---------------- */
const SVC = ['Диагностика', 'Ремонт двигателя', 'Замена ГРМ', 'Автоэлектрика', 'Другое']
const WHEN = ['Как можно скорее', 'На этой неделе', 'Не срочно']
function Chip({ on, children, onClick }) {
  return <button type="button" onClick={onClick} aria-pressed={on} className={`rounded-[10px] border px-4 py-2.5 text-[14px] font-semibold transition-colors ${on ? 'border-[#0d0f12] bg-[#0d0f12] text-white' : 'border-[#0d0f12]/15 hover:border-[#0d0f12]/50'}`}>{children}</button>
}
function Book({ bk }) {
  const [step, setStep] = useState(0)
  const [car, setCar] = useState('')
  const [when, setWhen] = useState('')
  const [err, setErr] = useState('')
  const next = e => {
    e.preventDefault()
    if (step === 0 && !bk.s.svc) return setErr('Выберите услугу или симптом')
    if (step === 1 && car.trim().length < 2) return setErr('Укажите марку и модель')
    setErr('')
    if (step < 2) return setStep(step + 1)
    bk.submit()
  }
  const L = ['Задача', 'Автомобиль', 'Контакты']
  const input = 'h-14 w-full rounded-[12px] border border-[#0d0f12]/15 bg-white px-5 text-[16px] outline-none transition-colors focus:border-[#ff4d17]'
  return (
    <Shutter id="book" className="px-4 py-24 md:px-12 md:py-32" style={{ background: PAPER, color: INK }}>
      <div className="mx-auto grid max-w-[1440px] gap-12 md:grid-cols-[.85fr_1.15fr] md:gap-16">
        <div>
          <p className={`${MONO} mb-5 text-[11px] uppercase tracking-[.2em]`} style={{ color: ACC }}>Запись</p>
          <h2 className="text-[clamp(44px,5.6vw,96px)] font-extrabold leading-[.88] tracking-[-.055em]"><LineReveal>Начнём</LineReveal><LineReveal delay={.1}>с причины.</LineReveal></h2>
          <p className="mt-5 max-w-[380px] text-[16px] leading-relaxed opacity-65">Три шага — и мы перезвоним, чтобы согласовать время диагностики.</p>
          <a href={'tel:' + tel(b.phone)} className="mt-8 inline-block text-[34px] font-extrabold tracking-[-.04em]">{b.phone}</a>
        </div>
        <div className="rounded-[22px] bg-[#f6f7f8] p-6 ring-1 ring-[#0d0f12]/5 md:p-10">
          <AnimatePresence mode="wait">
            {!bk.s.sent ? (
              <motion.form key="f" onSubmit={next} noValidate exit={{ opacity: 0 }}>
                <div className={`${MONO} mb-8 flex items-center gap-3 text-[11px] uppercase tracking-[.16em]`}>
                  {L.map((l, i) => <React.Fragment key={l}>
                    <button type="button" onClick={() => i < step && setStep(i)} className={`flex items-center gap-2 ${i <= step ? '' : 'opacity-35'}`}><span className="grid h-6 w-6 place-items-center rounded-full text-[10px] text-white" style={{ background: i <= step ? ACC : INK }}>{i + 1}</span><span className="hidden sm:inline">{l}</span></button>
                    {i < 2 && <span className="h-px flex-1 bg-[#0d0f12]/15"><motion.span className="block h-full" style={{ background: ACC }} animate={{ width: i < step ? '100%' : '0%' }} /></span>}
                  </React.Fragment>)}
                </div>
                <AnimatePresence mode="wait">
                  <motion.div key={step} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: .3 }} className="min-h-[220px]">
                    {step === 0 && <div>
                      <p className="mb-5 text-[26px] font-extrabold tracking-[-.04em]">Что нужно?</p>
                      {bk.s.svc && !SVC.includes(bk.s.svc) && <p className="mb-4 rounded-[12px] border border-[#ff4d17]/40 bg-[#ff4d17]/10 px-4 py-3 text-[14px]">{bk.s.svc}</p>}
                      <div className="flex flex-wrap gap-2">{SVC.map(s => <Chip key={s} on={bk.s.svc === s} onClick={() => bk.upd('svc', s)}>{s}</Chip>)}</div>
                    </div>}
                    {step === 1 && <div>
                      <p className="mb-5 text-[26px] font-extrabold tracking-[-.04em]">Какая машина?</p>
                      <input className={input} placeholder="Марка, модель, год" value={car} onChange={e => setCar(e.target.value)} autoFocus />
                      <p className={`${MONO} mb-3 mt-6 text-[11px] uppercase tracking-[.16em] opacity-50`}>Когда удобно</p>
                      <div className="flex flex-wrap gap-2">{WHEN.map(s => <Chip key={s} on={when === s} onClick={() => setWhen(s)}>{s}</Chip>)}</div>
                    </div>}
                    {step === 2 && <div className="grid gap-3">
                      <p className="mb-2 text-[26px] font-extrabold tracking-[-.04em]">Куда перезвонить?</p>
                      <input className={input} placeholder="Имя" value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} autoComplete="name" autoFocus />
                      <motion.input animate={bk.s.err ? { x: [0, -8, 8, -5, 5, 0] } : {}} className={input + (bk.s.err ? ' !border-red-500' : '')} type="tel" inputMode="tel" placeholder="+375 __ ___-__-__" value={bk.s.phone} onFocus={phoneFocus(bk)} onChange={e => bk.upd('phone', e.target.value)} autoComplete="tel" aria-invalid={bk.s.err} />
                      {bk.s.err && <p className="text-[13px] text-red-600">Проверьте номер телефона</p>}
                      <p className={`${MONO} mt-1 text-[11px] opacity-50`}>{[bk.s.svc, car, when].filter(Boolean).join(' / ')}</p>
                    </div>}
                  </motion.div>
                </AnimatePresence>
                {err && <p className="mt-2 text-[13px] text-red-600">{err}</p>}
                <div className="mt-6 flex gap-3">
                  {step > 0 && <button type="button" onClick={() => setStep(step - 1)} aria-label="Назад" className="grid h-14 w-14 place-items-center rounded-[12px] border border-[#0d0f12]/15"><ChevronLeft size={20} /></button>}
                  <button disabled={bk.s.loading} className="inline-flex h-14 flex-1 items-center justify-center gap-3 rounded-[12px] text-[15px] font-semibold text-white disabled:opacity-60" style={{ background: step < 2 ? INK : ACC }}>{bk.s.loading ? 'Отправляем…' : step < 2 ? 'Далее' : 'Отправить заявку'} <ArrowRight size={17} /></button>
                </div>
              </motion.form>
            ) : (
              <motion.div key="ok" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid min-h-[320px] place-items-center text-center">
                <div><CheckDraw className="mx-auto mb-5 text-[#ff4d17]" size={72} /><h3 className="text-[36px] font-extrabold tracking-[-.04em]">Заявка принята.</h3><p className="mx-auto mb-6 mt-3 max-w-[340px] opacity-65">В готовом сайте заявка сразу придёт вам в Telegram.</p><button onClick={() => { bk.reset(); setStep(0); setCar(''); setWhen('') }} className="underline underline-offset-4">Новая заявка</button></div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Shutter>
  )
}

function Contact() {
  return (
    <section id="contact" className="px-4 py-24 text-[#e6e8eb] md:px-12 md:py-32" style={{ background: DARK }}>
      <div className="mx-auto grid max-w-[1440px] gap-10 md:grid-cols-[.85fr_1.15fr]">
        <Reveal className="grid content-start gap-6">
          <h2 className="text-[clamp(44px,5.6vw,96px)] font-extrabold leading-[.88] tracking-[-.055em]">Жебрака, <span style={{ color: ACC }}>26</span></h2>
          <p className="flex items-start gap-3 text-[16px] text-white/65"><MapPin size={20} className="mt-0.5 shrink-0" style={{ color: ACC }} />{b.addr}</p>
          <a href={'tel:' + tel(b.phone)} className="text-[36px] font-extrabold tracking-[-.04em]">{b.phone}</a>
          <div className="flex flex-wrap gap-2">
            <a href={'tel:' + tel(b.phone)} className="inline-flex h-12 items-center gap-2 rounded-[10px] px-5 text-[14px] font-semibold text-white" style={{ background: ACC }}><Phone size={16} />Позвонить</a>
            <a href={b.ig} target="_blank" rel="noopener" className="inline-flex h-12 items-center gap-2 rounded-[10px] border border-white/15 px-5 text-[14px] font-semibold"><IG />Instagram</a>
          </div>
        </Reveal>
        <Reveal delay={.1} className="h-[380px] overflow-hidden rounded-[22px] ring-1 ring-white/10 md:h-[440px]"><MapFrame oid={b.oid} dark /></Reveal>
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
      <div className="font-['Inter_Tight',sans-serif]" style={{ background: PAPER, color: INK, '--sel': ACC, '--selc': '#fff' }}>
        <Ribbon name={b.name} bg={INK} fg={PAPER} />
        <header className="sticky top-0 z-40 border-b border-[#0d0f12]/10 bg-[#e6e8eb]/80 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 md:px-12">
            <a href="#film" className="flex items-center gap-2 text-[22px] font-extrabold tracking-[-.05em]"><span className="grid h-8 w-8 place-items-center rounded-[8px] text-[18px] text-white" style={{ background: ACC }}>7</span>auto</a>
            <nav className={`${MONO} hidden gap-8 text-[11px] uppercase tracking-[.16em] md:flex`}>{[['#film', 'Узлы'], ['#about', 'Подход'], ['#symptom', 'Симптомы'], ['#book', 'Запись'], ['#contact', 'Контакты']].map(([h, t]) => <a key={h} href={h} className="opacity-60 transition-opacity hover:opacity-100">{t}</a>)}</nav>
            <a href={'tel:' + tel(b.phone)} className="inline-flex h-10 items-center gap-2 rounded-[10px] px-4 text-[14px] font-semibold text-white" style={{ background: INK }}><Phone size={15} /><span className="hidden sm:inline">{b.phone}</span></a>
          </div>
        </header>
        <main>
          <Film lite={lite} />
          <Bento />
          <Symptoms bk={bk} />
          <Book bk={bk} />
          <Contact />
        </main>
        <footer className={`${MONO} px-4 pb-10 text-[11px] uppercase tracking-[.12em] text-white/40 md:px-12`} style={{ background: DARK }}>
          <div className="mx-auto flex max-w-[1440px] flex-wrap justify-between gap-4 border-t border-white/10 pt-8"><span>© 2026 {b.name} · Концепт сайта — Артём</span><span>{b.addr}</span></div>
        </footer>
        <CallBar phone={b.phone} barCls="bg-[#e6e8eb]/90 backdrop-blur-xl border-t border-[#0d0f12]/10" callCls="rounded-[12px] border border-[#0d0f12]/20 text-[#0d0f12]" bookCls="rounded-[12px] text-white bg-[#ff4d17]" />
        <div className="h-[72px] sm:hidden" style={{ background: DARK }} />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
