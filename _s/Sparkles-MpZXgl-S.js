import{_ as S}from"./Lightformer-BjnBlvCl.js";import{r}from"./kit-DPcy7G1R.js";import{R as _,e as z,u as C,a0 as F,ab as u,a as V,f as w,V as I,b as O,ag as k}from"./react-three-fiber.esm-DLzBa5iw.js";const T=()=>parseInt(_.replace(/\D+/g,"")),j=T();class $ extends w{constructor(){super({uniforms:{time:{value:0},pixelRatio:{value:1}},vertexShader:`
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
          #include <${j>=154?"colorspace_fragment":"encodings_fragment"}>
        }
      `})}get time(){return this.uniforms.time.value}set time(t){this.uniforms.time.value=t}get pixelRatio(){return this.uniforms.pixelRatio.value}set pixelRatio(t){this.uniforms.pixelRatio.value=t}}const d=e=>e&&e.constructor===Float32Array,N=e=>[e.r,e.g,e.b],p=e=>e instanceof I||e instanceof O||e instanceof k,g=e=>Array.isArray(e)?e:p(e)?e.toArray():[e,e,e];function o(e,t,n){return r.useMemo(()=>{if(t!==void 0){if(d(t))return t;if(t instanceof u){const a=Array.from({length:e*3},()=>N(t)).flat();return Float32Array.from(a)}else if(p(t)||Array.isArray(t)){const a=Array.from({length:e*3},()=>g(t)).flat();return Float32Array.from(a)}return Float32Array.from({length:e},()=>t)}return Float32Array.from({length:e},n)},[t])}const J=r.forwardRef(({noise:e=1,count:t=100,speed:n=1,opacity:a=1,scale:c=1,size:y,color:s,children:m,...b},v)=>{r.useMemo(()=>z({SparklesImplMaterial:$}),[]);const i=r.useRef(null),A=C(l=>l.viewport.dpr),f=g(c),h=r.useMemo(()=>Float32Array.from(Array.from({length:t},()=>f.map(F.randFloatSpread)).flat()),[t,...f]),x=o(t,y,Math.random),P=o(t,a),R=o(t,n),E=o(t*3,e),M=o(s===void 0?t*3:t,d(s)?s:new u(s),()=>1);return V(l=>{i.current&&i.current.material&&(i.current.material.time=l.clock.elapsedTime)}),r.useImperativeHandle(v,()=>i.current,[]),r.createElement("points",S({key:`particle-${t}-${JSON.stringify(c)}`},b,{ref:i}),r.createElement("bufferGeometry",null,r.createElement("bufferAttribute",{attach:"attributes-position",args:[h,3]}),r.createElement("bufferAttribute",{attach:"attributes-size",args:[x,1]}),r.createElement("bufferAttribute",{attach:"attributes-opacity",args:[P,1]}),r.createElement("bufferAttribute",{attach:"attributes-speed",args:[R,1]}),r.createElement("bufferAttribute",{attach:"attributes-color",args:[M,3]}),r.createElement("bufferAttribute",{attach:"attributes-noise",args:[E,3]})),m||r.createElement("sparklesImplMaterial",{transparent:!0,pixelRatio:A,depthWrite:!1}))});export{J as S};
