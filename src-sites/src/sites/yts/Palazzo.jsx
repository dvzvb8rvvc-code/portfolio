import React from 'react'
import { useLang } from './i18n'
// STUB — owned by one agent. Root element must be <section id="..."> (see yts.jsx).
export default function Palazzo() { const { t } = useLang(); return <section id="palazzo" className="min-h-[60vh] grid place-items-center text-3xl">Palazzo</section> }
