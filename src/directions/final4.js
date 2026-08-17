// ===========================================================================
// DIRECTION, FINAL-4
//
// A poster, arranged around the instrument.
//
// The other views give every node its own circle, which is why they run long
// and why the type kept having to shrink. This inverts that: four circles for
// four sub-systems, and the nodes are set as lines of type INSIDE them. The
// geometry contains, the typography lists, and neither fights the other.
//
// The four are set as a rosette around the pencil rather than stacked down the
// page. Stacking them said the argument runs in one direction and ends; a
// rosette says the instrument is in the middle of all four at once, which is
// nearer the truth. The relationships are drawn straight across the middle, so
// the non-linear traffic between sub-systems is the busiest thing on the sheet
// rather than something implied by the order of a list.
//
// Encodings unchanged: type sets larger and darker with how central a node is,
// and a line thickens with how strongly one thing leads to another.
// ===========================================================================
import { s, wrap } from '../svg.js'
import { LAYERS, NODES, LINKS } from '../model.js'

const PENCIL = { src: '/assets/pencil.png', aspect: 15.242, tx: 0.9980, ty: 0.4848 }
const ORDER = ['material', 'practice', 'institutions', 'legacy']

const VW = 1600
const M = 96
const INK = 0.84

const R = 300                 // sub-system radius
const D = 402                 // pushed apart, so each circle reads as its own
const HEAD = 660
const ROW = 27

