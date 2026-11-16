import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'

/* tiny 2D rigid-body engine: circles + convex polygons, SAT, iterative impulses, friction, grab & throw */
const G = 2200, DT = 1 / 120
const cross = (ax, ay, bx, by) => ax * by - ay * bx

function polyProps(pts, density = 1) {
  let A = 0, cx = 0, cy = 0
  for (let i = 0; i < pts.length; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[(i + 1) % pts.length], c = cross(x0, y0, x1, y1)
    A += c; cx += (x0 + x1) * c; cy += (y0 + y1) * c
  }
  A /= 2; cx /= 6 * A; cy /= 6 * A
  const v = pts.map(([x, y]) => [x - cx, y - cy])
  let I = 0
  for (let i = 0; i < v.length; i++) {
    const [x0, y0] = v[i], [x1, y1] = v[(i + 1) % v.length]
    I += cross(x0, y0, x1, y1) * (x0 * x0 + y0 * y0 + x0 * x1 + y0 * y1 + x1 * x1 + y1 * y1)
  }
  I = Math.abs(I) * density / 12
  return { verts: v, m: Math.abs(A) * density, I }
}

export function makeBody(kind, x, y, s, color, label = '') {
  const b = { kind, x, y, vx: 0, vy: 0, a: (Math.random() - .5) * .6, w: 0, color, label, s }
  if (kind === 'circle') {
    b.r = s / 2; const m = Math.PI * b.r * b.r
    b.invM = 1 / m; b.invI = 1 / (m * b.r * b.r / 2); return b
  }
  let pts
  const h = s / 2
  if (kind === 'square') pts = [[-h, -h], [h, -h], [h, h], [-h, h]]
  else if (kind === 'bar') pts = [[-s * .95, -s * .22], [s * .95, -s * .22], [s * .95, s * .22], [-s * .95, s * .22]]
  else if (kind === 'tri') { const r = s * .62; pts = [0, 1, 2].map(i => [Math.cos(-Math.PI / 2 + i * 2.0944) * r, Math.sin(-Math.PI / 2 + i * 2.0944) * r]) }
  else if (kind === 'semi') { pts = []; for (let i = 0; i <= 12; i++) { const t = Math.PI + i / 12 * Math.PI; pts.push([Math.cos(t) * s * .62, Math.sin(t) * s * .62]) } }
  else if (kind === 'quarter') { const r = s * .9; pts = [[0, 0]]; for (let i = 0; i <= 8; i++) { const t = -Math.PI / 2 + i / 8 * Math.PI / 2; pts.push([Math.cos(t) * r, Math.sin(t) * r]) } pts = pts.map(([px, py]) => [px, -py]).reverse() }
  const p = polyProps(pts)
  b.verts = p.verts; b.invM = 1 / p.m; b.invI = 1 / p.I
  return b
}

function worldVerts(b) {
  if (b.kind === 'circle') return
  const c = Math.cos(b.a), s = Math.sin(b.a)
  b.wv = b.verts.map(([x, y]) => [b.x + x * c - y * s, b.y + x * s + y * c])
  b.wn = b.wv.map((p, i) => { const q = b.wv[(i + 1) % b.wv.length], ex = q[0] - p[0], ey = q[1] - p[1], l = Math.hypot(ex, ey) || 1; return [ey / l, -ex / l] })
}

const WALL = { x: 0, y: 0, vx: 0, vy: 0, w: 0, invM: 0, invI: 0 }

function satPoly(A, B) {
  let best = -Infinity, bi = -1
  for (let i = 0; i < A.wv.length; i++) {
    const [nx, ny] = A.wn[i], [px, py] = A.wv[i]
    let mn = Infinity
    for (const v of B.wv) mn = Math.min(mn, (v[0] - px) * nx + (v[1] - py) * ny)
    if (mn > best) { best = mn; bi = i }
  }
  return [best, bi]
}

