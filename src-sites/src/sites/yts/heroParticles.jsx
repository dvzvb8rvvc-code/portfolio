import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'

/* One GPU particle system, four states:
   swirl (load) → his ink sketch (image 30, dark pixels) → the building's surfaces → photo-cloud of render 5
   (colour + depth sampled in the vertex shader from the same textures the solid DepthPhoto uses).
   All motion is in the shader; JS only writes a handful of uniforms per frame. */

const vert = /* glsl */`
attribute vec3 aSketch; attribute vec3 aBuild; attribute vec2 aUv; attribute vec3 aCol; attribute vec4 aRnd;
uniform float uTime, uIntro, uMorph, uCut, uScan, uPhoto, uPix, uSize, uScale, uDusk, uDepthAmt;
uniform vec3 uSwirlC, uPhotoC, uInk, uGold; uniform vec2 uPhotoWH;
uniform sampler2D uPhotoMap, uDepthMap;
varying vec3 vCol; varying float vA;
float sm(float x){ x = clamp(x, 0., 1.); return x*x*(3.-2.*x); }
void main(){
  float rx = aRnd.x, ry = aRnd.y, rz = aRnd.z, rw = aRnd.w;
  // 1 · swirl → sketch
  float ki = sm(uIntro * 1.8 - rw * .8);
  float ang = rx * 6.2831 + uTime * (.22 + ry * .35) + (1. - ki) * 2.;
  float rad = 1.8 + ry * ry * 9.;
  vec3 swirl = uSwirlC + vec3(cos(ang) * rad, (rz - .5) * 9. * (.4 + ry) + sin(uTime * .6 + rx * 20.) * .5, sin(ang) * rad * .55);
  vec3 p = mix(swirl, aSketch, ki);
  p += vec3(sin(uTime * 1.3 + rz * 30.), cos(uTime * 1.1 + rx * 30.), 0.) * .012 * (1. - uMorph); // ink breathing
  // 2 · sketch → building (bottom first), flying on an arc
  float hy = (aBuild.y + 4.) / 10.;
  float km = sm(uMorph * 1.7 - rw * .4 - hy * .3);
  float arc = sin(km * 3.14159);
  p = mix(p, aBuild, km) + vec3(sin(rx * 50. + uTime * .8) * .9, .5 + ry * 1.6, cos(rz * 50. + uTime * .8) * .9) * arc;
  // 3 · building → photo cloud
  vec2 uv = aUv;
  float d = texture2D(uDepthMap, uv).r;
  vec3 pp = uPhotoC + vec3((uv.x - .5) * uPhotoWH.x, (uv.y - .5) * uPhotoWH.y, d * uDepthAmt);
  float kp = sm(uPhoto * 1.6 - rw * .35 - (1. - uv.y) * .25);
  float arc2 = sin(kp * 3.14159);
  p = mix(p, pp, kp) + vec3(sin(rx * 31. + uTime) * .7, arc2 * (.4 + ry * 1.2), (1.2 + rz * 2.5)) * arc2;

  // colour
  vec3 sk = aCol;
  float gold = step(.935, rw);
  sk = mix(sk, uGold, gold * .85);
  vec3 bc = mix(mix(uInk, vec3(.32, .26, .2), ry * .6), uGold * 1.6, uDusk * .8 + gold * .6);
  vec3 col = mix(sk, bc, km);
  col = mix(col, uGold * 1.8, arc * .7);
  vec3 ph = texture2D(uPhotoMap, uv).rgb;
  col = mix(col, ph * 1.08, kp);
  col = mix(col, uGold * 2.2, arc2 * .6);

  // the scan: particles below the cut have become stone; a hot band rides the cut
  float inB = km * (1. - kp);
  float below = smoothstep(uCut + .03, uCut - .1, aBuild.y);
  float band = smoothstep(.45, 0., abs(aBuild.y - uCut)) * uScan * inB;
  col = mix(col, uGold * 3.2, band);
  float a = mix(.5, .7, km) * (1. - below * inB);
  a = mix(a, 1., kp);
  a *= 1. - sm((uPix - rw * .55) / .45);
  a *= mix(.25, 1., ki); // swirl is faint, condenses into ink

  vec4 mv = modelViewMatrix * vec4(p, 1.);
  gl_Position = projectionMatrix * mv;
  float s = uSize * (1. + band * 1.4 + arc * .6 + arc2 * .8) * mix(1., 1.55, kp) * mix(1., 1.25, gold);
  gl_PointSize = max(1., s * uScale / -mv.z);
  vCol = col; vA = a;
}`

