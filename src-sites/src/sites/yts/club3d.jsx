import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'

/* Blue-hour sea. Water = analytic waves + up to 10 pointer ripples, shaded in the fragment shader
   (fresnel sky reflection, afterglow streak, mast-light streak). A minimal sloop glides with scroll. */

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const N = 10

const SKY = /* glsl */`
uniform float uNight; uniform vec3 uGlowDir;
vec3 sky(vec3 d){
  float h = clamp(d.y, -0.2, 1.);
  vec3 top = mix(vec3(.05,.1,.2), vec3(.02,.04,.09), uNight);
  vec3 hor = mix(vec3(.36,.47,.6), vec3(.12,.18,.3), uNight);
  vec3 c = mix(hor, top, pow(clamp(h * 2.2, 0., 1.), .6));
  float g = pow(max(dot(normalize(vec3(d.x, 0., d.z)), uGlowDir), 0.), 6.) * exp(-max(h, 0.) * 9.);
  c += vec3(1., .55, .3) * g * mix(.95, .35, uNight);
  c += vec3(.95, .6, .45) * exp(-abs(h) * 30.) * .12 * (1. - uNight * .6);
  return c;
}`

const skyVS = /* glsl */`varying vec3 vD; void main(){ vD = normalize(position); vec4 p = projectionMatrix * modelViewMatrix * vec4(position,1.); gl_Position = p.xyww; }`
const skyFS = /* glsl */`${SKY}
varying vec3 vD; void main(){ gl_FragColor = vec4(sky(normalize(vD)), 1.);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`

const waterVS = /* glsl */`varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position,1.); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`
const waterFS = /* glsl */`${SKY}
uniform float uT; uniform vec4 uRip[${N}]; uniform vec3 uBoat; uniform vec3 uCam;
varying vec3 vW;
float H(vec2 p){
  float h = 0.;
  h += sin(dot(p, vec2(.8,.6)) * 1.1 + uT * 1.1) * .05;
  h += sin(dot(p, vec2(-.5,.86)) * 1.9 + uT * 1.5) * .025;
  h += sin(dot(p, vec2(.95,-.3)) * 3.7 + uT * 2.3) * .012;
  h += sin(dot(p, vec2(.2,1.)) * 6.3 - uT * 2.9) * .006;
  h += sin(dot(p, vec2(-.9,.4)) * 11. + uT * 3.6) * .003;
  for (int i = 0; i < ${N}; i++){
    vec4 r = uRip[i]; float age = uT - r.z; if (age < 0. || age > 5.) continue;
    float d = length(p - r.xy); float front = age * 1.9;
    float env = exp(-pow((d - front) * 1.3, 2.)) * exp(-age * .7) * r.w;
    h += sin((d - front) * 9.) * env * .09;
  }
  return h;
}
void main(){
  vec2 p = vW.xz; float e = .03 + length(vW - uCam) * .004;
  float h = H(p);
  vec3 n = normalize(vec3(-(H(p + vec2(e,0.)) - h) / e, 1., -(H(p + vec2(0.,e)) - h) / e));
  vec3 V = normalize(uCam - vW);
  float dist = length(vW - uCam);
  n = normalize(mix(n, vec3(0.,1.,0.), smoothstep(10., 60., dist) * .7));
  vec3 R = reflect(-V, n); R.y = abs(R.y);
  float F = .03 + .97 * pow(1. - max(dot(n, V), 0.), 5.);
  vec3 deep = mix(vec3(.02,.05,.08), vec3(.01,.02,.04), uNight);
  vec3 col = mix(deep, sky(R), clamp(F * 1.15, 0., 1.));
  // boat: dark reflection + warm mast-light streak
  float bx = vW.x - uBoat.x - n.x * 1.2, bz = vW.z - uBoat.z;
  float under = step(0., bz) * exp(-bx * bx * 5.) * exp(-bz * .9) * smoothstep(0., .2, bz);
  col *= 1. - under * .55;
  float lx = vW.x - uBoat.x - n.x * 2.2;
  float streak = exp(-lx * lx * 30.) * step(0., bz) * exp(-bz * .22) * (.5 + .5 * smoothstep(.0, .02, n.x * n.x + n.z * n.z));
  col += vec3(1., .7, .38) * streak * 1.3 * (.4 + uNight * .6);
  // afterglow glitter along the horizon direction
  float gl = pow(max(dot(R, normalize(vec3(uGlowDir.x, .06, uGlowDir.z))), 0.), 160.);
  col += vec3(1., .62, .35) * gl * 2.2 * (1. - uNight * .5);
  col = mix(col, sky(normalize(vec3(-V.x, .0, -V.z))), smoothstep(25., 70., dist));
  gl_FragColor = vec4(col, 1.);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`

