# prefer-type-fest-arrayable

Require TypeFest `Arrayable<T>` over `T | T[]` and `T | Array<T>` unions.

## What this rule reports

- `T | T[]`
- `T | Array<T>`

## Why this rule exists

`Arrayable<T>` is clearer and more consistent than repeating union patterns. It also aligns code with TypeFest utility conventions used by other rules in this plugin.

## ❌ Incorrect

```ts
type Input = string | string[];
```

## ✅ Correct

```ts
type Input = Arrayable<string>;
```

## Behavior and migration notes

- `Arrayable<T>` is the canonical form for value-or-array contracts.
- It replaces both `T | T[]` and `T | Array<T>` spelling variants.
- Keep this alias in public callback and option signatures to reduce repeated union boilerplate.

## Additional examples

### ❌ Incorrect (additional scenario)

```ts
type Input = number | Array<number>; // Union repeated inline across modules
```

### ✅ Correct (additional scenario)

```ts
type Input = Arrayable<number>;
```

### ✅ Correct (team-scale usage)

```ts
type QueryParam = Arrayable<string>;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-arrayable": "error",
        },
    },
];
```

## When not to use it

Disable this rule if existing public type names must remain unchanged for compatibility.

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
