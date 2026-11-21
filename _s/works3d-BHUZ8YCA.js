import{j as c,r as i}from"./kit-B9vXdzke.js";import{C as ie,b3 as fe,u as oe,b4 as me,b as ne,$ as ae,S as de,w as re,al as se,aH as he,j as pe,af as ve,aY as ye,b0 as xe,aK as ge}from"./react-three-fiber.esm-BxSUdgq5.js";import{E as we,B as Me,a as Ae}from"./Bloom-Cc6FKeE6.js";import{N as be}from"./Noise-CMTgmkfU.js";import{V as De}from"./Vignette-DJs2MJBW.js";import{i as ue}from"./yts-D7Eg8avD.js";import{M as je}from"./MeshReflectorMaterial-wuXcg7VK.js";import"./preload-helper-BDQy5SUP.js";import"./index-au8DSQSf.js";import"./extends-CF3RwP-h.js";import"./constants-CIMWHpzV.js";const q=11,R=.24,ke={all:3,render:3,sketch:2,build:2},Pe={all:5,render:5,sketch:4,build:4},le=t=>t?9:4.7,Fe=t=>-le(t)/2-.6,Te=new Set([1,3,4,5,7,8,10,11,12,13,17,18,20,24,25,26,33,34,38,40,42,43,45,46,47,49,50,53,57,62,65,73,78,82,83,84,88,89,90,91,95,97,98,99,101,102,103,104,107,108,111,112,113,120,124,125,126,127,128,129,130,131,132,134,135,136,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158]),{damp:h,clamp:K,lerp:Q}=ae,Le=`
uniform float uBend, uDepthAmt, uImgA, uPlaneA, uHover, uFly;
uniform sampler2D uDepth;
varying vec2 vUv; varying vec2 vTex; varying float vD;
void main(){
  vUv = uv;
  vec2 t = uv;
  if (uImgA > uPlaneA) t.x = (t.x - .5) * uPlaneA / uImgA + .5;
  else t.y = (t.y - .5) * uImgA / uPlaneA + .5;
  t = (t - .5) * (1. - .06 * uHover * (1. - uFly)) + .5;
  vTex = t;
  vec3 p = position;
  float s = sin(uv.x * 3.14159);
  float b = uBend * (1. - uFly);
  p.z += s * b * 1.1;
  p.y += sin(uv.x * 3.14159 + 1.2) * b * 0.14;
  float d = 0.;
  if (uDepthAmt > .001) d = texture2D(uDepth, t).r;
  vD = d;
  vec2 e = smoothstep(vec2(0.), vec2(.08), uv) * smoothstep(vec2(0.), vec2(.08), 1. - uv);
  p.z += (d - .25) * uDepthAmt * e.x * e.y;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`,Se=`
uniform sampler2D map;
uniform float uLoaded, uAlpha, uSketch, uHover, uDim, uImgA, uPlaneA, uBend, uBlur, uDepthAmt, uFly;
varying vec2 vUv; varying vec2 vTex; varying float vD;
float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
void main(){
  vec2 uv = vTex;
  vec2 off = vec2(uBend * .014 * (1. - uFly), 0.);
  float bias = uBlur;
  vec3 col = vec3(texture2D(map, uv + off, bias).r, texture2D(map, uv, bias).g, texture2D(map, uv - off, bias).b);
  float lum = dot(col, vec3(.299,.587,.114));
  col = mix(col, vec3(lum), .25 * (1. - uHover) * (1. - uSketch) * (1. - uFly));
  vec3 paper = vec3(.925,.906,.875);
  float g = hash(floor(gl_FragCoord.xy));
  vec3 ink = mix(col, vec3(smoothstep(.15,.95,lum)) * vec3(.98,.96,.93), .35);
  col = mix(col, ink * paper - g * .035, uSketch);
  // depth relief on hover: far pixels recede into shade, near ones catch a warm key
  float dn = clamp(uDepthAmt * 1.4, 0., 1.);
  col *= mix(1., .7 + .45 * vD, dn);
  col += vec3(1., .78, .5) * pow(vD, 3.) * .18 * dn;
  vec3 base = mix(vec3(.12,.115,.105), paper, uSketch);
  col = mix(base, col, uLoaded);
  col = mix(col, vec3(.082,.078,.07), uDim);
  vec2 e = min(vUv, 1. - vUv);
  float edge = step(min(e.x * uPlaneA, e.y), .006) * uHover * (1. - uFly);
  col = mix(col, vec3(1.2,.95,.55), edge);
  gl_FragColor = vec4(pow(max(col, 0.), vec3(2.2)), uAlpha);
  #include <colorspace_fragment>
}`,J=(()=>{const t=new pe(new Uint8Array([30,29,27,255]),1,1);return t.needsUpdate=!0,t})();let _=0;const W=[];function ce(){for(;_<4&&W.length;){const t=W.shift();if(t.cancelled)continue;_++;const o=new Image;o.decoding="async",o.src=t.src||ue(t.id,!0),o.decode().then(()=>{if(t.cancelled)return;const s=t.max||512,r=Math.min(1,s/Math.max(o.naturalWidth,o.naturalHeight)),n=document.createElement("canvas");n.width=Math.max(2,Math.round(o.naturalWidth*r)),n.height=Math.max(2,Math.round(o.naturalHeight*r)),n.getContext("2d").drawImage(o,0,0,n.width,n.height);const x=new ve(n);x.colorSpace=ye,x.anisotropy=4,x.minFilter=xe,t.done(x,o.naturalWidth/o.naturalHeight)}).catch(()=>{}).finally(()=>{_--,ce()})}}function X(t,o,s={}){const r={id:t,done:o,cancelled:!1,...s};return W.push(r),ce(),r}function Be(t,o,s){const r=le(s),n=(s?Pe:ke)[o]||3,x=t.filter(j=>o==="all"||j.kind===o),g=(r-R*(n-1))/n,A=g*1.46,f=(A+R)/q,p=Math.ceil(x.length/n),w=p*f,m=new Map;return x.forEach((j,u)=>{const d=Math.floor(u/n),M=u%n;m.set(j.id,{th:(d-(p-1)/2)*f,y:(n-1)/2*(g+R)-M*(g+R)-.3,w:A,h:g,order:u})}),{pos:m,ext:w,step:f,cellW:A,rowH:g}}const Z=new re,U=new se,ee=new se;new ge;const te=new re;function Ee({it:t,L:o,state:s,onHover:r,dragState:n,onPick:x,segs:g}){const A=i.useRef(),f=i.useMemo(()=>new de({vertexShader:Le,fragmentShader:Se,transparent:!0,depthWrite:!1,uniforms:{map:{value:J},uDepth:{value:J},uLoaded:{value:0},uAlpha:{value:0},uSketch:{value:t.kind==="sketch"?1:0},uHover:{value:0},uDim:{value:0},uImgA:{value:1.5},uPlaneA:{value:1.46},uBend:{value:0},uBlur:{value:0},uDepthAmt:{value:0},uFly:{value:0}}}),[t]),p=i.useRef({th:(Math.random()-.5)*4,y:(Math.random()-.5)*8,w:2,h:1.4,a:0,hov:0,fly:0,dl:0,lambda:3+Math.random()*3}),w=i.useRef(null),m=i.useRef(null),j=i.useRef(!1),u=i.useRef(null),d=i.useRef(!1),M=i.useRef(!1);return i.useEffect(()=>()=>{var a,b;w.current&&(w.current.cancelled=!0),(a=m.current)==null||a.dispose(),(b=u.current)==null||b.dispose(),f.dispose()},[f]),ne((a,b)=>{const v=A.current,e=p.current,l=f.uniforms,k=s.current,F=o.pos.get(t.id),L=F||{th:e.th,y:e.y,w:e.w*.7,h:e.h*.7},D=Math.min(b,.05),B=k.fly===t.id;e.th=h(e.th,L.th,e.lambda,D),e.y=h(e.y,F?L.y:e.y>0?6:-6,e.lambda,D),e.w=h(e.w,L.w,e.lambda,D),e.h=h(e.h,L.h,e.lambda,D),e.a=h(e.a,F?1:0,F?e.lambda*.8:8,D);const O=j.current&&!n.current.moved&&!k.fly||B;e.hov=h(e.hov,O?1:0,9,D),e.fly=h(e.fly,B?1:0,B?6.5:5,D);const S=e.th-k.rot,V=q-e.hov*1.2;v.position.set(Math.sin(S)*V,e.y,-Math.cos(S)*V),v.rotation.set(0,-S,0);const z=1+e.hov*.06;let E=e.w*z,H=e.h*z;const P=e.fly*e.fly*(3-2*e.fly);if(e.fly>.001){const y=a.camera,T=4;y.getWorldDirection(te),Z.copy(y.position).addScaledVector(te,T);const N=2*T*Math.tan(y.fov*Math.PI/360),Y=N*y.aspect,$=l.uImgA.value;let C=N*.78,I=C*$;I>Y*.84&&(I=Y*.84,C=I/$),v.position.lerp(Z,P),U.setFromEuler(v.rotation),ee.copy(y.quaternion),U.slerp(ee,P),v.quaternion.copy(U),E=Q(E,I,P),H=Q(H,C,P),v.renderOrder=10}else v.renderOrder=0;v.scale.set(E,H,1),v.visible=e.a>.01&&(Math.abs(S)<2.2||e.fly>.01),l.uAlpha.value=e.a,l.uHover.value=e.hov,l.uFly.value=P,l.uBend.value=k.bend,l.uPlaneA.value=E/H;const G=ae.smoothstep(Math.abs(S),.5,1.6);l.uDim.value=G*.85*(1-P)+k.flyAmt*.82*(1-P),l.uBlur.value=(G*2.4+Math.min(Math.abs(k.vel)*.9,1.5))*(1-e.hov)*(1-P),!w.current&&F&&Math.abs(S)<1.25&&(w.current=X(t.id,(y,T)=>{m.current=y,l.map.value=y,l.uImgA.value=T})),B&&!M.current&&m.current&&(M.current=!0,X(t.id,y=>{var T;(T=m.current)==null||T.dispose(),m.current=y,l.map.value=y},{src:ue(t.id),max:1600})),O&&!d.current&&Te.has(t.id)&&!B&&(d.current=!0,new he().load(`/portfolio/yts/depth/${t.id}.webp`,y=>{u.current=y,l.uDepth.value=y,e.dl=1})),l.uDepthAmt.value=e.hov*e.dl*.75*(1-P),m.current&&(l.uLoaded.value=h(l.uLoaded.value,1,4,D))}),c.jsx("mesh",{ref:A,material:f,onPointerOver:a=>{a.stopPropagation(),j.current=!0,document.body.style.cursor="pointer",r(t)},onPointerOut:()=>{j.current=!1,document.body.style.cursor="",r(null)},onClick:a=>{a.stopPropagation(),n.current.moved||x(t)},children:c.jsx("planeGeometry",{args:[1,1,g,Math.round(g*.6)]})})}function He({items:t,filter:o,progress:s,dragState:r,onHover:n,onOpen:x,lbOpen:g,onFly:A,mobile:f}){const p=i.useMemo(()=>Be(t,o,f),[t,o,f]),w=i.useRef({rot:0,bend:0,vel:0,fly:null,flyT:0,opened:!1,flyAmt:0,item:null}),{camera:m}=oe();i.useEffect(()=>{r.current.offset=0,r.current.target=0},[o]),i.useEffect(()=>{!g&&w.current.opened&&(w.current.fly=null,w.current.opened=!1,A(!1))},[g]);const j=u=>{const d=w.current;d.fly||(d.fly=u.id,d.item=u,d.flyT=0,d.opened=!1,A(!0),n(null),document.body.style.cursor="",setTimeout(()=>{d.fly===u.id&&!d.opened&&(d.opened=!0,x(u))},640))};return ne((u,d)=>{const M=Math.min(d,.05),a=w.current,b=r.current;b.offset=h(b.offset,b.target,5,M);const v=Math.max(0,p.ext-1.1),e=v/2+.6;b.target=K(b.target,-e-(s.get()-.5)*v,e-(s.get()-.5)*v);const l=(s.get()-.5)*v+b.offset,k=a.rot;a.fly||(a.rot=h(k,l,6,M));const F=(a.rot-k)/Math.max(M,.001);a.vel=h(a.vel,F,8,M),a.bend=h(a.bend,K(F*1.1,-1.4,1.4),8,M),a.flyAmt=h(a.flyAmt,a.fly?1:0,6,M);const L=a.fly?0:u.pointer.x,D=a.fly?0:u.pointer.y;m.position.x=h(m.position.x,L*.6,3,M),m.position.y=h(m.position.y,D*.35+.15,3,M),m.lookAt(0,f?.4:-.1,-q)}),t.map(u=>c.jsx(Ee,{it:u,L:p,state:w,onHover:n,onPick:j,dragState:r,segs:f?24:40},u.id))}function Ie({mobile:t}){const{camera:o,size:s,scene:r}=oe();return i.useEffect(()=>{const n=s.width/s.height;o.fov=n<1.2?58:44,o.position.z=n<1.2?3:5,o.updateProjectionMatrix()},[s,o]),i.useLayoutEffect(()=>(r.fog=new me("#151412",13,27),()=>{r.fog=null}),[r]),null}function Re({mobile:t}){return c.jsxs("mesh",{"rotation-x":-Math.PI/2,position:[0,Fe(t),-4],children:[c.jsx("planeGeometry",{args:[60,40]}),c.jsx(je,{blur:t?[80,30]:[240,80],resolution:t?256:768,mixBlur:.9,mixStrength:t?5:9,mixContrast:1.1,roughness:.85,depthScale:1.1,minDepthThreshold:.35,maxDepthThreshold:1.4,color:"#1b1916",metalness:.55,mirror:.75})]})}function $e({items:t,filter:o,progress:s,dragState:r,onHover:n,onOpen:x,active:g,lbOpen:A,onFly:f,mobile:p}){return c.jsxs(ie,{frameloop:g||A?"always":"never",dpr:[1,p?1.5:1.6],gl:{antialias:!!p,powerPreference:"high-performance",toneMapping:fe},camera:{position:[0,0,5],fov:44,near:.1,far:60},style:{position:"absolute",inset:0},children:[c.jsx("color",{attach:"background",args:["#151412"]}),c.jsx("ambientLight",{intensity:1.2}),c.jsx("directionalLight",{position:[0,6,4],intensity:1.2,color:"#ffe4c4"}),c.jsx(Ie,{mobile:p}),c.jsx(He,{items:t,filter:o,progress:s,dragState:r,onHover:n,onOpen:x,lbOpen:A,onFly:f,mobile:p}),c.jsx(Re,{mobile:p}),!p&&c.jsxs(we,{multisampling:4,disableNormalPass:!0,children:[c.jsx(Me,{mipmapBlur:!0,intensity:.7,luminanceThreshold:.82,luminanceSmoothing:.18}),c.jsx(be,{premultiply:!0,blendFunction:Ae.SOFT_LIGHT,opacity:.4}),c.jsx(De,{offset:.25,darkness:.75})]})]})}export{$e as default};
