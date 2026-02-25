# prefer-ts-extras-array-at

Prefer [`arrayAt`](https://github.com/sindresorhus/ts-extras#arrayat) from `ts-extras` over `array.at(...)`.

`arrayAt(...)` preserves stronger element typing for indexed array access.

## ❌ Incorrect

```ts
const firstStatus = statuses.at(0);
```

## ✅ Correct

```ts
const firstStatus = arrayAt(statuses, 0);
```

## What this rule reports

- `array.at(index)` call sites that can use `arrayAt(array, index)`.

## Why this rule exists

`arrayAt` keeps indexed access explicit and improves type inference for tuples and readonly arrays.

- Indexing logic is standardized across modules.
- Tuple element access needs fewer local casts.
- Call sites remain explicit about both source array and index.

## Behavior and migration notes

- Runtime semantics align with `Array.prototype.at`.
- Negative indexes are supported (`-1` means last element).
- Out-of-range access still returns `undefined`.

## Additional examples

### ❌ Incorrect (additional scenario)

```ts
const selected = tuple.at(-1); // Weaker tuple index inference
```

### ✅ Correct (additional scenario)

```ts
const selected = arrayAt(tuple, -1);
```

### ✅ Correct (team-scale usage)

```ts
const first = arrayAt(users, 0);
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-ts-extras-array-at": "error",
        },
    },
];
```

## When not to use it

Disable this rule if native `.at()` usage is required by a local coding standard.

## Further reading

- [`ts-extras` README](https://github.com/sindresorhus/ts-extras)
- [`ts-extras` package reference](https://www.npmjs.com/package/ts-extras)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
