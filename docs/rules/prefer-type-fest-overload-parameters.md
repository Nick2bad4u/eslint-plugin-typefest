# prefer-type-fest-overload-parameters

Prefer [`OverloadParameters`](https://github.com/sindresorhus/type-fest/blob/v6.0.3/source/overload-parameters.d.ts) from `type-fest` when extracting the argument tuples of every overload. This rule is available with Type-fest 6 in the experimental and all presets.

## Targeted pattern scope

The rule recognizes `FunctionParameters<Overloads<F>[number]>`. The numeric index must be the `number` type, which selects every signature. Both `FunctionParameters` and `Overloads` must resolve to imports from `type-fest`. Named imports, aliases and namespace imports are supported.

## What this rule reports

The diagnostic points to the complete extraction and names the helper that accepts the original function type. An index such as `[0]` selects one signature and stays as written.

## Why this rule exists

The helper gives the intent of the numeric index a name. The TypeScript built-in `Parameters<F>` extracts the parameters of the final overload. The indexed expression and the Type-fest helper both use the signatures collected by `Overloads<F>`.

## ❌ Incorrect

```ts
import type { FunctionParameters, Overloads } from "type-fest";

declare function parse(value: string): number;
declare function parse(value: number): string;

type Arguments = FunctionParameters<Overloads<typeof parse>[number]>;
```

## ✅ Correct

```ts
import type { OverloadParameters } from "type-fest";

declare function parse(value: string): number;
declare function parse(value: number): string;

type Arguments = OverloadParameters<typeof parse>;
```

## Behavior and migration notes

Autofixes use an available canonical type import. A comment within the matched expression or a shadowed replacement name keeps the migration manual. A type alias imported from another module receives no diagnostic.

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [typefest.configs.experimental];
```

## When not to use it

Keep the composition when teaching how TypeScript extracts the signatures of an overloaded function.

## Package documentation

TypeFest package documentation:

Source file: [`source/overload-parameters.d.ts`](https://github.com/sindresorhus/type-fest/blob/v6.0.3/source/overload-parameters.d.ts)

```ts
import type { OverloadParameters } from "type-fest";

declare function lookup(id: number): string;
declare function lookup(key: string): boolean;
type Arguments = OverloadParameters<typeof lookup>;
// [id: number] | [key: string]
```

> **Rule catalog ID:** R150

## Further reading

- [Type-fest `Overloads` and its inference limits](https://github.com/sindresorhus/type-fest/blob/v6.0.3/source/overloads.d.ts)
- [TypeScript Handbook on function overloads](https://www.typescriptlang.org/docs/handbook/2/functions.html#function-overloads)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
- [Preset selection strategy](./guides/preset-selection-strategy.md)
