import React, { useRef, useMemo, useEffect } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, RoundedBox, ContactShadows } from '@react-three/drei'

/* inline-4 engine from primitives: block with real bores, pistons on a turning crank,
   cams, timing belt, manifolds, ignition coils, and the electrical circuit. */
const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }
const win = (c, i) => ss(i - .6, i - .15, c) * (1 - ss(i + .3, i + .7, c))
const dmp = THREE.MathUtils.damp
const ACC = new THREE.Color('#ff4d17')
const XS = [-.96, -.32, .32, .96], PH = [0, Math.PI, Math.PI, 0]
const CY = -.85, THROW = .2, ROD = .95

const KF = [
  [[5.9, 3.2, 7.1], [0, .15, 0]],
  [[6.4, 4.4, 3.0], [.6, .7, 0]],
  [[4.2, 2.4, 10.4], [0, .9, 0]],
  [[-.8, 2.6, 8.0], [-.1, .1, .5]],
  [[-6.8, 3.4, 5.6], [0, .1, 0]],
]

function flowMat(stripes, base) {
  return new THREE.ShaderMaterial({
    uniforms: { t: { value: 0 }, on: { value: 0 }, n: { value: stripes }, c: { value: ACC.clone() }, base: { value: new THREE.Color(base) } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
    fragmentShader: `uniform float t; uniform float on; uniform float n; uniform vec3 c; uniform vec3 base; varying vec2 vUv;
      void main(){ float s = fract(vUv.x*n - t); float k = smoothstep(.0,.15,s)*smoothstep(.5,.3,s);
      vec3 col = mix(base*(.8+.4*k), c*(1.+k*2.), on*(.45+.55*k)); gl_FragColor = vec4(col,1.);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
      }`,
  })
}

function blockGeo() {
  const s = new THREE.Shape()
  s.moveTo(-1.3, -.55); s.lineTo(1.3, -.55); s.lineTo(1.3, .55); s.lineTo(-1.3, .55); s.lineTo(-1.3, -.55)
  XS.forEach(x => { const h = new THREE.Path(); h.absarc(x, 0, .27, 0, Math.PI * 2, true); s.holes.push(h) })
  const g = new THREE.ExtrudeGeometry(s, { depth: 1, bevelEnabled: true, bevelThickness: .02, bevelSize: .02, bevelSegments: 2, curveSegments: 32 })
  g.rotateX(-Math.PI / 2); g.translate(0, -.5, 0)
  return g
}
function tube(pts, r, seg = 80, closed = false) {
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p)), closed), seg, r, 6, closed)
}

const GROUPS = ['block', 'grm', 'cpg', 'ign', 'intake', 'elec']
const BASE = { block: '#a9afb6', grm: '#2a2c30', cpg: '#c7ccd2', ign: '#1d1f23', intake: '#8b9097', elec: '#3a3d42' }

