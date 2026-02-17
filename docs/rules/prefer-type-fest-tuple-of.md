# prefer-type-fest-tuple-of

Require `Readonly<TupleOf<Length, Element>>` over imported aliases like
`ReadonlyTuple`.

## Rule details

This rule aligns your type-level code with canonical `type-fest` utility names.

Using the canonical utility improves discoverability, reduces alias churn (`Mutable`, `PartialBy`, `AllKeys`, and similar), and keeps project types consistent with the `type-fest` API docs.
## What it checks

- Type references that resolve to imported `ReadonlyTuple` aliases.

## Why

`ReadonlyTuple` is deprecated in TypeFest. The canonical replacement is
`Readonly<TupleOf<Length, Element>>`, which keeps readonly semantics explicit
while using the supported tuple utility.

## ❌ Incorrect

```ts
import type { ReadonlyTuple } from "type-fest";

type Digits = ReadonlyTuple<number, 4>;
```

## ✅ Correct

```ts
import type { TupleOf } from "type-fest";

type Digits = Readonly<TupleOf<number, 4>>;
```

## Upstream terminology and benefits

`type-fest` describes itself as **"A collection of essential TypeScript types"**.

`type-fest` utilities are compile-time only (nothing is emitted into runtime JavaScript), which makes them ideal for expressive, maintainable type models.

For this rule, the canonical utility is **`TupleOf`**: `TupleOf` creates a tuple type of a specified length and element type.

Standardizing on canonical names lowers cognitive overhead and makes refactors and onboarding easier.

## Additional examples

### ❌ Incorrect (additional scenario)

```ts
// Avoid non-canonical patterns: TupleOf
import type { ReadonlyTuple } from "type-fest";

type IPv4 = ReadonlyTuple<number, 4>;
```

### ✅ Correct (additional scenario)

```ts
// Use the canonical type-fest utility for consistent intent and typing.
import type { TupleOf } from "type-fest";

type IPv4 = Readonly<TupleOf<number, 4>>;
```

### ✅ Correct (team-scale usage)

```ts
// Repeat the same canonical pattern across modules to keep APIs predictable.
type RGB = TupleOf<number, 3>;
```

## Why this helps in real projects

- **Canonical type vocabulary:** standardizing on `type-fest` names reduces alias drift across teams and packages.
- **Cleaner API contracts:** compile-time utility types communicate intent directly in public and internal type signatures.
- **Lower onboarding cost:** new contributors can rely on documented `type-fest` terminology instead of project-specific aliases.

## Adoption and migration tips

1. Replace non-canonical aliases with the canonical `type-fest` utility shown in this doc.
2. Update shared type libraries first so downstream packages inherit consistent type names.
3. Keep old aliases temporarily (if needed) behind deprecated exports while consumers migrate.
4. Use CI linting to prevent new non-canonical aliases from being reintroduced.

### Rollout strategy

- Migrate by domain module (API types, persistence types, UI view models) to reduce review noise.
- Validate generated declaration output (`.d.ts`) if your package exports public types.
- Remove compatibility aliases once all consumers use canonical names.

## Rule behavior and fixes

- This rule reports non-canonical usage patterns and points you to the canonical helper/type.
- Fix availability depends on the exact pattern matched by the rule implementation.
- When a safe auto-fix is available, ESLint can apply it directly. Otherwise, the rule provides a deterministic manual replacement pattern in the examples above.
- For large migrations, run ESLint with fixes enabled and then review the diff for edge cases.

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-tuple-of": "error",
        },
    },
];
```

For broader adoption, you can also start from `typefest.configs["flat/type-fest"]`
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
