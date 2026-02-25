# prefer-type-fest-writable-deep

Require TypeFest `WritableDeep` over `DeepMutable` and `MutableDeep` aliases.

## Targeted pattern scope

This rule reports `DeepMutable<T>`/`MutableDeep<T>` aliases and prefers `WritableDeep<T>` for deep mutability transforms.

### What it checks

- Type references named `DeepMutable`.
- Type references named `MutableDeep`.

### Detection boundaries

- ✅ Reports direct `DeepMutable<T>` and `MutableDeep<T>` references.
- ❌ Does not auto-fix where internal helpers intentionally diverge from `WritableDeep` behavior.

## Why this rule exists

`WritableDeep<T>` is the canonical TypeFest utility for recursively removing readonly constraints.

Standardizing on one helper name reduces confusion when mutability transitions are part of data-processing pipelines.

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

## Behavior and migration notes

- `WritableDeep<T>` recursively removes readonly modifiers from nested members.
- Validate migration behavior for tuple/read-only array branches in critical types.
- Prefer local wrapper aliases if your domain needs a narrower deep-writable contract.

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

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
