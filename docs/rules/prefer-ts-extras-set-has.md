# prefer-ts-extras-set-has

Prefer [`setHas`](https://github.com/sindresorhus/ts-extras/blob/main/source/set-has.ts) from `ts-extras` over `set.has(...)`.

`setHas(...)` improves narrowing when checking membership in typed sets.

## Targeted pattern scope

This rule focuses on a narrow, deterministic set of syntactic forms:

- `set.has(value)` call sites that can use `setHas(set, value)`.

These boundaries keep reporting and migration behavior deterministic.

## What this rule reports

- `set.has(value)` call sites that can use `setHas(set, value)`.

## Why this rule exists

`setHas` provides a canonical membership-check helper with strong narrowing behavior for typed sets.

- Set membership guards have one helper style.
- Candidate values can narrow after guard checks.
- Native/helper mixing is removed from set-heavy code.

## ❌ Incorrect

```ts
const hasMonitor = monitorIds.has(candidateId);
```

## ✅ Correct

```ts
const hasMonitor = setHas(monitorIds, candidateId);
```

## Behavior and migration notes

- Runtime semantics match native `Set.prototype.has`.
- Equality semantics still follow SameValueZero.
- Narrowing benefits are strongest when checking unknown values against literal/unioned set members.

## Additional examples

### ❌ Incorrect — Additional example

```ts
if (allowed.has(input)) {
    use(input);
}
```

### ✅ Correct — Additional example

```ts
if (setHas(allowed, input)) {
    use(input);
}
```

### ✅ Correct — Repository-wide usage

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

## Package documentation

ts-extras package documentation:

Source file: [`source/set-has.ts`](https://github.com/sindresorhus/ts-extras/blob/main/source/set-has.ts)

````ts
/**
A strongly-typed version of `Set#has()` that properly acts as a type guard.

When `setHas` returns `true`, the type is narrowed to the set's element type.
When it returns `false`, the type remains unchanged (i.e., `unknown` stays `unknown`).

It was [rejected](https://github.com/microsoft/TypeScript/issues/42641#issuecomment-774168319) from being done in TypeScript itself.

@example
```
import {setHas} from 'ts-extras';

const values = ['a', 'b', 'c'] as const;
const valueSet = new Set(values);
const valueToCheck: unknown = 'a';

if (setHas(valueSet, valueToCheck)) {
    // We now know that the value is of type `typeof values[number]`.
} else {
    // The value remains `unknown`.
}
```

@category Improved builtin
@category Type guard
*/
````

## Further reading

- [`ts-extras` README](https://github.com/sindresorhus/ts-extras)
- [`ts-extras` package reference](https://www.npmjs.com/package/ts-extras)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
