import React, { useRef, useState, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, AnimatePresence, MotionConfig, useMotionValueEvent } from 'framer-motion'
import { ArrowRight, Phone, MapPin, Disc3, Gauge, Wrench, Snowflake, Calendar, CircleDot, Check } from 'lucide-react'
import '../lib/base.css'
import { B } from '../data'
import { useSmooth, Ribbon, SplitText, Reveal, Magnetic, Cursor, Counter, Tilt, useBooking, phoneFocus, CheckDraw, MapFrame, messengerLinks, CallBar, Progress, tel, useIsMobile } from '../lib/kit'

const Wheel = lazy(() => import('./tire3d'))
const b = B.tire
const BL = '#1f5eff'
const SV = [['Шиномонтаж', 'Легковые, кроссоверы, внедорожники.', Disc3], ['Балансировка', 'Стенды с точной калибровкой.', Gauge], ['Ремонт шин', 'Проколы, порезы, герметичность.', CircleDot], ['Заправка кондиционера', 'Проверка системы и фреон.', Snowflake], ['Ремонт кондиционера', 'Поиск утечек, замена деталей.', Wrench], ['Сезонная переобувка', 'По записи — без очереди.', Calendar]]
const LABELS = [
  { t: 'Шина', d: 'Монтаж и демонтаж, ремонт проколов и порезов', at: [0.25, 0.5] },
  { t: 'Диск', d: 'Балансировка на точных стендах — без вибраций', at: [0.45, 0.7] },
  { t: 'Ступица', d: 'Проверка креплений и момент затяжки', at: [0.65, 0.95] },
]
const m = new Date().getMonth()
const SEASON = m >= 9 && m <= 11 ? 'Сезон зимней переобувки' : m >= 2 && m <= 4 ? 'Сезон летней переобувки' : 'Кондиционер — без очереди'

function Label({ p, l, i }) {
  const o = useTransform(p, [l.at[0], l.at[0] + .06, l.at[1] - .06, l.at[1]], [0, 1, 1, 0])
  const y = useTransform(p, [l.at[0], l.at[0] + .08], [30, 0])
  return (
    <motion.div style={{ opacity: o, y }} className={`absolute ${['left-[6%] top-[22%]', 'right-[6%] top-[40%]', 'left-[8%] bottom-[18%]'][i]} max-w-[280px] rounded-3xl bg-white/90 p-6 shadow-[0_20px_60px_rgba(11,20,36,.12)] backdrop-blur`}>
      <span className="mb-2 inline-flex items-center gap-2 text-[13px] font-bold text-[#1f5eff]"><span className="h-2 w-2 rounded-full bg-[#1f5eff]" />0{i + 1}</span>
      <h3 className="mb-1 text-[26px] font-extrabold tracking-[-.03em]">{l.t}</h3>
      <p className="text-[15px] text-[#5d6b80]">{l.d}</p>
    </motion.div>
  )
}

function Explode() {
  const ref = useRef(null)
  const mobile = useIsMobile()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const title = useTransform(scrollYProgress, [0, .15], [1, 0])
  const titleY = useTransform(scrollYProgress, [0, .15], [0, -60])
  return (
    <section ref={ref} className="relative h-[320vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_45%,#ffffff,#eef2f8_70%)]" />
        <div className="absolute inset-0"><Suspense fallback={null}><Wheel progress={scrollYProgress} mobile={mobile} /></Suspense></div>
        <motion.div style={{ opacity: title, y: titleY }} className="pointer-events-none absolute inset-x-0 top-[10%] text-center">
          <p className="mb-3 text-[13px] font-bold uppercase tracking-[.2em] text-[#1f5eff]">Что мы делаем с колесом</p>
          <h2 className="text-[clamp(36px,5vw,68px)] font-extrabold tracking-[-.04em]">Разберём по деталям</h2>
          <p className="mt-2 text-[#5d6b80]">Листайте вниз ↓</p>
        </motion.div>
        {LABELS.map((l, i) => <Label key={l.t} p={scrollYProgress} l={l} i={i} />)}
      </div>
    </section>
  )
}

