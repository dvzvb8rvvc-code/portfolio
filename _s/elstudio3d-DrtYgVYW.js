import{j as a,r}from"./kit-CRmoX2bk.js";import{C as f,a as d,c as z,b as n,I as h,u as g}from"./react-three-fiber.esm-PPrcSziY.js";const m=`
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z); vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`,w=m+`
uniform float uTime, uRough;
varying vec3 vN; varying vec3 vV; varying vec3 vP;
float f(vec3 p){
  float soft = snoise(p * 1.8 + vec3(0.0, uTime * 0.06, 0.0)) * 0.035;
  float ridge = (1.0 - abs(snoise(p * vec3(3.0, 9.0, 3.0)))) * 0.02;
  return soft * (0.4 + uRough) + ridge * uRough;
}
vec3 disp(vec3 p){ vec3 n = normalize(p); return n * (1.0 + f(n)); }
void main(){
  vec3 n = normalize(position);
  vec3 t = normalize(cross(n, vec3(0.0, 1.0, 0.13)));
  vec3 bt = cross(n, t);
  float e = 0.012;
  vec3 p0 = disp(n), p1 = disp(n + t * e), p2 = disp(n + bt * e);
  vec3 N = normalize(cross(p1 - p0, p2 - p0));
  if (dot(N, n) < 0.0) N = -N;
  vP = n;
  vN = normalize(normalMatrix * N);
  vec4 mv = modelViewMatrix * vec4(p0, 1.0);
  vV = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`,b=m+`
uniform float uSpots; uniform vec3 cA, cB, cRim;
varying vec3 vN; varying vec3 vV; varying vec3 vP;
void main(){
  vec3 N = normalize(vN), V = normalize(vV);
  vec3 L = normalize(vec3(-0.4, 0.75, 0.55));
  float dif = 0.72 + 0.32 * max(dot(N, L), 0.0);
  vec3 col = mix(cA, cB, smoothstep(-0.8, 0.9, vP.y));
  float sp = smoothstep(0.45, 0.75, snoise(vP * 4.2)) * uSpots;
  col = mix(col, col * vec3(0.78, 0.66, 0.58), sp * 0.6);
  vec3 H = normalize(L + V);
  float spec = pow(max(dot(N, H), 0.0), 38.0) * 0.28;
  float fr = pow(1.0 - max(dot(N, V), 0.0), 2.4);
  col = col * dif + spec + cRim * fr * 0.55;
  gl_FragColor = vec4(col, 1.0);
}`;function N({progress:c}){const e=r.useRef(),{size:l}=d(),i=r.useMemo(()=>new z({vertexShader:w,fragmentShader:b,uniforms:{uTime:{value:0},uRough:{value:1},uSpots:{value:1},cA:{value:new n("#efd8c8")},cB:{value:new n("#fbf1e9")},cRim:{value:new n("#bcd6cb")}}}),[]),p=r.useMemo(()=>new h(1,20),[]);return g((v,s)=>{const x=v.clock.elapsedTime,u=c?c.get():0,t=Math.min(1,Math.max(0,x/3)),y=(.8-.6*(t*t*(3-2*t)))*(1-u),o=i.uniforms;o.uTime.value=x,o.uRough.value+=(y-o.uRough.value)*Math.min(1,s*3),o.uSpots.value=o.uRough.value,e.current.rotation.y+=s*.12,e.current.rotation.x=.15+v.pointer.y*.12,e.current.rotation.z=v.pointer.x*.08,e.current.scale.setScalar(l.width<500?1.05:1.2)}),a.jsx("mesh",{ref:e,geometry:p,material:i})}function C({progress:c,active:e}){return a.jsx(f,{frameloop:e?"always":"never",dpr:[1,1.6],camera:{position:[0,0,4.2],fov:38},gl:{antialias:!0,alpha:!0},style:{pointerEvents:"none"},children:a.jsx(N,{progress:c})})}export{C as default};
