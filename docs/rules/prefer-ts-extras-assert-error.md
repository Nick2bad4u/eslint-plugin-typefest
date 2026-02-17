# prefer-ts-extras-assert-error

Require `assertError()` from `ts-extras` over manual `instanceof Error` throw
guards.

## Rule details

This rule aligns runtime error assertions with `ts-extras`, which describes
itself as **"Essential utilities for TypeScript projects"**.

Using one assertion helper (`assertError`) keeps unknown-error handling
consistent and easier to review across code paths.

## What it checks

- `if (!(value instanceof Error)) { throw ... }`

Only `if` statements with no `else` branch and a throw-only consequent are
reported.

### Detection boundaries

- ✅ Reports negative `instanceof Error` guards wrapped in `!()`.
- ❌ Does not report positive-form patterns like
  `if (value instanceof Error) { ... } else { throw ... }`.
- ❌ Does not report checks against custom error classes in this rule.
- ❌ Does not auto-fix.

## Why

`assertError()` communicates intent directly: "this value must be an `Error`".
That reduces repetitive custom guard code in `catch` pipelines.

## ❌ Incorrect

```ts
if (!(error instanceof Error)) {
    throw new TypeError("Expected Error");
}
```

## ✅ Correct

```ts
assertError(error);
```

## Upstream terminology and benefits

`ts-extras` describes itself as **"Essential utilities for TypeScript projects"**.

`ts-extras` utilities are runtime helpers designed for predictable behavior with strong TypeScript narrowing support.

Standardizing on canonical helper names lowers cognitive overhead and makes refactors and onboarding easier.

## Additional examples

### ❌ Incorrect (additional scenario)

```ts
if (!(reason instanceof Error)) {
    throw new TypeError("Expected Error instance");
}
```

### ✅ Correct (additional scenario)

```ts
assertError(reason);
```

### ✅ Correct (team-scale usage)

```ts
assertError(caughtValue);
assertError(lastFailureReason);
```

## Why this helps in real projects

- **Consistent runtime behavior:** one helper per operation keeps assertions, guards, and collection checks aligned.
- **Better narrowing signals:** reviewers and maintainers can recognize established `ts-extras` guard semantics immediately.
- **Lower maintenance risk:** replacing ad-hoc utility variants with canonical helpers reduces drift across services and packages.

## Adoption and migration tips

1. Start in boundary layers (`catch`, message handlers, job workers).
2. Replace repeated `instanceof Error` throw guards with `assertError(...)`.
3. Re-run tests to validate any intentional differences in thrown error types.

### Rollout strategy

- Enable in warning mode first.
- Migrate folder-by-folder to keep PRs readable.
- Promote to error once baseline cleanup is complete.

## Rule behavior and fixes

- Reports negative `instanceof Error` throw guards in `if` statements.
- Does not provide autofix or suggestions.

Manual migration pattern:

```ts
if (!(errorLike instanceof Error)) {
    throw new TypeError("Expected Error");
}

// becomes
assertError(errorLike);
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-ts-extras-assert-error": "error",
        },
    },
];
```

For broader adoption, you can also start from `typefest.configs["flat/ts-extras"]`
or `typefest.configs["flat/ts-extras-experimental"]` and then override this
rule as needed.

## Frequently asked questions

### Why not keep native checks everywhere?

You can, but this rule enforces consistency. Standardized assertion helpers are
easier to scan and maintain than project-specific guard variants.

### Does this change runtime output?

Yes, `ts-extras` helpers are runtime functions and are emitted to JavaScript.
The goal is standardized behavior and clearer intent, not zero runtime code.

## When not to use it

Disable this rule if your project intentionally avoids runtime helper
dependencies or enforces a different assertion utility layer.

## Further reading

- [`ts-extras` README](https://github.com/sindresorhus/ts-extras)
- [`ts-extras` package reference](https://www.npmjs.com/package/ts-extras)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
