import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'

/* neon-tube «13» that morphs into a diagnostic waveform */
const cl = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const sm = (a, b, x) => { const t = cl((x - a) / (b - a)); return t * t * (3 - 2 * t) }
const N = 150, RAD = 10

function resample(pts, n) {
  const d = [0]
  for (let i = 1; i < pts.length; i++) d.push(d[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]))
  const L = d[d.length - 1], out = []
  let j = 0
  for (let i = 0; i < n; i++) {
    const t = (i / (n - 1)) * L
    while (j < d.length - 2 && d[j + 1] < t) j++
    const k = (t - d[j]) / (d[j + 1] - d[j] || 1)
    out.push([pts[j][0] + (pts[j + 1][0] - pts[j][0]) * k, pts[j][1] + (pts[j + 1][1] - pts[j][1]) * k])
  }
  return out
}
const S = 1.25
function glyphOne() {
  const p = []
  for (let i = 0; i <= 20; i++) { const t = i / 20; p.push([-0.32 + 0.37 * t, 0.6 + 0.4 * t]) }
  for (let i = 1; i <= 60; i++) p.push([0.05, 1 - (2 * i) / 60])
  return resample(p.map(([x, y]) => [(x - 0.85) * S, y * S]), N)
}
function glyphThree() {
  const p = []
  for (let i = 0; i <= 60; i++) { const a = THREE.MathUtils.degToRad(160 - (250 * i) / 60); p.push([Math.cos(a) * 0.5, 0.5 + Math.sin(a) * 0.5]) }
  for (let i = 1; i <= 70; i++) { const a = THREE.MathUtils.degToRad(90 - (250 * i) / 70); p.push([Math.cos(a) * 0.52, -0.48 + Math.sin(a) * 0.52]) }
  return resample(p.map(([x, y]) => [(x + 0.55) * S, y * S]), N)
}
const wave = (x, t) => {
  const m = ((x * 0.9 + t) % 1.2 + 1.2) % 1.2 - 0.6
  return 0.16 * Math.sin(x * 2.6 + t * 3) + 1.05 * Math.exp(-(m * m) / 0.0025) - 0.35 * Math.exp(-((m - 0.09) ** 2) / 0.004)
}

function makeTube() {
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * RAD * 3), 3))
  const idx = []
  for (let i = 0; i < N - 1; i++) for (let j = 0; j < RAD; j++) {
    const a = i * RAD + j, b = i * RAD + ((j + 1) % RAD), c = a + RAD, d = b + RAD
    idx.push(a, c, b, b, c, d)
  }
  g.setIndex(idx)
  return g
}
const T = new THREE.Vector3(), Nn = new THREE.Vector3(), B = new THREE.Vector3(), Z = new THREE.Vector3(0, 0, 1)
function writeTube(geo, P, r) {
  const arr = geo.attributes.position.array
  for (let i = 0; i < N; i++) {
    const a = P[Math.max(0, i - 1)], b = P[Math.min(N - 1, i + 1)]
    T.set(b[0] - a[0], b[1] - a[1], b[2] - a[2]).normalize()
    Nn.crossVectors(T, Z); if (Nn.lengthSq() < 1e-6) Nn.set(1, 0, 0); Nn.normalize()
    B.crossVectors(T, Nn).normalize()
    const end = i === 0 || i === N - 1 ? 0.6 : 1
    for (let j = 0; j < RAD; j++) {
      const an = (j / RAD) * Math.PI * 2, c = Math.cos(an) * r * end, s = Math.sin(an) * r * end, o = (i * RAD + j) * 3
      arr[o] = P[i][0] + Nn.x * c + B.x * s; arr[o + 1] = P[i][1] + Nn.y * c + B.y * s; arr[o + 2] = P[i][2] + Nn.z * c + B.z * s
    }
  }
  geo.attributes.position.needsUpdate = true
  geo.computeBoundingSphere()
}

const ORANGE = new THREE.Color('#ff7a1a'), GREEN = new THREE.Color('#39f5c8'), WHITE = new THREE.Color('#fff4e8')

