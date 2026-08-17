// The page furniture: masthead, rail, drawer, footer.
// Deliberately quiet, the GSD half of the brief lives here.
import { h, s, iconPaper, iconGraphite, iconScrap, constructionMark } from './svg.js'
import { get, set, subscribe } from './state.js'
import { LAYER_BY_ID, NODE_BY_ID, LINKS, DIRECTIONS } from './model.js'

export function buildChrome(root) {
  const st = get()

  // ------------------------------------------------------------- masthead
  const header = h('header', {}, [
    h('div', { class: 'mark' }, [
      constructionMark(),
      h('h1', {}, [
        document.createTextNode("The Pencil's "),
        h('span', { text: 'influence on thought' }),
      ]),
    ]),
  ])

  // A single notation needs no key: a circle is a thing, a line means this
  // leads to that. The footer carries what the view is instead.
  const caption = h('div', { class: 'legend', id: 'view-caption', text: '' })

  // Paper or graphite, as a segmented pair rather than a checkbox, the two
  // grounds are equal states, not a default plus an override.
  const modeSwitch = h('div', { class: 'seg', role: 'group', 'aria-label': 'Ground' }, [
    h('button', { type: 'button', id: 'tg-paper', 'aria-pressed': String(st.mode === 'paper'),
      'aria-label': 'Paper', title: 'Paper', onclick: () => set({ mode: 'paper' }) }, [iconPaper()]),
    h('button', { type: 'button', id: 'tg-graphite', 'aria-pressed': String(st.mode === 'graphite'),
      'aria-label': 'Graphite', title: 'Graphite', onclick: () => set({ mode: 'graphite' }) }, [iconGraphite()]),
  ])

  // ---------------------------------------------------------------- stage
  const svg = s('svg', { id: 'canvas', viewBox: '0 0 1600 940', preserveAspectRatio: 'xMidYMin meet' })
  const drawer = h('aside', { class: 'drawer', id: 'drawer' })
  const stage = h('main', { class: 'stage' }, [svg, drawer])

  // --------------------------------------------------------------- footer
  const footer = h('footer', {}, [
    caption,
    h('div', { class: 'right' }, [
      modeSwitch,
    ]),
  ])

  root.append(header, stage, footer)

  // --------------------------------------------------------------- syncing
  function sync(state) {
    document.documentElement.dataset.mode = state.mode

    const dir = DIRECTIONS.find(d => d.id === state.direction)
    document.getElementById('view-caption').textContent = dir ? dir.caption : ''
    document.getElementById('tg-paper').setAttribute('aria-pressed', String(state.mode === 'paper'))
    document.getElementById('tg-graphite').setAttribute('aria-pressed', String(state.mode === 'graphite'))
    renderDrawer(drawer, state)
  }
  subscribe(sync)
  sync(st)

  return { svg, drawer }
}

// ------------------------------------------------------------------ drawer
function renderDrawer(drawer, state) {
  const id = state.pinned || state.active
  const n = id ? NODE_BY_ID[id] : null
  if (!n) { drawer.classList.remove('open'); return }

  const layer = LAYER_BY_ID[n.layer]
  const rel = LINKS.filter(l => l.from === n.id || l.to === n.id)

  drawer.classList.add('open')
  drawer.replaceChildren(
    h('button', {
      class: 'close', type: 'button',
      'aria-label': 'Scrap this', title: 'Scrap this',
      onclick: e => {
        const panel = e.currentTarget.closest('.drawer')
        panel.classList.add('scrapping')
        setTimeout(() => {
          panel.classList.remove('scrapping')
          set({ pinned: null, active: null })
        }, 600)
      },
    }, [iconScrap(20)]),

    // Everything sits inside one .note, so scrapping crumples a single sheet.
    // Animating the blocks individually made them scatter instead.
    h('div', { class: 'note' }, [
      h('h3', { text: n.label }),
      h('p', { text: n.body }),
      rel.length ? h('div', { class: 'block' }, [
        h('h2', { text: 'Its place in the map' }),
        miniMap(n, rel),
      ]) : null,
    ]),
  )
}

