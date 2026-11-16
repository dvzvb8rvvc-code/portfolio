import React, { useRef, useMemo, useEffect } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, ContactShadows } from '@react-three/drei'

/* shared uniforms: split position (world x) */
const U = { uSplit: { value: 0.4 } }

const NOISE = `
varying vec3 vW; varying vec3 vO;
uniform float uSplit;
float h3(vec3 p){ p = fract(p*0.3183099+.1); p *= 17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
float vn(vec3 x){ vec3 i=floor(x); vec3 f=fract(x); f=f*f*(3.0-2.0*f);
  return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z); }
float fbm(vec3 p){ float a=.5, s=0.; for(int i=0;i<4;i++){ s+=a*vn(p); p*=2.03; a*=.5; } return s; }
`

/* physical clearcoat paint on one side of the split, dusty matte grime on the other */
function splitMaterial(params, dustAmt = 1) {
  const m = new THREE.MeshPhysicalMaterial(params)
  m.onBeforeCompile = sh => {
    sh.uniforms.uSplit = U.uSplit
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vW; varying vec3 vO;')
      .replace('#include <project_vertex>', '#include <project_vertex>\nvW = (modelMatrix * vec4(transformed,1.0)).xyz; vO = transformed;')
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\n' + NOISE)
      .replace('#include <color_fragment>', `#include <color_fragment>
        float edge = vW.x - uSplit;
        float dirty = smoothstep(-0.015, 0.015, edge);
        float n = fbm(vO*3.2);
        float streak = fbm(vec3(vO.x*16., vO.y*1.2, vO.z*16.));
        float spots = smoothstep(.62,.7, vn(vO*22.));
        vec3 dust = mix(vec3(.2,.17,.13), vec3(.4,.35,.27), n);
        float cover = clamp((.72 + n*.5 + streak*.35 + spots*.3 - smoothstep(.9,1.5,vO.y)*.25) * ${dustAmt.toFixed(2)}, 0., 1.);
        diffuseColor.rgb = mix(diffuseColor.rgb, mix(diffuseColor.rgb*.45, dust, cover), dirty);`)
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, .92, dirty);')
      .replace('#include <metalnessmap_fragment>', '#include <metalnessmap_fragment>\nmetalnessFactor = mix(metalnessFactor, .05, dirty);')
      .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\ntotalEmissiveRadiance += vec3(.25,.5,1.)*(1.-smoothstep(0.,.035,abs(edge)))*2.2;')
      .replace('#include <lights_physical_fragment>', '#include <lights_physical_fragment>\n#ifdef USE_CLEARCOAT\nmaterial.clearcoat *= (1.-dirty);\n#endif')
  }
  return m
}

function bodyGeo() {
  const s = new THREE.Shape()
  s.moveTo(-2.15, 0.28)
  s.lineTo(-1.8, 0.28); s.absarc(-1.35, 0.28, 0.47, Math.PI, 0, true)
  s.lineTo(0.9, 0.28); s.absarc(1.35, 0.28, 0.47, Math.PI, 0, true)
  s.lineTo(2.1, 0.28)
  s.quadraticCurveTo(2.28, 0.3, 2.25, 0.62)
  s.quadraticCurveTo(2.2, 0.82, 1.85, 0.88)
  s.lineTo(0.95, 0.98)
  s.quadraticCurveTo(0.55, 1.15, 0.25, 1.42)
  s.quadraticCurveTo(-0.3, 1.52, -0.95, 1.44)
  s.quadraticCurveTo(-1.45, 1.3, -1.8, 1.0)
  s.lineTo(-2.12, 0.94)
  s.quadraticCurveTo(-2.3, 0.8, -2.26, 0.5)
  s.quadraticCurveTo(-2.24, 0.3, -2.15, 0.28)
  const g = new THREE.ExtrudeGeometry(s, { depth: 1.5, bevelEnabled: true, bevelThickness: .16, bevelSize: .12, bevelSegments: 5, curveSegments: 20 })
  g.translate(0, 0, -0.75)
  return g
}
function glassGeo() {
  const s = new THREE.Shape()
  s.moveTo(0.82, 1.02); s.quadraticCurveTo(0.5, 1.18, 0.24, 1.36); s.quadraticCurveTo(-0.3, 1.44, -0.92, 1.37)
  s.quadraticCurveTo(-1.35, 1.24, -1.6, 1.04); s.lineTo(0.82, 1.02)
  const g = new THREE.ExtrudeGeometry(s, { depth: 1.86, bevelEnabled: true, bevelThickness: .02, bevelSize: .02, bevelSegments: 2, curveSegments: 16 })
  g.translate(0, 0, -0.93)
  return g
}

function Wheel({ position, mats }) {
  return (
    <group position={position} rotation={[Math.PI / 2, 0, 0]}>
      <mesh material={mats.tyre}><cylinderGeometry args={[0.42, 0.42, 0.34, 40]} /></mesh>
      <mesh material={mats.rim} position={[0, position[2] > 0 ? 0.172 : -0.172, 0]}><cylinderGeometry args={[0.27, 0.27, 0.02, 40]} /></mesh>
      <mesh material={mats.rim} position={[0, position[2] > 0 ? 0.18 : -0.18, 0]}><cylinderGeometry args={[0.07, 0.07, 0.04, 20]} /></mesh>
    </group>
  )
}

