# prefer-type-fest-extract-rest-element

Require TypeFest [`ExtractRestElement<T>`](https://github.com/sindresorhus/type-fest/blob/main/source/extract-rest-element.d.ts) over `SplitOnRestElement<T>[1][number]` rest-element extraction.

## Targeted pattern scope

This rule targets direct and namespace-qualified references to `SplitOnRestElement<T>[1][number]` imported from `type-fest`.

## What this rule reports

- `SplitOnRestElement<T>[1][number]`

## Why this rule exists

`ExtractRestElement` is the public TypeFest helper for extracting the rest element type from a tuple or array. It communicates that intent directly instead of exposing the internal tuple returned by `SplitOnRestElement`.

## ❌ Incorrect

```ts
import type { SplitOnRestElement } from "type-fest";

type Rest = SplitOnRestElement<[number, ...string[], boolean]>[1][number];
```

## ✅ Correct

```ts
import type { ExtractRestElement } from "type-fest";

type Rest = ExtractRestElement<[number, ...string[], boolean]>;
```

## Behavior and migration notes

- This rule only reports `SplitOnRestElement` imported from `type-fest`.
- It only reports the exact rest-element extraction segment, `[1][number]`.
- It leaves `SplitOnRestElement<T>[0]`, `SplitOnRestElement<T>[1]`, and `SplitOnRestElement<T>[2]` alone.
- Namespace-qualified `type-fest` references are reported too.

## Additional examples

### ❌ Incorrect — Namespace import

```ts
import type * as TypeFest from "type-fest";

type Rest = TypeFest.SplitOnRestElement<Tuple>[1][number];
```

### ✅ Correct — Namespace import

```ts
import type { ExtractRestElement } from "type-fest";

type Rest = ExtractRestElement<Tuple>;
```

### ✅ Correct — Non-targeted segment

```ts
import type { SplitOnRestElement } from "type-fest";

type Prefix = SplitOnRestElement<Tuple>[0];
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-extract-rest-element": "error",
        },
    },
];
```

## When not to use it

Disable this rule if your codebase intentionally works with the raw tuple returned by `SplitOnRestElement`.

## Package documentation

TypeFest package documentation:

Source file: [`source/extract-rest-element.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/extract-rest-element.d.ts)

```ts
/**
Extract the rest element type from an array.
*/
export type ExtractRestElement<T extends UnknownArray> =
    SplitOnRestElement<T>[1][number];
```

> **Rule catalog ID:** R115

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Tuple Types](https://www.typescriptlang.org/docs/handbook/2/objects.html#tuple-types)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
