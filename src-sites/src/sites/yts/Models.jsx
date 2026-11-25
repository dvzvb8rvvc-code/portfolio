import React, { useRef } from 'react'
import { useStage } from './engine'
// STUB — maquette showcase section (CIAO-style). Owned by the showcase agent.
export default function Models() { const ref = useRef(); useStage('models', ref); return <section id="models"><div ref={ref} className="h-[100vh]" /></section> }
