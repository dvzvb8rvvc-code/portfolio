/* shared paint engine: one offscreen-able canvas that the 2D studio paints on and the 3D nail uses as a texture */
export const W = 512, H = 768
export const PAINTS = [['Cadmium', '#ff3b1f'], ['Ultramarine', '#2541ff'], ['Lemon', '#ffd60a'], ['Ink', '#121212'], ['Chalk', '#fbf8f2']]
export const store = { canvas: null, ver: 0, undo: [] }

/* nail outline in a 1 x 1.5 box; works with CanvasRenderingContext2D, Path2D and THREE.Shape */
export function nailPath(p, w, h, flip = false) {
  const X = x => x * w, Y = y => (flip ? h - (y / 1.5) * h : (y / 1.5) * h)
  p.moveTo(X(.5), Y(0))
  p.bezierCurveTo(X(.86), Y(0), X(1), Y(.34), X(1), Y(.66))
  p.lineTo(X(1), Y(1.22))
  p.bezierCurveTo(X(1), Y(1.44), X(.84), Y(1.5), X(.5), Y(1.5))
  p.bezierCurveTo(X(.16), Y(1.5), X(0), Y(1.44), X(0), Y(1.22))
  p.lineTo(X(0), Y(.66))
  p.bezierCurveTo(X(0), Y(.34), X(.14), Y(0), X(.5), Y(0))
}
export const NAIL_D = 'M50 0C86 0 100 34 100 66L100 122C100 144 84 150 50 150C16 150 0 144 0 122L0 66C0 34 14 0 50 0Z'
export const NAIL_BB = 'M.5 0C.86 0 1 .2267 1 .44L1 .8133C1 .96 .84 1 .5 1C.16 1 0 .96 0 .8133L0 .44C0 .2267 .14 0 .5 0Z'

const rnd = (a, b) => a + Math.random() * (b - a)
const pick = a => a[(Math.random() * a.length) | 0]

export function drawDefault(c) {
  const x = c.getContext('2d')
  x.fillStyle = '#f6efe6'; x.fillRect(0, 0, W, H)
  x.lineCap = 'round'; x.lineJoin = 'round'
  x.strokeStyle = '#ff3b1f'; x.lineWidth = 92
  x.beginPath(); x.moveTo(-40, 520); x.bezierCurveTo(120, 380, 260, 640, 560, 420); x.stroke()
  x.strokeStyle = '#121212'; x.lineWidth = 14
  x.beginPath(); x.moveTo(60, 120); x.bezierCurveTo(200, 60, 300, 300, 470, 210); x.stroke()
  x.strokeStyle = '#2541ff'; x.lineWidth = 36; x.lineCap = 'butt'
  x.beginPath(); x.moveTo(0, 700); x.lineTo(W, 640); x.stroke()
  x.fillStyle = '#ffd60a'; x.beginPath(); x.arc(360, 300, 58, 0, 7); x.fill()
  x.fillStyle = '#121212'
  for (let i = 0; i < 7; i++) { x.beginPath(); x.arc(110 + i * 46, 340 - Math.sin(i) * 30, 9, 0, 7); x.fill() }
}

export function drawRandom(c) {
  const x = c.getContext('2d')
  const cols = PAINTS.map(p => p[1])
  const base = pick(cols); x.fillStyle = base; x.fillRect(0, 0, W, H)
  const rest = cols.filter(k => k !== base)
  x.lineCap = 'round'; x.lineJoin = 'round'
  for (let i = 0; i < 3; i++) {
    x.strokeStyle = pick(rest); x.lineWidth = rnd(18, 90)
    x.beginPath(); x.moveTo(rnd(-60, 100), rnd(0, H)); x.bezierCurveTo(rnd(0, W), rnd(0, H), rnd(0, W), rnd(0, H), rnd(W - 100, W + 60), rnd(0, H)); x.stroke()
  }
  x.lineCap = 'butt'; x.strokeStyle = pick(rest); x.lineWidth = rnd(12, 40)
  const y = rnd(100, H - 100); x.beginPath(); x.moveTo(0, y); x.lineTo(W, y + rnd(-120, 120)); x.stroke()
  x.fillStyle = pick(rest)
  const n = (rnd(4, 12)) | 0, cx = rnd(80, W - 80), cy = rnd(80, H - 80)
  for (let i = 0; i < n; i++) { x.beginPath(); x.arc(cx + Math.cos(i * 2.4) * i * 14, cy + Math.sin(i * 2.4) * i * 14, rnd(6, 16), 0, 7); x.fill() }
}

export function getCanvas() {
  if (!store.canvas) {
    const c = document.createElement('canvas'); c.width = W; c.height = H
    store.canvas = c; drawDefault(c)
  }
  return store.canvas
}
