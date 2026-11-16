import React, { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, ContactShadows } from '@react-three/drei'

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const sm = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t) }
const lerp = THREE.MathUtils.lerp
const WARM = '#e07a4f'
const DX = 0.7, TOP = -7, FRONT = 2.5
const EPI = 0.7, DER = 2.1, HYP = 2.4

/* camera keyframes: lab -> follow the drop -> surface -> dive through layers */
const KEYS = [
  [0, [0, 1.3, 8.2], [0, 1.0, 0]],
  [0.1, [0, 1.2, 7.6], [0.2, 0.9, 0]],
  [0.22, [0.4, -2.2, 6.6], [DX, -2.8, 0]],
  [0.34, [0.6, -5.4, 6.4], [DX, -7, 0.3]],
  [0.45, [0.4, -6.7, 8.2], [DX, -7.4, FRONT]],
  [0.62, [0.2, -7.4, 6.4], [DX, -7.6, FRONT]],
  [0.8, [0.4, -8.8, 6.2], [DX, -8.9, FRONT]],
  [1, [0.6, -10.6, 6.6], [DX, -10.6, FRONT]],
]
function camAt(p, pos, look) {
  let i = 0; while (i < KEYS.length - 2 && p > KEYS[i + 1][0]) i++
  const [p0, a0, l0] = KEYS[i], [p1, a1, l1] = KEYS[i + 1]
  const t = sm(p0, p1, p)
  pos.set(lerp(a0[0], a1[0], t), lerp(a0[1], a1[1], t), lerp(a0[2], a1[2], t))
  look.set(lerp(l0[0], l1[0], t), lerp(l0[1], l1[1], t), lerp(l0[2], l1[2], t))
}
const dropY = p => lerp(0.62, TOP + 0.12, sm(0.12, 0.34, p) ** 1.6)

function Rig({ progress }) {
  const { camera, size } = useThree()
  const pos = useMemo(() => new THREE.Vector3(), []), look = useMemo(() => new THREE.Vector3(), []), cur = useMemo(() => new THREE.Vector3(0, 1, 0), [])
  useEffect(() => {
    const mob = size.width < 768
    camera.setViewOffset(size.width, size.height, mob ? 0 : -size.width * 0.17, mob ? size.height * 0.27 : 0, size.width, size.height)
    camera.updateProjectionMatrix()
    return () => { camera.clearViewOffset(); camera.updateProjectionMatrix() }
  }, [size.width, size.height])
  useFrame(st => {
    const p = progress.get(), mob = size.width < 768
    camAt(p, pos, look)
    if (mob) { const h = 1.3 * (1 - sm(0.05, 0.16, p)); pos.z += 2.2; pos.y -= h; look.y -= h }
    pos.x += st.pointer.x * 0.25; pos.y += st.pointer.y * 0.15
    camera.position.lerp(pos, 0.14)
    cur.lerp(look, 0.14)
    camera.lookAt(cur)
  })
  return null
}

function lathe(profile, seg = 48) { return new THREE.LatheGeometry(profile.map(([x, y]) => new THREE.Vector2(x, y)), seg) }
const glassMat = { color: '#ffffff', transparent: true, opacity: 0.22, roughness: 0.04, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 2.4, side: THREE.DoubleSide, depthWrite: false }

