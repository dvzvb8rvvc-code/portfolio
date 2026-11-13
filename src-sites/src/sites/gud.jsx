import React, { useRef, useState, useEffect, Suspense, lazy, useMemo } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence, MotionConfig } from 'framer-motion'
import { ArrowUpRight, Phone, MapPin, Scissors, Clock } from 'lucide-react'
import '../lib/base.css'
import { B } from '../data'
import { useSmooth, Ribbon, SplitText, ScrollWords, Reveal, Magnetic, Cursor, Marquee, Counter, useBooking, phoneFocus, CheckDraw, MapFrame, messengerLinks, CallBar, Progress, Intro, tel } from '../lib/kit'

const Pole = lazy(() => import('./gud3d'))
const b = B.gud
const BR = '#c9773b', CR = '#efe5d2'
const SV = [['Мужская стрижка', '45 мин', 'Классика, фейд, андеркат — форма под вас.'], ['Борода', '30 мин', 'Моделирование, контур и уход маслом.'], ['Стрижка + борода', '75 мин', 'Полный образ за один визит.'], ['Стрижка машинкой', '30 мин', 'Быстро и аккуратно, с переходом.'], ['Укладка', '15 мин', 'И подбор средств, чтобы повторить дома.'], ['Отец + сын', '80 мин', 'Две стрижки рядом — традиция.']]
const WORDS = ['стрижка', 'борода', 'образ', 'выходные']

function Rotator() {
  const [i, setI] = useState(0)
  useEffect(() => { const t = setInterval(() => setI(v => (v + 1) % WORDS.length), 2200); return () => clearInterval(t) }, [])
  return (
    <span className="relative inline-grid overflow-hidden pb-[0.14em] align-bottom">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span key={WORDS[i]} initial={{ y: '100%', rotateX: -80, opacity: 0 }} animate={{ y: 0, rotateX: 0, opacity: 1 }} exit={{ y: '-100%', rotateX: 80, opacity: 0 }} transition={{ duration: .7, ease: [0.16, 1, 0.3, 1] }} className="col-start-1 row-start-1 italic text-[#c9773b]">{WORDS[i]}</motion.span>
      </AnimatePresence>
    </span>
  )
}

function Hero() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [0, 160])
  return (
    <section ref={ref} className="relative min-h-[100svh] overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-[.07] [background-image:radial-gradient(#efe5d2_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="relative mx-auto grid min-h-[calc(100svh-110px)] max-w-[1280px] items-center gap-10 px-6 py-16 md:grid-cols-[1.2fr_.8fr] md:px-10">
        <motion.div style={{ y }}>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="mb-6 flex items-center gap-4 text-[12px] uppercase tracking-[.32em] text-[#c9773b]"><span className="h-px w-10 bg-current" />Барбершоп · Брилевская 3<span className="h-px w-10 bg-current" /></motion.p>
          <h1 className="font-['Prata',serif] text-[clamp(52px,7.6vw,118px)] leading-[1.02] tracking-[-.01em]">
            <SplitText text="Хорошая" delay={1.4} mode="words" className="block" />
            <span className="block"><Rotator /></span>
            <SplitText text="— это гуд." delay={1.6} mode="words" className="block" />
          </h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.9 }} className="mb-10 mt-8 max-w-[460px] text-[17px] text-[#9fb0a5]">Мужские стрижки и борода. Без суеты, с крепким кофе и мастерами, которые слушают, а не только стригут.</motion.p>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.05 }} className="flex flex-wrap gap-3">
            <Magnetic><a href="#book" data-cursor="Запись" className="inline-flex h-14 items-center gap-3 rounded-2xl bg-[#c9773b] px-8 font-bold text-[#1b0f06] transition-[scale] active:scale-[.96]">Занять кресло <ArrowUpRight size={18} /></a></Magnetic>
            <a href={'tel:' + tel(b.phones[0])} className="inline-flex h-14 items-center gap-3 rounded-2xl px-7 font-semibold ring-1 ring-[#efe5d2]/20 hover:ring-[#efe5d2]/60"><Phone size={16} />{b.phones[0]}</a>
          </motion.div>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: .9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.5, duration: 1.2, ease: [0.16, 1, 0.3, 1] }} className="relative mx-auto aspect-[3/4] w-full max-w-[420px]">
          <div className="absolute inset-0 rounded-t-full rounded-b-[32px] bg-gradient-to-b from-[#20362b] to-[#0f1a15] ring-1 ring-[#efe5d2]/10" />
          <div className="absolute inset-0"><Suspense fallback={null}><Pole /></Suspense></div>
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 16, ease: 'linear' }} className="absolute -bottom-6 -left-6 h-36 w-36">
            <svg viewBox="0 0 200 200"><defs><path id="gc" d="M100,100 m-72,0 a72,72 0 1,1 144,0 a72,72 0 1,1 -144,0" /></defs><circle cx="100" cy="100" r="98" fill={BR} /><text fontFamily="Manrope" fontWeight="700" fontSize="15" letterSpacing="5" fill="#1b0f06"><textPath href="#gc">БАРБЕРШОП ГУД · С ЛЮБОВЬЮ К ДЕТАЛЯМ ·</textPath></text></svg>
          </motion.div>
          <div className="absolute -bottom-6 -left-6 grid h-36 w-36 place-items-center text-[#1b0f06]"><Scissors size={36} /></div>
        </motion.div>
      </div>
    </section>
  )
}

