# Contributing

## Setup

```sh
pnpm install
pnpm run ci
```

## Change rules

- Keep the plugin presentation-only. Do not add services, model requests, or application data mutations.
- Scope every skin style below `body[data-dsh-catnap]`.
- Register every DOM write, listener, observer, attribute, CSS variable, favicon, and title change with the existing disposer path.
- Use real raster assets in `design/runtime/` for decorative artwork. Do not replace them with emoji, CSS art, inline SVG, or external URLs.
- Run `pnpm run ci` before opening a pull request.
- For visual changes, update the relevant preview screenshots and run `scripts/compose-design-qa.py`; record findings in `design-qa.md`.

## Theme assets

`pnpm run build` embeds the checked-in files from `design/runtime/` into the client bundle. If a source master changes, run:

```sh
python scripts/optimize-runtime-assets.py
pnpm run build
```

The large chroma-key and superseded cutout intermediates are intentionally ignored. Keep only the source files consumed by `optimize-runtime-assets.py` and the compact runtime outputs.

## Pull requests

Describe the user-visible result, list the commands run, and attach before/after screenshots when presentation changes. Keep unrelated refactors out of the same pull request.
