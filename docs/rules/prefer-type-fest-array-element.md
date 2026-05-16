# prefer-type-fest-array-element

Require TypeFest [`ArrayElement<T>`](https://github.com/sindresorhus/type-fest/blob/main/source/array-element.d.ts) over array and tuple `T[number]` element extraction.

## Targeted pattern scope

This is a type-aware rule. It targets indexed-access type queries whose object type resolves to an array or tuple.

## What this rule reports

- `T[number]` when `T` resolves to an array or tuple type.

The rule intentionally skips `typeof values[number]`. Use a dedicated `ArrayValues` rule for extracting values from constant arrays.

## Why this rule exists

`ArrayElement<T>` is the dedicated TypeFest helper for array and tuple element extraction. Using it makes intent explicit and avoids repeating raw numeric indexed-access syntax in shared type helpers.

## ❌ Incorrect

```ts
type Step = EventSteps[number];
```

## ✅ Correct

```ts
import type { ArrayElement } from "type-fest";

type Step = ArrayElement<EventSteps>;
```

## Behavior and migration notes

- This rule requires type information.
- It only reports `T[number]` when `T` resolves to an array-like type.
- It does not report number-indexed object maps like `Record<number, string>[number]`.
- It leaves `typeof values[number]` alone for `ArrayValues<typeof values>` coverage.

## Additional examples

### ❌ Incorrect — Additional example

```ts
type UserItem = User["items"][number];
```

### ✅ Correct — Additional example

```ts
import type { ArrayElement } from "type-fest";

type UserItem = ArrayElement<User["items"]>;
```

### ✅ Correct — Non-targeted usage

```ts
const statuses = ["queued", "running"] as const;

type Status = typeof statuses[number];
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-array-element": "error",
        },
    },
];
```

## When not to use it

Disable this rule if you prefer native indexed-access syntax for array element queries or if your project does not use type-aware linting.

## Package documentation

TypeFest package documentation:

Source file: [`source/array-element.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/array-element.d.ts)

```ts
export type ArrayElement<T> =
    T extends UnknownArray
        ? T[number]
        : never;
```

> **Rule catalog ID:** R109

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Indexed Access Types](https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
