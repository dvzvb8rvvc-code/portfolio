import React, { useRef, useState, useEffect, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, AnimatePresence, MotionConfig } from 'framer-motion'
import { ArrowRight, Phone, MapPin, Car, Truck, Wrench, Flame, Disc3, Gauge, CircleDot, Calendar, Check, ChevronLeft } from 'lucide-react'
import '../lib/base.css'
import { B } from '../data'
import { useSmooth, Ribbon, SplitText, Reveal, Magnetic, Cursor, Marquee, Counter, MapFrame, messengerLinks, CallBar, Progress, tel, CheckDraw } from '../lib/kit'

const Tire = lazy(() => import('./yulv3d'))
const b = B.yulv
const Y = '#ffd400', K = '#0c0c0c'
const SV = [
  ['Шиномонтаж', 'Снятие, монтаж и установка колёс легковых авто и кроссоверов.', Disc3],
  ['Балансировка', 'Точная балансировка — руль не дрожит на трассе.', Gauge],
  ['Ремонт проколов', 'Жгут, латка или грибок — по ситуации и надолго.', CircleDot],
  ['Сварочные работы', 'Глушители, диски, кузовные элементы.', Flame],
  ['Ремонт авто', 'Ходовая, тормоза, расходники и диагностика.', Wrench],
  ['Сезонная переобувка', 'Зима ↔ лето за один визит, без очереди по записи.', Calendar],
]

/* spark physics burst */
function useSparks() {
  const cv = useRef(null), parts = useRef([]), raf = useRef(0)
  useEffect(() => {
    const c = cv.current, ctx = c.getContext('2d')
    const fit = () => { c.width = innerWidth * devicePixelRatio; c.height = innerHeight * devicePixelRatio }
    fit(); addEventListener('resize', fit)
    const loop = () => {
      ctx.clearRect(0, 0, c.width, c.height)
      parts.current = parts.current.filter(p => p.l > 0)
      for (const p of parts.current) {
        p.vy += 0.35; p.vx *= 0.985; p.x += p.vx; p.y += p.vy; p.l -= 1
        const a = Math.max(p.l / p.ml, 0)
        ctx.strokeStyle = `rgba(255,${180 + Math.random() * 60 | 0},${40 * a | 0},${a})`
        ctx.lineWidth = 2 * devicePixelRatio
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 2.2, p.y - p.vy * 2.2); ctx.stroke()
      }
      raf.current = requestAnimationFrame(loop)
    }
    loop()
    return () => { cancelAnimationFrame(raf.current); removeEventListener('resize', fit) }
  }, [])
  const burst = (x, y, n = 70) => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const d = devicePixelRatio
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, s = 4 + Math.random() * 12
      parts.current.push({ x: x * d, y: y * d, vx: Math.cos(a) * s * d, vy: (Math.sin(a) * s - 6) * d, l: 40 + Math.random() * 40, ml: 80 })
    }
  }
  const Canvas = () => <canvas ref={cv} className="pointer-events-none fixed inset-0 z-[95] h-full w-full" aria-hidden="true" />
  return [Canvas, burst]
}

