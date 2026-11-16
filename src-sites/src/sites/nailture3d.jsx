import React, { useRef, useMemo, useEffect } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'

/* seeded random so vines look the same on every visit */
function rng(seed) { let s = seed; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646 } }

const SEG = 180, RAD = 6
function makeVines(vw, vh, mob) {
  const r = rng(7), vines = []
  const n = mob ? 6 : 9
  for (let i = 0; i < n; i++) {
    const side = i % 4
    let x, y, dir
    if (side === 0) { x = -vw / 2 - .3; y = (r() - .3) * vh * .8; dir = r() * .8 - .4 }
    else if (side === 1) { x = vw / 2 + .3; y = (r() - .7) * vh * .8; dir = Math.PI + r() * .8 - .4 }
    else if (side === 2) { x = (r() - .5) * vw * .9; y = -vh / 2 - .3; dir = Math.PI / 2 + r() * .6 - .3 }
    else { x = (r() - .5) * vw * .9; y = vh / 2 + .3; dir = -Math.PI / 2 + r() * .6 - .3 }
    const pts = [new THREE.Vector3(x, y, -1 + r() * .6)]
    const curl = (r() > .5 ? 1 : -1) * (.18 + r() * .25)
    const steps = 6 + ((r() * 3) | 0), step = (mob ? .45 : .62) + r() * .2
    for (let k = 0; k < steps; k++) {
      dir += curl * (k > steps - 3 ? 2.6 : 1) + (r() - .5) * .5
      x += Math.cos(dir) * step; y += Math.sin(dir) * step
      pts.push(new THREE.Vector3(x, y, -1 + r() * 1.4))
    }
    /* finishing tendril spiral */
    let rr = step * .6
    for (let k = 0; k < 5; k++) { dir += curl * 4.2; rr *= .72; x += Math.cos(dir) * rr; y += Math.sin(dir) * rr; pts.push(new THREE.Vector3(x, y, pts[pts.length - 1].z)) }
    const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal')
    const geo = new THREE.TubeGeometry(curve, SEG, mob ? .03 : .04, RAD, false)
    /* taper toward the tip */
    const p = geo.attributes.position, c = new THREE.Vector3(), v = new THREE.Vector3()
    for (let s = 0; s <= SEG; s++) {
      curve.getPointAt(s / SEG, c)
      const t = 1 - (s / SEG) * .8
      for (let j = 0; j <= RAD; j++) { const id = s * (RAD + 1) + j; v.fromBufferAttribute(p, id).sub(c).multiplyScalar(t).add(c); p.setXYZ(id, v.x, v.y, v.z) }
    }
    geo.computeVertexNormals()
    vines.push({ curve, geo, delay: (i % 3) * .06 })
  }
  return vines
}

function leafShape(len = 1, wid = .42) {
  const s = new THREE.Shape()
  s.moveTo(0, 0); s.quadraticCurveTo(wid, len * .45, 0, len); s.quadraticCurveTo(-wid, len * .45, 0, 0)
  return s
}
function petalShape() {
  const s = new THREE.Shape()
  s.moveTo(0, -.5); s.bezierCurveTo(.5, -.3, .45, .35, .12, .5); s.lineTo(0, .42); s.lineTo(-.12, .5); s.bezierCurveTo(-.45, .35, -.5, -.3, 0, -.5)
  return s
}

