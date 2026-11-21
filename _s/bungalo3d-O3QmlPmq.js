import{j as l,r as v}from"./kit-B9vXdzke.js";import{C as h,a as u,u as d,b as g,$ as P,D as y}from"./react-three-fiber.esm-BxSUdgq5.js";const b=(e,a=0,o=1)=>Math.min(o,Math.max(a,e)),i=(e,a,o)=>{const t=b((o-e)/(a-e));return t*t*(3-2*t)},w=e=>({dent:1-i(.2,.34,e),filler:i(.22,.34,e),primer:i(.4,.54,e),paint:i(.58,.72,e),clear:i(.76,.88,e)}),C=`
uniform float uDent;
varying vec3 vW; varying vec2 vP;
void main(){
  vec3 p = position;
  vP = p.xy;
  float bend = -0.16 * p.x * p.x - 0.05 * p.y * p.y;
  float crease = 0.035 * smoothstep(0.08, 0.0, abs(p.y - 0.28)) ;
  float d = exp(-(pow(p.x - 0.35, 2.0) * 7.0 + pow(p.y + 0.12, 2.0) * 11.0));
  float d2 = exp(-(pow(p.x - 0.62, 2.0) * 40.0 + pow(p.y + 0.02, 2.0) * 60.0));
  p.z += bend + crease - uDent * (0.17 * d + 0.05 * d2);
  vec4 w = modelMatrix * vec4(p, 1.0);
  vW = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}`,F=`
precision highp float;
uniform float uFiller, uPrimer, uPaint, uClear, uDent, uTime;
uniform vec3 uColor;
varying vec3 vW; varying vec2 vP;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
vec3 env(vec3 r, float rough){
  float w = mix(0.025, 0.4, rough);
  vec3 c = mix(vec3(0.82,0.86,0.92), vec3(0.98), smoothstep(-0.3, 0.8, r.y));
  c *= 0.55;
  float s1 = smoothstep(w, 0.0, abs(r.y - 0.42));
  float s2 = smoothstep(w * 1.4, 0.0, abs(r.y - 0.16)) * 0.6;
  float s3 = smoothstep(w * 2.0, 0.0, abs(r.x + 0.55)) * smoothstep(-0.2, 0.5, r.y) * 0.7;
  return c + vec3(1.0) * (s1 * 1.5 + s2 + s3) * mix(1.0, 0.35, rough);
}
void main(){
  vec3 N = normalize(cross(dFdx(vW), dFdy(vW)));
  vec3 V = normalize(cameraPosition - vW);
  if (dot(N, V) < 0.0) N = -N;
  vec3 R = reflect(-V, N);
  float fres = pow(1.0 - max(dot(N, V), 0.0), 5.0);
  vec3 L = normalize(vec3(0.4, 0.9, 0.6));
  float dif = 0.35 + 0.65 * max(dot(N, L), 0.0);

  // dist from dent centre (repair area)
  float area = length((vP - vec2(0.38, -0.1)) * vec2(1.0, 1.25));
  float edge = n(vP * 6.0) * 0.12;

  // stage 0: old paint with damage
  vec3 old = uColor * 0.86;
  float scratch = smoothstep(0.985, 1.0, sin((vP.x * 0.8 + vP.y) * 140.0 + n(vP * 9.0) * 6.0)) * smoothstep(0.55, 0.2, area);
  vec3 col = mix(old, vec3(0.75, 0.77, 0.78), scratch * 0.8);
  float rough = 0.35, spec = 0.5;

  // stage 1: bare metal ring + putty, sanded
  float rep = smoothstep(0.62 + edge, 0.5 + edge, area) * uFiller;
  float putty = smoothstep(0.38 + edge, 0.28 + edge, area);
  float sand = n(vec2(vP.x * 40.0 + vP.y * 12.0, vP.y * 3.0)) * 0.12;
  vec3 metal = vec3(0.68, 0.7, 0.72) + sand;
  vec3 putt = vec3(0.78, 0.76, 0.7) - sand * 0.6;
  col = mix(col, mix(metal, putt, putty), rep);
  rough = mix(rough, 0.75, rep); spec = mix(spec, 0.25, rep);

  // stage 2: primer wipe (left -> right spray pass)
  float fP = mix(-2.1, 2.1, uPrimer);
  float prim = 1.0 - smoothstep(fP - 0.15, fP + 0.15, vP.x + (n(vP * 4.0) - 0.5) * 0.3);
  vec3 primer = vec3(0.56, 0.6, 0.6) + n(vP * 30.0) * 0.03;
  col = mix(col, primer, prim);
  rough = mix(rough, 0.85, prim); spec = mix(spec, 0.12, prim);

  // stage 3: base coat with metallic flake
  float fC = mix(-2.1, 2.1, uPaint);
  float base = 1.0 - smoothstep(fC - 0.12, fC + 0.12, vP.x + (n(vP * 5.0 + 3.0) - 0.5) * 0.3);
  float flake = step(0.93, h(floor(vP * 260.0))) * (0.5 + 0.5 * sin(uTime * 2.0 + h(floor(vP * 260.0)) * 30.0));
  vec3 bc = uColor * dif + flake * 0.18 * max(dot(N, normalize(L + V)), 0.0);
  col = mix(col, uColor, base);
  rough = mix(rough, 0.55, base); spec = mix(spec, 0.3, base);

  // stage 4: clear coat
  rough = mix(rough, 0.02, uClear); spec = mix(spec, 1.0, uClear);

  vec3 lit = col * dif;
  lit = mix(lit, bc, base);
  float F = mix(0.04, 1.0, fres) * spec + 0.06 * spec;
  vec3 c = lit + env(R, rough) * F * mix(0.6, 1.25, uClear);
  // soft vignette at panel edges (rubber seal)
  float e = smoothstep(1.6, 1.5, abs(vP.x)) * smoothstep(0.95, 0.88, abs(vP.y));
  c = mix(vec3(0.08, 0.1, 0.14), c, e);
  gl_FragColor = vec4(pow(c, vec3(0.95)), 1.0);
}`;function M({progress:e,color:a}){const o=v.useRef(),t=v.useRef(),p=v.useMemo(()=>({uDent:{value:1},uFiller:{value:0},uPrimer:{value:0},uPaint:{value:0},uClear:{value:0},uTime:{value:0},uColor:{value:new u(a)}}),[]),{size:f}=d();return g(c=>{const m=e.get(),s=w(m),r=o.current.uniforms;r.uDent.value=s.dent,r.uFiller.value=s.filler,r.uPrimer.value=s.primer,r.uPaint.value=s.paint,r.uClear.value=s.clear,r.uTime.value=c.clock.elapsedTime,r.uColor.value.lerp(new u(a),.08);const n=f.width<768;t.current.rotation.y=P.lerp(-.5,.42,m)+c.pointer.x*.12,t.current.rotation.x=-.18+c.pointer.y*-.08+Math.sin(c.clock.elapsedTime*.4)*.02,t.current.position.set(n?0:.95,n?.55:0,0);const x=n?.62:1;t.current.scale.setScalar(x)}),l.jsxs("mesh",{ref:t,children:[l.jsx("planeGeometry",{args:[3.2,1.9,200,120]}),l.jsx("shaderMaterial",{ref:o,vertexShader:C,fragmentShader:F,uniforms:p,side:y,extensions:{derivatives:!0}})]})}function T({progress:e,active:a,color:o="#d7261e"}){return l.jsx(h,{dpr:[1,1.6],frameloop:a?"always":"never",camera:{position:[0,0,4.4],fov:38},gl:{antialias:!0,alpha:!0},children:l.jsx(M,{progress:e,color:o})})}export{w as STAGE,T as default};
