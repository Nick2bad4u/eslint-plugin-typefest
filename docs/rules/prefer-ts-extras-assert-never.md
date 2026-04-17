# prefer-ts-extras-assert-never

Require [`assertNever`](https://github.com/sindresorhus/ts-extras/blob/main/source/assert-never.ts) from `ts-extras` over manual `const _: never = value` exhaustiveness checks.

## Targeted pattern scope

This rule only inspects single-declarator `const` statements where the declared identifier has a `never` type annotation.

- `const _exhaustiveCheck: never = value;`
- `const _: never = someExpression;`

Named function calls, `throw` statements, and other exhaustiveness patterns are not matched.

## What this rule reports

This rule reports `const` declarations where the declared identifier is explicitly annotated with `never`, indicating a manual exhaustiveness check that can be replaced with `assertNever`.

- Single-declarator `const` statements with a `never` type annotation.

## Why this rule exists

`assertNever(value)` is the canonical `ts-extras` utility for exhaustive-switch and discriminated-union coverage checks.

- It is an explicit, searchable name for exhaustiveness enforcement.
- It throws at runtime with a descriptive message if an unexpected value is encountered, unlike a silent `const _: never` declaration.
- Standardizing the pattern ensures consistent behavior across the codebase — the silent-assignment form compiles away and provides no runtime safety.

## ❌ Incorrect

```ts
const _exhaustiveCheck: never = fruit;
```

## ✅ Correct

```ts
import { assertNever } from "ts-extras";

assertNever(fruit);
```

## Behavior and migration notes

- `assertNever(value)` throws at runtime when called with a value. The manual `const _: never = value` pattern is a compile-time-only check that is silently removed after transpilation.
- Applying the suggestion changes runtime semantics: unreachable branches will throw instead of silently passing. Verify the code path is truly unreachable before applying.
- The rule provides a **suggestion** (not an autofix) because the runtime-behavior change must be reviewed manually.
- Multi-declarator `const` statements (e.g., `const _a: never = a, _b: never = b`) are intentionally excluded.

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-ts-extras-assert-never": "warn",
        },
    },
];
```

## When not to use it

Disable this rule if your codebase deliberately uses the `const _: never` pattern to avoid introducing runtime-throwing behavior in unreachable branches.

## Package documentation

ts-extras package documentation:

Source file: [`source/assert-never.ts`](https://github.com/sindresorhus/ts-extras/blob/main/source/assert-never.ts)

````ts
/**
Assert that the given value is `never`.

This is useful to ensure that a `switch` statement or `if`-`else` chain is exhaustive — meaning that all possible cases are handled.

An `assertNever` call is a compile-time type-check and will throw at runtime if the given value is not `never`.

@example
```
import {assertNever} from 'ts-extras';

type Fruit = 'apple' | 'banana' | 'cherry';

function isYellow(fruit: Fruit): boolean {
    switch (fruit) {
        case 'apple':
            return false;
        case 'banana':
            return true;
        case 'cherry':
            return false;
        default:
            assertNever(fruit);
    }
}
```

@category Type guard
*/
````

> **Rule catalog ID:** R100

## Further reading

- [`ts-extras` README](https://github.com/sindresorhus/ts-extras)
- [`ts-extras` package reference](https://www.npmjs.com/package/ts-extras)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
