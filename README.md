# Blue White PPT Skill

## Current skill package — 1.1.0-rc.3

Download the complete [1.1.0-rc.3 skill package](https://github.com/pandacremosachan/blue-white-ppt/raw/refs/heads/main/blue-white-ppt-skill-v1.1.0-rc.3.zip). The archive includes the matching source, instructions, examples, references, fonts and regression tests.

This candidate adds three compact editable references: 32 trapezoid compositions in 13 pages, ten Morph effect families in 14 pages, and a six-page content/playback reference. All 33 pages follow the original summary-bar, complete-frame and chapter-number conventions. The 39 component codes, 244 variants and approved 53-page reference are retained.

Both the source checkout and a clean archive extraction passed 32 tests. All 33 showcase slides were rendered and reviewed in Microsoft PowerPoint, with sampled native transitions. See [release notes](RELEASE-v1.1.0-rc.3.md) for scope and installation details.


A portable Agent Skill for editable blue-and-white PowerPoint presentations. It preserves **39 stable component codes (C01–C39)**, **244 variants**, the original **.mjs renderers**, and the final **53-page visual reference**.

Start with [SKILL.md](SKILL.md). Full command documentation is in [references/script-reference.md](references/script-reference.md), and the [component guide](references/component-guide.md) maps codes to options and reference pages.

## Download

Download [blue-white-ppt-skill-v1.1.0-rc.3.zip](blue-white-ppt-skill-v1.1.0-rc.3.zip), then extract the entire `blue-white-ppt` folder. The archive contains the skill instructions, drawing API, component source, reference deck and previews, bundled font/license, examples, installation and validation scripts.

## Use

Generation requires **Node.js 20+**, with no npm dependencies, Python, Codex API or network access. Text, shapes, connectors, paths and tables remain native and editable.

```sh
node scripts/doctor.mjs
node scripts/init-deck.mjs --output /path/to/my-deck
node scripts/create-deck.mjs --input /path/to/my-deck/plan.json --output /path/to/my-deck/deck.pptx
node scripts/validate-pptx.mjs /path/to/my-deck/deck.pptx
```

The scaffold also includes a direct `.mjs` authoring example.

For pi, load the extracted skill directory:

```sh
pi --skill /path/to/blue-white-ppt
```

Then invoke `/skill:blue-white-ppt`. For Codex or persistent pi/shared installation, see [portability.md](references/portability.md).

## Visual reference and checks

The final visual reference is [component-library-v0.14.pptx](assets/reference/component-library-v0.14.pptx). The same directory contains all 53 page previews and section montages. The approved reference and original component source files are preserved; hashes are recorded in [provenance.json](references/provenance.json).

All 244 variants passed native PPTX generation and structural validation; the 245-page test deck was independently imported, and composed example slides and selected component samples were rendered and inspected. Relocation and offline pi skill discovery were tested. Exact scope and limitations are in [validation.json](references/validation.json).

Install `assets/fonts/NotoSansSC-VF.ttf` on the viewing/rendering machine for consistent text metrics; the font is distributed with its SIL Open Font License. Optional automated PNG/PDF previews require LibreOffice and Poppler. Generated PPTX files reference the font without embedding it.
