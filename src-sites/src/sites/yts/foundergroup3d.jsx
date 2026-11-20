import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html, Environment, Lightformer } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'

/* YTS Group as a slow-turning constellation: root → 3 branches → 8 companies.
   Light pulses run down every edge; hovering a company in the list (hot ref) lights its path. */

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
// leaf index → branch index (0 architecture, 1 holdings, 2 project companies)
export const LEAF_BRANCH = [0, 1, 1, 2, 2, 2, 2, 2]

function layout() {
  const root = new THREE.Vector3(0, 1.75, 0)
  const br = [new THREE.Vector3(-2.3, .45, .5), new THREE.Vector3(-.2, .45, -.6), new THREE.Vector3(2.1, .45, .4)]
  const leaves = []
  leaves.push(new THREE.Vector3(-2.6, -1.05, 1.2))
  leaves.push(new THREE.Vector3(-1.05, -1.05, -.3), new THREE.Vector3(.35, -1.05, -1.25))
  for (let i = 0; i < 5; i++) { const a = -1.1 + i * .55; leaves.push(new THREE.Vector3(2.1 + Math.sin(a) * 1.55, -1.05 - (i % 2) * .35, .4 + Math.cos(a) * 1.25 - .6)) }
  return { root, br, leaves }
}

const edgeVS = /* glsl */`attribute float aT; varying float vT; void main(){ vT = aT; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`
const edgeFS = /* glsl */`
uniform float uT; uniform float uOff; uniform float uHot; uniform float uGrow; varying float vT;
void main(){
  if (vT > uGrow) discard;
  float ph = fract(uT * .45 - uOff);
  float pulse = exp(-pow((vT - ph) * 9., 2.));
  vec3 base = vec3(.55, .5, .44) * (.35 + uHot * .5);
  vec3 col = base + vec3(1., .66, .34) * pulse * (1.6 + uHot * 3.);
  gl_FragColor = vec4(col, .5 + pulse * .5);
}`
function Edge({ a, b, off, hot, idx, grow, delay }) {
  const geo = useMemo(() => {
    const m = a.clone().lerp(b, .5); m.y += .25
    const c = new THREE.CatmullRomCurve3([a, new THREE.Vector3(a.x, (a.y + b.y) / 2 + .1, a.z).lerp(m, .4), b])
    const n = 48, g = new THREE.TubeGeometry(c, n, .012, 5, false)
    const t = new Float32Array(g.attributes.position.count)
    for (let i = 0; i <= n; i++) for (let j = 0; j <= 5; j++) t[i * 6 + j] = i / n
    g.setAttribute('aT', new THREE.BufferAttribute(t, 1))
    return g
  }, [a, b])
  const u = useMemo(() => ({ uT: { value: 0 }, uOff: { value: off }, uHot: { value: 0 }, uGrow: { value: 0 } }), [off])
  useFrame((_, dt) => {
    u.uT.value += dt
    u.uHot.value = THREE.MathUtils.damp(u.uHot.value, idx(hot.current) ? 1 : 0, 6, dt)
    u.uGrow.value = THREE.MathUtils.damp(u.uGrow.value, clamp((grow.current - delay) * 2.2), 4, dt)
  })
  return <mesh geometry={geo}><shaderMaterial uniforms={u} vertexShader={edgeVS} fragmentShader={edgeFS} transparent depthWrite={false} toneMapped={false} /></mesh>
}

