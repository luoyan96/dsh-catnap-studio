# Catnap Studio v0.3.2

## Package identity migration

This release introduces the public npm package name `dsh-catnap-plugins`.
Catnap Studio remains the product name and continues to use the existing
GitHub repository. The former `dsh-client-ui-skin-catnap` package name is not
published and should no longer be used for new installations.

## Install

After this version is published to npm:

```powershell
dsh plugin --profile web add dsh-catnap-plugins@0.3.2
dsh web
```

Existing local installs under the old name should first be removed, then
installed again under the new name:

```powershell
dsh plugin --profile web remove dsh-client-ui-skin-catnap
dsh plugin --profile web add dsh-catnap-plugins@0.3.2
dsh web
```

Restart `dsh web` after upgrading. Confirm the downloaded release tarball's
SHA-256 against `CHECKSUMS.txt` when using the GitHub Release fallback.

## Verification

- TypeScript typecheck
- Vitest test suite
- Production bundle build and package dry run
- Package identity consistency across the Cordis patch, browser module loader,
  preview loader, installation documentation, and npm publish workflow

Catnap Studio is a community project built on DeepSeek Harness; it is not an
official DeepSeek product or endorsement.
