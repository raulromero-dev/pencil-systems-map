# The Pencil's influence on thought

A systems map of the pencil, read not as an object but as the mechanism that
advanced thought. Static site, no dependencies, no build step.

**Live:** see the Vercel deployment linked in this repository.


A systems map of the pencil, read not as an object but as the mechanism that
advanced thought. The page opens on a blank sheet you can write on.

```
node serve.mjs      ->  http://localhost:5178
```

Nothing to install. `serve.mjs` is a zero-dependency static server that also
maps the routes below onto `index.html`; on Vercel the same job is done by
the rewrites in `vercel.json`.

| route | what it opens |
|---|---|
| `/` | the sheet, then the map |
| `/sheet` | the blank sheet on its own |
| `/map-2` | one continuous stroke, the sub-systems as stretches of a single mark |
| `/final-2` | four sections of cards, every node at full size |
| `/final-3` | the same page drawn with circles |
| `/final` | the single-screen version, one sub-system open at a time |
| `/map` | the earlier left-to-right fan |
| `/descend` | alias of `/final` |

`#section` and `#slat` reach two archived plates.

The sheet links straight through to `/final`. `/descend` and `/map` remain as
aliases so older links keep working; `/map` still serves the archived
left-to-right fan.

`/map` and `/descend` are the two structures of the same content. Separate URLs
so either can be opened, compared side by side, or debugged in isolation.
Entering from the sheet rewrites the URL to whichever you were on.

Separate URLs so either half can be opened and debugged in isolation. Entering
from the sheet rewrites the URL to `/map`, so a reload lands where you are.

Zero dependencies. Plain ES modules, hand-authored SVG, procedural texture.

---

## The sheet

Before the argument, the act. The page opens on blank paper, one ruled line
and a single word: **Think.** You make a mark, and only then does the map
explain what marks did. Nothing is asked of the drawing; the only requirement
is that it happened.

The brush is velocity-driven, because a real pencil lays down more graphite
when the hand slows and skips where it moves fast. Grain comes from stippling
along each segment rather than a texture overlay, so it holds up at any zoom.
`Rub out` lifts the marks in passes rather than clearing them in one go, erasure is the argument, so it gets a gesture.

The way out is **the pause, not a quota**. Once you have made a mark and the
hand comes to rest for a second, an arrow appears at the end of the line you
wrote on: a mark on the page rather than a labelled button. Click it to enter.
An earlier version gated this on an ink threshold set too high, which left the
button present but permanently unclickable.

The ground switch sits at the bottom of the sheet too, so the mode you choose
here carries into the map. `Enter` or `Esc` skips; `#nogate` bypasses the sheet
entirely.

## Core attributes

Three properties sit at the instrument, above the pencil:

**Erasability. Portability. Affordability.**

Not components and not outcomes: properties the object simply has. They are
printed along the barrel, the way a pencil carries its grade and maker, because
**every element of the system is a function of all three at once**. That is
also why no node is colour coded to one attribute: a swatch tying a node to a
single property would assert something the argument denies. Democratization and
mass production are consequences of affordability, not attributes, so they are
not listed.

The imprint is real text drawn over the photograph, not part of it. Gemini was
asked for both, and its sentence-case attempts came back misspelled
("Affordabilty"); only the all-caps versions were correct, and this interface
has no all-caps anywhere. Overlaying the type also means the wording can change
without regenerating the asset.

## The unifying idea

**The graphite grade is the interface**, and it lives on the instrument. The
dial sits under the photographed pencil at the fan origin, hardness is a
property of the pencil, so you set it at the pencil. Drag it from 9H to 9B and
it drives every visual property at once: stroke weight, ink opacity, grain
density, tone, *and how much of the map is disclosed.*

| Grade | Reads as | Shows |
|---|---|---|
| 9H – 2H | construction | tier 1, the spine only |
| H – B | primary + relations | tier 2 |
| 2B – 9B | full resolution | tier 3, constraints and edge cases |

Progressive disclosure stops being a UI affordance and becomes a physical
property of the instrument. Hard leads make faint construction lines; soft
leads commit. The map behaves the same way.

## Notation

One notation, and no key needed for it: **a circle is a thing, a line means
this leads to that.** There were three node kinds (mechanism, outcome,
constraint) and three link kinds (enables, constrains, feedback) before. The
distinctions cost more in legend than they paid back in meaning, so they are
gone. Prominence is carried by size instead: the spine of the argument draws
larger than its detail, which is also what the grade dial gates.

Links between the four sub-systems are deliberately sparse: one hand-off each,
so the seams read as seams rather than as noise.

## The four sub-systems

The map runs from the material fact outward to what the culture kept:

| | |
|---|---|
| **Material** | What the thing is made of. The Borrowdale deposit, Conté's composite, the paper economy, global distribution, and the external drivers that bear on them: geology, colonial extraction, scarcity. |
| **Practice & Knowledge** | What people did with it. Adoption becomes field observation, observation becomes diagrams, and thinking starts happening on the sheet rather than only in the head. |
| **Institutions** | Where it was taught. Salons, sketch-to-think pedagogy, studio critique, thumbnail sketching as method, and its codification at the d.school and IDEO. |
| **Institutional Legacy** | What the culture kept. 1750 to now, ending in software that reproduces the pencil's affordances. |

