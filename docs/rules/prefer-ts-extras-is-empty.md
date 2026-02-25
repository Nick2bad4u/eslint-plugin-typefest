# prefer-ts-extras-is-empty

Require `isEmpty()` from `ts-extras` over direct `array.length === 0` checks.

## What this rule reports

- Direct empty-array checks using length equality:
  - `array.length === 0`
  - `0 === array.length`

## Why this rule exists

`isEmpty` gives one canonical emptiness predicate instead of repeated length comparisons.

- Emptiness checks are easier to search and standardize.
- Predicate style is consistent with other `ts-extras` guards.
- Repeated comparison variants are removed from call sites.

## Behavior and migration notes

- `isEmpty(array)` is equivalent to `array.length === 0`.
- Use `!isEmpty(array)` for non-empty checks.
- This rule is about array emptiness checks, not object key-count checks.

## ❌ Incorrect

```ts
if (items.length === 0) {
    return;
}
```

## ✅ Correct

```ts
if (isEmpty(items)) {
    return;
}
```

## Additional examples

### ❌ Incorrect (additional scenario)

```ts
if (items.length === 0) {
    return;
}
```

### ✅ Correct (additional scenario)

```ts
if (isEmpty(items)) {
    return;
}
```

### ✅ Correct (team-scale usage)

```ts
const hasRows = !isEmpty(rows);
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-ts-extras-is-empty": "error",
        },
    },
];
```

## When not to use it

Disable this rule if your team requires direct `.length` comparisons for emptiness checks.

## Further reading

- [`ts-extras` README](https://github.com/sindresorhus/ts-extras)
- [`ts-extras` package reference](https://www.npmjs.com/package/ts-extras)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
