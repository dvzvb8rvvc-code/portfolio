import{j as o,r as a}from"./kit-DiXG1yIQ.js";import{C as n,u as l,V as i,a as f}from"./react-three-fiber.esm-DcCBOiGK.js";const m=`
precision highp float;
uniform float uTime; uniform vec2 uMouse; uniform vec2 uRes; uniform float uClick;
varying vec2 vUv;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.02;a*=.5;}return v;}
void main(){
  vec2 uv=vUv; vec2 asp=vec2(uRes.x/uRes.y,1.);
  vec2 d=(uv-uMouse)*asp; float r=length(d);
  float rip=sin(r*38.-uTime*5.)*exp(-r*5.)*.035*(1.+uClick*2.);
  uv+=normalize(d+1e-4)*rip;
  float t=uTime*.12;
  float n=fbm(uv*3.+vec2(t,-t*.6));
  float c=fbm(uv*6.+n*2.+vec2(-t*1.4,t));
  float caust=pow(smoothstep(.45,.95,c),2.)*1.4;
  vec3 deep=vec3(.02,.42,.62), mid=vec3(.15,.72,.88), light=vec3(.86,.97,1.);
  vec3 col=mix(deep,mid,smoothstep(.1,.9,uv.y+n*.35));
  col=mix(col,light,caust*.75);
  col+=vec3(.9,1.,1.)*smoothstep(.06,0.,abs(rip))*.0;
  col+=exp(-r*7.)*.12;
  gl_FragColor=vec4(col,1.);
}`,p="varying vec2 vUv; void main(){vUv=uv; gl_Position=vec4(position.xy,0.,1.);}";function h(){const s=a.useRef(),{size:t}=l(),e=a.useMemo(()=>({uTime:{value:0},uMouse:{value:new i(.5,.5)},uRes:{value:new i(1,1)},uClick:{value:0}}),[]);return f((u,r)=>{e.uTime.value+=r,e.uRes.value.set(t.width,t.height);const v=u.pointer.x*.5+.5,c=u.pointer.y*.5+.5;e.uMouse.value.x+=(v-e.uMouse.value.x)*.08,e.uMouse.value.y+=(c-e.uMouse.value.y)*.08,e.uClick.value*=.95}),o.jsxs("mesh",{onPointerDown:()=>e.uClick.value=1,children:[o.jsx("planeGeometry",{args:[2,2]}),o.jsx("shaderMaterial",{ref:s,uniforms:e,vertexShader:p,fragmentShader:m})]})}function g(){return o.jsx(n,{dpr:[1,1.4],gl:{antialias:!1},orthographic:!0,camera:{position:[0,0,1]},eventSource:typeof document<"u"?document.getElementById("root"):void 0,eventPrefix:"client",children:o.jsx(h,{})})}export{g as default};
