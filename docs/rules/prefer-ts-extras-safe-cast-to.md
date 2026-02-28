# prefer-ts-extras-safe-cast-to

Prefer [`safeCastTo`](https://github.com/sindresorhus/ts-extras/blob/main/source/safe-cast-to.ts) from `ts-extras` over direct `as` assertions when the cast is already assignable.

## Targeted pattern scope

This rule focuses on a narrow, deterministic set of syntactic forms:

- Type assertions (`as T` and `<T>value`) that are already assignable and can use `safeCastTo<T>(value)`.
- `as` and angle-bracket (`<T>value`) assertions in runtime source files.
- Only assertions where the source expression type is assignable to the asserted target type.

These boundaries keep reporting and migration behavior deterministic.

## What this rule reports

- Type assertions (`as T` and `<T>value`) that are already assignable and can use `safeCastTo<T>(value)`.

### Matched patterns

- `as` and angle-bracket (`<T>value`) assertions in runtime source files.
- Only assertions where the source expression type is assignable to the asserted target type.

## Why this rule exists

`safeCastTo<T>(value)` keeps casts type-checked and prevents silently widening unsafe assertion patterns.

## ❌ Incorrect

```ts
const nameValue = "Alice" as string;
```

## ✅ Correct

```ts
const nameValue = safeCastTo<string>("Alice");
```

## Behavior and migration notes

- This rule only reports assertions where source type is assignable to target type.
- Unsafe/non-assignable assertion patterns are intentionally not rewritten by this rule.
- `safeCastTo` keeps the cast explicit while preserving assignability checks.

## Additional examples

### ❌ Incorrect — Additional example

```ts
const resourceId = rawId as string;
```

### ✅ Correct — Additional example

```ts
const resourceId = safeCastTo<string>(rawId);
```

### ✅ Correct — Repository-wide usage

```ts
const port = safeCastTo<number>(env.PORT);
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-ts-extras-safe-cast-to": "error",
        },
    },
];
```

## When not to use it

Disable this rule if your team forbids runtime casting helpers in favor of direct assertions.

## Package documentation

ts-extras package documentation:

Source file: [`source/safe-cast-to.ts`](https://github.com/sindresorhus/ts-extras/blob/main/source/safe-cast-to.ts)

````ts
/**
Constrain a value to the given type safely.

Unlike `as`, this refuses incompatible casts at compile time. Use it to _narrow_ or _shape_ values while preserving type safety.

@example
```
type Foo = {
    a: string;
    b?: number;
};

declare const possibleUndefined: Foo | undefined;

const foo = possibleUndefined ?? safeCastTo<Partial<Foo>>({});
console.log(foo.a ?? '', foo.b ?? 0);

const bar = possibleUndefined ?? {};
// @ts-expect-error
console.log(bar.a ?? '', bar.b ?? 0);
//             ^^^ Property 'a' does not exist on type '{}'.(2339)
//                          ^^^ Property 'b' does not exist on type '{}'.(2339)
```

@category General
*/
````

## Further reading

- [`ts-extras` README](https://github.com/sindresorhus/ts-extras)
- [`ts-extras` package reference](https://www.npmjs.com/package/ts-extras)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
