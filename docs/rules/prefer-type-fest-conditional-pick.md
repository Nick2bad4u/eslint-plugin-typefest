# prefer-type-fest-conditional-pick

Require TypeFest `ConditionalPick<T, Condition>` over imported aliases like `PickByTypes`.

## Targeted pattern scope

This rule targets imported alias names that mirror TypeFest conditional property selection semantics.

## What it checks

- Type references that resolve to imported `PickByTypes` aliases.

## Why

`ConditionalPick` is the canonical TypeFest utility for selecting fields by value type. Standardizing on TypeFest naming improves discoverability and improves consistency.

## ❌ Incorrect

```ts
import type { PickByTypes } from "type-aliases";

type StringProps = PickByTypes<User, string>;
```

## ✅ Correct

```ts
import type { ConditionalPick } from "type-fest";

type StringProps = ConditionalPick<User, string>;
```

## Behavior and migration notes

- `ConditionalPick<T, Condition>` selects keys whose value types extend `Condition`.
- This rule targets alias names with equivalent semantics (`PickByTypes`).
- Keep aliases only when they intentionally add behavior beyond simple conditional key filtering.

## Additional examples

### ❌ Incorrect (additional scenario)

```ts
import type { PickByTypes } from "type-aliases";

type StringFields = PickByTypes<User, string>;
```

### ✅ Correct (additional scenario)

```ts
import type { ConditionalPick } from "type-fest";

type StringFields = ConditionalPick<User, string>;
```

### ✅ Correct (team-scale usage)

```ts
type DateFields = ConditionalPick<User, Date>;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-conditional-pick": "error",
        },
    },
];
```

## When not to use it

Disable this rule if compatibility requirements force existing alias names.

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
