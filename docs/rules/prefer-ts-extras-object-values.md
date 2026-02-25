# prefer-ts-extras-object-values

Prefer [`objectValues`](https://github.com/sindresorhus/ts-extras#objectvalues) from `ts-extras` over `Object.values(...)`.

`objectValues(...)` preserves stronger value typing and keeps value iteration contracts explicit.

## ❌ Incorrect

```ts
const values = Object.values(siteStateMap);
```

## ✅ Correct

```ts
const values = objectValues(siteStateMap);
```

## What this rule reports

- `Object.values(value)` call sites that can use `objectValues(value)`.

## Why this rule exists

`objectValues` improves value typing during iteration and post-processing.

- Value unions are preserved more consistently.
- Downstream map/filter code needs fewer local casts.
- Value extraction style stays consistent across modules.

## Behavior and migration notes

- Runtime semantics align with `Object.values` (own enumerable string-keyed values).
- Symbol-keyed values remain excluded, matching native behavior.
- For broadly typed records, resulting value types remain broad.

## Additional examples

### ❌ Incorrect (additional scenario)

```ts
const values = Object.values(features);
```

### ✅ Correct (additional scenario)

```ts
const values = objectValues(features);
```

### ✅ Correct (team-scale usage)

```ts
const labels = objectValues(enumLikeObject);
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-ts-extras-object-values": "error",
        },
    },
];
```

## When not to use it

Disable this rule if direct `Object.values` calls are required for interop constraints.

## Further reading

- [`ts-extras` README](https://github.com/sindresorhus/ts-extras)
- [`ts-extras` package reference](https://www.npmjs.com/package/ts-extras)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
