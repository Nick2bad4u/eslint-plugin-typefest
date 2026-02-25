# prefer-type-fest-set-non-nullable

Require TypeFest `SetNonNullable<T, Keys>` over imported aliases like
`NonNullableBy`.

## What this rule reports

- Type references that resolve to imported `NonNullableBy` aliases.

## Why this rule exists

`SetNonNullable` is the canonical TypeFest utility for making selected keys
non-nullable. Standardizing on canonical TypeFest naming keeps utility usage
predictable in public TypeScript codebases.

## ❌ Incorrect

```ts
import type { NonNullableBy } from "type-aliases";

type PersistedUser = NonNullableBy<User, "id">;
```

## ✅ Correct

```ts
import type { SetNonNullable } from "type-fest";

type PersistedUser = SetNonNullable<User, "id">;
```

## Behavior and migration notes

- `SetNonNullable<T, Keys>` enforces non-nullability on selected keys while preserving the rest of the shape.
- This rule targets imported alias names that duplicate the same semantics (`NonNullableBy`).
- Use this utility for persisted/entity states where selected fields must be present and non-null after validation.

## Additional examples

### ❌ Incorrect (additional scenario)

```ts
import type { NonNullableBy } from "type-aliases";

type Persisted = NonNullableBy<User, "id">;
```

### ✅ Correct (additional scenario)

```ts
import type { SetNonNullable } from "type-fest";

type Persisted = SetNonNullable<User, "id">;
```

### ✅ Correct (team-scale usage)

```ts
type SafeOrder = SetNonNullable<Order, "orderId" | "createdAt">;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-set-non-nullable": "error",
        },
    },
];
```

## When not to use it

Disable this rule if existing exported aliases must remain stable.

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
