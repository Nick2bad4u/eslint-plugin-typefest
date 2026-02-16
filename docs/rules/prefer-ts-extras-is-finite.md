# prefer-ts-extras-is-finite

Prefer [`isFinite`](https://github.com/sindresorhus/ts-extras#isfinite) from `ts-extras` over `Number.isFinite(...)`.

This keeps predicate usage consistent with other `ts-extras` narrowing helpers.

## ❌ Incorrect

```ts
const isValid = Number.isFinite(value);
```

## ✅ Correct

```ts
const isValid = isFinite(value);
```
