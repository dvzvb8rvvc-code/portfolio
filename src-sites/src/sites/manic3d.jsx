import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'

const N = 120
const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }

/* resample a closed polyline into N points of equal arc length, starting at index 0 */
function resample(pts) {
  const L = [0]
  for (let i = 1; i <= pts.length; i++) { const a = pts[i - 1], b = pts[i % pts.length]; L.push(L[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1])) }
  const tot = L[L.length - 1], out = []
  let j = 0
  for (let k = 0; k < N; k++) {
    const d = (k / N) * tot
    while (L[j + 1] < d) j++
    const a = pts[j], b = pts[(j + 1) % pts.length], t = (d - L[j]) / (L[j + 1] - L[j] || 1)
    out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t])
  }
  return out
}
function triangle() {
  const v = [[0, 1.25], [1.0825, -0.625], [-1.0825, -0.625]], pts = []
  for (let s = 0; s < 3; s++) for (let i = 0; i < 100; i++) { const a = v[s], b = v[(s + 1) % 3], t = i / 100; pts.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]) }
  return resample(pts)
}
function nail() {
  const pts = []
  for (let i = 0; i < 600; i++) {
    const a = (i / 600) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a)
    const x = c > 0 ? 0.72 * s * (1 - 0.32 * Math.pow(c, 3)) : 0.72 * s
    const y = c > 0 ? 0.15 + 1.25 * c : 0.15 + 1.05 * c
    pts.push([x, y])
  }
  return resample(pts)
}
/* walls + fan caps with identical topology for both outlines → morph target */
function build(o, depth, curve) {
  const pos = []
  const z = (x, side) => side * depth / 2 - curve * x * x
  const P = (x, y, side) => [x, y, z(x, side)]
  for (let i = 0; i < N; i++) {
    const a = o[i], b = o[(i + 1) % N]
    const a1 = P(a[0], a[1], 1), b1 = P(b[0], b[1], 1), a0 = P(a[0], a[1], -1), b0 = P(b[0], b[1], -1)
    pos.push(...a1, ...a0, ...b1, ...b1, ...a0, ...b0)
    pos.push(...P(0, 0, 1), ...a1, ...b1)
    pos.push(...P(0, 0, -1), ...b0, ...a0)
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.computeVertexNormals()
  return g
}
function ringPts(o, depth, curve, side) { return o.map(([x, y]) => new THREE.Vector3(x, y, side * depth / 2 - curve * x * x)) }

function Shape({ progress }) {
  const g = useRef(), mesh = useRef(), mat = useRef(), top = useRef(), bot = useRef(), spot = useRef()
  const { geo, ringA, ringB, ringA2, ringB2 } = useMemo(() => {
    const A = triangle(), B = nail()
    const ga = build(A, 0.7, 0), gb = build(B, 0.2, 0.28)
    ga.morphAttributes.position = [gb.attributes.position]
    ga.morphAttributes.normal = [gb.attributes.normal]
    return { geo: ga, ringA: ringPts(A, 0.7, 0, 1), ringB: ringPts(B, 0.2, 0.28, 1), ringA2: ringPts(A, 0.7, 0, -1), ringB2: ringPts(B, 0.2, 0.28, -1) }
  }, [])
  const lineGeo = useMemo(() => [new THREE.BufferGeometry().setFromPoints(ringA), new THREE.BufferGeometry().setFromPoints(ringA2)], [ringA, ringA2])
  const black = useMemo(() => new THREE.Color('#0b0b0b'), []), white = useMemo(() => new THREE.Color('#f4f4f4'), [])
  useFrame(st => {
    const p = progress.get(), t = st.clock.elapsedTime
    const m = ss(0.22, 0.5, p), coat = ss(0.5, 0.66, p)
    if (!mesh.current.morphTargetInfluences) mesh.current.updateMorphTargets()
    mesh.current.morphTargetInfluences[0] = m
    ;[[top, ringA, ringB, lineGeo[0]], [bot, ringA2, ringB2, lineGeo[1]]].forEach(([, ra, rb, lg]) => {
      const arr = lg.attributes.position.array
      for (let i = 0; i < N; i++) { arr[i * 3] = ra[i].x + (rb[i].x - ra[i].x) * m; arr[i * 3 + 1] = ra[i].y + (rb[i].y - ra[i].y) * m; arr[i * 3 + 2] = ra[i].z + (rb[i].z - ra[i].z) * m }
      lg.attributes.position.needsUpdate = true
    })
    mat.current.color.copy(white).lerp(black, coat)
    mat.current.roughness = 0.35 - coat * 0.3
    top.current.material.opacity = 0.9 - coat * 0.3
    bot.current.material.opacity = (0.35 - coat * 0.2) * (1 - m * 0.5)
    const spin = (1 - ss(0.1, 0.5, p)) * (t * 0.35) % (Math.PI * 2)
    g.current.rotation.y = Math.sin(spin) * 0.5 * (1 - m) + (m * 0.5 - 0.25) * Math.sin(t * 0.4) * 0.6 + st.pointer.x * 0.15
    g.current.rotation.x = -0.15 + m * 0.35 - st.pointer.y * 0.08
    g.current.rotation.z = Math.sin(t * 0.3) * 0.03
    const fin = ss(0.72, 0.95, p)
    g.current.scale.setScalar(1 + fin * 0.12)
    spot.current.position.set(-3 + ss(0.66, 0.95, p) * 6, 1.5, 3)
    spot.current.intensity = coat * 30
  })
  return (
    <group ref={g}>
      <mesh ref={mesh} geometry={geo} morphTargetInfluences={[0]}>
        <meshPhysicalMaterial ref={mat} color="#f4f4f4" roughness={0.35} metalness={0.05} clearcoat={1} clearcoatRoughness={0.05} envMapIntensity={1.4} flatShading={false} />
      </mesh>
      <lineLoop ref={top} geometry={lineGeo[0]}><lineBasicMaterial color="#ffffff" transparent opacity={0.9} /></lineLoop>
      <lineLoop ref={bot} geometry={lineGeo[1]}><lineBasicMaterial color="#ffffff" transparent opacity={0.35} /></lineLoop>
      <pointLight ref={spot} color="#ffffff" distance={9} intensity={0} />
    </group>
  )
}

function Rays({ progress }) {
  const u = useMemo(() => ({ uT: { value: 0 }, uA: { value: 0.4 } }), [])
  useFrame(st => { u.uT.value = st.clock.elapsedTime; u.uA.value = 0.35 + ss(0.5, 0.95, progress.get()) * 0.65 })
  return (
    <mesh position={[0, 0, -2]}>
      <planeGeometry args={[30, 30]} />
      <shaderMaterial transparent depthWrite={false} uniforms={u}
        vertexShader={`varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`}
        fragmentShader={`varying vec2 vP; uniform float uT, uA;
          float h(float n){ return fract(sin(n)*43758.5453); }
          void main(){
            vec2 p = vP - vec2(0., .2);
            float a = atan(p.y, p.x), r = length(p);
            float k = a * 9.5493; float i = floor(k), f = fract(k);
            float w = .25 + .5 * h(i);
            float ray = smoothstep(w, w - .18, abs(f - .5) * 2.) * (.35 + .65 * h(i + 7.));
            ray *= .6 + .4 * sin(uT * (.3 + h(i) * .6) + i);
            float fall = smoothstep(.9, 2.2, r) * exp(-r * .28);
            float glow = exp(-r * 1.1) * .35;
            float up = .55 + .45 * smoothstep(-1., 1., sin(a));
            gl_FragColor = vec4(vec3(1.), (ray * fall * up * .32 + glow) * uA);
          }`} />
    </mesh>
  )
}

function Rig({ children }) {
  const g = useRef()
  const { size } = useThree()
  useFrame(() => {
    const mob = size.width < 768
    g.current.position.set(0, mob ? 0.45 : -1.25, 0)
    g.current.scale.setScalar(mob ? 0.72 : 0.82)
  })
  return <group ref={g}>{children}</group>
}

export default function PrismScene({ progress, active }) {
  return (
    <Canvas frameloop={active ? 'always' : 'never'} dpr={[1, 1.6]} camera={{ position: [0, 0, 8], fov: 35 }} gl={{ antialias: true, alpha: true }} style={{ pointerEvents: 'none' }}
      eventSource={typeof document !== 'undefined' ? document.getElementById('root') : undefined} eventPrefix="client">
      <Rig>
        <Rays progress={progress} />
        <Shape progress={progress} />
      </Rig>
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={4} position={[0, 4, 3]} rotation-x={-Math.PI / 3} scale={[8, 1.2, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={2.5} position={[-5, 0, 2]} rotation-y={Math.PI / 2} scale={[6, 0.4, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={1.5} position={[5, 0, 1]} rotation-y={-Math.PI / 2} scale={[6, 2, 1]} color="#ffffff" />
      </Environment>
    </Canvas>
  )
}
