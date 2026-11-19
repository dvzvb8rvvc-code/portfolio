import React, { useRef, useState, useEffect, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, useSpring, useInView, AnimatePresence, MotionConfig, useMotionTemplate } from 'framer-motion'
import { ArrowRight, ArrowUpRight, Phone, MapPin, Clock, Star, Plus, Minus, Check, Sparkles, Hand, Footprints, Flower2, Leaf, CalendarHeart } from 'lucide-react'
import '../lib/base.css'
import { useSmooth, Ribbon, LineReveal, Reveal, useBooking, phoneFocus, CheckDraw, MapFrame, CallBar, tel, useLite, useIsMobile, IG, TG } from '../lib/kit'

const CloudScene = lazy(() => import('./blisscloud3d'))

const b = {
  name: 'Блисс Клауд', addr: 'ул. Лобанка, 88', district: 'Сухарево', city: 'Минск',
  phone: '+375 29 303-37-16', viber: 'viber://chat?number=%2B375293033716',
  ig: 'https://www.instagram.com/blisscloud_lobanka', igName: '@blisscloud_lobanka', tg: 'https://t.me/bcloud_studio',
  online: 'https://online-zapis.com/online/01527_1',
  rating: '5,0', rev: 285, revWord: 'оценок', oid: '100885386427',
}
const MILK = '#f6f1fb', INK = '#2d2846', VIO = '#5b47c9', VIO_D = '#46369f', LILAC = '#e6defa', PEACH = '#ffe1d6'
const DISP = "font-['Comfortaa',sans-serif]", BODY = "font-['Nunito',sans-serif]"
const go = id => { const el = document.querySelector(id); if (!el) return; window.__lenis ? window.__lenis.scrollTo(el, { offset: -76 }) : el.scrollIntoView({ behavior: 'smooth' }) }
const callback = list => { window.dispatchEvent(new CustomEvent('bc-pick', { detail: list })); go('#book') }

function OnlineBtn({ className = '', children = 'Онлайн-запись' }) {
  return <a href={b.online} target="_blank" rel="noopener" className={`inline-flex items-center justify-center gap-2 rounded-full font-extrabold text-white shadow-[0_16px_34px_-16px_rgba(91,71,201,.9)] transition hover:brightness-110 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#2d2846] ${className}`} style={{ background: VIO }}>{children}<ArrowUpRight size={19} /></a>
}

