---
title: Getting Started
description: Enable eslint-plugin-typefest quickly in Flat Config.
---

# Getting Started

Install the plugin:

```bash
npm install --save-dev eslint-plugin-typefest typescript
```

Enable one preset in your Flat Config:

```ts
import typefest from "eslint-plugin-typefest";

export default [
    typefest.configs.recommended,
];
```

## Recommended rollout

1. Start with `recommended` (or `minimal` if you want low initial noise).
2. Fix violations in small batches.
3. Move to `strict` once your baseline is stable.
4. Use `all` only when you explicitly want every rule, including experimental rules.

## Need a subset instead of a full preset?

- 💠 `typefest.configs["type-fest/types"]`
- ✴️ `typefest.configs["ts-extras/type-guards"]`

See the **Presets** section in this sidebar for details and examples.
