import React, { useEffect, useRef, useState, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, useScroll, useTransform, useSpring, useInView, AnimatePresence, MotionConfig } from 'framer-motion'
import { ArrowRight, ArrowLeft, ChevronRight, Phone, Check, Camera, MapPin } from 'lucide-react'
import '../lib/base.css'
import { useSmooth, Ribbon, LineReveal, Reveal, useBooking, phoneFocus, CheckDraw, MapFrame, CallBar, tel, useLite } from '../lib/kit'

const Film3D = lazy(() => import('./bungalo3d'))

const b = {
  name: 'Бунгало', addr: 'Долгиновский тракт, 150, корп. 1', city: 'Минск',
  phone: '+375 29 634-34-18', viber: 'viber://chat?number=%2B375296343418',
  rating: '4,6', rev: 155, oid: '1086039074',
}
const NAVY = '#0a2540', BG = '#f6f9fc', ACC = '#ff5a1f', SLATE = '#425466'
const MONO = "font-['JetBrains_Mono',monospace]"
const PAINTS = [['Красный', '#d7261e'], ['Синий металлик', '#1f4fd1'], ['Белый перламутр', '#e9ecef'], ['Графит', '#3a3f47'], ['Оранжевый', '#ff6a1a']]

/* ---------- WebGL mesh gradient made of paint colours ---------- */
const FS = `precision mediump float;
uniform vec2 r; uniform float t; uniform vec2 m;
vec3 c1=vec3(1.0,.35,.12), c2=vec3(1.0,.72,.15), c3=vec3(.85,.12,.45), c4=vec3(.15,.32,.95), c5=vec3(.0,.78,.72);
void main(){
  vec2 uv=gl_FragCoord.xy/r; vec2 p=uv; p.x*=r.x/r.y;
  float T=t*.08;
  vec2 q=p+.25*vec2(sin(p.y*2.3+T*3.),cos(p.x*1.7-T*2.));
  q+=.15*vec2(sin(q.y*3.1-T*4.),cos(q.x*2.9+T*3.))+m*.08;
  float a=.5+.5*sin(q.x*1.6+T*2.), bb=.5+.5*sin(q.y*2.1-T*1.5+1.), cc=.5+.5*sin((q.x+q.y)*1.3+T);
  vec3 col=mix(c4,c3,a); col=mix(col,c1,bb*.85); col=mix(col,c2,smoothstep(.55,1.,cc)*.8); col=mix(col,c5,smoothstep(.65,1.,1.-a)*smoothstep(.4,1.,1.-bb));
  gl_FragColor=vec4(col,1.);
}`
function MeshGradient({ className = '' }) {
  const ref = useRef(null)
  useEffect(() => {
    const c = ref.current, gl = c.getContext('webgl', { antialias: false, premultipliedAlpha: false })
    if (!gl) return
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s }
    const pr = gl.createProgram()
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}')); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS))
    gl.linkProgram(pr); gl.useProgram(pr)
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    const uR = gl.getUniformLocation(pr, 'r'), uT = gl.getUniformLocation(pr, 't'), uM = gl.getUniformLocation(pr, 'm')
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    let id, on = true, mx = 0, my = 0, tx = 0, ty = 0
    const size = () => { const d = Math.min(devicePixelRatio, 1) * 0.6; c.width = c.clientWidth * d; c.height = c.clientHeight * d; gl.viewport(0, 0, c.width, c.height) }
    size(); addEventListener('resize', size)
    const mv = e => { tx = e.clientX / innerWidth - 0.5; ty = e.clientY / innerHeight - 0.5 }
    addEventListener('pointermove', mv)
    const t0 = performance.now()
    const draw = () => {
      mx += (tx - mx) * 0.04; my += (ty - my) * 0.04
      gl.uniform2f(uR, c.width, c.height); gl.uniform1f(uT, (performance.now() - t0) / 1000 + 20); gl.uniform2f(uM, mx, -my)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      if (on && !reduce) id = requestAnimationFrame(draw)
    }
    const io = new IntersectionObserver(([e]) => { on = e.isIntersecting; cancelAnimationFrame(id); if (on) id = requestAnimationFrame(draw) })
    io.observe(c); draw()
    return () => { cancelAnimationFrame(id); io.disconnect(); removeEventListener('resize', size); removeEventListener('pointermove', mv) }
  }, [])
  return <canvas ref={ref} aria-hidden="true" className={'h-full w-full ' + className} />
}

/* ---------- header ---------- */
function Header() {
  return (
    <header className="absolute inset-x-0 top-0 z-40">
      <div className="mx-auto flex h-16 max-w-[1180px] items-center justify-between px-5">
        <a href="#top" className="flex items-center gap-2 text-[19px] font-bold tracking-[-.03em] text-white"><span className="grid h-7 w-7 place-items-center rounded-[8px] bg-white/25 backdrop-blur"><span className="h-3 w-3 rounded-full bg-white" /></span>Бунгало</a>
        <nav className="hidden items-center gap-8 text-[14.5px] font-medium text-white/90 md:flex">
          <a href="#process" className="hover:text-white">Процесс</a><a href="#estimate" className="hover:text-white">Оценка по фото</a><a href="#services" className="hover:text-white">Услуги</a><a href="#contact" className="hover:text-white">Контакты</a>
        </nav>
        <a href="#book" className="inline-flex h-9 items-center gap-1 rounded-full bg-white/20 px-4 text-[14px] font-semibold text-white backdrop-blur hover:bg-white/30">Записаться <ChevronRight size={16} /></a>
      </div>
    </header>
  )
}

