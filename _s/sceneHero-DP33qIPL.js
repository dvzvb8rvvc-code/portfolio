import{r as M,j as Z}from"./kit-D8JZ_7uo.js";import{a as be,y as Ce,aI as Be,S as De,f as Ae,P as ve,V as ke,ar as me,x as pe,u as Se,a0 as we}from"./react-three-fiber.esm-CpCVEERV.js";import{s as I}from"./yts-Dx2Uh5WU.js";import"./preload-helper-BDQy5SUP.js";import"./index-DgIAGOya.js";const k=[5,103,111,84],ee={111:[[.52,.5],[.57,.5]],5:[[.5,.56],[.47,.5]],103:[[.6,.5],[.79,.5]],84:[[.5,.5],[.55,.5]]},de={111:1800/1125,5:1440/1800,103:1800/1519,84:1800/900},Te=t=>`/portfolio/yts/img/${t}.webp`,Pe=t=>`/portfolio/yts/depth/${t}.webp`,p=6.4,_=2.6,te=5,Re=1.16,oe=40,ye=`
float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
  return mix(mix(h21(i), h21(i+vec2(1.,0.)), f.x), mix(h21(i+vec2(0.,1.)), h21(i+vec2(1.,1.)), f.x), f.y); }
float fbm(vec2 p){ float a = .5, s = 0.; for(int i = 0; i < 4; i++){ s += a * vn(p); p = p * 2.03 + 17.1; a *= .5; } return s / .9375; }
vec2 cover(vec2 uv, vec4 c){ return uv * c.xy + c.zw; }`,Ee=`
uniform sampler2D uDA, uDB; uniform vec4 uCA, uCB; uniform float uMix, uAmt, uTime, uPlane, uCard;
varying vec2 vUv; varying float vD;
${ye}
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
  float rim = smoothstep(0., .09, min(min(uv.x, 1. - uv.x), min(uv.y, 1. - uv.y)));
  p.z += (d * uAmt + band * .07) * mix(1., rim, uCard);   // card edges stay straight while it lands
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.);
}`,Fe=`
uniform sampler2D uA, uB, uDB; uniform vec4 uCA, uCB;
uniform float uMix, uTime, uPlane, uSweep, uDark, uCard, uSoft, uMobile;
uniform vec2 uRes;
varying vec2 vUv; varying float vD;
${ye}
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
  c += c * vec3(1., .86, .66) * sw * .28 * (1. - uCard);
  c = grade(c);
  // legibility + cinema: bottom/left gradients, top for the nav, vignette
  // (screen-space while full-bleed, they release as the film becomes a card)
  vec2 s = gl_FragCoord.xy / uRes;
  float sc = 1. - uCard;
  c *= 1. - .66 * (1. - smoothstep(0., .6, s.y)) * sc;
  c *= 1. - .4 * (1. - smoothstep(0., .62, s.x)) * (1. - smoothstep(.2, .9, s.y)) * (1. - uMobile) * sc;
  c *= 1. - .4 * smoothstep(.8, 1., s.y) * sc;
  c *= mix(1., 1. - smoothstep(.3, 1.2, length((s - .5) * vec2(1.1, 1.))), .6 * sc);
  c *= 1. - uDark;
  // film grain (fine, animated) — settles to still as the card lands (the page grain takes over)
  float g = h21(gl_FragCoord.xy + fract(uTime * 7.31) * 113.) - .5;
  c += g * .028 * (.35 + sqrt(max(c.g, 0.))) * sc;
  gl_FragColor = vec4(max(c, 0.), 1.);
  #include <colorspace_fragment>
}`,S=(t,i=0,v=1)=>Math.min(v,Math.max(i,t)),q=(t,i,v)=>S((t-i)/(v-i)),he=t=>t*t*(3-2*t),H=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2,D=we.damp,L={x:0,y:0};let xe=!1;function ze(){xe||typeof window>"u"||(xe=!0,window.addEventListener("pointermove",t=>{t.pointerType!=="touch"&&(L.x=t.clientX/innerWidth*2-1,L.y=-(t.clientY/innerHeight*2-1))},{passive:!0}))}function ge(t,i,v,b,m,g=0){let r=1,u=1;v>i?u=i/v:r=v/i,r/=b,u/=b;const A=S(m[0],r/2,1-r/2),o=S(m[1],u/2,1-u/2);let d=A-r/2,w=o-u/2;return d+=(m[0]*(1-r)-d)*g,w+=(m[1]*(1-u)-w)*g,t.set(r,u,d,w)}const Ve=t=>`${(t[0]*100).toFixed(2)}% ${((1-t[1])*100).toFixed(2)}%`,n=I.hero=I.hero||{i:0,k:0,ready:!1,go:-1,f:0};typeof window<"u"&&(window.__ytsHero=n);function Le({track:t}){const{size:i,gl:v}=be(),b=i.width<i.height,m=i.width<=768,g=Ce(Be,[...k.map(Te),...k.map(Pe)]),r=g.slice(0,4),u=g.slice(4);M.useMemo(()=>{const y=Math.min(4,v.capabilities.getMaxAnisotropy());r.forEach(a=>{a.colorSpace=De,a.anisotropy=y}),u.forEach(a=>{a.generateMipmaps=!1,a.minFilter=Ae})},[g]);const A=M.useMemo(()=>{const y=m?128:256,a=m?72:144;return b?new ve(1,1,a,y):new ve(1,1,y,a)},[b,m]);M.useEffect(()=>(ze(),()=>A.dispose()),[A]);const o=M.useMemo(()=>({uA:{value:r[0]},uB:{value:r[1]},uDA:{value:u[0]},uDB:{value:u[1]},uCA:{value:new me(1,1,0,0)},uCB:{value:new me(1,1,0,0)},uMix:{value:0},uAmt:{value:.2},uTime:{value:0},uPlane:{value:1.6},uSweep:{value:-1},uDark:{value:0},uCard:{value:0},uSoft:{value:0},uMobile:{value:m?1:0},uRes:{value:new ke(1,1)}}),[g]),d=M.useRef(),w=M.useRef(),Me=M.useRef({t:0,c:0,cur:0,next:1,ps:0,lastP:0,lastMove:-9,frames:0,cam:new pe(0,0,te),look:new pe,px:0,py:0});return Se((y,a)=>{const T=t.current,e=Me.current;if(!d.current)return;if(!T.on){d.current.visible=!1;return}d.current.visible=!0,a=n.fixed||Math.min(a,1/20),e.t+=a;const $=e.t,P=i.width,C=i.height,O=P/C,R=P<=768;Math.abs(T.p-e.lastP)>1e-4&&(e.lastMove=$),e.lastP=T.p,e.ps=D(e.ps,T.p,4.5,a);const G=e.ps,E=p-_,N=e.c>=E;n.go>=0&&!N?(n.go!==e.cur&&(e.next=n.go,e.c=E),n.go=-1):n.go>=0&&N&&(n.go=-1),!N&&($-e.lastMove<1.4||G>.03||document.hidden)||(e.c+=a),e.c>=p&&(e.c-=p,e.cur=e.next,e.next=(e.cur+1)%k.length);const F=H(q(e.c,E,p)),z=e.c+_/2;n.i=z>=p?e.next:e.cur,n.k=(z>=p?z-p:z)/p;const W=k[e.cur],Y=k[e.next];o.uA.value=r[e.cur],o.uB.value=r[e.next],o.uDA.value=u[e.cur],o.uDB.value=u[e.next];let s=0,l=null;const ae=I.els.hero,se=n.cardEl;if(ae&&se){const f=-ae.getBoundingClientRect().top/C;l=se.getBoundingClientRect();const B=Math.max(R?84:104,(C-l.height)/2),h=f+(l.top-B)/C,x=Math.min(.2,h-.35);s=H(S((f-x)/Math.max(.25,h-x))),l.width<2&&(s=0,l=null)}l||(s=0);const K=he(q(s,.55,1));o.uCard.value=s,o.uMix.value=F,o.uTime.value=e.t,o.uMobile.value=R?1:0,o.uSweep.value=e.t*.075%1.9-.45,y.gl.getDrawingBufferSize(o.uRes.value);const ne=H(S(($-.1)/3.6)),V=H(q(G,0,.7));o.uAmt.value=(.22+.43*ne)*(1+.9*V)*Math.pow(1-s,1.6),o.uSoft.value=Math.sin(Math.PI*s)*1.5,o.uDark.value=he(q(G,.12,.7))*.5*(1-K);const c=y.camera;if(I.active==="hero"){e.px=D(e.px,L.x,2.2,a),e.py=D(e.py,L.y,2.2,a);const f=1-s,B=R?0:.3,h=(Math.sin(e.t*.11)*(R?.3:.2)+e.px*B)*f,x=(Math.sin(e.t*.083+1.3)*.1+e.py*B*.55-.12*V)*f,Q=te-.55*(1-ne)-1.5*V*f;e.cam.set(h,x,Q),e.look.set(h*.4*f+h*s,(x*.4-.06*V)*f+x*s,0),c.fov!==oe&&(c.fov=oe,c.updateProjectionMatrix()),c.position.x=D(c.position.x,e.cam.x,4,a),c.position.y=D(c.position.y,e.cam.y,4,a),c.position.z=D(c.position.z,e.cam.z,4,a),e.frames<3&&c.position.copy(e.cam),c.lookAt(e.look)}const ie=Math.tan(we.degToRad(oe/2)),ce=2*te*ie*Re;let j=ce*O,U=ce,re=0,ue=0;if(l&&s>0){const f=2*Math.max(.5,c.position.z)*ie,B=l.width/P*f*O,h=l.height/C*f,x=c.position.x+((l.left+l.width/2)/P-.5)*f*O,Q=c.position.y-((l.top+l.height/2)/C-.5)*f;j+=(B-j)*s,U+=(h-U)*s,re=x*s,ue=Q*s}w.current.scale.set(j,U,1),w.current.position.set(re,ue,0);const X=j/U;o.uPlane.value=X;const le=p+_,J=b?1:0;ge(o.uCA.value,de[W],X,1+.085*(e.c+_)/le*(1-s),ee[W][J],K),ge(o.uCB.value,de[Y],X,1+.085*Math.max(0,e.c-E)/le*(1-s),ee[Y][J],K);const fe=F>.5?Y:W;n.cardK=s,n.cardId=fe,n.cardPos=Ve(ee[fe][J]),n.landed=s>.995&&(F<.002||F>.998),++e.frames===3&&(n.ready=!0),n.f=e.frames,n.T=e.t}),Z.jsx("group",{ref:d,visible:!1,children:Z.jsx("mesh",{ref:w,geometry:A,frustumCulled:!1,renderOrder:-5,children:Z.jsx("shaderMaterial",{uniforms:o,vertexShader:Ee,fragmentShader:Fe})})})}export{Le as default,Ve as focusCss};
