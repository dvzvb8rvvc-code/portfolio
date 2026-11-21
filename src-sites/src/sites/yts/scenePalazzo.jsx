import * as THREE from 'three'
import React, { Suspense, useMemo, useRef } from 'react'
import { useFrame, useLoader, useThree } from '@react-three/fiber'
import { stage } from './engine'

/* ===================== PALAZZO — the frescoed walk =====================
   His interior photos (148 → 156 → 157 → 152) become real geometry via their depth maps,
   placed one behind another. The camera dollies through each room; the room's near geometry
   dissolves with a warm ragged rim (portal) as you pass into the next. Warm dust drifts in
   light shafts. At the end the camera tilts up into the ceiling fresco 154, bent on a gentle vault.
   Everything is driven by one damped progress value → silk. No postprocessing.
   Timeline is mirrored in Palazzo.jsx (captions) — keep both in sync. */

const ORIGIN = [400, 0, 0] // far from other scenes (camera far = 200)
const ROOMS = [148, 156, 157, 152]
const VAULT = 154
const ASPECT = { 148: 1800 / 1759, 156: 1800 / 1310, 157: 1800 / 1708, 152: 1800 / 1530, 154: 1800 / 1776 } // h / w
const TL = { open: [0, 0.12], rooms: [0.06, 0.8], look: [0.8, 0.95] }
const SPAN = ROOMS.length - 1 + 0.55
const L = 2.6, D0 = 3.4
const CFG = {
  148: { pitch: 0.07, depth: 1.25, beam: [0.35, -0.28] },
  156: { pitch: 0.05, depth: 1.15, beam: [-0.9, 0.42] },
  157: { pitch: 0.05, depth: 1.2, beam: [0.95, -0.4] },
  152: { pitch: 0.09, depth: 1.1, beam: [-0.75, 0.36] },
}
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const smooth = (a, b, v) => { const x = clamp((v - a) / (b - a)); return x * x * (3 - 2 * x) }
// eased room-time: lingers inside each room, moves quicker through the doorway
function roomTime(p) {
  const f = clamp((p - TL.rooms[0]) / (TL.rooms[1] - TL.rooms[0])) * SPAN
  const k = Math.min(Math.floor(f), ROOMS.length - 1), fr = f - k
  return k + fr - (0.6 * Math.sin(2 * Math.PI * (fr - 0.25))) / (2 * Math.PI)
}
const T_END = roomTime(1)
const Z_END = D0 - T_END * L

const url = (id, small) => `/portfolio/yts/img/${id}${small ? '-s' : ''}.webp`
const durl = id => `/portfolio/yts/depth/${id}.webp`

const vert = /* glsl */`
uniform sampler2D uDepth; uniform float uAmount; uniform float uCamZ; uniform float uCurve; uniform float uHalf;
varying vec2 vUv; varying float vD; varying float vNear;
void main(){
  vUv = uv;
  float d = texture2D(uDepth, uv).r;
  vD = d;
  vec2 r = position.xy / uHalf;
  vec3 p = position + normal * (d * uAmount + uCurve * dot(r, r));
  vec4 wp = modelMatrix * vec4(p, 1.0);
  vNear = uCamZ - wp.z;
  gl_Position = projectionMatrix * viewMatrix * wp;
}`
const frag = /* glsl */`
uniform sampler2D uMap; uniform float uEdge; uniform float uOpacity; uniform float uDissolve; uniform float uPass; uniform float uExposure; uniform vec3 uTint;
varying vec2 vUv; varying float vD; varying float vNear;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y); }
void main(){
  vec3 c = texture2D(uMap, vUv).rgb;
  vec2 e = smoothstep(vec2(0.0), vec2(uEdge), vUv) * smoothstep(vec2(0.0), vec2(uEdge), 1.0 - vUv);
  float a = e.x * e.y * uOpacity;
  a *= mix(1.0, smoothstep(0.08, 0.5, vNear), uPass);           // never clip through the lens
  float n = noise(vUv * 9.0) * 0.5 + noise(vUv * 31.0) * 0.25;  // portal: near surfaces dissolve first
  float far = 1.0 - vD + n * 0.35;
  float cut = smoothstep(uDissolve - 0.08, uDissolve, far);
  float rim = (1.0 - smoothstep(uDissolve, uDissolve + 0.06, far)) * cut * step(0.001, uDissolve);
  a *= cut;
  if (a < 0.01) discard;
  vec3 col = c * uExposure * uTint + vec3(1.0, 0.6, 0.26) * rim * 2.2;
  gl_FragColor = vec4(col, a);
  #include <colorspace_fragment>
}`

