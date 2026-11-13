import React, { useRef, useState, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, AnimatePresence, MotionConfig } from 'framer-motion'
import { ArrowUpRight, Phone, MapPin, RotateCcw } from 'lucide-react'
import '../lib/base.css'
import { B } from '../data'
import { useSmooth, Ribbon, SplitText, Reveal, Magnetic, Cursor, Marquee, Counter, useBooking, phoneFocus, CheckDraw, MapFrame, messengerLinks, CallBar, Progress, Intro, tel, useLite } from '../lib/kit'

const Paint = lazy(() => import('./palitra3d'))
const b = B.palitra
const INK = '#2b1f1a', BG = '#fbf7f2'
const FR = "font-['Fraunces',serif]"
const PAL = {
  base: ['#f6d7c3', '#e88a6a', '#b9c7e8', '#f3e6a6'],
  'Весна': ['#ffe3c4', '#ff9a76', '#a8e0b7', '#ffd36e'],
  'Лето': ['#e9e1f2', '#b9a3d6', '#9cc5d9', '#f2c4ce'],
  'Осень': ['#f1d6a8', '#c2672f', '#7a8a4a', '#8b3a2a'],
  'Зима': ['#eef3fb', '#1d2b5c', '#c8102e', '#7fb3d9'],
}
const ADVICE = {
  'Весна': 'Тёплые, светлые и сочные оттенки: персик, коралл, золотистый блонд, медовые блики.',
  'Лето': 'Холодные и приглушённые: пепельный блонд, лавандовые и пыльно-розовые тона.',
  'Осень': 'Тёплые и глубокие: медь, каштан, карамель, оливковые акценты в макияже.',
  'Зима': 'Контрастные и холодные: чистый чёрный, холодный шоколад, ягодные губы.',
}
const Q = [
  ['Какие вены на запястье?', [['Зеленоватые', 'w'], ['Синие или фиолетовые', 'c']]],
  ['Какой у вас природный контраст?', [['Мягкий, всё светлое или средне-светлое', 'l'], ['Яркий: тёмные волосы и светлая кожа', 'd']]],
  ['Какое украшение вам идёт больше?', [['Золото', 'w'], ['Серебро', 'c']]],
]
const result = a => { const warm = a.filter(x => x === 'w').length >= 2, deep = a[1] === 'd'; return warm ? (deep ? 'Осень' : 'Весна') : (deep ? 'Зима' : 'Лето') }
const SV = [['Окрашивание', 'Однотон, тонирование, сложные техники.'], ['Стрижки и укладки', 'Под форму лица и ваш ритм жизни.'], ['Маникюр', 'Покрытие в оттенке вашего цветотипа.'], ['Брови', 'Форма и цвет, которые подчёркивают лицо.'], ['Макияж', 'Дневной и вечерний — по вашей палитре.'], ['Уход', 'Процедуры для волос и кожи.']]

function Hero({ pal, lite }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const r = useTransform(scrollYProgress, [0, 1], ['0px', '48px'])
  const sc = useTransform(scrollYProgress, [0, 1], [1, .92])
  return (
    <section ref={ref} className="relative h-[100svh] min-h-[660px] p-0 md:p-3">
      <motion.div style={{ borderRadius: r, scale: sc }} className="relative h-full overflow-hidden">
        {!lite ? <Suspense fallback={null}><Paint palette={pal} /></Suspense> : <div className="absolute inset-0 transition-[background] duration-1000" style={{ background: `radial-gradient(60% 60% at 30% 30%, ${pal[1]}, transparent), radial-gradient(60% 60% at 70% 70%, ${pal[2]}, transparent), ${pal[0]}` }} />}
        <div className="pointer-events-none relative z-10 mx-auto flex h-full max-w-[1320px] flex-col justify-between px-6 pb-14 pt-24 md:px-10">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="self-start rounded-full bg-white/60 px-4 py-2 text-[13px] font-medium backdrop-blur" style={{ color: INK }}>Бьюти-студия · Притыцкого, 12</motion.p>
          <div>
            <h1 className={`${FR} text-[clamp(80px,15vw,260px)] font-light leading-[.8] tracking-[-.05em] mix-blend-multiply`} style={{ color: INK }}>
              <SplitText text="Palitra" delay={1.3} stagger={.06} />
            </h1>
            <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.9 }} className={`${FR} max-w-[520px] text-[clamp(22px,2.4vw,34px)] font-light italic leading-tight`} style={{ color: INK }}>Найдём оттенки, в которых вы — это вы. Поводите по краске.</motion.p>
              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.1 }} className="pointer-events-auto flex flex-wrap gap-3">
                <Magnetic><a href="#test" data-cursor="Тест" className="inline-flex h-14 items-center gap-3 rounded-full px-8 text-[15px] font-bold text-white" style={{ background: INK }}>Узнать цветотип <ArrowUpRight size={18} /></a></Magnetic>
                <a href="#book" className="inline-flex h-14 items-center gap-2 rounded-full bg-white/70 px-7 text-[15px] font-bold backdrop-blur" style={{ color: INK }}>Записаться</a>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

