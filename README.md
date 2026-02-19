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

| Preset                                         |
| ---------------------------------------------- |
| 🟢 `typefest.configs.minimal`                  |
| 🟡 `typefest.configs.recommended`              |
| 🔴 `typefest.configs.strict`                   |
| 🟣 `typefest.configs.all`                      |
| 💠 `typefest.configs["type-fest/types"]`       |
| ✴️ `typefest.configs["ts-extras/type-guards"]` |

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
- `Preset key` legend: `🟢 minimal` · `🟡 recommended` · `🔴 strict` · `🟣 all` · `💠 type-fest/types` · `✴️ ts-extras/type-guards`

| Rule                                                                                                                                              | Fix |   Preset key   |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | :-: | :------------: |
| [`prefer-ts-extras-array-at`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-array-at)                           |  —  |      🔴 🟣     |
| [`prefer-ts-extras-array-concat`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-array-concat)                   |  —  |      🔴 🟣     |
| [`prefer-ts-extras-array-find-last-index`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-array-find-last-index) |  —  |       🟣       |
| [`prefer-ts-extras-array-find-last`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-array-find-last)             |  —  |       🟣       |
| [`prefer-ts-extras-array-find`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-array-find)                       |  —  |       🟣       |
| [`prefer-ts-extras-array-first`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-array-first)                     |  —  |      🔴 🟣     |
| [`prefer-ts-extras-array-includes`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-array-includes)               |  —  |   🟡 🔴 🟣 ✴️  |
| [`prefer-ts-extras-array-join`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-array-join)                       |  —  |      🔴 🟣     |
| [`prefer-ts-extras-array-last`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-array-last)                       |  —  |      🔴 🟣     |
| [`prefer-ts-extras-as-writable`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-as-writable)                     |  —  |      🔴 🟣     |
| [`prefer-ts-extras-assert-defined`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-assert-defined)               |  —  |   🟡 🔴 🟣 ✴️  |
| [`prefer-ts-extras-assert-error`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-assert-error)                   |  —  |   🟡 🔴 🟣 ✴️  |
| [`prefer-ts-extras-assert-present`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-assert-present)               |  —  |   🟡 🔴 🟣 ✴️  |
| [`prefer-ts-extras-is-defined-filter`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-is-defined-filter)         |  —  | 🟢 🟡 🔴 🟣 ✴️ |
| [`prefer-ts-extras-is-defined`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-is-defined)                       |  —  |   🟡 🔴 🟣 ✴️  |
| [`prefer-ts-extras-is-empty`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-is-empty)                           |  —  |   🟡 🔴 🟣 ✴️  |
| [`prefer-ts-extras-is-equal-type`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-is-equal-type)                 |  💡 |       🟣       |
| [`prefer-ts-extras-is-finite`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-is-finite)                         |  —  |   🟡 🔴 🟣 ✴️  |
| [`prefer-ts-extras-is-infinite`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-is-infinite)                     |  —  |   🟡 🔴 🟣 ✴️  |
| [`prefer-ts-extras-is-integer`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-is-integer)                       |  —  |   🟡 🔴 🟣 ✴️  |
| [`prefer-ts-extras-is-present-filter`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-is-present-filter)         |  —  | 🟢 🟡 🔴 🟣 ✴️ |
| [`prefer-ts-extras-is-present`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-is-present)                       |  —  |   🟡 🔴 🟣 ✴️  |
| [`prefer-ts-extras-is-safe-integer`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-is-safe-integer)             |  —  |   🟡 🔴 🟣 ✴️  |
| [`prefer-ts-extras-key-in`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-key-in)                               |  —  |   🟡 🔴 🟣 ✴️  |
| [`prefer-ts-extras-not`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-not)                                     |  —  |   🟡 🔴 🟣 ✴️  |
| [`prefer-ts-extras-object-entries`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-object-entries)               |  —  |      🔴 🟣     |
| [`prefer-ts-extras-object-from-entries`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-object-from-entries)     |  —  |      🔴 🟣     |
| [`prefer-ts-extras-object-has-in`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-object-has-in)                 |  —  |   🟡 🔴 🟣 ✴️  |
| [`prefer-ts-extras-object-has-own`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-object-has-own)               |  —  |   🟡 🔴 🟣 ✴️  |
| [`prefer-ts-extras-object-keys`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-object-keys)                     |  —  |      🔴 🟣     |
| [`prefer-ts-extras-object-values`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-object-values)                 |  —  |      🔴 🟣     |
| [`prefer-ts-extras-safe-cast-to`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-safe-cast-to)                   |  —  |   🟡 🔴 🟣 ✴️  |
| [`prefer-ts-extras-set-has`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-set-has)                             |  —  |   🟡 🔴 🟣 ✴️  |
| [`prefer-ts-extras-string-split`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-string-split)                   |  —  |      🔴 🟣     |
| [`prefer-type-fest-abstract-constructor`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-abstract-constructor)   |  —  |   🟡 🔴 🟣 💠  |
| [`prefer-type-fest-arrayable`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-arrayable)                         |  —  | 🟢 🟡 🔴 🟣 💠 |
| [`prefer-type-fest-async-return-type`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-async-return-type)         |  —  |   🟡 🔴 🟣 💠  |
| [`prefer-type-fest-conditional-pick`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-conditional-pick)           |  —  |   🟡 🔴 🟣 💠  |
| [`prefer-type-fest-constructor`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-constructor)                     |  —  |   🟡 🔴 🟣 💠  |
| [`prefer-type-fest-except`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-except)                               |  —  | 🟢 🟡 🔴 🟣 💠 |
| [`prefer-type-fest-if`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-if)                                       |  —  |   🟡 🔴 🟣 💠  |
| [`prefer-type-fest-iterable-element`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-iterable-element)           |  —  |   🟡 🔴 🟣 💠  |
| [`prefer-type-fest-json-array`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-json-array)                       |  —  | 🟢 🟡 🔴 🟣 💠 |
| [`prefer-type-fest-json-object`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-json-object)                     |  —  | 🟢 🟡 🔴 🟣 💠 |
| [`prefer-type-fest-json-primitive`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-json-primitive)               |  —  | 🟢 🟡 🔴 🟣 💠 |
| [`prefer-type-fest-json-value`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-json-value)                       |  —  | 🟢 🟡 🔴 🟣 💠 |
| [`prefer-type-fest-keys-of-union`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-keys-of-union)                 |  —  |   🟡 🔴 🟣 💠  |
| [`prefer-type-fest-literal-union`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-literal-union)                 |  —  |   🟡 🔴 🟣 💠  |
| [`prefer-type-fest-merge-exclusive`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-merge-exclusive)             |  —  |   🟡 🔴 🟣 💠  |
| [`prefer-type-fest-non-empty-tuple`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-non-empty-tuple)             |  —  |   🟡 🔴 🟣 💠  |
| [`prefer-type-fest-omit-index-signature`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-omit-index-signature)   |  —  |   🟡 🔴 🟣 💠  |
| [`prefer-type-fest-partial-deep`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-partial-deep)                   |  —  |   🟡 🔴 🟣 💠  |
| [`prefer-type-fest-primitive`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-primitive)                         |  —  | 🟢 🟡 🔴 🟣 💠 |
| [`prefer-type-fest-promisable`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-promisable)                       |  —  | 🟢 🟡 🔴 🟣 💠 |
| [`prefer-type-fest-readonly-deep`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-readonly-deep)                 |  —  |   🟡 🔴 🟣 💠  |
| [`prefer-type-fest-require-all-or-none`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-require-all-or-none)     |  —  |   🟡 🔴 🟣 💠  |
| [`prefer-type-fest-require-at-least-one`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-require-at-least-one)   |  —  |   🟡 🔴 🟣 💠  |
| [`prefer-type-fest-require-exactly-one`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-require-exactly-one)     |  —  |   🟡 🔴 🟣 💠  |
| [`prefer-type-fest-require-one-or-none`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-require-one-or-none)     |  —  |   🟡 🔴 🟣 💠  |
| [`prefer-type-fest-required-deep`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-required-deep)                 |  —  |   🟡 🔴 🟣 💠  |
| [`prefer-type-fest-schema`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-schema)                               |  —  |   🟡 🔴 🟣 💠  |
| [`prefer-type-fest-set-non-nullable`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-set-non-nullable)           |  —  |   🟡 🔴 🟣 💠  |
| [`prefer-type-fest-set-optional`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-set-optional)                   |  —  |   🟡 🔴 🟣 💠  |
| [`prefer-type-fest-set-readonly`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-set-readonly)                   |  —  |   🟡 🔴 🟣 💠  |
| [`prefer-type-fest-set-required`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-set-required)                   |  —  |   🟡 🔴 🟣 💠  |
| [`prefer-type-fest-simplify`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-simplify)                           |  —  |   🟡 🔴 🟣 💠  |
| [`prefer-type-fest-tagged-brands`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-tagged-brands)                 |  —  |   🟡 🔴 🟣 💠  |
| [`prefer-type-fest-tuple-of`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-tuple-of)                           |  —  |   🟡 🔴 🟣 💠  |
| [`prefer-type-fest-unknown-array`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-unknown-array)                 |  —  |   🟡 🔴 🟣 💠  |
| [`prefer-type-fest-unknown-map`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-unknown-map)                     |  —  |   🟡 🔴 🟣 💠  |
| [`prefer-type-fest-unknown-record`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-unknown-record)               |  —  | 🟢 🟡 🔴 🟣 💠 |
| [`prefer-type-fest-unknown-set`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-unknown-set)                     |  —  |   🟡 🔴 🟣 💠  |
| [`prefer-type-fest-unwrap-tagged`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-unwrap-tagged)                 |  —  |   🟡 🔴 🟣 💠  |
| [`prefer-type-fest-value-of`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-value-of)                           |  —  |   🟡 🔴 🟣 💠  |
| [`prefer-type-fest-writable`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-writable)                           |  —  |   🟡 🔴 🟣 💠  |
| [`prefer-type-fest-writable-deep`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-writable-deep)                 |  —  |   🟡 🔴 🟣 💠  |
