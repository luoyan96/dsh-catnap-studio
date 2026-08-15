# Product Design QA — Catnap Studio 0.3.0

## Visual truth and capture set

The reference repository supplies the functional framework. Catnap Studio deliberately replaces its character, scene art, and pet with original cat visuals instead of copying those assets.

| Surface | Source visual truth | Implementation evidence | Viewport / state |
| --- | --- | --- | --- |
| Three-pane workbench | `../../.tmp/ref-13-hero-main.png` | `design-qa/v0.3.0-main.png` | Reference 1600 × 900 active session; implementation 1280 × 720 empty session |
| Skin / plugin center | `../../.tmp/ref-03-settings-skin-center.png` | `design-qa/v0.3.0-studio.png` | Reference 1470 × 859; implementation 1280 × 720, Catnap Studio open |
| Task board | Reference repository task-board pattern | `design-qa/v0.3.0-task-board.png` | 1280 × 720, five workflow columns visible |
| Plugin settings | Reference repository nested Web UI settings | `design-qa/v0.3.0-settings.png` | 1280 × 720, Web UI plugin section expanded |
| Responsive skin chrome | `design/theme-warm-paper-reference.png` | `design-qa/responsive-820.png` | 820 × 900 |

## Required combined comparison inputs

Each file places the source and the implementation in the same image so the visible differences can be judged together.

- `design-qa/v0.3.0-workbench-comparison.jpg`
- `design-qa/v0.3.0-center-comparison.jpg`
- Theme direction comparisons: `design-qa/warm-comparison.jpg`, `design-qa/moonlit-comparison.jpg`, `design-qa/atelier-comparison.jpg`

## Visible comparison

- **Information architecture:** the left workspace/session rail, center conversation canvas, right file/change inspector, settings entry, bottom status strip, and task-board entry follow the same hierarchy as the reference.
- **Workbench density:** Catnap uses the same compact control density and three-pane proportions. The implementation capture is intentionally an empty-session state, so it does not reproduce the reference capture's conversation transcript.
- **Skin center:** the reference's nested Web UI configuration is represented by a dedicated Catnap Studio with three working tabs: theme wardrobe, companion management, and bundled capabilities.
- **Visual replacement:** the reference character, background illustration, and pet are replaced by generated cat artwork for Warm Paper Den, Moonlit Guardian, and Cat Atelier. No reference character artwork is bundled.
- **Typography and spacing:** host typography is preserved for compatibility; Catnap adds warm paper, deep indigo, or recycled-paper tokens without changing host component metrics.

## Findings and fixes

| Priority | Finding | Fix | Final status |
| --- | --- | --- | --- |
| P1 | Installing the five reference feature packages as separate runtime dependencies failed for local `link:` installs because DSH resolves plugin modules from the profile root. | Bundled the selected host and browser modules into one self-contained aggregate package with no runtime dependencies. | Fixed |
| P1 | Bundled browser modules initially started without the host services they require. | Exported the complete client service injection union for runtime, connection, locale, conversation, and settings. | Fixed |
| P1 | The task-board view registered but rendered empty because the current DSH shell did not expose the compatibility `data-pane` markers expected by the module. | Projected pane markers from the canonical sidebar/conversation/details slots and restored pre-existing values on disposal. | Fixed |
| P2 | A theme selector alone did not match the reference repository's integrated management experience. | Added Catnap Studio with working theme, pet, and capability tabs plus a nested settings section. | Fixed |
| P2 | The companion was decorative only. | Added direct petting, a 5px drag threshold with persisted position, hide/recall, rename, local sound controls, autonomous-activity controls, explicit state scheduling, and a separate cat-bed settings entrance. Removed affinity/treat gamification from the companion UI. | Fixed |

No remaining P0, P1, or P2 issue affects the primary install, theme selection, task-board, file-panel, settings, or companion journeys.

## Browser interaction record

- Loaded the packaged plugin in the real DSH Web profile at `http://127.0.0.1:4174`.
- Verified the task-board route renders five columns and that the new-task dialog opens and cancels without mutating user state.
- Opened Catnap Studio, switched theme, companion, and capability tabs, changed to Moonlit Guardian, and verified companion affinity changes.
- Opened DSH Settings → Plugins → Web UI Plugins and confirmed Task Board and Live Token Estimate configuration cards render.
- Verified the right file/change inspector and workspace tree render in the host shell.
- Loaded a fresh page and observed zero browser console errors and zero browser console warnings.

