# prefer-type-fest-merge

Prefer [`Merge`](https://github.com/sindresorhus/type-fest/blob/main/source/merge.d.ts) from `type-fest` over `Omit<Destination, keyof Source> & Source` and `Except<Destination, keyof Source> & Source` intersections.

This rule lives only in the experimental preset and reports without autofixing.

## Targeted pattern scope

This rule focuses on merge-style intersections that remove the overridden keys with builtin `Omit` or with `Except` from `type-fest` before intersecting with the overriding source type.

- `Omit<Destination, keyof Source> & Source`
- `Except<Destination, keyof Source> & Source`
- Either member order, including pairs inside larger intersections such as `Omit<Destination, keyof Source> & Source & Extra`

## What this rule reports

This rule reports intersections when all of the following are true:

- one intersection member resolves to builtin `Omit` or to `Except` from `type-fest`
- its second type argument is exactly `keyof Source`
- another member of the same intersection is exactly `Source`

The rule is currently **report-only**. It does not autofix or suggest a replacement yet.

## Why this rule exists

`Merge<Destination, Source>` states the override relationship directly.

- Readers do not need to unpack an `Omit`- or `Except`-plus-intersection recipe.
- The canonical helper signals that the second type wins on overlapping keys.
- The upstream utility also simplifies the resulting object type for tooling display.

## ❌ Incorrect

```ts
type Base = {
 id: string;
 name: string;
};

type Overrides = {
 name: number;
 readonly ok: true;
};

type Combined = Omit<Base, keyof Overrides> & Overrides;
```

## ✅ Correct

```ts
import type { Merge } from "type-fest";

type Base = {
 id: string;
 name: string;
};

type Overrides = {
 name: number;
 readonly ok: true;
};

type Combined = Merge<Base, Overrides>;
```

## Behavior and migration notes

- [`prefer-type-fest-except`](./prefer-type-fest-except.md) does not report a builtin `Omit` that matches this pattern, so the two rules do not double-report it.
- `Except<Destination, keyof Source>` only compiles when every key of `Source` also exists on `Destination`. `Merge<Destination, Source>` has no such constraint, so it also covers sources that add new keys.
- It ignores intersections whose sibling type does not match the `keyof` operand exactly.

## Additional examples

### ❌ Incorrect — Additional example

```ts
import type { Except as StrictExcept } from "type-fest";

type Base = {
 id: string;
 name: string;
};

type Overrides = {
 name: number;
};

type Combined = Overrides & StrictExcept<Base, keyof Overrides>;
```

### ✅ Correct — Additional example

```ts
import type { Merge } from "type-fest";

type Base = {
 id: string;
 name: string;
};

type Overrides = {
 name: number;
};

type Combined = Merge<Base, Overrides>;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [typefest.configs.experimental];
```

## When not to use it

Disable this rule if your team prefers the explicit `Omit<..., keyof ...> & ...` or `Except<..., keyof ...> & ...` construction, or if you want to keep the override mechanism visible in source types.

## Package documentation

TypeFest package documentation:

Source file: [`source/merge.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/merge.d.ts)

```ts
import type { Merge } from "type-fest";

type Foo = {
 a: string;
 b: number;
};

type Bar = {
 a: number;
 c: boolean;
};

type FooBar = Merge<Foo, Bar>;
//=> {a: number; b: number; c: boolean}
```

> **Rule catalog ID:** R088

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` package reference](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Intersection Types](https://www.typescriptlang.org/docs/handbook/2/objects.html#intersection-types)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
- [Preset selection strategy](./guides/preset-selection-strategy.md)
