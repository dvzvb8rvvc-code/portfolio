import React, { Suspense, createContext, useContext, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

/* ===================== V3 SINGLE-CANVAS ENGINE =====================
   ONE fixed WebGL canvas for the whole page (no per-section canvases → no context creation /
   shader compile hitches when you scroll into a section).

   DOM side (in a section component):
     const ref = useRef(); useStage('hero', ref)
     <div ref={ref} className="relative h-[220vh]"> sticky DOM overlay (text) … </div>
   The engine tracks that element every frame and gives the matching scene a `track` ref:
     track.current = { p, v, on }
       p  = progress 0..1  (0 when element top hits viewport top, 1 when element bottom hits viewport bottom)
       v  = visibility 0..1 (how much of the viewport the element covers; use for fades between scenes)
       on = true while any part of the element is within ±0.5 viewport
   Scene side (3D, in scene*.jsx): export default function SceneX({ track }) { … }
     - ALWAYS mounted (so textures load & shaders compile once, at start). Read track.current in useFrame.
     - When !on: set group.visible = false and return early in useFrame (zero cost).
     - Never setState per frame. Damp everything (THREE.MathUtils.damp) → buttery.
     - Each scene owns its camera framing: use the shared camera only while it is the ACTIVE scene
       (stage.active === id). Helper: useActive(id).
   Register scenes in SCENES below (lead edits this list).
==================================================================== */

const SCENES = {
  hero: React.lazy(() => import('./sceneHero')),
  sketch: React.lazy(() => import('./sceneSketch')),
  como: React.lazy(() => import('./sceneComo')),
  palazzo: React.lazy(() => import('./scenePalazzo')),
  models: React.lazy(() => import('./sceneModels')),
}

const StageCtx = createContext(null)
const store = { els: {}, tracks: {}, active: null }
export const stage = store
Object.keys(SCENES).forEach(id => { store.tracks[id] = { current: { p: 0, v: 0, on: false } } })

export function useStage(id, ref) {
  useEffect(() => { store.els[id] = ref.current; return () => { if (store.els[id] === ref.current) delete store.els[id] } }, [id, ref])
}
export function useActive(id) { return () => store.active === id }

function Tracker() {
  useFrame(() => {
    const vh = window.innerHeight
    let best = null, bestV = 0
    for (const id in store.tracks) {
      const el = store.els[id], tr = store.tracks[id].current
      if (!el) { tr.on = false; tr.v = 0; continue }
      const r = el.getBoundingClientRect()
      const span = Math.max(1, r.height - vh)
      tr.p = Math.min(1, Math.max(0, -r.top / span))
      const vis = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0)) / vh
      tr.v = vis
      tr.on = r.bottom > -vh * 0.5 && r.top < vh * 1.5
      if (vis > bestV) { bestV = vis; best = id }
    }
    store.active = bestV > 0.02 ? best : null
  }, -100)
  return null
}

// Pre-compile all materials once everything has loaded → no first-view hitch.
function Precompile() {
  const { gl, scene, camera } = useThree()
  useEffect(() => { const t = setTimeout(() => { try { gl.compile(scene, camera) } catch (e) {} }, 300); return () => clearTimeout(t) }, [gl, scene, camera])
  return null
}

// Canvas fades out completely when no scene is on screen (and stops rendering).
function Idle({ setVisible }) {
  const last = useRef(true)
  useFrame(() => {
    const any = Object.values(store.tracks).some(t => t.current.on)
    if (any !== last.current) { last.current = any; setVisible(any) }
  })
  return null
}

export function Stage({ lite }) {
  const [visible, setVisible] = useState(true)
  if (lite) return null
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-500" style={{ opacity: visible ? 1 : 0 }}>
      <Canvas
        dpr={[1, Math.min(1.5, window.devicePixelRatio || 1)]}
        gl={{ antialias: true, powerPreference: 'high-performance', alpha: true, stencil: false }}
        camera={{ position: [0, 0, 5], fov: 40, near: 0.05, far: 200 }}
        onCreated={({ gl }) => { gl.toneMapping = THREE.ACESFilmicToneMapping; gl.outputColorSpace = THREE.SRGBColorSpace; gl.setClearColor(0x000000, 0) }}
      >
        <Tracker />
        <Idle setVisible={setVisible} />
        {Object.entries(SCENES).map(([id, S]) => <Suspense key={id} fallback={null}><S track={store.tracks[id]} /><Precompile /></Suspense>)}
      </Canvas>
    </div>
  )
}
