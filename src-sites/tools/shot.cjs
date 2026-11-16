// usage: node tools/shot.cjs <outDir> <slug> <pngPrefix>
// serves <outDir> under /portfolio/ and takes desktop + iPhone screenshots, prints errors and overflow
const http = require('http'), fs = require('fs'), path = require('path')
const { chromium, devices } = require('playwright')
const [outDir, slug, prefix] = process.argv.slice(2)
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.glb': 'model/gltf-binary' }
const srv = http.createServer((q, r) => {
  let u = decodeURIComponent(q.url.split('?')[0]).replace(/^\/portfolio/, '')
  if (u.endsWith('/')) u += 'index.html'
  const f = path.join(path.resolve(outDir), u)
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); return r.end() } r.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' }); r.end(d) })
}).listen(0, async () => {
  const port = srv.address().port
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] })
  for (const [name, opt, n] of [['d', { viewport: { width: 1280, height: 800 } }, 6], ['m', devices['iPhone 13'], 5]]) {
    const p = await b.newPage(opt); const errs = []
    p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/google|maps|fonts|ERR_|favicon|403|net::/i.test(m.text())) errs.push(m.text()) })
    await p.goto(`http://localhost:${port}/portfolio/${slug}/`, { waitUntil: 'load' }); await p.waitForTimeout(3500)
    const H = await p.evaluate(() => document.documentElement.scrollHeight), ov = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth)
    for (let i = 0; i < n; i++) { await p.evaluate(y => { window.__lenis ? window.__lenis.scrollTo(y, { immediate: true }) : scrollTo(0, y) }, Math.round(H * i / n)); await p.waitForTimeout(1200); await p.screenshot({ path: `${prefix}-${name}${i}.png` }) }
    console.log(name, 'height', H, 'overflowX', ov, 'errors', JSON.stringify(errs.slice(0, 5))); await p.close()
  }
  await b.close(); srv.close()
})
