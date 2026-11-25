import{j as l,r as v}from"./kit-DG8De6dg.js";import{a as ue,h as j,V as J,az as ge,P as ye,ar as se,b as $,u as we,a0 as q,Q as ze,aI as Me,S as ie,m as le}from"./react-three-fiber.esm--0B19njQ.js";import{s as I}from"./yts-CSdUFWns.js";import"./preload-helper-BDQy5SUP.js";import"./index-MpRCSczS.js";const N=.1,W=new j(1e3,0,0),ee=.2,L=-150,te=18,me=305,T=(t,r,e)=>{const a=Math.min(1,Math.max(0,(e-t)/(r-t)));return a*a*(3-2*a)},g=t=>new $(t),V=(t,r)=>[(t-900)*ee,(me-r)*ee,L],ae=(t,r,e)=>{const[a,u]=V(t,r);return[a*e,te+(u-te)*e,L*e]},fe=-30,pe=-14,oe=fe/L,ce=pe/L,D=Math.PI,Fe=(t,r)=>`/portfolio/yts/como/${t}${r?"-s":""}.webp`,He=t=>`/portfolio/yts/depth/${t}.webp`,R={w:360,h:360*701/1800,pos:[0,(me-350.5)*ee,L]},C={w:112,h:112*890/1600,pos:[0,31,32]},k={k:[0,.55,1],top:["#3d6488","#4b6189","#46507c"].map(g),hor:["#b9c3c6","#e3bd8c","#e89a5e"].map(g),sun:["#fff0d6","#ffd39a","#ffa95c"].map(g),tint:["#fff7ec","#ffead0","#ffd4a6"].map(g),haze:["#8e9ea6","#b39c80","#c08c64"].map(g),exp:[.9,.92,.88],el:[.5,.28,.12],glow:[.2,.55,.95],hazeAmt:[.08,.12,.16]};function Se(t,r){const e=k.k;let a=0;for(;a<e.length-2&&t>e[a+1];)a++;const u=T(0,1,(t-e[a])/(e[a+1]-e[a]));for(const o of["top","hor","sun","tint","haze"])r[o].copy(k[o][a]).lerp(k[o][a+1],u);for(const o of["exp","el","glow","hazeAmt"])r[o]=k[o][a]+(k[o][a+1]-k[o][a])*u;return r}const ve=.5;function be(){return{uOff:{value:W.clone()},uK:{value:N},uFade:{value:0},uTime:{value:0},uTint:{value:g("#fff")},uHaze:{value:g("#b8cad7")},uExp:{value:1},uHazeAmt:{value:.2},uTop:{value:g("#4a7aac")},uHor:{value:g("#d6e1e8")},uSunCol:{value:g("#fff3dc")},uSun:{value:new j(0,.5,-1).normalize()},uGlow:{value:.2},uDim:{value:0},uRes:{value:new J(1,1)},uEdge:{value:new J(-1e4,1e5)},uBg:{value:g("#0b0a08")}}}const Y=`
uniform vec2 uRes, uEdge; uniform vec3 uBg; uniform float uDim;
float cineHash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
vec3 cine(vec3 c){
  float l = dot(c, vec3(.2126, .7152, .0722));
  c = mix(vec3(l), c, .86);
  c *= mix(vec3(.92, .96, 1.03), vec3(1.07, 1., .87), smoothstep(.04, .62, l));
  c = mix(c, c * c * (3. - 2. * c), .3);
  c = c * .94 + vec3(.010, .0085, .0065);
  vec2 s = gl_FragCoord.xy / uRes;
  c *= 1. - .5 * (1. - smoothstep(0., .42, s.y));
  c *= 1. - .32 * smoothstep(.78, 1., s.y);
  c *= mix(1., 1. - smoothstep(.32, 1.2, length((s - .5) * vec2(1.1, 1.))), .55);
  float fe = uRes.y * .3;
  float m = smoothstep(uEdge.x, uEdge.x + fe, gl_FragCoord.y) * (1. - smoothstep(uEdge.y - fe, uEdge.y, gl_FragCoord.y));
  c = mix(uBg, c, m * m * (1. - uDim));
  float g = cineHash(gl_FragCoord.xy + fract(uTime * 7.31) * 113.) - .5;
  return c + g * .022 * (.35 + sqrt(max(c.g, 0.)));
}`,Z=`#include <tonemapping_fragment>
  gl_FragColor.rgb = cine(gl_FragColor.rgb);
  #include <colorspace_fragment>`,Ee=`
uniform sampler2D uDepth; uniform float uAmount; uniform vec3 uOff; uniform float uK; uniform float uExt, uDilate; uniform vec2 uTap;
varying vec2 vUv; varying float vD; varying vec3 vL; varying float vX;
void main(){
  vX = uv.y * (1.0 + uExt) - uExt;
  // uExt > 0: geometry is taller than the photo; the bottom photo row is extended downwards
  vUv = vec2(uv.x, max(0.003, uv.y * (1.0 + uExt) - uExt));
  // edge-safe depth: 5 taps one vertex apart. Cut-out layers dilate (max) so the silhouette stays rigid with
  // its foreground; full photos average → no stretched "curtains" at depth discontinuities.
  float d0 = texture2D(uDepth, vUv).r;
  float d1 = texture2D(uDepth, vUv + vec2(uTap.x, 0.)).r, d2 = texture2D(uDepth, vUv - vec2(uTap.x, 0.)).r;
  float d3 = texture2D(uDepth, vUv + vec2(0., uTap.y)).r, d4 = texture2D(uDepth, vUv - vec2(0., uTap.y)).r;
  float mx = max(d0, max(max(d1, d2), max(d3, d4)));
  float av = (d0 * 2. + d1 + d2 + d3 + d4) / 6.;
  float d = mix(av, mx, uDilate);
  d *= smoothstep(0., .06, vUv.x) * smoothstep(0., .06, 1. - vUv.x) * mix(1., smoothstep(0., .08, vUv.y) * smoothstep(0., .06, 1. - vUv.y), 1. - uDilate); // flat at photo borders
  vD = d0;
  vec3 p = position + normal * d * uAmount;
  vec4 w = modelMatrix * vec4(p, 1.0);
  vL = (w.xyz - uOff) / uK;
  gl_Position = projectionMatrix * viewMatrix * w;
}`,Te=`
uniform sampler2D uMap; uniform float uOpacity, uHazeAmt, uHazeScale, uExp, uEdgeX, uEdgeY, uEdgeTop, uBaseHaze, uFade, uReveal, uExt, uTime, uAsp;
uniform vec3 uTint, uHaze;
varying vec2 vUv; varying float vD; varying vec3 vL; varying float vX;
${Y}
float h21(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }
float n2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
  return mix(mix(h21(i), h21(i+vec2(1,0)), f.x), mix(h21(i+vec2(0,1)), h21(i+vec2(1,1)), f.x), f.y); }
float fbm(vec2 p){ float a = .5, s = 0.; for(int i = 0; i < 4; i++){ s += a * n2(p); p = p * 2.03 + 17.1; a *= .5; } return s / .9375; }
void main(){
  vec2 uv = vUv;
  float k = 1., wide = 0.;
  // liquid depth dissolve (same family as the hero): near pixels flow first, fbm front, wet dark edge, gold rim
  if (uReveal < .999) {
    vec2 q = uv * vec2(uAsp, 1.);
    float n = fbm(q * 1.3 + vec2(0., uTime * .02));
    float nn = fbm(q * 4.2 - vec2(uTime * .03, 0.));
    float f = clamp(n * .6 + (1. - vD) * .4, 0., 1.) + (nn - .5) * .1;
    float front = uReveal * 1.4 - .2;
    wide = 1. - abs(2. * smoothstep(f - .2, f + .2, front) - 1.);
    k = smoothstep(f - .05, f + .05, front);
    vec2 flow = vec2(fbm(q * 2.1 + 3.1 + uTime * .04), fbm(q * 2.1 - 7.3 - uTime * .04)) - .5;
    uv += flow * wide * .05;
  }
  vec4 c = texture2D(uMap, uv);
  if (uExt > 0. && vX < .05) { float e = smoothstep(.05, -.04, vX); c.rgb = mix(c.rgb, vec3(.012, .016, .01), e); c.a = mix(c.a, 1., e); }
  float a = c.a * uOpacity * uFade * k;
  a *= smoothstep(0., uEdgeX, vUv.x) * smoothstep(0., uEdgeX, 1. - vUv.x) * smoothstep(0., uEdgeY, vUv.y) * smoothstep(0., uEdgeTop, 1. - vUv.y);
  if (a < .004) discard;
  vec3 col = c.rgb * uTint * uExp;
  float hz = uHazeAmt * uHazeScale * (1. - vD) * (1. - uBaseHaze + uBaseHaze * (1. - smoothstep(0., 26., vL.y)));
  col = mix(col, uHaze, clamp(hz, 0., 1.));
  float edge = 1. - abs(2. * k - 1.);
  col *= 1. - wide * .22 - edge * .3;
  col += vec3(1., .74, .42) * pow(edge, 3.) * .08;
  gl_FragColor = vec4(col, a);
  ${Z}
}`;function Re(t){const r=ze(Me,t),{gl:e}=ue(),a=Math.min(8,e.capabilities.getMaxAnisotropy());return r.forEach((u,o)=>{o%2===0?(u.colorSpace!==ie||u.anisotropy!==a)&&(u.colorSpace=ie,u.anisotropy=a,u.needsUpdate=!0):u.minFilter!==le&&(u.generateMipmaps=!1,u.minFilter=le,u.needsUpdate=!0)}),r}function A({ext:t=0,name:r,depthId:e,width:a,seg:u,position:o,rotation:c,amount:s=0,hazeScale:y=1,renderOrder:w=0,depthTest:h=!0,small:n,reg:F,sh:i,edgeX:H=.02,edgeY:m=.001,edgeTop:z=1e-4,baseHaze:S=.5,dilate:b=1}){const[d,O]=Re([Fe(r,n),He(e)]),M=d.image.height/d.image.width,K=v.useMemo(()=>{const X=a*M,U=new ye(a,X*(1+t),u,Math.max(2,Math.round(u*M*(1+t*.5))));return U.translate(0,-X*t/2,0),U},[a,M,u]),f=v.useMemo(()=>({...i,uExt:{value:t},uReveal:{value:1},uMap:{value:d},uDepth:{value:O},uAmount:{value:s},uOpacity:{value:1},uHazeScale:{value:y},uEdgeX:{value:H},uEdgeY:{value:m},uEdgeTop:{value:z},uBaseHaze:{value:S},uDilate:{value:b},uAsp:{value:1/M},uTap:{value:new J(1/u,1/Math.max(2,Math.round(u*M)))}}),[d,O]),B=v.useRef();return v.useLayoutEffect(()=>{F.current[r]={u:f,mesh:B.current,map:d}},[]),l.jsx("mesh",{ref:B,geometry:K,position:o,rotation:c,renderOrder:w,frustumCulled:!1,children:l.jsx("shaderMaterial",{uniforms:f,vertexShader:Ee,fragmentShader:Te,transparent:!0,depthWrite:h,depthTest:h})})}const de=`
vec3 skyCol(vec3 d){
  float e = d.y;
  vec3 col = mix(uHor, uTop, pow(smoothstep(-.02, .55, e), .7));
  float cs = dot(d, uSun);
  vec2 az = normalize(d.xz + 1e-5), saz = normalize(uSun.xz + 1e-5);
  float side = pow(max(dot(az, saz), 0.), 4.);
  col += uSunCol * uGlow * (exp(-max(e, 0.) * 7.) * side * .5 + pow(max(cs, 0.), 14.) * .4);
  return col;
}`,De="uniform vec3 uOff; uniform float uK; varying vec3 vL; void main(){ vec4 w = modelMatrix*vec4(position,1.); vL = (w.xyz-uOff)/uK; gl_Position = projectionMatrix*viewMatrix*w; }",Le=`
uniform vec3 uTop, uHor, uSunCol, uSun, uOff; uniform float uGlow, uFade, uK, uTime;
varying vec3 vL;
${de}
${Y}
void main(){
  vec3 camL = (cameraPosition - uOff) / uK;
  vec3 d = normalize(vL - camL);
  vec3 col = skyCol(d);
  float cs = dot(d, uSun);
  col += uSunCol * (pow(max(cs, 0.), 220.) * 1.4 + smoothstep(.99955, .9997, cs) * 6.);
  if (d.y < 0.) col = mix(col, uHor * .92, smoothstep(0., -.2, d.y));
  gl_FragColor = vec4(col, uFade);
  ${Z}
}`;function je({sh:t,reg:r}){const e=v.useRef();return v.useLayoutEffect(()=>{r.current.skyMesh=e.current},[]),l.jsxs("mesh",{ref:e,renderOrder:-10,frustumCulled:!1,children:[l.jsx("sphereGeometry",{args:[1200,48,24]}),l.jsx("shaderMaterial",{uniforms:t,vertexShader:De,fragmentShader:Le,side:ge,transparent:!0,depthWrite:!1})]})}const Ce="uniform vec3 uOff; uniform float uK; varying vec3 vL; void main(){ vec4 w = modelMatrix*vec4(position,1.); vL = (w.xyz-uOff)/uK; gl_Position = projectionMatrix*viewMatrix*w; }",Oe=`
uniform vec3 uTop, uHor, uSunCol, uSun, uOff, uHaze, uTint; uniform float uGlow, uFade, uK, uTime, uHazeAmt, uExp;
uniform sampler2D uFar, uHill; uniform vec4 uFarR, uHillR; uniform float uHillOn;
varying vec3 vL;
${de}
${Y}
float h21(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }
void main(){
  vec3 camL = (cameraPosition - uOff) / uK;
  vec3 v = vL - camL; float dist = length(v); vec3 d = v / dist;
  vec2 q = vL.xz; float t = uTime;
  // sum of drifting waves; amplitude fades with distance to avoid shimmer aliasing
  vec2 n = vec2(0.);
  n += cos(dot(q, vec2(.55, .21)) + t * 1.1) * vec2(.55, .21);
  n += cos(dot(q, vec2(-.31, .83)) + t * 1.4) * vec2(-.31, .83) * .7;
  n += cos(dot(q, vec2(1.35, -.6)) + t * 1.9) * vec2(1.35, -.6) * .35;
  n += cos(dot(q, vec2(-1.9, -1.2)) + t * 2.3) * vec2(-1.9, -1.2) * .22;
  n += cos(dot(q, vec2(3.1, 2.2)) + t * 3.1) * vec2(3.1, 2.2) * .09;
  float att = 1. / (1. + dist * .035);
  vec3 N = normalize(vec3(n.x * .05 * att, 1., n.y * .05 * att));
  vec3 r = reflect(d, N);
  r.y = max(r.y, .002);
  vec3 refl = skyCol(r);
  // far mountains (#129 cut-out, plane z = ZF) and, when we look back, the terraces render (#140, plane z = hill):
  // both reflections are evaluated and blended by the ray's z (no hard seam when the camera turns)
  vec3 rF = refl, rH = refl;
  if (r.z < .05) {
    float tt = (${L.toFixed(1)} - vL.z) / min(r.z, -.001); vec3 h = vL + r * tt;
    vec2 uv = vec2((h.x - uFarR.x) / uFarR.z + .5, (h.y - uFarR.y) / uFarR.w + .5);
    if (uv.x > 0. && uv.x < 1. && uv.y > 0. && uv.y < 1.) {
      vec4 c = texture2D(uFar, uv);
      vec3 fc = mix(c.rgb * uTint * uExp, uHaze, uHazeAmt * 1.1);
      rF = mix(refl, fc, c.a * smoothstep(0., .05, uv.x) * smoothstep(0., .05, 1. - uv.x));
    }
  }
  if (r.z > -.05 && uHillOn > .01) {
    float tt = (${C.pos[2].toFixed(1)} - vL.z) / max(r.z, .001); vec3 h = vL + r * tt;
    vec2 uv = vec2(.5 - (h.x - uHillR.x) / uHillR.z, (h.y - uHillR.y) / uHillR.w + .5);
    if (uv.x > 0. && uv.x < 1. && uv.y > 0. && uv.y < 1.) {
      vec4 c = texture2D(uHill, uv);
      rH = mix(refl, c.rgb * uTint * uExp, c.a * uHillOn * smoothstep(0., .3, uv.x) * smoothstep(0., .3, 1. - uv.x) * smoothstep(0., .2, uv.y));
    }
  }
  refl = mix(rF, rH, smoothstep(-.05, .05, r.z));
  float F = .18 + .82 * pow(1. - clamp(-d.y, 0., 1.), 5.);
  vec3 deep = mix(vec3(.05, .11, .14), uTop * .32, .5) * uExp;
  vec3 col = mix(deep, refl * .92, F);
  // sun glitter — sharp highlights from the ripple normals, sparkling cells
  float sp = pow(max(dot(r, uSun), 0.), 1400.) * smoothstep(40., 140., dist);
  float tw = step(.7, h21(floor(q * 18.) + floor(t * 5.)));
  col += uSunCol * (sp * (1.4 + 2.6 * tw) + pow(max(dot(r, uSun), 0.), 60.) * .1 * uGlow);
  col = mix(col, uHaze, clamp(smoothstep(30., 260., dist) * uHazeAmt * 1.8, 0., .7));
  gl_FragColor = vec4(col, uFade);
  ${Z}
}`;function Ue({sh:t,reg:r}){const e=v.useMemo(()=>({...t,uFar:{value:null},uHill:{value:null},uHillOn:{value:0},uFarR:{value:new se(R.pos[0],R.pos[1],R.w,R.h)},uHillR:{value:new se(C.pos[0],C.pos[1],C.w,C.h)}}),[]);return v.useLayoutEffect(()=>{r.current.water=e},[]),l.jsxs("mesh",{"rotation-x":-D/2,position:[0,0,-60],renderOrder:2,frustumCulled:!1,children:[l.jsx("planeGeometry",{args:[900,260,1,1]}),l.jsx("shaderMaterial",{uniforms:e,vertexShader:Ce,fragmentShader:Oe,transparent:!0,depthWrite:!0})]})}const _e="varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }",ke=`
uniform vec3 uHaze; uniform float uAmt, uTime, uFade; varying vec2 vUv;
${Y}
float h21(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }
float n2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
  return mix(mix(h21(i), h21(i+vec2(1,0)), f.x), mix(h21(i+vec2(0,1)), h21(i+vec2(1,1)), f.x), f.y); }
float fbm(vec2 p){ float s = 0., a = .5; for (int i = 0; i < 3; i++){ s += a * n2(p); p *= 2.07; a *= .5; } return s * 1.14; }
void main(){
  vec2 p = vUv * vec2(9., 2.2) + vec2(uTime * .012, 0.);
  float f = fbm(p + vec2(n2(p * .6 - uTime * .006) * 1.4, 0.));
  float a = pow(1. - vUv.y, 1.6) * smoothstep(0., .08, vUv.y + .02) * smoothstep(.0, .25, vUv.x) * smoothstep(1., .75, vUv.x);
  a *= smoothstep(.25, .85, f) * uAmt * uFade;
  gl_FragColor = vec4(uHaze * 1.04, a);
  ${Z}
}`;function Ae({sh:t}){const r=[[[10,7,-143],520,24,.4],[[-30,4,-105],380,12,.2]],e=v.useMemo(()=>r.map(a=>({uHaze:t.uHaze,uTime:t.uTime,uFade:t.uFade,uRes:t.uRes,uEdge:t.uEdge,uBg:t.uBg,uDim:t.uDim,uAmt:{value:a[3]}})),[]);return r.map(([a,u,o],c)=>l.jsxs("mesh",{position:a,renderOrder:3,children:[l.jsx("planeGeometry",{args:[u,o]}),l.jsx("shaderMaterial",{uniforms:e[c],vertexShader:_e,fragmentShader:ke,transparent:!0,depthWrite:!1})]},c))}const he=[[0,[0,te,0],0,-.13,47],[.18,[0,16.6,-8],-.02,-.12,46],[.34,[-4,8.8,-33],.05,-.065,46],[.48,[-9,4.8,-55],.14,-.02,46],[.59,[-7.5,8,-53],D*.64,0,46],[.74,[-2,19,-32],D-.04,.02,44],[1,[0,25,-16],D,.01,41]],$e=he.map(([t,r,e,a,u],o)=>[t,r,e+(o>0&&o<4?.06:0),a+(o>=5?.05:0),Math.min(72,u+(o>=5?14:20))]),xe=t=>{const r=t.length,e=(u,o)=>o<3?t[u][1][o]:t[u][o-1],a=t.map((u,o)=>[0,1,2,3,4,5].map(c=>o===0||o===r-1?0:(e(o+1,c)-e(o-1,c))/(t[o+1][0]-t[o-1][0])));return{st:t,m:a,get:e}},Ke=xe(he),Xe=xe($e);function qe(t,r,e){const{st:a,m:u,get:o}=t;let c=0;for(;c<a.length-2&&r>a[c+1][0];)c++;const s=a[c+1][0]-a[c][0],y=Math.min(1,Math.max(0,(r-a[c][0])/s)),w=y*y,h=w*y,n=2*h-3*w+1,F=h-2*w+y,i=-2*h+3*w,H=h-w,m=z=>n*o(c,z)+F*s*u[c][z]+i*o(c+1,z)+H*s*u[c+1][z];return e.pos[0]=m(0),e.pos[1]=m(1),e.pos[2]=m(2),e.yaw=m(3),e.pitch=m(4),e.fov=m(5),e}const Q={varenna:{p:ae(1205,575,oe),win:[[-.1,.2]]},bellagio:{p:[V(560,296)[0],V(560,296)[1]+3,L],win:[[.2,.5]]},triangle:{p:[V(1050,300)[0],6,L],win:[[.34,.56]]},home:{p:[-6,32,30],win:[[.72,1.2]]}};function Be({track:t,reg:r,sh:e,mobile:a}){const{camera:u,size:o}=ue(),c=v.useRef({p:0,p1:0,mx:0,my:0,was:!1,t:0}),s=v.useMemo(()=>({o:{pos:[0,0,0]},dir:new j,right:new j,tgt:new j,cam:new j,v:new j,tod:{top:new $,hor:new $,sun:new $,tint:new $,haze:new $}}),[]);return we((y,w)=>{const h=t.current,n=r.current,F=n.group,i=c.current;if(!F)return;const H=I.active==="como",m=Math.min(w,.05);y.gl.getDrawingBufferSize(e.uRes.value);const z=I.els.como;if(z){const x=z.getBoundingClientRect(),p=e.uRes.value.y/o.height;e.uEdge.value.set((o.height-x.bottom)*p,(o.height-x.top)*p),e.uDim.value=T(0,.55,(o.height-x.bottom)/o.height)}e.uFade.value=q.damp(e.uFade.value,H&&h.on?1:0,7,m),F.visible=h.on&&e.uFade.value>.005;const S=I.labels&&I.labels.como;if(n.ready&&!n.flag&&(n.flag=!0,document.documentElement.dataset.comoReady="1"),n.ready&&!n.warmed&&(n.warm=(n.warm||0)+1,n.warm>4&&(n.warmed=!0),!H)){F.visible=!0;return}if(!F.visible||!H){if(i.was=!1,S&&!H)for(const x in S)S[x]&&(S[x].style.opacity=0);return}i.was||(i.p=i.p1=h.p,i.was=!0,e.uFade.value=Math.max(e.uFade.value,.35)),i.p1=q.damp(i.p1,h.p,6,m),i.p=q.damp(i.p,i.p1,6,m),i.t+=m,i.mx=q.damp(i.mx,y.pointer.x,2.4,m),i.my=q.damp(i.my,y.pointer.y,2.4,m),e.uTime.value+=m;const b=i.p,d=qe(a?Xe:Ke,b,s.o),O=d.yaw-i.mx*.03,M=d.pitch+i.my*.018;s.dir.set(-Math.sin(O)*Math.cos(M),Math.sin(M),-Math.cos(O)*Math.cos(M)),s.right.set(-s.dir.z,0,s.dir.x).normalize(),s.cam.set(d.pos[0],d.pos[1],d.pos[2]).addScaledVector(s.right,a?0:i.mx*.8),s.cam.y+=a?0:i.my*.4;const K=T(.9,1,b);s.cam.x+=Math.sin(i.t*.21)*.9*K,s.cam.y+=Math.sin(i.t*.16+1.2)*.45*K,s.cam.z+=(Math.sin(i.t*.12)*.5+.5)*-1.6*K,u.position.copy(s.cam).multiplyScalar(N).add(W),s.tgt.copy(u.position).add(s.dir),u.lookAt(s.tgt),(Math.abs(u.fov-d.fov)>.01||u.near!==.05)&&(u.fov=d.fov,u.near=.05,u.updateProjectionMatrix()),n.skyMesh&&n.skyMesh.position.copy(s.cam);const f=Se(T(0,1,b),s.tod);e.uTop.value.copy(f.top),e.uHor.value.copy(f.hor),e.uSunCol.value.copy(f.sun),e.uTint.value.copy(f.tint),e.uHaze.value.copy(f.haze),e.uExp.value=f.exp,e.uGlow.value=f.glow,e.uHazeAmt.value=f.hazeAmt,e.uSun.value.set(Math.sin(ve)*Math.cos(f.el),Math.sin(f.el),-Math.cos(ve)*Math.cos(f.el));const B=T(.25,.45,O/D),X=(x,p,E,P)=>{const _=n[x];if(!_)return;const G=Math.min(1,Math.max(0,(s.cam.z-p-E)/(P-E)))*(1-B);_.u.uReveal.value=G,_.u.uOpacity.value=1,_.mesh.visible=G>.004};X("fg129",pe,.5,9),X("near129",fe,1,15);const U=Math.min(1,Math.max(0,(b-.45)/.23));if(n.hill140&&(n.hill140.mesh.visible=U>.004,n.hill140.u.uReveal.value=U,n.hill140.u.uOpacity.value=1),n.water&&(n.water.uHillOn.value=T(.45,1,U),!n.water.uFar.value&&n.far129&&(n.water.uFar.value=n.far129.map),!n.water.uHill.value&&n.hill140&&(n.water.uHill.value=n.hill140.map)),S)for(const x in Q){const p=S[x];if(!p)continue;let E=0;for(const[re,ne]of Q[x].win)E=Math.max(E,T(re,re+.05,b)*(1-T(ne-.05,ne,b)));s.v.set(...Q[x].p).multiplyScalar(N).add(W).project(u),(s.v.z>1||Math.abs(s.v.x)>1.1||Math.abs(s.v.y)>1.1)&&(E=0);const P=(p._w||(p._w=p.offsetWidth||120))/2+14,_=Math.min(o.width-P,Math.max(P,(s.v.x*.5+.5)*o.width)),G=Math.max(96+(p._h||(p._h=p.offsetHeight||60)),(-s.v.y*.5+.5)*o.height);p.style.opacity=E.toFixed(3),p.style.transform=`translate3d(${_.toFixed(1)}px,${(G+(1-E)*10).toFixed(1)}px,0) translate(-50%,-100%)`}}),null}function Pe({reg:t}){return v.useLayoutEffect(()=>{t.current.ready=!0},[]),null}function Ge({track:t,mobile:r}){const e=v.useRef({}),a=v.useMemo(be,[]);typeof window<"u"&&(window.__ytsComo=a);const u=v.useRef();v.useLayoutEffect(()=>{e.current.group=u.current},[]);const o=!!r;return l.jsxs("group",{ref:u,position:W,scale:N,visible:!1,children:[l.jsxs(v.Suspense,{fallback:null,children:[l.jsx(je,{sh:a,reg:e}),l.jsx(A,{name:"far129",depthId:129,width:R.w,seg:o?112:192,position:R.pos,amount:14,reg:e,sh:a,renderOrder:0,edgeX:.05,baseHaze:.55}),l.jsx(A,{name:"band142",depthId:142,width:520,seg:o?48:80,position:[-185,-3.5,-40],rotation:[0,D/2,0],amount:10,hazeScale:1.25,reg:e,sh:a,edgeX:.16,baseHaze:.6,small:!0}),l.jsx(A,{name:"band141",depthId:141,width:520,seg:o?48:80,position:[185,-6.4,-10],rotation:[0,-D/2,0],amount:10,hazeScale:1.25,reg:e,sh:a,edgeX:.16,baseHaze:.6,small:!0}),l.jsx(A,{name:"hill140",depthId:140,width:C.w,seg:o?112:224,position:C.pos,rotation:[0,D,0],amount:7,hazeScale:.3,reg:e,sh:a,renderOrder:1,edgeX:.16,edgeY:.07,baseHaze:.15,dilate:.25}),l.jsx(A,{name:"near129",depthId:129,width:R.w*oe,seg:o?112:192,position:ae(900,350.5,oe),amount:3.5,hazeScale:.4,renderOrder:10,depthTest:!1,reg:e,sh:a,edgeX:.005,ext:.8,baseHaze:0}),l.jsx(A,{name:"fg129",depthId:129,width:R.w*ce,seg:o?96:160,position:ae(900,350.5,ce),amount:2.2,hazeScale:.1,renderOrder:11,depthTest:!1,reg:e,sh:a,edgeX:.004,ext:1.6,baseHaze:0}),l.jsx(Ue,{sh:a,reg:e}),l.jsx(Ae,{sh:a}),l.jsx(Pe,{reg:e})]}),l.jsx(Be,{track:t,reg:e,sh:a,mobile:r})]})}function Ze({track:t}){const{size:r}=ue(),e=r.width<768;return l.jsx(Ge,{track:t,mobile:e})}export{Ze as default};
