import React, { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { addAfterEffect, createPortal, useFrame, useThree } from '@react-three/fiber'
import { useEnvironment } from '@react-three/drei'
import { stage } from './engine'
import { MAQUETTES } from './models3d'
import { chapOf, finOf } from './Models'

/* MODELS (V6) — CIAO-style maquette showcase, rendered into the Models section's sticky frame.

   Own scene + own camera, drawn in a second pass right after the shared canvas renders (addAfterEffect),
   scissored to the sticky frame's on-screen rect. So:
   - the shared camera is never touched (other scenes keep theirs, no fights at the hand-offs),
   - the stage scrolls in/out exactly like a DOM block, soft-feathered at the moving edge → no hard cut
     from Studio above or into Como below,
   - the studio HDRI is this scene's own `scene.environment` (scene-local by construction).
   Layers, back → front:
     Backdrop (clip-space quad, opaque list, blended) — dark stage, spot beam, underglow, feathered edges
     Floor glow + plinth (polished dark stone, lit ring) + resting maquettes with baked radial shadows
     Flood (camera-facing quad at a depth BETWEEN the plinth and the focused model): the colour chapter.
        Everything behind it sinks into the colour; the focused maquette sits in front of it, "inside" the
        glow. A model flying out of the carousel literally emerges through the colour.
     Focused maquette.
   All motion is a pure function of the damped scroll progress (+ tiny time drift/pointer) → reversible. */

const HDR = '/portfolio/yts/hdr/studio_small_08.hdr'
const TAU = Math.PI * 2, HP = Math.PI / 2
const R = 1.3          // slot radius on the plinth
const PR = 2.15        // plinth radius
const MH = 1.6         // nominal maquette size (base at y=0)
const damp = THREE.MathUtils.damp, lerp = THREE.MathUtils.lerp
const cl = v => Math.min(1, Math.max(0, v))
const sm = x => { x = cl(x); return x * x * (3 - 2 * x) }
const wrapNear = (a, ref) => a - TAU * Math.round((a - ref) / TAU)

// chapter palettes in display sRGB: [glow, mid, edge]
const hex = h => [parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255]
const PAL = [
  ['#a4ad6a', '#4a5634', '#0c1a1d'], // Terraces — olive glow over deep lake
  ['#8fa5ba', '#34414f', '#090c11'], // Tower — graphite / steel blue
  ['#f1c68c', '#b07a40', '#2b190b'], // Curve — warm sand
  ['#f58a35', '#a8431a', '#2a0d04'], // Palazzo — Tuscan ochre, CIAO-orange glow
].map(p => p.map(hex))

/* ───────────── shaders ───────────── */
const NOISE = /* glsl */`
float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
  return mix(mix(h21(i), h21(i+vec2(1.,0.)), f.x), mix(h21(i+vec2(0.,1.)), h21(i+vec2(1.,1.)), f.x), f.y); }
float fbm(vec2 p){ float a = .5, s = 0.; for(int i = 0; i < 4; i++){ s += a * vn(p); p = p * 2.03 + 17.1; a *= .5; } return s / .9375; }`

const backVert = /* glsl */`varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy * 2., 0., 1.); }`
const backFrag = /* glsl */`
uniform vec2 uPl; uniform float uAsp, uFt, uFb, uFin, uT, uGlow; uniform vec3 uTint;
varying vec2 vUv;
${NOISE}
void main(){
  vec2 q = (vUv - .5) * vec2(uAsp, 1.);
  vec2 pl = (uPl - .5) * vec2(uAsp, 1.);
  vec3 col = vec3(.043, .039, .031);
  // lifted stage around the plinth (warm), slightly cooler high up
  float d = length((q - pl) * vec2(.7, 1.2));
  col += vec3(.075, .066, .055) * exp(-d * d * 2.2) * uGlow;
  // soft spot beam falling onto the plinth from above
  float bx = abs(q.x - pl.x * .9);
  float beam = exp(-pow(bx / (.16 + .22 * clamp(1. - (vUv.y - uPl.y), 0., 1.)), 2.)) * smoothstep(uPl.y - .05, 1.05, vUv.y);
  col += vec3(.06, .055, .048) * beam * (.55 + .45 * fbm(vec2(q.x * 3., vUv.y * 1.5 - uT * .03))) * uGlow;
  // faint chapter tint memory
  col += uTint * .05 * exp(-d * d * 1.2);
  // vignette + grain
  col *= 1. - .35 * smoothstep(.5, 1.25, length(q * vec2(.85, 1.)));
  col += (h21(gl_FragCoord.xy + fract(uT * 7.) * 91.) - .5) * (2.5 / 255.);
  float a = (uFt > .001 ? smoothstep(0., uFt, 1. - vUv.y) : 1.) * (uFb > .001 ? smoothstep(0., uFb, vUv.y) : 1.);
  gl_FragColor = vec4(col * a, a);
}`

const floodVert = /* glsl */`varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`
const floodFrag = /* glsl */`
uniform vec3 uG, uM, uE;
uniform vec2 uC; uniform float uAsp, uFlood, uT, uK, uFb;
varying vec2 vUv;
${NOISE}
void main(){
  // quad is 1/uK of the view → map back to view uv
  vec2 uv = (vUv - .5) / uK + .5;
  vec2 q = (uv - .5) * vec2(uAsp, 1.);
  vec2 c = (uC - .5) * vec2(uAsp, 1.);
  float d = length((q - c) * vec2(1., 1.08));
  vec3 g = uG, m = uM, e = uE;
  // radial glow, CIAO style: hot core behind the object, rich mid, deep edges
  vec3 col = mix(g * 1.12, m, smoothstep(.0, .62, d));
  col = mix(col, e, smoothstep(.38, 1.35, d));
  // horizon of light below the object + a slow caustic shimmer in the glow
  col += g * .16 * exp(-pow((uv.y - (uC.y - .32)) * 5.5, 2.)) * exp(-d * .9);
  col *= .94 + .1 * fbm(q * 1.6 + vec2(uT * .04, -uT * .03));
  // liquid reveal from the object outward
  float n = fbm(q * 2.4 + vec2(0., uT * .06));
  float Rr = uFlood * 2.25 - .2;
  float a = 1. - smoothstep(Rr - .3, Rr + .02, d + (n - .5) * .4);
  // wet rim on the expanding front
  float rim = smoothstep(Rr - .3, Rr - .12, d + (n - .5) * .4) * a * (1. - smoothstep(.98, 1., uFlood));
  col += g * rim * .35;
  col += (h21(gl_FragCoord.xy + fract(uT * 7.) * 53.) - .5) * (3. / 255.);
  a *= uFb > .001 ? smoothstep(0., uFb, uv.y) : 1.;
  gl_FragColor = vec4(col, a * .965 * smoothstep(0., .2, uFlood));
}`

const floorFrag = /* glsl */`
uniform float uI; varying vec2 vUv;
void main(){
  float r = length(vUv - .5) * 2. * 7.;           // world radius (plane radius 7)
  float ring = exp(-pow((r - 2.02) / .32, 2.)) * .55 + exp(-pow((r - 2.1) / 1.1, 2.)) * .16;
  float pool = exp(-r * r / 9.) * .05;
  vec3 c = vec3(1., .86, .66) * (ring + pool) * uI;
  gl_FragColor = vec4(c, 1.);
}`

/* ───────────── baked textures ───────────── */
function useShadowTex() {
  return useMemo(() => {
    const s = 128, cv = document.createElement('canvas'); cv.width = cv.height = s
    const x = cv.getContext('2d'), g = x.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
    g.addColorStop(0, 'rgba(0,0,0,.92)'); g.addColorStop(.35, 'rgba(0,0,0,.6)'); g.addColorStop(.7, 'rgba(0,0,0,.18)'); g.addColorStop(1, 'rgba(0,0,0,0)')
    x.fillStyle = g; x.fillRect(0, 0, s, s)
    const t = new THREE.CanvasTexture(cv); return t
  }, [])
}
// polished dark stone: faint veins + speckle (512px, generated once)
function useStoneTex() {
  return useMemo(() => {
    const s = 512, cv = document.createElement('canvas'); cv.width = cv.height = s
    const x = cv.getContext('2d')
    x.fillStyle = '#121110'; x.fillRect(0, 0, s, s)
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647
    for (let i = 0; i < 2600; i++) { x.fillStyle = `rgba(${rnd() > .5 ? '255,245,230' : '0,0,0'},${rnd() * .05})`; const r = rnd() * 2.2; x.fillRect(rnd() * s, rnd() * s, r, r) }
    x.lineCap = 'round'
    for (let i = 0; i < 16; i++) {
      x.strokeStyle = `rgba(214,204,188,${.025 + rnd() * .06})`; x.lineWidth = .5 + rnd() * 1.8
      x.beginPath(); let px = rnd() * s, py = rnd() * s; x.moveTo(px, py)
      for (let k = 0; k < 6; k++) { const nx = px + (rnd() - .3) * 160, ny = py + (rnd() - .5) * 120; x.quadraticCurveTo(px + (rnd() - .5) * 90, py + (rnd() - .5) * 90, nx, ny); px = nx; py = ny }
      x.stroke()
    }
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4
    return t
  }, [])
}

/* ───────────── plinth ───────────── */
function Plinth({ refG, ringMat }) {
  const stone = useStoneTex()
  const lathe = useMemo(() => {
    const pts = [[0, 0], [PR - .05, 0], [PR - .018, -.008], [PR, -.035], [PR, -.19], [PR - .02, -.215], [PR - .06, -.228], [0, -.228]].map(([a, b]) => new THREE.Vector2(a, b))
    const g = new THREE.LatheGeometry(pts, 128)
    // planar uv for the stone (top face)
    const p = g.attributes.position, uv = g.attributes.uv
    for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / (PR * 2) + .5, p.getZ(i) / (PR * 2) + .5)
    return g
  }, [])
  return (
    <group ref={refG}>
      <mesh geometry={lathe}>
        <meshStandardMaterial map={stone} color="#d8d2c8" roughness={.16} metalness={0} envMapIntensity={1.15} />
      </mesh>
      {/* hairline groove on the top surface */}
      <mesh rotation-x={-HP} position-y={.0015}>
        <ringGeometry args={[PR - .2, PR - .19, 128]} />
        <meshBasicMaterial color="#c3a15e" transparent opacity={.28} toneMapped={false} />
      </mesh>
      {/* the lit ring: a recessed light band between plinth and base */}
      <mesh position-y={-.25}>
        <cylinderGeometry args={[PR - .1, PR - .1, .034, 128, 1, true]} />
        <primitive object={ringMat} attach="material" />
      </mesh>
      <mesh position-y={-.45}>
        <cylinderGeometry args={[PR - .2, PR - .16, .38, 96]} />
        <meshStandardMaterial color="#0e0d0c" roughness={.42} metalness={.7} envMapIntensity={.7} />
      </mesh>
    </group>
  )
}

