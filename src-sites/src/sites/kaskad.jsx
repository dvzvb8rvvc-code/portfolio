import React, { useRef, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, AnimatePresence, MotionConfig } from 'framer-motion'
import { ArrowDownRight, Phone, MapPin, Plus, Check } from 'lucide-react'
import '../lib/base.css'
import { B } from '../data'
import { useSmooth, Ribbon, SplitText, ScrollWords, Reveal, Magnetic, Cursor, Counter, useBooking, phoneFocus, CheckDraw, MapFrame, messengerLinks, CallBar, Progress, Intro, tel, Grain } from '../lib/kit'

const b = B.kaskad
const BG = '#0d1714', GOLD = '#e7cf9f', MINT = '#9fd8c6', CREAM = '#f3ecdf'
const PF = "font-['Playfair_Display',serif]"
const SV = [
  ['Парикмахерский зал', 'Стрижки, окрашивание, укладки и уход для волос.', '#16302a'],
  ['Подология', 'Деликатная работа со стопой: вросший ноготь, мозоли, трещины, медицинский педикюр.', '#1b3a32'],
  ['Ногтевой сервис', 'Маникюр и педикюр с покрытием, укрепление, дизайн.', '#21443a'],
  ['Уход за лицом', 'Процедуры по типу кожи — подберёт мастер на консультации.', '#264d42'],
]
const PLAN = [['Стрижка', 60], ['Окрашивание', 120], ['Укладка', 40], ['Маникюр', 75], ['Педикюр', 90], ['Подолог', 60], ['Брови', 30]]

/* particle waterfall; the stream parts around the pointer */
function Falls() {
  const cv = useRef(null)
  useEffect(() => {
    const c = cv.current, ctx = c.getContext('2d')
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    let w, h, dpr = Math.min(devicePixelRatio, 1.5), id
    const mouse = { x: -999, y: -999 }
    const N = innerWidth < 768 ? 700 : 1600
    const P = []
    const spawn = (p, init) => {
      const lip = w * (innerWidth < 768 ? .5 : .62), spread = w * (innerWidth < 768 ? .42 : .34)
      p.x = lip + (Math.random() - .5) * spread; p.y = init ? Math.random() * h : -10 - Math.random() * 60
      p.vx = (Math.random() - .5) * .3; p.vy = 1 + Math.random() * 2; p.s = Math.random() * 1.6 + .4; p.g = Math.random() < .25
    }
    const resize = () => { w = c.offsetWidth; h = c.offsetHeight; c.width = w * dpr; c.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); P.length = 0; for (let i = 0; i < N; i++) { const p = {}; spawn(p, true); P.push(p) } }
    const tick = () => {
      ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = 'rgba(13,23,20,.28)'; ctx.fillRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'lighter'
      for (const p of P) {
        p.vy += .06
        const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy)
        if (d < 110) { p.vx += dx / d * .9; p.vy *= .96 }
        p.vx *= .985; p.x += p.vx; p.y += p.vy
        if (p.y > h * .86) { p.vy *= -.25; p.vx += (Math.random() - .5) * 2.4; p.y = h * .86; if (Math.random() < .2) spawn(p) }
        if (p.y > h + 10 || p.x < -10 || p.x > w + 10) spawn(p)
        ctx.strokeStyle = p.g ? 'rgba(231,207,159,.55)' : 'rgba(159,216,198,.35)'
        ctx.lineWidth = p.s
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 2, p.y - p.vy * 3); ctx.stroke()
      }
      if (!reduce) id = requestAnimationFrame(tick)
    }
    resize(); if (reduce) for (let i = 0; i < 80; i++) tick(); else tick()
    const mv = e => { const r = c.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top }
    const touch = e => { const t = e.touches[0]; if (t) mv(t) }
    c.addEventListener('pointermove', mv); c.addEventListener('touchmove', touch, { passive: true }); c.addEventListener('pointerleave', () => { mouse.x = -999 })
    addEventListener('resize', resize)
    return () => { cancelAnimationFrame(id); removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={cv} aria-hidden="true" className="absolute inset-0 h-full w-full" />
}