function Neon({ progress }) {
  const { size } = useThree()
  const src = useMemo(() => [glyphOne(), glyphThree()], [])
  const tubes = useMemo(() => [0, 1].map(() => ({ core: makeTube(), halo: makeTube(), halo2: makeTube(), P: Array.from({ length: N }, () => [0, 0, 0]) })), [])
  const mats = useMemo(() => ({
    core: new THREE.MeshBasicMaterial({ color: '#ffe0c4', toneMapped: false }),
    halo: new THREE.MeshBasicMaterial({ color: ORANGE, transparent: true, opacity: 0.32, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }),
    halo2: new THREE.MeshBasicMaterial({ color: ORANGE, transparent: true, opacity: 0.08, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }),
  }), [])
  const grp = useRef(), grid = useRef(), t = useRef(0)
  useFrame((st, dt) => {
    const p = progress.get(), mob = size.width < 768
    const m = sm(0.28, 0.6, p)
    t.current += Math.min(dt, 0.05) * (0.15 + sm(0.55, 0.8, p) * 0.5)
    tubes.forEach((tb, k) => {
      for (let i = 0; i < N; i++) {
        const g = src[k][i]
        const wx = k === 0 ? -3.6 + (i / (N - 1)) * 3.6 : (i / (N - 1)) * 3.6
        const wy = wave(wx, t.current) * (0.55 + 0.45 * sm(0.6, 0.8, p))
        const bulge = Math.sin(m * Math.PI) * Math.sin(i * 0.11 + k * 2) * 0.7
        tb.P[i][0] = g[0] + (wx - g[0]) * m
        tb.P[i][1] = g[1] + (wy - g[1]) * m
        tb.P[i][2] = bulge + (1 - m) * Math.sin(st.clock.elapsedTime * 1.4 + i * 0.05) * 0.015
      }
      writeTube(tb.core, tb.P, 0.035); writeTube(tb.halo, tb.P, 0.085); writeTube(tb.halo2, tb.P, 0.2)
    })
    const c = ORANGE.clone().lerp(GREEN, m)
    mats.halo.color.copy(c); mats.halo2.color.copy(c); mats.core.color.copy(WHITE).lerp(c, 0.35)
    const flick = 1 - (Math.sin(st.clock.elapsedTime * 23) > 0.985 ? 0.25 : 0)
    mats.halo.opacity = 0.32 * flick
    // layout: right of hero text on desktop, top on mobile, then centred for the film
    const hero = 1 - sm(0.02, 0.14, p)
    const s = mob ? 0.46 + (1 - hero) * 0.12 : 1
    grp.current.scale.setScalar(s * (1 - m * 0.12) * (mob ? 1 : 1))
    grp.current.position.set(mob ? 0 : 1.9 * hero + 0.05, mob ? 1.45 * hero + 0.35 * (1 - hero) : -0.1 - m * 0.15, 0)
    grp.current.rotation.y = (1 - m) * (Math.sin(st.clock.elapsedTime * 0.5) * 0.18 - 0.2 * hero) + st.pointer.x * 0.12
    grp.current.rotation.x = (1 - m) * 0.08 - st.pointer.y * 0.06
    if (grid.current) grid.current.material.opacity = m * 0.22
  })
  return (
    <group ref={grp}>
      {tubes.map((tb, k) => (
        <group key={k}>
          <mesh geometry={tb.halo2} material={mats.halo2} frustumCulled={false} />
          <mesh geometry={tb.halo} material={mats.halo} frustumCulled={false} />
          <mesh geometry={tb.core} material={mats.core} frustumCulled={false} />
        </group>
      ))}
      <gridHelper ref={grid} args={[9, 18, '#39f5c8', '#39f5c8']} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.6]} material-transparent material-opacity={0} material-depthWrite={false} />
    </group>
  )
}

export default function Neon13({ progress, active }) {
  return (
    <Canvas frameloop={active ? 'always' : 'never'} dpr={[1, 1.6]} camera={{ position: [0, 0, 6], fov: 40 }} gl={{ antialias: true, alpha: true }} style={{ pointerEvents: 'none' }}
      eventSource={typeof document !== 'undefined' ? document.getElementById('root') : undefined} eventPrefix="client">
      <Neon progress={progress} />
    </Canvas>
  )
}