function Menu() {
  const mx = useMotionValue(0), my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 300, damping: 30 }), sy = useSpring(my, { stiffness: 300, damping: 30 })
  const [hov, setHov] = useState(null)
  return (
    <section id="menu" className="relative mx-auto max-w-[1280px] px-6 py-28 md:px-10" onPointerMove={e => { mx.set(e.clientX); my.set(e.clientY) }}>
      <div className="mb-14 text-center">
        <p className="mb-4 text-[12px] uppercase tracking-[.32em] text-[#c9773b]">Меню</p>
        <h2 className="font-['Prata',serif] text-[clamp(44px,6vw,88px)] leading-none"><SplitText text="Ритуалы" mode="words" /> <SplitText text="барбершопа" mode="words" delay={.1} className="text-[#c9773b]" /></h2>
      </div>
      <ul onPointerLeave={() => setHov(null)}>
        {SV.map(([t, tm, d], i) => (
          <motion.li key={t} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * .06, duration: .7 }}>
            <a href="#book" data-svc={t} onPointerEnter={() => setHov(i)} className="group grid grid-cols-[1fr_auto] items-center gap-4 border-b border-dashed border-[#efe5d2]/15 py-7 md:grid-cols-[80px_1fr_1fr_auto]">
              <span className="hidden font-['Prata',serif] text-[20px] text-[#c9773b] md:block">0{i + 1}</span>
              <span className="font-['Prata',serif] text-[clamp(28px,3.6vw,52px)] leading-none transition-[transform,color] duration-500 group-hover:translate-x-4 group-hover:text-[#c9773b]">{t}</span>
              <span className="hidden text-[#9fb0a5] md:block">{d}</span>
              <span className="flex items-center gap-2 whitespace-nowrap text-[13px] uppercase tracking-[.16em] text-[#c9773b]"><Clock size={14} />{tm}</span>
            </a>
          </motion.li>
        ))}
      </ul>
      <motion.div aria-hidden="true" style={{ x: sx, y: sy }} className="pointer-events-none fixed left-0 top-0 z-30 hidden md:block">
        <AnimatePresence>{hov !== null && (
          <motion.div key="p" initial={{ opacity: 0, scale: .6, rotate: -8 }} animate={{ opacity: 1, scale: 1, rotate: -4 }} exit={{ opacity: 0, scale: .6 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="ml-6 mt-6 grid h-44 w-56 place-items-center rounded-3xl bg-[#c9773b] text-[#1b0f06] shadow-2xl">
            <div className="text-center"><Scissors className="mx-auto mb-2" size={30} /><p className="font-['Prata',serif] text-[22px] leading-tight">{SV[hov][0]}</p><p className="mt-1 text-[12px] font-bold uppercase tracking-widest">{SV[hov][1]} · записаться</p></div>
          </motion.div>)}</AnimatePresence>
      </motion.div>
    </section>
  )
}

