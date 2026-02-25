# prefer-type-fest-omit-index-signature

Require TypeFest `OmitIndexSignature<T>` over imported aliases like
`RemoveIndexSignature`.

## Targeted pattern scope

This rule targets imported alias names used for removing index signatures from object types.

## What it checks

- Type references that resolve to imported `RemoveIndexSignature` aliases.

## Why

`OmitIndexSignature` is the canonical TypeFest utility for stripping index
signatures while preserving explicitly-declared fields. Using the canonical
name improves consistency across utility libraries.

## ❌ Incorrect

```ts
import type { RemoveIndexSignature } from "type-zoo";

type StrictUser = RemoveIndexSignature<User>;
```

## ✅ Correct

```ts
import type { OmitIndexSignature } from "type-fest";

type StrictUser = OmitIndexSignature<User>;
```

## Behavior and migration notes

- `OmitIndexSignature<T>` strips broad index signatures while preserving explicit properties.
- This rule targets alias names with equivalent semantics (`RemoveIndexSignature`).
- Use it when converting permissive dictionary-like types into explicit contract shapes.

## Additional examples

### ❌ Incorrect (additional scenario)

```ts
import type { RemoveIndexSignature } from "type-zoo";

type Explicit = RemoveIndexSignature<User>;
```

### ✅ Correct (additional scenario)

```ts
import type { OmitIndexSignature } from "type-fest";

type Explicit = OmitIndexSignature<User>;
```

### ✅ Correct (team-scale usage)

```ts
type PublicModel = OmitIndexSignature<ModelWithIndex>;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-omit-index-signature": "error",
        },
    },
];
```

## When not to use it

Disable this rule if external contract compatibility requires existing alias names.

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
