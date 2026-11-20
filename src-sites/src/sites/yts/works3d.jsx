import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { MeshReflectorMaterial } from '@react-three/drei'
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { img } from './data'

/* THE LINEUP — a cinematic rotunda of work over a dark polished floor.
   Scroll turns it, drag spins it, velocity bows the planes and splits colour; cards away from the
   front defocus (mip-bias DOF) and sink into fog. Hover: the card pushes forward and rises in real
   depth from its depth map. Click: the card flies to the camera and becomes the lightbox. */

const R = 11
const GAP = 0.24
const LAYOUT = { all: 3, render: 3, sketch: 2, build: 2 }
const LAYOUT_M = { all: 5, render: 5, sketch: 4, build: 4 }
const wallH = m => (m ? 9 : 4.7)
const floorY = m => -wallH(m) / 2 - 0.6
const DEPTH = new Set([1, 3, 4, 5, 7, 8, 10, 11, 12, 13, 17, 18, 20, 24, 25, 26, 33, 34, 38, 40, 42, 43, 45, 46, 47, 49, 50, 53, 57, 62, 65, 73, 78, 82, 83, 84, 88, 89, 90, 91, 95, 97, 98, 99, 101, 102, 103, 104, 107, 108, 111, 112, 113, 120, 124, 125, 126, 127, 128, 129, 130, 131, 132, 134, 135, 136, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158])
const { damp, clamp, lerp } = THREE.MathUtils

const vert = /* glsl */ `
uniform float uBend, uDepthAmt, uImgA, uPlaneA, uHover, uFly;
uniform sampler2D uDepth;
varying vec2 vUv; varying vec2 vTex; varying float vD;
void main(){
  vUv = uv;
  vec2 t = uv;
  if (uImgA > uPlaneA) t.x = (t.x - .5) * uPlaneA / uImgA + .5;
  else t.y = (t.y - .5) * uImgA / uPlaneA + .5;
  t = (t - .5) * (1. - .06 * uHover * (1. - uFly)) + .5;
  vTex = t;
  vec3 p = position;
  float s = sin(uv.x * 3.14159);
  float b = uBend * (1. - uFly);
  p.z += s * b * 1.1;
  p.y += sin(uv.x * 3.14159 + 1.2) * b * 0.14;
  float d = 0.;
  if (uDepthAmt > .001) d = texture2D(uDepth, t).r;
  vD = d;
  vec2 e = smoothstep(vec2(0.), vec2(.08), uv) * smoothstep(vec2(0.), vec2(.08), 1. - uv);
  p.z += (d - .25) * uDepthAmt * e.x * e.y;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`

const frag = /* glsl */ `
uniform sampler2D map;
uniform float uLoaded, uAlpha, uSketch, uHover, uDim, uImgA, uPlaneA, uBend, uBlur, uDepthAmt, uFly;
varying vec2 vUv; varying vec2 vTex; varying float vD;
float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
void main(){
  vec2 uv = vTex;
  vec2 off = vec2(uBend * .014 * (1. - uFly), 0.);
  float bias = uBlur;
  vec3 col = vec3(texture2D(map, uv + off, bias).r, texture2D(map, uv, bias).g, texture2D(map, uv - off, bias).b);
  float lum = dot(col, vec3(.299,.587,.114));
  col = mix(col, vec3(lum), .25 * (1. - uHover) * (1. - uSketch) * (1. - uFly));
  vec3 paper = vec3(.925,.906,.875);
  float g = hash(floor(gl_FragCoord.xy));
  vec3 ink = mix(col, vec3(smoothstep(.15,.95,lum)) * vec3(.98,.96,.93), .35);
  col = mix(col, ink * paper - g * .035, uSketch);
  // depth relief on hover: far pixels recede into shade, near ones catch a warm key
  float dn = clamp(uDepthAmt * 1.4, 0., 1.);
  col *= mix(1., .7 + .45 * vD, dn);
  col += vec3(1., .78, .5) * pow(vD, 3.) * .18 * dn;
  vec3 base = mix(vec3(.12,.115,.105), paper, uSketch);
  col = mix(base, col, uLoaded);
  col = mix(col, vec3(.082,.078,.07), uDim);
  vec2 e = min(vUv, 1. - vUv);
  float edge = step(min(e.x * uPlaneA, e.y), .006) * uHover * (1. - uFly);
  col = mix(col, vec3(1.2,.95,.55), edge);
  gl_FragColor = vec4(pow(max(col, 0.), vec3(2.2)), uAlpha);
  #include <colorspace_fragment>
}`

