import React from 'react'

/* Nested macro scenes. All drawn in a 1600x1000 viewBox (preserveAspectRatio meet, content bleeds past it).
   Each scene is the previous one scaled ZOOM× around its focus point, plus extra detail, so the zoom is seamless. */
export const ZOOM = 5
const RAD = Math.PI / 180
const TH = -54 * RAD // caliper angle
const CR = .62 // caliper centre radius (fraction of wheel r)
export const BG = '#0a0908'

const W0 = { cx: 1170, cy: 660, r: 87 }
const W1 = { cx: 800, cy: 500, r: W0.r * ZOOM }
const calC = w => [w.cx + CR * w.r * Math.cos(TH), w.cy + CR * w.r * Math.sin(TH)]
const W2r = W1.r * ZOOM
const W2 = { cx: 800 - CR * W2r * Math.cos(TH), cy: 500 - CR * W2r * Math.sin(TH), r: W2r }
/* focus point (in viewBox units) of scene j — where scene j+1 lives */
export const FOCUS = [[W0.cx, W0.cy], calC(W1), [800, 500], [800, 500]]

const BigBg = ({ fill = BG }) => <rect x="-6000" y="-6000" width="13600" height="13000" fill={fill} />

function Defs() {
  return (
    <defs>
      <radialGradient id="dtRim" cx=".4" cy=".35" r=".8"><stop offset="0" stopColor="#e9edf1" /><stop offset=".45" stopColor="#9aa4ae" /><stop offset="1" stopColor="#4b525a" /></radialGradient>
      <linearGradient id="dtSpoke" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f1f3f5" /><stop offset=".5" stopColor="#a5aeb8" /><stop offset="1" stopColor="#5a626b" /></linearGradient>
      <linearGradient id="dtCal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffd27a" /><stop offset=".45" stopColor="#f5a524" /><stop offset="1" stopColor="#b86a08" /></linearGradient>
      <linearGradient id="dtBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5b636c" /><stop offset=".45" stopColor="#2a2f35" /><stop offset="1" stopColor="#121417" /></linearGradient>
      <linearGradient id="dtFloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1a1612" /><stop offset="1" stopColor={BG} /></linearGradient>
      <linearGradient id="dtPaint" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1600" y2="1000"><stop offset="0" stopColor="#b86a08" /><stop offset=".42" stopColor="#f5a524" /><stop offset=".5" stopColor="#ffe2a6" /><stop offset=".58" stopColor="#f5a524" /><stop offset="1" stopColor="#9a5806" /></linearGradient>
    </defs>
  )
}

const pt = (w, a, f) => [w.cx + Math.cos(a) * f * w.r, w.cy + Math.sin(a) * f * w.r]
const hex = (x, y, s) => Array.from({ length: 6 }, (_, i) => { const a = i * 60 * RAD + .3; return `${x + Math.cos(a) * s},${y + Math.sin(a) * s}` }).join(' ')

export function WheelSVG({ w, detail = 0 }) {
  const { cx, cy, r } = w
  const spokes = [0, 1, 2, 3, 4].map(i => {
    const a = (-90 + i * 72) * RAD, n = a + Math.PI / 2
    const b1 = [cx + Math.cos(a) * .2 * r + Math.cos(n) * .1 * r, cy + Math.sin(a) * .2 * r + Math.sin(n) * .1 * r]
    const b2 = [cx + Math.cos(a) * .2 * r - Math.cos(n) * .1 * r, cy + Math.sin(a) * .2 * r - Math.sin(n) * .1 * r]
    const o1 = [cx + Math.cos(a) * .76 * r + Math.cos(n) * .06 * r, cy + Math.sin(a) * .76 * r + Math.sin(n) * .06 * r]
    const o2 = [cx + Math.cos(a) * .76 * r - Math.cos(n) * .06 * r, cy + Math.sin(a) * .76 * r - Math.sin(n) * .06 * r]
    return `M${b1} L${o1} L${o2} L${b2} Z`
  })
  const a0 = TH - 17 * RAD, a1 = TH + 17 * RAD
  const p1 = pt(w, a0, .5), p2 = pt(w, a0, .74), p3 = pt(w, a1, .74), p4 = pt(w, a1, .5)
  const cal = `M${p1} L${p2} A${.74 * r} ${.74 * r} 0 0 1 ${p3} L${p4} A${.5 * r} ${.5 * r} 0 0 0 ${p1} Z`
  const holes = Array.from({ length: 30 }, (_, i) => pt(w, i / 30 * Math.PI * 2, .5 + (i % 2) * .08))
  const nuts = [0, 1, 2, 3, 4].map(i => pt(w, (-54 + i * 72) * RAD, .13))
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#111" />
      <circle cx={cx} cy={cy} r={r * .93} fill="none" stroke="#1d1d1d" strokeWidth={r * .05} />
      <circle cx={cx} cy={cy} r={r * .8} fill="url(#dtRim)" />
      <circle cx={cx} cy={cy} r={r * .76} fill="#0c0c0d" />
      <circle cx={cx} cy={cy} r={r * .66} fill="#4b5056" />
      <circle cx={cx} cy={cy} r={r * .66} fill="none" stroke="#2e3236" strokeWidth={r * .01} strokeDasharray={`${r * .02} ${r * .015}`} />
      {holes.map((h, i) => <circle key={i} cx={h[0]} cy={h[1]} r={r * .012} fill="#1b1d20" />)}
      <circle cx={cx} cy={cy} r={r * .3} fill="#3a3e43" />
      <path d={cal} fill="url(#dtCal)" stroke="#c97a10" strokeWidth={r * .012} strokeLinejoin="round" />
      {[a0 + 5 * RAD, a1 - 5 * RAD].map((a, i) => { const [x, y] = pt(w, a, .62); return <g key={i}><polygon points={hex(x, y, r * .022)} fill="#d9dde1" stroke="#7d848c" strokeWidth={r * .004} /><circle cx={x} cy={y} r={r * .009} fill="#8d949b" /></g> })}
      {detail > 0 && Array.from({ length: 70 }, (_, i) => { const a = a0 + ((i * 37) % 100) / 100 * (a1 - a0), f = .52 + ((i * 53) % 100) / 100 * .2; const [x, y] = pt(w, a, f); return <circle key={i} cx={x} cy={y} r={r * (.0008 + (i % 4) * .0006)} fill="#3a2a10" opacity=".5" /> })}
      {spokes.map((d, i) => <path key={i} d={d} fill="url(#dtSpoke)" stroke="#4b525a" strokeWidth={r * .006} />)}
      <circle cx={cx} cy={cy} r={r * .22} fill="url(#dtRim)" stroke="#59616a" strokeWidth={r * .006} />
      {nuts.map(([x, y], i) => <polygon key={i} points={hex(x, y, r * .035)} fill="#e6e9ec" stroke="#6b737b" strokeWidth={r * .004} />)}
      <circle cx={cx} cy={cy} r={r * .06} fill="#f5a524" />
      <circle cx={cx} cy={cy} r={r * .8} fill="none" stroke="#ffb347" strokeOpacity=".25" strokeWidth={r * .006} />
    </g>
  )
}