function Hero({ burst }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const x1 = useTransform(scrollYProgress, [0, 1], ['0%', '-35%'])
  const x2 = useTransform(scrollYProgress, [0, 1], ['-20%', '15%'])
  const x3 = useTransform(scrollYProgress, [0, 1], ['0%', '-25%'])
  const rows = [['ПЕРЕОБУЕМ', x1, 'text-[#0c0c0c]'], ['ПОЧИНИМ', x2, 'text-transparent [-webkit-text-stroke:3px_#0c0c0c]'], ['СВАРИМ', x3, 'text-[#0c0c0c]']]
  return (
    <section ref={ref} className="relative overflow-hidden" style={{ background: Y }}>
      <div className="absolute bottom-[-6%] right-[-18vw] h-[78vw] w-[78vw] opacity-90 md:bottom-[-10%] md:right-[-2vw] md:top-auto md:h-[min(44vw,620px)] md:w-[min(44vw,620px)]"><Suspense fallback={null}><Tire progress={scrollYProgress} /></Suspense></div>
      <div className="relative pt-16 md:pt-24">
        {rows.map(([t, x, c], i) => (
          <motion.div key={t} style={{ x }} className={`whitespace-nowrap font-['Oswald',sans-serif] text-[clamp(78px,15vw,240px)] font-bold uppercase leading-[.86] ${c}`}>
            <motion.span initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: .9, delay: .15 * i, ease: [0.16, 1, 0.3, 1] }} className="inline-block">{t}.{' '}{t}.</motion.span>
          </motion.div>
        ))}
      </div>
      <div className="relative mx-auto max-w-[1320px] px-6 pb-24 pt-10 md:px-10 md:pb-36">
        <Reveal><p className="mb-8 max-w-[460px] text-[18px] font-medium leading-relaxed text-[#0c0c0c]">Шиномонтаж, ремонт авто и сварка в Минске. Записывайтесь заранее — приезжаете к своему времени и уезжаете без очереди.</p></Reveal>
        <Reveal delay={.1} className="flex flex-wrap gap-3">
          <Magnetic><a href="#book" onClick={e => burst(e.clientX, e.clientY)} data-cursor="Запись" className="inline-flex h-16 items-center gap-3 bg-[#0c0c0c] px-9 font-['Oswald',sans-serif] text-[19px] font-semibold uppercase tracking-wider text-[#ffd400] transition-[scale] [clip-path:polygon(0_0,100%_0,100%_72%,93%_100%,0_100%)] active:scale-[.96]">Записаться в бокс <ArrowRight size={20} /></a></Magnetic>
          <a href={'tel:' + tel(b.phones[0])} className="inline-flex h-16 items-center gap-3 bg-[#ffd400] px-7 font-['Oswald',sans-serif] text-[19px] font-semibold uppercase tracking-wider text-[#0c0c0c] ring-[3px] ring-inset ring-[#0c0c0c]"><Phone size={18} />{b.phones[0]}</a>
        </Reveal>
      </div>
    </section>
  )
}

function Hazard() {
  return (
    <div className="relative">
      <div className="h-9 bg-[repeating-linear-gradient(-45deg,#ffd400_0_28px,#0c0c0c_28px_56px)]" />
      <Marquee base={-4} className="bg-[#0c0c0c] py-5">
        {['Пора на зимнюю резину', 'Запись онлайн 24/7', 'Шины · ремонт · сварка', `${b.rev} оценок на Яндекс.Картах`].map(t => <span key={t} className="mx-6 inline-flex items-center gap-12 font-['Oswald',sans-serif] text-[clamp(26px,3.4vw,46px)] font-semibold uppercase text-white">{t}<Disc3 className="text-[#ffd400]" size={34} /></span>)}
      </Marquee>
    </div>
  )
}

