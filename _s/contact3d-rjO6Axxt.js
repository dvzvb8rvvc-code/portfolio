import{j as u,r as h}from"./kit-B9vXdzke.js";import{C as D,x as y,aH as k,t as M,P as w,u as U,b as C,$ as a}from"./react-three-fiber.esm-BxSUdgq5.js";const T=`
uniform sampler2D uDepth; uniform float uAmount; uniform float uT;
varying vec2 vUv; varying float vD;
void main(){
  vUv = uv;
  float d = texture2D(uDepth, uv).r; vD = d;
  vec3 p = position; p.z += d * uAmount;
  // foreground foliage breathes a little
  p.x += sin(uT * .7 + uv.y * 20.) * .012 * smoothstep(.45, .9, d);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.);
}`,j=`
uniform sampler2D uMap; uniform float uT; uniform float uDusk;
varying vec2 vUv; varying float vD;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
void main(){
  vec3 c = texture2D(uMap, vUv).rgb;
  float l = dot(c, vec3(.299,.587,.114));
  float l2 = smoothstep(.04, .96, l);
  vec3 g = mix(vec3(.025,.04,.09), vec3(.2,.24,.38), smoothstep(0., .62, l2));
  g = mix(g, vec3(1.,.68,.45), smoothstep(.6, 1., l2) * .85);
  vec3 col = mix(c, g, uDusk);
  float far = 1. - smoothstep(.04, .22, vD);
  // sky: afterglow at the horizon → deep blue at the top
  float skyM = (1. - smoothstep(.02, .07, vD)) * smoothstep(.72, .86, vUv.y);
  vec3 skyC = mix(vec3(1.,.5,.26), vec3(.1,.13,.3), smoothstep(.84, 1., vUv.y));
  col = mix(col, skyC * (.55 + l * .7), skyM * uDusk);
  // far ridges catch the glow, water mirrors it
  col += vec3(.8,.38,.2) * far * (1. - skyM) * smoothstep(.5, .85, vUv.y) * .22 * uDusk;
  // near foliage goes to silhouette
  col *= mix(1., .38, smoothstep(.45, .85, vD) * uDusk);
  // village lights on the mid-distance slopes
  vec2 cell = floor(vUv * vec2(420., 160.));
  float r = hash(cell);
  vec2 f = fract(vUv * vec2(420., 160.)) - .5;
  float band = smoothstep(.12, .2, vD) * (1. - smoothstep(.42, .55, vD)) * (1. - smoothstep(.62, .7, vUv.y));
  float tw = .65 + .35 * sin(uT * (1. + r * 3.) + r * 40.);
  float light = step(.975, r) * band * smoothstep(.3, 0., length(f)) * tw;
  col += vec3(1., .72, .4) * light * 2.6 * uDusk;
  col *= mix(1., .85, uDusk);
  // vignette
  vec2 q = vUv - .5; col *= 1. - dot(q, q) * .9;
  gl_FragColor = vec4(col, 1.);
  #include <colorspace_fragment>
}`;function z({mobile:e}){const[t,s]=y(k,[`/portfolio/yts/img/129${e?"-s":""}.webp`,"/portfolio/yts/depth/129.webp"]);t.colorSpace=M;const r=12,v=r*701/1800,f=h.useMemo(()=>new w(r,v,e?160:300,e?64:118),[e]),i=h.useMemo(()=>({uMap:{value:t},uDepth:{value:s},uAmount:{value:1.6},uT:{value:0},uDusk:{value:.55}}),[t,s]),{camera:o,size:c}=U();return C(({clock:d,pointer:p},l)=>{const n=d.elapsedTime;i.uT.value=n,i.uDusk.value=a.damp(i.uDusk.value,1,.5,l);const g=c.width/c.height,m=Math.tan(a.degToRad(o.fov/2)),x=Math.min(r*.78/(2*m*g),v*.78/(2*m));o.position.x=a.damp(o.position.x,Math.sin(n*.06)*r*.04+p.x*.25,1.5,l),o.position.y=a.damp(o.position.y,Math.sin(n*.045)*.08+p.y*.12-.05,1.5,l),o.position.z=a.damp(o.position.z,x+Math.sin(n*.05)*.25,1.5,l),o.lookAt(o.position.x*.4,-.05,0)}),u.jsx("mesh",{geometry:f,children:u.jsx("shaderMaterial",{uniforms:i,vertexShader:T,fragmentShader:j})})}function A({active:e,mobile:t}){return u.jsx(D,{frameloop:e?"always":"never",dpr:[1,t?1.3:1.5],gl:{antialias:!0,powerPreference:"high-performance"},camera:{fov:35,position:[0,0,6],near:.1,far:60},style:{position:"absolute",inset:0},onCreated:({gl:s})=>s.setClearColor("#14161d"),children:u.jsx(z,{mobile:t})})}export{A as default};
