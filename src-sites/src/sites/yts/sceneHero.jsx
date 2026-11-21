import React, { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useLoader, useThree } from '@react-three/fiber'
import { stage } from './engine'

/* HERO v4 — cinematic showreel on the shared canvas (engine.jsx contract).
   ONE full-bleed plane, ONE material: current + next render and both depth maps live in the same shader.
   - real 3D from his renders' depth maps (vertex displacement), camera drift + pointer parallax
   - liquid, depth-aware transition: near pixels flow first, a noise front bleeds the next render in
     (dark ink edge + hairline gold rim), UVs of both images flow along the front
   - Ken Burns zoom per slide, slow light sweep riding the depth, warm cinematic grade,
     lifted blacks, vignette, legibility gradients, film grain — all in the fragment shader (no composer)
   - scroll (V5 hand-off): a short push INTO the depth, then the film recedes — the plane shrinks, flattens
     and lands exactly on the framed card placeholder in Studio (stage.hero.cardEl, a DOM rect read per frame).
     When it has landed, Studio swaps in a DOM <img> of the same frame (hub.landed) → no flat-colour cut, ever.
   Talks to the DOM (Hero.jsx) through stage.hero = { i, k, ready, go } — no React state per frame. */

// keep in sync with SLIDES in Hero.jsx
const IDS = [5, 103, 111, 84]
// cover focus [desktop landscape, mobile portrait] in uv (y up)
const FOCUS = { 111: [[.52, .5], [.57, .5]], 5: [[.5, .56], [.47, .5]], 103: [[.6, .5], [.79, .5]], 84: [[.5, .5], [.55, .5]] }
const ASPECT = { 111: 1800 / 1125, 5: 1440 / 1800, 103: 1800 / 1519, 84: 1800 / 900 }
const photo = id => `/portfolio/yts/img/${id}.webp`
const depth = id => `/portfolio/yts/depth/${id}.webp`

const CYCLE = 6.4, TRANS = 2.6, D = 5, OVER = 1.16, FOV = 40

const NOISE = /* glsl */`
float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
  return mix(mix(h21(i), h21(i+vec2(1.,0.)), f.x), mix(h21(i+vec2(0.,1.)), h21(i+vec2(1.,1.)), f.x), f.y); }
float fbm(vec2 p){ float a = .5, s = 0.; for(int i = 0; i < 4; i++){ s += a * vn(p); p = p * 2.03 + 17.1; a *= .5; } return s / .9375; }
vec2 cover(vec2 uv, vec4 c){ return uv * c.xy + c.zw; }`

const vert = /* glsl */`
uniform sampler2D uDA, uDB; uniform vec4 uCA, uCB; uniform float uMix, uAmt, uTime, uPlane, uCard;
varying vec2 vUv; varying float vD;
${NOISE}
void main(){
  vUv = uv;
  float dA = texture2D(uDA, cover(uv, uCA)).r, dB = texture2D(uDB, cover(uv, uCB)).r;
  float n = fbm(uv * vec2(uPlane, 1.) * 1.3 + vec2(0., uTime * .02));
  float f = clamp(n * .6 + (1. - dB) * .4, 0., 1.);
  float k = smoothstep(f - .2, f + .2, uMix * 1.4 - .2);
  float band = 1. - abs(2. * k - 1.);
  float d = mix(dA, dB, k);
  vD = d;
  vec3 p = position;
  float rim = smoothstep(0., .09, min(min(uv.x, 1. - uv.x), min(uv.y, 1. - uv.y)));
  p.z += (d * uAmt + band * .07) * mix(1., rim, uCard);   // card edges stay straight while it lands
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.);
}`

