# prefer-ts-extras-as-writable

Prefer [`asWritable`](https://github.com/sindresorhus/ts-extras#aswritable) from `ts-extras` over `Writable<...>` type assertions.

## What this rule reports

`Writable<...>`-based type assertions that can be replaced with `asWritable(value)`.

### Matched patterns

- `as` assertions where the asserted type is `Writable<...>` imported from `type-fest`.
- Namespace-qualified assertions such as `TypeFest.Writable<...>` when `TypeFest` comes from `type-fest`.

## Why this rule exists

`asWritable(value)` communicates intent directly and keeps mutation-intent casts aligned with the `ts-extras` helper API.

## ❌ Incorrect

```ts
import type { Writable } from "type-fest";

const writableUser = readonlyUser as Writable<User>;
```

## ✅ Correct

```ts
import { asWritable } from "ts-extras";

const writableUser = asWritable(readonlyUser);
```

## Behavior and migration notes

- `asWritable(value)` preserves runtime behavior while expressing mutability intent through one helper.
- Direct `as Writable<T>` / `as TypeFest.Writable<T>` assertions are reported.
- This rule does not rewrite unrelated type assertions.

## Additional examples

### ❌ Incorrect (additional scenario)

```ts
const mutable = config as Writable<typeof config>;
```

### ✅ Correct (additional scenario)

```ts
const mutable = asWritable(config);
```

### ✅ Correct (team-scale usage)

```ts
const draft = asWritable(readonlyDraft);
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-ts-extras-as-writable": "error",
        },
    },
];
```

## When not to use it

Disable this rule if mutation boundaries are enforced through explicit type assertions by policy.

## Further reading

- [`ts-extras` README](https://github.com/sindresorhus/ts-extras)
- [`ts-extras` package reference](https://www.npmjs.com/package/ts-extras)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
