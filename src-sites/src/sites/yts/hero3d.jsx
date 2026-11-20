import React, { useMemo, useRef, useEffect } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, Html } from '@react-three/drei'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

/* Procedural hillside terraces (after his Lake Como scheme): ink sketch → stone → exploded scales.
   Scroll progress arrives as a framer MotionValue and is damped here — no React state per frame. */

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const seg = (p, a, b) => clamp((p - a) / (b - a))
const ease = t => 1 - Math.pow(1 - t, 3)
const ease2 = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

// deterministic random so the sketch looks the same every visit
function rng(seed) { let s = seed; return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646 }

const LEVELS = [
  { y: 0, z: 0, x: 0, w: 6.4, pool: true },
  { y: 1.05, z: -1.6, x: .45, w: 5.7 },
  { y: 2.1, z: -3.2, x: -.25, w: 5.0, pool: true },
]

function box(w, h, d, x, y, z) { const g = new THREE.BoxGeometry(w, h, d); g.translate(x, y, z); return g.toNonIndexed() }
function bush(r, x, y, z, rnd) { const g = new THREE.IcosahedronGeometry(r, 0); g.scale(1, .75, 1); g.rotateY(rnd() * 3); g.translate(x, y, z); return g }

/* collect edges of a geometry as overshooting, double-stroked "hand" segments */
function edgesOf(geo, out, rnd, { thr = 20, hand = true, pri = 0 } = {}) {
  const e = new THREE.EdgesGeometry(geo, thr).attributes.position.array
  for (let i = 0; i < e.length; i += 6) {
    const a = new THREE.Vector3(e[i], e[i + 1], e[i + 2]), b = new THREE.Vector3(e[i + 3], e[i + 4], e[i + 5])
    const dir = b.clone().sub(a), len = dir.length(); if (len < 1e-4) continue
    dir.normalize()
    const strokes = hand ? 2 : 1
    for (let s = 0; s < strokes; s++) {
      const os = hand ? (.03 + rnd() * .09) * (s ? .6 : 1) : 0 // architect's overshoot past the corner
      const j = () => (rnd() - .5) * (hand ? .022 : 0)
      const A = a.clone().addScaledVector(dir, -os).add(new THREE.Vector3(j(), j(), j()))
      const B = b.clone().addScaledVector(dir, os).add(new THREE.Vector3(j(), j(), j()))
      out.push({ A, B, k: Math.min(A.y, B.y) + pri + rnd() * .35, len })
    }
  }
}

function linesGeometry(list, order) {
  const pos = new Float32Array(list.length * 6), d = new Float32Array(list.length * 2)
  list.forEach((s, i) => {
    pos.set([s.A.x, s.A.y, s.A.z, s.B.x, s.B.y, s.B.z], i * 6)
    const st = order.get(s) * .86, w = .025 + Math.min(.08, s.len * .012)
    d[i * 2] = st; d[i * 2 + 1] = st + w
  })
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  g.setAttribute('aD', new THREE.BufferAttribute(d, 1))
  return g
}

function buildModel() {
  const rnd = rng(7)
  const all = []
  const levels = LEVELS.map((L, i) => {
    const { x, y, z, w } = L
    const G = { stone: [], slab: [], glass: [], green: [], pool: [] }, segs = []
    const add = (k, g, opt) => { G[k].push(g); edgesOf(g, segs, rnd, opt) }
    add('slab', box(w + .3, .12, 2.7, x, y + .06, z + .25))
    add('stone', box(w * .4, .84, 1.35, x - w * .3, y + .54, z - .38))
    add('glass', box(w * .56, .8, 1.2, x + w * .2, y + .52, z - .32))
    for (let m = 0; m < 6; m++) add('slab', box(.035, .8, .035, x + w * .2 - w * .26 + m * w * .104, y + .52, z + .29), { hand: false })
    add('slab', box(w + .15, .1, 2.05, x + .05, y + 1.0, z - .12))
    add('stone', box(w * .92, .2, .3, x, y + .22, z + 1.4))
    const nb = 7
    for (let b = 0; b < nb; b++) add('green', bush(.12 + rnd() * .1, x - w * .44 + (b + rnd() * .5) * (w * .88 / nb), y + .36, z + 1.4 + (rnd() - .5) * .1, rnd), { thr: 35, hand: false, pri: .1 })
    if (L.pool) add('pool', box(1.9, .03, .8, x + w * .22, y + .135, z + .78), { hand: false })
    // roof planters on the roof slab
    for (let b = 0; b < 3; b++) add('green', bush(.1 + rnd() * .06, x - w * .35 + b * .32, y + 1.12, z - .9, rnd), { thr: 35, hand: false })
    segs.forEach(s => (s.level = i))
    all.push(...segs)
    const fills = {}
    for (const k in G) if (G[k].length) fills[k] = mergeGeometries(G[k])
    return { fills, segs, L }
  })
  // hillside terrain (stepped earth blocks) + ground hatch
  const T = [], tsegs = []
  LEVELS.forEach((L, i) => {
    const h = L.y + .4, g = box(L.w + 1.6, h, 3.1, L.x, -.4 + h / 2, L.z - .2)
    T.push(g); edgesOf(g, tsegs, rnd, { pri: -.2 })
  })
  const back = box(7.4, 3.2, 1.6, 0, -.4 + 1.6, -5.4); T.push(back); edgesOf(back, tsegs, rnd, { pri: .2 })
  for (let k = 0; k < 6; k++) { // ground strokes
    const zz = 2.1 + k * .2, xx = -4.2 + rnd() * 2.5 + k * .4, ln = 1.2 + rnd() * 2.6
    tsegs.push({ A: new THREE.Vector3(xx, -.4, zz), B: new THREE.Vector3(xx + ln, -.4, zz + (rnd() - .5) * .08), k: -1 + rnd() * .3, len: ln })
  }
  tsegs.forEach(s => (s.level = -1))
  all.push(...tsegs)
  // global drawing order: bottom up, like a hand building the drawing
  const sorted = [...all].sort((a, b) => a.k - b.k), order = new Map()
  sorted.forEach((s, i) => order.set(s, i / sorted.length))
  levels.forEach(l => (l.lines = linesGeometry(l.segs, order)))
  return { levels, terrain: { fill: mergeGeometries(T), lines: linesGeometry(tsegs, order) } }
}

