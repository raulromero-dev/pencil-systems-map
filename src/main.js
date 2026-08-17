import { s, clear } from './svg.js'
import { get, set, subscribe } from './state.js'
import { gradeSpec, GRADES, DIRECTIONS } from './model.js'
import { installTextures, preparePencil } from './texture.js'
import { buildChrome } from './chrome.js'
import { buildGate } from './gate.js'

import * as section from './directions/section.js'
import * as stroke from './directions/stroke.js'
import { GRADE_TRACK } from './directions/stroke.js'
import * as slat from './directions/slat.js'
import * as descend from './directions/descend.js'
import * as final2 from './directions/final2.js'
import * as final3 from './directions/final3.js'
import * as map2 from './directions/map2.js'
import { GRADE_TRACK as F2_TRACK } from './directions/final2.js'
import { GRADE_TRACK as DESCEND_TRACK } from './directions/descend.js'

const RENDERERS = { section, stroke, slat, descend, final2, final3, map2 }

// Deep-linkable view. Segments are read in any order, so #dark/6B and
// #6B/dark both work: /map#2B/grid, /map#dark, /map#slat/9B, /map#pin=e3
{
  const patch = {}
  for (const seg of location.hash.replace(/^#/, '').split('/').filter(Boolean)) {
    const key = seg.toLowerCase()
    if (DIRECTIONS.some(x => x.id === key)) { patch.direction = key; continue }
    const gi = GRADES.indexOf(seg.toUpperCase())
    if (gi >= 0) { patch.grade = gi; continue }
    if (key === 'grid') { patch.grid = true; continue }
    if (key === 'dark' || key === 'graphite') { patch.mode = 'graphite'; continue }
    if (key === 'light' || key === 'paper') { patch.mode = 'paper'; continue }
    if (key.startsWith('pin=')) patch.pinned = seg.slice(4)
  }
  if (Object.keys(patch).length) set(patch)
}

const root = document.getElementById('app')
const { svg } = buildChrome(root)

// defs shared by every direction
const defs = s('defs')
svg.appendChild(defs)
installTextures(defs)

// Photograph prepared once, before first paint, so the pencil never flashes
// as a white rectangle.
const [pencilSoft, pencilHard] = await Promise.all([
  preparePencil('/assets/pencil.png', true),
  preparePencil('/assets/pencil.png', false),
])
const assets = { pencil: pencilSoft, pencilHard }

// the layer everything draws into
let stageG = s('g')
svg.appendChild(stageG)

// The stroke plate fills the window rather than sitting letterboxed inside it,
// so its left edge IS the window's left edge and the pencil stays pinned there.
const PLATE_H = 940
function plateWidth() {
  const r = svg.getBoundingClientRect()
  if (!r.height) return 1600
  return Math.round(Math.min(2600, Math.max(1500, PLATE_H * (r.width / r.height))))
}

function draw() {
  const state = get()
  const dir = RENDERERS[state.direction]
  let vw = 1600
  const scrolls = !!dir.meta.scrolls
  root.dataset.scroll = scrolls ? '1' : ''
  if (scrolls) {
    vw = 1600                       // the renderer sets the tall viewBox itself
  } else if (['stroke', 'descend'].includes(state.direction)) {
    vw = plateWidth()
    svg.setAttribute('viewBox', `0 0 ${vw} ${PLATE_H}`)
  } else {
    svg.setAttribute('viewBox', dir.meta.viewBox)
  }

  const next = s('g')
  try {
    dir.render(next, { spec: gradeSpec(state.grade), state, svg, assets, vw })
  } catch (err) {
    console.error(`[${state.direction}] render failed`, err)
    next.appendChild(s('text', {
      x: 60, y: 80, class: 't-label', fill: 'var(--accent)',
      text: `Render error in "${state.direction}", see console.`,
    }))
  }
  svg.replaceChild(next, stageG)
  stageG = next
}

// ------------------------------------------------------------- interaction
// Opening the detail view is a click, never a hover. Reading is a deliberate
// act, and a panel that appears because the pointer drifted is a panel you did
// not ask for. Hover only emphasises the node it is over, and that emphasis is
// pure CSS, so moving across the plate costs no redraw at all.
svg.addEventListener('click', e => {
  if (e.target.closest?.('[data-grade]')) return
  const f = e.target.closest?.('[data-focus]')
  if (f) { set({ focus: f.dataset.focus, pinned: null, active: null }); return }
  const g = e.target.closest?.('[data-node]')
  set(g ? { pinned: g.dataset.node, active: g.dataset.node } : { pinned: null, active: null })
})

// ------------------------------------------------- dragging the grade dial
// Handlers live on the <svg>, which survives re-render; the dial itself is
// rebuilt on every state change.
let dragging = false
function gradeFromEvent(e) {
  const ctm = svg.getScreenCTM()
  if (!ctm) return
  const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse())
  const dir = get().direction
  const track = dir === 'descend' ? DESCEND_TRACK : dir === 'final2' ? F2_TRACK : GRADE_TRACK
  const f = (p.x - track.x0) / (track.x1 - track.x0)
  set({ grade: Math.round(Math.min(1, Math.max(0, f)) * (GRADES.length - 1)) })
}
svg.addEventListener('pointerdown', e => {
  if (!e.target.closest?.('[data-grade]')) return
  dragging = true
  svg.setPointerCapture(e.pointerId)
  gradeFromEvent(e)
})
svg.addEventListener('pointermove', e => { if (dragging) gradeFromEvent(e) })
const endDrag = e => {
  if (!dragging) return
  dragging = false
  try { svg.releasePointerCapture(e.pointerId) } catch {}
}
svg.addEventListener('pointerup', endDrag)
svg.addEventListener('pointercancel', endDrag)

addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT') return
  const st = get()
  const k = e.key.toLowerCase()
  if (k === '[') set({ grade: Math.max(0, st.grade - 1) })
  if (k === ']') set({ grade: Math.min(GRADES.length - 1, st.grade + 1) })
  if (k === 'g') set({ grid: !st.grid })
  if (k === 'd') set({ mode: st.mode === 'paper' ? 'graphite' : 'paper' })
  if (k === 'escape') set({ pinned: null, active: null })
})

// Only redraw the canvas when something the canvas cares about changes.
let last = ''
subscribe(st => {
  const key = [st.direction, st.grade, st.theme, st.grid, st.active, st.pinned, st.mode, st.focus].join('|')
  if (key !== last) { last = key; draw() }
})

draw()

let resizeTimer
addEventListener('resize', () => {
  clearTimeout(resizeTimer)
  resizeTimer = setTimeout(draw, 120)
})

// ------------------------------------------------------------------- routing
//   /        the sheet, then the map
//   /sheet   the sheet on its own
//   /final   straight to the map, no sheet
// /descend and /map remain as aliases so older links keep working.
const route = location.pathname.replace(/\/+$/, '') || '/'
if (route === '/final-2') set({ direction: 'final2' })
if (route === '/final-3') set({ direction: 'final3' })
if (route === '/map-2') set({ direction: 'map2' })
if (route === '/final' || route === '/descend') set({ direction: 'descend' })
if (route === '/map') set({ direction: 'stroke' })
const skipSheet = ['/final', '/final-2', '/final-3', '/map', '/map-2', '/descend'].includes(route) || location.hash.includes('nogate')

if (!skipSheet) {
  document.body.appendChild(buildGate(() => {
    // reflect the state in the URL, so a reload lands where you actually are
    history.replaceState({}, '', (get().direction === 'stroke' ? '/map' : '/final') + location.hash)
  }))
}
