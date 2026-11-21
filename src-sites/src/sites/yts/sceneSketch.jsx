import React, { useEffect, useMemo, useRef } from 'react'
import { useFrame, useLoader, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { stage } from './engine'
import { PAIRS } from './data'

/* SKETCH → REALITY (engine scene id 'sketch')
   4 pairs side by side on the "paper" (far off the origin so other scenes never overlap).
   Each scroll quarter: the before image lies flat on the page, a glowing ink seam rises through it
   (fbm-warped), behind the seam the after photo lifts off the paper into real depth (depth map),
   a soft paper shadow grows under it; embers drift up from the seam. Camera pans to the next pair.
   Everything damped; no per-frame React state; no postprocessing. */

const ORIGIN = new THREE.Vector3(-120, 40, 0)
const GAP = 8
const H = 2.6 // frame height (world)
const ASPECT = [0.78, 1.25, 0.95, 1.33] // per-pair frame w/h (both images cover-fit into it)
const DEPTH = [0.5, 0.42, 0.55, 0.42]
const SKETCHY = [true, false, false, false] // multiply onto paper
const PAPER = new THREE.Color('#ece7df')

const isMobile = () => typeof window !== 'undefined' && window.innerWidth <= 768
const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }
const damp = THREE.MathUtils.damp

// pointer over the window (canvas is pointer-events:none)
const ptr = { x: 0, y: 0 }
if (typeof window !== 'undefined') window.addEventListener('pointermove', e => { ptr.x = e.clientX / innerWidth * 2 - 1; ptr.y = -(e.clientY / innerHeight * 2 - 1) }, { passive: true })

const NOISE = /* glsl */`
float h2(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(h2(i), h2(i+vec2(1,0)), f.x), mix(h2(i+vec2(0,1)), h2(i+vec2(1,1)), f.x), f.y); }
float fbm(vec2 p){ return vn(p)*0.55 + vn(p*2.13+7.1)*0.28 + vn(p*4.7+3.3)*0.17; }
// sweep coordinate: rises from bottom, slight diagonal, ink-bleed warp
float sweep(vec2 uv){ return uv.y*0.82 + uv.x*0.18 + (fbm(uv*vec2(3.0,2.2)) - 0.5)*0.22; }
`

const vert = /* glsl */`
uniform sampler2D uDepth; uniform vec2 uCovB; uniform float uAmount; uniform float uSeam; uniform float uRise;
varying vec2 vUv; varying float vD; varying float vF;
${NOISE}
void main(){
  vUv = uv;
  vec2 ub = (uv - 0.5) * uCovB + 0.5;
  float d = texture2D(uDepth, ub).r;
  float f = sweep(uv);
  vF = f;
  float behind = smoothstep(uSeam, uSeam - 0.38, f);       // fully risen well behind the seam
  float wave = exp(-pow((f - uSeam) * 14.0, 2.0)) * 0.06;  // little lift right at the seam
  vD = d;
  vec2 ef = smoothstep(vec2(0.0), vec2(0.1), uv) * smoothstep(vec2(0.0), vec2(0.1), 1.0 - uv); // frame border stays flat
  vec3 p = position;
  p.z += (d - 0.35) * uAmount * behind * uRise * ef.x * ef.y + wave * step(0.001, uRise) * (1.0 - step(0.999, uRise));
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`

