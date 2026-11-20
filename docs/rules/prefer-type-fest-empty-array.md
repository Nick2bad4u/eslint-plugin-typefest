# prefer-type-fest-empty-array

Prefer [`EmptyArray`](https://github.com/sindresorhus/type-fest/blob/v6.0.3/source/empty-array.d.ts) from `type-fest` when a type alias defines a readonly tuple with zero elements. The rule is available in the experimental and all presets and requires `type-fest` 6.

## Targeted pattern scope

The complete right-hand side of the alias must be `readonly []`. A mutable tuple, a tuple with optional or rest elements, and an inline tuple in a larger type fall outside this scope.

## What this rule reports

The rule reports the tuple in `type NoArguments = readonly []`. It leaves inline uses such as `type Result = string | readonly []` alone.

## Why this rule exists

A project that names an empty argument list can reuse TypeFest's definition. The helper preserves the literal length `0` and prevents mutation through the alias.

## ❌ Incorrect

```ts
export type NoArguments = readonly [];
```

## ✅ Correct

```ts
import type { EmptyArray } from "type-fest";

export type NoArguments = EmptyArray;
```

## Behavior and migration notes

The rule reports without autofixing. Keep the alias's existing export and local name when changing its definition. If the alias itself is named `EmptyArray`, import the helper under a different local name.

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [typefest.configs.experimental];
```

## When not to use it

Disable this rule if your project prefers the native tuple spelling for named aliases.

## Package documentation

TypeFest package documentation:

TypeFest defines [`EmptyArray`](https://github.com/sindresorhus/type-fest/blob/v6.0.3/source/empty-array.d.ts) as `readonly []`.

```ts
import type { EmptyArray } from "type-fest";

const noArguments: EmptyArray = [];
```

> **Rule catalog ID:** R151

## Further reading

- [TypeFest `EmptyArray` examples](https://github.com/sindresorhus/type-fest/blob/v6.0.3/source/empty-array.d.ts)
- [TypeScript Handbook on readonly tuples](https://www.typescriptlang.org/docs/handbook/2/objects.html#readonly-tuple-types)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
- [Preset selection strategy](./guides/preset-selection-strategy.md)
