# prefer-type-fest-tuple-of

Require `Readonly<TupleOf<Length, Element>>` over imported aliases like
`ReadonlyTuple`.

## Targeted pattern scope

This rule targets deprecated `ReadonlyTuple` alias usage.

## What it checks

- Type references that resolve to imported `ReadonlyTuple` aliases.

## Why

`ReadonlyTuple` is deprecated in TypeFest. The canonical replacement is
`Readonly<TupleOf<Length, Element>>`, which keeps readonly semantics explicit
while using the supported tuple utility.

## ❌ Incorrect

```ts
import type { ReadonlyTuple } from "type-fest";

type Digits = ReadonlyTuple<number, 4>;
```

## ✅ Correct

```ts
import type { TupleOf } from "type-fest";

type Digits = Readonly<TupleOf<number, 4>>;
```

## Behavior and migration notes

- `ReadonlyTuple<Element, Length>` is deprecated in favor of `Readonly<TupleOf<Element, Length>>`.
- This rule migrates deprecated TypeFest tuple naming toward supported utilities.
- Keep readonly wrapping explicit so mutability intent remains visible at call sites.

## Additional examples

### ❌ Incorrect (additional scenario)

```ts
import type { ReadonlyTuple } from "type-fest";

type IPv4 = ReadonlyTuple<number, 4>;
```

### ✅ Correct (additional scenario)

```ts
import type { TupleOf } from "type-fest";

type IPv4 = Readonly<TupleOf<number, 4>>;
```

### ✅ Correct (team-scale usage)

```ts
type RGB = TupleOf<number, 3>;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-tuple-of": "error",
        },
    },
];
```

## When not to use it

Disable this rule if compatibility constraints require preserving deprecated aliases.

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
