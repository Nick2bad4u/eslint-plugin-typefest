---
title: Overview
description: README-style overview for eslint-plugin-typefest.
---

# eslint-plugin-typefest

ESLint plugin for teams that want consistent TypeScript-first conventions based on:

- [`type-fest`](https://github.com/sindresorhus/type-fest)
- [`ts-extras`](https://github.com/sindresorhus/ts-extras)

The plugin ships focused rule sets for modern Flat Config usage, with parser setup included in each preset.

## Installation

```bash
npm install --save-dev eslint-plugin-typefest typescript
```

> `@typescript-eslint/parser` is loaded automatically by plugin presets.

## Quick start (Flat Config)

```ts
import typefest from "eslint-plugin-typefest";

export default [typefest.configs.recommended];
```

That is enough for TypeScript files (`**/*.{ts,tsx,mts,cts}`).

## Presets

| Preset                                         |
| ---------------------------------------------- |
| 🟢 `typefest.configs.minimal`                  |
| 🟡 `typefest.configs.recommended`              |
| 🔴 `typefest.configs.strict`                   |
| 🟣 `typefest.configs.all`                      |
| 💠 `typefest.configs["type-fest/types"]`       |
| ✴️ `typefest.configs["ts-extras/type-guards"]` |

## Next steps

- Open **Getting Started** in this sidebar.
- Browse **Presets** for preset-by-preset guidance.
- Use **Rules** to review every rule with examples.