function Lab({ progress }) {
  const g = useRef(), dropper = useRef()
  const { size } = useThree()
  const vial = useMemo(() => lathe([[0.001, 0], [0.5, 0], [0.56, 0.06], [0.56, 1.45], [0.5, 1.62], [0.25, 1.76], [0.22, 1.82], [0.22, 1.98], [0.001, 1.98]]), [])
  const serum = useMemo(() => lathe([[0.001, 0.04], [0.52, 0.04], [0.52, 1.02], [0.001, 1.02]]), [])
  const flask = useMemo(() => lathe([[0.001, 0], [1.0, 0], [1.08, 0.1], [0.38, 1.7], [0.34, 2.4], [0.4, 2.5], [0.001, 2.5]]), [])
  const flaskLiq = useMemo(() => lathe([[0.001, 0.06], [0.98, 0.06], [0.72, 0.6], [0.001, 0.6]]), [])
  const tube = useMemo(() => lathe([[0.001, -0.02], [0.12, 0.04], [0.16, 0.2], [0.16, 2.0], [0.19, 2.04], [0.001, 2.04]], 32), [])
  useFrame(st => {
    const p = progress.get(), t = st.clock.elapsedTime, mob = size.width < 768
    g.current.rotation.y += ((st.pointer.x * 0.25) - g.current.rotation.y) * 0.05
    g.current.scale.setScalar(mob ? 0.62 : 1)
    dropper.current.position.y = 1.55 + Math.sin(t * 1.2) * 0.04 - sm(0.06, 0.12, p) * 0.12
  })
  return (
    <group ref={g}>
      {/* serum vial */}
      <group position={[-0.25, -0.6, 0]}>
        <mesh geometry={vial} renderOrder={2}><meshPhysicalMaterial {...glassMat} /></mesh>
        <mesh geometry={serum} renderOrder={1}><meshPhysicalMaterial color="#f0b48b" roughness={0.2} transparent opacity={0.88} clearcoat={1} envMapIntensity={1.2} /></mesh>
        <mesh position={[0, 0.72, 0]}><cylinderGeometry args={[0.575, 0.575, 0.5, 48, 1, true, -0.9, 1.8]} /><meshStandardMaterial color="#fbfaf8" roughness={0.8} side={THREE.DoubleSide} /></mesh>
        <mesh position={[0, 0.72, 0]}><cylinderGeometry args={[0.578, 0.578, 0.04, 48, 1, true, -0.9, 1.8]} /><meshBasicMaterial color={WARM} side={THREE.DoubleSide} /></mesh>
      </group>
      {/* dropper */}
      <group ref={dropper} position={[DX, 1.55, 0]}>
        <mesh position={[0, 0.62, 0]} scale={[1, 1.45, 1]}><sphereGeometry args={[0.2, 32, 24]} /><meshPhysicalMaterial color="#25282d" roughness={0.45} clearcoat={0.6} /></mesh>
        <mesh position={[0, 0.36, 0]}><cylinderGeometry args={[0.24, 0.24, 0.2, 40]} /><meshStandardMaterial color="#d9cbbd" metalness={0.9} roughness={0.25} /></mesh>
        <mesh position={[0, -0.25, 0]} renderOrder={2}><cylinderGeometry args={[0.07, 0.04, 1.05, 24, 1, true]} /><meshPhysicalMaterial {...glassMat} opacity={0.35} /></mesh>
        <mesh position={[0, -0.45, 0]}><cylinderGeometry args={[0.045, 0.033, 0.6, 20]} /><meshStandardMaterial color="#f0b48b" transparent opacity={0.8} /></mesh>
      </group>
      {/* background glass, softly out of focus */}
      <group position={[-2.6, -1.2, -2.8]}>
        <mesh geometry={flask} renderOrder={2}><meshPhysicalMaterial {...glassMat} opacity={0.16} /></mesh>
        <mesh geometry={flaskLiq}><meshStandardMaterial color="#f3d3c4" transparent opacity={0.55} roughness={0.3} /></mesh>
      </group>
      <group position={[2.6, -0.9, -2.2]} rotation-z={-0.18}>
        <mesh geometry={tube} renderOrder={2}><meshPhysicalMaterial {...glassMat} opacity={0.2} /></mesh>
        <mesh position={[0, 0.45, 0]}><cylinderGeometry args={[0.14, 0.12, 0.8, 24]} /><meshStandardMaterial color={WARM} transparent opacity={0.45} roughness={0.3} /></mesh>
      </group>
      {size.width >= 768 && <ContactShadows position={[0, -0.62, 0]} scale={5} resolution={256} blur={3} far={2.5} opacity={0.28} color="#7a5a48" frames={1} />}
    </group>
  )
}

