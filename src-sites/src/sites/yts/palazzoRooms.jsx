import * as THREE from 'three'
import React, { useMemo, useRef, Suspense } from 'react'
import { useFrame, useThree, useLoader } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import { ROOMS, VAULT, TL, smooth, roomTime } from './palazzoTL'

/* ============================================================
   The piano-nobile walk: his interior photos turned into real
   geometry with their depth maps, placed one behind another.
   The camera dollies through them; geometry that reaches the lens
   dissolves (with a warm rim) so each room opens into the next.
   ============================================================ */
export const INT = new THREE.Vector3(0, 0, -100)
const L = 2.6, D0 = 3.4
// per-room tuning: camera pitch, depth, light beam (x, tilt)
const CFG = {
  148: { pitch: 0.08, depth: 1.25, beam: [0.25, -0.25] },
  156: { pitch: 0.05, depth: 1.15, beam: [-1.1, 0.5] },
  157: { pitch: 0.06, depth: 1.2, beam: [1.0, -0.45] },
  152: { pitch: 0.1, depth: 1.1, beam: [-0.9, 0.4] },
  143: { pitch: 0.0, depth: 1.15, beam: [1.15, -0.5] },
}
const url = (id, small) => `/portfolio/yts/img/${id}${small ? '-s' : ''}.webp`
const durl = id => `/portfolio/yts/depth/${id}.webp`

const vert = /* glsl */`
uniform sampler2D uDepth; uniform float uAmount; uniform float uCamZ;
varying vec2 vUv; varying float vD; varying float vNear;
void main(){
  vUv = uv;
  float d = texture2D(uDepth, uv).r;
  vD = d;
  vec3 p = position + normal * (d * uAmount);
  vec4 wp = modelMatrix * vec4(p, 1.0);
  vNear = uCamZ - wp.z;
  gl_Position = projectionMatrix * viewMatrix * wp;
}`
const frag = /* glsl */`
uniform sampler2D uMap; uniform float uEdge; uniform float uOpacity; uniform float uDissolve; uniform float uPass; uniform float uExposure; uniform float uTime;
varying vec2 vUv; varying float vD; varying float vNear;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y); }
void main(){
  vec3 c = texture2D(uMap, vUv).rgb;
  vec2 e = smoothstep(vec2(0.0), vec2(uEdge), vUv) * smoothstep(vec2(0.0), vec2(uEdge), 1.0 - vUv);
  float a = e.x * e.y * uOpacity;
  // geometry about to touch the lens fades out
  a *= mix(1.0, smoothstep(0.1, 0.55, vNear), uPass);
  // portal dissolve: near surfaces go first, with a ragged warm rim
  float n = noise(vUv * 9.0) * 0.5 + noise(vUv * 31.0) * 0.25;
  float far = 1.0 - vD + n * 0.35;
  float cut = smoothstep(uDissolve - 0.08, uDissolve, far);
  float rim = (1.0 - smoothstep(uDissolve, uDissolve + 0.07, far)) * cut * step(0.001, uDissolve);
  a *= cut;
  if (a < 0.01) discard;
  vec3 col = c * uExposure + vec3(1.0, 0.62, 0.28) * rim * 2.4;
  gl_FragColor = vec4(col, a);
  #include <colorspace_fragment>
}`

function useCover(aspect, dist, fov) {
  const { size } = useThree()
  const visH = 2 * dist * Math.tan((fov * Math.PI) / 360), visW = visH * (size.width / size.height)
  return Math.max(visW, visH / aspect) * 1.18
}

function DepthMesh({ id, small, segs, width, depth, uref, pass = 1, ...props }) {
  const [map, dmap] = useLoader(THREE.TextureLoader, [url(id, small), durl(id)])
  map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = 8
  const aspect = map.image ? map.image.height / map.image.width : 1
  const geo = useMemo(() => new THREE.PlaneGeometry(width, width * aspect, segs, Math.round(segs * aspect)), [width, aspect, segs])
  const uniforms = useMemo(() => ({
    uMap: { value: map }, uDepth: { value: dmap }, uAmount: { value: depth }, uCamZ: { value: 0 }, uEdge: { value: 0.07 }, uOpacity: { value: 1 },
    uDissolve: { value: 0 }, uPass: { value: pass }, uExposure: { value: 1 }, uTime: { value: 0 },
  }), [map, dmap])
  uref.current = uniforms
  return (
    <mesh geometry={geo} {...props}>
      <shaderMaterial uniforms={uniforms} vertexShader={vert} fragmentShader={frag} transparent depthWrite />
    </mesh>
  )
}
function aspectOf(id) { return { 148: 1.023, 156: 1.374, 157: 1.054, 152: 1.176, 143: 0.75, 154: 1.014 }[id] || 1 }

function beamTexture() {
  const c = document.createElement('canvas'); c.width = 64; c.height = 256
  const g = c.getContext('2d'), img = g.createImageData(64, 256)
  for (let y = 0; y < 256; y++) for (let x = 0; x < 64; x++) {
    const u = (x / 63) * 2 - 1, v = y / 255
    const a = Math.exp(-u * u * 5) * Math.pow(Math.sin(v * Math.PI), 1.4) * (0.55 + 0.45 * (1 - v))
    const i = (y * 64 + x) * 4; img.data[i] = 255; img.data[i + 1] = 214; img.data[i + 2] = 160; img.data[i + 3] = a * 255
  }
  g.putImageData(img, 0, 0)
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t
}

