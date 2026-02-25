# prefer-ts-extras-key-in

Prefer [`keyIn`](https://github.com/sindresorhus/ts-extras#keyin) from `ts-extras` over `key in object` checks.

`keyIn(...)` provides better key narrowing for dynamic property checks.

## ❌ Incorrect

```ts
if (key in payload) {
    // ...
}
```

## ✅ Correct

```ts
if (keyIn(key, payload)) {
    // ...
}
```

## What this rule reports

- Native `key in object` expressions that can use `keyIn(key, object)`.

## Why this rule exists

`keyIn` expresses key-membership checks with a helper that improves key narrowing in typed code.

- Dynamic key checks have one canonical form.
- Guarded property access needs fewer casts.
- Membership guards are easier to audit in review.

## Behavior and migration notes

- Runtime semantics match the `in` operator for property existence on object/prototype chains.
- `keyIn` is useful when key values start as `string`/`PropertyKey` and need narrowing.
- If your code intentionally requires direct `in` syntax (for style or tooling), keep native checks.

## Additional examples

### ❌ Incorrect (additional scenario)

```ts
if (candidate in record) {
    console.log(record[candidate as keyof typeof record]);
}
```

### ✅ Correct (additional scenario)

```ts
if (keyIn(candidate, record)) {
    console.log(record[candidate]);
}
```

### ✅ Correct (team-scale usage)

```ts
const canRead = keyIn(data, selectedKey);
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-ts-extras-key-in": "error",
        },
    },
];
```

## When not to use it

Disable this rule if direct `in` expressions are required by coding standards.

## Further reading

- [`ts-extras` README](https://github.com/sindresorhus/ts-extras)
- [`ts-extras` package reference](https://www.npmjs.com/package/ts-extras)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
