# prefer-ts-extras-array-find-last

Prefer [`arrayFindLast`](https://github.com/sindresorhus/ts-extras#arrayfindlast) from `ts-extras` over `array.findLast(...)`.

`arrayFindLast(...)` improves predicate inference and value narrowing in typed arrays.

## ❌ Incorrect

```ts
const monitor = monitors.findLast((entry) => entry.id === targetId);
```

## ✅ Correct

```ts
const monitor = arrayFindLast(monitors, (entry) => entry.id === targetId);
```

## What this rule reports

- `array.findLast(predicate)` call sites that can use `arrayFindLast(array, predicate)`.

## Why this rule exists

`arrayFindLast` makes reverse-direction predicate lookups explicit and keeps them aligned with the `ts-extras` helper style.

- Reverse scans are easier to spot during code review.
- Call signatures stay consistent with `arrayFind` / `arrayFindLastIndex`.
- Utility code that depends on "latest match" is easier to audit.

## Behavior and migration notes

- Runtime behavior matches native `Array.prototype.findLast`.
- Search direction remains right-to-left.
- Result is the matching element, or `undefined` if no match exists.

## Additional examples

### ❌ Incorrect (additional scenario)

```ts
const latest = events.findLast((entry) => entry.type === "login");
```

### ✅ Correct (additional scenario)

```ts
const latest = arrayFindLast(events, (entry) => entry.type === "login");
```

### ✅ Correct (team-scale usage)

```ts
const trailingError = arrayFindLast(logs, (entry) => entry.level === "error");
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-ts-extras-array-find-last": "error",
        },
    },
];
```

## When not to use it

Disable this rule if your team intentionally uses native `.findLast()` everywhere.

## Further reading

- [`ts-extras` README](https://github.com/sindresorhus/ts-extras)
- [`ts-extras` package reference](https://www.npmjs.com/package/ts-extras)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