const frag = /* glsl */`
uniform sampler2D uA; uniform sampler2D uB; uniform vec2 uCovA; uniform vec2 uCovB;
uniform float uSeam; uniform float uGlow; uniform float uOpacity; uniform float uSketch; uniform vec3 uPaper; uniform float uTime;
varying vec2 vUv; varying float vD; varying float vF;
${NOISE}
void main(){
  vec2 ua = (vUv - 0.5) * uCovA + 0.5, ub = (vUv - 0.5) * uCovB + 0.5;
  vec3 a = texture2D(uA, ua).rgb;
  vec3 b = texture2D(uB, ub).rgb;
  // before: lies on the paper (sketches multiply into the page; photos get a light paper wash)
  vec3 aOn = mix(a * mix(vec3(1.0), uPaper, 0.08) * 0.97, a * uPaper * 1.02, uSketch);
  float lum = dot(aOn, vec3(0.299, 0.587, 0.114));
  aOn = mix(aOn, vec3(lum) * vec3(1.02, 0.99, 0.94), 0.25 * (1.0 - uSketch));
  float f = vF;
  float dist = f - uSeam;                               // >0 = still before
  float m = smoothstep(0.012, -0.012, dist);            // 1 = after revealed
  // wet ink bleeding ahead of the seam
  float bleed = smoothstep(0.09, 0.0, dist) * step(0.0, dist);
  aOn *= 1.0 - bleed * 0.45 * uGlow;
  // after: photographic grade + depth-aware light + vignette
  vec2 q = vUv - 0.5;
  float vig = 1.0 - dot(q, q) * 0.55;
  vec3 bb = b * vig * (0.94 + vD * 0.1);
  float g = (h2(vUv * 900.0 + fract(uTime) * 37.0) - 0.5) * 0.025;
  bb += g;
  vec3 col = mix(aOn, bb, m);
  // glowing seam (fake bloom = tight core + wide halo)
  float core = exp(-abs(dist) * 140.0), halo = exp(-abs(dist) * 22.0);
  col += (vec3(1.0, 0.86, 0.62) * core * 1.1 + vec3(0.85, 0.5, 0.22) * halo * 0.38) * uGlow;
  // soft frame edge
  vec2 e = smoothstep(vec2(0.0), vec2(0.006), vUv) * smoothstep(vec2(0.0), vec2(0.006), 1.0 - vUv);
  gl_FragColor = vec4(col, e.x * e.y * uOpacity);
  #include <colorspace_fragment>
}`

const shVert = /* glsl */`varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`
const shFrag = /* glsl */`
uniform float uA; uniform vec2 uK; varying vec2 vUv;
void main(){
  vec2 p = (vUv - 0.5) * uK;              // uK = plane size / frame size
  vec2 d = max(abs(p) - 0.5, 0.0);
  float s = exp(-dot(d, d) * 90.0);
  gl_FragColor = vec4(0.09, 0.07, 0.05, s * uA);
}`

const emVert = /* glsl */`
attribute vec3 aR; uniform float uTime; uniform float uSeam; uniform vec2 uSize; uniform float uPx;
varying float vA;
void main(){
  float life = fract(aR.y + uTime * (0.12 + aR.z * 0.18));
  float x = aR.x - 0.5;
  // follow the (unwarped) seam line: uv.y*0.82 + uv.x*0.18 = seam
  float sy = (uSeam - (aR.x) * 0.18) / 0.82;
  float y = sy + life * (0.10 + aR.z * 0.14) - 0.5;
  vec3 p = vec3(x * uSize.x + sin(life * 6.0 + aR.z * 20.0) * 0.03, y * uSize.y, 0.08 + life * 0.35 * aR.z);
  vA = smoothstep(0.0, 0.15, life) * (1.0 - life) * step(-0.5, y) * step(y, 0.5);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = uPx * (0.6 + aR.z) / -mv.z;
  gl_Position = projectionMatrix * mv;
}`
const emFrag = /* glsl */`
uniform float uGlow; varying float vA;
void main(){ vec2 c = gl_PointCoord - 0.5; float d = length(c); float a = smoothstep(0.5, 0.0, d);
  gl_FragColor = vec4(vec3(1.0, 0.78, 0.48) * (1.0 + a), a * a * vA * uGlow); }`

const cov = (ia, fa) => (ia > fa ? new THREE.Vector2(fa / ia, 1) : new THREE.Vector2(1, ia / fa))

