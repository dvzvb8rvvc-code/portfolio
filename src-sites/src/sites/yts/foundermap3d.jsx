import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'

/* A dark, dotted Mediterranean on a gently curved earth. Coastlines are rough hand-made lon/lat polygons
   (abstract on purpose). Glowing arcs draw on scroll: Ramat Gan → Milano → Como → Volterra → Roma → Sardegna. */

const K = .3, C0 = [18, 38]
export const proj = (lon, lat) => {
  const x = (lon - C0[0]) * Math.cos(40 * Math.PI / 180) * K, z = -(lat - C0[1]) * K
  return [x, -(x * x + z * z) * .014, z]
}
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const ease = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

const LAND = [
  // Italy (peninsula + Alps)
  [[7.5, 43.8], [8.9, 44.4], [9.8, 44.1], [10.3, 43.5], [10.5, 42.9], [11.8, 42.1], [12.6, 41.4], [13.5, 41.2], [14.2, 40.8], [14.8, 40.6], [15.6, 40.0], [16.0, 39.0], [15.65, 38.0], [16.0, 37.9], [16.5, 38.4], [17.1, 39.1], [16.6, 39.8], [17.2, 40.5], [18.4, 39.8], [18.5, 40.15], [17.9, 40.6], [16.9, 41.1], [16.2, 41.9], [15.9, 41.95], [14.2, 42.5], [13.5, 43.6], [12.6, 44.1], [12.3, 45.4], [13.8, 45.6], [13.7, 46.5], [12.0, 47.0], [10.5, 46.9], [9.0, 46.5], [7.0, 45.9], [6.7, 45.0], [7.0, 44.2]],
  [[12.4, 37.8], [13.3, 38.2], [15.6, 38.3], [15.1, 37.3], [15.1, 36.7], [14.3, 37.0], [12.6, 37.6]],
  [[8.2, 40.9], [9.2, 41.25], [9.8, 40.9], [9.7, 40.0], [9.6, 39.2], [9.0, 39.1], [8.6, 38.9], [8.4, 39.4], [8.5, 40.0], [8.4, 40.6]],
  [[8.6, 41.4], [9.3, 41.4], [9.5, 42.0], [9.5, 43.0], [9.3, 42.9], [8.6, 42.4], [8.6, 41.9]],
  // Iberia + France + central Europe
  [[-2, 36.7], [-0.5, 38.3], [0, 39.5], [1, 41], [3.2, 41.9], [3.1, 43.0], [4.5, 43.4], [6.0, 43.1], [7.5, 43.8], [7.0, 44.2], [6.7, 45.0], [7.0, 45.9], [9, 46.5], [10.5, 46.9], [12, 47], [13.7, 46.5], [16, 47], [16, 48.5], [-2, 48.5]],
  // Balkans + Greece
  [[13.8, 45.6], [14.5, 45.3], [15.2, 44.3], [16.4, 43.5], [17.6, 43.0], [18.5, 42.4], [19.4, 41.8], [19.4, 40.4], [20.0, 39.6], [20.7, 38.8], [21.1, 38.3], [21.7, 37.0], [22.4, 36.4], [22.8, 36.8], [23.2, 36.4], [23.0, 37.5], [23.9, 37.7], [24.0, 38.2], [22.8, 38.9], [23.2, 39.4], [22.6, 40.3], [23.7, 40.2], [24.4, 40.9], [26.0, 40.8], [26.7, 40.4], [29.0, 41.1], [28.0, 42.0], [28.0, 43.5], [28.5, 44.5], [28, 46], [24, 48.5], [16, 48.5], [16, 47], [13.7, 46.5]],
  // Anatolia
  [[26.2, 40.0], [26.8, 38.5], [27.2, 37.0], [28.0, 36.6], [29.5, 36.2], [30.6, 36.8], [32.5, 36.1], [34.0, 36.3], [35.5, 36.6], [36.0, 36.0], [36.2, 37], [40, 37], [40, 41.2], [36, 41.6], [33, 42], [29.0, 41.1], [27.5, 40.4], [26.2, 40.3]],
  // Levant + North Africa
  [[36.0, 36.0], [35.8, 35.0], [35.5, 34.0], [35.1, 33.1], [34.9, 32.5], [34.6, 31.8], [34.2, 31.3], [32.3, 31.2], [30.0, 31.4], [29.0, 30.9], [25.0, 31.6], [23.0, 32.6], [20.0, 32.0], [20.0, 30.5], [19, 30.2], [15.5, 31.3], [15.2, 32.3], [13.0, 32.9], [11.5, 33.1], [10.2, 34.3], [11.1, 35.2], [10.9, 35.9], [10.3, 36.9], [11.0, 37.1], [9.8, 37.3], [8.6, 36.9], [5, 36.8], [3, 36.8], [0, 35.8], [-2, 35.1], [-2, 28.5], [40, 28.5], [40, 36]],
  [[23.5, 35.3], [24.5, 35.45], [26.3, 35.3], [26.0, 35.0], [24.7, 35.1]],
  [[32.3, 34.7], [33, 34.6], [34.0, 35.0], [34.6, 35.7], [33, 35.4], [32.3, 35.1]],
]
const inPoly = (x, y, P) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c } return c }

