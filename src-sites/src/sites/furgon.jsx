import React, { useRef, useState, useEffect, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, useSpring, useInView, AnimatePresence, MotionConfig } from 'framer-motion'
import { ArrowRight, ArrowUpRight, Phone, Plus, Minus, X, Check, Copy, MapPin } from 'lucide-react'
import '../lib/base.css'
import { useSmooth, Ribbon, Reveal, CheckDraw, MapFrame, CallBar, tel, useLite, useIsMobile, IG } from '../lib/kit'

const VanScene = lazy(() => import('./furgon3d'))

const b = {
  name: 'СТО ООО «Фургон»', short: 'Фургон', addr: 'ул. Тимирязева, 93', city: 'Минск',
  phone: '+375 29 113-08-80', ig: 'https://www.instagram.com/stofurgon', rating: '4,7', rev: 204, oid: '1052678143',
}
const S = "font-['Geist','Inter',sans-serif]"
const M = "font-['Geist_Mono','JetBrains_Mono',monospace]"
const NAV = [['services', 'Услуги'], ['fleet', 'Для компаний'], ['acc', 'Бухгалтерия'], ['how', 'Как работаем'], ['rating', 'Рейтинг'], ['contact', 'Контакты']]
const GRID_BG = { backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><path d='M32 28v8M28 32h8' stroke='%23ffffff' stroke-opacity='.14' stroke-width='1'/></svg>\")" }
const emit = svc => window.dispatchEvent(new CustomEvent('furgon:svc', { detail: svc }))

function useActive(ids) {
  const [a, setA] = useState('')
  useEffect(() => {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) setA(e.target.id) }), { rootMargin: '-45% 0px -50% 0px' })
    ids.forEach(id => { const el = document.getElementById(id); if (el) io.observe(el) })
    return () => io.disconnect()
  }, [])
  return a
}

const Logo = () => (
  <svg viewBox="0 0 32 20" width="30" height="19" aria-hidden="true"><path d="M1 17V3h19l6 6 5 2v6z" fill="#fff" /><circle cx="8" cy="17" r="2.6" fill="#000" stroke="#fff" strokeWidth="1.4" /><circle cx="24" cy="17" r="2.6" fill="#000" stroke="#fff" strokeWidth="1.4" /></svg>
)

function Header() {
  const a = useActive(NAV.map(n => n[0]))
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between gap-4 px-5 md:px-8">
        <a href="#top" className="flex items-center gap-2.5 text-[17px] font-semibold tracking-[-0.02em]"><Logo /><span>Фургон</span><span className={`${M} hidden rounded border border-white/15 px-1.5 py-0.5 text-[11px] font-normal text-[#a1a1a1] sm:inline`}>СТО</span></a>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Разделы">
          {NAV.map(([id, t]) => <a key={id} href={'#' + id} aria-current={a === id ? 'true' : undefined} className={`rounded-md px-3 py-2 text-[14px] transition-colors ${a === id ? 'bg-white/10 text-white' : 'text-[#a1a1a1] hover:text-white'}`}>{t}</a>)}
        </nav>
        <div className="flex items-center gap-2">
          <a href={'tel:' + tel(b.phone)} className={`${M} hidden h-9 items-center gap-2 rounded-md border border-white/15 px-3 text-[13px] hover:bg-white/5 md:flex`}><Phone size={14} />{b.phone}</a>
          <a href="#fleet" className="flex h-9 items-center rounded-md bg-white px-4 text-[14px] font-medium text-black hover:bg-white/85">Заявка</a>
        </div>
      </div>
    </header>
  )
}

