import React, { useMemo, useRef, useEffect } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'

/* carousel of glossy polish bottles: drag/swipe to spin, tap to pour */
const TAU = Math.PI * 2
const R = 2.9
const prof = (s = 1, hs = 1) => [[0, 0], [.48, 0], [.56, .03], [.6, .12], [.62, .5], [.6, .82], [.54, .96], [.36, 1.07], [.2, 1.12], [.18, 1.32]].map(([x, y]) => new THREE.Vector2(x * s, y * hs))

function Bottle({ color, i, n, drag, onPick, front }) {
  const g = useRef(), inner = useRef()
  const geo = useMemo(() => ({ glass: new THREE.LatheGeometry(prof(), 40), liquid: new THREE.LatheGeometry(prof(.86, .82).slice(0, 7).concat([new THREE.Vector2(0, .787)]), 40) }), [])
  const a = i / n * TAU
  useFrame((st, dt) => {
    const isF = front.current === i
    const s = THREE.MathUtils.lerp(g.current.scale.x, isF ? 1.22 : .86, .1)
    g.current.scale.setScalar(s)
    g.current.position.y = isF ? Math.sin(st.clock.elapsedTime * 2) * .06 + .05 : 0
    inner.current.rotation.y += dt * (isF ? .9 : .25)
    inner.current.rotation.z = THREE.MathUtils.lerp(inner.current.rotation.z, -drag.current.v * 4, .1)
  })
  return (
    <group position={[Math.sin(a) * R, 0, Math.cos(a) * R]}>
      <group ref={g}>
        <group ref={inner} position={[0, -.75, 0]} onClick={e => { e.stopPropagation(); if (e.delta < 8) onPick(i) }}
          onPointerOver={() => (document.body.style.cursor = 'pointer')} onPointerOut={() => (document.body.style.cursor = '')}>
          <mesh geometry={geo.liquid} position-y={.04}><meshPhysicalMaterial color={color} roughness={.25} clearcoat={.6} clearcoatRoughness={.1} envMapIntensity={.55} /></mesh>
          <mesh geometry={geo.glass} renderOrder={2}><meshPhysicalMaterial color="#ffffff" transparent opacity={.14} roughness={.03} metalness={0} clearcoat={1} depthWrite={false} envMapIntensity={2.2} /></mesh>
          <mesh position-y={1.32 + .46}><cylinderGeometry args={[.19, .23, .92, 32]} /><meshPhysicalMaterial color="#251c2e" roughness={.18} clearcoat={1} clearcoatRoughness={.05} /></mesh>
          <mesh position-y={1.32 + .93}><cylinderGeometry args={[.17, .19, .04, 32]} /><meshPhysicalMaterial color="#3b2e48" roughness={.2} clearcoat={1} /></mesh>
          <mesh position={[0, .5, .6]} scale={[.42, .26, .02]}><boxGeometry /><meshStandardMaterial color="#ffffff" roughness={.4} /></mesh>
        </group>
      </group>
    </group>
  )
}

function Carousel({ colors, target, onFront, onPick, drag }) {
  const grp = useRef()
  const rot = useRef(0)
  const front = useRef(target)
  const { size } = useThree()
  const n = colors.length
  const nearest = r => { const k = Math.round(-r / TAU * n); return ((k % n) + n) % n }
  useFrame(st => {
    const d = drag.current
    if (d.down) { rot.current = d.base + d.dx * .006; }
    else {
      d.v *= .92
      const a = target / n * TAU
      const goal = -a + TAU * Math.round((rot.current + a) / TAU)
      rot.current += (goal - rot.current) * .09
    }
    if (d.release) {
      d.release = false
      const projected = rot.current + d.v * 18
      const k = nearest(projected)
      onFront(k)
    }
    const f = nearest(rot.current)
    if (f !== front.current) front.current = f
    grp.current.rotation.y = rot.current + st.pointer.x * .05
    const mob = size.width < 768
    grp.current.scale.setScalar(mob ? .8 : 1.18)
    grp.current.position.y = mob ? .55 : 0
  })
  useEffect(() => { drag.current.getRot = () => rot.current }, [])
  return <group ref={grp}>{colors.map((c, i) => <Bottle key={i} i={i} n={n} color={c} drag={drag} front={front} onPick={onPick} />)}</group>
}

export default function Scene({ colors, target, onFront, onPick }) {
  const drag = useRef({ down: false, dx: 0, x0: 0, base: 0, v: 0, lx: 0, release: false, getRot: () => 0 })
  const down = e => { const d = drag.current; d.down = true; d.x0 = d.lx = e.clientX; d.dx = 0; d.v = 0; d.base = d.getRot() }
  const move = e => { const d = drag.current; if (!d.down) return; d.dx = e.clientX - d.x0; d.v = (e.clientX - d.lx) * .006 * .6 + d.v * .4; d.lx = e.clientX }
  const up = () => { const d = drag.current; if (!d.down) return; d.down = false; if (Math.abs(d.dx) > 6) d.release = true }
  return (
    <div className="h-full w-full cursor-grab touch-pan-y active:cursor-grabbing" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onPointerLeave={up}>
      <Canvas dpr={[1, 1.6]} camera={{ position: [0, 1.3, 8.2], fov: 38 }} gl={{ antialias: true, alpha: true }} onCreated={({ camera }) => camera.lookAt(0, .35, 0)}>
        <ambientLight intensity={.7} />
        <directionalLight position={[3, 5, 4]} intensity={1.3} />
        <Carousel colors={colors} target={target} onFront={onFront} onPick={onPick} drag={drag} />
        <Environment resolution={256}>
          <color attach="background" args={['#f4eef6']} />
          <Lightformer form="rect" intensity={5} position={[0, 5, 3]} rotation-x={Math.PI / 2} scale={[10, 2, 1]} />
          <Lightformer form="rect" intensity={3} position={[-5, 1, 2]} rotation-y={Math.PI / 2} scale={[2, 8, 1]} color="#ffd6ec" />
          <Lightformer form="rect" intensity={3} position={[5, 1, 2]} rotation-y={-Math.PI / 2} scale={[2, 8, 1]} color="#d6f3ff" />
          <Lightformer form="ring" intensity={4} position={[0, 1, 6]} scale={1.5} />
        </Environment>
      </Canvas>
    </div>
  )
}
