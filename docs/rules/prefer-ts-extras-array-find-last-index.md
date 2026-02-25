# prefer-ts-extras-array-find-last-index

Prefer [`arrayFindLastIndex`](https://github.com/sindresorhus/ts-extras#arrayfindlastindex) from `ts-extras` over `array.findLastIndex(...)`.

`arrayFindLastIndex(...)` improves predicate inference in typed arrays.

## ❌ Incorrect

```ts
const index = monitors.findLastIndex((entry) => entry.id === targetId);
```

## ✅ Correct

```ts
const index = arrayFindLastIndex(monitors, (entry) => entry.id === targetId);
```

## What this rule reports

- `array.findLastIndex(predicate)` call sites that can use `arrayFindLastIndex(array, predicate)`.

## Why this rule exists

`arrayFindLastIndex` standardizes reverse index lookup and keeps call signatures aligned with other `ts-extras` search helpers.

- Reverse index scans are explicit at the call site.
- Search code avoids mixed native/helper patterns.
- Index-based follow-up logic stays uniform across modules.

## Behavior and migration notes

- Runtime behavior matches native `Array.prototype.findLastIndex`.
- Search still proceeds from right to left.
- If no element matches, the result is `-1`.

## Additional examples

### ❌ Incorrect (additional scenario)

```ts
const index = logs.findLastIndex((entry) => entry.level === "warn");
```

### ✅ Correct (additional scenario)

```ts
const index = arrayFindLastIndex(logs, (entry) => entry.level === "warn");
```

### ✅ Correct (team-scale usage)

```ts
const retryIndex = arrayFindLastIndex(attempts, (attempt) => !attempt.success);
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-ts-extras-array-find-last-index": "error",
        },
    },
];
```

## When not to use it

Disable this rule if your codebase has standardized on native `.findLastIndex()`.

## Further reading

- [`ts-extras` README](https://github.com/sindresorhus/ts-extras)
- [`ts-extras` package reference](https://www.npmjs.com/package/ts-extras)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