function DepthMesh({ id, small, segs, width, depth, uref, pass = 1, curve = 0, ...props }) {
  const [map, dmap] = useLoader(THREE.TextureLoader, [url(id, small), durl(id)])
  map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = 4; map.generateMipmaps = true
  const aspect = ASPECT[id]
  const geo = useMemo(() => new THREE.PlaneGeometry(width, width * aspect, segs, Math.round(segs * Math.min(aspect, 1.3))), [width, aspect, segs])
  const uniforms = useMemo(() => ({
    uMap: { value: map }, uDepth: { value: dmap }, uAmount: { value: depth }, uCamZ: { value: 0 }, uEdge: { value: 0.06 }, uOpacity: { value: 1 },
    uDissolve: { value: 0 }, uPass: { value: pass }, uExposure: { value: 1 }, uCurve: { value: curve }, uHalf: { value: width / 2 }, uTint: { value: new THREE.Color(1, 1, 1) },
  }), [map, dmap, width])
  uref.current = uniforms
  return (
    <mesh geometry={geo} frustumCulled={false} {...props}>
      <shaderMaterial uniforms={uniforms} vertexShader={vert} fragmentShader={frag} transparent depthWrite />
    </mesh>
  )
}

function beamTexture() {
  const c = document.createElement('canvas'); c.width = 64; c.height = 256
  const g = c.getContext('2d'), im = g.createImageData(64, 256)
  for (let y = 0; y < 256; y++) for (let x = 0; x < 64; x++) {
    const u = (x / 63) * 2 - 1, v = y / 255
    const a = Math.exp(-u * u * 5) * Math.pow(Math.sin(v * Math.PI), 1.4) * (0.55 + 0.45 * (1 - v))
    const i = (y * 64 + x) * 4; im.data[i] = 255; im.data[i + 1] = 214; im.data[i + 2] = 160; im.data[i + 3] = a * 255
  }
  g.putImageData(im, 0, 0)
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t
}

// shared per-frame state (no React state)
const S = { t: 0, look: 0, camZ: D0, active: false }

function Room({ id, k, mob, beamTex, cover }) {
  const u = useRef(), grp = useRef(), beam = useRef()
  const cfg = CFG[id], last = k === ROOMS.length - 1
  const width = cover(ASPECT[id])
  useFrame((st) => {
    const U = u.current; if (!U || !grp.current) return
    const t = S.t
    const vis = t > k - 1.15 && t < k + 1.05
    grp.current.visible = vis
    if (!vis) return
    U.uCamZ.value = S.camZ
    U.uDissolve.value = last ? 0 : smooth(k + 0.42, k + 1.0, t) * 1.45
    U.uOpacity.value = last ? 1 - smooth(0.2, 0.62, S.look) : 1 - smooth(k + 0.85, k + 1.02, t)
    // the room waiting behind is darker — like the next room seen through a doorway
    U.uExposure.value = 0.5 + 0.5 * smooth(k - 0.95, k - 0.1, t) + 0.035 * Math.sin(st.clock.elapsedTime * 0.6 + k)
    if (beam.current) beam.current.material.opacity = 0.3 * smooth(k - 0.75, k - 0.05, t) * (1 - smooth(k + 0.3, k + 0.8, t)) * (last ? 1 - S.look : 1)
  })
  return (
    <group ref={grp} position={[0, 0, -k * L]} visible={false}>
      <DepthMesh id={id} small={mob} segs={mob ? 96 : 200} width={width} depth={cfg.depth} uref={u} />
      <mesh ref={beam} position={[cfg.beam[0], 0.45, 1.2]} rotation={[0, 0, cfg.beam[1]]}>
        <planeGeometry args={[1.05, 4.4]} />
        <meshBasicMaterial map={beamTex} transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} color="#ffc98a" toneMapped={false} />
      </mesh>
    </group>
  )
}

