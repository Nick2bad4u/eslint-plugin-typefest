# prefer-type-fest-readonly-deep

Require TypeFest `ReadonlyDeep` over `DeepReadonly` aliases.

## Targeted pattern scope

This rule reports `DeepReadonly<T>` aliases and prefers `ReadonlyDeep<T>` for recursive immutability contracts.

### What it checks

- Type references named `DeepReadonly`.

### Detection boundaries

- ✅ Reports direct `DeepReadonly<T>` type references.
- ❌ Does not auto-fix when legacy helper semantics differ for containers.

## Why this rule exists

`ReadonlyDeep<T>` is TypeFest's canonical deep immutability utility.

Canonical naming prevents mixed deep-readonly conventions in shared contract packages.

## ❌ Incorrect

```ts
type Config = DeepReadonly<AppConfig>;
```

## ✅ Correct

```ts
import type { ReadonlyDeep } from "type-fest";

type Config = ReadonlyDeep<AppConfig>;
```

## Behavior and migration notes

- `ReadonlyDeep<T>` recursively applies readonly semantics to nested structures.
- Verify behavior for maps/sets/tuples if your prior alias had custom handling.
- Prefer applying deep readonly at API boundaries where mutation should be prevented.

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

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