/* ---------------- hero + pinned film ---------------- */
const CH = [
  { n: '01', h: 'Рычаги и торсионные балки', d: 'Подвеска фургона работает под грузом каждый день. Находим люфт, меняем рычаги и сайлентблоки, восстанавливаем балку.', r: [0.2, 0.42] },
  { n: '02', h: 'Развал-схождение', d: 'После ремонта подвески — регулировка углов, чтобы фургон шёл прямо и не ел резину.', r: [0.42, 0.62] },
  { n: '03', h: 'Экспресс-замена масла', d: 'Масло и фильтры без долгого ожидания — фургон быстрее возвращается на линию.', r: [0.62, 0.8] },
  { n: '04', h: 'Договор, акт, счёт', d: 'Работаем с компаниями. Оплата картой или безналом, документы для бухгалтерии.', r: [0.8, 1.2] },
]
function Chapter({ p, c }) {
  const k = [c.r[0], c.r[0] + 0.04, c.r[1] - 0.04, c.r[1]]
  const o = useTransform(p, k, [0, 1, 1, 0])
  const y = useTransform(p, k, [24, 0, 0, -16])
  return (
    <motion.div style={{ opacity: o, y }} className="pointer-events-none absolute inset-x-5 top-[5vh] text-center md:top-[9vh]">
      <p className={`${M} text-[12px] text-[#a1a1a1]`}>{c.n} / 04</p>
      <h2 className="mx-auto mt-3 max-w-[900px] text-[clamp(36px,6.4vw,84px)] font-semibold leading-[1] tracking-[-0.045em]">{c.h}</h2>
      <p className="mx-auto mt-4 max-w-[520px] text-[16px] leading-relaxed text-[#a1a1a1] md:text-[18px]">{c.d}</p>
    </motion.div>
  )
}
function LiteVan() {
  return (
    <div className="absolute inset-x-0 bottom-[14vh] grid place-items-center">
      <svg viewBox="0 0 320 150" className="w-[min(78vw,560px)]" fill="none" stroke="#fff" strokeWidth="1.5" aria-hidden="true"><path d="M10 120V20h220l45 50 35 12v38H10z" fill="#0b0b0b" /><path d="M232 22l40 46h-40z" /><circle cx="70" cy="120" r="22" fill="#000" /><circle cx="250" cy="120" r="22" fill="#000" /><path d="M0 143h320" strokeOpacity=".3" /></svg>
    </div>
  )
}
function Film({ lite }) {
  const ref = useRef(null)
  const mob = useIsMobile()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.4 })
  const near = useInView(ref, { margin: '200px 0px' })
  const [mounted, setMounted] = useState(false)
  useEffect(() => { if (near) setMounted(true) }, [near])
  const heroO = useTransform(p, [0, 0.14], [1, 0])
  const heroY = useTransform(p, [0, 0.14], [0, -40])
  const heroPE = useTransform(p, v => (v < 0.08 ? 'auto' : 'none'))
  const hudO = useTransform(p, [0.14, 0.2], [0, 1])
  const bar = useTransform(p, [0.18, 0.95], ['0%', '100%'])
  const status = useTransform(p, v => (v < 0.86 ? 'В работе' : 'Готов к рейсу'))
  return (
    <section ref={ref} id="top" className="relative h-[280vh]">
      <div className="sticky top-16 h-[calc(100svh-64px)] overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0" style={GRID_BG} />
        <div aria-hidden="true" className="absolute inset-0 [mask-image:radial-gradient(60%_55%_at_50%_70%,#000,transparent)]" style={{ background: 'repeating-conic-gradient(from 180deg at 50% 78%, rgba(255,255,255,.07) 0deg 0.6deg, transparent 0.6deg 9deg)' }} />
        <div className="absolute inset-0">
          {lite ? <LiteVan /> : mounted && <Suspense fallback={<LiteVan />}><VanScene progress={p} active={near} /></Suspense>}
        </div>
        <motion.div style={{ opacity: heroO, y: heroY, pointerEvents: heroPE }} className="relative z-[2] mx-auto max-w-[980px] px-5 pt-8 text-center md:pt-[7vh]">
          <a href="#contact" className={`${M} inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/60 px-3 py-1.5 text-[12px] text-[#d4d4d4] hover:border-white/40`}><MapPin size={13} />{b.addr} · {b.city}</a>
          <h1 className="mt-5 text-[clamp(40px,7.6vw,104px)] font-semibold leading-[.98] tracking-[-0.05em]">Фургон не должен стоять.</h1>
          <p className="mx-auto mt-5 max-w-[640px] text-[17px] leading-relaxed text-[#a1a1a1] md:text-[19px]">Ремонт коммерческих фургонов — Renault Master и других: рычаги, торсионные балки, развал-схождение, экспресс-замена масла. Документы для бухгалтерии.</p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <a href="#fleet" className="inline-flex h-12 items-center gap-2 rounded-md bg-white px-6 text-[16px] font-medium text-black hover:bg-white/85">Заявка для компании <ArrowRight size={17} /></a>
            <a href={'tel:' + tel(b.phone)} className={`${M} inline-flex h-12 items-center gap-2 rounded-md border border-white/20 bg-black/60 px-5 text-[14px] hover:bg-white/10`}><Phone size={15} />{b.phone}</a>
          </div>
          <a href="#rating" className={`${M} mt-6 inline-flex items-center gap-3 text-[13px] text-[#a1a1a1] hover:text-white`}><span className="text-[15px] text-white">★ {b.rating}</span><span className="h-3 w-px bg-white/20" />{b.rev} оценки на Яндекс Картах</a>
        </motion.div>
        {CH.map(c => <Chapter key={c.n} p={p} c={c} />)}
        <motion.div style={{ opacity: hudO }} className={`${M} absolute bottom-[86px] left-5 right-5 z-[3] flex items-end justify-between gap-6 text-[12px] text-[#a1a1a1] md:bottom-6 md:left-8 md:right-8`}>
          <div className="w-full max-w-[300px]">
            <div className="flex justify-between"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#3ecf8e]" />Статус: <motion.span className="text-white">{status}</motion.span></span></div>
            <div className="mt-2 h-px bg-white/15"><motion.div style={{ width: bar }} className="h-px bg-white" /></div>
          </div>
          <a href="#services" className="shrink-0 text-white hover:underline">Пропустить →</a>
        </motion.div>
      </div>
    </section>
  )
}

