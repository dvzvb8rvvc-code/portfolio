import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'

/* Lake Como view (photo 129) displaced by its depth map, regraded to dusk in the shader:
   blue shadows, an afterglow on the far ridges, haze by depth, and village lights that switch on. */

const vert = /* glsl */`
uniform sampler2D uDepth; uniform float uAmount; uniform float uT;
varying vec2 vUv; varying float vD;
void main(){
  vUv = uv;
  float d = texture2D(uDepth, uv).r; vD = d;
  vec3 p = position; p.z += d * uAmount;
  // foreground foliage breathes a little
  p.x += sin(uT * .7 + uv.y * 20.) * .012 * smoothstep(.45, .9, d);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.);
}`
const frag = /* glsl */`
uniform sampler2D uMap; uniform float uT; uniform float uDusk;
varying vec2 vUv; varying float vD;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
void main(){
  vec3 c = texture2D(uMap, vUv).rgb;
  float l = dot(c, vec3(.299,.587,.114));
  float l2 = smoothstep(.04, .96, l);
  vec3 g = mix(vec3(.025,.04,.09), vec3(.2,.24,.38), smoothstep(0., .62, l2));
  g = mix(g, vec3(1.,.68,.45), smoothstep(.6, 1., l2) * .85);
  vec3 col = mix(c, g, uDusk);
  float far = 1. - smoothstep(.04, .22, vD);
  // sky: afterglow at the horizon → deep blue at the top
  float skyM = (1. - smoothstep(.02, .07, vD)) * smoothstep(.72, .86, vUv.y);
  vec3 skyC = mix(vec3(1.,.5,.26), vec3(.1,.13,.3), smoothstep(.84, 1., vUv.y));
  col = mix(col, skyC * (.55 + l * .7), skyM * uDusk);
  // far ridges catch the glow, water mirrors it
  col += vec3(.8,.38,.2) * far * (1. - skyM) * smoothstep(.5, .85, vUv.y) * .22 * uDusk;
  // near foliage goes to silhouette
  col *= mix(1., .38, smoothstep(.45, .85, vD) * uDusk);
  // village lights on the mid-distance slopes
  vec2 cell = floor(vUv * vec2(420., 160.));
  float r = hash(cell);
  vec2 f = fract(vUv * vec2(420., 160.)) - .5;
  float band = smoothstep(.12, .2, vD) * (1. - smoothstep(.42, .55, vD)) * (1. - smoothstep(.62, .7, vUv.y));
  float tw = .65 + .35 * sin(uT * (1. + r * 3.) + r * 40.);
  float light = step(.975, r) * band * smoothstep(.3, 0., length(f)) * tw;
  col += vec3(1., .72, .4) * light * 2.6 * uDusk;
  col *= mix(1., .85, uDusk);
  // vignette
  vec2 q = vUv - .5; col *= 1. - dot(q, q) * .9;
  gl_FragColor = vec4(col, 1.);
  #include <colorspace_fragment>
}`

function Lake({ mobile }) {
  const [map, dmap] = useLoader(THREE.TextureLoader, [`/portfolio/yts/img/129${mobile ? '-s' : ''}.webp`, '/portfolio/yts/depth/129.webp'])
  map.colorSpace = THREE.SRGBColorSpace
  const W = 12, Hh = W * 701 / 1800
  const geo = useMemo(() => new THREE.PlaneGeometry(W, Hh, mobile ? 160 : 300, mobile ? 64 : 118), [mobile])
  const u = useMemo(() => ({ uMap: { value: map }, uDepth: { value: dmap }, uAmount: { value: 1.6 }, uT: { value: 0 }, uDusk: { value: .55 } }), [map, dmap])
  const { camera, size } = useThree()
  useFrame(({ clock, pointer }, dt) => {
    const t = clock.elapsedTime
    u.uT.value = t
    u.uDusk.value = THREE.MathUtils.damp(u.uDusk.value, 1, .5, dt)
    // frame the photo so it always covers the viewport (with room for drift)
    const a = size.width / size.height, tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
    const z = Math.min((W * .78) / (2 * tan * a), (Hh * .78) / (2 * tan))
    camera.position.x = THREE.MathUtils.damp(camera.position.x, Math.sin(t * .06) * W * .04 + pointer.x * .25, 1.5, dt)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, Math.sin(t * .045) * .08 + pointer.y * .12 - .05, 1.5, dt)
    camera.position.z = THREE.MathUtils.damp(camera.position.z, z + Math.sin(t * .05) * .25, 1.5, dt)
    camera.lookAt(camera.position.x * .4, -.05, 0)
  })
  return <mesh geometry={geo}><shaderMaterial uniforms={u} vertexShader={vert} fragmentShader={frag} /></mesh>
}

export default function ContactLake({ active, mobile }) {
  return (
    <Canvas frameloop={active ? 'always' : 'never'} dpr={[1, mobile ? 1.3 : 1.5]} gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ fov: 35, position: [0, 0, 6], near: .1, far: 60 }} style={{ position: 'absolute', inset: 0 }}
      onCreated={({ gl }) => gl.setClearColor('#14161d')}>
      <Lake mobile={mobile} />
    </Canvas>
  )
}
