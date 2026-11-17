import React, { useRef, useState, useEffect, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useMotionValueEvent, useInView, useTransform, AnimatePresence, MotionConfig } from 'framer-motion'
import { ArrowRight, ArrowUpRight, Phone, Star, Copy, Check, Share2, Car, Bus, MapPin, Plus, Navigation } from 'lucide-react'
import '../lib/base.css'
import { useSmooth, Ribbon, Reveal, useBooking, phoneFocus, CheckDraw, MapFrame, CallBar, tel, useLite } from '../lib/kit'

const Bay = lazy(() => import('./daf93bay'))

const b = { name: 'Даф-93', addr: 'Алтайская ул., 1Б', area: 'район Ангарской', city: 'Минск', phone: '+375 29 383-95-12', rating: '4,5', rev: 124, oid: '24268674588' }
const FULL = 'Минск, Алтайская улица, 1Б'
const ROUTE = mode => `https://yandex.by/maps/?rtext=~${encodeURIComponent(FULL)}&rtt=${mode}`
const STEEL = '#0e1012', TXT = '#ece8e0', AMB = '#ffb347'
const F = "font-['Roboto_Flex',sans-serif]"
const MONO = "font-['IBM_Plex_Mono',monospace]"
const WIDE = { fontVariationSettings: "'wdth' 151, 'wght' 800" }
const WIDE6 = { fontVariationSettings: "'wdth' 130, 'wght' 650" }
const EZ = [0.65, 0, 0.35, 1]

function useSpy(ids) {
  const [a, setA] = useState('')
  useEffect(() => {
    const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && setA(e.target.id)), { rootMargin: '-45% 0px -50% 0px' })
    ids.forEach(id => { const el = document.getElementById(id); el && io.observe(el) })
    return () => io.disconnect()
  }, [])
  return a
}
function Tag({ children, className = '' }) {
  return <p className={`${MONO} text-[13px] uppercase tracking-[.14em] text-[#ffb347] ${className}`}>{children}</p>
}
function H2({ children, className = '' }) {
  return <h2 className={`text-[clamp(30px,4.6vw,64px)] uppercase leading-[0.95] tracking-[-0.01em] ${className}`} style={WIDE}>{children}</h2>
}

