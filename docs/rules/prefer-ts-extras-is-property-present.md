# prefer-ts-extras-is-property-present

Require [`isPropertyPresent`](https://github.com/sindresorhus/ts-extras/blob/main/source/is-property-present.ts) from `ts-extras` in `Array.prototype.filter` callbacks instead of inline property-nullish checks.

## Targeted pattern scope

This rule only inspects inline `.filter(...)` predicates that perform an explicit loose-null check against a single object property.

- Inline property-nullish predicates inside `.filter(...)`, including:
  - `filter((item) => item.prop != null)`
  - `filter((item) => null != item.prop)`

Named predicate references, multi-argument callbacks, and stricter equality checks are not matched.

## What this rule reports

This rule reports inline filter predicates that check whether a single object property is not `null` (using loose equality, which also catches `undefined`) and can be normalized with `isPropertyPresent`.

## Why this rule exists

`filter(isPropertyPresent('prop'))` is the canonical `ts-extras` pattern for filtering out items where a specific property is `null` or `undefined`.

- Filtering logic is consistent and composable across collections.
- The property key is explicit in the function call, not embedded inside a callback expression.
- Repeated inline `!= null` callback expressions are removed.
- `isPropertyPresent` is a proper type predicate that narrows element types in the resulting array to exclude both `null` and `undefined`.

## ❌ Incorrect

```ts
const titled = posts.filter((post) => post.title != null);
```

## ✅ Correct

```ts
import { isPropertyPresent } from "ts-extras";

const titled = posts.filter(isPropertyPresent("title"));
```

## Behavior and migration notes

- `isPropertyPresent('prop')` checks `item[prop] != null`, which is `true` when the value is neither `null` nor `undefined`.
- The autofix preserves the property name as a string literal.
- Strict null checks (e.g., `post.title !== null`) are intentionally excluded — those do not narrow away `undefined`.
- Deep property access (e.g., `post.meta.title != null`) is intentionally excluded — only single-level property checks are flagged.
- Computed property access (e.g., `post[key] != null`) is intentionally excluded.

## Additional examples

### ❌ Incorrect — reversed operands

```ts
const titled = posts.filter((post) => null != post.title);
```

### ✅ Correct — reversed operands fixed

```ts
const titled = posts.filter(isPropertyPresent("title"));
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-ts-extras-is-property-present": "error",
        },
    },
];
```

## When not to use it

Disable this rule if your filter callbacks intentionally combine property checks with additional logic, or if the property name is dynamic.

## Package documentation

ts-extras package documentation:

Source file: [`source/is-property-present.ts`](https://github.com/sindresorhus/ts-extras/blob/main/source/is-property-present.ts)

````ts
/**
Returns a filter predicate that tests whether a given property key is present (non-nullable) on an object.

This is useful as a type guard in `Array.prototype.filter` to narrow the resulting array type by removing `null` and `undefined` property values.

@example
```
import {isPropertyPresent} from 'ts-extras';

interface Post {
    title: string | null | undefined;
}

const posts: Post[] = [{ title: 'Hello' }, { title: null }];
const titledPosts = posts.filter(isPropertyPresent('title'));
//=> [{ title: 'Hello' }]
```

@category Type guard
*/
````

> **Rule catalog ID:** R102

## Further reading

- [`ts-extras` README](https://github.com/sindresorhus/ts-extras)
- [`ts-extras` package reference](https://www.npmjs.com/package/ts-extras)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
