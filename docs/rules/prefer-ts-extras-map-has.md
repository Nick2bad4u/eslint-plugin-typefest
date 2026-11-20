# prefer-ts-extras-map-has

Prefer [`mapHas`](https://github.com/sindresorhus/ts-extras/blob/main/source/map-has.ts) from `ts-extras` for direct `Map.prototype.has` calls.

## Targeted pattern scope

The receiver must be a native `Map` or `ReadonlyMap`. The rule checks the TypeScript declaration of `.has` and the types of its arguments.

## What this rule reports

A direct `.has(key)` call with a compatible key. Computed members, optional chains, spreads, and arguments with observable side effects are excluded.

## Why this rule exists

Use `mapHas` to narrow a candidate key when a lookup succeeds.

## ❌ Incorrect

```ts
const statusLabels = new Map([["ready", 1]]);
const present = statusLabels.has("ready");
```

## ✅ Correct

```ts
import { mapHas } from "ts-extras";

const statusLabels = new Map([["ready", 1]]);
const present = mapHas(statusLabels, "ready");
```

## Behavior and migration notes

For a key already assignable to the declared key type, the helper returns a boolean. A broader candidate such as `unknown` can narrow after a successful lookup. A failed lookup can also mean a key of the right type is absent. The rule skips wider key unions when the predicate could incorrectly exclude one of their members in the false branch.

The rule requires type information and a stable `ts-extras` 2.x or 3.x release. It reports without applying an edit. Review code that reassigns native methods before replacing the call.

## Additional examples

### ❌ Incorrect — Additional example

```ts
const statusLabels = new Map([["ready", 1]]);
declare const candidate: string;
const result = statusLabels.has(candidate);
```

### ✅ Correct — Additional example

```ts
import { mapHas } from "ts-extras";

const statusLabels = new Map([["ready", 1]]);
declare const candidate: string;
const result = mapHas(statusLabels, candidate);
```

### ✅ Correct — Repository-wide usage

```ts
import { mapHas } from "ts-extras";

export const hasStatus = (labels: ReadonlyMap<string, number>, key: unknown) =>
 mapHas(labels, key);
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
  rules: { "typefest/prefer-ts-extras-map-has": "warn" },
 },
];
```

## When not to use it

Leave this rule disabled if your project prefers direct native searches.

## Package documentation

ts-extras package documentation:

[`mapHas` implementation and overloads](https://github.com/sindresorhus/ts-extras/blob/main/source/map-has.ts)

> **Rule catalog ID:** R134

## Further reading

- [TypeScript Handbook on narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [ts-extras 2.0.0 release](https://github.com/sindresorhus/ts-extras/releases/tag/v2.0.0)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
