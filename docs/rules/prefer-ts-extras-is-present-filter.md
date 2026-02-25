# prefer-ts-extras-is-present-filter

Require `isPresent` from `ts-extras` in `Array.prototype.filter` callbacks instead of inline nullish checks.

## What this rule reports

- Inline nullish predicates inside `.filter(...)`, including:
  - `filter((value) => value != null)`
  - `filter((value): value is T => value !== null)`
  - `filter((value): value is T => value !== null && value !== undefined)`

## Why this rule exists

`filter(isPresent)` is the canonical pattern for removing nullish values in pipelines.

- Filtering logic is consistent across collections.
- Non-nullish narrowing is explicit in one helper name.
- Repeated null/undefined callback expressions are removed.

## Behavior and migration notes

- `array.filter(isPresent)` removes `null` and `undefined` entries.
- Callbacks with extra side effects should be reviewed before replacement.
- Non-filter nullish checks belong to `prefer-ts-extras-is-present`.

## ❌ Incorrect

```ts
const values = inputs.filter((value) => value != null);
```

## ✅ Correct

```ts
const values = inputs.filter(isPresent);
```

## Additional examples

### ❌ Incorrect (additional scenario)

```ts
const rows = maybeRows.filter((row) => row != null);
```

### ✅ Correct (additional scenario)

```ts
const rows = maybeRows.filter(isPresent);
```

### ✅ Correct (team-scale usage)

```ts
const values = list.filter(isPresent);
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-ts-extras-is-present-filter": "error",
        },
    },
];
```

## When not to use it

Disable this rule if your filters intentionally use domain-specific predicate wrappers.

## Further reading

- [`ts-extras` README](https://github.com/sindresorhus/ts-extras)
- [`ts-extras` package reference](https://www.npmjs.com/package/ts-extras)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
