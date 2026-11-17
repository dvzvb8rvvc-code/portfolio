import React, { useRef, useState, useEffect, useMemo, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, useSpring, useInView, useMotionValueEvent, AnimatePresence, MotionConfig } from 'framer-motion'
import { ArrowRight, ArrowUpRight, Phone, MapPin, MessageCircle, Search, CornerDownLeft, Check, X, Layers, Star } from 'lucide-react'
import '../lib/base.css'
import { useSmooth, Ribbon, LineReveal, Reveal, useBooking, phoneFocus, CheckDraw, MapFrame, CallBar, tel, useLite, IG, TG, WA } from '../lib/kit'
import { COLORS, SHAPES, FINISH, LAYERS, stateAt } from './experience-state'

const NailScene = lazy(() => import('./experience3d'))

const b = {
  name: 'Experience', addr: 'просп. Победителей, 115', city: 'Минск',
  phone: '+375 44 749-66-00', viber: 'https://viber.click/375447496600', wa: 'https://wa.me/375447496600',
  tg: 'https://t.me/375447496600', ig: 'https://instagram.com/experience.minsk', rating: '5,0', rev: 126, oid: '229902768096',
}
const BG = '#08090a'
const SANS = "font-['Inter_Tight',sans-serif]", MONO = "font-['JetBrains_Mono',monospace]"
const GRAD = 'linear-gradient(180deg,#ffffff 20%,rgba(255,255,255,.55))'
const ACC = 'linear-gradient(90deg,#b9a3f5,#f3a6c8 60%,#ffd0b0)'
const GT = { backgroundImage: GRAD }

/* cursor-following border light */
function Glow({ className = '', children, inner = '', as = 'div', ...rest }) {
  const Tag = as
  const move = e => { const r = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty('--x', e.clientX - r.left + 'px'); e.currentTarget.style.setProperty('--y', e.clientY - r.top + 'px') }
  return (
    <Tag onPointerMove={move} className={'group relative rounded-[18px] p-px [--x:50%] [--y:0%] ' + className}
      style={{ background: 'radial-gradient(380px circle at var(--x) var(--y), rgba(185,163,245,.55), transparent 45%), rgba(255,255,255,.08)' }} {...rest}>
      <div className={'relative h-full overflow-hidden rounded-[17px] bg-[#0d0e11] ' + inner}>
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: 'radial-gradient(500px circle at var(--x) var(--y), rgba(185,163,245,.07), transparent 40%)' }} />
        {children}
      </div>
    </Tag>
  )
}
const Kbd = ({ children, className = '' }) => <kbd className={`${MONO} inline-grid h-6 min-w-6 place-items-center rounded-md border border-white/10 bg-white/[.06] px-1.5 text-[11px] text-white/70 ${className}`}>{children}</kbd>

