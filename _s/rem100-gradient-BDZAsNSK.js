import{r as x,j as w}from"./kit-CRmIips2.js";const E="attribute vec2 p; void main(){ gl_Position = vec4(p,0.,1.); }",S=`precision mediump float;
uniform vec2 uR; uniform float uT;
vec3 c1=vec3(.114,.306,.847), c2=vec3(.024,.714,.831), c3=vec3(.204,.827,.6), c4=vec3(.576,.773,.992), c5=vec3(.04,.145,.25);
float h(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
float n(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f); return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y); }
void main(){
  vec2 uv=gl_FragCoord.xy/uR; float t=uT*.06;
  vec2 q=vec2(uv.x*1.6,uv.y);
  float a=n(q*1.4+vec2(t,-t*.7)), b=n(q*2.1+vec2(-t*.8,t)+a), c=n(q*.9+vec2(t*.5,t*.3)+b*.6);
  vec3 col=mix(c1,c2,smoothstep(.2,.8,a));
  col=mix(col,c3,smoothstep(.45,.85,b));
  col=mix(col,c4,smoothstep(.55,.95,c)*.7);
  col=mix(col,c5,smoothstep(.75,1.,1.-uv.y)*.0+smoothstep(.0,.35,uv.x*.0));
  gl_FragColor=vec4(col,1.);
}`;function _({className:A=""}){const f=x.useRef(null);return x.useEffect(()=>{const o=f.current,e=o.getContext("webgl",{antialias:!1});if(!e)return;const m=(t,F)=>{const u=e.createShader(t);return e.shaderSource(u,F),e.compileShader(u),u},r=e.createProgram();e.attachShader(r,m(e.VERTEX_SHADER,E)),e.attachShader(r,m(e.FRAGMENT_SHADER,S)),e.linkProgram(r),e.useProgram(r),e.bindBuffer(e.ARRAY_BUFFER,e.createBuffer()),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW);const l=e.getAttribLocation(r,"p");e.enableVertexAttribArray(l),e.vertexAttribPointer(l,2,e.FLOAT,!1,0,0);const R=e.getUniformLocation(r,"uR"),g=e.getUniformLocation(r,"uT"),v=matchMedia("(prefers-reduced-motion: reduce)").matches;let c,i=!0,n=0,a=0;const h=()=>{const t=o.getBoundingClientRect();n=Math.max(1,Math.round(t.width*.5)),a=Math.max(1,Math.round(t.height*.5)),o.width=n,o.height=a,e.viewport(0,0,n,a)};h();const d=new ResizeObserver(h);d.observe(o);const p=new IntersectionObserver(([t])=>{i=t.isIntersecting,i&&!c&&(c=requestAnimationFrame(s))});p.observe(o);const b=performance.now();function s(t){c=0,e.uniform2f(R,n,a),e.uniform1f(g,v?20:(t-b)/1e3+20),e.drawArrays(e.TRIANGLES,0,3),i&&!v&&(c=requestAnimationFrame(s))}return c=requestAnimationFrame(s),()=>{cancelAnimationFrame(c),d.disconnect(),p.disconnect()}},[]),w.jsx("canvas",{ref:f,"aria-hidden":"true",className:"block h-full w-full "+A})}export{_ as default};
