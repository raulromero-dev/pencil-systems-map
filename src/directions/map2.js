// ===========================================================================
// DIRECTION, MAP-2
//
// One stroke, never lifted.
//
// The first version of this view drew four separate passes, one per sub-system.
// They read as four unrelated objects that happened to share a page: the
// instrument at the top had no visible relationship to any of them, and the
// hand-offs had to leap across empty paper to connect things that were never
// joined in the first place.
//
// So this draws a single continuous line instead. It starts at the pencil's
// point and runs the whole page: right across Material, turning at the margin,
// back left across Practice, turning again, right across Institutions, and
// left across Institutional Legacy before it lifts. The sub-systems are
// stretches of one mark rather than four marks, the hand-offs are simply the
// places where the line turns, and it thickens as it descends, because that is
// what happens to a line the longer a hand stays on the page.
//
// Which is also the argument: externalising thought at scale is one continuous
// act, not four separate ones.
//
// One notation: a tick on the line is a thing, a line between ticks means this
// leads to that.
// ===========================================================================
import { s, label, wrap } from '../svg.js'
import { LAYERS, NODES, LINKS } from '../model.js'

const PENCIL = { src: '/assets/pencil.png', aspect: 15.242, tx: 0.9980, ty: 0.4848 }
const ORDER = ['material', 'practice', 'institutions', 'legacy']

const INK = 0.7
const W = 1.2
const VW = 1600
const M = 168                      // margin: the turns bulge into it
const INTRO = 300
const SLOPE_BASE = 150             // each sweep descends as it crosses,
const SLOPE_PER = 26               // by this much more for every node it holds
const TURN_DROP = 250              // so the turn only has this much to cover
const BULGE = 128                  // which lets it round properly

