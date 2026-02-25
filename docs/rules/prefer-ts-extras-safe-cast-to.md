# prefer-ts-extras-safe-cast-to

Prefer [`safeCastTo`](https://github.com/sindresorhus/ts-extras#safecastto) from `ts-extras` over direct `as` assertions when the cast is already assignable.

## What this rule reports

- Type assertions (`as T` and `<T>value`) that are already assignable and can use `safeCastTo<T>(value)`.

### Matched patterns

- `as` and angle-bracket (`<T>value`) assertions in runtime source files.
- Only assertions where the source expression type is assignable to the asserted target type.

## Why this rule exists

`safeCastTo<T>(value)` keeps casts type-checked and prevents silently widening unsafe assertion patterns.

## ❌ Incorrect

```ts
const nameValue = "Alice" as string;
```

## ✅ Correct

```ts
const nameValue = safeCastTo<string>("Alice");
```

## Behavior and migration notes

- This rule only reports assertions where source type is assignable to target type.
- Unsafe/non-assignable assertion patterns are intentionally not rewritten by this rule.
- `safeCastTo` keeps the cast explicit while preserving assignability checks.

## Additional examples

### ❌ Incorrect (additional scenario)

```ts
const resourceId = rawId as string;
```

### ✅ Correct (additional scenario)

```ts
const resourceId = safeCastTo<string>(rawId);
```

### ✅ Correct (team-scale usage)

```ts
const port = safeCastTo<number>(env.PORT);
```

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

## When not to use it

Disable this rule if your team forbids runtime casting helpers in favor of direct assertions.

## Further reading

- [`ts-extras` README](https://github.com/sindresorhus/ts-extras)
- [`ts-extras` package reference](https://www.npmjs.com/package/ts-extras)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
