import{r as u,j as o,F as Xe}from"./kit-B9vXdzke.js";import{az as Ze,av as Ue,aA as Se,aB as J,aC as Qe,a9 as Me,aa as Pe,w as b,S as Fe,b2 as re,ax as He,V as et,aD as oe,M as tt,aq as Q,aE as nt,aF as Ve,$ as Ne,C as it,b3 as st,u as ze,a as ae,b4 as rt,b as ee,as as Y,l as ot,D as at,E as Te,Z as Le,b5 as Be,b6 as De,P as qe,af as le,_ as ct,t as de,x as lt,aH as dt}from"./react-three-fiber.esm-BxSUdgq5.js";import{E as ut,B as pt,a as ft}from"./Bloom-Cc6FKeE6.js";import{N as ht}from"./Noise-CMTgmkfU.js";import{V as mt}from"./Vignette-DJs2MJBW.js";import{E as vt}from"./Environment-DySyqnUY.js";import{L as ve}from"./Lightformer-C9oU0LbB.js";import{G as xt}from"./Grid-BDPYmArs.js";import"./extends-CF3RwP-h.js";import"./constants-b4ZRw0Sn.js";import"./constants-CIMWHpzV.js";const Re=new Me,te=new b;class $e extends Ze{constructor(){super(),this.isLineSegmentsGeometry=!0,this.type="LineSegmentsGeometry";const e=[-1,2,0,1,2,0,-1,1,0,1,1,0,-1,0,0,1,0,0,-1,-1,0,1,-1,0],t=[-1,2,1,2,-1,1,1,1,-1,-1,1,-1,-1,-2,1,-2],n=[0,2,1,2,3,1,2,4,3,4,5,3,4,6,5,6,7,5];this.setIndex(n),this.setAttribute("position",new Ue(e,3)),this.setAttribute("uv",new Ue(t,2))}applyMatrix4(e){const t=this.attributes.instanceStart,n=this.attributes.instanceEnd;return t!==void 0&&(t.applyMatrix4(e),n.applyMatrix4(e),t.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}setPositions(e){let t;e instanceof Float32Array?t=e:Array.isArray(e)&&(t=new Float32Array(e));const n=new Se(t,6,1);return this.setAttribute("instanceStart",new J(n,3,0)),this.setAttribute("instanceEnd",new J(n,3,3)),this.computeBoundingBox(),this.computeBoundingSphere(),this}setColors(e){let t;e instanceof Float32Array?t=e:Array.isArray(e)&&(t=new Float32Array(e));const n=new Se(t,6,1);return this.setAttribute("instanceColorStart",new J(n,3,0)),this.setAttribute("instanceColorEnd",new J(n,3,3)),this}fromWireframeGeometry(e){return this.setPositions(e.attributes.position.array),this}fromEdgesGeometry(e){return this.setPositions(e.attributes.position.array),this}fromMesh(e){return this.fromWireframeGeometry(new Qe(e.geometry)),this}fromLineSegments(e){const t=e.geometry;return this.setPositions(t.attributes.position.array),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Me);const e=this.attributes.instanceStart,t=this.attributes.instanceEnd;e!==void 0&&t!==void 0&&(this.boundingBox.setFromBufferAttribute(e),Re.setFromBufferAttribute(t),this.boundingBox.union(Re))}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Pe),this.boundingBox===null&&this.computeBoundingBox();const e=this.attributes.instanceStart,t=this.attributes.instanceEnd;if(e!==void 0&&t!==void 0){const n=this.boundingSphere.center;this.boundingBox.getCenter(n);let s=0;for(let a=0,i=e.count;a<i;a++)te.fromBufferAttribute(e,a),s=Math.max(s,n.distanceToSquared(te)),te.fromBufferAttribute(t,a),s=Math.max(s,n.distanceToSquared(te));this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error("THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.",this)}}toJSON(){}applyMatrix(e){return console.warn("THREE.LineSegmentsGeometry: applyMatrix() has been renamed to applyMatrix4()."),this.applyMatrix4(e)}}oe.line={worldUnits:{value:1},linewidth:{value:1},resolution:{value:new et(1,1)},dashOffset:{value:0},dashScale:{value:1},dashSize:{value:1},gapSize:{value:1}};re.line={uniforms:He.merge([oe.common,oe.fog,oe.line]),vertexShader:`
		#include <common>
		#include <color_pars_vertex>
		#include <fog_pars_vertex>
		#include <logdepthbuf_pars_vertex>
		#include <clipping_planes_pars_vertex>

		uniform float linewidth;
		uniform vec2 resolution;

		attribute vec3 instanceStart;
		attribute vec3 instanceEnd;

		attribute vec3 instanceColorStart;
		attribute vec3 instanceColorEnd;

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

				vColor.xyz = ( position.y < 0.5 ) ? instanceColorStart : instanceColorEnd;

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

				vec3 worldDir = normalize( end.xyz - start.xyz );
				vec3 tmpFwd = normalize( mix( start.xyz, end.xyz, 0.5 ) );
				vec3 worldUp = normalize( cross( worldDir, tmpFwd ) );
				vec3 worldFwd = cross( worldDir, worldUp );
				worldPos = position.y < 0.5 ? start: end;

				// height offset
				float hw = linewidth * 0.5;
				worldPos.xyz += position.x < 0.0 ? hw * worldUp : - hw * worldUp;

				// don't extend the line if we're rendering dashes because we
				// won't be rendering the endcaps
				#ifndef USE_DASH

					// cap extension
					worldPos.xyz += position.y < 0.5 ? - hw * worldDir : hw * worldDir;

					// add width to the box
					worldPos.xyz += worldFwd * hw;

					// endcaps
					if ( position.y > 1.0 || position.y < 0.0 ) {

						worldPos.xyz -= worldFwd * 2.0 * hw;

					}

				#endif

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
		#include <color_pars_fragment>
		#include <fog_pars_fragment>
		#include <logdepthbuf_pars_fragment>
		#include <clipping_planes_pars_fragment>

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

			#include <logdepthbuf_fragment>
			#include <color_fragment>

			gl_FragColor = vec4( diffuseColor.rgb, alpha );

			#include <tonemapping_fragment>
			#include <colorspace_fragment>
			#include <fog_fragment>
			#include <premultiplied_alpha_fragment>

		}
		`};class Ye extends Fe{constructor(e){super({type:"LineMaterial",uniforms:He.clone(re.line.uniforms),vertexShader:re.line.vertexShader,fragmentShader:re.line.fragmentShader,clipping:!0}),this.isLineMaterial=!0,this.setValues(e)}get color(){return this.uniforms.diffuse.value}set color(e){this.uniforms.diffuse.value=e}get worldUnits(){return"WORLD_UNITS"in this.defines}set worldUnits(e){e===!0?this.defines.WORLD_UNITS="":delete this.defines.WORLD_UNITS}get linewidth(){return this.uniforms.linewidth.value}set linewidth(e){this.uniforms.linewidth&&(this.uniforms.linewidth.value=e)}get dashed(){return"USE_DASH"in this.defines}set dashed(e){e===!0!==this.dashed&&(this.needsUpdate=!0),e===!0?this.defines.USE_DASH="":delete this.defines.USE_DASH}get dashScale(){return this.uniforms.dashScale.value}set dashScale(e){this.uniforms.dashScale.value=e}get dashSize(){return this.uniforms.dashSize.value}set dashSize(e){this.uniforms.dashSize.value=e}get dashOffset(){return this.uniforms.dashOffset.value}set dashOffset(e){this.uniforms.dashOffset.value=e}get gapSize(){return this.uniforms.gapSize.value}set gapSize(e){this.uniforms.gapSize.value=e}get opacity(){return this.uniforms.opacity.value}set opacity(e){this.uniforms&&(this.uniforms.opacity.value=e)}get resolution(){return this.uniforms.resolution.value}set resolution(e){this.uniforms.resolution.value.copy(e)}get alphaToCoverage(){return"USE_ALPHA_TO_COVERAGE"in this.defines}set alphaToCoverage(e){this.defines&&(e===!0!==this.alphaToCoverage&&(this.needsUpdate=!0),e===!0?this.defines.USE_ALPHA_TO_COVERAGE="":delete this.defines.USE_ALPHA_TO_COVERAGE)}}const xe=new Q,Ce=new b,Oe=new b,E=new Q,_=new Q,C=new Q,ye=new b,ge=new Ve,j=new nt,Ie=new b,ne=new Me,ie=new Pe,O=new Q;let I,V;function We(r,e,t){return O.set(0,0,-e,1).applyMatrix4(r.projectionMatrix),O.multiplyScalar(1/O.w),O.x=V/t.width,O.y=V/t.height,O.applyMatrix4(r.projectionMatrixInverse),O.multiplyScalar(1/O.w),Math.abs(Math.max(O.x,O.y))}function yt(r,e){const t=r.matrixWorld,n=r.geometry,s=n.attributes.instanceStart,a=n.attributes.instanceEnd,i=Math.min(n.instanceCount,s.count);for(let l=0,p=i;l<p;l++){j.start.fromBufferAttribute(s,l),j.end.fromBufferAttribute(a,l),j.applyMatrix4(t);const f=new b,m=new b;I.distanceSqToSegment(j.start,j.end,m,f),m.distanceTo(f)<V*.5&&e.push({point:m,pointOnLine:f,distance:I.origin.distanceTo(m),object:r,face:null,faceIndex:l,uv:null,uv1:null})}}function gt(r,e,t){const n=e.projectionMatrix,a=r.material.resolution,i=r.matrixWorld,l=r.geometry,p=l.attributes.instanceStart,f=l.attributes.instanceEnd,m=Math.min(l.instanceCount,p.count),d=-e.near;I.at(1,C),C.w=1,C.applyMatrix4(e.matrixWorldInverse),C.applyMatrix4(n),C.multiplyScalar(1/C.w),C.x*=a.x/2,C.y*=a.y/2,C.z=0,ye.copy(C),ge.multiplyMatrices(e.matrixWorldInverse,i);for(let x=0,h=m;x<h;x++){if(E.fromBufferAttribute(p,x),_.fromBufferAttribute(f,x),E.w=1,_.w=1,E.applyMatrix4(ge),_.applyMatrix4(ge),E.z>d&&_.z>d)continue;if(E.z>d){const z=E.z-_.z,U=(E.z-d)/z;E.lerp(_,U)}else if(_.z>d){const z=_.z-E.z,U=(_.z-d)/z;_.lerp(E,U)}E.applyMatrix4(n),_.applyMatrix4(n),E.multiplyScalar(1/E.w),_.multiplyScalar(1/_.w),E.x*=a.x/2,E.y*=a.y/2,_.x*=a.x/2,_.y*=a.y/2,j.start.copy(E),j.start.z=0,j.end.copy(_),j.end.z=0;const w=j.closestPointToPointParameter(ye,!0);j.at(w,Ie);const M=Ne.lerp(E.z,_.z,w),A=M>=-1&&M<=1,R=ye.distanceTo(Ie)<V*.5;if(A&&R){j.start.fromBufferAttribute(p,x),j.end.fromBufferAttribute(f,x),j.start.applyMatrix4(i),j.end.applyMatrix4(i);const z=new b,U=new b;I.distanceSqToSegment(j.start,j.end,U,z),t.push({point:U,pointOnLine:z,distance:I.origin.distanceTo(U),object:r,face:null,faceIndex:x,uv:null,uv1:null})}}}class wt extends tt{constructor(e=new $e,t=new Ye({color:Math.random()*16777215})){super(e,t),this.isLineSegments2=!0,this.type="LineSegments2"}computeLineDistances(){const e=this.geometry,t=e.attributes.instanceStart,n=e.attributes.instanceEnd,s=new Float32Array(2*t.count);for(let i=0,l=0,p=t.count;i<p;i++,l+=2)Ce.fromBufferAttribute(t,i),Oe.fromBufferAttribute(n,i),s[l]=l===0?0:s[l-1],s[l+1]=s[l]+Ce.distanceTo(Oe);const a=new Se(s,2,1);return e.setAttribute("instanceDistanceStart",new J(a,1,0)),e.setAttribute("instanceDistanceEnd",new J(a,1,1)),this}raycast(e,t){const n=this.material.worldUnits,s=e.camera;s===null&&!n&&console.error('LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2 while worldUnits is set to false.');const a=e.params.Line2!==void 0&&e.params.Line2.threshold||0;I=e.ray;const i=this.matrixWorld,l=this.geometry,p=this.material;V=p.linewidth+a,l.boundingSphere===null&&l.computeBoundingSphere(),ie.copy(l.boundingSphere).applyMatrix4(i);let f;if(n)f=V*.5;else{const d=Math.max(s.near,ie.distanceToPoint(I.origin));f=We(s,d,p.resolution)}if(ie.radius+=f,I.intersectsSphere(ie)===!1)return;l.boundingBox===null&&l.computeBoundingBox(),ne.copy(l.boundingBox).applyMatrix4(i);let m;if(n)m=V*.5;else{const d=Math.max(s.near,ne.distanceToPoint(I.origin));m=We(s,d,p.resolution)}ne.expandByScalar(m),I.intersectsBox(ne)!==!1&&(n?yt(this,t):gt(this,s,t))}onBeforeRender(e){const t=this.material.uniforms;t&&t.resolution&&(e.getViewport(xe),this.material.uniforms.resolution.value.set(xe.z,xe.w))}}const{clamp:H,damp:k,lerp:be}=Ne,g=(r,e,t)=>H((r-e)/(t-e),0,1),ce=r=>r*r*(3-2*r),se=r=>1-Math.pow(1-r,3),S=[0,1,2,3].map(r=>({w:5.2-r*.55,d:3.5-r*.42,h:.9,y:r*1,z:-r*.34,x:r*.14})),Z=S[3].y+S[3].h;function Ge(r,e,t,n,s,a,i,l){const p=r-n/2,f=r+n/2,m=e,d=e+s,x=t-a/2,h=t+a/2,T=[[[p,m,h],[p,d,h]],[[f,m,h],[f,d,h]],[[p,m,x],[p,d,x]],[[f,m,x],[f,d,x]],[[p,d,h],[f,d,h]],[[f,d,h],[f,d,x]],[[f,d,x],[p,d,x]],[[p,d,x],[p,d,h]],[[p,m,h],[f,m,h]],[[f,m,h],[f,m,x]],[[p,m,x],[p,m,h]],[[f,m,x],[p,m,x]]],w=new b,M=new b,A=new b;T.forEach(([R,z])=>{w.set(...R),M.set(...z),A.subVectors(M,w).normalize().multiplyScalar(i),w.sub(A),M.add(A),l.push(w.x,w.y,w.z,M.x,M.y,M.z)})}function St(r){return u.useMemo(()=>{const e=[];e.push(-7,0,1.75,7,0,1.75,-2.6,0,-6,-2.6,0,5,3.4,0,-6,3.4,0,4.4),S.forEach(i=>Ge(i.x,i.y,i.z,i.w,i.h,i.d,.22,e)),Ge(S[3].x,Z,S[3].z+.2,S[3].w+.9,.06,S[3].d+.8,.3,e),S.slice(1).forEach(i=>{for(let l=0;l<6;l++){const p=i.x-i.w/2+.3+l*(i.w-.6)/5;e.push(p,i.y+.003,i.z+i.d/2+.05,p+.25,i.y+.003,i.z+i.d/2+.3)}});let t=0;for(let i=0;i<e.length;i+=6)t+=Math.hypot(e[i+3]-e[i],e[i+4]-e[i+1],e[i+5]-e[i+2]);const n=new $e().setPositions(e),s=new Ye({color:r,linewidth:1.7,dashed:!0,dashSize:0,gapSize:1e5,dashScale:1,transparent:!0,depthWrite:!1,toneMapped:!1}),a=new wt(n,s);return a.computeLineDistances(),{line:a,mat:s,total:t}},[r])}function bt(){const r=document.createElement("canvas");r.width=512,r.height=64;const e=r.getContext("2d");e.fillStyle="#ffffff",e.fillRect(0,0,512,64);for(let n=0;n<16;n++){const s=n*7%5!==0;e.fillStyle=s?"#ffffff":"#3a2a1c",e.fillRect(n*32+3,4,26,56)}e.fillStyle="#101010";for(let n=0;n<=16;n++)e.fillRect(n*32-2,0,5,64);e.fillRect(0,0,512,5),e.fillRect(0,59,512,5);const t=new le(r);return t.colorSpace=de,t}function Mt(){const r=document.createElement("canvas");r.width=r.height=512;const e=r.getContext("2d");e.strokeStyle="#d58a4c",e.fillStyle="#d58a4c",e.lineWidth=14,e.beginPath(),e.arc(256,256,236,0,Math.PI*2),e.stroke(),e.lineWidth=5,e.beginPath(),e.arc(256,256,200,0,Math.PI*2),e.stroke();for(let n=0;n<48;n++){const s=n/48*Math.PI*2;e.beginPath(),e.moveTo(256+Math.cos(s)*208,256+Math.sin(s)*208),e.lineTo(256+Math.cos(s)*224,256+Math.sin(s)*224),e.lineWidth=4,e.stroke()}e.font='900 150px "Inter Tight", Arial, sans-serif',e.textAlign="center",e.textBaseline="middle",e.fillText("YTS",256,236),e.lineWidth=10,e.beginPath(),e.moveTo(170,330),e.lineTo(232,380),e.lineTo(350,300),e.stroke();const t=new le(r);return t.colorSpace=de,t}function zt(){return u.useMemo(()=>{const r=document.createElement("canvas");r.width=2048,r.height=400;const e=new le(r);return e.colorSpace=de,{t:e,draw:n=>{const s=r.getContext("2d");s.clearRect(0,0,r.width,r.height),s.font='900 330px "Inter Tight", Arial, sans-serif',s.textAlign="center",s.textBaseline="middle";const a=s.measureText(n).width,i=Math.min(1,1960/a);s.save(),s.translate(1024,210),s.scale(i,1),s.lineWidth=3.5,s.strokeStyle="rgba(236,231,223,1)",s.strokeText(n,0,0),s.restore(),e.needsUpdate=!0}}},[])}const Et=`
uniform sampler2D uDepth; uniform float uAmount, uReveal;
varying vec2 vUv; varying float vD;
void main(){ vUv = uv; float d = texture2D(uDepth, uv).r; vD = d;
  vec3 p = position; p.z += d * uAmount * uReveal;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }`,_t=`
uniform sampler2D uMap; uniform float uOpacity, uSweep, uTime;
varying vec2 vUv; varying float vD;
float h(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }
float n2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
  return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
void main(){
  vec4 c = texture2D(uMap, vUv);
  vec2 e = smoothstep(vec2(0.), vec2(.05), vUv) * smoothstep(vec2(0.), vec2(.05), 1. - vUv);
  float nz = n2(vUv * vec2(26., 14.)) * .7 + n2(vUv * 90.) * .3;
  float th = uOpacity * 1.25 - .12;            // dissolve front, near pixels resolve first
  float k = nz - vD * .25;
  if (k > th) discard;
  float edge = 1. - smoothstep(0., .06, th - k);
  vec3 col = c.rgb * (.82 + .3 * vD);
  float sw = exp(-pow((vUv.x + vD * .25 - uSweep) * 7., 2.)) * vD;
  col += vec3(1., .78, .5) * sw * .35;
  col += vec3(1., .72, .38) * edge * 2.2 * step(.02, uOpacity) * (1. - step(.995, uOpacity));
  gl_FragColor = vec4(col, e.x * e.y);
  #include <colorspace_fragment>
}`;function ke({id:r,width:e,segs:t,u:n,...s}){const[a,i]=lt(dt,[`/portfolio/yts/img/${r}.webp`,`/portfolio/yts/depth/${r}.webp`]);a.colorSpace=de,a.anisotropy=4;const l=a.image?a.image.height/a.image.width:.6,p=u.useMemo(()=>new qe(e,e*l,t,Math.round(t*l)),[e,l,t]),f=u.useMemo(()=>new Fe({vertexShader:Et,fragmentShader:_t,transparent:!0,depthWrite:!0,uniforms:{uMap:{value:a},uDepth:{value:i},uAmount:{value:1.6},uReveal:{value:0},uOpacity:{value:0},uSweep:{value:-1},uTime:{value:0}}}),[a,i]);return u.useLayoutEffect(()=>{n.current=f.uniforms},[f,n]),o.jsx("mesh",{geometry:p,material:f,...s})}function jt({pd:r,words:e,mobile:t}){const{size:n}=ze(),s=St("#efe2c4"),a=u.useMemo(Mt,[]),i=zt(),l=u.useRef(""),p=u.useMemo(()=>new Y({color:"#e7dfd2",roughness:.82,metalness:0,transparent:!0}),[]),f=u.useMemo(bt,[]),m=u.useMemo(()=>new Y({color:"#2b3236",roughness:.12,metalness:.7,emissive:"#ffb066",emissiveMap:f,emissiveIntensity:0,transparent:!0}),[f]),d=u.useMemo(()=>new Y({color:"#ebe6dd",roughness:.9,transparent:!0}),[]),x=u.useMemo(()=>new Y({color:"#b9b2a6",roughness:.6,metalness:.1,transparent:!0}),[]),h=u.useMemo(()=>new Y({color:"#2c221c",roughness:.5,metalness:.05,transparent:!0}),[]),T=u.useMemo(()=>new Y({color:"#2a3a44",roughness:.08,metalness:.9,emissive:"#ffb469",emissiveIntensity:0,transparent:!0}),[]),w=u.useMemo(()=>new ot({color:"#d58a4c",transparent:!0,opacity:0,depthWrite:!1,side:at}),[]),M=u.useMemo(()=>{const c=new Te(new Le(7,5.4,5.2)),y=new Be(c,new De({color:"#e0965a",dashSize:.22,gapSize:.14,transparent:!0,opacity:0}));return y.computeLineDistances(),y},[]),A=u.useMemo(()=>{const c=new Te(new qe(10,7.6)),y=new Be(c,new De({color:"#e0965a",dashSize:.3,gapSize:.18,transparent:!0,opacity:0}));return y.rotation.x=-Math.PI/2,y.computeLineDistances(),y},[]),R=u.useMemo(()=>{const c=document.createElement("canvas");c.width=c.height=128;const y=c.getContext("2d"),v=y.createRadialGradient(64,64,6,64,64,64);return v.addColorStop(0,"rgba(0,0,0,.75)"),v.addColorStop(1,"rgba(0,0,0,0)"),y.fillStyle=v,y.fillRect(0,0,128,128),new le(c)},[]),z=u.useRef(),U=u.useRef(),N=u.useRef(),B=u.useRef(),P=u.useRef(),Ee=u.useRef([]),ue=u.useRef(),_e=u.useRef(),pe=u.useMemo(()=>S.map((c,y)=>{const v=[];for(let L=0;L<3;L++)for(let $=0;$<2;$++)v.push([c.x-c.w/2+.35+L*(c.w-.7)/2,c.z-c.d/2+.4+$*(c.d-.8)/1]);const D=Math.round(c.w/.36),G=[];for(let L=0;L<=D;L++)G.push(c.x-c.w/2+.06+L*(c.w-.12)/D);return{f:c,cols:v,fins:G,i:y}}),[]),Je=u.useMemo(()=>new ct(.07,.07,.76,12),[]),Ke=u.useMemo(()=>new Le(.045,.76,.2),[]),fe=u.useRef([]);return u.useLayoutEffect(()=>{const c=new Ve;fe.current.forEach((y,v)=>{if(!y)return;const W=pe[Math.floor(v/2)];v%2===0?W.cols.forEach(([q,D],G)=>y.setMatrixAt(G,c.makeTranslation(q,W.f.y+.16+.38,D))):W.fins.forEach((q,D)=>y.setMatrixAt(D,c.makeTranslation(q,W.f.y+.16+.38,W.f.z+W.f.d/2+.12))),y.instanceMatrix.needsUpdate=!0})},[pe]),ee((c,y)=>{const v=r.current,W=c.clock.elapsedTime,q=g(v,.08,.8);s.mat.dashSize=s.total*ce(q)+.001,s.mat.opacity=(.25+.75*(1-g(v,1.2,1.7)*.55))*(1-g(v,2,2.3)),s.mat.resolution.set(n.width,n.height),s.line.visible=s.mat.opacity>.01;const D=g(v,.85,1.3)*(1-g(v,2.02,2.3));p.opacity=D,m.opacity=D,m.emissiveIntensity=g(v,1.35,1.8)*4.5,U.current.visible=D>.01;const G=g(v,1,1.4)*(1-g(v,1.9,2.15));N.current.position.y=2.7+(1-se(g(v,1,1.45)))*3.5,w.opacity=G*.03,M.material.opacity=G*.9,A.material.opacity=G*.8,N.current.visible=A.visible=G>.01;const L=g(v,1.42,1.62),$=1-g(v,1.95,2.1);B.current.position.y=Z+.08+(1-se(L))*2.2,B.current.scale.setScalar(be(2.2,1,se(L))*(1+Math.max(0,Math.sin(g(v,1.6,1.72)*Math.PI))*.12)),B.current.material.opacity=L*$,B.current.visible=L*$>.01;const he=g(v,1.95,2.2)*(1-g(v,3,3.3));P.current.visible=he>.01,[d,x,h,T].forEach(F=>{F.opacity=he}),T.emissiveIntensity=g(v,2.55,2.95)*1.4+g(v,2.95,3)*.4,Ee.current.forEach((F,K)=>{if(!F)return;const X=2.2*(1-se(g(v,2+K*.07,2.72+K*.05)))+(.18+K*.06)*Math.sin(g(v,2.72,3)*Math.PI)*0;F.position.y=K*X*1.15,F.children[1].position.y=X*.5,F.children[2].position.z=X*1.5,F.children[3].position.z=X*.9,F.children[2].position.x=X*.25*(K%2?1:-1)});const je=Math.min(4,Math.max(0,Math.floor(v+1e-4))),me=e[je];me!==l.current&&(l.current=me,i.draw(me));const Ae=v-je;ue.current.position.x=(.5-Ae)*3.2,ue.current.material.opacity=.16*Math.sin(H(Ae,0,1)*Math.PI)**.35*(1-g(v,2.9,3.05)),_e.current.material.opacity=Math.max(D,he)*.8,z.current.rotation.y=Math.sin(W*.15)*.04+(v<3?v*.12:.36),z.current.scale.setScalar(t?.8:1)}),u.useEffect(()=>{var c,y;(y=(c=document.fonts)==null?void 0:c.ready)==null||y.then(()=>{l.current=""})},[]),o.jsxs("group",{children:[o.jsxs("mesh",{ref:ue,position:[0,3.4,-9],renderOrder:-1,children:[o.jsx("planeGeometry",{args:[24,24*400/2048]}),o.jsx("meshBasicMaterial",{map:i.t,transparent:!0,depthWrite:!1,fog:!1,opacity:0,toneMapped:!1})]}),o.jsxs("group",{ref:z,children:[o.jsxs("mesh",{ref:_e,"rotation-x":-Math.PI/2,position:[.2,.004,-.4],children:[o.jsx("planeGeometry",{args:[9,7]}),o.jsx("meshBasicMaterial",{map:R,transparent:!0,depthWrite:!1,opacity:0})]}),o.jsx("primitive",{object:s.line}),o.jsxs("group",{ref:U,children:[S.map((c,y)=>o.jsxs("group",{position:[c.x,c.y+c.h/2,c.z],children:[o.jsx("mesh",{material:p,children:o.jsx("boxGeometry",{args:[c.w,c.h,c.d]})}),o.jsx("mesh",{material:m,position:[0,-.02,c.d/2+.006],children:o.jsx("boxGeometry",{args:[c.w*.84,c.h*.52,.02]})})]},y)),o.jsx("mesh",{material:p,position:[S[3].x,Z+.03,S[3].z+.2],children:o.jsx("boxGeometry",{args:[S[3].w+.9,.06,S[3].d+.8]})})]}),o.jsxs("group",{ref:N,position:[.2,2.7,-.4],children:[o.jsx("primitive",{object:M}),o.jsx("mesh",{material:w,children:o.jsx("boxGeometry",{args:[7,5.4,5.2]})})]}),o.jsx("primitive",{object:A,position:[.2,.01,-.4]}),o.jsxs("mesh",{ref:B,"rotation-x":-Math.PI/2,position:[S[3].x,Z+.1,S[3].z+.2],children:[o.jsx("planeGeometry",{args:[1.5,1.5]}),o.jsx("meshBasicMaterial",{map:a,transparent:!0,depthWrite:!1,toneMapped:!1,opacity:0})]}),o.jsxs("group",{ref:P,children:[pe.map(c=>o.jsxs("group",{ref:y=>Ee.current[c.i]=y,children:[o.jsx("mesh",{material:d,position:[c.f.x,c.f.y+.08,c.f.z],children:o.jsx("boxGeometry",{args:[c.f.w,.16,c.f.d]})}),o.jsx("group",{children:o.jsx("instancedMesh",{ref:y=>fe.current[c.i*2]=y,args:[Je,x,c.cols.length]})}),o.jsx("group",{children:o.jsx("instancedMesh",{ref:y=>fe.current[c.i*2+1]=y,args:[Ke,h,c.fins.length]})}),o.jsx("group",{children:o.jsx("mesh",{material:T,position:[c.f.x,c.f.y+.54,c.f.z+c.f.d/2-.05],children:o.jsx("boxGeometry",{args:[c.f.w-.2,.74,.04]})})})]},c.i)),o.jsx("mesh",{material:d,position:[S[3].x,Z+.08,S[3].z+.2],children:o.jsx("boxGeometry",{args:[S[3].w+.9,.14,S[3].d+.8]})})]})]})]})}function At({pd:r,mobile:e}){const t=u.useRef(),n=u.useRef();ee((a,i)=>{const l=r.current;if(a.clock.elapsedTime,t.current){const p=g(l,3,3.4)*(1-g(l,3.88,4.18));t.current.uOpacity.value=p,t.current.uReveal.value=k(t.current.uReveal.value,p,3,i),t.current.uSweep.value=-.3+g(l,3.2,3.95)*1.6}if(n.current){const p=g(l,3.92,4.3);n.current.uOpacity.value=p,n.current.uReveal.value=k(n.current.uReveal.value,p,3,i),n.current.uSweep.value=-.3+g(l,4.2,4.95)*1.6}});const s=e?130:240;return o.jsxs("group",{position:[0,2.3,-13],children:[o.jsx(ke,{id:98,width:13,segs:s,u:t,position:[0,0,0]}),o.jsx(ke,{id:130,width:16,segs:s,u:n,position:[0,0,-.6]})]})}const we=[{p:[10.5,6.6,13.5],t:[.2,1.8,0],o:.35},{p:[-9.2,9.6,12.2],t:[.2,1.9,0],o:-.25},{p:[13.4,6.2,12.6],t:[.2,3.3,0],o:.3},{p:[0,2.3,-2],t:[0,2.3,-13],o:0,dolly:2.6},{p:[-.6,2.5,-1.6],t:[0,2.2,-13],o:0,swing:2}];function Ut({progress:r,pd:e,mobile:t}){const{camera:n,size:s}=ze(),a=u.useRef({p:new b(...we[0].p),t:new b(...we[0].t)}),i=u.useMemo(()=>({p:new b,t:new b,q:new b,r:new b}),[]);u.useEffect(()=>{n.fov=t?52:38,n.updateProjectionMatrix()},[n,t]);const l=u.useRef(-1),p=(f,m,d,x)=>{const h=we[f];d.set(...h.p),x.set(...h.t);const T=(m-.5)*h.o;if(h.o){const w=d.x-x.x,M=d.z-x.z,A=Math.cos(T),R=Math.sin(T);d.x=x.x+w*A-M*R,d.z=x.z+w*R+M*A}h.dolly&&(d.z-=ce(m)*h.dolly),h.swing&&(d.x+=(m-.5)*h.swing,d.z-=m*.8)};return ee((f,m)=>{var U,N;const d=Math.min(m,.05),x=H(r.get()*5,0,5);e.current=k(e.current,x,5,d);const h=e.current,T=H(h-.5,0,3.999),w=Math.floor(T),M=T-w,A=ce(g(M,.3,.75));p(w,H(h-w,0,1),i.p,i.t),p(Math.min(4,w+1),H(h-w-1,0,1),i.q,i.r),h<.5&&(p(0,h,i.p,i.t),i.q.copy(i.p),i.r.copy(i.t)),i.p.lerp(i.q,h<.5?0:A),i.t.lerp(i.r,h<.5?0:A);const R=w===2?Math.sin(A*Math.PI)*3.2:0;i.p.y+=R,i.p.x+=f.pointer.x*.35,i.p.y+=f.pointer.y*.22,a.current.p.x=k(a.current.p.x,i.p.x,3.2,d),a.current.p.y=k(a.current.p.y,i.p.y,3.2,d),a.current.p.z=k(a.current.p.z,i.p.z,3.2,d),a.current.t.x=k(a.current.t.x,i.t.x,3.2,d),a.current.t.y=k(a.current.t.y,i.t.y,3.2,d),a.current.t.z=k(a.current.t.z,i.t.z,3.2,d),n.position.copy(a.current.p),n.lookAt(a.current.t);const z=1-g(h,2.85,3.3)*.75;if(Math.abs(z-l.current)>.002||((U=n.view)==null?void 0:U.fullWidth)!==s.width||((N=n.view)==null?void 0:N.fullHeight)!==s.height){l.current=z;const B=s.width,P=s.height;t?n.setViewOffset(B,P,0,P*.13*z,B,P):n.setViewOffset(B,P,-B*.16*z,0,B,P)}}),null}function Tt({pd:r}){const e=u.useRef(),t=u.useRef(),n=u.useMemo(()=>new ae("#fff1dc"),[]),s=u.useMemo(()=>new ae("#ffc08a"),[]);return ee(()=>{const a=g(r.current,1.2,3);e.current.color.copy(n).lerp(s,a),e.current.intensity=be(2.8,2.2,a),t.current.intensity=be(.4,.22,a)}),o.jsxs(o.Fragment,{children:[o.jsx("ambientLight",{ref:t,intensity:.35,color:"#b9c4cc"}),o.jsx("directionalLight",{ref:e,position:[6,9,5],intensity:2.6}),o.jsx("directionalLight",{position:[-7,4,-3],intensity:.6,color:"#7f9bb0"})]})}const Lt=["#100f0e","#1f3a47","#a35d2c","#121110","#121110"];function Bt({pd:r}){const{scene:e}=ze(),t=u.useMemo(()=>Lt.map(n=>new ae(n)),[]);return u.useLayoutEffect(()=>(e.fog=new rt("#100f0e",16,44),e.background=new ae("#100f0e"),()=>{e.fog=null,e.background=null}),[e]),ee(()=>{const n=r.current,s=H(n-.5,0,3.999),a=Math.floor(s),i=ce(g(s-a,.3,.75));e.background.copy(t[a]).lerp(t[Math.min(4,a+1)],n<.5?0:i),e.fog.color.copy(e.background)}),null}function Vt({progress:r,active:e,mobile:t,words:n}){const s=u.useRef(0);return o.jsxs(it,{frameloop:e?"always":"never",dpr:[1,t?1.5:1.6],gl:{antialias:!!t,powerPreference:"high-performance",toneMapping:st},camera:{position:[7.5,5.2,9.5],fov:38,near:.1,far:80},style:{position:"absolute",inset:0},children:[o.jsx(Bt,{pd:s}),o.jsx(Ut,{progress:r,pd:s,mobile:t}),o.jsx(Tt,{pd:s}),o.jsxs(vt,{resolution:128,frames:1,children:[o.jsx(ve,{form:"rect",intensity:3,color:"#ffe2bf",position:[5,6,6],scale:[8,4,1]}),o.jsx(ve,{form:"rect",intensity:1.2,color:"#9fb6c8",position:[-6,3,-4],scale:[6,6,1]}),o.jsx(ve,{form:"ring",intensity:2,color:"#ffffff",position:[0,8,0],scale:4})]}),o.jsx(xt,{position:[0,0,0],args:[40,40],infiniteGrid:!0,cellSize:.5,cellThickness:.6,cellColor:"#2b2824",sectionSize:2.5,sectionThickness:1,sectionColor:"#4d4234",fadeDistance:34,fadeStrength:1.6}),o.jsx(jt,{pd:s,words:n,mobile:t}),o.jsx(Xe.Suspense,{fallback:null,children:o.jsx(At,{pd:s,mobile:t})}),!t&&o.jsxs(ut,{multisampling:4,disableNormalPass:!0,children:[o.jsx(pt,{mipmapBlur:!0,intensity:.85,luminanceThreshold:.78,luminanceSmoothing:.2}),o.jsx(ht,{premultiply:!0,blendFunction:ft.SOFT_LIGHT,opacity:.35}),o.jsx(mt,{offset:.28,darkness:.72})]})]})}export{Lt as CHAPTER,Vt as default};
