# prefer-type-fest-abstract-constructor

Require TypeFest `AbstractConstructor` over explicit abstract constructor signatures.

## Targeted pattern scope

This rule reports explicit `abstract new (...args) => T` signatures and prefers `AbstractConstructor<T>` for abstract class constructor contracts.

### What it checks

- `abstract new (...args) => T` constructor type signatures.

### Detection boundaries

- ✅ Reports explicit abstract constructor signatures used directly in type positions.
- ❌ Does not auto-fix when generic parameter mapping is ambiguous.

## Why this rule exists

`AbstractConstructor<T>` gives one canonical representation for abstract constructable class contracts.

When teams mix explicit constructor signatures and helper aliases, higher-order APIs that accept class references become harder to standardize.

## ❌ Incorrect

```ts
type ExplicitAbstractCtor = abstract new (host: string, port: number) => Service;
```

## ✅ Correct

```ts
import type { AbstractConstructor } from "type-fest";

type ServiceAbstractCtor = AbstractConstructor<Service>;
```

## Behavior and migration notes

- `AbstractConstructor<T>` models class values that cannot be instantiated directly but can be subclassed.
- If your explicit signature encoded argument constraints, preserve them by adding a dedicated wrapper type.
- Prefer canonical alias usage in plugin/public APIs that accept abstract class constructors.

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
