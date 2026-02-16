# prefer-ts-extras-array-at

Prefer [`arrayAt`](https://github.com/sindresorhus/ts-extras#arrayat) from `ts-extras` over `array.at(...)`.

`arrayAt(...)` preserves stronger element typing for indexed array access.

## ❌ Incorrect

```ts
const firstStatus = statuses.at(0);
```

## ✅ Correct

```ts
const firstStatus = arrayAt(statuses, 0);
```
