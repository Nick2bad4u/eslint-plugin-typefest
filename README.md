# eslint-plugin-typefest

ESLint plugin focused on encouraging consistent usage of:

- [`type-fest`](https://github.com/sindresorhus/type-fest)
- [`ts-extras`](https://github.com/sindresorhus/ts-extras)

## Install

```bash
npm install --save-dev eslint-plugin-typefest
```

## Usage (flat config)

```js
import typefest from "eslint-plugin-typefest";

export default [
    typefest.configs.recommended,
];
```

### TypeScript parser setup

These rules target TypeScript syntax, so configure
`@typescript-eslint/parser` for TS files:

```js
import tsParser from "@typescript-eslint/parser";
import typefest from "eslint-plugin-typefest";

export default [
    {
        files: ["**/*.{ts,tsx,mts,cts}"],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
            },
        },
    },
    typefest.configs.recommended,
];
```

To enable every rule:

```js
import typefest from "eslint-plugin-typefest";

export default [
    typefest.configs.all,
];
```

## Rules

- `typefest/prefer-type-fest-json-value`
- `typefest/prefer-type-fest-promisable`
- `typefest/prefer-type-fest-tagged-brands`
- `typefest/prefer-type-fest-unknown-record`
- `typefest/prefer-type-fest-value-of`
- `typefest/prefer-ts-extras-array-at`
- `typefest/prefer-ts-extras-array-find`
- `typefest/prefer-ts-extras-array-find-last`
- `typefest/prefer-ts-extras-array-find-last-index`
- `typefest/prefer-ts-extras-array-includes`
- `typefest/prefer-ts-extras-array-join`
- `typefest/prefer-ts-extras-is-defined-filter`
- `typefest/prefer-ts-extras-is-present-filter`
- `typefest/prefer-ts-extras-key-in`
- `typefest/prefer-ts-extras-object-entries`
- `typefest/prefer-ts-extras-object-from-entries`
- `typefest/prefer-ts-extras-object-has-own`
- `typefest/prefer-ts-extras-object-keys`
- `typefest/prefer-ts-extras-object-values`
- `typefest/prefer-ts-extras-set-has`
- `typefest/prefer-ts-extras-string-split`

Per-rule docs live in [`docs/rules`](./docs/rules).
