# prefer-ts-extras-is-defined-filter

Require `isDefined` from `ts-extras` in `Array.prototype.filter` callbacks instead of inline undefined checks.

## What this rule reports

- Inline undefined predicates inside `.filter(...)`, including:
  - `filter((value) => value !== undefined)`
  - `filter((value) => typeof value !== "undefined")`
  - `filter((value): value is T => value !== undefined)`

## Why this rule exists

`filter(isDefined)` is a canonical narrowing form that removes repeated callback boilerplate.

- Filter chains are shorter and easier to scan.
- Narrowing to defined values is consistent.
- Inline predicate duplication is eliminated.

## Behavior and migration notes

- `array.filter(isDefined)` keeps elements where value is not `undefined`.
- Manual predicate bodies with additional side effects should not be auto-converted.
- Non-filter undefined checks belong to `prefer-ts-extras-is-defined`.

## ❌ Incorrect

```ts
const values = inputs.filter((value) => value !== undefined);
```

## ✅ Correct

```ts
const values = inputs.filter(isDefined);
```

## Additional examples

### ❌ Incorrect (additional scenario)

```ts
const ids = maybeIds.filter((id) => id !== undefined);
```

### ✅ Correct (additional scenario)

```ts
const ids = maybeIds.filter(isDefined);
```

### ✅ Correct (team-scale usage)

```ts
const values = readings.filter(isDefined);
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-ts-extras-is-defined-filter": "error",
        },
    },
];
```

## When not to use it

Disable this rule if your filters intentionally use named local predicates for domain-specific semantics.

## Further reading

- [`ts-extras` README](https://github.com/sindresorhus/ts-extras)
- [`ts-extras` package reference](https://www.npmjs.com/package/ts-extras)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