function Drop({ progress }) {
  const m = useRef(), ring = useRef(), ring2 = useRef()
  useFrame(() => {
    const p = progress.get()
    const grow = sm(0.07, 0.13, p), fall = sm(0.12, 0.34, p), hit = sm(0.335, 0.46, p)
    const y = dropY(p)
    m.current.position.set(DX, y, 0)
    const s = 0.11 * grow * (1 - sm(0.335, 0.36, p))
    m.current.scale.set(s, s * (1 + fall * 0.5), s)
    m.current.visible = s > 0.001
    ring.current.visible = ring2.current.visible = hit > 0 && hit < 1
    ring.current.scale.setScalar(0.1 + hit * 2.4); ring.current.material.opacity = 0.7 * (1 - hit)
    ring2.current.scale.setScalar(0.05 + hit * 1.3); ring2.current.material.opacity = 0.5 * (1 - hit)
  })
  return (
    <>
      <mesh ref={m}><sphereGeometry args={[1, 40, 28]} /><meshPhysicalMaterial color="#f6c6a6" roughness={0.02} clearcoat={1} transparent opacity={0.85} envMapIntensity={2.6} /></mesh>
      <mesh ref={ring} position={[DX, TOP + 0.02, 0]} rotation-x={-Math.PI / 2}><torusGeometry args={[1, 0.02, 8, 64]} /><meshBasicMaterial color={WARM} transparent /></mesh>
      <mesh ref={ring2} position={[DX, TOP + 0.02, 0]} rotation-x={-Math.PI / 2}><torusGeometry args={[1, 0.015, 8, 64]} /><meshBasicMaterial color={WARM} transparent /></mesh>
    </>
  )
}

