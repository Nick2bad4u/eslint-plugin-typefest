# prefer-ts-extras-object-has-in

Require `objectHasIn()` from `ts-extras` over `Reflect.has()`.

## What it checks

- `Reflect.has(object, key)` calls.

## Why this rule exists

`objectHasIn()` provides stronger TypeScript narrowing for key-existence checks while preserving inherited-property semantics.

- Use this when inherited members should count as present.
- Reduces cast-heavy follow-up property access.
- Keeps prototype-aware checks consistent across modules.

## ❌ Incorrect

```ts
if (Reflect.has(record, key)) {
    console.log(record[key as keyof typeof record]);
}
```

## ✅ Correct

```ts
if (objectHasIn(record, key)) {
    console.log(record[key]);
}
```

## Behavior and migration notes

- Runtime semantics align with `Reflect.has` and `key in object` (prototype chain included).
- Prefer `objectHasOwn` if inherited members should be excluded.
- For security-sensitive payload validation, confirm that inherited properties are acceptable.

## Additional examples

### ❌ Incorrect (additional scenario)

```ts
if (Reflect.has(input, "name")) {
    console.log((input as { name: unknown }).name);
}
```

### ✅ Correct (additional scenario)

```ts
if (objectHasIn(input, "name")) {
    console.log(input.name);
}
```

### ✅ Correct (team-scale usage)

```ts
const canAccess = objectHasIn(candidate, key);
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-ts-extras-object-has-in": "error",
        },
    },
];
```

## When not to use it

Disable this rule if checks must be own-property-only, or if runtime helper dependencies are disallowed in your environment.

## Further reading

- [`ts-extras` README](https://github.com/sindresorhus/ts-extras)
- [`ts-extras` package reference](https://www.npmjs.com/package/ts-extras)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
