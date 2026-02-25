# prefer-ts-extras-set-has

Prefer [`setHas`](https://github.com/sindresorhus/ts-extras#sethas) from `ts-extras` over `set.has(...)`.

`setHas(...)` improves narrowing when checking membership in typed sets.

## ❌ Incorrect

```ts
const hasMonitor = monitorIds.has(candidateId);
```

## ✅ Correct

```ts
const hasMonitor = setHas(monitorIds, candidateId);
```

## What this rule reports

- `set.has(value)` call sites that can use `setHas(set, value)`.

## Why this rule exists

`setHas` provides a canonical membership-check helper with strong narrowing behavior for typed sets.

- Set membership guards have one helper style.
- Candidate values can narrow after guard checks.
- Native/helper mixing is removed from set-heavy code.

## Behavior and migration notes

- Runtime semantics match native `Set.prototype.has`.
- Equality semantics still follow SameValueZero.
- Narrowing benefits are strongest when checking unknown values against literal/unioned set members.

## Additional examples

### ❌ Incorrect (additional scenario)

```ts
if (allowed.has(input)) {
    use(input);
}
```

### ✅ Correct (additional scenario)

```ts
if (setHas(allowed, input)) {
    use(input);
}
```

### ✅ Correct (team-scale usage)

```ts
const known = setHas(codes, candidate);
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-ts-extras-set-has": "error",
        },
    },
];
```

## When not to use it

Disable this rule if native `.has()` calls are required by local conventions.

## Further reading

- [`ts-extras` README](https://github.com/sindresorhus/ts-extras)
- [`ts-extras` package reference](https://www.npmjs.com/package/ts-extras)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
