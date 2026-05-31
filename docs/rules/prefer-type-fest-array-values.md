# prefer-type-fest-array-values

Require TypeFest [`ArrayValues<T>`](https://github.com/sindresorhus/type-fest/blob/main/source/array-values.d.ts) over `typeof values[number]` constant array value extraction.

## Targeted pattern scope

This is a type-aware rule. It targets indexed-access type queries whose object type is a `typeof` query that resolves to an array or tuple.

## What this rule reports

- `typeof values[number]` when `values` resolves to an array or tuple type.

The rule intentionally leaves non-`typeof` `T[number]` patterns to `prefer-type-fest-array-element`.

## Why this rule exists

`ArrayValues<T>` documents the common constant-array pattern directly: derive a union from the values available in a runtime array or tuple.

## ❌ Incorrect

```ts
const statuses = ["queued", "running"] as const;

type Status = (typeof statuses)[number];
```

## ✅ Correct

```ts
import type { ArrayValues } from "type-fest";

const statuses = ["queued", "running"] as const;

type Status = ArrayValues<typeof statuses>;
```

## Behavior and migration notes

- This rule requires type information.
- It only reports `typeof values[number]` when `values` resolves to an array-like type.
- It does not report number-indexed object maps.
- It does not report plain `T[number]`; use `prefer-type-fest-array-element` for that pattern.

## Additional examples

### ❌ Incorrect — Additional example

```ts
declare const weekdays: readonly string[];

type WeekdayName = (typeof weekdays)[number];
```

### ✅ Correct — Additional example

```ts
import type { ArrayValues } from "type-fest";

declare const weekdays: readonly string[];

type WeekdayName = ArrayValues<typeof weekdays>;
```

### ✅ Correct — Non-targeted usage

```ts
type Statuses = readonly ["queued", "running"];

type Status = Statuses[number];
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
 {
  plugins: { typefest },
  rules: {
   "typefest/prefer-type-fest-array-values": "error",
  },
 },
];
```

## When not to use it

Disable this rule if you prefer native indexed-access syntax for value extraction from runtime arrays, or if your project does not use type-aware linting.

## Package documentation

TypeFest package documentation:

Source file: [`source/array-values.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/array-values.d.ts)

```ts
export type ArrayValues<T extends readonly unknown[]> = T[number];
```

> **Rule catalog ID:** R110

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Indexed Access Types](https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
