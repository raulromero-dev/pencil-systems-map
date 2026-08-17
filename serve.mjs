// Zero-dependency static server. ESM modules need an origin, so: node serve.mjs
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'

const ROOT = new URL('.', import.meta.url).pathname
const PORT = process.env.PORT || 5178

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.png': 'image/png',
}

createServer(async (req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0])
  // extensionless paths are routes (/sheet, /map), so hand back the shell
  const isRoute = url === '/' || !extname(url)
  const rel = normalize(isRoute ? '/index.html' : url).replace(/^(\.\.[/\\])+/, '')
  const file = join(ROOT, rel)
  try {
    const body = await readFile(file)
    res.writeHead(200, {
      'content-type': TYPES[extname(file)] || 'application/octet-stream',
      'cache-control': 'no-store',
    })
    res.end(body)
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain' })
    res.end('404 ' + rel)
  }
}).listen(PORT, () => {
  console.log(`\n  Pencil systems map → http://localhost:${PORT}\n`)
})
