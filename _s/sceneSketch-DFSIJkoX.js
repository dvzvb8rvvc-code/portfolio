import{r as c,j as p}from"./kit-D8JZ_7uo.js";import{y as pe,aI as X,a as he,S as J,f as de,V as q,b as ge,u as ee,a0 as V,x as te,P as xe,a3 as be}from"./react-three-fiber.esm-CpCVEERV.js";import{P as D,s as z}from"./yts-Dx2Uh5WU.js";import"./preload-helper-BDQy5SUP.js";import"./index-DgIAGOya.js";const I=new te(-120,40,0),oe=8,B=2.6,L=[.78,1.25,.95,1.33],we=[.5,.42,.55,.42],ye=[1,0,0,0],Me=new ge("#0b0a08"),Ae=()=>typeof window<"u"&&window.innerWidth<=768,R=(o,s,g)=>{const v=Math.min(1,Math.max(0,(g-o)/(s-o)));return v*v*(3-2*v)},S=V.damp,O={x:0,y:0};typeof window<"u"&&window.addEventListener("pointermove",o=>{o.pointerType!=="touch"&&(O.x=o.clientX/innerWidth*2-1,O.y=-(o.clientY/innerHeight*2-1))},{passive:!0});const ae=`
float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
  return mix(mix(h21(i), h21(i+vec2(1.,0.)), f.x), mix(h21(i+vec2(0.,1.)), h21(i+vec2(1.,1.)), f.x), f.y); }
float fbm(vec2 p){ float a = .5, s = 0.; for(int i = 0; i < 4; i++){ s += a * vn(p); p = p * 2.03 + 17.1; a *= .5; } return s / .9375; }
`,ke=`
uniform sampler2D uDepth; uniform vec2 uCovB; uniform float uAmount, uMix, uTime, uFa;
varying vec2 vUv; varying float vD;
${ae}
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
${ae}
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
}`,Ce="varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",Te=`
uniform float uA; uniform vec2 uK; varying vec2 vUv;
void main(){
  vec2 p = (vUv - .5) * uK;
  vec2 d = max(abs(p) - .5, 0.);
  float s = exp(-dot(d, d) * 26.);
  gl_FragColor = vec4(vec3(.76, .6, .36) * s * uA, 1.);
}`,Q=(o,s)=>o>s?new q(s/o,1):new q(1,o/s);function je({i:o,texA:s,texB:g,texD:v,state:w,hi:l,mobile:F}){const i=L[o],y=B*i,x=F?96:200,A=c.useMemo(()=>new xe(y,B,i>=1?x:Math.round(x*i),i>=1?Math.round(x/i):x),[y,x,i]),P=s.image.width/s.image.height,U=g.image.width/g.image.height,t=c.useMemo(()=>({uA:{value:s},uB:{value:g},uDepth:{value:v},uCovA:{value:Q(P,i)},uCovB:{value:Q(U,i)},uFa:{value:i},uAmount:{value:we[o]},uMix:{value:0},uOpacity:{value:1},uSweep:{value:-1},uSketch:{value:ye[o]},uTime:{value:0}}),[s,g,v]),r=c.useMemo(()=>({uA:{value:0},uK:{value:new q(1.9,1.9)}}),[]),h=c.useRef(),M=c.useRef();return ee((d,n)=>{const a=w.current;if(!a.on)return;const e=h.current,f=Math.abs(a.cam-o)<1.2;if(e.visible=f,!f)return;const m=l.current[o];m&&(m.a&&t.uA.value!==m.a&&(t.uA.value=m.a),m.b&&t.uB.value!==m.b&&(t.uB.value=m.b)),n=Math.min(n,1/20);const k=S(t.uMix.value,a.r[o],4,n);t.uMix.value=k,t.uTime.value=a.t,t.uSweep.value=(a.t*.075+o*.37)%1.9-.45,t.uOpacity.value=a.op;const C=R(.15,1,k);M.current.position.z=C*.12,r.uA.value=(.05+C*.1)*a.op}),p.jsxs("group",{ref:h,position:[o*oe,0,0],children:[p.jsxs("mesh",{renderOrder:1,position:[0,0,-.02],children:[p.jsx("planeGeometry",{args:[y*1.9,B*1.9]}),p.jsx("shaderMaterial",{uniforms:r,vertexShader:Ce,fragmentShader:Te,transparent:!0,depthWrite:!1,blending:be})]}),p.jsx("group",{ref:M,children:p.jsx("mesh",{geometry:A,renderOrder:2,children:p.jsx("shaderMaterial",{uniforms:t,vertexShader:ke,fragmentShader:Se,transparent:!0})})})]})}const Z=new te,De="void main(){ gl_Position = vec4(position.xy * 2.0, 0.9999, 1.0); }",Re=`uniform vec3 uC; uniform float uA; uniform vec2 uRes;
void main(){
  vec2 s = gl_FragCoord.xy / uRes;
  vec3 c = uC * (1. + .5 * exp(-dot((s - vec2(.66, .55)) * vec2(1.6, 1.), (s - vec2(.66, .55)) * vec2(1.6, 1.)) * 3.));
  gl_FragColor = vec4(c, uA);
  #include <colorspace_fragment>
}`,G=(o,s)=>`/portfolio/yts/img/${o}${s?"-s":""}.webp`;function _e({track:o}){const s=c.useMemo(Ae,[]),g=c.useMemo(()=>[...D.map(t=>G(t.a,!0)),...D.map(t=>G(t.b,!0)),...D.map(t=>`/portfolio/yts/depth/${t.b}.webp`)],[]),v=pe(X,g),{gl:w,camera:l,scene:F}=he(),i=c.useRef([]),y=c.useRef(),x=c.useRef();c.useEffect(()=>{const t=Math.min(8,w.capabilities.getMaxAnisotropy());v.forEach((n,a)=>{a<8?(n.colorSpace=J,n.anisotropy=t):(n.generateMipmaps=!1,n.minFilter=de),n.needsUpdate=!0;try{w.initTexture(n)}catch{}});const r=y.current;if(r){const n=[];r.traverse(a=>{n.push([a,a.visible]),a.visible=!0});try{w.compile(r,l,F)}catch{}n.forEach(([a,e])=>{a.visible=e})}let h=!1;const M=new X;return(s?0:1)&&D.forEach((n,a)=>["a","b"].forEach(e=>{M.load(G(n[e],!1),f=>{if(h){f.dispose();return}f.colorSpace=J,f.anisotropy=t;try{w.initTexture(f)}catch{}i.current[a]={...i.current[a]||{},[e]:f}})})),()=>{h=!0}},[v,w,l,F,s]);const A=c.useMemo(()=>({uC:{value:Me},uA:{value:0},uRes:{value:new q(1,1)}}),[]),P=c.useRef({on:!1,cam:0,r:[0,0,0,0],op:0,t:0}),U=c.useRef({c:0,wasActive:!1,op:0});return ee((t,r)=>{const h=o.current,M=y.current,d=P.current;if(d.on=h.on,!M)return;if(M.visible=h.on,!h.on){U.current.wasActive=!1;return}r=Math.min(r,1/20),d.t+=r;const n=Math.min(h.p,.9999)*4;for(let u=0;u<4;u++)d.r[u]=R(.04,.7,n-u);let a=0;for(let u=0;u<3;u++)a+=R(.76,1,n-u);const e=U.current;if(e.c=e.wasActive?S(e.c,a,4,r):a,d.cam=e.c,e.op=S(e.op,R(.15,.6,h.v),6,r),d.op=e.op,A.uA.value=z.active==="sketch"?1:0,x.current.visible=A.uA.value>0,t.gl.getDrawingBufferSize(A.uRes.value),z.active!=="sketch"){e.wasActive=!1;return}const f=t.size.width/t.size.height;l.fov!==40&&(l.fov=40,l.updateProjectionMatrix());const m=2*Math.tan(V.degToRad(l.fov/2)),k=Math.min(3,Math.floor(e.c)),C=e.c-k,re=V.lerp(L[k],L[Math.min(3,k+1)],C),b=f>1.05,ne=b?.66:.31,se=b?.48:.72,W=Math.max(B/(ne*m),B*re/(se*f*m)),T=W*m,ce=T*f,ie=b?-.17*ce:0,ue=b?.02*T:.015*T,ve=Math.sin(Math.PI*C);e.rr=S(e.rr??0,d.r[Math.round(e.c)]??0,4,r),e.mx=S(e.mx??0,O.x,2.5,r),e.my=S(e.my??0,O.y,2.5,r);const E=e.rr,H=b?(E-.5)*.5+e.mx*.2:0,$=b?-.15+E*.26+e.my*.1:-.06+E*.12,K=I.x+e.c*oe+ie,N=I.y+ue,le=K+H,fe=N+$,me=W+ve*(b?1.4:2.2)-E*(b?.25:.1);l.position.x=le,l.position.z=me,e.y=fe,e.wasActive=!0;const Y=z.els.sketch;let j=0;if(Y){const u=Y.getBoundingClientRect(),_=t.size.height;u.top>0?j=u.top/_:u.bottom<_&&(j=-(_-u.bottom)/_)}d.op=e.op*(1-R(.05,.45,-j)),l.position.y=e.y+j*T,Z.set(K+H*.35,N+j*T+$*.35,0),l.lookAt(Z)}),p.jsxs("group",{ref:y,position:I.toArray(),visible:!1,children:[p.jsxs("mesh",{ref:x,frustumCulled:!1,renderOrder:-5,children:[p.jsx("planeGeometry",{args:[1,1]}),p.jsx("shaderMaterial",{uniforms:A,vertexShader:De,fragmentShader:Re,transparent:!0,depthTest:!1,depthWrite:!1})]}),D.map((t,r)=>p.jsx(je,{i:r,texA:v[r],texB:v[4+r],texD:v[8+r],state:P,hi:i,mobile:s},r))]})}export{_e as default};
