# prefer-ts-extras-array-concat

Prefer [`arrayConcat`](https://github.com/sindresorhus/ts-extras#arrayconcat) from `ts-extras` over `array.concat(...)`.

`arrayConcat(...)` preserves stronger tuple and readonly-array typing across generic flows.

## ❌ Incorrect

```ts
const allIds = primaryIds.concat(secondaryIds);
```

## ✅ Correct

```ts
const allIds = arrayConcat(primaryIds, secondaryIds);
```

## What this rule reports

- `left.concat(right)` call sites that can use `arrayConcat(left, right)`.

## Why this rule exists

`arrayConcat` preserves tuple/readonly array typing better when concatenating heterogeneous arrays.

- The output element type is inferred more predictably in generic utilities.
- Concatenation style is consistent with other `ts-extras` array helpers.
- Post-concat casts are needed less often.

## Behavior and migration notes

- Runtime behavior matches native `Array.prototype.concat`.
- Concatenation is still shallow (no deep cloning).
- Array arguments are flattened one level, matching native concat semantics.

## Additional examples

### ❌ Incorrect (additional scenario)

```ts
const combined = left.concat(right);
```

### ✅ Correct (additional scenario)

```ts
const combined = arrayConcat(left, right);
```

### ✅ Correct (team-scale usage)

```ts
const merged = arrayConcat(baseFlags, envFlags);
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-ts-extras-array-concat": "error",
        },
    },
];
```

## When not to use it

Disable this rule if your codebase standardizes on native `.concat()` for framework interop.

## Further reading

- [`ts-extras` README](https://github.com/sindresorhus/ts-extras)
- [`ts-extras` package reference](https://www.npmjs.com/package/ts-extras)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
