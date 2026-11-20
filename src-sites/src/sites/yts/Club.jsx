import React from 'react'
import { useLang } from './i18n'
// STUB — owned by one agent. Root element must be <section id="..."> (see yts.jsx).
export default function Club() { const { t } = useLang(); return <section id="club" className="min-h-[60vh] grid place-items-center text-3xl">Club</section> }