function Car({ ctl }) {
  const g = useRef(), blade = useRef(), handle = useRef(), glow = useRef()
  const { size, camera, raycaster } = useThree()
  const mob = size.width < 768
  const mats = useMemo(() => ({
    body: splitMaterial({ color: '#1f55f0', metalness: .55, roughness: .28, clearcoat: 1, clearcoatRoughness: .04, envMapIntensity: 1.4 }),
    rim: splitMaterial({ color: '#c9ced6', metalness: .95, roughness: .18 }, 1.2),
    tyre: new THREE.MeshStandardMaterial({ color: '#111214', roughness: .85 }),
    glass: new THREE.MeshPhysicalMaterial({ color: '#05070b', metalness: .2, roughness: .05, clearcoat: 1, envMapIntensity: 2 }),
    head: new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#cfe0ff', emissiveIntensity: 2.5 }),
    tail: new THREE.MeshStandardMaterial({ color: '#ff2a3a', emissive: '#ff1a2a', emissiveIntensity: 2 }),
  }), [])
  const geos = useMemo(() => ({ body: bodyGeo(), glass: glassGeo() }), [])
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), [])
  const hit = useMemo(() => new THREE.Vector3(), [])
  const v2 = useMemo(() => new THREE.Vector2(), [])
  useEffect(() => () => { Object.values(mats).forEach(m => m.dispose()); Object.values(geos).forEach(x => x.dispose()) }, [])

  useFrame((st, dt) => {
    const t = st.clock.elapsedTime
    const c = ctl.current
    let target
    if (c.active || performance.now() / 1000 - c.last < 2.5) {
      v2.set(c.x, 0); raycaster.setFromCamera(v2, camera)
      target = raycaster.ray.intersectPlane(plane, hit) ? hit.x : U.uSplit.value
    } else {
      const cx = mob ? 0 : 1.9
      target = cx + Math.sin(t * .55) * (mob ? 1.3 : 2.0)
    }
    U.uSplit.value = THREE.MathUtils.damp(U.uSplit.value, target, c.active ? 14 : 3, dt)
    const sy = Math.min(1, window.scrollY / innerHeight)
    const baseY = mob ? -.95 : -1.5
    g.current.position.set(mob ? 0 : 1.9, baseY - sy * .6, 0)
    g.current.scale.setScalar(mob ? .64 : .88)
    g.current.rotation.y = THREE.MathUtils.damp(g.current.rotation.y, -.42 + (c.active ? 0 : st.pointer.x * .18) + sy * .9, 3, dt)
    g.current.rotation.x = THREE.MathUtils.damp(g.current.rotation.x, .06 - st.pointer.y * .05, 3, dt)
    const x = U.uSplit.value
    const yb = g.current.position.y
    const sc = mob ? .64 : .88
    blade.current.position.set(x, yb + 0.9 * sc, 0); blade.current.scale.set(1, sc, sc)
    glow.current.position.set(x, yb + 0.9 * sc, 1.3 * sc); glow.current.scale.set(1, sc, sc)
    handle.current.position.set(x, yb + 2.35 * sc, 0)
    handle.current.rotation.z = t * 1.4
    handle.current.scale.setScalar((c.active ? 1.25 : 1) * sc)
  })
  return (
    <>
      <group ref={g}>
        <mesh geometry={geos.body} material={mats.body} />
        <ContactShadows position={[0, -.15, 0]} opacity={.6} scale={[7, 4]} blur={2.4} far={2} resolution={256} color="#000" frames={1} />
        <mesh geometry={geos.glass} material={mats.glass} />
        {[[-1.35, .28, .78], [1.35, .28, .78], [-1.35, .28, -.78], [1.35, .28, -.78]].map((p, i) => <Wheel key={i} position={p} mats={mats} />)}
        <mesh material={mats.head} position={[2.3, .7, .52]}><boxGeometry args={[.06, .1, .38]} /></mesh>
        <mesh material={mats.head} position={[2.3, .7, -.52]}><boxGeometry args={[.06, .1, .38]} /></mesh>
        <mesh material={mats.tail} position={[-2.33, .8, .55]}><boxGeometry args={[.05, .1, .34]} /></mesh>
        <mesh material={mats.tail} position={[-2.33, .8, -.55]}><boxGeometry args={[.05, .1, .34]} /></mesh>
      </group>
      <mesh ref={blade}><boxGeometry args={[.012, 3.1, 2.6]} /><meshBasicMaterial color="#6aa0ff" transparent opacity={.22} depthWrite={false} toneMapped={false} /></mesh>
      <mesh ref={glow}><boxGeometry args={[.025, 3.1, .025]} /><meshBasicMaterial color="#cfe0ff" toneMapped={false} /></mesh>
      <group ref={handle}>
        <mesh><torusGeometry args={[.2, .028, 12, 48]} /><meshBasicMaterial color="#8fb6ff" toneMapped={false} /></mesh>
        <mesh><sphereGeometry args={[.09, 24, 16]} /><meshBasicMaterial color="#ffffff" toneMapped={false} /></mesh>
      </group>
    </>
  )
}

export default function Scene({ ctl }) {
  return (
    <Canvas dpr={[1, 1.6]} camera={{ position: [0, 1.2, 9.5], fov: 38 }} gl={{ antialias: true, alpha: true }} onCreated={({ camera }) => camera.lookAt(0, -.3, 0)}>
      <ambientLight intensity={.35} />
      <directionalLight position={[3, 6, 4]} intensity={1.6} />
      <Car ctl={ctl} />
      <Environment resolution={256}>
        <color attach="background" args={['#15171b']} />
        <Lightformer form="rect" intensity={5} position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[10, 3, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={2.5} position={[-6, 1, 2]} rotation-y={Math.PI / 2} scale={[8, 1.2, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={3} position={[6, 1, 0]} rotation-y={-Math.PI / 2} scale={[8, 1.6, 1]} color="#4d86ff" />
        <Lightformer form="ring" intensity={3} position={[2, 3, 6]} scale={2} color="#ffffff" />
      </Environment>
    </Canvas>
  )
}
