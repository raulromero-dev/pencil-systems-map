// ===========================================================================
// DIRECTION 01: SECTION
// A pencil is 27:1. Drawn whole it is always a thin ribbon, so this uses the
// drafting convention instead: an enlarged DETAIL with break lines, plus a
// key showing which part of the object is enlarged.
// The detail is opened on two axes, axially (eraser · ferrule pulled off the
// end) and radially (lacquer peeled, casing split, core slid out). Dashed
// explode axes hold the pieces together as one object.
// Register: exploded assembly drawing / parts catalogue.
// ===========================================================================
import { s, label, kindGlyph, THEME_COLOR } from '../svg.js'
import { LAYERS, NODES, LINKS } from '../model.js'

const AX = 252                                    // assembly centreline
const COLS = [104, 400, 696, 992, 1288]           // physical order, L→R
const COL_W = 244
const HEAD_Y = 466
const ROW_TOP = 508

// Column order follows the drawing, so no leader ever crosses another.
const ORDER = ['eraser', 'ferrule', 'lacquer', 'casing', 'core']
const ANCHOR = {
  eraser:  [196, 310],
  ferrule: [347, 316],
  lacquer: [620, 384],
  casing:  [840, 342],
  core:    [1140, 266],
}

// Break symbol: a torn edge meaning "the object continues".
// Small amplitude, many teeth, a chevron here would read as a sharpened point.
function breakEdge(x, y0, y1) {
  const n = Math.max(4, Math.round((y1 - y0) / 8))
  let d = `L${x},${y0}`
  for (let i = 1; i <= n; i++) {
    d += ` L${x + (i % 2 ? 5 : -4)},${(y0 + (y1 - y0) * i / n).toFixed(1)}`
  }
  return d + ` L${x},${y1}`
}

