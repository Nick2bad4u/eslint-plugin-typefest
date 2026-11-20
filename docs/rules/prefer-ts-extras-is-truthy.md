# prefer-ts-extras-is-truthy

Use a truthiness type guard when an array filter can produce a more precise element type.

## Targeted pattern scope

The rule matches a direct `array.filter(Boolean)` call on a standard array, readonly array, or tuple. It checks the global `Boolean` binding and the resolved standard-library filter signature.

## What this rule reports

It reports when `filter(Boolean)` leaves `unknown` or statically removable falsy members in the element type. This includes `false`, `0`, `0n`, the empty string, `null`, and `undefined`. Custom filters, shadowed callbacks, typed arrays, and broad `string[]` or `number[]` results are skipped.

## Why this rule exists

The builtin Boolean constructor returns `boolean`. A type-predicate callback can tell TypeScript which members survive. Runtime filtering still tests each element for truthiness.

## ❌ Incorrect

```ts
declare const labels: readonly (string | undefined)[];
const presentLabels = labels.filter(Boolean);
```

## ✅ Correct

```ts
import { isTruthy } from "ts-extras";

declare const labels: readonly (string | undefined)[];
const presentLabels = labels.filter(isTruthy);
```

## Behavior and migration notes

Use the helper as a positive filter predicate. Upstream recommends ordinary truthiness checks in `if`/`else` because TypeScript cannot express the falsy subset of broad `string`, `number`, and `bigint` types in the negative branch. The diagnostic leaves the edit to the developer. The rule requires a stable `ts-extras` 2.x or 3.x release and type-aware linting.

## Additional examples

### ❌ Incorrect — Additional example

```ts
declare const states: readonly (false | "ready")[];
const ready = states.filter(Boolean);
```

### ✅ Correct — Additional example

```ts
import { isTruthy } from "ts-extras";

declare const states: readonly (false | "ready")[];
const ready = states.filter(isTruthy);
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
 {
  plugins: { typefest },
  rules: {
   "typefest/prefer-ts-extras-is-truthy": "warn",
  },
 },
];
```

## When not to use it

Enable this rule in projects that use `ts-extras` and want to adopt its narrowing helpers.

## Package documentation

ts-extras package documentation:

Source file: [`source/is-truthy.ts`](https://github.com/sindresorhus/ts-extras/blob/main/source/is-truthy.ts)

> **Rule catalog ID:** R133

## Further reading

- [TypeScript Handbook on narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [`ts-extras` API](https://github.com/sindresorhus/ts-extras#api)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
