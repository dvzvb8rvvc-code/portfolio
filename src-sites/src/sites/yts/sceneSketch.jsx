import React, { useEffect, useMemo, useRef } from 'react'
import { useFrame, useLoader, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { stage } from './engine'
import { PAIRS } from './data'

/* SKETCH → REALITY (engine scene id 'sketch') — V5 dark luxury
   4 pairs side by side in a dark room (far off the origin so other scenes never overlap).
   Each scroll quarter the "before" (his sketch as warm ink on dark paper / an archival-graded site photo)
   is bled away by the same liquid, depth-aware ink front as the hero: near pixels flow first, a fbm front
   with a dark wet edge and a hairline of gold light, UVs flowing along the front; behind it the "after"
   rises into real depth (depth map) with the hero's warm grade. Camera pans to the next pair.
   Loading: small (-s) textures suspend once at page load, full-size textures stream in afterwards and are
   swapped in place (uploaded with initTexture first) → never a blank frame, crisp on desktop.
   The frame scrolls 1:1 with the page while the film enters / leaves (emulated sticky).
   Everything damped; no per-frame React state; no postprocessing. */

const ORIGIN = new THREE.Vector3(-120, 40, 0)
const GAP = 8
const H = 2.6 // frame height (world)
const ASPECT = [0.78, 1.25, 0.95, 1.33] // per-pair frame w/h (both images cover-fit into it)
const DEPTH = [0.5, 0.42, 0.55, 0.42]
const SKETCHY = [1, 0, 0, 0] // pair 0 "before" is a drawing → warm ink on dark paper
const BG = new THREE.Color('#0b0a08')

const isMobile = () => typeof window !== 'undefined' && window.innerWidth <= 768
const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }
const damp = THREE.MathUtils.damp

// pointer over the window (canvas is pointer-events:none)
const ptr = { x: 0, y: 0 }
if (typeof window !== 'undefined') window.addEventListener('pointermove', e => { if (e.pointerType === 'touch') return; ptr.x = e.clientX / innerWidth * 2 - 1; ptr.y = -(e.clientY / innerHeight * 2 - 1) }, { passive: true })

const NOISE = /* glsl */`
float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
  return mix(mix(h21(i), h21(i+vec2(1.,0.)), f.x), mix(h21(i+vec2(0.,1.)), h21(i+vec2(1.,1.)), f.x), f.y); }
float fbm(vec2 p){ float a = .5, s = 0.; for(int i = 0; i < 4; i++){ s += a * vn(p); p = p * 2.03 + 17.1; a *= .5; } return s / .9375; }
`

const vert = /* glsl */`
uniform sampler2D uDepth; uniform vec2 uCovB; uniform float uAmount, uMix, uTime, uFa;
varying vec2 vUv; varying float vD;
${NOISE}
void main(){
  vUv = uv;
  vec2 ub = (uv - .5) * uCovB + .5;
  float d = texture2D(uDepth, ub).r;
  vD = d;
  vec2 q = uv * vec2(uFa, 1.);
  float n = fbm(q * 1.3 + vec2(0., uTime * .02));
  float f = clamp(n * .6 + (1. - d) * .4, 0., 1.);
  float k = smoothstep(f - .2, f + .2, uMix * 1.4 - .2);
  float band = 1. - abs(2. * k - 1.);
  vec2 ef = smoothstep(vec2(0.), vec2(.08), uv) * smoothstep(vec2(0.), vec2(.08), 1. - uv); // border stays flat
  vec3 p = position;
  p.z += ((d - .35) * uAmount * k + band * .05) * ef.x * ef.y;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.);
}`

