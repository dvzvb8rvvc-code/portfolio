import React, { useRef, useState, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, AnimatePresence, MotionConfig } from 'framer-motion'
import { ArrowRight, Phone, MapPin, Droplet, Armchair, Sparkles, ShieldCheck, Disc3, Star, Waves } from 'lucide-react'
import '../lib/base.css'
import { B } from '../data'
import { useSmooth, Ribbon, SplitText, Reveal, Magnetic, Cursor, Counter, useBooking, phoneFocus, CheckDraw, MapFrame, messengerLinks, CallBar, Progress, tel } from '../lib/kit'

const Water = lazy(() => import('./aquacity3d'))
const b = B.aquacity
const A = '#0aa5d8'
const SV = [['Мойка кузова', 'Деликатная бесконтактная мойка с безопасной химией.', Droplet], ['Химчистка салона', 'Глубокая чистка сидений, потолка и ковров.', Armchair], ['Полировка', 'Блеск и глубина цвета без паутинки.', Sparkles], ['Керамика', 'Защитное покрытие — вода просто скатывается.', ShieldCheck], ['Чистка дисков', 'Удаляем тормозную пыль и въевшийся налёт.', Disc3], ['Комплексный уход', 'Снаружи и внутри — за один визит.', Star]]

function Bubbles() {
  const mk = () => ({ id: Math.random(), x: 4 + Math.random() * 92, s: 18 + Math.random() * 46, d: 9 + Math.random() * 10, dl: -Math.random() * 18 })
  const [bs, setBs] = useState(() => Array.from({ length: 14 }, mk))
  const [pops, setPops] = useState([])
  const pop = (e, id) => {
    const r = e.currentTarget.getBoundingClientRect(), host = e.currentTarget.parentElement.getBoundingClientRect()
    const pid = Math.random(); setPops(v => [...v, { id: pid, x: r.left - host.left + r.width / 2, y: r.top - host.top + r.height / 2, s: r.width }])
    setTimeout(() => setPops(v => v.filter(q => q.id !== pid)), 700)
    setBs(v => v.map(q => q.id === id ? { ...mk(), dl: 0 } : q))
  }
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <style>{'@keyframes rise{from{transform:translateY(0) translateX(0)}50%{transform:translateY(-60vh) translateX(18px)}to{transform:translateY(-125vh) translateX(-10px)}}@media (prefers-reduced-motion:reduce){.bub{animation:none!important;display:none}}'}</style>
      {bs.map(q => (
        <button key={q.id} aria-label="Лопнуть пузырь" onClick={e => pop(e, q.id)} data-cursor="Пуф"
          className="bub pointer-events-auto absolute rounded-full bg-[radial-gradient(circle_at_30%_30%,#fff,rgba(255,255,255,.25)_40%,rgba(95,212,245,.2))] shadow-[inset_0_0_0_1px_rgba(255,255,255,.7)] transition-[scale] hover:scale-125"
          style={{ left: q.x + '%', top: '102%', width: q.s, height: q.s, animation: `rise ${q.d}s linear ${q.dl}s infinite` }} />
      ))}
      {pops.map(q => (
        <motion.span key={q.id} initial={{ scale: .6, opacity: 1 }} animate={{ scale: 2.2, opacity: 0 }} transition={{ duration: .6, ease: [0.2, 0, 0, 1] }}
          className="absolute rounded-full border-2 border-white" style={{ left: q.x - q.s / 2, top: q.y - q.s / 2, width: q.s, height: q.s }} />
      ))}
    </div>
  )
}

function Wave({ className = '', fill = '#eaf8fd', speed = 14 }) {
  return (
    <div className={'relative h-[90px] overflow-hidden ' + className} aria-hidden="true">
      <motion.svg animate={{ x: ['0%', '-50%'] }} transition={{ repeat: Infinity, duration: speed, ease: 'linear' }} viewBox="0 0 2880 90" preserveAspectRatio="none" className="absolute bottom-0 h-full w-[200%]">
        <path d="M0 40 C 240 0, 480 80, 720 40 S 1200 0, 1440 40 S 1920 80, 2160 40 S 2640 0, 2880 40 V90 H0Z" fill={fill} />
      </motion.svg>
    </div>
  )
}

