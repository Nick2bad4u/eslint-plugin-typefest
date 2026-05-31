# prefer-type-fest-is-nullable

Require TypeFest [`IsNullable<T>`](https://github.com/sindresorhus/type-fest/blob/main/source/is-nullable.d.ts) over equivalent any-safe nullable conditional type guards.

## Targeted pattern scope

This rule reports exact nullable guards that preserve TypeFest's `any` behavior:

- `IsAny<T> extends true ? true : Extract<T, null> extends never ? false : true`
- `0 extends 1 & T ? true : Extract<T, null> extends never ? false : true`

It does not report the shorter `Extract<T, null> extends never ? false : true` form because that returns a different result for `any`.

## What this rule reports

This rule reports manual `null`-membership checks that can be replaced by `IsNullable<T>` without losing TypeFest's `any` handling.

## Why this rule exists

`IsNullable<T>` makes nullable intent explicit and avoids repeating a nested conditional helper every time a type needs to detect `null`.

## ❌ Incorrect

```ts
import type { IsAny } from "type-fest";

type Result<T> =
 IsAny<T> extends true ? true : Extract<T, null> extends never ? false : true;
```

## ✅ Correct

```ts
import type { IsNullable } from "type-fest";

type Result<T> = IsNullable<T>;
```

## Behavior and migration notes

- `IsAny<T>` must be imported from `type-fest` for the imported-helper pattern to report.
- The manual `0 extends 1 & T` any guard is also supported.
- The inner check must be exactly `Extract<T, null> extends never ? false : true`.
- Autofix is skipped when `IsNullable` is shadowed in the local scope.

## Additional examples

### ❌ Incorrect — Manual any guard

```ts
type Result<T> = 0 extends 1 & T
 ? true
 : Extract<T, null> extends never
   ? false
   : true;
```

### ✅ Correct — Manual any guard

```ts
type Result<T> = IsNullable<T>;
```

### ✅ Correct — Not any-safe

```ts
type Result<T> = Extract<T, null> extends never ? false : true;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
 {
  plugins: { typefest },
  rules: {
   "typefest/prefer-type-fest-is-nullable": "error",
  },
 },
];
```

## When not to use it

Disable this rule if a public helper must keep a hand-written nullable conditional for compatibility or teaching reasons.

## Package documentation

TypeFest package documentation:

Source file: [`source/is-nullable.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/is-nullable.d.ts)

> **Rule catalog ID:** R116

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`IsNullable` source](https://github.com/sindresorhus/type-fest/blob/main/source/is-nullable.d.ts)
- [TypeScript Handbook: Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
