// ===========================================================================
// DIRECTION, FINAL
// Four sub-systems, each drawn as a circle with its own nodes packed inside
// it, and individual causal lines running between the nodes across them.
//
// Not levels: a band forces every node in a sub-system onto one line and makes
// the page read as a hierarchy it does not have. A containing circle says the
// same thing about membership without implying rank, and lets the causal lines
// rather than the layout carry the argument.
//
// One notation, and no key needed for it: a circle is a thing, a line means
// this leads to that.
// ===========================================================================
import { s, wrap } from '../svg.js'
import { LAYERS, NODES, LINKS, GRADES } from '../model.js'

const PENCIL = { src: '/assets/pencil.png', aspect: 15.242, tx: 0.9980, ty: 0.4848 }
const ORDER = ['material', 'practice', 'institutions', 'legacy']

export const GRADE_TRACK = { x0: 0, x1: 0, y: 0 }

const PAD = 44
const LEFT = 470          // the map begins to the right of the instrument
const TOP = 108, BOTTOM = 910

// A node circle sized to hold its own words.
function measure(n) {
  const lines = wrap(n.label, 12)
  const wide = Math.max(...lines.map(t => t.length)) * 7.9
  const tall = lines.length * 15.4
  const grow = n.tier === 1 ? 13 : n.tier === 2 ? 11 : 10
  return { lines, r: Math.max(34, Math.min(78, Math.hypot(wide, tall) / 2 + grow)) }
}

