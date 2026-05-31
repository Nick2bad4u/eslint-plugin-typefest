# prefer-type-fest-is-never

Require TypeFest [`IsNever<T>`](https://github.com/sindresorhus/type-fest/blob/main/source/is-never.d.ts) over manual tuple-wrapped never conditional type guards.

## Targeted pattern scope

This rule reports exact conditional type guards shaped like `[T] extends [never] ? true : false`.

It does not report distributive `T extends never ? true : false` checks because those behave differently when `T` is `never`.

## What this rule reports

This rule reports manual non-distributive `never` checks that can be replaced by `IsNever<T>`.

- `[T] extends [never] ? true : false`

## Why this rule exists

`IsNever<T>` makes the non-distributive guard intent explicit and avoids repeated tuple-wrapping boilerplate.

## ❌ Incorrect

```ts
type Result<T> = [T] extends [never] ? true : false;
```

## ✅ Correct

```ts
type Result<T> = IsNever<T>;
```

## Behavior and migration notes

- Only the canonical tuple-wrapped form is reported.
- Reversed boolean branches are ignored.
- Autofix is skipped when `IsNever` is shadowed in the local scope.

## Additional examples

### ❌ Incorrect — Generic helper

```ts
type Missing<T> = [T] extends [never] ? true : false;
```

### ✅ Correct — Generic helper

```ts
type Missing<T> = IsNever<T>;
```

### ✅ Correct — Distributive conditional

```ts
type Missing<T> = T extends never ? true : false;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
 {
  plugins: { typefest },
  rules: {
   "typefest/prefer-type-fest-is-never": "error",
  },
 },
];
```

## When not to use it

Disable this rule if a published helper intentionally mirrors TypeScript conditional type mechanics in its source.

## Package documentation

TypeFest package documentation:

Source file: [`source/is-never.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/is-never.d.ts)

> **Rule catalog ID:** R104

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`IsNever` source](https://github.com/sindresorhus/type-fest/blob/main/source/is-never.d.ts)
- [TypeScript Handbook: Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
