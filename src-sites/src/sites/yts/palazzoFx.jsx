import * as THREE from 'three'
import React, { useMemo, useRef, useEffect, Suspense } from 'react'
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import { DepthPhoto } from './depth3d'

const url = (id, small) => `/portfolio/yts/img/${id}${small ? '-s' : ''}.webp`
const durl = id => `/portfolio/yts/depth/${id}.webp`

/* ============================================================
   1) Opening — the rooftops of Volterra in real depth.
   ============================================================ */
function OpeningRig({ progress }) {
  const cur = useRef(0)
  useFrame(({ camera, pointer }, dt) => {
    dt = Math.min(dt, 0.05)
    cur.current = THREE.MathUtils.damp(cur.current, progress.get(), 5, dt)
    const p = cur.current
    camera.position.x = THREE.MathUtils.damp(camera.position.x, pointer.x * 0.32, 2.5, dt)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, 0.1 + pointer.y * 0.16 - p * 0.35, 2.5, dt)
    camera.position.z = 4.3 - p * 1.5
    camera.lookAt(0, -p * 0.25, 0)
  })
  return null
}
function useCoverW(aspect, dist, fov) {
  const { size } = useThree()
  const visH = 2 * dist * Math.tan((fov * Math.PI) / 360)
  return Math.max(visH * (size.width / size.height), visH / aspect) * 1.2
}
function Rooftops({ reveal, mob }) {
  const w = useCoverW(1609 / 1800, 4.3, 45)
  return <DepthPhoto id={145} width={w} depth={1.35} segments={mob ? 150 : 260} progress={reveal} small={mob} edgeFade={0.03} />
}
export function OpeningCanvas({ progress, active, mob }) {
  const reveal = useRef(0)
  useEffect(() => { const id = setTimeout(() => { reveal.current = 1 }, 250); return () => clearTimeout(id) }, [])
  return (
    <Canvas frameloop={active ? 'always' : 'never'} dpr={[1, mob ? 1.3 : 1.5]} camera={{ position: [0, 0.1, 4.3], fov: 45 }} gl={{ antialias: true }}>
      <color attach="background" args={['#151412']} />
      <Suspense fallback={null}><Rooftops reveal={reveal} mob={mob} /></Suspense>
      <OpeningRig progress={progress} />
      <Sparkles count={mob ? 30 : 70} scale={[6, 3, 2]} position={[0, 0.3, 1.2]} size={2.2} speed={0.2} opacity={0.5} color="#ffe2b8" />
    </Canvas>
  )
}

/* ============================================================
   2) Amenity cards — DOM-synced depth photos in ONE canvas.
   Each card is a displaced mesh that tilts toward the pointer,
   with depth-aware parallax and a light sweep across the near
   surfaces (glass rim, smoke, towel).
   ============================================================ */
const cVert = /* glsl */`
uniform sampler2D uDepth; uniform vec2 uRep; uniform vec2 uOff; uniform float uAmount;
varying vec2 vUv; varying float vD;
void main(){
  vUv = uv;
  float d = texture2D(uDepth, uOff + uv * uRep).r;
  vD = d;
  vec3 p = position; p.z += d * uAmount;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`
const cFrag = /* glsl */`
uniform sampler2D uMap; uniform sampler2D uDepth; uniform vec2 uRep; uniform vec2 uOff; uniform vec2 uSize; uniform vec2 uPtr; uniform float uSweep; uniform float uHover; uniform float uIn;
varying vec2 vUv; varying float vD;
void main(){
  vec2 uv = uOff + vUv * uRep;
  float d = texture2D(uDepth, uv).r;
  uv += (d - 0.45) * uPtr * vec2(-0.03, -0.022);
  vec3 c = texture2D(uMap, uv).rgb;
  float s = (vUv.x * 0.9 + (1.0 - vUv.y) * 0.55) - uSweep;
  float band = exp(-s * s * 55.0);
  c += vec3(1.0, 0.84, 0.6) * band * (0.08 + d * d * 0.7);
  c *= 0.8 + 0.2 * uHover + d * 0.06;
  vec2 p = (vUv - 0.5) * uSize; vec2 q = abs(p) - uSize * 0.5 + 8.0;
  float r = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - 8.0;
  float a = (1.0 - smoothstep(-1.0, 0.5, r)) * uIn;
  gl_FragColor = vec4(c, a);
  #include <colorspace_fragment>
}`

