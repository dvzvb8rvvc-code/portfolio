import React, { useRef, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, useSpring, useMotionValue, useMotionTemplate, AnimatePresence, MotionConfig } from 'framer-motion'
import { ArrowRight, Phone, MapPin, Check } from 'lucide-react'
import '../lib/base.css'
import { B } from '../data'
import { useSmooth, Ribbon, SplitText, Reveal, Magnetic, Cursor, Marquee, Counter, useBooking, phoneFocus, MapFrame, messengerLinks, CallBar, Progress, Intro, tel, Scramble } from '../lib/kit'

const b = B.sovest
const INK = '#13233a', GR = '#14a46c', PAPER = '#f2efe6', BP = '#0f3d8a'
const U = "font-['Unbounded',sans-serif]", M = "font-['IBM_Plex_Mono',monospace]"
const SYM = ['Стучит подвеска', 'Горит Check Engine', 'Скрипят тормоза', 'Плохо заводится', 'Течёт масло', 'Нужно ТО', 'Вибрация на скорости', 'Другое']
const SV = [['Диагностика', 'компьютерная и ходовой'], ['Ремонт двигателя', 'от прокладок до капиталки'], ['Ходовая часть', 'подвеска, рулевое'], ['Тормоза', 'колодки, диски, жидкость'], ['ТО и масло', 'по регламенту авто'], ['Электрика', 'проводка, датчики, свет']]
const PROTO = [['01', 'Диагностика', 'Сначала находим причину — без «на всякий случай».'], ['02', 'Смета', 'Называем стоимость до начала работ.'], ['03', 'Ваше «да»', 'Ремонтируем только то, что вы согласовали.'], ['04', 'Старые детали', 'Отдаём или показываем то, что сняли.'], ['05', 'Отчёт', 'Объясняем, что сделали, простыми словами.']]

const CarLines = ({ stroke, w = 3, extra = false }) => (
  <svg viewBox="0 0 900 360" className="h-full w-full" fill="none" stroke={stroke} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
    <path d="M60 260v-40c0-20 12-32 32-36l110-22 104-74c18-12 38-19 60-19h210c24 0 46 9 64 24l84 72 76 12c30 4 44 24 44 50v34h-66" />
    <path d="M60 260h68M262 260h346" />
    <circle cx="196" cy="264" r="58" /><circle cx="676" cy="264" r="58" />
    <path d="M340 90l-34 68h170V74M516 74v84h180l-76-66" />
    {extra && <>
      <circle cx="196" cy="264" r="22" /><circle cx="676" cy="264" r="22" />
      {Array.from({ length: 10 }).map((_, i) => <line key={i} x1={196 + Math.cos(i * .628) * 24} y1={264 + Math.sin(i * .628) * 24} x2={196 + Math.cos(i * .628) * 52} y2={264 + Math.sin(i * .628) * 52} strokeWidth="1.5" />)}
      {Array.from({ length: 10 }).map((_, i) => <line key={'b' + i} x1={676 + Math.cos(i * .628) * 24} y1={264 + Math.sin(i * .628) * 24} x2={676 + Math.cos(i * .628) * 52} y2={264 + Math.sin(i * .628) * 52} strokeWidth="1.5" />)}
      <rect x="96" y="176" width="150" height="70" rx="8" /><path d="M110 190h120M110 206h120M110 222h120M110 238h80" strokeWidth="1.5" />
      <path d="M246 210h120l30 30h220" strokeDasharray="8 8" /><path d="M196 264H676" strokeWidth="6" />
      <circle cx="430" cy="264" r="16" /><rect x="740" y="190" width="70" height="40" rx="6" />
      <path d="M150 140l50-6M640 112c40 0 70 20 90 50" strokeDasharray="4 6" />
      <text x="100" y="168" fill={stroke} stroke="none" fontSize="14" fontFamily="IBM Plex Mono">ДВС</text>
      <text x="400" y="300" fill={stroke} stroke="none" fontSize="14" fontFamily="IBM Plex Mono">КАРДАН</text>
      <text x="740" y="182" fill={stroke} stroke="none" fontSize="14" fontFamily="IBM Plex Mono">АКБ</text>
      <text x="150" y="340" fill={stroke} stroke="none" fontSize="14" fontFamily="IBM Plex Mono">ПОДВЕСКА / ТОРМОЗА</text>
    </>}
  </svg>
)

