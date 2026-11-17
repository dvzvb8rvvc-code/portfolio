import React, { useRef, useState, useEffect, useMemo, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, useSpring, useInView, useMotionValue, useMotionTemplate, AnimatePresence, MotionConfig } from 'framer-motion'
import { Search, CornerDownLeft, ArrowUp, ArrowDown, Phone, MapPin, Star, Footprints, Eye, Sparkles, Hand, MessageCircle, ArrowUpRight, Command } from 'lucide-react'
import '../lib/base.css'
import { useSmooth, Ribbon, LineReveal, Reveal, useBooking, CheckDraw, MapFrame, CallBar, tel, useLite, IG, WA } from '../lib/kit'

const Keys = lazy(() => import('./goldenbeauty3d'))

const b = {
  name: 'Голден Бьюти', addr: 'ул. Скрипникова, 21', city: 'Минск', phone: '+375 33 619-14-95',
  viber: 'https://viber.click/375336191495', wa: 'https://wa.me/375336191495', ig: 'https://www.instagram.com/golden.beauty.minsk',
  rating: '5,0', rev: 89, oid: '241533855036',
}
const BG = '#08070a'
const SANS = "font-['Inter',sans-serif]", MONO = "font-['JetBrains_Mono',monospace]"
const GOLD = 'linear-gradient(135deg,#ffe3a1 0%,#f5b84a 45%,#ff8a1f 100%)'
const GOLD_T = 'bg-clip-text text-transparent bg-[linear-gradient(100deg,#fff1cf,#f5b84a_45%,#ff8a1f)]'

const RANGES = [[0.14, 0.34], [0.34, 0.54], [0.54, 0.74], [0.74, 1.01]]
const CH = [
  { n: '1', g: 'Подология', t: 'Здоровые стопы — лёгкий шаг.', d: 'Бережная работа с кожей и ногтями стоп: от консультации до регулярного ухода.', I: Footprints },
  { n: '2', g: 'Брови', t: 'Форма, которая подходит лицу.', d: 'Коррекция, окрашивание и ламинирование — аккуратно и естественно.', I: Sparkles },
  { n: '3', g: 'Ресницы', t: 'Взгляд без лишних усилий.', d: 'Наращивание и ламинирование — подбираем эффект под вас.', I: Eye },
  { n: '4', g: 'Маникюр', t: 'Аккуратные руки — каждый день.', d: 'Маникюр и покрытие, которые выглядят опрятно.', I: Hand },
]

/* ---------------- keyboard chip ---------------- */
function Kbd({ children, className = '' }) {
  return <kbd className={`${MONO} inline-flex h-[22px] min-w-[22px] items-center justify-center rounded-[6px] border border-white/15 bg-gradient-to-b from-white/[.14] to-white/[.04] px-1.5 text-[11px] font-medium text-white/80 shadow-[inset_0_-1px_0_rgba(0,0,0,.4)] ${className}`}>{children}</kbd>
}

