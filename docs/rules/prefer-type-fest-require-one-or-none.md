# prefer-type-fest-require-one-or-none

Require TypeFest `RequireOneOrNone<T, Keys>` over imported aliases like `AtMostOne`.

## Targeted pattern scope

This rule reports imported `AtMostOne` aliases and prefers `RequireOneOrNone<T, Keys>` for zero-or-one selector constraints.

Use this utility when a payload may omit all optional selectors, but must not
provide two selectors at the same time.

## What it checks

- Type references that resolve to imported `AtMostOne` aliases.

### Detection boundaries

- ✅ Reports imported aliases with direct named imports.
- ❌ Does not report namespace-qualified alias usage.
- ❌ Does not auto-fix.

## Why

`RequireOneOrNone` is the canonical TypeFest utility for expressing “zero or exactly one” optional key constraints. Canonical naming keeps type utility usage predictable in public codebases.

This pattern appears in query/filter payloads where no selector is valid but
multiple selectors conflict.

## ❌ Incorrect

```ts
import type { AtMostOne } from "type-aliases";

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

## Behavior and migration notes

- `RequireOneOrNone<T, Keys>` models selectors where zero is valid but more than one is invalid.
- This rule targets alias names with equivalent semantics (`AtMostOne`).
- Keep the key subset focused on mutually exclusive selectors to maintain readable contract intent.

## Additional examples

### ❌ Incorrect (additional scenario)

```ts
import type { AtMostOne } from "custom-type-utils";

type MonitorLookup = AtMostOne<
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

## When not to use it

Disable this rule if existing alias names are part of a published API contract.

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
