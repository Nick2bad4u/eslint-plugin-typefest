# prefer-type-fest-required-deep

Require TypeFest `RequiredDeep` over `DeepRequired` aliases.

## Targeted pattern scope

This rule reports `DeepRequired<T>` aliases and prefers `RequiredDeep<T>` for recursively required object shapes.

### What it checks

- Type references named `DeepRequired`.

### Detection boundaries

- ✅ Reports direct `DeepRequired<T>` references.
- ❌ Does not auto-fix where legacy aliases treat nullable leaves differently.

## Why this rule exists

`RequiredDeep<T>` is the canonical TypeFest utility for recursively requiring nested properties.

Using one utility name clarifies strict configuration and post-validation object contracts.

## ❌ Incorrect

```ts
type StrictConfig = DeepRequired<AppConfig>;
```

## ✅ Correct

```ts
import type { RequiredDeep } from "type-fest";

type StrictConfig = RequiredDeep<AppConfig>;
```

## Behavior and migration notes

- `RequiredDeep<T>` recursively removes optional modifiers from nested properties.
- Re-check generated API types if optionality was previously preserved in certain branches.
- Combine with validation/parsing phases before exposing strict internal types.

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
