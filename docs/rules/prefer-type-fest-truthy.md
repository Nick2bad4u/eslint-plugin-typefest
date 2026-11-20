# prefer-type-fest-truthy

Prefer [`Truthy`](https://github.com/sindresorhus/type-fest/blob/v6.0.3/source/truthy.d.ts) from `type-fest` 6 for the following pattern.

## Targeted pattern scope

The built-in NonNullable and Exclude around the union of void and the upstream Falsy type.

## What this rule reports

```ts
type Clean<T> = NonNullable<Exclude<T, Falsy | void>>;
```

## Why this rule exists

Truthy excludes void as well as the falsy literals. An ordinary non-nullable type still includes false, zero, and the empty string.

## ❌ Incorrect

```ts
import type { Falsy } from "type-fest";

type Clean<T> = NonNullable<Exclude<T, Falsy | void>>;
```

## ✅ Correct

```ts
import type { Truthy } from "type-fest";

type Clean<T> = Truthy<T>;
```

## Behavior and migration notes

The rule runs when the linted file resolves `type-fest` major version 6. It preserves the outer alias and its parameters. The fixer leaves comments in place and uses the configured import policy.

## Package documentation

TypeFest package documentation:

- [`Truthy` declaration](https://github.com/sindresorhus/type-fest/blob/v6.0.3/source/truthy.d.ts)

> **Rule catalog ID:** R144

## Further reading

- [Rule adoption checklist](./guides/adoption-checklist.md)
