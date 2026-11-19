import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'

// chapter ranges — must match avtogavan.jsx
const R = [[0.16, 0.34], [0.36, 0.54], [0.56, 0.74], [0.76, 0.94]]
const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }
const BUOY = [-0.55, 0.75, 2.05, 3.35] // angles around the lighthouse (rad)
const NAVY = '#173a5e', WHITE = '#f4f0e8', SANDC = '#d9c9ad'

const beamVert = /* glsl */`
varying vec2 vUv; varying vec3 vN; varying vec3 vV;
void main(){ vUv = uv; vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position,1.0); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`
const beamFrag = /* glsl */`
uniform float uNight; varying vec2 vUv; varying vec3 vN; varying vec3 vV;
void main(){
  float along = pow(vUv.y, 2.2);
  float edge = pow(abs(dot(normalize(vN), normalize(vV))), 1.4);
  float a = along * edge * (0.18 + 0.62 * uNight);
  gl_FragColor = vec4(vec3(1.0, 0.86, 0.55) * a, a);
}`
const waterVert = /* glsl */`
varying vec2 vP; uniform float uTime;
void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`
const waterFrag = /* glsl */`
uniform float uTime, uNight; uniform vec3 cDay, cNight; varying vec2 vP;
void main(){
  float r = length(vP);
  float ring = smoothstep(0.92, 1.0, sin(r * 7.0 - uTime * 0.8) * 0.5 + 0.5) * smoothstep(9.0, 2.0, r);
  vec3 col = mix(cDay, cNight, uNight);
  col += ring * mix(0.05, 0.08, uNight);
  float fade = smoothstep(11.0, 5.0, r);
  gl_FragColor = vec4(col, fade);
}`

function Tower() {
  const segs = useMemo(() => {
    const out = [], n = 6, h = 2.5, r0 = 0.56, r1 = 0.34
    for (let i = 0; i < n; i++) {
      const y0 = (i / n) * h, y1 = ((i + 1) / n) * h
      const ra = r0 + (r1 - r0) * (i / n), rb = r0 + (r1 - r0) * ((i + 1) / n)
      out.push({ geo: new THREE.CylinderGeometry(rb, ra, y1 - y0, 40, 1), y: (y0 + y1) / 2, c: i % 2 ? NAVY : WHITE })
    }
    return out
  }, [])
  return (
    <group>
      {segs.map((s, i) => <mesh key={i} geometry={s.geo} position={[0, s.y, 0]}><meshStandardMaterial color={s.c} roughness={0.55} metalness={0.05} /></mesh>)}
      <mesh position={[0, 2.54, 0]}><cylinderGeometry args={[0.5, 0.5, 0.07, 40]} /><meshStandardMaterial color={NAVY} roughness={0.4} /></mesh>
      <mesh position={[0, 2.72, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.46, 0.012, 6, 40]} /><meshStandardMaterial color={NAVY} /></mesh>
      <mesh position={[0, 3.18, 0]}><coneGeometry args={[0.38, 0.36, 40]} /><meshStandardMaterial color={NAVY} roughness={0.35} metalness={0.2} /></mesh>
      <mesh position={[0, 3.4, 0]}><sphereGeometry args={[0.06, 16, 16]} /><meshStandardMaterial color={NAVY} /></mesh>
    </group>
  )
}

function Rocks() {
  const rocks = useMemo(() => Array.from({ length: 9 }, (_, i) => {
    const a = (i / 9) * Math.PI * 2 + (i % 2) * 0.3, d = 0.62 + (i % 3) * 0.12
    return { p: [Math.cos(a) * d, -0.05 + (i % 2) * 0.04, Math.sin(a) * d], s: 0.22 + ((i * 37) % 10) / 60, r: [i, i * 2, i * 0.5] }
  }), [])
  return rocks.map((r, i) => <mesh key={i} position={r.p} scale={r.s} rotation={r.r}><dodecahedronGeometry args={[1, 0]} /><meshStandardMaterial color={SANDC} roughness={0.9} flatShading /></mesh>)
}