function Card({ id, i, rects, ptr, mob }) {
  const [map, dmap] = useLoader(THREE.TextureLoader, [url(id, mob), durl(id)])
  map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = 4
  const ia = map.image ? map.image.height / map.image.width : 0.8
  const mesh = useRef(), sweep = useRef(-1 - i * 0.6), wasHover = useRef(0)
  const geo = useMemo(() => new THREE.PlaneGeometry(1, 1, mob ? 90 : 160, mob ? 110 : 200), [mob])
  const uniforms = useMemo(() => ({
    uMap: { value: map }, uDepth: { value: dmap }, uRep: { value: new THREE.Vector2(1, 1) }, uOff: { value: new THREE.Vector2() }, uAmount: { value: 60 },
    uSize: { value: new THREE.Vector2(100, 100) }, uPtr: { value: new THREE.Vector2() }, uSweep: { value: -1 }, uHover: { value: 0 }, uIn: { value: 0 },
  }), [map, dmap])
  useFrame((st, dt) => {
    dt = Math.min(dt, 0.05)
    const r = rects.current[i], m = mesh.current; if (!r || !m) return
    const { width: Wc, height: Hc } = st.size
    m.position.set(r.x + r.w / 2 - Wc / 2, -(r.y + r.h / 2 - Hc / 2), 0)
    m.scale.set(r.w, r.h, 1)
    const U = uniforms, ca = r.h / r.w, z = 0.9
    if (ia > ca) { U.uRep.value.set(z, (ca / ia) * z) } else { U.uRep.value.set((ia / ca) * z, z) }
    U.uOff.value.set((1 - U.uRep.value.x) / 2, (1 - U.uRep.value.y) / 2)
    U.uSize.value.set(r.w, r.h)
    U.uAmount.value = Math.min(r.w, r.h) * 0.16
    const P = ptr.current[i] || { x: 0, y: 0, h: 0 }, t = st.clock.elapsedTime
    // without a pointer (touch), the cards sway on their own
    const tx = P.h ? P.x : Math.sin(t * 0.6 + i * 1.7) * 0.45, ty = P.h ? P.y : Math.cos(t * 0.5 + i) * 0.3
    U.uPtr.value.x = THREE.MathUtils.damp(U.uPtr.value.x, tx, 5, dt)
    U.uPtr.value.y = THREE.MathUtils.damp(U.uPtr.value.y, ty, 5, dt)
    m.rotation.y = U.uPtr.value.x * 0.26
    m.rotation.x = -U.uPtr.value.y * 0.2
    U.uHover.value = THREE.MathUtils.damp(U.uHover.value, P.h ? 1 : 0, 5, dt)
    U.uIn.value = THREE.MathUtils.damp(U.uIn.value, 1, 2.5, dt)
    if (P.h && !wasHover.current && sweep.current > 1.4) sweep.current = -0.6
    wasHover.current = P.h
    sweep.current += dt * (P.h ? 0.9 : 0.45)
    if (sweep.current > 3.2) sweep.current = -0.6
    U.uSweep.value = sweep.current
  })
  return (
    <mesh ref={mesh} geometry={geo}>
      <shaderMaterial uniforms={uniforms} vertexShader={cVert} fragmentShader={cFrag} transparent depthWrite={false} />
    </mesh>
  )
}
function PixelCamera() {
  const { camera, size } = useThree()
  useEffect(() => {
    camera.fov = 30; camera.near = 10; camera.far = 20000
    camera.position.set(0, 0, size.height / 2 / Math.tan((15 * Math.PI) / 180))
    camera.lookAt(0, 0, 0); camera.updateProjectionMatrix()
  }, [size, camera])
  return null
}
export function CardsCanvas({ ids, rects, ptr, active, mob }) {
  return (
    <Canvas frameloop={active ? 'always' : 'never'} dpr={[1, mob ? 1.5 : 1.6]} gl={{ antialias: true, alpha: true }} camera={{ fov: 30, position: [0, 0, 1000] }} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <PixelCamera />
      <Suspense fallback={null}>{ids.map((id, i) => <Card key={id} id={id} i={i} rects={rects} ptr={ptr} mob={mob} />)}</Suspense>
    </Canvas>
  )
}
