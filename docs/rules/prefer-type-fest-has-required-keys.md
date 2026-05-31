# prefer-type-fest-has-required-keys

Require TypeFest [`HasRequiredKeys<T>`](https://github.com/sindresorhus/type-fest/blob/main/source/has-required-keys.d.ts) over `RequiredKeysOf<T>` emptiness checks.

## Targeted pattern scope

This rule reports exact `RequiredKeysOf<T> extends never ? false : true` checks when `RequiredKeysOf` is imported from `type-fest`.

It supports direct, aliased, and namespace-qualified TypeFest imports.

## What this rule reports

This rule reports manual required-key existence checks that can be replaced by `HasRequiredKeys<T>`.

## Why this rule exists

`HasRequiredKeys<T>` makes required-key existence intent explicit and avoids repeating TypeFest helper compositions in user code.

## ❌ Incorrect

```ts
import type { RequiredKeysOf } from "type-fest";

type Result<T extends object> = RequiredKeysOf<T> extends never ? false : true;
```

## ✅ Correct

```ts
import type { HasRequiredKeys } from "type-fest";

type Result<T extends object> = HasRequiredKeys<T>;
```

## Behavior and migration notes

- The `RequiredKeysOf` reference must resolve to a `type-fest` import.
- The rule only reports the exact `extends never ? false : true` shape.
- Inverted checks and custom fallback branches are ignored.
- Autofix is skipped when `HasRequiredKeys` is shadowed in the local scope.

## Additional examples

### ❌ Incorrect — Namespace import

```ts
import type * as TypeFest from "type-fest";

type Result<T extends object> =
 TypeFest.RequiredKeysOf<T> extends never ? false : true;
```

### ✅ Correct — Namespace import

```ts
import type { HasRequiredKeys } from "type-fest";

type Result<T extends object> = HasRequiredKeys<T>;
```

### ✅ Correct — Inverted check

```ts
import type { RequiredKeysOf } from "type-fest";

type Result<T extends object> = RequiredKeysOf<T> extends never ? true : false;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
 {
  plugins: { typefest },
  rules: {
   "typefest/prefer-type-fest-has-required-keys": "error",
  },
 },
];
```

## When not to use it

Disable this rule if a public helper must keep the expanded TypeFest composition for compatibility or documentation reasons.

## Package documentation

TypeFest package documentation:

Source file: [`source/has-required-keys.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/has-required-keys.d.ts)

> **Rule catalog ID:** R118

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`HasRequiredKeys` source](https://github.com/sindresorhus/type-fest/blob/main/source/has-required-keys.d.ts)
- [TypeScript Handbook: Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
