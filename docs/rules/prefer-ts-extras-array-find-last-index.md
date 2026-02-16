# prefer-ts-extras-array-find-last-index

Prefer [`arrayFindLastIndex`](https://github.com/sindresorhus/ts-extras#arrayfindlastindex) from `ts-extras` over `array.findLastIndex(...)`.

`arrayFindLastIndex(...)` improves predicate inference in typed arrays.

## ❌ Incorrect

```ts
const index = monitors.findLastIndex((entry) => entry.id === targetId);
```

## ✅ Correct

```ts
const index = arrayFindLastIndex(monitors, (entry) => entry.id === targetId);
```