## Runtime health

- TypeScript: passed
- Unit tests: 7 passed
- Production bundle: passed
- Package dry run: passed
- Packed artifact: `D:/deepseek-agent/.tmp/catnap-packed-final/dsh-client-ui-skin-catnap-0.3.0.tgz`
- Browser console errors: 0
- Browser console warnings: 0
- Framework error overlays: none

## Companion redesign QA — 2026-08-15

### Approved direction and combined comparisons

- Warm Paper Den: orange tabby reclining naturally on a compact rattan-and-canvas lounge chair.
- Moonlit Guardian: compact black cat on a low navy cushion at lower right; the independent lantern/botanical decoration sits at upper left.
- Cat Atelier: the established tuxedo cat reclining on a low cream canvas and pale-wood pad; the original peeking decoration remains separate.
- Fixed cat-bed entrance: the same tuxedo identity curled in a theme-colored nest, separate from the movable work-area cat.

The mandatory same-frame reference/implementation comparisons are:

- `design-qa/companion/comparison/warm-comparison.jpg`
- `design-qa/companion/comparison/moonlit-comparison.jpg`
- `design-qa/companion/comparison/atelier-comparison.jpg`

### Six-state capture set

All captures are exactly 1440 × 1024:

- `design-qa/companion/01-default-rest.png`
- `design-qa/companion/02-stretching.png`
- `design-qa/companion/03-playing-yarn.png`
- `design-qa/companion/04-petted.png`
- `design-qa/companion/05-bed-entrance.png`
- `design-qa/companion/06-settings-open.png`

### Findings and fixes

| Priority | Finding | Evidence and impact | Fix | Final status |
| --- | --- | --- | --- | --- |
| P1 | Browser runtime failed at plugin activation with `Illegal invocation`. | Real DSH host at 1440 × 1024 failed before rendering the skin. | Bound scheduler timeout/clear-timeout calls through `globalThis`; reran real-host boot. | Fixed |
| P1 | Work cat click and bottom cat-bed entrance had the same destination. | Clicking the movable companion opened Studio instead of acknowledging direct interaction. | Work cat pointer-up under 5px and keyboard click now enter `petted`; only the bed opens the companion panel. | Fixed |
| P2 | The warm cat looked suspended and the Atelier work cat stood upright. | Approved target and runtime captures showed physically implausible support/pose. | Replaced work-area assets with chair/pad-supported reclining pose families and aligned every frame to the same baseline. | Fixed |
| P2 | Moonlit pet and background decoration competed in the same lower-right area. | Combined comparison showed the original stacked sleeper/lantern footprint. | Moved the lantern group to upper left and reduced the black work cat to the same compact footprint as the other themes. | Fixed |
| P2 | Autonomous motion could conflict with typing, overlays, reduced-motion, or teardown. | Interaction and timer review found no explicit shared lifecycle. | Added explicit state machine/scheduler, typing quiet period, overlay/visibility/blur pause reasons, reduced-motion behavior, and full timer/listener/audio cleanup. | Fixed |

### Browser interaction record

- Browser: Codex in-app Browser; real DSH Web host; 1440 × 1024 desktop viewport.
- Page identity: `Catnap Desktop · 暖纸猫窝`, then Moonlit and Atelier after theme switching.
- Verified default/resting, stretching, playing-yarn, petted, cat-bed entrance, and companion settings states.
- Verified work-cat click changes state to `petted` while the cat-bed button remains collapsed and no Studio dialog opens.
- Verified the cat-bed button opens the `猫窝工作台` directly on the companion tab.
- Verified 800 × 900 narrow viewport hides the movable cat but leaves the bed entrance visible.
- Browser console on the final host: 0 application errors, 0 application warnings; no framework error overlay.

### Runtime health

- `pnpm.cmd --config.verify-deps-before-run=warn run ci`: passed.
- TypeScript: passed.
- Vitest: 5 files, 20 tests passed.
- Production bundle: passed (`lib/client.js` 3.48 MB, `lib/index.js` 229.89 kB).
- Package dry run: passed.
- The only CI notice was the pre-existing pnpm virtual-store setting mismatch; dependency verification was set to warn so the existing user-owned `node_modules` tree was not purged.
- No EXE build, publication, deployment, release, or Git push was performed.

final result: passed
