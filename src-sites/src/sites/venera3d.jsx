import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'

// chapter ranges — must match venera.jsx
const R = [[0.16, 0.34], [0.36, 0.54], [0.56, 0.74], [0.76, 0.94]]

const planetVert = /* glsl */`
varying vec3 vN; varying vec3 vV; varying vec3 vP;
void main(){ vP = position; vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position,1.0); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`
const planetFrag = /* glsl */`
uniform float uTime; uniform vec3 cA, cB, cC;
varying vec3 vN; varying vec3 vV; varying vec3 vP;
void main(){
  float lat = vP.y;
  float band = sin(lat * 9.0 + sin(vP.x * 3.0 + uTime * 0.15) * 0.6) * 0.5 + 0.5;
  float band2 = sin(lat * 23.0 + vP.z * 2.0 - uTime * 0.1) * 0.5 + 0.5;
  vec3 col = mix(cA, cB, band * 0.55 + band2 * 0.15);
  vec3 N = normalize(vN); vec3 V = normalize(vV);
  vec3 L = normalize(vec3(-0.5, 0.7, 0.6));
  float dif = 0.55 + 0.45 * max(dot(N, L), 0.0);
  float fr = pow(1.0 - max(dot(N, V), 0.0), 2.6);
  vec3 irid = mix(cC, vec3(0.86, 0.8, 0.95), sin(fr * 6.0 + uTime * 0.2) * 0.5 + 0.5);
  vec3 H = normalize(L + V);
  float spec = pow(max(dot(N, H), 0.0), 60.0) * 0.35;
  col = col * dif + irid * fr * 0.7 + spec;
  gl_FragColor = vec4(col, 1.0);
}`
const ringVert = /* glsl */`
varying float vR; void main(){ vR = length(position.xy); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`
const ringFrag = /* glsl */`
uniform vec3 cR; varying float vR;
void main(){
  float t = (vR - 1.45) / 0.95;
  float bands = 0.55 + 0.45 * sin(t * 40.0) * sin(t * 13.0 + 1.0);
  float edge = smoothstep(0.0, 0.08, t) * smoothstep(1.0, 0.85, t);
  float gap = 1.0 - 0.8 * smoothstep(0.03, 0.0, abs(t - 0.62));
  float a = edge * gap * (0.35 + 0.4 * bands);
  gl_FragColor = vec4(cR, a * 0.85);
}`

function Stars({ count = 260 }) {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry(), p = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) { p[i * 3] = (Math.random() - 0.5) * 18; p[i * 3 + 1] = (Math.random() - 0.5) * 10; p[i * 3 + 2] = -3 - Math.random() * 4 }
    g.setAttribute('position', new THREE.BufferAttribute(p, 3)); return g
  }, [count])
  return <points geometry={geo}><pointsMaterial color="#b98d66" size={0.035} sizeAttenuation transparent opacity={0.7} depthWrite={false} /></points>
}

function Moon({ i, rot, act }) {
  const ref = useRef(), mat = useRef()
  const a = (i / 4) * Math.PI * 2
  useFrame(() => {
    const ang = a + rot.current, r = 2.75
    ref.current.position.set(Math.cos(ang) * r, 0, Math.sin(ang) * r)
    const on = act.current === i
    const s = ref.current.scale.x + ((on ? 1.7 : 1) - ref.current.scale.x) * 0.08
    ref.current.scale.setScalar(s)
    mat.current.emissiveIntensity += ((on ? 0.55 : 0.08) - mat.current.emissiveIntensity) * 0.08
  })
  return <mesh ref={ref}><sphereGeometry args={[0.1, 32, 32]} /><meshStandardMaterial ref={mat} color="#fbf3ee" emissive="#e9a9a6" emissiveIntensity={0.1} roughness={0.25} metalness={0.1} /></mesh>
}

function Planet({ progress, mobile }) {
  const { size } = useThree()
  const grp = useRef(), sphere = useRef(), orbit = useRef()
  const rot = useRef(0), act = useRef(-1)
  const pMat = useMemo(() => new THREE.ShaderMaterial({ vertexShader: planetVert, fragmentShader: planetFrag, uniforms: { uTime: { value: 0 }, cA: { value: new THREE.Color('#f6ebe7') }, cB: { value: new THREE.Color('#e3b3b2') }, cC: { value: new THREE.Color('#f2c9a8') } } }), [])
  const rMat = useMemo(() => new THREE.ShaderMaterial({ vertexShader: ringVert, fragmentShader: ringFrag, transparent: true, depthWrite: false, side: THREE.DoubleSide, uniforms: { cR: { value: new THREE.Color('#c99a8e') } } }), [])
  const orbitLine = useMemo(() => {
    const pts = []; for (let i = 0; i <= 128; i++) { const a = (i / 128) * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * 2.75, 0, Math.sin(a) * 2.75)) }
    return new THREE.BufferGeometry().setFromPoints(pts)
  }, [])
  useFrame((s, dt) => {
    const p = progress.get(), t = s.clock.elapsedTime
    pMat.uniforms.uTime.value = t
    sphere.current.rotation.y += dt * 0.08
    const ci = R.findIndex(([a, z]) => p >= a && p <= z + 0.02)
    act.current = ci
    if (ci < 0) rot.current += dt * 0.12
    else {
      const target = Math.PI / 2 - (ci / 4) * Math.PI * 2
      let d = target - rot.current; d = Math.atan2(Math.sin(d), Math.cos(d))
      rot.current += d * Math.min(1, dt * 2.2)
    }
    const wide = size.width / size.height > 1.1
    const x = mobile ? 0 : wide ? 1.75 - p * 0.35 : 0.6
    const y = mobile ? 0 : wide ? 0.35 : 0.6
    grp.current.position.x += (x - grp.current.position.x) * 0.1
    grp.current.position.y += (y + Math.sin(t * 0.5) * 0.05 - grp.current.position.y) * 0.1
    grp.current.scale.setScalar(mobile ? 0.62 : wide ? 0.95 + p * 0.1 : 0.75)
    grp.current.rotation.x = 0.32 + s.pointer.y * 0.05
    grp.current.rotation.z = -0.22 + s.pointer.x * 0.04
  })
  return (
    <group ref={grp}>
      <mesh ref={sphere} material={pMat}><sphereGeometry args={[1, 48, 48]} /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={rMat}><ringGeometry args={[1.45, 2.4, 128, 1]} /></mesh>
      <group ref={orbit}>
        <line geometry={orbitLine}><lineBasicMaterial color="#b98d66" transparent opacity={0.35} /></line>
        {[0, 1, 2, 3].map(i => <Moon key={i} i={i} rot={rot} act={act} />)}
      </group>
    </group>
  )
}

export default function VenusScene({ progress, active, mobile }) {
  return (
    <Canvas frameloop={active ? 'always' : 'never'} dpr={[1, 1.6]} camera={{ position: [0, 0, 7.5], fov: 35 }} gl={{ antialias: true, alpha: true }} style={{ pointerEvents: 'none' }}>
      <ambientLight intensity={0.8} />
      <directionalLight position={[-3, 4, 4]} intensity={1.3} />
      <Stars count={mobile ? 120 : 260} />
      <Planet progress={progress} mobile={mobile} />
    </Canvas>
  )
}
