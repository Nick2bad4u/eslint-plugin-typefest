# prefer-type-fest-minimum-length-array

Prefer [`MinimumLengthArray`](https://github.com/sindresorhus/type-fest/blob/v6.0.3/source/minimum-length-array.d.ts) from `type-fest` 6 for the following pattern.

## Targeted pattern scope

Mutable open tuples with at least two identical required elements followed by an array rest of the same type.

## What this rule reports

```ts
type Batch<T> = [T, T, ...T[]];
```

## Why this rule exists

The count becomes the minimum length. Readonly, labeled, optional, and heterogeneous tuples carry information that the helper would lose.

## ❌ Incorrect

```ts
type Batch<T> = [T, T, ...T[]];
```

## ✅ Correct

```ts
import type { MinimumLengthArray } from "type-fest";

type Batch<T> = MinimumLengthArray<T, 2>;
```

## Behavior and migration notes

The rule runs when the linted file resolves `type-fest` major version 6. It preserves the outer alias and its parameters. The fixer leaves comments in place and uses the configured import policy.

## Package documentation

TypeFest package documentation:

- [`MinimumLengthArray` declaration](https://github.com/sindresorhus/type-fest/blob/v6.0.3/source/minimum-length-array.d.ts)

> **Rule catalog ID:** R145

## Further reading

- [Rule adoption checklist](./guides/adoption-checklist.md)
