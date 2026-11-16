import React, { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, RoundedBox } from '@react-three/drei'

/* wand travels a path that runs down the backrest, then forward across the cushion.
   param u: 2.7 (above headrest) -> -2.2 (front edge of cushion) */
const U_TOP = 2.75, U_END = -2.3
const VERT = `
varying vec3 vS; varying vec3 vN; varying vec3 vW;
uniform mat4 uInv;
void main(){
  vec4 w = modelMatrix * vec4(position,1.);
  vW = w.xyz; vS = (uInv * w).xyz;
  vN = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * w;
}`
const FRAG = `
uniform vec3 uBase; uniform float uWand; uniform float uStain;
varying vec3 vS; varying vec3 vN; varying vec3 vW;
float h(vec3 p){ p = fract(p*.3183099+.1); p *= 17.; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
float n3(vec3 x){ vec3 i=floor(x), f=fract(x); f=f*f*(3.-2.*f);
  return mix(mix(mix(h(i),h(i+vec3(1,0,0)),f.x),mix(h(i+vec3(0,1,0)),h(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(h(i+vec3(0,0,1)),h(i+vec3(1,0,1)),f.x),mix(h(i+vec3(0,1,1)),h(i+vec3(1,1,1)),f.x),f.y),f.z); }
float fbm(vec3 p){ float a=.5, s=0.; for(int i=0;i<4;i++){ s+=a*n3(p); p*=2.03; a*=.5; } return s; }
void main(){
  vec3 n = normalize(vN);
  vec3 L = normalize(vec3(.5,.9,.7));
  float dif = max(dot(n,L),0.);
  float hemi = .5 + .5*n.y;
  vec3 V = normalize(cameraPosition - vW);
  float rim = pow(1. - max(dot(n,V),0.), 3.);
  vec3 col = uBase * (.32 + .38*hemi + .55*dif);
  col += (sin(vS.x*140.)*sin(vS.y*140.+vS.z*140.))*.018;
  float u = vS.y > -.42 ? vS.y : -.42 - (vS.z + .75);
  float s = fbm(vS*2.4 + 3.1);
  float stain = smoothstep(.55,.66,s) * uStain;
  float spot = smoothstep(.72,.76,fbm(vS*5.+9.)) * uStain;
  float clean = smoothstep(uWand - .18, uWand + .18, u);
  stain = max(stain, spot*.8) * (1. - clean);
  col = mix(col, col*vec3(.5,.4,.27), stain*.85);
  float line = exp(-pow((u - uWand)*10.,2.));
  col += vec3(.45,1.,.82) * line * .3;
  col += vec3(.75,1.,.92) * rim * .25;
  gl_FragColor = vec4(col,1.);
  #include <colorspace_fragment>
}`

function useFabric(hex, shared) {
  return useMemo(() => new THREE.ShaderMaterial({
    vertexShader: VERT, fragmentShader: FRAG,
    uniforms: { uBase: { value: new THREE.Color(hex) }, uWand: shared.uWand, uInv: shared.uInv, uStain: { value: 1 } },
  }), [hex, shared])
}

function wandPos(u, x, out) {
  if (u > -.42) out.set(x, u, -.2 + Math.max(0, u) * .06)
  else out.set(x, -.05, -.75 + (-.42 - u))
  return out
}

