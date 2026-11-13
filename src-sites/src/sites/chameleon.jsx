import React, { useRef, useState, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, useMotionValue, useMotionTemplate, AnimatePresence, MotionConfig } from 'framer-motion'
import { ArrowRight, Phone, MapPin, Layers, Shield, Sparkles, Armchair, Cog, Car, Rotate3d } from 'lucide-react'
import '../lib/base.css'
import { B } from '../data'
import { LineReveal, useSmooth, Ribbon, SplitText, Reveal, Magnetic, Cursor, Marquee, Counter, useBooking, phoneFocus, CheckDraw, MapFrame, messengerLinks, CallBar, Progress, tel } from '../lib/kit'

const Studio = lazy(() => import('./chameleon3d'))
const b = B.chameleon
const IR = 'linear-gradient(110deg,#7cff6b,#22d3ee 35%,#a855f7 70%,#ff4fd8)'
const COLORS = [['Изумруд', '#18c37e'], ['Лава', '#ff4d2e'], ['Ультрамарин', '#2f5bff'], ['Лаванда', '#a78bfa'], ['Графит', '#3b3f47'], ['Шампань', '#d8bf8a'], ['Хамелеон', 'cham']]
const SV = [['Оклейка плёнкой', 'Цветные, матовые, сатиновые и хромированные плёнки.', Layers], ['Антигравийная защита', 'Полиуретан на зоны риска или весь кузов.', Shield], ['Полировка и керамика', 'Глубокий блеск и защита лакокрасочного покрытия.', Sparkles], ['Автоателье', 'Перетяжка салона, руля и деталей.', Armchair], ['Тюнинг', 'Индивидуальные решения под ваш автомобиль.', Cog], ['Химчистка', 'Глубокая чистка салона с разбором.', Car]]

function Spot({ children, className = '', ...p }) {
  const mx = useMotionValue(-300), my = useMotionValue(-300)
  const bg = useMotionTemplate`radial-gradient(380px circle at ${mx}px ${my}px, rgba(168,85,247,.22), transparent 65%)`
  const border = useMotionTemplate`radial-gradient(260px circle at ${mx}px ${my}px, rgba(124,255,107,.9), rgba(34,211,238,.6) 35%, transparent 70%)`
  return (
    <motion.a {...p} onPointerMove={e => { const r = e.currentTarget.getBoundingClientRect(); mx.set(e.clientX - r.left); my.set(e.clientY - r.top) }} onPointerLeave={() => { mx.set(-300); my.set(-300) }}
      className={'group relative isolate overflow-hidden rounded-[28px] bg-[#0f0f16] ' + className}>
      <motion.span aria-hidden="true" className="absolute inset-0 -z-10 rounded-[28px] p-px [mask:linear-gradient(#000_0_0)_content-box,linear-gradient(#000_0_0)] [mask-composite:exclude]" style={{ background: border }} />
      <motion.span aria-hidden="true" className="absolute inset-0 -z-10" style={{ background: bg }} />
      <span aria-hidden="true" className="absolute inset-0 -z-20 rounded-[28px] ring-1 ring-white/[.07]" />
      {children}
    </motion.a>
  )
}

