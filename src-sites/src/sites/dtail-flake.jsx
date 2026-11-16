import React, { useEffect, useRef } from 'react'

/* raw WebGL metallic-flake shader with a built-in magnifier lens.
   lens = ref { x, y, on } in CSS px relative to the canvas */
const VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'
const FS = `precision highp float;
uniform vec2 uRes; uniform vec2 uMouse; uniform float uT; uniform vec3 uLens; uniform float uScale;
vec2 h2(vec2 p){ p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))); return fract(sin(p)*43758.5453); }
void main(){
  vec2 px = gl_FragCoord.xy;
  float d = length(px - uLens.xy);
  float inL = uLens.z > 0. ? 1. - smoothstep(uLens.z - 1.5, uLens.z, d) : 1.;
  vec2 p = px;
  if (uLens.z > 0. && d < uLens.z) p = uLens.xy + (px - uLens.xy) / 2.2;
  vec2 q = (p - .5*uRes) / uRes.y;
  vec2 uv = q * uScale;
  vec2 i = floor(uv), f = fract(uv); float md = 8.; vec2 id = vec2(0.);
  for (int y=-1; y<=1; y++) for (int x=-1; x<=1; x++) {
    vec2 g = vec2(float(x), float(y)); vec2 o = h2(i+g); o = .5 + .45*sin(uT*.15 + 6.2831*o);
    vec2 r = g + o - f; float dd = dot(r,r); if (dd < md) { md = dd; id = i + g; }
  }
  vec2 rnd = h2(id*1.7 + 3.1);
  vec3 n = normalize(vec3((rnd - .5)*1.5, 1.));
  vec3 pos = vec3(q, 0.);
  vec3 L = normalize(vec3((uMouse - .5*uRes)/uRes.y, .8) - pos);
  vec3 H = normalize(L + vec3(0.,0.,1.));
  float spec = max(dot(n, H), 0.);
  float sharp = mix(10., 180., inL);
  float sp = pow(spec, sharp) * mix(.45, 2.2, inL);
  float glow = pow(max(H.z, 0.), 6.);
  vec3 base = vec3(.16,.08,.015) + vec3(.8,.45,.1)*glow*.9;
  vec3 fc = mix(vec3(1.,.72,.32), vec3(.82,.87,.93), step(.62, rnd.x));
  float edge = smoothstep(.0, .08, md);
  vec3 col = base + fc * sp * step(.12, rnd.y) * mix(.6, 1., edge);
  col += vec3(1.,.8,.5) * pow(max(H.z,0.), 120.) * .35; // clearcoat hot spot
  if (uLens.z > 0.) {
    col *= mix(.72, 1., inL);
    col += vec3(1.,.72,.35) * (1. - smoothstep(0., 2.5, abs(d - uLens.z))) * .9;
  }
  gl_FragColor = vec4(col, 1.);
}`

export default function Flakes({ lens, active = true, scale = 26, className = '' }) {
  const ref = useRef(null)
  const act = useRef(active)
  act.current = active
  const scR = useRef(scale)
  scR.current = scale
  useEffect(() => {
    const c = ref.current
    const gl = c.getContext('webgl', { antialias: false, premultipliedAlpha: false })
    if (!gl) return
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o }
    const pr = gl.createProgram()
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr); gl.useProgram(pr)
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    const u = n => gl.getUniformLocation(pr, n)
    const uRes = u('uRes'), uMouse = u('uMouse'), uT = u('uT'), uLens = u('uLens'), uScale = u('uScale')
    let raf, w = 0, h = 0, dpr = 1
    const m = { x: 0, y: 0, tx: 0, ty: 0 }
    const resize = () => {
      dpr = Math.min(devicePixelRatio || 1, 1.5)
      w = c.clientWidth; h = c.clientHeight
      c.width = Math.max(1, w * dpr | 0); c.height = Math.max(1, h * dpr | 0); gl.viewport(0, 0, c.width, c.height)
    }
    resize()
    const ro = new ResizeObserver(resize); ro.observe(c)
    const t0 = performance.now()
    const loop = () => {
      raf = requestAnimationFrame(loop)
      if (!act.current) return
      const t = (performance.now() - t0) / 1000
      const L = lens?.current
      if (L && L.on) { m.tx = L.x; m.ty = L.y } else { m.tx = w * (.5 + .3 * Math.cos(t * .5)); m.ty = h * (.5 + .25 * Math.sin(t * .7)) }
      m.x += (m.tx - m.x) * .08; m.y += (m.ty - m.y) * .08
      gl.uniform2f(uRes, c.width, c.height)
      gl.uniform2f(uMouse, m.x * dpr, (h - m.y) * dpr)
      gl.uniform1f(uT, t)
      gl.uniform1f(uScale, scR.current)
      gl.uniform3f(uLens, L && L.on ? L.x * dpr : 0, L && L.on ? (h - L.y) * dpr : 0, L && L.on ? L.r * dpr : 0)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }
    loop()
    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [])
  return <canvas ref={ref} className={'block h-full w-full ' + className} />
}