// A cut-out of the map rather than a list of links: this node on a rail, what
// leads into it above, what it leads to below, and the kind of each relation
// carried by the connector rather than spelled out in words.
function miniMap(n, rel) {
  const W = 320, ROW = 30, GAP = 22
  const ins = rel.filter(l => l.to === n.id)
  const outs = rel.filter(l => l.from === n.id)
  const yIn = i => 14 + i * ROW
  const cy = 14 + ins.length * ROW + (ins.length ? GAP - 8 : 0)
  const yOut = i => cy + GAP + 8 + i * ROW
  const H = yOut(Math.max(0, outs.length - 1)) + (outs.length ? 22 : 8)
  const RAIL = 13

  const kids = []
  const top = ins.length ? yIn(0) : cy
  const bot = outs.length ? yOut(outs.length - 1) : cy

  // The rail is drawn, not ruled: a graphite stroke down the margin that
  // wavers slightly, lifts at both ends, and presses hardest where the node
  // you are standing on sits. Pressure marks your place.
  kids.push(s('path', { d: railStroke(top, bot, cy, RAIL), fill: 'var(--graphite)',
    opacity: 0.85, filter: 'url(#tooth)' }))
  kids.push(s('path', { d: railStroke(top, bot, cy, RAIL), fill: 'url(#grain)', opacity: 0.5 }))

  const row = (l, other, y, dir) => {
    const g = s('g', { class: 'mm-row', 'data-node': other.id, tabindex: '0' })
    // a short hand-drawn connector rather than a ruled tick
    g.appendChild(s('path', {
      class: 'edge',
      d: `M${RAIL + 2},${y} C${RAIL + 10},${y - 1.1} ${RAIL + 19},${y + 1.2} ${RAIL + 27},${y - 0.3}`,
      'stroke-width': 1.3, filter: 'url(#tooth)',
    }))
    g.appendChild(s('circle', { cx: RAIL, cy: y, r: 4, fill: 'var(--paper)',
      stroke: 'var(--graphite)', 'stroke-width': 1.2 }))
    g.appendChild(s('text', { x: RAIL + 34, y: y + 4, class: 'mm-label',
      text: clip(other.label, 34) }))
    g.appendChild(s('title', { text: `${dir} ${other.label}` }))
    g.appendChild(s('rect', { x: 0, y: y - 14, width: W, height: 28, fill: 'transparent' }))
    return g
  }

  ins.forEach((l, i) => kids.push(row(l, NODE_BY_ID[l.from], yIn(i), 'into this,')))
  outs.forEach((l, i) => kids.push(row(l, NODE_BY_ID[l.to], yOut(i), 'from this,')))

  // Where you are standing: a blot of graphite pressed into the rail, ringed
  // by hand rather than struck with a compass.
  kids.push(s('circle', { cx: RAIL, cy, r: 8.4, fill: 'var(--paper)', opacity: 0.92 }))
  kids.push(s('path', {
    d: `M${RAIL + 8},${cy} C${RAIL + 8},${cy - 5.4} ${RAIL + 4.6},${cy - 8.2} ${RAIL - 0.4},${cy - 8}
        C${RAIL - 5.6},${cy - 7.8} ${RAIL - 8.2},${cy - 4.4} ${RAIL - 8},${cy + 0.6}
        C${RAIL - 7.8},${cy + 5.6} ${RAIL - 4.4},${cy + 8.2} ${RAIL + 0.8},${cy + 8}
        C${RAIL + 5.4},${cy + 7.8} ${RAIL + 8.1},${cy + 4.8} ${RAIL + 8},${cy - 0.8}`,
    fill: 'none', stroke: 'var(--graphite)', 'stroke-width': 1.6,
    'stroke-linecap': 'round', filter: 'url(#tooth)',
  }))
  kids.push(s('circle', { cx: RAIL, cy, r: 3, fill: 'var(--graphite)', filter: 'url(#tooth)' }))
  kids.push(s('text', { x: RAIL + 34, y: cy + 4, class: 'mm-label mm-self',
    text: clip(n.label, 32) }))

  const svg = s('svg', { class: 'minimap', viewBox: `0 0 ${W} ${H}`,
    width: W, height: H, role: 'img',
    'aria-label': `${ins.length} relations into this node, ${outs.length} out of it` }, kids)
  svg.addEventListener('click', e => {
    const r = e.target.closest?.('[data-node]')
    if (r) set({ pinned: r.dataset.node })
  })
  return svg
}

const clip = (t, n) => (t.length > n ? t.slice(0, n - 1).trimEnd() + '…' : t)

// A stroke rather than a rule. The centreline wavers by a fraction of a pixel,
// the nib lifts at both ends, and the width swells around `cy`: the hand
// leaning in where the current node sits. Built analytically, since the
// element is not in the document yet and cannot be measured.
function railStroke(top, bot, cy, x) {
  const span = Math.max(1, bot - top)
  const steps = 64
  const L = [], R = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const y = top + span * t
    const waver = Math.sin(t * 7.1 + 1.3) * 0.85 + Math.sin(t * 18.7) * 0.35
    const cx = x + waver
    const lift = Math.pow(Math.sin(Math.PI * Math.min(1, Math.max(0, t))), 0.32)
    const press = 1 - Math.min(1, Math.abs(y - cy) / (span * 0.55))
    const w = (0.55 + 1.5 * press * press) * lift + 0.12
    L.push([cx - w, y]); R.push([cx + w, y])
  }
  R.reverse()
  return 'M' + L.concat(R).map(p => `${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(' L') + ' Z'
}
