import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useLoader } from '@react-three/fiber'

/* Render 5 as real geometry: a dense plane displaced by its depth map (white = near).
   Extends the shared DepthPhoto with a per-pixel dissolve so the particle cloud "lands" into pixels. */

const vert = /* glsl */`
uniform sampler2D uDepth; uniform float uAmount;
varying vec2 vUv; varying float vD;
void main(){
  vUv = uv;
  float d = texture2D(uDepth, uv).r;
  vD = d;
  vec3 p = position; p.z += d * uAmount;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.);
}`
const frag = /* glsl */`
uniform sampler2D uMap; uniform float uPix; uniform float uEdge; uniform float uGlow;
varying vec2 vUv; varying float vD;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
void main(){
  vec4 c = texture2D(uMap, vUv);
  vec2 cell = floor(vUv * vec2(150., 188.));
  float n = h(cell) * .75 + (1. - vUv.y) * .25;
  float k = uPix * 1.35 - .1;
  if (n > k) discard;
  float rim = smoothstep(k - .06, k, n);
  vec2 e = smoothstep(vec2(0.), vec2(uEdge), vUv) * smoothstep(vec2(0.), vec2(uEdge), 1. - vUv);
  float a = e.x * e.y;
  if (a < .02) discard;
  vec3 col = c.rgb * 1.12 + vec3(1., .72, .38) * rim * 2.5 * uGlow;
  col = mix(vec3(.07, .065, .06), col, a);
  gl_FragColor = vec4(col, 1.);
  #include <colorspace_fragment>
}`

export function PhotoSolid({ film, photo, depthMap, mobile }) {
  const map = useLoader(THREE.TextureLoader, mobile ? '/portfolio/yts/img/5-s.webp' : '/portfolio/yts/img/5.webp')
  map.colorSpace = THREE.SRGBColorSpace
  map.anisotropy = 4
  const seg = mobile ? 150 : 260
  const geo = useMemo(() => new THREE.PlaneGeometry(photo.w, photo.w * photo.aspect, seg, Math.round(seg * photo.aspect)), [seg])
  const mesh = useRef()
  const uniforms = useMemo(() => ({ uMap: { value: map }, uDepth: { value: depthMap }, uAmount: { value: photo.depth }, uPix: { value: 0 }, uEdge: { value: .035 }, uGlow: { value: 1 } }), [map, depthMap])
  useFrame(() => {
    const b = film.current.b
    mesh.current.visible = b.pix > .001
    uniforms.uPix.value = b.pix
    uniforms.uGlow.value = 1 - b.dolly
  })
  return (
    <mesh ref={mesh} geometry={geo} position={photo.c} renderOrder={1} visible={false}>
      <shaderMaterial uniforms={uniforms} vertexShader={vert} fragmentShader={frag} />
    </mesh>
  )
}
