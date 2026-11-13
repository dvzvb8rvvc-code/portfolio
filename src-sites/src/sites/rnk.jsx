import React, { useRef, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence, MotionConfig } from 'framer-motion'
import { ArrowUpRight, Phone, MapPin } from 'lucide-react'
import '../lib/base.css'
import { B } from '../data'
import { useSmooth, Ribbon, SplitText, ScrollWords, Reveal, Magnetic, Cursor, Marquee, Counter, useBooking, phoneFocus, CheckDraw, MapFrame, messengerLinks, CallBar, Progress, Intro, tel, Grain } from '../lib/kit'

const b = B.rnk
const HEAD = "font-['Archivo_Black',sans-serif]", SERIF = "font-['Instrument_Serif',serif]"
const TONES = [
  ['Блонд', ['#f6e3b4', '#e8c98a', '#fff4d6', '#c9a46a'], '#e8c98a'],
  ['Медь', ['#e0763a', '#b8501f', '#ff9a5a', '#8c3a14'], '#e0763a'],
  ['Шоколад', ['#7a4a2c', '#5a3420', '#a26a44', '#3a2214'], '#a26a44'],
  ['Пепельный', ['#d6d6d6', '#a9adb3', '#f2f2f2', '#7d8288'], '#c9ccd1'],
  ['Розовый', ['#ff9ec7', '#f06aa5', '#ffd0e4', '#c94b84'], '#ff9ec7'],
]
const SV = [
  ['Стрижки', 'Женские, мужские и детские. Форма, которая сама ложится после душа.'],
  ['Окрашивание', 'Однотон, тонирование, мелирование, сложные техники.'],
  ['Блонд', 'Осветление с защитой волоса и чистым холодным или тёплым оттенком.'],
  ['Уход', 'Восстановление, увлажнение, процедуры для блеска.'],
  ['Укладки', 'Повседневные и вечерние, локоны и гладкость.'],
  ['Брови и ресницы', 'Коррекция, окрашивание, ламинирование.'],
]

