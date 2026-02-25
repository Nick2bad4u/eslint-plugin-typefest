# prefer-ts-extras-assert-error

Require `assertError()` from `ts-extras` over manual `instanceof Error` throw
guards.

## What this rule reports

Throw-only negative `instanceof Error` guards that can be replaced with `assertError(value)`.

### Matched patterns

- `if (!(value instanceof Error)) { throw ... }`

Only `if` statements with no `else` branch and a throw-only consequent are
reported.

### Detection boundaries

- ✅ Reports negative `instanceof Error` guards wrapped in `!()`.
- ❌ Does not report positive-form patterns like
  `if (value instanceof Error) { ... } else { throw ... }`.
- ❌ Does not report checks against custom error classes in this rule.
- ❌ Does not auto-fix.

## Why this rule exists

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

## Behavior and migration notes

- `assertError(value)` narrows unknown caught values to `Error`.
- This rule only targets throw-only negative guards with no `else` branch.
- Positive-form or custom-error-class guards are intentionally out of scope.

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

## When not to use it

Disable this rule if your project intentionally avoids runtime helper
dependencies or enforces a different assertion utility layer.

## Further reading

- [`ts-extras` README](https://github.com/sindresorhus/ts-extras)
- [`ts-extras` package reference](https://www.npmjs.com/package/ts-extras)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
