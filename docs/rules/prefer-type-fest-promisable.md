# prefer-type-fest-promisable

Require TypeFest `Promisable<T>` for sync-or-async callback contracts currently expressed as `Promise<T> | T` unions.

## Targeted pattern scope

This rule focuses on a narrow, deterministic set of syntactic forms:

- Type unions shaped like `Promise<T> | T` in architecture-critical runtime layers.

These boundaries keep reporting and migration behavior deterministic.

## What this rule reports

- Type unions shaped like `Promise<T> | T` in architecture-critical runtime layers.

## Why this rule exists

`Promisable<T>` communicates intent directly, keeps callback contracts consistent, and avoids repeating equivalent sync-or-async unions throughout the codebase.

## ❌ Incorrect

```ts
type HookResult = Promise<Result> | Result;
```

## ✅ Correct

```ts
type HookResult = Promisable<Result>;
```

## Behavior and migration notes

- `Promisable<T>` captures sync-or-async return contracts in one reusable alias.
- It normalizes both `Promise<T> | T` and `T | Promise<T>` forms.
- Use this alias in hook/callback contracts where callers may return either immediate or async values.

## Additional examples

### ❌ Incorrect — Additional example

```ts
type MaybeAsync = Result | Promise<Result>;
```

### ✅ Correct — Additional example

```ts
type MaybeAsync = Promisable<Result>;
```

### ✅ Correct — Repository-wide usage

```ts
type HookOutput = Promisable<void>;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-promisable": "error",
        },
    },
];
```

## When not to use it

Disable this rule if runtime policy requires explicitly spelling out promise unions.

## Package documentation

TypeFest package documentation:

Source file: [`source/promisable.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/promisable.d.ts)

````ts
/**
Create a type that represents either the value or the value wrapped in `PromiseLike`.

Use-cases:
- A function accepts a callback that may either return a value synchronously or may return a promised value.
- This type could be the return type of `Promise#then()`, `Promise#catch()`, and `Promise#finally()` callbacks.

Please upvote [this issue](https://github.com/microsoft/TypeScript/issues/31394) if you want to have this type as a built-in in TypeScript.

@example
```
import type {Promisable} from 'type-fest';

async function logger(getLogEntry: () => Promisable<string>): Promise<void> {
    const entry = await getLogEntry();
    console.log(entry);
}

await logger(() => 'foo');
await logger(() => Promise.resolve('bar'));
```

@category Async
*/
````

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