/* ---------------- services ---------------- */
const SV = [
  ['Рычаги и сайлентблоки', 'Замена рычагов, шаровых, сайлентблоков передней подвески.', 'по осмотру'],
  ['Торсионная балка', 'Диагностика и ремонт задней балки, замена сайлентблоков балки.', 'по осмотру'],
  ['Развал-схождение', 'Регулировка углов колёс после ремонта или при уводе.', '~ 1 ч'],
  ['Экспресс-замена масла', 'Моторное масло, масляный и воздушный фильтры.', '30–60 мин'],
  ['Диагностика ходовой', 'Ищем стуки, люфты и износ, объясняем, что срочно, а что подождёт.', '30–60 мин'],
  ['Ремонт фургонов', 'Другие работы по коммерческим фургонам — по согласованию.', 'по осмотру'],
]
function Services() {
  return (
    <section id="services" className="scroll-mt-16 border-t border-white/10">
      <div className="mx-auto max-w-[1240px] px-5 py-20 md:px-8 md:py-28">
        <div className="grid gap-6 md:grid-cols-[1fr_1fr] md:items-end">
          <div><p className={`${M} text-[12px] text-[#a1a1a1]`}>01 — Услуги</p><h2 className="mt-3 text-[clamp(36px,5vw,64px)] font-semibold leading-[1] tracking-[-0.045em]">Что мы делаем<br /><span className="text-[#a1a1a1]">с фургонами.</span></h2></div>
          <p className="text-[16px] leading-relaxed text-[#a1a1a1] md:justify-self-end md:max-w-[380px]">Цена — уточнит мастер после осмотра. Время — ориентировочное, зависит от состояния фургона.</p>
        </div>
        <ul className="mt-12 grid border-l border-t border-white/10 sm:grid-cols-2 lg:grid-cols-3">
          {SV.map(([t, d, time], i) => (
            <li key={t} className="group flex flex-col border-b border-r border-white/10 p-6 transition-colors hover:bg-white/[.03] md:p-8">
              <div className={`${M} flex justify-between text-[12px] text-[#a1a1a1]`}><span>{String(i + 1).padStart(2, '0')}</span><span>{time}</span></div>
              <h3 className="mt-10 text-[22px] font-semibold tracking-[-0.03em]">{t}</h3>
              <p className="mt-2 flex-1 text-[15px] leading-relaxed text-[#a1a1a1]">{d}</p>
              <div className="mt-6 flex items-center justify-between">
                <span className={`${M} text-[12px] text-[#8f8f8f]`}>цена — уточнит мастер</span>
                <a href="#fleet" onClick={() => emit(t)} className="inline-flex h-10 items-center gap-1.5 rounded-md border border-white/15 px-3 text-[14px] hover:bg-white hover:text-black">Записать <ArrowRight size={14} /></a>
              </div>
            </li>
          ))}
        </ul>
        <p className={`${M} mt-6 text-[13px] text-[#a1a1a1]`}>Renault Master и другие коммерческие фургоны. Вашу модель уточните по телефону.</p>
      </div>
    </section>
  )
}

/* ---------------- fleet request (value interaction) ---------------- */
const MODELS = ['Renault Master', 'Peugeot Boxer', 'Citroën Jumper', 'Fiat Ducato', 'Ford Transit', 'Mercedes Sprinter', 'VW Crafter', 'Iveco Daily', 'Другая модель']
const PROBS = ['Рычаги / сайлентблоки', 'Торсионная балка', 'Развал-схождение', 'Замена масла', 'Диагностика ходовой', 'Другое']
const DOCS = ['Договор', 'Акт выполненных работ', 'Счёт на оплату']
const PAY = ['Безнал', 'Карта']
let uid = 1
const newVan = (prob = '') => ({ id: uid++, model: 'Renault Master', plate: '', prob, note: '' })
const inp = 'h-12 w-full rounded-md border border-white/15 bg-black px-3 text-[16px] text-white outline-none placeholder:text-[#6f6f6f] focus:border-white focus:ring-2 focus:ring-white/20'
const lab = `${M} text-[12px] text-[#a1a1a1]`

