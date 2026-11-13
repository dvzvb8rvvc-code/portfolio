import React, { useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, useSpring, AnimatePresence, MotionConfig, useMotionValueEvent } from 'framer-motion'
import { ArrowRight, Phone, MapPin, Gauge, Cog, Wrench, Car, Snowflake, ShieldCheck, ScanLine, Plus } from 'lucide-react'
import '../lib/base.css'
import { B } from '../data'
import { useSmooth, Ribbon, SplitText, Reveal, Magnetic, Cursor, Marquee, Counter, useBooking, phoneFocus, CheckDraw, MapFrame, messengerLinks, CallBar, Progress, tel } from '../lib/kit'

const b = B.nika
const RD = '#ff2e3b'
const SV = [['Компьютерная диагностика', 'Находим причину, а не меняем всё подряд.', Gauge], ['Техобслуживание', 'Масло, фильтры, жидкости — по регламенту.', Cog], ['Ремонт ходовой', 'Подвеска, рулевое, тормоза.', Wrench], ['Ремонт двигателя', 'От мелкого ремонта до капитального.', Car], ['Автокондиционеры', 'Диагностика и заправка системы.', Snowflake], ['Подготовка к сезону', 'Проверка перед зимой и дальней дорогой.', ShieldCheck]]
const SPOTS = [
  { x: 74, y: 40, t: 'Двигатель', s: 'Ремонт двигателя', d: 'Стуки, вибрации, расход масла — найдём и устраним.' },
  { x: 22, y: 70, t: 'Ходовая', s: 'Ремонт ходовой', d: 'Подвеска, рулевое и тормоза — безопасность прежде всего.' },
  { x: 50, y: 32, t: 'Кондиционер', s: 'Автокондиционеры', d: 'Диагностика, поиск утечек и заправка фреоном.' },
  { x: 80, y: 70, t: 'Тормоза', s: 'Техобслуживание', d: 'Колодки, диски, жидкость — по регламенту.' },
]
const carD = 'M40 150 C40 128 52 118 74 114 L176 98 L262 42 C278 32 296 26 316 26 L476 26 C500 26 520 34 538 48 L612 104 L676 114 C700 118 716 132 716 156 L716 178 L660 178 M40 178 L40 150 M40 178 L92 178 M192 178 L560 178'

function Scanner() {
  const [act, setAct] = useState(null)
  return (
    <div className="relative mx-auto w-full max-w-[860px]" data-cursor="Скан">
      <svg viewBox="0 0 760 240" className="w-full overflow-visible" fill="none">
        <defs><linearGradient id="scan" x1="0" x2="1"><stop offset="0" stopColor={RD} stopOpacity="0" /><stop offset=".5" stopColor={RD} /><stop offset="1" stopColor={RD} stopOpacity="0" /></linearGradient></defs>
        <motion.path d={carD} stroke="#eef0f5" strokeWidth="3" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2.4, ease: [0.65, 0, 0.35, 1], delay: .3 }} />
        <motion.path d="M282 44 L250 96 L400 96 L400 30 M420 30 L420 96 L590 96 L530 50" stroke="#868c9c" strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.6, delay: 1.2 }} />
        {[142, 610].map(cx => <motion.g key={cx} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.6, type: 'spring' }} style={{ transformOrigin: `${cx}px 180px` }}><circle cx={cx} cy="180" r="44" stroke="#eef0f5" strokeWidth="3" /><circle cx={cx} cy="180" r="18" stroke={RD} strokeWidth="3" /></motion.g>)}
        <motion.rect y="0" width="6" height="240" fill="url(#scan)" initial={{ x: 0 }} animate={{ x: [0, 750, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 2.2 }} />
      </svg>
      {SPOTS.map((s, i) => (
        <div key={s.t} className="absolute" style={{ left: s.x + '%', top: s.y + '%' }}>
          <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 2.4 + i * .15, type: 'spring' }} onClick={() => setAct(act === i ? null : i)} aria-label={s.t}
            className="relative -translate-x-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full bg-[#ff2e3b] text-white">
            <motion.span animate={{ scale: [1, 2.2], opacity: [.6, 0] }} transition={{ repeat: Infinity, duration: 1.6 }} className="absolute inset-0 rounded-full bg-[#ff2e3b]" />
            <motion.span animate={{ rotate: act === i ? 45 : 0 }} className="relative"><Plus size={18} /></motion.span>
          </motion.button>
          <AnimatePresence>{act === i && (
            <motion.div initial={{ opacity: 0, y: 10, scale: .95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6 }} className={`absolute top-6 z-20 w-[240px] rounded-2xl bg-[#151820] p-5 ring-1 ring-white/10 ${s.x > 60 ? 'right-0' : 'left-0'}`}>
              <p className="mb-1 font-['Exo_2',sans-serif] text-[18px] font-extrabold uppercase italic">{s.t}</p>
              <p className="mb-4 text-[14px] text-[#868c9c]">{s.d}</p>
              <a href="#book" data-svc={s.s} className="inline-flex items-center gap-2 text-[13px] font-bold uppercase tracking-wider text-[#ff2e3b]">Записаться <ArrowRight size={14} /></a>
            </motion.div>)}</AnimatePresence>
        </div>
      ))}
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3 }} className="mt-4 text-center text-[13px] uppercase tracking-[.2em] text-[#868c9c]"><ScanLine className="mr-2 inline" size={14} />Нажмите на красные точки</motion.p>
    </div>
  )
}

