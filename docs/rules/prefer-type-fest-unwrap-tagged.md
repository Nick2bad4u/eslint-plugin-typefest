# prefer-type-fest-unwrap-tagged

Require TypeFest `UnwrapTagged` over imported aliases like `UnwrapOpaque`.

## Targeted pattern scope

This rule targets deprecated `UnwrapOpaque` alias usage.

## What it checks

- Type references that resolve to imported `UnwrapOpaque` aliases.

## Why

`UnwrapOpaque` is deprecated in TypeFest in favor of `UnwrapTagged`.
Standardizing on the canonical utility avoids deprecated API usage and keeps
types aligned with current TypeFest docs.

## ❌ Incorrect

```ts
import type { UnwrapOpaque } from "type-fest";

type RawId = UnwrapOpaque<UserId>;
```

## ✅ Correct

```ts
import type { UnwrapTagged } from "type-fest";

type RawId = UnwrapTagged<UserId>;
```

## Behavior and migration notes

- `UnwrapTagged<T>` is the supported replacement for deprecated `UnwrapOpaque<T>`.
- Use it when branded/tagged identifiers need to be converted back to raw underlying types.
- Keep unwrap operations localized near serialization and interop boundaries.

## Additional examples

### ❌ Incorrect (additional scenario)

```ts
import type { UnwrapOpaque } from "type-fest";

type RawId = UnwrapOpaque<UserId>;
```

### ✅ Correct (additional scenario)

```ts
import type { UnwrapTagged } from "type-fest";

type RawId = UnwrapTagged<UserId>;
```

### ✅ Correct (team-scale usage)

```ts
type RawOrderId = UnwrapTagged<OrderId>;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-unwrap-tagged": "error",
        },
    },
];
```

## When not to use it

Disable this rule if compatibility requirements force retention of deprecated alias names.

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
