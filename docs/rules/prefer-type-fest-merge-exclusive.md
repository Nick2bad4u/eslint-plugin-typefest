# prefer-type-fest-merge-exclusive

Require TypeFest `MergeExclusive` over `XOR` aliases.

## Rule details

This rule standardizes mutually exclusive object-union helper usage on the canonical TypeFest utility name.

### What it checks

- Type references named `XOR`.

## ❌ Incorrect

```ts
type Selector = XOR<{ email: string }, { id: string }>;
```

## ✅ Correct

```ts
import type { MergeExclusive } from "type-fest";

type Selector = MergeExclusive<{ email: string }, { id: string }>;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-merge-exclusive": "error",
        },
    },
];
```

## When not to use it

Disable this rule if your codebase intentionally standardizes `XOR` naming instead of TypeFest.

## Further reading

- [TypeFest README](https://github.com/sindresorhus/type-fest)
- [TypeScript Handbook: Unions and Intersections](https://www.typescriptlang.org/docs/handbook/unions-and-intersections.html)
