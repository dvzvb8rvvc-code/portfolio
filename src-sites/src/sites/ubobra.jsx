import React, { useRef, useState, useEffect, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useMotionValueEvent, useInView, AnimatePresence, MotionConfig, useMotionValue, useSpring, LayoutGroup } from 'framer-motion'
import { ArrowRight, ArrowUpRight, Phone, Check, Plus, Star, MapPin, ChevronDown } from 'lucide-react'
import '../lib/base.css'
import { useSmooth, Ribbon, LineReveal, Reveal, useBooking, phoneFocus, CheckDraw, MapFrame, CallBar, tel, useLite, IG, TG } from '../lib/kit'

const Workshop = lazy(() => import('./ubobra3d'))

const b = {
  name: 'У Бобра', addr: 'пер. Корженевского, 26', city: 'Минск', phone: '+375 29 313-85-95', rating: '4,9', rev: 457, oid: '1873848407',
  dikidi: 'https://dikidi.net/1298308', ig: 'https://www.instagram.com/u_bobra_minsk', tg: 'https://t.me/+375293138595', vk: 'https://vk.ru/bober_by',
  viber: 'viber://chat?number=%2B375293138595',
}
const PAPER = '#f7efe1', INK = '#2a1a0f', WOOD = '#b4652e', RIVER = '#1f6a72'
const F = "font-['Geologica',sans-serif]"
const HAND = "font-['Caveat',cursive]"
const SPR = { type: 'spring', stiffness: 380, damping: 22 }

function useSpy(ids) {
  const [a, setA] = useState('')
  useEffect(() => {
    const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && setA(e.target.id)), { rootMargin: '-45% 0px -50% 0px' })
    ids.forEach(id => { const el = document.getElementById(id); el && io.observe(el) })
    return () => io.disconnect()
  }, [])
  return a
}

