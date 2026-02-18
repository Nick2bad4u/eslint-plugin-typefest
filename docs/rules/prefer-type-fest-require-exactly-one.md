# prefer-type-fest-require-exactly-one

Require TypeFest `RequireExactlyOne<T, Keys>` over imported aliases like `OneOf` or `RequireOnlyOne`.

## Rule details

This rule standardizes XOR-style object constraints to
`RequireExactlyOne<T, Keys>` from `type-fest`.

Use this when callers must choose one mode, not multiple modes (for example,
`id` _or_ `slug`, `apiKey` _or_ `token`).

## What it checks

- Type references that resolve to imported `OneOf` aliases.
- Type references that resolve to imported `RequireOnlyOne` aliases.

### Detection boundaries

- ✅ Reports imported aliases, including renamed imports.
- ❌ Does not report namespace-qualified alias usage.
- ❌ Does not auto-fix.

## Why

`RequireExactlyOne` is the canonical TypeFest utility for enforcing exactly one active key among a set. Using the canonical name reduces semantic drift between utility libraries.

This is one of the most error-prone constraints in hand-written unions. Using a
known utility keeps intent obvious and consistent.

## ❌ Incorrect

```ts
import type { OneOf } from "utility-types";

type Auth = OneOf<{
    token?: string;
    apiKey?: string;
}>;
```

## ✅ Correct

```ts
import type { RequireExactlyOne } from "type-fest";

type Auth = RequireExactlyOne<{
    token?: string;
    apiKey?: string;
}>;
```

## Upstream terminology and benefits

`type-fest` describes itself as **"A collection of essential TypeScript types"**.

`type-fest` utilities are compile-time only (nothing is emitted into runtime JavaScript), which makes them ideal for expressive, maintainable type models.

For this rule, the canonical utility is **`RequireExactlyOne`**: `RequireExactlyOne` creates a type that requires exactly one of the given keys and disallows more.

Standardizing on canonical names lowers cognitive overhead and makes refactors and onboarding easier.

## Additional examples

### ❌ Incorrect (additional scenario)

```ts
import type { RequireOnlyOne as AliasRequireOnlyOne } from "custom-type-utils";

type LookupInput = AliasRequireOnlyOne<
    {
        id?: string;
        slug?: string;
        externalRef?: string;
    },
    "id" | "slug" | "externalRef"
>;
```

### ✅ Correct (additional scenario)

```ts
import type { RequireExactlyOne } from "type-fest";

type LookupInput = RequireExactlyOne<
    {
        id?: string;
        slug?: string;
        externalRef?: string;
    },
    "id" | "slug" | "externalRef"
>;
```

### ✅ Correct (team-scale usage)

```ts
type AuthInput = RequireExactlyOne<
    { token?: string; apiKey?: string; oauthCode?: string },
    "token" | "apiKey" | "oauthCode"
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

- Reports imported `OneOf` and `RequireOnlyOne` alias references.
- Does not provide autofix or suggestions.
- Typical replacement:
  - `OneOf<T, K>` → `RequireExactlyOne<T, K>`
  - `RequireOnlyOne<T, K>` → `RequireExactlyOne<T, K>`

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-require-exactly-one": "error",
        },
    },
];
```

For broader adoption, you can also start from `typefest.configs["type-fest/types"]`
and then override this rule as needed.

## Frequently asked questions

### Why replace working aliases with canonical type-fest names?

Because XOR constraints are easy to misread. Canonical naming gives reviewers a
single, well-known mental model.

### Does this affect runtime JavaScript?

No. `type-fest` utilities are compile-time only type constructs, so this rule improves type clarity without changing emitted runtime code.

## When not to use it

You may disable this rule if your codebase intentionally standardizes on a different utility-type library, or if you are preserving external/public type names for compatibility with another package.

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
