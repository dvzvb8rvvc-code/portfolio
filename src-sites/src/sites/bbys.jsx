import React, { useRef, useState, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, AnimatePresence, MotionConfig } from 'framer-motion'
import { ArrowUpRight, Phone, MapPin, Heart, Sparkles, Eye, Hand, Star, Users } from 'lucide-react'
import '../lib/base.css'
import { B } from '../data'
import { useSmooth, Ribbon, Reveal, Magnetic, Cursor, Marquee, Counter, useBooking, phoneFocus, CheckDraw, MapFrame, messengerLinks, CallBar, Progress, Intro, tel, useLite, Tilt, SplitText } from '../lib/kit'

const Chrome = lazy(() => import('./bbys3d'))
const b = B.bbys
const HOT = '#ff2d8f', INK = '#2a0a1c', BG = '#ffe4f1'
const G = "font-['Bricolage_Grotesque',sans-serif]", S = "font-['Instrument_Serif',serif]"
const chrome = 'linear-gradient(180deg,#fff 0%,#ffc2df 30%,#ff7ab8 50%,#ffe6f2 52%,#ff9fcb 80%,#fff 100%)'
const SV = [
  ['Маникюр', 'С покрытием, френч, дизайн — без спешки.', Hand, '#ffb3d6'],
  ['Педикюр', 'Аппаратный, с покрытием, уход для стоп.', Sparkles, '#ffd27a'],
  ['Брови', 'Коррекция, окрашивание, ламинирование.', Eye, '#b9e4ff'],
  ['Ресницы', 'Наращивание и ламинирование.', Star, '#d9c4ff'],
  ['Дизайн', 'Хром, стразы, 3D, рисунки — под ваш вайб.', Heart, '#ffb3d6'],
  ['Вдвоём', 'Приходите с подругой — сядете рядом.', Users, '#bff5d6'],
]
const LOOKS = [
  ['Хром', 'linear-gradient(135deg,#fff,#c9c9d6 30%,#fff 50%,#9a9aae)'],
  ['Клубничное молоко', 'linear-gradient(160deg,#ffe0ec,#ffb3cf)'],
  ['Черри', 'linear-gradient(160deg,#c3002f,#5a0016)'],
  ['Френч', 'linear-gradient(180deg,#f7e3d8 70%,#fff 70%)'],
  ['Аура', 'radial-gradient(circle at 50% 60%,#ff5fb0,#ffd6ea 60%,#b9e4ff)'],
  ['Кошачий глаз', 'linear-gradient(110deg,#1a0b2e 30%,#c9a7ff 50%,#1a0b2e 70%)'],
]

function Sparkle({ className, style }) {
  return <svg viewBox="0 0 40 40" className={className} style={style} aria-hidden="true"><path d="M20 0C21 12 28 19 40 20 28 21 21 28 20 40 19 28 12 21 0 20 12 19 19 12 20 0Z" fill="currentColor" /></svg>
}

function Hero({ lite }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '25%'])
  return (
    <section ref={ref} className="relative h-[100svh] min-h-[660px] overflow-hidden" style={{ background: `radial-gradient(90% 70% at 50% 35%, #fff 0%, ${BG} 55%, #ffc4df 100%)` }}>
      {[['left-[8%] top-[18%] w-10', 0], ['right-[12%] top-[26%] w-6', .5], ['left-[18%] bottom-[22%] w-7', 1], ['right-[20%] bottom-[30%] w-12', 1.5]].map(([c, d], k) => (
        <motion.div key={k} className={`absolute ${c} text-[#ff2d8f]`} animate={{ rotate: [0, 90, 180], scale: [1, .6, 1] }} transition={{ duration: 3, repeat: Infinity, delay: d }}><Sparkle /></motion.div>
      ))}
      <div className="absolute inset-0">{!lite ? <Suspense fallback={null}><Chrome /></Suspense> :
        <div className={`${G} absolute inset-x-0 top-[22%] text-center text-[30vw] font-extrabold leading-none text-transparent`} style={{ backgroundImage: chrome, WebkitBackgroundClip: 'text' }}>bby's</div>}</div>
      <motion.div style={{ y }} className="pointer-events-none relative z-10 mx-auto flex h-full max-w-[1280px] flex-col items-center justify-end px-6 pb-20 text-center">
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5 }} className={`${S} text-[clamp(30px,4.5vw,64px)] italic leading-none`} style={{ color: INK }}>nail bar, brows & lashes</motion.p>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }} className="mt-4 max-w-[440px] text-[16px] font-medium text-[#7a3c5c]">Немига, 3 · маникюр, педикюр, брови и ресницы в одном месте. Приходите одна или с бестис.</motion.p>
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2 }} className="pointer-events-auto mt-8 flex flex-wrap justify-center gap-3">
          <Magnetic><a href="#book" data-cursor="xoxo" className={`${G} inline-flex h-14 items-center gap-2 rounded-full px-8 text-[16px] font-extrabold text-white shadow-[0_14px_40px_-10px_rgba(255,45,143,.8)] transition-[scale] active:scale-[.95]`} style={{ background: HOT }}>Записаться <Heart size={18} fill="#fff" /></a></Magnetic>
          <a href={'tel:' + tel(b.phones[0])} className={`${G} inline-flex h-14 items-center gap-2 rounded-full bg-white/80 px-7 text-[15px] font-semibold backdrop-blur`} style={{ color: INK }}><Phone size={16} />{b.phones[0]}</a>
        </motion.div>
      </motion.div>
    </section>
  )
}

