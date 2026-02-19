# prefer-type-fest-partial-deep

Require TypeFest `PartialDeep` over `DeepPartial` aliases.

## Rule details

This rule standardizes deep-partial helper usage on the canonical TypeFest utility name.

### What it checks

- Type references named `DeepPartial`.

## ❌ Incorrect

```ts
type Patch = DeepPartial<AppConfig>;
```

## ✅ Correct

```ts
import type { PartialDeep } from "type-fest";

type Patch = PartialDeep<AppConfig>;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-partial-deep": "error",
        },
    },
];
```

## When not to use it

Disable this rule if your codebase intentionally standardizes `DeepPartial` naming instead of TypeFest.

## Further reading

- [TypeFest README](https://github.com/sindresorhus/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
