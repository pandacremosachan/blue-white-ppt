---
name: blue-white-ppt
description: Create editable blue-and-white PowerPoint presentations with a numbered C01–C39 component library, or draw a requested component by code. Use for presentations in this library's visual style, its flow diagrams and layouts, and reuse of the supplied .mjs components.
metadata:
  version: "1.1.0-rc.3"
  compatibility: Node.js 20 or later; optional rendering uses LibreOffice and Poppler; no Codex API or npm dependency required.
---

# Blue and white editable presentations

Use the bundled `.mjs` implementation to draw native PowerPoint objects. There are **39 stable component codes and 244 registered variants**. Variants, text, colors and complete compositions do not create new component codes.

All paths below are relative to this skill directory. Resolve it from this file's location; use absolute script paths when working elsewhere. `node` means any Node.js 20+ executable. Keep new presentation sources and outputs in the user's project, outside the installed skill.

## Read and inspect

1. Read [style and layout](references/style-and-layout.md) before composing. Inspect `assets/reference/slide-01.png` and selected sample pages using the environment's image viewer.
2. Use [component guide](references/component-guide.md) to map content to Cxx codes. Run `node scripts/inspect-component.mjs C05` for exact option keys, variants and physical reference pages. The maintained machine-readable catalog is [catalog.json](references/catalog.json).
3. Read [API and plan format](references/api-and-plan.md) when implementing. Read [script commands](references/script-reference.md) for scaffolding, generation and checks, and [portability](references/portability.md) for another harness or machine.
4. For creative compositions or advanced presentation references, read [showcases](references/showcases.md). It distinguishes the runnable 32-composition trapezoid example from the formula, chart and Morph reference decks. [Capabilities](references/capabilities.json) records the supported core, example-only behavior and experimental work.

The final visual reference is [component-library-v0.14.pptx](assets/reference/component-library-v0.14.pptx), **53 pages**, preserved byte for byte from the approved library. Matching `slide-01.png`–`slide-53.png` previews and section montages live beside it. Choose components according to the user's subject and argument; the gallery is visual vocabulary rather than a fixed content template.

## Compose and draw

- Use a 1280 × 720 canvas, blue gradient title with separate section number, white background, pale blue content panels, restrained red emphasis and yellow emphasis on blue fills. Use Noto Sans SC; the font and its redistribution license are bundled under `assets/fonts/`. Install it on the viewing/rendering machine for consistent metrics.
- Give each slide one main message. `addSlide()` supplies C01 and an optional lead sentence; avoid duplicate page headers. C23 provides editable layout containers, not automatic text flow. Retain visible hierarchy between explanation, evidence and conclusion.
- Match the approved reference frame on reference pages: the C02 lead panel is fixed at **[48,94,1184,78]**, contains the native C04 double chevron, and uses **23 design px bold** summary text. Start main content at **y ≥ 190**. Organize each comparison item inside a complete thin frame containing its title, diagram and caption. Use `addSlide({number:chapterNumber, summary:...})` for the standard header and lead.
- Keep logical chapter numbers separate from physical page numbers. A pair of animation states shares its chapter number; formula examples and their derivation share the same parent chapter. Footers still count each physical slide as `page / total`. Follow the bundled showcase mappings in [style and layout](references/style-and-layout.md).
- For galleries and reference cases, compare related examples on the same slide, normally **2–4 examples per page**. Keep the title and key differences visible; put detailed mechanisms and sources in speaker notes. Retain the state pairs needed to demonstrate animation, and avoid mechanically assigning every example its own page. This density rule serves reference material; a formal talk should follow its argument, audience and speaking pace.
- Call `renderByCode(slide, 'C05', [x,y,w,h], options, uniqueInstanceId)` from `scripts/api.mjs`. Preserve existing renderers and IDs. Get exact variant keys from the inspector, supply meaningful labels, and keep reusable components native rather than screenshot crops.
- Attach C07 connectors to returned native shapes for real relationships. C08–C09, C20–C22 and C34–C39 already attach their internal edges. A filled C05 arrow illustrates direction but does not establish an attached relation. See API examples for endpoint references.
- Keep text, arrows, paths, nodes and tables editable. Use `addImage()` for actual photographs or supplied figure assets; it embeds PNG/JPEG at the original aspect ratio. Add editable captions and source notes separately.
- Create arbitrary new slide compositions: 53 reference pages are neither an output limit nor mandatory layouts. Use the documented low-level shape API for missing small primitives.

```sh
node scripts/doctor.mjs
node scripts/init-deck.mjs --output /path/to/my-deck
node scripts/create-deck.mjs --input /path/to/my-deck/plan.json --output /path/to/my-deck/deck.pptx
node scripts/validate-pptx.mjs /path/to/my-deck/deck.pptx
```

The scaffold includes an editable `draw.mjs` example. Prefer JSON for straightforward compositions and `.mjs` for computed placement or advanced shape relationships. Retain the chosen source with the delivered PPTX.

The standalone trapezoid example arranges 32 compositions on eight comparison pages in a 13-page deck. The standalone Morph example arranges eight object effects in four paired comparisons and preserves separate word and character pairs, for 14 pages. Both use only packaged Node.js sources; their example-local Morph serializers are not general animation APIs. Native equations, charts, animation steps and the fifteen proposed Morph recipes remain outside the public authoring API; inspect the reference decks rather than passing their experimental fields to `create-deck.mjs`. See [validation](references/validation.json) for the evidence recorded for the current candidate.

## Verify

Run `validate-pptx.mjs` on each new deck. It checks package relationships, native IDs, connection attachments and object bounds; it does **not** prove readable text or a good composition. Render with `render.mjs` when LibreOffice and Poppler are available, or use the harness's PowerPoint renderer. Inspect all slides for clipping, overlap, missing glyphs, diagram attachments, density and visual consistency. Correct the source and regenerate after finding a problem.

If no renderer is available, deliver the PPTX and source with the precise limitation that visual rendering was not verified. Do not claim visual approval from structural checks alone. Generation and installation refuse existing targets by default.
