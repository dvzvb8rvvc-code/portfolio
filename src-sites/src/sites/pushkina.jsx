import React, { useRef, useState, useEffect, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, AnimatePresence, MotionConfig } from 'framer-motion'
import { ArrowRight, Phone, MapPin, Wrench, Gauge, CircleDot, Snowflake, Disc3, Hammer } from 'lucide-react'
import '../lib/base.css'
import { B } from '../data'
import { useSmooth, Ribbon, SplitText, Reveal, Magnetic, Cursor, Marquee, Counter, useBooking, phoneFocus, CheckDraw, MapFrame, messengerLinks, CallBar, Progress, Intro, tel, useLite, Grain } from '../lib/kit'

const Tires = lazy(() => import('./pushkina3d'))
const b = B.pushkina
const RED = '#ff3b1f', BG = '#0e0e0e', CON = '#1a1a1a'
const A = "font-['Anton',sans-serif]"
const SV = [['Переобувка', 'Снять, поставить, отбалансировать.', Snowflake], ['Балансировка', 'Чтобы руль не дрожал на скорости.', Gauge], ['Ремонт проколов', 'Жгут, грибок, латка — по ситуации.', Wrench], ['Ремонт дисков', 'Правка и восстановление геометрии.', Disc3], ['Подкачка и проверка', 'Давление, ниппели, датчики.', CircleDot], ['Монтаж и демонтаж', 'Аккуратно, без царапин на дисках.', Hammer]]
const W = [175, 185, 195, 205, 215, 225, 235, 245, 255], P = [40, 45, 50, 55, 60, 65, 70], R = [13, 14, 15, 16, 17, 18, 19, 20, 21]

/* tyre tracks follow the pointer across the page */
function Tracks() {
  const cv = useRef(null)
  useEffect(() => {
    if (!matchMedia('(hover:hover) and (pointer:fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const c = cv.current, ctx = c.getContext('2d')
    let last = null, dist = 0, id
    const rs = () => { c.width = innerWidth; c.height = innerHeight }
    rs(); addEventListener('resize', rs)
    const mv = e => {
      const p = { x: e.clientX, y: e.clientY }
      if (last) {
        const dx = p.x - last.x, dy = p.y - last.y, d = Math.hypot(dx, dy)
        if (d > 2) {
          const a = Math.atan2(dy, dx)
          for (let s = 0; s < d; s += 9) {
            dist += 9
            const x = last.x + Math.cos(a) * s, y = last.y + Math.sin(a) * s
            ctx.save(); ctx.translate(x, y); ctx.rotate(a)
            ctx.fillStyle = 'rgba(255,255,255,.07)'
            for (const off of [-16, 16]) { ctx.save(); ctx.translate(0, off); ctx.rotate((dist / 9) % 2 ? .5 : -.5); ctx.fillRect(-2, -6, 4, 12); ctx.restore() }
            ctx.restore()
          }
          last = p
        }
      } else last = p
    }
    const fade = () => { ctx.globalCompositeOperation = 'destination-out'; ctx.fillStyle = 'rgba(0,0,0,.035)'; ctx.fillRect(0, 0, c.width, c.height); ctx.globalCompositeOperation = 'source-over'; id = requestAnimationFrame(fade) }
    fade(); addEventListener('pointermove', mv)
    return () => { removeEventListener('pointermove', mv); removeEventListener('resize', rs); cancelAnimationFrame(id) }
  }, [])
  return <canvas ref={cv} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[1]" />
}

function Hero({ lite }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '40%'])
  return (
    <section ref={ref} className="relative h-[100svh] min-h-[660px] overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_70%_50%,#2a1410,transparent)]" />
      <div className="absolute inset-0">{!lite ? <Suspense fallback={null}><Tires progress={scrollYProgress} /></Suspense> : <motion.div animate={{ rotate: 360 }} transition={{ duration: 6, repeat: Infinity, ease: 'linear' }} className="absolute right-[8%] top-[25%] h-72 w-72 rounded-full border-[40px] border-[#181818] ring-4 ring-[#ff3b1f]" />}</div>
      <motion.div style={{ y }} className="pointer-events-none relative z-10 mx-auto flex h-full max-w-[1320px] flex-col justify-end px-6 pb-16 md:justify-center md:px-10 md:pb-0">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }} className="mb-5 flex items-center gap-3 text-[13px] font-bold uppercase tracking-[.25em] text-white/60"><span className="h-3 w-3 rounded-full" style={{ background: RED }} />Шиномонтаж · проспект Пушкина, 70А</motion.p>
        <h1 className={`${A} text-[clamp(50px,10vw,190px)] uppercase leading-[.86] text-white`}>
          <SplitText text="Переобуем" delay={1.2} className="block" />
          <span className="block" style={{ color: RED }}><SplitText text="без очереди" delay={1.45} /></span>
        </h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.9 }} className="mt-6 max-w-[440px] text-[17px] text-white/65">Запишитесь онлайн на удобное время — приезжаете и сразу заезжаете в бокс. {b.rev} оценок на Яндекс.Картах.</motion.p>
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.1 }} className="pointer-events-auto mt-9 flex flex-wrap gap-3">
          <Magnetic><a href="#book" data-cursor="Газ" className={`${A} inline-flex h-16 items-center gap-3 px-9 text-[22px] uppercase tracking-wide text-white`} style={{ background: RED, clipPath: 'polygon(8% 0,100% 0,92% 100%,0 100%)' }}>Записаться <ArrowRight /></a></Magnetic>
          <a href={'tel:' + tel(b.phones[0])} className="inline-flex h-16 items-center gap-3 px-7 text-[16px] font-bold text-white ring-1 ring-white/25"><Phone size={18} />{b.phones[0]}</a>
        </motion.div>
      </motion.div>
      <p className="absolute bottom-6 right-6 z-10 hidden text-[11px] uppercase tracking-[.3em] text-white/35 md:block">поводите мышкой — останутся следы протектора</p>
    </section>
  )
}

