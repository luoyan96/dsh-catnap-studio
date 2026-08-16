# Changelog

All notable changes to Catnap Studio are documented here.

## 0.3.1 — 2026-08-16

- Publishes the validated companion placement and external-overlay avoidance fixes that were not included by the existing `v0.3.0` tag.
- Adds release-ready installation, checksum, screenshot, security, and non-official-product guidance.

## 0.3.0 — 2026-08-14

- Moved the three-theme switcher into Settings → General → Appearance with larger visual cards.
- Hidden decorative and companion cats while Settings is open to prevent modal overlap, restoring them on close.
- Hidden decorative and companion cats while composer popovers are open, restoring them as soon as the popover closes.
- Fixed a MutationObserver feedback loop that could leave Harness stuck on “Loading plugins…” after the popover-overlap update.
- Fixed the standalone preview loader so bundled workbench modules no longer trigger an unexpected runtime dependency error.
- Removed the tiny bottom-bar theme shortcut while keeping the Catnap status indicators.
- Expanded Catnap Studio from a skin pack into a themed DSH workbench suite.
- Added task board, Git graph, file/preview panel, live token stats, and unified plugin settings through attributed Apache-2.0 dependencies.
- Added an in-product Catnap center with visual theme cards and persistent switching.
- Added a draggable cat companion with naming, petting, feeding, hiding, treats, and affinity state.
- Added third-party notices while keeping all original character, background, pet, and skin assets out of the package.

## 0.2.0 — 2026-08-14

- Combined Warm Paper Den, Moonlit Guardian, and Cat Atelier in one installable plugin.
- Added an accessible status-bar theme selector with persistent local preference.
- Added generated cat illustrations and paper textures with no runtime image requests.
- Added desktop, active-session, and narrow-screen preview states.
- Added lifecycle, switching, persistence, build, type, browser, and visual QA coverage.

## 0.1.0

- Added the original Warm Paper Den skin and sleeping tabby.
