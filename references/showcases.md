# Creative examples and presentation references

Use these materials when selecting a composition or inspecting advanced presentation behavior. The component registry remains C01–C39 with 244 variants. Showcases do not create new component codes or extend the JSON authoring API.

The three decks share the approved reference frame: C02 summary bounds `[48,94,1184,78]`, the native C04 double chevron, 23 design px bold summary text, and main content starting at y ≥ 190. Complete thin frames contain each comparison item's title, diagram and caption. Header chapter labels express the logical structure while footer page numbers count physical slides. See [style and layout](style-and-layout.md) for all chapter mappings.

## Runnable trapezoid example

[The 13-page reference deck](../assets/showcases/trapezoid-creativity.pptx) contains all 32 compositions in eight comparison groups. Each comparison page presents four related cases, followed by one paired-state Morph demonstration and two source-register pages. [The preview](../assets/showcases/trapezoid-preview.png) shows the compact layout. Its labels, geometric faces, attached relationships and source links remain editable. Detailed explanations and individual sources are retained in speaker notes.

The complete standalone source is in `assets/examples/trapezoid/`. From any working directory, run:

```sh
node /path/to/blue-white-ppt/assets/examples/trapezoid/build-deck.mjs \
  --output /path/to/new/trapezoid.pptx \
  --manifest /path/to/new/trapezoid.json
```

Choose new output paths outside the skill folder. Existing targets are refused unless `--overwrite` is supplied. Edit `deck-content.mjs` for wording, `compact-diagrams.mjs` for geometric scenes and `compact-layout.mjs` for comparison layouts. The source register distinguishes the original design mechanisms from the example's extensions. Source titles in the deck link to their websites; third-party templates and screenshots are not bundled.

The example includes one paired-state Morph demonstration. Its serializer is local to this example and does not provide a general-purpose animation interface. The generated manifest maps every case to its comparison page, records `chapterNumber`, and retains the original page mapping for traceability. The packaged entrypoint depends only on bundled source and resources.

## Content and playback reference

[The six-page reference deck](../assets/showcases/content-and-playback.pptx) groups related formula and chart comparisons, while preserving the stateful pages needed for click sequences and internal navigation. It retains seven native Office Math objects and one native chart with an embedded workbook. Interactive formula editing, chart-data editing and complete live-click playback remain separate acceptance work. The current candidate's structural and rendering evidence is recorded in [validation.json](validation.json); the previous version's visual acceptance does not establish acceptance of these rearranged pages.

This candidate supplies the deck for inspection. It does not expose the prototype's formula tree, chart compiler or click-step input through `scripts/api.mjs` or `create-deck.mjs`. Generic LaTeX input and the full content compiler remain experimental.

## Morph reference

[The 14-page Morph deck](../assets/showcases/morph-effects.pptx) demonstrates the same ten effect families with six native transitions. Four A/B comparison pairs each demonstrate two object effects, followed by separate word-mode and character-mode pairs. A guide and a closing settings/source page complete the deck. This arrangement preserves each effect's native objects and stable Morph identities while allowing related effects to be compared together.

The standalone source is in `assets/examples/morph/`. From any working directory, run:

```sh
node /path/to/blue-white-ppt/assets/examples/morph/build-compact.mjs \
  --output /path/to/new/morph.pptx \
  --manifest /path/to/new/morph.json
```

The packaged semantic baseline supplies the object and text states. Default generation does not read the packaged showcase or require the research workspace. An explicit original reference can be supplied with `--source`; it must be the original full layout supported by the importer. Keep the generated source and manifest with the deck. Current rendering and playback acceptance, including any packaged video, must be established for this compact version and recorded in [validation.json](validation.json).

The research catalogue contains fifteen proposed recipes; the reference deck covers ten of them. The candidate does not claim a complete recipe compiler, native 3D support, chart-data interpolation, or collision-free automatic text paths. Word and character matching may cross during movement, so stopping states must remain readable and exact paths may need separate objects or intermediate slides.

## Reference density and acceptance

Use 2–4 related cases per page by default in galleries and reference material. Show their titles and key differences together, retain detailed mechanisms and sources in notes, and preserve the state pairs required by animation. This guidance applies to comparison material; the pacing of a formal talk follows its argument and audience. Read [style and layout](style-and-layout.md) for the full density guidance.

The preceding candidate's compact layouts are historical evidence for that version. Structural checks, native rendering and playback observations must identify the exact files they inspected after the reference-frame changes. [validation.json](validation.json) separates that earlier evidence from the current candidate's acceptance.

## Capability and asset records

[capabilities.json](capabilities.json) distinguishes core support, the runnable example, reference artifacts and experimental interfaces. [showcase-catalog.json](showcase-catalog.json) records packaged files, hashes, metrics and the example entrypoint. `verify-release.mjs` checks these records against the archive. It does not replace visual inspection or interaction testing in the target player.
