import React, { useRef, useState, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, AnimatePresence, MotionConfig } from 'framer-motion'
import { ArrowUpRight, Phone, MapPin, Scissors, Snowflake } from 'lucide-react'
import '../lib/base.css'
import { B } from '../data'
import { useSmooth, Ribbon, SplitText, Reveal, Magnetic, Cursor, Marquee, Counter, useBooking, phoneFocus, CheckDraw, MapFrame, messengerLinks, CallBar, Progress, Intro, tel, useLite, Grain, LineReveal } from '../lib/kit'

const Ice = lazy(() => import('./coolman3d'))
const b = B.coolman
const BG = '#06121c', ICE = '#7fdcff', FROST = '#e8f8ff'
const BS = "font-['Big_Shoulders_Display',sans-serif]"
const iceGrad = 'linear-gradient(180deg,#ffffff 0%,#bfeeff 45%,#5fc8f0 100%)'
const SV = [['Мужская стрижка', 'Классика, кроп, текстура — под форму головы.'], ['Фейд', 'Плавный переход от кожи до длины, как вы любите.'], ['Борода', 'Моделирование, контур, уход.'], ['Стрижка + борода', 'Полный апгрейд за один визит.'], ['Детская стрижка', 'Для юных джентльменов.'], ['Камуфляж седины', 'Естественный тон без эффекта «покрасился».']]

function Hero({ lite }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '45%'])
  const blur = useTransform(scrollYProgress, [0, .6], ['blur(0px)', 'blur(10px)'])
  return (
    <section ref={ref} className="relative h-[100svh] min-h-[660px] overflow-hidden" style={{ background: `radial-gradient(70% 60% at 70% 40%, #0f3550, ${BG})` }}>
      <div className="absolute inset-0">{!lite ? <Suspense fallback={null}><Ice progress={scrollYProgress} /></Suspense> : <div className="absolute right-[10%] top-[25%] h-60 w-60 rotate-12 rounded-[40px] bg-[#cfefff]/30 ring-1 ring-white/40 backdrop-blur" />}</div>
      <motion.div style={{ y, filter: blur }} className="pointer-events-none relative z-10 mx-auto flex h-full max-w-[1320px] flex-col justify-end px-6 pb-16 md:justify-center md:px-10 md:pb-0">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }} className="mb-4 flex items-center gap-3 text-[13px] font-semibold uppercase tracking-[.3em] text-[#7fdcff]"><Snowflake size={16} />Барбершоп · Кульман, 27</motion.p>
        <h1 className={`${BS} text-[clamp(90px,17vw,300px)] font-black uppercase leading-[.8] tracking-[-.01em]`}>
          <LineReveal delay={1.2}><span className="bg-clip-text text-transparent" style={{ backgroundImage: iceGrad }}>Stay</span></LineReveal>
          <LineReveal delay={1.35}><span className="text-white">cool.</span></LineReveal>
        </h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.9 }} className="mt-6 max-w-[420px] text-[17px] text-white/65">Чёткий фейд, аккуратная борода и спокойная атмосфера. Соберите стрижку в конструкторе — мастер увидит её в заявке.</motion.p>
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.1 }} className="pointer-events-auto mt-9 flex flex-wrap gap-3">
          <Magnetic><a href="#fade" data-cursor="Собрать" className={`${BS} inline-flex h-16 items-center gap-3 rounded-full px-9 text-[22px] font-bold uppercase tracking-wide text-[#06121c]`} style={{ background: iceGrad }}>Собрать стрижку <ArrowUpRight /></a></Magnetic>
          <a href={'tel:' + tel(b.phones[0])} className="inline-flex h-16 items-center gap-3 rounded-full px-7 text-[16px] font-semibold text-white ring-1 ring-white/25 backdrop-blur"><Phone size={18} />{b.phones[0]}</a>
        </motion.div>
      </motion.div>
    </section>
  )
}

