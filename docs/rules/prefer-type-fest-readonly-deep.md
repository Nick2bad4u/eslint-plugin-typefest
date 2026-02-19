# prefer-type-fest-readonly-deep

Require TypeFest `ReadonlyDeep` over `DeepReadonly` aliases.

## Rule details

This rule standardizes deep-readonly helper usage on the canonical TypeFest utility name.

### What it checks

- Type references named `DeepReadonly`.

## ❌ Incorrect

```ts
type Config = DeepReadonly<AppConfig>;
```

## ✅ Correct

```ts
import type { ReadonlyDeep } from "type-fest";

type Config = ReadonlyDeep<AppConfig>;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-readonly-deep": "error",
        },
    },
];
```

## When not to use it

Disable this rule if your codebase intentionally standardizes `DeepReadonly` naming instead of TypeFest.

## Further reading

- [TypeFest README](https://github.com/sindresorhus/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
