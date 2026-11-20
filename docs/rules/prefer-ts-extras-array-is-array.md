# prefer-ts-extras-array-is-array

Preserve array element types when narrowing an unknown value or a union containing a readonly array.

## Targeted pattern scope

The rule looks for a direct, one-argument call to the global `Array.isArray` whose signature comes from the TypeScript standard library.

## What this rule reports

It reports checks on `unknown`, readonly arrays, readonly tuples, and concrete unions containing a readonly array or tuple. It skips `any`, mutable-array-only cases, and unions with a naked type parameter such as `T | readonly T[]`.

## Why this rule exists

The builtin guard narrows `unknown` to `any[]`. The helper narrows it to `unknown[]`, so consumers must check each element before using it. For a union with a readonly array, the helper retains its element type and readonly operations.

## ❌ Incorrect

```ts
declare const input: string | readonly string[];

if (Array.isArray(input)) {
 console.log(input.length);
}
```

## ✅ Correct

```ts
import { arrayIsArray } from "ts-extras";

declare const input: string | readonly string[];

if (arrayIsArray(input)) {
 console.log(input.length);
}
```

## Behavior and migration notes

Review code that relied on mutating the narrowed array or accessing properties on unvalidated elements. Keep the builtin for `T | T[]` when `T` is unconstrained. Upstream documents that its conditional predicate cannot narrow that case to `T[]`. The diagnostic leaves the edit to the developer. The rule requires a stable `ts-extras` 2.x or 3.x release and type-aware linting.

## Additional examples

### ❌ Incorrect — Additional example

```ts
declare const payload: unknown;
if (Array.isArray(payload)) {
 console.log(payload.length);
}
```

### ✅ Correct — Additional example

```ts
import { arrayIsArray } from "ts-extras";

declare const payload: unknown;
if (arrayIsArray(payload)) {
 console.log(payload.length);
}
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
 {
  plugins: { typefest },
  rules: {
   "typefest/prefer-ts-extras-array-is-array": "warn",
  },
 },
];
```

## When not to use it

Enable this rule in projects that use `ts-extras` and want to adopt its narrowing helpers.

## Package documentation

ts-extras package documentation:

Source file: [`source/array-is-array.ts`](https://github.com/sindresorhus/ts-extras/blob/main/source/array-is-array.ts)

> **Rule catalog ID:** R129

## Further reading

- [TypeScript Handbook on narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [`ts-extras` API](https://github.com/sindresorhus/ts-extras#api)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
