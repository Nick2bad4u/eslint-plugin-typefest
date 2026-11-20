# prefer-ts-extras-has-at-least

Prefer [`hasAtLeast`](https://github.com/sindresorhus/ts-extras/blob/v3.0.0/source/has-at-least.ts) when checking whether an array contains a known minimum number of elements.

## Targeted pattern scope

The rule accepts literal minima from 2 through 999, including reversed comparisons and equivalent strict bounds. For example, `1 < items.length` and `items.length >= 2` both suggest `hasAtLeast(items, 2)`. The published overload only narrows when the minimum is one integer literal below 1000.

## What this rule reports

A numeric comparison of a direct `.length` access on a mutable array, readonly array, tuple, or a union of those types. Strings, typed arrays, arbitrary objects with a length property, optional access and computed properties are outside the rule's scope.

## Why this rule exists

The helper narrows the array so TypeScript can safely read the required leading elements with `noUncheckedIndexedAccess` enabled. An optional tuple element or an element whose declared type includes `undefined` can still be `undefined`.

## ❌ Incorrect

```ts
declare const items: readonly string[];

if (items.length >= 2) {
 console.log(items[1]);
}
```

## ✅ Correct

```ts
import { hasAtLeast } from "ts-extras";

declare const items: readonly string[];

if (hasAtLeast(items, 2)) {
 console.log(items[1]);
}
```

## Behavior and migration notes

The diagnostic requires type information and a stable `ts-extras` 2.x or 3.x release. The diagnostic leaves the edit to the developer. The helper changes TypeScript control-flow narrowing, including the type available in the false branch. The rule skips fixed tuple lengths that already determine the result.

## When not to use it

Disable this rule when your team prefers explicit length comparisons.

## Package documentation

ts-extras package documentation:

[Published `hasAtLeast` source](https://github.com/sindresorhus/ts-extras/blob/v3.0.0/source/has-at-least.ts)

> **Rule catalog ID:** R131

## Further reading

- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
