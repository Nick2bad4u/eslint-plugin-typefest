# prefer-type-fest-writable

Require TypeFest `Writable` over manual mapped types that remove `readonly` with `-readonly`, and over imported aliases like `Mutable`.

## Targeted pattern scope

This rule targets manual readonly-removal mapped types and legacy mutability alias names.

## What it checks

- `{-readonly [K in keyof T]: T[K]}`
- Type references that resolve to imported `Mutable` aliases.

## Why

`Writable<T>` is a standard TypeFest utility for expressing “mutable version of T” and avoids repeating a verbose mapped type pattern.

## ❌ Incorrect

```ts
type Mutable<T> = {
    -readonly [K in keyof T]: T[K];
};
```

## ✅ Correct

```ts
type MutableUser = Writable<User>;
```

## Behavior and migration notes

- `Writable<T>` is the canonical mutable-view utility in this plugin's type-fest conventions.
- This rule targets both structural mapped types (`-readonly`) and alias references (`Mutable`).
- Keep mapped-type definitions only when they intentionally differ from simple readonly removal.

## Additional examples

### ❌ Incorrect (additional scenario)

```ts
type Mutable<T> = { -readonly [K in keyof T]: T[K] };
```

### ✅ Correct (additional scenario)

```ts
type Mutable<T> = Writable<T>;
```

### ✅ Correct (team-scale usage)

```ts
type EditableOrder = Writable<ReadonlyOrder>;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-writable": "error",
        },
    },
];
```

## When not to use it

Disable this rule if existing mapped-type aliases are required by public contracts.

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