function Field({ id, label, err, children }) {
  return (
    <div>
      <label htmlFor={id} className={lab}>{label}</label>
      <div className="mt-1.5">{children}</div>
      {err && <p id={id + '-e'} className="mt-1.5 text-[14px] text-[#ff6b6b]" role="alert">{err}</p>}
    </div>
  )
}
function VanRow({ v, i, n, onChange, onRemove, err }) {
  return (
    <motion.li layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} className="rounded-lg border border-white/10 bg-[#0a0a0a] p-4">
      <div className="flex items-center justify-between">
        <p className={`${M} text-[12px] text-white`}>Фургон {String(i + 1).padStart(2, '0')}</p>
        {n > 1 && <button type="button" onClick={onRemove} aria-label={`Удалить фургон ${i + 1}`} className="grid h-9 w-9 place-items-center rounded-md text-[#a1a1a1] hover:bg-white/10 hover:text-white"><X size={16} /></button>}
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Field id={'m' + v.id} label="Модель">
          <select id={'m' + v.id} value={v.model} onChange={e => onChange({ model: e.target.value })} className={inp}>{MODELS.map(m => <option key={m}>{m}</option>)}</select>
        </Field>
        <Field id={'pl' + v.id} label="Госномер (необязательно)">
          <input id={'pl' + v.id} value={v.plate} onChange={e => onChange({ plate: e.target.value.toUpperCase() })} placeholder="1234 AB-7" className={inp} />
        </Field>
      </div>
      <p className={`${lab} mt-4`} id={'pr' + v.id}>Что беспокоит</p>
      <div className="mt-1.5 flex flex-wrap gap-2" role="radiogroup" aria-labelledby={'pr' + v.id}>
        {PROBS.map(p => <button key={p} type="button" role="radio" aria-checked={v.prob === p} onClick={() => onChange({ prob: p })} className={`min-h-[44px] rounded-md border px-3 text-[14px] transition-colors ${v.prob === p ? 'border-white bg-white text-black' : 'border-white/15 text-[#d4d4d4] hover:border-white/40'}`}>{p}</button>)}
      </div>
      {err && <p className="mt-1.5 text-[14px] text-[#ff6b6b]" role="alert">{err}</p>}
      <input aria-label={`Комментарий к фургону ${i + 1}`} value={v.note} onChange={e => onChange({ note: e.target.value })} placeholder="Комментарий: стук справа, пробег, сроки…" className={inp + ' mt-3'} />
    </motion.li>
  )
}
function Summary({ co, vans, docs, pay, step }) {
  return (
    <aside className="rounded-lg border border-white/10 bg-[#0a0a0a] lg:sticky lg:top-24">
      <div className={`${M} flex items-center justify-between border-b border-white/10 px-5 py-3 text-[12px] text-[#a1a1a1]`}><span>Заявка · черновик</span><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#f5a524]" />шаг {step + 1}/3</span></div>
      <dl className={`${M} divide-y divide-white/10 text-[13px]`}>
        <div className="flex justify-between gap-4 px-5 py-3"><dt className="text-[#a1a1a1]">Компания</dt><dd className="truncate text-right">{co || '—'}</dd></div>
        <div className="flex justify-between gap-4 px-5 py-3"><dt className="text-[#a1a1a1]">Фургонов</dt><dd className="text-[28px] leading-none">{vans.length}</dd></div>
        <div className="px-5 py-3">{vans.map((v, i) => <div key={v.id} className="flex justify-between gap-3 py-1 text-[12px]"><span className="text-[#a1a1a1]">{String(i + 1).padStart(2, '0')} {v.model}</span><span className="truncate text-right">{v.prob || '…'}</span></div>)}</div>
        <div className="flex justify-between gap-4 px-5 py-3"><dt className="text-[#a1a1a1]">Документы</dt><dd className="text-right">{docs.length ? docs.join(', ') : '—'}</dd></div>
        <div className="flex justify-between gap-4 px-5 py-3"><dt className="text-[#a1a1a1]">Оплата</dt><dd>{pay}</dd></div>
      </dl>
    </aside>
  )
}
function Fleet() {
  const [step, setStep] = useState(0)
  const [co, setCo] = useState(''), [unp, setUnp] = useState(''), [person, setPerson] = useState(''), [phone, setPhone] = useState('')
  const [vans, setVans] = useState(() => [newVan()])
  const [docs, setDocs] = useState(['Договор', 'Акт выполненных работ', 'Счёт на оплату'])
  const [needDocs, setNeedDocs] = useState(true)
  const [pay, setPay] = useState('Безнал')
  const [errs, setErrs] = useState({})
  const [state, setState] = useState('form')
  const head = useRef(null)
  useEffect(() => {
    const h = e => {
      const map = { 'Рычаги и сайлентблоки': 'Рычаги / сайлентблоки', 'Торсионная балка': 'Торсионная балка', 'Развал-схождение': 'Развал-схождение', 'Экспресс-замена масла': 'Замена масла', 'Диагностика ходовой': 'Диагностика ходовой' }
      const pr = map[e.detail] || 'Другое'
      setVans(v => v.map((x, i) => i === 0 && !x.prob ? { ...x, prob: pr } : x))
    }
    window.addEventListener('furgon:svc', h); return () => window.removeEventListener('furgon:svc', h)
  }, [])
  useEffect(() => { if (step) head.current?.focus() }, [step])
  const upd = (id, patch) => { setVans(v => v.map(x => x.id === id ? { ...x, ...patch } : x)); setErrs(e => ({ ...e, ['v' + id]: undefined })) }
  const setCount = n => setVans(v => n > v.length ? [...v, ...Array.from({ length: n - v.length }, () => newVan())] : v.slice(0, Math.max(1, n)))
  const next = e => {
    e.preventDefault()
    const er = {}
    if (step === 0 && co.trim().length < 2) er.co = 'Укажите название компании'
    if (step === 1) vans.forEach(v => { if (!v.prob) er['v' + v.id] = 'Выберите, что беспокоит' })
    if (step === 2 && phone.replace(/\D/g, '').length < 12) er.phone = 'Нужен номер: 12 цифр с кодом +375'
    setErrs(er)
    if (Object.keys(er).length) return
    if (step < 2) setStep(step + 1)
    else { setState('loading'); setTimeout(() => setState('sent'), 1100) }
  }
  const reset = () => { setStep(0); setCo(''); setUnp(''); setPerson(''); setPhone(''); setVans([newVan()]); setState('form'); setErrs({}) }
  const docList = needDocs ? docs : []
  return (
    <section id="fleet" className="scroll-mt-16 border-t border-white/10 bg-[#050505]">
      <div className="mx-auto max-w-[1240px] px-5 py-20 md:px-8 md:py-28">
        <p className={`${M} text-[12px] text-[#a1a1a1]`}>02 — Для компаний</p>
        <h2 className="mt-3 max-w-[760px] text-[clamp(36px,5vw,64px)] font-semibold leading-[1] tracking-[-0.045em]">Заявка для компании</h2>
        <p className="mt-4 max-w-[560px] text-[17px] leading-relaxed text-[#a1a1a1]">Один или несколько фургонов — в одной заявке. Укажите, что с каждым, и какие документы нужны бухгалтерии. Мы перезвоним и согласуем время.</p>
        <div className="mt-12 grid gap-6 lg:grid-cols-[1.35fr_.65fr]">
          <div id="book" className="scroll-mt-24 rounded-lg border border-white/10 bg-black p-5 md:p-8">
            {state === 'sent' ? (
              <div className="py-8 text-center" role="status">
                <CheckDraw className="mx-auto text-white" />
                <p className="mt-5 text-[32px] font-semibold tracking-[-0.04em]">Заявка отправлена</p>
                <p className="mx-auto mt-3 max-w-[460px] text-[16px] leading-relaxed text-[#a1a1a1]">{co} · {vans.length} {vans.length === 1 ? 'фургон' : vans.length < 5 ? 'фургона' : 'фургонов'}{docList.length ? ' · ' + docList.join(', ').toLowerCase() : ''}. Перезвоним на {phone}. В готовом сайте заявка сразу придёт вам в Telegram.</p>
                <button type="button" onClick={reset} className={`${M} mt-8 h-11 rounded-md border border-white/15 px-4 text-[13px] hover:bg-white/10`}>Новая заявка</button>
              </div>
            ) : (
              <form onSubmit={next} noValidate>
                <ol className={`${M} grid grid-cols-3 gap-2 text-[12px]`} aria-label="Шаги">
                  {['Компания', 'Фургоны', 'Документы'].map((t, i) => <li key={t} aria-current={i === step ? 'step' : undefined} className={`border-t-2 pt-2 ${i <= step ? 'border-white text-white' : 'border-white/15 text-[#8f8f8f]'}`}>{i + 1}. {t}</li>)}
                </ol>
                <h3 ref={head} tabIndex={-1} className="mt-8 text-[24px] font-semibold tracking-[-0.03em] outline-none">{['О компании', 'Какие фургоны и что с ними', 'Документы и контакт'][step]}</h3>
                <AnimatePresence mode="wait">
                  <motion.div key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }} className="mt-6">
                    {step === 0 && <div className="grid gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2"><Field id="f-co" label="Название компании *" err={errs.co}><input id="f-co" value={co} onChange={e => { setCo(e.target.value); setErrs(x => ({ ...x, co: undefined })) }} placeholder="ООО «Пример»" aria-invalid={!!errs.co} aria-describedby={errs.co ? 'f-co-e' : undefined} className={inp} autoComplete="organization" /></Field></div>
                      <Field id="f-unp" label="УНП (необязательно)"><input id="f-unp" value={unp} onChange={e => setUnp(e.target.value.replace(/\D/g, '').slice(0, 9))} inputMode="numeric" placeholder="9 цифр" className={inp} /></Field>
                      <div>
                        <p className={lab} id="f-cnt">Сколько фургонов</p>
                        <div className="mt-1.5 flex h-12 items-stretch overflow-hidden rounded-md border border-white/15" role="group" aria-labelledby="f-cnt">
                          <button type="button" onClick={() => setCount(vans.length - 1)} aria-label="Меньше" className="grid w-12 place-items-center hover:bg-white/10"><Minus size={16} /></button>
                          <output className={`${M} grid flex-1 place-items-center border-x border-white/15 text-[18px]`} aria-live="polite">{vans.length}</output>
                          <button type="button" onClick={() => setCount(Math.min(20, vans.length + 1))} aria-label="Больше" className="grid w-12 place-items-center hover:bg-white/10"><Plus size={16} /></button>
                        </div>
                      </div>
                    </div>}
                    {step === 1 && <>
                      <ul className="space-y-3"><AnimatePresence initial={false}>{vans.map((v, i) => <VanRow key={v.id} v={v} i={i} n={vans.length} err={errs['v' + v.id]} onChange={p => upd(v.id, p)} onRemove={() => setVans(x => x.filter(y => y.id !== v.id))} />)}</AnimatePresence></ul>
                      {vans.length < 20 && <button type="button" onClick={() => setVans(v => [...v, newVan()])} className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-md border border-dashed border-white/25 text-[15px] text-[#d4d4d4] hover:border-white hover:text-white"><Plus size={16} />Добавить фургон</button>}
                    </>}
                    {step === 2 && <div className="space-y-6">
                      <label className="flex cursor-pointer items-start gap-3 rounded-md border border-white/15 p-4 hover:border-white/40">
                        <input type="checkbox" checked={needDocs} onChange={e => setNeedDocs(e.target.checked)} className="mt-0.5 h-5 w-5 accent-white" />
                        <span><span className="block text-[16px] font-medium">Нужны документы для бухгалтерии</span><span className="text-[14px] text-[#a1a1a1]">Отметьте, какие подготовить</span></span>
                      </label>
                      {needDocs && <div className="flex flex-wrap gap-2">{DOCS.map(d => { const on = docs.includes(d); return <button key={d} type="button" aria-pressed={on} onClick={() => setDocs(x => on ? x.filter(y => y !== d) : [...x, d])} className={`inline-flex min-h-[44px] items-center gap-2 rounded-md border px-3 text-[14px] ${on ? 'border-white bg-white text-black' : 'border-white/15 text-[#d4d4d4]'}`}>{on && <Check size={14} />}{d}</button> })}</div>}
                      <div><p className={lab} id="f-pay">Оплата</p><div className="mt-1.5 flex gap-2" role="radiogroup" aria-labelledby="f-pay">{PAY.map(x => <button key={x} type="button" role="radio" aria-checked={pay === x} onClick={() => setPay(x)} className={`min-h-[44px] flex-1 rounded-md border px-4 text-[15px] ${pay === x ? 'border-white bg-white text-black' : 'border-white/15 text-[#d4d4d4]'}`}>{x}</button>)}</div></div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field id="f-person" label="Контактное лицо"><input id="f-person" value={person} onChange={e => setPerson(e.target.value)} autoComplete="name" className={inp} /></Field>
                        <Field id="f-phone" label="Телефон *" err={errs.phone}><input id="f-phone" type="tel" inputMode="tel" autoComplete="tel" value={phone} onFocus={() => { if (!phone) setPhone('+375 ') }} onChange={e => { setPhone(e.target.value); setErrs(x => ({ ...x, phone: undefined })) }} placeholder="+375 __ ___-__-__" aria-invalid={!!errs.phone} aria-describedby={errs.phone ? 'f-phone-e' : undefined} className={inp} /></Field>
                      </div>
                    </div>}
                  </motion.div>
                </AnimatePresence>
                <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6">
                  {step > 0 ? <button type="button" onClick={() => setStep(step - 1)} className={`${M} h-11 rounded-md px-3 text-[13px] text-[#a1a1a1] hover:text-white`}>← Назад</button> : <span />}
                  <button type="submit" disabled={state === 'loading'} className="inline-flex h-12 items-center gap-2 rounded-md bg-white px-6 text-[16px] font-medium text-black hover:bg-white/85 disabled:opacity-60">{step < 2 ? 'Дальше' : state === 'loading' ? 'Отправляем…' : 'Отправить заявку'} <ArrowRight size={16} /></button>
                </div>
              </form>
            )}
          </div>
          <Summary co={co} vans={vans} docs={docList} pay={pay} step={step} />
        </div>
      </div>
    </section>
  )
}

