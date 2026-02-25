# prefer-type-fest-tagged-brands

Prefers TypeFest `Tagged` for branded primitive identifiers over ad-hoc `__brand`/`__tag` intersection patterns.

## Targeted pattern scope

This rule targets ad-hoc brand-marker intersections and legacy alias names used for branded primitives.

## What it checks

- Type aliases that use intersection branding with explicit brand-marker fields.
- Type references that resolve to imported `Opaque` / `Branded` aliases.
- Existing `Tagged` usage is ignored.

## Why

`Tagged` provides a standard, reusable branded-type approach that improves consistency and readability.

## ❌ Incorrect

```ts
type UserId = string & { readonly __brand: "UserId" };
```

## ✅ Correct

```ts
type UserId = Tagged<string, "UserId">;
```

## Behavior and migration notes

- `Tagged<Base, Tag>` standardizes branded identity types.
- This rule targets both structural brand fields (`__brand`, `__tag`) and legacy alias references (`Opaque`, `Branded`).
- Use canonical `Tagged` aliases for IDs and domain markers to keep branding semantics consistent across packages.

## Additional examples

### ❌ Incorrect (additional scenario)

```ts
type OrderId = string & { readonly __tag: "OrderId" };
```

### ✅ Correct (additional scenario)

```ts
type OrderId = Tagged<string, "OrderId">;
```

### ✅ Correct (team-scale usage)

```ts
type TenantId = Tagged<string, "TenantId">;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-tagged-brands": "error",
        },
    },
];
```

## When not to use it

Disable this rule if existing brand encodings must remain for backward compatibility.

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
