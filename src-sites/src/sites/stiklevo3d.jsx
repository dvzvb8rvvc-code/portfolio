import React, { useMemo, useRef, useLayoutEffect } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'

/* a road leaving Minsk: city blocks -> МКАД bridge -> fields -> pines -> small garage with warm light */
const cl = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const sm = (a, b, x) => { const t = cl((x - a) / (b - a)); return t * t * (3 - 2 * t) }
export const fx = z => Math.sin(z * 0.03) * 3.5 + (Math.sin(z * 0.012 + 1) - Math.sin(1)) * 5
const dfx = z => (fx(z + 0.05) - fx(z - 0.05)) / 0.1
const Z0 = 16, Z1 = -139, GZ = -147
const rnd = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647 })()
const C = s => new THREE.Color(s)

function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h
  draw(c.getContext('2d'), w, h)
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4
  return t
}

function ribbon(width, y, step = 0.6, z0 = Z0, z1 = Z1) {
  const pos = [], uv = [], idx = []
  let i = 0
  for (let z = z0; z >= z1; z -= step, i++) {
    const c = fx(z), d = dfx(z), l = Math.hypot(1, d), nx = 1 / l, nz = -d / l
    pos.push(c - nx * width, y, z - nz * width, c + nx * width, y, z + nz * width)
    uv.push(0, i * step * 0.25, 1, i * step * 0.25)
    if (i > 0) { const a = (i - 1) * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3) }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
  g.setIndex(idx); g.computeVertexNormals()
  return g
}

