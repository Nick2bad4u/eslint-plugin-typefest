# prefer-ts-extras-object-keys

Prefer [`objectKeys`](https://github.com/sindresorhus/ts-extras#objectkeys) from `ts-extras` over `Object.keys(...)`.

`objectKeys(...)` preserves stronger key typing and avoids repeated casts in iteration paths.

## ❌ Incorrect

```ts
const keys = Object.keys(monitorConfig);
```

## ✅ Correct

```ts
const keys = objectKeys(monitorConfig);
```

## What this rule reports

- `Object.keys(value)` call sites that can use `objectKeys(value)`.

## Why this rule exists

`objectKeys` improves key typing for indexed access and iteration paths.

- Fewer `as Array<keyof T>` casts in loops.
- Safer indexed reads after key iteration.
- One canonical helper for key iteration patterns.

## Behavior and migration notes

- Runtime semantics align with `Object.keys` (own enumerable string keys only).
- Symbol keys are excluded, same as native behavior.
- Numeric keys are still returned as strings, matching native output.

## Additional examples

### ❌ Incorrect (additional scenario)

```ts
const keys = Object.keys(model);
```

### ✅ Correct (additional scenario)

```ts
const keys = objectKeys(model);
```

### ✅ Correct (team-scale usage)

```ts
for (const key of objectKeys(theme)) {
    void key;
}
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-ts-extras-object-keys": "error",
        },
    },
];
```

## When not to use it

Disable this rule if you must keep direct `Object.keys` calls for interop constraints.

## Further reading

- [`ts-extras` README](https://github.com/sindresorhus/ts-extras)
- [`ts-extras` package reference](https://www.npmjs.com/package/ts-extras)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
