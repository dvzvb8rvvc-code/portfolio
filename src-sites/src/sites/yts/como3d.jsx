import React, { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { Html, Line, MeshReflectorMaterial } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, Noise, ToneMapping } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'

/* ─────────────────────────────────────────────────────────────────────────────
   Lake Como, rebuilt from his own photographs.
   His panorama #129 (shot from the hillside above Varenna) is cut into real depth layers
   (far mountains · near hill & Varenna · foreground trees — sky and water removed, see /yts/como/*),
   the lake between them is a real mirror (MeshReflectorMaterial) and the sky is a time-of-day shader.
   Render #140 (the homes) and #5 (the terraces) are depth-displaced stages on the east shore.
   World units: 1 px of #129 = 0.2 at the far plane (z = -150). Camera eye height 18 = photo horizon.
   ───────────────────────────────────────────────────────────────────────────── */
const S = 0.2, ZF = -150, EYE = 18, SHORE = 305 // shoreline row in #129 → y = 0
const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }
const C = c => new THREE.Color(c)
const far = (px, py) => [(px - 900) * S, (SHORE - py) * S, ZF]
// a point of #129 seen from the photo viewpoint, projected onto a nearer plane (k = zPlane / ZF)
const onPlane = (px, py, k) => { const [x, y] = far(px, py); return [x * k, EYE + (y - EYE) * k, ZF * k] }
const ZN = -30, ZFG = -14, KN = ZN / ZF, KFG = ZFG / ZF
const asset = n => `/portfolio/yts/como/${n}.webp`
const depthUrl = id => `/portfolio/yts/depth/${id}.webp`
const photoUrl = id => `/portfolio/yts/img/${id}.webp`

/* ───────────── time of day: afternoon → golden hour → sunset → blue hour ───────────── */
const TOD = {
  k: [0, .5, .8, 1],
  top: ['#3f72a8', '#5f77a3', '#3f4a78', '#121a35'].map(C),
  hor: ['#d3e0e9', '#f4d3a2', '#f3a06c', '#6d6688'].map(C),
  sun: ['#fff3dc', '#ffd59e', '#ff9b52', '#ff6a3c'].map(C),
  tint: ['#ffffff', '#ffe6c8', '#f2b896', '#5c6c9c'].map(C),
  haze: ['#b4c7d5', '#e3c49c', '#d99a78', '#3a4570'].map(C),
  exp: [1, 1, .86, .4], el: [.6, .28, .12, .02], glow: [.15, .55, 1, .5], lights: [0, 0, .25, 1], stars: [0, 0, 0, 1], hazeAmt: [.16, .24, .34, .32],
}
function todAt(t, out) {
  const k = TOD.k; let i = 0; while (i < k.length - 2 && t > k[i + 1]) i++
  const u = ss(0, 1, (t - k[i]) / (k[i + 1] - k[i]))
  for (const n of ['top', 'hor', 'sun', 'tint', 'haze']) out[n].copy(TOD[n][i]).lerp(TOD[n][i + 1], u)
  for (const n of ['exp', 'el', 'glow', 'lights', 'stars', 'hazeAmt']) out[n] = TOD[n][i] + (TOD[n][i + 1] - TOD[n][i]) * u
  return out
}
const SUN_AZ = .5 // to the right, setting behind the Grigne-side ridge of the photo
const sunDir = (el, v) => v.set(Math.sin(SUN_AZ) * Math.cos(el), Math.sin(el), -Math.cos(SUN_AZ) * Math.cos(el))

/* ───────────── photo layer shader: depth displacement + dissolve + grading + aerial haze ───────────── */
const layerVS = /* glsl */`
uniform sampler2D uDepth; uniform float uAmount;
varying vec2 vUv; varying float vD; varying vec3 vW;
void main(){
  vUv = uv;
  float d = texture2D(uDepth, uv).r;
  vD = d;
  vec3 p = position + normal * d * uAmount;
  vec4 w = modelMatrix * vec4(p, 1.0); vW = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}`
const layerFS = /* glsl */`
uniform sampler2D uMap; uniform float uOpacity, uReveal, uHazeAmt, uExp, uDesat, uEdgeX, uEdgeY, uBaseHaze, uLift;
uniform vec3 uTint, uHaze;
varying vec2 vUv; varying float vD; varying vec3 vW;
float h21(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }
float n2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
  return mix(mix(h21(i), h21(i+vec2(1,0)), f.x), mix(h21(i+vec2(0,1)), h21(i+vec2(1,1)), f.x), f.y); }
void main(){
  vec4 c = texture2D(uMap, vUv);
  float a = c.a * uOpacity;
  a *= smoothstep(0., uEdgeX, vUv.x) * smoothstep(0., uEdgeX, 1. - vUv.x) * smoothstep(0., uEdgeY, vUv.y);
  // dissolve: near pixels (white depth) arrive first, with a noisy edge
  float key = (1. - vD) * .8 + n2(vUv * vec2(220., 90.)) * .2;
  float r = uReveal * 1.25 - .12;
  a *= smoothstep(r, r - .1, key);
  if (a < .003) discard;
  vec3 col = c.rgb;
  float l = dot(col, vec3(.299, .587, .114));
  col = mix(col, vec3(l), uDesat);
  col = col * uTint * uExp + uLift * uHaze;
  // aerial perspective: far pixels and low pixels sink into the haze
  float hz = uHazeAmt * (1. - vD) * (1. - uBaseHaze + uBaseHaze * (1. - smoothstep(0., 26., vW.y)));
  col = mix(col, uHaze, clamp(hz, 0., 1.));
  gl_FragColor = vec4(col, a);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`
