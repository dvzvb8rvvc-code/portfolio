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
  top: ['#3d6488', '#4b6189', '#46507c'].map(C),
  hor: ['#b9c3c6', '#e3bd8c', '#e89a5e'].map(C),
  sun: ['#fff0d6', '#ffd39a', '#ffa95c'].map(C),
  tint: ['#fff7ec', '#ffead0', '#ffd4a6'].map(C),
  haze: ['#8e9ea6', '#b39c80', '#c08c64'].map(C),
  exp: [.9, .92, .88], el: [.5, .28, .12], glow: [.2, .55, .95], hazeAmt: [.08, .12, .16],
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
    uRes: { value: new THREE.Vector2(1, 1) }, uEdge: { value: new THREE.Vector2(-1e4, 1e5) }, uBg: { value: C('#0b0a08') },
  }
}


/* ───────────── cinematic finish, shared by every material (hero's grade family) ─────────────
   grade (restrained saturation, cool shadows / warm highlights, lifted warm blacks) → vignette, nav +
   caption gradients → the film's edges melt into the dark page (uEdge = film element top/bottom in
   drawing-buffer px) → fine animated grain. Linear in colour → identical on stacked transparent layers. */
const CINE = /* glsl */`
uniform vec2 uRes, uEdge; uniform vec3 uBg;
float cineHash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
vec3 cine(vec3 c){
  float l = dot(c, vec3(.2126, .7152, .0722));
  c = mix(vec3(l), c, .86);
  c *= mix(vec3(.92, .96, 1.03), vec3(1.07, 1., .87), smoothstep(.04, .62, l));
  c = mix(c, c * c * (3. - 2. * c), .3);
  c = c * .94 + vec3(.010, .0085, .0065);
  vec2 s = gl_FragCoord.xy / uRes;
  c *= 1. - .5 * (1. - smoothstep(0., .42, s.y));
  c *= 1. - .32 * smoothstep(.78, 1., s.y);
  c *= mix(1., 1. - smoothstep(.32, 1.2, length((s - .5) * vec2(1.1, 1.))), .55);
  float fe = uRes.y * .14;
  float m = smoothstep(uEdge.x, uEdge.x + fe, gl_FragCoord.y) * (1. - smoothstep(uEdge.y - fe, uEdge.y, gl_FragCoord.y));
  c = mix(uBg, c, m);
  float g = cineHash(gl_FragCoord.xy + fract(uTime * 7.31) * 113.) - .5;
  return c + g * .022 * (.35 + sqrt(max(c.g, 0.)));
}`
const FIN = `#include <tonemapping_fragment>
  gl_FragColor.rgb = cine(gl_FragColor.rgb);
  #include <colorspace_fragment>`

