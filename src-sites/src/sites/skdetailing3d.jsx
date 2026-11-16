import React, { useRef, useMemo, useEffect } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'

/* curved bonnet panel: z = f(x,y) */
const PW = 6.4, PH = 4.2, A = .42, BB = .3, a2 = (PW / 2) ** 2, b2 = (PH / 2) ** 2
const f = (x, y) => A * (1 - x * x / a2) + BB * (1 - y * y / b2) + .07 * Math.exp(-((Math.abs(x) - 1.3) ** 2) / .18)
const fx = x => -2 * A * x / a2
const fy = y => -2 * BB * y / b2

function panelGeo() {
  const g = new THREE.PlaneGeometry(PW, PH, 110, 72)
  const p = g.attributes.position
  for (let i = 0; i < p.count; i++) p.setZ(i, f(p.getX(i), p.getY(i)))
  g.computeVertexNormals()
  return g
}

function filmMaterial(U) {
  const m = new THREE.MeshPhysicalMaterial({ color: '#bfeeff', roughness: 0, metalness: 0, clearcoat: 1, transparent: true, opacity: 1, depthWrite: false, envMapIntensity: 2.5 })
  m.onBeforeCompile = sh => {
    sh.uniforms.uWet = U.uWet; sh.uniforms.uT = U.uT
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec2 vU;').replace('#include <uv_vertex>', '#include <uv_vertex>\nvU = uv;')
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
      varying vec2 vU; uniform float uWet; uniform float uT;
      float hh(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
      float vn(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(hh(i),hh(i+vec2(1,0)),f.x),mix(hh(i+vec2(0,1)),hh(i+vec2(1,1)),f.x),f.y); }`)
      .replace('#include <color_fragment>', `#include <color_fragment>
      float n = vn(vec2(vU.x*9., vU.y*3. + uT*.08))*.6 + vn(vec2(vU.x*22., vU.y*7. + uT*.15))*.4;
      float sheet = smoothstep(.62 - uWet*.45, .7 - uWet*.4, n + (1.-vU.y)*uWet*.5);
      diffuseColor.a = sheet * uWet * .55;`)
  }
  return m
}

function Panel({ coatedRef, burst }) {
  const grp = useRef(), inst = useRef(), lightRef = useRef()
  const { size } = useThree()
  const mob = size.width < 768
  const N = mob ? 90 : 150
  const U = useMemo(() => ({ uWet: { value: 0 }, uT: { value: 0 } }), [])
  const geo = useMemo(panelGeo, [])
  const film = useMemo(() => filmMaterial(U), [U])
  const tmp = useMemo(() => new THREE.Object3D(), [])
  const q = useMemo(() => new THREE.Quaternion(), [])
  const g = useMemo(() => new THREE.Vector3(), [])
  const n = useMemo(() => new THREE.Vector3(), [])
  const Z = useMemo(() => new THREE.Vector3(0, 0, 1), [])
  const spawn = (d, x, y) => {
    d.x = x ?? (Math.random() - .5) * PW * .92; d.y = y ?? (Math.random() - .5) * PH * .92
    d.vx = 0; d.vy = 0; d.r = .035 + Math.random() ** 2 * .075; d.grow = 0; d.flat = coatedRef.current ? 0 : 1
  }
  const drops = useMemo(() => Array.from({ length: N }, () => { const d = {}; spawn(d); d.grow = Math.random(); return d }), [N])
  useEffect(() => { burst.current = (wx, wy, wz) => {
    const v = grp.current.worldToLocal(new THREE.Vector3(wx, wy, wz))
    for (let k = 0; k < 10; k++) { const d = drops[(Math.random() * N) | 0]; spawn(d, v.x + (Math.random() - .5) * .6, v.y + (Math.random() - .5) * .6); d.r = .05 + Math.random() * .06 }
  } }, [drops])
  useEffect(() => () => { geo.dispose(); film.dispose() }, [])

  useFrame((st, dt) => {
    dt = Math.min(dt, .04)
    const t = st.clock.elapsedTime
    const coated = coatedRef.current
    U.uT.value = t
    U.uWet.value = THREE.MathUtils.damp(U.uWet.value, coated ? 0 : 1, coated ? 2.5 : .5, dt)
    const sy = Math.min(1.2, window.scrollY / innerHeight)
    const G = grp.current
    G.position.set(mob ? 0 : 2.1, (mob ? 0 : -.3) - sy * .8, 0)
    G.scale.setScalar(mob ? .5 : .82)
    G.rotation.x = THREE.MathUtils.damp(G.rotation.x, -.95 + st.pointer.y * .3 - sy * .3, 3, dt)
    G.rotation.z = THREE.MathUtils.damp(G.rotation.z, -st.pointer.x * .42, 3, dt)
    G.rotation.y = THREE.MathUtils.damp(G.rotation.y, (mob ? 0 : -.28) + st.pointer.x * .15, 3, dt)
    lightRef.current.position.set(st.pointer.x * 6, 3 + st.pointer.y * 2, 4)
    G.updateMatrixWorld()
    G.getWorldQuaternion(q).invert()
    g.set(0, -2.4, 0).applyQuaternion(q)
    for (let i = 0; i < N; i++) {
      const d = drops[i]
      d.grow = Math.min(1, d.grow + dt * 2.5)
      d.flat = THREE.MathUtils.damp(d.flat, coated ? 0 : 1, coated ? 4 : 1.2, dt)
      n.set(-fx(d.x), -fy(d.y), 1).normalize()
      const gn = g.dot(n)
      const ax = g.x - gn * n.x, ay = g.y - gn * n.y
      const at = Math.hypot(ax, ay)
      if (coated) {
        d.r = Math.min(.15, d.r + dt * .006)
        const pin = .11 / d.r
        if (at > pin || Math.hypot(d.vx, d.vy) > .05) { d.vx += ax * dt * .8; d.vy += ay * dt * .8 }
        const k = Math.exp(-1.1 * dt); d.vx *= k; d.vy *= k
      } else {
        d.r = Math.min(.2, d.r + dt * .02)
        if (d.r > .19) { d.vx += ax * dt * .05; d.vy += ay * dt * .05 }
        const k = Math.exp(-5 * dt); d.vx *= k; d.vy *= k
      }
      d.x += d.vx * dt; d.y += d.vy * dt
      if (Math.abs(d.x) > PW / 2 || Math.abs(d.y) > PH / 2 || (!coated && Math.random() < dt * .03)) spawn(d)
      const r = d.r * d.grow, fl = d.flat
      const sxy = r * (1 + fl * 1.1), sz = r * (.72 - fl * .6)
      tmp.position.set(d.x, d.y, f(d.x, d.y) + sz * .25)
      tmp.quaternion.setFromUnitVectors(Z, n)
      const stretch = 1 + Math.min(.6, Math.hypot(d.vx, d.vy) * .5)
      tmp.scale.set(sxy, sxy * stretch, Math.max(.004, sz))
      tmp.updateMatrix()
      inst.current.setMatrixAt(i, tmp.matrix)
    }
    inst.current.instanceMatrix.needsUpdate = true
  })
  const onDown = e => { e.stopPropagation(); burst.current?.(e.point.x, e.point.y, e.point.z) }
  return (
    <>
      <pointLight ref={lightRef} intensity={30} distance={14} color="#dff8ff" />
      <group ref={grp}>
        <mesh geometry={geo} onPointerDown={onDown}>
          <meshPhysicalMaterial color="#0b2350" metalness={.65} roughness={.32} clearcoat={1} clearcoatRoughness={.02} envMapIntensity={1.6} />
        </mesh>
        <mesh geometry={geo} material={film} position-z={.012} />
        <instancedMesh ref={inst} args={[null, null, N]} frustumCulled={false}>
          <sphereGeometry args={[1, mob ? 16 : 24, mob ? 12 : 16]} />
          <meshPhysicalMaterial color="#e8fbff" metalness={.15} roughness={0} clearcoat={1} transparent opacity={.82} envMapIntensity={3.2} ior={1.33} />
        </instancedMesh>
      </group>
    </>
  )
}

export default function Scene({ coatedRef }) {
  const burst = useRef(null)
  return (
    <Canvas dpr={[1, 1.6]} camera={{ position: [0, 0, 8], fov: 40 }} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={.25} />
      <Panel coatedRef={coatedRef} burst={burst} />
      <Environment resolution={256}>
        <color attach="background" args={['#040816']} />
        <Lightformer form="rect" intensity={6} position={[0, 5, 2]} rotation-x={Math.PI / 2} scale={[14, 1.2, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={3} position={[0, 5, -2]} rotation-x={Math.PI / 2} scale={[14, .5, 1]} color="#7fe9ff" />
        <Lightformer form="rect" intensity={2.5} position={[-6, 0, 1]} rotation-y={Math.PI / 2} scale={[10, 1, 1]} color="#c9d1dc" />
        <Lightformer form="rect" intensity={2} position={[6, 1, 0]} rotation-y={-Math.PI / 2} scale={[10, 2, 1]} color="#34e1ff" />
        <Lightformer form="ring" intensity={3} position={[0, 2, 6]} scale={2.5} color="#ffffff" />
      </Environment>
    </Canvas>
  )
}
