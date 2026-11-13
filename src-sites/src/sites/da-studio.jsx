import React, { useRef, useState, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, AnimatePresence, MotionConfig, LayoutGroup } from 'framer-motion'
import { ArrowUpRight, Phone, MapPin, Plus, X, Heart } from 'lucide-react'
import '../lib/base.css'
import { B } from '../data'
import { useSmooth, Ribbon, SplitText, ScrollWords, Reveal, Magnetic, Cursor, Counter, useBooking, phoneFocus, CheckDraw, MapFrame, messengerLinks, CallBar, Progress, tel } from '../lib/kit'

const Blobs = lazy(() => import('./da3d'))
const b = B['da-studio']
const R = '#c86b5e'
const SV = [['Стрижки', 'Женские, мужские и детские — форма, которая легко укладывается дома.', '#f2c4b8'], ['Окрашивание', 'Тонирование, мелирование, сложные техники и бережный уход за цветом.', '#e9d3c3'], ['Маникюр', 'Аккуратная форма и покрытие, которое не скалывается неделями.', '#dfe7da'], ['Педикюр', 'Комфортная процедура, уход и стойкий результат.', '#f5ddd4'], ['Уходы', 'Восстановление, увлажнение и блеск волос.', '#e6e0ef'], ['Укладки', 'Повседневные и праздничные образы — к любому событию.', '#f2e6cf']]

function Hand({ d, delay = 0, className = '', w = 4 }) {
  return (
    <svg viewBox="0 0 200 60" className={className} fill="none" aria-hidden="true">
      <motion.path d={d} stroke="currentColor" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.1, delay, ease: [0.65, 0, 0.35, 1] }} />
    </svg>
  )
}

function Parallax({ children, speed = 0.3, className = '' }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [120 * speed, -120 * speed])
  return <motion.div ref={ref} style={{ y }} className={className}>{children}</motion.div>
}

function Cards({ open }) {
  const [sel, setSel] = useState(null)
  return (
    <LayoutGroup>
      <div className="grid gap-4 md:grid-cols-3">
        {SV.map(([t, d, c], i) => (
          <motion.div layout key={t} onClick={() => setSel(sel === i ? null : i)} transition={{ type: 'spring', bounce: 0.15, duration: .6 }}
            className={`relative cursor-pointer overflow-hidden rounded-[40px] p-8 ${sel === i ? 'md:col-span-2 md:row-span-2' : ''}`} style={{ background: c }} data-cursor={sel === i ? 'Закрыть' : 'Открыть'}>
            <motion.div layout="position" className="flex items-start justify-between">
              <span className="font-['Caveat',cursive] text-[34px] leading-none text-[#c86b5e]">0{i + 1}</span>
              <motion.span animate={{ rotate: sel === i ? 45 : 0 }} className="grid h-11 w-11 place-items-center rounded-full bg-white/70"><Plus size={20} /></motion.span>
            </motion.div>
            <motion.h3 layout="position" className={`mt-10 font-['Lora',serif] font-semibold leading-none ${sel === i ? 'text-[clamp(44px,5vw,72px)]' : 'text-[30px]'}`}>{t}</motion.h3>
            <AnimatePresence>{sel === i && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0, transition: { delay: .2 } }} exit={{ opacity: 0 }} className="mt-5">
                <p className="mb-6 max-w-[440px] text-[17px] text-[#6d4f48]">{d}</p>
                <button onClick={e => { e.stopPropagation(); open(t) }} className="inline-flex h-12 items-center gap-2 rounded-full bg-[#3b2420] px-6 font-bold text-white transition-[scale] active:scale-[.96]">Записаться <ArrowUpRight size={18} /></button>
              </motion.div>)}</AnimatePresence>
          </motion.div>
        ))}
      </div>
    </LayoutGroup>
  )
}

