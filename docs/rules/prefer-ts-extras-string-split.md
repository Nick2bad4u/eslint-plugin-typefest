# prefer-ts-extras-string-split

Prefer [`stringSplit`](https://github.com/sindresorhus/ts-extras#stringsplit) from `ts-extras` over `string.split(...)`.

`stringSplit(...)` can preserve stronger tuple-like inference for literal separators.

## ❌ Incorrect

```ts
const parts = monitorKey.split(":");
```

## ✅ Correct

```ts
const parts = stringSplit(monitorKey, ":");
```
