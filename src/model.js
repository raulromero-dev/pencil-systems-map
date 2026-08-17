// ---------------------------------------------------------------------------
// THE SHARED MODEL
// One data structure. Every direction reads from it.
// ---------------------------------------------------------------------------

// The pencil's core attributes. Not components, not outcomes: properties the
// object simply has. Every element of the system is a function of ALL THREE at
// once, which is why they are stamped on the instrument itself and never
// colour coded onto a node.
//
// The per-node `theme` field below is a coarse secondary index, used only by
// the archived `slat` view to give that matrix its columns. It says which
// attribute a node most obviously expresses, not which one it belongs to.
export const THEMES = {
  erase:  { id: 'erase',  label: 'Erasability',   blurb: 'A mark that can be withdrawn.' },
  port:   { id: 'port',   label: 'Portability',   blurb: 'A tool that needs nothing but itself.' },
  afford: { id: 'afford', label: 'Affordability', blurb: 'Cheap enough to stop thinking about.' },
}

// The four sub-systems, running from the material fact outward to what the
// culture kept once the instrument stopped being the point.
export const LAYERS = [
  {
    id: 'material', idx: 0, name: 'Material', role: 'What the thing is made of',
    material: 'graphite, clay, cedar', color: 'var(--graphite)',
    note: 'The deposit, the recipe, the surface to draw on, and the trade that moved them.',
  },
  {
    id: 'practice', idx: 1, name: 'Practice & Knowledge', role: 'What people did with it',
    material: 'field observation', color: 'var(--cedar)',
    note: 'Adoption becomes observation, observation becomes diagrams, diagrams become a way of holding thought outside the head.',
  },
  {
    id: 'institutions', idx: 2, name: 'Institutions', role: 'Where it was taught',
    material: 'academies, studios', color: 'var(--lacquer)',
    note: 'Salons, art schools, design studios and consultancies that turned sketching from a talent into a method.',
  },
  {
    id: 'legacy', idx: 3, name: 'Institutional Legacy', role: 'What the culture kept',
    material: 'curriculum, method', color: 'var(--eraser)',
    note: 'Two and a half centuries of drawing culture, ending in software that reproduces the pencil’s affordances.',
  },
]

export const LAYER_BY_ID = Object.fromEntries(LAYERS.map(l => [l.id, l]))