function Seat({ progress, steam }) {
  const g = useRef(), wand = useRef()
  const { size, viewport } = useThree()
  const mob = size.width < 768
  const shared = useMemo(() => ({ uWand: { value: U_TOP + .3 }, uInv: { value: new THREE.Matrix4() } }), [])
  const fabric = useFabric('#c4cdd2', shared), insert = useFabric('#e6ecee', shared), dark = useFabric('#56636c', shared)
  const tmp = useMemo(() => new THREE.Vector3(), [])
  useFrame((st, dt) => {
    const p = progress ? progress.get() : 0
    const t = st.clock.elapsedTime
    const target = U_TOP + .3 - Math.min(1, p * 1.15) * (U_TOP + .3 - U_END)
    shared.uWand.value += (target - shared.uWand.value) * Math.min(1, dt * 6)
    const G = g.current
    G.rotation.y += ((-.62 + st.pointer.x * .35) - G.rotation.y) * Math.min(1, dt * 2.5)
    G.rotation.x += ((.12 - st.pointer.y * .12) - G.rotation.x) * Math.min(1, dt * 2.5)
    G.position.set(mob ? 0 : viewport.width * .2, (mob ? viewport.height * .28 : -.25) + Math.sin(t * .8) * .05, 0)
    G.scale.setScalar(mob ? .48 : 1)
    G.updateMatrixWorld()
    shared.uInv.value.copy(G.matrixWorld).invert()
    const sweep = Math.sin(t * 2.2) * .62
    wandPos(shared.uWand.value, sweep, tmp)
    wand.current.position.copy(tmp)
    wand.current.rotation.set(shared.uWand.value > -.42 ? -.35 : -1.1, 0, sweep * .25)
    wand.current.visible = shared.uWand.value < U_TOP + .2 && shared.uWand.value > U_END - .1
    wand.current.getWorldPosition(steam.current.nozzle)
    steam.current.active = wand.current.visible
  })
  return (
    <group ref={g}>
      {/* cushion */}
      <RoundedBox args={[1.9, .42, 1.75]} radius={.17} smoothness={3} position={[0, -.62, 0]} material={fabric} />
      <RoundedBox args={[1.15, .08, 1.45]} radius={.04} smoothness={2} position={[0, -.39, .05]} material={insert} />
      {[-1, 1].map(s => <RoundedBox key={s} args={[.34, .6, 1.75]} radius={.15} smoothness={3} position={[s * 1.02, -.52, 0]} material={fabric} />)}
      {/* backrest */}
      <group position={[0, -.45, -.82]} rotation-x={-.16}>
        <RoundedBox args={[1.9, 2.5, .44]} radius={.18} smoothness={3} position={[0, 1.25, 0]} material={fabric} />
        <RoundedBox args={[1.15, 2.0, .08]} radius={.04} smoothness={2} position={[0, 1.22, .23]} material={insert} />
        {[-1, 1].map(s => <RoundedBox key={s} args={[.34, 2.3, .62]} radius={.15} smoothness={3} position={[s * 1.02, 1.2, .08]} material={fabric} />)}
        {[-.22, .22].map(x => <mesh key={x} position={[x, 2.66, 0]}><cylinderGeometry args={[.035, .035, .4, 10]} /><meshStandardMaterial color="#d9e0e3" metalness={1} roughness={.25} /></mesh>)}
        <RoundedBox args={[1.05, .55, .36]} radius={.16} smoothness={3} position={[0, 3.05, 0]} material={fabric} />
      </group>
      {/* base rails */}
      <RoundedBox args={[1.7, .18, 1.5]} radius={.06} smoothness={2} position={[0, -.95, 0]} material={dark} />
      {/* steam wand */}
      <group ref={wand}>
        <mesh position={[0, 0, .55]} rotation-x={Math.PI / 2}><cylinderGeometry args={[.06, .085, 1.1, 16]} /><meshStandardMaterial color="#e9eef0" metalness={1} roughness={.18} /></mesh>
        <mesh position={[0, 0, .02]} rotation-x={Math.PI / 2}><cylinderGeometry args={[.16, .1, .14, 20]} /><meshStandardMaterial color="#3ccfa5" metalness={.3} roughness={.3} /></mesh>
        <mesh position={[0, 0, 1.25]} rotation-x={Math.PI / 2}><cylinderGeometry args={[.1, .1, .5, 16]} /><meshStandardMaterial color="#24313b" roughness={.5} /></mesh>
      </group>
    </group>
  )
}

/* soft additive steam sprites */
const PV = `attribute float aSize; attribute float aAlpha; varying float vA;
void main(){ vec4 mv = modelViewMatrix * vec4(position,1.); gl_PointSize = aSize * (300. / -mv.z); vA = aAlpha; gl_Position = projectionMatrix * mv; }`
const PF = `varying float vA; void main(){ float d = length(gl_PointCoord - .5); float a = smoothstep(.5, 0., d); gl_FragColor = vec4(vec3(.86,1.,.95), a*a*vA); }`