const frag = /* glsl */`
uniform sampler2D uA, uB, uDepth; uniform vec2 uCovA, uCovB;
uniform float uMix, uOpacity, uSketch, uTime, uFa, uSweep;
varying vec2 vUv; varying float vD;
${NOISE}
vec3 grade(vec3 c){
  float l = dot(c, vec3(.2126, .7152, .0722));
  c = mix(vec3(l), c, .86);
  c *= mix(vec3(.93, .96, 1.02), vec3(1.07, 1., .88), smoothstep(.04, .6, l));
  return c * .95 + vec3(.010, .0085, .0065);
}
void main(){
  vec2 uv = vUv, q = uv * vec2(uFa, 1.);
  float front = uMix * 1.4 - .2;
  float dB = texture2D(uDepth, (uv - .5) * uCovB + .5).r;
  float n = fbm(q * 1.3 + vec2(0., uTime * .02));
  float n2 = fbm(q * 4.2 - vec2(uTime * .03, 0.));
  float f = clamp(n * .6 + (1. - dB) * .4, 0., 1.) + (n2 - .5) * .1;
  float wide = 1. - abs(2. * smoothstep(f - .2, f + .2, front) - 1.);
  float k = smoothstep(f - .045, f + .045, front);
  vec2 flow = vec2(fbm(q * 2.1 + 3.1 + uTime * .04), fbm(q * 2.1 - 7.3 - uTime * .04)) - .5;
  vec3 a = texture2D(uA, (uv + flow * wide * .06 - .5) * uCovA + .5).rgb;
  vec3 b = texture2D(uB, (uv - flow * wide * .045 - .5) * uCovB + .5).rgb;
  // before — drawing: warm ink on dark paper (keeps the watercolour hue, never inverts it)
  float la = dot(a, vec3(.299, .587, .114));
  float ink = smoothstep(.92, .12, la);
  vec3 hue = a / max(max(a.r, max(a.g, a.b)), .02);
  vec3 paper = vec3(.0095, .0082, .0064) * (.9 + .2 * vn(q * 3.));
  vec3 aInk = paper + ink * mix(vec3(.9, .78, .56), hue * .85, .35) * .85;
  // before — photo: archival grade (desaturated, warm, low-key)
  vec3 aPh = mix(vec3(la), a, .35) * vec3(1.02, .96, .86) * .72 + .015;
  vec3 ca = mix(aPh, aInk, uSketch);
  // after: hero grade + depth-aware light sweep
  vec3 cb = grade(b) * (.95 + vD * .08);
  float sw = exp(-pow((uv.x * .85 + uv.y * .45 - uSweep + vD * .22) * 3.2, 2.));
  cb += cb * vec3(1., .86, .66) * sw * .22;
  vec3 c = mix(ca, cb, k);
  // ink bleed: darkened wet edge + hairline of gold light on the front
  float edge = 1. - abs(2. * k - 1.);
  c *= 1. - wide * .22 - edge * .3;
  c += vec3(1., .74, .42) * pow(edge, 3.) * .07;
  // frame: soft inner vignette + hairline rim
  vec2 e2 = min(uv, 1. - uv) * vec2(uFa, 1.);
  float ed = min(e2.x, e2.y);
  c *= .86 + .14 * smoothstep(0., .25, ed);
  c = mix(c, vec3(.94, .9, .82), (1. - smoothstep(.0, .006, ed)) * .22);
  float g = h21(gl_FragCoord.xy + fract(uTime * 7.31) * 113.) - .5;
  c += g * .024 * (.35 + sqrt(max(c.g, 0.)));
  vec2 e = smoothstep(vec2(0.), vec2(.004), uv) * smoothstep(vec2(0.), vec2(.004), 1. - uv);
  gl_FragColor = vec4(max(c, 0.), e.x * e.y * uOpacity);
  #include <colorspace_fragment>
}`

// warm light pool behind the frame (reads as the print lit in a dark gallery)
const glVert = /* glsl */`varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`
const glFrag = /* glsl */`
uniform float uA; uniform vec2 uK; varying vec2 vUv;
void main(){
  vec2 p = (vUv - .5) * uK;
  vec2 d = max(abs(p) - .5, 0.);
  float s = exp(-dot(d, d) * 26.);
  gl_FragColor = vec4(vec3(.76, .6, .36) * s * uA, 1.);
}`

const cov = (ia, fa) => (ia > fa ? new THREE.Vector2(fa / ia, 1) : new THREE.Vector2(1, ia / fa))

