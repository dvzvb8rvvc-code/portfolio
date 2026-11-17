import React, { useEffect, useRef } from 'react'

/* Stripe-like flowing mesh gradient (blue / cyan / green). Raw WebGL, paused offscreen. */
const VS = `attribute vec2 p; void main(){ gl_Position = vec4(p,0.,1.); }`
const FS = `precision mediump float;
uniform vec2 uR; uniform float uT;
vec3 c1=vec3(.114,.306,.847), c2=vec3(.024,.714,.831), c3=vec3(.204,.827,.6), c4=vec3(.576,.773,.992), c5=vec3(.04,.145,.25);
float h(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
float n(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f); return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y); }
void main(){
  vec2 uv=gl_FragCoord.xy/uR; float t=uT*.06;
  vec2 q=vec2(uv.x*1.6,uv.y);
  float a=n(q*1.4+vec2(t,-t*.7)), b=n(q*2.1+vec2(-t*.8,t)+a), c=n(q*.9+vec2(t*.5,t*.3)+b*.6);
  vec3 col=mix(c1,c2,smoothstep(.2,.8,a));
  col=mix(col,c3,smoothstep(.45,.85,b));
  col=mix(col,c4,smoothstep(.55,.95,c)*.7);
  col=mix(col,c5,smoothstep(.75,1.,1.-uv.y)*.0+smoothstep(.0,.35,uv.x*.0));
  gl_FragColor=vec4(col,1.);
}`

export default function Gradient({ className = '' }) {
  const ref = useRef(null)
  useEffect(() => {
    const cv = ref.current
    const gl = cv.getContext('webgl', { antialias: false })
    if (!gl) return
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o }
    const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr); gl.useProgram(pr)
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    const uR = gl.getUniformLocation(pr, 'uR'), uT = gl.getUniformLocation(pr, 'uT')
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf, vis = true, w = 0, hh = 0
    const size = () => { const r = cv.getBoundingClientRect(); w = Math.max(1, Math.round(r.width * 0.5)); hh = Math.max(1, Math.round(r.height * 0.5)); cv.width = w; cv.height = hh; gl.viewport(0, 0, w, hh) }
    size(); const ro = new ResizeObserver(size); ro.observe(cv)
    const io = new IntersectionObserver(([e]) => { vis = e.isIntersecting; if (vis && !raf) raf = requestAnimationFrame(frame) }); io.observe(cv)
    const t0 = performance.now()
    function frame(now) {
      raf = 0
      gl.uniform2f(uR, w, hh); gl.uniform1f(uT, reduce ? 20 : (now - t0) / 1000 + 20); gl.drawArrays(gl.TRIANGLES, 0, 3)
      if (vis && !reduce) raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect() }
  }, [])
  return <canvas ref={ref} aria-hidden="true" className={'block h-full w-full ' + className} />
}
