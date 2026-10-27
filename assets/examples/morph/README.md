# Compact native Morph example

This portable Node.js example creates a **14-slide editable presentation** with
the same ten effect families as the original 22-slide Morph reference. It uses
only the packaged drawing backend, ZIP/XML helpers, and Node built-ins. It does
not require PowerPoint COM, private prototype modules, npm packages, screenshots,
or the historical reference PPTX at build time.

```sh
node /path/to/blue-white-ppt/assets/examples/morph/build-compact.mjs \
  --output /path/to/output/morph-effects-compact.pptx \
  --manifest /path/to/output/morph-effects-compact.manifest.json
```

Use `--overwrite` to replace an existing generated target. Generated files must
be outside the skill directory. Paths are resolved from the command's working
directory, while bundled sources are resolved from the script's own location.

## How the fourteen slides work

| Slides | Chapter number | Two simultaneous editable scenes | Native transition on result slide |
|---|---|---|---|
| 1 | 1 | Reading map for the ten families | None |
| 2–3 | 2.1 | Global-to-local focus + moving spotlight | `byObject` on 3 |
| 4–5 | 2.2 | Layered parallax + card focus transfer | `byObject` on 5 |
| 6–7 | 2.3 | Shape/rotation + separated layers | `byObject` on 7 |
| 8–9 | 2.4 | Equation-token movement + data marks | `byObject` on 9 |
| 10–11 | 3.1 | Word rearrangement | `byWord` on 11 |
| 12–13 | 3.2 | Character rearrangement | `byChar` on 13 |
| 14 | 4 | Mode selection, matching and sources | None |

Eight object-mode families share four pairs; the word and character families
have their own pairs. This gives **ten effect families and six native Morph
transitions**. A transition's word/character matching option applies to its
whole result slide, so those two modes cannot be merged into a single result
slide while retaining both modes. Every result slide includes the native Morph
element in an `mc:AlternateContent` choice, a 1.7-second duration, and a fade
fallback. Initial slides remain intact.

The header number identifies the **chapter**, so both states of a pair have the
same number. The footer independently shows the actual page number and total.
All fourteen pages keep the reference library's C02 summary at
`[48,94,1184,78]`, the double C04 chevrons, and 23-design-pixel bold summary
text. Short page titles stay within the darker part of the blue gradient.

Body objects start at or below y=190. Each object example's complete column,
including its heading, native scene and caption, sits in one grey-blue fine
frame at `[62,190,552,490]` or `[664,190,552,490]`. The old scene-only inner
border is removed. Word and character pages also place their heading,
unbordered pale-blue text surface and caption inside a complete fine frame.
These regions follow the first reference deck's layout rather than introducing
a separate showcase style.

The compact layout recomposes the scenes instead of shrinking full slides to
half size. It keeps all **114 meaningful original object identities** paired
between their two states. The old full-slide viewport masks and page furniture
are replaced with the new layout. The five carousel cards remain inside their
column; size and lateral movement transfer the focus between cards. The zoom
scene keeps the other modules visible as a readable context column. The source
labels and styles remain in the baseline even where the compact scene uses a
shorter visible label.

## Stable source and repeatable builds

`baseline.json` is the stable source, using schema
`blue-white-morph-semantic-baseline/v1`. It records the original per-state
geometry, text, fills, lines, `!!` identity names, source slide numbers and the
original PPTX SHA-256. It contains no copied PPTX or rendered images.

The builder never reads `assets/showcases/morph-effects.pptx` by default. This
prevents repeated generation from recursively compacting a previous result.
The source deck may be retained separately in a release archive.

If an archived original needs to be inspected or converted, an optional source
argument reads that original directly through ZIP/XML:

```sh
node /path/to/blue-white-ppt/assets/examples/morph/build-compact.mjs \
  --source /path/to/archive/original-22-slide-morph.pptx \
  --output /path/to/output/morph-effects-compact.pptx \
  --manifest /path/to/output/morph-effects-compact.manifest.json
```

`source.mjs` verifies the original 22-slide structure, ten family keys,
transition modes, and paired identities. A compact result is rejected as an
input. `--source` does not overwrite the bundled baseline or the original PPTX.

## Evidence and limits

The emitted manifest uses schema `blue-white-morph-compact/v1`. It records each
slide recipe, the six emitted transition modes, the ten effect families, all
paired identity names, and names whose text, position, size, geometry or rotation
changes. These checks read the generated XML. The builder also runs the package
validator and refuses a deck with broken relationships, duplicate native IDs,
objects outside the canvas, a missing effect change, or screenshots.

Each `slides[]` recipe includes `chapterNumber`. `layout.chapterNumbers` records
the fourteen chapter labels, and `layout.regions` records each complete frame's
slide, emitted XML name and bounds. `layout.bodyMinimumY` and
`layout.summaryBounds` make the body/summary separation explicit for review.

The example retains the original `!!zoom.*`, `!!spotlight.*`, `!!parallax.*`,
`!!carousel.*`, `!!geometry.*`, `!!word.*`, `!!character.*`, `!!equation.*`,
`!!layers.*` and `!!data.*` names. Numeric shape IDs are local references and do
not serve as cross-slide identity keys. Headers and scene furniture receive
stable pair-local names that retain semantic suffixes, such as
`!!chrome.pair2.header.number`, `!!chrome.pair2.info.lead` and
`!!chrome.pair2.region.zoom.frame`; exported page footers use the shared library
helper.

Structural checks do not prove visual quality or playback. Render all fourteen
pages and inspect the six transitions in the target PowerPoint version. Word
and character paths are computed by the player and can cross mid-transition.
The word example uses spaced English; the character example uses six distinct
Latin letters. Neither proves Chinese word segmentation or unique matching of
repeated characters. Equation tokens are editable text boxes, and the data marks
are editable shapes; this is not Office Math or native chart-data interpolation.

The Morph serializer remains example-local and is not a general animation API.
Its implementation is shared with `../trapezoid/morph.mjs`; the public plan
compiler is unchanged.
