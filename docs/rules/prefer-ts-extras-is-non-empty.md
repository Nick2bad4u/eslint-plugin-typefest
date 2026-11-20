# prefer-ts-extras-is-non-empty

Prefer [`isNonEmpty`](https://github.com/sindresorhus/ts-extras/blob/v3.0.0/source/is-non-empty.ts) when checking whether an array contains an element.

## Targeted pattern scope

The rule accepts `items.length > 0`, `items.length >= 1`, and `items.length !== 0`, including reversed operands and loose inequality against numeric zero. For unions of literal tuple lengths, an inequality against zero already narrows the length itself, so the rule leaves it alone.

## What this rule reports

A numeric comparison of a direct `.length` access on a mutable array, readonly array, tuple, or a union of those types. Strings, typed arrays, arbitrary objects with a length property, optional access and computed properties are outside the rule's scope.

## Why this rule exists

The helper narrows the array so TypeScript can safely read its first element with `noUncheckedIndexedAccess` enabled. The array element type can still include `undefined`.

## ❌ Incorrect

```ts
declare const items: readonly string[];

if (items.length > 0) {
 console.log(items[0]);
}
```

## ✅ Correct

```ts
import { isNonEmpty } from "ts-extras";

declare const items: readonly string[];

if (isNonEmpty(items)) {
 console.log(items[0]);
}
```

## Behavior and migration notes

The diagnostic requires type information and a stable `ts-extras` 2.x or 3.x release. The diagnostic leaves the edit to the developer. The helper changes TypeScript control-flow narrowing, including the type available in the false branch. The rule skips fixed tuple lengths that already determine the result.

## When not to use it

Disable this rule when your team prefers explicit length comparisons.

## Package documentation

ts-extras package documentation:

[Published `isNonEmpty` source](https://github.com/sindresorhus/ts-extras/blob/v3.0.0/source/is-non-empty.ts)

> **Rule catalog ID:** R132

## Further reading

- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
