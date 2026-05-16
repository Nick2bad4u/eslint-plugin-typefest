# prefer-type-fest-entries

Require TypeFest [`Entries<T>`](https://github.com/sindresorhus/type-fest/blob/main/source/entries.d.ts) over manual arrays of `[keyof T, T[keyof T]]` object entry tuple types.

## Targeted pattern scope

This rule targets exact mutable arrays of object entry tuples where each tuple is `[keyof T, T[keyof T]]`.

## What this rule reports

- `Array<[keyof T, T[keyof T]]>`
- `[keyof T, T[keyof T]][]`

The first version intentionally ignores `ReadonlyArray<...>` until readonly collection semantics are modeled explicitly.

## Why this rule exists

`Entries<T>` is the canonical TypeFest helper for the array of entries yielded by object, array, map, and set entry APIs. Using it avoids repeating object-only entry-array aliases and keeps entry-array intent clear.

## ❌ Incorrect

```ts
type ObjectEntries<T> = Array<[keyof T, T[keyof T]]>;
```

## ✅ Correct

```ts
import type { Entries } from "type-fest";

type ObjectEntries<T> = Entries<T>;
```

## Behavior and migration notes

- This rule only matches exact object entry tuple arrays.
- It ignores similar tuples when the key target and value target differ.
- It will not autofix when `Entries` is shadowed in the local type scope.
- Single entry tuples are handled by `prefer-type-fest-entry`.

## Additional examples

### ❌ Incorrect — Additional example

```ts
type ConfigEntries<Config> = [keyof Config, Config[keyof Config]][];
```

### ✅ Correct — Additional example

```ts
import type { Entries } from "type-fest";

type ConfigEntries<Config> = Entries<Config>;
```

### ✅ Correct — Non-targeted usage

```ts
type ReadonlyObjectEntries<T> = ReadonlyArray<[keyof T, T[keyof T]]>;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-entries": "error",
        },
    },
];
```

## When not to use it

Disable this rule if your project intentionally keeps object-only entry array aliases that should not use TypeFest collection-aware `Entries<T>` semantics.

## Package documentation

TypeFest package documentation:

Source file: [`source/entries.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/entries.d.ts)

```ts
type ObjectEntries<BaseType> = Array<_ObjectEntry<BaseType>>;

export type Entries<BaseType> =
    BaseType extends Map<unknown, unknown> ? MapEntries<BaseType>
        : BaseType extends Set<unknown> ? SetEntries<BaseType>
            : BaseType extends readonly unknown[] ? ArrayEntries<BaseType>
                : BaseType extends object ? ObjectEntries<BaseType>
                    : never;
```

> **Rule catalog ID:** R108

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Indexed Access Types](https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)

