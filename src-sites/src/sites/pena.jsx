import React, { useRef, useState, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useMotionValueEvent, useScroll, useTransform, useSpring, AnimatePresence, MotionConfig } from 'framer-motion'
import { ArrowRight, Phone, MapPin, Droplets, Armchair, Sparkles, ShieldCheck, Wind, Gem } from 'lucide-react'
import '../lib/base.css'
import { B } from '../data'
import { LineReveal, useSmooth, Ribbon, SplitText, Reveal, Magnetic, Cursor, Marquee, Counter, useBooking, phoneFocus, CheckDraw, MapFrame, messengerLinks, CallBar, Progress, Intro, tel, useLite } from '../lib/kit'

const Foam = lazy(() => import('./pena3d'))
const b = B.pena
const INK = '#2b1d6b', P = '#7c5cff', PINK = '#ff6fc8', CY = '#3fe0ff'
const grad = `linear-gradient(120deg, ${CY}, ${P} 50%, ${PINK})`
const SV = [
  ['Мойка кузова', 'Активная пена, ручная мойка, сушка.', Droplets],
  ['Химчистка салона', 'Сиденья, потолок, ковры — до свежести.', Armchair],
  ['Мойка дисков', 'Отмываем тормозную пыль и битум.', Sparkles],
  ['Воск и защита', 'Гидрофобный слой — вода скатывается.', ShieldCheck],
  ['Чистка стёкол', 'Без разводов, изнутри и снаружи.', Wind],
  ['Комплекс', 'Кузов + салон за один визит.', Gem],
]
const DIRT = [
  ['Слегка пыльная', 'Мойка кузова', 'Хватит быстрой мойки — 20 минут, и машина блестит.'],
  ['Городская грязь', 'Кузов + диски', 'Отмоем кузов и диски от реагентов и тормозной пыли.'],
  ['После дачи', 'Кузов + салон', 'Снаружи — пена, внутри — пылесос и влажная уборка.'],
  ['После рыбалки', 'Комплекс + химчистка', 'Полная перезагрузка: химчистка салона и мойка всего, что можно.'],
]

function Hero({ lite }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const sc = useTransform(scrollYProgress, [0, 1], [1, .86])
  return (
    <section ref={ref} className="relative h-[100svh] min-h-[640px] overflow-hidden" style={{ background: 'radial-gradient(120% 90% at 50% 10%, #ffffff 0%, #efeaff 45%, #dcd2ff 100%)' }}>
      <div className="absolute inset-0">{!lite && <Suspense fallback={null}><Foam /></Suspense>}</div>
      {lite && <div className="absolute inset-0">{Array.from({ length: 14 }).map((_, i) => <motion.span key={i} className="absolute rounded-full ring-1 ring-white" style={{ left: `${(i * 37) % 100}%`, width: 30 + (i * 13) % 90, height: 30 + (i * 13) % 90, background: 'radial-gradient(circle at 30% 30%,#fff,rgba(160,140,255,.25))' }} animate={{ y: ['110vh', '-20vh'] }} transition={{ duration: 8 + i % 5, repeat: Infinity, delay: i * .6, ease: 'linear' }} />)}</div>}
      <motion.div style={{ y, scale: sc }} className="pointer-events-none relative z-10 mx-auto flex h-full max-w-[1280px] flex-col items-center justify-center px-6 text-center">
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.4 }} className="mb-6 rounded-full bg-white/70 px-5 py-2 text-[13px] font-bold text-[color:var(--p)] shadow-[0_10px_40px_-10px_rgba(124,92,255,.5)] backdrop-blur" style={{ '--p': P }}>Автомойка · химчистка · Ботаническая, 6</motion.p>
        <h1 className="font-['Fredoka',sans-serif] text-[clamp(64px,13vw,210px)] font-semibold leading-[.82] tracking-[-.02em]" style={{ color: INK }}>
          <SplitText text="Больше" delay={1.3} y="120%" rotate={8} className="block" />
          <LineReveal delay={1.5} className="pr-[.06em]"><span style={{ '--g': grad }} className="bg-clip-text text-transparent [background-image:var(--g)]">пены.</span></LineReveal>
        </h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }} className="mt-8 max-w-[480px] text-[17px] font-semibold text-[#5b4e93]">Лопните пару пузырей и запишитесь на мойку — мы отмоем машину так, что она будет пахнуть новой.</motion.p>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.2 }} className="pointer-events-auto mt-10 flex flex-wrap justify-center gap-3">
          <Magnetic><a href="#book" data-cursor="Пена!" className="inline-flex h-16 items-center gap-3 rounded-full px-9 text-[16px] font-extrabold text-white shadow-[0_20px_50px_-12px_rgba(124,92,255,.8)] transition-[scale] active:scale-[.95]" style={{ background: grad }}>Записаться <ArrowRight size={20} /></a></Magnetic>
          <a href={'tel:' + tel(b.phones[0])} className="inline-flex h-16 items-center gap-3 rounded-full bg-white px-8 text-[16px] font-bold shadow-[0_10px_30px_-10px_rgba(43,29,107,.35)]" style={{ color: INK }}><Phone size={18} />{b.phones[0]}</a>
        </motion.div>
      </motion.div>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3 }} className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-[12px] font-bold uppercase tracking-[.2em] text-[#8a7fc0]">{lite ? 'листайте вниз' : 'кликните по пузырю ✦ листайте вниз'}</motion.p>
    </section>
  )
}

