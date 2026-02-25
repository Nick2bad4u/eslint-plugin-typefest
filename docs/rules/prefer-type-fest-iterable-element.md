# prefer-type-fest-iterable-element

Require TypeFest `IterableElement<T>` over imported aliases like `SetElement`, `SetEntry`, and `SetValues`.

## What this rule reports

- Type references that resolve to imported `SetElement` aliases.
- Type references that resolve to imported `SetEntry` aliases.
- Type references that resolve to imported `SetValues` aliases.

## Why this rule exists

`IterableElement` is the canonical TypeFest utility for extracting element types from iterable collections. Consolidating on one name makes collection type extraction patterns easier to audit and maintain.

## ❌ Incorrect

```ts
import type { SetElement } from "type-aliases";

type Value = SetElement<Set<string>>;
```

## ✅ Correct

```ts
import type { IterableElement } from "type-fest";

type Value = IterableElement<Set<string>>;
```

## Behavior and migration notes

- This rule targets imported alias names that duplicate `IterableElement` semantics (`SetElement`, `SetEntry`, `SetValues`).
- Standardize on `IterableElement<T>` for sync and async iterable extraction patterns.
- Keep legacy alias names only when external libraries expose them as a required public API.

## Additional examples

### ❌ Incorrect (additional scenario)

```ts
import type { SetElement } from "type-aliases";

type Item = SetElement<Set<number>>;
```

### ✅ Correct (additional scenario)

```ts
import type { IterableElement } from "type-fest";

type Item = IterableElement<Set<number>>;
```

### ✅ Correct (team-scale usage)

```ts
type StreamChunk = IterableElement<AsyncIterable<string>>;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-iterable-element": "error",
        },
    },
];
```

## When not to use it

Disable this rule if compatibility requires preserving external alias names.

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
