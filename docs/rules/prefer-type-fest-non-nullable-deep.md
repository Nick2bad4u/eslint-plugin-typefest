# prefer-type-fest-non-nullable-deep

Require TypeFest [`NonNullableDeep`](https://github.com/sindresorhus/type-fest/blob/main/source/non-nullable-deep.d.ts) over `DeepNonNullable` aliases.

## Targeted pattern scope

This rule reports `DeepNonNullable<T>` type references and prefers the canonical `NonNullableDeep<T>` from type-fest for recursive non-nullable transformations.

## What this rule reports

- Type references named `DeepNonNullable`.

### Detection boundaries

- ✅ Reports direct `DeepNonNullable<T>` type references.
- ✅ Autofixes by renaming the identifier to `NonNullableDeep` and inserting a `type-fest` import when absent.
- ❌ Does not auto-fix where the `NonNullableDeep` identifier is shadowed by a type parameter in scope.

## Why this rule exists

`NonNullableDeep<T>` is the canonical TypeFest utility for recursively removing `null` and `undefined` from all nested properties.

Using a consistent name avoids confusion between locally-defined deep-non-nullable helpers and the official TypeFest utility. The canonical name also communicates intent to contributors familiar with type-fest.

## ❌ Incorrect

```ts
type StrictConfig = DeepNonNullable<Config>;
```

## ✅ Correct

```ts
import type { NonNullableDeep } from "type-fest";

type StrictConfig = NonNullableDeep<Config>;
```

## Behavior and migration notes

- `NonNullableDeep<T>` recursively removes `null` and `undefined` from all nested object properties.
- Validate parity if your legacy `DeepNonNullable` alias had different behavior for arrays, maps, or sets.
- Prefer explicit narrowing over deep non-nullable transformation where the required shape is known at the call site.

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-non-nullable-deep": "error",
        },
    },
];
```

## When not to use it

Disable this rule if your codebase intentionally standardizes `DeepNonNullable` naming or if your local alias provides additional constraints not present in the TypeFest utility.

## Package documentation

TypeFest package documentation:

Source file: [`source/non-nullable-deep.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/non-nullable-deep.d.ts)

````ts
/**
Deeply remove `null` and `undefined` from all properties of `T`.

Use-cases:
- Removing optional and nullable markers after a data-hydration step.
- Ensuring a configuration object has all required values present.

@example
```
import type {NonNullableDeep} from 'type-fest';

interface Config {
    host: string | null;
    port: number | undefined;
}

type StrictConfig = NonNullableDeep<Config>;
// => { host: string; port: number }
```

@category Object
*/
````

> **Rule catalog ID:** R098

## Further reading

- [TypeFest README](https://github.com/sindresorhus/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
