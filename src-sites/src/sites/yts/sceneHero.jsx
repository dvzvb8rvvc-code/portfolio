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
   - scroll: dolly INTO the image (depth grows), soften + darken, then dissolve to paper #ece7df
   Talks to the DOM (Hero.jsx) through stage.hero = { i, k, ready, go } — no React state per frame. */

// keep in sync with SLIDES in Hero.jsx
const IDS = [111, 5, 103, 84]
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
uniform sampler2D uDA, uDB; uniform vec4 uCA, uCB; uniform float uMix, uAmt, uTime, uPlane;
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
  p.z += d * uAmt + band * .07;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.);
}`

const frag = /* glsl */`
uniform sampler2D uA, uB, uDB; uniform vec4 uCA, uCB;
uniform float uMix, uTime, uPlane, uSweep, uDark, uFade, uSoft, uMobile;
uniform vec3 uPaper; uniform vec2 uRes;
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
  c += c * vec3(1., .86, .66) * sw * .28;
  c = grade(c);
  // legibility + cinema: bottom/left gradients, top for the nav, vignette
  vec2 s = gl_FragCoord.xy / uRes;
  c *= 1. - .62 * smoothstep(.62, .0, s.y);
  c *= 1. - .35 * smoothstep(.62, .0, s.x) * smoothstep(.9, .2, s.y) * (1. - uMobile);
  c *= 1. - .4 * smoothstep(.8, 1., s.y);
  c *= mix(1., smoothstep(1.2, .3, length((s - .5) * vec2(1.1, 1.))), .6);
  c *= 1. - uDark;
  // film grain (fine, animated) — fades out with the paper hand-off
  float g = h21(gl_FragCoord.xy + fract(uTime * 7.31) * 113.) - .5;
  c += g * .028 * (.35 + sqrt(max(c.g, 0.))) * (1. - uFade);
  c = mix(c, uPaper, uFade);
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
function coverVec(out, ta, pa, zoom, f) {
  let sx = 1, sy = 1
  if (pa > ta) sy = ta / pa; else sx = pa / ta
  sx /= zoom; sy /= zoom
  const fx = clamp(f[0], sx / 2, 1 - sx / 2), fy = clamp(f[1], sy / 2, 1 - sy / 2)
  return out.set(sx, sy, fx - sx / 2, fy - sy / 2)
}

const hub = (stage.hero = stage.hero || { i: 0, k: 0, ready: false, go: -1, f: 0 })
if (typeof window !== 'undefined') { window.__ytsHero = hub; window.__ytsStage = stage } // debug / QA hook

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
    uDark: { value: 0 }, uFade: { value: 0 }, uSoft: { value: 0 }, uMobile: { value: mobile ? 1 : 0 },
    uPaper: { value: new THREE.Color('#ece7df') }, uRes: { value: new THREE.Vector2(1, 1) },
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
    const L = CYCLE + TRANS
    const fi = portrait ? 1 : 0
    coverVec(U.uCA.value, ASPECT[A], pa, 1 + .085 * (s.c + TRANS) / L, FOCUS[A][fi])
    coverVec(U.uCB.value, ASPECT[B], pa, 1 + .085 * Math.max(0, s.c - tStart) / L, FOCUS[B][fi])
    U.uMix.value = mix
    U.uTime.value = s.t
    U.uPlane.value = pa
    U.uMobile.value = mob ? 1 : 0
    U.uSweep.value = ((s.t * .075) % 1.9) - .45
    state.gl.getDrawingBufferSize(U.uRes.value)

    // ---- intro + scroll beat
    const intro = ease3(clamp((now - .1) / 3.6))
    const dolly = ease3(seg(p, 0, .85))
    U.uAmt.value = hub.amt ?? (.22 + .43 * intro) * (1 + 1.1 * dolly)
    U.uSoft.value = ease(seg(p, .3, .85)) * 2.5
    U.uDark.value = ease(seg(p, .2, .7)) * .55
    U.uFade.value = ease(seg(p, .56, .94))

    // plane covers the frustum at z=0 (+ overscan for parallax)
    const fh = 2 * D * Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * OVER
    mesh.current.scale.set(fh * pa, fh, 1).multiplyScalar(hub.sc || 1)

    if (++s.frames === 3) hub.ready = true
    hub.f = s.frames; hub.T = s.t
    hub.dbg = [state.camera.position.toArray().map(v => +v.toFixed(3)), mesh.current.scale.toArray().map(v => +v.toFixed(3)), size.width, size.height, stage.active, U.uAmt.value.toFixed(2)]
    if (stage.active !== 'hero') return

    // ---- camera: slow cinematic drift + pointer parallax, intro settle, dolly in on scroll
    s.px = damp(s.px, ptr.x, 2.2, dt); s.py = damp(s.py, ptr.y, 2.2, dt)
    const par = mob ? 0 : .3
    const dx = Math.sin(s.t * .11) * (mob ? .3 : .2) + s.px * par
    const dy = Math.sin(s.t * .083 + 1.3) * .1 + s.py * par * .55
    const z = D - .55 * (1 - intro) - 2.1 * dolly
    s.cam.set(dx, dy - .12 * dolly, z)
    s.look.set(dx * .4, dy * .4 - .08 * dolly, 0)
    const cam = state.camera
    if (cam.fov !== FOV) { cam.fov = FOV; cam.updateProjectionMatrix() }
    cam.position.x = damp(cam.position.x, s.cam.x, 4, dt)
    cam.position.y = damp(cam.position.y, s.cam.y, 4, dt)
    cam.position.z = damp(cam.position.z, s.cam.z, 4, dt)
    if (s.frames < 3) cam.position.copy(s.cam)
    cam.lookAt(s.look)
  })

  return (
    <group ref={g} visible={false}>
      <mesh ref={mesh} geometry={geo} frustumCulled={false} renderOrder={-5}>
        <shaderMaterial uniforms={U} vertexShader={vert} fragmentShader={frag} />
      </mesh>
    </group>
  )
}
