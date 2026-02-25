# prefer-ts-extras-is-present

Require `isPresent` from `ts-extras` for direct nullish checks outside `Array.prototype.filter` callbacks.

## What this rule reports

- Direct nullish checks outside `Array.prototype.filter` callbacks:
  - `value != null`
  - `value == null`
  - `value !== null && value !== undefined`
  - `value === null || value === undefined`

## Why this rule exists

`isPresent` gives one canonical predicate for non-nullish checks and reduces mixed null/undefined comparison styles.

- Nullish guard intent is explicit.
- Narrowing to `NonNullable<T>` follows one convention.
- Verbose inline nullish checks are removed.

## Behavior and migration notes

- `isPresent(value)` means value is neither `null` nor `undefined`.
- `!isPresent(value)` is the nullish guard equivalent.
- Filter-specific nullish patterns are covered by `prefer-ts-extras-is-present-filter`.

## ❌ Incorrect

```ts
if (value != null) {
    consume(value);
}

if (value === null || value === undefined) {
    return;
}
```

## ✅ Correct

```ts
if (isPresent(value)) {
    consume(value);
}

if (!isPresent(value)) {
    return;
}
```

## Additional examples

### ❌ Incorrect (additional scenario)

```ts
if (profile != null) {
    render(profile);
}
```

### ✅ Correct (additional scenario)

```ts
if (isPresent(profile)) {
    render(profile);
}
```

### ✅ Correct (team-scale usage)

```ts
const available = isPresent(cacheEntry);
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-ts-extras-is-present": "error",
        },
    },
];
```

## When not to use it

Disable this rule if your code style requires explicit `=== null` / `=== undefined` branches.

## Further reading

- [`ts-extras` README](https://github.com/sindresorhus/ts-extras)
- [`ts-extras` package reference](https://www.npmjs.com/package/ts-extras)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
