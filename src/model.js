// ---------------------------------------------------------------------------
// THE SHARED MODEL
// One data structure. Every view reads from it.
//
// Two encodings carry meaning, and nothing else does:
//
//   tier      how central a node is to the argument. 1 draws largest, 3 smallest.
//   strength  how strongly one thing leads to another. 3 draws heaviest.
//
// There is no detail panel, so the map has to say everything on its face and
// every label is written to stand on its own.
// ---------------------------------------------------------------------------

export const LAYERS = [
  {
    id: 'material', idx: 0, name: 'Material', role: 'What the thing is made of',
    material: 'graphite, cedar, wood-pulp paper', color: 'var(--graphite)',
    note: 'The deposit, the casing, the formula, the surface, and the trade that carried them.',
  },
  {
    id: 'practice', idx: 1, name: 'Practice & Knowledge', role: 'What people did with it',
    material: 'field observation', color: 'var(--cedar)',
    note: 'Adoption becomes observation, observation becomes diagrams, and thought moves onto the page.',
  },
  {
    id: 'institutions', idx: 2, name: 'Institutions', role: 'Where it was taught',
    material: 'salons, academies, ateliers', color: 'var(--lacquer)',
    note: 'The places that turned sketching from a talent into a method with a name.',
  },
  {
    id: 'legacy', idx: 3, name: 'Legacy', role: 'What the culture kept',
    material: 'curriculum, method, software', color: 'var(--eraser)',
    note: 'From the workshop schools to networked canvases that reproduce the pencil’s affordances.',
  },
]

export const LAYER_BY_ID = Object.fromEntries(LAYERS.map(l => [l.id, l]))

