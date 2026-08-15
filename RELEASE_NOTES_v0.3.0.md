# Catnap Studio v0.3.0

Catnap Studio 0.3.0 turns the original three-theme skin pack into a complete cat-themed DeepSeek Harness workbench.

## Highlights

- Adds a calm interactive cat companion with resting, sleeping, stretching, yarn-play and petting states.
- Keeps the companion out of Settings and composer popovers so controls remain unobstructed.
- Moves the three-theme selector into Settings → General → Appearance with larger visual cards.
- Adds the Catnap center, task board, Git graph, file/preview panel, live statistics and unified plugin settings.
- Keeps all original cat illustrations, bed assets and purr audio inside the plugin bundle with no runtime image requests.
- Includes third-party notices and license texts for the attributed workbench modules.

## Installation

Download `dsh-client-ui-skin-catnap-0.3.0.tgz` from the GitHub Release and run:

```powershell
dsh plugin --profile web add "C:\path\to\dsh-client-ui-skin-catnap-0.3.0.tgz"
dsh web
```

Restart `dsh web` after upgrading. If an older linked development copy is installed, remove it first:

```powershell
dsh plugin --profile web remove dsh-client-ui-skin-catnap
```

## Verification

- TypeScript typecheck
- 20 Vitest tests across five test files
- Production bundle build
- npm package dry run
- Browser interaction and console checks
- Six companion-state visual acceptance captures
