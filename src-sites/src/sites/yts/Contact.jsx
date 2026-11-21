import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { PORTFOLIO } from '../../lib/kit'
import { useLang } from './i18n'
import { T, COMPANIES, img } from './data'

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
    <label htmlFor={id} className="group relative block pt-5">
      <Tag id={id} type={area ? undefined : type} value={value} onChange={e => onChange(e.target.value)} placeholder=" " rows={area ? 2 : undefined} autoComplete={autoComplete}
        aria-invalid={!!error}
        className={`peer block w-full resize-none border-0 border-b bg-transparent pb-2.5 pt-1 text-[18px] text-[#ece7df] outline-none transition-colors placeholder:text-transparent ${error ? 'border-[#e9a25c]' : 'border-[#ece7df]/25 focus:border-[#ece7df]'}`} />
      <span className="pointer-events-none absolute left-0 top-7 origin-left text-[17px] text-[#ece7df]/55 transition-all duration-300 peer-focus:top-0 peer-focus:text-[11px] peer-focus:font-semibold peer-focus:uppercase peer-focus:tracking-[.18em] peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:font-semibold peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-[.18em]">{label}</span>
      <span className="pointer-events-none absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-[#e9a25c] transition-transform duration-500 peer-focus:scale-x-100" />
      {error && <span className="absolute -bottom-5 left-0 text-[11.5px] text-[#f0b47a]">{error}</span>}
    </label>
  )
}

function Chips({ label, options, value, onChange, name }) {
  return (
    <div role="group" aria-label={label} className="pt-7">
      <div className="text-[11px] font-semibold uppercase tracking-[.18em] text-[#ece7df]/55">{label}</div>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map(o => {
          const on = value === o.k
          return (
            <button type="button" key={o.k} onClick={() => onChange(o.k)} aria-pressed={on} name={name}
              className={`relative h-9 rounded-full border px-4 text-[13px] font-medium transition-colors duration-300 ${on ? 'border-[#ece7df] text-[#151412]' : 'border-[#ece7df]/25 text-[#ece7df]/85 hover:border-[#ece7df]/60'}`}>
              {on && <motion.span layoutId={'chip-' + name} className="absolute inset-0 rounded-full bg-[#ece7df]" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
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
    <motion.div key="ok" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.8, ease: EASE }} className="flex min-h-[440px] flex-col justify-center" role="status">
      <svg viewBox="0 0 160 200" className="h-[110px] w-[88px] text-[#ece7df]" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round">
        {['M10 200 V80 A70 70 0 0 1 150 80 V200', 'M10 132 H150', 'M30 146 Q60 140 80 146 T130 146', 'M44 160 Q70 155 90 160 T120 160'].map((d, i) => <motion.path key={i} d={d} {...draw(d, i)} />)}
        <motion.circle cx="104" cy="104" r="14" stroke="#e9a25c" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.4, delay: 1, ease: EASE }} />
      </svg>
      <h3 className={`${T.serif} mt-6 text-[56px] leading-[.92] md:text-[76px]`}>
        <span className="block overflow-hidden"><motion.span className="inline-block" initial={{ y: '100%' }} animate={{ y: 0 }} transition={{ duration: 1, ease: EASE, delay: 0.3 }}>Grazie{first ? ',' : '.'}</motion.span></span>
        {first && <span className="block overflow-hidden"><motion.span className="inline-block italic text-[#e9a25c]" initial={{ y: '100%' }} animate={{ y: 0 }} transition={{ duration: 1, ease: EASE, delay: 0.42 }}>{first}.</motion.span></span>}
      </h3>
      <p className="mt-6 max-w-[40ch] text-[16px] leading-relaxed text-[#ece7df]/75">
        {t({ en: 'Your note would now be on its way to the studio in Ramat Gan', it: 'La tua richiesta sarebbe ora in viaggio verso lo studio di Ramat Gan' })}{interest ? t({ en: ' — tagged “', it: ' — con oggetto “' }) + t(INTERESTS.find(x => x.k === interest).t) + '”' : ''}.
      </p>
      <p className="mt-4 max-w-[44ch] rounded-2xl bg-white/[.07] px-4 py-3 text-[13px] leading-relaxed text-[#ece7df]/70">{t({ en: 'This is a design concept: nothing was sent and nothing was stored.', it: 'Questo è un concept di design: nessun dato è stato inviato né salvato.' })}</p>
      <button onClick={reset} className="mt-8 self-start text-[13px] font-semibold underline decoration-[#ece7df]/30 underline-offset-4 hover:decoration-[#ece7df]">{t({ en: 'Write another note', it: 'Scrivi un’altra richiesta' })}</button>
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
          <div className="mt-8 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
            <button type="submit" className="group inline-flex h-14 items-center gap-4 rounded-full bg-[#ece7df] pl-7 pr-2 text-[14px] font-semibold text-[#151412] transition-colors hover:bg-[#e9a25c]">
              {t({ en: 'Send private inquiry', it: 'Invia richiesta privata' })}
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[#151412] text-[#ece7df] transition-transform duration-500 group-hover:rotate-[-45deg]">
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 9h13M10 4l5 5-5 5" /></svg>
              </span>
            </button>
            <span className="max-w-[30ch] text-[12px] leading-snug text-[#ece7df]/55">{t({ en: 'Concept form — front-end only, nothing is sent.', it: 'Modulo dimostrativo — nulla viene inviato.' })}</span>
          </div>
        </motion.form>
      )}
    </AnimatePresence>
  )
}