export function render(g, ctx) {
  const { state, svg } = ctx
  const CX = VW / 2
  const CY = HEAD + D + R + 20
  const H = CY + D + R + 230
  svg.setAttribute('viewBox', `0 0 ${VW} ${H}`)

  const hair = (o = 1, w = 0.9) => ({ fill: 'none', stroke: 'var(--graphite)',
    'stroke-width': w, opacity: INK * o })

  // ------------------------------------------------------------- the poster
  const head = s('g')
  g.appendChild(head)
  ;['THE PENCIL’S', 'INFLUENCE ON', 'VISUAL COMMUNICATION'].forEach((ln, i) => {
    head.appendChild(s('text', { x: M, y: 150 + i * 104, class: 'p-display', text: ln }))
  })

  const mx = VW - M
  head.appendChild(s('text', { x: mx, y: 96, class: 'p-meta', 'text-anchor': 'end', text: 'A SYSTEMS MAP' }))
  head.appendChild(s('text', { x: mx, y: 144, class: 'p-sub', 'text-anchor': 'end', text: '(FOUR SUB-SYSTEMS)' }))

  head.appendChild(s('line', { x1: M, y1: 420, x2: mx, y2: 420, ...hair(0.9) }))
  head.appendChild(s('text', { x: M, y: 448, class: 'p-meta', text: '№' }))
  head.appendChild(s('text', { x: 300, y: 448, class: 'p-meta', text: 'Title' }))
  head.appendChild(s('text', { x: 760, y: 448, class: 'p-meta', text: 'Description' }))
  head.appendChild(s('line', { x1: M, y1: 466, x2: mx, y2: 466, ...hair(0.55) }))
  head.appendChild(s('text', { x: M, y: 512, class: 'p-num', text: '(01)' }))
  head.appendChild(s('text', { x: 300, y: 512, class: 'p-title', text: 'THE ROSETTE' }))
  ;[
    ['Four sub-systems set around the instrument rather than',
     'stacked beneath it. A node is a line of type inside the',
     'circle it belongs to.'],
    ['Every relationship is drawn, so the traffic across the',
     'middle is the busiest part of the sheet. Weight of type is',
     'importance; weight of line is strength.'],
  ].forEach((lines, c) => lines.forEach((ln, i) =>
    head.appendChild(s('text', { x: 760 + c * 400, y: 498 + i * 19, class: 'p-body', text: ln }))))

  // ------------------------------------------------------------ the circles
  const seats = ORDER.map((id, i) => {
    const a = -Math.PI / 2 + i * (Math.PI / 2)      // top, right, bottom, left
    return { id, layer: LAYERS.find(l => l.id === id), a,
      x: CX + Math.cos(a) * D, y: CY + Math.sin(a) * D }
  })

  seats.forEach(seat => {
    g.appendChild(s('circle', { cx: seat.x, cy: seat.y, r: R, ...hair(0.62) }))
  })

  // two framing arcs, so the rosette reads as a detail of something larger
  g.appendChild(s('circle', { cx: CX, cy: CY, r: D + R + 46, ...hair(0.24) }))
  g.appendChild(s('circle', { cx: CX, cy: CY, r: D - R * 0.42, ...hair(0.18) }))

  // ------------------------------------------------------------- the nodes
  // Set outward from the middle, so the centre stays clear for the instrument
  // and the traffic between sub-systems.
  const pos = {}
  seats.forEach(seat => {
    const list = NODES.filter(n => n.layer === seat.id).slice().sort((a, b) => a.tier - b.tier)
    const ox = seat.x + Math.cos(seat.a) * R * 0.30
    const oy = seat.y + Math.sin(seat.a) * R * 0.30

    const rows = list.map((n, k) => ({ n, off: Math.ceil(k / 2) * (k % 2 ? -1 : 1) }))
    rows.sort((a, b) => a.off - b.off)

    rows.forEach(({ n, off }) => {
      const y = oy + off * ROW
      const dy = y - seat.y
      const half = Math.sqrt(Math.max(1, R * R - dy * dy))
      const room = Math.max(90, half * 2 - 56)
      const size = n.tier === 1 ? 15 : n.tier === 2 ? 13 : 11.8
      const lines = wrap(n.label, Math.max(8, Math.floor(room / (size * 0.53))))
      const y0 = y - (lines.length - 1) * (size * 0.58)
      const t = s('text', {
        x: ox, y: y0, 'text-anchor': 'middle',
        class: 'p-node' + (n.tier === 1 ? ' p-key' : ''),
        style: `font-size:${size}px`,
      })
      lines.forEach((ln, li) => t.appendChild(s('tspan', { x: ox, y: y0 + li * (size * 1.16), text: ln })))
      // the terminal sits on the side facing the middle, which is where all the
      // traffic runs
      const inward = -Math.sign(Math.cos(seat.a)) || 0
      const vert = Math.abs(Math.cos(seat.a)) < 0.3
      const tw = Math.min(room * 0.5, 150)
      const ax = vert ? ox : ox + inward * (tw + 16)
      const ay = vert ? y + (Math.sin(seat.a) < 0 ? 13 : -13) : y
      pos[n.id] = { x: ax, y: ay, tx: ox, ty: y, el: t, tier: n.tier }
    })
  })

  // ------------------------------------------------------------- the traffic
  // Drawn under the type, which carries a paper-coloured outline of itself and
  // so stays readable wherever a line passes behind it.
  const eg = s('g')
  g.appendChild(eg)
  LINKS.forEach(l => {
    const a = pos[l.from], b = pos[l.to]
    if (!a || !b) return
    const cross = NODE_LAYER(l.from) !== NODE_LAYER(l.to)
    const sw = l.strength || 2
    const weight = [0, 0.9, 1.5, 2.4][sw]
    const alpha = [0, 0.34, 0.52, 0.78][sw]
    // everything bows toward the middle, so the centre carries the traffic
    const mxp = (a.x + b.x) / 2, myp = (a.y + b.y) / 2
    const pull = cross ? 0.42 : -0.62
    const qx = mxp + (CX - mxp) * pull, qy = myp + (CY - myp) * pull
    const dx = b.x - qx, dy = b.y - qy
    const dd = Math.hypot(dx, dy) || 1
    const bx = b.x - (dx / dd) * 9, by = b.y - (dy / dd) * 9
    eg.appendChild(s('path', {
      class: 'edge' + (cross ? ' cross' : ''),
      d: `M${a.x.toFixed(1)},${a.y.toFixed(1)} Q${qx.toFixed(1)},${qy.toFixed(1)} ${bx.toFixed(1)},${by.toFixed(1)}`,
      'stroke-width': (cross ? weight * 1.15 : weight).toFixed(2),
      opacity: INK * (cross ? Math.min(0.95, alpha + 0.12) : alpha),
      'marker-end': `url(#arw${sw})`,
    }))
  })

  // terminals, then type, both over the traffic
  Object.values(pos).forEach(p => {
    g.appendChild(s('circle', { cx: p.x, cy: p.y, r: p.tier === 1 ? 4.2 : 3,
      fill: 'var(--paper)', stroke: 'var(--graphite)',
      'stroke-width': p.tier === 1 ? 1.5 : 1.05, opacity: INK }))
  })
  Object.values(pos).forEach(p => g.appendChild(p.el))

  // sub-system names, set outside their circle on the outer edge
  seats.forEach((seat, i) => {
    // set just outside the circle, centred on the radius, so the side ones do
    // not run off the sheet
    const lx = Math.max(150, Math.min(VW - 150, CX + Math.cos(seat.a) * (D + R + 26)))
    const ly = CY + Math.sin(seat.a) * (D + R + 26) + (Math.sin(seat.a) < -0.5 ? -18 : 24)
    g.appendChild(s('text', { x: lx, y: ly, class: 'p-section', 'text-anchor': 'middle',
      text: seat.layer.name.toUpperCase() }))
    g.appendChild(s('text', { x: lx, y: ly + 20, class: 'p-meta', 'text-anchor': 'middle',
      text: `0${i + 1}` }))
  })

  // ------------------------------------------------------------- the point
  // In the middle of all four, where the traffic crosses.
  const PW = 268
  const PH = PW / PENCIL.aspect
  const tip = s('g', { class: 'pencil-photo', transform: `rotate(90 ${CX} ${CY})` })
  tip.appendChild(s('image', {
    href: (state.mode === 'graphite' ? ctx.assets?.pencilHard : ctx.assets?.pencil) || PENCIL.src,
    x: (CX - PENCIL.tx * PW).toFixed(1),
    y: (CY - PENCIL.ty * PH).toFixed(1),
    width: PW.toFixed(1), height: PH.toFixed(1),
  }))
  g.appendChild(tip)

  return { positions: pos }
}

const NODE_LAYER = id => (NODES.find(n => n.id === id) || {}).layer

export const meta = {
  scrolls: true,
  viewBox: `0 0 ${VW} 2200`,
  caption: '',
}
