import { useEffect } from 'react'
import { stage } from './engine'

/* ===================== FILM STEPPER (v7) =====================
   The reference sites (CIAO etc.) don't scrub animations with the scroll wheel: one gesture = one
   beat, played at a fixed, designed speed, never skipped. We do the same WITHOUT touching the films:
   inside every film wrapper the page scroll itself is animated from stop to stop at a fixed duration,
   so all scroll-driven scenes/overlays play their beat fully and smoothly.
   - STEPS[id] = number of beats; stops at top + span * k / n (k = 0..n).
   - wheel / keys / touch swipes inside (or just before) a film → animate to the next stop.
   - input during a beat (incl. trackpad inertia) is swallowed; after the last stop normal scroll resumes.
============================================================== */
export const STEPS = { hero: 3, sketch: 4, models: 6, como: 4, palazzo: 6 }
const DUR = 1.7          // seconds per beat
const ENTRY = 0.55       // fraction of viewport above a film where a downward gesture snaps into it
const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

function films() {
  const vh = window.innerHeight, y0 = window.scrollY
  const out = []
  for (const id in STEPS) {
    const el = stage.els[id]; if (!el) continue
    const r = el.getBoundingClientRect(), top = r.top + y0, span = Math.max(0, el.offsetHeight - vh)
    if (span < 8) continue
    const n = STEPS[id], stops = []
    for (let k = 0; k <= n; k++) stops.push(Math.round(top + (span * k) / n))
    out.push({ id, top, end: top + span, stops })
  }
  return out.sort((a, b) => a.top - b.top)
}

if (typeof window !== "undefined") window.__films = () => films()
export function useFilmStepper(enabled = true) {
  useEffect(() => {
    if (!enabled || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let busy = false, busyUntil = 0, lastWheel = 0, touchY = null, touchT = 0
    const now = () => performance.now()
    const curY = () => (window.__lenis ? window.__lenis.scroll : window.scrollY)

    // which stop to go to for a gesture in direction dir (+1 down / -1 up); null = not ours
    function target(dir) {
      const y = curY(), vh = window.innerHeight
      for (const f of films()) {
        const first = f.stops[0], last = f.stops[f.stops.length - 1]
        if (dir > 0) {
          if (y >= first - vh * ENTRY && y < last - 3) return f.stops.find(s => s > y + 3)
        } else {
          if (y > first + 3 && y <= last + vh * ENTRY) { const c = [...f.stops].reverse().find(s => s < y - 3); return c ?? first }
        }
      }
      return null
    }
    function go(to) {
      busy = true
      const done = () => { busy = false; busyUntil = now() + 260 }
      if (window.__lenis) window.__lenis.scrollTo(to, { duration: DUR, easing: ease, lock: true, force: true, onComplete: done })
      else { window.scrollTo({ top: to, behavior: 'smooth' }); setTimeout(done, DUR * 1000) }
      setTimeout(() => { if (busy) done() }, DUR * 1000 + 400) // safety
    }
    function gesture(dir, e) {
      const t = target(dir)
      if (t == null) return false
      if (e) { e.preventDefault(); e.stopImmediatePropagation() }
      if (busy || now() < busyUntil) return true
      go(t)
      return true
    }

    const onWheel = e => {
      if (e.ctrlKey) return // pinch-zoom
      const t = now(), gap = t - lastWheel; lastWheel = t
      const dir = Math.sign(e.deltaY); if (!dir) return
      if (target(dir) == null) return
      e.preventDefault(); e.stopImmediatePropagation()
      // one beat per gesture: a continuous stream (trackpad inertia) only triggers once
      if (busy || t < busyUntil || (gap < 140 && t < busyUntil + 600)) { busyUntil = Math.max(busyUntil, t + 120); return }
      if (Math.abs(e.deltaY) < 4) return
      go(target(dir))
    }
    const onKey = e => {
      const k = e.key
      if (/input|textarea|select/i.test(e.target?.tagName || '')) return
      const dir = k === 'ArrowDown' || k === 'PageDown' || (k === ' ' && !e.shiftKey) ? 1 : k === 'ArrowUp' || k === 'PageUp' || (k === ' ' && e.shiftKey) ? -1 : 0
      if (dir) gesture(dir, e)
    }
    const onTouchStart = e => { touchY = e.touches[0].clientY; touchT = now() }
    const onTouchMove = e => {
      if (touchY == null) return
      const dy = touchY - e.touches[0].clientY, dir = Math.sign(dy) || 1
      if (busy || target(dir) != null) e.preventDefault() // inside a film: no native scroll
    }
    const onTouchEnd = e => {
      if (touchY == null) return
      const dy = touchY - (e.changedTouches[0]?.clientY ?? touchY); touchY = null
      if (Math.abs(dy) < 28 || now() - touchT > 1200) return
      gesture(Math.sign(dy), null)
    }
    // native momentum (touch) carrying the page INTO a film mid-way → settle on the next stop
    let lastY = window.scrollY
    const onScroll = () => {
      const y = window.scrollY, dir = Math.sign(y - lastY); lastY = y
      if (busy || !dir || window.__lenis?.isSmooth) return
      for (const f of films()) if (y > f.stops[0] + 3 && y < f.stops[f.stops.length - 1] - 3) {
        const t = dir > 0 ? f.stops.find(s => s > y) : [...f.stops].reverse().find(s => s < y)
        if (t != null) go(t)
        break
      }
    }
    window.addEventListener('wheel', onWheel, { capture: true, passive: false })
    window.addEventListener('keydown', onKey, { capture: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('wheel', onWheel, { capture: true })
      window.removeEventListener('keydown', onKey, { capture: true })
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('scroll', onScroll)
    }
  }, [enabled])
}