/* drag-able lookbook of nail looks */
function Lookbook() {
  const wrap = useRef(null)
  const [pick, setPick] = useState(null)
  return (
    <section className="overflow-hidden py-28" style={{ background: INK }}>
      <div className="mx-auto mb-12 flex max-w-[1280px] flex-wrap items-end justify-between gap-6 px-6 md:px-10">
        <h2 className={`${G} text-[clamp(48px,7vw,112px)] font-extrabold leading-[.85] tracking-[-.04em] text-white`}>Лукбук<br /><span className={`${S} font-normal italic tracking-normal text-[#ff9fcb]`}>потяните →</span></h2>
        <p className="max-w-[320px] text-white/60">Тащите ленту и выберите вайб — мастер повторит или придумает похожее под вас.</p>
      </div>
      <div ref={wrap} className="px-6 md:px-10">
        <motion.div drag="x" dragConstraints={wrap} dragElastic={.12} className="flex w-max cursor-grab gap-5 active:cursor-grabbing">
          {LOOKS.map(([n, bg], k) => (
            <Tilt key={n} max={12} className="w-[260px] shrink-0 md:w-[300px]">
              <button onClick={() => setPick(n)} data-cursor="Хочу" className={`block w-full rounded-[36px] p-4 text-left transition-[box-shadow] ${pick === n ? 'ring-4 ring-[#ff2d8f]' : ''}`} style={{ background: '#3a1428' }}>
                <div className="relative grid aspect-[4/5] place-items-center overflow-hidden rounded-[28px]" style={{ background: '#ffe4f1' }}>
                  <div className="flex items-end gap-2">{[78, 96, 104, 92, 66].map((h, i) => <span key={i} className="block w-9 rounded-t-full shadow-[inset_-4px_-6px_10px_rgba(0,0,0,.15)]" style={{ height: h * 1.35, background: bg, transform: `rotate(${(i - 2) * 6}deg)` }} />)}</div>
                  <Sparkle className="absolute right-5 top-5 w-6 text-white" />
                </div>
                <div className="flex items-center justify-between px-2 pb-1 pt-4"><span className={`${S} text-[28px] italic text-white`}>{n}</span><span className="text-[13px] text-white/40">0{k + 1}</span></div>
              </button>
            </Tilt>
          ))}
        </motion.div>
      </div>
      <AnimatePresence>{pick && <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-10 text-center"><a href="#book" data-svc={`Маникюр, дизайн «${pick}»`} className={`${G} inline-flex h-14 items-center gap-2 rounded-full px-8 font-extrabold text-white`} style={{ background: HOT }}>Записаться на «{pick}» <ArrowUpRight size={18} /></a></motion.div>}</AnimatePresence>
    </section>
  )
}

function Book() {
  const bk = useBooking()
  const [duo, setDuo] = useState(false)
  const [friend, setFriend] = useState('')
  const f = `${G} h-14 w-full rounded-full bg-white px-6 text-[16px] outline-none ring-2 ring-transparent placeholder:text-[#c58aa8] focus:ring-[#ff2d8f]`
  return (
    <section id="book" className="relative overflow-hidden px-6 py-28 md:px-10" style={{ background: BG }}>
      <div className="mx-auto grid max-w-[1180px] items-center gap-12 md:grid-cols-2">
        <div>
          <h2 className={`${G} text-[clamp(52px,7vw,112px)] font-extrabold leading-[.85] tracking-[-.04em]`} style={{ color: INK }}>Бронь<br /><span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(90deg,${HOT},#ff8cc6)` }}>для тебя</span></h2>
          <p className="mb-8 mt-6 max-w-[400px] text-[17px] text-[#7a3c5c]">Оставь номер — перезвоним и подберём время. Хочешь с подругой? Включи «вдвоём», посадим рядом.</p>
          {b.phones.map(p => <a key={p} href={'tel:' + tel(p)} className={`${G} text-[34px] font-extrabold`} style={{ color: INK }}>{p}</a>)}
        </div>
        <div className="rounded-[40px] bg-white/50 p-6 shadow-[0_30px_80px_-30px_rgba(255,45,143,.5)] ring-1 ring-white backdrop-blur-xl md:p-10">
          <AnimatePresence mode="wait">
            {!bk.s.sent ? (
              <motion.form key="f" exit={{ opacity: 0, scale: .95 }} onSubmit={e => { if (duo && friend) bk.upd('svc', (bk.s.svc || 'Маникюр') + ` · вдвоём с ${friend}`); bk.submit(e) }} noValidate className="grid gap-4">
                <button type="button" onClick={() => setDuo(!duo)} className={`${G} flex h-14 items-center justify-between rounded-full px-6 font-bold transition-colors ${duo ? 'text-white' : 'bg-white text-[#2a0a1c]'}`} style={duo ? { background: HOT } : undefined}>
                  <span className="flex items-center gap-2"><Users size={18} />Вдвоём с подругой</span>
                  <span className={`relative h-7 w-12 rounded-full transition-colors ${duo ? 'bg-white/30' : 'bg-[#ffd0e4]'}`}><motion.span layout className="absolute top-1 h-5 w-5 rounded-full bg-white shadow" style={{ left: duo ? 24 : 4 }} /></span>
                </button>
                <input className={f} placeholder="Твоё имя" value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} autoComplete="name" />
                <AnimatePresence>{duo && <motion.input initial={{ height: 0, opacity: 0 }} animate={{ height: 56, opacity: 1 }} exit={{ height: 0, opacity: 0 }} className={f} placeholder="Имя подруги" value={friend} onChange={e => setFriend(e.target.value)} />}</AnimatePresence>
                <motion.input animate={bk.s.err ? { x: [0, -8, 8, -6, 6, 0] } : {}} className={f + (bk.s.err ? ' !ring-red-400' : '')} type="tel" inputMode="tel" placeholder="+375 (__) ___-__-__" value={bk.s.phone} onFocus={phoneFocus(bk)} onChange={e => bk.upd('phone', e.target.value)} autoComplete="tel" />
                <div className="flex flex-wrap gap-2">{SV.slice(0, 5).map(([t]) => <button type="button" key={t} onClick={() => bk.upd('svc', t)} className={`${G} rounded-full px-4 py-2 text-[14px] font-semibold transition-colors ${bk.s.svc === t ? 'bg-[#2a0a1c] text-white' : 'bg-white text-[#7a3c5c]'}`}>{t}</button>)}</div>
                {bk.s.svc && !SV.some(s => s[0] === bk.s.svc) && <p className="text-[14px] text-[#7a3c5c]">Выбрано: {bk.s.svc}</p>}
                <button disabled={bk.s.loading} className={`${G} h-16 rounded-full text-[17px] font-extrabold text-white transition-[scale,opacity] active:scale-[.97] disabled:opacity-60`} style={{ background: HOT }}>{bk.s.loading ? 'Секунду…' : duo ? 'Записать нас двоих' : 'Записаться'}</button>
                <p className="text-[13px] text-[#a0688a]">В готовом сайте заявка сразу придёт вам в Telegram.</p>
              </motion.form>
            ) : (
              <motion.div key="ok" initial={{ opacity: 0, scale: .9, rotate: -3 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} className="grid place-items-center py-10 text-center" style={{ color: INK }}>
                <div><CheckDraw className="mx-auto mb-5 text-[#ff2d8f]" /><h3 className={`${S} text-[52px] italic`}>see you, bby!</h3><p className="mb-5 text-[#7a3c5c]">Так клиент увидит подтверждение.</p><button onClick={() => { bk.reset(); setFriend('') }} className="font-semibold underline underline-offset-4">Ещё одна запись</button></div>
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
      <div className={`${G}`} style={{ background: BG, color: INK, '--sel': HOT, '--selc': '#fff' }}>
        <Intro bg={HOT} fg="#fff" duration={1.4}><span className={`${S} text-[90px] italic`}><SplitText text="bby's" stagger={.07} /></span></Intro>
        <Progress color={HOT} />
        <Cursor color={HOT} blend="normal" textColor="#fff" />
        <Ribbon name={b.name} bg={INK} fg="#ffd6ea" />
        <header className="sticky top-0 z-40 bg-[#ffe4f1]/70 backdrop-blur-xl">
          <div className="mx-auto flex h-[70px] max-w-[1280px] items-center justify-between px-6 md:px-10">
            <a href="#top" className="text-[26px] font-extrabold tracking-[-.04em]">bby's<span className={`${S} ml-1 font-normal italic text-[#ff2d8f]`}>beauty</span></a>
            <nav className="hidden gap-8 text-[15px] font-semibold text-[#7a3c5c] md:flex">{[['#services', 'Услуги'], ['#book', 'Бронь'], ['#contacts', 'Где мы']].map(([h, t]) => <a key={h} href={h} className="hover:text-[#ff2d8f]">{t}</a>)}</nav>
            <a href="#book" className="hidden h-11 items-center rounded-full px-6 text-[15px] font-bold text-white sm:inline-flex" style={{ background: INK }}>Записаться</a>
          </div>
        </header>
        <main id="top">
          <Hero lite={lite} />
          <Marquee base={-3} className="bg-[#ff2d8f] py-5 text-white" skew={false}>
            {['nails', 'brows', 'lashes', 'chrome', 'french', 'bestie mode'].map(t => <span key={t} className={`${S} mx-6 inline-flex items-center gap-12 text-[clamp(40px,5vw,72px)] italic`}>{t}<Sparkle className="w-8 text-white" /></span>)}
          </Marquee>
          <section id="services" className="px-6 py-28 md:px-10">
            <div className="mx-auto max-w-[1280px]">
              <h2 className="mb-14 text-[clamp(48px,7vw,112px)] font-extrabold leading-[.85] tracking-[-.04em]">Меню <span className={`${S} font-normal italic tracking-normal text-[#ff2d8f]`}>красоты</span></h2>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {SV.map(([t, d, I, c], k) => (
                  <Reveal key={t} delay={k * .05}>
                    <motion.a href="#book" data-svc={t} whileHover={{ y: -8, rotate: k % 2 ? 2 : -2 }} className="group relative flex h-full flex-col overflow-hidden rounded-[36px] bg-white p-8 shadow-[0_20px_50px_-25px_rgba(255,45,143,.45)]">
                      <span className="absolute -right-8 -top-8 h-36 w-36 rounded-full transition-transform duration-500 group-hover:scale-150" style={{ background: c }} />
                      <span className="relative mb-12 grid h-14 w-14 place-items-center rounded-full bg-white shadow-md"><I size={24} color={HOT} /></span>
                      <h3 className="relative mb-2 text-[34px] font-extrabold tracking-[-.03em]">{t}</h3>
                      <p className="relative text-[#7a3c5c]">{d}</p>
                    </motion.a>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
          <Lookbook />
          <section className="px-6 py-24 md:px-10">
            <div className="mx-auto grid max-w-[1280px] gap-5 md:grid-cols-3">
              {[[b.rev, 'оценок на Яндекс.Картах'], [4, 'направления: ногти, брови, ресницы, дизайн'], [2, 'места рядом — для вас и подруги']].map(([n, t]) => <Reveal key={t} className="rounded-[36px] bg-white p-10"><span className="block bg-clip-text text-[96px] font-extrabold leading-none tracking-[-.05em] text-transparent" style={{ backgroundImage: `linear-gradient(90deg,${HOT},#ff8cc6)` }}><Counter to={n} /></span><span className="text-[#7a3c5c]">{t}</span></Reveal>)}
            </div>
          </section>
          <Book />
          <section id="contacts" className="px-6 pb-28 md:px-10">
            <div className="mx-auto grid max-w-[1280px] gap-6 md:grid-cols-[.9fr_1.1fr]">
              <Reveal className="grid content-start gap-7">
                <h2 className="text-[clamp(48px,7vw,100px)] font-extrabold leading-[.85] tracking-[-.04em]">Где <span className={`${S} font-normal italic text-[#ff2d8f]`}>мы</span></h2>
                <p className="flex items-start gap-3 text-[22px] font-semibold"><MapPin className="mt-1 shrink-0 text-[#ff2d8f]" />{b.addr}</p>
                {b.phones.map(p => <a key={p} href={'tel:' + tel(p)} className="text-[32px] font-extrabold">{p}</a>)}
                <div className="flex flex-wrap gap-2">{messengerLinks(b).map(m => <a key={m.k} href={m.href} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-semibold">{m.Icon && <m.Icon width={16} height={16} />}{m.label}</a>)}</div>
              </Reveal>
              <Reveal delay={.1} className="h-[420px] overflow-hidden rounded-[36px] ring-4 ring-white"><MapFrame oid={b.oid} /></Reveal>
            </div>
          </section>
        </main>
        <footer className="px-6 py-10 text-[14px] text-[#a0688a] md:px-10"><div className="mx-auto flex max-w-[1280px] flex-wrap justify-between gap-4"><span>© 2026 Bby's Beauty</span><span>Демо-концепт · дизайн и разработка — Артём</span></div></footer>
        <CallBar phone={b.phones[0]} barCls="bg-[#ffe4f1]/85 backdrop-blur-xl" callCls="rounded-full bg-white" bookCls="rounded-full text-white bg-[#ff2d8f]" />
        <div className="h-[72px] sm:hidden" />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