function Hero() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  return (
    <section ref={ref} className="relative h-[100svh] min-h-[660px] overflow-hidden">
      <Falls />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0d1714]" />
      <motion.div style={{ y }} className="pointer-events-none relative z-10 mx-auto flex h-full max-w-[1320px] flex-col justify-end px-6 pb-20 md:px-10">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="mb-6 text-[12px] uppercase tracking-[.4em] text-[#9fd8c6]">Салон красоты · подология · Кальварийская, 52</motion.p>
        <h1 className={`${PF} text-[clamp(64px,11vw,190px)] font-normal leading-[.86] tracking-[-.02em] text-[#f3ecdf]`}>
          <SplitText text="Каскад" delay={1.3} y="-120%" stagger={.06} className="block" />
          <span className="block italic text-[#e7cf9f]"><SplitText text="заботы" delay={1.6} y="-120%" stagger={.06} /></span>
        </h1>
        <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }} className="max-w-[420px] text-[17px] font-light text-[#f3ecdf]/70">Волосы, ногти, кожа и здоровье стоп — в одном месте. Коснитесь водопада, он расступится.</motion.p>
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.2 }} className="pointer-events-auto flex flex-wrap gap-3">
            <Magnetic><a href="#plan" data-cursor="План" className="inline-flex h-14 items-center gap-3 rounded-full px-8 text-[14px] font-medium uppercase tracking-[.16em] text-[#0d1714]" style={{ background: GOLD }}>Собрать визит <ArrowDownRight size={18} /></a></Magnetic>
            <a href={'tel:' + tel(b.phones[0])} className="inline-flex h-14 items-center gap-3 rounded-full px-7 text-[15px] text-[#f3ecdf] ring-1 ring-[#f3ecdf]/25"><Phone size={16} />{b.phones[0]}</a>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}

