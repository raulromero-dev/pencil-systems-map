// ===========================================================================
// DIRECTION, FINAL-2
//
// Given a page that can run below the fold, the compromise that broke every
// earlier version disappears. Nothing is scaled, nothing is hidden behind a
// level-of-detail control, and every node is drawn at full reading size with
// all of its connections: inside its own sub-system and across to the next.
//
// Four sections down the page, each a field of circles with its own internal
// causality drawn, and three hand-offs carrying the argument from one section
// to the next. The instrument sits at the head, drawing into the first.
//
// The grade dial is gone from this view. It existed to trade breadth for
// legibility on a single screen, and a scrolling page does not need the trade.
// Ink is held at a middle weight: dark enough to read in a screenshot, light
// enough that thirty-one circles do not turn the page grey.
//
// The node is a card, not a circle. A circle has to circumscribe its text, so
// you pay for the diagonal: a two-line label needs a radius far larger than the
// words themselves, which is what kept forcing the type down. A rectangle costs
// only the text plus its padding, so the same footprint carries bigger words
// and the rows line up instead of drifting.
//
// One notation: a card is a thing, a line means this leads to that.
// ===========================================================================
import { s, wrap } from '../svg.js'
import { LAYERS, NODES, LINKS } from '../model.js'

const PENCIL = { src: '/assets/pencil.png', aspect: 15.242, tx: 0.9980, ty: 0.4848 }
const ORDER = ['material', 'practice', 'institutions', 'legacy']

// Fixed ink. Not driven by the grade, because this view has no grade.
const INK = 0.66
const W = 1.15

const VW = 1600
const M = 64                       // side margin
const INTRO = 300                  // room for the instrument at the head
const PER_ROW = 4

const LH = 17
const ring = tier => (tier === 1 ? 1.45 : tier === 2 ? 1.1 : 0.85)
function measure(n) {
  const lines = wrap(n.label, 19)
  const wide = Math.max(...lines.map(t => t.length)) * 7.9
  return { lines, w: Math.max(150, Math.round(wide) + 34), h: lines.length * LH + 26 }
}

// Where a line should meet a card: the point on its border along the bearing
// to the other end, so every edge stops cleanly at the box.
function edgeOf(m, tx, ty, pad = 5) {
  const dx = tx - m.x, dy = ty - m.y
  const hw = m.w / 2 + pad, hh = m.h / 2 + pad
  const k = Math.min(hw / (Math.abs(dx) || 1e-6), hh / (Math.abs(dy) || 1e-6))
  return [m.x + dx * k, m.y + dy * k]
}

