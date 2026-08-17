// Procedural physical texture. No image assets, no network.
// Two surfaces: paper tooth (the ground) and graphite grain (the mark).

// --- paper tooth ----------------------------------------------------------
// Fine speckle + a faint laid-fibre direction. Tiled as a CSS background.
export function paperTexture(size = 220, strength = 1) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')
  const img = ctx.createImageData(size, size)
  const d = img.data

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4
      // speckle
      let v = (Math.random() - 0.5) * 26
      // faint horizontal fibre
      v += Math.sin(y * 0.9 + Math.sin(x * 0.05) * 2) * 2.2
      // occasional darker fleck (recycled pulp)
      if (Math.random() < 0.0012) v -= 42
      const a = Math.abs(v) * strength
      d[i] = d[i + 1] = d[i + 2] = v > 0 ? 255 : 0
      d[i + 3] = Math.min(255, a * 2.4)
    }
  }
  ctx.putImageData(img, 0, 0)
  return c.toDataURL('image/png')
}

// --- graphite grain -------------------------------------------------------
// Directional stipple: graphite catches on the paper's high points, so the
// grain runs along the stroke and breaks up at low pressure.
export function graphiteTexture(size = 260) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')
  ctx.clearRect(0, 0, size, size)

  // short directional streaks
  for (let i = 0; i < 2600; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    const len = 1 + Math.random() * 5
    const ang = -0.42 + (Math.random() - 0.5) * 0.5
    ctx.strokeStyle = `rgba(0,0,0,${0.05 + Math.random() * 0.3})`
    ctx.lineWidth = Math.random() < 0.85 ? 0.6 : 1.3
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len)
    ctx.stroke()
  }
  // sparse heavy specks, graphite crumbs
  for (let i = 0; i < 240; i++) {
    ctx.fillStyle = `rgba(0,0,0,${0.15 + Math.random() * 0.4})`
    ctx.beginPath()
    ctx.arc(Math.random() * size, Math.random() * size, 0.3 + Math.random() * 0.9, 0, 6.284)
    ctx.fill()
  }
  return c.toDataURL('image/png')
}

// Inject both as CSS custom properties + an SVG <pattern> for mark fills.
export function installTextures(svgDefs) {
  const paper = paperTexture()
  const graphite = graphiteTexture()
  document.documentElement.style.setProperty('--paper-tex', `url(${paper})`)

  const NS = 'http://www.w3.org/2000/svg'
  const pat = document.createElementNS(NS, 'pattern')
  pat.setAttribute('id', 'grain')
  pat.setAttribute('patternUnits', 'userSpaceOnUse')
  pat.setAttribute('width', '260')
  pat.setAttribute('height', '260')
  const im = document.createElementNS(NS, 'image')
  im.setAttribute('href', graphite)
  im.setAttribute('width', '260')
  im.setAttribute('height', '260')
  pat.appendChild(im)
  svgDefs.appendChild(pat)

  // Arrowheads, one per relationship strength. markerUnits is userSpaceOnUse so
  // the head is sized by the strength of the link rather than by the width of
  // the line it happens to sit on.
  ;[['arw1', 7], ['arw2', 9], ['arw3', 12]].forEach(([id, size]) => {
    const m = document.createElementNS(NS, 'marker')
    m.setAttribute('id', id)
    m.setAttribute('viewBox', '0 0 10 10')
    m.setAttribute('refX', '9'); m.setAttribute('refY', '5')
    m.setAttribute('markerWidth', size); m.setAttribute('markerHeight', size)
    m.setAttribute('markerUnits', 'userSpaceOnUse')
    m.setAttribute('orient', 'auto-start-reverse')
    const p = document.createElementNS(NS, 'path')
    p.setAttribute('d', 'M0.5,1.6 L9,5 L0.5,8.4 z')
    p.setAttribute('fill', 'var(--graphite)')
    m.appendChild(p)
    svgDefs.appendChild(m)
  })

  // A displacement filter that gives hard vector edges a slight tooth.
  const f = document.createElementNS(NS, 'filter')
  f.setAttribute('id', 'tooth')
  f.setAttribute('x', '-6%'); f.setAttribute('y', '-6%')
  f.setAttribute('width', '112%'); f.setAttribute('height', '112%')
  f.innerHTML = `
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="1.1" xChannelSelector="R" yChannelSelector="G"/>`
  svgDefs.appendChild(f)
}

// --- product shot → paper -------------------------------------------------
// A photograph on white would sit on the page as a white box. Knock the white
// out to alpha, hard on the object, soft on the shadow, so the pencil lands
// in the paper and works on either ground.
// soft: keeps the cast shadow as a graded alpha, which reads on light paper.
// hard: drops it entirely, since on a dark ground any pale pixel reads as a
// white card sitting under the pencil.
export function preparePencil(src, soft = true) {
  return new Promise(resolve => {
    const img = new Image()
    img.onerror = () => resolve(src)
    img.onload = () => {
      const c = document.createElement('canvas')
      c.width = img.naturalWidth; c.height = img.naturalHeight
      const ctx = c.getContext('2d')
      ctx.drawImage(img, 0, 0)
      const d = ctx.getImageData(0, 0, c.width, c.height)
      const p = d.data
      const ramp = (v, a, b) => Math.min(1, Math.max(0, (v - a) / (b - a)))

      for (let i = 0; i < p.length; i += 4) {
        const r = p[i], g = p[i + 1], b = p[i + 2]
        if (soft) {
          // distance from white: keeps the cast shadow as a graded edge, which
          // is what you want sitting on light paper
          const dist = 255 - Math.min(r, g, b)
          p[i + 3] = dist < 7 ? 0 : dist < 42 ? Math.round(((dist - 7) / 35) * 255) : 255
          continue
        }
        // On a dark ground the shadow reads as a white card under the pencil,
        // and it runs down to luminance ~120, so a plain white-distance cut
        // cannot remove it. The pencil is either coloured (lacquer, cedar) or
        // very dark (graphite); the shadow is neutral and mid. Separate on that.
        const max = Math.max(r, g, b), min = Math.min(r, g, b)
        const sat = max - min
        const lum = (r + g + b) / 3
        p[i + 3] = Math.round(255 * Math.max(ramp(sat, 14, 32), 1 - ramp(lum, 95, 130)))
      }
      ctx.putImageData(d, 0, 0)
      resolve(c.toDataURL('image/png'))
    }
    img.src = src
  })
}