const lineVS = `attribute float aD; varying float vD; void main(){ vD=aD; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`
const lineFS = `uniform float uDraw; uniform float uOp; uniform vec3 uC; varying float vD; void main(){ if(vD>uDraw) discard; float tip=smoothstep(uDraw, uDraw-.012, vD); gl_FragColor=vec4(uC, uOp*(.55+.45*tip)); }`
function lineMat() {
  return new THREE.ShaderMaterial({ vertexShader: lineVS, fragmentShader: lineFS, transparent: true, depthWrite: false, uniforms: { uDraw: { value: 0 }, uOp: { value: .9 }, uC: { value: new THREE.Color('#151412') } } })
}

function useMats(plane) {
  return useMemo(() => {
    const base = { clippingPlanes: [plane], polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 }
    return {
      stone: new THREE.MeshStandardMaterial({ ...base, color: '#d9cdb9', roughness: .92 }),
      slab: new THREE.MeshStandardMaterial({ ...base, color: '#f4f0e8', roughness: .7 }),
      glass: new THREE.MeshStandardMaterial({ ...base, color: '#3f5a64', roughness: .18, metalness: .35, envMapIntensity: 2.2 }),
      green: new THREE.MeshStandardMaterial({ ...base, color: '#7b8656', roughness: .95, flatShading: true }),
      pool: new THREE.MeshStandardMaterial({ ...base, color: '#6e9aa2', roughness: .15, metalness: .2 }),
      terrain: new THREE.MeshStandardMaterial({ ...base, color: '#e4ddd0', roughness: 1 }),
    }
  }, [plane])
}

function shadowTex() {
  const c = document.createElement('canvas'); c.width = c.height = 128
  const x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 4, 64, 64, 64)
  g.addColorStop(0, 'rgba(21,20,18,.55)'); g.addColorStop(1, 'rgba(21,20,18,0)')
  x.fillStyle = g; x.fillRect(0, 0, 128, 128)
  return new THREE.CanvasTexture(c)
}

function Label({ i, text, n, groupRef }) {
  return (
    <Html position={[LEVELS[i].x + LEVELS[i].w / 2 + .2, LEVELS[i].y + .55, LEVELS[i].z - .3]} zIndexRange={[25, 0]} style={{ pointerEvents: 'none' }}>
      <div className="-translate-y-1/2"><div ref={groupRef} data-i={i} style={{ opacity: 0, transform: 'translateX(-10px)', transition: `opacity .5s cubic-bezier(.16,1,.3,1) ${i * 100}ms, transform .7s cubic-bezier(.16,1,.3,1) ${i * 100}ms` }} className="flex items-center whitespace-nowrap font-['Inter_Tight',sans-serif]">
        <span className="h-[7px] w-[7px] rounded-full border border-[#151412] bg-[#ece7df]" />
        <span className="h-px w-[56px] bg-[#151412]/70 md:w-[110px]" />
        <span className="ml-3 text-[11px] font-semibold tabular-nums tracking-[.14em] text-[#b06a35]">{n}</span>
        <span className="ml-2 font-['Instrument_Serif',serif] text-[26px] leading-none text-[#151412] md:text-[34px]">{text}</span>
      </div></div>
    </Html>
  )
}

