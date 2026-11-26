import{j as t,r as i}from"./kit-CrkWe-58.js";import{C as m,a as h,V as s,u as x}from"./react-three-fiber.esm-BvTp4Lth.js";const d=`
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`,y=`
precision highp float;
varying vec2 vUv;
uniform float uTime, uAspect, uScroll, uSwirl;
uniform vec2 uMouse;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1,0)), u.x), mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  mat2 r = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 5; i++){ v += a * noise(p); p = r * p * 2.03 + 3.1; a *= 0.5; }
  return v;
}
mat2 rot(float a){ float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }
void main(){
  vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0) * 2.2;
  vec2 m = (uMouse) * vec2(uAspect, 1.0) * 1.1;
  vec2 d = p - m;
  float r = length(d);
  p = m + rot(uSwirl * 2.4 * exp(-r * r * 2.2)) * d;
  float t = uTime * 0.035;
  p.y += uScroll * 1.4;
  vec2 q = vec2(fbm(p * 0.9 + vec2(t, -t)), fbm(p * 0.9 + vec2(5.2 - t, 1.3)));
  float n = fbm(p * 1.1 + q * 2.4 + t * 0.6);
  float band = sin((p.x * 1.3 + p.y * 2.1) + n * 7.0);
  float vein = pow(1.0 - abs(band), 26.0);
  float band2 = sin((p.x * -2.2 + p.y * 0.9) * 1.4 + fbm(p * 2.3 + q) * 9.0);
  float vein2 = pow(1.0 - abs(band2), 60.0);
  vec3 white = vec3(0.965, 0.953, 0.933);
  vec3 cloud = vec3(0.86, 0.835, 0.80);
  vec3 col = mix(white, cloud, smoothstep(0.35, 0.85, n) * 0.55);
  col = mix(col, vec3(0.42, 0.40, 0.37), vein * 0.55);
  col = mix(col, vec3(0.55, 0.60, 0.64), vein2 * 0.45);
  col += (hash(vUv * 900.0 + uTime) - 0.5) * 0.012;
  gl_FragColor = vec4(col, 1.0);
}
`;function g({progress:a}){const u=i.useRef(),{size:l}=h(),f=i.useMemo(()=>({uTime:{value:0},uAspect:{value:1},uScroll:{value:0},uSwirl:{value:0},uMouse:{value:new s(0,0)}}),[]),r=i.useRef(new s);return x((v,o)=>{o=Math.min(o,.05);const e=u.current.uniforms;e.uTime.value+=o,e.uAspect.value=l.width/l.height,e.uScroll.value=a?a.get():0;const n=v.pointer.x*.5,c=v.pointer.y*.5,p=Math.hypot(n-r.current.x,c-r.current.y)/Math.max(o,.001);r.current.set(n,c),e.uMouse.value.lerp(new s(n,c),.08),e.uSwirl.value+=(Math.min(1.2,.25+p*.5)-e.uSwirl.value)*.04}),t.jsxs("mesh",{frustumCulled:!1,children:[t.jsx("planeGeometry",{args:[2,2]}),t.jsx("shaderMaterial",{ref:u,vertexShader:d,fragmentShader:y,uniforms:f,depthWrite:!1})]})}function b({progress:a}){return t.jsx(m,{dpr:[1,1.5],gl:{antialias:!1,alpha:!1},style:{pointerEvents:"none"},eventSource:typeof document<"u"?document.getElementById("root"):void 0,eventPrefix:"client",children:t.jsx(g,{progress:a})})}export{b as default};
