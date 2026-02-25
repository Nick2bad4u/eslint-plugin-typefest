# prefer-type-fest-promisable

Require TypeFest `Promisable<T>` for sync-or-async callback contracts currently expressed as `Promise<T> | T` unions.

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

### ❌ Incorrect (additional scenario)

```ts
type MaybeAsync = Result | Promise<Result>;
```

### ✅ Correct (additional scenario)

```ts
type MaybeAsync = Promisable<Result>;
```

### ✅ Correct (team-scale usage)

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

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
