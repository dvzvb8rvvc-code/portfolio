import React, { useRef, useMemo, useEffect } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, Float } from '@react-three/drei'
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { nailPath, getCanvas, store } from './nailartmw-paint'

/* extruded nail tip with a C-curve; UVs = planar projection so the 2D painting lands exactly on the nail */
function useNailGeo() {
  return useMemo(() => {
    const s = new THREE.Shape(); nailPath(s, 1, 1.5, true)
    let g = new THREE.ExtrudeGeometry(s, { depth: .04, bevelEnabled: true, bevelThickness: .035, bevelSize: .028, bevelSegments: 5, curveSegments: 28 })
    g.translate(-.5, -.75, 0)
    g.deleteAttribute('normal')
    const p = g.attributes.position, uv = g.attributes.uv
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i)
      uv.setXY(i, x + .5, (y + .75) / 1.5)
      p.setZ(i, z - x * x * 1.1 - (y + .75) * (y + .75) * .06)
    }
    g = mergeVertices(g, 1e-4)
    g.computeVertexNormals()
    return g
  }, [])
}

function Nail({ progress, studio }) {
  const g = useRef(), m = useRef()
  const geo = useNailGeo()
  const { size } = useThree()
  const tex = useMemo(() => {
    const t = new THREE.CanvasTexture(getCanvas())
    t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4
    return t
  }, [])
  const ver = useRef(-1)
  useEffect(() => () => tex.dispose(), [tex])
  useFrame((st, dt) => {
    if (store.ver !== ver.current) { ver.current = store.ver; tex.needsUpdate = true }
    const t = st.clock.elapsedTime, pr = progress ? progress.get() : 0
    const mob = size.width < 768
    const sc = studio ? (mob ? 1.55 : 2.3) : (mob ? 1.9 : 2.5)
    g.current.scale.setScalar(sc)
    g.current.position.set(studio ? 0 : (mob ? 0 : 1.45), studio ? 0 : (mob ? .35 : 0) + pr * 1.6, 0)
    const ty = (studio ? t * .9 : Math.sin(t * .45) * .7) + st.pointer.x * .5 + pr * 3.2
    g.current.rotation.y = studio ? ty : THREE.MathUtils.lerp(g.current.rotation.y, ty, .08)
    g.current.rotation.x = THREE.MathUtils.lerp(g.current.rotation.x, -.18 - st.pointer.y * .25, .06)
    g.current.rotation.z = studio ? .12 : .32 + Math.sin(t * .3) * .05
  })
  return (
    <group ref={g}>
      <mesh geometry={geo}>
        <meshPhysicalMaterial ref={m} map={tex} roughness={.3} metalness={0} clearcoat={1} clearcoatRoughness={.04} envMapIntensity={1.1} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

const BLOBS = [[-2.6, 1.6, -1, .34, '#ff3b1f'], [2.9, -1.7, -.5, .26, '#2541ff'], [-1.9, -2, .4, .22, '#ffd60a'], [2.3, 2, -1.6, .42, '#121212'], [-3.4, -.2, -2, .18, '#2541ff'], [3.5, .4, -1.2, .16, '#ff3b1f']]
function Blobs() {
  const { size } = useThree()
  const k = size.width < 768 ? .6 : 1
  return BLOBS.map(([x, y, z, r, c], i) => (
    <Float key={i} speed={1.4 + i * .2} rotationIntensity={1.2} floatIntensity={1.6}>
      <mesh position={[x * k, y * (size.width < 768 ? .8 : 1), z]} scale={[r, r * 1.15, r]}>
        <sphereGeometry args={[1, 40, 28]} />
        <meshPhysicalMaterial color={c} roughness={.18} clearcoat={1} clearcoatRoughness={.05} />
      </mesh>
    </Float>
  ))
}

export default function NailScene({ progress, studio = false }) {
  return (
    <Canvas flat dpr={[1, 1.6]} camera={{ position: [0, 0, 8], fov: 38 }} gl={{ antialias: true, alpha: true }} style={{ pointerEvents: 'none' }}>
      <ambientLight intensity={.55} />
      <directionalLight position={[3, 4, 5]} intensity={1.2} />
      <Nail progress={progress} studio={studio} />
      {!studio && <Blobs />}
      <Environment resolution={256}>
        <color attach="background" args={['#e9e6e0']} />
        <Lightformer form="rect" intensity={4} position={[0, 5, -2]} scale={[10, 2, 1]} />
        <Lightformer form="rect" intensity={3} position={[-5, 1, 2]} rotation-y={Math.PI / 2} scale={[6, 2, 1]} />
        <Lightformer form="ring" intensity={3} position={[3, 2, 5]} scale={1.6} />
        <Lightformer form="rect" intensity={1.4} position={[5, -1, 1]} rotation-y={-Math.PI / 2} scale={[6, 3, 1]} color="#ffd9c9" />
      </Environment>
    </Canvas>
  )
}