function Room({ id, k, S, mob, beamTex }) {
  const u = useRef(), grp = useRef(), beam = useRef()
  const cfg = CFG[id]
  const width = useCover(aspectOf(id), D0, mob ? 62 : 55)
  const last = k === ROOMS.length - 1
  useFrame((st) => {
    const U = u.current; if (!U || !grp.current) return
    const t = S.t
    const vis = S.interior && t > k - 1.15 && t < k + 1.05
    grp.current.visible = vis
    if (!vis) return
    U.uCamZ.value = S.camZ
    U.uDissolve.value = last ? 0 : smooth(k + 0.48, k + 1.0, t) * 1.45
    U.uOpacity.value = last ? 1 - smooth(0.25, 0.7, S.look) : 1
    // rooms waiting behind sit a touch darker, like the next room seen through a doorway
    U.uExposure.value = 0.55 + 0.45 * smooth(k - 0.9, k - 0.1, t) + 0.08 * Math.sin(st.clock.elapsedTime * 0.7 + k)
    if (beam.current) beam.current.material.opacity = 0.32 * smooth(k - 0.7, k - 0.1, t) * (1 - smooth(k + 0.35, k + 0.85, t)) * (last ? 1 - S.look : 1)
  })
  return (
    <group ref={grp} position={[0, 0, -k * L]} visible={false}>
      <DepthMesh id={id} small={mob} segs={mob ? 140 : 230} width={width} depth={cfg.depth} uref={u} />
      <mesh ref={beam} position={[cfg.beam[0], 0.5, 1.15]} rotation={[0, 0, cfg.beam[1]]}>
        <planeGeometry args={[1.1, 4.4]} />
        <meshBasicMaterial map={beamTex} transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} color="#ffc98a" toneMapped={false} />
      </mesh>
    </group>
  )
}

function Vault({ S, mob, zEnd }) {
  const u = useRef(), grp = useRef()
  useFrame((st, dt) => {
    const U = u.current; if (!U || !grp.current) return
    grp.current.visible = S.interior && S.look > 0.02
    U.uOpacity.value = smooth(0.12, 0.6, S.look)
    U.uExposure.value = 0.75 + 0.35 * smooth(0.4, 1, S.look)
    grp.current.rotation.y += dt * 0.02
  })
  return (
    <group ref={grp} position={[0, 2.25, zEnd]} visible={false}>
      <DepthMesh id={VAULT} small={mob} segs={mob ? 140 : 220} width={7.2} depth={0.75} uref={u} pass={0} rotation={[Math.PI / 2, 0, 0]} />
    </group>
  )
}

const LOOK = new THREE.Vector3()
export function Journey({ S, drag, mob }) {
  const dust = useRef(), root = useRef()
  const beamTex = useMemo(beamTexture, [])
  const tEnd = ROOMS.length - 1 + 0.6
  const zEnd = D0 - (tEnd + 0.0955) * L
  const yaw = useRef(0)
  useFrame((st, dt) => {
    dt = Math.min(dt, 0.05)
    if (root.current) root.current.visible = S.interior
    if (!S.interior) return
    const p = S.p, cam = st.camera
    S.t = roomTime(p)
    S.look = smooth(TL.look[0], TL.look[1], p)
    const zc = D0 - S.t * L
    const k = Math.min(Math.floor(S.t), ROOMS.length - 1), fr = S.t - k
    const pA = CFG[ROOMS[k]].pitch, pB = CFG[ROOMS[Math.min(k + 1, ROOMS.length - 1)]].pitch
    const pitch = THREE.MathUtils.lerp(pA, pB, smooth(0.55, 1, fr)) * (1 - S.look) + S.look * 1.42
    // drag turns you beneath the vault; it also drifts on its own
    if (drag?.current) { drag.current.yaw += dt * 0.03 * S.look; yaw.current = THREE.MathUtils.damp(yaw.current, drag.current.yaw * S.look, 4, dt) }
    const px = st.pointer.x, py = st.pointer.y
    cam.position.set(INT.x + px * 0.16 * (1 - S.look), INT.y + py * 0.1 * (1 - S.look) + Math.sin(st.clock.elapsedTime * 0.5) * 0.012, INT.z + zc)
    cam.rotation.order = 'YXZ'
    cam.rotation.set(pitch + py * 0.025, -px * 0.06 + yaw.current, 0)
    const fov = mob ? 62 : 55
    if (Math.abs(cam.fov - fov) > 0.01) { cam.fov = fov; cam.updateProjectionMatrix() }
    S.camZ = cam.position.z
    // focus: the room ahead, or the vault overhead
    LOOK.set(INT.x, INT.y, INT.z - k * L + 0.6).lerp(V3.set(INT.x, INT.y + 1.8, INT.z + zEnd), S.look)
    S.focus.copy(LOOK)
    S.bokeh = mob ? 0 : 2.2
    if (dust.current) dust.current.position.set(cam.position.x, cam.position.y + 0.2, cam.position.z - 1.3)
  })
  return (
    <group ref={root} visible={false}>
      <group position={INT.toArray()}>
        <Suspense fallback={null}>
          {ROOMS.map((id, k) => <Room key={id} id={id} k={k} S={S} mob={mob} beamTex={beamTex} />)}
          <Vault S={S} mob={mob} zEnd={zEnd} />
        </Suspense>
      </group>
      <group ref={dust}>
        <Sparkles count={mob ? 70 : 160} scale={[3.2, 2.4, 2.6]} size={mob ? 3 : 2.6} speed={0.25} opacity={0.75} noise={0.6} color="#ffd9a6" />
      </group>
    </group>
  )
}
const V3 = new THREE.Vector3()