const frag = /* glsl */`
varying vec3 vCol; varying float vA;
void main(){
  vec2 c = gl_PointCoord - .5; float r = dot(c, c);
  if (r > .25 || vA < .004) discard;
  gl_FragColor = vec4(vCol, vA * smoothstep(.25, .08, r));
  #include <colorspace_fragment>
}`

/* sample dark ink pixels of the sketch (rejection by darkness), skipping the dedication text */
function sampleSketch(image, N, rnd) {
  const W = 360, H = Math.round(W * image.height / image.width)
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H
  const cx = cv.getContext('2d', { willReadFrequently: true }); cx.drawImage(image, 0, 0, W, H)
  const px = cx.getImageData(0, 0, W, H).data
  const wts = new Float32Array(W * H); let sum = 0
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const u = x / W, v = y / H
    if (u > .5 && v > .62 && v < .9) continue // handwritten dedication
    if (v > .93) continue
    const i = (y * W + x) * 4, l = (px[i] * .299 + px[i + 1] * .587 + px[i + 2] * .114) / 255
    const w = Math.pow(Math.max(0, 1 - l - .06), 2.2)
    wts[y * W + x] = w; sum += w
  }
  const cdf = new Float32Array(W * H); let acc = 0
  for (let i = 0; i < W * H; i++) { acc += wts[i] / sum; cdf[i] = acc }
  const pos = new Float32Array(N * 2), col = new Float32Array(N * 3), c = new THREE.Color()
  for (let n = 0; n < N; n++) {
    const r = rnd(); let lo = 0, hi = W * H - 1
    while (lo < hi) { const m = (lo + hi) >> 1; if (cdf[m] < r) lo = m + 1; else hi = m }
    const x = lo % W, y = (lo / W) | 0, i = lo * 4
    pos[n * 2] = (x + rnd()) / W - .5; pos[n * 2 + 1] = .5 - (y + rnd()) / H
    c.setRGB(px[i] / 255, px[i + 1] / 255, px[i + 2] / 255, THREE.SRGBColorSpace)
    // pull toward the ink so washes read as tinted ink
    c.lerp(new THREE.Color(0x151412).convertSRGBToLinear(), .55)
    col.set([c.r, c.g, c.b], n * 3)
  }
  return { pos, col, aspect: image.width / image.height }
}

function rng(seed) { let s = seed; return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646 }

