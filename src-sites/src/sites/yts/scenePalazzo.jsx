import * as THREE from 'three'
import React, { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { stage } from './engine'
import { PAL } from './Palazzo'

/* ===================== PALAZZO v5 — one plane, one shader =====================
   Volterra 145 → 148 → 156 → 157 → 152 → ceiling 154.
   - ONE full-frame plane. The shader holds the current + next photo and both depth maps
     (same family as the hero): vertex displacement from a mip-softened depth (no rubber-sheet
     smearing at silhouettes), a slow liquid, depth-aware ink-bleed (near pixels first, faint gold
     edge), mild sharpening for crisp 1920px detail, warm grade, lifted blacks, vignette, film grain.
   - Every image has its own continuous "life": dolly (zoom + growing depth), pan, rotation are
     functions of scroll for THAT image, so both images keep moving through a transition → no jumps.
     152 tilts up into its ceiling and 154 continues the same upward drift while the plane bends
     overhead (vault feel).
   - Draws with its OWN camera matrices inside the film's sticky frame (stage.palazzoFrame): it
     follows the frame while it scrolls in/out, so it never needs a DOM stand-in photo.
   - Textures: decoded off-thread (createImageBitmap), uploaded one per frame long before use;
     depth maps as single-channel R8 with mipmaps (cheap, smooth). No React state per frame. */

const IDS = PAL.ids
const TR = PAL.tr
const FOV = 40, D = 5, OVER = 1.14

// per image: depth amount, zoom [start,end] over its life, focus fractions [start,end] for
// landscape (desktop) and portrait (phone) frames, rotation [start,end] (rad), optional phone zoom
const CFG = {
  145: { amt: 0.42, z: [1.0, 1.13], L: [[0.5, 0.62], [0.58, 0.5]], P: [[0.66, 0.5], [0.76, 0.5]], r: [0, 0] },
  148: { amt: 0.6, z: [1.02, 1.16], L: [[0.5, 0.5], [0.5, 0.7]], P: [[0.46, 0.5], [0.54, 0.5]], r: [0, 0] },
  156: { amt: 0.62, z: [1.02, 1.15], L: [[0.5, 0.4], [0.5, 0.56]], P: [[0.4, 0.5], [0.5, 0.5]], r: [0, 0] },
  157: { amt: 0.58, z: [1.02, 1.15], L: [[0.5, 0.36], [0.5, 0.52]], P: [[0.42, 0.5], [0.52, 0.5]], r: [0, 0] },
  152: { amt: 0.6, z: [1.0, 1.1], zp: [1.0, 1.32], L: [[0.5, 0.3], [0.5, 1.0]], P: [[0.5, 0.36], [0.5, 1.0]], r: [0, 0], tilt: 1 },
  154: { amt: 0.28, z: [1.12, 1.07], L: [[0.5, 0.0], [0.5, 0.56]], P: [[0.5, 0.0], [0.5, 0.56]], r: [0, 0.07], up: 1 },
}

const NOISE = /* glsl */`
float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
  return mix(mix(h21(i), h21(i+vec2(1.,0.)), f.x), mix(h21(i+vec2(0.,1.)), h21(i+vec2(1.,1.)), f.x), f.y); }
float fbm(vec2 p){ float a = .5, s = 0.; for(int i = 0; i < 4; i++){ s += a * vn(p); p = p * 2.03 + 17.1; a *= .5; } return s / .9375; }
uniform float uPlane;
// cover (+zoom, pan, rotation) → texture coords (textures are uploaded top-down: flipY = false)
vec2 tc(vec2 uv, vec4 c, vec2 r){
  vec2 q = uv - .5; q.x *= uPlane; q = mat2(r.x, r.y, -r.y, r.x) * q; q.x /= uPlane; q += .5;
  vec2 t = q * c.xy + c.zw; return vec2(t.x, 1. - t.y);
}`

const vert = /* glsl */`
uniform sampler2D uDA, uDB; uniform vec4 uCA, uCB; uniform vec2 uRA, uRB, uNdc;
uniform float uMix, uAmtA, uAmtB, uTime, uBend; uniform mat4 uVP;
varying vec2 vUv; varying float vD;
${NOISE}
void main(){
  vUv = uv;
  // mip-softened depth for the geometry: silhouettes stretch over a soft ramp instead of tearing
  float dA = textureLod(uDA, tc(uv, uCA, uRA), 2.6).r;
  float dB = textureLod(uDB, tc(uv, uCB, uRB), 2.6).r;
  float n = fbm(uv * vec2(uPlane, 1.) * 1.3 + vec2(0., uTime * .015));
  float f = clamp(n * .55 + (1. - dB) * .45, 0., 1.);
  float k = smoothstep(f - .22, f + .22, uMix * 1.44 - .22);
  float band = 1. - abs(2. * k - 1.);
  vD = mix(dA, dB, k);
  vec3 p = position;
  float top = max(uv.y - .18, 0.) / .82;
  p.z += mix(dA * uAmtA, dB * uAmtB, k) + band * .05 + uBend * top * top;
  vec4 cp = uVP * modelMatrix * vec4(p, 1.);
  cp.y = cp.y * uNdc.x + uNdc.y * cp.w;   // map the virtual viewport onto the sticky frame
  gl_Position = cp;
}`

const frag = /* glsl */`
uniform sampler2D uA, uB, uDB; uniform vec4 uCA, uCB; uniform vec2 uRA, uRB, uTA, uTB, uClip, uRes;
uniform float uMix, uTime, uSharp, uSweep, uLive;
varying vec2 vUv; varying float vD;
${NOISE}
vec3 tex(sampler2D s, vec2 t, vec2 px){
  vec3 c = texture2D(s, t).rgb;
  vec3 b = texture2D(s, t + vec2(px.x, 0.)).rgb + texture2D(s, t - vec2(px.x, 0.)).rgb
         + texture2D(s, t + vec2(0., px.y)).rgb + texture2D(s, t - vec2(0., px.y)).rgb;
  return max(c + (c - b * .25) * uSharp, 0.);
}
vec3 grade(vec3 c){
  float l = dot(c, vec3(.2126, .7152, .0722));
  c = mix(vec3(l), c, .86);
  c *= mix(vec3(.92, .95, 1.02), vec3(1.07, 1., .87), smoothstep(.04, .6, l));
  c = c * .94 + vec3(.0105, .0088, .0066);
  return c;
}
void main(){
  if (gl_FragCoord.y < uClip.x || gl_FragCoord.y > uClip.y) discard;
  vec2 uv = vUv, q = uv * vec2(uPlane, 1.);
  float front = uMix * 1.44 - .22;
  float dB = textureLod(uDB, tc(uv, uCB, uRB), 1.2).r;
  float n = fbm(q * 1.3 + vec2(0., uTime * .015));
  float n2 = fbm(q * 4.4 - vec2(uTime * .025, 0.));
  float f = clamp(n * .55 + (1. - dB) * .45, 0., 1.) + (n2 - .5) * .09;
  float wide = 1. - abs(2. * smoothstep(f - .22, f + .22, front) - 1.);   // broad flow zone
  float k = smoothstep(f - .05, f + .05, front);                           // ink edge
  vec2 flow = vec2(fbm(q * 2.1 + 3.1 + uTime * .03), fbm(q * 2.1 - 7.3 - uTime * .03)) - .5;
  vec3 a = tex(uA, tc(uv + flow * wide * .028, uCA, uRA), uTA);
  vec3 b = uMix > .0005 ? tex(uB, tc(uv - flow * wide * .022, uCB, uRB), uTB) : a;
  vec3 c = mix(a, b, k);
  float edge = 1. - abs(2. * k - 1.);
  c *= 1. - wide * .1 - edge * .18;                                        // wet, darker ink edge
  c += vec3(1., .76, .44) * pow(edge, 4.) * .06;                           // faint gold rim
  // slow warm light sweep riding the depth (lights only what is lit)
  float sw = exp(-pow((uv.x * .8 + uv.y * .5 - uSweep + vD * .25) * 2.6, 2.));
  c += c * vec3(1., .86, .66) * sw * .16;
  c = grade(c);
  vec2 s = vec2(gl_FragCoord.x / uRes.x, (gl_FragCoord.y - uClip.x) / max(uClip.y - uClip.x, 1.));
  c *= mix(1., 1. - smoothstep(.32, 1.2, length((s - .5) * vec2(1.15, 1.))), .6);
  float g = h21(gl_FragCoord.xy + fract(uTime * 7.31) * 113.) - .5;
  c += g * .024 * (.35 + sqrt(max(c.g, 0.)));
  c = mix(vec3(.0043, .0037, .0027), c, uLive);
  gl_FragColor = vec4(max(c, 0.), 1.);
  #include <colorspace_fragment>
}`

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const seg = (p, a, b) => clamp((p - a) / (b - a))
const ease3 = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const lerp = (a, b, t) => a + (b - a) * t
const damp = THREE.MathUtils.damp

/* ---------- textures: off-thread decode, staged upload ---------- */
const TEX = { started: false, items: {}, upload: [] }
const PH_C = new THREE.DataTexture(new Uint8Array([11, 10, 8, 255]), 1, 1); PH_C.needsUpdate = true
const PH_D = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1); PH_D.needsUpdate = true
function decode(url) {
  if (typeof createImageBitmap === 'function') return fetch(url).then(r => { if (!r.ok) throw new Error(url); return r.blob() }).then(b => createImageBitmap(b))
  return new Promise((res, rej) => { const im = new Image(); im.decoding = 'async'; im.onload = () => (im.decode ? im.decode().catch(() => {}) : Promise.resolve()).then(() => res(im)); im.onerror = rej; im.src = url })
}
function startLoad(gl, xl) {
  if (TEX.started) return
  TEX.started = true
  const an = Math.min(8, gl.capabilities.getMaxAnisotropy())
  const q = []
  IDS.forEach(id => {
    TEX.items[id] = { c: null, d: null, a: 1, w: 1, h: 1 }
    q.push([id, 'c', `/portfolio/yts/img/${id}${xl ? '-xl' : ''}.webp`], [id, 'd', `/portfolio/yts/depth/${id}${xl ? '-xl' : ''}.webp`])
  })
  let running = 0
  const next = () => {
    while (running < 2 && q.length) {
      const [id, kind, url] = q.shift()
      running++
      decode(url).then(im => {
        const t = new THREE.Texture(im)
        t.flipY = false
        t.generateMipmaps = true
        t.minFilter = THREE.LinearMipmapLinearFilter
        t.magFilter = THREE.LinearFilter
        if (kind === 'c') { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = an; const it = TEX.items[id]; it.w = im.width; it.h = im.height; it.a = im.width / im.height }
        else { t.format = THREE.RedFormat; t.colorSpace = THREE.NoColorSpace }
        t.needsUpdate = true
        TEX.upload.push([id, kind, t])
      }).catch(() => {}).finally(() => { running--; next() })
    }
  }
  next()
}

