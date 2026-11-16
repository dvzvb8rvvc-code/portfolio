import React, { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'

/* ---------- honeycomb (19 hex prisms, some filled with honey) ---------- */
const SIZE = 0.62
const CELLS = (() => {
  const out = []
  for (let q = -2; q <= 2; q++) for (let r = Math.max(-2, -q - 2); r <= Math.min(2, -q + 2); r++) {
    const x = SIZE * Math.sqrt(3) * (q + r / 2), y = -SIZE * 1.5 * r
    const k = (q * 7 + r * 13 + 40) % 9
    out.push({ x, y, depth: .35 + (k % 4) * .08, filled: k % 3 !== 0, ph: (q * 1.7 + r * 2.3) })
  }
  return out
})()

function Comb({ progress }) {
  const g = useRef(), cells = useRef([])
  const { viewport, size } = useThree()
  const mob = size.width < 768
  useFrame((st, dt) => {
    const t = st.clock.elapsedTime, p = progress ? progress.get() : 0
    const baseX = mob ? 0 : viewport.width * .22, baseY = mob ? viewport.height * .29 : 0
    const tx = baseX + st.pointer.x * viewport.width * (mob ? .08 : .14)
    const ty = baseY + st.pointer.y * viewport.height * (mob ? .06 : .14) + p * 2.2
    g.current.position.x += (tx - g.current.position.x) * Math.min(1, dt * 3)
    g.current.position.y += (ty - g.current.position.y) * Math.min(1, dt * 3)
    g.current.rotation.y += ((st.pointer.x * .55 - .25) - g.current.rotation.y) * Math.min(1, dt * 3)
    g.current.rotation.x += ((-st.pointer.y * .45 + .12) - g.current.rotation.x) * Math.min(1, dt * 3)
    g.current.rotation.z = p * 1.2 + Math.sin(t * .3) * .04
    const s = (mob ? .5 : 1) * (1 - p * .25)
    g.current.scale.setScalar(s)
    cells.current.forEach((m, i) => { if (m) m.position.z = Math.sin(t * 1.2 + CELLS[i].ph) * .06 })
    st.scene.userData.comb = g.current
  })
  return (
    <group ref={g}>
      {CELLS.map((c, i) => (
        <group key={i} ref={el => (cells.current[i] = el)} position={[c.x, c.y, 0]}>
          <mesh rotation-x={Math.PI / 2} position-z={-c.depth / 2}>
            <cylinderGeometry args={[SIZE * .94, SIZE * .94, c.depth, 6, 1]} />
            <meshStandardMaterial color="#f2a900" roughness={.38} metalness={.12} flatShading envMapIntensity={1.2} />
          </mesh>
          <mesh rotation-x={Math.PI / 2} position-z={.005}>
            <cylinderGeometry args={[SIZE * .74, SIZE * .74, .02, 6, 1]} />
            {c.filled
              ? <meshStandardMaterial color="#ffb400" emissive="#ff8a00" emissiveIntensity={.35} roughness={.08} metalness={.05} envMapIntensity={2} />
              : <meshStandardMaterial color="#6b4300" roughness={.6} />}
          </mesh>
        </group>
      ))}
    </group>
  )
}

/* ---------- low-poly bees: instanced bodies + flapping wings ---------- */
function beeBody() {
  const g = new THREE.IcosahedronGeometry(1, 1).toNonIndexed()
  g.scale(.62, .62, 1)
  const pos = g.attributes.position, col = new Float32Array(pos.count * 3)
  const Y = new THREE.Color('#ffc21a'), K = new THREE.Color('#141210')
  for (let f = 0; f < pos.count; f += 3) {
    const z = (pos.getZ(f) + pos.getZ(f + 1) + pos.getZ(f + 2)) / 3
    const black = z > .55 || z < -.82 || (z > -.5 && z < -.18) || (z > .06 && z < .3)
    const c = black ? K : Y
    for (let k = 0; k < 3; k++) { col[(f + k) * 3] = c.r; col[(f + k) * 3 + 1] = c.g; col[(f + k) * 3 + 2] = c.b }
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3))
  g.computeVertexNormals()
  return g
}
function wingGeo() {
  const g = new THREE.CircleGeometry(1, 10)
  g.rotateX(-Math.PI / 2); g.scale(.8, 1, .42); g.translate(.78, 0, -.12)
  return g
}

