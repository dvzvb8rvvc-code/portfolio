import React, { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { Check, Bell, RotateCcw, ChevronLeft } from 'lucide-react'

const M = "font-['JetBrains_Mono',monospace]"
const SAMPLE = [5, 8, 6, 9, 12, 14, 7]

function Typing() {
  return (
    <div className="flex w-fit gap-1 rounded-2xl rounded-bl-md bg-[#182533] px-3 py-2.5">
      {[0, 1, 2].map(i => <motion.span key={i} className="h-1.5 w-1.5 rounded-full bg-[#7f91a4]" animate={{ opacity: [.3, 1, .3] }} transition={{ duration: .9, repeat: Infinity, delay: i * .15 }} />)}
    </div>
  )
}

function Bubble({ m, t }) {
  const me = m.who === 'me'
  let text = ''
  if (m.k === 'start') text = '/start'
  else if (m.k === 'hi') text = t.bot.hi
  else if (m.k === 'time') text = t.bot.time
  else if (m.k === 'svc') text = t.bot.services[m.i]
  else if (m.k === 'slot') text = t.bot.slots[m.i]
  else if (m.k === 'done') text = t.bot.done(t.bot.services[m.s], t.bot.slots[m.i])
  if (m.k === 'owner') return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mx-auto flex items-center gap-1.5 rounded-full bg-[#ffffff12] px-3 py-1 text-[11px] text-[#c9d3dd]">
      <Bell size={12} /> {t.bot.owner}
    </motion.div>
  )
  return (
    <motion.div initial={{ opacity: 0, y: 10, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      className={'max-w-[82%] rounded-2xl px-3 py-2 text-[13px] leading-snug text-white ' + (me ? 'ml-auto rounded-br-md bg-[#2b5278]' : 'rounded-bl-md bg-[#182533]')}>
      {m.k === 'done' && <Check size={13} className="mr-1 inline -mt-0.5 text-[#6fe3a0]" />}{text}
    </motion.div>
  )
}

export function Phone({ children, header }) {
  return (
    <div className="relative mx-auto w-[296px] shrink-0 rounded-[46px] border border-white/15 bg-gradient-to-b from-[#22252e] to-[#101217] p-[9px] shadow-[0_40px_120px_-30px_rgba(110,130,255,.45)]">
      <div className="relative flex h-[590px] flex-col overflow-hidden rounded-[38px] bg-[#0e1621]">
        <div className="absolute left-1/2 top-2 z-20 h-[22px] w-[86px] -translate-x-1/2 rounded-full bg-black" />
        {header}
        {children}
      </div>
    </div>
  )
}

function ChatHeader({ t }) {
  return (
    <div className="flex items-center gap-2.5 bg-[#17212b] px-3 pb-2.5 pt-10">
      <ChevronLeft size={18} className="text-[#6ab3f3]" />
      <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-[#8f9dff] to-[#5a6cff] text-[12px] font-bold text-white">SB</div>
      <div className="leading-tight"><div className="text-[13px] font-semibold text-white">{t.bot.name}</div><div className="text-[11px] text-[#7f91a4]">{t.bot.status}</div></div>
    </div>
  )
}

export function ChatDemo({ t, onOpenApp }) {
  const ref = useRef(null)
  const inView = useInView(ref, { amount: .35 })
  const [msgs, setMsgs] = useState([])
  const [kb, setKb] = useState(null)
  const [typing, setTyping] = useState(false)
  const [svc, setSvc] = useState(0)
  const timers = useRef([]), n = useRef(0), started = useRef(false)
  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms))
  const clear = () => { timers.current.forEach(clearTimeout); timers.current = [] }
  const push = m => setMsgs(a => [...a, { ...m, n: n.current++ }])

  const botSay = (m, nextKb, delay = 900) => {
    setTyping(true)
    later(() => { setTyping(false); push(m); if (nextKb) setKb(nextKb) }, delay)
  }
  const start = useCallback(() => {
    clear(); setMsgs([]); setKb(null); setTyping(false); n.current = 0
    later(() => push({ who: 'me', k: 'start' }), 300)
    later(() => botSay({ who: 'bot', k: 'hi' }, 'svc'), 700)
  }, [])
  const choose = (kind, i) => {
    clear(); setKb(null)
    if (kind === 'svc') { setSvc(i); push({ who: 'me', k: 'svc', i }); botSay({ who: 'bot', k: 'time' }, 'slot') }
    else if (kind === 'slot') {
      push({ who: 'me', k: 'slot', i }); botSay({ who: 'bot', k: 'done', s: svc, i })
      later(() => { push({ who: 'sys', k: 'owner' }); setKb('app') }, 1700)
    }
  }
  useEffect(() => { if (inView && !started.current) { started.current = true; start() } }, [inView])
  useEffect(() => {
    if (!inView || !kb || kb === 'app') return
    const id = setTimeout(() => choose(kb, kb === 'svc' ? 0 : 1), 3600)
    return () => clearTimeout(id)
  }, [kb, inView, svc])
  useEffect(() => clear, [])

  const opts = kb === 'svc' ? t.bot.services : kb === 'slot' ? t.bot.slots : null
  return (
    <div ref={ref} className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col justify-end gap-2 overflow-hidden px-3 py-3" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,.035) 1px, transparent 1px)', backgroundSize: '14px 14px' }}>
        {msgs.map(m => <Bubble key={m.n} m={m} t={t} />)}
        {typing && <Typing />}
      </div>
      <div className="min-h-[118px] bg-[#17212b] p-2.5">
        <AnimatePresence mode="wait">
          {opts ? (
            <motion.div key={kb} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="grid gap-1.5">
              {opts.map((o, i) => (
                <button key={o} onClick={() => choose(kb, i)} className="rounded-lg bg-[#24323f] py-2 text-[13px] font-medium text-[#6ab3f3] transition hover:bg-[#2c3d4d] active:scale-[.98]">{o}</button>
              ))}
            </motion.div>
          ) : kb === 'app' ? (
            <motion.div key="app" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid gap-1.5">
              <button onClick={onOpenApp} className="rounded-lg bg-[#5a8cff] py-2.5 text-[13px] font-semibold text-white">{t.bot.openApp}</button>
              <button onClick={start} className="flex items-center justify-center gap-1.5 rounded-lg bg-[#24323f] py-2 text-[12px] text-[#9fb0c0]"><RotateCcw size={12} />{t.replay}</button>
            </motion.div>
          ) : (
            <motion.div key="in" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-[64px] rounded-full bg-[#0e1621] px-4 py-2 text-[13px] text-[#6d7f8f]">{t.bot.input}</motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export function MiniApp({ t }) {
  const [qi, setQi] = useState(0)
  const [ans, setAns] = useState([])
  const a = t.app, done = qi >= a.qs.length
  const score = 74 + ans.reduce((s, x, i) => s + ((x + i) % 3) * 4, 0)
  const pick = i => { setAns(v => [...v, i]); setQi(q => q + 1) }
  const reset = () => { setAns([]); setQi(0) }
  const C = 2 * Math.PI * 34
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#f4f5f8] px-4 pb-4 pt-11 text-[#0f1115]">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-[15px] font-bold">{a.title}</div>
        <div className={M + ' text-[10px] uppercase tracking-wider text-black/40'}>Mini App</div>
      </div>
      <AnimatePresence mode="wait">
        {!done ? (
          <motion.div key={qi} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: .28 }}>
            <div className="mb-2 h-1 overflow-hidden rounded-full bg-black/10"><motion.div className="h-full rounded-full bg-[#5a6cff]" initial={false} animate={{ width: `${(qi / a.qs.length) * 100}%` }} /></div>
            <div className={M + ' mb-5 text-[10px] uppercase tracking-wider text-black/45'}>{a.q} {qi + 1} {a.of} {a.qs.length}</div>
            <div className="mb-4 text-[19px] font-bold leading-tight">{a.qs[qi][0]}</div>
            <div className="grid gap-2">
              {a.qs[qi][1].map((o, i) => (
                <button key={o} onClick={() => pick(i)} className="rounded-xl border border-black/10 bg-white px-4 py-3 text-left text-[14px] font-medium shadow-sm transition hover:border-[#5a6cff] active:scale-[.98]">{o}</button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div key="res" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3">
            <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm">
              <svg width="84" height="84" viewBox="0 0 84 84" className="-rotate-90">
                <circle cx="42" cy="42" r="34" fill="none" stroke="#e6e8ef" strokeWidth="8" />
                <motion.circle cx="42" cy="42" r="34" fill="none" stroke="#5a6cff" strokeWidth="8" strokeLinecap="round" strokeDasharray={C} initial={{ strokeDashoffset: C }} animate={{ strokeDashoffset: C * (1 - score / 100) }} transition={{ duration: 1.2, ease: [0.2, 0, 0, 1] }} />
              </svg>
              <div><div className={M + ' text-[10px] uppercase tracking-wider text-black/45'}>{a.result}</div><div className="text-[30px] font-bold leading-none">{score}%</div><div className="text-[12px] text-black/50">{a.score}</div></div>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="mb-3 text-[12px] font-semibold text-black/60">{a.stats}</div>
              <div className="flex h-[96px] items-end gap-2">
                {SAMPLE.map((v, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1">
                    <motion.div className="w-full rounded-md bg-gradient-to-t from-[#5a6cff] to-[#9aa6ff]" initial={{ height: 0 }} animate={{ height: v * 6 }} transition={{ delay: .2 + i * .06, duration: .6, ease: [0.2, 0, 0, 1] }} />
                    <span className="text-[9px] text-black/40">{a.days[i]}</span>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={reset} className="rounded-xl bg-[#0f1115] py-2.5 text-[13px] font-semibold text-white">{a.again}</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function BotDemo({ t }) {
  const [tab, setTab] = useState('chat')
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex rounded-full border border-white/10 bg-white/[.03] p-1">
        {[['chat', t.tabChat], ['app', t.tabApp]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={'relative rounded-full px-4 py-1.5 text-[13px] font-medium transition ' + (tab === k ? 'text-[#07080b]' : 'text-white/60 hover:text-white')}>
            {tab === k && <motion.span layoutId="bot-tab" className="absolute inset-0 rounded-full bg-white" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
            <span className="relative">{l}</span>
          </button>
        ))}
      </div>
      <Phone header={tab === 'chat' ? <ChatHeader t={t} /> : null}>
        {tab === 'chat' ? <ChatDemo t={t} onOpenApp={() => setTab('app')} /> : <MiniApp t={t} />}
      </Phone>
      <div className={M + ' text-[11px] uppercase tracking-[.18em] text-white/40'}>{t.conceptDemo}</div>
    </div>
  )
}
