import { s } from './svg.js'
import { get, set, subscribe } from './state.js'
import { installTextures, preparePencil } from './texture.js'
import { buildChrome } from './chrome.js'
import { buildGate } from './gate.js'

import * as final3 from './directions/final3.js'
import * as final2 from './directions/final2.js'
import * as map2 from './directions/map2.js'

const RENDERERS = { final3, final2, map2 }

// #dark and #light are the only hash options left
{
  const h = location.hash.replace(/^#/, '').toLowerCase()
  if (h === 'dark' || h === 'graphite') set({ mode: 'graphite' })
  if (h === 'light' || h === 'paper') set({ mode: 'paper' })
}

const root = document.getElementById('app')
const { svg } = buildChrome(root)

const defs = s('defs')
svg.appendChild(defs)
installTextures(defs)

// The photograph is prepared once, before first paint, so the pencil never
// flashes as a white rectangle. Two cuts: soft for paper, hard for graphite.
const [pencilSoft, pencilHard] = await Promise.all([
  preparePencil('/assets/pencil.png', true),
  preparePencil('/assets/pencil.png', false),
])
const assets = { pencil: pencilSoft, pencilHard }

let stageG = s('g')
svg.appendChild(stageG)

function draw() {
  const state = get()
  const dir = RENDERERS[state.direction] || RENDERERS.final3
  root.dataset.scroll = '1'

  const next = s('g')
  try {
    dir.render(next, { state, svg, assets })
  } catch (err) {
    console.error(`[${state.direction}] render failed`, err)
    next.appendChild(s('text', { x: 60, y: 80, class: 't-label',
      fill: 'var(--accent)', text: `Render error in "${state.direction}", see console.` }))
  }
  svg.replaceChild(next, stageG)
  stageG = next
}

addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT') return
  if (e.key.toLowerCase() === 'd') set({ mode: get().mode === 'paper' ? 'graphite' : 'paper' })
})

let last = ''
subscribe(st => {
  const key = [st.direction, st.mode].join('|')
  if (key !== last) { last = key; draw() }
})

draw()

let resizeTimer
addEventListener('resize', () => {
  clearTimeout(resizeTimer)
  resizeTimer = setTimeout(draw, 140)
})

// ------------------------------------------------------------------- routing
//   /          the sheet, then the map
//   /sheet     the blank sheet on its own
//   /final-3   circles, sized by how central a node is   (the preferred one)
//   /final-2   cards
//   /map-2     one continuous stroke
const route = location.pathname.replace(/\/+$/, '') || '/'
const BY_ROUTE = { '/final-3': 'final3', '/final-2': 'final2', '/map-2': 'map2' }
if (BY_ROUTE[route]) set({ direction: BY_ROUTE[route] })

const onSheet = route === '/' || route === '/sheet'
if (onSheet) {
  document.body.appendChild(buildGate(() => {
    history.replaceState({}, '', '/final-3')
  }))
}
