import React, { Suspense, useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useLoader, useThree } from '@react-three/fiber'
import { stage } from './engine'

/* ─────────────────────────────────────────────────────────────────────────────
   V3 · Lake Como — rebuilt only from his own photographs (no procedural geometry).
   Panorama #129 (hillside above Varenna) is cut into depth layers: far mountains · near hill
   (Vezio/Varenna) · foreground trees. Side ranges come from panoramas #141 / #142. The lake is
   one plane with a cheap shader: animated ripples, a FAKE reflection (the reflected ray is
   intersected with the far-mountain / hillside planes and their textures are sampled — no second
   render), sun glitter and aerial haze. Light warms from afternoon to golden hour over the scroll.
   The camera starts at the photo viewpoint, slips through the trees, glides low over the water,
   turns back and lands on render #140 — the terraced homes on the hillside — as a depth photo.

   World: authored in "photo units" (1 px of #129 = 0.2 at z = −150), then the whole world is
   scaled by K and moved to OFF so it never overlaps other scenes on the shared canvas and fits the
   shared camera's far plane (200).
   ───────────────────────────────────────────────────────────────────────────── */
const K = 0.1
const OFF = new THREE.Vector3(1000, 0, 0)
const S = 0.2, ZF = -150, EYE = 18, SHORE = 305
const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }
const C = c => new THREE.Color(c)
const far = (px, py) => [(px - 900) * S, (SHORE - py) * S, ZF]
const onPlane = (px, py, k) => { const [x, y] = far(px, py); return [x * k, EYE + (y - EYE) * k, ZF * k] }
const ZN = -30, ZFG = -14, KN = ZN / ZF, KFG = ZFG / ZF
const PI = Math.PI
const asset = (n, s) => `/portfolio/yts/como/${n}${s ? '-s' : ''}.webp`
const depthUrl = id => `/portfolio/yts/depth/${id}.webp`

const FAR = { w: 360, h: 360 * 701 / 1800, pos: [0, (SHORE - 350.5) * S, ZF] }
const HILL = { w: 112, h: 112 * 890 / 1600, pos: [0, 31, 32] }

/* ───────────── time of day: afternoon → late afternoon → golden hour ───────────── */
const TOD = {
  k: [0, .55, 1],
  top: ['#4a7aac', '#5f77a3', '#566596'].map(C),
  hor: ['#d6e1e8', '#f2d4a8', '#f7b77c'].map(C),
  sun: ['#fff3dc', '#ffd8a2', '#ffb066'].map(C),
  tint: ['#ffffff', '#ffeed8', '#ffd9b0'].map(C),
  haze: ['#b8cad7', '#dfc7a6', '#e9b486'].map(C),
  exp: [1, 1.02, .97], el: [.55, .3, .13], glow: [.15, .5, .9], hazeAmt: [.17, .24, .3],
}
function todAt(t, out) {
  const k = TOD.k; let i = 0; while (i < k.length - 2 && t > k[i + 1]) i++
  const u = ss(0, 1, (t - k[i]) / (k[i + 1] - k[i]))
  for (const n of ['top', 'hor', 'sun', 'tint', 'haze']) out[n].copy(TOD[n][i]).lerp(TOD[n][i + 1], u)
  for (const n of ['exp', 'el', 'glow', 'hazeAmt']) out[n] = TOD[n][i] + (TOD[n][i + 1] - TOD[n][i]) * u
  return out
}
const SUN_AZ = .5

/* one uniform bag shared by every material → updated once per frame */
function makeShared() {
  return {
    uOff: { value: OFF.clone() }, uK: { value: K }, uFade: { value: 0 }, uTime: { value: 0 },
    uTint: { value: C('#fff') }, uHaze: { value: C('#b8cad7') }, uExp: { value: 1 }, uHazeAmt: { value: .2 },
    uTop: { value: C('#4a7aac') }, uHor: { value: C('#d6e1e8') }, uSunCol: { value: C('#fff3dc') },
    uSun: { value: new THREE.Vector3(0, .5, -1).normalize() }, uGlow: { value: .2 },
  }
}