/* ---------------- accounting ---------------- */
const ACC = [
  ['Договор', 'Для постоянного обслуживания автопарка компании.'],
  ['Акт выполненных работ', 'Что сделано и какие запчасти установлены — по каждому фургону.'],
  ['Счёт на оплату', 'Оплата по безналичному расчёту на реквизиты.'],
  ['Оплата картой', 'Если водителю удобнее рассчитаться на месте.'],
]
const CHECK = 'Для заявки в СТО «Фургон»:\n— карточка предприятия (реквизиты, УНП)\n— список фургонов: модель, госномер\n— контакт ответственного\n— какие документы нужны: договор / акт / счёт'
function Acc() {
  const [copied, setCopied] = useState(false)
  const copy = () => { navigator.clipboard?.writeText(CHECK).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800) }).catch(() => {}) }
  return (
    <section id="acc" className="scroll-mt-16 border-t border-white/10" style={GRID_BG}>
      <div className="mx-auto max-w-[1240px] px-5 py-20 md:px-8 md:py-28">
        <p className={`${M} text-[12px] text-[#a1a1a1]`}>03 — Для бухгалтерии</p>
        <h2 className="mt-3 text-[clamp(36px,5vw,64px)] font-semibold leading-[1] tracking-[-0.045em]">Бумаги — <span className="text-[#a1a1a1]">в порядке.</span></h2>
        <div className="mt-12 grid gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 md:grid-cols-2 lg:grid-cols-4">
          {ACC.map(([h, d], i) => (
            <Reveal key={h} delay={i * 0.05} className="bg-black p-6 md:p-7">
              <p className={`${M} text-[12px] text-[#a1a1a1]`}>{['DOC', 'ACT', 'INV', 'CARD'][i]}</p>
              <h3 className="mt-8 text-[20px] font-semibold tracking-[-0.03em]">{h}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-[#a1a1a1]">{d}</p>
            </Reveal>
          ))}
        </div>
        <div className="mt-6 grid gap-6 rounded-lg border border-white/10 bg-black p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8">
          <div>
            <p className="text-[18px] font-medium">Чек-лист для бухгалтера</p>
            <pre className={`${M} mt-3 whitespace-pre-wrap text-[13px] leading-relaxed text-[#a1a1a1]`}>{CHECK}</pre>
            <p className="mt-3 text-[14px] text-[#8f8f8f]">Состав документов и порядок оплаты уточняйте при заявке.</p>
          </div>
          <button type="button" onClick={copy} className="inline-flex h-11 items-center gap-2 rounded-md border border-white/15 px-4 text-[14px] hover:bg-white/10" aria-live="polite">{copied ? <><Check size={15} />Скопировано</> : <><Copy size={15} />Скопировать</>}</button>
        </div>
      </div>
    </section>
  )
}

