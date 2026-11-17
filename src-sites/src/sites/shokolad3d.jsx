import React, { useMemo, useRef, useState, useEffect } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, ContactShadows, RoundedBox, Html } from '@react-three/drei'
import { click } from './shokolad-sfx'

const C = { body: '#e7e4dd', cocoa: '#5b3a26', dark: '#24180f', orange: '#ff5b1f', blue: '#2f5bea', grey: '#bdb9b1' }
// callout ranges — must match shokolad.jsx
const R = [[0.2, 0.34], [0.34, 0.48], [0.48, 0.62], [0.62, 0.76], [0.76, 0.9]]
const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }
const lerp = (a, b, t) => a + (b - a) * t
const activeIdx = p => R.findIndex(([a, b]) => p >= a && p < b)

const tagStyle = { width: 26, height: 26, borderRadius: 99, display: 'grid', placeItems: 'center', font: "700 11px 'IBM Plex Mono',monospace", color: '#fff', background: C.orange, boxShadow: '0 0 0 3px rgba(231,228,221,.9)', pointerEvents: 'none', transition: 'transform .3s, background .3s', whiteSpace: 'nowrap' }

function Tag({ n, position, tags, i }) {
  return (
    <Html center position={position} zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
      <div ref={el => (tags.current[i] = el)} style={{ ...tagStyle, opacity: 0 }}>{n}</div>
    </Html>
  )
}

function useScreenTexture(level, on) {
  const canvas = useMemo(() => { const c = document.createElement('canvas'); c.width = 256; c.height = 140; return c }, [])
  const tex = useMemo(() => { const t = new THREE.CanvasTexture(canvas); t.colorSpace = THREE.SRGBColorSpace; return t }, [canvas])
  useEffect(() => {
    const g = canvas.getContext('2d')
    g.fillStyle = '#17110c'; g.fillRect(0, 0, 256, 140)
    g.fillStyle = on ? '#ff6a2a' : '#5a3a26'
    g.font = "bold 22px 'IBM Plex Mono', monospace"
    g.fillText(on ? 'ШК·108' : 'ПАУЗА', 18, 40)
    g.font = "16px 'IBM Plex Mono', monospace"
    g.fillText('ЛАМПЫ ' + (on ? level : 0) + '/3', 18, 70)
    for (let i = 0; i < 12; i++) {
      const lit = on && i < (level + 1) * 3
      g.fillStyle = lit ? (i > 8 ? '#ffb38a' : '#ff6a2a') : '#3a2a1e'
      g.fillRect(18 + i * 18, 92, 13, 28)
    }
    tex.needsUpdate = true
  }, [level, on, canvas, tex])
  return tex
}

function Knob({ x, y, color, target, idx, onTurn }) {
  const g = useRef()
  const hover = v => { document.body.style.cursor = v ? 'pointer' : '' }
  useFrame((_, dt) => { g.current.rotation.z = lerp(g.current.rotation.z, target.current[idx], Math.min(1, dt * 14)) })
  return (
    <group position={[x, y, 0]}>
      <mesh position-z={0.02} rotation-x={Math.PI / 2}><cylinderGeometry args={[0.22, 0.22, 0.03, 32]} /><meshStandardMaterial color={C.dark} roughness={0.6} /></mesh>
      <group ref={g} position-z={0.1}>
        <mesh rotation-x={Math.PI / 2} onClick={e => { e.stopPropagation(); onTurn(idx) }} onPointerOver={() => hover(true)} onPointerOut={() => hover(false)}>
          <cylinderGeometry args={[0.16, 0.17, 0.16, 32]} /><meshStandardMaterial color={color} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.1, 0.085]}><boxGeometry args={[0.03, 0.08, 0.01]} /><meshStandardMaterial color="#fff" /></mesh>
      </group>
    </group>
  )
}

function Btn({ x, y, color, onPress, w = 0.24 }) {
  const m = useRef(), down = useRef(false)
  useFrame((_, dt) => { m.current.position.z = lerp(m.current.position.z, down.current ? 0.02 : 0.06, Math.min(1, dt * 20)) })
  return (
    <group position={[x, y, 0]}>
      <RoundedBox ref={m} args={[w, 0.13, 0.08]} radius={0.03} smoothness={3}
        onPointerDown={e => { e.stopPropagation(); down.current = true; click(1400, 0.03) }}
        onPointerUp={e => { e.stopPropagation(); down.current = false; onPress && onPress() }}
        onPointerOut={() => { down.current = false; document.body.style.cursor = '' }} onPointerOver={() => { document.body.style.cursor = 'pointer' }}>
        <meshStandardMaterial color={color} roughness={0.4} />
      </RoundedBox>
    </group>
  )
}