/* ---------------- film ---------------- */
function Caption({ p, c, i }) {
  const [a, z] = RANGES[i]
  const k = [a, a + 0.04, z - 0.04, z]
  const o = useTransform(p, k, [0, 1, 1, 0]), y = useTransform(p, k, [30, 0, 0, -20])
  return (
    <motion.div style={{ opacity: o, y }} className="pointer-events-none absolute inset-x-5 bottom-[100px] md:bottom-auto md:left-12 md:right-auto md:top-[32%] md:w-[440px]">
      <div className="rounded-[20px] border border-white/10 bg-white/[.04] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,.08)] backdrop-blur-2xl md:p-8">
        <div className="flex items-center gap-3"><Kbd>⌘</Kbd><Kbd>{c.n}</Kbd><span className={`${MONO} text-[12px] uppercase tracking-[.16em] text-[#f5b84a]`}>{c.g}</span></div>
        <h2 className="mt-5 text-[clamp(26px,3vw,40px)] font-semibold leading-[1.05] tracking-[-0.035em]">{c.t}</h2>
        <p className="mt-3 text-[15.5px] leading-relaxed text-white/55">{c.d}</p>
      </div>
    </motion.div>
  )
}
function LiteKeys() {
  return (
    <div className="absolute right-[8%] top-[22%] hidden grid-cols-2 gap-4 md:grid" style={{ transform: 'perspective(800px) rotateX(40deg) rotateZ(-20deg)' }}>
      {CH.map(c => <div key={c.n} className="grid h-28 w-28 place-items-center rounded-[26px] shadow-[0_20px_40px_rgba(0,0,0,.6),inset_0_2px_0_rgba(255,255,255,.6)]" style={{ background: GOLD }}><c.I size={40} className="text-[#3b2306]" /></div>)}
    </div>
  )
}
function Film({ lite }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.35 })
  const near = useInView(ref, { margin: '200px 0px' })
  const [m, setM] = useState(false)
  useEffect(() => { if (near) setM(true) }, [near])
  const heroO = useTransform(p, [0, 0.1], [1, 0]), heroY = useTransform(p, [0, 0.1], [0, -40])
  const heroPE = useTransform(p, v => (v < 0.06 ? 'auto' : 'none'))
  return (
    <section ref={ref} id="top" className="relative h-[480vh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="pointer-events-none absolute left-1/2 top-[30%] h-[520px] w-[900px] -translate-x-1/2 rounded-full opacity-30 blur-[120px] md:left-[68%]" style={{ background: 'radial-gradient(circle,#ff9a1f,transparent 65%)' }} />
        <div className="pointer-events-none absolute inset-0 opacity-[.35] [background-image:linear-gradient(rgba(255,255,255,.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.04)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
        <div className="absolute inset-0">{lite ? <LiteKeys /> : m && <Suspense fallback={null}><Keys progress={p} active={near} /></Suspense>}</div>
        <motion.div style={{ opacity: heroO, y: heroY, pointerEvents: heroPE }} className="absolute inset-x-0 bottom-[96px] px-5 md:bottom-auto md:left-12 md:right-auto md:top-[20%] md:max-w-[620px] md:px-0">
          <motion.a href="#book" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.04] py-1.5 pl-1.5 pr-3.5 text-[13px] text-white/70 backdrop-blur hover:border-white/25">
            <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold text-[#2a1703]" style={{ background: GOLD }}>{b.rating}</span>{b.rev} оценок на Яндекс Картах
          </motion.a>
          <h1 className="text-[clamp(42px,6.4vw,92px)] font-semibold leading-[.98] tracking-[-0.05em]">
            <LineReveal delay={0.1}>Красота</LineReveal>
            <LineReveal delay={0.2} className={GOLD_T}>в одну команду.</LineReveal>
          </h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-5 max-w-[440px] text-[16px] leading-relaxed text-white/55 md:text-[17px]">Подология, брови и ресницы на Скрипникова, 21. Напишите, что нужно, — и запишитесь за пару нажатий.</motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 }} className="mt-8 hidden items-center gap-4 md:flex">
            <a href="#book" className="inline-flex h-12 items-center gap-3 rounded-[12px] px-5 text-[15px] font-semibold text-[#2a1703] shadow-[0_10px_40px_-10px_#ff9a1f,inset_0_1px_0_rgba(255,255,255,.6)]" style={{ background: GOLD }}>Записаться <span className="flex gap-1"><Kbd className="border-black/20 bg-black/10 from-transparent to-transparent text-[#2a1703]">⌘</Kbd><Kbd className="border-black/20 bg-black/10 from-transparent to-transparent text-[#2a1703]">K</Kbd></span></a>
            <a href="#services" className="text-[15px] text-white/60 hover:text-white">Все услуги →</a>
          </motion.div>
        </motion.div>
        {CH.map((c, i) => <Caption key={c.n} p={p} c={c} i={i} />)}
      </div>
    </section>
  )
}