function Drawer({ open, svc, onClose }) {
  const bk = useBooking()
  React.useEffect(() => { if (open && svc) bk.upd('svc', svc) }, [open, svc])
  const f = 'h-14 w-full rounded-2xl border border-[#3b2420]/15 bg-[#fbf1eb] px-4 text-[16px] outline-none transition-[border-color,box-shadow] focus:border-[#c86b5e] focus:shadow-[0_0_0_4px_rgba(200,107,94,.15)]'
  return (
    <AnimatePresence>{open && (
      <>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-[85] bg-[#3b2420]/40 backdrop-blur-sm" />
        <motion.aside role="dialog" aria-label="Запись" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', bounce: 0, duration: .55 }}
          className="fixed inset-y-0 right-0 z-[86] w-full max-w-[480px] overflow-y-auto overscroll-contain rounded-l-[40px] bg-[#fffaf6] p-8 md:p-10">
          <button onClick={onClose} aria-label="Закрыть" className="mb-8 grid h-12 w-12 place-items-center rounded-full bg-[#fbf1eb]"><X size={20} /></button>
          <span className="font-['Caveat',cursive] text-[32px] text-[#c86b5e]">ура, вы решились!</span>
          <h2 className="mb-8 font-['Lora',serif] text-[44px] font-semibold leading-none">Запись в Да</h2>
          <AnimatePresence mode="wait">{!bk.s.sent ? (
            <motion.form key="f" exit={{ opacity: 0 }} onSubmit={bk.submit} noValidate className="grid gap-4">
              <select className={f} value={bk.s.svc} onChange={e => bk.upd('svc', e.target.value)}><option value="">Услуга</option>{SV.map(([t]) => <option key={t}>{t}</option>)}</select>
              <input className={f} value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} placeholder="Ваше имя" autoComplete="name" />
              <motion.input animate={bk.s.err ? { x: [0, -8, 8, -6, 6, 0] } : {}} className={f + (bk.s.err ? ' !border-red-500' : '')} value={bk.s.phone} onFocus={phoneFocus(bk)} onChange={e => bk.upd('phone', e.target.value)} type="tel" inputMode="tel" placeholder="Телефон *" autoComplete="tel" />
              <button disabled={bk.s.loading} className="h-14 rounded-full bg-[#c86b5e] font-bold text-white shadow-[0_12px_30px_rgba(200,107,94,.3)] transition-[scale,opacity] active:scale-[.96] disabled:opacity-60">{bk.s.loading ? 'Отправляем…' : 'Записаться'}</button>
              <p className="text-[13px] text-[#8b6c65]">Перезвоним и подберём мастера. В готовом сайте заявка придёт в Telegram.</p>
            </motion.form>) : (
            <motion.div key="ok" initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }} className="py-10 text-center text-[#c86b5e]"><CheckDraw className="mx-auto mb-4" /><h3 className="font-['Lora',serif] text-[34px] font-semibold text-[#3b2420]">Вы сказали «да»!</h3><p className="text-[#8b6c65]">Скоро перезвоним.</p></motion.div>)}
          </AnimatePresence>
        </motion.aside>
      </>)}</AnimatePresence>
  )
}

