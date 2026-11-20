# prefer-type-fest-thunkable

Prefer [`Thunkable<T>`](https://github.com/sindresorhus/type-fest/blob/v6.0.3/source/thunkable.d.ts) from `type-fest` for a value of type `T` or a zero-argument function returning `T`. The rule is available in the experimental and all presets and requires `type-fest` 6.

## Targeted pattern scope

The rule examines the entire right-hand side of a single-parameter type alias. It recognizes `T | (() => T)` and the reversed order. Both references must resolve to the alias's type parameter.

## What this rule reports

A diagnostic identifies the union that can be replaced with `Thunkable<T>`. The callback must declare zero parameters. An optional argument, a rest parameter, an explicit `this` parameter, or a callback type parameter gives it a different signature.

## Why this rule exists

`Thunkable` gives a name to a common lazy-initialization contract. For example, callers can supply an already-built configuration or defer its construction until the configuration is used.

## ❌ Incorrect

```ts
export type Lazy<Value> = Value | (() => Value);
```

## ✅ Correct

```ts
import type { Thunkable } from "type-fest";

export type Lazy<Value> = Thunkable<Value>;
```

## Behavior and migration notes

The rule reports without autofixing. Keep the existing alias name, constraints, defaults, and exports when changing its definition. In a module that already declares a type named `Thunkable`, import the upstream type under a different local name.

When the value itself is callable, a runtime `typeof` check alone cannot distinguish an immediate function value from a deferred computation. Changing the type annotation preserves that ambiguity.

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [typefest.configs.experimental];
```

## When not to use it

Disable this rule when your public API uses a domain-specific lazy-value definition that you want to maintain independently of `type-fest`.

## Package documentation

TypeFest package documentation:

Source file: [`source/thunkable.d.ts`](https://github.com/sindresorhus/type-fest/blob/v6.0.3/source/thunkable.d.ts)

```ts
import type { Thunkable } from "type-fest";

type Config = { debug: boolean };
const deferred: Thunkable<Config> = () => ({ debug: false });
```

> **Rule catalog ID:** R142

## Further reading

- [TypeFest `Thunkable` examples](https://github.com/sindresorhus/type-fest/blob/v6.0.3/source/thunkable.d.ts)
- [TypeScript Handbook on function type expressions](https://www.typescriptlang.org/docs/handbook/2/functions.html#function-type-expressions)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
- [Preset selection strategy](./guides/preset-selection-strategy.md)
