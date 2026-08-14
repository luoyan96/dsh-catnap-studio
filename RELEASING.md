# Releasing

1. Update the version in `package.json` and the release notes in `CHANGELOG.md`.
2. Run `pnpm install --frozen-lockfile` and `pnpm run ci`.
3. Commit the release changes.
4. Create and push a matching tag, for example `git tag v0.2.0` followed by `git push origin v0.2.0`.
5. The Release workflow verifies the tag, packs the plugin, and uploads the `.tgz` file to a GitHub Release.

The package version and tag must match. Do not commit `lib/`, generated data-URI source, or `.tgz` artifacts; CI rebuilds them from the checked-in source and runtime assets.
