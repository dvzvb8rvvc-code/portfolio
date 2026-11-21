import{r as p,j as E}from"./kit-DYh9TQyw.js";import{a as ce,y as le,aI as fe,S as ve,f as me,P as J,V as pe,b as de,ar as K,x as Q,u as he,a0 as ae}from"./react-three-fiber.esm-Cyvn13h4.js";import{s as _}from"./yts-6_PT4AGI.js";import"./preload-helper-BDQy5SUP.js";import"./index-DheNWZa-.js";const w=[5,103,111,84],Z={111:[[.52,.5],[.57,.5]],5:[[.5,.56],[.47,.5]],103:[[.6,.5],[.79,.5]],84:[[.5,.5],[.55,.5]]},ee={111:1800/1125,5:1440/1800,103:1800/1519,84:1800/900},xe=t=>`/portfolio/yts/img/${t}.webp`,ge=t=>`/portfolio/yts/depth/${t}.webp`,l=6.4,S=2.6,z=5,we=1.16,V=40,re=`
float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
  return mix(mix(h21(i), h21(i+vec2(1.,0.)), f.x), mix(h21(i+vec2(0.,1.)), h21(i+vec2(1.,1.)), f.x), f.y); }
float fbm(vec2 p){ float a = .5, s = 0.; for(int i = 0; i < 4; i++){ s += a * vn(p); p = p * 2.03 + 17.1; a *= .5; } return s / .9375; }
vec2 cover(vec2 uv, vec4 c){ return uv * c.xy + c.zw; }`,ye=`
uniform sampler2D uDA, uDB; uniform vec4 uCA, uCB; uniform float uMix, uAmt, uTime, uPlane;
varying vec2 vUv; varying float vD;
${re}
void main(){
  vUv = uv;
  float dA = texture2D(uDA, cover(uv, uCA)).r, dB = texture2D(uDB, cover(uv, uCB)).r;
  float n = fbm(uv * vec2(uPlane, 1.) * 1.3 + vec2(0., uTime * .02));
  float f = clamp(n * .6 + (1. - dB) * .4, 0., 1.);
  float k = smoothstep(f - .2, f + .2, uMix * 1.4 - .2);
  float band = 1. - abs(2. * k - 1.);
  float d = mix(dA, dB, k);
  vD = d;
  vec3 p = position;
  p.z += d * uAmt + band * .07;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.);
}`,be=`
uniform sampler2D uA, uB, uDB; uniform vec4 uCA, uCB;
uniform float uMix, uTime, uPlane, uSweep, uDark, uFade, uSoft, uMobile;
uniform vec3 uPaper; uniform vec2 uRes;
varying vec2 vUv; varying float vD;
${re}
vec3 grade(vec3 c){
  float l = dot(c, vec3(.2126, .7152, .0722));
  c = mix(vec3(l), c, .84);                                            // restrained saturation
  c *= mix(vec3(.93, .96, 1.02), vec3(1.07, 1., .88), smoothstep(.04, .6, l)); // cool shadows, warm highlights
  c = c * .95 + vec3(.010, .0085, .0065);                               // lifted, warm blacks
  return c;
}
void main(){
  vec2 uv = vUv, q = uv * vec2(uPlane, 1.);
  float front = uMix * 1.4 - .2;
  float dB = texture2D(uDB, cover(uv, uCB)).r;
  float n = fbm(q * 1.3 + vec2(0., uTime * .02));
  float n2 = fbm(q * 4.2 - vec2(uTime * .03, 0.));
  float f = clamp(n * .6 + (1. - dB) * .4, 0., 1.) + (n2 - .5) * .1;
  float wide = 1. - abs(2. * smoothstep(f - .2, f + .2, front) - 1.);  // broad flow zone
  float k = smoothstep(f - .045, f + .045, front);                     // ink edge
  vec2 flow = vec2(fbm(q * 2.1 + 3.1 + uTime * .04), fbm(q * 2.1 - 7.3 - uTime * .04)) - .5;
  vec3 a = texture2D(uA, cover(uv + flow * wide * .07, uCA), uSoft).rgb;
  vec3 b = texture2D(uB, cover(uv - flow * wide * .05, uCB), uSoft).rgb;
  vec3 c = mix(a, b, k);
  // ink bleed: darkened wet edge + hairline of gold light on the front
  float edge = 1. - abs(2. * k - 1.);
  c *= 1. - wide * .22 - edge * .25;
  c += vec3(1., .74, .42) * pow(edge, 3.) * .05;
  // slow light sweep, riding the depth (only lights what is already lit)
  float sw = exp(-pow((uv.x * .85 + uv.y * .45 - uSweep + vD * .22) * 3.2, 2.));
  c += c * vec3(1., .86, .66) * sw * .28;
  c = grade(c);
  // legibility + cinema: bottom/left gradients, top for the nav, vignette
  vec2 s = gl_FragCoord.xy / uRes;
  c *= 1. - .66 * (1. - smoothstep(0., .6, s.y));
  c *= 1. - .4 * (1. - smoothstep(0., .62, s.x)) * (1. - smoothstep(.2, .9, s.y)) * (1. - uMobile);
  c *= 1. - .4 * smoothstep(.8, 1., s.y);
  c *= mix(1., 1. - smoothstep(.3, 1.2, length((s - .5) * vec2(1.1, 1.))), .6);
  c *= 1. - uDark;
  // film grain (fine, animated) — fades out with the paper hand-off
  float g = h21(gl_FragCoord.xy + fract(uTime * 7.31) * 113.) - .5;
  c += g * .028 * (.35 + sqrt(max(c.g, 0.))) * (1. - uFade);
  c = mix(c, uPaper, uFade);
  gl_FragColor = vec4(max(c, 0.), 1.);
  #include <colorspace_fragment>
}`,k=(t,r=0,c=1)=>Math.min(c,Math.max(r,t)),y=(t,r,c)=>k((t-r)/(c-r)),j=t=>t*t*(3-2*t),U=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2,h=ae.damp,P={x:0,y:0};let te=!1;function Me(){te||typeof window>"u"||(te=!0,window.addEventListener("pointermove",t=>{t.pointerType!=="touch"&&(P.x=t.clientX/innerWidth*2-1,P.y=-(t.clientY/innerHeight*2-1))},{passive:!0}))}function oe(t,r,c,d,f){let n=1,s=1;c>r?s=r/c:n=c/r,n/=d,s/=d;const v=k(f[0],n/2,1-n/2),x=k(f[1],s/2,1-s/2);return t.set(n,s,v-n/2,x-s/2)}const u=_.hero=_.hero||{i:0,k:0,ready:!1,go:-1,f:0};typeof window<"u"&&(window.__ytsHero=u);function Pe({track:t}){const{size:r,gl:c}=ce(),d=r.width<r.height,f=r.width<=768,n=le(fe,[...w.map(xe),...w.map(ge)]),s=n.slice(0,4),v=n.slice(4);p.useMemo(()=>{const m=Math.min(4,c.capabilities.getMaxAnisotropy());s.forEach(o=>{o.colorSpace=ve,o.anisotropy=m}),v.forEach(o=>{o.generateMipmaps=!1,o.minFilter=me})},[n]);const x=p.useMemo(()=>{const m=f?128:256,o=f?72:144;return d?new J(1,1,o,m):new J(1,1,m,o)},[d,f]);p.useEffect(()=>(Me(),()=>x.dispose()),[x]);const a=p.useMemo(()=>({uA:{value:s[0]},uB:{value:s[1]},uDA:{value:v[0]},uDB:{value:v[1]},uCA:{value:new K(1,1,0,0)},uCB:{value:new K(1,1,0,0)},uMix:{value:0},uAmt:{value:.2},uTime:{value:0},uPlane:{value:1.6},uSweep:{value:-1},uDark:{value:0},uFade:{value:0},uSoft:{value:0},uMobile:{value:f?1:0},uPaper:{value:new de("#ece7df")},uRes:{value:new pe(1,1)}}),[n]),b=p.useRef(),q=p.useRef(),ue=p.useRef({t:0,c:0,cur:0,next:1,ps:0,lastP:0,lastMove:-9,frames:0,cam:new Q(0,0,z),look:new Q,px:0,py:0});return he((m,o)=>{const M=t.current,e=ue.current;if(!b.current)return;if(!M.on){b.current.visible=!1;return}b.current.visible=!0,o=u.fixed||Math.min(o,1/20),e.t+=o;const T=e.t,L=r.width,se=r.height,D=L/se,F=L<=768;Math.abs(M.p-e.lastP)>1e-4&&(e.lastMove=T),e.lastP=M.p,e.ps=h(e.ps,M.p,4.5,o);const g=e.ps,B=l-S,R=e.c>=B;u.go>=0&&!R?(u.go!==e.cur&&(e.next=u.go,e.c=B),u.go=-1):u.go>=0&&R&&(u.go=-1),!R&&(T-e.lastMove<1.4||g>.03||document.hidden)||(e.c+=o),e.c>=l&&(e.c-=l,e.cur=e.next,e.next=(e.cur+1)%w.length);const ne=U(y(e.c,B,l)),A=e.c+S/2;u.i=A>=l?e.next:e.cur,u.k=(A>=l?A-l:A)/l;const O=w[e.cur],H=w[e.next];a.uA.value=s[e.cur],a.uB.value=s[e.next],a.uDA.value=v[e.cur],a.uDB.value=v[e.next];const $=l+S,I=d?1:0;oe(a.uCA.value,ee[O],D,1+.085*(e.c+S)/$,Z[O][I]),oe(a.uCB.value,ee[H],D,1+.085*Math.max(0,e.c-B)/$,Z[H][I]),a.uMix.value=ne,a.uTime.value=e.t,a.uPlane.value=D,a.uMobile.value=F?1:0,a.uSweep.value=e.t*.075%1.9-.45,m.gl.getDrawingBufferSize(a.uRes.value);const G=U(k((T-.1)/3.6)),C=U(y(g,0,.85));a.uAmt.value=(.22+.43*G)*(1+1.1*C),a.uSoft.value=j(y(g,.3,.85))*2.5,a.uDark.value=j(y(g,.2,.7))*.55,a.uFade.value=j(y(g,.56,.94));const N=2*z*Math.tan(ae.degToRad(V/2))*we;if(q.current.scale.set(N*D,N,1),++e.frames===3&&(u.ready=!0),u.f=e.frames,u.T=e.t,_.active!=="hero")return;e.px=h(e.px,P.x,2.2,o),e.py=h(e.py,P.y,2.2,o);const W=F?0:.3,Y=Math.sin(e.t*.11)*(F?.3:.2)+e.px*W,X=Math.sin(e.t*.083+1.3)*.1+e.py*W*.55,ie=z-.55*(1-G)-2.1*C;e.cam.set(Y,X-.12*C,ie),e.look.set(Y*.4,X*.4-.08*C,0);const i=m.camera;i.fov!==V&&(i.fov=V,i.updateProjectionMatrix()),i.position.x=h(i.position.x,e.cam.x,4,o),i.position.y=h(i.position.y,e.cam.y,4,o),i.position.z=h(i.position.z,e.cam.z,4,o),e.frames<3&&i.position.copy(e.cam),i.lookAt(e.look)}),E.jsx("group",{ref:b,visible:!1,children:E.jsx("mesh",{ref:q,geometry:x,frustumCulled:!1,renderOrder:-5,children:E.jsx("shaderMaterial",{uniforms:a,vertexShader:ye,fragmentShader:be})})})}export{Pe as default};