function Vines({ grow, season }) {
  const { viewport, size } = useThree()
  const mob = size.width < 768
  const vines = useMemo(() => makeVines(viewport.width, viewport.height, mob), [mob, Math.round(viewport.width)])
  const stemMat = useMemo(() => new THREE.MeshStandardMaterial({ color: season.vine, roughness: .55 }), [])
  const leafMat = useMemo(() => new THREE.MeshStandardMaterial({ color: season.leaf, roughness: .5, side: THREE.DoubleSide }), [])
  const budMat = useMemo(() => new THREE.MeshStandardMaterial({ color: season.bud, roughness: .35 }), [])
  const leafGeo = useMemo(() => new THREE.ShapeGeometry(leafShape(), 6), [])
  const leaves = useMemo(() => {
    const L = [], r = rng(3)
    vines.forEach((v, vi) => {
      for (let t = .1; t < .9; t += .075 + r() * .04) L.push({ vi, t, side: L.length % 2 ? 1 : -1, s: (mob ? .22 : .3) * (1.1 - t * .5) * (.8 + r() * .4), tw: r() * 6.28 })
    })
    return L
  }, [vines])
  const buds = useMemo(() => vines.flatMap((v, vi) => [.35, .62, 1].map(t => ({ vi, t }))), [vines])
  const lm = useRef(), bm = useRef(), g = useRef(), sm = useRef(0)
  const o = useMemo(() => new THREE.Object3D(), [])
  const tc = useMemo(() => [new THREE.Color(), new THREE.Color(), new THREE.Color()], [])
  useEffect(() => () => vines.forEach(v => v.geo.dispose()), [vines])
  useFrame((st, dt) => {
    sm.current += (grow.get() - sm.current) * Math.min(1, dt * 3)
    const G = sm.current, time = st.clock.elapsedTime
    tc[0].set(season.vine); tc[1].set(season.leaf); tc[2].set(season.bud)
    stemMat.color.lerp(tc[0], .05); leafMat.color.lerp(tc[1], .05); budMat.color.lerp(tc[2], .05)
    vines.forEach((v, i) => {
      const gv = THREE.MathUtils.clamp((G - v.delay) / (1 - v.delay), 0, 1)
      const segs = Math.floor(gv * SEG)
      v.geo.setDrawRange(0, segs * RAD * 6)
      v.gv = gv
    })
    const p = new THREE.Vector3(), tan = new THREE.Vector3()
    leaves.forEach((l, i) => {
      const v = vines[l.vi], k = THREE.MathUtils.clamp((v.gv - l.t) * 9, 0, 1)
      v.curve.getPointAt(l.t, p); v.curve.getTangentAt(l.t, tan)
      o.position.copy(p)
      o.rotation.set(Math.sin(time * .8 + l.tw) * .25, Math.cos(l.tw) * .5, Math.atan2(tan.y, tan.x) - Math.PI / 2 + l.side * 1.05 + Math.sin(time + l.tw) * .06)
      o.scale.setScalar(Math.max(.0001, l.s * (k * k * (3 - 2 * k))))
      o.updateMatrix(); lm.current.setMatrixAt(i, o.matrix)
    })
    lm.current.instanceMatrix.needsUpdate = true
    buds.forEach((b, i) => {
      const v = vines[b.vi], k = THREE.MathUtils.clamp((v.gv - b.t + .02) * 12, 0, 1)
      v.curve.getPointAt(Math.min(b.t, .999), p)
      o.position.copy(p); o.rotation.set(0, 0, 0)
      o.scale.setScalar(Math.max(.0001, (b.t === 1 ? .1 : .065) * k * (1 + Math.sin(time * 2 + i) * .06)))
      o.updateMatrix(); bm.current.setMatrixAt(i, o.matrix)
    })
    bm.current.instanceMatrix.needsUpdate = true
    g.current.rotation.y = THREE.MathUtils.lerp(g.current.rotation.y, st.pointer.x * .12, .05)
    g.current.rotation.x = THREE.MathUtils.lerp(g.current.rotation.x, -st.pointer.y * .08, .05)
  })
  return (
    <group ref={g}>
      {vines.map((v, i) => <mesh key={i} geometry={v.geo} material={stemMat} />)}
      <instancedMesh ref={lm} args={[leafGeo, leafMat, leaves.length]} />
      <instancedMesh ref={bm} args={[null, budMat, buds.length]}><sphereGeometry args={[1, 18, 14]} /></instancedMesh>
    </group>
  )
}

