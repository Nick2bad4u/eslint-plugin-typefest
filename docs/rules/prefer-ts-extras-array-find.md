# prefer-ts-extras-array-find

Prefer [`arrayFind`](https://github.com/sindresorhus/ts-extras#arrayfind) from `ts-extras` over `array.find(...)`.

`arrayFind(...)` improves predicate inference and value narrowing in typed arrays.

## ❌ Incorrect

```ts
const monitor = monitors.find((entry) => entry.id === targetId);
```

## ✅ Correct

```ts
const monitor = arrayFind(monitors, (entry) => entry.id === targetId);
```
