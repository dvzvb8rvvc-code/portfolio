import React, { useRef, useState, useEffect, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useSpring, useInView, AnimatePresence, MotionConfig } from 'framer-motion'
import { ArrowRight, ArrowUpRight, Check, Plus, Minus, Phone, MapPin } from 'lucide-react'
import '../lib/base.css'
import { useSmooth, Ribbon, LineReveal, Reveal, useBooking, phoneFocus, CheckDraw, MapFrame, CallBar, tel, useLite } from '../lib/kit'

const GemScene = lazy(() => import('./almaz3d'))

const b = {
  name: 'СТО Алмаз', addr: 'ул. Масюковщина, 25Б', city: 'Минск',
  phone: '+375 29 624-84-32', rating: '5,0', rev: 97, oid: '35487245400',
}
const BG = '#f3f4f5', INK = '#1f2226', MUTE = '#646a71', ICE = '#9fd3ee', ICET = '#22719e'
const SERIF = "font-['Cormorant_Garamond',serif]", SANS = "font-['Jost',sans-serif]"
const NAV = [['services', 'Услуги'], ['check', 'Чек-лист'], ['how', 'Как мы работаем'], ['rating', 'Рейтинг'], ['contact', 'Контакты']]
const SWATCH = [['silver', 'Серебро', 'linear-gradient(135deg,#ffffff,#c9cfd5)'], ['graphite', 'Графит', 'linear-gradient(135deg,#7a7f86,#33363a)'], ['ice', 'Лёд', 'linear-gradient(135deg,#eef8fd,#9fd3ee)']]

function useActive(ids) {
  const [a, setA] = useState('')
  useEffect(() => {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) setA(e.target.id) }), { rootMargin: '-45% 0px -50% 0px' })
    ids.forEach(id => { const el = document.getElementById(id); if (el) io.observe(el) })
    return () => io.disconnect()
  }, [])
  return a
}