const frag = /* glsl */`
uniform sampler2D uA, uB, uDB; uniform vec4 uCA, uCB;
uniform float uMix, uTime, uPlane, uSweep, uDark, uCard, uSoft, uMobile;
uniform vec2 uRes;
varying vec2 vUv; varying float vD;
${NOISE}
vec3 grade(vec3 c){
  float l = dot(c, vec3(.2126, .7152, .0722));
  c = mix(vec3(l), c, .84);                                            // restrained saturation
  c *= mix(vec3(.93, .96, 1.02), vec3(1.07, 1., .88), smoothstep(.04, .6, l)); // cool shadows, warm highlights
  c = c * .95 + vec3(.010, .0085, .0065);                               // lifted, warm blacks
  return c;
}
void main(){
  vec2 uv = vUv, q = uv * vec2(uPlane, 1.);
  float front = uMix * 1.4 - .2;
  float dB = texture2D(uDB, cover(uv, uCB)).r;
  float n = fbm(q * 1.3 + vec2(0., uTime * .02));
  float n2 = fbm(q * 4.2 - vec2(uTime * .03, 0.));
  float f = clamp(n * .6 + (1. - dB) * .4, 0., 1.) + (n2 - .5) * .1;
  float wide = 1. - abs(2. * smoothstep(f - .2, f + .2, front) - 1.);  // broad flow zone
  float k = smoothstep(f - .045, f + .045, front);                     // ink edge
  vec2 flow = vec2(fbm(q * 2.1 + 3.1 + uTime * .04), fbm(q * 2.1 - 7.3 - uTime * .04)) - .5;
  vec3 a = texture2D(uA, cover(uv + flow * wide * .07, uCA), uSoft).rgb;
  vec3 b = texture2D(uB, cover(uv - flow * wide * .05, uCB), uSoft).rgb;
  vec3 c = mix(a, b, k);
  // ink bleed: darkened wet edge + hairline of gold light on the front
  float edge = 1. - abs(2. * k - 1.);
  c *= 1. - wide * .22 - edge * .25;
  c += vec3(1., .74, .42) * pow(edge, 3.) * .05;
  // slow light sweep, riding the depth (only lights what is already lit)
  float sw = exp(-pow((uv.x * .85 + uv.y * .45 - uSweep + vD * .22) * 3.2, 2.));
  c += c * vec3(1., .86, .66) * sw * .28 * (1. - uCard);
  c = grade(c);
  // legibility + cinema: bottom/left gradients, top for the nav, vignette
  // (screen-space while full-bleed, they release as the film becomes a card)
  vec2 s = gl_FragCoord.xy / uRes;
  float sc = 1. - uCard;
  c *= 1. - .66 * (1. - smoothstep(0., .6, s.y)) * sc;
  c *= 1. - .4 * (1. - smoothstep(0., .62, s.x)) * (1. - smoothstep(.2, .9, s.y)) * (1. - uMobile) * sc;
  c *= 1. - .4 * smoothstep(.8, 1., s.y) * sc;
  c *= mix(1., 1. - smoothstep(.3, 1.2, length((s - .5) * vec2(1.1, 1.))), .6 * sc);
  c *= 1. - uDark;
  // film grain (fine, animated) — settles to still as the card lands (the page grain takes over)
  float g = h21(gl_FragCoord.xy + fract(uTime * 7.31) * 113.) - .5;
  c += g * .028 * (.35 + sqrt(max(c.g, 0.))) * sc;
  gl_FragColor = vec4(max(c, 0.), 1.);
  #include <colorspace_fragment>
}`

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const seg = (p, a, b) => clamp((p - a) / (b - a))
const ease = t => t * t * (3 - 2 * t)
const ease3 = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2) // slow in, slow out
const damp = THREE.MathUtils.damp

const ptr = { x: 0, y: 0 }
let ptrBound = false
function bindPointer() {
  if (ptrBound || typeof window === 'undefined') return
  ptrBound = true
  window.addEventListener('pointermove', e => { if (e.pointerType === 'touch') return; ptr.x = (e.clientX / innerWidth) * 2 - 1; ptr.y = -((e.clientY / innerHeight) * 2 - 1) }, { passive: true })
}

// cover-fit (+ zoom, focus) of a texture of aspect ta on a plane of aspect pa → vec4(scale, offset)
// css = 0..1 blends to CSS object-fit:cover + object-position:f (so the landed card matches a DOM <img> 1:1)
function coverVec(out, ta, pa, zoom, f, css = 0) {
  let sx = 1, sy = 1
  if (pa > ta) sy = ta / pa; else sx = pa / ta
  sx /= zoom; sy /= zoom
  const fx = clamp(f[0], sx / 2, 1 - sx / 2), fy = clamp(f[1], sy / 2, 1 - sy / 2)
  let ox = fx - sx / 2, oy = fy - sy / 2
  ox += (f[0] * (1 - sx) - ox) * css; oy += (f[1] * (1 - sy) - oy) * css
  return out.set(sx, sy, ox, oy)
}
// CSS object-position for a focus point (uv, y up)
export const focusCss = f => `${(f[0] * 100).toFixed(2)}% ${((1 - f[1]) * 100).toFixed(2)}%`

const hub = (stage.hero = stage.hero || { i: 0, k: 0, ready: false, go: -1, f: 0 })
if (typeof window !== 'undefined') window.__ytsHero = hub // QA hook: __ytsHero.fixed = 0.1 → fixed time-step (inspect transitions on slow GPUs)

