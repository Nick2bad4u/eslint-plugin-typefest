# prefer-type-fest-abstract-constructor

Require TypeFest `AbstractConstructor` over explicit abstract constructor signatures.

## Rule details

This rule standardizes abstract constructor type modeling on TypeFest `AbstractConstructor`.

### What it checks

- `abstract new (...args) => T` constructor type signatures.

## ❌ Incorrect

```ts
type ExplicitAbstractCtor = abstract new (host: string, port: number) => Service;
```

## ✅ Correct

```ts
import type { AbstractConstructor } from "type-fest";

type ServiceAbstractCtor = AbstractConstructor<Service>;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-abstract-constructor": "error",
        },
    },
];
```

## When not to use it

Disable this rule if your codebase intentionally prefers explicit abstract constructor signatures over TypeFest aliases.

## Further reading

- [TypeFest README](https://github.com/sindresorhus/type-fest)
- [TypeScript Handbook: Classes](https://www.typescriptlang.org/docs/handbook/2/classes.html)
