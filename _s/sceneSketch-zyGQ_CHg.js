import{r as i,j as p}from"./kit-CRmoX2bk.js";import{y as pe,aI as J,a as he,S as Q,f as de,V as O,b as ge,u as te,a0 as L,x as oe,P as xe,a3 as be}from"./react-three-fiber.esm-PPrcSziY.js";import{P as D,s as I}from"./yts-CJpXo2il.js";import"./preload-helper-BDQy5SUP.js";import"./index-DembSkzf.js";const G=new oe(-120,40,0),ae=8,B=2.6,W=[.78,1.25,.95,1.33],we=[.5,.42,.55,.42],ye=[1,0,0,0],Me=new ge("#0b0a08"),Ae=()=>typeof window<"u"&&window.innerWidth<=768,R=(a,s,g)=>{const v=Math.min(1,Math.max(0,(g-a)/(s-a)));return v*v*(3-2*v)},S=L.damp,z={x:0,y:0};typeof window<"u"&&window.addEventListener("pointermove",a=>{a.pointerType!=="touch"&&(z.x=a.clientX/innerWidth*2-1,z.y=-(a.clientY/innerHeight*2-1))},{passive:!0});const re=`
float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
  return mix(mix(h21(i), h21(i+vec2(1.,0.)), f.x), mix(h21(i+vec2(0.,1.)), h21(i+vec2(1.,1.)), f.x), f.y); }
float fbm(vec2 p){ float a = .5, s = 0.; for(int i = 0; i < 4; i++){ s += a * vn(p); p = p * 2.03 + 17.1; a *= .5; } return s / .9375; }
`,ke=`
uniform sampler2D uDepth; uniform vec2 uCovB; uniform float uAmount, uMix, uTime, uFa;
varying vec2 vUv; varying float vD;
${re}
void main(){
  vUv = uv;
  vec2 ub = (uv - .5) * uCovB + .5;
  float d = texture2D(uDepth, ub).r;
  vD = d;
  vec2 q = uv * vec2(uFa, 1.);
  float n = fbm(q * 1.3 + vec2(0., uTime * .02));
  float f = clamp(n * .6 + (1. - d) * .4, 0., 1.);
  float k = smoothstep(f - .2, f + .2, uMix * 1.4 - .2);
  float band = 1. - abs(2. * k - 1.);
  vec2 ef = smoothstep(vec2(0.), vec2(.08), uv) * smoothstep(vec2(0.), vec2(.08), 1. - uv); // border stays flat
  vec3 p = position;
  p.z += ((d - .35) * uAmount * k + band * .05) * ef.x * ef.y;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.);
}`,Se=`
uniform sampler2D uA, uB, uDepth; uniform vec2 uCovA, uCovB;
uniform float uMix, uOpacity, uSketch, uTime, uFa, uSweep;
varying vec2 vUv; varying float vD;
${re}
vec3 grade(vec3 c){
  float l = dot(c, vec3(.2126, .7152, .0722));
  c = mix(vec3(l), c, .86);
  c *= mix(vec3(.93, .96, 1.02), vec3(1.07, 1., .88), smoothstep(.04, .6, l));
  return c * .95 + vec3(.010, .0085, .0065);
}
void main(){
  vec2 uv = vUv, q = uv * vec2(uFa, 1.);
  float front = uMix * 1.4 - .2;
  float dB = texture2D(uDepth, (uv - .5) * uCovB + .5).r;
  float n = fbm(q * 1.3 + vec2(0., uTime * .02));
  float n2 = fbm(q * 4.2 - vec2(uTime * .03, 0.));
  float f = clamp(n * .6 + (1. - dB) * .4, 0., 1.) + (n2 - .5) * .1;
  float wide = 1. - abs(2. * smoothstep(f - .2, f + .2, front) - 1.);
  float k = smoothstep(f - .045, f + .045, front);
  vec2 flow = vec2(fbm(q * 2.1 + 3.1 + uTime * .04), fbm(q * 2.1 - 7.3 - uTime * .04)) - .5;
  vec3 a = texture2D(uA, (uv + flow * wide * .06 - .5) * uCovA + .5).rgb;
  vec3 b = texture2D(uB, (uv - flow * wide * .045 - .5) * uCovB + .5).rgb;
  // before — drawing: warm ink on dark paper (keeps the watercolour hue, never inverts it)
  float la = dot(a, vec3(.299, .587, .114));
  float ink = smoothstep(.92, .12, la);
  vec3 hue = a / max(max(a.r, max(a.g, a.b)), .02);
  vec3 paper = vec3(.0095, .0082, .0064) * (.9 + .2 * vn(q * 3.));
  vec3 aInk = paper + ink * mix(vec3(.9, .78, .56), hue * .85, .35) * .85;
  // before — photo: archival grade (desaturated, warm, low-key)
  vec3 aPh = mix(vec3(la), a, .35) * vec3(1.02, .96, .86) * .72 + .015;
  vec3 ca = mix(aPh, aInk, uSketch);
  // after: hero grade + depth-aware light sweep
  vec3 cb = grade(b) * (.95 + vD * .08);
  float sw = exp(-pow((uv.x * .85 + uv.y * .45 - uSweep + vD * .22) * 3.2, 2.));
  cb += cb * vec3(1., .86, .66) * sw * .22;
  vec3 c = mix(ca, cb, k);
  // ink bleed: darkened wet edge + hairline of gold light on the front
  float edge = 1. - abs(2. * k - 1.);
  c *= 1. - wide * .22 - edge * .3;
  c += vec3(1., .74, .42) * pow(edge, 3.) * .07;
  // frame: soft inner vignette + hairline rim
  vec2 e2 = min(uv, 1. - uv) * vec2(uFa, 1.);
  float ed = min(e2.x, e2.y);
  c *= .86 + .14 * smoothstep(0., .25, ed);
  c = mix(c, vec3(.94, .9, .82), (1. - smoothstep(.0, .006, ed)) * .22);
  float g = h21(gl_FragCoord.xy + fract(uTime * 7.31) * 113.) - .5;
  c += g * .024 * (.35 + sqrt(max(c.g, 0.)));
  vec2 e = smoothstep(vec2(0.), vec2(.004), uv) * smoothstep(vec2(0.), vec2(.004), 1. - uv);
  gl_FragColor = vec4(max(c, 0.), e.x * e.y * uOpacity);
  #include <colorspace_fragment>
}`,Ce="varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",je=`
uniform float uA; uniform vec2 uK; varying vec2 vUv;
void main(){
  vec2 p = (vUv - .5) * uK;
  vec2 d = max(abs(p) - .5, 0.);
  float s = exp(-dot(d, d) * 26.);
  gl_FragColor = vec4(vec3(.76, .6, .36) * s * uA, 1.);
}`,Z=(a,s)=>a>s?new O(s/a,1):new O(1,a/s);function Te({i:a,texA:s,texB:g,texD:v,state:w,hi:l,mobile:F}){const u=W[a],y=B*u,x=F?96:200,A=i.useMemo(()=>new xe(y,B,u>=1?x:Math.round(x*u),u>=1?Math.round(x/u):x),[y,x,u]),P=s.image.width/s.image.height,U=g.image.width/g.image.height,t=i.useMemo(()=>({uA:{value:s},uB:{value:g},uDepth:{value:v},uCovA:{value:Z(P,u)},uCovB:{value:Z(U,u)},uFa:{value:u},uAmount:{value:we[a]},uMix:{value:0},uOpacity:{value:1},uSweep:{value:-1},uSketch:{value:ye[a]},uTime:{value:0}}),[s,g,v]),r=i.useMemo(()=>({uA:{value:0},uK:{value:new O(1.9,1.9)}}),[]),f=i.useRef(),M=i.useRef();return te((h,n)=>{const o=w.current;if(!o.on)return;const e=f.current,m=Math.abs(o.cam-a)<1.2,k=e.visible;if(e.visible=m,!m)return;(!k||o.jump)&&(t.uMix.value=o.r[a]);const d=l.current[a];d&&(d.a&&t.uA.value!==d.a&&(t.uA.value=d.a),d.b&&t.uB.value!==d.b&&(t.uB.value=d.b)),n=Math.min(n,1/20);const C=S(t.uMix.value,o.r[a],4,n);t.uMix.value=C,t.uTime.value=o.t,t.uSweep.value=(o.t*.075+a*.37)%1.9-.45,t.uOpacity.value=o.op;const E=R(.15,1,C);M.current.position.z=E*.12,r.uA.value=(.05+E*.1)*o.op}),p.jsxs("group",{ref:f,position:[a*ae,0,0],children:[p.jsxs("mesh",{renderOrder:1,position:[0,0,-.02],children:[p.jsx("planeGeometry",{args:[y*1.9,B*1.9]}),p.jsx("shaderMaterial",{uniforms:r,vertexShader:Ce,fragmentShader:je,transparent:!0,depthWrite:!1,blending:be})]}),p.jsx("group",{ref:M,children:p.jsx("mesh",{geometry:A,renderOrder:2,children:p.jsx("shaderMaterial",{uniforms:t,vertexShader:ke,fragmentShader:Se,transparent:!0})})})]})}const ee=new oe,De="void main(){ gl_Position = vec4(position.xy * 2.0, 0.9999, 1.0); }",Re=`uniform vec3 uC; uniform float uA; uniform vec2 uRes;
void main(){
  vec2 s = gl_FragCoord.xy / uRes;
  vec3 c = uC * (1. + .5 * exp(-dot((s - vec2(.66, .55)) * vec2(1.6, 1.), (s - vec2(.66, .55)) * vec2(1.6, 1.)) * 3.));
  gl_FragColor = vec4(c, uA);
  #include <colorspace_fragment>
}`,V=(a,s)=>`/portfolio/yts/img/${a}${s?"-s":""}.webp`;function _e({track:a}){const s=i.useMemo(Ae,[]),g=i.useMemo(()=>[...D.map(t=>V(t.a,!0)),...D.map(t=>V(t.b,!0)),...D.map(t=>`/portfolio/yts/depth/${t.b}.webp`)],[]),v=pe(J,g),{gl:w,camera:l,scene:F}=he(),u=i.useRef([]),y=i.useRef(),x=i.useRef();i.useEffect(()=>{const t=Math.min(8,w.capabilities.getMaxAnisotropy());v.forEach((n,o)=>{o<8?(n.colorSpace=Q,n.anisotropy=t):(n.generateMipmaps=!1,n.minFilter=de),n.needsUpdate=!0;try{w.initTexture(n)}catch{}});const r=y.current;if(r){const n=[];r.traverse(o=>{n.push([o,o.visible]),o.visible=!0});try{w.compile(r,l,F)}catch{}n.forEach(([o,e])=>{o.visible=e})}let f=!1;const M=new J;return(s?0:1)&&D.forEach((n,o)=>["a","b"].forEach(e=>{M.load(V(n[e],!1),m=>{if(f){m.dispose();return}m.colorSpace=Q,m.anisotropy=t;try{w.initTexture(m)}catch{}u.current[o]={...u.current[o]||{},[e]:m}})})),()=>{f=!0}},[v,w,l,F,s]);const A=i.useMemo(()=>({uC:{value:Me},uA:{value:0},uRes:{value:new O(1,1)}}),[]),P=i.useRef({on:!1,cam:0,r:[0,0,0,0],op:0,t:0}),U=i.useRef({c:0,wasActive:!1,op:0});return te((t,r)=>{const f=a.current,M=y.current,h=P.current;if(h.jump=!h.on&&f.on,h.on=f.on,!M)return;if(M.visible=f.on,!f.on){U.current.wasActive=!1;return}r=Math.min(r,1/20),h.t+=r;const n=Math.min(f.p,.9999)*4;for(let c=0;c<4;c++)h.r[c]=R(.04,c===3?.5:.7,n-c);let o=0;for(let c=0;c<3;c++)o+=R(.76,1,n-c);const e=U.current;if(e.c=e.wasActive?S(e.c,o,4,r):o,h.cam=e.c,e.op=S(e.op,R(.1,.45,f.v),6,r),h.op=e.op,A.uA.value=I.active==="sketch"?1:0,x.current.visible=A.uA.value>0,t.gl.getDrawingBufferSize(A.uRes.value),I.active!=="sketch"){e.wasActive=!1;return}const m=t.size.width/t.size.height;l.fov!==40&&(l.fov=40,l.updateProjectionMatrix());const k=2*Math.tan(L.degToRad(l.fov/2)),d=Math.min(3,Math.floor(e.c)),C=e.c-d,E=L.lerp(W[d],W[Math.min(3,d+1)],C),b=m>1.05,ne=b?.66:.31,se=b?.48:.72,H=Math.max(B/(ne*k),B*E/(se*m*k)),j=H*k,ce=j*m,ie=b?-.17*ce:0,ue=b?.02*j:.015*j,ve=Math.sin(Math.PI*C);e.rr=S(e.rr??0,h.r[Math.round(e.c)]??0,4,r),e.mx=S(e.mx??0,z.x,2.5,r),e.my=S(e.my??0,z.y,2.5,r);const _=e.rr,$=b?(_-.5)*.5+e.mx*.2:0,K=b?-.15+_*.26+e.my*.1:-.06+_*.12,N=G.x+e.c*ae+ie,Y=G.y+ue,le=N+$,fe=Y+K,me=H+ve*(b?1.4:2.2)-_*(b?.25:.1);l.position.x=le,l.position.z=me,e.y=fe,e.wasActive=!0;const X=I.els.sketch;let T=0;if(X){const c=X.getBoundingClientRect(),q=t.size.height;c.top>0?T=c.top/q:c.bottom<q&&(T=-(q-c.bottom)/q)}h.op=e.op*(1-R(0,.35,-T)),l.position.y=e.y+T*j,ee.set(N+$*.35,Y+T*j+K*.35,0),l.lookAt(ee)}),p.jsxs("group",{ref:y,position:G.toArray(),visible:!1,children:[p.jsxs("mesh",{ref:x,frustumCulled:!1,renderOrder:-5,children:[p.jsx("planeGeometry",{args:[1,1]}),p.jsx("shaderMaterial",{uniforms:A,vertexShader:De,fragmentShader:Re,transparent:!0,depthTest:!1,depthWrite:!1})]}),D.map((t,r)=>p.jsx(Te,{i:r,texA:v[r],texB:v[4+r],texD:v[8+r],state:P,hi:u,mobile:s},r))]})}export{_e as default};
