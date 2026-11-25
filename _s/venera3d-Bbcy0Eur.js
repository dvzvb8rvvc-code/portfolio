import{j as t,r as n}from"./kit-DG8De6dg.js";import{C as z,au as w,ac as S,a as I,c as j,b as p,D as C,h as N,u as b}from"./react-three-fiber.esm--0B19njQ.js";const T=[[.16,.34],[.36,.54],[.56,.74],[.76,.94]],A=`
varying vec3 vN; varying vec3 vV; varying vec3 vP;
void main(){ vP = position; vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position,1.0); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,F=`
uniform float uTime; uniform vec3 cA, cB, cC;
varying vec3 vN; varying vec3 vV; varying vec3 vP;
void main(){
  float lat = vP.y;
  float band = sin(lat * 9.0 + sin(vP.x * 3.0 + uTime * 0.15) * 0.6) * 0.5 + 0.5;
  float band2 = sin(lat * 23.0 + vP.z * 2.0 - uTime * 0.1) * 0.5 + 0.5;
  vec3 col = mix(cA, cB, band * 0.55 + band2 * 0.15);
  vec3 N = normalize(vN); vec3 V = normalize(vV);
  vec3 L = normalize(vec3(-0.5, 0.7, 0.6));
  float dif = 0.55 + 0.45 * max(dot(N, L), 0.0);
  float fr = pow(1.0 - max(dot(N, V), 0.0), 2.6);
  vec3 irid = mix(cC, vec3(0.86, 0.8, 0.95), sin(fr * 6.0 + uTime * 0.2) * 0.5 + 0.5);
  vec3 H = normalize(L + V);
  float spec = pow(max(dot(N, H), 0.0), 60.0) * 0.35;
  col = col * dif + irid * fr * 0.7 + spec;
  gl_FragColor = vec4(col, 1.0);
}`,B=`
varying float vR; void main(){ vR = length(position.xy); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,L=`
uniform vec3 cR; varying float vR;
void main(){
  float t = (vR - 1.45) / 0.95;
  float bands = 0.55 + 0.45 * sin(t * 40.0) * sin(t * 13.0 + 1.0);
  float edge = smoothstep(0.0, 0.08, t) * smoothstep(1.0, 0.85, t);
  float gap = 1.0 - 0.8 * smoothstep(0.03, 0.0, abs(t - 0.62));
  float a = edge * gap * (0.35 + 0.4 * bands);
  gl_FragColor = vec4(cR, a * 0.85);
}`;function G({count:a=260}){const s=n.useMemo(()=>{const o=new w,e=new Float32Array(a*3);for(let r=0;r<a;r++)e[r*3]=(Math.random()-.5)*18,e[r*3+1]=(Math.random()-.5)*10,e[r*3+2]=-3-Math.random()*4;return o.setAttribute("position",new S(e,3)),o},[a]);return t.jsx("points",{geometry:s,children:t.jsx("pointsMaterial",{color:"#b98d66",size:.035,sizeAttenuation:!0,transparent:!0,opacity:.7,depthWrite:!1})})}function _({i:a,rot:s,act:o}){const e=n.useRef(),r=n.useRef(),h=a/4*Math.PI*2;return b(()=>{const c=h+s.current,v=2.75;e.current.position.set(Math.cos(c)*v,0,Math.sin(c)*v);const f=o.current===a,d=e.current.scale.x+((f?1.7:1)-e.current.scale.x)*.08;e.current.scale.setScalar(d),r.current.emissiveIntensity+=((f?.55:.08)-r.current.emissiveIntensity)*.08}),t.jsxs("mesh",{ref:e,children:[t.jsx("sphereGeometry",{args:[.1,32,32]}),t.jsx("meshStandardMaterial",{ref:r,color:"#fbf3ee",emissive:"#e9a9a6",emissiveIntensity:.1,roughness:.25,metalness:.1})]})}function E({progress:a,mobile:s}){const{size:o}=I(),e=n.useRef(),r=n.useRef(),h=n.useRef(),c=n.useRef(0),v=n.useRef(-1),f=n.useMemo(()=>new j({vertexShader:A,fragmentShader:F,uniforms:{uTime:{value:0},cA:{value:new p("#f6ebe7")},cB:{value:new p("#e3b3b2")},cC:{value:new p("#f2c9a8")}}}),[]),d=n.useMemo(()=>new j({vertexShader:B,fragmentShader:L,transparent:!0,depthWrite:!1,side:C,uniforms:{cR:{value:new p("#c99a8e")}}}),[]),R=n.useMemo(()=>{const i=[];for(let l=0;l<=128;l++){const u=l/128*Math.PI*2;i.push(new N(Math.cos(u)*2.75,0,Math.sin(u)*2.75))}return new w().setFromPoints(i)},[]);return b((i,l)=>{const u=a.get(),M=i.clock.elapsedTime;f.uniforms.uTime.value=M,r.current.rotation.y+=l*.08;const x=T.findIndex(([y,m])=>u>=y&&u<=m+.02);if(v.current=x,x<0)c.current+=l*.12;else{let m=Math.PI/2-x/4*Math.PI*2-c.current;m=Math.atan2(Math.sin(m),Math.cos(m)),c.current+=m*Math.min(1,l*2.2)}const g=o.width/o.height>1.1,P=s?0:g?1.75-u*.35:.6,V=s?0:g?.35:.6;e.current.position.x+=(P-e.current.position.x)*.1,e.current.position.y+=(V+Math.sin(M*.5)*.05-e.current.position.y)*.1,e.current.scale.setScalar(s?.62:g?.95+u*.1:.75),e.current.rotation.x=.32+i.pointer.y*.05,e.current.rotation.z=-.22+i.pointer.x*.04}),t.jsxs("group",{ref:e,children:[t.jsx("mesh",{ref:r,material:f,children:t.jsx("sphereGeometry",{args:[1,48,48]})}),t.jsx("mesh",{rotation:[-Math.PI/2,0,0],material:d,children:t.jsx("ringGeometry",{args:[1.45,2.4,128,1]})}),t.jsxs("group",{ref:h,children:[t.jsx("line",{geometry:R,children:t.jsx("lineBasicMaterial",{color:"#b98d66",transparent:!0,opacity:.35})}),[0,1,2,3].map(i=>t.jsx(_,{i,rot:c,act:v},i))]})]})}function W({progress:a,active:s,mobile:o}){return t.jsxs(z,{frameloop:s?"always":"never",dpr:[1,1.6],camera:{position:[0,0,7.5],fov:35},gl:{antialias:!0,alpha:!0},style:{pointerEvents:"none"},children:[t.jsx("ambientLight",{intensity:.8}),t.jsx("directionalLight",{position:[-3,4,4],intensity:1.3}),t.jsx(G,{count:o?120:260}),t.jsx(E,{progress:a,mobile:o})]})}export{W as default};
