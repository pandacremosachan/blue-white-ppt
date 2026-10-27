# Script commands

Invoke from the skill root, or substitute an absolute script path. Every command has `--help`. Output paths are relative to the invoking working directory, except images in JSON plans, which resolve relative to the input plan. No command downloads dependencies or assets.

| Script | Purpose / example |
|---|---|
| `run-tests.mjs` | Run the regression suite without creating files in the skill directory. `npm test` or `node scripts/run-tests.mjs` |
| `doctor.mjs` | Report Node, bundled assets, reference SHA and optional render tools. `node scripts/doctor.mjs` |
| `inspect-component.mjs` | Inspect codes, exact variants/options and reference pages. `node scripts/inspect-component.mjs C05` |
| `reference-page.mjs` | Return an existing preview path, or copy it. `node scripts/reference-page.mjs --page 8 --output arrow-reference.png` |
| `init-deck.mjs` | New project with plan.json, draw.mjs and skill-location.json. `node scripts/init-deck.mjs --output my-deck` |
| `create-deck.mjs` | Build JSON plan. `node scripts/create-deck.mjs --input my-deck/plan.json --output my-deck/deck.pptx --manifest my-deck/components.json` |
| `validate-pptx.mjs` | Check native package and attachments. `node scripts/validate-pptx.mjs my-deck/deck.pptx --report my-deck/validation.json` |
| `render.mjs` | Optional PDF/PNG/HTML previews. `node scripts/render.mjs my-deck/deck.pptx --output my-deck/preview` |
| `self-test.mjs` | Draw all 244 variants and a table/image/rotation check on 245 pages. `node scripts/self-test.mjs --output checks/all-variants` |
| `install.mjs` | Copy full skill into a new discovery folder. `node scripts/install.mjs --harness pi` |
| `pack-skill.mjs` | ZIP selected runtime, examples and references with a hash manifest. `node scripts/pack-skill.mjs --output ../blue-white-ppt-skill-v1.1.0-rc.3.zip` |
| `verify-release.mjs` | Verify archive membership, hashes, versions, showcases and portable entrypoints. `node scripts/verify-release.mjs ../blue-white-ppt-skill-v1.1.0-rc.3.zip --report ../candidate-check.json` |
| `assets/examples/trapezoid/build-deck.mjs` | Generate the 13-page, 32-composition compact example. `node assets/examples/trapezoid/build-deck.mjs --output ../trapezoid.pptx --manifest ../trapezoid.json` |
| `assets/examples/morph/build-compact.mjs` | Generate the 14-page, ten-effect compact Morph example. `node assets/examples/morph/build-compact.mjs --output ../morph.pptx --manifest ../morph.json` |
| `update-guide.mjs` | Refresh the component guide and portable catalog reference path after intentional library changes. `node scripts/update-guide.mjs` |

## Component discovery

```sh
node scripts/inspect-component.mjs --list
node scripts/inspect-component.mjs --search arrow
node scripts/inspect-component.mjs C22
node scripts/inspect-component.mjs structure.loop
```

Use `parameters` for valid choices and `variants[].options` for runnable parameter combinations. Human-readable names are not option keys. Use `sampleSlides` for physical pages, not printed subsection numbers. `reference-page.mjs` exposes already bundled PNGs and does not require a renderer.

## Direct JavaScript

```sh
node my-deck/draw.mjs --output my-deck/direct.pptx
node my-deck/draw.mjs --skill /new/location/blue-white-ppt --output my-deck/direct.pptx --overwrite
```

Edit the `.mjs` source to change content, codes, geometry, options and relationships. `skill-location.json` records the skill's location at scaffold time; after moving it, pass `--skill`, set `BLUE_WHITE_PPT_SKILL`, or update that small configuration file.

Use `addSlide({number:chapterNumber,summary:...})` to preserve the reference header and fixed C02/C04 summary treatment. The showcase manifests record `chapterNumber` separately from `slide`, which is the physical page index. State pairs share the same chapter label; footer pagination and internal links continue to follow physical pages. The exact mappings are in [style and layout](style-and-layout.md).

## Validation and rendering

Generation refuses an existing PPTX unless `--overwrite` is passed. Scaffolding, reference copying, installation and packing also refuse existing targets. Manifests/reports are generated metadata and may be refreshed.

`validate-pptx.mjs` exits nonzero on structural errors. It checks ZIP integrity, UTF-8/XML syntax (including forbidden characters, entities, attributes and namespace bindings), relationships, duplicate IDs, attachment endpoints, object transforms and slide bounds after arbitrary-angle rotation. DTDs and external entities are unsupported. Independent connector samples produce warnings; actual workflow edges should be attached. It does not perform OOXML schema validation, text overflow detection or visual quality assessment.

```sh
node scripts/render.mjs my-deck/deck.pptx --output my-deck/preview \
  --soffice /path/to/soffice --pdftoppm /path/to/pdftoppm --dpi 120
```

Use an empty preview directory to avoid mixing render versions. The renderer writes a PDF, slide PNGs and `index.html`. Install the bundled font before rendering. When a command reports a missing executable, install it using the local environment's normal package mechanism or use another available renderer; PPTX generation is independent of those tools.

## Implementation map

`scripts/api.mjs` is the public authoring layer. `scripts/components/index.mjs` is the preserved registry; sibling modules draw each family. `scripts/lib/native-pptx.mjs` serializes native shapes, paths, connectors, groups, text, tables, images and notes. `zip.mjs` and `xml.mjs` implement the small local package utilities. The backend reads only the bundled reference for base theme/master/layout parts. Keep changes local to the relevant renderer and run the full variant test after library/backend edits.
