# prefer-ts-extras-array-last

Require `arrayLast()` from `ts-extras` over direct `array[array.length - 1]` access.

## What this rule reports

- Direct last-element index patterns (`array[array.length - 1]`).

## Why this rule exists

`arrayLast` makes last-element access explicit and keeps type inference behavior consistent with other `ts-extras` array helpers.

- Last-element access is easier to audit in large codebases.
- Tuple/readonly array access patterns are standardized.
- Helper-driven access reduces repeated inline index arithmetic.

## Behavior and migration notes

- Runtime behavior matches `array[array.length - 1]`.
- Empty arrays still produce `undefined`.
- Equivalent index expressions with extra wrappers should be reviewed manually during migration.

## ❌ Incorrect

```ts
const last = values[values.length - 1];
```

## ✅ Correct

```ts
const last = arrayLast(values);
```

## Additional examples

### ❌ Incorrect (additional scenario)

```ts
const last = rows[rows.length - 1];
```

### ✅ Correct (additional scenario)

```ts
const last = arrayLast(rows);
```

### ✅ Correct (team-scale usage)

```ts
const lastStep = arrayLast(steps);
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-ts-extras-array-last": "error",
        },
    },
];
```

## When not to use it

Disable this rule if direct index expressions are mandated by local style rules.

## Further reading

- [`ts-extras` README](https://github.com/sindresorhus/ts-extras)
- [`ts-extras` package reference](https://www.npmjs.com/package/ts-extras)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