function App() {
  useSmooth()
  const [dr, setDr] = useState({ open: false, svc: '' })
  const open = (svc = '') => setDr({ open: true, svc })
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const hy = useTransform(scrollYProgress, [0, 1], [0, 140])
  return (
    <MotionConfig reducedMotion="user">
      <div className="bg-[#fbf1eb] font-['Nunito_Sans',sans-serif] text-[#3b2420]" style={{ '--sel': R, '--selc': '#fff' }}>
        <Progress color={R} />
        <Cursor color={R} blend="normal" textColor="#fff" />
        <Ribbon name={b.name} bg={R} fg="#fff" />
        <header className="sticky top-0 z-40 bg-[#fbf1eb]/80 backdrop-blur-xl">
          <div className="mx-auto flex h-[78px] max-w-[1200px] items-center justify-between px-6">
            <a href="#top" className="flex items-baseline gap-1 font-['Lora',serif] text-[30px] font-semibold">Да<span className="font-['Caveat',cursive] text-[38px] text-[#c86b5e]">студия</span></a>
            <nav className="hidden gap-8 text-[15px] text-[#8b6c65] md:flex">{[['#services', 'Услуги'], ['#about', 'О нас'], ['#contacts', 'Контакты']].map(([h, t]) => <a key={h} href={h} className="hover:text-[#c86b5e]">{t}</a>)}</nav>
            <button onClick={() => open()} className="hidden h-12 items-center rounded-full bg-[#c86b5e] px-6 font-bold text-white sm:inline-flex">Записаться</button>
          </div>
        </header>
        <main id="top">
          <section ref={heroRef} className="relative min-h-[92svh] overflow-hidden">
            <div className="absolute inset-0"><Suspense fallback={null}><Blobs /></Suspense></div>
            <motion.div style={{ y: hy }} className="relative mx-auto flex min-h-[92svh] max-w-[1200px] flex-col justify-center px-6 py-20">
              <motion.span initial={{ opacity: 0, rotate: -6 }} animate={{ opacity: 1, rotate: -3 }} transition={{ delay: .3 }} className="mb-2 font-['Caveat',cursive] text-[clamp(30px,3vw,42px)] text-[#c86b5e]">привет, красота!</motion.span>
              <h1 className="max-w-[860px] font-['Lora',serif] text-[clamp(52px,8vw,124px)] font-semibold leading-[.98] tracking-[-.02em]">
                <SplitText text="Место, где" mode="words" stagger={.1} className="block" />
                <span className="block">говорят <span className="relative inline-block italic text-[#c86b5e]">«да»<Hand className="absolute -bottom-[.15em] left-[-6%] w-[112%] text-[#f2c4b8]" d="M6 40 C 50 16, 90 52, 130 30 S 180 22, 194 34" delay={.9} w={7} /></span></span>
                <SplitText text="себе" mode="words" delay={.4} className="block" />
              </h1>
              <Reveal delay={.6}><p className="mb-10 mt-8 max-w-[460px] text-[18px] text-[#8b6c65]">Уютный салон на Романовской Слободе: волосы, ногти и уход. Приходите выдохнуть — уходите с настроением.</p></Reveal>
              <Reveal delay={.7} className="flex flex-wrap gap-3">
                <Magnetic><button onClick={() => open()} data-cursor="Да!" className="inline-flex h-14 items-center gap-2 rounded-full bg-[#c86b5e] px-8 font-bold text-white shadow-[0_14px_34px_rgba(200,107,94,.35)] transition-[scale] active:scale-[.96]">Выбрать время <ArrowUpRight size={18} /></button></Magnetic>
                <a href={'tel:' + tel(b.phones[0])} className="inline-flex h-14 items-center gap-2 rounded-full bg-white/80 px-7 font-bold backdrop-blur"><Phone size={16} />{b.phones[0]}</a>
              </Reveal>
            </motion.div>
          </section>
          <section id="about" className="relative mx-auto max-w-[1200px] px-6 py-28">
            <Parallax speed={.6} className="absolute right-6 top-10 hidden rotate-6 rounded-3xl bg-white px-5 py-4 shadow-xl md:block"><b className="block font-['Caveat',cursive] text-[30px] leading-none text-[#c86b5e]">{b.rev} оценок</b><span className="text-[13px] text-[#8b6c65]">на Яндекс.Картах</span></Parallax>
            <Parallax speed={-.4} className="absolute bottom-10 left-6 hidden -rotate-6 rounded-3xl bg-white px-5 py-4 shadow-xl md:block"><b className="block font-['Caveat',cursive] text-[30px] leading-none text-[#c86b5e]">в центре</b><span className="text-[13px] text-[#8b6c65]">{b.addr}</span></Parallax>
            <span className="mb-6 block text-center font-['Caveat',cursive] text-[34px] text-[#c86b5e]">почему к нам возвращаются</span>
            <ScrollWords className="mx-auto max-w-[920px] text-center font-['Lora',serif] text-[clamp(30px,4vw,56px)] font-medium leading-[1.2]" text="Здесь не торопят и не спорят с вашим вкусом. Здесь слушают, советуют честно и делают так, что хочется улыбаться своему отражению." dim={.14} />
          </section>
          <section id="services" className="mx-auto max-w-[1200px] px-6 pb-28">
            <div className="mb-12 text-center"><span className="font-['Caveat',cursive] text-[34px] text-[#c86b5e]">нажмите на карточку</span><h2 className="font-['Lora',serif] text-[clamp(40px,5vw,68px)] font-semibold">Наши <i className="text-[#c86b5e]">услуги</i></h2></div>
            <Cards open={open} />
          </section>
          <section className="mx-6 mb-28 overflow-hidden rounded-[48px] bg-[#c86b5e] px-8 py-20 text-white md:mx-auto md:max-w-[1200px] md:px-16">
            <div className="grid items-center gap-10 md:grid-cols-[1.2fr_1fr]">
              <div><span className="font-['Caveat',cursive] text-[32px] opacity-90">одно маленькое «да»</span><h2 className="font-['Lora',serif] text-[clamp(40px,5vw,72px)] font-semibold leading-[1.02]">и вы <i className="text-[#ffe1d8]">в списке</i> счастливых гостей</h2>
                <Magnetic><button onClick={() => open()} className="mt-8 inline-flex h-14 items-center gap-2 rounded-full bg-white px-8 font-bold text-[#c86b5e]"><Heart size={18} />Записаться</button></Magnetic></div>
              <div className="grid gap-5">{[[b.rev, 'оценок гостей'], [6, 'направлений красоты'], [60, 'секунд на запись']].map(([n, t]) => <div key={t} className="flex items-baseline gap-4 border-b border-white/25 pb-4"><Counter to={n} className="font-['Lora',serif] text-[56px] font-semibold leading-none" /><span className="opacity-85">{t}</span></div>)}</div>
            </div>
          </section>
          <section id="contacts" className="mx-auto max-w-[1200px] px-6 pb-28">
            <div className="grid gap-5 md:grid-cols-[1fr_1.3fr]">
              <Reveal className="grid content-start gap-6 rounded-[40px] bg-white p-10 shadow-[0_14px_40px_rgba(59,36,32,.06)]">
                <h2 className="font-['Lora',serif] text-[48px] font-semibold leading-none">Ждём <i className="text-[#c86b5e]">в гости</i></h2>
                <div><p className="font-['Caveat',cursive] text-[26px] text-[#c86b5e]">адрес</p><p className="flex items-center gap-2 font-['Lora',serif] text-[22px] font-semibold"><MapPin size={18} />{b.addr}</p></div>
                <div><p className="font-['Caveat',cursive] text-[26px] text-[#c86b5e]">телефон</p>{b.phones.map(p => <a key={p} href={'tel:' + tel(p)} className="font-['Lora',serif] text-[22px] font-semibold">{p}</a>)}</div>
                <div className="flex flex-wrap gap-2">{messengerLinks(b).map(m => <a key={m.k} href={m.href} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-full bg-[#fbf1eb] px-4 py-2.5 text-[14px] font-bold transition-colors hover:bg-[#c86b5e] hover:text-white">{m.Icon && <m.Icon width={16} height={16} />}{m.label}</a>)}</div>
              </Reveal>
              <Reveal delay={.08} className="min-h-[420px] overflow-hidden rounded-[40px] shadow-[0_14px_40px_rgba(59,36,32,.06)]"><MapFrame oid={b.oid} /></Reveal>
            </div>
          </section>
        </main>
        <footer className="pb-14 text-center text-[14px] text-[#8b6c65]"><p className="font-['Lora',serif] text-[26px] font-semibold text-[#3b2420]">Да<span className="font-['Caveat',cursive] text-[32px] text-[#c86b5e]">студия</span></p>© 2026 · демо-концепт сайта · автор — Артём</footer>
        <Drawer open={dr.open} svc={dr.svc} onClose={() => setDr({ open: false, svc: '' })} />
        <div className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-2 gap-2 border-t border-[#3b2420]/10 bg-[#fbf1eb]/95 px-3 pb-[calc(10px+env(safe-area-inset-bottom))] pt-2.5 backdrop-blur-xl sm:hidden">
          <a href={'tel:' + tel(b.phones[0])} className="grid h-12 place-items-center rounded-full bg-white font-bold">Позвонить</a>
          <button onClick={() => open()} className="grid h-12 place-items-center rounded-full bg-[#c86b5e] font-bold text-white">Записаться</button>
        </div>
        <div className="h-[72px] sm:hidden" />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