/* ---------------- command bar booking ---------------- */
const ITEMS = [
  { g: 'Подология', t: 'Консультация подолога', kw: 'стопы ноги подолог' },
  { g: 'Подология', t: 'Медицинский педикюр', kw: 'педикюр стопы ноги' },
  { g: 'Подология', t: 'Вросший ноготь', kw: 'ноготь боль ноги' },
  { g: 'Подология', t: 'Обработка стоп', kw: 'мозоли трещины пятки' },
  { g: 'Брови', t: 'Коррекция бровей', kw: 'форма брови' },
  { g: 'Брови', t: 'Окрашивание бровей', kw: 'цвет брови краска' },
  { g: 'Брови', t: 'Ламинирование бровей', kw: 'укладка брови' },
  { g: 'Ресницы', t: 'Наращивание ресниц', kw: 'объём ресницы глаза' },
  { g: 'Ресницы', t: 'Ламинирование ресниц', kw: 'изгиб ресницы глаза' },
  { g: 'Маникюр', t: 'Маникюр', kw: 'руки ногти' },
  { g: 'Маникюр', t: 'Маникюр с покрытием', kw: 'гель лак руки ногти' },
  { g: 'Другое', t: 'Не знаю, нужна консультация', kw: 'помощь вопрос совет' },
]
const ICON = { 'Подология': Footprints, 'Брови': Sparkles, 'Ресницы': Eye, 'Маникюр': Hand, 'Другое': Search }
const WHEN = ['Сегодня', 'Завтра', 'На этой неделе', 'На следующей неделе', 'Подберите время сами']
const PH = ['Что вам нужно?', 'Когда удобно?', 'Как к вам обращаться?', 'Ваш телефон']

