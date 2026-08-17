# Releasing

1. Complete the first-time npm Trusted Publishing setup in `docs/NPM_PUBLISHING.md`.
2. Update the version in `package.json` and the release notes in `CHANGELOG.md`.
3. Run `pnpm install --frozen-lockfile` and `pnpm run ci`.
4. Commit and push the release changes.
5. Create and push a matching tag, for example `git tag v0.3.2` followed by `git push origin v0.3.2`.
6. The Release workflow verifies the tag, publishes the public npm package through OIDC, then uploads the `.tgz`, checksum and release notes to GitHub Release.

The package version and tag must match. Do not commit `lib/`, generated data-URI source, or `.tgz` artifacts; CI rebuilds them from the checked-in source and runtime assets.
