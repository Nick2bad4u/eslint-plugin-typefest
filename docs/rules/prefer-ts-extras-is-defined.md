# prefer-ts-extras-is-defined

Require `isDefined` from `ts-extras` for direct undefined checks outside `Array.prototype.filter` callbacks.

## What this rule reports

- Direct undefined checks outside `Array.prototype.filter` callbacks:
  - `value !== undefined`
  - `undefined !== value`
  - `typeof value !== "undefined"`
  - `value === undefined`

## Why this rule exists

`isDefined` turns repeated undefined comparisons into one canonical predicate.

- Guard intent is explicit at call sites.
- Narrowing style is consistent across modules.
- Repeated inline comparison variants are removed.

## Behavior and migration notes

- `isDefined(value)` is equivalent to `value !== undefined`.
- `!isDefined(value)` is equivalent to `value === undefined`.
- Filter-specific patterns are intentionally covered by `prefer-ts-extras-is-defined-filter`.

## ❌ Incorrect

```ts
if (value !== undefined) {
    consume(value);
}

if (value === undefined) {
    return;
}
```

## ✅ Correct

```ts
if (isDefined(value)) {
    consume(value);
}

if (!isDefined(value)) {
    return;
}
```

## Additional examples

### ❌ Incorrect (additional scenario)

```ts
if (sessionId !== undefined) {
    connect(sessionId);
}
```

### ✅ Correct (additional scenario)

```ts
if (isDefined(sessionId)) {
    connect(sessionId);
}
```

### ✅ Correct (team-scale usage)

```ts
const hasValue = isDefined(input);
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-ts-extras-is-defined": "error",
        },
    },
];
```

## When not to use it

Disable this rule if your team uses explicit `=== undefined` comparisons as a required style convention.

## Further reading

- [`ts-extras` README](https://github.com/sindresorhus/ts-extras)
- [`ts-extras` package reference](https://www.npmjs.com/package/ts-extras)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
