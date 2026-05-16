# prefer-type-fest-is-null

Require TypeFest [`IsNull<T>`](https://github.com/sindresorhus/type-fest/blob/main/source/is-null.d.ts) over manual tuple-wrapped null conditional type guards.

## Targeted pattern scope

This rule reports exact conditional type guards shaped like `[T] extends [null] ? true : false`.

It does not report distributive `T extends null ? true : false` checks.

## What this rule reports

This rule reports manual non-distributive `null` checks that can be replaced by `IsNull<T>`.

- `[T] extends [null] ? true : false`

## Why this rule exists

`IsNull<T>` makes null detection intent explicit and keeps type-guard helpers aligned with TypeFest.

## ❌ Incorrect

```ts
type Result<T> = [T] extends [null] ? true : false;
```

## ✅ Correct

```ts
type Result<T> = IsNull<T>;
```

## Behavior and migration notes

- Only the canonical tuple-wrapped form is reported.
- `undefined` and `never` guards are handled by their own rules.
- Autofix is skipped when `IsNull` is shadowed in the local scope.

## Additional examples

### ❌ Incorrect — Generic helper

```ts
type Nullable<T> = [T] extends [null] ? true : false;
```

### ✅ Correct — Generic helper

```ts
type Nullable<T> = IsNull<T>;
```

### ✅ Correct — Distributive conditional

```ts
type Nullable<T> = T extends null ? true : false;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-is-null": "error",
        },
    },
];
```

## When not to use it

Disable this rule if a public helper must keep a hand-written null conditional for teaching or compatibility reasons.

## Package documentation

TypeFest package documentation:

Source file: [`source/is-null.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/is-null.d.ts)

> **Rule catalog ID:** R105

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`IsNull` source](https://github.com/sindresorhus/type-fest/blob/main/source/is-null.d.ts)
- [TypeScript Handbook: Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
