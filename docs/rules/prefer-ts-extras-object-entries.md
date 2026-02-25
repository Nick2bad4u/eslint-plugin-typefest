# prefer-ts-extras-object-entries

Prefer [`objectEntries`](https://github.com/sindresorhus/ts-extras#objectentries) from `ts-extras` over `Object.entries(...)`.

`objectEntries(...)` preserves stronger key/value typing for object iteration and reduces local casting noise.

## ❌ Incorrect

```ts
const pairs = Object.entries(siteStatusById);
```

## ✅ Correct

```ts
const pairs = objectEntries(siteStatusById);
```

## What this rule reports

- `Object.entries(value)` call sites that can use `objectEntries(value)`.

## Why this rule exists

`objectEntries` gives better static typing for entry iteration, especially when the object has known keys.

- Key unions are preserved more consistently in loops.
- Value access in tuple destructuring needs fewer local casts.
- Team code converges on one explicit runtime helper for entry iteration.

## Behavior and migration notes

- Runtime semantics stay aligned with `Object.entries` (own enumerable string-keyed entries only).
- Property order behavior remains the same as native `Object.entries`.
- Symbol keys are still excluded, just like native behavior.
- For loosely typed inputs (for example `Record<string, unknown>`), key type remains broad (`string`).

## Additional examples

### ❌ Incorrect (additional scenario)

```ts
const entries = Object.entries(settings);
```

### ✅ Correct (additional scenario)

```ts
const entries = objectEntries(settings);
```

### ✅ Correct (team-scale usage)

```ts
for (const [key, value] of objectEntries(env)) {
    void key;
    void value;
}
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-ts-extras-object-entries": "error",
        },
    },
];
```

## When not to use it

Disable this rule if you must use native `Object.entries` directly for interop constraints.

## Further reading

- [`ts-extras` README](https://github.com/sindresorhus/ts-extras)
- [`ts-extras` package reference](https://www.npmjs.com/package/ts-extras)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
