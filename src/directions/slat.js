// ===========================================================================
// DIRECTION 03: SLAT
// Pencils are made from grooved cedar slats: mill a channel, lay the core,
// glue, cut. This direction takes that as its layout logic, five slats,
// each milled with a groove, crossed by three arguments. Occupied cells are
// toned; empty cells are left open, because absence is information.
// Register: Harvard GSD. Modular, self-reflexive, near-silent.
// ===========================================================================
import { s, label, kindGlyph, THEME_COLOR, hexagon, elbow, wrap } from '../svg.js'
import { LAYERS, NODES, LINKS, THEMES } from '../model.js'

const M = { l: 268, t: 150 }
const COL_W = 392, COL_G = 28
const ROW_H = 128, ROW_G = 6
const THEME_IDS = ['erase', 'port', 'afford']

const colX = i => M.l + i * (COL_W + COL_G)
const rowY = i => M.t + i * (ROW_H + ROW_G)
const TOTAL_W = 3 * COL_W + 2 * COL_G
const TOTAL_H = 5 * ROW_H + 4 * ROW_G

export function render(g, ctx) {
  const { spec, state } = ctx
  const W = spec.weight, INK = spec.ink
  const positions = {}

  // ------------------------------------------------------- construction grid
  if (state.grid) {
    const c = s('g', { class: 'constructor' })
    for (let i = 0; i <= 24; i++) {
      const x = M.l + (TOTAL_W / 24) * i
      c.appendChild(s('line', { x1: x, y1: M.t, x2: x, y2: M.t + TOTAL_H }))
    }
    for (let i = 0; i <= 20; i++) {
      const y = M.t + (TOTAL_H / 20) * i
      c.appendChild(s('line', { x1: M.l, y1: y, x2: M.l + TOTAL_W, y2: y }))
    }
    c.appendChild(s('text', { x: M.l, y: M.t - 84, class: 'constructor-txt',
      text: `module ${(TOTAL_W / 24).toFixed(1)} × ${(TOTAL_H / 20).toFixed(1)} · 8 × 4 per cell · gutter ${COL_G}` }))
    g.appendChild(c)
  }

  // ------------------------------------------------------------- the slats
  // Each row is a length of cedar, milled with the groove that takes the core.
  LAYERS.forEach((layer, ri) => {
    const y = rowY(ri)
    const band = s('g')
    g.appendChild(band)

    band.appendChild(s('rect', { x: 64, y, width: 140 + TOTAL_W + (M.l - 204), height: ROW_H,
      fill: 'var(--cedar)', opacity: (spec.tone * 0.34).toFixed(3) }))
    band.appendChild(s('line', { x1: 64, y1: y, x2: M.l + TOTAL_W, y2: y,
      stroke: 'var(--graphite)', 'stroke-width': 0.9, opacity: INK * 0.85 }))
    // the milled groove, running the length of the slat
    band.appendChild(s('line', { x1: 64, y1: y + ROW_H - 26, x2: M.l + TOTAL_W, y2: y + ROW_H - 26,
      stroke: 'var(--graphite)', 'stroke-width': 0.55, opacity: INK * 0.22, 'stroke-dasharray': '1 6' }))

    // the core seated in the groove, a short graphite segment in the margin
    band.appendChild(s('rect', { x: 64, y: y + ROW_H - 28.5, width: 140, height: 5,
      fill: 'var(--graphite)', opacity: INK * (ri === 0 ? 0.9 : 0.2) }))

    // identification: hexagonal plug + name
    band.appendChild(s('polygon', { points: hexagon(96, y + 30, 15, false),
      fill: layer.color, opacity: (spec.tone * 2.6).toFixed(3),
      stroke: 'var(--graphite)', 'stroke-width': 0.9 }))
    band.appendChild(s('text', { x: 96, y: y + 34, class: 't-num', 'text-anchor': 'middle',
      text: String(ri + 1) }))
    band.appendChild(s('text', { x: 122, y: y + 24, class: 't-layer', text: layer.name }))
    band.appendChild(s('text', { x: 122, y: y + 44, class: 't-role', text: layer.role }))
    band.appendChild(s('text', { x: 122, y: y + 62, class: 't-micro', text: layer.material }))

    // row tally in the far margin
    const count = NODES.filter(n => n.layer === layer.id && n.tier <= spec.detail).length
    band.appendChild(s('text', { x: M.l + TOTAL_W + 22, y: y + 24, class: 't-num',
      text: String(count).padStart(2, '0') }))
  })

  g.appendChild(s('line', { x1: 64, y1: M.t + TOTAL_H, x2: M.l + TOTAL_W, y2: M.t + TOTAL_H,
    stroke: 'var(--graphite)', 'stroke-width': 0.9, opacity: INK * 0.85 }))

  // ------------------------------------------------------------ column heads
  THEME_IDS.forEach((tid, ci) => {
    const th = THEMES[tid]
    const x = colX(ci)
    const on = !state.theme || state.theme === tid
    const grp = s('g', { opacity: on ? 1 : 0.22 })

    grp.appendChild(s('rect', { x, y: M.t - 60, width: 12, height: 12, fill: THEME_COLOR[tid] }))
    grp.appendChild(s('rect', { x, y: M.t - 60, width: 12, height: 12,
      fill: 'none', stroke: 'var(--graphite)', 'stroke-width': 0.8 }))
    grp.appendChild(s('text', { x: x + 24, y: M.t - 49, class: 't-role', text: th.label }))
    grp.appendChild(s('text', { x: x + COL_W, y: M.t - 49, class: 't-num',
      'text-anchor': 'end', text: `0${ci + 1}` }))
    grp.appendChild(s('text', { x, y: M.t - 28, class: 't-micro', text: th.blurb }))
    grp.appendChild(s('line', { x1: x, y1: M.t - 16, x2: x + COL_W, y2: M.t - 16,
      stroke: 'var(--graphite)', 'stroke-width': 1.2 }))
    g.appendChild(grp)
  })

  // ---------------------------------------------------------------- the cells
  LAYERS.forEach((layer, ri) => {
    const y = rowY(ri)
    THEME_IDS.forEach((tid, ci) => {
      const x = colX(ci)
      const cell = NODES.filter(n => n.layer === layer.id && n.theme === tid && n.tier <= spec.detail)
      const on = !state.theme || state.theme === tid
      const grp = s('g')
      g.appendChild(grp)

      if (!cell.length) return

      // occupied cells carry tone, the matrix reads as a density map
      const contentH = cell.reduce((h, n) => h + wrap(n.label, 38).length * 15 + 26, 0) - 4
      grp.appendChild(s('rect', { x: x - 10, y: y + 14, width: COL_W, height: contentH,
        fill: 'var(--graphite)', opacity: on ? (spec.tone * 0.13).toFixed(3) : 0.01 }))

      let ny = y + 34
      cell.forEach(n => {
        const hot = state.active === n.id || state.pinned === n.id
        const ng = s('g', { class: 'node' + (on ? '' : ' dim') + (hot ? ' hot' : ''), 'data-node': n.id })
        ng.appendChild(kindGlyph(n.kind, x + 8, ny - 4, 4.5, hot ? 'var(--accent)' : 'var(--graphite)'))
        const lab = label(n.label, x + 26, ny, { maxChars: 38, lh: 15 })
        ng.appendChild(lab.el)
        ng.appendChild(s('rect', { class: 'hit', x: x - 10, y: ny - 18, width: COL_W, height: lab.height + 16 }))
        if (hot) ng.appendChild(s('rect', { x: x - 10, y: ny - 18, width: COL_W, height: lab.height + 16,
          fill: 'none', stroke: 'var(--accent)', 'stroke-width': 1 }))
        positions[n.id] = [x + 8, ny - 4]
        grp.appendChild(ng)
        ny += lab.height + 26
      })
    })
  })

  // ---------------------------------------------------------------- links
  // Routed in the gutters between columns, never across a cell.
  const GUTTERS = [M.l - 22, colX(1) - COL_G / 2, colX(2) - COL_G / 2, M.l + TOTAL_W + 44]
  const lg = s('g', { class: 'links' })
  g.insertBefore(lg, g.firstChild)
  LINKS.filter(l => l.tier <= spec.detail).forEach((l, i) => {
    const a = positions[l.from], b = positions[l.to]
    if (!a || !b) return
    const on = !state.theme ||
      (NODES.find(n => n.id === l.from)?.theme === state.theme &&
       NODES.find(n => n.id === l.to)?.theme === state.theme)
    // pick the nearest gutter to the left of the leftmost endpoint
    const leftmost = Math.min(a[0], b[0])
    let gut = GUTTERS[0]
    for (const gx of GUTTERS) if (gx < leftmost - 8 && gx > gut) gut = gx
    lg.appendChild(s('path', {
      class: `link ${l.kind}` + (on ? '' : ' dim'),
      d: elbow(a[0], a[1], b[0], b[1], gut - (i % 3) * 4),
      'stroke-width': (0.7 * W).toFixed(2), opacity: INK * 0.4,
    }))
  })

  // ---------------------------------------------------------------- footer
  const shown = NODES.filter(n => n.tier <= spec.detail).length
  const foot = s('g', { opacity: INK })
  foot.appendChild(s('text', { x: 64, y: M.t + TOTAL_H + 30, class: 't-micro',
    text: `${shown} nodes · 5 slats × 3 arguments · tier ${spec.detail} of 3` }))
  foot.appendChild(s('text', { x: M.l + TOTAL_W, y: M.t + TOTAL_H + 30, class: 't-micro',
    'text-anchor': 'end', text: 'Plate 03 / Slat' }))
  g.appendChild(foot)

  return { positions }
}

export const meta = {
  viewBox: '0 0 1600 940',
  caption: 'Construction grid. Five milled slats crossed by three arguments.',
}