function App() {
  useSmooth()
  const bk = useBooking()
  const [col, setCol] = useState(0)
  const { scrollYProgress } = useScroll()
  const hue = useTransform(scrollYProgress, [0, 1], [0, 300])
  const filt = useMotionTemplate`hue-rotate(${hue}deg)`
  const cur = COLORS[col]
  const glow = cur[1] === 'cham' ? '#a855f7' : cur[1]
  const f = 'h-14 w-full rounded-2xl border border-white/10 bg-[#060609] px-5 text-[16px] outline-none transition-[border-color,box-shadow] focus:border-[#a855f7] focus:shadow-[0_0_0_4px_rgba(168,85,247,.18)]'
  return (
    <MotionConfig reducedMotion="user">
      <div className="bg-[#060609] font-['Manrope',sans-serif] text-[#f4f4f8]" style={{ '--sel': '#a855f7', '--selc': '#fff' }}>
        <Progress color={IR} />
        <Cursor color="#fff" textColor="#060609" />
        <Ribbon name={b.name} bg={IR} fg="#0a0a10" />
        <header className="sticky top-0 z-40 border-b border-white/10 bg-[#060609]/70 backdrop-blur-xl">
          <div className="mx-auto flex h-[70px] max-w-[1280px] items-center justify-between px-6">
            <a href="#top" className="flex items-center gap-2.5 font-['Unbounded',sans-serif] text-[19px] font-extrabold tracking-[-.04em]"><span className="h-8 w-8 rounded-[11px]" style={{ background: IR }} />Хамелеон</a>
            <nav className="hidden gap-7 text-[14px] font-semibold text-[#8d8da0] md:flex">{[['#studio', 'Подбор цвета'], ['#services', 'Услуги'], ['#book', 'Запись']].map(([h, t]) => <a key={h} href={h} className="hover:text-white">{t}</a>)}</nav>
            <a href="#book" className="hidden h-11 items-center rounded-full px-5 text-[14px] font-extrabold text-[#0a0a10] sm:inline-flex" style={{ background: IR }}>Записаться</a>
          </div>
        </header>
        <main id="top">
          <section className="relative overflow-hidden px-6 pb-10 pt-20 text-center">
            <motion.div animate={{ background: `radial-gradient(circle, ${glow}55, transparent 60%)` }} transition={{ duration: .8 }} className="pointer-events-none absolute left-1/2 top-1/2 -z-0 h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/3 rounded-full" />
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative mb-7 inline-flex rounded-full px-4 py-2 text-[13px] text-[#8d8da0] ring-1 ring-white/10">Детейлинг · тюнинг · автоателье — {b.addr}</motion.p>
            <h1 className="relative font-['Unbounded',sans-serif] text-[clamp(46px,8.6vw,140px)] font-black leading-[.9] tracking-[-.06em]">
              <SplitText text="Смените цвет." className="block" stagger={.03} />
              <motion.span style={{ filter: filt }} className="block"><LineReveal delay={.45} className="bg-[linear-gradient(110deg,#7cff6b,#22d3ee_35%,#a855f7_70%,#ff4fd8)] bg-clip-text text-transparent">Не машину.</LineReveal></motion.span>
            </h1>
            <Reveal delay={.6}><p className="relative mx-auto mb-9 mt-7 max-w-[580px] text-[18px] text-[#8d8da0]">Оклейка плёнкой, антигравий, детейлинг и автоателье в центре Минска. Покрутите машину ниже и выберите её новый цвет.</p></Reveal>
            <Reveal delay={.7} className="relative flex flex-wrap justify-center gap-3">
              <Magnetic><a href="#book" className="inline-flex h-14 items-center gap-2 rounded-full px-8 font-extrabold text-[#0a0a10] transition-[scale] active:scale-[.96]" style={{ background: IR }}>Записаться на оклейку <ArrowRight size={18} /></a></Magnetic>
              <a href={'tel:' + tel(b.phones[0])} className="inline-flex h-14 items-center gap-2 rounded-full px-7 font-bold ring-1 ring-white/15"><Phone size={16} />{b.phones[0]}</a>
            </Reveal>
          </section>
          <section id="studio" className="relative mx-auto max-w-[1180px] px-4 pb-24">
            <div className="relative overflow-hidden rounded-[40px] bg-gradient-to-b from-[#16161f] to-[#0c0c12] ring-1 ring-white/[.08]">
              <div className="h-[min(62vh,560px)] min-h-[360px] cursor-grab active:cursor-grabbing" data-cursor="Крути"><Suspense fallback={<div className="grid h-full place-items-center text-[#8d8da0]">Загружаем 3D…</div>}><Studio color={cur[1]} /></Suspense></div>
              <div className="absolute left-6 top-6 inline-flex items-center gap-2 rounded-full bg-black/40 px-4 py-2 text-[13px] text-[#c9c9d6] backdrop-blur"><Rotate3d size={16} />Тяните, чтобы повернуть</div>
              <div className="border-t border-white/[.07] px-6 py-6">
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {COLORS.map(([n, c], i) => (
                    <motion.button key={n} whileHover={{ y: -4 }} whileTap={{ scale: .9 }} onClick={() => setCol(i)} aria-label={n} aria-pressed={col === i}
                      className="relative h-12 w-12 rounded-full ring-2 ring-white/15" style={{ background: c === 'cham' ? IR : c }}>
                      {col === i && <motion.span layoutId="sw" className="absolute -inset-[6px] rounded-full ring-2 ring-white" transition={{ type: 'spring', bounce: .2, duration: .5 }} />}
                    </motion.button>))}
                </div>
                <AnimatePresence mode="wait"><motion.p key={cur[0]} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mt-4 text-center font-['Unbounded',sans-serif] text-[15px] font-bold text-[#8d8da0]">Плёнка: <span className="text-white">{cur[0]}</span></motion.p></AnimatePresence>
              </div>
            </div>
          </section>
          <Marquee base={-3} className="border-y border-white/10 py-6"><motion.div style={{ filter: filt }} className="inline-flex">{['Оклейка', 'Антигравий', 'Керамика', 'Тюнинг', 'Автоателье'].map(t => <span key={t} className="mx-6 inline-flex items-center gap-12 bg-[linear-gradient(110deg,#7cff6b,#22d3ee_35%,#a855f7_70%,#ff4fd8)] bg-clip-text font-['Unbounded',sans-serif] text-[clamp(30px,4.4vw,62px)] font-black tracking-[-.05em] text-transparent">{t}<span className="h-4 w-4 rounded-full bg-white" /></span>)}</motion.div></Marquee>
          <section id="services" className="mx-auto max-w-[1280px] px-6 py-28">
            <div className="mb-12 flex flex-wrap items-end justify-between gap-6"><h2 className="font-['Unbounded',sans-serif] text-[clamp(38px,5vw,78px)] font-black leading-[.95] tracking-[-.06em]">Всё для <motion.span style={{ filter: filt }} className="inline-block bg-[linear-gradient(110deg,#7cff6b,#22d3ee_35%,#a855f7_70%,#ff4fd8)] bg-clip-text text-transparent">вашего авто</motion.span></h2><p className="max-w-[360px] text-[#8d8da0]">Проведите курсором по карточкам. Нажмите, чтобы записаться.</p></div>
            <div className="grid gap-4 md:grid-cols-3">{SV.map(([t, d, Ic], i) => (
              <Spot key={t} href="#book" data-svc={t} data-cursor="Запись" className="flex min-h-[240px] flex-col justify-between p-8">
                <div className="flex justify-between"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/[.06]"><Ic size={22} /></span><span className="font-['Unbounded',sans-serif] text-[13px] text-[#8d8da0]">0{i + 1}</span></div>
                <div><h3 className="mb-2 font-['Unbounded',sans-serif] text-[22px] font-extrabold leading-tight tracking-[-.04em]">{t}</h3><p className="text-[15px] text-[#8d8da0]">{d}</p></div>
              </Spot>))}</div>
          </section>
          <section className="mx-auto grid max-w-[1280px] gap-4 px-6 md:grid-cols-3">
            {[[b.rev, 'оценок на Яндекс.Картах'], [7, 'цветов уже в конфигураторе'], [60, 'секунд на онлайн-запись']].map(([n, t], i) => (
              <Reveal key={t} delay={i * .08} className="rounded-[28px] bg-[#0f0f16] p-9 ring-1 ring-white/[.07]"><motion.span style={{ filter: filt }} className="block"><Counter to={n} className="block bg-[linear-gradient(110deg,#7cff6b,#22d3ee_35%,#a855f7_70%,#ff4fd8)] bg-clip-text font-['Unbounded',sans-serif] text-[70px] font-black leading-none tracking-[-.06em] text-transparent" /></motion.span><span className="text-[#8d8da0]">{t}</span></Reveal>))}
          </section>
          <section id="book" className="px-6 py-28">
            <div className="relative isolate mx-auto grid max-w-[1280px] gap-12 overflow-hidden rounded-[36px] bg-[#0f0f16] p-8 ring-1 ring-white/[.07] md:grid-cols-2 md:p-16">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 24, ease: 'linear' }} className="absolute -right-48 -top-48 -z-10 h-[520px] w-[520px] rounded-full opacity-25 blur-[90px]" style={{ background: IR }} />
              <div><h2 className="font-['Unbounded',sans-serif] text-[clamp(36px,4.4vw,62px)] font-black leading-[.95] tracking-[-.05em]">Запишитесь <span className="bg-[linear-gradient(110deg,#7cff6b,#22d3ee_35%,#a855f7_70%,#ff4fd8)] bg-clip-text text-transparent">на подбор</span></h2>
                <p className="mb-8 mt-5 max-w-[380px] text-[#8d8da0]">Перезвоним, обсудим идею и покажем образцы плёнки вживую. Выбранный цвет: <b className="text-white">{cur[0]}</b>.</p>
                {b.phones.map(p => <a key={p} href={'tel:' + tel(p)} className="font-['Unbounded',sans-serif] text-[24px] font-extrabold tracking-[-.04em]">{p}</a>)}</div>
              <AnimatePresence mode="wait">{!bk.s.sent ? (
                <motion.form key="f" exit={{ opacity: 0, y: -10 }} onSubmit={bk.submit} noValidate className="grid gap-4">
                  <input className={f} value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} placeholder="Имя" autoComplete="name" />
                  <motion.input animate={bk.s.err ? { x: [0, -8, 8, -6, 6, 0] } : {}} className={f + (bk.s.err ? ' !border-red-400' : '')} value={bk.s.phone} onFocus={phoneFocus(bk)} onChange={e => bk.upd('phone', e.target.value)} type="tel" inputMode="tel" placeholder="Телефон *" autoComplete="tel" />
                  <select className={f} value={bk.s.svc} onChange={e => bk.upd('svc', e.target.value)}><option value="">Услуга</option>{SV.map(([t]) => <option key={t}>{t}</option>)}</select>
                  <button disabled={bk.s.loading} className="h-14 rounded-full font-extrabold text-[#0a0a10] transition-[scale,opacity] active:scale-[.96] disabled:opacity-60" style={{ background: IR }}>{bk.s.loading ? 'Отправляем…' : 'Записаться'}</button>
                  <p className="text-[13px] text-[#8d8da0]">В готовом сайте заявка с выбранным цветом придёт вам в Telegram.</p>
                </motion.form>) : (
                <motion.div key="ok" initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }} className="py-10 text-center text-[#7cff6b]"><CheckDraw className="mx-auto mb-4" /><h3 className="font-['Unbounded',sans-serif] text-[28px] font-extrabold text-white">Ждём вас!</h3><p className="text-[#8d8da0]">Цвет «{cur[0]}» — отличный выбор.</p></motion.div>)}
              </AnimatePresence>
            </div>
          </section>
          <section id="contacts" className="mx-auto grid max-w-[1280px] gap-4 px-6 pb-28 md:grid-cols-[1fr_1.3fr]">
            <Reveal className="grid content-start gap-6 rounded-[28px] bg-[#0f0f16] p-9 ring-1 ring-white/[.07]">
              <h2 className="font-['Unbounded',sans-serif] text-[46px] font-black tracking-[-.05em]">Где <span className="bg-[linear-gradient(110deg,#7cff6b,#22d3ee_35%,#a855f7_70%,#ff4fd8)] bg-clip-text text-transparent">мы</span></h2>
              <div><p className="mb-1 flex items-center gap-2 text-[12px] uppercase tracking-[.14em] text-[#8d8da0]"><MapPin size={14} />Адрес</p><p className="font-['Unbounded',sans-serif] text-[20px] font-extrabold tracking-[-.03em]">{b.addr}</p></div>
              <div><p className="mb-1 text-[12px] uppercase tracking-[.14em] text-[#8d8da0]">Телефон</p>{b.phones.map(p => <a key={p} href={'tel:' + tel(p)} className="font-['Unbounded',sans-serif] text-[20px] font-extrabold">{p}</a>)}</div>
              <div className="flex flex-wrap gap-2">{messengerLinks(b).map(m => <a key={m.k} href={m.href} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[14px] font-bold ring-1 ring-white/15 transition-colors hover:bg-white hover:text-[#0a0a10]">{m.Icon && <m.Icon width={16} height={16} />}{m.label}</a>)}</div>
            </Reveal>
            <Reveal delay={.08} className="min-h-[400px] overflow-hidden rounded-[28px] ring-1 ring-white/[.07]"><MapFrame oid={b.oid} dark /></Reveal>
          </section>
        </main>
        <footer className="border-t border-white/10 px-6 py-8 text-[13px] text-[#8d8da0]"><div className="mx-auto flex max-w-[1280px] flex-wrap justify-between gap-4"><span>© 2026 Хамелеон</span><span>Демо-концепт · сайт — Артём</span></div></footer>
        <CallBar phone={b.phones[0]} barCls="bg-[#060609]/92 backdrop-blur-xl border-t border-white/10" callCls="rounded-full ring-1 ring-white/20" bookCls="rounded-full text-[#0a0a10] bg-[linear-gradient(110deg,#7cff6b,#22d3ee,#a855f7)]" />
        <div className="h-[72px] sm:hidden" />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
