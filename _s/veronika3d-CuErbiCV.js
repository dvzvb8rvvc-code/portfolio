import{j as p,r as l,F as M}from"./kit-B9vXdzke.js";import{C as z,u as T,_ as b,ap as S,S as A,a as m,D as N,a1 as j,b as B}from"./react-three-fiber.esm-BxSUdgq5.js";const d=[[.18,.34],[.38,.54],[.58,.74],[.78,.92]],f=(c,t,s)=>{const o=Math.min(1,Math.max(0,(s-c)/(t-c)));return o*o*(3-2*o)},L=`
attribute float aSeed;
attribute float aLane;
uniform float uTime, uCurl, uSpread;
varying float vX; varying float vSeed; varying vec3 vN; varying vec3 vT; varying vec3 vV;
vec3 path(float x){
  float t = uTime * 0.32;
  vec3 c = vec3(x * 3.2, sin(x * 2.3 + t) * 0.42 + sin(x * 5.0 - t * 0.7 + aSeed * 2.0) * 0.06, cos(x * 1.6 + t * 0.8) * 0.32);
  float a = x * 2.0 + t * 0.45;
  float w = aLane * 0.95 * uSpread;
  float d = (aSeed - 0.5) * 0.45 * uSpread;
  c.y += sin(x * 3.1 + aSeed * 6.2831 + t * 1.3) * 0.07;
  c.z += cos(x * 2.7 + aSeed * 4.0 + t) * 0.07;
  c.y += cos(a) * w - sin(a) * d;
  c.z += sin(a) * w + cos(a) * d;
  float ph = x * 34.0 + aSeed * 6.2831 + t * 0.4;
  float r = 0.055 * uCurl * smoothstep(-0.9, 0.3, x);
  c.y += cos(ph) * r; c.z += sin(ph) * r;
  return c;
}
void main(){
  float x = position.x;
  vec3 p = path(x);
  vec3 T = normalize(path(x + 0.004) - p);
  vec3 up = abs(T.y) < 0.9 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
  vec3 B = normalize(cross(T, up));
  vec3 N = cross(B, T);
  vec3 w = p + N * position.y + B * position.z;
  vN = normalize(normalMatrix * (N * normal.y + B * normal.z));
  vT = normalize(normalMatrix * T);
  vec4 mv = modelViewMatrix * vec4(w, 1.0);
  vV = normalize(-mv.xyz);
  vX = x; vSeed = aSeed;
  gl_Position = projectionMatrix * mv;
}`,D=`
uniform float uCut, uColor, uGloss;
uniform vec3 cA, cB, cC, cD;
varying float vX; varying float vSeed; varying vec3 vN; varying vec3 vT; varying vec3 vV;
void main(){
  float end = mix(1.0, 0.25 + vSeed * 0.07, uCut);
  if (vX > end) discard;
  vec3 base = mix(cA, cB, vSeed);
  vec3 dyed = mix(cC, cD, vSeed);
  float sweep = mix(1.3, -1.3, uColor);
  float m = smoothstep(sweep - 0.25, sweep + 0.25, vX);
  vec3 col = mix(base, dyed, m);
  vec3 L = normalize(vec3(0.35, 0.8, 0.6));
  vec3 N = normalize(vN);
  float dif = 0.5 + 0.5 * max(dot(N, L), 0.0);
  vec3 H = normalize(L + vV);
  float th = dot(normalize(vT), H);
  float spec = pow(sqrt(max(0.0, 1.0 - th * th)), 70.0) * (0.25 + 0.6 * uGloss);
  float spec2 = pow(sqrt(max(0.0, 1.0 - th * th)), 12.0) * 0.12;
  col = col * dif + spec * vec3(1.0, 0.92, 0.82) + spec2 * col;
  gl_FragColor = vec4(col, 1.0);
}`;function R({progress:c,count:t}){const s=l.useRef(),o=l.useRef(),{size:x}=T(),w=l.useMemo(()=>{const r=new b(.013,.013,2,5,160,!0);r.rotateZ(-Math.PI/2);const u=new Float32Array(t),n=new Float32Array(t);for(let a=0;a<t;a++)u[a]=Math.random(),n[a]=a/(t-1)*2-1+(Math.random()-.5)*.04;return r.setAttribute("aSeed",new S(u,1)),r.setAttribute("aLane",new S(n,1)),r},[t]),h=l.useMemo(()=>new A({vertexShader:L,fragmentShader:D,side:N,uniforms:{uTime:{value:0},uCurl:{value:0},uSpread:{value:1},uCut:{value:0},uColor:{value:0},uGloss:{value:.2},cA:{value:new m("#5a3322")},cB:{value:new m("#94573a")},cC:{value:new m("#bb6a3d")},cD:{value:new m("#e3ad74")}}}),[]),g=l.useMemo(()=>new j,[]);M.useLayoutEffect(()=>{for(let r=0;r<t;r++)s.current.setMatrixAt(r,g.matrix);s.current.instanceMatrix.needsUpdate=!0},[t,g]);const C=l.useRef({cut:0,col:0,curl:0,gloss:.2,spread:1});return B((r,u)=>{const n=c.get(),a=h.uniforms,i=Math.min(1,u*4),e=C.current;e.cut+=(f(...d[0],n)-e.cut)*i,e.col+=(f(...d[1],n)-e.col)*i,e.curl+=(f(...d[2],n)-e.curl)*i;const y=f(...d[3],n);e.gloss+=(.2+y*.8-e.gloss)*i,e.spread+=(1-y*.45-e.spread)*i,a.uTime.value+=u,a.uCut.value=e.cut,a.uColor.value=e.col,a.uCurl.value=e.curl,a.uGloss.value=e.gloss,a.uSpread.value=e.spread;const v=x.width/x.height;o.current.rotation.z=v>1.1?-.95:-.6,o.current.position.set(v>1.1?.2:.15,v>1.1?.3:.2,0),o.current.scale.setScalar(v>1.1?.62:.5),o.current.rotation.y=Math.sin(a.uTime.value*.15)*.15+r.pointer.x*.08}),p.jsx("group",{ref:o,children:p.jsx("instancedMesh",{ref:s,args:[w,h,t],frustumCulled:!1})})}function V({progress:c,active:t,count:s=70}){return p.jsx(z,{frameloop:t?"always":"never",dpr:[1,1.6],camera:{position:[0,0,6],fov:35},gl:{antialias:!0,alpha:!0},style:{pointerEvents:"none"},children:p.jsx(R,{progress:c,count:s})})}export{V as default};