const Svg = ({ children }) => <svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 h-full w-full overflow-hidden"><Defs />{children}</svg>

export function S0() {
  const body = 'M200 660 L200 575 Q205 528 262 516 L470 476 Q560 386 700 366 L990 360 Q1100 366 1190 452 L1350 482 Q1410 500 1414 566 L1414 660 Z'
  return (
    <Svg>
      <BigBg />
      <rect x="-6000" y="700" width="13600" height="6000" fill="url(#dtFloor)" />
      <ellipse cx="800" cy="752" rx="720" ry="26" fill="#000" opacity=".7" />
      <path d={body} fill="url(#dtBody)" />
      <path d="M470 476 Q560 386 700 366 L990 360 Q1100 366 1190 452" fill="none" stroke="#ffb347" strokeWidth="3" strokeOpacity=".8" />
      <path d="M528 470 Q596 400 700 390 L860 386 L860 468 Z" fill="#0b0c0e" stroke="#3a4048" strokeWidth="2" />
      <path d="M880 386 L985 386 Q1075 392 1135 466 L880 468 Z" fill="#0b0c0e" stroke="#3a4048" strokeWidth="2" />
      <path d="M220 560 L1400 560" stroke="#8d99a6" strokeOpacity=".35" strokeWidth="2" />
      <ellipse cx="1396" cy="525" rx="16" ry="10" fill="#ffd27a" /><ellipse cx="1430" cy="525" rx="70" ry="24" fill="#ffb347" opacity=".18" />
      <rect x="198" y="522" width="16" height="22" rx="4" fill="#ff5a3a" />
      <circle cx="430" cy="660" r="104" fill={BG} /><circle cx="1170" cy="660" r="104" fill={BG} />
      <WheelSVG w={{ cx: 430, cy: 660, r: 87 }} />
      <WheelSVG w={W0} />
    </Svg>
  )
}
export function S1() {
  return <Svg><BigBg /><circle cx={W1.cx} cy={W1.cy} r={W1.r * 1.25} fill="#120f0b" /><WheelSVG w={W1} /></Svg>
}
export function S2() {
  return <Svg><BigBg /><WheelSVG w={W2} detail={1} /></Svg>
}
export function S3() {
  const rings = Array.from({ length: 34 }, (_, i) => 30 + i * 26)
  return (
    <Svg>
      <BigBg fill="#c97812" />
      <rect x="-6000" y="-6000" width="13600" height="13000" fill="url(#dtPaint)" />
      <clipPath id="dtL"><rect x="-6000" y="-6000" width="6800" height="13000" /></clipPath>
      <g clipPath="url(#dtL)" opacity=".9">
        {rings.map((r, i) => <circle key={i} cx="420" cy="520" r={r} fill="none" stroke="#fff" strokeOpacity={.14 + (i % 3) * .06} strokeWidth="2" strokeDasharray={`${40 + (i * 17) % 90} ${20 + (i * 29) % 60}`} transform={`rotate(${i * 23} 420 520)`} />)}
        {rings.slice(0, 20).map((r, i) => <circle key={'b' + i} cx="-120" cy="180" r={r * 1.6} fill="none" stroke="#fff" strokeOpacity=".12" strokeWidth="1.6" strokeDasharray="60 40" transform={`rotate(${i * 31} -120 180)`} />)}
        <rect x="-6000" y="-6000" width="13600" height="13000" fill="#6b4106" opacity=".18" />
      </g>
      <path d="M800 -6000 L800 7000" stroke="#0a0908" strokeOpacity=".5" strokeWidth="2" strokeDasharray="8 10" />
      <path d="M980 -100 L1700 1100" stroke="#fff" strokeOpacity=".55" strokeWidth="40" />
      <path d="M1060 -100 L1780 1100" stroke="#fff" strokeOpacity=".25" strokeWidth="12" />
      <text x="760" y="140" textAnchor="end" fill="#2a1a04" fontFamily="JetBrains Mono, monospace" fontSize="22" letterSpacing="4">SWIRLED</text>
      <text x="840" y="140" fill="#2a1a04" fontFamily="JetBrains Mono, monospace" fontSize="22" letterSpacing="4">CORRECTED</text>
    </Svg>
  )
}
