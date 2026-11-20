import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'

/* Founder portrait as ~50k particles. Each particle knows its place in TWO depth-mapped photos:
   the b/w portrait (1) and the colour portrait (126). Scroll forms → rim-light sweep → storm → colour.
   Everything is computed on the GPU from textures; scroll arrives as a MotionValue (damped, no React state). */

const vert = /* glsl */`
uniform sampler2D uA; uniform sampler2D uAD; uniform sampler2D uB; uniform sampler2D uBD;
uniform vec4 uCropB; uniform float uM; uniform float uForm; uniform float uTime; uniform float uSweep;
uniform float uSize; uniform vec2 uWH; uniform float uDepth; uniform vec2 uMouse;
attribute vec2 aUv; attribute vec4 aR;
varying vec3 vCol; varying float vA; varying float vGlow;
float lum(vec3 c){ return dot(c, vec3(.299,.587,.114)); }
vec3 nrm(sampler2D d, vec2 uv, float e){
  float gx = texture2D(d, uv + vec2(e,0.)).r - texture2D(d, uv - vec2(e,0.)).r;
  float gy = texture2D(d, uv + vec2(0.,e)).r - texture2D(d, uv - vec2(0.,e)).r;
  return normalize(vec3(-gx*9., -gy*9., 1.));
}
void main(){
  vec2 uvB = mix(uCropB.xy, uCropB.zw, aUv);
  float dA = texture2D(uAD, aUv).r, dB = texture2D(uBD, uvB).r;
  vec3 cA = vec3(lum(texture2D(uA, aUv).rgb)), cB = texture2D(uB, uvB).rgb;
  float mA = smoothstep(.3, .44, dA), mB = smoothstep(.26, .42, dB);
  vec2 xy = (aUv - .5) * uWH;
  vec3 pA = vec3(xy, dA * uDepth), pB = vec3(xy, dB * uDepth);
  // background particles fall back as a loose haze
  pA.z -= (1. - mA) * (0.6 + aR.z); pB.z -= (1. - mB) * (0.6 + aR.z);
  // morph with a top→down wave + jitter
  float m = clamp(uM * 1.9 - (1. - aUv.y) * .55 - aR.x * .35, 0., 1.);
  m = m * m * (3. - 2. * m);
  float storm = sin(m * 3.14159);
  vec3 p = mix(pA, pB, m);
  float ph = aR.y * 6.2831 + uTime * .6;
  p += storm * vec3(sin(ph + p.y * 2.) * 1.1, cos(ph * .8 + p.x * 3.) * .6 + .5, sin(ph * 1.3) * 1.4) * (.6 + aR.w);
  // forming: scattered → assembled
  float f = clamp(uForm * 1.6 - aR.x * .6, 0., 1.); f = 1. - pow(1. - f, 3.);
  p += (1. - f) * (aR.xyz - .5) * vec3(9., 7., 6.);
  // pointer pushes particles a little (feels touchable)
  vec2 dm = p.xy - uMouse; float pm = exp(-dot(dm, dm) * 5.) * .28;
  p.z += pm; p.xy += normalize(dm + 1e-4) * pm * .4;
  // light: studio rim that sweeps around the head
  vec3 n = normalize(mix(nrm(uAD, aUv, .004), nrm(uBD, uvB, .006), m));
  float a = uSweep;
  vec3 L = normalize(vec3(cos(a), .35, sin(a) * .6 + .2));
  float rim = pow(1. - clamp(n.z, 0., 1.), 1.4) * max(dot(normalize(n.xy + 1e-4), L.xy), 0.);
  float band = exp(-pow((xy.x - cos(a) * uWH.x * .55) / (uWH.x * .22), 2.));
  float mask = mix(mA, mB, m);
  vec3 col = mix(cA, cB, m);
  col *= .72 + band * .5;
  vGlow = (rim * 1.6 + band * .12) * mask;
  col += vec3(1., .72, .42) * vGlow;
  col += vec3(.95, .62, .3) * storm * .35;
  vCol = col;
  vA = mix(.07, 1., mask) * (.25 + .75 * f) + storm * .25;
  vec4 mv = modelViewMatrix * vec4(p, 1.);
  gl_PointSize = uSize * (1. + storm * .8 + (1. - mask) * .4) / -mv.z;
  gl_Position = projectionMatrix * mv;
}`
const frag = /* glsl */`
varying vec3 vCol; varying float vA; varying float vGlow;
void main(){
  vec2 c = gl_PointCoord - .5; float d = dot(c, c);
  if (d > .25) discard;
  float s = smoothstep(.25, .05, d);
  gl_FragColor = vec4(vCol, vA * s);
  #include <colorspace_fragment>
}`

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))