function Model({ progress, labels }) {
  const data = useMemo(buildModel, [])
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, -1, 0), -1), [])
  const mats = useMats(plane)
  const lmats = useMemo(() => [lineMat(), lineMat(), lineMat(), lineMat()], [])
  const sh = useMemo(shadowTex, [])
  const lv = useRef([]), terr = useRef(), shadow = useRef(), root = useRef(), lab = useRef([])
  const st = useRef({ p: 0, t0: null, on: false })
  const { camera, size, gl } = useThree()
  useEffect(() => { gl.localClippingEnabled = true }, [gl])

  useFrame((state, dt) => {
    const s = st.current
    if (s.t0 === null) s.t0 = state.clock.elapsedTime
    const raw = progress.get()
    s.p = THREE.MathUtils.damp(s.p, raw, 5, Math.min(dt, .05))
    const p = s.p, t = state.clock.elapsedTime - s.t0
    const draw = Math.max(ease(clamp((t - .1) / 2.8)), seg(p, 0, .06))
    const fill = ease2(seg(p, .1, .36))
    const ex = ease2(seg(p, .42, .62))
    const wide = size.width / size.height > 1.1

    // ink → stone
    lmats.forEach(m => { m.uniforms.uDraw.value = draw * 1.0 + (draw >= 1 ? .2 : 0); m.uniforms.uOp.value = .92 - fill * .5 })
    plane.constant = fill >= .999 ? 100 : -.45 + fill * 4.2
    shadow.current.material.opacity = .5 * fill
    // exploded axonometric: floors lift apart with a HALVES-style twist
    lv.current.forEach((g, i) => {
      if (!g) return
      g.position.y = i * ex * 1.15 + ex * .5
      g.position.z = -LEVELS[i].z * .45 * ex
      g.rotation.y = (i - 1) * .16 * ex
    })
    terr.current.scale.y = Math.max(.001, 1 - ex * .985)
    terr.current.position.y = -.4 * ex * 0
    lmats[3].uniforms.uOp.value = (.92 - fill * .5) * (1 - ex)
    const on = ex > .55
    if (on !== s.on) { s.on = on; lab.current.forEach(el => { if (el) { el.style.opacity = on ? 1 : 0; el.style.transform = on ? 'translateX(0)' : 'translateX(-10px)' } }) }

    // camera: slow orbit with scroll + subtle pointer parallax
    const th = -.62 + p * 1.05 + state.pointer.x * .07
    const R = (wide ? 19 : 28) + ex * 1.6 - seg(p, .7, .95) * 3
    const tx = wide ? -2.3 * (1 - ex) - .8 * ex : 0
    const ty = 1.05 + ex * 1.35 + (wide ? 0 : -1.4)
    const tz = -1.5 + ex * .8
    camera.position.set(tx + Math.sin(th) * R, ty + 4.3 + state.pointer.y * .35 - ex * 1.2, tz + Math.cos(th) * R)
    camera.lookAt(tx, ty, tz)
    root.current.rotation.y = Math.sin(t * .25) * .015
  })

  return (
    <group ref={root}>
      <group ref={terr} position={[0, -.4, 0]}>
        <group position={[0, .4, 0]}>
          <mesh geometry={data.terrain.fill} material={mats.terrain} />
          <lineSegments geometry={data.terrain.lines} material={lmats[3]} />
        </group>
      </group>
      {data.levels.map((l, i) => (
        <group key={i} ref={el => (lv.current[i] = el)}>
          {Object.entries(l.fills).map(([k, g]) => <mesh key={k} geometry={g} material={mats[k]} />)}
          <lineSegments geometry={l.lines} material={lmats[i]} />
          <Label i={i} n={'0' + (i + 1)} text={labels[i]} groupRef={el => (lab.current[i] = el)} />
        </group>
      ))}
      <mesh ref={shadow} rotation-x={-Math.PI / 2} position={[0, -.39, -1.2]} scale={[11, 8, 1]}>
        <planeGeometry />
        <meshBasicMaterial map={sh} transparent depthWrite={false} opacity={0} />
      </mesh>
    </group>
  )
}

export default function Hero3D({ progress, labels, active = true }) {
  return (
    <Canvas frameloop={active ? 'always' : 'never'} dpr={[1, 1.6]} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }} camera={{ fov: 30, near: .1, far: 80, position: [-8, 6, 11] }} style={{ position: 'absolute', inset: 0 }}>
      <ambientLight intensity={.5} />
      <hemisphereLight args={['#fff8ee', '#b8ab96', .55]} />
      <directionalLight position={[-6, 9, 6]} intensity={1.9} color="#fff3e2" />
      <Environment resolution={128} frames={1}>
        <Lightformer intensity={2.2} position={[0, 6, 4]} scale={[12, 4, 1]} />
        <Lightformer intensity={1.2} position={[-8, 2, 0]} rotation-y={Math.PI / 2} scale={[8, 3, 1]} color="#ffe6c8" />
        <Lightformer intensity={.8} position={[8, 3, -2]} rotation-y={-Math.PI / 2} scale={[8, 3, 1]} color="#cfe0e6" />
      </Environment>
      <Model progress={progress} labels={labels} />
    </Canvas>
  )
}