export function render(g, ctx) {
  const { state, svg } = ctx
  const measure = s('path', { fill: 'none', stroke: 'none' })
  svg.appendChild(measure)

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

  // ------------------------------------------------------- build one path
  // It begins at the point itself, so there is no lead-in to draw. Every sweep
  // descends as it crosses, which leaves the turn only a short drop to cover:
  // that is what lets it round like a hand reversing rather than stretch into
  // a flat-sided loop.
  const segs = []
  const L_X = M, R_X = VW - M
  let cx = TIP[0], cy = TIP[1] + 10

  ORDER.forEach((id, i) => {
    const toRight = i % 2 === 0
    const xe = toRight ? R_X : L_X
    const count = NODES.filter(n => n.layer === id).length
    // the first stretch runs from the point, so it is only half a page wide and
    // needs the extra drop more than the others do
    const SLOPE = SLOPE_BASE + count * SLOPE_PER + (i === 0 ? 210 : 0)
    const ya = cy, yb = cy + SLOPE
    const dx = xe - cx
    segs.push({ kind: 'sweep', layer: id, i, toRight, xs: cx, xe, ya, yb, y: (ya + yb) / 2,
      d: `M${cx.toFixed(1)},${ya.toFixed(1)} C${(cx + dx * 0.34).toFixed(1)},${(ya + SLOPE * 0.06).toFixed(1)} ` +
         `${(cx + dx * 0.66).toFixed(1)},${(yb - SLOPE * 0.06).toFixed(1)} ${xe},${yb.toFixed(1)}` })
    cy = yb

    if (i < ORDER.length - 1) {
      const out = toRight ? BULGE : -BULGE
      const y2 = cy + TURN_DROP
      segs.push({ kind: 'turn', at: xe, y1: cy, y2,
        d: `M${xe},${cy.toFixed(1)} C${xe + out},${(cy + TURN_DROP * 0.30).toFixed(1)} ` +
           `${xe + out},${(y2 - TURN_DROP * 0.30).toFixed(1)} ${xe},${y2.toFixed(1)}` })
      cx = xe
      cy = y2
    }
  })

  // the page is as tall as the line turned out to be
  const H = cy + 300
  svg.setAttribute('viewBox', `0 0 ${VW} ${H}`)

  // measure each segment so the whole line can be addressed by length
  let total = 0
  segs.forEach(sg => {
    measure.setAttribute('d', sg.d)
    sg.len = measure.getTotalLength()
    sg.from = total
    total += sg.len
    sg.to = total
  })

  const whole = segs.map((sg, i) => (i ? sg.d.replace(/^M[^C]*/, '') : sg.d)).join(' ')
  measure.setAttribute('d', whole)
  const L = measure.getTotalLength()

  // the line: one ribbon, thickening as it goes down the page
  const widthAt = t => (2.6 * W) * (0.05 + 0.95 * Math.pow(Math.sin(Math.PI * t), 0.26)) * (0.8 + 0.34 * t)
  const outline = ribbonOf(measure, widthAt)
  g.appendChild(s('path', { d: outline, fill: 'var(--graphite)',
    opacity: (INK * 0.9).toFixed(3), filter: 'url(#tooth)' }))
  g.appendChild(s('path', { d: outline, fill: 'url(#grain)', opacity: 0.5 }))

  // ------------------------------------------------------------- the nodes
  // Everything is placed first and settled in ONE pass over the whole page.
  // Settling each stretch on its own left labels from neighbouring stretches
  // free to collide, and left the sub-system names out of it altogether, which
  // is why they were landing on top of nodes. The names now take part as
  // immovable obstacles: nodes go around them, never the other way round.
  const pos = {}
  const all = []
  const marks = []

  segs.filter(sg => sg.kind === 'sweep').forEach(sg => {
    const layer = LAYERS.find(l => l.id === sg.layer)
    const list = NODES.filter(n => n.layer === sg.layer)
    const from = sg.from + sg.len * 0.14
    const to = sg.to - sg.len * 0.14

    list.forEach((n, j) => {
      const at = from + ((j + 0.5) / list.length) * (to - from)
      const p = measure.getPointAtLength(at)
      const q = measure.getPointAtLength(Math.min(L, at + 2))
      const ang = Math.atan2(q.y - p.y, q.x - p.x) + Math.PI / 2
      const up = sg.i === 0 ? 1 : (j % 2 === 0 ? -1 : 1)
      const reach = sg.i === 0
        ? 96 + (j % 3) * 72
        : ((j % 4 === 0 || j % 4 === 3) ? 94 : 176)
      const lines = wrap(n.label, 17).length
      all.push({
        n, up, px: p.x, py: p.y,
        tx: p.x + Math.cos(ang) * reach * up * (sg.toRight ? 1 : -1),
        ty: p.y + Math.sin(ang) * reach * up * (sg.toRight ? 1 : -1),
        w: 182, h: lines * 16 + 16, lines,
        // the words hang below the tick or sit above it, so the box to keep
        // clear is offset from the tick by this much
        off: (sg.i === 0 ? 1 : (j % 2 === 0 ? -1 : 1)) < 0 ? -19 : 19,
        minY: sg.i === 0 ? sg.ya + 26 : sg.ya - 210,
        maxY: sg.yb + 210,
      })
    })

    // the sub-system's name: in the bend that leads into it, or at the point
    const prev = segs[segs.indexOf(sg) - 1]
    const turnIn = prev && prev.kind === 'turn' ? prev : null
    if (turnIn) {
      const inward = turnIn.at > VW / 2 ? -1 : 1
      const lx = turnIn.at + inward * 150
      const ly = (turnIn.y1 + turnIn.y2) / 2
      marks.push({ layer, x: lx, y: ly, anchor: inward > 0 ? 'start' : 'end', i: sg.i,
        cx: lx + inward * 128, cy: ly - 4, w: 296, h: 82, fixed: true })
    } else {
      const hx = TIP[0] + 20
      marks.push({ layer, x: hx, y: TIP[1] - 38, anchor: 'start', i: sg.i, head: true,
        cx: hx + 128, cy: TIP[1] - 34, w: 296, h: 78, fixed: true })
    }
  })

  settle(all, marks)

  // names first, so a node never prints over one
  marks.forEach(mk => {
    const lab = s('g')
    lab.appendChild(s('text', { x: mk.x, y: mk.y, class: 't-section',
      'text-anchor': mk.anchor, text: mk.layer.name }))
    g.appendChild(lab)
  })

  all.forEach(pl => {
    const t1 = pl.n.tier === 1
    const ng = s('g', { class: 'node' })
    ng.appendChild(s('line', { x1: pl.px, y1: pl.py, x2: pl.tx, y2: pl.ty,
      stroke: 'var(--graphite)',
      'stroke-width': (t1 ? 1.3 : 1.0) * W, opacity: INK * (t1 ? 0.9 : 0.72) }))
    // the tick grows with how central the node is, the same encoding the other
    // views carry in the size of the circle
    ng.appendChild(s('circle', { cx: pl.tx, cy: pl.ty,
      r: t1 ? 6.4 : pl.n.tier === 2 ? 4.6 : 3.4, fill: 'var(--paper)',
      stroke: 'var(--graphite)', 'stroke-width': t1 ? 1.7 : 1.25 }))
    const top0 = pl.ty - (pl.lines - 1) * 8 + (pl.up < 0 ? -15 : 23)
    ng.appendChild(label(pl.n.label, pl.tx, top0,
      { maxChars: 17, lh: 16, anchor: 'middle', cls: t1 ? 't-label t-key' : 't-label' }).el)
    pos[pl.n.id] = { x: pl.tx, y: pl.ty }
    g.appendChild(ng)
  })

  // ------------------------------------------------------------- the links
  const eg = s('g')
  g.insertBefore(eg, g.firstChild)
  LINKS.forEach(l => {
    const a = pos[l.from], b = pos[l.to]
    if (!a || !b) return
    const cross = NODES.find(n => n.id === l.from).layer !== NODES.find(n => n.id === l.to).layer
    const dx = b.x - a.x, dy = b.y - a.y
    const d = Math.abs(dy) > Math.abs(dx)
      ? `M${a.x},${a.y} C${a.x},${((a.y + b.y) / 2).toFixed(1)} ${b.x},${((a.y + b.y) / 2).toFixed(1)} ${b.x},${b.y}`
      : `M${a.x},${a.y} C${((a.x + b.x) / 2).toFixed(1)},${a.y} ${((a.x + b.x) / 2).toFixed(1)},${b.y} ${b.x},${b.y}`
    const sw = l.strength || 2
    const weight = [0, 0.8, 1.35, 2.1][sw]
    const alpha = [0, 0.28, 0.44, 0.62][sw]
    eg.appendChild(s('path', { class: 'edge' + (cross ? ' cross' : ''), d,
      'stroke-width': ((cross ? weight * 1.12 : weight) * W).toFixed(2),
      opacity: INK * (cross ? Math.min(0.8, alpha + 0.1) : alpha) }))
  })

  measure.remove()
  return { positions: pos }
}

