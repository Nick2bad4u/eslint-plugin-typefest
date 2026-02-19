# prefer-type-fest-writable-deep

Require TypeFest `WritableDeep` over `DeepMutable` and `MutableDeep` aliases.

## Rule details

This rule standardizes deep-mutable helper usage on the canonical TypeFest utility name.

### What it checks

- Type references named `DeepMutable`.
- Type references named `MutableDeep`.

## ❌ Incorrect

```ts
type MutableConfigA = DeepMutable<AppConfig>;
type MutableConfigB = MutableDeep<AppConfig>;
```

## ✅ Correct

```ts
import type { WritableDeep } from "type-fest";

type MutableConfig = WritableDeep<AppConfig>;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-writable-deep": "error",
        },
    },
];
```

## When not to use it

Disable this rule if your codebase intentionally standardizes deep-mutable aliases over TypeFest naming.

## Further reading

- [TypeFest README](https://github.com/sindresorhus/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
