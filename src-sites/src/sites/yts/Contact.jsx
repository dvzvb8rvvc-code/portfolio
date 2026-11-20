import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { PORTFOLIO } from '../../lib/kit'
import { useLang } from './i18n'
import { T, COMPANIES } from './data'

const EASE = [0.16, 1, 0.3, 1]
const INTERESTS = [
  { k: 'como', t: { en: 'Lake Como', it: 'Lago di Como' } },
  { k: 'palazzo', t: { en: 'Palazzo Campani', it: 'Palazzo Campani' } },
  { k: 'arch', t: { en: 'Architecture project', it: 'Progetto di architettura' } },
  { k: 'club', t: { en: 'Club', it: 'Club' } },
]
const LANGS = [{ k: 'en', l: 'English' }, { k: 'it', l: 'Italiano' }, { k: 'he', l: 'עברית' }]

function Field({ id, label, value, onChange, type = 'text', error, area, autoComplete }) {
  const Tag = area ? 'textarea' : 'input'
  return (
    <label htmlFor={id} className="group relative block pt-6">
      <Tag id={id} type={area ? undefined : type} value={value} onChange={e => onChange(e.target.value)} placeholder=" " rows={area ? 3 : undefined} autoComplete={autoComplete}
        aria-invalid={!!error}
        className={`peer block w-full resize-none border-0 border-b bg-transparent pb-3 pt-1 text-[19px] text-[#151412] outline-none transition-colors placeholder:text-transparent ${error ? 'border-[#b06a35]' : 'border-[#151412]/25 focus:border-[#151412]'}`} />
      <span className="pointer-events-none absolute left-0 top-7 origin-left text-[17px] text-[#151412]/50 transition-all duration-300 peer-focus:top-0 peer-focus:text-[11px] peer-focus:font-semibold peer-focus:uppercase peer-focus:tracking-[.18em] peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:font-semibold peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-[.18em]">{label}</span>
      <span className="pointer-events-none absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-[#b06a35] transition-transform duration-500 peer-focus:scale-x-100" />
      {error && <span className="absolute -bottom-5 left-0 text-[11.5px] text-[#b06a35]">{error}</span>}
    </label>
  )
}

