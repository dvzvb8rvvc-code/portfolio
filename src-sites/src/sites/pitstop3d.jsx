import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'

/* «ПитСтоп» point-cloud film: 4 shapes morph by scroll
   0 crossover car → 1 wheel on alignment stand → 2 coil-over suspension → 3 coffee cup (waiting zone) */

const rnd = (() => { let s = 7; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646 } })()

function polyline(pts, n, closed = true) {
  const segs = []; let total = 0
  const L = closed ? pts.length : pts.length - 1
  for (let i = 0; i < L; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; const l = Math.hypot(b[0] - a[0], b[1] - a[1]); segs.push([a, b, l]); total += l }
  const out = []
  for (let k = 0; k < n; k++) {
    let t = rnd() * total
    for (const [a, b, l] of segs) { if (t <= l) { const f = t / l; out.push([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]); break } t -= l }
  }
  return out
}
const ring = (cx, cy, r, n) => Array.from({ length: n }, () => { const a = rnd() * Math.PI * 2; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r] })

function carShape(N) {
  const prof = [[-2.2, 0.32], [-2.28, 0.72], [-2.02, 0.94], [-1.25, 1.05], [-0.72, 1.55], [0.85, 1.6], [1.55, 1.12], [2.15, 0.98], [2.27, 0.62], [2.2, 0.32]]
  const win = [[-1.05, 1.08], [-0.62, 1.47], [0.2, 1.5], [0.2, 1.1]]
  const win2 = [[0.32, 1.1], [0.32, 1.5], [0.8, 1.5], [1.32, 1.12]]
  const out = []
  const push = (arr, z, jit = 0.012) => arr.forEach(([x, y]) => out.push([x + (rnd() - .5) * jit, y + (rnd() - .5) * jit, z + (rnd() - .5) * jit]))
  const nOut = Math.floor(N * 0.34), nWin = Math.floor(N * 0.12), nWh = Math.floor(N * 0.3), nTop = Math.floor(N * 0.1)
  ;[-0.86, 0.86].forEach(z => {
    push(polyline(prof, nOut / 2).filter(([x, y]) => !(y < 0.75 && (Math.hypot(x + 1.4, y - 0.36) < 0.5 || Math.hypot(x - 1.4, y - 0.36) < 0.5))), z)
    push(polyline(win, nWin / 4), z); push(polyline(win2, nWin / 4), z)
    ;[-1.4, 1.4].forEach(cx => { push(ring(cx, 0.36, 0.42, nWh / 8), z * 1.02); push(ring(cx, 0.36, 0.22, nWh / 16), z * 1.02); push(ring(cx, 0.36, 0.52, nWh / 16).filter(([, y]) => y > 0.36), z) })
  })
  // roof + bonnet lines across width
  for (let i = 0; i < nTop; i++) { const [x, y] = polyline(prof.slice(2, 8), 1, false)[0]; out.push([x, y, (rnd() * 2 - 1) * 0.86]) }
  while (out.length < N) { const x = rnd() * 4.3 - 2.15, z = (rnd() * 2 - 1) * 0.86; out.push([x, 0.32 + rnd() * 0.02, z]) }
  return out.slice(0, N).map(([x, y, z]) => [x, y - 0.85, z])
}

function wheelShape(N) {
  const out = []
  const nT = Math.floor(N * 0.42), nS = Math.floor(N * 0.22), nG = Math.floor(N * 0.26)
  for (let i = 0; i < nT; i++) { const u = rnd() * Math.PI * 2, v = rnd() * Math.PI * 2, R = 1.18, r = 0.34; out.push([(R + r * Math.cos(v)) * Math.cos(u), (R + r * Math.cos(v)) * Math.sin(u), r * Math.sin(v) * 1.1]) }
  for (let i = 0; i < nS; i++) {
    const k = Math.floor(rnd() * 6), a = k / 6 * Math.PI * 2 + (rnd() - .5) * 0.12, t = 0.22 + rnd() * 0.66
    out.push([Math.cos(a) * t, Math.sin(a) * t, 0.12 + (rnd() - .5) * 0.06])
  }
  ring(0, 0, 0.2, Math.floor(N * 0.04)).forEach(([x, y]) => out.push([x, y, 0.16]))
  // alignment target plate behind wheel: cross-hair grid
  for (let i = 0; i < nG; i++) {
    const m = rnd()
    if (m < 0.5) { const y = (Math.floor(rnd() * 7) - 3) * 0.5; out.push([rnd() * 4 - 2, y, -0.7]) }
    else if (m < 0.8) { const x = (Math.floor(rnd() * 9) - 4) * 0.5; out.push([x, rnd() * 3 - 1.5, -0.7]) }
    else { const t = rnd() * 4.2 - 2.1; out.push([t, t * 0.04 + 0.0, 0.5 + rnd() * 0.02]) }
  }
  while (out.length < N) { const a = rnd() * Math.PI * 2; out.push([Math.cos(a) * 1.55, Math.sin(a) * 1.55, 0]) }
  const ry = -0.55, c = Math.cos(ry), s = Math.sin(ry)
  return out.slice(0, N).map(([x, y, z]) => [x * c + z * s, y, -x * s + z * c])
}

