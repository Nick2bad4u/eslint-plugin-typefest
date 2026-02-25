# prefer-type-fest-merge-exclusive

Require TypeFest `MergeExclusive` over `XOR` aliases.

## Targeted pattern scope

This rule reports `XOR<...>` helper aliases and prefers `MergeExclusive<...>` for mutually exclusive object contracts.

### What it checks

- Type references named `XOR`.

### Detection boundaries

- ✅ Reports direct `XOR<...>` type references.
- ❌ Does not auto-fix when project-local `XOR` semantics differ from `MergeExclusive`.

## Why this rule exists

`MergeExclusive<A, B>` is the canonical TypeFest utility for object-level XOR constraints.

Unifying on one name reduces contract ambiguity in auth/selectors where two modes must be mutually exclusive.

## ❌ Incorrect

```ts
type Selector = XOR<{ email: string }, { id: string }>;
```

## ✅ Correct

```ts
import type { MergeExclusive } from "type-fest";

type Selector = MergeExclusive<{ email: string }, { id: string }>;
```

## Behavior and migration notes

- `MergeExclusive` ensures overlapping key sets cannot be simultaneously satisfied.
- Verify parity if your legacy `XOR` helper applied custom key normalization.
- Keep mutually exclusive contract types near API boundaries to improve review clarity.

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

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
