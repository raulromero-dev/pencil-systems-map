// ===========================================================================
// DIRECTION, FINAL-5
//
// A process plate: the register of a technical schematic rather than a drawing.
//
// Where the other views soften the relationships into curves, this one refuses
// to. Every link is routed orthogonally, every terminal is ringed, and nothing
// is allowed to overlap gracefully. That is the point: the complexity between
// the sub-systems is the subject, so the plate is built to let it accumulate
// and be counted rather than to look calm.
//
// Adapted to the sheet rather than borrowed whole: graphite on paper, hairlines,
// one accent reserved for the relationships that carry the argument, and small
// letterspaced capitals doing the labelling.
//
// The three attributes run as rails down both margins, the way a schematic
// carries the conditions that hold everywhere and belong to no single stage.
// ===========================================================================
import { s, wrap } from '../svg.js'
import { LAYERS, NODES, LINKS } from '../model.js'

const ORDER = ['material', 'practice', 'institutions', 'legacy']
const RAILS = ['ERASABILITY', 'PORTABILITY', 'AFFORDABILITY']

const VW = 1600
const M = 118                 // the rails live outside this
const HEAD = 210
const PER_ROW = 4
const ROW_H = 132
const PAD_TOP = 78
const PAD_BOT = 54

export function render(g, ctx) {
  const { svg } = ctx
  const usable = VW - M * 2

  // ------------------------------------------------------- measure and place
  const pos = {}
  const zones = []
  let y = HEAD
  ORDER.forEach(id => {
    const layer = LAYERS.find(l => l.id === id)
    const list = NODES.filter(n => n.layer === id)
    const rows = Math.ceil(list.length / PER_ROW)
    const top = y
    list.forEach((n, i) => {
      const r = Math.floor(i / PER_ROW)
      const c = i % PER_ROW
      const inRow = Math.min(PER_ROW, list.length - r * PER_ROW)
      const cell = usable / inRow
      const lines = wrap(n.label.toUpperCase(), 22)
      const w = Math.min(cell - 34, Math.max(150, Math.max(...lines.map(t => t.length)) * 6.1 + 30))
      const h = lines.length * 13 + 24
      pos[n.id] = {
        n, lines, w, h,
        x: Math.round(M + cell * (c + 0.5)),
        y: Math.round(top + PAD_TOP + 40 + r * ROW_H),
      }
    })
    const height = PAD_TOP + rows * ROW_H + PAD_BOT
    zones.push({ layer, top, height, count: list.length })
    y += height + 34
  })
  const H = y + 210
  svg.setAttribute('viewBox', `0 0 ${VW} ${H}`)

  const hair = (o = 1, w = 0.85) => ({ fill: 'none', stroke: 'var(--graphite)',
    'stroke-width': w, opacity: o })

  // ------------------------------------------------------------- title block
  const head = s('g')
  g.appendChild(head)
  head.appendChild(s('line', { x1: M, y1: 96, x2: 470, y2: 96, ...hair(0.75) }))
  head.appendChild(s('line', { x1: VW - 470, y1: 96, x2: VW - M, y2: 96, ...hair(0.75) }))
  head.appendChild(s('text', { x: VW / 2, y: 102, class: 'q-title', 'text-anchor': 'middle',
    text: 'MAP OF THE PENCIL’S INFLUENCE ON VISUAL COMMUNICATION' }))
  head.appendChild(s('text', { x: VW / 2, y: 128, class: 'q-sub', 'text-anchor': 'middle',
    text: 'DECODING THE SYSTEM OF THE SKETCH' }))

  // ----------------------------------------------------------------- zones
  zones.forEach(({ layer, top, height, count }, i) => {
    const z = s('g')
    g.appendChild(z)
    z.appendChild(s('rect', {
      x: M - 40, y: top, width: usable + 80, height, rx: 6,
      fill: 'none', stroke: 'var(--graphite)', 'stroke-width': 0.85,
      'stroke-dasharray': '7 5', opacity: 0.5,
    }))
    z.appendChild(s('text', { x: M - 22, y: top + 34, class: 'q-zone',
      text: `${String(i + 1).padStart(2, '0')}  ${layer.name.toUpperCase()}` }))
    z.appendChild(s('text', { x: VW - M + 22, y: top + 34, class: 'q-meta', 'text-anchor': 'end',
      text: `${count} NODES` }))
  })

  // ----------------------------------------------------------------- rails
  // The conditions that hold across every stage and belong to none of them.
  ;[M - 78, VW - M + 78].forEach((rx, side) => {
    g.appendChild(s('line', { x1: rx, y1: HEAD + 10, x2: rx, y2: H - 70, ...hair(0.45) }))
    RAILS.forEach((name, k) => {
      const ry = HEAD + 130 + k * ((H - HEAD - 250) / 3)
      g.appendChild(s('circle', { cx: rx, cy: ry, r: 4.5, fill: 'var(--paper)',
        stroke: 'var(--graphite)', 'stroke-width': 1.1, opacity: 0.9 }))
      g.appendChild(s('text', {
        x: rx, y: ry, class: 'q-rail', 'text-anchor': 'middle',
        transform: `rotate(${side ? 90 : -90} ${rx} ${ry})`,
        dy: side ? 14 : -8, text: name,
      }))
    })
  })

  // ----------------------------------------------------------------- routing
  // Orthogonal, with a lane per link so parallel runs separate instead of
  // stacking into one thick line.
  const eg = s('g')
  g.appendChild(eg)
  LINKS.forEach((l, i) => {
    const a = pos[l.from], b = pos[l.to]
    if (!a || !b) return
    const sw = l.strength || 2
    const strong = sw === 3
    const stroke = strong ? 'var(--accent)' : 'var(--graphite)'
    const width = [0, 0.75, 1.05, 1.5][sw]
    const alpha = [0, 0.34, 0.5, 0.78][sw]
    const lane = ((i % 7) - 3) * 7

    let d
    if (Math.abs(b.y - a.y) < 10) {
      // same row: go over the top
      const up = Math.min(a.y - a.h / 2, b.y - b.h / 2) - 34 - Math.abs(lane) * 0.5
      d = `M${a.x},${a.y - a.h / 2} V${up} H${b.x} V${b.y - b.h / 2}`
    } else {
      const down = b.y > a.y
      const ay = a.y + (down ? a.h / 2 : -a.h / 2)
      const by = b.y + (down ? -b.h / 2 : b.h / 2)
      const mid = (ay + by) / 2 + lane
      d = `M${a.x},${ay} V${mid} H${b.x} V${by}`
    }

    eg.appendChild(s('path', { d, fill: 'none', stroke,
      'stroke-width': width, opacity: alpha, 'stroke-linejoin': 'miter' }))

    // ringed terminals, as on a schematic
    const ey = b.y + (b.y > a.y ? -b.h / 2 : b.h / 2)
    eg.appendChild(s('circle', { cx: b.x, cy: ey, r: strong ? 3.6 : 2.8,
      fill: 'var(--paper)', stroke, 'stroke-width': 1.1, opacity: Math.min(1, alpha + 0.25) }))
  })

  // ----------------------------------------------------------------- nodes
  Object.values(pos).forEach(p => {
    const t1 = p.n.tier === 1
    const grp = s('g', { class: 'node' })
    grp.appendChild(s('rect', {
      x: p.x - p.w / 2, y: p.y - p.h / 2, width: p.w, height: p.h, rx: 4,
      fill: 'var(--paper)', opacity: 0.97,
    }))
    grp.appendChild(s('rect', {
      x: p.x - p.w / 2, y: p.y - p.h / 2, width: p.w, height: p.h, rx: 4,
      fill: 'none', stroke: 'var(--graphite)',
      'stroke-width': t1 ? 1.5 : p.n.tier === 2 ? 1.05 : 0.8, opacity: 0.9,
    }))
    const y0 = p.y - (p.lines.length - 1) * 6.5 + 3.5
    const t = s('text', { x: p.x, y: y0, 'text-anchor': 'middle',
      class: 'q-node' + (t1 ? ' q-key' : '') })
    p.lines.forEach((ln, i) => t.appendChild(s('tspan', { x: p.x, y: y0 + i * 13, text: ln })))
    grp.appendChild(t)
    g.appendChild(grp)
  })

  return { positions: pos }
}

export const meta = {
  scrolls: true,
  viewBox: `0 0 ${VW} 2400`,
  caption: '',
}
