# prefer-type-fest-keys-of-union

Require TypeFest `KeysOfUnion<T>` over imported aliases like `AllKeys`.

## Targeted pattern scope

This rule targets imported alias names used for "all keys across union members" extraction.

## What it checks

- Type references that resolve to imported `AllKeys` aliases.

## Why

`KeysOfUnion` is the canonical TypeFest utility for extracting the full key union across object unions. Using canonical utility names improves readability and consistency.

## ❌ Incorrect

```ts
import type { AllKeys } from "type-aliases";

type Keys = AllKeys<Foo | Bar>;
```

## ✅ Correct

```ts
import type { KeysOfUnion } from "type-fest";

type Keys = KeysOfUnion<Foo | Bar>;
```

## Behavior and migration notes

- `KeysOfUnion<T>` includes keys that appear in any member of an object union.
- This rule targets alias names with matching semantics (`AllKeys`).
- Use this utility when discriminated unions require full key introspection across variants.

## Additional examples

### ❌ Incorrect (additional scenario)

```ts
import type { AllKeys } from "type-aliases";

type Keys = AllKeys<A | B>;
```

### ✅ Correct (additional scenario)

```ts
import type { KeysOfUnion } from "type-fest";

type Keys = KeysOfUnion<A | B>;
```

### ✅ Correct (team-scale usage)

```ts
type EventKeys = KeysOfUnion<CreateEvent | DeleteEvent>;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-keys-of-union": "error",
        },
    },
];
```

## When not to use it

Disable this rule if existing alias names must remain for public API compatibility.

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
