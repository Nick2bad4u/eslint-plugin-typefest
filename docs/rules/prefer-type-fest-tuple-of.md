# prefer-type-fest-tuple-of

Require `Readonly<TupleOf<Length, Element>>` over imported aliases like
`ReadonlyTuple`.

## Targeted pattern scope

This rule targets deprecated `ReadonlyTuple` alias usage.

## What this rule reports

- Type references that resolve to imported `ReadonlyTuple` aliases.

## Why this rule exists

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

### ❌ Incorrect — Additional example

```ts
import type { ReadonlyTuple } from "type-fest";

type IPv4 = ReadonlyTuple<number, 4>;
```

### ✅ Correct — Additional example

```ts
import type { TupleOf } from "type-fest";

type IPv4 = Readonly<TupleOf<number, 4>>;
```

### ✅ Correct — Repository-wide usage

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

## Package documentation

TypeFest package documentation:

Source file: [`source/tuple-of.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/tuple-of.d.ts)

````ts
/**
Create a tuple type of the specified length with elements of the specified type.

@example
```
import type {TupleOf} from 'type-fest';

type RGB = TupleOf<3, number>;
//=> [number, number, number]

type Line = TupleOf<2, {x: number; y: number}>;
//=> [{x: number; y: number}, {x: number; y: number}]

type TicTacToeBoard = TupleOf<3, TupleOf<3, 'X' | 'O' | null>>;
//=> [['X' | 'O' | null, 'X' | 'O' | null, 'X' | 'O' | null], ['X' | 'O' | null, 'X' | 'O' | null, 'X' | 'O' | null], ['X' | 'O' | null, 'X' | 'O' | null, 'X' | 'O' | null]]
```

@example
```
import type {TupleOf} from 'type-fest';

type Range<Start extends number, End extends number> = Exclude<keyof TupleOf<End>, keyof TupleOf<Start>>;

type ZeroToFour = Range<0, 5>;
//=> '0' | '1' | '2' | '3' | '4'

type ThreeToEight = Range<3, 9>;
//=> '5' | '3' | '4' | '6' | '7' | '8'
```

Note: If the specified length is the non-literal `number` type, the result will not be a tuple but a regular array.

@example
```
import type {TupleOf} from 'type-fest';

type StringArray = TupleOf<number, string>;
//=> string[]
```

Note: If the type for elements is not specified, it will default to `unknown`.

@example
```
import type {TupleOf} from 'type-fest';

type UnknownTriplet = TupleOf<3>;
//=> [unknown, unknown, unknown]
```

Note: If the specified length is negative, the result will be an empty tuple.

@example
```
import type {TupleOf} from 'type-fest';

type EmptyTuple = TupleOf<-3, string>;
//=> []
```

Note: If you need a readonly tuple, simply wrap this type with `Readonly`, for example, to create `readonly [number, number, number]` use `Readonly<TupleOf<3, number>>`.

@category Array
*/
````

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
