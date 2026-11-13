import{r,j as o}from"./kit-w4gOkbCe.js";import{i as I,e as S,u as x,j as _,h,a as b,k as w,V,b as O,l as k,C as T}from"./react-three-fiber.esm-BIcXSS8j.js";import{_ as L,E as $,L as d}from"./Lightformer-B1d8CncD.js";import{F as N}from"./Float-DlSF-yCO.js";import{R as B}from"./RoundedBox-C0i7A8BN.js";import"./BufferGeometryUtils-DBRmTlZY.js";const D=()=>parseInt(I.replace(/\D+/g,"")),G=D();class H extends w{constructor(){super({uniforms:{time:{value:0},pixelRatio:{value:1}},vertexShader:`
        uniform float pixelRatio;
        uniform float time;
        attribute float size;  
        attribute float speed;  
        attribute float opacity;
        attribute vec3 noise;
        attribute vec3 color;
        varying vec3 vColor;
        varying float vOpacity;

        void main() {
          vec4 modelPosition = modelMatrix * vec4(position, 1.0);
          modelPosition.y += sin(time * speed + modelPosition.x * noise.x * 100.0) * 0.2;
          modelPosition.z += cos(time * speed + modelPosition.x * noise.y * 100.0) * 0.2;
          modelPosition.x += cos(time * speed + modelPosition.x * noise.z * 100.0) * 0.2;
          vec4 viewPosition = viewMatrix * modelPosition;
          vec4 projectionPostion = projectionMatrix * viewPosition;
          gl_Position = projectionPostion;
          gl_PointSize = size * 25. * pixelRatio;
          gl_PointSize *= (1.0 / - viewPosition.z);
          vColor = color;
          vOpacity = opacity;
        }
      `,fragmentShader:`
        varying vec3 vColor;
        varying float vOpacity;
        void main() {
          float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
          float strength = 0.05 / distanceToCenter - 0.1;
          gl_FragColor = vec4(vColor, strength * vOpacity);
          #include <tonemapping_fragment>
          #include <${G>=154?"colorspace_fragment":"encodings_fragment"}>
        }
      `})}get time(){return this.uniforms.time.value}set time(t){this.uniforms.time.value=t}get pixelRatio(){return this.uniforms.pixelRatio.value}set pixelRatio(t){this.uniforms.pixelRatio.value=t}}const v=e=>e&&e.constructor===Float32Array,J=e=>[e.r,e.g,e.b],A=e=>e instanceof V||e instanceof O||e instanceof k,P=e=>Array.isArray(e)?e:A(e)?e.toArray():[e,e,e];function u(e,t,f){return r.useMemo(()=>{if(t!==void 0){if(v(t))return t;if(t instanceof h){const i=Array.from({length:e*3},()=>J(t)).flat();return Float32Array.from(i)}else if(A(t)||Array.isArray(t)){const i=Array.from({length:e*3},()=>P(t)).flat();return Float32Array.from(i)}return Float32Array.from({length:e},()=>t)}return Float32Array.from({length:e},f)},[t])}const U=r.forwardRef(({noise:e=1,count:t=100,speed:f=1,opacity:i=1,scale:p=1,size:s,color:a,children:n,...l},c)=>{r.useMemo(()=>S({SparklesImplMaterial:H}),[]);const m=r.useRef(null),j=x(y=>y.viewport.dpr),g=P(p),M=r.useMemo(()=>Float32Array.from(Array.from({length:t},()=>g.map(_.randFloatSpread)).flat()),[t,...g]),E=u(t,s,Math.random),R=u(t,i),C=u(t,f),z=u(t*3,e),F=u(a===void 0?t*3:t,v(a)?a:new h(a),()=>1);return b(y=>{m.current&&m.current.material&&(m.current.material.time=y.clock.elapsedTime)}),r.useImperativeHandle(c,()=>m.current,[]),r.createElement("points",L({key:`particle-${t}-${JSON.stringify(p)}`},l,{ref:m}),r.createElement("bufferGeometry",null,r.createElement("bufferAttribute",{attach:"attributes-position",args:[M,3]}),r.createElement("bufferAttribute",{attach:"attributes-size",args:[E,1]}),r.createElement("bufferAttribute",{attach:"attributes-opacity",args:[R,1]}),r.createElement("bufferAttribute",{attach:"attributes-speed",args:[C,1]}),r.createElement("bufferAttribute",{attach:"attributes-color",args:[F,3]}),r.createElement("bufferAttribute",{attach:"attributes-noise",args:[z,3]})),n||r.createElement("sparklesImplMaterial",{transparent:!0,pixelRatio:j,depthWrite:!1}))});function W({progress:e}){const t=r.useRef(),{size:f}=x(),i=f.width<768,p=r.useMemo(()=>[[1.2,.5,0,1.3],[3.2,1.6,-1.5,.8],[2.6,-1.4,.5,.9],[4.4,-.2,-2,.6],[.2,2.1,-2.5,.5],[-.6,-1.8,-1,.45]],[]);return b((s,a)=>{const n=e.get();t.current.rotation.y+=(s.pointer.x*.4-t.current.rotation.y)*.04,t.current.rotation.x+=(-s.pointer.y*.25-t.current.rotation.x)*.04,t.current.position.y=n*3}),o.jsx("group",{ref:t,position:[i?-1.6:0,i?1.4:0,0],scale:i?.6:1,children:p.map(([s,a,n,l],c)=>o.jsx(N,{speed:1.2+c*.2,rotationIntensity:1.4,floatIntensity:1.2,children:o.jsx(B,{args:[l,l,l],radius:l*.14,smoothness:4,position:[s,a,n],rotation:[c,c*2,0],children:o.jsx("meshPhysicalMaterial",{color:"#cfefff",roughness:.06,metalness:0,clearcoat:1,iridescence:.5,transparent:!0,opacity:.55,envMapIntensity:2.5})})},c))})}function tt({progress:e}){return o.jsxs(T,{dpr:[1,1.6],camera:{position:[0,0,8],fov:42},gl:{antialias:!0,alpha:!0},style:{pointerEvents:"none"},children:[o.jsx("ambientLight",{intensity:.4}),o.jsx(W,{progress:e}),o.jsx(U,{count:120,scale:[14,8,6],size:2.2,speed:.4,color:"#bfe9ff",opacity:.8}),o.jsxs($,{resolution:256,children:[o.jsx("color",{attach:"background",args:["#0b2a40"]}),o.jsx(d,{form:"rect",intensity:4,position:[0,5,-2],scale:[12,2,1],color:"#e8f8ff"}),o.jsx(d,{form:"rect",intensity:3,position:[-5,0,2],"rotation-y":Math.PI/2,scale:[10,2,1],color:"#5fd0ff"}),o.jsx(d,{form:"rect",intensity:2,position:[5,0,2],"rotation-y":-Math.PI/2,scale:[10,2,1],color:"#ffffff"}),o.jsx(d,{form:"ring",intensity:5,position:[2,2,6],scale:1.4})]})]})}export{tt as default};