/* ---------------- studio app film ---------------- */
const CAPS = [
  { k: '01 · Форма', h: 'Начинаем с формы.', d: 'Квадрат, овал или миндаль — подбираем под руку и образ жизни.' },
  { k: '02 · Цвет', h: 'Цвет — слой за слоем.', d: 'База выравнивает, цвет задаёт настроение.' },
  { k: '03 · Покрытие', h: 'Глянец или мат.', d: 'Топ защищает покрытие и задаёт финиш.' },
  { k: '04 · Готово', h: 'Собрано. Без компромиссов.', d: 'Аккуратный результат, который носится.' },
]
function AppUI({ S, lite, p, near, mounted }) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[16px] border border-white/10 bg-[#0b0c0e]/95 shadow-[0_0_0_1px_rgba(0,0,0,.6),0_60px_120px_-40px_rgba(120,90,255,.35)]">
      <div className="flex h-10 shrink-0 items-center gap-3 border-b border-white/[.07] px-4">
        <div className="flex gap-1.5">{[0, 1, 2].map(i => <span key={i} className="h-2.5 w-2.5 rounded-full bg-white/15" />)}</div>
        <span className={`${MONO} text-[11px] text-white/45`}>experience / studio / новый дизайн</span>
        <span className="ml-auto hidden items-center gap-1.5 md:flex"><Kbd>⌘</Kbd><Kbd>K</Kbd></span>
      </div>
      <div className="flex min-h-0 flex-1">
        {/* layers */}
        <div className="hidden w-[200px] shrink-0 border-r border-white/[.07] p-3 md:block">
          <p className={`${MONO} mb-3 flex items-center gap-2 px-2 text-[10.5px] uppercase tracking-[.16em] text-white/40`}><Layers size={12} />Слои</p>
          {[...LAYERS].reverse().map((l, ri) => {
            const i = 3 - ri, on = S.layer === i || S.layer === 4
            return (
              <div key={l} className={`relative mb-1 flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition-colors ${on ? 'text-white' : 'text-white/40'}`}>
                {S.layer === i && <motion.span layoutId="layer" className="absolute inset-0 rounded-lg border border-white/10 bg-white/[.06]" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
                <span className="relative h-3.5 w-3.5 rounded-[4px] border border-white/20" style={{ background: i === 2 ? COLORS[S.color].hex : i === 0 ? '#efc9c1' : i === 3 ? 'rgba(255,255,255,.25)' : 'rgba(255,255,255,.6)' }} />
                <span className="relative">{l}</span>
                {S.layer === 4 && <Check size={13} className="relative ml-auto text-[#b9a3f5]" />}
              </div>
            )
          })}
        </div>
        {/* canvas */}
        <div className="relative min-w-0 flex-1 bg-[radial-gradient(ellipse_at_50%_60%,#15131c,#0a0b0d_70%)]">
          <div className="absolute inset-0 opacity-[.35]" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,.12) 1px, transparent 1px)', backgroundSize: '22px 22px' }} />
          {lite ? <LiteNail S={S} /> : mounted && <Suspense fallback={null}><NailScene progress={p} active={near} /></Suspense>}
          <div className={`${MONO} absolute bottom-3 left-3 flex flex-wrap gap-1.5 text-[10.5px] text-white/55`}>
            <span className="rounded-md border border-white/10 bg-black/40 px-2 py-1">{SHAPES[S.shape]}</span>
            <span className="rounded-md border border-white/10 bg-black/40 px-2 py-1">{COLORS[S.color].k}</span>
            <span className="rounded-md border border-white/10 bg-black/40 px-2 py-1">{FINISH[S.finish]}</span>
          </div>
        </div>
        {/* properties */}
        <div className="hidden w-[230px] shrink-0 border-l border-white/[.07] p-4 lg:block">
          <p className={`${MONO} mb-3 text-[10.5px] uppercase tracking-[.16em] text-white/40`}>Форма</p>
          <div className="mb-6 grid grid-cols-3 gap-1 rounded-lg border border-white/[.07] bg-white/[.03] p-1">
            {SHAPES.map((s, i) => <span key={s} className="relative py-1.5 text-center text-[11.5px]">{S.shape === i && <motion.span layoutId="shape" className="absolute inset-0 rounded-md bg-white/10" />}<span className={`relative ${S.shape === i ? 'text-white' : 'text-white/40'}`}>{s}</span></span>)}
          </div>
          <p className={`${MONO} mb-3 text-[10.5px] uppercase tracking-[.16em] text-white/40`}>Цвет</p>
          <div className="mb-6 flex gap-2">
            {COLORS.map((c, i) => <span key={c.k} className={`h-8 w-8 rounded-full border-2 transition-all ${S.color === i ? 'scale-110 border-white' : 'border-transparent'}`} style={{ background: c.hex, boxShadow: S.color === i ? `0 0 18px ${c.hex}` : 'none' }} />)}
          </div>
          <p className={`${MONO} mb-3 text-[10.5px] uppercase tracking-[.16em] text-white/40`}>Финиш</p>
          <div className="grid grid-cols-2 gap-1 rounded-lg border border-white/[.07] bg-white/[.03] p-1">
            {FINISH.map((s, i) => <span key={s} className="relative py-1.5 text-center text-[11.5px]">{S.finish === i && <motion.span layoutId="fin" className="absolute inset-0 rounded-md bg-white/10" />}<span className={`relative ${S.finish === i ? 'text-white' : 'text-white/40'}`}>{s}</span></span>)}
          </div>
          <div className="mt-8 rounded-lg border border-white/[.07] p-3">
            <p className={`${MONO} text-[10.5px] text-white/40`}>статус</p>
            <p className="mt-1 text-[13px] text-white/80">{S.stage === 3 ? 'Готово к записи' : S.stage < 0 ? 'Черновик' : 'В работе…'}</p>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10"><motion.div className="h-full" style={{ background: ACC }} animate={{ width: ((S.stage + 1) / 4) * 100 + '%' }} /></div>
          </div>
        </div>
      </div>
    </div>
  )
}
function LiteNail({ S }) {
  const r = ['18% 18% 40% 40% / 10% 10% 30% 30%', '50% 50% 40% 40% / 40% 40% 30% 30%', '50% 50% 40% 40% / 70% 70% 30% 30%'][S.shape]
  return <div className="absolute inset-0 grid place-items-center"><div className="h-[46%] w-[18%] min-w-[70px] transition-all duration-700" style={{ borderRadius: r, background: `linear-gradient(160deg, rgba(255,255,255,${S.finish ? 0 : 0.45}), transparent 40%), ${COLORS[S.color].hex}`, boxShadow: `0 0 60px ${COLORS[S.color].hex}55` }} /></div>
}
function Film({ lite }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const p = useSpring(scrollYProgress, { stiffness: 100, damping: 26, mass: 0.3 })
  const near = useInView(ref, { margin: '300px 0px' })
  const [mounted, setMounted] = useState(false)
  useEffect(() => { if (near) setMounted(true) }, [near])
  const [S, setS] = useState(() => stateAt(0))
  const key = useRef('')
  useMotionValueEvent(p, 'change', v => { const s = stateAt(v), k = [s.shape, s.color, s.finish, s.stage].join(); if (k !== key.current) { key.current = k; setS(s) } })
  const rx = useTransform(p, [0, 0.12], [26, 0])
  const sc = useTransform(p, [0, 0.12], [0.88, 1])
  const ty = useTransform(p, [0, 0.12], ['34vh', '0vh'])
  const heroO = useTransform(p, [0, 0.07], [1, 0])
  const heroPE = useTransform(p, v => (v < 0.04 ? 'auto' : 'none'))
  const cap = S.stage >= 0 ? CAPS[S.stage] : null
  return (
    <section ref={ref} id="top" className="relative h-[460vh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* glows & beams */}
        <div className="pointer-events-none absolute left-1/2 top-[-20%] h-[70vh] w-[90vw] -translate-x-1/2 rounded-full opacity-40 blur-[120px]" style={{ background: 'radial-gradient(closest-side,#5b46c9,transparent)' }} />
        {[18, 38, 62, 82].map((x, i) => (
          <div key={x} className="pointer-events-none absolute top-0 h-full w-px overflow-hidden bg-white/[.04]" style={{ left: x + '%' }}>
            <motion.div className="h-[30%] w-px" style={{ background: 'linear-gradient(180deg,transparent,rgba(185,163,245,.8),transparent)' }} animate={{ y: ['-40vh', '120vh'] }} transition={{ duration: 5 + i, repeat: Infinity, ease: 'linear', delay: i * 1.3 }} />
          </div>
        ))}
        <motion.div style={{ opacity: heroO, pointerEvents: heroPE }} className="absolute inset-x-0 top-[13%] z-[2] px-5 text-center md:top-[15%]">
          <motion.a href="#find" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={`${SANS} mx-auto mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.04] py-1 pl-1 pr-3.5 text-[13px] text-white/70 hover:border-white/25`}>
            <span className="rounded-full px-2 py-0.5 text-[11.5px] font-medium text-[#0b0c0e]" style={{ background: ACC }}>Новое</span> Найдите услугу за секунду <Kbd>⌘K</Kbd>
          </motion.a>
          <h1 className={`${SANS} mx-auto max-w-[980px] text-[clamp(40px,7vw,96px)] font-semibold leading-[1] tracking-[-0.045em]`}>
            <LineReveal delay={0.1}><span className="bg-clip-text text-transparent" style={GT}>Маникюр,</span></LineReveal>
            <LineReveal delay={0.22}><span className="bg-clip-text text-transparent" style={GT}>продуманный до слоя.</span></LineReveal>
          </h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mx-auto mt-6 max-w-[520px] text-[16.5px] leading-relaxed text-white/55">Ногтевая студия на проспекте Победителей, 115. Форма, цвет и покрытие — как в хорошем продукте: без лишнего.</motion.p>
        </motion.div>
        <AnimatePresence mode="wait">
          {cap && (
            <motion.div key={S.stage} initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -8, filter: 'blur(6px)' }} transition={{ duration: 0.35 }}
              className="absolute inset-x-0 top-[78px] z-[2] px-5 text-center md:top-[86px]">
              <p className={`${MONO} text-[11px] uppercase tracking-[.2em] text-[#b9a3f5]`}>{cap.k}</p>
              <h2 className={`${SANS} mt-2 bg-clip-text text-[clamp(24px,3.2vw,44px)] font-semibold tracking-[-0.04em] text-transparent`} style={GT}>{cap.h}</h2>
              <p className="mx-auto mt-1 hidden max-w-[460px] text-[14.5px] text-white/50 md:block">{cap.d}</p>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="absolute inset-x-3 bottom-[88px] top-[200px] md:inset-x-[6vw] md:bottom-6 md:top-[200px]" style={{ perspective: 1400 }}>
          <motion.div style={{ rotateX: rx, scale: sc, y: ty, transformOrigin: '50% 0%' }} className="h-full">
            <AppUI S={S} lite={lite} p={p} near={near} mounted={mounted} />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- command palette (value interaction) ---------------- */
const SVC = [
  { t: 'Маникюр без покрытия', g: 'Маникюр', k: 'классический аппаратный комбинированный руки' },
  { t: 'Маникюр с покрытием гель-лаком', g: 'Маникюр', k: 'гель лак шеллак цвет' },
  { t: 'Покрытие гель-лаком', g: 'Покрытие', k: 'гель лак цвет топ' },
  { t: 'Укрепление ногтей', g: 'Покрытие', k: 'база гель укрепить' },
  { t: 'Наращивание ногтей', g: 'Покрытие', k: 'длина гель форма' },
  { t: 'Коррекция наращивания', g: 'Покрытие', k: 'коррекция' },
  { t: 'Снятие покрытия', g: 'Покрытие', k: 'снять' },
  { t: 'Дизайн ногтей', g: 'Дизайн', k: 'рисунок френч втирка стразы' },
  { t: 'Френч', g: 'Дизайн', k: 'french дизайн' },
  { t: 'Педикюр', g: 'Педикюр', k: 'ноги стопы' },
  { t: 'Педикюр с покрытием', g: 'Педикюр', k: 'ноги гель лак' },
  { t: 'Уход за руками', g: 'Уход', k: 'spa спа крем парафин' },
]
function Palette({ bk, inputRef }) {
  const [q, setQ] = useState('')
  const [act, setAct] = useState(0)
  const [cart, setCart] = useState([])
  const list = useMemo(() => {
    const s = q.trim().toLowerCase()
    return s ? SVC.filter(v => (v.t + ' ' + v.g + ' ' + v.k).toLowerCase().includes(s)) : SVC
  }, [q])
  useEffect(() => setAct(0), [q])
  const toggle = t => setCart(c => (c.includes(t) ? c.filter(x => x !== t) : [...c, t]))
  const onKey = e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setAct(a => Math.min(list.length - 1, a + 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setAct(a => Math.max(0, a - 1)) }
    else if (e.key === 'Enter' && list[act]) { e.preventDefault(); toggle(list[act].t) }
    else if (e.key === 'Escape') setQ('')
  }
  const go = () => { bk.upd('svc', cart.join(', ')); window.__lenis ? window.__lenis.scrollTo('#book', { offset: -70 }) : document.getElementById('book')?.scrollIntoView() }
  let lastG = ''
  return (
    <section id="find" className="relative px-5 py-28 md:px-12 md:py-36">
      <div className="pointer-events-none absolute left-1/2 top-24 h-[420px] w-[720px] max-w-full -translate-x-1/2 rounded-full opacity-30 blur-[120px]" style={{ background: 'radial-gradient(closest-side,#7b5cff,transparent)' }} />
      <div className="relative mx-auto max-w-[1180px]">
        <div className="text-center">
          <p className={`${MONO} text-[11px] uppercase tracking-[.2em] text-white/40`}>Поиск услуги</p>
          <h2 className={`${SANS} mx-auto mt-4 max-w-[760px] bg-clip-text text-[clamp(34px,5vw,68px)] font-semibold leading-[1.02] tracking-[-0.045em] text-transparent`} style={GT}>Найти. Нажать ↵. Записаться.</h2>
          <p className="mx-auto mt-5 max-w-[480px] text-[16px] text-white/50">Начните печатать — список отфильтруется. Стрелки выбирают, Enter добавляет в запись.</p>
        </div>
        <div className="mx-auto mt-14 grid max-w-[980px] gap-4 lg:grid-cols-[1.4fr_1fr]">
          <Glow inner="backdrop-blur-xl">
            <div className="flex items-center gap-3 border-b border-white/[.07] px-4">
              <Search size={18} className="text-white/40" />
              <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)} onKeyDown={onKey} placeholder="Найти услугу…" aria-label="Найти услугу" role="combobox" aria-expanded="true" aria-controls="svc-list" aria-activedescendant={list[act] ? 'svc-' + act : undefined}
                className="h-14 flex-1 bg-transparent text-[16px] text-white outline-none placeholder:text-white/30" />
              <span className="hidden items-center gap-1 sm:flex"><Kbd>⌘</Kbd><Kbd>K</Kbd></span>
            </div>
            <ul id="svc-list" role="listbox" data-lenis-prevent className="h-[340px] overflow-y-auto p-2 [scrollbar-width:thin]">
              {list.length === 0 && <li className="px-3 py-10 text-center text-[14px] text-white/40">Ничего не нашли — <a href="#book" className="underline">оставьте заявку</a>, подскажем.</li>}
              {list.map((v, i) => {
                const head = v.g !== lastG; lastG = v.g
                const inCart = cart.includes(v.t)
                return (
                  <React.Fragment key={v.t}>
                    {head && <li className={`${MONO} px-3 pb-1 pt-3 text-[10.5px] uppercase tracking-[.16em] text-white/30`} role="presentation">{v.g}</li>}
                    <li id={'svc-' + i} role="option" aria-selected={i === act} onMouseMove={() => setAct(i)} onClick={() => toggle(v.t)}
                      className={`relative flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-[14.5px] ${i === act ? 'text-white' : 'text-white/65'}`}>
                      {i === act && <motion.span layoutId="act" className="absolute inset-0 rounded-lg bg-white/[.07]" transition={{ type: 'spring', stiffness: 600, damping: 40 }} />}
                      <span className={`relative grid h-5 w-5 place-items-center rounded-md border ${inCart ? 'border-transparent' : 'border-white/20'}`} style={inCart ? { background: ACC } : undefined}>{inCart && <Check size={13} className="text-[#0b0c0e]" />}</span>
                      <span className="relative flex-1">{v.t}</span>
                      {i === act && <span className="relative flex items-center gap-1.5 text-[12px] text-white/45">{inCart ? 'убрать' : 'добавить'}<Kbd><CornerDownLeft size={11} /></Kbd></span>}
                    </li>
                  </React.Fragment>
                )
              })}
            </ul>
            <div className={`${MONO} flex items-center gap-4 border-t border-white/[.07] px-4 py-2.5 text-[11px] text-white/35`}><span className="flex items-center gap-1.5"><Kbd>↑</Kbd><Kbd>↓</Kbd>выбор</span><span className="flex items-center gap-1.5"><Kbd>↵</Kbd>добавить</span><span className="hidden items-center gap-1.5 sm:flex"><Kbd>esc</Kbd>очистить</span></div>
          </Glow>
          <Glow inner="p-5 flex flex-col">
            <p className={`${MONO} text-[11px] uppercase tracking-[.16em] text-white/40`}>В записи · {cart.length}</p>
            <div className="mt-4 flex-1 space-y-2">
              <AnimatePresence initial={false}>
                {cart.length === 0 && <motion.p key="e" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-[14px] text-white/35">Пока пусто. Выберите услугу слева.</motion.p>}
                {cart.map(t => (
                  <motion.div key={t} layout initial={{ opacity: 0, x: -12, filter: 'blur(4px)' }} animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, x: 12 }} className="flex items-center gap-3 rounded-xl border border-white/[.08] bg-white/[.03] px-3.5 py-2.5 text-[14px]">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: ACC }} /><span className="flex-1">{t}</span>
                    <button type="button" onClick={() => toggle(t)} aria-label={'Убрать ' + t} className="text-white/40 hover:text-white"><X size={15} /></button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <button type="button" disabled={!cart.length} onClick={go} className="mt-5 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white text-[14.5px] font-medium text-[#0b0c0e] transition-opacity disabled:opacity-30">Перейти к записи <ArrowRight size={16} /></button>
          </Glow>
        </div>
      </div>
    </section>
  )
}