export function render(g, ctx) {
  const { state, svg } = ctx
  const pos = {}
  const sections = []

  // ------------------------------------------------------- measure and place
  let y = INTRO
  ORDER.forEach(id => {
    const layer = LAYERS.find(l => l.id === id)
    const list = NODES.filter(n => n.layer === id)          // everything, always
    const members = list.map(n => ({ n, ...measure(n) }))
    const rows = Math.ceil(members.length / PER_ROW)
    const rowH = []
    for (let r = 0; r < rows; r++) {
      rowH.push(Math.max(...members.slice(r * PER_ROW, (r + 1) * PER_ROW).map(m => m.h)))
    }
    const ROW_GAP = 104
    const areaTop = y + 80
    const usable = VW - M * 2
    let ry = areaTop
    members.forEach((m, i) => {
      const r = Math.floor(i / PER_ROW)
      const c = i % PER_ROW
      const inRow = Math.min(PER_ROW, members.length - r * PER_ROW)
      const cell = usable / inRow
      m.x = Math.round(M + cell * (c + 0.5))
      m.y = Math.round(areaTop + rowH.slice(0, r).reduce((a, v) => a + v + ROW_GAP, 0) + rowH[r] / 2)
      pos[m.n.id] = m
    })
    const height = 80 + rowH.reduce((a, v) => a + v + ROW_GAP, 0) - ROW_GAP + 74

    sections.push({ layer, members, top: y, height })
    y += height
  })
  const H = y + 72

  // the page is as tall as it needs to be, and scrolls
  svg.setAttribute('viewBox', `0 0 ${VW} ${H}`)

  // ------------------------------------------------------------- the point
  const PW = 620
  const PH = PW / PENCIL.aspect
  const TIP = [Math.round(VW * 0.5 + PW * (PENCIL.tx - 0.5)), 150]
  const tip = s('g', { class: 'pencil-photo' })
  tip.appendChild(s('image', {
    href: (state.mode === 'graphite' ? ctx.assets?.pencilHard : ctx.assets?.pencil) || PENCIL.src,
    x: (TIP[0] - PENCIL.tx * PW).toFixed(1),
    y: (TIP[1] - PENCIL.ty * PH).toFixed(1),
    width: PW.toFixed(1), height: PH.toFixed(1),
  }))
  g.appendChild(tip)

  // ------------------------------------------------------------- the sections
  sections.forEach(({ layer, top }, i) => {
    const sec = s('g')
    g.appendChild(sec)
    sec.appendChild(s('line', { x1: M, y1: top, x2: VW - M, y2: top,
      stroke: 'var(--graphite)', 'stroke-width': i === 0 ? 1.2 : 0.9, opacity: INK * 0.8 }))
    sec.appendChild(s('text', { x: M, y: top + 40, class: 't-section', text: layer.name }))
  })

  // ------------------------------------------------------------- the edges
  // Inside a section and across sections alike: same line, same meaning.
  const eg = s('g')
  g.appendChild(eg)
  LINKS.forEach(l => {
    const a = pos[l.from], b = pos[l.to]
    if (!a || !b) return
    const [x1, y1] = edgeOf(a, b.x, b.y)
    const [x2, y2] = edgeOf(b, a.x, a.y)
    const dx = b.x - a.x, dy = b.y - a.y
    const cross = a.n.layer !== b.n.layer
    // Same easing as the fan view: control points held on the dominant axis so
    // every line leaves and arrives along the flow rather than cutting across.
    const flowY = Math.abs(dy) > Math.abs(dx)
    const d2 = flowY
      ? `M${x1.toFixed(1)},${y1.toFixed(1)} C${x1.toFixed(1)},${((y1 + y2) / 2).toFixed(1)} ` +
        `${x2.toFixed(1)},${((y1 + y2) / 2).toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`
      : `M${x1.toFixed(1)},${y1.toFixed(1)} C${((x1 + x2) / 2).toFixed(1)},${y1.toFixed(1)} ` +
        `${((x1 + x2) / 2).toFixed(1)},${y2.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`
    const sw = l.strength || 2
    const weight = [0, 0.9, 1.55, 2.5][sw]
    const alpha = [0, 0.32, 0.5, 0.74][sw]
    eg.appendChild(s('path', {
      class: 'edge' + (cross ? ' cross' : ''),
      d: d2,
      'stroke-width': ((cross ? weight * 1.12 : weight) * W).toFixed(2),
      opacity: INK * (cross ? Math.min(0.88, alpha + 0.1) : alpha),
    }))
  })

  // the point draws into the first thing it made possible
  {
    const first = sections[0].members[0]
    g.appendChild(s('path', { class: 'edge',
      d: `M${TIP[0] + 8},${TIP[1] + 4} C${TIP[0] + 40},${TIP[1] + 96} ` +
         `${first.x + 130},${first.y - 150} ${first.x},${(first.y - first.h / 2 - 6).toFixed(1)}`,
      'stroke-width': (1.4 * W).toFixed(2), opacity: INK * 0.6 }))
  }

  // -------------------------------------------------------------- the nodes
  sections.forEach(({ members }) => members.forEach(m => {
    const grp = s('g', { class: 'node' })
    const bx = m.x - m.w / 2, by = m.y - m.h / 2
    // barely there: enough to hold the words off a line passing behind, not
    // enough to punch a hole in the sheet
    grp.appendChild(s('rect', { x: bx, y: by, width: m.w, height: m.h, rx: 4,
      fill: 'var(--paper)', opacity: 0.42 }))
    grp.appendChild(s('rect', { class: 'nodering', x: bx, y: by, width: m.w, height: m.h, rx: 4,
      fill: 'none', stroke: 'var(--graphite)',
      'stroke-width': ring(m.n.tier), opacity: INK * 0.92 }))
    const y0 = m.y - (m.lines.length - 1) * (LH / 2) + 5.5
    const t = s('text', { class: 't-node', 'text-anchor': 'middle', x: m.x, y: y0 })
    m.lines.forEach((ln, i) => t.appendChild(s('tspan', { x: m.x, y: y0 + i * LH, text: ln })))
    grp.appendChild(t)
    g.appendChild(grp)
  }))

  return { positions: pos }
}


export const meta = {
  viewBox: `0 0 ${VW} 2000`,
  scrolls: true,
  caption: 'Every node at full size, with its connections inside each section and across them.',
}
