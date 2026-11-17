import React from 'react'
import { createRoot } from 'react-dom/client'
import { ArrowLeft, ArrowUpRight, Download, Printer } from 'lucide-react'
import '../lib/base.css'
import { TG } from '../lib/kit'
import { WORKS, TG_URL, TG_HANDLE, BASE } from './home-data'

const F = "font-['Geist',system-ui,sans-serif]"
const M = "font-['Geist_Mono',ui-monospace,monospace]"
const SITE = 'dvzvb8rvvc-code.github.io/portfolio'

const SKILLS = [
  ['Design', ['UI/UX design', 'Art direction', 'Typography & layout', 'Landing page structure']],
  ['Front-end', ['React', 'Vite', 'Tailwind CSS', 'Framer Motion', 'Responsive, mobile-first']],
  ['3D & motion', ['Three.js / WebGL', 'React Three Fiber', 'Shaders & canvas effects', 'Scroll storytelling']],
  ['Presentations', ['PowerPoint', 'Google Slides', 'Web slides', 'Data visualisation']],
  ['Telegram', ['Telegram Bot API', 'Mini Apps', 'Booking flows', 'Notifications & stats']],
  ['Copy', ['Copywriting EN / RU', 'Offer & CTA writing']],
]
const SERVICES = [
  ['Websites & landing pages', 'High-end sites with 3D/WebGL, scroll storytelling, online booking and requests delivered to Telegram.', 'Landing in 2 days'],
  ['Presentations & pitch decks', 'Pitch decks, business proposals and brand guides in PowerPoint, Google Slides or as web slides.', '1–2 days'],
  ['Telegram bots & Mini Apps', 'Booking bots, quizzes, owner notifications and stats, Mini App interfaces, smart replies.', '5–7 days'],
]
const PICK = ['goauto', 'kvadroline', 'everest', 'butchers', 'lynails', 'dtail', 'experience', 'shokolad']
const PROJECTS = PICK.map(s => WORKS.find(w => w.s === s))
const HOW = [
  'Direct communication in Telegram — no managers in between.',
  'The key screen comes first, so the direction is agreed before the full build.',
  'Fast turnaround: landing page in 2 days, deck in 1–2 days, bot in 5–7 days.',
  'Don’t like the result — don’t pay.',
  'International payments via USDT / crypto.',
]

function Row({ label, children, i = 0, className = '' }) {
  return (
    <section className={'fx avoid grid gap-3 border-t border-black/10 py-7 md:grid-cols-[170px_1fr] md:gap-8 print:grid-cols-[120px_1fr] print:gap-5 print:py-[9pt] ' + className} style={{ animationDelay: `${.15 + i * .06}s` }}>
      <h2 className={M + ' pt-1 text-[11px] uppercase tracking-[.16em] text-black/45 print:text-[7.5pt]'}>{label}</h2>
      <div>{children}</div>
    </section>
  )
}

