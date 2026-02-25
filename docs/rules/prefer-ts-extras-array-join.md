# prefer-ts-extras-array-join

Prefer [`arrayJoin`](https://github.com/sindresorhus/ts-extras#arrayjoin) from `ts-extras` over `array.join(...)`.

`arrayJoin(...)` can preserve stronger tuple-aware typing when joining array values.

## ❌ Incorrect

```ts
const key = segments.join(":");
```

## ✅ Correct

```ts
const key = arrayJoin(segments, ":");
```

## What this rule reports

- `array.join(separator)` call sites that can use `arrayJoin(array, separator)`.

## Why this rule exists

`arrayJoin` keeps string assembly consistent and can preserve stronger string typing when arrays and separators are literals.

- Join operations use one helper style across modules.
- Literal-based join results are inferred more precisely in typed utilities.
- Join-heavy code paths avoid mixed native/helper patterns.

## Behavior and migration notes

- Runtime behavior matches native `Array.prototype.join`.
- Missing separator still defaults to `","`.
- `null` and `undefined` entries are converted to empty strings, matching native behavior.

## Additional examples

### ❌ Incorrect (additional scenario)

```ts
const route = segments.join("/");
```

### ✅ Correct (additional scenario)

```ts
const route = arrayJoin(segments, "/");
```

### ✅ Correct (team-scale usage)

```ts
const csv = arrayJoin(columns, ",");
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-ts-extras-array-join": "error",
        },
    },
];
```

## When not to use it

Disable this rule if your codebase requires native `.join()` for API consistency.

## Further reading

- [`ts-extras` README](https://github.com/sindresorhus/ts-extras)
- [`ts-extras` package reference](https://www.npmjs.com/package/ts-extras)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