function Speedo() {
  const { scrollYProgress } = useScroll()
  const sp = useSpring(scrollYProgress, { stiffness: 80, damping: 20 })
  const rot = useTransform(sp, [0, 1], [-120, 120])
  const [kmh, setKmh] = useState(0)
  useMotionValueEvent(sp, 'change', v => setKmh(Math.round(v * 240)))
  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-30 hidden h-[150px] w-[150px] md:block" aria-hidden="true">
      <svg viewBox="0 0 200 200" className="absolute inset-0">
        <circle cx="100" cy="100" r="96" fill="#0e1015" fillOpacity=".85" stroke="rgba(238,240,245,.08)" />
        {Array.from({ length: 13 }, (_, i) => <line key={i} x1="100" y1="16" x2="100" y2={i % 2 ? 26 : 32} stroke={i > 9 ? RD : '#868c9c'} strokeWidth={i % 2 ? 2 : 3} transform={`rotate(${-120 + i * 20} 100 100)`} />)}
      </svg>
      <motion.div style={{ rotate: rot }} className="absolute inset-0"><div className="absolute left-1/2 top-[22px] h-[78px] w-[3px] -translate-x-1/2 rounded bg-[#ff2e3b]" /></motion.div>
      <div className="absolute inset-0 grid place-items-center"><div className="text-center"><b className="block font-['Exo_2',sans-serif] text-[30px] font-black italic leading-none" style={{ fontVariantNumeric: 'tabular-nums' }}>{kmh}</b><span className="text-[9px] uppercase tracking-[.2em] text-[#868c9c]">км/ч</span></div></div>
    </div>
  )
}

function Timeline() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 70%', 'end 60%'] })
  const h = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])
  const st = [['Заявка', 'Онлайн или по телефону — за минуту.'], ['Диагностика', 'Находим причину и показываем её вам.'], ['Согласование', 'Называем стоимость до начала работ.'], ['Ремонт и выдача', 'Делаем и отдаём машину в срок.']]
  return (
    <section ref={ref} className="mx-auto max-w-[900px] px-6 py-28">
      <h2 className="mb-16 font-['Exo_2',sans-serif] text-[clamp(40px,5vw,72px)] font-black uppercase italic leading-none">Как мы <span className="text-[#ff2e3b]">работаем</span></h2>
      <div className="relative pl-12">
        <div className="absolute bottom-0 left-[14px] top-0 w-[3px] bg-white/10"><motion.div style={{ height: h }} className="w-full bg-[#ff2e3b] shadow-[0_0_20px_#ff2e3b]" /></div>
        {st.map(([t, d], i) => (
          <Reveal key={t} className="relative mb-14 last:mb-0">
            <span className="absolute -left-12 top-0 grid h-[31px] w-[31px] place-items-center rounded-full bg-[#06070a] font-['Exo_2',sans-serif] text-[13px] font-black ring-[3px] ring-[#ff2e3b]">{i + 1}</span>
            <h3 className="font-['Exo_2',sans-serif] text-[30px] font-extrabold uppercase italic leading-none">{t}</h3>
            <p className="mt-2 text-[17px] text-[#868c9c]">{d}</p>
          </Reveal>))}
      </div>
    </section>
  )
}