function FillCard({ t, d, Ic, i }) {
  return (
    <motion.a href="#book" data-svc={t} data-cursor="Запись" whileHover="h" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 3) * .08, duration: .7 }}
      className="group relative flex min-h-[270px] flex-col justify-between overflow-hidden rounded-[32px] bg-white/60 p-8 shadow-[inset_0_1px_0_rgba(255,255,255,.9),0_0_0_1px_rgba(255,255,255,.7),0_20px_50px_rgba(6,50,74,.08)] backdrop-blur-xl">
      <motion.div variants={{ h: { y: '0%' } }} initial={{ y: '102%' }} transition={{ type: 'spring', stiffness: 80, damping: 16 }} className="absolute inset-0 bg-gradient-to-b from-[#5fd4f5] to-[#0aa5d8]">
        <motion.svg animate={{ x: ['0%', '-50%'] }} transition={{ repeat: Infinity, duration: 3, ease: 'linear' }} viewBox="0 0 800 40" preserveAspectRatio="none" className="absolute -top-[18px] h-5 w-[200%]"><path d="M0 20 C 100 0, 200 40, 300 20 S 500 0, 600 20 S 700 40, 800 20 V40 H0Z" fill="#5fd4f5" /></motion.svg>
      </motion.div>
      <span className="relative grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-[#5fd4f5] to-[#0aa5d8] text-white shadow-[0_10px_24px_rgba(10,165,216,.3)] transition-colors group-hover:from-white group-hover:to-white group-hover:text-[#0aa5d8]"><Ic size={26} /></span>
      <div className="relative transition-colors duration-300 group-hover:text-white">
        <h3 className="mb-2 font-['Comfortaa',sans-serif] text-[23px] font-bold tracking-[-.03em]">{t}</h3>
        <p className="mb-3 text-[15px] text-[#4f7a90] transition-colors group-hover:text-white/90">{d}</p>
        <span className="inline-flex items-center gap-1.5 text-[14.5px] font-bold text-[#0aa5d8] transition-colors group-hover:text-white">Записаться <ArrowRight size={16} /></span>
      </div>
    </motion.a>
  )
}