function App() {
  return (
    <div className={F + ' min-h-screen text-[#111] antialiased'}>
      <div className="mx-auto flex max-w-[900px] flex-wrap items-center justify-between gap-3 px-5 pt-6 print:hidden">
        <a href={BASE} className="inline-flex items-center gap-2 text-[13px] text-black/60 transition hover:text-black"><ArrowLeft size={15} />Portfolio</a>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-white px-4 py-2 text-[13px] font-medium transition hover:border-black/40"><Printer size={14} />Print</button>
          <a href={`${BASE}cv/artem-cv.pdf`} download className="inline-flex items-center gap-2 rounded-full bg-[#111] px-4 py-2 text-[13px] font-medium text-white transition hover:bg-black"><Download size={14} />Download PDF</a>
        </div>
      </div>

      <main className="sheet mx-auto my-6 max-w-[900px] rounded-2xl border border-black/[.07] bg-white px-6 py-10 shadow-[0_30px_80px_-40px_rgba(0,0,0,.25)] md:my-8 md:px-14 md:py-14">
        <header className="fx grid gap-6 pb-8 md:grid-cols-[1fr_auto] md:items-end print:grid-cols-[1fr_auto] print:pb-[10pt]">
          <div>
            <div className={M + ' mb-4 text-[11px] uppercase tracking-[.2em] text-black/45 print:mb-1 print:text-[7.5pt]'}>Curriculum vitae</div>
            <h1 className="text-[clamp(52px,9vw,96px)] font-semibold leading-[.9] tracking-[-.055em] print:text-[38pt]">Artem</h1>
            <p className="mt-4 text-[clamp(18px,2.4vw,24px)] font-medium tracking-[-.02em] print:mt-1 print:text-[13pt]">Web Designer &amp; Developer</p>
            <p className="mt-1 text-[15px] text-black/55 print:text-[10pt]">Websites · Presentations · Telegram Bots</p>
          </div>
          <div className="space-y-1.5 text-[14px] md:text-right print:text-right print:text-[9pt]">
            <a href={TG_URL} target="_blank" rel="noopener" className="flex items-center gap-2 font-medium md:justify-end print:justify-end"><TG width={14} height={14} />Telegram {TG_HANDLE}</a>
            <a href={BASE} className="block text-black/55 transition hover:text-black">{SITE}</a>
          </div>
        </header>

        <Row label="Summary" i={0}>
          <p className="max-w-[640px] text-[16px] leading-relaxed print:text-[10pt] print:leading-snug">
            Independent web designer and developer. I design and build high-end websites and landing pages with 3D/WebGL and scroll storytelling, produce presentations and pitch decks, and develop Telegram bots and Mini Apps. I work directly with clients, move fast — a landing page in two days — and keep the deal simple: if you don’t like the result, you don’t pay.
          </p>
        </Row>

        <Row label="Core skills" i={1}>
          <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2 print:grid-cols-3 print:gap-y-[5pt]">
            {SKILLS.map(([h, items]) => (
              <div key={h}>
                <div className="text-[14px] font-semibold print:text-[9.5pt]">{h}</div>
                <div className="mt-1 text-[14px] leading-relaxed text-black/60 print:text-[9pt] print:leading-snug">{items.join(' · ')}</div>
              </div>
            ))}
          </div>
        </Row>

        <Row label="Services" i={2}>
          <div className="divide-y divide-black/[.07]">
            {SERVICES.map(([h, p, d]) => (
              <div key={h} className="avoid grid gap-1 py-3 first:pt-0 last:pb-0 sm:grid-cols-[1fr_auto] sm:gap-6 print:grid-cols-[1fr_auto] print:py-[4pt]">
                <div><div className="text-[15px] font-semibold print:text-[10pt]">{h}</div><div className="mt-0.5 text-[14px] text-black/60 print:text-[9pt]">{p}</div></div>
                <div className={M + ' text-[12px] text-black/50 sm:pt-1 print:text-[8pt]'}>{d}</div>
              </div>
            ))}
          </div>
        </Row>

        <Row label="Selected projects" i={3}>
          <p className="mb-5 text-[13.5px] text-black/50 print:mb-[5pt] print:text-[8.5pt]">Self-initiated concept websites: full redesigns built for real local businesses to show what their site could be. Not commissioned work. Live demos at the links.</p>
          <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2 print:grid-cols-2 print:gap-y-[6pt]">
            {PROJECTS.map(w => (
              <a key={w.s} href={`${BASE}${w.s}/`} target="_blank" rel="noopener" className="avoid group block">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[15px] font-semibold print:text-[10pt]">{w.name}</span>
                  <ArrowUpRight size={14} className="shrink-0 text-black/30 transition group-hover:text-black print:hidden" />
                </div>
                <div className={M + ' mt-0.5 text-[11px] text-black/45 print:text-[7.5pt]'}>Concept · {w.niche.en}</div>
                <p className="mt-1.5 text-[14px] leading-snug text-black/65 print:mt-[1pt] print:text-[9pt]">{w.idea.en}</p>
                <div className={M + ' mt-1 text-[11px] text-black/40 group-hover:text-black print:text-[7.5pt]'}>{SITE}/{w.s}</div>
              </a>
            ))}
          </div>
        </Row>

        <div className="grid md:grid-cols-2 md:gap-10 print:grid-cols-2 print:gap-8">
          <Row label="Languages" i={4} className="md:grid-cols-[170px_1fr] lg:grid-cols-[110px_1fr] print:grid-cols-[80px_1fr]">
            <ul className="space-y-1 text-[14.5px] print:text-[9.5pt]">
              <li><span className="font-semibold">Russian</span> <span className="text-black/50">— native</span></li>
              <li><span className="font-semibold">English</span> <span className="text-black/50">— working</span></li>
            </ul>
          </Row>
          <Row label="Contact" i={5} className="md:grid-cols-[170px_1fr] lg:grid-cols-[110px_1fr] print:grid-cols-[80px_1fr]">
            <a href={TG_URL} target="_blank" rel="noopener" className="inline-flex items-center gap-2 text-[14.5px] font-semibold underline decoration-black/20 underline-offset-4 hover:decoration-black print:text-[9.5pt]"><TG width={14} height={14} />t.me/bezumniypasha8</a>
            <div className="mt-1 text-[13px] text-black/50 print:text-[8.5pt]">Telegram only · replies usually the same day</div>
          </Row>
        </div>

        <Row label="How I work" i={6}>
          <ul className="space-y-1.5 text-[14.5px] print:space-y-[1pt] print:text-[9.5pt]">
            {HOW.map(x => <li key={x} className="flex gap-3"><span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-black print:mt-[5pt]" />{x}</li>)}
          </ul>
        </Row>

        <footer className={M + ' flex justify-between border-t border-black/10 pt-6 text-[11px] text-black/40 print:pt-[6pt] print:text-[7.5pt]'}>
          <span>© 2026 Artem</span><span>{SITE}</span>
        </footer>
      </main>
    </div>
  )
}

createRoot(document.getElementById('root')).render(<App />)
