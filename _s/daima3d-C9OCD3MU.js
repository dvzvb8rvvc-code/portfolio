import{j as t,r as s}from"./kit-DPcy7G1R.js";import{C as p,u as m,a as d}from"./react-three-fiber.esm-DLzBa5iw.js";const h=`
precision highp float;
uniform float uT; uniform vec2 uRes; uniform float uWipe; uniform float uClear; uniform vec2 uMouse; uniform float uBlade;
varying vec2 vUv;
float N21(vec2 p){p=fract(p*vec2(123.34,345.45));p+=dot(p,p+34.345);return fract(p.x*p.y);}
vec3 bokeh(vec2 uv, float blur){
  vec3 c = mix(vec3(.02,.02,.06), vec3(.06,.02,.12), uv.y);
  for(int i=0;i<3;i++){
    float fi=float(i);
    vec2 g = uv*vec2(6.+fi*3., 4.+fi*2.) + vec2(fi*7.3, uT*.02*(fi+1.));
    vec2 id=floor(g); vec2 f=fract(g)-.5;
    float n=N21(id+fi*13.);
    vec2 o=vec2(N21(id+3.1),N21(id+7.7))-.5;
    float r=.18+.22*n;
    float d=length(f-o*.6);
    float soft=mix(.02,.25,blur);
    float m=smoothstep(r,r-soft,d)*step(.45,n);
    vec3 col = n<.6? vec3(1.,.15,.55) : n<.75? vec3(.1,.9,1.) : n<.9? vec3(1.,.6,.15) : vec3(.6,.4,1.);
    c += col*m*(.35+.25*sin(uT*.8+n*20.))*(1.-fi*.25);
  }
  // street lights streaks at bottom
  c += vec3(1.,.4,.1)*smoothstep(.2,.0,abs(uv.y-.18+sin(uv.x*3.)*.02))*.25;
  return c;
}
vec2 staticDrops(vec2 uv){
  vec2 g=uv*vec2(38.,24.); vec2 id=floor(g); vec2 f=fract(g)-.5;
  float n=N21(id); vec2 p=(vec2(N21(id+1.3),N21(id+2.7))-.5)*.7;
  float r=.08+.18*fract(n*7.);
  float fade=smoothstep(0.,1.,fract(uT*.08+n));
  float d=length(f-p);
  float m=smoothstep(r,r*.4,d)*step(.35,n)*fade;
  return (f-p)*m*3.;
}
vec2 slidingDrops(vec2 uv, float scale){
  vec2 a=vec2(6.,1.)*scale; vec2 g=uv*a; g.y+=uT*.25;
  vec2 id=floor(g); float n=N21(vec2(id.x,7.));
  g.y+=n*7.; id=floor(g); n=N21(id);
  vec2 f=fract(g)-.5;
  float t=fract(uT*.18+n);
  float y=-.45+(1.-t*t)*.9; // falls with acceleration
  float x=(n-.5)*.6+sin(g.y*8.+n*6.)*.04;
  vec2 dp=(f-vec2(x,y))*vec2(1.,a.x/a.y*.25);
  float d=length(dp*vec2(1.,1.6));
  float drop=smoothstep(.09,.04,d);
  // trail
  float tr=smoothstep(.03,.0,abs(f.x-x))*smoothstep(y,y+.4,f.y)*(1.-smoothstep(y+.3,y+.9,f.y))*.35;
  vec2 tf=vec2(f.x-x, fract(f.y*8.)-.5);
  float tdrops=smoothstep(.12,.05,length(tf*vec2(1.,.5)))*smoothstep(y,y+.05,f.y)*tr*3.;
  return dp*drop*7.+tf*tdrops*.3+vec2(0.,tr*.02);
}
void main(){
  vec2 uv=vUv; float asp=uRes.x/uRes.y;
  vec2 q=vec2((uv.x-.5)*asp, uv.y);
  vec2 n=staticDrops(q)+slidingDrops(q,1.)+slidingDrops(q*1.6+.3,1.)*.7;
  // wiper sector clearing: pivot below the bottom centre
  vec2 pv=q-vec2(0.,-.15);
  float ang=atan(pv.x,pv.y);
  float arm=uWipe;
  float swept=smoothstep(arm+.05,arm-.05,ang)*uClear;
  // mouse wipes a little hole
  vec2 mq=vec2((uMouse.x-.5)*asp,uMouse.y);
  float mh=smoothstep(.16,.05,length(q-mq));
  float keep=(1.-swept)*(1.-mh*.9);
  n*=keep;
  float dropMask=clamp(length(n)*6.,0.,1.);
  vec3 col=bokeh(uv+n*.06, mix(1.,.15,dropMask));
  col+=dropMask*.04;
  // wiper blade
  float bladeD=abs(sin(ang-arm)*length(pv));
  float blade=smoothstep(.012,.0,bladeD)*step(.15,length(pv))*step(length(pv),1.25)*uBlade;
  col=mix(col,vec3(.01),blade*.95);
  col*=1.-.35*length(uv-.5);
  gl_FragColor=vec4(col,1.);
}`,g="varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }";function x({wipe:a}){const c=s.useRef(),{size:l}=m(),e=s.useMemo(()=>({uT:{value:0},uRes:{value:[1,1]},uWipe:{value:-1.3},uClear:{value:0},uMouse:{value:[-5,-5]},uBlade:{value:0}}),[]),r=s.useRef({t0:-10});return d((v,u)=>{e.uT.value+=Math.min(u,.05),e.uRes.value=[l.width,l.height],a.current&&(r.current.t0=e.uT.value,a.current=!1);const o=e.uT.value-r.current.t0;if(o<.9){const n=o/.9;e.uWipe.value=-1.3+(1-Math.cos(n*Math.PI))*1.3,e.uClear.value=1,e.uBlade.value=1}else e.uWipe.value=1.4,e.uClear.value=Math.max(0,1-(o-.9)/3),e.uBlade.value=0;const f=v.pointer.x*.5+.5,i=v.pointer.y*.5+.5;e.uMouse.value=matchMedia("(hover:hover)").matches?[f,i]:[-5,-5]}),t.jsxs("mesh",{children:[t.jsx("planeGeometry",{args:[2,2]}),t.jsx("shaderMaterial",{ref:c,uniforms:e,vertexShader:g,fragmentShader:h})]})}function M({wipe:a}){return t.jsx(p,{dpr:[1,1.25],gl:{antialias:!1},style:{position:"absolute",inset:0},children:t.jsx(x,{wipe:a})})}export{M as default};
