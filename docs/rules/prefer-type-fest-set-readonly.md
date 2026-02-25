# prefer-type-fest-set-readonly

Require TypeFest `SetReadonly<T, Keys>` over imported aliases like
`ReadonlyBy`.

## What this rule reports

- Type references that resolve to imported `ReadonlyBy` aliases.

## Why this rule exists

`SetReadonly` is the canonical TypeFest utility for making selected keys
readonly. Canonical naming improves discoverability and consistency across
projects.

## ❌ Incorrect

```ts
import type { ReadonlyBy } from "type-aliases";

type ImmutableUser = ReadonlyBy<User, "id">;
```

## ✅ Correct

```ts
import type { SetReadonly } from "type-fest";

type ImmutableUser = SetReadonly<User, "id">;
```

## Behavior and migration notes

- `SetReadonly<T, Keys>` applies readonly modifiers to selected keys only.
- This rule targets imported aliases with equivalent semantics (`ReadonlyBy`).
- Use it for immutable identity fields while keeping the rest of a shape mutable.

## Additional examples

### ❌ Incorrect (additional scenario)

```ts
import type { ReadonlyBy } from "type-aliases";

type Frozen = ReadonlyBy<User, "id">;
```

### ✅ Correct (additional scenario)

```ts
import type { SetReadonly } from "type-fest";

type Frozen = SetReadonly<User, "id">;
```

### ✅ Correct (team-scale usage)

```ts
type ImmutableAudit = SetReadonly<AuditEntry, "timestamp" | "actor">;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-set-readonly": "error",
        },
    },
];
```

## When not to use it

Disable this rule if existing exported alias names must be preserved.

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
