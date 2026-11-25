import{r,j as e}from"./kit-DG8De6dg.js";import{a0 as M,c as U,ay as B,e as L,ap as V,h as T,u as _,az as W,b as R,C as O,a as A,D as H,af as K,a5 as N}from"./react-three-fiber.esm--0B19njQ.js";import{_ as F,E as $,L as E}from"./Lightformer-m7yhof7E.js";import{v as q}from"./constants-DrcbqSbR.js";import{E as J}from"./Edges-DCWRO9Ql.js";import"./useEnvironment-3M9enuSi.js";import"./Line-BxqkZN99.js";function Q(o,s,t,l){const a=class extends U{constructor(c={}){const d=Object.entries(o);super({uniforms:d.reduce((f,[u,i])=>{const g=B.clone({[u]:{value:i}});return{...f,...g}},{}),vertexShader:s,fragmentShader:t}),this.key="",d.forEach(([f])=>Object.defineProperty(this,f,{get:()=>this.uniforms[f].value,set:u=>this.uniforms[f].value=u})),Object.assign(this,c)}};return a.key=M.generateUUID(),a}const X=Q({cellSize:.5,sectionSize:1,fadeDistance:100,fadeStrength:1,fadeFrom:1,cellThickness:.5,sectionThickness:1,cellColor:new R,sectionColor:new R,infiniteGrid:!1,followCamera:!1,worldCamProjPosition:new T,worldPlanePosition:new T},`
    varying vec3 localPosition;
    varying vec4 worldPosition;

    uniform vec3 worldCamProjPosition;
    uniform vec3 worldPlanePosition;
    uniform float fadeDistance;
    uniform bool infiniteGrid;
    uniform bool followCamera;

    void main() {
      localPosition = position.xzy;
      if (infiniteGrid) localPosition *= 1.0 + fadeDistance;
      
      worldPosition = modelMatrix * vec4(localPosition, 1.0);
      if (followCamera) {
        worldPosition.xyz += (worldCamProjPosition - worldPlanePosition);
        localPosition = (inverse(modelMatrix) * worldPosition).xyz;
      }

      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `,`
    varying vec3 localPosition;
    varying vec4 worldPosition;

    uniform vec3 worldCamProjPosition;
    uniform float cellSize;
    uniform float sectionSize;
    uniform vec3 cellColor;
    uniform vec3 sectionColor;
    uniform float fadeDistance;
    uniform float fadeStrength;
    uniform float fadeFrom;
    uniform float cellThickness;
    uniform float sectionThickness;

    float getGrid(float size, float thickness) {
      vec2 r = localPosition.xz / size;
      vec2 grid = abs(fract(r - 0.5) - 0.5) / fwidth(r);
      float line = min(grid.x, grid.y) + 1.0 - thickness;
      return 1.0 - min(line, 1.0);
    }

    void main() {
      float g1 = getGrid(cellSize, cellThickness);
      float g2 = getGrid(sectionSize, sectionThickness);

      vec3 from = worldCamProjPosition*vec3(fadeFrom);
      float dist = distance(from, worldPosition.xyz);
      float d = 1.0 - min(dist / fadeDistance, 1.0);
      vec3 color = mix(cellColor, sectionColor, min(1.0, sectionThickness * g2));

      gl_FragColor = vec4(color, (g1 + g2) * pow(d, fadeStrength));
      gl_FragColor.a = mix(0.75 * gl_FragColor.a, gl_FragColor.a, g2);
      if (gl_FragColor.a <= 0.0) discard;

      #include <tonemapping_fragment>
      #include <${q>=154?"colorspace_fragment":"encodings_fragment"}>
    }
  `),Y=r.forwardRef(({args:o,cellColor:s="#000000",sectionColor:t="#2080ff",cellSize:l=.5,sectionSize:a=1,followCamera:m=!1,infiniteGrid:c=!1,fadeDistance:d=100,fadeStrength:f=1,fadeFrom:u=1,cellThickness:i=.5,sectionThickness:g=1,side:n=W,...v},G)=>{L({GridMaterial:X});const h=r.useRef(null);r.useImperativeHandle(G,()=>h.current,[]);const b=new V,k=new T(0,1,0),y=new T(0,0,0);_(I=>{b.setFromNormalAndCoplanarPoint(k,y).applyMatrix4(h.current.matrixWorld);const P=h.current.material,x=P.uniforms.worldCamProjPosition,j=P.uniforms.worldPlanePosition;b.projectPoint(I.camera.position,x.value),j.value.set(0,0,0).applyMatrix4(h.current.matrixWorld)});const C={cellSize:l,sectionSize:a,cellColor:s,sectionColor:t,cellThickness:i,sectionThickness:g},z={fadeDistance:d,fadeStrength:f,fadeFrom:u,infiniteGrid:c,followCamera:m};return r.createElement("mesh",F({ref:h,frustumCulled:!1},v),r.createElement("gridMaterial",F({transparent:!0,"extensions-derivatives":!0,side:n},C,z)),r.createElement("planeGeometry",{args:o}))}),S=(o,s=0,t=1)=>Math.min(t,Math.max(s,o)),D=o=>o*o*(3-2*o),w=[[0,-.62,.12,.58],[.12,-.62,.12,.62],[.32,2.5,.42,.9],[.52,.55,.16,.88],[.72,1.45,.1,.95],[.9,-.62,.12,.85]];function Z(o){for(let t=0;t<w.length-1;t++){const l=w[t],a=w[t+1];if(o<=a[0]){const m=D(S((o-l[0])/(a[0]-l[0])));return[1,2,3].map(c=>l[c]+(a[c]-l[c])*m)}}const s=w[w.length-1];return[s[1],s[2],s[3]]}const p=1.9;function ee(){return r.useMemo(()=>{const o=new K;o.moveTo(-2.2,.35),o.lineTo(-1.84,.35),o.absarc(-1.4,.35,.44,Math.PI,0,!0),o.lineTo(.91,.35),o.absarc(1.35,.35,.44,Math.PI,0,!0),o.lineTo(2.28,.35),o.lineTo(2.26,1.02),o.lineTo(1.72,1.3),o.lineTo(1.12,2.2),o.lineTo(-2.2,2.2),o.closePath();const s=new N(o,{depth:p,bevelEnabled:!0,bevelThickness:.04,bevelSize:.04,bevelSegments:2,curveSegments:24});return s.translate(0,0,-p/2),s},[])}function oe({x:o,z:s,mat:t}){return e.jsxs("group",{position:[o,.35,s],"rotation-x":Math.PI/2,children:[e.jsxs("mesh",{children:[e.jsx("cylinderGeometry",{args:[.37,.37,.28,40]}),e.jsx("meshStandardMaterial",{color:"#050505",roughness:.7})]}),e.jsxs("mesh",{"position-y":s>0?.145:-.145,children:[e.jsx("cylinderGeometry",{args:[.2,.2,.01,32]}),e.jsx("meshStandardMaterial",{ref:t,color:"#cfcfcf",metalness:1,roughness:.25,emissive:"#ffffff",emissiveIntensity:0})]})]})}function se({progress:o}){const s=r.useRef(),t=r.useRef(),l=r.useRef(),a=r.useRef(),m=r.useRef(),c=r.useRef(),d=[r.useRef(),r.useRef(),r.useRef(),r.useRef()],{size:f}=A(),u=ee();return _((i,g)=>{const n=o.get(),v=f.width<768,[G,h,b]=Z(n),k=(v?.62:1)*b;s.current.scale.setScalar(M.lerp(s.current.scale.x,k,.12)),s.current.position.set(0,M.lerp(v?-2.7:-2.6,v?-1.7:-1.62,D(S(n/.22))),0),s.current.rotation.y=M.lerp(s.current.rotation.y,G+i.pointer.x*.12,.08),s.current.rotation.x=M.lerp(s.current.rotation.x,h-i.pointer.y*.04,.08);const y=(x,j)=>S(Math.min((n-x)/.05,(j-n)/.05)),C=y(.2,.42),z=y(.42,.62),I=y(.62,.8);l.current.emissiveIntensity=C*1.6,a.current.emissiveIntensity=m.current.emissiveIntensity=C*1.6,d.forEach((x,j)=>{x.current&&(x.current.emissiveIntensity=(j<2?z:z*.3)*1.4)});const P=S((n-.62)/.16);t.current.visible=I>.01,t.current.position.set(1.9,2.6-P*1.5,0),t.current.scale.setScalar(.22*(1-P*.5)*I),c.current.emissiveIntensity=.12+S((n-.8)/.08)*.5}),e.jsxs("group",{ref:s,children:[e.jsx(Y,{position:[0,-.03,0],args:[40,40],cellSize:.5,cellThickness:.6,cellColor:"#1f1f1f",sectionSize:2.5,sectionThickness:1,sectionColor:"#3a3a3a",fadeDistance:22,fadeStrength:1.5,infiniteGrid:!0}),e.jsxs("mesh",{geometry:u,children:[e.jsx("meshStandardMaterial",{color:"#0b0b0b",metalness:.75,roughness:.22}),e.jsx(J,{threshold:20,color:"#ffffff"})]}),e.jsxs("mesh",{position:[1.45,1.77,0],"rotation-z":-.983,children:[e.jsx("boxGeometry",{args:[1,.02,p-.18]}),e.jsx("meshStandardMaterial",{ref:c,color:"#111",emissive:"#ffffff",emissiveIntensity:.12,metalness:1,roughness:.1})]}),[1,-1].map(i=>e.jsxs("mesh",{position:[.9,1.72,i*(p/2+.045)],children:[e.jsx("planeGeometry",{args:[.55,.5]}),e.jsx("meshStandardMaterial",{side:H,color:"#141414",metalness:1,roughness:.1})]},i)),[[-1.4,1],[-1.4,-1],[1.35,1],[1.35,-1]].map(([i,g],n)=>e.jsx(oe,{x:i,z:g*(p/2-.08),mat:d[n<2?2+n:n-2]},n)),e.jsxs("mesh",{position:[-1.4,.32,0],"rotation-x":Math.PI/2,children:[e.jsx("cylinderGeometry",{args:[.07,.07,p-.4,16]}),e.jsx("meshStandardMaterial",{ref:l,color:"#3a3a3a",metalness:1,roughness:.35,emissive:"#ffffff",emissiveIntensity:0})]}),e.jsx("group",{children:[1,-1].map(i=>e.jsxs("mesh",{position:[1.15,.24,i*.55],"rotation-y":i*.5,children:[e.jsx("boxGeometry",{args:[.7,.06,.12]}),e.jsx("meshStandardMaterial",{ref:i>0?a:m,color:"#3a3a3a",metalness:1,roughness:.35,emissive:"#ffffff",emissiveIntensity:0})]},i))}),e.jsxs("mesh",{ref:t,visible:!1,children:[e.jsx("sphereGeometry",{args:[1,32,24]}),e.jsx("meshStandardMaterial",{color:"#e8e8e8",metalness:.2,roughness:.05,emissive:"#ffffff",emissiveIntensity:.35})]})]})}function me({progress:o,active:s}){return e.jsxs(O,{frameloop:s?"always":"never",dpr:[1,1.6],camera:{position:[0,1.1,9.5],fov:34},gl:{antialias:!0,alpha:!0},style:{pointerEvents:"none"},eventSource:typeof document<"u"?document.getElementById("root"):void 0,eventPrefix:"client",children:[e.jsx("ambientLight",{intensity:.15}),e.jsx("directionalLight",{position:[3,6,4],intensity:.8}),e.jsxs($,{resolution:256,children:[e.jsx(E,{form:"rect",intensity:3,position:[0,6,0],"rotation-x":Math.PI/2,scale:[10,3,1]}),e.jsx(E,{form:"rect",intensity:2,position:[-6,1,2],"rotation-y":Math.PI/2,scale:[6,.4,1]}),e.jsx(E,{form:"rect",intensity:2,position:[6,1,-2],"rotation-y":-Math.PI/2,scale:[6,.4,1]})]}),e.jsx(se,{progress:o})]})}export{me as default};