export default function SceneHero({ track }) {
  const { size, gl } = useThree()
  const portrait = size.width < size.height
  const mobile = size.width <= 768
  const texs = useLoader(THREE.TextureLoader, [...IDS.map(photo), ...IDS.map(depth)])
  const maps = texs.slice(0, 4), dmaps = texs.slice(4)
  useMemo(() => {
    const an = Math.min(4, gl.capabilities.getMaxAnisotropy())
    maps.forEach(t => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = an })
    dmaps.forEach(t => { t.generateMipmaps = false; t.minFilter = THREE.LinearFilter })
  }, [texs])
  const geo = useMemo(() => {
    const a = mobile ? 128 : 256, b = mobile ? 72 : 144
    return portrait ? new THREE.PlaneGeometry(1, 1, b, a) : new THREE.PlaneGeometry(1, 1, a, b)
  }, [portrait, mobile])
  useEffect(() => { bindPointer(); return () => geo.dispose() }, [geo])

  const U = useMemo(() => ({
    uA: { value: maps[0] }, uB: { value: maps[1] }, uDA: { value: dmaps[0] }, uDB: { value: dmaps[1] },
    uCA: { value: new THREE.Vector4(1, 1, 0, 0) }, uCB: { value: new THREE.Vector4(1, 1, 0, 0) },
    uMix: { value: 0 }, uAmt: { value: .2 }, uTime: { value: 0 }, uPlane: { value: 1.6 }, uSweep: { value: -1 },
    uDark: { value: 0 }, uCard: { value: 0 }, uSoft: { value: 0 }, uMobile: { value: mobile ? 1 : 0 },
    uRes: { value: new THREE.Vector2(1, 1) },
  }), [texs])

  const g = useRef(), mesh = useRef()
  const st = useRef({ t: 0, c: 0, cur: 0, next: 1, ps: 0, lastP: 0, lastMove: -9, frames: 0,
    cam: new THREE.Vector3(0, 0, D), look: new THREE.Vector3(), px: 0, py: 0 })

  useFrame((state, dt) => {
    const tr = track.current, s = st.current
    if (!g.current) return
    if (!tr.on) { g.current.visible = false; return }
    g.current.visible = true
    dt = hub.fixed || Math.min(dt, 1 / 20) // hub.fixed: QA time-step override
    s.t += dt
    const now = s.t
    const W = size.width, H = size.height, pa = W / H, mob = W <= 768

    // ---- scroll (one damped progress → silk)
    if (Math.abs(tr.p - s.lastP) > 1e-4) s.lastMove = now
    s.lastP = tr.p
    s.ps = damp(s.ps, tr.p, 4.5, dt)
    const p = s.ps

    // ---- showreel clock (holds while the user scrolls; a running transition always completes)
    const tStart = CYCLE - TRANS
    const inTrans = s.c >= tStart
    if (hub.go >= 0 && !inTrans) {
      if (hub.go !== s.cur) { s.next = hub.go; s.c = tStart }
      hub.go = -1
    } else if (hub.go >= 0 && inTrans) hub.go = -1
    const paused = !inTrans && (now - s.lastMove < 1.4 || p > .03 || document.hidden)
    if (!paused) s.c += dt
    if (s.c >= CYCLE) { s.c -= CYCLE; s.cur = s.next; s.next = (s.cur + 1) % IDS.length }
    const mix = ease3(seg(s.c, tStart, CYCLE))
    const phase = s.c + TRANS / 2
    hub.i = phase >= CYCLE ? s.next : s.cur
    hub.k = (phase >= CYCLE ? phase - CYCLE : phase) / CYCLE

    const A = IDS[s.cur], B = IDS[s.next]
    U.uA.value = maps[s.cur]; U.uB.value = maps[s.next]; U.uDA.value = dmaps[s.cur]; U.uDB.value = dmaps[s.next]

    // ---- hand-off: how far the film has receded into the Studio card (0 = full bleed, 1 = landed)
    // k runs on the real (Lenis-smoothed) scroll so the landed card stays glued to its DOM placeholder.
    let k = 0, rect = null
    const hEl = stage.els.hero, ph = hub.cardEl
    if (hEl && ph) {
      const sv = -hEl.getBoundingClientRect().top / H
      rect = ph.getBoundingClientRect()
      const land = Math.max(mob ? 84 : 104, (H - rect.height) / 2)
      const s1 = sv + (rect.top - land) / H
      const s0 = Math.min(.2, s1 - .35)
      k = ease3(clamp((sv - s0) / Math.max(.25, s1 - s0)))
      if (rect.width < 2) { k = 0; rect = null }
    }
    if (!rect) k = 0
    const kk = ease(seg(k, .55, 1)) // late phase: lights come up, image settles
    U.uCard.value = k

    U.uMix.value = mix
    U.uTime.value = s.t
    U.uMobile.value = mob ? 1 : 0
    U.uSweep.value = ((s.t * .075) % 1.9) - .45
    state.gl.getDrawingBufferSize(U.uRes.value)

    // ---- intro + scroll beat: a short push into the depth, then the film recedes into the card
    const intro = ease3(clamp((now - .1) / 3.6))
    const push = ease3(seg(p, 0, .7))
    U.uAmt.value = (.22 + .43 * intro) * (1 + .9 * push) * Math.pow(1 - k, 1.6)
    U.uSoft.value = Math.sin(Math.PI * k) * 1.5
    U.uDark.value = ease(seg(p, .12, .7)) * .5 * (1 - kk)

    // ---- camera: slow cinematic drift + pointer parallax, intro settle, push in → pull back to a straight view
    const cam = state.camera
    if (stage.active === 'hero') {
      s.px = damp(s.px, ptr.x, 2.2, dt); s.py = damp(s.py, ptr.y, 2.2, dt)
      const free = 1 - k
      const par = mob ? 0 : .3
      const dx = (Math.sin(s.t * .11) * (mob ? .3 : .2) + s.px * par) * free
      const dy = (Math.sin(s.t * .083 + 1.3) * .1 + s.py * par * .55 - .12 * push) * free
      const z = D - .55 * (1 - intro) - 1.5 * push * free
      s.cam.set(dx, dy, z)
      s.look.set(dx * .4 * free + dx * k, (dy * .4 - .06 * push) * free + dy * k, 0)
      if (cam.fov !== FOV) { cam.fov = FOV; cam.updateProjectionMatrix() }
      cam.position.x = damp(cam.position.x, s.cam.x, 4, dt)
      cam.position.y = damp(cam.position.y, s.cam.y, 4, dt)
      cam.position.z = damp(cam.position.z, s.cam.z, 4, dt)
      if (s.frames < 3) cam.position.copy(s.cam)
      cam.lookAt(s.look)
    }

    // ---- plane: full-bleed (frustum at z=0 + overscan) → the card rect, mapped through the live camera
    const tanH = Math.tan(THREE.MathUtils.degToRad(FOV / 2))
    const fullH = 2 * D * tanH * OVER
    let w = fullH * pa, h = fullH, x = 0, y = 0
    if (rect && k > 0) {
      const fh = 2 * Math.max(.5, cam.position.z) * tanH
      const cw = (rect.width / W) * fh * pa, ch = (rect.height / H) * fh
      const cx = cam.position.x + ((rect.left + rect.width / 2) / W - .5) * fh * pa
      const cy = cam.position.y - ((rect.top + rect.height / 2) / H - .5) * fh
      w += (cw - w) * k; h += (ch - h) * k; x = cx * k; y = cy * k
    }
    mesh.current.scale.set(w, h, 1)
    mesh.current.position.set(x, y, 0)
    const ma = w / h
    U.uPlane.value = ma
    const L = CYCLE + TRANS
    const fi = portrait ? 1 : 0
    coverVec(U.uCA.value, ASPECT[A], ma, 1 + .085 * (s.c + TRANS) / L * (1 - k), FOCUS[A][fi], kk)
    coverVec(U.uCB.value, ASPECT[B], ma, 1 + .085 * Math.max(0, s.c - tStart) / L * (1 - k), FOCUS[B][fi], kk)

    // ---- tell Studio which frame to show in DOM once the card has landed (discrete writes only)
    const showId = mix > .5 ? B : A
    hub.cardK = k
    hub.cardId = showId
    hub.cardPos = focusCss(FOCUS[showId][fi])
    hub.landed = k > .995 && (mix < .002 || mix > .998)

    if (++s.frames === 3) hub.ready = true
    hub.f = s.frames; hub.T = s.t
  })

  return (
    <group ref={g} visible={false}>
      <mesh ref={mesh} geometry={geo} frustumCulled={false} renderOrder={-5}>
        <shaderMaterial uniforms={U} vertexShader={vert} fragmentShader={frag} />
      </mesh>
    </group>
  )
}
