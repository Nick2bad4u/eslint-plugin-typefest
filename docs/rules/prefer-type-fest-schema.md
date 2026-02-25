# prefer-type-fest-schema

Require TypeFest `Schema<ObjectType, ValueType>` over imported aliases like `RecordDeep`.

## Targeted pattern scope

This rule keeps deep object-shape transforms on the canonical `type-fest`
utility: `Schema<ObjectType, ValueType>`.

It is designed for consistency, not aggressive rewriting. Replacing third-party
aliases such as `RecordDeep` with `Schema` is usually straightforward, but you
should still validate semantics if your old utility had custom behavior.

## What it checks

- Imported `RecordDeep` aliases used as identifier type references.

### Detection boundaries

- ✅ Reports `import type { RecordDeep } ...` + `RecordDeep<...>` usage.
- ❌ Does not report locally renamed imports (`RecordDeep as AliasRecordDeep`).
- ❌ Does not report namespace-qualified usages such as `TypeUtils.RecordDeep<...>`.
- ❌ Does not auto-fix.

## Why

`Schema` is the canonical TypeFest utility for deep value-shape transformation across object types. Standardized naming helps readers recognize intent immediately.

`type-fest` describes itself as **"A collection of essential TypeScript
types"**. Using canonical names means engineers can jump directly between your
code and upstream docs without translation.

## ❌ Incorrect

```ts
import type { RecordDeep } from "type-aliases";

type Flags = RecordDeep<Config, boolean>;
```

## ✅ Correct

```ts
import type { Schema } from "type-fest";

type Flags = Schema<Config, boolean>;
```

## Behavior and migration notes

- `Schema<ObjectType, ValueType>` recursively maps leaf value types while preserving object shape.
- This rule targets imported alias names with overlapping semantics (`RecordDeep`).
- Validate behavior if your previous alias implemented custom deep-mapping edge cases beyond `Schema`.

## Additional examples

### ❌ Incorrect (additional scenario)

```ts
import type { RecordDeep } from "custom-type-utils";

type AuditMask = RecordDeep<UserProfile, "REDACTED">;
```

### ✅ Correct (additional scenario)

```ts
import type { Schema } from "type-fest";

type AuditMask = Schema<UserProfile, "REDACTED">;
```

### ✅ Correct (team-scale usage)

```ts
type FeatureFlags = Schema<EnvironmentConfig, boolean>;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-schema": "error",
        },
    },
];
```

## When not to use it

Disable this rule if existing deep-shape aliases encode custom semantics that differ from `Schema`.

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