export function render(g, ctx) {
  const { spec, state } = ctx
  const W = spec.weight, INK = spec.ink
  const vw = ctx.vw ?? 1600

  // ------------------------------------------------------- the four circles
  // Each circle is sized by what it holds, so turning the grade up does not
  // just reveal nodes, it visibly swells the sub-systems that gained them. The
  // grid then lays itself out from those radii rather than from fixed cells,
  // and if the four together outgrow the plate every one of them, and its type
  // with it, is scaled down by the same factor so the proportions hold.
  const fieldW = vw - LEFT - PAD
  const fieldH = BOTTOM - TOP

  const groups = ORDER.map(layerId => {
    const layer = LAYERS.find(l => l.id === layerId)
    const list = NODES.filter(n => n.layer === layerId && n.tier <= spec.detail)
    const members = list.map(n => ({ n, ...measure(n) }))
    const area = members.reduce((a, m) => a + m.r * m.r, 0)
    return { layer, members, R: Math.max(92, Math.sqrt(area) * 1.52 + 20) }
  })

  // two rows, two columns, each sized by its largest circle
  const rowR = [Math.max(groups[0].R, groups[1].R), Math.max(groups[2].R, groups[3].R)]
  const colR = [Math.max(groups[0].R, groups[2].R), Math.max(groups[1].R, groups[3].R)]
  const needH = 2 * (rowR[0] + rowR[1]) + 46      // and between the rows
  const needW = 2 * (colR[0] + colR[1]) + 96      // gutters between the columns
  const k = Math.min(1, fieldH / needH, fieldW / needW)

  if (k < 1) {
    groups.forEach(gr => {
      gr.R *= k
      gr.members.forEach(m => { m.r *= k; m.k = k })
    })
    rowR[0] *= k; rowR[1] *= k; colR[0] *= k; colR[1] *= k
  }

  const gapW = (fieldW - 2 * (colR[0] + colR[1])) / 3
  const cx = [LEFT + gapW + colR[0], LEFT + gapW * 2 + 2 * colR[0] + colR[1]]
  const gapH = (fieldH - 2 * (rowR[0] + rowR[1])) / 2
  const cy = [TOP + gapH * 0.42 + rowR[0], BOTTOM - gapH * 0.42 - rowR[1]]
  const midY = (cy[0] + rowR[0] + cy[1] - rowR[1]) / 2

  groups.forEach((gr, i) => {
    gr.cx = Math.round(cx[i % 2])
    gr.cy = Math.round(cy[Math.floor(i / 2)])
  })

  // ------------------------------------------------------------- the point
  // Lying along the left margin, tip inward, with a line drawn from it to each
  // of the four sub-systems: the instrument is upstream of all of them, not
  // just of the material it is made from.
  const PW = Math.min(548, LEFT + 96)
  const PH = PW / PENCIL.aspect
  const TIP = [LEFT - 88, midY]
  const tip = s('g', { class: 'pencil-photo' })
  tip.appendChild(s('image', {
    href: (state.mode === 'graphite' ? ctx.assets?.pencilHard : ctx.assets?.pencil) || PENCIL.src,
    x: (TIP[0] - PENCIL.tx * PW).toFixed(1),
    y: (TIP[1] - PENCIL.ty * PH).toFixed(1),
    width: PW.toFixed(1), height: PH.toFixed(1),
  }))
  g.appendChild(tip)

  groups.forEach(gr => {
    const dx = gr.cx - TIP[0], dy = gr.cy - TIP[1]
    const d = Math.hypot(dx, dy) || 1
    const ex = gr.cx - (dx / d) * (gr.R + 3), ey = gr.cy - (dy / d) * (gr.R + 3)
    g.appendChild(s('path', { class: 'edge',
      d: `M${TIP[0] + 8},${TIP[1]} C${TIP[0] + 90},${TIP[1] + dy * 0.10} ` +
         `${ex - 110},${ey - dy * 0.10} ${ex.toFixed(1)},${ey.toFixed(1)}`,
      'stroke-width': (1.3 * W).toFixed(2), opacity: INK * 0.42 }))
  })

  // pack each group's nodes inside its own circle
  const pos = {}
  groups.forEach(grp => {
    const { members, R, cx, cy } = grp
    members.forEach((m, i) => {
      const a = (i / members.length) * Math.PI * 2 + 0.6
      const ring = members.length <= 3 ? R * 0.34 : R * 0.56
      m.x = cx + Math.cos(a) * ring
      m.y = cy + Math.sin(a) * ring + R * 0.14   // bias down, the name sits up top
      pos[m.n.id] = m
    })
    packInside(members, cx, cy, R)
  })

  // ------------------------------------------------------------- containers
  const cg = s('g')
  g.appendChild(cg)
  groups.forEach(({ layer, R, cx, cy }) => {
    cg.appendChild(s('circle', { cx, cy, r: R, fill: 'none',
      stroke: 'var(--graphite)', 'stroke-width': Math.max(0.8, W * 0.7), opacity: INK * 0.55 }))
    cg.appendChild(s('text', { x: cx, y: cy - R + 26, class: 't-layer',
      'text-anchor': 'middle', text: layer.name }))
    cg.appendChild(s('text', { x: cx, y: cy - R + 44, class: 't-micro',
      'text-anchor': 'middle', text: layer.role }))
  })

  // ------------------------------------------------------------- the edges
  const eg = s('g')
  g.appendChild(eg)
  LINKS.filter(l => l.tier <= spec.detail).forEach(l => {
    const a = pos[l.from], b = pos[l.to]
    if (!a || !b) return
    const dx = b.x - a.x, dy = b.y - a.y
    const len = Math.hypot(dx, dy) || 1
    const ux = dx / len, uy = dy / len
    const x1 = a.x + ux * (a.r + 3), y1 = a.y + uy * (a.r + 3)
    const x2 = b.x - ux * (b.r + 4), y2 = b.y - uy * (b.r + 4)
    const bow = Math.min(30, len * 0.09)
    const mx = (x1 + x2) / 2 - uy * bow, my = (y1 + y2) / 2 + ux * bow
    eg.appendChild(s('path', { class: 'edge',
      d: `M${x1.toFixed(1)},${y1.toFixed(1)} Q${mx.toFixed(1)},${my.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`,
      'stroke-width': (1.25 * W).toFixed(2), opacity: INK * 0.52 }))
  })

  // -------------------------------------------------------------- the nodes
  groups.forEach(({ members }) => members.forEach(m => {
    const hot = state.active === m.n.id || state.pinned === m.n.id
    const grp = s('g', { class: 'node' + (hot ? ' hot' : ''), 'data-node': m.n.id })
    grp.appendChild(s('circle', { class: 'hit-c', cx: m.x, cy: m.y, r: m.r, fill: 'transparent' }))
    grp.appendChild(s('circle', { class: 'nodering', cx: m.x, cy: m.y, r: m.r, fill: 'none',
      stroke: hot ? 'var(--accent)' : 'var(--graphite)',
      'stroke-width': (hot ? 1.8 : 1) * Math.max(0.75, W * 0.62), opacity: hot ? 1 : INK * 0.8 }))
    const lh = 15.4 * (m.k || 1)
    const y0 = m.y - (m.lines.length - 1) * lh * 0.5 + 4.6
    const t = s('text', { class: 't-node', 'text-anchor': 'middle', x: m.x, y: y0,
      style: m.k ? `font-size:${(15 * m.k).toFixed(2)}px` : null })
    m.lines.forEach((ln, i) => t.appendChild(s('tspan', { x: m.x, y: y0 + i * lh, text: ln })))
    grp.appendChild(t)
    g.appendChild(grp)
  }))

  // -------------------------------------------------------------- grade dial
  // bottom right, out of the map's way
  const gx1 = vw - PAD, gx0 = gx1 - 168, gy = 884
  GRADE_TRACK.x0 = gx0; GRADE_TRACK.x1 = gx1; GRADE_TRACK.y = gy
  const gi = GRADES.indexOf(spec.label)
  const gt = gi / (GRADES.length - 1)
  const gx = gx0 + (gx1 - gx0) * gt
  const dial = s('g', { class: 'dial' })
  dial.appendChild(s('path', {
    d: `M${gx0},${gy - 1.2} L${gx1},${gy - 6} L${gx1},${gy + 6} L${gx0},${gy + 1.2} Z`,
    fill: 'var(--graphite)', opacity: 0.16 }))
  dial.appendChild(s('path', {
    d: `M${gx0},${gy - 1.2} L${gx},${gy - 1.2 - 4.8 * gt} L${gx},${gy + 1.2 + 4.8 * gt} L${gx0},${gy + 1.2} Z`,
    fill: 'var(--graphite)', opacity: 0.82 }))
  dial.appendChild(s('line', { x1: gx, y1: gy - 11, x2: gx, y2: gy + 11,
    stroke: 'var(--accent)', 'stroke-width': 2 }))
  dial.appendChild(s('text', { x: gx1, y: gy - 20, class: 't-role', 'text-anchor': 'end', text: spec.label }))
  dial.appendChild(s('text', { x: gx0, y: gy - 20, class: 't-micro',
    text: spec.detail === 1 ? 'construction only'
        : spec.detail === 2 ? 'primary + relations' : 'full resolution' }))
  dial.appendChild(s('rect', { 'data-grade': '1', x: gx0 - 14, y: gy - 26,
    width: gx1 - gx0 + 28, height: 52, fill: 'transparent', style: 'cursor:ew-resize' }))
  g.appendChild(dial)

  return { positions: pos }
}

