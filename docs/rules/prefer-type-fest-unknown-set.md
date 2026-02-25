# prefer-type-fest-unknown-set

Require TypeFest `UnknownSet` over `ReadonlySet<unknown>`.

## What this rule reports

- `ReadonlySet<unknown>` type references.

## Why this rule exists

`UnknownSet` provides a clearer shared alias for unknown-valued sets and keeps TypeFest utility usage consistent with other rules in this plugin.

## ❌ Incorrect

```ts
type Keys = ReadonlySet<unknown>;
```

## ✅ Correct

```ts
type Keys = UnknownSet;
```

## Behavior and migration notes

- `UnknownSet` is the canonical alias for unknown-valued readonly sets.
- Normalize `ReadonlySet<unknown>` usage to one alias to avoid duplicate naming patterns.
- Narrow member types after membership checks in consuming code.

## Additional examples

### ❌ Incorrect (additional scenario)

```ts
type Keys = ReadonlySet<unknown>;
```

### ✅ Correct (additional scenario)

```ts
type Keys = UnknownSet;
```

### ✅ Correct (team-scale usage)

```ts
type DynamicSet = UnknownSet;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-unknown-set": "error",
        },
    },
];
```

## When not to use it

Disable this rule if exported type names must remain unchanged.

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