const blank = (() => { const t = new THREE.DataTexture(new Uint8Array([30, 29, 27, 255]), 1, 1); t.needsUpdate = true; return t })()

/* texture queue: thumbnails downscaled to ≤512px on a canvas, max 4 in flight */
let inflight = 0
const queue = []
function pump() {
  while (inflight < 4 && queue.length) {
    const job = queue.shift()
    if (job.cancelled) continue
    inflight++
    const im = new Image()
    im.decoding = 'async'
    im.src = job.src || img(job.id, true)
    im.decode().then(() => {
      if (job.cancelled) return
      const lim = job.max || 512
      const k = Math.min(1, lim / Math.max(im.naturalWidth, im.naturalHeight))
      const c = document.createElement('canvas')
      c.width = Math.max(2, Math.round(im.naturalWidth * k)); c.height = Math.max(2, Math.round(im.naturalHeight * k))
      c.getContext('2d').drawImage(im, 0, 0, c.width, c.height)
      const tex = new THREE.CanvasTexture(c)
      tex.colorSpace = THREE.NoColorSpace
      tex.anisotropy = 4
      tex.minFilter = THREE.LinearMipmapLinearFilter
      job.done(tex, im.naturalWidth / im.naturalHeight)
    }).catch(() => {}).finally(() => { inflight--; pump() })
  }
}
function requestTex(id, done, opt = {}) { const job = { id, done, cancelled: false, ...opt }; queue.push(job); pump(); return job }

function layout(items, filter, mobile) {
  const WALL_H = wallH(mobile)
  const rows = (mobile ? LAYOUT_M : LAYOUT)[filter] || 3
  const list = items.filter(it => filter === 'all' || it.kind === filter)
  const rowH = (WALL_H - GAP * (rows - 1)) / rows
  const cellW = rowH * 1.46
  const step = (cellW + GAP) / R
  const cols = Math.ceil(list.length / rows)
  const ext = cols * step
  const pos = new Map()
  list.forEach((it, i) => {
    const c = Math.floor(i / rows), r = i % rows
    pos.set(it.id, { th: (c - (cols - 1) / 2) * step, y: (rows - 1) / 2 * (rowH + GAP) - r * (rowH + GAP) - 0.3, w: cellW, h: rowH, order: i })
  })
  return { pos, ext, step, cellW, rowH }
}

const _v = new THREE.Vector3(), _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _e = new THREE.Euler(), _dir = new THREE.Vector3()

