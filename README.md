# Blue White PPT Skill

Create native editable blue-and-white PowerPoint presentations with **39 component codes (C01–C39)** and **244 variants**. The current version is **1.1.0-rc.3**.

The installable skill is [skills/blue-white-ppt](skills/blue-white-ppt), with [SKILL.md](skills/blue-white-ppt/SKILL.md) as its entrypoint. It contains only authoring instructions, required code, focused references and runtime assets. Tests, full galleries, large examples and maintenance tools stay in the repository.

## Install

```sh
git clone https://github.com/pandacremosachan/blue-white-ppt.git
cd blue-white-ppt
node scripts/install.mjs --harness codex
```

The installer copies `skills/blue-white-ppt/` into the harness's skill directory and refuses an existing target. Other skill installers should use that repository path. For pi, shared discovery locations or explicit targets, see [installation and portability](references/portability.md).

## Repository layout

```text
skills/blue-white-ppt/     Install this folder
  SKILL.md               Purpose, routing and workflow
  agents/                Optional interface metadata
  scripts/               Native generator and authoring commands
  references/            Style, component and API references
  assets/                Required PPTX template, font, one preview and starters
scripts/                 Installer and development tools
tests/                   Regression tests
assets/examples/         Optional trapezoid and Morph source
assets/showcases/        Demonstration decks and video
assets/reference/        Full preview gallery
references/              Development records and installation notes
```

This organization follows the [Agent Skills specification](https://agentskills.io/specification) and keeps development resources outside the installed skill.

## Generate

Generation requires Node.js 20+ and built-in modules only.

```sh
node skills/blue-white-ppt/scripts/doctor.mjs
node skills/blue-white-ppt/scripts/init-deck.mjs --output /path/to/new-project
node skills/blue-white-ppt/scripts/create-deck.mjs --input /path/to/new-project/plan.json --output /path/to/new-project/deck.pptx
node skills/blue-white-ppt/scripts/validate-pptx.mjs /path/to/new-project/deck.pptx
```

The public API supports native editable text, shapes, connectors, groups, tables, PNG/JPEG pictures and notes. [The component guide](skills/blue-white-ppt/references/component-guide.md) maps component codes to exact options and reference pages. [The style guide](skills/blue-white-ppt/references/style-and-layout.md) defines the approved visual system.

The approved 53-page reference remains bundled because the backend reuses its theme, master and layout. The font is supplied under its OFL license and should be installed on the viewing/rendering machine. Rendering is optional and uses LibreOffice plus Poppler or another PowerPoint renderer.

## Optional examples

```sh
node assets/examples/trapezoid/build-deck.mjs --output /path/to/trapezoid.pptx
node assets/examples/morph/build-compact.mjs --output /path/to/morph.pptx
```

These repository examples retain the compact 13-page trapezoid and 14-page Morph layouts. The content/playback reference has six pages. They are retrieved only when relevant; formula input, chart-data compilation, click steps and general Morph recipes remain outside the public API. See [example scope](skills/blue-white-ppt/references/showcases.md).

## Develop and test

```sh
npm test
node scripts/self-test.mjs --output /path/to/new-check-directory
```

The installed skill does not contain tests, package management files, release archives, checksum manifests or maintenance commands. Structural tests establish package and native-object properties; visual rendering and playback remain separate checks.
