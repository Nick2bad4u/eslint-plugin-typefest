# prefer-ts-extras-assert-present

Require `assertPresent()` from `ts-extras` over manual `== null` throw guards.

## Rule details

This rule aligns your runtime code with `ts-extras`, which describes these helpers as strongly-typed alternatives to native operations and predicates.

Using the helper function in one standard form improves readability, preserves stronger type information, and reduces ad-hoc inline checks.

## What it checks

- `if (value == null) { throw ... }`
- `if (value === null || value === undefined) { throw ... }`
- `if (value === undefined || value === null) { throw ... }`

Only `if` statements that have no `else` branch and a throw-only consequent are
reported.

### Detection boundaries

- ✅ Reports nullish guards written as `== null` or explicit `null/undefined` OR checks.
- ❌ Does not report a `null`-only guard (`value === null`) or `undefined`-only guard.
- ❌ Does not report branches that do more than throw.
- ❌ Does not auto-fix.

## Why

`assertPresent()` communicates nullish-assertion intent and provides a reusable narrowing helper.

This is a high-signal utility for request handlers and parsing layers where
nullable inputs are common.

## ❌ Incorrect

```ts
if (payload == null) {
    throw new Error("Missing payload");
}
```

## ✅ Correct

```ts
assertPresent(payload);
```

## Upstream terminology and benefits

`ts-extras` describes itself as **"Essential utilities for TypeScript projects"**.

Unlike `type-fest` (types only), `ts-extras` functions run at runtime and are compiled into JavaScript.

For this rule, the canonical helper is **`assertPresent`**: `assertPresent` asserts that a value is present (neither `null` nor `undefined`).

Using one canonical helper across the codebase reduces custom one-off checks and improves readability for code reviewers.

## Additional examples

### ❌ Incorrect (additional scenario)

```ts
if (input === null || input === undefined) {
    throw new TypeError("input is required");
}
```

### ✅ Correct (additional scenario)

```ts
assertPresent(input);
```

### ✅ Correct (team-scale usage)

```ts
assertPresent(currentUser);
assertPresent(sessionId);
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

- Reports explicit nullish-guard throw blocks in `if` statements.
- Does not provide autofix or suggestions.

Replacement pattern:

```ts
if (payload == null) {
    throw new TypeError("payload required");
}

// becomes
assertPresent(payload);
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-ts-extras-assert-present": "error",
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


