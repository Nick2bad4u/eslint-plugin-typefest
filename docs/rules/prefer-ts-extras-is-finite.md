# prefer-ts-extras-is-finite

Prefer [`isFinite`](https://github.com/sindresorhus/ts-extras#isfinite) from `ts-extras` over `Number.isFinite(...)`.

This keeps predicate usage consistent with other `ts-extras` narrowing helpers.

## ❌ Incorrect

```ts
const isValid = Number.isFinite(value);
```

## ✅ Correct

```ts
const isValid = isFinite(value);
```

## What this rule reports

- `Number.isFinite(value)` call sites that can use `isFinite(value)`.

## Why this rule exists

`isFinite` keeps numeric predicate usage aligned with the rest of the `ts-extras` guard set.

- Numeric validation helpers use one naming/style convention.
- Native/helper mixing in guard-heavy code is reduced.
- Number guard logic stays consistent across modules.

## Behavior and migration notes

- Runtime behavior matches native `Number.isFinite`.
- Only numbers are considered; numeric strings are not coerced.
- `NaN`, `Infinity`, and `-Infinity` still return `false`.

## Additional examples

### ❌ Incorrect (additional scenario)

```ts
if (Number.isFinite(metric)) {
    consume(metric);
}
```

### ✅ Correct (additional scenario)

```ts
if (isFinite(metric)) {
    consume(metric);
}
```

### ✅ Correct (team-scale usage)

```ts
const valid = isFinite(durationMs);
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-ts-extras-is-finite": "error",
        },
    },
];
```

## When not to use it

Disable this rule if your team explicitly standardizes on native `Number.isFinite` calls.

## Further reading

- [`ts-extras` README](https://github.com/sindresorhus/ts-extras)
- [`ts-extras` package reference](https://www.npmjs.com/package/ts-extras)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
