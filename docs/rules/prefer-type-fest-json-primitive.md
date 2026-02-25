# prefer-type-fest-json-primitive

Require TypeFest `JsonPrimitive` over explicit JSON primitive keyword unions.

## What this rule reports

- `boolean | null | number | string` unions (in any order)

## Why this rule exists

`JsonPrimitive` communicates JSON primitive intent directly and avoids repeating equivalent keyword-union definitions.

## ❌ Incorrect

```ts
type Scalar = string | number | boolean | null;
```

## ✅ Correct

```ts
type Scalar = JsonPrimitive;
```

## Behavior and migration notes

- `JsonPrimitive` covers `string | number | boolean | null`.
- The union order in source code is irrelevant; this rule targets the shape, not token order.
- Keep this alias for scalar JSON domains while using `JsonValue` for full recursive JSON values.

## Additional examples

### ❌ Incorrect (additional scenario)

```ts
type PrimitiveValue = string | number | boolean | null;
```

### ✅ Correct (additional scenario)

```ts
type PrimitiveValue = JsonPrimitive;
```

### ✅ Correct (team-scale usage)

```ts
type Cell = JsonPrimitive;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-json-primitive": "error",
        },
    },
];
```

## When not to use it

Disable this rule if existing exported aliases must remain stable.

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
