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
npm run changelog:preview
```

## Changelog and release notes flow

This repository uses `git-cliff` for changelog generation and release notes.

- `npm run changelog:generate` writes `CHANGELOG.md` locally.
- `npm run changelog:preview` prints unreleased notes to stdout.
- `npm run changelog:release-notes` prints the latest tagged release notes for CI usage.

Important: CI does **not** commit or push changelog changes.
Release notes are generated at workflow runtime and attached to the GitHub release body.

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
- generate release notes with `git-cliff` using full git history and tags
- publish with provenance (`npm publish --provenance`)
- create the GitHub release using generated notes from `temp/release-notes.md`

`workflow_dispatch` runs verification only; publish is tag-gated (`refs/tags/v*`).

## Notes

- If tag and `package.json` version differ, release fails intentionally.
- CI changelog generation is intentionally no-commit/no-push.

## Pre-publish package surface checklist (required before first public release)

This project is currently dogfooded from source, so publish-surface validation
is intentionally lower priority during architecture work. Before the first real
public publish, complete all of the following package-entrypoint checks:

1. Build artifact import succeeds (`dist/plugin.js`).
2. Package `exports` resolution works for `.` and `./package.json`.
3. Types entrypoint resolves (`dist/plugin.d.ts`) from a consumer tsconfig.
4. Default plugin export shape is validated from built output.
5. `npm pack --dry-run` output is validated, then packed tarball import is
   smoke-tested in an isolated temp project.

Treat this checklist as a release gate alongside lint/typecheck/tests.