Two archived directions remain reachable by hash for reference: `#section`, an
exploded assembly plate, and `#slat`, a milled matrix.

## Controls

Everything is either on the drawing itself or a thin line along the bottom.

**The dial**, under the pencil, sets the grade. Drag it, or use `[` and `]`.

**The ground switch**, bottom right, is two drawn icons: an empty sheet and the
same sheet filled with graphite. It is on the sheet too, so the choice carries
through.

**The detail view opens on click, never on hover.** Reading is a deliberate
act, and a panel that appears because the pointer drifted is a panel you did
not ask for. Hover only emphasises the node it is over, and that emphasis is
pure CSS, so moving across the plate costs no redraw at all.

You don't close the panel, you **scrap it**: the control is a balled-up sheet,
and the note buckles, closes into itself, and is thrown toward that control.
`Esc` does the same without the animation.

The masthead mark is a 3x3 field of squares reading left to right the way the
object does: the eraser cell is left open so the sheet shows through it, and
the body is filled. The favicon is built from the same construction, with the
eraser cell painted rather than open, and inverts with the OS colour scheme.

`G` still toggles the construction overlay, which draws the scaffolding the
plate was built on: the anchor every pass fans from, the five ray angles, and
the sample lines where nodes land. It has no button because it is a designer's
view rather than a reader's.

Deep links read their segments in any order: `/map#2B/grid`, `/map#dark`,
`/map#erase`, `/map#pin=e3`, `/map#slat/9B`.

## Where the references land

The brief asked for two poles held in tension.

*Pencil, writing, art*, the material palette (cedar, graphite, brass, eraser
pink, nitrocellulose yellow) appears only where it literally denotes a
component. Paper tooth and graphite grain are generated procedurally in
`texture.js`: speckle plus laid fibre for the ground, directional streaks and
crumbs for the mark. The tooth carries into the detail drawer, so examining a
factor reads as looking closer at the same sheet rather than opening a window.
The cursor is a pencil, hotspot on its graphite point. The Stroke direction is
a drawing, not a diagram of one.

*Harvard GSD*, the identity's stated move is self-reflexive construction: the
mark "foregrounds the features of its own design and construction, just as Gund
Hall does," built from squares on a variable template that reacts to dynamic
conditions. Hence the `G` toggle, which exposes each direction's own scaffolding, module dimensions, explode offsets, fan angles, sample points, and hence a
system that is parametric rather than fixed. One grotesque throughout, no
all-caps anywhere, no second family: hierarchy comes from size, weight and
colour alone. There is no side panel, the drawing gets the full plate, and
every control is either on the instrument or a thin line of marginalia at the
top and bottom. Rules are hairlines, nothing is centred.

## Structure

```
assets/
  pencil.png            the photograph used in Stroke (long artist point)
  pencil-alt-a.png      classic no.2
  pencil-alt-b.png      classic no.2, longer barrel
src/
  model.js              the shared model, all three directions read from it
  state.js              observable store
  svg.js                element helpers, wrapping, geometry, glyphs
  texture.js            procedural paper tooth + graphite grain
  gate.js               the blank sheet, graphite brush, rub out
  chrome.js             masthead, drawer, footer
  main.js               orchestration, interaction, deep links
  directions/
    section.js  stroke.js  slat.js
```

`model.js` is the only file to touch for content. Three `THEMES` (the core
attributes), five `LAYERS` (the pencil's components read as strata of thought),
`NODES` tagged by layer / attribute / kind / tier, and `LINKS` typed
enables / constrains / feedback. **All node copy is
placeholder**, structurally correct, editorially provisional.

Adding a direction means writing one module that exports `render(g, ctx)` and
`meta`, then registering it in `main.js` and `DIRECTIONS`.

## Swapping the pencil

The photographs were generated, then trimmed to their content and measured for
where the graphite tip falls. `preparePencil()` in `texture.js` knocks the white
out to alpha at load, softly for paper (the cast shadow survives as a graded
edge) and hard for graphite mode (on a dark ground a pale shadow becomes a
halo). So the pencil sits *in* the sheet rather than on a white card.

To swap, change one line at the top of `directions/stroke.js`:

```js
const PENCIL = { src: '/assets/pencil.png', aspect: 10.720, tx: 0.9961, ty: 0.3986, lacEnd: 0.835 }
const IMPRINT = 'Erasability  ·  Portability  ·  Affordability'
```

`tx`/`ty` register the graphite tip to the fan origin, so every pass leaves the
point. Measured values for the alternates:

| file | aspect | tx | ty | lacEnd |
|---|---|---|---|---|
| `pencil.png` | 10.720 | 0.9961 | 0.3986 | 0.835 |
| `pencil-alt-a.png` | 10.184 | 0.9953 | 0.3741 | 0.843 |
| `pencil-alt-b.png` | 8.168 | 0.9952 | 0.3631 | 0.791 |

`lacEnd` is where the lacquer stops and the cedar cone begins, as a fraction of
the image width. The imprint has to sit inside that or it would be printed on
bare wood.
