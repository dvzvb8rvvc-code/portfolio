import React, { Suspense, useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { Environment, Lightformer, Html, useTexture } from '@react-three/drei'
import { EffectComposer, Bloom, DepthOfField, ChromaticAberration, ToneMapping, Noise, Vignette } from '@react-three/postprocessing'
import { ToneMappingMode, BlendFunction } from 'postprocessing'
import { buildModel, samplePoints, fillInstances, LEVELS, CENTER } from './heroBuild'
import { buildParticleGeometry, Particles } from './heroParticles'
import { PhotoSolid } from './heroPhoto'

/* Hero film — one canvas, four beats, all driven by a damped scroll value (no React state per frame):
   1 swirl → ink sketch   2 particles → solid PBR building, scan line, day → dusk, DOF pull
   3 exploded floors with labels   4 building melts → photo-cloud of render 5 → solid depth-displaced photo, dolly in */

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const seg = (p, a, b) => clamp((p - a) / (b - a))
const io = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const out3 = t => 1 - Math.pow(1 - t, 3)
const lerp = THREE.MathUtils.lerp

export const PHOTO = { c: [0, 1.7, -3.6], w: 8.6, aspect: 1800 / 1440, depth: 3.1 }
const SNAP = typeof location !== 'undefined' && /herosnap/.test(location.search) // test hook: no scroll damping
const CUT_LO = -4.4, CUT_HI = 6.6
const tex = n => `/portfolio/yts/tex/${n}.webp`

/* camera keyframes (orbit around the building) */
const DESK = {
  A: { th: -.58, el: .30, R: 29, ty: 0, ly: -1.3, sh: 4.4 },
  B: { th: -.22, el: .25, R: 27, ty: 0, ly: -.6, sh: 3.8 },
  C: { th: .36, el: .21, R: 25.5, ty: 0, ly: -.4, sh: 3.4 },
  D: { th: .52, el: .17, R: 30, ty: 1.9, ly: 0, sh: 1.2 },
  E: { th: .08, el: .1, R: 27, ty: .6, ly: 0, sh: 0 },
}
const MOB = {
  A: { th: -.5, el: .3, R: 44, ty: 0, ly: -3.4, sh: 0 },
  B: { th: -.2, el: .26, R: 42, ty: 0, ly: -3, sh: 0 },
  C: { th: .3, el: .22, R: 40, ty: 0, ly: -2.6, sh: 0 },
  D: { th: .45, el: .16, R: 50, ty: 2.0, ly: -1.6, sh: -3.2 },
  E: { th: .05, el: .08, R: 42, ty: .6, ly: -.5, sh: 0 },
}
function lerpPose(a, b, k) { const o = {}; for (const key in a) o[key] = lerp(a[key], b[key], k); return o }
const _r = new THREE.Vector3(), _up = new THREE.Vector3(0, 1, 0)
function orbit(o, pos, look) {
  pos.set(CENTER.x + Math.sin(o.th) * Math.cos(o.el) * o.R, CENTER.y + o.ty + Math.sin(o.el) * o.R, CENTER.z + Math.cos(o.th) * Math.cos(o.el) * o.R)
  look.set(CENTER.x, CENTER.y + o.ty + o.ly, CENTER.z)
  _r.subVectors(look, pos).cross(_up).normalize()
  look.addScaledVector(_r, -o.sh)
}
export function openingPose(mobile) {
  const pos = new THREE.Vector3(), look = new THREE.Vector3()
  orbit((mobile ? MOB : DESK).A, pos, look)
  return { C0: pos, T0: CENTER.clone(), L0: look }
}

function computeBeats(film, raw, t, reduced) {
  const b = film.b, p = film.p
  b.intro = reduced ? 1 : Math.max(out3(clamp((t - .1) / 3.6)), seg(p, 0, .03))
  b.morph = io(seg(p, .03, .16))
  b.solid = io(seg(p, .13, .28))
  b.dusk = io(seg(p, .27, .42))
  b.exOpen = io(seg(p, .32, .44))
  b.ex = b.exOpen * (1 - io(seg(p, .52, .58)))
  b.melt = io(seg(p, .57, .655))
  b.photo = io(seg(p, .625, .77))
  b.pix = io(seg(p, .745, .835))
  b.dolly = io(seg(p, .78, 1))
  b.cut = b.melt > 0 ? lerp(CUT_HI, CUT_LO, b.melt) : lerp(CUT_LO, CUT_HI, b.solid)
  b.scan = clamp(Math.sin(Math.PI * b.solid) * 1.6 + Math.sin(Math.PI * b.melt) * 1.6)
  b.solidCut = b.melt === 0 && b.solid >= .999 ? 100 : b.cut
}

const _pos = new THREE.Vector3(), _look = new THREE.Vector3(), _p1 = new THREE.Vector3(), _l1 = new THREE.Vector3()
function Director({ progress, film, mobile, reduced }) {
  const { camera } = useThree()
  useFrame((state, dt) => {
    const f = film.current
    dt = Math.min(dt, .05)
    if (f.t0 === null) f.t0 = state.clock.elapsedTime
    f.t = state.clock.elapsedTime - f.t0
    const raw = reduced ? 1 : progress.get()
    f.p = SNAP ? raw : THREE.MathUtils.damp(f.p, raw, 3.4, dt)
    f.v = THREE.MathUtils.damp(f.v, Math.abs(raw - f.last) / Math.max(dt, 1e-3), 5, dt)
    f.last = raw
    computeBeats(f, raw, f.t, reduced)
    const b = f.b, K = mobile ? MOB : DESK
    let o = lerpPose(K.A, K.B, b.morph)
    o = lerpPose(o, K.C, b.solid)
    o = lerpPose(o, K.D, b.exOpen)
    o = lerpPose(o, K.E, b.melt)
    o.th += Math.sin(f.t * .12) * .025 + state.pointer.x * .05 * (1 - b.photo)
    o.el += state.pointer.y * .02 * (1 - b.photo)
    orbit(o, _pos, _look)
    // beat 4: square up to the photo, then dolly into the terraces
    const [cx, cy, cz] = PHOTO.c
    const back = mobile ? 17 : 12.4
    _p1.set(cx, cy + .5, cz + back); _l1.set(cx, cy + .1, cz)
    _pos.lerp(_p1, b.photo); _look.lerp(_l1, b.photo)
    _p1.set(cx + .15 + state.pointer.x * .25, cy + .15 + state.pointer.y * .15, cz + (mobile ? 6.4 : 5.5)); _l1.set(cx - .1, cy - .55, cz - 1)
    _pos.lerp(_p1, b.dolly); _look.lerp(_l1, b.dolly)
    camera.position.copy(_pos)
    camera.lookAt(_look)
    f.look.copy(_look)
  }, -1)
  return null
}

/* ---------- the building ---------- */
function useBuildingMats(plane, mobile) {
  const t = useTexture({
    wd: tex('hero_wood_diff'), wn: tex('hero_wood_nor'),
    sd: tex('stone_diff'), sn: tex('stone_nor'), sa: tex('stone_arm'),
    pd: tex('plaster_diff'), pn: tex('plaster_nor'),
  })
  return useMemo(() => {
    Object.values(t).forEach(x => { x.wrapS = x.wrapT = THREE.RepeatWrapping; x.anisotropy = 4 })
    t.wd.colorSpace = t.sd.colorSpace = t.pd.colorSpace = THREE.SRGBColorSpace
    const base = { clippingPlanes: [plane], clipShadows: false }
    return {
      plaster: new THREE.MeshStandardMaterial({ ...base, map: t.pd, normalMap: t.pn, normalScale: new THREE.Vector2(.35, .35), color: '#fbf6ee', roughness: .82 }),
      stone: new THREE.MeshStandardMaterial({ ...base, map: t.sd, normalMap: t.sn, roughnessMap: t.sa, aoMap: null, color: '#e6dccb', roughness: 1, normalScale: new THREE.Vector2(1.1, 1.1) }),
      wood: new THREE.MeshStandardMaterial({ ...base, map: t.wd, normalMap: t.wn, color: '#f2e6da', roughness: .6 }),
      glass: new THREE.MeshStandardMaterial({ ...base, color: '#1b262b', metalness: 1, roughness: .05, envMapIntensity: 1.6, transparent: true, opacity: .62 }),
      frame: new THREE.MeshStandardMaterial({ ...base, color: '#2a2724', metalness: .7, roughness: .38 }),
      interior: new THREE.MeshStandardMaterial({ ...base, color: '#3a2a1c', emissive: '#ffb066', emissiveIntensity: .3, roughness: .9 }),
      green: new THREE.MeshStandardMaterial({ ...base, color: '#ffffff', roughness: .92 }),
      hill: new THREE.MeshStandardMaterial({ ...base, vertexColors: true, roughness: 1, alphaHash: true }),
    }
  }, [t, plane])
}

function Instanced({ geo, list, mat }) {
  const mesh = useMemo(() => { const m = new THREE.InstancedMesh(geo, mat, list.length); fillInstances(m, list); m.frustumCulled = false; return m }, [geo, list, mat])
  return <primitive object={mesh} />
}

function Label({ L, i, text, refFn }) {
  return (
    <Html position={[L.x + L.w / 2 + .25, L.y + .62, L.z + .3]} zIndexRange={[25, 0]} style={{ pointerEvents: 'none' }}>
      <div className="-translate-y-1/2">
        <div ref={refFn} style={{ opacity: 0, transform: 'translateX(-14px)', transition: `opacity .6s cubic-bezier(.16,1,.3,1) ${i * 110}ms, transform .8s cubic-bezier(.16,1,.3,1) ${i * 110}ms` }} className="flex items-center whitespace-nowrap font-['Inter_Tight',sans-serif]">
          <span className="h-[7px] w-[7px] rounded-full bg-[#c3a15e] shadow-[0_0_12px_#c3a15e]" />
          <span data-line className="h-px w-[40px] origin-left bg-gradient-to-r from-[#c3a15e] to-white/50 md:w-[120px]" style={{ transform: 'scaleX(0)', transition: `transform .9s cubic-bezier(.16,1,.3,1) ${i * 110 + 80}ms` }} />
          <span className="ml-3 text-[10px] font-semibold tabular-nums tracking-[.18em] text-[#c3a15e] md:text-[11px]">0{i + 1}</span>
          <span className="ml-2 font-['Instrument_Serif',serif] text-[20px] leading-none text-white md:text-[40px]">{text}</span>
        </div>
      </div>
    </Html>
  )
}

function Building({ model, film, labels, mobile }) {
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, -1, 0), CUT_LO), [])
  const mats = useBuildingMats(plane, mobile)
  const lv = useRef([]), hill = useRef(), grid = useRef(), lab = useRef([]), on = useRef(false)
  const { gl } = useThree()
  useEffect(() => { gl.localClippingEnabled = true }, [gl])
  useFrame(() => {
    const b = film.current.b
    plane.constant = b.solidCut
    const vis = b.solidCut > CUT_LO + .01
    lv.current.forEach((g, i) => {
      if (!g) return
      g.visible = vis
      const e = b.ex
      g.position.set(0, (i * 1.25 + .45) * e, LEVELS[i].z * -.28 * e)
      g.rotation.y = (i - 1) * .13 * e
    })
    hill.current.visible = vis
    hill.current.position.y = -8 * io(clamp(b.ex * 1.25))
    mats.interior.emissiveIntensity = lerp(.25, 4.2, b.dusk)
    mats.glass.envMapIntensity = lerp(1.6, .9, b.dusk)
    grid.current.material.opacity = .32 * b.ex
    grid.current.visible = b.ex > .01
    const show = b.ex > .62
    if (show !== on.current) {
      on.current = show
      lab.current.forEach(el => { if (!el) return; el.style.opacity = show ? 1 : 0; el.style.transform = show ? 'translateX(0)' : 'translateX(-14px)'; const ln = el.querySelector('[data-line]'); if (ln) ln.style.transform = show ? 'scaleX(1)' : 'scaleX(0)' })
    }
  })
  const gridGeo = useMemo(() => {
    const pts = []
    for (let k = -10; k <= 10; k++) { pts.push(k, 0, -10, k, 0, 10, -10, 0, k, 10, 0, k) }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); return g
  }, [])
  return (
    <group>
      <group ref={hill}>
        <mesh geometry={model.hill} material={mats.hill} />
        <Instanced geo={model.geoms.cypress} list={model.cypress} mat={mats.green} />
        <Instanced geo={model.geoms.crown} list={model.crowns} mat={mats.green} />
      </group>
      {model.levels.map((l, i) => (
        <group key={i} ref={el => (lv.current[i] = el)}>
          {Object.entries(l.fills).map(([k, g]) => <mesh key={k} geometry={g} material={mats[k]} renderOrder={k === 'glass' ? 1 : 0} />)}
          <Instanced geo={model.geoms.bush} list={l.bushes} mat={mats.green} />
          <Label L={l.L} i={i} text={labels[i]} refFn={el => (lab.current[i] = el)} />
        </group>
      ))}
      <lineSegments ref={grid} geometry={gridGeo} position={[0, -1.2, -2]} scale={.9}>
        <lineBasicMaterial color="#c3a15e" transparent opacity={0} depthWrite={false} />
      </lineSegments>
    </group>
  )
}

