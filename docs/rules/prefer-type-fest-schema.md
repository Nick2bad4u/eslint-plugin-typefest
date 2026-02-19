# prefer-type-fest-schema

Require TypeFest `Schema<ObjectType, ValueType>` over imported aliases like `RecordDeep`.

## Rule details

This rule keeps deep object-shape transforms on the canonical `type-fest`
utility: `Schema<ObjectType, ValueType>`.

It is designed for consistency, not aggressive rewriting. Replacing third-party
aliases such as `RecordDeep` with `Schema` is usually straightforward, but you
should still validate semantics if your old utility had custom behavior.

## What it checks

- Imported `RecordDeep` aliases used as identifier type references.

### Detection boundaries

- ✅ Reports `import type { RecordDeep } ...` + `RecordDeep<...>` usage.
- ❌ Does not report locally renamed imports (`RecordDeep as AliasRecordDeep`).
- ❌ Does not report namespace-qualified usages such as `TypeUtils.RecordDeep<...>`.
- ❌ Does not auto-fix.

## Why

`Schema` is the canonical TypeFest utility for deep value-shape transformation across object types. Standardized naming helps readers recognize intent immediately.

`type-fest` describes itself as **"A collection of essential TypeScript
types"**. Using canonical names means engineers can jump directly between your
code and upstream docs without translation.

## ❌ Incorrect

```ts
import type { RecordDeep } from "type-aliases";

type Flags = RecordDeep<Config, boolean>;
```

## ✅ Correct

```ts
import type { Schema } from "type-fest";

type Flags = Schema<Config, boolean>;
```

## Upstream terminology and benefits

`type-fest` describes itself as **"A collection of essential TypeScript types"**.

`type-fest` utilities are compile-time only (nothing is emitted into runtime JavaScript), which makes them ideal for expressive, maintainable type models.

For this rule, the canonical utility is **`Schema`**: `Schema` creates a deep version of an object type where property values are recursively replaced with a given value type.

Standardizing on canonical names lowers cognitive overhead and makes refactors and onboarding easier.

## Additional examples

### ❌ Incorrect (additional scenario)

```ts
import type { RecordDeep } from "custom-type-utils";

type AuditMask = RecordDeep<UserProfile, "REDACTED">;
```

### ✅ Correct (additional scenario)

```ts
import type { Schema } from "type-fest";

type AuditMask = Schema<UserProfile, "REDACTED">;
```

### ✅ Correct (team-scale usage)

```ts
type FeatureFlags = Schema<EnvironmentConfig, boolean>;
```

## Why this helps in real projects

- **Shared type vocabulary across packages:** canonical `type-fest` names map directly to upstream docs and ecosystem examples.
- **Safer API evolution:** utility names encode intent in signatures, which lowers ambiguity during refactors.
- **No runtime overhead:** these are compile-time type utilities and do not add JavaScript output.

## Adoption tips

1. Replace non-canonical aliases with the canonical `type-fest` utility shown in this doc.
2. Update shared type libraries first so downstream packages inherit consistent type names.
3. Prefer direct canonical imports and avoid introducing alternate aliases.
4. Use CI linting to prevent new non-canonical aliases from being reintroduced.

### Rollout strategy

- Roll out by domain module (API types, persistence types, UI view models) to reduce review noise.
- Validate generated declaration output (`.d.ts`) if your package exports public types.
- Remove alternate aliases once all consumers use canonical names.

## Rule behavior and fixes

- Reports imported `RecordDeep` alias usage in type references.
- Does not provide autofix or suggestions.

Typical replacement is:

```ts
type Before = RecordDeep<Config, string>;
type After = Schema<Config, string>;
```

Re-run type tests after adoption, especially when old aliases came from utility
libraries with slightly different recursive behavior.

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-schema": "error",
        },
    },
];
```

For broader adoption, you can also start from `typefest.configs["type-fest/types"]`
and then override this rule as needed.

## Frequently asked questions

### Why replace working aliases with canonical type-fest names?

Canonical names make deep-transform intent obvious and searchable. That matters
most in large codebases with generated DTO types and shared contracts.

### Does this affect runtime JavaScript?

No. `type-fest` utilities are compile-time only type constructs, so this rule improves type clarity without changing emitted runtime code.

## When not to use it

You may disable this rule if your codebase intentionally standardizes on a different utility-type library, or if you are preserving external/public type names for interoperability with another package.

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