export function buildParticleGeometry({ N, build, sketchImage, pose, sketchH, photoAspect }) {
  const rnd = rng(5)
  const { C0, T0, L0 } = pose
  const F = L0.clone().sub(C0).normalize(), R = new THREE.Vector3().crossVectors(F, new THREE.Vector3(0, 1, 0)).normalize(), U = new THREE.Vector3().crossVectors(R, F)
  // order building points by screen position seen from the opening camera
  const bs = new Float32Array(N), bx = new Float32Array(N), tmp = new THREE.Vector3()
  for (let i = 0; i < N; i++) {
    tmp.set(build[i * 3], build[i * 3 + 1], build[i * 3 + 2]).sub(C0)
    const z = tmp.dot(F); bs[i] = tmp.dot(U) / z; bx[i] = tmp.dot(R) / z
  }
  const order = Array.from({ length: N }, (_, i) => i).sort((a, b) => bs[a] - bs[b])
  const sk = sampleSketch(sketchImage, N, rnd)
  const sOrd = Array.from({ length: N }, (_, i) => i).sort((a, b) => sk.pos[a * 2 + 1] - sk.pos[b * 2 + 1])
  // jittered pixel grid over the photo
  const cols = Math.round(Math.sqrt(N / photoAspect)), rows = Math.ceil(N / cols)
  const uvs = new Float32Array(N * 2)
  for (let n = 0; n < N; n++) { const cI = n % cols, rI = (n / cols) | 0; uvs[n * 2] = (cI + .5 + (rnd() - .5) * .6) / cols; uvs[n * 2 + 1] = Math.min(.999, (rI + .5 + (rnd() - .5) * .6) / rows) }
  const pOrd = Array.from({ length: N }, (_, i) => i).sort((a, b) => uvs[a * 2 + 1] - uvs[b * 2 + 1])

  const aSketch = new Float32Array(N * 3), aUv = new Float32Array(N * 2), aCol = new Float32Array(N * 3), aRnd = new Float32Array(N * 4)
  const BAND = 384, sw = sketchH * sk.aspect
  for (let s0 = 0; s0 < N; s0 += BAND) {
    const e = Math.min(N, s0 + BAND)
    const bb = order.slice(s0, e).sort((a, b) => bx[a] - bx[b])
    const ss = sOrd.slice(s0, e).sort((a, b) => sk.pos[a * 2] - sk.pos[b * 2])
    const pp = pOrd.slice(s0, e).sort((a, b) => uvs[a * 2] - uvs[b * 2])
    for (let k = 0; k < bb.length; k++) {
      const i = bb[k], si = ss[k], pi = pp[k]
      const sx = sk.pos[si * 2] * sw, sy = sk.pos[si * 2 + 1] * sketchH, dz = (rnd() - .5) * .06
      aSketch[i * 3] = T0.x + R.x * sx + U.x * sy - F.x * dz
      aSketch[i * 3 + 1] = T0.y + R.y * sx + U.y * sy - F.y * dz
      aSketch[i * 3 + 2] = T0.z + R.z * sx + U.z * sy - F.z * dz
      aCol.set([sk.col[si * 3], sk.col[si * 3 + 1], sk.col[si * 3 + 2]], i * 3)
      aUv.set([uvs[pi * 2], uvs[pi * 2 + 1]], i * 2)
    }
  }
  for (let i = 0; i < N * 4; i++) aRnd[i] = rnd()
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(build, 3))
  g.setAttribute('aBuild', new THREE.BufferAttribute(build, 3))
  g.setAttribute('aSketch', new THREE.BufferAttribute(aSketch, 3))
  g.setAttribute('aUv', new THREE.BufferAttribute(aUv, 2))
  g.setAttribute('aCol', new THREE.BufferAttribute(aCol, 3))
  g.setAttribute('aRnd', new THREE.BufferAttribute(aRnd, 4))
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 1, -2), 60)
  return g
}

export function Particles({ geometry, film, photoMap, depthMap, photo, swirlC, size = .034 }) {
  const { size: vp, camera, gl } = useThree()
  const mat = useRef()
  const uniforms = useMemo(() => ({
    uTime: { value: 0 }, uIntro: { value: 0 }, uMorph: { value: 0 }, uCut: { value: -10 }, uScan: { value: 0 }, uPhoto: { value: 0 }, uPix: { value: 0 },
    uSize: { value: size }, uScale: { value: 400 }, uDusk: { value: 0 }, uDepthAmt: { value: photo.depth },
    uSwirlC: { value: swirlC.clone() }, uPhotoC: { value: new THREE.Vector3(...photo.c) }, uPhotoWH: { value: new THREE.Vector2(photo.w, photo.w * photo.aspect) },
    uInk: { value: new THREE.Color('#151412').convertSRGBToLinear() }, uGold: { value: new THREE.Color('#c99a4e').convertSRGBToLinear() },
    uPhotoMap: { value: photoMap }, uDepthMap: { value: depthMap },
  }), [])
  useFrame(() => {
    const u = uniforms, b = film.current.b
    u.uTime.value = film.current.t
    u.uIntro.value = b.intro; u.uMorph.value = b.morph; u.uCut.value = b.cut; u.uScan.value = b.scan
    u.uPhoto.value = b.photo; u.uPix.value = b.pix; u.uDusk.value = b.dusk
    u.uScale.value = vp.height * gl.getPixelRatio() / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2))
  })
  return (
    <points geometry={geometry} frustumCulled={false} renderOrder={2}>
      <shaderMaterial ref={mat} uniforms={uniforms} vertexShader={vert} fragmentShader={frag} transparent depthWrite={false} />
    </points>
  )
}