/* sticky stacking cards */
function Stack() {
  return (
    <section id="services" className="relative px-6 pb-20 md:px-10">
      <div className="mx-auto max-w-[1180px]">
        <h2 className={`${PF} mb-14 text-[clamp(48px,7vw,110px)] leading-[.9] text-[#f3ecdf]`}>Четыре <i className="text-[#e7cf9f]">ступени</i></h2>
        {SV.map(([t, d, bg], k) => (
          <div key={t} className="sticky mb-8 h-[min(70vh,560px)]" style={{ top: 96 + k * 26 }}>
            <motion.div initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-10%' }} transition={{ duration: .8 }}
              className="relative flex h-full flex-col justify-between overflow-hidden rounded-[44px] p-8 ring-1 ring-white/10 md:p-14" style={{ background: bg, boxShadow: '0 -30px 60px -30px rgba(0,0,0,.6)' }}>
              <svg className="pointer-events-none absolute -right-24 -top-24 h-[520px] w-[520px] opacity-30" viewBox="0 0 200 200">{Array.from({ length: 9 }).map((_, i) => <motion.path key={i} d={`M${20 + i * 18} 0 C ${30 + i * 18} 60, ${10 + i * 18} 120, ${24 + i * 18} 200`} stroke={i % 3 ? MINT : GOLD} strokeWidth=".6" fill="none" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ duration: 2, delay: i * .08 }} />)}</svg>
              <div className="flex items-start justify-between"><span className={`${PF} text-[clamp(80px,12vw,180px)] italic leading-none text-transparent [-webkit-text-stroke:1px_rgba(231,207,159,.6)]`}>0{k + 1}</span><a href="#plan" data-svc={t} className="grid h-16 w-16 place-items-center rounded-full text-[#0d1714] transition-transform hover:rotate-90" style={{ background: GOLD }}><Plus /></a></div>
              <div><h3 className={`${PF} mb-4 text-[clamp(38px,5vw,76px)] leading-none text-[#f3ecdf]`}>{t}</h3><p className="max-w-[520px] text-[17px] font-light text-[#f3ecdf]/70">{d}</p></div>
            </motion.div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* visit planner: chosen services cascade into a timeline */
function Plan() {
  const bk = useBooking()
  const [sel, setSel] = useState(['Стрижка'])
  const toggle = t => setSel(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t])
  const total = PLAN.filter(p => sel.includes(p[0])).reduce((a, p) => a + p[1], 0)
  let acc = 0
  const fmt = m => `${10 + Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`
  const f = 'h-14 w-full rounded-full bg-white/5 px-6 text-[16px] text-[#f3ecdf] outline-none ring-1 ring-white/15 placeholder:text-white/35 focus:ring-[#e7cf9f]'
  return (
    <section id="plan" className="px-6 py-28 md:px-10" style={{ background: CREAM, color: BG }}>
      <div className="mx-auto max-w-[1280px]">
        <h2 className={`${PF} mb-4 text-[clamp(48px,7vw,110px)] leading-[.9]`}>Соберите <i className="text-[#2f6b5a]">визит</i></h2>
        <p className="mb-12 max-w-[520px] text-[17px] text-[#0d1714]/65">Отметьте услуги — увидите примерный план дня. Администратор подтвердит мастеров и точное время.</p>
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr_1fr]">
          <div className="flex flex-wrap content-start gap-2">
            {PLAN.map(([t]) => <button key={t} onClick={() => toggle(t)} className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-[15px] transition-colors ${sel.includes(t) ? 'bg-[#0d1714] text-[#e7cf9f]' : 'bg-white text-[#0d1714] ring-1 ring-[#0d1714]/10'}`}>{sel.includes(t) ? <Check size={16} /> : <Plus size={16} />}{t}</button>)}
          </div>
          <div className="relative rounded-[36px] bg-white p-8">
            <p className="mb-6 text-[12px] uppercase tracking-[.3em] text-[#0d1714]/45">Ваш день · пример</p>
            <div className="relative border-l-2 border-[#2f6b5a]/25 pl-6">
              <AnimatePresence>
                {PLAN.filter(p => sel.includes(p[0])).map(([t, m]) => { const st = acc; acc += m; return (
                  <motion.div layout key={t} initial={{ opacity: 0, y: -30, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, x: 30, height: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 22 }} className="relative overflow-hidden pb-5">
                    <span className="absolute -left-[33px] top-1 h-4 w-4 rounded-full ring-4 ring-white" style={{ background: '#2f6b5a' }} />
                    <span className="text-[13px] text-[#0d1714]/45">{fmt(st)} — {fmt(st + m)}</span>
                    <p className={`${PF} text-[26px] leading-tight`}>{t}</p>
                  </motion.div>) })}
              </AnimatePresence>
              {!sel.length && <p className="text-[#0d1714]/40">Выберите хотя бы одну услугу</p>}
            </div>
            <div className="mt-4 flex justify-between border-t border-[#0d1714]/10 pt-4"><span className="text-[#0d1714]/55">Примерно</span><b className={`${PF} text-[24px]`}>{Math.floor(total / 60)} ч {total % 60} мин</b></div>
          </div>
          <div className="rounded-[36px] p-8" style={{ background: BG }}>
            <AnimatePresence mode="wait">
              {!bk.s.sent ? (
                <motion.form key="f" exit={{ opacity: 0 }} onSubmit={e => { bk.upd('svc', sel.join(' + ')); bk.submit(e) }} noValidate className="grid gap-4">
                  <p className={`${PF} text-[34px] leading-tight text-[#f3ecdf]`}>Отправить план</p>
                  <input className={f} placeholder="Имя" value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} autoComplete="name" />
                  <motion.input animate={bk.s.err ? { x: [0, -8, 8, -6, 6, 0] } : {}} className={f + (bk.s.err ? ' !ring-red-400' : '')} type="tel" inputMode="tel" placeholder="+375 (__) ___-__-__" value={bk.s.phone} onFocus={phoneFocus(bk)} onChange={e => bk.upd('phone', e.target.value)} autoComplete="tel" />
                  <button disabled={bk.s.loading} className="h-14 rounded-full text-[14px] font-medium uppercase tracking-[.16em] text-[#0d1714] disabled:opacity-60" style={{ background: GOLD }}>{bk.s.loading ? 'Отправляем…' : 'Записаться'}</button>
                  <p className="text-[13px] text-[#f3ecdf]/45">В готовом сайте план визита сразу придёт вам в Telegram.</p>
                </motion.form>
              ) : (
                <motion.div key="ok" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid h-full place-items-center text-center text-[#e7cf9f]">
                  <div><CheckDraw className="mx-auto mb-4" /><h3 className={`${PF} text-[38px] italic text-[#f3ecdf]`}>План принят</h3><p className="mb-4 text-[#f3ecdf]/60">Так клиент увидит подтверждение.</p><button onClick={bk.reset} className="underline underline-offset-4">Изменить</button></div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}

function App() {
  useSmooth()
  return (
    <MotionConfig reducedMotion="user">
      <div className="font-['Jost',sans-serif] text-[#f3ecdf]" style={{ background: BG, '--sel': GOLD, '--selc': BG }}>
        <Intro bg={BG} fg={GOLD} duration={1.5}>
          <svg viewBox="0 0 120 160" className="h-40">{[0, 1, 2, 3, 4].map(i => <motion.path key={i} d={`M${20 + i * 20} 0 C ${30 + i * 20} 60, ${10 + i * 20} 100, ${20 + i * 20} 160`} stroke={i % 2 ? MINT : GOLD} strokeWidth="2" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: i * .08 }} />)}</svg>
        </Intro>
        <Grain opacity={.06} />
        <Progress color={GOLD} />
        <Cursor color={GOLD} blend="normal" textColor={BG} />
        <Ribbon name={b.name} bg={GOLD} fg={BG} />
        <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0d1714]/75 backdrop-blur-xl">
          <div className="mx-auto flex h-[72px] max-w-[1320px] items-center justify-between px-6 md:px-10">
            <a href="#top" className={`${PF} text-[28px] italic text-[#e7cf9f]`}>Каскад</a>
            <nav className="hidden gap-9 text-[13px] uppercase tracking-[.2em] text-[#f3ecdf]/60 md:flex">{[['#services', 'Услуги'], ['#plan', 'Визит'], ['#contacts', 'Контакты']].map(([h, t]) => <a key={h} href={h} className="hover:text-[#f3ecdf]">{t}</a>)}</nav>
            <a href="#plan" className="hidden h-11 items-center rounded-full px-6 text-[13px] uppercase tracking-[.16em] text-[#0d1714] sm:inline-flex" style={{ background: GOLD }}>Записаться</a>
          </div>
        </header>
        <main id="top">
          <Hero />
          <section className="px-6 py-32 md:px-10 md:py-44"><ScrollWords className={`${PF} mx-auto max-w-[1100px] text-[clamp(32px,4.4vw,68px)] leading-[1.12]`} text="Как вода в каскаде, забота перетекает от одного мастера к другому: от волос — к рукам, от рук — к здоровью стоп. Вы просто отдыхаете." /></section>
          <Stack />
          <section className="px-6 py-20 md:px-10">
            <div className="mx-auto grid max-w-[1280px] gap-6 md:grid-cols-3">
              {[[b.rev, 'оценок на Яндекс.Картах'], [4, 'направления под одной крышей'], [7, 'услуг в планировщике визита']].map(([n, t]) => <Reveal key={t} className="border-t border-[#e7cf9f]/40 pt-6"><span className={`${PF} block text-[96px] italic leading-none text-[#e7cf9f]`}><Counter to={n} /></span><span className="text-[#f3ecdf]/60">{t}</span></Reveal>)}
            </div>
          </section>
          <Plan />
          <section id="contacts" className="px-6 py-28 md:px-10">
            <div className="mx-auto grid max-w-[1280px] gap-6 md:grid-cols-[.9fr_1.1fr]">
              <Reveal className="grid content-start gap-7">
                <h2 className={`${PF} text-[clamp(52px,7vw,110px)] leading-[.9]`}>Мы <i className="text-[#e7cf9f]">рядом</i></h2>
                <p className="flex items-start gap-3 text-[22px] font-light"><MapPin className="mt-1 shrink-0 text-[#e7cf9f]" />{b.addr}</p>
                {b.phones.map(p => <a key={p} href={'tel:' + tel(p)} className={`${PF} text-[34px]`}>{p}</a>)}
                <div className="flex flex-wrap gap-2">{messengerLinks(b).map(m => <a key={m.k} href={m.href} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-[14px] ring-1 ring-[#f3ecdf]/20 hover:ring-[#e7cf9f]">{m.Icon && <m.Icon width={16} height={16} />}{m.label}</a>)}</div>
              </Reveal>
              <Reveal delay={.1} className="h-[420px] overflow-hidden rounded-[36px] ring-1 ring-white/10"><MapFrame oid={b.oid} dark /></Reveal>
            </div>
          </section>
        </main>
        <footer className="border-t border-white/10 px-6 py-10 text-[13px] text-[#f3ecdf]/45 md:px-10"><div className="mx-auto flex max-w-[1320px] flex-wrap justify-between gap-4"><span>© 2026 Каскад</span><span>Демо-концепт · дизайн и разработка — Артём</span></div></footer>
        <CallBar phone={b.phones[0]} barCls="bg-[#0d1714]/90 backdrop-blur-xl border-t border-white/10" callCls="rounded-full ring-1 ring-white/20" bookCls="rounded-full text-[#0d1714] bg-[#e7cf9f]" />
        <div className="h-[72px] sm:hidden" />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