function Stack() {
  return (
    <section id="services" className="mx-auto max-w-[1320px] px-6 py-28 md:px-10">
      <div className="mb-16 grid gap-6 md:grid-cols-2 md:items-end">
        <h2 className="font-['Oswald',sans-serif] text-[clamp(56px,8vw,128px)] font-bold uppercase leading-[.88] text-white"><SplitText text="Что" /> <SplitText text="делаем" delay={.1} className="text-[#ffd400]" /></h2>
        <p className="max-w-[380px] text-[#9a9a9a] md:justify-self-end">Шесть видов работ в одном боксе. Карточки складываются в стопку — листайте. Нажмите, чтобы записаться.</p>
      </div>
      <div className="relative">
        {SV.map(([t, d, Ic], i) => (
          <div key={t} className="sticky" style={{ top: 96 + i * 26 }}>
            <motion.a href="#book" data-svc={t} data-cursor="Запись" initial={{ opacity: 0, y: 80 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-10%' }} transition={{ duration: .7, ease: [0.2, 0, 0, 1] }}
              className="group mb-8 grid min-h-[300px] grid-cols-[auto_1fr] gap-6 overflow-hidden p-8 md:grid-cols-[160px_1fr_auto] md:items-center md:p-12"
              style={{ background: i % 2 ? '#161616' : Y, color: i % 2 ? '#fff' : K, boxShadow: '0 -20px 50px rgba(0,0,0,.45)' }}>
              <span className="font-['Oswald',sans-serif] text-[90px] font-bold leading-none opacity-30 md:text-[140px]" style={{ fontVariantNumeric: 'tabular-nums' }}>0{i + 1}</span>
              <div className="self-end md:self-center">
                <h3 className="mb-3 font-['Oswald',sans-serif] text-[clamp(34px,4vw,64px)] font-bold uppercase leading-none">{t}</h3>
                <p className="max-w-[440px] text-[16px] opacity-70">{d}</p>
              </div>
              <motion.span whileHover={{ rotate: 90 }} className="col-span-2 grid h-24 w-24 place-items-center md:col-span-1" style={{ background: i % 2 ? Y : K, color: i % 2 ? K : Y }}><Ic size={40} /></motion.span>
            </motion.a>
          </div>
        ))}
      </div>
    </section>
  )
}

const CARS = [['Легковой', Car], ['Кроссовер', Car], ['Внедорожник', Truck], ['Микроавтобус', Truck]]
const WHEN = ['Сегодня', 'Завтра', 'На этой неделе', 'Позже — созвонимся']
function Wizard({ burst }) {
  const [st, setSt] = useState(0)
  const [d, setD] = useState({ car: '', svc: '', when: '', phone: '', name: '' })
  const [err, setErr] = useState(false), [sent, setSent] = useState(false), [load, setLoad] = useState(false)
  useEffect(() => { const h = e => { const t = e.target.closest('[data-svc]'); if (t) setD(p => ({ ...p, svc: t.dataset.svc })) }; document.addEventListener('click', h); return () => document.removeEventListener('click', h) }, [])
  const pick = (k, v) => { setD(p => ({ ...p, [k]: v })); setTimeout(() => setSt(s => Math.min(s + 1, 3)), 220) }
  const steps = ['Авто', 'Услуга', 'Когда', 'Контакты']
  const opt = (k, v, Ic) => (
    <motion.button whileTap={{ scale: .96 }} type="button" key={v} onClick={() => pick(k, v)}
      className={`flex items-center gap-3 p-5 text-left font-['Oswald',sans-serif] text-[20px] font-semibold uppercase transition-colors ${d[k] === v ? 'bg-[#ffd400] text-[#0c0c0c]' : 'bg-[#0c0c0c] text-white hover:bg-[#222]'}`}>
      {Ic && <Ic size={22} />}{v}{d[k] === v && <Check className="ml-auto" size={20} />}
    </motion.button>)
  const submit = e => {
    e.preventDefault()
    if (d.phone.replace(/\D/g, '').length < 12) { setErr(true); return }
    setLoad(true); const r = e.currentTarget.querySelector('button[type=submit]').getBoundingClientRect()
    setTimeout(() => { setLoad(false); setSent(true); burst(r.left + r.width / 2, r.top) }, 1000)
  }
  return (
    <section id="book" className="px-6 py-28 md:px-10">
      <div className="mx-auto max-w-[1100px] bg-[#161616] p-6 md:p-12">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <h2 className="font-['Oswald',sans-serif] text-[clamp(44px,6vw,88px)] font-bold uppercase leading-none text-white">Запись <span className="text-[#ffd400]">за 4 клика</span></h2>
          {!sent && <p className="font-['Oswald',sans-serif] text-[18px] uppercase tracking-wider text-[#9a9a9a]">Шаг {st + 1} / 4 · {steps[st]}</p>}
        </div>
        {!sent && <div className="mb-10 h-2 bg-[#0c0c0c]"><motion.div className="h-full bg-[#ffd400]" animate={{ width: `${(st + 1) * 25}%` }} transition={{ type: 'spring', bounce: 0, duration: .6 }} /></div>}
        <AnimatePresence mode="wait">
          {sent ? (
            <motion.div key="ok" initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }} className="py-14 text-center text-[#ffd400]">
              <CheckDraw size={90} className="mx-auto mb-6" />
              <h3 className="font-['Oswald',sans-serif] text-[48px] font-bold uppercase text-white">Вы в очереди!</h3>
              <p className="mx-auto max-w-[460px] text-[#9a9a9a]">{d.car} · {d.svc} · {d.when}. Так клиент увидит подтверждение — а вам заявка придёт в Telegram.</p>
            </motion.div>
          ) : (
            <motion.div key={st} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: .35, ease: [0.2, 0, 0, 1] }}>
              {st === 0 && <div className="grid gap-2 sm:grid-cols-2">{CARS.map(([v, I]) => opt('car', v, I))}</div>}
              {st === 1 && <div className="grid gap-2 sm:grid-cols-2">{SV.map(([v, , I]) => opt('svc', v, I))}</div>}
              {st === 2 && <div className="grid gap-2 sm:grid-cols-2">{WHEN.map(v => opt('when', v, Calendar))}</div>}
              {st === 3 && (
                <form onSubmit={submit} noValidate className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
                  <input value={d.name} onChange={e => setD({ ...d, name: e.target.value })} placeholder="Имя" autoComplete="name" className="h-16 bg-[#0c0c0c] px-5 text-[17px] text-white outline-none ring-2 ring-transparent focus:ring-[#ffd400]" />
                  <motion.input animate={err ? { x: [0, -8, 8, -6, 6, 0] } : {}} value={d.phone} onFocus={() => !d.phone && setD({ ...d, phone: '+375 ' })} onChange={e => { setErr(false); setD({ ...d, phone: e.target.value }) }} type="tel" inputMode="tel" autoComplete="tel" placeholder="Телефон *" className={`h-16 bg-[#0c0c0c] px-5 text-[17px] text-white outline-none ring-2 ${err ? 'ring-red-500' : 'ring-transparent focus:ring-[#ffd400]'}`} />
                  <button type="submit" disabled={load} className="h-16 bg-[#ffd400] px-10 font-['Oswald',sans-serif] text-[20px] font-bold uppercase text-[#0c0c0c] transition-[scale,opacity] active:scale-[.96] disabled:opacity-60">{load ? '...' : 'Готово'}</button>
                  <p className="text-[13px] text-[#9a9a9a] md:col-span-3">{d.car || 'Авто'} · {d.svc || 'услуга'} · {d.when || 'время'} — в готовом сайте заявка придёт в Telegram.</p>
                </form>)}
              {st > 0 && <button type="button" onClick={() => setSt(st - 1)} className="mt-6 inline-flex items-center gap-1 font-['Oswald',sans-serif] uppercase tracking-wider text-[#9a9a9a] hover:text-white"><ChevronLeft size={18} />Назад</button>}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

function App() {
  useSmooth()
  const [Sparks, burst] = useSparks()
  return (
    <MotionConfig reducedMotion="user">
      <div className="bg-[#0c0c0c] font-['Inter',sans-serif] text-white" style={{ '--sel': Y, '--selc': K }}>
        <Sparks />
        <Progress color={Y} />
        <Cursor color={Y} textColor={K} />
        <Ribbon name={b.name} bg={K} fg={Y} />
        <header className="sticky top-0 z-40 border-b-[3px] border-[#ffd400] bg-[#0c0c0c]">
          <div className="mx-auto flex h-[68px] max-w-[1320px] items-center justify-between px-6 md:px-10">
            <a href="#top" className="flex items-center gap-3 font-['Oswald',sans-serif] text-[24px] font-bold uppercase"><span className="grid h-10 w-10 place-items-center bg-[#ffd400] text-[#0c0c0c]"><Disc3 size={24} /></span>ЮЛВМонтаж</a>
            <nav className="hidden gap-8 font-['Oswald',sans-serif] text-[16px] uppercase tracking-wider text-[#9a9a9a] md:flex">{[['#services', 'Услуги'], ['#book', 'Запись'], ['#contacts', 'Контакты']].map(([h, t]) => <a key={h} href={h} className="transition-colors hover:text-[#ffd400]">{t}</a>)}</nav>
            <a href="#book" className="hidden h-11 items-center bg-[#ffd400] px-6 font-['Oswald',sans-serif] text-[16px] font-semibold uppercase text-[#0c0c0c] sm:inline-flex">Записаться</a>
          </div>
        </header>
        <main id="top">
          <Hero burst={burst} />
          <Hazard />
          <Stack />
          <section className="mx-auto grid max-w-[1320px] gap-px bg-[#222] px-0 md:grid-cols-3">
            {[[b.rev, 'оценок на Яндекс.Картах'], [3, 'направления: шины, ремонт, сварка'], [60, 'секунд на онлайн-запись']].map(([n, t]) => (
              <Reveal key={t} className="bg-[#0c0c0c] p-10"><Counter to={n} className="block font-['Oswald',sans-serif] text-[100px] font-bold leading-none text-[#ffd400]" /><span className="font-['Oswald',sans-serif] text-[18px] uppercase tracking-wide text-[#9a9a9a]">{t}</span></Reveal>
            ))}
          </section>
          <Wizard burst={burst} />
          <section id="contacts" className="mx-auto grid max-w-[1320px] gap-px bg-[#222] md:grid-cols-[1fr_1.3fr]">
            <div className="grid content-start gap-8 bg-[#0c0c0c] p-10">
              <h2 className="font-['Oswald',sans-serif] text-[64px] font-bold uppercase leading-none">Где <span className="text-[#ffd400]">мы</span></h2>
              <div><p className="mb-1 flex items-center gap-2 font-['Oswald',sans-serif] uppercase tracking-wider text-[#ffd400]"><MapPin size={16} />Адрес</p><p className="font-['Oswald',sans-serif] text-[26px]">{b.addr}</p></div>
              <div><p className="mb-1 font-['Oswald',sans-serif] uppercase tracking-wider text-[#ffd400]">Телефон</p>{b.phones.map(p => <a key={p} href={'tel:' + tel(p)} className="block font-['Oswald',sans-serif] text-[34px] font-semibold">{p}</a>)}</div>
              <div className="flex flex-wrap gap-2">{messengerLinks(b).map(m => <a key={m.k} href={m.href} target="_blank" rel="noopener" className="inline-flex items-center gap-2 bg-[#161616] px-4 py-3 font-['Oswald',sans-serif] uppercase tracking-wide transition-colors hover:bg-[#ffd400] hover:text-[#0c0c0c]">{m.Icon && <m.Icon width={16} height={16} />}{m.label}</a>)}</div>
            </div>
            <div className="min-h-[440px] bg-[#161616]"><MapFrame oid={b.oid} dark /></div>
          </section>
        </main>
        <footer className="mx-auto flex max-w-[1320px] flex-wrap justify-between gap-4 px-6 py-10 font-['Oswald',sans-serif] text-[14px] uppercase tracking-wider text-[#777] md:px-10"><span>© 2026 ЮЛВМонтаж</span><span>Демо-концепт · сайт — Артём</span></footer>
        <CallBar phone={b.phones[0]} barCls="bg-[#0c0c0c] border-t-[3px] border-[#ffd400]" callCls="bg-[#161616] font-['Oswald',sans-serif] uppercase" bookCls="bg-[#ffd400] text-[#0c0c0c] font-['Oswald',sans-serif] uppercase" />
        <div className="h-[72px] sm:hidden" />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