function Portrait({ progress, mobile }) {
  const [A, AD, B, BD] = useLoader(THREE.TextureLoader, ['/portfolio/yts/img/1-s.webp', '/portfolio/yts/depth/1.webp', '/portfolio/yts/img/126.webp', '/portfolio/yts/depth/126.webp'])
  A.colorSpace = B.colorSpace = THREE.SRGBColorSpace
  const { size, viewport } = useThree()
  const cols = mobile ? 120 : 190, rows = Math.round(cols * 1.5)
  const geo = useMemo(() => {
    const n = cols * rows, uv = new Float32Array(n * 2), r = new Float32Array(n * 4), pos = new Float32Array(n * 3)
    let s = 11
    const rnd = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646
    for (let y = 0, i = 0; y < rows; y++) for (let x = 0; x < cols; x++, i++) {
      uv[i * 2] = (x + .5 + (rnd() - .5) * .6) / cols; uv[i * 2 + 1] = (y + .5 + (rnd() - .5) * .6) / rows
      r[i * 4] = rnd(); r[i * 4 + 1] = rnd(); r[i * 4 + 2] = rnd(); r[i * 4 + 3] = rnd()
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aUv', new THREE.BufferAttribute(uv, 2))
    g.setAttribute('aR', new THREE.BufferAttribute(r, 4))
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 20)
    return g
  }, [cols, rows])
  const H = 3.5
  const uniforms = useMemo(() => ({
    uA: { value: A }, uAD: { value: AD }, uB: { value: B }, uBD: { value: BD },
    // crop of 126 (GL uv, y up): the figure from head to thighs, 2:3
    uCropB: { value: new THREE.Vector4(.3, .13, .7, .84) },
    uM: { value: 0 }, uForm: { value: 0 }, uTime: { value: 0 }, uSweep: { value: 2.6 },
    uSize: { value: 1 }, uWH: { value: new THREE.Vector2(H / 1.5, H) }, uDepth: { value: .9 }, uMouse: { value: new THREE.Vector2(9, 9) },
  }), [A, AD, B, BD])
  const pts = useRef(), mouse = useRef(new THREE.Vector2(9, 9))
  useFrame((st, dt) => {
    const u = uniforms, p = progress.get()
    u.uTime.value += dt
    u.uForm.value = THREE.MathUtils.damp(u.uForm.value, clamp((p + .12) / .3), 4, dt)
    u.uM.value = THREE.MathUtils.damp(u.uM.value, clamp((p - .46) / .32), 3.5, dt)
    // rim light sweeps as the user reads, then idles
    u.uSweep.value = THREE.MathUtils.damp(u.uSweep.value, 2.7 - clamp(p / .9) * 2.4 + Math.sin(u.uTime.value * .35) * .25, 3, dt)
    u.uSize.value = (H / rows) * size.height * st.viewport.dpr / .689 * 2.15
    // pointer in model space (approximate: plane at z≈0)
    const tx = st.pointer.x * viewport.width / 2 - (pts.current?.position.x || 0), ty = st.pointer.y * viewport.height / 2
    mouse.current.set(THREE.MathUtils.damp(mouse.current.x, tx, 6, dt), THREE.MathUtils.damp(mouse.current.y, ty, 6, dt))
    u.uMouse.value.copy(mouse.current)
  })
  return (
    <points ref={pts} geometry={geo} position={[mobile ? 0 : .95, mobile ? .35 : -.05, 0]} frustumCulled={false}>
      <shaderMaterial uniforms={uniforms} vertexShader={vert} fragmentShader={frag} transparent depthWrite={false} />
    </points>
  )
}

function Rig({ progress, mobile }) {
  useFrame(({ camera, pointer }, dt) => {
    const p = progress.get()
    const z = (mobile ? 6.6 : 5.4) - clamp((p - .7) / .3) * .5
    camera.position.x = THREE.MathUtils.damp(camera.position.x, pointer.x * .55, 2.5, dt)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, pointer.y * .3 + .1, 2.5, dt)
    camera.position.z = THREE.MathUtils.damp(camera.position.z, z, 2.5, dt)
    camera.lookAt(mobile ? 0 : .6, 0, 0)
  })
  return null
}

export default function FounderPortrait({ progress, active, mobile }) {
  return (
    <Canvas frameloop={active ? 'always' : 'never'} dpr={[1, mobile ? 1.3 : 1.6]} gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
      camera={{ fov: 38, position: [0, 0, 6], near: .1, far: 50 }} style={{ position: 'absolute', inset: 0 }}>
      <Portrait progress={progress} mobile={mobile} />
      <Rig progress={progress} mobile={mobile} />
    </Canvas>
  )
}