function hJS(x, z, t) {
  return Math.sin((x * .8 + z * .6) * 1.1 + t * 1.1) * .05 + Math.sin((-x * .5 + z * .86) * 1.9 + t * 1.5) * .025
}

function makeBoat() {
  const hull = new THREE.Shape()
  hull.moveTo(-1.1, .18); hull.lineTo(1.25, .2); hull.quadraticCurveTo(.9, -.12, .6, -.16); hull.lineTo(-.85, -.14); hull.quadraticCurveTo(-1.05, -.05, -1.1, .18)
  const hullG = new THREE.ExtrudeGeometry(hull, { depth: .34, bevelEnabled: true, bevelSize: .04, bevelThickness: .06, bevelSegments: 2, curveSegments: 10 }); hullG.translate(0, 0, -.17)
  const main = new THREE.Shape(); main.moveTo(-.05, .32); main.lineTo(-.95, .32); main.quadraticCurveTo(-.4, 1.3, -.05, 2.55); main.lineTo(-.05, .32)
  const jib = new THREE.Shape(); jib.moveTo(.06, .4); jib.lineTo(1.18, .26); jib.quadraticCurveTo(.5, 1.1, .06, 2.35); jib.lineTo(.06, .4)
  return { hullG, mainG: new THREE.ShapeGeometry(main, 12), jibG: new THREE.ShapeGeometry(jib, 12) }
}

function Boat({ boat, progress }) {
  const g = useRef(), { hullG, mainG, jibG } = useMemo(makeBoat, [])
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime, p = progress.get()
    const x = -7.5 + p * 13 + Math.sin(t * .1) * .3, z = -7
    g.current.position.x = THREE.MathUtils.damp(g.current.position.x, x, 2, dt)
    g.current.position.z = z
    const bx = g.current.position.x
    g.current.position.y = hJS(bx, z, t) - .02
    g.current.rotation.z = (hJS(bx + .6, z, t) - hJS(bx - .6, z, t)) * .8
    g.current.rotation.x = (hJS(bx, z + .3, t) - hJS(bx, z - .3, t)) * .9
    boat.set(bx, 0, z)
  })
  return (
    <group ref={g} rotation-y={-.12} scale={.95}>
      <mesh geometry={hullG}><meshStandardMaterial color="#0a0f16" roughness={.6} metalness={.1} /></mesh>
      <mesh position={[0, 1.3, 0]}><cylinderGeometry args={[.018, .022, 2.6, 6]} /><meshStandardMaterial color="#0a0f16" /></mesh>
      <mesh geometry={mainG} position-z={-.01}><meshStandardMaterial color="#c9ced3" emissive="#ffb27a" emissiveIntensity={.12} roughness={.9} side={THREE.DoubleSide} transparent opacity={.9} /></mesh>
      <mesh geometry={jibG} position-z={.02}><meshStandardMaterial color="#b9c0c7" emissive="#ffb27a" emissiveIntensity={.08} roughness={.9} side={THREE.DoubleSide} transparent opacity={.85} /></mesh>
      <mesh position={[-.02, 2.64, 0]}><sphereGeometry args={[.035, 10, 8]} /><meshBasicMaterial color={[6, 3.6, 1.8]} toneMapped={false} /></mesh>
      <mesh position={[-.35, .3, .2]}><boxGeometry args={[.3, .05, .02]} /><meshBasicMaterial color={[3, 1.9, 1]} toneMapped={false} /></mesh>
    </group>
  )
}

