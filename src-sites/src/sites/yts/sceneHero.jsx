import React, { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useLoader, useThree } from '@react-three/fiber'
import { stage } from './engine'

/* HERO scene for the shared canvas (see engine.jsx contract).
   4 beats, all real imagery — no procedural architecture:
   1 load   : ≤60k particles swirl in and settle into his ink sketch (img 30, dark pixels sampled)
   2 scroll : the particles take the colour + depth of render 5 (img 5 + depth/5)
   3 scroll : they condense into the solid depth mesh of render 5 (per-cell cross-fade, gold rim)
   4 scroll : slow camera dolly into the terraces + pointer parallax
   JS writes ~10 uniforms per frame; everything else is in the shaders. Glow / grain / vignette are faked
   in the shaders (no EffectComposer). */

const SKETCH = '/portfolio/yts/img/30-s.webp'
const PHOTO = '/portfolio/yts/img/5.webp'
const PHOTO_S = '/portfolio/yts/img/5-s.webp'
const DEPTH = '/portfolio/yts/depth/5.webp'

const PW = 2.9, PH = PW * 1.25, DEPTH_AMT = 0.85, SK_H = 3.05
const CELL = 'vec2(96., 120.)'
const TARGET = new THREE.Vector3((0.47 - 0.5) * PW, (0.44 - 0.5) * PH, 0.42) // the middle terraces

const HASH = /* glsl */`float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float cellN(vec2 uv){ return h21(floor(uv * ${CELL})) * .7 + (1. - uv.y) * .3; }`

/* ---------------- particles ---------------- */
const pVert = /* glsl */`
attribute vec3 aSketch; attribute vec2 aUv; attribute vec4 aRnd;
uniform float uTime, uIntro, uPhoto, uSolid, uSize, uScale, uDepthAmt, uGrow;
uniform vec2 uWH; uniform vec3 uInk, uGold;
uniform sampler2D uMap, uDepth;
varying vec3 vCol; varying float vA;
${HASH}
float sm(float x){ x = clamp(x, 0., 1.); return x*x*(3.-2.*x); }
void main(){
  float rx = aRnd.x, ry = aRnd.y, rz = aRnd.z, rw = aRnd.w;
  // 1 · swirl → sketch (outer particles arrive last)
  float ki = sm(uIntro * 1.7 - rw * .7);
  float ang = rx * 6.2831 + uTime * (.18 + ry * .3) + (1. - ki) * 3.;
  float rad = 1.2 + ry * ry * 6.5;
  vec3 swirl = vec3(cos(ang) * rad, (rz - .5) * 6. * (.35 + ry) + sin(uTime * .5 + rx * 20.) * .4, sin(ang) * rad * .6 - 1.);
  vec3 p = mix(swirl, aSketch, ki);
  p.xy += vec2(sin(uTime * 1.2 + rz * 40.), cos(uTime * 1.05 + rx * 40.)) * .006 * (1. - uPhoto); // living ink
  // 2 · sketch → colour + depth of the render (top rows first, flying on a soft arc)
  float d = texture2D(uDepth, aUv).r;
  vec3 pp = vec3((aUv.x - .5) * uWH.x, (aUv.y - .5) * uWH.y, d * uDepthAmt);
  float kp = sm(uPhoto * 1.6 - rw * .3 - (1. - aUv.y) * .3);
  float arc = sin(kp * 3.14159);
  p = mix(p, pp, kp) + vec3(sin(rx * 31. + uTime * .7) * .25, cos(ry * 27. + uTime * .6) * .2, .5 + rz * 1.4) * arc;
  // colour
  vec3 ink = mix(uInk, vec3(.22, .19, .16), ry * .5);
  float gold = step(.94, rw);
  vec3 col = mix(ink, uGold, gold * .9);
  vec3 ph = texture2D(uMap, aUv).rgb * 1.06;
  col = mix(col, ph, smoothstep(.05, .7, kp));
  col = mix(col, uGold * 1.5, arc * .12);
  float a = mix(.18, .82, ki);
  a = mix(a, 1., kp);
  // 3 · hand over to the solid mesh: fade exactly where its cell has appeared
  float k = uSolid * 1.35 - .1;
  float n = cellN(aUv);
  float gone = smoothstep(k - .1, k + .02, n);
  a *= gone;
  vec4 mv = modelViewMatrix * vec4(p, 1.);
  gl_Position = projectionMatrix * mv;
  float s = uSize * (1. + arc * .35 + gold * .3) * mix(1., uGrow, kp) * mix(1., 1.6, (1. - gone) * kp);
  gl_PointSize = clamp(s * uScale / -mv.z, 1., 18.);
  vCol = col; vA = a;
}`
const pFrag = /* glsl */`
varying vec3 vCol; varying float vA;
void main(){
  vec2 c = gl_PointCoord - .5; float r = dot(c, c);
  if (r > .25 || vA < .004) discard;
  gl_FragColor = vec4(vCol, vA * smoothstep(.25, .04, r));
  #include <colorspace_fragment>
}`

