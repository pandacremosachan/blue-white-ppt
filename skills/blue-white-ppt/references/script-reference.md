# Script commands

Paths are relative to the installed skill. Use absolute script paths when working elsewhere. Generation needs Node.js 20+ and built-in modules only. No npm install or network access is required.

| Script | Use |
|---|---|
| `doctor.mjs` | Report runtime requirements, required assets and optional render tools. `node scripts/doctor.mjs` |
| `inspect-component.mjs` | Show exact component options and reference pages. `node scripts/inspect-component.mjs C05` |
| `init-deck.mjs` | Create a project with plan.json, draw.mjs and skill-location.json. `node scripts/init-deck.mjs --output my-deck` |
| `create-deck.mjs` | Generate from a JSON plan. `node scripts/create-deck.mjs --input my-deck/plan.json --output my-deck/deck.pptx` |
| `validate-pptx.mjs` | Check a generated deck's native package. `node scripts/validate-pptx.mjs my-deck/deck.pptx` |
| `render.mjs` | Optional PDF/PNG previews. `node scripts/render.mjs my-deck/deck.pptx --output my-deck/preview` |

Every command supports `--help`. Output paths resolve against the current working directory; image paths in a JSON plan resolve against that plan's directory. Keep generated files outside the skill.

## Component discovery

```sh
node scripts/inspect-component.mjs --list
node scripts/inspect-component.mjs --search arrow
node scripts/inspect-component.mjs C22
node scripts/inspect-component.mjs structure.loop
```

Use `parameters` for valid choices and `variants[].options` for executable combinations. Human-readable names are not option keys. `sampleSlides` gives physical pages in `assets/reference/component-library-v0.14.pptx`. The skill includes one visual-system PNG; render the reference PPTX into the user project when additional page images are needed.

## JSON and JavaScript sources

```sh
node scripts/init-deck.mjs --output my-deck
node scripts/create-deck.mjs --input my-deck/plan.json --output my-deck/deck.pptx
node my-deck/draw.mjs --output my-deck/direct.pptx
```

The scaffold records the skill directory in `skill-location.json`. After relocating the skill, update that file, set `BLUE_WHITE_PPT_SKILL`, or pass `--skill /new/location/blue-white-ppt` to `draw.mjs`.

Generation refuses an existing PPTX unless `--overwrite` is supplied. Scaffolding refuses an existing project directory. `--manifest` and `--report` create optional project metadata only when requested.

## Validation and rendering

The validator checks ZIP/XML structure, relationships, native IDs, attached connectors and rotated object bounds. It does not measure text overflow or visual quality. DTDs and external entities are unsupported.

```sh
node scripts/render.mjs my-deck/deck.pptx --output my-deck/preview \
  --soffice /path/to/soffice --pdftoppm /path/to/pdftoppm --dpi 120
```

Rendering needs LibreOffice and Poppler. Use an empty preview directory, and install the bundled font first. A native PowerPoint renderer may also be used. Missing render tools do not prevent PPTX generation.

## Implementation

`scripts/api.mjs` is the authoring interface. `scripts/components/` contains the registry and component families. `scripts/lib/native-pptx.mjs` writes native PowerPoint objects and reuses the bundled reference's theme, master and layout. The source repository holds maintenance tools and regression tests outside the installable skill.
