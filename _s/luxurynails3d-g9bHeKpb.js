import{r as l,j as t}from"./kit-B9vXdzke.js";import{C as b,u as w,aJ as S,V as p,b as T,ar as E,D as R,a as L,w as k}from"./react-three-fiber.esm-BxSUdgq5.js";import{E as H}from"./Environment-DySyqnUY.js";import{L as m}from"./Lightformer-C9oU0LbB.js";import"./extends-CF3RwP-h.js";import"./constants-b4ZRw0Sn.js";const u=8,s={x:0,y:0,moved:!1},C=`
uniform float uTime, uScroll;
uniform vec3 uRip[${u}];
uniform vec2 uMouse; uniform float uHover;
float silk(vec2 p){
  float t = uTime * .45;
  float h = sin(p.x * .55 + t) * .32 + sin(p.y * .8 - t * 1.3 + p.x * .3) * .22 + sin((p.x + p.y) * 1.3 + t * 1.7) * .07;
  h += sin(p.x * .25 - t * .6) * (.5 + uScroll * 1.4);
  for (int i = 0; i < ${u}; i++) {
    vec3 r = uRip[i]; float age = uTime - r.z;
    if (age < 0. || age > 4.) continue;
    float d = distance(p, r.xy);
    float front = age * 2.6;
    h += sin((d - front) * 3.2) * exp(-abs(d - front) * 1.4) * exp(-age * .9) * .38;
  }
  float md = distance(p, uMouse);
  h -= exp(-md * md * .6) * .45 * uHover;
  return h;
}
`;function D(){return l.useMemo(()=>{const e=new E({color:"#e7cfa8",roughness:.34,metalness:.32,sheen:1,sheenColor:new L("#fff2dc"),sheenRoughness:.35,clearcoat:.35,clearcoatRoughness:.4,side:R,envMapIntensity:1.25});return e.userData.u={uTime:{value:0},uScroll:{value:0},uMouse:{value:new p(99,99)},uHover:{value:0},uRip:{value:Array.from({length:u},()=>new k(0,0,-99))}},e.onBeforeCompile=o=>{Object.assign(o.uniforms,e.userData.u),o.vertexShader=C+o.vertexShader.replace("#include <beginnormal_vertex>",`
          float e = .06; vec2 q = position.xy;
          float h0 = silk(q);
          vec3 dx = vec3(e, 0., silk(q + vec2(e, 0.)) - h0);
          vec3 dy = vec3(0., e, silk(q + vec2(0., e)) - h0);
          vec3 objectNormal = normalize(cross(dx, dy));
          #ifdef USE_TANGENT
            vec3 objectTangent = vec3(tangent.xyz);
          #endif`).replace("#include <begin_vertex>","vec3 transformed = vec3(position.xy, h0);")},e},[])}function I(){const e=l.useRef(),o=D(),{size:f,camera:g}=w(),v=f.width<768,x=l.useMemo(()=>new S,[]),h=l.useMemo(()=>new p,[]),d=l.useRef({x:0,y:0,t:0,idx:0}),y=v?[80,60]:[150,100];return T((j,P)=>{const r=o.userData.u,a=j.clock.elapsedTime;r.uTime.value=a;const M=Math.min(1,window.scrollY/innerHeight);if(r.uScroll.value+=(M-r.uScroll.value)*.08,e.current.rotation.x=-.72+r.uScroll.value*.3,e.current.position.y=(v?-1.2:-.6)+r.uScroll.value*1.2,s.moved){h.set(s.x,s.y),x.setFromCamera(h,g);const c=x.intersectObject(e.current)[0];if(c){const i=e.current.worldToLocal(c.point.clone());r.uMouse.value.lerp(new p(i.x,i.y),.25),r.uHover.value+=(1-r.uHover.value)*.08;const n=d.current;Math.hypot(i.x-n.x,i.y-n.y)>1.1&&a-n.t>.12&&(r.uRip.value[n.idx].set(i.x,i.y,a),n.idx=(n.idx+1)%u,n.x=i.x,n.y=i.y,n.t=a)}}else r.uHover.value*=.96;if(!s.moved&&a-d.current.t>3.2){const c=d.current;r.uRip.value[c.idx].set((Math.random()-.5)*8,(Math.random()-.5)*4,a),c.idx=(c.idx+1)%u,c.t=a}}),t.jsx("mesh",{ref:e,material:o,"rotation-x":-.95,scale:v?.85:1,children:t.jsx("planeGeometry",{args:[18,11,y[0],y[1]]})})}function F(){return l.useEffect(()=>{let e;const o=f=>{s.x=f.clientX/innerWidth*2-1,s.y=-(f.clientY/innerHeight*2-1),s.moved=!0,clearTimeout(e),e=setTimeout(()=>s.moved=!1,1800)};return addEventListener("pointermove",o,{passive:!0}),addEventListener("pointerdown",o,{passive:!0}),()=>{removeEventListener("pointermove",o),removeEventListener("pointerdown",o)}},[]),t.jsxs(b,{dpr:[1,1.6],camera:{position:[0,0,9],fov:42},gl:{antialias:!0,alpha:!0},style:{pointerEvents:"none"},children:[t.jsx("ambientLight",{intensity:.35}),t.jsx("directionalLight",{position:[3,6,4],intensity:1.1,color:"#fff1e0"}),t.jsx(I,{}),t.jsxs(H,{resolution:256,children:[t.jsx("color",{attach:"background",args:["#3a2433"]}),t.jsx(m,{form:"rect",intensity:4,position:[0,6,2],"rotation-x":Math.PI/2,scale:[14,4,1],color:"#fff4e6"}),t.jsx(m,{form:"rect",intensity:2.6,position:[-6,1,2],"rotation-y":Math.PI/2,scale:[10,3,1],color:"#f2b9a6"}),t.jsx(m,{form:"rect",intensity:2.2,position:[6,0,3],"rotation-y":-Math.PI/2,scale:[10,3,1],color:"#ffe2b8"}),t.jsx(m,{form:"ring",intensity:3,position:[0,2,7],scale:3,color:"#ffffff"})]})]})}export{F as default};