/* hand-drawn underline */
function Squiggle({ className = '', delay = 0.9, color = WOOD }) {
  return (
    <svg viewBox="0 0 300 24" preserveAspectRatio="none" className={'pointer-events-none absolute -bottom-[0.12em] left-0 h-[0.28em] w-full ' + className} aria-hidden="true">
      <motion.path d="M4 16 C 60 4, 110 22, 160 12 S 260 6, 296 14" fill="none" stroke={color} strokeWidth="7" strokeLinecap="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.9, delay, ease: [0.65, 0, 0.35, 1] }} />
    </svg>
  )
}
function Stars({ n = 5, size = 18, cls = 'text-[#f2a33a]' }) {
  return <span className={'inline-flex gap-0.5 ' + cls} aria-hidden="true">{Array.from({ length: n }).map((_, i) => <Star key={i} size={size} fill="currentColor" strokeWidth={0} />)}</span>
}
const VK = p => (<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" {...p}><path d="M12.8 17.5C6.9 17.5 3.5 13.4 3.4 6.6h3c.1 5 2.3 7.1 4 7.5V6.6h2.8v4.3c1.7-.2 3.5-2.1 4.1-4.3h2.8c-.5 2.6-2.4 4.5-3.8 5.3 1.4.7 3.6 2.4 4.4 5.6h-3.1c-.7-2.1-2.3-3.7-4.4-3.9v3.9h-.4Z" /></svg>)
const VB = p => (<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" {...p}><path d="M12 2.2c-5 0-9 3.3-9 8.3 0 2.8 1.3 4.8 3.4 6.1V21l3.4-2.4c.7.1 1.4.2 2.2.2 5 0 9-3.3 9-8.3S17 2.2 12 2.2Zm4.6 11.9-.8.8c-.5.4-1.3.2-2.6-.5a12 12 0 0 1-4.9-5.1c-.3-.8-.3-1.4.1-1.8l.7-.7c.3-.3.8-.2 1 .1l1 1.5c.2.3.1.7-.1.9l-.4.4c.5 1.2 1.5 2.2 2.8 2.8l.4-.4c.3-.2.6-.3.9-.1l1.5 1c.4.3.5.8.4 1.1Z" /></svg>)
const SOC = [
  { k: 'Instagram', href: b.ig, Icon: IG, h: '@u_bobra_minsk' },
  { k: 'Telegram', href: b.tg, Icon: TG, h: 'Написать в чат' },
  { k: 'Viber', href: b.viber, Icon: VB, h: b.phone },
  { k: 'ВКонтакте', href: b.vk, Icon: VK, h: 'bober_by' },
]

/* ---------------- header ---------------- */
const NAV = [['services', 'Услуги'], ['checkup', 'Чек-ап'], ['how', 'Как работаем'], ['reviews', 'Рейтинг'], ['contact', 'Контакты']]
function Logo() {
  return (
    <a href="#top" className="flex items-center gap-2.5" aria-label="У Бобра — наверх">
      <span className="grid h-10 w-10 place-items-center rounded-[14px] bg-[#b4652e] text-[#f7efe1] shadow-[0_3px_0_#7a3f16]">
        <svg viewBox="0 0 32 32" width="24" height="24" aria-hidden="true"><path d="M7 13c0-5 4-8 9-8s9 3 9 8-4 9-9 9-9-4-9-9Z" fill="currentColor" opacity=".25" /><rect x="11.5" y="15" width="4" height="8" rx="1.6" fill="currentColor" /><rect x="16.5" y="15" width="4" height="8" rx="1.6" fill="currentColor" /></svg>
      </span>
      <span className="text-[19px] font-extrabold tracking-[-0.03em]">У Бобра</span>
    </a>
  )
}
function Header({ active }) {
  return (
    <header className="sticky top-2 z-50 px-3 md:top-3 md:px-6">
      <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between gap-3 rounded-[22px] border border-[#2a1a0f]/10 bg-[#fffaf1]/90 pl-3 pr-2 shadow-[0_10px_30px_-18px_rgba(42,26,15,.5)] backdrop-blur md:h-16 md:pl-4">
        <Logo />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Разделы">
          {NAV.map(([id, t]) => (
            <a key={id} href={'#' + id} className="relative rounded-full px-3.5 py-2 text-[15px] font-medium" aria-current={active === id ? 'true' : undefined}>
              {active === id && <motion.span layoutId="navpill" transition={SPR} className="absolute inset-0 rounded-full bg-[#1f6a72]/12" />}
              <span className={'relative ' + (active === id ? 'text-[#1f6a72]' : '')}>{t}</span>
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a href={'tel:' + tel(b.phone)} className="hidden items-center gap-2 rounded-full px-3 py-2 text-[15px] font-semibold hover:bg-[#2a1a0f]/5 md:flex"><Phone size={16} />{b.phone}</a>
          <a href={b.dikidi} target="_blank" rel="noopener" className="inline-flex h-10 items-center gap-1.5 rounded-[14px] bg-[#1f6a72] px-4 text-[15px] font-bold text-white shadow-[0_3px_0_#123f45] transition-transform active:translate-y-[2px] active:shadow-none md:h-11">Записаться<span className="hidden sm:inline">&nbsp;онлайн</span><ArrowUpRight size={16} /></a>
        </div>
      </div>
    </header>
  )
}

/* ---------------- hero ---------------- */
const CHIPS = [['Кондиционеры', '#2a7f86', '-6deg', '8%', '10%'], ['Шиномонтаж', '#2a1a0f', '5deg', '58%', '6%'], ['Масло и тормоза', '#b4652e', '-3deg', '54%', '84%']]
function Hero() {
  const lite = useLite()
  const box = useRef(null)
  const inView = useInView(box, { margin: '100px' })
  const [ready, setReady] = useState(false)
  useEffect(() => { const t = setTimeout(() => setReady(true), 250); return () => clearTimeout(t) }, [])
  const mx = useMotionValue(50), my = useMotionValue(50)
  const sx = useSpring(mx, { stiffness: 60, damping: 20 }), sy = useSpring(my, { stiffness: 60, damping: 20 })
  const onMove = e => { const r = e.currentTarget.getBoundingClientRect(); mx.set(((e.clientX - r.left) / r.width) * 100); my.set(((e.clientY - r.top) / r.height) * 100) }
  return (
    <section id="top" className="relative px-4 pb-16 pt-8 md:px-6 md:pb-24 md:pt-12">
      <div className="mx-auto grid max-w-[1280px] items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
        <div>
          <motion.a href="#contact" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 rounded-full border border-[#2a1a0f]/15 bg-white/60 px-3.5 py-1.5 text-[15px] font-medium">
            <MapPin size={16} className="text-[#b4652e]" />Минск · {b.addr}
          </motion.a>
          <a href="#reviews" className="ml-2 mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#2a1a0f] px-3 py-1.5 text-[15px] font-bold text-[#f7efe1] lg:hidden"><Star size={15} fill="#f2a33a" strokeWidth={0} />{b.rating} · {b.rev} оценок</a>
          <h1 className="mt-5 text-[clamp(40px,6.2vw,84px)] font-extrabold leading-[0.98] tracking-[-0.045em]">
            <LineReveal delay={0.05}>Кондиционеры,</LineReveal>
            <LineReveal delay={0.13}>шины и ремонт</LineReveal>
            <LineReveal delay={0.21}><span className="relative inline-block text-[#b4652e]">«У Бобра»<Squiggle color={RIVER} /></span></LineReveal>
          </h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-6 max-w-[520px] text-[18px] leading-[1.5] text-[#2a1a0f]/75">
            Автосервис в Минске: заправка и ремонт автокондиционеров, шиномонтаж, замена масла, тормоза и ходовая.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, ...SPR }} className="mt-7 flex flex-wrap items-center gap-3">
            <a href={b.dikidi} target="_blank" rel="noopener" className="group inline-flex h-14 items-center gap-2 rounded-[18px] bg-[#1f6a72] px-6 text-[17px] font-bold text-white shadow-[0_4px_0_#123f45] transition-transform hover:-translate-y-0.5 active:translate-y-[3px] active:shadow-none">
              Записаться онлайн <ArrowUpRight size={18} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
            <a href={'tel:' + tel(b.phone)} className="inline-flex h-14 items-center gap-2 rounded-[18px] border-2 border-[#2a1a0f] px-5 text-[17px] font-bold transition-colors hover:bg-[#2a1a0f] hover:text-[#f7efe1]"><Phone size={18} />{b.phone}</a>
          </motion.div>
          <p className="mt-3 text-[15px] text-[#2a1a0f]/60">Онлайн-запись через DIKIDI откроется в новой вкладке · или <a href="#book" className="font-semibold text-[#1f6a72] underline underline-offset-4">перезвоните мне</a></p>
          <motion.a href="#reviews" initial={{ opacity: 0, rotate: -4, y: 20 }} animate={{ opacity: 1, rotate: -2, y: 0 }} transition={{ delay: 0.8, ...SPR }} whileHover={{ rotate: 0, scale: 1.02 }}
            className="mt-8 inline-flex items-center gap-4 rounded-[24px] bg-[#2a1a0f] py-3 pl-4 pr-6 text-[#f7efe1] shadow-[0_14px_30px_-14px_rgba(42,26,15,.7)]">
            <span className="text-[48px] font-extrabold leading-none tracking-[-0.05em]">{b.rating}</span>
            <span className="flex flex-col gap-1"><Stars /><span className="text-[15px] font-medium"><b className="font-extrabold">{b.rev} оценок</b> на Яндекс Картах</span></span>
          </motion.a>
        </div>
        <div ref={box} onPointerMove={onMove} className="relative aspect-[4/3.6] w-full overflow-hidden rounded-[36px] shadow-[0_30px_60px_-30px_rgba(31,106,114,.7)] md:rounded-[44px] lg:aspect-[1/1.02]"
          style={{ background: 'linear-gradient(170deg,#f6dcb0 0%,#e6c48f 34%,#8fbfb4 70%,#2a7f86 100%)' }}>
          <motion.div aria-hidden="true" className="pointer-events-none absolute h-[60%] w-[60%] rounded-full opacity-60 blur-3xl" style={{ left: sx, top: sy, x: '-50%', y: '-50%', background: 'radial-gradient(circle,#fff4dc,transparent 70%)' }} />
          {ready && !lite && <Suspense fallback={null}><div className="absolute inset-0"><Workshop mode="hero" active={inView} /></div></Suspense>}
          {lite && <div className="absolute inset-0 grid place-items-center text-[120px]" aria-hidden="true"><svg viewBox="0 0 120 120" width="50%"><ellipse cx="60" cy="96" rx="52" ry="12" fill="#2a7f86" opacity=".4" /><circle cx="60" cy="58" r="34" fill="#7a4524" /><circle cx="60" cy="30" r="20" fill="#7a4524" /><rect x="54" y="38" width="5" height="8" rx="2" fill="#fff" /><rect x="61" y="38" width="5" height="8" rx="2" fill="#fff" /><path d="M38 22a22 22 0 0 1 44 0Z" fill="#f2a33a" /></svg></div>}
          {CHIPS.map(([t, c, r, l, tp]) => (
            <motion.span key={t} drag dragConstraints={box} dragElastic={0.2} whileDrag={{ scale: 1.08 }} whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1, ...SPR }}
              className="absolute cursor-grab touch-none select-none rounded-full px-4 py-2 text-[15px] font-bold text-white shadow-[0_8px_18px_-8px_rgba(0,0,0,.5)] active:cursor-grabbing"
              style={{ background: c, rotate: r, left: l, top: tp }}>{t}</motion.span>
          ))}
          <p className={`pointer-events-none absolute bottom-5 left-6 max-w-[60%] text-[26px] leading-[1] text-[#123f45] md:text-[32px] ${HAND}`}>бобр строит —<br />бобр чинит</p>
        </div>
      </div>
    </section>
  )
}

/* ---------------- services ---------------- */
const SV = [
  { c: 'ac', t: 'Диагностика кондиционера', d: 'Проверим давление в системе, работу компрессора и температуру на выходе.' },
  { c: 'ac', t: 'Заправка кондиционера', d: 'Если в салоне перестало холодить или кондиционер греет вместо охлаждения.' },
  { c: 'ac', t: 'Поиск и устранение утечек', d: 'Найдём, где уходит фреон, и предложим ремонт.' },
  { c: 'ac', t: 'Антибактериальная обработка', d: 'Когда из дефлекторов тянет сыростью или неприятным запахом.' },
  { c: 'tyre', t: 'Шиномонтаж', d: 'Сезонная переобувка и замена шин.' },
  { c: 'tyre', t: 'Балансировка колёс', d: 'Если на скорости вибрирует руль или кузов.' },
  { c: 'tyre', t: 'Ремонт проколов', d: 'Поймали гвоздь — посмотрим, можно ли отремонтировать.' },
  { c: 'fix', t: 'Замена масла и фильтров', d: 'Плановое обслуживание по пробегу или по сезону.' },
  { c: 'fix', t: 'Тормоза', d: 'Колодки, диски, тормозная жидкость — проверка и замена.' },
  { c: 'fix', t: 'Ходовая и подвеска', d: 'Стуки, скрипы и люфты — найдём причину.' },
  { c: 'fix', t: 'Компьютерная диагностика', d: 'Загорелась ошибка на панели — считаем и расскажем, что значит.' },
]
const CATS = [['all', 'Все'], ['ac', 'Кондиционер'], ['tyre', 'Шины'], ['fix', 'Ремонт и ТО']]
const CAT_C = { ac: ['#2a7f86', '#e3f1ee'], tyre: ['#2a1a0f', '#efe4d3'], fix: ['#b4652e', '#f6e2cc'] }
function SvcCard({ s, i }) {
  const [c, bg] = CAT_C[s.c]
  return (
    <motion.article layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={SPR}
      whileHover={{ y: -4, rotate: i % 2 ? 0.6 : -0.6 }} className="flex flex-col rounded-[26px] border border-[#2a1a0f]/10 p-5 md:p-6" style={{ background: bg }}>
      <span className="inline-flex w-fit rounded-full px-3 py-1 text-[13px] font-bold text-white" style={{ background: c }}>{CATS.find(x => x[0] === s.c)[1]}</span>
      <h3 className="mt-4 text-[22px] font-bold leading-[1.15] tracking-[-0.02em]">{s.t}</h3>
      <p className="mt-2 flex-1 text-[16px] leading-[1.45] text-[#2a1a0f]/70">{s.d}</p>
      <p className="mt-4 text-[14px] text-[#2a1a0f]/55">Время и цену назовёт мастер</p>
      <a href="#book" data-svc={s.t} className="mt-3 inline-flex h-11 w-fit items-center gap-1.5 rounded-[14px] bg-white px-4 text-[15px] font-bold shadow-[0_2px_0_rgba(42,26,15,.15)] transition-colors hover:bg-[#2a1a0f] hover:text-white">Записаться <ArrowRight size={16} /></a>
    </motion.article>
  )
}
function Services() {
  const [cat, setCat] = useState('all')
  const list = SV.filter(s => cat === 'all' || s.c === cat)
  return (
    <section id="services" className="scroll-mt-24 px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto max-w-[1280px]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className={`text-[28px] leading-none text-[#b4652e] ${HAND}`}>что чиним</p>
            <h2 className="mt-1 text-[clamp(36px,5vw,64px)] font-extrabold leading-[1] tracking-[-0.04em]">Услуги</h2>
          </div>
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Категории услуг">
            {CATS.map(([k, t]) => (
              <button key={k} role="tab" aria-selected={cat === k} onClick={() => setCat(k)} className="relative h-11 rounded-full px-4 text-[15px] font-semibold">
                {cat === k && <motion.span layoutId="catpill" transition={SPR} className="absolute inset-0 rounded-full bg-[#2a1a0f]" />}
                <span className={'relative ' + (cat === k ? 'text-[#f7efe1]' : '')}>{t}</span>
              </button>
            ))}
          </div>
        </div>
        <motion.div layout className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">{list.map((s, i) => <SvcCard key={s.t} s={s} i={i} />)}</AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}

/* ---------------- seasonal checkup (living list) ---------------- */
const CK = [
  { k: 'ac', t: 'Кондиционер перед летом', d: 'диагностика и заправка' },
  { k: 'smell', t: 'Чистка кондиционера', d: 'если пахнет из дефлекторов' },
  { k: 'tyre', t: 'Смена шин', d: 'переобуть и отбалансировать' },
  { k: 'oil', t: 'Масло и фильтры', d: 'плановая замена' },
  { k: 'brake', t: 'Тормоза', d: 'колодки, диски, жидкость' },
  { k: 'chassis', t: 'Ходовая', d: 'стуки, скрипы, люфты' },
  { k: 'diag', t: 'Диагностика', d: 'если горит ошибка' },
]
const PRESET = { summer: ['ac', 'smell', 'tyre', 'oil'], winter: ['tyre', 'brake', 'oil', 'diag'] }
function CkItem({ it, on, toggle }) {
  return (
    <motion.button type="button" layout onClick={toggle} aria-pressed={on} whileTap={{ scale: 0.97 }} transition={SPR}
      className={`flex w-full items-center gap-4 rounded-[22px] border-2 p-4 text-left transition-colors focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#1f6a72] ${on ? 'border-[#1f6a72] bg-[#e3f1ee]' : 'border-[#2a1a0f]/12 bg-white hover:border-[#2a1a0f]/30'}`}>
      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-[10px] border-2 transition-colors ${on ? 'border-[#1f6a72] bg-[#1f6a72] text-white' : 'border-[#2a1a0f]/25'}`}>
        <AnimatePresence>{on && <motion.span initial={{ scale: 0, rotate: -40 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }} transition={SPR}><Check size={18} strokeWidth={3} /></motion.span>}</AnimatePresence>
      </span>
      <span className="min-w-0"><span className="block text-[17px] font-bold leading-tight">{it.t}</span><span className="block text-[15px] text-[#2a1a0f]/60">{it.d}</span></span>
    </motion.button>
  )
}
function Checkup() {
  const [sel, setSel] = useState(PRESET.summer)
  const [season, setSeason] = useState('summer')
  const toggle = k => setSel(s => s.includes(k) ? s.filter(x => x !== k) : [...s, k])
  const pickSeason = s => { setSeason(s); setSel(PRESET[s]) }
  const items = CK.filter(x => sel.includes(x.k))
  const svc = 'Чек-ап: ' + items.map(x => x.t.toLowerCase()).join(', ')
  return (
    <section id="checkup" className="scroll-mt-24 px-4 py-20 md:px-6 md:py-28" style={{ background: '#efe3cf' }}>
      <div className="mx-auto max-w-[1280px]">
        <div className="grid gap-10 lg:grid-cols-[1fr_440px] lg:gap-14">
          <div>
            <p className={`text-[28px] leading-none text-[#1f6a72] ${HAND}`}>отметьте — отправим одной заявкой</p>
            <h2 className="mt-1 text-[clamp(36px,5vw,64px)] font-extrabold leading-[1] tracking-[-0.04em]">Сезонный <span className="relative inline-block">чек-ап<Squiggle delay={0.2} /></span></h2>
            <p className="mt-4 max-w-[560px] text-[17px] leading-[1.5] text-[#2a1a0f]/70">Выберите, что проверить перед сезоном. Мастер перезвонит, уточнит детали и предложит удобное время.</p>
            <div className="mt-6 inline-flex rounded-full bg-white p-1" role="group" aria-label="Сезон">
              {[['summer', 'К лету'], ['winter', 'К зиме']].map(([k, t]) => (
                <button key={k} type="button" aria-pressed={season === k} onClick={() => pickSeason(k)} className="relative h-11 rounded-full px-5 text-[15px] font-bold">
                  {season === k && <motion.span layoutId="season" transition={SPR} className="absolute inset-0 rounded-full bg-[#b4652e]" />}
                  <span className={'relative ' + (season === k ? 'text-white' : '')}>{t}</span>
                </button>
              ))}
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">{CK.map(it => <CkItem key={it.k} it={it} on={sel.includes(it.k)} toggle={() => toggle(it.k)} />)}</div>
          </div>
          <div className="lg:sticky lg:top-28 lg:self-start">
            <motion.div layout transition={SPR} className="rounded-[32px] bg-[#2a1a0f] p-6 text-[#f7efe1] shadow-[0_30px_60px_-30px_rgba(42,26,15,.8)] md:p-7">
              <div className="flex items-center justify-between">
                <p className="text-[15px] font-semibold text-[#f7efe1]/60">Список для мастера</p>
                <motion.span key={items.length} initial={{ scale: 1.5 }} animate={{ scale: 1 }} transition={SPR} className="grid h-9 min-w-9 place-items-center rounded-full bg-[#f2a33a] px-2 text-[16px] font-extrabold text-[#2a1a0f]">{items.length}</motion.span>
              </div>
              <LayoutGroup>
                <ul className="mt-5 min-h-[180px] space-y-2">
                  <AnimatePresence initial={false}>
                    {items.map((it, i) => (
                      <motion.li key={it.k} layout initial={{ opacity: 0, x: -40, rotate: -4 }} animate={{ opacity: 1, x: 0, rotate: 0 }} exit={{ opacity: 0, x: 40, rotate: 4 }} transition={SPR}
                        className="flex items-center gap-3 rounded-[16px] bg-[#f7efe1]/[.07] px-4 py-3 text-[16px]">
                        <span className="text-[14px] font-bold text-[#f2a33a]">{String(i + 1).padStart(2, '0')}</span>{it.t}
                      </motion.li>
                    ))}
                  </AnimatePresence>
                  {!items.length && <li className={`pt-8 text-center text-[26px] text-[#f7efe1]/50 ${HAND}`}>пока пусто — отметьте пункты слева</li>}
                </ul>
              </LayoutGroup>
              <a href="#book" data-svc={items.length ? svc : 'Сезонный чек-ап'} aria-disabled={!items.length}
                className={`mt-6 flex h-14 items-center justify-center gap-2 rounded-[18px] text-[17px] font-bold transition ${items.length ? 'bg-[#f2a33a] text-[#2a1a0f] shadow-[0_4px_0_#a8661a] active:translate-y-[3px] active:shadow-none' : 'pointer-events-none bg-[#f7efe1]/15 text-[#f7efe1]/50'}`}>
                Отправить список — перезвоните мне <ArrowRight size={18} />
              </a>
              <a href={b.dikidi} target="_blank" rel="noopener" className="mt-3 flex h-12 items-center justify-center gap-1.5 rounded-[16px] border border-[#f7efe1]/25 text-[15px] font-semibold hover:bg-[#f7efe1]/10">Или сразу выбрать время в DIKIDI <ArrowUpRight size={16} /></a>
              <p className="mt-4 text-[14px] text-[#f7efe1]/55">Стоимость и время работ мастер назовёт после уточнения деталей.</p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- how it works: pinned diorama film ---------------- */
const STEPS = [
  ['Записались', 'Онлайн в DIKIDI, по телефону или в мессенджере — как вам удобнее.'],
  ['Приехали', `${b.addr[0].toUpperCase() + b.addr.slice(1)}. Подъезжайте к своему времени.`],
  ['Посмотрели и обсудили', 'Мастер расскажет, что нашёл и что предлагает сделать. Решение — за вами.'],
  ['Готово', 'Забираете машину и едете дальше. Остались вопросы — звоните.'],
]
function How() {
  const ref = useRef(null)
  const prog = useRef(0)
  const lite = useLite()
  const inView = useInView(ref, { margin: '200px' })
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const [i, setI] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', v => { prog.current = v; setI(Math.min(3, Math.floor(v * 4))) })
  return (
    <section id="how" ref={ref} className="relative h-[290vh] scroll-mt-0 px-3 md:px-6">
      <div className="sticky top-0 flex h-[100svh] flex-col pb-24 pt-20 md:pb-6 md:pt-24">
        <div className="mx-auto flex w-full max-w-[1280px] items-end justify-between gap-4 pb-4">
          <div>
            <p className={`text-[26px] leading-none text-[#b4652e] ${HAND}`}>четыре шага</p>
            <h2 className="text-[clamp(30px,4.4vw,56px)] font-extrabold leading-[1] tracking-[-0.04em]">Как мы работаем</h2>
          </div>
          <a href="#reviews" className="shrink-0 rounded-full border border-[#2a1a0f]/20 px-4 py-2 text-[15px] font-semibold hover:bg-[#2a1a0f] hover:text-[#f7efe1]">Пропустить →</a>
        </div>
        <div className="relative mx-auto w-full max-w-[1280px] flex-1 overflow-hidden rounded-[32px] md:rounded-[44px]" style={{ background: 'linear-gradient(180deg,#f3d9ab 0%,#bcd6c8 60%,#7fb3aa 100%)' }}>
          {!lite && <Suspense fallback={null}><div className="absolute inset-0"><Workshop mode="film" prog={prog} active={inView} /></div></Suspense>}
          <div className="absolute left-3 right-3 top-3 flex gap-1.5 md:left-6 md:right-auto md:top-6">
            {STEPS.map((s, k) => <span key={k} className="h-2 flex-1 overflow-hidden rounded-full bg-white/50 md:w-16 md:flex-none"><motion.span className="block h-full rounded-full bg-[#1f6a72]" animate={{ width: k <= i ? '100%' : '0%' }} transition={{ duration: 0.4 }} /></span>)}
          </div>
          <div className="absolute bottom-3 left-3 right-3 md:bottom-6 md:left-6 md:right-auto md:w-[420px]">
            <AnimatePresence mode="wait">
              <motion.div key={i} initial={{ opacity: 0, y: 30, rotate: -3 }} animate={{ opacity: 1, y: 0, rotate: i % 2 ? 1 : -1 }} exit={{ opacity: 0, y: -20, rotate: 3 }} transition={SPR}
                className="rounded-[26px] bg-[#fffaf1] p-5 shadow-[0_20px_40px_-20px_rgba(42,26,15,.6)] md:p-6">
                <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#b4652e] text-[18px] font-extrabold text-white">{i + 1}</span><h3 className="text-[24px] font-extrabold tracking-[-0.03em]">{STEPS[i][0]}</h3></div>
                <p className="mt-3 text-[16px] leading-[1.5] text-[#2a1a0f]/75">{STEPS[i][1]}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- rating bento ---------------- */
function Reviews() {
  return (
    <section id="reviews" className="scroll-mt-24 px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto max-w-[1280px]">
        <p className={`text-[28px] leading-none text-[#b4652e] ${HAND}`}>что говорят</p>
        <h2 className="mt-1 text-[clamp(36px,5vw,64px)] font-extrabold leading-[1] tracking-[-0.04em]">Рейтинг на Яндекс Картах</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-6">
          <Reveal className="relative overflow-hidden rounded-[32px] bg-[#1f6a72] p-7 text-white md:col-span-3 md:row-span-2 md:p-9">
            <p className="text-[16px] font-semibold text-white/70">Средняя оценка</p>
            <p className="mt-2 text-[clamp(110px,16vw,200px)] font-extrabold leading-[0.85] tracking-[-0.06em]">{b.rating}</p>
            <div className="mt-4"><Stars size={28} /></div>
            <a href={`https://yandex.by/maps/org/${b.oid}/reviews/`} target="_blank" rel="noopener" className="mt-8 inline-flex h-12 items-center gap-2 rounded-[16px] bg-white px-5 text-[16px] font-bold text-[#1f6a72]">Читать отзывы <ArrowUpRight size={16} /></a>
            <svg className="pointer-events-none absolute -bottom-10 -right-10 h-56 w-56 opacity-20" viewBox="0 0 100 100" aria-hidden="true"><path d="M0 60 Q25 40 50 60 T100 60 V100 H0Z" fill="#fff" /><path d="M0 75 Q25 55 50 75 T100 75 V100 H0Z" fill="#fff" /></svg>
          </Reveal>
          <Reveal delay={0.05} className="rounded-[32px] bg-[#f2a33a] p-7 md:col-span-3 md:p-9">
            <p className="text-[clamp(64px,8vw,104px)] font-extrabold leading-[0.9] tracking-[-0.05em]">{b.rev}</p>
            <p className="mt-2 text-[20px] font-bold">оценок от клиентов на Яндекс Картах</p>
          </Reveal>
          {SOC.map((s, k) => (
            <Reveal key={s.k} delay={0.08 + k * 0.04} className="md:col-span-3">
              <a href={s.href} target="_blank" rel="noopener" className="group flex h-full items-center gap-4 rounded-[26px] border border-[#2a1a0f]/10 bg-white p-5 transition-transform hover:-translate-y-1">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[14px] bg-[#2a1a0f] text-[#f7efe1]"><s.Icon width={22} height={22} /></span>
                <span className="min-w-0"><span className="block text-[18px] font-bold">{s.k}</span><span className="block truncate text-[15px] text-[#2a1a0f]/60">{s.h}</span></span>
                <ArrowUpRight className="ml-auto shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" size={20} />
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------- FAQ ---------------- */
const FAQ = [
  ['Сколько по времени занимает заправка кондиционера?', 'Зависит от машины и состояния системы. Ориентировочное время мастер назовёт при записи.'],
  ['Нужно ли записываться заранее?', 'Лучше записаться онлайн или по телефону — так вы приедете к своему времени. Перед летом и в сезон переобувки запись плотнее.'],
  ['Сколько стоит?', 'Цена зависит от модели и объёма работ. Мастер назовёт стоимость до начала работ.'],
  ['Можно подождать машину на месте?', 'Уточните при записи — подскажем, как удобнее для вашей работы.'],
  ['Как можно оплатить?', 'Способы оплаты лучше уточнить по телефону.'],
  ['Где оставить машину, когда приеду?', `Подъезжайте по адресу ${b.addr}. Если не нашли, где встать, — позвоните, подскажем.`],
]
function FaqItem({ q, a, open, onClick, id }) {
  return (
    <div className={`rounded-[22px] border-2 transition-colors ${open ? 'border-[#1f6a72] bg-white' : 'border-[#2a1a0f]/10 bg-white/60'}`}>
      <h3>
        <button type="button" onClick={onClick} aria-expanded={open} aria-controls={id} className="flex w-full items-center justify-between gap-4 p-5 text-left text-[18px] font-bold md:px-6">
          {q}<motion.span animate={{ rotate: open ? 45 : 0 }} transition={SPR} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#2a1a0f]/5"><Plus size={18} /></motion.span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open && <motion.div id={id} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden"><p className="px-5 pb-5 text-[16px] leading-[1.55] text-[#2a1a0f]/75 md:px-6">{a}</p></motion.div>}
      </AnimatePresence>
    </div>
  )
}
function Faq() {
  const [o, setO] = useState(0)
  return (
    <section id="faq" className="scroll-mt-24 px-4 pb-20 md:px-6 md:pb-28">
      <div className="mx-auto grid max-w-[1280px] gap-8 lg:grid-cols-[360px_1fr]">
        <div>
          <p className={`text-[28px] leading-none text-[#1f6a72] ${HAND}`}>частые вопросы</p>
          <h2 className="mt-1 text-[clamp(36px,5vw,64px)] font-extrabold leading-[1] tracking-[-0.04em]">Вопросы</h2>
          <p className="mt-4 text-[17px] text-[#2a1a0f]/70">Не нашли ответ — позвоните: <a className="font-bold text-[#1f6a72]" href={'tel:' + tel(b.phone)}>{b.phone}</a></p>
        </div>
        <div className="space-y-3">{FAQ.map(([q, a], k) => <FaqItem key={q} id={'faq' + k} q={q} a={a} open={o === k} onClick={() => setO(o === k ? -1 : k)} />)}</div>
      </div>
    </section>
  )
}

/* ---------------- booking: DIKIDI + callback ---------------- */
const QUICK = ['Кондиционер', 'Шиномонтаж', 'Масло и фильтры', 'Тормоза', 'Ходовая', 'Диагностика', 'Другое']
function Book() {
  const bk = useBooking()
  const [step, setStep] = useState(0)
  const [err, setErr] = useState('')
  const nameRef = useRef(null)
  useEffect(() => { if (step === 1) nameRef.current?.focus() }, [step])
  const next = e => {
    e.preventDefault()
    if (step === 0) { if (!bk.s.svc) return setErr('Выберите, что нужно сделать'); setErr(''); return setStep(1) }
    bk.submit()
  }
  return (
    <section id="book" className="scroll-mt-24 px-4 py-20 md:px-6 md:py-28" style={{ background: '#2a1a0f', color: PAPER }}>
      <div className="mx-auto max-w-[1280px]">
        <p className={`text-[28px] leading-none text-[#f2a33a] ${HAND}`}>запись</p>
        <h2 className="mt-1 text-[clamp(36px,5vw,64px)] font-extrabold leading-[1] tracking-[-0.04em]">Записаться к Бобру</h2>
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <div className="flex flex-col rounded-[32px] bg-[#1f6a72] p-7 md:p-9">
            <span className="w-fit rounded-full bg-white/15 px-3 py-1 text-[14px] font-bold">Быстрее всего</span>
            <h3 className="mt-5 text-[clamp(30px,3.4vw,44px)] font-extrabold leading-[1.05] tracking-[-0.03em]">Онлайн-запись в DIKIDI</h3>
            <p className="mt-3 max-w-[440px] text-[17px] leading-[1.5] text-white/80">Выберите услугу, дату и свободное время сами — без звонков. Запись откроется в новой вкладке.</p>
            <ol className="mt-6 space-y-2 text-[16px] text-white/85">{['Выберите услугу', 'Отметьте дату и время', 'Подтвердите запись'].map((t, k) => <li key={t} className="flex items-center gap-3"><span className="grid h-7 w-7 place-items-center rounded-full bg-white/15 text-[14px] font-bold">{k + 1}</span>{t}</li>)}</ol>
            <a href={b.dikidi} target="_blank" rel="noopener" className="mt-8 inline-flex h-14 w-fit items-center gap-2 rounded-[18px] bg-[#f7efe1] px-6 text-[17px] font-bold text-[#1f6a72] shadow-[0_4px_0_#123f45] active:translate-y-[3px] active:shadow-none lg:mt-auto">Записаться онлайн <ArrowUpRight size={18} /></a>
          </div>
          <div className="rounded-[32px] bg-[#fffaf1] p-7 text-[#2a1a0f] md:p-9">
            {bk.s.sent ? (
              <div role="status" className="flex h-full flex-col items-start justify-center py-6">
                <CheckDraw className="text-[#1f6a72]" />
                <h3 className="mt-5 text-[34px] font-extrabold tracking-[-0.03em]">Заявка принята</h3>
                <p className="mt-3 max-w-[420px] text-[17px] text-[#2a1a0f]/70">Мастер перезвонит, уточнит детали и предложит время. В готовом сайте заявка сразу придёт вам в Telegram.</p>
                <button type="button" onClick={() => { bk.reset(); setStep(0) }} className="mt-6 text-[15px] font-bold text-[#1f6a72] underline underline-offset-4">Отправить ещё одну</button>
              </div>
            ) : (
              <form onSubmit={next} noValidate>
                <div className="flex items-center justify-between">
                  <h3 className="text-[26px] font-extrabold tracking-[-0.03em]">Перезвоните мне</h3>
                  <span className="text-[15px] font-semibold text-[#2a1a0f]/55">Шаг {step + 1} из 2</span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-1.5">{[0, 1].map(k => <span key={k} className="h-1.5 overflow-hidden rounded-full bg-[#2a1a0f]/10"><motion.span className="block h-full bg-[#b4652e]" animate={{ width: step >= k ? '100%' : '0%' }} /></span>)}</div>
                <AnimatePresence mode="wait">
                  <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} className="mt-6 min-h-[200px]">
                    {step === 0 ? (
                      <fieldset>
                        <legend className="text-[16px] font-semibold">Что нужно сделать?</legend>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {QUICK.map(q => <button key={q} type="button" aria-pressed={bk.s.svc === q} onClick={() => { bk.upd('svc', q); setErr('') }} className={`h-12 rounded-[14px] border-2 px-4 text-[16px] font-semibold transition-colors ${bk.s.svc === q ? 'border-[#2a1a0f] bg-[#2a1a0f] text-white' : 'border-[#2a1a0f]/15 hover:border-[#2a1a0f]/40'}`}>{q}</button>)}
                        </div>
                        {bk.s.svc && !QUICK.includes(bk.s.svc) && <p className="mt-4 rounded-[14px] bg-[#e3f1ee] p-3 text-[15px]"><b>Выбрано:</b> {bk.s.svc}</p>}
                      </fieldset>
                    ) : (
                      <div className="space-y-4">
                        <label className="block"><span className="text-[15px] font-semibold">Имя</span>
                          <input ref={nameRef} value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} autoComplete="name" className="mt-1.5 h-14 w-full rounded-[14px] border-2 border-[#2a1a0f]/15 bg-white px-4 text-[17px] outline-none focus:border-[#1f6a72]" /></label>
                        <label className="block"><span className="text-[15px] font-semibold">Телефон *</span>
                          <input value={bk.s.phone} onChange={e => bk.upd('phone', e.target.value)} onFocus={phoneFocus(bk)} type="tel" inputMode="tel" autoComplete="tel" placeholder="+375 __ ___-__-__" aria-invalid={bk.s.err} aria-describedby="ub-perr"
                            className={`mt-1.5 h-14 w-full rounded-[14px] border-2 bg-white px-4 text-[17px] outline-none focus:border-[#1f6a72] ${bk.s.err ? 'border-[#c0392b]' : 'border-[#2a1a0f]/15'}`} /></label>
                        {bk.s.err && <p id="ub-perr" className="text-[15px] font-semibold text-[#c0392b]">Проверьте номер: нужно 12 цифр с кодом +375.</p>}
                        <p className="text-[14px] text-[#2a1a0f]/55">Услуга: {bk.s.svc}</p>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
                {err && <p role="alert" className="text-[15px] font-semibold text-[#c0392b]">{err}</p>}
                <div className="mt-6 flex items-center justify-between gap-3">
                  {step ? <button type="button" onClick={() => setStep(0)} className="h-12 px-2 text-[15px] font-bold">← Назад</button> : <span />}
                  <button type="submit" disabled={bk.s.loading} className="inline-flex h-14 items-center gap-2 rounded-[18px] bg-[#b4652e] px-6 text-[17px] font-bold text-white shadow-[0_4px_0_#7a3f16] active:translate-y-[3px] active:shadow-none disabled:opacity-60">{step === 0 ? 'Дальше' : bk.s.loading ? 'Отправляем…' : 'Перезвоните мне'} <ArrowRight size={18} /></button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- contacts ---------------- */
function Contact() {
  return (
    <section id="contact" className="scroll-mt-24 px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto grid max-w-[1280px] gap-5 lg:grid-cols-[420px_1fr]">
        <div className="rounded-[32px] bg-white p-7 md:p-9">
          <p className={`text-[28px] leading-none text-[#b4652e] ${HAND}`}>где плотина</p>
          <h2 className="mt-1 text-[clamp(32px,4vw,48px)] font-extrabold leading-[1] tracking-[-0.04em]">Контакты</h2>
          <dl className="mt-7 space-y-5 text-[17px]">
            <div><dt className="text-[14px] font-semibold text-[#2a1a0f]/55">Адрес</dt><dd className="mt-1 font-bold">{b.addr[0].toUpperCase() + b.addr.slice(1)}, {b.city}</dd></div>
            <div><dt className="text-[14px] font-semibold text-[#2a1a0f]/55">Телефон и Viber</dt><dd className="mt-1"><a href={'tel:' + tel(b.phone)} className="text-[22px] font-extrabold text-[#1f6a72]">{b.phone}</a></dd></div>
            <div><dt className="text-[14px] font-semibold text-[#2a1a0f]/55">Часы работы</dt><dd className="mt-1">Уточняйте по телефону</dd></div>
          </dl>
          <div className="mt-6 flex flex-wrap gap-2">{SOC.map(s => <a key={s.k} href={s.href} target="_blank" rel="noopener" aria-label={s.k} className="grid h-12 w-12 place-items-center rounded-[14px] bg-[#2a1a0f] text-[#f7efe1] transition-transform hover:-translate-y-0.5"><s.Icon width={20} height={20} /></a>)}</div>
          <div className="mt-7 flex flex-wrap gap-2">
            <a href={b.dikidi} target="_blank" rel="noopener" className="inline-flex h-12 items-center gap-1.5 rounded-[14px] bg-[#1f6a72] px-4 text-[15px] font-bold text-white">Записаться онлайн <ArrowUpRight size={16} /></a>
            <a href={`https://yandex.by/maps/?rtext=~${encodeURIComponent('Минск, ' + b.addr)}`} target="_blank" rel="noopener" className="inline-flex h-12 items-center gap-1.5 rounded-[14px] border-2 border-[#2a1a0f]/15 px-4 text-[15px] font-bold">Маршрут <ArrowUpRight size={16} /></a>
          </div>
        </div>
        <div className="h-[380px] overflow-hidden rounded-[32px] md:h-auto md:min-h-[480px]"><MapFrame oid={b.oid} /></div>
      </div>
    </section>
  )
}

function App() {
  useSmooth()
  const active = useSpy(['services', 'checkup', 'how', 'reviews', 'faq', 'book', 'contact'])
  return (
    <MotionConfig reducedMotion="user">
      <div className={`relative overflow-x-clip ${F}`} style={{ background: PAPER, color: INK, '--sel': WOOD, '--selc': '#fff' }}>
        <Ribbon name={b.name} bg={INK} fg={PAPER} />
        <Header active={active} />
        <main>
          <Hero />
          <Services />
          <Checkup />
          <How />
          <Reviews />
          <Faq />
          <Book />
          <Contact />
        </main>
        <footer className="px-4 pb-10 md:px-6">
          <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-3 border-t border-[#2a1a0f]/15 pt-6 text-[15px] text-[#2a1a0f]/65">
            <span>© 2026 {b.name} · Концепт сайта — Артём</span>
            <span>{b.addr}, {b.city} · <a href={'tel:' + tel(b.phone)}>{b.phone}</a></span>
          </div>
        </footer>
        <CallBar phone={b.phone} barCls="bg-[#fffaf1]/95 backdrop-blur border-t border-[#2a1a0f]/10" callCls="rounded-[14px] border-2 border-[#2a1a0f] text-[16px]" bookCls="rounded-[14px] bg-[#1f6a72] text-white text-[16px]" />
        <div className="h-[76px] sm:hidden" />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