function Chips({ label, options, value, onChange, name }) {
  return (
    <div role="group" aria-label={label} className="pt-9">
      <div className="text-[11px] font-semibold uppercase tracking-[.18em] text-[#151412]/50">{label}</div>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map(o => {
          const on = value === o.k
          return (
            <button type="button" key={o.k} onClick={() => onChange(o.k)} aria-pressed={on} name={name}
              className={`relative h-10 rounded-full border px-4 text-[13.5px] font-medium transition-colors duration-300 ${on ? 'border-[#151412] text-[#ece7df]' : 'border-[#151412]/20 text-[#151412]/80 hover:border-[#151412]/50'}`}>
              {on && <motion.span layoutId={'chip-' + name} className="absolute inset-0 rounded-full bg-[#151412]" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
              <span className="relative">{o.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function Thanks({ name, interest, reset }) {
  const { t } = useLang()
  const first = (name || '').trim().split(' ')[0]
  const draw = (d, i) => ({ initial: { pathLength: 0 }, animate: { pathLength: 1 }, transition: { duration: 1.6, ease: EASE, delay: 0.2 + i * 0.18 } })
  return (
    <motion.div key="ok" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.8, ease: EASE }} className="flex min-h-[560px] flex-col justify-center" role="status">
      <svg viewBox="0 0 160 200" className="h-[150px] w-[120px] text-[#151412]" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round">
        {['M10 200 V80 A70 70 0 0 1 150 80 V200', 'M10 132 H150', 'M30 146 Q60 140 80 146 T130 146', 'M44 160 Q70 155 90 160 T120 160'].map((d, i) => <motion.path key={i} d={d} {...draw(d, i)} />)}
        <motion.circle cx="104" cy="104" r="14" stroke="#b06a35" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.4, delay: 1, ease: EASE }} />
      </svg>
      <h3 className={`${T.serif} mt-8 text-[64px] leading-[.92] md:text-[88px]`}>
        <span className="block overflow-hidden"><motion.span className="inline-block" initial={{ y: '100%' }} animate={{ y: 0 }} transition={{ duration: 1, ease: EASE, delay: 0.3 }}>Grazie{first ? ',' : '.'}</motion.span></span>
        {first && <span className="block overflow-hidden"><motion.span className="inline-block italic text-[#b06a35]" initial={{ y: '100%' }} animate={{ y: 0 }} transition={{ duration: 1, ease: EASE, delay: 0.42 }}>{first}.</motion.span></span>}
      </h3>
      <p className="mt-6 max-w-[40ch] text-[16px] leading-relaxed text-[#151412]/70">
        {t({ en: 'Your note would now be on its way to the studio in Ramat Gan', it: 'La tua richiesta sarebbe ora in viaggio verso lo studio di Ramat Gan' })}{interest ? t({ en: ' — tagged “', it: ' — con oggetto “' }) + t(INTERESTS.find(x => x.k === interest).t) + '”' : ''}.
      </p>
      <p className="mt-4 max-w-[44ch] rounded-2xl bg-[#151412]/[.05] px-4 py-3 text-[13px] leading-relaxed text-[#151412]/60">{t({ en: 'This is a design concept: nothing was sent and nothing was stored.', it: 'Questo è un concept di design: nessun dato è stato inviato né salvato.' })}</p>
      <button onClick={reset} className="mt-8 self-start text-[13px] font-semibold underline decoration-[#151412]/30 underline-offset-4 hover:decoration-[#151412]">{t({ en: 'Write another note', it: 'Scrivi un’altra richiesta' })}</button>
    </motion.div>
  )
}

function Form() {
  const { t, lang } = useLang()
  const empty = { name: '', reach: '', interest: '', pref: '', msg: '' }
  const [s, setS] = useState(empty)
  const [err, setErr] = useState({})
  const [sent, setSent] = useState(false)
  const upd = (k, v) => { setS(o => ({ ...o, [k]: v })); setErr(e => ({ ...e, [k]: undefined })) }
  useEffect(() => { const f = e => { setSent(false); upd('interest', e.detail) }; addEventListener('yts:interest', f); return () => removeEventListener('yts:interest', f) }, [])
  const submit = e => {
    e.preventDefault()
    const er = {}
    if (s.name.trim().length < 2) er.name = t({ en: 'Please tell us your name', it: 'Indica il tuo nome' })
    const r = s.reach.trim()
    if (!/^\S+@\S+\.\S+$/.test(r) && r.replace(/\D/g, '').length < 7) er.reach = t({ en: 'An email or a phone number, please', it: 'Serve un’email o un numero di telefono' })
    setErr(er)
    if (!Object.keys(er).length) setSent(true)
  }
  return (
    <AnimatePresence mode="wait">
      {sent ? <Thanks key="ok" name={s.name} interest={s.interest} reset={() => { setS(empty); setSent(false) }} /> : (
        <motion.form key="form" onSubmit={submit} noValidate initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.5 }}>
          <div className="grid gap-x-8 md:grid-cols-2">
            <Field id="q-name" label={t({ en: 'Your name', it: 'Il tuo nome' })} value={s.name} onChange={v => upd('name', v)} error={err.name} autoComplete="name" />
            <Field id="q-reach" label={t({ en: 'Email or phone', it: 'Email o telefono' })} value={s.reach} onChange={v => upd('reach', v)} error={err.reach} autoComplete="email" />
          </div>
          <Chips name="interest" label={t({ en: 'I’m interested in', it: 'Mi interessa' })} value={s.interest} onChange={v => upd('interest', v)} options={INTERESTS.map(o => ({ k: o.k, label: t(o.t) }))} />
          <Chips name="pref" label={t({ en: 'Preferred language', it: 'Lingua preferita' })} value={s.pref || lang} onChange={v => upd('pref', v)} options={LANGS.map(o => ({ k: o.k, label: o.l }))} />
          <div className="mt-2"><Field id="q-msg" area label={t({ en: 'A few words (optional)', it: 'Qualche parola (facoltativo)' })} value={s.msg} onChange={v => upd('msg', v)} /></div>
          <div className="mt-10 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
            <button type="submit" className="group inline-flex h-14 items-center gap-4 rounded-full bg-[#151412] pl-7 pr-2 text-[14px] font-semibold text-[#ece7df] transition-colors hover:bg-[#b06a35]">
              {t({ en: 'Send private inquiry', it: 'Invia richiesta privata' })}
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[#ece7df] text-[#151412] transition-transform duration-500 group-hover:rotate-[-45deg]">
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 9h13M10 4l5 5-5 5" /></svg>
              </span>
            </button>
            <span className="max-w-[30ch] text-[12px] leading-snug text-[#151412]/50">{t({ en: 'Concept form — front-end only, nothing is sent.', it: 'Modulo dimostrativo — nulla viene inviato.' })}</span>
          </div>
        </motion.form>
      )}
    </AnimatePresence>
  )
}

function Footer() {
  const { t } = useLang()
  return (
    <footer className="bg-[#151412] text-[#ece7df]">
      <div className="mx-auto max-w-[1440px] px-5 pb-28 pt-16 md:px-10 md:pb-10">
        <div className="flex flex-col justify-between gap-10 md:flex-row md:items-end">
          <div className="text-[30vw] font-black leading-[.75] tracking-[-.06em] md:text-[17vw] 2xl:text-[240px]">YTS<span className="text-[#b06a35]">.</span></div>
          <div className="max-w-[46ch] text-[13px] leading-relaxed text-[#ece7df]/55">
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-[.2em] text-[#c3a15e]">YTS Group</div>
            {COMPANIES.join(' · ')}
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-[12px] text-[#ece7df]/50 md:flex-row md:items-center md:justify-between">
          <span>© YTS Group · {t({ en: 'Independent website concept, not affiliated', it: 'Concept di sito indipendente, non affiliato' })}</span>
          <div className="flex gap-6">
            <a href="https://yehiel-tsubery.com" target="_blank" rel="noopener" className="hover:text-[#ece7df]">yehiel-tsubery.com</a>
            <a href={PORTFOLIO} target="_blank" rel="noopener" className="hover:text-[#ece7df]">{t({ en: 'Concept by Artem', it: 'Concept di Artem' })}</a>
            <a href="#top" className="hover:text-[#ece7df]">{t({ en: 'Top ↑', it: 'Su ↑' })}</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default function Contact() {
  const { t } = useLang()
  const head = [t({ en: 'A private', it: 'Una conversazione' }), t({ en: 'conversation.', it: 'privata.' })]
  return (
    <section id="contact" className={`relative bg-[#ece7df] text-[#151412] ${T.sans}`}>
      <div className="mx-auto grid max-w-[1440px] gap-16 px-5 py-24 md:px-10 md:py-36 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <div className="text-[11px] font-semibold uppercase tracking-[.22em] text-[#b06a35]">{t({ en: '07 — Private inquiry', it: '07 — Richiesta privata' })}</div>
          <h2 className={`${T.serif} mt-5 text-[16vw] leading-[.86] tracking-[-.02em] lg:text-[6.6vw] 2xl:text-[96px]`}>
            {head.map((w, i) => (
              <span key={i} className="block overflow-hidden pb-[.06em]">
                <motion.span className={`inline-block ${i ? 'italic text-[#151412]/55' : ''}`} initial={{ y: '105%' }} whileInView={{ y: 0 }} viewport={{ once: true }} transition={{ duration: 1.1, ease: EASE, delay: i * 0.12 }}>{w}</motion.span>
              </span>
            ))}
          </h2>
          <p className="mt-8 max-w-[38ch] text-[16px] leading-relaxed text-[#151412]/70">{t({ en: 'About a residence on Lake Como or in Volterra, a building of your own, or an invitation to the club — tell the studio a little, in the language you prefer.', it: 'Per una residenza sul Lago di Como o a Volterra, un edificio tutto vostro o un invito al club — raccontate qualcosa allo studio, nella lingua che preferite.' })}</p>
          <dl className="mt-12 grid grid-cols-2 gap-8 border-t border-[#151412]/15 pt-8">
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-[.2em] text-[#151412]/45">{t({ en: 'Studio', it: 'Studio' })}</dt>
              <dd className={`${T.serif} mt-2 text-[26px] leading-[1.05]`}>Ramat Gan<span className="block text-[#151412]/50">{t({ en: 'Israel', it: 'Israele' })}</span></dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-[.2em] text-[#151412]/45">{t({ en: 'Residences', it: 'Residenze' })}</dt>
              <dd className={`${T.serif} mt-2 text-[26px] leading-[1.05]`}>Como · Volterra<span className="block text-[#151412]/50">{t({ en: 'Italy', it: 'Italia' })}</span></dd>
            </div>
          </dl>
          <div className="mt-8 h-[200px] overflow-hidden rounded-[22px] bg-[#e2dcd2]">
            <iframe title={t({ en: 'Map — Ramat Gan', it: 'Mappa — Ramat Gan' })} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-full w-full border-0 [filter:grayscale(1)_contrast(.95)_sepia(.12)]"
              src="https://maps.google.com/maps?q=Ramat%20Gan%2C%20Israel&z=12&output=embed" />
          </div>
          <a href="https://yehiel-tsubery.com" target="_blank" rel="noopener" className="group mt-8 inline-flex items-baseline gap-3 text-[15px] font-semibold">
            <span className="border-b border-[#151412]/30 pb-0.5 transition-colors group-hover:border-[#151412]">yehiel-tsubery.com</span>
            <span className="transition-transform duration-500 group-hover:translate-x-1">↗</span>
          </a>
        </div>
        <div className="lg:col-span-6 lg:col-start-7">
          <div className="rounded-[28px] bg-[#f4f0ea] p-6 shadow-[0_40px_100px_-50px_rgba(21,20,18,.35)] ring-1 ring-black/[.04] md:p-12">
            <Form />
          </div>
        </div>
      </div>
      <Footer />
    </section>
  )
}