function Particles({ season }) {
  const { viewport, size } = useThree()
  const mob = size.width < 768
  const kind = season.kind
  const N = kind === 'snow' ? (mob ? 70 : 140) : (mob ? 28 : 56)
  const geo = useMemo(() => {
    if (kind === 'snow') return new THREE.SphereGeometry(1, 8, 6)
    if (kind === 'leaf') return new THREE.ShapeGeometry(leafShape(1, .5), 5).translate(0, -.5, 0)
    return new THREE.ShapeGeometry(petalShape(), 6)
  }, [kind])
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ roughness: .6, side: THREE.DoubleSide }), [])
  const m = useRef()
  const o = useMemo(() => new THREE.Object3D(), [])
  const data = useMemo(() => Array.from({ length: N }, () => ({
    x: (Math.random() - .5) * viewport.width * 1.2, y: (Math.random() - .5) * viewport.height * 1.4, z: (Math.random() - .5) * 3,
    v: kind === 'snow' ? .25 + Math.random() * .35 : .35 + Math.random() * .5, ph: Math.random() * 6.28, rs: (Math.random() - .5) * 3,
    s: kind === 'snow' ? .025 + Math.random() * .04 : kind === 'leaf' ? .14 + Math.random() * .12 : .09 + Math.random() * .08, vx: 0,
  })), [N, kind, viewport.width, viewport.height])
  useEffect(() => {
    const c = new THREE.Color()
    data.forEach((d, i) => { c.set(season.part[i % season.part.length]); m.current.setColorAt(i, c) })
    if (m.current.instanceColor) m.current.instanceColor.needsUpdate = true
  }, [data, season])
  useEffect(() => () => geo.dispose(), [geo])
  useFrame((st, dt) => {
    dt = Math.min(dt, .05)
    const t = st.clock.elapsedTime, h = viewport.height / 2 + .6, w = viewport.width / 2 + .6
    const px = st.pointer.x * viewport.width / 2, py = st.pointer.y * viewport.height / 2
    data.forEach((d, i) => {
      const dx = d.x - px, dy = d.y - py, dist = Math.hypot(dx, dy)
      if (dist < 1.2) d.vx += dx / (dist + .01) * (1.2 - dist) * dt * 6
      d.vx *= .95
      d.y -= d.v * dt
      d.x += (Math.sin(t * .9 + d.ph) * .35 + .12) * dt + d.vx * dt
      if (d.y < -h) { d.y = h; d.x = (Math.random() - .5) * w * 2 }
      if (d.x > w) d.x = -w; if (d.x < -w) d.x = w
      o.position.set(d.x, d.y, d.z)
      o.rotation.set(t * d.rs * .5 + d.ph, t * d.rs * .3, Math.sin(t + d.ph) * 1.2)
      o.scale.setScalar(d.s)
      o.updateMatrix(); m.current.setMatrixAt(i, o.matrix)
    })
    m.current.instanceMatrix.needsUpdate = true
  })
  return <instancedMesh key={kind + N} ref={m} args={[geo, mat, N]} />
}

export default function Garden({ grow, season }) {
  return (
    <Canvas dpr={[1, 1.6]} camera={{ position: [0, 0, 9], fov: 42 }} gl={{ antialias: true, alpha: true }} style={{ pointerEvents: 'none' }}>
      <ambientLight intensity={.7} />
      <directionalLight position={[3, 5, 6]} intensity={1.3} />
      <Vines grow={grow} season={season} />
      <Particles season={season} />
      <Environment resolution={128}>
        <color attach="background" args={['#dfe3d6']} />
        <Lightformer form="rect" intensity={2.5} position={[0, 5, 2]} scale={[10, 3, 1]} />
        <Lightformer form="rect" intensity={1.5} position={[-5, 0, 2]} rotation-y={Math.PI / 2} scale={[8, 3, 1]} color="#ffe9d6" />
      </Environment>
    </Canvas>
  )
}
