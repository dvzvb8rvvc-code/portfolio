import{j as o,r as c}from"./kit-B9vXdzke.js";import{C as D,u as z,x as b,aH as A,t as E,P as T,V as g,b as C,$ as p}from"./react-three-fiber.esm-BxSUdgq5.js";import{D as q}from"./depth3d-H7tELiQ9.js";import{S as F}from"./Sparkles-BWKApMkk.js";import"./extends-CF3RwP-h.js";import"./constants-CIMWHpzV.js";const V=(e,t)=>`/portfolio/yts/img/${e}${t?"-s":""}.webp`,$=e=>`/portfolio/yts/depth/${e}.webp`;function W({progress:e}){const t=c.useRef(0);return C(({camera:r,pointer:i},u)=>{u=Math.min(u,.05),t.current=p.damp(t.current,e.get(),5,u);const n=t.current;r.position.x=p.damp(r.position.x,i.x*.32,2.5,u),r.position.y=p.damp(r.position.y,.1+i.y*.16-n*.35,2.5,u),r.position.z=4.3-n*1.5,r.lookAt(0,-n*.25,0)}),null}function _(e,t,r){const{size:i}=z(),u=2*t*Math.tan(r*Math.PI/360);return Math.max(u*(i.width/i.height),u/e)*1.2}function G({reveal:e,mob:t}){const r=_(.8938888888888888,4.3,45);return o.jsx(q,{id:145,width:r,depth:1.35,segments:t?150:260,progress:e,small:t,edgeFade:.03})}function te({progress:e,active:t,mob:r}){const i=c.useRef(0);return c.useEffect(()=>{const u=setTimeout(()=>{i.current=1},250);return()=>clearTimeout(u)},[]),o.jsxs(D,{frameloop:t?"always":"never",dpr:[1,r?1.3:1.5],camera:{position:[0,.1,4.3],fov:45},gl:{antialias:!0},children:[o.jsx("color",{attach:"background",args:["#151412"]}),o.jsx(c.Suspense,{fallback:null,children:o.jsx(G,{reveal:i,mob:r})}),o.jsx(W,{progress:e}),o.jsx(F,{count:r?30:70,scale:[6,3,2],position:[0,.3,1.2],size:2.2,speed:.2,opacity:.5,color:"#ffe2b8"})]})}const L=`
uniform sampler2D uDepth; uniform vec2 uRep; uniform vec2 uOff; uniform float uAmount;
varying vec2 vUv; varying float vD;
void main(){
  vUv = uv;
  float d = texture2D(uDepth, uOff + uv * uRep).r;
  vD = d;
  vec3 p = position; p.z += d * uAmount;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`,B=`
uniform sampler2D uMap; uniform sampler2D uDepth; uniform vec2 uRep; uniform vec2 uOff; uniform vec2 uSize; uniform vec2 uPtr; uniform float uSweep; uniform float uHover; uniform float uIn;
varying vec2 vUv; varying float vD;
void main(){
  vec2 uv = uOff + vUv * uRep;
  float d = texture2D(uDepth, uv).r;
  uv += (d - 0.45) * uPtr * vec2(-0.03, -0.022);
  vec3 c = texture2D(uMap, uv).rgb;
  float s = (vUv.x * 0.9 + (1.0 - vUv.y) * 0.55) - uSweep;
  float band = exp(-s * s * 55.0);
  c += vec3(1.0, 0.84, 0.6) * band * (0.08 + d * d * 0.7);
  c *= 0.8 + 0.2 * uHover + d * 0.06;
  vec2 p = (vUv - 0.5) * uSize; vec2 q = abs(p) - uSize * 0.5 + 8.0;
  float r = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - 8.0;
  float a = (1.0 - smoothstep(-1.0, 0.5, r)) * uIn;
  gl_FragColor = vec4(c, a);
  #include <colorspace_fragment>
}`;function J({id:e,i:t,rects:r,ptr:i,mob:u}){const[n,f]=b(A,[V(e,u),$(e)]);n.colorSpace=E,n.anisotropy=4;const m=n.image?n.image.height/n.image.width:.8,w=c.useRef(),v=c.useRef(-1-t*.6),M=c.useRef(0),H=c.useMemo(()=>new T(1,1,u?90:160,u?110:200),[u]),j=c.useMemo(()=>({uMap:{value:n},uDepth:{value:f},uRep:{value:new g(1,1)},uOff:{value:new g},uAmount:{value:60},uSize:{value:new g(100,100)},uPtr:{value:new g},uSweep:{value:-1},uHover:{value:0},uIn:{value:0}}),[n,f]);return C((P,R)=>{const d=Math.min(R,.05),s=r.current[t],h=w.current;if(!s||!h)return;const{width:U,height:k}=P.size;h.position.set(s.x+s.w/2-U/2,-(s.y+s.h/2-k/2),0),h.scale.set(s.w,s.h,1);const a=j,y=s.h/s.w,x=.9;m>y?a.uRep.value.set(x,y/m*x):a.uRep.value.set(m/y*x,x),a.uOff.value.set((1-a.uRep.value.x)/2,(1-a.uRep.value.y)/2),a.uSize.value.set(s.w,s.h),a.uAmount.value=Math.min(s.w,s.h)*.16;const l=i.current[t]||{x:0,y:0,h:0},S=P.clock.elapsedTime,I=l.h?l.x:Math.sin(S*.6+t*1.7)*.45,O=l.h?l.y:Math.cos(S*.5+t)*.3;a.uPtr.value.x=p.damp(a.uPtr.value.x,I,5,d),a.uPtr.value.y=p.damp(a.uPtr.value.y,O,5,d),h.rotation.y=a.uPtr.value.x*.26,h.rotation.x=-a.uPtr.value.y*.2,a.uHover.value=p.damp(a.uHover.value,l.h?1:0,5,d),a.uIn.value=Math.min(1,a.uIn.value+Math.min(R,.5)*1.4),l.h&&!M.current&&v.current>1.4&&(v.current=-.6),M.current=l.h,v.current+=d*(l.h?.9:.45),v.current>3.2&&(v.current=-.6),a.uSweep.value=v.current}),o.jsx("mesh",{ref:w,geometry:H,children:o.jsx("shaderMaterial",{uniforms:j,vertexShader:L,fragmentShader:B,transparent:!0,depthWrite:!1})})}function K(){const{camera:e,size:t}=z();return c.useEffect(()=>{e.fov=30,e.near=10,e.far=2e4,e.position.set(0,0,t.height/2/Math.tan(15*Math.PI/180)),e.lookAt(0,0,0),e.updateProjectionMatrix()},[t,e]),null}function re({ids:e,rects:t,ptr:r,active:i,mob:u,bg:n="#1b2a33"}){return o.jsxs(D,{frameloop:"always",dpr:[1,u?1.5:1.6],gl:{antialias:!0},camera:{fov:30,near:10,far:2e4,position:[0,0,1e3]},style:{position:"absolute",inset:0,zIndex:0,pointerEvents:"none"},children:[o.jsx("color",{attach:"background",args:[n]}),o.jsx(K,{}),o.jsx(c.Suspense,{fallback:null,children:e.map((f,m)=>o.jsx(J,{id:f,i:m,rects:t,ptr:r,mob:u},f))})]})}export{re as CardsCanvas,te as OpeningCanvas};
