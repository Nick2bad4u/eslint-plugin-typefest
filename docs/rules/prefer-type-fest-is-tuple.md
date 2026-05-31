# prefer-type-fest-is-tuple

Require TypeFest [`IsTuple<T>`](https://github.com/sindresorhus/type-fest/blob/main/source/is-tuple.d.ts) over manual length-based tuple conditional type guards.

## Targeted pattern scope

This rule reports exact conditional type guards shaped like `number extends T["length"] ? false : true`.

## What this rule reports

This rule reports manual tuple detection helpers that can be replaced by `IsTuple<T>`.

- `number extends T["length"] ? false : true`

## Why this rule exists

`IsTuple<T>` documents the intent directly and centralizes TypeFest's tuple handling instead of repeating a low-level indexed-access check.

## ❌ Incorrect

```ts
type Result<T extends readonly unknown[]> = number extends T["length"]
 ? false
 : true;
```

## ✅ Correct

```ts
type Result<T extends readonly unknown[]> = IsTuple<T>;
```

## Behavior and migration notes

- The rule intentionally requires the exact `number extends T["length"] ? false : true` shape.
- The opposite array-detection shape, `number extends T["length"] ? true : false`, is ignored.
- Autofix is skipped when `IsTuple` is shadowed in the local scope.

## Additional examples

### ✅ Correct — Existing utility

```ts
type Result<T extends readonly unknown[]> = IsTuple<T>;
```

### ✅ Correct — Array guard

```ts
type Result<T extends readonly unknown[]> = number extends T["length"]
 ? true
 : false;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
 {
  plugins: { typefest },
  rules: {
   "typefest/prefer-type-fest-is-tuple": "error",
  },
 },
];
```

## When not to use it

Disable this rule if a public type alias must preserve a hand-written conditional for compatibility documentation.

## Package documentation

TypeFest package documentation:

Source file: [`source/is-tuple.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/is-tuple.d.ts)

> **Rule catalog ID:** R112

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`IsTuple` source](https://github.com/sindresorhus/type-fest/blob/main/source/is-tuple.d.ts)
- [TypeScript Handbook: Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
