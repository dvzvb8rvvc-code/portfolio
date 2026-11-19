import React, { useMemo, useRef, useEffect } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'

/* skin cross-section with follicles: explains why laser hair removal is a course
   m 0: beam finds pigment · 1: heats the follicle · 2: hair falls out · 3: next hairs enter active phase */

const rnd = (() => { let s = 5; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646 } })()
const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }
const W = 4.2, D = 2.2, TH = 0.62

function glowTex() {
  const c = document.createElement('canvas'); c.width = c.height = 128
  const g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64)
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(120,230,220,.75)'); gr.addColorStop(1, 'rgba(120,230,220,0)')
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128)
  return new THREE.CanvasTexture(c)
}

function Field({ progress, count }) {
  const hair = useRef(), bulb = useRef(), spot = useRef(), grp = useRef()
  const { size } = useThree()
  const hairs = useMemo(() => {
    const cols = Math.round(Math.sqrt(count * W / D)), rows = Math.ceil(count / cols)
    return Array.from({ length: cols * rows }, (_, i) => {
      const cx = i % cols, cz = Math.floor(i / cols)
      const r = rnd()
      return {
        x: -W / 2 + (cx + 0.5 + (rnd() - .5) * 0.6) * (W / cols), z: -D / 2 + (cz + 0.5 + (rnd() - .5) * 0.6) * (D / rows),
        h: 0.22 + rnd() * 0.25, tilt: (rnd() - .5) * 0.5, tz: (rnd() - .5) * 0.3,
        phase: r < 0.38 ? 0 : r < 0.72 ? 1 : 2, // 0 active now, 1 active next, 2 resting
      }
    })
  }, [count])
  const n = hairs.length
  const hGeo = useMemo(() => { const g = new THREE.CylinderGeometry(0.009, 0.014, 1, 5, 1); g.translate(0, 0.5, 0); return g }, [])
  const bGeo = useMemo(() => new THREE.SphereGeometry(0.035, 10, 8), [])
  const hMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#3a2a22', roughness: 0.6 }), [])
  const bMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.4, emissive: '#ffffff', emissiveIntensity: 0.0 }), [])
  const tex = useMemo(glowTex, [])
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const col = useMemo(() => new THREE.Color(), [])
  const C = useMemo(() => ({ rest: new THREE.Color('#6b4a3a'), hot: new THREE.Color('#ff7a3d'), find: new THREE.Color('#2fd1c4'), next: new THREE.Color('#9a6a52') }), [])
  const st = useRef({ m: 0, t: 0 })
  useFrame((s, dt) => {
    const v = st.current
    v.t += dt
    const target = progress.get()
    v.m += (target - v.m) * Math.min(1, dt * 4)
    const m = v.m
    const find = ss(0.1, 0.8, m) * (1 - ss(1.2, 1.6, m))
    const heat = ss(0.9, 1.6, m) * (1 - ss(2.0, 2.5, m))
    const fall = ss(1.8, 2.6, m)
    const nextOn = ss(2.6, 3.0, m)
    // laser spot sweeps in a raster
    const sweep = (v.t * 0.35) % 1
    const sx = -W / 2 + 0.3 + ((sweep * 3) % 1) * (W - 0.6), sz = -D / 2 + 0.4 + Math.floor(sweep * 3) / 2 * (D - 0.8)
    const spotOn = Math.max(find, heat * 0.8, nextOn * 0.7) * (1 - fall * (1 - nextOn))
    spot.current.position.set(sx, 0.02, sz)
    spot.current.material.opacity = spotOn
    spot.current.scale.setScalar(0.75 + Math.sin(v.t * 9) * 0.04)
    for (let i = 0; i < n; i++) {
      const hh = hairs[i]
      const active = hh.phase === 0, next = hh.phase === 1
      let len = hh.h
      if (active) len *= 1 - fall
      if (next) len *= 0.6 + nextOn * 0.4
      if (hh.phase === 2) len *= 0.5
      dummy.position.set(hh.x, -TH * 0.55, hh.z)
      dummy.rotation.set(hh.tz, 0, hh.tilt)
      dummy.scale.set(1, Math.max(0.0001, TH * 0.55 + len), 1)
      dummy.updateMatrix(); hair.current.setMatrixAt(i, dummy.matrix)
      const bs = active ? 1 - fall * 0.7 : next ? 0.8 + nextOn * 0.2 : 0.6
      dummy.rotation.set(0, 0, 0); dummy.scale.setScalar(bs); dummy.updateMatrix(); bulb.current.setMatrixAt(i, dummy.matrix)
      if (active) { col.copy(C.rest).lerp(C.find, find).lerp(C.hot, heat); if (fall > 0.5) col.lerp(C.rest, (fall - 0.5) * 2) }
      else if (next) col.copy(C.next).lerp(C.find, nextOn)
      else col.copy(C.rest)
      bulb.current.setColorAt(i, col)
    }
    hair.current.instanceMatrix.needsUpdate = true; bulb.current.instanceMatrix.needsUpdate = true
    if (bulb.current.instanceColor) bulb.current.instanceColor.needsUpdate = true
    bMat.emissiveIntensity = 0.15 + heat * 0.25
    const asp = size.width / size.height
    grp.current.scale.setScalar(asp < 1.2 ? 0.78 : asp < 1.8 ? 0.95 : 1.05)
    grp.current.rotation.y = -0.18 + Math.sin(v.t * 0.2) * 0.05 + s.pointer.x * 0.06
  })
  useEffect(() => { for (let i = 0; i < n; i++) bulb.current.setColorAt(i, C.rest) }, [n, C])
  return (
    <group ref={grp}>
      {/* skin surface */}
      <mesh position={[0, -0.006, 0]} rotation-x={-Math.PI / 2}><planeGeometry args={[W, D]} /><meshStandardMaterial color="#ecd0bd" roughness={0.75} /></mesh>
      {/* translucent dermis */}
      <mesh position={[0, -TH / 2 - 0.01, 0]}><boxGeometry args={[W, TH, D]} /><meshStandardMaterial color="#f3c9b5" roughness={0.9} transparent opacity={0.45} depthWrite={false} /></mesh>
      <mesh position={[0, -0.04, D / 2 + 0.001]}><planeGeometry args={[W, 0.06]} /><meshStandardMaterial color="#d9a58e" /></mesh>
      <instancedMesh ref={hair} args={[hGeo, hMat, n]} frustumCulled={false} />
      <instancedMesh ref={bulb} args={[bGeo, bMat, n]} frustumCulled={false} />
      <mesh ref={spot} rotation-x={-Math.PI / 2}><planeGeometry args={[0.9, 0.9]} /><meshBasicMaterial map={tex} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} /></mesh>
    </group>
  )
}

export default function FollicleScene({ progress, active, count = 300 }) {
  return (
    <Canvas frameloop={active ? 'always' : 'never'} dpr={[1, 1.6]} camera={{ position: [0, 1.55, 3.7], fov: 34 }} gl={{ antialias: true, alpha: true }} style={{ pointerEvents: 'none' }}
      onCreated={({ camera }) => camera.lookAt(0, -0.2, 0)}>
      <ambientLight intensity={0.35} />
      <Environment resolution={64}>
        <Lightformer form="rect" intensity={2.2} position={[0, 5, 2]} scale={[8, 3, 1]} />
        <Lightformer form="rect" intensity={0.9} position={[-5, 1, 2]} scale={[3, 3, 1]} color="#dff6f3" />
        <Lightformer form="rect" intensity={0.7} position={[5, 1, -2]} scale={[3, 3, 1]} color="#ffe6d9" />
      </Environment>
      <Field progress={progress} count={count} />
    </Canvas>
  )
}
