// tiny physical "click" for knobs and buttons (WebAudio, no files)
let ctx = null
let muted = false
export const setMuted = v => { muted = v }
export const isMuted = () => muted
export function click(f = 1900, d = 0.035, v = 0.12) {
  if (muted) return
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)()
    const t = ctx.currentTime
    const o = ctx.createOscillator(), g = ctx.createGain()
    o.type = 'square'
    o.frequency.setValueAtTime(f, t)
    o.frequency.exponentialRampToValueAtTime(f * 0.35, t + d)
    g.gain.setValueAtTime(v, t)
    g.gain.exponentialRampToValueAtTime(0.0001, t + d)
    o.connect(g).connect(ctx.destination)
    o.start(t); o.stop(t + d + 0.02)
  } catch (e) { /* audio not available */ }
  try { navigator.vibrate && navigator.vibrate(6) } catch (e) { }
}