function Buoy({ i, night, active }) {
  const ref = useRef(), mat = useRef()
  const a = BUOY[i], d = 3.2
  useFrame((s) => {
    const t = s.clock.elapsedTime
    ref.current.position.y = Math.sin(t * 1.2 + i) * 0.04
    ref.current.rotation.z = Math.sin(t * 0.9 + i * 2) * 0.08
    const on = active.current === i ? 1 : 0
    mat.current.emissiveIntensity += ((0.15 + on * 2.2) * (0.4 + night.current) - mat.current.emissiveIntensity) * 0.08
  })
  return (
    <group position={[Math.cos(a) * d, 0, Math.sin(a) * d]}>
      <group ref={ref}>
        <mesh position={[0, 0.09, 0]}><cylinderGeometry args={[0.07, 0.13, 0.22, 20]} /><meshStandardMaterial color={WHITE} roughness={0.5} /></mesh>
        <mesh position={[0, 0.25, 0]}><sphereGeometry args={[0.065, 20, 20]} /><meshStandardMaterial ref={mat} color="#ffd38a" emissive="#ffb648" emissiveIntensity={0.2} /></mesh>
      </group>
    </group>
  )
}

function Scene({ progress, mobile }) {
  const { size, camera } = useThree()
  const beam = useRef(), lantern = useRef(), grp = useRef()
  const night = useRef(0), active = useRef(-1), ang = useRef(0)
  const beamMat = useMemo(() => new THREE.ShaderMaterial({ vertexShader: beamVert, fragmentShader: beamFrag, uniforms: { uNight: { value: 0 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }), [])
  const waterMat = useMemo(() => new THREE.ShaderMaterial({ vertexShader: waterVert, fragmentShader: waterFrag, transparent: true, depthWrite: false, uniforms: { uTime: { value: 0 }, uNight: { value: 0 }, cDay: { value: new THREE.Color('#c9d6df') }, cNight: { value: new THREE.Color('#10283f') } } }), [])
  const beamGeo = useMemo(() => { const g = new THREE.ConeGeometry(0.85, 6, 32, 1, true); g.translate(0, -3, 0); g.rotateZ(Math.PI / 2); return g }, [])
  useFrame((s, dt) => {
    const p = progress.get(), t = s.clock.elapsedTime
    const n = 0.25 + 0.75 * ss(0.04, 0.3, p)
    night.current += (n - night.current) * Math.min(1, dt * 3)
    const ci = R.findIndex(([a, z]) => p >= a && p <= z + 0.02)
    active.current = ci
    if (ci < 0) ang.current += dt * 0.55
    else {
      let target = -BUOY[ci], d = target - ang.current
      d = Math.atan2(Math.sin(d), Math.cos(d))
      ang.current += d * Math.min(1, dt * 2.4)
    }
    beam.current.rotation.y = ang.current
    beamMat.uniforms.uNight.value = night.current
    waterMat.uniforms.uNight.value = night.current
    waterMat.uniforms.uTime.value = t
    lantern.current.emissiveIntensity = 0.6 + night.current * 2.4
    const asp = size.width / size.height
    const wide = asp > 1.1
    grp.current.scale.setScalar(mobile ? 0.82 : wide ? 1 : 0.85)
    grp.current.position.set(0, mobile ? -0.4 : -0.9, 0)
    const orbit = 0.6 + p * 0.9 + s.pointer.x * 0.06
    const dist = mobile ? 8.4 : 7.6
    camera.position.set(Math.sin(orbit) * dist, 2.6 + p * 0.8 + s.pointer.y * 0.15, Math.cos(orbit) * dist)
    camera.lookAt(0, mobile ? 0.9 : 0.8, 0)
  })
  return (
    <group ref={grp}>
      <Tower />
      <mesh position={[0, 2.9, 0]}><cylinderGeometry args={[0.28, 0.28, 0.4, 32]} /><meshStandardMaterial ref={lantern} color="#ffe2a8" emissive="#ffbf5a" emissiveIntensity={1} roughness={0.2} /></mesh>
      <group ref={beam} position={[0, 2.9, 0]}>
        <mesh geometry={beamGeo} material={beamMat} />
        <mesh geometry={beamGeo} material={beamMat} rotation={[0, Math.PI, 0]} />
      </group>
      <Rocks />
      {BUOY.map((_, i) => <Buoy key={i} i={i} night={night} active={active} />)}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} material={waterMat}><circleGeometry args={[11, 64]} /></mesh>
    </group>
  )
}

export default function HarbourScene({ progress, active, mobile }) {
  return (
    <Canvas frameloop={active ? 'always' : 'never'} dpr={[1, 1.6]} camera={{ position: [5, 3, 6], fov: 34 }} gl={{ antialias: true, alpha: true }} style={{ pointerEvents: 'none' }}>
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 6, 3]} intensity={1.2} />
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={2} position={[0, 5, 5]} scale={[10, 4, 1]} />
        <Lightformer form="rect" intensity={1} color="#ffd9a0" position={[-5, 2, -3]} scale={[6, 3, 1]} />
      </Environment>
      <Scene progress={progress} mobile={mobile} />
    </Canvas>
  )
}