function Col({ items, value, set, label }) {
  return (
    <div className="grid gap-2">
      <span className="text-center text-[11px] font-bold uppercase tracking-[.2em] text-white/40">{label}</span>
      <div className="grid max-h-[260px] gap-1 overflow-y-auto rounded-2xl bg-white/5 p-2 [scrollbar-width:none]" data-lenis-prevent>
        {items.map(v => <button key={v} onClick={() => set(v)} className={`${A} relative h-12 rounded-xl text-[24px] ${v === value ? 'text-white' : 'text-white/40 hover:text-white/80'}`}>{v === value && <motion.span layoutId={'c' + label} className="absolute inset-0 rounded-xl" style={{ background: RED }} transition={{ type: 'spring', bounce: .25, duration: .45 }} />}<span className="relative">{label === 'Радиус' ? 'R' + v : v}</span></button>)}
      </div>
    </div>
  )
}

/* tyre size decoder: pick numbers, the cross-section redraws */
function Decoder() {
  const [w, setW] = useState(205), [p, setP] = useState(55), [r, setR] = useState(16)
  const side = w * p / 100, dia = r * 25.4 + side * 2
  const sc = 300 / 900
  const rimH = r * 25.4 * sc, sideH = side * sc, tw = w * sc * 1.2
  return (
    <section className="relative z-[2] px-6 py-28 md:px-10" style={{ background: CON }}>
      <div className="mx-auto max-w-[1320px]">
        <h2 className={`${A} mb-3 text-[clamp(48px,7vw,120px)] uppercase leading-[.9] text-white`}>Что значит <span style={{ color: RED }}>{w}/{p} R{r}</span>?</h2>
        <p className="mb-12 max-w-[560px] text-white/60">Выберите размер с боковины вашей шины — покажем, что означает каждая цифра, и запишем на шиномонтаж под этот размер.</p>
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.2fr]">
          <div className="grid grid-cols-3 gap-3">
            <Col items={W} value={w} set={setW} label="Ширина" /><Col items={P} value={p} set={setP} label="Профиль" /><Col items={R} value={r} set={setR} label="Радиус" />
          </div>
          <div className="rounded-[28px] bg-black/40 p-6 ring-1 ring-white/10 md:p-10">
            <svg viewBox="0 0 420 340" className="w-full">
              <motion.rect animate={{ x: 210 - tw / 2, y: 170 - rimH / 2 - sideH, width: tw, height: rimH + sideH * 2 }} rx="26" fill="#161616" stroke="#333" strokeWidth="2" transition={{ type: 'spring', stiffness: 120, damping: 16 }} />
              <motion.rect animate={{ x: 210 - tw / 2 + 8, y: 170 - rimH / 2, width: tw - 16, height: rimH }} fill="#cfcfcf" rx="4" transition={{ type: 'spring', stiffness: 120, damping: 16 }} />
              {/* width arrow */}
              <motion.g animate={{ y: 170 - rimH / 2 - sideH - 22 }} transition={{ type: 'spring', stiffness: 120, damping: 16 }}>
                <motion.line animate={{ x1: 210 - tw / 2, x2: 210 + tw / 2 }} y1="0" y2="0" stroke={RED} strokeWidth="3" />
                <text x="210" y="-8" textAnchor="middle" fill="#fff" fontSize="16" fontFamily="Anton">{w} мм</text>
              </motion.g>
              {/* sidewall arrow */}
              <motion.line animate={{ y1: 170 + rimH / 2, y2: 170 + rimH / 2 + sideH }} x1={210 + tw / 2 + 18} x2={210 + tw / 2 + 18} stroke={RED} strokeWidth="3" />
              <motion.text animate={{ y: 170 + rimH / 2 + sideH / 2 + 5 }} x={210 + tw / 2 + 26} fill="#fff" fontSize="14" fontFamily="Anton">{Math.round(side)} мм</motion.text>
              <text x="210" y="176" textAnchor="middle" fill="#111" fontSize="22" fontFamily="Anton">R{r}</text>
            </svg>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[[w + ' мм', 'ширина протектора'], [p + '%', `высота боковины от ширины ≈ ${Math.round(side)} мм`], [`R${r}`, `посадочный диаметр ${r}″ · вся шина ≈ ${Math.round(dia)} мм`]].map(([v, t]) => <div key={t} className="rounded-2xl bg-white/5 p-4"><b className={`${A} block text-[28px] text-white`}>{v}</b><span className="text-[13px] text-white/55">{t}</span></div>)}
            </div>
            <a href="#book" data-svc={`Шиномонтаж ${w}/${p} R${r}`} className={`${A} mt-6 inline-flex h-14 items-center gap-3 px-7 text-[20px] uppercase text-white`} style={{ background: RED }}>Записаться с размером {w}/{p} R{r} <ArrowRight size={20} /></a>
          </div>
        </div>
      </div>
    </section>
  )
}

