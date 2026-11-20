import React, { useRef } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { useIsMobile } from '../../lib/kit'
import { useLang } from './i18n'
import { T, PERSON, COMPANIES, img } from './data'

const EASE = [0.16, 1, 0.3, 1]
const pad = n => String(n).padStart(2, '0')

/* ---------- portrait: b/w in an Italian arch that opens with scroll, colour portrait slides in ---------- */
function Portraits() {
  const { t } = useLang()
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.4 })
  const clip = useTransform(p, [0.05, 0.45], ['inset(62% 0% 0% 0%)', 'inset(0% 0% 0% 0%)'])
  const scale = useTransform(p, [0.05, 0.6], [1.28, 1])
  const y2 = useTransform(p, [0.1, 0.9], ['30%', '-18%'])
  const rot = useTransform(p, [0.1, 0.9], [4, -2])
  return (
    <div ref={ref} className="relative mx-auto w-full max-w-[520px] pb-[18%]">
      <div className="relative">
        <motion.div style={{ clipPath: clip }} className="relative aspect-[2/3] overflow-hidden rounded-t-[999px] bg-[#151412]">
          <motion.img style={{ scale }} src={img(1)} alt="Yehiel Tsubery" loading="lazy" decoding="async" width="2000" height="3000" className="h-full w-full object-cover object-[50%_20%] grayscale" />
        </motion.div>
        {/* the arch drawn as a line, like a section through a vault */}
        <svg aria-hidden viewBox="0 0 200 300" preserveAspectRatio="none" className="pointer-events-none absolute -inset-3 h-[calc(100%+24px)] w-[calc(100%+24px)] overflow-visible text-[#b06a35]">
          <motion.path d="M0 300 V100 A100 100 0 0 1 200 100 V300" fill="none" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 2.4, ease: EASE }} />
        </svg>
      </div>
      <motion.figure style={{ y: y2, rotate: rot }} className="absolute bottom-0 right-[-6%] w-[46%] bg-[#ece7df] p-2 shadow-[0_30px_60px_-25px_rgba(21,20,18,.45)] md:right-[-14%]">
        <img src={img(126, true)} alt="" loading="lazy" decoding="async" width="720" height="630" className="aspect-[8/7] w-full object-cover" />
        <figcaption className="flex justify-between px-1 pb-0.5 pt-2 text-[10px] font-semibold uppercase tracking-[.16em] text-[#151412]/55"><span>YTS</span><span>{PERSON.office.split(',')[0]}</span></figcaption>
      </motion.figure>
    </div>
  )
}

function Timeline() {
  const { t } = useLang()
  const rows = [
    ...PERSON.edu.map(e => { const s = t(e); const m = s.match(/^(.*?)\s+—\s+(.*),\s*(\d{4})$/); return m ? { y: m[3], a: m[2], b: m[1] } : { y: '', a: s, b: '' } }),
    { y: String(PERSON.studioSince), a: 'YTS Architects', b: t({ en: 'Own studio — ' + PERSON.office, it: 'Studio proprio — Ramat Gan, Israele' }) },
  ]
  return (
    <ol className="mt-12 border-t border-[#151412]/15">
      {rows.map((r, i) => (
        <motion.li key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-8%' }} transition={{ duration: 0.8, ease: EASE, delay: i * 0.1 }}
          className="grid grid-cols-[76px_1fr] items-baseline gap-4 border-b border-[#151412]/15 py-5 md:grid-cols-[110px_1fr]">
          <span className="text-[26px] font-black tracking-[-.03em] tabular-nums text-[#b06a35] md:text-[32px]">{r.y}</span>
          <span>
            <span className={`${T.serif} block text-[26px] leading-[1.05] md:text-[30px]`}>{r.a}</span>
            <span className="mt-1 block text-[13px] text-[#151412]/60">{r.b}</span>
          </span>
        </motion.li>
      ))}
    </ol>
  )
}

/* ---------- motto: two words drift apart/together with scroll ---------- */
function Motto() {
  const { t } = useLang()
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const a = useTransform(scrollYProgress, [0, 1], ['-14%', '10%'])
  const b = useTransform(scrollYProgress, [0, 1], ['16%', '-12%'])
  const words = t(PERSON.motto).split(' ')
  return (
    <div ref={ref} className="overflow-hidden py-16 md:py-24">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <div className="text-[11px] font-semibold uppercase tracking-[.22em] text-[#151412]/50">{t({ en: 'The studio’s motto', it: 'Il motto dello studio' })}</div>
      </div>
      <motion.div style={{ x: a }} className={`${T.serif} mt-4 whitespace-nowrap pl-[6vw] text-[19vw] leading-[.82] tracking-[-.02em] md:text-[15vw]`}>{words[0]}</motion.div>
      <motion.div style={{ x: b }} className={`${T.serif} whitespace-nowrap pl-[22vw] text-[19vw] italic leading-[.9] tracking-[-.02em] text-[#b06a35] md:text-[15vw]`}>{words.slice(1).join(' ')}.</motion.div>
    </div>
  )
}