/* ---------------- features grid ---------------- */
function Features() {
  return (
    <section id="about" className="px-5 pb-28 md:px-12 md:pb-36">
      <div className="mx-auto max-w-[1180px]">
        <h2 className={`${SANS} max-w-[760px] text-[clamp(32px,4.4vw,60px)] font-semibold leading-[1.02] tracking-[-0.045em]`}><span className="bg-clip-text text-transparent" style={GT}>Детали, которые </span><span className="text-white/35">видно.</span></h2>
        <div className="mt-12 grid auto-rows-[minmax(220px,auto)] gap-3 md:grid-cols-3">
          <Reveal className="md:row-span-2"><Glow className="h-full" inner="p-7 flex flex-col">
            <p className={`${MONO} text-[11px] uppercase tracking-[.16em] text-white/40`}>Яндекс Карты</p>
            <p className={`${SANS} mt-auto bg-clip-text text-[clamp(110px,12vw,180px)] font-semibold leading-[.85] tracking-[-0.06em] text-transparent`} style={{ backgroundImage: ACC }}>{b.rating}</p>
            <div className="mt-4 flex gap-1">{[0, 1, 2, 3, 4].map(i => <Star key={i} size={16} className="fill-white text-white" />)}</div>
            <p className="mt-3 text-[15px] text-white/55">{b.rev} оценок — и все на пять.</p>
          </Glow></Reveal>
          <Reveal delay={0.05} className="md:col-span-2"><Glow className="h-full" inner="p-7 flex flex-col">
            <p className={`${MONO} text-[11px] uppercase tracking-[.16em] text-white/40`}>Процесс</p>
            <div className="mt-auto grid grid-cols-4 gap-2">
              {LAYERS.map((l, i) => <div key={l} className="rounded-xl border border-white/[.08] bg-white/[.02] p-3"><p className={`${MONO} text-[11px] text-[#b9a3f5]`}>0{i + 1}</p><p className="mt-6 text-[14px] text-white/80 md:text-[15px]">{l}</p></div>)}
            </div>
            <p className="mt-4 text-[15px] text-white/55">Каждый слой — отдельный шаг. Поэтому покрытие выглядит аккуратно.</p>
          </Glow></Reveal>
          <Reveal delay={0.1}><Glow className="h-full" inner="p-7 flex flex-col">
            <MapPin size={20} className="text-white/60" />
            <p className={`${SANS} mt-auto text-[26px] font-semibold tracking-[-0.03em]`}>Победителей, 115</p>
            <p className="mt-1 text-[14.5px] text-white/50">Минск</p>
          </Glow></Reveal>
          <Reveal delay={0.15}><Glow as="a" href={b.ig} target="_blank" rel="noopener" className="block h-full" inner="p-7 flex flex-col">
            <IG width={22} height={22} className="text-white/70" />
            <p className={`${SANS} mt-auto text-[20px] font-semibold`}>Instagram</p>
            <p className="text-[14px] text-white/45">@experience.minsk</p>
            <ArrowUpRight size={18} className="absolute right-6 top-6 text-white/40 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
          </Glow></Reveal>
        </div>
      </div>
    </section>
  )
}

