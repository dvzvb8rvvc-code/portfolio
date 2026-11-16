/* Lo-fi chord pad, synthesised live with WebAudio. No audio files, starts only on user click. */
const mtof = m => 440 * 2 ** ((m - 69) / 12)
export const CHORDS = [
  ['Fmaj7', [41, 53, 57, 60, 64]],
  ['Em7', [40, 52, 55, 59, 62]],
  ['Dm9', [38, 53, 57, 60, 64]],
  ['Cmaj7', [36, 52, 55, 59, 64]],
]
const BPM = 72, BEAT = 60 / BPM

export const level = { v: 0 }
const state = { on: false, muted: false, chord: 0 }
const subs = new Set()
const emit = () => subs.forEach(f => f({ ...state }))
export const subscribe = f => { subs.add(f); f({ ...state }); return () => subs.delete(f) }

let E = null, timer = null, raf = 0, beat = 0, nextT = 0, stopT = null

function build() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)()
  const sr = ctx.sampleRate
  const bus = ctx.createGain(); bus.gain.value = 1
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1300; lp.Q.value = 0.6
  const lfo = ctx.createOscillator(); lfo.frequency.value = 0.13
  const lfoG = ctx.createGain(); lfoG.gain.value = 420
  lfo.connect(lfoG).connect(lp.frequency); lfo.start()
  const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 3
  const master = ctx.createGain(); master.gain.value = 0
  const an = ctx.createAnalyser(); an.fftSize = 256; an.smoothingTimeConstant = 0.75
  lp.connect(bus); bus.connect(comp); comp.connect(master); master.connect(ctx.destination)
  comp.connect(an) // analyser before master: visuals keep breathing when muted

  const nb = ctx.createBuffer(1, sr * 1, sr), nd = nb.getChannelData(0)
  for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1
  // vinyl crackle bed
  const cb = ctx.createBuffer(1, sr * 3, sr), cd = cb.getChannelData(0)
  for (let i = 0; i < cd.length; i++) cd[i] = Math.random() < 0.0007 ? (Math.random() * 2 - 1) * 0.7 : (Math.random() * 2 - 1) * 0.01
  const cr = ctx.createBufferSource(); cr.buffer = cb; cr.loop = true
  const chp = ctx.createBiquadFilter(); chp.type = 'highpass'; chp.frequency.value = 1200
  const cg = ctx.createGain(); cg.gain.value = 0.22
  cr.connect(chp).connect(cg).connect(comp); cr.start()
  return { ctx, lp, comp, master, an, nb, td: new Uint8Array(an.fftSize), fd: new Uint8Array(an.frequencyBinCount) }
}

function pad(t, notes, dur) {
  const { ctx, lp } = E
  notes.forEach((m, k) => {
    [-8, 8].forEach(det => {
      const o = ctx.createOscillator(); o.type = k === 0 ? 'sine' : 'triangle'
      o.frequency.value = mtof(m); o.detune.value = det + (Math.random() - 0.5) * 6
      const g = ctx.createGain(), peak = k === 0 ? 0.14 : 0.045
      g.gain.setValueAtTime(0, t)
      g.gain.linearRampToValueAtTime(peak, t + 0.9)
      g.gain.setTargetAtTime(peak * 0.65, t + 1, 1.2)
      g.gain.setTargetAtTime(0, t + dur - 0.2, 0.35)
      o.connect(g).connect(lp); o.start(t); o.stop(t + dur + 2)
    })
  })
}
function kick(t, v = 1) {
  const { ctx, comp } = E
  const o = ctx.createOscillator(), g = ctx.createGain()
  o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.14)
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.5 * v, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.38)
  o.connect(g).connect(comp); o.start(t); o.stop(t + 0.4)
}
function noise(t, type, freq, gain, decay) {
  const { ctx, comp, nb } = E
  const s = ctx.createBufferSource(); s.buffer = nb
  const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq
  const g = ctx.createGain()
  g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0001, t + decay)
  s.connect(f).connect(g).connect(comp); s.start(t, Math.random() * 0.5); s.stop(t + decay + 0.05)
}

function schedule() {
  const { ctx } = E
  while (nextT < ctx.currentTime + 0.35) {
    const b = beat % 4, bar = Math.floor(beat / 4)
    if (b === 0) {
      const ci = bar % CHORDS.length
      pad(nextT, CHORDS[ci][1], BEAT * 4)
      const d = Math.max(0, (nextT - ctx.currentTime) * 1000)
      setTimeout(() => { state.chord = ci; emit() }, d)
    }
    if (b === 0 || b === 2) kick(nextT)
    if (b === 2 && bar % 2) kick(nextT + BEAT * 0.5, 0.55)
    if (b === 1 || b === 3) noise(nextT, 'bandpass', 1800, 0.09, 0.14)
    noise(nextT, 'highpass', 7500, 0.025, 0.04)
    noise(nextT + BEAT * 0.58, 'highpass', 7500, 0.018, 0.04) // swung off-beat hat
    nextT += BEAT; beat++
  }
}

function meter() {
  if (!E) return
  E.an.getByteTimeDomainData(E.td)
  let s = 0
  for (let i = 0; i < E.td.length; i++) { const x = (E.td[i] - 128) / 128; s += x * x }
  const rms = Math.sqrt(s / E.td.length)
  level.v += (Math.min(1, rms * 4.5) - level.v) * 0.25
  raf = requestAnimationFrame(meter)
}
export function freq() { if (!E || !state.on) return null; E.an.getByteFrequencyData(E.fd); return E.fd }

export function start() {
  if (state.on) return
  try { if (!E) E = build() } catch (e) { return }
  clearTimeout(stopT)
  E.ctx.resume()
  const t = E.ctx.currentTime
  E.master.gain.cancelScheduledValues(t); E.master.gain.setValueAtTime(E.master.gain.value, t)
  E.master.gain.linearRampToValueAtTime(state.muted ? 0 : 0.8, t + 1.4)
  beat = 0; nextT = t + 0.08
  timer = setInterval(schedule, 90); schedule()
  cancelAnimationFrame(raf); meter()
  state.on = true; emit()
}
export function stop() {
  if (!state.on || !E) return
  const t = E.ctx.currentTime
  E.master.gain.cancelScheduledValues(t); E.master.gain.setValueAtTime(E.master.gain.value, t)
  E.master.gain.linearRampToValueAtTime(0, t + 0.6)
  clearInterval(timer)
  stopT = setTimeout(() => { cancelAnimationFrame(raf); level.v = 0; E.ctx.suspend() }, 900)
  state.on = false; emit()
}
export const toggle = () => (state.on ? stop() : start())
export function setMuted(m) {
  state.muted = m
  if (E && state.on) { const t = E.ctx.currentTime; E.master.gain.cancelScheduledValues(t); E.master.gain.setValueAtTime(E.master.gain.value, t); E.master.gain.linearRampToValueAtTime(m ? 0 : 0.8, t + 0.3) }
  emit()
}
if (typeof document !== 'undefined') document.addEventListener('visibilitychange', () => { if (document.hidden) stop() })
