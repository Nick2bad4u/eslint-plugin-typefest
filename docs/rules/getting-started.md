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

`recommended` already enables `languageOptions.parserOptions.projectService`
because it includes typed rules.

## Alternative: manual scoped setup

If you prefer to apply plugin rules inside your own file-scoped config object, spread the preset rules manually.

```ts
import tsParser from "@typescript-eslint/parser";
import typefest from "eslint-plugin-typefest";

export default [
    {
        files: ["**/*.{ts,tsx,mts,cts}"],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: "latest",
                projectService: true,
                sourceType: "module",
            },
        },
        plugins: {
            typefest,
        },
        rules: {
            ...typefest.configs.recommended.rules,
        },
    },
];
```

Use this pattern when you only extend rules and want full control over parser setup per scope.

## Recommended rollout

1. Start with `recommended` (or `minimal` if you want low initial noise).
2. Fix violations in small batches.
3. Move to `strict` once your baseline is stable.
4. Use `all` only when you explicitly want every rule, including experimental rules.

## Need a subset instead of a full preset?

- 💠 `typefest.configs["type-fest/types"]`
- ✴️ `typefest.configs["ts-extras/type-guards"]`

See the **Presets** section in this sidebar for details and examples.
