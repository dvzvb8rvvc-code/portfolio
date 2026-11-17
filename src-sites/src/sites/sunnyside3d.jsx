import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, ContactShadows } from '@react-three/drei'

// colour temperature keyframes (scroll progress -> colour); keep in sync with sunnyside.jsx
const SUN = [[0, '#ff9f8a'], [0.3, '#ffb48f'], [0.5, '#fff1c2'], [0.62, '#ffe7a0'], [0.8, '#ff9a3d'], [1, '#ff7f2a']]
const RING = [[0, '#e7a58f'], [0.5, '#e9d6a8'], [0.8, '#d98a3c'], [1, '#c9742c']]
const GLOW = [[0, '#ffc2b0'], [0.5, '#fff6d6'], [0.8, '#ffb35c'], [1, '#ff9440']]
const cache = new Map()
const C = h => { if (!cache.has(h)) cache.set(h, new THREE.Color(h)); return cache.get(h) }
const tmp = new THREE.Color()
function sample(keys, p, out) {
  if (p <= keys[0][0]) return out.copy(C(keys[0][1]))
  for (let i = 1; i < keys.length; i++) {
    if (p <= keys[i][0]) {
      const [a, ca] = keys[i - 1], [b, cb] = keys[i]
      return out.copy(C(ca)).lerp(C(cb), (p - a) / (b - a))
    }
  }
  return out.copy(C(keys[keys.length - 1][1]))
}
const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }

function Halo({ progress }) {
  const u = useMemo(() => ({ uC: { value: new THREE.Color('#fff') }, uA: { value: 0.6 } }), [])
  useFrame(() => {
    const p = progress.get()
    sample(GLOW, p, u.uC.value)
    u.uA.value = 0.45 + ss(0.35, 0.55, p) * 0.35 - ss(0.85, 1, p) * 0.1
  })
  return (
    <mesh position-z={-0.6} renderOrder={-1}>
      <planeGeometry args={[9, 9]} />
      <shaderMaterial transparent depthWrite={false} uniforms={u}
        vertexShader={`varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`}
        fragmentShader={`varying vec2 vUv; uniform vec3 uC; uniform float uA;
          void main(){ float d = length(vUv - .5) * 2.; float g = exp(-d * d * 5.5) ; gl_FragColor = vec4(uC, g * uA); }`} />
    </mesh>
  )
}

function Sun({ progress }) {
  const g = useRef(), sun = useRef(), ring = useRef(), ring2 = useRef(), bead = useRef(), tilt = useRef()
  useFrame((st, dt) => {
    const p = progress.get(), t = st.clock.elapsedTime
    // sunrise: from below the frame to centre, then a gentle descent into golden hour
    const rise = ss(0, 0.32, p)
    const set = ss(0.7, 1, p)
    g.current.position.y = -3.4 + rise * 3.25 - set * 0.15
    g.current.rotation.y = st.pointer.x * 0.15
    g.current.rotation.x = -st.pointer.y * 0.08
    sample(SUN, p, tmp)
    sun.current.material.color.copy(tmp)
    sun.current.material.emissive.copy(tmp)
    sun.current.material.emissiveIntensity = 0.28 + ss(0.35, 0.55, p) * 0.3 - set * 0.12
    sun.current.rotation.y = t * 0.15
    sample(RING, p, ring.current.material.color)
    ring2.current.material.color.copy(ring.current.material.color)
    // ring opens from edge-on to a wide orbit, then tilts for golden hour
    tilt.current.rotation.x = THREE.MathUtils.lerp(1.45, 1.1, ss(0.1, 0.45, p)) - ss(0.62, 0.9, p) * 0.35
    tilt.current.rotation.z = -0.32 + ss(0.45, 0.8, p) * 0.5
    ring.current.rotation.z = t * 0.12 + p * 4
    ring2.current.rotation.z = -t * 0.06 - p * 2
    const a = t * 0.5 + p * 9
    bead.current.position.set(Math.cos(a) * 1.75, Math.sin(a) * 1.75, 0)
  })
  return (
    <group ref={g}>
      <Halo progress={progress} />
      <mesh ref={sun}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshPhysicalMaterial color="#ffb48f" emissive="#ffb48f" emissiveIntensity={0.3} roughness={0.22} metalness={0.05} clearcoat={1} clearcoatRoughness={0.06} envMapIntensity={1.6} />
      </mesh>
      <group ref={tilt}>
        <mesh ref={ring}>
          <torusGeometry args={[1.75, 0.022, 16, 160]} />
          <meshStandardMaterial color="#e7a58f" metalness={1} roughness={0.18} envMapIntensity={1.8} />
        </mesh>
        <mesh ref={ring2}>
          <torusGeometry args={[2.25, 0.007, 8, 160]} />
          <meshStandardMaterial color="#e7a58f" metalness={1} roughness={0.3} transparent opacity={0.7} />
        </mesh>
        <mesh ref={bead}>
          <sphereGeometry args={[0.085, 24, 24]} />
          <meshPhysicalMaterial color="#fff8ee" roughness={0.1} clearcoat={1} envMapIntensity={2} />
        </mesh>
      </group>
    </group>
  )
}

function Rig({ children }) {
  const g = useRef()
  const { size } = useThree()
  useFrame(() => {
    const mob = size.width < 768
    g.current.position.set(0, mob ? 0.6 : 0.42, 0)
    g.current.scale.setScalar(mob ? 0.62 : 0.92)
  })
  return <group ref={g}>{children}</group>
}

export default function SunScene({ progress, active }) {
  return (
    <Canvas frameloop={active ? 'always' : 'never'} dpr={[1, 1.6]} camera={{ position: [0, 0, 8], fov: 35 }} gl={{ antialias: true, alpha: true }} style={{ pointerEvents: 'none' }}
      eventSource={typeof document !== 'undefined' ? document.getElementById('root') : undefined} eventPrefix="client">
      <Rig>
        <Sun progress={progress} />
        <ContactShadows position={[0, -2.6, 0]} scale={6} blur={3.2} far={4} opacity={0.12} color="#8a4a20" resolution={256} />
      </Rig>
      <Environment resolution={128}>
        <color attach="background" args={['#f3e2cf']} />
        <Lightformer form="rect" intensity={4} position={[0, 5, 3]} rotation-x={-Math.PI / 3} scale={[8, 1.2, 1]} color="#ffffff" />
        <Lightformer form="ring" intensity={2.5} position={[-4, 1, 3]} scale={2.4} color="#ffe2c4" />
        <Lightformer form="rect" intensity={2} position={[5, -1, 2]} rotation-y={-Math.PI / 2} scale={[6, 2, 1]} color="#ffc08a" />
        <Lightformer form="rect" intensity={1.5} position={[0, -5, 2]} rotation-x={Math.PI / 2} scale={[8, 2, 1]} color="#ffd9b8" />
      </Environment>
    </Canvas>
  )
}