/* ---------- Israel ↔ Italy: graticule + true-position dots, arcs drawn from Ramat Gan ---------- */
const PROJ = (lat, lon) => [(lon - 6) * 0.766 * 34 + 150, (48 - lat) * 34 + 40]
const PLACES = [
  { k: 'como', lat: 46.01, lon: 9.28, n: 'Lake Como', d: { en: 'Residences', it: 'Residenze' }, dx: -16, dy: -8, end: true },
  { k: 'milano', lat: 45.46, lon: 9.19, n: 'Milano', d: { en: 'Politecnico, 2008', it: 'Politecnico, 2008' }, dx: -16, dy: 22, end: true },
  { k: 'volterra', lat: 43.4, lon: 10.86, n: 'Volterra', d: { en: 'Palazzo Campani', it: 'Palazzo Campani' }, dx: 14, dy: 4 },
  { k: 'roma', lat: 41.9, lon: 12.5, n: 'Roma', d: { en: 'Club conference', it: 'Conferenza del club' }, dx: 14, dy: 4 },
  { k: 'sardegna', lat: 40.92, lon: 9.5, n: 'Sardegna', d: { en: 'In preparation', it: 'In preparazione' }, dx: 14, dy: 6 },
]
const HOME = { lat: 32.08, lon: 34.82 }