export const HOME = { k: 'home', lon: 34.82, lat: 32.08 }
export const STOPS = [
  { k: 'milano', lon: 9.19, lat: 45.46 },
  { k: 'como', lon: 9.26, lat: 46.0 },
  { k: 'volterra', lon: 10.86, lat: 43.4 },
  { k: 'roma', lon: 12.5, lat: 41.9 },
  { k: 'sardegna', lon: 9.5, lat: 40.92 },
]
// arc i is drawn while progress goes through WIN[i]
export const WIN = [[.12, .42], [.44, .52], [.53, .63], [.64, .74], [.75, .86]]

const dotVS = /* glsl */`
attribute float aHi; attribute float aR; uniform float uP; uniform float uT; uniform float uPx;
varying float vHi; varying float vA; varying float vR;
void main(){
  vec3 p = position; vHi = aHi; vR = aR;
  p.y += aHi * (.012 + .03 * uP) + sin(uT * .8 + aR * 30.) * .004;
  vec4 mv = modelViewMatrix * vec4(p, 1.);
  vA = clamp(1.2 - (-mv.z - 4.) * .06, .25, 1.);
  gl_PointSize = uPx * (1. + aHi * .35) / -mv.z;
  gl_Position = projectionMatrix * mv;
}`
const dotFS = /* glsl */`
uniform float uP; varying float vHi; varying float vA; varying float vR;
void main(){
  vec2 c = gl_PointCoord - .5; if (dot(c, c) > .25) discard;
  vec3 base = mix(vec3(.42,.39,.35), vec3(.7,.66,.6), vR * .6);
  vec3 hot = vec3(.95, .62, .32) * (1.1 + uP * .5);
  gl_FragColor = vec4(mix(base, hot, vHi * (.45 + .55 * uP)), vA * (.75 + .25 * vHi));
  #include <colorspace_fragment>
}`
function Land({ prog, mobile }) {
  const geo = useMemo(() => {
    const pos = [], hi = [], r = [], step = mobile ? .34 : .24
    let s = 3; const rnd = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646
    for (let lat = 28.6; lat < 48.4; lat += step) for (let lon = -1.9; lon < 39.9; lon += step / Math.cos(lat * Math.PI / 180) * .8) {
      if (!LAND.some(P => inPoly(lon, lat, P))) continue
      const italy = LAND.slice(0, 3).some(P => inPoly(lon, lat, P))
      const israel = lon > 34.2 && lon < 35.8 && lat > 29.5 && lat < 33.3
      pos.push(...proj(lon, lat)); hi.push(italy || israel ? 1 : 0); r.push(rnd())
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
    g.setAttribute('aHi', new THREE.Float32BufferAttribute(hi, 1))
    g.setAttribute('aR', new THREE.Float32BufferAttribute(r, 1))
    return g
  }, [mobile])
  const u = useMemo(() => ({ uP: { value: 0 }, uT: { value: 0 }, uPx: { value: 40 } }), [])
  useFrame((st, dt) => {
    u.uT.value += dt
    u.uP.value = THREE.MathUtils.damp(u.uP.value, clamp(prog.current * 1.4), 3, dt)
    u.uPx.value = st.size.height * st.viewport.dpr * (mobile ? .013 : .0105)
  })
  return <points geometry={geo}><shaderMaterial uniforms={u} vertexShader={dotVS} fragmentShader={dotFS} transparent depthWrite={false} /></points>
}

const seaVS = /* glsl */`varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position,1.); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`
const seaFS = /* glsl */`
varying vec3 vW; uniform vec2 uStep; uniform float uT;
float grid(float v, float s){ float f = abs(fract(v / s + .5) - .5) * s; return 1. - smoothstep(0., fwidth(v) * 1.2, f); }
void main(){
  float g = max(grid(vW.x, uStep.x), grid(vW.z, uStep.y));
  float d = length(vW.xz - vec2(0., 0.));
  float fade = smoothstep(9., 2., d);
  vec3 col = vec3(.006,.0065,.007) + vec3(.7,.45,.25) * g * .028 * fade;
  gl_FragColor = vec4(col, 1.);
  #include <colorspace_fragment>
}`
function Sea() {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(26, 18, 80, 60); g.rotateX(-Math.PI / 2)
    const p = g.attributes.position
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); p.setY(i, -(x * x + z * z) * .014 - .01) }
    return g
  }, [])
  const u = useMemo(() => ({ uStep: { value: new THREE.Vector2(2 * Math.cos(40 * Math.PI / 180) * K, 2 * K) }, uT: { value: 0 } }), [])
  return <mesh geometry={geo}><shaderMaterial uniforms={u} vertexShader={seaVS} fragmentShader={seaFS} extensions={{ derivatives: true }} /></mesh>
}