/* ───────────── photo layer: depth displacement + grading + aerial haze ───────────── */
const layerVS = /* glsl */`
uniform sampler2D uDepth; uniform float uAmount; uniform vec3 uOff; uniform float uK; uniform float uExt;
varying vec2 vUv; varying float vD; varying vec3 vL; varying float vX;
void main(){
  vX = uv.y * (1.0 + uExt) - uExt;
  // uExt > 0: geometry is taller than the photo; the bottom photo row is extended downwards
  vUv = vec2(uv.x, max(0.003, uv.y * (1.0 + uExt) - uExt));
  float d = texture2D(uDepth, vUv).r;
  vD = d;
  vec3 p = position + normal * d * uAmount;
  vec4 w = modelMatrix * vec4(p, 1.0);
  vL = (w.xyz - uOff) / uK;
  gl_Position = projectionMatrix * viewMatrix * w;
}`
const layerFS = /* glsl */`
uniform sampler2D uMap; uniform float uOpacity, uHazeAmt, uHazeScale, uExp, uEdgeX, uEdgeY, uEdgeTop, uBaseHaze, uFade, uReveal, uExt;
uniform vec3 uTint, uHaze;
varying vec2 vUv; varying float vD; varying vec3 vL; varying float vX;
float h21(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }
float n2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
  return mix(mix(h21(i), h21(i+vec2(1,0)), f.x), mix(h21(i+vec2(0,1)), h21(i+vec2(1,1)), f.x), f.y); }
void main(){
  vec4 c = texture2D(uMap, vUv);
  if (uExt > 0. && vX < .015) { float k = smoothstep(.015, -.03, vX); c.rgb = mix(c.rgb, vec3(.045, .07, .04), k * (1. - c.a * .25)); c.a = mix(c.a, 1., k); }
  float a = c.a * uOpacity * uFade;
  // depth dissolve: near pixels (white) materialise first, with a soft noisy front
  if (uReveal < .999) { float key = (1. - vD) * .78 + n2(vUv * vec2(160., 90.)) * .22; float r = uReveal * 1.3 - .15; a *= smoothstep(r + .02, r - .12, key); }
  a *= smoothstep(0., uEdgeX, vUv.x) * smoothstep(0., uEdgeX, 1. - vUv.x) * smoothstep(0., uEdgeY, vUv.y) * smoothstep(0., uEdgeTop, 1. - vUv.y);
  if (a < .004) discard;
  vec3 col = c.rgb * uTint * uExp;
  float hz = uHazeAmt * uHazeScale * (1. - vD) * (1. - uBaseHaze + uBaseHaze * (1. - smoothstep(0., 26., vL.y)));
  col = mix(col, uHaze, clamp(hz, 0., 1.));
  gl_FragColor = vec4(col, a);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`

function useTex(urls) {
  const tex = useLoader(THREE.TextureLoader, urls)
  tex.forEach((t, i) => { if (i % 2 === 0) { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4 } })
  return tex
}
function Layer({ ext = 0, name, depthId, width, seg, position, rotation, amount = 0, hazeScale = 1, renderOrder = 0, depthTest = true, small, reg, sh, edgeX = .02, edgeY = .001, edgeTop = .0001, baseHaze = .5 }) {
  const [map, dmap] = useTex([asset(name, small), depthUrl(depthId)])
  const aspect = map.image.height / map.image.width
  const geo = useMemo(() => {
    const h = width * aspect, g = new THREE.PlaneGeometry(width, h * (1 + ext), seg, Math.max(2, Math.round(seg * aspect * (1 + ext * .5))))
    g.translate(0, -h * ext / 2, 0)
    return g
  }, [width, aspect, seg])
  const uniforms = useMemo(() => ({
    ...sh, uExt: { value: ext }, uReveal: { value: 1 }, uMap: { value: map }, uDepth: { value: dmap }, uAmount: { value: amount }, uOpacity: { value: 1 }, uHazeScale: { value: hazeScale },
    uEdgeX: { value: edgeX }, uEdgeY: { value: edgeY }, uEdgeTop: { value: edgeTop }, uBaseHaze: { value: baseHaze },
  }), [map, dmap])
  const m = useRef()
  useLayoutEffect(() => { reg.current[name] = { u: uniforms, mesh: m.current, map } }, [])
  return (
    <mesh ref={m} geometry={geo} position={position} rotation={rotation} renderOrder={renderOrder} frustumCulled={false}>
      <shaderMaterial uniforms={uniforms} vertexShader={layerVS} fragmentShader={layerFS} transparent depthWrite={depthTest} depthTest={depthTest} />
    </mesh>
  )
}

