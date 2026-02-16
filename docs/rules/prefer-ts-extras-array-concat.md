# prefer-ts-extras-array-concat

Prefer [`arrayConcat`](https://github.com/sindresorhus/ts-extras#arrayconcat) from `ts-extras` over `array.concat(...)`.

`arrayConcat(...)` preserves stronger tuple and readonly-array typing across generic flows.

## ❌ Incorrect

```ts
const allIds = primaryIds.concat(secondaryIds);
```

## ✅ Correct

```ts
const allIds = arrayConcat(primaryIds, secondaryIds);
```