const arcVS = /* glsl */`attribute float aT; varying float vT; void main(){ vT = aT; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`
const arcFS = /* glsl */`
uniform float uD; uniform vec3 uC; varying float vT;
void main(){
  if (vT > uD) discard;
  float head = smoothstep(uD - .12, uD, vT) * step(uD, .999);
  vec3 col = uC * (1.1 + head * 4.);
  gl_FragColor = vec4(col, .55 + head * .45);
}`
function arcCurve(a, b) {
  const A = new THREE.Vector3(...proj(a.lon, a.lat)), B = new THREE.Vector3(...proj(b.lon, b.lat))
  const d = A.distanceTo(B), M = A.clone().add(B).multiplyScalar(.5); M.y += .15 + d * .32
  return new THREE.QuadraticBezierCurve3(A, M, B)
}
function Arc({ a, b, win, prog, mobile }) {
  const { geo, curve } = useMemo(() => {
    const curve = arcCurve(a, b), n = 90
    const g = new THREE.TubeGeometry(curve, n, mobile ? .014 : .01, 6, false)
    const t = new Float32Array(g.attributes.position.count)
    for (let i = 0; i <= n; i++) for (let j = 0; j <= 6; j++) t[i * 7 + j] = i / n
    g.setAttribute('aT', new THREE.BufferAttribute(t, 1))
    return { geo: g, curve }
  }, [a, b, mobile])
  const u = useMemo(() => ({ uD: { value: 0 }, uC: { value: new THREE.Color('#e9a25c') } }), [])
  const spark = useRef()
  useFrame((_, dt) => {
    const t = ease(clamp((prog.current - win[0]) / (win[1] - win[0])))
    u.uD.value = THREE.MathUtils.damp(u.uD.value, t, 5, dt)
    if (spark.current) {
      const d = u.uD.value; spark.current.visible = d > .01 && d < .995
      if (spark.current.visible) spark.current.position.copy(curve.getPoint(d))
    }
  })
  return (
    <group>
      <mesh geometry={geo}><shaderMaterial uniforms={u} vertexShader={arcVS} fragmentShader={arcFS} transparent depthWrite={false} toneMapped={false} /></mesh>
      <mesh ref={spark}><sphereGeometry args={[.035, 12, 8]} /><meshBasicMaterial color={[4, 2.6, 1.4]} toneMapped={false} /></mesh>
    </group>
  )
}

function City({ c, at, label, sub, prog, home }) {
  const ring = useRef(), dot = useRef(), html = useRef()
  const pos = useMemo(() => proj(c.lon, c.lat), [c])
  useFrame(({ clock }, dt) => {
    const on = home ? 1 : clamp((prog.current - at) / .04)
    const k = (clock.elapsedTime * .6 + (home ? 0 : at * 3)) % 1
    if (ring.current) { ring.current.scale.setScalar(.05 + k * (home ? .5 : .32)); ring.current.material.opacity = (1 - k) * .8 * on }
    if (dot.current) dot.current.scale.setScalar(THREE.MathUtils.damp(dot.current.scale.x, on ? 1 : .001, 6, dt))
    if (html.current) { html.current.style.opacity = on; html.current.style.transform = `translateY(${(1 - on) * 8}px)` }
  })
  return (
    <group position={pos}>
      <mesh ref={dot} position={[0, .02, 0]}><sphereGeometry args={[home ? .06 : .045, 16, 12]} /><meshBasicMaterial color={home ? [3.2, 1.8, .9] : [2.4, 2.1, 1.8]} toneMapped={false} /></mesh>
      <mesh ref={ring} rotation-x={-Math.PI / 2} position={[0, .015, 0]}><ringGeometry args={[.9, 1, 48]} /><meshBasicMaterial color="#e9a25c" transparent depthWrite={false} toneMapped={false} /></mesh>
      <Html position={[0, .09, 0]} center={false} zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
        <div ref={html} style={{ opacity: 0, transition: 'none' }} className={`whitespace-nowrap ${c.k === 'como' ? '-translate-x-full -translate-y-full pb-1 pr-3 text-right' : c.k === 'milano' ? '-translate-x-full pr-3 pt-1 text-right' : '-translate-y-full pb-1 pl-3'}`}>
          <div className="font-['Instrument_Serif',serif] text-[17px] leading-none text-[#ece7df] md:text-[22px]">{label}</div>
          {sub && <div className="mt-1 hidden text-[9.5px] font-semibold uppercase tracking-[.18em] text-[#c3a15e] md:block">{sub}</div>}
        </div>
      </Html>
    </group>
  )
}

