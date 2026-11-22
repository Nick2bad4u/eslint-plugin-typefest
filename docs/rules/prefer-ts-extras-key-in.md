# prefer-ts-extras-key-in

Prefer [`keyIn`](https://github.com/sindresorhus/ts-extras/blob/main/source/key-in.ts) from `ts-extras` over `key in object` checks.

`keyIn(...)` provides better key narrowing for dynamic property checks.

## Targeted pattern scope

This rule focuses on direct `key in object` expressions and reports `keyIn(object, key)` as an alternative.

## What this rule reports

The rule can autofix a safe literal key when the rewrite preserves evaluation and type narrowing. For dynamic keys, it can offer an editor suggestion.

## Why this rule exists

`keyIn` expresses key-membership checks with a helper that improves key narrowing in typed code.

- Dynamic key checks have one canonical form.
- Guarded property access needs fewer casts.
- Membership guards are easier to audit in review.

## ❌ Incorrect

```ts
if (key in payload) {
 // ...
}
```

## ✅ Correct

```ts
if (keyIn(payload, key)) {
 // ...
}
```

## Behavior and migration notes

- `keyIn` checks the prototype chain and always returns `false` for `"__proto__"` and `"constructor"`. Use native `in` when those keys must be checked.
- `keyIn` is useful when key values start as `string`/`PropertyKey` and need narrowing.
- If your code intentionally requires direct `in` syntax (for style or tooling), keep native checks.

## Additional examples

### ❌ Incorrect — Additional example

```ts
if (candidate in record) {
 console.log(record[candidate as keyof typeof record]);
}
```

### ✅ Correct — Additional example

```ts
if (keyIn(record, candidate)) {
 console.log(record[candidate]);
}
```

### ✅ Correct — Repository-wide usage

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

## Package documentation

ts-extras package documentation:

Source file: [`source/key-in.ts`](https://github.com/sindresorhus/ts-extras/blob/main/source/key-in.ts)

````ts
/**
 * Check if a key exists in an object and narrow the key type.
 *
 * This function performs **key narrowing** - it narrows the key variable to
 * only keys that actually exist in the object. Uses the `in` operator to check
 * the entire prototype chain.
 *
 * When `keyIn` returns `true`, the key is narrowed to keys that exist in the
 * object. When it returns `false`, the key type remains unchanged.
 *
 * Unlike `objectHasIn` and `objectHasOwn` (both do object narrowing), this
 * narrows the _key_ type, making it useful for validating union types of
 * possible keys.
 *
 * @category Type guard
 *
 * @example
 *  ```
 *  import {keyIn} from 'ts-extras';
 *
 *  const object = {foo: 1, bar: 2};
 *  const key = 'foo' as 'foo' | 'bar' | 'baz';
 *
 *  if (keyIn(object, key)) {
 *  // `key` is now: 'foo' | 'bar' (narrowed from union)
 *  console.log(object[key]); // Safe access
 *  } else {
 *  // `key` remains: 'foo' | 'bar' | 'baz' (unchanged)
 *  }
 *
 *  // Works with symbols
 *  const symbol = Symbol.for('myKey');
 *  const objectWithSymbol = {[symbol]: 'value'};
 *  if (keyIn(objectWithSymbol, symbol)) {
 *  // symbol is narrowed to existing symbol keys
 *  }
 *  ```
 *
 * @note This uses the `in` operator and checks the prototype chain, but blocks `__proto__` and `constructor` for security.
 */
````

> **Rule catalog ID:** R024

## Further reading

- [`ts-extras` README](https://github.com/sindresorhus/ts-extras)
- [`ts-extras` package reference](https://www.npmjs.com/package/ts-extras)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
