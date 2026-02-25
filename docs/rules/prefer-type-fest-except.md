# prefer-type-fest-except

Require TypeFest `Except<T, K>` over `Omit<T, K>` when removing keys from object types.

## Targeted pattern scope

This rule targets `Omit<T, K>` object-shaping references that can be replaced by the TypeFest canonical utility.

## What it checks

- Type references shaped like `Omit<T, K>`.

## Why

`Except<T, K>` from type-fest models omitted keys more strictly and keeps object-shaping conventions aligned with other TypeFest utilities used in this plugin.

## ❌ Incorrect

```ts
type PublicUser = Omit<User, "password">;
```

## ✅ Correct

```ts
type PublicUser = Except<User, "password">;
```

## Behavior and migration notes

- `Except<T, K>` is the canonical object-key removal utility in this plugin's type-fest style.
- Migrate direct `Omit<T, K>` aliases in shared contracts to keep one naming convention.
- Review constraint behavior if existing helper wrappers add semantics beyond key omission.

## Additional examples

### ❌ Incorrect (additional scenario)

```ts
type PublicUser = Omit<User, "password" | "token">;
```

### ✅ Correct (additional scenario)

```ts
type PublicUser = Except<User, "password" | "token">;
```

### ✅ Correct (team-scale usage)

```ts
type Internalless = Except<ApiResponse, "internal">;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-except": "error",
        },
    },
];
```

## When not to use it

Disable this rule if public type contracts intentionally expose `Omit` as part of the API surface.

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
