import{r as d,j as A}from"./kit-CKF0FlHv.js";import{y as ne,aI as se,S as ie,f as ce,a as le,P as Y,b as _,V as J,x as M,u as ue,a0 as te,au as ve,ac as B,ab as pe}from"./react-three-fiber.esm-BIG1fDkD.js";import{s as me}from"./yts-B_MjdFcx.js";import"./preload-helper-BDQy5SUP.js";import"./index-Dah_BPzX.js";const fe="/portfolio/yts/img/30-s.webp",de="/portfolio/yts/img/5.webp",he="/portfolio/yts/img/5-s.webp",ge="/portfolio/yts/depth/5.webp",H=2.9,I=H*1.25,Z=.85,N=3.05,xe="vec2(96., 120.)",R=new M((.47-.5)*H,(.44-.5)*I,.42),V=`float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float cellN(vec2 uv){ return h21(floor(uv * ${xe})) * .7 + (1. - uv.y) * .3; }`,we=`
attribute vec3 aSketch; attribute vec2 aUv; attribute vec4 aRnd;
uniform float uTime, uIntro, uPhoto, uSolid, uSize, uScale, uDepthAmt, uGrow;
uniform vec2 uWH; uniform vec3 uInk, uGold;
uniform sampler2D uMap, uDepth;
varying vec3 vCol; varying float vA;
${V}
float sm(float x){ x = clamp(x, 0., 1.); return x*x*(3.-2.*x); }
void main(){
  float rx = aRnd.x, ry = aRnd.y, rz = aRnd.z, rw = aRnd.w;
  // 1 · swirl → sketch (outer particles arrive last)
  float ki = sm(uIntro * 1.7 - rw * .7);
  float ang = rx * 6.2831 + uTime * (.18 + ry * .3) + (1. - ki) * 3.;
  float rad = 1.2 + ry * ry * 6.5;
  vec3 swirl = vec3(cos(ang) * rad, (rz - .5) * 6. * (.35 + ry) + sin(uTime * .5 + rx * 20.) * .4, sin(ang) * rad * .6 - 1.);
  vec3 p = mix(swirl, aSketch, ki);
  p.xy += vec2(sin(uTime * 1.2 + rz * 40.), cos(uTime * 1.05 + rx * 40.)) * .006 * (1. - uPhoto); // living ink
  // 2 · sketch → colour + depth of the render (top rows first, flying on a soft arc)
  float d = texture2D(uDepth, aUv).r;
  vec3 pp = vec3((aUv.x - .5) * uWH.x, (aUv.y - .5) * uWH.y, d * uDepthAmt);
  float kp = sm(uPhoto * 1.6 - rw * .3 - (1. - aUv.y) * .3);
  float arc = sin(kp * 3.14159);
  p = mix(p, pp, kp) + vec3(sin(rx * 31. + uTime * .7) * .25, cos(ry * 27. + uTime * .6) * .2, .5 + rz * 1.4) * arc;
  // colour
  vec3 ink = mix(uInk, vec3(.22, .19, .16), ry * .5);
  float gold = step(.94, rw);
  vec3 col = mix(ink, uGold, gold * .9);
  vec3 ph = texture2D(uMap, aUv).rgb * 1.06;
  col = mix(col, ph, smoothstep(.05, .7, kp));
  col = mix(col, uGold * 1.5, arc * .12);
  float a = mix(.18, .82, ki);
  a = mix(a, 1., kp);
  // 3 · hand over to the solid mesh: fade exactly where its cell has appeared
  float k = uSolid * 1.35 - .1;
  float n = cellN(aUv);
  float gone = smoothstep(k - .1, k + .02, n);
  a *= gone;
  vec4 mv = modelViewMatrix * vec4(p, 1.);
  gl_Position = projectionMatrix * mv;
  float s = uSize * (1. + arc * .35 + gold * .3) * mix(1., uGrow, kp) * mix(1., 1.6, (1. - gone) * kp);
  gl_PointSize = clamp(s * uScale / -mv.z, 1., 18.);
  vCol = col; vA = a;
}`,ye=`
varying vec3 vCol; varying float vA;
void main(){
  vec2 c = gl_PointCoord - .5; float r = dot(c, c);
  if (r > .25 || vA < .004) discard;
  gl_FragColor = vec4(vCol, vA * smoothstep(.25, .04, r));
  #include <colorspace_fragment>
}`,ke=`
uniform sampler2D uDepth; uniform float uAmount;
varying vec2 vUv; varying float vD;
void main(){
  vUv = uv;
  float d = texture2D(uDepth, uv).r;
  vD = d;
  vec3 p = position; p.z += d * uAmount;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.);
}`,Se=`
uniform sampler2D uMap; uniform float uSolid, uGlow, uTime, uSweep, uEdge; uniform vec3 uBg; uniform vec2 uRes;
varying vec2 vUv; varying float vD;
${V}
void main(){
  float k = uSolid * 1.35 - .1;
  float n = cellN(vUv);
  if (n > k) discard;
  vec3 c = texture2D(uMap, vUv).rgb;
  // fake bloom: lift the highlights warm
  float l = dot(c, vec3(.299, .587, .114));
  c = c * 1.05 + vec3(1., .8, .55) * pow(smoothstep(.55, 1., l), 2.) * .22;
  // light sweep riding the depth during the dolly (late-afternoon sun crossing the terraces)
  float sw = exp(-pow((vD - uSweep) * 7., 2.)) * .16;
  c += vec3(1., .78, .5) * sw;
  // gold rim where the cells are landing
  float rim = smoothstep(k - .07, k, n) * uGlow;
  c += vec3(1., .72, .38) * rim * 1.6;
  // soft edges into the backdrop
  vec2 eg = vec2(uEdge * 1.8, uEdge);
  vec2 e = smoothstep(vec2(0.), eg, vUv) * smoothstep(vec2(0.), eg, 1. - vUv);
  c = mix(uBg, c, e.x * e.y);
  // vignette + grain (screen space)
  vec2 q = gl_FragCoord.xy / uRes;
  c *= mix(1., smoothstep(1.15, .35, length(q - .5)), .55);
  c += (h21(gl_FragCoord.xy + fract(uTime * 7.3) * 91.) - .5) * .045;
  gl_FragColor = vec4(c, 1.);
  #include <colorspace_fragment>
}`,Me="varying vec2 vQ; void main(){ vQ = position.xy * .5 + .5; gl_Position = vec4(position.xy, .9999, 1.); }",Te=`
uniform vec3 uA, uB; uniform float uDark, uTime;
varying vec2 vQ;
${V}
void main(){
  vec3 c = mix(uA, uB, uDark);
  c *= 1. - .10 * smoothstep(.35, 1.1, length((vQ - .5) * vec2(1.3, 1.)));
  c += vec3(.75, .55, .3) * .05 * (1. - uDark) * smoothstep(.9, .0, length(vQ - vec2(.7, .55)));
  c += (h21(gl_FragCoord.xy + fract(uTime * 5.1) * 77.) - .5) * mix(.022, .026, uDark);
  gl_FragColor = vec4(c, 1.);
  #include <colorspace_fragment>
}`;function be(e){let l=e;return()=>((l=l*16807%2147483647)-1)/2147483646}function Ae(e,l,r){const c=Math.round(300*e.height/e.width),b=document.createElement("canvas");b.width=300,b.height=c;const f=b.getContext("2d",{willReadFrequently:!0});f.drawImage(e,0,0,300,c);const y=f.getImageData(0,0,300,c).data,T=new Float32Array(300*c);let h=0;for(let v=0;v<c;v++)for(let s=0;s<300;s++){const i=s/300,a=v/c,n=(v*300+s)*4;let o=0;if(!(i>.5&&a>.62&&a<.9)&&a<.94){const p=(y[n]*.299+y[n+1]*.587+y[n+2]*.114)/255;o=Math.pow(Math.max(0,1-p-.08),2.4)}h+=o,T[v*300+s]=h}const k=new Float32Array(l*2);for(let v=0;v<l;v++){const s=r()*h;let i=0,a=300*c-1;for(;i<a;){const n=i+a>>1;T[n]<s?i=n+1:a=n}k[v*2]=(i%300+r())/300-.5,k[v*2+1]=.5-((i/300|0)+r())/c}return{pos:k,aspect:e.width/e.height}}function De(e,l){const r=be(7),u=Ae(l,e,r),c=Math.round(Math.sqrt(e/1.25)),b=Math.ceil(e/c),f=new Float32Array(e*2);for(let o=0;o<e;o++)f[o*2]=(o%c+.5+(r()-.5)*.7)/c,f[o*2+1]=Math.min(.999,((o/c|0)+.5+(r()-.5)*.7)/b);const y=Array.from({length:e},(o,p)=>p).sort((o,p)=>u.pos[p*2+1]-u.pos[o*2+1]),T=Array.from({length:e},(o,p)=>p).sort((o,p)=>f[p*2+1]-f[o*2+1]),h=new Float32Array(e*3),k=new Float32Array(e*2),v=new Float32Array(e*4),s=320,i=N*u.aspect;let a=0;for(let o=0;o<e;o+=s){const p=Math.min(e,o+s),F=y.slice(o,p).sort((x,w)=>u.pos[x*2]-u.pos[w*2]),g=T.slice(o,p).sort((x,w)=>f[x*2]-f[w*2]);for(let x=0;x<F.length;x++,a++){const w=F[x],m=g[x];h[a*3]=u.pos[w*2]*i,h[a*3+1]=u.pos[w*2+1]*N,h[a*3+2]=(r()-.5)*.05,k[a*2]=f[m*2],k[a*2+1]=f[m*2+1]}}for(let o=0;o<e*4;o++)v[o]=r();const n=new ve;return n.setAttribute("position",new B(h,3)),n.setAttribute("aSketch",new B(h,3)),n.setAttribute("aUv",new B(k,2)),n.setAttribute("aRnd",new B(v,4)),n.boundingSphere=new pe(new M,30),n}const oe=(e,l=0,r=1)=>Math.min(r,Math.max(l,e)),E=(e,l,r)=>oe((e-l)/(r-l)),z=e=>e*e*(3-2*e),S=te.damp,Re=new M,We=new M,Pe=new M,j={x:0,y:0};let ee=!1;function _e(){ee||typeof window>"u"||(ee=!0,window.addEventListener("pointermove",e=>{j.x=e.clientX/innerWidth*2-1,j.y=-(e.clientY/innerHeight*2-1)},{passive:!0}))}const U=typeof window<"u"&&window.innerWidth<=768;function Be({track:e}){const[l,r,u]=ne(se,[fe,U?he:de,ge]);r.colorSpace=ie,r.anisotropy=4,u.generateMipmaps=!1,u.minFilter=ce;const{size:c,gl:b}=le(),f=U?2e4:6e4,y=d.useMemo(()=>De(f,l.image),[l,f]),T=U?96:200,h=d.useMemo(()=>new Y(H,I,T,Math.round(T*1.25)),[T]),k=d.useMemo(()=>new Y(2,2),[]);d.useEffect(()=>(_e(),()=>{y.dispose(),h.dispose()}),[y,h]);const v=d.useMemo(()=>new _("#151412").convertSRGBToLinear(),[]),s=d.useMemo(()=>({uTime:{value:0},uIntro:{value:0},uPhoto:{value:0},uSolid:{value:0},uSize:{value:U?.0135:.0115},uScale:{value:500},uDepthAmt:{value:Z},uGrow:{value:U?1.9:1.3},uWH:{value:new J(H,I)},uInk:{value:v},uGold:{value:new _("#c99a4e").convertSRGBToLinear()},uMap:{value:r},uDepth:{value:u}}),[r,u]),i=d.useMemo(()=>({uMap:{value:r},uDepth:{value:u},uAmount:{value:Z},uSolid:{value:0},uGlow:{value:1},uTime:{value:0},uSweep:{value:-1},uEdge:{value:.06},uBg:{value:new _("#ece7df")},uRes:{value:new J(1,1)}}),[r,u]),a=d.useMemo(()=>({uA:{value:new _("#ece7df")},uB:{value:new _("#14120f")},uDark:{value:0},uTime:{value:0}}),[]),n=d.useRef(),o=d.useRef(),p=d.useRef(),F=d.useRef({t:0,t0:-1,ps:0,cam:new M,look:new M,px:0,py:0,init:!1}),g=d.useMemo(()=>new M,[]),x=d.useMemo(()=>new M,[]);return ue((w,m)=>{const q=e.current,t=F.current;if(!n.current)return;if(!q.on){n.current.visible=!1;return}n.current.visible=!0,m=Math.min(m,1/20),t.t+=m;const Q=performance.now()/1e3;t.t0<0&&(t.t0=Q);const L=c.width<=768;t.ps=S(t.ps,q.p,4.5,m);const G=t.ps,re=z(oe((Q-t.t0-.15)/3.2)),O=z(E(G,.02,.34)),C=z(E(G,.3,.56)),D=z(E(G,.5,1));s.uTime.value=t.t,s.uIntro.value=re,s.uPhoto.value=O,s.uSolid.value=C,s.uScale.value=c.height*b.getPixelRatio()/(2*Math.tan(te.degToRad(w.camera.fov)/2)),p.current.visible=C<.995,o.current.visible=C>.001,i.uSolid.value=C,i.uGlow.value=1-D*.9,i.uTime.value=t.t,i.uSweep.value=-.3+D*1.6,w.gl.getDrawingBufferSize(i.uRes.value);const $=z(E(G,.4,.54));if(a.uDark.value=$,a.uTime.value=t.t,i.uBg.value.copy(a.uA.value).lerp(a.uB.value,$),me.active!=="hero")return;const W=w.camera;L?g.set(0,-.8,7.7).lerp(x.set(0,-.15,7.9),O):g.set(-1.3,.02,5.5).lerp(x.set(0,.1,6.1),O);const P=Pe.set(g.x,g.y,0),ae=L?1.75:1.45,K=D*D*(3-2*D);g.lerp(Re.set(R.x,R.y+.32,R.z+ae),K),P.lerp(We.set(R.x,R.y-.06,R.z),K),t.px=S(t.px,j.x,3,m),t.py=S(t.py,j.y,3,m);const X=L?0:.22-D*.1;g.x+=t.px*X,g.y+=t.py*X*.6,t.init||(t.cam.copy(g),t.look.copy(P),t.init=!0),t.cam.x=S(t.cam.x,g.x,5,m),t.cam.y=S(t.cam.y,g.y,5,m),t.cam.z=S(t.cam.z,g.z,5,m),t.look.x=S(t.look.x,P.x,5,m),t.look.y=S(t.look.y,P.y,5,m),t.look.z=S(t.look.z,P.z,5,m),W.fov!==40&&(W.fov=40,W.updateProjectionMatrix()),W.position.copy(t.cam),W.lookAt(t.look)}),A.jsxs("group",{ref:n,visible:!1,children:[A.jsx("mesh",{geometry:k,frustumCulled:!1,renderOrder:-10,children:A.jsx("shaderMaterial",{uniforms:a,vertexShader:Me,fragmentShader:Te,depthTest:!1,depthWrite:!1})}),A.jsx("mesh",{ref:o,geometry:h,renderOrder:1,children:A.jsx("shaderMaterial",{uniforms:i,vertexShader:ke,fragmentShader:Se})}),A.jsx("points",{ref:p,geometry:y,frustumCulled:!1,renderOrder:2,children:A.jsx("shaderMaterial",{uniforms:s,vertexShader:we,fragmentShader:ye,transparent:!0,depthWrite:!1})})]})}export{Be as default};