// Push members apart, hold them inside their own circle, and keep the top of
// that circle clear so the sub-system's name has somewhere to sit.
function packInside(ms, cx, cy, R, rounds = 340) {
  const sep = ms[0] && ms[0].k ? ms[0].k : 1
  const nameY = cy - R + 34
  for (let k = 0; k < rounds; k++) {
    for (let i = 0; i < ms.length; i++) {
      for (let j = i + 1; j < ms.length; j++) {
        const a = ms[i], b = ms[j]
        const dx = b.x - a.x, dy = b.y - a.y
        const d = Math.hypot(dx, dy) || 0.01
        const need = a.r + b.r + 8 * sep
        if (d >= need) continue
        const p = (need - d) / 2, ux = dx / d, uy = dy / d
        a.x -= ux * p; a.y -= uy * p
        b.x += ux * p; b.y += uy * p
      }
    }
    for (const m of ms) {
      // clear of the name plate
      const ndx = m.x - cx, ndy = m.y - nameY
      const nd = Math.hypot(ndx, ndy) || 0.01
      if (nd < m.r + 52) {
        const p = (m.r + 52 - nd) * 0.5
        m.x += (ndx / nd) * p; m.y += (ndy / nd) * p
      }
      // stay inside the container
      const dx = m.x - cx, dy = m.y - cy
      const d = Math.hypot(dx, dy) || 0.01
      const max = R - m.r - 5
      if (d > max) { m.x = cx + (dx / d) * max; m.y = cy + (dy / d) * max }
    }
  }
}

export const meta = {
  viewBox: '0 0 1600 940',
  caption: 'Four sub-systems, each a circle of its own nodes, with the causal lines running between them.',
}
