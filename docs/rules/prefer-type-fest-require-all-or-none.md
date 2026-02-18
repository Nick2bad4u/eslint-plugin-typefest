# prefer-type-fest-require-all-or-none

Require TypeFest `RequireAllOrNone<T, Keys>` over imported aliases like
`AllOrNone` or `AllOrNothing`.

## Rule details

This rule standardizes “atomic key group” constraints to
`RequireAllOrNone<T, Keys>` from `type-fest`.

Use this utility when fields only make sense as a complete set (for example,
`username` + `password`, or `country` + `vatId`).

## What it checks

- Type references that resolve to imported `AllOrNone` aliases.
- Type references that resolve to imported `AllOrNothing` aliases.

### Detection boundaries

- ✅ Reports imported aliases, including renamed imports.
- ❌ Does not report namespace-qualified alias usage.
- ❌ Does not auto-fix.

## Why

`RequireAllOrNone` is the canonical TypeFest utility for expressing atomic key
groups (either every key in the group exists, or none of them do). Canonical
naming reduces semantic drift across utility libraries.

This is one of the easiest places for contract bugs to hide in API request
types. A single canonical utility makes these constraints explicit.

## ❌ Incorrect

```ts
import type { AllOrNone } from "utility-types";

type Credentials = AllOrNone<User, "username" | "password">;
```

## ✅ Correct

```ts
import type { RequireAllOrNone } from "type-fest";

type Credentials = RequireAllOrNone<User, "username" | "password">;
```

## Upstream terminology and benefits

`type-fest` describes itself as **"A collection of essential TypeScript types"**.

`type-fest` utilities are compile-time only (nothing is emitted into runtime JavaScript), which makes them ideal for expressive, maintainable type models.

For this rule, the canonical utility is **`RequireAllOrNone`**: `RequireAllOrNone` creates a type that requires all of the given keys or none of them.

Standardizing on canonical names lowers cognitive overhead and makes refactors and onboarding easier.

## Additional examples

### ❌ Incorrect (additional scenario)

```ts
import type { AllOrNothing as AliasAllOrNothing } from "custom-type-utils";

type BillingIdentity = AliasAllOrNothing<OrderInput, "country" | "vatId">;
```

### ✅ Correct (additional scenario)

```ts
import type { RequireAllOrNone } from "type-fest";

type BillingIdentity = RequireAllOrNone<OrderInput, "country" | "vatId">;
```

### ✅ Correct (team-scale usage)

```ts
type OAuthPair = RequireAllOrNone<AuthInput, "clientId" | "clientSecret">;
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

- Reports imported `AllOrNone` and `AllOrNothing` alias references.
- Does not provide autofix or suggestions.
- Typical replacement:
  - `AllOrNone<T, K>` → `RequireAllOrNone<T, K>`
  - `AllOrNothing<T, K>` → `RequireAllOrNone<T, K>`

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-require-all-or-none": "error",
        },
    },
];
```

For broader adoption, you can also start from `typefest.configs["type-fest/types"]`
and then override this rule as needed.

## Frequently asked questions

### Why replace working aliases with canonical type-fest names?

Because these key-group constraints usually model real business rules. Using
the canonical utility keeps those rules recognizable and less error-prone in
code reviews.

### Does this affect runtime JavaScript?

No. `type-fest` utilities are compile-time only type constructs, so this rule improves type clarity without changing emitted runtime code.

## When not to use it

You may disable this rule if your codebase intentionally standardizes on a different utility-type library, or if you are preserving external/public type names for compatibility with another package.

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