function Pair({ i, texA, texB, texD, state, mobile }) {
  const fa = ASPECT[i], W = H * fa
  const seg = mobile ? 96 : 200
  const geo = useMemo(() => new THREE.PlaneGeometry(W, H, fa >= 1 ? seg : Math.round(seg * fa), fa >= 1 ? Math.round(seg / fa) : seg), [W, seg, fa])
  const ia = texA.image.width / texA.image.height, ib = texB.image.width / texB.image.height
  const u = useMemo(() => ({
    uA: { value: texA }, uB: { value: texB }, uDepth: { value: texD },
    uCovA: { value: cov(ia, fa) }, uCovB: { value: cov(ib, fa) },
    uAmount: { value: DEPTH[i] }, uSeam: { value: -0.3 }, uRise: { value: 0 }, uGlow: { value: 0 }, uOpacity: { value: 1 },
    uSketch: { value: SKETCHY[i] ? 1 : 0 }, uPaper: { value: PAPER }, uTime: { value: 0 },
  }), [texA, texB, texD])
  const shU = useMemo(() => ({ uA: { value: 0 }, uK: { value: new THREE.Vector2(1.5, 1.5) } }), [])
  const N = mobile ? 90 : 220
  const emGeo = useMemo(() => {
    const g = new THREE.BufferGeometry(), r = new Float32Array(N * 3)
    for (let k = 0; k < N * 3; k++) r[k] = Math.random()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3))
    g.setAttribute('aR', new THREE.BufferAttribute(r, 3))
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 5)
    return g
  }, [N])
  const emU = useMemo(() => ({ uTime: { value: 0 }, uSeam: { value: 0 }, uSize: { value: new THREE.Vector2(W, H) }, uGlow: { value: 0 }, uPx: { value: 60 } }), [W])
  const grp = useRef(), photo = useRef(), shadow = useRef()
  useFrame((st, dt) => {
    const s = state.current
    if (!s.on) return
    const g = grp.current
    const near = Math.abs(s.cam - i) < 1.15
    g.visible = near
    if (!near) return
    const target = s.r[i]
    const cur = u.uRise.value
    const r = damp(cur, target, 5, dt)
    u.uRise.value = r
    u.uSeam.value = -0.3 + r * 1.6
    u.uGlow.value = ss(0.0, 0.06, r) * (1 - ss(0.88, 1.0, r))
    u.uTime.value = st.clock.elapsedTime
    u.uOpacity.value = s.op
    emU.uTime.value = st.clock.elapsedTime; emU.uSeam.value = u.uSeam.value; emU.uGlow.value = u.uGlow.value * s.op
    emU.uPx.value = 46 * Math.min(st.gl.getPixelRatio(), 1.5) * (st.size.height / 800)
    // lift off the paper: tiny scale/tilt + growing shadow
    const lift = ss(0.1, 1, r)
    photo.current.position.z = lift * 0.12
    shU.uA.value = lift * 0.55 * s.op
    shadow.current.position.set(lift * 0.08, -lift * 0.14, -0.01)
  })
  return (
    <group ref={grp} position={[i * GAP, 0, 0]}>
      <mesh ref={shadow} renderOrder={1}>
        <planeGeometry args={[W * 1.5, H * 1.5]} />
        <shaderMaterial uniforms={shU} vertexShader={shVert} fragmentShader={shFrag} transparent depthWrite={false} />
      </mesh>
      <group ref={photo}>
        <mesh geometry={geo} renderOrder={2}>
          <shaderMaterial uniforms={u} vertexShader={vert} fragmentShader={frag} transparent />
        </mesh>
        <points geometry={emGeo} renderOrder={3}>
          <shaderMaterial uniforms={emU} vertexShader={emVert} fragmentShader={emFrag} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
        </points>
      </group>
    </group>
  )
}

const tmpLook = new THREE.Vector3()
const bgVert = /* glsl */`void main(){ gl_Position = vec4(position.xy * 2.0, 0.9999, 1.0); }`
const bgFrag = /* glsl */`uniform vec3 uC; uniform float uA; void main(){ gl_FragColor = vec4(uC, uA);
  #include <colorspace_fragment>
}`

