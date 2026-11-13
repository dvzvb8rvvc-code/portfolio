import{r as d,j as a}from"./kit-w4gOkbCe.js";import{I as de,o as k,q as N,r as z,W as fe,B as F,d as ne,b as _,k as ue,U as J,t as K,V as ie,v as pe,l as B,w as he,x as me,j as ve,u as se,h as ye,y as ge,C as xe,a as oe}from"./react-three-fiber.esm-BIcXSS8j.js";import{v as re,_ as V,E as Se,L as R}from"./Lightformer-B1d8CncD.js";const ae=re>=125?"uv1":"uv2",X=new F,O=new _;class q extends de{constructor(){super(),this.isLineSegmentsGeometry=!0,this.type="LineSegmentsGeometry";const e=[-1,2,0,1,2,0,-1,1,0,1,1,0,-1,0,0,1,0,0,-1,-1,0,1,-1,0],t=[-1,2,1,2,-1,1,1,1,-1,-1,1,-1,-1,-2,1,-2],i=[0,2,1,2,3,1,2,4,3,4,5,3,4,6,5,6,7,5];this.setIndex(i),this.setAttribute("position",new k(e,3)),this.setAttribute("uv",new k(t,2))}applyMatrix4(e){const t=this.attributes.instanceStart,i=this.attributes.instanceEnd;return t!==void 0&&(t.applyMatrix4(e),i.applyMatrix4(e),t.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}setPositions(e){let t;e instanceof Float32Array?t=e:Array.isArray(e)&&(t=new Float32Array(e));const i=new N(t,6,1);return this.setAttribute("instanceStart",new z(i,3,0)),this.setAttribute("instanceEnd",new z(i,3,3)),this.computeBoundingBox(),this.computeBoundingSphere(),this}setColors(e,t=3){let i;e instanceof Float32Array?i=e:Array.isArray(e)&&(i=new Float32Array(e));const n=new N(i,t*2,1);return this.setAttribute("instanceColorStart",new z(n,t,0)),this.setAttribute("instanceColorEnd",new z(n,t,t)),this}fromWireframeGeometry(e){return this.setPositions(e.attributes.position.array),this}fromEdgesGeometry(e){return this.setPositions(e.attributes.position.array),this}fromMesh(e){return this.fromWireframeGeometry(new fe(e.geometry)),this}fromLineSegments(e){const t=e.geometry;return this.setPositions(t.attributes.position.array),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new F);const e=this.attributes.instanceStart,t=this.attributes.instanceEnd;e!==void 0&&t!==void 0&&(this.boundingBox.setFromBufferAttribute(e),X.setFromBufferAttribute(t),this.boundingBox.union(X))}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new ne),this.boundingBox===null&&this.computeBoundingBox();const e=this.attributes.instanceStart,t=this.attributes.instanceEnd;if(e!==void 0&&t!==void 0){const i=this.boundingSphere.center;this.boundingBox.getCenter(i);let n=0;for(let s=0,c=e.count;s<c;s++)O.fromBufferAttribute(e,s),n=Math.max(n,i.distanceToSquared(O)),O.fromBufferAttribute(t,s),n=Math.max(n,i.distanceToSquared(O));this.boundingSphere.radius=Math.sqrt(n),isNaN(this.boundingSphere.radius)&&console.error("THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.",this)}}toJSON(){}applyMatrix(e){return console.warn("THREE.LineSegmentsGeometry: applyMatrix() has been renamed to applyMatrix4()."),this.applyMatrix4(e)}}class ce extends q{constructor(){super(),this.isLineGeometry=!0,this.type="LineGeometry"}setPositions(e){const t=e.length-3,i=new Float32Array(2*t);for(let n=0;n<t;n+=3)i[2*n]=e[n],i[2*n+1]=e[n+1],i[2*n+2]=e[n+2],i[2*n+3]=e[n+3],i[2*n+4]=e[n+4],i[2*n+5]=e[n+5];return super.setPositions(i),this}setColors(e,t=3){const i=e.length-t,n=new Float32Array(2*i);if(t===3)for(let s=0;s<i;s+=t)n[2*s]=e[s],n[2*s+1]=e[s+1],n[2*s+2]=e[s+2],n[2*s+3]=e[s+3],n[2*s+4]=e[s+4],n[2*s+5]=e[s+5];else for(let s=0;s<i;s+=t)n[2*s]=e[s],n[2*s+1]=e[s+1],n[2*s+2]=e[s+2],n[2*s+3]=e[s+3],n[2*s+4]=e[s+4],n[2*s+5]=e[s+5],n[2*s+6]=e[s+6],n[2*s+7]=e[s+7];return super.setColors(n,t),this}fromLine(e){const t=e.geometry;return this.setPositions(t.attributes.position.array),this}}class $ extends ue{constructor(e){super({type:"LineMaterial",uniforms:J.clone(J.merge([K.common,K.fog,{worldUnits:{value:1},linewidth:{value:1},resolution:{value:new ie(1,1)},dashOffset:{value:0},dashScale:{value:1},dashSize:{value:1},gapSize:{value:1}}])),vertexShader:`
				#include <common>
				#include <fog_pars_vertex>
				#include <logdepthbuf_pars_vertex>
				#include <clipping_planes_pars_vertex>

				uniform float linewidth;
				uniform vec2 resolution;

				attribute vec3 instanceStart;
				attribute vec3 instanceEnd;

				#ifdef USE_COLOR
					#ifdef USE_LINE_COLOR_ALPHA
						varying vec4 vLineColor;
						attribute vec4 instanceColorStart;
						attribute vec4 instanceColorEnd;
					#else
						varying vec3 vLineColor;
						attribute vec3 instanceColorStart;
						attribute vec3 instanceColorEnd;
					#endif
				#endif

				#ifdef WORLD_UNITS

					varying vec4 worldPos;
					varying vec3 worldStart;
					varying vec3 worldEnd;

					#ifdef USE_DASH

						varying vec2 vUv;

					#endif

				#else

					varying vec2 vUv;

				#endif

				#ifdef USE_DASH

					uniform float dashScale;
					attribute float instanceDistanceStart;
					attribute float instanceDistanceEnd;
					varying float vLineDistance;

				#endif

				void trimSegment( const in vec4 start, inout vec4 end ) {

					// trim end segment so it terminates between the camera plane and the near plane

					// conservative estimate of the near plane
					float a = projectionMatrix[ 2 ][ 2 ]; // 3nd entry in 3th column
					float b = projectionMatrix[ 3 ][ 2 ]; // 3nd entry in 4th column
					float nearEstimate = - 0.5 * b / a;

					float alpha = ( nearEstimate - start.z ) / ( end.z - start.z );

					end.xyz = mix( start.xyz, end.xyz, alpha );

				}

				void main() {

					#ifdef USE_COLOR

						vLineColor = ( position.y < 0.5 ) ? instanceColorStart : instanceColorEnd;

					#endif

					#ifdef USE_DASH

						vLineDistance = ( position.y < 0.5 ) ? dashScale * instanceDistanceStart : dashScale * instanceDistanceEnd;
						vUv = uv;

					#endif

					float aspect = resolution.x / resolution.y;

					// camera space
					vec4 start = modelViewMatrix * vec4( instanceStart, 1.0 );
					vec4 end = modelViewMatrix * vec4( instanceEnd, 1.0 );

					#ifdef WORLD_UNITS

						worldStart = start.xyz;
						worldEnd = end.xyz;

					#else

						vUv = uv;

					#endif

					// special case for perspective projection, and segments that terminate either in, or behind, the camera plane
					// clearly the gpu firmware has a way of addressing this issue when projecting into ndc space
					// but we need to perform ndc-space calculations in the shader, so we must address this issue directly
					// perhaps there is a more elegant solution -- WestLangley

					bool perspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 ); // 4th entry in the 3rd column

					if ( perspective ) {

						if ( start.z < 0.0 && end.z >= 0.0 ) {

							trimSegment( start, end );

						} else if ( end.z < 0.0 && start.z >= 0.0 ) {

							trimSegment( end, start );

						}

					}

					// clip space
					vec4 clipStart = projectionMatrix * start;
					vec4 clipEnd = projectionMatrix * end;

					// ndc space
					vec3 ndcStart = clipStart.xyz / clipStart.w;
					vec3 ndcEnd = clipEnd.xyz / clipEnd.w;

					// direction
					vec2 dir = ndcEnd.xy - ndcStart.xy;

					// account for clip-space aspect ratio
					dir.x *= aspect;
					dir = normalize( dir );

					#ifdef WORLD_UNITS

						// get the offset direction as perpendicular to the view vector
						vec3 worldDir = normalize( end.xyz - start.xyz );
						vec3 offset;
						if ( position.y < 0.5 ) {

							offset = normalize( cross( start.xyz, worldDir ) );

						} else {

							offset = normalize( cross( end.xyz, worldDir ) );

						}

						// sign flip
						if ( position.x < 0.0 ) offset *= - 1.0;

						float forwardOffset = dot( worldDir, vec3( 0.0, 0.0, 1.0 ) );

						// don't extend the line if we're rendering dashes because we
						// won't be rendering the endcaps
						#ifndef USE_DASH

							// extend the line bounds to encompass  endcaps
							start.xyz += - worldDir * linewidth * 0.5;
							end.xyz += worldDir * linewidth * 0.5;

							// shift the position of the quad so it hugs the forward edge of the line
							offset.xy -= dir * forwardOffset;
							offset.z += 0.5;

						#endif

						// endcaps
						if ( position.y > 1.0 || position.y < 0.0 ) {

							offset.xy += dir * 2.0 * forwardOffset;

						}

						// adjust for linewidth
						offset *= linewidth * 0.5;

						// set the world position
						worldPos = ( position.y < 0.5 ) ? start : end;
						worldPos.xyz += offset;

						// project the worldpos
						vec4 clip = projectionMatrix * worldPos;

						// shift the depth of the projected points so the line
						// segments overlap neatly
						vec3 clipPose = ( position.y < 0.5 ) ? ndcStart : ndcEnd;
						clip.z = clipPose.z * clip.w;

					#else

						vec2 offset = vec2( dir.y, - dir.x );
						// undo aspect ratio adjustment
						dir.x /= aspect;
						offset.x /= aspect;

						// sign flip
						if ( position.x < 0.0 ) offset *= - 1.0;

						// endcaps
						if ( position.y < 0.0 ) {

							offset += - dir;

						} else if ( position.y > 1.0 ) {

							offset += dir;

						}

						// adjust for linewidth
						offset *= linewidth;

						// adjust for clip-space to screen-space conversion // maybe resolution should be based on viewport ...
						offset /= resolution.y;

						// select end
						vec4 clip = ( position.y < 0.5 ) ? clipStart : clipEnd;

						// back to clip space
						offset *= clip.w;

						clip.xy += offset;

					#endif

					gl_Position = clip;

					vec4 mvPosition = ( position.y < 0.5 ) ? start : end; // this is an approximation

					#include <logdepthbuf_vertex>
					#include <clipping_planes_vertex>
					#include <fog_vertex>

				}
			`,fragmentShader:`
				uniform vec3 diffuse;
				uniform float opacity;
				uniform float linewidth;

				#ifdef USE_DASH

					uniform float dashOffset;
					uniform float dashSize;
					uniform float gapSize;

				#endif

				varying float vLineDistance;

				#ifdef WORLD_UNITS

					varying vec4 worldPos;
					varying vec3 worldStart;
					varying vec3 worldEnd;

					#ifdef USE_DASH

						varying vec2 vUv;

					#endif

				#else

					varying vec2 vUv;

				#endif

				#include <common>
				#include <fog_pars_fragment>
				#include <logdepthbuf_pars_fragment>
				#include <clipping_planes_pars_fragment>

				#ifdef USE_COLOR
					#ifdef USE_LINE_COLOR_ALPHA
						varying vec4 vLineColor;
					#else
						varying vec3 vLineColor;
					#endif
				#endif

				vec2 closestLineToLine(vec3 p1, vec3 p2, vec3 p3, vec3 p4) {

					float mua;
					float mub;

					vec3 p13 = p1 - p3;
					vec3 p43 = p4 - p3;

					vec3 p21 = p2 - p1;

					float d1343 = dot( p13, p43 );
					float d4321 = dot( p43, p21 );
					float d1321 = dot( p13, p21 );
					float d4343 = dot( p43, p43 );
					float d2121 = dot( p21, p21 );

					float denom = d2121 * d4343 - d4321 * d4321;

					float numer = d1343 * d4321 - d1321 * d4343;

					mua = numer / denom;
					mua = clamp( mua, 0.0, 1.0 );
					mub = ( d1343 + d4321 * ( mua ) ) / d4343;
					mub = clamp( mub, 0.0, 1.0 );

					return vec2( mua, mub );

				}

				void main() {

					#include <clipping_planes_fragment>

					#ifdef USE_DASH

						if ( vUv.y < - 1.0 || vUv.y > 1.0 ) discard; // discard endcaps

						if ( mod( vLineDistance + dashOffset, dashSize + gapSize ) > dashSize ) discard; // todo - FIX

					#endif

					float alpha = opacity;

					#ifdef WORLD_UNITS

						// Find the closest points on the view ray and the line segment
						vec3 rayEnd = normalize( worldPos.xyz ) * 1e5;
						vec3 lineDir = worldEnd - worldStart;
						vec2 params = closestLineToLine( worldStart, worldEnd, vec3( 0.0, 0.0, 0.0 ), rayEnd );

						vec3 p1 = worldStart + lineDir * params.x;
						vec3 p2 = rayEnd * params.y;
						vec3 delta = p1 - p2;
						float len = length( delta );
						float norm = len / linewidth;

						#ifndef USE_DASH

							#ifdef USE_ALPHA_TO_COVERAGE

								float dnorm = fwidth( norm );
								alpha = 1.0 - smoothstep( 0.5 - dnorm, 0.5 + dnorm, norm );

							#else

								if ( norm > 0.5 ) {

									discard;

								}

							#endif

						#endif

					#else

						#ifdef USE_ALPHA_TO_COVERAGE

							// artifacts appear on some hardware if a derivative is taken within a conditional
							float a = vUv.x;
							float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
							float len2 = a * a + b * b;
							float dlen = fwidth( len2 );

							if ( abs( vUv.y ) > 1.0 ) {

								alpha = 1.0 - smoothstep( 1.0 - dlen, 1.0 + dlen, len2 );

							}

						#else

							if ( abs( vUv.y ) > 1.0 ) {

								float a = vUv.x;
								float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
								float len2 = a * a + b * b;

								if ( len2 > 1.0 ) discard;

							}

						#endif

					#endif

					vec4 diffuseColor = vec4( diffuse, alpha );
					#ifdef USE_COLOR
						#ifdef USE_LINE_COLOR_ALPHA
							diffuseColor *= vLineColor;
						#else
							diffuseColor.rgb *= vLineColor;
						#endif
					#endif

					#include <logdepthbuf_fragment>

					gl_FragColor = diffuseColor;

					#include <tonemapping_fragment>
					#include <${re>=154?"colorspace_fragment":"encodings_fragment"}>
					#include <fog_fragment>
					#include <premultiplied_alpha_fragment>

				}
			`,clipping:!0}),this.isLineMaterial=!0,this.onBeforeCompile=function(){this.transparent?this.defines.USE_LINE_COLOR_ALPHA="1":delete this.defines.USE_LINE_COLOR_ALPHA},Object.defineProperties(this,{color:{enumerable:!0,get:function(){return this.uniforms.diffuse.value},set:function(t){this.uniforms.diffuse.value=t}},worldUnits:{enumerable:!0,get:function(){return"WORLD_UNITS"in this.defines},set:function(t){t===!0?this.defines.WORLD_UNITS="":delete this.defines.WORLD_UNITS}},linewidth:{enumerable:!0,get:function(){return this.uniforms.linewidth.value},set:function(t){this.uniforms.linewidth.value=t}},dashed:{enumerable:!0,get:function(){return"USE_DASH"in this.defines},set(t){!!t!="USE_DASH"in this.defines&&(this.needsUpdate=!0),t===!0?this.defines.USE_DASH="":delete this.defines.USE_DASH}},dashScale:{enumerable:!0,get:function(){return this.uniforms.dashScale.value},set:function(t){this.uniforms.dashScale.value=t}},dashSize:{enumerable:!0,get:function(){return this.uniforms.dashSize.value},set:function(t){this.uniforms.dashSize.value=t}},dashOffset:{enumerable:!0,get:function(){return this.uniforms.dashOffset.value},set:function(t){this.uniforms.dashOffset.value=t}},gapSize:{enumerable:!0,get:function(){return this.uniforms.gapSize.value},set:function(t){this.uniforms.gapSize.value=t}},opacity:{enumerable:!0,get:function(){return this.uniforms.opacity.value},set:function(t){this.uniforms.opacity.value=t}},resolution:{enumerable:!0,get:function(){return this.uniforms.resolution.value},set:function(t){this.uniforms.resolution.value.copy(t)}},alphaToCoverage:{enumerable:!0,get:function(){return"USE_ALPHA_TO_COVERAGE"in this.defines},set:function(t){!!t!="USE_ALPHA_TO_COVERAGE"in this.defines&&(this.needsUpdate=!0),t===!0?(this.defines.USE_ALPHA_TO_COVERAGE="",this.extensions.derivatives=!0):(delete this.defines.USE_ALPHA_TO_COVERAGE,this.extensions.derivatives=!1)}}}),this.setValues(e)}}const T=new B,Q=new _,Y=new _,m=new B,v=new B,S=new B,I=new _,H=new me,y=new he,Z=new _,C=new F,D=new ne,w=new B;let b,A;function ee(r,e,t){return w.set(0,0,-e,1).applyMatrix4(r.projectionMatrix),w.multiplyScalar(1/w.w),w.x=A/t.width,w.y=A/t.height,w.applyMatrix4(r.projectionMatrixInverse),w.multiplyScalar(1/w.w),Math.abs(Math.max(w.x,w.y))}function we(r,e){const t=r.matrixWorld,i=r.geometry,n=i.attributes.instanceStart,s=i.attributes.instanceEnd,c=Math.min(i.instanceCount,n.count);for(let o=0,f=c;o<f;o++){y.start.fromBufferAttribute(n,o),y.end.fromBufferAttribute(s,o),y.applyMatrix4(t);const u=new _,p=new _;b.distanceSqToSegment(y.start,y.end,p,u),p.distanceTo(u)<A*.5&&e.push({point:p,pointOnLine:u,distance:b.origin.distanceTo(p),object:r,face:null,faceIndex:o,uv:null,[ae]:null})}}function be(r,e,t){const i=e.projectionMatrix,s=r.material.resolution,c=r.matrixWorld,o=r.geometry,f=o.attributes.instanceStart,u=o.attributes.instanceEnd,p=Math.min(o.instanceCount,f.count),h=-e.near;b.at(1,S),S.w=1,S.applyMatrix4(e.matrixWorldInverse),S.applyMatrix4(i),S.multiplyScalar(1/S.w),S.x*=s.x/2,S.y*=s.y/2,S.z=0,I.copy(S),H.multiplyMatrices(e.matrixWorldInverse,c);for(let x=0,j=p;x<j;x++){if(m.fromBufferAttribute(f,x),v.fromBufferAttribute(u,x),m.w=1,v.w=1,m.applyMatrix4(H),v.applyMatrix4(H),m.z>h&&v.z>h)continue;if(m.z>h){const l=m.z-v.z,g=(m.z-h)/l;m.lerp(v,g)}else if(v.z>h){const l=v.z-m.z,g=(v.z-h)/l;v.lerp(m,g)}m.applyMatrix4(i),v.applyMatrix4(i),m.multiplyScalar(1/m.w),v.multiplyScalar(1/v.w),m.x*=s.x/2,m.y*=s.y/2,v.x*=s.x/2,v.y*=s.y/2,y.start.copy(m),y.start.z=0,y.end.copy(v),y.end.z=0;const U=y.closestPointToPointParameter(I,!0);y.at(U,Z);const M=ve.lerp(m.z,v.z,U),L=M>=-1&&M<=1,P=I.distanceTo(Z)<A*.5;if(L&&P){y.start.fromBufferAttribute(f,x),y.end.fromBufferAttribute(u,x),y.start.applyMatrix4(c),y.end.applyMatrix4(c);const l=new _,g=new _;b.distanceSqToSegment(y.start,y.end,g,l),t.push({point:g,pointOnLine:l,distance:b.origin.distanceTo(g),object:r,face:null,faceIndex:x,uv:null,[ae]:null})}}}class le extends pe{constructor(e=new q,t=new $({color:Math.random()*16777215})){super(e,t),this.isLineSegments2=!0,this.type="LineSegments2"}computeLineDistances(){const e=this.geometry,t=e.attributes.instanceStart,i=e.attributes.instanceEnd,n=new Float32Array(2*t.count);for(let c=0,o=0,f=t.count;c<f;c++,o+=2)Q.fromBufferAttribute(t,c),Y.fromBufferAttribute(i,c),n[o]=o===0?0:n[o-1],n[o+1]=n[o]+Q.distanceTo(Y);const s=new N(n,2,1);return e.setAttribute("instanceDistanceStart",new z(s,1,0)),e.setAttribute("instanceDistanceEnd",new z(s,1,1)),this}raycast(e,t){const i=this.material.worldUnits,n=e.camera;n===null&&!i&&console.error('LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2 while worldUnits is set to false.');const s=e.params.Line2!==void 0&&e.params.Line2.threshold||0;b=e.ray;const c=this.matrixWorld,o=this.geometry,f=this.material;A=f.linewidth+s,o.boundingSphere===null&&o.computeBoundingSphere(),D.copy(o.boundingSphere).applyMatrix4(c);let u;if(i)u=A*.5;else{const h=Math.max(n.near,D.distanceToPoint(b.origin));u=ee(n,h,f.resolution)}if(D.radius+=u,b.intersectsSphere(D)===!1)return;o.boundingBox===null&&o.computeBoundingBox(),C.copy(o.boundingBox).applyMatrix4(c);let p;if(i)p=A*.5;else{const h=Math.max(n.near,C.distanceToPoint(b.origin));p=ee(n,h,f.resolution)}C.expandByScalar(p),b.intersectsBox(C)!==!1&&(i?we(this,t):be(this,n,t))}onBeforeRender(e){const t=this.material.uniforms;t&&t.resolution&&(e.getViewport(T),this.material.uniforms.resolution.value.set(T.z,T.w))}}class _e extends le{constructor(e=new ce,t=new $({color:Math.random()*16777215})){super(e,t),this.isLine2=!0,this.type="Line2"}}const Ee=d.forwardRef(function({points:e,color:t=16777215,vertexColors:i,linewidth:n,lineWidth:s,segments:c,dashed:o,...f},u){var p,h;const x=se(L=>L.size),j=d.useMemo(()=>c?new le:new _e,[c]),[E]=d.useState(()=>new $),U=(i==null||(p=i[0])==null?void 0:p.length)===4?4:3,M=d.useMemo(()=>{const L=c?new q:new ce,P=e.map(l=>{const g=Array.isArray(l);return l instanceof _||l instanceof B?[l.x,l.y,l.z]:l instanceof ie?[l.x,l.y,0]:g&&l.length===3?[l[0],l[1],l[2]]:g&&l.length===2?[l[0],l[1],0]:l});if(L.setPositions(P.flat()),i){t=16777215;const l=i.map(g=>g instanceof ye?g.toArray():g);L.setColors(l.flat(),U)}return L},[e,c,i,U]);return d.useLayoutEffect(()=>{j.computeLineDistances()},[e,j]),d.useLayoutEffect(()=>{o?E.defines.USE_DASH="":delete E.defines.USE_DASH,E.needsUpdate=!0},[o,E]),d.useEffect(()=>()=>{M.dispose(),E.dispose()},[M]),d.createElement("primitive",V({object:j,ref:u},f),d.createElement("primitive",{object:M,attach:"geometry"}),d.createElement("primitive",V({object:E,attach:"material",color:t,vertexColors:!!i,resolution:[x.width,x.height],linewidth:(h=n??s)!==null&&h!==void 0?h:1,dashed:o,transparent:U===4},f)))}),te=d.forwardRef(({threshold:r=15,geometry:e,...t},i)=>{const n=d.useRef(null);d.useImperativeHandle(i,()=>n.current,[]);const s=d.useMemo(()=>[0,0,0,1,0,0],[]),c=d.useRef(),o=d.useRef();return d.useLayoutEffect(()=>{const f=n.current.parent,u=e??(f==null?void 0:f.geometry);if(!u||c.current===u&&o.current===r)return;c.current=u,o.current=r;const h=new ge(u,r).attributes.position.array;n.current.geometry.setPositions(h),n.current.geometry.attributes.instanceStart.needsUpdate=!0,n.current.geometry.attributes.instanceEnd.needsUpdate=!0,n.current.computeLineDistances()}),d.createElement(Ee,V({segments:!0,points:s,ref:n,raycast:()=>null},t))});function W({i:r,progress:e,children:t}){const i=d.useRef(),{size:n}=se();return oe((s,c)=>{const o=e.get()*3,f=Math.abs(o-r-.5),u=Math.max(0,1-Math.max(0,f-.35)*2.2),p=n.width<768;i.current.scale.setScalar((p?.55:1.05)*u**1.4),i.current.rotation.x+=c*.25+(s.pointer.y*.4-i.current.rotation.x)*.02,i.current.rotation.y+=c*.35+s.pointer.x*.6*.02,i.current.position.x=p?0:1.9,i.current.position.y=p?2:0}),a.jsx("group",{ref:i,children:t})}function G(){return a.jsx("meshPhysicalMaterial",{color:"#f4efe9",metalness:.15,roughness:.18,clearcoat:1,iridescence:.6,iridescenceIOR:1.4,flatShading:!0,envMapIntensity:1.4})}function Le({progress:r}){const e=d.useRef();return oe((t,i)=>{e.current.rotation.z+=i*.15,e.current.rotation.y=r.get()*4}),a.jsx("group",{ref:e,position:[1.9,0,-1],children:[[2.6,0,0],[-2.4,1.2,0],[0,-2.4,.5],[1.4,2,-1]].map((t,i)=>a.jsxs("mesh",{position:t,scale:.16+i*.03,children:[i%2?a.jsx("octahedronGeometry",{}):a.jsx("boxGeometry",{}),a.jsx("meshStandardMaterial",{color:i===0?"#ff5a1f":"#111111",metalness:.5,roughness:.3})]},i))})}function ze({progress:r}){return a.jsxs(xe,{dpr:[1,1.6],camera:{position:[0,0,7],fov:40},gl:{antialias:!0,alpha:!0},style:{pointerEvents:"none"},children:[a.jsx("ambientLight",{intensity:.4}),a.jsx("directionalLight",{position:[4,5,3],intensity:1.4}),a.jsx(W,{i:0,progress:r,children:a.jsxs("mesh",{children:[a.jsx("icosahedronGeometry",{args:[1.5,0]}),a.jsx(G,{}),a.jsx(te,{color:"#111",threshold:1})]})}),a.jsx(W,{i:1,progress:r,children:a.jsxs("mesh",{children:[a.jsx("boxGeometry",{args:[1.6,1.6,1.6]}),a.jsx(G,{}),a.jsx(te,{color:"#111"})]})}),a.jsx(W,{i:2,progress:r,children:a.jsxs("mesh",{children:[a.jsx("torusKnotGeometry",{args:[1,.32,160,12,2,3]}),a.jsx(G,{})]})}),a.jsx(Le,{progress:r}),a.jsxs(Se,{resolution:256,children:[a.jsx("color",{attach:"background",args:["#d9d4cc"]}),a.jsx(R,{form:"rect",intensity:3,position:[0,5,-2],scale:[10,3,1]}),a.jsx(R,{form:"rect",intensity:2.5,position:[-5,0,1],"rotation-y":Math.PI/2,scale:[8,3,1],color:"#ffb48f"}),a.jsx(R,{form:"rect",intensity:2.5,position:[5,0,1],"rotation-y":-Math.PI/2,scale:[8,3,1],color:"#9fd2ff"})]})]})}export{ze as default};