function Test({ season, setSeason }) {
  const [a, setA] = useState([])
  const done = a.length === Q.length
  const pick = v => { const n = [...a, v]; setA(n); if (n.length === Q.length) { setSeason(result(n)); setTimeout(() => window.__lenis ? window.__lenis.scrollTo(0) : scrollTo({ top: 0, behavior: 'smooth' }), 1600) } }
  return (
    <section id="test" className="px-6 py-28 md:px-10">
      <div className="mx-auto max-w-[1100px]">
        <p className="mb-4 text-[13px] font-bold uppercase tracking-[.2em] text-[#2b1f1a]/50">Мини-тест · 3 вопроса</p>
        <h2 className={`${FR} mb-12 text-[clamp(48px,7vw,110px)] font-light leading-[.9] tracking-[-.04em]`}>Ваш <i>цветотип</i></h2>
        <div className="relative min-h-[380px] overflow-hidden rounded-[40px] bg-white p-8 shadow-[0_30px_80px_-40px_rgba(43,31,26,.35)] md:p-14">
          <div className="mb-10 flex gap-2">{Q.map((_, k) => <span key={k} className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#2b1f1a]/10"><motion.span className="block h-full bg-[#2b1f1a]" animate={{ width: a.length > k ? '100%' : '0%' }} /></span>)}</div>
          <AnimatePresence mode="wait">
            {!done ? (
              <motion.div key={a.length} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: .4 }}>
                <h3 className={`${FR} mb-8 text-[clamp(30px,4vw,54px)] font-light leading-tight`}>{Q[a.length][0]}</h3>
                <div className="grid gap-3 sm:grid-cols-2">{Q[a.length][1].map(([t, v]) => <button key={t} onClick={() => pick(v)} className="rounded-3xl bg-[#fbf7f2] p-6 text-left text-[18px] font-medium ring-1 ring-[#2b1f1a]/10 transition-[box-shadow,transform] hover:-translate-y-1 hover:ring-[#2b1f1a]">{t}</button>)}</div>
              </motion.div>
            ) : (
              <motion.div key="res" initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }} className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
                <div>
                  <p className="text-[13px] font-bold uppercase tracking-[.2em] text-[#2b1f1a]/50">Скорее всего, вы</p>
                  <h3 className={`${FR} mb-4 text-[clamp(56px,8vw,120px)] font-light italic leading-none`}>{season}</h3>
                  <p className="mb-8 max-w-[480px] text-[17px] text-[#2b1f1a]/70">{ADVICE[season]} Шапка страницы уже перекрасилась в вашу палитру.</p>
                  <div className="flex flex-wrap gap-3">
                    <a href="#book" data-svc={`Подбор образа: ${season}`} className="inline-flex h-14 items-center gap-2 rounded-full px-7 font-bold text-white" style={{ background: INK }}>Записаться на подбор <ArrowUpRight size={18} /></a>
                    <button onClick={() => { setA([]); setSeason(null) }} className="inline-flex h-14 items-center gap-2 rounded-full px-6 font-bold ring-1 ring-[#2b1f1a]/20"><RotateCcw size={16} />Пройти заново</button>
                  </div>
                </div>
                <div className="flex gap-2 md:flex-col">{PAL[season].map((c, k) => <motion.span key={c} initial={{ scale: 0, rotate: -40 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: k * .1, type: 'spring' }} className="h-16 w-16 rounded-full ring-4 ring-white shadow-lg md:h-20 md:w-20" style={{ background: c }} />)}</div>
              </motion.div>
            )}
          </AnimatePresence>
          <p className="mt-10 text-[12px] text-[#2b1f1a]/40">Тест развлекательный — точный цветотип мастер определит вживую.</p>
        </div>
      </div>
    </section>
  )
}

