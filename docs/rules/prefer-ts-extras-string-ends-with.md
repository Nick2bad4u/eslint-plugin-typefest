# prefer-ts-extras-string-ends-with

Prefer [`stringEndsWith`](https://github.com/sindresorhus/ts-extras/blob/main/source/string-ends-with.ts) from `ts-extras` for direct `String.prototype.endsWith` calls.

## Targeted pattern scope

The receiver must be a primitive string. The rule checks the TypeScript declaration of `.endsWith` and the types of its arguments.

## What this rule reports

A direct `.endsWith(search)` call, optionally with a numeric or undefined `endPosition`. Computed members, optional chains, spreads, and arguments with observable side effects are excluded.

## Why this rule exists

Use `stringEndsWith` to narrow a string to a template literal ending with a known suffix.

## ❌ Incorrect

```ts
declare const filename: string;
const matches = filename.endsWith(".json");
```

## ✅ Correct

```ts
import { stringEndsWith } from "ts-extras";

declare const filename: string;
const matches = stringEndsWith(filename, ".json");
```

## Behavior and migration notes

Passing a single literal search string can narrow the receiver in the true branch. A dynamic search string or an explicit position selects the boolean overload.

The rule requires type information and a stable `ts-extras` 2.x or 3.x release. It reports without applying an edit. Review code that reassigns native methods before replacing the call.

## Additional examples

### ❌ Incorrect — Additional example

```ts
declare const filename: string;
const result = filename.endsWith(".json", 1);
```

### ✅ Correct — Additional example

```ts
import { stringEndsWith } from "ts-extras";

declare const filename: string;
const result = stringEndsWith(filename, ".json", 1);
```

### ✅ Correct — Repository-wide usage

```ts
import { stringEndsWith } from "ts-extras";

export const matchesFilename = (filename: string) =>
 stringEndsWith(filename, ".json");
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
  rules: { "typefest/prefer-ts-extras-string-ends-with": "warn" },
 },
];
```

## When not to use it

Leave this rule disabled if your project prefers direct native searches.

## Package documentation

ts-extras package documentation:

[`stringEndsWith` implementation and overloads](https://github.com/sindresorhus/ts-extras/blob/main/source/string-ends-with.ts)

> **Rule catalog ID:** R135

## Further reading

- [TypeScript Handbook on narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [ts-extras 2.0.0 release](https://github.com/sindresorhus/ts-extras/releases/tag/v2.0.0)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