function Book() {
  const bk = useBooking()
  const [car, setCar] = useState('Легковой')
  const f = 'h-14 w-full bg-white/5 px-5 text-[17px] text-white outline-none ring-1 ring-white/15 placeholder:text-white/35 focus:ring-2 focus:ring-[#ff3b1f]'
  return (
    <section id="book" className="relative z-[2] overflow-hidden px-6 py-28 md:px-10">
      <div className={`${A} pointer-events-none absolute -right-10 top-10 select-none text-[30vw] leading-none text-white/[.03]`}>70А</div>
      <div className="relative mx-auto grid max-w-[1200px] gap-12 md:grid-cols-2">
        <div>
          <h2 className={`${A} text-[clamp(56px,8vw,140px)] uppercase leading-[.86] text-white`}>Ваш бокс<br /><span style={{ color: RED }}>свободен</span></h2>
          <p className="mb-8 mt-6 max-w-[420px] text-white/60">Оставьте номер — мастер перезвонит и назначит время. Размер шин можно указать сразу.</p>
          {b.phones.map(p => <a key={p} href={'tel:' + tel(p)} className={`${A} text-[42px] text-white`}>{p}</a>)}
        </div>
        <AnimatePresence mode="wait">
          {!bk.s.sent ? (
            <motion.form key="f" exit={{ opacity: 0, x: 40 }} onSubmit={e => { if (!bk.s.svc) bk.upd('svc', car); bk.submit(e) }} noValidate className="grid content-start gap-4">
              <div className="grid grid-cols-3 gap-2">{['Легковой', 'Кроссовер', 'Микроавтобус'].map(c => <button type="button" key={c} onClick={() => setCar(c)} className={`h-12 text-[14px] font-bold transition-colors ${car === c ? 'bg-white text-black' : 'bg-white/5 text-white/70'}`}>{c}</button>)}</div>
              <input className={f} placeholder="Имя" value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} autoComplete="name" />
              <motion.input animate={bk.s.err ? { x: [0, -8, 8, -6, 6, 0] } : {}} className={f + (bk.s.err ? ' !ring-red-500' : '')} type="tel" inputMode="tel" placeholder="+375 (__) ___-__-__" value={bk.s.phone} onFocus={phoneFocus(bk)} onChange={e => bk.upd('phone', e.target.value)} autoComplete="tel" />
              <input className={f} placeholder="Услуга или размер шин" value={bk.s.svc} onChange={e => bk.upd('svc', e.target.value)} />
              <button disabled={bk.s.loading} className={`${A} h-16 text-[24px] uppercase text-white disabled:opacity-60`} style={{ background: RED }}>{bk.s.loading ? 'Поддаём газу…' : 'Записаться'}</button>
              <p className="text-[13px] text-white/45">В готовом сайте заявка сразу придёт вам в Telegram.</p>
            </motion.form>
          ) : (
            <motion.div key="ok" initial={{ opacity: 0, x: -60 }} animate={{ opacity: 1, x: 0 }} className="grid place-items-center py-10 text-center text-white">
              <div><CheckDraw className="mx-auto mb-5" size={80} /><h3 className={`${A} text-[52px] uppercase`}>Заявка в боксе</h3><p className="mb-5 text-white/60">Так клиент увидит подтверждение.</p><button onClick={bk.reset} className="underline underline-offset-4">Ещё одна запись</button></div>
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
      <div className="font-['Inter',sans-serif] text-white" style={{ background: BG, '--sel': RED, '--selc': '#fff' }}>
        <Intro bg={RED} fg="#fff" duration={1.4}><motion.div animate={{ rotate: 720 }} transition={{ duration: 1.2, ease: 'easeIn' }} className="h-28 w-28 rounded-full border-[18px] border-[#0e0e0e] ring-4 ring-white" /></Intro>
        <Grain opacity={.07} />
        <Tracks />
        <Progress color={RED} />
        <Cursor color={RED} blend="normal" textColor="#fff" />
        <Ribbon name={b.name} bg={RED} fg="#fff" />
        <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0e0e0e]/75 backdrop-blur-xl">
          <div className="mx-auto flex h-[70px] max-w-[1320px] items-center justify-between px-6 md:px-10">
            <a href="#top" className={`${A} flex items-center gap-3 text-[24px] uppercase`}><span className="grid h-9 w-9 place-items-center rounded-full border-[6px] border-white/90"><span className="h-2 w-2 rounded-full" style={{ background: RED }} /></span>Шинка 70А</a>
            <nav className="hidden gap-8 text-[13px] font-bold uppercase tracking-[.16em] text-white/60 md:flex">{[['#services', 'Услуги'], ['#book', 'Запись'], ['#contacts', 'Адрес']].map(([h, t]) => <a key={h} href={h} className="hover:text-white">{t}</a>)}</nav>
            <a href={'tel:' + tel(b.phones[0])} className="hidden items-center gap-2 text-[15px] font-bold sm:inline-flex"><Phone size={15} color={RED} />{b.phones[0]}</a>
          </div>
        </header>
        <main id="top" className="relative">
          <Hero lite={lite} />
          <div className="relative z-[2] overflow-hidden py-6"><Marquee base={-3} className="-rotate-2 scale-105 bg-[#ff3b1f] py-5">
            {['переобувка', 'балансировка', 'проколы', 'диски', 'запись онлайн'].map(t => <span key={t} className={`${A} mx-6 inline-flex items-center gap-12 text-[clamp(36px,5vw,72px)] uppercase text-white`}>{t}<span className="h-5 w-5 rounded-full border-4 border-white" /></span>)}
          </Marquee></div>
          <section id="services" className="relative z-[2] px-6 py-28 md:px-10">
            <div className="mx-auto max-w-[1320px]">
              <h2 className={`${A} mb-14 text-[clamp(52px,8vw,130px)] uppercase leading-[.88]`}>Что <span style={{ color: RED }}>делаем</span></h2>
              <div className="grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
                {SV.map(([t, d, I], k) => (
                  <motion.a key={t} href="#book" data-svc={t} data-cursor="Запись" className="group relative overflow-hidden bg-[#0e0e0e] p-8 md:p-10" whileHover="h">
                    <motion.span variants={{ h: { scaleY: 1 } }} initial={{ scaleY: 0 }} className="absolute inset-0 origin-bottom" style={{ background: RED }} transition={{ duration: .45, ease: [0.76, 0, 0.24, 1] }} />
                    <div className="relative">
                      <div className="mb-14 flex items-center justify-between"><I size={34} className="text-[#ff3b1f] transition-colors group-hover:text-white" /><span className={`${A} text-[20px] text-white/30 group-hover:text-white/70`}>0{k + 1}</span></div>
                      <h3 className={`${A} mb-2 text-[38px] uppercase leading-none`}>{t}</h3>
                      <p className="text-white/60 group-hover:text-white/90">{d}</p>
                    </div>
                  </motion.a>
                ))}
              </div>
            </div>
          </section>
          <Decoder />
          <section className="relative z-[2] px-6 py-24 md:px-10">
            <div className="mx-auto grid max-w-[1320px] gap-px bg-white/10 md:grid-cols-3">
              {[[b.rev, 'оценок на Яндекс.Картах'], [24, 'часа в сутки сайт принимает заявки'], [60, 'секунд на онлайн-запись']].map(([n, t]) => <div key={t} className="bg-[#0e0e0e] p-10"><span className={`${A} block text-[100px] leading-none`} style={{ color: RED }}><Counter to={n} /></span><span className="text-white/55">{t}</span></div>)}
            </div>
          </section>
          <Book />
          <section id="contacts" className="relative z-[2] px-6 pb-28 md:px-10">
            <div className="mx-auto grid max-w-[1320px] gap-6 md:grid-cols-[.9fr_1.1fr]">
              <Reveal className="grid content-start gap-7">
                <h2 className={`${A} text-[clamp(52px,7vw,110px)] uppercase leading-[.88]`}>Пушкина, <span style={{ color: RED }}>70А</span></h2>
                <p className="flex items-start gap-3 text-[20px]"><MapPin className="mt-1 shrink-0" color={RED} />{b.addr}</p>
                {b.phones.map(p => <a key={p} href={'tel:' + tel(p)} className={`${A} text-[38px]`}>{p}</a>)}
                <div className="flex flex-wrap gap-2">{messengerLinks(b).map(m => <a key={m.k} href={m.href} target="_blank" rel="noopener" className="inline-flex items-center gap-2 px-5 py-3 text-[14px] font-bold ring-1 ring-white/20 hover:bg-white hover:text-black">{m.Icon && <m.Icon width={16} height={16} />}{m.label}</a>)}</div>
              </Reveal>
              <Reveal delay={.1} className="h-[420px] overflow-hidden ring-1 ring-white/10"><MapFrame oid={b.oid} dark /></Reveal>
            </div>
          </section>
        </main>
        <footer className="relative z-[2] border-t border-white/10 px-6 py-10 text-[13px] text-white/45 md:px-10"><div className="mx-auto flex max-w-[1320px] flex-wrap justify-between gap-4"><span>© 2026 Шиномонтаж на Пушкина, 70А</span><span>Демо-концепт · дизайн и разработка — Артём</span></div></footer>
        <CallBar phone={b.phones[0]} barCls="bg-[#0e0e0e]/90 backdrop-blur-xl border-t border-white/10" callCls="ring-1 ring-white/25" bookCls="bg-[#ff3b1f] text-white" />
        <div className="h-[72px] sm:hidden" />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