function coverVec(out, ta, pa, zoom, fr) {
  let sx = 1, sy = 1
  if (pa > ta) sy = ta / pa; else sx = pa / ta
  sx /= zoom; sy /= zoom
  return out.set(sx, sy, (1 - sx) * clamp(fr[0]), (1 - sy) * clamp(fr[1]))
}

// life of image i in scroll space: from the start of the transition into it to the end of the one out of it
const life = (i, p) => seg(p, i === 0 ? -0.1 : TR[i - 1][0], i === IDS.length - 1 ? 1.04 : TR[i][1])

const ptr = { x: 0, y: 0 }
let ptrBound = false
function bindPointer() {
  if (ptrBound || typeof window === 'undefined') return
  ptrBound = true
  window.addEventListener('pointermove', e => { if (e.pointerType === 'touch') return; ptr.x = (e.clientX / innerWidth) * 2 - 1; ptr.y = -((e.clientY / innerHeight) * 2 - 1) }, { passive: true })
}

const hub = (stage.palazzo = stage.palazzo || {})
if (typeof window !== 'undefined') window.__ytsPalazzo = hub // QA hooks: __ytsPalazzo.p = 0.3 → force progress; .snap = true → no damping (slow GPUs)

export default function ScenePalazzo({ track }) {
  const { size, gl } = useThree()
  const mesh = useRef()
  const portrait = size.width < size.height
  const mob = size.width <= 768
  const geo = useMemo(() => (portrait ? new THREE.PlaneGeometry(1, 1, 72, 128) : new THREE.PlaneGeometry(1, 1, 320, 200)), [portrait])
  useEffect(() => { bindPointer(); return () => geo.dispose() }, [geo])
  const vcam = useMemo(() => new THREE.PerspectiveCamera(FOV, 1, 0.05, 50), [])

  const U = useMemo(() => ({
    uA: { value: PH_C }, uB: { value: PH_C }, uDA: { value: PH_D }, uDB: { value: PH_D },
    uCA: { value: new THREE.Vector4(1, 1, 0, 0) }, uCB: { value: new THREE.Vector4(1, 1, 0, 0) },
    uRA: { value: new THREE.Vector2(1, 0) }, uRB: { value: new THREE.Vector2(1, 0) },
    uTA: { value: new THREE.Vector2(1e-3, 1e-3) }, uTB: { value: new THREE.Vector2(1e-3, 1e-3) },
    uMix: { value: 0 }, uAmtA: { value: 0.5 }, uAmtB: { value: 0.5 }, uTime: { value: 0 }, uPlane: { value: 1.6 }, uBend: { value: 0 },
    uSharp: { value: 0.3 }, uSweep: { value: -1 }, uLive: { value: 0 },
    uVP: { value: new THREE.Matrix4() }, uNdc: { value: new THREE.Vector2(1, 0) },
    uClip: { value: new THREE.Vector2(-2, -1) }, uRes: { value: new THREE.Vector2(1, 1) },
  }), [])

  const st = useRef({ t: 0, frames: 0, p1: 0, p2: 0, wasOn: false, px: 0, py: 0, live: 0 })
  const buf = useMemo(() => new THREE.Vector2(), [])

  // apply image i (with its life-driven move) to slot A or B
  const setSlot = (slot, i, p, pa, port, t) => {
    const id = IDS[i], c = CFG[id], it = TEX.items[id]
    const L = life(i, p)
    const ready = it && it.c && it.d
    U['u' + slot].value = ready ? it.c : PH_C
    U['uD' + slot].value = ready ? it.d : PH_D
    const zr = port && c.zp ? c.zp : c.z
    const breath = 1 + 0.006 * Math.sin(t * 0.21 + i * 1.7)
    const zoom = lerp(zr[0], zr[1], L) * breath
    const F = port ? c.P : c.L
    // 152 tilts up late (ease-in), 154 keeps drifting up and settles (ease-out) → one continuous look-up
    const k = c.tilt ? L * L * (1.6 - 0.6 * L) : c.up ? 1 - Math.pow(1 - L, 2.2) : L
    const fr = [lerp(F[0][0], F[1][0], k), lerp(F[0][1], F[1][1], k)]
    coverVec(U['uC' + slot].value, ready ? it.a : 1, pa, zoom, fr)
    const rot = lerp(c.r[0], c.r[1], k) + (c.up ? 0.006 * Math.sin(t * 0.17) : 0)
    U['uR' + slot].value.set(Math.cos(rot), Math.sin(rot))
    U['uT' + slot].value.set(1 / (ready ? it.w : 1), 1 / (ready ? it.h : 1))
    U['uAmt' + slot].value = c.amt * (mob ? 0.85 : 1) * (0.8 + 0.5 * L)
    return ready
  }

  useFrame((state, dt) => {
    const s = st.current, tr = track.current
    dt = Math.min(dt, 1 / 20)
    s.t += dt
    if (!mesh.current) return

    // staged GPU upload: one texture per frame, long before the film is reached
    if (TEX.upload.length) {
      const [id, kind, t] = TEX.upload.shift()
      try { gl.initTexture(t) } catch (e) {}
      TEX.items[id][kind] = t
    }
    const frameEl = stage.palazzoFrame
    if (!TEX.started) {
      const near = frameEl && frameEl.getBoundingClientRect().top < size.height * 3
      if (near || (stage.hero && stage.hero.ready && s.t > 2.5) || s.t > 6) startLoad(gl, !mob)
    }

    // keep the program compiled from the start (first frames draw nothing: clip rejects all)
    if (++s.frames < 20) { mesh.current.visible = true; U.uClip.value.set(-2, -1); return }

    const r = frameEl && frameEl.getBoundingClientRect()
    const H = size.height
    const vis = tr.on && r && r.bottom > 0 && r.top < H
    mesh.current.visible = !!vis
    if (!vis) { s.wasOn = false; return }

    // ---- one damped progress (λ≈4) + a light second stage → silk; snap on (re)entry
    const target = hub.p != null ? hub.p : tr.p
    if (!s.wasOn || hub.snap) { s.p1 = s.p2 = target; s.entry = true }
    s.wasOn = true
    s.p1 = damp(s.p1, target, 4, dt)
    s.p2 = damp(s.p2, s.p1, 9, dt)
    const p = s.p2
    stage.palazzoLive = performance.now()
    if (stage.palazzoMV && Math.abs(stage.palazzoMV.get() - p) > 1e-5) stage.palazzoMV.set(p)

    // ---- frame mapping: the virtual viewport = the sticky frame on screen
    const pa = r.width / Math.max(r.height, 1), port = pa < 1
    gl.getDrawingBufferSize(buf)
    const ratio = buf.y / H
    U.uRes.value.copy(buf)
    U.uClip.value.set((H - r.top - r.height) * ratio - 0.5, (H - r.top) * ratio + 0.5)
    const sc = r.height / H
    U.uNdc.value.set(sc, 1 - (2 * r.top) / H - sc)
    U.uPlane.value = pa

    // ---- which pair + transition mix
    let A = 0, B = 0, mix = 0
    for (let j = 0; j < TR.length; j++) {
      if (p >= TR[j][1]) { A = B = j + 1; continue }
      if (p > TR[j][0]) { A = j; B = j + 1; mix = ease3(seg(p, TR[j][0], TR[j][1])) }
      break
    }
    const okA = setSlot('A', A, p, pa, port, s.t)
    const okB = B !== A ? setSlot('B', B, p, pa, port, s.t) : (setSlot('B', A, p, pa, port, s.t), okA)
    U.uMix.value = mix
    U.uTime.value = s.t
    U.uSharp.value = mob ? 0.14 : 0.2
    U.uSweep.value = -0.5 + p * 2.2 + Math.sin(s.t * 0.05) * 0.15
    // fade the picture in once its textures exist (never pops)
    s.live = s.entry && okA && okB ? 1 : damp(s.live, okA && okB ? 1 : 0, 3, dt)
    s.entry = false
    U.uLive.value = s.live

    // ---- look-up: the plane bends overhead from the 152 tilt through the ceiling
    const up = ease3(seg(p, TR[3][1], 1))
    U.uBend.value = up * (port ? 0.45 : 0.6)

    // ---- virtual camera: continuous slow dolly over the whole film + drift + pointer parallax
    s.px = damp(s.px, mob ? 0 : ptr.x, 2.2, dt); s.py = damp(s.py, mob ? 0 : ptr.y, 2.2, dt)
    const dx = Math.sin(s.t * 0.13) * (port ? 0.05 : 0.12) + s.px * 0.24
    const dy = Math.sin(s.t * 0.097 + 1.3) * 0.06 + s.py * 0.13
    const z = D - 0.55 * p
    vcam.aspect = pa
    vcam.fov = FOV
    vcam.position.set(dx, dy - 0.1 * up, z)
    vcam.lookAt(dx * 0.4, dy * 0.4 + 0.22 * up, 0)
    vcam.updateProjectionMatrix()
    vcam.updateMatrixWorld()
    U.uVP.value.multiplyMatrices(vcam.projectionMatrix, vcam.matrixWorldInverse)

    const fh = 2 * D * Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * OVER
    mesh.current.scale.set(fh * pa, fh, 1)
  })

  return (
    <mesh ref={mesh} geometry={geo} frustumCulled={false} renderOrder={100}>
      <shaderMaterial uniforms={U} vertexShader={vert} fragmentShader={frag} transparent depthTest={false} depthWrite={false} />
    </mesh>
  )
}
