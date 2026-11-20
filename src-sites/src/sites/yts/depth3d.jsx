import React, { useMemo, useRef } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'

/* Shared: turn one of his photos into real 3D using its depth map.
   Depth maps: /portfolio/yts/depth/<id>.webp (white = near). Available ids: see public/yts/depth/.
   <DepthPhoto id={148} width={4} depth={0.9} progress={ref} />   (render inside any R3F <Canvas>)
   - depth: how far near pixels pop toward camera (world units)
   - progress: optional ref({current:0..1}) → reveal from flat (0) to full depth (1)
   - pointer parallax comes from moving the camera; the mesh is real geometry, so the camera can fly into it.
   - edge stretching is hidden by a soft vignette alpha (edgeFade). */
export const depthUrl = id => `/portfolio/yts/depth/${id}.webp`
export const photoUrl = (id, small) => `/portfolio/yts/img/${id}${small ? '-s' : ''}.webp`

const vert = /* glsl */`
uniform sampler2D uDepth; uniform float uAmount; uniform float uReveal;
varying vec2 vUv; varying float vD;
void main(){
  vUv = uv;
  float d = texture2D(uDepth, uv).r;
  vD = d;
  vec3 p = position + normal * (d * uAmount * uReveal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`
const frag = /* glsl */`
uniform sampler2D uMap; uniform float uEdge; uniform float uOpacity; uniform float uFog; uniform vec3 uFogColor;
varying vec2 vUv; varying float vD;
void main(){
  vec4 c = texture2D(uMap, vUv);
  vec2 e = smoothstep(vec2(0.0), vec2(uEdge), vUv) * smoothstep(vec2(0.0), vec2(uEdge), 1.0 - vUv);
  float a = e.x * e.y * uOpacity;
  vec3 col = mix(c.rgb, uFogColor, (1.0 - vD) * uFog);
  gl_FragColor = vec4(col, a);
  #include <colorspace_fragment>
}`

export function DepthPhoto({ id, width = 4, depth = 0.8, segments = 220, progress, edgeFade = 0.06, opacity = 1, fog = 0, fogColor = '#ece7df', small = false, ...props }) {
  const [map, dmap] = useLoader(THREE.TextureLoader, [photoUrl(id, small), depthUrl(id)])
  map.colorSpace = THREE.SRGBColorSpace
  map.anisotropy = 4
  const aspect = map.image ? map.image.height / map.image.width : 0.6
  const geo = useMemo(() => new THREE.PlaneGeometry(width, width * aspect, segments, Math.round(segments * aspect)), [width, aspect, segments])
  const mat = useRef()
  const uniforms = useMemo(() => ({
    uMap: { value: map }, uDepth: { value: dmap }, uAmount: { value: depth }, uReveal: { value: progress ? 0 : 1 },
    uEdge: { value: edgeFade }, uOpacity: { value: opacity }, uFog: { value: fog }, uFogColor: { value: new THREE.Color(fogColor) },
  }), [map, dmap])
  useFrame((_, dt) => {
    const u = mat.current?.uniforms; if (!u) return
    u.uAmount.value = depth; u.uOpacity.value = opacity; u.uFog.value = fog
    if (progress) u.uReveal.value = THREE.MathUtils.damp(u.uReveal.value, progress.current ?? 0, 6, dt)
  })
  return (
    <mesh geometry={geo} {...props}>
      <shaderMaterial ref={mat} uniforms={uniforms} vertexShader={vert} fragmentShader={frag} transparent depthWrite />
    </mesh>
  )
}

/* Camera that drifts with the pointer (adds true parallax to DepthPhoto). Put inside Canvas. */
export function PointerDrift({ amount = 0.35, base = [0, 0, 5], lookAt = [0, 0, 0] }) {
  useFrame(({ camera, pointer }, dt) => {
    camera.position.x = THREE.MathUtils.damp(camera.position.x, base[0] + pointer.x * amount, 3, dt)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, base[1] + pointer.y * amount * 0.6, 3, dt)
    camera.position.z = THREE.MathUtils.damp(camera.position.z, base[2], 3, dt)
    camera.lookAt(...lookAt)
  })
  return null
}
