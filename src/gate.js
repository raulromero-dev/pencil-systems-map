// ===========================================================================
// THE SHEET
// Before the argument, the act. A blank page and a pencil, you make a mark,
// then the map explains what marks did. Nothing is asked of the drawing; the
// only requirement is that it happened.
//
// The brush is velocity-driven: a real pencil lays down more graphite when the
// hand slows, and skips where it moves fast. Grain comes from stippling along
// the segment rather than from a texture overlay, so it survives any zoom.
// ===========================================================================
import { h, s, iconEraser, iconPaper, iconGraphite, constructionMark } from './svg.js'
import { get, set, subscribe } from './state.js'

const MARKED = 12      // any real mark counts; never gate on a quota of ink
const PAUSE_MS = 1000  // the hand comes to rest; the way out appears

export function buildGate(onEnter) {
  const canvas = h('canvas', { class: 'sheet-canvas' })
  const ctx = canvas.getContext('2d')

  const prompt = h('div', { class: 'sheet-prompt' }, [
    h('p', { class: 'sheet-ask', text: 'Think.' }),
  ])
  const rule = h('div', { class: 'sheet-rule' })

  // The way out is a mark on the line, not a label: it appears at the end of
  // the rule once the hand comes to rest.
  const enter = h('button', {
    class: 'sheet-enter', type: 'button',
    'aria-label': 'Enter the map', title: 'Enter the map',
    onclick: () => leave(),
  }, [
    s('svg', { viewBox: '0 0 44 44', 'aria-hidden': 'true' }, [
      s('circle', { class: 'ring', cx: 22, cy: 22, r: 20.5 }),
      s('path', { class: 'arrow', d: 'M15 22 L28 22 M23 17 L28 22 L23 27' }),
    ]),
  ])

  const rub = h('button', {
    class: 'sheet-rub', type: 'button', 'aria-pressed': 'false',
    'aria-label': 'Eraser', title: 'Eraser',
    onclick: () => setErasing(!erasing),
  }, [iconEraser()])

  // the same ground switch the map carries, so the sheet is not a special case
  const modeSeg = h('div', { class: 'seg', role: 'group', 'aria-label': 'Ground' }, [
    h('button', { type: 'button', 'data-mode': 'paper', 'aria-label': 'Paper', title: 'Paper',
      onclick: () => set({ mode: 'paper' }) }, [iconPaper()]),
    h('button', { type: 'button', 'data-mode': 'graphite', 'aria-label': 'Graphite', title: 'Graphite',
      onclick: () => set({ mode: 'graphite' }) }, [iconGraphite()]),
  ])
  const syncMode = st => {
    document.documentElement.dataset.mode = st.mode
    modeSeg.querySelectorAll('button').forEach(b =>
      b.setAttribute('aria-pressed', String(b.dataset.mode === st.mode)))
  }
  const unsubscribe = subscribe(syncMode)
  syncMode(get())

  const gate = h('div', { class: 'gate' }, [
    canvas,
    h('div', { class: 'sheet-head' }, [
      constructionMark(),
      h('h1', {}, [
        document.createTextNode("The Pencil's "),
        h('span', { text: 'influence on thought' }),
      ]),
    ]),
    rule,
    prompt,
    enter,
    h('div', { class: 'sheet-foot' }, [
      rub,
      h('a', { class: 'sheet-hint', href: '/final', text: 'skip to the map' }),
      modeSeg,
    ]),
  ])

  // ------------------------------------------------------------------ sizing
  let dpr = 1
  function fit() {
    const prev = canvas.width ? ctx.getImageData(0, 0, canvas.width, canvas.height) : null
    dpr = Math.min(2, window.devicePixelRatio || 1)
    canvas.width = Math.floor(innerWidth * dpr)
    canvas.height = Math.floor(innerHeight * dpr)
    canvas.style.width = innerWidth + 'px'
    canvas.style.height = innerHeight + 'px'
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    if (prev) ctx.putImageData(prev, 0, 0)
  }
  fit()
  addEventListener('resize', fit)

  // ------------------------------------------------------------- the brush
  let drawing = false, last = null, lastT = 0, ink = 0, done = false, vel = 0, erasing = false

  const graphite = () =>
    getComputedStyle(document.documentElement).getPropertyValue('--graphite').trim() || '#24252A'

  function stroke(x0, y0, x1, y1, speed) {
    const dx = x1 - x0, dy = y1 - y0
    const dist = Math.hypot(dx, dy)
    if (!dist) return

    // slow hand → broad, dark. fast hand → thin, skipping.
    // speed arrives as px/ms × 10: a slow drag is ~0.5, a fast one ~20.
    const press = Math.min(1, Math.max(0.38, 1 - speed / 15))
    const w = 1.3 + press * 3.7
    const alpha = 0.12 + press * 0.30

    const nx = -dy / dist, ny = dx / dist
    const steps = Math.max(1, Math.round(dist / 0.9))
    ctx.fillStyle = graphite()

    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      const px = x0 + dx * t, py = y0 + dy * t
      // a handful of grains per step, spread across the nib width
      const grains = 4 + Math.round(press * 7)
      for (let gI = 0; gI < grains; gI++) {
        const off = (Math.random() - 0.5) * 2 * w
        // graphite catches on the paper's high points, bias against the edges
        const bite = 1 - Math.abs(off) / (w * 1.35)
        if (Math.random() > bite * 0.94 + 0.06) continue
        ctx.globalAlpha = alpha * (0.45 + Math.random() * 0.55)
        const r = 0.32 + Math.random() * 0.7
        ctx.beginPath()
        ctx.arc(px + nx * off + (Math.random() - 0.5) * 0.7,
                py + ny * off + (Math.random() - 0.5) * 0.7, r, 0, 6.283)
        ctx.fill()
      }
    }
    ctx.globalAlpha = 1
    ink += dist * press
  }

  // The way out is offered when the hand comes to rest, not at some quota of
  // ink. You stop, and the page notices.
  let restTimer = null
  function watchForRest() {
    clearTimeout(restTimer)
    if (ink < MARKED) return
    restTimer = setTimeout(() => { done = true; gate.classList.add('written') }, PAUSE_MS)
  }

  const pos = e => {
    const r = canvas.getBoundingClientRect()
    return [e.clientX - r.left, e.clientY - r.top]
  }

  canvas.addEventListener('pointerdown', e => {
    canvas.setPointerCapture(e.pointerId)
    drawing = true
    last = pos(e); lastT = performance.now(); vel = 0
    clearTimeout(restTimer)
    gate.classList.add('marking')
    if (erasing) {
      ctx.globalCompositeOperation = 'destination-out'
      rub_at(last[0], last[1])
      ctx.globalCompositeOperation = 'source-over'
    }
  })
  canvas.addEventListener('pointermove', e => {
    if (!drawing) return
    const now = performance.now()
    const p = pos(e)
    // pointer events land every ~8-16ms; clamping avoids a 0ms gap reading as
    // infinite speed and washing the stroke out
    if (erasing) {
      erase(last[0], last[1], p[0], p[1])
      last = p; lastT = now
      return
    }
    const dt = Math.min(60, Math.max(5, now - lastT))
    const raw = Math.hypot(p[0] - last[0], p[1] - last[1]) / dt * 10
    vel = vel * 0.55 + raw * 0.45          // the hand has inertia; so does the line
    stroke(last[0], last[1], p[0], p[1], vel)
    last = p; lastT = now
  })
  const stop = () => {
    if (!drawing) return
    drawing = false
    watchForRest()
  }
  canvas.addEventListener('pointerup', stop)
  canvas.addEventListener('pointercancel', stop)
  canvas.addEventListener('pointerleave', stop)

  // --------------------------------------------------------------- the eraser
  // Erasure is the whole argument, so it is a tool you pick up rather than a
  // reset button: pick it up and the cursor becomes an eraser, then rub away
  // the parts you don't want. Rubber lifts graphite gradually, so each stamp
  // takes a fraction of what is there instead of punching a hole.
  const ERASER_R = 17

  function setErasing(v) {
    erasing = v
    rub.setAttribute('aria-pressed', String(v))
    gate.classList.toggle('erasing', v)
  }

  function rub_at(x, y, strength = 1) {
    const grad = ctx.createRadialGradient(x, y, 0, x, y, ERASER_R)
    grad.addColorStop(0, `rgba(0,0,0,${0.34 * strength})`)
    grad.addColorStop(0.55, `rgba(0,0,0,${0.20 * strength})`)
    grad.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(x, y, ERASER_R, 0, 6.283)
    ctx.fill()
  }

  function erase(x0, y0, x1, y1) {
    const dx = x1 - x0, dy = y1 - y0
    const dist = Math.hypot(dx, dy)
    const steps = Math.max(1, Math.round(dist / 3.5))
    ctx.globalCompositeOperation = 'destination-out'
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      rub_at(x0 + dx * t + (Math.random() - 0.5) * 1.6,
             y0 + dy * t + (Math.random() - 0.5) * 1.6)
    }
    ctx.globalCompositeOperation = 'source-over'
  }

  // ---------------------------------------------------------------- leaving
  let left = false
  function leave() {
    if (left) return
    left = true
    removeEventListener('resize', fit)
    removeEventListener('keydown', onKey)
    clearTimeout(restTimer)
    unsubscribe()
    gate.classList.add('out')
    setTimeout(() => { gate.remove(); onEnter() }, 620)
  }

  function onKey(e) {
    if (e.key === 'Enter' || e.key === 'Escape') leave()
  }
  addEventListener('keydown', onKey)

  return gate
}
