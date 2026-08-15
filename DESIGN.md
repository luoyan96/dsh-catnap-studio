# Catnap Studio design system

The plugin follows three selected image references in `design/`: `theme-warm-paper-reference.png`, `theme-moonlit-reference.png`, and `theme-atelier-reference.png`. Each theme keeps the DSH information architecture intact while the suite composes proven functional modules from the public DSH Web UI ecosystem.

## Theme families

| Theme | Surface | Accent | Cat placement | Status copy |
| --- | --- | --- | --- | --- |
| Warm Paper Den | cream handmade paper | apricot + sage | sleeping tabby on composer | `CATNAP · 就绪 · 猫咪在线 · 暖灯已开` |
| Moonlit Guardian | deep indigo paper | warm gold + violet | guardian in sidebar, lantern sleeper below composer | `MOONLIT · 夜间专注 · 猫咪守夜 · 暖灯已开` |
| Cat Atelier | recycled drafting paper | cobalt + vermilion | tuxedo cat peeking beside composer | `ATELIER · 就绪 · 猫咪协作中 · 灵感在线` |

## Shared behavior

- A real raster paper texture fills the workspace; generated transparent PNG cats occupy measured decorative slots.
- The bottom status bar contains the persistent theme selector and theme-specific status labels.
- Theme selection is stored in `localStorage` under `dsh-catnap-theme`.
- The Cat Den Center exposes themes, companion controls, and a capability summary without replacing the host settings UI.
- The draggable companion stores its name, affinity, treats, visibility, and last position under `dsh-catnap-companion`.
- Task board, Git graph, file/preview panel, live statistics, and plugin settings are registered as separate Cordis rows before the Catnap theme layer.
- Mascots follow the widest visible textarea and are repositioned on layout changes.
- Composer decorations and lower-priority status cells hide below 860px; the interactive companion and theme selector stay accessible.
- All plugin-owned DOM, listeners, observers, attributes, CSS variables, favicon, and title are retracted by the disposer.