function makeLayerUniforms(map, dmap, o = {}) {
  return {
    uMap: { value: map }, uDepth: { value: dmap }, uAmount: { value: o.amount ?? 0 }, uOpacity: { value: o.opacity ?? 1 }, uReveal: { value: o.reveal ?? 1 },
    uHazeAmt: { value: .5 }, uExp: { value: 1 }, uDesat: { value: 0 }, uEdgeX: { value: o.edgeX ?? .02 }, uEdgeY: { value: o.edgeY ?? 0 }, uBaseHaze: { value: o.baseHaze ?? .5 }, uLift: { value: 0 },
    uTint: { value: new THREE.Color(1, 1, 1) }, uHaze: { value: new THREE.Color('#cfdde7') },
  }
}
function useTex(urls) {
  const tex = useLoader(THREE.TextureLoader, urls)
  tex.forEach((t, i) => { if (i % 2 === 0) { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4 } })
  return tex
}
function Layer({ name, depthId, width, seg, position, rotation, amount = 0, hazeScale = 1, layer = 0, renderOrder = 0, depthTest = true, reg, opts }) {
  const [map, dmap] = useTex([asset(name), depthUrl(depthId)])
  const aspect = map.image.height / map.image.width
  const geo = useMemo(() => new THREE.PlaneGeometry(width, width * aspect, seg, Math.max(2, Math.round(seg * aspect))), [width, aspect, seg])
  const uniforms = useMemo(() => makeLayerUniforms(map, dmap, { amount, ...opts }), [map, dmap])
  const m = useRef()
  useLayoutEffect(() => { m.current.layers.set(layer); reg.current[name] = { u: uniforms, mesh: m.current, hazeScale } }, [])
  return (
    <mesh ref={m} geometry={geo} position={position} rotation={rotation} renderOrder={renderOrder} frustumCulled={false}>
      <shaderMaterial uniforms={uniforms} vertexShader={layerVS} fragmentShader={layerFS} transparent depthWrite={depthTest} depthTest={depthTest} />
    </mesh>
  )
}
// render stages (full photos, not cut-outs): #5 the terraces
function Stage({ id, width, seg, position, lookAt, amount, reg, name }) {
  const [map, dmap] = useTex([photoUrl(id), depthUrl(id)])
  const aspect = map.image.height / map.image.width
  const geo = useMemo(() => new THREE.PlaneGeometry(width, width * aspect, seg, Math.round(seg * aspect)), [width, aspect, seg])
  const uniforms = useMemo(() => makeLayerUniforms(map, dmap, { amount, edgeX: .08, edgeY: .08, baseHaze: 0, reveal: 0 }), [map, dmap])
  const m = useRef()
  useLayoutEffect(() => { m.current.lookAt(...lookAt); reg.current[name] = { u: uniforms, mesh: m.current, hazeScale: .25 } }, [])
  useLayoutEffect(() => { uniforms.uEdgeY.value = .08 }, [])
  return (
    <mesh ref={m} geometry={geo} position={position} frustumCulled={false} renderOrder={4}>
      <shaderMaterial uniforms={uniforms} vertexShader={layerVS} fragmentShader={layerFS.replace('smoothstep(0., uEdgeY, vUv.y);', 'smoothstep(0., uEdgeY, vUv.y) * smoothstep(0., uEdgeY, 1. - vUv.y);')} transparent depthWrite={false} />
    </mesh>
  )
}

