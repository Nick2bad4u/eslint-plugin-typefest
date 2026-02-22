# Contributing to eslint-plugin-typefest

Thanks for your interest in contributing.

This repository contains an ESLint plugin focused on `type-fest` and
`ts-extras` usage patterns for TypeScript codebases.

## Prerequisites

- Node.js `>=20.19.0` (see `package.json#engines`)
- npm `>=11`
- Git

## Local setup

1. Fork and clone the repository.

2. Install dependencies from the repository root:

   ```bash
   npm ci --force
   ```

3. Run the main quality gate:

   ```bash
   npm run lint:all:fix:quiet
   npm run typecheck
   npm test
   ```

## Recommended development workflow

1. Create a branch from `main`.
2. Make focused changes.
3. Add or update tests in `test/` when behavior changes.
4. Update relevant documentation in `docs/` and root docs when needed.
5. Run validation commands before opening a pull request.

## Debugging and logging policy

To keep runtime plugin behavior predictable, this repository enforces strict
rules for logging and debugger usage in source code.

- `src/**` and `plugin.mjs`: do **not** commit `console.*` or `debugger`
  statements.
- `scripts/**`: `console.log`/`console.warn`/`console.error` are allowed for
  CLI progress and diagnostics.
- `test/**`: avoid noisy logging by default; only keep it when a test is
  explicitly validating logging behavior.

When adding script output, prefer this severity split:

- `console.log`: normal progress
- `console.warn`: recoverable issue or fallback behavior
- `console.error`: failure path (typically followed by a non-zero exit code)

## Project layout

```text
.
├── src/                  # Plugin source and rule implementations
├── test/                 # Rule tests and test helpers
├── docs/                 # Rule docs and Docusaurus docs app
├── scripts/              # Repository scripts
├── .github/              # Workflows and automation configs
└── package.json          # Scripts, dependencies, metadata
```

## Validation commands

Use these commands locally before submitting a pull request:

- `npm run typecheck`
- `npm test`
- `npm run lint:all:fix:quiet`

Optional focused checks:

- `npm run mutation:test` for Stryker mutation testing
- `npm run changelog:preview` to preview unreleased changelog output

## Commit guidance

Conventional Commits are recommended because release notes and changelog tooling
are commit-message aware.

Examples:

- `feat(rule): add prefer-type-fest-xyz`
- `fix(rule): avoid false positive in union type handling`
- `docs: clarify configuration for type-aware rules`

## Pull request expectations

- Keep pull requests scoped and reviewable.
- Include tests for behavior changes.
- Keep docs in sync with implementation changes.
- Do not include generated lockfile churn unrelated to the change.

## Security

Do not open public issues for potential vulnerabilities.
Use the process described in [SECURITY.md](./SECURITY.md).

## License

By contributing, you agree your contributions are licensed under the
[MIT License](./LICENSE).
