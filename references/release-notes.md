# 1.1.0-rc.3 — standard skill directory

The installable skill now lives in [`skills/blue-white-ppt/`](../skills/blue-white-ppt/), with [`SKILL.md`](../skills/blue-white-ppt/SKILL.md) as its entrypoint. Install that directory as a whole, or run `node scripts/install.mjs --harness codex` from the repository. See [installation and portability](portability.md) for other targets.

The skill contains 53 files: authoring instructions, optional interface metadata, native generation code, focused references, two starter templates, the required 53-page reference deck, one preview, and the Noto Sans SC font with its OFL license. Tests, package configuration, maintenance commands, the full preview gallery and larger examples remain in the repository.

The previous root-level skill entrypoint, runtime copies, archive packaging and verification tools, release-file allowlist and ZIP-specific tests have been replaced by this directory structure. The repository no longer distributes versioned ZIP or checksum files. Git history retains the earlier layouts.

## Preserved content

The public library retains C01–C39 and all 244 variants. The approved 53-page reference and bundled font retain their original bytes. The compact examples remain available outside the skill: 32 trapezoid compositions in 13 pages, ten Morph effect families in 14 pages, and a six-page content/playback reference.

The earlier runtime corrections remain: exact component instance names, explicit groups, export snapshots with refreshed page totals, shared layer ordering for shapes/images/tables, strict XML validation, rotated bounds checks and C19 color/highlight options. The layout migration does not expand the public API; formula/chart compilation, click-step plans and general Morph recipes remain experimental.

## Validation

All 23 current regression tests pass locally. They cover native API behavior, XML and geometry checks, self-contained installation, JSON and JavaScript starters, relocation, generation of all 244 variants on 245 pages, and the three compact references. GitHub Actions runs the suite on Windows, Linux and macOS with Node.js 20 and 24, plus a Linux preview job; consult the checks for the current commit for its actual result.

Earlier PowerPoint rendering and sampled transition evidence remains recorded in [validation.json](validation.json). Those records describe the retained showcase bytes. Structural tests do not establish visual readability or complete interactive playback, and formula editing, chart-data editing and full live-click acceptance remain open.

[provenance.json](provenance.json) records the original reference, font and component baseline. [capabilities.json](capabilities.json) distinguishes the supported core from optional examples and experimental content.
