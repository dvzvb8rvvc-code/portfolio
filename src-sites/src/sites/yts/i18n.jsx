import React, { createContext, useContext, useEffect, useState } from 'react'
// Two languages: 'en' | 'it'. Every user-visible string must exist in both.
// Usage: const { lang, setLang, t } = useLang();  t({ en: 'Hello', it: 'Ciao' })  or t('nav.studio') for keys in STR.
export const STR = {
  'nav.studio': { en: 'Studio', it: 'Studio' },
  'nav.residences': { en: 'Residences', it: 'Residenze' },
  'nav.works': { en: 'Works', it: 'Progetti' },
  'nav.founder': { en: 'Founder', it: 'Fondatore' },
  'nav.club': { en: 'Club', it: 'Club' },
  'nav.contact': { en: 'Contact', it: 'Contatti' },
  'cta.inquire': { en: 'Private inquiry', it: 'Richiesta privata' },
  'skip': { en: 'Skip', it: 'Salta' },
}
const Ctx = createContext({ lang: 'en', setLang: () => {}, t: x => x })
export function LangProvider({ children }) {
  const [lang, setLangS] = useState(() => {
    try { const q = new URLSearchParams(location.search).get('lang'); if (q === 'it' || q === 'en') return q; const s = localStorage.getItem('yts-lang'); if (s) return s } catch (e) {}
    return (navigator.language || '').startsWith('it') ? 'it' : 'en'
  })
  const setLang = l => { setLangS(l); try { localStorage.setItem('yts-lang', l) } catch (e) {} }
  useEffect(() => { document.documentElement.lang = lang }, [lang])
  const t = x => { if (typeof x === 'string') return (STR[x] && STR[x][lang]) || x; if (x && typeof x === 'object') return x[lang] ?? x.en; return x }
  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>
}
export const useLang = () => useContext(Ctx)
