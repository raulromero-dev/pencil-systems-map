// Tiny SVG/DOM helpers + geometry utilities shared by all three directions.
export const NS = 'http://www.w3.org/2000/svg'

export function s(tag, attrs = {}, kids = []) {
  const n = document.createElementNS(NS, tag)
  for (const k in attrs) {
    const v = attrs[k]
    if (v === null || v === undefined || v === false) continue
    if (k === 'text') { n.textContent = v; continue }
    n.setAttribute(k, v)
  }
  for (const kid of [].concat(kids)) if (kid) n.appendChild(kid)
  return n
}

export function h(tag, attrs = {}, kids = []) {
  const n = document.createElement(tag)
  for (const k in attrs) {
    const v = attrs[k]
    if (v === null || v === undefined || v === false) continue
    if (k === 'text') { n.textContent = v; continue }
    if (k === 'html') { n.innerHTML = v; continue }
    if (k.startsWith('on')) { n.addEventListener(k.slice(2), v); continue }
    n.setAttribute(k, v)
  }
  for (const kid of [].concat(kids)) if (kid) n.appendChild(kid)
  return n
}

export function clear(node) { while (node.firstChild) node.removeChild(node.firstChild) }

// --- geometry -------------------------------------------------------------

export const lerp = (a, b, t) => a + (b - a) * t
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v))

// Deterministic pseudo-random so redraws don't jitter.
export function rng(seed) {
  let x = seed * 9301 + 49297
  return () => { x = (x * 9301 + 49297) % 233280; return x / 233280 }
}

// Orthogonal elbow route between two points, routed through a gutter.
export function elbow(x1, y1, x2, y2, gutter) {
  const gx = gutter ?? (x1 + x2) / 2
  return `M${x1},${y1} L${gx},${y1} L${gx},${y2} L${x2},${y2}`
}

// Smooth S-curve between two points.
export function curve(x1, y1, x2, y2, bow = 0.5) {
  const dx = (x2 - x1) * bow
  return `M${x1},${y1} C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`
}

// Build a closed variable-width outline from a centerline path element.
// widthAt(t) → half-width in user units. Returns a path `d` string.
export function ribbon(pathEl, widthAt, steps = 96) {
  const L = pathEl.getTotalLength()
  const top = [], bot = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const p = pathEl.getPointAtLength(t * L)
    const q = pathEl.getPointAtLength(Math.min(L, t * L + 0.6))
    const a = Math.atan2(q.y - p.y, q.x - p.x) + Math.PI / 2
    const w = widthAt(t)
    top.push([p.x + Math.cos(a) * w, p.y + Math.sin(a) * w])
    bot.push([p.x - Math.cos(a) * w, p.y - Math.sin(a) * w])
  }
  bot.reverse()
  const pts = top.concat(bot)
  return 'M' + pts.map(p => `${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(' L') + ' Z'
}

// Greedy word wrap for SVG <text>; returns an array of lines.
export function wrap(str, maxChars) {
  const words = str.split(/\s+/)
  const lines = []
  let line = ''
  for (const w of words) {
    if (!line.length) { line = w; continue }
    if ((line + ' ' + w).length <= maxChars) line += ' ' + w
    else { lines.push(line); line = w }
  }
  if (line) lines.push(line)
  return lines
}

// Render wrapped label lines as a <text> with <tspan>s.
export function label(str, x, y, { cls = 't-label', maxChars = 26, lh = 15, anchor = 'start' } = {}) {
  const lines = wrap(str, maxChars)
  const t = s('text', { x, y, class: cls, 'text-anchor': anchor })
  lines.forEach((ln, i) => t.appendChild(s('tspan', { x, y: y + i * lh, text: ln })))
  return { el: t, lines: lines.length, height: lines.length * lh }
}

// Attribute to the material that carries it: rubber, cedar, lacquer.
export const THEME_COLOR = {
  erase:  'var(--eraser)',
  port:   'var(--cedar)',
  afford: 'var(--lacquer)',
}

// Kind → a small glyph. mechanism = solid block, outcome = ring, constraint = slash.
export function kindGlyph(kind, x, y, r = 4.5, fill = 'var(--graphite)') {
  if (kind === 'mechanism') return s('rect', { x: x - r, y: y - r, width: r * 2, height: r * 2, fill })
  if (kind === 'outcome')   return s('circle', { cx: x, cy: y, r, fill: 'none', stroke: fill, 'stroke-width': 1.4 })
  return s('path', { d: `M${x - r},${y + r} L${x + r},${y - r}`, stroke: fill, 'stroke-width': 1.6, fill: 'none' })
}

// A regular hexagon centered at cx,cy, the pencil's plan section.
// `flat` = flat-top orientation.
export function hexagon(cx, cy, r, flat = true) {
  const pts = []
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i + (flat ? 0 : Math.PI / 6)
    pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`)
  }
  return pts.join(' ')
}

