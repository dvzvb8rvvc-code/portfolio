import React, { useRef, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, useVelocity, useSpring, AnimatePresence, MotionConfig } from 'framer-motion'
import { ArrowRight, Phone, MapPin, Droplets, Armchair, Sparkles, ShieldCheck, Car, Star, Hand } from 'lucide-react'
import '../lib/base.css'
import { B } from '../data'
import { LineReveal, useSmooth, Ribbon, SplitText, Reveal, Magnetic, Cursor, Marquee, Counter, useBooking, phoneFocus, CheckDraw, MapFrame, messengerLinks, CallBar, Progress, tel } from '../lib/kit'

const b = B.fastclean
const C = '#19e3ff', V = '#7b5cff'
const SV = [['Экспресс-мойка', 'Кузов, диски и стёкла — пока вы пьёте кофе.', Droplets], ['Химчистка салона', 'Сиденья, потолок, ковры — глубокая чистка.', Armchair], ['Полировка кузова', 'Убираем паутинку и возвращаем глубину цвета.', Sparkles], ['Керамика и воск', 'Гидрофоб и блеск надолго.', ShieldCheck], ['Мойка двигателя', 'Бережно и безопасно для электроники.', Car], ['Комплекс «Как новая»', 'Кузов + салон + стёкла за один визит.', Star]]

const CAR = (
  <svg viewBox="0 0 600 220" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" className="w-[min(86vw,900px)]">
    <path d="M40 160v-28c0-14 8-22 22-25l76-14 70-50c12-8 26-13 40-13h138c16 0 30 6 42 16l56 48 50 8c20 3 30 16 30 34v24h-44" /><path d="M40 160h46M178 160h228" />
    <circle cx="132" cy="164" r="38" /><circle cx="452" cy="164" r="38" /><circle cx="132" cy="164" r="12" /><circle cx="452" cy="164" r="12" />
    <path d="M226 50l-22 46h112V40M340 40v56h120l-50-44" />
  </svg>
)

