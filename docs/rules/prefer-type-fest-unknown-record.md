# prefer-type-fest-unknown-record

Prefers `UnknownRecord` from TypeFest over `Record<string, unknown>` in architecture-critical layers.

## What this rule reports

- `Record<string, unknown>` type references in configured boundary paths (for example shared contracts and IPC-adjacent layers).

## Why this rule exists

`UnknownRecord` conveys intent directly and keeps boundary contracts consistent with TypeFest-first typing conventions.

## ❌ Incorrect

```ts
type Payload = Record<string, unknown>;
```

## ✅ Correct

```ts
type Payload = UnknownRecord;
```

## Behavior and migration notes

- `UnknownRecord` is the canonical dictionary-like unknown-object alias in `type-fest`.
- Standardize boundary object contracts on `UnknownRecord` instead of repeating `Record<string, unknown>`.
- Keep runtime validation and field narrowing at call sites that consume unknown records.

## Additional examples

### ❌ Incorrect (additional scenario)

```ts
type Input = Record<string, unknown>;
```

### ✅ Correct (additional scenario)

```ts
type Input = UnknownRecord;
```

### ✅ Correct (team-scale usage)

```ts
type EventPayload = UnknownRecord;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-unknown-record": "error",
        },
    },
];
```

## When not to use it

Disable this rule if a public contract requires preserving existing record alias names.

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
