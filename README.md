# eslint-plugin-typefest

ESLint plugin that encourages consistent, typed helper usage from:

- [`type-fest`](https://github.com/sindresorhus/type-fest)
- [`ts-extras`](https://github.com/sindresorhus/ts-extras)

The plugin focuses on rules that are practical for public TypeScript codebases,
including:

- Type alias consistency (`Primitive`, `JsonValue`, `JsonObject`, `JsonArray`,
  `Arrayable`, `Promisable`, etc.)
- Typed helper adoption (`arrayFirst`, `arrayLast`, `objectHasOwn`,
  `objectHasIn`, `isFinite`, `isInfinite`, `isEmpty`, `setHas`, etc.)
- Assertion helper adoption (`assertDefined`, `assertPresent`, `assertError`)

## Installation

```sh
npm install --save-dev eslint-plugin-typefest @typescript-eslint/parser
```

## Usage (flat config)

These rules target TypeScript syntax, so configure
`@typescript-eslint/parser` for TypeScript files.

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

## Preset configs

The plugin ships both unscoped and flat-prefixed presets.

| Preset                         | Purpose                                        |
| ------------------------------ | ---------------------------------------------- |
| `typefest.configs.minimal`     | Core TypeFest alias preferences only           |
| `typefest.configs.safe`        | `minimal` + safe ts-extras helper replacements |
| `typefest.configs.recommended` | `safe` + assertion helper preferences          |
| `typefest.configs.strict`      | Current strict superset of recommended rules   |
| `typefest.configs.all`         | Every rule exported by this plugin             |

Clearer semantic aliases are also available:

| Alias                        | Maps to                        |
| ---------------------------- | ------------------------------ |
| `typefest.configs.core`      | `typefest.configs.minimal`     |
| `typefest.configs.runtime`   | `typefest.configs.safe`        |
| `typefest.configs.assertive` | `typefest.configs.recommended` |
| `typefest.configs.complete`  | `typefest.configs.all`         |

Flat-prefixed aliases are also available:

- `typefest.configs["flat/core"]`
- `typefest.configs["flat/runtime"]`
- `typefest.configs["flat/assertive"]`
- `typefest.configs["flat/complete"]`
- `typefest.configs["flat/minimal"]`
- `typefest.configs["flat/safe"]`
- `typefest.configs["flat/recommended"]`
- `typefest.configs["flat/strict"]`
- `typefest.configs["flat/all"]`

`typefest.configs.default` and `typefest.configs["flat/default"]` currently
map to the `safe` tier.

## Rules

All rule documentation lives in [`docs/rules`](./docs/rules).

Each rule is enabled as:

```text
typefest/<rule-name>
```