function Header() {
  const a = useActive(NAV.map(n => n[0]))
  return (
    <header className="sticky top-0 z-40 bg-[#f3f4f5]/85 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-6 px-6 md:px-12">
        <a href="#top" className="flex items-baseline gap-2">
          <span className={`${SERIF} text-[26px] font-light leading-none tracking-[0.02em]`}>Алмаз</span>
          <span className="text-[11px] uppercase tracking-[.28em] text-[#646a71]">СТО</span>
        </a>
        <nav className="hidden items-center gap-9 text-[14px] lg:flex" aria-label="Разделы">
          {NAV.map(([id, t]) => <a key={id} href={'#' + id} aria-current={a === id ? 'true' : undefined} className={`relative py-1 transition-colors ${a === id ? 'text-[#1f2226]' : 'text-[#646a71] hover:text-[#1f2226]'}`}>{t}{a === id && <motion.span layoutId="nav-dot" className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#22719e]" />}</a>)}
        </nav>
        <div className="flex items-center gap-6">
          <a href={'tel:' + tel(b.phone)} className="hidden text-[14px] text-[#1f2226] md:inline">{b.phone}</a>
          <a href="#book" className="inline-flex h-10 items-center rounded-full border border-[#1f2226] px-5 text-[14px] transition-colors hover:bg-[#1f2226] hover:text-white">Записаться</a>
        </div>
      </div>
      <div className="mx-6 h-px bg-[#1f2226]/10 md:mx-12" />
    </header>
  )
}

/* ---------------- hero + services in a sticky split around the diamond ---------------- */
const CHAP = [
  { n: 'I', k: 'Кондиционеры', h: 'Автокондиционеры', d: 'Чтобы в салоне снова было свежо и тихо.', items: [['Диагностика кондиционера', 'Проверим давление, работу компрессора и вентилятора.', 'около 30 мин'], ['Заправка кондиционера', 'Вакуумирование и заправка хладагентом.', 'около 1 часа'], ['Поиск и устранение утечек', 'Найдём, где уходит хладагент.', 'по осмотру'], ['Чистка от запаха', 'Обработка системы и замена салонного фильтра.', 'около 30–60 мин']] },
  { n: 'II', k: 'Шины', h: 'Шиномонтаж', d: 'Аккуратно, без царапин на дисках.', items: [['Сезонная переобувка', 'Смена колёс в сборе.', 'около 20–40 мин'], ['Шиномонтаж и балансировка', 'Перебортировка и балансировка комплекта.', 'около 40–60 мин'], ['Ремонт проколов', 'Латка или грибок, проверка давления.', 'около 20–40 мин']] },
  { n: 'III', k: 'Сервис', h: 'Ремонт и обслуживание', d: 'Спокойно объясним, что важно сейчас, а что подождёт.', items: [['Компьютерная диагностика', 'Чтение ошибок и понятное объяснение.', 'около 30 мин'], ['Замена масла и фильтров', 'Плановое ТО по регламенту вашего авто.', 'около 30–60 мин'], ['Ходовая и тормоза', 'Диагностика и ремонт подвески, колодки, диски.', 'по осмотру']] },
]
function LiteGem() {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <svg viewBox="0 0 200 180" className="h-[42%] w-auto drop-shadow-[0_30px_40px_rgba(31,34,38,.18)]" aria-hidden="true">
        <defs><linearGradient id="lg1" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#fff" /><stop offset="1" stopColor="#b9c1c8" /></linearGradient><linearGradient id="lg2" x1="1" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#eef6fb" /><stop offset="1" stopColor="#8e98a1" /></linearGradient></defs>
        <polygon points="40,10 160,10 195,55 100,175 5,55" fill="url(#lg1)" />
        <polygon points="40,10 70,55 5,55" fill="#dfe5ea" /><polygon points="160,10 130,55 195,55" fill="#c4ccd3" />
        <polygon points="70,55 130,55 100,175" fill="url(#lg2)" /><polygon points="5,55 70,55 100,175" fill="#d5dce2" /><polygon points="195,55 130,55 100,175" fill="#a9b3bb" />
        <polygon points="40,10 160,10 130,55 70,55" fill="#f7fafc" />
      </svg>
    </div>
  )
}
function SvRow({ it }) {
  const [t, d, time] = it
  return (
    <li className="grid gap-x-6 gap-y-1 border-t border-[#1f2226]/10 py-6 sm:grid-cols-[1fr_auto]">
      <div>
        <h4 className="text-[19px] font-medium">{t}</h4>
        <p className="mt-1 text-[16px] text-[#646a71]">{d}</p>
        <p className="mt-2 text-[13px] uppercase tracking-[.16em] text-[#646a71]">{time} · цена — уточнит мастер</p>
      </div>
      <a href="#book" data-svc={t} className="mt-3 inline-flex h-11 items-center gap-2 self-center justify-self-start rounded-full px-1 text-[15px] text-[#22719e] hover:underline sm:mt-0 sm:justify-self-end">Записаться <ArrowRight size={15} /></a>
    </li>
  )
}
function Chapter({ c, onView }) {
  const ref = useRef(null)
  const inView = useInView(ref, { margin: '-45% 0px -45% 0px' })
  useEffect(() => { if (inView) onView(c.n) }, [inView])
  return (
    <div ref={ref} id={c.n === 'I' ? 'services' : undefined} className="scroll-mt-20 py-20 md:py-28">
      <p className="text-[12px] uppercase tracking-[.3em] text-[#646a71]">Глава {c.n}</p>
      <h3 className={`${SERIF} mt-5 text-[clamp(44px,5vw,76px)] font-light leading-[1] tracking-[-0.01em]`}>{c.h}</h3>
      <p className="mt-4 max-w-[440px] text-[18px] text-[#646a71]">{c.d}</p>
      <ul className="mt-10">{c.items.map(it => <SvRow key={it[0]} it={it} />)}</ul>
    </div>
  )
}
function Split({ lite }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const p = useSpring(scrollYProgress, { stiffness: 50, damping: 20 })
  const near = useInView(ref, { margin: '200px 0px' })
  const [mounted, setMounted] = useState(false)
  useEffect(() => { if (near) setMounted(true) }, [near])
  const [finish, setFinish] = useState('silver')
  const [chap, setChap] = useState('')
  const cur = CHAP.find(c => c.n === chap)
  return (
    <section ref={ref} id="top" className="relative mx-auto grid max-w-[1400px] md:grid-cols-[1fr_1fr]">
      <div className="relative order-2 h-[44svh] md:order-1 md:sticky md:top-16 md:h-[calc(100svh-64px)]">
        <div className="absolute inset-0">
          {lite ? <LiteGem /> : mounted && <Suspense fallback={<LiteGem />}><GemScene progress={p} active={near} finish={finish} /></Suspense>}
        </div>
        <div className="absolute inset-x-6 bottom-6 flex items-end justify-between gap-4 md:inset-x-12 md:bottom-10">
          <div className="min-h-[40px]" aria-live="polite">
            <AnimatePresence mode="wait">
              {cur && <motion.p key={cur.n} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="hidden text-[13px] uppercase tracking-[.24em] text-[#646a71] md:block"><span className="text-[#22719e]">{cur.n}</span> / III · {cur.k}</motion.p>}
            </AnimatePresence>
          </div>
          <div className="flex items-center gap-3" role="radiogroup" aria-label="Отделка">
            {SWATCH.map(([k, t, bg]) => (
              <button key={k} type="button" role="radio" aria-checked={finish === k} aria-label={t} title={t} onClick={() => setFinish(k)}
                className={`grid h-11 w-11 place-items-center rounded-full transition-shadow ${finish === k ? 'ring-1 ring-[#1f2226]' : 'hover:ring-1 hover:ring-[#1f2226]/30'}`}>
                <span className="h-7 w-7 rounded-full shadow-[inset_0_1px_2px_rgba(0,0,0,.15)]" style={{ background: bg }} />
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="order-1 px-6 md:order-2 md:px-12">
        <div className="flex min-h-[auto] flex-col justify-center pb-10 pt-14 md:min-h-[calc(100svh-64px)] md:py-0">
          <p className="flex items-center gap-2 text-[13px] uppercase tracking-[.26em] text-[#646a71]"><MapPin size={14} aria-hidden="true" />{b.addr} · {b.city}</p>
          <h1 className={`${SERIF} mt-7 text-[clamp(46px,6.4vw,98px)] font-light leading-[.98] tracking-[-0.015em]`}>
            <LineReveal delay={0.1}>Автосервис</LineReveal>
            <LineReveal delay={0.2}>на Масюковщине.</LineReveal>
          </h1>
          <p className="mt-6 max-w-[460px] text-[18px] leading-relaxed text-[#646a71]">Автокондиционеры, шиномонтаж и ремонт — без суеты и лишних слов.</p>
          <a href="#rating" className="mt-8 inline-flex items-baseline gap-3 self-start">
            <span className={`${SERIF} text-[44px] font-light leading-none`}>{b.rating}</span>
            <span className="text-[15px] text-[#646a71]">· {b.rev} оценок на Яндекс Картах</span>
          </a>
          <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
            <a href="#book" className="inline-flex h-[52px] items-center gap-2 rounded-full bg-[#1f2226] px-8 text-[16px] text-white transition-colors hover:bg-black">Записаться <ArrowRight size={16} /></a>
            <a href={'tel:' + tel(b.phone)} className="inline-flex items-center gap-2 text-[17px] text-[#1f2226] hover:text-[#22719e]"><Phone size={16} aria-hidden="true" />{b.phone}</a>
          </div>
        </div>
        {CHAP.map(c => <Chapter key={c.n} c={c} onView={setChap} />)}
      </div>
    </section>
  )
}

/* ---------------- pre-trip checklist (value interaction) ---------------- */
const LIST = [
  { k: 'ac', t: 'Кондиционер', q: 'Холодит быстро, из дефлекторов нет запаха', h: 'Включите на максимум: через пару минут воздух должен стать заметно холоднее. Неприятный запах — повод для чистки.', svc: 'кондиционер' },
  { k: 'ty', t: 'Шины', q: 'Давление в норме, протектор не стёрт, нет порезов', h: 'Нужное давление указано на стойке водительской двери или на лючке бака. Протектор сравните с индикаторами износа в канавках.', svc: 'шины' },
  { k: 'br', t: 'Тормоза', q: 'Нет скрипа, педаль не проваливается, авто не уводит', h: 'На пустой площадке плавно затормозите: машина должна останавливаться ровно, без вибрации руля.', svc: 'тормоза' },
  { k: 'li', t: 'Свет', q: 'Фары, стоп-сигналы и поворотники работают', h: 'Попросите кого-нибудь посмотреть сзади или проверьте отражение в витрине вечером.', svc: 'свет' },
  { k: 'fl', t: 'Жидкости', q: 'Масло, антифриз, тормозная, омывайка — между min и max', h: 'Проверяйте на холодном двигателе, на ровной площадке. Если уровень быстро падает — стоит показать мастеру.', svc: 'жидкости' },
  { k: 'ba', t: 'Аккумулятор', q: 'Заводится уверенно, клеммы без налёта', h: 'Медленный запуск стартера, особенно в холод, — первый признак уставшего аккумулятора.', svc: 'аккумулятор' },
]
function CheckItem({ it, on, open, onToggle, onOpen }) {
  return (
    <li className="border-t border-[#1f2226]/10">
      <div className="flex items-start gap-5 py-6">
        <button type="button" role="checkbox" aria-checked={on} onClick={onToggle} aria-label={`${it.t}: ${on ? 'в порядке' : 'не проверено'}`}
          className={`mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-colors ${on ? 'border-[#1f2226] bg-[#1f2226] text-white' : 'border-[#1f2226]/30 hover:border-[#1f2226]'}`}>
          <AnimatePresence>{on && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Check size={16} strokeWidth={2} /></motion.span>}</AnimatePresence>
        </button>
        <div className="min-w-0 flex-1">
          <button type="button" onClick={onToggle} className="text-left">
            <span className={`${SERIF} block text-[30px] font-light leading-tight transition-colors ${on ? 'text-[#646a71] line-through decoration-1' : ''}`}>{it.t}</span>
            <span className="mt-1 block text-[16px] text-[#646a71]">{it.q}</span>
          </button>
          <button type="button" onClick={onOpen} aria-expanded={open} className="mt-2 inline-flex min-h-[40px] items-center gap-1.5 text-[14px] text-[#22719e] hover:underline">{open ? <Minus size={14} /> : <Plus size={14} />}Как проверить самому</button>
          <AnimatePresence initial={false}>{open && <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="max-w-[520px] overflow-hidden text-[15.5px] leading-relaxed text-[#646a71]">{it.h}</motion.p>}</AnimatePresence>
        </div>
      </div>
    </li>
  )
}
function Checklist() {
  const [ok, setOk] = useState({})
  const [open, setOpen] = useState('')
  const left = LIST.filter(i => !ok[i.k])
  const done = LIST.length - left.length
  const R = 44, Cc = 2 * Math.PI * R
  const svc = 'Проверка перед поездкой: ' + left.map(i => i.svc).join(', ')
  return (
    <section id="check" className="scroll-mt-16 bg-white px-6 py-24 md:px-12 md:py-36">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid gap-8 md:grid-cols-2 md:items-end">
          <div>
            <p className="text-[12px] uppercase tracking-[.3em] text-[#646a71]">Перед дорогой</p>
            <h2 className={`${SERIF} mt-5 text-[clamp(44px,5.6vw,88px)] font-light leading-[1] tracking-[-0.01em]`}>Чек-лист<br /><em>перед поездкой.</em></h2>
          </div>
          <p className="max-w-[440px] text-[18px] leading-relaxed text-[#646a71] md:justify-self-end">Отметьте, что уже в порядке. Всё, что осталось, превратится в список для проверки на СТО — запишетесь одним нажатием.</p>
        </div>
        <div className="mt-16 grid gap-12 lg:grid-cols-[1.25fr_.75fr]">
          <ul className="border-b border-[#1f2226]/10">
            {LIST.map(it => <CheckItem key={it.k} it={it} on={!!ok[it.k]} open={open === it.k} onToggle={() => setOk(o => ({ ...o, [it.k]: !o[it.k] }))} onOpen={() => setOpen(open === it.k ? '' : it.k)} />)}
          </ul>
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-[2px] bg-[#f3f4f5] p-8 md:p-10">
              <div className="flex items-center gap-6">
                <svg viewBox="0 0 100 100" className="h-24 w-24 -rotate-90" aria-hidden="true">
                  <circle cx="50" cy="50" r={R} fill="none" stroke="#1f2226" strokeOpacity=".1" strokeWidth="2" />
                  <motion.circle cx="50" cy="50" r={R} fill="none" stroke={ICE} strokeWidth="3" strokeLinecap="round" strokeDasharray={Cc} animate={{ strokeDashoffset: Cc * (1 - done / LIST.length) }} transition={{ duration: 0.6, ease: [0.2, 0, 0, 1] }} />
                </svg>
                <div><p className={`${SERIF} text-[48px] font-light leading-none`}>{done}<span className="text-[#646a71]">/{LIST.length}</span></p><p className="mt-1 text-[14px] text-[#646a71]">в порядке</p></div>
              </div>
              <p className="mt-10 text-[12px] uppercase tracking-[.28em] text-[#646a71]">Проверить на СТО</p>
              <ul className="mt-4 min-h-[60px]" aria-live="polite">
                <AnimatePresence initial={false}>
                  {left.map(i => <motion.li key={i.k} layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden"><span className="flex items-center gap-3 border-b border-[#1f2226]/10 py-3 text-[17px]"><span className="h-1.5 w-1.5 rounded-full bg-[#22719e]" />{i.t}</span></motion.li>)}
                </AnimatePresence>
                {!left.length && <li className={`${SERIF} py-3 text-[26px] font-light`}>Всё в порядке. Хорошей дороги.</li>}
              </ul>
              {left.length ? (
                <a href="#book" data-svc={svc} className="mt-8 flex h-[52px] items-center justify-center gap-2 rounded-full bg-[#1f2226] px-6 text-[16px] text-white hover:bg-black">Записаться на проверку · {left.length}</a>
              ) : (
                <a href="#book" data-svc="Осмотр перед поездкой" className="mt-8 flex h-[52px] items-center justify-center gap-2 rounded-full border border-[#1f2226] px-6 text-[16px] hover:bg-[#1f2226] hover:text-white">Всё равно показать мастеру</a>
              )}
              <p className="mt-4 text-[13px] leading-relaxed text-[#646a71]">Это памятка для самопроверки, а не диагностика. Точное состояние покажет только осмотр.</p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}

/* ---------------- how ---------------- */
const STEPS = [['Запись', 'Онлайн или по телефону. Подберём удобное время.'], ['Приезд', `${b.addr}. Встретим и выслушаем.`], ['Осмотр', 'Мастер покажет, что нашёл, и назовёт стоимость до начала работ.'], ['Готово', 'Расскажем, что сделано, и вернём ключи.']]
function How() {
  return (
    <section id="how" className="scroll-mt-16 px-6 py-24 md:px-12 md:py-36">
      <div className="mx-auto max-w-[1400px]">
        <p className="text-[12px] uppercase tracking-[.3em] text-[#646a71]">Как мы работаем</p>
        <h2 className={`${SERIF} mt-5 text-[clamp(44px,5.6vw,88px)] font-light leading-[1]`}>Четыре спокойных шага.</h2>
        <ol className="mt-16 grid gap-12 md:grid-cols-4 md:gap-8">
          {STEPS.map(([h, d], i) => (
            <Reveal as="li" key={h} delay={i * 0.08}>
              <div className="flex items-center gap-4"><span className={`${SERIF} text-[22px] font-light text-[#22719e]`}>0{i + 1}</span><span className="h-px flex-1 bg-[#1f2226]/15" /></div>
              <h3 className={`${SERIF} mt-6 text-[34px] font-light`}>{h}</h3>
              <p className="mt-2 text-[16px] leading-relaxed text-[#646a71]">{d}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}

function Rating() {
  return (
    <section id="rating" className="scroll-mt-16 bg-gradient-to-b from-[#e9ecef] to-[#f3f4f5] px-6 py-28 md:px-12 md:py-44">
      <div className="mx-auto max-w-[1000px] text-center">
        <p className="text-[12px] uppercase tracking-[.3em] text-[#646a71]">Яндекс Карты</p>
        <Reveal><p className={`${SERIF} mt-6 text-[clamp(140px,22vw,300px)] font-light leading-[.8] tracking-[-0.02em]`}>{b.rating}</p></Reveal>
        <div className="mx-auto mt-8 h-px w-16 bg-[#22719e]" />
        <p className="mt-8 text-[20px] text-[#1f2226]">{b.rating} · {b.rev} оценок</p>
        <p className="mt-2 text-[16px] text-[#646a71]">Средняя оценка клиентов на Яндекс Картах.</p>
        <a href={`https://yandex.ru/maps/org/${b.oid}/reviews/`} target="_blank" rel="noopener" className="mt-8 inline-flex min-h-[44px] items-center gap-1.5 text-[16px] text-[#22719e] hover:underline">Читать отзывы <ArrowUpRight size={16} /></a>
      </div>
    </section>
  )
}

const FAQ = [
  ['Как понять, что кондиционеру нужна заправка?', 'Воздух охлаждается слабо или долго, компрессор включается часто. Точно скажет диагностика — она покажет, есть ли утечка.'],
  ['Сколько занимает заправка кондиционера?', 'Обычно около часа вместе с проверкой системы. Если нужно искать утечку — дольше, мастер предупредит заранее.'],
  ['Нужно ли записываться заранее?', 'Лучше записаться: так вам не придётся ждать. Можно позвонить и в день визита — подскажем ближайшее время.'],
  ['Можно подождать, пока делают машину?', 'Уточните при записи — подскажем, сколько займёт работа и удобно ли ждать на месте.'],
  ['Как оплатить?', 'Способы оплаты уточняйте по телефону.'],
  ['Назовёте цену заранее?', 'Да, после осмотра мастер назовёт стоимость, и работы начинаются только после вашего согласия.'],
]
function Faq() {
  const [o, setO] = useState(-1)
  return (
    <section id="faq" className="px-6 py-24 md:px-12 md:py-36">
      <div className="mx-auto grid max-w-[1400px] gap-12 md:grid-cols-[.8fr_1.2fr]">
        <h2 className={`${SERIF} text-[clamp(44px,5.6vw,88px)] font-light leading-[1]`}>Вопросы.</h2>
        <div className="border-t border-[#1f2226]/15">
          {FAQ.map(([q, a], i) => (
            <div key={q} className="border-b border-[#1f2226]/15">
              <h3><button type="button" onClick={() => setO(o === i ? -1 : i)} aria-expanded={o === i} aria-controls={'aq' + i} className="flex w-full items-center justify-between gap-6 py-7 text-left text-[19px] md:text-[21px]">{q}<span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#1f2226]/20 transition-transform duration-300 ${o === i ? 'rotate-45' : ''}`}><Plus size={16} /></span></button></h3>
              <AnimatePresence initial={false}>{o === i && <motion.div id={'aq' + i} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: [0.2, 0, 0, 1] }} className="overflow-hidden"><p className="max-w-[640px] pb-7 text-[17px] leading-relaxed text-[#646a71]">{a}</p></motion.div>}</AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------- booking ---------------- */
const BSV = ['Кондиционер', 'Шиномонтаж', 'Диагностика', 'Ремонт и ТО', 'Проверка перед поездкой']
const DAYS = ['Сегодня', 'Завтра', 'На этой неделе', 'Подберите сами']
const TIMES = ['Утро', 'День', 'Вечер']
function Pill({ on, children, ...r }) {
  return <button type="button" aria-pressed={on} className={`min-h-[48px] rounded-full border px-5 text-left text-[16px] transition-colors ${on ? 'border-[#1f2226] bg-[#1f2226] text-white' : 'border-[#1f2226]/20 hover:border-[#1f2226]'}`} {...r}>{children}</button>
}
function Book() {
  const bk = useBooking()
  const [step, setStep] = useState(0)
  const [day, setDay] = useState(''), [time, setTime] = useState('')
  const [err, setErr] = useState('')
  const head = useRef(null)
  useEffect(() => { if (step) head.current?.focus() }, [step])
  const next = e => {
    e.preventDefault()
    if (step === 0 && !bk.s.svc) return setErr('Выберите услугу')
    if (step === 1 && !day) return setErr('Выберите день')
    setErr('')
    if (step < 2) setStep(step + 1); else bk.submit()
  }
  const custom = bk.s.svc && !BSV.includes(bk.s.svc)
  return (
    <section id="book" className="scroll-mt-16 bg-white px-6 py-24 md:px-12 md:py-36">
      <div className="mx-auto grid max-w-[1400px] gap-14 lg:grid-cols-[.8fr_1.2fr]">
        <div>
          <p className="text-[12px] uppercase tracking-[.3em] text-[#646a71]">Запись</p>
          <h2 className={`${SERIF} mt-5 text-[clamp(44px,5.6vw,88px)] font-light leading-[1]`}>Выберите<br /><em>удобное время.</em></h2>
          <p className="mt-6 max-w-[380px] text-[17px] text-[#646a71]">Мастер перезвонит и подтвердит запись. Или позвоните сами:</p>
          <a href={'tel:' + tel(b.phone)} className={`${SERIF} mt-2 inline-block text-[34px] font-light hover:text-[#22719e]`}>{b.phone}</a>
        </div>
        <div className="border-t border-[#1f2226] pt-8">
          {bk.s.sent ? (
            <div className="py-8" role="status">
              <CheckDraw className="text-[#22719e]" size={64} />
              <p className={`${SERIF} mt-6 text-[44px] font-light leading-tight`}>Спасибо. Заявка принята.</p>
              <p className="mt-3 max-w-[480px] text-[17px] text-[#646a71]">{bk.s.svc} · {day}{time ? ', ' + time.toLowerCase() : ''}. Мастер перезвонит и подтвердит время. В готовом сайте заявка сразу придёт вам в Telegram.</p>
              <button type="button" onClick={() => { bk.reset(); setStep(0); setDay(''); setTime('') }} className="mt-8 min-h-[44px] text-[15px] text-[#22719e] hover:underline">Новая заявка</button>
            </div>
          ) : (
            <form onSubmit={next} noValidate>
              <div className="flex items-center gap-4 text-[13px] uppercase tracking-[.2em]" aria-hidden="true">
                {['Услуга', 'Время', 'Контакты'].map((t, i) => <span key={t} className={i === step ? 'text-[#1f2226]' : i < step ? 'text-[#22719e]' : 'text-[#646a71]/60'}>{i + 1}. {t}</span>)}
              </div>
              <h3 ref={head} tabIndex={-1} className={`${SERIF} mt-8 text-[36px] font-light outline-none`}>{['Что нужно сделать?', 'Когда вам удобно?', 'Как с вами связаться?'][step]}</h3>
              <AnimatePresence mode="wait">
                <motion.div key={step} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="mt-7">
                  {step === 0 && <div className="flex flex-wrap gap-2.5">{custom && <Pill on>{bk.s.svc}</Pill>}{BSV.map(s => <Pill key={s} on={bk.s.svc === s} onClick={() => { bk.upd('svc', s); setErr('') }}>{s}</Pill>)}</div>}
                  {step === 1 && <>
                    <div className="flex flex-wrap gap-2.5">{DAYS.map(d => <Pill key={d} on={day === d} onClick={() => { setDay(d); setErr('') }}>{d}</Pill>)}</div>
                    <p className="mb-3 mt-7 text-[14px] text-[#646a71]">Время (необязательно)</p>
                    <div className="flex flex-wrap gap-2.5">{TIMES.map(x => <Pill key={x} on={time === x} onClick={() => setTime(time === x ? '' : x)}>{x}</Pill>)}</div>
                  </>}
                  {step === 2 && <div className="grid gap-6 sm:grid-cols-2">
                    <div><label htmlFor="al-name" className="text-[14px] text-[#646a71]">Имя</label><input id="al-name" value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} autoComplete="name" className="mt-2 h-14 w-full border-b border-[#1f2226]/25 bg-transparent text-[18px] outline-none focus:border-[#22719e]" /></div>
                    <div><label htmlFor="al-phone" className="text-[14px] text-[#646a71]">Телефон</label><input id="al-phone" value={bk.s.phone} onChange={e => bk.upd('phone', e.target.value)} onFocus={phoneFocus(bk)} type="tel" inputMode="tel" autoComplete="tel" placeholder="+375 __ ___-__-__" aria-invalid={bk.s.err} aria-describedby={bk.s.err ? 'al-perr' : undefined} className={`mt-2 h-14 w-full border-b bg-transparent text-[18px] outline-none placeholder:text-[#646a71]/50 focus:border-[#22719e] ${bk.s.err ? 'border-[#b3261e]' : 'border-[#1f2226]/25'}`} />
                      {bk.s.err && <p id="al-perr" className="mt-2 text-[14px] text-[#b3261e]">Проверьте номер — 12 цифр с кодом +375.</p>}</div>
                  </div>}
                </motion.div>
              </AnimatePresence>
              {err && <p className="mt-4 text-[15px] text-[#b3261e]" role="alert">{err}</p>}
              <div className="mt-10 flex items-center justify-between">
                {step > 0 ? <button type="button" onClick={() => setStep(step - 1)} className="min-h-[44px] text-[15px] text-[#646a71] hover:text-[#1f2226]">← Назад</button> : <span />}
                <button type="submit" disabled={bk.s.loading} className="inline-flex h-[52px] items-center gap-2 rounded-full bg-[#1f2226] px-8 text-[16px] text-white hover:bg-black disabled:opacity-60">{step < 2 ? 'Далее' : bk.s.loading ? 'Отправляем…' : 'Записаться'} <ArrowRight size={16} /></button>
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
    <section id="contact" className="scroll-mt-16 px-6 py-24 md:px-12 md:py-36">
      <div className="mx-auto grid max-w-[1400px] gap-14 lg:grid-cols-[.8fr_1.2fr]">
        <div>
          <p className="text-[12px] uppercase tracking-[.3em] text-[#646a71]">Контакты</p>
          <h2 className={`${SERIF} mt-5 text-[clamp(44px,5.6vw,88px)] font-light leading-[1]`}>Масюковщина, 25Б</h2>
          <dl className="mt-12 space-y-7 text-[17px]">
            <div><dt className="text-[12px] uppercase tracking-[.26em] text-[#646a71]">Адрес</dt><dd className="mt-2">{b.addr}, {b.city}</dd></div>
            <div><dt className="text-[12px] uppercase tracking-[.26em] text-[#646a71]">Телефон</dt><dd className="mt-2"><a href={'tel:' + tel(b.phone)} className="hover:text-[#22719e]">{b.phone}</a></dd></div>
            <div><dt className="text-[12px] uppercase tracking-[.26em] text-[#646a71]">Часы работы</dt><dd className="mt-2">Уточняйте по телефону</dd></div>
          </dl>
          <a href={`https://yandex.ru/maps/org/${b.oid}/`} target="_blank" rel="noopener" className="mt-10 inline-flex min-h-[44px] items-center gap-1.5 text-[16px] text-[#22719e] hover:underline">Построить маршрут <ArrowUpRight size={16} /></a>
        </div>
        <div className="h-[400px] overflow-hidden md:h-[520px]" style={{ filter: 'grayscale(.7) contrast(1.02)' }}><MapFrame oid={b.oid} /></div>
      </div>
    </section>
  )
}

function App() {
  useSmooth()
  const lite = useLite()
  return (
    <MotionConfig reducedMotion="user">
      <div className={`overflow-x-clip ${SANS}`} style={{ background: BG, color: INK, '--sel': ICE, '--selc': INK }}>
        <Ribbon name={b.name} bg="#1f2226" fg="#f3f4f5" />
        <Header />
        <main>
          <Split lite={lite} />
          <Checklist />
          <How />
          <Rating />
          <Faq />
          <Book />
          <Contact />
        </main>
        <footer className="px-6 pb-10 text-[13px] text-[#646a71] md:px-12">
          <div className="mx-auto flex max-w-[1400px] flex-wrap justify-between gap-3 border-t border-[#1f2226]/10 pt-8"><span>© 2026 {b.name} · Концепт сайта — Артём</span><span>{b.addr}, {b.city}</span></div>
        </footer>
        <CallBar phone={b.phone} barCls="bg-[#f3f4f5]/92 backdrop-blur-lg border-t border-[#1f2226]/10" callCls="rounded-full border border-[#1f2226]/25 text-[#1f2226]" bookCls="rounded-full bg-[#1f2226] text-white" />
        <div className="h-[72px] sm:hidden" />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
