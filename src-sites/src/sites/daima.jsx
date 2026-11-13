import React, { useRef, useState, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, AnimatePresence, MotionConfig, useInView } from 'framer-motion'
import { ArrowRight, Phone, MapPin, CloudRain, Clock } from 'lucide-react'
import '../lib/base.css'
import { B } from '../data'
import { useSmooth, Ribbon, SplitText, Reveal, Magnetic, Cursor, Marquee, Counter, useBooking, phoneFocus, CheckDraw, MapFrame, CallBar, Progress, Intro, tel, useLite, Grain } from '../lib/kit'

const Rain = lazy(() => import('./daima3d'))
const b = B.daima
const PK = '#ff2e88', CY = '#22e4ff', AM = '#ffb02e'
const H = "font-['Syne',sans-serif]"
const glow = c => ({ color: c, textShadow: `0 0 8px ${c}, 0 0 24px ${c}, 0 0 60px ${c}` })
const SV = [
  ['Мойка кузова', 'Пена, ручная мойка, сушка', PK],
  ['Комплекс', 'Кузов + салон + стёкла', CY],
  ['Пылесос салона', 'Сиденья, коврики, багажник', AM],
  ['Мойка дисков', 'Тормозная пыль и битум', CY],
  ['Чернение резины', 'Шины как новые', PK],
  ['Воск', 'Блеск и защита от дождя', AM],
]
const DAYS = ['Сегодня', 'Завтра', 'Послезавтра']
const SLOTS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00']
const busy = (d, i) => ((d * 7 + i * 5) % 4) === 0

function Hero({ lite }) {
  const wipe = useRef(false)
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '35%'])
  return (
    <section ref={ref} className="relative h-[100svh] min-h-[640px] overflow-hidden bg-[#05060c]">
      {!lite ? <Suspense fallback={null}><Rain wipe={wipe} /></Suspense> : <div className="absolute inset-0 bg-[radial-gradient(40%_30%_at_30%_40%,rgba(255,46,136,.35),transparent),radial-gradient(40%_30%_at_70%_60%,rgba(34,228,255,.3),transparent)]" />}
      <motion.div style={{ y }} className="pointer-events-none relative z-10 mx-auto flex h-full max-w-[1320px] flex-col justify-center px-6 md:px-10">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="mb-6 flex items-center gap-3 text-[12px] uppercase tracking-[.35em] text-white/60"><CloudRain size={16} />Автомойка · Ботаническая, 9А</motion.p>
        <h1 className={`${H} text-[clamp(50px,14vw,250px)] font-extrabold uppercase leading-[.85] tracking-[-.03em] text-white`}>
          <SplitText text="Дождь" delay={1.3} className="block" />
          <span className="block"><motion.span initial={{ opacity: 0 }} animate={{ opacity: [0, 1, .3, 1, .6, 1] }} transition={{ delay: 1.9, duration: 1.2 }} style={glow(PK)}>не помеха</motion.span></span>
        </h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2 }} className="mt-6 max-w-[460px] text-[17px] text-white/70">Включите дворники — и посмотрите, какой чистой станет ваша машина после мойки «Даима».</motion.p>
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.4 }} className="pointer-events-auto mt-10 flex flex-wrap gap-3">
          {!lite && <button onClick={() => { wipe.current = true }} data-cursor="Вжух" className="inline-flex h-14 items-center gap-3 rounded-full border-2 px-7 text-[14px] font-bold uppercase tracking-[.14em] transition-[scale] active:scale-[.95]" style={{ borderColor: CY, ...glow(CY), textShadow: `0 0 10px ${CY}` }}>Включить дворники</button>}
          <Magnetic><a href="#book" className="inline-flex h-14 items-center gap-3 rounded-full px-8 text-[14px] font-bold uppercase tracking-[.14em] text-white" style={{ background: PK, boxShadow: `0 0 40px ${PK}` }}>Записаться <ArrowRight size={18} /></a></Magnetic>
        </motion.div>
      </motion.div>
      <p className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 text-[11px] uppercase tracking-[.3em] text-white/40 md:block">курсор тоже протирает стекло</p>
    </section>
  )
}

function Neon({ t, d, c, k }) {
  const ref = useRef(null)
  const on = useInView(ref, { once: true, margin: '-20% 0px' })
  return (
    <motion.a ref={ref} href="#book" data-svc={t} data-cursor="Запись" whileHover={{ y: -6 }}
      className="group relative flex min-h-[220px] flex-col justify-between overflow-hidden rounded-[28px] border border-white/10 bg-white/[.02] p-8">
      <span className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: `radial-gradient(60% 60% at 50% 100%, ${c}33, transparent)` }} />
      <span className={`${H} text-[13px] text-white/30`}>0{k + 1}</span>
      <div className="relative">
        <motion.h3 initial={{ opacity: .08 }} animate={on ? { opacity: [.08, 1, .2, 1, .5, 1] } : {}} transition={{ duration: 1.1, delay: k * .12, times: [0, .1, .2, .35, .5, 1] }}
          className={`${H} mb-2 text-[clamp(30px,3vw,44px)] font-bold leading-none`} style={glow(c)}>{t}</motion.h3>
        <p className="text-white/55">{d}</p>
      </div>
    </motion.a>
  )
}

