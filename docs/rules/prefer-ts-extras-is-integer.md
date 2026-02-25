# prefer-ts-extras-is-integer

Prefer [`isInteger`](https://github.com/sindresorhus/ts-extras#isinteger) from `ts-extras` over `Number.isInteger(...)`.

This keeps predicate usage consistent with other `ts-extras` narrowing helpers.

## ❌ Incorrect

```ts
const isWhole = Number.isInteger(value);
```

## ✅ Correct

```ts
const isWhole = isInteger(value);
```

## What this rule reports

- `Number.isInteger(value)` call sites that can use `isInteger(value)`.

## Why this rule exists

`isInteger` standardizes whole-number validation with the rest of the `ts-extras` numeric predicate family.

- Numeric guard naming is consistent.
- Native/helper predicate mixing is reduced.
- Integer validation reads the same across services and packages.

## Behavior and migration notes

- Runtime behavior matches native `Number.isInteger`.
- Decimal numbers still return `false`.
- Numeric strings are not coerced to numbers.

## Additional examples

### ❌ Incorrect (additional scenario)

```ts
if (Number.isInteger(retryCount)) {
    useRetries(retryCount);
}
```

### ✅ Correct (additional scenario)

```ts
if (isInteger(retryCount)) {
    useRetries(retryCount);
}
```

### ✅ Correct (team-scale usage)

```ts
const whole = isInteger(userInput);
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-ts-extras-is-integer": "error",
        },
    },
];
```

## When not to use it

Disable this rule if your codebase requires direct `Number.isInteger` usage.

## Further reading

- [`ts-extras` README](https://github.com/sindresorhus/ts-extras)
- [`ts-extras` package reference](https://www.npmjs.com/package/ts-extras)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
