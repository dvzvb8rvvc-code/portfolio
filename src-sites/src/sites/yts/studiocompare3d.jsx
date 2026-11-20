import React, { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber'

/* SKETCH ↔ REALITY in 3D — one dense sheet. Left of the cut: the drawing, flat on paper.
   Right of the cut: the real image, displaced by its depth map, rising out of the paper from the cut,
   relief-lit by a raking light that sweeps along the cut. */

const vert = /* glsl */`
uniform sampler2D uD; uniform float uPos, uAmt, uRise, uAspB, uPlaneA;
varying vec2 vUv; varying float vD; varying float vRamp;
vec2 cover(vec2 uv, float ia, float pa){ if (ia > pa) uv.x = (uv.x - .5) * pa / ia + .5; else uv.y = (uv.y - .5) * ia / pa + .5; return uv; }
void main(){
  vUv = uv;
  float d = texture2D(uD, cover(uv, uAspB, uPlaneA)).r;
  float ramp = smoothstep(uPos - .004, uPos + .24, uv.x);
  vD = d; vRamp = ramp;
  vec3 p = position;
  p.z += (d - .12) * uAmt * ramp * uRise;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`
const frag = /* glsl */`
uniform sampler2D uA, uB, uD; uniform float uPos, uAmt, uRise, uAspA, uAspB, uPlaneA, uPaper, uTime;
varying vec2 vUv; varying float vD; varying float vRamp;
vec2 cover(vec2 uv, float ia, float pa){ if (ia > pa) uv.x = (uv.x - .5) * pa / ia + .5; else uv.y = (uv.y - .5) * ia / pa + .5; return uv; }
float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
void main(){
  vec2 ub = cover(vUv, uAspB, uPlaneA), ua = cover(vUv, uAspA, uPlaneA);
  float dist = vUv.x - uPos;
  // reality: relief lighting from depth gradients
  float e = 1.5 / 512.;
  float dx = texture2D(uD, ub + vec2(e, 0.)).r - texture2D(uD, ub - vec2(e, 0.)).r;
  float dy = texture2D(uD, ub + vec2(0., e)).r - texture2D(uD, ub - vec2(0., e)).r;
  vec3 n = normalize(vec3(-dx * 9., -dy * 9., 1.));
  vec3 L = normalize(vec3(-.9, .35, .55));
  float diff = clamp(dot(n, L), 0., 1.);
  float near = exp(-max(dist, 0.) * 4.5);
  vec3 B = texture2D(uB, ub).rgb;
  B *= mix(1., .62 + .7 * diff, uRise * (.35 + .65 * near));
  B *= .86 + .24 * vD;                                         // atmospheric depth
  float band = exp(-pow(dist * 34., 2.)) + .35 * exp(-pow(dist * 9., 2.));
  B += vec3(1., .8, .52) * band * (.25 + .9 * vD) * uRise * step(0., dist);
  float rim = smoothstep(.0, .025, dx * -1.) * near;             // edges catch the light
  B += vec3(1., .85, .6) * rim * .35 * uRise;
  // sketch on paper
  vec3 A = texture2D(uA, ua).rgb;
  vec3 paper = vec3(.95, .935, .905);
  float g = h(floor(gl_FragCoord.xy * .5)) * .045;
  A = mix(A, A * paper - g + .02, uPaper);
  A *= 1. - .35 * exp(-pow(min(dist, 0.) * 22., 2.)) * step(dist, 0.);  // contact shadow of the lifted photo
  vec3 col = dist < 0. ? A : B;
  float line = 1. - smoothstep(0., 1.6 * fwidth(vUv.x), abs(dist));
  col = mix(col, vec3(1., .96, .88), line);
  gl_FragColor = vec4(col, 1.);
  #include <colorspace_fragment>
}`

function Sheet({ pairs, idx, pos, small, mobile }) {
  const urls = useMemo(() => pairs.flatMap(p => [`/portfolio/yts/img/${p.a}${small ? '-s' : ''}.webp`, `/portfolio/yts/img/${p.b}${small ? '-s' : ''}.webp`, `/portfolio/yts/depth/${p.b}.webp`]), [pairs, small])
  const tex = useLoader(THREE.TextureLoader, urls)
  useMemo(() => tex.forEach((t, i) => { if (i % 3 !== 2) { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8 } }), [tex])
  const { size, camera } = useThree()
  const aspect = size.width / Math.max(1, size.height)
  const W = 4, H = W / aspect
  const geo = useMemo(() => new THREE.PlaneGeometry(W * 1.14, H * 1.14, mobile ? 140 : 280, Math.round((mobile ? 140 : 280) / aspect)), [H, aspect, mobile])
  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: vert, fragmentShader: frag,
    uniforms: { uA: { value: tex[0] }, uB: { value: tex[1] }, uD: { value: tex[2] }, uPos: { value: 0.5 }, uAmt: { value: 0.9 }, uRise: { value: 0 }, uAspA: { value: 1 }, uAspB: { value: 1 }, uPlaneA: { value: aspect }, uPaper: { value: 1 }, uTime: { value: 0 } },
  }), [tex])
  const mesh = useRef(), rise = useRef(0), last = useRef(-1)
  useEffect(() => {
    const k = idx * 3, A = tex[k], B = tex[k + 1]
    mat.uniforms.uA.value = A; mat.uniforms.uB.value = B; mat.uniforms.uD.value = tex[k + 2]
    mat.uniforms.uAspA.value = A.image.width / A.image.height; mat.uniforms.uAspB.value = B.image.width / B.image.height
    mat.uniforms.uPaper.value = idx === 0 ? 1 : 0.35
    if (last.current !== -1) rise.current = 0
    last.current = idx
  }, [idx, tex, mat])
  useEffect(() => {
    mat.uniforms.uPlaneA.value = aspect
    const fov = camera.fov * Math.PI / 180
    camera.position.set(0, 0, (H / 2) / Math.tan(fov / 2) * 1.0)
  }, [aspect, H, camera, mat])
  const prev = useRef(0.5)
  useFrame((st, dt) => {
    const d = Math.min(dt, 0.05), u = mat.uniforms
    const target = pos.get() / 100
    u.uPos.value = target
    const vel = (target - prev.current) / Math.max(d, 1e-3); prev.current = target
    rise.current = damp(rise.current, 1, 1.8, d)
    u.uRise.value = rise.current * rise.current * (3 - 2 * rise.current)
    u.uTime.value = st.clock.elapsedTime
    const m = mesh.current
    m.rotation.y = damp(m.rotation.y, (target - 0.5) * 0.16 + clamp(vel * 0.02, -0.06, 0.06), 4, d)
    m.rotation.x = damp(m.rotation.x, -0.07 + st.pointer.y * 0.05, 3, d)
    camera.position.x = damp(camera.position.x, st.pointer.x * 0.22, 3, d)
    camera.lookAt(0, 0, 0)
  })
  return <mesh ref={mesh} geometry={geo} material={mat} />
}
const { damp, clamp } = THREE.MathUtils

export default function Compare3D({ pairs, idx, pos, small, mobile, active }) {
  return (
    <Canvas frameloop={active ? 'always' : 'never'} dpr={[1, 1.6]} gl={{ antialias: true, powerPreference: 'high-performance' }} flat
      camera={{ position: [0, 0, 8], fov: 30, near: 0.1, far: 50 }} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <color attach="background" args={['#1d323d']} />
      <Sheet pairs={pairs} idx={idx} pos={pos} small={small} mobile={mobile} />
    </Canvas>
  )
}
