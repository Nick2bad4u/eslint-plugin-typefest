# prefer-type-fest-string-length

Require TypeFest [`StringLength`](https://github.com/sindresorhus/type-fest/blob/main/source/string-length.d.ts) over `StringToArray<T>['length']`.

## Targeted pattern scope

This rule reports `StringToArray<T>['length']` indexed-access type patterns and prefers the canonical `StringLength<T>` from type-fest.

## What this rule reports

- `TSIndexedAccessType` nodes of the shape `StringToArray<T>['length']`.
- Direct, aliased, and namespace-qualified `StringToArray` references imported from `type-fest`.

### Detection boundaries

- Reports `StringToArray<T>['length']` with exactly one type argument forwarded.
- Autofixes by replacing the indexed-access type with `StringLength<T>` and inserting a `type-fest` import when absent.
- Does not autofix where the `StringLength` identifier is shadowed by a type parameter in scope.
- Does not flag `StringToArray<T, Options>['length']`; `StringToArray` options can change non-literal string behavior.
- Does not flag `StringToArray<T>[0]` or other non-`'length'` index expressions.
- Does not flag local `StringToArray` helpers that are not imported from `type-fest`.
- Does not flag `StringToArray` references shadowed by an enclosing type parameter.

## Why this rule exists

`StringLength<T>` is the canonical TypeFest utility for computing the length of a string type.

The pattern `StringToArray<T>['length']` is equivalent only for the default one-argument `StringToArray<T>` form, but it exposes an implementation detail: turning the string into a tuple or array and then reading its length. `StringLength<T>` states the intent directly and keeps the type expression shorter.

## ❌ Incorrect

```ts
import type { StringToArray } from "type-fest";

type EventNameLength = StringToArray<"user.created">["length"];
```

## ✅ Correct

```ts
import type { StringLength } from "type-fest";

type EventNameLength = StringLength<"user.created">;
```

## Behavior and migration notes

- `StringLength<S>` returns the length of a literal string and `number` for non-literal strings.
- `StringLength<S>` is implemented as `StringToArray<S>['length']` in TypeFest, so the one-argument migration is safe.
- `StringToArray<S, { mapNonLiteralsDirectly: true }>['length']` is intentionally ignored because that option changes how non-literal string parts are represented.

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
 {
  plugins: { typefest },
  rules: {
   "typefest/prefer-type-fest-string-length": "error",
  },
 },
];
```

## When not to use it

Disable this rule if your codebase intentionally documents the intermediate `StringToArray<T>` representation and wants to keep the length extraction visually tied to that intermediate array form.

## Package documentation

TypeFest package documentation:

Source file: [`source/string-length.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/string-length.d.ts)

````ts
/**
 * Returns the length of the given string.
 *
 * @example
 *  ```
 *  import type {StringLength} from 'type-fest';
 *
 *  type A = StringLength<'abcde'>;
 *  //=> 5
 *  ```;
 */
````

> **Rule catalog ID:** R126

## Further reading

- [TypeFest README](https://github.com/sindresorhus/type-fest)
- [TypeScript Handbook: Indexed Access Types](https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
