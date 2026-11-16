import React, { useMemo, useRef, useEffect } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { level } from './chillcity-audio'

/* low-poly dusk skyline: instanced boxes with shader-lit windows, gradient sky, day -> night on scroll, pulses to the lo-fi pad */
const ptr = { x: 0, y: 0 }
const night = () => Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * 1.5)))
const U = { uNight: { value: 0 }, uPulse: { value: 0 }, uTime: { value: 0 } }

const SKY_W = 300, SKY_H = 130
const skyFrag = /* glsl */`
uniform float uNight, uPulse, uTime; varying vec2 vUv;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
void main(){
  float n = uNight; vec2 p = vUv; float A = ${(SKY_W / SKY_H).toFixed(3)};
  float y = clamp((p.y - .1) / .9, 0., 1.);
  vec3 top = mix(vec3(.25,.12,.42), vec3(.025,.02,.075), n);
  vec3 mid = mix(vec3(.94,.46,.55), vec3(.13,.07,.27), n);
  vec3 hor = mix(vec3(1.,.8,.58), vec3(.36,.17,.44), n);
  vec3 c = mix(hor, mid, smoothstep(.0, .22, y));
  c = mix(c, top, smoothstep(.18, .7, y));
  vec2 sp = vec2((p.x - .5) * A, p.y - mix(.3, .02, n));
  float d = length(sp), r = .085;
  float disc = smoothstep(r, r - .003, d);
  float cut = mix(1., step(.0, sin(p.y * 260. - uTime * .6)), smoothstep(.0, -r * .9, sp.y));
  vec3 sunC = mix(vec3(1.,.88,.6), vec3(1.,.4,.56), smoothstep(r, -r, sp.y));
  c = mix(c, sunC, disc * cut * (1. - n * .7));
  c += vec3(1.,.55,.45) * exp(-d * 7.) * .45 * (1. - n);
  vec2 mp = vec2((p.x - .7) * A, p.y - .62); float md = length(mp);
  c = mix(c, vec3(.95,.93,1.), smoothstep(.032, .028, md) * smoothstep(.4, .9, n));
  c += vec3(.35,.5,.95) * exp(-md * 12.) * .35 * n;
  vec2 g = floor(p * vec2(A * 110., 110.)); float s = h(g);
  c += step(.9965, s) * smoothstep(.35, 1., n) * smoothstep(.15, .4, y) * (.55 + .45 * sin(uTime * 2. + s * 60.));
  c += vec3(.3,.1,.35) * uPulse * .18;
  gl_FragColor = vec4(c, 1.);
}`
const vUvVert = /* glsl */`varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`

const bVert = /* glsl */`
attribute float aR; varying vec3 vW; varying vec3 vN; varying float vR; varying float vD;
void main(){
  vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.);
  vW = wp.xyz; vN = normalize(mat3(modelMatrix * instanceMatrix) * normal); vR = aR;
  vec4 mv = viewMatrix * wp; vD = -mv.z;
  gl_Position = projectionMatrix * mv;
}`
const bFrag = /* glsl */`
uniform float uNight, uPulse, uTime; varying vec3 vW; varying vec3 vN; varying float vR; varying float vD;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
void main(){
  float n = uNight;
  vec3 day = mix(vec3(.34,.2,.42), vec3(.5,.3,.48), vR);
  vec3 nightC = mix(vec3(.05,.035,.1), vec3(.08,.05,.14), vR);
  vec3 col = mix(day, nightC, n);
  float side = 1. - step(.5, abs(vN.y));
  float facing = abs(vN.x) > .5 ? .8 : 1.;
  col *= facing;
  vec2 uv = abs(vN.x) > .5 ? vec2(vW.z, vW.y) : vec2(vW.x, vW.y);
  vec2 g = uv * vec2(2.4, 2.6); vec2 id = floor(g); vec2 f = fract(g);
  float win = step(.2, f.x) * step(f.x, .75) * step(.22, f.y) * step(f.y, .72);
  float rnd = h(id + vR * 91.7);
  float lit = step(mix(.8, .42, n), rnd) * win * side * step(.8, vW.y);
  vec3 warm = mix(vec3(1.,.7,.45), vec3(.35,1.,.92), step(.86, h(id * 1.7 + vR)));
  warm = mix(warm, vec3(1.,.5,.75), step(.94, h(id * 2.3 + vR * 3.)));
  float flick = .8 + .2 * sin(uTime * (.4 + rnd * 1.6) + rnd * 40.);
  float pulse = 1. + uPulse * (.5 + 1.6 * h(id + 3.1));
  col += warm * lit * (.3 + n * 1.15) * flick * pulse;
  col += vec3(1.,.62,.5) * (1. - n) * .22 * step(.5, vN.y);
  col += vec3(.3,1.,.9) * n * .12 * step(.5, vN.y) * (1. + uPulse * 2.);
  vec3 fogC = mix(vec3(1.,.66,.6), vec3(.2,.1,.33), n);
  col = mix(col, fogC, clamp((vD - 14.) / 70., 0., .78));
  gl_FragColor = vec4(col, 1.);
}`

