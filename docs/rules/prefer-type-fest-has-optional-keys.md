# prefer-type-fest-has-optional-keys

Require TypeFest [`HasOptionalKeys<T>`](https://github.com/sindresorhus/type-fest/blob/main/source/has-optional-keys.d.ts) over `OptionalKeysOf<T>` emptiness checks.

## Targeted pattern scope

This rule reports exact `OptionalKeysOf<T> extends never ? false : true` checks when `OptionalKeysOf` is imported from `type-fest`.

It supports direct, aliased, and namespace-qualified TypeFest imports.

## What this rule reports

This rule reports manual optional-key existence checks that can be replaced by `HasOptionalKeys<T>`.

## Why this rule exists

`HasOptionalKeys<T>` makes optional-key existence intent explicit and avoids repeating TypeFest helper compositions in user code.

## ❌ Incorrect

```ts
import type { OptionalKeysOf } from "type-fest";

type Result<T extends object> = OptionalKeysOf<T> extends never ? false : true;
```

## ✅ Correct

```ts
import type { HasOptionalKeys } from "type-fest";

type Result<T extends object> = HasOptionalKeys<T>;
```

## Behavior and migration notes

- The `OptionalKeysOf` reference must resolve to a `type-fest` import.
- The rule only reports the exact `extends never ? false : true` shape.
- Inverted checks and custom fallback branches are ignored.
- Autofix is skipped when `HasOptionalKeys` is shadowed in the local scope.

## Additional examples

### ❌ Incorrect — Namespace import

```ts
import type * as TypeFest from "type-fest";

type Result<T extends object> = TypeFest.OptionalKeysOf<T> extends never ? false : true;
```

### ✅ Correct — Namespace import

```ts
import type { HasOptionalKeys } from "type-fest";

type Result<T extends object> = HasOptionalKeys<T>;
```

### ✅ Correct — Inverted check

```ts
import type { OptionalKeysOf } from "type-fest";

type Result<T extends object> = OptionalKeysOf<T> extends never ? true : false;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-has-optional-keys": "error",
        },
    },
];
```

## When not to use it

Disable this rule if a public helper must keep the expanded TypeFest composition for compatibility or documentation reasons.

## Package documentation

TypeFest package documentation:

Source file: [`source/has-optional-keys.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/has-optional-keys.d.ts)

> **Rule catalog ID:** R117

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`HasOptionalKeys` source](https://github.com/sindresorhus/type-fest/blob/main/source/has-optional-keys.d.ts)
- [TypeScript Handbook: Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
