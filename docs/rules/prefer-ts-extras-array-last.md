# prefer-ts-extras-array-last

Require `arrayLast()` from `ts-extras` over direct `array[array.length - 1]` access.

## Rule details

This rule aligns your runtime code with `ts-extras`, which describes these helpers as strongly-typed alternatives to native operations and predicates.

Using the helper function in one standard form improves readability, preserves stronger type information, and reduces ad-hoc inline checks.
## What it checks

- Array-like element access using `array[array.length - 1]`.

## Why

`arrayLast()` provides stronger typing for tuples and readonly arrays, and it keeps last-element access aligned with other `ts-extras` helper rules in this plugin.

## ❌ Incorrect

```ts
const last = values[values.length - 1];
```

## ✅ Correct

```ts
const last = arrayLast(values);
```

## Upstream terminology and benefits

`ts-extras` describes itself as **"Essential utilities for TypeScript projects"**.

Unlike `type-fest` (types only), `ts-extras` functions run at runtime and are compiled into JavaScript.

For this rule, the canonical helper is **`arrayLast`**: `arrayLast` returns the last item with stronger tuple typing.

Using one canonical helper across the codebase reduces custom one-off checks and improves readability for code reviewers.

## Additional examples

### ❌ Incorrect (additional scenario)

```ts
// Non-canonical pattern repeated inline across modules.
const last = rows[rows.length - 1];
```

### ✅ Correct (additional scenario)

```ts
// Use the canonical ts-extras utility for consistent intent and typing.
const last = arrayLast(rows);
```

### ✅ Correct (team-scale usage)

```ts
// Repeat the same canonical pattern across modules to keep APIs predictable.
const lastStep = arrayLast(steps);
```

## Why this helps in real projects

- **Consistent runtime behavior:** one helper per operation keeps assertions, guards, and collection checks aligned.
- **Better narrowing signals:** reviewers and maintainers can recognize established `ts-extras` guard semantics immediately.
- **Lower maintenance risk:** replacing ad-hoc utility variants with canonical helpers reduces drift across services and packages.

## Adoption tips

1. Start with the most common call sites in hot paths and shared utilities.
2. Replace repetitive inline predicates/checks with the canonical helper shown in this doc.
3. Re-run tests after adoption to confirm behavior and narrowing expectations.
4. If your team has wrapper utilities, align wrappers to call the canonical helper or deprecate duplicates.

### Rollout strategy

- Enable this rule in warning mode first to estimate rollout size.
- Apply fixes in small batches (per package or folder) to keep reviews readable.
- Switch to error mode after the baseline is cleaned up.

## Rule behavior and fixes

- This rule reports non-canonical usage patterns and points you to the canonical helper/type.
- Fix availability depends on the exact pattern matched by the rule implementation.
- When a safe auto-fix is available, ESLint can apply it directly. Otherwise, the rule provides a deterministic manual replacement pattern in the examples above.
- For large rollouts, run ESLint with fixes enabled and then review the diff for edge cases.

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

For broader adoption, you can also start from `typefest.configs.strict`
or `typefest.configs.all` and then override this rule as needed.

## Frequently asked questions

### Why not keep native checks/methods everywhere?

This plugin favors `ts-extras` because it provides strongly-typed runtime helpers with consistent naming. That consistency improves readability and reduces repeated custom guard logic across modules.

### Does this change runtime output?

`ts-extras` helpers are runtime functions, so they are emitted in JavaScript. The goal of this rule is not to remove runtime behavior, but to standardize and strengthen it.
## When not to use it

You may disable this rule if your project intentionally avoids runtime helper dependencies, or if you are writing compatibility code where the native built-in form is required for interop constraints.

## Further reading

- [`ts-extras` README](https://github.com/sindresorhus/ts-extras)
- [`ts-extras` package reference](https://www.npmjs.com/package/ts-extras)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

