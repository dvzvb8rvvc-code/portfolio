import React, { useMemo } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'

const frag = /* glsl */`
precision highp float;
uniform float uT; uniform vec2 uRes; uniform vec2 uM; uniform vec3 c0,c1,c2,c3;
varying vec2 vUv;
vec3 hash3(vec2 p){ vec3 q=vec3(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)),dot(p,vec2(419.2,371.9))); return fract(sin(q)*43758.5453); }
float noise(vec2 p){ vec2 i=floor(p),f=fract(p); vec2 u=f*f*(3.-2.*f);
  float a=hash3(i).x,b=hash3(i+vec2(1,0)).x,c=hash3(i+vec2(0,1)).x,d=hash3(i+vec2(1,1)).x;
  return mix(mix(a,b,u.x),mix(c,d,u.x),u.y); }
float fbm(vec2 p){ float v=0.,a=.5; for(int i=0;i<5;i++){ v+=a*noise(p); p=p*2.03+vec2(1.7,9.2); a*=.5; } return v; }
void main(){
  vec2 uv=vUv; float asp=uRes.x/uRes.y; vec2 p=vec2(uv.x*asp,uv.y)*1.6;
  vec2 m=vec2(uM.x*asp,uM.y)*1.6;
  float d=length(p-m); float sw=exp(-d*d*3.)*1.6;
  float ang=sw; p-=m; p=mat2(cos(ang),-sin(ang),sin(ang),cos(ang))*p; p+=m;
  vec2 q=vec2(fbm(p+uT*.05),fbm(p+vec2(5.2,1.3)-uT*.04));
  vec2 r=vec2(fbm(p+3.*q+vec2(1.7,9.2)+uT*.06),fbm(p+3.*q+vec2(8.3,2.8)));
  float f=fbm(p+3.*r);
  vec3 col=mix(c0,c1,smoothstep(.2,.6,f));
  col=mix(col,c2,smoothstep(.45,.85,length(q)));
  col=mix(col,c3,smoothstep(.55,.95,r.x)*.85);
  // painterly ridges
  float ridge=smoothstep(.0,.02,abs(fract(f*9.)-.5)-.46);
  col*=.94+.06*ridge;
  col+=.06*pow(f,3.);
  gl_FragColor=vec4(col,1.);
}`
const vert = 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }'
function Paint({ palette }) {
  const { size } = useThree()
  const u = useMemo(() => ({ uT: { value: 0 }, uRes: { value: [1, 1] }, uM: { value: [.5, .5] }, c0: { value: new THREE.Color() }, c1: { value: new THREE.Color() }, c2: { value: new THREE.Color() }, c3: { value: new THREE.Color() } }), [])
  useMemo(() => palette.forEach((c, i) => u['c' + i].value.set(c)), [])
  const tgt = useMemo(() => [0, 1, 2, 3].map(() => new THREE.Color()), [])
  useFrame((s, dt) => {
    u.uT.value += Math.min(dt, .05)
    u.uRes.value = [size.width, size.height]
    const m = u.uM.value
    u.uM.value = [m[0] + ((s.pointer.x * .5 + .5) - m[0]) * .05, m[1] + ((s.pointer.y * .5 + .5) - m[1]) * .05]
    palette.forEach((c, i) => { tgt[i].set(c); u['c' + i].value.lerp(tgt[i], .04) })
  })
  return <mesh><planeGeometry args={[2, 2]} /><shaderMaterial uniforms={u} vertexShader={vert} fragmentShader={frag} /></mesh>
}
export default function Scene({ palette }) {
  return <Canvas dpr={[1, 1.25]} gl={{ antialias: false }} style={{ position: 'absolute', inset: 0 }}><Paint palette={palette} /></Canvas>
}
