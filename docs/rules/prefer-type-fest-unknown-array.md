# prefer-type-fest-unknown-array

Require TypeFest `UnknownArray` over `readonly unknown[]` and `ReadonlyArray<unknown>`.

## Targeted pattern scope

This rule limits analysis to exact AST patterns and explicit syntactic boundaries:

- Direct `readonly unknown[]` syntax in its canonical AST form.
- Direct `ReadonlyArray<unknown>` syntax in its canonical AST form.
- Alias indirection, wrapper helpers, and semantically similar variants are out of scope unless they preserve the same AST shape.

## What this rule reports

This rule reports every occurrence of the matched pattern(s) below:

- `readonly unknown[]`
- `ReadonlyArray<unknown>`

## Why this rule exists

`UnknownArray` provides a clearer, shared alias for unknown element arrays and keeps utility-type usage consistent with other TypeFest-first conventions.

## ❌ Incorrect

```ts
type Values = readonly unknown[];
```

## ✅ Correct

```ts
type Values = UnknownArray;
```

## Behavior and migration notes

- `UnknownArray` is the canonical alias for readonly unknown-element arrays in `type-fest` style.
- This rule normalizes `readonly unknown[]` and `ReadonlyArray<unknown>` into one shared name.
- Use this alias for untyped collection ingress points before narrowing.

## Additional examples

### ❌ Incorrect — Additional example

```ts
type Input = readonly unknown[];
```

### ✅ Correct — Additional example

```ts
type Input = UnknownArray;
```

### ✅ Correct — Repository-wide usage

```ts
type PayloadList = UnknownArray;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-unknown-array": "error",
        },
    },
];
```

## When not to use it

Disable this rule if external API signatures must preserve existing alias names.

## Package documentation

TypeFest package documentation:

Source file: [`source/unknown-array.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/unknown-array.d.ts)

````ts
/**
Represents an array with `unknown` value.

Use case: You want a type that all arrays can be assigned to, but you don't care about the value.

@example
```
import type {UnknownArray} from 'type-fest';

type IsArray<T> = T extends UnknownArray ? true : false;

type A = IsArray<['foo']>;
//=> true

type B = IsArray<readonly number[]>;
//=> true

type C = IsArray<string>;
//=> false
```

@category Type
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