function Slots() {
  const bk = useBooking()
  const days = useMemo(() => { const n = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб']; return Array.from({ length: 6 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i); return { k: i, top: i === 0 ? 'Сегодня' : i === 1 ? 'Завтра' : n[d.getDay()], num: d.getDate() } }) }, [])
  const times = ['10:00', '11:00', '12:30', '14:00', '15:30', '17:00', '18:30', '20:00']
  const busy = useMemo(() => new Set(['0-10:00', '0-12:30', '1-14:00', '2-11:00', '3-17:00']), [])
  const [day, setDay] = useState(0), [time, setTime] = useState('')
  return (
    <section id="book" className="px-6 py-28 md:px-10">
      <div className="mx-auto grid max-w-[1280px] overflow-hidden rounded-[32px] ring-1 ring-[#efe5d2]/10 md:grid-cols-[.85fr_1.15fr]">
        <div className="bg-[#c9773b] p-10 text-[#1b0f06] md:p-14">
          <h2 className="font-['Prata',serif] text-[clamp(44px,5vw,72px)] leading-[1.02]">Выберите<br />время</h2>
          <p className="mb-8 mt-6 max-w-[360px] opacity-80">Свободные окна видно сразу. Выберите день и время — администратор подтвердит запись звонком.</p>
          {b.phones.map(p => <a key={p} href={'tel:' + tel(p)} className="block font-['Prata',serif] text-[32px]">{p}</a>)}
        </div>
        <div className="bg-[#1b2f25] p-8 md:p-12">
          <AnimatePresence mode="wait">
            {!bk.s.sent ? (
              <motion.form key="f" exit={{ opacity: 0, y: -12 }} onSubmit={bk.submit} noValidate className="grid gap-7">
                <div><p className="mb-3 text-[13px] text-[#9fb0a5]">День</p>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">{days.map(d => (
                    <button type="button" key={d.k} onClick={() => { setDay(d.k); setTime('') }} className="relative rounded-2xl py-3 text-center">
                      {day === d.k && <motion.span layoutId="gday" className="absolute inset-0 rounded-2xl bg-[#efe5d2]" transition={{ type: 'spring', bounce: 0, duration: .45 }} />}
                      <span className={`relative block text-[12px] ${day === d.k ? 'text-[#13221b]' : 'text-[#9fb0a5]'}`}>{d.top}</span>
                      <span className={`relative block font-['Prata',serif] text-[24px] ${day === d.k ? 'text-[#13221b]' : ''}`}>{d.num}</span>
                    </button>))}</div></div>
                <div><p className="mb-3 text-[13px] text-[#9fb0a5]">Время</p>
                  <div className="grid grid-cols-4 gap-2">{times.map(t => { const off = busy.has(`${day}-${t}`); return (
                    <motion.button whileTap={off ? {} : { scale: .94 }} type="button" key={t} disabled={off} onClick={() => setTime(t)}
                      className={`h-12 rounded-xl text-[15px] font-semibold transition-colors ${off ? 'cursor-not-allowed text-[#9fb0a5]/30 line-through' : time === t ? 'bg-[#c9773b] text-[#1b0f06]' : 'ring-1 ring-[#efe5d2]/15 hover:ring-[#c9773b]'}`}>{t}</motion.button>) })}</div></div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <select value={bk.s.svc} onChange={e => bk.upd('svc', e.target.value)} className="h-14 rounded-xl bg-[#13221b] px-4 outline-none ring-1 ring-[#efe5d2]/15 focus:ring-[#c9773b]"><option value="">Услуга</option>{SV.map(([t]) => <option key={t}>{t}</option>)}</select>
                  <motion.input animate={bk.s.err ? { x: [0, -8, 8, -6, 6, 0] } : {}} value={bk.s.phone} onFocus={phoneFocus(bk)} onChange={e => bk.upd('phone', e.target.value)} type="tel" inputMode="tel" autoComplete="tel" placeholder="Телефон *" className={`h-14 rounded-xl bg-[#13221b] px-4 outline-none ring-1 ${bk.s.err ? 'ring-red-400' : 'ring-[#efe5d2]/15 focus:ring-[#c9773b]'}`} />
                </div>
                <button disabled={bk.s.loading} className="h-14 rounded-xl bg-[#c9773b] font-bold text-[#1b0f06] transition-[scale,opacity] active:scale-[.96] disabled:opacity-60">{bk.s.loading ? 'Бронируем…' : time ? `Записаться на ${days[day].top.toLowerCase()}, ${time}` : 'Записаться'}</button>
                <p className="text-[12.5px] text-[#9fb0a5]">Занятые окна для демо. В готовом сайте расписание берётся из вашей CRM, а заявка приходит в Telegram.</p>
              </motion.form>
            ) : (
              <motion.div key="ok" initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }} className="py-16 text-center text-[#c9773b]"><CheckDraw className="mx-auto mb-5" /><h3 className="font-['Prata',serif] text-[40px] text-[#efe5d2]">Кресло ваше</h3><p className="text-[#9fb0a5]">{days[day].top} {time && 'в ' + time} — ждём вас на Брилевской, 3.</p></motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

function App() {
  useSmooth()
  return (
    <MotionConfig reducedMotion="user">
      <div className="bg-[#13221b] font-['Manrope',sans-serif] text-[#efe5d2]" style={{ '--sel': BR, '--selc': '#1b0f06' }}>
        <Intro bg={BR} fg="#1b0f06" duration={1.5}><motion.span initial={{ scale: .6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: .6 }} className="font-['Prata',serif] text-[120px]">Гуд</motion.span></Intro>
        <Progress color={BR} />
        <Cursor color={CR} textColor="#13221b" />
        <Ribbon name={b.name} bg={BR} fg="#1b0f06" />
        <header className="sticky top-0 z-40 border-b border-[#efe5d2]/10 bg-[#13221b]/80 backdrop-blur-xl">
          <div className="mx-auto grid h-[74px] max-w-[1280px] grid-cols-[1fr_auto_1fr] items-center px-6 md:px-10">
            <nav className="hidden gap-7 text-[14px] text-[#9fb0a5] md:flex">{[['#menu', 'Меню'], ['#book', 'Запись'], ['#contacts', 'Контакты']].map(([h, t]) => <a key={h} href={h} className="hover:text-[#efe5d2]">{t}</a>)}</nav>
            <a href="#top" className="col-start-1 flex items-center gap-2 font-['Prata',serif] text-[30px] md:col-start-2"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#c9773b] text-[18px] text-[#13221b]">Г</span>Гуд</a>
            <a href="#book" className="hidden h-11 items-center justify-self-end rounded-xl bg-[#c9773b] px-6 font-bold text-[#1b0f06] sm:inline-flex">Записаться</a>
          </div>
        </header>
        <main id="top">
          <Hero />
          <Marquee base={-2.5} className="border-y border-[#efe5d2]/10 bg-[#0f1a15] py-6">
            {['Стрижка', 'Борода', 'Фейд', 'Бритьё', 'Укладка', 'Кофе'].map(t => <span key={t} className="mx-6 inline-flex items-center gap-12 font-['Prata',serif] text-[clamp(32px,4vw,60px)]">{t}<Scissors className="text-[#c9773b]" size={28} /></span>)}
          </Marquee>
          <Menu />
          <section className="bg-[#efe5d2] px-6 py-32 text-[#13221b] md:px-10">
            <ScrollWords className="mx-auto max-w-[1050px] text-center font-['Prata',serif] text-[clamp(32px,4.4vw,64px)] leading-[1.18]" text="Мы не обещаем изменить вашу жизнь. Только причёску — и, может быть, настроение на всю неделю." dim={0.12} />
            <div className="mx-auto mt-20 grid max-w-[1050px] gap-4 md:grid-cols-3">
              {[[b.rev, 'оценок на Яндекс.Картах'], [6, 'ритуалов в меню'], [60, 'секунд на онлайн-запись']].map(([n, t], i) => (
                <Reveal key={t} delay={i * .1} className="rounded-3xl bg-[#13221b] p-8 text-[#efe5d2]"><Counter to={n} className="block font-['Prata',serif] text-[64px] leading-none text-[#c9773b]" /><span className="text-[#9fb0a5]">{t}</span></Reveal>))}
            </div>
          </section>
          <Slots />
          <section id="contacts" className="mx-auto max-w-[1280px] px-6 pb-28 md:px-10">
            <div className="grid gap-6 md:grid-cols-[1fr_1.25fr]">
              <Reveal className="grid content-start gap-7 rounded-[32px] bg-[#1b2f25] p-10">
                <h2 className="font-['Prata',serif] text-[56px] leading-none">Как <span className="text-[#c9773b]">найти</span></h2>
                <div><p className="mb-1 flex items-center gap-2 text-[12px] uppercase tracking-[.2em] text-[#c9773b]"><MapPin size={14} />Адрес</p><p className="font-['Prata',serif] text-[26px]">{b.addr}</p></div>
                <div><p className="mb-1 text-[12px] uppercase tracking-[.2em] text-[#c9773b]">Телефон</p>{b.phones.map(p => <a key={p} href={'tel:' + tel(p)} className="block font-['Prata',serif] text-[26px]">{p}</a>)}</div>
                <div className="flex flex-wrap gap-2">{messengerLinks(b).map(m => <a key={m.k} href={m.href} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[14px] ring-1 ring-[#efe5d2]/15 transition-colors hover:bg-[#c9773b] hover:text-[#1b0f06]">{m.Icon && <m.Icon width={16} height={16} />}{m.label}</a>)}</div>
              </Reveal>
              <Reveal delay={.1} className="min-h-[420px] overflow-hidden rounded-[32px] ring-1 ring-[#efe5d2]/10"><MapFrame oid={b.oid} dark /></Reveal>
            </div>
          </section>
        </main>
        <footer className="px-6 py-12 text-center text-[13px] text-[#9fb0a5]">© 2026 Барбершоп Гуд · демо-концепт сайта · автор — Артём</footer>
        <CallBar phone={b.phones[0]} barCls="bg-[#13221b]/95 backdrop-blur-xl border-t border-[#efe5d2]/10" callCls="rounded-xl ring-1 ring-[#efe5d2]/25" bookCls="rounded-xl bg-[#c9773b] text-[#1b0f06]" />
        <div className="h-[72px] sm:hidden" />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
