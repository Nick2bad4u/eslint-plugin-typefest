# prefer-type-fest-json-value

Prefers TypeFest JSON types (`JsonValue`, `JsonObject`) for serialization-bound payload/context contracts.

## What this rule reports

- Payload/context-like contract aliases using `Record<string, unknown>`/`Record<string, any>` in JSON boundary folders.

## Why this rule exists

Serialization boundaries should declare JSON-compatible intent directly so type safety and runtime assumptions stay aligned.

## ❌ Incorrect

```ts
type Payload = Record<string, unknown>;
```

## ✅ Correct

```ts
type Payload = JsonValue;
```

## Behavior and migration notes

- `JsonValue` represents the full recursive JSON domain.
- Use `JsonValue` for serialized payload boundaries where runtime data must be JSON-compatible.
- Replace open-ended `Record<string, unknown>`/`any` boundary contracts with JSON-specific types when schema intent is serialization.

## Additional examples

### ❌ Incorrect (additional scenario)

```ts
type ConfigSnapshot = string | number | boolean | null | JsonObject | JsonArray;
```

### ✅ Correct (additional scenario)

```ts
type ConfigSnapshot = JsonValue;
```

### ✅ Correct (team-scale usage)

```ts
type CacheEntry = JsonValue;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-json-value": "error",
        },
    },
];
```

## When not to use it

Disable this rule if boundary contracts intentionally allow non-JSON runtime values.

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
