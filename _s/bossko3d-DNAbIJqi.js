import{j as e,r}from"./kit-CvvvZa9h.js";import{C as v,u as l,V as u,b as c}from"./react-three-fiber.esm-Cq6zkgza.js";const f="varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",d=`
precision highp float;
varying vec2 vUv;
uniform float uT; uniform vec2 uP; uniform float uA;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
  return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
void main(){
  vec2 uv = vUv; uv.x *= uA;
  // circular brushing around a far centre: strokes are long along tangent
  vec2 c = vec2(uA * 0.5, -1.4);
  vec2 d = uv - c; float r = length(d); float a = atan(d.y, d.x);
  float s = n(vec2(r * 420.0, a * 3.0)) * 0.55 + n(vec2(r * 1400.0, a * 9.0)) * 0.3 + n(vec2(r * 90.0, a * 1.5)) * 0.25;
  // light band, perpendicular to brushing, steered by pointer
  float band = exp(-pow((a - (1.5708 + uP.x * 0.22 + sin(uT * 0.25) * 0.05)) * 9.0, 2.0));
  float band2 = exp(-pow((a - (1.5708 - 0.18 + uP.x * 0.15)) * 22.0, 2.0)) * 0.5;
  vec3 deep = vec3(0.36, 0.25, 0.11), mid = vec3(0.72, 0.56, 0.32), hi = vec3(1.0, 0.93, 0.76);
  float l = 0.35 + s * 0.35 + (band + band2) * (0.55 + s * 0.4) + uP.y * 0.06;
  vec3 col = mix(deep, mid, smoothstep(0.2, 0.7, l));
  col = mix(col, hi, smoothstep(0.75, 1.15, l));
  col *= 0.9 + 0.1 * smoothstep(0.0, 0.6, vUv.y);
  gl_FragColor = vec4(col, 1.0);
}`;function m({active:t}){const n=r.useRef(),{size:o}=l(),a=r.useMemo(()=>({uT:{value:0},uP:{value:new u},uA:{value:1}}),[]);return c((i,s)=>{a.uT.value+=s,a.uA.value=o.width/o.height,a.uP.value.lerp(i.pointer,.05)}),e.jsxs("mesh",{frustumCulled:!1,children:[e.jsx("planeGeometry",{args:[2,2]}),e.jsx("shaderMaterial",{ref:n,vertexShader:f,fragmentShader:d,uniforms:a})]})}function x({active:t}){return e.jsx(v,{frameloop:t?"always":"never",dpr:[1,1.5],gl:{antialias:!1},style:{pointerEvents:"none"},eventSource:typeof document<"u"?document.getElementById("root"):void 0,eventPrefix:"client",children:e.jsx(m,{})})}export{x as default};