function springShape(N) {
  const out = [], H = 2.9, turns = 7.5
  const nH = Math.floor(N * 0.55), nD = Math.floor(N * 0.25)
  for (let i = 0; i < nH; i++) {
    const t = rnd(), a = t * turns * Math.PI * 2, y = t * H - H / 2
    const v = rnd() * Math.PI * 2, w = 0.075
    out.push([Math.cos(a) * (0.62 + Math.cos(v) * w), y + Math.sin(v) * w, Math.sin(a) * (0.62 + Math.cos(v) * w)])
  }
  for (let i = 0; i < nD; i++) { const a = rnd() * Math.PI * 2, y = rnd() * (H + 0.8) - H / 2 - 0.5, r = y < 0.2 ? 0.26 : 0.1; out.push([Math.cos(a) * r, y, Math.sin(a) * r]) }
  ;[H / 2 + 0.06, -H / 2 - 0.06].forEach(y => { for (let i = 0; i < N * 0.08; i++) { const a = rnd() * Math.PI * 2, r = 0.2 + rnd() * 0.65; out.push([Math.cos(a) * r, y, Math.sin(a) * r]) } })
  while (out.length < N) { const a = rnd() * Math.PI * 2; out.push([Math.cos(a) * 0.3, -H / 2 - 0.5, Math.sin(a) * 0.3]) }
  return out.slice(0, N).map(([x, y, z]) => { const r = 0.32, c = Math.cos(r), s = Math.sin(r); return [x * c - y * s, x * s + y * c, z] })
}

function cupShape(N) {
  const out = []
  const nB = Math.floor(N * 0.42), nS = Math.floor(N * 0.2), nH = Math.floor(N * 0.08), nSt = Math.floor(N * 0.16)
  for (let i = 0; i < nB; i++) { const t = rnd(), a = rnd() * Math.PI * 2, r = 0.62 + t * 0.32 + Math.sin(t * Math.PI) * 0.05; out.push([Math.cos(a) * r, -0.7 + t * 1.25, Math.sin(a) * r]) }
  for (let i = 0; i < N * 0.06; i++) { const a = rnd() * Math.PI * 2, r = rnd() * 0.9; out.push([Math.cos(a) * r, 0.42, Math.sin(a) * r]) }
  for (let i = 0; i < nS; i++) { const a = rnd() * Math.PI * 2, r = 0.7 + Math.sqrt(rnd()) * 0.85; out.push([Math.cos(a) * r, -0.74 + (r - 0.7) * 0.08, Math.sin(a) * r]) }
  for (let i = 0; i < nH; i++) { const u = -Math.PI / 2 + rnd() * Math.PI, v = rnd() * Math.PI * 2; out.push([0.95 + Math.cos(u) * 0.36 + Math.cos(v) * 0.05 * Math.cos(u), -0.12 + Math.sin(u) * 0.36, Math.sin(v) * 0.05]) }
  for (let i = 0; i < nSt; i++) { const k = Math.floor(rnd() * 3), t = rnd(); out.push([(k - 1) * 0.32 + Math.sin(t * 7 + k * 2) * 0.12, 0.6 + t * 1.3, (rnd() - .5) * 0.05]) }
  while (out.length < N) { const a = rnd() * Math.PI * 2; out.push([Math.cos(a) * 0.62, -0.7, Math.sin(a) * 0.62]) }
  return out.slice(0, N).map(([x, y, z]) => [x, y - 0.25, z])
}

