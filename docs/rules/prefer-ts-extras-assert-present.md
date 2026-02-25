# prefer-ts-extras-assert-present

Require `assertPresent()` from `ts-extras` over manual `== null` throw guards.

## What this rule reports

Throw-only nullish guard blocks that can be replaced with `assertPresent(value)`.

### Matched patterns

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

## Why this rule exists

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

## Behavior and migration notes

- `assertPresent(value)` narrows value to `NonNullable<T>`.
- The rule covers nullish guards (`== null` or explicit `null || undefined`) with throw-only consequents.
- Null-only or undefined-only assertions are intentionally left untouched.

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

## When not to use it

Disable this rule if your domain code requires custom error payloads inline at each nullish guard.

## Further reading

- [`ts-extras` README](https://github.com/sindresorhus/ts-extras)
- [`ts-extras` package reference](https://www.npmjs.com/package/ts-extras)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
