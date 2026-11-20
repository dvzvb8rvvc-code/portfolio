import React, { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { View, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import { DepthPhoto } from './depth3d'

/* One canvas for the whole build timeline: every photo box gets a <View> with its own camera.
   As the track slides sideways, each camera pans across its depth-displaced photo → real parallax inside the frame. */
const AR = { 130: 1600 / 747, 134: 1600 / 747, 138: 1600 / 747, 132: 394 / 848, 140: 1600 / 890, 104: 1800 / 1350 }
const FOV = 30, D = 6

function Rig({ track, cover }) {
  const s = useRef({ x: 0, y: 0 })
  useFrame(({ camera, pointer }, dt) => {
    const el = track.current; if (!el) return
    const r = el.getBoundingClientRect()
    const cx = (r.left + r.width / 2) / innerWidth - .5, cy = (r.top + r.height / 2) / innerHeight - .5
    const S = s.current
    S.x = THREE.MathUtils.damp(S.x, -cx * cover * .22, 6, dt)
    S.y = THREE.MathUtils.damp(S.y, cy * cover * .1, 6, dt)
    camera.position.set(S.x, S.y, D)
    camera.lookAt(S.x * .35, S.y * .35, 0)
  })
  return null
}

function Photo({ id, track }) {
  const r = track.current?.getBoundingClientRect()
  const boxAR = r && r.height ? r.width / r.height : 4 / 3
  const visH = 2 * D * Math.tan((FOV / 2) * Math.PI / 180), visW = visH * boxAR
  const ar = AR[id] || 1.5
  const h = Math.max(visH, visW / ar) * 1.18
  return (
    <>
      <PerspectiveCamera makeDefault fov={FOV} position={[0, 0, D]} />
      <Suspense fallback={null}>
        <DepthPhoto id={id} small width={h * ar} depth={h * .16} segments={140} edgeFade={0.0001} />
      </Suspense>
      <Rig track={track} cover={h * ar} />
    </>
  )
}

export default function BuildDepth({ items, active }) {
  return (
    <Canvas frameloop={active ? 'always' : 'never'} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {items.map(({ id, ref }, i) => (
        <View key={id} track={ref} index={i + 1}>
          <Photo id={id} track={ref} />
        </View>
      ))}
    </Canvas>
  )
}