function Bees({ count }) {
  const body = useRef(), wings = useRef()
  const { size } = useThree()
  const mob = size.width < 768
  const geo = useMemo(() => [beeBody(), wingGeo()], [])
  const data = useMemo(() => Array.from({ length: count }, (_, i) => ({
    R: 2.1 + (i % 5) * .38, w: (i % 2 ? 1 : -1) * (.45 + (i % 4) * .14), ph: i * 2.399,
    tilt: new THREE.Euler((i % 3 - 1) * .5, 0, (i % 4 - 1.5) * .3), bob: .3 + (i % 3) * .2, s: .15 + (i % 3) * .03,
  })), [count])
  const d = useMemo(() => ({ o: new THREE.Object3D(), M: new THREE.Matrix4(), L: new THREE.Matrix4(), W: new THREE.Matrix4(), p: new THREE.Vector3(), n: new THREE.Vector3(), c: new THREE.Vector3(), q: new THREE.Quaternion() }), [])
  useFrame(st => {
    const t = st.clock.elapsedTime
    const comb = st.scene.userData.comb
    if (comb) d.c.copy(comb.position);
    const sc = comb ? comb.scale.x : 1
    const pos = (b, th, out) => {
      out.set(Math.cos(th) * b.R, Math.sin(th * 2 + b.ph) * b.bob, Math.sin(th) * b.R * .8).applyEuler(b.tilt).multiplyScalar(sc).add(d.c)
      return out
    }
    data.forEach((b, i) => {
      const th = t * b.w + b.ph
      pos(b, th, d.p); pos(b, th + .05 * Math.sign(b.w), d.n)
      d.o.position.copy(d.p); d.o.lookAt(d.n); d.o.scale.setScalar(b.s * sc * (mob ? 1.2 : 1))
      d.o.updateMatrix(); d.M.copy(d.o.matrix)
      body.current.setMatrixAt(i, d.M)
      const a = .35 + Math.sin(t * 48 + i) * .75
      for (let side = 0; side < 2; side++) {
        d.L.makeRotationZ(side ? -a : a)
        if (side) d.L.premultiply(d.W.makeScale(-1, 1, 1))
        d.L.premultiply(d.W.makeTranslation(0, .48, .05))
        d.L.premultiply(d.M)
        wings.current.setMatrixAt(i * 2 + side, d.L)
      }
    })
    body.current.instanceMatrix.needsUpdate = true
    wings.current.instanceMatrix.needsUpdate = true
  })
  return (
    <>
      <instancedMesh ref={body} args={[geo[0], null, count]} frustumCulled={false}>
        <meshStandardMaterial vertexColors flatShading roughness={.45} metalness={.05} />
      </instancedMesh>
      <instancedMesh ref={wings} args={[geo[1], null, count * 2]} frustumCulled={false}>
        <meshStandardMaterial color="#ffffff" transparent opacity={.55} side={THREE.DoubleSide} depthWrite={false} roughness={.1} envMapIntensity={2} />
      </instancedMesh>
    </>
  )
}

export default function Scene({ progress }) {
  const mob = typeof window !== 'undefined' && innerWidth < 768
  const src = typeof document !== 'undefined' ? document.getElementById('root') : undefined
  return (
    <Canvas dpr={[1, 1.6]} camera={{ position: [0, 0, 9], fov: 42 }} gl={{ antialias: true, alpha: true }} eventSource={src} eventPrefix="client" style={{ pointerEvents: 'none' }}>
      <ambientLight intensity={.5} />
      <directionalLight position={[3, 5, 6]} intensity={1.6} color="#fff3d6" />
      <Comb progress={progress} />
      <Bees count={mob ? 9 : 16} />
      <Environment resolution={128}>
        <color attach="background" args={['#3a2a10']} />
        <Lightformer form="rect" intensity={4} position={[0, 5, -2]} scale={[10, 3, 1]} color="#fff6e0" />
        <Lightformer form="rect" intensity={3} position={[-5, 1, 2]} rotation-y={Math.PI / 2} scale={[8, 3, 1]} color="#ffd36b" />
        <Lightformer form="ring" intensity={3} position={[3, 2, 5]} scale={2} color="#ffffff" />
      </Environment>
    </Canvas>
  )
}
