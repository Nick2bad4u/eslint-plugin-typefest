# prefer-type-fest-non-empty-tuple

Require TypeFest `NonEmptyTuple` over the ad-hoc `readonly [T, ...T[]]` tuple pattern.

## Targeted pattern scope

This rule targets ad-hoc tuple-rest patterns that encode non-empty collections.

## What it checks

- `readonly [T, ...T[]]`

## Why

`NonEmptyTuple<T>` is a well-known TypeFest alias that communicates the intent of a non-empty tuple and keeps shared utility-type usage consistent across codebases.

## ❌ Incorrect

```ts
type Names = readonly [string, ...string[]];
```

## ✅ Correct

```ts
type Names = NonEmptyTuple<string>;
```

## Behavior and migration notes

- `NonEmptyTuple<T>` represents tuple/list contracts with at least one element.
- This rule targets the explicit rest-tuple spelling (`readonly [T, ...T[]]`).
- Keep element type aliases explicit when non-empty constraints are part of public API contracts.

## Additional examples

### ❌ Incorrect (additional scenario)

```ts
type Names = readonly [string, ...string[]];
```

### ✅ Correct (additional scenario)

```ts
type Names = NonEmptyTuple<string>;
```

### ✅ Correct (team-scale usage)

```ts
type Steps = NonEmptyTuple<{ id: string }>;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-non-empty-tuple": "error",
        },
    },
];
```

## When not to use it

Disable this rule if existing tuple spellings must remain for public compatibility.

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