function Engine({ p, focus }) {
  const { size, camera } = useThree()
  const mob = size.width < 768
  const crank = useRef(), camA = useRef(), camB = useRef(), head = useRef(), cover = useRef(), block = useRef(), skirt = useRef(), root = useRef()
  const pistons = useRef([]), rods = useRef([])
  const off = useRef(-1)
  const look = useRef(new THREE.Vector3(0, .2, 0))
  const theta = useRef(0)
  const geo = useMemo(() => ({
    block: blockGeo(),
    belt: tube([[1.42, -1.14, 0], [1.42, -1.05, .22], [1.42, -.8, .3], [1.42, .3, .5], [1.42, 1.0, .44], [1.42, 1.25, .36], [1.42, 1.31, .2], [1.42, 1.2, 0], [1.42, 1.31, -.2], [1.42, 1.25, -.36], [1.42, 1.0, -.44], [1.42, -.8, -.3], [1.42, -1.05, -.22]], .03, 160, true),
    wires: [
      tube([[0, -.35, 1.5], [-.5, -.6, 1.35], [-1.0, -.78, .98]], .035),
      tube([[1.2, -.15, .98], [.8, -.3, 1.35], [.25, -.35, 1.5]], .035),
      tube([[-.15, -.2, 1.5], [-.6, 1.2, 1.1], [-1.35, 1.62, .3], [-1.55, 1.2, -.6], [-1.6, .55, -1.05]], .03, 120),
      tube([[-1.6, .55, -1.05], [-1.5, 1.4, -.45], [-1.15, 1.52, .12], [1.1, 1.52, .12]], .03, 120),
    ],
    intake: [0, 1, 2, 3].map(i => tube([[XS[i], .72, -.55], [XS[i], .82, -.85], [XS[i] * .9, .5, -1.05], [XS[i] * .7, .2, -1.1]], .07, 30)),
    exhaust: [0, 1, 2, 3].map(i => tube([[XS[i], .7, .55], [XS[i], .62, .78], [XS[i] * .6, .2, .85], [0, -.2, .86]], .06, 30)),
  }), [])
  const mats = useMemo(() => {
    const m = {}
    GROUPS.forEach(k => { m[k] = new THREE.MeshStandardMaterial({ color: BASE[k], metalness: k === 'ign' || k === 'grm' ? .3 : k === 'block' ? .55 : .85, roughness: k === 'ign' ? .5 : k === 'block' ? .42 : .32, emissive: ACC, emissiveIntensity: 0, transparent: true }) })
    m.belt = flowMat(140, '#1a1b1e'); m.wire = flowMat(5, '#202226')
    return m
  }, [])
  useEffect(() => () => Object.values(mats).forEach(x => x.dispose()), [])

  useFrame((st, dt) => {
    const c = focus ? 0 : Math.min(4, Math.max(0, p.get() * 4.6 - .15))
    const F = focus || []
    const has = k => F.includes(k)
    let e1 = win(c, 1), e2 = win(c, 2), e3 = win(c, 3)
    if (focus) { e1 = has('grm') ? 1 : 0; e2 = has('cpg') ? .75 : 0; e3 = has('elec') || has('ign') ? 1 : 0 }
    // engine running
    theta.current += dt * (focus ? 2.2 : 1.6 + e2 * 1.2)
    const th = theta.current
    crank.current.rotation.x = th
    camA.current.rotation.x = th / 2; camB.current.rotation.x = th / 2 + .6
    XS.forEach((x, i) => {
      const a = th + PH[i], pz = THROW * Math.sin(a), py = CY + THROW * Math.cos(a)
      const pistY = py + Math.sqrt(ROD * ROD - pz * pz)
      pistons.current[i].position.y = pistY
      const r = rods.current[i]
      r.position.set(x, (py + pistY) / 2, pz / 2)
      r.rotation.x = Math.atan2(-pz, pistY - py)
    })
    // exploded view
    block.current.position.y = dmp(block.current.position.y, e2 * 1.25, 5, dt)
    head.current.position.y = dmp(head.current.position.y, e2 * 2.1 + e1 * .25, 5, dt)
    cover.current.position.y = dmp(cover.current.position.y, e1 * .85 + e2 * .45, 5, dt)
    skirt.current.position.y = dmp(skirt.current.position.y, -e2 * .7, 5, dt)
    // highlights
    const hi = { block: 0, grm: e1, cpg: e2, ign: e3, intake: focus && has('intake') ? 1 : 0, elec: e3 }
    GROUPS.forEach(k => {
      const m = mats[k]
      m.emissiveIntensity = dmp(m.emissiveIntensity, hi[k] * (k === 'cpg' || k === 'intake' ? .35 : .55), 5, dt)
      const op = focus && F.length && !has(k) && !(k === 'block' && has('cpg')) ? .16 : 1
      m.opacity = dmp(m.opacity, op, 5, dt); m.depthWrite = m.opacity > .9
    })
    mats.belt.uniforms.t.value = th * 2.2
    mats.belt.uniforms.on.value = dmp(mats.belt.uniforms.on.value, e1, 5, dt)
    mats.wire.uniforms.t.value += dt * 1.4
    mats.wire.uniforms.on.value = dmp(mats.wire.uniforms.on.value, e3, 5, dt)
    // camera
    if (focus) {
      root.current.rotation.y += dt * .18
      const k = mob ? 1.35 : 1
      camera.position.set(dmp(camera.position.x, 4.4 * k, 3, dt), dmp(camera.position.y, 3.0 * k + st.pointer.y * .3, 3, dt), dmp(camera.position.z, 5.4 * k, 3, dt))
      look.current.set(0, has('cpg') ? .6 : .2, 0); camera.lookAt(look.current)
      return
    }
    const i0 = Math.floor(c), i1 = Math.min(4, i0 + 1), f = ss(0, 1, c - i0)
    const A = KF[i0], B = KF[i1]
    const k = mob ? 1.45 + 1.0 * (1 - ss(0, .8, c)) + win(c, 2) * .25 : 1
    const lerp = (j, q) => A[j][q] + (B[j][q] - A[j][q]) * f
    camera.position.set(dmp(camera.position.x, lerp(0, 0) * k + st.pointer.x * .4, 3, dt), dmp(camera.position.y, lerp(0, 1) * k + st.pointer.y * .25, 3, dt), dmp(camera.position.z, lerp(0, 2) * k, 3, dt))
    look.current.set(dmp(look.current.x, lerp(1, 0), 3, dt), dmp(look.current.y, lerp(1, 1) - (mob ? 1.5 + 2.1 * (1 - ss(0, .8, c)) + win(c, 2) * .6 : 0), 3, dt), dmp(look.current.z, lerp(1, 2), 3, dt))
    camera.lookAt(look.current)
    if (mob) { const oy = Math.round(size.height * .2 * (1 - ss(0, .8, c))); if (oy !== off.current) { off.current = oy; camera.setViewOffset(size.width, size.height, 0, oy, size.width, size.height) } }
  })

  useEffect(() => {
    if (!focus && size.width >= 768) camera.setViewOffset(size.width, size.height, -size.width * .17, 0, size.width, size.height)
    else { camera.clearViewOffset(); off.current = -1 }
    camera.updateProjectionMatrix()
  }, [size.width, size.height])

  const steel = mats.cpg
  return (
    <group ref={root}>
      {/* crank + pistons + rods (stay in place) */}
      <group ref={crank} position-y={CY}>
        <mesh rotation-z={Math.PI / 2} material={steel}><cylinderGeometry args={[.07, .07, 2.95, 20]} /></mesh>
        {XS.map((x, i) => (
          <group key={i} rotation-x={PH[i]}>
            {[-.13, .13].map(o => <mesh key={o} position={[x + o, .08, 0]} material={steel}><boxGeometry args={[.06, .42, .26]} /></mesh>)}
            <mesh position={[x, THROW, 0]} rotation-z={Math.PI / 2} material={steel}><cylinderGeometry args={[.06, .06, .3, 16]} /></mesh>
          </group>
        ))}
        <mesh position-x={1.42} rotation-z={Math.PI / 2} material={mats.grm}><cylinderGeometry args={[.26, .26, .12, 36]} /></mesh>
        <mesh position-x={-1.5} rotation-z={Math.PI / 2} material={steel}><cylinderGeometry args={[.42, .42, .06, 40]} /></mesh>
      </group>
      {XS.map((x, i) => (
        <group key={i}>
          <group ref={el => (pistons.current[i] = el)} position={[x, 0, 0]}>
            <mesh material={steel}><cylinderGeometry args={[.25, .25, .3, 32]} /></mesh>
            {[.06, .1].map(y => <mesh key={y} position-y={y} rotation-x={Math.PI / 2}><torusGeometry args={[.252, .008, 6, 32]} /><meshStandardMaterial color="#56595e" metalness={1} roughness={.3} /></mesh>)}
          </group>
          <mesh ref={el => (rods.current[i] = el)} material={steel}><boxGeometry args={[.07, ROD, .1]} /></mesh>
        </group>
      ))}

      {/* block with bores */}
      <group ref={block}>
        <mesh geometry={geo.block} material={mats.block} />
        {/* alternator + starter + exhaust bolted to the block side */}
        <mesh position={[1.2, -.15, .8]} rotation-z={Math.PI / 2} material={mats.elec}><cylinderGeometry args={[.2, .2, .32, 28]} /></mesh>
        <mesh position={[-1.0, -.78, .8]} rotation-z={Math.PI / 2} material={mats.elec}><cylinderGeometry args={[.13, .13, .45, 24]} /></mesh>
      </group>
      <group ref={skirt}>
        <RoundedBox args={[2.6, .5, 1.1]} radius={.03} position-y={-.76} material={mats.block} />
        <RoundedBox args={[2.4, .32, .95]} radius={.08} position-y={-1.16}><meshStandardMaterial color="#2b2d31" metalness={.6} roughness={.45} /></RoundedBox>
      </group>

      {/* head + cams + manifolds + cover with coils */}
      <group ref={head}>
        <RoundedBox args={[2.6, .4, 1.1]} radius={.04} position-y={.72} material={mats.block} />
        <group ref={camA} position={[0, 1.04, .22]}>
          <mesh rotation-z={Math.PI / 2} material={mats.grm}><cylinderGeometry args={[.06, .06, 2.6, 16]} /></mesh>
          {XS.map(x => [-.1, .1].map(o => <mesh key={x + o} position={[x + o, .05, 0]} material={steel}><boxGeometry args={[.06, .16, .12]} /></mesh>))}
        </group>
        <group ref={camB} position={[0, 1.04, -.22]}>
          <mesh rotation-z={Math.PI / 2} material={mats.grm}><cylinderGeometry args={[.06, .06, 2.6, 16]} /></mesh>
          {XS.map(x => [-.1, .1].map(o => <mesh key={x + o} position={[x + o, .05, 0]} material={steel}><boxGeometry args={[.06, .16, .12]} /></mesh>))}
        </group>
        {[.22, -.22].map(z => <mesh key={z} position={[1.42, 1.04, z]} rotation-z={Math.PI / 2} material={mats.grm}><cylinderGeometry args={[.2, .2, .1, 32]} /></mesh>)}
        {geo.intake.map((g, i) => <mesh key={i} geometry={g} material={mats.intake} />)}
        <RoundedBox args={[2.4, .3, .3]} radius={.1} position={[0, .15, -1.12]} material={mats.intake} />
        <mesh position={[1.3, .15, -1.12]} rotation-z={Math.PI / 2} material={mats.intake}><cylinderGeometry args={[.13, .13, .25, 24]} /></mesh>
        {geo.exhaust.map((g, i) => <mesh key={i} geometry={g}><meshStandardMaterial color="#7a7f86" metalness={.8} roughness={.4} /></mesh>)}
        <group ref={cover}>
          <RoundedBox args={[2.5, .26, .98]} radius={.1} position-y={1.18}><meshStandardMaterial color="#17181b" metalness={.4} roughness={.35} /></RoundedBox>
          {XS.map(x => <mesh key={x} position={[x, 1.38, .12]} material={mats.ign}><cylinderGeometry args={[.07, .08, .2, 20]} /></mesh>)}
        </group>
      </group>

      {/* timing belt + tensioner (front) */}
      <mesh geometry={geo.belt} material={mats.belt} />
      <mesh position={[1.42, .3, .38]} rotation-z={Math.PI / 2} material={mats.grm}><cylinderGeometry args={[.1, .1, .1, 24]} /></mesh>

      {/* electrics: battery, ECU, circuit */}
      <RoundedBox args={[.62, .46, .36]} radius={.04} position={[0, -.45, 1.62]} material={mats.elec} />
      <mesh position={[-.18, -.17, 1.62]}><cylinderGeometry args={[.05, .05, .08, 16]} /><meshStandardMaterial color="#c62828" /></mesh>
      <RoundedBox args={[.5, .34, .1]} radius={.03} position={[-1.6, .55, -1.12]} material={mats.elec} />
      {geo.wires.map((g, i) => <mesh key={i} geometry={g} material={mats.wire} />)}
    </group>
  )
}

export default function Scene({ p, focus, active = true }) {
  return (
    <Canvas frameloop={active ? 'always' : 'never'} dpr={[1, 1.6]} camera={{ position: [4.8, 2.7, 5.8], fov: 32 }} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={.35} />
      <directionalLight position={[3, 6, 4]} intensity={1.2} />
      <Engine p={p} focus={focus} />
      <ContactShadows position={[0, -1.36, 0]} opacity={.45} scale={9} blur={2.4} far={2.5} resolution={256} color="#0d0f12" />
      <Environment resolution={256}>
        <color attach="background" args={['#202326']} />
        <Lightformer form="rect" intensity={4} position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[10, 3, 1]} />
        <Lightformer form="rect" intensity={2.5} position={[-6, 1, 2]} rotation-y={Math.PI / 2} scale={[8, 1, 1]} color="#e8eef5" />
        <Lightformer form="rect" intensity={2} position={[6, 1, -2]} rotation-y={-Math.PI / 2} scale={[8, 1, 1]} color="#ffffff" />
        <Lightformer form="ring" intensity={1.5} position={[2, 2, 7]} scale={2} color="#ffd2c0" />
      </Environment>
    </Canvas>
  )
}
