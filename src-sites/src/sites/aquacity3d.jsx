import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const frag = `
precision highp float;
uniform float uTime; uniform vec2 uMouse; uniform vec2 uRes; uniform float uClick;
varying vec2 vUv;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.02;a*=.5;}return v;}
void main(){
  vec2 uv=vUv; vec2 asp=vec2(uRes.x/uRes.y,1.);
  vec2 d=(uv-uMouse)*asp; float r=length(d);
  float rip=sin(r*38.-uTime*5.)*exp(-r*5.)*.035*(1.+uClick*2.);
  uv+=normalize(d+1e-4)*rip;
  float t=uTime*.12;
  float n=fbm(uv*3.+vec2(t,-t*.6));
  float c=fbm(uv*6.+n*2.+vec2(-t*1.4,t));
  float caust=pow(smoothstep(.45,.95,c),2.)*1.4;
  vec3 deep=vec3(.02,.42,.62), mid=vec3(.15,.72,.88), light=vec3(.86,.97,1.);
  vec3 col=mix(deep,mid,smoothstep(.1,.9,uv.y+n*.35));
  col=mix(col,light,caust*.75);
  col+=vec3(.9,1.,1.)*smoothstep(.06,0.,abs(rip))*.0;
  col+=exp(-r*7.)*.12;
  gl_FragColor=vec4(col,1.);
}`
const vert = `varying vec2 vUv; void main(){vUv=uv; gl_Position=vec4(position.xy,0.,1.);}`

function Water() {
  const mat = useRef()
  const { size } = useThree()
  const u = useMemo(() => ({ uTime: { value: 0 }, uMouse: { value: new THREE.Vector2(.5, .5) }, uRes: { value: new THREE.Vector2(1, 1) }, uClick: { value: 0 } }), [])
  useFrame((s, dt) => {
    u.uTime.value += dt
    u.uRes.value.set(size.width, size.height)
    const tx = s.pointer.x * .5 + .5, ty = s.pointer.y * .5 + .5
    u.uMouse.value.x += (tx - u.uMouse.value.x) * .08
    u.uMouse.value.y += (ty - u.uMouse.value.y) * .08
    u.uClick.value *= .95
  })
  return (
    <mesh onPointerDown={() => (u.uClick.value = 1)}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial ref={mat} uniforms={u} vertexShader={vert} fragmentShader={frag} />
    </mesh>
  )
}

export default function Scene() {
  return (
    <Canvas dpr={[1, 1.4]} gl={{ antialias: false }} orthographic camera={{ position: [0, 0, 1] }} eventSource={typeof document !== 'undefined' ? document.getElementById('root') : undefined} eventPrefix="client">
      <Water />
    </Canvas>
  )
}