/* ───────────── sky: gradient + sun disc + horizon glow ───────────── */
const SKY_FN = /* glsl */`
vec3 skyCol(vec3 d){
  float e = d.y;
  vec3 col = mix(uHor, uTop, pow(smoothstep(-.02, .55, e), .7));
  float cs = dot(d, uSun);
  vec2 az = normalize(d.xz + 1e-5), saz = normalize(uSun.xz + 1e-5);
  float side = pow(max(dot(az, saz), 0.), 4.);
  col += uSunCol * uGlow * (exp(-max(e, 0.) * 7.) * side * .5 + pow(max(cs, 0.), 14.) * .4);
  return col;
}`
const skyVS = `uniform vec3 uOff; uniform float uK; varying vec3 vL; void main(){ vec4 w = modelMatrix*vec4(position,1.); vL = (w.xyz-uOff)/uK; gl_Position = projectionMatrix*viewMatrix*w; }`
const skyFS = /* glsl */`
uniform vec3 uTop, uHor, uSunCol, uSun, uOff; uniform float uGlow, uFade, uK;
varying vec3 vL;
${SKY_FN}
void main(){
  vec3 camL = (cameraPosition - uOff) / uK;
  vec3 d = normalize(vL - camL);
  vec3 col = skyCol(d);
  float cs = dot(d, uSun);
  col += uSunCol * (pow(max(cs, 0.), 220.) * 1.4 + smoothstep(.99955, .9997, cs) * 6.);
  if (d.y < 0.) col = mix(col, uHor * .92, smoothstep(0., -.2, d.y));
  gl_FragColor = vec4(col, uFade);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`
function Sky({ sh, reg }) {
  const m = useRef()
  useLayoutEffect(() => { reg.current.skyMesh = m.current }, [])
  return (
    <mesh ref={m} renderOrder={-10} frustumCulled={false}>
      <sphereGeometry args={[1200, 48, 24]} />
      <shaderMaterial uniforms={sh} vertexShader={skyVS} fragmentShader={skyFS} side={THREE.BackSide} transparent depthWrite={false} />
    </mesh>
  )
}

