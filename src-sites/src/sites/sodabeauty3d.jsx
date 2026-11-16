import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, Edges, ContactShadows } from '@react-three/drei'

// chapter ranges + focus position on the spectrum (0 = red ... 1 = violet); must match sodabeauty.jsx
const RANGES = [[0.12, 0.33], [0.34, 0.55], [0.56, 0.77], [0.78, 0.98]]
const FOCUS = [0.56, 0.72, 0.13, 0.93]
const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }

/* plane bent into an arbitrary quad (smooth uv, no diagonal crease) */
function quad(a, b, c, d) { // a: start-top, b: start-bottom, c: end-top, d: end-bottom
  const g = new THREE.PlaneGeometry(1, 1, 48, 24)
  const pos = g.attributes.position, uv = g.attributes.uv
  for (let i = 0; i < pos.count; i++) {
    const u = uv.getX(i), v = 1 - uv.getY(i)
    const top = [a[0] + (c[0] - a[0]) * u, a[1] + (c[1] - a[1]) * u]
    const bot = [b[0] + (d[0] - b[0]) * u, b[1] + (d[1] - b[1]) * u]
    pos.setXYZ(i, top[0] + (bot[0] - top[0]) * v, top[1] + (bot[1] - top[1]) * v, 0)
    uv.setXY(i, u, v)
  }
  return g
}
const HSV = `vec3 hsv(float h,float s,float v){vec3 k=vec3(1.,2./3.,1./3.);vec3 p=abs(fract(vec3(h)+k)*6.-3.);return v*mix(vec3(1.),clamp(p-1.,0.,1.),s);}`
const VS = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`

function Spectrum({ progress }) {
  const fan = useRef(), mat = useRef()
  const geo = useMemo(() => quad([0, 0.05], [0, -0.05], [7.5, 0.5], [7.5, -2.3]), [])
  const uniforms = useMemo(() => ({ uFocus: { value: 0.5 }, uAmt: { value: 0 }, uTime: { value: 0 } }), [])
  useFrame((st, dt) => {
    const p = progress.get()
    const i = RANGES.findIndex(([a, b]) => p < b + 0.005)
    const f = FOCUS[Math.max(0, i === -1 ? 3 : i)]
    uniforms.uFocus.value += (f - uniforms.uFocus.value) * Math.min(1, dt * 4)
    uniforms.uAmt.value += ((p > 0.1 ? 1 : 0.15) - uniforms.uAmt.value) * Math.min(1, dt * 3)
    uniforms.uTime.value = st.clock.elapsedTime
    fan.current.rotation.z = Math.sin(p * Math.PI * 2) * 0.14 - 0.04
  })
  return (
    <group position={[0.43, 0.17, 0.01]}>
      <group ref={fan}>
        <mesh geometry={geo}>
          <shaderMaterial ref={mat} transparent depthWrite={false} side={THREE.DoubleSide} uniforms={uniforms} vertexShader={VS}
            fragmentShader={`varying vec2 vUv; uniform float uFocus, uAmt, uTime; ${HSV}
            void main(){
              float v = vUv.y, u = vUv.x;
              float edge = smoothstep(0., .07, v) * smoothstep(1., .93, v);
              float f = exp(-pow((v - uFocus) / .085, 2.)) * uAmt;
              float fall = pow(1. - u, .8) * smoothstep(0., .03, u);
              float sh = .92 + .08 * sin(u * 34. - uTime * 1.6 + v * 5.);
              vec3 c = hsv(v * .83, .55 + f * .3, 1.);
              float a = (.38 + f * .55) * edge * fall * sh;
              gl_FragColor = vec4(c, a);
            }`} />
        </mesh>
      </group>
    </group>
  )
}

function Beam() {
  const geo = useMemo(() => quad([-8, -0.92], [-8, -1.0], [-0.43, 0.24], [-0.43, 0.12]), [])
  const halo = useMemo(() => quad([-8, -0.7], [-8, -1.22], [-0.43, 0.42], [-0.43, -0.06]), [])
  const inner = useMemo(() => quad([-0.43, 0.24], [-0.43, 0.12], [0.43, 0.22], [0.43, 0.12]), [])
  const core = `varying vec2 vUv; uniform vec3 uC; uniform float uA; void main(){ float k = exp(-pow((vUv.y - .5) / .28, 2.)); float s = smoothstep(0., .25, vUv.x); gl_FragColor = vec4(uC, k * uA * s); }`
  return (
    <group position-z={-0.01}>
      <mesh geometry={halo}><shaderMaterial transparent depthWrite={false} uniforms={{ uC: { value: new THREE.Color('#9fb3c2') }, uA: { value: 0.28 } }} vertexShader={VS} fragmentShader={core} /></mesh>
      <mesh geometry={geo}><shaderMaterial transparent depthWrite={false} uniforms={{ uC: { value: new THREE.Color('#ffffff') }, uA: { value: 1 } }} vertexShader={VS} fragmentShader={core} /></mesh>
      <mesh geometry={inner} position-z={0.02}><shaderMaterial transparent depthWrite={false} uniforms={{ uC: { value: new THREE.Color('#ffffff') }, uA: { value: 0.9 } }} vertexShader={VS} fragmentShader={core.replace('smoothstep(0., .25, vUv.x)', '1.')} /></mesh>
    </group>
  )
}

function Prism({ progress }) {
  const g = useRef()
  useFrame(st => {
    const p = progress.get(), t = st.clock.elapsedTime
    g.current.rotation.z = Math.PI + p * (Math.PI * 2) / 3 + Math.sin(t * 0.5) * 0.02
    g.current.rotation.y = Math.sin(p * Math.PI * 2) * 0.35 + st.pointer.x * 0.12
    g.current.rotation.x = st.pointer.y * -0.08
  })
  return (
    <group ref={g}>
      <mesh rotation-x={Math.PI / 2} renderOrder={2}>
        <cylinderGeometry args={[1, 1, 1.5, 3, 1]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.42} roughness={0.04} metalness={0} clearcoat={1} clearcoatRoughness={0.02} envMapIntensity={2.4} side={THREE.DoubleSide} depthWrite={false} />
        <Edges threshold={20} color="#0d1620" transparent opacity={0.55} />
      </mesh>
    </group>
  )
}

function Rig({ children }) {
  const g = useRef()
  const { size } = useThree()
  useFrame(() => {
    const mob = size.width < 768
    g.current.position.set(mob ? -0.55 : 1.25, mob ? 1.15 : 0.3, 0)
    g.current.scale.setScalar(mob ? 0.62 : 1)
  })
  return <group ref={g}>{children}</group>
}

export default function PrismScene({ progress, active }) {
  return (
    <Canvas frameloop={active ? 'always' : 'never'} dpr={[1, 1.6]} camera={{ position: [0, 0, 8], fov: 35 }} gl={{ antialias: true, alpha: true }} style={{ pointerEvents: 'none' }}
      eventSource={typeof document !== 'undefined' ? document.getElementById('root') : undefined} eventPrefix="client">
      <Rig>
        <Beam />
        <Spectrum progress={progress} />
        <Prism progress={progress} />
        <ContactShadows position={[0, -1.7, 0]} scale={5} blur={3} far={2.5} opacity={0.18} color="#2b4a5c" resolution={256} />
      </Rig>
      <Environment resolution={128}>
        <color attach="background" args={['#dfe7ec']} />
        <Lightformer form="rect" intensity={4} position={[0, 4, 3]} rotation-x={-Math.PI / 4} scale={[8, 1, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={3} position={[-5, 0, 2]} rotation-y={Math.PI / 2} scale={[6, 0.6, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={2} position={[5, -1, 2]} rotation-y={-Math.PI / 2} scale={[6, 2, 1]} color="#ffd0f0" />
        <Lightformer form="rect" intensity={2} position={[0, -4, 2]} rotation-x={Math.PI / 2} scale={[6, 2, 1]} color="#b8f5ee" />
      </Environment>
    </Canvas>
  )
}