function Bottle() {
  const geo = useMemo(() => {
    const pts = [[0, 0], [0.2, 0], [0.22, 0.04], [0.22, 0.62], [0.16, 0.72], [0.08, 0.76], [0.08, 0.86], [0, 0.86]].map(([a, b]) => new THREE.Vector2(a, b))
    return new THREE.LatheGeometry(pts, 32)
  }, [])
  return (
    <group>
      <mesh geometry={geo}><meshStandardMaterial color={C.cocoa} roughness={0.3} /></mesh>
      <mesh position-y={0.93}><cylinderGeometry args={[0.1, 0.1, 0.16, 24]} /><meshStandardMaterial color={C.orange} roughness={0.4} /></mesh>
      <mesh position={[0, 0.36, 0.215]}><planeGeometry args={[0.24, 0.3]} /><meshStandardMaterial color={C.body} roughness={0.7} /></mesh>
    </group>
  )
}

function Device({ progress }) {
  const root = useRef(), shell = useRef(), lamps = useRef(), frame = useRef(), panel = useRef(), ctrl = useRef(), bottle = useRef(), light = useRef()
  const tags = useRef([])
  const tubeMat = useRef(null)
  if (!tubeMat.current) tubeMat.current = new THREE.MeshStandardMaterial({ color: '#ffe3cc', emissive: '#ff7a2a', emissiveIntensity: 1, roughness: 0.3 })
  const [level, setLevel] = useState(2), [on, setOn] = useState(true)
  const target = useRef([0.6, -0.6])
  const tex = useScreenTexture(level, on)
  const glow = useRef(0)
  const turn = i => {
    click(i ? 2300 : 1900)
    target.current[i] -= Math.PI / 4
    if (i === 0) { setLevel(l => (l + 1) % 4); setOn(true) }
  }
  useFrame((st, dt) => {
    const p = progress.get(), t = st.clock.elapsedTime
    const e = ss(0.15, 0.36, p) * (1 - ss(0.9, 0.985, p))
    const turnA = ss(0.08, 0.36, p) - ss(0.9, 1, p) * 0.7
    root.current.rotation.y = lerp(-0.22, -0.68, turnA) + st.pointer.x * 0.1 + Math.sin(t * 0.5) * 0.02
    root.current.rotation.x = lerp(0.06, 0.34, turnA) - st.pointer.y * 0.05
    shell.current.position.z = -1.2 * e
    lamps.current.position.z = 0.56 + 0.55 * e
    frame.current.position.z = 0.6 + 1.2 * e
    panel.current.position.z = 0.56 + 1.0 * e
    ctrl.current.position.z = 0.6 + 1.9 * e
    bottle.current.position.set(2.15 + 0.6 * e, -1 + 0.35 * e, 0.2 * e)
    bottle.current.rotation.y = t * 0.3
    const want = on ? 0.35 + level * 0.65 : 0.03
    glow.current = lerp(glow.current, want, Math.min(1, dt * 6))
    tubeMat.current.emissiveIntensity = glow.current * (0.95 + Math.sin(t * 9) * 0.03)
    light.current.intensity = glow.current * 0.7
    const a = activeIdx(p)
    tags.current.forEach((el, i) => { if (!el) return; el.style.opacity = String(Math.min(1, e * 1.4)); el.style.transform = `scale(${a === i ? 1.35 : 1})`; el.style.background = a === i ? C.orange : C.blue })
  })
  const tubes = useMemo(() => Array.from({ length: 7 }, (_, i) => -0.84 + i * 0.28), [])
  return (
    <group ref={root}>
      {/* 03 shell */}
      <group ref={shell}>
        <RoundedBox args={[3.3, 2.1, 1.1]} radius={0.14} smoothness={4}><meshStandardMaterial color={C.body} roughness={0.55} /></RoundedBox>
        <RoundedBox args={[1.3, 0.16, 0.22]} radius={0.07} smoothness={3} position={[-0.45, 1.13, 0]}><meshStandardMaterial color={C.orange} roughness={0.4} /></RoundedBox>
        {[[-1.4, -0.4], [1.4, -0.4], [-1.4, 0.4], [1.4, 0.4]].map(([x, z], i) => (
          <mesh key={i} position={[x, -1.1, z]}><cylinderGeometry args={[0.09, 0.09, 0.1, 16]} /><meshStandardMaterial color={C.blue} roughness={0.5} /></mesh>
        ))}
        <Tag n="03" i={2} tags={tags} position={[-1.65, 0.9, 0]} />
      </group>
      {/* 02 lamps */}
      <group ref={lamps} position={[-0.45, 0, 0.56]}>
        <mesh><boxGeometry args={[2.1, 1.55, 0.04]} /><meshStandardMaterial color={C.dark} roughness={0.8} /></mesh>
        {tubes.map(x => (
          <mesh key={x} position={[x, 0, 0.09]} material={tubeMat.current}><cylinderGeometry args={[0.075, 0.075, 1.32, 16]} /></mesh>
        ))}
        <pointLight ref={light} position={[0, 0, 0.5]} color="#ff8a44" distance={2.2} />
        <Tag n="02" i={1} tags={tags} position={[0.9, 0.9, 0.1]} />
      </group>
      {/* grille frame */}
      <group ref={frame} position={[-0.45, 0, 0.6]}>
        {[[0, 0.83, 2.2, 0.1], [0, -0.83, 2.2, 0.1], [-1.1, 0, 0.1, 1.76], [1.1, 0, 0.1, 1.76]].map(([x, y, w, h], i) => (
          <mesh key={i} position={[x, y, 0.12]}><boxGeometry args={[w, h, 0.06]} /><meshStandardMaterial color={C.cocoa} roughness={0.45} /></mesh>
        ))}
      </group>
      {/* 05 panel + screen */}
      <group ref={panel} position={[1.12, 0, 0.56]}>
        <RoundedBox args={[0.82, 1.8, 0.05]} radius={0.02} smoothness={2}><meshStandardMaterial color={C.cocoa} roughness={0.5} /></RoundedBox>
        <mesh position={[0, 0.58, 0.035]}><planeGeometry args={[0.64, 0.35]} /><meshBasicMaterial map={tex} toneMapped={false} /></mesh>
        <Tag n="05" i={4} tags={tags} position={[0.52, 0.8, 0.05]} />
      </group>
      {/* 01 controls */}
      <group ref={ctrl} position={[1.12, 0, 0.6]}>
        <Knob x={-0.18} y={0.08} color={C.orange} target={target} idx={0} onTurn={turn} />
        <Knob x={0.2} y={-0.28} color={C.body} target={target} idx={1} onTurn={turn} />
        <Btn x={-0.2} y={-0.64} color={C.orange} onPress={() => setOn(v => !v)} />
        <Btn x={0.15} y={-0.64} color={C.blue} onPress={() => { setLevel(0); setOn(true); target.current = [0.6, -0.6] }} />
        <Tag n="01" i={0} tags={tags} position={[-0.5, 0.25, 0.15]} />
      </group>
      {/* 04 bottle */}
      <group ref={bottle}>
        <Bottle />
        <Tag n="04" i={3} tags={tags} position={[0, 1.25, 0]} />
      </group>
    </group>
  )
}

