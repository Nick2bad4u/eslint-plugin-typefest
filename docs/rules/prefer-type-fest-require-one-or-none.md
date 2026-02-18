# prefer-type-fest-require-one-or-none

Require TypeFest `RequireOneOrNone<T, Keys>` over imported aliases like `AtMostOne`.

## Rule details

This rule standardizes “zero-or-one key” constraints to
`RequireOneOrNone<T, Keys>` from `type-fest`.

Use this utility when a payload may omit all optional selectors, but must not
provide two selectors at the same time.

## What it checks

- Type references that resolve to imported `AtMostOne` aliases.

### Detection boundaries

- ✅ Reports imported aliases, including renamed imports.
- ❌ Does not report namespace-qualified alias usage.
- ❌ Does not auto-fix.

## Why

`RequireOneOrNone` is the canonical TypeFest utility for expressing “zero or exactly one” optional key constraints. Canonical naming keeps type utility usage predictable in public codebases.

This pattern appears in query/filter payloads where no selector is valid but
multiple selectors conflict.

## ❌ Incorrect

```ts
import type { AtMostOne } from "utility-types";

type OptionalAuth = AtMostOne<{
    token?: string;
    apiKey?: string;
}>;
```

## ✅ Correct

```ts
import type { RequireOneOrNone } from "type-fest";

type OptionalAuth = RequireOneOrNone<{
    token?: string;
    apiKey?: string;
}>;
```

## Upstream terminology and benefits

`type-fest` describes itself as **"A collection of essential TypeScript types"**.

`type-fest` utilities are compile-time only (nothing is emitted into runtime JavaScript), which makes them ideal for expressive, maintainable type models.

For this rule, the canonical utility is **`RequireOneOrNone`**: `RequireOneOrNone` creates a type that requires exactly one key (or none) from the given key set.

Standardizing on canonical names lowers cognitive overhead and makes refactors and onboarding easier.

## Additional examples

### ❌ Incorrect (additional scenario)

```ts
import type { AtMostOne as AliasAtMostOne } from "custom-type-utils";

type MonitorLookup = AliasAtMostOne<
    {
        monitorId?: string;
        slug?: string;
    },
    "monitorId" | "slug"
>;
```

### ✅ Correct (additional scenario)

```ts
import type { RequireOneOrNone } from "type-fest";

type MonitorLookup = RequireOneOrNone<
    {
        monitorId?: string;
        slug?: string;
    },
    "monitorId" | "slug"
>;
```

### ✅ Correct (team-scale usage)

```ts
type SessionIdentity = RequireOneOrNone<
    { userId?: string; guestId?: string },
    "userId" | "guestId"
>;
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

- Reports imported `AtMostOne` alias references.
- Does not provide autofix or suggestions.
- Typical replacement: `AtMostOne<T, K>` → `RequireOneOrNone<T, K>`.

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-require-one-or-none": "error",
        },
    },
];
```

For broader adoption, you can also start from `typefest.configs["type-fest/types"]`
and then override this rule as needed.

## Frequently asked questions

### Why replace working aliases with canonical type-fest names?

These constraints usually define valid user input states. Canonical naming makes
those states easier to audit and maintain.

### Does this affect runtime JavaScript?

No. `type-fest` utilities are compile-time only type constructs, so this rule improves type clarity without changing emitted runtime code.

## When not to use it

You may disable this rule if your codebase intentionally standardizes on a different utility-type library, or if you are preserving external/public type names for compatibility with another package.

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