export function render(g, ctx) {
  const { spec, state } = ctx
  const W = spec.weight, INK = spec.ink
  const edge = { stroke: 'var(--graphite)', 'stroke-width': (0.9 * W).toFixed(2), fill: 'none', opacity: INK }
  const fill = (c, k) => ({ fill: c, opacity: (spec.tone * k).toFixed(3) })

  const draw = s('g')
  g.appendChild(draw)

  // Explode axes are added last, over the pieces, see end of function.
  const axes = s('g')

  // ------------------------------------------------------------ axial pieces
  // ERASER
  draw.appendChild(s('rect', { x: 132, y: 198, width: 128, height: 108, rx: 10, ...fill('var(--eraser)', 2.0) }))
  draw.appendChild(s('rect', { x: 132, y: 198, width: 128, height: 108, rx: 10, ...edge }))

  // FERRULE, drawn brass, crimped
  draw.appendChild(s('rect', { x: 284, y: 190, width: 126, height: 124, ...fill('var(--brass)', 1.7) }))
  draw.appendChild(s('rect', { x: 284, y: 190, width: 126, height: 124, ...edge }))
  for (let i = 1; i < 5; i++) {
    draw.appendChild(s('line', { x1: 284 + i * 25.2, y1: 190, x2: 284 + i * 25.2, y2: 314,
      stroke: 'var(--graphite)', 'stroke-width': 0.5, opacity: INK * 0.38 }))
  }
  // the single crimp that bites into the wood
  draw.appendChild(s('line', { x1: 284, y1: 302, x2: 410, y2: 302,
    stroke: 'var(--graphite)', 'stroke-width': 0.8, opacity: INK * 0.6 }))

  // ----------------------------------------------------------- radial pieces
  const BX = 436, BE = 1046
  const P = {
    lacTop: `M${BX},128 L${BE},128 ${breakEdge(BE, 128, 146)} L${BX},146 Z`,
    casTop: `M${BX},170 L${BE},170 ${breakEdge(BE, 170, 224)} L${BX},224 Z`,
    casBot: `M${BX},280 L${BE},280 ${breakEdge(BE, 280, 334)} L${BX},334 Z`,
    lacBot: `M${BX},358 L${BE},358 ${breakEdge(BE, 358, 376)} L${BX},376 Z`,
  }
  for (const k of ['lacTop', 'lacBot']) {
    draw.appendChild(s('path', { d: P[k], ...fill('var(--lacquer)', 1.25) }))
    draw.appendChild(s('path', { d: P[k], ...edge }))
  }
  for (const k of ['casTop', 'casBot']) {
    draw.appendChild(s('path', { d: P[k], ...fill('var(--cedar)', 1.4) }))
    draw.appendChild(s('path', { d: P[k], ...edge }))
  }
  // the hexagonal barrel, seen split, one facet line per half
  for (const y of [192, 312]) {
    draw.appendChild(s('line', { x1: BX, y1: y, x2: BE - 4, y2: y,
      stroke: 'var(--graphite)', 'stroke-width': 0.5, opacity: INK * 0.34 }))
  }
  // cedar grain, restrained, denser as the grade softens
  const grains = Math.round(1 + spec.t * 2)
  for (let i = 0; i < grains; i++) {
    const o = (i + 1) / (grains + 1)
    for (const [y0, y1] of [[174, 220], [284, 330]]) {
      const y = y0 + (y1 - y0) * o
      draw.appendChild(s('path', {
        d: `M${BX + 14},${y} C640,${y - 2.2} 830,${y + 2.4} ${BE - 14},${y}`,
        stroke: 'var(--cedar)', 'stroke-width': 0.5, fill: 'none', opacity: INK * 0.3,
      }))
    }
  }

  // CORE, slid clear of the casing, the only piece in true graphite
  const core = `M${BX},238 L1046,239.5 L1198,251 L1206,252 L1198,253 L1046,264.5 L${BX},266 Z`
  draw.appendChild(s('path', { d: core, fill: 'var(--graphite)', opacity: INK * 0.94 }))
  draw.appendChild(s('path', { d: core, fill: 'url(#grain)', opacity: spec.grain * 0.7 }))
  draw.appendChild(s('text', { x: BX + 8, y: 232, class: 't-micro', text: 'slid clear' }))

  // explode axes drawn over everything, as on a real exploded plate
  for (const x of [520, 720, 920]) {
    axes.appendChild(s('line', { x1: x, y1: 108, x2: x, y2: 398,
      stroke: 'var(--graphite)', 'stroke-width': 0.85, 'stroke-dasharray': '4 5', opacity: INK * 0.8 }))
  }
  axes.appendChild(s('line', { x1: 118, y1: AX, x2: 1200, y2: AX,
    stroke: 'var(--graphite)', 'stroke-width': 0.85, 'stroke-dasharray': '18 4 3 4', opacity: INK * 0.8 }))
  draw.appendChild(axes)

  // ------------------------------------------------------------------- key
  // The whole object at 1:1, with the enlarged window marked. A drawing that
  // states its own scale.
  const kx = 1268, ky = 132
  const key = s('g', { opacity: INK * 0.9 })
  key.appendChild(s('path', {
    d: `M${kx},${ky} L${kx + 132},${ky} L${kx + 158},${ky + 7} L${kx + 132},${ky + 14} L${kx},${ky + 14} Z`,
    fill: 'none', stroke: 'var(--graphite)', 'stroke-width': 0.9,
  }))
  key.appendChild(s('rect', { x: kx - 3, y: ky - 7, width: 46, height: 28,
    fill: 'none', stroke: 'var(--accent)', 'stroke-width': 1 }))
  key.appendChild(s('text', { x: kx - 3, y: ky - 13, class: 't-micro', fill: 'var(--accent)', text: 'A' }))
  key.appendChild(s('text', { x: kx, y: ky + 34, class: 't-micro', text: 'Whole · 1:1' }))
  key.appendChild(s('text', { x: kx, y: ky + 48, class: 't-micro', text: 'Detail A · 4:1' }))
  draw.appendChild(key)

  // ------------------------------------------------------ construction notes
  if (state.grid) {
    const c = s('g', { class: 'constructor' })
    const dim = (x1, x2, y, txt) => {
      c.appendChild(s('line', { x1, y1: y, x2, y2: y }))
      c.appendChild(s('line', { x1, y1: y - 5, x2: x1, y2: y + 5 }))
      c.appendChild(s('line', { x1: x2, y1: y - 5, x2, y2: y + 5 }))
      c.appendChild(s('text', { x: (x1 + x2) / 2, y: y - 7, class: 'constructor-txt',
        'text-anchor': 'middle', text: txt }))
    }
    dim(132, 260, 416, 'Eraser')
    dim(284, 410, 416, 'Ferrule')
    dim(436, 1046, 434, 'Body')
    dim(436, 1182, 452, 'Core')
    for (const k of ORDER) c.appendChild(s('circle', { cx: ANCHOR[k][0], cy: ANCHOR[k][1], r: 3.4 }))
    c.appendChild(s('text', { x: 104, y: 120, class: 'constructor-txt',
      text: 'radial explode 24 · axial explode 26 · break at 1046' }))
    g.appendChild(c)
  }

  // ---------------------------------------------------------------- columns
  const positions = {}

  ORDER.forEach((layerId, li) => {
    const layer = LAYERS.find(l => l.id === layerId)
    const cx = COLS[li]
    const [ax, ay] = ANCHOR[layerId]
    const col = s('g')
    g.appendChild(col)

    const bend = 412 + li * 9
    col.appendChild(s('path', {
      d: `M${ax},${ay} L${ax},${bend} L${cx + 4},${bend} L${cx + 4},${HEAD_Y - 14}`,
      fill: 'none', stroke: 'var(--graphite-3)', 'stroke-width': 0.75, opacity: INK * 0.75,
    }))
    col.appendChild(s('circle', { cx: ax, cy: ay, r: 2.6, fill: 'var(--graphite)', opacity: INK }))

    col.appendChild(s('line', { x1: cx, y1: HEAD_Y - 12, x2: cx + COL_W, y2: HEAD_Y - 12,
      stroke: 'var(--graphite)', 'stroke-width': 1.1 }))
    col.appendChild(s('text', { x: cx, y: HEAD_Y + 8, class: 't-layer', text: layer.name }))
    col.appendChild(s('text', { x: cx + COL_W, y: HEAD_Y + 8, class: 't-num',
      'text-anchor': 'end', text: String(layer.idx + 1).padStart(2, '0') }))
    col.appendChild(s('text', { x: cx, y: HEAD_Y + 31, class: 't-role', text: layer.role }))
    col.appendChild(s('text', { x: cx, y: HEAD_Y + 49, class: 't-micro', text: layer.material }))

    let y = ROW_TOP + 34
    NODES.filter(n => n.layer === layer.id && n.tier <= spec.detail).forEach(n => {
      const on = !state.theme || n.theme === state.theme
      const hot = state.active === n.id || state.pinned === n.id
      const grp = s('g', { class: 'node' + (on ? '' : ' dim') + (hot ? ' hot' : ''), 'data-node': n.id })

      grp.appendChild(kindGlyph(n.kind, cx + 7, y - 4, 4.5, hot ? 'var(--accent)' : 'var(--graphite)'))
      grp.appendChild(s('rect', { x: cx + 19, y: y - 11, width: 5, height: 5, fill: THEME_COLOR[n.theme] }))
      const lab = label(n.label, cx + 32, y, { maxChars: 23, lh: 15 })
      grp.appendChild(lab.el)

      const rowH = Math.max(66, lab.height + 48)
      grp.appendChild(s('rect', { class: 'hit', x: cx, y: y - 20, width: COL_W, height: rowH }))
      grp.appendChild(s('line', { x1: cx, y1: y - 20 + rowH, x2: cx + COL_W, y2: y - 20 + rowH,
        stroke: 'var(--rule)', 'stroke-width': 0.7 }))
      if (hot) grp.appendChild(s('rect', { x: cx - 8, y: y - 20, width: COL_W + 8, height: rowH,
        fill: 'none', stroke: 'var(--accent)', 'stroke-width': 1 }))

      positions[n.id] = [cx + 7, y - 4]
      col.appendChild(grp)
      y += rowH
    })
  })

  // ---------------------------------------------------------------- links
  const lg = s('g', { class: 'links' })
  g.insertBefore(lg, g.firstChild)
  LINKS.filter(l => l.tier <= spec.detail).forEach(l => {
    const a = positions[l.from], b = positions[l.to]
    if (!a || !b) return
    const on = !state.theme ||
      (NODES.find(n => n.id === l.from)?.theme === state.theme &&
       NODES.find(n => n.id === l.to)?.theme === state.theme)
    const span = Math.abs(a[0] - b[0])
    const d = span < 4
      ? `M${a[0] - 9},${a[1]} C${a[0] - 26},${a[1]} ${b[0] - 26},${b[1]} ${b[0] - 9},${b[1]}`
      : (() => {
          const dip = Math.max(a[1], b[1]) + Math.min(88, 30 + span * 0.05)
          return `M${a[0]},${a[1]} C${a[0]},${dip} ${b[0]},${dip} ${b[0]},${b[1]}`
        })()
    lg.appendChild(s('path', {
      class: `link ${l.kind}` + (on ? '' : ' dim'), d,
      'stroke-width': (0.75 * W).toFixed(2), opacity: INK * 0.5,
    }))
  })

  // ---------------------------------------------------------- closing rule
  const shown = NODES.filter(n => n.tier <= spec.detail).length
  const rel = LINKS.filter(l => l.tier <= spec.detail).length
  const foot = s('g', { opacity: INK })
  foot.appendChild(s('line', { x1: 104, y1: 832, x2: 1532, y2: 832,
    stroke: 'var(--graphite)', 'stroke-width': 1 }))
  foot.appendChild(s('text', { x: 104, y: 852, class: 't-micro',
    text: `${shown} nodes · ${rel} relations · tier ${spec.detail} of 3` }))
  foot.appendChild(s('text', { x: 1532, y: 852, class: 't-micro', 'text-anchor': 'end',
    text: 'Plate 01 / Section' }))
  g.appendChild(foot)

  return { positions }
}

export const meta = {
  viewBox: '0 0 1600 940',
  caption: 'Enlarged detail with break lines. The instrument opened on two axes.',
}