// kind: mechanism (how it works) | outcome (what it produced) | constraint (what bears on it)
// tier: 1 = always visible · 2 = mid detail · 3 = deep detail
export const NODES = [
  // ---- MATERIAL ------------------------------------------------------------
  { id: 'm1', layer: 'material', theme: 'afford', kind: 'mechanism', tier: 1, label: 'Graphite discovered',
    body: 'Borrowdale, c.1560s. A single deposit pure enough to saw straight into sticks. Misread as a kind of lead, and the name stuck.' },
  { id: 'm2', layer: 'material', theme: 'afford', kind: 'mechanism', tier: 1, label: 'Manufacturing innovation',
    body: 'Conté, 1795. Powdered graphite kneaded with clay and kiln-fired. A found material becomes a formulated one, and its darkness becomes a recipe.' },
  { id: 'm3', layer: 'material', theme: 'afford', kind: 'mechanism', tier: 2, label: 'Paper economy',
    body: 'A marking tool is worth nothing without an affordable surface. Cheap paper is the silent precondition for everything downstream.' },
  { id: 'm4', layer: 'material', theme: 'afford', kind: 'outcome', tier: 1, label: 'Global distribution',
    body: 'The same instrument reaches hands on every continent, at a price below deliberation.' },
  { id: 'm5', layer: 'material', theme: 'afford', kind: 'constraint', tier: 3, label: 'Geology and natural deposits',
    body: 'External driver. Where the mineral happens to sit decides who holds the advantage, and for how long.' },
  { id: 'm6', layer: 'material', theme: 'afford', kind: 'constraint', tier: 3, label: 'Colonial extraction',
    body: 'External driver. Cedar, graphite and rubber arrive through extractive supply chains. The instrument of free thought has an unfree supply line.' },
  { id: 'm7', layer: 'material', theme: 'afford', kind: 'constraint', tier: 2, label: 'Material scarcity',
    body: 'External driver. Scarcity is what forced the composite: a blockaded army could not buy English graphite, so it had to be reinvented.' },

  // ---- PRACTICE & KNOWLEDGE ------------------------------------------------
  { id: 'p1', layer: 'practice', theme: 'port', kind: 'mechanism', tier: 1, label: 'Increase in adoption',
    body: 'The tool becomes ordinary. Nothing to prepare, nothing to spill, nothing to dry: the gap between an intention and a mark goes to zero.' },
  { id: 'p2', layer: 'practice', theme: 'port', kind: 'outcome', tier: 1, label: 'Increased field observations',
    body: 'Recording moves to wherever the subject is: being in nature, in mines, on the battlefield. The place of thought stops being the place of ink.' },
  { id: 'p3', layer: 'practice', theme: 'erase', kind: 'outcome', tier: 1, label: 'Diagrams, sketches, schematics',
    body: 'Observation gets set down as drawing rather than prose. The diagram becomes the native format of an explanation.' },
  { id: 'p4', layer: 'practice', theme: 'erase', kind: 'mechanism', tier: 2, label: 'World knowledge systems',
    body: 'The accumulated store of what is known and written down, which the diagrams feed into and draw back out of.' },
  { id: 'p4b', layer: 'practice', theme: 'erase', kind: 'mechanism', tier: 2, label: 'Iterations',
    body: 'Because a line can be withdrawn, a drawing can be argued with. Knowledge accumulates by revision rather than by replacement.' },
  { id: 'p5', layer: 'practice', theme: 'erase', kind: 'outcome', tier: 1, label: 'Externalizing thought at scale',
    body: 'The pivot of the whole map. Thinking stops happening only in the head and starts happening on the sheet, where it can be inspected.' },
  { id: 'p6', layer: 'practice', theme: 'afford', kind: 'outcome', tier: 2, label: 'New working memory on paper',
    body: 'A new working memory for society, and one no longer restricted to clerics and clerks. It expands to common folk.' },
  { id: 'p7', layer: 'practice', theme: 'erase', kind: 'outcome', tier: 2, label: 'New shared model for phenomena',
    body: 'A shared model for describing and documenting phenomena for people. It evolves iteratively as more people draw into it.' },

  // ---- INSTITUTIONS --------------------------------------------------------
  { id: 'i1', layer: 'institutions', theme: 'port', kind: 'mechanism', tier: 2, label: 'Salons for discussion',
    body: 'Salons for intellectual and artistic discussion. Europe, 17th to 18th centuries. Drawing becomes something done in company and defended out loud.' },
  { id: 'i2', layer: 'institutions', theme: 'erase', kind: 'mechanism', tier: 1, label: 'Sketch-to-think pedagogy',
    body: '20th-century art and design education. The Bauhaus broke explicitly with academic copying and built foundational courses around direct, process-based drawing exercises.' },
  { id: 'i3', layer: 'institutions', theme: 'erase', kind: 'outcome', tier: 1, label: 'Rapid visualization of ideas',
    body: 'Increased emphasis on getting an idea out fast, to where other people can see it, rather than on finished rendering.' },
  { id: 'i4', layer: 'institutions', theme: 'erase', kind: 'outcome', tier: 2, label: 'Studio critique culture',
    body: 'Work is pinned up unfinished and argued over. The provisional drawing becomes a social object rather than a private one.' },
  { id: 'i5', layer: 'institutions', theme: 'port', kind: 'outcome', tier: 2, label: 'Rapid thumbnail sketching',
    body: 'Influential figures in fine arts, industrial design, architecture and UI/UX all rely on rapid thumbnail sketching. Dieter Rams, Le Corbusier, and on.' },
  { id: 'i6', layer: 'institutions', theme: 'afford', kind: 'outcome', tier: 3, label: 'Formalized: d.school, IDEO',
    body: 'Most visibly formalized in places like Stanford’s d.school and design consultancies like IDEO.' },

  // ---- INSTITUTIONAL LEGACY ------------------------------------------------
  { id: 'l1', layer: 'legacy', theme: 'port', kind: 'outcome', tier: 1, label: '1750–1800 Enlightenment drawing culture',
    body: 'Academies, anatomical studies, architectural drawing, scientific observation.' },
  { id: 'l2', layer: 'legacy', theme: 'port', kind: 'outcome', tier: 3, label: '1800–1850 Romanticism and travel sketching',
    body: 'Quick portable observation.' },
  { id: 'l3', layer: 'legacy', theme: 'port', kind: 'outcome', tier: 3, label: '1830–1870 Barbizon and plein-air practice',
    body: 'The sketch becomes a way of training perception.' },
  { id: 'l4', layer: 'legacy', theme: 'erase', kind: 'outcome', tier: 3, label: '1848–1880 Realism',
    body: 'Direct study of the ordinary.' },
  { id: 'l5', layer: 'legacy', theme: 'erase', kind: 'outcome', tier: 3, label: '1860s–1880s Impressionism',
    body: 'Fleeting perception.' },
  { id: 'l6', layer: 'legacy', theme: 'erase', kind: 'outcome', tier: 2, label: 'Late 19th to early 20th c. Modern sketch culture',
    body: 'The sketch is increasingly valued as process, and sometimes as artwork in itself. Artist sketchbooks become records of thought.' },
  { id: 'l6b', layer: 'legacy', theme: 'afford', kind: 'outcome', tier: 3, label: '1890s–1910s Academic drawing reform',
    body: 'Modern art schools. Pencil and black chalk remain standard training media.' },
  { id: 'l7', layer: 'legacy', theme: 'erase', kind: 'mechanism', tier: 1, label: '1919–1933 Bauhaus and modern design pedagogy',
    body: 'Sketching, then concept development, then iteration. Drawing migrates more explicitly into design methodology.' },
  { id: 'l8', layer: 'legacy', theme: 'erase', kind: 'outcome', tier: 1, label: '20th c. to present: design and architecture practice',
    body: 'Ideation sketches, diagrams, prototypes, storyboards and concept art. Sketch as externalized thinking.' },
  { id: 'l9', layer: 'legacy', theme: 'erase', kind: 'outcome', tier: 1, label: 'The spirit of sketching transcends physicality',
    body: 'The habit outlives its instrument. What was learned with graphite is now practised without it.' },
  { id: 'l10', layer: 'legacy', theme: 'erase', kind: 'outcome', tier: 2, label: 'Iterative design in digital formats',
    body: 'Undo, layers, line weights, draft versus release. Though of course pencils remain in mass production and standardized usage.' },
]

