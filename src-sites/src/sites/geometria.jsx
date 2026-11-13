import React, { useRef, useState, useEffect, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, useMotionValueEvent, useMotionValue, useSpring, AnimatePresence, MotionConfig, LayoutGroup } from 'framer-motion'
import { ArrowUpRight, Phone, MapPin, Plus } from 'lucide-react'
import '../lib/base.css'
import { B } from '../data'
import { useSmooth, Ribbon, SplitText, Reveal, Magnetic, Cursor, Marquee, Counter, useBooking, phoneFocus, CheckDraw, MapFrame, messengerLinks, CallBar, Progress, Intro, tel, useLite, Scramble } from '../lib/kit'

const Solids = lazy(() => import('./geometria3d'))
const b = B.geometria
const INK = '#111111', OR = '#ff5a1f', BG = '#ecebe7'
const F = "font-['Space_Grotesk',sans-serif]"
const CH = [
  ['01', 'Точность', 'Маникюр с идеальной линией кутикулы. Аппаратный, комбинированный, классический.'],
  ['02', 'Форма', 'Выравнивание, укрепление и наращивание. Форма, которая держится и не ломается.'],
  ['03', 'Линия', 'Дизайн: от тонкого минимализма до графики и авторских узоров.'],
]
const SV = [
  ['Маникюр', 'Аппаратный, комбинированный или классический — с покрытием или без.'],
  ['Покрытие гель-лаком', 'Ровный блик и стойкость, выравнивание базой.'],
  ['Наращивание', 'Любая длина и форма: квадрат, миндаль, балерина.'],
  ['Педикюр', 'Аппаратный педикюр, обработка стоп и покрытие.'],
  ['Дизайн', 'Френч, графика, втирки, минимализм — по референсу или с нуля.'],
  ['Снятие и уход', 'Бережное снятие, укрепление и восстановление ногтей.'],
]
const SHAPES = {
  'Квадрат': [40, 22, 22, 20, 78],
  'Овал': [62, 26, 26, 16, 74],
  'Миндаль': [72, 40, 40, 6, 60],
  'Балерина': [58, 26, 36, 12, 64],
  'Стилет': [82, 48, 48, -14, 52],
}
const COLORS = [['Нюд', '#e8c3b0'], ['Молочный', '#f5efe6'], ['Графит', '#2a2a2a'], ['Апельсин', '#ff5a1f'], ['Бордо', '#6d1a2a'], ['Хром', 'url(#chrome)']]
const nail = ([sy, c1y, tx1, ty, tx2]) => `M20 170 L20 ${sy} C20 ${c1y} ${tx1} ${ty} 50 ${ty} C${tx2} ${ty} 80 ${c1y} 80 ${sy} L80 170 Z`

function Grid() {
  return <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(17,17,17,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(17,17,17,.07) 1px,transparent 1px)', backgroundSize: '80px 80px' }} />
}

/* crosshair cursor with live coordinates (desktop) */
function Crosshair() {
  const x = useMotionValue(-100), y = useMotionValue(-100)
  const [c, setC] = useState([0, 0]), [on, setOn] = useState(false)
  useEffect(() => {
    if (!matchMedia('(hover:hover) and (pointer:fine)').matches) return
    setOn(true)
    const m = e => { x.set(e.clientX); y.set(e.clientY); setC([e.clientX, e.clientY]) }
    addEventListener('pointermove', m); return () => removeEventListener('pointermove', m)
  }, [])
  if (!on) return null
  return (
    <>
      <motion.div aria-hidden="true" style={{ y }} className="pointer-events-none fixed left-0 right-0 top-0 z-[55] h-px bg-[#111]/15" />
      <motion.div aria-hidden="true" style={{ x }} className="pointer-events-none fixed bottom-0 left-0 top-0 z-[55] w-px bg-[#111]/15" />
      <motion.div aria-hidden="true" style={{ x, y }} className={`pointer-events-none fixed left-0 top-0 z-[55] ml-3 mt-3 ${F} text-[10px] tracking-wider text-[#111]/50`}>x {c[0]} · y {c[1]}</motion.div>
    </>
  )
}