function collide(A, B, out) {
  if (A.kind === 'circle' && B.kind === 'circle') {
    const dx = B.x - A.x, dy = B.y - A.y, d = Math.hypot(dx, dy), R = A.r + B.r
    if (d >= R || d === 0) return
    const nx = dx / d, ny = dy / d
    out.push({ A, B, nx, ny, depth: R - d, pts: [[A.x + nx * A.r, A.y + ny * A.r]] })
    return
  }
  if (A.kind === 'circle' || B.kind === 'circle') {
    const C = A.kind === 'circle' ? A : B, P = C === A ? B : A
    let maxS = -Infinity, fi = 0
    for (let i = 0; i < P.wv.length; i++) { const s = (C.x - P.wv[i][0]) * P.wn[i][0] + (C.y - P.wv[i][1]) * P.wn[i][1]; if (s > maxS) { maxS = s; fi = i } }
    if (maxS > C.r) return
    let nx, ny, depth, pt
    if (maxS < 0) { nx = P.wn[fi][0]; ny = P.wn[fi][1]; depth = C.r - maxS; pt = [C.x - nx * C.r, C.y - ny * C.r] }
    else {
      let bd = Infinity, q = null
      for (let i = 0; i < P.wv.length; i++) {
        const a = P.wv[i], b = P.wv[(i + 1) % P.wv.length], ex = b[0] - a[0], ey = b[1] - a[1]
        const t = Math.max(0, Math.min(1, ((C.x - a[0]) * ex + (C.y - a[1]) * ey) / (ex * ex + ey * ey)))
        const qx = a[0] + ex * t, qy = a[1] + ey * t, d = Math.hypot(C.x - qx, C.y - qy)
        if (d < bd) { bd = d; q = [qx, qy] }
      }
      if (bd >= C.r || bd === 0) return
      nx = (C.x - q[0]) / bd; ny = (C.y - q[1]) / bd; depth = C.r - bd; pt = q
    }
    out.push({ A: P, B: C, nx, ny, depth, pts: [pt] })
    return
  }
  const [sa, ia] = satPoly(A, B); if (sa > 0) return
  const [sb, ib] = satPoly(B, A); if (sb > 0) return
  let R, I, idx, flip
  if (sa >= sb - .5) { R = A; I = B; idx = ia; flip = false } else { R = B; I = A; idx = ib; flip = true }
  const [nx, ny] = R.wn[idx], [fx, fy] = R.wv[idx]
  let pts = [], depth = 0, deepest = null, dd = Infinity
  for (const v of I.wv) {
    const d = (v[0] - fx) * nx + (v[1] - fy) * ny
    if (d < dd) { dd = d; deepest = v }
    if (d < 0) { pts.push(v); depth = Math.max(depth, -d) }
  }
  if (!pts.length) { pts = [deepest]; depth = -dd }
  pts.sort((p, q) => ((p[0] - fx) * nx + (p[1] - fy) * ny) - ((q[0] - fx) * nx + (q[1] - fy) * ny))
  pts = pts.slice(0, 2)
  out.push(flip ? { A: B, B: A, nx, ny, depth, pts } : { A, B, nx, ny, depth, pts })
}

function wallContacts(b, W, H, out) {
  const walls = [[0, 1, H], [-1, 0, 0], [1, 0, W]]
  for (const [nx, ny, off] of walls) {
    if (b.kind === 'circle') {
      const d = nx === 0 ? b.y + b.r - off : nx > 0 ? b.x + b.r - off : -(b.x - b.r - off)
      if (d > 0) out.push({ A: b, B: WALL, nx, ny, depth: d, pts: [[b.x + nx * b.r, b.y + ny * b.r]] })
    } else {
      const pts = []; let depth = 0
      for (const v of b.wv) { const d = nx === 0 ? v[1] - off : nx > 0 ? v[0] - off : off - v[0]; if (d > 0) { pts.push(v); depth = Math.max(depth, d) } }
      if (pts.length) out.push({ A: b, B: WALL, nx, ny, depth, pts: pts.slice(0, 2) })
    }
  }
}

function solve(c) {
  const { A, B, nx, ny } = c
  for (const p of c.pts) {
    const rax = p[0] - A.x, ray = p[1] - A.y, rbx = p[0] - B.x, rby = p[1] - B.y
    const rvx = (B.vx - B.w * rby) - (A.vx - A.w * ray), rvy = (B.vy + B.w * rbx) - (A.vy + A.w * rax)
    const vn = rvx * nx + rvy * ny
    if (vn > 0) continue
    const ran = cross(rax, ray, nx, ny), rbn = cross(rbx, rby, nx, ny)
    const k = A.invM + B.invM + ran * ran * A.invI + rbn * rbn * B.invI
    const e = vn < -260 ? .28 : 0
    const j = -(1 + e) * vn / k / c.pts.length
    A.vx -= j * nx * A.invM; A.vy -= j * ny * A.invM; A.w -= ran * j * A.invI
    B.vx += j * nx * B.invM; B.vy += j * ny * B.invM; B.w += rbn * j * B.invI
    /* friction */
    const rvx2 = (B.vx - B.w * rby) - (A.vx - A.w * ray), rvy2 = (B.vy + B.w * rbx) - (A.vy + A.w * rax)
    let tx = rvx2 - nx * (rvx2 * nx + rvy2 * ny), ty = rvy2 - ny * (rvx2 * nx + rvy2 * ny)
    const tl = Math.hypot(tx, ty); if (tl < 1e-6) continue
    tx /= tl; ty /= tl
    const rat = cross(rax, ray, tx, ty), rbt = cross(rbx, rby, tx, ty)
    const kt = A.invM + B.invM + rat * rat * A.invI + rbt * rbt * B.invI
    let jt = -(rvx2 * tx + rvy2 * ty) / kt / c.pts.length
    const mu = .55; jt = Math.max(-j * mu, Math.min(j * mu, jt))
    A.vx -= jt * tx * A.invM; A.vy -= jt * ty * A.invM; A.w -= rat * jt * A.invI
    B.vx += jt * tx * B.invM; B.vy += jt * ty * B.invM; B.w += rbt * jt * B.invI
  }
}