function useInstances(ref, list) {
  useLayoutEffect(() => {
    const m = new THREE.Object3D()
    list.forEach((o, i) => {
      m.position.set(o.x, o.y, o.z); m.rotation.set(0, o.ry || 0, 0); m.scale.set(o.sx ?? o.s ?? 1, o.sy ?? o.s ?? 1, o.sz ?? o.s ?? 1)
      m.updateMatrix(); ref.current.setMatrixAt(i, m.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  }, [list])
}

function Road() {
  const road = useMemo(() => ribbon(2.3, 0.03), [])
  const shoulder = useMemo(() => ribbon(3.4, 0.015), [])
  const dashes = useMemo(() => { const a = []; for (let z = Z0; z > Z1 + 2; z -= 3.2) a.push({ x: fx(z), y: 0.045, z, ry: Math.atan(dfx(z)) }); return a }, [])
  const ref = useRef()
  useInstances(ref, dashes)
  return (<group>
    <mesh geometry={shoulder}><meshStandardMaterial color="#6b6a5c" roughness={1} /></mesh>
    <mesh geometry={road}><meshStandardMaterial color="#26292a" roughness={0.85} /></mesh>
    <instancedMesh ref={ref} args={[null, null, dashes.length]}>
      <boxGeometry args={[0.12, 0.02, 1.3]} />
      <meshBasicMaterial color="#e8e2cf" toneMapped={false} />
    </instancedMesh>
  </group>)
}

function City() {
  const list = useMemo(() => {
    const a = []
    for (let i = 0; i < 70; i++) {
      const z = 18 - rnd() * 36, side = rnd() > 0.5 ? 1 : -1, d = 6 + rnd() * 20
      const h = (5 + rnd() * 16) * (z < -6 ? 0.55 : 1)
      a.push({ x: fx(z) + side * d, y: h / 2, z, sx: 3 + rnd() * 4, sy: h, sz: 3 + rnd() * 4, ry: rnd() * 0.3 })
    }
    return a
  }, [])
  const tex = useMemo(() => canvasTex(64, 128, (g, w, h) => {
    g.fillStyle = '#1b222b'; g.fillRect(0, 0, w, h)
    for (let y = 6; y < h - 6; y += 10) for (let x = 5; x < w - 5; x += 12) { g.fillStyle = Math.random() < 0.38 ? '#ffcf86' : '#2a333d'; g.fillRect(x, y, 6, 5) }
  }), [])
  const ref = useRef()
  useInstances(ref, list)
  return (
    <instancedMesh ref={ref} args={[null, null, list.length]}>
      <boxGeometry />
      <meshStandardMaterial map={tex} emissiveMap={tex} emissive="#ffffff" emissiveIntensity={0.55} roughness={0.8} />
    </instancedMesh>
  )
}

function Lamps() {
  const list = useMemo(() => { const a = []; for (let z = 12; z > -60; z -= 9) a.push({ x: fx(z) + 3.4, y: 0, z }); return a }, [])
  const post = useRef(), bulb = useRef()
  useInstances(post, list.map(o => ({ ...o, y: 2.2 })))
  useInstances(bulb, list.map(o => ({ ...o, x: o.x - 0.7, y: 4.35 })))
  return (<group>
    <instancedMesh ref={post} args={[null, null, list.length]}><cylinderGeometry args={[0.06, 0.08, 4.4, 6]} /><meshStandardMaterial color="#3a3f40" /></instancedMesh>
    <instancedMesh ref={bulb} args={[null, null, list.length]}><boxGeometry args={[1.5, 0.12, 0.28]} /><meshBasicMaterial color="#ffe2a8" toneMapped={false} /></instancedMesh>
  </group>)
}

function Sign({ z, side = 1, draw, w = 2, h = 1 }) {
  const tex = useMemo(() => canvasTex(512, 256, draw), [draw])
  const x = fx(z) + side * 3.3, ry = Math.atan(dfx(z))
  return (
    <group position={[x, 0, z]} rotation={[0, ry, 0]}>
      <mesh position={[0, 1.1, -0.02]}><cylinderGeometry args={[0.05, 0.05, 2.2, 6]} /><meshStandardMaterial color="#8d9290" /></mesh>
      <mesh position={[0, 2.2 + h / 2, 0]}><planeGeometry args={[w, h]} /><meshStandardMaterial map={tex} emissiveMap={tex} emissive="#ffffff" emissiveIntensity={0.35} roughness={0.5} /></mesh>
    </group>
  )
}
const drawEnd = (g, w, h) => {
  g.fillStyle = '#f4f2ec'; g.fillRect(0, 0, w, h); g.lineWidth = 16; g.strokeStyle = '#111'; g.strokeRect(14, 14, w - 28, h - 28)
  g.fillStyle = '#111'; g.font = 'bold 104px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('МИНСК', w / 2, h / 2 + 6)
  g.strokeStyle = '#d0262b'; g.lineWidth = 22; g.beginPath(); g.moveTo(40, h - 30); g.lineTo(w - 40, 30); g.stroke()
}
const drawVillage = (g, w, h) => {
  g.fillStyle = '#f4f2ec'; g.fillRect(0, 0, w, h); g.lineWidth = 16; g.strokeStyle = '#111'; g.strokeRect(14, 14, w - 28, h - 28)
  g.fillStyle = '#111'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = 'bold 76px Arial'
  g.fillText('Большое', w / 2, h / 2 - 44); g.fillText('Стиклево', w / 2, h / 2 + 46)
}

function Bridge() {
  const z = -36, c = fx(z)
  const tex = useMemo(() => canvasTex(512, 128, (g, w, h) => { g.fillStyle = '#1f4a34'; g.fillRect(0, 0, w, h); g.strokeStyle = '#fff'; g.lineWidth = 6; g.strokeRect(8, 8, w - 16, h - 16); g.fillStyle = '#fff'; g.font = 'bold 74px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('МКАД', w / 2, h / 2 + 4) }), [])
  return (
    <group position={[c, 0, z]} rotation={[0, Math.atan(dfx(z)), 0]}>
      <mesh position={[0, 5.4, 0]}><boxGeometry args={[70, 1.1, 7]} /><meshStandardMaterial color="#77786f" roughness={0.9} /></mesh>
      <mesh position={[0, 6.2, 3.3]}><boxGeometry args={[70, 0.5, 0.25]} /><meshStandardMaterial color="#5f605a" /></mesh>
      {[-5.5, 5.5, -16, 16].map(x => <mesh key={x} position={[x, 2.45, 0]}><boxGeometry args={[1, 4.9, 2.4]} /><meshStandardMaterial color="#6c6d66" roughness={0.9} /></mesh>)}
      <mesh position={[0, 4.35, 3.6]}><planeGeometry args={[3.2, 0.8]} /><meshStandardMaterial map={tex} emissiveMap={tex} emissive="#ffffff" emissiveIntensity={0.4} /></mesh>
    </group>
  )
}

function Pines({ lite }) {
  const list = useMemo(() => {
    const a = [], n = lite ? 230 : 460
    for (let i = 0; i < n; i++) {
      const t = Math.pow(rnd(), 0.7), z = -64 - t * 120
      const side = rnd() > 0.5 ? 1 : -1, d = 4.6 + Math.pow(rnd(), 1.4) * 40
      let x = fx(z) + side * d
      if (z < GZ + 8 && z > GZ - 12 && Math.abs(x - fx(GZ)) < 9) x += side * 9
      a.push({ x, z, s: 0.75 + rnd() * 1.1 })
    }
    // sparse field trees
    for (let i = 0; i < 18; i++) { const z = -42 - rnd() * 22, side = rnd() > 0.5 ? 1 : -1; a.push({ x: fx(z) + side * (8 + rnd() * 26), z, s: 0.7 + rnd() * 0.6 }) }
    return a
  }, [lite])
  const a = useRef(), b2 = useRef(), t = useRef()
  useInstances(a, list.map(o => ({ x: o.x, z: o.z, y: 2.3 * o.s, s: o.s })))
  useInstances(b2, list.map(o => ({ x: o.x, z: o.z, y: 3.9 * o.s, s: o.s })))
  useInstances(t, list.map(o => ({ x: o.x, z: o.z, y: 0.7 * o.s, s: o.s })))
  return (<group>
    <instancedMesh ref={t} args={[null, null, list.length]}><cylinderGeometry args={[0.13, 0.18, 1.4, 5]} /><meshStandardMaterial color="#4a3426" roughness={1} /></instancedMesh>
    <instancedMesh ref={a} args={[null, null, list.length]}><coneGeometry args={[1.25, 3, 7]} /><meshStandardMaterial color="#1d3a2a" roughness={0.95} flatShading /></instancedMesh>
    <instancedMesh ref={b2} args={[null, null, list.length]}><coneGeometry args={[0.85, 2.3, 7]} /><meshStandardMaterial color="#25472f" roughness={0.95} flatShading /></instancedMesh>
  </group>)
}

function Bales() {
  const list = useMemo(() => { const a = []; for (let i = 0; i < 10; i++) { const z = -44 - rnd() * 20, side = i % 2 ? 1 : -1; a.push({ x: fx(z) + side * (6 + rnd() * 14), y: 0.55, z, ry: rnd() * 3 }) } return a }, [])
  const ref = useRef()
  useLayoutEffect(() => {
    const m = new THREE.Object3D()
    list.forEach((o, i) => { m.position.set(o.x, o.y, o.z); m.rotation.set(0, o.ry, Math.PI / 2); m.updateMatrix(); ref.current.setMatrixAt(i, m.matrix) })
    ref.current.instanceMatrix.needsUpdate = true
  }, [list])
  return <instancedMesh ref={ref} args={[null, null, list.length]}><cylinderGeometry args={[0.55, 0.55, 1.1, 14]} /><meshStandardMaterial color="#b49a5c" roughness={1} /></instancedMesh>
}

function Garage({ progress }) {
  const x = fx(GZ)
  const roof = useMemo(() => {
    const s = new THREE.Shape(); s.moveTo(-5, 0); s.lineTo(5, 0); s.lineTo(0, 1.9); s.closePath()
    const g = new THREE.ExtrudeGeometry(s, { depth: 7.6, bevelEnabled: false }); g.translate(0, 0, -3.8); return g
  }, [])
  const door = useMemo(() => canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#c9c6ba'; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 16) { g.fillStyle = '#9d9a8f'; g.fillRect(0, y, w, 3) } }), [])
  const sign = useMemo(() => canvasTex(512, 160, (g, w, h) => { g.fillStyle = '#0f1d16'; g.fillRect(0, 0, w, h); g.fillStyle = '#f2c46a'; g.font = 'bold 110px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('СТО', w / 2, h / 2 + 6) }), [])
  const light = useRef(), glow = useRef()
  useFrame(() => {
    const p = progress.get(), k = sm(0.55, 0.95, p)
    if (light.current) light.current.intensity = 4 + k * 26
    if (glow.current) glow.current.material.opacity = 0.25 + k * 0.6
  })
  return (
    <group position={[x, 0, GZ]}>
      <mesh position={[0, 0.01, 6]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[9, 32]} /><meshStandardMaterial color="#5e5c50" roughness={1} /></mesh>
      <mesh position={[0, 1.9, 0]}><boxGeometry args={[9.4, 3.8, 7]} /><meshStandardMaterial color="#cfc8b6" roughness={0.9} /></mesh>
      <mesh position={[0, 3.8, 0]} geometry={roof}><meshStandardMaterial color="#1f3a2b" roughness={0.6} metalness={0.3} /></mesh>
      {/* half-open roller door, warm light from inside */}
      <mesh position={[-1.6, 2.35, 3.51]}><planeGeometry args={[4.4, 2.3]} /><meshStandardMaterial map={door} roughness={0.7} /></mesh>
      <mesh ref={glow} position={[-1.6, 0.6, 3.51]}><planeGeometry args={[4.4, 1.2]} /><meshBasicMaterial color="#ffc36b" transparent opacity={0.5} toneMapped={false} /></mesh>
      <mesh position={[-1.6, 0.6, 3.5]}><planeGeometry args={[4.4, 1.2]} /><meshBasicMaterial color="#ffb24d" toneMapped={false} /></mesh>
      <mesh position={[2.9, 2.1, 3.51]}><planeGeometry args={[1.6, 1]} /><meshBasicMaterial color="#ffd48a" toneMapped={false} /></mesh>
      <mesh position={[-1.6, 3.95, 3.52]}><planeGeometry args={[2.4, 0.75]} /><meshStandardMaterial map={sign} emissiveMap={sign} emissive="#ffffff" emissiveIntensity={0.9} /></mesh>
      <pointLight ref={light} position={[-1.4, 2.4, 5.5]} color="#ffb862" distance={22} decay={1.6} />
    </group>
  )
}

function Ground() {
  return (<group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -70]}><planeGeometry args={[400, 260]} /><meshStandardMaterial color="#2a3d2a" roughness={1} /></mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 4]}><planeGeometry args={[140, 44]} /><meshStandardMaterial color="#3a3f3c" roughness={1} /></mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-22, 0.006, -54]}><planeGeometry args={[34, 20]} /><meshStandardMaterial color="#5d6a3a" roughness={1} /></mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[26, 0.006, -50]}><planeGeometry args={[30, 24]} /><meshStandardMaterial color="#4c5d34" roughness={1} /></mesh>
  </group>)
}

const SKY_T = [C('#2a3647'), C('#173328'), C('#0e2119')]
const SKY_H = [C('#8b94a0'), C('#b9a27c'), C('#d9935a')]
const tmp = new THREE.Color(), tmp2 = new THREE.Color()
const pal = (arr, p, out) => p < 0.5 ? out.copy(arr[0]).lerp(arr[1], sm(0, 0.5, p)) : out.copy(arr[1]).lerp(arr[2], sm(0.5, 1, p))

function Sky({ progress }) {
  const u = useMemo(() => ({ uTop: { value: new THREE.Color() }, uHor: { value: new THREE.Color() } }), [])
  useFrame(() => { const p = progress.get(); pal(SKY_T, p, u.uTop.value); pal(SKY_H, p, u.uHor.value) })
  return (
    <mesh scale={190}>
      <sphereGeometry args={[1, 32, 16]} />
      <shaderMaterial side={THREE.BackSide} depthWrite={false} fog={false} uniforms={u}
        vertexShader={`varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`}
        fragmentShader={`varying vec3 vD; uniform vec3 uTop, uHor; void main(){ float h = clamp(vD.y*2.4,0.,1.); vec3 c = mix(uHor, uTop, pow(h,.6)); gl_FragColor = vec4(c,1.); }`} />
    </mesh>
  )
}

function Rig({ progress }) {
  const { camera, scene, size } = useThree()
  const look = useMemo(() => new THREE.Vector3(), [])
  const hemi = useRef(), sun = useRef()
  useFrame(st => {
    const p = progress.get(), mob = size.width < 768
    const z = THREE.MathUtils.lerp(11, -131, sm(0, 1, p) * 0.15 + p * 0.85)
    const lift = Math.sin(cl(p) * Math.PI) * 0.5
    camera.position.set(fx(z) - 0.9 + st.pointer.x * 0.25, 1.6 + lift + st.pointer.y * 0.1 + (mob ? 0.4 : 0), z + (mob ? 3 : 0))
    const lz = z - 12
    look.set(THREE.MathUtils.lerp(fx(lz), fx(GZ) - 1, sm(0.82, 1, p)), 1.6 + sm(0.82, 1, p) * 0.6, THREE.MathUtils.lerp(lz, GZ, sm(0.82, 1, p)))
    camera.lookAt(look)
    if (camera.fov !== (mob ? 62 : 50)) { camera.fov = mob ? 62 : 50; camera.updateProjectionMatrix() }
    scene.fog.color.copy(pal(SKY_H, p, tmp))
    hemi.current.color.copy(pal(SKY_H, p, tmp2)).lerp(C('#ffffff'), 0.3)
    sun.current.intensity = 1.2 - sm(0.6, 1, p) * 0.6
  })
  return (<>
    <hemisphereLight ref={hemi} groundColor="#1b2a1e" intensity={1.1} />
    <directionalLight ref={sun} position={[-30, 18, -120]} color="#ffd2a0" />
  </>)
}

export default function Road3D({ progress, active, lite }) {
  return (
    <Canvas frameloop={active ? 'always' : 'never'} dpr={[1, 1.6]} camera={{ position: [0, 1.6, 11], fov: 50, near: 0.1, far: 400 }} gl={{ antialias: true }} style={{ pointerEvents: 'none' }}
      eventSource={typeof document !== 'undefined' ? document.getElementById('root') : undefined} eventPrefix="client">
      <fog attach="fog" args={['#8b94a0', 18, 120]} />
      <Environment resolution={64} frames={1}>
        <Lightformer form="rect" intensity={1.2} color="#ffd8a8" position={[0, 6, -10]} scale={[12, 4, 1]} />
        <Lightformer form="rect" intensity={0.6} color="#9fc2b0" position={[-8, 4, 6]} scale={[8, 4, 1]} />
      </Environment>
      <Rig progress={progress} />
      <Sky progress={progress} />
      <Ground />
      <Road />
      <City />
      <Lamps />
      <Bridge />
      <Sign z={-24} draw={drawEnd} />
      <Sign z={-97} draw={drawVillage} />
      <Bales />
      <Pines lite={lite} />
      <Garage progress={progress} />
    </Canvas>
  )
}