/* x-ray lens: cursor reveals the blueprint under the car */
function Hero() {
  const box = useRef(null)
  const mx = useMotionValue(50), my = useMotionValue(50)
  const sx = useSpring(mx, { stiffness: 120, damping: 18 }), sy = useSpring(my, { stiffness: 120, damping: 18 })
  const [r, setR] = useState(0)
  const mask = useMotionTemplate`radial-gradient(circle ${r}px at ${sx}% ${sy}%, #000 98%, transparent 100%)`
  useEffect(() => {
    const t = setTimeout(() => setR(innerWidth < 768 ? 90 : 150), 1600)
    let a = 0, id
    const auto = () => { if (!matchMedia('(hover:hover)').matches) { a += .012; mx.set(50 + Math.cos(a) * 30); my.set(55 + Math.sin(a * 1.6) * 18) } id = requestAnimationFrame(auto) }
    auto()
    return () => { clearTimeout(t); cancelAnimationFrame(id) }
  }, [])
  const move = e => { const q = box.current.getBoundingClientRect(); mx.set((e.clientX - q.left) / q.width * 100); my.set((e.clientY - q.top) / q.height * 100) }
  return (
    <section className="relative overflow-hidden px-6 pb-16 pt-14 md:px-10 md:pt-20" style={{ background: PAPER }}>
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-10 grid items-end gap-8 md:grid-cols-[1.3fr_1fr]">
          <div>
            <p className={`${M} mb-5 text-[13px] uppercase tracking-[.2em] text-[#13233a]/60`}>[ автосервис · Независимости, 58/12 ]</p>
            <h1 className={`${U} text-[clamp(44px,7.4vw,124px)] font-extrabold uppercase leading-[.9] tracking-[-.03em]`} style={{ color: INK }}>
              <SplitText text="Чистая" delay={1.2} className="block" />
              <span className="block" style={{ color: GR }}><SplitText text="совесть" delay={1.4} /></span>
            </h1>
          </div>
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.8 }}>
            <p className={`${M} mb-7 text-[15px] leading-relaxed text-[#13233a]/75`}>Ремонт, в котором нечего скрывать. Наведите на машину — увидите её насквозь. Так же прозрачно мы работаем.</p>
            <div className="flex flex-wrap gap-3">
              <Magnetic><a href="#book" data-cursor="Запись" className={`${U} inline-flex h-14 items-center gap-3 px-7 text-[13px] font-bold uppercase tracking-[.08em] text-white`} style={{ background: INK }}>Записаться <ArrowRight size={18} /></a></Magnetic>
              <a href={'tel:' + tel(b.phones[0])} className={`${M} inline-flex h-14 items-center gap-2 border-2 px-6 text-[15px] font-semibold`} style={{ borderColor: INK, color: INK }}><Phone size={16} />{b.phones[0]}</a>
            </div>
          </motion.div>
        </div>
        <motion.div ref={box} onPointerMove={move} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 1 }} data-cursor="Рентген"
          className="relative aspect-[900/420] w-full overflow-hidden border-2" style={{ borderColor: INK, background: '#e9e5d8' }}>
          <div className="absolute inset-0 opacity-60" style={{ backgroundImage: 'linear-gradient(rgba(19,35,58,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(19,35,58,.08) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
          <div className="absolute inset-[6%_4%]"><CarLines stroke={INK} w={4} /></div>
          <motion.div className="absolute inset-0" style={{ background: BP, WebkitMaskImage: mask, maskImage: mask }}>
            <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.12) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.12) 1px,transparent 1px)', backgroundSize: '20px 20px' }} />
            <div className="absolute inset-[6%_4%]"><CarLines stroke="#bfe0ff" w={2} extra /></div>
          </motion.div>
          <span className={`${M} absolute left-3 top-3 bg-[#13233a] px-2 py-1 text-[11px] text-white`}>РЕЖИМ: ПРОЗРАЧНОСТЬ</span>
        </motion.div>
      </div>
    </section>
  )
}

