# prefer-type-fest-required-deep

Require TypeFest `RequiredDeep` over `DeepRequired` aliases.

## Rule details

This rule standardizes deep-required helper usage on the canonical TypeFest utility name.

### What it checks

- Type references named `DeepRequired`.

## ❌ Incorrect

```ts
type StrictConfig = DeepRequired<AppConfig>;
```

## ✅ Correct

```ts
import type { RequiredDeep } from "type-fest";

type StrictConfig = RequiredDeep<AppConfig>;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-required-deep": "error",
        },
    },
];
```

## When not to use it

Disable this rule if your codebase intentionally standardizes `DeepRequired` naming instead of TypeFest.

## Further reading

- [TypeFest README](https://github.com/sindresorhus/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
