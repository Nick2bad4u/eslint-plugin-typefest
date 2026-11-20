# prefer-ts-extras-array-index-of

Prefer [`arrayIndexOf`](https://github.com/sindresorhus/ts-extras/blob/main/source/array-index-of.ts) from `ts-extras` for direct `Array.prototype.indexOf` calls.

## Targeted pattern scope

The receiver must be a native array, readonly array, or tuple. The rule checks the TypeScript declaration of `.indexOf` and the types of its arguments.

## What this rule reports

A direct `.indexOf(search)` call, optionally with a numeric or undefined `fromIndex`. Computed members, optional chains, spreads, and arguments with observable side effects are excluded.

## Why this rule exists

Use `arrayIndexOf` to find an item in a readonly tuple using a wider search type.

## ❌ Incorrect

```ts
const statuses = ["idle", "ready", "ready"] as const;
const index = statuses.indexOf("ready");
```

## ✅ Correct

```ts
import { arrayIndexOf } from "ts-extras";

const statuses = ["idle", "ready", "ready"] as const;
const index = arrayIndexOf(statuses, "ready");
```

## Behavior and migration notes

The result is a numeric index, including `-1` for a missing item. The helper accepts a wider search type such as `unknown` when it contains the element type. Pass an existing `fromIndex` through unchanged to preserve the starting position.

The rule requires type information and a stable `ts-extras` 2.x or 3.x release. It reports without applying an edit. Review code that reassigns native methods before replacing the call.

## Additional examples

### ❌ Incorrect — Additional example

```ts
const statuses = ["idle", "ready", "ready"] as const;
const result = statuses.indexOf("ready", 1);
```

### ✅ Correct — Additional example

```ts
import { arrayIndexOf } from "ts-extras";

const statuses = ["idle", "ready", "ready"] as const;
const result = arrayIndexOf(statuses, "ready", 1);
```

### ✅ Correct — Repository-wide usage

```ts
import { arrayIndexOf } from "ts-extras";

export const searchStatus = (statuses: readonly string[], candidate: unknown) =>
 arrayIndexOf(statuses, candidate);
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
  rules: { "typefest/prefer-ts-extras-array-index-of": "warn" },
 },
];
```

## When not to use it

Leave this rule disabled if your project prefers direct native searches.

## Package documentation

ts-extras package documentation:

[`arrayIndexOf` implementation and overloads](https://github.com/sindresorhus/ts-extras/blob/main/source/array-index-of.ts)

> **Rule catalog ID:** R128

## Further reading

- [TypeScript Handbook on narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [ts-extras 2.0.0 release](https://github.com/sindresorhus/ts-extras/releases/tag/v2.0.0)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
