# prefer-ts-extras-is-property-defined

Require [`isPropertyDefined`](https://github.com/sindresorhus/ts-extras/blob/main/source/is-property-defined.ts) from `ts-extras` in `Array.prototype.filter` callbacks instead of inline property-undefined checks.

## Targeted pattern scope

This rule only inspects inline `.filter(...)` predicates that perform an explicit `undefined` check against a single object property.

- Inline property-undefined predicates inside `.filter(...)`, including:
  - `filter((item) => item.prop !== undefined)`
  - `filter((item) => undefined !== item.prop)`
  - `filter((item) => item.prop != undefined)`
  - `filter((item) => typeof item.prop !== "undefined")`

Named predicate references, multi-argument callbacks, and broader callback logic are not matched unless they preserve this property-undefined-check shape.

## What this rule reports

This rule reports inline filter predicates that check whether a single object property is not `undefined` and can be normalized with `isPropertyDefined`.

## Why this rule exists

`filter(isPropertyDefined('prop'))` is the canonical `ts-extras` pattern for filtering out items where a specific property is `undefined`.

- Filtering logic is consistent and composable across collections.
- The property key is explicit in the function call, not hidden inside a callback.
- Repeated inline `!== undefined` callback expressions are removed.
- `isPropertyDefined` is a proper type predicate that narrows element types in the resulting array.

## ❌ Incorrect

```ts
const named = users.filter((user) => user.name !== undefined);
```

## ✅ Correct

```ts
import { isPropertyDefined } from "ts-extras";

const named = users.filter(isPropertyDefined("name"));
```

## Behavior and migration notes

- `isPropertyDefined('prop')` checks `item[prop] !== undefined` and narrows the result type accordingly.
- The autofix preserves the property name as a string literal.
- Deep property access (e.g., `user.address.street !== undefined`) is intentionally excluded — only single-level property checks are flagged.
- Computed property access (e.g., `user[key] !== undefined`) is intentionally excluded.

## Additional examples

### ❌ Incorrect — typeof form

```ts
const named = users.filter((user) => typeof user.name !== "undefined");
```

### ✅ Correct — typeof form fixed

```ts
const named = users.filter(isPropertyDefined("name"));
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-ts-extras-is-property-defined": "error",
        },
    },
];
```

## When not to use it

Disable this rule if your filter callbacks intentionally combine property checks with additional logic, or if the property name is dynamic.

## Package documentation

ts-extras package documentation:

Source file: [`source/is-property-defined.ts`](https://github.com/sindresorhus/ts-extras/blob/main/source/is-property-defined.ts)

````ts
/**
Returns a filter predicate that tests whether a given property key is defined (not `undefined`) on an object.

This is useful as a type guard in `Array.prototype.filter` to narrow the resulting array type.

@example
```
import {isPropertyDefined} from 'ts-extras';

interface User {
    name: string | undefined;
}

const users: User[] = [{ name: 'Alice' }, { name: undefined }];
const namedUsers = users.filter(isPropertyDefined('name'));
//=> [{ name: 'Alice' }]
```

@category Type guard
*/
````

> **Rule catalog ID:** R101

## Further reading

- [`ts-extras` README](https://github.com/sindresorhus/ts-extras)
- [`ts-extras` package reference](https://www.npmjs.com/package/ts-extras)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
