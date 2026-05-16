# prefer-type-fest-is-any

Require TypeFest [`IsAny<T>`](https://github.com/sindresorhus/type-fest/blob/main/source/is-any.d.ts) over manual `0 extends 1 & T` conditional type guards.

## Targeted pattern scope

This rule reports exact conditional type guards shaped like `0 extends 1 & T ? true : false`.

The rule also recognizes the TypeScript built-in `NoInfer<T>` wrapper used by TypeFest's own implementation.

## What this rule reports

This rule reports manual `any` detection helpers that can be replaced by `IsAny<T>`.

- `0 extends 1 & T ? true : false`
- `0 extends 1 & NoInfer<T> ? true : false`

## Why this rule exists

`IsAny<T>` documents the intent directly and avoids repeating a non-obvious conditional type trick across a codebase.

## ❌ Incorrect

```ts
type Result<T> = 0 extends 1 & T ? true : false;
```

## ✅ Correct

```ts
type Result<T> = IsAny<T>;
```

## Behavior and migration notes

- The rule intentionally requires the exact `0 extends 1 & T ? true : false` shape.
- Reversed branches and non-zero check literals are ignored.
- Autofix is skipped when `IsAny` is shadowed in the local scope.

## Additional examples

### ❌ Incorrect — With NoInfer

```ts
type Result<T> = 0 extends 1 & NoInfer<T> ? true : false;
```

### ✅ Correct — With NoInfer

```ts
type Result<T> = IsAny<T>;
```

### ✅ Correct — Existing utility

```ts
type Result<T> = IsAny<T>;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-is-any": "error",
        },
    },
];
```

## When not to use it

Disable this rule if a public type alias must preserve a hand-written conditional for compatibility documentation.

## Package documentation

TypeFest package documentation:

Source file: [`source/is-any.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/is-any.d.ts)

> **Rule catalog ID:** R103

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`IsAny` source](https://github.com/sindresorhus/type-fest/blob/main/source/is-any.d.ts)
- [TypeScript Handbook: Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
