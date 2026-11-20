# prefer-type-fest-function

Prefer [`AsyncFunction`](https://github.com/sindresorhus/type-fest/blob/v6.0.3/source/basic.d.ts) from `type-fest` 6 for the following pattern.

## Targeted pattern scope

An alias with a single rest parameter and a built-in Promise result, or an unrestricted rest signature returning unknown.

## What this rule reports

```ts
type Loader<Args extends readonly unknown[], Result> = (...args: Args) => Promise<Result>;
```

## Why this rule exists

The rule distinguishes AnyFunction, AnyAsyncFunction and AsyncFunction. Named parameters, function-local generics, and return types that depend on a parameter need to keep their original scope.

## ❌ Incorrect

```ts
type Loader<Args extends readonly unknown[], Result> = (...args: Args) => Promise<Result>;
```

## ✅ Correct

```ts
import type { AsyncFunction } from "type-fest";

type Loader<Args extends readonly unknown[], Result> = AsyncFunction<Args, Result>;
```

## Behavior and migration notes

The rule runs when the linted file resolves `type-fest` major version 6. It preserves the outer alias and its parameters. The fixer leaves comments in place and uses the configured import policy.

## Package documentation

TypeFest package documentation:

- [`AsyncFunction` declaration](https://github.com/sindresorhus/type-fest/blob/v6.0.3/source/basic.d.ts)

> **Rule catalog ID:** R143

## Further reading

- [Rule adoption checklist](./guides/adoption-checklist.md)
