# prefer-type-fest-json-object

Require TypeFest `JsonObject` over equivalent explicit `Record<string, JsonValue>` aliases.

## What this rule reports

- `Record<string, JsonValue>`

## Why this rule exists

`JsonObject` communicates intent directly and avoids repeating verbose JSON object alias patterns.

## ❌ Incorrect

```ts
type Payload = Record<string, JsonValue>;
```

## ✅ Correct

```ts
type Payload = JsonObject;
```

## Behavior and migration notes

- `JsonObject` is equivalent in intent to `Record<string, JsonValue>` for JSON object contracts.
- Standardize on `JsonObject` for shared payload/config types to avoid repeating low-level dictionary syntax.
- Keep runtime validation separate; this rule only normalizes compile-time type naming.

## Additional examples

### ❌ Incorrect (additional scenario)

```ts
type Payload = Record<string, JsonValue>;
```

### ✅ Correct (additional scenario)

```ts
type Payload = JsonObject;
```

### ✅ Correct (team-scale usage)

```ts
type EventAttributes = JsonObject;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-json-object": "error",
        },
    },
];
```

## When not to use it

Disable this rule if a published API requires preserving existing alias names.

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
