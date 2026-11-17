import React, { useEffect, useRef } from 'react'

/* A single volumetric cone of light that sweeps across the page with scroll.
   Raw WebGL fullscreen quad, composited with mix-blend-mode: multiply so ink stays black. */
const VS = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0., 1.); }`
const FS = `precision mediump float;
uniform vec2 uR; uniform float uT, uP, uMob;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
  return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
void main(){
  vec2 uv = gl_FragCoord.xy / uR.y;              // height-normalised
  float asp = uR.x / uR.y;
  float sw = sin(uP * 6.2831 * 1.25 - 1.5708);   // -1..1 swing
  vec2 src = vec2(asp * (0.5 - sw * 0.55), 1.25);
  float ang = sw * 0.62;                           // direction tilt
  vec2 dir = normalize(vec2(sin(ang), -cos(ang)));
  vec2 d = uv - src;
  float along = dot(d, dir);
  float across = abs(d.x * dir.y - d.y * dir.x);
  float hw = (0.11 + 0.03 * uMob) * along + 0.015;
  float cone = smoothstep(hw, hw * 0.25, across) * step(0., along);
  float fall = exp(-along * 0.55);
  float streak = 0.82 + 0.18 * n(vec2(across / max(along, .1) * 26., uT * 0.15));
  float dust = smoothstep(0.86, 1., n(uv * 70. + vec2(uT * 0.4, -uT * 0.7))) * 0.6;
  float I = cone * fall * streak * (0.55 + dust);
  vec3 warm = vec3(1.0, 0.70, 0.36);
  vec3 c = mix(vec3(1.), warm, clamp(I, 0., 0.85));
  gl_FragColor = vec4(c, 1.);
}`

export default function Beam() {
  const ref = useRef(null)
  useEffect(() => {
    const cv = ref.current
    const gl = cv.getContext('webgl', { antialias: false, alpha: false, premultipliedAlpha: false })
    if (!gl) return
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o }
    const pr = gl.createProgram()
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr); gl.useProgram(pr)
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    const uR = gl.getUniformLocation(pr, 'uR'), uT = gl.getUniformLocation(pr, 'uT'), uP = gl.getUniformLocation(pr, 'uP'), uM = gl.getUniformLocation(pr, 'uMob')
    let w = 0, hh = 0, p = 0, raf, t0 = performance.now()
    const size = () => {
      const dpr = Math.min(1.25, devicePixelRatio || 1)
      w = Math.round(innerWidth * dpr * 0.6); hh = Math.round(innerHeight * dpr * 0.6) // render at reduced res: it's soft light
      cv.width = w; cv.height = hh; gl.viewport(0, 0, w, hh)
    }
    size(); addEventListener('resize', size)
    const frame = now => {
      const max = document.documentElement.scrollHeight - innerHeight
      const target = max > 0 ? scrollY / max : 0
      p += (target - p) * 0.08
      gl.uniform2f(uR, w, hh); gl.uniform1f(uT, (now - t0) / 1000); gl.uniform1f(uP, p); gl.uniform1f(uM, innerWidth < 768 ? 1 : 0)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', size) }
  }, [])
  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[45] h-full w-full" style={{ mixBlendMode: 'multiply' }} />
}
