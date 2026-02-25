# prefer-type-fest-unknown-map

Require TypeFest `UnknownMap` over `ReadonlyMap<unknown, unknown>`.

## What this rule reports

- `ReadonlyMap<unknown, unknown>` type references.

## Why this rule exists

`UnknownMap` communicates intent directly and keeps unknown-container aliases consistent with other TypeFest-first conventions in this plugin.

## ❌ Incorrect

```ts
type Meta = ReadonlyMap<unknown, unknown>;
```

## ✅ Correct

```ts
type Meta = UnknownMap;
```

## Behavior and migration notes

- `UnknownMap` is a canonical alias for maps with unknown key/value pairs.
- Normalize map ingress contracts to one alias instead of repeating `ReadonlyMap<unknown, unknown>`.
- Narrow key/value types at use sites after validating actual runtime shapes.

## Additional examples

### ❌ Incorrect (additional scenario)

```ts
type Store = ReadonlyMap<unknown, unknown>;
```

### ✅ Correct (additional scenario)

```ts
type Store = UnknownMap;
```

### ✅ Correct (team-scale usage)

```ts
type Metadata = UnknownMap;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-unknown-map": "error",
        },
    },
];
```

## When not to use it

Disable this rule if published contracts must preserve existing map alias names.

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