function WipeHero() {
  const wrap = useRef(null), cv = useRef(null)
  const [pct, setPct] = useState(0)
  const [hint, setHint] = useState(true)
  useEffect(() => {
    const c = cv.current, ctx = c.getContext('2d')
    let w, h, dpr = Math.min(devicePixelRatio, 2)
    const paintDirt = () => {
      const r = wrap.current.getBoundingClientRect(); w = r.width; h = r.height
      c.width = w * dpr; c.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.globalCompositeOperation = 'source-over'
      const g = ctx.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#3b2f22'); g.addColorStop(1, '#1c1611')
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
      for (let i = 0; i < 260; i++) {
        const x = Math.random() * w, y = Math.random() * h, rr = 6 + Math.random() * 70
        const rg = ctx.createRadialGradient(x, y, 0, x, y, rr)
        const a = .15 + Math.random() * .35
        rg.addColorStop(0, `rgba(${110 + Math.random() * 40 | 0},${85 + Math.random() * 30 | 0},${55 + Math.random() * 20 | 0},${a})`); rg.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(x, y, rr, 0, Math.PI * 2); ctx.fill()
      }
      ctx.fillStyle = 'rgba(230,210,180,.55)'; ctx.font = `700 ${Math.max(14, w * .012)}px Manrope`; ctx.textAlign = 'center'
      ctx.fillText('ПОМОЙ МЕНЯ', w * .5, h * .9)
    }
    paintDirt()
    let last = null, cleared = 0
    const brush = (x, y) => {
      ctx.globalCompositeOperation = 'destination-out'
      const R = Math.max(56, w * .06)
      const rg = ctx.createRadialGradient(x, y, 0, x, y, R); rg.addColorStop(0, 'rgba(0,0,0,1)'); rg.addColorStop(.6, 'rgba(0,0,0,.85)'); rg.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = rg
      if (last) { const dx = x - last.x, dy = y - last.y, d = Math.hypot(dx, dy), n = Math.ceil(d / 10); for (let i = 0; i < n; i++) { ctx.beginPath(); ctx.arc(last.x + dx * i / n, last.y + dy * i / n, R, 0, Math.PI * 2); ctx.fill() } }
      ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.fill(); last = { x, y }
      if (++cleared % 12 === 0) measure()
    }
    const measure = () => {
      const d = ctx.getImageData(0, 0, c.width, c.height).data; let t = 0, n = 0
      for (let i = 3; i < d.length; i += 4 * 64) { n++; if (d[i] < 40) t++ }
      setPct(Math.round(t / n * 100))
    }
    const pos = e => { const r = c.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top] }
    const mv = e => { if (e.pointerType === 'mouse' || e.buttons || e.pressure > 0) { brush(...pos(e)); setHint(false) } }
    const up = () => { last = null }
    c.addEventListener('pointermove', mv); c.addEventListener('pointerdown', mv); c.addEventListener('pointerleave', up); c.addEventListener('pointerup', up)
    // auto demo stroke
    let t0 = performance.now(), raf
    const demo = t => { const k = (t - t0) / 2200; if (k > 1) { last = null; measure(); return } brush(w * (.18 + k * .64), h * (.45 + Math.sin(k * Math.PI * 4) * .14)); raf = requestAnimationFrame(demo) }
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) setTimeout(() => { t0 = performance.now(); raf = requestAnimationFrame(demo) }, 900)
    const ro = new ResizeObserver(() => { paintDirt(); last = null })
    ro.observe(wrap.current)
    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [])
  return (
    <section ref={wrap} className="relative h-[86svh] min-h-[560px] overflow-hidden" data-cursor="Мой">
      <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(70%_60%_at_50%_50%,#0b2a35,#04070b)]">
        <div className="text-center">
          <div className="text-[#19e3ff] drop-shadow-[0_0_24px_rgba(25,227,255,.7)]">{CAR}</div>
          <p className="mt-6 font-['Unbounded',sans-serif] text-[clamp(28px,4vw,56px)] font-extrabold tracking-[-.04em]">Вот это <span className="bg-gradient-to-r from-[#19e3ff] to-[#7b5cff] bg-clip-text text-transparent">блеск</span></p>
        </div>
      </div>
      <canvas ref={cv} className="absolute inset-0 h-full w-full touch-none" aria-label="Интерактивная грязь — проведите, чтобы отмыть" />
      <AnimatePresence>{hint && (
        <motion.div exit={{ opacity: 0, scale: .9 }} className="pointer-events-none absolute left-1/2 top-[18%] -translate-x-1/2 rounded-full bg-black/50 px-5 py-3 text-[14px] font-bold backdrop-blur">
          <span className="inline-flex items-center gap-2"><Hand size={16} />Проведите курсором или пальцем — отмойте машину</span>
        </motion.div>)}</AnimatePresence>
      <div className="pointer-events-none absolute bottom-6 right-6 rounded-2xl bg-black/50 px-4 py-3 font-['Unbounded',sans-serif] text-[14px] backdrop-blur">Чисто: <span className="text-[#19e3ff]" style={{ fontVariantNumeric: 'tabular-nums' }}>{pct}%</span></div>
    </section>
  )
}

function Stretch({ children }) {
  const { scrollY } = useScroll()
  const v = useSpring(useVelocity(scrollY), { stiffness: 300, damping: 40 })
  const sx = useTransform(v, [-2500, 0, 2500], [1.25, 1, 1.25])
  const sk = useTransform(v, [-2500, 2500], [10, -10])
  return <motion.div style={{ scaleX: sx, skewX: sk }} className="origin-center">{children}</motion.div>
}