/* ---------------- header ---------------- */
const NAV = [['services', 'Услуги'], ['route', 'Как проехать'], ['how', 'Как работаем'], ['reviews', 'Рейтинг'], ['contact', 'Контакты']]
function Header({ active }) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0e1012]/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1360px] items-center justify-between gap-4 px-4 md:px-8">
        <a href="#top" className="flex items-baseline gap-2 text-[20px] uppercase" style={WIDE}>Даф<span className="text-[#ffb347]">-93</span></a>
        <nav className="hidden items-center gap-6 lg:flex" aria-label="Разделы">
          {NAV.map(([id, t]) => (
            <a key={id} href={'#' + id} aria-current={active === id ? 'true' : undefined} className={`relative py-2 text-[15px] transition-colors ${active === id ? 'text-[#ffb347]' : 'text-[#ece8e0]/75 hover:text-[#ece8e0]'}`}>
              {t}{active === id && <motion.span layoutId="dnav" className="absolute inset-x-0 -bottom-[1px] h-[2px] bg-[#ffb347]" />}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a href="#book" className="hidden h-10 items-center px-3 text-[15px] text-[#ece8e0]/80 hover:text-[#ece8e0] md:inline-flex">Заявка</a>
          <a href={'tel:' + tel(b.phone)} className="inline-flex h-10 items-center gap-2 bg-[#ffb347] px-4 text-[15px] font-bold text-[#0e1012] hover:bg-[#ffc56e]"><Phone size={16} /><span className="hidden sm:inline">{b.phone}</span><span className="sm:hidden">Позвонить</span></a>
        </div>
      </div>
    </header>
  )
}

/* ---------------- hero = pinned film ---------------- */
const NOTES = [
  ['01', 'Свет на деталях', 'Сначала разбираемся, что с машиной. Потом — ремонт, который вы согласовали.'],
  ['02', 'Инструмент под рукой', 'Диагностика, ходовая, тормоза, обслуживание — обычная работа мастерской.'],
  ['03', 'Характер мастерской', 'Спокойно и по делу. Работаем ли с вашей маркой — уточните по телефону.'],
]
function Hero() {
  const ref = useRef(null)
  const prog = useRef(0)
  const lite = useLite()
  const inView = useInView(ref, { margin: '100px' })
  const [ready, setReady] = useState(false)
  useEffect(() => { const t = setTimeout(() => setReady(true), 200); return () => clearTimeout(t) }, [])
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const [i, setI] = useState(-1)
  useMotionValueEvent(scrollYProgress, 'change', v => { prog.current = v; setI(v < 0.18 ? -1 : Math.min(2, Math.floor((v - 0.18) / 0.27))) })
  const heroO = useTransform(scrollYProgress, [0, 0.16], [1, 0])
  const heroY = useTransform(scrollYProgress, [0, 0.16], [0, -40])
  const frame = i + 2
  return (
    <section id="top" ref={ref} className="relative h-[300vh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="absolute inset-0">
          {ready && !lite && <Suspense fallback={null}><Bay prog={prog} active={inView} /></Suspense>}
          {lite && <div className="absolute inset-0" style={{ background: 'radial-gradient(40% 50% at 35% 40%,rgba(255,179,71,.35),transparent 70%),#0b0c0d' }} />}
        </div>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(180deg,rgba(11,12,13,.2) 0%,transparent 35%,rgba(11,12,13,.55) 70%,rgba(11,12,13,.92) 100%)' }} />
        {/* letterbox */}
        <div className="absolute inset-x-0 top-16 h-[4vh] bg-black" />
        <div className="absolute inset-x-0 bottom-0 flex h-[7vh] min-h-[44px] items-center justify-between bg-black px-4 md:px-8">
          <span className={`${MONO} text-[12px] uppercase tracking-[.14em] text-[#ece8e0]/60`}>Кадр 0{frame} / 04</span>
          <a href="#services" className={`${MONO} text-[13px] uppercase tracking-[.1em] text-[#ece8e0]/80 hover:text-[#ffb347]`}>Пропустить →</a>
        </div>
        <motion.div style={{ opacity: heroO, y: heroY }} className="absolute inset-x-0 bottom-[calc(7vh+28px)] mx-auto max-w-[1360px] px-4 md:bottom-[calc(7vh+48px)] md:px-8">
          <Tag>Автосервис · {b.addr} · {b.area}</Tag>
          <h1 className="mt-4 text-[clamp(38px,7.4vw,118px)] uppercase leading-[0.9]" style={WIDE}>
            <span className="block overflow-hidden"><motion.span className="block" initial={{ y: '100%' }} animate={{ y: 0 }} transition={{ duration: 1.1, ease: EZ }}>Автосервис</motion.span></span>
            <span className="block overflow-hidden"><motion.span className="block text-[#ffb347]" initial={{ y: '100%' }} animate={{ y: 0 }} transition={{ duration: 1.1, ease: EZ, delay: 0.1 }}>на Алтайской</motion.span></span>
          </h1>
          <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,520px)_auto] md:items-end md:justify-between">
            <div>
              <p className="text-[18px] leading-[1.5] text-[#ece8e0]/85">Ремонт, диагностика и обслуживание автомобилей. «Даф-93» — {b.addr}, {b.area}, Минск.</p>
              <a href="#reviews" className="mt-4 inline-flex items-center gap-3 text-[16px]"><span className="flex text-[#ffb347]">{Array.from({ length: 5 }).map((_, k) => <Star key={k} size={16} fill={k < 4 ? 'currentColor' : 'none'} strokeWidth={k < 4 ? 0 : 1.5} />)}</span><b>{b.rating}</b><span className="text-[#ece8e0]/75">· {b.rev} оценки на Яндекс Картах</span></a>
            </div>
            <div className="flex flex-wrap gap-3">
              <a href={'tel:' + tel(b.phone)} className="inline-flex h-14 items-center gap-2 bg-[#ffb347] px-6 text-[17px] font-bold text-[#0e1012] hover:bg-[#ffc56e]"><Phone size={18} />Позвонить</a>
              <a href="#route" className="inline-flex h-14 items-center gap-2 border border-[#ece8e0]/40 px-5 text-[17px] font-semibold hover:border-[#ffb347] hover:text-[#ffb347]"><Navigation size={18} />Как проехать</a>
              <a href="#book" className="inline-flex h-14 items-center px-3 text-[16px] text-[#ece8e0]/80 underline underline-offset-4 hover:text-[#ece8e0]">Оставить заявку</a>
            </div>
          </div>
        </motion.div>
        <div className="absolute bottom-[calc(7vh+24px)] left-4 right-4 md:bottom-[calc(7vh+48px)] md:left-auto md:right-8 md:w-[400px]">
          <AnimatePresence mode="wait">
            {i >= 0 && (
              <motion.div key={i} initial={{ opacity: 0, y: 24, clipPath: 'inset(0 0 100% 0)' }} animate={{ opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)' }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.6, ease: EZ }}
                className="border-l-2 border-[#ffb347] bg-[#0e1012]/80 p-5 backdrop-blur md:p-6">
                <Tag>Заметка {NOTES[i][0]}</Tag>
                <h2 className="mt-2 text-[26px] uppercase leading-[1] md:text-[30px]" style={WIDE}>{NOTES[i][1]}</h2>
                <p className="mt-3 text-[16px] leading-[1.5] text-[#ece8e0]/80">{NOTES[i][2]}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

/* ---------------- services ---------------- */
const SV = [
  ['Диагностика', 'Компьютерная и на подъёмнике: найдём причину, прежде чем менять детали.'],
  ['Ходовая и подвеска', 'Стуки, люфты, увод — рычаги, стойки, сайлентблоки.'],
  ['Тормозная система', 'Колодки, диски, суппорты, тормозная жидкость.'],
  ['Техобслуживание', 'Масло, фильтры, расходники по регламенту.'],
  ['Ремонт двигателя', 'От навесного оборудования до серьёзного ремонта — по результатам диагностики.'],
  ['Электрика', 'Проводка, датчики, запуск, освещение.'],
  ['Слесарные работы', 'Другие задачи — опишите по телефону, подскажем.'],
]
function Services() {
  return (
    <section id="services" className="scroll-mt-16 px-4 py-24 md:px-8 md:py-32">
      <div className="mx-auto max-w-[1360px]">
        <div className="grid gap-6 md:grid-cols-[1fr_420px] md:items-end">
          <div><Tag>Работы</Tag><H2 className="mt-4">Что делаем</H2></div>
          <p className="text-[17px] leading-[1.5] text-[#ece8e0]/70">Стоимость и сроки зависят от машины — мастер назовёт их после осмотра. <span className="text-[#ece8e0]">Уточните по телефону, работаем ли с вашей маркой.</span></p>
        </div>
        <ul className="mt-14 border-t border-white/15">
          {SV.map(([t, d], n) => (
            <Reveal as="li" key={t} delay={n * 0.03}>
              <a href="#book" data-svc={t} className="group relative grid grid-cols-[44px_1fr] items-baseline gap-x-4 gap-y-2 overflow-hidden border-b border-white/15 py-6 md:grid-cols-[80px_1.1fr_1fr_180px] md:py-8">
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-[#ffb347]/0 via-[#ffb347]/10 to-[#ffb347]/0 transition-transform duration-700 group-hover:translate-x-full" />
                <span className={`${MONO} text-[14px] text-[#ffb347]`}>{String(n + 1).padStart(2, '0')}</span>
                <span className="text-[clamp(22px,2.6vw,36px)] uppercase leading-[1] transition-colors group-hover:text-[#ffb347]" style={WIDE6}>{t}</span>
                <span className="col-start-2 text-[16px] leading-[1.5] text-[#ece8e0]/70 md:col-start-auto">{d}</span>
                <span className="col-start-2 inline-flex items-center gap-2 text-[15px] font-semibold md:col-start-auto md:justify-self-end">Записаться <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></span>
              </a>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ---------------- value: how to get here ---------------- */
const MODES = {
  auto: { I: Car, t: 'На машине', rtt: 'auto', steps: [
    ['Постройте маршрут', 'Кнопка «Маршрут в Яндекс Картах» — навигатор поведёт до адреса.'],
    ['Ориентир — район Ангарской', 'Мастерская в районе улицы Ангарской.'],
    ['Заезд с Алтайской', 'Едете по Алтайской улице и ищете дом 1Б.'],
    ['Не видите въезд — позвоните', 'Подскажем по телефону, куда заезжать.'],
  ] },
  mt: { I: Bus, t: 'Транспорт', rtt: 'mt', steps: [
    ['Маршрут на транспорте', 'Яндекс Карты подберут транспорт и ближайшую остановку.'],
    ['Выйдите у Алтайской', 'Ориентируйтесь на район улицы Ангарской.'],
    ['Найдите дом 1Б', 'Алтайская улица, 1Б — это наш адрес.'],
    ['Позвоните, если что', 'Объясним, как пройти от остановки.'],
  ] },
  taxi: { I: MapPin, t: 'Такси', rtt: 'auto', steps: [
    ['Скопируйте адрес', 'Минск, Алтайская улица, 1Б — вставьте в приложение такси.'],
    ['Подсказка водителю', 'Район улицы Ангарской, заезд с Алтайской.'],
    ['На месте', 'Ищите автосервис «Даф-93» по адресу 1Б.'],
    ['Позвоните, если что', 'Встретим и подскажем по телефону.'],
  ] },
}
function Route() {
  const [m, setM] = useState('auto')
  const [s, setS] = useState(0)
  const [copied, setCopied] = useState(false)
  const M = MODES[m]
  const copy = async () => { try { await navigator.clipboard.writeText(FULL); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch (e) {} }
  const share = async () => { if (navigator.share) { try { await navigator.share({ title: 'Даф-93', text: `Автосервис «Даф-93»: ${FULL}, ${b.phone}`, url: ROUTE('auto') }) } catch (e) {} } else copy() }
  return (
    <section id="route" className="scroll-mt-16 bg-[#16191c] px-4 py-24 md:px-8 md:py-32">
      <div className="mx-auto max-w-[1360px]">
        <Tag>Без сайта нас легко потерять — поэтому вот</Tag>
        <H2 className="mt-4">Как к нам проехать</H2>
        <div className="mt-12 grid gap-px overflow-hidden border border-white/10 bg-white/10 lg:grid-cols-[1fr_520px]">
          <div className="bg-[#16191c] p-5 md:p-8">
            <div className="grid grid-cols-3 gap-px bg-white/10" role="tablist" aria-label="Способ">
              {Object.entries(MODES).map(([k, v]) => (
                <button key={k} type="button" role="tab" aria-selected={m === k} onClick={() => { setM(k); setS(0) }}
                  className={`flex h-14 items-center justify-center gap-2 text-[15px] font-semibold transition-colors ${m === k ? 'bg-[#ffb347] text-[#0e1012]' : 'bg-[#16191c] hover:bg-[#1e2226]'}`}><v.I size={18} />{v.t}</button>
              ))}
            </div>
            <ol className="relative mt-8">
              <span aria-hidden="true" className="absolute bottom-6 left-[19px] top-6 w-px bg-white/15" />
              <motion.span aria-hidden="true" className="absolute left-[19px] top-6 w-[2px] -translate-x-[0.5px] bg-[#ffb347]" animate={{ height: `calc(${(s / 3) * 100}% - ${(s / 3) * 48}px)` }} transition={{ duration: 0.5, ease: EZ }} />
              {M.steps.map(([t, d], n) => (
                <li key={m + n}>
                  <button type="button" onClick={() => setS(n)} aria-current={s === n ? 'step' : undefined} className="relative flex w-full gap-5 py-3 text-left">
                    <span className={`${MONO} relative z-10 grid h-10 w-10 shrink-0 place-items-center border text-[14px] transition-colors ${n <= s ? 'border-[#ffb347] bg-[#ffb347] text-[#0e1012]' : 'border-white/25 bg-[#16191c]'}`}>{n + 1}</span>
                    <span className="pt-1.5">
                      <span className={`block text-[19px] font-semibold transition-colors ${s === n ? 'text-[#ffb347]' : ''}`}>{t}</span>
                      <span className={`block text-[16px] leading-[1.5] transition-colors ${s === n ? 'text-[#ece8e0]/85' : 'text-[#ece8e0]/55'}`}>{d}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
          <div className="flex flex-col bg-[#0e1012] p-5 md:p-8">
            <p className={`${MONO} text-[13px] uppercase tracking-[.14em] text-[#ece8e0]/55`}>Адрес</p>
            <p className="mt-3 text-[clamp(30px,3.6vw,48px)] uppercase leading-[0.95]" style={WIDE}>Алтайская,<br /><span className="text-[#ffb347]">1Б</span></p>
            <p className="mt-3 text-[17px] text-[#ece8e0]/75">Минск · {b.area}</p>
            <div className="mt-8 grid gap-2">
              <a href={ROUTE(M.rtt)} target="_blank" rel="noopener" className="flex h-14 items-center justify-between bg-[#ffb347] px-5 text-[17px] font-bold text-[#0e1012] hover:bg-[#ffc56e]">Маршрут в Яндекс Картах <ArrowUpRight size={18} /></a>
              <a href={'tel:' + tel(b.phone)} className="flex h-14 items-center justify-between border border-white/25 px-5 text-[17px] font-semibold hover:border-[#ffb347]">Заблудились? Позвоните <Phone size={18} /></a>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={copy} className="flex h-12 items-center justify-center gap-2 border border-white/15 text-[15px] hover:border-white/40" aria-live="polite">{copied ? <><Check size={16} className="text-[#ffb347]" />Скопировано</> : <><Copy size={16} />Копировать адрес</>}</button>
                <button type="button" onClick={share} className="flex h-12 items-center justify-center gap-2 border border-white/15 text-[15px] hover:border-white/40"><Share2 size={16} />Отправить себе</button>
              </div>
            </div>
            <p className="mt-auto pt-8 text-[14px] leading-[1.5] text-[#ece8e0]/50">Часы работы уточняйте по телефону перед выездом.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- how we work ---------------- */
const HOW = [['Звонок', 'Расскажите, что с машиной, и договоримся о времени.'], ['Приезд', `${b.addr} — по инструкции выше.`], ['Осмотр', 'Мастер находит причину и называет объём работ и стоимость.'], ['Ремонт', 'Делаем то, что согласовали. Забираете машину.']]
function How() {
  return (
    <section id="how" className="scroll-mt-16 px-4 py-24 md:px-8 md:py-32">
      <div className="mx-auto max-w-[1360px]">
        <Tag>Порядок</Tag><H2 className="mt-4">Как работаем</H2>
        <ol className="mt-12 grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {HOW.map(([t, d], n) => (
            <Reveal as="li" key={t} delay={n * 0.08} className="group relative bg-[#0e1012] p-6 md:p-8">
              <span className="block text-[88px] leading-[0.8] text-[#ece8e0]/[.08] transition-colors group-hover:text-[#ffb347]/30" style={WIDE}>0{n + 1}</span>
              <h3 className="mt-6 text-[22px] uppercase" style={WIDE6}>{t}</h3>
              <p className="mt-2 text-[16px] leading-[1.5] text-[#ece8e0]/70">{d}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}

function Reviews() {
  return (
    <section id="reviews" className="scroll-mt-16 border-y border-white/10 px-4 py-20 md:px-8 md:py-28" style={{ background: 'radial-gradient(60% 120% at 20% 0%,rgba(255,179,71,.14),transparent 60%),#0e1012' }}>
      <div className="mx-auto grid max-w-[1360px] gap-10 md:grid-cols-[1fr_1fr_1fr] md:items-end">
        <div><Tag>Яндекс Карты</Tag><p className="mt-4 text-[clamp(96px,14vw,200px)] leading-[0.8]" style={WIDE}>{b.rating}</p></div>
        <div><p className="text-[clamp(56px,7vw,110px)] leading-[0.8] text-[#ffb347]" style={WIDE}>{b.rev}</p><p className="mt-3 text-[18px] text-[#ece8e0]/75">оценки от клиентов</p></div>
        <a href={`https://yandex.by/maps/org/${b.oid}/reviews/`} target="_blank" rel="noopener" className="group flex h-16 items-center justify-between border border-white/25 px-6 text-[17px] font-semibold hover:border-[#ffb347] hover:text-[#ffb347]">Читать отзывы <ArrowUpRight className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></a>
      </div>
    </section>
  )
}

const FAQ = [
  ['С какими машинами работаете?', 'Лучше уточнить по телефону: назовите марку и модель — сразу скажем, сможем ли помочь.'],
  ['Сколько займёт ремонт?', 'Зависит от неисправности и наличия запчастей. Мастер назовёт сроки после осмотра.'],
  ['Сколько стоит?', 'Стоимость называем после диагностики, до начала работ.'],
  ['Нужно ли записываться?', 'Лучше позвонить заранее — договоримся о времени, чтобы не ждать.'],
  ['Как оплатить?', 'Способы оплаты уточняйте по телефону.'],
  ['Как найти мастерскую?', 'Смотрите блок «Как к нам проехать» выше или постройте маршрут в Яндекс Картах. Не нашли — позвоните.'],
]
function Faq() {
  const [o, setO] = useState(0)
  return (
    <section id="faq" className="scroll-mt-16 px-4 py-24 md:px-8 md:py-32">
      <div className="mx-auto grid max-w-[1360px] gap-10 lg:grid-cols-[420px_1fr]">
        <div><Tag>Вопросы</Tag><H2 className="mt-4">Коротко</H2></div>
        <div className="border-t border-white/15">
          {FAQ.map(([q, a], n) => (
            <div key={q} className="border-b border-white/15">
              <h3><button type="button" aria-expanded={o === n} aria-controls={'df' + n} onClick={() => setO(o === n ? -1 : n)} className="flex w-full items-center justify-between gap-4 py-5 text-left text-[18px] font-semibold">{q}<Plus size={20} className={`shrink-0 text-[#ffb347] transition-transform ${o === n ? 'rotate-45' : ''}`} /></button></h3>
              <AnimatePresence initial={false}>{o === n && <motion.div id={'df' + n} initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden"><p className="pb-5 text-[16px] leading-[1.6] text-[#ece8e0]/70">{a}</p></motion.div>}</AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------- booking ---------------- */
const ISSUES = ['Диагностика', 'Стучит подвеска', 'Тормоза', 'ТО и масло', 'Горит ошибка', 'Двигатель', 'Электрика', 'Другое']
function Book() {
  const bk = useBooking()
  const [step, setStep] = useState(0)
  const [car, setCar] = useState('')
  const [err, setErr] = useState('')
  const next = e => {
    e.preventDefault()
    if (step === 0) { if (!bk.s.svc) return setErr('Выберите, что случилось'); setErr(''); return setStep(1) }
    bk.submit()
  }
  return (
    <section id="book" className="scroll-mt-16 bg-[#16191c] px-4 py-24 md:px-8 md:py-32">
      <div className="mx-auto grid max-w-[1360px] gap-12 lg:grid-cols-[1fr_640px]">
        <div>
          <Tag>Заявка</Tag><H2 className="mt-4">Перезвоним<br />и договоримся</H2>
          <p className="mt-6 max-w-[440px] text-[17px] leading-[1.5] text-[#ece8e0]/70">Быстрее всего — позвонить. Если неудобно говорить, оставьте заявку: мастер перезвонит сам.</p>
          <a href={'tel:' + tel(b.phone)} className="mt-6 inline-flex items-center gap-3 text-[clamp(24px,2.6vw,34px)] text-[#ffb347]" style={WIDE6}><Phone size={26} />{b.phone}</a>
        </div>
        <div className="border border-white/10 bg-[#0e1012] p-5 md:p-8">
          {bk.s.sent ? (
            <div role="status" className="py-8">
              <CheckDraw className="text-[#ffb347]" />
              <h3 className="mt-6 text-[30px] uppercase" style={WIDE}>Заявка принята</h3>
              <p className="mt-3 max-w-[440px] text-[16px] text-[#ece8e0]/70">Мастер перезвонит, уточнит детали и время. В готовом сайте заявка сразу придёт вам в Telegram.</p>
              <button type="button" onClick={() => { bk.reset(); setStep(0); setCar('') }} className="mt-6 text-[15px] text-[#ffb347] underline underline-offset-4">Новая заявка</button>
            </div>
          ) : (
            <form onSubmit={next} noValidate>
              <div className="flex items-center justify-between">
                <span className={`${MONO} text-[13px] uppercase tracking-[.14em] text-[#ece8e0]/60`}>Шаг {step + 1} / 2 · {step ? 'Контакты' : 'Что случилось'}</span>
                <span className="flex gap-1">{[0, 1].map(k => <span key={k} className={`h-[3px] w-10 transition-colors ${step >= k ? 'bg-[#ffb347]' : 'bg-white/15'}`} />)}</span>
              </div>
              <AnimatePresence mode="wait">
                <motion.div key={step} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }} className="mt-6 min-h-[250px]">
                  {step === 0 ? (
                    <>
                      <div className="grid grid-cols-2 gap-px bg-white/10 sm:grid-cols-4">
                        {[...ISSUES, ...(bk.s.svc && !ISSUES.includes(bk.s.svc) ? [bk.s.svc] : [])].map(q => (
                          <button key={q} type="button" aria-pressed={bk.s.svc === q} onClick={() => { bk.upd('svc', q); setErr('') }}
                            className={`min-h-14 px-3 py-3 text-[15px] font-semibold transition-colors ${bk.s.svc === q ? 'bg-[#ffb347] text-[#0e1012]' : 'bg-[#0e1012] hover:bg-[#1e2226]'}`}>{q}</button>
                        ))}
                      </div>
                      <label className="mt-6 block"><span className="text-[15px] text-[#ece8e0]/75">Марка и модель (необязательно)</span>
                        <input value={car} onChange={e => setCar(e.target.value)} placeholder="Например, Volkswagen Passat" className="mt-2 h-14 w-full border-b-2 border-white/20 bg-transparent text-[18px] outline-none placeholder:text-[#ece8e0]/30 focus:border-[#ffb347]" /></label>
                    </>
                  ) : (
                    <div className="space-y-5">
                      <p className="border-l-2 border-[#ffb347] pl-3 text-[15px] text-[#ece8e0]/80">{bk.s.svc}{car ? ' · ' + car : ''}</p>
                      <label className="block"><span className="text-[15px] text-[#ece8e0]/75">Имя</span>
                        <input value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} autoComplete="name" className="mt-2 h-14 w-full border-b-2 border-white/20 bg-transparent text-[18px] outline-none focus:border-[#ffb347]" /></label>
                      <label className="block"><span className="text-[15px] text-[#ece8e0]/75">Телефон *</span>
                        <input value={bk.s.phone} onChange={e => bk.upd('phone', e.target.value)} onFocus={phoneFocus(bk)} type="tel" inputMode="tel" autoComplete="tel" placeholder="+375 __ ___-__-__" aria-invalid={bk.s.err}
                          className={`mt-2 h-14 w-full border-b-2 bg-transparent text-[18px] outline-none placeholder:text-[#ece8e0]/30 focus:border-[#ffb347] ${bk.s.err ? 'border-[#ff6b5b]' : 'border-white/20'}`} /></label>
                      {bk.s.err && <p className="text-[15px] text-[#ff8a7d]">Проверьте номер: 12 цифр с кодом +375.</p>}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
              {err && <p role="alert" className="mb-3 text-[15px] text-[#ff8a7d]">{err}</p>}
              <div className="flex items-center justify-between border-t border-white/10 pt-5">
                {step ? <button type="button" onClick={() => setStep(0)} className="h-12 px-1 text-[15px] text-[#ece8e0]/75">← Назад</button> : <span />}
                <button type="submit" disabled={bk.s.loading} className="inline-flex h-14 items-center gap-3 bg-[#ffb347] px-6 text-[16px] font-bold text-[#0e1012] hover:bg-[#ffc56e] disabled:opacity-60">{step ? (bk.s.loading ? 'Отправляем…' : 'Отправить') : 'Дальше'} <ArrowRight size={18} /></button>
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
    <section id="contact" className="scroll-mt-16 px-4 py-24 md:px-8 md:py-32">
      <div className="mx-auto max-w-[1360px]">
        <Tag>Контакты</Tag><H2 className="mt-4">{b.addr}</H2>
        <div className="mt-10 grid gap-px bg-white/10 lg:grid-cols-[400px_1fr]">
          <div className="bg-[#0e1012] p-6 md:p-8">
            <dl className="space-y-6 text-[17px]">
              <div><dt className={`${MONO} text-[12px] uppercase tracking-[.14em] text-[#ece8e0]/50`}>Адрес</dt><dd className="mt-1">{b.addr}, {b.city}<br /><span className="text-[#ece8e0]/65">{b.area}</span></dd></div>
              <div><dt className={`${MONO} text-[12px] uppercase tracking-[.14em] text-[#ece8e0]/50`}>Телефон</dt><dd className="mt-1"><a href={'tel:' + tel(b.phone)} className="text-[24px] text-[#ffb347]" style={WIDE6}>{b.phone}</a></dd></div>
              <div><dt className={`${MONO} text-[12px] uppercase tracking-[.14em] text-[#ece8e0]/50`}>Часы работы</dt><dd className="mt-1">Уточняйте по телефону</dd></div>
            </dl>
            <a href={ROUTE('auto')} target="_blank" rel="noopener" className="mt-8 flex h-14 items-center justify-between bg-[#ffb347] px-5 text-[16px] font-bold text-[#0e1012]">Построить маршрут <ArrowUpRight size={18} /></a>
          </div>
          <div className="h-[380px] bg-[#0e1012] lg:h-auto lg:min-h-[480px]"><MapFrame oid={b.oid} dark /></div>
        </div>
      </div>
    </section>
  )
}

function App() {
  useSmooth()
  const active = useSpy(['services', 'route', 'how', 'reviews', 'faq', 'book', 'contact'])
  return (
    <MotionConfig reducedMotion="user">
      <div className={`relative overflow-x-clip ${F}`} style={{ background: STEEL, color: TXT, '--sel': AMB, '--selc': STEEL }}>
        <Ribbon name={b.name} bg={AMB} fg={STEEL} />
        <Header active={active} />
        <main>
          <Hero />
          <Services />
          <Route />
          <How />
          <Reviews />
          <Faq />
          <Book />
          <Contact />
        </main>
        <footer className="border-t border-white/10 px-4 py-8 md:px-8">
          <div className={`${MONO} mx-auto flex max-w-[1360px] flex-wrap justify-between gap-3 text-[13px] uppercase tracking-[.08em] text-[#ece8e0]/55`}>
            <span>© 2026 {b.name} · Концепт сайта — Артём</span>
            <span>{b.addr}, {b.city} · <a href={'tel:' + tel(b.phone)}>{b.phone}</a></span>
          </div>
        </footer>
        <CallBar phone={b.phone} barCls="bg-[#0e1012]/95 backdrop-blur border-t border-white/10" callCls="bg-[#ffb347] text-[#0e1012] text-[16px]" bookCls="border border-white/30 text-[#ece8e0] text-[16px]" />
        <div className="h-[76px] sm:hidden" />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