// One pass over the whole page. Nodes push each other apart along whichever
// axis needs the smaller move, and are pushed clear of the sub-system names,
// which never move. Each node stays within its own stretch's band, so nothing
// wanders into a neighbouring sub-system.
function settle(items, fixed, rounds = 700) {
  const box = it => ({ x: it.tx ?? it.cx, y: it.ty ?? it.cy, w: it.w, h: it.h })
  for (let k = 0; k < rounds; k++) {
    let moved = false

    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const a = items[i], b = items[j]
        const dx = a.tx - b.tx, dy = (a.ty + a.off) - (b.ty + b.off)
        const ox = (a.w + b.w) / 2 + 14 - Math.abs(dx)
        const oy = (a.h + b.h) / 2 + 14 - Math.abs(dy)
        if (ox <= 0 || oy <= 0) continue
        moved = true
        if (oy <= ox * 0.6) {
          const p = oy / 2 + 0.5, d = dy <= 0 ? -1 : 1
          a.ty += p * d; b.ty -= p * d
        } else {
          const p = ox / 2 + 0.5, d = dx <= 0 ? -1 : 1
          a.tx += p * d; b.tx -= p * d
        }
      }
    }

    for (const it of items) {
      for (const f of fixed) {
        const dx = it.tx - f.cx, dy = (it.ty + it.off) - f.cy
        const ox = (it.w + f.w) / 2 + 10 - Math.abs(dx)
        const oy = (it.h + f.h) / 2 + 8 - Math.abs(dy)
        if (ox <= 0 || oy <= 0) continue
        moved = true
        if (oy <= ox * 0.6) it.ty += (dy <= 0 ? -1 : 1) * (oy * 0.5 + 0.5)
        else it.tx += (dx <= 0 ? -1 : 1) * (ox * 0.5 + 0.5)
      }
      it.ty = Math.max(it.minY - 76, Math.min(it.maxY + 76, it.ty))
      it.tx = Math.max(104, Math.min(VW - 104, it.tx))
    }
    if (!moved) break
  }
}

function ribbonOf(pathEl, widthAt, steps = 420) {
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
  viewBox: `0 0 ${VW} 2000`,
  scrolls: true,
  caption: 'One continuous stroke from the point, turning at each margin. The sub-systems are stretches of a single mark.',
}
