import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'

/* a journey from cold blue dawn to golden summer: sky shader + low-poly dunes + sea */
const cl = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const sm = (a, b, x) => { const t = cl((x - a) / (b - a)); return t * t * (3 - 2 * t) }
const C = s => new THREE.Color(s)
// palette keys at p = 0, .45, 1
const SKY_TOP = [C('#1f2c40'), C('#6e6a92'), C('#e0883e')]
const SKY_HOR = [C('#aebdcb'), C('#f1b49a'), C('#ffd79a')]
const GROUND = [C('#dfe7ee'), C('#d9b8a6'), C('#e2ac6c')]
const SEA = [C('#30475e'), C('#5f6f95'), C('#2f8d98')]
const SUN = [C('#e8eef5'), C('#ffc7a0'), C('#fff1c4')]
const tmp = new THREE.Color()
function pal(arr, p, out) { if (p < 0.45) return out.copy(arr[0]).lerp(arr[1], sm(0, 0.45, p)); return out.copy(arr[1]).lerp(arr[2], sm(0.45, 1, p)) }

function height(x, z) {
  const dunes = Math.sin(x * 0.18 + z * 0.07) * 1.1 + Math.sin(x * 0.41 - z * 0.23) * 0.45 + Math.cos(z * 0.31 + x * 0.05) * 0.6 + Math.sin(x * 1.3 + z * 0.9) * 0.08
  const valley = sm(1.5, 9, Math.abs(x)) // keep a path down the middle
  const shore = sm(-24, -8, z) // land dips under the sea far away
  return (dunes * 0.55 + valley * 1.6) * shore - (1 - shore) * 1.2 + 0.1
}

function Sky({ progress }) {
  const u = useMemo(() => ({ uTop: { value: new THREE.Color() }, uHor: { value: new THREE.Color() }, uSun: { value: new THREE.Color() }, uDir: { value: new THREE.Vector3(0, 0, -1) }, uGlow: { value: 0 } }), [])
  useFrame(() => {
    const p = progress.get()
    pal(SKY_TOP, p, u.uTop.value); pal(SKY_HOR, p, u.uHor.value); pal(SUN, p, u.uSun.value)
    const el = -0.06 + sm(0.15, 0.95, p) * 0.32
    u.uDir.value.set(0.08, el, -1).normalize()
    u.uGlow.value = 0.25 + sm(0.1, 0.9, p) * 0.9
  })
  return (
    <mesh scale={80}>
      <sphereGeometry args={[1, 32, 24]} />
      <shaderMaterial side={THREE.BackSide} depthWrite={false} fog={false} uniforms={u}
        vertexShader={`varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`}
        fragmentShader={`varying vec3 vD; uniform vec3 uTop, uHor, uSun, uDir; uniform float uGlow;
          void main(){
            float h = clamp(vD.y * 2.2, 0., 1.);
            vec3 c = mix(uHor, uTop, pow(h, .7));
            float d = max(dot(normalize(vD), uDir), 0.);
            c += uSun * (pow(d, 18.) * .55 * uGlow + pow(d, 600.) * 2.2 * uGlow);
            c = mix(c, uHor * 1.05, smoothstep(.06, -.05, vD.y));
            gl_FragColor = vec4(c, 1.);
          }`} />
    </mesh>
  )
}

function Land({ progress }) {
  const mat = useRef(), sea = useRef()
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(90, 70, 110, 86)
    g.rotateX(-Math.PI / 2)
    const pos = g.attributes.position
    for (let i = 0; i < pos.count; i++) pos.setY(i, height(pos.getX(i), pos.getZ(i) - 5))
    g.translate(0, 0, -5)
    const ng = g.toNonIndexed(); ng.computeVertexNormals(); return ng
  }, [])
  useFrame(() => { const p = progress.get(); pal(GROUND, p, mat.current.color); pal(SEA, p, sea.current.color) })
  return (
    <group>
      <mesh geometry={geo}><meshStandardMaterial ref={mat} flatShading roughness={0.95} /></mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.35, -40]}>
        <planeGeometry args={[200, 70, 1, 1]} />
        <meshStandardMaterial ref={sea} roughness={0.18} metalness={0.35} />
      </mesh>
    </group>
  )
}

function Snow({ progress }) {
  const ref = useRef()
  const N = 700
  const geo = useMemo(() => {
    const a = new Float32Array(N * 3)
    for (let i = 0; i < N; i++) { a[i * 3] = (Math.random() - 0.5) * 30; a[i * 3 + 1] = Math.random() * 10; a[i * 3 + 2] = Math.random() * -30 + 18 }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(a, 3)); return g
  }, [])
  useFrame((st, dt) => {
    const p = progress.get(), a = geo.attributes.position.array
    for (let i = 0; i < N; i++) { a[i * 3 + 1] -= dt * (0.6 + (i % 5) * 0.12); a[i * 3] += Math.sin(st.clock.elapsedTime + i) * dt * 0.2; if (a[i * 3 + 1] < -0.5) a[i * 3 + 1] = 9 }
    geo.attributes.position.needsUpdate = true
    ref.current.material.opacity = 0.85 * (1 - sm(0.22, 0.42, p))
    ref.current.visible = p < 0.45
  })
  return <points ref={ref} geometry={geo}><pointsMaterial color="#ffffff" size={0.06} transparent depthWrite={false} sizeAttenuation /></points>
}

function Rig({ progress }) {
  const { camera, scene, size } = useThree()
  const look = useMemo(() => new THREE.Vector3(), [])
  const hemi = useRef(), sun = useRef()
  useFrame(st => {
    const p = progress.get(), mob = size.width < 768
    const z = THREE.MathUtils.lerp(20, -1, sm(0, 1, p))
    const y = 2.4 + Math.sin(p * Math.PI) * 0.9 - sm(0.8, 1, p) * 0.6
    camera.position.set(Math.sin(p * 4) * 0.8 + st.pointer.x * 0.35, y + st.pointer.y * 0.15, z + (mob ? 4 : 0))
    look.set(Math.sin(p * 4 + 0.6) * 0.5, 1.4 + sm(0.2, 1, p) * 1.2, z - 20)
    camera.lookAt(look)
    pal(SKY_HOR, p, tmp)
    scene.fog.color.copy(tmp)
    scene.fog.near = 8 + p * 6; scene.fog.far = 55 + p * 20
    hemi.current.color.copy(pal(SKY_TOP, p, tmp)).lerp(C('#ffffff'), 0.4)
    hemi.current.groundColor.copy(pal(GROUND, p, tmp)).multiplyScalar(0.6)
    sun.current.color.copy(pal(SUN, p, tmp))
    sun.current.intensity = 0.6 + sm(0.1, 0.9, p) * 2.2
    sun.current.position.set(4, -1 + sm(0.15, 0.95, p) * 12, -40)
  })
  return (<>
    <hemisphereLight ref={hemi} intensity={0.9} />
    <directionalLight ref={sun} />
  </>)
}

export default function Journey({ progress, active }) {
  return (
    <Canvas frameloop={active ? 'always' : 'never'} dpr={[1, 1.5]} camera={{ position: [0, 2.4, 20], fov: 48, near: 0.1, far: 200 }} gl={{ antialias: true }} style={{ pointerEvents: 'none' }}
      eventSource={typeof document !== 'undefined' ? document.getElementById('root') : undefined} eventPrefix="client">
      <fog attach="fog" args={['#aebdcb', 8, 55]} />
      <Rig progress={progress} />
      <Sky progress={progress} />
      <Land progress={progress} />
      <Snow progress={progress} />
    </Canvas>
  )
}
