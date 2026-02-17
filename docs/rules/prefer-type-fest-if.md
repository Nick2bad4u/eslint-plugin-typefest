# prefer-type-fest-if

Require TypeFest `If` + `Is*` utilities over deprecated aliases like `IfAny`,
`IfNever`, `IfUnknown`, `IfNull`, and `IfEmptyObject`.

## Rule details

This rule standardizes deprecated `If*` aliases to the canonical `If<Is*>`
pattern from `type-fest`.

It is intentionally strict about naming consistency and intentionally conservative
about fixing. Rewriting `IfAny<T, A, B>` into `If<IsAny<T>, A, B>` is a
structural transform, not a safe one-token rename.

## What it checks

- Imported type aliases used as identifier type references:
  - `IfAny`
  - `IfNever`
  - `IfUnknown`
  - `IfNull`
  - `IfEmptyObject`

### Detection boundaries

- ✅ Reports `import type { IfAny } ...` followed by `IfAny<...>` usage.
- ✅ Reports locally renamed imports (`import type { IfAny as LegacyIfAny } ...`).
- ❌ Does not report namespace-qualified references like `LegacyTypes.IfAny<...>` (the matcher targets identifier references).
- ❌ Does not auto-fix because migration requires rebuilding type arguments.

## Why

These aliases are deprecated in TypeFest. The canonical pattern is to use
`If<...>` with the corresponding `Is*` utility (for example, `If<IsAny<T>, ...>`).

In practice, teams that keep old aliases around end up with mixed style across
packages (`IfAny`, `IfUnknown`, custom wrappers). This rule prevents that drift.

## ❌ Incorrect

```ts
import type { IfAny } from "type-fest";

type Result = IfAny<T, "any", "not-any">;
```

## ✅ Correct

```ts
import type { If, IsAny } from "type-fest";

type Result = If<IsAny<T>, "any", "not-any">;
```

## Upstream terminology and benefits

`type-fest` describes itself as **"A collection of essential TypeScript types"**.

`type-fest` utilities are compile-time only (nothing is emitted into runtime JavaScript), which makes them ideal for expressive, maintainable type models.

For this rule, the canonical utility is **`If`**: `If` is an if-else-like type that resolves depending on whether a boolean type is true or false.

Standardizing on canonical names lowers cognitive overhead and makes refactors and onboarding easier.

## Additional examples

### ❌ Incorrect (additional scenario)

```ts
import type { IfUnknown as LegacyIfUnknown } from "legacy-type-utils";

type ParseMode<T> = LegacyIfUnknown<T, "strict", "lenient">;
```

### ✅ Correct (additional scenario)

```ts
import type { If, IsUnknown } from "type-fest";

type ParseMode<T> = If<IsUnknown<T>, "strict", "lenient">;
```

### ✅ Correct (team-scale usage)

```ts
import type { If, IsNull } from "type-fest";

type NullLabel<T> = If<IsNull<T>, "nullable", "non-nullable">;
```

## Why this helps in real projects

- **Shared type vocabulary across packages:** canonical `type-fest` names map directly to upstream docs and ecosystem examples.
- **Safer API evolution:** utility names encode intent in signatures, which lowers ambiguity during refactors.
- **No runtime overhead:** these are compile-time type utilities and do not add JavaScript output.

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

- Reports deprecated imported aliases when they appear in type references.
- Does not provide autofix or suggestions.
- Recommended migration pattern per alias:
  - `IfAny<T, A, B>` → `If<IsAny<T>, A, B>`
  - `IfNever<T, A, B>` → `If<IsNever<T>, A, B>`
  - `IfUnknown<T, A, B>` → `If<IsUnknown<T>, A, B>`
  - `IfNull<T, A, B>` → `If<IsNull<T>, A, B>`
  - `IfEmptyObject<T, A, B>` → `If<IsEmptyObject<T>, A, B>`

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-if": "error",
        },
    },
];
```

For broader adoption, you can also start from `typefest.configs["flat/type-fest"]`
and then override this rule as needed.

## Frequently asked questions

### Why replace working aliases with canonical type-fest names?

Because this is a long-term maintenance choice, not a short-term syntax choice.
Canonical names map directly to upstream docs, reduce cognitive branching during
review, and make cross-repo refactors less fragile.

### Does this affect runtime JavaScript?

No. `type-fest` utilities are compile-time only type constructs, so this rule improves type clarity without changing emitted runtime code.

## When not to use it

You may disable this rule if your codebase intentionally standardizes on a different utility-type library, or if you are preserving external/public type names for compatibility with another package.

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
