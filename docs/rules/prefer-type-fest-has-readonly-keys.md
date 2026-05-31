# prefer-type-fest-has-readonly-keys

Require TypeFest [`HasReadonlyKeys<T>`](https://github.com/sindresorhus/type-fest/blob/main/source/has-readonly-keys.d.ts) over `ReadonlyKeysOf<T>` emptiness checks.

## Targeted pattern scope

This rule reports exact `ReadonlyKeysOf<T> extends never ? false : true` checks when `ReadonlyKeysOf` is imported from `type-fest`.

It supports direct, aliased, and namespace-qualified TypeFest imports.

## What this rule reports

This rule reports manual readonly-key existence checks that can be replaced by `HasReadonlyKeys<T>`.

## Why this rule exists

`HasReadonlyKeys<T>` makes readonly-key existence intent explicit and avoids repeating TypeFest helper compositions in user code.

## ❌ Incorrect

```ts
import type { ReadonlyKeysOf } from "type-fest";

type Result<T extends object> = ReadonlyKeysOf<T> extends never ? false : true;
```

## ✅ Correct

```ts
import type { HasReadonlyKeys } from "type-fest";

type Result<T extends object> = HasReadonlyKeys<T>;
```

## Behavior and migration notes

- The `ReadonlyKeysOf` reference must resolve to a `type-fest` import.
- The rule only reports the exact `extends never ? false : true` shape.
- Inverted checks and custom fallback branches are ignored.
- Autofix is skipped when `HasReadonlyKeys` is shadowed in the local scope.

## Additional examples

### ❌ Incorrect — Namespace import

```ts
import type * as TypeFest from "type-fest";

type Result<T extends object> =
 TypeFest.ReadonlyKeysOf<T> extends never ? false : true;
```

### ✅ Correct — Namespace import

```ts
import type { HasReadonlyKeys } from "type-fest";

type Result<T extends object> = HasReadonlyKeys<T>;
```

### ✅ Correct — Inverted check

```ts
import type { ReadonlyKeysOf } from "type-fest";

type Result<T extends object> = ReadonlyKeysOf<T> extends never ? true : false;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
 {
  plugins: { typefest },
  rules: {
   "typefest/prefer-type-fest-has-readonly-keys": "error",
  },
 },
];
```

## When not to use it

Disable this rule if a public helper must keep the expanded TypeFest composition for compatibility or documentation reasons.

## Package documentation

TypeFest package documentation:

Source file: [`source/has-readonly-keys.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/has-readonly-keys.d.ts)

> **Rule catalog ID:** R119

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`HasReadonlyKeys` source](https://github.com/sindresorhus/type-fest/blob/main/source/has-readonly-keys.d.ts)
- [TypeScript Handbook: Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