/* sticky foam gauge: fills while you scroll through 3 steps */
function Steps() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const fill = useSpring(useTransform(scrollYProgress, [0, 1], ['8%', '100%']), { stiffness: 80, damping: 20 })
  const [i, setI] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', v => setI(Math.min(2, Math.floor(v * 3))))
  const ST = [['01', 'Пена', 'Мягкая активная пена растворяет грязь, не царапая лак.'], ['02', 'Руки', 'Ручная мойка в труднодоступных местах: пороги, решётка, диски.'], ['03', 'Блеск', 'Сушка, стёкла без разводов и защитный воск по желанию.']]
  return (
    <section ref={ref} className="relative h-[300vh]" style={{ background: INK }}>
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div className="mx-auto grid w-full max-w-[1280px] items-center gap-10 px-6 md:grid-cols-[1fr_auto_1fr] md:px-10">
          <div className="text-white">
            <p className="mb-4 text-[13px] font-bold uppercase tracking-[.2em] text-[#a99bff]">Как мы моем</p>
            <AnimatePresence mode="wait">
              <motion.div key={i} initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -40, filter: 'blur(10px)' }} transition={{ duration: .5 }}>
                <span className="font-['Fredoka',sans-serif] text-[22px] text-[#a99bff]">{ST[i][0]}</span>
                <h2 className="font-['Fredoka',sans-serif] text-[clamp(64px,9vw,140px)] font-semibold leading-[.9]">{ST[i][1]}</h2>
                <p className="mt-4 max-w-[380px] text-[18px] text-white/70">{ST[i][2]}</p>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="relative mx-auto h-[56vh] w-[120px] overflow-hidden rounded-full bg-white/10 ring-2 ring-white/20 md:w-[160px]">
            <motion.div style={{ height: fill, background: grad }} className="absolute inset-x-0 bottom-0">
              {Array.from({ length: 10 }).map((_, k) => <motion.span key={k} className="absolute rounded-full bg-white/70" style={{ left: `${(k * 23) % 90}%`, width: 8 + k % 4 * 6, height: 8 + k % 4 * 6 }} animate={{ bottom: ['0%', '100%'], opacity: [0, 1, 0] }} transition={{ duration: 2 + k % 3, repeat: Infinity, delay: k * .3 }} />)}
              <svg viewBox="0 0 160 30" preserveAspectRatio="none" className="absolute -top-[14px] left-0 h-[16px] w-full"><motion.path fill="#ffffff" fillOpacity=".9" animate={{ d: ['M0 30 Q20 0 40 15 T80 15 T120 15 T160 15 V30Z', 'M0 30 Q20 30 40 15 T80 10 T120 20 T160 10 V30Z', 'M0 30 Q20 0 40 15 T80 15 T120 15 T160 15 V30Z'] }} transition={{ duration: 2.4, repeat: Infinity }} /></svg>
            </motion.div>
            <span className="absolute inset-x-0 top-4 text-center font-['Fredoka',sans-serif] text-[13px] font-semibold uppercase tracking-widest text-white/70">пена-о-метр</span>
          </div>
          <div className="hidden gap-3 md:grid">{ST.map((s, k) => <div key={k} className={`rounded-3xl p-5 transition-colors duration-500 ${k === i ? 'bg-white text-[#2b1d6b]' : 'bg-white/5 text-white/50'}`}><b className="font-['Fredoka',sans-serif] text-[28px]">{s[1]}</b></div>)}</div>
        </div>
      </div>
    </section>
  )
}

