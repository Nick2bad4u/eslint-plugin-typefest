# prefer-ts-extras-object-from-entries

Prefer [`objectFromEntries`](https://github.com/sindresorhus/ts-extras#objectfromentries) from `ts-extras` over `Object.fromEntries(...)`.

`objectFromEntries(...)` preserves stronger key/value typing and avoids local casting after entry reconstruction.

## ❌ Incorrect

```ts
const statusById = Object.fromEntries(statusEntries);
```

## ✅ Correct

```ts
const statusById = objectFromEntries(statusEntries);
```

## What this rule reports

- `Object.fromEntries(entries)` call sites that can use `objectFromEntries(entries)`.

## Why this rule exists

`objectFromEntries` improves the reconstructed object type when building objects from typed entry tuples.

- Reconstructed key/value relationships are preserved more consistently.
- Follow-up casting after reconstruction is needed less often.
- Object reconstruction uses one explicit helper across modules.

## Behavior and migration notes

- Runtime semantics align with `Object.fromEntries`.
- Duplicate keys keep the last assigned entry, matching native behavior.
- Input must still be iterable entry pairs (`[key, value]`).
- If your entries are already widened to `[string, unknown]`, resulting object types remain broad.

## Additional examples

### ❌ Incorrect (additional scenario)

```ts
const config = Object.fromEntries(entries);
```

### ✅ Correct (additional scenario)

```ts
const config = objectFromEntries(entries);
```

### ✅ Correct (team-scale usage)

```ts
const grouped = objectFromEntries(pairs);
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-ts-extras-object-from-entries": "error",
        },
    },
];
```

## When not to use it

Disable this rule if you must keep direct `Object.fromEntries` calls for interop or platform constraints.

## Further reading

- [`ts-extras` README](https://github.com/sindresorhus/ts-extras)
- [`ts-extras` package reference](https://www.npmjs.com/package/ts-extras)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
