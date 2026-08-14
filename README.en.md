# Catnap Studio

[中文](README.md) | English

A three-in-one cat skin plugin for the DeepSeek Harness Web UI. One installable package contains three complete appearances. Users switch themes from the bottom status bar, and the browser remembers the selection.

| Warm Paper Den | Moonlit Guardian | Cat Atelier |
| --- | --- | --- |
| ![Warm Paper Den](preview/warm.png) | ![Moonlit Guardian](preview/moonlit.png) | ![Cat Atelier](preview/atelier.png) |

## Included themes

- **Warm Paper Den** — cream paper, apricot controls, and a sleeping orange tabby.
- **Moonlit Guardian** — indigo night surfaces, gold stars, a guardian cat, and a lantern sleeper.
- **Cat Atelier** — recycled paper, blue/red annotations, workshop notes, and a peeking tuxedo cat.

Every cat illustration and paper texture is embedded in the browser bundle. The installed plugin makes no external image requests. It changes presentation only: no business services, Cordis events, or model requests.

## Requirements

- Node.js `^22.19.0` or `>=24`
- pnpm `11.21.0`
- DeepSeek Harness Web UI

## Install from source

```sh
git clone https://github.com/luoyan96/dsh-catnap-studio.git
cd dsh-catnap-studio
pnpm install
pnpm run ci
dsh plugin --profile web add link:$(pwd)
dsh web
```

Restart `dsh web` after installing or upgrading. Remove the plugin with:

```sh
dsh plugin --profile web remove dsh-client-ui-skin-catnap
```

## Release packages

Pushing a tag such as `v0.2.0` runs the Release workflow, verifies the project, and uploads `dsh-client-ui-skin-catnap-0.2.0.tgz`. After downloading it, pass its local path to `dsh plugin --profile web add`.

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

[BSD-3-Clause](LICENSE)
