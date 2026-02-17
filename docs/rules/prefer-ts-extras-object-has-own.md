# prefer-ts-extras-object-has-own

Require `objectHasOwn` from `ts-extras` over `Object.hasOwn` when checking own properties.

## Rule details

This rule aligns your runtime code with `ts-extras`, which describes these helpers as strongly-typed alternatives to native operations and predicates.

Using the helper function in one standard form improves readability, preserves stronger type information, and reduces ad-hoc inline checks.
## What it checks

- Calls to `Object.hasOwn(...)` in runtime source files and typed rule fixtures.

## Why

`objectHasOwn` is a type guard that narrows the object to include the checked property. This makes downstream access safer and reduces manual casts after own-property checks.

## ❌ Incorrect

```ts
if (Object.hasOwn(record, key)) {
    console.log(record[key as keyof typeof record]);
}
```

## ✅ Correct

```ts
if (objectHasOwn(record, key)) {
    console.log(record[key]);
}
```

## Upstream terminology and benefits

`ts-extras` describes itself as **"Essential utilities for TypeScript projects"**.

Unlike `type-fest` (types only), `ts-extras` functions run at runtime and are compiled into JavaScript.

For this rule, the canonical helper is **`objectHasOwn`**: `objectHasOwn` is a strongly-typed version of `Object.hasOwn()` and narrows own-property access.

Using one canonical helper across the codebase reduces custom one-off checks and improves readability for code reviewers.

## Additional examples

### ❌ Incorrect (additional scenario)

```ts
// Legacy pattern repeated inline across modules.
if (Object.hasOwn(data, "id")) {
    console.log((data as { id: unknown }).id);
}
```

### ✅ Correct (additional scenario)

```ts
// Use the canonical ts-extras utility for consistent intent and typing.
if (objectHasOwn(data, "id")) {
    console.log(data.id);
}
```

### ✅ Correct (team-scale usage)

```ts
// Repeat the same canonical pattern across modules to keep APIs predictable.
const isOwn = objectHasOwn(record, field);
```

## Why this helps in real projects

- **Consistent runtime behavior:** one helper per operation keeps assertions, guards, and collection checks aligned.
- **Better narrowing signals:** reviewers and maintainers can recognize established `ts-extras` guard semantics immediately.
- **Lower maintenance risk:** replacing ad-hoc utility variants with canonical helpers reduces drift across services and packages.

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
            "typefest/prefer-ts-extras-object-has-own": "error",
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