const vert = /* glsl */`
attribute vec3 p1; attribute vec3 p2; attribute vec3 p3; attribute float aR;
uniform float uM; uniform float uT; uniform float uSize; uniform float uPx;
varying float vR; varying float vA;
void main(){
  float m = clamp(uM, 0.0, 3.0);
  float seg = min(floor(m), 2.0);
  float f = m - seg;
  vec3 a = seg < 0.5 ? position : (seg < 1.5 ? p1 : p2);
  vec3 b = seg < 0.5 ? p1 : (seg < 1.5 ? p2 : p3);
  float fs = smoothstep(0.0, 1.0, clamp((f - aR * 0.35) / 0.65, 0.0, 1.0));
  vec3 dir = normalize(vec3(sin(aR * 91.0), cos(aR * 53.0), sin(aR * 27.0 + 1.0)));
  vec3 pos = mix(a, b, fs) + dir * sin(fs * 3.14159) * (0.9 + aR * 0.8);
  pos += dir * 0.012 * sin(uT * 2.0 + aR * 40.0);
  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * uPx * (0.55 + aR * 0.9) / -mv.z;
  vR = aR; vA = 1.0 - sin(fs * 3.14159) * 0.35;
}`
const frag = /* glsl */`
varying float vR; varying float vA;
void main(){
  vec2 c = gl_PointCoord - 0.5; float d = length(c);
  if (d > 0.5) discard;
  float s = smoothstep(0.5, 0.0, d);
  vec3 col = vR > 0.8 ? vec3(1.0, 0.16, 0.14) : mix(vec3(0.62, 0.64, 0.68), vec3(0.96), vR);
  gl_FragColor = vec4(col, s * vA * (vR > 0.8 ? 1.0 : 0.85));
}`

// scroll progress → morph value; ranges must match pitstop.jsx R
export const R = [[0.1, 0.28], [0.34, 0.52], [0.58, 0.74], [0.8, 0.96]]
export function toM(p) {
  for (let i = 0; i < 3; i++) { const z = R[i][1], a = R[i + 1][0]; if (p < z) return i; if (p < a) return i + (p - z) / (a - z) }
  return 3
}

function Cloud({ progress, count, side }) {
  const grp = useRef(), mat = useRef()
  const { size, viewport } = useThree()
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const shapes = [carShape(count), wheelShape(count), springShape(count), cupShape(count)]
    const names = ['position', 'p1', 'p2', 'p3']
    shapes.forEach((s, k) => g.setAttribute(names[k], new THREE.BufferAttribute(new Float32Array(s.flat()), 3)))
    g.setAttribute('aR', new THREE.BufferAttribute(Float32Array.from({ length: count }, () => rnd()), 1))
    return g
  }, [count])
  const uni = useMemo(() => ({ uM: { value: 0 }, uT: { value: 0 }, uSize: { value: 34 }, uPx: { value: 1 } }), [])
  const st = useRef({ m: 0 })
  useFrame((s, dt) => {
    const u = uni, v = st.current
    const target = toM(progress.get())
    v.m += (target - v.m) * Math.min(1, dt * 5)
    u.uM.value = v.m; u.uT.value += dt; u.uPx.value = s.gl.getPixelRatio() * (size.height / 800)
    const wide = size.width / size.height > 1.1
    grp.current.position.x = side && wide ? viewport.width * 0.2 : 0
    grp.current.position.y = side && wide ? -0.1 : 0
    grp.current.scale.setScalar(wide ? 1 : Math.min(1, viewport.width / 5.4))
    const spin = v.m > 2.5 ? 0.25 : 0.12
    grp.current.rotation.y += dt * spin
    grp.current.rotation.x = 0.12 + s.pointer.y * -0.08
  })
  return (
    <group ref={grp}>
      <points geometry={geo} frustumCulled={false}>
        <shaderMaterial ref={mat} uniforms={uni} vertexShader={vert} fragmentShader={frag} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
    </group>
  )
}

export default function PitScene({ progress, active, count = 7000, side = true }) {
  return (
    <Canvas frameloop={active ? 'always' : 'never'} dpr={[1, 1.6]} camera={{ position: [0, 0.3, 7.2], fov: 36 }} gl={{ antialias: false, alpha: true }} style={{ pointerEvents: 'none' }}>
      <Cloud progress={progress} count={count} side={side} />
    </Canvas>
  )
}
