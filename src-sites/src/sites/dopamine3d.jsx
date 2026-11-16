import React, { useRef, useMemo, useEffect } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import { MarchingCubes } from 'three-stdlib'

/* dopamine molecule (C8H11NO2, heavy atoms + polar H) in pearl;
   dissolves into metaballs that flow between soft forms chapter by chapter */
const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }
const dmp = THREE.MathUtils.damp

const R3 = Math.sqrt(3) / 2
const ATOMS = [
  [0, 1, 'C'], [R3, .5, 'C'], [R3, -.5, 'C'], [0, -1, 'C'], [-R3, -.5, 'C'], [-R3, .5, 'C'],
  [2 * R3, 1, 'C'], [3 * R3, .5, 'C'], [4 * R3, 1, 'N'], [-2 * R3, -1, 'O'], [-2 * R3, 1, 'O'],
  [4 * R3, 2, 'H'], [5 * R3, .5, 'H'], [-3 * R3, -.5, 'H'], [-3 * R3, 1.5, 'H'],
].map(([x, y, e]) => [x - 1.0, y - .3, e])
const BONDS = [[0, 1, 2], [1, 2, 1], [2, 3, 2], [3, 4, 1], [4, 5, 2], [5, 0, 1], [1, 6, 1], [6, 7, 1], [7, 8, 1], [4, 9, 1], [5, 10, 1], [8, 11, 1], [8, 12, 1], [9, 13, 1], [10, 14, 1]]
const N = ATOMS.length
const MS = .55 // molecule world scale
const S = 2.6  // metaball cube half-size (world)

// metaball targets in field space (0..1), each [x,y,z,strength]
function targets() {
  const mol = ATOMS.map(([x, y, e]) => [.5 + x * MS / (2 * S), .5 + y * MS / (2 * S), .5, e === 'H' ? .07 : .16])
  const pebble = Array.from({ length: N }, (_, i) => { const a = i / N * Math.PI * 2 * 2.3, r = .06 + (i % 3) * .04; return [.5 + Math.cos(a) * r * 1.5, .5 + Math.sin(i * 1.7) * .04, .5 + Math.sin(a) * r, .23] })
  const beam = Array.from({ length: N }, (_, i) => { const u = i / (N - 1) - .5; return [.5 + u * .72, .5 + Math.cos(u * 2.4) * .1 - .05, .5 + Math.sin(u * 3) * .05, .15] })
  const ring = Array.from({ length: N }, (_, i) => { const a = i / N * Math.PI * 2; return [.5 + Math.cos(a) * .21, .5 + Math.sin(a) * .21, .5 + Math.sin(a * 3) * .05, .2] })
  const bloom = Array.from({ length: N }, (_, i) => {
    if (i === 0) return [.5, .5, .5, .3]
    if (i <= 10) { const k = (i - 1) % 5, d = i <= 5 ? .1 : .18, a = k / 5 * Math.PI * 2 + Math.PI / 2; return [.5 + Math.cos(a) * d, .5 + Math.sin(a) * d, .5 + (i <= 5 ? .02 : -.03), i <= 5 ? .16 : .12] }
    const a = (i - 11) / 4 * Math.PI * 2 + .6; return [.5 + Math.cos(a) * .27, .5 + Math.sin(a) * .27, .5, .05]
  })
  return [mol, pebble, beam, ring, bloom]
}
const TINT = ['#f2e2e8', '#f6dfd6', '#e4dcf4', '#f5dde5', '#f3e4d8'].map(c => new THREE.Color(c))

function pearl() {
  return new THREE.MeshPhysicalMaterial({ color: '#f4e7ec', roughness: .2, metalness: .05, iridescence: 1, iridescenceIOR: 1.35, iridescenceThicknessRange: [180, 620], clearcoat: 1, clearcoatRoughness: .12, sheen: .7, sheenColor: new THREE.Color('#ffd6e2'), envMapIntensity: 1.25 })
}

