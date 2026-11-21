import{j as s,r as v}from"./kit-DYh9TQyw.js";import{a as oe,x as R,az as le,P as ce,ar as ee,b as A,u as ve,a0 as P,y as fe,aI as me,S as pe}from"./react-three-fiber.esm-Cyvn13h4.js";import{s as B}from"./yts-6_PT4AGI.js";import"./preload-helper-BDQy5SUP.js";import"./index-DheNWZa-.js";const $=.1,V=new R(1e3,0,0),W=.2,F=-150,Y=18,ue=305,y=(a,o,e)=>{const t=Math.min(1,Math.max(0,(e-a)/(o-a)));return t*t*(3-2*t)},g=a=>new A(a),I=(a,o)=>[(a-900)*W,(ue-o)*W,F],Z=(a,o,e)=>{const[t,r]=I(a,o);return[t*e,Y+(r-Y)*e,F*e]},re=-30,ne=-14,J=re/F,te=ne/F,w=Math.PI,de=(a,o)=>`/portfolio/yts/como/${a}${o?"-s":""}.webp`,he=a=>`/portfolio/yts/depth/${a}.webp`,H={w:360,h:360*701/1800,pos:[0,(ue-350.5)*W,F]},k={w:112,h:112*890/1600,pos:[0,31,32]},C={k:[0,.55,1],top:["#4a7aac","#5f77a3","#566596"].map(g),hor:["#d6e1e8","#f2d4a8","#f7b77c"].map(g),sun:["#fff3dc","#ffd8a2","#ffb066"].map(g),tint:["#ffffff","#ffeed8","#ffd9b0"].map(g),haze:["#b8cad7","#dfc7a6","#e9b486"].map(g),exp:[1,1.02,.97],el:[.55,.3,.13],glow:[.15,.5,.9],hazeAmt:[.17,.24,.3]};function xe(a,o){const e=C.k;let t=0;for(;t<e.length-2&&a>e[t+1];)t++;const r=y(0,1,(a-e[t])/(e[t+1]-e[t]));for(const u of["top","hor","sun","tint","haze"])o[u].copy(C[u][t]).lerp(C[u][t+1],r);for(const u of["exp","el","glow","hazeAmt"])o[u]=C[u][t]+(C[u][t+1]-C[u][t])*r;return o}const ae=.5;function ge(){return{uOff:{value:V.clone()},uK:{value:$},uFade:{value:0},uTime:{value:0},uTint:{value:g("#fff")},uHaze:{value:g("#b8cad7")},uExp:{value:1},uHazeAmt:{value:.2},uTop:{value:g("#4a7aac")},uHor:{value:g("#d6e1e8")},uSunCol:{value:g("#fff3dc")},uSun:{value:new R(0,.5,-1).normalize()},uGlow:{value:.2}}}const ye=`
uniform sampler2D uDepth; uniform float uAmount; uniform vec3 uOff; uniform float uK; uniform float uExt;
varying vec2 vUv; varying float vD; varying vec3 vL; varying float vX;
void main(){
  vX = uv.y * (1.0 + uExt) - uExt;
  // uExt > 0: geometry is taller than the photo; the bottom photo row is extended downwards
  vUv = vec2(uv.x, max(0.003, uv.y * (1.0 + uExt) - uExt));
  float d = texture2D(uDepth, vUv).r;
  vD = d;
  vec3 p = position + normal * d * uAmount;
  vec4 w = modelMatrix * vec4(p, 1.0);
  vL = (w.xyz - uOff) / uK;
  gl_Position = projectionMatrix * viewMatrix * w;
}`,we=`
uniform sampler2D uMap; uniform float uOpacity, uHazeAmt, uHazeScale, uExp, uEdgeX, uEdgeY, uEdgeTop, uBaseHaze, uFade, uReveal, uExt;
uniform vec3 uTint, uHaze;
varying vec2 vUv; varying float vD; varying vec3 vL; varying float vX;
float h21(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }
float n2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
  return mix(mix(h21(i), h21(i+vec2(1,0)), f.x), mix(h21(i+vec2(0,1)), h21(i+vec2(1,1)), f.x), f.y); }
void main(){
  vec4 c = texture2D(uMap, vUv);
  if (uExt > 0. && vX < .015) { float k = smoothstep(.015, -.03, vX); c.rgb = mix(c.rgb, vec3(.045, .07, .04), k * (1. - c.a * .25)); c.a = mix(c.a, 1., k); }
  float a = c.a * uOpacity * uFade;
  // depth dissolve: near pixels (white) materialise first, with a soft noisy front
  if (uReveal < .999) { float key = (1. - vD) * .78 + n2(vUv * vec2(160., 90.)) * .22; float r = uReveal * 1.3 - .15; a *= smoothstep(r + .02, r - .12, key); }
  a *= smoothstep(0., uEdgeX, vUv.x) * smoothstep(0., uEdgeX, 1. - vUv.x) * smoothstep(0., uEdgeY, vUv.y) * smoothstep(0., uEdgeTop, 1. - vUv.y);
  if (a < .004) discard;
  vec3 col = c.rgb * uTint * uExp;
  float hz = uHazeAmt * uHazeScale * (1. - vD) * (1. - uBaseHaze + uBaseHaze * (1. - smoothstep(0., 26., vL.y)));
  col = mix(col, uHaze, clamp(hz, 0., 1.));
  gl_FragColor = vec4(col, a);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;function ze(a){const o=fe(me,a);return o.forEach((e,t)=>{t%2===0&&(e.colorSpace=pe,e.anisotropy=4)}),o}function U({ext:a=0,name:o,depthId:e,width:t,seg:r,position:u,rotation:p,amount:i=0,hazeScale:z=1,renderOrder:b=0,depthTest:d=!0,small:n,reg:h,sh:c,edgeX:S=.02,edgeY:l=.001,edgeTop:M=1e-4,baseHaze:E=.5}){const[f,L]=ze([de(o,n),he(e)]),j=f.image.height/f.image.width,m=v.useMemo(()=>{const T=t*j,x=new ce(t,T*(1+a),r,Math.max(2,Math.round(r*j*(1+a*.5))));return x.translate(0,-T*a/2,0),x},[t,j,r]),G=v.useMemo(()=>({...c,uExt:{value:a},uReveal:{value:1},uMap:{value:f},uDepth:{value:L},uAmount:{value:i},uOpacity:{value:1},uHazeScale:{value:z},uEdgeX:{value:S},uEdgeY:{value:l},uEdgeTop:{value:M},uBaseHaze:{value:E}}),[f,L]),_=v.useRef();return v.useLayoutEffect(()=>{h.current[o]={u:G,mesh:_.current,map:f}},[]),s.jsx("mesh",{ref:_,geometry:m,position:u,rotation:p,renderOrder:b,frustumCulled:!1,children:s.jsx("shaderMaterial",{uniforms:G,vertexShader:ye,fragmentShader:we,transparent:!0,depthWrite:d,depthTest:d})})}const ie=`
