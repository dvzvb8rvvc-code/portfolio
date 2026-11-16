import React, { useRef, useMemo, useEffect } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, RoundedBox, ContactShadows } from '@react-three/drei'

/* generic premium SUV in "service view": panels lift away chapter by chapter.
   no badges, no logos — pure primitives. */
const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }
const win = (c, i) => ss(i - .6, i - .15, c) * (1 - ss(i + .3, i + .7, c))
const dmp = THREE.MathUtils.damp
const BRASS = '#b48a4f'
const C0 = new THREE.Color('#7d8781'), C1 = new THREE.Color('#2c4538')

// camera keyframes per chapter: [pos, target]
const KF = [
  [[8.6, 2.8, 8.8], [0, 1.0, 0]],
  [[6.2, 5.8, 3.9], [1.3, 1.0, 0]],
  [[1.2, 1.6, 10.2], [0, 1.25, 0]],
  [[-4.8, 7.8, 5.6], [-.2, 1.1, 0]],
  [[-7.8, 2.1, 7.0], [0, .95, 0]],
]

function pulseMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { t: { value: 0 }, on: { value: 0 }, c: { value: new THREE.Color('#e7b46a') }, base: { value: new THREE.Color('#2b2a27') } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
    fragmentShader: `uniform float t; uniform float on; uniform vec3 c; uniform vec3 base; varying vec2 vUv;
      void main(){ float k = smoothstep(.82,1.,fract(vUv.x*4.-t)); vec3 col = mix(base, c*(.7+k*2.2), on*(.35+k*.65)); gl_FragColor = vec4(col,1.);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
      }`,
  })
}

function Wheel({ position }) {
  const side = Math.sign(position[2])
  return (
    <group position={position}>
      <mesh><torusGeometry args={[.36, .15, 16, 40]} /><meshStandardMaterial color="#141414" roughness={.85} /></mesh>
      <mesh rotation-x={Math.PI / 2}><cylinderGeometry args={[.3, .3, .26, 36]} /><meshStandardMaterial color="#b9bec4" metalness={1} roughness={.32} /></mesh>
      {[0, 1, 2, 3, 4, 5].map(i => <mesh key={i} position-z={side * .135} rotation-z={i / 6 * Math.PI * 2}><boxGeometry args={[.05, .52, .02]} /><meshStandardMaterial color="#c5cad0" metalness={1} roughness={.2} /></mesh>)}
      <mesh position-z={-side * .05} rotation-x={Math.PI / 2}><cylinderGeometry args={[.24, .24, .03, 32]} /><meshStandardMaterial color="#55595e" metalness={.9} roughness={.4} /></mesh>
    </group>
  )
}

function AirSpring({ position, mat }) {
  return (
    <group position={position}>
      {[0, 1, 2].map(i => <mesh key={i} position-y={i * .11} rotation-x={Math.PI / 2} material={mat}><torusGeometry args={[.11, .055, 12, 28]} /></mesh>)}
      <mesh position-y={.3}><cylinderGeometry args={[.15, .15, .05, 28]} /><meshStandardMaterial color="#3a3d40" metalness={.8} roughness={.35} /></mesh>
      <mesh position-y={-.12}><cylinderGeometry args={[.035, .035, .25, 12]} /><meshStandardMaterial color="#8d9297" metalness={1} roughness={.3} /></mesh>
    </group>
  )
}

