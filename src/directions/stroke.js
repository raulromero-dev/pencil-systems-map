// ===========================================================================
// DIRECTION 02: STROKE
// The map drawn the way a drawing is made: five passes of the hand, fanned
// from the point of the instrument. Tone accumulates where passes cross;
// nodes sit on the strokes; consequences hatch off perpendicular.
// Register: the sketchbook. Gesture before geometry.
// ===========================================================================
import { s, label, kindGlyph, rng, wrap } from '../svg.js'
import { LAYERS, NODES, LINKS, GRADES } from '../model.js'

const O = [530, 498]                          // the point, origin of every pass
const ROW_Y = [172, 390, 606, 824]


// Measured off the trimmed photograph, which is cropped to the pencil body so
// no cast shadow inflates it. The three core attributes are stamped into the
// barrel in the photograph itself, not drawn over it: they are properties the
// object has, so they belong to the object. The imprint occupies 0.086..0.779
// of the width and its cap height is 0.222 of the height, which is what sets
// the drawn size and how far the pencil may bleed off the left edge.
const PENCIL = { src: '/assets/pencil.png', aspect: 15.242, tx: 0.9980, ty: 0.4848 }

// The grade dial lives on the instrument, not in a panel. Hardness is a
// property of the pencil, so you set it at the pencil.
export const GRADE_TRACK = { x0: 34, x1: 470, y: 606 }

// One pass per sub-system, read down the page in the order the argument runs:
// the material fact first, what the culture kept last. Weight increases with
// depth, so the accumulated end of the story carries the most graphite.
const ORDER = ['material', 'practice', 'institutions', 'legacy']

// Nodes spread evenly along their own pass, so a pass with three sits as
// comfortably as one with ten.
function tAt(i, n) { return n < 2 ? 0.5 : 0.15 + 0.78 * (i / (n - 1)) }

