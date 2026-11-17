import React, { useRef, useState, useEffect, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, useSpring, useInView, AnimatePresence, MotionConfig } from 'framer-motion'
import { ArrowRight, ArrowDown, Camera, X, Plus, Minus, MapPin, Phone, ImagePlus } from 'lucide-react'
import '../lib/base.css'
import { useSmooth, Ribbon, Reveal, useBooking, phoneFocus, CheckDraw, MapFrame, CallBar, tel, useLite, useIsMobile } from '../lib/kit'

const NutScene = lazy(() => import('./gayka3d'))

const b = {
  name: 'Гайка', addr: 'Уручская ул., 14А', district: 'Уручье', city: 'Минск',
  phone: '+375 29 166-16-46', rating: '4,7', rev: 106, oid: '1787030156',
}
const Y = '#ffd400', G = '#1b1c1e', G2 = '#141516', PAPER = '#f2f0ea'
const C = "font-['Fira_Sans_Extra_Condensed',sans-serif]"
const M = "font-['Martian_Mono',monospace]"
const NAV = [['services', 'Услуги'], ['photo', 'Фото-заявка'], ['how', 'Как работаем'], ['rating', 'Рейтинг'], ['contact', 'Контакты']]

const Hex = ({ className = '', fill = 'currentColor', stroke, sw = 0 }) => (
  <svg viewBox="0 0 100 100" className={className} aria-hidden="true"><polygon points="50,3 93,27 93,73 50,97 7,73 7,27" fill={fill} stroke={stroke} strokeWidth={sw} /></svg>
)

function useActive(ids) {
  const [a, setA] = useState('')
  useEffect(() => {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) setA(e.target.id) }), { rootMargin: '-45% 0px -50% 0px' })
    ids.forEach(id => { const el = document.getElementById(id); if (el) io.observe(el) })
    return () => io.disconnect()
  }, [])
  return a
}

function Header() {
  const a = useActive(NAV.map(n => n[0]))
  return (
    <header className="sticky top-0 z-40 border-b-2 border-[#ffd400] bg-[#141516]">
      <div className="flex h-16 items-stretch justify-between">
        <a href="#top" className={`${C} flex items-center gap-2.5 bg-[#ffd400] px-4 text-[30px] font-black uppercase leading-none text-[#141516] md:px-6`}>
          <span className="relative grid h-8 w-8 place-items-center"><Hex className="absolute inset-0 h-8 w-8" fill="#141516" /><span className="relative h-3 w-3 rounded-full bg-[#ffd400]" /></span>Гайка
        </a>
        <nav className="hidden items-stretch lg:flex" aria-label="Разделы">
          {NAV.map(([id, t]) => <a key={id} href={'#' + id} aria-current={a === id ? 'true' : undefined} className={`${M} flex items-center border-l border-white/10 px-5 text-[12px] uppercase tracking-[.08em] transition-colors ${a === id ? 'bg-[#ffd400] text-[#141516]' : 'text-white/70 hover:text-[#ffd400]'}`}>{t}</a>)}
        </nav>
        <div className="flex items-stretch">
          <a href={'tel:' + tel(b.phone)} className={`${M} hidden items-center gap-2 border-l border-white/10 px-5 text-[13px] text-white hover:text-[#ffd400] md:flex`}><Phone size={15} />{b.phone}</a>
          <a href="#book" className={`${C} flex items-center bg-white px-5 text-[20px] font-extrabold uppercase text-[#141516] hover:bg-[#ffd400] md:px-7`}>Записаться</a>
        </div>
      </div>
    </header>
  )
}