function step(bodies, W, H, held) {
  for (const b of bodies) {
    if (b === held.body) {
      const k = 22
      b.vx = (held.x - b.x) * k; b.vy = (held.y - b.y) * k; b.w *= .85
    } else b.vy += G * DT
    worldVerts(b)
  }
  const cs = []
  for (let i = 0; i < bodies.length; i++) {
    const A = bodies[i]
    wallContacts(A, W, H, cs)
    for (let j = i + 1; j < bodies.length; j++) {
      const B = bodies[j], rA = A.kind === 'circle' ? A.r : A.s * 1.05, rB = B.kind === 'circle' ? B.r : B.s * 1.05
      if (Math.abs(A.x - B.x) > rA + rB || Math.abs(A.y - B.y) > rA + rB) continue
      collide(A, B, cs)
    }
  }
  for (let it = 0; it < 10; it++) for (const c of cs) solve(c)
  for (const b of bodies) {
    b.vx *= .999; b.vy *= .999; b.w *= .992
    const sp = Math.hypot(b.vx, b.vy); if (sp > 4200) { b.vx *= 4200 / sp; b.vy *= 4200 / sp }
    b.x += b.vx * DT; b.y += b.vy * DT; b.a += b.w * DT
  }
  for (const c of cs) {
    const corr = Math.max(c.depth - .6, 0) / (c.A.invM + c.B.invM) * .45
    c.A.x -= c.nx * corr * c.A.invM; c.A.y -= c.ny * corr * c.A.invM
    c.B.x += c.nx * corr * c.B.invM; c.B.y += c.ny * corr * c.B.invM
  }
}

function hit(b, x, y) {
  if (b.kind === 'circle') return Math.hypot(x - b.x, y - b.y) < b.r + 6
  worldVerts(b)
  return b.wv.every((p, i) => (x - p[0]) * b.wn[i][0] + (y - p[1]) * b.wn[i][1] < 6)
}

