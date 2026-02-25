# prefer-type-fest-require-all-or-none

Require TypeFest `RequireAllOrNone<T, Keys>` over imported aliases like
`AllOrNone` or `AllOrNothing`.

## Targeted pattern scope

This rule reports imported `AllOrNone`/`AllOrNothing` aliases and prefers `RequireAllOrNone<T, Keys>` for atomic key-group constraints.

Use this utility when fields only make sense as a complete set (for example,
`username` + `password`, or `country` + `vatId`).

## What it checks

- Type references that resolve to imported `AllOrNone` aliases.
- Type references that resolve to imported `AllOrNothing` aliases.

### Detection boundaries

- ✅ Reports imported aliases with direct named imports.
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
import type { AllOrNone } from "type-aliases";

type Credentials = AllOrNone<User, "username" | "password">;
```

## ✅ Correct

```ts
import type { RequireAllOrNone } from "type-fest";

type Credentials = RequireAllOrNone<User, "username" | "password">;
```

## Behavior and migration notes

- `RequireAllOrNone<T, Keys>` enforces atomic key groups (all keys present together or all omitted).
- This rule targets alias names that encode the same constraint (`AllOrNone`, `AllOrNothing`).
- Keep key-group definitions explicit and colocated with contract types to avoid drift.

## Additional examples

### ❌ Incorrect (additional scenario)

```ts
import type { AllOrNothing } from "custom-type-utils";

type BillingIdentity = AllOrNothing<OrderInput, "country" | "vatId">;
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

## When not to use it

Disable this rule if existing exported aliases must stay unchanged for compatibility.

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