/* ---------------- booking ---------------- */
const BSV = ['Маникюр', 'Покрытие гель-лаком', 'Педикюр', 'Наращивание', 'Дизайн']
const DAYS = ['Сегодня', 'Завтра', 'На неделе', 'Подберите сами']
const TIMES = ['Утро', 'День', 'Вечер']
function Pill({ on, children, ...rest }) {
  return <button type="button" aria-pressed={on} className={`h-10 rounded-lg px-4 text-[14px] transition-colors ${on ? 'bg-white text-[#0b0c0e]' : 'border border-white/10 bg-white/[.03] text-white/75 hover:border-white/30'}`} {...rest}>{children}</button>
}
function Book({ bk }) {
  const [step, setStep] = useState(0)
  const [day, setDay] = useState(''), [time, setTime] = useState(''), [via, setVia] = useState('Звонок')
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
  const custom = bk.s.svc && !BSV.includes(bk.s.svc)
  const titles = ['Услуга', 'Когда удобно', 'Контакты']
  return (
    <section id="book" className="px-5 py-28 md:px-12 md:py-36">
      <div className="mx-auto grid max-w-[1180px] gap-14 lg:grid-cols-[.85fr_1.15fr]">
        <div>
          <h2 className={`${SANS} text-[clamp(36px,5vw,72px)] font-semibold leading-[1] tracking-[-0.045em]`}><span className="bg-clip-text text-transparent" style={GT}>Запись</span><br /><span className="bg-clip-text text-transparent" style={{ backgroundImage: ACC }}>в три шага.</span></h2>
          <p className="mt-6 max-w-[380px] text-[16px] leading-relaxed text-white/50">Администратор свяжется и подтвердит время. Или напишите напрямую.</p>
          <a href={'tel:' + tel(b.phone)} className={`${SANS} mt-5 inline-block text-[24px] font-medium tracking-[-0.02em] hover:text-[#b9a3f5]`}>{b.phone}</a>
        </div>
        <Glow inner="p-6 md:p-9">
          {bk.s.sent ? (
            <div className="py-10 text-center" role="status">
              <CheckDraw className="mx-auto text-[#b9a3f5]" />
              <p className={`${SANS} mt-6 text-[28px] font-semibold tracking-[-0.04em]`}>Заявка отправлена</p>
              <p className="mx-auto mt-3 max-w-[380px] text-white/55">Ответим {via === 'Звонок' ? 'звонком' : 'в ' + via}. В готовом сайте заявка сразу придёт вам в Telegram.</p>
              <button type="button" onClick={() => { bk.reset(); setStep(0); setDay(''); setTime('') }} className="mt-8 text-[14px] text-white/50 underline underline-offset-4">Новая заявка</button>
            </div>
          ) : (
            <form onSubmit={next} noValidate>
              <div className={`${MONO} mb-8 flex gap-2 text-[11px]`}>
                {titles.map((t, i) => <span key={t} className={`flex-1 border-t-2 pt-2 ${i <= step ? 'border-[#b9a3f5] text-white/80' : 'border-white/10 text-white/35'}`}>0{i + 1} {t}</span>)}
              </div>
              <h3 ref={head} tabIndex={-1} className={`${SANS} mb-6 text-[24px] font-semibold tracking-[-0.03em] outline-none`}>{['Что делаем?', 'Когда удобно?', 'Куда ответить?'][step]}</h3>
              <AnimatePresence mode="wait">
                <motion.div key={step} initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }} transition={{ duration: 0.25 }}>
                  {step === 0 && <div className="flex flex-wrap gap-2">{custom && <Pill on>{bk.s.svc}</Pill>}{BSV.map(s => <Pill key={s} on={bk.s.svc === s} onClick={() => { bk.upd('svc', s); setErr('') }}>{s}</Pill>)}</div>}
                  {step === 1 && (<>
                    <div className="flex flex-wrap gap-2">{DAYS.map(d => <Pill key={d} on={day === d} onClick={() => { setDay(d); setErr('') }}>{d}</Pill>)}</div>
                    <p className={`${MONO} mb-3 mt-7 text-[11px] uppercase tracking-[.14em] text-white/40`}>Время</p>
                    <div className="flex flex-wrap gap-2">{TIMES.map(t => <Pill key={t} on={time === t} onClick={() => setTime(t)}>{t}</Pill>)}</div>
                  </>)}
                  {step === 2 && (<div className="space-y-3">
                    <input value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} autoComplete="name" placeholder="Имя" aria-label="Имя" className="h-12 w-full rounded-lg border border-white/10 bg-white/[.03] px-4 text-[15.5px] text-white outline-none placeholder:text-white/30 focus:border-[#b9a3f5]" />
                    <input value={bk.s.phone} onChange={e => bk.upd('phone', e.target.value)} onFocus={phoneFocus(bk)} type="tel" inputMode="tel" autoComplete="tel" placeholder="+375 __ ___-__-__" aria-label="Телефон" aria-invalid={bk.s.err}
                      className={`h-12 w-full rounded-lg border bg-white/[.03] px-4 text-[15.5px] text-white outline-none placeholder:text-white/30 focus:border-[#b9a3f5] ${bk.s.err ? 'border-[#ff6b81]' : 'border-white/10'}`} />
                    {bk.s.err && <p className="text-[14px] text-[#ff6b81]">Проверьте номер — 12 цифр с кодом +375.</p>}
                    <p className={`${MONO} pt-2 text-[11px] uppercase tracking-[.14em] text-white/40`}>Как ответить</p>
                    <div className="flex flex-wrap gap-2">{['Звонок', 'Telegram', 'Viber', 'WhatsApp'].map(v => <Pill key={v} on={via === v} onClick={() => setVia(v)}>{v}</Pill>)}</div>
                  </div>)}
                </motion.div>
              </AnimatePresence>
              {err && <p className="mt-4 text-[14px] text-[#ff6b81]" role="alert">{err}</p>}
              <div className="mt-8 flex items-center justify-between">
                {step > 0 ? <button type="button" onClick={() => setStep(step - 1)} className="text-[14px] text-white/50 hover:text-white">← Назад</button> : <span />}
                <button type="submit" disabled={bk.s.loading} className="inline-flex h-11 items-center gap-2 rounded-lg bg-white px-5 text-[14.5px] font-medium text-[#0b0c0e] disabled:opacity-60">{step < 2 ? 'Дальше' : bk.s.loading ? 'Отправляем…' : 'Записаться'} <Kbd className="border-black/10 bg-black/5 text-black/60"><CornerDownLeft size={11} /></Kbd></button>
              </div>
            </form>
          )}
        </Glow>
      </div>
    </section>
  )
}

