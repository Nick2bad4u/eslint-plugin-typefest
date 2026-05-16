# prefer-type-fest-has-writable-keys

Require TypeFest [`HasWritableKeys<T>`](https://github.com/sindresorhus/type-fest/blob/main/source/has-writable-keys.d.ts) over `WritableKeysOf<T>` emptiness checks.

## Targeted pattern scope

This rule reports exact `WritableKeysOf<T> extends never ? false : true` checks when `WritableKeysOf` is imported from `type-fest`.

It supports direct, aliased, and namespace-qualified TypeFest imports.

## What this rule reports

This rule reports manual writable-key existence checks that can be replaced by `HasWritableKeys<T>`.

## Why this rule exists

`HasWritableKeys<T>` makes writable-key existence intent explicit and avoids repeating TypeFest helper compositions in user code.

## ❌ Incorrect

```ts
import type { WritableKeysOf } from "type-fest";

type Result<T extends object> = WritableKeysOf<T> extends never ? false : true;
```

## ✅ Correct

```ts
import type { HasWritableKeys } from "type-fest";

type Result<T extends object> = HasWritableKeys<T>;
```

## Behavior and migration notes

- The `WritableKeysOf` reference must resolve to a `type-fest` import.
- The rule only reports the exact `extends never ? false : true` shape.
- Inverted checks and custom fallback branches are ignored.
- Autofix is skipped when `HasWritableKeys` is shadowed in the local scope.

## Additional examples

### ❌ Incorrect — Namespace import

```ts
import type * as TypeFest from "type-fest";

type Result<T extends object> = TypeFest.WritableKeysOf<T> extends never ? false : true;
```

### ✅ Correct — Namespace import

```ts
import type { HasWritableKeys } from "type-fest";

type Result<T extends object> = HasWritableKeys<T>;
```

### ✅ Correct — Inverted check

```ts
import type { WritableKeysOf } from "type-fest";

type Result<T extends object> = WritableKeysOf<T> extends never ? true : false;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-has-writable-keys": "error",
        },
    },
];
```

## When not to use it

Disable this rule if a public helper must keep the expanded TypeFest composition for compatibility or documentation reasons.

## Package documentation

TypeFest package documentation:

Source file: [`source/has-writable-keys.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/has-writable-keys.d.ts)

> **Rule catalog ID:** R120

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`HasWritableKeys` source](https://github.com/sindresorhus/type-fest/blob/main/source/has-writable-keys.d.ts)
- [TypeScript Handbook: Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
