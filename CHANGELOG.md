# Changelog

All notable changes to this project will be documented in this file.

## 0.1.0 - 2026-02-15

### Added

- Initial public release of `eslint-plugin-typefest`.
- New standalone plugin entrypoint at package root.
- CI workflow for lint/typecheck/test validation.
- Release workflow for npm publishing with provenance.
- Release safeguards:
  - tag/version consistency check
  - tag-gated publish
  - workflow timeout and concurrency guard
- Release documentation in `RELEASING.md`.

### Rules

- `typefest/prefer-type-fest-json-value`
- `typefest/prefer-type-fest-promisable`
- `typefest/prefer-type-fest-tagged-brands`
- `typefest/prefer-type-fest-unknown-record`
- `typefest/prefer-type-fest-value-of`
- `typefest/prefer-ts-extras-is-defined-filter`
- `typefest/prefer-ts-extras-is-present-filter`
- `typefest/prefer-ts-extras-object-has-own`

### Changed

- Converted internal, monorepo-scoped plugin structure into a standalone public package layout.
- Updated docs URLs and rule metadata for `eslint-plugin-typefest` repository paths.
- Improved package metadata and dependency model for public plugin publishing.

### Removed

- Removed non-type-fest/ts-extras rules and old `plugins/uptime-watcher` tree.
