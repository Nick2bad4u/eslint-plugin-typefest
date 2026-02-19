# prefer-type-fest-literal-union

Require TypeFest `LiteralUnion` over unions that mix primitive keywords with same-family literal members.

## Rule details

This rule targets patterns like `"foo" | "bar" | string` and `200 | 404 | number`.

Those unions are usually better expressed with `LiteralUnion`, which preserves literal IntelliSense while retaining primitive compatibility.

### What it checks

- String literal unions that also include `string`.
- Number literal unions that also include `number`.
- Boolean literal unions that also include `boolean`.
- Bigint literal unions that also include `bigint`.

## ❌ Incorrect

```ts
type Environment = "dev" | "prod" | string;
type HttpCode = 200 | 404 | number;
```

## ✅ Correct

```ts
import type { LiteralUnion } from "type-fest";

type Environment = LiteralUnion<"dev" | "prod", string>;
type HttpCode = LiteralUnion<200 | 404, number>;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-literal-union": "error",
        },
    },
];
```

## When not to use it

Disable this rule if your team prefers explicit primitive-plus-literal unions and does not want the additional abstraction.

## Further reading

- [TypeFest README](https://github.com/sindresorhus/type-fest)
- [TypeScript Handbook: Literal Types](https://www.typescriptlang.org/docs/handbook/literal-types.html)