/* lights: day → golden hour → dusk */
function Lights({ film, mobile }) {
  const key = useRef(), hemi = useRef(), { scene } = useThree()
  const cDay = useMemo(() => new THREE.Color('#fff1dc'), []), cDusk = useMemo(() => new THREE.Color('#ff8f4d'), [])
  useFrame(() => {
    const d = film.current.b.dusk
    key.current.color.copy(cDay).lerp(cDusk, d)
    key.current.intensity = lerp(2.4, .9, d)
    key.current.position.set(lerp(-7, 9, d), lerp(10, 3.2, d), lerp(6, 3, d))
    hemi.current.intensity = lerp(.55, .12, d)
    scene.environmentIntensity = lerp(1, .32, d)
  })
  return (
    <>
      <directionalLight ref={key} position={[-7, 10, 6]} intensity={2.4} />
      <hemisphereLight ref={hemi} args={['#fff6ea', '#7f8a6a', .55]} />
      {mobile ? (
        <Environment resolution={64} frames={1}>
          <Lightformer intensity={2.4} position={[0, 7, 4]} scale={[14, 5, 1]} color="#fff2df" />
          <Lightformer intensity={1.4} position={[-9, 2, 0]} rotation-y={Math.PI / 2} scale={[9, 3, 1]} color="#ffbf80" />
          <Lightformer intensity={.9} position={[9, 3, -2]} rotation-y={-Math.PI / 2} scale={[9, 3, 1]} color="#bcd3df" />
        </Environment>
      ) : <Environment files="/portfolio/yts/hdr/venice_sunset.hdr" />}
    </>
  )
}