/* ---------------- solid depth photo ---------------- */
const mVert = /* glsl */`
uniform sampler2D uDepth; uniform float uAmount;
varying vec2 vUv; varying float vD;
void main(){
  vUv = uv;
  float d = texture2D(uDepth, uv).r;
  vD = d;
  vec3 p = position; p.z += d * uAmount;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.);
}`
const mFrag = /* glsl */`
uniform sampler2D uMap; uniform float uSolid, uGlow, uTime, uSweep, uEdge; uniform vec3 uBg; uniform vec2 uRes;
varying vec2 vUv; varying float vD;
${HASH}
void main(){
  float k = uSolid * 1.35 - .1;
  float n = cellN(vUv);
  if (n > k) discard;
  vec3 c = texture2D(uMap, vUv).rgb;
  // fake bloom: lift the highlights warm
  float l = dot(c, vec3(.299, .587, .114));
  c = c * 1.05 + vec3(1., .8, .55) * pow(smoothstep(.55, 1., l), 2.) * .22;
  // light sweep riding the depth during the dolly (late-afternoon sun crossing the terraces)
  float sw = exp(-pow((vD - uSweep) * 7., 2.)) * .16;
  c += vec3(1., .78, .5) * sw;
  // gold rim where the cells are landing
  float rim = smoothstep(k - .07, k, n) * uGlow;
  c += vec3(1., .72, .38) * rim * 1.6;
  // soft edges into the backdrop
  vec2 eg = vec2(uEdge * 1.8, uEdge);
  vec2 e = smoothstep(vec2(0.), eg, vUv) * smoothstep(vec2(0.), eg, 1. - vUv);
  c = mix(uBg, c, e.x * e.y);
  // vignette + grain (screen space)
  vec2 q = gl_FragCoord.xy / uRes;
  c *= mix(1., smoothstep(1.15, .35, length(q - .5)), .55);
  c += (h21(gl_FragCoord.xy + fract(uTime * 7.3) * 91.) - .5) * .045;
  gl_FragColor = vec4(c, 1.);
  #include <colorspace_fragment>
}`

/* ---------------- paper backdrop (full screen, behind everything) ---------------- */
const bVert = /* glsl */`varying vec2 vQ; void main(){ vQ = position.xy * .5 + .5; gl_Position = vec4(position.xy, .9999, 1.); }`
const bFrag = /* glsl */`
uniform vec3 uA, uB; uniform float uDark, uTime;
varying vec2 vQ;
${HASH}
void main(){
  vec3 c = mix(uA, uB, uDark);
  c *= 1. - .10 * smoothstep(.35, 1.1, length((vQ - .5) * vec2(1.3, 1.)));
  c += vec3(.75, .55, .3) * .05 * (1. - uDark) * smoothstep(.9, .0, length(vQ - vec2(.7, .55)));
  c += (h21(gl_FragCoord.xy + fract(uTime * 5.1) * 77.) - .5) * mix(.022, .026, uDark);
  gl_FragColor = vec4(c, 1.);
  #include <colorspace_fragment>
}`

