import{r,j as e,F as P}from"./kit-B9vXdzke.js";import{a as N,b as k,a2 as D,w as z,ak as W,S as A,C as L,u as $,aq as q,aJ as H,ao as I,V as J,$ as C,ay as Y,D as F,ae as E,a4 as K,ag as V}from"./react-three-fiber.esm-BxSUdgq5.js";import{E as O,B as U}from"./Bloom-Cc6FKeE6.js";import{V as X}from"./Vignette-DJs2MJBW.js";import{v as Q}from"./constants-CIMWHpzV.js";class Z extends A{constructor(){super({uniforms:{time:{value:0},fade:{value:1}},vertexShader:`
      uniform float time;
      attribute float size;
      varying vec3 vColor;
      void main() {
        vColor = color;
        vec4 mvPosition = modelViewMatrix * vec4(position, 0.5);
        gl_PointSize = size * (30.0 / -mvPosition.z) * (3.0 + sin(time + 100.0));
        gl_Position = projectionMatrix * mvPosition;
      }`,fragmentShader:`
      uniform sampler2D pointTexture;
      uniform float fade;
      varying vec3 vColor;
      void main() {
        float opacity = 1.0;
        if (fade == 1.0) {
          float d = distance(gl_PointCoord, vec2(0.5, 0.5));
          opacity = 1.0 / (1.0 + exp(16.0 * (d - 0.25)));
        }
        gl_FragColor = vec4(vColor, opacity);

        #include <tonemapping_fragment>
	      #include <${Q>=154?"colorspace_fragment":"encodings_fragment"}>
      }`})}}const ee=o=>new z().setFromSpherical(new W(o,Math.acos(1-Math.random()*2),Math.random()*2*Math.PI)),te=r.forwardRef(({radius:o=100,depth:n=50,count:t=5e3,saturation:a=0,factor:h=4,fade:w=!1,speed:x=1},f)=>{const i=r.useRef(),[S,M,l]=r.useMemo(()=>{const g=[],u=[],c=Array.from({length:t},()=>(.5+.5*Math.random())*h),p=new N;let v=o+n;const y=n/t;for(let s=0;s<t;s++)v-=y*Math.random(),g.push(...ee(v).toArray()),p.setHSL(s/t,a,.9),u.push(p.r,p.g,p.b);return[new Float32Array(g),new Float32Array(u),new Float32Array(c)]},[t,n,h,o,a]);k(g=>i.current&&(i.current.uniforms.time.value=g.clock.elapsedTime*x));const[m]=r.useState(()=>new Z);return r.createElement("points",{ref:f},r.createElement("bufferGeometry",null,r.createElement("bufferAttribute",{attach:"attributes-position",args:[S,3]}),r.createElement("bufferAttribute",{attach:"attributes-color",args:[M,3]}),r.createElement("bufferAttribute",{attach:"attributes-size",args:[l,1]})),r.createElement("primitive",{ref:i,object:m,attach:"material",blending:D,"uniforms-fade-value":w,depthWrite:!1,transparent:!0,vertexColors:!0}))}),oe=(o,n=0,t=1)=>Math.min(t,Math.max(n,o)),j=10,_=`
uniform float uNight; uniform vec3 uGlowDir;
vec3 sky(vec3 d){
  float h = clamp(d.y, -0.2, 1.);
  vec3 top = mix(vec3(.05,.1,.2), vec3(.008,.015,.04), uNight);
  vec3 hor = mix(vec3(.36,.47,.6), vec3(.07,.1,.19), uNight);
  vec3 c = mix(hor, top, pow(clamp(h * 2.2, 0., 1.), .6));
  float g = pow(max(dot(normalize(vec3(d.x, 0., d.z)), uGlowDir), 0.), 6.) * exp(-max(h, 0.) * 9.);
  c += vec3(1., .55, .3) * g * mix(.95, .35, uNight);
  c += vec3(.95, .6, .45) * exp(-abs(h) * 30.) * .12 * (1. - uNight * .6);
  return c;
}`,ae="varying vec3 vD; void main(){ vD = normalize(position); vec4 p = projectionMatrix * modelViewMatrix * vec4(position,1.); gl_Position = p.xyww; }",re=`${_}
varying vec3 vD; void main(){ gl_FragColor = vec4(sky(normalize(vD)), 1.);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`,ne="varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position,1.); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }",ie=`${_}
uniform float uT; uniform vec4 uRip[${j}]; uniform vec3 uBoat; uniform vec3 uCam;
varying vec3 vW;
float H(vec2 p){
  float h = 0.;
  h += sin(dot(p, vec2(.8,.6)) * 1.1 + uT * 1.1) * .05;
  h += sin(dot(p, vec2(-.5,.86)) * 1.9 + uT * 1.5) * .025;
  h += sin(dot(p, vec2(.95,-.3)) * 3.7 + uT * 2.3) * .012;
  h += sin(dot(p, vec2(.2,1.)) * 6.3 - uT * 2.9) * .006;
  h += sin(dot(p, vec2(-.9,.4)) * 11. + uT * 3.6) * .003;
  for (int i = 0; i < ${j}; i++){
    vec4 r = uRip[i]; float age = uT - r.z; if (age < 0. || age > 5.) continue;
    float d = length(p - r.xy); float front = age * 1.9;
    float env = exp(-pow((d - front) * 1.3, 2.)) * exp(-age * .7) * r.w;
    h += sin((d - front) * 9.) * env * .09;
  }
  return h;
}
void main(){
  vec2 p = vW.xz; float e = .03 + length(vW - uCam) * .004;
  float h = H(p);
  vec3 n = normalize(vec3(-(H(p + vec2(e,0.)) - h) / e, 1., -(H(p + vec2(0.,e)) - h) / e));
  vec3 V = normalize(uCam - vW);
  float dist = length(vW - uCam);
  n = normalize(mix(n, vec3(0.,1.,0.), smoothstep(10., 60., dist) * .7));
  vec3 R = reflect(-V, n); R.y = abs(R.y);
  float F = .03 + .97 * pow(1. - max(dot(n, V), 0.), 5.);
  vec3 deep = mix(vec3(.02,.05,.08), vec3(.01,.02,.04), uNight);
  vec3 col = mix(deep, sky(R), clamp(F * 1.15, 0., 1.));
  // boat: dark reflection + warm mast-light streak
  float bx = vW.x - uBoat.x - n.x * 1.2, bz = vW.z - uBoat.z;
  float under = step(0., bz) * exp(-bx * bx * 5.) * exp(-bz * .9) * smoothstep(0., .2, bz);
  col *= 1. - under * .55;
  float lx = vW.x - uBoat.x - n.x * 2.2;
  float streak = exp(-lx * lx * 30.) * step(0., bz) * exp(-bz * .22) * (.5 + .5 * smoothstep(.0, .02, n.x * n.x + n.z * n.z));
  col += vec3(1., .7, .38) * streak * 1.3 * (.4 + uNight * .6);
  // afterglow glitter along the horizon direction
  float gl = pow(max(dot(R, normalize(vec3(uGlowDir.x, .06, uGlowDir.z))), 0.), 160.);
  col += vec3(1., .62, .35) * gl * 2.2 * (1. - uNight * .5);
  col = mix(col, sky(normalize(vec3(-V.x, .0, -V.z))), smoothstep(25., 70., dist));
  gl_FragColor = vec4(col, 1.);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;function b(o,n,t){return Math.sin((o*.8+n*.6)*1.1+t*1.1)*.05+Math.sin((-o*.5+n*.86)*1.9+t*1.5)*.025}function se(){const o=new E;o.moveTo(-1.1,.18),o.lineTo(1.25,.2),o.quadraticCurveTo(.9,-.12,.6,-.16),o.lineTo(-.85,-.14),o.quadraticCurveTo(-1.05,-.05,-1.1,.18);const n=new K(o,{depth:.34,bevelEnabled:!0,bevelSize:.04,bevelThickness:.06,bevelSegments:2,curveSegments:10});n.translate(0,0,-.17);const t=new E;t.moveTo(-.05,.32),t.lineTo(-.95,.32),t.quadraticCurveTo(-.4,1.3,-.05,2.55),t.lineTo(-.05,.32);const a=new E;return a.moveTo(.06,.4),a.lineTo(1.18,.26),a.quadraticCurveTo(.5,1.1,.06,2.35),a.lineTo(.06,.4),{hullG:n,mainG:new V(t,12),jibG:new V(a,12)}}function le({boat:o,progress:n}){const t=r.useRef(),{hullG:a,mainG:h,jibG:w}=r.useMemo(se,[]);return k(({clock:x},f)=>{const i=x.elapsedTime,M=-7.5+n.get()*13+Math.sin(i*.1)*.3,l=-7;t.current.position.x=C.damp(t.current.position.x,M,2,f),t.current.position.z=l;const m=t.current.position.x;t.current.position.y=b(m,l,i)-.02,t.current.rotation.z=(b(m+.6,l,i)-b(m-.6,l,i))*.8,t.current.rotation.x=(b(m,l+.3,i)-b(m,l-.3,i))*.9,o.set(m,0,l)}),e.jsxs("group",{ref:t,"rotation-y":-.12,scale:.95,children:[e.jsx("mesh",{geometry:a,children:e.jsx("meshStandardMaterial",{color:"#0a0f16",roughness:.6,metalness:.1})}),e.jsxs("mesh",{position:[0,1.3,0],children:[e.jsx("cylinderGeometry",{args:[.018,.022,2.6,6]}),e.jsx("meshStandardMaterial",{color:"#0a0f16"})]}),e.jsx("mesh",{geometry:h,"position-z":-.01,children:e.jsx("meshStandardMaterial",{color:"#c9ced3",emissive:"#ffb27a",emissiveIntensity:.12,roughness:.9,side:F,transparent:!0,opacity:.9})}),e.jsx("mesh",{geometry:w,"position-z":.02,children:e.jsx("meshStandardMaterial",{color:"#b9c0c7",emissive:"#ffb27a",emissiveIntensity:.08,roughness:.9,side:F,transparent:!0,opacity:.85})}),e.jsxs("mesh",{position:[-.02,2.64,0],children:[e.jsx("sphereGeometry",{args:[.035,10,8]}),e.jsx("meshBasicMaterial",{color:[6,3.6,1.8],toneMapped:!1})]}),e.jsxs("mesh",{position:[-.35,.3,.2],children:[e.jsx("boxGeometry",{args:[.3,.05,.02]}),e.jsx("meshBasicMaterial",{color:[3,1.9,1],toneMapped:!1})]})]})}function ce({progress:o,mobile:n,host:t}){const{camera:a,size:h}=$(),w=r.useMemo(()=>new z,[]),x=r.useMemo(()=>Array.from({length:j},()=>new q(0,0,-99,0)),[]),f=r.useMemo(()=>({uNight:{value:0},uGlowDir:{value:new z(-.75,0,-.66).normalize()}}),[]),i=r.useMemo(()=>({...f,uT:{value:0},uRip:{value:x},uBoat:{value:w},uCam:{value:new z}}),[]),S=r.useMemo(()=>({...f}),[]),M=r.useRef({i:0,last:0,lx:0,lz:0}),l=r.useMemo(()=>new H,[]),m=r.useMemo(()=>new I(new z(0,1,0),0),[]),g=r.useMemo(()=>new J,[]),u=r.useMemo(()=>new z,[]);return P.useEffect(()=>{const c=t.current;if(!c)return;const p=(s,R)=>{const T=c.getBoundingClientRect();if(g.set((s.clientX-T.left)/T.width*2-1,-((s.clientY-T.top)/T.height)*2+1),l.setFromCamera(g,a),!l.ray.intersectPlane(m,u))return;const d=M.current,G=i.uT.value,B=Math.hypot(u.x-d.lx,u.z-d.lz);!R&&(G-d.last<.09||B<.25)||(x[d.i].set(u.x,u.z,G,R?1.6:Math.min(1,.35+B*.4)),d.i=(d.i+1)%j,d.last=G,d.lx=u.x,d.lz=u.z)},v=s=>p(s,!1),y=s=>p(s,!0);return c.addEventListener("pointermove",v),c.addEventListener("pointerdown",y),()=>{c.removeEventListener("pointermove",v),c.removeEventListener("pointerdown",y)}},[a]),k(({pointer:c,clock:p},v)=>{const y=o.get();if(i.uT.value=p.elapsedTime,f.uNight.value=C.damp(f.uNight.value,oe(y*1.1),2,v),a.position.x=C.damp(a.position.x,c.x*.5,2,v),a.position.y=C.damp(a.position.y,1.25+c.y*.15-y*.2,2,v),a.position.z=n?6.5:6,a.lookAt(a.position.x*.3,.55,-10),i.uCam.value.copy(a.position),Math.random()<v*(n?.5:.35)){const s=M.current;x[s.i].set((Math.random()-.5)*8,-Math.random()*6+1,p.elapsedTime,.45),s.i=(s.i+1)%j}}),e.jsxs(e.Fragment,{children:[e.jsxs("mesh",{scale:80,renderOrder:-1,children:[e.jsx("sphereGeometry",{args:[1,32,16]}),e.jsx("shaderMaterial",{uniforms:S,vertexShader:ae,fragmentShader:re,side:Y,depthWrite:!1})]}),e.jsx(te,{radius:60,depth:10,count:n?700:1400,factor:2.2,saturation:0,fade:!0,speed:.4}),e.jsxs("mesh",{"rotation-x":-Math.PI/2,position:[0,0,-20],children:[e.jsx("planeGeometry",{args:[160,80]}),e.jsx("shaderMaterial",{uniforms:i,vertexShader:ne,fragmentShader:ie})]}),e.jsx("hemisphereLight",{args:["#6f87a6","#0b1420",.9]}),e.jsx("directionalLight",{position:[-8,2,-10],color:"#ffb27a",intensity:1.4}),e.jsx(le,{boat:w,progress:o})]})}function he({progress:o,active:n,mobile:t,lite:a,host:h}){return e.jsxs(L,{frameloop:n?"always":"never",dpr:[1,t?1.25:1.5],gl:{antialias:!0,powerPreference:"high-performance"},camera:{fov:t?62:42,position:[0,1.25,6],near:.1,far:200},style:{position:"absolute",inset:0},eventSource:h,children:[e.jsx(ce,{progress:o,mobile:t,host:h}),!a&&!t&&e.jsxs(O,{multisampling:0,disableNormalPass:!0,children:[e.jsx(U,{mipmapBlur:!0,intensity:.9,luminanceThreshold:.8,luminanceSmoothing:.25}),e.jsx(X,{darkness:.6,offset:.2})]})]})}export{he as default};
