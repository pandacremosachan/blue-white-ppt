# Portable trapezoid showcase

This example creates a compact 13-slide presentation with all 32 editable
trapezoid compositions and 16 source references. It uses the installed skill's
native drawing backend and requires Node.js 20 or later. Generation does not
need npm dependencies, network access, Python, or Microsoft PowerPoint.

Run the builder from an output directory outside the skill folder, using its
absolute path:

```sh
node /path/to/blue-white-ppt/assets/examples/trapezoid/build-deck.mjs --output ./trapezoid-creativity.pptx --manifest ./trapezoid-manifest.json
```

`--output` defaults to `./trapezoid-creativity.pptx` in the current working
directory. `--manifest` is optional. Existing output or manifest files are
refused unless `--overwrite` is supplied. Generated files must be outside the
skill source directory. Use `--help` for the command summary.

Every slide uses the original library's standard C02 summary strip at
`[48,94,1184,78]`, including the double-chevron marker and bold 23-design-px
summary. Main content starts at or below y=190, and every slide's main content
is enclosed in complete gray-blue outer panels. Case pages use four complete
gray-blue panel borders at `[48,190,578,240]`, `[654,190,578,240]`,
`[48,446,578,240]`, and `[654,446,578,240]`.
The Morph pages use `[48,190,330,494]` for the explanation and
`[400,190,832,494]` for the diagram. Source pages use the two column panels
`[48,190,578,494]` and `[654,190,578,494]`. Panels are inserted below content;
the Morph objects retain their positions, labels, and stable identities.
The opening guide labels its physical page references with `页` to distinguish
them from the chapter numbers in the header.

The diagrams are recomposed for a 550 × 155 comparison area, with four cases
per slide. The underlying 180-px coordinate layout reflows geometry and native
connection ports vertically; label fonts and text-box heights remain intact.
Their short labels use 20–30 design px, case titles use 26, and comparison
captions use 20. This is a new compact drawing layout rather than a scaled-down
version of the former single-case pages. The full mechanism,
application, variation, source observation, and interpretation boundary of
every case remain in the slide notes.

The drawings, labels, source links, and slide notes remain editable. The five
network links on slide 2 are native attached connectors between six nodes,
so they follow the nodes when those nodes move. Fold lines and road markings
remain ordinary illustrative lines. Slides 10 and 11 demonstrate one Morph
transition, with six stable identities for three trapezoids and their labels.
The local `morph.mjs` serializer is
experimental example code; it does not extend the public authoring API or the
C01–C39 component catalog. Its compatible fade fallback does not guarantee
identical playback in every viewer. Use a supported PowerPoint version to
inspect the transition.

Install the skill's bundled Noto Sans SC font on the viewing machine for the
reference text metrics. Font files are referenced, not embedded. Structural
validation runs during generation; visual or playback review requires a
renderer or presentation application.

## Page map

| Page | Chapter number | Content | Original pages |
|---|---|---|---|
| 1 | 1 | Selection guide and geometry controls; construction methods in notes | 1–3, 36 |
| 2 | 2.1 | Hierarchy and convergence: cases 01–04 | 4–7 |
| 3 | 2.2 | Gathering and surrounding: cases 05–08 | 8–11 |
| 4 | 2.3 | Folding and progression: cases 09–12 | 12–15 |
| 5 | 2.4 | Perspective and space: cases 13–16 | 16–19 |
| 6 | 2.5 | Focus and support: cases 17–20 | 20–23 |
| 7 | 2.6 | Objects and trade-offs: cases 21–24 | 24–27 |
| 8 | 2.7 | Rotation and assembly: cases 25–28 | 28–31 |
| 9 | 2.8 | Page divisions and framing: cases 29–32 | 32–35 |
| 10–11 | 3 | Native Morph states A and B | 37–38 |
| 12–13 | 4.1 / 4.2 | Linked source register | 39–40 |

`compact-diagrams.mjs` contains the 32 compact native compositions;
`compact-layout.mjs` composes the guide, comparison pages, Morph states, and
source pages. `deck-content.mjs` retains the full case descriptions. The
original full-size `diagrams-a.mjs` and `diagrams-b.mjs` remain available as
editable drawing references but are not used by the compact builder.

The optional manifest contains `slideCount: 13`, `creativeCases: 32`, eight
comparison entries in `slides`, 32 `casePages` records, and a complete
40-entry `slideMapping` from the original pages. Each comparison entry lists
its four case keys, original page numbers, and source relationships. Every
`slides` entry and `casePages` record includes a string `chapterNumber`.
`compactDesign` records the summary bounds, font, complete panel bounds, and
diagram height. The manifest also records native object counts and structural
validation. The standard C02 objects retain the library's `info.lead.*` names;
case panel names are the stable `comparison.case-frame.1` through `.4`.

`research-sources.json` records the external design sources and separates
their observed mechanisms from this example's extensions. All diagrams were
redrawn as native objects. The example does not include third-party template
files, screenshots, photographs, or downloaded illustration assets.