function World({ film, labels, mobile }) {
  const N = mobile ? 24000 : 96000
  const [sketch, photoS, depth] = useLoader(THREE.TextureLoader, ['/portfolio/yts/img/30-s.webp', '/portfolio/yts/img/5-s.webp', '/portfolio/yts/depth/5.webp'])
  photoS.colorSpace = THREE.SRGBColorSpace
  const model = useMemo(buildModel, [])
  const pose = useMemo(() => openingPose(mobile), [mobile])
  const geometry = useMemo(() => buildParticleGeometry({ N, build: samplePoints(model, N), sketchImage: sketch.image, pose, sketchH: mobile ? 11.2 : 11.6, photoAspect: PHOTO.aspect }), [model, sketch, pose, N])
  return (
    <>
      <Building model={model} film={film} labels={labels} mobile={mobile} />
      <Particles geometry={geometry} film={film} photoMap={photoS} depthMap={depth} photo={PHOTO} swirlC={CENTER} size={mobile ? .05 : .032} />
      <PhotoSolid film={film} photo={PHOTO} depthMap={depth} mobile={mobile} />
    </>
  )
}

const _focus = new THREE.Vector3()
function Post({ film }) {
  const dof = useRef(), ca = useRef()
  const target = useMemo(() => new THREE.Vector3(), [])
  const caOff = useMemo(() => new THREE.Vector2(), [])
  useFrame(() => {
    const f = film.current, b = f.b
    if (dof.current) {
      // focus pull: front terrace → top terrace while the stone forms; terraces of the photo on the dolly
      _focus.set(0, .4, 1.3).lerp(new THREE.Vector3(.2, 3.1, -4.1), seg(f.p, .16, .3))
      _focus.lerp(f.look, b.exOpen)
      _focus.lerp(new THREE.Vector3(PHOTO.c[0], PHOTO.c[1] - .6, PHOTO.c[2] + 1.2), b.dolly)
      target.copy(_focus)
      dof.current.target = target
      dof.current.bokehScale = lerp(0, 1.4, b.solid) * (1 - b.photo) + b.dolly * 1.1
    }
    if (ca.current) { const k = SNAP ? 0 : Math.min(.0024, f.v * .006); caOff.set(k, k * .6) }
  })
  return (
    <EffectComposer multisampling={0} disableNormalPass>
      <DepthOfField ref={dof} focusRange={.06} bokehScale={0} resolutionScale={.5} />
      <Bloom mipmapBlur luminanceThreshold={1} luminanceSmoothing={.2} intensity={.85} radius={.7} />
      <ChromaticAberration ref={ca} offset={caOff} radialModulation modulationOffset={.15} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <Vignette offset={.28} darkness={.5} />
      <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={.35} />
    </EffectComposer>
  )
}

export default function Hero3D({ progress, labels, active = true, mobile = false, reduced = false }) {
  const film = useRef({ p: 0, v: 0, last: 0, t: 0, t0: null, look: new THREE.Vector3(), b: { intro: 0, morph: 0, solid: 0, dusk: 0, ex: 0, exOpen: 0, melt: 0, photo: 0, pix: 0, dolly: 0, cut: CUT_LO, scan: 0, solidCut: CUT_LO } })
  return (
    <Canvas frameloop={active ? 'always' : 'never'} dpr={mobile ? [1, 1.5] : [1, 1.5]} gl={{ antialias: mobile, alpha: true, powerPreference: 'high-performance', stencil: false }}
      camera={{ fov: 30, near: .1, far: 120, position: [-8, 6, 14] }} style={{ position: 'absolute', inset: 0 }}>
      <Director progress={progress} film={film} mobile={mobile} reduced={reduced} />
      <Suspense fallback={null}>
        <Lights film={film} mobile={mobile} />
        <World film={film} labels={labels} mobile={mobile} />
      </Suspense>
      {!mobile && <Post film={film} />}
    </Canvas>
  )
}