/* flow-field "hair": thousands of strands drift along a noise field and swirl around the pointer */
function Hair({ palette }) {
  const cv = useRef(null), pal = useRef(palette)
  pal.current = palette
  useEffect(() => {
    const c = cv.current, ctx = c.getContext('2d')
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    let w, h, dpr = Math.min(devicePixelRatio, 1.5), id, P = [], t = 0
    const mouse = { x: -9999, y: -9999 }
    const N = innerWidth < 768 ? 900 : 2200
    const resize = () => {
      w = c.offsetWidth; h = c.offsetHeight; c.width = w * dpr; c.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.fillStyle = '#0a0a0a'; ctx.fillRect(0, 0, w, h)
      P = Array.from({ length: N }, () => ({ x: Math.random() * w, y: Math.random() * h, l: Math.random() * 200, c: (Math.random() * 4) | 0 }))
    }
    const field = (x, y) => {
      const s = .0016
      let a = Math.sin(x * s + t * .2) * 1.6 + Math.cos(y * s * 1.3 - t * .15) * 1.6 + Math.sin((x + y) * s * .6) * .8
      const dx = x - mouse.x, dy = y - mouse.y, d2 = dx * dx + dy * dy
      if (d2 < 40000) a += Math.atan2(dy, dx) + Math.PI / 2 * (1 - d2 / 40000) * 2.2
      return a + .9
    }
    const step = () => {
      t += .01
      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = 'rgba(10,10,10,.045)'; ctx.fillRect(0, 0, w, h)
      ctx.lineWidth = 1.1
      for (let k = 0; k < 4; k++) {
        ctx.strokeStyle = pal.current[k]; ctx.globalAlpha = k === 2 ? .75 : .5
        ctx.beginPath()
        for (const p of P) {
          if (p.c !== k) continue
          const a = field(p.x, p.y), nx = p.x + Math.cos(a) * 1.6, ny = p.y + Math.sin(a) * 1.6
          ctx.moveTo(p.x, p.y); ctx.lineTo(nx, ny); p.x = nx; p.y = ny
          if (--p.l < 0 || nx < 0 || nx > w || ny < 0 || ny > h) { p.x = Math.random() * w; p.y = Math.random() * h; p.l = 80 + Math.random() * 200 }
        }
        ctx.stroke()
      }
      ctx.globalAlpha = 1
      if (!reduce) id = requestAnimationFrame(step)
    }
    resize()
    if (reduce) for (let i = 0; i < 160; i++) step(); else step()
    const mv = e => { const r = c.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top }
    const lv = () => { mouse.x = -9999; mouse.y = -9999 }
    c.addEventListener('pointermove', mv); c.addEventListener('pointerleave', lv)
    addEventListener('resize', resize)
    return () => { cancelAnimationFrame(id); removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={cv} className="absolute inset-0 h-full w-full" aria-hidden="true" />
}

function Hero({ tone }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const l = useTransform(scrollYProgress, [0, 1], ['0%', '-40%']), r = useTransform(scrollYProgress, [0, 1], ['0%', '40%'])
  return (
    <section ref={ref} className="relative h-[100svh] min-h-[640px] overflow-hidden bg-[#0a0a0a]">
      <Hair palette={tone[1]} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_50%,transparent,rgba(10,10,10,.75))]" />
      <div className="pointer-events-none relative z-10 flex h-full flex-col justify-center px-5 md:px-10">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }} className="mb-6 text-center text-[12px] uppercase tracking-[.4em] text-white/60">Hair club · Нововиленская, 39</motion.p>
        <h1 className={`${HEAD} text-center text-[clamp(84px,25vw,420px)] uppercase leading-[.78] tracking-[-.04em] text-white`}>
          <span className="flex justify-center overflow-hidden">
            <motion.span style={{ x: l }} className="block"><SplitText text="RN" delay={1.3} stagger={.08} /></motion.span>
            <motion.span style={{ x: r, color: tone[2] }} className="block transition-colors duration-700"><SplitText text="K" delay={1.46} /></motion.span>
          </span>
        </h1>
        <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2 }} className={`${SERIF} mx-auto mt-6 max-w-[620px] text-center text-[clamp(24px,3vw,40px)] italic leading-tight text-white/85`}>волосы, которые хочется трогать</motion.p>
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.2 }} className="pointer-events-auto mt-10 flex flex-wrap justify-center gap-3">
          <Magnetic><a href="#book" data-cursor="Запись" className="inline-flex h-14 items-center gap-3 rounded-full bg-white px-8 text-[13px] font-semibold uppercase tracking-[.16em] text-black">Записаться <ArrowUpRight size={18} /></a></Magnetic>
          <a href={'tel:' + tel(b.phones[0])} className="inline-flex h-14 items-center gap-3 rounded-full px-7 text-[14px] text-white ring-1 ring-white/30 backdrop-blur"><Phone size={16} />{b.phones[0]}</a>
        </motion.div>
      </div>
      <p className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 text-[11px] uppercase tracking-[.3em] text-white/40 md:block">проведите курсором по прядям</p>
    </section>
  )
}