function Car({ p }) {
  const { size, camera } = useThree()
  const mob = size.width < 768
  const body = useRef(), hood = useRef(), roof = useRef(), doorL = useRef(), doorR = useRef(), engine = useRef(), tail = useRef()
  const paint = useRef(), glow = useRef()
  const off = useRef(-1)
  const look = useRef(new THREE.Vector3(0, 1, 0))
  const pulse = useMemo(pulseMaterial, [])
  const springMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#2a2a2a', roughness: .6, emissive: new THREE.Color(BRASS), emissiveIntensity: 0 }), [])
  const harness = useMemo(() => {
    const a = new THREE.CatmullRomCurve3([[2.05, .95, .5], [1.4, .8, .62], [.6, .76, .66], [-.4, .76, .66], [-1.4, .8, .6], [-2.0, 1.05, .3], [-2.0, 1.1, -.3], [-1.3, .8, -.6], [.2, .76, -.66], [1.4, .8, -.6], [2.05, .95, -.45]].map(v => new THREE.Vector3(...v)))
    const b2 = new THREE.CatmullRomCurve3([[1.15, .95, 0], [.6, 1.0, .1], [0, .8, 0], [-.8, .85, -.05], [-1.6, 1.0, 0]].map(v => new THREE.Vector3(...v)))
    return [new THREE.TubeGeometry(a, 140, .028, 8, false), new THREE.TubeGeometry(b2, 80, .024, 8, false)]
  }, [])

  useEffect(() => () => { pulse.dispose(); springMat.dispose() }, [])

  useFrame((st, dt) => {
    const c = Math.min(4, Math.max(0, p.get() * 4.6 - .15))
    const w1 = win(c, 1), w2 = win(c, 2), w3 = win(c, 3), w4 = ss(3.45, 3.95, c)
    // panels
    hood.current.position.y = dmp(hood.current.position.y, 1.38 + w1 * 1.35, 6, dt)
    hood.current.position.x = dmp(hood.current.position.x, 1.5 + w1 * .35, 6, dt)
    hood.current.rotation.z = dmp(hood.current.rotation.z, -.04 + w1 * .34, 6, dt)
    body.current.position.y = dmp(body.current.position.y, w2 * 1.15, 5, dt)
    roof.current.position.y = dmp(roof.current.position.y, 1.9 + w3 * 1.25, 6, dt)
    tail.current.position.x = dmp(tail.current.position.x, -2.28 - w3 * .6, 6, dt)
    doorL.current.position.z = dmp(doorL.current.position.z, .93 + w3 * 1.0, 6, dt)
    doorR.current.position.z = dmp(doorR.current.position.z, -.93 - w3 * 1.0, 6, dt)
    // highlight materials
    engine.current.emissiveIntensity = dmp(engine.current.emissiveIntensity, w1 * .55, 5, dt)
    springMat.emissiveIntensity = dmp(springMat.emissiveIntensity, w2 * 1.1, 5, dt)
    pulse.uniforms.t.value += dt * (0.4 + w3 * 1.2)
    pulse.uniforms.on.value = dmp(pulse.uniforms.on.value, w3, 5, dt)
    if (glow.current) glow.current.intensity = dmp(glow.current.intensity, w1 * 6 + w3 * 4, 5, dt)
    // paint: dusty -> deep gloss in the detailing chapter
    const m = paint.current
    m.roughness = dmp(m.roughness, .5 - w4 * .42, 4, dt)
    m.clearcoat = dmp(m.clearcoat, .2 + w4 * .8, 4, dt)
    m.color.lerpColors(C0, C1, w4)
    // camera
    const i0 = Math.floor(c), i1 = Math.min(4, i0 + 1), f = ss(0, 1, c - i0)
    const A = KF[i0], B = KF[i1]
    const k = mob ? 1.55 + .45 * (1 - ss(0, .8, c)) : 1
    const tx = A[1][0] + (B[1][0] - A[1][0]) * f, ty = A[1][1] + (B[1][1] - A[1][1]) * f - (mob ? .95 + 1.35 * (1 - ss(0, .8, c)) : 0), tz = A[1][2] + (B[1][2] - A[1][2]) * f
    const px = (A[0][0] + (B[0][0] - A[0][0]) * f) * k + st.pointer.x * .5, py = (A[0][1] + (B[0][1] - A[0][1]) * f) * (mob ? 1.15 : 1) + st.pointer.y * .3, pz = (A[0][2] + (B[0][2] - A[0][2]) * f) * k
    camera.position.set(dmp(camera.position.x, px, 3, dt), dmp(camera.position.y, py, 3, dt), dmp(camera.position.z, pz, 3, dt))
    look.current.set(dmp(look.current.x, tx, 3, dt), dmp(look.current.y, ty, 3, dt), dmp(look.current.z, tz, 3, dt))
    camera.lookAt(look.current)
    if (mob) { const oy = Math.round(size.height * .2 * (1 - ss(0, .8, c))); if (oy !== off.current) { off.current = oy; camera.setViewOffset(size.width, size.height, 0, oy, size.width, size.height) } }
  })

  // view offset: push the car right on desktop so captions breathe on the left
  useEffect(() => {
    if (size.width >= 768) camera.setViewOffset(size.width, size.height, -size.width * .17, 0, size.width, size.height)
    else { camera.clearViewOffset(); off.current = -1 }
    camera.updateProjectionMatrix()
  }, [size.width, size.height])

  const glass = <meshStandardMaterial color="#1a2227" metalness={.8} roughness={.05} envMapIntensity={1.6} />
  const dark = <meshStandardMaterial color="#17191a" roughness={.55} metalness={.3} />
  const P = <meshPhysicalMaterial ref={paint} color="#7d8781" metalness={.55} roughness={.5} clearcoat={.2} clearcoatRoughness={.06} envMapIntensity={1.2} />
  return (
    <group position-y={0}>
      {/* chassis: stays on the ground */}
      {[-1.5, 1.5].map(x => [-.82, .82].map(z => <Wheel key={x + '' + z} position={[x, .5, z]} />))}
      {[-.5, .5].map(z => <mesh key={z} position={[0, .58, z]}><boxGeometry args={[4.2, .12, .1]} /><meshStandardMaterial color="#2a2c2e" metalness={.7} roughness={.5} /></mesh>)}
      {[-1.5, -.4, .6, 1.5].map(x => <mesh key={x} position={[x, .58, 0]}><boxGeometry args={[.08, .1, 1.0]} /><meshStandardMaterial color="#2a2c2e" metalness={.7} roughness={.5} /></mesh>)}
      {[-1.5, 1.5].map(x => [-.55, .55].map(z => <AirSpring key={x + 'a' + z} position={[x, .72, z]} mat={springMat} />))}
      <mesh position={[0, .7, 0]}><boxGeometry args={[4.1, .06, 1.7]} /><meshStandardMaterial color="#1e2022" roughness={.8} /></mesh>
      {/* engine */}
      <group position={[1.5, .98, 0]}>
        <RoundedBox args={[.95, .42, .8]} radius={.05}><meshStandardMaterial ref={engine} color="#5e6266" metalness={.85} roughness={.35} emissive={BRASS} emissiveIntensity={0} /></RoundedBox>
        <RoundedBox args={[.85, .14, .62]} radius={.05} position-y={.27}><meshStandardMaterial color="#1b1c1d" roughness={.4} metalness={.4} /></RoundedBox>
        {[-.28, 0, .28].map(x => <mesh key={x} position={[x, .38, 0]}><cylinderGeometry args={[.06, .06, .08, 20]} /><meshStandardMaterial color={BRASS} metalness={.9} roughness={.25} /></mesh>)}
        <mesh position={[.15, .2, .48]} rotation-x={Math.PI / 2}><cylinderGeometry args={[.13, .13, .12, 28]} /><meshStandardMaterial color="#888c90" metalness={1} roughness={.3} /></mesh>
        <pointLight ref={glow} position={[0, .9, 0]} intensity={0} distance={3.5} color="#ffcf8a" />
      </group>
      {/* interior + harness */}
      {[[.3, .45], [.3, -.45], [-.75, .45], [-.75, -.45]].map(([x, z]) => <group key={x + '' + z} position={[x, .9, z]}><RoundedBox args={[.5, .2, .5]} radius={.06}><meshStandardMaterial color="#5a3b28" roughness={.6} /></RoundedBox><RoundedBox args={[.14, .6, .5]} radius={.06} position={[-.22, .35, 0]} rotation-z={.12}><meshStandardMaterial color="#5a3b28" roughness={.6} /></RoundedBox></group>)}
      <mesh geometry={harness[0]} material={pulse} />
      <mesh geometry={harness[1]} material={pulse} />
      {[[1.0, 1.0, .35], [-1.7, 1.05, .35], [.95, 1.12, -.4]].map((v, i) => <RoundedBox key={i} args={[.26, .08, .2]} radius={.02} position={v}><meshStandardMaterial color="#1d1f21" metalness={.5} roughness={.4} /></RoundedBox>)}

      {/* upper body: lifts in the suspension chapter */}
      <group ref={body}>
        <RoundedBox args={[.32, .62, 1.9]} radius={.1} position={[2.18, 1.0, 0]}>{P}</RoundedBox>
        <mesh position={[2.35, 1.07, 0]}><boxGeometry args={[.02, .16, 1.1]} />{dark}</mesh>
        {[-.66, .66].map(z => <mesh key={z} position={[2.345, 1.2, z]}><boxGeometry args={[.02, .07, .34]} /><meshStandardMaterial color="#fff" emissive="#fff6e8" emissiveIntensity={2} /></mesh>)}
        {[-.93, .93].map(z => <RoundedBox key={z} args={[1.35, .62, .08]} radius={.03} position={[1.45, 1.0, z]}>{P}</RoundedBox>)}
        {/* wheel-arch cladding */}
        {[-1.5, 1.5].map(x => [-.98, .98].map(z => <mesh key={x + 'c' + z} position={[x, .5, z]}><torusGeometry args={[.56, .055, 10, 32, Math.PI]} />{dark}</mesh>))}
        {/* rear section + quarter glass */}
        <RoundedBox args={[1.1, .62, 1.9]} radius={.08} position={[-1.75, 1.0, 0]}>{P}</RoundedBox>
        {[-.92, .92].map(z => <mesh key={z} position={[-1.7, 1.6, z]}><boxGeometry args={[.85, .5, .04]} />{glass}</mesh>)}
        <mesh position={[-1.7, 1.6, 0]}><boxGeometry args={[.8, .5, 1.8]} />{glass}</mesh>
        {/* pillars + windscreen */}
        {[-.88, .88].map(z => <mesh key={z} position={[.92, 1.6, z]} rotation-z={.62}><boxGeometry args={[.08, .62, .06]} />{dark}</mesh>)}
        <mesh position={[.88, 1.6, 0]} rotation-z={.62}><boxGeometry args={[.03, .62, 1.72]} />{glass}</mesh>
        {/* tailgate */}
        <group ref={tail} position={[-2.28, 0, 0]}>
          <RoundedBox args={[.08, 1.05, 1.78]} radius={.03} position-y={1.32}>{P}</RoundedBox>
          {[-.7, .7].map(z => <mesh key={z} position={[-.05, 1.12, z]}><boxGeometry args={[.02, .07, .3]} /><meshStandardMaterial color="#5a0d0d" emissive="#ff3b2f" emissiveIntensity={1.2} /></mesh>)}
        </group>
        {/* doors with glass */}
        <group ref={doorL} position={[0, 0, .93]}>
          <RoundedBox args={[2.2, .62, .07]} radius={.03} position={[-.13, 1.0, 0]}>{P}</RoundedBox>
          <mesh position={[-.13, 1.6, -.01]}><boxGeometry args={[2.1, .5, .03]} />{glass}</mesh>
          <mesh position={[-.13, 1.325, .03]}><boxGeometry args={[2.2, .025, .02]} /><meshStandardMaterial color="#d4d7da" metalness={1} roughness={.15} /></mesh>
          <mesh position={[-.13, .74, .03]}><boxGeometry args={[2.2, .12, .02]} /><meshStandardMaterial color="#17191a" roughness={.6} /></mesh>
          {[-.7, .45].map(x => <mesh key={x} position={[x, 1.15, .045]}><boxGeometry args={[.22, .03, .02]} /><meshStandardMaterial color="#c9ccd0" metalness={1} roughness={.2} /></mesh>)}
        </group>
        <group ref={doorR} position={[0, 0, -.93]}>
          <RoundedBox args={[2.2, .62, .07]} radius={.03} position={[-.13, 1.0, 0]}>{P}</RoundedBox>
          <mesh position={[-.13, 1.6, .01]}><boxGeometry args={[2.1, .5, .03]} />{glass}</mesh>
          <mesh position={[-.13, 1.325, -.03]}><boxGeometry args={[2.2, .025, .02]} /><meshStandardMaterial color="#d4d7da" metalness={1} roughness={.15} /></mesh>
          <mesh position={[-.13, .74, -.03]}><boxGeometry args={[2.2, .12, .02]} /><meshStandardMaterial color="#17191a" roughness={.6} /></mesh>
        </group>
        {/* floating roof */}
        <group ref={roof} position={[0, 1.9, 0]}>
          <RoundedBox args={[3.15, .1, 1.86]} radius={.04} position-x={-.55}><meshPhysicalMaterial color="#121314" metalness={.6} roughness={.2} clearcoat={1} /></RoundedBox>
          {[-.8, .8].map(z => <mesh key={z} position={[-.55, .08, z]}><boxGeometry args={[2.6, .03, .04]} /><meshStandardMaterial color="#9ea3a8" metalness={1} roughness={.25} /></mesh>)}
        </group>
        {/* hood */}
        <group ref={hood} position={[1.5, 1.38, 0]}>
          <RoundedBox args={[1.4, .07, 1.86]} radius={.03}>{P}</RoundedBox>
        </group>
      </group>
    </group>
  )
}

