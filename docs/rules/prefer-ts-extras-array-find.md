# prefer-ts-extras-array-find

Prefer [`arrayFind`](https://github.com/sindresorhus/ts-extras#arrayfind) from `ts-extras` over `array.find(...)`.

`arrayFind(...)` improves predicate inference and value narrowing in typed arrays.

## ❌ Incorrect

```ts
const monitor = monitors.find((entry) => entry.id === targetId);
```

## ✅ Correct

```ts
const monitor = arrayFind(monitors, (entry) => entry.id === targetId);
```

## What this rule reports

- `array.find(predicate)` call sites that can use `arrayFind(array, predicate)`.

## Why this rule exists

`arrayFind` keeps predicate-driven lookup aligned with the other `ts-extras` helper APIs and improves inference in generic code.

- Predicate call sites are standardized across modules.
- Result types are easier to follow in utility layers.
- Local type assertions after `find` calls are reduced.

## Behavior and migration notes

- Runtime behavior matches native `Array.prototype.find`.
- Search still returns the first matching element.
- If no element matches, the result is `undefined`.

## Additional examples

### ❌ Incorrect (additional scenario)

```ts
const user = users.find((item) => item.id === userId);
```

### ✅ Correct (additional scenario)

```ts
const user = arrayFind(users, (item) => item.id === userId);
```

### ✅ Correct (team-scale usage)

```ts
const firstError = arrayFind(logs, (entry) => entry.level === "error");
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-ts-extras-array-find": "error",
        },
    },
];
```

## When not to use it

Disable this rule if your team requires native `.find()` for consistency with existing shared APIs.

## Further reading

- [`ts-extras` README](https://github.com/sindresorhus/ts-extras)
- [`ts-extras` package reference](https://www.npmjs.com/package/ts-extras)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