function Tones({ tone, setTone }) {
  return (
    <section className="relative overflow-hidden bg-[#0a0a0a] px-5 py-28 text-white md:px-10">
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <h2 className={`${HEAD} text-[clamp(44px,7vw,120px)] uppercase leading-[.85] tracking-[-.03em]`}>Примерьте<br /><span className={`${SERIF} normal-case italic tracking-normal transition-colors duration-700`} style={{ color: tone[2] }}>оттенок</span></h2>
          <p className="max-w-[340px] text-white/60">Нажмите на цвет — пряди наверху страницы перекрасятся. Колорист подберёт точный оттенок на консультации.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {TONES.map(t => (
            <button key={t[0]} onClick={() => { setTone(t); window.__lenis ? window.__lenis.scrollTo(0) : scrollTo({ top: 0, behavior: 'smooth' }) }} data-cursor="Примерить"
              className={`group relative aspect-[3/4] overflow-hidden rounded-[28px] text-left ring-1 transition-[box-shadow] ${tone[0] === t[0] ? 'ring-2 ring-white' : 'ring-white/10'}`}>
              <span className="absolute inset-0 transition-transform duration-700 group-hover:scale-110" style={{ background: `repeating-linear-gradient(100deg, ${t[1][0]} 0 3px, ${t[1][1]} 3px 7px, ${t[1][2]} 7px 9px, ${t[1][3]} 9px 13px)` }} />
              <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent" />
              <span className={`${SERIF} absolute bottom-5 left-5 text-[32px] italic`}>{t[0]}</span>
            </button>
          ))}
        </div>
        <div className="mt-8 text-center"><a href="#book" data-svc={`Окрашивание: ${tone[0].toLowerCase()}`} className="inline-flex h-14 items-center gap-3 rounded-full bg-white px-8 text-[13px] font-semibold uppercase tracking-[.16em] text-black">Хочу «{tone[0]}» <ArrowUpRight size={18} /></a></div>
      </div>
    </section>
  )
}

/* list with a blob that follows the cursor */
function Services({ tone }) {
  const x = useMotionValue(0), y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 150, damping: 20 }), sy = useSpring(y, { stiffness: 150, damping: 20 })
  const [hov, setHov] = useState(null)
  return (
    <section id="services" className="relative bg-[#f1ede6] px-5 py-28 text-[#0a0a0a] md:px-10"
      onPointerMove={e => { const r = e.currentTarget.getBoundingClientRect(); x.set(e.clientX - r.left); y.set(e.clientY - r.top) }}>
      <motion.div aria-hidden="true" style={{ x: sx, y: sy, background: `repeating-linear-gradient(100deg, ${tone[1][0]} 0 3px, ${tone[1][1]} 3px 7px, ${tone[1][2]} 7px 9px, ${tone[1][3]} 9px 13px)` }} animate={{ scale: hov !== null ? 1 : 0, rotate: hov !== null ? hov * 12 - 20 : 0 }}
        className="pointer-events-none absolute left-0 top-0 z-0 -ml-[130px] -mt-[170px] hidden h-[340px] w-[260px] rounded-[130px] md:block" />
      <div className="relative z-10 mx-auto max-w-[1320px]">
        <p className="mb-6 text-[12px] uppercase tracking-[.4em] text-black/50">Услуги</p>
        {SV.map(([t, d], k) => (
          <a key={t} href="#book" data-svc={t} onPointerEnter={() => setHov(k)} onPointerLeave={() => setHov(null)}
            className="group grid items-baseline gap-2 border-t border-black/15 py-6 md:grid-cols-[80px_1fr_380px] md:py-8">
            <span className="text-[13px] text-black/40">0{k + 1}</span>
            <span className={`${HEAD} text-[clamp(36px,6vw,92px)] uppercase leading-none tracking-[-.03em] transition-[letter-spacing,color] duration-500 group-hover:tracking-[.01em] md:mix-blend-difference md:group-hover:text-white`}>{t}</span>
            <span className="text-[15px] text-black/60">{d}</span>
          </a>
        ))}
      </div>
    </section>
  )
}

