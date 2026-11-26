import React from 'react'
import { motion } from 'framer-motion'
import { useLang } from './i18n'
import { T, PERSON, SERVICES, SCALE } from './data'
import { MaskLine } from './motion'
import { DISPLAY, Pill } from './Hero'

/* STUDIO v8 — services, compact and typographic (Delta-like): giant condensed title with serif
   connectors, a strip of real facts, five numbered services drawn in with a thin line. */

const E = [0.22, 1, 0.36, 1]
const S = {
  label: { en: 'The studio · Services', it: 'Lo studio · Servizi' },
  a: { en: 'The whole', it: 'Tutto il' }, b: { en: 'project,', it: 'progetto,' },
  under: { en: 'under', it: 'sotto' }, c: { en: 'one roof', it: 'un solo tetto' },
  lead: { en: 'One integrated package: the same team carries a project from the big picture to the last interior detail — and, through YTS Group, develops residences in Italy.', it: 'Un unico percorso integrato: lo stesso team porta il progetto dalla visione d’insieme all’ultimo dettaglio d’interni — e, con YTS Group, sviluppa residenze in Italia.' },
  cta: { en: 'Private inquiry', it: 'Richiesta privata' },
}
const FACTS = [
  [{ en: 'Founded', it: 'Fondato' }, () => String(PERSON.studioSince)],
  [{ en: 'Studio', it: 'Studio' }, t => t(PERSON.office)],
  [{ en: 'Working in', it: 'Operativi in' }, t => t({ en: 'Israel · Italy', it: 'Israele · Italia' })],
  [{ en: 'Designed in', it: 'Progettato in' }, () => PERSON.tech.join(' · ')],
]

function Service({ s, i }) {
  const { t } = useLang()
  return (
    <motion.li initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-8% 0px' }} transition={{ duration: 1, ease: E, delay: i * .08 }}
      className="group relative pt-5 md:pt-7">
      <motion.span aria-hidden initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1.4, ease: E, delay: .1 + i * .08 }}
        className="absolute inset-x-0 top-0 h-px origin-left bg-[#efe0cc]/20" />
      <span aria-hidden className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-[#c3a15e] transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-x-100" />
      <div className="flex gap-5 md:block">
        <span className={`${DISPLAY} block w-12 shrink-0 text-[40px] font-[500] leading-[.8] text-[#efe0cc]/25 transition-colors duration-500 group-hover:text-[#c3a15e] md:w-auto md:text-[72px]`}>{s.k}</span>
        <div className="min-w-0">
          <h3 className={`${T.serif} text-[24px] leading-[1.05] text-[#f2e6d4] md:mt-6 md:text-[27px]`}>{t(s.t)}</h3>
          <p className={`${T.sans} mt-2 text-[14.5px] leading-[1.55] text-[#efe0cc]/62 md:mt-3 md:text-[14px]`}>{t(s.d)}</p>
        </div>
      </div>
    </motion.li>
  )
}

export default function Studio() {
  const { t, lang } = useLang()
  return (
    <section id="studio" className={`relative isolate overflow-hidden text-[#f2e6d4] ${T.sans}`}
      style={{ background: 'linear-gradient(180deg,#140d09 0%,#14150f 38%,#11120d 70%,#0b0a08 100%)' }}>
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(55%_40%_at_85%_30%,rgba(70,80,48,.22),transparent_70%)]" />
      <div className="mx-auto max-w-[1440px] px-5 pb-24 pt-20 md:px-10 md:pb-32 md:pt-32">
        <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[.28em] text-[#efe0cc]/70"><span className="h-px w-8 bg-[#c3a15e]" />{t(S.label)}</p>
        <div className="mt-6 grid gap-8 md:mt-8 md:grid-cols-[1.35fr_1fr] md:items-end md:gap-16">
          <h2 key={lang} className={`${DISPLAY} font-[600] uppercase leading-[.86] text-[clamp(52px,15vw,76px)] md:text-[clamp(76px,7.6vw,132px)]`}>
            <MaskLine>{t(S.a)}</MaskLine>
            <MaskLine i={1}>{t(S.b)}</MaskLine>
            <MaskLine i={2}><span className={`${T.serif} mr-[.14em] align-[.1em] text-[.44em] font-normal normal-case italic tracking-normal text-[#d9bf86]`}>{t(S.under)}</span>{t(S.c)}</MaskLine>
          </h2>
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1.1, ease: E, delay: .2 }} className="md:pb-3">
            <p className={`${T.serif} text-[21px] italic leading-[1.35] text-[#efe0cc]/85 md:text-[25px]`}>{t(S.lead)}</p>
            <div className="mt-6 flex flex-wrap items-center gap-2">
              {(SCALE[lang] || SCALE.en).map(x => <span key={x} className="rounded-full border border-[#efe0cc]/20 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[.2em] text-[#efe0cc]/75">{x}</span>)}
            </div>
          </motion.div>
        </div>

        <dl className="mt-14 grid grid-cols-2 gap-x-6 gap-y-6 border-y border-[#efe0cc]/12 py-6 md:mt-20 md:grid-cols-4 md:py-7">
          {FACTS.map(([k, v], i) => (
            <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1, delay: i * .08 }}>
              <dt className="text-[11px] font-semibold uppercase tracking-[.26em] text-[#c3a15e]">{t(k)}</dt>
              <dd className={`${DISPLAY} mt-2 text-[26px] font-[500] uppercase leading-none tracking-[.01em] text-[#f2e6d4] md:text-[34px]`}>{v(t)}</dd>
            </motion.div>
          ))}
        </dl>

        <ol className="mt-12 grid gap-8 md:mt-16 md:grid-cols-5 md:gap-7">
          {SERVICES.map((s, i) => <Service key={s.k} s={s} i={i} />)}
        </ol>

        <div className="mt-14 flex flex-wrap items-center gap-x-8 gap-y-5 md:mt-20">
          <Pill href="#contact">{t(S.cta)}</Pill>
          <p className="max-w-[52ch] text-[13px] leading-[1.6] text-[#efe0cc]/50">{PERSON.edu.map(e => t(e)).join(' · ')}</p>
        </div>
      </div>
    </section>
  )
}
