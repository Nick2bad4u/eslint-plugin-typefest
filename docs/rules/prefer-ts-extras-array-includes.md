# prefer-ts-extras-array-includes

Prefer [`arrayIncludes`](https://github.com/sindresorhus/ts-extras#arrayincludes) from `ts-extras` over `array.includes(...)`.

`arrayIncludes(...)` improves inference and narrowing when checking whether unknown values belong to a known tuple/array.

## ❌ Incorrect

```ts
const hasStatus = statuses.includes(inputStatus);
```

## ✅ Correct

```ts
const hasStatus = arrayIncludes(statuses, inputStatus);
```

## What this rule reports

- `array.includes(value)` call sites that can use `arrayIncludes(array, value)`.

## Why this rule exists

`arrayIncludes` is especially useful when checking if an unknown value belongs to a known literal tuple.

- Membership checks can narrow candidate values in control flow.
- Guard logic is consistent with other `ts-extras` predicates.
- Native `.includes` call sites that need manual casts are reduced.

## Behavior and migration notes

- Runtime semantics follow native `Array.prototype.includes`.
- Comparison uses SameValueZero (`NaN` matches `NaN`, `+0` equals `-0`).
- Return type remains boolean, with improved narrowing behavior when array values are literal unions.

## Additional examples

### ❌ Incorrect (additional scenario)

```ts
if (roles.includes(candidate)) {
    grantAccess(candidate);
}
```

### ✅ Correct (additional scenario)

```ts
if (arrayIncludes(roles, candidate)) {
    grantAccess(candidate);
}
```

### ✅ Correct (team-scale usage)

```ts
const isKnownStatus = arrayIncludes(statuses, value);
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-ts-extras-array-includes": "error",
        },
    },
];
```

## When not to use it

Disable this rule if your codebase intentionally standardizes on native `.includes()`.

## Further reading

- [`ts-extras` README](https://github.com/sindresorhus/ts-extras)
- [`ts-extras` package reference](https://www.npmjs.com/package/ts-extras)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