/* ───────────── the lake: ripples + fake reflection of the photo layers + sun glitter ───────────── */
const waterVS = `uniform vec3 uOff; uniform float uK; varying vec3 vL; void main(){ vec4 w = modelMatrix*vec4(position,1.); vL = (w.xyz-uOff)/uK; gl_Position = projectionMatrix*viewMatrix*w; }`
const waterFS = /* glsl */`
uniform vec3 uTop, uHor, uSunCol, uSun, uOff, uHaze, uTint; uniform float uGlow, uFade, uK, uTime, uHazeAmt, uExp;
uniform sampler2D uFar, uHill; uniform vec4 uFarR, uHillR; uniform float uHillOn;
varying vec3 vL;
${SKY_FN}
float h21(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }
void main(){
  vec3 camL = (cameraPosition - uOff) / uK;
  vec3 v = vL - camL; float dist = length(v); vec3 d = v / dist;
  vec2 q = vL.xz; float t = uTime;
  // sum of drifting waves; amplitude fades with distance to avoid shimmer aliasing
  vec2 n = vec2(0.);
  n += cos(dot(q, vec2(.55, .21)) + t * 1.1) * vec2(.55, .21);
  n += cos(dot(q, vec2(-.31, .83)) + t * 1.4) * vec2(-.31, .83) * .7;
  n += cos(dot(q, vec2(1.35, -.6)) + t * 1.9) * vec2(1.35, -.6) * .35;
  n += cos(dot(q, vec2(-1.9, -1.2)) + t * 2.3) * vec2(-1.9, -1.2) * .22;
  n += cos(dot(q, vec2(3.1, 2.2)) + t * 3.1) * vec2(3.1, 2.2) * .09;
  float att = 1. / (1. + dist * .035);
  vec3 N = normalize(vec3(n.x * .05 * att, 1., n.y * .05 * att));
  vec3 r = reflect(d, N);
  r.y = max(r.y, .002);
  vec3 refl = skyCol(r);
  // far mountains (#129 cut-out) — plane z = uFarR.z-side
  if (r.z < 0.) {
    float tt = (${ZF.toFixed(1)} - vL.z) / r.z; vec3 h = vL + r * tt;
    vec2 uv = vec2((h.x - uFarR.x) / uFarR.z + .5, (h.y - uFarR.y) / uFarR.w + .5);
    if (uv.x > 0. && uv.x < 1. && uv.y > 0. && uv.y < 1.) {
      vec4 c = texture2D(uFar, uv);
      vec3 fc = mix(c.rgb * uTint * uExp, uHaze, uHazeAmt * 1.1);
      refl = mix(refl, fc, c.a * smoothstep(0., .05, uv.x) * smoothstep(0., .05, 1. - uv.x));
    }
  } else if (uHillOn > .01) {
    float tt = (${HILL.pos[2].toFixed(1)} - vL.z) / r.z; vec3 h = vL + r * tt;
    vec2 uv = vec2(.5 - (h.x - uHillR.x) / uHillR.z, (h.y - uHillR.y) / uHillR.w + .5);
    if (uv.x > 0. && uv.x < 1. && uv.y > 0. && uv.y < 1.) {
      vec4 c = texture2D(uHill, uv);
      refl = mix(refl, c.rgb * uTint * uExp, c.a * uHillOn * smoothstep(0., .16, uv.x) * smoothstep(0., .16, 1. - uv.x));
    }
  }
  float F = .18 + .82 * pow(1. - clamp(-d.y, 0., 1.), 5.);
  vec3 deep = mix(vec3(.05, .11, .14), uTop * .32, .5) * uExp;
  vec3 col = mix(deep, refl * .92, F);
  // sun glitter — sharp highlights from the ripple normals, sparkling cells
  float sp = pow(max(dot(r, uSun), 0.), 900.);
  float tw = step(.55, h21(floor(q * 2.2) + floor(t * 6.)));
  col += uSunCol * (sp * (2.5 + 4. * tw) + pow(max(dot(r, uSun), 0.), 60.) * .12 * uGlow);
  col = mix(col, uHaze, clamp(smoothstep(30., 260., dist) * uHazeAmt * 2.4, 0., .85));
  gl_FragColor = vec4(col, uFade);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`
function Water({ sh, reg }) {
  const uniforms = useMemo(() => ({
    ...sh, uFar: { value: null }, uHill: { value: null }, uHillOn: { value: 0 },
    uFarR: { value: new THREE.Vector4(FAR.pos[0], FAR.pos[1], FAR.w, FAR.h) },
    uHillR: { value: new THREE.Vector4(HILL.pos[0], HILL.pos[1], HILL.w, HILL.h) },
  }), [])
  useLayoutEffect(() => { reg.current.water = uniforms }, [])
  return (
    <mesh rotation-x={-PI / 2} position={[0, 0, -60]} renderOrder={2} frustumCulled={false}>
      <planeGeometry args={[900, 260, 1, 1]} />
      <shaderMaterial uniforms={uniforms} vertexShader={waterVS} fragmentShader={waterFS} transparent depthWrite />
    </mesh>
  )
}

/* ───────────── low haze banks over the far shore ───────────── */
const mistVS = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`
const mistFS = /* glsl */`
uniform vec3 uHaze; uniform float uAmt, uTime, uFade; varying vec2 vUv;
float h21(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }
float n2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
  return mix(mix(h21(i), h21(i+vec2(1,0)), f.x), mix(h21(i+vec2(0,1)), h21(i+vec2(1,1)), f.x), f.y); }
