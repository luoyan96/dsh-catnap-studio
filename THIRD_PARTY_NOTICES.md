# Third-party notices

Catnap Studio composes the following published packages from
[`zhu1090093659/dsh-web-ui`](https://github.com/zhu1090093659/dsh-web-ui):

- `@linxin666/dsh-client-ui-aionui-panel`
- `@linxin666/dsh-client-ui-git-graph`
- `@linxin666/dsh-client-ui-task-board`
- `@linxin666/dsh-client-ui-web-ui-settings`
- `@linxin666/dsh-live-stats`

Catnap Studio embeds the compiled host and browser code from version `0.1.12`
of these packages so a local `link:` or Release tarball remains a true
one-command installation. It does not copy their character, background, pet,
or skin assets.

The `0.1.12` package manifests declare `Apache-2.0`; their distributed
tarballs also contain BSD-3-Clause license files. Catnap Studio preserves both
sets of terms and notices in `THIRD_PARTY_LICENSES/`:

- `Apache-2.0.txt`
- `dsh-web-ui-BSD-3-Clause.txt`

The embedded `cosmokit`, `schemastery`, and `zod` utility code is MIT licensed;
its notices are preserved in `THIRD_PARTY_LICENSES/embedded-MIT.txt`.

The Catnap themes, cat companion implementation, generated cat illustrations,
and paper textures are maintained in this repository under BSD-3-Clause.

## Better Sidebar compatibility

Catnap Studio is compatible with the independently distributed
[`dsh-better-sidebar`](https://github.com/omdsh-dev/DSH-better-sidebar)
(`dsh-better-sidebar@0.12.3` at the time this compatibility layer was added),
which is MIT licensed, copyright (c) 2026 dsh-external. This repository does
not copy, bundle, modify, or redistribute Better Sidebar source code. The
compatibility layer only detects the optional DSH module, avoids duplicate
legacy clients, and supplies shared DSH design tokens; its terminal,
filesystem, WebSocket, and node-pty implementations remain in Better Sidebar.