/* ---------------- hero film: drifting through clouds ---------------- */
const R = [[0.14, 0.3], [0.36, 0.52], [0.58, 0.72], [0.78, 0.94]]
const CH = [
  { k: 'Маникюр', t: 'Руки, о которых не нужно думать', d: 'Аккуратный маникюр с покрытием или без — спокойно, без спешки.' },
  { k: 'Педикюр', t: 'Лёгкость с первого шага', d: 'Педикюр с покрытием и уходом. Можно в один визит с маникюром.' },
  { k: 'Массаж', t: 'Выдохнуть и отпустить плечи', d: 'Массаж, чтобы снять напряжение после рабочей недели.' },
  { k: 'Косметология', t: 'Свежая кожа без лишнего', d: 'Уходовые процедуры для лица — подберём на консультации.' },
]
function Caption({ p, i, c }) {
  const [a, z] = R[i]
  const o = useTransform(p, [a - 0.04, a + 0.01, z - 0.01, z + 0.03], [0, 1, 1, 0])
  const s = useTransform(p, [a - 0.04, a + 0.01, z - 0.01, z + 0.03], [0.94, 1, 1, 1.06])
  const blur = useTransform(p, [a - 0.04, a + 0.01, z - 0.01, z + 0.03], [10, 0, 0, 10])
  const filter = useMotionTemplate`blur(${blur}px)`
  const pe = useTransform(o, v => (v > 0.6 ? 'auto' : 'none'))
  return (
    <motion.div style={{ opacity: o, scale: s, filter, pointerEvents: pe }} className="absolute inset-0 flex flex-col items-center justify-center px-5 text-center">
      <p className="rounded-full bg-white/70 px-4 py-1.5 text-[15px] font-extrabold uppercase tracking-[.16em]" style={{ color: VIO_D }}>{c.k}</p>
      <h2 className={`${DISP} mt-5 max-w-[900px] text-[clamp(34px,5.6vw,84px)] font-bold leading-[1.05] tracking-[-0.03em]`}>{c.t}</h2>
      <p className="mt-5 max-w-[520px] text-[19px] leading-relaxed text-[#2d2846]/80">{c.d}</p>
      <button type="button" onClick={() => go('#hour')} className="mt-7 inline-flex h-14 items-center gap-2 rounded-full bg-white px-7 text-[17px] font-extrabold shadow-[0_10px_30px_-14px_rgba(45,40,70,.4)] hover:bg-[#2d2846] hover:text-white">Собрать мой час <ArrowRight size={18} /></button>
    </motion.div>
  )
}
function Hero({ lite }) {
  const ref = useRef(null)
  const mob = useIsMobile()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const sp = useSpring(scrollYProgress, { stiffness: 70, damping: 22, mass: 0.5 })
  const near = useInView(ref, { margin: '200px 0px' })
  const sky = useTransform(sp, [0, 0.33, 0.66, 1], ['#f6c9bb', '#cfc1f4', '#b9d3f5', '#f3d3c4'])
  const sky2 = useTransform(sp, [0, 0.33, 0.66, 1], ['#e3d3f6', '#f2d3e4', '#dcd6f7', '#e6d6f4'])
  const bg = useMotionTemplate`linear-gradient(180deg, ${sky2} 0%, ${sky} 100%)`
  const heroO = useTransform(sp, [0, 0.1], [1, 0])
  const heroS = useTransform(sp, [0, 0.1], [1, 0.96])
  const heroPE = useTransform(sp, v => (v < 0.07 ? 'auto' : 'none'))
  return (
    <section ref={ref} id="top" className="relative h-[260vh] md:h-[300vh]">
      <motion.div className="sticky top-[64px] h-[calc(100svh-64px)] overflow-hidden md:top-[76px] md:h-[calc(100svh-76px)]" style={{ background: bg }}>
        <div className="absolute inset-0">
          {lite ? (
            <div aria-hidden="true" className="absolute inset-0">
              {[[8, 20, 340], [70, 12, 420], [-6, 64, 380], [74, 66, 360]].map(([x, y, w], i) => <div key={i} className="absolute rounded-full bg-white/80 blur-3xl" style={{ left: x + '%', top: y + '%', width: w, height: w * 0.45 }} />)}
            </div>
          ) : near && <Suspense fallback={null}><CloudScene progress={sp} active={near} count={mob ? 30 : 64} /></Suspense>}
        </div>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(42% 38% at 50% 50%, rgba(255,255,255,.7), rgba(255,255,255,0) 72%)' }} />
        <motion.div style={{ opacity: heroO, scale: heroS, pointerEvents: heroPE }} className="absolute inset-0 flex flex-col items-center justify-center px-5 text-center">
          <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[15px] font-extrabold uppercase tracking-[.16em]" style={{ color: VIO_D }}>
            <span>Студия красоты</span><span aria-hidden="true">·</span><span>{b.district}, {b.addr}</span>
          </p>
          <h1 className={`${DISP} mt-5 text-[clamp(36px,6.4vw,100px)] font-bold leading-[1.02] tracking-[-0.035em]`}>
            <LineReveal delay={0.05}>Маникюр, педикюр,</LineReveal>
            <LineReveal delay={0.14}>массаж и <span style={{ color: VIO }}>косметология</span></LineReveal>
          </h1>
          <p className="mt-5 max-w-[560px] text-[19px] leading-relaxed text-[#2d2846]/80">Тихое место на Сухарево, где можно выдохнуть. Запишитесь онлайн — выберите время сами.</p>
          <a href={`https://yandex.by/maps/org/${b.oid}/reviews/`} target="_blank" rel="noopener" className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/75 px-4 py-2 text-[17px] font-bold hover:bg-white"><Star size={18} fill={VIO} stroke={VIO} />{b.rating} · {b.rev} {b.revWord} на Яндекс Картах</a>
          <div className="mt-7 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
            <OnlineBtn className="h-16 w-full px-9 text-[19px] sm:w-auto" />
            <a href={'tel:' + tel(b.phone)} className="inline-flex h-16 w-full items-center justify-center gap-3 rounded-full bg-white/85 px-8 text-[19px] font-extrabold hover:bg-white sm:w-auto"><Phone size={20} />{b.phone}</a>
          </div>
          <a href="#hour" className="mt-6 text-[16px] font-bold underline decoration-[#5b47c9] decoration-2 underline-offset-4">Пропустить → собрать визит</a>
        </motion.div>
        {CH.map((c, i) => <Caption key={c.k} p={sp} i={i} c={c} />)}
        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2" aria-hidden="true">
          {CH.map((c, i) => <Pip key={c.k} p={sp} i={i} />)}
        </div>
      </motion.div>
    </section>
  )
}
function Pip({ p, i }) {
  const [a, z] = R[i]
  const w = useTransform(p, [a - 0.02, a, z, z + 0.02], [10, 36, 36, 10])
  const o = useTransform(p, [a - 0.02, a, z, z + 0.02], [0.3, 1, 1, 0.3])
  return <motion.span style={{ width: w, opacity: o, background: VIO }} className="h-[10px] rounded-full" />
}

