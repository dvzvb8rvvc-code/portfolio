import{j as x,r as o}from"./kit-B9vXdzke.js";import{C as S,x as U,aH as j,t as C,u as E,P as T,S as $,b as k,$ as z}from"./react-three-fiber.esm-BxSUdgq5.js";const L=`
uniform sampler2D uD; uniform float uPos, uAmt, uRise, uAspB, uPlaneA;
varying vec2 vUv; varying float vD; varying float vRamp;
vec2 cover(vec2 uv, float ia, float pa){ if (ia > pa) uv.x = (uv.x - .5) * pa / ia + .5; else uv.y = (uv.y - .5) * ia / pa + .5; return uv; }
void main(){
  vUv = uv;
  float d = texture2D(uD, cover(uv, uAspB, uPlaneA)).r;
  float ramp = smoothstep(uPos - .004, uPos + .24, uv.x);
  vD = d; vRamp = ramp;
  vec3 p = position;
  p.z += (d - .12) * uAmt * ramp * uRise;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`,_=`
uniform sampler2D uA, uB, uD; uniform float uPos, uAmt, uRise, uAspA, uAspB, uPlaneA, uPaper, uTime;
varying vec2 vUv; varying float vD; varying float vRamp;
vec2 cover(vec2 uv, float ia, float pa){ if (ia > pa) uv.x = (uv.x - .5) * pa / ia + .5; else uv.y = (uv.y - .5) * ia / pa + .5; return uv; }
float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
void main(){
  vec2 ub = cover(vUv, uAspB, uPlaneA), ua = cover(vUv, uAspA, uPlaneA);
  float dist = vUv.x - uPos;
  // reality: relief lighting from depth gradients
  float e = 1.5 / 512.;
  float dx = texture2D(uD, ub + vec2(e, 0.)).r - texture2D(uD, ub - vec2(e, 0.)).r;
  float dy = texture2D(uD, ub + vec2(0., e)).r - texture2D(uD, ub - vec2(0., e)).r;
  vec3 n = normalize(vec3(-dx * 9., -dy * 9., 1.));
  vec3 L = normalize(vec3(-.9, .35, .55));
  float diff = clamp(dot(n, L), 0., 1.);
  float near = exp(-max(dist, 0.) * 4.5);
  vec3 B = texture2D(uB, ub).rgb;
  B *= mix(1., .62 + .7 * diff, uRise * (.35 + .65 * near));
  B *= .86 + .24 * vD;                                         // atmospheric depth
  float band = exp(-pow(dist * 34., 2.)) + .35 * exp(-pow(dist * 9., 2.));
  B += vec3(1., .8, .52) * band * (.25 + .9 * vD) * uRise * step(0., dist);
  float rim = smoothstep(.0, .025, dx * -1.) * near;             // edges catch the light
  B += vec3(1., .85, .6) * rim * .35 * uRise;
  // sketch on paper
  vec3 A = texture2D(uA, ua).rgb;
  vec3 paper = vec3(.95, .935, .905);
  float g = h(floor(gl_FragCoord.xy * .5)) * .045;
  A = mix(A, A * paper - g + .02, uPaper);
  A *= 1. - .35 * exp(-pow(min(dist, 0.) * 22., 2.)) * step(dist, 0.);  // contact shadow of the lifted photo
  vec3 col = dist < 0. ? A : B;
  float line = 1. - smoothstep(0., 1.6 * fwidth(vUv.x), abs(dist));
  col = mix(col, vec3(1., .96, .88), line);
  gl_FragColor = vec4(col, 1.);
  #include <colorspace_fragment>
}`;function F({pairs:p,idx:s,pos:g,small:c,mobile:l}){const A=o.useMemo(()=>p.flatMap(e=>[`/portfolio/yts/img/${e.a}${c?"-s":""}.webp`,`/portfolio/yts/img/${e.b}${c?"-s":""}.webp`,`/portfolio/yts/depth/${e.b}.webp`]),[p,c]),a=U(j,A);o.useMemo(()=>a.forEach((e,u)=>{u%3!==2&&(e.colorSpace=C,e.anisotropy=8)}),[a]);const{size:D,camera:i}=E(),n=D.width/Math.max(1,D.height),P=4,f=P/n,w=o.useMemo(()=>new T(P*1.14,f*1.14,l?140:280,Math.round((l?140:280)/n)),[f,n,l]),t=o.useMemo(()=>new $({vertexShader:L,fragmentShader:_,uniforms:{uA:{value:a[0]},uB:{value:a[1]},uD:{value:a[2]},uPos:{value:.5},uAmt:{value:.9},uRise:{value:0},uAspA:{value:1},uAspB:{value:1},uPlaneA:{value:n},uPaper:{value:1},uTime:{value:0}}}),[a]),B=o.useRef(),v=o.useRef(0),b=o.useRef(-1);o.useEffect(()=>{const e=s*3,u=a[e],r=a[e+1];t.uniforms.uA.value=u,t.uniforms.uB.value=r,t.uniforms.uD.value=a[e+2],t.uniforms.uAspA.value=u.image.width/u.image.height,t.uniforms.uAspB.value=r.image.width/r.image.height,t.uniforms.uPaper.value=s===0?1:.35,b.current!==-1&&(v.current=0),b.current=s},[s,a,t]),o.useEffect(()=>{t.uniforms.uPlaneA.value=n;const e=i.fov*Math.PI/180;i.position.set(0,0,f/2/Math.tan(e/2)*1)},[n,f,i,t]);const R=o.useRef(.5);return k((e,u)=>{const r=Math.min(u,.05),y=t.uniforms,m=g.get()/100;y.uPos.value=m;const M=(m-R.current)/Math.max(r,.001);R.current=m,v.current=h(v.current,1,1.8,r),y.uRise.value=v.current*v.current*(3-2*v.current),y.uTime.value=e.clock.elapsedTime;const d=B.current;d.rotation.y=h(d.rotation.y,(m-.5)*.16+G(M*.02,-.06,.06),4,r),d.rotation.x=h(d.rotation.x,-.07+e.pointer.y*.05,3,r),i.position.x=h(i.position.x,e.pointer.x*.22,3,r),i.lookAt(0,0,0)}),x.jsx("mesh",{ref:B,geometry:w,material:t})}const{damp:h,clamp:G}=z;function V({pairs:p,idx:s,pos:g,small:c,mobile:l,active:A}){return x.jsxs(S,{frameloop:A?"always":"never",dpr:[1,1.6],gl:{antialias:!0,powerPreference:"high-performance"},flat:!0,camera:{position:[0,0,8],fov:30,near:.1,far:50},style:{position:"absolute",inset:0,pointerEvents:"none"},children:[x.jsx("color",{attach:"background",args:["#1d323d"]}),x.jsx(F,{pairs:p,idx:s,pos:g,small:c,mobile:l})]})}export{V as default};
