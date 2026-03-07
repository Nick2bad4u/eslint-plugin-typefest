---
title: Recommended (type-checked) preset
---

# 🟠 Recommended (type-checked)

Use this when you want the recommended baseline plus rules that require
TypeScript type information.

## Config key

```ts
typefest.configs["recommended-type-checked"]
```

## Flat Config example

```ts
import typefest from "eslint-plugin-typefest";

export default [typefest.configs["recommended-type-checked"]];
```

This preset is type-aware and includes
`languageOptions.parserOptions.projectService: true`.

## What this preset adds on top of `recommended`

| Additional type-aware rule                                                                                                          |
| ----------------------------------------------------------------------------------------------------------------------------------- |
| [`prefer-ts-extras-array-includes`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-array-includes) |
| [`prefer-ts-extras-array-last`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-array-last)         |
| [`prefer-ts-extras-is-empty`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-is-empty)             |
| [`prefer-ts-extras-safe-cast-to`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-safe-cast-to)     |
| [`prefer-ts-extras-set-has`](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-set-has)               |

For the complete rule list, see the [preset matrix](./index.md#rule-matrix).
