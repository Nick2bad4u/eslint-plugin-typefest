# prefer-ts-extras-is-equal-type

Prefer [`isEqualType`](https://github.com/sindresorhus/ts-extras#isequaltype) from `ts-extras` over `IsEqual<T, U>` boolean assertion variables.

## Targeted assertion pattern

This rule targets one assertion pattern: `IsEqual<T, U>` variables initialized with literal `true`/`false`, and rewrites them to `isEqualType<T, U>()`.

The focus is narrow on assertion-style declarations so migration stays deterministic and avoids changing unrelated type aliases.

## What it checks

This rule intentionally targets a narrow assertion pattern:

- Variables typed as `IsEqual<T, U>` and initialized with boolean literals (`true`/`false`).
- Namespace-qualified `type-fest` forms such as `TypeFest.IsEqual<T, U>`.

### Detection boundaries

- ✅ Reports `const x: IsEqual<A, B> = true`.
- ✅ Reports namespace imports (`TypeFest.IsEqual<A, B>`).
- ❌ Does not report type aliases (`type X = IsEqual<A, B>`).
- ❌ Does not report variables initialized from expressions (`someCondition`) instead of boolean literals.

## Why

`isEqualType<T, U>()` expresses compile-time type equality checks for assertion-style code and avoids manual boolean literal scaffolding.

This makes test/fixture code easier to scan because type assertions look like
explicit calls instead of pseudo-runtime constants.

## ❌ Incorrect

```ts
import type { IsEqual } from "type-fest";

const typeCheck: IsEqual<Foo, Bar> = true;
```

## ✅ Correct

```ts
import { isEqualType } from "ts-extras";

const typeCheck = isEqualType<Foo, Bar>();
```

## Behavior and migration notes

- Reported declarations are compile-time assertions; they are not runtime equality checks.
- `isEqualType<T, U>()` keeps assertion intent while removing manual boolean literal scaffolding.
- Expression-initialized `IsEqual<T, U>` variables are intentionally out of scope for this rule.

## Additional examples

### ❌ Incorrect (additional scenario)

```ts
import type * as TypeFest from "type-fest";

const dtoMatchesModel: TypeFest.IsEqual<UserDto, UserModel> = true;
```

### ✅ Correct (additional scenario)

```ts
import { isEqualType } from "ts-extras";

const dtoMatchesModel = isEqualType<UserDto, UserModel>();
```

### ✅ Correct (team-scale usage)

```ts
const idsAreEqual = isEqualType<Id, string>();
const payloadsAreEqual = isEqualType<ApiPayload, InternalPayload>();
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-ts-extras-is-equal-type": "error",
        },
    },
];
```

## When not to use it

Disable this rule if your project prefers `type-fest` assertion types directly in declarations and does not want function-form assertion helpers.

## Further reading

- [`ts-extras` README](https://github.com/sindresorhus/ts-extras)
- [`ts-extras` package reference](https://www.npmjs.com/package/ts-extras)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