const CAM = [
  { p: [4.4, 1.6, 4.0], l: [3.7, 0, 1.4] },
  { p: [1.6, 5.2, 5.6], l: [.6, 0, -.4] },
  { p: [-1.6, 3.4, 2.4], l: [-1.6, 0, -1.3] },
]
function Rig({ progress, prog, mobile }) {
  const v = useMemo(() => ({ p: new THREE.Vector3(...CAM[0].p), l: new THREE.Vector3(...CAM[0].l), tp: new THREE.Vector3(), tl: new THREE.Vector3() }), [])
  useFrame(({ camera, pointer }, dt) => {
    const raw = progress.get()
    prog.current = THREE.MathUtils.damp(prog.current, raw, 4, dt)
    const p = prog.current
    const a = ease(clamp(p / .42)), b = ease(clamp((p - .45) / .4))
    v.tp.fromArray(CAM[0].p).lerp(new THREE.Vector3(...CAM[1].p), a).lerp(new THREE.Vector3(...CAM[2].p), b)
    v.tl.fromArray(CAM[0].l).lerp(new THREE.Vector3(...CAM[1].l), a).lerp(new THREE.Vector3(...CAM[2].l), b)
    if (mobile) { v.tp.y += 1.6; v.tp.z += 1.6; v.tp.x -= .2; v.tl.x += .45 * (1 - b) }
    v.tp.x += pointer.x * .35; v.tp.y += pointer.y * .2
    v.p.x = THREE.MathUtils.damp(v.p.x, v.tp.x, 3, dt); v.p.y = THREE.MathUtils.damp(v.p.y, v.tp.y, 3, dt); v.p.z = THREE.MathUtils.damp(v.p.z, v.tp.z, 3, dt)
    v.l.lerp(v.tl, 1 - Math.exp(-3 * dt))
    camera.position.copy(v.p); camera.lookAt(v.l)
  })
  return null
}

export default function MedMap({ progress, active, mobile, lite, labels }) {
  const prog = useRef(0)
  const chain = [HOME, ...STOPS]
  return (
    <Canvas frameloop={active ? 'always' : 'never'} dpr={[1, mobile ? 1.3 : 1.5]} gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ fov: mobile ? 55 : 40, position: CAM[0].p, near: .05, far: 60 }} style={{ position: 'absolute', inset: 0 }}
      onCreated={({ gl }) => gl.setClearColor('#0e0e0d')}>
      <fog attach="fog" args={['#0e0e0d', 6, 16]} />
      <Sea />
      <Land prog={prog} mobile={mobile} />
      {STOPS.map((s, i) => <Arc key={s.k} a={chain[i]} b={s} win={WIN[i]} prog={prog} mobile={mobile} />)}
      <City c={HOME} home label={labels.home[0]} sub={labels.home[1]} prog={prog} at={0} />
      {STOPS.map((s, i) => <City key={s.k} c={s} label={labels[s.k][0]} sub={labels[s.k][1]} prog={prog} at={WIN[i][1] - .03} />)}
      <Rig progress={progress} prog={prog} mobile={mobile} />
      {!lite && !mobile && (
        <EffectComposer multisampling={0} disableNormalPass>
          <Bloom mipmapBlur intensity={.9} luminanceThreshold={.85} luminanceSmoothing={.2} />
          <Vignette darkness={.55} offset={.25} />
        </EffectComposer>
      )}
    </Canvas>
  )
}
