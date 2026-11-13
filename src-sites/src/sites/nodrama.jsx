import React, { useRef, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, AnimatePresence, MotionConfig, useAnimation } from 'framer-motion'
import { ArrowRight, Phone, MapPin, Star, Sparkles, Smile, Zap, Heart } from 'lucide-react'
import '../lib/base.css'
import { B } from '../data'
import { useSmooth, Ribbon, Reveal, Magnetic, Cursor, Marquee, Counter, useBooking, phoneFocus, MapFrame, messengerLinks, Progress, tel } from '../lib/kit'

const b = B.nodrama
const P = '#ff3d81', Yl = '#ffe14d', K = '#111'
const SV = [['Маникюр', 'Быстро, ровно, стойко. Без драмы с кутикулой.', '#ff3d81'], ['Педикюр', 'Мягко, чисто, красиво — ногам понравится.', '#c7f464'], ['Стрижки', 'Форма, которую не стыдно показать маме.', '#7aa7ff'], ['Окрашивание', 'Цвет мечты, а не «ну так вышло».', '#ffb627'], ['Укладки', 'Образ к событию за час. Да, даже сегодня.', '#b79cff'], ['Уход', 'Блеск, сила и мягкость — в комплекте.', '#5ce1c6']]
const STICKERS = [
  { t: '★ ' + b.rev + ' оценок', bg: '#c7f464', x: '62%', y: '8%', r: 8 },
  { t: 'без драмы', bg: Yl, x: '6%', y: '62%', r: -10 },
  { t: 'Немига, 5', bg: '#7aa7ff', x: '74%', y: '62%', r: 6 },
  { t: '♥ красиво', bg: '#ffb3cf', x: '40%', y: '78%', r: -4 },
  { t: 'запись 24/7', bg: '#b79cff', x: '84%', y: '30%', r: -12 },
]

function Bouncy({ text, className }) {
  return (
    <span className={className + ' whitespace-nowrap'} aria-label={text}>
      {[...text].map((ch, i) => (
        <motion.span key={i} aria-hidden="true" className="inline-block" initial={{ y: 120, rotate: 20, opacity: 0 }} animate={{ y: 0, rotate: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 14, delay: .05 * i }} whileHover={{ y: -24, rotate: i % 2 ? 8 : -8, transition: { type: 'spring', stiffness: 500, damping: 8 } }}>{ch === ' ' ? ' ' : ch}</motion.span>
      ))}
    </span>
  )
}

function useConfetti() {
  const cv = useRef(null)
  const fire = (x, y) => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const c = cv.current, ctx = c.getContext('2d'), d = devicePixelRatio
    c.width = innerWidth * d; c.height = innerHeight * d
    const cols = [P, Yl, '#c7f464', '#7aa7ff', '#b79cff', '#ffb627']
    const ps = Array.from({ length: 160 }, () => ({ x: x * d, y: y * d, vx: (Math.random() - .5) * 26 * d, vy: (-Math.random() * 22 - 6) * d, s: (6 + Math.random() * 8) * d, r: Math.random() * 6, vr: (Math.random() - .5) * .4, c: cols[Math.random() * cols.length | 0], l: 140 }))
    const tick = () => {
      ctx.clearRect(0, 0, c.width, c.height); let alive = 0
      for (const p of ps) { if (p.l-- <= 0) continue; alive++; p.vy += .6 * d; p.vx *= .985; p.x += p.vx; p.y += p.vy; p.r += p.vr
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.strokeStyle = K; ctx.lineWidth = 1.5 * d; ctx.fillRect(-p.s / 2, -p.s / 3, p.s, p.s / 1.5); ctx.strokeRect(-p.s / 2, -p.s / 3, p.s, p.s / 1.5); ctx.restore() }
      if (alive) requestAnimationFrame(tick); else ctx.clearRect(0, 0, c.width, c.height)
    }
    tick()
  }
  const Layer = () => <canvas ref={cv} className="pointer-events-none fixed inset-0 z-[95] h-full w-full" aria-hidden="true" />
  return [Layer, fire]
}