/* receipt prints out as you scroll */
function Protocol() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 70%', 'end 60%'] })
  const h = useSpring(useTransform(scrollYProgress, [0, 1], [0, 1]), { stiffness: 90, damping: 22 })
  const clip = useTransform(h, v => `inset(0 0 ${100 - v * 100}% 0)`)
  return (
    <section ref={ref} className="px-6 py-28 md:px-10" style={{ background: INK }}>
      <div className="mx-auto grid max-w-[1320px] items-start gap-14 md:grid-cols-2">
        <div className="text-white md:sticky md:top-32">
          <p className={`${M} mb-5 text-[13px] uppercase tracking-[.2em] text-white/50`}>[ протокол ]</p>
          <h2 className={`${U} text-[clamp(40px,5.5vw,88px)] font-extrabold uppercase leading-[.92]`}>5 правил<br /><span style={{ color: '#5fe0a8' }}>без мелкого шрифта</span></h2>
          <p className={`${M} mt-6 max-w-[420px] text-white/60`}>Листайте — чек печатается. Каждый пункт — то, что клиент получит на ремонте.</p>
          <p className={`${M} mt-3 max-w-[420px] text-[12px] text-white/35`}>* Правила — пример для демо, сформулируем вместе с вами.</p>
        </div>
        <div className="relative mx-auto w-full max-w-[460px]">
          <div className="h-5 rounded-t-md bg-[#0a1626]" />
          <motion.div style={{ clipPath: clip }} className={`${M} relative bg-[#fbfaf5] px-7 pb-10 pt-6 text-[#13233a] shadow-2xl`}>
            <div className="mb-5 border-b-2 border-dashed border-[#13233a]/30 pb-4 text-center"><b className={`${U} text-[18px]`}>ЧИСТАЯ СОВЕСТЬ</b><br /><span className="text-[12px]">Независимости, 58/12 · {b.phones[0]}</span></div>
            {PROTO.map(([n, t, d]) => (
              <div key={n} className="mb-5 grid grid-cols-[34px_1fr_auto] gap-2">
                <span className="text-[#13233a]/50">{n}</span>
                <div><b className="text-[15px] uppercase">{t}</b><p className="text-[13px] leading-snug text-[#13233a]/70">{d}</p></div>
                <span className="grid h-6 w-6 place-items-center rounded-full text-white" style={{ background: GR }}><Check size={14} /></span>
              </div>
            ))}
            <div className="mt-6 border-t-2 border-dashed border-[#13233a]/30 pt-4 text-[13px]"><div className="flex justify-between"><span>СКРЫТЫЕ РАБОТЫ</span><b>0</b></div><div className="flex justify-between"><span>СЮРПРИЗЫ В СЧЁТЕ</span><b>0</b></div></div>
            <svg viewBox="0 0 460 16" preserveAspectRatio="none" className="absolute -bottom-[15px] left-0 h-4 w-full"><path d={'M0 0' + Array.from({ length: 23 }).map((_, i) => ` L${i * 20 + 10} 14 L${i * 20 + 20} 0`).join('') + ' Z'} fill="#fbfaf5" /></svg>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* booking styled as a work order with a stamp */
function Order() {
  const bk = useBooking()
  const [sym, setSym] = useState([])
  const [car, setCar] = useState('')
  const toggle = s => setSym(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s])
  const no = useRef(String(Date.now()).slice(-5))
  const line = `${M} w-full border-0 border-b-2 border-dotted border-[#13233a]/40 bg-transparent py-2 text-[17px] outline-none focus:border-[#14a46c] placeholder:text-[#13233a]/30`
  return (
    <section id="book" className="px-6 py-28 md:px-10" style={{ background: PAPER }}>
      <div className="mx-auto max-w-[980px]">
        <h2 className={`${U} mb-4 text-[clamp(40px,6vw,96px)] font-extrabold uppercase leading-[.9]`} style={{ color: INK }}><Scramble text="Заказ-наряд" /></h2>
        <p className={`${M} mb-10 text-[#13233a]/65`}>Заполните как на приёмке: что беспокоит — и мы перезвоним с ближайшим временем.</p>
        <form onSubmit={e => { bk.upd('svc', [car, ...sym].filter(Boolean).join(', ')); bk.submit(e) }} noValidate className="relative overflow-hidden border-2 bg-[#fbfaf5] p-6 md:p-12" style={{ borderColor: INK }}>
          <div className={`${M} mb-8 flex flex-wrap justify-between gap-2 border-b-2 pb-4 text-[13px]`} style={{ borderColor: INK }}><span>ЗАКАЗ-НАРЯД № {no.current}</span><span>{new Date().toLocaleDateString('ru-RU')}</span></div>
          <div className="mb-8 grid gap-6 md:grid-cols-3">
            <label className="grid gap-1"><span className={`${M} text-[11px] uppercase tracking-[.2em] text-[#13233a]/50`}>Клиент</span><input className={line} placeholder="Имя" value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} autoComplete="name" /></label>
            <label className="grid gap-1"><span className={`${M} text-[11px] uppercase tracking-[.2em] text-[#13233a]/50`}>Телефон</span><motion.input animate={bk.s.err ? { x: [0, -8, 8, -6, 6, 0] } : {}} className={line + (bk.s.err ? ' !border-red-500' : '')} type="tel" inputMode="tel" placeholder="+375 (__) ___-__-__" value={bk.s.phone} onFocus={phoneFocus(bk)} onChange={e => bk.upd('phone', e.target.value)} autoComplete="tel" /></label>
            <label className="grid gap-1"><span className={`${M} text-[11px] uppercase tracking-[.2em] text-[#13233a]/50`}>Автомобиль</span><input className={line} placeholder="Марка, год" value={car} onChange={e => setCar(e.target.value)} /></label>
          </div>
          <p className={`${M} mb-3 text-[11px] uppercase tracking-[.2em] text-[#13233a]/50`}>Жалобы клиента</p>
          <div className="mb-10 grid gap-x-8 gap-y-1 sm:grid-cols-2">
            {SYM.map(s => (
              <button type="button" key={s} onClick={() => toggle(s)} className={`${M} flex items-center gap-3 py-2 text-left text-[16px]`} style={{ color: INK }}>
                <span className="relative grid h-6 w-6 shrink-0 place-items-center border-2" style={{ borderColor: INK }}>
                  <AnimatePresence>{sym.includes(s) && <motion.svg initial={{ pathLength: 0 }} viewBox="0 0 24 24" className="absolute -left-1 -top-2 h-8 w-8" fill="none" stroke={GR} strokeWidth="3" strokeLinecap="round"><motion.path d="M4 13l5 5L22 3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} exit={{ pathLength: 0 }} transition={{ duration: .3 }} /></motion.svg>}</AnimatePresence>
                </span>{s}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className={`${M} max-w-[360px] text-[12px] text-[#13233a]/50`}>В готовом сайте заказ-наряд сразу придёт вам в Telegram.</p>
            <button disabled={bk.s.loading || bk.s.sent} className={`${U} h-14 px-8 text-[13px] font-bold uppercase tracking-[.08em] text-white disabled:opacity-60`} style={{ background: INK }}>{bk.s.loading ? 'Оформляем…' : 'Сдать на приёмку'}</button>
          </div>
          <AnimatePresence>
            {bk.s.sent && (
              <motion.div initial={{ scale: 3, opacity: 0, rotate: -30 }} animate={{ scale: 1, opacity: 1, rotate: -12 }} transition={{ type: 'spring', stiffness: 300, damping: 14 }}
                className="pointer-events-none absolute right-6 top-1/3 grid place-items-center rounded-[14px] border-[5px] px-6 py-3 text-center md:right-16" style={{ borderColor: GR, color: GR }}>
                <span className={`${U} text-[clamp(28px,4vw,48px)] font-extrabold leading-none`}>ПРИНЯТО</span><span className={`${M} text-[12px]`}>перезвоним за 15 минут</span>
              </motion.div>
            )}
          </AnimatePresence>
          {bk.s.sent && <button type="button" onClick={() => { bk.reset(); setSym([]); setCar('') }} className={`${M} mt-6 text-[14px] underline underline-offset-4`}>Новый заказ-наряд</button>}
        </form>
      </div>
    </section>
  )
}

function App() {
  useSmooth()
  return (
    <MotionConfig reducedMotion="user">
      <div className="font-['Inter',sans-serif]" style={{ background: PAPER, color: INK, '--sel': GR, '--selc': '#fff' }}>
        <Intro bg={INK} fg="#fff" duration={1.3}><span className={`${M} text-[18px]`}><Scramble text="> проверка совести… ОК" /></span></Intro>
        <Progress color={GR} />
        <Cursor color={INK} blend="normal" textColor="#fff" />
        <Ribbon name={b.name} bg={GR} fg="#fff" />
        <header className="sticky top-0 z-40 border-b-2 bg-[#f2efe6]/85 backdrop-blur-xl" style={{ borderColor: INK }}>
          <div className="mx-auto flex h-[66px] max-w-[1320px] items-center justify-between px-6 md:px-10">
            <a href="#top" className={`${U} flex items-center gap-2 text-[15px] font-extrabold uppercase`}><span className="grid h-8 w-8 place-items-center rounded-full text-white" style={{ background: GR }}><Check size={16} strokeWidth={3} /></span>Чистая совесть</a>
            <nav className={`${M} hidden gap-8 text-[13px] uppercase md:flex`}>{[['#services', 'Работы'], ['#book', 'Заказ-наряд'], ['#contacts', 'Контакты']].map(([h, t]) => <a key={h} href={h} className="hover:text-[#14a46c]">{t}</a>)}</nav>
            <a href={'tel:' + tel(b.phones[0])} className={`${M} hidden text-[14px] font-semibold sm:inline`}>{b.phones[0]}</a>
          </div>
        </header>
        <main id="top">
          <Hero />
          <Marquee base={-2} className="border-y-2 border-[#13233a] bg-[#13233a] py-4 text-white" skew={false}>
            {['без навязанных работ', 'смета до ремонта', 'старые детали — вам', 'объясняем по-человечески'].map(t => <span key={t} className={`${U} mx-6 inline-flex items-center gap-10 text-[clamp(22px,2.6vw,38px)] font-bold uppercase`}>{t}<Check size={28} color="#5fe0a8" strokeWidth={3} /></span>)}
          </Marquee>
          <Protocol />
          <section id="services" className="px-6 py-28 md:px-10">
            <div className="mx-auto max-w-[1320px]">
              <h2 className={`${U} mb-12 text-[clamp(40px,6vw,96px)] font-extrabold uppercase leading-[.9]`}>Работы</h2>
              <div className="border-t-2" style={{ borderColor: INK }}>
                {SV.map(([t, d], k) => (
                  <Reveal key={t} delay={k * .04}>
                    <a href="#book" data-svc={t} className={`${M} group grid grid-cols-[40px_1fr] items-center gap-3 border-b-2 py-6 transition-colors hover:bg-[#13233a] hover:text-white md:grid-cols-[60px_1fr_1fr_40px] md:px-4`} style={{ borderColor: INK }}>
                      <span className="text-[13px] opacity-50">{String(k + 1).padStart(2, '0')}</span>
                      <span className={`${U} text-[clamp(22px,2.6vw,38px)] font-bold uppercase`}>{t}</span>
                      <span className="col-start-2 text-[15px] opacity-70 md:col-start-auto">{d}</span>
                      <ArrowRight className="hidden transition-transform group-hover:translate-x-2 md:block" />
                    </a>
                  </Reveal>
                ))}
              </div>
              <div className="mt-16 grid gap-0 border-2 md:grid-cols-3" style={{ borderColor: INK }}>
                {[[b.rev, 'оценок на Яндекс.Картах'], [5, 'правил честного ремонта'], [0, 'скрытых работ в счёте']].map(([n, t], k) => <div key={t} className={`p-8 ${k ? 'border-t-2 md:border-l-2 md:border-t-0' : ''}`} style={{ borderColor: INK }}><span className={`${U} block text-[80px] font-extrabold leading-none`} style={{ color: k === 2 ? GR : INK }}><Counter to={n} /></span><span className={`${M} text-[14px] opacity-70`}>{t}</span></div>)}
              </div>
            </div>
          </section>
          <Order />
          <section id="contacts" className="px-6 pb-28 md:px-10">
            <div className="mx-auto grid max-w-[1320px] border-2 md:grid-cols-[.9fr_1.1fr]" style={{ borderColor: INK }}>
              <div className="grid content-start gap-6 p-8 md:p-12">
                <h2 className={`${U} text-[clamp(40px,5vw,80px)] font-extrabold uppercase leading-[.9]`}>Приезжайте</h2>
                <p className={`${M} flex items-start gap-3 text-[20px]`}><MapPin className="mt-1 shrink-0" color={GR} />{b.addr}</p>
                {b.phones.map(p => <a key={p} href={'tel:' + tel(p)} className={`${U} text-[28px] font-bold`}>{p}</a>)}
                <div className="flex flex-wrap gap-2">{messengerLinks(b).map(m => <a key={m.k} href={m.href} target="_blank" rel="noopener" className={`${M} inline-flex items-center gap-2 border-2 px-5 py-3 text-[14px]`} style={{ borderColor: INK }}>{m.Icon && <m.Icon width={16} height={16} />}{m.label}</a>)}</div>
              </div>
              <div className="h-[420px] border-t-2 md:border-l-2 md:border-t-0" style={{ borderColor: INK }}><MapFrame oid={b.oid} /></div>
            </div>
          </section>
        </main>
        <footer className={`${M} border-t-2 px-6 py-10 text-[13px] opacity-70 md:px-10`} style={{ borderColor: INK }}><div className="mx-auto flex max-w-[1320px] flex-wrap justify-between gap-4"><span>© 2026 Чистая Совесть</span><span>Демо-концепт · дизайн и разработка — Артём</span></div></footer>
        <CallBar phone={b.phones[0]} barCls="bg-[#f2efe6]/90 backdrop-blur-xl border-t-2 border-[#13233a]" callCls="border-2 border-[#13233a]" bookCls="bg-[#13233a] text-white" />
        <div className="h-[72px] sm:hidden" />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
