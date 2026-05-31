# prefer-type-fest-readonly-keys-of

Require TypeFest [`ReadonlyKeysOf<T>`](https://github.com/sindresorhus/type-fest/blob/main/source/readonly-keys-of.d.ts) over expanded readonly-key extraction helpers.

## Targeted pattern scope

This rule reports the exact TypeFest mapped-key composition that derives readonly keys from `IsReadonlyKeyOf<T, K>`.

It supports direct, aliased, and namespace-qualified TypeFest imports for `IsReadonlyKeyOf`.

## What this rule reports

This rule reports expanded readonly-key extraction helpers that can be replaced by `ReadonlyKeysOf<T>`.

## Why this rule exists

`ReadonlyKeysOf<T>` is the canonical TypeFest utility for extracting readonly keys. Using it directly makes modifier introspection clearer and avoids repeating TypeFest internals.

## ❌ Incorrect

```ts
import type { IsReadonlyKeyOf } from "type-fest";

type Result<Type extends object> = Type extends unknown
 ? keyof {
    [Key in keyof Type as IsReadonlyKeyOf<Type, Key> extends false
     ? never
     : Key]: never;
   } &
    keyof Type
 : never;
```

## ✅ Correct

```ts
import type { ReadonlyKeysOf } from "type-fest";

type Result<Type extends object> = ReadonlyKeysOf<Type>;
```

## Behavior and migration notes

- The `IsReadonlyKeyOf` reference must resolve to a `type-fest` import.
- The rule only reports the exact distributive mapped-key shape used by TypeFest.
- Custom mapped-key filters and non-distributive helpers are ignored.
- Autofix is skipped when `ReadonlyKeysOf` is shadowed in the local scope.

## Additional examples

### ❌ Incorrect — Namespace import

```ts
import type * as TypeFest from "type-fest";

type Result<Type extends object> = Type extends unknown
 ? keyof {
    [Key in keyof Type as TypeFest.IsReadonlyKeyOf<Type, Key> extends false
     ? never
     : Key]: never;
   } &
    keyof Type
 : never;
```

### ✅ Correct — Namespace import

```ts
import type { ReadonlyKeysOf } from "type-fest";

type Result<Type extends object> = ReadonlyKeysOf<Type>;
```

### ✅ Correct — Custom mapping

```ts
import type { IsReadonlyKeyOf } from "type-fest";

type Result<Type extends object> = keyof {
 [Key in keyof Type as IsReadonlyKeyOf<Type, Key> extends false
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
   "typefest/prefer-type-fest-readonly-keys-of": "error",
  },
 },
];
```

## When not to use it

Disable this rule if a public helper must intentionally expose the expanded mapped-type implementation.

## Package documentation

TypeFest package documentation:

Source file: [`source/readonly-keys-of.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/readonly-keys-of.d.ts)

> **Rule catalog ID:** R123

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`ReadonlyKeysOf` source](https://github.com/sindresorhus/type-fest/blob/main/source/readonly-keys-of.d.ts)
- [TypeScript Handbook: Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