float fbm(vec2 p){ float s = 0., a = .5; for (int i = 0; i < 3; i++){ s += a * n2(p); p *= 2.07; a *= .5; } return s * 1.14; }
void main(){
  vec2 p = vUv * vec2(9., 2.2) + vec2(uTime * .012, 0.);
  float f = fbm(p + vec2(n2(p * .6 - uTime * .006) * 1.4, 0.));
  float a = pow(1. - vUv.y, 1.6) * smoothstep(0., .08, vUv.y + .02) * smoothstep(.0, .25, vUv.x) * smoothstep(1., .75, vUv.x);
  a *= smoothstep(.25, .85, f) * uAmt * uFade;
  gl_FragColor = vec4(uHaze * 1.04, a);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`
function Mist({ sh }) {
  const banks = [[[10, 7, -143], 520, 24, .55], [[-30, 4, -105], 380, 12, .28]]
  const us = useMemo(() => banks.map(b => ({ uHaze: sh.uHaze, uTime: sh.uTime, uFade: sh.uFade, uAmt: { value: b[3] } })), [])
  return banks.map(([p, w, h], i) => (
    <mesh key={i} position={p} renderOrder={3}>
      <planeGeometry args={[w, h]} />
      <shaderMaterial uniforms={us[i]} vertexShader={mistVS} fragmentShader={mistFS} transparent depthWrite={false} />
    </mesh>
  ))
}

/* ───────────── camera film: [p, position, yaw, pitch, fov] (yaw 0 looks across the lake, −z) ───────────── */
const ST_D = [
  [0, [0, EYE, 0], 0, -.13, 47],
  [.2, [0, 16.8, -7], -.02, -.12, 46],
  [.42, [-4, 8.5, -34], .05, -.06, 46],
  [.6, [-9, 4.6, -62], .13, -.015, 46],
  [.76, [-7, 7, -60], PI * .6, .01, 46],
  [.9, [-1.5, 20, -30], PI - .03, .02, 44],
  [1, [0, 26, -14], PI, .01, 41],
]
const ST_M = ST_D.map(([p, pos, y, pt, f], i) => [p, pos, y + (i > 0 && i < 4 ? .06 : 0), pt + (i >= 5 ? .05 : 0), Math.min(72, f + (i >= 5 ? 14 : 20))])
function sample(st, p, out) {
  let i = 0; while (i < st.length - 2 && p > st[i + 1][0]) i++
  const a = st[i], b = st[i + 1], u0 = Math.min(1, Math.max(0, (p - a[0]) / (b[0] - a[0])))
  const u = u0 * u0 * (3 - 2 * u0)
  const pa = st[Math.max(0, i - 1)][1], p0 = a[1], p1 = b[1], pb = st[Math.min(st.length - 1, i + 2)][1]
  const v = u0, v2 = v * v, v3 = v2 * v // Catmull-Rom on positions (continuous velocity)
  for (let k = 0; k < 3; k++) out.pos[k] = .5 * ((2 * p0[k]) + (-pa[k] + p1[k]) * v + (2 * pa[k] - 5 * p0[k] + 4 * p1[k] - pb[k]) * v2 + (-pa[k] + 3 * p0[k] - 3 * p1[k] + pb[k]) * v3)
  out.yaw = a[2] + (b[2] - a[2]) * u; out.pitch = a[3] + (b[3] - a[3]) * u; out.fov = a[4] + (b[4] - a[4]) * u
  return out
}

/* DOM labels (owned by Como.jsx) are projected from these anchors: [anchor, windows] */
const LBL = {
  varenna: { p: onPlane(1205, 575, KN), win: [[-.1, .2]] },
  bellagio: { p: [far(560, 296)[0], far(560, 296)[1] + 3, ZF], win: [[.2, .5]] },
  triangle: { p: [far(1050, 300)[0], 6, ZF], win: [[.36, .64]] },
  home: { p: [-6, 36, 30], win: [[.9, 1.2]] },
}

function Rig({ track, reg, sh, mobile }) {
  const { camera, size } = useThree()
  const s = useRef({ p: 0, mx: 0, my: 0, was: false })
  const tmp = useMemo(() => ({
    o: { pos: [0, 0, 0] }, dir: new THREE.Vector3(), right: new THREE.Vector3(), tgt: new THREE.Vector3(), cam: new THREE.Vector3(), v: new THREE.Vector3(),
    tod: { top: new THREE.Color(), hor: new THREE.Color(), sun: new THREE.Color(), tint: new THREE.Color(), haze: new THREE.Color() },
  }), [])
  useFrame((state, dt0) => {
    const tr = track.current, R = reg.current, g = R.group, st = s.current
    if (!g) return
    const active = stage.active === 'como'
    const dt = Math.min(dt0, .05)
    // fade in/out with ownership of the camera; nothing rendered when off
    sh.uFade.value = THREE.MathUtils.damp(sh.uFade.value, active && tr.on ? 1 : 0, 7, dt)
    g.visible = tr.on && sh.uFade.value > .005
    const labels = stage.labels && stage.labels.como
    // warm-up: render once (fully transparent) right after textures arrive → shaders compiled & textures uploaded at load, not mid-scroll
    if (R.ready && !R.warmed) { R.warm = (R.warm || 0) + 1; if (R.warm > 4) R.warmed = true; if (!active) { g.visible = true; return } }
    if (!g.visible || !active) {
      st.was = false
      if (labels && !active) for (const k in labels) if (labels[k]) labels[k].style.opacity = 0
      return
    }
    if (!st.was) { st.p = tr.p; st.was = true; sh.uFade.value = Math.max(sh.uFade.value, .35) }
    st.p = THREE.MathUtils.damp(st.p, tr.p, 4.5, dt)
    st.mx = THREE.MathUtils.damp(st.mx, state.pointer.x, 2.4, dt); st.my = THREE.MathUtils.damp(st.my, state.pointer.y, 2.4, dt)
    sh.uTime.value += dt
    const p = st.p
    const o = sample(mobile ? ST_M : ST_D, p, tmp.o)
    const yaw = o.yaw - st.mx * .03, pitch = o.pitch + st.my * .018
    tmp.dir.set(-Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch))
    tmp.right.set(-tmp.dir.z, 0, tmp.dir.x).normalize()
    tmp.cam.set(o.pos[0], o.pos[1], o.pos[2]).addScaledVector(tmp.right, mobile ? 0 : st.mx * .8)
    tmp.cam.y += mobile ? 0 : st.my * .4
    // local → world
    camera.position.copy(tmp.cam).multiplyScalar(K).add(OFF)
    tmp.tgt.copy(camera.position).add(tmp.dir)
    camera.lookAt(tmp.tgt)
    if (Math.abs(camera.fov - o.fov) > .01 || camera.near !== .05) { camera.fov = o.fov; camera.near = .05; camera.updateProjectionMatrix() }
    if (R.skyMesh) R.skyMesh.position.copy(tmp.cam)

    // light: afternoon → golden hour
    const T = todAt(ss(0, 1, p), tmp.tod)
    sh.uTop.value.copy(T.top); sh.uHor.value.copy(T.hor); sh.uSunCol.value.copy(T.sun); sh.uTint.value.copy(T.tint); sh.uHaze.value.copy(T.haze)
    sh.uExp.value = T.exp; sh.uGlow.value = T.glow; sh.uHazeAmt.value = T.hazeAmt
    sh.uSun.value.set(Math.sin(SUN_AZ) * Math.cos(T.el), Math.sin(T.el), -Math.cos(SUN_AZ) * Math.cos(T.el))

    // near layers: dissolve as the camera slips through them, and when we turn around
    const back = ss(.25, .45, yaw / PI)
    const lay = (k, z, lo, hi) => { const L = R[k]; if (!L) return; const op = ss(lo, hi, tmp.cam.z - z) * (1 - back); L.u.uOpacity.value = op; L.mesh.visible = op > .004 }
    lay('fg129', ZFG, 1.5, 7)
    lay('near129', ZN, 2, 12)
    const hillOn = ss(.4, .85, yaw / PI) * .5 + ss(.78, .94, p) * .5
    if (R.hill140) { R.hill140.mesh.visible = hillOn > .004; R.hill140.u.uReveal.value = hillOn; R.hill140.u.uOpacity.value = ss(0, .15, hillOn) }
    if (R.water) {
      R.water.uHillOn.value = hillOn
      if (!R.water.uFar.value && R.far129) R.water.uFar.value = R.far129.map
      if (!R.water.uHill.value && R.hill140) R.water.uHill.value = R.hill140.map
    }

    // project DOM labels
    if (labels) for (const k in LBL) {
      const el = labels[k]; if (!el) continue
      let op = 0
      for (const [a, b] of LBL[k].win) op = Math.max(op, ss(a, a + .05, p) * (1 - ss(b - .05, b, p)))
      tmp.v.set(...LBL[k].p).multiplyScalar(K).add(OFF).project(camera)
      if (tmp.v.z > 1 || Math.abs(tmp.v.x) > 1.1 || Math.abs(tmp.v.y) > 1.1) op = 0
      const x = (tmp.v.x * .5 + .5) * size.width, y = (-tmp.v.y * .5 + .5) * size.height
      el.style.opacity = op.toFixed(3)
      el.style.transform = `translate3d(${x.toFixed(1)}px,${(y + (1 - op) * 10).toFixed(1)}px,0) translate(-50%,-100%)`
    }
  })
  return null
}

function Ready({ reg }) { useLayoutEffect(() => { reg.current.ready = true }, []); return null }

function World({ track, mobile }) {
  const reg = useRef({})
  const sh = useMemo(makeShared, [])
  const g = useRef()
  useLayoutEffect(() => { reg.current.group = g.current }, [])
  const sm = !!mobile
  return (
    <group ref={g} position={OFF} scale={K} visible={false}>
      <Sky sh={sh} reg={reg} />
      <Suspense fallback={null}>
        <Layer name="far129" depthId={129} width={FAR.w} seg={sm ? 96 : 160} position={FAR.pos} amount={14} reg={reg} sh={sh} renderOrder={0} edgeX={.05} baseHaze={.55} small={false} />
        <Layer name="band142" depthId={142} width={520} seg={sm ? 48 : 72} position={[-185, -3.5, -40]} rotation={[0, PI / 2, 0]} amount={10} hazeScale={1.25} reg={reg} sh={sh} edgeX={.16} baseHaze={.6} small />
        <Layer name="band141" depthId={141} width={520} seg={sm ? 48 : 72} position={[185, -6.4, -10]} rotation={[0, -PI / 2, 0]} amount={10} hazeScale={1.25} reg={reg} sh={sh} edgeX={.16} baseHaze={.6} small />
        <Layer name="hill140" depthId={140} width={HILL.w} seg={sm ? 96 : 180} position={HILL.pos} rotation={[0, PI, 0]} amount={7} hazeScale={.3} reg={reg} sh={sh} renderOrder={1} edgeX={.16} edgeY={.07} baseHaze={.15} small={sm} />
        <Layer name="near129" depthId={129} width={FAR.w * KN} seg={sm ? 96 : 160} position={onPlane(900, 350.5, KN)} amount={3.5} hazeScale={.4} renderOrder={10} depthTest={false} reg={reg} sh={sh} edgeX={.005} ext={.8} baseHaze={0} small={sm} />
        <Ready reg={reg} />
        <Layer name="fg129" depthId={129} width={FAR.w * KFG} seg={sm ? 72 : 128} position={onPlane(900, 350.5, KFG)} amount={2.2} hazeScale={.1} renderOrder={11} depthTest={false} reg={reg} sh={sh} edgeX={.004} ext={1.6} baseHaze={0} small={sm} />
      </Suspense>
      <Water sh={sh} reg={reg} />
      <Mist sh={sh} />
      <Rig track={track} reg={reg} sh={sh} mobile={mobile} />
    </group>
  )
}

export default function SceneComo({ track }) {
  const { size } = useThree()
  const mobile = size.width < 768
  return <World track={track} mobile={mobile} />
}
