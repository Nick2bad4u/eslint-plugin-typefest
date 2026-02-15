# Releasing `eslint-plugin-typefest`

## One-time setup

1. Ensure you can publish this package name on npm (`eslint-plugin-typefest`).
2. In GitHub repo settings, add secret: `NPM_TOKEN`.
   - Use an npm automation token with publish access.
3. Confirm Actions are enabled for the repository.

## Pre-release checks (local)

```bash
npm ci
npm run release:check
```

## Create a release

1. Bump `package.json` version.
2. Commit and push to `main`.
3. Create and push a matching `v*` tag:

```bash
git tag v0.1.0
git push origin v0.1.0
```

The release workflow will:

- validate tag matches `package.json` version
- run lint/typecheck/tests + pack dry-run
- publish with provenance (`npm publish --provenance`)

`workflow_dispatch` runs verification only; publish is tag-gated (`refs/tags/v*`).

## Notes

- If tag and `package.json` version differ, release fails intentionally.
- `npm view eslint-plugin-typefest` currently returns `E404` (name appears unclaimed at time of setup).
