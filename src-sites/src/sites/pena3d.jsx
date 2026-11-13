import React, { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'

/* iridescent soap bubbles: drift up, flee from the pointer, pop on click */
function Bubbles({ count }) {
  const mesh = useRef()
  const { viewport, size } = useThree()
  const tmp = useMemo(() => new THREE.Object3D(), [])
  const data = useMemo(() => Array.from({ length: count }, () => ({
    x: (Math.random() - .5) * 14, y: (Math.random() - .5) * 10, z: (Math.random() - .5) * 4 - 1,
    r: .18 + Math.random() ** 2 * .9, s: .2 + Math.random() * .5, ph: Math.random() * 6.28, vx: 0, vy: 0, pop: 0,
  })), [count])
  const pointer = useRef(new THREE.Vector2(99, 99))
  useFrame((state, dt) => {
    dt = Math.min(dt, .05)
    const w = viewport.width / 2 + 1, h = viewport.height / 2 + 1.5
    const px = state.pointer.x * viewport.width / 2, py = state.pointer.y * viewport.height / 2
    pointer.current.set(px, py)
    data.forEach((d, i) => {
      const dx = d.x - px, dy = d.y - py, dist = Math.hypot(dx, dy)
      const R = d.r + 1.1
      if (dist < R) { const f = (R - dist) / R * 9; d.vx += dx / dist * f * dt; d.vy += dy / dist * f * dt }
      d.vx *= .94; d.vy *= .94
      d.x += d.vx + Math.sin(state.clock.elapsedTime * .7 + d.ph) * .004
      d.y += d.vy + d.s * dt
      if (d.y > h + d.r) { d.y = -h - d.r; d.x = (Math.random() - .5) * w * 2; d.pop = 0 }
      if (d.x > w + 1) d.x = -w - 1; if (d.x < -w - 1) d.x = w + 1
      let sc = d.r * (1 + Math.sin(state.clock.elapsedTime * 2 + d.ph) * .03)
      if (d.pop > 0) { d.pop += dt * 6; sc *= Math.max(0, 1 + d.pop * .4) * (d.pop > 1 ? 0 : 1); if (d.pop > 1.6) { d.pop = 0; d.y = -h - d.r } }
      tmp.position.set(d.x, d.y, d.z)
      tmp.scale.set(sc, sc * (1 - Math.abs(d.vy) * .3), sc)
      tmp.rotation.set(state.clock.elapsedTime * .2 + d.ph, d.ph, 0)
      tmp.updateMatrix()
      mesh.current.setMatrixAt(i, tmp.matrix)
    })
    mesh.current.instanceMatrix.needsUpdate = true
  })
  const onDown = e => {
    e.stopPropagation()
    const d = data[e.instanceId]
    if (d && d.pop === 0) d.pop = .01
  }
  return (
    <instancedMesh ref={mesh} args={[null, null, count]} onPointerDown={onDown}>
      <sphereGeometry args={[1, size.width < 768 ? 24 : 40, size.width < 768 ? 16 : 28]} />
      <meshPhysicalMaterial color="#ffffff" roughness={0.05} metalness={0.1} iridescence={1} iridescenceIOR={1.35}
        iridescenceThicknessRange={[180, 900]} transparent opacity={0.42} envMapIntensity={2.2} clearcoat={1} depthWrite={false} />
    </instancedMesh>
  )
}

export default function Scene() {
  const mob = typeof window !== 'undefined' && innerWidth < 768
  return (
    <Canvas dpr={[1, 1.6]} camera={{ position: [0, 0, 8], fov: 50 }} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.6} />
      <Bubbles count={mob ? 34 : 70} />
      <Environment resolution={256}>
        <color attach="background" args={['#cfc6ff']} />
        <Lightformer form="rect" intensity={4} position={[0, 5, -3]} scale={[12, 3, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={3} position={[-5, 0, 0]} rotation-y={Math.PI / 2} scale={[10, 4, 1]} color="#7af0ff" />
        <Lightformer form="rect" intensity={3} position={[5, 0, 0]} rotation-y={-Math.PI / 2} scale={[10, 4, 1]} color="#ff8ad8" />
        <Lightformer form="ring" intensity={4} position={[2, 2, 5]} scale={2} color="#ffffff" />
      </Environment>
    </Canvas>
  )
}
