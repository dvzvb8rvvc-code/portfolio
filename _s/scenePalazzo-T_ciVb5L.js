import{r as A,j as ee}from"./kit-CRmoX2bk.js";import{a as fe,P as te,an as me,V as b,aG as ae,ar as oe,l as ie,u as de,a0 as se,T as he,aQ as xe,f as ge,S as we,h as ye,aR as Be}from"./react-three-fiber.esm-PPrcSziY.js";import{s as B,a as ce}from"./yts-CJpXo2il.js";import"./preload-helper-BDQy5SUP.js";import"./index-DembSkzf.js";const Y=ce.ids,z=ce.tr,H=40,re=5,Me=1.14,Ae={145:{amt:.42,z:[1,1.13],L:[[.5,.62],[.58,.5]],P:[[.66,.5],[.76,.5]],r:[0,0]},148:{amt:.6,z:[1.02,1.16],L:[[.5,.5],[.5,.7]],P:[[.46,.5],[.54,.5]],r:[0,0]},156:{amt:.62,z:[1.02,1.15],L:[[.5,.4],[.5,.56]],P:[[.4,.5],[.5,.5]],r:[0,0]},157:{amt:.58,z:[1.02,1.15],L:[[.5,.36],[.5,.52]],P:[[.42,.5],[.52,.5]],r:[0,0]},152:{amt:.6,z:[1,1.1],zp:[1,1.32],L:[[.5,.3],[.5,1]],P:[[.5,.36],[.5,1]],r:[0,0],tilt:1},154:{amt:.28,z:[1.12,1.07],L:[[.5,0],[.5,.56]],P:[[.5,0],[.5,.56]],r:[0,.07],up:1}},le=`
float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
  return mix(mix(h21(i), h21(i+vec2(1.,0.)), f.x), mix(h21(i+vec2(0.,1.)), h21(i+vec2(1.,1.)), f.x), f.y); }
float fbm(vec2 p){ float a = .5, s = 0.; for(int i = 0; i < 4; i++){ s += a * vn(p); p = p * 2.03 + 17.1; a *= .5; } return s / .9375; }
uniform float uPlane;
// cover (+zoom, pan, rotation) → texture coords (textures are uploaded top-down: flipY = false)
vec2 tc(vec2 uv, vec4 c, vec2 r){
  vec2 q = uv - .5; q.x *= uPlane; q = mat2(r.x, r.y, -r.y, r.x) * q; q.x /= uPlane; q += .5;
  vec2 t = q * c.xy + c.zw; return vec2(t.x, 1. - t.y);
}`,be=`
uniform sampler2D uDA, uDB; uniform vec4 uCA, uCB; uniform vec2 uRA, uRB;
uniform float uMix, uAmtA, uAmtB, uTime, uBend; uniform mat4 uVP;
varying vec2 vUv; varying float vD;
${le}
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
}`,ze=`
uniform sampler2D uA, uB, uDB; uniform vec4 uCA, uCB; uniform vec2 uRA, uRB, uTA, uTB, uClip, uRes;
uniform float uMix, uTime, uSharp, uSweep, uLive, uExit;
varying vec2 vUv; varying float vD;
${le}
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
}`,j=(t,a=0,n=1)=>Math.min(n,Math.max(a,t)),W=(t,a,n)=>j((t-a)/(n-a)),ue=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2,V=(t,a,n)=>t+(a-t)*n,F=se.damp,x={started:!1,items:{},upload:[]},_=new ie(new Uint8Array([11,10,8,255]),1,1);_.needsUpdate=!0;const U=new ie(new Uint8Array([0,0,0,255]),1,1);U.needsUpdate=!0;function Ce(t){return typeof createImageBitmap=="function"?fetch(t).then(a=>{if(!a.ok)throw new Error(t);return a.blob()}).then(a=>createImageBitmap(a)):new Promise((a,n)=>{const r=new Image;r.decoding="async",r.onload=()=>(r.decode?r.decode().catch(()=>{}):Promise.resolve()).then(()=>a(r)),r.onerror=n,r.src=t})}function Pe(t,a){if(x.started)return;x.started=!0;const n=Math.min(8,t.capabilities.getMaxAnisotropy()),r=[];Y.forEach(i=>{x.items[i]={c:null,d:null,a:1,w:1,h:1},r.push([i,"c",`/portfolio/yts/img/${i}${a?"-xl":""}.webp`],[i,"d",`/portfolio/yts/depth/${i}${a?"-xl":""}.webp`])});let g=0;const p=()=>{for(;g<2&&r.length;){const[i,d,o]=r.shift();g++,Ce(o).then(C=>{const s=new he(C);if(s.flipY=!1,s.generateMipmaps=!0,s.minFilter=xe,s.magFilter=ge,d==="c"){s.colorSpace=we,s.anisotropy=n;const D=x.items[i];D.w=C.width,D.h=C.height,D.a=C.width/C.height}else s.format=ye,s.colorSpace=Be;s.needsUpdate=!0,x.upload.push([i,d,s])}).catch(()=>{}).finally(()=>{g--,p()})}};p()}function Re(t,a,n,r,g){let p=1,i=1;return n>a?i=a/n:p=n/a,p/=r,i/=r,t.set(p,i,(1-p)*j(g[0]),(1-i)*j(g[1]))}const Te=(t,a)=>W(a,t===0?-.1:z[t-1][0],t===Y.length-1?1.04:z[t][1]),I={x:0,y:0};let ne=!1;function De(){ne||typeof window>"u"||(ne=!0,window.addEventListener("pointermove",t=>{t.pointerType!=="touch"&&(I.x=t.clientX/innerWidth*2-1,I.y=-(t.clientY/innerHeight*2-1))},{passive:!0}))}const O=B.palazzo=B.palazzo||{};typeof window<"u"&&(window.__ytsPalazzo=O);function Ve({track:t}){const{size:a,gl:n}=fe(),r=A.useRef(),g=a.width<a.height,p=a.width<=768,i=A.useMemo(()=>g?new te(1,1,72,128):new te(1,1,320,200),[g]);A.useEffect(()=>(De(),()=>i.dispose()),[i]);const d=A.useMemo(()=>new me(H,1,.05,50),[]),o=A.useMemo(()=>({uA:{value:_},uB:{value:_},uDA:{value:U},uDB:{value:U},uCA:{value:new oe(1,1,0,0)},uCB:{value:new oe(1,1,0,0)},uRA:{value:new b(1,0)},uRB:{value:new b(1,0)},uTA:{value:new b(.001,.001)},uTB:{value:new b(.001,.001)},uMix:{value:0},uAmtA:{value:.5},uAmtB:{value:.5},uTime:{value:0},uPlane:{value:1.6},uBend:{value:0},uSharp:{value:.3},uSweep:{value:-1},uLive:{value:0},uExit:{value:0},uVP:{value:new ae},uNdc:{value:new b(1,0)},uClip:{value:new b(-2,-1)},uRes:{value:new b(1,1)}}),[]),C=A.useRef({t:0,frames:0,p1:0,p2:0,wasOn:!1,px:0,py:0,live:0}),s=A.useMemo(()=>new b,[]),D=A.useMemo(()=>new ae,[]),N=(P,f,e,q,R,v)=>{const w=Y[f],c=Ae[w],h=x.items[w],u=Te(f,e),l=h&&h.c&&h.d;o["u"+P].value=l?h.c:_,o["uD"+P].value=l?h.d:U;const M=R&&c.zp?c.zp:c.z,E=1+.006*Math.sin(v*.21+f*1.7),S=V(M[0],M[1],u)*E,T=R?c.P:c.L,y=c.tilt?u*u*(1.6-.6*u):c.up?1-Math.pow(1-u,2.2):u,L=[V(T[0][0],T[1][0],y),V(T[0][1],T[1][1],y)];Re(o["uC"+P].value,l?h.a:1,q,S,L);const k=V(c.r[0],c.r[1],y)+(c.up?.006*Math.sin(v*.17):0);return o["uR"+P].value.set(Math.cos(k),Math.sin(k)),o["uT"+P].value.set(1/(l?h.w:1),1/(l?h.h:1)),o["uAmt"+P].value=c.amt*(p?.85:1)*(.8+.5*u),l};return de((P,f)=>{const e=C.current,q=t.current;if(f=Math.min(f,1/20),e.t+=f,!r.current)return;if(x.upload.length){const[m,ve,Z]=x.upload.shift();try{n.initTexture(Z)}catch{}x.items[m][ve]=Z}const R=B.palazzoFrame;if(x.started||(R&&R.getBoundingClientRect().top<a.height*3||B.hero&&B.hero.ready&&e.t>2.5||e.t>6)&&Pe(n,!p),++e.frames<20){r.current.visible=!0,o.uClip.value.set(-2,-1);return}const v=R&&R.getBoundingClientRect(),w=a.height,c=q.on&&v&&v.bottom>0&&v.top<w;if(r.current.visible=!!c,!c){e.wasOn=!1;return}const h=O.p!=null?O.p:q.p;(!e.wasOn||O.snap)&&(e.p1=e.p2=h,e.entry=!0),e.wasOn=!0,e.p1=F(e.p1,h,4,f),e.p2=F(e.p2,e.p1,9,f);const u=e.p2;B.palazzoLive=performance.now(),B.palazzoMV&&Math.abs(B.palazzoMV.get()-u)>1e-5&&B.palazzoMV.set(u);const l=v.width/Math.max(v.height,1),M=l<1;n.getDrawingBufferSize(s);const E=s.y/w;o.uRes.value.copy(s);const S=v.top;o.uClip.value.set((w-S-v.height)*E-.5,(w-S)*E+.5);const T=v.height/w;o.uNdc.value.set(T,1-2*S/w-T),o.uPlane.value=l,o.uExit.value=Math.pow(j(-v.top/v.height),1.3)*.85;let y=0,L=0,k=0;for(let m=0;m<z.length;m++){if(u>=z[m][1]){y=L=m+1;continue}u>z[m][0]&&(y=m,L=m+1,k=ue(W(u,z[m][0],z[m][1])));break}const $=N("A",y,u,l,M,e.t),X=L!==y?N("B",L,u,l,M,e.t):(N("B",y,u,l,M,e.t),$);o.uMix.value=k,o.uTime.value=e.t,o.uSharp.value=p?.14:.2,o.uSweep.value=-.5+u*2.2+Math.sin(e.t*.05)*.15,e.live=e.entry&&$&&X?1:F(e.live,$&&X?1:0,3,f),e.entry=!1,o.uLive.value=e.live;const G=ue(W(u,z[3][1],1));o.uBend.value=G*(M?.45:.6),e.px=F(e.px,p?0:I.x,2.2,f),e.py=F(e.py,p?0:I.y,2.2,f);const Q=Math.sin(e.t*.13)*(M?.05:.12)+e.px*.24,J=Math.sin(e.t*.097+1.3)*.06+e.py*.13,pe=re-.55*u;d.aspect=l,d.fov=H,d.position.set(Q,J-.1*G,pe),d.lookAt(Q*.4,J*.4+.22*G,0),d.updateProjectionMatrix(),d.updateMatrixWorld(),D.set(1,0,0,0,0,o.uNdc.value.x,0,o.uNdc.value.y,0,0,1,0,0,0,0,1),o.uVP.value.multiplyMatrices(D,d.projectionMatrix).multiply(d.matrixWorldInverse);const K=2*re*Math.tan(se.degToRad(H/2))*Me;r.current.scale.set(K*l,K,1)}),ee.jsx("mesh",{ref:r,geometry:i,frustumCulled:!1,renderOrder:100,children:ee.jsx("shaderMaterial",{uniforms:o,vertexShader:be,fragmentShader:ze,transparent:!0,depthTest:!1,depthWrite:!1})})}export{Ve as default};
