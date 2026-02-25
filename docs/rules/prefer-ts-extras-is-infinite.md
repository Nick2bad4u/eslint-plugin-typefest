# prefer-ts-extras-is-infinite

Require `isInfinite()` from `ts-extras` over direct Infinity equality checks.

## What this rule reports

- Direct infinity equality checks:
  - `value === Infinity`
  - `value === Number.POSITIVE_INFINITY`
  - `value === Number.NEGATIVE_INFINITY`

## Why this rule exists

`isInfinite` replaces constant-based comparisons with one explicit predicate.

- Infinity checks follow one helper pattern.
- Mixed positive/negative infinity comparisons are normalized.
- Numeric guard code is easier to audit.

## Behavior and migration notes

- `isInfinite(value)` covers both `Infinity` and `-Infinity`.
- Finite numbers and `NaN` return `false`.
- This rule targets direct equality checks, not broader numeric validation chains.

## ❌ Incorrect

```ts
const infinite = value === Infinity || value === Number.NEGATIVE_INFINITY;
```

## ✅ Correct

```ts
const infinite = isInfinite(value);
```

## Additional examples

### ❌ Incorrect (additional scenario)

```ts
const bad = value === Infinity || value === Number.NEGATIVE_INFINITY;
```

### ✅ Correct (additional scenario)

```ts
const bad = isInfinite(value);
```

### ✅ Correct (team-scale usage)

```ts
if (isInfinite(rate)) {
    throw new Error("invalid rate");
}
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-ts-extras-is-infinite": "error",
        },
    },
];
```

## When not to use it

Disable this rule if direct infinity constant comparisons are required in generated code.

## Further reading

- [`ts-extras` README](https://github.com/sindresorhus/ts-extras)
- [`ts-extras` package reference](https://www.npmjs.com/package/ts-extras)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