/* ───────────── sky dome: gradient, sun disc (feeds bloom), horizon glow, stars ───────────── */
const skyVS = `varying vec3 vW; void main(){ vec4 w = modelMatrix*vec4(position,1.); vW = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }`
const skyFS = /* glsl */`
uniform vec3 uTop, uHor, uSunCol, uSun; uniform float uGlow, uStars, uTime, uSunI;
varying vec3 vW;
float h31(vec3 p){ return fract(sin(dot(p, vec3(17.1, 113.7, 291.3))) * 43758.5453); }
void main(){
  vec3 d = normalize(vW - cameraPosition);
  float e = d.y;
  vec3 col = mix(uHor, uTop, pow(smoothstep(-.02, .55, e), .7));
  float cs = dot(d, uSun);
  vec2 az = normalize(d.xz + 1e-5), saz = normalize(uSun.xz + 1e-5);
  float side = pow(max(dot(az, saz), 0.), 4.);
  col += uSunCol * uGlow * (exp(-max(e, 0.) * 7.) * side * .55 + pow(max(cs, 0.), 12.) * .45);
  col += uSunCol * (pow(max(cs, 0.), 180.) * 1.2 + smoothstep(.99955, .9997, cs) * uSunI);
  if (e < 0.) col = mix(col, uHor * .9, smoothstep(0., -.2, e));
  if (uStars > .001 && e > .02) {
    vec3 g = d * 260.; vec3 cell = floor(g); vec3 f = fract(g) - .5;
    float h = h31(cell);
    float st = step(.994, h) * smoothstep(.32, .0, length(f)) * (.6 + .4 * sin(uTime * (1. + h * 5.) + h * 40.));
    col += vec3(1., .95, .88) * st * uStars * smoothstep(.02, .3, e) * 1.6;
  }
  gl_FragColor = vec4(col, 1.);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`
function Sky({ reg }) {
  const m = useRef()
  const uniforms = useMemo(() => ({ uTop: { value: C('#5f8ab4') }, uHor: { value: C('#e3ebef') }, uSunCol: { value: C('#fff3dc') }, uSun: { value: new THREE.Vector3(0, .5, -1).normalize() }, uGlow: { value: .2 }, uStars: { value: 0 }, uTime: { value: 0 }, uSunI: { value: 14 } }), [])
  useLayoutEffect(() => { reg.current.sky = { u: uniforms } }, [])
  useFrame(({ camera }) => m.current && m.current.position.copy(camera.position))
  return (
    <mesh ref={m} renderOrder={-10} frustumCulled={false}>
      <sphereGeometry args={[1400, 48, 24]} />
      <shaderMaterial uniforms={uniforms} vertexShader={skyVS} fragmentShader={skyFS} side={THREE.BackSide} depthWrite={false} />
    </mesh>
  )
}

/* ───────────── giant "COMO" set in the sky, behind the mountains ───────────── */
function ComoWord({ reg, mobile }) {
  const [tex, setTex] = React.useState(null)
  useEffect(() => {
    let dead = false
    const draw = () => {
      const c = document.createElement('canvas'); c.width = 2048; c.height = 620
      const g = c.getContext('2d'); g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'alphabetic'
      g.font = "900 600px 'Inter Tight', 'Inter', 'Helvetica Neue', Arial, sans-serif"
      try { g.letterSpacing = '-30px' } catch (e) {}
      g.fillText('COMO', 1024, 560)
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4
      if (!dead) setTex(t)
    }
    const f = document.fonts?.load ? document.fonts.load("900 200px 'Inter Tight'").then(draw, draw) : draw()
    return () => { dead = true }
  }, [])
  const mat = useRef()
  useLayoutEffect(() => { if (tex) reg.current.word = { mat: mat.current } }, [tex])
  if (!tex) return null
  return (
    <mesh position={mobile ? [6, 62, -330] : [14, 70, -330]} scale={mobile ? .5 : 1} renderOrder={-5}>
      <planeGeometry args={[560, 560 * 620 / 2048]} />
      <meshBasicMaterial ref={mat} map={tex} transparent depthWrite={false} toneMapped={false} fog={false} color="#ffffff" />
    </mesh>
  )
}

