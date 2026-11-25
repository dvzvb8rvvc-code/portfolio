import{r as t}from"./kit-DG8De6dg.js";import{M as W,I as j,c as A,D as R,e as L,a as w,d as $,W as G,H as V,u as q,f as D,g as x,h as z}from"./react-three-fiber.esm--0B19njQ.js";import{v as H,u as T}from"./useEnvironment-3M9enuSi.js";function E(){return E=Object.assign?Object.assign.bind():function(e){for(var n=1;n<arguments.length;n++){var o=arguments[n];for(var i in o)({}).hasOwnProperty.call(o,i)&&(e[i]=o[i])}return e},E.apply(null,arguments)}const F=e=>e&&e.isCubeTexture;class N extends W{constructor(n,o){var i,c;const a=F(n),u=((c=a?(i=n.image[0])==null?void 0:i.width:n.image.width)!=null?c:1024)/4,l=Math.floor(Math.log2(u)),r=Math.pow(2,l),d=3*Math.max(r,16*7),v=4*r,m=[a?"#define ENVMAP_TYPE_CUBE":"",`#define CUBEUV_TEXEL_WIDTH ${1/d}`,`#define CUBEUV_TEXEL_HEIGHT ${1/v}`,`#define CUBEUV_MAX_MIP ${l}.0`],b=`
        varying vec3 vWorldPosition;
        void main() 
        {
            vec4 worldPosition = ( modelMatrix * vec4( position, 1.0 ) );
            vWorldPosition = worldPosition.xyz;
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }
        `,_=m.join(`
`)+`
        #define ENVMAP_TYPE_CUBE_UV
        varying vec3 vWorldPosition;
        uniform float radius;
        uniform float height;
        uniform float angle;
        #ifdef ENVMAP_TYPE_CUBE
            uniform samplerCube map;
        #else
            uniform sampler2D map;
        #endif
        // From: https://www.shadertoy.com/view/4tsBD7
        float diskIntersectWithBackFaceCulling( vec3 ro, vec3 rd, vec3 c, vec3 n, float r ) 
        {
            float d = dot ( rd, n );
            
            if( d > 0.0 ) { return 1e6; }
            
            vec3  o = ro - c;
            float t = - dot( n, o ) / d;
            vec3  q = o + rd * t;
            
            return ( dot( q, q ) < r * r ) ? t : 1e6;
        }
        // From: https://www.iquilezles.org/www/articles/intersectors/intersectors.htm
        float sphereIntersect( vec3 ro, vec3 rd, vec3 ce, float ra ) 
        {
            vec3 oc = ro - ce;
            float b = dot( oc, rd );
            float c = dot( oc, oc ) - ra * ra;
            float h = b * b - c;
            
            if( h < 0.0 ) { return -1.0; }
            
            h = sqrt( h );
            
            return - b + h;
        }
        vec3 project() 
        {
            vec3 p = normalize( vWorldPosition );
            vec3 camPos = cameraPosition;
            camPos.y -= height;
            float intersection = sphereIntersect( camPos, p, vec3( 0.0 ), radius );
            if( intersection > 0.0 ) {
                
                vec3 h = vec3( 0.0, - height, 0.0 );
                float intersection2 = diskIntersectWithBackFaceCulling( camPos, p, h, vec3( 0.0, 1.0, 0.0 ), radius );
                p = ( camPos + min( intersection, intersection2 ) * p ) / radius;
            } else {
                p = vec3( 0.0, 1.0, 0.0 );
            }
            return p;
        }
        #include <common>
        #include <cube_uv_reflection_fragment>
        void main() 
        {
            vec3 projectedWorldPosition = project();
            
            #ifdef ENVMAP_TYPE_CUBE
                vec3 outcolor = textureCube( map, projectedWorldPosition ).rgb;
            #else
                vec3 direction = normalize( projectedWorldPosition );
                vec2 uv = equirectUv( direction );
                vec3 outcolor = texture2D( map, uv ).rgb;
            #endif
            gl_FragColor = vec4( outcolor, 1.0 );
            #include <tonemapping_fragment>
            #include <${H>=154?"colorspace_fragment":"encodings_fragment"}>
        }
        `,C={map:{value:n},height:{value:(o==null?void 0:o.height)||15},radius:{value:(o==null?void 0:o.radius)||100}},p=new j(1,16),y=new A({uniforms:C,fragmentShader:_,vertexShader:b,side:R});super(p,y)}set radius(n){this.material.uniforms.radius.value=n}get radius(){return this.material.uniforms.radius.value}set height(n){this.material.uniforms.height.value=n}get height(){return this.material.uniforms.height.value}}const Y=e=>e.current&&e.current.isScene,O=e=>Y(e)?e.current:e;function k(e,n,o,i,c={}){var a,s,u,l;c={backgroundBlurriness:0,backgroundIntensity:1,backgroundRotation:[0,0,0],environmentIntensity:1,environmentRotation:[0,0,0],...c};const r=O(n||o),d=r.background,v=r.environment,m={backgroundBlurriness:r.backgroundBlurriness,backgroundIntensity:r.backgroundIntensity,backgroundRotation:(a=(s=r.backgroundRotation)==null||s.clone==null?void 0:s.clone())!==null&&a!==void 0?a:[0,0,0],environmentIntensity:r.environmentIntensity,environmentRotation:(u=(l=r.environmentRotation)==null||l.clone==null?void 0:l.clone())!==null&&u!==void 0?u:[0,0,0]};return e!=="only"&&(r.environment=i),e&&(r.background=i),x(r,c),()=>{e!=="only"&&(r.environment=v),e&&(r.background=d),x(r,m)}}function I({scene:e,background:n=!1,map:o,...i}){const c=w(a=>a.scene);return t.useLayoutEffect(()=>{if(o)return k(n,e,c,o,i)}),null}function U({background:e=!1,scene:n,blur:o,backgroundBlurriness:i,backgroundIntensity:c,backgroundRotation:a,environmentIntensity:s,environmentRotation:u,...l}){const r=T(l),d=w(v=>v.scene);return t.useLayoutEffect(()=>k(e,n,d,r,{backgroundBlurriness:o??i,backgroundIntensity:c,backgroundRotation:a,environmentIntensity:s,environmentRotation:u})),t.useEffect(()=>()=>{r.dispose()},[r]),null}function X({children:e,near:n=.1,far:o=1e3,resolution:i=256,frames:c=1,map:a,background:s=!1,blur:u,backgroundBlurriness:l,backgroundIntensity:r,backgroundRotation:d,environmentIntensity:v,environmentRotation:m,scene:b,files:_,path:C,preset:p=void 0,extensions:y}){const g=w(f=>f.gl),S=w(f=>f.scene),M=t.useRef(null),[P]=t.useState(()=>new $),h=t.useMemo(()=>{const f=new G(i);return f.texture.type=V,f},[i]);t.useEffect(()=>()=>{h.dispose()},[h]),t.useLayoutEffect(()=>{if(c===1){const f=g.autoClear;g.autoClear=!0,M.current.update(g,P),g.autoClear=f}return k(s,b,S,h.texture,{backgroundBlurriness:u??l,backgroundIntensity:r,backgroundRotation:d,environmentIntensity:v,environmentRotation:m})},[e,P,h.texture,b,S,s,c,g]);let B=1;return q(()=>{if(c===1/0||B<c){const f=g.autoClear;g.autoClear=!0,M.current.update(g,P),g.autoClear=f,B++}}),t.createElement(t.Fragment,null,D(t.createElement(t.Fragment,null,e,t.createElement("cubeCamera",{ref:M,args:[n,o,h]}),_||p?t.createElement(U,{background:!0,files:_,preset:p,path:C,extensions:y}):a?t.createElement(I,{background:!0,map:a,extensions:y}):null),P))}function J(e){var n,o,i,c;const a=T(e),s=e.map||a;t.useMemo(()=>L({GroundProjectedEnvImpl:N}),[]),t.useEffect(()=>()=>{a.dispose()},[a]);const u=t.useMemo(()=>[s],[s]),l=(n=e.ground)==null?void 0:n.height,r=(o=e.ground)==null?void 0:o.radius,d=(i=(c=e.ground)==null?void 0:c.scale)!==null&&i!==void 0?i:1e3;return t.createElement(t.Fragment,null,t.createElement(I,E({},e,{map:s})),t.createElement("groundProjectedEnvImpl",{args:u,scale:d,height:l,radius:r}))}function ee(e){return e.ground?t.createElement(J,e):e.map?t.createElement(I,e):e.children?t.createElement(X,e):t.createElement(U,e)}const te=t.forwardRef(({light:e,args:n,map:o,toneMapped:i=!1,color:c="white",form:a="rect",intensity:s=1,scale:u=1,target:l=[0,0,0],children:r,...d},v)=>{const m=t.useRef(null);return t.useImperativeHandle(v,()=>m.current,[]),t.useLayoutEffect(()=>{!r&&!d.material&&(x(m.current.material,{color:c}),m.current.material.color.multiplyScalar(s))},[c,s,r,d.material]),t.useLayoutEffect(()=>{d.rotation||m.current.quaternion.identity(),l&&!d.rotation&&(typeof l=="boolean"?m.current.lookAt(0,0,0):m.current.lookAt(Array.isArray(l)?new z(...l):l))},[l,d.rotation]),u=Array.isArray(u)&&u.length===2?[u[0],u[1],1]:u,t.createElement("mesh",E({ref:m,scale:u},d),a==="circle"?t.createElement("ringGeometry",{args:n||[0,.5,64]}):a==="ring"?t.createElement("ringGeometry",{args:n||[.25,.5,64]}):a==="rect"||a==="plane"?t.createElement("planeGeometry",{args:n||[1,1]}):a==="box"?t.createElement("boxGeometry",{args:n||[1,1,1]}):t.createElement(a,{args:n}),r||t.createElement("meshBasicMaterial",{toneMapped:i,map:o,side:R}),e&&t.createElement("pointLight",E({castShadow:!0},e)))});export{ee as E,te as L,E as _};