function Vault({ mob }) {
  const u = useRef(), grp = useRef()
  useFrame((st, dt) => {
    const U = u.current; if (!U || !grp.current) return
    grp.current.visible = S.look > 0.02
    if (!grp.current.visible) return
    U.uOpacity.value = smooth(0.12, 0.58, S.look)
    U.uExposure.value = 0.7 + 0.38 * smooth(0.35, 1, S.look)
    grp.current.rotation.y += Math.min(dt, 0.05) * 0.025 * S.look
  })
  return (
    <group ref={grp} position={[0, 2.1, Z_END]} visible={false}>
      <DepthMesh id={VAULT} small={mob} segs={mob ? 96 : 180} width={mob ? 6.4 : 7.4} depth={0.55} curve={-0.9} uref={u} pass={0} rotation={[Math.PI / 2, 0, 0]} />
    </group>
  )
}

/* warm dust motes — cheap additive points, drifting, twinkling, fading near the lens */
const dustVert = /* glsl */`
attribute float aSeed; uniform float uTime; uniform float uSize; uniform float uOpacity;
varying float vA;
void main(){
  vec3 p = position;
  float s = aSeed * 6.2831;
  p.x += sin(uTime * 0.11 + s) * 0.18;
  p.y += sin(uTime * 0.07 + s * 1.7) * 0.22 + fract(uTime * 0.006 * (0.4 + aSeed) + aSeed) * 0.6 - 0.3;
  p.z += cos(uTime * 0.09 + s * 2.3) * 0.15;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  float dist = -mv.z;
  gl_PointSize = uSize * (0.45 + aSeed) / max(dist, 0.1);
  vA = uOpacity * smoothstep(0.2, 0.8, dist) * (1.0 - smoothstep(3.0, 5.5, dist)) * (0.45 + 0.55 * sin(uTime * (0.5 + aSeed) + s * 7.0));
  gl_Position = projectionMatrix * mv;
}`
const dustFrag = /* glsl */`
varying float vA;
void main(){ float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.0, d); a *= a; gl_FragColor = vec4(vec3(1.0, 0.8, 0.55) * 1.3, a * max(vA, 0.0)); }`

function Dust({ mob }) {
  const { gl } = useThree()
  const mat = useRef()
  const geo = useMemo(() => {
    const n = mob ? 360 : 900, pos = new Float32Array(n * 3), seed = new Float32Array(n)
    const beamsX = ROOMS.map(id => CFG[id].beam[0])
    for (let i = 0; i < n; i++) {
      const k = Math.floor(Math.random() * ROOMS.length)
      const inBeam = Math.random() < 0.55
      pos[i * 3] = inBeam ? beamsX[k] + (Math.random() - 0.5) * 0.7 : (Math.random() - 0.5) * 3.4
      pos[i * 3 + 1] = (Math.random() - 0.5) * 2.4 + (inBeam ? 0.3 : 0)
      pos[i * 3 + 2] = -k * L + 0.6 + Math.random() * 2.8
      seed[i] = Math.random()
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    return g
  }, [mob])
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uSize: { value: 26 }, uOpacity: { value: 0.8 } }), [])
  useFrame((st) => {
    if (!mat.current) return
    const u = mat.current.uniforms
    u.uTime.value = st.clock.elapsedTime
    u.uSize.value = (mob ? 30 : 24) * gl.getPixelRatio()
    u.uOpacity.value = 0.85 * (1 - S.look * 0.5)
  })
  return (
    <points geometry={geo} frustumCulled={false}>
      <shaderMaterial ref={mat} uniforms={uniforms} vertexShader={dustVert} fragmentShader={dustFrag} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  )
}

