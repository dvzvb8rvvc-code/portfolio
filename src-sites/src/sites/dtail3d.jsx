import React, { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'

/* alloy wheel built from primitives: tyre, rim, spokes, drilled disc, amber caliper, lug nuts */
function spokeGeo() {
  const s = new THREE.Shape()
  s.moveTo(-.16, .32); s.quadraticCurveTo(-.1, .9, -.2, 1.34); s.lineTo(.2, 1.34); s.quadraticCurveTo(.1, .9, .16, .32); s.lineTo(-.16, .32)
  const g = new THREE.ExtrudeGeometry(s, { depth: .12, bevelEnabled: true, bevelThickness: .04, bevelSize: .04, bevelSegments: 3, curveSegments: 10 })
  return g
}
function caliperGeo() {
  const s = new THREE.Shape()
  const r1 = .88, r2 = 1.28, a0 = -.55, a1 = .55
  s.absarc(0, 0, r2, a0, a1, false)
  s.absarc(0, 0, r1, a1, a0, true)
  return new THREE.ExtrudeGeometry(s, { depth: .34, bevelEnabled: true, bevelThickness: .08, bevelSize: .08, bevelSegments: 4, curveSegments: 24 })
}
function discGeo() {
  const s = new THREE.Shape(); s.absarc(0, 0, 1.38, 0, Math.PI * 2, false)
  const hole = new THREE.Path(); hole.absarc(0, 0, .55, 0, Math.PI * 2, true); s.holes.push(hole)
  for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2, r = .95 + (i % 2) * .22; const h = new THREE.Path(); h.absarc(Math.cos(a) * r, Math.sin(a) * r, .04, 0, Math.PI * 2, true); s.holes.push(h) }
  return new THREE.ExtrudeGeometry(s, { depth: .06, bevelEnabled: false, curveSegments: 36 })
}

function Wheel({ progress }) {
  const root = useRef(), spin = useRef()
  const { size } = useThree()
  const mob = size.width < 768
  const geos = useMemo(() => ({ spoke: spokeGeo(), cal: caliperGeo(), disc: discGeo() }), [])
  const vel = useRef({ last: 0, v: 0 })
  useFrame((st, dt) => {
    const y = window.scrollY
    const dv = Math.abs(y - vel.current.last); vel.current.last = y
    vel.current.v = THREE.MathUtils.damp(vel.current.v, dv, 4, dt)
    spin.current.rotation.z -= dt * (.35 + vel.current.v * .08)
    const R = root.current
    R.rotation.y = THREE.MathUtils.damp(R.rotation.y, (mob ? -.25 : -.55) + st.pointer.x * .35, 3, dt)
    R.rotation.x = THREE.MathUtils.damp(R.rotation.x, -st.pointer.y * .25, 3, dt)
    const sy = Math.min(1, y / innerHeight)
    R.position.set(mob ? .9 : 2.4, mob ? -2.1 + sy * 1.2 : -.1 + sy * .8, -sy * 2)
    R.scale.setScalar(mob ? .78 : 1.25)
  })
  const steel = <meshPhysicalMaterial color="#aab3bd" metalness={1} roughness={.22} clearcoat={.6} envMapIntensity={1.4} />
  return (
    <group ref={root}>
      {/* static parts: disc behind, caliper on top */}
      <mesh geometry={geos.disc} position-z={-.32}><meshStandardMaterial color="#6d737a" metalness={.9} roughness={.38} /></mesh>
      <mesh geometry={geos.cal} position-z={-.5} rotation-z={.35}><meshPhysicalMaterial color="#f5a524" metalness={.25} roughness={.3} clearcoat={1} clearcoatRoughness={.05} /></mesh>
      <group ref={spin}>
        <mesh><torusGeometry args={[1.86, .42, 24, 72]} /><meshStandardMaterial color="#121212" roughness={.82} /></mesh>
        <mesh position-z={.02}><torusGeometry args={[1.42, .07, 16, 72]} />{steel}</mesh>
        <mesh rotation-x={Math.PI / 2} position-z={-.1}><cylinderGeometry args={[1.44, 1.44, .5, 64, 1, true]} /><meshStandardMaterial color="#5c6168" metalness={1} roughness={.3} side={THREE.DoubleSide} /></mesh>
        {[0, 1, 2, 3, 4].map(i => <mesh key={i} geometry={geos.spoke} rotation-z={i / 5 * Math.PI * 2} position-z={-.02}>{steel}</mesh>)}
        {[0, 1, 2, 3, 4].map(i => <mesh key={i} geometry={geos.spoke} rotation-z={(i + .5) / 5 * Math.PI * 2} position-z={-.06} scale={[.6, .96, 1]}>{steel}</mesh>)}
        <mesh rotation-x={Math.PI / 2} position-z={.1}><cylinderGeometry args={[.38, .42, .16, 40]} />{steel}</mesh>
        {[0, 1, 2, 3, 4].map(i => { const a = (i + .5) / 5 * Math.PI * 2; return <mesh key={i} rotation-x={Math.PI / 2} position={[Math.cos(a) * .26, Math.sin(a) * .26, .2]}><cylinderGeometry args={[.055, .055, .1, 6]} /><meshStandardMaterial color="#e9ecef" metalness={1} roughness={.15} /></mesh> })}
        <mesh position-z={.2}><circleGeometry args={[.13, 32]} /><meshPhysicalMaterial color="#f5a524" metalness={.6} roughness={.25} clearcoat={1} /></mesh>
      </group>
    </group>
  )
}

export default function Scene() {
  return (
    <Canvas dpr={[1, 1.6]} camera={{ position: [0, 0, 9], fov: 38 }} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={.2} />
      <directionalLight position={[-4, 5, 5]} intensity={1.2} color="#ffd9a0" />
      <Wheel />
      <Environment resolution={256}>
        <color attach="background" args={['#050403']} />
        <Lightformer form="rect" intensity={5} position={[0, 5, 2]} rotation-x={Math.PI / 2} scale={[10, 1.5, 1]} color="#fff3e0" />
        <Lightformer form="rect" intensity={4} position={[-6, 0, 2]} rotation-y={Math.PI / 2} scale={[8, 1, 1]} color="#ffb347" />
        <Lightformer form="rect" intensity={2.5} position={[6, -1, 1]} rotation-y={-Math.PI / 2} scale={[8, 2, 1]} color="#9fb0c4" />
        <Lightformer form="ring" intensity={3} position={[1, 1, 7]} scale={2} color="#ffffff" />
      </Environment>
    </Canvas>
  )
}