/* ---------- hero ---------- */
function HeroCard() {
  const [i, setI] = useState(0)
  useEffect(() => { const t = setInterval(() => setI(v => (v + 1) % 4), 1800); return () => clearInterval(t) }, [])
  const rows = ['Осмотр и дефектовка', 'Кузовные работы', 'Подбор оттенка', 'Покраска и лак']
  return (
    <motion.div initial={{ opacity: 0, y: 30, rotate: -2 }} animate={{ opacity: 1, y: 0, rotate: -2 }} transition={{ delay: 0.5, duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className="w-[300px] rounded-[14px] border border-black/5 bg-white p-5 shadow-[0_50px_100px_-20px_rgba(50,50,93,.25),0_30px_60px_-30px_rgba(0,0,0,.3)]">
      <div className="flex items-center justify-between"><span className={`${MONO} text-[11px] text-[#8792a2]`}>job / front-door-L</span><span className="rounded-full bg-[#e3fcef] px-2 py-0.5 text-[11px] font-semibold text-[#0e6245]">в работе</span></div>
      <ul className="mt-4 grid gap-2.5">
        {rows.map((r, k) => (
          <li key={r} className="flex items-center gap-3 text-[14px]">
            <span className={'grid h-5 w-5 place-items-center rounded-full transition-colors duration-500 ' + (k <= i ? 'bg-[#ff5a1f] text-white' : 'border border-black/15')}>{k <= i && <Check size={12} strokeWidth={3} />}</span>
            <span className={k <= i ? 'text-[#0a2540]' : 'text-[#8792a2]'}>{r}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#eef2f7]"><motion.div className="h-full rounded-full bg-gradient-to-r from-[#ff5a1f] to-[#ffb21e]" animate={{ width: `${(i + 1) * 25}%` }} transition={{ duration: 0.6 }} /></div>
    </motion.div>
  )
}
function Hero({ lite }) {
  return (
    <section id="top" className="relative overflow-hidden" style={{ background: BG }}>
      <Header />
      <div className="absolute inset-x-0 top-0 h-[78%] origin-top-left -skew-y-6 overflow-hidden md:h-[88%]">
        {lite ? <div className="h-full w-full bg-[radial-gradient(at_20%_30%,#ff5a1f,transparent_50%),radial-gradient(at_70%_20%,#2650f2,transparent_50%),radial-gradient(at_60%_80%,#d61f6f,transparent_50%),#ffb21e]" /> : <MeshGradient />}
      </div>
      <div className="relative mx-auto grid max-w-[1180px] gap-12 px-5 pb-24 pt-32 md:grid-cols-[1.3fr_1fr] md:pb-36 md:pt-40">
        <div>
          <h1 className="text-[clamp(46px,7.4vw,96px)] font-bold leading-[.98] tracking-[-.045em] text-[#0a2540]">
            <span className="sr-only">Бунгало — кузовной ремонт и покраска</span>
            <span aria-hidden="true"><LineReveal delay={0.1}>Цвет</LineReveal><LineReveal delay={0.2}>в цвет.</LineReveal><LineReveal delay={0.3}>Панель</LineReveal><LineReveal delay={0.4}>к панели.</LineReveal></span>
          </h1>
          <Reveal delay={0.6} className="mt-7 max-w-[470px] text-[18px] leading-relaxed text-[#0a2540]/80 md:text-[20px]">Кузовной ремонт и покраска автомобилей в Минске. Выравниваем, грунтуем, подбираем оттенок и красим так, чтобы ремонт не читался.</Reveal>
          <Reveal delay={0.75} className="mt-9 flex flex-wrap items-center gap-4">
            <a href="#estimate" className="inline-flex h-11 items-center gap-1.5 rounded-full px-5 text-[15px] font-semibold text-white shadow-[0_8px_20px_-6px_rgba(10,37,64,.5)]" style={{ background: NAVY }}>Оценить по фото <ChevronRight size={17} /></a>
            <a href={'tel:' + tel(b.phone)} className="inline-flex h-11 items-center gap-2 text-[15px] font-semibold text-[#0a2540]"><Phone size={15} />{b.phone}</a>
          </Reveal>
        </div>
        <div className="relative hidden items-center justify-center md:flex">
          <HeroCard />
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8, duration: 1 }} className="absolute -bottom-10 right-0 rounded-[12px] border border-black/5 bg-white px-4 py-3 shadow-[0_30px_60px_-20px_rgba(50,50,93,.3)]">
            <p className={`${MONO} text-[11px] text-[#8792a2]`}>yandex.rating</p>
            <p className="text-[26px] font-bold tracking-[-.03em] text-[#0a2540]">{b.rating} <span className="text-[14px] font-medium text-[#8792a2]">· {b.rev} оценок</span></p>
          </motion.div>
        </div>
        <div className="flex items-center gap-3 md:hidden"><span className="rounded-full bg-white px-3 py-1.5 text-[14px] font-semibold text-[#0a2540] shadow">{b.rating} · {b.rev} оценок на Яндекс Картах</span></div>
      </div>
    </section>
  )
}

/* ---------- pinned film ---------- */
const STAGES = [
  { k: 'dent', t: 'Вмятина', d: 'Фиксируем повреждение и оцениваем, что можно вытянуть, а что — выправить.', r: [0, 0.01, 0.17, 0.2] },
  { k: 'level', t: 'Выравнивание', d: 'Возвращаем геометрию панели, выводим плоскость шпатлёвкой и шлифуем.', r: [0.2, 0.24, 0.36, 0.4] },
  { k: 'primer', t: 'Грунт', d: 'Изолирующий слой: ровная база под краску и защита металла.', r: [0.4, 0.44, 0.54, 0.58] },
  { k: 'paint', t: 'Покраска', d: 'Подбираем оттенок под ваш автомобиль и наносим базу в несколько проходов.', r: [0.58, 0.62, 0.72, 0.76] },
  { k: 'clear', t: 'Лак', d: 'Глубина и блеск. Свет течёт по панели так же, как по соседним.', r: [0.76, 0.8, 1.1, 1.2] },
]
function StageRow({ p, s, i }) {
  const on = useTransform(p, [s.r[0], s.r[1]], [0, 1])
  const bg = useTransform(on, v => `rgba(255,90,31,${v})`)
  const op = useTransform(on, [0, 1], [0.45, 1])
  return (
    <motion.li style={{ opacity: op }} className="flex items-center gap-3 py-2">
      <motion.span style={{ background: bg }} className="grid h-6 w-6 place-items-center rounded-full border border-black/10 text-white"><Check size={13} strokeWidth={3} /></motion.span>
      <span className={`${MONO} text-[11px] text-[#8792a2]`}>0{i + 1}</span>
      <span className="text-[15px] font-semibold text-[#0a2540]">{s.t}</span>
    </motion.li>
  )
}
function StageCaption({ p, s }) {
  const [a, b2, c, d] = s.r
  const o = useTransform(p, [a, b2, c, d], [a === 0 ? 1 : 0, 1, 1, 0])
  const y = useTransform(p, [a, b2], [a === 0 ? 0 : 16, 0])
  return (
    <motion.div style={{ opacity: o, y }} className="absolute inset-0">
      <p className={`${MONO} text-[12px] text-[#ff5a1f]`}>stage: "{s.k}"</p>
      <h3 className="mt-2 text-[clamp(32px,4vw,52px)] font-bold leading-[1] tracking-[-.04em] text-[#0a2540]">{s.t}</h3>
      <p className="mt-3 max-w-[380px] text-[16px] leading-relaxed text-[#425466]">{s.d}</p>
    </motion.div>
  )
}
function LitePanel({ p, color }) {
  const bg = useTransform(p, [0, 0.3, 0.45, 0.6, 0.75], ['#8a2a22', '#a7a9ab', '#8d9496', '#8d9496', color])
  return <motion.div style={{ background: bg }} className="absolute right-[6%] top-[22%] h-[44%] w-[min(560px,86vw)] rounded-[24px] shadow-[0_40px_80px_-30px_rgba(10,37,64,.5)] max-md:left-1/2 max-md:top-[12%] max-md:-translate-x-1/2" />
}
function Film({ lite }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.6 })
  const near = useInView(ref, { margin: '200px 0px 200px 0px' })
  const [paint, setPaint] = useState(PAINTS[0][1])
  const bar = useTransform(p, [0, 1], ['0%', '100%'])
  return (
    <section ref={ref} id="process" className="relative h-[560vh]" style={{ background: BG }}>
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(#e6ebf1_1px,transparent_1px),linear-gradient(90deg,#e6ebf1_1px,transparent_1px)] bg-[size:48px_48px] opacity-60" />
        <div className="absolute inset-0">{!lite ? (near && <Suspense fallback={null}><Film3D progress={p} active={near} color={paint} /></Suspense>) : <LitePanel p={p} color={paint} />}</div>
        <div className="relative mx-auto flex h-full max-w-[1180px] flex-col justify-end px-5 pb-[calc(92px+env(safe-area-inset-bottom))] pt-20 md:justify-center md:pb-10">
          <div className="w-full rounded-[14px] border border-[#e6ebf1] bg-white/90 p-5 shadow-[0_30px_60px_-20px_rgba(50,50,93,.18)] backdrop-blur md:w-[400px] md:p-6">
            <div className="flex items-center justify-between"><span className={`${MONO} text-[11px] text-[#8792a2]`}>repair.pipeline</span><span className="h-1.5 w-24 overflow-hidden rounded-full bg-[#eef2f7]"><motion.span style={{ width: bar }} className="block h-full bg-[#ff5a1f]" /></span></div>
            <div className="relative mt-4 h-[150px] md:h-[170px]">{STAGES.map(s => <StageCaption key={s.k} p={p} s={s} />)}</div>
            <ul className="hidden border-t border-[#e6ebf1] pt-2 md:block">{STAGES.map((s, i) => <StageRow key={s.k} p={p} s={s} i={i} />)}</ul>
            <div className="mt-3 border-t border-[#e6ebf1] pt-4">
              <p className={`${MONO} text-[11px] text-[#8792a2]`}>colour = </p>
              <div className="mt-2 flex gap-2">{PAINTS.map(([t, c]) => <button key={c} aria-label={t} title={t} onClick={() => setPaint(c)} className={'h-8 w-8 rounded-full border border-black/10 transition-transform ' + (paint === c ? 'scale-110 ring-2 ring-[#0a2540] ring-offset-2' : 'hover:scale-105')} style={{ background: c }} />)}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- value interaction: estimate by photo ---------- */
const ZONES = [
  { k: 'fb', t: 'Передний бампер', d: 'M60 18 Q100 2 140 18 L144 44 L56 44 Z' },
  { k: 'hood', t: 'Капот', d: 'M58 48 L142 48 L138 120 L62 120 Z' },
  { k: 'flf', t: 'Крыло переднее левое', d: 'M36 50 L54 48 L58 122 L34 122 Q28 86 36 50 Z' },
  { k: 'frf', t: 'Крыло переднее правое', d: 'M164 50 L146 48 L142 122 L166 122 Q172 86 164 50 Z' },
  { k: 'roof', t: 'Крыша', d: 'M66 160 L134 160 L134 250 L66 250 Z' },
  { k: 'dfl', t: 'Дверь передняя левая', d: 'M34 126 L58 126 L60 196 L32 196 Z' },
  { k: 'dfr', t: 'Дверь передняя правая', d: 'M166 126 L142 126 L140 196 L168 196 Z' },
  { k: 'drl', t: 'Дверь задняя левая', d: 'M32 200 L60 200 L60 262 L34 262 Z' },
  { k: 'drr', t: 'Дверь задняя правая', d: 'M168 200 L140 200 L140 262 L166 262 Z' },
  { k: 'qrl', t: 'Крыло заднее левое', d: 'M34 266 L60 266 L62 320 L40 320 Q30 296 34 266 Z' },
  { k: 'qrr', t: 'Крыло заднее правое', d: 'M166 266 L140 266 L138 320 L160 320 Q170 296 166 266 Z' },
  { k: 'trunk', t: 'Крышка багажника', d: 'M66 286 L134 286 L136 330 L64 330 Z' },
  { k: 'rb', t: 'Задний бампер', d: 'M56 336 L144 336 L140 356 Q100 368 60 356 Z' },
]
const DMG = [['scratch', 'Царапина'], ['dent', 'Вмятина'], ['chip', 'Скол']]
function CarMap({ sel, toggle }) {
  return (
    <svg viewBox="0 0 200 372" className="mx-auto h-[420px] w-auto md:h-[480px]" role="group" aria-label="Схема автомобиля, вид сверху">
      <path d="M100 4 Q150 6 162 40 Q178 90 172 190 Q176 300 160 336 Q140 366 100 368 Q60 366 40 336 Q24 300 28 190 Q22 90 38 40 Q50 6 100 4 Z" fill="#fff" stroke="#c1c9d2" strokeWidth="1.5" />
      <path d="M64 124 Q100 112 136 124 L134 158 L66 158 Z" fill="#dfe6ee" /><path d="M66 252 L134 252 L132 282 Q100 290 68 282 Z" fill="#dfe6ee" />
      {ZONES.map(z => {
        const on = sel.includes(z.k)
        return (
          <path key={z.k} d={z.d} role="button" tabIndex={0} aria-pressed={on} aria-label={z.t}
            onClick={() => toggle(z.k)} onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), toggle(z.k))}
            className="cursor-pointer outline-none transition-all duration-300 focus-visible:stroke-[#0a2540]"
            fill={on ? ACC : '#f6f9fc'} fillOpacity={on ? 0.9 : 1} stroke={on ? '#c2410c' : '#c1c9d2'} strokeWidth="1.2">
            <title>{z.t}</title>
          </path>
        )
      })}
    </svg>
  )
}
function Estimate() {
  const [sel, setSel] = useState(['dfl'])
  const [dmg, setDmg] = useState('dent')
  const toggle = k => setSel(s => s.includes(k) ? s.filter(x => x !== k) : [...s, k])
  const ready = sel.length > 0 && dmg
  const id = 'BG-' + String(1000 + ((sel.join('').length * 37 + sel.length * 101 + (dmg ? dmg.length * 13 : 0)) % 9000)).padStart(4, '0')
  const names = ZONES.filter(z => sel.includes(z.k)).map(z => z.t)
  const dName = DMG.find(d => d[0] === dmg)?.[1]
  const book = () => { window.dispatchEvent(new CustomEvent('bg-svc', { detail: `Осмотр: ${dName?.toLowerCase()} — ${names.join(', ').toLowerCase()}` })); const el = document.getElementById('book'); window.__lenis ? window.__lenis.scrollTo(el, { offset: -40 }) : el.scrollIntoView() }
  return (
    <section id="estimate" className="relative bg-white px-5 py-28 md:py-36" style={{ clipPath: 'polygon(0 4vw, 100% 0, 100% 100%, 0 100%)' }}>
      <div className="mx-auto max-w-[1180px]">
        <p className="text-[15px] font-semibold" style={{ color: ACC }}>Оценка по фото</p>
        <h2 className="mt-3 max-w-[760px] text-[clamp(34px,4.8vw,58px)] font-bold leading-[1.04] tracking-[-.04em] text-[#0a2540]">Отметьте повреждение — мы скажем, что нужно прислать.</h2>
        <p className="mt-4 max-w-[560px] text-[18px] text-[#425466]">Выберите зоны на схеме и тип повреждения. Получится заявка, с которой мастер сможет оценить работу по фотографиям.</p>
        <div className="mt-14 grid items-start gap-8 lg:grid-cols-[1fr_1fr_1.1fr]">
          <div className="rounded-[14px] border border-[#e6ebf1] bg-[#f6f9fc] p-5">
            <p className={`${MONO} text-[11px] text-[#8792a2]`}>1 · zones[{sel.length}]</p>
            <CarMap sel={sel} toggle={toggle} />
          </div>
          <div className="grid gap-6">
            <div className="rounded-[14px] border border-[#e6ebf1] p-5">
              <p className={`${MONO} text-[11px] text-[#8792a2]`}>2 · damage.type</p>
              <div className="mt-4 grid gap-2">
                {DMG.map(([k, t]) => (
                  <button key={k} onClick={() => setDmg(k)} aria-pressed={dmg === k} className={'flex h-12 items-center justify-between rounded-[10px] border px-4 text-[15px] font-semibold transition-colors ' + (dmg === k ? 'border-[#0a2540] bg-[#0a2540] text-white' : 'border-[#e6ebf1] text-[#0a2540] hover:border-[#c1c9d2]')}>
                    {t}{dmg === k && <Check size={16} />}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-[14px] border border-[#e6ebf1] p-5">
              <p className={`${MONO} text-[11px] text-[#8792a2]`}>selected</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <AnimatePresence>{names.length ? names.map(n => <motion.span key={n} layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="rounded-full bg-[#fff1eb] px-2.5 py-1 text-[12.5px] font-medium text-[#c2410c]">{n}</motion.span>) : <span className="text-[14px] text-[#8792a2]">Нажмите на деталь на схеме</span>}</AnimatePresence>
              </div>
            </div>
          </div>
          <motion.div layout className="relative overflow-hidden rounded-[16px] bg-white p-6 shadow-[0_50px_100px_-20px_rgba(50,50,93,.25),0_30px_60px_-30px_rgba(0,0,0,.3)] ring-1 ring-black/5">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#ff5a1f] via-[#d61f6f] to-[#2650f2]" />
            <div className="flex items-center justify-between">
              <p className={`${MONO} text-[12px] text-[#8792a2]`}>{id}</p>
              <motion.span key={String(ready)} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={'rounded-full px-2.5 py-0.5 text-[12px] font-semibold ' + (ready ? 'bg-[#e3fcef] text-[#0e6245]' : 'bg-[#eef2f7] text-[#697386]')}>{ready ? 'готова к отправке' : 'черновик'}</motion.span>
            </div>
            <h3 className="mt-4 text-[24px] font-bold tracking-[-.03em] text-[#0a2540]">Заявка на оценку</h3>
            <dl className="mt-4 grid gap-2 border-y border-[#e6ebf1] py-4 text-[14px]">
              <div className="flex justify-between gap-4"><dt className="text-[#8792a2]">Повреждение</dt><dd className="font-semibold text-[#0a2540]">{dName || '—'}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-[#8792a2]">Детали</dt><dd className="text-right font-semibold text-[#0a2540]">{sel.length ? `${sel.length} шт.` : '—'}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-[#8792a2]">Стоимость</dt><dd className="text-right text-[#425466]">после фото</dd></div>
            </dl>
            <p className={`${MONO} mt-4 text-[11px] text-[#8792a2]`}>next: прислать 3 фото</p>
            <ul className="mt-2 grid gap-2 text-[14px] text-[#425466]">
              {['Общий план — вся деталь целиком', 'Под углом 45°, чтобы был виден блик', dmg === 'chip' ? 'Крупно, с монетой рядом для масштаба' : 'Крупно, с расстояния 30–40 см'].map(t => <li key={t} className="flex gap-2"><Camera size={15} className="mt-0.5 shrink-0 text-[#ff5a1f]" />{t}</li>)}
            </ul>
            <div className="mt-6 grid gap-2">
              <a href={b.viber} className={'inline-flex h-12 items-center justify-center gap-2 rounded-full text-[15px] font-semibold text-white transition-opacity ' + (ready ? '' : 'pointer-events-none opacity-40')} style={{ background: '#7360f2' }} aria-disabled={!ready}>Прислать фото в Viber</a>
              <button onClick={book} disabled={!ready} className="inline-flex h-12 items-center justify-center gap-1 rounded-full border border-[#e6ebf1] text-[15px] font-semibold text-[#0a2540] hover:border-[#c1c9d2] disabled:opacity-40">Записаться на осмотр <ChevronRight size={16} /></button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ---------- services grid ---------- */
const SVC = [
  ['body', 'Кузовной ремонт', 'Рихтовка, вытяжка, замена и подгонка деталей.'],
  ['panel', 'Покраска элемента', 'Одна деталь — без перекраса соседних, если это возможно.'],
  ['spot', 'Локальная покраска', 'Небольшие повреждения — с переходом по лаку.'],
  ['match', 'Подбор цвета', 'Оттенок под ваш автомобиль: по коду и тест-напылам.'],
  ['bumper', 'Ремонт бамперов', 'Трещины, сломанные крепления, царапины на пластике.'],
  ['polish', 'Полировка', 'Финишная полировка после покраски и восстановительная.'],
]
function Services() {
  return (
    <section id="services" className="px-5 py-24 md:py-32" style={{ background: BG }}>
      <div className="mx-auto max-w-[1180px]">
        <p className="text-[15px] font-semibold" style={{ color: ACC }}>Услуги</p>
        <h2 className="mt-3 max-w-[640px] text-[clamp(32px,4.4vw,52px)] font-bold leading-[1.05] tracking-[-.04em] text-[#0a2540]">Всё, что нужно кузову после неудачного дня.</h2>
        <div className="mt-12 grid overflow-hidden rounded-[14px] border border-[#e6ebf1] bg-white sm:grid-cols-2 lg:grid-cols-3">
          {SVC.map(([k, t, d], i) => (
            <Reveal key={k} delay={i * 0.04} className="group relative border-b border-r border-[#e6ebf1] p-7 transition-colors hover:bg-[#fbfcfe]">
              <p className={`${MONO} text-[11px] text-[#8792a2]`}>/{k}</p>
              <h3 className="mt-6 text-[20px] font-bold tracking-[-.02em] text-[#0a2540]">{t}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-[#425466]">{d}</p>
              <span className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-[#ff5a1f] to-[#2650f2] transition-transform duration-500 group-hover:scale-x-100" />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------- bento ---------- */
function Layers() {
  const L = [['Лак', 'rgba(255,255,255,.85)'], ['База', ACC], ['Грунт', '#8d9496'], ['Шпатлёвка', '#c9c3b5'], ['Металл', '#a7adb4']]
  return (
    <div className="mt-6 grid gap-1.5">
      {L.map(([t, c], i) => (
        <motion.div key={t} initial={{ x: -40, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 * (L.length - i), duration: 0.6 }} className="flex h-8 items-center justify-between rounded-[6px] px-3 text-[12px] font-semibold" style={{ background: c, color: i < 1 ? NAVY : i === 1 ? '#fff' : NAVY, boxShadow: i === 0 ? 'inset 0 0 0 1px #e6ebf1' : undefined }}>
          <span>{t}</span><span className={MONO}>0{L.length - i}</span>
        </motion.div>
      ))}
    </div>
  )
}
function Spectrum() {
  return (
    <div className="relative mt-8 h-16 overflow-hidden rounded-[10px]">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#d7261e,#ff6a1a,#ffb21e,#e9ecef,#3a3f47,#1f4fd1,#d61f6f)]" />
      <motion.div className="absolute inset-y-0 w-[3px] bg-white shadow-[0_0_0_2px_rgba(10,37,64,.5)]" animate={{ left: ['8%', '88%', '30%', '62%', '8%'] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} />
    </div>
  )
}
function Bento() {
  const c = 'relative overflow-hidden rounded-[14px] border border-[#e6ebf1] bg-white p-7'
  return (
    <section className="relative px-5 py-28 md:py-36" style={{ background: NAVY, clipPath: 'polygon(0 0, 100% 4vw, 100% 100%, 0 calc(100% - 4vw))' }}>
      <div className="absolute inset-0 opacity-40"><div className="absolute -left-40 top-20 h-[420px] w-[420px] rounded-full bg-[#ff5a1f] blur-[140px]" /><div className="absolute -right-20 bottom-10 h-[420px] w-[420px] rounded-full bg-[#2650f2] blur-[140px]" /></div>
      <div className="relative mx-auto max-w-[1180px]">
        <p className="text-[15px] font-semibold text-[#ffb21e]">Почему Бунгало</p>
        <h2 className="mt-3 max-w-[680px] text-[clamp(32px,4.4vw,52px)] font-bold leading-[1.05] tracking-[-.04em] text-white">Ремонт, который потом не найти.</h2>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          <Reveal className={c + ' md:col-span-2'}>
            <p className={`${MONO} text-[11px] text-[#8792a2]`}>colour.match</p>
            <h3 className="mt-3 text-[24px] font-bold tracking-[-.03em] text-[#0a2540]">Подбор оттенка — отдельный этап.</h3>
            <p className="mt-2 max-w-[460px] text-[15px] text-[#425466]">Один и тот же код краски на разных машинах выглядит по-разному. Поэтому сначала подбираем, потом красим.</p>
            <Spectrum />
          </Reveal>
          <Reveal delay={0.08} className={c}>
            <p className={`${MONO} text-[11px] text-[#8792a2]`}>yandex.maps</p>
            <p className="mt-4 text-[84px] font-bold leading-none tracking-[-.06em] text-[#0a2540]">{b.rating}</p>
            <p className="mt-2 text-[15px] text-[#425466]">{b.rev} оценок клиентов</p>
          </Reveal>
          <Reveal delay={0.12} className={c}>
            <p className={`${MONO} text-[11px] text-[#8792a2]`}>coating.layers</p>
            <h3 className="mt-3 text-[20px] font-bold tracking-[-.02em] text-[#0a2540]">Пять слоёв под блеском</h3>
            <Layers />
          </Reveal>
          <Reveal delay={0.16} className={c + ' md:col-span-2'}>
            <p className={`${MONO} text-[11px] text-[#8792a2]`}>workflow</p>
            <h3 className="mt-3 text-[24px] font-bold tracking-[-.03em] text-[#0a2540]">Фото → оценка → осмотр → ремонт.</h3>
            <pre className={`${MONO} mt-5 overflow-x-auto rounded-[10px] bg-[#0a2540] p-4 text-[12.5px] leading-relaxed text-[#c1c9d2]`}>{`{\n  `}<span className="text-[#ffb21e]">"повреждение"</span>{`: "вмятина",\n  `}<span className="text-[#ffb21e]">"детали"</span>{`: ["дверь передняя левая"],\n  `}<span className="text-[#ffb21e]">"фото"</span>{`: 3,\n  `}<span className="text-[#ffb21e]">"следующий шаг"</span>{`: `}<span className="text-[#7ee2b8]">"осмотр в сервисе"</span>{`\n}`}</pre>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

/* ---------- booking (checkout-like) ---------- */
const BSVC = ['Кузовной ремонт', 'Покраска элемента', 'Локальная покраска', 'Ремонт бампера', 'Полировка', 'Осмотр и оценка']
const STEPS = ['Услуга', 'Автомобиль', 'Контакты']
function Chip({ on, children, onClick }) {
  return <button type="button" onClick={onClick} aria-pressed={on} className={'h-10 rounded-[8px] border px-3.5 text-[14px] font-medium transition-colors ' + (on ? 'border-[#ff5a1f] bg-[#fff1eb] text-[#c2410c]' : 'border-[#e6ebf1] text-[#0a2540] hover:border-[#c1c9d2]')}>{children}</button>
}
function Booking() {
  const bk = useBooking()
  const [step, setStep] = useState(0)
  const [car, setCar] = useState(''), [color, setColor] = useState('')
  const [err, setErr] = useState('')
  useEffect(() => { const h = e => { bk.upd('svc', e.detail); setStep(0); setErr('') }; window.addEventListener('bg-svc', h); return () => window.removeEventListener('bg-svc', h) }, [])
  const next = () => {
    if (step === 0 && !bk.s.svc) return setErr('Выберите услугу или опишите задачу.')
    if (step === 1 && car.trim().length < 2) return setErr('Укажите марку и модель.')
    setErr(''); setStep(s => s + 1)
  }
  const onSubmit = e => { e.preventDefault(); if (step < 2) next(); else bk.submit() }
  const f = 'h-12 w-full rounded-[8px] border border-[#e6ebf1] bg-white px-3.5 text-[16px] text-[#0a2540] outline-none shadow-[0_1px_2px_rgba(0,0,0,.04)] placeholder:text-[#a3acb9] focus:border-[#ff5a1f] focus:ring-4 focus:ring-[#ff5a1f]/15'
  return (
    <section id="book" className="px-5 py-28 md:py-36" style={{ background: BG }}>
      <div className="mx-auto grid max-w-[1180px] gap-10 lg:grid-cols-[1fr_1.15fr]">
        <div>
          <p className="text-[15px] font-semibold" style={{ color: ACC }}>Запись</p>
          <h2 className="mt-3 text-[clamp(34px,4.8vw,58px)] font-bold leading-[1.02] tracking-[-.04em] text-[#0a2540]">Запишитесь на осмотр.</h2>
          <p className="mt-4 max-w-[420px] text-[17px] text-[#425466]">Три шага — и мы перезвоним, чтобы согласовать время. Или звоните сразу:</p>
          <a href={'tel:' + tel(b.phone)} className="mt-3 inline-block text-[28px] font-bold tracking-[-.03em] text-[#0a2540] hover:text-[#ff5a1f]">{b.phone}</a>
          <div className="mt-8 hidden rounded-[14px] border border-[#e6ebf1] bg-white p-5 lg:block">
            <p className={`${MONO} text-[11px] text-[#8792a2]`}>summary</p>
            <dl className="mt-3 grid gap-2 text-[14px]">
              <div className="flex justify-between gap-4"><dt className="text-[#8792a2]">Услуга</dt><dd className="text-right font-semibold text-[#0a2540]">{bk.s.svc || '—'}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-[#8792a2]">Автомобиль</dt><dd className="text-right font-semibold text-[#0a2540]">{car || '—'}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-[#8792a2]">Цвет / код</dt><dd className="text-right font-semibold text-[#0a2540]">{color || '—'}</dd></div>
            </dl>
          </div>
        </div>
        <div className="rounded-[16px] bg-white p-6 shadow-[0_50px_100px_-20px_rgba(50,50,93,.18),0_30px_60px_-30px_rgba(0,0,0,.2)] ring-1 ring-black/5 md:p-9">
          <AnimatePresence mode="wait">
            {!bk.s.sent ? (
              <motion.form key="f" onSubmit={onSubmit} noValidate exit={{ opacity: 0, y: -8 }}>
                <ol className="mb-8 flex items-center gap-2" aria-label="Шаги">
                  {STEPS.map((s, i) => (
                    <li key={s} aria-current={i === step ? 'step' : undefined} className="flex flex-1 items-center gap-2">
                      <span className={'grid h-6 w-6 shrink-0 place-items-center rounded-full text-[12px] font-bold transition-colors ' + (i < step ? 'bg-[#ff5a1f] text-white' : i === step ? 'bg-[#0a2540] text-white' : 'bg-[#eef2f7] text-[#8792a2]')}>{i < step ? <Check size={12} strokeWidth={3} /> : i + 1}</span>
                      <span className={'text-[13px] font-semibold ' + (i <= step ? 'text-[#0a2540]' : 'text-[#8792a2]')}>{s}</span>
                      {i < 2 && <span className="h-px flex-1 bg-[#e6ebf1]" />}
                    </li>
                  ))}
                </ol>
                <AnimatePresence mode="wait">
                  <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }} className="min-h-[220px]">
                    {step === 0 && (
                      <fieldset>
                        <legend className="mb-4 text-[20px] font-bold tracking-[-.02em] text-[#0a2540]">Что нужно сделать?</legend>
                        <div className="flex flex-wrap gap-2">{BSVC.map(s => <Chip key={s} on={bk.s.svc === s} onClick={() => { bk.upd('svc', s); setErr('') }}>{s}</Chip>)}</div>
                        <input className={f + ' mt-4'} placeholder="Или опишите задачу" value={BSVC.includes(bk.s.svc) ? '' : bk.s.svc} onChange={e => bk.upd('svc', e.target.value)} />
                      </fieldset>
                    )}
                    {step === 1 && (
                      <div className="grid gap-4">
                        <p className="text-[20px] font-bold tracking-[-.02em] text-[#0a2540]">Автомобиль</p>
                        <label className="grid gap-1.5 text-[13px] font-semibold text-[#425466]">Марка и модель<input className={f} placeholder="Например, Volkswagen Passat" value={car} onChange={e => { setCar(e.target.value); setErr('') }} /></label>
                        <label className="grid gap-1.5 text-[13px] font-semibold text-[#425466]">Цвет или код краски (необязательно)<input className={f} placeholder="Серебристый металлик" value={color} onChange={e => setColor(e.target.value)} /></label>
                      </div>
                    )}
                    {step === 2 && (
                      <div className="grid gap-4">
                        <p className="text-[20px] font-bold tracking-[-.02em] text-[#0a2540]">Контакты</p>
                        <label className="grid gap-1.5 text-[13px] font-semibold text-[#425466]">Имя<input className={f} autoComplete="name" placeholder="Как к вам обращаться" value={bk.s.name} onChange={e => bk.upd('name', e.target.value)} /></label>
                        <label className="grid gap-1.5 text-[13px] font-semibold text-[#425466]">Телефон<input className={f + (bk.s.err ? ' !border-red-500' : '')} type="tel" inputMode="tel" autoComplete="tel" placeholder="+375 __ ___-__-__" value={bk.s.phone} onFocus={phoneFocus(bk)} onChange={e => bk.upd('phone', e.target.value)} aria-invalid={bk.s.err} /></label>
                        {bk.s.err && <p role="alert" className="text-[13px] text-red-600">Введите номер полностью: +375 и 9 цифр.</p>}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
                {err && <p role="alert" className="mt-3 text-[13px] text-red-600">{err}</p>}
                <div className="mt-6 flex items-center justify-between">
                  {step > 0 ? <button type="button" onClick={() => { setErr(''); setStep(s => s - 1) }} className="inline-flex h-11 items-center gap-1.5 text-[14px] font-semibold text-[#425466]"><ArrowLeft size={15} />Назад</button> : <span />}
                  <button type="submit" disabled={bk.s.loading} className="inline-flex h-11 items-center gap-1.5 rounded-full px-6 text-[15px] font-semibold text-white disabled:opacity-60" style={{ background: NAVY }}>{step < 2 ? <>Продолжить <ArrowRight size={16} /></> : bk.s.loading ? 'Отправляем…' : 'Записаться'}</button>
                </div>
              </motion.form>
            ) : (
              <motion.div key="ok" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="grid min-h-[320px] place-items-center text-center">
                <div>
                  <CheckDraw className="mx-auto mb-5 text-[#ff5a1f]" size={76} />
                  <h3 className="text-[30px] font-bold tracking-[-.03em] text-[#0a2540]">Заявка отправлена</h3>
                  <p className="mx-auto mt-3 max-w-[360px] text-[15px] text-[#425466]">В готовом сайте заявка сразу придёт вам в Telegram — мастер перезвонит и согласует время осмотра.</p>
                  <button onClick={() => { bk.reset(); setStep(0); setCar(''); setColor('') }} className="mt-5 text-[14px] font-semibold text-[#ff5a1f]">Новая заявка</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

function Contact() {
  return (
    <section id="contact" className="relative px-5 pb-24 pt-32 md:pb-32 md:pt-40" style={{ background: NAVY, clipPath: 'polygon(0 4vw, 100% 0, 100% 100%, 0 100%)' }}>
      <div className="mx-auto grid max-w-[1180px] gap-10 lg:grid-cols-[1fr_1.4fr]">
        <div className="text-white">
          <p className="text-[15px] font-semibold text-[#ffb21e]">Контакты</p>
          <h2 className="mt-3 text-[clamp(32px,4.4vw,52px)] font-bold leading-[1.05] tracking-[-.04em]">Приезжайте на осмотр.</h2>
          <div className="mt-10 grid gap-5 text-[16px]">
            <p className="flex gap-3 text-white/80"><MapPin size={20} className="shrink-0 text-[#ff5a1f]" />{b.addr}, {b.city}</p>
            <a href={'tel:' + tel(b.phone)} className="flex gap-3 text-[24px] font-bold tracking-[-.02em] hover:text-[#ffb21e]"><Phone size={20} className="mt-1.5 shrink-0 text-[#ff5a1f]" />{b.phone}</a>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={'tel:' + tel(b.phone)} className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-[15px] font-semibold text-[#0a2540]">Позвонить</a>
            <a href={b.viber} className="inline-flex h-11 items-center gap-2 rounded-full border border-white/25 px-5 text-[15px] font-semibold text-white hover:border-white/60">Фото в Viber</a>
          </div>
        </div>
        <Reveal className="h-[400px] overflow-hidden rounded-[14px] ring-1 ring-white/10 md:h-[460px]"><MapFrame oid={b.oid} /></Reveal>
      </div>
    </section>
  )
}

function App() {
  useSmooth()
  const lite = useLite()
  return (
    <MotionConfig reducedMotion="user">
      <div className="relative overflow-x-clip font-['Inter',sans-serif]" style={{ background: BG, color: NAVY, '--sel': ACC, '--selc': '#fff' }}>
        <Ribbon name={b.name} bg={NAVY} fg="#fff" />
        <main>
          <Hero lite={lite} />
          <Film lite={lite} />
          <Estimate />
          <Services />
          <Bento />
          <Booking />
          <Contact />
        </main>
        <footer className="px-5 py-7 text-[13px] text-white/50" style={{ background: NAVY }}>
          <div className="mx-auto flex max-w-[1180px] flex-wrap justify-between gap-3 border-t border-white/10 pt-6"><span>© 2026 {b.name} · Концепт сайта — Артём</span><span>Кузовной ремонт и покраска · {b.city}</span></div>
        </footer>
        <CallBar phone={b.phone} barCls="bg-white/95 backdrop-blur border-t border-[#e6ebf1]" callCls="rounded-full border border-[#e6ebf1] text-[#0a2540]" bookCls="rounded-full bg-[#0a2540] text-white" />
        <div className="h-[72px] sm:hidden" style={{ background: NAVY }} />
      </div>
    </MotionConfig>
  )
}
createRoot(document.getElementById('root')).render(<App />)
