import{j as A,r as d}from"./kit-CvvvZa9h.js";import{C as E,u as C,b as I,$ as c,S,k as F,af as T,aQ as _,aR as z}from"./react-three-fiber.esm-Cq6zkgza.js";import{i as O}from"./yts-C9fVVP5m.js";import"./preload-helper-BDQy5SUP.js";import"./index-D3EN0v31.js";const P=11,q=4.7,k=.24,G={all:3,render:3,sketch:2,build:2},N=`
uniform float uBend;
varying vec2 vUv;
void main(){
  vUv = uv;
  vec3 p = position;
  float s = sin(uv.x * 3.14159);
  p.z += s * uBend * 0.9;
  p.y += sin(uv.x * 3.14159 + 1.2) * uBend * 0.12;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`,Q=`
uniform sampler2D map;
uniform float uLoaded, uAlpha, uSketch, uHover, uDim, uImgA, uPlaneA, uBend;
varying vec2 vUv;
float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
void main(){
  vec2 uv = vUv;
  if (uImgA > uPlaneA) uv.x = (uv.x - .5) * uPlaneA / uImgA + .5;
  else uv.y = (uv.y - .5) * uImgA / uPlaneA + .5;
  uv = (uv - .5) * (1. - .07 * uHover) + .5;
  vec2 off = vec2(uBend * .012, 0.);
  vec3 col = vec3(texture2D(map, uv + off).r, texture2D(map, uv).g, texture2D(map, uv - off).b);
  float lum = dot(col, vec3(.299,.587,.114));
  col = mix(col, vec3(lum), .22 * (1. - uHover) * (1. - uSketch));
  // sketches: ink on warm paper, with tooth
  vec3 paper = vec3(.925,.906,.875);
  float g = hash(floor(gl_FragCoord.xy));
  vec3 ink = mix(col, vec3(smoothstep(.15,.95,lum)) * vec3(.98,.96,.93), .35);
  col = mix(col, ink * paper - g * .035, uSketch);
  vec3 base = mix(vec3(.12,.115,.105), paper, uSketch);
  col = mix(base, col, uLoaded);
  col = mix(col, vec3(.082,.078,.07), uDim);
  // hairline frame on hover
  vec2 e = min(vUv, 1. - vUv);
  float edge = step(min(e.x * uPlaneA, e.y), .006) * uHover;
  col = mix(col, vec3(.76,.63,.37), edge);
  gl_FragColor = vec4(col, uAlpha);
}`,V=(()=>{const t=new F(new Uint8Array([30,29,27,255]),1,1);return t.needsUpdate=!0,t})();let j=0;const L=[];function W(){for(;j<4&&L.length;){const t=L.shift();if(t.cancelled)continue;j++;const a=new Image;a.decoding="async",a.src=O(t.id,!0),a.decode().then(()=>{if(t.cancelled)return;const o=Math.min(1,512/Math.max(a.naturalWidth,a.naturalHeight)),n=document.createElement("canvas");n.width=Math.max(2,Math.round(a.naturalWidth*o)),n.height=Math.max(2,Math.round(a.naturalHeight*o)),n.getContext("2d").drawImage(a,0,0,n.width,n.height);const r=new T(n);r.colorSpace=_,r.anisotropy=4,r.minFilter=z,t.done(r,a.naturalWidth/a.naturalHeight)}).catch(()=>{}).finally(()=>{j--,W()})}}function Y(t,a){const o={id:t,done:a,cancelled:!1};return L.push(o),W(),o}function $(t,a){const o=G[a]||3,n=t.filter(s=>a==="all"||s.kind===a),r=(q-k*(o-1))/o,h=r*1.46,i=(h+k)/P,u=Math.ceil(n.length/o),p=u*i,f=new Map;return n.forEach((s,x)=>{const l=Math.floor(x/o),v=x%o;f.set(s.id,{th:(l-(u-1)/2)*i,y:(o-1)/2*(r+k)-v*(r+k)-.3,w:h,h:r,order:x})}),{pos:f,ext:p,step:i,cellW:h,rowH:r}}function J({it:t,L:a,state:o,onHover:n,onOpen:r,dragState:h}){const i=d.useRef(),u=d.useMemo(()=>new S({vertexShader:N,fragmentShader:Q,transparent:!0,depthWrite:!1,uniforms:{map:{value:V},uLoaded:{value:0},uAlpha:{value:0},uSketch:{value:t.kind==="sketch"?1:0},uHover:{value:0},uDim:{value:0},uImgA:{value:1.5},uPlaneA:{value:1.46},uBend:{value:0}}}),[t]),p=d.useRef({th:(Math.random()-.5)*4,y:(Math.random()-.5)*8,w:2,h:1.4,a:0,hov:0,lambda:3+Math.random()*3}),f=d.useRef(null),s=d.useRef(null),x=d.useRef(!1);return d.useEffect(()=>()=>{f.current&&(f.current.cancelled=!0),s.current&&s.current.dispose(),u.dispose()},[u]),I((l,v)=>{const g=i.current,e=p.current,m=u.uniforms,y=a.pos.get(t.id),w=y||{th:e.th,y:e.y*1,w:e.w*.7,h:e.h*.7},M=Math.min(v,.05);e.th=c.damp(e.th,w.th,e.lambda,M),e.y=c.damp(e.y,y?w.y:e.y>0?6:-6,e.lambda,M),e.w=c.damp(e.w,w.w,e.lambda,M),e.h=c.damp(e.h,w.h,e.lambda,M),e.a=c.damp(e.a,y?1:0,y?e.lambda*.8:8,M),e.hov=c.damp(e.hov,x.current&&!h.current.moved?1:0,10,M);const b=e.th-o.current.rot;g.position.set(Math.sin(b)*P,e.y,-Math.cos(b)*P),g.rotation.set(0,-b,0);const H=1+e.hov*.045;g.scale.set(e.w*H,e.h*H,1),g.visible=e.a>.01&&Math.abs(b)<2.2,m.uAlpha.value=e.a,m.uHover.value=e.hov,m.uBend.value=o.current.bend,m.uPlaneA.value=e.w/e.h,m.uDim.value=c.smoothstep(Math.abs(b),.55,1.6)*.85,!f.current&&y&&Math.abs(b)<1.25&&(f.current=Y(t.id,(R,B)=>{var U,D;s.current=R,m.map.value=R,m.uImgA.value=B,(D=(U=o.current).invalidate)==null||D.call(U)})),s.current&&(m.uLoaded.value=c.damp(m.uLoaded.value,1,4,M))}),A.jsx("mesh",{ref:i,material:u,onPointerOver:l=>{l.stopPropagation(),x.current=!0,document.body.style.cursor="pointer",n(t)},onPointerOut:()=>{x.current=!1,document.body.style.cursor="",n(null)},onClick:l=>{l.stopPropagation(),h.current.moved||r(t)},children:A.jsx("planeGeometry",{args:[1,1,16,1]})})}function K({items:t,filter:a,progress:o,dragState:n,onHover:r,onOpen:h}){const i=d.useMemo(()=>$(t,a),[t,a]),u=d.useRef({rot:0,bend:0,last:0}),{camera:p,invalidate:f}=C();return u.current.invalidate=f,d.useEffect(()=>{n.current.offset=0,n.current.target=0},[a]),I((s,x)=>{const l=Math.min(x,.05),v=n.current;v.offset=c.damp(v.offset,v.target,5,l);const g=Math.max(0,i.ext-1.1),e=g/2+.6;v.target=c.clamp(v.target,-e-(o.get()-.5)*g,e-(o.get()-.5)*g);const m=(o.get()-.5)*g+v.offset,y=u.current.rot;u.current.rot=c.damp(y,m,6,l);const w=(u.current.rot-y)/Math.max(l,.001);u.current.bend=c.damp(u.current.bend,c.clamp(w*.9,-1.2,1.2),8,l),p.position.x=c.damp(p.position.x,s.pointer.x*.5,3,l),p.position.y=c.damp(p.position.y,s.pointer.y*.3,3,l),p.lookAt(0,0,-P)}),t.map(s=>A.jsx(J,{it:s,L:i,state:u,onHover:r,onOpen:h,dragState:n},s.id))}function X(){const{camera:t,size:a}=C();return d.useEffect(()=>{const o=a.width/a.height;t.fov=o<1.2?58:44,t.position.z=o<1.2?3:5,t.updateProjectionMatrix()},[a,t]),null}function ne({items:t,filter:a,progress:o,dragState:n,onHover:r,onOpen:h,active:i}){return A.jsxs(E,{frameloop:i?"always":"never",dpr:[1,1.6],gl:{antialias:!0,alpha:!0,powerPreference:"high-performance"},camera:{position:[0,0,5],fov:44,near:.1,far:60},style:{position:"absolute",inset:0},children:[A.jsx(X,{}),A.jsx(K,{items:t,filter:a,progress:o,dragState:n,onHover:r,onOpen:h})]})}export{ne as default};