function Plane({ it, L, state, onHover, dragState, onPick, segs }) {
  const mesh = useRef()
  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: vert, fragmentShader: frag, transparent: true, depthWrite: false,
    uniforms: { map: { value: blank }, uDepth: { value: blank }, uLoaded: { value: 0 }, uAlpha: { value: 0 }, uSketch: { value: it.kind === 'sketch' ? 1 : 0 }, uHover: { value: 0 }, uDim: { value: 0 }, uImgA: { value: 1.5 }, uPlaneA: { value: 1.46 }, uBend: { value: 0 }, uBlur: { value: 0 }, uDepthAmt: { value: 0 }, uFly: { value: 0 } },
  }), [it])
  const cur = useRef({ th: (Math.random() - 0.5) * 4, y: (Math.random() - 0.5) * 8, w: 2, h: 1.4, a: 0, hov: 0, fly: 0, dl: 0, lambda: 3 + Math.random() * 3 })
  const job = useRef(null), tex = useRef(null), hovered = useRef(false), dtex = useRef(null), dreq = useRef(false), big = useRef(false)
  useEffect(() => () => { if (job.current) job.current.cancelled = true; tex.current?.dispose(); dtex.current?.dispose(); mat.dispose() }, [mat])
  useFrame((st, dt) => {
    const m = mesh.current, c = cur.current, u = mat.uniforms, S = state.current
    const p = L.pos.get(it.id)
    const tgt = p || { th: c.th, y: c.y, w: c.w * 0.7, h: c.h * 0.7 }
    const d = Math.min(dt, 0.05)
    const flying = S.fly === it.id
    c.th = damp(c.th, tgt.th, c.lambda, d)
    c.y = damp(c.y, p ? tgt.y : (c.y > 0 ? 6 : -6), c.lambda, d)
    c.w = damp(c.w, tgt.w, c.lambda, d)
    c.h = damp(c.h, tgt.h, c.lambda, d)
    c.a = damp(c.a, p ? 1 : 0, p ? c.lambda * 0.8 : 8, d)
    const hovOn = (hovered.current && !dragState.current.moved && !S.fly) || flying
    c.hov = damp(c.hov, hovOn ? 1 : 0, 9, d)
    c.fly = damp(c.fly, flying ? 1 : 0, flying ? 6.5 : 5, d)
    const world = c.th - S.rot
    // ring transform (hover pushes the card toward the centre of the rotunda)
    const rr = R - c.hov * 1.2
    m.position.set(Math.sin(world) * rr, c.y, -Math.cos(world) * rr)
    m.rotation.set(0, -world, 0)
    const s = 1 + c.hov * 0.06
    let w = c.w * s, h = c.h * s
    const fe = c.fly * c.fly * (3 - 2 * c.fly)
    if (c.fly > 0.001) {
      // fly to a frame in front of the camera, matching the lightbox image box
      const cam = st.camera, dist = 4
      cam.getWorldDirection(_dir)
      _v.copy(cam.position).addScaledVector(_dir, dist)
      const vh = 2 * dist * Math.tan((cam.fov * Math.PI) / 360), vw = vh * cam.aspect
      const ia = u.uImgA.value
      let fh = vh * 0.78, fw = fh * ia
      if (fw > vw * 0.84) { fw = vw * 0.84; fh = fw / ia }
      m.position.lerp(_v, fe)
      _q.setFromEuler(m.rotation); _q2.copy(cam.quaternion); _q.slerp(_q2, fe); m.quaternion.copy(_q)
      w = lerp(w, fw, fe); h = lerp(h, fh, fe)
      m.renderOrder = 10
    } else m.renderOrder = 0
    m.scale.set(w, h, 1)
    m.visible = c.a > 0.01 && (Math.abs(world) < 2.2 || c.fly > 0.01)
    u.uAlpha.value = c.a
    u.uHover.value = c.hov
    u.uFly.value = fe
    u.uBend.value = S.bend
    u.uPlaneA.value = w / h
    const away = THREE.MathUtils.smoothstep(Math.abs(world), 0.5, 1.6)
    u.uDim.value = away * 0.85 * (1 - fe) + S.flyAmt * 0.82 * (1 - fe)
    u.uBlur.value = (away * 2.4 + Math.min(Math.abs(S.vel) * 0.9, 1.5)) * (1 - c.hov) * (1 - fe)
    // lazy textures: thumbnail when near the front; depth map on first hover
    if (!job.current && p && Math.abs(world) < 1.25) {
      job.current = requestTex(it.id, (t, a) => { tex.current = t; u.map.value = t; u.uImgA.value = a })
    }
    if (flying && !big.current && tex.current) { // swap in the full image for the flight
      big.current = true
      requestTex(it.id, t => { tex.current?.dispose(); tex.current = t; u.map.value = t }, { src: img(it.id), max: 1600 })
    }
    if (hovOn && !dreq.current && DEPTH.has(it.id) && !flying) {
      dreq.current = true
      new THREE.TextureLoader().load(`/portfolio/yts/depth/${it.id}.webp`, t => { dtex.current = t; u.uDepth.value = t; c.dl = 1 })
    }
    u.uDepthAmt.value = c.hov * c.dl * 0.75 * (1 - fe)
    if (tex.current) u.uLoaded.value = damp(u.uLoaded.value, 1, 4, d)
  })
  return (
    <mesh ref={mesh} material={mat}
      onPointerOver={e => { e.stopPropagation(); hovered.current = true; document.body.style.cursor = 'pointer'; onHover(it) }}
      onPointerOut={() => { hovered.current = false; document.body.style.cursor = ''; onHover(null) }}
      onClick={e => { e.stopPropagation(); if (!dragState.current.moved) onPick(it) }}>
      <planeGeometry args={[1, 1, segs, Math.round(segs * 0.6)]} />
    </mesh>
  )
}

