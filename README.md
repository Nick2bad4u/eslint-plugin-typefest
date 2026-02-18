# eslint-plugin-typefest

[![npm version.](https://img.shields.io/npm/v/eslint-plugin-typefest)](https://www.npmjs.com/package/eslint-plugin-typefest)
[![npm downloads.](https://img.shields.io/npm/dm/eslint-plugin-typefest)](https://www.npmjs.com/package/eslint-plugin-typefest)
[![license.](https://img.shields.io/npm/l/eslint-plugin-typefest)](./LICENSE)

ESLint plugin for teams that want consistent TypeScript-first conventions based on:

- [`type-fest`](https://github.com/sindresorhus/type-fest)
- [`ts-extras`](https://github.com/sindresorhus/ts-extras)

The plugin ships focused rule sets for modern flat config usage, with parser setup
included in each preset config.

## Table of contents

1. [Installation](#installation)
2. [Quick start (flat config)](#quick-start-flat-config)
3. [Presets](#presets)
4. [Configuration examples by preset](#configuration-examples-by-preset)
5. [Rules](#rules)

## Installation

```sh
npm install --save-dev eslint-plugin-typefest typescript
```

> `@typescript-eslint/parser` is loaded automatically by plugin presets.

## Quick start (flat config)

```js
import typefest from "eslint-plugin-typefest";

export default [typefest.configs.recommended];
```

That is enough for TypeScript files (`**/*.{ts,tsx,mts,cts}`).

## Presets

This plugin intentionally exports only six presets:

| Preset key                                  | Icon | Purpose                                         | Rules |
| ------------------------------------------- | :--: | ----------------------------------------------- | :---: |
| `typefest.configs.minimal`                  |  🟢  | Small starter set (lowest baseline footprint)   |   11  |
| `typefest.configs.recommended`              |   ✅  | Balanced default for most TS codebases          |   53  |
| `typefest.configs.strict`                   |  🔒  | Recommended + additional stable runtime helpers |   64  |
| `typefest.configs.all`                      |  🌐  | Every rule, including experimental              |   68  |
| `typefest.configs["type-fest/types"]`       |  🧠  | Type-fest-only recommended subset               |   34  |
| `typefest.configs["ts-extras/type-guards"]` |  🛡️ | ts-extras guard/assertion-focused subset        |   19  |

## Configuration examples by preset

```js
import typefest from "eslint-plugin-typefest";

export default [
  // Smallest baseline footprint.
  typefest.configs.minimal,

  // Balanced default for most teams.
  // typefest.configs.recommended,

  // Recommended plus additional stable runtime utilities.
  // typefest.configs.strict,

  // Every rule (includes experimental rules).
  // typefest.configs.all,

  // Focused subsets:
  // typefest.configs["type-fest/types"],
  // typefest.configs["ts-extras/type-guards"],
];
```

### Parser setup behavior

Each preset already includes:

- `files: ["**/*.{ts,tsx,mts,cts}"]`
- `languageOptions.parser` (`@typescript-eslint/parser`)
- `languageOptions.parserOptions`:
  - `ecmaVersion: "latest"`
  - `sourceType: "module"`

End users usually do **not** need to wire parser config manually.

If you need custom parser options (for example `projectService`), extend a preset:

```js
import typefest from "eslint-plugin-typefest";

const recommended = typefest.configs.recommended;

export default [
    {
        ...recommended,
        languageOptions: {
            ...recommended.languageOptions,
            parserOptions: {
                ...recommended.languageOptions?.parserOptions,
                projectService: true,
            },
        },
    },
];
```

## Rules

- `Fix` legend:
  - `🔧` = autofixable
  - `💡` = suggestions available
  - `—` = report only
- Preset columns mark where each rule is enabled by default.

| Rule                                              | Fix | 🟢 Minimal | ✅ Recommended | 🔒 Strict | 🌐 All | 🧠 type-fest/types | 🛡️ ts-extras/type-guards | Docs                                                           |
| ------------------------------------------------- | :-: | :--------: | :-----------: | :-------: | :----: | :----------------: | :-----------------------: | -------------------------------------------------------------- |
| `typefest/prefer-ts-extras-array-at`              |  —  |      —     |       —       |     ✅     |    ✅   |          —         |             —             | [docs](./docs/rules/prefer-ts-extras-array-at.md)              |
| `typefest/prefer-ts-extras-array-concat`          |  —  |      —     |       —       |     ✅     |    ✅   |          —         |             —             | [docs](./docs/rules/prefer-ts-extras-array-concat.md)          |
| `typefest/prefer-ts-extras-array-find-last-index` |  —  |      —     |       —       |     —     |    ✅   |          —         |             —             | [docs](./docs/rules/prefer-ts-extras-array-find-last-index.md) |
| `typefest/prefer-ts-extras-array-find-last`       |  —  |      —     |       —       |     —     |    ✅   |          —         |             —             | [docs](./docs/rules/prefer-ts-extras-array-find-last.md)       |
| `typefest/prefer-ts-extras-array-find`            |  —  |      —     |       —       |     —     |    ✅   |          —         |             —             | [docs](./docs/rules/prefer-ts-extras-array-find.md)            |
| `typefest/prefer-ts-extras-array-first`           |  —  |      —     |       —       |     ✅     |    ✅   |          —         |             —             | [docs](./docs/rules/prefer-ts-extras-array-first.md)           |
| `typefest/prefer-ts-extras-array-includes`        |  —  |      —     |       ✅       |     ✅     |    ✅   |          —         |             ✅             | [docs](./docs/rules/prefer-ts-extras-array-includes.md)        |
| `typefest/prefer-ts-extras-array-join`            |  —  |      —     |       —       |     ✅     |    ✅   |          —         |             —             | [docs](./docs/rules/prefer-ts-extras-array-join.md)            |
| `typefest/prefer-ts-extras-array-last`            |  —  |      —     |       —       |     ✅     |    ✅   |          —         |             —             | [docs](./docs/rules/prefer-ts-extras-array-last.md)            |
| `typefest/prefer-ts-extras-as-writable`           |  —  |      —     |       —       |     ✅     |    ✅   |          —         |             —             | [docs](./docs/rules/prefer-ts-extras-as-writable.md)           |
| `typefest/prefer-ts-extras-assert-defined`        |  —  |      —     |       ✅       |     ✅     |    ✅   |          —         |             ✅             | [docs](./docs/rules/prefer-ts-extras-assert-defined.md)        |
| `typefest/prefer-ts-extras-assert-error`          |  —  |      —     |       ✅       |     ✅     |    ✅   |          —         |             ✅             | [docs](./docs/rules/prefer-ts-extras-assert-error.md)          |
| `typefest/prefer-ts-extras-assert-present`        |  —  |      —     |       ✅       |     ✅     |    ✅   |          —         |             ✅             | [docs](./docs/rules/prefer-ts-extras-assert-present.md)        |
| `typefest/prefer-ts-extras-is-defined-filter`     |  —  |      ✅     |       ✅       |     ✅     |    ✅   |          —         |             ✅             | [docs](./docs/rules/prefer-ts-extras-is-defined-filter.md)     |
| `typefest/prefer-ts-extras-is-defined`            |  —  |      —     |       ✅       |     ✅     |    ✅   |          —         |             ✅             | [docs](./docs/rules/prefer-ts-extras-is-defined.md)            |
| `typefest/prefer-ts-extras-is-empty`              |  —  |      —     |       ✅       |     ✅     |    ✅   |          —         |             ✅             | [docs](./docs/rules/prefer-ts-extras-is-empty.md)              |
| `typefest/prefer-ts-extras-is-equal-type`         |  💡 |      —     |       —       |     —     |    ✅   |          —         |             —             | [docs](./docs/rules/prefer-ts-extras-is-equal-type.md)         |
| `typefest/prefer-ts-extras-is-finite`             |  —  |      —     |       ✅       |     ✅     |    ✅   |          —         |             ✅             | [docs](./docs/rules/prefer-ts-extras-is-finite.md)             |
| `typefest/prefer-ts-extras-is-infinite`           |  —  |      —     |       ✅       |     ✅     |    ✅   |          —         |             ✅             | [docs](./docs/rules/prefer-ts-extras-is-infinite.md)           |
| `typefest/prefer-ts-extras-is-integer`            |  —  |      —     |       ✅       |     ✅     |    ✅   |          —         |             ✅             | [docs](./docs/rules/prefer-ts-extras-is-integer.md)            |
| `typefest/prefer-ts-extras-is-present-filter`     |  —  |      ✅     |       ✅       |     ✅     |    ✅   |          —         |             ✅             | [docs](./docs/rules/prefer-ts-extras-is-present-filter.md)     |
| `typefest/prefer-ts-extras-is-present`            |  —  |      —     |       ✅       |     ✅     |    ✅   |          —         |             ✅             | [docs](./docs/rules/prefer-ts-extras-is-present.md)            |
| `typefest/prefer-ts-extras-is-safe-integer`       |  —  |      —     |       ✅       |     ✅     |    ✅   |          —         |             ✅             | [docs](./docs/rules/prefer-ts-extras-is-safe-integer.md)       |
| `typefest/prefer-ts-extras-key-in`                |  —  |      —     |       ✅       |     ✅     |    ✅   |          —         |             ✅             | [docs](./docs/rules/prefer-ts-extras-key-in.md)                |
| `typefest/prefer-ts-extras-not`                   |  —  |      —     |       ✅       |     ✅     |    ✅   |          —         |             ✅             | [docs](./docs/rules/prefer-ts-extras-not.md)                   |
| `typefest/prefer-ts-extras-object-entries`        |  —  |      —     |       —       |     ✅     |    ✅   |          —         |             —             | [docs](./docs/rules/prefer-ts-extras-object-entries.md)        |
| `typefest/prefer-ts-extras-object-from-entries`   |  —  |      —     |       —       |     ✅     |    ✅   |          —         |             —             | [docs](./docs/rules/prefer-ts-extras-object-from-entries.md)   |
| `typefest/prefer-ts-extras-object-has-in`         |  —  |      —     |       ✅       |     ✅     |    ✅   |          —         |             ✅             | [docs](./docs/rules/prefer-ts-extras-object-has-in.md)         |
| `typefest/prefer-ts-extras-object-has-own`        |  —  |      —     |       ✅       |     ✅     |    ✅   |          —         |             ✅             | [docs](./docs/rules/prefer-ts-extras-object-has-own.md)        |
| `typefest/prefer-ts-extras-object-keys`           |  —  |      —     |       —       |     ✅     |    ✅   |          —         |             —             | [docs](./docs/rules/prefer-ts-extras-object-keys.md)           |
| `typefest/prefer-ts-extras-object-values`         |  —  |      —     |       —       |     ✅     |    ✅   |          —         |             —             | [docs](./docs/rules/prefer-ts-extras-object-values.md)         |
| `typefest/prefer-ts-extras-safe-cast-to`          |  —  |      —     |       ✅       |     ✅     |    ✅   |          —         |             ✅             | [docs](./docs/rules/prefer-ts-extras-safe-cast-to.md)          |
| `typefest/prefer-ts-extras-set-has`               |  —  |      —     |       ✅       |     ✅     |    ✅   |          —         |             ✅             | [docs](./docs/rules/prefer-ts-extras-set-has.md)               |
| `typefest/prefer-ts-extras-string-split`          |  —  |      —     |       —       |     ✅     |    ✅   |          —         |             —             | [docs](./docs/rules/prefer-ts-extras-string-split.md)          |
| `typefest/prefer-type-fest-arrayable`             |  —  |      ✅     |       ✅       |     ✅     |    ✅   |          ✅         |             —             | [docs](./docs/rules/prefer-type-fest-arrayable.md)             |
| `typefest/prefer-type-fest-async-return-type`     |  —  |      —     |       ✅       |     ✅     |    ✅   |          ✅         |             —             | [docs](./docs/rules/prefer-type-fest-async-return-type.md)     |
| `typefest/prefer-type-fest-conditional-pick`      |  —  |      —     |       ✅       |     ✅     |    ✅   |          ✅         |             —             | [docs](./docs/rules/prefer-type-fest-conditional-pick.md)      |
| `typefest/prefer-type-fest-except`                |  —  |      ✅     |       ✅       |     ✅     |    ✅   |          ✅         |             —             | [docs](./docs/rules/prefer-type-fest-except.md)                |
| `typefest/prefer-type-fest-if`                    |  —  |      —     |       ✅       |     ✅     |    ✅   |          ✅         |             —             | [docs](./docs/rules/prefer-type-fest-if.md)                    |
| `typefest/prefer-type-fest-iterable-element`      |  —  |      —     |       ✅       |     ✅     |    ✅   |          ✅         |             —             | [docs](./docs/rules/prefer-type-fest-iterable-element.md)      |
| `typefest/prefer-type-fest-json-array`            |  —  |      ✅     |       ✅       |     ✅     |    ✅   |          ✅         |             —             | [docs](./docs/rules/prefer-type-fest-json-array.md)            |
| `typefest/prefer-type-fest-json-object`           |  —  |      ✅     |       ✅       |     ✅     |    ✅   |          ✅         |             —             | [docs](./docs/rules/prefer-type-fest-json-object.md)           |
| `typefest/prefer-type-fest-json-primitive`        |  —  |      ✅     |       ✅       |     ✅     |    ✅   |          ✅         |             —             | [docs](./docs/rules/prefer-type-fest-json-primitive.md)        |
| `typefest/prefer-type-fest-json-value`            |  —  |      ✅     |       ✅       |     ✅     |    ✅   |          ✅         |             —             | [docs](./docs/rules/prefer-type-fest-json-value.md)            |
| `typefest/prefer-type-fest-keys-of-union`         |  —  |      —     |       ✅       |     ✅     |    ✅   |          ✅         |             —             | [docs](./docs/rules/prefer-type-fest-keys-of-union.md)         |
| `typefest/prefer-type-fest-non-empty-tuple`       |  —  |      —     |       ✅       |     ✅     |    ✅   |          ✅         |             —             | [docs](./docs/rules/prefer-type-fest-non-empty-tuple.md)       |
| `typefest/prefer-type-fest-omit-index-signature`  |  —  |      —     |       ✅       |     ✅     |    ✅   |          ✅         |             —             | [docs](./docs/rules/prefer-type-fest-omit-index-signature.md)  |
| `typefest/prefer-type-fest-primitive`             |  —  |      ✅     |       ✅       |     ✅     |    ✅   |          ✅         |             —             | [docs](./docs/rules/prefer-type-fest-primitive.md)             |
| `typefest/prefer-type-fest-promisable`            |  —  |      ✅     |       ✅       |     ✅     |    ✅   |          ✅         |             —             | [docs](./docs/rules/prefer-type-fest-promisable.md)            |
| `typefest/prefer-type-fest-require-all-or-none`   |  —  |      —     |       ✅       |     ✅     |    ✅   |          ✅         |             —             | [docs](./docs/rules/prefer-type-fest-require-all-or-none.md)   |
| `typefest/prefer-type-fest-require-at-least-one`  |  —  |      —     |       ✅       |     ✅     |    ✅   |          ✅         |             —             | [docs](./docs/rules/prefer-type-fest-require-at-least-one.md)  |
| `typefest/prefer-type-fest-require-exactly-one`   |  —  |      —     |       ✅       |     ✅     |    ✅   |          ✅         |             —             | [docs](./docs/rules/prefer-type-fest-require-exactly-one.md)   |
| `typefest/prefer-type-fest-require-one-or-none`   |  —  |      —     |       ✅       |     ✅     |    ✅   |          ✅         |             —             | [docs](./docs/rules/prefer-type-fest-require-one-or-none.md)   |
| `typefest/prefer-type-fest-schema`                |  —  |      —     |       ✅       |     ✅     |    ✅   |          ✅         |             —             | [docs](./docs/rules/prefer-type-fest-schema.md)                |
| `typefest/prefer-type-fest-set-non-nullable`      |  —  |      —     |       ✅       |     ✅     |    ✅   |          ✅         |             —             | [docs](./docs/rules/prefer-type-fest-set-non-nullable.md)      |
| `typefest/prefer-type-fest-set-optional`          |  —  |      —     |       ✅       |     ✅     |    ✅   |          ✅         |             —             | [docs](./docs/rules/prefer-type-fest-set-optional.md)          |
| `typefest/prefer-type-fest-set-readonly`          |  —  |      —     |       ✅       |     ✅     |    ✅   |          ✅         |             —             | [docs](./docs/rules/prefer-type-fest-set-readonly.md)          |
| `typefest/prefer-type-fest-set-required`          |  —  |      —     |       ✅       |     ✅     |    ✅   |          ✅         |             —             | [docs](./docs/rules/prefer-type-fest-set-required.md)          |
| `typefest/prefer-type-fest-simplify`              |  —  |      —     |       ✅       |     ✅     |    ✅   |          ✅         |             —             | [docs](./docs/rules/prefer-type-fest-simplify.md)              |
| `typefest/prefer-type-fest-tagged-brands`         |  —  |      —     |       ✅       |     ✅     |    ✅   |          ✅         |             —             | [docs](./docs/rules/prefer-type-fest-tagged-brands.md)         |
| `typefest/prefer-type-fest-tuple-of`              |  —  |      —     |       ✅       |     ✅     |    ✅   |          ✅         |             —             | [docs](./docs/rules/prefer-type-fest-tuple-of.md)              |
| `typefest/prefer-type-fest-unknown-array`         |  —  |      —     |       ✅       |     ✅     |    ✅   |          ✅         |             —             | [docs](./docs/rules/prefer-type-fest-unknown-array.md)         |
| `typefest/prefer-type-fest-unknown-map`           |  —  |      —     |       ✅       |     ✅     |    ✅   |          ✅         |             —             | [docs](./docs/rules/prefer-type-fest-unknown-map.md)           |
| `typefest/prefer-type-fest-unknown-record`        |  —  |      ✅     |       ✅       |     ✅     |    ✅   |          ✅         |             —             | [docs](./docs/rules/prefer-type-fest-unknown-record.md)        |
| `typefest/prefer-type-fest-unknown-set`           |  —  |      —     |       ✅       |     ✅     |    ✅   |          ✅         |             —             | [docs](./docs/rules/prefer-type-fest-unknown-set.md)           |
| `typefest/prefer-type-fest-unwrap-tagged`         |  —  |      —     |       ✅       |     ✅     |    ✅   |          ✅         |             —             | [docs](./docs/rules/prefer-type-fest-unwrap-tagged.md)         |
| `typefest/prefer-type-fest-value-of`              |  —  |      —     |       ✅       |     ✅     |    ✅   |          ✅         |             —             | [docs](./docs/rules/prefer-type-fest-value-of.md)              |
| `typefest/prefer-type-fest-writable`              |  —  |      —     |       ✅       |     ✅     |    ✅   |          ✅         |             —             | [docs](./docs/rules/prefer-type-fest-writable.md)              |
