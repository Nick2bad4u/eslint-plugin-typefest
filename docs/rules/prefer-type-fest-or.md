# prefer-type-fest-or

Require TypeFest [`Or<A, B>`](https://github.com/sindresorhus/type-fest/blob/main/source/or.d.ts) over two-element `OrAll<[A, B]>` boolean tuple checks.

## Targeted pattern scope

This rule targets direct and namespace-qualified references to `OrAll<[A, B]>` imported from `type-fest`.

## What this rule reports

- `OrAll<[A, B]>`
- `OrAll<readonly [A, B]>`

## Why this rule exists

`Or` is the dedicated TypeFest helper for checking whether either of two boolean types is `true`. It is shorter and more intention-revealing than spelling the same check as a two-element `OrAll` tuple.

## ❌ Incorrect

```ts
import type { OrAll } from "type-fest";

type Either = OrAll<[false, boolean]>;
```

## ✅ Correct

```ts
import type { Or } from "type-fest";

type Either = Or<false, boolean>;
```

## Behavior and migration notes

- This rule only reports `OrAll` imported from `type-fest`.
- It only reports two-element tuple arguments.
- It skips named, optional, and rest tuple elements because those cannot be safely rewritten into ordinary generic arguments.
- Namespace-qualified `type-fest` references are reported too.

## Additional examples

### ❌ Incorrect — Namespace import

```ts
import type * as TypeFest from "type-fest";

type Either = TypeFest.OrAll<[true, boolean]>;
```

### ✅ Correct — Namespace import

```ts
import type { Or } from "type-fest";

type Either = Or<true, boolean>;
```

### ✅ Correct — More than two checks

```ts
import type { OrAll } from "type-fest";

type Any = OrAll<[false, boolean, true]>;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-or": "error",
        },
    },
];
```

## When not to use it

Disable this rule if your codebase intentionally uses `OrAll` for all boolean disjunctions, including two-value checks.

## Package documentation

TypeFest package documentation:

Source file: [`source/or.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/or.d.ts)

```ts
/**
Returns a boolean for whether either of two given types is `true`.
*/
export type Or<A extends boolean, B extends boolean> = OrAll<[A, B]>;
```

> **Rule catalog ID:** R114

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
