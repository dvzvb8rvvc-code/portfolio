import{r as l,j as o}from"./kit-CrkWe-58.js";import{c as d,C as b,u as h,b as g,_ as j,a2 as R,aq as C,a as W}from"./react-three-fiber.esm-BvTp4Lth.js";import{l as P}from"./chillcity-BWIO-e8a.js";import"./preload-helper-BDQy5SUP.js";import"./index-DtptUKTr.js";import"./play-CQfDEg0y.js";import"./createLucideIcon-Dgr_Xn4d.js";import"./train-front-CcDeW6a5.js";import"./arrow-up-right-BeL_MIO8.js";import"./star-CKsqCHtD.js";import"./map-pin-DIYN7RkA.js";import"./phone-Cpc6gH43.js";const p={x:0,y:0},A=()=>Math.min(1,Math.max(0,window.scrollY/(window.innerHeight*1.5))),a={uNight:{value:0},uPulse:{value:0},uTime:{value:0}},y=300,w=130,T=`
uniform float uNight, uPulse, uTime; varying vec2 vUv;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
void main(){
  float n = uNight; vec2 p = vUv; float A = ${(y/w).toFixed(3)};
  float y = clamp((p.y - .1) / .9, 0., 1.);
  vec3 top = mix(vec3(.25,.12,.42), vec3(.025,.02,.075), n);
  vec3 mid = mix(vec3(.94,.46,.55), vec3(.13,.07,.27), n);
  vec3 hor = mix(vec3(1.,.8,.58), vec3(.36,.17,.44), n);
  vec3 c = mix(hor, mid, smoothstep(.0, .22, y));
  c = mix(c, top, smoothstep(.18, .7, y));
  vec2 sp = vec2((p.x - .5) * A, p.y - mix(.3, .02, n));
  float d = length(sp), r = .085;
  float disc = smoothstep(r, r - .003, d);
  float cut = mix(1., step(.0, sin(p.y * 260. - uTime * .6)), smoothstep(.0, -r * .9, sp.y));
  vec3 sunC = mix(vec3(1.,.88,.6), vec3(1.,.4,.56), smoothstep(r, -r, sp.y));
  c = mix(c, sunC, disc * cut * (1. - n * .7));
  c += vec3(1.,.55,.45) * exp(-d * 7.) * .45 * (1. - n);
  vec2 mp = vec2((p.x - .7) * A, p.y - .62); float md = length(mp);
  c = mix(c, vec3(.95,.93,1.), smoothstep(.032, .028, md) * smoothstep(.4, .9, n));
  c += vec3(.35,.5,.95) * exp(-md * 12.) * .35 * n;
  vec2 g = floor(p * vec2(A * 110., 110.)); float s = h(g);
  c += step(.9965, s) * smoothstep(.35, 1., n) * smoothstep(.15, .4, y) * (.55 + .45 * sin(uTime * 2. + s * 60.));
  c += vec3(.3,.1,.35) * uPulse * .18;
  gl_FragColor = vec4(c, 1.);
}`,S="varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }",z=`
attribute float aR; varying vec3 vW; varying vec3 vN; varying float vR; varying float vD;
void main(){
  vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.);
  vW = wp.xyz; vN = normalize(mat3(modelMatrix * instanceMatrix) * normal); vR = aR;
  vec4 mv = viewMatrix * wp; vD = -mv.z;
  gl_Position = projectionMatrix * mv;
}`,E=`
uniform float uNight, uPulse, uTime; varying vec3 vW; varying vec3 vN; varying float vR; varying float vD;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
void main(){
  float n = uNight;
  vec3 day = mix(vec3(.34,.2,.42), vec3(.5,.3,.48), vR);
  vec3 nightC = mix(vec3(.05,.035,.1), vec3(.08,.05,.14), vR);
  vec3 col = mix(day, nightC, n);
  float side = 1. - step(.5, abs(vN.y));
  float facing = abs(vN.x) > .5 ? .8 : 1.;
  col *= facing;
  vec2 uv = abs(vN.x) > .5 ? vec2(vW.z, vW.y) : vec2(vW.x, vW.y);
  vec2 g = uv * vec2(2.4, 2.6); vec2 id = floor(g); vec2 f = fract(g);
  float win = step(.2, f.x) * step(f.x, .75) * step(.22, f.y) * step(f.y, .72);
  float rnd = h(id + vR * 91.7);
  float lit = step(mix(.8, .42, n), rnd) * win * side * step(.8, vW.y);
  vec3 warm = mix(vec3(1.,.7,.45), vec3(.35,1.,.92), step(.86, h(id * 1.7 + vR)));
  warm = mix(warm, vec3(1.,.5,.75), step(.94, h(id * 2.3 + vR * 3.)));
  float flick = .8 + .2 * sin(uTime * (.4 + rnd * 1.6) + rnd * 40.);
  float pulse = 1. + uPulse * (.5 + 1.6 * h(id + 3.1));
  col += warm * lit * (.3 + n * 1.15) * flick * pulse;
  col += vec3(1.,.62,.5) * (1. - n) * .22 * step(.5, vN.y);
  col += vec3(.3,1.,.9) * n * .12 * step(.5, vN.y) * (1. + uPulse * 2.);
  vec3 fogC = mix(vec3(1.,.66,.6), vec3(.2,.1,.33), n);
  col = mix(col, fogC, clamp((vD - 14.) / 70., 0., .78));
  gl_FragColor = vec4(col, 1.);
}`;function F({count:e}){const i=l.useRef(),{geo:n,mat:c}=l.useMemo(()=>{const t=new j(1,1,1);t.translate(0,.5,0);const r=new d({uniforms:a,vertexShader:z,fragmentShader:E});return{geo:t,mat:r}},[]);return l.useEffect(()=>{const t=new R,r=new Float32Array(e);let m=7;const s=()=>(m=m*16807%2147483647)/2147483647;for(let v=0;v<e;v++){const u=(s()-.5)*100,f=s()**.8,M=-2-f*52,N=1-Math.min(1,Math.abs(u)/50);let x=1.4+s()**2.2*11*(.6+N*.8)*(.45+f*.9);s()>.96&&(x+=7),t.position.set(u,0,M),t.scale.set(1.4+s()*2.6,x,1.4+s()*2.6),t.updateMatrix(),i.current.setMatrixAt(v,t.matrix),r[v]=s()}n.setAttribute("aR",new C(r,1)),i.current.instanceMatrix.needsUpdate=!0},[e,n]),o.jsx("instancedMesh",{ref:i,args:[n,c,e],frustumCulled:!1})}const G=new g("#5a3460"),U=new g("#0d0818");function _(){const e=l.useRef();return h(()=>e.current.color.copy(G).lerp(U,a.uNight.value)),o.jsxs("mesh",{"rotation-x":-Math.PI/2,position:[0,0,-30],children:[o.jsx("planeGeometry",{args:[300,140]}),o.jsx("meshBasicMaterial",{ref:e})]})}function k(){const{camera:e,size:i}=W(),n=i.width<768;return h((c,t)=>{const r=c.clock.elapsedTime,m=A();a.uNight.value+=(m-a.uNight.value)*Math.min(1,t*4),a.uTime.value=r,a.uPulse.value+=(P.v*1.6-a.uPulse.value)*.3;const s=Math.sin(r*.06)*2.5+p.x*2.2,v=(n?9:7)+p.y*1.1-m*1.5;e.position.x+=(s-e.position.x)*.04,e.position.y+=(v-e.position.y)*.04,e.position.z=n?34:24,e.lookAt(e.position.x*.3,n?17:12,-30)}),null}function J({active:e}){l.useEffect(()=>{const c=t=>{p.x=t.clientX/innerWidth*2-1,p.y=-(t.clientY/innerHeight*2-1)};return addEventListener("pointermove",c,{passive:!0}),()=>removeEventListener("pointermove",c)},[]);const i=typeof window<"u"&&innerWidth<768,n=l.useMemo(()=>new d({uniforms:a,vertexShader:S,fragmentShader:T,depthWrite:!1}),[]);return o.jsxs(b,{dpr:[1,1.6],frameloop:e?"always":"never",camera:{position:[0,7,24],fov:i?52:42,far:200},gl:{antialias:!i,alpha:!1},style:{pointerEvents:"none"},children:[o.jsx("mesh",{position:[0,46,-80],material:n,children:o.jsx("planeGeometry",{args:[y,w]})}),o.jsx(_,{}),o.jsx(F,{count:i?170:300}),o.jsx(k,{})]})}export{J as default};
