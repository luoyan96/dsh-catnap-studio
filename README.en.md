# Catnap Studio

[中文](README.md) | English

A cat-themed workspace suite for the DeepSeek Harness Web UI. It keeps the useful task, repository, file, statistics, and settings modules from the mature DSH Web UI ecosystem, then unifies them with original cat visuals. One install contains three appearances and an interactive desktop companion.

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
- **Git graph** — switch branches and inspect commits and repository state.
- **Files and preview** — browse, preview, and manage workspace files in the right panel.
- **Live statistics** — inspect TPS, context, cache, and token usage.
- **Plugin settings** — manage workspace modules from DSH settings.

The final five capabilities are composed from the compiled `0.1.12` code of public `@linxin666/dsh-web-ui` packages. Catnap Studio does not copy the reference project's character or background artwork. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for notices and the dual-license clarification.

## Requirements

- Node.js `^22.19.0` or `>=24`
- pnpm `11.21.0`
- DeepSeek Harness Web UI

If PowerShell cannot find `dsh`, install the CLI and open a new PowerShell window:

```powershell
npm.cmd install -g @deepseek-ai/dsh
dsh --version
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

Restart `dsh web` after installing or upgrading. Remove the plugin with:

```sh
dsh plugin --profile web remove dsh-client-ui-skin-catnap
```

If the all-in-one reference bundle is already installed, remove it first to avoid registering the same functional modules twice:

```powershell
dsh plugin --profile web remove @linxin666/dsh-web-ui-all
```

## Release packages

Pushing a tag such as `v0.3.0` runs the Release workflow, verifies the project, and uploads `dsh-client-ui-skin-catnap-0.3.0.tgz`. After downloading it, pass its local path to `dsh plugin --profile web add`.

## Development

```sh
pnpm install
pnpm run typecheck
pnpm test
pnpm run build
pnpm run pack:check
```

Start the local preview with `python -m http.server 4173`, then open `http://127.0.0.1:4173/preview/index.html?theme=warm`. The `theme` query accepts `warm`, `moonlit`, or `atelier`; append `&state=active` for the Cat Atelier active-session example.

See [DESIGN.md](DESIGN.md) for theme constraints, [design-qa.md](design-qa.md) for visual acceptance evidence, and [CONTRIBUTING.md](CONTRIBUTING.md) before contributing.

## License

Catnap Studio's own code and artwork use [BSD-3-Clause](LICENSE). The embedded UI modules declare Apache-2.0 in their npm manifests while their tarballs also carry BSD-3-Clause text; this repository preserves both. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
