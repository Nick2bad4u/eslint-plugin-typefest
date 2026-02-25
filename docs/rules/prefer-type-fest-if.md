# prefer-type-fest-if

Require TypeFest `If` + `Is*` utilities over deprecated aliases like `IfAny`,
`IfNever`, `IfUnknown`, `IfNull`, and `IfEmptyObject`.

## Targeted pattern scope

This rule reports deprecated `IfAny`/`IfNever`/`IfUnknown`/`IfNull`/`IfEmptyObject` aliases and migrates usage to canonical `If<Is*>` patterns from `type-fest`.

It is intentionally strict about naming consistency and intentionally conservative
about fixing. Rewriting `IfAny<T, A, B>` into `If<IsAny<T>, A, B>` is a
structural transform, not a safe one-token rename.

## What it checks

- Imported type aliases used as identifier type references:
  - `IfAny`
  - `IfNever`
  - `IfUnknown`
  - `IfNull`
  - `IfEmptyObject`

### Detection boundaries

- ✅ Reports `import type { IfAny } ...` followed by `IfAny<...>` usage.
- ❌ Does not report locally renamed imports (`import type { IfAny as AliasIfAny } ...`).
- ❌ Does not report namespace-qualified references like `TypeUtils.IfAny<...>` (the matcher targets identifier references).
- ❌ Does not auto-fix because replacement requires rebuilding type arguments.

## Why

These aliases are deprecated in TypeFest. The canonical pattern is to use
`If<...>` with the corresponding `Is*` utility (for example, `If<IsAny<T>, ...>`).

In practice, teams that keep old aliases around end up with mixed style across
packages (`IfAny`, `IfUnknown`, custom wrappers). This rule prevents that drift.

## ❌ Incorrect

```ts
import type { IfAny } from "type-fest";

type Result = IfAny<T, "any", "not-any">;
```

## ✅ Correct

```ts
import type { If, IsAny } from "type-fest";

type Result = If<IsAny<T>, "any", "not-any">;
```

## Behavior and migration notes

- Deprecated aliases map to `If<Is*>` forms (`IfAny` → `If<IsAny<...>>`, etc.).
- This rule intentionally does not auto-fix because argument restructuring must be explicit and reviewable.
- Keep migration focused on parity: preserve branch types and generic parameter order during conversion.

## Additional examples

### ❌ Incorrect (additional scenario)

```ts
import type { IfUnknown } from "custom-type-utils";

type ParseMode<T> = IfUnknown<T, "strict", "lenient">;
```

### ✅ Correct (additional scenario)

```ts
import type { If, IsUnknown } from "type-fest";

type ParseMode<T> = If<IsUnknown<T>, "strict", "lenient">;
```

### ✅ Correct (team-scale usage)

```ts
import type { If, IsNull } from "type-fest";

type NullLabel<T> = If<IsNull<T>, "nullable", "non-nullable">;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-if": "error",
        },
    },
];
```

## When not to use it

Disable this rule if legacy alias naming must be preserved for compatibility.

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
