import React, { Suspense, useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { Environment, ContactShadows, OrbitControls, RoundedBox, Html } from '@react-three/drei'

/* One home on its plinth: house + private garden lot + parking + hot-tub preparation (+ a slice of the shared pool).
   It morphs continuously between the two real ends of the range: 35 m² + 25 m² garden ↔ 95 m² + 160 m² garden.
   1 unit = 2.5 m. The drawing is a diagram, not a floor plan. */
const M = .4
const lerp = (a, b, t) => a + (b - a) * t
const tex = n => `/portfolio/yts/tex/${n}.webp`

export function unitDims(t) {
  const A = lerp(35, 95, t), G = lerp(25, 160, t)
  const w = Math.sqrt(A * 1.6), d = A / w
  const gw = Math.max(w + 1.2, Math.sqrt(G * 1.2)), gd = G / gw
  return { A, G, w: w * M, d: d * M, gw: gw * M, gd: gd * M }
}

function useGrass() {
  return useMemo(() => {
    const c = document.createElement('canvas'); c.width = c.height = 256
    const g = c.getContext('2d'); g.fillStyle = '#5f7a3a'; g.fillRect(0, 0, 256, 256)
    for (let i = 0; i < 9000; i++) {
      const x = Math.random() * 256, y = Math.random() * 256, l = 30 + Math.random() * 28
      g.fillStyle = `hsl(${78 + Math.random() * 24},${34 + Math.random() * 20}%,${l}%)`; g.fillRect(x, y, 1.2, 2.6)
    }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8
    return t
  }, [])
}
function usePark() {
  return useMemo(() => {
    const c = document.createElement('canvas'); c.width = 256; c.height = 512
    const g = c.getContext('2d'); g.fillStyle = '#a7a39b'; g.fillRect(0, 0, 256, 512)
    for (let i = 0; i < 5000; i++) { g.fillStyle = `rgba(${Math.random() > .5 ? 255 : 0},${Math.random() > .5 ? 255 : 0},${Math.random() > .5 ? 255 : 0},.05)`; g.fillRect(Math.random() * 256, Math.random() * 512, 2, 2) }
    g.strokeStyle = '#f4f1ea'; g.lineWidth = 8; g.strokeRect(14, 14, 228, 484)
    g.fillStyle = '#f4f1ea'; g.font = '900 200px Inter Tight, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('P', 128, 270)
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8
    return t
  }, [])
}
function usePBR(name, rep) {
  const [diff, nor, arm] = useLoader(THREE.TextureLoader, [tex(name + '_diff'), tex(name + '_nor'), tex(name + '_arm')])
  return useMemo(() => {
    diff.colorSpace = THREE.SRGBColorSpace
    ;[diff, nor, arm].forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); t.anisotropy = 8 })
    return { map: diff, normalMap: nor, roughnessMap: arm, aoMap: arm }
  }, [diff, nor, arm])
}

