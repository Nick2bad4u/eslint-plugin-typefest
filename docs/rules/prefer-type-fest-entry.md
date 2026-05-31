# prefer-type-fest-entry

Require TypeFest [`Entry<T>`](https://github.com/sindresorhus/type-fest/blob/main/source/entry.d.ts) over manual `[keyof T, T[keyof T]]` object entry tuple types.

## Targeted pattern scope

This rule targets exact object entry tuple aliases where the first tuple element is `keyof T` and the second element is `T[keyof T]` for the same target type.

## What this rule reports

- `[keyof T, T[keyof T]]`

The rule intentionally does not report array wrappers. Use `prefer-type-fest-entries` for arrays of entry tuples.

## Why this rule exists

`Entry<T>` is the canonical TypeFest helper for a single entry yielded by object, array, map, and set entry APIs. Using it avoids repeated object-only tuple aliases and keeps entry intent visible.

## ❌ Incorrect

```ts
type ObjectEntry<T> = [keyof T, T[keyof T]];
```

## ✅ Correct

```ts
import type { Entry } from "type-fest";

type ObjectEntry<T> = Entry<T>;
```

## Behavior and migration notes

- This rule only matches exact object entry tuple syntax.
- It ignores similar tuples when the key target and value target differ.
- It will not autofix when `Entry` is shadowed in the local type scope.
- `Array<[keyof T, T[keyof T]]>` and `[keyof T, T[keyof T]][]` are handled by `prefer-type-fest-entries`.

## Additional examples

### ❌ Incorrect — Additional example

```ts
type ConfigEntry<Config> = [keyof Config, Config[keyof Config]];
```

### ✅ Correct — Additional example

```ts
import type { Entry } from "type-fest";

type ConfigEntry<Config> = Entry<Config>;
```

### ✅ Correct — Non-targeted usage

```ts
type Pair<T, U> = [keyof T, U[keyof T]];
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
 {
  plugins: { typefest },
  rules: {
   "typefest/prefer-type-fest-entry": "error",
  },
 },
];
```

## When not to use it

Disable this rule if your project intentionally keeps object-only entry tuple aliases that should not use TypeFest collection-aware `Entry<T>` semantics.

## Package documentation

TypeFest package documentation:

Source file: [`source/entry.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/entry.d.ts)

```ts
export type _ObjectEntry<BaseType> = [keyof BaseType, BaseType[keyof BaseType]];

export type Entry<BaseType> =
 BaseType extends Map<unknown, unknown>
  ? _MapEntry<BaseType>
  : BaseType extends Set<unknown>
    ? _SetEntry<BaseType>
    : BaseType extends readonly unknown[]
      ? _ArrayEntry<BaseType>
      : BaseType extends object
        ? _ObjectEntry<BaseType>
        : never;
```

> **Rule catalog ID:** R107

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Indexed Access Types](https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
