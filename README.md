# The Pencil's influence on visual communication

A systems map of the pencil, read not as an object but as the mechanism that
shaped how we communicate visually. Static site, no dependencies, no build step.

```
node serve.mjs      ->  http://localhost:5178
```

Nothing to install. `serve.mjs` is a zero-dependency static server that maps the
routes below onto `index.html`; on Vercel the same job is done by the rewrite in
`vercel.json`.

| route | what it opens |
|---|---|
| `/` | the sheet, then the map |
| `/sheet` | the blank sheet on its own |
| `/final-3` | circles, sized by how central a node is (**the preferred view**) |
| `/final-2` | the same map drawn as cards |
| `/map-2` | one continuous stroke, the sub-systems as stretches of a single mark |
| `/final-4` | a poster: four circles as a rosette around the instrument |
| `/final-5` | a process plate: dashed zones, orthogonal routing, attribute rails |

## The sheet

Before the argument, the act. The page opens on blank paper, one ruled line and
a single word: **Think.** You make a mark, and only then does the map explain
what marks did.

The brush is velocity-driven, because a real pencil lays down more graphite when
the hand slows and skips where it moves fast. Grain comes from stippling along
each segment rather than a texture overlay, so it holds at any zoom. The eraser
is a tool you pick up, not a reset button: the cursor becomes an eraser and you
rub away only the parts you don't want.

The way out is the pause, not a quota. Once you have made a mark and the hand
comes to rest for a second, an arrow appears at the end of the line you wrote on.

## Notation

Two encodings carry meaning, and nothing else does.

**Size is importance.** A circle grows with how central its node is to the
argument, on top of the room its words need. A `tier: 1` node is a claim the map
turns on; `tier: 3` is a contributing detail. The ring thickens with it, so the
weighting still reads where two labels happen to be the same length.

**Line weight is strength.** `strength: 3` carries the argument, `2` supports it,
`1` is a contributing detail. Links that cross from one sub-system to the next
are drawn slightly heavier again, because those are the seams.

There is no key for either, and no detail panel. The map has to say everything
on its face, so every label is written to stand on its own.

## The four sub-systems

| | |
|---|---|
| **Material** | What the thing is made of. Graphite, the wood casing, standardized formulas, mass production, the paper economy, global distribution, and the affordances that follow: low cost, variable in line and tone, portable, erasable, dry. |
| **Practice & Knowledge** | What people did with it. Adoption becomes field observation, observation becomes diagrams, and thought moves onto the page as something provisional and spatial. |
| **Institutions** | Where it was taught. Salons and guilds, the académie, the atelier and its critique culture, sketch-to-think pedagogy, rapid visualization. |
| **Legacy** | What the culture kept. From the German workshop schools and the Bauhaus through form-follows-function, the patent explosion and human-centered design, to networked canvases that reproduce the pencil's affordances. |

## Structure

```
assets/
  pencil.png            the photograph used in every view
  pencil-alt-a.png      alternates, measured in the table below
  pencil-alt-b.png
src/
  model.js              the only file to touch for content
  state.js              observable store
  svg.js                element helpers, wrapping, geometry, icons
  texture.js            procedural paper tooth and graphite grain
  gate.js               the blank sheet: graphite brush, eraser tool
  chrome.js             masthead and ground switch
  main.js               orchestration and routing
  directions/
    final3.js  final2.js  map2.js  final4.js  final5.js
```

`model.js` holds four `LAYERS`, the `NODES` tagged by layer and tier (with an
optional `sub` for a secondary line), and the `LINKS` tagged by strength. Adding a view means writing one module that exports
`render(g, ctx)` and `meta`, then registering it in `main.js`.

## The pencil

The photograph carries the three core attributes stamped along its barrel. Both
the image and the imprint were generated, then the image was trimmed to the
pencil body so no cast shadow inflates it, and measured for where the graphite
tip falls.

`preparePencil()` in `texture.js` knocks the white out to alpha at load: softly
for paper, where the cast shadow survives as a graded edge, and hard for
graphite mode, where any pale pixel would read as a white card under the pencil.
So the pencil sits *in* the sheet rather than on it.

To swap, change one line at the top of a view:

```js
const PENCIL = { src: '/assets/pencil.png', aspect: 15.242, tx: 0.9980, ty: 0.4848 }
```

| file | aspect | tx | ty |
|---|---|---|---|
| `pencil.png` | 15.242 | 0.9980 | 0.4848 |
| `pencil-alt-a.png` | 10.184 | 0.9953 | 0.3741 |
| `pencil-alt-b.png` | 8.168 | 0.9952 | 0.3631 |

`tx`/`ty` register the graphite tip, so a line drawn from the point genuinely
leaves the point.

## Ground

Paper or graphite, switched bottom right or with `D`. Both are designed; the
dark one is not an inversion. Textures, the pencil's alpha cut, and the halo
behind every label all follow the ground.