function City({ count }) {
  const mesh = useRef()
  const { geo, mat } = useMemo(() => {
    const g = new THREE.BoxGeometry(1, 1, 1); g.translate(0, 0.5, 0)
    const m = new THREE.ShaderMaterial({ uniforms: U, vertexShader: bVert, fragmentShader: bFrag })
    return { geo: g, mat: m }
  }, [])
  useEffect(() => {
    const o = new THREE.Object3D(), r = new Float32Array(count)
    let seed = 7
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647
    for (let i = 0; i < count; i++) {
      const x = (rnd() - 0.5) * 100, depth = rnd() ** 0.8, z = -2 - depth * 52
      const center = 1 - Math.min(1, Math.abs(x) / 50)
      let h = 1.4 + rnd() ** 2.2 * 11 * (0.6 + center * 0.8) * (0.45 + depth * 0.9)
      if (rnd() > 0.96) h += 7
      o.position.set(x, 0, z)
      o.scale.set(1.4 + rnd() * 2.6, h, 1.4 + rnd() * 2.6)
      o.updateMatrix(); mesh.current.setMatrixAt(i, o.matrix); r[i] = rnd()
    }
    geo.setAttribute('aR', new THREE.InstancedBufferAttribute(r, 1))
    mesh.current.instanceMatrix.needsUpdate = true
  }, [count, geo])
  return <instancedMesh ref={mesh} args={[geo, mat, count]} frustumCulled={false} />
}

const DAYG = new THREE.Color('#5a3460'), NIGHTG = new THREE.Color('#0d0818')
function Ground() {
  const m = useRef()
  useFrame(() => m.current.color.copy(DAYG).lerp(NIGHTG, U.uNight.value))
  return <mesh rotation-x={-Math.PI / 2} position={[0, 0, -30]}><planeGeometry args={[300, 140]} /><meshBasicMaterial ref={m} /></mesh>
}

function Rig() {
  const { camera, size } = useThree()
  const mob = size.width < 768
  useFrame((st, dt) => {
    const t = st.clock.elapsedTime
    const n = night()
    U.uNight.value += (n - U.uNight.value) * Math.min(1, dt * 4)
    U.uTime.value = t
    U.uPulse.value += (level.v * 1.6 - U.uPulse.value) * 0.3
    const bx = Math.sin(t * 0.06) * 2.5 + ptr.x * 2.2
    const by = (mob ? 9 : 7) + ptr.y * 1.1 - n * 1.5
    camera.position.x += (bx - camera.position.x) * 0.04
    camera.position.y += (by - camera.position.y) * 0.04
    camera.position.z = mob ? 34 : 24
    camera.lookAt(camera.position.x * 0.3, mob ? 17 : 12, -30)
  })
  return null
}

export default function Scene({ active }) {
  useEffect(() => {
    const m = e => { ptr.x = e.clientX / innerWidth * 2 - 1; ptr.y = -(e.clientY / innerHeight * 2 - 1) }
    addEventListener('pointermove', m, { passive: true }); return () => removeEventListener('pointermove', m)
  }, [])
  const mob = typeof window !== 'undefined' && innerWidth < 768
  const skyMat = useMemo(() => new THREE.ShaderMaterial({ uniforms: U, vertexShader: vUvVert, fragmentShader: skyFrag, depthWrite: false }), [])
  return (
    <Canvas dpr={[1, 1.6]} frameloop={active ? 'always' : 'never'} camera={{ position: [0, 7, 24], fov: mob ? 52 : 42, far: 200 }} gl={{ antialias: !mob, alpha: false }} style={{ pointerEvents: 'none' }}>
      <mesh position={[0, 46, -80]} material={skyMat}><planeGeometry args={[SKY_W, SKY_H]} /></mesh>
      <Ground />
      <City count={mob ? 170 : 300} />
      <Rig />
    </Canvas>
  )
}