/* ───────────── the lake: real reflections + drifting normal-mapped ripples ───────────── */
function useWaterNormals() {
  return useMemo(() => {
    const N = 256, data = new Uint8Array(N * N * 4), TAU = Math.PI * 2
    const W = [[3, 1, .9, .3], [5, -2, .6, 1.7], [1, 4, .7, 2.2], [7, 3, .35, .4], [-4, 6, .3, 2.9], [11, -5, .18, 1.1], [2, 9, .2, 0.6]]
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      let dx = 0, dy = 0
      for (const [kx, ky, a, ph] of W) { const s = Math.cos(TAU * (kx * x + ky * y) / N + ph) * a; dx += s * kx; dy += s * ky }
      const nx = -dx * .024, ny = -dy * .024, l = Math.hypot(nx, ny, 1)
      const i = (y * N + x) * 4
      data[i] = (nx / l * .5 + .5) * 255; data[i + 1] = (ny / l * .5 + .5) * 255; data[i + 2] = (1 / l * .5 + .5) * 255; data[i + 3] = 255
    }
    const t = new THREE.DataTexture(data, N, N); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter; t.needsUpdate = true
    return t
  }, [])
}
function Water({ mobile, reg }) {
  const nrm = useWaterNormals()
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(1400, 1400, 1, 1); const uv = g.attributes.uv
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 140, uv.getY(i) * 140)
    return g
  }, [])
  const m = useRef(), mat = useRef(), meshRef = m
  const tint = useMemo(() => ({ value: new THREE.Color(1, 1, 1) }), [])
  useLayoutEffect(() => {
    const m = mat.current, orig = m.onBeforeCompile.bind(m)
    m.onBeforeCompile = (sh, r) => {
      orig(sh, r)
      sh.uniforms.uReflTint = tint
      sh.fragmentShader = 'uniform vec3 uReflTint;\n' + sh.fragmentShader.replace('vec3 outgoingLight =', `float frs = .2 + .8 * pow(1. - clamp(dot(normalize(vViewPosition), normal), 0., 1.), 5.);
      vec3 outgoingLight = newMerge.rgb * uReflTint * frs +`)
    }
    m.customProgramCacheKey = () => 'como-water'
    m.needsUpdate = true
    reg.current.water = { mat: m, tint: tint.value, mesh: meshRef.current }
  }, [])
  useFrame((_, dt) => { if (m.current) { m.current.position.x = (m.current.position.x + dt * .35) % 100; m.current.position.z = 0 } })
  return (
    <mesh ref={m} geometry={geo} rotation-x={-Math.PI / 2} position={[0, 0, 0]}>
      <MeshReflectorMaterial ref={mat} resolution={mobile ? 320 : 768} blur={mobile ? [0, 0] : [140, 40]} mixBlur={.8} mixStrength={1} mixContrast={1} mirror={0}
        depthScale={0} roughness={.38} metalness={0} color="#22343f" normalMap={nrm} normalScale={[1.1, 1.1]} envMapIntensity={0} />
    </mesh>
  )
}

/* ───────────── low mist banks (volumetric look from stacked noisy sheets) ───────────── */
const mistFS = /* glsl */`
uniform vec3 uCol; uniform float uAmt, uTime; varying vec2 vUv;
float h21(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }
float n2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
  return mix(mix(h21(i), h21(i+vec2(1,0)), f.x), mix(h21(i+vec2(0,1)), h21(i+vec2(1,1)), f.x), f.y); }
float fbm(vec2 p){ float s = 0., a = .5; for (int i = 0; i < 4; i++){ s += a * n2(p); p *= 2.07; a *= .5; } return s; }
void main(){
  vec2 p = vUv * vec2(9., 2.2) + vec2(uTime * .012, 0.);
  float f = fbm(p + fbm(p * .7 - uTime * .006));
  float a = pow(1. - vUv.y, 1.6) * smoothstep(0., .08, vUv.y + .02) * smoothstep(.0, .25, vUv.x) * smoothstep(1., .75, vUv.x);
  a *= smoothstep(.25, .85, f) * uAmt;
  gl_FragColor = vec4(uCol, a);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`
