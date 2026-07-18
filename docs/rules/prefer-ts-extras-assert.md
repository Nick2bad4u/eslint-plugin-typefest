# prefer-ts-extras-assert

Require [`assert`](https://github.com/sindresorhus/ts-extras/blob/main/source/assert.ts) from `ts-extras` over exact manual negated-condition guards that throw the global `Error`.

## Targeted pattern scope

This rule deliberately recognizes only guards that map directly to
`assert(condition, message)` without changing the thrown error class or message.

### Matched patterns

- `if (!condition) throw new Error("message")`
- `if (!condition) { throw new Error("message"); }`
- `if (!condition) throw new Error()`

The `Error` constructor must resolve to the unshadowed global binding. The
message must be omitted, a string literal, or a template literal with no
expressions. The guard must have no `else` branch, and its consequent must
contain only the throw statement.

### Detection boundaries

- ✅ Reports only negated-condition guards with an exact global `Error` throw.
- ✅ Offers a suggestion when the import, condition, static message, and source
  comments can be preserved safely.
- ❌ Never applies an automatic fix.
- ❌ Does not report computed messages because `assert(condition, message)`
  would evaluate them eagerly.
- ❌ Does not report `TypeError`, `AssertionError`, custom, shadowed, or
  qualified error constructors.
- ❌ Does not report branches with an `else`, additional statements, or
  non-throw consequents.

These boundaries intentionally favor false negatives over risky migrations.

## What this rule reports

Manual truthiness assertions whose runtime error type and message can be
represented by `ts-extras` without evaluating new user code on the success
path.

## Why this rule exists

`assert()` communicates the narrowing intent directly and uses TypeScript's
`asserts condition` signature. It replaces a repetitive control-flow pattern
with a standard assertion while retaining the same truthiness condition.

## ❌ Incorrect

```ts
if (!response.ok) {
 throw new Error("Expected a successful response");
}
```

## ✅ Correct

```ts
assert(response.ok, "Expected a successful response");
```

## Behavior and migration notes

This rule is suggestion-only. Even an otherwise exact migration changes the
origin of the `Error` stack to the helper implementation, so applying it should
remain an explicit developer choice.

For a bare `new Error()`, the suggestion uses an explicit empty message:

```ts
assert(condition, "");
```

That is intentional. `new Error()` has an empty message, whereas omitting the
second argument from `ts-extras` `assert()` produces `"Assertion failed"`.

If comments occur inside the guard, the rule reports the pattern without a
suggestion so it cannot silently delete context.

## Additional examples

### Computed message

```ts
if (!condition) {
 throw new Error(createMessage());
}
```

This is not reported. The original evaluates `createMessage()` only when the
condition is falsy; passing it to `assert()` would evaluate it on every call.

### Different error type

```ts
if (!condition) {
 throw new TypeError("Expected a valid value");
}
```

This is not reported because `assert()` throws `Error`, not `TypeError`.

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
 {
  plugins: { typefest },
  rules: {
   "typefest/prefer-ts-extras-assert": "error",
  },
 },
];
```

## When not to use it

Disable this rule if your project relies on custom assertion error classes,
computed or lazily constructed messages, or precise error stack provenance.

## Package documentation

ts-extras package documentation:

Source file: [`source/assert.ts`](https://github.com/sindresorhus/ts-extras/blob/main/source/assert.ts)

```ts
/**
 * Assert that the given condition is truthy.
 *
 * If the condition is falsy, an `Error` will be thrown. Because of the `asserts
 * condition` signature, TypeScript narrows types based on the asserted
 * condition.
 *
 * @category Type guard
 *
 * @param message - Custom error message to use instead of the default.
 */
```

> **Rule catalog ID:** R127

## Further reading

- [`ts-extras` README](https://github.com/sindresorhus/ts-extras)
- [`ts-extras` `assert` source](https://github.com/sindresorhus/ts-extras/blob/main/source/assert.ts)
- [TypeScript Handbook: Assertion functions](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#assertion-functions)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
