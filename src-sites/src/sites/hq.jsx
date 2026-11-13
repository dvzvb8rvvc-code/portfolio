import React, { useRef, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, useSpring, AnimatePresence, MotionConfig } from 'framer-motion'
import { ArrowUpRight, Phone, MapPin, Sparkles } from 'lucide-react'
import '../lib/base.css'
import { B } from '../data'
import { useSmooth, Ribbon, SplitText, ScrollWords, Reveal, Magnetic, Cursor, Marquee, Counter, useBooking, phoneFocus, CheckDraw, MapFrame, messengerLinks, CallBar, Progress, Intro, tel, useIsMobile } from '../lib/kit'

const Blob = lazy(() => import('./hq3d'))
const b = B.hq
const SV = [
  ['Маникюр', 'Классический, аппаратный и комбинированный. Безупречная форма и кутикула.', 'from-[#2a2117] to-[#0e0c0a]'],
  ['Педикюр', 'Бережный уход и стойкое покрытие, которое держится неделями.', 'from-[#33281b] to-[#0e0c0a]'],
  ['Дизайн ногтей', 'Френч, минимализм, втирки и авторские решения под ваш образ.', 'from-[#3a2c1a] to-[#0e0c0a]'],
  ['Стрижки', 'Женские и мужские стрижки с учётом структуры волос.', 'from-[#2c2219] to-[#0e0c0a]'],
  ['Окрашивание', 'От тонирования до сложных техник с бережным уходом.', 'from-[#3b2d1c] to-[#0e0c0a]'],
  ['Укладки и уход', 'Повседневные и вечерние укладки, восстанавливающие процедуры.', 'from-[#30251a] to-[#0e0c0a]'],
]
const gold = 'linear-gradient(135deg,#f3e2bf,#c8a46a 45%,#8a6a3a)'

function Hero() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '40%'])
  const op = useTransform(scrollYProgress, [0, .7], [1, 0])
  const big = useTransform(scrollYProgress, [0, 1], ['0%', '-30%'])
  return (
    <section ref={ref} className="relative h-[100svh] min-h-[640px] overflow-hidden">
      <motion.div style={{ x: big }} className="pointer-events-none absolute inset-x-0 top-[18%] select-none whitespace-nowrap text-center font-['Cormorant_Garamond',serif] text-[38vw] italic leading-none text-white/[0.035]">HQ beauty</motion.div>
      <div className="absolute inset-0"><Suspense fallback={null}><Blob progress={scrollYProgress} /></Suspense></div>
      <motion.div style={{ y, opacity: op }} className="relative z-10 mx-auto flex h-full max-w-[1320px] flex-col justify-end px-6 pb-20 md:px-10">
        <div className="grid items-end gap-10 md:grid-cols-[1.4fr_1fr]">
          <div>
            <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.7, duration: .8 }} className="mb-6 flex items-center gap-4 text-[12px] uppercase tracking-[.34em] text-[#c8a46a]"><span className="h-px w-10 bg-[#c8a46a]" />Салон красоты · Минск</motion.p>
            <h1 className="font-['Cormorant_Garamond',serif] text-[clamp(64px,10vw,168px)] font-normal leading-[.86] tracking-[-.03em]">
              <SplitText text="Искусство" delay={1.6} className="block" />
              <SplitText text="деталей" delay={1.85} className="block italic text-[#ead6ae]" />
            </h1>
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.2, duration: .8 }} className="pb-3">
            <p className="mb-8 max-w-[380px] text-[16px] leading-relaxed text-[#a39887]">Маникюр, педикюр, стрижки и окрашивание в одном пространстве. Тихо, красиво и без спешки — так, как должно быть.</p>
            <div className="flex flex-wrap gap-3">
              <Magnetic><a href="#book" data-cursor="Запись" className="inline-flex h-14 items-center gap-3 rounded-full px-8 text-[13px] font-bold uppercase tracking-[.16em] text-[#17130c] transition-[scale] active:scale-[.96]" style={{ background: gold }}>Выбрать время <ArrowUpRight size={18} /></a></Magnetic>
              <a href={'tel:' + tel(b.phones[0])} className="inline-flex h-14 items-center gap-3 rounded-full px-7 text-[13px] font-semibold tracking-[.08em] ring-1 ring-white/15 transition-colors hover:ring-[#c8a46a]"><Phone size={16} />{b.phones[0]}</a>
            </div>
          </motion.div>
        </div>
      </motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.6 }} className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-[10px] uppercase tracking-[.3em] text-white/40 md:flex">
        Листайте<motion.span animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.8 }} className="h-8 w-px bg-gradient-to-b from-[#c8a46a] to-transparent" />
      </motion.div>
    </section>
  )
}