function rng(seed) { let s = seed; return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646 }

/* sample dark ink pixels of the sketch (importance by darkness), skipping the handwritten dedication */
function sampleSketch(image, N, rnd) {
  const W = 300, H = Math.round(W * image.height / image.width)
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H
  const cx = cv.getContext('2d', { willReadFrequently: true }); cx.drawImage(image, 0, 0, W, H)
  const px = cx.getImageData(0, 0, W, H).data
  const cdf = new Float32Array(W * H); let acc = 0
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const u = x / W, v = y / H, i = (y * W + x) * 4
    let w = 0
    if (!(u > .5 && v > .62 && v < .9) && v < .94) {
      const l = (px[i] * .299 + px[i + 1] * .587 + px[i + 2] * .114) / 255
      w = Math.pow(Math.max(0, 1 - l - .08), 2.4)
    }
    acc += w; cdf[y * W + x] = acc
  }
  const pos = new Float32Array(N * 2)
  for (let n = 0; n < N; n++) {
    const r = rnd() * acc; let lo = 0, hi = W * H - 1
    while (lo < hi) { const m = (lo + hi) >> 1; if (cdf[m] < r) lo = m + 1; else hi = m }
    pos[n * 2] = ((lo % W) + rnd()) / W - .5; pos[n * 2 + 1] = .5 - (((lo / W) | 0) + rnd()) / H
  }
  return { pos, aspect: image.width / image.height }
}

function buildGeometry(N, sketchImg) {
  const rnd = rng(7)
  const sk = sampleSketch(sketchImg, N, rnd)
  const cols = Math.round(Math.sqrt(N / 1.25)), rows = Math.ceil(N / cols)
  const uvs = new Float32Array(N * 2)
  for (let n = 0; n < N; n++) { uvs[n * 2] = (n % cols + .5 + (rnd() - .5) * .7) / cols; uvs[n * 2 + 1] = Math.min(.999, ((n / cols | 0) + .5 + (rnd() - .5) * .7) / rows) }
  // pair sketch points with photo points band by band (top→bottom, then left→right) → coherent flight
  const sOrd = Array.from({ length: N }, (_, i) => i).sort((a, b) => sk.pos[b * 2 + 1] - sk.pos[a * 2 + 1])
  const pOrd = Array.from({ length: N }, (_, i) => i).sort((a, b) => uvs[b * 2 + 1] - uvs[a * 2 + 1])
  const aSketch = new Float32Array(N * 3), aUv = new Float32Array(N * 2), aRnd = new Float32Array(N * 4)
  const BAND = 320, sw = SK_H * sk.aspect
  let o = 0
  for (let s0 = 0; s0 < N; s0 += BAND) {
    const e = Math.min(N, s0 + BAND)
    const ss = sOrd.slice(s0, e).sort((a, b) => sk.pos[a * 2] - sk.pos[b * 2])
    const pp = pOrd.slice(s0, e).sort((a, b) => uvs[a * 2] - uvs[b * 2])
    for (let k = 0; k < ss.length; k++, o++) {
      const si = ss[k], pi = pp[k]
      aSketch[o * 3] = sk.pos[si * 2] * sw; aSketch[o * 3 + 1] = sk.pos[si * 2 + 1] * SK_H; aSketch[o * 3 + 2] = (rnd() - .5) * .05
      aUv[o * 2] = uvs[pi * 2]; aUv[o * 2 + 1] = uvs[pi * 2 + 1]
    }
  }
  for (let i = 0; i < N * 4; i++) aRnd[i] = rnd()
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(aSketch, 3))
  g.setAttribute('aSketch', new THREE.BufferAttribute(aSketch, 3))
  g.setAttribute('aUv', new THREE.BufferAttribute(aUv, 2))
  g.setAttribute('aRnd', new THREE.BufferAttribute(aRnd, 4))
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 30)
  return g
}

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const seg = (p, a, b) => clamp((p - a) / (b - a))
const ease = t => t * t * (3 - 2 * t)
const damp = THREE.MathUtils.damp
const V_END = new THREE.Vector3(), V_LOOK = new THREE.Vector3(), V_L0 = new THREE.Vector3()

