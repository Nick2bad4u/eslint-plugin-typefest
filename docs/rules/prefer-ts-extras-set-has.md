# prefer-ts-extras-set-has

Prefer [`setHas`](https://github.com/sindresorhus/ts-extras#sethas) from `ts-extras` over `set.has(...)`.

`setHas(...)` improves narrowing when checking membership in typed sets.

## ❌ Incorrect

```ts
const hasMonitor = monitorIds.has(candidateId);
```

## ✅ Correct

```ts
const hasMonitor = setHas(monitorIds, candidateId);
```
