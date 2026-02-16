# prefer-ts-extras-object-from-entries

Prefer [`objectFromEntries`](https://github.com/sindresorhus/ts-extras#objectfromentries) from `ts-extras` over `Object.fromEntries(...)`.

`objectFromEntries(...)` preserves stronger key/value typing and avoids local casting after entry reconstruction.

## ❌ Incorrect

```ts
const statusById = Object.fromEntries(statusEntries);
```

## ✅ Correct

```ts
const statusById = objectFromEntries(statusEntries);
```
