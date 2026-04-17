# prefer-type-fest-absolute

Require TypeFest [`Absolute`](https://github.com/sindresorhus/type-fest/blob/main/source/absolute.d.ts) over common `Abs` or `AbsoluteValue` aliases.

## Targeted pattern scope

This rule reports `Abs<N>` and `AbsoluteValue<N>` type references and prefers the canonical `Absolute<N>` from type-fest for numeric absolute-value type computations.

## What this rule reports

- Type references named `Abs`.
- Type references named `AbsoluteValue`.

### Detection boundaries

- ✅ Reports direct `Abs<N>` and `AbsoluteValue<N>` type references.
- ✅ Autofixes by renaming the identifier to `Absolute` and inserting a `type-fest` import when absent.
- ❌ Does not auto-fix where the `Absolute` identifier is shadowed by a type parameter in scope.

## Why this rule exists

`Absolute<N>` is the canonical TypeFest utility for computing the absolute value of a numeric literal type.

Using a consistent name across a codebase avoids confusion between locally-defined `Abs` helpers and the standard TypeFest utility. A single canonical name also makes the intent immediately readable by contributors familiar with type-fest.

## ❌ Incorrect

```ts
type Result = Abs<-5>;
type Other = AbsoluteValue<-100>;
```

## ✅ Correct

```ts
import type { Absolute } from "type-fest";

type Result = Absolute<-5>;
type Other = Absolute<-100>;
```

## Behavior and migration notes

- `Absolute<N>` strips the leading minus sign from a negative numeric literal type, producing the non-negative form.
- Locally-defined `Abs` or `AbsoluteValue` helpers may have different semantics (e.g., different constraints). Verify the behavior is equivalent before applying the autofix.
- The autofix is safe to apply when the local alias is a mere re-export or thin wrapper over `Absolute`.

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-absolute": "error",
        },
    },
];
```

## When not to use it

Disable this rule if your codebase intentionally standardizes `Abs` or `AbsoluteValue` naming, or if your local alias provides additional constraints not present in the TypeFest utility.

## Package documentation

TypeFest package documentation:

Source file: [`source/absolute.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/absolute.d.ts)

````ts
/**
Returns the absolute value of a given integer type.

@example
```
import type {Absolute} from 'type-fest';

type SomeValue = Absolute<-1>;
//=> 1
```

@category Numeric
*/
````

> **Rule catalog ID:** R097

## Further reading

- [TypeFest README](https://github.com/sindresorhus/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
