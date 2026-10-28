---
name: blue-white-ppt
description: Create editable blue-and-white PowerPoint presentations with the C01–C39 component library, or draw a requested component by code. Use for this library's visual style, flow diagrams, layouts, and reuse of its native editable components.
metadata:
  version: "1.1.0-rc.3"
  compatibility: "Node.js 20+; optional rendering uses LibreOffice and Poppler."
---

# Blue and white editable presentations

Use the supplied native PowerPoint implementation: 39 stable component codes and 244 variants. Resolve paths from this file's directory. Keep presentation sources and generated outputs in the user's project, outside the installed skill.

## Load what the task needs

- For a complete presentation, read [style and layout](references/style-and-layout.md). Inspect `assets/reference/slide-01.png` for the approved visual system.
- To choose or draw a component, use [component guide](references/component-guide.md), then run `node scripts/inspect-component.mjs C05` for exact options and variants. The inspector's page numbers refer to the bundled 53-page `assets/reference/component-library-v0.14.pptx`.
- For implementation, read [API and JSON plan](references/api-and-plan.md). Use [script commands](references/script-reference.md) when scaffolding, generating or rendering.
- For trapezoid compositions, Morph, formulas or charts, read [optional examples and limits](references/showcases.md). Large examples and playback references are retrieved from the source repository only when relevant.

## Author the presentation

Use a 1280 × 720 canvas and Noto Sans SC. The font and OFL license are in `assets/fonts/`; install the font on the viewing or rendering machine for consistent metrics. The reference PPTX also supplies the exporter's theme, master and layout.

Select components according to the subject. Supply meaningful labels and use the documented low-level shape API when a small primitive is missing. `addSlide()` supplies the standard header and optional summary; follow the exact geometry and typography in the style guide.

Draw with `renderByCode(slide, 'C05', [x,y,w,h], options, uniqueInstanceId)`. Use the inspector's option keys. Keep text, tables, arrows, paths and nodes native and editable. Attach C07 connectors to returned native shapes for relationships; a filled C05 arrow conveys direction without establishing an attached relation. Use images for actual pictures or supplied figures.

For galleries, compare related cases on the same slide when readable. Preserve the state pairs needed for animation. Separate logical chapter labels from physical page counts. Let a formal talk's argument, audience and pace determine its density.

```sh
node scripts/init-deck.mjs --output /path/to/new-project
node scripts/create-deck.mjs --input /path/to/new-project/plan.json --output /path/to/new-project/deck.pptx
node scripts/validate-pptx.mjs /path/to/new-project/deck.pptx
```

Use absolute script paths when the working directory is elsewhere. The scaffold provides a JSON plan and a direct `draw.mjs` starter. Prefer JSON for straightforward compositions and JavaScript for computed placement or advanced relationships. Retain the chosen source with the delivered PPTX.

## Verify the result

Run `validate-pptx.mjs` on each generated deck. Render with `render.mjs` when LibreOffice and Poppler are available, or use the environment's PowerPoint renderer. Inspect slides for clipping, overlap, missing glyphs, connector attachments and visual consistency; correct the source and regenerate when needed.

Structural validation does not prove readability or visual quality. If rendering is unavailable, state that limit when delivering the PPTX and source. Outputs are protected from accidental overwrite unless the caller explicitly requests it.