const mistVS = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`
function Mist({ reg }) {
  const banks = [[[10, 8, -143], 520, 26, .6], [[-20, 4.5, -110], 420, 14, .3], [[30, 3, -78], 300, 9, .2]]
  const us = useMemo(() => banks.map(b => ({ uCol: { value: C('#cfdde7') }, uAmt: { value: b[3] }, uBase: b[3], uTime: { value: Math.random() * 50 } })), [])
  useLayoutEffect(() => { reg.current.mist = us }, [])
  return banks.map(([p, w, h], i) => (
    <mesh key={i} position={p} renderOrder={3}>
      <planeGeometry args={[w, h]} />
      <shaderMaterial uniforms={us[i]} vertexShader={mistVS} fragmentShader={mistFS} transparent depthWrite={false} />
    </mesh>
  ))
}

/* ───────────── lights coming on: Bellagio, Cadenabbia, Menaggio across the water; Varenna & Vezio below ───────────── */
const FAR_SHORE = [[0, 300], [100, 300], [250, 305], [300, 315], [440, 320], [600, 300], [640, 262], [800, 250], [900, 266], [950, 295], [1050, 304], [1200, 306], [1300, 318], [1400, 318], [1500, 312], [1550, 308], [1650, 316], [1800, 322]]
const shoreY = px => { for (let i = 0; i < FAR_SHORE.length - 1; i++) { const [a, ya] = FAR_SHORE[i], [b, yb] = FAR_SHORE[i + 1]; if (px >= a && px <= b) return ya + (yb - ya) * (px - a) / (b - a) } return 310 }
function rng(seed) { let s = seed; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646 } }
const lightVS = /* glsl */`
attribute float aSeed; uniform float uTime, uI, uSize; varying float vA;
void main(){
  vec4 mv = modelViewMatrix * vec4(position, 1.);
  float on = smoothstep(aSeed * .7, aSeed * .7 + .3, uI);
  vA = on * (.75 + .25 * sin(uTime * (1.5 + aSeed * 3.) + aSeed * 50.));
  gl_PointSize = uSize * (0.6 + aSeed) * (300. / -mv.z);
  gl_Position = projectionMatrix * mv;
}`
const lightFS = /* glsl */`
uniform vec3 uCol; varying float vA;
void main(){ vec2 c = gl_PointCoord - .5; float d = length(c); float a = smoothstep(.5, .0, d); a = a * a * vA; if (a < .01) discard; gl_FragColor = vec4(uCol * (1.6 + 3. * smoothstep(.18, 0., d)), a); }`
function Lights({ reg, mobile }) {
  const [farGeo, nearGeo] = useMemo(() => {
    const r = rng(11)
    const fp = [], fs = [], np = [], ns = []
    const towns = [[240, 640, 110, 22], [940, 1260, 80, 16], [1440, 1800, 120, 30], [650, 900, 25, 10]]
    for (const [a, b, n, up] of towns) for (let i = 0; i < (mobile ? n * .6 : n); i++) {
      const px = a + r() * (b - a), py = shoreY(px) - 2 - Math.pow(r(), 1.6) * up
      const p = far(px, py); fp.push(p[0], p[1], p[2] + 1); fs.push(r())
    }
    const near = [[1130, 1275, 566, 600, 40], [625, 725, 482, 512, 22], [880, 1020, 560, 605, 8]]
    for (const [a, b, y0, y1, n] of near) for (let i = 0; i < n; i++) {
      const p = onPlane(a + r() * (b - a), y0 + r() * (y1 - y0), KN); np.push(p[0], p[1], p[2] + .3); ns.push(r())
    }
    const mk = (p, s) => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); g.setAttribute('aSeed', new THREE.Float32BufferAttribute(s, 1)); return g }
    return [mk(fp, fs), mk(np, ns)]
  }, [mobile])
  const uf = useMemo(() => ({ uTime: { value: 0 }, uI: { value: 0 }, uSize: { value: 1.5 }, uCol: { value: C('#ffb460') } }), [])
  const un = useMemo(() => ({ uTime: { value: 0 }, uI: { value: 0 }, uSize: { value: .55 }, uCol: { value: C('#ffb768') }, uOp: { value: 1 } }), [])
  const nearRef = useRef()
  useLayoutEffect(() => { reg.current.lights = [uf, un]; nearRef.current.layers.set(1) }, [])
  return (
    <>
      <points geometry={farGeo} renderOrder={2} frustumCulled={false}><shaderMaterial uniforms={uf} vertexShader={lightVS} fragmentShader={lightFS} transparent depthWrite={false} blending={THREE.AdditiveBlending} /></points>
      <points ref={nearRef} geometry={nearGeo} renderOrder={12} frustumCulled={false}><shaderMaterial uniforms={un} vertexShader={lightVS} fragmentShader={lightFS} transparent depthWrite={false} depthTest={false} blending={THREE.AdditiveBlending} /></points>
    </>
  )
}

/* ───────────── labels anchored in the scene ───────────── */
const HILL = { pos: [0, 22, 32], w: 112 } // render #140 stage, faces the lake (−z)
const TERR = { pos: [0, 34.2, 25.9], look: [0, 44, 4], w: 38 } // render #5 stage
const LBL = {
  bellagio: { p: [...far(560, 296)].map((v, i) => (i === 1 ? v + 2 : v)), win: [[.2, .45], [.9, 1.01]] },
  cadenabbia: { p: far(1130, 292), win: [[.22, .45], [.91, 1.01]] },
  menaggio: { p: far(1660, 300), win: [[.24, .45], [.91, 1.01]] },
  vezio: { p: onPlane(776, 418, KN), win: [[.92, 1.01]] },
  varenna: { p: onPlane(1205, 582, KN), win: [[.91, 1.01]] },
  home: { p: [-8, 25, 30], win: [[.54, .69]] },
}
function Label({ id, text, sub, progress, gold, layer }) {
  const el = useRef()
  const { p: pos, win } = LBL[id]
  useFrame(() => {
    if (!el.current) return
    const p = progress.get()
    let o = 0
    for (const [a, b] of win) o = Math.max(o, ss(a, a + .035, p) * (1 - ss(b - .035, b, p)))
    el.current.style.opacity = o
    el.current.style.transform = `translate(-50%,-100%) translateY(${(1 - o) * 12}px)`
  })
  return (
    <Html position={pos} zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
      <div ref={el} style={{ opacity: 0, position: 'absolute', left: 0, top: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', whiteSpace: 'nowrap', fontFamily: "'Inter Tight',sans-serif" }}>
        <div style={{ color: gold ? '#f3dca6' : '#fff', fontFamily: "'Instrument Serif',serif", fontSize: gold ? 26 : 22, lineHeight: 1, fontStyle: 'italic', textShadow: '0 1px 16px rgba(0,0,0,.45)' }}>{text}</div>
        {sub && <div style={{ marginTop: 5, color: 'rgba(255,255,255,.82)', fontSize: 10, fontWeight: 600, letterSpacing: '.2em', textTransform: 'uppercase', textShadow: '0 1px 10px rgba(0,0,0,.5)' }}>{sub}</div>}
        <div style={{ width: 1, height: gold ? 46 : 34, marginTop: 8, background: `linear-gradient(${gold ? '#f3dca6' : '#fff'}, rgba(255,255,255,0))` }} />
        <div style={{ width: 7, height: 7, borderRadius: 9, border: `1px solid ${gold ? '#f3dca6' : '#fff'}`, marginTop: -1, boxShadow: '0 0 12px rgba(255,220,170,.9)' }} />
      </div>
    </Html>
  )
}
function Triangle({ progress, label }) {
  const line = useRef(), lab = useRef()
  const pts = useMemo(() => {
    const k = [LBL.varenna.p, LBL.bellagio.p, LBL.menaggio.p, LBL.varenna.p].map(p => new THREE.Vector3(...p)), out = []
    for (let s = 0; s < 3; s++) for (let i = 0; i < 40; i++) out.push(k[s].clone().lerp(k[s + 1], i / 40))
    out.push(k[3]); return out
  }, [])
  useFrame(() => {
    const p = progress.get(), d = ss(.915, .955, p), fade = 1 - ss(.975, .998, p)
    if (line.current) { line.current.geometry.instanceCount = Math.max(1, Math.round(d * (pts.length - 1))); line.current.material.opacity = fade * .9; line.current.visible = d > 0 && fade > 0 }
    if (lab.current) lab.current.style.opacity = ss(.935, .955, p) * fade
  })
  useLayoutEffect(() => { line.current?.layers.set(1) }, [])
  return (
    <>
      <Line ref={line} points={pts} color="#f3d28a" lineWidth={1.6} transparent dashed dashSize={1.2} gapSize={.8} depthTest={false} renderOrder={20} />
      <Html position={[30, 6, -100]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
        <div ref={lab} style={{ opacity: 0, whiteSpace: 'nowrap', color: '#fff2d6', fontFamily: "'Instrument Serif',serif", fontStyle: 'italic', fontSize: 30, textShadow: '0 2px 18px rgba(0,0,0,.45)' }}>{label}</div>
      </Html>
    </>
  )
}

/* ───────────── camera film: stations (p, position, yaw, pitch, fov) ───────────── */
// yaw 0 looks west across the lake (−z); +π/2 looks −x; π looks back at the hillside (+z)
const PI = Math.PI
const STATIONS_D = [
  [0, [6, 24, -44], -.1, -.11, 54],
  [.17, [0, 17, -52], 0, -.07, 50],
  [.31, [-12, 4.2, -62], .14, -.015, 46],
  [.42, [-17, 3.6, -68], .32, 0, 46],
  [.5, [-8, 8, -58], PI - .04, .02, 46],
  [.62, [0, 18, -14], PI, .04, 44],
  [.7, [0, 34.9, -.1], PI, -.42, 46],
  [.79, [0, 44, 4], PI, -.42, 46],
  [.855, [0, 33, 3], PI * 1.5, -.2, 50],
  [.91, [0, EYE, 0], 2 * PI, -.178, 50],
  [1, [0, EYE, 0], 2 * PI, -.165, 47],
]
const STATIONS_M = STATIONS_D.map(([p, pos, y, pt, f], i) => [p, i === 2 || i === 3 ? [pos[0], pos[1] + 1.5, pos[2]] : pos, y + (i <= 3 ? .08 : 0), pt, Math.min(74, f + 18)])
function sampleStations(st, p, out) {
  let i = 0; while (i < st.length - 2 && p > st[i + 1][0]) i++
  const a = st[i], b = st[i + 1], u0 = Math.min(1, Math.max(0, (p - a[0]) / (b[0] - a[0])))
  const u = u0 * u0 * (3 - 2 * u0)
  // Catmull-Rom on positions for smooth flight
  const pa = st[Math.max(0, i - 1)][1], p0 = a[1], p1 = b[1], pb = st[Math.min(st.length - 1, i + 2)][1]
  const v = u, v2 = v * v, v3 = v2 * v
  for (let k = 0; k < 3; k++) out.pos[k] = .5 * ((2 * p0[k]) + (-pa[k] + p1[k]) * v + (2 * pa[k] - 5 * p0[k] + 4 * p1[k] - pb[k]) * v2 + (-pa[k] + 3 * p0[k] - 3 * p1[k] + pb[k]) * v3)
  out.yaw = a[2] + (b[2] - a[2]) * u; out.pitch = a[3] + (b[3] - a[3]) * u; out.fov = a[4] + (b[4] - a[4]) * u
  return out
}

function Rig({ progress, mobile, reg, clockRef }) {
  const { camera, scene } = useThree()
  const st = mobile ? STATIONS_M : STATIONS_D
  const S0 = useRef({ p: progress.get(), mx: 0, my: 0, t: 0 })
  const tmp = useMemo(() => ({ o: { pos: [0, 0, 0] }, dir: new THREE.Vector3(), tgt: new THREE.Vector3(), sun: new THREE.Vector3(), tod: { top: new THREE.Color(), hor: new THREE.Color(), sun: new THREE.Color(), tint: new THREE.Color(), haze: new THREE.Color() } }), [])
  useLayoutEffect(() => { camera.layers.enable(1); scene.fog = new THREE.Fog('#cfdde7', 120, 520) }, [camera, scene])
  useFrame((state, dt) => {
    const R = reg.current, s = S0.current
    dt = Math.min(dt, .05); s.t += dt
    s.p = window.__comoSnap ? progress.get() : THREE.MathUtils.damp(s.p, progress.get(), 3.4, dt)
    s.mx = THREE.MathUtils.damp(s.mx, state.pointer.x, 2.2, dt); s.my = THREE.MathUtils.damp(s.my, state.pointer.y, 2.2, dt)
    const p = s.p
    const o = sampleStations(st, p, tmp.o)
    // pointer parallax: strongest when the camera rests among the depth layers
    const par = mobile ? 0 : (.6 + 1.4 * ss(.86, .95, p))
    const yaw = o.yaw - s.mx * .035, pitch = o.pitch + s.my * .02
    camera.position.set(o.pos[0], o.pos[1], o.pos[2])
    tmp.dir.set(-Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch))
    const right = new THREE.Vector3(-tmp.dir.z, 0, tmp.dir.x).normalize()
    camera.position.addScaledVector(right, s.mx * par); camera.position.y += s.my * par * .5
    tmp.tgt.copy(camera.position).add(tmp.dir)
    camera.lookAt(tmp.tgt)
    if (Math.abs(camera.fov - o.fov) > .01) { camera.fov = o.fov; camera.updateProjectionMatrix() }

    // time of day follows the film
    const tod = ss(0, .3, p) * .15 + ss(.3, .75, p) * .4 + ss(.75, .9, p) * .27 + ss(.9, 1, p) * .18
    const T = todAt(tod, tmp.tod)
    sunDir(T.el, tmp.sun)
    if (clockRef?.current) clockRef.current.style.setProperty('--tod', tod.toFixed(3))
    if (R.sky) { const u = R.sky.u; u.uTop.value.copy(T.top); u.uHor.value.copy(T.hor); u.uSunCol.value.copy(T.sun); u.uSun.value.copy(tmp.sun); u.uGlow.value = T.glow; u.uStars.value = T.stars; u.uTime.value = s.t; u.uSunI.value = 10 + 18 * (1 - T.stars) }
    scene.fog.color.copy(T.haze).multiplyScalar(.9 + .1 * T.exp)
    if (R.dir) { R.dir.position.copy(tmp.sun).multiplyScalar(200); R.dir.color.copy(T.sun); R.dir.intensity = 2.6 * T.exp }
    if (R.hemi) { R.hemi.color.copy(T.top); R.hemi.groundColor.copy(T.haze).multiplyScalar(.5); R.hemi.intensity = .6 + .5 * T.exp }
    if (R.water) { R.water.mat.color.copy(T.top).multiplyScalar(.28 * T.exp); R.water.tint.copy(T.haze).lerp(new THREE.Color(1, 1, 1), .4).multiplyScalar(.66) }
    if (R.word) R.word.mat.opacity = 1 - ss(.14, .26, p)
    if (R.mist) for (const u of R.mist) { u.uCol.value.copy(T.haze); u.uTime.value += dt; u.uAmt.value = u.uBase * (1 - .35 * T.stars) }
    if (R.lights) { R.lights[0].uI.value = T.lights; R.lights[1].uI.value = T.lights * ss(.91, .96, p); R.lights.forEach(u => (u.uTime.value = s.t)) }
    // grade every photo layer
    const vis = {
      far129: 1, band142: 1, band141: 1,
      near129: ss(.895, .95, p), fg129: ss(.905, .96, p),
      hill140: 1 - ss(.655, .72, p), terr5: ss(.64, .71, p) * (1 - ss(.8, .86, p)),
    }
    for (const k in vis) {
      const L = R[k]; if (!L) continue
      const u = L.u
      u.uTint.value.copy(T.tint); u.uHaze.value.copy(T.haze); u.uExp.value = T.exp * (k === 'fg129' ? 1 : k === 'near129' ? 1.08 : 1)
      u.uHazeAmt.value = T.hazeAmt * L.hazeScale; u.uDesat.value = .35 * T.stars
      u.uLift.value = k === 'far129' || k.startsWith('band') ? .05 * T.stars : 0
      const v = vis[k]
      if (k === 'near129' || k === 'fg129' || k === 'hill140' || k === 'terr5') { u.uReveal.value = v; L.mesh.visible = v > .001 }
    }
  })
  return null
}

function Scene({ progress, mobile, labels, clockRef }) {
  const reg = useRef({})
  const dir = useRef(), hemi = useRef()
  useLayoutEffect(() => { reg.current.dir = dir.current; reg.current.hemi = hemi.current }, [])
  const segF = mobile ? 160 : 260
  return (
    <>
      <hemisphereLight ref={hemi} args={['#9fb7c6', '#4d4632', .9]} />
      <directionalLight ref={dir} position={[100, 120, -170]} intensity={2.4} />
      <Sky reg={reg} />
      <ComoWord reg={reg} mobile={mobile} />
      <Suspense fallback={null}>
        {/* far mountains of #129 — plane at z = −150, shoreline row on the water line */}
        <Layer name="far129" depthId={129} width={360} seg={segF} position={[0, (SHORE - 350.5) * S, ZF]} amount={14} hazeScale={1} reg={reg} renderOrder={0} opts={{ edgeX: .012, baseHaze: .55 }} />
        {/* side ranges so the turn over the water never runs out of mountains */}
        <Layer name="band142" depthId={142} width={520} seg={mobile ? 100 : 160} position={[-185, -3.5, -40]} rotation={[0, PI / 2, 0]} amount={10} hazeScale={1.25} reg={reg} opts={{ edgeX: .06, baseHaze: .6 }} />
        <Layer name="band141" depthId={141} width={520} seg={mobile ? 100 : 160} position={[185, -6.4, -10]} rotation={[0, -PI / 2, 0]} amount={10} hazeScale={1.25} reg={reg} opts={{ edgeX: .06, baseHaze: .6 }} />
        {/* the hillside with the homes (#140, sky removed) across the water, east shore */}
        <Layer name="hill140" depthId={140} width={HILL.w} seg={mobile ? 150 : 240} position={[HILL.pos[0], HILL.pos[1], HILL.pos[2]]} rotation={[0, PI, 0]} amount={-9} hazeScale={.35} reg={reg} renderOrder={1} opts={{ edgeX: .07, baseHaze: .2, reveal: 1 }} />
        <Stage name="terr5" id={5} width={TERR.w} seg={mobile ? 150 : 230} position={TERR.pos} lookAt={TERR.look} amount={7} reg={reg} />
        {/* near hill (Vezio, Varenna) and foreground trees — only for the main camera (layer 1), never mirrored */}
        <Layer name="near129" depthId={129} width={360 * KN} seg={mobile ? 140 : 220} position={onPlane(900, 350.5, KN)} amount={3.5} hazeScale={.4} layer={1} renderOrder={10} depthTest={false} reg={reg} opts={{ edgeX: .005, baseHaze: 0, reveal: 0 }} />
        <Layer name="fg129" depthId={129} width={360 * KFG} seg={mobile ? 120 : 200} position={onPlane(900, 350.5, KFG)} amount={2.2} hazeScale={.12} layer={1} renderOrder={11} depthTest={false} reg={reg} opts={{ edgeX: .004, baseHaze: 0, reveal: 0 }} />
      </Suspense>
      <Water mobile={mobile} reg={reg} />
      <Mist reg={reg} />
      <Lights reg={reg} mobile={mobile} />
      <Triangle progress={progress} label={labels.triangle} />
      {Object.keys(LBL).filter(id => !mobile || id !== 'cadenabbia').map(id => <Label key={id} id={id} text={labels[id][0]} sub={labels[id][1]} progress={progress} gold={id === 'home'} />)}
      <Rig progress={progress} mobile={mobile} reg={reg} clockRef={clockRef} />
    </>
  )
}

export default function ComoScene({ progress, active, mobile, labels, clockRef }) {
  return (
    <Canvas
      frameloop={active ? 'always' : 'never'}
      dpr={[1, mobile ? 1.25 : 1.5]}
      gl={{ antialias: !mobile ? false : true, powerPreference: 'high-performance', stencil: false }}
      camera={{ fov: 54, near: .5, far: 3000, position: [6, 30, -42] }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <Scene progress={progress} mobile={mobile} labels={labels} clockRef={clockRef} />
      {!mobile && (
        <EffectComposer multisampling={4} disableNormalPass>
          <Bloom mipmapBlur intensity={.85} luminanceThreshold={.92} luminanceSmoothing={.2} radius={.75} />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
          <Vignette offset={.22} darkness={.62} />
          <Noise opacity={.035} premultiply />
        </EffectComposer>
      )}
    </Canvas>
  )
}
