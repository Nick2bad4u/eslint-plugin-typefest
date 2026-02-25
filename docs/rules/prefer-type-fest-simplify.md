# prefer-type-fest-simplify

Require TypeFest `Simplify<T>` over imported `Prettify<T>` / `Expand<T>` aliases.

## What this rule reports

- Type references that resolve to imported `Prettify` aliases.
- Type references that resolve to imported `Expand` aliases.

## Why this rule exists

`Simplify` is the canonical flattening utility provided by type-fest. Standardizing on it reduces utility-name churn across codebases and keeps helper usage consistent with TypeFest defaults.

## ❌ Incorrect

```ts
import type { Prettify } from "type-aliases";

type ViewModel = Prettify<Base & Extra>;
```

## ✅ Correct

```ts
import type { Simplify } from "type-fest";

type ViewModel = Simplify<Base & Extra>;
```

## Behavior and migration notes

- `Simplify<T>` normalizes intersections and mapped-type output into a flattened object shape for editor display and assignability workflows.
- This rule targets imported alias names with overlapping semantics (`Prettify`, `Expand`).
- Keep aliases only when they intentionally add semantics beyond plain type flattening.

## Additional examples

### ❌ Incorrect (additional scenario)

```ts
import type { Expand } from "type-aliases";

type UIModel = Expand<Base & Extra>;
```

### ✅ Correct (additional scenario)

```ts
import type { Simplify } from "type-fest";

type UIModel = Simplify<Base & Extra>;
```

### ✅ Correct (team-scale usage)

```ts
type ApiModel = Simplify<ResponseBase & ResponseExtra>;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-simplify": "error",
        },
    },
];
```

## When not to use it

Disable this rule if internal tooling depends on existing alias names.

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
