# prefer-type-fest-optional-keys-of

Require TypeFest [`OptionalKeysOf<T>`](https://github.com/sindresorhus/type-fest/blob/main/source/optional-keys-of.d.ts) over expanded optional-key extraction helpers.

## Targeted pattern scope

This rule reports the exact TypeFest mapped-key composition that derives optional keys from `IsOptionalKeyOf<T, K>`.

It supports direct, aliased, and namespace-qualified TypeFest imports for `IsOptionalKeyOf`.

## What this rule reports

This rule reports expanded optional-key extraction helpers that can be replaced by `OptionalKeysOf<T>`.

## Why this rule exists

`OptionalKeysOf<T>` is the canonical TypeFest utility for extracting optional keys. Using it directly avoids repeating a fragile mapped-type helper and makes the type intent easier to scan.

## ❌ Incorrect

```ts
import type { IsOptionalKeyOf } from "type-fest";

type Result<Type extends object> = Type extends unknown
    ? (keyof {
          [Key in keyof Type as IsOptionalKeyOf<Type, Key> extends false
              ? never
              : Key]: never;
      }) &
          keyof Type
    : never;
```

## ✅ Correct

```ts
import type { OptionalKeysOf } from "type-fest";

type Result<Type extends object> = OptionalKeysOf<Type>;
```

## Behavior and migration notes

- The `IsOptionalKeyOf` reference must resolve to a `type-fest` import.
- The rule only reports the exact distributive mapped-key shape used by TypeFest.
- Custom mapped-key filters and non-distributive helpers are ignored.
- Autofix is skipped when `OptionalKeysOf` is shadowed in the local scope.

## Additional examples

### ❌ Incorrect — Namespace import

```ts
import type * as TypeFest from "type-fest";

type Result<Type extends object> = Type extends unknown
    ? (keyof {
          [Key in keyof Type as TypeFest.IsOptionalKeyOf<
              Type,
              Key
          > extends false
              ? never
              : Key]: never;
      }) &
          keyof Type
    : never;
```

### ✅ Correct — Namespace import

```ts
import type { OptionalKeysOf } from "type-fest";

type Result<Type extends object> = OptionalKeysOf<Type>;
```

### ✅ Correct — Custom mapping

```ts
import type { IsOptionalKeyOf } from "type-fest";

type Result<Type extends object> = keyof {
    [Key in keyof Type as IsOptionalKeyOf<Type, Key> extends false
        ? never
        : Key]: never;
};
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-optional-keys-of": "error",
        },
    },
];
```

## When not to use it

Disable this rule if a public helper must intentionally expose the expanded mapped-type implementation.

## Package documentation

TypeFest package documentation:

Source file: [`source/optional-keys-of.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/optional-keys-of.d.ts)

> **Rule catalog ID:** R121

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`OptionalKeysOf` source](https://github.com/sindresorhus/type-fest/blob/main/source/optional-keys-of.d.ts)
- [TypeScript Handbook: Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
