# prefer-ts-extras-object-keys

Prefer [`objectKeys`](https://github.com/sindresorhus/ts-extras#objectkeys) from `ts-extras` over `Object.keys(...)`.

`objectKeys(...)` preserves stronger key typing and avoids repeated casts in iteration paths.

## ❌ Incorrect

```ts
const keys = Object.keys(monitorConfig);
```

## ✅ Correct

```ts
const keys = objectKeys(monitorConfig);
```
