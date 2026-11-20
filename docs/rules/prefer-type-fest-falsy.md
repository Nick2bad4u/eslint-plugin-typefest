# prefer-type-fest-falsy

Prefer [`Falsy`](https://github.com/sindresorhus/type-fest/blob/v6.0.3/source/falsy.d.ts) from `type-fest` 6 for the following pattern.

## Targeted pattern scope

A union containing each of the six falsy literal types exactly once, in any order.

## What this rule reports

```ts
type Local = false | null | 0n | undefined | '' | 0;
```

## Why this rule exists

The bigint zero is distinct from the numeric zero. A union that omits either one describes a different set of values.

## ❌ Incorrect

```ts
type Local = false | null | 0n | undefined | '' | 0;
```

## ✅ Correct

```ts
import type { Falsy } from "type-fest";

type Local = Falsy;
```

## Behavior and migration notes

The rule runs when the linted file resolves `type-fest` major version 6. It preserves the outer alias and its parameters. The fixer leaves comments in place and uses the configured import policy.

## Package documentation

TypeFest package documentation:

- [`Falsy` declaration](https://github.com/sindresorhus/type-fest/blob/v6.0.3/source/falsy.d.ts)

> **Rule catalog ID:** R137

## Further reading

- [Rule adoption checklist](./guides/adoption-checklist.md)
