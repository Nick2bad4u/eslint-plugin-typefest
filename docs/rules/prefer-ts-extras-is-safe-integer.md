# prefer-ts-extras-is-safe-integer

Prefer [`isSafeInteger`](https://github.com/sindresorhus/ts-extras#issafeinteger) from `ts-extras` over `Number.isSafeInteger(...)`.

This keeps predicate usage consistent with other `ts-extras` narrowing helpers.

## ❌ Incorrect

```ts
const isSafe = Number.isSafeInteger(value);
```

## ✅ Correct

```ts
const isSafe = isSafeInteger(value);
```