function Scene({ progress, mobile, host }) {
  const { camera, size } = useThree()
  const boat = useMemo(() => new THREE.Vector3(), [])
  const rips = useMemo(() => Array.from({ length: N }, () => new THREE.Vector4(0, 0, -99, 0)), [])
  const shared = useMemo(() => ({ uNight: { value: 0 }, uGlowDir: { value: new THREE.Vector3(-.75, 0, -.66).normalize() } }), [])
  const wu = useMemo(() => ({ ...shared, uT: { value: 0 }, uRip: { value: rips }, uBoat: { value: boat }, uCam: { value: new THREE.Vector3() } }), [])
  const su = useMemo(() => ({ ...shared }), [])
  const st = useRef({ i: 0, last: 0, lx: 0, lz: 0 })
  const ray = useMemo(() => new THREE.Raycaster(), []), plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []), v2 = useMemo(() => new THREE.Vector2(), []), hit = useMemo(() => new THREE.Vector3(), [])
  React.useEffect(() => {
    const el = host.current; if (!el) return
    const drop = (e, force) => {
      const r = el.getBoundingClientRect()
      v2.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
      ray.setFromCamera(v2, camera)
      if (!ray.ray.intersectPlane(plane, hit)) return
      const s = st.current, now = wu.uT.value, d = Math.hypot(hit.x - s.lx, hit.z - s.lz)
      if (!force && (now - s.last < .09 || d < .25)) return
      rips[s.i].set(hit.x, hit.z, now, force ? 1.6 : Math.min(1, .35 + d * .4)); s.i = (s.i + 1) % N; s.last = now; s.lx = hit.x; s.lz = hit.z
    }
    const mv = e => drop(e, false), dn = e => drop(e, true)
    el.addEventListener('pointermove', mv); el.addEventListener('pointerdown', dn)
    return () => { el.removeEventListener('pointermove', mv); el.removeEventListener('pointerdown', dn) }
  }, [camera])
  useFrame(({ pointer, clock }, dt) => {
    const p = progress.get()
    wu.uT.value = clock.elapsedTime
    shared.uNight.value = THREE.MathUtils.damp(shared.uNight.value, clamp(p * 1.1), 2, dt)
    camera.position.x = THREE.MathUtils.damp(camera.position.x, pointer.x * .5, 2, dt)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, 1.25 + pointer.y * .15 - p * .2, 2, dt)
    camera.position.z = mobile ? 6.5 : 6
    camera.lookAt(camera.position.x * .3, .55, -10)
    wu.uCam.value.copy(camera.position)
    // ambient drops so the sea is alive even without a cursor
    if (Math.random() < dt * (mobile ? .5 : .35)) { const s = st.current; rips[s.i].set((Math.random() - .5) * 8, -Math.random() * 6 + 1, clock.elapsedTime, .45); s.i = (s.i + 1) % N }
  })
  return (
    <>
      <mesh scale={80} renderOrder={-1}><sphereGeometry args={[1, 32, 16]} /><shaderMaterial uniforms={su} vertexShader={skyVS} fragmentShader={skyFS} side={THREE.BackSide} depthWrite={false} /></mesh>
      <Stars radius={60} depth={10} count={mobile ? 700 : 1400} factor={2.2} saturation={0} fade speed={.4} />
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, -20]}><planeGeometry args={[160, 80]} /><shaderMaterial uniforms={wu} vertexShader={waterVS} fragmentShader={waterFS} /></mesh>
      <hemisphereLight args={['#6f87a6', '#0b1420', .9]} />
      <directionalLight position={[-8, 2, -10]} color="#ffb27a" intensity={1.4} />
      <Boat boat={boat} progress={progress} />
    </>
  )
}

export default function ClubSea({ progress, active, mobile, lite, host }) {
  return (
    <Canvas frameloop={active ? 'always' : 'never'} dpr={[1, mobile ? 1.25 : 1.5]} gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ fov: mobile ? 62 : 42, position: [0, 1.25, 6], near: .1, far: 200 }} style={{ position: 'absolute', inset: 0 }} eventSource={host}>
      <Scene progress={progress} mobile={mobile} host={host} />
      {!lite && !mobile && (
        <EffectComposer multisampling={0} disableNormalPass>
          <Bloom mipmapBlur intensity={.9} luminanceThreshold={.8} luminanceSmoothing={.25} />
          <Vignette darkness={.6} offset={.2} />
        </EffectComposer>
      )}
    </Canvas>
  )
}