export function render(g, ctx) {
  const { spec, state, svg } = ctx
  const W = spec.weight, INK = spec.ink
  // The plate is as wide as the window, so the pencil is clipped at the left
  // margin instead of floating inside a letterbox. Everything anchored to the
  // right edge follows the plate's width rather than a fixed number.
  const END_X = (ctx.vw ?? 1600) - 268

  const measure = s('path', { fill: 'none', stroke: 'none' })
  svg.appendChild(measure)

  const positions = {}
  const passes = []

  // ------------------------------------------------------------- the point
  // A photographed pencil, its graphite tip registered to the fan origin so
  // every pass genuinely leaves the point.
  const PW = 560                                   // drawn width; runs off the left edge
  const PH = PW / PENCIL.aspect
  const tip = s('g', { class: 'pencil-photo' })
  tip.appendChild(s('image', {
    href: (state.mode === 'graphite' ? ctx.assets?.pencilHard : ctx.assets?.pencil) || PENCIL.src,
    x: (O[0] - PENCIL.tx * PW).toFixed(1),
    y: (O[1] - PENCIL.ty * PH).toFixed(1),
    width: PW.toFixed(1), height: PH.toFixed(1),
    preserveAspectRatio: 'xMidYMid meet',
  }))
  g.appendChild(tip)

  // ------------------------------------------------------------- grade dial
  const { x0, x1, y: gy } = GRADE_TRACK
  const gi = GRADES.indexOf(spec.label)
  const gt = gi / (GRADES.length - 1)
  const gx = x0 + (x1 - x0) * gt
  const dial = s('g', { class: 'dial' })

  // the track is a sharpened profile: pale and thin at 9H, black and broad at 9B
  dial.appendChild(s('path', {
    d: `M${x0},${gy - 1.4} L${x1},${gy - 7} L${x1},${gy + 7} L${x0},${gy + 1.4} Z`,
    fill: 'var(--graphite)', opacity: 0.16,
  }))
  dial.appendChild(s('path', {
    d: `M${x0},${gy - 1.4} L${gx},${gy - 1.4 - 5.6 * gt} L${gx},${gy + 1.4 + 5.6 * gt} L${x0},${gy + 1.4} Z`,
    fill: 'var(--graphite)', opacity: 0.82,
  }))
  GRADES.forEach((_, i) => {
    const tx2 = x0 + (x1 - x0) * (i / (GRADES.length - 1))
    dial.appendChild(s('line', { x1: tx2, y1: gy + 11, x2: tx2, y2: gy + (i === gi ? 16 : 13.5),
      stroke: 'var(--graphite)', 'stroke-width': 0.7, opacity: i === gi ? 0.9 : 0.3 }))
  })
  dial.appendChild(s('line', { x1: gx, y1: gy - 13, x2: gx, y2: gy + 13,
    stroke: 'var(--accent)', 'stroke-width': 2 }))

  dial.appendChild(s('text', { x: x0, y: gy - 22, class: 't-role', text: spec.label }))
  dial.appendChild(s('text', { x: x1, y: gy - 22, class: 't-micro', 'text-anchor': 'end',
    text: spec.detail === 1 ? 'construction only'
        : spec.detail === 2 ? 'primary + relations' : 'full resolution' }))
  dial.appendChild(s('text', { x: x0, y: gy + 30, class: 't-micro', text: '9H' }))
  dial.appendChild(s('text', { x: x1, y: gy + 30, class: 't-micro', 'text-anchor': 'end', text: '9B' }))

  // one wide hit area, dragging anywhere along it sets the grade
  dial.appendChild(s('rect', { 'data-grade': '1', x: x0 - 16, y: gy - 34, width: x1 - x0 + 32, height: 68,
    fill: 'transparent', style: 'cursor:ew-resize' }))
  g.appendChild(dial)

  // ------------------------------------------------------------- the passes
  ORDER.forEach((layerId, r) => {
    const layer = LAYERS.find(l => l.id === layerId)
    const y1 = ROW_Y[r]
    const bow = (r - 2) * 30
    const d = `M${O[0]},${O[1]} C${O[0] + 300},${O[1] + (y1 - O[1]) * 0.12 - bow * 0.5} ` +
              `${END_X - 500},${y1 + bow * 0.34} ${END_X},${y1}`
    measure.setAttribute('d', d)
    passes.push({ d, y1, layer, r })

    const depth = 0.46 + (r / (ORDER.length - 1)) * 0.54
    const base = (3.2 + r * 1.25) * W
    // tapers to nothing at both ends, a stroke laid down and lifted
    const widthAt = t => base * (0.03 + 0.97 * Math.pow(Math.sin(Math.PI * t), 0.55))
    const outline = ribbonOf(measure, widthAt)

    const grp = s('g')
    g.appendChild(grp)
    grp.appendChild(s('path', { d: outline, fill: 'var(--graphite)',
      opacity: (INK * depth * 0.8).toFixed(3), filter: 'url(#tooth)' }))
    grp.appendChild(s('path', { d: outline, fill: 'url(#grain)',
      opacity: (spec.grain * depth).toFixed(3) }))

    grp.appendChild(s('text', { x: END_X + 20, y: y1 - 4, class: 't-layer', text: layer.name }))
    grp.appendChild(s('text', { x: END_X + 20, y: y1 + 15, class: 't-micro', text: layer.role }))
  })

  // ------------------------------------------------- tone between the passes
  if (spec.detail >= 2) {
    const rand = rng(23)
    const hg = s('g')
    g.insertBefore(hg, g.firstChild)
    for (let r = 0; r < ORDER.length - 1; r++) {
      const n = Math.round(5 + spec.t * 22)
      for (let i = 0; i < n; i++) {
        const t = 0.2 + rand() * 0.72
        const x = O[0] + (END_X - O[0]) * t
        const ya = ROW_Y[r] * t + O[1] * (1 - t)
        const yb = ROW_Y[r + 1] * t + O[1] * (1 - t)
        const len = 10 + rand() * 30
        const mid = ya + (yb - ya) * (0.18 + rand() * 0.64)
        hg.appendChild(s('line', {
          x1: x - len, y1: mid - len * 0.4, x2: x + len, y2: mid + len * 0.4,
          stroke: 'var(--graphite)', 'stroke-width': (0.5 * W).toFixed(2),
          opacity: (spec.tone * 0.45).toFixed(3), 'stroke-linecap': 'round',
        }))
      }
    }
  }

  // -------------------------------------------------------------- the nodes
  // Placed first, then relaxed apart, then drawn. A fan converges at the
  // origin, so without a de-collision pass the near labels always stack.
  const placed = []
  passes.forEach(({ d, layer, r }) => {
    measure.setAttribute('d', d)
    const L = measure.getTotalLength()
    const list = NODES.filter(n => n.layer === layer.id && n.tier <= spec.detail)
    list.forEach((n, i) => {
      const t = tAt(i, list.length)
      const p = measure.getPointAtLength(t * L)
      const q = measure.getPointAtLength(Math.min(L, t * L + 2))
      const ang = Math.atan2(q.y - p.y, q.x - p.x) + Math.PI / 2
      const up = i % 2 === 0 ? -1 : 1
      const reach = (i % 2 ? 68 : 94) + (r % 2 ? 18 : 0)
      const lines = wrap(n.label, 17).length

      placed.push({
        n, up,
        px: p.x, py: p.y,
        tx: p.x + Math.cos(ang) * reach * up,
        ty: p.y + Math.sin(ang) * reach * up,
        w: 172, h: lines * 17 + 14, lines,
      })
    })
  })
  relax(placed)

  placed.forEach(({ n, up, px, py, tx, ty, lines }) => {
    const hot = state.active === n.id || state.pinned === n.id
    const grp = s('g', { class: 'node' + (hot ? ' hot' : ''), 'data-node': n.id })

    grp.appendChild(s('line', { x1: px, y1: py, x2: tx, y2: ty,
      stroke: hot ? 'var(--accent)' : 'var(--graphite)',
      'stroke-width': (0.85 * W).toFixed(2), opacity: INK * 0.75 }))
    grp.appendChild(kindGlyph(n.kind, tx, ty, 4, hot ? 'var(--accent)' : 'var(--graphite)'))

    const top = ty - (lines - 1) * 8.5
    const lab = label(n.label, tx + 14, top - 2, { maxChars: 17, lh: 17 })
    grp.appendChild(lab.el)
    grp.appendChild(s('rect', { class: 'hit', x: tx - 14, y: top - 20, width: 190, height: lines * 17 + 30 }))

    positions[n.id] = [tx, ty]
    g.appendChild(grp)
  })

  // -------------------------------------------------------------- the links
  const lg = s('g', { class: 'links' })
  g.insertBefore(lg, g.firstChild)
  LINKS.filter(l => l.tier <= spec.detail).forEach(l => {
    const a = positions[l.from], b = positions[l.to]
    if (!a || !b) return
    const mx = (a[0] + b[0]) / 2
    lg.appendChild(s('path', {
      class: `link ${l.kind}`,
      d: `M${a[0]},${a[1]} C${mx},${a[1]} ${mx},${b[1]} ${b[0]},${b[1]}`,
      'stroke-width': (1.25 * W).toFixed(2), opacity: INK * 0.52,
    }))
  })

  // ------------------------------------------------------------ construction
  if (state.grid) {
    const c = s('g', { class: 'constructor' })
    c.appendChild(s('circle', { cx: O[0], cy: O[1], r: 6 }))
    ROW_Y.forEach((y, i) => {
      c.appendChild(s('line', { x1: O[0], y1: O[1], x2: END_X, y2: y, 'stroke-dasharray': '2 6' }))
      c.appendChild(s('text', { x: END_X - 52, y: y - 8, class: 'constructor-txt', text: `θ${i}` }))
    })
    for (let i = 0; i < 6; i++) {
      const tv = tAt(i, 6)
      const x = O[0] + (END_X - O[0]) * tv
      c.appendChild(s('line', { x1: x, y1: 96, x2: x, y2: 890, 'stroke-dasharray': '2 7' }))
      c.appendChild(s('text', { x: x + 5, y: 104, class: 'constructor-txt', text: `t=${tv.toFixed(2)}` }))
    }
    g.appendChild(c)
  }

  measure.remove()
  return { positions }
}

// Push overlapping label boxes apart vertically. A few passes is plenty: // this is a legibility fix, not a layout solver.
function relax(items, passes = 60) {
  for (let k = 0; k < passes; k++) {
    let moved = false
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const a = items[i], b = items[j]
        const dx = Math.abs(a.tx - b.tx), dy = Math.abs(a.ty - b.ty)
        const needX = (a.w + b.w) / 2, needY = (a.h + b.h) / 2 + 8
        if (dx >= needX || dy >= needY) continue
        const push = (needY - dy) / 2 + 0.5
        const dir = a.ty <= b.ty ? -1 : 1
        a.ty += push * dir
        b.ty -= push * dir
        moved = true
      }
    }
    if (!moved) break
  }
  // keep everything inside the plate
  for (const it of items) it.ty = Math.max(112, Math.min(872, it.ty))
}

// Local ribbon builder, kept here so the width profile stays with the pass.
function ribbonOf(pathEl, widthAt, steps = 130) {
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
  return 'M' + top.concat(bot).map(p => `${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(' L') + ' Z'
}

export const meta = {
  viewBox: '0 0 1600 940',
  caption: 'Tonal build-up. Each layer is one pass of the hand.',
}