function MapArc() {
  const { t } = useLang()
  const m = useIsMobile(), F = m ? 2.1 : 1
  const [hx, hy] = PROJ(HOME.lat, HOME.lon)
  const lats = [32, 36, 40, 44, 48], lons = [8, 14, 20, 26, 32]
  return (
    <svg viewBox="0 0 980 660" className="h-auto w-full overflow-visible" role="img" aria-label={t({ en: 'Map: Ramat Gan, Israel connected to Lake Como, Milan, Volterra, Rome and Sardinia', it: 'Mappa: Ramat Gan, Israele collegata a Lago di Como, Milano, Volterra, Roma e Sardegna' })}>
      <g stroke="#151412" strokeOpacity=".09" strokeWidth="1">
        {lats.map(l => { const y = PROJ(l, 6)[1]; return <line key={'a' + l} x1="0" x2="980" y1={y} y2={y} /> })}
        {lons.map(l => { const x = PROJ(40, l)[0]; return <line key={'o' + l} y1="0" y2="660" x1={x} x2={x} /> })}
      </g>
      <g fill="#151412" fillOpacity=".35" fontSize="10" letterSpacing="2" style={{ fontFamily: 'Inter Tight, sans-serif' }}>
        {lats.slice(0, 4).map(l => <text key={l} x="980" textAnchor="end" y={PROJ(l, 6)[1] - 6}>{l}°N</text>)}
        {lons.slice(1, 5).map(l => <text key={l} x={PROJ(40, l)[0] + 6} y="652">{l}°E</text>)}
      </g>
      <text x="540" y="430" textAnchor="middle" fill="#151412" fillOpacity=".16" fontSize="54" fontStyle="italic" style={{ fontFamily: 'Instrument Serif, serif' }}>{t({ en: 'Mediterranean', it: 'Mediterraneo' })}</text>
      {PLACES.map((p, i) => {
        const [x, y] = PROJ(p.lat, p.lon)
        const dx = x - hx, dy = y - hy, len = Math.hypot(dx, dy), off = len * (0.16 + i * 0.03)
        const mx = (x + hx) / 2 - (dy / len) * off, my = (y + hy) / 2 + (dx / len) * off
        return (
          <g key={p.k}>
            <motion.path d={`M${hx} ${hy} Q${mx} ${my} ${x} ${y}`} fill="none" stroke="#b06a35" strokeWidth="1.3" strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 1 }} viewport={{ once: true, margin: '-20%' }} transition={{ duration: 1.8, ease: EASE, delay: 0.2 + i * 0.16 }} />
            <motion.g initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, margin: '-20%' }} transition={{ duration: 0.6, delay: 1.4 + i * 0.16 }}>
              <circle cx={x} cy={y} r="5" fill="#151412" />
              <circle cx={x} cy={y} r="11" fill="none" stroke="#151412" strokeOpacity=".25" />
              <text x={x + p.dx * F} y={y + p.dy * F} textAnchor={p.end ? 'end' : 'start'} fontSize={21 * F} fill="#151412" style={{ fontFamily: 'Instrument Serif, serif' }}>{p.n}</text>
              {!m && <text x={x + p.dx} y={y + p.dy + 16} textAnchor={p.end ? 'end' : 'start'} fontSize="10.5" letterSpacing="1.6" fill="#151412" fillOpacity=".55" style={{ fontFamily: 'Inter Tight, sans-serif', textTransform: 'uppercase' }}>{t(p.d)}</text>}
            </motion.g>
          </g>
        )
      })}
      <circle cx={hx} cy={hy} r="8" fill="#b06a35" />
      <motion.circle cx={hx} cy={hy} r="8" fill="none" stroke="#b06a35" animate={{ r: [8, 30], opacity: [0.7, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' }} />
      <text x={hx - 18} y={hy - 22} textAnchor="end" fontSize={26 * F} fill="#151412" style={{ fontFamily: 'Instrument Serif, serif' }}>Ramat Gan</text>
      {!m && <text x={hx - 18} y={hy - 4} textAnchor="end" fontSize="10.5" letterSpacing="1.6" fill="#151412" fillOpacity=".55" style={{ fontFamily: 'Inter Tight, sans-serif', textTransform: 'uppercase' }}>{t({ en: 'Studio · since 2012', it: 'Studio · dal 2012' })}</text>}
    </svg>
  )
}

/* ---------- YTS Group: umbrella → three branches ---------- */
const BRANCHES = [
  { k: 'arch', t: { en: 'Architecture', it: 'Architettura' }, items: COMPANIES.slice(0, 1), span: 'md:col-span-3' },
  { k: 'hold', t: { en: 'Holdings', it: 'Holding' }, items: COMPANIES.slice(1, 3), span: 'md:col-span-3' },
  { k: 'proj', t: { en: 'Project companies', it: 'Società di progetto' }, items: COMPANIES.slice(3), span: 'md:col-span-6' },
]

function Line({ className, axis = 'x', delay = 0 }) {
  const k = axis === 'x' ? 'scaleX' : 'scaleY'
  return <motion.span aria-hidden className={`absolute bg-[#151412]/35 ${axis === 'x' ? 'h-px origin-left' : 'w-px origin-top'} ${className}`}
    variants={{ h: { [k]: 0 }, v: { [k]: 1, transition: { duration: 0.9, ease: EASE, delay } } }} />
}

function Group() {
  const { t } = useLang()
  let n = 0
  return (
    <div>
      <div className="flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[.22em] text-[#b06a35]">YTS Group</div>
          <h3 className={`${T.serif} mt-3 max-w-[16ch] text-[44px] leading-[.98] md:text-[64px]`}>{t({ en: 'One signature, ', it: 'Una firma, ' })}<em className="text-[#151412]/50">{t({ en: 'eight companies.', it: 'otto società.' })}</em></h3>
        </div>
        <p className="max-w-[38ch] text-[15px] leading-relaxed text-[#151412]/70">{t({ en: 'Design and development under one roof — the architecture studio in Israel, and the companies that acquire and deliver residences in Italy.', it: 'Progetto e sviluppo sotto lo stesso tetto — lo studio di architettura in Israele e le società che acquisiscono e realizzano residenze in Italia.' })}</p>
      </div>
      {/* root */}
      <div className="relative mt-14 md:mt-20">
        <div className="flex md:justify-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: EASE }}
            className="relative z-10 inline-flex h-14 items-center gap-3 rounded-full bg-[#151412] px-7 text-[#ece7df]">
            <span className="text-[18px] font-black tracking-[-.02em]">YTS</span><span className={`${T.serif} text-[22px] italic`}>Group</span>
          </motion.div>
        </div>
        {/* connectors (desktop) */}
        <motion.div initial="h" whileInView="v" viewport={{ once: true }} className="relative hidden h-14 md:block">
          <Line axis="y" className="left-1/2 top-0 h-7" delay={0.3} />
          <Line className="left-[12.5%] top-7 w-[62.5%]" delay={0.6} />
          {['left-[12.5%]', 'left-[37.5%]', 'left-[75%]'].map((l, i) => <Line key={l} axis="y" className={`top-7 h-7 ${l}`} delay={1 + i * 0.1} />)}
        </motion.div>
        <div className="relative mt-8 grid gap-10 border-l border-[#151412]/20 pl-6 md:mt-0 md:grid-cols-12 md:gap-6 md:border-0 md:pl-0">
          {BRANCHES.map((b, bi) => (
            <motion.div key={b.k} className={`${b.span}`} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-10%' }} transition={{ duration: 0.9, ease: EASE, delay: 0.9 + bi * 0.12 }}>
              <div className="flex items-center justify-between border-b border-[#151412] pb-3 md:justify-center md:gap-3">
                <span className="text-[12px] font-bold uppercase tracking-[.2em]">{t(b.t)}</span>
                <span className="text-[11px] tabular-nums text-[#151412]/45">{pad(b.items.length)}</span>
              </div>
              <ul className={`mt-2 ${b.k === 'proj' ? 'md:grid md:grid-cols-2 md:gap-x-6' : ''}`}>
                {b.items.map(c => { n++; return (
                  <li key={c} className="group flex items-baseline gap-3 border-b border-[#151412]/12 py-4">
                    <span className="w-6 shrink-0 text-[11px] font-semibold tabular-nums text-[#151412]/35">{pad(n)}</span>
                    <span className={`${T.serif} text-[24px] leading-[1.05] transition-colors duration-500 group-hover:text-[#b06a35] lg:text-[27px]`}>{c.replace(/ ltd$/, '')}{/ ltd$/.test(c) && <span className="ml-1.5 align-middle font-['Inter_Tight',sans-serif] text-[10px] font-semibold uppercase tracking-[.16em] text-[#151412]/40">ltd</span>}</span>
                  </li>
                ) })}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Founder() {
  const { t } = useLang()
  return (
    <section id="founder" className={`relative overflow-hidden bg-[#ece7df] text-[#151412] ${T.sans}`}>
      <div className="mx-auto grid max-w-[1440px] gap-16 px-5 pb-10 pt-24 md:px-10 md:pt-36 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5 lg:pr-10"><Portraits /></div>
        <div className="lg:col-span-6 lg:col-start-7 lg:pt-10">
          <div className="text-[11px] font-semibold uppercase tracking-[.22em] text-[#b06a35]">{t({ en: '05 — Founder', it: '05 — Fondatore' })}</div>
          <h2 className={`${T.serif} mt-5 text-[19vw] leading-[.84] tracking-[-.02em] lg:text-[8.6vw] 2xl:text-[124px]`}>
            {['Yehiel', 'Tsubery'].map((w, i) => (
              <span key={w} className="block overflow-hidden pb-[.06em]">
                <motion.span className={`inline-block ${i ? 'italic' : ''}`} initial={{ y: '105%' }} whileInView={{ y: '0%' }} viewport={{ once: true }} transition={{ duration: 1.1, ease: EASE, delay: i * 0.12 }}>{w}</motion.span>
              </span>
            ))}
          </h2>
          <p className="mt-6 text-[13px] font-semibold uppercase tracking-[.2em] text-[#151412]/60">{t(PERSON.role)}</p>
          <p className={`${T.serif} mt-8 max-w-[30ch] text-[27px] leading-[1.15] md:text-[32px]`}>
            {t({ en: 'Trained in Milan and at the Technion, he has led YTS Architects from Ramat Gan since 2012 — commercial, public and residential buildings, and, through YTS Group, residences in Italy.', it: 'Formato a Milano e al Technion, guida YTS Architects da Ramat Gan dal 2012 — edifici commerciali, pubblici e residenziali e, con YTS Group, residenze in Italia.' })}
          </p>
          <Timeline />
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <span className="mr-2 text-[11px] font-semibold uppercase tracking-[.2em] text-[#151412]/50">{t({ en: 'Designs with', it: 'Progetta con' })}</span>
            {PERSON.tech.map(x => <span key={x} className="rounded-full border border-[#151412]/20 px-4 py-1.5 text-[13px] font-bold tracking-[.08em]">{x}</span>)}
          </div>
        </div>
      </div>
      <Motto />
      <div className="mx-auto grid max-w-[1440px] items-center gap-10 px-5 py-16 md:px-10 md:py-24 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="text-[11px] font-semibold uppercase tracking-[.22em] text-[#b06a35]">{t({ en: 'Israel ↔ Italy', it: 'Israele ↔ Italia' })}</div>
          <h3 className={`${T.serif} mt-3 text-[44px] leading-[.98] md:text-[60px]`}>{t({ en: 'A studio between ', it: 'Uno studio tra ' })}<em className="text-[#151412]/50">{t({ en: 'two shores.', it: 'due sponde.' })}</em></h3>
          <p className="mt-6 max-w-[36ch] text-[15px] leading-relaxed text-[#151412]/70">{t({ en: 'Drawings are made in Ramat Gan. Degrees were earned in Milan and Haifa. The residences rise on Lake Como and in Volterra — with Sardinia in preparation.', it: 'I disegni nascono a Ramat Gan. Gli studi a Milano e Haifa. Le residenze sorgono sul Lago di Como e a Volterra — con la Sardegna in preparazione.' })}</p>
        </div>
        <div className="lg:col-span-8"><MapArc /></div>
      </div>
      <div className="bg-[#e2dcd2]">
        <div className="mx-auto max-w-[1440px] px-5 py-20 md:px-10 md:py-32"><Group /></div>
      </div>
    </section>
  )
}