function Pause({ on }) {
  const { invalidate } = useThree()
  useEffect(() => { if (on) invalidate() }, [on])
  return null
}

export default function Scene({ p, active = true }) {
  return (
    <Canvas frameloop={active ? 'always' : 'never'} dpr={[1, 1.6]} camera={{ position: [7.4, 2.5, 7.6], fov: 30 }} gl={{ antialias: true, alpha: true }}>
      <Pause on={active} />
      <ambientLight intensity={.25} />
      <directionalLight position={[4, 8, 5]} intensity={1.1} color="#fff3e2" />
      <Car p={p} />
      <ContactShadows position={[0, 0.005, 0]} opacity={.55} scale={12} blur={2.6} far={3} resolution={256} color="#0e1411" />
      <Environment resolution={256}>
        <color attach="background" args={['#151a17']} />
        <Lightformer form="rect" intensity={4} position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[12, 4, 1]} color="#fffaf0" />
        <Lightformer form="rect" intensity={2.5} position={[-7, 2, 2]} rotation-y={Math.PI / 2} scale={[10, 1.2, 1]} color="#f2e2c4" />
        <Lightformer form="rect" intensity={2} position={[7, 1.5, -2]} rotation-y={-Math.PI / 2} scale={[10, 1.2, 1]} color="#dfe8e2" />
        <Lightformer form="rect" intensity={1.5} position={[0, 1, 8]} scale={[12, .6, 1]} color="#ffffff" />
      </Environment>
    </Canvas>
  )
}
