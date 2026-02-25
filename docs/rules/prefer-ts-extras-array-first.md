# prefer-ts-extras-array-first

Require `arrayFirst()` from `ts-extras` over direct `array[0]` access.

## What this rule reports

- Direct first-element access using index form (`array[0]`).

## Why this rule exists

`arrayFirst` makes first-element access explicit and keeps tuple/readonly inference consistent with the rest of the `ts-extras` helper set.

- First-element lookups are easier to search and standardize.
- Tuple-aware access patterns are consistent in shared utilities.
- Teams avoid mixing helper-based and index-based first-item access.

## Behavior and migration notes

- Runtime behavior matches `array[0]` access.
- Empty arrays still yield `undefined`.
- This rule targets index access; optional chaining around access (`array?.[0]`) should be reviewed manually during migration.

## ❌ Incorrect

```ts
const first = values[0];
```

## ✅ Correct

```ts
const first = arrayFirst(values);
```

## Additional examples

### ❌ Incorrect (additional scenario)

```ts
const first = rows[0];
```

### ✅ Correct (additional scenario)

```ts
const first = arrayFirst(rows);
```

### ✅ Correct (team-scale usage)

```ts
const header = arrayFirst(headers);
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-ts-extras-array-first": "error",
        },
    },
];
```

## When not to use it

Disable this rule if direct index access is required in performance-sensitive hotspots.

## Further reading

- [`ts-extras` README](https://github.com/sindresorhus/ts-extras)
- [`ts-extras` package reference](https://www.npmjs.com/package/ts-extras)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
