import React from 'react'
// STUB — detailed architectural maquettes. Owned by the maquette agent.
// export function MaquetteTerraces(props), MaquetteTower(props), MaquetteCurve(props), MaquettePalazzo(props)
const Box = props => <mesh {...props}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="#efeae2" roughness={0.8} /></mesh>
export const MaquetteTerraces = p => <group {...p}><Box /></group>
export const MaquetteTower = p => <group {...p}><Box scale={[.6, 1.6, .6]} /></group>
export const MaquetteCurve = p => <group {...p}><Box scale={[1.4, .7, .7]} /></group>
export const MaquettePalazzo = p => <group {...p}><Box scale={[1.2, .9, .8]} /></group>
export const MAQUETTES = [MaquetteTerraces, MaquetteTower, MaquetteCurve, MaquettePalazzo]
