# prefer-type-fest-constructor

Require TypeFest `Constructor` over explicit constructor signatures.

## Rule details

This rule standardizes constructor type modeling on TypeFest `Constructor`.

### What it checks

- `new (...args) => T` constructor type signatures.

## ❌ Incorrect

```ts
type ExplicitCtor = new (host: string, port: number) => Service;
```

## ✅ Correct

```ts
import type { Constructor } from "type-fest";

type ServiceCtor = Constructor<Service>;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-constructor": "error",
        },
    },
];
```

## When not to use it

Disable this rule if your codebase intentionally prefers explicit constructor signatures over TypeFest aliases.

## Further reading

- [TypeFest README](https://github.com/sindresorhus/type-fest)
- [TypeScript Handbook: Classes](https://www.typescriptlang.org/docs/handbook/2/classes.html)
