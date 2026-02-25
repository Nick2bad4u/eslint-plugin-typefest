# prefer-ts-extras-not

Require `not()` from `ts-extras` over inline negated predicate callbacks in `filter` calls.

## What this rule reports

- Inline negated predicate callbacks in `.filter(...)` that can use `not(predicate)`.

### Matched patterns

- `array.filter((value) => !predicate(value))`

## Why this rule exists

`not(predicate)` communicates intent directly and preserves predicate-based typing in a reusable helper.

## ❌ Incorrect

```ts
const activeUsers = users.filter((user) => !isArchived(user));
```

## ✅ Correct

```ts
const activeUsers = users.filter(not(isArchived));
```

## Behavior and migration notes

- `not(predicate)` preserves predicate inversion intent in one reusable helper.
- This rule targets inline negation wrappers inside `filter` callbacks.
- Callbacks that do extra work beyond predicate negation should be reviewed manually.

## Additional examples

### ❌ Incorrect (additional scenario)

```ts
const active = users.filter((user) => !isArchived(user));
```

### ✅ Correct (additional scenario)

```ts
const active = users.filter(not(isArchived));
```

### ✅ Correct (team-scale usage)

```ts
const nonEmpty = values.filter(not(isEmptyValue));
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-ts-extras-not": "error",
        },
    },
];
```

## When not to use it

Disable this rule if your codebase requires explicit inline callback bodies for readability.

## Further reading

- [`ts-extras` README](https://github.com/sindresorhus/ts-extras)
- [`ts-extras` package reference](https://www.npmjs.com/package/ts-extras)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