/* ───────────── photo layer: depth displacement + grading + aerial haze ───────────── */
const layerVS = /* glsl */`
uniform sampler2D uDepth; uniform float uAmount; uniform vec3 uOff; uniform float uK; uniform float uExt, uDilate; uniform vec2 uTap;
varying vec2 vUv; varying float vD; varying vec3 vL; varying float vX;
void main(){
  vX = uv.y * (1.0 + uExt) - uExt;
  // uExt > 0: geometry is taller than the photo; the bottom photo row is extended downwards
  vUv = vec2(uv.x, max(0.003, uv.y * (1.0 + uExt) - uExt));
  // edge-safe depth: 5 taps one vertex apart. Cut-out layers dilate (max) so the silhouette stays rigid with
  // its foreground; full photos average → no stretched "curtains" at depth discontinuities.
  float d0 = texture2D(uDepth, vUv).r;
  float d1 = texture2D(uDepth, vUv + vec2(uTap.x, 0.)).r, d2 = texture2D(uDepth, vUv - vec2(uTap.x, 0.)).r;
  float d3 = texture2D(uDepth, vUv + vec2(0., uTap.y)).r, d4 = texture2D(uDepth, vUv - vec2(0., uTap.y)).r;
  float mx = max(d0, max(max(d1, d2), max(d3, d4)));
  float av = (d0 * 2. + d1 + d2 + d3 + d4) / 6.;
  float d = mix(av, mx, uDilate);
  d *= smoothstep(0., .06, vUv.x) * smoothstep(0., .06, 1. - vUv.x) * mix(1., smoothstep(0., .08, vUv.y) * smoothstep(0., .06, 1. - vUv.y), 1. - uDilate); // flat at photo borders
  vD = d0;
  vec3 p = position + normal * d * uAmount;
  vec4 w = modelMatrix * vec4(p, 1.0);
  vL = (w.xyz - uOff) / uK;
  gl_Position = projectionMatrix * viewMatrix * w;
}`
const layerFS = /* glsl */`
uniform sampler2D uMap; uniform float uOpacity, uHazeAmt, uHazeScale, uExp, uEdgeX, uEdgeY, uEdgeTop, uBaseHaze, uFade, uReveal, uExt, uTime, uAsp;
uniform vec3 uTint, uHaze;
varying vec2 vUv; varying float vD; varying vec3 vL; varying float vX;
${CINE}
float h21(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }
float n2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
  return mix(mix(h21(i), h21(i+vec2(1,0)), f.x), mix(h21(i+vec2(0,1)), h21(i+vec2(1,1)), f.x), f.y); }
float fbm(vec2 p){ float a = .5, s = 0.; for(int i = 0; i < 4; i++){ s += a * n2(p); p = p * 2.03 + 17.1; a *= .5; } return s / .9375; }
void main(){
  vec2 uv = vUv;
  float k = 1., wide = 0.;
  // liquid depth dissolve (same family as the hero): near pixels flow first, fbm front, wet dark edge, gold rim
  if (uReveal < .999) {
    vec2 q = uv * vec2(uAsp, 1.);
    float n = fbm(q * 1.3 + vec2(0., uTime * .02));
    float nn = fbm(q * 4.2 - vec2(uTime * .03, 0.));
    float f = clamp(n * .6 + (1. - vD) * .4, 0., 1.) + (nn - .5) * .1;
    float front = uReveal * 1.4 - .2;
    wide = 1. - abs(2. * smoothstep(f - .2, f + .2, front) - 1.);
    k = smoothstep(f - .05, f + .05, front);
    vec2 flow = vec2(fbm(q * 2.1 + 3.1 + uTime * .04), fbm(q * 2.1 - 7.3 - uTime * .04)) - .5;
    uv += flow * wide * .05;
  }
  vec4 c = texture2D(uMap, uv);
  if (uExt > 0. && vX < .05) { float e = smoothstep(.05, -.04, vX); c.rgb = mix(c.rgb, vec3(.012, .016, .01), e); c.a = mix(c.a, 1., e); }
  float a = c.a * uOpacity * uFade * k;
  a *= smoothstep(0., uEdgeX, vUv.x) * smoothstep(0., uEdgeX, 1. - vUv.x) * smoothstep(0., uEdgeY, vUv.y) * smoothstep(0., uEdgeTop, 1. - vUv.y);
  if (a < .004) discard;
  vec3 col = c.rgb * uTint * uExp;
  float hz = uHazeAmt * uHazeScale * (1. - vD) * (1. - uBaseHaze + uBaseHaze * (1. - smoothstep(0., 26., vL.y)));
  col = mix(col, uHaze, clamp(hz, 0., 1.));
  float edge = 1. - abs(2. * k - 1.);
  col *= 1. - wide * .22 - edge * .3;
  col += vec3(1., .74, .42) * pow(edge, 3.) * .08;
  gl_FragColor = vec4(col, a);
  ${FIN}
}`

