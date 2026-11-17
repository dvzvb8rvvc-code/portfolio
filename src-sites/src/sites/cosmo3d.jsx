import React, { useMemo, useRef, useLayoutEffect } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'

const N = 10, D = 34, LEN = 3.4, R = 0.62
const ss = (a, b, v) => { const t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t) }
const OFF = new THREE.Color('#2a2a2a'), ON = new THREE.Color('#ffffff'), RED = new THREE.Color('#ff2a2a')

function Tubes({ progress }) {
  const inst = useRef(), glow = useRef([])
  const tmp = useMemo(() => new THREE.Object3D(), [])
  const col = useMemo(() => new THREE.Color(), [])
  useLayoutEffect(() => {
    let k = 0
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2
      for (let j = 0; j < D; j++) {
        tmp.position.set(-LEN / 2 + (j / (D - 1)) * LEN, Math.cos(a) * R, Math.sin(a) * R)
        tmp.updateMatrix(); inst.current.setMatrixAt(k, tmp.matrix); inst.current.setColorAt(k, OFF); k++
      }
    }
    inst.current.instanceMatrix.needsUpdate = true
  }, [])
  useFrame(st => {
    const p = progress.get(), t = st.clock.elapsedTime
    // tubes light sequentially between p .12 and .78; after that everything breathes
    const lit = ss(0.1, 0.8, p) * N
    let k = 0
    for (let i = 0; i < N; i++) {
      const f = Math.min(1, Math.max(0, lit - i)) // 0..1 fill along tube
      const head = f > 0 && f < 1 ? f * (D - 1) : -10
      for (let j = 0; j < D; j++) {
        const on = j / (D - 1) <= f
        const pattern = (j + i) % 3 === 0 ? 0.75 : 1 // dot-matrix rhythm
        if (Math.abs(j - head) < 1.5) col.copy(RED)
        else if (on) col.copy(ON).multiplyScalar(pattern * (p > 0.82 ? 0.85 + Math.sin(t * 3 + j * 0.3 + i) * 0.15 : 1))
        else col.copy(OFF)
        inst.current.setColorAt(k++, col)
      }
      const g = glow.current[i]
      if (g) g.material.opacity = f * 0.16
    }
    inst.current.instanceColor.needsUpdate = true
  })
  return (
    <group>
      <instancedMesh ref={inst} args={[null, null, N * D]}>
        <sphereGeometry args={[0.036, 8, 6]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      {Array.from({ length: N }, (_, i) => {
        const a = (i / N) * Math.PI * 2
        return (
          <mesh key={i} ref={el => (glow.current[i] = el)} position={[0, Math.cos(a) * R, Math.sin(a) * R]} rotation-z={Math.PI / 2}>
            <cylinderGeometry args={[0.09, 0.09, LEN + 0.1, 12, 1, true]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
          </mesh>
        )
      })}
    </group>
  )
}

function Shell() {
  return (
    <group>
      <mesh rotation-z={Math.PI / 2} renderOrder={3}>
        <capsuleGeometry args={[1, LEN, 12, 40]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.1} roughness={0.05} clearcoat={1} clearcoatRoughness={0.02} envMapIntensity={2.4} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      {Array.from({ length: 7 }, (_, i) => (
        <mesh key={i} position-x={-LEN / 2 + (i / 6) * LEN} rotation-y={Math.PI / 2}>
          <torusGeometry args={[1.003, 0.006, 6, 64]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={i === 0 || i === 6 ? 0.55 : 0.18} />
        </mesh>
      ))}
      {[-1, 1].map(s => (
        <mesh key={s} position-x={s * (LEN / 2 + 0.55)} rotation-y={Math.PI / 2}>
          <torusGeometry args={[0.55, 0.008, 6, 48]} />
          <meshBasicMaterial color="#ff2a2a" transparent opacity={0.8} />
        </mesh>
      ))}
      {[0.9, -0.9].map(z => (
        <mesh key={z} position={[0, -1.25, z * 0.5]} rotation-x={-Math.PI / 2}>
          <planeGeometry args={[LEN + 1.4, 0.02]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.25} />
        </mesh>
      ))}
    </group>
  )
}

function Rig({ progress, children }) {
  const g = useRef(), { size } = useThree()
  useFrame((st, dt) => {
    const p = progress.get(), mob = size.width < 768
    const tx = mob ? 0 : 2.3 - ss(0.1, 0.3, p) * 2.3 + ss(0.82, 1, p) * 1.4
    const ty = mob ? 0.95 : 0
    g.current.position.x += (tx - g.current.position.x) * Math.min(1, dt * 4)
    g.current.position.y = ty
    g.current.scale.setScalar(mob ? 0.56 : 0.86)
    // 3/4 view -> side -> end-on (glyph ring) -> 3/4
    const ry = -0.6 + ss(0.12, 0.45, p) * 0.6 + ss(0.5, 0.78, p) * (Math.PI / 2 - 0.15) - ss(0.82, 1, p) * 0.9
    const rx = 0.32 - ss(0.12, 0.45, p) * 0.22 + ss(0.82, 1, p) * 0.2
    g.current.rotation.y += (ry + st.pointer.x * 0.12 - g.current.rotation.y) * Math.min(1, dt * 5)
    g.current.rotation.x += (rx - st.pointer.y * 0.08 - g.current.rotation.x) * Math.min(1, dt * 5)
    g.current.rotation.z = Math.sin(st.clock.elapsedTime * 0.5) * 0.02
  })
  return <group ref={g}>{children}</group>
}

export default function CapsuleScene({ progress, active }) {
  return (
    <Canvas frameloop={active ? 'always' : 'never'} dpr={[1, 1.6]} camera={{ position: [0, 0, 9], fov: 34 }} gl={{ antialias: true, alpha: true }} style={{ pointerEvents: 'none' }}
      eventSource={typeof document !== 'undefined' ? document.getElementById('root') : undefined} eventPrefix="client">
      <Rig progress={progress}>
        <Tubes progress={progress} />
        <Shell />
      </Rig>
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={3} position={[0, 4, 2]} rotation-x={Math.PI / 2} scale={[10, 1, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={2} position={[-5, 0, 1]} rotation-y={Math.PI / 2} scale={[6, 0.4, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={1.5} position={[5, 0, 1]} rotation-y={-Math.PI / 2} scale={[6, 0.4, 1]} color="#ff4040" />
      </Environment>
    </Canvas>
  )
}