function Pair({ i, texA, texB, texD, state, hi, mobile }) {
  const fa = ASPECT[i], W = H * fa
  const seg = mobile ? 96 : 200
  const geo = useMemo(() => new THREE.PlaneGeometry(W, H, fa >= 1 ? seg : Math.round(seg * fa), fa >= 1 ? Math.round(seg / fa) : seg), [W, seg, fa])
  const ia = texA.image.width / texA.image.height, ib = texB.image.width / texB.image.height
  const u = useMemo(() => ({
    uA: { value: texA }, uB: { value: texB }, uDepth: { value: texD },
    uCovA: { value: cov(ia, fa) }, uCovB: { value: cov(ib, fa) }, uFa: { value: fa },
    uAmount: { value: DEPTH[i] }, uMix: { value: 0 }, uOpacity: { value: 1 }, uSweep: { value: -1 },
    uSketch: { value: SKETCHY[i] }, uTime: { value: 0 },
  }), [texA, texB, texD])
  const glU = useMemo(() => ({ uA: { value: 0 }, uK: { value: new THREE.Vector2(1.9, 1.9) } }), [])
  const grp = useRef(), photo = useRef()
  useFrame((st, dt) => {
    const s = state.current
    if (!s.on) return
    const g = grp.current
    const near = Math.abs(s.cam - i) < 1.2
    const was = g.visible
    g.visible = near
    if (!near) return
    if (!was || s.jump) u.uMix.value = s.r[i] // re-entering (or jumped by skip/anchor): show the right state at once, never a stale frame
    const h = hi.current[i]
    if (h) { if (h.a && u.uA.value !== h.a) u.uA.value = h.a; if (h.b && u.uB.value !== h.b) u.uB.value = h.b }
    dt = Math.min(dt, 1 / 20)
    const r = damp(u.uMix.value, s.r[i], 4, dt)
    u.uMix.value = r
    u.uTime.value = s.t
    u.uSweep.value = ((s.t * .075 + i * .37) % 1.9) - .45
    u.uOpacity.value = s.op
    const lift = ss(.15, 1, r)
    photo.current.position.z = lift * .12
    glU.uA.value = (.05 + lift * .1) * s.op
  })
  return (
    <group ref={grp} position={[i * GAP, 0, 0]}>
      <mesh renderOrder={1} position={[0, 0, -.02]}>
        <planeGeometry args={[W * 1.9, H * 1.9]} />
        <shaderMaterial uniforms={glU} vertexShader={glVert} fragmentShader={glFrag} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <group ref={photo}>
        <mesh geometry={geo} renderOrder={2}>
          <shaderMaterial uniforms={u} vertexShader={vert} fragmentShader={frag} transparent />
        </mesh>
      </group>
    </group>
  )
}

const tmpLook = new THREE.Vector3()
const bgVert = /* glsl */`void main(){ gl_Position = vec4(position.xy * 2.0, 0.9999, 1.0); }`
const bgFrag = /* glsl */`uniform vec3 uC; uniform float uA; uniform vec2 uRes;
void main(){
  vec2 s = gl_FragCoord.xy / uRes;
  vec3 c = uC * (1. + .5 * exp(-dot((s - vec2(.66, .55)) * vec2(1.6, 1.), (s - vec2(.66, .55)) * vec2(1.6, 1.)) * 3.));
  gl_FragColor = vec4(c, uA);
  #include <colorspace_fragment>
}`

const imgUrl = (id, small) => `/portfolio/yts/img/${id}${small ? '-s' : ''}.webp`

