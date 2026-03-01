# prefer-ts-extras-is-defined

Require [`isDefined`](https://github.com/sindresorhus/ts-extras/blob/main/source/is-defined.ts) from `ts-extras` for direct undefined checks outside `Array.prototype.filter` callbacks.

## Targeted pattern scope

This rule limits analysis to exact AST patterns and explicit syntactic boundaries:

- Direct `Array.prototype.filter` syntax in its canonical AST form.
- Direct `value !== undefined` syntax in its canonical AST form.
- Direct `undefined !== value` syntax in its canonical AST form.
- Direct `typeof value !== "undefined"` syntax in its canonical AST form.
- Direct `value === undefined` syntax in its canonical AST form.
- Alias indirection, wrapper helpers, and semantically similar variants are out of scope unless they preserve the same AST shape.

## What this rule reports

This rule reports every occurrence of the matched pattern(s) below:

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

## Behavior and migration notes

- `isDefined(value)` is equivalent to `value !== undefined`.
- `!isDefined(value)` is equivalent to `value === undefined`.
- Filter-specific patterns are intentionally covered by `prefer-ts-extras-is-defined-filter`.

## Additional examples

### ❌ Incorrect — Additional example

```ts
if (sessionId !== undefined) {
    connect(sessionId);
}
```

### ✅ Correct — Additional example

```ts
if (isDefined(sessionId)) {
    connect(sessionId);
}
```

### ✅ Correct — Repository-wide usage

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

## Package documentation

ts-extras package documentation:

Source file: [`source/is-defined.ts`](https://github.com/sindresorhus/ts-extras/blob/main/source/is-defined.ts)

````ts
/**
Check whether a value is defined, meaning it is not `undefined`.

This can be useful as a type guard, as for example, `[1, undefined].filter(Boolean)` does not always type-guard correctly.

@example
```
import {isDefined} from 'ts-extras';

[1, undefined, 2].filter(isDefined);
//=> [1, 2]
```

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