function Row({ on, icon: I, title, sub, onPick, onHover }) {
  return (
    <button type="button" role="option" aria-selected={on} onClick={onPick} onMouseMove={onHover}
      className={`flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left transition-colors ${on ? 'bg-white/[.09]' : ''}`}>
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[8px] shadow-[inset_0_1px_0_rgba(255,255,255,.5)]" style={{ background: GOLD }}><I size={16} className="text-[#3b2306]" /></span>
      <span className="min-w-0 flex-1 truncate text-[15px] text-white/90">{title}</span>
      {sub && <span className="hidden text-[13px] text-white/35 sm:inline">{sub}</span>}
      {on && <CornerDownLeft size={15} className="shrink-0 text-white/45" />}
    </button>
  )
}

function CommandBar({ inputRef }) {
  const bk = useBooking()
  const [step, setStep] = useState(0)
  const [q, setQ] = useState('')
  const [act, setAct] = useState(0)
  const [pick, setPick] = useState({ svc: null, when: null, name: '' })
  const [err, setErr] = useState('')
  const list = useMemo(() => {
    if (step === 0) { const s = q.trim().toLowerCase(); return ITEMS.filter(i => !s || (i.t + ' ' + i.g + ' ' + i.kw).toLowerCase().includes(s)) }
    if (step === 1) return WHEN.filter(w => !q.trim() || w.toLowerCase().includes(q.trim().toLowerCase())).map(w => ({ t: w, g: 'Время' }))
    return []
  }, [q, step])
  useEffect(() => setAct(0), [q, step])
  const choose = it => {
    setErr('')
    if (step === 0) { setPick(p => ({ ...p, svc: it.t })); setQ(''); setStep(1) }
    else if (step === 1) { setPick(p => ({ ...p, when: it.t })); setQ(''); setStep(2) }
  }
  const back = () => {
    if (step === 0) return
    const n = step - 1
    setQ(n === 2 ? pick.name : ''); if (n === 2) bk.upd('phone', '')
    setStep(n); setErr('')
  }
  const enter = () => {
    if (step < 2) { if (list[act]) choose(list[act]); return }
    if (step === 2) { setPick(p => ({ ...p, name: q.trim() })); bk.upd('name', q.trim()); setQ(''); bk.upd('phone', '+375 '); setStep(3); return }
    bk.set(p => ({ ...p, svc: `${pick.svc} · ${pick.when}` }))
    if (!bk.submit()) setErr('Проверьте номер — 12 цифр с кодом +375')
  }
  const key = e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setAct(a => Math.min(list.length - 1, a + 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setAct(a => Math.max(0, a - 1)) }
    else if (e.key === 'Enter') { e.preventDefault(); enter() }
    else if (e.key === 'Escape') { e.preventDefault(); back() }
    else if (e.key === 'Backspace' && !(step === 3 ? bk.s.phone.replace(/\D/g, '').length > 3 : q)) { if (step > 0) { e.preventDefault(); back() } }
  }
  const val = step === 3 ? bk.s.phone : q
  const onChange = e => { setErr(''); step === 3 ? bk.upd('phone', e.target.value) : setQ(e.target.value) }
  const reset = () => { bk.reset(); setPick({ svc: null, when: null, name: '' }); setQ(''); setStep(0); setTimeout(() => inputRef.current?.focus(), 50) }
  const crumbs = [pick.svc, pick.when, step > 2 && (pick.name || 'Без имени')].filter((c, i) => c && i < step)
  // group headers for step 0
  let lastG = null
  return (
    <div className="relative mx-auto w-full max-w-[720px]">
      <div className="absolute -inset-px rounded-[22px] opacity-70" style={{ background: 'linear-gradient(140deg,rgba(255,214,140,.6),rgba(255,255,255,.06) 30%,rgba(255,255,255,.04) 70%,rgba(255,138,31,.5))' }} />
      <div className="relative overflow-hidden rounded-[21px] bg-[#141216]/90 shadow-[0_50px_120px_-30px_rgba(255,138,31,.35),inset_0_1px_0_rgba(255,255,255,.08)] backdrop-blur-2xl">
        {bk.s.sent ? (
          <div className="px-6 py-14 text-center" role="status">
            <CheckDraw className="mx-auto text-[#f5b84a]" />
            <p className="mt-5 text-[26px] font-semibold tracking-[-0.03em]">Заявка отправлена</p>
            <p className="mx-auto mt-2 max-w-[420px] text-[15px] text-white/55">{pick.svc} · {pick.when}. Мастер свяжется с вами для подтверждения. В готовом сайте заявка сразу придёт вам в Telegram.</p>
            <button type="button" onClick={reset} className="mt-7 inline-flex items-center gap-2 text-[14px] text-white/60 hover:text-white">Новая запись <Kbd>↵</Kbd></button>
          </div>
        ) : (<>
          <div className="flex items-center gap-2 border-b border-white/[.07] px-4 py-3.5 md:px-5">
            {step === 0 ? <Search size={18} className="shrink-0 text-white/40" /> : <button type="button" onClick={back} aria-label="Назад" className="shrink-0"><Kbd>esc</Kbd></button>}
            <div className="flex min-w-0 shrink items-center gap-1.5 overflow-hidden">
              {crumbs.map(c => <span key={c} className="hidden max-w-[160px] shrink-0 truncate rounded-[7px] bg-[#f5b84a]/15 px-2 py-1 text-[12.5px] text-[#ffd48a] sm:inline">{c}</span>)}
            </div>
            <input ref={inputRef} value={val} onChange={onChange} onKeyDown={key} placeholder={PH[step]} aria-label={PH[step]}
              type={step === 3 ? 'tel' : 'text'} inputMode={step === 3 ? 'tel' : 'text'} autoComplete={step === 3 ? 'tel' : step === 2 ? 'name' : 'off'}
              role="combobox" aria-expanded={step < 2} aria-controls="cmd-list"
              className="min-w-0 flex-1 bg-transparent py-1 text-[17px] text-white outline-none placeholder:text-white/35 md:text-[18px]" />
            <span className={`${MONO} hidden shrink-0 text-[11px] text-white/30 sm:inline`}>{step + 1}/4</span>
          </div>
          <div id="cmd-list" role="listbox" className="h-[340px] overflow-y-auto p-2 [scrollbar-width:thin]" data-lenis-prevent>
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.22 }}>
                {step < 2 && list.length === 0 && <p className="px-3 py-8 text-center text-[14px] text-white/40">Ничего не нашли — <button type="button" className="text-[#ffd48a] underline underline-offset-4" onClick={() => choose({ t: q.trim() || 'Консультация' })}>записаться на «{q.trim()}»</button></p>}
                {step === 0 && list.map((it, i) => {
                  const head = it.g !== lastG; lastG = it.g
                  return (
                    <React.Fragment key={it.t}>
                      {head && <p className={`${MONO} px-3 pb-1.5 pt-3 text-[11px] uppercase tracking-[.14em] text-white/30`}>{it.g}</p>}
                      <Row on={i === act} icon={ICON[it.g]} title={it.t} sub="Записаться" onPick={() => choose(it)} onHover={() => setAct(i)} />
                    </React.Fragment>
                  )
                })}
                {step === 1 && (<>
                  <p className={`${MONO} px-3 pb-1.5 pt-3 text-[11px] uppercase tracking-[.14em] text-white/30`}>Когда</p>
                  {list.map((it, i) => <Row key={it.t} on={i === act} icon={Command} title={it.t} onPick={() => choose(it)} onHover={() => setAct(i)} />)}
                </>)}
                {step >= 2 && (
                  <div className="px-3 py-5">
                    <p className="text-[15px] text-white/60">{step === 2 ? 'Имя — по желанию. Можно сразу нажать ↵.' : 'Номер для подтверждения записи. Перезвоним или напишем в Viber / WhatsApp.'}</p>
                    <div className="mt-6 space-y-2 rounded-[14px] border border-white/[.07] bg-white/[.03] p-4 text-[14.5px]">
                      <p className="flex justify-between gap-4"><span className="text-white/40">Услуга</span><span className="text-right">{pick.svc}</span></p>
                      <p className="flex justify-between gap-4"><span className="text-white/40">Когда</span><span className="text-right">{pick.when}</span></p>
                      {step === 3 && <p className="flex justify-between gap-4"><span className="text-white/40">Имя</span><span>{pick.name || '—'}</span></p>}
                    </div>
                    {err && <p className="mt-4 text-[14px] text-[#ff9a7a]" role="alert">{err}</p>}
                    <button type="button" onClick={enter} disabled={bk.s.loading} className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[10px] text-[15px] font-semibold text-[#2a1703] disabled:opacity-60 sm:w-auto sm:px-6" style={{ background: GOLD }}>
                      {step === 2 ? 'Дальше' : bk.s.loading ? 'Отправляем…' : 'Отправить заявку'} <CornerDownLeft size={15} />
                    </button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="flex items-center justify-between border-t border-white/[.07] px-4 py-2.5 text-[12px] text-white/40 md:px-5">
            <span className="flex items-center gap-2"><span className="h-4 w-4 rounded-[5px]" style={{ background: GOLD }} />Golden Beauty</span>
            <span className="hidden items-center gap-3 sm:flex"><span className="flex items-center gap-1"><Kbd><ArrowUp size={11} /></Kbd><Kbd><ArrowDown size={11} /></Kbd> выбор</span><span className="flex items-center gap-1"><Kbd>↵</Kbd> далее</span><span className="flex items-center gap-1"><Kbd>esc</Kbd> назад</span></span>
          </div>
        </>)}
      </div>
    </div>
  )
}

function Book({ inputRef }) {
  return (
    <section id="book" className="relative px-5 py-28 md:py-40">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25 blur-[120px]" style={{ background: 'radial-gradient(circle,#ff9a1f,transparent 60%)' }} />
      <div className="relative mx-auto max-w-[1200px] text-center">
        <Reveal><p className={`${MONO} text-[12px] uppercase tracking-[.2em] text-[#f5b84a]`}>Запись</p></Reveal>
        <Reveal delay={0.05}><h2 className="mx-auto mt-4 max-w-[760px] text-[clamp(34px,5vw,68px)] font-semibold leading-[1] tracking-[-0.045em]">Начните печатать — <span className={GOLD_T}>мы найдём</span></h2></Reveal>
        <Reveal delay={0.1}><p className="mx-auto mt-5 max-w-[460px] text-[16px] text-white/50">Услуга, время, телефон — четыре шага прямо в строке. Работает с клавиатуры и пальцем.</p></Reveal>
        <Reveal delay={0.15} className="mt-12 text-left"><CommandBar inputRef={inputRef} /></Reveal>
      </div>
    </section>
  )
}

/* ---------------- bento extensions ---------------- */
function Glow({ children, className = '', ...rest }) {
  const x = useMotionValue(-300), y = useMotionValue(-300)
  const bg = useMotionTemplate`radial-gradient(360px circle at ${x}px ${y}px, rgba(255,180,80,.18), transparent 60%)`
  const border = useMotionTemplate`radial-gradient(260px circle at ${x}px ${y}px, rgba(255,200,120,.9), transparent 60%)`
  return (
    <div onPointerMove={e => { const r = e.currentTarget.getBoundingClientRect(); x.set(e.clientX - r.left); y.set(e.clientY - r.top) }} onPointerLeave={() => { x.set(-300); y.set(-300) }}
      className={`group relative rounded-[22px] bg-white/[.06] p-px ${className}`} {...rest}>
      <motion.div className="absolute inset-0 rounded-[22px]" style={{ background: border }} />
      <div className="relative h-full overflow-hidden rounded-[21px] bg-[#121014] p-6 md:p-7">
        <motion.div className="pointer-events-none absolute inset-0" style={{ background: bg }} />
        <div className="relative flex h-full flex-col">{children}</div>
      </div>
    </div>
  )
}
function GoldIcon({ I, big }) {
  return (
    <motion.span whileHover={{ rotate: -6, scale: 1.06 }} className={`relative grid place-items-center ${big ? 'h-20 w-20 rounded-[22px]' : 'h-14 w-14 rounded-[16px]'} shadow-[0_18px_40px_-12px_rgba(255,138,31,.6),inset_0_2px_0_rgba(255,255,255,.65),inset_0_-3px_0_rgba(120,60,0,.35)]`} style={{ background: GOLD }}>
      <I size={big ? 36 : 26} strokeWidth={2.2} className="text-[#3b2306]" />
      <span className="absolute inset-x-2 top-1 h-1/3 rounded-full bg-white/30 blur-[2px]" />
    </motion.span>
  )
}
const EXT = [
  { I: Footprints, t: 'Подология', d: 'Уход за стопами и ногтями: консультация, обработка, проблемные ногти.', cmd: 'подолог', span: 'md:col-span-2 md:row-span-2', big: true, tags: ['Консультация', 'Медицинский педикюр', 'Вросший ноготь', 'Обработка стоп'] },
  { I: Sparkles, t: 'Брови', d: 'Коррекция, окрашивание, ламинирование.', cmd: 'брови' },
  { I: Eye, t: 'Ресницы', d: 'Наращивание и ламинирование.', cmd: 'ресницы' },
  { I: Hand, t: 'Маникюр', d: 'Аккуратные руки и покрытие.', cmd: 'маникюр', span: 'md:col-span-2' },
]
function Bento({ openWith }) {
  return (
    <section id="services" className="px-5 pb-28 md:px-12 md:pb-36">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-[clamp(34px,4.6vw,64px)] font-semibold leading-[1] tracking-[-0.045em]">Расширения<br /><span className="text-white/35">для вашей красоты</span></h2>
          <p className="max-w-[340px] text-[15px] text-white/50">Каждая карточка — услуга. Нажмите, и строка записи откроется уже с запросом.</p>
        </div>
        <div className="grid auto-rows-[minmax(220px,auto)] gap-4 md:grid-cols-4">
          {EXT.map(e => (
            <Glow key={e.t} className={e.span || ''}>
              <button type="button" onClick={() => openWith(e.cmd)} className="flex h-full flex-col text-left">
                <GoldIcon I={e.I} big={e.big} />
                <p className={`mt-auto pt-8 font-semibold tracking-[-0.03em] ${e.big ? 'text-[34px]' : 'text-[22px]'}`}>{e.t}</p>
                <p className="mt-1.5 text-[14.5px] leading-relaxed text-white/50">{e.d}</p>
                {e.tags && <div className="mt-5 flex flex-wrap gap-2">{e.tags.map(t => <span key={t} className="rounded-[8px] border border-white/10 bg-white/[.03] px-2.5 py-1 text-[12.5px] text-white/60">{t}</span>)}</div>}
                <span className={`${MONO} mt-5 inline-flex items-center gap-2 text-[12px] text-white/40`}><Kbd>⌘K</Kbd> {e.cmd}</span>
              </button>
            </Glow>
          ))}
          <Glow>
            <div className="flex items-center gap-1">{[0, 1, 2, 3, 4].map(i => <Star key={i} size={16} className="fill-[#f5b84a] text-[#f5b84a]" />)}</div>
            <p className={`mt-auto text-[64px] font-semibold leading-none tracking-[-0.05em] ${GOLD_T}`}>{b.rating}</p>
            <p className="mt-2 text-[14px] text-white/50">{b.rev} оценок на Яндекс Картах</p>
          </Glow>
          <Glow className="md:col-span-2">
            <MapPin size={20} className="text-[#f5b84a]" />
            <p className="mt-auto pt-8 text-[26px] font-semibold tracking-[-0.03em]">{b.addr}</p>
            <p className="text-[14.5px] text-white/50">{b.city}</p>
          </Glow>
          <Glow>
            <a href={b.ig} target="_blank" rel="noopener" className="flex h-full flex-col">
              <IG width={22} height={22} className="text-[#f5b84a]" />
              <p className="mt-auto pt-8 text-[20px] font-semibold tracking-[-0.03em]">Instagram</p>
              <p className="break-all text-[13.5px] text-white/50">@golden.beauty.minsk</p>
              <ArrowUpRight size={18} className="absolute right-0 top-0 text-white/30 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
            </a>
          </Glow>
        </div>
      </div>
    </section>
  )
}

function Contact() {
  const L = 'inline-flex h-11 items-center gap-2 rounded-[10px] border border-white/10 bg-white/[.04] px-4 text-[14px] font-medium hover:border-white/30'
  return (
    <section id="contact" className="px-5 pb-24 md:px-12">
      <div className="mx-auto grid max-w-[1200px] gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[22px] border border-white/[.08] bg-white/[.03] p-7 md:p-10">
          <h2 className="text-[clamp(30px,3.6vw,48px)] font-semibold tracking-[-0.04em]">Контакты</h2>
          <p className="mt-6 flex items-start gap-3 text-[17px]"><MapPin size={19} className="mt-0.5 shrink-0 text-[#f5b84a]" />{b.addr}, {b.city}</p>
          <a href={'tel:' + tel(b.phone)} className="mt-4 flex items-center gap-3 text-[24px] font-semibold tracking-[-0.02em] hover:text-[#f5b84a]"><Phone size={19} className="text-[#f5b84a]" />{b.phone}</a>
          <p className="mt-1 pl-8 text-[13.5px] text-white/45">Тот же номер — Viber и WhatsApp</p>
          <div className="mt-7 flex flex-wrap gap-2">
            <a href={b.viber} target="_blank" rel="noopener" className={L}><MessageCircle size={17} />Viber</a>
            <a href={b.wa} target="_blank" rel="noopener" className={L}><WA />WhatsApp</a>
            <a href={b.ig} target="_blank" rel="noopener" className={L}><IG />Instagram</a>
          </div>
        </div>
        <div className="h-[380px] overflow-hidden rounded-[22px] border border-white/[.08] md:h-[440px]"><MapFrame oid={b.oid} dark /></div>
      </div>
    </section>
  )
}

function App() {
  useSmooth()
  const lite = useLite()
  const inputRef = useRef(null)
  const focusBar = () => { const el = document.getElementById('book'); window.__lenis ? window.__lenis.scrollTo(el, { offset: -40 }) : el?.scrollIntoView(); setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 700) }
  const openWith = qv => {
    focusBar()
    setTimeout(() => { const i = inputRef.current; if (!i) return; const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; set.call(i, qv); i.dispatchEvent(new Event('input', { bubbles: true })) }, 720)
  }
  useEffect(() => {
    const k = e => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); focusBar() }
      else if (e.key === '/' && !/input|textarea/i.test(document.activeElement?.tagName)) { e.preventDefault(); focusBar() }
    }
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k)
  }, [])
  return (
    <MotionConfig reducedMotion="user">
      <div className={`overflow-x-clip ${SANS}`} style={{ background: BG, color: '#f4f1ec', '--sel': '#f5b84a', '--selc': '#1a0f02' }}>
        <Ribbon name={b.name} bg="#f5b84a" fg="#1a0f02" />
        <header className="sticky top-3 z-40 mx-auto -mb-[60px] mt-3 w-[min(1200px,calc(100%-24px))]">
          <div className="flex h-12 items-center justify-between rounded-[14px] border border-white/[.08] bg-[#141216]/70 pl-3 pr-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,.06)] backdrop-blur-xl">
            <a href="#top" className="flex items-center gap-2.5"><span className="h-6 w-6 rounded-[7px] shadow-[inset_0_1px_0_rgba(255,255,255,.6)]" style={{ background: GOLD }} /><span className="text-[15px] font-semibold tracking-[-0.02em]">Golden Beauty</span></a>
            <nav className="hidden gap-7 text-[14px] text-white/55 md:flex">{[['#services', 'Услуги'], ['#book', 'Запись'], ['#contact', 'Контакты']].map(([h, t]) => <a key={h} href={h} className="hover:text-white">{t}</a>)}</nav>
            <button type="button" onClick={focusBar} className="inline-flex h-9 items-center gap-2 rounded-[10px] px-3.5 text-[14px] font-semibold text-[#2a1703]" style={{ background: GOLD }}>Записаться <span className={`${MONO} hidden text-[11px] opacity-60 sm:inline`}>⌘K</span></button>
          </div>
        </header>
        <main>
          <Film lite={lite} />
          <Book inputRef={inputRef} />
          <Bento openWith={openWith} />
          <Contact />
        </main>
        <footer className="px-5 pb-8 text-[13px] text-white/40 md:px-12">
          <div className="mx-auto flex max-w-[1200px] flex-wrap justify-between gap-3 border-t border-white/[.08] pt-6"><span>© 2026 {b.name} · Концепт сайта — Артём</span><span>{b.addr}, {b.city}</span></div>
        </footer>
        <CallBar phone={b.phone} barCls="bg-[#08070a]/85 backdrop-blur-xl border-t border-white/10" callCls="rounded-[12px] border border-white/15 text-white" bookCls="rounded-[12px] bg-[#f5b84a] text-[#1a0f02]" />
        <div className="h-[72px] sm:hidden" />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
