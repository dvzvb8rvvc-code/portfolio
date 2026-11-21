import{r as i,j as c}from"./kit-DYh9TQyw.js";import{y as le,aI as ve,a as fe,S as me,f as pe,b as he,u as ee,a0 as V,x as $,P as de,V as O,au as ge,ac as X,ab as xe,a3 as we}from"./react-three-fiber.esm-Cyvn13h4.js";import{P as F,s as J}from"./yts-6_PT4AGI.js";import"./preload-helper-BDQy5SUP.js";import"./index-DheNWZa-.js";const B=new $(-120,40,0),te=8,P=2.6,W=[.78,1.25,.95,1.33],be=[.5,.42,.55,.42],ye=[!0,!1,!1,!1],oe=new he("#ece7df"),Se=()=>typeof window<"u"&&window.innerWidth<=768,j=(r,l,f)=>{const h=Math.min(1,Math.max(0,(f-r)/(l-r)));return h*h*(3-2*h)},R=V.damp,D={x:0,y:0};typeof window<"u"&&window.addEventListener("pointermove",r=>{D.x=r.clientX/innerWidth*2-1,D.y=-(r.clientY/innerHeight*2-1)},{passive:!0});const ae=`
float h2(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(h2(i), h2(i+vec2(1,0)), f.x), mix(h2(i+vec2(0,1)), h2(i+vec2(1,1)), f.x), f.y); }
float fbm(vec2 p){ return vn(p)*0.55 + vn(p*2.13+7.1)*0.28 + vn(p*4.7+3.3)*0.17; }
// sweep coordinate: rises from bottom, slight diagonal, ink-bleed warp
float sweep(vec2 uv){ return uv.y*0.82 + uv.x*0.18 + (fbm(uv*vec2(3.0,2.2)) - 0.5)*0.22; }
`,Ae=`
uniform sampler2D uDepth; uniform vec2 uCovB; uniform float uAmount; uniform float uSeam; uniform float uRise;
varying vec2 vUv; varying float vD; varying float vF;
${ae}
void main(){
  vUv = uv;
  vec2 ub = (uv - 0.5) * uCovB + 0.5;
  float d = texture2D(uDepth, ub).r;
  float f = sweep(uv);
  vF = f;
  float behind = smoothstep(uSeam, uSeam - 0.38, f);       // fully risen well behind the seam
  float wave = exp(-pow((f - uSeam) * 14.0, 2.0)) * 0.06;  // little lift right at the seam
  vD = d;
  vec2 ef = smoothstep(vec2(0.0), vec2(0.1), uv) * smoothstep(vec2(0.0), vec2(0.1), 1.0 - uv); // frame border stays flat
  vec3 p = position;
  p.z += (d - 0.35) * uAmount * behind * uRise * ef.x * ef.y + wave * step(0.001, uRise) * (1.0 - step(0.999, uRise));
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`,Me=`
uniform sampler2D uA; uniform sampler2D uB; uniform vec2 uCovA; uniform vec2 uCovB;
uniform float uSeam; uniform float uGlow; uniform float uOpacity; uniform float uSketch; uniform vec3 uPaper; uniform float uTime;
varying vec2 vUv; varying float vD; varying float vF;
${ae}
void main(){
  vec2 ua = (vUv - 0.5) * uCovA + 0.5, ub = (vUv - 0.5) * uCovB + 0.5;
  vec3 a = texture2D(uA, ua).rgb;
  vec3 b = texture2D(uB, ub).rgb;
  // before: lies on the paper (sketches multiply into the page; photos get a light paper wash)
  vec3 aOn = mix(a * mix(vec3(1.0), uPaper, 0.08) * 0.97, a * uPaper * 1.02, uSketch);
  float lum = dot(aOn, vec3(0.299, 0.587, 0.114));
  aOn = mix(aOn, vec3(lum) * vec3(1.02, 0.99, 0.94), 0.25 * (1.0 - uSketch));
  float f = vF;
  float dist = f - uSeam;                               // >0 = still before
  float m = smoothstep(0.012, -0.012, dist);            // 1 = after revealed
  // wet ink bleeding ahead of the seam
  float bleed = smoothstep(0.09, 0.0, dist) * step(0.0, dist);
  aOn *= 1.0 - bleed * 0.45 * uGlow;
  // after: photographic grade + depth-aware light + vignette
  vec2 q = vUv - 0.5;
  float vig = 1.0 - dot(q, q) * 0.55;
  vec3 bb = b * vig * (0.94 + vD * 0.1);
  float g = (h2(vUv * 900.0 + fract(uTime) * 37.0) - 0.5) * 0.025;
  bb += g;
  vec3 col = mix(aOn, bb, m);
  // glowing seam (fake bloom = tight core + wide halo)
  float core = exp(-abs(dist) * 140.0), halo = exp(-abs(dist) * 22.0);
  col += (vec3(1.0, 0.86, 0.62) * core * 1.1 + vec3(0.85, 0.5, 0.22) * halo * 0.38) * uGlow;
  // soft frame edge
  vec2 e = smoothstep(vec2(0.0), vec2(0.006), vUv) * smoothstep(vec2(0.0), vec2(0.006), 1.0 - vUv);
  gl_FragColor = vec4(col, e.x * e.y * uOpacity);
  #include <colorspace_fragment>
}`,Re="varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",Pe=`
uniform float uA; uniform vec2 uK; varying vec2 vUv;
void main(){
  vec2 p = (vUv - 0.5) * uK;              // uK = plane size / frame size
  vec2 d = max(abs(p) - 0.5, 0.0);
  float s = exp(-dot(d, d) * 90.0);
  gl_FragColor = vec4(0.09, 0.07, 0.05, s * uA);
}`,je=`
attribute vec3 aR; uniform float uTime; uniform float uSeam; uniform vec2 uSize; uniform float uPx;
varying float vA;
void main(){
  float life = fract(aR.y + uTime * (0.12 + aR.z * 0.18));
  float x = aR.x - 0.5;
  // follow the (unwarped) seam line: uv.y*0.82 + uv.x*0.18 = seam
  float sy = (uSeam - (aR.x) * 0.18) / 0.82;
  float y = sy + life * (0.10 + aR.z * 0.14) - 0.5;
  vec3 p = vec3(x * uSize.x + sin(life * 6.0 + aR.z * 20.0) * 0.03, y * uSize.y, 0.08 + life * 0.35 * aR.z);
  vA = smoothstep(0.0, 0.15, life) * (1.0 - life) * step(-0.5, y) * step(y, 0.5);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = uPx * (0.6 + aR.z) / -mv.z;
  gl_Position = projectionMatrix * mv;
}`,Ce=`
uniform float uGlow; varying float vA;
void main(){ vec2 c = gl_PointCoord - 0.5; float d = length(c); float a = smoothstep(0.5, 0.0, d);
  gl_FragColor = vec4(vec3(1.0, 0.78, 0.48) * (1.0 + a), a * a * vA * uGlow); }`,Q=(r,l)=>r>l?new O(l/r,1):new O(1,r/l);function ze({i:r,texA:l,texB:f,texD:h,state:w,mobile:S}){const t=W[r],d=P*t,m=S?96:200,U=i.useMemo(()=>new de(d,P,t>=1?m:Math.round(m*t),t>=1?Math.round(m/t):m),[d,m,t]),C=l.image.width/l.image.height,k=f.image.width/f.image.height,v=i.useMemo(()=>({uA:{value:l},uB:{value:f},uDepth:{value:h},uCovA:{value:Q(C,t)},uCovB:{value:Q(k,t)},uAmount:{value:be[r]},uSeam:{value:-.3},uRise:{value:0},uGlow:{value:0},uOpacity:{value:1},uSketch:{value:ye[r]?1:0},uPaper:{value:oe},uTime:{value:0}}),[l,f,h]),s=i.useMemo(()=>({uA:{value:0},uK:{value:new O(1.5,1.5)}}),[]),a=S?90:220,o=i.useMemo(()=>{const e=new ge,g=new Float32Array(a*3);for(let u=0;u<a*3;u++)g[u]=Math.random();return e.setAttribute("position",new X(new Float32Array(a*3),3)),e.setAttribute("aR",new X(g,3)),e.boundingSphere=new xe(new $,5),e},[a]),n=i.useMemo(()=>({uTime:{value:0},uSeam:{value:0},uSize:{value:new O(d,P)},uGlow:{value:0},uPx:{value:60}}),[d]),p=i.useRef(),z=i.useRef(),A=i.useRef();return ee((e,g)=>{const u=w.current;if(!u.on)return;const G=p.current,T=Math.abs(u.cam-r)<1.15;if(G.visible=T,!T)return;const _=u.r[r],b=v.uRise.value,y=R(b,_,5,g);v.uRise.value=y,v.uSeam.value=-.3+y*1.6,v.uGlow.value=j(0,.06,y)*(1-j(.88,1,y)),v.uTime.value=e.clock.elapsedTime,v.uOpacity.value=u.op,n.uTime.value=e.clock.elapsedTime,n.uSeam.value=v.uSeam.value,n.uGlow.value=v.uGlow.value*u.op,n.uPx.value=46*Math.min(e.gl.getPixelRatio(),1.5)*(e.size.height/800);const M=j(.1,1,y);z.current.position.z=M*.12,s.uA.value=M*.55*u.op,A.current.position.set(M*.08,-M*.14,-.01)}),c.jsxs("group",{ref:p,position:[r*te,0,0],children:[c.jsxs("mesh",{ref:A,renderOrder:1,children:[c.jsx("planeGeometry",{args:[d*1.5,P*1.5]}),c.jsx("shaderMaterial",{uniforms:s,vertexShader:Re,fragmentShader:Pe,transparent:!0,depthWrite:!1})]}),c.jsxs("group",{ref:z,children:[c.jsx("mesh",{geometry:U,renderOrder:2,children:c.jsx("shaderMaterial",{uniforms:v,vertexShader:Ae,fragmentShader:Me,transparent:!0})}),c.jsx("points",{geometry:o,renderOrder:3,children:c.jsx("shaderMaterial",{uniforms:n,vertexShader:je,fragmentShader:Ce,transparent:!0,depthWrite:!1,blending:we})})]})]})}const Z=new $,Ge="void main(){ gl_Position = vec4(position.xy * 2.0, 0.9999, 1.0); }",Te=`uniform vec3 uC; uniform float uA; void main(){ gl_FragColor = vec4(uC, uA);
  #include <colorspace_fragment>
}`;function _e({track:r}){const l=i.useMemo(Se,[]),f=l,h=i.useMemo(()=>[...F.map(s=>`/portfolio/yts/img/${s.a}${f?"-s":""}.webp`),...F.map(s=>`/portfolio/yts/img/${s.b}${f?"-s":""}.webp`),...F.map(s=>`/portfolio/yts/depth/${s.b}.webp`)],[f]),w=le(ve,h),{gl:S,camera:t,scene:d}=fe();i.useEffect(()=>{w.forEach((o,n)=>{n<8&&(o.colorSpace=me,o.anisotropy=4),o.generateMipmaps=n<8,n>=8&&(o.minFilter=pe),o.needsUpdate=!0;try{S.initTexture(o)}catch{}});const s=m.current;if(!s)return;const a=[];s.traverse(o=>{a.push([o,o.visible]),o.visible=!0});try{S.compile(s,t,d)}catch{}a.forEach(([o,n])=>{o.visible=n})},[w,S,t,d]);const m=i.useRef(),U=i.useRef(),C=i.useMemo(()=>({uC:{value:oe},uA:{value:0}}),[]),k=i.useRef({on:!1,cam:0,r:[0,0,0,0],op:0}),v=i.useRef({c:0,wasActive:!1,op:0});return ee((s,a)=>{const o=r.current,n=m.current,p=k.current;if(p.on=o.on,!n)return;if(n.visible=o.on,!o.on){v.current.wasActive=!1;return}const z=Math.min(o.p,.9999)*4;for(let x=0;x<4;x++)p.r[x]=j(.06,.72,z-x);let A=0;for(let x=0;x<3;x++)A+=j(.8,1,z-x);const e=v.current;if(e.c=e.wasActive?R(e.c,A,4.5,a):A,p.cam=e.c,e.op=R(e.op,j(.25,.75,o.v),6,a),p.op=e.op,C.uA.value=J.active==="sketch"?1:0,U.current.visible=C.uA.value>0,J.active!=="sketch"){e.wasActive=!1;return}const g=s.size.width/s.size.height;t.fov!==40&&(t.fov=40,t.updateProjectionMatrix());const u=2*Math.tan(V.degToRad(t.fov/2)),G=Math.min(3,Math.floor(e.c)),T=e.c-G,_=V.lerp(W[G],W[Math.min(3,G+1)],T),b=g>1.05,y=b?.66:.36,M=b?.48:.74,I=Math.max(P/(y*u),P*_/(M*g*u)),H=I*u,re=H*g,se=b?-.17*re:0,ie=b?.02*H:0,ne=Math.sin(Math.PI*T),E=p.r[Math.round(e.c)]??0,ue=(E-.5)*.6*(b?1:.5)+D.x*.22,ce=-.18+E*.3+D.y*.12,K=B.x+e.c*te+se,L=B.y+ie,q=K+ue,N=L+ce,Y=I+ne*1.6-E*.25;e.wasActive?(t.position.x=R(t.position.x,q,5,a),t.position.y=R(t.position.y,N,5,a),t.position.z=R(t.position.z,Y,5,a)):(t.position.set(q,N,Y),e.wasActive=!0),Z.set(K,L,0),t.lookAt(Z)}),c.jsxs("group",{ref:m,position:B.toArray(),visible:!1,children:[c.jsxs("mesh",{ref:U,frustumCulled:!1,renderOrder:-5,children:[c.jsx("planeGeometry",{args:[1,1]}),c.jsx("shaderMaterial",{uniforms:C,vertexShader:Ge,fragmentShader:Te,transparent:!0,depthTest:!1,depthWrite:!1})]}),F.map((s,a)=>c.jsx(ze,{i:a,texA:w[a],texB:w[4+a],texD:w[8+a],state:k,mobile:l},a))]})}export{_e as default};
