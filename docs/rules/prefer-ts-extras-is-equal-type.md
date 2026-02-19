# prefer-ts-extras-is-equal-type

Prefer [`isEqualType`](https://github.com/sindresorhus/ts-extras#isequaltype) from `ts-extras` over `IsEqual<T, U>` boolean assertion variables.

## Rule details

This rule aligns your runtime code with `ts-extras`, which describes these helpers as strongly-typed alternatives to native operations and predicates.

It targets one specific assertion style and replaces it with a clearer,
function-shaped form.

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

## Upstream terminology and benefits

`ts-extras` describes itself as **"Essential utilities for TypeScript projects"**.

Unlike `type-fest` (types only), `ts-extras` functions run at runtime and are compiled into JavaScript.

For this rule, the canonical helper is **`isEqualType`**: `isEqualType` checks if two types are equal at compile time.

Using one canonical helper across the codebase reduces custom one-off checks and improves readability for code reviewers.

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

## Why this helps in real projects

- **Consistent runtime behavior:** one helper per operation keeps assertions, guards, and collection checks aligned.
- **Better narrowing signals:** reviewers and maintainers can recognize established `ts-extras` guard semantics immediately.
- **Lower maintenance risk:** replacing ad-hoc utility variants with canonical helpers reduces drift across services and packages.

## Adoption tips

1. Start with the most common call sites in hot paths and shared utilities.
2. Replace repetitive inline predicates/checks with the canonical helper shown in this doc.
3. Re-run tests after adoption to confirm behavior and narrowing expectations.
4. If your team has wrapper utilities, align wrappers to call the canonical helper or deprecate duplicates.

### Rollout strategy

- Enable this rule in warning mode first to estimate rollout size.
- Apply fixes in small batches (per package or folder) to keep reviews readable.
- Switch to error mode after the baseline is cleaned up.

## Rule behavior and fixes

- Reports boolean-literal variable assertions typed as `IsEqual<T, U>`.
- Provides **suggestions** (not autofix) that replace the declarator with `name = isEqualType<T, U>()`.
- Import management is manual: ensure `isEqualType` is imported from `ts-extras` and remove unused `IsEqual` imports.

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

For broader adoption, you can also start from `typefest.configs.strict`
or `typefest.configs.all` and then override this rule as needed.

## Frequently asked questions

### Why not keep native checks/methods everywhere?

This plugin favors `ts-extras` because it provides strongly-typed runtime helpers with consistent naming. That consistency improves readability and reduces repeated custom guard logic across modules.

### Does this change runtime output?

`ts-extras` helpers are runtime functions, so they are emitted in JavaScript. The goal of this rule is not to remove runtime behavior, but to standardize and strengthen it.

In this specific case, the call is primarily used for type assertion style and
code readability in typed test/verification paths.

## When not to use it

You may disable this rule if your project intentionally avoids runtime helper dependencies, or if you are writing interop code where the native built-in form is required.

## Further reading

- [`ts-extras` README](https://github.com/sindresorhus/ts-extras)
- [`ts-extras` package reference](https://www.npmjs.com/package/ts-extras)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

