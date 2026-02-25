# prefer-type-fest-unknown-array

Require TypeFest `UnknownArray` over `readonly unknown[]` and `ReadonlyArray<unknown>`.

## What this rule reports

- `readonly unknown[]`
- `ReadonlyArray<unknown>`

## Why this rule exists

`UnknownArray` provides a clearer, shared alias for unknown element arrays and keeps utility-type usage consistent with other TypeFest-first conventions.

## ❌ Incorrect

```ts
type Values = readonly unknown[];
```

## ✅ Correct

```ts
type Values = UnknownArray;
```

## Behavior and migration notes

- `UnknownArray` is the canonical alias for readonly unknown-element arrays in `type-fest` style.
- This rule normalizes `readonly unknown[]` and `ReadonlyArray<unknown>` into one shared name.
- Use this alias for untyped collection ingress points before narrowing.

## Additional examples

### ❌ Incorrect (additional scenario)

```ts
type Input = readonly unknown[];
```

### ✅ Correct (additional scenario)

```ts
type Input = UnknownArray;
```

### ✅ Correct (team-scale usage)

```ts
type PayloadList = UnknownArray;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-unknown-array": "error",
        },
    },
];
```

## When not to use it

Disable this rule if external API signatures must preserve existing alias names.

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
