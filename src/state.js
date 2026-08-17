// Minimal observable store. No framework.
import { GRADE_DEFAULT } from './model.js'

const state = {
  direction: 'descend',  // the chosen view; stroke/section/slat remain reachable by hash
  grade: GRADE_DEFAULT,
  theme: null,        // null = all themes; otherwise a theme id (filter)
  grid: false,        // reveal the construction grid (GSD self-reflexive toggle)
  mode: 'paper',      // 'paper' | 'graphite'
  active: null,       // hovered/selected node id
  pinned: null,       // clicked node id
  focus: 'material',  // which sub-system is opened in the /final-2 view
}

const subs = new Set()

export function get() { return state }

export function set(patch) {
  let changed = false
  for (const k in patch) {
    if (state[k] !== patch[k]) { state[k] = patch[k]; changed = true }
  }
  if (changed) subs.forEach(fn => fn(state))
}

export function subscribe(fn) { subs.add(fn); return () => subs.delete(fn) }
