import React, { useMemo, useRef, useEffect } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, ContactShadows, RoundedBox } from '@react-three/drei'

// gate geometry — must match mkpp.jsx (GEARS)
const S = 0.55, D = 1.1, KNOB = 1.32
const GOLD = '#d4a22c', STEEL = '#9aa1a8', INK = '#16191c'
const GEARS = { '1': [-1, 1], '2': [-1, -1], '3': [0, 1], '4': [0, -1], R: [1, -1] }

function drawPlate(g, gear) {
  const W = 512, c = 256, s = 128
  const grd = g.createLinearGradient(0, 0, W, W)
  grd.addColorStop(0, '#a9afb5'); grd.addColorStop(1, '#8a9198')
  g.fillStyle = grd; g.fillRect(0, 0, W, W)
  for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(255,255,255,${Math.random() * 0.06})`; g.fillRect(0, Math.random() * W, W, 1) }
  // slot
  g.strokeStyle = '#15181b'; g.lineCap = 'round'; g.lineWidth = 34
  g.beginPath()
  g.moveTo(c - s, c); g.lineTo(c + s, c)
  g.moveTo(c - s, c - s); g.lineTo(c - s, c + s)
  g.moveTo(c, c - s); g.lineTo(c, c + s)
  g.moveTo(c + s, c); g.lineTo(c + s, c + s)
  g.stroke()
  g.strokeStyle = 'rgba(255,255,255,.25)'; g.lineWidth = 2
  g.strokeRect(14, 14, W - 28, W - 28)
  // numbers
  g.textAlign = 'center'; g.textBaseline = 'middle'
  Object.entries(GEARS).forEach(([k, [x, y]]) => {
    const px = c + x * s, py = c - y * s - y * 62
    const on = k === gear
    g.beginPath(); g.arc(px, py, 30, 0, Math.PI * 2)
    g.fillStyle = on ? GOLD : 'rgba(22,25,28,.0)'; g.fill()
    g.lineWidth = 3; g.strokeStyle = on ? GOLD : 'rgba(22,25,28,.55)'; g.stroke()
    g.fillStyle = on ? INK : '#1b1f23'
    g.font = "bold 34px 'JetBrains Mono', monospace"
    g.fillText(k, px, py + 2)
  })
  g.fillStyle = 'rgba(22,25,28,.6)'; g.font = "bold 16px 'JetBrains Mono', monospace"; g.textAlign = 'left'
  g.fillText('МКПП · ГЕЙТ-5', 30, 40)
  g.textAlign = 'right'; g.fillText(gear === 'N' ? 'N · НЕЙТРАЛЬ' : 'ПЕРЕДАЧА ' + gear, W - 30, W - 36)
  // screws
  ;[[34, 470], [478, 34]].forEach(([x, y]) => { g.beginPath(); g.arc(x, y, 9, 0, 7); g.fillStyle = '#7b828a'; g.fill(); g.fillStyle = '#5c636b'; g.fillRect(x - 6, y - 1, 12, 2) })
}

function drawKnobTop(g) {
  const W = 256, c = 128, s = 50
  g.fillStyle = '#202428'; g.fillRect(0, 0, W, W)
  g.strokeStyle = GOLD; g.lineWidth = 7; g.lineCap = 'round'
  g.beginPath()
  g.moveTo(c - s, c); g.lineTo(c + s, c)
  g.moveTo(c - s, c - s); g.lineTo(c - s, c + s)
  g.moveTo(c, c - s); g.lineTo(c, c + s)
  g.moveTo(c + s, c); g.lineTo(c + s, c + s)
  g.stroke()
  g.fillStyle = GOLD; g.font = "bold 26px 'JetBrains Mono', monospace"; g.textAlign = 'center'; g.textBaseline = 'middle'
  Object.entries(GEARS).forEach(([k, [x, y]]) => g.fillText(k, c + x * s, c - y * s - y * 26))
}

function useCanvasTex(w, draw, deps) {
  const canvas = useMemo(() => { const c = document.createElement('canvas'); c.width = c.height = w; return c }, [w])
  const tex = useMemo(() => { const t = new THREE.CanvasTexture(canvas); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t }, [canvas])
  useEffect(() => { draw(canvas.getContext('2d')); tex.needsUpdate = true }, deps) // eslint-disable-line
  return tex
}

const UP = new THREE.Vector3(0, 1, 0)
function Shifter({ gx, gy, gear }) {
  const lever = useRef(), collar = useRef(), rig = useRef()
  const plateTex = useCanvasTex(512, g => drawPlate(g, gear), [gear])
  const knobTex = useCanvasTex(256, drawKnobTop, [])
  const v = useMemo(() => new THREE.Vector3(), [])
  const { size } = useThree()
  useFrame((st) => {
    const x = gx.get(), y = gy.get()
    v.set(x * S, D, -y * S).normalize()
    lever.current.quaternion.setFromUnitVectors(UP, v)
    collar.current.position.set(x * S, 0.03, -y * S)
    rig.current.rotation.y = THREE.MathUtils.lerp(rig.current.rotation.y, st.pointer.x * 0.06, 0.05)
    const sc = size.width < 420 ? 0.92 : 1
    rig.current.scale.setScalar(sc)
  })
  return (
    <group ref={rig}>
      <RoundedBox args={[2.5, 0.26, 2.5]} radius={0.08} smoothness={3} position-y={-0.13}>
        <meshStandardMaterial color={STEEL} metalness={0.75} roughness={0.38} />
      </RoundedBox>
      <mesh rotation-x={-Math.PI / 2} position-y={0.003}>
        <planeGeometry args={[2.2, 2.2]} />
        <meshStandardMaterial map={plateTex} metalness={0.45} roughness={0.5} />
      </mesh>
      <mesh ref={collar} rotation-x={Math.PI / 2}>
        <torusGeometry args={[0.1, 0.035, 12, 32]} />
        <meshStandardMaterial color="#1c1f22" roughness={0.8} />
      </mesh>
      <group ref={lever} position-y={-D}>
        <mesh position-y={(KNOB + D) / 2}>
          <cylinderGeometry args={[0.05, 0.065, KNOB + D, 20]} />
          <meshStandardMaterial color="#d9dde1" metalness={1} roughness={0.18} />
        </mesh>
        <group position-y={D + KNOB}>
          <mesh scale={[1, 0.82, 1]}>
            <sphereGeometry args={[0.34, 48, 32]} />
            <meshStandardMaterial color="#25292d" metalness={0.3} roughness={0.32} />
          </mesh>
          <mesh position-y={-0.2} rotation-x={Math.PI / 2}>
            <torusGeometry args={[0.2, 0.035, 12, 40]} />
            <meshStandardMaterial color={GOLD} metalness={1} roughness={0.25} />
          </mesh>
          <mesh position-y={0.262} rotation-x={-Math.PI / 2}>
            <circleGeometry args={[0.2, 40]} />
            <meshStandardMaterial map={knobTex} roughness={0.4} metalness={0.2} />
          </mesh>
        </group>
      </group>
    </group>
  )
}

function Cam() {
  const { camera, size } = useThree()
  useEffect(() => {
    const mob = size.width < 520
    camera.position.set(0, mob ? 3.6 : 3.4, mob ? 4.4 : 4.0)
    camera.lookAt(0, 0.55, 0)
  }, [size.width, camera])
  return null
}

export default function ShifterScene({ gx, gy, gear, active }) {
  return (
    <Canvas frameloop={active ? 'always' : 'never'} dpr={[1, 1.6]} camera={{ position: [0, 3.4, 4], fov: 34 }} gl={{ antialias: true, alpha: true }} style={{ pointerEvents: 'none' }}>
      <Cam />
      <ambientLight intensity={0.35} />
      <directionalLight position={[2, 5, 3]} intensity={0.8} />
      <Shifter gx={gx} gy={gy} gear={gear} />
      <ContactShadows position={[0, -0.27, 0]} scale={6} blur={2.4} far={2} opacity={0.45} color="#0e1012" resolution={256} />
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={3} position={[0, 5, 2]} rotation-x={-Math.PI / 2.5} scale={[8, 2, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={1.6} position={[-5, 2, 2]} rotation-y={Math.PI / 3} scale={[4, 4, 1]} color="#fff3dc" />
        <Lightformer form="rect" intensity={1.4} position={[5, 1, 1]} rotation-y={-Math.PI / 2} scale={[4, 3, 1]} color="#e3e9f0" />
        <Lightformer form="circle" intensity={1.2} position={[0, 2, -5]} scale={3} color="#ffd98a" />
      </Environment>
    </Canvas>
  )
}
