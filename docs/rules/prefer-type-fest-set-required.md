# prefer-type-fest-set-required

Require TypeFest `SetRequired<T, Keys>` over imported aliases like
`RequiredBy`.

## What this rule reports

- Type references that resolve to imported `RequiredBy` aliases.

## Why this rule exists

`SetRequired` is the canonical TypeFest utility for making selected keys
required. Standardizing on TypeFest naming reduces semantic drift between
utility libraries.

## ❌ Incorrect

```ts
import type { RequiredBy } from "type-aliases";

type CompleteUser = RequiredBy<User, "id">;
```

## ✅ Correct

```ts
import type { SetRequired } from "type-fest";

type CompleteUser = SetRequired<User, "id">;
```

## Behavior and migration notes

- `SetRequired<T, Keys>` forces selected optional keys to be required.
- This rule targets imported aliases with equivalent semantics (`RequiredBy`).
- Use this utility in post-validation and persisted-domain types where selected fields become mandatory.

## Additional examples

### ❌ Incorrect (additional scenario)

```ts
import type { RequiredBy } from "type-aliases";

type Complete = RequiredBy<User, "id">;
```

### ✅ Correct (additional scenario)

```ts
import type { SetRequired } from "type-fest";

type Complete = SetRequired<User, "id">;
```

### ✅ Correct (team-scale usage)

```ts
type Persisted = SetRequired<Order, "id" | "status">;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-set-required": "error",
        },
    },
];
```

## When not to use it

Disable this rule if existing exported alias names are part of a compatibility contract.

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
