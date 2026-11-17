import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'

/* A car door panel goes through repair stages. Everything happens in one shader. */
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const sm = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t) }
export const STAGE = p => ({
  dent: 1 - sm(0.2, 0.34, p),
  filler: sm(0.22, 0.34, p),
  primer: sm(0.4, 0.54, p),
  paint: sm(0.58, 0.72, p),
  clear: sm(0.76, 0.88, p),
})

const vert = /* glsl */`
uniform float uDent;
varying vec3 vW; varying vec2 vP;
void main(){
  vec3 p = position;
  vP = p.xy;
  float bend = -0.16 * p.x * p.x - 0.05 * p.y * p.y;
  float crease = 0.035 * smoothstep(0.08, 0.0, abs(p.y - 0.28)) ;
  float d = exp(-(pow(p.x - 0.35, 2.0) * 7.0 + pow(p.y + 0.12, 2.0) * 11.0));
  float d2 = exp(-(pow(p.x - 0.62, 2.0) * 40.0 + pow(p.y + 0.02, 2.0) * 60.0));
  p.z += bend + crease - uDent * (0.17 * d + 0.05 * d2);
  vec4 w = modelMatrix * vec4(p, 1.0);
  vW = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}`
const frag = /* glsl */`
precision highp float;
uniform float uFiller, uPrimer, uPaint, uClear, uDent, uTime;
uniform vec3 uColor;
varying vec3 vW; varying vec2 vP;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
vec3 env(vec3 r, float rough){
  float w = mix(0.025, 0.4, rough);
  vec3 c = mix(vec3(0.82,0.86,0.92), vec3(0.98), smoothstep(-0.3, 0.8, r.y));
  c *= 0.55;
  float s1 = smoothstep(w, 0.0, abs(r.y - 0.42));
  float s2 = smoothstep(w * 1.4, 0.0, abs(r.y - 0.16)) * 0.6;
  float s3 = smoothstep(w * 2.0, 0.0, abs(r.x + 0.55)) * smoothstep(-0.2, 0.5, r.y) * 0.7;
  return c + vec3(1.0) * (s1 * 1.5 + s2 + s3) * mix(1.0, 0.35, rough);
}
void main(){
  vec3 N = normalize(cross(dFdx(vW), dFdy(vW)));
  vec3 V = normalize(cameraPosition - vW);
  if (dot(N, V) < 0.0) N = -N;
  vec3 R = reflect(-V, N);
  float fres = pow(1.0 - max(dot(N, V), 0.0), 5.0);
  vec3 L = normalize(vec3(0.4, 0.9, 0.6));
  float dif = 0.35 + 0.65 * max(dot(N, L), 0.0);

  // dist from dent centre (repair area)
  float area = length((vP - vec2(0.38, -0.1)) * vec2(1.0, 1.25));
  float edge = n(vP * 6.0) * 0.12;

  // stage 0: old paint with damage
  vec3 old = uColor * 0.86;
  float scratch = smoothstep(0.985, 1.0, sin((vP.x * 0.8 + vP.y) * 140.0 + n(vP * 9.0) * 6.0)) * smoothstep(0.55, 0.2, area);
  vec3 col = mix(old, vec3(0.75, 0.77, 0.78), scratch * 0.8);
  float rough = 0.35, spec = 0.5;

  // stage 1: bare metal ring + putty, sanded
  float rep = smoothstep(0.62 + edge, 0.5 + edge, area) * uFiller;
  float putty = smoothstep(0.38 + edge, 0.28 + edge, area);
  float sand = n(vec2(vP.x * 40.0 + vP.y * 12.0, vP.y * 3.0)) * 0.12;
  vec3 metal = vec3(0.68, 0.7, 0.72) + sand;
  vec3 putt = vec3(0.78, 0.76, 0.7) - sand * 0.6;
  col = mix(col, mix(metal, putt, putty), rep);
  rough = mix(rough, 0.75, rep); spec = mix(spec, 0.25, rep);

  // stage 2: primer wipe (left -> right spray pass)
  float fP = mix(-2.1, 2.1, uPrimer);
  float prim = 1.0 - smoothstep(fP - 0.15, fP + 0.15, vP.x + (n(vP * 4.0) - 0.5) * 0.3);
  vec3 primer = vec3(0.56, 0.6, 0.6) + n(vP * 30.0) * 0.03;
  col = mix(col, primer, prim);
  rough = mix(rough, 0.85, prim); spec = mix(spec, 0.12, prim);

  // stage 3: base coat with metallic flake
  float fC = mix(-2.1, 2.1, uPaint);
  float base = 1.0 - smoothstep(fC - 0.12, fC + 0.12, vP.x + (n(vP * 5.0 + 3.0) - 0.5) * 0.3);
  float flake = step(0.93, h(floor(vP * 260.0))) * (0.5 + 0.5 * sin(uTime * 2.0 + h(floor(vP * 260.0)) * 30.0));
  vec3 bc = uColor * dif + flake * 0.18 * max(dot(N, normalize(L + V)), 0.0);
  col = mix(col, uColor, base);
  rough = mix(rough, 0.55, base); spec = mix(spec, 0.3, base);

  // stage 4: clear coat
  rough = mix(rough, 0.02, uClear); spec = mix(spec, 1.0, uClear);

  vec3 lit = col * dif;
  lit = mix(lit, bc, base);
  float F = mix(0.04, 1.0, fres) * spec + 0.06 * spec;
  vec3 c = lit + env(R, rough) * F * mix(0.6, 1.25, uClear);
  // soft vignette at panel edges (rubber seal)
  float e = smoothstep(1.6, 1.5, abs(vP.x)) * smoothstep(0.95, 0.88, abs(vP.y));
  c = mix(vec3(0.08, 0.1, 0.14), c, e);
  gl_FragColor = vec4(pow(c, vec3(0.95)), 1.0);
}`