function Skin({ progress }) {
  const cells = useRef(), fibers = useRef(), fat = useRef(), act = useRef()
  const W = 18, D = 5, cx = DX
  const obj = useMemo(() => new THREE.Object3D(), [])
  const nCells = 4 * 80, nFib = 260, nFat = 3 * 26, nAct = 90
  const caps = useMemo(() => [-3.5, -1.6, 0.3, 2.2, 4.1, 6].map(x => {
    const y0 = TOP - EPI - DER + 0.2, y1 = TOP - EPI - 0.12
    const c = new THREE.CatmullRomCurve3([new THREE.Vector3(x - 0.25, y0, FRONT + 0.03), new THREE.Vector3(x - 0.22, (y0 + y1) / 2, FRONT + 0.03), new THREE.Vector3(x - 0.1, y1, FRONT + 0.03), new THREE.Vector3(x + 0.12, y1 + 0.02, FRONT + 0.03), new THREE.Vector3(x + 0.25, (y0 + y1) / 2, FRONT + 0.03), new THREE.Vector3(x + 0.3, y0, FRONT + 0.03)])
    return new THREE.TubeGeometry(c, 40, 0.026, 8, false)
  }), [])
  const actSeeds = useMemo(() => Array.from({ length: nAct }, () => ({ x: (Math.random() - 0.5) * 2.4, z: FRONT + 0.06, d: Math.random(), r: Math.random() })), [])
  React.useLayoutEffect(() => {
    let k = 0
    for (let r = 0; r < 4; r++) for (let i = 0; i < 80; i++) {
      obj.position.set(cx - 8.8 + i * 0.22 + (r % 2) * 0.11, TOP - 0.1 - r * 0.16, FRONT + 0.02)
      obj.scale.set(0.11 - r * 0.004, 0.06 + r * 0.008, 0.06); obj.rotation.set(0, 0, 0); obj.updateMatrix(); cells.current.setMatrixAt(k++, obj.matrix)
    }
    cells.current.instanceMatrix.needsUpdate = true
    for (let i = 0; i < nFib; i++) {
      obj.position.set(cx - 8.5 + Math.random() * 17, TOP - EPI - 0.2 - Math.random() * (DER - 0.4), FRONT + 0.02)
      obj.rotation.set(0, 0, Math.PI / 2 + (Math.random() - 0.5) * 1.1); obj.scale.set(1, 0.6 + Math.random() * 0.9, 1); obj.updateMatrix(); fibers.current.setMatrixAt(i, obj.matrix)
    }
    fibers.current.instanceMatrix.needsUpdate = true
    k = 0
    for (let r = 0; r < 3; r++) for (let i = 0; i < 26; i++) {
      const s = 0.3 + Math.random() * 0.08
      obj.position.set(cx - 8.6 + i * 0.68 + (r % 2) * 0.34 + (Math.random() - 0.5) * 0.08, TOP - EPI - DER - 0.4 - r * 0.66, FRONT - 0.1)
      obj.scale.set(s, s * 0.92, s); obj.rotation.set(0, 0, 0); obj.updateMatrix(); fat.current.setMatrixAt(k++, obj.matrix)
    }
    fat.current.instanceMatrix.needsUpdate = true
  }, [])
  useFrame(st => {
    const p = progress.get(), f = sm(0.42, 0.86, p), t = st.clock.elapsedTime
    actSeeds.forEach((s, i) => {
      const depth = Math.min(f * (0.6 + s.r * 0.7), 1) * (EPI + DER - 0.2)
      obj.position.set(DX + s.x * (0.3 + f), TOP - 0.05 - depth * s.d - Math.sin(t + i) * 0.02, s.z)
      const sc = f > 0.001 ? 0.018 + 0.014 * s.r : 0
      obj.scale.setScalar(sc); obj.rotation.set(0, 0, 0); obj.updateMatrix(); act.current.setMatrixAt(i, obj.matrix)
    })
    act.current.instanceMatrix.needsUpdate = true
  })
  return (
    <group>
      <mesh position={[cx, TOP - EPI / 2, 0]}><boxGeometry args={[W, EPI, D]} /><meshStandardMaterial color="#f2d6c8" roughness={0.75} /></mesh>
      <mesh position={[cx, TOP - EPI - DER / 2, 0]}><boxGeometry args={[W, DER, D]} /><meshStandardMaterial color="#f7e5dd" roughness={0.85} /></mesh>
      <mesh position={[cx, TOP - EPI - DER - HYP / 2, 0]}><boxGeometry args={[W, HYP, D]} /><meshStandardMaterial color="#fbf0e0" roughness={0.85} /></mesh>
      <instancedMesh frustumCulled={false} ref={cells} args={[null, null, nCells]}><sphereGeometry args={[1, 16, 10]} /><meshStandardMaterial color="#e9bfae" roughness={0.5} /></instancedMesh>
      <instancedMesh frustumCulled={false} ref={fibers} args={[null, null, nFib]}><cylinderGeometry args={[0.018, 0.018, 0.8, 6]} /><meshStandardMaterial color="#e6ab97" roughness={0.6} /></instancedMesh>
      <instancedMesh frustumCulled={false} ref={fat} args={[null, null, nFat]}><sphereGeometry args={[1, 24, 16]} /><meshPhysicalMaterial color="#fde9c8" roughness={0.3} clearcoat={0.6} /></instancedMesh>
      <instancedMesh frustumCulled={false} ref={act} args={[null, null, nAct]}><sphereGeometry args={[1, 10, 8]} /><meshBasicMaterial color={WARM} toneMapped={false} /></instancedMesh>
      {caps.map((g, i) => <mesh key={i} geometry={g}><meshStandardMaterial color="#d8664a" roughness={0.4} /></mesh>)}
    </group>
  )
}

export default function LabFilm({ progress, active }) {
  return (
    <Canvas dpr={[1, 1.6]} frameloop={active ? 'always' : 'never'} camera={{ position: [0, 1.3, 8.2], fov: 34 }} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 6, 5]} intensity={1.4} color="#fff4ea" />
      <directionalLight position={[-4, -8, 6]} intensity={0.8} color="#ffffff" />
      <Rig progress={progress} />
      <Lab progress={progress} />
      <Drop progress={progress} />
      <Skin progress={progress} />
      <Environment resolution={256}>
        <color attach="background" args={['#f4efea']} />
        <Lightformer form="rect" intensity={4} position={[0, 5, 2]} rotation-x={Math.PI / 2} scale={[10, 2, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={3} position={[-5, 1, 2]} rotation-y={Math.PI / 2} scale={[3, 6, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={2} position={[5, 1, 0]} rotation-y={-Math.PI / 2} scale={[3, 6, 1]} color="#ffd9c2" />
        <Lightformer form="ring" intensity={2} position={[0, 0, 6]} scale={2} color="#ffffff" />
      </Environment>
    </Canvas>
  )
}
