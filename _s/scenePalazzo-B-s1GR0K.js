import{r as m,j as u}from"./kit-CKF0FlHv.js";import{a as z,u as S,a0 as j,ag as W,S as E,a3 as O,au as H,ac as U,y as $,aI as X,P as Y,b as q}from"./react-three-fiber.esm-BIG1fDkD.js";import{s as J}from"./yts-B_MjdFcx.js";import"./preload-helper-BDQy5SUP.js";import"./index-Dah_BPzX.js";const b=[400,0,0],M=[148,156,157,152],K=154,_={148:1800/1759,156:1800/1310,157:1800/1708,152:1800/1530,154:1800/1776},y={open:[0,.12],rooms:[.06,.8],look:[.8,.95]},Q=M.length-1+.55,C=2.6,D=3.4,T={148:{pitch:.07,depth:1.25,beam:[.35,-.28]},156:{pitch:.05,depth:1.15,beam:[-.9,.42]},157:{pitch:.05,depth:1.2,beam:[.95,-.4]},152:{pitch:.09,depth:1.1,beam:[-.75,.36]}},k=(t,e=0,o=1)=>Math.min(o,Math.max(e,t)),g=(t,e,o)=>{const a=k((o-t)/(e-t));return a*a*(3-2*a)};function I(t){const e=k((t-y.rooms[0])/(y.rooms[1]-y.rooms[0]))*Q,o=Math.min(Math.floor(e),M.length-1),a=e-o;return o+a-.6*Math.sin(2*Math.PI*(a-.25))/(2*Math.PI)}const ee=I(1),te=D-ee*C,oe=(t,e)=>`/portfolio/yts/img/${t}${e?"-s":""}.webp`,ae=t=>`/portfolio/yts/depth/${t}.webp`,re=`
uniform sampler2D uDepth; uniform float uAmount; uniform float uCamZ; uniform float uCurve; uniform float uHalf;
varying vec2 vUv; varying float vD; varying float vNear;
void main(){
  vUv = uv;
  float d = texture2D(uDepth, uv).r;
  vD = d;
  vec2 r = position.xy / uHalf;
  vec3 p = position + normal * (d * uAmount + uCurve * dot(r, r));
  vec4 wp = modelMatrix * vec4(p, 1.0);
  vNear = uCamZ - wp.z;
  gl_Position = projectionMatrix * viewMatrix * wp;
}`,se=`
uniform sampler2D uMap; uniform float uEdge; uniform float uOpacity; uniform float uDissolve; uniform float uPass; uniform float uExposure; uniform vec3 uTint;
varying vec2 vUv; varying float vD; varying float vNear;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y); }
void main(){
  vec3 c = texture2D(uMap, vUv).rgb;
  vec2 e = smoothstep(vec2(0.0), vec2(uEdge), vUv) * smoothstep(vec2(0.0), vec2(uEdge), 1.0 - vUv);
  float a = e.x * e.y * uOpacity;
  a *= mix(1.0, smoothstep(0.08, 0.5, vNear), uPass);           // never clip through the lens
  float rim = 0.0;
  if (uDissolve > 0.001) {                                      // portal: near surfaces dissolve first
    float n = noise(vUv * 9.0) * 0.5 + noise(vUv * 31.0) * 0.25;
    float far = 1.0 - vD + n * 0.35;
    float cut = smoothstep(uDissolve - 0.08, uDissolve, far);
    rim = (1.0 - smoothstep(uDissolve, uDissolve + 0.06, far)) * cut;
    a *= cut;
  }
  if (a < 0.01) discard;
  vec3 col = c * uExposure * uTint + vec3(1.0, 0.6, 0.26) * rim * 2.2;
  gl_FragColor = vec4(col, a);
  #include <colorspace_fragment>
}`;function F({id:t,small:e,segs:o,width:a,depth:p,uref:i,pass:c=1,curve:f=0,...h}){const[n,s]=$(X,[oe(t,e),ae(t)]);n.colorSpace=E,n.anisotropy=4,n.generateMipmaps=!0;const l=_[t],v=m.useMemo(()=>new Y(a,a*l,o,Math.round(o*Math.min(l,1.3))),[a,l,o]),d=m.useMemo(()=>({uMap:{value:n},uDepth:{value:s},uAmount:{value:p},uCamZ:{value:0},uEdge:{value:.06},uOpacity:{value:1},uDissolve:{value:0},uPass:{value:c},uExposure:{value:1},uCurve:{value:f},uHalf:{value:a/2},uTint:{value:new q(1,1,1)}}),[n,s,a]);return i.current=d,u.jsx("mesh",{geometry:v,frustumCulled:!1,...h,children:u.jsx("shaderMaterial",{uniforms:d,vertexShader:re,fragmentShader:se,transparent:!0,depthWrite:!0})})}function ne(){const t=document.createElement("canvas");t.width=64,t.height=256;const e=t.getContext("2d"),o=e.createImageData(64,256);for(let p=0;p<256;p++)for(let i=0;i<64;i++){const c=i/63*2-1,f=p/255,h=Math.exp(-c*c*5)*Math.pow(Math.sin(f*Math.PI),1.4)*(.55+.45*(1-f)),n=(p*64+i)*4;o.data[n]=255,o.data[n+1]=214,o.data[n+2]=160,o.data[n+3]=h*255}e.putImageData(o,0,0);const a=new W(t);return a.colorSpace=E,a}const r={t:0,look:0,camZ:D,active:!1};function ie({id:t,k:e,mob:o,beamTex:a,cover:p}){const i=m.useRef(),c=m.useRef(),f=m.useRef(),h=T[t],n=e===M.length-1,s=p(_[t]);return S(l=>{const v=i.current;if(!v||!c.current)return;const d=r.t,x=d>e-.62&&d<e+1.03;c.current.visible=x,x&&(v.uCamZ.value=r.camZ,v.uDissolve.value=n?0:g(e+.42,e+1,d)*1.45,v.uOpacity.value=n?1-g(.2,.62,r.look):1-g(e+.85,e+1.02,d),v.uExposure.value=.5+.5*g(e-.95,e-.1,d)+.035*Math.sin(l.clock.elapsedTime*.6+e),f.current&&(f.current.material.opacity=.3*g(e-.75,e-.05,d)*(1-g(e+.3,e+.8,d))*(n?1-r.look:1)))}),u.jsxs("group",{ref:c,position:[0,0,-e*C],visible:!1,children:[u.jsx(F,{id:t,small:o,segs:o?96:170,width:s,depth:h.depth,uref:i}),u.jsxs("mesh",{ref:f,position:[h.beam[0],.45,1.2],rotation:[0,0,h.beam[1]],children:[u.jsx("planeGeometry",{args:[1.05,4.4]}),u.jsx("meshBasicMaterial",{map:a,transparent:!0,opacity:0,blending:O,depthWrite:!1,color:"#ffc98a",toneMapped:!1})]})]})}function ue({mob:t}){const e=m.useRef(),o=m.useRef();return S((a,p)=>{const i=e.current;!i||!o.current||(o.current.visible=r.look>.02,o.current.visible&&(i.uOpacity.value=g(.12,.58,r.look),i.uExposure.value=.7+.38*g(.35,1,r.look),o.current.rotation.y+=Math.min(p,.05)*.025*r.look))}),u.jsx("group",{ref:o,position:[0,2.1,te],visible:!1,children:u.jsx(F,{id:K,small:t,segs:t?96:180,width:t?6.4:7.4,depth:.55,curve:-.9,uref:e,pass:0,rotation:[Math.PI/2,0,0]})})}const ce=`
attribute float aSeed; uniform float uTime; uniform float uSize; uniform float uOpacity;
varying float vA;
void main(){
  vec3 p = position;
  float s = aSeed * 6.2831;
  p.x += sin(uTime * 0.11 + s) * 0.18;
  p.y += sin(uTime * 0.07 + s * 1.7) * 0.22 + fract(uTime * 0.006 * (0.4 + aSeed) + aSeed) * 0.6 - 0.3;
  p.z += cos(uTime * 0.09 + s * 2.3) * 0.15;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  float dist = -mv.z;
  gl_PointSize = uSize * (0.45 + aSeed) / max(dist, 0.1);
  vA = uOpacity * smoothstep(0.2, 0.8, dist) * (1.0 - smoothstep(3.0, 5.5, dist)) * (0.45 + 0.55 * sin(uTime * (0.5 + aSeed) + s * 7.0));
  gl_Position = projectionMatrix * mv;
}`,le=`
varying float vA;
void main(){ float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.0, d); a *= a; gl_FragColor = vec4(vec3(1.0, 0.8, 0.55) * 1.3, a * max(vA, 0.0)); }`;function ve({mob:t}){const{gl:e}=z(),o=m.useRef(),a=m.useMemo(()=>{const i=t?360:900,c=new Float32Array(i*3),f=new Float32Array(i),h=M.map(s=>T[s].beam[0]);for(let s=0;s<i;s++){const l=Math.floor(Math.random()*M.length),v=Math.random()<.55;c[s*3]=v?h[l]+(Math.random()-.5)*.7:(Math.random()-.5)*3.4,c[s*3+1]=(Math.random()-.5)*2.4+(v?.3:0),c[s*3+2]=-l*C+.6+Math.random()*2.8,f[s]=Math.random()}const n=new H;return n.setAttribute("position",new U(c,3)),n.setAttribute("aSeed",new U(f,1)),n},[t]),p=m.useMemo(()=>({uTime:{value:0},uSize:{value:26},uOpacity:{value:.8}}),[]);return S(i=>{if(!o.current)return;const c=o.current.uniforms;c.uTime.value=i.clock.elapsedTime,c.uSize.value=(t?30:24)*e.getPixelRatio(),c.uOpacity.value=.85*(1-r.look*.5)}),u.jsx("points",{geometry:a,frustumCulled:!1,children:u.jsx("shaderMaterial",{ref:o,uniforms:p,vertexShader:ce,fragmentShader:le,transparent:!0,depthWrite:!1,blending:O})})}const fe="varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy * 2.0, 0.9999, 1.0); }",me="varying vec2 vUv; void main(){ float r = distance(vUv, vec2(0.5, 0.55)); vec3 c = mix(vec3(0.09, 0.065, 0.045), vec3(0.025, 0.02, 0.016), smoothstep(0.1, 0.8, r)); gl_FragColor = vec4(c, 1.0); }";function pe(){const t=m.useRef();return S(()=>{t.current&&(t.current.visible=r.active)}),u.jsxs("mesh",{ref:t,frustumCulled:!1,renderOrder:-10,children:[u.jsx("planeGeometry",{args:[1,1]}),u.jsx("shaderMaterial",{vertexShader:fe,fragmentShader:me,depthWrite:!1,depthTest:!1,toneMapped:!1})]})}function ye({track:t}){const e=m.useRef(),{size:o}=z(),a=o.width<768,p=a?60:48,i=m.useMemo(ne,[]),c=s=>{const l=2*D*Math.tan(p*Math.PI/360),v=l*(o.width/o.height);return Math.max(v,l/s)*1.2},f=m.useRef(0),h=m.useRef({x:0,y:0}),n=m.useRef(!1);return S((s,l)=>{const v=t.current;if(l=Math.min(l,.05),!e.current)return;if(r.active=v.on&&J.active==="palazzo",e.current.visible=r.active,!v.on){n.current=!1;return}!n.current||Math.abs(v.p-f.current)>.35?f.current=v.p:f.current=j.damp(f.current,v.p,4.5,l),n.current=r.active;const d=f.current;if(r.t=I(d),r.look=g(y.look[0],y.look[1],d),!r.active)return;const x=s.camera;h.current.x=j.damp(h.current.x,s.pointer.x,2.5,l),h.current.y=j.damp(h.current.y,s.pointer.y,2.5,l);const w=h.current.x*(1-r.look),A=h.current.y*(1-r.look),Z=g(y.open[0],y.open[1]+.04,d),B=D-r.t*C+(1-Z)*.7,P=Math.min(Math.floor(r.t),M.length-1),N=r.t-P,G=T[M[P]].pitch,L=T[M[Math.min(P+1,M.length-1)]].pitch,V=j.lerp(G,L,g(.55,1,N))*(1-r.look)+r.look*1.45,R=s.clock.elapsedTime;x.position.set(b[0]+w*.14,b[1]+A*.08+Math.sin(R*.45)*.01,b[2]+B),x.rotation.order="YXZ",x.rotation.set(V+A*.02,-w*.05+Math.sin(R*.2)*.006,0),Math.abs(x.fov-p)>.01&&(x.fov=p,x.updateProjectionMatrix()),r.camZ=x.position.z-b[2]}),u.jsxs("group",{ref:e,visible:!1,children:[u.jsx(pe,{}),u.jsxs("group",{position:b,children:[u.jsxs(m.Suspense,{fallback:null,children:[M.map((s,l)=>u.jsx(ie,{id:s,k:l,mob:a,beamTex:i,cover:c},s)),u.jsx(ue,{mob:a})]}),u.jsx(ve,{mob:a})]})]})}export{ye as default};
