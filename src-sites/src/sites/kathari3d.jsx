import React, { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'

/* liquid marble: domain-warped fbm veins that drift; the cursor swirls them */
const vert = /* glsl */`
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`
const frag = /* glsl */`
precision highp float;
varying vec2 vUv;
uniform float uTime, uAspect, uScroll, uSwirl;
uniform vec2 uMouse;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1,0)), u.x), mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  mat2 r = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 5; i++){ v += a * noise(p); p = r * p * 2.03 + 3.1; a *= 0.5; }
  return v;
}
mat2 rot(float a){ float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }
void main(){
  vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0) * 2.2;
  vec2 m = (uMouse) * vec2(uAspect, 1.0) * 1.1;
  vec2 d = p - m;
  float r = length(d);
  p = m + rot(uSwirl * 2.4 * exp(-r * r * 2.2)) * d;
  float t = uTime * 0.035;
  p.y += uScroll * 1.4;
  vec2 q = vec2(fbm(p * 0.9 + vec2(t, -t)), fbm(p * 0.9 + vec2(5.2 - t, 1.3)));
  float n = fbm(p * 1.1 + q * 2.4 + t * 0.6);
  float band = sin((p.x * 1.3 + p.y * 2.1) + n * 7.0);
  float vein = pow(1.0 - abs(band), 26.0);
  float band2 = sin((p.x * -2.2 + p.y * 0.9) * 1.4 + fbm(p * 2.3 + q) * 9.0);
  float vein2 = pow(1.0 - abs(band2), 60.0);
  vec3 white = vec3(0.965, 0.953, 0.933);
  vec3 cloud = vec3(0.86, 0.835, 0.80);
  vec3 col = mix(white, cloud, smoothstep(0.35, 0.85, n) * 0.55);
  col = mix(col, vec3(0.42, 0.40, 0.37), vein * 0.55);
  col = mix(col, vec3(0.55, 0.60, 0.64), vein2 * 0.45);
  col += (hash(vUv * 900.0 + uTime) - 0.5) * 0.012;
  gl_FragColor = vec4(col, 1.0);
}
`

function Marble({ progress }) {
  const mat = useRef()
  const { size } = useThree()
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uAspect: { value: 1 }, uScroll: { value: 0 }, uSwirl: { value: 0 }, uMouse: { value: new THREE.Vector2(0, 0) } }), [])
  const last = useRef(new THREE.Vector2())
  useFrame((st, dt) => {
    dt = Math.min(dt, 0.05)
    const u = mat.current.uniforms
    u.uTime.value += dt
    u.uAspect.value = size.width / size.height
    u.uScroll.value = progress ? progress.get() : 0
    const px = st.pointer.x * 0.5, py = st.pointer.y * 0.5
    const speed = Math.hypot(px - last.current.x, py - last.current.y) / Math.max(dt, 0.001)
    last.current.set(px, py)
    u.uMouse.value.lerp(new THREE.Vector2(px, py), 0.08)
    u.uSwirl.value += (Math.min(1.2, 0.25 + speed * 0.5) - u.uSwirl.value) * 0.04
  })
  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial ref={mat} vertexShader={vert} fragmentShader={frag} uniforms={uniforms} depthWrite={false} />
    </mesh>
  )
}

export default function Scene({ progress }) {
  return (
    <Canvas dpr={[1, 1.5]} gl={{ antialias: false, alpha: false }} style={{ pointerEvents: 'none' }}
      eventSource={typeof document !== 'undefined' ? document.getElementById('root') : undefined} eventPrefix="client">
      <Marble progress={progress} />
    </Canvas>
  )
}