function Panel({ progress, color }) {
  const mat = useRef(), mesh = useRef()
  const uni = useMemo(() => ({ uDent: { value: 1 }, uFiller: { value: 0 }, uPrimer: { value: 0 }, uPaint: { value: 0 }, uClear: { value: 0 }, uTime: { value: 0 }, uColor: { value: new THREE.Color(color) } }), [])
  const { size } = useThree()
  useFrame(st => {
    const p = progress.get(), s = STAGE(p), u = mat.current.uniforms
    u.uDent.value = s.dent; u.uFiller.value = s.filler; u.uPrimer.value = s.primer; u.uPaint.value = s.paint; u.uClear.value = s.clear
    u.uTime.value = st.clock.elapsedTime
    u.uColor.value.lerp(new THREE.Color(color), 0.08)
    const mob = size.width < 768
    mesh.current.rotation.y = THREE.MathUtils.lerp(-0.5, 0.42, p) + st.pointer.x * 0.12
    mesh.current.rotation.x = -0.18 + st.pointer.y * -0.08 + Math.sin(st.clock.elapsedTime * 0.4) * 0.02
    mesh.current.position.set(mob ? 0 : 0.95, mob ? 0.55 : 0, 0)
    const k = mob ? 0.62 : 1
    mesh.current.scale.setScalar(k)
  })
  return (
    <mesh ref={mesh}>
      <planeGeometry args={[3.2, 1.9, 200, 120]} />
      <shaderMaterial ref={mat} vertexShader={vert} fragmentShader={frag} uniforms={uni} side={THREE.DoubleSide} extensions={{ derivatives: true }} />
    </mesh>
  )
}

export default function PanelFilm({ progress, active, color = '#d7261e' }) {
  return (
    <Canvas dpr={[1, 1.6]} frameloop={active ? 'always' : 'never'} camera={{ position: [0, 0, 4.4], fov: 38 }} gl={{ antialias: true, alpha: true }}>
      <Panel progress={progress} color={color} />
    </Canvas>
  )
}
