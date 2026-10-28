# Style and layout

## Visual authority

`../assets/reference/component-library-v0.14.pptx` is the final 53-page reference. Page 1 shows the visual system, page 2 the chapter directory, and page 3 the C01–C39 index. Read `sampleSlides` through the inspector to choose physical pages. The skill includes `slide-01.png` for the visual system; render the reference PPTX into the user project when other page images are needed.

`scripts/components/style.json` and the original component renderers preserve the drawing definitions. Historic screenshot paths in the style file are provenance, not runtime dependencies. The packaged final deck is the current visual authority.

## Canvas and hierarchy

Coordinates use design pixels on a **1280 × 720** canvas. The exporter converts them to DrawingML units. A design font size of 24 becomes 18 pt in PowerPoint; do not pass point values as though they were design pixels.

| Region | Geometry / purpose |
|---|---|
| Page inset | 48 px on both sides |
| Header | Separate number; gradient bar x=144, y=10, w=1124, h=64 |
| Lead statement | Fixed C02 frame x=48, y=94, w=1184, h=78; native C04 double chevron; 23 design px bold text |
| Main content | Begin at y ≥ 190 and normally end by y=686; reserve the footer area |
| Footer | Rule y=698; label and page count below |
| Body / diagram / annotation | Usually 23 / 22 / 18 design px |
| Page title / section text | 36 / 26 design px |

Use shared alignment lines and spacing around connectors. Scale a diagram before shrinking its labels. Put long explanations beside it or on another slide. Components do not automatically fit a full argument into arbitrary geometry.

Reference pages retain the original lead structure: a white C02 panel with a complete gray-blue outline, two native C04 chevrons at the left, and bold summary text beginning at x=101. `addSlide({number:chapterNumber, summary:...})` draws this standard lead at its fixed position. Keep the lead's geometry and type size consistent across the repository showcase decks.

Use complete thin frames to organize comparison items. Each frame contains the item's title, diagram and caption, so the viewer can associate the explanation with the correct case. Place all three within the same region; a border around the diagram alone does not organize the entire comparison item. Start every main-content object at y ≥ 190, including state labels and region headings.

## Chapter numbers and physical pages

The number beside the gradient header identifies the logical chapter, while the footer counts physical pages. Pass the chapter string through `addSlide({number:chapterNumber,...})`; use the actual page index and total in `addFooter()`. An animation pair shares one chapter number because its two pages are states of the same example. Formula examples and their derivation belong to the same formula chapter.

Keep these chapter labels in the generated manifests as `chapterNumber`. Hyperlink destinations and notes relationships continue to use physical slide IDs; changing a visible chapter number must not change navigation targets.

## Palette

| Token | Color | Role |
|---|---|---|
| `C.blue` | `#0759BE` | Primary fills and strokes |
| `C.blueDark` | `#074A9B` | Dark edge of title gradient |
| `C.blueText` | `#357596` | Secondary headings |
| `C.bluePale` | `#F2F7FB` | Content surfaces |
| `C.blueFade` | `#ECF2FA` | Gentle blue highlights |
| `C.ink` | `#1D242B` | Main text |
| `C.muted` | `#5B6C7A` | Notes and sources |
| `C.border` | `#A6B4C0` | Fine panel borders |
| `C.red` | `#AF3438` | Sparse key-term emphasis |
| `C.yellow` | `#F5E86A` | Key text on blue |
| `C.white` | `#FFFFFF` | Background and text on blue |

## Compose from the content

Use C23 for natural regions: comparison, a main argument with support, or a figure with explanation. Inspect C23 for twelve named presets. Set `showLabels:false` when placing real content. Respect returned region geometry or inspect `layout-presets.mjs`; presets do not prevent overlaps.

A sequential process calls for C20 or C37, simultaneous paths C21 or C36, a cyclic dependency C35 or a suitable C09 return variant, and layers C22. C05 emphasizes a directional transformation; C07 carries an attached relation. Select structures by meaning.

Use editable nodes and native tables for compact comparisons. Images can show measurements, photographs or supplied paper figures, with editable captions. A title, main figure and explanatory region often communicate more clearly than a grid of every available component.

## Density for galleries and reference cases

When the purpose is to compare designs, group related cases on the same page, normally **2–4 examples per page**. Share the page title and alignment grid so that the viewer can compare the cases directly. Give each case its name and the difference that matters; move detailed mechanisms, extended commentary and source descriptions to speaker notes. Page count should follow the number of meaningful comparison groups, rather than the number of case records.

Keep separate animation states when the transition itself is the subject. For Morph references, related object effects can share the same A/B pair, while word and character matching retain their own pairs because their settings differ. Sources can use a compact closing register in addition to the notes. Check that labels remain readable after reducing a diagram to its comparison region; merging pages without redrawing their content does not establish a useful density.

This is the default for galleries and reference material. A formal talk should use its argument, audience and speaking pace to decide whether a page needs one example or several; it does not inherit a four-example requirement.

## Typography and review

Use bundled `NotoSansSC-VF.ttf` (Noto Sans SC, SIL Open Font License). It is **not embedded** in exported PPTX files. Install it on the viewing/rendering system. Another font may change text metrics and requires renewed visual inspection.

Text remains editable; renderers can wrap it differently. Inspect full-resolution slides, including captions and vertical labels. Structural validation does not measure glyphs, line breaks, density or contrast.