function Picker() {
  const [v, setV] = useState(1)
  const d = DIRT[v]
  return (
    <section className="px-6 py-28 md:px-10" style={{ background: '#f4f1ff' }}>
      <div className="mx-auto max-w-[1100px]">
        <Reveal><h2 className="mb-3 text-center font-['Fredoka',sans-serif] text-[clamp(44px,6vw,88px)] font-semibold leading-[.95]" style={{ color: INK }}>Насколько всё <span className="bg-clip-text text-transparent" style={{ backgroundImage: grad }}>плохо?</span></h2></Reveal>
        <Reveal delay={.1}><p className="mb-14 text-center text-[17px] font-semibold text-[#6d62a6]">Подвиньте ползунок — подскажем, какая мойка нужна.</p></Reveal>
        <div className="grid items-center gap-10 rounded-[40px] bg-white p-8 shadow-[0_30px_80px_-30px_rgba(43,29,107,.35)] md:grid-cols-[1fr_1fr] md:p-14">
          <div className="relative grid aspect-[16/10] place-items-center overflow-hidden rounded-[28px]" style={{ background: '#e9e4ff' }}>
            <svg viewBox="0 0 600 240" className="relative z-10 w-[86%]" fill="none" stroke={INK} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M40 170v-30c0-14 8-22 22-25l76-14 70-50c12-8 26-13 40-13h138c16 0 30 6 42 16l56 48 50 8c20 3 30 16 30 34v26h-44" fill="#fff" />
              <circle cx="132" cy="174" r="38" fill="#fff" /><circle cx="452" cy="174" r="38" fill="#fff" />
              <path d="M226 60l-22 46h112V50M340 50v56h120l-50-44" />
            </svg>
            {Array.from({ length: 40 }).map((_, k) => <motion.span key={k} className="absolute z-20 rounded-full" style={{ left: `${(k * 41) % 95}%`, top: `${(k * 29) % 90}%`, width: 10 + (k % 5) * 8, height: 10 + (k % 5) * 6, background: '#7a5a34' }} animate={{ opacity: k < (v + 1) * 10 ? .65 : 0, scale: k < (v + 1) * 10 ? 1 : 0 }} transition={{ type: 'spring', bounce: .5 }} />)}
          </div>
          <div>
            <input type="range" min="0" max="3" step="1" value={v} onChange={e => setV(+e.target.value)} aria-label="Степень загрязнения" className="mb-6 h-3 w-full cursor-pointer appearance-none rounded-full [&::-webkit-slider-thumb]:h-9 [&::-webkit-slider-thumb]:w-9 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_4px_16px_rgba(43,29,107,.4)] [&::-webkit-slider-thumb]:ring-4 [&::-webkit-slider-thumb]:ring-[#7c5cff]" style={{ background: grad }} />
            <div className="mb-8 flex justify-between text-[12px] font-bold text-[#8a7fc0]">{DIRT.map((x, k) => <button key={k} onClick={() => setV(k)} className={k === v ? 'text-[#2b1d6b]' : ''}>{x[0]}</button>)}</div>
            <AnimatePresence mode="wait">
              <motion.div key={v} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <p className="text-[13px] font-bold uppercase tracking-[.16em] text-[#7c5cff]">Советуем</p>
                <h3 className="mb-3 font-['Fredoka',sans-serif] text-[44px] font-semibold leading-none" style={{ color: INK }}>{d[1]}</h3>
                <p className="mb-8 text-[16px] text-[#5b4e93]">{d[2]}</p>
                <a href="#book" data-svc={d[1]} className="inline-flex h-14 items-center gap-2 rounded-full px-7 font-extrabold text-white" style={{ background: INK }}>Записаться на «{d[1]}» <ArrowRight size={18} /></a>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}

function Services() {
  return (
    <section id="services" className="px-6 py-28 md:px-10" style={{ background: '#f4f1ff' }}>
      <div className="mx-auto max-w-[1280px]">
        <h2 className="mb-14 font-['Fredoka',sans-serif] text-[clamp(48px,7vw,110px)] font-semibold leading-[.9]" style={{ color: INK }}><SplitText text="Что отмоем" /></h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SV.map(([t, d, I], k) => (
            <Reveal key={t} delay={k * .06}>
              <motion.a href="#book" data-svc={t} data-cursor="Хочу" whileHover={{ scaleX: 1.04, scaleY: .96, rotate: k % 2 ? 1.5 : -1.5 }} transition={{ type: 'spring', stiffness: 400, damping: 8 }}
                className="group relative flex h-full flex-col overflow-hidden rounded-[36px] bg-white p-8 shadow-[0_20px_60px_-30px_rgba(43,29,107,.4)]">
                <span className="absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-70" style={{ background: grad }} />
                <span className="relative mb-10 grid h-16 w-16 place-items-center rounded-2xl text-white" style={{ background: grad }}><I size={28} /></span>
                <h3 className="relative mb-2 font-['Fredoka',sans-serif] text-[30px] font-semibold" style={{ color: INK }}>{t}</h3>
                <p className="relative text-[#6d62a6]">{d}</p>
              </motion.a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function Burst() {
  return <div className="pointer-events-none absolute inset-0 overflow-hidden">{Array.from({ length: 24 }).map((_, k) => { const a = k / 24 * 6.28; return <motion.span key={k} className="absolute left-1/2 top-1/2 rounded-full ring-2 ring-white/80" style={{ width: 14 + k % 4 * 10, height: 14 + k % 4 * 10, background: 'radial-gradient(circle at 30% 30%,#fff,rgba(124,92,255,.3))' }} initial={{ x: 0, y: 0, scale: 0 }} animate={{ x: Math.cos(a) * (140 + k % 3 * 80), y: Math.sin(a) * (140 + k % 3 * 80) - 60, scale: [0, 1, 0] }} transition={{ duration: 1.4, ease: 'easeOut' }} /> })}</div>
}

function Book() {
  const bk = useBooking()
  const f = 'h-14 w-full rounded-2xl bg-white/10 px-5 text-[17px] text-white outline-none ring-1 ring-white/15 placeholder:text-white/40 focus:ring-2 focus:ring-[#3fe0ff]'
  return (
    <section id="book" className="relative overflow-hidden px-6 py-28 md:px-10" style={{ background: INK }}>
      <div className="absolute -left-40 top-0 h-[500px] w-[500px] rounded-full opacity-40 blur-[120px]" style={{ background: CY }} />
      <div className="absolute -right-40 bottom-0 h-[500px] w-[500px] rounded-full opacity-40 blur-[120px]" style={{ background: PINK }} />
      <div className="relative mx-auto grid max-w-[1180px] gap-12 md:grid-cols-2">
        <div className="text-white">
          <h2 className="font-['Fredoka',sans-serif] text-[clamp(52px,7vw,110px)] font-semibold leading-[.88]"><SplitText text="Займите" className="block" /><span className="block bg-clip-text text-transparent" style={{ backgroundImage: grad }}>бокс</span></h2>
          <p className="mb-8 mt-6 max-w-[400px] text-[17px] text-white/70">Оставьте номер — перезвоним и предложим ближайшее свободное время. Без очереди.</p>
          {b.phones.map(p => <a key={p} href={'tel:' + tel(p)} className="font-['Fredoka',sans-serif] text-[38px] font-semibold">{p}</a>)}
        </div>
        <div className="relative rounded-[36px] bg-white/[.06] p-8 ring-1 ring-white/15 backdrop-blur-xl md:p-10">
          <AnimatePresence mode="wait">
            {!bk.s.sent ? (
              <motion.form key="f" exit={{ opacity: 0, scale: .9 }} onSubmit={bk.submit} noValidate className="grid gap-4">
                <input className={f} placeholder="Ваше имя" value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} autoComplete="name" />
                <motion.input animate={bk.s.err ? { x: [0, -8, 8, -6, 6, 0] } : {}} className={f + (bk.s.err ? ' ring-2 !ring-red-400' : '')} type="tel" inputMode="tel" placeholder="+375 (__) ___-__-__" value={bk.s.phone} onFocus={phoneFocus(bk)} onChange={e => bk.upd('phone', e.target.value)} autoComplete="tel" />
                <div className="flex flex-wrap gap-2">{[...SV.map(s => s[0]), ...DIRT.map(d => d[1]).slice(1)].filter((x, i, a) => a.indexOf(x) === i).slice(0, 8).map(t => <button type="button" key={t} onClick={() => bk.upd('svc', t)} className={`rounded-full px-4 py-2 text-[13px] font-bold transition-colors ${bk.s.svc === t ? 'bg-white text-[#2b1d6b]' : 'bg-white/10 text-white/80 hover:bg-white/20'}`}>{t}</button>)}</div>
                <button disabled={bk.s.loading} className="mt-2 h-16 rounded-2xl text-[17px] font-extrabold text-white transition-[scale,opacity] active:scale-[.97] disabled:opacity-60" style={{ background: grad }}>{bk.s.loading ? 'Взбиваем пену…' : 'Записаться'}</button>
                <p className="text-[13px] text-white/50">В готовом сайте заявка сразу придёт вам в Telegram.</p>
              </motion.form>
            ) : (
              <motion.div key="ok" initial={{ opacity: 0, scale: .8 }} animate={{ opacity: 1, scale: 1 }} className="relative grid min-h-[340px] place-items-center text-center text-white">
                <Burst />
                <div><CheckDraw className="mx-auto mb-5 text-[#3fe0ff]" /><h3 className="font-['Fredoka',sans-serif] text-[44px] font-semibold">Пена уже взбивается!</h3><p className="mb-5 text-white/70">Так клиент увидит подтверждение. Перезвоним за 15 минут.</p><button onClick={bk.reset} className="font-bold underline underline-offset-4">Ещё одна запись</button></div>
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
      <div className="font-['Nunito',sans-serif]" style={{ background: '#f4f1ff', color: INK, '--sel': P, '--selc': '#fff' }}>
        <Intro bg="#f4f1ff" fg={INK} duration={1.4}>
          <div className="relative">{[0, 1, 2].map(k => <motion.span key={k} className="absolute left-1/2 top-1/2 block rounded-full ring-2 ring-[#7c5cff]" initial={{ width: 0, height: 0, x: '-50%', y: '-50%', opacity: 1 }} animate={{ width: 260, height: 260, opacity: 0 }} transition={{ duration: 1.2, delay: k * .2 }} />)}<span className="font-['Fredoka',sans-serif] text-[64px] font-semibold">пена</span></div>
        </Intro>
        <Progress color={P} />
        <Cursor color={P} blend="normal" textColor="#fff" />
        <Ribbon name={b.name} bg={INK} fg="#fff" />
        <header className="sticky top-0 z-40 bg-white/60 backdrop-blur-xl">
          <div className="mx-auto flex h-[70px] max-w-[1280px] items-center justify-between px-6 md:px-10">
            <a href="#top" className="flex items-center gap-2 font-['Fredoka',sans-serif] text-[28px] font-semibold"><span className="h-7 w-7 rounded-full ring-2 ring-white" style={{ background: grad }} />пена</a>
            <nav className="hidden gap-8 text-[15px] font-bold text-[#6d62a6] md:flex">{[['#services', 'Услуги'], ['#book', 'Запись'], ['#contacts', 'Контакты']].map(([h, t]) => <a key={h} href={h} className="hover:text-[#2b1d6b]">{t}</a>)}</nav>
            <a href="#book" className="hidden h-11 items-center rounded-full px-6 text-[14px] font-extrabold text-white sm:inline-flex" style={{ background: INK }}>Записаться</a>
          </div>
        </header>
        <main id="top">
          <Hero lite={lite} />
          <Marquee base={-2.5} className="py-6" skew={false}>
            {['мойка', 'химчистка', 'диски', 'воск', 'стёкла', 'салон'].map(t => <span key={t} className="mx-6 inline-flex items-center gap-12 font-['Fredoka',sans-serif] text-[clamp(40px,5vw,72px)] font-semibold" style={{ color: INK }}>{t}<span className="inline-block h-8 w-8 rounded-full" style={{ background: grad }} /></span>)}
          </Marquee>
          <Steps />
          <Services />
          <Picker />
          <section className="px-6 pb-28 md:px-10" style={{ background: '#f4f1ff' }}>
            <div className="mx-auto grid max-w-[1280px] gap-5 md:grid-cols-3">
              {[[b.rev, 'оценок на Яндекс.Картах'], [6, 'видов услуг под одной крышей'], [60, 'секунд — онлайн-запись']].map(([n, t], k) => (
                <Reveal key={t} delay={k * .08} className="rounded-[36px] bg-white p-10 shadow-[0_20px_60px_-30px_rgba(43,29,107,.4)]"><span className="block bg-clip-text font-['Fredoka',sans-serif] text-[88px] font-semibold leading-none text-transparent" style={{ backgroundImage: grad }}><Counter to={n} /></span><span className="font-semibold text-[#6d62a6]">{t}</span></Reveal>
              ))}
            </div>
          </section>
          <Book />
          <section id="contacts" className="px-6 py-28 md:px-10" style={{ background: '#f4f1ff' }}>
            <div className="mx-auto grid max-w-[1280px] gap-6 md:grid-cols-[.9fr_1.1fr]">
              <Reveal className="grid content-start gap-7">
                <h2 className="font-['Fredoka',sans-serif] text-[clamp(52px,7vw,100px)] font-semibold leading-[.9]">Мы тут</h2>
                <p className="flex items-start gap-3 text-[24px] font-bold"><MapPin className="mt-1 shrink-0 text-[#7c5cff]" />{b.addr}</p>
                {b.phones.map(p => <a key={p} href={'tel:' + tel(p)} className="font-['Fredoka',sans-serif] text-[36px] font-semibold">{p}</a>)}
                <div className="flex flex-wrap gap-2">{messengerLinks(b).map(m => <a key={m.k} href={m.href} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-bold shadow-sm">{m.Icon && <m.Icon width={16} height={16} />}{m.label}</a>)}</div>
              </Reveal>
              <Reveal delay={.1} className="h-[420px] overflow-hidden rounded-[36px] shadow-[0_20px_60px_-30px_rgba(43,29,107,.4)]"><MapFrame oid={b.oid} /></Reveal>
            </div>
          </section>
        </main>
        <footer className="px-6 py-10 text-[14px] font-semibold text-[#8a7fc0] md:px-10" style={{ background: '#f4f1ff' }}><div className="mx-auto flex max-w-[1280px] flex-wrap justify-between gap-4"><span>© 2026 Пена</span><span>Демо-концепт · дизайн и разработка — Артём</span></div></footer>
        <CallBar phone={b.phones[0]} barCls="bg-white/80 backdrop-blur-xl" callCls="rounded-2xl bg-white text-[#2b1d6b] ring-1 ring-[#2b1d6b]/15" bookCls="rounded-2xl text-white bg-[#7c5cff]" />
        <div className="h-[72px] sm:hidden" />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