function draw(ctx, b) {
  ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.a)
  ctx.fillStyle = b.color; ctx.beginPath()
  if (b.kind === 'circle') ctx.arc(0, 0, b.r, 0, Math.PI * 2)
  else { b.verts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath() }
  ctx.fill()
  if (b.label) {
    ctx.fillStyle = b.color === '#efe9dc' || b.color === '#f2b31b' ? '#141414' : '#efe9dc'
    ctx.font = `${Math.round(b.s * .5)}px 'Archivo Black', sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(b.label, 0, b.kind === 'tri' ? b.s * .1 : b.s * .03)
  }
  ctx.restore()
}

const KINDS = ['circle', 'square', 'tri', 'semi', 'bar', 'quarter']
const COLS = ['#d7262b', '#f2b31b', '#1e4fa3', '#141414']
const START = [['square', '#d7262b', 'H'], ['circle', '#f2b31b', 'A'], ['tri', '#1e4fa3', 'U'], ['square', '#141414', 'S'], ['bar', '#1e4fa3'], ['semi', '#d7262b'], ['circle', '#141414'], ['quarter', '#f2b31b'], ['tri', '#d7262b'], ['circle', '#1e4fa3'], ['square', '#f2b31b'], ['bar', '#141414'], ['circle', '#d7262b'], ['semi', '#1e4fa3']]

export default forwardRef(function Playground({ className = '' }, ref) {
  const cv = useRef(null), api = useRef({})
  useImperativeHandle(ref, () => ({ shake: () => api.current.shake?.(), reset: () => api.current.reset?.() }))
  useEffect(() => {
    const c = cv.current, ctx = c.getContext('2d')
    let W = 0, H = 0, dpr = Math.min(devicePixelRatio || 1, 2), bodies = [], queue = [], acc = 0, last = 0, id = 0, visible = false, started = false
    const held = { body: null, x: 0, y: 0 }
    const unit = () => Math.max(46, Math.min(W, H) * (W < 600 ? .17 : .15))
    const resize = () => {
      W = c.offsetWidth; H = c.offsetHeight; c.width = W * dpr; c.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      bodies.forEach(b => { b.x = Math.min(Math.max(b.x, 40), W - 40) })
    }
    const spawnSet = () => {
      bodies = []; queue = START.map((s, i) => ({ s, t: i * 110 }))
      if (W < 600) queue = queue.slice(0, 11)
    }
    const spawn = (kind, color, label, x, y) => {
      const u = unit() * (label ? 1 : .7 + Math.random() * .5)
      const b = makeBody(kind, x ?? (u + Math.random() * (W - 2 * u)), y ?? -u, u, color, label)
      bodies.push(b); if (bodies.length > 28) bodies.splice(bodies.findIndex(q => !q.label), 1)
      return b
    }
    api.current.shake = () => bodies.forEach(b => { b.vx += (Math.random() - .5) * 900; b.vy -= 900 + Math.random() * 900; b.w += (Math.random() - .5) * 12 })
    api.current.reset = () => { spawnSet(); t0 = performance.now() }
    let t0 = 0
    const frame = now => {
      id = requestAnimationFrame(frame)
      if (!visible) { last = now; return }
      if (!started) { started = true; spawnSet(); t0 = now }
      while (queue.length && now - t0 > queue[0].t) { const { s } = queue.shift(); spawn(s[0], s[1], s[2]) }
      acc += Math.min(.05, (now - last) / 1000); last = now
      while (acc >= DT) { step(bodies, W, H, held); acc -= DT }
      ctx.clearRect(0, 0, W, H)
      for (const b of bodies) draw(ctx, b)
      if (held.body) { ctx.strokeStyle = '#141414'; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(held.body.x, held.body.y); ctx.lineTo(held.x, held.y); ctx.stroke(); ctx.setLineDash([]) }
    }
    const loc = (cx, cy) => { const r = c.getBoundingClientRect(); return [cx - r.left, cy - r.top] }
    const pick = (x, y) => { for (let i = bodies.length - 1; i >= 0; i--) if (hit(bodies[i], x, y)) return bodies[i]; return null }
    const drop = (x, y) => spawn(KINDS[(Math.random() * KINDS.length) | 0], COLS[(Math.random() * 4) | 0], '', x, Math.min(y, H * .5))
    /* mouse */
    let mdown = null
    const md = e => { if (e.button !== 0) return; const [x, y] = loc(e.clientX, e.clientY), b = pick(x, y); mdown = [x, y]; if (b) { held.body = b; held.x = x; held.y = y; c.style.cursor = 'grabbing' } }
    const mm = e => { const [x, y] = loc(e.clientX, e.clientY); if (held.body) { held.x = x; held.y = y } else c.style.cursor = pick(x, y) ? 'grab' : 'copy' }
    const mu = e => { if (!mdown) return; const [x, y] = loc(e.clientX, e.clientY); if (!held.body && Math.hypot(x - mdown[0], y - mdown[1]) < 6) drop(x, y); held.body = null; mdown = null; c.style.cursor = '' }
    /* touch: only block scrolling when a shape is grabbed */
    let tStart = null
    const ts = e => { const t = e.touches[0], [x, y] = loc(t.clientX, t.clientY), b = pick(x, y); tStart = [x, y, performance.now()]; if (b) { e.preventDefault(); held.body = b; held.x = x; held.y = y } }
    const tm = e => { if (!held.body) return; e.preventDefault(); const t = e.touches[0], [x, y] = loc(t.clientX, t.clientY); held.x = x; held.y = y }
    const te = e => { if (!held.body && tStart && e.changedTouches[0]) { const t = e.changedTouches[0], [x, y] = loc(t.clientX, t.clientY); if (Math.hypot(x - tStart[0], y - tStart[1]) < 8 && performance.now() - tStart[2] < 350) drop(x, y) } held.body = null; tStart = null }
    c.addEventListener('mousedown', md); addEventListener('mousemove', mm); addEventListener('mouseup', mu)
    c.addEventListener('touchstart', ts, { passive: false }); c.addEventListener('touchmove', tm, { passive: false }); c.addEventListener('touchend', te); c.addEventListener('touchcancel', te)
    const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting }, { threshold: .15 })
    io.observe(c)
    const ro = new ResizeObserver(resize); ro.observe(c); resize()
    id = requestAnimationFrame(frame)
    return () => { cancelAnimationFrame(id); io.disconnect(); ro.disconnect(); c.removeEventListener('mousedown', md); removeEventListener('mousemove', mm); removeEventListener('mouseup', mu); c.removeEventListener('touchstart', ts); c.removeEventListener('touchmove', tm); c.removeEventListener('touchend', te); c.removeEventListener('touchcancel', te) }
  }, [])
  return <canvas ref={cv} className={'block h-full w-full select-none ' + className} aria-label="Bauhaus shapes playground: grab, stack and throw shapes" />
})