export const NODES = [
  // ---- MATERIAL ------------------------------------------------------------
  { id: 'm1', layer: 'material', tier: 1, label: 'Graphite discovered' },
  { id: 'm2', layer: 'material', tier: 2, label: 'Wood encased design' },
  { id: 'm3', layer: 'material', tier: 2, label: 'Standardized graphite formulas' },
  { id: 'm4', layer: 'material', tier: 1, label: 'Mass production' },
  { id: 'm5', layer: 'material', tier: 3, label: 'Wood-pulp paper' },
  { id: 'm6', layer: 'material', tier: 2, label: 'Paper economy' },
  { id: 'm7', layer: 'material', tier: 1, label: 'Global distribution' },

  // what the object affords once it is everywhere
  { id: 'a1', layer: 'material', tier: 1, label: 'A low cost inscription system' },
  { id: 'a2', layer: 'material', tier: 3, label: 'Variable in line and tone' },
  { id: 'a3', layer: 'material', tier: 3, label: 'Portable' },
  { id: 'a4', layer: 'material', tier: 3, label: 'Erasable' },
  { id: 'a5', layer: 'material', tier: 3, label: 'Dry medium' },

  // ---- PRACTICE & KNOWLEDGE ------------------------------------------------
  { id: 'p1', layer: 'practice', tier: 1, label: 'Increase in adoption' },
  { id: 'p2', layer: 'practice', tier: 2, label: 'Increased field observations' },
  { id: 'p3', layer: 'practice', tier: 1, label: 'Diagrams, sketches, schematics' },
  { id: 'p4', layer: 'practice', tier: 2, label: 'Iterations' },
  { id: 'p5', layer: 'practice', tier: 1, label: 'Externalized visual spatial provisional thought' },
  { id: 'p6', layer: 'practice', tier: 2, label: 'Increased archival knowledge' },

  // ---- INSTITUTIONS --------------------------------------------------------
  { id: 'i1', layer: 'institutions', tier: 2, label: 'Emergence of salons, guilds and associations' },
  { id: 'i2', layer: 'institutions', tier: 3, label: 'L’académie des beaux arts' },
  { id: 'i3', layer: 'institutions', tier: 2, label: 'Atelier and the studio critique culture' },
  { id: 'i4', layer: 'institutions', tier: 1, label: 'Sketch-to-think pedagogy' },
  { id: 'i5', layer: 'institutions', tier: 1, label: 'Rapid visualization of ideas' },

  // ---- LEGACY --------------------------------------------------------------
  { id: 'l1', layer: 'legacy', tier: 3, label: 'German workshop schools' },
  { id: 'l2', layer: 'legacy', tier: 1, label: 'Bauhaus and modern design pedagogy',
    sub: 'art, craft, and technology through making' },
  { id: 'l3', layer: 'legacy', tier: 2, label: '“Form follows function”' },
  { id: 'l4', layer: 'legacy', tier: 3, label: 'Swiss International Style' },
  { id: 'l5', layer: 'legacy', tier: 3, label: 'Modern minimalism' },
  { id: 'l6', layer: 'legacy', tier: 2, label: 'Sketches of inventions, machines, processes' },
  { id: 'l7', layer: 'legacy', tier: 2, label: 'Patent explosion' },
  { id: 'l8', layer: 'legacy', tier: 1, label: 'Spirit of sketching transcends physicality' },
  { id: 'l9', layer: 'legacy', tier: 1, label: 'Human-centered design thinking' },
  { id: 'l10', layer: 'legacy', tier: 2, label: 'Contemporary design-engineering pedagogy' },
  { id: 'l11', layer: 'legacy', tier: 1, label: 'Iterative design in digital formats' },
  { id: 'l12', layer: 'legacy', tier: 3, label: 'Harvard MDE',
    sub: 'sketch, prototype, critique and iteration remain central' },
  { id: 'l13', layer: 'legacy', tier: 2, label: 'Contemporary pencils: Figma, Miro, networked canvases, stylus' },

  // the break with classical rules, and what it opened
  { id: 'l14', layer: 'legacy', tier: 2, label: 'Sketching as a break from rigid classical rules' },
  { id: 'l15', layer: 'legacy', tier: 2, label: 'Experimentation' },
  { id: 'l16', layer: 'legacy', tier: 3, label: 'Degas, Van Gogh, Seurat graphite studies' },
  { id: 'l17', layer: 'legacy', tier: 3, label: 'Plein-air practice' },
  { id: 'l18', layer: 'legacy', tier: 3, label: 'Impressionism and other visual movements' },

  // the industrial line that runs into the Bauhaus
  { id: 'l19', layer: 'legacy', tier: 3, label: 'Industrial Revolution' },
  { id: 'l20', layer: 'legacy', tier: 3, label: 'Arts and Crafts Movement' },
  { id: 'l21', layer: 'legacy', tier: 3, label: 'Art Nouveau, Jugendstil and reform schools' },
  { id: 'l22', layer: 'legacy', tier: 3, label: 'Deutscher Werkbund' },
  { id: 'l23', layer: 'legacy', tier: 3, label: 'Pre-WWI modernism and industrial architecture' },
  { id: 'l24', layer: 'legacy', tier: 3, label: 'World War I, 1914–1918' },

  // and the education that carried it forward
  { id: 'l25', layer: 'legacy', tier: 2, label: '20th-century modern design education',
    sub: 'studio-based professional design disciplines' },
  { id: 'l26', layer: 'legacy', tier: 2, label: 'Late-20th and 21st-century design-engineering pedagogy',
    sub: 'design, engineering, computation, and systems thinking' },
]

export const NODE_BY_ID = Object.fromEntries(NODES.map(n => [n.id, n]))

