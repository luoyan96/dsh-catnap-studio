# Catnap Studio v0.3.1

This maintenance release publishes the final Catnap Studio workbench build that
is bundled by Catnap Desktop v0.2.2.

## Highlights

- Keeps the companion clear of the Files panel and composer actions by default.
- Hides decorative and interactive cats while Settings, the model picker, and
  other host overlays are open.
- Preserves three original themes, local companion preferences, reduced-motion
  and sound controls, and bundled-only visual assets.

## Install

```powershell
dsh plugin --profile web add "C:\path\to\dsh-client-ui-skin-catnap-0.3.1.tgz"
dsh web
```

Restart `dsh web` after upgrading. Confirm the downloaded asset's SHA-256
against `CHECKSUMS.txt` before installing.

## Verification

- TypeScript typecheck
- 22 Vitest tests across five test files
- Production bundle build and package dry run
- Real DSH visual captures, including settings and host-overlay avoidance

Catnap Studio is a community project built on DeepSeek Harness; it is not an
official DeepSeek product or endorsement.
