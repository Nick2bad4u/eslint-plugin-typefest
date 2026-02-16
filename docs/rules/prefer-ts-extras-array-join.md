# prefer-ts-extras-array-join

Prefer [`arrayJoin`](https://github.com/sindresorhus/ts-extras#arrayjoin) from `ts-extras` over `array.join(...)`.

`arrayJoin(...)` can preserve stronger tuple-aware typing when joining array values.

## ❌ Incorrect

```ts
const key = segments.join(":");
```

## ✅ Correct

```ts
const key = arrayJoin(segments, ":");
```