/* ---------------- how ---------------- */
const STEPS = [['Заявка', 'Звонок или заявка на сайте — на один фургон или на весь парк.'], ['Время', 'Согласуем, когда пригнать фургон.'], ['Диагностика', 'Мастер смотрит и называет цену до начала работ.'], ['Ремонт и документы', 'Делаем, отдаём фургон и документы для бухгалтерии.']]
function How() {
  return (
    <section id="how" className="scroll-mt-16 border-t border-white/10">
      <div className="mx-auto max-w-[1240px] px-5 py-20 md:px-8 md:py-28">
        <p className={`${M} text-[12px] text-[#a1a1a1]`}>04 — Как работаем</p>
        <h2 className="mt-3 text-[clamp(36px,5vw,64px)] font-semibold leading-[1] tracking-[-0.045em]">Четыре шага.</h2>
        <ol className="mt-12 grid border-l border-t border-white/10 md:grid-cols-4">
          {STEPS.map(([h, d], i) => (
            <Reveal as="li" key={h} delay={i * 0.06} className="relative border-b border-r border-white/10 p-6 md:p-8">
              <span className={`${M} text-[44px] leading-none text-white`}>{i + 1}</span>
              <h3 className="mt-10 text-[20px] font-semibold tracking-[-0.03em]">{h}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-[#a1a1a1]">{d}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}

/* ---------------- rating ---------------- */
function Rating() {
  return (
    <section id="rating" className="scroll-mt-16 border-t border-white/10 bg-[#050505]">
      <div className="mx-auto grid max-w-[1240px] gap-10 px-5 py-20 md:grid-cols-2 md:px-8 md:py-28">
        <div>
          <p className={`${M} text-[12px] text-[#a1a1a1]`}>05 — Рейтинг</p>
          <p className={`${M} mt-4 text-[clamp(120px,20vw,260px)] leading-[.85] tracking-[-0.06em]`}>{b.rating}</p>
          <div className="mt-6 h-px w-full bg-white/15"><div className="h-px bg-white" style={{ width: '94%' }} /></div>
          <p className={`${M} mt-3 flex justify-between text-[12px] text-[#a1a1a1]`}><span>0</span><span>5,0</span></p>
        </div>
        <div className="flex flex-col justify-end gap-6">
          <p className="text-[clamp(28px,3.4vw,44px)] font-semibold leading-[1.1] tracking-[-0.04em]">{b.rev} оценки на Яндекс Картах.</p>
          <p className="max-w-[440px] text-[16px] leading-relaxed text-[#a1a1a1]">Средняя оценка от клиентов СТО. Все отзывы — на Яндекс Картах.</p>
          <a href={`https://yandex.ru/maps/org/${b.oid}/reviews/`} target="_blank" rel="noopener" className="inline-flex h-12 w-fit items-center gap-2 rounded-md border border-white/20 px-5 text-[15px] hover:bg-white hover:text-black">Читать отзывы <ArrowUpRight size={16} /></a>
        </div>
      </div>
    </section>
  )
}

/* ---------------- FAQ ---------------- */
const FAQ = [
  ['Работаете с компаниями по договору?', 'Да, это наш основной формат. Оставьте заявку для компании — обсудим условия и документы.'],
  ['Можно оплатить по безналу или картой?', 'Да: безналичный расчёт по счёту или картой. Детали уточните при заявке.'],
  ['Сколько времени займёт ремонт?', 'Зависит от работ и состояния фургона. Замена масла — обычно 30–60 минут, подвеска — после осмотра мастер назовёт срок.'],
  ['Можно сразу несколько фургонов?', 'Да. Добавьте все фургоны в одну заявку — согласуем, в каком порядке их пригнать.'],
  ['Какие модели обслуживаете?', 'Renault Master и другие коммерческие фургоны. Если сомневаетесь насчёт модели — позвоните.'],
  ['Где вы находитесь?', `${b.addr}, ${b.city}. Карта и маршрут — ниже.`],
]
function Faq() {
  const [o, setO] = useState(0)
  return (
    <section id="faq" className="border-t border-white/10">
      <div className="mx-auto grid max-w-[1240px] gap-10 px-5 py-20 md:px-8 md:py-28 lg:grid-cols-[.7fr_1.3fr]">
        <div><p className={`${M} text-[12px] text-[#a1a1a1]`}>06 — Вопросы</p><h2 className="mt-3 text-[clamp(36px,5vw,64px)] font-semibold leading-[1] tracking-[-0.045em]">Частые вопросы</h2></div>
        <div className="border-t border-white/10">
          {FAQ.map(([q, a], i) => (
            <div key={q} className="border-b border-white/10">
              <h3><button type="button" aria-expanded={o === i} aria-controls={'fq' + i} onClick={() => setO(o === i ? -1 : i)} className="flex w-full items-center justify-between gap-6 py-5 text-left text-[18px] font-medium tracking-[-0.02em] md:text-[20px]">{q}<span className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-white/15">{o === i ? <Minus size={15} /> : <Plus size={15} />}</span></button></h3>
              <AnimatePresence initial={false}>{o === i && <motion.div id={'fq' + i} initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden"><p className="max-w-[640px] pb-6 text-[16px] leading-relaxed text-[#a1a1a1]">{a}</p></motion.div>}</AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Contact() {
  return (
    <section id="contact" className="scroll-mt-16 border-t border-white/10">
      <div className="mx-auto grid max-w-[1240px] lg:grid-cols-2">
        <div className="px-5 py-20 md:px-8">
          <p className={`${M} text-[12px] text-[#a1a1a1]`}>07 — Контакты</p>
          <h2 className="mt-3 text-[clamp(36px,5vw,64px)] font-semibold leading-[1] tracking-[-0.045em]">Пригоняйте.</h2>
          <dl className="mt-10 divide-y divide-white/10 border-y border-white/10">
            <div className="grid grid-cols-[120px_1fr] gap-4 py-4"><dt className={lab}>Адрес</dt><dd className="text-[17px]">{b.addr}, {b.city}</dd></div>
            <div className="grid grid-cols-[120px_1fr] gap-4 py-4"><dt className={lab}>Телефон</dt><dd><a href={'tel:' + tel(b.phone)} className={`${M} text-[17px] hover:underline`}>{b.phone}</a></dd></div>
            <div className="grid grid-cols-[120px_1fr] gap-4 py-4"><dt className={lab}>Instagram</dt><dd><a href={b.ig} target="_blank" rel="noopener" className="inline-flex items-center gap-2 text-[17px] hover:underline"><IG />@stofurgon</a></dd></div>
            <div className="grid grid-cols-[120px_1fr] gap-4 py-4"><dt className={lab}>Часы</dt><dd className="text-[17px] text-[#d4d4d4]">Уточняйте по телефону</dd></div>
          </dl>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={'tel:' + tel(b.phone)} className="inline-flex h-12 items-center gap-2 rounded-md bg-white px-5 text-[15px] font-medium text-black hover:bg-white/85"><Phone size={16} />Позвонить</a>
            <a href={`https://yandex.ru/maps/org/${b.oid}/`} target="_blank" rel="noopener" className="inline-flex h-12 items-center gap-2 rounded-md border border-white/20 px-5 text-[15px] hover:bg-white/10">Маршрут <ArrowUpRight size={16} /></a>
          </div>
        </div>
        <div className="h-[400px] border-t border-white/10 lg:h-auto lg:min-h-[560px] lg:border-l lg:border-t-0"><MapFrame oid={b.oid} dark /></div>
      </div>
    </section>
  )
}

function App() {
  useSmooth()
  const lite = useLite()
  return (
    <MotionConfig reducedMotion="user">
      <div className={`${S} overflow-x-clip bg-black text-[#ededed]`} style={{ '--sel': '#fff', '--selc': '#000' }}>
        <Ribbon name={b.name.replace(/[«»]/g, '')} bg="#ededed" fg="#000" />
        <Header />
        <main>
          <Film lite={lite} />
          <Services />
          <Fleet />
          <Acc />
          <How />
          <Rating />
          <Faq />
          <Contact />
        </main>
        <footer className={`${M} border-t border-white/10`}><div className="mx-auto flex max-w-[1240px] flex-wrap justify-between gap-3 px-5 py-6 text-[12px] text-[#8f8f8f] md:px-8"><span>© 2026 {b.short} · Концепт сайта — Артём</span><span>{b.addr}, {b.city}</span></div></footer>
        <CallBar phone={b.phone} barCls="bg-black/90 backdrop-blur border-t border-white/10" callCls="rounded-md border border-white/20 text-white" bookCls="rounded-md bg-white text-black" />
        <div className="h-[72px] sm:hidden" />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
