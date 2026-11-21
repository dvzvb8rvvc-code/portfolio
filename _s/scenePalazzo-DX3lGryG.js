import{r as b,j as Z}from"./kit-D8JZ_7uo.js";import{a as ve,P as ee,an as fe,V as z,aG as te,ar as ae,l as ne,u as me,a0 as ie,T as de,aQ as he,f as xe,S as ge,h as we,aR as ye}from"./react-three-fiber.esm-CpCVEERV.js";import{s as B,a as se}from"./yts-Dx2Uh5WU.js";import"./preload-helper-BDQy5SUP.js";import"./index-DgIAGOya.js";const W=se.ids,C=se.tr,G=40,oe=5,Be=1.14,Me={145:{amt:.42,z:[1,1.13],L:[[.5,.62],[.58,.5]],P:[[.66,.5],[.76,.5]],r:[0,0]},148:{amt:.6,z:[1.02,1.16],L:[[.5,.5],[.5,.7]],P:[[.46,.5],[.54,.5]],r:[0,0]},156:{amt:.62,z:[1.02,1.15],L:[[.5,.4],[.5,.56]],P:[[.4,.5],[.5,.5]],r:[0,0]},157:{amt:.58,z:[1.02,1.15],L:[[.5,.36],[.5,.52]],P:[[.42,.5],[.52,.5]],r:[0,0]},152:{amt:.6,z:[1,1.1],zp:[1,1.32],L:[[.5,.3],[.5,1]],P:[[.5,.36],[.5,1]],r:[0,0],tilt:1},154:{amt:.28,z:[1.12,1.07],L:[[.5,0],[.5,.56]],P:[[.5,0],[.5,.56]],r:[0,.07],up:1}},ce=`
float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
  return mix(mix(h21(i), h21(i+vec2(1.,0.)), f.x), mix(h21(i+vec2(0.,1.)), h21(i+vec2(1.,1.)), f.x), f.y); }
float fbm(vec2 p){ float a = .5, s = 0.; for(int i = 0; i < 4; i++){ s += a * vn(p); p = p * 2.03 + 17.1; a *= .5; } return s / .9375; }
uniform float uPlane;
// cover (+zoom, pan, rotation) → texture coords (textures are uploaded top-down: flipY = false)
vec2 tc(vec2 uv, vec4 c, vec2 r){
  vec2 q = uv - .5; q.x *= uPlane; q = mat2(r.x, r.y, -r.y, r.x) * q; q.x /= uPlane; q += .5;
  vec2 t = q * c.xy + c.zw; return vec2(t.x, 1. - t.y);
}`,Ae=`
uniform sampler2D uDA, uDB; uniform vec4 uCA, uCB; uniform vec2 uRA, uRB;
uniform float uMix, uAmtA, uAmtB, uTime, uBend; uniform mat4 uVP;
varying vec2 vUv; varying float vD;
${ce}
void main(){
  vUv = uv;
  // mip-softened depth for the geometry: silhouettes stretch over a soft ramp instead of tearing
  float dA = textureLod(uDA, tc(uv, uCA, uRA), 2.6).r;
  float dB = textureLod(uDB, tc(uv, uCB, uRB), 2.6).r;
  float n = fbm(uv * vec2(uPlane, 1.) * 1.3 + vec2(0., uTime * .015));
  float f = clamp(n * .55 + (1. - dB) * .45, 0., 1.);
  float k = smoothstep(f - .22, f + .22, uMix * 1.44 - .22);
  float band = 1. - abs(2. * k - 1.);
  vD = mix(dA, dB, k);
  vec3 p = position;
  float top = max(uv.y - .18, 0.) / .82;
  p.z += mix(dA * uAmtA, dB * uAmtB, k) + band * .05 + uBend * top * top;
  gl_Position = uVP * modelMatrix * vec4(p, 1.);   // uVP also maps the virtual viewport onto the sticky frame
}`,be=`
uniform sampler2D uA, uB, uDB; uniform vec4 uCA, uCB; uniform vec2 uRA, uRB, uTA, uTB, uClip, uRes;
uniform float uMix, uTime, uSharp, uSweep, uLive, uExit;
varying vec2 vUv; varying float vD;
${ce}
vec3 tex(sampler2D s, vec2 t, vec2 px){
  vec3 c = texture2D(s, t).rgb;
  vec3 b = texture2D(s, t + vec2(px.x, 0.)).rgb + texture2D(s, t - vec2(px.x, 0.)).rgb
         + texture2D(s, t + vec2(0., px.y)).rgb + texture2D(s, t - vec2(0., px.y)).rgb;
  return max(c + (c - b * .25) * uSharp, 0.);
}
vec3 grade(vec3 c){
  float l = dot(c, vec3(.2126, .7152, .0722));
  c = mix(vec3(l), c, .86);
  c *= mix(vec3(.92, .95, 1.02), vec3(1.07, 1., .87), smoothstep(.04, .6, l));
  c = c * .94 + vec3(.0105, .0088, .0066);
  return c;
}
void main(){
  if (gl_FragCoord.y < uClip.x || gl_FragCoord.y > uClip.y) discard;
  vec2 uv = vUv, q = uv * vec2(uPlane, 1.);
  float front = uMix * 1.44 - .22;
  float dB = textureLod(uDB, tc(uv, uCB, uRB), 1.2).r;
  float n = fbm(q * 1.3 + vec2(0., uTime * .015));
  float n2 = fbm(q * 4.4 - vec2(uTime * .025, 0.));
  float f = clamp(n * .55 + (1. - dB) * .45, 0., 1.) + (n2 - .5) * .09;
  float wide = 1. - abs(2. * smoothstep(f - .22, f + .22, front) - 1.);   // broad flow zone
  float k = smoothstep(f - .05, f + .05, front);                           // ink edge
  vec2 flow = vec2(fbm(q * 2.1 + 3.1 + uTime * .03), fbm(q * 2.1 - 7.3 - uTime * .03)) - .5;
  vec3 a = tex(uA, tc(uv + flow * wide * .028, uCA, uRA), uTA);
  vec3 b = uMix > .0005 ? tex(uB, tc(uv - flow * wide * .022, uCB, uRB), uTB) : a;
  vec3 c = mix(a, b, k);
  float edge = 1. - abs(2. * k - 1.);
  c *= 1. - wide * .1 - edge * .18;                                        // wet, darker ink edge
  c += vec3(1., .76, .44) * pow(edge, 4.) * .06;                           // faint gold rim
  // slow warm light sweep riding the depth (lights only what is lit)
  float sw = exp(-pow((uv.x * .8 + uv.y * .5 - uSweep + vD * .25) * 2.6, 2.));
  c += c * vec3(1., .86, .66) * sw * .16;
  c = grade(c);
  vec2 s = vec2(gl_FragCoord.x / uRes.x, (gl_FragCoord.y - uClip.x) / max(uClip.y - uClip.x, 1.));
  c *= mix(1., 1. - smoothstep(.32, 1.2, length((s - .5) * vec2(1.15, 1.))), .6);
  float g = h21(gl_FragCoord.xy + fract(uTime * 7.31) * 113.) - .5;
  c += g * .024 * (.35 + sqrt(max(c.g, 0.)));
  c = mix(vec3(.0043, .0037, .0027), c, uLive * (1. - uExit));
  gl_FragColor = vec4(max(c, 0.), 1.);
  #include <colorspace_fragment>
}`,j=(t,a=0,n=1)=>Math.min(n,Math.max(a,t)),H=(t,a,n)=>j((t-a)/(n-a)),re=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2,V=(t,a,n)=>t+(a-t)*n,S=ie.damp,g={started:!1,items:{},upload:[]},_=new ne(new Uint8Array([11,10,8,255]),1,1);_.needsUpdate=!0;const U=new ne(new Uint8Array([0,0,0,255]),1,1);U.needsUpdate=!0;function ze(t){return typeof createImageBitmap=="function"?fetch(t).then(a=>{if(!a.ok)throw new Error(t);return a.blob()}).then(a=>createImageBitmap(a)):new Promise((a,n)=>{const r=new Image;r.decoding="async",r.onload=()=>(r.decode?r.decode().catch(()=>{}):Promise.resolve()).then(()=>a(r)),r.onerror=n,r.src=t})}function Ce(t,a){if(g.started)return;g.started=!0;const n=Math.min(8,t.capabilities.getMaxAnisotropy()),r=[];W.forEach(i=>{g.items[i]={c:null,d:null,a:1,w:1,h:1},r.push([i,"c",`/portfolio/yts/img/${i}${a?"-xl":""}.webp`],[i,"d",`/portfolio/yts/depth/${i}${a?"-xl":""}.webp`])});let w=0;const v=()=>{for(;w<2&&r.length;){const[i,d,o]=r.shift();w++,ze(o).then(P=>{const c=new de(P);if(c.flipY=!1,c.generateMipmaps=!0,c.minFilter=he,c.magFilter=xe,d==="c"){c.colorSpace=ge,c.anisotropy=n;const D=g.items[i];D.w=P.width,D.h=P.height,D.a=P.width/P.height}else c.format=we,c.colorSpace=ye;c.needsUpdate=!0,g.upload.push([i,d,c])}).catch(()=>{}).finally(()=>{w--,v()})}};v()}function Pe(t,a,n,r,w){let v=1,i=1;return n>a?i=a/n:v=n/a,v/=r,i/=r,t.set(v,i,(1-v)*j(w[0]),(1-i)*j(w[1]))}const Re=(t,a)=>H(a,t===0?-.1:C[t-1][0],t===W.length-1?1.04:C[t][1]),I={x:0,y:0};let ue=!1;function Te(){ue||typeof window>"u"||(ue=!0,window.addEventListener("pointermove",t=>{t.pointerType!=="touch"&&(I.x=t.clientX/innerWidth*2-1,I.y=-(t.clientY/innerHeight*2-1))},{passive:!0}))}const O=B.palazzo=B.palazzo||{};typeof window<"u"&&(window.__ytsPalazzo=O);function Ee({track:t}){const{size:a,gl:n}=ve(),r=b.useRef(),w=a.width<a.height,v=a.width<=768,i=b.useMemo(()=>w?new ee(1,1,72,128):new ee(1,1,320,200),[w]);b.useEffect(()=>(Te(),()=>i.dispose()),[i]);const d=b.useMemo(()=>new fe(G,1,.05,50),[]),o=b.useMemo(()=>({uA:{value:_},uB:{value:_},uDA:{value:U},uDB:{value:U},uCA:{value:new ae(1,1,0,0)},uCB:{value:new ae(1,1,0,0)},uRA:{value:new z(1,0)},uRB:{value:new z(1,0)},uTA:{value:new z(.001,.001)},uTB:{value:new z(.001,.001)},uMix:{value:0},uAmtA:{value:.5},uAmtB:{value:.5},uTime:{value:0},uPlane:{value:1.6},uBend:{value:0},uSharp:{value:.3},uSweep:{value:-1},uLive:{value:0},uExit:{value:0},uVP:{value:new te},uNdc:{value:new z(1,0)},uClip:{value:new z(-2,-1)},uRes:{value:new z(1,1)}}),[]),P=b.useRef({t:0,frames:0,p1:0,p2:0,wasOn:!1,px:0,py:0,live:0}),c=b.useMemo(()=>new z,[]),D=b.useMemo(()=>new te,[]),N=(R,f,e,k,T,s)=>{const y=W[f],l=Me[y],h=g.items[y],u=Re(f,e),p=h&&h.c&&h.d;o["u"+R].value=p?h.c:_,o["uD"+R].value=p?h.d:U;const M=T&&l.zp?l.zp:l.z,F=1+.006*Math.sin(s*.21+f*1.7),q=V(M[0],M[1],u)*F,x=T?l.P:l.L,A=l.tilt?u*u*(1.6-.6*u):l.up?1-Math.pow(1-u,2.2):u,E=[V(x[0][0],x[1][0],A),V(x[0][1],x[1][1],A)];Pe(o["uC"+R].value,p?h.a:1,k,q,E);const L=V(l.r[0],l.r[1],A)+(l.up?.006*Math.sin(s*.17):0);return o["uR"+R].value.set(Math.cos(L),Math.sin(L)),o["uT"+R].value.set(1/(p?h.w:1),1/(p?h.h:1)),o["uAmt"+R].value=l.amt*(v?.85:1)*(.8+.5*u),p};return me((R,f)=>{const e=P.current,k=t.current;if(f=Math.min(f,1/20),e.t+=f,!r.current)return;if(g.upload.length){const[m,pe,K]=g.upload.shift();try{n.initTexture(K)}catch{}g.items[m][pe]=K}const T=B.palazzoFrame;if(g.started||(T&&T.getBoundingClientRect().top<a.height*3||B.hero&&B.hero.ready&&e.t>2.5||e.t>6)&&Ce(n,!v),++e.frames<20){r.current.visible=!0,o.uClip.value.set(-2,-1);return}const s=T&&T.getBoundingClientRect(),y=a.height,l=k.on&&s&&s.bottom>0&&s.top<y;if(r.current.visible=!!l,!l){e.wasOn=!1;return}const h=O.p!=null?O.p:k.p;(!e.wasOn||O.snap)&&(e.p1=e.p2=h,e.entry=!0),e.wasOn=!0,e.p1=S(e.p1,h,4,f),e.p2=S(e.p2,e.p1,9,f);const u=e.p2;B.palazzoLive=performance.now(),B.palazzoMV&&Math.abs(B.palazzoMV.get()-u)>1e-5&&B.palazzoMV.set(u);const p=s.width/Math.max(s.height,1),M=p<1;n.getDrawingBufferSize(c);const F=c.y/y;o.uRes.value.copy(c),o.uClip.value.set((y-s.top-s.height)*F-.5,(y-s.top)*F+.5);const q=s.height/y;o.uNdc.value.set(q,1-2*s.top/y-q),o.uPlane.value=p,o.uExit.value=Math.pow(j(-s.top/s.height),1.3)*.85;let x=0,A=0,E=0;for(let m=0;m<C.length;m++){if(u>=C[m][1]){x=A=m+1;continue}u>C[m][0]&&(x=m,A=m+1,E=re(H(u,C[m][0],C[m][1])));break}const L=N("A",x,u,p,M,e.t),Y=A!==x?N("B",A,u,p,M,e.t):(N("B",x,u,p,M,e.t),L);o.uMix.value=E,o.uTime.value=e.t,o.uSharp.value=v?.14:.2,o.uSweep.value=-.5+u*2.2+Math.sin(e.t*.05)*.15,e.live=e.entry&&L&&Y?1:S(e.live,L&&Y?1:0,3,f),e.entry=!1,o.uLive.value=e.live;const $=re(H(u,C[3][1],1));o.uBend.value=$*(M?.45:.6),e.px=S(e.px,v?0:I.x,2.2,f),e.py=S(e.py,v?0:I.y,2.2,f);const X=Math.sin(e.t*.13)*(M?.05:.12)+e.px*.24,Q=Math.sin(e.t*.097+1.3)*.06+e.py*.13,le=oe-.55*u;d.aspect=p,d.fov=G,d.position.set(X,Q-.1*$,le),d.lookAt(X*.4,Q*.4+.22*$,0),d.updateProjectionMatrix(),d.updateMatrixWorld(),D.set(1,0,0,0,0,o.uNdc.value.x,0,o.uNdc.value.y,0,0,1,0,0,0,0,1),o.uVP.value.multiplyMatrices(D,d.projectionMatrix).multiply(d.matrixWorldInverse);const J=2*oe*Math.tan(ie.degToRad(G/2))*Be;r.current.scale.set(J*p,J,1)}),Z.jsx("mesh",{ref:r,geometry:i,frustumCulled:!1,renderOrder:100,children:Z.jsx("shaderMaterial",{uniforms:o,vertexShader:Ae,fragmentShader:be,transparent:!0,depthTest:!1,depthWrite:!1})})}export{Ee as default};
