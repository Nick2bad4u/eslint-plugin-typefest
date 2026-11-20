# prefer-type-fest-guarded-type

Prefer [`GuardedType`](https://github.com/sindresorhus/type-fest/blob/v6.0.3/source/guarded-type.d.ts) from `type-fest` 6. Extract the type narrowed by a predicate whose first parameter holds the tested value.

## Targeted pattern scope

A type alias checks its own bare parameter against a predicate function with a required `any` first parameter and an `any[]` rest parameter. The predicate narrows that first parameter to an unconstrained inferred type.

## What this rule reports

The true branch returns the inferred type. The false branch returns `never`. Renaming the input, rest parameter, or inferred type preserves the match.

## Why this rule exists

The rest parameter matters for guards with additional required arguments. A naked check parameter distributes over unions of guards and discards members whose signatures return plain booleans.

## ❌ Incorrect

```ts
type ExtractGuard<F> = F extends (item: any, ...args: any[]) => item is infer G
 ? G
 : never;
```

## ✅ Correct

```ts
import type { GuardedType } from "type-fest";

type ExtractGuard<F> = GuardedType<F>;
```

## Behavior and migration notes

The rule skips one-parameter signatures, constrained inference, assertions, and checks against concrete types. A comment inside the matched expression or a conflicting local name prevents an automatic edit.

## Package documentation

TypeFest package documentation:

- [`GuardedType` declaration](https://github.com/sindresorhus/type-fest/blob/v6.0.3/source/guarded-type.d.ts)

> **Rule catalog ID:** R148

## Further reading

- [Rule adoption checklist](./guides/adoption-checklist.md)
