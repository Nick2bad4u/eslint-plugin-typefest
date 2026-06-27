# prefer-ts-extras-object-assign

Prefer [`objectAssign`](https://github.com/sindresorhus/ts-extras/blob/main/source/object-assign.ts) from `ts-extras` over `Object.assign(...)`.

`objectAssign(...)` preserves `Object.assign(...)` runtime behavior while returning a more conservative and useful merge type for TypeScript.

## Targeted pattern scope

This rule focuses on direct `Object.assign(target, ...sources)` calls that can be migrated to `objectAssign(target, ...sources)` with deterministic fixes.

- `Object.assign(target, ...sources)` call sites that can use `objectAssign(target, ...sources)`.

Alias indirection, wrapper helpers, and non-canonical call shapes are excluded to keep `objectAssign(target, ...sources)` migrations safe.

## What this rule reports

This rule reports `Object.assign(target, ...sources)` call sites when `objectAssign(target, ...sources)` is the intended replacement.

- `Object.assign(target, ...sources)` call sites that can use `objectAssign(target, ...sources)`.

## Why this rule exists

`Object.assign` returns an intersection type for common merge patterns, which can produce misleading `never` properties when target and source keys conflict. `objectAssign` keeps the same runtime behavior but uses stronger merge typing.

- Overlapping keys keep target and source value types visible.
- Source-only keys are modeled conservatively.
- Team code converges on one explicit runtime helper for object merging.

## ❌ Incorrect

```ts
const merged = Object.assign({ a: 1 }, { a: "x" });
```

## ✅ Correct

```ts
const merged = objectAssign({ a: 1 }, { a: "x" });
```

## Behavior and migration notes

- Runtime semantics stay aligned with `Object.assign`.
- The target object is still mutated and returned.
- Source property enumeration behavior remains the same as native `Object.assign`.
- Use `objectUpdate` only when you intentionally want to restrict updates to existing writable target properties; it is not a general replacement for `Object.assign`.

## Additional examples

### Incorrect - Additional example

```ts
const settings = Object.assign({}, defaults, overrides);
```

### Correct - Additional example

```ts
const settings = objectAssign({}, defaults, overrides);
```

### Correct - Repository-wide usage

```ts
const normalized = objectAssign({ enabled: true }, options);
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
 {
  plugins: { typefest },
  rules: {
   "typefest/prefer-ts-extras-object-assign": "error",
  },
 },
];
```

## When not to use it

Disable this rule if you must use native `Object.assign` directly for interop constraints.

## Package documentation

ts-extras package documentation:

Source file: [`source/object-assign.ts`](https://github.com/sindresorhus/ts-extras/blob/main/source/object-assign.ts)

```ts
/**
 * A strongly-typed version of `Object.assign()`.
 *
 * This is useful since `Object.assign()` returns the intersection `Target &
 * Source`, which is unsound: conflicting property types are intersected (for
 * example, `{a: number} & {a: string}` makes `a` become `never`), and unsafe
 * access through index signatures is not caught.
 *
 * This function returns a conservative merged type instead, where source-only
 * keys are optional and overlapping keys include the target and source value
 * types.
 *
 * @category Improved builtin
 */
```

> **Rule catalog ID:** R125

## Further reading

- [`ts-extras` README](https://github.com/sindresorhus/ts-extras)
- [`ts-extras` package reference](https://www.npmjs.com/package/ts-extras)
- [TypeScript Handbook: Object Types](https://www.typescriptlang.org/docs/handbook/2/objects.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