function App() {
  useSmooth()
  const bk = useBooking()
  const hero = useRef(null)
  const { scrollYProgress } = useScroll({ target: hero, offset: ['start start', 'end start'] })
  const ty = useTransform(scrollYProgress, [0, 1], [0, 200])
  const to = useTransform(scrollYProgress, [0, .8], [1, 0])
  const f = 'h-14 w-full rounded-2xl border border-[#06324a]/12 bg-white/85 px-5 text-[16px] outline-none transition-[border-color,box-shadow] focus:border-[#0aa5d8] focus:shadow-[0_0_0_4px_rgba(10,165,216,.16)]'
  return (
    <MotionConfig reducedMotion="user">
      <div className="bg-[#eaf8fd] font-['Manrope',sans-serif] text-[#06324a]" style={{ '--sel': A, '--selc': '#fff' }}>
        <Progress color={`linear-gradient(90deg,#5fd4f5,${A})`} />
        <Cursor color="#fff" blend="normal" textColor={A} />
        <Ribbon name={b.name} bg="#06324a" fg="#fff" />
        <header className="sticky top-3 z-40 mx-auto mt-3 max-w-[1180px] px-5">
          <div className="flex h-16 items-center justify-between rounded-[22px] bg-white/60 pl-5 pr-2 shadow-[inset_0_1px_0_rgba(255,255,255,.9),0_0_0_1px_rgba(255,255,255,.6),0_16px_40px_rgba(6,50,74,.1)] backdrop-blur-xl">
            <a href="#top" className="flex items-center gap-2.5 font-['Comfortaa',sans-serif] text-[22px] font-bold tracking-[-.03em]"><span className="grid h-8 w-8 place-items-center rounded-[11px] bg-gradient-to-br from-[#5fd4f5] to-[#0aa5d8] text-white"><Waves size={18} /></span>Aquacity</a>
            <nav className="hidden gap-7 text-[14.5px] font-semibold text-[#4f7a90] md:flex">{[['#services', 'Услуги'], ['#book', 'Запись'], ['#contacts', 'Контакты']].map(([h, t]) => <a key={h} href={h} className="hover:text-[#0aa5d8]">{t}</a>)}</nav>
            <a href="#book" className="hidden h-12 items-center rounded-full bg-gradient-to-br from-[#5fd4f5] to-[#0aa5d8] px-6 text-[14px] font-bold text-white sm:inline-flex">Записаться</a>
          </div>
        </header>
        <main id="top">
          <section ref={hero} className="relative -mt-[76px] h-[100svh] min-h-[640px] overflow-hidden" data-cursor="Рябь">
            <div className="absolute inset-0"><Suspense fallback={<div className="h-full bg-gradient-to-b from-[#0a7fb0] to-[#5fd4f5]" />}><Water /></Suspense></div>
            <Bubbles />
            <motion.div style={{ y: ty, opacity: to }} className="pointer-events-none relative z-10 flex h-full flex-col items-center justify-center px-6 pt-20 text-center text-white">
              <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-7 rounded-full bg-white/20 px-5 py-2 text-[14px] font-bold backdrop-blur-md">Детейлинг и автомойка · {b.addr}</motion.span>
              <h1 className="max-w-[1000px] font-['Comfortaa',sans-serif] text-[clamp(48px,8vw,124px)] font-bold leading-[1] tracking-[-.05em] [text-shadow:0_10px_40px_rgba(2,60,90,.35)]">
                <SplitText text="Свежесть," mode="words" className="block" />
                <SplitText text="которую видно" mode="words" delay={.2} className="block" />
              </h1>
              <Reveal delay={.5}><p className="mx-auto mb-9 mt-6 max-w-[540px] text-[18px] text-white/90">Мойка, химчистка и детейлинг. Проведите курсором по воде — и лопните пару пузырей, пока ждёте.</p></Reveal>
              <Reveal delay={.6} className="pointer-events-auto flex flex-wrap justify-center gap-3">
                <Magnetic><a href="#book" className="inline-flex h-14 items-center gap-2 rounded-full bg-white px-8 font-bold text-[#0aa5d8] shadow-[0_14px_40px_rgba(2,60,90,.3)] transition-[scale] active:scale-[.96]">Записаться <ArrowRight size={18} /></a></Magnetic>
                <a href={'tel:' + tel(b.phones[0])} className="inline-flex h-14 items-center gap-2 rounded-full bg-white/20 px-7 font-bold text-white backdrop-blur-md"><Phone size={16} />{b.phones[0]}</a>
              </Reveal>
            </motion.div>
            <div className="absolute inset-x-0 bottom-0 z-10"><Wave fill="#eaf8fd" speed={16} /></div>
          </section>
          <section id="services" className="mx-auto max-w-[1180px] px-5 py-24">
            <div className="mb-12 text-center"><h2 className="font-['Comfortaa',sans-serif] text-[clamp(36px,4.6vw,64px)] font-bold tracking-[-.04em]"><SplitText text="Уход, который" mode="words" /> <SplitText text="чувствуется" mode="words" delay={.15} className="text-[#0aa5d8]" /></h2><p className="mt-3 text-[#4f7a90]">Наведите на карточку — она наполнится водой. Нажмите, чтобы записаться.</p></div>
            <div className="grid gap-5 md:grid-cols-3">{SV.map(([t, d, Ic], i) => <FillCard key={t} t={t} d={d} Ic={Ic} i={i} />)}</div>
          </section>
          <section className="relative bg-gradient-to-b from-[#0a7fb0] to-[#0aa5d8] text-white">
            <Wave className="rotate-180" fill="#eaf8fd" speed={20} />
            <div className="mx-auto grid max-w-[1180px] gap-5 px-5 py-16 md:grid-cols-3">
              {[[b.rev, 'оценок на Яндекс.Картах'], [6, 'видов ухода за авто'], [60, 'секунд на онлайн-запись']].map(([n, t], i) => (
                <Reveal key={t} delay={i * .08} className="rounded-[32px] bg-white/15 p-9 text-center backdrop-blur-md"><Counter to={n} className="block font-['Comfortaa',sans-serif] text-[68px] font-bold leading-none tracking-[-.05em]" /><span className="text-white/85">{t}</span></Reveal>))}
            </div>
            <Wave fill="#eaf8fd" speed={18} />
          </section>
          <section id="book" className="mx-auto max-w-[1180px] px-5 py-24">
            <div className="grid items-center gap-12 rounded-[40px] bg-white/60 p-8 shadow-[inset_0_1px_0_rgba(255,255,255,.9),0_0_0_1px_rgba(255,255,255,.6),0_24px_60px_rgba(6,50,74,.1)] backdrop-blur-xl md:grid-cols-2 md:p-14">
              <div><h2 className="font-['Comfortaa',sans-serif] text-[clamp(36px,4.4vw,58px)] font-bold leading-[1.05] tracking-[-.04em]">Приезжайте <span className="text-[#0aa5d8]">освежиться</span></h2><p className="mb-7 mt-5 text-[#4f7a90]">Оставьте заявку — перезвоним и подберём удобное время.</p>{b.phones.map(p => <a key={p} href={'tel:' + tel(p)} className="font-['Comfortaa',sans-serif] text-[28px] font-bold tracking-[-.03em]">{p}</a>)}</div>
              <AnimatePresence mode="wait">{!bk.s.sent ? (
                <motion.form key="f" exit={{ opacity: 0, y: -10 }} onSubmit={bk.submit} noValidate className="grid gap-4">
                  <input className={f} value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} placeholder="Имя" autoComplete="name" />
                  <motion.input animate={bk.s.err ? { x: [0, -8, 8, -6, 6, 0] } : {}} className={f + (bk.s.err ? ' !border-red-500' : '')} value={bk.s.phone} onFocus={phoneFocus(bk)} onChange={e => bk.upd('phone', e.target.value)} type="tel" inputMode="tel" placeholder="Телефон *" autoComplete="tel" />
                  <select className={f} value={bk.s.svc} onChange={e => bk.upd('svc', e.target.value)}><option value="">Услуга</option>{SV.map(([t]) => <option key={t}>{t}</option>)}</select>
                  <button disabled={bk.s.loading} className="h-14 rounded-full bg-gradient-to-br from-[#5fd4f5] to-[#0aa5d8] font-bold text-white shadow-[0_12px_30px_rgba(10,165,216,.3)] transition-[scale,opacity] active:scale-[.96] disabled:opacity-60">{bk.s.loading ? 'Отправляем…' : 'Записаться'}</button>
                  <p className="text-[13px] text-[#4f7a90]">В готовом сайте заявка придёт вам в Telegram.</p>
                </motion.form>) : (
                <motion.div key="ok" initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }} className="py-10 text-center text-[#0aa5d8]"><CheckDraw className="mx-auto mb-4" /><h3 className="font-['Comfortaa',sans-serif] text-[30px] font-bold text-[#06324a]">До встречи!</h3><p className="text-[#4f7a90]">Так клиент увидит подтверждение.</p></motion.div>)}
              </AnimatePresence>
            </div>
          </section>
          <section id="contacts" className="mx-auto grid max-w-[1180px] gap-5 px-5 pb-24 md:grid-cols-[1fr_1.3fr]">
            <Reveal className="grid content-start gap-6 rounded-[32px] bg-white/60 p-9 shadow-[0_20px_50px_rgba(6,50,74,.08)] backdrop-blur-xl">
              <h2 className="font-['Comfortaa',sans-serif] text-[44px] font-bold tracking-[-.04em]">Как <span className="text-[#0aa5d8]">найти</span></h2>
              <div><p className="mb-1 flex items-center gap-2 text-[12.5px] font-bold uppercase tracking-[.1em] text-[#0aa5d8]"><MapPin size={14} />Адрес</p><p className="font-['Comfortaa',sans-serif] text-[21px] font-bold">{b.addr}</p></div>
              <div><p className="mb-1 text-[12.5px] font-bold uppercase tracking-[.1em] text-[#0aa5d8]">Телефон</p>{b.phones.map(p => <a key={p} href={'tel:' + tel(p)} className="font-['Comfortaa',sans-serif] text-[21px] font-bold">{p}</a>)}</div>
              <div className="flex flex-wrap gap-2">{messengerLinks(b).map(m => <a key={m.k} href={m.href} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-[14px] font-bold transition-colors hover:bg-[#0aa5d8] hover:text-white">{m.Icon && <m.Icon width={16} height={16} />}{m.label}</a>)}</div>
            </Reveal>
            <Reveal delay={.08} className="min-h-[400px] overflow-hidden rounded-[32px] shadow-[0_20px_50px_rgba(6,50,74,.08)]"><MapFrame oid={b.oid} /></Reveal>
          </section>
        </main>
        <footer className="pb-14 text-center text-[14px] text-[#4f7a90]">© 2026 Aquacity · демо-концепт сайта · автор — Артём</footer>
        <CallBar phone={b.phones[0]} barCls="bg-[#eaf8fd]/90 backdrop-blur-xl border-t border-black/5" callCls="rounded-full bg-white" bookCls="rounded-full bg-gradient-to-br from-[#5fd4f5] to-[#0aa5d8] text-white" />
        <div className="h-[72px] sm:hidden" />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