function useTex(urls) {
  const tex = useLoader(THREE.TextureLoader, urls)
  const { gl } = useThree()
  const an = Math.min(8, gl.capabilities.getMaxAnisotropy())
  tex.forEach((t, i) => {
    if (i % 2 === 0) { if (t.colorSpace !== THREE.SRGBColorSpace || t.anisotropy !== an) { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = an; t.needsUpdate = true } }
    else if (t.minFilter !== THREE.LinearFilter) { t.generateMipmaps = false; t.minFilter = THREE.LinearFilter; t.needsUpdate = true }
  })
  return tex
}
function Layer({ ext = 0, name, depthId, width, seg, position, rotation, amount = 0, hazeScale = 1, renderOrder = 0, depthTest = true, small, reg, sh, edgeX = .02, edgeY = .001, edgeTop = .0001, baseHaze = .5, dilate = 1 }) {
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
    uDilate: { value: dilate }, uAsp: { value: 1 / aspect }, uTap: { value: new THREE.Vector2(1 / seg, 1 / Math.max(2, Math.round(seg * aspect))) },
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
uniform vec3 uTop, uHor, uSunCol, uSun, uOff; uniform float uGlow, uFade, uK, uTime;
varying vec3 vL;
${SKY_FN}
${CINE}
void main(){
  vec3 camL = (cameraPosition - uOff) / uK;
  vec3 d = normalize(vL - camL);
  vec3 col = skyCol(d);
  float cs = dot(d, uSun);
  col += uSunCol * (pow(max(cs, 0.), 220.) * 1.4 + smoothstep(.99955, .9997, cs) * 6.);
  if (d.y < 0.) col = mix(col, uHor * .92, smoothstep(0., -.2, d.y));
  gl_FragColor = vec4(col, uFade);
  ${FIN}
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
${CINE}
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
  // far mountains (#129 cut-out, plane z = ZF) and, when we look back, the terraces render (#140, plane z = hill):
  // both reflections are evaluated and blended by the ray's z (no hard seam when the camera turns)
  vec3 rF = refl, rH = refl;
  if (r.z < .05) {
    float tt = (${ZF.toFixed(1)} - vL.z) / min(r.z, -.001); vec3 h = vL + r * tt;
    vec2 uv = vec2((h.x - uFarR.x) / uFarR.z + .5, (h.y - uFarR.y) / uFarR.w + .5);
    if (uv.x > 0. && uv.x < 1. && uv.y > 0. && uv.y < 1.) {
      vec4 c = texture2D(uFar, uv);
      vec3 fc = mix(c.rgb * uTint * uExp, uHaze, uHazeAmt * 1.1);
      rF = mix(refl, fc, c.a * smoothstep(0., .05, uv.x) * smoothstep(0., .05, 1. - uv.x));
    }
  }
  if (r.z > -.05 && uHillOn > .01) {
    float tt = (${HILL.pos[2].toFixed(1)} - vL.z) / max(r.z, .001); vec3 h = vL + r * tt;
    vec2 uv = vec2(.5 - (h.x - uHillR.x) / uHillR.z, (h.y - uHillR.y) / uHillR.w + .5);
    if (uv.x > 0. && uv.x < 1. && uv.y > 0. && uv.y < 1.) {
      vec4 c = texture2D(uHill, uv);
      rH = mix(refl, c.rgb * uTint * uExp, c.a * uHillOn * smoothstep(0., .3, uv.x) * smoothstep(0., .3, 1. - uv.x) * smoothstep(0., .2, uv.y));
    }
  }
  refl = mix(rF, rH, smoothstep(-.05, .05, r.z));
  float F = .18 + .82 * pow(1. - clamp(-d.y, 0., 1.), 5.);
  vec3 deep = mix(vec3(.05, .11, .14), uTop * .32, .5) * uExp;
  vec3 col = mix(deep, refl * .92, F);
  // sun glitter — sharp highlights from the ripple normals, sparkling cells
  float sp = pow(max(dot(r, uSun), 0.), 1400.) * smoothstep(40., 140., dist);
  float tw = step(.7, h21(floor(q * 18.) + floor(t * 5.)));
  col += uSunCol * (sp * (1.4 + 2.6 * tw) + pow(max(dot(r, uSun), 0.), 60.) * .1 * uGlow);
  col = mix(col, uHaze, clamp(smoothstep(30., 260., dist) * uHazeAmt * 1.8, 0., .7));
  gl_FragColor = vec4(col, uFade);
  ${FIN}
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
${CINE}
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
  ${FIN}
}`
function Mist({ sh }) {
  const banks = [[[10, 7, -143], 520, 24, .4], [[-30, 4, -105], 380, 12, .2]]
  const us = useMemo(() => banks.map(b => ({ uHaze: sh.uHaze, uTime: sh.uTime, uFade: sh.uFade, uRes: sh.uRes, uEdge: sh.uEdge, uBg: sh.uBg, uAmt: { value: b[3] } })), [])
  return banks.map(([p, w, h], i) => (
    <mesh key={i} position={p} renderOrder={3}>
      <planeGeometry args={[w, h]} />
      <shaderMaterial uniforms={us[i]} vertexShader={mistVS} fragmentShader={mistFS} transparent depthWrite={false} />
    </mesh>
  ))
}

/* ───────────── camera film: [p, position, yaw, pitch, fov] (yaw 0 looks across the lake, −z) ─────────────
   Every channel is a non-uniform cubic Hermite spline (tangents from neighbours, zero at both ends) → the
   camera never stops between keys; scroll progress is damped twice (2nd-order) → silk. */
const ST_D = [
  [0, [0, EYE, 0], 0, -.13, 47],
  [.18, [0, 16.6, -8], -.02, -.12, 46],
  [.38, [-4, 8.8, -33], .05, -.065, 46],
  [.56, [-9, 4.8, -58], .14, -.02, 46],
  [.72, [-7.5, 8, -56], PI * .58, .0, 46],
  [.86, [-2, 19, -32], PI - .04, .02, 44],
  [1, [0, 25, -16], PI, .01, 41],
]
const ST_M = ST_D.map(([p, pos, y, pt, f], i) => [p, pos, y + (i > 0 && i < 4 ? .06 : 0), pt + (i >= 5 ? .05 : 0), Math.min(72, f + (i >= 5 ? 14 : 20))])
const CH = st => {
  const n = st.length, get = (i, c) => (c < 3 ? st[i][1][c] : st[i][c - 1])
  const m = st.map((_, i) => [0, 1, 2, 3, 4, 5].map(c => (i === 0 || i === n - 1) ? 0 : (get(i + 1, c) - get(i - 1, c)) / (st[i + 1][0] - st[i - 1][0])))
  return { st, m, get }
}
const SPL_D = CH(ST_D), SPL_M = CH(ST_M)
function sample(S, p, out) {
  const { st, m, get } = S
  let i = 0; while (i < st.length - 2 && p > st[i + 1][0]) i++
  const h = st[i + 1][0] - st[i][0], u = Math.min(1, Math.max(0, (p - st[i][0]) / h))
  const u2 = u * u, u3 = u2 * u
  const h00 = 2 * u3 - 3 * u2 + 1, h10 = u3 - 2 * u2 + u, h01 = -2 * u3 + 3 * u2, h11 = u3 - u2
  const v = c => h00 * get(i, c) + h10 * h * m[i][c] + h01 * get(i + 1, c) + h11 * h * m[i + 1][c]
  out.pos[0] = v(0); out.pos[1] = v(1); out.pos[2] = v(2); out.yaw = v(3); out.pitch = v(4); out.fov = v(5)
  return out
}

/* DOM labels (owned by Como.jsx) are projected from these anchors: [anchor, windows] */
const LBL = {
  varenna: { p: onPlane(1205, 575, KN), win: [[-.1, .2]] },
  bellagio: { p: [far(560, 296)[0], far(560, 296)[1] + 3, ZF], win: [[.2, .5]] },
  triangle: { p: [far(1050, 300)[0], 6, ZF], win: [[.36, .64]] },
  home: { p: [-6, 32, 30], win: [[.88, 1.2]] },
}

function Rig({ track, reg, sh, mobile }) {
  const { camera, size } = useThree()
  const s = useRef({ p: 0, p1: 0, mx: 0, my: 0, was: false, t: 0 })
  const tmp = useMemo(() => ({
    o: { pos: [0, 0, 0] }, dir: new THREE.Vector3(), right: new THREE.Vector3(), tgt: new THREE.Vector3(), cam: new THREE.Vector3(), v: new THREE.Vector3(),
    tod: { top: new THREE.Color(), hor: new THREE.Color(), sun: new THREE.Color(), tint: new THREE.Color(), haze: new THREE.Color() },
  }), [])
  useFrame((state, dt0) => {
    const tr = track.current, R = reg.current, g = R.group, st = s.current
    if (!g) return
    const active = stage.active === 'como'
    const dt = Math.min(dt0, .05)
    // film element → drawing-buffer px: the scene melts into the page above/below the film
    state.gl.getDrawingBufferSize(sh.uRes.value)
    const el = stage.els.como
    if (el) {
      const r = el.getBoundingClientRect(), k = sh.uRes.value.y / size.height
      sh.uEdge.value.set((size.height - r.bottom) * k, (size.height - r.top) * k)
    }
    // fade in/out with ownership of the camera; nothing rendered when off
    sh.uFade.value = THREE.MathUtils.damp(sh.uFade.value, active && tr.on ? 1 : 0, 7, dt)
    g.visible = tr.on && sh.uFade.value > .005
    const labels = stage.labels && stage.labels.como
    // warm-up: render once (fully transparent) right after textures arrive → shaders compiled & textures uploaded at load, not mid-scroll
    if (R.ready && !R.flag) { R.flag = true; document.documentElement.dataset.comoReady = '1' }
    if (R.ready && !R.warmed) { R.warm = (R.warm || 0) + 1; if (R.warm > 4) R.warmed = true; if (!active) { g.visible = true; return } }
    if (!g.visible || !active) {
      st.was = false
      if (labels && !active) for (const k in labels) if (labels[k]) labels[k].style.opacity = 0
      return
    }
    if (!st.was) { st.p = st.p1 = tr.p; st.was = true; sh.uFade.value = Math.max(sh.uFade.value, .35) }
    st.p1 = THREE.MathUtils.damp(st.p1, tr.p, 6, dt)
    st.p = THREE.MathUtils.damp(st.p, st.p1, 6, dt)
    st.t += dt
    st.mx = THREE.MathUtils.damp(st.mx, state.pointer.x, 2.4, dt); st.my = THREE.MathUtils.damp(st.my, state.pointer.y, 2.4, dt)
    sh.uTime.value += dt
    const p = st.p
    const o = sample(mobile ? SPL_M : SPL_D, p, tmp.o)
    const yaw = o.yaw - st.mx * .03, pitch = o.pitch + st.my * .018
    tmp.dir.set(-Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch))
    tmp.right.set(-tmp.dir.z, 0, tmp.dir.x).normalize()
    tmp.cam.set(o.pos[0], o.pos[1], o.pos[2]).addScaledVector(tmp.right, mobile ? 0 : st.mx * .8)
    tmp.cam.y += mobile ? 0 : st.my * .4
    // the last frame keeps breathing (slow drift) so the end of the film is never a still
    const hold = ss(.9, 1, p)
    tmp.cam.x += Math.sin(st.t * .21) * .9 * hold; tmp.cam.y += Math.sin(st.t * .16 + 1.2) * .45 * hold; tmp.cam.z += (Math.sin(st.t * .12) * .5 + .5) * -1.6 * hold
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
    // (same liquid dissolve as the hero, run backwards: the foreground bleeds away as we pass through it)
    const lay = (k, z, lo, hi) => { const L = R[k]; if (!L) return; const lin = Math.min(1, Math.max(0, (tmp.cam.z - z - lo) / (hi - lo))) * (1 - back); L.u.uReveal.value = lin; L.u.uOpacity.value = 1; L.mesh.visible = lin > .004 }
    lay('fg129', ZFG, .5, 9)
    lay('near129', ZN, 1, 15)
    const hillOn = Math.min(1, Math.max(0, (p - .57) / .3))
    if (R.hill140) { R.hill140.mesh.visible = hillOn > .004; R.hill140.u.uReveal.value = hillOn; R.hill140.u.uOpacity.value = 1 }
    if (R.water) {
      R.water.uHillOn.value = ss(.45, 1, hillOn) // reflection only once the render has actually bled in
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
      const hw = (el._w || (el._w = el.offsetWidth || 120)) / 2 + 14
      const x = Math.min(size.width - hw, Math.max(hw, (tmp.v.x * .5 + .5) * size.width)), y = Math.max(96 + (el._h || (el._h = el.offsetHeight || 60)), (-tmp.v.y * .5 + .5) * size.height)
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
  if (typeof window !== 'undefined') window.__ytsComo = sh
  const g = useRef()
  useLayoutEffect(() => { reg.current.group = g.current }, [])
  const sm = !!mobile
  return (
    <group ref={g} position={OFF} scale={K} visible={false}>
      {/* everything in ONE suspense boundary → the film never shows a half-built world (sky without mountains) */}
      <Suspense fallback={null}>
        <Sky sh={sh} reg={reg} />
        <Layer name="far129" depthId={129} width={FAR.w} seg={sm ? 112 : 192} position={FAR.pos} amount={14} reg={reg} sh={sh} renderOrder={0} edgeX={.05} baseHaze={.55} />
        <Layer name="band142" depthId={142} width={520} seg={sm ? 48 : 80} position={[-185, -3.5, -40]} rotation={[0, PI / 2, 0]} amount={10} hazeScale={1.25} reg={reg} sh={sh} edgeX={.16} baseHaze={.6} small />
        <Layer name="band141" depthId={141} width={520} seg={sm ? 48 : 80} position={[185, -6.4, -10]} rotation={[0, -PI / 2, 0]} amount={10} hazeScale={1.25} reg={reg} sh={sh} edgeX={.16} baseHaze={.6} small />
        <Layer name="hill140" depthId={140} width={HILL.w} seg={sm ? 112 : 224} position={HILL.pos} rotation={[0, PI, 0]} amount={7} hazeScale={.3} reg={reg} sh={sh} renderOrder={1} edgeX={.16} edgeY={.07} baseHaze={.15} dilate={.25} />
        <Layer name="near129" depthId={129} width={FAR.w * KN} seg={sm ? 112 : 192} position={onPlane(900, 350.5, KN)} amount={3.5} hazeScale={.4} renderOrder={10} depthTest={false} reg={reg} sh={sh} edgeX={.005} ext={.8} baseHaze={0} />
        <Layer name="fg129" depthId={129} width={FAR.w * KFG} seg={sm ? 96 : 160} position={onPlane(900, 350.5, KFG)} amount={2.2} hazeScale={.1} renderOrder={11} depthTest={false} reg={reg} sh={sh} edgeX={.004} ext={1.6} baseHaze={0} />
        <Water sh={sh} reg={reg} />
        <Mist sh={sh} />
        <Ready reg={reg} />
      </Suspense>
      <Rig track={track} reg={reg} sh={sh} mobile={mobile} />
    </group>
  )
}

export default function SceneComo({ track }) {
  const { size } = useThree()
  const mobile = size.width < 768
  return <World track={track} mobile={mobile} />
}