function Rig({ children }) {
  const g = useRef()
  const { size } = useThree()
  useFrame(() => {
    const mob = size.width < 768
    g.current.position.set(mob ? -0.15 : 1.75, mob ? 1.35 : 0.05, 0)
    g.current.scale.setScalar(mob ? 0.46 : size.width < 1100 ? 0.7 : 0.82)
  })
  return <group ref={g}>{children}</group>
}

export default function DeviceScene({ progress, active }) {
  return (
    <Canvas frameloop={active ? 'always' : 'never'} dpr={[1, 1.6]} camera={{ position: [0, 0, 9], fov: 35 }} gl={{ antialias: true, alpha: true }} style={{ pointerEvents: 'none' }}
      eventSource={typeof document !== 'undefined' ? document.getElementById('root') : undefined} eventPrefix="client">
      <ambientLight intensity={0.25} />
      <Rig>
        <Device progress={progress} />
        <ContactShadows position={[0, -1.25, 0]} scale={9} blur={2.6} far={3} opacity={0.35} color="#3b2618" resolution={256} />
      </Rig>
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={3} position={[0, 5, 3]} rotation-x={-Math.PI / 3} scale={[10, 2, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={2} position={[-5, 1, 3]} rotation-y={Math.PI / 3} scale={[5, 4, 1]} color="#fff4ea" />
        <Lightformer form="rect" intensity={1.2} position={[5, 0, 2]} rotation-y={-Math.PI / 2} scale={[5, 3, 1]} color="#dfe6ff" />
        <Lightformer form="circle" intensity={1.5} position={[0, -4, 4]} scale={3} color="#ffd9c2" />
      </Environment>
    </Canvas>
  )
}
