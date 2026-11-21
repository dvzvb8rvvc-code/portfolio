import{r as l,j as f}from"./kit-B9vXdzke.js";import{x as F,aH as U,t as R,P as C,a as E,b as j,$ as S}from"./react-three-fiber.esm-BxSUdgq5.js";const b=o=>`/portfolio/yts/depth/${o}.webp`,w=(o,t)=>`/portfolio/yts/img/${o}${t?"-s":""}.webp`,A=`
uniform sampler2D uDepth; uniform float uAmount; uniform float uReveal;
varying vec2 vUv; varying float vD;
void main(){
  vUv = uv;
  float d = texture2D(uDepth, uv).r;
  vD = d;
  vec3 p = position + normal * (d * uAmount * uReveal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`,O=`
uniform sampler2D uMap; uniform float uEdge; uniform float uOpacity; uniform float uFog; uniform vec3 uFogColor;
varying vec2 vUv; varying float vD;
void main(){
  vec4 c = texture2D(uMap, vUv);
  vec2 e = smoothstep(vec2(0.0), vec2(uEdge), vUv) * smoothstep(vec2(0.0), vec2(uEdge), 1.0 - vUv);
  float a = e.x * e.y * uOpacity;
  vec3 col = mix(c.rgb, uFogColor, (1.0 - vD) * uFog);
  gl_FragColor = vec4(col, a);
  #include <colorspace_fragment>
}`;function G({id:o,width:t=4,depth:n=.8,segments:u=220,progress:r,edgeFade:g=.06,opacity:i=1,fog:c=0,fogColor:d="#ece7df",small:h=!1,...x}){const[e,s]=F(U,[w(o,h),b(o)]);e.colorSpace=R,e.anisotropy=4;const v=e.image?e.image.height/e.image.width:.6,y=l.useMemo(()=>new C(t,t*v,u,Math.round(u*v)),[t,v,u]),m=l.useRef(),D=l.useMemo(()=>({uMap:{value:e},uDepth:{value:s},uAmount:{value:n},uReveal:{value:r?0:1},uEdge:{value:g},uOpacity:{value:i},uFog:{value:c},uFogColor:{value:new E(d)}}),[e,s]);return j((P,M)=>{var p;const a=(p=m.current)==null?void 0:p.uniforms;a&&(a.uAmount.value=n,a.uOpacity.value=i,a.uFog.value=c,r&&(a.uReveal.value=S.damp(a.uReveal.value,r.current??0,6,M)))}),f.jsx("mesh",{geometry:y,...x,children:f.jsx("shaderMaterial",{ref:m,uniforms:D,vertexShader:A,fragmentShader:O,transparent:!0,depthWrite:!0})})}export{G as D};
