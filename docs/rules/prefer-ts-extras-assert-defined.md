# prefer-ts-extras-assert-defined

Require `assertDefined()` from `ts-extras` over manual undefined-guard throw blocks.

## What this rule reports

Throw-only undefined guard blocks that can be replaced with `assertDefined(value)`.

### Matched patterns

- `if (value === undefined) throw ...`
- `if (undefined === value) throw ...`
- `if (value == undefined) throw ...`
- `if (undefined == value) throw ...`

Only `if` statements that have no `else` branch and a throw-only consequent are
reported.

### Detection boundaries

- ✅ Reports direct undefined-equality guards with throw-only consequents.
- ❌ Does not report guards that return, log, or perform additional statements.
- ❌ Does not report `typeof value === "undefined"` patterns.
- ❌ Does not auto-fix.

## Why this rule exists

`assertDefined()` expresses the intent of narrowing away `undefined` and centralizes assertion behavior.

In large services, inline guards often diverge in error types/messages. Using
`assertDefined` gives one recognizable pattern while preserving narrowing.

## ❌ Incorrect

```ts
if (token === undefined) {
    throw new Error("Token is required");
}
```

## ✅ Correct

```ts
assertDefined(token);
```

## Behavior and migration notes

- `assertDefined(value)` narrows away `undefined` after the assertion.
- This rule intentionally targets throw-only guards without `else` branches.
- `typeof value === "undefined"` checks are intentionally out of scope.

## Additional examples

### ❌ Incorrect (additional scenario)

```ts
if (undefined == monitorId) {
    throw new TypeError("monitorId is required");
}
```

### ✅ Correct (additional scenario)

```ts
assertDefined(monitorId);
```

### ✅ Correct (team-scale usage)

```ts
assertDefined(config.apiKey);
assertDefined(config.baseUrl);
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-ts-extras-assert-defined": "error",
        },
    },
];
```

## When not to use it

Disable this rule if your error-handling layer requires custom throw logic in each guard block.

## Further reading

- [`ts-extras` README](https://github.com/sindresorhus/ts-extras)
- [`ts-extras` package reference](https://www.npmjs.com/package/ts-extras)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
