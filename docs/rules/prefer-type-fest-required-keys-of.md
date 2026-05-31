# prefer-type-fest-required-keys-of

Require TypeFest [`RequiredKeysOf<T>`](https://github.com/sindresorhus/type-fest/blob/main/source/required-keys-of.d.ts) over expanded required-key extraction helpers.

## Targeted pattern scope

This rule reports the exact TypeFest composition `T extends unknown ? Exclude<keyof T, OptionalKeysOf<T>> : never`.

It supports direct, aliased, and namespace-qualified TypeFest imports for `OptionalKeysOf`.

## What this rule reports

This rule reports expanded required-key extraction helpers that can be replaced by `RequiredKeysOf<T>`.

## Why this rule exists

`RequiredKeysOf<T>` is the canonical TypeFest utility for extracting required keys. Using it directly avoids repeating TypeFest helper compositions in user code.

## ❌ Incorrect

```ts
import type { OptionalKeysOf } from "type-fest";

type Result<Type extends object> = Type extends unknown
 ? Exclude<keyof Type, OptionalKeysOf<Type>>
 : never;
```

## ✅ Correct

```ts
import type { RequiredKeysOf } from "type-fest";

type Result<Type extends object> = RequiredKeysOf<Type>;
```

## Behavior and migration notes

- The `OptionalKeysOf` reference must resolve to a `type-fest` import.
- The rule only reports the exact distributive exclusion shape used by TypeFest.
- Non-distributive exclusions are ignored because they can differ for union types.
- Autofix is skipped when `RequiredKeysOf` is shadowed in the local scope.

## Additional examples

### ❌ Incorrect — Namespace import

```ts
import type * as TypeFest from "type-fest";

type Result<Type extends object> = Type extends unknown
 ? Exclude<keyof Type, TypeFest.OptionalKeysOf<Type>>
 : never;
```

### ✅ Correct — Namespace import

```ts
import type { RequiredKeysOf } from "type-fest";

type Result<Type extends object> = RequiredKeysOf<Type>;
```

### ✅ Correct — Non-distributive helper

```ts
import type { OptionalKeysOf } from "type-fest";

type Result<Type extends object> = Exclude<keyof Type, OptionalKeysOf<Type>>;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
 {
  plugins: { typefest },
  rules: {
   "typefest/prefer-type-fest-required-keys-of": "error",
  },
 },
];
```

## When not to use it

Disable this rule if a public helper must intentionally expose the expanded exclusion implementation.

## Package documentation

TypeFest package documentation:

Source file: [`source/required-keys-of.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/required-keys-of.d.ts)

> **Rule catalog ID:** R122

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`RequiredKeysOf` source](https://github.com/sindresorhus/type-fest/blob/main/source/required-keys-of.d.ts)
- [TypeScript Handbook: Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
