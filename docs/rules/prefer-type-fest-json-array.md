# prefer-type-fest-json-array

Require TypeFest `JsonArray` over explicit `JsonValue` array-union aliases.

## What this rule reports

- `JsonValue[] | readonly JsonValue[]`
- `Array<JsonValue> | ReadonlyArray<JsonValue>`

## Why this rule exists

`JsonArray` communicates JSON array intent directly and avoids repeating equivalent array union shapes.

## ❌ Incorrect

```ts
type Payload = JsonValue[] | readonly JsonValue[];
```

## ✅ Correct

```ts
type Payload = JsonArray;
```

## Behavior and migration notes

- `JsonArray` is the canonical alias for JSON arrays in `type-fest`.
- Keep `JsonValue[] | readonly JsonValue[]` usage out of shared contracts to avoid duplicate representations.
- Prefer one canonical alias per concept to reduce type alias drift across packages.

## Additional examples

### ❌ Incorrect (additional scenario)

```ts
type Payload = Array<JsonValue>;
```

### ✅ Correct (additional scenario)

```ts
type Payload = JsonArray;
```

### ✅ Correct (team-scale usage)

```ts
type SerializedRows = JsonArray;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-json-array": "error",
        },
    },
];
```

## When not to use it

Disable this rule if public APIs must preserve existing custom alias names for compatibility.

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