function Hero() {
  const box = useRef(null)
  const ctl = useAnimation()
  const [drama, setDrama] = useState(false)
  const doDrama = async () => {
    setDrama(true)
    await ctl.start({ x: [0, -14, 14, -10, 10, -6, 6, 0], rotate: [0, -1, 1, -1, 1, 0], transition: { duration: .6 } })
    setTimeout(() => setDrama(false), 2200)
  }
  return (
    <motion.section ref={box} animate={ctl} className="relative overflow-hidden border-b-[3px] border-[#111] px-5 pb-16 pt-14 md:px-10 md:pt-20">
      {STICKERS.map((s, i) => (
        <motion.div key={s.t} drag dragConstraints={box} dragElastic={0.25} dragTransition={{ bounceStiffness: 400, bounceDamping: 12 }} whileDrag={{ scale: 1.15, rotate: 0, zIndex: 30 }} whileHover={{ scale: 1.06 }}
          initial={{ scale: 0, rotate: s.r * 3 }} animate={{ scale: 1, rotate: s.r }} transition={{ type: 'spring', stiffness: 260, damping: 12, delay: .8 + i * .1 }}
          className="absolute z-20 hidden cursor-grab select-none whitespace-nowrap rounded-2xl border-[3px] border-[#111] px-5 py-3 font-['Unbounded',sans-serif] text-[15px] font-bold shadow-[4px_4px_0_#111] active:cursor-grabbing md:block"
          style={{ left: s.x, top: s.y, background: s.bg }} data-cursor="Тяни">{s.t}</motion.div>
      ))}
      <div className="relative z-10 mx-auto max-w-[1240px]">
        <h1 className="font-['Unbounded',sans-serif] text-[clamp(44px,12.5vw,200px)] font-black uppercase leading-[.84] tracking-[-.06em]">
          <Bouncy text="Красота" className="block" />
          <span className="block"><Bouncy text="без" className="text-[#ff3d81] [text-shadow:.04em_.04em_0_#111]" /></span>
          <Bouncy text="драмы" className="block" />
        </h1>
        <div className="mt-10 grid items-end gap-8 md:grid-cols-[1fr_auto]">
          <Reveal delay={.8}><p className="max-w-[520px] text-[19px] font-medium">Маникюр, стрижки, окрашивание и уход. Делаем красиво, вовремя и без лишних слов — в самом центре Минска. <span className="hidden md:inline">P.S. Наклейки можно таскать.</span></p></Reveal>
          <Reveal delay={.9} className="flex flex-wrap gap-4">
            <a href="#book" className="inline-flex h-16 items-center gap-2 rounded-2xl border-[3px] border-[#111] bg-[#ff3d81] px-8 font-['Unbounded',sans-serif] text-[16px] font-bold text-white shadow-[6px_6px_0_#111] transition-[translate,box-shadow] duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_#111] active:translate-x-1.5 active:translate-y-1.5 active:shadow-none">Записаться <ArrowRight size={18} /></a>
            <button onClick={doDrama} className="inline-flex h-16 items-center gap-2 rounded-2xl border-[3px] border-[#111] bg-white px-6 font-['Unbounded',sans-serif] text-[14px] font-bold shadow-[6px_6px_0_#111] transition-[translate,box-shadow] duration-100 active:translate-x-1.5 active:translate-y-1.5 active:shadow-none"><Zap size={18} />Устроить драму</button>
          </Reveal>
        </div>
      </div>
      <AnimatePresence>{drama && (
        <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: -6 }} exit={{ scale: 0, rotate: 20 }} transition={{ type: 'spring', stiffness: 300, damping: 14 }}
          className="absolute left-1/2 top-1/2 z-40 -translate-x-1/2 -translate-y-1/2 rounded-3xl border-[3px] border-[#111] bg-[#ffe14d] px-8 py-6 text-center font-['Unbounded',sans-serif] shadow-[8px_8px_0_#111]">
          <p className="text-[clamp(22px,3vw,36px)] font-black uppercase">Не-а 🙅‍♀️</p><p className="text-[14px] font-semibold">У нас драмы не бывает. Только красота.</p>
        </motion.div>)}</AnimatePresence>
    </motion.section>
  )
}