function Story({ lite }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const [i, setI] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', v => setI(Math.min(2, Math.floor(v * 3))))
  const rot = useTransform(scrollYProgress, [0, 1], [0, 180])
  return (
    <section ref={ref} className="relative h-[330vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        <Grid />
        <motion.div style={{ rotate: rot }} className="pointer-events-none absolute right-[-18vw] top-1/2 hidden h-[70vw] w-[70vw] -translate-y-1/2 rounded-full border border-dashed border-[#111]/15 md:block" />
        <div className="absolute inset-0">{!lite ? <Suspense fallback={null}><Solids progress={scrollYProgress} /></Suspense> :
          <motion.div style={{ rotate: rot }} className="absolute right-[10%] top-[30%] h-56 w-56 border-2 border-[#111]" />}</div>
        <div className="relative z-10 mx-auto flex h-full max-w-[1320px] flex-col justify-end px-6 pb-16 md:justify-center md:px-10 md:pb-0">
          <p className={`${F} mb-6 flex items-center gap-3 text-[12px] font-medium uppercase tracking-[.3em]`}><span className="h-2 w-2 bg-[#ff5a1f]" />Ногтевая студия · ул. Чехова, 3</p>
          <h1 className={`${F} text-[clamp(60px,10.5vw,176px)] font-medium leading-[.84] tracking-[-.05em]`}>
            <SplitText text="Геометрия" delay={1.3} className="block" />
            <span className="block h-[1em] overflow-hidden">
              <AnimatePresence mode="wait"><motion.span key={i} initial={{ y: '100%' }} animate={{ y: '0%' }} exit={{ y: '-100%' }} transition={{ duration: .6, ease: [0.76, 0, 0.24, 1] }} className="block text-[#ff5a1f]">{CH[i][1].toLowerCase()}.</motion.span></AnimatePresence>
            </span>
          </h1>
          <div className="mt-8 flex max-w-[520px] items-start gap-6">
            <span className={`${F} text-[13px] text-[#111]/40`}>{CH[i][0]}/03</span>
            <AnimatePresence mode="wait"><motion.p key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-[17px] leading-relaxed text-[#111]/70">{CH[i][2]}</motion.p></AnimatePresence>
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <Magnetic><a href="#book" data-cursor="Запись" className={`${F} inline-flex h-14 items-center gap-3 bg-[#111] px-8 text-[14px] font-medium uppercase tracking-[.14em] text-white transition-colors hover:bg-[#ff5a1f]`}>Записаться <ArrowUpRight size={18} /></a></Magnetic>
            <a href={'tel:' + tel(b.phones[0])} className={`${F} inline-flex h-14 items-center gap-3 border border-[#111] px-7 text-[14px] font-medium`}><Phone size={16} />{b.phones[0]}</a>
          </div>
          <div className="absolute bottom-8 right-6 hidden gap-2 md:right-10 md:flex">{CH.map((_, k) => <span key={k} className={`h-[3px] w-12 transition-colors ${k === i ? 'bg-[#ff5a1f]' : 'bg-[#111]/15'}`} />)}</div>
        </div>
      </div>
    </section>
  )
}

function Builder() {
  const [sh, setSh] = useState('Миндаль'), [col, setCol] = useState(COLORS[0])
  return (
    <section className="relative overflow-hidden bg-[#111] px-6 py-28 text-white md:px-10">
      <div className="mx-auto grid max-w-[1320px] items-center gap-14 md:grid-cols-2">
        <div>
          <p className={`${F} mb-5 text-[12px] uppercase tracking-[.3em] text-[#ff5a1f]`}>Конструктор</p>
          <h2 className={`${F} mb-6 text-[clamp(44px,6vw,96px)] font-medium leading-[.9] tracking-[-.04em]`}>Соберите свой <span className="text-[#ff5a1f]">маникюр</span></h2>
          <p className="mb-10 max-w-[420px] text-white/60">Выберите форму и цвет — мастер увидит ваш выбор в заявке.</p>
          <p className={`${F} mb-3 text-[12px] uppercase tracking-[.2em] text-white/40`}>Форма</p>
          <div className="mb-8 flex flex-wrap gap-2">{Object.keys(SHAPES).map(k => <button key={k} onClick={() => setSh(k)} className={`${F} relative px-5 py-3 text-[14px] ${sh === k ? 'text-[#111]' : 'text-white/70 ring-1 ring-white/20 hover:ring-white/60'}`}>{sh === k && <motion.span layoutId="gsh" className="absolute inset-0 bg-white" transition={{ type: 'spring', bounce: .2, duration: .5 }} />}<span className="relative">{k}</span></button>)}</div>
          <p className={`${F} mb-3 text-[12px] uppercase tracking-[.2em] text-white/40`}>Цвет · {col[0]}</p>
          <div className="mb-10 flex flex-wrap gap-3">{COLORS.map(c => <button key={c[0]} aria-label={c[0]} onClick={() => setCol(c)} className={`h-11 w-11 rounded-full ring-offset-4 ring-offset-[#111] transition-[box-shadow] ${col[0] === c[0] ? 'ring-2 ring-white' : ''}`} style={{ background: c[1].startsWith('url') ? 'linear-gradient(135deg,#fff,#8d8d8d 40%,#fff 60%,#6b6b6b)' : c[1] }} />)}</div>
          <a href="#book" data-svc={`Маникюр: ${sh.toLowerCase()}, ${col[0].toLowerCase()}`} className={`${F} inline-flex h-14 items-center gap-3 bg-[#ff5a1f] px-8 text-[14px] font-medium uppercase tracking-[.14em]`}>Записаться с этим дизайном <ArrowUpRight size={18} /></a>
        </div>
        <div className="relative mx-auto grid aspect-square w-full max-w-[520px] place-items-center">
          <div className="absolute inset-0 rounded-full border border-dashed border-white/15" />
          <div className="absolute inset-[12%] rounded-full border border-white/10" />
          <svg viewBox="-10 -30 120 210" className="relative h-[78%]">
            <defs>
              <linearGradient id="chrome" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff" /><stop offset=".35" stopColor="#8d8d8d" /><stop offset=".55" stopColor="#ffffff" /><stop offset="1" stopColor="#5d5d5d" /></linearGradient>
              <linearGradient id="gloss" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset=".3" stopColor="#fff" stopOpacity=".55" /><stop offset=".45" stopColor="#fff" stopOpacity="0" /></linearGradient>
            </defs>
            <rect x="8" y="110" width="84" height="80" rx="30" fill="#d9b7a3" />
            <motion.path animate={{ d: nail(SHAPES[sh]) }} transition={{ type: 'spring', stiffness: 120, damping: 14 }} fill={col[1]} style={{ transition: 'fill .45s' }} stroke="#111" strokeWidth=".6" />
            <motion.path animate={{ d: nail(SHAPES[sh]) }} transition={{ type: 'spring', stiffness: 120, damping: 14 }} fill="url(#gloss)" />
          </svg>
          {[['Форма', sh, 'left-0 top-[18%]'], ['Цвет', col[0], 'right-0 bottom-[22%]']].map(([a, v, pos]) => <div key={a} className={`absolute ${pos} ${F} bg-white/5 px-4 py-3 text-[12px] ring-1 ring-white/15 backdrop-blur`}><span className="block text-white/40">{a}</span><b className="text-[16px] font-medium">{v}</b></div>)}
        </div>
      </div>
    </section>
  )
}

function Services() {
  const [open, setOpen] = useState(0)
  return (
    <section id="services" className="relative px-6 py-28 md:px-10">
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <h2 className={`${F} text-[clamp(48px,7vw,120px)] font-medium leading-[.88] tracking-[-.05em]`}><Scramble text="Услуги" /></h2>
          <p className="max-w-[320px] text-[#111]/60">Нажмите на услугу, чтобы раскрыть. Стоимость мастер подтвердит при записи.</p>
        </div>
        <LayoutGroup>
          <div className="border-t border-[#111]">
            {SV.map(([t, d], k) => (
              <motion.div layout key={t} onClick={() => setOpen(k)} className="cursor-pointer border-b border-[#111]" data-cursor={open === k ? '' : 'Открыть'}>
                <motion.div layout="position" className="flex items-center gap-6 py-7">
                  <span className={`${F} w-10 text-[13px] text-[#111]/40`}>0{k + 1}</span>
                  <h3 className={`${F} flex-1 text-[clamp(28px,4vw,60px)] font-medium tracking-[-.03em] transition-colors ${open === k ? 'text-[#ff5a1f]' : ''}`}>{t}</h3>
                  <motion.span animate={{ rotate: open === k ? 45 : 0 }}><Plus size={28} /></motion.span>
                </motion.div>
                <AnimatePresence initial={false}>
                  {open === k && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="flex flex-wrap items-center justify-between gap-6 pb-8 pl-16"><p className="max-w-[520px] text-[17px] text-[#111]/70">{d}</p><a href="#book" data-svc={t} className={`${F} inline-flex h-12 items-center gap-2 bg-[#111] px-6 text-[13px] uppercase tracking-[.14em] text-white`}>Записаться <ArrowUpRight size={16} /></a></div>
                  </motion.div>}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </LayoutGroup>
      </div>
    </section>
  )
}

function Book() {
  const bk = useBooking()
  const f = `${F} h-14 w-full border-0 border-b-2 border-[#111]/20 bg-transparent text-[20px] outline-none focus:border-[#ff5a1f] placeholder:text-[#111]/30`
  return (
    <section id="book" className="relative overflow-hidden px-6 py-28 md:px-10">
      <Grid />
      <div className="relative mx-auto grid max-w-[1320px] gap-12 bg-white p-8 ring-1 ring-[#111] md:grid-cols-2 md:p-16">
        <span className="absolute -left-[6px] -top-[6px] h-3 w-3 bg-[#ff5a1f]" /><span className="absolute -bottom-[6px] -right-[6px] h-3 w-3 bg-[#ff5a1f]" />
        <div>
          <h2 className={`${F} text-[clamp(48px,6vw,100px)] font-medium leading-[.88] tracking-[-.05em]`}>Запись<br /><span className="text-[#ff5a1f]">к мастеру</span></h2>
          <p className="mb-8 mt-6 max-w-[380px] text-[#111]/60">Оставьте номер — администратор перезвонит и подберёт время.</p>
          {b.phones.map(p => <a key={p} href={'tel:' + tel(p)} className={`${F} text-[34px] font-medium`}>{p}</a>)}
        </div>
        <AnimatePresence mode="wait">
          {!bk.s.sent ? (
            <motion.form key="f" exit={{ opacity: 0, x: 30 }} onSubmit={bk.submit} noValidate className="grid content-start gap-7">
              <input className={f} placeholder="Имя" value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} autoComplete="name" />
              <motion.input animate={bk.s.err ? { x: [0, -8, 8, -6, 6, 0] } : {}} className={f + (bk.s.err ? ' !border-red-500' : '')} type="tel" inputMode="tel" placeholder="+375 (__) ___-__-__" value={bk.s.phone} onFocus={phoneFocus(bk)} onChange={e => bk.upd('phone', e.target.value)} autoComplete="tel" />
              <input className={f} placeholder="Услуга" value={bk.s.svc} onChange={e => bk.upd('svc', e.target.value)} />
              <button disabled={bk.s.loading} className={`${F} h-16 bg-[#111] text-[14px] uppercase tracking-[.18em] text-white transition-colors hover:bg-[#ff5a1f] disabled:opacity-60`}>{bk.s.loading ? 'Отправляем…' : 'Записаться'}</button>
              <p className="text-[13px] text-[#111]/50">В готовом сайте заявка сразу придёт вам в Telegram.</p>
            </motion.form>
          ) : (
            <motion.div key="ok" initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }} className="grid place-items-center py-10 text-center">
              <div><CheckDraw className="mx-auto mb-5 text-[#ff5a1f]" /><h3 className={`${F} text-[40px] font-medium`}>Заявка принята</h3><p className="mb-5 text-[#111]/60">Так клиент увидит подтверждение.</p><button onClick={bk.reset} className="underline underline-offset-4">Ещё одна запись</button></div>
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
  return (
    <MotionConfig reducedMotion="user">
      <div className="font-['Space_Grotesk',sans-serif]" style={{ background: BG, color: INK, '--sel': OR, '--selc': '#fff' }}>
        <Intro bg={INK} fg="#fff" duration={1.5}>
          <svg viewBox="0 0 200 200" className="w-40"><motion.polygon points="100,10 190,170 10,170" fill="none" stroke={OR} strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: .9 }} /><motion.circle cx="100" cy="118" r="40" fill="none" stroke="#fff" strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: .9, delay: .2 }} /></svg>
        </Intro>
        <Crosshair />
        <Progress color={OR} />
        <Cursor color={INK} blend="normal" textColor="#fff" />
        <Ribbon name={b.name} bg={INK} fg="#fff" />
        <header className="sticky top-0 z-40 border-b border-[#111]/15 bg-[#ecebe7]/80 backdrop-blur-xl">
          <div className="mx-auto flex h-[70px] max-w-[1320px] items-center justify-between px-6 md:px-10">
            <a href="#top" className="flex items-center gap-3 text-[18px] font-semibold tracking-[-.02em]"><svg width="26" height="26" viewBox="0 0 26 26"><polygon points="13,2 24,22 2,22" fill="none" stroke="#111" strokeWidth="2" /><circle cx="13" cy="16" r="4" fill={OR} /></svg>Геометрия</a>
            <nav className="hidden gap-8 text-[13px] uppercase tracking-[.16em] text-[#111]/60 md:flex">{[['#services', 'Услуги'], ['#book', 'Запись'], ['#contacts', 'Контакты']].map(([h, t]) => <a key={h} href={h} className="hover:text-[#111]">{t}</a>)}</nav>
            <a href="#book" className="hidden h-11 items-center bg-[#111] px-6 text-[13px] uppercase tracking-[.14em] text-white sm:inline-flex">Записаться</a>
          </div>
        </header>
        <main id="top">
          <Story lite={lite} />
          <Marquee base={-2} className="border-y border-[#111] bg-[#ff5a1f] py-5 text-white">
            {['маникюр', 'педикюр', 'наращивание', 'дизайн', 'покрытие', 'уход'].map(t => <span key={t} className="mx-6 inline-flex items-center gap-12 text-[clamp(32px,4vw,60px)] font-medium tracking-[-.03em]">{t}<svg width="28" height="28" viewBox="0 0 26 26"><polygon points="13,2 24,22 2,22" fill="none" stroke="#fff" strokeWidth="2.5" /></svg></span>)}
          </Marquee>
          <Services />
          <Builder />
          <section className="px-6 py-24 md:px-10">
            <div className="mx-auto grid max-w-[1320px] border-l border-t border-[#111] md:grid-cols-3">
              {[[b.rev, 'оценок на Яндекс.Картах'], [5, 'форм ногтей в конструкторе'], [60, 'секунд на онлайн-запись']].map(([n, t]) => <div key={t} className="border-b border-r border-[#111] p-10"><span className="block text-[96px] font-medium leading-none tracking-[-.06em]"><Counter to={n} /></span><span className="text-[#111]/60">{t}</span></div>)}
            </div>
          </section>
          <Book />
          <section id="contacts" className="px-6 pb-28 md:px-10">
            <div className="mx-auto grid max-w-[1320px] gap-0 ring-1 ring-[#111] md:grid-cols-[.9fr_1.1fr]">
              <div className="grid content-start gap-7 p-8 md:p-12">
                <h2 className="text-[clamp(48px,6vw,96px)] font-medium leading-[.9] tracking-[-.05em]">Координаты</h2>
                <p className="flex items-start gap-3 text-[24px]"><MapPin className="mt-1 shrink-0 text-[#ff5a1f]" />{b.addr}</p>
                {b.phones.map(p => <a key={p} href={'tel:' + tel(p)} className="text-[32px] font-medium">{p}</a>)}
                <div className="flex flex-wrap gap-2">{messengerLinks(b).map(m => <a key={m.k} href={m.href} target="_blank" rel="noopener" className="inline-flex items-center gap-2 border border-[#111] px-5 py-3 text-[14px] hover:bg-[#111] hover:text-white">{m.Icon && <m.Icon width={16} height={16} />}{m.label}</a>)}</div>
              </div>
              <div className="h-[420px] border-t border-[#111] md:border-l md:border-t-0"><MapFrame oid={b.oid} /></div>
            </div>
          </section>
        </main>
        <footer className="border-t border-[#111]/15 px-6 py-10 text-[13px] text-[#111]/50 md:px-10"><div className="mx-auto flex max-w-[1320px] flex-wrap justify-between gap-4"><span>© 2026 Геометрия</span><span>Демо-концепт · дизайн и разработка — Артём</span></div></footer>
        <CallBar phone={b.phones[0]} barCls="bg-[#ecebe7]/90 backdrop-blur-xl border-t border-[#111]/15" callCls="border border-[#111]" bookCls="bg-[#111] text-white" />
        <div className="h-[72px] sm:hidden" />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