function Services({ pal }) {
  return (
    <section id="services" className="px-6 py-20 md:px-10">
      <div className="mx-auto max-w-[1320px]">
        <h2 className={`${FR} mb-14 text-[clamp(48px,7vw,110px)] font-light leading-[.9] tracking-[-.04em]`}>Услуги <i>студии</i></h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SV.map(([t, d], k) => (
            <Reveal key={t} delay={k * .05}>
              <motion.a href="#book" data-svc={t} data-cursor="Запись" whileHover="h" className="group relative block overflow-hidden rounded-[36px] bg-white p-8">
                <motion.span variants={{ h: { scale: 9 } }} initial={{ scale: 1 }} transition={{ duration: .7, ease: [0.76, 0, 0.24, 1] }} className="absolute right-8 top-8 h-10 w-10 rounded-full transition-colors duration-1000" style={{ background: pal[k % 4] }} />
                <span className={`${FR} relative mb-16 block text-[15px] italic`}>0{k + 1}</span>
                <h3 className={`${FR} relative mb-2 text-[38px] font-light leading-none tracking-[-.02em]`}>{t}</h3>
                <p className="relative text-[#2b1f1a]/65">{d}</p>
              </motion.a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function Book({ pal }) {
  const bk = useBooking()
  const f = 'h-14 w-full rounded-full bg-white px-6 text-[16px] outline-none ring-1 ring-[#2b1f1a]/10 placeholder:text-[#2b1f1a]/35 focus:ring-2 focus:ring-[#2b1f1a]'
  return (
    <section id="book" className="px-6 py-28 md:px-10">
      <div className="relative mx-auto grid max-w-[1200px] gap-12 overflow-hidden rounded-[48px] p-8 md:grid-cols-2 md:p-16 transition-[background] duration-1000" style={{ background: `linear-gradient(135deg, ${pal[0]}, ${pal[3]})` }}>
        <div>
          <h2 className={`${FR} text-[clamp(52px,7vw,110px)] font-light leading-[.88] tracking-[-.04em]`}>Ваш <i>оттенок</i> ждёт</h2>
          <p className="mb-8 mt-6 max-w-[400px] text-[17px] text-[#2b1f1a]/70">Оставьте номер — администратор перезвонит и подберёт мастера.</p>
          {b.phones.map(p => <a key={p} href={'tel:' + tel(p)} className={`${FR} text-[36px]`}>{p}</a>)}
        </div>
        <AnimatePresence mode="wait">
          {!bk.s.sent ? (
            <motion.form key="f" exit={{ opacity: 0, y: -10 }} onSubmit={bk.submit} noValidate className="grid content-center gap-4">
              <input className={f} placeholder="Имя" value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} autoComplete="name" />
              <motion.input animate={bk.s.err ? { x: [0, -8, 8, -6, 6, 0] } : {}} className={f + (bk.s.err ? ' !ring-red-500' : '')} type="tel" inputMode="tel" placeholder="+375 (__) ___-__-__" value={bk.s.phone} onFocus={phoneFocus(bk)} onChange={e => bk.upd('phone', e.target.value)} autoComplete="tel" />
              <input className={f} placeholder="Услуга" value={bk.s.svc} onChange={e => bk.upd('svc', e.target.value)} />
              <button disabled={bk.s.loading} className="h-16 rounded-full text-[16px] font-bold text-white disabled:opacity-60" style={{ background: INK }}>{bk.s.loading ? 'Смешиваем краски…' : 'Записаться'}</button>
              <p className="text-[13px] text-[#2b1f1a]/55">В готовом сайте заявка сразу придёт вам в Telegram.</p>
            </motion.form>
          ) : (
            <motion.div key="ok" initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }} className="grid place-items-center text-center">
              <div><CheckDraw className="mx-auto mb-5" /><h3 className={`${FR} text-[48px] font-light italic`}>Заявка принята</h3><p className="mb-5 text-[#2b1f1a]/65">Так клиент увидит подтверждение.</p><button onClick={bk.reset} className="font-bold underline underline-offset-4">Ещё одна запись</button></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

function App() {
  useSmooth()
  const lite = useLite()
  const [season, setSeason] = useState(null)
  const pal = PAL[season || 'base']
  return (
    <MotionConfig reducedMotion="user">
      <div className="font-['DM_Sans',sans-serif]" style={{ background: BG, color: INK, '--sel': INK, '--selc': '#fff' }}>
        <Intro bg={BG} fg={INK} duration={1.5}><div className="flex gap-3">{PAL.base.map((c, k) => <motion.span key={c} className="h-14 w-14 rounded-full" style={{ background: c }} initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: k * .1, type: 'spring' }} />)}</div></Intro>
        <Progress color={INK} />
        <Cursor color={INK} blend="normal" textColor="#fff" />
        <Ribbon name={b.name} bg={INK} fg={BG} />
        <div className="relative"><header className="absolute inset-x-0 top-0 z-40 md:top-3">
          <div className="mx-auto flex h-[70px] max-w-[1320px] items-center justify-between px-6 md:px-10">
            <a href="#top" className={`${FR} text-[28px] italic`}>Palitra</a>
            <nav className="hidden gap-2 md:flex">{[['#test', 'Тест'], ['#services', 'Услуги'], ['#book', 'Запись'], ['#contacts', 'Контакты']].map(([h, t]) => <a key={h} href={h} className="rounded-full bg-white/50 px-4 py-2 text-[14px] font-medium backdrop-blur hover:bg-white">{t}</a>)}</nav>
            {season && <span className="rounded-full bg-white/70 px-4 py-2 text-[13px] font-bold backdrop-blur">Палитра: {season}</span>}
          </div>
        </header>
        <main id="top">
          <Hero pal={pal} lite={lite} />
          <Marquee base={-2} className="py-8">
            {['цвет', 'форма', 'свет', 'тон', 'блеск', 'оттенок'].map((t, k) => <span key={t} className={`${FR} mx-6 inline-flex items-center gap-12 text-[clamp(44px,6vw,96px)] font-light italic`}>{t}<span className="h-8 w-8 rounded-full transition-colors duration-1000" style={{ background: pal[k % 4] }} /></span>)}
          </Marquee>
          <Test season={season} setSeason={setSeason} />
          <Services pal={pal} />
          <section className="px-6 py-16 md:px-10">
            <div className="mx-auto grid max-w-[1320px] gap-5 md:grid-cols-3">
              {[[b.rev, 'оценок на Яндекс.Картах'], [4, 'цветотипа в мини-тесте'], [3, 'вопроса до вашей палитры']].map(([n, t]) => <Reveal key={t} className="rounded-[36px] bg-white p-10"><span className={`${FR} block text-[100px] font-light leading-none tracking-[-.05em]`}><Counter to={n} /></span><span className="text-[#2b1f1a]/60">{t}</span></Reveal>)}
            </div>
          </section>
          <Book pal={pal} />
          <section id="contacts" className="px-6 pb-28 md:px-10">
            <div className="mx-auto grid max-w-[1320px] gap-6 md:grid-cols-[.9fr_1.1fr]">
              <Reveal className="grid content-start gap-7">
                <h2 className={`${FR} text-[clamp(52px,7vw,110px)] font-light leading-[.9] tracking-[-.04em]`}>В <i>гости</i></h2>
                <p className="flex items-start gap-3 text-[22px]"><MapPin className="mt-1 shrink-0" />{b.addr}</p>
                {b.phones.map(p => <a key={p} href={'tel:' + tel(p)} className={`${FR} text-[36px]`}>{p}</a>)}
                <div className="flex flex-wrap gap-2">{messengerLinks(b).map(m => <a key={m.k} href={m.href} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-medium">{m.Icon && <m.Icon width={16} height={16} />}{m.label}</a>)}</div>
              </Reveal>
              <Reveal delay={.1} className="h-[420px] overflow-hidden rounded-[36px]"><MapFrame oid={b.oid} /></Reveal>
            </div>
          </section>
        </main></div>
        <footer className="px-6 py-10 text-[13px] text-[#2b1f1a]/50 md:px-10"><div className="mx-auto flex max-w-[1320px] flex-wrap justify-between gap-4"><span>© 2026 Palitra</span><span>Демо-концепт · дизайн и разработка — Артём</span></div></footer>
        <CallBar phone={b.phones[0]} barCls="bg-[#fbf7f2]/90 backdrop-blur-xl" callCls="rounded-full bg-white ring-1 ring-[#2b1f1a]/15" bookCls="rounded-full text-white bg-[#2b1f1a]" />
        <div className="h-[72px] sm:hidden" />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
