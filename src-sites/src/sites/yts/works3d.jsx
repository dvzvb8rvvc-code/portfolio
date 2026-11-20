import React, { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { img } from './data'

/* THE LINEUP — a rotunda of work. Every image is a plane on the inside of a cylinder;
   scroll turns the rotunda, drag spins it, velocity bows the planes. Filters re-flow the wall. */

const R = 11
const WALL_H = 4.7
const GAP = 0.24
const LAYOUT = { all: 3, render: 3, sketch: 2, build: 2 }

const vert = /* glsl */ `
uniform float uBend;
varying vec2 vUv;
void main(){
  vUv = uv;
  vec3 p = position;
  float s = sin(uv.x * 3.14159);
  p.z += s * uBend * 0.9;
  p.y += sin(uv.x * 3.14159 + 1.2) * uBend * 0.12;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`

const frag = /* glsl */ `
uniform sampler2D map;
uniform float uLoaded, uAlpha, uSketch, uHover, uDim, uImgA, uPlaneA, uBend;
varying vec2 vUv;
float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
void main(){
  vec2 uv = vUv;
  if (uImgA > uPlaneA) uv.x = (uv.x - .5) * uPlaneA / uImgA + .5;
  else uv.y = (uv.y - .5) * uImgA / uPlaneA + .5;
  uv = (uv - .5) * (1. - .07 * uHover) + .5;
  vec2 off = vec2(uBend * .012, 0.);
  vec3 col = vec3(texture2D(map, uv + off).r, texture2D(map, uv).g, texture2D(map, uv - off).b);
  float lum = dot(col, vec3(.299,.587,.114));
  col = mix(col, vec3(lum), .22 * (1. - uHover) * (1. - uSketch));
  // sketches: ink on warm paper, with tooth
  vec3 paper = vec3(.925,.906,.875);
  float g = hash(floor(gl_FragCoord.xy));
  vec3 ink = mix(col, vec3(smoothstep(.15,.95,lum)) * vec3(.98,.96,.93), .35);
  col = mix(col, ink * paper - g * .035, uSketch);
  vec3 base = mix(vec3(.12,.115,.105), paper, uSketch);
  col = mix(base, col, uLoaded);
  col = mix(col, vec3(.082,.078,.07), uDim);
  // hairline frame on hover
  vec2 e = min(vUv, 1. - vUv);
  float edge = step(min(e.x * uPlaneA, e.y), .006) * uHover;
  col = mix(col, vec3(.76,.63,.37), edge);
  gl_FragColor = vec4(col, uAlpha);
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
    im.src = img(job.id, true)
    im.decode().then(() => {
      if (job.cancelled) return
      const k = Math.min(1, 512 / Math.max(im.naturalWidth, im.naturalHeight))
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
function requestTex(id, done) { const job = { id, done, cancelled: false }; queue.push(job); pump(); return job }

function layout(items, filter) {
  const rows = LAYOUT[filter] || 3
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

function Plane({ it, L, state, onHover, onOpen, dragState }) {
  const mesh = useRef()
  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: vert, fragmentShader: frag, transparent: true, depthWrite: false,
    uniforms: { map: { value: blank }, uLoaded: { value: 0 }, uAlpha: { value: 0 }, uSketch: { value: it.kind === 'sketch' ? 1 : 0 }, uHover: { value: 0 }, uDim: { value: 0 }, uImgA: { value: 1.5 }, uPlaneA: { value: 1.46 }, uBend: { value: 0 } },
  }), [it])
  const cur = useRef({ th: (Math.random() - 0.5) * 4, y: (Math.random() - 0.5) * 8, w: 2, h: 1.4, a: 0, hov: 0, lambda: 3 + Math.random() * 3 })
  const job = useRef(null), tex = useRef(null), hovered = useRef(false)
  useEffect(() => () => { if (job.current) job.current.cancelled = true; if (tex.current) tex.current.dispose(); mat.dispose() }, [mat])
  useFrame((st, dt) => {
    const m = mesh.current, c = cur.current, u = mat.uniforms
    const p = L.pos.get(it.id)
    const tgt = p || { th: c.th, y: c.y * 1.0, w: c.w * 0.7, h: c.h * 0.7 }
    const d = Math.min(dt, 0.05)
    c.th = THREE.MathUtils.damp(c.th, tgt.th, c.lambda, d)
    c.y = THREE.MathUtils.damp(c.y, p ? tgt.y : (c.y > 0 ? 6 : -6), c.lambda, d)
    c.w = THREE.MathUtils.damp(c.w, tgt.w, c.lambda, d)
    c.h = THREE.MathUtils.damp(c.h, tgt.h, c.lambda, d)
    c.a = THREE.MathUtils.damp(c.a, p ? 1 : 0, p ? c.lambda * 0.8 : 8, d)
    c.hov = THREE.MathUtils.damp(c.hov, hovered.current && !dragState.current.moved ? 1 : 0, 10, d)
    const world = c.th - state.current.rot
    m.position.set(Math.sin(world) * R, c.y, -Math.cos(world) * R)
    m.rotation.set(0, -world, 0)
    const s = 1 + c.hov * 0.045
    m.scale.set(c.w * s, c.h * s, 1)
    m.visible = c.a > 0.01 && Math.abs(world) < 2.2
    u.uAlpha.value = c.a
    u.uHover.value = c.hov
    u.uBend.value = state.current.bend
    u.uPlaneA.value = c.w / c.h
    u.uDim.value = THREE.MathUtils.smoothstep(Math.abs(world), 0.55, 1.6) * 0.85
    // lazy texture: only when near the front and part of the current filter
    if (!job.current && p && Math.abs(world) < 1.25) {
      job.current = requestTex(it.id, (t, a) => { tex.current = t; u.map.value = t; u.uImgA.value = a; state.current.invalidate?.() })
    }
    if (tex.current) u.uLoaded.value = THREE.MathUtils.damp(u.uLoaded.value, 1, 4, d)
  })
  return (
    <mesh ref={mesh} material={mat}
      onPointerOver={e => { e.stopPropagation(); hovered.current = true; document.body.style.cursor = 'pointer'; onHover(it) }}
      onPointerOut={() => { hovered.current = false; document.body.style.cursor = ''; onHover(null) }}
      onClick={e => { e.stopPropagation(); if (!dragState.current.moved) onOpen(it) }}>
      <planeGeometry args={[1, 1, 16, 1]} />
    </mesh>
  )
}

function Rig({ items, filter, progress, dragState, onHover, onOpen }) {
  const L = useMemo(() => layout(items, filter), [items, filter])
  const state = useRef({ rot: 0, bend: 0, last: 0 })
  const { camera, invalidate } = useThree()
  state.current.invalidate = invalidate
  useEffect(() => { dragState.current.offset = 0; dragState.current.target = 0 }, [filter])
  useFrame((st, dt) => {
    const d = Math.min(dt, 0.05)
    const ds = dragState.current
    ds.offset = THREE.MathUtils.damp(ds.offset, ds.target, 5, d)
    const range = Math.max(0, L.ext - 1.1)
    const lim = range / 2 + 0.6
    ds.target = THREE.MathUtils.clamp(ds.target, -lim - (progress.get() - 0.5) * range, lim - (progress.get() - 0.5) * range)
    const goal = (progress.get() - 0.5) * range + ds.offset
    const prev = state.current.rot
    state.current.rot = THREE.MathUtils.damp(prev, goal, 6, d)
    const vel = (state.current.rot - prev) / Math.max(d, 1e-3)
    state.current.bend = THREE.MathUtils.damp(state.current.bend, THREE.MathUtils.clamp(vel * 0.9, -1.2, 1.2), 8, d)
    camera.position.x = THREE.MathUtils.damp(camera.position.x, st.pointer.x * 0.5, 3, d)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, st.pointer.y * 0.3, 3, d)
    camera.lookAt(0, 0, -R)
  })
  return items.map(it => <Plane key={it.id} it={it} L={L} state={state} onHover={onHover} onOpen={onOpen} dragState={dragState} />)
}

function Fov() {
  const { camera, size } = useThree()
  useEffect(() => {
    const a = size.width / size.height
    camera.fov = a < 1.2 ? 58 : 44
    camera.position.z = a < 1.2 ? 3 : 5
    camera.updateProjectionMatrix()
  }, [size, camera])
  return null
}

export default function WorksWall({ items, filter, progress, dragState, onHover, onOpen, active }) {
  return (
    <Canvas frameloop={active ? 'always' : 'never'} dpr={[1, 1.6]} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0, 5], fov: 44, near: 0.1, far: 60 }} style={{ position: 'absolute', inset: 0 }}>
      <Fov />
      <Rig items={items} filter={filter} progress={progress} dragState={dragState} onHover={onHover} onOpen={onOpen} />
    </Canvas>
  )
}