function Rig({ items, filter, progress, dragState, onHover, onOpen, lbOpen, onFly, mobile }) {
  const L = useMemo(() => layout(items, filter, mobile), [items, filter, mobile])
  const state = useRef({ rot: 0, bend: 0, vel: 0, fly: null, flyT: 0, opened: false, flyAmt: 0, item: null })
  const { camera } = useThree()
  useEffect(() => { dragState.current.offset = 0; dragState.current.target = 0 }, [filter])
  useEffect(() => { if (!lbOpen && state.current.opened) { state.current.fly = null; state.current.opened = false; onFly(false) } }, [lbOpen])
  const pick = it => {
    const S = state.current; if (S.fly) return
    S.fly = it.id; S.item = it; S.flyT = 0; S.opened = false; onFly(true); onHover(null); document.body.style.cursor = ''
    setTimeout(() => { if (S.fly === it.id && !S.opened) { S.opened = true; onOpen(it) } }, 640)
  }
  useFrame((st, dt) => {
    const d = Math.min(dt, 0.05)
    const S = state.current, ds = dragState.current
    ds.offset = damp(ds.offset, ds.target, 5, d)
    const range = Math.max(0, L.ext - 1.1)
    const lim = range / 2 + 0.6
    ds.target = clamp(ds.target, -lim - (progress.get() - 0.5) * range, lim - (progress.get() - 0.5) * range)
    const goal = (progress.get() - 0.5) * range + ds.offset
    const prev = S.rot
    if (!S.fly) S.rot = damp(prev, goal, 6, d)
    const vel = (S.rot - prev) / Math.max(d, 1e-3)
    S.vel = damp(S.vel, vel, 8, d)
    S.bend = damp(S.bend, clamp(vel * 1.1, -1.4, 1.4), 8, d)
    S.flyAmt = damp(S.flyAmt, S.fly ? 1 : 0, 6, d)
    const px = S.fly ? 0 : st.pointer.x, py = S.fly ? 0 : st.pointer.y
    camera.position.x = damp(camera.position.x, px * 0.6, 3, d)
    camera.position.y = damp(camera.position.y, py * 0.35 + 0.15, 3, d)
    camera.lookAt(0, mobile ? 0.4 : -0.1, -R)
  })
  return items.map(it => <Plane key={it.id} it={it} L={L} state={state} onHover={onHover} onPick={pick} dragState={dragState} segs={mobile ? 24 : 40} />)
}

function Fov({ mobile }) {
  const { camera, size, scene } = useThree()
  useEffect(() => {
    const a = size.width / size.height
    camera.fov = a < 1.2 ? 58 : 44
    camera.position.z = a < 1.2 ? 3 : 5
    camera.updateProjectionMatrix()
  }, [size, camera])
  useLayoutEffect(() => { scene.fog = new THREE.Fog('#151412', 13, 27); return () => { scene.fog = null } }, [scene])
  return null
}

function Floor({ mobile }) {
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, floorY(mobile), -4]}>
      <planeGeometry args={[60, 40]} />
      <MeshReflectorMaterial blur={mobile ? [80, 30] : [240, 80]} resolution={mobile ? 256 : 768} mixBlur={0.9} mixStrength={mobile ? 5 : 9} mixContrast={1.1}
        roughness={0.85} depthScale={1.1} minDepthThreshold={0.35} maxDepthThreshold={1.4} color="#1b1916" metalness={0.55} mirror={0.75} />
    </mesh>
  )
}

export default function WorksWall({ items, filter, progress, dragState, onHover, onOpen, active, lbOpen, onFly, mobile }) {
  return (
    <Canvas frameloop={active || lbOpen ? 'always' : 'never'} dpr={[1, mobile ? 1.5 : 1.6]} gl={{ antialias: !!mobile, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping }}
      camera={{ position: [0, 0, 5], fov: 44, near: 0.1, far: 60 }} style={{ position: 'absolute', inset: 0 }}>
      <color attach="background" args={['#151412']} />
      <ambientLight intensity={1.2} />
      <directionalLight position={[0, 6, 4]} intensity={1.2} color="#ffe4c4" />
      <Fov mobile={mobile} />
      <Rig items={items} filter={filter} progress={progress} dragState={dragState} onHover={onHover} onOpen={onOpen} lbOpen={lbOpen} onFly={onFly} mobile={mobile} />
      <Floor mobile={mobile} />
      {!mobile && (
        <EffectComposer multisampling={4} disableNormalPass>
          <Bloom mipmapBlur intensity={0.7} luminanceThreshold={0.82} luminanceSmoothing={0.18} />
          <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.4} />
          <Vignette offset={0.25} darkness={0.75} />
        </EffectComposer>
      )}
    </Canvas>
  )
}
