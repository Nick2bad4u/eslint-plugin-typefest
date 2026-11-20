# prefer-type-fest-is-mutually-assignable

Prefer [`IsMutuallyAssignable`](https://github.com/sindresorhus/type-fest/blob/v6.0.3/source/is-mutually-assignable.d.ts) from `type-fest` 6 for the following pattern.

## Targeted pattern scope

Nested, non-distributive checks that compare the same two named types in both directions.

## What this rule reports

```ts
type Compatible<A, B> = [A] extends [B] ? [B] extends [A] ? true : false : false;
```

## Why this rule exists

A one-way assignability check has a different result for subtypes. Removing the tuple wrappers also distributes over unions.

## ❌ Incorrect

```ts
type Compatible<A, B> = [A] extends [B] ? [B] extends [A] ? true : false : false;
```

## ✅ Correct

```ts
import type { IsMutuallyAssignable } from "type-fest";

type Compatible<A, B> = IsMutuallyAssignable<A, B>;
```

## Behavior and migration notes

The rule runs when the linted file resolves `type-fest` major version 6. It preserves the outer alias and its parameters. The fixer leaves comments in place and uses the configured import policy.

## Package documentation

TypeFest package documentation:

- [`IsMutuallyAssignable` declaration](https://github.com/sindresorhus/type-fest/blob/v6.0.3/source/is-mutually-assignable.d.ts)

> **Rule catalog ID:** R138

## Further reading

- [Rule adoption checklist](./guides/adoption-checklist.md)