/* full-screen warm-dark backdrop (only while this scene owns the camera) */
const bgVert = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy * 2.0, 0.9999, 1.0); }`
const bgFrag = `varying vec2 vUv; void main(){ float r = distance(vUv, vec2(0.5, 0.55)); vec3 c = mix(vec3(0.09, 0.065, 0.045), vec3(0.025, 0.02, 0.016), smoothstep(0.1, 0.8, r)); gl_FragColor = vec4(c, 1.0); }`
function Backdrop() {
  const m = useRef()
  useFrame(() => { if (m.current) m.current.visible = S.active })
  return (
    <mesh ref={m} frustumCulled={false} renderOrder={-10}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial vertexShader={bgVert} fragmentShader={bgFrag} depthWrite={false} depthTest={false} toneMapped={false} />
    </mesh>
  )
}

export default function ScenePalazzo({ track }) {
  const root = useRef()
  const { size } = useThree()
  const mob = size.width < 768
  const fov = mob ? 60 : 48
  const beamTex = useMemo(beamTexture, [])
  // width that covers the viewport at the room distance (+ margin for parallax and pitch)
  const cover = aspect => {
    const visH = 2 * D0 * Math.tan((fov * Math.PI) / 360), visW = visH * (size.width / size.height)
    return Math.max(visW, visH / aspect) * 1.2
  }
  const pd = useRef(0), ptr = useRef({ x: 0, y: 0 }), wasActive = useRef(false)

  useFrame((st, dt) => {
    const tr = track.current
    dt = Math.min(dt, 0.05)
    if (!root.current) return
    root.current.visible = tr.on
    S.active = tr.on && stage.active === 'palazzo'
    if (!tr.on) { wasActive.current = false; return }
    // one damped progress drives everything; snap on big jumps (nav / skip)
    if (!wasActive.current || Math.abs(tr.p - pd.current) > 0.35) pd.current = tr.p
    else pd.current = THREE.MathUtils.damp(pd.current, tr.p, 4.5, dt)
    wasActive.current = S.active
    const p = pd.current
    S.t = roomTime(p)
    S.look = smooth(TL.look[0], TL.look[1], p)
    if (!S.active) return
    const cam = st.camera
    ptr.current.x = THREE.MathUtils.damp(ptr.current.x, st.pointer.x, 2.5, dt)
    ptr.current.y = THREE.MathUtils.damp(ptr.current.y, st.pointer.y, 2.5, dt)
    const px = ptr.current.x * (1 - S.look), py = ptr.current.y * (1 - S.look)
    const open = smooth(TL.open[0], TL.open[1] + 0.04, p)
    const zc = D0 - S.t * L + (1 - open) * 0.7
    const k = Math.min(Math.floor(S.t), ROOMS.length - 1), fr = S.t - k
    const pA = CFG[ROOMS[k]].pitch, pB = CFG[ROOMS[Math.min(k + 1, ROOMS.length - 1)]].pitch
    const pitch = THREE.MathUtils.lerp(pA, pB, smooth(0.55, 1, fr)) * (1 - S.look) + S.look * 1.45
    const time = st.clock.elapsedTime
    cam.position.set(ORIGIN[0] + px * 0.14, ORIGIN[1] + py * 0.08 + Math.sin(time * 0.45) * 0.01, ORIGIN[2] + zc)
    cam.rotation.order = 'YXZ'
    cam.rotation.set(pitch + py * 0.02, -px * 0.05 + Math.sin(time * 0.2) * 0.006, 0)
    if (Math.abs(cam.fov - fov) > 0.01) { cam.fov = fov; cam.updateProjectionMatrix() }
    S.camZ = cam.position.z - ORIGIN[2]
  })

  return (
    <group ref={root} visible={false}>
      <Backdrop />
      <group position={ORIGIN}>
        <Suspense fallback={null}>
          {ROOMS.map((id, k) => <Room key={id} id={id} k={k} mob={mob} beamTex={beamTex} cover={cover} />)}
          <Vault mob={mob} />
        </Suspense>
        <Dust mob={mob} />
      </group>
    </group>
  )
}