function Steam({ count, steam }) {
  const pts = useRef()
  const { viewport } = useThree()
  const st0 = useMemo(() => {
    const pos = new Float32Array(count * 3), size = new Float32Array(count), alpha = new Float32Array(count)
    const P = Array.from({ length: count }, (_, i) => ({ life: Math.random(), max: 2 + Math.random() * 2.5, vx: 0, vy: 0, vz: 0, s: .6 + Math.random() * 1.4, amb: i % 3 === 0 }))
    return { pos, size, alpha, P }
  }, [count])
  const mat = useMemo(() => new THREE.ShaderMaterial({ vertexShader: PV, fragmentShader: PF, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }), [])
  useFrame((s, dt) => {
    dt = Math.min(dt, .05)
    const { pos, size, alpha, P } = st0
    const px = s.pointer.x * viewport.width / 2, py = s.pointer.y * viewport.height / 2
    const nz = steam.current.nozzle
    P.forEach((p, i) => {
      p.life += dt / p.max
      if (p.life >= 1 || (pos[i * 3 + 1] === 0 && pos[i * 3] === 0)) {
        p.life = 0
        if (p.amb || !steam.current.active) {
          pos[i * 3] = (Math.random() - .5) * viewport.width; pos[i * 3 + 1] = -viewport.height / 2 - .5; pos[i * 3 + 2] = (Math.random() - .5) * 3 - 1
          p.vx = (Math.random() - .5) * .1; p.vy = .25 + Math.random() * .35; p.vz = 0
        } else {
          pos[i * 3] = nz.x + (Math.random() - .5) * .15; pos[i * 3 + 1] = nz.y + (Math.random() - .5) * .1; pos[i * 3 + 2] = nz.z + .1
          p.vx = (Math.random() - .5) * .7; p.vy = .5 + Math.random() * .7; p.vz = (Math.random() - .2) * .5
        }
      }
      const x = pos[i * 3], y = pos[i * 3 + 1]
      const dx = x - px, dy = y - py, d2 = dx * dx + dy * dy
      if (d2 < 1.6) { const f = (1.6 - d2) * 2.2 * dt; p.vx += dx * f; p.vy += dy * f }
      p.vx *= .985; p.vy = p.vy * .99 + .12 * dt
      pos[i * 3] += (p.vx + Math.sin(s.clock.elapsedTime * .8 + i) * .05) * dt
      pos[i * 3 + 1] += p.vy * dt; pos[i * 3 + 2] += p.vz * dt
      size[i] = p.s * (.35 + p.life * 1.6) * (p.amb ? 1.6 : 1)
      alpha[i] = Math.sin(p.life * Math.PI) * (p.amb ? .22 : .42)
    })
    const g = pts.current.geometry
    g.attributes.position.needsUpdate = true; g.attributes.aSize.needsUpdate = true; g.attributes.aAlpha.needsUpdate = true
  })
  return (
    <points ref={pts} material={mat} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={st0.pos} count={count} itemSize={3} />
        <bufferAttribute attach="attributes-aSize" array={st0.size} count={count} itemSize={1} />
        <bufferAttribute attach="attributes-aAlpha" array={st0.alpha} count={count} itemSize={1} />
      </bufferGeometry>
    </points>
  )
}

export default function Scene({ progress }) {
  const mob = typeof window !== 'undefined' && innerWidth < 768
  const steam = useRef({ nozzle: new THREE.Vector3(), active: false })
  const src = typeof document !== 'undefined' ? document.getElementById('root') : undefined
  return (
    <Canvas dpr={[1, 1.6]} camera={{ position: [0, .6, 8.5], fov: 42 }} gl={{ antialias: true, alpha: true }} eventSource={src} eventPrefix="client" style={{ pointerEvents: 'none' }}>
      <Seat progress={progress} steam={steam} />
      <Steam count={mob ? 160 : 300} steam={steam} />
      <Environment resolution={128}>
        <color attach="background" args={['#1c262e']} />
        <Lightformer form="rect" intensity={4} position={[0, 5, 2]} scale={[10, 3, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={2.5} position={[-5, 1, 1]} rotation-y={Math.PI / 2} scale={[8, 3, 1]} color="#9ff0d6" />
      </Environment>
    </Canvas>
  )
}