function Slider({ label, value, set, l, r }) {
return (
  <label className="grid gap-3">
    <span className="flex justify-between text-[12px] font-semibold uppercase tracking-[.2em] text-white/50"><span>{label}</span></span>
    <input type="range" min="0" max="1" step=".01" value={value} onChange={e => set(+e.target.value)} className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 [&::-webkit-slider-thumb]:h-7 [&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#7fdcff] [&::-webkit-slider-thumb]:shadow-[0_0_20px_#7fdcff]" />
    <span className="flex justify-between text-[13px] text-white/40"><span>{l}</span><span>{r}</span></span>
  </label>
)
}

/* fade builder: sliders reshape the haircut on a head silhouette */
function Fade() {
  const [top, setTop] = useState(.45), [fade, setFade] = useState(.35), [beard, setBeard] = useState(1)
  const ty = 64 - top * 44
  const capPath = `M68 168 C 62 ${ty + 50}, 96 ${ty}, 150 ${ty} C 204 ${ty}, 238 ${ty + 50}, 232 168 C 214 ${132 - top * 6}, 86 ${132 - top * 6}, 68 168 Z`
  const fadeName = fade < .25 ? 'Скин-фейд' : fade < .55 ? 'Мид-фейд' : fade < .8 ? 'Лоу-фейд' : 'Без фейда'
  const topName = top < .25 ? 'бокс' : top < .55 ? 'кроп с текстурой' : top < .8 ? 'помпадур' : 'длинный верх'
  const beardName = ['без бороды', 'щетина', 'борода'][beard]
  const name = `${fadeName} · ${topName} · ${beardName}`
  return (
    <section id="fade" className="relative overflow-hidden px-6 py-28 md:px-10">
      <div className="mx-auto max-w-[1320px]">
        <h2 className={`${BS} mb-3 text-[clamp(40px,9vw,150px)] font-black uppercase leading-[.85]`}>Фейд-<span className="bg-clip-text text-transparent" style={{ backgroundImage: iceGrad }}>конструктор</span></h2>
        <p className="mb-14 max-w-[520px] text-white/60">Двигайте ползунки — силуэт меняется. Ориентир для мастера, а не приговор: на месте подстроим под форму головы.</p>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="relative mx-auto aspect-square w-full max-w-[520px]">
            <div className="absolute inset-[8%] rounded-full" style={{ background: 'radial-gradient(circle,#0f3550,transparent 70%)' }} />
            <svg viewBox="0 0 300 330" className="relative h-full w-full">
              <defs>
                <linearGradient id="side" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#1a1410" />
                  <stop offset={Math.max(.05, fade * .9)} stopColor="#1a1410" />
                  <stop offset={Math.min(1, fade * .9 + .35)} stopColor="#1a1410" stopOpacity="0" />
                </linearGradient>
              </defs>
              <rect x="122" y="250" width="56" height="60" rx="12" fill="#c99a78" />
              <path d="M70 320c10-40 40-56 80-56s70 16 80 56z" fill="#0f2233" />
              <ellipse cx="64" cy="178" rx="12" ry="22" fill="#c08f6c" /><ellipse cx="236" cy="178" rx="12" ry="22" fill="#c08f6c" />
              <ellipse cx="150" cy="176" rx="82" ry="100" fill="#d3a682" />
              <rect x="66" y="128" width="30" height="78" rx="12" fill="url(#side)" /><rect x="204" y="128" width="30" height="78" rx="12" fill="url(#side)" />
              <motion.path animate={{ d: capPath }} transition={{ type: 'spring', stiffness: 140, damping: 16 }} fill="#1a1410" />
              <motion.path animate={{ d: capPath }} transition={{ type: 'spring', stiffness: 140, damping: 16 }} fill="none" stroke="#7fdcff" strokeOpacity=".25" strokeDasharray="3 5" />
              <ellipse cx="120" cy="182" rx="7" ry="5" fill="#2a1d14" /><ellipse cx="180" cy="182" rx="7" ry="5" fill="#2a1d14" />
              <path d="M104 166q16-8 32 0M164 166q16-8 32 0" stroke="#1a1410" strokeWidth="5" strokeLinecap="round" fill="none" />
              <path d="M150 190v26" stroke="#b88a68" strokeWidth="4" strokeLinecap="round" />
              <AnimatePresence>
                {beard > 0 && <motion.path key={beard} initial={{ opacity: 0 }} animate={{ opacity: beard === 1 ? .35 : 1 }} exit={{ opacity: 0 }}
                  d={beard === 2 ? 'M72 196c0 60 34 92 78 92s78-32 78-92c-10 20-24 30-40 32-12-10-26-12-38-12s-26 2-38 12c-16-2-30-12-40-32z' : 'M76 200c4 50 32 78 74 78s70-28 74-78c-12 18-26 26-40 28-12-8-22-10-34-10s-22 2-34 10c-14-2-28-10-40-28z'} fill="#1a1410" />}
              </AnimatePresence>
              <path d="M128 236q22 12 44 0" stroke={beard === 2 ? '#d3a682' : '#8a5a44'} strokeWidth="4" strokeLinecap="round" fill="none" />
            </svg>
          </div>
          <div className="grid gap-8 rounded-[36px] bg-white/[.04] p-8 ring-1 ring-white/10 backdrop-blur md:p-10">
            <Slider label="Длина сверху" value={top} set={setTop} l="Коротко" r="Длинно" />
            <Slider label="Высота фейда" value={fade} set={setFade} l="Высокий" r="Без фейда" />
            <div className="grid gap-3"><span className="text-[12px] font-semibold uppercase tracking-[.2em] text-white/50">Борода</span>
              <div className="grid grid-cols-3 gap-2">{['Нет', 'Щетина', 'Борода'].map((t, k) => <button key={t} onClick={() => setBeard(k)} className={`relative h-12 rounded-full text-[15px] font-semibold ${beard === k ? 'text-[#06121c]' : 'text-white/70 ring-1 ring-white/15'}`}>{beard === k && <motion.span layoutId="beard" className="absolute inset-0 rounded-full" style={{ background: iceGrad }} />}<span className="relative">{t}</span></button>)}</div>
            </div>
            <div className="rounded-3xl bg-black/30 p-6"><span className="text-[12px] uppercase tracking-[.2em] text-white/40">Ваша стрижка</span><AnimatePresence mode="wait"><motion.p key={name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className={`${BS} mt-1 text-[34px] font-bold uppercase leading-tight`}>{name}</motion.p></AnimatePresence></div>
            <a href="#book" data-svc={name} className={`${BS} inline-flex h-16 items-center justify-center gap-3 rounded-full text-[22px] font-bold uppercase text-[#06121c]`} style={{ background: iceGrad }}>Записаться с этой стрижкой <ArrowUpRight /></a>
          </div>
        </div>
      </div>
    </section>
  )
}

function Book() {
  const bk = useBooking()
  const f = 'h-14 w-full rounded-full bg-white/[.06] px-6 text-[16px] text-white outline-none ring-1 ring-white/15 placeholder:text-white/35 focus:ring-[#7fdcff]'
  return (
    <section id="book" className="relative overflow-hidden px-6 py-28 md:px-10">
      <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25 blur-[140px]" style={{ background: ICE }} />
      <div className="relative mx-auto grid max-w-[1200px] gap-12 rounded-[44px] bg-white/[.04] p-8 ring-1 ring-white/10 backdrop-blur-xl md:grid-cols-2 md:p-16">
        <div>
          <h2 className={`${BS} text-[clamp(60px,8vw,130px)] font-black uppercase leading-[.85]`}>Кресло<br /><span className="bg-clip-text text-transparent" style={{ backgroundImage: iceGrad }}>ждёт</span></h2>
          <p className="mb-8 mt-6 max-w-[400px] text-white/60">Оставьте номер — мастер перезвонит и подберёт время.</p>
          {b.phones.map(p => <a key={p} href={'tel:' + tel(p)} className={`${BS} text-[42px] font-bold`}>{p}</a>)}
        </div>
        <AnimatePresence mode="wait">
          {!bk.s.sent ? (
            <motion.form key="f" exit={{ opacity: 0, filter: 'blur(10px)' }} onSubmit={bk.submit} noValidate className="grid content-center gap-4">
              <input className={f} placeholder="Имя" value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} autoComplete="name" />
              <motion.input animate={bk.s.err ? { x: [0, -8, 8, -6, 6, 0] } : {}} className={f + (bk.s.err ? ' !ring-red-400' : '')} type="tel" inputMode="tel" placeholder="+375 (__) ___-__-__" value={bk.s.phone} onFocus={phoneFocus(bk)} onChange={e => bk.upd('phone', e.target.value)} autoComplete="tel" />
              <input className={f} placeholder="Стрижка" value={bk.s.svc} onChange={e => bk.upd('svc', e.target.value)} />
              <button disabled={bk.s.loading} className={`${BS} h-16 rounded-full text-[22px] font-bold uppercase text-[#06121c] disabled:opacity-60`} style={{ background: iceGrad }}>{bk.s.loading ? 'Охлаждаем…' : 'Записаться'}</button>
              <p className="text-[13px] text-white/45">В готовом сайте заявка сразу придёт вам в Telegram.</p>
            </motion.form>
          ) : (
            <motion.div key="ok" initial={{ opacity: 0, scale: .9 }} animate={{ opacity: 1, scale: 1 }} className="grid place-items-center text-center text-[#7fdcff]">
              <div><CheckDraw className="mx-auto mb-5" /><h3 className={`${BS} text-[54px] font-black uppercase text-white`}>Stay cool</h3><p className="mb-5 text-white/60">Так клиент увидит подтверждение.</p><button onClick={bk.reset} className="underline underline-offset-4">Ещё одна запись</button></div>
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
      <div className="font-['Inter',sans-serif] text-white" style={{ background: BG, '--sel': ICE, '--selc': BG }}>
        <Intro bg={BG} fg={FROST} duration={1.4}><motion.div initial={{ rotate: -90, scale: .4 }} animate={{ rotate: 0, scale: 1 }} transition={{ duration: 1, type: 'spring' }}><Snowflake size={90} color={ICE} /></motion.div></Intro>
        <Grain opacity={.06} />
        <Progress color={ICE} />
        <Cursor color={FROST} />
        <Ribbon name={b.name} bg={ICE} fg={BG} />
        <header className="sticky top-0 z-40 border-b border-white/10 bg-[#06121c]/70 backdrop-blur-xl">
          <div className="mx-auto flex h-[70px] max-w-[1320px] items-center justify-between px-6 md:px-10">
            <a href="#top" className={`${BS} flex items-center gap-2 text-[30px] font-black uppercase`}><Scissors size={22} color={ICE} />Coolman</a>
            <nav className="hidden gap-8 text-[13px] font-semibold uppercase tracking-[.16em] text-white/60 md:flex">{[['#services', 'Услуги'], ['#fade', 'Конструктор'], ['#book', 'Запись'], ['#contacts', 'Контакты']].map(([h, t]) => <a key={h} href={h} className="hover:text-white">{t}</a>)}</nav>
            <a href="#book" className={`${BS} hidden h-11 items-center rounded-full px-6 text-[18px] font-bold uppercase text-[#06121c] sm:inline-flex`} style={{ background: iceGrad }}>Записаться</a>
          </div>
        </header>
        <main id="top">
          <Hero lite={lite} />
          <Marquee base={-2.5} className="border-y border-white/10 py-6">
            {['fade', 'crop', 'beard', 'classic', 'kids', 'stay cool'].map(t => <span key={t} className={`${BS} mx-6 inline-flex items-center gap-12 text-[clamp(44px,6vw,100px)] font-black uppercase text-transparent [-webkit-text-stroke:1.5px_#7fdcff]`}>{t}<Snowflake className="text-white" size={34} /></span>)}
          </Marquee>
          <section id="services" className="px-6 py-28 md:px-10">
            <div className="mx-auto max-w-[1320px]">
              <h2 className={`${BS} mb-14 text-[clamp(60px,9vw,150px)] font-black uppercase leading-[.85]`}><SplitText text="Меню" /></h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {SV.map(([t, d], k) => (
                  <Reveal key={t} delay={k * .05}>
                    <motion.a href="#book" data-svc={t} data-cursor="Запись" whileHover="h" className="group relative block overflow-hidden rounded-[32px] bg-white/[.03] p-8 ring-1 ring-white/10">
                      <motion.span variants={{ h: { opacity: 1, y: 0 } }} initial={{ opacity: 0, y: 40 }} className="absolute inset-0" style={{ background: 'linear-gradient(180deg,transparent,rgba(127,220,255,.18))' }} />
                      <motion.span variants={{ h: { rotate: 180 } }} transition={{ duration: .6 }} className="relative mb-14 inline-block"><Snowflake size={30} color={ICE} /></motion.span>
                      <h3 className={`${BS} relative mb-2 text-[40px] font-bold uppercase leading-none`}>{t}</h3>
                      <p className="relative text-white/60">{d}</p>
                    </motion.a>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
          <Fade />
          <section className="px-6 py-16 md:px-10">
            <div className="mx-auto grid max-w-[1320px] gap-4 md:grid-cols-3">
              {[[b.rev, 'оценок на Яндекс.Картах'], [3, 'ползунка до идеальной стрижки'], [60, 'секунд на онлайн-запись']].map(([n, t]) => <Reveal key={t} className="rounded-[32px] p-10 ring-1 ring-white/10"><span className={`${BS} block bg-clip-text text-[110px] font-black leading-none text-transparent`} style={{ backgroundImage: iceGrad }}><Counter to={n} /></span><span className="text-white/55">{t}</span></Reveal>)}
            </div>
          </section>
          <Book />
          <section id="contacts" className="px-6 pb-28 md:px-10">
            <div className="mx-auto grid max-w-[1320px] gap-6 md:grid-cols-[.9fr_1.1fr]">
              <Reveal className="grid content-start gap-7">
                <h2 className={`${BS} text-[clamp(60px,8vw,130px)] font-black uppercase leading-[.85]`}>Кульман, <span className="bg-clip-text text-transparent" style={{ backgroundImage: iceGrad }}>27</span></h2>
                <p className="flex items-start gap-3 text-[20px]"><MapPin className="mt-1 shrink-0" color={ICE} />{b.addr}</p>
                {b.phones.map(p => <a key={p} href={'tel:' + tel(p)} className={`${BS} text-[40px] font-bold`}>{p}</a>)}
                <div className="flex flex-wrap gap-2">{messengerLinks(b).map(m => <a key={m.k} href={m.href} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-[14px] ring-1 ring-white/20 hover:ring-[#7fdcff]">{m.Icon && <m.Icon width={16} height={16} />}{m.label}</a>)}</div>
              </Reveal>
              <Reveal delay={.1} className="h-[420px] overflow-hidden rounded-[32px] ring-1 ring-white/10"><MapFrame oid={b.oid} dark /></Reveal>
            </div>
          </section>
        </main>
        <footer className="border-t border-white/10 px-6 py-10 text-[13px] text-white/45 md:px-10"><div className="mx-auto flex max-w-[1320px] flex-wrap justify-between gap-4"><span>© 2026 Coolman</span><span>Демо-концепт · дизайн и разработка — Артём</span></div></footer>
        <CallBar phone={b.phones[0]} barCls="bg-[#06121c]/90 backdrop-blur-xl border-t border-white/10" callCls="rounded-full ring-1 ring-white/25" bookCls="rounded-full text-[#06121c] bg-[#7fdcff]" />
        <div className="h-[72px] sm:hidden" />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
