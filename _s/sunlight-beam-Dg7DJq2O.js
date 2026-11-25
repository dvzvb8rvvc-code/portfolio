import{r as v,j as E}from"./kit-DG8De6dg.js";const b="attribute vec2 p; void main(){ gl_Position = vec4(p, 0., 1.); }",F=`precision mediump float;
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
}`;function y(){const u=v.useRef(null);return v.useEffect(()=>{const c=u.current,e=c.getContext("webgl",{antialias:!1,alpha:!1,premultipliedAlpha:!1});if(!e)return;const m=(o,i)=>{const r=e.createShader(o);return e.shaderSource(r,i),e.compileShader(r),r},t=e.createProgram();e.attachShader(t,m(e.VERTEX_SHADER,b)),e.attachShader(t,m(e.FRAGMENT_SHADER,F)),e.linkProgram(t),e.useProgram(t);const p=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,p),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW);const d=e.getAttribLocation(t,"p");e.enableVertexAttribArray(d),e.vertexAttribPointer(d,2,e.FLOAT,!1,0,0);const g=e.getUniformLocation(t,"uR"),x=e.getUniformLocation(t,"uT"),A=e.getUniformLocation(t,"uP"),R=e.getUniformLocation(t,"uMob");let a=0,n=0,s=0,l,w=performance.now();const f=()=>{const o=Math.min(1.25,devicePixelRatio||1);a=Math.round(innerWidth*o*.6),n=Math.round(innerHeight*o*.6),c.width=a,c.height=n,e.viewport(0,0,a,n)};f(),addEventListener("resize",f);const h=o=>{const i=document.documentElement.scrollHeight-innerHeight,r=i>0?scrollY/i:0;s+=(r-s)*.08,e.uniform2f(g,a,n),e.uniform1f(x,(o-w)/1e3),e.uniform1f(A,s),e.uniform1f(R,innerWidth<768?1:0),e.drawArrays(e.TRIANGLES,0,3),l=requestAnimationFrame(h)};return l=requestAnimationFrame(h),()=>{cancelAnimationFrame(l),removeEventListener("resize",f)}},[]),E.jsx("canvas",{ref:u,"aria-hidden":"true",className:"pointer-events-none fixed inset-0 z-[45] h-full w-full",style:{mixBlendMode:"multiply"}})}export{y as default};