/* ---------------- my calm hour ---------------- */
const SVC = [
  { id: 'mc', g: 'Руки', t: 'Маникюр с покрытием', d: 'Обработка, выравнивание, покрытие гель-лаком.', min: 90, I: Hand },
  { id: 'm', g: 'Руки', t: 'Маникюр без покрытия', d: 'Аккуратная форма и уход за кутикулой.', min: 45, I: Hand },
  { id: 'pc', g: 'Ноги', t: 'Педикюр с покрытием', d: 'Обработка стоп и пальцев, покрытие.', min: 90, I: Footprints },
  { id: 'p', g: 'Ноги', t: 'Педикюр без покрытия', d: 'Гигиенический педикюр и уход.', min: 60, I: Footprints },
  { id: 'ms', g: 'Тело', t: 'Массаж спины', d: 'Снять напряжение в шее и плечах.', min: 40, I: Leaf },
  { id: 'mb', g: 'Тело', t: 'Общий массаж', d: 'Расслабляющий массаж всего тела.', min: 60, I: Leaf },
  { id: 'fc', g: 'Лицо', t: 'Чистка лица', d: 'Очищение кожи — метод подберёт косметолог.', min: 60, I: Flower2 },
  { id: 'fu', g: 'Лицо', t: 'Уходовая процедура', d: 'Увлажнение и питание кожи по её типу.', min: 50, I: Sparkles },
]
const fmt = m => { const h = Math.floor(m / 60), r = m % 60; return (h ? h + ' ч' : '') + (h && r ? ' ' : '') + (r ? r + ' мин' : '') || '0 мин' }
function SvcToggle({ s, on, onClick }) {
  return (
    <button type="button" aria-pressed={on} onClick={onClick}
      className={`group flex min-h-[76px] w-full items-center gap-4 rounded-[22px] border-2 px-4 py-3 text-left transition-all focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#2d2846] ${on ? 'border-[#5b47c9] bg-white shadow-[0_14px_30px_-20px_rgba(91,71,201,.9)]' : 'border-transparent bg-white/60 hover:bg-white'}`}>
      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full transition-colors ${on ? 'bg-[#5b47c9] text-white' : 'bg-[#e6defa] text-[#46369f]'}`}>{on ? <Check size={20} /> : <s.I size={20} />}</span>
      <span className="min-w-0 flex-1"><span className="block text-[18px] font-extrabold leading-tight">{s.t}</span><span className="block text-[15px] text-[#2d2846]/65">≈ {fmt(s.min)}</span></span>
    </button>
  )
}
function CloudMeter({ total }) {
  const k = Math.min(1, total / 300)
  return (
    <div className="relative mx-auto aspect-[1.6] w-full max-w-[360px]" aria-hidden="true">
      <motion.svg viewBox="0 0 320 200" className="absolute inset-0 h-full w-full" animate={{ scale: 0.55 + k * 0.45 }} transition={{ type: 'spring', stiffness: 120, damping: 14 }}>
        <defs><linearGradient id="bcg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" /><stop offset="1" stopColor="#e6defa" /></linearGradient></defs>
        <path d="M70 170c-33 0-55-22-55-50 0-27 22-48 50-48 6-32 34-55 68-55 31 0 57 19 66 46 7-3 14-4 22-4 33 0 60 26 60 58s-27 53-60 53Z" fill="url(#bcg)" stroke="#d8cdf6" strokeWidth="2" />
      </motion.svg>
    </div>
  )
}
function Hour() {
  const [sel, setSel] = useState(['mc', 'pc'])
  const toggle = id => setSel(s => (s.includes(id) ? s.filter(x => x !== id) : [...s, id]))
  const chosen = SVC.filter(s => sel.includes(s.id))
  const total = chosen.reduce((a, s) => a + s.min, 0)
  return (
    <section id="hour" className="px-5 py-24 md:px-10 md:py-32" style={{ background: MILK }}>
      <div className="mx-auto max-w-[1200px]">
        <div className="mx-auto max-w-[760px] text-center">
          <p className="text-[15px] font-extrabold uppercase tracking-[.16em]" style={{ color: VIO_D }}>Мой спокойный час</p>
          <h2 className={`${DISP} mt-4 text-[clamp(32px,4.6vw,64px)] font-bold leading-[1.05] tracking-[-0.03em]`}>Соберите визит — увидите, сколько времени отложить</h2>
          <p className="mt-5 text-[18px] leading-relaxed text-[#2d2846]/75">Отметьте процедуры. Время ориентировочное — точнее подскажет мастер.</p>
        </div>
        <div className="mt-14 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="grid gap-3 sm:grid-cols-2">{SVC.map(s => <SvcToggle key={s.id} s={s} on={sel.includes(s.id)} onClick={() => toggle(s.id)} />)}</div>
          <div className="rounded-[36px] p-7 md:p-9 lg:sticky lg:top-[100px] lg:self-start" style={{ background: `linear-gradient(160deg, ${LILAC}, ${PEACH})` }}>
            <div className="relative">
              <CloudMeter total={total} />
              <div className="absolute inset-0 grid place-items-center text-center">
                <div><p className="text-[15px] font-bold text-[#2d2846]/70">примерно</p><p className={`${DISP} text-[clamp(30px,3.4vw,44px)] font-bold tracking-[-0.03em]`} aria-live="polite">{fmt(total)}</p></div>
              </div>
            </div>
            <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-white/60" aria-hidden="true">
              {chosen.map((s, i) => <motion.span key={s.id} layout className="h-full" style={{ width: (s.min / Math.max(total, 1)) * 100 + '%', background: i % 2 ? '#8f7ee6' : VIO }} />)}
            </div>
            <ul className="mt-5 min-h-[56px] space-y-1.5 text-[17px]">
              {chosen.length ? chosen.map(s => <li key={s.id} className="flex justify-between gap-3"><span>{s.t}</span><span className="shrink-0 text-[#2d2846]/65">≈ {fmt(s.min)}</span></li>) : <li className="text-[#2d2846]/65">Выберите хотя бы одну процедуру</li>}
            </ul>
            <div className="mt-7 grid gap-3">
              <OnlineBtn className="h-16 px-6 text-[18px]">Выбрать время онлайн</OnlineBtn>
              <button type="button" onClick={() => callback(chosen.map(s => s.t))} disabled={!chosen.length} className="h-14 rounded-full bg-white/80 text-[17px] font-extrabold hover:bg-white disabled:opacity-50">Перезвоните мне</button>
            </div>
          </div>
        </div>
        <Reveal className="mt-10 flex flex-col gap-5 rounded-[32px] border-2 border-dashed border-[#5b47c9]/35 bg-white/60 p-7 md:flex-row md:items-center md:justify-between md:p-8">
          <div>
            <p className="text-[14px] font-extrabold uppercase tracking-[.14em]" style={{ color: VIO_D }}>Акция по данным карточки</p>
            <p className={`${DISP} mt-2 text-[clamp(22px,2.4vw,30px)] font-bold leading-tight`}>Маникюр + педикюр с покрытием — 130 руб</p>
            <p className="mt-2 text-[16px] text-[#2d2846]/70">Указано в карточке студии на Яндекс Картах. Актуальность уточняйте при записи.</p>
          </div>
          <button type="button" onClick={() => { setSel(['mc', 'pc']); go('#hour') }} className="h-14 shrink-0 rounded-full px-7 text-[17px] font-extrabold text-white hover:brightness-110" style={{ background: INK }}>Добавить в мой час</button>
        </Reveal>
      </div>
    </section>
  )
}

/* ---------------- services ---------------- */
const GROUPS = [
  { g: 'Руки', I: Hand, tone: PEACH, d: 'Маникюр с покрытием и без, уход за кутикулой, снятие покрытия.' },
  { g: 'Ноги', I: Footprints, tone: LILAC, d: 'Педикюр с покрытием и гигиенический педикюр, уход за стопами.' },
  { g: 'Тело', I: Leaf, tone: '#dcebf9', d: 'Массаж спины и общий массаж — расслабиться и снять напряжение.' },
  { g: 'Лицо', I: Flower2, tone: '#fbe6ee', d: 'Косметология: чистка и уходовые процедуры по типу кожи.' },
]
function Services() {
  return (
    <section id="services" className="px-5 py-24 md:px-10 md:py-28" style={{ background: '#fff' }}>
      <div className="mx-auto max-w-[1200px]">
        <p className="text-[15px] font-extrabold uppercase tracking-[.16em]" style={{ color: VIO_D }}>Услуги</p>
        <div className="mt-3 grid gap-5 md:grid-cols-2 md:items-end">
          <h2 className={`${DISP} text-[clamp(32px,4.6vw,64px)] font-bold leading-[1.05] tracking-[-0.03em]`}>Четыре способа отдохнуть</h2>
          <p className="text-[18px] leading-relaxed text-[#2d2846]/75 md:justify-self-end md:max-w-[420px]">Цены — в онлайн-записи или по телефону. Нажмите «Записаться» у нужной услуги.</p>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {GROUPS.map((x, i) => (
            <Reveal key={x.g} delay={i * 0.06} className="flex flex-col rounded-[36px] p-7 md:p-9" style={{ background: x.tone }}>
              <div className="flex items-center gap-4"><span className="grid h-14 w-14 place-items-center rounded-full bg-white/80" style={{ color: VIO_D }}><x.I size={26} /></span><h3 className={`${DISP} text-[30px] font-bold`}>{x.g}</h3></div>
              <p className="mt-4 text-[18px] leading-relaxed text-[#2d2846]/80">{x.d}</p>
              <ul className="mt-5 flex-1 space-y-2">
                {SVC.filter(s => s.g === x.g).map(s => <li key={s.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white/70 px-4 py-3 text-[17px]"><span className="font-bold">{s.t}</span><span className="shrink-0 text-[15px] text-[#2d2846]/65">≈ {fmt(s.min)}</span></li>)}
              </ul>
              <div className="mt-6 flex flex-wrap gap-3">
                <OnlineBtn className="h-14 px-6 text-[17px]">Записаться</OnlineBtn>
                <button type="button" onClick={() => callback(SVC.filter(s => s.g === x.g).slice(0, 1).map(s => s.t))} className="h-14 rounded-full bg-white/80 px-6 text-[17px] font-extrabold hover:bg-white">Перезвоните мне</button>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------- how ---------------- */
const HOW = [
  { t: 'Выберите время онлайн', d: 'В онлайн-записи видно свободные окна — выберите удобное. Или оставьте номер, мы перезвоним.' },
  { t: 'Приходите на Лобанка, 88', d: `${b.district}. Если опаздываете — просто напишите в Viber или Telegram.` },
  { t: 'Отдыхайте', d: 'Мастер обсудит пожелания перед процедурой. Остальное — наша забота.' },
]
function How() {
  return (
    <section id="how" className="px-5 py-24 md:px-10 md:py-28" style={{ background: MILK }}>
      <div className="mx-auto max-w-[1200px]">
        <p className="text-center text-[15px] font-extrabold uppercase tracking-[.16em]" style={{ color: VIO_D }}>Как записаться</p>
        <h2 className={`${DISP} mt-3 text-center text-[clamp(32px,4.6vw,64px)] font-bold leading-[1.05] tracking-[-0.03em]`}>Три тихих шага</h2>
        <ol className="mt-14 grid gap-5 md:grid-cols-3">
          {HOW.map((s, i) => (
            <Reveal as="li" key={s.t} delay={i * 0.08} className="relative rounded-[36px] bg-white p-8 text-center shadow-[0_24px_50px_-40px_rgba(45,40,70,.5)]">
              <span className={`${DISP} mx-auto grid h-16 w-16 place-items-center rounded-full text-[26px] font-bold text-white`} style={{ background: VIO }}>{i + 1}</span>
              <h3 className={`${DISP} mt-6 text-[24px] font-bold leading-tight`}>{s.t}</h3>
              <p className="mt-3 text-[17px] leading-relaxed text-[#2d2846]/75">{s.d}</p>
            </Reveal>
          ))}
        </ol>
        <div className="mt-10 flex justify-center"><OnlineBtn className="h-16 px-9 text-[19px]" /></div>
      </div>
    </section>
  )
}

/* ---------------- reviews ---------------- */
function Reviews() {
  return (
    <section id="reviews" className="relative overflow-hidden px-5 py-24 md:px-10 md:py-32" style={{ background: `linear-gradient(180deg, ${LILAC}, ${PEACH})` }}>
      <div aria-hidden="true" className="absolute -left-20 top-10 h-[220px] w-[480px] rounded-full bg-white/70 blur-3xl" />
      <div aria-hidden="true" className="absolute -right-24 bottom-6 h-[260px] w-[520px] rounded-full bg-white/60 blur-3xl" />
      <div className="relative mx-auto max-w-[900px] text-center">
        <p className="text-[15px] font-extrabold uppercase tracking-[.16em]" style={{ color: VIO_D }}>Отзывы</p>
        <p className={`${DISP} mt-4 text-[clamp(110px,18vw,240px)] font-bold leading-[.9] tracking-[-0.06em]`}>{b.rating}</p>
        <div className="mt-4 flex justify-center gap-1.5" aria-hidden="true">{[0, 1, 2, 3, 4].map(i => <Star key={i} size={30} fill={VIO} stroke={VIO} />)}</div>
        <p className="mt-5 text-[21px] font-bold">{b.rev} {b.revWord} на Яндекс Картах</p>
        <p className="mx-auto mt-3 max-w-[520px] text-[18px] text-[#2d2846]/75">Самое честное описание студии — в словах гостей. Почитайте, прежде чем записаться.</p>
        <a href={`https://yandex.by/maps/org/${b.oid}/reviews/`} target="_blank" rel="noopener" className="mt-8 inline-flex h-14 items-center gap-2 rounded-full bg-white px-7 text-[17px] font-extrabold hover:bg-[#2d2846] hover:text-white">Читать отзывы <ArrowUpRight size={18} /></a>
      </div>
    </section>
  )
}