export default function SceneSketch({ track }) {
  const mobile = useMemo(isMobile, [])
  const urls = useMemo(() => [
    ...PAIRS.map(p => imgUrl(p.a, true)),
    ...PAIRS.map(p => imgUrl(p.b, true)),
    ...PAIRS.map(p => `/portfolio/yts/depth/${p.b}.webp`),
  ], [])
  const tex = useLoader(THREE.TextureLoader, urls)
  const { gl, camera, scene } = useThree()
  const hi = useRef([])
  const root = useRef(), bg = useRef()
  useEffect(() => {
    const an = Math.min(8, gl.capabilities.getMaxAnisotropy())
    tex.forEach((t, k) => {
      if (k < 8) { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = an }
      else { t.generateMipmaps = false; t.minFilter = THREE.LinearFilter }
      t.needsUpdate = true
      try { gl.initTexture(t) } catch (e) {} // upload now, not on first scroll into view
    })
    // compile our shaders now (engine precompile skips invisible groups)
    const g = root.current
    if (g) {
      const vis = []; g.traverse(o => { vis.push([o, o.visible]); o.visible = true })
      try { gl.compile(g, camera, scene) } catch (e) {}
      vis.forEach(([o, v]) => { o.visible = v })
    }
    // stream full-size images afterwards (desktop + large phones get crisp prints); swapped in place once uploaded
    let dead = false
    const L = new THREE.TextureLoader(), max = mobile ? 0 : 1
    if (max) PAIRS.forEach((p, i) => ['a', 'b'].forEach(side => {
      L.load(imgUrl(p[side], false), t => {
        if (dead) { t.dispose(); return }
        t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = an
        try { gl.initTexture(t) } catch (e) {}
        hi.current[i] = { ...(hi.current[i] || {}), [side]: t }
      })
    }))
    return () => { dead = true }
  }, [tex, gl, camera, scene, mobile])

  const bgU = useMemo(() => ({ uC: { value: BG }, uA: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) } }), [])
  const state = useRef({ on: false, cam: 0, r: [0, 0, 0, 0], op: 0, t: 0 })
  const cam = useRef({ c: 0, wasActive: false, op: 0 })

  useFrame((st, dt) => {
    const t = track.current, g = root.current, s = state.current
    s.jump = !s.on && t.on
    s.on = t.on
    if (!g) return
    g.visible = t.on
    if (!t.on) { cam.current.wasActive = false; return }
    dt = Math.min(dt, 1 / 20)
    s.t += dt
    // scroll → beats. each quarter: settle → liquid reveal → hold → pan to next
    const S = Math.min(t.p, 0.9999) * 4
    for (let j = 0; j < 4; j++) s.r[j] = ss(0.04, j === 3 ? 0.5 : 0.7, S - j) // last 'after' is fully present well before the end
    let c = 0
    for (let j = 0; j < 3; j++) c += ss(0.76, 1.0, S - j)
    const C = cam.current
    C.c = C.wasActive ? damp(C.c, c, 4, dt) : c
    s.cam = C.c
    C.op = damp(C.op, ss(0.1, 0.45, t.v), 6, dt)
    s.op = C.op

    bgU.uA.value = stage.active === 'sketch' ? 1 : 0
    bg.current.visible = bgU.uA.value > 0
    st.gl.getDrawingBufferSize(bgU.uRes.value)
    if (stage.active !== 'sketch') { C.wasActive = false; return }
    // framing: fit the frame into a box (desktop: right side, text on left; mobile: upper centre)
    const va = st.size.width / st.size.height
    if (camera.fov !== 40) { camera.fov = 40; camera.updateProjectionMatrix() }
    const tan2 = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
    const k = Math.min(3, Math.floor(C.c)), fr = C.c - k
    const fa = THREE.MathUtils.lerp(ASPECT[k], ASPECT[Math.min(3, k + 1)], fr)
    const desk = va > 1.05
    const bh = desk ? 0.66 : 0.31, bw = desk ? 0.48 : 0.72
    const D = Math.max(H / (bh * tan2), (H * fa) / (bw * va * tan2))
    const visH = D * tan2, visW = visH * va
    const sx = desk ? -0.17 * visW : 0, sy = desk ? 0.02 * visH : 0.015 * visH
    const travel = Math.sin(Math.PI * fr)
    // one damping stage only (C.c, rr, pointer) → camera and look target move together, no skew while panning
    C.rr = damp(C.rr ?? 0, s.r[Math.round(C.c)] ?? 0, 4, dt)
    C.mx = damp(C.mx ?? 0, ptr.x, 2.5, dt); C.my = damp(C.my ?? 0, ptr.y, 2.5, dt)
    const rr = C.rr
    const ox = desk ? (rr - 0.5) * 0.5 + C.mx * 0.2 : 0, oy = desk ? -0.15 + rr * 0.26 + C.my * 0.1 : -0.06 + rr * 0.12 // phones: dead-centre, no sideways drift
    const px = ORIGIN.x + C.c * GAP + sx, py = ORIGIN.y + sy
    const tx = px + ox, ty = py + oy, tz = D + travel * (desk ? 1.4 : 2.2) - rr * (desk ? 0.25 : 0.1)
    camera.position.x = tx; camera.position.z = tz; C.y = ty; C.wasActive = true
    // emulated sticky: while the film enters/leaves, the frame scrolls 1:1 with the page (not damped)
    const el = stage.els.sketch
    let sh = 0
    if (el) {
      const r = el.getBoundingClientRect(), vh = st.size.height
      if (r.top > 0) sh = r.top / vh
      else if (r.bottom < vh) sh = -(vh - r.bottom) / vh
    }
    // leaving: the print dissolves into the dark page while it scrolls away (nothing left over the next title)
    s.op = C.op * (1 - ss(0.0, 0.35, -sh))
    camera.position.y = C.y + sh * visH
    tmpLook.set(px + ox * .35, py + sh * visH + oy * .35, 0)
    camera.lookAt(tmpLook)
  })

  return (
    <group ref={root} position={ORIGIN.toArray()} visible={false}>
      <mesh ref={bg} frustumCulled={false} renderOrder={-5}>
        <planeGeometry args={[1, 1]} />
        <shaderMaterial uniforms={bgU} vertexShader={bgVert} fragmentShader={bgFrag} transparent depthTest={false} depthWrite={false} />
      </mesh>
      {PAIRS.map((p, i) => <Pair key={i} i={i} texA={tex[i]} texB={tex[4 + i]} texD={tex[8 + i]} state={state} hi={hi} mobile={mobile} />)}
    </group>
  )
}