function Carousel() {
  const track = useRef(null), outer = useRef(null)
  const [lim, setLim] = useState(0)
  useEffect(() => { const f = () => setLim(Math.max(0, track.current.scrollWidth - outer.current.offsetWidth)); f(); addEventListener('resize', f); return () => removeEventListener('resize', f) }, [])
  return (
    <section id="services" className="py-28">
      <div className="mx-auto mb-12 flex max-w-[1260px] flex-wrap items-end justify-between gap-6 px-6">
        <Stretch><h2 className="font-['Unbounded',sans-serif] text-[clamp(40px,6vw,92px)] font-extrabold leading-[.92] tracking-[-.05em]">Что мы <span className="bg-gradient-to-r from-[#19e3ff] to-[#7b5cff] bg-clip-text text-transparent">делаем</span></h2></Stretch>
        <p className="max-w-[340px] text-[#7f97a3]">Тяните карточки вбок ← → Нажмите на услугу, чтобы записаться.</p>
      </div>
      <div ref={outer} className="overflow-hidden px-6" data-cursor="Тяни">
        <motion.div ref={track} drag="x" dragConstraints={{ left: -lim, right: 0 }} dragElastic={0.12} className="flex w-max cursor-grab gap-5 active:cursor-grabbing">
          {SV.map(([t, d, Ic], i) => (
            <motion.div key={t} whileHover={{ y: -8 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} className="group relative flex h-[380px] w-[300px] shrink-0 select-none flex-col justify-between overflow-hidden rounded-[30px] bg-[#0b1117] p-7 ring-1 ring-white/10 md:w-[340px]">
              <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(25,227,255,.35),transparent_65%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="flex items-start justify-between"><span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#19e3ff]/10 text-[#19e3ff]"><Ic size={26} /></span><span className="font-['Unbounded',sans-serif] text-[13px] text-[#7f97a3]">0{i + 1}</span></div>
              <div><h3 className="mb-2 font-['Unbounded',sans-serif] text-[24px] font-bold leading-tight tracking-[-.03em]">{t}</h3><p className="mb-5 text-[#7f97a3]">{d}</p>
                <a href="#book" data-svc={t} onPointerDown={e => e.stopPropagation()} className="inline-flex items-center gap-2 rounded-full bg-[#19e3ff] px-5 py-2.5 text-[14px] font-bold text-[#002a33]">Записаться <ArrowRight size={16} /></a></div>
            </motion.div>))}
        </motion.div>
      </div>
    </section>
  )
}

function Book() {
  const bk = useBooking()
  const f = 'h-14 w-full rounded-2xl border border-white/15 bg-black/40 px-5 text-[16px] outline-none transition-[border-color,box-shadow] focus:border-[#19e3ff] focus:shadow-[0_0_0_4px_rgba(25,227,255,.14)]'
  return (
    <section id="book" className="px-6 py-24">
      <div className="relative mx-auto grid max-w-[1260px] gap-12 overflow-hidden rounded-[36px] bg-[#0b1117] p-8 ring-1 ring-white/10 md:grid-cols-2 md:p-16">
        <motion.div animate={{ x: [0, 60, 0], y: [0, -40, 0] }} transition={{ repeat: Infinity, duration: 12 }} className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(25,227,255,.22),transparent_65%)]" />
        <motion.div animate={{ x: [0, -50, 0], y: [0, 40, 0] }} transition={{ repeat: Infinity, duration: 14 }} className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(123,92,255,.22),transparent_65%)]" />
        <div className="relative">
          <h2 className="font-['Unbounded',sans-serif] text-[clamp(36px,4.4vw,64px)] font-extrabold leading-[.95] tracking-[-.05em]">Займите <span className="text-[#19e3ff]">бокс</span></h2>
          <p className="mb-8 mt-5 max-w-[380px] text-[#7f97a3]">Оставьте заявку — перезвоним и предложим ближайшее свободное время.</p>
          {b.phones.map(p => <a key={p} href={'tel:' + tel(p)} className="font-['Unbounded',sans-serif] text-[26px] font-bold tracking-[-.03em]">{p}</a>)}
        </div>
        <div className="relative">
          <AnimatePresence mode="wait">{!bk.s.sent ? (
            <motion.form key="f" exit={{ opacity: 0, y: -10 }} onSubmit={bk.submit} noValidate className="grid gap-4">
              <input className={f} value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} placeholder="Имя" autoComplete="name" />
              <motion.input animate={bk.s.err ? { x: [0, -8, 8, -6, 6, 0] } : {}} className={f + (bk.s.err ? ' !border-red-400' : '')} value={bk.s.phone} onFocus={phoneFocus(bk)} onChange={e => bk.upd('phone', e.target.value)} type="tel" inputMode="tel" placeholder="Телефон *" autoComplete="tel" />
              <select className={f} value={bk.s.svc} onChange={e => bk.upd('svc', e.target.value)}><option value="">Услуга</option>{SV.map(([t]) => <option key={t}>{t}</option>)}</select>
              <button disabled={bk.s.loading} className="h-14 rounded-full bg-[#19e3ff] font-extrabold text-[#002a33] shadow-[0_10px_40px_rgba(25,227,255,.3)] transition-[scale,opacity] active:scale-[.96] disabled:opacity-60">{bk.s.loading ? 'Отправляем…' : 'Записаться'}</button>
              <p className="text-[13px] text-[#7f97a3]">В готовом сайте заявка придёт вам в Telegram.</p>
            </motion.form>) : (
            <motion.div key="ok" initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }} className="py-12 text-center text-[#19e3ff]"><CheckDraw className="mx-auto mb-5" /><h3 className="font-['Unbounded',sans-serif] text-[28px] font-bold text-white">Ждём вас!</h3><p className="text-[#7f97a3]">Так клиент увидит подтверждение записи.</p></motion.div>)}
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
      <div className="bg-[#04070b] font-['Manrope',sans-serif] text-[#e9fbff]" style={{ '--sel': C, '--selc': '#002a33' }}>
        <Progress color={`linear-gradient(90deg,${C},${V})`} />
        <Cursor color={C} textColor="#002a33" blend="normal" />
        <Ribbon name={b.name} bg={C} fg="#002a33" />
        <header className="sticky top-0 z-40 border-b border-white/10 bg-[#04070b]/70 backdrop-blur-xl">
          <div className="mx-auto flex h-[68px] max-w-[1260px] items-center justify-between px-6">
            <a href="#top" className="flex items-center gap-2 font-['Unbounded',sans-serif] text-[19px] font-bold tracking-[-.03em]"><span className="grid h-8 w-8 place-items-center rounded-[10px] bg-[#19e3ff] text-[#002a33]"><Droplets size={18} /></span>Fast<span className="text-[#19e3ff]">Clean</span></a>
            <nav className="hidden gap-7 text-[14px] text-[#7f97a3] md:flex">{[['#services', 'Услуги'], ['#book', 'Запись'], ['#contacts', 'Контакты']].map(([h, t]) => <a key={h} href={h} className="hover:text-white">{t}</a>)}</nav>
            <a href="#book" className="hidden h-11 items-center rounded-full bg-[#19e3ff] px-5 text-[14px] font-bold text-[#002a33] sm:inline-flex">Записаться</a>
          </div>
        </header>
        <main id="top">
          <section className="relative overflow-hidden px-6 pb-16 pt-20 text-center">
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-7 inline-flex rounded-full px-4 py-2 text-[13px] text-[#7f97a3] ring-1 ring-white/10">Мойка · химчистка · детейлинг — <b className="ml-1 text-[#19e3ff]">{b.addr}</b></motion.p>
            <h1 className="font-['Unbounded',sans-serif] text-[clamp(46px,9vw,140px)] font-extrabold leading-[.9] tracking-[-.06em]">
              <SplitText text="Грязь уходит." className="block" stagger={.03} />
              <LineReveal delay={.45} className="bg-gradient-to-r from-[#19e3ff] to-[#7b5cff] bg-clip-text text-transparent">Блеск остаётся.</LineReveal>
            </h1>
            <Reveal delay={.6}><p className="mx-auto mb-9 mt-7 max-w-[560px] text-[18px] text-[#7f97a3]">Автомойка, химчистка салона и детейлинг. Приезжайте по записи — заберёте машину, которая выглядит и пахнет как новая.</p></Reveal>
            <Reveal delay={.7} className="flex flex-wrap justify-center gap-3">
              <Magnetic><a href="#book" data-cursor="Запись" className="inline-flex h-14 items-center gap-2 rounded-full bg-[#19e3ff] px-8 font-extrabold text-[#002a33] shadow-[0_10px_40px_rgba(25,227,255,.35)] transition-[scale] active:scale-[.96]">Записаться <ArrowRight size={18} /></a></Magnetic>
              <a href={'tel:' + tel(b.phones[0])} className="inline-flex h-14 items-center gap-2 rounded-full px-7 font-bold ring-1 ring-white/20"><Phone size={16} />{b.phones[0]}</a>
            </Reveal>
          </section>
          <WipeHero />
          <Marquee base={-3.5} className="border-y border-white/10 py-6">
            {['Экспресс-мойка', 'Химчистка', 'Полировка', 'Керамика', 'Детейлинг'].map(t => <span key={t} className="mx-6 inline-flex items-center gap-12 font-['Unbounded',sans-serif] text-[clamp(28px,4vw,58px)] font-extrabold tracking-[-.04em] text-transparent [-webkit-text-stroke:1.5px_#19e3ff]">{t}<Droplets className="text-[#7b5cff]" size={30} /></span>)}
          </Marquee>
          <Carousel />
          <section className="mx-auto grid max-w-[1260px] gap-4 px-6 md:grid-cols-3">
            {[[b.rev, 'оценок на Яндекс.Картах'], [3, 'в 1: мойка, химчистка, детейлинг'], [24, 'часа в сутки — онлайн-запись']].map(([n, t], i) => (
              <Reveal key={t} delay={i * .08} className="rounded-[28px] bg-gradient-to-b from-[#111a22] to-[#0b1117] p-9 ring-1 ring-white/10"><Counter to={n} className={`block font-['Unbounded',sans-serif] text-[72px] font-extrabold leading-none tracking-[-.06em] ${i === 0 ? 'text-[#19e3ff]' : ''}`} /><span className="text-[#7f97a3]">{t}</span></Reveal>))}
          </section>
          <Book />
          <section id="contacts" className="mx-auto grid max-w-[1260px] gap-4 px-6 pb-24 md:grid-cols-[1fr_1.3fr]">
            <Reveal className="grid content-start gap-6 rounded-[28px] bg-[#0b1117] p-9 ring-1 ring-white/10">
              <h2 className="font-['Unbounded',sans-serif] text-[48px] font-extrabold tracking-[-.05em]">Где <span className="text-[#19e3ff]">мы</span></h2>
              <div><p className="mb-1 flex items-center gap-2 text-[12px] uppercase tracking-[.16em] text-[#19e3ff]"><MapPin size={14} />Адрес</p><p className="font-['Unbounded',sans-serif] text-[20px] font-bold">{b.addr}</p></div>
              <div><p className="mb-1 text-[12px] uppercase tracking-[.16em] text-[#19e3ff]">Телефон</p>{b.phones.map(p => <a key={p} href={'tel:' + tel(p)} className="font-['Unbounded',sans-serif] text-[20px] font-bold">{p}</a>)}</div>
              <div className="flex flex-wrap gap-2">{messengerLinks(b).map(m => <a key={m.k} href={m.href} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[14px] font-semibold ring-1 ring-white/15 transition-colors hover:bg-[#19e3ff] hover:text-[#002a33]">{m.Icon && <m.Icon width={16} height={16} />}{m.label}</a>)}</div>
            </Reveal>
            <Reveal delay={.08} className="min-h-[400px] overflow-hidden rounded-[28px] ring-1 ring-white/10"><MapFrame oid={b.oid} dark /></Reveal>
          </section>
        </main>
        <footer className="border-t border-white/10 px-6 py-10 text-[13px] text-[#7f97a3]"><div className="mx-auto flex max-w-[1260px] flex-wrap justify-between gap-4"><span>© 2026 FastClean</span><span>Демо-концепт · сайт — Артём</span></div></footer>
        <CallBar phone={b.phones[0]} barCls="bg-[#04070b]/90 backdrop-blur-xl border-t border-white/10" callCls="rounded-full ring-1 ring-white/20" bookCls="rounded-full bg-[#19e3ff] text-[#002a33]" />
        <div className="h-[72px] sm:hidden" />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