// strength: 3 carries the argument, 2 supports it, 1 is a contributing detail
export const LINKS = [
  // material
  { from: 'm1', to: 'm2', strength: 2 },
  { from: 'm1', to: 'm3', strength: 2 },
  { from: 'm2', to: 'm4', strength: 3 },
  { from: 'm3', to: 'm4', strength: 3 },
  { from: 'm5', to: 'm6', strength: 2 },
  { from: 'm6', to: 'm4', strength: 2 },
  { from: 'm4', to: 'm7', strength: 3 },
  { from: 'm7', to: 'a1', strength: 3 },
  { from: 'a2', to: 'a1', strength: 1 },
  { from: 'a3', to: 'a1', strength: 1 },
  { from: 'a4', to: 'a1', strength: 1 },
  { from: 'a5', to: 'a1', strength: 1 },

  // into practice
  { from: 'a1', to: 'p1', strength: 3 },
  { from: 'm7', to: 'p1', strength: 2 },

  // practice
  { from: 'p1', to: 'p3', strength: 3 },
  { from: 'p1', to: 'p2', strength: 2 },
  { from: 'p2', to: 'p5', strength: 2 },
  { from: 'p3', to: 'p5', strength: 3 },
  { from: 'p3', to: 'p4', strength: 2 },
  { from: 'p4', to: 'p1', strength: 2 },
  { from: 'p5', to: 'p6', strength: 3 },

  // into institutions
  { from: 'p5', to: 'i4', strength: 3 },
  { from: 'p6', to: 'i4', strength: 2 },
  { from: 'p4', to: 'i4', strength: 1 },

  // institutions
  { from: 'i1', to: 'i2', strength: 2 },
  { from: 'i1', to: 'i4', strength: 2 },
  { from: 'i2', to: 'i3', strength: 2 },
  { from: 'i3', to: 'i4', strength: 2 },
  { from: 'i4', to: 'i5', strength: 3 },
  { from: 'i5', to: 'i3', strength: 1 },

  // into legacy
  { from: 'i5', to: 'l6', strength: 2 },
  { from: 'i3', to: 'l1', strength: 2 },

  // legacy
  { from: 'l1', to: 'l2', strength: 3 },
  { from: 'l2', to: 'l3', strength: 2 },
  { from: 'l3', to: 'l4', strength: 2 },
  { from: 'l4', to: 'l5', strength: 1 },
  { from: 'l3', to: 'l8', strength: 2 },
  { from: 'l6', to: 'l7', strength: 3 },
  { from: 'l6', to: 'l8', strength: 2 },
  { from: 'l8', to: 'l7', strength: 1 },
  { from: 'l8', to: 'l9', strength: 3 },
  { from: 'l7', to: 'l10', strength: 2 },
  { from: 'l9', to: 'l10', strength: 2 },
  { from: 'l7', to: 'l12', strength: 1 },
  { from: 'l10', to: 'l12', strength: 2 },
  { from: 'l9', to: 'l11', strength: 3 },
  { from: 'l5', to: 'l11', strength: 1 },
  { from: 'l11', to: 'l13', strength: 3 },

  // the break with classical rules
  { from: 'i3', to: 'l14', strength: 2 },
  { from: 'l14', to: 'l15', strength: 3 },
  { from: 'l15', to: 'l2', strength: 2 },
  { from: 'l15', to: 'l17', strength: 2 },
  { from: 'l17', to: 'l18', strength: 2 },
  { from: 'l16', to: 'l18', strength: 1 },

  // the industrial line into the Bauhaus
  { from: 'l7', to: 'l19', strength: 2 },
  { from: 'l19', to: 'l20', strength: 2 },
  { from: 'l20', to: 'l21', strength: 2 },
  { from: 'l21', to: 'l22', strength: 2 },
  { from: 'l22', to: 'l23', strength: 2 },
  { from: 'l23', to: 'l24', strength: 2 },
  { from: 'l24', to: 'l2', strength: 2 },

  // and the education that carried it forward
  { from: 'l3', to: 'l25', strength: 2 },
  { from: 'l5', to: 'l25', strength: 1 },
  { from: 'l25', to: 'l26', strength: 3 },
  { from: 'l9', to: 'l26', strength: 2 },
  { from: 'l26', to: 'l12', strength: 2 },
]

// Kept so the archived plates still run. The live views show everything.
export const GRADES = ['9H','7H','5H','4H','3H','2H','H','F','HB','B','2B','4B','6B','8B','9B']
export const GRADE_DEFAULT = 12

export function gradeSpec(i) {
  const t = i / (GRADES.length - 1)
  return {
    index: i, label: GRADES[i], t,
    weight: 0.45 + t * 2.15,
    ink: 0.30 + t * 0.70,
    tone: 0.06 + t * 0.30,
    grain: 0.10 + t * 0.55,
    detail: 3,
  }
}

export const DIRECTIONS = [
  { id: 'final3',  label: 'Final 3', caption: '' },
  { id: 'final2',  label: 'Final 2', caption: '' },
  { id: 'map2',    label: 'Map 2',   caption: '' },
  { id: 'stroke',  label: 'Stroke',  caption: '' },
  { id: 'descend', label: 'Final',   caption: '' },
  { id: 'section', label: 'Section', caption: '' },
  { id: 'slat',    label: 'Slat',    caption: '' },
]
