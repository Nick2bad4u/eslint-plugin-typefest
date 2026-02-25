# prefer-ts-extras-is-safe-integer

Prefer [`isSafeInteger`](https://github.com/sindresorhus/ts-extras#issafeinteger) from `ts-extras` over `Number.isSafeInteger(...)`.

This keeps predicate usage consistent with other `ts-extras` narrowing helpers.

## ❌ Incorrect

```ts
const isSafe = Number.isSafeInteger(value);
```

## ✅ Correct

```ts
const isSafe = isSafeInteger(value);
```

## What this rule reports

- `Number.isSafeInteger(value)` call sites that can use `isSafeInteger(value)`.

## Why this rule exists

`isSafeInteger` standardizes safe-integer validation and keeps numeric guard usage consistent with other `ts-extras` helpers.

- Safety-bound checks use one helper convention.
- Predicate style is consistent with `isInteger` and `isFinite`.
- Guard code for IDs/counters avoids mixed native/helper forms.

## Behavior and migration notes

- Runtime behavior matches native `Number.isSafeInteger`.
- Values outside `Number.MIN_SAFE_INTEGER` / `Number.MAX_SAFE_INTEGER` return `false`.
- Non-number values are not coerced.

## Additional examples

### ❌ Incorrect (additional scenario)

```ts
if (Number.isSafeInteger(quantity)) {
    persist(quantity);
}
```

### ✅ Correct (additional scenario)

```ts
if (isSafeInteger(quantity)) {
    persist(quantity);
}
```

### ✅ Correct (team-scale usage)

```ts
const supported = isSafeInteger(index);
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-ts-extras-is-safe-integer": "error",
        },
    },
];
```

## When not to use it

Disable this rule if your team enforces native `Number.isSafeInteger` calls.

## Further reading

- [`ts-extras` README](https://github.com/sindresorhus/ts-extras)
- [`ts-extras` package reference](https://www.npmjs.com/package/ts-extras)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
