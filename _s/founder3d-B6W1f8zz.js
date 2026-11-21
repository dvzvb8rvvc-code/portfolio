import{j as x,r as d,F as T}from"./kit-B9vXdzke.js";import{C as k,x as H,aH as G,t as L,u as P,at as W,ab as M,aa as E,w as V,V as b,aq as _,b as j,$ as i}from"./react-three-fiber.esm-BxSUdgq5.js";const q=`
uniform sampler2D uA; uniform sampler2D uAD; uniform sampler2D uB; uniform sampler2D uBD;
uniform vec4 uCropB; uniform float uM; uniform float uForm; uniform float uTime; uniform float uSweep;
uniform float uSize; uniform vec2 uWH; uniform float uDepth; uniform vec2 uMouse;
attribute vec2 aUv; attribute vec4 aR;
varying vec3 vCol; varying float vA; varying float vGlow;
float lum(vec3 c){ return dot(c, vec3(.299,.587,.114)); }
vec3 nrm(sampler2D d, vec2 uv, float e){
  float gx = texture2D(d, uv + vec2(e,0.)).r - texture2D(d, uv - vec2(e,0.)).r;
  float gy = texture2D(d, uv + vec2(0.,e)).r - texture2D(d, uv - vec2(0.,e)).r;
  return normalize(vec3(-gx*9., -gy*9., 1.));
}
void main(){
  vec2 uvB = mix(uCropB.xy, uCropB.zw, aUv);
  float dA = texture2D(uAD, aUv).r, dB = texture2D(uBD, uvB).r;
  vec3 cA = vec3(lum(texture2D(uA, aUv).rgb)), cB = texture2D(uB, uvB).rgb;
  float mA = smoothstep(.3, .44, dA), mB = smoothstep(.26, .42, dB);
  vec2 xy = (aUv - .5) * uWH;
  vec3 pA = vec3(xy, dA * uDepth), pB = vec3(xy, dB * uDepth);
  // background particles fall back as a loose haze
  pA.z -= (1. - mA) * (0.6 + aR.z); pB.z -= (1. - mB) * (0.6 + aR.z);
  // morph with a top→down wave + jitter
  float m = clamp(uM * 1.9 - (1. - aUv.y) * .55 - aR.x * .35, 0., 1.);
  m = m * m * (3. - 2. * m);
  float storm = sin(m * 3.14159);
  vec3 p = mix(pA, pB, m);
  float ph = aR.y * 6.2831 + uTime * .6;
  p += storm * vec3(sin(ph + p.y * 2.) * .7 + .35, cos(ph * .8 + p.x * 3.) * .5 + .35, sin(ph * 1.3) * .45 - .3) * (.5 + aR.w * .6);
  // forming: scattered → assembled
  float f = clamp(uForm * 1.6 - aR.x * .6, 0., 1.); f = 1. - pow(1. - f, 3.);
  p += (1. - f) * (aR.xyz - .5) * vec3(9., 7., 6.);
  // pointer pushes particles a little (feels touchable)
  vec2 dm = p.xy - uMouse; float pm = exp(-dot(dm, dm) * 9.) * .16;
  p.z += pm; p.xy += normalize(dm + 1e-4) * pm * .4;
  // light: studio rim that sweeps around the head
  vec3 n = normalize(mix(nrm(uAD, aUv, .004), nrm(uBD, uvB, .006), m));
  float a = uSweep;
  vec3 L = normalize(vec3(cos(a), .35, sin(a) * .6 + .2));
  float rim = pow(1. - clamp(n.z, 0., 1.), 1.4) * max(dot(normalize(n.xy + 1e-4), L.xy), 0.);
  float band = exp(-pow((xy.x - cos(a) * uWH.x * .55) / (uWH.x * .22), 2.));
  float mask = mix(mA, mB, m);
  vec3 col = mix(cA, cB, m);
  col *= .72 + band * .5;
  vGlow = (rim * 1.6 + band * .12) * mask;
  col += vec3(1., .72, .42) * vGlow;
  col += vec3(.95, .62, .3) * storm * .35;
  vCol = col;
  vA = mix(.07, 1., mask) * (.25 + .75 * f) + storm * .25;
  vec4 mv = modelViewMatrix * vec4(p, 1.);
  gl_PointSize = uSize * (1. + storm * .35 + (1. - mask) * .3) / -mv.z;
  gl_Position = projectionMatrix * mv;
}`,$=`
varying vec3 vCol; varying float vA; varying float vGlow;
void main(){
  vec2 c = gl_PointCoord - .5; float d = dot(c, c);
  if (d > .25) discard;
  float s = smoothstep(.25, .05, d);
  gl_FragColor = vec4(vCol, vA * s);
  #include <colorspace_fragment>
}`,g=(u,a=0,e=1)=>Math.min(e,Math.max(a,u));function I({progress:u,mobile:a}){const[e,p,l,h]=H(G,["/portfolio/yts/img/1-s.webp","/portfolio/yts/depth/1.webp","/portfolio/yts/img/126.webp","/portfolio/yts/depth/126.webp"]);e.colorSpace=l.colorSpace=L;const{size:A,viewport:S}=P(),v=a?120:190,c=Math.round(v*1.5),U=d.useMemo(()=>{const r=v*c,t=new Float32Array(r*2),o=new Float32Array(r*4),f=new Float32Array(r*3);let y=11;const s=()=>((y=y*16807%2147483647)-1)/2147483646;for(let D=0,m=0;D<c;D++)for(let z=0;z<v;z++,m++)t[m*2]=(z+.5+(s()-.5)*.6)/v,t[m*2+1]=(D+.5+(s()-.5)*.6)/c,o[m*4]=s(),o[m*4+1]=s(),o[m*4+2]=s(),o[m*4+3]=s();const n=new W;return n.setAttribute("position",new M(f,3)),n.setAttribute("aUv",new M(t,2)),n.setAttribute("aR",new M(o,4)),n.boundingSphere=new E(new V,20),n},[v,c]),B=3.5,R=d.useMemo(()=>({uA:{value:e},uAD:{value:p},uB:{value:l},uBD:{value:h},uCropB:{value:new _(.3,.13,.7,.84)},uM:{value:0},uForm:{value:0},uTime:{value:0},uSweep:{value:2.6},uSize:{value:1},uWH:{value:new b(B/1.5,B)},uDepth:{value:.9},uMouse:{value:new b(9,9)}}),[e,p,l,h]),C=d.useRef(),w=d.useRef(new b(9,9)),F=d.useRef(!1);return T.useEffect(()=>{const r=t=>{t.pointerType==="mouse"&&(F.current=!0)};return addEventListener("pointermove",r),()=>removeEventListener("pointermove",r)},[]),j((r,t)=>{var n;const o=R,f=u.get();o.uTime.value+=t,o.uForm.value=i.damp(o.uForm.value,g((f+.12)/.3),4,t),o.uM.value=i.damp(o.uM.value,g((f-.46)/.32),3.5,t),o.uSweep.value=i.damp(o.uSweep.value,2.7-g(f/.9)*2.4+Math.sin(o.uTime.value*.35)*.25,3,t),o.uSize.value=B/c*A.height*r.viewport.dpr/.689*2.15;const y=r.pointer.x*S.width/2-(((n=C.current)==null?void 0:n.position.x)||0),s=r.pointer.y*S.height/2;F.current&&w.current.set(i.damp(w.current.x,y,6,t),i.damp(w.current.y,s,6,t)),o.uMouse.value.copy(w.current)}),x.jsx("points",{ref:C,geometry:U,position:[a?0:.95,a?.35:-.05,0],frustumCulled:!1,children:x.jsx("shaderMaterial",{uniforms:R,vertexShader:q,fragmentShader:$,transparent:!0,depthWrite:!1})})}function J({progress:u,mobile:a}){return j(({camera:e,pointer:p},l)=>{const h=u.get(),A=(a?6.6:5.4)-g((h-.7)/.3)*.5;e.position.x=i.damp(e.position.x,p.x*.55,2.5,l),e.position.y=i.damp(e.position.y,p.y*.3+.1,2.5,l),e.position.z=i.damp(e.position.z,A,2.5,l),e.lookAt(a?0:.6,0,0)}),null}function O({progress:u,active:a,mobile:e}){return x.jsxs(k,{frameloop:a?"always":"never",dpr:[1,e?1.3:1.6],gl:{antialias:!1,alpha:!0,powerPreference:"high-performance"},camera:{fov:38,position:[0,0,6],near:.1,far:50},style:{position:"absolute",inset:0},children:[x.jsx(I,{progress:u,mobile:e}),x.jsx(J,{progress:u,mobile:e})]})}export{O as default};