function App() {
  useSmooth()
  const bk = useBooking()
  const [car, setCar] = useState('')
  const hero = useRef(null)
  const { scrollYProgress } = useScroll({ target: hero, offset: ['start start', 'end start'] })
  const hx = useTransform(scrollYProgress, [0, 1], ['0%', '-18%'])
  const f = 'h-14 w-full rounded-xl border border-white/10 bg-[#06070a] px-4 text-[16px] outline-none transition-[border-color,box-shadow] focus:border-[#ff2e3b] focus:shadow-[0_0_0_4px_rgba(255,46,59,.15)]'
  return (
    <MotionConfig reducedMotion="user">
      <div className="bg-[#06070a] font-['Exo_2',sans-serif] text-[#eef0f5]" style={{ '--sel': RD, '--selc': '#fff' }}>
        <Progress color={RD} />
        <Cursor color={RD} blend="normal" textColor="#fff" />
        <Speedo />
        <Ribbon name={b.name} bg={RD} fg="#fff" />
        <header className="sticky top-0 z-40 border-b border-white/10 bg-[#06070a]/80 backdrop-blur-xl">
          <div className="mx-auto flex h-[70px] max-w-[1280px] items-center justify-between px-6">
            <a href="#top" className="flex items-center gap-3 text-[20px] font-black uppercase italic tracking-[.1em]"><svg viewBox="0 0 40 22" width="40" height="22"><path d="M2 20 14 2h8L10 20zM18 20 30 2h8L26 20z" fill={RD} /></svg>Ника Моторс</a>
            <nav className="hidden gap-8 text-[14px] font-semibold uppercase tracking-[.12em] text-[#868c9c] md:flex">{[['#scan', 'Диагностика'], ['#services', 'Услуги'], ['#book', 'Запись']].map(([h, t]) => <a key={h} href={h} className="hover:text-white">{t}</a>)}</nav>
            <a href="#book" className="hidden h-11 items-center rounded-lg bg-[#ff2e3b] px-5 text-[13px] font-bold uppercase tracking-[.08em] sm:inline-flex">Записаться</a>
          </div>
        </header>
        <main id="top">
          <section ref={hero} className="relative overflow-hidden pt-16">
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-[radial-gradient(ellipse_at_bottom,rgba(255,46,59,.18),transparent_65%)]" />
            <motion.div style={{ x: hx }} className="text-[clamp(52px,11vw,190px)] font-black uppercase italic leading-[.88] tracking-[-.02em] md:whitespace-nowrap">
              <SplitText text="В форме." stagger={.03} className="block pl-6" />
              <SplitText text="Вы — спокойны." delay={.3} stagger={.03} className="block pl-6 text-[#ff2e3b] md:pl-[6vw]" />
            </motion.div>
            <div className="mx-auto grid max-w-[1280px] items-end gap-8 px-6 pb-10 pt-10 md:grid-cols-2">
              <Reveal delay={.5}><p className="max-w-[480px] text-[18px] text-[#868c9c]">Диагностика, техобслуживание и ремонт на Автомобилистов, 6А. Объясняем, что сломалось, и согласуем стоимость до начала работ.</p></Reveal>
              <Reveal delay={.6} className="flex flex-wrap gap-3 md:justify-end">
                <Magnetic><a href="#book" data-cursor="Запись" className="inline-flex h-14 items-center gap-2 rounded-lg bg-[#ff2e3b] px-8 font-bold uppercase tracking-[.08em] shadow-[0_10px_30px_rgba(255,46,59,.35)] transition-[scale] active:scale-[.96]">Записаться на сервис <ArrowRight size={18} /></a></Magnetic>
                <a href={'tel:' + tel(b.phones[0])} className="inline-flex h-14 items-center gap-2 rounded-lg px-7 font-bold ring-1 ring-white/15"><Phone size={16} />{b.phones[0]}</a>
              </Reveal>
            </div>
            <div id="scan" className="px-6 pb-20 pt-6"><Scanner /></div>
          </section>
          <Marquee base={-5} className="border-y border-white/10 bg-[#0e1015] py-5">{['Диагностика', 'ТО', 'Ходовая', 'Двигатель', 'Кондиционер', 'Тормоза'].map(t => <span key={t} className="mx-6 inline-flex items-center gap-12 text-[clamp(30px,4vw,56px)] font-black uppercase italic">{t}<span className="h-3 w-3 rotate-45 bg-[#ff2e3b]" /></span>)}</Marquee>
          <section id="services" className="mx-auto max-w-[1280px] px-6 py-28">
            <h2 className="mb-12 text-[clamp(40px,5vw,72px)] font-black uppercase italic leading-none">Сервис <span className="text-[#ff2e3b]">под ключ</span></h2>
            <div className="grid gap-3 md:grid-cols-3">{SV.map(([t, d, Ic], i) => (
              <motion.a key={t} href="#book" data-svc={t} data-cursor="Запись" whileHover="h" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 3) * .08, duration: .6 }}
                className="group relative flex min-h-[230px] flex-col justify-between overflow-hidden rounded-2xl bg-[#0e1015] p-7 ring-1 ring-white/[.07] [background-image:linear-gradient(45deg,rgba(255,255,255,.025)_25%,transparent_25%,transparent_75%,rgba(255,255,255,.025)_75%),linear-gradient(45deg,rgba(255,255,255,.025)_25%,transparent_25%,transparent_75%,rgba(255,255,255,.025)_75%)] [background-position:0_0,4px_4px] [background-size:8px_8px]">
                <motion.span variants={{ h: { scaleX: 1 } }} initial={{ scaleX: 0 }} className="absolute inset-x-0 top-0 h-[3px] origin-left bg-[#ff2e3b]" />
                <div className="flex items-center justify-between"><span className="text-[13px] font-bold tracking-[.2em] text-[#868c9c]"><span className="text-[#ff2e3b]">●</span> SRV-0{i + 1}</span><motion.span variants={{ h: { rotate: 90 } }}><Ic className="text-[#ff2e3b]" size={26} /></motion.span></div>
                <div><h3 className="mb-2 text-[24px] font-extrabold uppercase italic leading-tight">{t}</h3><p className="text-[15px] text-[#868c9c]">{d}</p></div>
              </motion.a>))}</div>
          </section>
          <Timeline />
          <section className="mx-auto grid max-w-[1280px] gap-3 px-6 md:grid-cols-3">
            {[[b.rev, 'оценок на Яндекс.Картах'], [6, 'направлений ремонта'], [60, 'секунд на онлайн-запись']].map(([n, t], i) => (
              <Reveal key={t} delay={i * .08} className="flex items-baseline gap-4 rounded-2xl bg-[#0e1015] p-8 ring-1 ring-white/[.07]"><Counter to={n} className={`text-[64px] font-black italic leading-none ${i === 0 ? 'text-[#ff2e3b]' : ''}`} /><span className="text-[#868c9c]">{t}</span></Reveal>))}
          </section>
          <section id="book" className="px-6 py-28">
            <div className="mx-auto grid max-w-[1280px] overflow-hidden rounded-3xl ring-1 ring-white/10 md:grid-cols-[1fr_1.1fr]">
              <div className="bg-[linear-gradient(150deg,rgba(255,46,59,.25),transparent_60%)] p-10 md:p-14">
                <h2 className="text-[clamp(40px,4.6vw,64px)] font-black uppercase italic leading-[.95]">Запись <span className="text-[#ff2e3b]">на сервис</span></h2>
                <p className="mb-8 mt-5 max-w-[380px] text-[#868c9c]">Укажите марку и номер телефона — перезвоним и предложим ближайшее время.</p>
                {b.phones.map(p => <a key={p} href={'tel:' + tel(p)} className="text-[30px] font-black italic">{p}</a>)}
              </div>
              <div className="bg-[#0e1015] p-8 md:p-12">
                <AnimatePresence mode="wait">{!bk.s.sent ? (
                  <motion.form key="f" exit={{ opacity: 0, x: -20 }} onSubmit={bk.submit} noValidate className="grid gap-4">
                    <input className={f} value={car} onChange={e => setCar(e.target.value)} placeholder="Марка и модель авто" />
                    <select className={f} value={bk.s.svc} onChange={e => bk.upd('svc', e.target.value)}><option value="">Что беспокоит?</option>{SV.map(([t]) => <option key={t}>{t}</option>)}</select>
                    <motion.input animate={bk.s.err ? { x: [0, -8, 8, -6, 6, 0] } : {}} className={f + (bk.s.err ? ' !border-[#ff2e3b]' : '')} value={bk.s.phone} onFocus={phoneFocus(bk)} onChange={e => bk.upd('phone', e.target.value)} type="tel" inputMode="tel" placeholder="Телефон *" autoComplete="tel" />
                    <button disabled={bk.s.loading} className="h-14 rounded-xl bg-[#ff2e3b] font-bold uppercase tracking-[.1em] transition-[scale,opacity] active:scale-[.96] disabled:opacity-60">{bk.s.loading ? 'Отправляем…' : 'Записаться'}</button>
                    <p className="text-[13px] text-[#868c9c]">В готовом сайте заявка придёт вам в Telegram.</p>
                  </motion.form>) : (
                  <motion.div key="ok" initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }} className="py-12 text-center text-[#ff2e3b]"><CheckDraw className="mx-auto mb-5" /><h3 className="text-[34px] font-black uppercase italic text-white">Вы записаны</h3><p className="text-[#868c9c]">{car || 'Ваш автомобиль'} — ждём на сервисе.</p></motion.div>)}
                </AnimatePresence>
              </div>
            </div>
          </section>
          <section id="contacts" className="mx-auto grid max-w-[1280px] gap-3 px-6 pb-28 md:grid-cols-[1fr_1.3fr]">
            <Reveal className="grid content-start gap-6 rounded-2xl bg-[#0e1015] p-9 ring-1 ring-white/[.07]">
              <h2 className="text-[48px] font-black uppercase italic leading-none">Как <span className="text-[#ff2e3b]">доехать</span></h2>
              <div><p className="mb-1 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[.2em] text-[#ff2e3b]"><MapPin size={14} />Адрес</p><p className="text-[22px] font-bold">{b.addr}</p></div>
              <div><p className="mb-1 text-[12px] font-bold uppercase tracking-[.2em] text-[#ff2e3b]">Телефон</p>{b.phones.map(p => <a key={p} href={'tel:' + tel(p)} className="text-[22px] font-bold">{p}</a>)}</div>
              <div className="flex flex-wrap gap-2">{messengerLinks(b).map(m => <a key={m.k} href={m.href} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-[14px] font-bold ring-1 ring-white/15 transition-colors hover:bg-[#ff2e3b]">{m.Icon && <m.Icon width={16} height={16} />}{m.label}</a>)}</div>
            </Reveal>
            <Reveal delay={.08} className="min-h-[400px] overflow-hidden rounded-2xl ring-1 ring-white/[.07]"><MapFrame oid={b.oid} dark /></Reveal>
          </section>
        </main>
        <footer className="border-t border-white/10 px-6 py-8 text-[13px] text-[#868c9c]"><div className="mx-auto flex max-w-[1280px] flex-wrap justify-between gap-4"><span>© 2026 Ника Моторс</span><span>Демо-концепт · сайт — Артём</span></div></footer>
        <CallBar phone={b.phones[0]} barCls="bg-[#06070a]/95 backdrop-blur-xl border-t border-white/10" callCls="rounded-lg ring-1 ring-white/20 uppercase text-[14px]" bookCls="rounded-lg bg-[#ff2e3b] uppercase text-[14px]" />
        <div className="h-[72px] sm:hidden" />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