/* ---------------- hero + pinned nut film ---------------- */
const CH = [
  { n: '01', h: 'Масло', d: 'Сливаем старое, меняем фильтр, заливаем масло под допуск вашего мотора.', r: [0.14, 0.36] },
  { n: '02', h: 'Шины', d: 'Шиномонтаж, балансировка, сезонная переобувка, ремонт проколов.', r: [0.36, 0.58] },
  { n: '03', h: 'Ремонт', d: 'Ходовая, тормоза, двигатель. Сначала диагностика — потом согласование.', r: [0.58, 0.8] },
  { n: '04', h: 'Затянуто.', d: 'Дело сделано как надо. Записывайтесь — подберём время.', r: [0.8, 1.2] },
]
function Chapter({ p, c }) {
  const k = [c.r[0], c.r[0] + 0.04, c.r[1] - 0.04, c.r[1]]
  const o = useTransform(p, k, [0, 1, 1, 0])
  const x = useTransform(p, k, [-40, 0, 0, 30])
  return (
    <motion.div style={{ opacity: o, x }} className="pointer-events-none absolute inset-x-5 top-[6vh] md:left-10 md:right-auto md:top-[20vh] md:w-[50vw]">
      <p className={`${M} text-[13px] text-[#ffd400]`}>{c.n} / 04</p>
      <h2 className={`${C} mt-2 text-[clamp(72px,14vw,220px)] font-black uppercase leading-[.82] tracking-[-0.01em] text-white`}>{c.h}</h2>
      <p className="mt-5 max-w-[440px] text-[17px] leading-snug text-white/75 md:text-[20px]">{c.d}</p>
    </motion.div>
  )
}
function LiteNut({ p }) {
  const rot = useTransform(p, [0, 1], [0, 720])
  const y = useTransform(p, [0, 0.9], ['-30%', '30%'])
  return (
    <div className="absolute inset-y-0 right-0 grid w-full place-items-center md:w-1/2">
      <div className="absolute h-[70%] w-10 bg-[repeating-linear-gradient(180deg,#8a8f95_0_6px,#5c6168_6px_12px)]" />
      <motion.div style={{ rotate: rot, y }} className="relative h-48 w-48"><Hex className="h-full w-full" fill={Y} /><span className="absolute inset-[32%] rounded-full bg-[#141516]" /></motion.div>
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
  const heroO = useTransform(p, [0, 0.1], [1, 0])
  const heroPE = useTransform(p, v => (v < 0.06 ? 'auto' : 'none'))
  const stageY = useTransform(p, [0, 0.1], [mob ? '50vh' : '0vh', '0vh'])
  const turns = useTransform(p, [0.04, 0.9], [0, 7.3])
  const turnTxt = useTransform(turns, v => String(Math.min(7, Math.floor(Math.max(0, v)))).padStart(2, '0'))
  const bar = useTransform(p, [0.04, 0.9], ['0%', '100%'])
  const hudO = useTransform(p, [0.05, 0.1], [0, 1])
  return (
    <section ref={ref} id="top" className="relative h-[300vh] bg-[#1b1c1e]">
      <div className="sticky top-16 h-[calc(100svh-64px)] overflow-hidden">
        {/* hex grid backdrop */}
        <div aria-hidden="true" className="absolute inset-0 opacity-[.06]" style={{ backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='56' height='97' viewBox='0 0 56 97'><path d='M28 0l28 16v32L28 64 0 48V16zM28 64v33' fill='none' stroke='%23ffd400' stroke-width='1.5'/></svg>\")" }} />
        <motion.div style={{ y: stageY }} className="absolute inset-0">
          {lite ? <LiteNut p={p} /> : mounted && <Suspense fallback={<LiteNut p={p} />}><NutScene progress={p} active={near} /></Suspense>}
        </motion.div>

        <motion.div style={{ opacity: heroO, pointerEvents: heroPE }} className="relative z-[2] px-5 pt-6 md:px-10 md:pt-[8vh]">
          <p className={`${M} inline-flex items-center gap-2 bg-[#ffd400] px-2.5 py-1.5 text-[12px] uppercase text-[#141516]`}><MapPin size={13} />{b.addr} · {b.district}</p>
          <h1 className={`${C} mt-5 max-w-[56vw] text-[clamp(60px,10.5vw,176px)] font-black uppercase leading-[.84] text-white max-md:max-w-none`}>
            <span className="block">Масло,</span><span className="block">шины,</span><span className="block text-[#ffd400]">ремонт.</span>
          </h1>
          <p className="mt-5 max-w-[460px] text-[17px] leading-snug text-white/75 md:text-[20px]">Автосервис на Уручье: замена масла, шиномонтаж и ремонт авто.</p>
          <a href="#rating" className={`${M} mt-5 inline-flex items-center gap-3 text-[13px] text-white`}><span className={`${C} text-[34px] font-black leading-none text-[#ffd400]`}>{b.rating}</span><span>Яндекс Карты<br /><span className="text-white/60">{b.rev} оценок</span></span></a>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a href="#book" className={`${C} inline-flex h-14 items-center gap-2 bg-[#ffd400] px-7 text-[24px] font-extrabold uppercase text-[#141516] hover:bg-white`}>Записаться <ArrowRight size={20} strokeWidth={3} /></a>
            <a href={'tel:' + tel(b.phone)} className={`${M} inline-flex h-14 items-center gap-2 border-2 border-white/30 px-5 text-[14px] text-white hover:border-[#ffd400]`}><Phone size={15} />{b.phone}</a>
          </div>

        </motion.div>

        {CH.map(c => <Chapter key={c.n} p={p} c={c} />)}

        <motion.div style={{ opacity: hudO }} className={`${M} pointer-events-none absolute bottom-[88px] left-5 right-5 z-[3] flex items-end justify-between gap-6 text-[11px] uppercase text-white/60 md:bottom-6 md:left-10 md:right-10`}>
          <div className="w-full max-w-[320px]">
            <div className="flex justify-between"><span>Оборот <motion.span className="text-[#ffd400]">{turnTxt}</motion.span> / 07</span><span>Посадка</span></div>
            <div className="mt-2 h-[6px] bg-white/10"><motion.div style={{ width: bar }} className="h-full bg-[#ffd400]" /></div>
          </div>
          <a href="#services" className="pointer-events-auto shrink-0 text-[12px] text-white underline-offset-4 hover:text-[#ffd400] hover:underline">Пропустить →</a>
        </motion.div>
      </div>
    </section>
  )
}

/* ---------------- services: brutal table ---------------- */
const SV = [
  ['Замена масла и фильтров', 'Моторное масло, масляный и воздушный фильтры.', '30–60 мин'],
  ['Шиномонтаж', 'Снятие, монтаж, балансировка колёс.', '40–60 мин'],
  ['Сезонная переобувка', 'Колёса в сборе — лето/зима.', '20–40 мин'],
  ['Ремонт проколов', 'Латка, грибок, проверка давления.', '20–40 мин'],
  ['Диагностика ходовой', 'Ищем стуки, люфты и износ.', '30–60 мин'],
  ['Тормоза', 'Колодки, диски, тормозная жидкость.', 'от 1 часа'],
  ['Ремонт подвески', 'Рычаги, стойки, амортизаторы, сайлентблоки.', 'по осмотру'],
  ['Компьютерная диагностика', 'Чтение ошибок и расшифровка простыми словами.', '~30 мин'],
]
function Services() {
  return (
    <section id="services" className="scroll-mt-16 bg-[#f2f0ea] text-[#141516]">
      <div className="flex flex-wrap items-end justify-between gap-6 border-b-[3px] border-[#141516] px-5 pb-6 pt-20 md:px-10 md:pt-28">
        <h2 className={`${C} text-[clamp(64px,12vw,200px)] font-black uppercase leading-[.82]`}>Услуги</h2>
        <p className={`${M} max-w-[360px] text-[12.5px] uppercase leading-relaxed text-[#141516]/70`}>Цена — уточнит мастер после осмотра.<br />Время — ориентировочное.</p>
      </div>
      <ul>
        {SV.map(([t, d, time], i) => (
          <li key={t} className="group border-b-2 border-[#141516] transition-colors hover:bg-[#ffd400]">
            <div className="grid grid-cols-[44px_1fr] items-center gap-x-4 gap-y-3 px-5 py-5 md:grid-cols-[80px_1.3fr_1.4fr_160px_auto] md:px-10 md:py-6">
              <span className={`${M} text-[13px] text-[#141516]/55`}>{String(i + 1).padStart(2, '0')}</span>
              <h3 className={`${C} text-[clamp(28px,3.2vw,46px)] font-extrabold uppercase leading-[.95]`}>{t}</h3>
              <p className="col-start-2 text-[16px] leading-snug text-[#141516]/75 md:col-start-auto">{d}</p>
              <p className={`${M} col-start-2 text-[12.5px] uppercase md:col-start-auto`}>{time}<br /><span className="text-[#141516]/55">цена — у мастера</span></p>
              <a href="#book" data-svc={t} className={`${C} col-start-2 inline-flex h-12 w-fit items-center gap-2 bg-[#141516] px-5 text-[19px] font-bold uppercase text-[#ffd400] md:col-start-auto`}>Записаться <ArrowRight size={17} strokeWidth={3} /></a>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

/* ---------------- photo request (value interaction) ---------------- */
const PROB = ['Стук или шум', 'Течь масла / жидкости', 'Шины и диски', 'Горит ошибка', 'Тормоза', 'Другое']
const MAXF = 6
function Thumb({ f, onRemove }) {
  return (
    <motion.li layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="relative aspect-square overflow-hidden border-2 border-[#141516] bg-[#141516]">
      <img src={f.url} alt={'Фото: ' + f.name} className="h-full w-full object-cover" />
      <button type="button" onClick={onRemove} aria-label={'Удалить ' + f.name} className="absolute right-1 top-1 grid h-9 w-9 place-items-center bg-[#ffd400] text-[#141516] hover:bg-white"><X size={18} strokeWidth={3} /></button>
    </motion.li>
  )
}
function PhotoReq() {
  const [files, setFiles] = useState([])
  const [prob, setProb] = useState('')
  const [car, setCar] = useState(''), [note, setNote] = useState('')
  const [phone, setPhone] = useState('')
  const [errs, setErrs] = useState({})
  const [drag, setDrag] = useState(false)
  const [state, setState] = useState('form')
  const input = useRef(null)
  const filesRef = useRef(files); filesRef.current = files
  useEffect(() => () => filesRef.current.forEach(f => URL.revokeObjectURL(f.url)), [])
  const add = list => {
    const imgs = Array.from(list || []).filter(f => f.type.startsWith('image/'))
    setFiles(prev => [...prev, ...imgs.slice(0, MAXF - prev.length).map(f => ({ id: Math.random().toString(36).slice(2), url: URL.createObjectURL(f), name: f.name }))])
    setErrs(e => ({ ...e, files: imgs.length ? undefined : e.files }))
  }
  const remove = id => setFiles(prev => { const f = prev.find(x => x.id === id); if (f) URL.revokeObjectURL(f.url); return prev.filter(x => x.id !== id) })
  const submit = e => {
    e.preventDefault()
    const er = {}
    if (!prob) er.prob = 'Выберите, что случилось'
    if (phone.replace(/\D/g, '').length < 12) er.phone = 'Нужен номер: 12 цифр с кодом +375'
    setErrs(er)
    if (Object.keys(er).length) return
    setState('loading'); setTimeout(() => setState('sent'), 1100)
  }
  const reset = () => { files.forEach(f => URL.revokeObjectURL(f.url)); setFiles([]); setProb(''); setCar(''); setNote(''); setPhone(''); setState('form') }
  return (
    <section id="photo" className="scroll-mt-16 bg-[#ffd400] px-5 py-20 text-[#141516] md:px-10 md:py-28">
      <div className="grid gap-10 lg:grid-cols-[.9fr_1.1fr]">
        <div>
          <p className={`${M} text-[12.5px] uppercase`}>Не знаете, что это? Покажите.</p>
          <h2 className={`${C} mt-3 text-[clamp(60px,10vw,168px)] font-black uppercase leading-[.82]`}>Фото-<br />заявка</h2>
          <p className="mt-6 max-w-[440px] text-[18px] leading-snug">Сфотографируйте проблему — потёк, ошибку на панели, порез на шине — и оставьте номер. Мастер посмотрит и перезвонит.</p>
          <ol className={`${M} mt-8 space-y-3 text-[13px] uppercase`}>
            {['Фото проблемы', 'Что случилось', 'Ваш телефон'].map((t, i) => <li key={t} className="flex items-center gap-3"><span className="relative grid h-9 w-9 place-items-center text-[#ffd400]"><Hex className="absolute inset-0" fill="#141516" /><span className="relative">{i + 1}</span></span>{t}</li>)}
          </ol>
        </div>
        <div className="border-[3px] border-[#141516] bg-[#f2f0ea] p-5 md:p-8">
          {state === 'sent' ? (
            <div className="py-6 text-center" role="status">
              <CheckDraw className="mx-auto" />
              <p className={`${C} mt-5 text-[44px] font-black uppercase leading-none`}>Заявка у мастера</p>
              <p className="mx-auto mt-3 max-w-[420px] text-[17px] text-[#141516]/75">{prob}{files.length ? ` · ${files.length} фото` : ''}. Перезвоним на {phone}. В готовом сайте фото придут мастеру в Telegram.</p>
              {files.length > 0 && <ul className="mx-auto mt-6 flex max-w-[360px] justify-center gap-2">{files.slice(0, 4).map(f => <li key={f.id} className="h-16 w-16 overflow-hidden border-2 border-[#141516]"><img src={f.url} alt="" className="h-full w-full object-cover" /></li>)}</ul>}
              <button type="button" onClick={reset} className={`${M} mt-8 text-[13px] uppercase underline underline-offset-4`}>Новая заявка</button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              <p className={`${M} text-[12px] uppercase`} id="ph-files">1 · Фото ({files.length}/{MAXF}) — по желанию, но очень помогает</p>
              <label onDragOver={e => { e.preventDefault(); setDrag(true) }} onDragLeave={() => setDrag(false)} onDrop={e => { e.preventDefault(); setDrag(false); add(e.dataTransfer.files) }}
                className={`mt-3 flex min-h-[132px] cursor-pointer flex-col items-center justify-center gap-2 border-2 border-dashed p-5 text-center transition-colors focus-within:outline focus-within:outline-[3px] focus-within:outline-[#141516] ${drag ? 'border-[#141516] bg-[#ffd400]' : 'border-[#141516]/50 hover:bg-white'} ${files.length >= MAXF ? 'pointer-events-none opacity-50' : ''}`}>
                <input ref={input} type="file" accept="image/*" multiple className="sr-only" aria-describedby="ph-files" disabled={files.length >= MAXF} onChange={e => { add(e.target.files); e.target.value = '' }} />
                <ImagePlus size={30} strokeWidth={1.8} aria-hidden="true" />
                <span className={`${C} text-[24px] font-extrabold uppercase leading-none`}>Добавить фото</span>
                <span className="text-[14px] text-[#141516]/65">Нажмите или перетащите — до {MAXF} снимков. С телефона можно сразу сфотографировать.</span>
              </label>
              {files.length > 0 && <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6"><AnimatePresence>{files.map(f => <Thumb key={f.id} f={f} onRemove={() => remove(f.id)} />)}</AnimatePresence></ul>}

              <p className={`${M} mt-7 text-[12px] uppercase`} id="ph-prob">2 · Что случилось</p>
              <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-labelledby="ph-prob">
                {PROB.map(x => <button key={x} type="button" role="radio" aria-checked={prob === x} onClick={() => { setProb(x); setErrs(e => ({ ...e, prob: undefined })) }} className={`min-h-[48px] border-2 border-[#141516] px-4 text-[16px] font-medium transition-colors ${prob === x ? 'bg-[#141516] text-[#ffd400]' : 'hover:bg-white'}`}>{x}</button>)}
              </div>
              {errs.prob && <p className="mt-2 text-[15px] font-semibold text-[#b00020]" role="alert">{errs.prob}</p>}
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div><label htmlFor="ph-car" className={`${M} text-[11.5px] uppercase text-[#141516]/70`}>Марка и модель (необязательно)</label>
                  <input id="ph-car" value={car} onChange={e => setCar(e.target.value)} className="mt-1.5 h-14 w-full border-2 border-[#141516] bg-white px-4 text-[17px] outline-none focus:bg-[#fffbe0]" /></div>
                <div><label htmlFor="ph-note" className={`${M} text-[11.5px] uppercase text-[#141516]/70`}>Пара слов (необязательно)</label>
                  <input id="ph-note" value={note} onChange={e => setNote(e.target.value)} placeholder="Стучит справа на кочках" className="mt-1.5 h-14 w-full border-2 border-[#141516] bg-white px-4 text-[17px] outline-none placeholder:text-[#141516]/40 focus:bg-[#fffbe0]" /></div>
              </div>

              <label htmlFor="ph-phone" className={`${M} mt-7 block text-[12px] uppercase`}>3 · Телефон</label>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <input id="ph-phone" value={phone} onChange={e => { setPhone(e.target.value); setErrs(x => ({ ...x, phone: undefined })) }} onFocus={() => { if (!phone) setPhone('+375 ') }} type="tel" inputMode="tel" autoComplete="tel" placeholder="+375 __ ___-__-__" aria-invalid={!!errs.phone} aria-describedby={errs.phone ? 'ph-perr' : undefined}
                  className={`h-14 flex-1 border-2 bg-white px-4 text-[17px] outline-none focus:bg-[#fffbe0] ${errs.phone ? 'border-[#b00020]' : 'border-[#141516]'}`} />
                <button type="submit" disabled={state === 'loading'} className={`${C} inline-flex h-14 items-center justify-center gap-2 bg-[#141516] px-7 text-[22px] font-extrabold uppercase text-[#ffd400] hover:bg-black disabled:opacity-60`}>{state === 'loading' ? 'Отправляем…' : <>Отправить <Camera size={19} /></>}</button>
              </div>
              {errs.phone && <p id="ph-perr" className="mt-2 text-[15px] font-semibold text-[#b00020]" role="alert">{errs.phone}</p>}
              <p className="mt-4 text-[13px] text-[#141516]/60">Фото никуда не загружаются в этой демо-версии — остаются в вашем браузере.</p>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

/* ---------------- how ---------------- */
const STEPS = [['Заявка', 'Звонок, запись на сайте или фото-заявка.'], ['Приезд', `${b.addr}, к согласованному времени.`], ['Диагностика', 'Мастер смотрит и называет цену до начала работ.'], ['Готово', 'Показываем, что сделали, отдаём ключи.']]
function How() {
  return (
    <section id="how" className="scroll-mt-16 bg-[#1b1c1e] px-5 py-20 text-white md:px-10 md:py-28">
      <h2 className={`${C} text-[clamp(56px,9vw,150px)] font-black uppercase leading-[.84]`}>Как это<br /><span className="text-[#ffd400]">работает</span></h2>
      <ol className="mt-14 grid gap-px bg-white/15 md:grid-cols-4">
        {STEPS.map(([h, d], i) => (
          <Reveal as="li" key={h} delay={i * 0.06} className="bg-[#1b1c1e] p-6 md:p-8">
            <span className="relative grid h-20 w-20 place-items-center"><Hex className="absolute inset-0 h-20 w-20" fill="none" stroke={Y} sw={4} /><span className={`${C} relative text-[40px] font-black text-[#ffd400]`}>{i + 1}</span></span>
            <h3 className={`${C} mt-8 text-[40px] font-extrabold uppercase leading-none`}>{h}</h3>
            <p className="mt-3 text-[17px] leading-snug text-white/70">{d}</p>
          </Reveal>
        ))}
      </ol>
    </section>
  )
}

/* ---------------- rating ---------------- */
function Rating() {
  return (
    <section id="rating" className="scroll-mt-16 border-y-[3px] border-[#141516] bg-[#f2f0ea] text-[#141516]">
      <div className="grid md:grid-cols-[1.2fr_.8fr]">
        <div className="relative overflow-hidden border-b-[3px] border-[#141516] px-5 py-14 md:border-b-0 md:border-r-[3px] md:px-10">
          <p className={`${M} text-[12.5px] uppercase`}>Рейтинг на Яндекс Картах</p>
          <p className={`${C} text-[clamp(160px,30vw,440px)] font-black leading-[.8] tracking-[-0.02em]`}>{b.rating}</p>
          <Hex className="pointer-events-none absolute -right-16 -top-10 h-[320px] w-[320px] text-[#ffd400] md:h-[440px] md:w-[440px]" />
        </div>
        <div className="flex flex-col justify-between gap-10 px-5 py-14 md:px-10">
          <p className={`${C} text-[clamp(44px,5vw,80px)] font-black uppercase leading-[.86]`}>{b.rev} оценок<br />от водителей</p>
          <div>
            <p className="text-[17px] leading-snug text-[#141516]/75">Средняя оценка из {b.rev} на Яндекс Картах. Все отзывы — по ссылке.</p>
            <a href={`https://yandex.ru/maps/org/${b.oid}/reviews/`} target="_blank" rel="noopener" className={`${C} mt-6 inline-flex h-14 items-center gap-2 bg-[#141516] px-6 text-[21px] font-extrabold uppercase text-[#ffd400]`}>Читать отзывы <ArrowRight size={18} strokeWidth={3} /></a>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- FAQ ---------------- */
const FAQ = [
  ['Сколько по времени замена масла?', 'Обычно 30–60 минут. Точнее — зависит от авто и того, что меняем вместе с маслом.'],
  ['Можно со своим маслом и фильтром?', 'Уточните по телефону при записи — подскажем, подойдёт ли и что взять.'],
  ['Как понять цену заранее?', 'Пришлите фото-заявку или позвоните. Точную сумму мастер назовёт после осмотра — до начала работ.'],
  ['Нужна ли запись?', 'Лучше записаться — так не придётся ждать. Можно и позвонить в день визита.'],
  ['Как оплатить?', 'Способы оплаты уточняйте по телефону.'],
  ['Где вы находитесь?', `${b.addr}, ${b.district}, ${b.city}. Карта — ниже.`],
]
function Faq() {
  const [o, setO] = useState(0)
  return (
    <section id="faq" className="bg-[#f2f0ea] px-5 py-20 text-[#141516] md:px-10 md:py-28">
      <div className="grid gap-10 lg:grid-cols-[.7fr_1.3fr]">
        <h2 className={`${C} text-[clamp(56px,8vw,130px)] font-black uppercase leading-[.84]`}>Частые<br />вопросы</h2>
        <div className="border-t-[3px] border-[#141516]">
          {FAQ.map(([q, a], i) => (
            <div key={q} className="border-b-2 border-[#141516]">
              <h3><button type="button" aria-expanded={o === i} aria-controls={'gq' + i} onClick={() => setO(o === i ? -1 : i)} className={`${C} flex w-full items-center justify-between gap-6 py-5 text-left text-[26px] font-bold uppercase leading-tight md:text-[32px]`}>{q}<span className={`grid h-10 w-10 shrink-0 place-items-center ${o === i ? 'bg-[#ffd400]' : 'bg-[#141516] text-[#ffd400]'}`}>{o === i ? <Minus size={20} strokeWidth={3} /> : <Plus size={20} strokeWidth={3} />}</span></button></h3>
              <AnimatePresence initial={false}>{o === i && <motion.div id={'gq' + i} initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden"><p className="max-w-[680px] pb-6 text-[17px] leading-relaxed text-[#141516]/80">{a}</p></motion.div>}</AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------- booking ---------------- */
const BSV = ['Замена масла', 'Шиномонтаж', 'Диагностика', 'Ремонт', 'Не знаю — нужен осмотр']
const DAYS = ['Сегодня', 'Завтра', 'На неделе', 'Перезвоните']
function Opt({ on, children, ...r }) {
  return <button type="button" aria-pressed={on} className={`min-h-[52px] border-2 px-5 text-[16px] font-medium transition-colors ${on ? 'border-[#ffd400] bg-[#ffd400] text-[#141516]' : 'border-white/25 text-white hover:border-[#ffd400]'}`} {...r}>{children}</button>
}
function Book() {
  const bk = useBooking()
  const [step, setStep] = useState(0)
  const [day, setDay] = useState('')
  const [err, setErr] = useState('')
  const head = useRef(null)
  useEffect(() => { if (step) head.current?.focus() }, [step])
  const next = e => {
    e.preventDefault()
    if (step === 0 && !bk.s.svc) return setErr('Выберите услугу')
    if (step === 1 && !day) return setErr('Выберите день')
    setErr('')
    if (step < 2) setStep(step + 1); else bk.submit()
  }
  const custom = bk.s.svc && !BSV.includes(bk.s.svc)
  return (
    <section id="book" className="scroll-mt-16 bg-[#141516] px-5 py-20 text-white md:px-10 md:py-28">
      <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr]">
        <div>
          <h2 className={`${C} text-[clamp(64px,10vw,170px)] font-black uppercase leading-[.82]`}>Запи&shy;сать&shy;ся</h2>
          <p className="mt-6 max-w-[400px] text-[18px] text-white/70">Три шага — и мастер перезвонит. Или сразу:</p>
          <a href={'tel:' + tel(b.phone)} className={`${C} mt-2 inline-block text-[44px] font-black text-[#ffd400]`}>{b.phone}</a>
        </div>
        <div className="border-[3px] border-[#ffd400] p-5 md:p-8">
          {bk.s.sent ? (
            <div className="py-6 text-center" role="status">
              <CheckDraw className="mx-auto text-[#ffd400]" />
              <p className={`${C} mt-5 text-[48px] font-black uppercase leading-none`}>Принято</p>
              <p className="mx-auto mt-3 max-w-[400px] text-[17px] text-white/70">{bk.s.svc} · {day}. Мастер перезвонит и подтвердит. В готовом сайте заявка сразу придёт вам в Telegram.</p>
              <button type="button" onClick={() => { bk.reset(); setStep(0); setDay('') }} className={`${M} mt-8 text-[13px] uppercase underline underline-offset-4`}>Новая заявка</button>
            </div>
          ) : (
            <form onSubmit={next} noValidate>
              <div className={`${M} grid grid-cols-3 gap-1 text-[11px] uppercase`} aria-hidden="true">{['Услуга', 'День', 'Контакт'].map((t, i) => <span key={t} className={`py-2 text-center ${i <= step ? 'bg-[#ffd400] text-[#141516]' : 'bg-white/10 text-white/50'}`}>{i + 1} · {t}</span>)}</div>
              <h3 ref={head} tabIndex={-1} className={`${C} mt-7 text-[36px] font-extrabold uppercase leading-none outline-none`}>{['Что делаем?', 'Когда удобно?', 'Куда звонить?'][step]}</h3>
              <AnimatePresence mode="wait">
                <motion.div key={step} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }} className="mt-6">
                  {step === 0 && <div className="flex flex-wrap gap-2">{custom && <Opt on>{bk.s.svc}</Opt>}{BSV.map(s => <Opt key={s} on={bk.s.svc === s} onClick={() => { bk.upd('svc', s); setErr('') }}>{s}</Opt>)}</div>}
                  {step === 1 && <div className="flex flex-wrap gap-2">{DAYS.map(d => <Opt key={d} on={day === d} onClick={() => { setDay(d); setErr('') }}>{d}</Opt>)}</div>}
                  {step === 2 && <div className="space-y-4">
                    <div><label htmlFor="g-name" className={`${M} text-[11.5px] uppercase text-white/60`}>Имя</label><input id="g-name" value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} autoComplete="name" className="mt-1.5 h-14 w-full border-2 border-white/25 bg-transparent px-4 text-[17px] text-white outline-none focus:border-[#ffd400]" /></div>
                    <div><label htmlFor="g-phone" className={`${M} text-[11.5px] uppercase text-white/60`}>Телефон</label><input id="g-phone" value={bk.s.phone} onChange={e => bk.upd('phone', e.target.value)} onFocus={phoneFocus(bk)} type="tel" inputMode="tel" autoComplete="tel" placeholder="+375 __ ___-__-__" aria-invalid={bk.s.err} aria-describedby={bk.s.err ? 'g-perr' : undefined} className={`mt-1.5 h-14 w-full border-2 bg-transparent px-4 text-[17px] text-white outline-none placeholder:text-white/35 focus:border-[#ffd400] ${bk.s.err ? 'border-[#ff6b6b]' : 'border-white/25'}`} />
                      {bk.s.err && <p id="g-perr" className="mt-2 text-[15px] text-[#ff8a8a]">Проверьте номер — 12 цифр с кодом +375.</p>}</div>
                  </div>}
                </motion.div>
              </AnimatePresence>
              {err && <p className="mt-4 text-[15px] text-[#ff8a8a]" role="alert">{err}</p>}
              <div className="mt-8 flex items-center justify-between">
                {step > 0 ? <button type="button" onClick={() => setStep(step - 1)} className={`${M} min-h-[44px] text-[12px] uppercase text-white/70 hover:text-white`}>← Назад</button> : <span />}
                <button type="submit" disabled={bk.s.loading} className={`${C} inline-flex h-14 items-center gap-2 bg-[#ffd400] px-7 text-[22px] font-extrabold uppercase text-[#141516] hover:bg-white disabled:opacity-60`}>{step < 2 ? 'Дальше' : bk.s.loading ? 'Отправляем…' : 'Записаться'} <ArrowRight size={19} strokeWidth={3} /></button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

function Contact() {
  return (
    <section id="contact" className="scroll-mt-16 bg-[#1b1c1e] text-white">
      <div className="grid lg:grid-cols-2">
        <div className="px-5 py-20 md:px-10">
          <h2 className={`${C} text-[clamp(56px,8vw,130px)] font-black uppercase leading-[.84]`}>Где<br /><span className="text-[#ffd400]">мы</span></h2>
          <dl className={`${M} mt-10 space-y-6 text-[13px] uppercase`}>
            <div><dt className="text-white/55">Адрес</dt><dd className={`${C} mt-1 text-[32px] font-bold normal-case`}>{b.addr}<br />{b.district}, {b.city}</dd></div>
            <div><dt className="text-white/55">Телефон</dt><dd><a href={'tel:' + tel(b.phone)} className={`${C} mt-1 inline-block text-[32px] font-bold text-[#ffd400]`}>{b.phone}</a></dd></div>
            <div><dt className="text-white/55">Часы работы</dt><dd className="mt-1 text-[15px] normal-case">Уточняйте по телефону</dd></div>
          </dl>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={'tel:' + tel(b.phone)} className={`${C} inline-flex h-14 items-center gap-2 bg-[#ffd400] px-6 text-[22px] font-extrabold uppercase text-[#141516]`}><Phone size={18} />Позвонить</a>
            <a href={`https://yandex.ru/maps/org/${b.oid}/`} target="_blank" rel="noopener" className={`${C} inline-flex h-14 items-center gap-2 border-2 border-white/30 px-6 text-[22px] font-extrabold uppercase hover:border-[#ffd400]`}>Маршрут <ArrowRight size={18} strokeWidth={3} /></a>
          </div>
        </div>
        <div className="h-[400px] border-t-[3px] border-[#ffd400] lg:h-auto lg:min-h-[560px] lg:border-l-[3px] lg:border-t-0"><MapFrame oid={b.oid} dark /></div>
      </div>
    </section>
  )
}

function App() {
  useSmooth()
  const lite = useLite()
  return (
    <MotionConfig reducedMotion="user">
      <div className={`overflow-x-clip font-['Fira_Sans',sans-serif]`} style={{ background: G, color: '#fff', '--sel': Y, '--selc': G2 }}>
        <Ribbon name={b.name} bg={Y} fg={G2} />
        <Header />
        <main>
          <Film lite={lite} />
          <Services />
          <PhotoReq />
          <How />
          <Rating />
          <Faq />
          <Book />
          <Contact />
        </main>
        <footer className={`${M} flex flex-wrap justify-between gap-3 border-t-2 border-[#ffd400] bg-[#141516] px-5 py-6 text-[11.5px] uppercase text-white/55 md:px-10`}><span>© 2026 {b.name} · Концепт сайта — Артём</span><span>{b.addr}, {b.city}</span></footer>
        <CallBar phone={b.phone} barCls="bg-[#141516] border-t-2 border-[#ffd400]" callCls="border-2 border-white/30 text-white" bookCls="bg-[#ffd400] text-[#141516] uppercase" />
        <div className="h-[72px] bg-[#141516] sm:hidden" />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
