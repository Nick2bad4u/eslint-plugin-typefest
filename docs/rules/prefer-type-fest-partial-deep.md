# prefer-type-fest-partial-deep

Require TypeFest `PartialDeep` over `DeepPartial` aliases.

## Targeted pattern scope

This rule reports `DeepPartial<T>` aliases and prefers `PartialDeep<T>` for recursive optional patch types.

### What it checks

- Type references named `DeepPartial`.

### Detection boundaries

- ✅ Reports direct `DeepPartial<T>` type references.
- ❌ Does not auto-fix where project-local aliases have non-TypeFest semantics.

## Why this rule exists

`PartialDeep<T>` is the canonical TypeFest utility for recursive optionality.

Using a single name for deep patch semantics makes update/persistence DTOs easier to audit.

## ❌ Incorrect

```ts
type Patch = DeepPartial<AppConfig>;
```

## ✅ Correct

```ts
import type { PartialDeep } from "type-fest";

type Patch = PartialDeep<AppConfig>;
```

## Behavior and migration notes

- `PartialDeep<T>` recursively marks nested properties optional.
- Validate parity if your legacy alias excluded arrays, maps, or sets.
- Prefer narrowing the patch surface with `Pick`/`Except` before applying deep optionality.

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