function Node({ p, r, hotTest, hot, label, kind, grow, delay }) {
  const m = useRef(), halo = useRef(), el = useRef()
  useFrame(({ clock }, dt) => {
    const h = hotTest(hot.current) ? 1 : 0
    const s = clamp((grow.current - delay) * 3)
    const k = THREE.MathUtils.damp(m.current.userData.k || 0, h, 6, dt); m.current.userData.k = k
    m.current.scale.setScalar(Math.max(.001, s * (1 + k * .35 + Math.sin(clock.elapsedTime * 2 + p.x) * .03)))
    m.current.material.emissiveIntensity = .25 + k * 3
    if (halo.current) { halo.current.scale.setScalar(Math.max(.001, s * (2.2 + k * 1.5))); halo.current.material.opacity = (.12 + k * .35) * s }
    if (el.current) { el.current.style.opacity = s; el.current.style.color = k > .5 ? '#e9a25c' : '' }
  })
  return (
    <group position={p}>
      <mesh ref={m}>
        <icosahedronGeometry args={[r, 3]} />
        <meshStandardMaterial color={kind === 'root' ? '#c3a15e' : '#d9d2c6'} emissive="#e08a45" emissiveIntensity={.25} metalness={.6} roughness={.25} />
      </mesh>
      <mesh ref={halo}>
        <circleGeometry args={[r, 32]} />
        <meshBasicMaterial color="#e9a25c" transparent opacity={.12} depthWrite={false} toneMapped={false} />
      </mesh>
      <Html position={[0, kind === 'leaf' ? -r - .08 : r + .12, 0]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
        <div ref={el} style={{ opacity: 0 }} className={`whitespace-nowrap text-center text-[#ece7df] transition-colors duration-500 ${kind === 'leaf' ? "pt-5 text-[11px] font-semibold tabular-nums tracking-[.12em] text-[#ece7df]/70" : kind === 'root' ? "-translate-y-3 font-['Instrument_Serif',serif] text-[24px] italic" : "-translate-y-3 text-[10px] font-semibold uppercase tracking-[.2em] text-[#c3a15e]"}`}>{label}</div>
      </Html>
    </group>
  )
}

function Tree({ hot, grow, labels, mobile }) {
  const L = useMemo(layout, [])
  const g = useRef()
  useFrame(({ pointer, clock }, dt) => {
    const target = Math.sin(clock.elapsedTime * .12) * .35 + pointer.x * .35
    g.current.rotation.y = THREE.MathUtils.damp(g.current.rotation.y, target, 2, dt)
    g.current.rotation.x = THREE.MathUtils.damp(g.current.rotation.x, -pointer.y * .08, 2, dt)
  })
  const isBranch = b => h => h >= 0 && LEAF_BRANCH[h] === b
  return (
    <group ref={g} scale={mobile ? .64 : 1}>
      <Node p={L.root} r={.16} kind="root" hot={hot} hotTest={h => h >= 0} label={labels.root} grow={grow} delay={0} />
      {L.br.map((b, i) => (
        <group key={i}>
          <Edge a={L.root} b={b} off={i * .15} hot={hot} idx={isBranch(i)} grow={grow} delay={.08} />
          <Node p={b} r={.1} kind="branch" hot={hot} hotTest={isBranch(i)} label={labels.branches[i]} grow={grow} delay={.3} />
        </group>
      ))}
      {L.leaves.map((p, i) => (
        <group key={i}>
          <Edge a={L.br[LEAF_BRANCH[i]]} b={p} off={.5 + i * .09} hot={hot} idx={h => h === i} grow={grow} delay={.45 + i * .03} />
          <Node p={p} r={.075} kind="leaf" hot={hot} hotTest={h => h === i} label={String(i + 1).padStart(2, '0')} grow={grow} delay={.75 + i * .04} />
        </group>
      ))}
    </group>
  )
}

export default function GroupScene({ hot, active, mobile, lite, labels, inView }) {
  const grow = useRef(0)
  return (
    <Canvas frameloop={active ? 'always' : 'never'} dpr={[1, mobile ? 1.3 : 1.5]} gl={{ antialias: true, alpha: true }}
      camera={{ fov: 36, position: [0, 1.1, 8.4], near: .1, far: 40 }} style={{ position: 'absolute', inset: 0 }}
      onCreated={({ gl, camera }) => { gl.setClearColor(0, 0); camera.lookAt(0, .2, 0) }}>
      <Grow grow={grow} inView={inView} />
      <ambientLight intensity={.3} />
      <directionalLight position={[3, 5, 4]} intensity={1.6} color="#ffd2a1" />
      <Environment resolution={32} frames={1}>
        <Lightformer form="rect" intensity={2} color="#ffcf9a" position={[-4, 3, 3]} scale={[6, 3, 1]} />
        <Lightformer form="rect" intensity={1} color="#7f9db0" position={[4, -2, 3]} scale={[6, 3, 1]} />
      </Environment>
      <Tree hot={hot} grow={grow} labels={labels} mobile={mobile} />
      {!lite && !mobile && (
        <EffectComposer multisampling={0} disableNormalPass>
          <Bloom mipmapBlur intensity={.8} luminanceThreshold={.9} luminanceSmoothing={.2} />
        </EffectComposer>
      )}
    </Canvas>
  )
}

function Grow({ grow, inView }) {
  useFrame((_, dt) => { if (inView.current) grow.current = Math.min(1.6, grow.current + dt * .55) })
  return null
}