function HScroll() {
  const ref = useRef(null)
  const mobile = useIsMobile()
  const { scrollYProgress } = useScroll({ target: ref })
  const x = useSpring(useTransform(scrollYProgress, [0, 1], ['0%', '-72%']), { stiffness: 120, damping: 30, mass: .3 })
  const cards = SV.map(([t, d, g], i) => (
    <motion.a key={t} href="#book" data-svc={t} data-cursor="Запись" whileHover="h"
      className={`group relative flex h-[62vh] min-h-[420px] w-[78vw] shrink-0 snap-center flex-col justify-between overflow-hidden rounded-[36px] bg-gradient-to-b ${g} p-8 ring-1 ring-white/10 md:w-[34vw] md:p-10`}>
      <motion.div variants={{ h: { scale: 1.15, rotate: 8 } }} transition={{ duration: .8, ease: [0.2, 0, 0, 1] }} className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full opacity-40 blur-2xl" style={{ background: gold }} />
      <span className="relative font-['Cormorant_Garamond',serif] text-[120px] italic leading-none text-transparent [-webkit-text-stroke:1px_rgba(234,214,174,.5)]">0{i + 1}</span>
      <div className="relative">
        <h3 className="mb-3 font-['Cormorant_Garamond',serif] text-[44px] leading-none md:text-[56px]">{t}</h3>
        <p className="mb-6 max-w-[320px] text-[15px] text-[#a39887]">{d}</p>
        <span className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[.2em] text-[#ead6ae]">Записаться <motion.span variants={{ h: { x: 6, y: -6 } }}><ArrowUpRight size={16} /></motion.span></span>
      </div>
    </motion.a>
  ))
  if (mobile) return (
    <section id="services" className="py-24">
      <div className="px-6"><p className="mb-4 text-[12px] uppercase tracking-[.34em] text-[#c8a46a]">Услуги</p><h2 className="mb-10 font-['Cormorant_Garamond',serif] text-[56px] leading-none">Шесть <i className="text-[#ead6ae]">ритуалов</i></h2></div>
      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 [scrollbar-width:none]">{cards}</div>
    </section>
  )
  return (
    <section id="services" ref={ref} className="relative h-[420vh]">
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="mx-auto mb-10 flex w-full max-w-[1320px] items-end justify-between px-10">
          <h2 className="font-['Cormorant_Garamond',serif] text-[clamp(56px,7vw,110px)] leading-[.9]">Шесть <i className="text-[#ead6ae]">ритуалов</i></h2>
          <p className="max-w-[300px] pb-3 text-[#a39887]">Листайте вниз — услуги едут вбок. Нажмите на любую, чтобы записаться.</p>
        </div>
        <motion.div style={{ x }} className="flex gap-6 pl-10">{cards}</motion.div>
      </div>
    </section>
  )
}

function Book() {
  const bk = useBooking()
  const f = 'w-full rounded-none border-0 border-b border-white/25 bg-transparent py-3 text-[18px] outline-none transition-colors focus:border-[#c8a46a] placeholder:text-white/30'
  return (
    <section id="book" className="relative px-6 py-32 md:px-10">
      <div className="mx-auto grid max-w-[1320px] overflow-hidden rounded-[44px] bg-[#14110d] ring-1 ring-white/10 md:grid-cols-2">
        <div className="relative overflow-hidden p-10 md:p-16">
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full opacity-30 blur-3xl" style={{ background: gold }} />
          <SplitText text="Ваше время" className="relative block font-['Cormorant_Garamond',serif] text-[clamp(52px,6vw,96px)] leading-[.9]" />
          <SplitText text="в HQ" delay={.2} className="relative block font-['Cormorant_Garamond',serif] text-[clamp(52px,6vw,96px)] italic leading-[.9] text-[#ead6ae]" />
          <p className="relative mb-10 mt-8 max-w-[380px] text-[#a39887]">Оставьте заявку — администратор перезвонит и подберёт мастера и удобное время.</p>
          {b.phones.map(p => <a key={p} href={'tel:' + tel(p)} className="relative block font-['Cormorant_Garamond',serif] text-[40px]">{p}</a>)}
        </div>
        <div className="p-10 md:p-16">
          <AnimatePresence mode="wait">
            {!bk.s.sent ? (
              <motion.form key="f" exit={{ opacity: 0, y: -16, filter: 'blur(6px)' }} onSubmit={bk.submit} noValidate className="grid gap-8">
                <label className="grid gap-1"><span className="text-[11px] uppercase tracking-[.26em] text-[#a39887]">Имя</span><input className={f} value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} placeholder="Как к вам обращаться" autoComplete="name" /></label>
                <label className="grid gap-1"><span className="text-[11px] uppercase tracking-[.26em] text-[#a39887]">Телефон</span><motion.input animate={bk.s.err ? { x: [0, -8, 8, -6, 6, 0] } : {}} className={f + (bk.s.err ? ' !border-red-400' : '')} value={bk.s.phone} onFocus={phoneFocus(bk)} onChange={e => bk.upd('phone', e.target.value)} type="tel" inputMode="tel" placeholder="+375 (__) ___-__-__" autoComplete="tel" /></label>
                <div className="grid gap-3"><span className="text-[11px] uppercase tracking-[.26em] text-[#a39887]">Услуга</span>
                  <div className="flex flex-wrap gap-2">{SV.map(([t]) => (
                    <button type="button" key={t} onClick={() => bk.upd('svc', t)} className={`relative rounded-full px-4 py-2 text-[13px] transition-colors ${bk.s.svc === t ? 'text-[#17130c]' : 'text-white/80 ring-1 ring-white/15 hover:ring-[#c8a46a]'}`}>
                      {bk.s.svc === t && <motion.span layoutId="hqsvc" className="absolute inset-0 rounded-full" style={{ background: gold }} transition={{ type: 'spring', bounce: 0, duration: .5 }} />}
                      <span className="relative">{t}</span></button>))}</div></div>
                <button disabled={bk.s.loading} className="h-16 rounded-full text-[13px] font-bold uppercase tracking-[.18em] text-[#17130c] transition-[scale,opacity] active:scale-[.96] disabled:opacity-60" style={{ background: gold }}>{bk.s.loading ? 'Отправляем…' : 'Записаться'}</button>
                <p className="text-[12.5px] text-[#a39887]">В готовом сайте заявка сразу придёт вам в Telegram.</p>
              </motion.form>
            ) : (
              <motion.div key="ok" initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} className="grid h-full place-items-center py-16 text-center text-[#ead6ae]">
                <div><CheckDraw className="mx-auto mb-6" /><h3 className="font-['Cormorant_Garamond',serif] text-[48px] text-white">Заявка принята</h3><p className="mb-6 text-[#a39887]">Так клиент увидит подтверждение. Перезвоним в течение 15 минут.</p><button onClick={bk.reset} className="text-[12px] uppercase tracking-[.2em] underline underline-offset-4">Ещё одна запись</button></div>
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
  return (
    <MotionConfig reducedMotion="user">
      <div className="bg-[#0b0a09] font-['Manrope',sans-serif] text-[#f3ece1]" style={{ '--sel': '#c8a46a', '--selc': '#17130c' }}>
        <Intro bg="#0b0a09" fg="#ead6ae" duration={1.7}>
          <svg viewBox="0 0 300 160" className="w-[260px]"><motion.text x="150" y="120" textAnchor="middle" fontFamily="Cormorant Garamond" fontSize="140" fill="none" stroke="#c8a46a" strokeWidth="1.2" initial={{ pathLength: 0, strokeDasharray: '0 1' }} animate={{ strokeDasharray: ['0 600', '600 0'] }} transition={{ duration: 1.3, ease: 'easeInOut' }}>HQ</motion.text></svg>
        </Intro>
        <Progress color="#c8a46a" />
        <Cursor color="#ead6ae" textColor="#17130c" />
        <Ribbon name={b.name} bg="#c8a46a" fg="#17130c" />
        <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0b0a09]/70 backdrop-blur-xl">
          <div className="mx-auto flex h-[72px] max-w-[1320px] items-center justify-between px-6 md:px-10">
            <a href="#top" className="flex items-center gap-3 text-[14px] font-semibold uppercase tracking-[.28em]"><span className="grid h-9 w-9 place-items-center rounded-full font-['Cormorant_Garamond',serif] text-[15px] normal-case tracking-normal ring-1 ring-[#c8a46a] text-[#ead6ae]">HQ</span>HQ Beauty</a>
            <nav className="hidden gap-9 text-[12px] uppercase tracking-[.18em] text-[#a39887] md:flex">{[['#services', 'Услуги'], ['#about', 'О салоне'], ['#contacts', 'Контакты']].map(([h, t]) => <a key={h} href={h} className="transition-colors hover:text-white">{t}</a>)}</nav>
            <a href="#book" className="hidden h-11 items-center rounded-full px-6 text-[12px] font-bold uppercase tracking-[.16em] text-[#17130c] sm:inline-flex" style={{ background: gold }}>Записаться</a>
          </div>
        </header>
        <main id="top">
          <Hero />
          <section id="about" className="mx-auto max-w-[1200px] px-6 py-32 md:px-10 md:py-48">
            <p className="mb-10 flex items-center gap-4 text-[12px] uppercase tracking-[.34em] text-[#c8a46a]"><Sparkles size={14} />Философия</p>
            <ScrollWords className="font-['Cormorant_Garamond',serif] text-[clamp(34px,4.6vw,72px)] leading-[1.08]" text="Мы верим, что красота живёт в деталях: в идеальной линии кутикулы, в оттенке, который подходит именно вам, и в часе тишины, который вы дарите себе." />
          </section>
          <HScroll />
          <section className="py-24">
            <Marquee base={-3} className="border-y border-white/10 py-8">
              {['Маникюр', 'Педикюр', 'Стрижки', 'Окрашивание', 'Укладки', 'Уход'].map(t => <span key={t} className="mx-8 inline-flex items-center gap-16 font-['Cormorant_Garamond',serif] text-[clamp(44px,6vw,92px)] italic">{t}<span className="text-[.4em] not-italic text-[#c8a46a]">✦</span></span>)}
            </Marquee>
            <div className="mx-auto mt-24 grid max-w-[1320px] gap-6 px-6 md:grid-cols-3 md:px-10">
              {[[b.rev, 'оценок гостей на Яндекс.Картах'], [3, 'направления: ногти, волосы, уход'], [60, 'секунд на онлайн-запись']].map(([n, t], i) => (
                <Reveal key={t} delay={i * .1} className="rounded-[32px] p-10 ring-1 ring-white/10">
                  <span className="block bg-clip-text font-['Cormorant_Garamond',serif] text-[96px] leading-none text-transparent" style={{ backgroundImage: gold }}><Counter to={n} /></span>
                  <span className="text-[#a39887]">{t}</span>
                </Reveal>))}
            </div>
          </section>
          <Book />
          <section id="contacts" className="mx-auto max-w-[1320px] px-6 pb-32 md:px-10">
            <h2 className="mb-12 font-['Cormorant_Garamond',serif] text-[clamp(56px,7vw,110px)] leading-[.9]"><SplitText text="Найти" /> <SplitText text="нас" delay={.15} className="italic text-[#ead6ae]" /></h2>
            <div className="grid gap-6 md:grid-cols-[.9fr_1.1fr]">
              <Reveal className="grid content-start gap-8">
                <div><p className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[.26em] text-[#c8a46a]"><MapPin size={14} />Адрес</p><p className="font-['Cormorant_Garamond',serif] text-[38px] leading-tight">{b.addr}</p></div>
                <div><p className="mb-2 text-[11px] uppercase tracking-[.26em] text-[#c8a46a]">Телефон</p>{b.phones.map(p => <a key={p} href={'tel:' + tel(p)} className="block font-['Cormorant_Garamond',serif] text-[38px]">{p}</a>)}</div>
                <div className="flex flex-wrap gap-2">{messengerLinks(b).map(m => <a key={m.k} href={m.href} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-[13px] ring-1 ring-white/15 transition-colors hover:text-[#ead6ae] hover:ring-[#c8a46a]">{m.Icon && <m.Icon width={16} height={16} />}{m.label}</a>)}</div>
              </Reveal>
              <Reveal delay={.1} className="h-[440px] overflow-hidden rounded-[36px] ring-1 ring-white/10"><MapFrame oid={b.oid} dark /></Reveal>
            </div>
          </section>
        </main>
        <footer className="border-t border-white/10 px-6 py-10 text-[13px] text-[#a39887] md:px-10"><div className="mx-auto flex max-w-[1320px] flex-wrap justify-between gap-4"><span>© 2026 HQ Beauty</span><span>Демо-концепт · дизайн и разработка — Артём</span></div></footer>
        <CallBar phone={b.phones[0]} barCls="bg-[#0b0a09]/90 backdrop-blur-xl border-t border-white/10" callCls="rounded-full ring-1 ring-white/20" bookCls="rounded-full text-[#17130c] bg-[#c8a46a]" />
        <div className="h-[72px] sm:hidden" />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