export default function SceneSketch({ track }) {
  const mobile = useMemo(isMobile, [])
  const small = mobile
  const urls = useMemo(() => [
    ...PAIRS.map(p => `/portfolio/yts/img/${p.a}${small ? '-s' : ''}.webp`),
    ...PAIRS.map(p => `/portfolio/yts/img/${p.b}${small ? '-s' : ''}.webp`),
    ...PAIRS.map(p => `/portfolio/yts/depth/${p.b}.webp`),
  ], [small])
  const tex = useLoader(THREE.TextureLoader, urls)
  const { gl, camera, scene } = useThree()
  useEffect(() => {
    tex.forEach((t, k) => {
      if (k < 8) { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4 }
      t.generateMipmaps = k < 8; if (k >= 8) { t.minFilter = THREE.LinearFilter }
      t.needsUpdate = true
      try { gl.initTexture(t) } catch (e) {} // upload now, not on first scroll into view
    })
    // compile our shaders now (engine precompile skips invisible groups)
    const g = root.current; if (!g) return
    const vis = []; g.traverse(o => { vis.push([o, o.visible]); o.visible = true })
    try { gl.compile(g, camera, scene) } catch (e) {}
    vis.forEach(([o, v]) => { o.visible = v })
  }, [tex, gl, camera, scene])

  const root = useRef(), bg = useRef()
  const bgU = useMemo(() => ({ uC: { value: PAPER }, uA: { value: 0 } }), [])
  const state = useRef({ on: false, cam: 0, r: [0, 0, 0, 0], op: 0 })
  const cam = useRef({ c: 0, wasActive: false, op: 0 })

  useFrame((st, dt) => {
    const t = track.current, g = root.current, s = state.current
    s.on = t.on
    if (!g) return
    g.visible = t.on
    if (!t.on) { cam.current.wasActive = false; return }
    // scroll → beats. each quarter: settle → seam reveal → hold → pan to next
    const S = Math.min(t.p, 0.9999) * 4
    for (let j = 0; j < 4; j++) s.r[j] = ss(0.06, 0.72, S - j)
    let c = 0
    for (let j = 0; j < 3; j++) c += ss(0.8, 1.0, S - j)
    const C = cam.current
    C.c = C.wasActive ? damp(C.c, c, 4.5, dt) : c
    s.cam = C.c
    C.op = damp(C.op, ss(0.25, 0.75, t.v), 6, dt)
    s.op = C.op

    // own paper backdrop while active (covers any other scene's full-screen backdrop lingering at the edges)
    bgU.uA.value = stage.active === 'sketch' ? 1 : 0
    bg.current.visible = bgU.uA.value > 0
    if (stage.active !== 'sketch') { C.wasActive = false; return }
    // framing: fit the frame into a box (desktop: right side, text on left; mobile: upper centre)
    const va = st.size.width / st.size.height
    if (camera.fov !== 40) { camera.fov = 40; camera.updateProjectionMatrix() }
    const tan2 = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
    const k = Math.min(3, Math.floor(C.c)), fr = C.c - k
    const fa = THREE.MathUtils.lerp(ASPECT[k], ASPECT[Math.min(3, k + 1)], fr)
    const desk = va > 1.05
    const bh = desk ? 0.66 : 0.36, bw = desk ? 0.48 : 0.74
    const D = Math.max(H / (bh * tan2), (H * fa) / (bw * va * tan2))
    const visH = D * tan2, visW = visH * va
    const sx = desk ? -0.17 * visW : 0, sy = desk ? 0.02 * visH : 0.0
    const travel = Math.sin(Math.PI * fr)
    const rr = s.r[Math.round(C.c)] ?? 0
    const ox = (rr - 0.5) * 0.6 * (desk ? 1 : 0.5) + ptr.x * 0.22, oy = -0.18 + rr * 0.3 + ptr.y * 0.12
    const px = ORIGIN.x + C.c * GAP + sx, py = ORIGIN.y + sy
    const tx = px + ox, ty = py + oy, tz = D + travel * 1.6 - rr * 0.25
    if (!C.wasActive) { camera.position.set(tx, ty, tz); C.wasActive = true }
    else {
      camera.position.x = damp(camera.position.x, tx, 5, dt)
      camera.position.y = damp(camera.position.y, ty, 5, dt)
      camera.position.z = damp(camera.position.z, tz, 5, dt)
    }
    tmpLook.set(px, py, 0)
    camera.lookAt(tmpLook)
  })

  return (
    <group ref={root} position={ORIGIN.toArray()} visible={false}>
      <mesh ref={bg} frustumCulled={false} renderOrder={-5}>
        <planeGeometry args={[1, 1]} />
        <shaderMaterial uniforms={bgU} vertexShader={bgVert} fragmentShader={bgFrag} transparent depthTest={false} depthWrite={false} />
      </mesh>
      {PAIRS.map((p, i) => <Pair key={i} i={i} texA={tex[i]} texB={tex[4 + i]} texD={tex[8 + i]} state={state} mobile={mobile} />)}
    </group>
  )
}