const GROUP_LINE = COMPANIES

function Footer() {
  const { t } = useLang()
  return (
    <footer className="relative bg-[#0f0f12] text-[#ece7df]">
      <div className="mx-auto max-w-[1440px] px-5 pb-28 pt-12 md:px-10 md:pb-8">
        <div className="grid items-end gap-8 md:grid-cols-12">
          <div className="text-[28vw] font-black leading-[.74] tracking-[-.06em] md:col-span-5 md:text-[11vw] 2xl:text-[160px]">YTS<span className="text-[#b06a35]">.</span></div>
          <div className="md:col-span-7">
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-[.2em] text-[#c3a15e]">YTS Group</div>
            <ul className="flex flex-wrap gap-x-5 gap-y-1.5 text-[13px] text-[#ece7df]/60">
              {GROUP_LINE.map(c => <li key={c}>{c}</li>)}
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-5 text-[12px] text-[#ece7df]/50 md:flex-row md:items-center md:justify-between">
          <span>© YTS Group · {t({ en: 'Independent website concept, not affiliated', it: 'Concept di sito indipendente, non affiliato' })}</span>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <a href="https://yehiel-tsubery.com" target="_blank" rel="noopener" className="hover:text-[#ece7df]">yehiel-tsubery.com</a>
            <a href={PORTFOLIO} className="hover:text-[#ece7df]">{t({ en: 'Concept by Artem', it: 'Concept di Artem' })}</a>
            <a href="#top" className="hover:text-[#ece7df]">{t({ en: 'Top ↑', it: 'Su ↑' })}</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

/* v3: no canvas — Lake Como panorama (129) tinted to dusk with CSS, slow Ken Burns drift (transform only) */
function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <img src={img(129)} alt="" loading="lazy" decoding="async" width="1800" height="700"
        className="yts-kb absolute inset-0 h-full w-full object-cover object-[60%_50%] [filter:brightness(.85)_saturate(.85)_contrast(1.05)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(26,31,51,.85)_0%,rgba(60,58,96,.35)_40%,rgba(214,130,70,.35)_64%,rgba(15,15,18,.9)_100%)] mix-blend-multiply" />
      <div className="absolute inset-0 bg-[radial-gradient(50%_40%_at_72%_58%,rgba(233,162,92,.28),transparent_70%)] mix-blend-screen" />
      <div className="absolute inset-y-0 left-0 hidden w-[55%] bg-gradient-to-r from-[#14161d]/75 to-transparent lg:block" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0f0f12] to-transparent" />
      <style>{`@keyframes ytsKb{from{transform:scale(1.08) translate3d(-1.5%,0,0)}to{transform:scale(1.16) translate3d(1.5%,-1%,0)}}.yts-kb{animation:ytsKb 28s ease-in-out infinite alternate;will-change:transform}@media (prefers-reduced-motion:reduce){.yts-kb{animation:none;transform:scale(1.08)}}`}</style>
    </div>
  )
}

export default function Contact() {
  const { t } = useLang()
  const head = [t({ en: 'A private', it: 'Una conversazione' }), t({ en: 'conversation.', it: 'privata.' })]
  return (
    <section id="contact" className={`relative bg-[#14161d] text-[#ece7df] ${T.sans}`}>
      <div className="relative overflow-hidden">
        <Backdrop />
        <div className="relative mx-auto grid max-w-[1440px] gap-10 px-5 py-20 md:px-10 md:py-24 lg:grid-cols-12 lg:gap-10">
          <div className="flex flex-col lg:col-span-5">
            <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[.22em] text-[#e9a25c]"><span className="h-px w-8 bg-current opacity-60" />{t({ en: '06 — Private inquiry', it: '06 — Richiesta privata' })}</div>
            <h2 className={`${T.serif} mt-5 text-[12.5vw] leading-[.86] tracking-[-.02em] lg:text-[6vw] 2xl:text-[88px]`}>
              {head.map((w, i) => (
                <span key={i} className="block overflow-hidden pb-[.06em]">
                  <motion.span className={`inline-block ${i ? 'italic text-[#e9a25c]' : ''}`} initial={{ y: '105%' }} whileInView={{ y: 0 }} viewport={{ once: true }} transition={{ duration: 1.1, ease: EASE, delay: i * 0.12 }}>{w}</motion.span>
                </span>
              ))}
            </h2>
            <p className="mt-6 max-w-[38ch] text-[15.5px] leading-relaxed text-[#ece7df]/75">{t({ en: 'About a residence on Lake Como or in Volterra, a building of your own, or an invitation to the club — tell the studio a little, in the language you prefer.', it: 'Per una residenza sul Lago di Como o a Volterra, un edificio tutto vostro o un invito al club — raccontate qualcosa allo studio, nella lingua che preferite.' })}</p>
            <div className="mt-8 border-t border-[#ece7df]/20 pt-5">
              <div className="text-[10.5px] font-semibold uppercase tracking-[.2em] text-[#ece7df]/50">{t({ en: 'Offices', it: 'Sedi' })}</div>
              <div className={`${T.serif} mt-2 text-[22px] leading-[1.2] md:text-[24px]`}>Ramat Gan <span className="text-[#ece7df]/45">·</span> Como <span className="text-[#ece7df]/45">·</span> Volterra</div>
              <div className="mt-1 text-[12px] text-[#ece7df]/50">{t({ en: 'Studio in Israel · residences in Italy', it: 'Studio in Israele · residenze in Italia' })}</div>
            </div>
            <div className="mt-6 h-[130px] overflow-hidden rounded-[16px] bg-white/10 ring-1 ring-white/15">
              <iframe title={t({ en: 'Map — Ramat Gan', it: 'Mappa — Ramat Gan' })} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-full w-full border-0 opacity-80 [filter:grayscale(1)_invert(.9)_contrast(.9)]"
                src="https://maps.google.com/maps?q=Ramat%20Gan%2C%20Israel&z=12&output=embed" />
            </div>
            <a href="https://yehiel-tsubery.com" target="_blank" rel="noopener" className="group mt-6 inline-flex items-baseline gap-3 self-start text-[15px] font-semibold">
              <span className="border-b border-[#ece7df]/30 pb-0.5 transition-colors group-hover:border-[#ece7df]">yehiel-tsubery.com</span>
              <span className="transition-transform duration-500 group-hover:translate-x-1">↗</span>
            </a>
          </div>
          <div className="lg:col-span-6 lg:col-start-7 lg:self-center">
            <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-10%' }} transition={{ duration: 1.1, ease: EASE }}
              className="relative overflow-hidden rounded-[24px] bg-[#1b1f29]/40 p-6 shadow-[0_50px_120px_-40px_rgba(0,0,0,.7)] ring-1 ring-white/15 backdrop-blur-xl backdrop-saturate-150 md:p-9">
              <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[24px] bg-[linear-gradient(135deg,rgba(255,255,255,.14),rgba(255,255,255,0)_40%,rgba(233,162,92,.08)_100%)]" />
              <div aria-hidden className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
              <div className="relative"><Form /></div>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </section>
  )
}
