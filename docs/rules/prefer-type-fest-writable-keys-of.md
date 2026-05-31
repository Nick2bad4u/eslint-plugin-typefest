# prefer-type-fest-writable-keys-of

Require TypeFest [`WritableKeysOf<T>`](https://github.com/sindresorhus/type-fest/blob/main/source/writable-keys-of.d.ts) over expanded writable-key extraction helpers.

## Targeted pattern scope

This rule reports the exact TypeFest composition `T extends unknown ? Exclude<keyof T, ReadonlyKeysOf<T>> : never`.

It supports direct, aliased, and namespace-qualified TypeFest imports for `ReadonlyKeysOf`.

## What this rule reports

This rule reports expanded writable-key extraction helpers that can be replaced by `WritableKeysOf<T>`.

## Why this rule exists

`WritableKeysOf<T>` is the canonical TypeFest utility for extracting writable keys. Using it directly makes modifier introspection clearer and avoids repeating TypeFest helper compositions.

## ❌ Incorrect

```ts
import type { ReadonlyKeysOf } from "type-fest";

type Result<Type extends object> = Type extends unknown
 ? Exclude<keyof Type, ReadonlyKeysOf<Type>>
 : never;
```

## ✅ Correct

```ts
import type { WritableKeysOf } from "type-fest";

type Result<Type extends object> = WritableKeysOf<Type>;
```

## Behavior and migration notes

- The `ReadonlyKeysOf` reference must resolve to a `type-fest` import.
- The rule only reports the exact distributive exclusion shape used by TypeFest.
- Non-distributive exclusions are ignored because they can differ for union types.
- Autofix is skipped when `WritableKeysOf` is shadowed in the local scope.

## Additional examples

### ❌ Incorrect — Namespace import

```ts
import type * as TypeFest from "type-fest";

type Result<Type extends object> = Type extends unknown
 ? Exclude<keyof Type, TypeFest.ReadonlyKeysOf<Type>>
 : never;
```

### ✅ Correct — Namespace import

```ts
import type { WritableKeysOf } from "type-fest";

type Result<Type extends object> = WritableKeysOf<Type>;
```

### ✅ Correct — Non-distributive helper

```ts
import type { ReadonlyKeysOf } from "type-fest";

type Result<Type extends object> = Exclude<keyof Type, ReadonlyKeysOf<Type>>;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
 {
  plugins: { typefest },
  rules: {
   "typefest/prefer-type-fest-writable-keys-of": "error",
  },
 },
];
```

## When not to use it

Disable this rule if a public helper must intentionally expose the expanded exclusion implementation.

## Package documentation

TypeFest package documentation:

Source file: [`source/writable-keys-of.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/writable-keys-of.d.ts)

> **Rule catalog ID:** R124

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`WritableKeysOf` source](https://github.com/sindresorhus/type-fest/blob/main/source/writable-keys-of.d.ts)
- [TypeScript Handbook: Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
