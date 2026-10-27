# Installation and portability

## Runtime and contents

Copy the **entire blue-white-ppt folder**, not just SKILL.md. Generation needs Node.js 20+ and its built-in modules only. No npm install, private package registry, Python, Codex API, MCP server or network is required. The optional `agents/openai.yaml` supplies Codex UI metadata; other harnesses may ignore it. The instructions and scripts do not rely on it.

Installation and packaging share a release-file allowlist: root documentation and metadata, `agents/`, `assets/`, `references/`, `scripts/`, and bundled `tests/`. Curated `assets/showcases/` files and portable `assets/examples/trapezoid/` and `assets/examples/morph/` sources are included; research drafts, Git internals, hidden development files, nested ZIP archives and arbitrary output directories are excluded. Packaging regenerates the file-hash manifest from selected files. Run `npm test` in a source checkout or installed folder to verify the regression suite, then run `verify-release.mjs` against a candidate ZIP.

The original `.mjs` component renderers are preserved. `scripts/lib/native-pptx.mjs` supplies a portable native OOXML backend for the drawing API those renderers use. The final reference's theme/master/layout parts are reused locally. This produces new presentations without importing arbitrary input decks.

The ZIP has one top-level `blue-white-ppt/` directory plus a SHA-256 file manifest inside it. Extract that directory at a skill discovery location, or pass its path to your harness. Directory names with spaces or Unicode are supported; quote shell paths containing spaces.

The current `1.1.0-rc.3` is a local release candidate. Extract or install it into a new test directory first. The existing installer deliberately refuses an existing target; preparing the candidate does not replace the active skill or publish a release. [Release notes](release-notes.md) and [validation.json](validation.json) identify completed local checks and outstanding release gates.

`provenance.json` records the 1.0.0 baseline for the reference, font and 29 component source/style files. `doctor.mjs` checks the reference against that baseline. C19 has a targeted parameter fix; line endings are normalized to LF for reproducible textual sources. The candidate archive manifest records the actual shipped bytes rather than replacing the historical provenance record.

## Codex

```sh
node /path/to/blue-white-ppt/scripts/install.mjs --harness codex
```

The default target is `$CODEX_HOME/skills/blue-white-ppt`, or `~/.codex/skills/blue-white-ppt`. Restart or reload skill discovery and invoke `$blue-white-ppt`. The installer refuses an existing target and does not change settings.

## pi

For a single session, without installation:

```sh
pi --skill /path/to/blue-white-ppt
```

Then invoke `/skill:blue-white-ppt`, for example: `Use C23 for the comparison layout, C20 for the method sequence, and C05 with light-to-dark gradient for the transformation.`

For user-wide discovery:

```sh
node /path/to/blue-white-ppt/scripts/install.mjs --harness pi
```

This copies into `~/.pi/agent/skills/blue-white-ppt` (respecting `PI_CODING_AGENT_DIR`). The `--harness shared` option copies into `~/.agents/skills/blue-white-ppt`, for harnesses supporting that shared discovery location. Use `--target /exact/skill-folder` for a different location. A project-specific installation can use `.pi/skills/blue-white-ppt` as the explicit target. Choose one discovery location to avoid duplicate-name warnings.

pi supports Agent Skills with SKILL.md and relative scripts/references/assets. Its own runtime/model requirements are separate from this skill's Node.js requirement. See the [official pi skill documentation](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/skills.md) and [Agent Skills specification](https://agentskills.io/specification). Other harnesses can load SKILL.md directly and execute the same scripts if filesystem and shell access are available.

## Fonts and previews

Install `assets/fonts/NotoSansSC-VF.ttf` on the machine used for viewing or rendering. `assets/fonts/OFL.txt` permits redistribution under the SIL Open Font License. Font files are supplied but not embedded in generated PPTX files.

Optional automated previews need LibreOffice (`soffice`) and Poppler (`pdftoppm`). Put them on PATH or supply explicit paths to `render.mjs`; `doctor.mjs` reports availability. These programs are not needed to create a PPTX. A harness-native renderer may be used instead. Always distinguish structural validation from visual verification.

## Reproducible checks

Run `doctor.mjs`, generate from the supplied JSON example, run `validate-pptx.mjs`, and run `self-test.mjs` when modifying the library/backend. The self-test draws every registered variant and checks the resulting native package; it does not visually review all variants. To test relocation, run those commands with absolute script paths while the current directory is outside this folder.

The candidate's actual local verification scope and limits are recorded in [validation.json](validation.json). Archive and clean-extraction evidence accompanies the candidate ZIP. Skill discovery and a complete model run are separate checks; neither is implied by file generation alone.

The portable showcase regressions check the fixed summary geometry, native double chevrons, summary typography, complete comparison regions and logical chapter labels in emitted XML. Physical page numbers remain separate. These structural assertions accompany native-object and relocation checks; a fresh render is still required after a layout change.
