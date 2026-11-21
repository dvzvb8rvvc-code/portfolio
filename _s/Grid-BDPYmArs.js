import{_ as v}from"./extends-CF3RwP-h.js";import{r as e}from"./kit-B9vXdzke.js";import{$ as _,S as F,ax as b,G as T,ao as D,w as a,b as E,ay as U,a as p}from"./react-three-fiber.esm-BxSUdgq5.js";import{v as I}from"./constants-CIMWHpzV.js";function O(s,l,c,u){const t=class extends F{constructor(f={}){const n=Object.entries(s);super({uniforms:n.reduce((o,[i,m])=>{const d=b.clone({[i]:{value:m}});return{...o,...d}},{}),vertexShader:l,fragmentShader:c}),this.key="",n.forEach(([o])=>Object.defineProperty(this,o,{get:()=>this.uniforms[o].value,set:i=>this.uniforms[o].value=i})),Object.assign(this,f)}};return t.key=_.generateUUID(),t}const V=O({cellSize:.5,sectionSize:1,fadeDistance:100,fadeStrength:1,fadeFrom:1,cellThickness:.5,sectionThickness:1,cellColor:new p,sectionColor:new p,infiniteGrid:!1,followCamera:!1,worldCamProjPosition:new a,worldPlanePosition:new a},`
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
      #include <${I>=154?"colorspace_fragment":"encodings_fragment"}>
    }
  `),H=e.forwardRef(({args:s,cellColor:l="#000000",sectionColor:c="#2080ff",cellSize:u=.5,sectionSize:t=1,followCamera:P=!1,infiniteGrid:f=!1,fadeDistance:n=100,fadeStrength:o=1,fadeFrom:i=1,cellThickness:m=.5,sectionThickness:d=1,side:C=U,...h},x)=>{T({GridMaterial:V});const r=e.useRef(null);e.useImperativeHandle(x,()=>r.current,[]);const g=new D,y=new a(0,1,0),z=new a(0,0,0);E(M=>{g.setFromNormalAndCoplanarPoint(y,z).applyMatrix4(r.current.matrixWorld);const w=r.current.material,S=w.uniforms.worldCamProjPosition,G=w.uniforms.worldPlanePosition;g.projectPoint(M.camera.position,S.value),G.value.set(0,0,0).applyMatrix4(r.current.matrixWorld)});const j={cellSize:u,sectionSize:t,cellColor:l,sectionColor:c,cellThickness:m,sectionThickness:d},k={fadeDistance:n,fadeStrength:o,fadeFrom:i,infiniteGrid:f,followCamera:P};return e.createElement("mesh",v({ref:r,frustumCulled:!1},h),e.createElement("gridMaterial",v({transparent:!0,"extensions-derivatives":!0,side:C},j,k)),e.createElement("planeGeometry",{args:s}))});export{H as G};