// --- icons ----------------------------------------------------------------
// Drawn rather than typed, so they inherit currentColor and stay crisp.

// A block eraser, tilted as if in use, with the band across its waist.
export function iconEraser(size = 22) {
  return s('svg', { viewBox: '0 0 22 22', width: size, height: size, 'aria-hidden': 'true' }, [
    s('g', { transform: 'rotate(-32 11 11)', fill: 'none', stroke: 'currentColor',
             'stroke-width': 1.5, 'stroke-linejoin': 'round' }, [
      s('rect', { x: 3.5, y: 7, width: 15, height: 8, rx: 1.6 }),
      s('line', { x1: 9.4, y1: 7, x2: 9.4, y2: 15 }),
    ]),
  ])
}

// A sheet balled up. Closing a note is not erasing its content, it is
// scrapping the page it was written on. Irregular hull plus interior facets,
// because a crumpled ball is all creases and no smooth curves.
export function iconScrap(size = 20) {
  const hull = 'M9.9 2.1 L13.2 2.9 L15.7 5.1 L17.7 8.0 L16.6 11.2 L17.5 14.1 ' +
               'L13.9 16.7 L10.1 17.8 L6.3 16.3 L3.1 13.7 L2.3 9.7 L4.3 6.1 Z'
  const creases = [
    'M6.5 3.5 L8.9 8.3 L5.9 10.7',
    'M8.9 8.3 L13.5 6.3',
    'M8.9 8.3 L12.3 11.9 L10.1 17.8',
    'M12.3 11.9 L16.6 11.2',
    'M5.9 10.7 L3.1 13.7',
    'M12.3 11.9 L13.9 16.7',
  ]
  return s('svg', { viewBox: '0 0 20 20', width: size, height: size, 'aria-hidden': 'true' }, [
    s('path', { d: hull, fill: 'none', stroke: 'currentColor', 'stroke-width': 1.3,
                'stroke-linejoin': 'round' }),
    s('g', { fill: 'none', stroke: 'currentColor', 'stroke-width': 0.95,
             'stroke-linejoin': 'round', 'stroke-linecap': 'round', opacity: 0.85 },
      creases.map(d => s('path', { d }))),
  ])
}

// The two grounds: a blank sheet, and the same sheet filled with graphite.
export function iconPaper(size = 15) {
  return s('svg', { viewBox: '0 0 18 18', width: size, height: size, 'aria-hidden': 'true' }, [
    s('rect', { x: 3.6, y: 2.4, width: 10.8, height: 13.2, rx: 1,
                fill: 'none', stroke: 'currentColor', 'stroke-width': 1.4 }),
  ])
}

export function iconGraphite(size = 15) {
  return s('svg', { viewBox: '0 0 18 18', width: size, height: size, 'aria-hidden': 'true' }, [
    s('rect', { x: 3.6, y: 2.4, width: 10.8, height: 13.2, rx: 1,
                fill: 'currentColor', stroke: 'currentColor', 'stroke-width': 1.4 }),
  ])
}

// The masthead mark, still a 3x3 field of squares but now reading left to
// right the way the object does: eraser, ferrule, body. Built once and used on
// both the sheet and the map, so the two cannot drift apart.
// e = eraser, b = body. The eraser cell flips with the ground, so it reads as
// eraser-then-pencil on paper and on graphite alike.
export const MARK_CELLS = ['e', 'b', 'b', 'e', 'b', 'b', 'e', 'b', 'b']
export function constructionMark() {
  return h('div', { class: 'module', 'aria-hidden': 'true' },
    MARK_CELLS.map(c => h('i', { class: c })))
}