/* ---------------- callback form ---------------- */
const ALL = SVC.map(s => s.t)
function Book() {
  const bk = useBooking()
  const [step, setStep] = useState(0), [list, setList] = useState([]), [err, setErr] = useState('')
  const head = useRef(null)
  useEffect(() => { if (step) head.current?.focus() }, [step])
  useEffect(() => { const h = e => { setList(e.detail); setStep(0); setErr('') }; window.addEventListener('bc-pick', h); return () => window.removeEventListener('bc-pick', h) }, [])
  const tog = t => { setList(l => (l.includes(t) ? l.filter(x => x !== t) : [...l, t])); setErr('') }
  const next = e => {
    e.preventDefault()
    if (step === 0 && !list.length) return setErr('Отметьте хотя бы одну процедуру')
    setErr('')
    if (step === 0) setStep(1); else { bk.upd('svc', list.join(', ')); bk.submit() }
  }
  return (
    <section id="book" className="px-5 py-24 md:px-10 md:py-32" style={{ background: '#fff' }}>
      <div className="mx-auto grid max-w-[1200px] gap-10 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="text-[15px] font-extrabold uppercase tracking-[.16em]" style={{ color: VIO_D }}>Запись</p>
          <h2 className={`${DISP} mt-3 text-[clamp(32px,4.4vw,58px)] font-bold leading-[1.05] tracking-[-0.03em]`}>Удобнее всего — онлайн</h2>
          <p className="mt-5 max-w-[440px] text-[18px] leading-relaxed text-[#2d2846]/75">В онлайн-записи видно свободное время мастеров. Не хотите выбирать сами — оставьте номер, администратор перезвонит.</p>
          <OnlineBtn className="mt-7 h-16 w-full px-9 text-[19px] sm:w-auto">Открыть онлайн-запись</OnlineBtn>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={'tel:' + tel(b.phone)} className="inline-flex h-14 items-center gap-2 rounded-full border-2 border-[#2d2846]/15 px-6 text-[17px] font-extrabold hover:border-[#2d2846]"><Phone size={18} />{b.phone}</a>
            <a href={b.viber} className="inline-flex h-14 items-center gap-2 rounded-full border-2 border-[#2d2846]/15 px-6 text-[17px] font-extrabold hover:border-[#2d2846]">Viber</a>
            <a href={b.tg} target="_blank" rel="noopener" className="inline-flex h-14 items-center gap-2 rounded-full border-2 border-[#2d2846]/15 px-6 text-[17px] font-extrabold hover:border-[#2d2846]"><TG />Telegram</a>
          </div>
        </div>
        <div className="rounded-[36px] p-6 md:p-10" style={{ background: MILK }}>
          {bk.s.sent ? (
            <div className="py-10 text-center" role="status">
              <CheckDraw className="mx-auto text-[#5b47c9]" size={84} />
              <p className={`${DISP} mt-6 text-[34px] font-bold`}>Спасибо!</p>
              <p className="mx-auto mt-3 max-w-[420px] text-[18px] leading-relaxed text-[#2d2846]/75">Администратор перезвонит и подберёт время. В готовом сайте заявка сразу придёт вам в Telegram.</p>
              <button type="button" onClick={() => { bk.reset(); setStep(0); setList([]) }} className="mt-8 h-12 text-[17px] font-extrabold underline underline-offset-4">Новая заявка</button>
            </div>
          ) : (
            <form onSubmit={next} noValidate>
              <p className={`${DISP} text-[24px] font-bold`}>Перезвоните мне</p>
              <div className="mt-4 flex gap-2" aria-hidden="true">{[0, 1].map(i => <span key={i} className="h-2 flex-1 rounded-full" style={{ background: i <= step ? VIO : LILAC }} />)}</div>
              <p className="mt-4 text-[16px] font-bold" style={{ color: VIO_D }}>Шаг {step + 1} из 2</p>
              <h3 ref={head} tabIndex={-1} className={`${DISP} mb-5 mt-1 text-[26px] font-bold outline-none`}>{step === 0 ? 'Что хотите сделать?' : 'Как с вами связаться?'}</h3>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                  {step === 0 ? (
                    <div className="grid gap-2 sm:grid-cols-2">{ALL.map(t => (
                      <button key={t} type="button" aria-pressed={list.includes(t)} onClick={() => tog(t)} className={`min-h-[60px] rounded-2xl border-2 px-4 py-3 text-left text-[17px] font-bold transition-colors focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#2d2846] ${list.includes(t) ? 'border-[#5b47c9] bg-[#5b47c9] text-white' : 'border-transparent bg-white hover:border-[#5b47c9]/40'}`}>{t}</button>
                    ))}</div>
                  ) : (
                    <div className="space-y-5">
                      <div><label htmlFor="bc-name" className="text-[17px] font-bold">Имя</label>
                        <input id="bc-name" value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} autoComplete="name" className="mt-2 h-16 w-full rounded-2xl border-2 border-transparent bg-white px-5 text-[18px] outline-none focus:border-[#5b47c9]" /></div>
                      <div><label htmlFor="bc-phone" className="text-[17px] font-bold">Телефон</label>
                        <input id="bc-phone" value={bk.s.phone} onChange={e => bk.upd('phone', e.target.value)} onFocus={phoneFocus(bk)} type="tel" inputMode="tel" autoComplete="tel" placeholder="+375 __ ___-__-__" aria-invalid={bk.s.err} aria-describedby={bk.s.err ? 'bc-perr' : undefined}
                          className={`mt-2 h-16 w-full rounded-2xl border-2 bg-white px-5 text-[18px] outline-none focus:border-[#5b47c9] ${bk.s.err ? 'border-[#b42318]' : 'border-transparent'}`} /></div>
                      {bk.s.err && <p id="bc-perr" className="text-[16px] font-semibold text-[#b42318]">Проверьте номер: нужно 12 цифр, начиная с +375.</p>}
                      <p className="rounded-2xl bg-white/70 p-4 text-[16px]">{list.join(' · ')}</p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
              {err && <p className="mt-4 text-[16px] font-semibold text-[#b42318]" role="alert">{err}</p>}
              <div className="mt-8 flex items-center justify-between gap-4">
                {step > 0 ? <button type="button" onClick={() => setStep(0)} className="h-14 px-2 text-[17px] font-bold text-[#2d2846]/70 hover:text-[#2d2846]">← Назад</button> : <span />}
                <button type="submit" disabled={bk.s.loading} className="inline-flex h-16 items-center gap-2 rounded-full px-8 text-[18px] font-extrabold text-white disabled:opacity-60" style={{ background: INK }}>{step === 0 ? 'Дальше' : bk.s.loading ? 'Отправляем…' : 'Перезвоните мне'} <ArrowRight size={19} /></button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

/* ---------------- faq ---------------- */
const FAQ = [
  ['Можно сделать маникюр и педикюр за один визит?', 'Да, их удобно совместить. Время визита подскажет «Мой спокойный час» выше, точнее — мастер при записи.'],
  ['Как записаться онлайн?', 'Нажмите «Онлайн-запись» — откроется страница записи, где видно свободное время. Выберите процедуру и окно.'],
  ['Сколько длится процедура?', 'Маникюр с покрытием обычно около полутора часов, массаж — от 40 минут. Это ориентир: многое зависит от задачи.'],
  ['Что если я опаздываю или не могу прийти?', 'Напишите или позвоните как можно раньше — постараемся перенести запись на другое время.'],
  ['Действует ли акция 130 руб?', 'Акция указана в карточке студии на Яндекс Картах. Актуальность и условия уточняйте при записи.'],
  ['Как оплатить и есть ли парковка?', 'Способы оплаты и парковку рядом уточняйте по телефону или в мессенджере.'],
]
function Faq() {
  const [open, setOpen] = useState(0)
  return (
    <section id="faq" className="px-5 py-24 md:px-10 md:py-28" style={{ background: MILK }}>
      <div className="mx-auto max-w-[860px]">
        <p className="text-center text-[15px] font-extrabold uppercase tracking-[.16em]" style={{ color: VIO_D }}>Вопросы</p>
        <h2 className={`${DISP} mt-3 text-center text-[clamp(32px,4.4vw,56px)] font-bold leading-[1.05] tracking-[-0.03em]`}>Частые вопросы</h2>
        <div className="mt-12 space-y-3">
          {FAQ.map(([q, a], i) => (
            <div key={q} className="rounded-[26px] bg-white">
              <h3>
                <button type="button" aria-expanded={open === i} aria-controls={'bf-' + i} onClick={() => setOpen(open === i ? -1 : i)} className="flex min-h-[72px] w-full items-center justify-between gap-4 rounded-[26px] px-6 py-4 text-left text-[19px] font-extrabold focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#2d2846]">
                  {q}<span className="grid h-10 w-10 shrink-0 place-items-center rounded-full" style={{ background: open === i ? VIO : LILAC, color: open === i ? '#fff' : INK }}>{open === i ? <Minus size={18} /> : <Plus size={18} />}</span>
                </button>
              </h3>
              <AnimatePresence initial={false}>
                {open === i && <motion.div id={'bf-' + i} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden"><p className="px-6 pb-6 text-[18px] leading-relaxed text-[#2d2846]/75">{a}</p></motion.div>}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------- contact ---------------- */
function Contact() {
  return (
    <section id="contact" className="px-5 py-24 md:px-10 md:py-28" style={{ background: '#fff' }}>
      <div className="mx-auto grid max-w-[1200px] gap-10 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="text-[15px] font-extrabold uppercase tracking-[.16em]" style={{ color: VIO_D }}>Контакты</p>
          <h2 className={`${DISP} mt-3 text-[clamp(32px,4.4vw,56px)] font-bold leading-[1.05] tracking-[-0.03em]`}>Ждём на Сухарево</h2>
          <ul className="mt-8 space-y-5 text-[19px]">
            <li className="flex items-start gap-3"><MapPin className="mt-1 shrink-0" size={22} style={{ color: VIO }} /><span>{b.addr}<br /><span className="text-[#2d2846]/65">{b.district}, {b.city}</span></span></li>
            <li className="flex items-start gap-3"><Clock className="mt-1 shrink-0" size={22} style={{ color: VIO }} />Часы работы — в онлайн-записи или по телефону</li>
            <li><a href={'tel:' + tel(b.phone)} className="flex items-center gap-3 text-[26px] font-extrabold"><Phone size={22} style={{ color: VIO }} />{b.phone}</a><span className="ml-9 text-[16px] text-[#2d2846]/65">телефон и Viber</span></li>
            <li><a href={b.ig} target="_blank" rel="noopener" className="flex items-center gap-3 font-bold underline-offset-4 hover:underline"><IG width="22" height="22" style={{ color: VIO }} />Instagram {b.igName}</a></li>
            <li><a href={b.tg} target="_blank" rel="noopener" className="flex items-center gap-3 font-bold underline-offset-4 hover:underline"><TG width="22" height="22" style={{ color: VIO }} />Telegram @bcloud_studio</a></li>
          </ul>
          <OnlineBtn className="mt-8 h-16 px-9 text-[19px]" />
        </div>
        <div className="h-[380px] overflow-hidden rounded-[40px] md:h-[500px]"><MapFrame oid={b.oid} /></div>
      </div>
    </section>
  )
}

/* ---------------- header ---------------- */
const NAV = [['#hour', 'Мой час'], ['#services', 'Услуги'], ['#how', 'Как записаться'], ['#reviews', 'Отзывы'], ['#contact', 'Контакты']]
function useActive() {
  const [a, setA] = useState('')
  useEffect(() => {
    const els = ['#hour', '#services', '#how', '#reviews', '#book', '#faq', '#contact'].map(h => document.querySelector(h)).filter(Boolean)
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) setA('#' + e.target.id) }), { rootMargin: '-45% 0px -50% 0px' })
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])
  return a === '#book' ? '#reviews' : a === '#faq' ? '#contact' : a
}
function Logo() {
  return (
    <svg viewBox="0 0 40 26" width="38" height="25" aria-hidden="true"><path d="M10 24C5 24 2 21 2 17s3-7 7-7c1-5 5-8 10-8 5 0 8 3 9 7h1c5 0 9 4 9 8s-4 7-9 7Z" fill={VIO} /></svg>
  )
}
function Header() {
  const active = useActive()
  return (
    <header className="sticky top-0 z-50 bg-[#f6f1fb]/85 backdrop-blur-md">
      <div className="mx-auto flex h-[64px] max-w-[1320px] items-center justify-between gap-4 px-4 md:h-[76px] md:px-10">
        <a href="#top" className="flex min-w-0 items-center gap-3" aria-label="Блисс Клауд — наверх">
          <Logo />
          <span className="min-w-0 leading-none"><span className={`${DISP} block truncate text-[20px] font-bold md:text-[22px]`}>Блисс Клауд</span><span className="mt-1 block truncate text-[13px] font-bold uppercase tracking-[.12em] text-[#2d2846]/60">студия красоты · Сухарево</span></span>
        </a>
        <nav className="hidden items-center gap-0.5 rounded-full bg-white/70 p-1 xl:flex" aria-label="Разделы">
          {NAV.map(([h, t]) => <a key={h} href={h} aria-current={active === h ? 'true' : undefined} className={`whitespace-nowrap rounded-full px-3.5 py-2 text-[16px] font-bold transition-colors ${active === h ? 'bg-[#2d2846] text-white' : 'hover:bg-[#e6defa]'}`}>{t}</a>)}
        </nav>
        <div className="flex shrink-0 items-center gap-3">
          <a href={'tel:' + tel(b.phone)} className="hidden text-[17px] font-extrabold 2xl:inline">{b.phone}</a>
          <OnlineBtn className="hidden h-12 px-5 text-[16px] sm:inline-flex" />
        </div>
      </div>
    </header>
  )
}

function App() {
  useSmooth()
  const lite = useLite()
  return (
    <MotionConfig reducedMotion="user">
      <div className={`${BODY} text-[18px] text-[#2d2846]`} style={{ background: MILK, '--sel': VIO, '--selc': '#fff' }}>
        <Ribbon name={b.name} bg={INK} fg="#fff" />
        <Header />
        <main>
          <Hero lite={lite} />
          <Hour />
          <Services />
          <How />
          <Reviews />
          <Book />
          <Faq />
          <Contact />
        </main>
        <footer className="px-5 py-10 text-[16px] md:px-10" style={{ background: INK, color: 'rgba(255,255,255,.75)' }}>
          <div className="mx-auto flex max-w-[1200px] flex-wrap justify-between gap-4"><span>© 2026 {b.name} · Концепт сайта — Артём</span><span>{b.addr}, {b.city}</span></div>
        </footer>
        <CallBar phone={b.phone} barCls="bg-[#f6f1fb]/95 backdrop-blur border-t border-[#2d2846]/10" callCls="rounded-full bg-white text-[#2d2846] text-[18px] border-2 border-[#2d2846]/15" bookCls="rounded-full bg-[#5b47c9] text-white text-[18px]" />
        <div className="h-[76px] sm:hidden" style={{ background: INK }} />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
