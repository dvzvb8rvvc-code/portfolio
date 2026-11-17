import React, { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, RoundedBox } from '@react-three/drei'
import { thumb } from './home-data'

const SHOTS = ['everest', 'butchers', 'lynails', 'dtail', 'goauto']
const N = SHOTS.length
const STOPS = [0, 0.27, 0.5, 0.72, 0.93]
const W = 3.2, H = 2

function useTex(url) {
  const [t, set] = useState(null)
  useEffect(() => {
    let alive = true
    new THREE.TextureLoader().load(url, tx => {
      tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 4
      if (alive) set(tx)
    }, undefined, () => {})
    return () => { alive = false }
  }, [url])
  return t
}

function gradTex(kind) {
  const c = document.createElement('canvas'); c.width = c.height = 128
  const g = c.getContext('2d')
  let gr
  if (kind === 'glow') { gr = g.createRadialGradient(64, 64, 4, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)') }
  else { gr = g.createLinearGradient(0, 0, 128, 128); gr.addColorStop(0, 'rgba(255,255,255,.55)'); gr.addColorStop(.35, 'rgba(255,255,255,.05)'); gr.addColorStop(.6, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(255,255,255,.12)') }
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128)
  const t = new THREE.CanvasTexture(c); return t
}

/* layout keyframes -> [x, y, z, rx, ry, rz, scale] */
function layout(k, i, mob, t) {
  const c = i - (N - 1) / 2
  if (k === 0) return mob
    ? [.3 + c * .13, 1.55 + c * .09, c * .4, -.2, -.5, -.05, .38]
    : [2.3 + c * .3, c * .2 - .05, c * .55, -.18, -.62, -.06, .95]
  if (k === 1) return mob
    ? [c * 1.25, .95, -Math.abs(c) * 1.2, 0, -c * .3, 0, c === 0 ? .6 : .5]
    : [c * 2.45, .5, -Math.abs(c) * 1.3, 0, -c * .32, 0, c === 0 ? 1 : .84]
  if (k === 2) return mob
    ? [-.42 + i * .26, 1.75 - i * .26, i * .3, -.08, .36, .02, .5]
    : [-1.3 + i * .62, 1.3 - i * .36, i * .3, -.08, .38, .02, .8]
  if (k === 3) return mob
    ? [(i % 2 ? .55 : -.55), 2.05 - i * .5, 0, 0, i % 2 ? -.25 : .25, 0, .3]
    : [(i % 2 ? .85 : -.85), 2.05 - i * .62, 0, 0, i % 2 ? -.25 : .25, 0, .38]
  return mob
    ? [0, 1.05, c * .14, -.28, Math.sin(t * .5) * .45, 0, .6]
    : [0, .55, c * .14, -.3, Math.sin(t * .5) * .45, 0, .95]
}
const sm = x => x * x * (3 - 2 * x)
function pose(p, i, mob, t, out) {
  let k = 0
  while (k < STOPS.length - 1 && p > STOPS[k + 1]) k++
  if (k >= STOPS.length - 1) { const a = layout(STOPS.length - 1, i, mob, t); for (let j = 0; j < 7; j++) out[j] = a[j]; return out }
  const a = layout(k, i, mob, t), b = layout(k + 1, i, mob, t)
  const raw = (p - STOPS[k]) / (STOPS[k + 1] - STOPS[k])
  const e = sm(Math.min(1, Math.max(0, (raw - .15) / .7)))
  for (let j = 0; j < 7; j++) out[j] = a[j] + (b[j] - a[j]) * e
  return out
}

function Screen({ i, progress, glow, sheen }) {
  const g = useRef(), tex = useTex(thumb(SHOTS[i])), out = useMemo(() => new Array(7), [])
  const { size } = useThree()
  useFrame((st) => {
    const mob = size.width < 768, t = st.clock.elapsedTime
    pose(progress.get(), i, mob, t, out)
    const o = g.current
    o.position.set(out[0], out[1] + Math.sin(t * .8 + i * 1.3) * .045, out[2])
    o.rotation.set(out[3], out[4], out[5])
    o.scale.setScalar(out[6])
  })
  return (
    <group ref={g}>
      <mesh position={[0, 0, -.12]} scale={[W * 1.5, H * 1.7, 1]}>
        <planeGeometry />
        <meshBasicMaterial map={glow} color="#7d8cff" transparent opacity={.22} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      <RoundedBox args={[W + .1, H + .1, .07]} radius={.06} smoothness={4}>
        <meshPhysicalMaterial color="#0c0e14" metalness={.7} roughness={.22} clearcoat={1} clearcoatRoughness={.15} envMapIntensity={1.3} />
      </RoundedBox>
      <mesh position={[0, 0, .037]}>
        <planeGeometry args={[W, H]} />
        {tex ? <meshBasicMaterial map={tex} toneMapped={false} /> : <meshBasicMaterial color="#161a26" />}
      </mesh>
      <mesh position={[0, 0, .04]}>
        <planeGeometry args={[W, H]} />
        <meshBasicMaterial map={sheen} transparent opacity={.35} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
    </group>
  )
}

function Rig({ children }) {
  const g = useRef()
  useFrame(st => {
    g.current.rotation.y += (st.pointer.x * .12 - g.current.rotation.y) * .04
    g.current.rotation.x += (-st.pointer.y * .08 - g.current.rotation.x) * .04
  })
  return <group ref={g}>{children}</group>
}

export default function Scene({ progress, active = true }) {
  const glow = useMemo(() => gradTex('glow'), []), sheen = useMemo(() => gradTex('sheen'), [])
  return (
    <Canvas dpr={[1, 1.6]} frameloop={active ? 'always' : 'never'} camera={{ position: [0, 0, 9], fov: 35 }} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }} style={{ pointerEvents: 'none' }}>
      <ambientLight intensity={.3} />
      <Rig>
        {SHOTS.map((s, i) => <Screen key={s} i={i} progress={progress} glow={glow} sheen={sheen} />)}
      </Rig>
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={2.4} position={[0, 4, 3]} scale={[10, 2, 1]} />
        <Lightformer form="rect" intensity={2} position={[-5, 0, 2]} rotation-y={Math.PI / 2} scale={[6, 3, 1]} color="#8fa0ff" />
        <Lightformer form="rect" intensity={1.4} position={[5, 1, 2]} rotation-y={-Math.PI / 2} scale={[6, 3, 1]} color="#c8b6ff" />
      </Environment>
    </Canvas>
  )
}
