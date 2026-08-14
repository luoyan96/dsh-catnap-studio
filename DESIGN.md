# Catnap Studio design system

The plugin follows three selected image references in `design/`: `theme-warm-paper-reference.png`, `theme-moonlit-reference.png`, and `theme-atelier-reference.png`. Each theme keeps the DSH information architecture intact and changes only presentation.

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
- Mascots follow the widest visible textarea and are repositioned on layout changes.
- Decorative cats and lower-priority status cells hide below 860px; the selector stays accessible.
- All plugin-owned DOM, listeners, observers, attributes, CSS variables, favicon, and title are retracted by the disposer.
