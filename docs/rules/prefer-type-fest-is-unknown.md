# prefer-type-fest-is-unknown

Require TypeFest [`IsUnknown<T>`](https://github.com/sindresorhus/type-fest/blob/main/source/is-unknown.d.ts) over manual unknown conditional type guards.

## Targeted pattern scope

This rule reports exact conditional type guards shaped like `unknown extends T ? [T] extends [null] ? false : true : false`.

## What this rule reports

This rule reports manual `unknown` detection helpers that can be replaced by `IsUnknown<T>`.

- `unknown extends T ? [T] extends [null] ? false : true : false`

## Why this rule exists

`IsUnknown<T>` documents the intent directly and avoids repeating a brittle conditional type trick across a codebase.

## ❌ Incorrect

```ts
type Result<T> = unknown extends T
 ? [T] extends [null]
   ? false
   : true
 : false;
```

## ✅ Correct

```ts
type Result<T> = IsUnknown<T>;
```

## Behavior and migration notes

- The rule intentionally requires the exact tuple-wrapped `null` exclusion.
- Simpler `unknown extends T ? true : false` helpers are ignored because they also match `any`.
- Autofix is skipped when `IsUnknown` is shadowed in the local scope.

## Additional examples

### ✅ Correct — Existing utility

```ts
type Result<T> = IsUnknown<T>;
```

### ✅ Correct — Simpler but not equivalent

```ts
type Result<T> = unknown extends T ? true : false;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
 {
  plugins: { typefest },
  rules: {
   "typefest/prefer-type-fest-is-unknown": "error",
  },
 },
];
```

## When not to use it

Disable this rule if a public type alias must preserve a hand-written conditional for compatibility documentation.

## Package documentation

TypeFest package documentation:

Source file: [`source/is-unknown.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/is-unknown.d.ts)

> **Rule catalog ID:** R111

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`IsUnknown` source](https://github.com/sindresorhus/type-fest/blob/main/source/is-unknown.d.ts)
- [TypeScript Handbook: Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
