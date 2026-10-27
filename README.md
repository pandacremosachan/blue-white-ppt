# Blue White PPT Skill

A portable Agent Skill for editable blue-and-white PowerPoint presentations, with **39 stable component codes (C01–C39)**, **244 variants**, and the approved **53-page visual reference**. The current source version is **1.1.0-rc.3**.

Start with [SKILL.md](SKILL.md). The [component guide](references/component-guide.md) maps codes to options and reference pages. [Showcases](references/showcases.md) provides the creative examples and explains which advanced content is reference-only.

## Capability scope

The core API generates native editable shapes, text, connectors, groups, tables, pictures and notes. The standalone trapezoid example compares 32 compositions across eight case pages in a 13-page presentation. The 14-page Morph example groups eight object effects into four paired comparisons and retains separate word and character pairs. The content/playback reference uses six pages. General equation input, data-chart compilation, animation steps and Morph recipe compilation are still experimental and are not public API features. Machine-readable status is in [capabilities.json](references/capabilities.json).

Galleries and reference decks normally compare 2–4 related examples per page, with titles and key differences on the slide and detailed explanations and sources in speaker notes. Necessary animation states retain their own paired slides. Formal talks use the density and pace required by their argument and audience.

All three showcase decks follow the approved reference frame: a fixed C02 summary panel at `[48,94,1184,78]` with the C04 double chevron and 23 design px bold summary text, main content beginning at y ≥ 190, and complete thin frames around comparison items. Logical chapter numbers identify topics and paired states; the footer separately reports physical page count. See [style and layout](references/style-and-layout.md) for exact chapter mappings and layout requirements.

Generation requires **Node.js 20+**, with no npm install, Python, Codex API or network access.

```sh
node scripts/doctor.mjs
node scripts/init-deck.mjs --output /path/to/my-deck
node scripts/create-deck.mjs --input /path/to/my-deck/plan.json --output /path/to/my-deck/deck.pptx
node scripts/validate-pptx.mjs /path/to/my-deck/deck.pptx
node assets/examples/trapezoid/build-deck.mjs --output /path/to/trapezoid.pptx
node assets/examples/morph/build-compact.mjs --output /path/to/morph.pptx
```

The scaffold also includes a direct `.mjs` authoring example. Outputs belong outside the skill folder. For pi, load the cloned folder with `pi --skill /path/to/blue-white-ppt` and invoke `/skill:blue-white-ppt`. See [portability](references/portability.md) for discovery and installation paths.

## Use the source repository

The repository root is the skill folder. `SKILL.md` is its entrypoint; keep `scripts/`, `references/`, `assets/` and the optional `agents/` metadata together with it.

```sh
git clone https://github.com/pandacremosachan/blue-white-ppt.git
node blue-white-ppt/scripts/install.mjs --harness codex
```

The installer copies the complete source into a new skill location and refuses an existing target. A harness can also load `SKILL.md` directly from the cloned folder. See [portability](references/portability.md) for pi, shared discovery paths and explicit target locations.

## Checks and visual reference

Run `npm test` for API, JSON-plan, layer-order, XML, geometry, distribution and example regressions. `node scripts/self-test.mjs --output /new/check-directory` checks all 244 variants on 245 pages, including 279 attached workflow connectors and four intentional independent connector samples.

GitHub Actions is configured for Windows, Linux and macOS with Node 20 and 24. A Linux rendering job publishes preview artifacts for human review. A configured job is not evidence of an executed cross-platform check; the candidate's actual local evidence and remaining release gates are recorded in [validation.json](references/validation.json) and [release notes](references/release-notes.md).

The visual authority remains [component-library-v0.14.pptx](assets/reference/component-library-v0.14.pptx), with all 53 previews and section montages beside it. [provenance.json](references/provenance.json) records the original baseline. Component IDs and the reference bytes are retained; C19 has a targeted parameter fix.

Install `assets/fonts/NotoSansSC-VF.ttf` on the viewing/rendering machine for consistent text metrics; the font is distributed with its SIL Open Font License. PPTX files reference the font without embedding it. Optional automated PNG/PDF rendering uses LibreOffice and Poppler; a native PowerPoint renderer can also be used. Structural checks do not prove text fit, visual quality or interactive playback.