function Contact() {
  const L = [[b.tg, <TG key="t" />, 'Telegram'], [b.viber, <MessageCircle key="v" size={17} />, 'Viber'], [b.wa, <WA key="w" />, 'WhatsApp'], [b.ig, <IG key="i" />, 'Instagram']]
  return (
    <section id="contact" className="px-5 py-24 md:px-12">
      <div className="mx-auto grid max-w-[1180px] gap-10 lg:grid-cols-[.85fr_1.15fr]">
        <div>
          <h2 className={`${SANS} bg-clip-text text-[clamp(32px,4.2vw,56px)] font-semibold tracking-[-0.045em] text-transparent`} style={GT}>Контакты</h2>
          <p className="mt-8 flex items-start gap-3 text-[17px] text-white/85"><MapPin className="mt-1 shrink-0 text-[#b9a3f5]" size={19} />{b.addr}, {b.city}</p>
          <a href={'tel:' + tel(b.phone)} className="mt-4 flex items-center gap-3 text-[21px] hover:text-[#b9a3f5]"><Phone className="text-[#b9a3f5]" size={18} />{b.phone}</a>
          <p className="mt-2 text-[14px] text-white/45">Telegram, Viber, WhatsApp — по этому же номеру</p>
          <div className="mt-8 flex flex-wrap gap-2">{L.map(([h, ic, l]) => <a key={l} href={h} target="_blank" rel="noopener" className="inline-flex h-11 items-center gap-2 rounded-lg border border-white/10 bg-white/[.03] px-4 text-[14px] hover:border-white/30">{ic}{l}</a>)}</div>
        </div>
        <Glow className="h-[380px] md:h-[440px]" inner=""><MapFrame oid={b.oid} dark /></Glow>
      </div>
    </section>
  )
}

