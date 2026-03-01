# prefer-type-fest-arrayable

Require TypeFest `Arrayable<T>` over `T | T[]` and `T | Array<T>` unions.

## Targeted pattern scope

This rule limits analysis to exact AST patterns and explicit syntactic boundaries:

- Direct `T | T[]` syntax in its canonical AST form.
- Direct `T | Array<T>` syntax in its canonical AST form.
- Alias indirection, wrapper helpers, and semantically similar variants are out of scope unless they preserve the same AST shape.

## What this rule reports

This rule reports every occurrence of the matched pattern(s) below:

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

### ❌ Incorrect — Additional example

```ts
type Input = number | Array<number>; // Union repeated inline across modules
```

### ✅ Correct — Additional example

```ts
type Input = Arrayable<number>;
```

### ✅ Correct — Repository-wide usage

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

## Package documentation

TypeFest package documentation:

Source file: [`source/arrayable.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/arrayable.d.ts)

````ts
/**
Create a type that represents either the value or an array of the value.

@see {@link Promisable}

@example
```
import type {Arrayable} from 'type-fest';

function bundle(input: string, output: Arrayable<string>) {
    const outputList = Array.isArray(output) ? output : [output];

    // …

    for (const output of outputList) {
        console.log(`write ${input} to: ${output}`);
    }
}

bundle('src/index.js', 'dist/index.js');
bundle('src/index.js', ['dist/index.cjs', 'dist/index.mjs']);
```

@category Array
*/
````

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
