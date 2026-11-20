# prefer-ts-extras-array-last-index-of

Prefer [`arrayLastIndexOf`](https://github.com/sindresorhus/ts-extras/blob/main/source/array-last-index-of.ts) from `ts-extras` for direct `Array.prototype.lastIndexOf` calls.

## Targeted pattern scope

The receiver must be a native array, readonly array, or tuple. The rule checks the TypeScript declaration of `.lastIndexOf` and the types of its arguments.

## What this rule reports

A direct `.lastIndexOf(search)` call, optionally with a numeric or undefined `fromIndex`. Computed members, optional chains, spreads, and arguments with observable side effects are excluded.

## Why this rule exists

Use `arrayLastIndexOf` to search a readonly tuple backwards using a wider search type.

## ❌ Incorrect

```ts
const statuses = ["idle", "ready", "ready"] as const;
const index = statuses.lastIndexOf("ready");
```

## ✅ Correct

```ts
import { arrayLastIndexOf } from "ts-extras";

const statuses = ["idle", "ready", "ready"] as const;
const index = arrayLastIndexOf(statuses, "ready");
```

## Behavior and migration notes

The result is a numeric index, including `-1` for a missing item. The helper accepts a wider search type such as `unknown` when it contains the element type. Preserve the number of arguments. With `["idle", "ready"]`, omitting `fromIndex` searches from the end, while passing `undefined` starts at index zero.

The rule requires type information and a stable `ts-extras` 2.x or 3.x release. It reports without applying an edit. Review code that reassigns native methods before replacing the call.

## Additional examples

### ❌ Incorrect — Additional example

```ts
const statuses = ["idle", "ready", "ready"] as const;
const result = statuses.lastIndexOf("ready", 1);
```

### ✅ Correct — Additional example

```ts
import { arrayLastIndexOf } from "ts-extras";

const statuses = ["idle", "ready", "ready"] as const;
const result = arrayLastIndexOf(statuses, "ready", 1);
```

### ✅ Correct — Repository-wide usage

```ts
import { arrayLastIndexOf } from "ts-extras";

export const searchStatus = (statuses: readonly string[], candidate: unknown) =>
 arrayLastIndexOf(statuses, candidate);
```

## ESLint flat config example

```ts
import parser from "@typescript-eslint/parser";
import typefest from "eslint-plugin-typefest";

export default [
 {
  files: ["**/*.ts"],
  languageOptions: { parser, parserOptions: { projectService: true } },
  plugins: { typefest },
  rules: { "typefest/prefer-ts-extras-array-last-index-of": "warn" },
 },
];
```

## When not to use it

Leave this rule disabled if your project prefers direct native searches.

## Package documentation

ts-extras package documentation:

[`arrayLastIndexOf` implementation and overloads](https://github.com/sindresorhus/ts-extras/blob/main/source/array-last-index-of.ts)

> **Rule catalog ID:** R130

## Further reading

- [TypeScript Handbook on narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [ts-extras 2.0.0 release](https://github.com/sindresorhus/ts-extras/releases/tag/v2.0.0)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