/* ───────────── maquette slot ───────────── */
function Slot({ M, refG }) {
  return (
    <group ref={refG}>
      <group position-y={-MH / 2}>
        <M />
      </group>
    </group>
  )
}

const ptr = { x: 0, y: 0 }
if (typeof window !== 'undefined') addEventListener('pointermove', e => { ptr.x = e.clientX / innerWidth * 2 - 1; ptr.y = e.clientY / innerHeight * 2 - 1 }, { passive: true })

export default function SceneModels({ track }) {
  const { gl, get } = useThree()
  const scene = useMemo(() => { const s = new THREE.Scene(); s.environmentIntensity = .9; return s }, [])
  const cam = useMemo(() => new THREE.PerspectiveCamera(30, 1.6, .1, 60), [])
  const env = useEnvironment({ files: HDR })
  useEffect(() => { scene.environment = env; return () => { scene.environment = null } }, [env, scene])
  const shadowTex = useShadowTex()

  const root = useRef(), plinth = useRef(), floor = useRef(), flood = useRef(), key = useRef(), rim = useRef()
  const slots = [useRef(), useRef(), useRef(), useRef()]
  const shadows = [useRef(), useRef(), useRef(), useRef()]

  const ringMat = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.38, 1.1), toneMapped: false, side: THREE.DoubleSide }), [])
  const backU = useMemo(() => ({ uPl: { value: new THREE.Vector2(.5, .3) }, uAsp: { value: 1.6 }, uFt: { value: 0 }, uFb: { value: 0 }, uFin: { value: 0 }, uT: { value: 0 }, uGlow: { value: 1 }, uTint: { value: new THREE.Vector3() } }), [])
  const floodU = useMemo(() => {
    return { uC: { value: new THREE.Vector2(.5, .5) }, uAsp: { value: 1.6 }, uFlood: { value: 0 }, uT: { value: 0 }, uK: { value: 1 }, uFb: { value: 0 },
      uG: { value: new THREE.Vector3(...PAL[0][0]) }, uM: { value: new THREE.Vector3(...PAL[0][1]) }, uE: { value: new THREE.Vector3(...PAL[0][2]) } }
  }, [])
  const floorU = useMemo(() => ({ uI: { value: 1 } }), [])
  const backMat = useMemo(() => new THREE.ShaderMaterial({
    uniforms: backU, vertexShader: backVert, fragmentShader: backFrag, depthTest: false, depthWrite: false,
    transparent: false, blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor, blendSrcAlpha: THREE.OneFactor, blendDstAlpha: THREE.OneMinusSrcAlphaFactor,
  }), [backU])

  const s = useRef({ p: 0, p1: 0, init: false, spin: 0, t: 0, px: 0, py: 0, warmed: 0, rect: null, cam: new THREE.Vector3(0, 2, 8), look: new THREE.Vector3(0, .4, 0), sx: 0, sy: 0, fov: 30, palIdx: 0 }).current
  const tmp = useMemo(() => ({ v: new THREE.Vector3(), w: new THREE.Vector3(), f: new THREE.Vector3(), slot: new THREE.Vector3(), foc: new THREE.Vector3(), line: new THREE.Vector3(), q: new THREE.Quaternion(), e: new THREE.Euler(), c0: new THREE.Color(), rimBase: new THREE.Color('#a9c6ff') }), [])

  // point along the ray through a given NDC at a given forward distance
  const along = (out, nx, ny, dist) => {
    tmp.v.set(nx, ny, .5).unproject(cam).sub(cam.position).normalize()
    cam.getWorldDirection(tmp.f)
    return out.copy(cam.position).addScaledVector(tmp.v, dist / Math.max(.2, tmp.v.dot(tmp.f)))
  }

  useFrame((state, dt) => {
    const tr = track.current, g = root.current
    if (!g) return
    dt = Math.min(dt, 1 / 20)
    const fr = stage.models?.frame
    const on = tr.on && !!fr
    g.visible = on
    if (!on) { const tg = stage.models?.tags; if (tg) for (const k in tg) if (tg[k]) tg[k].style.opacity = 0; s.init = false; return }
    s.t += dt
    const rect = fr.getBoundingClientRect(); s.rect = rect
    // own progress from the sticky frame height (= DOM's 100svh / clientHeight); the engine's p uses
    // innerHeight, which differs on iOS when the URL bar collapses → 3D and type would drift apart
    const wr = stage.els.models ? stage.els.models.getBoundingClientRect() : null
    const tp = wr ? cl(-wr.top / Math.max(1, wr.height - rect.height)) : tr.p
    const { width: W } = get().size, H = window.innerHeight
    const h = Math.max(1, rect.height), A = W / h, port = A < .85

    // ---- damped scroll (2nd order) → silk
    if (!s.init) { s.p = s.p1 = tp; s.init = true }
    s.p1 = damp(s.p1, tp, 5.5, dt); s.p = damp(s.p, s.p1, 6.5, dt)
    const P = s.p, c = chapOf(P), L = finOf(P)
    const engage = sm((c + .6) / .5)
    s.px = damp(s.px, port ? 0 : ptr.x, 2.4, dt); s.py = damp(s.py, port ? 0 : ptr.y, 2.4, dt)

    // ---- camera (own), lens shift keeps perspective while placing the stage on screen
    const k = c < 0 ? 0 : Math.min(3, Math.floor(c)), fc = c < 0 ? 0 : c - k
    const inCh = c < 0 ? 0 : 1 - L
    const fov = port ? 38 : 30
    const tanH = Math.tan(THREE.MathUtils.degToRad(fov / 2))
    const gs = port ? .9 : 1
    const needW = (PR + (port ? .1 : .45)) * gs
    const fitD = needW / (tanH * A)
    const baseD = Math.max(port ? 9.5 : 7.6, fitD)
    const introT = 1 - engage
    const camH = lerp(lerp(1.85, 2.5, introT), 1.35, L) * (port ? 1.12 : 1)
    const camD = baseD * lerp(lerp(1, 1.08, introT), 1.06, L)
    s.cam.set(Math.sin(s.t * .11) * (port ? .03 : .12) + s.px * .35, camH - s.py * .18, camD)
    s.look.set(0, lerp(.42, .55, L), 0)
    cam.position.copy(s.cam); cam.lookAt(s.look)
    cam.fov = fov; cam.aspect = A
    cam.updateProjectionMatrix()
    // lens shift (NDC): stage right of the intro title on desktop, lower on phones
    const sxT = port ? 0 : lerp(lerp(0, .24, introT), 0, L)
    const syT = port ? lerp(lerp(-.34, -.22, introT), -.5, L) : lerp(lerp(-.1, -.14, introT), -.3, L)
    s.sx = damp(s.sx, sxT, 4, dt); s.sy = damp(s.sy, syT, 4, dt)
    cam.projectionMatrix.elements[8] -= s.sx; cam.projectionMatrix.elements[9] -= s.sy
    cam.projectionMatrixInverse.copy(cam.projectionMatrix).invert()
    cam.updateMatrixWorld()

    // ---- plinth
    s.spin += dt * .14 * introT
    if (engage > 0) s.spin = damp(s.spin, Math.round(s.spin / TAU) * TAU, 2.4 * engage, dt)
    const scrollRot = c < 0 ? -c * .9 : -HP * (k + (k < 3 ? sm((fc - .8) / .2) : 0))
    const pRot = scrollRot + s.spin
    const sk = TAU * Math.round(s.spin / TAU)
    const py = -L * 1.5
    const pl = plinth.current
    pl.position.set(0, py, 0); pl.scale.setScalar(gs); pl.rotation.y = pRot
    floor.current.position.set(0, py - .64 * gs, 0); floor.current.scale.setScalar(gs)
    ringMat.color.setRGB(1.6, 1.38, 1.1).multiplyScalar(1 - L * .75)
    floorU.uI.value = (1 - L * .9) * (.85 + .15 * Math.sin(s.t * .8))

    // ---- focus framing (camera-relative)
    const Df = port ? 6.2 : 3.85
    const visH = 2 * Df * tanH, visW = visH * A
    const s1 = port ? Math.min(.32 * visH, .5 * visW) / MH : .5 * visH / MH
    const fx = port ? -.16 : .13 + s.px * .015, fy = port ? .3 : -.02
    along(tmp.foc, fx, fy, Df)
    const s0 = .58 * gs
    let focW = 0, focIdx = 0
    for (let i = 0; i < 4; i++) {
      const o = slots[i].current; if (!o) continue
      const u = c - i
      const out = i < 3 ? sm((u - .02) / .24) * (1 - sm((u - .84) / .16)) : sm((u - .02) / .24)
      const e = sm(out)
      const turn = sm((u - .36) / .42)
      if (e > focW) { focW = e; focIdx = i }
      const a = i * HP + pRot
      tmp.slot.set(Math.sin(a) * R * gs, py, Math.cos(a) * R * gs)
      // resting pose (center of the model)
      const plinthYaw = a - sk + TAU * turn
      tmp.w.copy(tmp.slot); tmp.w.y += MH / 2 * s0
      // focus pose
      const bob = Math.sin(s.t * 1.15 + i) * .03
      tmp.v.copy(tmp.foc); tmp.v.y += bob
      tmp.w.lerp(tmp.v, e); tmp.w.y += Math.sin(Math.PI * e) * .45 * (1 - turn * .5)
      let sc = lerp(s0, s1, e)
      let yaw = lerp(plinthYaw, -.55 + Math.PI * turn + s.px * .4, e)
      let rx = Math.sin(Math.PI * e) * .16 + e * (.05 + s.py * .05), rz = e * (-.05 + Math.sin(Math.PI * turn) * .08)
      // finale: curved lineup
      if (L > 0) {
        const j = i - 1.5
        let nx, ny, d
        if (port) { nx = (i % 2 ? .38 : -.38); ny = [.32, .12, -.22, -.42][i]; d = 7.4 }
        else { nx = j * .43; ny = -.1 + j * j * .035; d = 5.6 + j * j * .32 }
        along(tmp.line, nx, ny, d)
        const visHl = 2 * d * tanH
        const sL = port ? Math.min(.16 * visHl, .34 * visHl * A) / MH : .3 * visHl / MH
        tmp.line.y += Math.sin(s.t * .7 + i * 1.3) * .035
        const le = sm(L * 1.15 - i * .05)
        tmp.w.lerp(tmp.line, le); tmp.w.y += Math.sin(Math.PI * le) * .25
        sc = lerp(sc, sL, le)
        const ly = -.38 - j * .12 + Math.sin(s.t * .32 + i * 1.7) * .2 + s.px * .3
        yaw = lerp(yaw, wrapNear(ly, yaw), le)
        rx = lerp(rx, .06, le); rz = lerp(rz, 0, le)
        // name tags under each model
        const tg = stage.models?.tags?.[i]
        if (tg) {
          tmp.v.copy(tmp.w); tmp.v.y -= MH / 2 * sc + .04
          tmp.v.project(cam)
          const X = (tmp.v.x + 1) / 2 * W, Y = (1 - tmp.v.y) / 2 * h
          tg.style.transform = `translate3d(${X.toFixed(1)}px,${Y.toFixed(1)}px,0) translateX(-50%)`
          tg.style.opacity = sm((L - .55) / .35).toFixed(3)
        }
      } else { const tg = stage.models?.tags?.[i]; if (tg) tg.style.opacity = 0 }
      o.position.copy(tmp.w); o.scale.setScalar(sc)
      o.rotation.set(rx, yaw, rz, 'YXZ')
      // baked radial shadow on the stone, fades as the model lifts
      const sh = shadows[i].current
      if (sh) {
        sh.position.set(tmp.slot.x, py + .003, tmp.slot.z)
        sh.scale.setScalar(s0 * 1.9 * (1 + e * .6))
        sh.material.opacity = .85 * (1 - e) * (1 - L)
      }
    }

    // ---- colour chapter
    const dip = c > .5 && c < 3.5 ? 1 - sm(Math.abs(c - Math.round(c)) / .14) : 0
    const floodV = sm((c - .08) / .26) * (1 - L) * (1 - .5 * dip)
    floodU.uFlood.value = floodV
    const colPos = c < 0 ? 0 : Math.min(3, k + (k < 3 ? sm((fc - .78) / .22) : 0))
    const ci = Math.min(2, Math.floor(colPos)), ct = colPos - ci
    ;['uG', 'uM', 'uE'].forEach((kk, j) => { const A0 = PAL[ci][j], B0 = PAL[ci + 1][j]; floodU[kk].value.set(lerp(A0[0], B0[0], ct), lerp(A0[1], B0[1], ct), lerp(A0[2], B0[2], ct)) })
    floodU.uT.value = s.t
    // flood quad sits between the plinth and the focused model
    const fl = flood.current
    fl.visible = floodV > .002
    if (fl.visible) {
      const Dov = Df + s1 * 1.05
      cam.getWorldDirection(tmp.f)
      fl.position.copy(cam.position).addScaledVector(tmp.f, Dov)
      fl.quaternion.copy(cam.quaternion)
      const K = 1.25
      const fh = 2 * Dov * tanH * K
      fl.scale.set(fh * A, fh, 1)
      // lens shift moves the view → offset the quad so it stays centred on screen
      fl.position.addScaledVector(tmp.v.set(1, 0, 0).applyQuaternion(cam.quaternion), -s.sx * Dov * tanH * A)
      fl.position.addScaledVector(tmp.v.set(0, 1, 0).applyQuaternion(cam.quaternion), -s.sy * Dov * tanH)
      floodU.uK.value = K; floodU.uAsp.value = A
      // glow centre = focused model on screen
      const fo = slots[focIdx].current
      if (fo) { tmp.v.copy(fo.position).project(cam); floodU.uC.value.set((tmp.v.x + 1) / 2, (tmp.v.y + 1) / 2) }
    }
    // rim light takes the chapter colour → the model sits *in* the glow
    const gcol = PAL[Math.min(3, Math.round(colPos))][0]
    tmp.c0.setRGB(gcol[0], gcol[1], gcol[2], THREE.SRGBColorSpace)
    rim.current.color.copy(tmp.rimBase).lerp(tmp.c0, floodV)
    rim.current.intensity = 2.6 + floodV * 2.2
    key.current.intensity = 2.3 + floodV * .5

    // ---- backdrop
    tmp.v.set(0, py, 0).project(cam)
    backU.uPl.value.set((tmp.v.x + 1) / 2, (tmp.v.y + 1) / 2)
    backU.uAsp.value = A; backU.uT.value = s.t; backU.uGlow.value = 1 - L * .35
    tmp.c0.setRGB(...PAL[Math.min(3, Math.round(colPos))][1])
    backU.uTint.value.set(tmp.c0.r, tmp.c0.g, tmp.c0.b).multiplyScalar(inCh * engage)
    // feather only the edge that is moving inside the viewport
    backU.uFt.value = rect.top > 1 ? Math.min(.22, rect.top / h * .7) : 0
    backU.uFb.value = rect.bottom < H - 1 ? Math.min(.3, (H - rect.bottom) / h * .9) : 0
    floodU.uFb.value = backU.uFb.value
  })

  // second pass: draw this scene into the sticky frame (after the shared canvas rendered)
  useEffect(() => addAfterEffect(() => {
    const g = root.current, rect = s.rect
    if (!g) return
    const { width: W, height: Hc } = get().size
    const warm = !g.visible && s.warmed < 2 && env
    if (!g.visible && !warm) return
    if (!rect && !warm) return
    const ac = gl.autoClear
    gl.autoClear = false
    gl.setScissorTest(true)
    if (warm) {
      // one invisible 1-px render: uploads textures + PMREM of the HDRI before the user arrives
      g.visible = true; gl.setViewport(0, 0, W, Hc); gl.setScissor(0, 0, 1, 1)
      gl.clearDepth(); gl.render(scene, cam); g.visible = false; s.warmed++
    } else {
      const top = Math.max(0, rect.top), bot = Math.min(Hc, rect.bottom)
      if (bot - top > 0) {
        gl.setViewport(0, Hc - rect.bottom, W, rect.height)
        gl.setScissor(0, Hc - bot, W, bot - top)
        gl.clearDepth(); gl.render(scene, cam)
      }
    }
    gl.setScissorTest(false); gl.setViewport(0, 0, W, Hc); gl.autoClear = ac
  }), [gl, get, scene, cam, env])

  useEffect(() => { const t = setTimeout(() => { try { gl.compile(scene, cam) } catch (e) {} }, 400); return () => clearTimeout(t) }, [gl, scene, cam])

  return createPortal(
    <group ref={root} visible={false}>
      <mesh frustumCulled={false} renderOrder={-10} material={backMat}>
        <planeGeometry args={[1, 1]} />
      </mesh>
      <directionalLight ref={key} position={[3.5, 6, 4.5]} intensity={2.3} color="#fff1dd" />
      <directionalLight ref={rim} position={[-4.5, 3.2, -5]} intensity={2.6} color="#a9c6ff" />
      <directionalLight position={[4, 1.5, -4]} intensity={.8} color="#ffd9b0" />
      <ambientLight intensity={.12} />
      <mesh ref={floor} rotation-x={-HP} renderOrder={-5}>
        <circleGeometry args={[7, 96]} />
        <shaderMaterial uniforms={floorU} vertexShader={floodVert} fragmentShader={floorFrag} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <Plinth refG={plinth} ringMat={ringMat} />
      {shadows.map((r, i) => (
        <mesh key={i} ref={r} rotation-x={-HP}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial map={shadowTex} transparent depthWrite={false} opacity={.85} toneMapped={false} />
        </mesh>
      ))}
      {MAQUETTES.map((M, i) => <Slot key={i} M={M} refG={slots[i]} />)}
      <mesh ref={flood} frustumCulled={false}>
        <planeGeometry args={[1, 1]} />
        <shaderMaterial uniforms={floodU} vertexShader={floodVert} fragmentShader={floodFrag} transparent depthWrite={false} />
      </mesh>
    </group>,
    scene,
    { camera: cam }
  )
}
