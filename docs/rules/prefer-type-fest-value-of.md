# prefer-type-fest-value-of

Require TypeFest `ValueOf<T>` over direct `T[keyof T]` indexed-access unions when extracting object value unions.

## What this rule reports

- Type-level indexed access patterns shaped like `T[keyof T]`.

## Why this rule exists

`ValueOf<T>` is clearer and more intent-revealing than repeating indexed-access unions. It also keeps value-union typing conventions consistent with other TypeFest-based utility types in the codebase.

## ❌ Incorrect

```ts
type Values = User[keyof User];
```

## ✅ Correct

```ts
type Values = ValueOf<User>;
```

## Behavior and migration notes

- `ValueOf<T>` replaces raw `T[keyof T]` value-union extraction patterns.
- Use keyed form `ValueOf<T, K>` when you need a subset of value types.
- Standardize on this alias in shared type utilities to avoid repeated indexed-access spelling.

## Additional examples

### ❌ Incorrect (additional scenario)

```ts
type StatusValue = StatusMap[keyof StatusMap];
```

### ✅ Correct (additional scenario)

```ts
type StatusValue = ValueOf<StatusMap>;
```

### ✅ Correct (team-scale usage)

```ts
type Selected = ValueOf<User, "id" | "email">;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-value-of": "error",
        },
    },
];
```

## When not to use it

Disable this rule if explicit indexed-access expressions are required in a published API.

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
