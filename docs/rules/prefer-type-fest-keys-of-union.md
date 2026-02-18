# prefer-type-fest-keys-of-union

Require TypeFest `KeysOfUnion<T>` over imported aliases like `AllKeys`.

## Rule details

This rule aligns your type-level code with canonical `type-fest` utility names.

Using the canonical utility improves discoverability, reduces alias churn (`Mutable`, `PartialBy`, `AllKeys`, and similar), and keeps project types consistent with the `type-fest` API docs.
## What it checks

- Type references that resolve to imported `AllKeys` aliases.

## Why

`KeysOfUnion` is the canonical TypeFest utility for extracting the full key union across object unions. Using canonical utility names improves readability and consistency.

## ❌ Incorrect

```ts
import type { AllKeys } from "utility-types";

type Keys = AllKeys<Foo | Bar>;
```

## ✅ Correct

```ts
import type { KeysOfUnion } from "type-fest";

type Keys = KeysOfUnion<Foo | Bar>;
```

## Upstream terminology and benefits

`type-fest` describes itself as **"A collection of essential TypeScript types"**.

`type-fest` utilities are compile-time only (nothing is emitted into runtime JavaScript), which makes them ideal for expressive, maintainable type models.

For this rule, the canonical utility is **`KeysOfUnion`**: `KeysOfUnion` creates a union of all keys from a given type, including keys exclusive to specific union members.

Standardizing on canonical names lowers cognitive overhead and makes refactors and onboarding easier.

## Additional examples

### ❌ Incorrect (additional scenario)

```ts
// Non-canonical pattern repeated inline across modules.
import type { AllKeys } from "utility-types";

type Keys = AllKeys<A | B>;
```

### ✅ Correct (additional scenario)

```ts
// Use the canonical type-fest utility for consistent intent and typing.
import type { KeysOfUnion } from "type-fest";

type Keys = KeysOfUnion<A | B>;
```

### ✅ Correct (team-scale usage)

```ts
// Repeat the same canonical pattern across modules to keep APIs predictable.
type EventKeys = KeysOfUnion<CreateEvent | DeleteEvent>;
```

## Why this helps in real projects

- **Shared type vocabulary across packages:** canonical `type-fest` names map directly to upstream docs and ecosystem examples.
- **Safer API evolution:** utility names encode intent in signatures, which lowers ambiguity during refactors.
- **No runtime overhead:** these are compile-time type utilities and do not add JavaScript output.

## Adoption tips

1. Replace non-canonical aliases with the canonical `type-fest` utility shown in this doc.
2. Update shared type libraries first so downstream packages inherit consistent type names.
3. Prefer direct canonical imports and avoid introducing compatibility aliases.
4. Use CI linting to prevent new non-canonical aliases from being reintroduced.

### Rollout strategy

- Roll out by domain module (API types, persistence types, UI view models) to reduce review noise.
- Validate generated declaration output (`.d.ts`) if your package exports public types.
- Remove compatibility aliases once all consumers use canonical names.

## Rule behavior and fixes

- This rule reports non-canonical usage patterns and points you to the canonical helper/type.
- Fix availability depends on the exact pattern matched by the rule implementation.
- When a safe auto-fix is available, ESLint can apply it directly. Otherwise, the rule provides a deterministic manual replacement pattern in the examples above.
- For large rollouts, run ESLint with fixes enabled and then review the diff for edge cases.

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-keys-of-union": "error",
        },
    },
];
```

For broader adoption, you can also start from `typefest.configs["type-fest/types"]`
and then override this rule as needed.

## Frequently asked questions

### Why replace working aliases with canonical type-fest names?

Canonical `type-fest` naming reduces type alias drift and makes intent discoverable for contributors who already know the upstream utility names.

### Does this affect runtime JavaScript?

No. `type-fest` utilities are compile-time only type constructs, so this rule improves type clarity without changing emitted runtime code.
## When not to use it

You may disable this rule if your codebase intentionally standardizes on a different utility-type library, or if you are preserving external/public type names for compatibility with another package.

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

