import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'

// chapter ranges — must match veronika.jsx
const R = [[0.18, 0.34], [0.38, 0.54], [0.58, 0.74], [0.78, 0.92]]
const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }

const vert = /* glsl */`
attribute float aSeed;
attribute float aLane;
uniform float uTime, uCurl, uSpread;
varying float vX; varying float vSeed; varying vec3 vN; varying vec3 vT; varying vec3 vV;
vec3 path(float x){
  float t = uTime * 0.32;
  vec3 c = vec3(x * 3.2, sin(x * 2.3 + t) * 0.42 + sin(x * 5.0 - t * 0.7 + aSeed * 2.0) * 0.06, cos(x * 1.6 + t * 0.8) * 0.32);
  float a = x * 2.0 + t * 0.45;
  float w = aLane * 0.95 * uSpread;
  float d = (aSeed - 0.5) * 0.45 * uSpread;
  c.y += sin(x * 3.1 + aSeed * 6.2831 + t * 1.3) * 0.07;
  c.z += cos(x * 2.7 + aSeed * 4.0 + t) * 0.07;
  c.y += cos(a) * w - sin(a) * d;
  c.z += sin(a) * w + cos(a) * d;
  float ph = x * 34.0 + aSeed * 6.2831 + t * 0.4;
  float r = 0.055 * uCurl * smoothstep(-0.9, 0.3, x);
  c.y += cos(ph) * r; c.z += sin(ph) * r;
  return c;
}
void main(){
  float x = position.x;
  vec3 p = path(x);
  vec3 T = normalize(path(x + 0.004) - p);
  vec3 up = abs(T.y) < 0.9 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
  vec3 B = normalize(cross(T, up));
  vec3 N = cross(B, T);
  vec3 w = p + N * position.y + B * position.z;
  vN = normalize(normalMatrix * (N * normal.y + B * normal.z));
  vT = normalize(normalMatrix * T);
  vec4 mv = modelViewMatrix * vec4(w, 1.0);
  vV = normalize(-mv.xyz);
  vX = x; vSeed = aSeed;
  gl_Position = projectionMatrix * mv;
}`
const frag = /* glsl */`
uniform float uCut, uColor, uGloss;
uniform vec3 cA, cB, cC, cD;
varying float vX; varying float vSeed; varying vec3 vN; varying vec3 vT; varying vec3 vV;
void main(){
  float end = mix(1.0, 0.25 + vSeed * 0.07, uCut);
  if (vX > end) discard;
  vec3 base = mix(cA, cB, vSeed);
  vec3 dyed = mix(cC, cD, vSeed);
  float sweep = mix(1.3, -1.3, uColor);
  float m = smoothstep(sweep - 0.25, sweep + 0.25, vX);
  vec3 col = mix(base, dyed, m);
  vec3 L = normalize(vec3(0.35, 0.8, 0.6));
  vec3 N = normalize(vN);
  float dif = 0.5 + 0.5 * max(dot(N, L), 0.0);
  vec3 H = normalize(L + vV);
  float th = dot(normalize(vT), H);
  float spec = pow(sqrt(max(0.0, 1.0 - th * th)), 70.0) * (0.25 + 0.6 * uGloss);
  float spec2 = pow(sqrt(max(0.0, 1.0 - th * th)), 12.0) * 0.12;
  col = col * dif + spec * vec3(1.0, 0.92, 0.82) + spec2 * col;
  gl_FragColor = vec4(col, 1.0);
}`

function Strands({ progress, count }) {
  const mesh = useRef(), grp = useRef()
  const { size } = useThree()
  const geo = useMemo(() => {
    const g = new THREE.CylinderGeometry(0.013, 0.013, 2, 5, 160, true)
    g.rotateZ(-Math.PI / 2)
    const seeds = new Float32Array(count), lanes = new Float32Array(count)
    for (let i = 0; i < count; i++) { seeds[i] = Math.random(); lanes[i] = (i / (count - 1)) * 2 - 1 + (Math.random() - 0.5) * 0.04 }
    g.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 1))
    g.setAttribute('aLane', new THREE.InstancedBufferAttribute(lanes, 1))
    return g
  }, [count])
  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: vert, fragmentShader: frag, side: THREE.DoubleSide,
    uniforms: {
      uTime: { value: 0 }, uCurl: { value: 0 }, uSpread: { value: 1 }, uCut: { value: 0 }, uColor: { value: 0 }, uGloss: { value: 0.2 },
      cA: { value: new THREE.Color('#5a3322') }, cB: { value: new THREE.Color('#94573a') }, cC: { value: new THREE.Color('#bb6a3d') }, cD: { value: new THREE.Color('#e3ad74') },
    },
  }), [])
  const dummy = useMemo(() => new THREE.Object3D(), [])
  React.useLayoutEffect(() => {
    for (let i = 0; i < count; i++) mesh.current.setMatrixAt(i, dummy.matrix)
    mesh.current.instanceMatrix.needsUpdate = true
  }, [count, dummy])
  const st = useRef({ cut: 0, col: 0, curl: 0, gloss: 0.2, spread: 1 })
  useFrame((s, dt) => {
    const p = progress.get(), u = mat.uniforms, k = Math.min(1, dt * 4), v = st.current
    v.cut += (ss(...R[0], p) - v.cut) * k
    v.col += (ss(...R[1], p) - v.col) * k
    v.curl += (ss(...R[2], p) - v.curl) * k
    const g = ss(...R[3], p)
    v.gloss += (0.2 + g * 0.8 - v.gloss) * k
    v.spread += (1 - g * 0.45 - v.spread) * k
    u.uTime.value += dt
    u.uCut.value = v.cut; u.uColor.value = v.col; u.uCurl.value = v.curl; u.uGloss.value = v.gloss; u.uSpread.value = v.spread
    const asp = size.width / size.height
    grp.current.rotation.z = asp > 1.1 ? -0.95 : -0.6
    grp.current.position.set(asp > 1.1 ? 0.2 : 0.15, asp > 1.1 ? 0.3 : 0.2, 0)
    grp.current.scale.setScalar(asp > 1.1 ? 0.62 : 0.5)
    grp.current.rotation.y = Math.sin(u.uTime.value * 0.15) * 0.15 + s.pointer.x * 0.08
  })
  return <group ref={grp}><instancedMesh ref={mesh} args={[geo, mat, count]} frustumCulled={false} /></group>
}

export default function StrandsScene({ progress, active, count = 70 }) {
  return (
    <Canvas frameloop={active ? 'always' : 'never'} dpr={[1, 1.6]} camera={{ position: [0, 0, 6], fov: 35 }} gl={{ antialias: true, alpha: true }} style={{ pointerEvents: 'none' }}>
      <Strands progress={progress} count={count} />
    </Canvas>
  )
}
