# prefer-type-fest-require-at-least-one

Require TypeFest `RequireAtLeastOne<T, Keys>` over imported aliases like
`AtLeastOne`.

## Rule details

This rule standardizes constraints where at least one optional key must exist to
`RequireAtLeastOne<T, Keys>` from `type-fest`.

It is especially valuable for search DTOs and patch/update payloads where
empty objects should be rejected at compile time.

## What it checks

- Type references that resolve to imported `AtLeastOne` aliases.

### Detection boundaries

- ✅ Reports imported aliases with direct named imports.
- ❌ Does not report namespace-qualified aliases.
- ❌ Does not auto-fix.

## Why

`RequireAtLeastOne` is the canonical TypeFest utility for enforcing at least one
required key among a set of optional candidates. Standardizing on canonical
TypeFest naming keeps public type contracts easier to understand and maintain.

For user-facing APIs, this avoids accepting meaningless payloads like `{}`
where at least one filter field is required.

## ❌ Incorrect

```ts
import type { AtLeastOne } from "type-aliases";

type Update = AtLeastOne<User>;
```

## ✅ Correct

```ts
import type { RequireAtLeastOne } from "type-fest";

type Update = RequireAtLeastOne<User>;
```

## Upstream terminology and benefits

`type-fest` describes itself as **"A collection of essential TypeScript types"**.

`type-fest` utilities are compile-time only (nothing is emitted into runtime JavaScript), which makes them ideal for expressive, maintainable type models.

For this rule, the canonical utility is **`RequireAtLeastOne`**: `RequireAtLeastOne` creates a type that requires at least one of the given keys.

Standardizing on canonical names lowers cognitive overhead and makes refactors and onboarding easier.

## Additional examples

### ❌ Incorrect (additional scenario)

```ts
import type { AtLeastOne } from "custom-type-utils";

type UserSearch = AtLeastOne<
    {
        email?: string;
        id?: string;
        username?: string;
    },
    "email" | "id" | "username"
>;
```

### ✅ Correct (additional scenario)

```ts
import type { RequireAtLeastOne } from "type-fest";

type UserSearch = RequireAtLeastOne<
    {
        email?: string;
        id?: string;
        username?: string;
    },
    "email" | "id" | "username"
>;
```

### ✅ Correct (team-scale usage)

```ts
type ProfilePatch = RequireAtLeastOne<
    { avatarUrl?: string; displayName?: string; bio?: string },
    "avatarUrl" | "displayName" | "bio"
>;
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

- Reports imported `AtLeastOne` alias references.
- Does not provide autofix or suggestions.
- Typical replacement: `AtLeastOne<T, K>` → `RequireAtLeastOne<T, K>`.

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-require-at-least-one": "error",
        },
    },
];
```

For broader adoption, you can also start from `typefest.configs["type-fest/types"]`
and then override this rule as needed.

## Frequently asked questions

### Why replace working aliases with canonical type-fest names?

At-least-one constraints are business critical in API contracts. Canonical names
make those constraints obvious to maintainers and tooling.

### Does this affect runtime JavaScript?

No. `type-fest` utilities are compile-time only type constructs, so this rule improves type clarity without changing emitted runtime code.

## When not to use it

You may disable this rule if your codebase intentionally standardizes on a different utility-type library, or if you are preserving external/public type names for interoperability with another package.

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
