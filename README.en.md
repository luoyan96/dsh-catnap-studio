# Catnap Studio

[中文](README.md) | English

A cat-themed workspace suite for the DeepSeek Harness Web UI. It keeps the useful task, repository, file, statistics, and settings modules from the mature DSH Web UI ecosystem, then unifies them with original cat visuals. One install contains three appearances and an interactive desktop companion.

> A community project built on DeepSeek Harness. **It is not an official DeepSeek product and is not endorsed by DeepSeek.**

Current release line: **Catnap Studio v0.3.3**. Windows users who prefer a bundled experience can use the companion [Catnap Desktop](https://github.com/luoyan96/dsh-catnap-desktop) once it is published.

| Warm Paper Den | Moonlit Guardian | Cat Atelier |
| --- | --- | --- |
| ![Warm Paper Den](preview/warm.png) | ![Moonlit Guardian](preview/moonlit.png) | ![Cat Atelier](preview/atelier.png) |

## Included themes

- **Warm Paper Den** — cream paper, apricot controls, and a sleeping orange tabby.
- **Moonlit Guardian** — indigo night surfaces, gold stars, a guardian cat, and a lantern sleeper.
- **Cat Atelier** — recycled paper, blue/red annotations, workshop notes, and a peeking tuxedo cat.

Every cat illustration and paper texture is embedded in the browser bundle. The installed plugin makes no external image requests, and its theme layer does not touch model requests.

## Workspace capabilities

- **Theme switching in Settings** — choose any of the three themes from large cards under Settings → General → Appearance. Desktop cats retreat while Settings is open and return when it closes.
- **Cat Den Center** — manage the companion and inspect enabled capabilities from one glass panel.
- **Cat companion** — drag, pet, feed, rename, hide, and recall it; affinity and position persist locally.
- **Task board** — organize tasks by status, open details, and schedule work.
- **Git graph and files (fallback)** — Catnap's embedded legacy workbench remains available when Better Sidebar is not installed.
- **Better Sidebar workbench (optional)** — file tree, editor, real terminal, Git diff, split right/bottom panels, and per-session layouts. When installed, Catnap automatically avoids activating the legacy Aion file panel and Git graph clients, preventing duplicate sidebars.
- **Live statistics** — inspect TPS, context, cache, and token usage.
- **Plugin settings** — manage workspace modules from DSH settings.

Task, fallback-workbench, statistics, and settings capabilities are composed from the compiled `0.1.12` code of public `@linxin666/dsh-web-ui` packages. Better Sidebar is an independent MIT-licensed plugin: Catnap only detects it through DSH and adapts its shared design tokens; it does not include Better Sidebar's terminal, filesystem, WebSocket, or node-pty code. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for notices.

## Requirements

- Node.js `^22.19.0` or `>=24`
- pnpm `11.21.0`
- DeepSeek Harness Web UI

If PowerShell cannot find `dsh`, install the CLI and open a new PowerShell window:

```powershell
npm.cmd install -g @deepseek-ai/dsh
dsh --version
```

## One-line npm install

```powershell
dsh plugin --profile web add dsh-catnap-plugins@latest
dsh web
```

Restart `dsh web` after installation or upgrade.

### Optional: Better Sidebar workbench

```powershell
dsh plugin --profile web add dsh-better-sidebar@latest
```

Hard-refresh the browser after installing it. Catnap automatically avoids duplicate sidebars and themes Better Sidebar through the shared DSH tokens.

## Install from a GitHub Release

1. Download the matching `.tgz` from [Releases](https://github.com/luoyan96/dsh-catnap-studio/releases).
2. Install the plugin in PowerShell:

```powershell
dsh plugin --profile web add "C:\path\to\dsh-catnap-plugins-0.3.2.tgz"
```

3. Start or restart the DSH Web UI:

```powershell
dsh web
```

Restart `dsh web` after installation or upgrade. Remove the plugin with:

```powershell
dsh plugin --profile web remove dsh-catnap-plugins
```

## Install from source

```sh
git clone https://github.com/luoyan96/dsh-catnap-studio.git
cd dsh-catnap-studio
pnpm install
pnpm run ci
dsh plugin --profile web add link:$(pwd)
dsh web
```

On Windows PowerShell, use this link command:

```powershell
dsh plugin --profile web add "link:$($PWD.Path)"
dsh web
```

If the all-in-one reference bundle is already installed, remove it first to avoid registering the same functional modules twice:

```powershell
dsh plugin --profile web remove @linxin666/dsh-web-ui-all
```

## Release packages

Pushing a tag matching `package.json` (for example `v0.3.2`) runs the Release workflow and uploads `dsh-catnap-plugins-0.3.2.tgz` with `CHECKSUMS.txt`. Verify the SHA-256 before installing.

## Development

```sh
pnpm install
pnpm run typecheck
pnpm test
pnpm run build
pnpm run pack:check
```

Start the local preview with `python -m http.server 4173`, then open `http://127.0.0.1:4173/preview/index.html?theme=warm`. The `theme` query accepts `warm`, `moonlit`, or `atelier`; append `&state=active` for the Cat Atelier active-session example.

Current real-DSH acceptance captures are in [`docs/qa/`](docs/qa/). See [DESIGN.md](DESIGN.md) for theme constraints, [design-qa.md](design-qa.md) for visual acceptance evidence, [CONTRIBUTING.md](CONTRIBUTING.md) before contributing, and [SECURITY.md](SECURITY.md) for security reporting.

## License

Catnap Studio's own code and artwork use [BSD-3-Clause](LICENSE). The embedded UI modules declare Apache-2.0 in their npm manifests while their tarballs also carry BSD-3-Clause text; this repository preserves both. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