function Locations() {
  const [i, setI] = useState(0)
  const L = b.locs[i]
  return (
    <section id="locations" className="mx-auto max-w-[1200px] px-5 py-24">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <h2 className="text-[clamp(36px,4.6vw,60px)] font-extrabold tracking-[-.04em]"><SplitText text="Два адреса" mode="words" /></h2>
        <div className="inline-flex rounded-2xl bg-white p-1.5 shadow-[0_8px_30px_rgba(11,20,36,.06)]">
          {b.locs.map((l, k) => (
            <button key={l.n} onClick={() => setI(k)} className="relative h-12 rounded-xl px-6 text-[15px] font-bold">
              {i === k && <motion.span layoutId="loc" className="absolute inset-0 rounded-xl bg-[#0b1424]" transition={{ type: 'spring', bounce: 0, duration: .45 }} />}
              <span className={`relative transition-colors ${i === k ? 'text-white' : 'text-[#5d6b80]'}`}>{l.n}</span>
            </button>))}
        </div>
      </div>
      <div className="grid gap-5 md:grid-cols-[.8fr_1.2fr]">
        <div className="rounded-[28px] bg-white p-8 shadow-[0_8px_30px_rgba(11,20,36,.06)]">
          <AnimatePresence mode="wait">
            <motion.div key={i} initial={{ opacity: 0, y: 14, filter: 'blur(4px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -14, filter: 'blur(4px)' }} transition={{ duration: .3 }} className="grid gap-6">
              <div><p className="mb-1 flex items-center gap-2 text-[13px] font-semibold text-[#5d6b80]"><MapPin size={15} />Адрес</p><p className="text-[26px] font-extrabold tracking-[-.03em]">{L.a}</p></div>
              <div><p className="mb-1 text-[13px] font-semibold text-[#5d6b80]">Телефон</p><a href={'tel:' + tel(L.p)} className="text-[26px] font-extrabold tracking-[-.03em] text-[#1f5eff]">{L.p}</a></div>
              <div><p className="mb-1 text-[13px] font-semibold text-[#5d6b80]">Отзывы</p><p className="text-[26px] font-extrabold tracking-[-.03em]">{L.r} оценок</p></div>
            </motion.div>
          </AnimatePresence>
          <div className="mt-6 flex flex-wrap gap-2">{messengerLinks(b).map(mm => <a key={mm.k} href={mm.href} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-xl bg-[#f3f5f9] px-4 py-2.5 text-[14px] font-semibold transition-colors hover:bg-[#1f5eff] hover:text-white">{mm.Icon && <mm.Icon width={16} height={16} />}{mm.label}</a>)}</div>
        </div>
        <div className="min-h-[420px] overflow-hidden rounded-[28px] shadow-[0_8px_30px_rgba(11,20,36,.06)]"><MapFrame key={L.o} oid={L.o} /></div>
      </div>
    </section>
  )
}

function Book() {
  const bk = useBooking()
  const [loc, setLoc] = useState(0)
  const f = 'h-14 w-full rounded-2xl border border-[#0b1424]/15 bg-white px-4 text-[16px] outline-none transition-[border-color,box-shadow] focus:border-[#1f5eff] focus:shadow-[0_0_0_4px_rgba(31,94,255,.14)]'
  return (
    <section id="book" className="mx-auto max-w-[1200px] px-5 pb-28">
      <div className="grid overflow-hidden rounded-[32px] bg-white shadow-[0_8px_40px_rgba(11,20,36,.08)] md:grid-cols-2">
        <div className="relative overflow-hidden bg-[#0b1424] p-10 text-white md:p-14">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 30, ease: 'linear' }} className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full border-[40px] border-dashed border-[#1f5eff]/40" />
          <h2 className="relative text-[clamp(36px,4vw,54px)] font-extrabold leading-[1.05] tracking-[-.04em]">Запись онлайн — <span className="text-[#7aa2ff]">без очереди</span></h2>
          <p className="relative mt-5 max-w-[380px] text-[#9fb0cc]">Выберите адрес и услугу — перезвоним и подтвердим время.</p>
          <div className="relative mt-8 grid gap-1">{b.phones.map(p => <a key={p} href={'tel:' + tel(p)} className="text-[24px] font-extrabold tracking-[-.02em]">{p}</a>)}</div>
        </div>
        <div className="p-8 md:p-12">
          <AnimatePresence mode="wait">
            {!bk.s.sent ? (
              <motion.form key="f" exit={{ opacity: 0, y: -10 }} onSubmit={bk.submit} noValidate className="grid gap-4">
                <div className="grid grid-cols-2 gap-1 rounded-2xl bg-[#f3f5f9] p-1">{b.locs.map((l, k) => (
                  <button type="button" key={l.n} onClick={() => setLoc(k)} className="relative h-12 rounded-xl text-[14px] font-bold">
                    {loc === k && <motion.span layoutId="bloc" className="absolute inset-0 rounded-xl bg-white shadow" transition={{ type: 'spring', bounce: 0, duration: .4 }} />}
                    <span className="relative">{l.n}</span></button>))}</div>
                <select className={f} value={bk.s.svc} onChange={e => bk.upd('svc', e.target.value)}><option value="">Услуга</option>{SV.map(([t]) => <option key={t}>{t}</option>)}</select>
                <input className={f} value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} placeholder="Имя" autoComplete="name" />
                <motion.input animate={bk.s.err ? { x: [0, -8, 8, -6, 6, 0] } : {}} className={f + (bk.s.err ? ' !border-red-500' : '')} value={bk.s.phone} onFocus={phoneFocus(bk)} onChange={e => bk.upd('phone', e.target.value)} type="tel" inputMode="tel" placeholder="Телефон *" autoComplete="tel" />
                <button disabled={bk.s.loading} className="h-14 rounded-2xl bg-[#1f5eff] font-bold text-white shadow-[0_10px_24px_rgba(31,94,255,.3)] transition-[scale,opacity] active:scale-[.96] disabled:opacity-60">{bk.s.loading ? 'Отправляем…' : 'Записаться'}</button>
                <p className="text-[13px] text-[#5d6b80]">В готовом сайте заявка придёт в Telegram нужного шиномонтажа.</p>
              </motion.form>
            ) : (
              <motion.div key="ok" initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} className="py-14 text-center text-[#1f5eff]"><CheckDraw className="mx-auto mb-5" /><h3 className="text-[30px] font-extrabold tracking-[-.03em] text-[#0b1424]">Записали!</h3><p className="text-[#5d6b80]">Ждём вас на {b.locs[loc].a}.</p></motion.div>
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
      <div className="bg-[#f3f5f9] font-['Manrope',sans-serif] text-[#0b1424]" style={{ '--sel': BL, '--selc': '#fff' }}>
        <Progress color={BL} />
        <Cursor color={BL} blend="normal" textColor="#fff" />
        <Ribbon name={b.name} bg="#0b1424" fg="#fff" />
        <header className="sticky top-3 z-40 mx-auto mt-3 max-w-[1200px] px-5">
          <div className="flex h-16 items-center justify-between rounded-[20px] bg-white/80 pl-5 pr-2 shadow-[0_8px_30px_rgba(11,20,36,.08)] backdrop-blur-xl">
            <a href="#top" className="flex items-center gap-2.5 text-[16px] font-extrabold tracking-[-.02em]"><span className="grid h-8 w-8 place-items-center rounded-[10px] bg-[#1f5eff] text-white"><Disc3 size={18} /></span>Шиномонтажный центр</a>
            <nav className="hidden gap-1 md:flex">{[['#services', 'Услуги'], ['#locations', 'Адреса'], ['#book', 'Запись']].map(([h, t]) => <a key={h} href={h} className="rounded-xl px-4 py-2 text-[14px] font-semibold text-[#5d6b80] transition-colors hover:bg-[#f3f5f9] hover:text-[#0b1424]">{t}</a>)}</nav>
            <a href="#book" className="hidden h-12 items-center rounded-2xl bg-[#1f5eff] px-5 text-[14px] font-bold text-white sm:inline-flex">Записаться</a>
          </div>
        </header>
        <main id="top">
          <section className="mx-auto max-w-[1200px] px-5 pb-10 pt-20 text-center md:pt-28">
            <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-7 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[13px] font-bold text-[#1f5eff] shadow-[0_6px_20px_rgba(11,20,36,.06)]"><motion.span animate={{ opacity: [1, .3, 1] }} transition={{ repeat: Infinity, duration: 1.6 }} className="h-2 w-2 rounded-full bg-[#1f5eff]" />{SEASON}</motion.span>
            <h1 className="mx-auto max-w-[980px] text-[clamp(44px,7vw,104px)] font-extrabold leading-[.98] tracking-[-.05em]">
              <SplitText text="Шины и кондиционер" mode="words" stagger={.08} className="block" />
              <SplitText text="в одном месте" mode="words" delay={.25} stagger={.08} className="block text-[#1f5eff]" />
            </h1>
            <Reveal delay={.4}><p className="mx-auto mb-10 mt-7 max-w-[560px] text-[18px] text-[#5d6b80]">Два шиномонтажа в Минске — на Чкалова и Рыбалко. Переобувка, балансировка, ремонт шин и заправка автокондиционеров.</p></Reveal>
            <Reveal delay={.5} className="flex flex-wrap justify-center gap-3">
              <Magnetic><a href="#book" data-cursor="Запись" className="inline-flex h-14 items-center gap-2 rounded-2xl bg-[#1f5eff] px-8 font-bold text-white shadow-[0_12px_30px_rgba(31,94,255,.35)] transition-[scale] active:scale-[.96]">Записаться онлайн <ArrowRight size={18} /></a></Magnetic>
              <a href="#locations" className="inline-flex h-14 items-center gap-2 rounded-2xl bg-white px-7 font-bold shadow-[0_8px_24px_rgba(11,20,36,.06)]"><MapPin size={18} />2 адреса</a>
            </Reveal>
          </section>
          <Explode />
          <section id="services" className="mx-auto max-w-[1200px] px-5 py-24">
            <h2 className="mb-10 text-[clamp(36px,4.6vw,60px)] font-extrabold tracking-[-.04em]"><SplitText text="Все услуги" mode="words" /></h2>
            <div className="grid auto-rows-[220px] gap-5 md:grid-cols-4">
              {SV.map(([t, d, Ic], i) => (
                <Tilt key={t} max={6} className={i === 0 ? 'md:col-span-2 md:row-span-2' : i === 3 ? 'md:col-span-2' : ''}>
                  <a href="#book" data-svc={t} data-cursor="Запись" className={`flex h-full flex-col justify-between rounded-[28px] p-7 shadow-[0_8px_30px_rgba(11,20,36,.06)] transition-shadow hover:shadow-[0_18px_50px_rgba(11,20,36,.12)] ${i === 0 ? 'bg-[#0b1424] text-white' : 'bg-white'}`}>
                    <span className={`grid h-12 w-12 place-items-center rounded-2xl ${i === 0 ? 'bg-white/10 text-[#7aa2ff]' : 'bg-[#eef3ff] text-[#1f5eff]'}`}><Ic size={24} /></span>
                    <div><h3 className={`font-extrabold tracking-[-.03em] ${i === 0 ? 'text-[40px] leading-none' : 'text-[22px]'}`}>{t}</h3><p className={i === 0 ? 'mt-2 max-w-[300px] text-[#9fb0cc]' : 'text-[14.5px] text-[#5d6b80]'}>{d}</p></div>
                  </a>
                </Tilt>))}
            </div>
            <div className="mt-5 grid gap-5 md:grid-cols-3">
              {[[b.rev, 'оценок на Яндекс.Картах'], [2, 'адреса в Минске'], [60, 'секунд на онлайн-запись']].map(([n, t], i) => (
                <Reveal key={t} delay={i * .08} className="rounded-[28px] bg-white p-8 shadow-[0_8px_30px_rgba(11,20,36,.06)]"><Counter to={n} className="block text-[64px] font-extrabold leading-none tracking-[-.05em] text-[#1f5eff]" /><span className="text-[#5d6b80]">{t}</span></Reveal>))}
            </div>
          </section>
          <Locations />
          <Book />
        </main>
        <footer className="mx-auto flex max-w-[1200px] flex-wrap justify-between gap-4 px-5 pb-12 text-[13.5px] text-[#5d6b80]"><span>© 2026 Шиномонтажный центр · Чкалова 14 · Рыбалко 17/6</span><span>Демо-концепт · сайт — Артём</span></footer>
        <CallBar phone={b.phones[0]} barCls="bg-white/90 backdrop-blur-xl border-t border-black/5" callCls="rounded-2xl bg-[#f3f5f9]" bookCls="rounded-2xl bg-[#1f5eff] text-white" />
        <div className="h-[72px] sm:hidden" />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
