import React, { useMemo, useRef, useEffect } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'

/* champagne silk: vertex-shader waves, rings ripple away from the cursor */
const N_RIP = 8
const ptr = { x: 0, y: 0, moved: false }

const header = /* glsl */`
uniform float uTime, uScroll;
uniform vec3 uRip[${N_RIP}];
uniform vec2 uMouse; uniform float uHover;
float silk(vec2 p){
  float t = uTime * .45;
  float h = sin(p.x * .55 + t) * .32 + sin(p.y * .8 - t * 1.3 + p.x * .3) * .22 + sin((p.x + p.y) * 1.3 + t * 1.7) * .07;
  h += sin(p.x * .25 - t * .6) * (.5 + uScroll * 1.4);
  for (int i = 0; i < ${N_RIP}; i++) {
    vec3 r = uRip[i]; float age = uTime - r.z;
    if (age < 0. || age > 4.) continue;
    float d = distance(p, r.xy);
    float front = age * 2.6;
    h += sin((d - front) * 3.2) * exp(-abs(d - front) * 1.4) * exp(-age * .9) * .38;
  }
  float md = distance(p, uMouse);
  h -= exp(-md * md * .6) * .45 * uHover;
  return h;
}
`
function useSilkMaterial() {
  return useMemo(() => {
    const m = new THREE.MeshPhysicalMaterial({ color: '#e7cfa8', roughness: .34, metalness: .32, sheen: 1, sheenColor: new THREE.Color('#fff2dc'), sheenRoughness: .35, clearcoat: .35, clearcoatRoughness: .4, side: THREE.DoubleSide, envMapIntensity: 1.25 })
    m.userData.u = { uTime: { value: 0 }, uScroll: { value: 0 }, uMouse: { value: new THREE.Vector2(99, 99) }, uHover: { value: 0 }, uRip: { value: Array.from({ length: N_RIP }, () => new THREE.Vector3(0, 0, -99)) } }
    m.onBeforeCompile = sh => {
      Object.assign(sh.uniforms, m.userData.u)
      sh.vertexShader = header + sh.vertexShader
        .replace('#include <beginnormal_vertex>', `
          float e = .06; vec2 q = position.xy;
          float h0 = silk(q);
          vec3 dx = vec3(e, 0., silk(q + vec2(e, 0.)) - h0);
          vec3 dy = vec3(0., e, silk(q + vec2(0., e)) - h0);
          vec3 objectNormal = normalize(cross(dx, dy));
          #ifdef USE_TANGENT
            vec3 objectTangent = vec3(tangent.xyz);
          #endif`)
        .replace('#include <begin_vertex>', 'vec3 transformed = vec3(position.xy, h0);')
    }
    return m
  }, [])
}

function Silk() {
  const mesh = useRef()
  const mat = useSilkMaterial()
  const { size, camera } = useThree()
  const mob = size.width < 768
  const ray = useMemo(() => new THREE.Raycaster(), [])
  const nd = useMemo(() => new THREE.Vector2(), [])
  const last = useRef({ x: 0, y: 0, t: 0, idx: 0 })
  const seg = mob ? [80, 60] : [150, 100]
  useFrame((st, dt) => {
    const u = mat.userData.u, t = st.clock.elapsedTime
    u.uTime.value = t
    const sp = Math.min(1, window.scrollY / innerHeight)
    u.uScroll.value += (sp - u.uScroll.value) * .08
    mesh.current.rotation.x = -0.72 + u.uScroll.value * .3
    mesh.current.position.y = (mob ? -1.2 : -.6) + u.uScroll.value * 1.2
    if (ptr.moved) {
      nd.set(ptr.x, ptr.y); ray.setFromCamera(nd, camera)
      const hit = ray.intersectObject(mesh.current)[0]
      if (hit) {
        const lp = mesh.current.worldToLocal(hit.point.clone())
        u.uMouse.value.lerp(new THREE.Vector2(lp.x, lp.y), .25)
        u.uHover.value += (1 - u.uHover.value) * .08
        const L = last.current
        if (Math.hypot(lp.x - L.x, lp.y - L.y) > 1.1 && t - L.t > .12) {
          u.uRip.value[L.idx].set(lp.x, lp.y, t); L.idx = (L.idx + 1) % N_RIP; L.x = lp.x; L.y = lp.y; L.t = t
        }
      }
    } else u.uHover.value *= .96
    if (!ptr.moved && t - last.current.t > 3.2) { // idle: a slow breath ripple
      const L = last.current; u.uRip.value[L.idx].set((Math.random() - .5) * 8, (Math.random() - .5) * 4, t); L.idx = (L.idx + 1) % N_RIP; L.t = t
    }
  })
  return (
    <mesh ref={mesh} material={mat} rotation-x={-0.95} scale={mob ? .85 : 1}>
      <planeGeometry args={[18, 11, seg[0], seg[1]]} />
    </mesh>
  )
}

export default function Scene() {
  useEffect(() => {
    let to
    const m = e => { ptr.x = e.clientX / innerWidth * 2 - 1; ptr.y = -(e.clientY / innerHeight * 2 - 1); ptr.moved = true; clearTimeout(to); to = setTimeout(() => (ptr.moved = false), 1800) }
    addEventListener('pointermove', m, { passive: true }); addEventListener('pointerdown', m, { passive: true })
    return () => { removeEventListener('pointermove', m); removeEventListener('pointerdown', m) }
  }, [])
  return (
    <Canvas dpr={[1, 1.6]} camera={{ position: [0, 0, 9], fov: 42 }} gl={{ antialias: true, alpha: true }} style={{ pointerEvents: 'none' }}>
      <ambientLight intensity={.35} />
      <directionalLight position={[3, 6, 4]} intensity={1.1} color="#fff1e0" />
      <Silk />
      <Environment resolution={256}>
        <color attach="background" args={['#3a2433']} />
        <Lightformer form="rect" intensity={4} position={[0, 6, 2]} rotation-x={Math.PI / 2} scale={[14, 4, 1]} color="#fff4e6" />
        <Lightformer form="rect" intensity={2.6} position={[-6, 1, 2]} rotation-y={Math.PI / 2} scale={[10, 3, 1]} color="#f2b9a6" />
        <Lightformer form="rect" intensity={2.2} position={[6, 0, 3]} rotation-y={-Math.PI / 2} scale={[10, 3, 1]} color="#ffe2b8" />
        <Lightformer form="ring" intensity={3} position={[0, 2, 7]} scale={3} color="#ffffff" />
      </Environment>
    </Canvas>
  )
}