function Flip({ t, d, c, i }) {
  const [f, setF] = useState(false)
  return (
    <div className="h-[280px] [perspective:1000px]" onPointerEnter={e => e.pointerType === 'mouse' && setF(true)} onPointerLeave={() => setF(false)} onClick={() => setF(v => !v)}>
      <motion.div animate={{ rotateY: f ? 180 : 0 }} transition={{ type: 'spring', stiffness: 200, damping: 20 }} className="relative h-full w-full [transform-style:preserve-3d]" style={{ rotate: i % 2 ? 1.2 : -1 }}>
        <div className="absolute inset-0 flex flex-col justify-between rounded-3xl border-[3px] border-[#111] bg-white p-7 shadow-[6px_6px_0_#111] [backface-visibility:hidden]">
          <span className="w-max rounded-full border-[3px] border-[#111] px-3 py-1 font-['Unbounded',sans-serif] text-[12px] font-bold" style={{ background: c }}>0{i + 1}</span>
          <h3 className="font-['Unbounded',sans-serif] text-[clamp(24px,2.3vw,34px)] font-black uppercase leading-none tracking-[-.05em]">{t}</h3>
          <span className="text-[13px] font-bold text-[#55524c]">наведи / нажми ↻</span>
        </div>
        <div className="absolute inset-0 flex flex-col justify-between rounded-3xl border-[3px] border-[#111] p-7 shadow-[6px_6px_0_#111] [backface-visibility:hidden] [transform:rotateY(180deg)]" style={{ background: c }}>
          <p className="font-['Unbounded',sans-serif] text-[20px] font-bold leading-snug">{d}</p>
          <a href="#book" data-svc={t} onClick={e => e.stopPropagation()} className="inline-flex h-12 w-max items-center gap-2 rounded-xl border-[3px] border-[#111] bg-white px-5 font-['Unbounded',sans-serif] text-[13px] font-bold shadow-[3px_3px_0_#111]">Хочу <ArrowRight size={16} /></a>
        </div>
      </motion.div>
    </div>
  )
}

