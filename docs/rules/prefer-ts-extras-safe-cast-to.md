# prefer-ts-extras-safe-cast-to

Prefer [`safeCastTo`](https://github.com/sindresorhus/ts-extras#safecastto) from `ts-extras` over direct `as` assertions when the cast is already assignable.

## Rule details

This rule aligns your runtime code with `ts-extras`, which describes these helpers as strongly-typed alternatives to native operations and predicates.

Using the helper function in one standard form improves readability, preserves stronger type information, and reduces ad-hoc inline checks.
## What it checks

- `as` and angle-bracket (`<T>value`) assertions in runtime source files.
- Only assertions where the source expression type is assignable to the asserted target type.

## Why

`safeCastTo<T>(value)` keeps casts type-checked and prevents silently widening unsafe assertion patterns.

## ❌ Incorrect

```ts
const nameValue = "Alice" as string;
```

## ✅ Correct

```ts
const nameValue = safeCastTo<string>("Alice");
```

## Upstream terminology and benefits

`ts-extras` describes itself as **"Essential utilities for TypeScript projects"**.

Unlike `type-fest` (types only), `ts-extras` functions run at runtime and are compiled into JavaScript.

For this rule, the canonical helper is **`safeCastTo`**: `safeCastTo` constrains a value to a given type safely.

Using one canonical helper across the codebase reduces custom one-off checks and improves readability for code reviewers.

## Additional examples

### ❌ Incorrect (additional scenario)

```ts
// Avoid non-canonical patterns: safeCastTo
const resourceId = rawId as string;
```

### ✅ Correct (additional scenario)

```ts
// Use the canonical ts-extras utility for consistent intent and typing.
const resourceId = safeCastTo<string>(rawId);
```

### ✅ Correct (team-scale usage)

```ts
// Repeat the same canonical pattern across modules to keep APIs predictable.
const port = safeCastTo<number>(env.PORT);
```

## Why this helps in real projects

- **Consistent runtime semantics:** using one `ts-extras` helper style avoids a mix of native checks and custom wrappers.
- **Better narrowing ergonomics:** `ts-extras` helpers are designed as strongly-typed runtime utilities, making intent clearer to both TypeScript and code reviewers.
- **Faster maintenance:** refactors become easier when teams can search for one canonical helper instead of multiple ad-hoc patterns.

## Adoption and migration tips

1. Start with the most common call sites in hot paths and shared utilities.
2. Replace repetitive inline predicates/checks with the canonical helper shown in this doc.
3. Re-run tests after migration to confirm behavior and narrowing expectations.
4. If your team has wrapper utilities, either migrate wrappers to call the canonical helper or deprecate them to avoid duplication.

### Rollout strategy

- Enable this rule in warning mode first to estimate migration size.
- Apply fixes in small batches (per package or folder) to keep reviews readable.
- Switch to error mode after the baseline is cleaned up.

## Rule behavior and fixes

- This rule reports non-canonical usage patterns and points you to the canonical helper/type.
- Fix availability depends on the exact pattern matched by the rule implementation.
- When a safe auto-fix is available, ESLint can apply it directly. Otherwise, the rule provides a deterministic manual replacement pattern in the examples above.
- For large migrations, run ESLint with fixes enabled and then review the diff for edge cases.

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-ts-extras-safe-cast-to": "error",
        },
    },
];
```

For broader adoption, you can also start from `typefest.configs["flat/ts-extras"]`
or `typefest.configs["flat/ts-extras-experimental"]` and then override this rule as needed.

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
