import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, ContactShadows } from '@react-three/drei'
import { COLORS, stateAt } from './experience-state'

/* a nail designed layer by layer: exploded stack -> shape -> colour -> finish -> assembled */
function nailShape(kind) {
  const s = new THREE.Shape(), w = 0.5
  s.moveTo(-w, 0.15)
  s.quadraticCurveTo(-w, -0.12, 0, -0.14)
  s.quadraticCurveTo(w, -0.12, w, 0.15)
  s.lineTo(w, 1.0)
  if (kind === 0) { s.lineTo(w, 1.36); s.quadraticCurveTo(w, 1.48, w - 0.12, 1.48); s.lineTo(-w + 0.12, 1.48); s.quadraticCurveTo(-w, 1.48, -w, 1.36) }
  else if (kind === 1) s.bezierCurveTo(w, 1.72, -w, 1.72, -w, 1.0)
  else { s.bezierCurveTo(w, 1.42, 0.16, 1.86, 0, 1.92); s.bezierCurveTo(-0.16, 1.86, -w, 1.42, -w, 1.0) }
  s.lineTo(-w, 0.15)
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.035, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 3, curveSegments: 28 })
  const pos = g.attributes.position
  for (let i = 0; i < pos.count; i++) { const x = pos.getX(i); pos.setZ(i, pos.getZ(i) - x * x * 0.55) }
  g.translate(0, -0.85, 0); g.computeVertexNormals()
  return g
}
const tc = new THREE.Color()

function Nail({ progress }) {
  const geos = useMemo(() => [0, 1, 2].map(nailShape), [])
  const root = useRef(), L = [useRef(), useRef(), useRef(), useRef()], colMat = useRef(), topMat = useRef(), glow = useRef()
  const { size } = useThree()
  const cur = useRef({ e: 1, shape: -1 })
  useFrame((st, dt) => {
    const p = progress.get(), S = stateAt(p), t = st.clock.elapsedTime
    const c = cur.current
    c.e += (S.explode - c.e) * Math.min(1, dt * 5)
    if (S.shape !== c.shape) { c.shape = S.shape; L.forEach(r => { r.current.geometry = geos[S.shape] }) }
    L.forEach((r, i) => { r.current.position.z = i * (0.06 + c.e * 0.42) })
    tc.set(COLORS[S.color].hex)
    colMat.current.color.lerp(tc, Math.min(1, dt * 6))
    glow.current.material.color.lerp(tc, Math.min(1, dt * 4))
    const mat = S.finish === 1
    colMat.current.roughness += ((mat ? 0.75 : 0.18) - colMat.current.roughness) * Math.min(1, dt * 5)
    colMat.current.clearcoat += ((mat ? 0 : 1) - colMat.current.clearcoat) * Math.min(1, dt * 5)
    topMat.current.roughness += ((mat ? 0.7 : 0.02) - topMat.current.roughness) * Math.min(1, dt * 5)
    const mob = size.width < 768
    root.current.scale.setScalar(mob ? 0.72 : 0.85)
    root.current.rotation.x = -0.95 + c.e * 0.15 + st.pointer.y * 0.1
    root.current.rotation.z = 0.5 + Math.sin(t * 0.4) * 0.08
    root.current.rotation.y = Math.sin(t * 0.3) * 0.2 + st.pointer.x * 0.3 + (p > 0.8 ? (p - 0.8) * 6 : 0)
    root.current.position.y = -0.1 + c.e * -0.25
  })
  return (
    <group>
      <mesh ref={glow} position={[0, -1.2, -1]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[1.5, 48]} />
        <meshBasicMaterial transparent opacity={0.09} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <group ref={root}>
        <mesh ref={L[0]} geometry={geos[2]}><meshStandardMaterial color="#efc9c1" roughness={0.55} /></mesh>
        <mesh ref={L[1]} geometry={geos[2]}><meshPhysicalMaterial color="#ffffff" transparent opacity={0.4} roughness={0.3} depthWrite={false} /></mesh>
        <mesh ref={L[2]} geometry={geos[2]}><meshPhysicalMaterial ref={colMat} color="#7a1f3d" roughness={0.18} clearcoat={1} clearcoatRoughness={0.05} envMapIntensity={1.4} /></mesh>
        <mesh ref={L[3]} geometry={geos[2]} renderOrder={2}><meshPhysicalMaterial ref={topMat} color="#ffffff" transparent opacity={0.22} roughness={0.02} clearcoat={1} envMapIntensity={2.5} depthWrite={false} /></mesh>
      </group>
      <ContactShadows position={[0, -1.25, 0]} scale={5} blur={2.6} far={2.5} opacity={0.5} color="#000000" resolution={256} />
    </group>
  )
}

export default function NailScene({ progress, active }) {
  return (
    <Canvas frameloop={active ? 'always' : 'never'} dpr={[1, 1.6]} camera={{ position: [0, 0.6, 5.2], fov: 35 }} gl={{ antialias: true, alpha: true }} style={{ pointerEvents: 'none' }}
      eventSource={typeof document !== 'undefined' ? document.getElementById('root') : undefined} eventPrefix="client">
      <Nail progress={progress} />
      <Environment resolution={128}>
        <color attach="background" args={['#0a0b0d']} />
        <Lightformer form="rect" intensity={5} position={[0, 4, 2]} rotation-x={-Math.PI / 3} scale={[6, 1, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={3} position={[-4, 1, 1]} rotation-y={Math.PI / 2} scale={[4, 0.5, 1]} color="#a99bff" />
        <Lightformer form="rect" intensity={2.5} position={[4, 0, 1]} rotation-y={-Math.PI / 2} scale={[4, 1, 1]} color="#ffc6e6" />
      </Environment>
    </Canvas>
  )
}
