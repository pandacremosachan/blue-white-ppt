# Installation and portability

The installable skill is `skills/blue-white-ppt/`. It follows the Agent Skills directory convention: `SKILL.md`, optional `agents/` metadata, executable `scripts/`, focused `references/`, and required `assets/`.

Copy that directory as a whole. Repository-level README, package configuration, tests, maintenance tools, large examples and full preview galleries are development resources and do not belong in the installed skill.

## Install

From a source checkout:

```sh
node scripts/install.mjs --harness codex
```

The default target is `$CODEX_HOME/skills/blue-white-ppt`, or `~/.codex/skills/blue-white-ppt`. Use `--target /exact/skill-folder` for an explicit location. Existing targets are refused. The installer copies the actual skill directory without generating a ZIP or checksum files.

For pi, use `--harness pi` to install under `~/.pi/agent/skills/blue-white-ppt` (respecting `PI_CODING_AGENT_DIR`), or load the skill directly:

```sh
pi --skill /path/to/repository/skills/blue-white-ppt
```

Invoke `/skill:blue-white-ppt`. The `--harness shared` option targets `~/.agents/skills/blue-white-ppt` for compatible harnesses. Keep one discovery location to avoid duplicate names.

Other skill installers should select the repository path `skills/blue-white-ppt`, rather than the repository root.

## Runtime

PPTX generation needs Node.js 20+ and built-in modules only. There are no npm, Python, Codex API, MCP or network dependencies for core generation. All modules use relative paths; the installed skill needs neither the repository nor its package.json.

The original 53-page reference remains a required runtime asset because the exporter reads its theme, master and layout. One visual-system PNG and two scaffold templates are included. Extra reference PNGs, demonstration videos and larger example sources remain in the repository.

The Noto Sans SC font and OFL license are bundled. Install the font on the viewing or rendering machine; generated PPTX files do not embed it. Optional previews require LibreOffice and Poppler, or an environment-provided PowerPoint renderer.

## Development

Run `npm test` from the repository. Use `node scripts/self-test.mjs --output /new/check-directory` for all 244 variants; `--skill /installed/blue-white-ppt` tests an installed copy. These tools and their test files stay outside the installed skill.

The directory structure and progressive disclosure follow the [Agent Skills specification](https://agentskills.io/specification). `SKILL.md` routes to the relevant reference instead of loading development and example material into every task.
