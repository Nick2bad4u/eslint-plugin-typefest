# prefer-ts-extras-object-has-own

Require `objectHasOwn` from `ts-extras` over `Object.hasOwn` when checking own properties.

## What it checks

- Calls to `Object.hasOwn(...)` in runtime source files and typed rule fixtures.

## Why this rule exists

`objectHasOwn` is a type guard that narrows the object to include the checked property. This makes downstream access safer and reduces manual casts after own-property checks.

- Prefer this when you only want **own** properties.
- Avoids repetitive `(obj as { prop: ... }).prop` casts after checks.
- Makes guard intent explicit for reviewers.

## ❌ Incorrect

```ts
if (Object.hasOwn(record, key)) {
    console.log(record[key as keyof typeof record]);
}
```

## ✅ Correct

```ts
if (objectHasOwn(record, key)) {
    console.log(record[key]);
}
```

## Behavior and migration notes

- Runtime semantics align with `Object.hasOwn` (prototype chain is **not** considered).
- Useful for untrusted inputs where inherited members should not count.
- If your current code uses `Reflect.has` or `in`, confirm that own-only checks are acceptable before migration.

## Additional examples

### ❌ Incorrect (additional scenario)

```ts
if (Object.hasOwn(data, "id")) {
    console.log((data as { id: unknown }).id);
}
```

### ✅ Correct (additional scenario)

```ts
if (objectHasOwn(data, "id")) {
    console.log(data.id);
}
```

### ✅ Correct (team-scale usage)

```ts
const isOwn = objectHasOwn(record, field);
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-ts-extras-object-has-own": "error",
        },
    },
];
```

## When not to use it

Disable this rule if you intentionally rely on prototype-chain checks (`in`/`Reflect.has`) or if runtime helper dependencies are disallowed in your environment.

## Further reading

- [`ts-extras` README](https://github.com/sindresorhus/ts-extras)
- [`ts-extras` package reference](https://www.npmjs.com/package/ts-extras)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