function Book({ fire }) {
  const bk = useBooking()
  const btn = useRef(null)
  useEffect(() => { if (bk.s.sent && btn.current) { const r = btn.current.getBoundingClientRect(); fire(r.left + r.width / 2, r.top + r.height / 2) } }, [bk.s.sent])
  const f = 'h-14 w-full rounded-xl border-[3px] border-[#111] bg-[#fff6e9] px-4 text-[16px] font-semibold outline-none transition-[box-shadow,background-color] focus:bg-white focus:shadow-[4px_4px_0_#ff3d81]'
  return (
    <section id="book" className="px-5 py-24 md:px-10">
      <div ref={btn} className="mx-auto grid max-w-[1240px] overflow-hidden rounded-[28px] border-[3px] border-[#111] bg-white shadow-[10px_10px_0_#111] md:grid-cols-2">
        <div className="bg-[#111] p-10 text-[#fff6e9] md:p-14">
          <h2 className="font-['Unbounded',sans-serif] text-[clamp(40px,5vw,72px)] font-black uppercase leading-[.9] tracking-[-.05em]">Без <span className="text-[#ff3d81]">драмы</span> — запись</h2>
          <p className="mb-8 mt-6 max-w-[380px] opacity-80">Имя, телефон, услуга. Остальное — наша забота.</p>
          {b.phones.map(p => <a key={p} href={'tel:' + tel(p)} className="font-['Unbounded',sans-serif] text-[26px] font-bold text-[#ffe14d]">{p}</a>)}
        </div>
        <div className="p-8 md:p-12">
          <AnimatePresence mode="wait">{!bk.s.sent ? (
            <motion.form key="f" exit={{ opacity: 0, scale: .9, rotate: -3 }} onSubmit={bk.submit} noValidate className="grid gap-4">
              <input className={f} value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} placeholder="Имя" autoComplete="name" />
              <motion.input animate={bk.s.err ? { x: [0, -10, 10, -8, 8, 0], rotate: [0, -2, 2, 0] } : {}} className={f + (bk.s.err ? ' !bg-[#ffe0e0]' : '')} value={bk.s.phone} onFocus={phoneFocus(bk)} onChange={e => bk.upd('phone', e.target.value)} type="tel" inputMode="tel" placeholder="Телефон *" autoComplete="tel" />
              <div className="flex flex-wrap gap-2">{SV.map(([t, , c]) => (
                <button type="button" key={t} onClick={() => bk.upd('svc', t)} className={`rounded-xl border-[3px] border-[#111] px-3 py-2 text-[13px] font-bold transition-[translate,box-shadow] duration-100 ${bk.s.svc === t ? 'translate-x-0.5 translate-y-0.5' : 'shadow-[3px_3px_0_#111]'}`} style={{ background: bk.s.svc === t ? c : '#fff' }}>{t}</button>))}</div>
              <button disabled={bk.s.loading} className="h-16 rounded-2xl border-[3px] border-[#111] bg-[#ff3d81] font-['Unbounded',sans-serif] text-[16px] font-bold text-white shadow-[5px_5px_0_#111] transition-[translate,box-shadow,opacity] duration-100 active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-60">{bk.s.loading ? 'Секунду…' : 'Записаться'}</button>
              <p className="text-[13px] font-medium text-[#55524c]">В готовом сайте заявка придёт вам в Telegram.</p>
            </motion.form>) : (
            <motion.div key="ok" initial={{ scale: 0, rotate: 10 }} animate={{ scale: 1, rotate: -2 }} transition={{ type: 'spring', stiffness: 260, damping: 14 }} className="grid h-full place-items-center py-10 text-center">
              <div><p className="mb-3 text-[64px]">🎉</p><h3 className="font-['Unbounded',sans-serif] text-[32px] font-black uppercase tracking-[-.04em]">Готово!</h3><p className="font-medium text-[#55524c]">Перезвоним без драмы и подберём время.</p></div>
            </motion.div>)}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

function App() {
  useSmooth()
  const [Confetti, fire] = useConfetti()
  return (
    <MotionConfig reducedMotion="user">
      <div className="bg-[#fff6e9] font-['Inter',sans-serif] text-[#111] [background-image:radial-gradient(rgba(17,17,17,.09)_1px,transparent_1px)] [background-size:22px_22px]" style={{ '--sel': P, '--selc': '#fff' }}>
        <Confetti />
        <Progress color={P} />
        <Cursor color={P} blend="normal" textColor="#fff" />
        <Ribbon name={b.name} bg={K} fg={Yl} />
        <header className="sticky top-0 z-40 border-b-[3px] border-[#111] bg-[#fff6e9]">
          <div className="mx-auto flex h-[70px] max-w-[1240px] items-center justify-between px-5 md:px-10">
            <a href="#top" className="flex items-center gap-3 font-['Unbounded',sans-serif] text-[21px] font-black tracking-[-.04em]"><span className="inline-block -rotate-6 rounded-[10px] border-[3px] border-[#111] bg-[#ff3d81] px-2 py-0.5 text-white shadow-[3px_3px_0_#111]">ND</span>No Drama</a>
            <nav className="hidden gap-2 md:flex">{[['#services', 'Услуги'], ['#book', 'Запись'], ['#contacts', 'Контакты']].map(([h, t]) => <a key={h} href={h} className="rounded-xl border-[3px] border-transparent px-4 py-2 text-[14px] font-bold hover:border-[#111] hover:bg-[#ffe14d]">{t}</a>)}</nav>
            <a href="#book" className="hidden h-11 items-center rounded-xl border-[3px] border-[#111] bg-[#ff3d81] px-5 font-['Unbounded',sans-serif] text-[13px] font-bold text-white shadow-[3px_3px_0_#111] sm:inline-flex">Записаться</a>
          </div>
        </header>
        <main id="top">
          <Hero />
          <div className="relative h-[170px] overflow-hidden">
            <div className="absolute inset-x-[-5%] top-8 -rotate-3"><Marquee base={-3} skew={false} className="border-y-[3px] border-[#111] bg-[#111] py-4">{['No drama', 'Немига, 5', 'Красиво', 'Вовремя', 'Без лишних слов'].map(t => <span key={t} className="mx-5 inline-flex items-center gap-10 font-['Unbounded',sans-serif] text-[30px] font-black uppercase tracking-[-.04em] text-[#fff6e9]">{t}<Star className="text-[#ff3d81]" fill="#ff3d81" size={26} /></span>)}</Marquee></div>
            <div className="absolute inset-x-[-5%] top-16 rotate-2"><Marquee base={2.5} skew={false} className="border-y-[3px] border-[#111] bg-[#ffe14d] py-3">{['Маникюр', 'Стрижки', 'Окрашивание', 'Укладки', 'Уход'].map(t => <span key={t} className="mx-5 inline-flex items-center gap-10 font-['Unbounded',sans-serif] text-[24px] font-black uppercase tracking-[-.04em]">{t}<Smile size={22} /></span>)}</Marquee></div>
          </div>
          <section id="services" className="mx-auto max-w-[1240px] px-5 py-20 md:px-10">
            <div className="mb-12 flex flex-wrap items-end justify-between gap-6"><h2 className="font-['Unbounded',sans-serif] text-[clamp(44px,6vw,92px)] font-black uppercase leading-[.9] tracking-[-.06em]">Что <span className="text-[#ff3d81]">делаем</span></h2><p className="max-w-[340px] font-semibold text-[#55524c]">Карточки переворачиваются. Нажми «Хочу» — услуга сама попадёт в заявку.</p></div>
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">{SV.map(([t, d, c], i) => <Flip key={t} t={t} d={d} c={c} i={i} />)}</div>
          </section>
          <section className="mx-auto grid max-w-[1240px] gap-6 px-5 md:grid-cols-[1.2fr_1fr_1fr] md:px-10">
            {[[b.rev, 'оценок на Яндекс.Картах — это не драма, это статистика', P, '#fff'], [60, 'секунд на онлайн-запись', Yl, K], [0, 'драмы. Вообще. Никогда.', '#c7f464', K]].map(([n, t, bg, fg], i) => (
              <Reveal key={t} delay={i * .08} className="rounded-3xl border-[3px] border-[#111] p-8 shadow-[6px_6px_0_#111]" style={{ background: bg, color: fg }}><Counter to={n} className="block font-['Unbounded',sans-serif] text-[80px] font-black leading-none tracking-[-.06em]" /><span className="font-semibold">{t}</span></Reveal>))}
          </section>
          <Book fire={fire} />
          <section id="contacts" className="mx-auto grid max-w-[1240px] gap-6 px-5 pb-24 md:grid-cols-[1fr_1.3fr] md:px-10">
            <Reveal className="grid content-start gap-6 rounded-3xl border-[3px] border-[#111] bg-white p-8 shadow-[6px_6px_0_#111]">
              <h2 className="font-['Unbounded',sans-serif] text-[48px] font-black uppercase tracking-[-.05em]">Где <span className="text-[#ff3d81]">мы</span></h2>
              <div><span className="mb-2 inline-block rounded-lg border-2 border-[#111] bg-[#ffe14d] px-2 py-0.5 text-[11px] font-black uppercase">Адрес</span><p className="flex items-center gap-2 font-['Unbounded',sans-serif] text-[22px] font-bold"><MapPin size={18} />{b.addr}</p></div>
              <div><span className="mb-2 inline-block rounded-lg border-2 border-[#111] bg-[#ffe14d] px-2 py-0.5 text-[11px] font-black uppercase">Телефон</span>{b.phones.map(p => <a key={p} href={'tel:' + tel(p)} className="block font-['Unbounded',sans-serif] text-[22px] font-bold">{p}</a>)}</div>
              <div className="flex flex-wrap gap-2">{messengerLinks(b).map(m => <a key={m.k} href={m.href} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-xl border-[3px] border-[#111] bg-white px-4 py-2 text-[13px] font-black shadow-[3px_3px_0_#111] transition-colors hover:bg-[#ff3d81] hover:text-white">{m.Icon && <m.Icon width={16} height={16} />}{m.label}</a>)}</div>
            </Reveal>
            <Reveal delay={.08} className="min-h-[400px] overflow-hidden rounded-3xl border-[3px] border-[#111] shadow-[6px_6px_0_#111]"><MapFrame oid={b.oid} /></Reveal>
          </section>
        </main>
        <footer className="border-t-[3px] border-[#111] px-5 py-8 text-[14px] font-semibold md:px-10"><div className="mx-auto flex max-w-[1240px] flex-wrap justify-between gap-4"><span>© 2026 No Drama · Немига, 5</span><span>Демо-концепт · сайт — Артём</span></div></footer>
        <div className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-2 gap-2 border-t-[3px] border-[#111] bg-[#fff6e9] px-3 pb-[calc(10px+env(safe-area-inset-bottom))] pt-2.5 sm:hidden">
          <a href={'tel:' + tel(b.phones[0])} className="grid h-12 place-items-center rounded-xl border-[3px] border-[#111] bg-white font-['Unbounded',sans-serif] text-[13px] font-bold">Позвонить</a>
          <a href="#book" className="grid h-12 place-items-center rounded-xl border-[3px] border-[#111] bg-[#ff3d81] font-['Unbounded',sans-serif] text-[13px] font-bold text-white">Записаться</a>
        </div>
        <div className="h-[72px] sm:hidden" />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
