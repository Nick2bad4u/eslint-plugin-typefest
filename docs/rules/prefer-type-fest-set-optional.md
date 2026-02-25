# prefer-type-fest-set-optional

Require TypeFest `SetOptional<T, Keys>` over imported aliases like `PartialBy`.

## What this rule reports

- Type references that resolve to imported `PartialBy` aliases.

## Why this rule exists

`SetOptional` is the canonical TypeFest utility for making selected keys optional. Standardizing on it improves discoverability and keeps utility naming consistent across projects.

## ❌ Incorrect

```ts
import type { PartialBy } from "type-aliases";

type PartialUser = PartialBy<User, "email">;
```

## ✅ Correct

```ts
import type { SetOptional } from "type-fest";

type PartialUser = SetOptional<User, "email">;
```

## Behavior and migration notes

- `SetOptional<T, Keys>` marks a selected subset of keys optional while preserving all other key modifiers.
- This rule targets imported alias names that represent the same semantics (`PartialBy`).
- Use this utility for draft/update shapes where only specific fields become optional.

## Additional examples

### ❌ Incorrect (additional scenario)

```ts
import type { PartialBy } from "type-aliases";

type Draft = PartialBy<User, "email">;
```

### ✅ Correct (additional scenario)

```ts
import type { SetOptional } from "type-fest";

type Draft = SetOptional<User, "email">;
```

### ✅ Correct (team-scale usage)

```ts
type PartialAddress = SetOptional<Address, "line2">;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-set-optional": "error",
        },
    },
];
```

## When not to use it

Disable this rule if external contracts require preserving existing aliases.

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
