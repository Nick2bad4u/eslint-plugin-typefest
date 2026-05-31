# prefer-type-fest-is-undefined

Require TypeFest [`IsUndefined<T>`](https://github.com/sindresorhus/type-fest/blob/main/source/is-undefined.d.ts) over manual tuple-wrapped undefined conditional type guards.

## Targeted pattern scope

This rule reports exact conditional type guards shaped like `[T] extends [undefined] ? true : false`.

It does not report distributive `T extends undefined ? true : false` checks.

## What this rule reports

This rule reports manual non-distributive `undefined` checks that can be replaced by `IsUndefined<T>`.

- `[T] extends [undefined] ? true : false`

## Why this rule exists

`IsUndefined<T>` makes undefined detection intent explicit and keeps type-guard helpers aligned with TypeFest.

## ❌ Incorrect

```ts
type Result<T> = [T] extends [undefined] ? true : false;
```

## ✅ Correct

```ts
type Result<T> = IsUndefined<T>;
```

## Behavior and migration notes

- Only the canonical tuple-wrapped form is reported.
- `null` and `never` guards are handled by their own rules.
- Autofix is skipped when `IsUndefined` is shadowed in the local scope.

## Additional examples

### ❌ Incorrect — Generic helper

```ts
type Missing<T> = [T] extends [undefined] ? true : false;
```

### ✅ Correct — Generic helper

```ts
type Missing<T> = IsUndefined<T>;
```

### ✅ Correct — Distributive conditional

```ts
type Missing<T> = T extends undefined ? true : false;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
 {
  plugins: { typefest },
  rules: {
   "typefest/prefer-type-fest-is-undefined": "error",
  },
 },
];
```

## When not to use it

Disable this rule if a public helper must keep a hand-written undefined conditional for teaching or compatibility reasons.

## Package documentation

TypeFest package documentation:

Source file: [`source/is-undefined.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/is-undefined.d.ts)

> **Rule catalog ID:** R106

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`IsUndefined` source](https://github.com/sindresorhus/type-fest/blob/main/source/is-undefined.d.ts)
- [TypeScript Handbook: Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
