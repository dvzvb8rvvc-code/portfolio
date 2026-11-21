import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
// STUB scene — see engine.jsx contract.
export default function ScenePalazzo({ track }) {
  const g = useRef()
  useFrame(() => { const t = track.current; if (!g.current) return; g.current.visible = t.on })
  return <group ref={g} />
}