vec3 skyCol(vec3 d){
  float e = d.y;
  vec3 col = mix(uHor, uTop, pow(smoothstep(-.02, .55, e), .7));
  float cs = dot(d, uSun);
  vec2 az = normalize(d.xz + 1e-5), saz = normalize(uSun.xz + 1e-5);
  float side = pow(max(dot(az, saz), 0.), 4.);
  col += uSunCol * uGlow * (exp(-max(e, 0.) * 7.) * side * .5 + pow(max(cs, 0.), 14.) * .4);
  return col;
}`,Se="uniform vec3 uOff; uniform float uK; varying vec3 vL; void main(){ vec4 w = modelMatrix*vec4(position,1.); vL = (w.xyz-uOff)/uK; gl_Position = projectionMatrix*viewMatrix*w; }",Me=`
uniform vec3 uTop, uHor, uSunCol, uSun, uOff; uniform float uGlow, uFade, uK;
varying vec3 vL;
${ie}
void main(){
  vec3 camL = (cameraPosition - uOff) / uK;
  vec3 d = normalize(vL - camL);
  vec3 col = skyCol(d);
  float cs = dot(d, uSun);
  col += uSunCol * (pow(max(cs, 0.), 220.) * 1.4 + smoothstep(.99955, .9997, cs) * 6.);
  if (d.y < 0.) col = mix(col, uHor * .92, smoothstep(0., -.2, d.y));
  gl_FragColor = vec4(col, uFade);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;function He({sh:a,reg:o}){const e=v.useRef();return v.useLayoutEffect(()=>{o.current.skyMesh=e.current},[]),s.jsxs("mesh",{ref:e,renderOrder:-10,frustumCulled:!1,children:[s.jsx("sphereGeometry",{args:[1200,48,24]}),s.jsx("shaderMaterial",{uniforms:a,vertexShader:Se,fragmentShader:Me,side:le,transparent:!0,depthWrite:!1})]})}const Fe="uniform vec3 uOff; uniform float uK; varying vec3 vL; void main(){ vec4 w = modelMatrix*vec4(position,1.); vL = (w.xyz-uOff)/uK; gl_Position = projectionMatrix*viewMatrix*w; }",be=`
uniform vec3 uTop, uHor, uSunCol, uSun, uOff, uHaze, uTint; uniform float uGlow, uFade, uK, uTime, uHazeAmt, uExp;
uniform sampler2D uFar, uHill; uniform vec4 uFarR, uHillR; uniform float uHillOn;
varying vec3 vL;
${ie}
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
  // far mountains (#129 cut-out) — plane z = uFarR.z-side
  if (r.z < 0.) {
    float tt = (${F.toFixed(1)} - vL.z) / r.z; vec3 h = vL + r * tt;
    vec2 uv = vec2((h.x - uFarR.x) / uFarR.z + .5, (h.y - uFarR.y) / uFarR.w + .5);
    if (uv.x > 0. && uv.x < 1. && uv.y > 0. && uv.y < 1.) {
      vec4 c = texture2D(uFar, uv);
      vec3 fc = mix(c.rgb * uTint * uExp, uHaze, uHazeAmt * 1.1);
      refl = mix(refl, fc, c.a * smoothstep(0., .05, uv.x) * smoothstep(0., .05, 1. - uv.x));
    }
  } else if (uHillOn > .01) {
    float tt = (${k.pos[2].toFixed(1)} - vL.z) / r.z; vec3 h = vL + r * tt;
    vec2 uv = vec2(.5 - (h.x - uHillR.x) / uHillR.z, (h.y - uHillR.y) / uHillR.w + .5);
    if (uv.x > 0. && uv.x < 1. && uv.y > 0. && uv.y < 1.) {
      vec4 c = texture2D(uHill, uv);
      refl = mix(refl, c.rgb * uTint * uExp, c.a * uHillOn * smoothstep(0., .16, uv.x) * smoothstep(0., .16, 1. - uv.x));
    }
  }
  float F = .18 + .82 * pow(1. - clamp(-d.y, 0., 1.), 5.);
  vec3 deep = mix(vec3(.05, .11, .14), uTop * .32, .5) * uExp;
  vec3 col = mix(deep, refl * .92, F);
  // sun glitter — sharp highlights from the ripple normals, sparkling cells
  float sp = pow(max(dot(r, uSun), 0.), 900.);
  float tw = step(.55, h21(floor(q * 2.2) + floor(t * 6.)));
  col += uSunCol * (sp * (2.5 + 4. * tw) + pow(max(dot(r, uSun), 0.), 60.) * .12 * uGlow);
  col = mix(col, uHaze, clamp(smoothstep(30., 260., dist) * uHazeAmt * 2.4, 0., .85));
  gl_FragColor = vec4(col, uFade);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;function Ee({sh:a,reg:o}){const e=v.useMemo(()=>({...a,uFar:{value:null},uHill:{value:null},uHillOn:{value:0},uFarR:{value:new ee(H.pos[0],H.pos[1],H.w,H.h)},uHillR:{value:new ee(k.pos[0],k.pos[1],k.w,k.h)}}),[]);return v.useLayoutEffect(()=>{o.current.water=e},[]),s.jsxs("mesh",{"rotation-x":-w/2,position:[0,0,-60],renderOrder:2,frustumCulled:!1,children:[s.jsx("planeGeometry",{args:[900,260,1,1]}),s.jsx("shaderMaterial",{uniforms:e,vertexShader:Fe,fragmentShader:be,transparent:!0,depthWrite:!0})]})}const Le="varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }",je=`
uniform vec3 uHaze; uniform float uAmt, uTime, uFade; varying vec2 vUv;
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
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;function Te({sh:a}){const o=[[[10,7,-143],520,24,.55],[[-30,4,-105],380,12,.28]],e=v.useMemo(()=>o.map(t=>({uHaze:a.uHaze,uTime:a.uTime,uFade:a.uFade,uAmt:{value:t[3]}})),[]);return o.map(([t,r,u],p)=>s.jsxs("mesh",{position:t,renderOrder:3,children:[s.jsx("planeGeometry",{args:[r,u]}),s.jsx("shaderMaterial",{uniforms:e[p],vertexShader:Le,fragmentShader:je,transparent:!0,depthWrite:!1})]},p))}const se=[[0,[0,Y,0],0,-.13,47],[.2,[0,16.8,-7],-.02,-.12,46],[.42,[-4,8.5,-34],.05,-.06,46],[.6,[-9,4.6,-62],.13,-.015,46],[.76,[-7,7,-60],w*.6,.01,46],[.9,[-1.5,20,-30],w-.03,.02,44],[1,[0,26,-14],w,.01,41]],Oe=se.map(([a,o,e,t,r],u)=>[a,o,e+(u>0&&u<4?.06:0),t+(u>=5?.05:0),Math.min(72,r+(u>=5?14:20))]);function Re(a,o,e){let t=0;for(;t<a.length-2&&o>a[t+1][0];)t++;const r=a[t],u=a[t+1],p=Math.min(1,Math.max(0,(o-r[0])/(u[0]-r[0]))),i=p*p*(3-2*p),z=a[Math.max(0,t-1)][1],b=r[1],d=u[1],n=a[Math.min(a.length-1,t+2)][1],h=p,c=h*h,S=c*h;for(let l=0;l<3;l++)e.pos[l]=.5*(2*b[l]+(-z[l]+d[l])*h+(2*z[l]-5*b[l]+4*d[l]-n[l])*c+(-z[l]+3*b[l]-3*d[l]+n[l])*S);return e.yaw=r[2]+(u[2]-r[2])*i,e.pitch=r[3]+(u[3]-r[3])*i,e.fov=r[4]+(u[4]-r[4])*i,e}const N={varenna:{p:Z(1205,575,J),win:[[-.1,.2]]},bellagio:{p:[I(560,296)[0],I(560,296)[1]+3,F],win:[[.2,.5]]},triangle:{p:[I(1050,300)[0],6,F],win:[[.36,.64]]},home:{p:[-6,36,30],win:[[.9,1.2]]}};function ke({track:a,reg:o,sh:e,mobile:t}){const{camera:r,size:u}=oe(),p=v.useRef({p:0,mx:0,my:0,was:!1}),i=v.useMemo(()=>({o:{pos:[0,0,0]},dir:new R,right:new R,tgt:new R,cam:new R,v:new R,tod:{top:new A,hor:new A,sun:new A,tint:new A,haze:new A}}),[]);return ve((z,b)=>{const d=a.current,n=o.current,h=n.group,c=p.current;if(!h)return;const S=B.active==="como",l=Math.min(b,.05);e.uFade.value=P.damp(e.uFade.value,S&&d.on?1:0,7,l),h.visible=d.on&&e.uFade.value>.005;const M=B.labels&&B.labels.como;if(n.ready&&!n.warmed&&(n.warm=(n.warm||0)+1,n.warm>4&&(n.warmed=!0),!S)){h.visible=!0;return}if(!h.visible||!S){if(c.was=!1,M&&!S)for(const x in M)M[x]&&(M[x].style.opacity=0);return}c.was||(c.p=d.p,c.was=!0,e.uFade.value=Math.max(e.uFade.value,.35)),c.p=P.damp(c.p,d.p,4.5,l),c.mx=P.damp(c.mx,z.pointer.x,2.4,l),c.my=P.damp(c.my,z.pointer.y,2.4,l),e.uTime.value+=l;const E=c.p,f=Re(t?Oe:se,E,i.o),L=f.yaw-c.mx*.03,j=f.pitch+c.my*.018;i.dir.set(-Math.sin(L)*Math.cos(j),Math.sin(j),-Math.cos(L)*Math.cos(j)),i.right.set(-i.dir.z,0,i.dir.x).normalize(),i.cam.set(f.pos[0],f.pos[1],f.pos[2]).addScaledVector(i.right,t?0:c.mx*.8),i.cam.y+=t?0:c.my*.4,r.position.copy(i.cam).multiplyScalar($).add(V),i.tgt.copy(r.position).add(i.dir),r.lookAt(i.tgt),(Math.abs(r.fov-f.fov)>.01||r.near!==.05)&&(r.fov=f.fov,r.near=.05,r.updateProjectionMatrix()),n.skyMesh&&n.skyMesh.position.copy(i.cam);const m=xe(y(0,1,E),i.tod);e.uTop.value.copy(m.top),e.uHor.value.copy(m.hor),e.uSunCol.value.copy(m.sun),e.uTint.value.copy(m.tint),e.uHaze.value.copy(m.haze),e.uExp.value=m.exp,e.uGlow.value=m.glow,e.uHazeAmt.value=m.hazeAmt,e.uSun.value.set(Math.sin(ae)*Math.cos(m.el),Math.sin(m.el),-Math.cos(ae)*Math.cos(m.el));const G=y(.25,.45,L/w),_=(x,D,O,q)=>{const K=n[x];if(!K)return;const X=y(O,q,i.cam.z-D)*(1-G);K.u.uOpacity.value=X,K.mesh.visible=X>.004};_("fg129",ne,1.5,7),_("near129",re,2,12);const T=y(.4,.85,L/w)*.5+y(.78,.94,E)*.5;if(n.hill140&&(n.hill140.mesh.visible=T>.004,n.hill140.u.uReveal.value=T,n.hill140.u.uOpacity.value=y(0,.15,T)),n.water&&(n.water.uHillOn.value=T,!n.water.uFar.value&&n.far129&&(n.water.uFar.value=n.far129.map),!n.water.uHill.value&&n.hill140&&(n.water.uHill.value=n.hill140.map)),M)for(const x in N){const D=M[x];if(!D)continue;let O=0;for(const[X,Q]of N[x].win)O=Math.max(O,y(X,X+.05,E)*(1-y(Q-.05,Q,E)));i.v.set(...N[x].p).multiplyScalar($).add(V).project(r),(i.v.z>1||Math.abs(i.v.x)>1.1||Math.abs(i.v.y)>1.1)&&(O=0);const q=(i.v.x*.5+.5)*u.width,K=(-i.v.y*.5+.5)*u.height;D.style.opacity=O.toFixed(3),D.style.transform=`translate3d(${q.toFixed(1)}px,${(K+(1-O)*10).toFixed(1)}px,0) translate(-50%,-100%)`}}),null}function Ce({reg:a}){return v.useLayoutEffect(()=>{a.current.ready=!0},[]),null}function Ue({track:a,mobile:o}){const e=v.useRef({}),t=v.useMemo(ge,[]),r=v.useRef();v.useLayoutEffect(()=>{e.current.group=r.current},[]);const u=!!o;return s.jsxs("group",{ref:r,position:V,scale:$,visible:!1,children:[s.jsx(He,{sh:t,reg:e}),s.jsxs(v.Suspense,{fallback:null,children:[s.jsx(U,{name:"far129",depthId:129,width:H.w,seg:u?96:160,position:H.pos,amount:14,reg:e,sh:t,renderOrder:0,edgeX:.05,baseHaze:.55,small:!1}),s.jsx(U,{name:"band142",depthId:142,width:520,seg:u?48:72,position:[-185,-3.5,-40],rotation:[0,w/2,0],amount:10,hazeScale:1.25,reg:e,sh:t,edgeX:.16,baseHaze:.6,small:!0}),s.jsx(U,{name:"band141",depthId:141,width:520,seg:u?48:72,position:[185,-6.4,-10],rotation:[0,-w/2,0],amount:10,hazeScale:1.25,reg:e,sh:t,edgeX:.16,baseHaze:.6,small:!0}),s.jsx(U,{name:"hill140",depthId:140,width:k.w,seg:u?96:180,position:k.pos,rotation:[0,w,0],amount:7,hazeScale:.3,reg:e,sh:t,renderOrder:1,edgeX:.16,edgeY:.07,baseHaze:.15,small:u}),s.jsx(U,{name:"near129",depthId:129,width:H.w*J,seg:u?96:160,position:Z(900,350.5,J),amount:3.5,hazeScale:.4,renderOrder:10,depthTest:!1,reg:e,sh:t,edgeX:.005,ext:.8,baseHaze:0,small:u}),s.jsx(Ce,{reg:e}),s.jsx(U,{name:"fg129",depthId:129,width:H.w*te,seg:u?72:128,position:Z(900,350.5,te),amount:2.2,hazeScale:.1,renderOrder:11,depthTest:!1,reg:e,sh:t,edgeX:.004,ext:1.6,baseHaze:0,small:u})]}),s.jsx(Ee,{sh:t,reg:e}),s.jsx(Te,{sh:t}),s.jsx(ke,{track:a,reg:e,sh:t,mobile:o})]})}function Ge({track:a}){const{size:o}=oe(),e=o.width<768;return s.jsx(Ue,{track:a,mobile:e})}export{Ge as default};