function App() {
  useSmooth()
  const lite = useLite()
  const bk = useBooking()
  const inputRef = useRef(null)
  const openPalette = () => {
    const el = document.getElementById('find')
    if (window.__lenis) window.__lenis.scrollTo(el, { offset: -40, onComplete: () => inputRef.current?.focus({ preventScroll: true }) }); else el?.scrollIntoView()
    setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 1300)
  }
  useEffect(() => {
    const h = e => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openPalette() }
      else if (e.key === '/' && !/input|textarea/i.test(document.activeElement?.tagName || '')) { e.preventDefault(); openPalette() }
    }
    addEventListener('keydown', h); return () => removeEventListener('keydown', h)
  }, [])
  return (
    <MotionConfig reducedMotion="user">
      <div className={`overflow-x-clip text-white ${SANS}`} style={{ background: BG, '--sel': '#b9a3f5', '--selc': '#08090a' }}>
        <Ribbon name={b.name} bg="#141519" fg="rgba(255,255,255,.75)" />
        <header className="sticky top-0 z-40 border-b border-white/[.06] bg-[#08090a]/70 backdrop-blur-xl">
          <div className="mx-auto flex h-14 max-w-[1180px] items-center justify-between px-5 md:px-6">
            <a href="#top" className="flex items-center gap-2.5"><span className="h-5 w-5 rounded-[6px]" style={{ background: ACC }} /><span className="text-[15px] font-semibold tracking-[-0.02em]">Experience</span></a>
            <nav className="hidden gap-7 text-[13.5px] text-white/55 md:flex">{[['#find', 'Услуги'], ['#about', 'О студии'], ['#contact', 'Контакты']].map(([h, t]) => <a key={h} href={h} className="hover:text-white">{t}</a>)}</nav>
            <div className="flex items-center gap-2">
              <button type="button" onClick={openPalette} className="hidden h-8 items-center gap-2 rounded-lg border border-white/10 bg-white/[.03] pl-3 pr-1.5 text-[13px] text-white/55 hover:border-white/25 sm:inline-flex"><Search size={14} />Найти услугу<Kbd>⌘K</Kbd></button>
              <a href="#book" className="inline-flex h-8 items-center rounded-lg bg-white px-3.5 text-[13px] font-medium text-[#0b0c0e]">Записаться</a>
            </div>
          </div>
        </header>
        <main>
          <Film lite={lite} />
          <Palette bk={bk} inputRef={inputRef} />
          <Features />
          <Book bk={bk} />
          <Contact />
        </main>
        <footer className="px-5 py-8 text-[13px] text-white/40 md:px-6">
          <div className="mx-auto flex max-w-[1180px] flex-wrap justify-between gap-4 border-t border-white/[.06] pt-8"><span>© 2026 {b.name} · Концепт сайта — Артём</span><span>{b.addr}, {b.city}</span></div>
        </footer>
        <CallBar phone={b.phone} barCls="bg-[#08090a]/90 backdrop-blur border-t border-white/10" callCls="rounded-lg border border-white/15 text-white" bookCls="rounded-lg bg-white text-[#0b0c0e]" />
        <div className="h-[72px] sm:hidden" />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