function Book({ tone }) {
  const bk = useBooking()
  const f = 'h-14 w-full rounded-full bg-white/[.06] px-6 text-[16px] text-white outline-none ring-1 ring-white/15 placeholder:text-white/35 focus:ring-white/60'
  return (
    <section id="book" className="relative overflow-hidden bg-[#0a0a0a] px-5 py-28 text-white md:px-10">
      <div className="mx-auto grid max-w-[1320px] gap-14 md:grid-cols-2">
        <div>
          <h2 className={`${HEAD} text-[clamp(52px,8vw,140px)] uppercase leading-[.82] tracking-[-.04em]`}>Ваш<br /><span className="transition-colors duration-700" style={{ color: tone[2] }}>час</span></h2>
          <p className={`${SERIF} mb-8 mt-6 max-w-[420px] text-[28px] italic leading-tight text-white/75`}>Оставьте номер — администратор подберёт мастера и время.</p>
          {b.phones.map(p => <a key={p} href={'tel:' + tel(p)} className="text-[30px] font-semibold">{p}</a>)}
        </div>
        <AnimatePresence mode="wait">
          {!bk.s.sent ? (
            <motion.form key="f" exit={{ opacity: 0, filter: 'blur(8px)' }} onSubmit={bk.submit} noValidate className="grid content-center gap-4">
              <input className={f} placeholder="Имя" value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} autoComplete="name" />
              <motion.input animate={bk.s.err ? { x: [0, -8, 8, -6, 6, 0] } : {}} className={f + (bk.s.err ? ' !ring-red-400' : '')} type="tel" inputMode="tel" placeholder="+375 (__) ___-__-__" value={bk.s.phone} onFocus={phoneFocus(bk)} onChange={e => bk.upd('phone', e.target.value)} autoComplete="tel" />
              <div className="flex flex-wrap gap-2 py-2">{SV.map(([t]) => <button type="button" key={t} onClick={() => bk.upd('svc', t)} className={`rounded-full px-4 py-2 text-[13px] transition-colors ${bk.s.svc === t ? 'bg-white text-black' : 'text-white/70 ring-1 ring-white/20'}`}>{t}</button>)}</div>
              {bk.s.svc && !SV.some(s => s[0] === bk.s.svc) && <p className="text-[14px] text-white/70">Выбрано: {bk.s.svc}</p>}
              <button disabled={bk.s.loading} className="h-16 rounded-full bg-white text-[13px] font-semibold uppercase tracking-[.18em] text-black transition-[scale,opacity] active:scale-[.97] disabled:opacity-60">{bk.s.loading ? 'Отправляем…' : 'Записаться'}</button>
              <p className="text-[13px] text-white/45">В готовом сайте заявка сразу придёт вам в Telegram.</p>
            </motion.form>
          ) : (
            <motion.div key="ok" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid place-items-center text-center">
              <div><CheckDraw className="mx-auto mb-5" /><h3 className={`${SERIF} text-[52px] italic`}>До встречи в RNK</h3><p className="mb-5 text-white/60">Так клиент увидит подтверждение.</p><button onClick={bk.reset} className="underline underline-offset-4">Ещё одна запись</button></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

function App() {
  useSmooth()
  const [tone, setTone] = useState(TONES[0])
  return (
    <MotionConfig reducedMotion="user">
      <div className="bg-[#0a0a0a] font-['Archivo',sans-serif] text-white" style={{ '--sel': '#fff', '--selc': '#000' }}>
        <Intro bg="#0a0a0a" fg="#fff" duration={1.4}><span className={`${HEAD} text-[18vw] leading-none`}><SplitText text="RNK" stagger={.1} /></span></Intro>
        <Grain opacity={.08} />
        <Progress color={tone[2]} />
        <Cursor color="#fff" />
        <Ribbon name={b.name} bg="#fff" fg="#0a0a0a" />
        <header className="sticky top-0 z-40 mix-blend-difference">
          <div className="mx-auto flex h-[70px] max-w-[1320px] items-center justify-between px-5 md:px-10">
            <a href="#top" className={`${HEAD} text-[24px] tracking-[-.02em]`}>RNK<span className={`${SERIF} ml-2 text-[18px] italic tracking-normal`}>hair club</span></a>
            <nav className="hidden gap-8 text-[12px] uppercase tracking-[.2em] md:flex">{[['#services', 'Услуги'], ['#book', 'Запись'], ['#contacts', 'Контакты']].map(([h, t]) => <a key={h} href={h}>{t}</a>)}</nav>
            <a href="#book" className="hidden text-[12px] uppercase tracking-[.2em] underline underline-offset-4 sm:inline">Записаться</a>
          </div>
        </header>
        <main id="top" className="-mt-[70px]">
          <Hero tone={tone} />
          <section className="bg-[#0a0a0a] px-5 py-32 md:px-10 md:py-44">
            <ScrollWords className={`${SERIF} mx-auto max-w-[1200px] text-[clamp(34px,5vw,80px)] leading-[1.05]`} dim={.12} text="Мы не делаем «как у всех». Сначала слушаем, потом смотрим на ваши волосы — и только потом берём ножницы." />
          </section>
          <Marquee base={-2.5} className="bg-white py-6 text-black">
            {['стрижки', 'окрашивание', 'блонд', 'уход', 'укладки', 'брови'].map(t => <span key={t} className={`${HEAD} mx-6 inline-flex items-center gap-12 text-[clamp(40px,6vw,96px)] uppercase tracking-[-.03em]`}>{t}<span className={`${SERIF} text-[.6em] normal-case italic`}>✶</span></span>)}
          </Marquee>
          <Services tone={tone} />
          <Tones tone={tone} setTone={setTone} />
          <section className="bg-[#0a0a0a] px-5 pb-10 md:px-10">
            <div className="mx-auto grid max-w-[1320px] gap-px overflow-hidden rounded-[32px] bg-white/10 md:grid-cols-3">
              {[[b.rev, 'оценок на Яндекс.Картах'], [6, 'направлений в одном клубе'], [60, 'секунд — онлайн-запись']].map(([n, t]) => <div key={t} className="bg-[#0a0a0a] p-10"><span className={`${HEAD} block text-[90px] leading-none`}><Counter to={n} /></span><span className="text-white/55">{t}</span></div>)}
            </div>
          </section>
          <Book tone={tone} />
          <section id="contacts" className="bg-[#0a0a0a] px-5 pb-28 md:px-10">
            <div className="mx-auto grid max-w-[1320px] gap-6 md:grid-cols-[.9fr_1.1fr]">
              <Reveal className="grid content-start gap-7">
                <h2 className={`${HEAD} text-[clamp(48px,7vw,110px)] uppercase leading-[.85] tracking-[-.03em]`}>Где<br />мы</h2>
                <p className="flex items-start gap-3 text-[22px]"><MapPin className="mt-1 shrink-0" />{b.addr}</p>
                {b.phones.map(p => <a key={p} href={'tel:' + tel(p)} className="text-[30px] font-semibold">{p}</a>)}
                <div className="flex flex-wrap gap-2">{messengerLinks(b).map(m => <a key={m.k} href={m.href} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-[14px] ring-1 ring-white/20 hover:bg-white hover:text-black">{m.Icon && <m.Icon width={16} height={16} />}{m.label}</a>)}</div>
              </Reveal>
              <Reveal delay={.1} className="h-[420px] overflow-hidden rounded-[32px]"><MapFrame oid={b.oid} dark /></Reveal>
            </div>
          </section>
        </main>
        <footer className="border-t border-white/10 px-5 py-10 text-[13px] text-white/45 md:px-10"><div className="mx-auto flex max-w-[1320px] flex-wrap justify-between gap-4"><span>© 2026 RNK Hair Club</span><span>Демо-концепт · дизайн и разработка — Артём</span></div></footer>
        <CallBar phone={b.phones[0]} barCls="bg-black/80 backdrop-blur-xl border-t border-white/10" callCls="rounded-full ring-1 ring-white/25" bookCls="rounded-full bg-white text-black" />
        <div className="h-[72px] sm:hidden" />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
