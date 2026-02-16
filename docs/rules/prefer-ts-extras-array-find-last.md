# prefer-ts-extras-array-find-last

Prefer [`arrayFindLast`](https://github.com/sindresorhus/ts-extras#arrayfindlast) from `ts-extras` over `array.findLast(...)`.

`arrayFindLast(...)` improves predicate inference and value narrowing in typed arrays.

## ❌ Incorrect

```ts
const monitor = monitors.findLast((entry) => entry.id === targetId);
```

## ✅ Correct

```ts
const monitor = arrayFindLast(monitors, (entry) => entry.id === targetId);
```