const HL = '#c3602a'
function Unit({ t, hi }) {
  const grass = useGrass(), park = usePark()
  const stone = usePBR('stone', [3, 3]), plaster = usePBR('plaster', [2, 1]), wood = usePBR('shutter', [3, 1])
  const R = { house: useRef(), glass: useRef(), roof: useRef(), parapet: useRef(), garden: useRef(), gardenSide: useRef(), park: useRef(), deck: useRef(), tub: useRef(), heat: useRef(), fins: useRef(), pool: useRef(), hedge: useRef(), lamp: useRef(), olive: useRef() }
  const finCount = 9
  const dimRef = useRef(), dimEl = useRef(), mats = useRef({})
  const fin = useMemo(() => new THREE.BoxGeometry(1, 1, 1), [])
  const box = fin
  const s = useRef({ t: 0, h: {} })
  useFrame((_, dt) => {
    const S = s.current
    S.t = THREE.MathUtils.damp(S.t, t.get(), 8, Math.min(dt, .05))
    const D = unitDims(S.t)
    const H = 1.32, z0 = -3.8 // back line of the house
    const hz = z0 + D.d / 2, gz = z0 + D.d + D.gd / 2
    const hx = -1.2 + (D.gw - D.w) * 0 // house left-aligned with the garden
    const gx = -1.2 + (D.gw - D.w) / 2
    R.house.current.scale.set(D.w, H, D.d); R.house.current.position.set(hx, H / 2 + .02, hz)
    R.glass.current.scale.set(D.w * .9, H * .74, .04); R.glass.current.position.set(hx, H * .44 + .02, z0 + D.d + .005)
    R.roof.current.scale.set(D.w + .24, .1, D.d + .28); R.roof.current.position.set(hx, H + .07, hz + .06)
    R.parapet.current.scale.set(D.w + .1, .06, D.d + .1); R.parapet.current.position.set(hx, H + .15, hz + .06)
    R.garden.current.scale.set(D.gw, .07, D.gd); R.garden.current.position.set(gx, .055, gz)
    R.gardenSide.current.scale.set(D.gw + .06, .05, .06); R.gardenSide.current.position.set(gx, .07, z0 + D.d + D.gd)
    grass.repeat.set(D.gw * .5, D.gd * .5)
    R.hedge.current.scale.set(.18, .32, D.gd * .96); R.hedge.current.position.set(gx - D.gw / 2 + .1, .24, gz)
    R.olive.current.position.set(gx - D.gw / 2 + .55, .1, z0 + D.d + D.gd * .62); R.olive.current.scale.setScalar(.8 + S.t * .4)
    for (let i = 0; i < finCount; i++) {
      const m = new THREE.Matrix4().compose(new THREE.Vector3(hx - D.w * .45 + (i / (finCount - 1)) * D.w * .9, H * .46, z0 + D.d + .08), new THREE.Quaternion(), new THREE.Vector3(.035, H * .86, .12))
      R.fins.current.setMatrixAt(i, m)
    }
    R.fins.current.instanceMatrix.needsUpdate = true
    const px = hx + D.w / 2 + .62
    R.park.current.position.set(px, .045, z0 + 1.15)
    const tx = gx + D.gw / 2 - .62, tz = z0 + D.d + D.gd - .7
    R.deck.current.position.set(tx, .1, tz); R.tub.current.position.set(tx, .135, tz)
    R.heat.current.position.set(hx - D.w / 2 + .45, H + .32, z0 + .45)
    R.lamp.current.position.set(hx, H * .45, z0 + D.d - .35); R.lamp.current.intensity = 2.5 + S.t * 3
    if (dimRef.current) dimRef.current.position.set(gx, .1, z0 + D.d + D.gd + .35)
    if (dimEl.current) dimEl.current.textContent = Math.round(D.G) + ' m²'
    // highlight
    for (const k of ['garden', 'heat', 'park', 'tub', 'pool']) {
      const m = mats.current[k]; if (!m) continue
      S.h[k] = THREE.MathUtils.damp(S.h[k] || 0, hi === k ? 1 : 0, 7, dt)
      m.emissiveIntensity = S.h[k] * (k === 'tub' || k === 'pool' ? .9 : .6)
    }
  })
  const reg = k => m => { if (m) mats.current[k] = m }
  return (
    <group>
      {/* plinth */}
      <RoundedBox args={[9.6, .7, 10.2]} radius={.12} smoothness={3} position={[.4, -.35, 1.1]} receiveShadow>
        <meshStandardMaterial {...stone} color="#d8d0c4" roughness={.9} />
      </RoundedBox>
      <mesh position={[.4, 0.012, 1.1]} rotation-x={-Math.PI / 2}><planeGeometry args={[9.3, 9.9]} /><meshStandardMaterial {...stone} color="#cfc6b8" roughness={.95} /></mesh>
      {/* slice of the shared pool at the plinth edge */}
      <group position={[-3.9, 0, 4.3]}>
        <mesh position={[0, .05, 0]}><boxGeometry args={[1.8, .1, 3.6]} /><meshStandardMaterial {...stone} color="#ece6dc" /></mesh>
        <mesh position={[.08, .102, 0]} rotation-x={-Math.PI / 2}><planeGeometry args={[1.4, 3.2]} /><meshStandardMaterial ref={reg('pool')} color="#4fb4c4" emissive={HL} emissiveIntensity={0} roughness={.04} metalness={.1} envMapIntensity={2} /></mesh>
      </group>
      {/* garden lot */}
      <mesh ref={R.garden} geometry={box}><meshStandardMaterial ref={reg('garden')} map={grass} roughness={1} emissive={HL} emissiveIntensity={0} /></mesh>
      <mesh ref={R.gardenSide} geometry={box}><meshStandardMaterial color="#e9e3d8" roughness={.7} /></mesh>
      <mesh ref={R.hedge} geometry={box}><meshStandardMaterial color="#3f5a2a" roughness={1} /></mesh>
      <group ref={R.olive}>
        <mesh position={[0, .32, 0]}><cylinderGeometry args={[.03, .05, .6, 8]} /><meshStandardMaterial color="#6b5a46" roughness={1} /></mesh>
        <mesh position={[0, .72, 0]}><icosahedronGeometry args={[.36, 3]} /><meshStandardMaterial color="#8a9a68" roughness={.9} /></mesh>
      </group>
      {/* house */}
      <mesh ref={R.house} geometry={box} castShadow><meshStandardMaterial {...plaster} color="#efe8dc" roughness={.92} /></mesh>
      <mesh ref={R.glass} geometry={box}><meshStandardMaterial color="#20313a" metalness={.6} roughness={.06} emissive="#ffb36b" emissiveIntensity={.32} envMapIntensity={1.6} /></mesh>
      <instancedMesh ref={R.fins} args={[fin, null, finCount]}><meshStandardMaterial {...wood} color="#b58a62" roughness={.7} /></instancedMesh>
      <mesh ref={R.roof} geometry={box}><meshStandardMaterial color="#e6dfd3" roughness={.8} /></mesh>
      <mesh ref={R.parapet} geometry={box}><meshStandardMaterial color="#6f8a48" roughness={1} /></mesh>
      <pointLight ref={R.lamp} color="#ffb36b" intensity={3} distance={4} decay={2} />
      {/* heating & cooling unit on the roof */}
      <group ref={R.heat}>
        <mesh><boxGeometry args={[.5, .34, .34]} /><meshStandardMaterial ref={reg('heat')} color="#d9d6d0" metalness={.4} roughness={.4} emissive={HL} emissiveIntensity={0} /></mesh>
        <mesh position={[0, 0, .175]} rotation-x={0}><circleGeometry args={[.12, 32]} /><meshStandardMaterial color="#555" metalness={.6} roughness={.5} /></mesh>
      </group>
      {/* private parking */}
      <mesh ref={R.park} rotation-x={-Math.PI / 2}><planeGeometry args={[1.05, 2.1]} /><meshStandardMaterial ref={reg('park')} map={park} roughness={.9} emissive={HL} emissiveIntensity={0} /></mesh>
      {/* hot-tub preparation: deck + water */}
      <mesh ref={R.deck}><boxGeometry args={[.95, .1, .95]} /><meshStandardMaterial {...wood} color="#a37a55" roughness={.75} /></mesh>
      <mesh ref={R.tub} rotation-x={-Math.PI / 2}><planeGeometry args={[.66, .66]} /><meshStandardMaterial ref={reg('tub')} color="#7fd0da" roughness={.05} emissive={HL} emissiveIntensity={0} envMapIntensity={2} /></mesh>
      <group ref={dimRef}>
        <Html center zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
          <div style={{ whiteSpace: 'nowrap', fontFamily: "'Inter Tight',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '.18em', color: '#151412', background: 'rgba(236,231,223,.85)', padding: '4px 9px', borderRadius: 99 }}>
            <span ref={dimEl} style={{ fontVariantNumeric: 'tabular-nums' }}>25 m²</span>
          </div>
        </Html>
      </group>
    </group>
  )
}

export default function UnitScene({ t, hi, active, mobile }) {
  return (
    <Canvas frameloop={active ? 'always' : 'never'} dpr={[1, mobile ? 1.3 : 1.6]} shadows={false}
      camera={{ position: mobile ? [9, 9, 13] : [9.5, 7.2, 11], fov: mobile ? 36 : 30, near: .5, far: 100 }}
      gl={{ antialias: true, alpha: true }} style={{ position: 'absolute', inset: 0 }}>
      <Suspense fallback={null}>
        <Environment files="/portfolio/yts/hdr/studio_small_08.hdr" environmentIntensity={.9} />
        <directionalLight position={[6, 10, 4]} intensity={1.6} color="#ffe7c8" />
        <group position={[0, -.6, -.4]}>
          <Unit t={t} hi={hi} />
          <ContactShadows position={[.4, -.71, 1.1]} scale={16} far={4} blur={2.6} opacity={.5} resolution={512} frames={1} color="#3a2414" />
        </group>
      </Suspense>
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={.45} minPolarAngle={.6} maxPolarAngle={1.25} target={[0, -.2, .4]} enableDamping />
    </Canvas>
  )
}
