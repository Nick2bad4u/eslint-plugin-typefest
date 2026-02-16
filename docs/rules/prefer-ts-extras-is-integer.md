# prefer-ts-extras-is-integer

Prefer [`isInteger`](https://github.com/sindresorhus/ts-extras#isinteger) from `ts-extras` over `Number.isInteger(...)`.

This keeps predicate usage consistent with other `ts-extras` narrowing helpers.

## ❌ Incorrect

```ts
const isWhole = Number.isInteger(value);
```

## ✅ Correct

```ts
const isWhole = isInteger(value);
```