function Sculpture({ p, lite }) {
  const { size } = useThree()
  const mob = size.width < 768
  const root = useRef(), crisp = useRef()
  const mat = useMemo(pearl, [])
  const T = useMemo(targets, [])
  const mc = useMemo(() => { const m = new MarchingCubes(mob ? 40 : 52, mat, false, false, 40000); m.isolation = 80; m.scale.setScalar(S); m.visible = false; return m }, [])
  const tm = useRef(0)
  useEffect(() => () => { mat.dispose(); mc.geometry.dispose() }, [])
  const bondGeo = useMemo(() => new THREE.CylinderGeometry(1, 1, 1, 16), [])
  const bonds = useMemo(() => {
    const out = []
    BONDS.forEach(([a, b, o]) => {
      const A = new THREE.Vector3(ATOMS[a][0], ATOMS[a][1], 0).multiplyScalar(MS), B = new THREE.Vector3(ATOMS[b][0], ATOMS[b][1], 0).multiplyScalar(MS)
      const push = (P, Q, r) => { const d = Q.clone().sub(P); const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize()); out.push({ pos: P.clone().add(Q).multiplyScalar(.5), q, len: d.length(), r }) }
      push(A, B, .045)
      if (o === 2) { // aromatic inner line
        const c = new THREE.Vector3(-1.0 * MS, -.3 * MS, 0), mid = A.clone().add(B).multiplyScalar(.5), inward = c.clone().sub(mid).normalize().multiplyScalar(.13)
        const A2 = A.clone().lerp(B, .2).add(inward), B2 = A.clone().lerp(B, .8).add(inward); push(A2, B2, .03)
      }
    })
    return out
  }, [])

  useFrame((st, dt) => {
    tm.current += dt
    const t = tm.current
    const c = lite ? 0 : Math.min(4, Math.max(0, p.get() * 4.6 - .15))
    const R = root.current
    R.rotation.y = dmp(R.rotation.y, Math.sin(t * .25) * .5 + st.pointer.x * .35 + c * .9, 2, dt)
    R.rotation.x = dmp(R.rotation.x, -st.pointer.y * .2 + Math.sin(t * .3) * .08 + (c > 2.5 && c < 3.5 ? -.5 : 0), 2, dt)
    R.position.y = (mob ? 1.3 - ss(.3, 1, c) * .25 : 0) + Math.sin(t * .8) * .05
    R.position.x = mob ? 0 : 2.0
    R.scale.setScalar(mob ? .68 + ss(.3, 1, c) * .22 : 1)
    // crisp -> liquid crossfade
    const k = ss(.12, .5, c)
    crisp.current.scale.setScalar(Math.max(.0001, 1 - k))
    crisp.current.visible = k < .99
    mc.visible = c > .1
    const i0 = Math.min(3, Math.floor(c)), f = ss(.25, .75, c - i0)
    mat.color.lerpColors(TINT[i0], TINT[i0 + 1], f)
    if (!mc.visible) return
    const A = T[i0], B = T[i0 + 1], grow = ss(.1, .4, c)
    mc.reset()
    for (let i = 0; i < N; i++) {
      const a = A[i], b = B[i]
      const w = Math.sin(t * 1.1 + i * 1.7) * .006
      mc.addBall(a[0] + (b[0] - a[0]) * f + w, a[1] + (b[1] - a[1]) * f + Math.cos(t * .9 + i) * .006, a[2] + (b[2] - a[2]) * f + w, (a[3] + (b[3] - a[3]) * f) * grow, 12)
    }
    mc.update()
  })

  return (
    <group ref={root}>
      <primitive object={mc} />
      <group ref={crisp}>
        {ATOMS.map(([x, y, e], i) => <mesh key={i} position={[x * MS, y * MS, 0]} material={mat} scale={e === 'H' ? .12 : e === 'C' ? .19 : .22}><sphereGeometry args={[1, 48, 48]} /></mesh>)}
        {bonds.map((bd, i) => <mesh key={i} geometry={bondGeo} material={mat} position={bd.pos} quaternion={bd.q} scale={[bd.r, bd.len, bd.r]} />)}
      </group>
    </group>
  )
}

export default function Scene({ p, active = true, lite = false }) {
  return (
    <Canvas frameloop={active ? 'always' : 'never'} dpr={[1, 1.6]} camera={{ position: [0, 0, 8], fov: 35 }} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={.5} />
      <directionalLight position={[3, 5, 4]} intensity={1} color="#fff4f0" />
      <Sculpture p={p} lite={lite} />
      <Environment resolution={256}>
        <color attach="background" args={['#efe6ea']} />
        <Lightformer form="rect" intensity={3} position={[0, 5, 2]} rotation-x={Math.PI / 2} scale={[10, 4, 1]} color="#fff7f2" />
        <Lightformer form="rect" intensity={2.4} position={[-6, 0, 2]} rotation-y={Math.PI / 2} scale={[8, 3, 1]} color="#f7c6d4" />
        <Lightformer form="rect" intensity={2.4} position={[6, 0, -1]} rotation-y={-Math.PI / 2} scale={[8, 3, 1]} color="#cdbdf0" />
        <Lightformer form="ring" intensity={2} position={[0, -2, 6]} scale={3} color="#ffe2cf" />
      </Environment>
    </Canvas>
  )
}