export const NODE_BY_ID = Object.fromEntries(NODES.map(n => [n.id, n]))

// One kind of relationship only: A leads to B. The map had three (enables,
// constrains, feedback) and the distinction cost more in legend than it paid
// back in meaning. Links between the four sub-systems are deliberately sparse:
// one hand-off each, so the seams read as seams rather than as noise.
export const LINKS = [
  // material
  { from: 'm5', to: 'm1', tier: 3 },
  { from: 'm6', to: 'm4', tier: 3 },
  { from: 'm7', to: 'm2', tier: 2 },
  { from: 'm1', to: 'm2', tier: 1 },
  { from: 'm2', to: 'm4', tier: 1 },
  { from: 'm3', to: 'm4', tier: 2 },
  // material into practice
  { from: 'm4', to: 'p1', tier: 1 },
  { from: 'm3', to: 'p3', tier: 2 },
  // practice
  { from: 'p1', to: 'p2', tier: 1 },
  { from: 'p2', to: 'p3', tier: 1 },
  { from: 'p4', to: 'p4b', tier: 2 },
  { from: 'p4b', to: 'p3', tier: 2 },
  { from: 'p3', to: 'p4', tier: 2 },
  { from: 'p3', to: 'p5', tier: 1 },
  { from: 'p5', to: 'p6', tier: 2 },
  { from: 'p6', to: 'p7', tier: 2 },
  // the one hand-off into institutions
  { from: 'p5', to: 'i2', tier: 1 },
  { from: 'p3', to: 'i1', tier: 2 },
  // institutions
  { from: 'i1', to: 'i2', tier: 2 },
  { from: 'i2', to: 'i3', tier: 1 },
  { from: 'i3', to: 'i4', tier: 2 },
  { from: 'i4', to: 'i5', tier: 2 },
  { from: 'i5', to: 'i6', tier: 3 },
  // the one hand-off into legacy
  { from: 'i2', to: 'l7', tier: 1 },
  { from: 'i3', to: 'l8', tier: 1 },
  { from: 'i5', to: 'l8', tier: 2 },
  // legacy. The dated entries are a chronology, so their order carries the
  // sequence and they need no edges of their own.
  { from: 'l1', to: 'l2', tier: 3 },
  { from: 'l2', to: 'l3', tier: 3 },
  { from: 'l3', to: 'l4', tier: 3 },
  { from: 'l4', to: 'l5', tier: 3 },
  { from: 'l5', to: 'l6', tier: 3 },
  { from: 'l6', to: 'l6b', tier: 3 },
  { from: 'l6b', to: 'l7', tier: 3 },
  { from: 'l7', to: 'l8', tier: 1 },
  { from: 'l8', to: 'l9', tier: 1 },
  { from: 'l9', to: 'l10', tier: 2 },
  // and the habit returns to the practice that made it
  { from: 'l9', to: 'p5', tier: 2 },
]

// ---------------------------------------------------------------------------
// GRADE SCALE, the parametric spine of the whole page.
// Harder: fainter, thinner, fewer tiers revealed (construction).
// Softer: darker, heavier, full detail (resolution).
// ---------------------------------------------------------------------------
export const GRADES = ['9H','7H','5H','4H','3H','2H','H','F','HB','B','2B','4B','6B','8B','9B']
export const GRADE_DEFAULT = 3 // 4H, the spine only, at full size

export function gradeSpec(i) {
  const t = i / (GRADES.length - 1)
  return {
    index: i,
    label: GRADES[i],
    t,
    weight: 0.45 + t * 2.15,
    ink: 0.30 + t * 0.70,
    tone: 0.06 + t * 0.30,
    grain: 0.10 + t * 0.55,
    detail: t < 0.28 ? 1 : t < 0.62 ? 2 : 3,
  }
}

export const DIRECTIONS = [
  { id: 'final3',  label: 'Final 3', caption: '' },
  { id: 'map2',    label: 'Map 2',   caption: '' },
  { id: 'final2',  label: 'Final 2', caption: '' },
  { id: 'stroke',  label: 'Stroke',  caption: 'Tonal build-up. Each sub-system is one pass of the hand.' },
  { id: 'descend', label: 'Final',   caption: '' },
  { id: 'section', label: 'Section', caption: 'Exploded assembly. The instrument opened on two axes.' },
  { id: 'slat',    label: 'Slat',    caption: 'Construction grid. Milled slats crossed by arguments.' },
]
