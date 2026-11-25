import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
// STUB — maquette showcase scene (see engine.jsx contract).
export default function SceneModels({ track }) {
  const g = useRef()
  useFrame(() => { if (g.current) g.current.visible = track.current.on })
  return <group ref={g} />
}
