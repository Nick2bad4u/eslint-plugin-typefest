# prefer-type-fest-union-length

Require TypeFest [`UnionLength`](https://github.com/sindresorhus/type-fest/blob/main/source/union-length.d.ts) over `UnionToTuple<T>['length']`.

## Targeted pattern scope

This rule reports `UnionToTuple<T>['length']` indexed-access type patterns and prefers the canonical `UnionLength<T>` from type-fest, which encapsulates the same intent with less visual noise.

## What this rule reports

- `TSIndexedAccessType` nodes of the shape `UnionToTuple<T>['length']`.

### Detection boundaries

- ✅ Reports `UnionToTuple<T>['length']` with exactly one type argument forwarded.
- ✅ Autofixes by replacing the indexed-access type with `UnionLength<T>` and inserting a `type-fest` import when absent.
- ❌ Does not auto-fix where the `UnionLength` identifier is shadowed by a type parameter in scope.
- ❌ Does not flag `UnionToTuple<T>[0]` or other non-`'length'` index expressions.
- ❌ Does not flag `UnionToTuple<T>` used without an index type.

## Why this rule exists

`UnionLength<T>` is the canonical TypeFest utility for computing the number of members in a union type.

The pattern `UnionToTuple<T>['length']` is functionally equivalent but requires two chained operations and knowledge that `UnionToTuple` produces a tuple. Using the dedicated `UnionLength<T>` utility is more declarative, easier to read, and signals intent without requiring knowledge of the intermediate tuple form.

## ❌ Incorrect

```ts
type ColorCount = UnionToTuple<Colors>['length'];
```

## ✅ Correct

```ts
import type { UnionLength } from "type-fest";

type ColorCount = UnionLength<Colors>;
```

## Behavior and migration notes

- `UnionLength<T>` returns the numeric literal type representing the number of members in the union `T`.
- Both `UnionToTuple<T>['length']` and `UnionLength<T>` are structurally equivalent — the autofix is safe.
- The type argument forwarded to `UnionLength<T>` is taken directly from `UnionToTuple<T>`.

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-union-length": "error",
        },
    },
];
```

## When not to use it

Disable this rule if your codebase uses `UnionToTuple<T>['length']` intentionally for clarity (e.g., in tightly-scoped local type algebra where both operations are discussed together).

## Package documentation

TypeFest package documentation:

Source file: [`source/union-length.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/union-length.d.ts)

````ts
/**
Get the number of elements in a union type.

@example
```
import type {UnionLength} from 'type-fest';

type Colors = 'red' | 'green' | 'blue';
type Count = UnionLength<Colors>;
//=> 3
```

@category Union
@category Numeric
*/
````

> **Rule catalog ID:** R099

## Further reading

- [TypeFest README](https://github.com/sindresorhus/type-fest)
- [TypeScript Handbook: Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
