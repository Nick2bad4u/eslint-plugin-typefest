# prefer-type-fest-and

Require TypeFest [`And<A, B>`](https://github.com/sindresorhus/type-fest/blob/main/source/and.d.ts) over two-element `AndAll<[A, B]>` boolean tuple checks.

## Targeted pattern scope

This rule targets direct and namespace-qualified references to `AndAll<[A, B]>` imported from `type-fest`.

## What this rule reports

- `AndAll<[A, B]>`
- `AndAll<readonly [A, B]>`

## Why this rule exists

`And` is the dedicated TypeFest helper for checking whether two boolean types are both `true`. It is shorter and more intention-revealing than spelling the same check as a two-element `AndAll` tuple.

## ❌ Incorrect

```ts
import type { AndAll } from "type-fest";

type Both = AndAll<[true, boolean]>;
```

## ✅ Correct

```ts
import type { And } from "type-fest";

type Both = And<true, boolean>;
```

## Behavior and migration notes

- This rule only reports `AndAll` imported from `type-fest`.
- It only reports two-element tuple arguments.
- It skips named, optional, and rest tuple elements because those cannot be safely rewritten into ordinary generic arguments.
- Namespace-qualified `type-fest` references are reported too.

## Additional examples

### ❌ Incorrect — Namespace import

```ts
import type * as TypeFest from "type-fest";

type Both = TypeFest.AndAll<[false, boolean]>;
```

### ✅ Correct — Namespace import

```ts
import type { And } from "type-fest";

type Both = And<false, boolean>;
```

### ✅ Correct — More than two checks

```ts
import type { AndAll } from "type-fest";

type All = AndAll<[true, boolean, false]>;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
 {
  plugins: { typefest },
  rules: {
   "typefest/prefer-type-fest-and": "error",
  },
 },
];
```

## When not to use it

Disable this rule if your codebase intentionally uses `AndAll` for all boolean conjunctions, including two-value checks.

## Package documentation

TypeFest package documentation:

Source file: [`source/and.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/and.d.ts)

```ts
/**
 * Returns a boolean for whether two given types are both `true`.
 */
export type And<A extends boolean, B extends boolean> = AndAll<[A, B]>;
```

> **Rule catalog ID:** R113

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