function Book() {
  const bk = useBooking()
  const [day, setDay] = useState(0), [slot, setSlot] = useState(null)
  const f = 'h-14 w-full rounded-2xl bg-white/[.05] px-5 text-[16px] text-white outline-none ring-1 ring-white/10 placeholder:text-white/35 focus:ring-[#22e4ff]'
  return (
    <section id="book" className="relative px-6 py-28 md:px-10">
      <div className="mx-auto max-w-[1180px]">
        <h2 className={`${H} mb-4 text-[clamp(48px,7vw,110px)] font-extrabold uppercase leading-[.88]`}>Выберите <span style={glow(CY)}>время</span></h2>
        <p className="mb-12 max-w-[520px] text-white/60">Свободные окна — светятся. Выберите время и оставьте номер, мы подтвердим звонком.</p>
        <div className="grid gap-6 rounded-[36px] border border-white/10 bg-white/[.02] p-6 md:grid-cols-[1.2fr_1fr] md:p-10">
          <div>
            <div className="mb-6 flex gap-2">{DAYS.map((d, k) => <button key={d} onClick={() => { setDay(k); setSlot(null) }} className={`relative rounded-full px-5 py-2.5 text-[14px] font-bold ${day === k ? 'text-black' : 'text-white/60 ring-1 ring-white/15'}`}>{day === k && <motion.span layoutId="dday" className="absolute inset-0 rounded-full" style={{ background: CY, boxShadow: `0 0 24px ${CY}` }} />}<span className="relative">{d}</span></button>)}</div>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {SLOTS.map((s, i) => { const bz = busy(day, i), sel = slot === s; return (
                <motion.button key={day + s} initial={{ opacity: 0, scale: .9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * .025 }} disabled={bz} onClick={() => setSlot(s)}
                  className={`h-14 rounded-2xl text-[16px] font-bold transition-[box-shadow,background-color] ${bz ? 'cursor-not-allowed text-white/20 line-through ring-1 ring-white/5' : sel ? 'text-black' : 'text-white ring-1 ring-white/20 hover:ring-[#ff2e88]'}`}
                  style={sel ? { background: PK, boxShadow: `0 0 30px ${PK}` } : undefined}>{s}</motion.button>) })}
            </div>
            <p className="mt-4 flex items-center gap-2 text-[13px] text-white/40"><Clock size={14} />Расписание — демонстрация. В готовом сайте покажем реальные окна.</p>
          </div>
          <AnimatePresence mode="wait">
            {!bk.s.sent ? (
              <motion.form key="f" exit={{ opacity: 0, y: -10 }} onSubmit={e => { bk.upd('svc', `${DAYS[day]}, ${slot || 'любое время'}`); bk.submit(e) }} noValidate className="grid content-start gap-4">
                <div className="rounded-2xl p-5 ring-1 ring-white/10"><span className="text-[12px] uppercase tracking-[.2em] text-white/40">Ваше окно</span><p className={`${H} text-[30px] font-bold`} style={slot ? glow(PK) : undefined}>{slot ? `${DAYS[day]}, ${slot}` : 'не выбрано'}</p></div>
                <input className={f} placeholder="Имя" value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} autoComplete="name" />
                <motion.input animate={bk.s.err ? { x: [0, -8, 8, -6, 6, 0] } : {}} className={f + (bk.s.err ? ' !ring-red-400' : '')} type="tel" inputMode="tel" placeholder="+375 (__) ___-__-__" value={bk.s.phone} onFocus={phoneFocus(bk)} onChange={e => bk.upd('phone', e.target.value)} autoComplete="tel" />
                <button disabled={bk.s.loading} className="h-16 rounded-2xl text-[15px] font-bold uppercase tracking-[.16em] text-white disabled:opacity-60" style={{ background: PK, boxShadow: `0 0 40px ${PK}88` }}>{bk.s.loading ? 'Бронируем…' : 'Забронировать'}</button>
                <p className="text-[13px] text-white/45">В готовом сайте заявка сразу придёт вам в Telegram.</p>
              </motion.form>
            ) : (
              <motion.div key="ok" initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }} className="grid place-items-center py-10 text-center">
                <div><CheckDraw className="mx-auto mb-5" size={80} /><h3 className={`${H} text-[38px] font-bold`} style={glow(CY)}>Бокс ваш</h3><p className="mb-5 text-white/60">Так клиент увидит подтверждение.</p><button onClick={() => { bk.reset(); setSlot(null) }} className="underline underline-offset-4">Ещё одна запись</button></div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

function App() {
  useSmooth()
  const lite = useLite()
  return (
    <MotionConfig reducedMotion="user">
      <div className="bg-[#05060c] font-['Inter',sans-serif] text-white" style={{ '--sel': PK, '--selc': '#fff' }}>
        <Intro bg="#05060c" fg="#fff" duration={1.4}><motion.span className={`${H} text-[64px] font-extrabold uppercase`} animate={{ opacity: [0, 1, .2, 1, .4, 1] }} transition={{ duration: 1 }} style={glow(PK)}>Даима</motion.span></Intro>
        <Grain opacity={.06} />
        <Progress color={PK} />
        <Cursor color={CY} blend="normal" textColor="#000" />
        <Ribbon name={b.name} bg={PK} fg="#fff" />
        <header className="sticky top-0 z-40 border-b border-white/10 bg-[#05060c]/70 backdrop-blur-xl">
          <div className="mx-auto flex h-[70px] max-w-[1320px] items-center justify-between px-6 md:px-10">
            <a href="#top" className={`${H} text-[24px] font-extrabold uppercase`} style={glow(PK)}>Даима</a>
            <nav className="hidden gap-8 text-[13px] uppercase tracking-[.16em] text-white/60 md:flex">{[['#services', 'Услуги'], ['#book', 'Время'], ['#contacts', 'Контакты']].map(([h, t]) => <a key={h} href={h} className="hover:text-white">{t}</a>)}</nav>
            <a href={'tel:' + tel(b.phones[0])} className="hidden items-center gap-2 text-[14px] font-semibold sm:inline-flex"><Phone size={15} />{b.phones[0]}</a>
          </div>
        </header>
        <main id="top">
          <Hero lite={lite} />
          <Marquee base={-2} className="border-y border-white/10 py-6">
            {['мойка в любую погоду', 'пена', 'диски', 'салон', 'воск', 'стёкла'].map((t, k) => <span key={t} className={`${H} mx-8 inline-flex items-center gap-14 text-[clamp(36px,5vw,72px)] font-bold uppercase`} style={glow([PK, CY, AM][k % 3])}>{t}<span className="text-white/30">✦</span></span>)}
          </Marquee>
          <section id="services" className="px-6 py-28 md:px-10">
            <div className="mx-auto max-w-[1320px]">
              <h2 className={`${H} mb-14 text-[clamp(48px,7vw,110px)] font-extrabold uppercase leading-[.88]`}><SplitText text="Что делаем" /></h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{SV.map(([t, d, c], k) => <Neon key={t} t={t} d={d} c={c} k={k} />)}</div>
            </div>
          </section>
          <section className="px-6 pb-10 md:px-10">
            <div className="mx-auto grid max-w-[1320px] gap-4 md:grid-cols-3">
              {[[b.rev, 'оценок на Яндекс.Картах', PK], [12, 'окон для записи в день', CY], [60, 'секунд на бронь', AM]].map(([n, t, c]) => <Reveal key={t} className="rounded-[28px] border border-white/10 p-10"><span className={`${H} block text-[88px] font-extrabold leading-none`} style={glow(c)}><Counter to={n} /></span><span className="text-white/55">{t}</span></Reveal>)}
            </div>
          </section>
          <Book />
          <section id="contacts" className="px-6 pb-28 md:px-10">
            <div className="mx-auto grid max-w-[1320px] gap-6 md:grid-cols-[.9fr_1.1fr]">
              <Reveal className="grid content-start gap-7">
                <h2 className={`${H} text-[clamp(48px,7vw,100px)] font-extrabold uppercase leading-[.88]`}>Как <span style={glow(AM)}>доехать</span></h2>
                <p className="flex items-start gap-3 text-[22px]"><MapPin className="mt-1 shrink-0" style={{ color: PK }} />{b.addr}</p>
                {b.phones.map(p => <a key={p} href={'tel:' + tel(p)} className={`${H} text-[34px] font-bold`}>{p}</a>)}
              </Reveal>
              <Reveal delay={.1} className="h-[420px] overflow-hidden rounded-[28px] border border-white/10"><MapFrame oid={b.oid} dark /></Reveal>
            </div>
          </section>
        </main>
        <footer className="border-t border-white/10 px-6 py-10 text-[13px] text-white/45 md:px-10"><div className="mx-auto flex max-w-[1320px] flex-wrap justify-between gap-4"><span>© 2026 Мойка Даима</span><span>Демо-концепт · дизайн и разработка — Артём</span></div></footer>
        <CallBar phone={b.phones[0]} barCls="bg-[#05060c]/85 backdrop-blur-xl border-t border-white/10" callCls="rounded-2xl ring-1 ring-white/20" bookCls="rounded-2xl bg-[#ff2e88] text-white" />
        <div className="h-[72px] sm:hidden" />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