// pointer from window (the canvas is pointer-events:none)
const ptr = { x: 0, y: 0 }
let ptrBound = false
function bindPointer() {
  if (ptrBound || typeof window === 'undefined') return
  ptrBound = true
  window.addEventListener('pointermove', e => { ptr.x = (e.clientX / innerWidth) * 2 - 1; ptr.y = -((e.clientY / innerHeight) * 2 - 1) }, { passive: true })
}

const MOBILE = typeof window !== 'undefined' && window.innerWidth <= 768

export default function SceneHero({ track }) {
  const [sketchTex, photoTex, depthTex] = useLoader(THREE.TextureLoader, [SKETCH, MOBILE ? PHOTO_S : PHOTO, DEPTH])
  photoTex.colorSpace = THREE.SRGBColorSpace
  photoTex.anisotropy = 4
  depthTex.generateMipmaps = false; depthTex.minFilter = THREE.LinearFilter
  const { size, gl } = useThree()
  const N = MOBILE ? 20000 : 60000
  const geo = useMemo(() => buildGeometry(N, sketchTex.image), [sketchTex, N])
  const seg2 = MOBILE ? 96 : 200
  const meshGeo = useMemo(() => new THREE.PlaneGeometry(PW, PH, seg2, Math.round(seg2 * 1.25)), [seg2])
  const quad = useMemo(() => new THREE.PlaneGeometry(2, 2), [])
  useEffect(() => { bindPointer(); return () => { geo.dispose(); meshGeo.dispose() } }, [geo, meshGeo])

  const ink = useMemo(() => new THREE.Color('#151412').convertSRGBToLinear(), [])
  const pU = useMemo(() => ({
    uTime: { value: 0 }, uIntro: { value: 0 }, uPhoto: { value: 0 }, uSolid: { value: 0 }, uSize: { value: MOBILE ? .0135 : .0115 }, uScale: { value: 500 },
    uDepthAmt: { value: DEPTH_AMT }, uGrow: { value: MOBILE ? 1.9 : 1.3 }, uWH: { value: new THREE.Vector2(PW, PH) }, uInk: { value: ink }, uGold: { value: new THREE.Color('#c99a4e').convertSRGBToLinear() },
    uMap: { value: photoTex }, uDepth: { value: depthTex },
  }), [photoTex, depthTex])
  const mU = useMemo(() => ({
    uMap: { value: photoTex }, uDepth: { value: depthTex }, uAmount: { value: DEPTH_AMT }, uSolid: { value: 0 }, uGlow: { value: 1 }, uTime: { value: 0 }, uSweep: { value: -1 },
    uEdge: { value: .06 }, uBg: { value: new THREE.Color('#ece7df') }, uRes: { value: new THREE.Vector2(1, 1) },
  }), [photoTex, depthTex])
  const bU = useMemo(() => ({ uA: { value: new THREE.Color('#ece7df') }, uB: { value: new THREE.Color('#14120f') }, uDark: { value: 0 }, uTime: { value: 0 } }), [])

  const g = useRef(), mesh = useRef(), pts = useRef()
  const st = useRef({ t: 0, t0: -1, ps: 0, cam: new THREE.Vector3(), look: new THREE.Vector3(), px: 0, py: 0, init: false })
  const tmpP = useMemo(() => new THREE.Vector3(), []), tmpL = useMemo(() => new THREE.Vector3(), [])

  useFrame((state, dt) => {
    const tr = track.current, s = st.current
    if (!g.current) return
    if (!tr.on) { g.current.visible = false; return }
    g.current.visible = true
    dt = Math.min(dt, 1 / 20)
    s.t += dt
    const now = performance.now() / 1000
    if (s.t0 < 0) s.t0 = now
    const mobile = size.width <= 768

    // scroll → beats (one damped progress drives everything → silk)
    s.ps = damp(s.ps, tr.p, 4.5, dt)
    const p = s.ps
    const intro = ease(clamp((now - s.t0 - .15) / 3.2))
    const b2 = ease(seg(p, .02, .34))
    const b3 = ease(seg(p, .3, .56))
    const b4 = ease(seg(p, .5, 1))

    pU.uTime.value = s.t; pU.uIntro.value = intro; pU.uPhoto.value = b2; pU.uSolid.value = b3
    pU.uScale.value = size.height * gl.getPixelRatio() / (2 * Math.tan(THREE.MathUtils.degToRad(state.camera.fov) / 2))
    pts.current.visible = b3 < .995
    mesh.current.visible = b3 > .001
    mU.uSolid.value = b3; mU.uGlow.value = 1 - b4 * .9; mU.uTime.value = s.t
    mU.uSweep.value = -.3 + b4 * 1.6
    state.gl.getDrawingBufferSize(mU.uRes.value)
    const dark = ease(seg(p, .4, .54))
    bU.uDark.value = dark; bU.uTime.value = s.t
    mU.uBg.value.copy(bU.uA.value).lerp(bU.uB.value, dark)

    if (stage.active !== 'hero') return
    // camera: sketch framed (right on desktop, top on mobile) → render framed → dolly into the terraces
    const cam = state.camera
    if (mobile) {
      tmpP.set(0, -.8, 7.7).lerp(tmpL.set(0, -.15, 7.9), b2)
    } else {
      tmpP.set(-1.3, .02, 5.5).lerp(tmpL.set(0, .1, 6.1), b2)
    }
    const look = V_L0.set(tmpP.x, tmpP.y, 0)
    const end = mobile ? 1.75 : 1.45
    const k4 = b4 * b4 * (3 - 2 * b4)
    tmpP.lerp(V_END.set(TARGET.x, TARGET.y + .32, TARGET.z + end), k4)
    look.lerp(V_LOOK.set(TARGET.x, TARGET.y - .06, TARGET.z), k4)
    s.px = damp(s.px, ptr.x, 3, dt); s.py = damp(s.py, ptr.y, 3, dt)
    const par = mobile ? 0 : (.22 - b4 * .1)
    tmpP.x += s.px * par; tmpP.y += s.py * par * .6
    if (!s.init) { s.cam.copy(tmpP); s.look.copy(look); s.init = true }
    s.cam.x = damp(s.cam.x, tmpP.x, 5, dt); s.cam.y = damp(s.cam.y, tmpP.y, 5, dt); s.cam.z = damp(s.cam.z, tmpP.z, 5, dt)
    s.look.x = damp(s.look.x, look.x, 5, dt); s.look.y = damp(s.look.y, look.y, 5, dt); s.look.z = damp(s.look.z, look.z, 5, dt)
    if (cam.fov !== 40) { cam.fov = 40; cam.updateProjectionMatrix() }
    cam.position.copy(s.cam)
    cam.lookAt(s.look)
  })

  return (
    <group ref={g} visible={false}>
      <mesh geometry={quad} frustumCulled={false} renderOrder={-10}>
        <shaderMaterial uniforms={bU} vertexShader={bVert} fragmentShader={bFrag} depthTest={false} depthWrite={false} />
      </mesh>
      <mesh ref={mesh} geometry={meshGeo} renderOrder={1}>
        <shaderMaterial uniforms={mU} vertexShader={mVert} fragmentShader={mFrag} />
      </mesh>
      <points ref={pts} geometry={geo} frustumCulled={false} renderOrder={2}>
        <shaderMaterial uniforms={pU} vertexShader={pVert} fragmentShader={pFrag} transparent depthWrite={false} />
      </points>
    </group>
  )
}
